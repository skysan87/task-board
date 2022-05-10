import { TaskState } from '@/util/TaskState'
import { SubTask } from '@/model/SubTask'

export class Todo {
  static TYPE = { TODO: 'todo', HABIT: 'habit' }

  constructor (id, params) {
    this.id = id
    this.type = params.type || Todo.TYPE.TODO // todo/habit
    this.title = params.title || null
    this.state = params.state || TaskState.Todo.value
    this.detail = params.detail || null
    this.startdate = params.startdate || null // YYYYMMDD
    this.enddate = params.enddate || null // YYYYMMDD
    this.orderIndex = params.orderIndex || 0
    this.listId = params.listId || ''
    this.lastActivityDate = params.lastActivityDate || null // habitの前回実施日
    this.stateChangeDate = params.stateChangeDate || null // 更新日: フィルター用
    this.createdAt = params.createdAt || null // 管理用
    this.updatedAt = params.updatedAt || null // 管理用
    this.listName = '' // リスト名: 表示用
    if (Array.isArray(params.subTasks)) {
      this.subTasks = params.subTasks.map((v, index) => {
        return new SubTask({ ...v, id: index })
      })
    } else {
      this.subTasks = []
    }
  }

  get isDone () {
    return this.state === TaskState.Done.value
  }

  getData () {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      state: this.state,
      detail: this.detail,
      isDone: this.isDone,
      startdate: this.startdate,
      enddate: this.enddate,
      orderIndex: this.orderIndex,
      listId: this.listId,
      lastActivityDate: this.lastActivityDate,
      stateChangeDate: this.stateChangeDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      subTasks: this.subTasks.map(t => t.getData())
    }
  }

  static valueOf (params) {
    return new Todo(params.id || '', params)
  }
}
