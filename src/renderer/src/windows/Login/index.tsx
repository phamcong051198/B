import { useEffect, useState } from 'react'
import LoadingModal from '../LoadingModal'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saveLogin, setSaveLogin] = useState(false)

  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    const savedPassword = localStorage.getItem('password')
    if (savedUsername && savedPassword) {
      setUsername(savedUsername)
      setPassword(savedPassword)
      setSaveLogin(true)
    }
  }, [])

  const handleLogin = () => {
    if (username === 'admin' && password === '123') {
      localStorage.setItem('isLoggedIn', 'true')

      if (saveLogin) {
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
      } else {
        localStorage.removeItem('username')
        localStorage.removeItem('password')
      }
      window.electron.ipcRenderer.send('login-success')
    } else {
      setError('Login thất bại!')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleLogout = () => {
    window.electron.ipcRenderer.send('logout')
  }

  useEffect(() => {
    const showLoading = () => setLoading(true)
    const hideLoading = () => setLoading(false)

    window.electron.ipcRenderer.on('show-loading', showLoading)
    window.electron.ipcRenderer.on('hide-loading', hideLoading)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('show-loading')
      window.electron.ipcRenderer.removeAllListeners('hide-loading')
    }
  }, [])

  return (
    <div className="relative bg-black opacity-90 h-full text-gray-500 flex flex-col border border-gray-600">
      <div className="flex justify-between px-2 pt-1">
        <p className="underline cursor-pointer hover:text-blue-700">Re-Update</p>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="checkboxLogin"
            className="cursor-pointer"
            checked={saveLogin}
            onChange={(e) => setSaveLogin(e.target.checked)}
          />
          <label htmlFor="checkboxLogin" className="pl-2 cursor-pointer">
            SaveLogin
          </label>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-7">
        <p className="text-5xl tracking-widest font-serif text-white">B-SOFT</p>
        <p className="tracking-widest font-serif text-gray-400 self-end">(Corners)</p>
      </div>
      <div className="text-[#FF0000] font-semibold text-center h-6 mb-9">{error}</div>
      <div className="text-[#FF0000] font-semibold text-center h-1 mb-9">{''}</div>
      <div className="px-6 pb-5 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex">
            <p className="w-[66px] font-bold text-slate-300">ID</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              maxLength={20}
              className="w-[118px] outline-none text-gray-200 bg-[#374b57] border border-gray-400"
            />
          </div>
          <div className="flex">
            <p className="w-[66px] font-bold text-slate-300">Password</p>
            <div className="flex-1 border border-gray-400 bg-[#374b57] flex items-center justify-between">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="text"
                maxLength={20}
                className="w-28 outline-none text-gray-200 bg-[#374b57] border-red-400"
              />
              <button type="button" className="w-4 text-gray-400 hover:text-gray-200 mr-1"></button>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-gray-200 text-black font-bold block h-6 w-28 hover:bg-orange-300 transition duration-300"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="bg-gray-200 text-black font-bold block h-6 w-28 hover:bg-orange-300 transition duration-300"
            onClick={handleLogout}
          >
            Cancel
          </button>
        </div>
      </div>
      {loading && <LoadingModal />}
    </div>
  )
}
