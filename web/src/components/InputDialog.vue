<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container max-w-sm">
        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />

        <div class="mx-2 mb-6">
          <label class="input-label">{{ title }}</label>
          <input
            ref="inputField"
            v-model="inputText"
            class="input-text"
            type="text"
          >
        </div>

        <div class="flex flex-row-reverse mx-2">
          <button class="btn btn-regular mx-1" @click="update">
            OK
          </button>
          <button class="btn btn-outline mx-1" @click="cancel">
            Cancel
          </button>
        </div>

        <!-- フォーカスアウト防止 -->
        <div tabindex="0" class="dummy" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputDialog',
  props: {
    parent: {
      type: Element,
      require: true
    },
    title: {
      type: String,
      require: false,
      default: ''
    },
    message: {
      type: String,
      require: false,
      default: ''
    }
  },
  data () {
    return {
      inputText: ''
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
      this.inputText = this.message
      this.$refs.inputField.focus()
    },
    update () {
      this.$emit('update', this.inputText)
      this.$destroy()
    },
    cancel () {
      this.$destroy()
    },
    checkFocus (ev) {
      if (ev.target !== null && ev.target.className === 'dummy') {
        this.$refs.inputField.focus()
      }
    }
  }
}
</script>
