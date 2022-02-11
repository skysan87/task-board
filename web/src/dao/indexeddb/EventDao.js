import db from '@/plugins/db'
import { Event } from '@/model/Event'

const STORE_NAME = 'event'

export class EventDao {
  async getById (dateString) {
    const result = await db.getByKey(STORE_NAME, dateString)
    const events = []
    if (result !== null && result !== undefined) {
      events.push(new Event(result.id, result))
    }
    return events
  }

  async add (dateString) {
    const event = new Event('', {})
    const now = new Date()
    event.id = dateString
    event.createdAt = now
    event.updatedAt = now

    const result = await db.insert(STORE_NAME, event.getData())

    return {
      isSuccess: result,
      value: result ? event : null
    }
  }

  async update (event) {
    event.updatedAt = new Date()
    return await db.update(STORE_NAME, event.getData())
  }
}
