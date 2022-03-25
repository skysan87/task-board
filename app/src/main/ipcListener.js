const { ipcMain } = require('electron')

exports.registerIpcListener = (window) => {
  // リサイズ
  ipcMain.on('ipc-resize-window', (ev, option) => {
    const { width, height, alwaysOnTop } = option
    window.setSize(width, height, true)
    window.setAlwaysOnTop(alwaysOnTop || false)
  })
}
