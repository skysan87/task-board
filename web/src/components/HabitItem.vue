<template>
  <div>
    <div class="flex w-full">
      <div :title="habit.title" class="flex-1 no-wrap text-left p-1">
        {{ habit.title }}
      </div>
      <div class="p-1" @click.stop="editEventHandler">
        <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoItem',
  props: {
    habit: Object
  },
  data () {
    return {}
  },
  methods: {
    editEventHandler () {
      this.$emit('edit', this.habit.id)
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

/* transition:slide-face */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
