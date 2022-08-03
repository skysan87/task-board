export function parseMarkdown (block) {
  switch (block.level) {
    case 1:
      return `# ${block.text}`
    case 2:
      return `## ${block.text}`
    case 3:
      return `### ${block.text}`
    case 4:
      return `#### ${block.text}`
    case 5:
      return `##### ${block.text}`
    case 6:
      return `###### ${block.text}`
    default:
      break
  }
}
