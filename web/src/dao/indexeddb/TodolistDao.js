import db from '@/plugins/db'
import { Todolist } from '@/model/Todolist'

const STORE_NAME = 'todolist'

export class TodolistDao {
  async getLists () {
    const result = await db.getAll(STORE_NAME)
    return result.map(r => new Todolist(r.id, r))
  }

  async add (params, orderIndex) {
    const now = new Date()
    const list = new Todolist(now.getTime().toString(), params)
    list.orderIndex = orderIndex
    list.createdAt = now
    list.updatedAt = now

    await db.insert(STORE_NAME, list.getData())

    return list
  }

  async update (list) {
    list.updatedAt = new Date()
    return await db.update(STORE_NAME, list.getData())
  }

  async delete (id) {
    return await db.delete(STORE_NAME, id)
  }
}
