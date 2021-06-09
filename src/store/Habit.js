import orderBy from 'lodash/orderBy'
import { CreateHabitDao } from '@/dao'
import { HabitFilter } from '@/util/HabitFilter'

const dao = CreateHabitDao()

const MAX_SIZE = process.env.MAX_SIZE_HABIT || 7

export const state = () => ({
  habits: [],
  rootId: '',
  filterId: HabitFilter.Today.value
})

export const getters = {
  getList: (state) => {
    let fileteredArray = []
    if (state.filterId === HabitFilter.Today.value) {
      fileteredArray = state.habits.filter(h => HabitFilter.Today.filter(h))
    } else if (state.filterId === HabitFilter.OnlyActive.value) {
      fileteredArray = state.habits.filter(h => HabitFilter.OnlyActive.filter(h))
    } else {
      fileteredArray = state.habits
    }
    return orderBy(fileteredArray, 'orderIndex')
  },

  getTodayList: (state) => {
    return orderBy(
      state.habits.filter(h => HabitFilter.Today.filter(h))
      , 'orderIndex')
  },

  getOrderdList: (state) => {
    return orderBy(state.habits, 'orderIndex')
  },

  getById: state => (id) => {
    const index = state.habits.findIndex(v => v.id === id)
    return state.habits[index]
  },

  getCurrentFilter: (state) => {
    return state.filterId
  },

  getRootId: (state) => {
    return state.rootId
  },

  size: (state) => {
    return state.habits.length
  }
}

export const mutations = {
  init (state, params) {
    state.rootId = params.rootId
    state.habits = params.habits
  },

  add (state, habit) {
    state.habits.push(habit)
  },

  update (state, habit) {
    const index = state.habits.findIndex(v => v.id === habit.id)
    Object.assign(state.habits[index], habit)
  },

  delete (state, id) {
    const index = state.habits.findIndex(v => v.id === id)
    state.habits.splice(index, 1)
  },

  changeFilter (state, filterId) {
    state.filterId = filterId
  }
}

export const actions = {
  async init ({ commit }) {
    const info = await dao.getInfo()

    if (info.length > 0) {
      const habitlist = info[0]
      const habits = await dao.get(habitlist.id)
      habits.forEach((h) => {
        h.updateSummary()
      })

      // server update
      await dao.updateSummary(habits)

      commit('init',
        {
          habits,
          rootId: habitlist.id
        })
    } else {
      // Add First List
      const result = await dao.addInfo()
      if (result.isSuccess) {
        commit('init', {
          habits: [],
          rootId: result.value.id
        })
      }
    }
    console.log('habit init')
  },

  add ({ commit, getters }, params) {
    return new Promise((resolve, reject) => {
      if (getters.size + 1 > MAX_SIZE) {
        reject(new Error('これ以上登録できません'))
        return
      }
      dao.add(params).then((result) => {
        if (result.isSuccess) {
          commit('add', result.value)
          resolve()
        } else {
          reject(new Error('登録に失敗しました'))
        }
      })
    })
  },

  async update ({ commit }, habit) {
    if (await dao.update(habit)) {
      commit('update', habit)
    }
  },

  async delete ({ commit }, habit) {
    if (await dao.delete(habit)) {
      commit('delete', habit.id)
    }
  },

  changeFilter ({ commit }, filterId) {
    commit('changeFilter', filterId)
  },

  async changeOrder ({ commit, getters }, params) {
    const filtered = getters.getList
    const src = filtered[params.oldIndex]
    const dest = filtered[params.newIndex]

    const sorted = getters.getOrderdList
    const actualNewIndex = sorted.findIndex(v => v.id === dest.id)

    let prevOrderIndex, nextOrderIndex
    if (params.oldIndex > params.newIndex) {
      // 上へ移動
      // newIndexにあったアイテムは下に移動する
      if (actualNewIndex > 0) {
        prevOrderIndex = sorted[actualNewIndex - 1].orderIndex
      } else {
        prevOrderIndex = 1
      }
      nextOrderIndex = dest.orderIndex
    } else {
      // 下へ移動
      // newIndexにあったアイテムは上に移動する
      prevOrderIndex = dest.orderIndex
      if (filtered.length - 1 > actualNewIndex) {
        nextOrderIndex = sorted[actualNewIndex + 1].orderIndex
      } else {
        nextOrderIndex = Math.ceil(dest.orderIndex) + 1
      }
    }

    // NOTE: 並び替えは前後のorderから算出
    //  firebaseで複雑なsortができないため
    const newOrderIndex = (prevOrderIndex + nextOrderIndex) / 2

    if (newOrderIndex !== dest.orderIndex) {
      src.orderIndex = newOrderIndex
      if (await dao.update(src)) {
        commit('update', src)
      }
    }
  }
}
