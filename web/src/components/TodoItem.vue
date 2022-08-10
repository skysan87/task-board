<template>
  <div
    class="box flex items-center w-full"
    @click.stop="handleSelect"
  >
    <fa
      v-if="option.showPointer"
      :icon="['fas', 'ellipsis-v']"
      class="move-icon px-1"
    />
    <div
      v-show="option.showEdit == false"
      class="px-1"
      @click.stop="changeEventHandler"
    >
      <span
        :style="badgeColor(todo.state)"
        class="circle-button cursor-pointer"
      />
    </div>
    <div class="no-wrap flex-1 text-left p-1">
      {{ todo.title }}
    </div>
    <span v-show="isExpired" class="text-red-500 px-1 font-bold" title="期限切れ">!</span>
    <fa
      v-show="option.showEdit == false"
      title="編集"
      :icon="['fas', 'edit']"
      size="xs"
      class="cursor-pointer px-1"
      @click.stop="editEventHandler"
    />
    <div
      v-if="option.showEdit"
      class="check-icon py-1 px-2 cursor-pointer rounded-full hover:bg-gray-200"
      @click.stop="handleChecked"
    >
      <fa
        :icon="['fas', 'circle-check']"
        :class="{'text-gray-300' : !isChecked}"
      />
    </div>
  </div>
</template>

<script>
import { getStateColor } from '@/util/StateColor'
import { Todo } from '@/model/Todo'

export default {
  name: 'TodoItem',
  props: {
    todo: {
      type: Object,
      required: true,
      default () {
        return new Todo('', {})
      }
    },
    option: {
      type: Object,
      default () {
        return {
          showPointer: true,
          showEdit: true
        }
      }
    },
    isChecked: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  computed: {
    editMode () {
      return this.$store.getters['Todo/editMode']
    },

    isExpired () {
      if (!this.todo.enddate) {
        return false
      } else {
        const num = this.$store.getters['View/getDate']
        return this.todo.enddate < num
      }
    }
  },
  methods: {
    changeEventHandler () {
      this.$store.dispatch('Todo/changeState', this.todo.id)
        .catch((error) => {
          console.log(error)
          this.$toast.error('更新に失敗しました')
        })
    },
    badgeColor (state) {
      return getStateColor(state)
    },
    editEventHandler () {
      this.$emit('edit', this.todo.id)
    },
    handleSelect () {
      this.$emit('select', this.todo.id)
    },
    handleChecked () {
      this.$emit('check', this.todo.id)
    }
  }
}
</script>

<style scoped>
.move-icon {
  cursor: move;
}

.no-wrap {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.box:active {
  opacity: 0.4;
}
</style>
