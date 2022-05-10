import dayjs from 'dayjs'
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
require('dayjs/locale/ja')
dayjs.tz.setDefault('Asia/Tokyo')
dayjs.locale('ja')

/**
 * Factory
 * @param {string | number | Date | undefined} date
 * @param {string} format
 */
export const dateFactory = (date = null, format) => {
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
    } else if (!format && date) {
      this.instance = dayjs(date)
    } else {
      this.instance = dayjs(date, format)
    }
  }

  /* ==== Method Chain ==== */

  /**
   * 指定した単位で時間を進めた
   * @param {Number} value 値
   * @param {String} unit 単位(day, week, month, quarter, year, hour, minute, second, millisecond)
   * @returns {Wrapper} インスタンス
   */
  add (value, unit = null) {
    this.instance = this.instance.add(value, unit)
    return this
  }

  /**
   * 指定した単位で時間を戻す
   * @param {Number} value 値
   * @param {String} unit 単位(day, week, month, quarter, year, hour, minute, second, millisecond)
   * @returns {Wrapper} インスタンス
   */
  subtract (value, unit = null) {
    this.instance = this.instance.subtract(value, unit)
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

  /**
   * 日時の単位で指定した値を取得
   * @param {String} unit 単位(date, day, month, year, hour, minute, second, millisecond)
   * @returns {Number} 指定した単位の値
   */
  get (unit) {
    return this.instance.get(unit)
  }

  toDate () {
    return this.instance.toDate()
  }

  format (template) {
    return this.instance.format(template)
  }

  /**
   * 月に何日あるか
   * @return {Number}
   */
  daysInMonth () {
    return this.instance.daysInMonth()
  }

  /**
   * 月の第何週か
   * @return {Number}
   */
  getWeekIndex () {
    return Math.ceil(this.instance.get('date') / 7)
  }
}
