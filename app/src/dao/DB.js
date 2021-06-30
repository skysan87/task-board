const sqlite3 = require('sqlite3')
const path = require('path')
const { resolve } = require('path')

let db

class DB {

  static init() {
    const dbfile = 'db.sqlite'

    let dbPath
    if (process.env.NODE_ENV === 'production') {
      // TODO: appDataフォルダを指定
      dbPath = dbfile
    } else {
      dbPath = path.resolve(__dirname, dbfile)
    }

    db = new sqlite3.Database(dbPath)
  }

  static getInstance() {
    return db
  }

  static get(sql, params) {
    return new Promise((resolve, reject) => {
      console.log(sql)

      db.get(sql, params, (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  }

  static getAll(sql, params) {
    return new Promise((resolve, reject) => {
      console.log(sql)

      db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }

  static run(sql, params) {
    return new Promise((resolve, reject) => {
      console.log(sql)

      db.run(sql, params, (err) => {
        if (err) reject(err)
        resolve()
      })
    })
  }

  /**
   * 逐次実行
   * @param {(DB)=>void} callback
   * @returns
   */
  static runAll(callback) {
    return new Promise((resolve, reject) => {
      try {
        db.serialize(callback(db))
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = DB