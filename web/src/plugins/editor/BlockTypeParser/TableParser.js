export function parseMarkdown (block) {
  const rows = block.content
  const colNum = rows[0].length

  const rowsText = []

  const header = `|${(block.withHeadings ? rows[0] : Array.from({ length: colNum }, _ => ' ')).join('|')}|`
  rowsText.push(header)

  const delimiter = `|${Array.from({ length: colNum }, _ => '--').join('|')}|`
  rowsText.push(delimiter)

  rows.shift()

  rows.forEach((item) => {
    rowsText.push(`|${item.join('|')}|`)
  })

  return rowsText.join('\n')
}
