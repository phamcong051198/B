import { ElectronAPI as ToolkitElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface ElectronAPI extends ToolkitElectronAPI {
    onUpdateAvailable: (callback: () => void) => void
  }

  interface Window {
    electron: ElectronAPI
    electronAPI: ElectronAPI
  }
}
