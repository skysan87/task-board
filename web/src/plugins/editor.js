import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'

export default (_, inject) => {
  inject('editor', {
    EditorJS: ({ holder, placeholder, data }) => {
      return new EditorJS({
        holder,
        placeholder,
        data,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true
          },
          list: {
            class: List,
            inlineToolbar: true
          }
        }
      })
    }
  })
}
