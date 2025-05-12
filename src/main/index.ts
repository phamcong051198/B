import { app, BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { createMainWindow } from './main'
import { autoUpdater } from 'electron-updater'
const log = require('electron-log')

let loginWindow: BrowserWindow | null = null

function createLoginWindow(): BrowserWindow {
  const window = new BrowserWindow({
    frame: false,
    transparent: true,
    roundedCorners: false,
    width: 228,
    height: 274,
    autoHideMenuBar: true,
    center: true,
    resizable: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    trafficLightPosition: { x: 15, y: 10 },
    icon: 'resources/icon.png',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  const loginURL =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? 'http://localhost:5173/#/login'
      : join(__dirname, '../renderer/index.html')

  is.dev ? window.loadURL(loginURL) : window.loadFile(loginURL, { hash: 'login' })

  return window
}

app.whenReady().then(() => {
  loginWindow = createLoginWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      loginWindow = createLoginWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.once('login-success', async () => {
  if (!app.isReady() || !loginWindow) return

  try {
    setupAutoUpdater()
  } catch (error) {
    log.error('Error checking for updates:', error)
    // loginWindow.webContents.send('update-error', error.message)
    proceedToMainWindow()
  }
})
function proceedToMainWindow() {
  try {
    if (loginWindow) {
      loginWindow.webContents.send('show-loading')
      setTimeout(() => {
        if (loginWindow) {
          loginWindow.close()
          loginWindow = null
        }
        createMainWindow()
      }, 2000)
    }
  } catch (error) {
    log.error('Error proceeding to main window:', error)
  }
}

ipcMain.once('logout', () => {
  if (!app.isReady()) return

  if (loginWindow) {
    loginWindow.close()
    loginWindow = null
  }
})

function setupAutoUpdater() {
  if (is.dev) {
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'http://localhost:8080/'
    })
  }

  autoUpdater.checkForUpdates().catch((err) => {
    log.error('AutoUpdater periodic check error:', err)
  })

  autoUpdater.on('checking-for-update', () => {
    log.info('🔄 Checking for update...')
  })

  autoUpdater.on('update-available', () => {
    log.info('⬇️ Update available, downloading...')
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-not-available', () => {
    log.info('✅ No update available.')
    proceedToMainWindow()
  })

  autoUpdater.on('error', (err) => {
    console.error('❌ AutoUpdater error:', err)
  })

  autoUpdater.on('download-progress', (progress) => {
    log.info(`📥 Downloading... ${Math.round(progress.percent)}%`)
  })

  autoUpdater.on('update-downloaded', () => {
    log.info('✅ Update downloaded. Will install on quit.')
    BrowserWindow.getAllWindows()[0].webContents.send('update-available')
    // autoUpdater.quitAndInstall() // tuỳ chọn
  })
}
