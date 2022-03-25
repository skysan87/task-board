<template>
  <div class="mb-1 hover:bg-gray-200" @focusout="handleFocusout" @focusin="handleFocusin">
    <div v-if="!editMode" class="flex items-center">
      <div class="flex-1">
        <label class="flex items-center">
          <input type="checkbox" class="pl-1 felx-none" :checked="subTask.isDone" @change="updateState">
          <span class="break-all flex-1 text-left px-1">{{ subTask.title }}</span>
        </label>
      </div>
      <div class="px-1" @click.left.stop="onEditMode">
        <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
      </div>
      <div class="todo-x-pointer px-1" @click.left.stop="deleteData">
        <span class="cursor-pointer">×</span>
      </div>
    </div>

    <div v-if="editMode" class="flex items-center">
      <input type="checkbox" class="px-1" :checked="subTask.isDone" disabled>
      <div class="w-full px-1">
        <form @submit.prevent="update">
          <input
            ref="inputtext"
            v-model="subTask.title"
            type="text"
            class="input-text flex-1 apperance-none outline-none"
            placeholder="Add New Sub-Task..."
          >
        </form>
      </div>
      <div class="px-1">
        <button class="text-blue-500" @click.left.stop="update">
          O
        </button>
      </div>
      <div class="px-1">
        <button class="text-pink-500" @click.left.stop="cancel">
          X
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { SubTask } from '@/model/SubTask'

export default {
  name: 'SubTaskInput',
  props: {
    inputdata: {
      type: Object,
      required: false,
      default () {
        return new SubTask({ id: Date.now() })
      }
    },
    isCreateMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    if (this.isCreateMode) {
      this.$nextTick(() => {
        this.$refs.inputtext.focus()
      })
    }
    return {
      subTask: new SubTask(this.inputdata),
      editMode: this.isCreateMode,
      focusTimerId: null
    }
  },
  destroyed () {
    clearTimeout(this.focusTimerId)
  },
  methods: {
    onEditMode () {
      this.editMode = true

      this.$nextTick(() => {
        this.$refs.inputtext.focus()
      })
    },
    cancel () {
      this.editMode = false
      this.subTask = new SubTask(this.inputdata)
      this.$emit('cancel')
    },
    updateState () {
      this.subTask.isDone = !this.subTask.isDone
      this.$emit('update', this.subTask)
    },
    update () {
      this.editMode = false
      if (this.isCreateMode) {
        this.$emit('add', this.subTask)
      } else {
        this.$emit('update', this.subTask)
      }
    },
    deleteData () {
      this.$emit('delete', this.subTask)
    },
    handleFocusout () {
      if (!this.editMode) {
        return
      }
      // コンポーネントからフォーカスアウト時にキャンセル
      // NOTE: focusout/focusinのバブリングを利用
      this.focusTimerId = setTimeout(() => this.cancel(), 100)
    },
    handleFocusin () {
      if (!this.editMode) {
        return
      }
      clearTimeout(this.focusTimerId)
    }
  }
}
</script>
