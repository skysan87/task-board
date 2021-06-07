export class Habitlist {
  constructor (id, params) {
    this.id = id
    this.maxIndex = params.maxIndex || 0
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    const params = {
      maxIndex: this.maxIndex,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }
}
