export function parseMarkdown (block) {
  switch (block.style) {
    case 'unordered':
      return block.items.map(item => (`* ${item}`)).join('\n')
    case 'ordered':
      return block.items.map((item, index) => (`${index + 1}. ${item}`)).join('\n')
    default:
      return ''
  }
}
