export class Event {
  constructor (id, params) {
    this.id = id // YYYYY-MM-DD
    this.tasks = []
    if (Array.isArray(params.tasks)) {
      this.tasks = params.tasks.map((t) => { return this.getTaskProperties(t) })
    }
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    return {
      id: this.id,
      tasks: this.tasks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  addTask ({ id, startTime, endTime }) {
    this.tasks.push({
      id,
      startTime,
      endTime
    })
  }

  removeTask (id) {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index >= 0) {
      this.tasks.splice(index, 1)
    }
  }

  removeAll () {
    this.tasks.length = 0
  }

  updateTask ({ id, startTime, endTime }) {
    const task = this.tasks.find(t => t.id === id)
    if (task) {
      task.startTime = startTime
      task.endTime = endTime
    }
  }

  /**
   * @param {{id: String, startTime: Number, endTime: Number}} Object
   */
  getTaskProperties ({ id, startTime, endTime }) {
    // NOTE: vuexのstate変更エラー回避
    return {
      id, startTime, endTime
    }
  }
}
