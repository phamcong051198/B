import { app, BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { createMainWindow } from './main'
import { autoUpdater } from 'electron-updater'
const log = require('electron-log')

let loginWindow: BrowserWindow | null = null
// autoUpdater.autoInstallOnAppQuit = true

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
    proceedToMainWindow()
  }
})

ipcMain.once('main-window', async () => {
  proceedToMainWindow()
})

function proceedToMainWindow() {
  try {
    autoUpdater.removeAllListeners()
    if (loginWindow) {
      loginWindow.close()
      loginWindow = null
    }
    createMainWindow()
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
    log.info('🛠️ Dev mode: Set feed URL to http://localhost:8080/')
  }
  log.info('🔧 AutoUpdater listeners registered, checking for updates...')
  autoUpdater.checkForUpdates().catch((err) => {
    log.error('AutoUpdater periodic check error:', err)
    proceedToMainWindow()
    return
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
    log.error('❌ AutoUpdater error:', err)
  })

  let displayedProgress = 0
  const step = 1

  autoUpdater.on('download-progress', (progress) => {
    log.info(
      `📥 Downloading... ${Math.round(progress.percent)}% | ${progress.transferred}/${progress.total} bytes`
    )

    if (loginWindow) {
      loginWindow.webContents.send('show-loading')

      const interval = setInterval(() => {
        if (displayedProgress < progress.percent) {
          displayedProgress += step
          loginWindow?.webContents.send('update-download-progress', Math.round(displayedProgress))
        } else {
          clearInterval(interval)
        }
      }, 50)
      loginWindow.on('closed', () => {
        clearInterval(interval)
      })
    }
  })

  autoUpdater.on('update-downloaded', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000))

    app.quit()
    autoUpdater.quitAndInstall(true, true)
  })
}
