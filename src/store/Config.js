import { CreateConfigDao } from '@/dao'
import { Config } from '@/model/Config'

const dao = CreateConfigDao()

export const state = () => ({
  config: new Config('', {})
})

export const getters = {
  getConfig: (state) => {
    return state.config
  }
}

export const mutations = {
  init (state, config) {
    Object.assign(state.config, config)
  },

  update (state, config) {
    Object.assign(state.config, config)
  }
}

export const actions = {
  async init ({ commit }) {
    const configList = await dao.get()

    let config

    if (configList.length > 0) {
      config = configList[0]
    } else {
      const result = await dao.add()
      if (result.isSuccess) {
        config = result.value
      }
    }

    commit('init', config)

    console.log('config init')
  },

  async updateMessage ({ state, commit }, message) {
    const config = new Config(state.config.id, state.config) // copy
    config.globalMessage = message

    if (await dao.update(config)) {
      commit('update', config)
    }
  }
}
