export class Todolist {
  constructor (id, params) {
    this.id = id
    this.title = params.title || ''
    this.detail = params.detail || ''
    this.maxIndex = params.maxIndex || 0
    this.orderIndex = params.orderIndex || 0
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    return {
      id: this.id,
      title: this.title,
      detail: this.detail,
      deleteFlag: false,
      orderIndex: this.orderIndex,
      maxIndex: this.maxIndex,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
