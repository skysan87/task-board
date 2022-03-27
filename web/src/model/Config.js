export class Config {
  constructor (id, params) {
    this.id = id
    this.globalMessage = params.globalMessage || ''
    // タイムテーブルで表示する時間
    this.timeRange = params.timeRange || { start: '09:00', end: '18:00' }
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  getData () {
    return {
      id: this.id,
      globalMessage: this.globalMessage,
      timeRange: this.timeRange,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
