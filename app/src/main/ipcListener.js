const { ipcMain, BrowserWindow } = require('electron')

exports.registerIpcListener = (window) => {
  // リサイズ
  ipcMain.on('ipc-resize-window', (ev, option) => {
    const { width, height } = option
    window.setSize(width, height, true)
  })
}
