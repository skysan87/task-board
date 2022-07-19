<template>
  <div class="editorjs">
    <!-- TODO: サイドメニュー: 保存データ一覧、戻るボタン -->
    <!-- TODO: 表示幅調整 -->
    <div id="editor" class="border border-black" />
  </div>
</template>

<script>
export default {

  layout: 'base',

  data () {
    return {
      editor: null,
      contentData: {}
    }
  },
  mounted () {
    // TODO: サイドメニューに表示するデータの取得
    this.editor = this.$editor.EditorJS({
      holder: 'editor',
      placeholder: '入力してください',
      data: this.contentData
    })
  },
  methods: {
    // TODO: 自動保存
  }
}
</script>
