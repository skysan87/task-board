import { dateFactory } from '@/util/DateFactory'

export const state = () => ({
  isMenuExpanded: false,
  subPanelName: '',
  today: dateFactory()
})

export const getters = {
  isMenuExpanded: (state) => {
    return state.isMenuExpanded
  },

  subPanelName: (state) => {
    return state.subPanelName
  },

  getDate: (state) => {
    return state.today.getDateNumber()
  }
}

export const mutations = {
  isMenuExpanded (state, value) {
    state.isMenuExpanded = value
  },

  subPanelName (state, componentName) {
    state.subPanelName = componentName
  }
}

export const actions = {
  isMenuExpanded ({ commit }, value) {
    commit('isMenuExpanded', value)
  },

  subPanelName ({ commit }, componentName) {
    commit('subPanelName', componentName)
  }
}
