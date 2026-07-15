import { useEffect, useMemo, useState } from 'react'

const fallbackSongs = [
  {
    id: 'fallback-1',
    name: 'Lời anh muốn nói',
    singer: 'The Men',
    path: '/assests/music/LờiAnhMuốnNói.mp3',
    image: 'https://avatar-ex-swe.nixcdn.com/playlist/2013/11/06/c/c/a/8/1383713136679_500.jpg',
    album: 'Unknown Album'
  },
  {
    id: 'fallback-2',
    name: 'Thương Em Là Điều Anh Không Thể Ngờ',
    singer: 'Noo Phước Thịnh',
    path: '/assests/music/ThươngEmLàĐiềuAnhKhôngThểNgờ.mp3',
    image: 'https://i.ytimg.com/vi/NryZpeTgLeE/maxresdefault.jpg',
    album: 'Unknown Album'
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
  const [activeNav, setActiveNav] = useState('khám phá')
  const [activeRegion, setActiveRegion] = useState('việt nam')

  const currentSong = songs[currentIndex] || null

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/songs')
        const data = await response.json()
        if (data?.length) {
          const songsWithAlbum = data.map(song => ({
            ...song,
            album: song.album || 'Unknown Album'
          }))
          setSongs(songsWithAlbum)
        }
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
    if (!value || isNaN(value)) return '0:00'
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = async () => {
    const audio = document.getElementById('d4t-audio')
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
      while (newIndex === currentIndex && songs.length > 1) {
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
    const audio = document.getElementById('d4t-audio')
    if (!audio || !currentSong) return

    audio.src = currentSong.path
    audio.load()
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [currentSong])

  useEffect(() => {
    const audio = document.getElementById('d4t-audio')
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
    const audio = document.getElementById('d4t-audio')
    if (audio) audio.volume = volume
  }, [volume])

  const handleSongClick = (song, index) => {
    const actualIndex = songs.findIndex((s) => s.id === song.id)
    if (actualIndex !== -1) {
      setCurrentIndex(actualIndex)
      setTimeout(() => {
        const audio = document.getElementById('d4t-audio')
        if (audio) {
          audio.play().then(() => setIsPlaying(true)).catch(err => console.log(err))
        }
      }, 50)
    }
  }

  const handleProgressChange = (e) => {
    const audio = document.getElementById('d4t-audio')
    if (!audio || !audio.duration) return
    const newProgress = Number(e.target.value)
    const seekTo = (newProgress / 100) * audio.duration
    audio.currentTime = seekTo
    setProgress(newProgress)
  }

  return (
    <div className="d4t-container">
      {/* TOP HEADER */}
      <header className="d4t-header">
        <div className="d4t-logo">
          <i className="fas fa-music"></i>
          <span>D4T MP3</span>
        </div>
        
        <div className="d4t-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <nav className="d4t-nav">
          {['khám phá', 'top chart', 'radio', 'theo dõi'].map((item) => (
            <div
              key={item}
              className={`d4t-nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="d4t-header-right">
          <div className="d4t-user">
            <i className="fas fa-user-circle"></i>
            <span>{user.username}</span>
          </div>
          <button className="d4t-logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="d4t-main">
        {/* TOP LINKS */}
        <div className="d4t-top-links">
          <button className="d4t-play-btn-main" onClick={togglePlay}>
            <i className="fas fa-play"></i>
            <span>Phát nhạc mới phát hành</span>
          </button>
          
          {['nhạc mới', 'thể loại', 'top 100', 'mv', 'gần đây'].map((item) => (
            <div
              key={item}
              className="d4t-top-link"
              onClick={() => console.log(item)}
            >
              <i className={`fas fa-${item === 'nhạc mới' ? 'music' : item === 'thể loại' ? 'th' : item === 'top 100' ? 'star' : item === 'mv' ? 'video' : 'history'}`}></i>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* REGION TABS */}
        <div className="d4t-region-tabs">
          {['việt nam', 'quốc tế'].map((region) => (
            <button
              key={region}
              className={`d4t-region-tab ${activeRegion === region ? 'active' : ''}`}
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>

        {/* SONG LIST */}
        <section>
          <h2 className="d4t-section-title">Top Chart</h2>
          <div className="d4t-song-list">
            {visibleSongs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const originalIndex = songs.findIndex(s => s.id === song.id);
              return (
                <div
                  key={song.id}
                  className={`d4t-song-item ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleSongClick(song, index)}
                >
                  <div className="d4t-song-num">
                    {isCurrent && isPlaying ? (
                      <div className="d4t-playing-indicator">
                        <span className="d4t-playing-bar"></span>
                        <span className="d4t-playing-bar"></span>
                        <span className="d4t-playing-bar"></span>
                        <span className="d4t-playing-bar"></span>
                      </div>
                    ) : (
                      <span>{originalIndex + 1}</span>
                    )}
                  </div>
                  <img src={song.image} alt={song.name} className="d4t-song-thumb" />
                  <div className="d4t-song-info">
                    <div className="d4t-song-name">{song.name}</div>
                    <div className="d4t-song-singer">{song.singer}</div>
                  </div>
                  <div className="d4t-song-album">{song.album}</div>
                  <div className="d4t-song-duration">{formatTime(240)}</div>
                  <button className="d4t-song-play-btn">
                    <i className={isCurrent && isPlaying ? 'fas fa-pause' : 'fas fa-play'}></i>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* BOTTOM PLAYER */}
      <footer className="d4t-player">
        <div className="d4t-player-left">
          {currentSong && (
            <>
              <img src={currentSong.image} alt={currentSong.name} className="d4t-player-thumb" />
              <div className="d4t-player-info">
                <div className="d4t-player-name">{currentSong.name}</div>
                <div className="d4t-player-artist">{currentSong.singer}</div>
              </div>
              <button className="d4t-player-like">
                <i className="far fa-heart"></i>
              </button>
            </>
          )}
        </div>

        <div className="d4t-player-center">
          <div className="d4t-player-controls">
            <button
              className={`d4t-player-btn ${isRandom ? 'active' : ''}`}
              onClick={() => setIsRandom(!isRandom)}
            >
              <i className="fas fa-random"></i>
            </button>
            <button className="d4t-player-btn" onClick={playPrev}>
              <i className="fas fa-step-backward"></i>
            </button>
            <button className="d4t-player-play-btn" onClick={togglePlay}>
              <i className={isPlaying ? 'fas fa-pause' : 'fas fa-play'}></i>
            </button>
            <button className="d4t-player-btn" onClick={playNext}>
              <i className="fas fa-step-forward"></i>
            </button>
            <button
              className={`d4t-player-btn ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <i className="fas fa-redo"></i>
            </button>
          </div>
          <div className="d4t-player-progress">
            <span className="d4t-player-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="d4t-player-slider"
            />
            <span className="d4t-player-time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="d4t-player-right">
          <div className="d4t-player-volume">
            <i className={volume === 0 ? 'fas fa-volume-mute' : volume < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up'}></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="d4t-player-volume-slider"
            />
          </div>
        </div>
      </footer>

      <audio id="d4t-audio" preload="metadata" />
    </div>
  )
}

export default PlayerPage