import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import PlayerPage from './pages/PlayerPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('music-user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="app-loading">Loading...</div>

  if (!user) {
    return <AuthPage onAuth={(userData) => {
      localStorage.setItem('music-user', JSON.stringify(userData))
      setUser(userData)
    }} />
  }

  return <PlayerPage user={user} onLogout={() => {
    localStorage.removeItem('music-user')
    setUser(null)
  }} />
}

export default App
