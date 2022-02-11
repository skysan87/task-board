<template>
  <div class="h-screen">
    <main>
      <div class="bg-gray-300 p-2 mx-1 flex flex-col">
        <div class="flex-0 overflow-hidden">
          <div class="m-2" />
          <div class="flex">
            <div id="time-container">
              <div v-for="(time, index) in timetable" :key="index" class="bg-grey-200 select-none">
                <div class="timetable-label" :style="`height: ${blockSize}px;`">
                  <span class="timetable-label__text">{{ time.label }}</span>
                </div>
              </div>
            </div>
            <div id="task-container" class="relative">
              <div v-for="(time, index) in timetable" :key="index" class="bg-grey-200 select-none">
                <div
                  class="timetable-row mx-1 flex-1"
                  :class="{ 'border-top': index === 0, 'drag-enter': (time.isEnter) }"
                  :style="`min-width: 400px; max-width: 400px; height: ${blockSize}px;`"
                  @dragenter="dragEnter(time.id)"
                  @dragleave="dragLeave(time.id)"
                  @drop.prevent="drop($event, time.id)"
                  @dragover.prevent
                >
                  <div class="select-none no-wrap px-1">
                    {{ reserved(time) }}
                  </div>
                </div>
              </div>
              <div v-show="!isDropping" class="inset-0 absolute">
                <div
                  v-for="t in tasks"
                  :key="t.id"
                  class="absolute bg-red-300 border border-black left-1 flex"
                  :style="calcDisplayTask(t)"
                  :class="[(dragging && t.id === taskId) ? 'grabbing' : 'grab', taskBlockName]"
                  @mousedown.prevent="mouseDownMove($event, t)"
                >
                  <div class="flex w-full">
                    <div class="select-none flex-1 no-wrap text-left px-1" :title="t.name">
                      {{ t.name }}
                    </div>
                    <div class="flex p-2 items-center cursor-pointer" @click.stop="remove(t)">
                      <fa :icon="['fas', 'times']" size="xs" />
                    </div>
                  </div>
                  <div
                    class="h-2 absolute w-full left-0 bottom-0 cursor-resize"
                    @mousedown.stop="mouseDownResize($event, t)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const BLOCK_CLASS_NAME = 'task-block'
const DURATION = 30 // min

export default {
  name: 'Timetable',
  props: {
    // [{
    //   id: String | Number
    //   name: String
    //   startTime: String 'HH:mm'
    //   endTime: String 'HH:mm'
    // }]
    tasks: {
      type: Array,
      require: true,
      default: () => []
    },
    range: {
      type: Object,
      require: true,
      default: () => { return { start: '9:00', end: '18:00' } }
    },
    isDropping: {
      type: Boolean,
      require: false,
      default: false
    }
  },
  data () {
    return {
      blockSize: 48,
      timetable: [],
      dateString: dayjs().format('YYYY-MM-DD'),
      // ドラッグ
      dragging: false,
      top: '',
      height: '',
      element: '',
      taskId: '',
      resizing: false,
      pageY: '',
      taskBlockName: BLOCK_CLASS_NAME,
      timetableHeight: 0
    }
  },

  mounted () {
    this.initialize()
    window.addEventListener('mousemove', this.mouseMove)
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('mousemove', this.mouseMoveResize)
  },

  destroyed () {
    window.removeEventListener('mousemove', this.mouseMove)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('mousemove', this.mouseMoveResize)
  },

  methods: {

    initialize () {
      this.createTimetable()
    },

    dragEnter (timeId) {
      const time = this.timetable.find(t => t.id === timeId)
      time.isEnter = true
    },

    dragLeave (timeId) {
      const time = this.timetable.find(t => t.id === timeId)
      time.isEnter = false
    },

    drop (e, timeId) {
      const time = this.timetable.find(t => t.id === timeId)
      time.isEnter = false

      const taskId = e.dataTransfer.getData('text/plain')
      this.$emit('add', { taskId, startTime: time.start, endTime: time.end })
    },

    mouseDownMove (e, task) {
      this.dragging = true
      this.pageY = e.pageY
      this.taskId = task.id
      if (e.target.classList.contains(this.taskBlockName)) {
        this.top = e.target.style.top
        this.element = e.target
      } else {
        const ancestor = e.target.closest(`.${this.taskBlockName}`)
        this.top = ancestor.style.top
        this.element = ancestor
      }
    },

    mouseMove (e) {
      if (this.dragging) {
        const diff = e.pageY - this.pageY
        const actualTop = parseInt(this.top.replace('px', '')) + diff
        if (actualTop >= 0 && actualTop + this.blockSize <= this.timetableHeight) {
          this.element.style.top = `${actualTop}px`
        }
      }
    },

    stopDrag (e) {
      if (this.dragging) {
        const diff = e.pageY - this.pageY
        const diffMin = Math.floor(diff / this.blockSize) * DURATION

        if (diffMin !== 0) {
          const task = { ...this.tasks.find(t => t.id === this.taskId) }
          const rangeStart = dayjs(`${this.dateString} ${this.range.start}`)
          const rangeEnd = dayjs(`${this.dateString} ${this.range.end}`)
          const newStartTime = dayjs(task.startTime).add(diffMin, 'minute')
          const newEndTime = dayjs(task.endTime).add(diffMin, 'minute')

          const duration = newEndTime.diff(newStartTime, 'minute')

          if (newStartTime.diff(rangeStart, 'minute') <= 0) {
            task.startTime = rangeStart.valueOf()
            task.endTime = rangeStart.add(duration, 'minute').valueOf()
          } else if (rangeEnd.diff(newEndTime, 'minute') <= 0) {
            task.startTime = rangeEnd.subtract(duration, 'minute').valueOf()
            task.endTime = rangeEnd.valueOf()
          } else {
            task.startTime = newStartTime.valueOf()
            task.endTime = newEndTime.valueOf()
          }
          this.$emit('update', task)
        } else {
          this.element.style.top = this.top
        }
      }

      if (this.resizing) {
        const diff = e.pageY - this.pageY
        const diffMin = Math.floor(diff / this.blockSize) * DURATION

        if (diffMin !== 0) {
          const task = { ...this.tasks.find(t => t.id === this.taskId) }
          const rangeEnd = dayjs(`${this.dateString} ${this.range.end}`)
          const startTime = dayjs(task.startTime)
          const newEndTime = dayjs(task.endTime).add(diffMin, 'minute')

          if (rangeEnd.diff(newEndTime, 'minute') <= 0) {
            task.endTime = rangeEnd.valueOf()
          } else if (startTime.diff(newEndTime, 'minute') >= 0) {
            task.endTime = startTime.add(DURATION, 'minute').valueOf()
          } else {
            task.endTime = newEndTime.valueOf()
          }
          this.$emit('update', task)
        } else {
          this.element.style.height = this.height
        }
      }

      this.dragging = false
      this.resizing = false
    },

    mouseDownResize (e, task) {
      this.resizing = true
      this.height = e.target.parentElement.style.height
      this.pageY = e.pageY
      this.element = e.target.parentElement
      this.taskId = task.id
    },

    mouseMoveResize (e) {
      if (this.resizing) {
        const diff = e.pageY - this.pageY
        if (parseInt(this.height.replace('px', '')) + diff > this.blockSize) {
          this.element.style.height = `${parseInt(this.height.replace('px', '')) + diff}px`
        }
      }
    },

    /**
     * タイムテーブルデータの作成
     */
    createTimetable () {
      const now = Date.parse(this.dateString)
      const startTime = this.convertToDate(now, this.range.start)
      const endTime = this.convertToDate(now, this.range.end)

      const blockMinutes = DURATION
      const blockCount = (endTime - startTime) / (60 * 1000 * blockMinutes)

      this.timetable = []

      for (let i = 0; i < blockCount; i++) {
        const timeNum = startTime.getTime()

        this.timetable.push({
          id: timeNum,
          label: `${dayjs(startTime).format('HH:mm')}`,
          start: timeNum,
          end: timeNum + (blockMinutes * 60 * 1000),
          isEnter: false
        })

        startTime.setMinutes(startTime.getMinutes() + blockMinutes)
      }

      this.timetableHeight = this.blockSize * this.timetable.length
    },

    /**
     * Date型に変換
     * @param {Number} datetime UTCミリ秒
     * @param {String} clock HH:mm
     * @return {Date}
     */
    convertToDate (datetime, clock) {
      const clocks = clock.split(':')
      const date = new Date(datetime)

      let hour = parseInt(clocks[0])
      if (hour < 0) {
        hour = 0
      }

      // NOTE: 24:00の場合、翌日になる
      let minute = parseInt(clocks[1])
      if (minute < 0 || hour > 23) {
        minute = 0
      } else if (minute > 59) {
        minute = 59
      }

      date.setHours(hour, minute, 0, 0)
      return date
    },

    calcDisplayTask (task) {
      const startTime = dayjs(`${this.dateString} ${this.range.start}`)
      const timeFrom = dayjs(task.startTime)
      const timeTo = dayjs(task.endTime)
      const between = timeTo.diff(timeFrom, 'minute', true) / DURATION
      const start = timeFrom.diff(startTime, 'minute', true) / DURATION
      return {
        top: `${this.blockSize * start}px`,
        height: `${this.blockSize * between - 1}px`,
        width: '98%'
      }
    },

    reserved (time) {
      if (!this.isDropping) {
        return ''
      }
      const task = this.tasks.find(t => t.startTime <= time.start && t.endTime >= time.end)
      return !task ? '' : task.name
    },

    remove (task) {
      this.$emit('remove', task)
    }
  }
}
</script>

<style lang="scss" scoped>
.timetable-label {
  position: relative;
  min-width: 32px;
  text-align: center;
  font-size: 12px;

  &__text {
    position: absolute;
    top: -9px;
    right: -1px;
  }
}

.timetable-row {
  background-color: rgb(112, 134, 233);
  border-bottom: 1px solid rgb(33, 33, 226);
  border-right: 1px solid rgb(33, 33, 226);
  border-left: 1px solid rgb(33, 33, 226);
}

.border-top {
  border-top: 2px solid rgb(33, 33, 226);
}

.drag-enter {
  background-color: rgba(210, 166, 247, 0.671);
}

.grab {
  cursor: grab;
}

.grabbing {
  cursor: grabbing;
}

.cursor-resize {
  cursor: ns-resize;
}
</style>
