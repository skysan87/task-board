import moment from 'moment'

/**
 * 日付を数値型で取得
 * @returns {Number} 日付（YYYYMMDD)
 */
export function getDateNumber (_momoent = null) {
  const _m = _momoent || moment()
  return parseInt(_m.format('YYYYMMDD'))
}

/**
 * 指定した期間のループ処理(昇順)
 * @param {Date} startDate 開始日
 * @param {Date} endDate 終了日
 * @param {Function} _callback コールバック
 */
export function forDayEach (startDate, endDate, _callback) {
  const start = moment(startDate)
  const end = moment(endDate)

  while (start.unix() <= end.unix()) {
    const cancel = _callback(start.toDate())
    if (cancel) {
      break
    }
    start.add(1, 'days')
  }
}

/**
 * 指定した期間のループ処理(光順)
 * @param {Date} startDate 開始日
 * @param {Date} endDate 終了日
 * @param {Function} _callback コールバック
 */
export function forDayReverseEach (startDate, endDate, _callback) {
  const start = moment(startDate)
  const end = moment(endDate)

  while (start.unix() <= end.unix()) {
    const cancel = _callback(end.toDate())
    if (cancel) {
      break
    }
    end.subtract(1, 'days')
  }
}
