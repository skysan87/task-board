import { CreateEventDao } from '@/dao'
import { Event } from '@/model/Event'

const dao = CreateEventDao()

export const state = () => ({
  event: new Event('', {})
})

export const getters = {
  getEvent: (state) => {
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
  /**
   * 初期化
   * @param {context} コンテキスト
   * @param {String} dateString YYYY-MM-DD
   */
  async init ({ commit }, dateString) {
    try {
      const eventList = await dao.getById(dateString)

      let event = null

      if (eventList.length > 0) {
        event = eventList[0]
      } else {
        const result = await dao.add(dateString)
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

  async addTask ({ state, commit }, task) {
    const copyEvent = new Event(state.event.id, state.event)
    copyEvent.addTask(task)
    if (await dao.update(copyEvent)) {
      commit('update', copyEvent)
    }
  },

  async updateTask ({ state, commit }, task) {
    const copyEvent = new Event(state.event.id, state.event)
    copyEvent.updateTask(task)
    if (await dao.update(copyEvent)) {
      commit('update', copyEvent)
    }
  },

  async removeTask ({ state, commit }, taskId) {
    const copyEvent = new Event(state.event.id, state.event)
    copyEvent.removeTask(taskId)
    if (await dao.update(copyEvent)) {
      commit('update', copyEvent)
    }
  },

  async removeAll ({ state, commit }) {
    const copyEvent = new Event(state.event.id, state.event)
    copyEvent.removeAll()
    if (await dao.update(copyEvent)) {
      commit('update', copyEvent)
    }
  }
}
