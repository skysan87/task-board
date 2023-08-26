<template>
  <div class="flex flex-col bg-white h-full">
    <header class="flex-none">
      <header-view class="border-b" />
      <div v-if="editMode" class="w-full flex items-center justify-center flex-wrap p-1 border-b">
        <fa
          class="mx-0.5 cursor-pointer"
          :icon="['fas', 'circle-info']"
          @click="showInfo"
        />
        <span class="mx-0.5">編集モード:</span>
        <div class="mx-0.5 flex items-center">
          <v-date-picker
            is-range
            class="flex-1"
            :value="null"
            :attributes="[{
              key: 'today',
              dot: 'blue',
              dates: [new Date()]
            }]"
            @input="setDeadline"
          >
            <template #default="{ togglePopover }">
              <button class="btn-sm btn-outline block" @click="togglePopover">
                期限の設定
              </button>
            </template>
          </v-date-picker>
        </div>
        <button class="btn-sm btn-outline mx-0.5" @click="deleteSelected">
          一括削除
        </button>
        <button class="btn-sm btn-outline mx-0.5" @click="showModal">
          プロジェクト移動
        </button>
        <dialog ref="projectModal" class="dialog">
          <div class="flex flex-col">
            <label v-for="list in projectList" :key="list.id" :value="list.id" class="flex items-center">
              <input v-model="selectedListId" type="radio" :value="list.id">
              <span class="ml-2">{{ list.title }}</span>
            </label>
          </div>
          <div class="py-1 flex flex-row-reverse">
            <button class="btn btn-regular mx-0.5" @click="changeTodolist">
              移動
            </button>
            <button class="btn btn-red-outline mx-0.5" @click="() => $refs.projectModal.close()">
              キャンセル
            </button>
          </div>
        </dialog>
        <button class="btn-sm btn-regular mx-0.5" @click="cancelEditMode">
          キャンセル
        </button>
      </div>
    </header>
    <main class="pt-2 pb-4 flex-1 overflow-y-scroll">
      <div v-if="filteredTodos.length > 0" class="mx-2 overflow-x-hidden flex-grow">
        <div class="list-group">
          <draggable
            v-model="filteredTodos"
            handle=".move-icon"
            @end="onDragEnd"
          >
            <todo-item
              v-for="item in filteredTodos"
              :key="item.id"
              :todo="item"
              :option="{showPointer: editMode, showEdit: editMode}"
              :is-checked="selectedIds.includes(item.id)"
              class="list-group-item list-style"
              @edit="editTodo"
              @select="handleSelect"
              @check="handleCheck"
            />
          </draggable>
        </div>
      </div>
      <no-data v-else />
    </main>
    <footer class="px-2 py-2 bg-gray-500 flex-none">
      <input-task />
    </footer>
  </div>
</template>

<script>
import Vue from 'vue'
import draggable from 'vuedraggable'
import HeaderView from '@/components/HeaderView.vue'
import TodoItem from '@/components/TodoItem.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import InputTask from '@/components/InputTask.vue'
import NoData from '@/components/NoData.vue'
import { Todo } from '@/model/Todo'
import { dateFactory } from '@/util/DateFactory'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'TodoList',
  components: {
    draggable,
    TodoItem,
    HeaderView,
    InputTask,
    NoData
  },
  layout: 'board',
  data () {
    return {
      dialog: null,
      selectedIds: [],
      selectedListId: null
    }
  },
  computed: {
    filteredTodos: {
      get () {
        return this.$store.getters['Todo/getFilteredTodos']
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    },
    editMode: {
      get () {
        return this.$store.getters['Todo/editMode']
      }
    },
    projectList: {
      get () {
        return this.$store.getters['Todolist/getLists']
      }
    },
    listId: {
      get () {
        return this.$store.getters['Todo/getCurrentListId']
      }
    }
  },
  watch: {
    editMode (n, _) {
      // 編集モード終了時に選択を解除する
      if (n === false) {
        this.selectedIds = []
      }
    }
  },
  mounted () {
    this.$store.dispatch('Todo/init', this.$route.params.id)
      .catch((error) => {
        console.error(error)
        this.$toast.error('初期化に失敗しました')
      })
  },
  methods: {
    /**
     * コメント編集
     */
    editTodo (id) {
      delete this.dialog

      const todo = this.$store.getters['Todo/getTodoById'](id)
      const list = this.$store.getters['Todolist/getLists']

      if (todo.type === Todo.TYPE.HABIT) {
        const habit = this.$store.getters['Habit/getById'](todo.listId)
        if (!habit) {
          console.error('対象の習慣はすでに削除されています')
          this.$toast.error('更新できません')
          return
        }
      }

      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todo,
          isCreateMode: false,
          projectList: list
        }
      })
      this.dialog.$on('update', (todo) => {
        this.$store.dispatch('Todo/update', todo)
          .then(() => {
            this.$toast.success('更新しました')
          })
          .catch((error) => {
            console.error(error)
            this.$toast.error('更新に失敗しました')
          })
      })
      this.dialog.$on('delete', (todoId) => {
        this.$store.dispatch('Todo/delete', todoId)
          .catch((error) => {
            console.error(error)
            this.$toast.error('削除に失敗しました')
          })
      })
      this.dialog.$mount()
    },
    /**
     * ドラッグ終了時
     */
    onDragEnd (ev) {
      if (!this.editMode) {
        return
      }
      // filteredTodosはすでに並び替えられている
      if (ev.oldIndex === ev.newIndex) {
        return
      }
      const params = {
        oldIndex: ev.oldIndex,
        newIndex: ev.newIndex
      }
      this.$store.dispatch('Todo/changeOrder', params)
        .catch((error) => {
          console.error(error)
          this.$toast.error(error.message)
        })
    },

    handleSelect (todoId) {
      this.$store.dispatch('Todo/select', todoId)
    },

    handleCheck (todoId) {
      if (this.editMode) {
        const index = this.selectedIds.findIndex(id => id === todoId)
        if (index >= 0) {
          this.selectedIds.splice(index, 1)
        } else {
          this.selectedIds.push(todoId)
        }
      }
    },

    setDeadline (targetDate) {
      if (!this.editMode) {
        return
      }

      if (targetDate !== null &&
        this.selectedIds.length > 0 &&
        confirm('期限を設定しますか？')
      ) {
        const startDateNum = dateFactory(targetDate.start).getDateNumber()
        const endDateNum = dateFactory(targetDate.end).getDateNumber()
        const targets = this.filteredTodos
          .filter(t => this.selectedIds.includes(t.id))
          .map((t) => {
            return {
              id: t.id,
              startdate: startDateNum,
              enddate: endDateNum
            }
          })
        this.$store.dispatch('Todo/setDeadline', targets)
          .then(() => this.$toast.success('更新しました'))
          .catch((error) => {
            console.error(error)
            this.$toast.error('更新に失敗しました')
          })
      }
    },

    deleteSelected () {
      if (!this.editMode) {
        return
      }
      if (this.selectedIds.length > 0 && confirm('削除しますか？')) {
        this.$store.dispatch('Todo/deleteTodos', this.selectedIds)
          .then(() => {
            this.selectedIds = []
            this.$toast.success('削除しました')
          })
          .catch((error) => {
            console.error(error)
            this.$toast.error(error.message)
          })
      }
    },
    cancelEditMode () {
      // 編集モードを終了
      this.$store.dispatch('Todo/switchEdit')
        .catch((error) => {
          console.error(error)
          this.$toast.error(error.message)
        })
    },
    showInfo () {
      alert('選択した項目を一括操作します')
    },
    showModal () {
      this.selectedListId = this.listId
      this.$refs.projectModal.showModal()
    },
    changeTodolist () {
      if (this.selectedListId === this.listId) {
        return
      }

      const targets = this.filteredTodos
        .filter(t => this.selectedIds.includes(t.id))
        .map((t) => {
          return {
            id: t.id,
            listId: this.selectedListId
          }
        })

      this.$store.dispatch('Todo/changeListId', targets)
        .catch((error) => {
          console.error(error)
          this.$toast.error(error.message)
        })
        .finally(() => {
          this.$refs.projectModal.close()
        })
    }
  }
}
</script>

<style scoped>
.list-style {
  padding: 0.25rem 0.5rem;
  background-color: #faf9f9;
}

.list-group {
  padding: 0;
}

.list-group-item:first-child {
  border-top: 1px solid #979797;
}

.list-group-item {
  border-left: 1px solid #979797;
  border-right: 1px solid #979797;
  border-bottom: 1px solid #979797;
}

/* ドラッグするアイテム */
.sortable-chosen {
  opacity: 0.3;
}

.sortable-ghost {
  background-color: #979797;
}

/* ステータスラベル */
.status-label {
  margin: 0 5px;
}

.dialog {
  margin: 5vh auto 10vh;
}
.dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
