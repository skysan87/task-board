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
        return this.$store.getters['todo/getFilteredTodos']
      }
    }
  },
  mounted () {
    // 一括で取得する
    this.$store.dispatch('todo/initTodaylist')
  },
  methods: {
    /**
     * コメント編集
     */
    editTodo (id) {
      delete this.dialog

      const todo = this.$store.getters['todo/getTodoById'](id)
      const list = this.$store.getters['todolist/getLists']

      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todo,
          isCreateMode: false,
          projectList: list
        }
      })
      this.dialog.$on('update', (todo) => {
        this.$store.dispatch('todo/update', todo)
      })
      this.dialog.$on('delete', (todoId) => {
        this.$store.dispatch('todo/delete', todoId)
      })
      this.dialog.$mount()
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
