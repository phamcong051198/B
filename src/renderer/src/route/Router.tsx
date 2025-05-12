import { Routes, Route, HashRouter } from 'react-router-dom'
import { Path } from '@renderer/route/Path'
import Main from '@renderer/windows/Main'
import Login from '@renderer/windows/Login'

function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path={Path.login} element={<Login />} />
        <Route path={Path.main} element={<Main />} />
      </Routes>
    </HashRouter>
  )
}

export default Router
