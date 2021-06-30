const sqlite3 = require('sqlite3')
const fs = require('fs')
const path = require('path')
const DB = require('../dao/DB')

DB.init()
const db = DB.getInstance()

// SQLファイルを指定
const sqlfile = path.join(__dirname, 'sql/v1-create.sql')

// ファイル読み込み
const text = fs.readFileSync(sqlfile, 'utf-8')

text.split(';').forEach(async sql => {
  try {
    const formatSQL = sql.trim()

    if (formatSQL !== '') {
      console.log('RUN:', formatSQL)
      await DB.run(formatSQL)
    }
  } catch (err) {
    console.log(err)
  }
})

db.close(err => {
  if (err) {
    console.log('error on db close', err)
  }
})

console.log('END')
