<template>
  <div class="flex flex-col" style="height: 100vh;">
    <main class="flex-1 flex flex-row overflow-y-hidden">
      <div class="flex-0 bg-gray-200 p-2 mx-1 select-none overflow-x-hidden" style="min-width: 220px; max-width: 220px;">
        <div class="mx-2">
          <div class="list-group">
            <div
              v-for="item in freeTasks"
              :key="item.id"
              class="list-group-item list-style"
              draggable="true"
              @dragstart="dragTask($event, item)"
              @dragend="dragEnd($event)"
            >
              <div class="flex w-full">
                <div class="flex-1 no-wrap text-left p-1" :title="item.title">
                  {{ item.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="min-width: 400px;" class="bg-gray-300 p-2 mx-1 flex flex-col">
        <div class="flex-0 flex justify-end pr-8">
          <button class="block btn btn-red-outline" @click="reset">
            RESET
          </button>
        </div>
        <div class="flex-0 overflow-x-hidden">
          <timetable
            :range="range"
            :tasks="scheduledTasks"
            :is-dropping="dragging"
            @add="add"
            @update="update"
            @remove="remove"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { dateFactory } from '@/util/DateFactory'
import Timetable from '@/components/Timetable.vue'

export default {
  name: 'Schedule',

  components: {
    Timetable
  },

  layout: 'board',

  data () {
    return {
      // TODO: Vuex側で処理したい
      scheduledTasks: [],
      dateString: dateFactory(new Date()).format('YYYY-MM-DD'),
      range: { start: '09:00', end: '14:00' },
      dragging: false
    }
  },

  computed: {
    freeTasks: {
      get () {
        return this.$store.getters['Todo/getFilteredTodos']
          .filter(task => this.scheduledTasks.findIndex(s => s.id === task.id) < 0)
      }
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    async initialize () {
      await this.$store.dispatch('Todo/initTodaylist')
      // 登録したスケジュールを取得
      await this.$store.dispatch('Event/init', this.dateString)

      const schedule = this.$store.getters['Event/getEvent'].tasks
      this.$store.getters['Todo/getFilteredTodos'].forEach((todo) => {
        const sheduleTask = schedule.find(s => s.id === todo.id)
        if (sheduleTask) {
          this.scheduledTasks.push({
            ...sheduleTask, name: todo.title
          })
        }
      })
    },

    dragTask (e, task) {
      this.dragging = true
      e.dataTransfer.setData('text/plain', task.id)
    },

    dragEnd (e) {
      this.dragging = false
      e.stopPropagation() // バブリングキャンセル
      e.dataTransfer.clearData()
    },

    add (data) {
      // TODO: Vuex側で処理したい
      const task = this.freeTasks.find(t => t.id === data.id)
      this.scheduledTasks.push({
        id: data.id,
        name: task.title,
        startTime: data.startTime,
        endTime: data.endTime
      })

      this.$store.dispatch('Event/addTask', {
        id: data.id,
        startTime: data.startTime,
        endTime: data.endTime
      })
    },

    update (data) {
      // TODO: Vuex側で処理したい
      const index = this.scheduledTasks.findIndex(t => t.id === data.id)
      this.scheduledTasks[index].startTime = data.startTime
      this.scheduledTasks[index].endTime = data.endTime

      this.$store.dispatch('Event/updateTask', {
        id: data.id,
        startTime: data.startTime,
        endTime: data.endTime
      })
    },

    remove (data) {
      // TODO: Vuex側で処理したい
      const index = this.scheduledTasks.findIndex(t => t.id === data.id)
      if (index >= 0) {
        this.scheduledTasks.splice(index, 1)
      }
      this.$store.dispatch('Event/removeTask', data.id)
    },

    reset () {
      if (confirm('リセットしますか？')) {
        // TODO: Vuex側で処理したい
        this.scheduledTasks = []
        this.$store.dispatch('Event/removeAll')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
