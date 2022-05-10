<template>
  <div class="w-full flex items-center justify-center flex-wrap py-1">
    <label class="flex items-center">
      <input v-model="isAllSelected" type="checkbox" @click="selectAll">
      <span class="ml-1">All</span>
      <span class="ml-1 badge" :style="badgeColor(-1)">
        {{ todoCounts(-1) }}
      </span>
    </label>
    <label v-for="viewOp in options" :key="viewOp.value" class="ml-2 flex items-center">
      <input v-model="filterOption" type="checkbox" :value="viewOp.value" @change="filterChanged">
      <span class="ml-1">{{ viewOp.label }}</span>
      <span class="ml-1 badge" :style="badgeColor(viewOp.value)">
        {{ todoCounts(viewOp.value) }}
      </span>
    </label>
    <button
      v-if="showMenu"
      class="btn btn-regular ml-2"
      ontouchend=""
      title="プロジェクトの詳細を表示する"
      @click="openListDialog"
    >
      詳細
    </button>
    <dropdown-menu v-if="showMenu" class="ml-2 dropdown-menu">
      <template #activator="{ open }">
        <button class="btn btn-outline" @click="open">
          メニュー
        </button>
      </template>
      <template #content="{ close }">
        <ul>
          <li v-if="showMenu">
            <p @click.left="deleteDone(), close()">
              <span class="icon">
                <fa
                  :icon="['fas', 'trash-can']"
                  class="text-gray-600"
                />
              </span>
              <span class="ml-2">完了済みのタスクを削除</span>
            </p>
          </li>
          <li v-if="showMenu">
            <p @click.left="switchRemoveButton(), close()">
              <span class="icon">
                <fa
                  :icon="['fas', 'edit']"
                  class="text-gray-600"
                />
              </span>
              <span class="ml-2">編集モード: {{ edieMode ? 'OFF' : 'ON' }}</span>
            </p>
          </li>
          <li v-if="showMenu">
            <p>
              <nuxt-link to="calendar">
                <span class="icon">
                  <fa
                    :icon="['fas', 'calendar-day']"
                    class="text-gray-600"
                  />
                </span>
                <span class="ml-2">カレンダー表示</span>
              </nuxt-link>
            </p>
          </li>
        </ul>
      </template>
    </dropdown-menu>
  </div>
</template>

<script>
import Vue from 'vue'
import NewListDialog from '@/components/NewListDialog'
import DropdownMenu from '@/components/DropdownMenu.vue'
import { TaskState } from '@/util/TaskState'
import { getStateColor } from '@/util/StateColor'

const DialogController = Vue.extend(NewListDialog)

export default {
  name: 'HeaderView',

  components: {
    DropdownMenu
  },

  props: {
    showMenu: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      options: Object.values(TaskState),
      isAllSelected: false
    }
  },
  computed: {
    edieMode () {
      return this.$store.getters['Todo/editMode']
    },
    filterOption: {
      get () {
        return this.$store.getters['Todo/getSelectedState']
      },
      set (value) {
        this.$store.dispatch('Todo/changeFilter', value)
          .catch((error) => {
            console.error(error)
            this.$toast.error(error.message)
          })
      }
    }
  },
  methods: {
    /**
     * 各ステータスのタスク数
     */
    todoCounts (state) {
      return this.$store.getters['Todo/getTaskCount'](state)
    },
    /**
     * ステータスの色
     */
    badgeColor (state) {
      return getStateColor(state)
    },
    /**
     * すべて表示
     */
    selectAll () {
      // イベント発生時,値は更新されていない
      if (this.isAllSelected === false) {
        this.filterOption = this.options.map(op => op.value)
      } else {
        this.filterOption = []
      }
    },
    filterChanged () {
      this.isAllSelected = this.options.length === this.filterOption.length
    },
    /**
     * 完了済みのタスクを削除
     */
    deleteDone () {
      if (confirm('完了済みのタスクを削除しますか？')) {
        this.$store.dispatch('Todo/deleteDone')
          .catch((error) => {
            console.error(error)
            this.$toast.error('削除に失敗しました')
          })
      }
    },
    switchRemoveButton () {
      this.$store.dispatch('Todo/switchEdit')
        .catch((error) => {
          console.error(error)
          this.$toast.error(error.message)
        })
    },
    openListDialog () {
      const listId = this.$store.getters['Todo/getCurrentListId']
      const todolist = this.$store.getters['Todolist/getListById'](listId)

      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todolist,
          isCreateMode: true // 削除ボタンを表示しない
        }
      })
      this.dialog.$on('add', (todolist) => {
        this.$store.dispatch('Todolist/update', todolist)
          .catch((error) => {
            console.error(error)
            this.$toast.error('更新に失敗しました')
          })
      })
      this.dialog.$mount()
    }
  }
}
</script>

<style lang="scss" scoped>
.input-form {
  display: flex;
  width: 100%;
  padding: 15px 15px 5px 15px;
  max-width: 720px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  padding: 2px 5px;
  text-align: center;
  border-radius: .25rem;
  vertical-align: baseline;
  font-size: 75%;
  white-space: nowrap;
  font-weight: bold;
}

.dropdown-menu {
  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
    line-height: 1;
    padding: 5px 5px;
    cursor: pointer;

    &:hover {
      @apply bg-gray-200;
    }
  }

  p {
    color: rgb(66, 66, 66);
    text-decoration: none;
    font-size: 1.2rem;
  }

  .icon {
    display: inline-block;
    width: 1rem;
  }
}
</style>
