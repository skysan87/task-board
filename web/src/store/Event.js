import { CreateEventDao } from '@/dao'
import { Event } from '@/model/Event'

const dao = CreateEventDao()

export const state = () => ({
  event: new Event('', {})
})

export const getters = {
  getConfig: (state) => {
    return state.event
  }
}

export const mutations = {
  init (state, event) {
    state.event = event
  },

  update (state, event) {
    state.event = event
  }
}

export const actions = {
  async init ({ commit }) {
    try {
      const eventList = await dao.get()

      let event = null

      if (eventList.length > 0) {
        event = eventList[0]
      } else {
        const result = await dao.add()
        if (result.isSuccess) {
          event = result.value
        }
      }

      commit('init', event)
    } catch (error) {
      console.error(error)
    }

    console.log('event init')
  },

  // TODO:
  async updateMessage ({ state, commit }, message) {
    const event = new Event(state.event.id, state.event) // copy
    event.globalMessage = message

    if (await dao.update(event)) {
      commit('update', event)
    }
  }
}
