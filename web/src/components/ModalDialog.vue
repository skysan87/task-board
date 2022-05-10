<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-2xl">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="modal-body">
          <label class="input-label">ステータス</label>
          <div class="flex justify-evenly">
            <label v-for="viewOp in options" :key="viewOp.value" class="flex items-center">
              <input v-model="todo.state" type="radio" :value="viewOp.value">
              <span class="ml-2">{{ viewOp.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="isTypeTodo" class="modal-body">
          <label class="input-label">プロジェクト</label>
          <select v-model="todo.listId" class="input-text">
            <option v-for="list in projectList" :key="list.id" :value="list.id">
              {{ list.title }}
            </option>
          </select>
        </div>
        <div v-else>
          <span class="output-text text-xs text-gray-600">このタスクは習慣から生成されました。</span>
        </div>

        <div class="modal-body">
          <label class="input-label">タイトル</label>
          <input
            ref="title"
            v-model="todo.title"
            class="input-text"
            :class="{'border border-red-500': errorMsg !== '', 'btn-disabled': forbid.title}"
            type="text"
            :disabled="forbid.title"
          >
          <p v-show="(errorMsg !== '')" class="text-red-500 text-xs italic">
            {{ errorMsg }}
          </p>
        </div>
        <div class="modal-body">
          <label class="input-label">説明</label>
          <textarea
            v-model="todo.detail"
            class="input-textarea resize-none"
            maxlength="1000"
            rows="6"
            :class="{'btn-disabled': forbid.detail}"
            :disabled="forbid.detail"
          />
        </div>
        <div class="modal-body">
          <label class="input-label">期間</label>
          <div class="flex">
            <v-date-picker
              v-model="range"
              is-range
              class="flex-1"
              :attributes="calenderAttributes"
              :disabled="forbid.range"
            >
              <template #default="{ inputValue, togglePopover }">
                <div class="flex justify-center items-center">
                  <div class="flex items-center">
                    <button
                      class="py-1 px-2 bg-blue-100 border border-blue-200 hover:bg-blue-200 text-blue-600 focus:bg-blue-500 focus:text-white focus:border-blue-500 focus:outline-none"
                      :disabled="forbid.range"
                      :class="{'btn-disabled': forbid.range}"
                      @click="togglePopover()"
                    >
                      <fa :icon="['fas', 'calendar-day']" ontouchend="" />
                    </button>
                  </div>
                  <input
                    :value="inputValue.start"
                    class="input-text"
                    readonly
                  >
                  <svg
                    class="w-10 h-8 mx-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  <input
                    :value="inputValue.end"
                    class="input-text"
                    readonly
                  >
                </div>
              </template>
            </v-date-picker>
            <button
              type="button"
              class="btn btn-outline flex-none"
              tabindex="-1"
              :disabled="forbid.range"
              :class="{'btn-disabled': forbid.range}"
              @click="initRange"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="modal-body">
          <label class="input-label">チェックリスト ({{ subtaskDoneCount }}/{{ todo.subTasks.length }})</label>
          <sub-task-input
            v-for="subtask in todo.subTasks"
            :key="subtask.id"
            :inputdata="subtask"
            @update="updateSubtask"
            @delete="deleteSubtask"
          />
          <!-- アイテム追加ボタン -->
          <button
            v-if="!isNewSubtask"
            ref="addButton"
            :disabled="forbid.addButton"
            class="btn btn-regular"
            :class="{'btn-disabled': forbid.addButton}"
            @click.stop="isNewSubtask = true"
          >
            追加
          </button>
          <sub-task-input
            v-if="isNewSubtask"
            :is-create-mode="true"
            @cancel="isNewSubtask = false"
            @add="addSubTask"
          />
        </div>

        <div v-if="!isCreateMode" class="modal-body">
          <label class="input-label">詳細情報</label>
          <div class="flex flex-wrap">
            <div class="px-1 m-1 border">
              <span class="text-xs">登録日:</span>
              <span class="text-xs ml-1">{{ todo.createdAt | dtFormat }}</span>
            </div>
            <div class="px-1 m-1 border">
              <span class="text-xs">更新日:</span>
              <span class="text-xs ml-1">{{ todo.updatedAt | dtFormat }}</span>
            </div>
          </div>
        </div>

        <div v-if="todo.type === 'todo'" class="modal-body">
          <label class="input-label">アクション</label>
          <div class="flex flex-wrap">
            <button class="block px-1 m-1 btn btn-outline" @click="setTodayInRange">
              今日の予定に設定
            </button>
          </div>
        </div>

        <div class="flex flex-row-reverse">
          <button v-if="isCreateMode" class="btn btn-regular ml-2" @click="add">
            Add
          </button>
          <button v-if="!isCreateMode" class="btn btn-regular ml-2" @click="update">
            Save
          </button>
          <button class="btn btn-outline ml-2" @click="cancel">
            Close
          </button>
          <button
            v-if="!isCreateMode"
            class="btn btn-red-outline ml-2"
            :disabled="forbid.delete"
            :class="{'btn-disabled': forbid.delete}"
            @click="deleteTodo"
          >
            Delete
          </button>
          <span class="text-xs text-gray-600 flex-1">{{ footerMsg }}</span>
        </div>

        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { TaskState } from '@/util/TaskState'
import { Todo } from '@/model/Todo'
import { dateFactory } from '@/util/DateFactory'
import SubTaskInput from '@/components/SubTaskInput.vue'

export default {
  name: 'ModalDialog',
  components: {
    SubTaskInput
  },

  filters: {
    /**
     * @param {Date} value
     * @return {String}
     */
    dtFormat (value) {
      if (!value) {
        return ''
      }
      return dateFactory(value).format('YYYY/MM/DD')
    }
  },

  props: {
    parent: {
      type: Element,
      require: true,
      default: null
    },
    target: {
      type: Object,
      require: true,
      default () {
        return new Todo('', {})
      }
    },
    isCreateMode: {
      type: Boolean,
      require: true
    },
    projectList: {
      type: Array,
      require: false,
      default: () => []
    }
  },
  data () {
    return {
      todo: Todo.valueOf(this.target),
      range: { start: null, end: null },
      options: Object.values(TaskState),
      errorMsg: '',
      isNewSubtask: false,
      forbid: {
        title: false,
        detail: false,
        range: false,
        delete: false,
        addButton: false
      },
      footerMsg: '',
      calenderAttributes: [{ // 今日に目印
        key: 'today',
        dot: 'blue',
        dates: [new Date()]
      }]
    }
  },
  computed: {
    isTypeTodo () {
      return this.todo.type === Todo.TYPE.TODO
    },
    subtaskDoneCount () {
      return this.todo.subTasks.filter(t => t.isDone).length
    }
  },
  mounted () {
    this.parent.appendChild(this.$el)
    this.$nextTick(() => {
      this.$el.focus()
      this.init()
      document.addEventListener('focusin', this.checkFocus, false)
    })
  },
  destroyed () {
    document.removeEventListener('focusin', this.checkFocus, false)
    this.$el.remove()
  },
  methods: {
    init () {
      this.range = {
        start: this.todo.startdate !== null ? dateFactory(this.todo.startdate.toString()).toDate() : null,
        end: this.todo.enddate !== null ? dateFactory(this.todo.enddate.toString()).toDate() : null
      }

      // 編集の禁止
      if (this.todo.type === Todo.TYPE.HABIT) {
        this.forbid.title = true
        this.forbid.detail = true
        this.forbid.range = true
        this.forbid.delete = true
        this.forbid.addButton = true
        this.footerMsg = '習慣から生成されたタスクはステータスの変更のみ可能です。'
      }

      this.$refs.title.focus()
    },

    add () {
      if (!this.validate()) {
        return
      }
      this.$emit('add', this.todo)
      this.$destroy()
    },

    update () {
      if (!this.validate()) {
        return
      }
      this.$emit('update', this.todo)
    },

    validate () {
      this.errorMsg = ''

      if (isEmpty(this.todo.title)) {
        this.errorMsg = '必須項目です'
        return false
      }

      // データ変換
      if (this.range === null || this.range.start === null || this.range.end === null) {
        this.todo.startdate = null
        this.todo.enddate = null
      } else {
        this.todo.startdate = dateFactory(this.range.start).getDateNumber()
        this.todo.enddate = dateFactory(this.range.end).getDateNumber()
      }

      return true
    },

    cancel () {
      this.$destroy()
    },

    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.title.focus()
      }
    },
    deleteTodo () {
      if (!confirm('削除しますか？')) {
        return
      }
      this.$emit('delete', this.todo.id)
      this.$destroy()
    },
    initRange () {
      this.range = { start: null, end: null }
    },
    setTodayInRange () {
      this.range = { start: new Date(), end: new Date() }
    },
    addSubTask (data) {
      this.todo.subTasks.push(data)
      this.isNewSubtask = false

      this.$nextTick(() => {
        this.$refs.addButton.focus()
      })
    },
    deleteSubtask (data) {
      const index = this.todo.subTasks.findIndex(v => v.id === data.id)
      this.todo.subTasks.splice(index, 1)
    },
    updateSubtask (data) {
      const index = this.todo.subTasks.findIndex(v => v.id === data.id)
      Object.assign(this.todo.subTasks[index], data)
    }
  }
}
</script>
