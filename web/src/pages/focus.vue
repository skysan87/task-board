<template>
  <div class="">
    <div v-if="todo !== null">
      <div v-if="!miniMode" class="flex flex-col p-2 bg-green-100 h-screen overflow-hidden">
        <!-- コントロールボタン -->
        <div class="flex-none">
          <button class="btn btn-regular ml-2" @click="$router.push('/today/schedule')">
            戻る
          </button>
          <button class="btn btn-regular ml-2" @click="showMiniView">
            Minimize
          </button>
          <button title="タスクを終了" class="btn btn-red-outline ml-2" @click="finishTask">
            完了
          </button>
        </div>
        <div class="flex-1 overflow-y-scroll">
          <!-- 詳細モード -->
          <div class="mx-2">
            <div v-if="projectTitle !== ''" class="my-4">
              <label class="input-label">プロジェクト</label>
              <div>
                <span class="input-text">{{ projectTitle }}</span>
              </div>
            </div>

            <div class="my-4">
              <label class="input-label">タイトル</label>
              <div>
                <span class="input-text">{{ todo.title }}</span>
              </div>
            </div>

            <expand-panel class="my-4" right>
              <template #title>
                <label class="input-label">説明</label>
              </template>
              <template #component>
                <pre class="input-text">{{ todo.detail }}</pre>
              </template>
            </expand-panel>

            <div class="my-4">
              <label class="input-label">チェックリスト ({{ subtaskDoneCount }}/{{ todo.subTasks.length }})</label>
              <div
                v-for="subtask in todo.subTasks"
                :key="subtask.id"
                class="flex items-center"
              >
                <label class="flex items-center">
                  <input
                    v-model="subtask.isDone"
                    :disabled="subtask.isDone"
                    type="checkbox"
                    class="pl-1 flex-none"
                    @change="finishSubtask(subtask.id)"
                  >
                  <span class="break-all text-left px-1 flex-1">{{ subtask.title }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- コンパクトモード -->
      <div v-else class="bg-red-100 flex items-center px-2 w-full h-screen overflow-hidden">
        <div class="flex-none">
          <span title="通常モード" class="p-1" @click="showNormalView">
            <fa :icon="['fas', 'up-right-and-down-left-from-center']" />
          </span>
        </div>
        <div class="flex-1 pl-2">
          <div class="break-all text-2xl" :title="todo.title">
            {{ todo.title }}
          </div>
          <div v-if="currentSubTask !== null">
            <button class="btn btn-outline break-all ml-1" @click="finishSubtask(currentSubTask.id)">
              {{ currentSubTask.title }}
            </button>
            <div>({{ subtaskDoneCount }}/{{ todo.subTasks.length }})</div>
          </div>
        </div>
        <div class="flex-none">
          <button title="タスクを終了" class="btn btn-red-outline" @click="finishTask">完了</button>
        </div>
      </div>
    </div>

    <div v-else class="p-2 h-screen overflow-hidden flex justify-center items-center">
      <div class="flex items-center">
        <button class="btn btn-red-outline" @click="$router.push('/today/schedule')">戻る</button>
        <span class="text-2xl pl-2">登録されたタスクがありません。</span>
      </div>
    </div>
  </div>
</template>

<script>
import { TaskState } from '@/util/TaskState'
import { Todo } from '@/model/Todo'
import ExpandPanel from '@/components/parts/ExpandPanel.vue'

export default {
  name: 'Focus',

  components: {
    ExpandPanel
  },

  layout: 'base',

  data () {
    return {
      todo: null,
      sortedTasks: [],
      options: Object.values(TaskState),
      projectTitle: '',
      miniMode: false,
      currentSubTask: null
    }
  },

  computed: {
    subtaskDoneCount () {
      return this.todo.subTasks.filter(t => t.isDone).length
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    initialize () {
      // スケジュールされたタスク(開始時刻順)
      const schedule = Array.from(this.$store.getters['Event/getEvent'].tasks)
        .sort((a, b) => a.startTime - b.startTime)

      if (schedule.length === 0) {
        return
      }

      const tasks = this.$store.getters['Todo/getOrderdTodos']
      // 未完了のタスク
      schedule.forEach((s) => {
        const t = tasks.find(t => t.id === s.id)
        if (t && t.state !== TaskState.Done.value) {
          this.sortedTasks.push(Todo.valueOf(t))
        }
      })

      // 実施するタスク
      if (!this.showNextTask(true)) {
        return
      }

      // 実施するサブタスク
      this.showNextSubTask()

      const project = this.$store.getters['Todolist/getLists']
        .find(v => v === this.todo.listId)
      this.projectTitle = !project ? '' : project.title
    },

    finishSubtask (subTaskId) {
      this.todo.subTasks[subTaskId].isDone = true
      this.$store.dispatch('Todo/update', Todo.valueOf(this.todo))

      // 次のサブタスクを表示する
      if (!this.showNextSubTask()) {
        this.finishTask()
      }
    },

    finishTask () {
      // ステータスを完了にし、次のタスクを表示
      this.todo.state = TaskState.Done.value
      this.$store.dispatch('Todo/update', Todo.valueOf(this.todo))

      if (this.showNextTask(false)) {
        this.showNextSubTask()
      } else {
        this.$toast.info('タスクが全て完了しました')
      }
    },

    showNextTask (first) {
      if (!first) {
        this.sortedTasks.splice(0, 1)
      }
      if (this.sortedTasks.length > 0) {
        this.todo = this.sortedTasks[0]
        return true
      } else {
        this.todo = null
        return false
      }
    },

    showNextSubTask () {
      const subtaskIndex = this.todo.subTasks.findIndex(e => e.isDone === false)
      if (subtaskIndex >= 0) {
        this.currentSubTask = { id: subtaskIndex, ...this.todo.subTasks[subtaskIndex] }
        return true
      } else {
        this.currentSubTask = null
        return false
      }
    },

    showNormalView () {
      this.miniMode = false
      // TODO: メインメソッドに切り替え通知
    },

    showMiniView () {
      this.miniMode = true
      // TODO: メインメソッドに切り替え通知
    }
  }
}
</script>

<style>

</style>
