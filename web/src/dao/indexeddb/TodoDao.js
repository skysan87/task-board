import db from '@/plugins/db'
import { Todo } from '@/model/Todo'
import { TaskState } from '@/util/TaskState'

const STORE_NAME = 'todo'

const INDEX_LIST = 'list_todo'
const INDEX_TODAY = 'today_todo'
const INDEX_DONE = 'done_todo'
const INDEX_HABIT = 'habit_todo'

export class TodoDao {
  /**
   * リストのタスクを取得
   * @param {String} listId リストID
   * @returns {Promise<Todo[]>}
   */
  async getTodos (listId) {
    const key = IDBKeyRange.only(listId)
    const result = await db.getByKeyRange(STORE_NAME, INDEX_LIST, key)
    return result.map(v => new Todo(v.id, v))
  }

  /**
   * 今日の残タスクを取得する
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>}
   */
  async getTodaysTask (date) {
    const tasks = []

    const todokey = IDBKeyRange.bound([Todo.TYPE.TODO, TaskState.Todo.value], [Todo.TYPE.TODO, TaskState.Todo.value, date])
    const todos = await db.getByKeyRange(STORE_NAME, INDEX_TODAY, todokey)
    tasks.push(...todos.map(v => new Todo(v.id, v)))

    const ipkey = IDBKeyRange.bound([Todo.TYPE.TODO, TaskState.InProgress.value], [Todo.TYPE.TODO, TaskState.InProgress.value, date])
    const ips = await db.getByKeyRange(STORE_NAME, INDEX_TODAY, ipkey)
    tasks.push(...ips.map(v => new Todo(v.id, v)))

    return tasks
  }

  /**
   * 本日終了したタスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>} 習慣のタスク
   */
  async getTodaysDone (date) {
    const key = IDBKeyRange.only([Todo.TYPE.TODO, TaskState.Done.value, date])
    const result = await db.getByKeyRange(STORE_NAME, INDEX_DONE, key)
    return result.map(v => new Todo(v.id, v))
  }

  /**
   * 今日の習慣タスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>}
   */
  async getHabits (date) {
    const key = IDBKeyRange.only([Todo.TYPE.HABIT, date])
    const result = await db.getByKeyRange(STORE_NAME, INDEX_HABIT, key)
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

    await db.insert(STORE_NAME, todo.getData())
    return todo
  }

  /**
   * 習慣タスクを登録
   * @param {ToDo[]} todos
   * @param {Number} date YYYYMMDD
   */
  async addHabits (todos) {
    const data = []
    const now = new Date()
    for (let i = 0; i < todos.length; i++) {
      todos[i].id = `H-${now.getTime()}-${i}`
      todos[i].createdAt = now
      todos[i].updatedAt = now
      data.push(todos[i].getData())
    }
    await db.updateAll(STORE_NAME, data)
    return todos
  }

  async update (todo) {
    const clone = Todo.valueOf(todo)
    clone.updatedAt = new Date()
    return await db.update(STORE_NAME, clone.getData())
  }

  async updateList (todos) {
    const updateData = todos.map((todo) => {
      const clone = Todo.valueOf(todo)
      clone.updatedAt = new Date()
      return clone.getData()
    })
    return await db.updateAll(STORE_NAME, updateData)
  }

  /**
   * 対象の項目のみ更新
   * @param {Array<any>} targets
   */
  async updateFields (targets) {
    const updateDatas = targets.map((t) => {
      return {
        ...t,
        updatedAt: new Date()
      }
    })
    return await db.updateOnlyChangedFields(STORE_NAME, updateDatas)
  }

  async delete (id) {
    return await db.delete(STORE_NAME, id)
  }

  /**
   * 一括削除
   * @param {String[]} idlist
   * @returns
   */
  async deleteTodos (idlist) {
    return await db.deleteAll(STORE_NAME, idlist)
  }
}
