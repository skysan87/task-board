<template>
  <div class="flex flex-col bg-white h-full">
    <header class="border-b flex-none">
      <div class="cursor-pointer py-2 pl-4 inline-block text-gray-600" @click="backToList">
        <fa :icon="['fas', 'arrow-left']" size="sm" ontouchend="" />
        <span class="ml-1 text-xm">戻る</span>
      </div>
    </header>
    <main class="flex-1 overflow-y-scroll">
      <v-calendar
        is-expanded
        disable-page-swipe
        class="max-w-full custom-calendar"
        :attributes="todos"
      >
        <template #day-content="{ day, attributes }">
          <div class="flex flex-col h-full z-10 overflow-hidden">
            <span class="day-label text-sm text-gray-900">{{ day.day }}</span>
            <div class="flex-grow overflow-y-auto overflow-x-auto">
              <p
                v-for="attr in attributes"
                :key="attr.key"
                class="text-xs leading-tight rounded-sm p-1 mt-0 mb-1 cursor-pointer truncate"
                :style="attr.customData.style"
                @click="showDialog(attr.key)"
              >
                {{ attr.customData.title }}
              </p>
            </div>
          </div>
        </template>
      </v-calendar>
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import ModalDialog from '@/components/ModalDialog.vue'
import { getStateColor } from '@/util/StateColor'
import { forDayEach } from '@/util/MomentEx.js'

const DialogController = Vue.extend(ModalDialog)

export default {
  name: 'Calendar',
  components: {
  },
  layout: 'board',
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    todos: {
      get () {
        const todos = this.$store.getters['todo/getOrderdTodos']

        return todos.filter(t => t.startdate !== null && t.enddate !== null)
          .map((t) => {
            const start = moment(t.startdate.toString()).toDate()
            const end = moment(t.enddate.toString()).toDate()
            const duration = []
            forDayEach(start, end, (target) => {
              duration.push(target)
            })

            return {
              key: t.id,
              customData: {
                title: t.title,
                style: getStateColor(t.state)
              },
              dates: duration
            }
          })
      }
    }
  },
  methods: {
    showDialog (id) {
      delete this.dialog

      const todo = this.$store.getters['todo/getTodoById'](id)
      const list = this.$store.getters['todolist/getLists']

      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todo,
          isCreateMode: false,
          projectList: list
        }
      })
      this.dialog.$on('update', (todo) => {
        this.$store.dispatch('todo/update', todo)
      })
      this.dialog.$on('delete', (todoId) => {
        this.$store.dispatch('todo/delete', todoId)
      })
      this.dialog.$mount()
    },
    backToList () {
      const listId = this.$store.getters['todo/getCurrentListId']
      this.$router.push(`/todolist/${listId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 0px;
}
::-webkit-scrollbar-track {
  display: none;
}

/deep/ .custom-calendar.vc-container {
  $day-border: 1px solid #b8c2cc;
  $day-border-highlight: 1px solid #b8c2cc;
  $day-width: 90px;
  $day-height: 90px;
  $weekday-bg: #f8fafc;
  $weekday-border: 1px solid #eaeaea;

  border-radius: 0;
  width: 100%;

  & .vc-header {
    background-color: #f1f5f8;
    padding: 10px 0;
  }
  & .vc-weeks {
    padding: 0;
  }
  & .vc-weekday {
    background-color: $weekday-bg;
    border-bottom: $weekday-border;
    padding: 5px 0;
  }
  & .vc-day {
    padding: 0 5px 3px 5px;
    text-align: left;
    height: $day-height;
    min-width: $day-width;
    background-color: white;
    & .weekday-1,
    & .weekday-7 {
      background-color: #eff8ff;
    }
    &:not(.on-bottom) {
      border-bottom: $day-border;
      &.weekday-1 {
        border-bottom: $day-border-highlight;
      }
    }
    &:not(.on-right) {
      border-right: $day-border;
    }
  }
  & .vc-day-dots {
    margin-bottom: 5px;
  }
}
</style>
