export const DB_NAME = 'todolist'
/**
 * DBのバージョン
 * NOTE: 定義を更新したらインクリメントする
 */
export const DB_VERSION = 3

export const config = {
  name: 'config',
  indexes: []
}

export const habit = {
  name: 'habit',
  indexes: []
}

export const todolist = {
  name: 'todolist',
  indexes: []
}

export const todo = {
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

export const event = {
  name: 'event',
  indexes: []
}

export const note = {
  name: 'note',
  indexes: []
}

export const definition = [config, habit, todolist, todo, event, note]
