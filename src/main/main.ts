import { BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
const { ipcMain } = require('electron')

import { autoUpdater } from 'electron-updater'
import { managerPairPlatform } from './worker/managerPairPlatform'

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

export function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1140,
    height: 764,
    show: false,
    autoHideMenuBar: true,
    center: true,
    title: `B-Soft(Corners) Vietnam v11.02.255`,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL('http://localhost:5173/#/main')
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'main' })
  }

  mainWindow.webContents.once('did-finish-load', () => {
    // 👉 Chỉ show khi React đã render xong
    mainWindow.show()
    // setupAutoUpdater() // 🟢 Tích hợp tại đây
  })

  ipcMain.on('random-pair-platform', () => {
    function getRandomData() {
      const possibleData = [
        [],
        [{ id: 1, key: 'A-B', platform1: 'A', platform2: 'B' }],
        [
          { id: 2, key: 'C-D', platform1: 'C', platform2: 'D' },
          { id: 3, key: 'E-F', platform1: 'E', platform2: 'F' }
        ],
        [
          { id: 1, key: 'A-B', platform1: 'A', platform2: 'B' },
          { id: 2, key: 'C-D', platform1: 'C', platform2: 'D' }
        ],
        [
          { id: 1, key: 'A-B', platform1: 'A', platform2: 'B' },
          { id: 2, key: 'C-D', platform1: 'C', platform2: 'D' },
          { id: 3, key: 'E-F', platform1: 'E', platform2: 'F' }
        ]
      ]

      return possibleData[Math.floor(Math.random() * possibleData.length)]
    }
    managerPairPlatform(getRandomData())
  })

  return mainWindow
}

function setupAutoUpdater() {
  if (is.dev) {
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: 'http://localhost:8080/'
    })
  }

  // 🔁 Lưu ID của setInterval
  const intervalId = setInterval(
    () => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.error('AutoUpdater periodic check error:', err)
      })
    },
    1000 * 60 * 1
  ) // Mỗi 1 phút

  autoUpdater.on('checking-for-update', () => {
    console.log('🔄 Checking for update...')
  })

  autoUpdater.on('update-available', () => {
    console.log('⬇️ Update available, downloading...')
    clearInterval(intervalId) // 🔥 Clear interval khi có update
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-not-available', () => {
    console.log('✅ No update available.')
  })

  autoUpdater.on('error', (err) => {
    console.error('❌ AutoUpdater error:', err)
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(`📥 Downloading... ${Math.round(progress.percent)}%`)
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('✅ Update downloaded. Will install on quit.')
    BrowserWindow.getAllWindows()[0].webContents.send('update-available')
    // autoUpdater.quitAndInstall() // tuỳ chọn
  })
}
