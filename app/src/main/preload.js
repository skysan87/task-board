const { contextBridge, ipcRenderer } = require('electron')

// rendererプロセスで呼ぶIPC通信処理を書く
// ex) window.electron.メソッド名(引数)
contextBridge.exposeInMainWorld(
  'electron', {
    resizeWindow: (args) => ipcRenderer.send('ipc-resize-window', args),
    minimizeWindow: () => ipcRenderer.send('ipc-minimize-window'),
    maximizeWindow: () => ipcRenderer.send('ipc-maximize-window'),
    normalizeWindow: () => ipcRenderer.send('ipc-normalize-window'),
    closeWindow: () => ipcRenderer.send('ipc-close-window'),
    stickyWindow: () => ipcRenderer.send('ipc-sticky-window')
  }
)
