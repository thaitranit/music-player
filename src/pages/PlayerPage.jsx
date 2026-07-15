import { useEffect, useMemo, useState } from 'react'

const fallbackSongs = [
  {
    id: 'fallback-1',
    name: 'Lời anh muốn nói',
    singer: 'The Men',
    path: '/assests/music/LoiAnhMuonNoi.mp3',
    image: 'https://avatar-ex-swe.nixcdn.com/playlist/2013/11/06/c/c/a/8/1383713136679_500.jpg'
  },
  {
    id: 'fallback-2',
    name: 'Thương Em Là Điều Anh Không Thể Ngờ',
    singer: 'Noo Phước Thịnh',
    path: '/assests/music/ThuongEmLaDieuAnhKhongTheNgo.mp3',
    image: 'https://i.ytimg.com/vi/NryZpeTgLeE/maxresdefault.jpg'
  }
]

function PlayerPage({ user, onLogout }) {
  const [songs, setSongs] = useState(fallbackSongs)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRandom, setIsRandom] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [search, setSearch] = useState('')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)

  const currentSong = songs[currentIndex] || null

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/songs')
        const data = await response.json()
        if (data?.length) setSongs(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchSongs()
  }, [])

  const visibleSongs = useMemo(() => {
    if (!search.trim()) return songs
    const keyword = search.toLowerCase()
    return songs.filter((song) => song.name.toLowerCase().includes(keyword) || song.singer.toLowerCase().includes(keyword))
  }, [search, songs])

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = async () => {
    const audio = document.getElementById('zing-audio')
    if (!audio || !currentSong) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const playNext = () => {
    if (!songs.length) return
    if (isRandom) {
      let newIndex = Math.floor(Math.random() * songs.length)
      while (newIndex === currentIndex) {
        newIndex = Math.floor(Math.random() * songs.length)
      }
      setCurrentIndex(newIndex)
      return
    }
    setCurrentIndex((prev) => (prev + 1) % songs.length)
  }

  const playPrev = () => {
    if (!songs.length) return
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length)
  }

  useEffect(() => {
    const audio = document.getElementById('zing-audio')
    if (!audio || !currentSong) return

    audio.src = currentSong.path
    audio.load()
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [currentSong])

  useEffect(() => {
    const audio = document.getElementById('zing-audio')
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }

    const handleLoaded = () => {
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      if (isRepeat) {
        audio.play()
      } else {
        playNext()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentSong, isRepeat, isRandom, currentIndex])

  useEffect(() => {
    const audio = document.getElementById('zing-audio')
    if (audio) audio.volume = volume
  }, [volume])

  const handleSongClick = (song, index) => {
    const actualIndex = songs.findIndex((s) => s.id === song.id)
    if (actualIndex !== -1) {
      setCurrentIndex(actualIndex)
      setTimeout(() => {
        const audio = document.getElementById('zing-audio')
        if (audio) {
          audio.play().then(() => setIsPlaying(true)).catch(err => console.log(err))
        }
      }, 50)
    }
  }

  const handleProgressChange = (e) => {
    const audio = document.getElementById('zing-audio')
    if (!audio || !audio.duration) return
    const newProgress = Number(e.target.value)
    const seekTo = (newProgress / 100) * audio.duration
    audio.currentTime = seekTo
    setProgress(newProgress)
  }

  return (
    <div className="zing-container">
      {/* TOP HEADER */}
      <header className="zing-header">
        <div className="zing-logo">
          <i className="fas fa-music"></i>
          <span>Zing MP3</span>
        </div>
        <div className="zing-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="zing-header-right">
          <div className="zing-user">
            <i className="fas fa-user-circle"></i>
            <span>{user.username}</span>
          </div>
          <button className="zing-logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* MAIN WRAPPER */}
      <div className="zing-main-wrapper">
        {/* SIDEBAR */}
        <aside className="zing-sidebar">
          <div className="zing-sidebar-menu">
            <div className="zing-sidebar-item active">
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </div>
            <div className="zing-sidebar-item">
              <i className="fas fa-compass"></i>
              <span>Khám phá</span>
            </div>
            <div className="zing-sidebar-item">
              <i className="fas fa-chart-line"></i>
              <span>Top 100</span>
            </div>
            <div className="zing-sidebar-item">
              <i className="fas fa-heart"></i>
              <span>Yêu thích</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="zing-main">
          {/* HERO */}
          <section className="zing-hero">
            <div className="zing-hero-content">
              <div className="zing-hero-badge">Đang phát</div>
              <h1 className="zing-hero-title">{currentSong?.name || 'Chọn một bài hát'}</h1>
              <p className="zing-hero-artist">{currentSong?.singer || 'Zing MP3'} • {songs.length} bài hát</p>
            </div>
          </section>

          {/* SONG LIST */}
          <section>
            <h2 className="zing-section-title">Danh sách phát</h2>
            <div className="zing-song-list">
              {visibleSongs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const originalIndex = songs.findIndex(s => s.id === song.id);
                return (
                  <div
                    key={song.id}
                    className={`zing-song-item ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleSongClick(song, index)}
                  >
                    <div className="zing-song-num">
                      {isCurrent && isPlaying ? (
                        <div className="zing-playing-indicator">
                          <span className="zing-playing-bar"></span>
                          <span className="zing-playing-bar"></span>
                          <span className="zing-playing-bar"></span>
                          <span className="zing-playing-bar"></span>
                        </div>
                      ) : (
                        <span>{originalIndex + 1}</span>
                      )}
                    </div>
                    <img src={song.image} alt={song.name} className="zing-song-thumb" />
                    <div className="zing-song-info">
                      <div className="zing-song-name">{song.name}</div>
                      <div className="zing-song-singer">{song.singer}</div>
                    </div>
                    <div className="zing-song-duration">{formatTime(240)}</div>
                    <button className="zing-song-play-btn">
                      <i className={isCurrent && isPlaying ? 'fas fa-pause' : 'fas fa-play'}></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* BOTTOM PLAYER */}
      <footer className="zing-player">
        <div className="zing-player-left">
          {currentSong && (
            <>
              <img src={currentSong.image} alt={currentSong.name} className="zing-player-thumb" />
              <div className="zing-player-info">
                <div className="zing-player-name">{currentSong.name}</div>
                <div className="zing-player-artist">{currentSong.singer}</div>
              </div>
              <button className="zing-player-like">
                <i className="far fa-heart"></i>
              </button>
            </>
          )}
        </div>

        <div className="zing-player-center">
          <div className="zing-player-controls">
            <button
              className={`zing-player-btn ${isRandom ? 'active' : ''}`}
              onClick={() => setIsRandom(!isRandom)}
            >
              <i className="fas fa-random"></i>
            </button>
            <button className="zing-player-btn" onClick={playPrev}>
              <i className="fas fa-step-backward"></i>
            </button>
            <button className="zing-player-play-btn" onClick={togglePlay}>
              <i className={isPlaying ? 'fas fa-pause' : 'fas fa-play'}></i>
            </button>
            <button className="zing-player-btn" onClick={playNext}>
              <i className="fas fa-step-forward"></i>
            </button>
            <button
              className={`zing-player-btn ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <i className="fas fa-redo"></i>
            </button>
          </div>
          <div className="zing-player-progress">
            <span className="zing-player-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="zing-player-slider"
            />
            <span className="zing-player-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="zing-player-right">
          <div className="zing-player-volume">
            <i className={volume === 0 ? 'fas fa-volume-mute' : volume < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up'}></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="zing-player-volume-slider"
            />
            <span className="zing-player-volume-percent">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </footer>

      <audio id="zing-audio" preload="metadata" />
    </div>
  )
}

export default PlayerPage
