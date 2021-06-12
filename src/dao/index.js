import { TodoDao } from '@/dao/indexeddb/TodoDao'
import { TodolistDao } from '@/dao/indexeddb/TodolistDao'
import { HabitDao } from '@/dao/indexeddb/HabitDao'
import { ConfigDao } from '@/dao/indexeddb/ConfigDao'

export function CreateTodoDao () {
  return new TodoDao()
}

export function CreateTodolistDao () {
  return new TodolistDao()
}

export function CreateHabitDao () {
  return new HabitDao()
}

export function CreateConfigDao () {
  return new ConfigDao()
}
