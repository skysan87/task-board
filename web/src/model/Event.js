export class Event {
  constructor (id, params) {
    this.id = id // YYYYMMDD
    this.tasks = params.tasks || []
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

  addTask (id, start, end) {
    this.tasks.push({
      id,
      startTime: start,
      endTime: end
    })
  }

  deleteTask (id) {
    const index = this.tasks.findIndex(t => t.id === id)
    if (index > 0) {
      this.tasks.splice(index, 1)
    }
  }

  updateTask (id, start, end) {
    const task = this.tasks.find(t => t.id === id)
    if (task) {
      task.startTime = start
      task.endTime = end
    }
  }
}
