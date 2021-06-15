const { contextBridge, ipcRenderer } = require('electron')

// rendererプロセスで呼ぶIPC通信処理を書く
// ex) window.electron.メソッド名(引数)
contextBridge.exposeInMainWorld(
  'electron', {
  }
)
