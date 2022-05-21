const { ipcMain, BrowserWindow } = require('electron')

exports.registerIpcListener = (window) => {
  // リサイズ
  ipcMain.on('ipc-resize-window', (ev, option) => {
    const { width, height } = option
    window.setSize(width, height, true)
  }),

  ipcMain.on('ipc-minimize-window', () => {
    window.minimize()
  }),

  ipcMain.on('ipc-maximize-window', () => {
    window.maximize()
  }),

  ipcMain.on('ipc-normalize-window', () => {
    window.unmaximize()
  }),

  ipcMain.on('ipc-close-window', () => {
    window.close()
  }),

  ipcMain.on('ipc-sticky-window', () => {
    window.setAlwaysOnTop(!window.isAlwaysOnTop())
  })
}
