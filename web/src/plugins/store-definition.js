const config = {
  name: 'config',
  indexes: []
}

const habit = {
  name: 'habit',
  indexes: []
}

const todolist = {
  name: 'todolist',
  indexes: []
}

const todo = {
  name: 'todo',
  indexes: [
    // 今日のタスク
    { name: 'today_todo', key: ['type', 'state', 'startdate'], option: { unique: false, multiEntry: false } },
    // 今日完了したタスク
    { name: 'done_todo', key: ['type', 'state', 'stateChangeDate'], option: { unique: false, multiEntry: false } },
    // 今日の習慣タスク
    { name: 'habit_todo', key: ['type', 'startdate'], option: { unique: false, multiEntry: false } },
    // プロジェクトのタスク
    { name: 'list_todo', key: 'listId', option: { unique: false, multiEntry: false } }
  ]
}

export default [config, habit, todolist, todo]
