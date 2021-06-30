const DB = require('../DB')

const STORE_NAME = 'todolist'

class TodolistDao {
  /**
   * すべて取得
   * @returns {Promise<any[]>}
   */
  async get () {
    const sql = `
      SELECT data
      FROM ${STORE_NAME}
    `

    try {
      const rows = await DB.getAll(sql)
      if (!rows || rows.length === 0) {
        return []
      } else {
        return rows.map((r) => JSON.parse(r.data))
      }
    } catch(err) {
      console.error(err)
      return []
    }
  }

  /**
   * 登録
   * @param {Object} data json
   * @returns {Promise<Object>} 実行結果
   */
  async add (data) {
    const now = new Date()
    data.id = now.getTime().toString()
    data.createdAt = now
    data.updatedAt = now

    const sql = `
      INSERT INTO ${STORE_NAME} (id, data)
      VALUES (?, json(?));
    `

    let result
    try {
      await DB.run(sql, [data.id, JSON.stringify(data)])
      result = true
    } catch(err) {
      result = false
      console.error(err)
    }

    return {
      isSuccess: result,
      value: result ? data : null
    }
  }

  /**
   * 更新
   * @param {Object} data json
   * @returns {Promise<Boolean>} 実行結果
   */
  async update (data) {
    data.updatedAt = new Date()

    const sql = `
      UPDATE ${STORE_NAME}
      SET data = json(?)
      WHERE id = ?;
    `

    try {
      await DB.run(sql, [JSON.stringify(data), data.id])
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }

  /**
   * 削除
   * @param {String} id
   * @returns {Promise<Boolean>} 実行結果
   */
  async delete (id) {
    const sql = `
      DELETE FROM ${STORE_NAME}
      WHERE id = ?;
    `

    try {
      await DB.run(sql, [id])
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }
}

module.exports = TodolistDao
