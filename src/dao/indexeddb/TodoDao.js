/* eslint-disable */
import db from '@/plugins/db'
import moment from 'moment'
import { Todo } from '@/model/Todo'
import { getDateNumber } from '@/util/MomentEx'
import { TaskState } from '@/util/TaskState'

const STORE_NAME = 'todo'

export class TodoDao {
  getTodos (listId) {
    // TODO: リファクタリング
    return new Promise((resolve, reject) => {
      db.getInstance().then((db) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const index = store.index('list_todo')
          const key = IDBKeyRange.only(listId)
          const req = index.openCursor(key)
          const todos = []
          req.onsuccess = () => {
            if (req.result === null) {
              resolve(todos)
            } else {
              const cursor = req.result
              todos.push(new Todo(cursor.value.id, cursor.value))
              cursor.continue()
            }
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * 今日の残タスクを取得する
   */
  async getTodaysTask (date) {
    // TODO: TaskStateがTodoとInProgressのものを取得
    return new Promise((resolve, reject) => {
      db.getInstance().then((db) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const index = store.index('today_todo')
          // NOTE: 範囲指定
          // https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange
          // https://stackoverflow.com/questions/16501459/javascript-searching-indexeddb-using-multiple-indexes
          const key = IDBKeyRange.bound(['todo', TaskState.Todo.value], ['todo', TaskState.Todo.value, date])
          const req = index.openCursor(key)
          const todos = []
          req.onsuccess = () => {
            if (req.result === null) {
              resolve(todos)
            } else {
              const cursor = req.result
              todos.push(new Todo(cursor.value.id, cursor.value))
              cursor.continue()
            }
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  async getTodaysDone (date) {
    // TODO: 実装
    return new Promise((resolve, reject) => resolve([]))
  }

  /**
   * 今日の習慣タスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Todo[]} 習慣のタスク
   */
  getHabits (date) {
    // TODO: 実装
    return new Promise((resolve, reject) => resolve([]))
  }

  async add (listId, params) {
    const now = new Date()
    const todo = new Todo(now.getTime().toString(), params)
    todo.listId = listId

    const result = await db.insert(STORE_NAME, todo.getData())

    return {
      isSuccess: result,
      value: result ? todo : null
    }
  }

  /**
   *
   * @param {ToDo[]} todos
   * @param {Number} date YYYYMMDD
   */
  addHabits (todos) {
    // TODO: 一括登録
    const promisses = []
    for (let i = 0; i < todos.length; i++) {
      const p = new Promise((resolve) => {
        todos[i].id = Date.now().toString() + i
        resolve(todos[i])
      })
      promisses.push(p)
    }
    return Promise.all(promisses)
  }

  async update (todo) {
    todo.updatedAt = new Date()
    return await db.update(STORE_NAME, todo.getData())
  }

  updateHabit (todo, habit, habitCounter) {
    // TODO:
    return new Promise((resolve) => {
      resolve(true)
    })
  }

  async delete (id) {
    return await db.delete(STORE_NAME, id)
  }

  deleteTodos (todos, taskState) {
    // TODO:
    return new Promise((resolve) => {
      resolve(true)
    })
  }
}
