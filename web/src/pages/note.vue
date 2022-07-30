<template>
  <div class="main">
    <!-- スクロール -->
    <aside class="sidemenu bg-gray-800 text-white" :style="{ width: sidewidth + 'px' }">
      <div>
        <!-- TODO：ヘッダー固定 -->
        <button @click="load">リロード(仮)</button>
        <!-- TODO: 戻るボタン -->
      </div>
      <div
        v-for="note in list"
        :key="note.id"
        :title="note.title"
        class="title-box py-1 flex justify-between items-center hover:bg-blue-700 hover:opacity-75"
        :class="{'bg-blue-700' : isSelected(note.id)}"
      >
        <div
          class="no-wrap pl-5 pr-3 flex-1 cursor-pointer"
          @click.left="onSelect(note.id)"
        >
          {{ note.title }}
        </div>
        <div
          class="flex-none py-1 px-1 mr-2 cursor-pointer rounded-full hover:bg-gray-400"
          @click.left.prevent="deleteNote(note.id)"
        >
          <fa
            :icon="['fas', 'trash-can']"
            size="xs"
            class="delete-icon"
            title="削除"
          />
        </div>
      </div>
    </aside>

    <div
      class="h-screen dragSidebar"
      :style="{ left: (sidewidth - 3) + 'px' }"
      @mousedown="dragStart($event)"
      @mousemove="dragging($event)"
    />

    <div class="main-contents-body w-full h-screen">
      <!-- TODO: レスポンシブ対応 -> resize -->
      <div id="editor" class="border border-black" />
      <div>
        <!-- TODO：ヘッダー固定 -->
        <button @click="save">保存</button>
        <!-- クリアボタン -->
        <button @click="clearEditor">クリア</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Note } from '@/model/Note'

const MIN_WIDTH = 180
const MAX_WIDTH_MARGIN = 255

export default {

  layout: 'base',

  data () {
    return {
      editor: null,
      sidewidth: 240,
      isDragging: false,
      clientWidth: 0,
      noteOnEdit: null
    }
  },

  computed: {
    list () {
      return this.$store.getters['Note/getAll']
    }
  },

  mounted () {
    window.addEventListener('mouseup', this.dragEnd, false)
    window.addEventListener('mousemove', this.dragging, false)
    window.addEventListener('resize', this.resizeSidebar, false)

    this.load()

    this.editor = this.$editor.EditorJS({
      holder: 'editor',
      placeholder: '入力してください'
    })
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.dragEnd, false)
    window.removeEventListener('mousemove', this.dragging, false)
    window.removeEventListener('resize', this.resizeSidebar, false)
  },
  methods: {
    load () {
      this.$store.dispatch('Note/init')
        .catch((error) => {
          console.error(error)
          this.$toast.error('読込に失敗しました')
        })
    },
    dragStart () {
      this.isDragging = true
      this.clientWidth = window.innerWidth
    },
    dragEnd () {
      this.isDragging = false
    },
    dragging (e) {
      if (this.isDragging) {
        if (e.pageX > (this.clientWidth - MAX_WIDTH_MARGIN)) {
          this.sidewidth = this.clientWidth - MAX_WIDTH_MARGIN
        } else if (e.pageX < MIN_WIDTH) {
          this.sidewidth = MIN_WIDTH
        } else {
          this.sidewidth = e.pageX
        }
      }
    },
    resizeSidebar () {
      if (this.sidewidth >= window.innerWidth) {
        this.sidewidth = window.innerWidth - MAX_WIDTH_MARGIN
      }
    },
    async save () {
      try {
        const savedData = await this.editor.save()
        console.log(savedData) // debug

        if (this.noteOnEdit && (this.noteOnEdit.id ?? '') !== '') {
          this.noteOnEdit.data = savedData
          await this.$store.dispatch('Note/update', Note.valueOf(this.noteOnEdit))
        } else {
          // 空データ
          if (savedData.blocks.length === 0) {
            return
          }
          this.noteOnEdit = await this.$store.dispatch('Note/add', savedData)
        }
        this.$toast.success('保存しました')
      } catch (error) {
        console.error(error)
        this.$toast.error('保存に失敗しました')
      }
    },
    deleteNote (id) {
      if (confirm('削除しますか？')) {
        this.$store.dispatch('Note/delete', id)
          .then(() => {
            if (this.isSelected(id)) {
              this.clearEditor()
            }
            this.$toast.success('削除しました')
          })
          .catch((error) => {
            console.error(error)
            this.$toast.error('ノートの削除に失敗しました')
          })
      }
    },
    onSelect (id) {
      this.$store.dispatch('Note/get', id)
        .then((result) => {
          this.setEditor(result)
        })
        .catch((error) => {
          console.error(error)
          this.$toast.error('ノートの取得に失敗しました')
        })
    },

    isSelected (id) {
      if (!this.noteOnEdit) {
        return false
      }
      return (this.noteOnEdit.id ?? '') === id
    },

    setEditor (note) {
      this.noteOnEdit = note
      if (note.data.blocks.length > 0) {
        this.editor.render(note.data)
      } else {
        // データがない場合、レンダリングに失敗する
        this.editor.clear()
      }
    },
    clearEditor () {
      this.noteOnEdit = null
      this.editor.clear()
    }
  }
}
</script>

<style scoped>
/* .scrollable-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollable-container::-webkit-scrollbar {
  display: none;
}  */

.main {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: minmax(min-content, max-content) auto;
  grid-template-rows: 100%;
  margin: 0 auto;
  background: #fff;
  position: relative; /* dragSidebar */
}

.sidemenu {
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
}

.main-contents-body {
  height: 100vh;
  overflow-y: auto;
}

.dragSidebar {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  transition: background .3s;
  content: '';
  user-select: none;
}

.dragSidebar:hover {
  background: skyblue;
}

.no-wrap {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.delete-icon {
  display: none;
}

.title-box:hover .delete-icon {
  display: block;
}
</style>
