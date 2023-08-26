import orderBy from 'lodash/orderBy'
import { TaskState } from '@/util/TaskState'
import { CreateTodoDao, CreateHabitDao } from '@/dao'
import { dateFactory } from '@/util/DateFactory'
import { Todo } from '@/model/Todo'
import { Habit } from '@/model/Habit'

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

const DEFAULT_STATE = [TaskState.Todo.value, TaskState.InProgress.value]

/**
 * 習慣タスクの実績計算
 * @description 完了した場合は実績を更新、完了でなくなった場合は実績を戻す
 * @param {Habit} habit
 * @param {Todo} oldTodo
 * @param {Todo} newTodo
 * @return {{Habit, Number}} {habit, habitCounter}
 */
function calcHabitSummary (habit, oldTodo, newTodo) {
  const cloneHabit = Habit.valueOf(habit)

  let habitCounter = 0
  let lastActivityDate = oldTodo.lastActivityDate

  if (oldTodo.state === newTodo.state) {
    return { habit: cloneHabit, habitCounter }
  }

  if (newTodo.state === TaskState.Done.value) {
    habitCounter = 1
    lastActivityDate = dateFactory().getDateNumber()
  } else if (oldTodo.state === TaskState.Done.value) {
    // Doneから変更された場合はリセット
    habitCounter = -1
    lastActivityDate = oldTodo.lastActivityDate
  }

  cloneHabit.updateResult(newTodo.state === TaskState.Done.value)

  cloneHabit.totalActivityCount += habitCounter
  cloneHabit.duration += habitCounter
  cloneHabit.lastActivityDate = lastActivityDate

  return { habit: cloneHabit, habitCounter }
}

function checkSelected (state) {
  if (!state.selectedItem) {
    return
  }
  if (!state.todos.includes(v => v.id === state.selectedItem.id)) {
    state.selectedItem = null
  }
}

export const state = () => ({
  todos: [],
  selectedState: DEFAULT_STATE,
  editMode: false,
  listId: '',
  maxIndex: 0,
  selectedItem: null
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

  editMode: (state) => {
    return state.editMode
  },

  getSelectedState: (state) => {
    return state.selectedState
  },

  getCurrentListId: (state) => {
    return state.listId
  },

  size: (state) => {
    return state.todos.length
  },

  selectedItem: (state) => {
    return state.selectedItem
  },

  maxIndex: (state) => {
    return Math.max.apply(
      null,
      state.todos.map(e => e.orderIndex)
    )
  }
}

export const mutations = {
  init (state, payload) {
    state.selectedState = DEFAULT_STATE
    state.listId = payload.listId || ''
    state.todos = payload.data
    checkSelected(state)
  },

  select (state, target) {
    state.selectedItem = target
  },

  add (state, payload) {
    state.todos.push(payload)
    state.maxIndex += 1
  },

  delete (state, id) {
    const index = state.todos.findIndex(v => v.id === id)
    state.todos.splice(index, 1)
    checkSelected(state)
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

  updateDeadline (state, payload) {
    const todo = state.todos.find(v => v.id === payload.id)
    todo.startdate = payload.startdate
    todo.enddate = payload.enddate
  },

  updateListId (state, payload) {
    const index = state.todos.findIndex(v => v.id === payload.id)
    // プロジェクトの変更
    if (state.listId !== '' && state.listId !== payload.listId) {
      state.todos.splice(index, 1)
    }
    checkSelected(state)
  },

  deleteTodos (state, targetIds) {
    state.todos = state.todos.filter(t => targetIds.includes(t.id) === false)
    checkSelected(state)
  },

  changeFilter (state, payload) {
    state.selectedState = payload.data
  },

  switchEdit (state) {
    state.editMode = !state.editMode
  }
}

export const actions = {
  async init ({ commit }, listId) {
    // 描画初期化
    commit('init', { data: [], listId })
    commit('init', { data: await dao.getTodos(listId), listId })
  },

  initNewList ({ commit }, listId) {
    commit('init', { data: [], listId })
  },

  select ({ commit, dispatch, state }, id) {
    const target = state.todos.find(v => v.id === id) || null

    commit('select', target)
    dispatch('View/subPanelName', target ? 'todo-detail' : '', { root: true })
  },

  async initTodaylist ({ commit, rootGetters }) {
    // 描画初期化
    commit('init', { data: [], listId: '' })

    const today = dateFactory().getDateNumber() // YYYYMMDD
    // 1. 今日の習慣を取得
    const todaysHabits = rootGetters['Habit/getTodayList']
    // 2. 登録済の習慣のToDoを取得
    const habitTodos = await dao.getHabits(today)
    // 3. 1と2を比較して、2が存在しないものは、追加する
    const missinglist = todaysHabits.reduce((pre, _habit) => {
      // Habit.id === Todo.listId
      if (habitTodos.findIndex(v => v.listId === _habit.id) < 0) {
        const todo = new Todo('', {})
        todo.type = Todo.TYPE.HABIT
        todo.listId = _habit.id // habitのId
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
      habitTodos.push(...await dao.addHabits(missinglist))
    }

    const todos = []
    // 習慣タスク
    todos.push(...habitTodos)
    // 今日の残タスク
    todos.push(...await dao.getTodaysTask(today))
    // 今日完了したタスク
    todos.push(...await dao.getTodaysDone(today))

    commit('init', { data: todos, listId: '' })

    console.log('todaylist init')
  },

  async initInProgressList ({ commit, rootGetters }) {
    // 描画初期化
    commit('init', { data: [], listId: '' })

    const userId = rootGetters['User/userId']
    const today = dateFactory().getDateNumber() // YYYYMMDD

    commit('init', { data: await dao.getTaskInProgress(userId, today), listId: '' })

    console.log('wip init')
  },

  async changeOrder ({ commit, getters }, params) {
    const filtered = getters.getFilteredTodos
    const srcTodo = { ...filtered[params.oldIndex] }
    const destTodo = { ...filtered[params.newIndex] }

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
    const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

    if (newOrderIndex !== destTodo.orderIndex) {
      srcTodo.orderIndex = newOrderIndex
      if (await dao.update(srcTodo)) {
        commit('update', srcTodo)
      }
    }
  },

  async deleteDone ({ commit, state }) {
    const doneTodoIds = state.todos
      .filter(t => t.state === TaskState.Done.value)
      .map(t => t.id)

    if (await dao.deleteTodos(doneTodoIds)) {
      commit('deleteTodos', doneTodoIds)
    }
  },

  async deleteTodos ({ commit }, targetIds) {
    if (await dao.deleteTodos(targetIds)) {
      commit('deleteTodos', targetIds)
    }
  },

  changeFilter ({ commit }, options) {
    commit('changeFilter', { data: options })
  },

  switchEdit ({ commit }) {
    commit('switchEdit')
  },

  async add ({ commit, state, getters }, params) {
    if (getters.size + 1 > MAX_SIZE) {
      throw new Error('これ以上登録できません')
    }

    params.listId = state.listId
    params.stateChangeDate = dateFactory().getDateNumber()
    params.orderIndex = getters.size > 0 ? getters.maxIndex + 1 : 1
    const todo = await dao.add(params)
    commit('add', todo)
  },

  async delete ({ commit }, id) {
    if (await dao.delete(id)) {
      commit('delete', id)
    }
  },

  /**
   * @param {*} param0
   * @param {Array<{id: String, startdate: Number, enddate: Number}>} targets
   */
  async setDeadline ({ commit }, targets) {
    if (await dao.updateFields(targets)) {
      targets.forEach(t => commit('updateDeadline', t))
    }
  },

  /**
   * @param {*} param0
   * @param {Array<{id: String, listId: String}>} targets
   */
  async changeListId ({ commit }, targets) {
    if (await dao.updateFields(targets)) {
      targets.forEach(t => commit('updateListId', t))
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
      newTodo.stateChangeDate = dateFactory().getDateNumber()
    }

    if (newTodo.type === Todo.TYPE.HABIT) {
      if (!stateChanged) {
        // ステータス以外は変更できないため、更新しない
        return
      }
      const habit = rootGetters['Habit/getById'](newTodo.listId)
      if (!habit) {
        console.error('対象の習慣はすでに削除されています')
        throw new Error('更新に失敗しました')
      }
      const { habit: updatedHabit } = calcHabitSummary(habit, oldTodo, newTodo)

      await dao.update(newTodo)
      await CreateHabitDao().update(updatedHabit)

      commit('update', newTodo)
      commit('Habit/update', updatedHabit, { root: true })
    } else {
      if (await dao.update(newTodo)) {
        commit('update', newTodo)
      }
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
    newTodo.stateChangeDate = dateFactory().getDateNumber()

    if (newTodo.type === Todo.TYPE.HABIT) {
      const habit = rootGetters['Habit/getById'](newTodo.listId)
      if (!habit) {
        console.error('対象の習慣はすでに削除されています')
        throw new Error('更新に失敗しました')
      }
      const { habit: updatedHabit } = calcHabitSummary(habit, oldTodo, newTodo)

      await dao.update(newTodo)
      await CreateHabitDao().update(updatedHabit)

      commit('update', newTodo)
      commit('Habit/update', updatedHabit, { root: true })
    } else {
      if (await dao.update(newTodo)) {
        commit('update', newTodo)
      }
    }
  }
}
