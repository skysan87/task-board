<template>
  <div class="flex overflow-hidden">
    <div class="w-full">
      <form @submit.prevent="doAdd">
        <input
          v-model="todo.title"
          type="text"
          class="input-text appearance-none outline-none"
          placeholder="Add New Task..."
        >
      </form>
      <div class="mt-1 flex flex-row items-center text-white">
        <div class="flex-none block">
          <span class="px-2 font-bold">期限</span>
        </div>
        <div class="flex-1 flex flex-row">
          <label v-for="dl in deadlines" :key="dl.value" class="ml-2 flex items-center">
            <input v-model="checkedDeadline" type="radio" name="deadline" :value="dl.value">
            <span class="ml-2">{{ dl.label }}</span>
          </label>
        </div>
        <div class="flex-none inline-block">
          <button class="btn btn-outline focus:outline-none" @click.left="addDetail">
            詳細
          </button>
          <button class="btn btn-regular focus:outline-none" @click.left="doAdd">
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import isEmpty from 'lodash/isEmpty'
import ModalDialog from '@/components/ModalDialog.vue'
import { Todo } from '@/model/Todo'
import { dateFactory } from '@/util/DateFactory'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'InputTask',
  data () {
    return {
      todo: new Todo('', {}),
      dialog: null,
      checkedDeadline: 'later',
      deadlines: [
        { label: '今日', value: 'today' },
        { label: '明日', value: 'tomorrow' },
        { label: 'あとで', value: 'later' }
      ]
    }
  },
  methods: {
    /**
     * todoを追加する
     */
    // eslint-disable-next-line
    doAdd () {
      if (isEmpty(this.todo.title)) {
        return
      }
      this.todo.startdate = this.todo.enddate = this.checkDeadline()
      this.$store.dispatch('Todo/add', this.todo.getData())
        .catch((error) => {
          console.error(error)
          this.$toast.error('登録に失敗しました')
        })
        .finally(() => {
          this.todo.title = ''
        })
    },
    addDetail () {
      this.todo.startdate = this.todo.enddate = this.checkDeadline()
      this.todo.listId = this.$store.getters['Todo/getCurrentListId']
      const list = this.$store.getters['Todolist/getLists']

      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: this.todo,
          isCreateMode: true,
          projectList: list
        }
      })
      this.dialog.$on('add', (todo) => {
        this.$store.dispatch('Todo/add', todo.getData())
          .catch((error) => {
            console.error(error)
            this.$toast.error('登録に失敗しました')
          })
          .finally(() => {
            this.todo.title = ''
          })
      })
      this.dialog.$mount()
    },
    checkDeadline () {
      let deadline = null
      switch (this.checkedDeadline) {
        case 'today':
          deadline = dateFactory().getDateNumber()
          break
        case 'tomorrow':
          deadline = dateFactory().addDay(1).getDateNumber()
          break
        default:
          deadline = null
          break
      }
      return deadline
    }
  }
}
</script>
