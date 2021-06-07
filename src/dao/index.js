import { TodoDaoBase as TodoBase } from '@/dao/base/TodoDaoBase'
import { TodolistDaoBase as TodolistBase } from '@/dao/base/TodolistDaoBase'
import { HabitDaoBase as HabitBase } from '@/dao/base/HabitDaoBase'
import { ConfigDaoBase as ConfigBase } from '@/dao/base/ConfigDaoBase'

export function CreateTodoDao () {
  return new TodoBase()
}

export function CreateTodolistDao () {
  return new TodolistBase()
}

export function CreateHabitDao () {
  return new HabitBase()
}

export function CreateConfigDao () {
  return new ConfigBase()
}
