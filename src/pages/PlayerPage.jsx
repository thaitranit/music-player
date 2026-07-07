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
  const [audioReady, setAudioReady] = useState(false)

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
    const audio = document.getElementById('react-audio')
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
    const audio = document.getElementById('react-audio')
    if (!audio || !currentSong) return

    audio.src = currentSong.path
    audio.load()
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setAudioReady(false)
    setIsPlaying(false)
  }, [currentSong])

  useEffect(() => {
    const audio = document.getElementById('react-audio')
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }

    const handleLoaded = () => {
      setDuration(audio.duration || 0)
      setAudioReady(true)
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
    const audio = document.getElementById('react-audio')
    if (audio) audio.volume = volume
  }, [volume])

  const handleSongClick = (song) => {
    const idx = songs.findIndex((s) => s.id === song.id)
    if (idx !== -1) {
      setCurrentIndex(idx)
      // Auto play on select
      setTimeout(() => {
        const audio = document.getElementById('react-audio')
        if (audio) {
          audio.play().then(() => setIsPlaying(true)).catch(err => console.log(err))
        }
      }, 50)
    }
  }

  return (
    <div className="spotify-container">
      {/* LEFT SIDEBAR */}
      <div className="spotify-sidebar">
        <div className="spotify-logo">
          <i className="fab fa-spotify" />
          <span>Spotify</span>
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-item active">
            <i className="fas fa-home" />
            <span>Trang chủ</span>
          </div>
          <div className="menu-item">
            <i className="fas fa-compass" />
            <span>Khám phá</span>
          </div>
          <div className="menu-item">
            <i className="fas fa-book-open" />
            <span>Thư viện</span>
          </div>
        </div>

        <div className="sidebar-library">
          <div className="library-header">
            <i className="fas fa-music" />
            <span>Danh sách bài hát</span>
          </div>
          
          <div className="sidebar-search">
            <i className="fas fa-search search-icon-inner" />
            <input
              type="text"
              placeholder="Tìm kiếm bài hát..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-playlist-list">
            {visibleSongs.map((song) => (
              <div 
                key={song.id} 
                className={`sidebar-playlist-item ${currentSong?.id === song.id ? 'active' : ''}`}
                onClick={() => handleSongClick(song)}
              >
                <div className="playlist-mini-thumb" style={{ backgroundImage: `url('${song.image}')` }} />
                <div className="playlist-mini-info">
                  <div className="playlist-mini-name">{song.name}</div>
                  <div className="playlist-mini-singer">{song.singer}</div>
                </div>
                {currentSong?.id === song.id && isPlaying && (
                  <div className="playing-indicator">
                    <span className="bar" />
                    <span className="bar" />
                    <span className="bar" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="spotify-main">
        {/* HEADER */}
        <div className="main-header">
          <div className="navigation-arrows">
            <button className="arrow-btn"><i className="fas fa-chevron-left" /></button>
            <button className="arrow-btn"><i className="fas fa-chevron-right" /></button>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <i className="fas fa-user-circle" />
              <span>{user.username}</span>
            </div>
            <button className="spotify-logout-btn" onClick={onLogout}>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* HERO BANNER - CURRENT SONG */}
        <div className="spotify-hero" style={{ 
          background: currentSong 
            ? `linear-gradient(rgba(0,0,0,0.4), #121212), url('${currentSong.image}') no-repeat center/cover`
            : 'linear-gradient(#4f46e5, #121212)'
        }}>
          <div className="hero-content">
            <div className="hero-badge">PLAYLIST ĐANG PHÁT</div>
            <h1 className="hero-title">{currentSong?.name || 'Chọn một bài hát'}</h1>
            <p className="hero-artist">
              <i className="fas fa-user" /> {currentSong?.singer || 'Hệ thống'} • {songs.length} bài hát
            </p>
          </div>
        </div>

        {/* SONG LIST TABLE */}
        <div className="tracklist-container">
          <div className="tracklist-header">
            <span className="col-num">#</span>
            <span className="col-title">TIÊU ĐỀ</span>
            <span className="col-album">NGHỆ SĨ</span>
            <span className="col-duration"><i className="far fa-clock" /></span>
          </div>

          <div className="tracklist-body">
            {visibleSongs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div 
                  key={song.id} 
                  className={`tracklist-row ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleSongClick(song)}
                >
                  <span className="col-num">
                    {isCurrent && isPlaying ? (
                      <i className="fas fa-volume-up text-spotify-green" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="col-title">
                    <img src={song.image} alt={song.name} className="track-thumb-img" />
                    <div className="track-name-desc">
                      <div className={`track-title-text ${isCurrent ? 'text-spotify-green' : ''}`}>
                        {song.name}
                      </div>
                    </div>
                  </span>
                  <span className="col-album">{song.singer}</span>
                  <span className="col-duration">
                    <button className="track-row-play-btn">
                      <i className={isCurrent && isPlaying ? "fas fa-pause" : "fas fa-play"} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM PLAYBACK BAR */}
      <div className="spotify-player-bar">
        {/* Track info */}
        <div className="player-track-info">
          {currentSong && (
            <>
              <img src={currentSong.image} alt={currentSong.name} className="player-track-thumb" />
              <div className="player-track-details">
                <div className="player-track-name">{currentSong.name}</div>
                <div className="player-track-artist">{currentSong.singer}</div>
              </div>
              <button className="player-heart-btn">
                <i className="far fa-heart" />
              </button>
            </>
          )}
        </div>

        {/* Middle controls */}
        <div className="player-main-controls">
          <div className="playback-buttons">
            <button 
              className={`control-icon-btn ${isRandom ? 'active' : ''}`} 
              onClick={() => setIsRandom(!isRandom)}
              title="Trộn bài"
            >
              <i className="fas fa-random" />
            </button>
            <button className="control-icon-btn" onClick={playPrev} title="Bài trước">
              <i className="fas fa-step-backward" />
            </button>
            <button className="play-circle-btn" onClick={togglePlay} title={isPlaying ? "Tạm dừng" : "Phát"}>
              <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} />
            </button>
            <button className="control-icon-btn" onClick={playNext} title="Bài tiếp theo">
              <i className="fas fa-step-forward" />
            </button>
            <button 
              className={`control-icon-btn ${isRepeat ? 'active' : ''}`} 
              onClick={() => setIsRepeat(!isRepeat)}
              title="Lặp lại"
            >
              <i className="fas fa-redo" />
            </button>
          </div>

          <div className="progress-timeline">
            <span className="time-text">{formatTime(currentTime)}</span>
            <div className="timeline-slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  const audio = document.getElementById('react-audio')
                  if (!audio || !audio.duration) return
                  const seekTo = (Number(e.target.value) / 100) * audio.duration
                  audio.currentTime = seekTo
                  setProgress(Number(e.target.value))
                }}
                className="timeline-slider"
              />
            </div>
            <span className="time-text">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right tools / Volume */}
        <div className="player-right-controls">
          <i className="fas fa-list-ul extra-icon" title="Danh sách chờ" />
          <i className="fas fa-laptop-code extra-icon" title="Thiết bị kết nối" />
          <div className="volume-slider-container">
            <i className={volume === 0 ? "fas fa-volume-mute" : volume < 0.5 ? "fas fa-volume-down" : "fas fa-volume-up"} />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))} 
              className="volume-slider"
            />
            <span className="volume-percent">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      <audio id="react-audio" preload="metadata" />
    </div>
  )
}

export default PlayerPage
