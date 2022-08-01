export function parseMarkdown (block) {
  return block.items.map(item => `* [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n')
}
