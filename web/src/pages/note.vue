<!-- TODO: 将来的に別アプリに分離する(そのため画面機能はこのコンポーネントに集約) -->

<template>
  <div class="main">
    <!-- スクロール -->
    <aside class="sidemenu bg-gray-800" :style="{ width: sidewidth + 'px' }">
      <!-- TODO: サイドメニュー: 保存データ一覧、戻るボタン -->
      <div></div>
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
  mounted () {
    window.addEventListener('mouseup', this.dragEnd, false)
    window.addEventListener('mousemove', this.dragging, false)
    window.addEventListener('resize', this.resizeSidebar, false)

    // TODO: サイドメニューに表示するデータの取得

    this.editor = this.$editor.EditorJS({
      holder: 'editor',
      placeholder: '入力してください',
      data: this.contentData
    })
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.dragEnd, false)
    window.removeEventListener('mousemove', this.dragging, false)
    window.removeEventListener('resize', this.resizeSidebar, false)
  },
  methods: {
    // TODO: 自動保存
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
