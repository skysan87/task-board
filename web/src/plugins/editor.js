import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Checklist from '@editorjs/checklist'
import CodeTool from '@editorjs/code'
import Table from '@editorjs/table'

export default (_, inject) => {
  inject('editor', {
    EditorJS: ({ holder, placeholder, data }) => {
      return new EditorJS({
        holder,
        placeholder,
        data,
        tools: {
          header: Header,
          list: List,
          checklist: Checklist,
          code: CodeTool,
          table: Table
        }
      })
    }
  })
}
