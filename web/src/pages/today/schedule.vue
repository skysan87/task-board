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
                <div class="flex-1 no-wrap text-left p-1">
                  {{ item.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="min-width: 400px;" class="bg-gray-300 p-2 mx-1 flex flex-col">
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
      // allTasks: this.$store.getters['Todo/getFilteredTodos'],
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

  // TODO: リセットボタン
  methods: {
    initialize () {
      this.$store.dispatch('Todo/initTodaylist')
      // TODO: 登録したスケジュールを取得
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
      const task = this.freeTasks.find(t => t.id === data.taskId)
      this.scheduledTasks.push({
        id: data.taskId,
        name: task.title,
        startTime: data.startTime,
        endTime: data.endTime
      })
      // TODO: 保存
    },

    update (data) {
      const index = this.scheduledTasks.findIndex(t => t.id === data.id)
      this.scheduledTasks[index].startTime = data.startTime
      this.scheduledTasks[index].endTime = data.endTime
      // TODO: 保存
    },

    remove (data) {
      const index = this.scheduledTasks.findIndex(t => t.id === data.id)
      if (index >= 0) {
        this.scheduledTasks.splice(index, 1)
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
