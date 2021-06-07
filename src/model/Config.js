export class Config {
  constructor (id, params) {
    this.id = id
    this.globalMessage = params.globalMessage || ''
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    return {
      id: this.id,
      globalMessage: this.globalMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
