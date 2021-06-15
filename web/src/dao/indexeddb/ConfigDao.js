import db from '@/plugins/db'
import { Config } from '@/model/Config'

const STORE_NAME = 'config'
const STORE_KEY = 'setting'

export class ConfigDao {
  async get () {
    const result = await db.getByKey(STORE_NAME, STORE_KEY)
    const configs = []
    if (result !== null && result !== undefined) {
      configs.push(new Config(result.id, result))
    }
    return configs
  }

  async add () {
    const config = new Config('', {})
    const now = new Date()
    config.id = STORE_KEY
    config.createdAt = now
    config.updatedAt = now

    const result = await db.insert(STORE_NAME, config.getData())

    return {
      isSuccess: result,
      value: result ? config : null
    }
  }

  async update (config) {
    config.updatedAt = new Date()
    return await db.update(STORE_NAME, config.getData())
  }
}
