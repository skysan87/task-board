<template>
  <div :class="{'move-icon': option.showPointer}">
    <div class="flex w-full">
      <div v-if="option.showPointer" class="p-1">
        <fa :icon="['fas', 'ellipsis-v']" />
      </div>
      <div v-show="option.showEdit == false" class="p-1" @click="changeEventHandler">
        <span
          :style="badgeColor(todo.state)"
          class="circle-button cursor-pointer"
        />
      </div>
      <div class="flex-1 no-wrap text-left p-1">
        {{ todo.title }}
      </div>
      <div v-show="option.showEdit == false" class="p-1" @click.stop="editEventHandler">
        <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
      </div>
      <div
        v-show="option.showEdit && canRemove"
        class="todo-x-pointer p-1"
        @click="removeEventHandler"
      >
        <span class="cursor-pointer">×</span>
      </div>
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
    }
  },
  data () {
    return {}
  },
  computed: {
    canRemove () {
      return this.$store.getters['todo/canRemove']
    }
  },
  methods: {
    changeEventHandler () {
      this.$store.dispatch('todo/changeState', this.todo.id)
    },
    badgeColor (state) {
      return getStateColor(state)
    },
    editEventHandler () {
      this.$emit('edit', this.todo.id)
    },
    removeEventHandler () {
      this.$store.dispatch('todo/delete', this.todo.id)
    }
  }
}
</script>

<style scoped>
.move-icon {
  cursor: move;
}

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
