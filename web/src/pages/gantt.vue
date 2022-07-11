<template>
  <div class="relative h-full">
    <div class="flex flex-col h-full">
      <div class="h-8 p-2 flex items-center">
        <select class="block border py-1 px-2 bg-gray-200" @change="onSelectProject">
          <option value="">プロジェクトを選択</option>
          <option v-for="list in projectList" :key="list.id" :value="list.id">
            {{ list.title }}
          </option>
        </select>
        <span class="ml-4">表示開始月:</span>
        <input
          type="month"
          class="block border ml-2 py-1 px-2 bg-gray-200"
          :value="startMonth.format('YYYY-MM')"
          @change="changeStartMonth"
        >
        <button v-if="tasks.length > 0" class="btn btn-regular ml-auto" @click="saveAll">保存</button>
      </div>

      <div ref="calendar" class="flex-1 border-t border-black overflow-auto w-full select-none">
        <div class="top-0 flex z-20 sticky" :style="`width: ${viewWidth}px;`">
          <div
            class="border-b border-black bg-green-100 flex sticky left-0 top-0"
            :style="`min-width: ${taskWidth}px;`"
          >
            <div class="py-2 h-full px-2 border-r border-black text-sm" style="width: 120px">
              タスク
            </div>
            <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
              開始日
            </div>
            <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
              期限日
            </div>
            <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 20px" />
          </div>

          <div v-for="month of calendars" :key="month.title" class="border-b border-black bg-white" :style="`min-width: ${blockWidth * month.days}px;`">
            <!-- 年月 -->
            <div class="border-b border-r border-black px-2">
              {{ month.title }}
            </div>
            <!-- 日付 -->
            <div class="flex">
              <div
                v-for="day of month.days"
                :key="day.date"
                class="border-r border-black text-xs text-center"
                :class="weekendColor(day.dayOfWeek)"
                :style="`min-width: ${blockWidth}px;`"
              >
                {{ day.date }}
              </div>
            </div>
            <!-- 曜日 -->
            <div class="flex">
              <div
                v-for="day of month.days"
                :key="day.date"
                class="border-r border-black text-xs text-center"
                :class="weekendColor(day.dayOfWeek)"
                :style="`min-width: ${blockWidth}px;`"
              >
                {{ day.dayOfWeek }}
              </div>
            </div>
          </div>
        </div>

        <div class="relative" :style="`width: ${viewWidth}px;`">
          <!-- timeline -->
          <div
            v-for="i of totalDays"
            :key="`line-${i}`"
            class="absolute bg-gray-200 h-full w-px"
            :style="`left: ${i * blockWidth + taskWidth - 1}px;`"
          />
          <!-- today -->
          <div
            v-if="todayPosition >= 0"
            class="absolute bg-red-300 h-full"
            :style="`width: ${blockWidth - 1}px; left: ${todayPosition}px;`"
          />
          <!-- contents -->
          <div v-for="task of taskRows" :key="`task-${task.id}`" class="h-10 border-b border-black flex">
            <div
              class="z-10 flex sticky left-0"
              :style="`min-width: ${taskWidth}px;`"
              :class="[task.isChanged ? 'bg-blue-100' : 'bg-green-100']"
            >
              <div class="omit-text py-2 h-full px-2 border-r border-black text-sm" style="width: 120px" @click.stop="selectTask(task.id)">
                {{ task.name }}
              </div>
              <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
                <span>{{ task.startDateString }}</span>
              </div>
              <div class="py-2 h-full text-center border-r border-black text-sm" style="width: 90px">
                <span>{{ task.endDateString }}</span>
              </div>
              <div class="py-1 h-full text-center border-r border-black text-sm" style="width: 20px">
                <button class="h-full" @click.stop="editRange(task.id)">
                  <fa :icon="['fas', 'edit']" size="xs" />
                </button>
              </div>
            </div>
            <div
              :style="task.style"
              class="h-10 flex py-2 will-change-transform"
              @mousedown="onMouseDown_MoveStart($event, task)"
            >
              <div
                class="w-2 bg-yellow-200 rounded-l-lg cursor-col-resize"
                @mousedown.stop="onMouseDown_ResizeStart($event, task, 'left')"
              />
              <div class="flex-1 bg-yellow-200 pointer-events-none" />
              <div
                class="w-2 bg-yellow-200 rounded-r-lg cursor-col-resize"
                @mousedown.stop="onMouseDown_ResizeStart($event, task, 'right')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- datepicker -->
    <div
      v-show="datepickItem.visible"
      class="data-picker absolute z-30 inset-0 w-full h-full"
    >
      <div class="absolute mt-10 ml-4">
        <div class="text-right my-1">
          <button class="btn btn-red-outline" @click="clearDatePicker">Clear</button>
          <button class="btn btn-regular" @click="closeDatePicker">Close</button>
        </div>
        <v-date-picker
          ref="datepicker"
          v-model="datepickRange"
          :attributes="datepickItem.attributes"
          is-range
          @input="changeRange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { dateFactory } from '@/util/DateFactory'

const BLOCK_SIZE = 20
const TASK_WIDTH = 320

class TmpTask {
  #srcStartDate
  #srcEndDate

  constructor (todo) {
    this.id = todo.id
    this.name = todo.title
    this.startDate = todo.startdate ? dateFactory(todo.startdate) : null
    this.endDate = todo.enddate ? dateFactory(todo.enddate) : null
    this.#srcStartDate = todo.startdate ?? null
    this.#srcEndDate = todo.enddate ?? null
  }

  get isChanged () {
    const newStartDateNum = this.startDate?.getDateNumber() ?? null
    const newEndDateNum = this.endDate?.getDateNumber() ?? null
    return newStartDateNum !== this.#srcStartDate ||
      newEndDateNum !== this.#srcEndDate
  }

  get undecided () {
    return !this.startDate || !this.endDate
  }

  get startDateString () {
    return this.startDate?.format('YYYY/MM/DD') ?? ''
  }

  get endDateString () {
    return this.endDate?.format('YYYY/MM/DD') ?? ''
  }

  calcDiff (rangeStart, rangeEnd) {
    if (this.undecided) {
      return {
        between: 0,
        start: 0,
        outOfRange: true
      }
    }
    const between = this.endDate.diff(this.startDate, 'day') + 1
    const start = this.startDate.diff(rangeStart, 'day')
    const end = rangeEnd.diff(this.endDate, 'day')
    return {
      between,
      start,
      outOfRange: !(start >= 0 && end >= 0)
    }
  }
}

export default {
  name: 'Gantt',

  // PC only
  layout: 'board',

  data () {
    const _today = dateFactory().getFirstDayOfMonth()

    return {
      dragging: false,
      leftResizing: false,
      rightResizing: false,
      target: {
        pageX: 0,
        element: null,
        task: null
      },
      blockWidth: BLOCK_SIZE,
      taskWidth: TASK_WIDTH,
      viewWidth: 0,
      contentWidth: 0,
      totalDays: 0,
      startMonth: _today,
      endMonth: _today.add(1, 'month').getEndDayOfMonth(),
      calendars: [],
      tasks: [],
      projectList: [],
      datepickItem: {
        taskId: null,
        visible: false,
        attributes: []
      },
      // NOTE: objectのpropertyでは、変更が反映されない
      datepickRange: null
    }
  },

  computed: {
    taskRows () {
      return this.tasks.map((task) => {
        const diff = task.calcDiff(this.startMonth, this.endMonth)

        const pos = {
          x: diff.start * BLOCK_SIZE,
          width: BLOCK_SIZE * diff.between
        }

        const style = {
          width: `${pos.width}px`,
          transform: `translateX(${pos.x}px)`
        }

        // 表示範囲外の日付を含む場合は表示しない
        if (diff.outOfRange) {
          style.display = 'none'
        }

        return {
          style,
          pos,
          ...task,
          startDateString: task.startDateString,
          endDateString: task.endDateString,
          isChanged: task.isChanged
        }
      })
    },

    todayPosition () {
      const today = dateFactory()
      const diffFuture = today.diff(this.startMonth, 'day')
      const diffPast = this.endMonth.diff(today, 'day') + this.endMonth.daysInMonth()
      return (diffFuture >= 0 && diffPast > 0)
        ? diffFuture * BLOCK_SIZE + TASK_WIDTH
        : -1
    }
  },

  mounted () {
    this.initView()
    this.projectList = this.$store.getters['Todolist/getLists']
    document.addEventListener('mousemove', this.onMouseDown_Moving)
    document.addEventListener('mouseup', this.onMouseDown_MoveStop)
    document.addEventListener('mousemove', this.onMouseDown_Resizing)
    document.addEventListener('mouseup', this.onMouseDown_ResizeStop)
  },

  destroyed () {
    document.removeEventListener('mousemove', this.onMouseDown_Moving)
    document.removeEventListener('mouseup', this.onMouseDown_MoveStop)
    document.removeEventListener('mousemove', this.onMouseDown_Resizing)
    document.removeEventListener('mouseup', this.onMouseDown_ResizeStop)
  },

  methods: {
    initView () {
      this.setCalendar()
      this.totalDays = this.calendars.reduce((p, c) => p + c.days.length, 0)
      this.contentWidth = this.totalDays * this.blockWidth
      this.viewWidth = this.taskWidth + this.contentWidth
      this.$nextTick(() => {
        this.$refs.calendar.scrollLeft = this.todayPosition - TASK_WIDTH
      })
    },

    getDays (startMonth) {
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土']

      const days = []
      for (let i = 0; i < startMonth.daysInMonth(); i++) {
        const targetDate = startMonth.addDay(i)
        days.push({
          date: targetDate.get('date'),
          dayOfWeek: dayOfWeek[targetDate.get('day')]
        })
      }
      return days
    },

    setCalendar () {
      this.calendars = []
      const betweenMonth = this.endMonth.diff(this.startMonth, 'month')
      for (let i = 0; i <= betweenMonth; i++) {
        const targetMonth = this.startMonth.add(i, 'month')
        this.calendars.push({
          title: targetMonth.format('YYYY年MM月'),
          days: this.getDays(targetMonth)
        })
      }
    },

    changeStartMonth (e) {
      if (e.target.value === null || e.target.value === '') {
        alert('表示する月を設定してください')
        return
      }
      const target = dateFactory(e.target.value, 'YYYY-MM').getFirstDayOfMonth()
      this.startMonth = target.getFirstDayOfMonth()
      this.endMonth = target.add(1, 'month').getEndDayOfMonth()

      this.initView()
    },

    onMouseDown_MoveStart (e, task) {
      this.dragging = true
      this.target.pageX = e.pageX
      this.target.element = e.target
      this.target.task = task
    },

    onMouseDown_Moving (e) {
      if (!this.dragging) { return }

      const realX = this.calcMovePositionX(e.pageX)
      this.target.element.style.transform = `translateX(${realX}px)`
    },

    onMouseDown_MoveStop (e) {
      if (!this.dragging) { return }
      const realX = this.calcMovePositionX(e.pageX)
      // 日付線にフィットさせる
      const days = Math.round((this.target.task.pos.x - realX) / BLOCK_SIZE)

      if (days !== 0) {
        const task = this.tasks.find(task => task.id === this.target.task.id)
        task['startDate'] = task.startDate.addDay(-days)
        task['endDate'] = task.endDate.addDay(-days)
      } else {
        this.target.element.style.transform = `translateX(${this.target.task.pos.x}px)`
      }

      this.dragging = false
      this.target.element = null
      this.target.task = null
      this.target.pageX = 0
    },

    onMouseDown_ResizeStart (e, task, direction) {
      if (direction === 'left') {
        this.leftResizing = true
      } else {
        this.rightResizing = true
      }
      this.target.pageX = e.pageX
      this.target.element = e.target.parentElement
      this.target.task = task
    },

    onMouseDown_Resizing (e) {
      if (this.leftResizing) {
        const realX = this.calcResizePositionX(e.pageX)
        const realWidth = this.calcLeftResizeWidth(e.pageX)
        this.target.element.style.transform = `translateX(${realX}px)`
        this.target.element.style.width = `${realWidth}px`
      }

      if (this.rightResizing) {
        const realWidth = this.calcRightResizeWidth(e.pageX)
        this.target.element.style.width = `${realWidth}px`
      }
    },

    onMouseDown_ResizeStop (e) {
      if (this.leftResizing) {
        const realX = this.calcResizePositionX(e.pageX)
        // 日付線にフィットさせる
        const days = Math.round((this.target.task.pos.x - realX) / BLOCK_SIZE)

        if (days !== 0) {
          const task = this.tasks.find(task => task.id === this.target.task.id)
          task['startDate'] = task.startDate.addDay(-days)
        } else {
          this.target.element.style.transform = `translateX(${this.target.task.pos.x}px)`
          this.target.element.style.width = `${this.target.task.pos.width}px`
        }
      }

      if (this.rightResizing) {
        const realWidth = this.calcRightResizeWidth(e.pageX)
        // 日付線にフィットさせる
        const days = Math.round((this.target.task.pos.width - realWidth) / BLOCK_SIZE)

        if (days !== 0) {
          const task = this.tasks.find(task => task.id === this.target.task.id)
          task['endDate'] = task.endDate.addDay(-days)
        } else {
          this.target.element.style.width = `${this.target.task.pos.width}px`
        }
      }

      this.leftResizing = false
      this.rightResizing = false
      this.target.element = null
      this.target.task = null
      this.target.pageX = 0
    },

    calcMovePositionX (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.x - diff
        , 0
        , this.contentWidth - this.target.task.pos.width
      )
    },

    calcResizePositionX (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.x - diff
        , 0
        , this.target.task.pos.x + this.target.task.pos.width - BLOCK_SIZE
      )
    },

    calcLeftResizeWidth (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.width + diff
        , BLOCK_SIZE
        , this.target.task.pos.width + this.target.task.pos.x
      )
    },

    calcRightResizeWidth (currentPageX) {
      const diff = this.target.pageX - currentPageX

      return this.keepThreshold(
        this.target.task.pos.width - diff
        , BLOCK_SIZE
        , this.contentWidth - this.target.task.pos.x
      )
    },

    keepThreshold (value, min, max) {
      if (value <= min) { return min }
      if (value >= max) { return max }
      return value
    },

    weekendColor (dayOfWeek) {
      switch (dayOfWeek) {
        case '土':
          return 'bg-blue-100'
        case '日':
          return 'bg-red-100'
        default:
          return ''
      }
    },

    async onSelectProject (e) {
      try {
        const projectId = e.target.value
        if (!projectId) {
          this.tasks = []
        } else {
          await this.$store.dispatch('Todo/init', projectId)
          await this.makeData()
        }
      } catch (error) {
        console.error(error)
        this.$toast.error('プロジェクトの読み込みに失敗しました')
      }
    },

    async saveAll () {
      try {
        if (!confirm('期限を変更しますか？')) {
          return
        }

        const targets = this.tasks
          .filter(tmp => tmp.isChanged)
          .map((tmp) => {
            return {
              id: tmp.id,
              startdate: tmp.startDate?.getDateNumber() ?? null,
              enddate: tmp.endDate?.getDateNumber() ?? null
            }
          })
        await this.$store.dispatch('Todo/setDeadline', targets)
        await this.makeData()
        this.$toast.success('変更しました')
      } catch (error) {
        console.error(error)
        this.$toast.error('変更に失敗しました')
      }
    },

    selectTask (taskId) {
      this.$store.dispatch('Todo/select', taskId)
    },

    async editRange (taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      this.datepickItem.taskId = taskId
      this.datepickItem.attributes.push({
        key: 'today',
        dot: 'blue',
        dates: [new Date()]
      })

      let targetDate = new Date()
      // 編集前の値
      if (!task.undecided) {
        // NOTE: datepickerのvalueに値を設定すると@inputが発動し、制御できないため
        this.datepickItem.attributes.push({
          key: 'range',
          bar: 'green',
          dates: { start: task.startDate.toDate(), end: task.endDate.toDate() }
        })
        targetDate = task.startDate.toDate()
      }

      await this.$refs.datepicker.move(targetDate)
      this.datepickItem.visible = true
    },

    /**
     * datepickRangeが変更されたタイミング
     *
     * @param {{state: Date, end: Date} | null} range
     */
    changeRange (range) {
      if (!this.datepickItem.visible) {
        // editRangeで設定したタイミング
        return
      }

      if (range !== null) {
        const task = this.tasks.find(t => t.id === this.datepickItem.taskId)
        task.startDate = dateFactory(range.start).resetTime()
        task.endDate = dateFactory(range.end).resetTime()
      }
      this.closeDatePicker()
    },

    closeDatePicker () {
      this.datepickItem.taskId = null
      this.datepickItem.attributes = []
      this.$nextTick(() => {
        this.datepickItem.visible = false
        this.datepickRange = null // trigger: @input
      })
    },

    clearDatePicker () {
      const task = this.tasks.find(t => t.id === this.datepickItem.taskId)
      task.startDate = null
      task.endDate = null
      this.closeDatePicker()
    },

    async makeData () {
      this.tasks = []
      await this.$store.getters['Todo/getFilteredTodos']
        .forEach((todo) => {
          this.tasks.push(new TmpTask(todo))
        })
    }
  }
}
</script>

<style scoped>
.sticky {
  position: sticky;
  position: -webkit-sticky;
}
.will-change-transform {
  will-change: transform;
}
.cursor-col-resize {
  cursor: col-resize;
}
.data-picker {
  background-color: rgba(215, 214, 214, 0.5);
}
</style>
