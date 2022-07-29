import orderBy from 'lodash/orderBy'
import { CreateNoteDao } from '@/dao'

const dao = CreateNoteDao()

export const state = () => ({
  notes: []
})

export const getters = {
  getAll: (state) => {
    return orderBy(state.notes, 'id')
  }
}

export const mutations = {
  init (state, notes) {
    state.notes = notes
  },

  add (state, note) {
    state.notes.push(note)
  },

  update (state, note) {
    const index = state.notes.findIndex(v => v.id === note.id)
    Object.assign(state.notes[index], note)
  },

  delete (state, noteId) {
    const index = state.notes.findIndex(v => v.id === noteId)
    state.notes.splice(index, 1)
  }
}

export const actions = {
  async init ({ commit }) {
    commit('init', await dao.getAll())

    console.log('note init')
  },

  async get (_, noteId) {
    return await dao.getById(noteId)
  },

  async add ({ commit }, params) {
    const note = await dao.add(params)
    commit('add', note)
    return note
  },

  async update ({ commit }, note) {
    if (await dao.update(note)) {
      commit('update', note)
    }
  },

  async delete ({ commit }, note) {
    if (await dao.delete(note.id)) {
      commit('delete', note.id)
    }
  }
}
