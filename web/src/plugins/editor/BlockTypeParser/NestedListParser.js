export function parseMarkdown (block) {
  const result = []
  const TAB_SIZE = 2

  const parseItemAsOrderd = (item, indexes = [1]) => {
    const indentDepth = Math.max(indexes.length - 1, 0) * TAB_SIZE
    const indent = Array.from({ length: indentDepth }, () => ' ').join('')
    result.push(`${indent}${indexes.join('.')}. ${item.content}`)
    item.items.forEach((_item, index) => {
      parseItemAsOrderd(_item, [...indexes, index + 1])
    })
  }

  const parseItemAsUnOrderd = (item, depth = 0) => {
    const indent = Array.from({ length: depth * TAB_SIZE }, () => ' ').join('')
    result.push(`${indent}* ${item.content}`)
    item.items.forEach((_item) => {
      parseItemAsUnOrderd(_item, depth + 1)
    })
  }

  switch (block.style) {
    case 'unordered':
      block.items.forEach(item => parseItemAsUnOrderd(item))
      break
    case 'ordered':
      block.items.forEach((item, index) => parseItemAsOrderd(item, [index + 1]))
      break
  }
  return result.join('\n')
}
