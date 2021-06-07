<template>
  <div class="w-full flex items-center justify-center flex-wrap py-1">
    <label>
      <input v-model="isAllSelected" type="checkbox" @click="selectAll">
      <span class="p-1 align-middle">All</span>
      <span class="badge" :style="badgeColor(-1)">
        {{ todoCounts(-1) }}
      </span>
    </label>
    <label v-for="viewOp in options" :key="viewOp.value">
      <input v-model="filterOption" class="ml-2" type="checkbox" :value="viewOp.value" @change="filterChanged">
      <span class="p-1 align-middle">{{ viewOp.label }}</span>
      <span class="badge" :style="badgeColor(viewOp.value)">
        {{ todoCounts(viewOp.value) }}
      </span>
    </label>
    <button
      v-if="showMenu"
      class="btn btn-outline btn-clear-done ml-2"
      ontouchend=""
      @click="deleteDone"
    >
      Clear Done
    </button>
    <button
      v-if="showMenu"
      class="btn btn-outline btn-switch-edit ml-2"
      :class="{'switch-on': canRemove}"
      ontouchend=""
      @click="switchRemoveButton"
    >
      Edit
    </button>
    <button
      v-if="showMenu"
      class="btn btn-regular ml-2"
      ontouchend=""
      @click="openListDialog"
    >
      詳細
    </button>
    <nuxt-link v-if="showMenu" to="calendar">
      <fa :icon="['fas', 'calendar-day']" size="lg" class="cursor-pointer ml-2 text-gray-600" ontouchend="" />
    </nuxt-link>
  </div>
</template>

<script>
import Vue from 'vue'
import NewListDialog from '@/components/NewListDialog'
import { TaskState } from '@/util/TaskState'
import { getStateColor } from '@/util/StateColor'

const DialogController = Vue.extend(NewListDialog)

export default {
  name: 'HeaderView',
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
    canRemove () {
      return this.$store.getters['Todo/canRemove']
    },
    filterOption: {
      get () {
        return this.$store.getters['Todo/getSelectedState']
      },
      set (value) {
        this.$store.dispatch('Todo/changeFilter', value)
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
      this.$store.dispatch('Todo/deleteDone')
    },
    switchRemoveButton () {
      this.$store.dispatch('Todo/switchEdit')
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
      })
      this.dialog.$mount()
    }
  }
}
</script>

<style scoped>
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

.btn-switch-edit {
  @apply text-green-500 border border-green-500 outline-none;
}

.btn-switch-edit:active {
  @apply bg-green-500 text-white border-transparent;
}

.switch-on {
  @apply bg-green-500 text-white border-transparent;
}

.btn-clear-done {
  @apply text-red-500 border border-red-500 outline-none;
}

.btn-clear-done:active {
  @apply bg-red-500 text-white border-transparent;
}
</style>
