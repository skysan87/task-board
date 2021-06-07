/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import todo from '@/store/modules/Todo'
import todolist from '@/store/modules/Todolist'
import habit from '@/store/modules/Habit'
import config from '@/store/modules/Config'

Vue.use(Vuex)

// NOTE: モジュールモード?
export default() => new Vuex.Store({
  modules: {
    todo,
    todolist,
    habit,
    config
  }
})
