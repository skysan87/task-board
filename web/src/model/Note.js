export class Note {
  constructor (id, params) {
    this.id = id
    this.data = params.data ?? null
    this._title = params.title ?? null // data from db
    const now = new Date()
    this.createdAt = params.createdAt ?? now
    this.updatedAt = params.updatedAt ?? now
  }

  get title () {
    // リスト表示時、dbからの値を表示する
    if (!this.data || this.data.blocks.length === 0) {
      return this._title ?? '-- no data --'
    }
    // editor.jsのプラグインに併せてblockの1行目の値をタイトルとする
    const firstRow = this.data.blocks[0]
    switch (firstRow.type) {
      case 'header':
      case 'paragraph':
        return firstRow.data.text
      case 'code':
        return firstRow.data.code
      default:
        return `更新: ${this.updatedAt.toJSON()}`
    }
  }

  getData () {
    return {
      id: this.id,
      data: this.data,
      title: this.title,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  static valueOf (params) {
    return new Note(params.id ?? null, params)
  }
}
