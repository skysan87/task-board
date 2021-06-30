const DB = require('../DB')

const STORE_NAME = 'config'
const STORE_KEY = 'setting'

class ConfigDao {
  /**
   * 値を取得
   * @returns {Promise<Object[]>} jsonの配列
   */
  async get () {
    const sql = `
      SELECT data
      FROM ${STORE_NAME}
      WHERE id = ?;
    `

    try {
      const row = await DB.get(sql, [STORE_KEY])
      return !(row) ? [] : [row.data]
    } catch(err) {
      console.error(err)
      return []
    }
  }

  /**
   * 登録
   * @param {Object} data json
   * @returns {Object} SQL実行結果
   */
  async add (data) {
    const now = new Date()
    data.id = STORE_KEY
    data.createdAt = now
    data.updatedAt = now

    const sql = `
      INSERT INTO ${STORE_NAME} (id, data)
      VALUES (?, json(?));
    `

    let result
    try {
      await DB.run(sql, [STORE_KEY, JSON.stringify(data)])
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
   * @param {Object} data json(全ての値)
   * @returns {Boolean} SQL実行結果
   */
  async update (data) {
    data.updatedAt = new Date()

    const sql = `
      UPDATE ${STORE_NAME}
      SET data = json(?)
      WHERE id = ?;
    `

    try {
      await DB.run(sql, [JSON.stringify(data), STORE_KEY])
      return true
    } catch(err) {
      console.error(err)
      return false
    }
  }
}

module.exports = ConfigDao
