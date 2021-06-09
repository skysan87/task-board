import orderBy from 'lodash/orderBy'
import { TaskState } from '@/util/TaskState'
import { CreateTodoDao } from '@/dao'
import { getDateNumber } from '@/util/MomentEx'
import { Todo } from '@/model/Todo'

const dao = CreateTodoDao()

const MAX_SIZE = process.env.MAX_SIZE_TODO || 50

function getFilteredArray (array, option, isAllSelected) {
  if (isAllSelected === false) {
    return array.filter((el) => {
      return option.includes(el.state)
    })
  } else {
    // new array
    return array.concat()
  }
}

/**
 * 習慣タスクの実績計算
 * @description 完了した場合は実績を更新、完了でなくなった場合は実績を戻す
 * @param {Habit} habit
 * @param {Todo} oldTodo
 * @param {Todo} newTodo
 * @return {{Habit, Number}} {habit, habitCounter}
 */
function calcHabitSummary (habit, oldTodo, newTodo) {
  let habitCounter = 0
  let lastActivityDate = oldTodo.lastActivityDate

  if (oldTodo.state === newTodo.state) {
    return { habit, habitCounter }
  }

  if (newTodo.state === TaskState.Done.value) {
    habitCounter = 1
    lastActivityDate = getDateNumber()
  } else if (oldTodo.state === TaskState.Done.value) {
    // Doneから変更された場合はリセット
    habitCounter = -1
    lastActivityDate = oldTodo.lastActivityDate
  }

  habit.updateResult(newTodo.state === TaskState.Done.value)

  habit.totalActivityCount += habitCounter
  habit.duration += habitCounter
  habit.lastActivityDate = lastActivityDate

  return { habit, habitCounter }
}

export const state = () => ({
  todos: [],
  selectedState: [TaskState.Todo.value, TaskState.InProgress.value],
  canRemove: false,
  listId: ''
})

export const getters = {
  // NOTE:引数あり=メソッドスタイルアクセスの場合、キャッシュされない
  getFilteredTodos: (state) => {
    const selectedCount = state.selectedState.length
    const selectAll = Object.values(TaskState).length === selectedCount
    const filterd = getFilteredArray(
      state.todos,
      state.selectedState,
      selectAll
    )
    return orderBy(filterd, ['type', 'listId', 'orderIndex'])
  },

  getOrderdTodos: (state) => {
    return orderBy(state.todos, ['type', 'listId', 'orderIndex'])
  },

  getTodoById: state => (id) => {
    const index = state.todos.findIndex(v => v.id === id)
    return state.todos[index]
  },

  getTaskCount: state => (taskState) => {
    return state.todos.filter((el) => {
      return taskState === -1 ? true : el.state === taskState
    }).length
  },

  canRemove: (state) => {
    return state.canRemove
  },

  getSelectedState: (state) => {
    return state.selectedState
  },

  getCurrentListId: (state) => {
    return state.listId
  },

  size: (state) => {
    return state.todos.length
  }
}

// 状態の更新
export const mutations = {
  init (state, payload) {
    state.selectedState = [TaskState.Todo.value, TaskState.InProgress.value]
    state.listId = payload.listId
    state.todos = payload.data
  },

  initToday (state, payload) {
    state.listId = ''
    state.todos = payload.data
  },

  add (state, payload) {
    state.todos.push(payload)
  },

  delete (state, id) {
    const index = state.todos.findIndex(v => v.id === id)
    state.todos.splice(index, 1)
  },

  update (state, payload) {
    const index = state.todos.findIndex(v => v.id === payload.id)

    // プロジェクトの変更
    if (state.listId !== '' && state.listId !== payload.listId) {
      state.todos.splice(index, 1)
      return
    }

    Object.assign(state.todos[index], payload)
  },

  deleteDone (state) {
    const options = [TaskState.Todo.value, TaskState.InProgress.value]
    state.todos = getFilteredArray(state.todos, options, false)
  },

  changeFilter (state, payload) {
    state.selectedState = payload.data
  },

  switchEdit (state) {
    state.canRemove = !state.canRemove
  }
}

// データの加工、非同期処理
export const actions = {
  async init ({ commit }, listId) {
    // 描画初期化
    commit('init', { data: [], listId })
    commit('init', { data: await dao.getTodos(listId), listId })
  },

  initNewList ({ commit }, listId) {
    commit('init', { data: [], listId })
  },

  async initTodaylist ({ commit, dispatch, rootGetters }) {
    // 描画初期化
    commit('initToday', { data: [] })

    const today = getDateNumber() // YYYYMMDD
    // 1. 今日の習慣を取得
    // NOTE: /todayは初期ページ
    await dispatch('Habit/init', null, { root: true })
    const todaysHabits = rootGetters['Habit/getTodayList']
    // 2. 習慣のToDoをサーバーから取得
    const habitTodos = await dao.getHabits(today)
    // 3. 1と2を比較して、2が存在しないものは、追加する
    const missinglist = todaysHabits.reduce((pre, _habit) => {
      // Habit.id === Todo.listId
      if (habitTodos.findIndex(v => v.listId === _habit.id) < 0) {
        const todo = new Todo('', {})
        todo.type = 'habit'
        todo.listId = _habit.id // habitsのサブコレクションのId
        todo.title = _habit.title
        todo.detail = _habit.detail
        todo.lastActivityDate = _habit.lastActivityDate
        todo.startdate = today
        todo.enddate = today
        todo.orderIndex = _habit.orderIndex
        pre.push(todo)
      }
      return pre
    }, [])
    // 4. 追加
    if (missinglist.length > 0) {
      const newhabitToDos = await dao.addHabits(missinglist)
      habitTodos.push(...newhabitToDos)
    }

    const todos = []
    // 習慣タスク
    todos.push(...habitTodos)
    // 今日の残タスク
    todos.push(...await dao.getTodaysTask(today))
    // 今日完了したタスク
    todos.push(...await dao.getTodaysDone(today))
    commit('initToday', { data: todos })

    console.log('todaylist init')
  },

  async changeOrder ({ commit, getters }, params) {
    const filtered = getters.getFilteredTodos
    // let srcTodo, destTodo
    // Object.assign(srcTodo, filtered[params.oldIndex])
    // Object.assign(destTodo, filtered[params.newIndex])

    const srcTodo = filtered[params.oldIndex]
    const destTodo = filtered[params.newIndex]

    const sorted = getters.getOrderdTodos
    const actualNewIndex = sorted.findIndex(v => v.id === destTodo.id)

    let prevOrderIndex, nextOrderIndex
    if (params.oldIndex > params.newIndex) {
      // 上へ移動
      // newIndexにあったアイテムは下に移動する
      if (actualNewIndex > 0) {
        prevOrderIndex = sorted[actualNewIndex - 1].orderIndex
      } else {
        prevOrderIndex = 1
      }
      nextOrderIndex = destTodo.orderIndex
    } else {
      // 下へ移動
      // newIndexにあったアイテムは上に移動する
      prevOrderIndex = destTodo.orderIndex
      if (filtered.length - 1 > actualNewIndex) {
        nextOrderIndex = sorted[actualNewIndex + 1].orderIndex
      } else {
        nextOrderIndex = Math.ceil(destTodo.orderIndex) + 1
      }
    }

    // NOTE: 並び替えは前後のorderから算出
    //  firebaseで複雑なsortができないため
    const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

    if (newOrderIndex !== destTodo.orderIndex) {
      const item = new Todo('', {})
      Object.assign(item, srcTodo)
      item.orderIndex = newOrderIndex
      if (await dao.update(item)) {
        commit('update', item)
      }
    }
  },

  async deleteDone ({ commit, state }) {
    if (await dao.deleteTodos(state.todos, TaskState.Done)) {
      commit('deleteDone')
    }
  },

  changeFilter ({ commit }, options) {
    commit('changeFilter', { data: options })
  },

  switchEdit ({ commit }) {
    commit('switchEdit')
  },

  add ({ commit, state, getters }, params) {
    return new Promise((resolve, reject) => {
      if (getters.size + 1 > MAX_SIZE) {
        reject(new Error('これ以上登録できません'))
        return
      }
      params.stateChangeDate = getDateNumber()
      dao.add(state.listId, params)
        .then((result) => {
          if (result.isSuccess) {
            commit('add', result.value)
            resolve()
          } else {
            reject(new Error('登録に失敗しました'))
          }
        })
    })
  },

  async delete ({ commit }, id) {
    if (await dao.delete(id)) {
      commit('delete', id)
    }
  },

  /**
     * タスクの更新
     * @param {*} context
     * @param {Todo} newTodo
     */
  async update ({ commit, getters, rootGetters }, newTodo) {
    const oldTodo = getters.getTodoById(newTodo.id)
    const stateChanged = oldTodo.state !== newTodo.state
    if (stateChanged) {
      newTodo.stateChangeDate = getDateNumber()
    }

    if (newTodo.type === 'habit') {
      if (!stateChanged) {
        // ステータス以外は変更できないため、更新しない
        return
      }
      const habit = rootGetters['habit/getById'](newTodo.listId)
      const { habit: updatedHabit, habitCounter } = calcHabitSummary(habit, oldTodo, newTodo)

      if (await dao.updateHabit(newTodo, updatedHabit, habitCounter)) {
        commit('update', newTodo)
        commit('habit/update', updatedHabit, { root: true })
      }
    } else if (await dao.update(newTodo)) {
      commit('update', newTodo)
    }
  },

  /**
     * タスクのステータス更新
     * @param {*} context
     * @param {String} id Todo.id
     */
  async changeState ({ commit, state, rootGetters }, id) {
    const index = state.todos.findIndex(v => v.id === id)
    if (index < 0) {
      return
    }

    const oldTodo = state.todos[index]
    const newTodo = new Todo('', {})
    Object.assign(newTodo, oldTodo)

    switch (oldTodo.state) {
      case TaskState.Todo.value:
        newTodo.state = TaskState.InProgress.value
        break
      case TaskState.InProgress.value:
        newTodo.state = TaskState.Done.value
        break
      case TaskState.Done.value:
        newTodo.state = TaskState.Todo.value
        break
    }
    newTodo.stateChangeDate = getDateNumber()

    if (newTodo.type === 'habit') {
      const habit = rootGetters['habit/getById'](newTodo.listId)
      const { habit: updatedHabit, habitCounter } = calcHabitSummary(habit, oldTodo, newTodo)

      if (await dao.updateHabit(newTodo, updatedHabit, habitCounter)) {
        commit('update', newTodo)
        commit('habit/update', updatedHabit, { root: true })
      }
    } else if (await dao.update(newTodo)) {
      commit('update', newTodo)
    }
  }
}
