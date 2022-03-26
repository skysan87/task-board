<template>
  <main class="grid grid-rows-1 grid-cols-2 h-screen">
    <div class="bg-gray-200 p-2 select-none overflow-x-hidden">
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
              <div class="pr-2">
                <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" @click.stop="showDialog(item.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-300 p-2 flex flex-col">
      <div class="flex-0 flex justify-end pr-8">
        <div class="flex relative items-center">
          <button class="block btn btn-outline mr-2" @click="togglePopup">
            時間変更
          </button>
          <div v-show="popup" class="popup">
            <time-range ref="range" :start="range.start" :end="range.end" @update="updateTimetable" />
          </div>
        </div>
        <button class="block btn btn-outline mr-2" @click="focusMode">
          FOCUS
        </button>
        <button class="block btn btn-red-outline" @click="reset">
          RESET
        </button>
      </div>
      <div class="flex-0 overflow-auto">
        <timetable
          :range="range"
          :tasks="scheduledTasks"
          :is-dropping="dragging"
          @add="add"
          @update="update"
          @remove="remove"
          @show="showDialog"
        />
      </div>
    </div>
  </main>
</template>

<script>
import Vue from 'vue'
import { dateFactory } from '@/util/DateFactory'
import Timetable from '@/components/Timetable.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import TimeRange from '@/components/parts/TimeRange.vue'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'Schedule',

  components: {
    Timetable,
    TimeRange
  },

  layout: 'board',

  data () {
    return {
      // TODO: Vuex側で処理したい
      scheduledTasks: [],
      dateString: dateFactory(new Date()).format('YYYY-MM-DD'),
      range: { start: '09:00', end: '18:00' },
      dragging: false,
      dialog: null,
      popup: false
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
      // 終了したタスクも表示する
      this.$store.getters['Todo/getOrderdTodos'].forEach((todo) => {
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
    },

    focusMode () {
      this.$router.push('/focus')
    },

    showDialog (taskId) {
      const task = this.$store.getters['Todo/getTodoById'](taskId)
      const list = this.$store.getters['Todolist/getLists']

      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: task,
          isCreateMode: false,
          projectList: list
        }
      })
      this.dialog.$on('update', (todo) => {
        this.$store.dispatch('Todo/update', todo)
        const index = this.scheduledTasks.findIndex(t => t.id === todo.id)
        if (index >= 0) {
          this.scheduledTasks[index].name = todo.title
        }
      })
      this.dialog.$on('delete', () => {
        this.$toast.error('ここでは削除できません')
      })
      this.dialog.$mount()
    },

    togglePopup () {
      if (this.popup) {
        this.$refs.range.reset()
      }
      this.popup = !this.popup
    },

    updateTimetable (_range) {
      this.popup = false
      this.range = { ..._range }
      // TODO: update
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

.popup {
  display: flex;
  align-items: center;
  position: absolute;
  top: 80%;
  left: -70%;
  padding: 0.5rem;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0.5rem;
  z-index: 10;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  border: 1px solid #979797;
  background-color: white;
}
</style>
