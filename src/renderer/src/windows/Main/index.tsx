import { useEffect, useState } from 'react'

export default function Main() {
  const [updateMessage, setUpdateMessage] = useState('')

  useEffect(() => {
    window.electron.ipcRenderer.on('delete', () => localStorage.setItem('isLoggedIn', 'false'))
  }, [])

  useEffect(() => {
    window.electronAPI?.onUpdateAvailable(() => {
      setUpdateMessage('Có 1 bản update mới. Đăng nhập lại để cập nhật ứng dụng')
    })
  }, [])
  const ramdom = () => {
    window.electron.ipcRenderer.send('random-pair-platform')
  }
  return (
    <div className="bg-layout-color flex flex-col h-full font-extrabold text-2xl justify-center items-center">
      <button className="border bg-blue-500 px-1 rounded-md mb-4" onClick={ramdom}>
        Ramdom Pair Platform
      </button>
      Bản 1 Version
      {updateMessage && (
        <div className="mt-4 text-red-600 text-base font-semibold">{updateMessage}</div>
      )}
    </div>
  )
}
