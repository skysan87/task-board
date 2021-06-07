import orderBy from 'lodash/orderBy'
import { CreateTodolistDao } from '@/dao'
import { Todolist } from '@/model/Todolist'

const dao = CreateTodolistDao()

const MAX_SIZE = process.env.MAX_SIZE_TODOLIST || 5

export default {
  namespaced: true,
  listId: null,
  state () {
    return {
      maxIndex: 0,
      lists: []
    }
  },

  getters: {
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
  },

  mutations: {
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
  },

  actions: {
    async init ({ commit }) {
      const lists = await dao.getLists()

      if (lists.length > 0) {
        commit('init', lists)
        // dispatch('todo/init', lists[0].id, { root: true })
      } else {
        // Add First List
        const list = new Todolist('', { title: 'inbox' })
        const result = await dao.add(list.getData(), 1)
        if (result.isSuccess) {
          commit('init', [result.value])
          // dispatch('todo/init', result.value.id, { root: true })
        }
      }
      console.log('todolist init')
    },

    add ({ commit, dispatch, state, getters }, params) {
      return new Promise((resolve, reject) => {
        if (getters.size + 1 > MAX_SIZE) {
          reject(new Error('これ以上登録できません'))
          return
        }

        dao.add(params, state.maxIndex + 1).then((result) => {
          if (result.isSuccess) {
            commit('add', result.value)
            dispatch('todo/initNewList', result.value.id, { root: true })
            resolve()
          } else {
            reject(new Error('登録に失敗しました'))
          }
        })
      })
    },

    async update ({ commit }, list) {
      const isSuccess = await dao.update(list)
      if (isSuccess) {
        commit('update', list)
      }
    },

    delete ({ commit, state }, id) {
      return new Promise((resolve, reject) => {
        if (state.lists.length <= 1) {
          reject(new Error('これ以上削除できません'))
          return
        }

        if (dao.delete(id)) {
          commit('delete', id)
          resolve()
        } else {
          reject(new Error('削除できませんでした'))
        }
      })
    }
  }
}
