import db from '@/plugins/db'
import { Habit } from '@/model/Habit'

const STORE_NAME = 'habit'

export class HabitDao {
  async get () {
    const result = await db.getAll(STORE_NAME)
    return result.map(r => new Habit(r.id, r))
  }

  async add (params) {
    const now = new Date()
    const habit = new Habit(now.getTime().toString(), params)
    habit.createdAt = now
    habit.updatedAt = now

    const result = await db.insert(STORE_NAME, habit.getData())

    return {
      isSuccess: result,
      value: result ? habit : null
    }
  }

  async update (habit) {
    habit.updatedAt = new Date()
    return await db.update(STORE_NAME, habit.getData())
  }

  async updateSummary (habits) {
    const updatelist = []
    const now = new Date()
    habits.forEach((v) => {
      const param = v.getData()
      param.updatedAt = now
      updatelist.push(param)
    })
    return await db.updateAll(STORE_NAME, updatelist)
  }

  async delete (id) {
    return await db.delete(STORE_NAME, id)
  }
}
