import db from '@/plugins/db'
import { note as storeNote } from '@/plugins/store-definition'
import { Note } from '@/model/Note'

const STORE_NAME = storeNote.name

export class NoteDao {
  async getAll () {
    // データ量が大きいので、タイトルのみ取得
    const result = await db.getAllWithTargetFields(STORE_NAME, ['id', 'title', 'updatedAt'])
    return result.map(r => new Note(r.id, r))
  }

  async getById (id) {
    const result = await db.getByKey(STORE_NAME, id)
    return new Note(result.id, result)
  }

  async add (data) {
    const now = new Date()
    const note = new Note('', {})
    note.id = now.getTime().toString()
    note.data = data
    note.createdAt = now
    note.updatedAt = now

    await db.insert(STORE_NAME, note.getData())
    return note
  }

  async update (oldNote, data) {
    const newNote = Note.valueOf(oldNote)
    newNote.data = data
    newNote.updatedAt = new Date()

    await db.update(STORE_NAME, newNote)
    return newNote
  }

  async delete (id) {
    return await db.delete(STORE_NAME, id)
  }
}
