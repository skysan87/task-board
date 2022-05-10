import orderBy from 'lodash/orderBy'
import { CreateTodolistDao, CreateTodoDao } from '@/dao'
import { Todolist } from '@/model/Todolist'

const dao = CreateTodolistDao()

const MAX_SIZE = process.env.MAX_SIZE_TODOLIST || 5

export const state = () => ({
  maxIndex: 0,
  lists: []
})

export const getters = {
  getLists: (state) => {
    return orderBy(state.lists, 'orderIndex')
  },

  getFistListId: (state) => {
    return state.lists[0].id
  },

  getListName: state => (id) => {
    const index = state.lists.findIndex(v => v.id === id)
    return index >= 0 ? state.lists[index].title : ''
  },

  getListById: state => (id) => {
    const index = state.lists.findIndex(v => v.id === id)
    return state.lists[index]
  },

  size: (state) => {
    return state.lists.length
  }
}

export const mutations = {
  init (state, payload) {
    state.lists = payload
    if (payload !== null && payload.length > 0) {
      // リストはそれほど増えないので、毎回計算する
      state.maxIndex = Math.max.apply(
        null,
        payload.map(e => e.orderIndex)
      )
    }
  },

  add (state, payload) {
    state.lists.push(payload)
    state.maxIndex += 1
  },

  update (state, payload) {
    const index = state.lists.findIndex(v => v.id === payload.id)
    Object.assign(state.lists[index], payload)
  },

  delete (state, id) {
    const index = state.lists.findIndex(v => v.id === id)
    state.lists.splice(index, 1)
  }
}

export const actions = {
  async init ({ commit }) {
    const lists = await dao.getLists()

    if (lists.length > 0) {
      commit('init', lists)
    } else {
      // Add First List
      const list = new Todolist('', { title: 'inbox' })
      const todolist = await dao.add(list.getData(), 1)
      commit('init', [todolist])
    }
    console.log('todolist init')
  },

  async add ({ commit, dispatch, state, getters }, params) {
    if (getters.size + 1 > MAX_SIZE) {
      throw new Error('これ以上登録できません')
    }

    const todolist = await dao.add(params, state.maxIndex + 1)
    commit('add', todolist)
    dispatch('Todo/initNewList', todolist.id, { root: true })
  },

  async update ({ commit }, list) {
    if (await dao.update(list)) {
      commit('update', list)
    }
  },

  async changeOrder ({ commit, getters }, params) {
    const sorted = getters.getLists
    const srcTodolist = sorted[params.oldIndex]
    const destTodolist = sorted[params.newIndex]

    const actualNewIndex = sorted.findIndex(v => v.id === destTodolist.id)

    let prevOrderIndex, nextOrderIndex
    if (params.oldIndex > params.newIndex) {
      // 上へ移動
      // newIndexにあったアイテムは下に移動する
      if (actualNewIndex > 0) {
        prevOrderIndex = sorted[actualNewIndex - 1].orderIndex
      } else {
        prevOrderIndex = 1
      }
      nextOrderIndex = destTodolist.orderIndex
    } else {
      // 下へ移動
      // newIndexにあったアイテムは上に移動する
      prevOrderIndex = destTodolist.orderIndex
      if (sorted.length - 1 > actualNewIndex) {
        nextOrderIndex = sorted[actualNewIndex + 1].orderIndex
      } else {
        nextOrderIndex = Math.ceil(destTodolist.orderIndex) + 1
      }
    }

    // NOTE: 並び替えは前後のorderから算出
    //  firebaseで複雑なsortができないため
    const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

    if (newOrderIndex !== destTodolist.orderIndex) {
      srcTodolist.orderIndex = newOrderIndex
      if (await dao.update(srcTodolist)) {
        commit('update', srcTodolist)
      }
    }
  },

  async delete ({ commit, getters }, id) {
    if (getters.size <= 1) {
      throw new Error('これ以上削除できません')
    }

    if (await dao.delete(id)) {
      const todoDao = CreateTodoDao()
      const todos = await todoDao.getTodos(id)
      await todoDao.deleteTodos(todos.map(v => v.id))
      commit('delete', id)
    }
  }
}
