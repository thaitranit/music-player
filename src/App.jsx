import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import PlayerPage from './pages/PlayerPage'
import MyMusicPage from './pages/MyMusicPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('player') // 'player' hoặc 'my-music'

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

  if (currentPage === 'my-music') {
    return (
      <MyMusicPage 
        user={user} 
        onBack={() => setCurrentPage('player')} 
        onLogout={() => {
          localStorage.removeItem('music-user')
          setUser(null)
        }}
      />
    )
  }

  return (
    <PlayerPage 
      user={user} 
      onGoToMyMusic={() => setCurrentPage('my-music')}
      onLogout={() => {
        localStorage.removeItem('music-user')
        setUser(null)
      }} 
    />
  )
}

export default App
