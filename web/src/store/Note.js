import orderBy from 'lodash/orderBy'
import { CreateNoteDao } from '@/dao'

const dao = CreateNoteDao()

export const state = () => ({
  notes: [],
  selectedItem: null
})

export const getters = {
  getAll: (state) => {
    return orderBy(state.notes, 'id')
  },

  getSelectedItem: (state) => {
    return state.selectedItem
  }
}

export const mutations = {
  init (state, notes) {
    state.notes = notes
  },

  select (state, note) {
    state.selectedItem = note
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

  async select ({ commit }, noteId) {
    commit('select', await dao.getById(noteId))
  },

  unselect ({ commit }) {
    commit('select', null)
  },

  async add ({ commit }, params) {
    commit('add', await dao.add(params))
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
