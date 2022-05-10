<template>
  <div v-if="todo !== null" class="p-2">
    <div>
      <button class="btn-sm btn-outline" @click="close">閉じる</button>
    </div>

    <div class="mt-4">
      <label class="input-label">ステータス</label>
      <div class="flex justify-evenly flex-wrap">
        <label v-for="viewOp in options" :key="viewOp.value" class="flex items-center">
          <input v-model="todo.state" type="radio" :value="viewOp.value" disabled>
          <span class="ml-2">{{ viewOp.label }}</span>
        </label>
      </div>
    </div>

    <div v-if="todo.type === 'todo'" class="mt-4">
      <label class="input-label">プロジェクト</label>
      <div>
        <span class="input-text">{{ getProjectTitle(todo) }}</span>
      </div>
    </div>

    <div class="mt-4">
      <label class="input-label">タイトル</label>
      <div>
        <span class="input-text break-all">{{ todo.title }}</span>
      </div>
    </div>

    <expand-panel class="mt-4" right>
      <template #title>
        <label class="input-label">説明</label>
      </template>
      <template #component>
        <span class="input-text whitespace-pre-wrap break-all">{{ todo.detail }}</span>
      </template>
    </expand-panel>

    <div v-if="hasDeadline" class="mt-4">
      <label class="input-label">期限</label>
      <div class="flex flex-wrap justify-between items-center border py-1 px-2 bg-gray-200">
        <span class="block">{{ dtFormat(todo.startdate) }}</span>
        <svg
          class="w-10 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
        <span class="block">{{ dtFormat(todo.enddate) }}</span>
      </div>
    </div>

    <div class="mt-4">
      <label class="input-label">チェックリスト ({{ todo.subTasks.length }})</label>
      <div
        v-for="subtask in todo.subTasks"
        :key="subtask.id"
        class="flex items-center"
      >
        <label class="flex items-center">
          <input
            disabled
            :checked="subtask.isDone"
            type="checkbox"
            class="pl-1 flex-none"
          >
          <span class="break-all text-left px-1 flex-1">{{ subtask.title }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { TaskState } from '@/util/TaskState'
import { dateFactory } from '@/util/DateFactory'
import ExpandPanel from '@/components/parts/ExpandPanel.vue'

export default {
  name: 'TodoDetail',

  components: {
    ExpandPanel
  },

  data () {
    return {
      options: Object.values(TaskState),
      projects: this.$store.getters['Todolist/getLists']
    }
  },

  computed: {
    todo () {
      return this.$store.getters['Todo/selectedItem']
    },

    projectTitle () {
      if (!this.todo) {
        return ''
      }
      const project = this.projects.find(v => v === this.todo.listId)
      return !project ? '' : project.title
    },

    hasDeadline () {
      return this.todo.startdate && this.todo.enddate
    }
  },

  methods: {
    getProjectTitle (todo) {
      const listId = !todo ? '' : todo.listId
      const project = this.projects.find(v => v.id === listId)
      return !project ? '' : project.title
    },

    close () {
      this.$store.dispatch('Todo/select', null)
    },

    dtFormat (dateString) {
      if (!dateString) {
        return ''
      }
      return dateFactory(dateString.toString()).format('YYYY/MM/DD')
    }
  }
}
</script>
