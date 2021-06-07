/* eslint-disable */
import { Config } from '@/model/Config'

export class ConfigDaoBase {

  constructor() {
  }

  async get() {
    const config = new Config('', {})
    config.id = Date.now().toString()
    config.globalMessage = 'this is demo message.'
    return [ config ]
  }

  async add () {
    const config = new Config('', {})
    config.id = Date.now().toString()

    return {
      isSuccess: true,
      value: config
    }
  }

  async update(config) {
    return true
  }
}
