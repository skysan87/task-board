import db from '@/plugins/db'
import { Todo } from '@/model/Todo'
import { TaskState } from '@/util/TaskState'

const STORE_NAME = 'todo'

export class TodoDao {
  /**
   * リストのタスクを取得
   * @param {String} listId リストID
   * @returns {Promise<Todo[]>}
   */
  async getTodos (listId) {
    const key = IDBKeyRange.only(listId)
    const result = await db.getByKeyRange(STORE_NAME, 'list_todo', key)
    return result.map(v => new Todo(v.id, v))
  }

  /**
   * 今日の残タスクを取得する
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>}
   */
  async getTodaysTask (date) {
    const tasks = []

    const todokey = IDBKeyRange.bound([Todo.TYPE_TODO, TaskState.Todo.value], [Todo.TYPE_TODO, TaskState.Todo.value, date])
    const todos = await db.getByKeyRange(STORE_NAME, 'today_todo', todokey)
    tasks.push(...todos.map(v => new Todo(v.id, v)))

    const ipkey = IDBKeyRange.bound([Todo.TYPE_TODO, TaskState.InProgress.value], [Todo.TYPE_TODO, TaskState.InProgress.value, date])
    const ips = await db.getByKeyRange(STORE_NAME, 'today_todo', ipkey)
    tasks.push(...ips.map(v => new Todo(v.id, v)))

    return tasks
  }

  /**
   * 本日終了したタスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>} 習慣のタスク
   */
  async getTodaysDone (date) {
    const key = IDBKeyRange.only([Todo.TYPE_TODO, TaskState.Done.value, date])
    const result = await db.getByKeyRange(STORE_NAME, 'done_todo', key)
    return result.map(v => new Todo(v.id, v))
  }

  /**
   * 今日の習慣タスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>}
   */
  async getHabits (date) {
    const key = IDBKeyRange.only([Todo.TYPE_HABIT, date])
    const result = await db.getByKeyRange(STORE_NAME, 'habit_todo', key)
    return result.map(v => new Todo(v.id, v))
  }

  /**
   * タスクの登録
   * @param {Object} params パラメータ
   * @returns
   */
  async add (params) {
    const now = new Date()
    const todo = new Todo(now.getTime().toString(), params)
    todo.updatedAt = now
    todo.createdAt = now

    const result = await db.insert(STORE_NAME, todo.getData())

    return {
      isSuccess: result,
      value: result ? todo : null
    }
  }

  /**
   * 習慣タスクを登録
   * @param {ToDo[]} todos
   * @param {Number} date YYYYMMDD
   */
  async addHabits (todos) {
    const data = []
    for (let i = 0; i < todos.length; i++) {
      todos[i].id = (Date.now() + i).toString()
      data.push(todos[i].getData())
    }
    await db.updateAll(STORE_NAME, data)
    return todos
  }

  async update (todo) {
    todo.updatedAt = new Date()
    return await db.update(STORE_NAME, todo.getData())
  }

  async delete (id) {
    return await db.delete(STORE_NAME, id)
  }

  /**
   * 一括削除
   * @param {Todo[]} todos
   * @returns
   */
  async deleteTodos (todos) {
    const idlist = todos.map(v => v.id)
    return await db.deleteAll(STORE_NAME, idlist)
  }
}
