import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Checklist from '@editorjs/checklist'
import NestedList from '@editorjs/nested-list'
import CodeTool from '@editorjs/code'
import Table from '@editorjs/table'
import { parseMarkdown as parseChecklist } from './BlockTypeParser/ChecklistParser'
import { parseMarkdown as parseCode } from './BlockTypeParser/CodeParser'
import { parseMarkdown as parseHeader } from './BlockTypeParser/HeaderParser'
import { parseMarkdown as parseList } from './BlockTypeParser/NestedListParser'
import { parseMarkdown as parseParagraph } from './BlockTypeParser/ParagraphParser'
import { parseMarkdown as parseTable } from './BlockTypeParser/TableParser'

export default (_, inject) => {
  inject('editor', {
    EditorJS: ({ holder, placeholder, data }) => {
      return new EditorJS({
        holder,
        placeholder,
        data,
        minHeight: 50,
        tools: {
          header: Header,
          list: NestedList,
          checklist: Checklist,
          code: CodeTool,
          table: Table
        }
      })
    },
    parse: ({ data }) => {
      return data.blocks.map((block) => {
        switch (block.type) {
          case 'header':
            return parseHeader(block.data)
          case 'paragraph':
            return parseParagraph(block.data)
          case 'list':
            return parseList(block.data)
          case 'code':
            return parseCode(block.data)
          case 'checklist':
            return parseChecklist(block.data)
          case 'table':
            return parseTable(block.data)
          default:
            return ''
        }
      }).join('\n\n')
    }
  })
}
