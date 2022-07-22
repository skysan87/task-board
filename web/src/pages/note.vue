<template>
  <div class="main">
    <!-- スクロール -->
    <aside class="sidemenu bg-gray-800 text-white" :style="{ width: sidewidth + 'px' }">
      <!-- TODO: サイドメニュー: 保存データ一覧、戻るボタン -->
      <div>
        <button @click="load">リロード(仮)</button>
      </div>
      <!-- TODO: 削除ボタン -->
      <!-- TODO: 選択ボタン -->
      <div v-for="note in list" :key="note.id">
        {{ note.title }}
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
        <button @click="save">保存</button>
        <!-- クリアボタン -->
        <!-- 削除ボタン -->
      </div>
    </div>
  </div>
</template>

<script>
const MIN_WIDTH = 180
const MAX_WIDTH_MARGIN = 255

export default {

  layout: 'base',

  data () {
    return {
      editor: null,
      contentData: {},
      sidewidth: 240,
      isDragging: false,
      clientWidth: 0
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
        // 空データ
        if (savedData.blocks.length === 0) {
          return
        }
        // TODO: 新規かどうか判定
        await this.$store.dispatch('Note/add', savedData)
      } catch (error) {
        console.error(error)
        this.$toast.error('保存に失敗しました')
      }
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
</style>
