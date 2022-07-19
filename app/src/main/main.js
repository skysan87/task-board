const { app, BrowserWindow, Tray, Menu, BrowserView } = require('electron')
const path = require('path')
const { registerIpcListener } = require('./ipcListener.js')

const ICON = path.resolve(__dirname, '../img/icon_16px.png') //16px

const titlebarHight = 28

const is_windows = process.platform === 'win32'
const is_mac = process.platform === 'darwin'
// const is_linux = process.platform ==='linux'

let win
let tray

async function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    useContentSize: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false, // ローカルファイルの読込許可
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'dev') {
    await setupView('http://localhost:3000/')
  } else {
    // production構成時
    await setupViewLocal(path.resolve(__dirname, '../../dist/index.html'))
  }

  const titlebar = is_windows ? 'titlebar_win.html' : 'titlebar_mac.html'
  win.loadFile(path.resolve(__dirname, titlebar))
  // win.webContents.openDevTools({ mode: 'detach' })

  registerIpcListener(win)

  win.on('resize', () => {
    win.getBrowserViews().forEach((view) => {
      resizeView(view)
    })
  })

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

const setupView = async (url) => {
  const view = new BrowserView({
      webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.addBrowserView(view)
  resizeView(view)
  await view.webContents.loadURL(url)
}

const setupViewLocal = async (file) => {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      webSecurity: false, // ローカルファイルの読込許可
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.addBrowserView(view)
  resizeView(view)
  await view.webContents.loadFile(file)
  // view.webContents.openDevTools({ mode: 'detach' }) // debug
}

function resizeView(view) {
  const bound = win.getBounds()
  view.setBounds({ x: 0, y: titlebarHight, width: bound.width, height: bound.height - titlebarHight })
}