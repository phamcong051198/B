import { useEffect, useState } from 'react'

const LoadingModal = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    window.electron.ipcRenderer.on('update-download-progress', (_, percent) => {
      setProgress(percent)
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('update-download-progress')
    }
  }, [])

  return (
    <div className="absolute h-full w-full bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 bg-opacity-60 h-full w-full shadow-2xl flex flex-col items-center justify-center">
        <p className="text-base font-semibold text-white mb-4 flex flex-col items-center text-center">
          <span>A new version is available</span>
          <span>{`Downloading and updating automatically ${progress}`}</span>
        </p>
        <div className="w-56 h-6 bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xl font-bold text-white mt-1">{`${progress}%`}</p>
      </div>
    </div>
  )
}

export default LoadingModal
