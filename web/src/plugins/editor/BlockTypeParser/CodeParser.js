export function parseMarkdown (blocks) {
  return `\`\`\`\n${blocks.code}\n\`\`\``
}
