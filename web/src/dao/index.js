import { TodoDao } from '@/dao/indexeddb/TodoDao'
import { TodolistDao } from '@/dao/indexeddb/TodolistDao'
import { HabitDao } from '@/dao/indexeddb/HabitDao'
import { ConfigDao } from '@/dao/indexeddb/ConfigDao'
import { EventDao } from '@/dao/indexeddb/EventDao'
import { NoteDao } from '@/dao/indexeddb/NoteDao'

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

export function CreateEventDao () {
  return new EventDao()
}

export function CreateNoteDao () {
  return new NoteDao()
}
