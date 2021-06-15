<template>
  <transition name="layout" mode="out-in">
    <div class="app-container">
      <div class="app-top_nav bg-green-400 text-center">
        {{ globalMessage }}
      </div>
      <div class="app-workspace-layout">
        <div class="app-workspace__sidebar">
          <div class="app-workspace__task_sidebar flex flex-col flex-none bg-gray-800 pt-3 text-gray-500">
            <div
              class="flex justify-between items-center px-4 cursor-pointer pb-1"
              @click.left="(isMenuExpanded = !isMenuExpanded)"
            >
              <h1 class="font-semibold text-xl leading-tight">
                <span>To-Do List</span>
                <span class="pl-1 text-xs">v{{ appVersion }}</span>
              </h1>
              <fa :icon="['fas', 'caret-down']" :class="{'fa-rotate-180': isMenuExpanded}" />
            </div>
            <div v-show="isMenuExpanded" class="flex-none">
              <!-- <a class="block px-6 pt-1 hover:bg-blue-800 hover:opacity-75 cursor-pointer" @click.left="logout">
                <fa :icon="['fas', 'sign-out-alt']" size="lg" class="text-gray-600" />
                <span class="pl-1">ログアウト</span>
              </a> -->
            </div>

            <!-- border -->
            <div class="border-b border-gray-600 pt-1" />

            <div class="flex-1 py-4 overflow-y-scroll scrollable-container">
              <div class="mt-5 px-4 flex items-center">
                <div class="font-bold text-lg">
                  今日の予定
                </div>
              </div>
              <div
                v-for="filter in todayFilters"
                :key="filter.value"
                class="py-1 px-5 cursor-pointer hover:bg-blue-700 hover:opacity-75"
                :class="{'bg-blue-700' : (selectedType === viewType.Today && selectedTodayFilter === filter.value)}"
                @click.left="onSelectToday(filter.value)"
              >
                # {{ filter.label }}
              </div>
              <div class="mt-5 px-4 flex justify-between items-center">
                <div class="font-bold text-lg">
                  プロジェクト
                </div>
                <fa :icon="['far', 'plus-square']" class="cursor-pointer" @click.left="openListDialog" />
              </div>
              <div
                v-for="todolist in todolists"
                :key="todolist.id"
                class="py-1 flex justify-between items-center hover:bg-blue-700 hover:opacity-75"
                :class="{'bg-blue-700' : (selectedType === viewType.Todo && currentListId == todolist.id)}"
                @mouseover="activeItemId = todolist.id"
                @mouseout="activeItemId = ''"
              >
                <div
                  class="px-5 flex-1 cursor-pointer"
                  @click.left="onSelectList(todolist.id)"
                >
                  # {{ todolist.title }}
                </div>
                <div
                  class="flex-none m-0 pr-4 opacity-0"
                  :class="{'opacity-100': activeItemId === todolist.id}"
                  @click.left.prevent="editTodolist(todolist.id)"
                >
                  <fa :icon="['fas', 'edit']" size="xs" class="cursor-pointer" />
                </div>
              </div>
              <div class="mt-5 px-4 flex justify-between items-center">
                <div class="font-bold text-lg">
                  習慣
                </div>
              </div>
              <nuxt-link to="/habit">
                <div
                  v-for="habitfilter in habitFilters"
                  :key="habitfilter.value"
                  class="py-1 px-5 cursor-pointer  hover:bg-blue-700 hover:opacity-75"
                  :class="{'bg-blue-700' : (selectedType === viewType.Habit && currentFilter === habitfilter.value)}"
                  @click.left="onSelectHabit(habitfilter.value)"
                >
                  # {{ habitfilter.label }}
                </div>
              </nuxt-link>
              <div class="mt-5 px-4 flex justify-between items-center">
                <div class="font-bold text-lg">
                  設定
                </div>
              </div>
              <div
                class="py-1 px-5 cursor-pointer text-sm hover:bg-blue-700 hover:opacity-75"
                @click.left="updateHeaderText"
              >
                ヘッダーメッセージ
              </div>
            </div>
          </div>
        </div>
        <div class="app-workspace__view">
          <nuxt />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import NewListDialog from '@/components/NewListDialog'
import InputDialog from '@/components/InputDialog'
import { HabitFilter } from '@/util/HabitFilter'
import { TodayFilter } from '@/util/TodayFilter'
import Db from '@/plugins/db'

const DialogController = Vue.extend(NewListDialog)
const InputDialogController = Vue.extend(InputDialog)
const viewType = { Todo: 0, Habit: 1, Today: 2 }

export default {
  data () {
    return {
      isMenuExpanded: false,
      habitFilters: Object.values(HabitFilter),
      todayFilters: Object.values(TodayFilter),
      viewType,
      selectedTodayFilter: '',
      activeItemId: '',
      dialog: null,
      inputDialog: null,
      currentListId: '',
      appVersion: process.env.app_version
    }
  },
  computed: {
    todolists: {
      get () {
        return this.$store.getters['Todolist/getLists']
      },
      // eslint-disable-next-line
      set(value) {
        // vuedraggable用
      }
    },
    currentFilter: {
      get () {
        return this.$store.getters['Habit/getCurrentFilter']
      }
    },
    globalMessage: {
      get () {
        const config = this.$store.getters['Config/getConfig']
        return config !== null ? config.globalMessage : ''
      }
    },
    selectedType: {
      get () {
        if (this.$route.name.startsWith('todolist')) {
          return viewType.Todo
        } else if (this.$route.name.startsWith('habit')) {
          return viewType.Habit
        } else {
          return viewType.Today
        }
      }
    }
  },
  async mounted () {
    await Db.init()
    await this.$store.dispatch('Config/init')
    await this.$store.dispatch('Habit/init')
    await this.$store.dispatch('Todolist/init')
    // TODO: 選択されている: selectedTodayFilter
  },
  methods: {
    onSelectToday (filter) {
      this.selectedTodayFilter = filter
      this.$router.push(`/today/${filter}`)
    },
    onSelectList (id) {
      this.currentListId = id
      this.$router.push(`/todolist/${id}`)
    },
    onSelectHabit (filter) {
      this.$store.dispatch('Habit/changeFilter', filter)
    },
    openListDialog () {
      delete this.dialog
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          isCreateMode: true
        }
      })
      this.dialog.$on('add', this.addList)
      this.dialog.$mount()
    },
    editTodolist (listId) {
      delete this.dialog
      const todolist = this.$store.getters['Todolist/getListById'](listId)
      this.dialog = new DialogController({
        propsData: {
          parent: this.$root.$el,
          target: todolist,
          isCreateMode: false
        }
      })
      this.dialog.$on('add', (todolist) => {
        this.$store.dispatch('Todolist/update', todolist)
      })
      this.dialog.$on('deleteList', () => {
        this.$store.dispatch('Todolist/delete', listId)
          .then(() => {
            // 先頭のリストに遷移
            const firstListId = this.$store.getters['Todolist/getFistListId']
            this.currentListId = firstListId
            this.$router.push(`/todolist/${firstListId}`)
          })
          .catch((error) => {
            this.$toast.error(error.message)
          })
      })
      this.dialog.$mount()
    },
    addList (todolist) {
      this.$store.dispatch('Todolist/add', todolist.getData())
        .then(() => {
          this.$toast.success('新しいプロジェクトを登録しました')
          // 新規作成画面に遷移
          const listId = this.$store.getters['Todo/getCurrentListId']
          this.currentListId = listId
          this.$router.push(`/todolist/${listId}`)
        })
        .catch((error) => {
          this.$toast.error(error.message)
        })
    },
    updateHeaderText () {
      delete this.inputDialog
      this.inputDialog = new InputDialogController({
        propsData: {
          parent: this.$root.$el,
          title: 'ヘッダーメッセージを変更',
          message: this.globalMessage
        }
      })
      this.inputDialog.$on('update', (message) => {
        this.$store.dispatch('Config/updateMessage', message)
      })
      this.inputDialog.$mount()
    }
  }
}
</script>

<style scoped>
.scrollable-container {
  /* IE, Edge */
  -ms-overflow-style: none;
  /* Firefox */
  scrollbar-width: none;
}

.scrollable-container::-webkit-scrollbar {
  /* Chrome, Safari */
  display: none;
}

.app-container {
  display: grid;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  grid-template-rows: min-content auto;
  grid-template-areas:
    "app-container__top-nav"
    "app-container__workspace";
}

.app-top_nav {
  grid-area: app-container__top-nav;
}

.app-workspace-layout {
  grid-area: app-container__workspace;
  display: grid;
  overflow: hidden;
  grid-template-columns: 230px calc(100% - 230px);
  grid-template-rows: 100%;
  grid-template-areas:
    "app-workspace__sidebar app-workspace__view";
}

.app-workspace__sidebar {
  grid-area: app-workspace__sidebar;

  display: grid;
  grid-template-columns: auto;
  grid-template-areas:
    "app-workspace__task_sidebar";
  grid-template-rows: auto;
  overflow: hidden;
}

.app-workspace__task_sidebar {
  grid-area: app-workspace__task_sidebar;
  width: 100%;
  min-height: 0;
  height: auto;
}

.app-workspace__view {
  grid-area: app-workspace__view;
}
</style>
