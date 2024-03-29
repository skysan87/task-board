import { DB_NAME, DB_VERSION, definition } from '@/plugins/store-definition'

let _db = null

class Db {
  constructor () {
    console.log('Db instance created.')
  }

  async init () {
    // TODO: 動作確認用に初期化
    // await this.deleteDB()
    console.log('db init')
    await this.connect()
  }

  deleteDB () {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.deleteDatabase(DB_NAME)

      req.onerror = () => {
        console.log('error deleting database.')
        reject(req.error)
      }

      req.onsuccess = () => {
        console.log('database deleted successfully')
        resolve()
      }
    })
  }

  async getInstance () {
    if (!_db) {
      console.log('database reconnect')
      await this.connect()
    }
    return _db
  }

  connect () {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION)

      req.onsuccess = () => {
        _db = req.result
        console.log('database connected.')
        resolve()
      }

      req.onerror = () => {
        reject(req.error)
      }

      // DBのバージョン更新時
      req.onupgradeneeded = () => {
        console.log('database upgrade needed.')
        const db = req.result
        this.createStore(db)
        // NOTE: 正常終了すると、onsuccessイベントが実行
      }
    })
  }

  createStore (db) {
    for (const storeDef of definition) {
      if (!db.objectStoreNames.contains(storeDef.name)) {
        const store = db.createObjectStore(storeDef.name, { keyPath: 'id' })
        // 検索に使用するindexを設定
        for (const index of storeDef.indexes) {
          store.createIndex(index.name, index.key, index.option)
        }
      }
    }
  }

  /**
   * 範囲指定で取得
   * @param {String} storeName テーブル名
   * @param {String} indexName インデックス名
   * @param {IDBKeyRange} keyRange 検索条件
   * @returns Promise<Any[]>
   */
  getByKeyRange (storeName, indexName, keyRange) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readonly')
          const store = tx.objectStore(storeName)
          const index = store.index(indexName)
          const req = index.openCursor(keyRange)
          const result = []
          req.onsuccess = () => {
            if (req.result === null) {
              resolve(result)
            } else {
              const cursor = req.result
              result.push(cursor.value)
              cursor.continue()
            }
          }
          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * 検索キーで一件取得
   * @param {String} storeName テーブル名
   * @param {String} key 検索キー
   * @returns Object
   */
  getByKey (storeName, key) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readonly')
          const store = tx.objectStore(storeName)
          const req = store.get(key)

          req.onsuccess = (ev) => {
            const result = ev.target.result // object
            if (!result) {
              resolve(null)
            } else {
              resolve(result)
            }
          }

          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * テーブルから全て取得
   * @param {String} storeName テーブル名
   * @returns Array
   */
  getAll (storeName) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readonly')
          const store = tx.objectStore(storeName)
          const req = store.getAll()

          req.onsuccess = (ev) => {
            const result = ev.target.result // array
            if (!result) {
              resolve(null)
            } else {
              resolve(result)
            }
          }

          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * 全てのレコードから特定のプロパティのみ取得
   * @param {string} storeName
   * @param {string[]} fieldNames
   * @returns {Object[]}
   */
  getAllWithTargetFields (storeName, fieldNames) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readonly')
          const store = tx.objectStore(storeName)
          const req = store.openCursor(null, 'next')
          const returnList = []

          req.onsuccess = (ev) => {
            const cursor = ev.target.result
            if (cursor) {
              const data = {}
              for (const name of fieldNames) {
                data[name] = cursor.value[name] ?? null
              }
              returnList.push(data)

              cursor.continue()
            } else {
              resolve(returnList)
            }
          }

          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * データ登録
   * @param {String} storeName テーブル名
   * @param {Object} data 登録するデータ
   * @returns Promise<Boolean>
   */
  insert (storeName, data) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const req = tx.objectStore(storeName).add(data)

          req.onsuccess = () => {
            resolve(true)
          }
          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * データ更新
   * @param {String} storeName テーブル名
   * @param {Object} data 更新するデータ
   * @returns Promise<Boolean>
   */
  update (storeName, data) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const req = tx.objectStore(storeName).put(data) // upsert

          req.onsuccess = () => {
            resolve(true)
          }
          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * データ更新
   * @param {String} storeName テーブル名
   * @param {Array} datas 更新するデータ
   * @returns Promise<Boolean>
   */
  updateAll (storeName, datas) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const store = tx.objectStore(storeName)
          datas.forEach((data) => {
            store.put(data)
          })
          tx.onerror = () => {
            reject(tx.error)
          }
          tx.oncomplete = () => {
            resolve(true)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * データ更新(特定の項目のみ更新)
   * @param {String} storeName テーブル名
   * @param {Array} updateItems 更新するデータ
   * @returns {Promise<Boolean>}
   */
  updateOnlyChangedFields (storeName, updateItems) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const store = tx.objectStore(storeName)
          for (const item of updateItems) {
            const request = store.openCursor(IDBKeyRange.only(item.id))
            request.onsuccess = () => {
              const cursor = request.result
              if (cursor) {
                Object.entries(item).forEach(([key, value]) => {
                  cursor.value[key] = value
                })
                cursor.update(cursor.value)
                cursor.continue()
              }
            }
          }

          tx.onerror = () => {
            reject(tx.error)
          }
          tx.oncomplete = () => {
            resolve(true)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * データ削除
   * @param {String} storeName テーブル名
   * @param {String} key 削除するキー
   * @returns Promise<Boolean>
   */
  delete (storeName, key) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const req = tx.objectStore(storeName).delete(key)

          req.onsuccess = () => {
            resolve(true)
          }
          req.onerror = () => {
            reject(req.error)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * データ削除
   * @param {String} storeName テーブル名
   * @param {String[]} keys 削除するキー配列
   * @returns Promise<Boolean>
   */
  deleteAll (storeName, keys) {
    return new Promise((resolve, reject) => {
      this.getInstance().then((db) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const store = tx.objectStore(storeName)
          keys.forEach((key) => {
            store.delete(key)
          })
          tx.onerror = () => {
            reject(tx.error)
          }
          tx.oncomplete = () => {
            resolve(true)
          }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

// Singleton
export default new Db()
