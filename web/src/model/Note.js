export class Note {
  constructor (id, params) {
    this.id = id
    this.data = params.data ?? null
    this.title = params.title ?? ''
    this.createdAt = params.createdAt ?? null
    this.updatedAt = params.updatedAt ?? null
  }

  getData () {
    return {
      id: this.id,
      data: this.data,
      title: this.getTitle(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  getTitle () {
    if (!this.data || this.data.blocks.length === 0) {
      return '-- no data --'
    }

    const firstRow = this.data.blocks[0]
    switch (firstRow.type) {
      case 'header':
      case 'paragraph':
        return firstRow.data.text
      case 'code':
        return firstRow.data.code
      default:
        return `note at ${this.data.time}` // タイムスタンプ
    }
  }
}
