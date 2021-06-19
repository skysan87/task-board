import dayjs from 'dayjs'
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo')

/**
 * Factory
 * @param {string | number | Date | undefined} date
 * @param {string} format
 */
export const dayFactory = (date = null, format) => {
  return new Wrapper(date, format)
}

class Wrapper {
  /**
   * コンストラクタ
   * @param {string | number | Date | undefined} date
   * @param {string} format
   */
  constructor (date = null, format) {
    if (!date) {
      this.instance = dayjs()
    } else if (!format && typeof date === 'string' && /^[0-9]{8}$/.test(date)) {
      this.instance = dayjs(date, 'YYYYMMDD')
    } else {
      this.instance = dayjs(date, format)
    }
  }

  /* ==== Method Chain ==== */

  add (value, unit = null) {
    this.instance = this.instance.add(value, unit)
    return this
  }

  addDay (value) {
    return this.add(value, 'day')
  }
  /* ==== Method Chain ==== */

  /**
   * 日付を数値型で取得
   * @returns {Number} 日付（YYYYMMDD)
   */
  getDateNumber () {
    return parseInt(this.instance.format('YYYYMMDD'))
  }

  get (unit) {
    return this.instance.get(unit)
  }

  toDate () {
    return this.instance.toDate()
  }
}
