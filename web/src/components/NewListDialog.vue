<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-sm">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="mx-2 mb-6">
          <label class="input-label">プロジェクト名</label>
          <input
            ref="inputField"
            v-model="todolist.title"
            class="input-text"
            :class="{'border border-red-500': errorMsg !== ''}"
            type="text"
            placeholder="Add New List Title..."
          >
          <p v-show="(errorMsg !== '')" class="text-red-500 text-xs italic">
            {{ errorMsg }}
          </p>
        </div>

        <div class="mx-2 mb-6">
          <label class="input-label">説明</label>
          <textarea
            v-model="todolist.detail"
            class="input-textarea resize-none"
            maxlength="2000"
            rows="6"
          />
        </div>

        <div class="flex flex-row-reverse mx-2">
          <button class="btn btn-regular mx-1" @click="update">
            OK
          </button>
          <button class="btn btn-outline mx-1" @click="cancel">
            Cancel
          </button>
          <button
            v-if="!isCreateMode"
            class="btn btn-red-outline mx-1"
            @click="deleteList"
          >
            Delete
          </button>
        </div>

        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>
import { Todolist } from '@/model/Todolist'

export default {
  name: 'NewListDialog',
  props: {
    parent: {
      type: Element,
      require: true
    },
    target: {
      type: Object,
      require: false
    },
    isCreateMode: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      todolist: new Todolist('', {}),
      errorMsg: ''
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
      if (this.target !== null) {
        Object.assign(this.todolist, this.target)
      }

      this.$refs.inputField.focus()
    },
    update () {
      if (this.todolist.title !== '') {
        this.errorMsg = ''
        this.$emit('add', this.todolist)
        this.$destroy()
      } else {
        this.errorMsg = '必須項目です'
      }
    },
    cancel () {
      this.$destroy()
    },
    deleteList () {
      if (confirm(`プロジェクト: ${this.todolist.title} を削除しますか？`)) {
        this.$emit('deleteList')
        this.$destroy()
      }
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.inputField.focus()
      }
    }
  }
}
</script>
