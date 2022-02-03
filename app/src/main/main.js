const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')

const ICON = path.resolve(__dirname, '../img/icon_16px.png') //16px

let win
let tray

async function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false, // ローカルファイルの読込許可
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'dev') {
    win.loadURL('http://localhost:3000/')

    win.webContents.openDevTools()
  } else {
    // production構成時
    await win.loadFile(path.resolve(__dirname, '../../dist/index.html'))
  }

  win.on('close', e => {
    e.preventDefault()
    win.hide()
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null

    if (!!tray && !tray.isDestroyed()) {
      tray.destroy()
    }
  })
}

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

// 二重起動禁止
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.whenReady().then(() => {
    createTray()
    createWindow()
  })
}

const createTray = () => {
  tray = new Tray(ICON)
  tray.on('click', () => {
    toggleWindow()
  })

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '終了', click: () => {
        // closeイベントをキャンセルしているため、
        // 強制的にウィンドウを終了
        win.destroy()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
}

const toggleWindow = () => {
  win.isVisible() ? win.hide() : win.show()
}
