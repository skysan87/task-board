<template>
  <div class="flex flex-col bg-white h-full">
    <header class="border-b flex-none">
      <header-view :show-menu="false" />
    </header>
    <main class="pt-2 pb-4 flex-1 overflow-y-scroll">
      <div v-if="filteredTodos.length > 0" class="mx-2 overflow-x-hidden">
        <div class="list-group">
          <todo-item
            v-for="item in filteredTodos"
            :key="item.id"
            :todo="item"
            :option="{showPointer: false, showEdit: false}"
            class="list-group-item list-style"
            @edit="editTodo"
            @select="handleSelect"
          />
        </div>
      </div>
      <no-data v-else />
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import HeaderView from '@/components/HeaderView.vue'
import TodoItem from '@/components/TodoItem.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import NoData from '@/components/NoData.vue'
import { Todo } from '@/model/Todo'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'TodoList',
  components: {
    TodoItem,
    HeaderView,
    NoData
  },
  layout: 'board',
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    filteredTodos: {
      get () {
        return this.$store.getters['Todo/getFilteredTodos']
      }
    }
  },
  mounted () {
    // 一括で取得する
    this.$store.dispatch('Todo/initTodaylist')
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

    handleSelect (todoId) {
      this.$store.dispatch('Todo/select', todoId)
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

/* ステータスラベル */
.status-label {
  margin: 0 5px;
}
</style>
