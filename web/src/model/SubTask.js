export class SubTask {
  constructor (params) {
    this.id = params.id
    this.title = params.title || ''
    this.isDone = params.isDone || false
  }

  getData () {
    return {
      title: this.title,
      isDone: this.isDone
    }
  }
}
