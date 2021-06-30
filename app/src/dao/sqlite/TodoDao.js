const DB = require('../DB')

const STORE_NAME = 'todo'

/**
 * タスクの種別
 */
const TYPE_TODO = 'todo'
const TYPE_HABIT = 'habit'

/**
 * タスクのステータス: 未実施
 */
const STATE_TODO = 0
/**
 * タスクのステータス: 実施中
 */
const STATE_INPROGRESS = 1
/**
 * タスクのステータス: 完了
 */
const STATE_DONE = 2


class TodoDao {
  /**
   * プロジェクトに属するタスクを取得
   * @param {String} listId リストID
   * @returns {Promise<any[]>}
   */
  async getTodos (listId) {
    const sql = `
      SELECT data
      FROM ${STORE_NAME}
      WHERE
        json_extract(data, '$.listId') = ?
    `

    try {
      const rows = await DB.getAll(sql, [listId])
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
   * 今日の残タスクを取得する
   * @param {Number} date YYYYMMDD
   * @returns {Promise<any[]>}
   */
  async getTodaysTask (date) {
    const sql = `
      SELECT data
      FROM ${STORE_NAME}
      WHERE
        json_extract(data, '$.type') = ?
        AND
        json_extract(data, '$.state') IN (?, ?)
        AND
        json_extract(data, '$.startdate') <= ?
    `

    try {
      const rows = await DB.getAll(sql, [TYPE_TODO, STATE_TODO, STATE_INPROGRESS, date])
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
   * 本日完了したタスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Promise<any[]>}
   */
  async getTodaysDone (date) {
    const sql = `
      SELECT data
      FROM ${STORE_NAME}
      WHERE
        json_extract(data, '$.type') = ?
        AND
        json_extract(data, '$.state') = ?
        AND
        json_extract(data, '$.startdate') = ?
    `

    try {
      const rows = await DB.getAll(sql, [TYPE_TODO, STATE_DONE, date])
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
   * 今日の習慣タスクを取得
   * @param {Number} date YYYYMMDD
   * @returns {Promise<Todo[]>}
   */
  async getHabits (date) {
    const sql = `
      SELECT data
      FROM ${STORE_NAME}
      WHERE
        json_extract(data, '$.type') = ?
        AND
        json_extract(data, '$.startdate') = ?
    `

    try {
      const rows = await DB.getAll(sql, [TYPE_HABIT, date])
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
    data.updatedAt = now
    data.createdAt = now

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
   * 習慣タスクの一括登録
   * @param {Object[]} datas json配列
   * @returns {Promise<any[]>} json配列
   */
  async addHabits (datas) {
    const now = new Date()
    for (let i = 0; i < datas.length; i++) {
      datas[i].id = `H-${now.getTime()}-${i}`
      datas[i].createdAt = now
      datas[i].updatedAt = now
    }

    const sql = `
      INSERT INTO ${STORE_NAME} (id, data)
      VALUES (?, json(?));
    `

    await DB.runAll((db) => {
      datas.forEach(item => {
        db.run(sql, [item.id, JSON.stringify(item)], (err) => {
          if (err) {
            console.log(err)
          }
        })
      })
    })

    return datas
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

  /**
   * 一括削除
   * @param {Object[]} datas
   * @returns {Promise<Boolean>} 実行結果
   */
  async deleteTodos (datas) {
    const sql = `
      DELETE FROM ${STORE_NAME}
      WHERE id = ?;
    `

    try {
      await DB.runAll((db) => {
        datas.forEach(item => {
          db.run(sql, [item.id])
        })
      })
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
}

module.exports = TodoDao
