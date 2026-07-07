const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const progressduration = $('.progress__duration')
const progresscurrent = $('.progress__current')
const searchInput = $('#search')
const volumeRange = $('#volume')
const volumeBtn = $('.btn-volume')

const fallbackSongs = [
  {
    id: 'fallback-1',
    name: 'Lời anh muốn nói',
    singer: 'The Men',
    path: './assests/music/LoiAnhMuonNoi.mp3',
    image: 'https://avatar-ex-swe.nixcdn.com/playlist/2013/11/06/c/c/a/8/1383713136679_500.jpg'
  },
  {
    id: 'fallback-2',
    name: 'Thương Em Là Điều Anh Không Thể Ngờ',
    singer: 'Noo Phước Thịnh',
    path: './assests/music/ThuongEmLaDieuAnhKhongTheNgo.mp3',
    image: 'https://i.ytimg.com/vi/NryZpeTgLeE/maxresdefault.jpg'
  }
]

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isMuted: false,
  searchText: '',
  songs: [],

  get currentSong() {
    return this.songs[this.currentIndex] || null
  },

  async init() {
    this.handleEvents()
    await this.fetchSongs()
    this.loadCurrentSong()
    this.render()
  },

  async fetchSongs() {
    try {
      const response = await fetch('/api/songs')
      if (!response.ok) {
        throw new Error('Unable to load songs')
      }
      const data = await response.json()
      this.songs = data
    } catch (error) {
      console.error(error)
      this.songs = fallbackSongs
    }
  },

  render() {
    const visibleSongs = this.getVisibleSongs()

    if (!visibleSongs.length) {
      playList.innerHTML = '<div class="empty">Không tìm thấy bài hát phù hợp.</div>'
      return
    }

    const htmls = visibleSongs.map((song) => {
      const isActive = this.currentSong && song.id === this.currentSong.id
      return `
        <div data-id="${song.id}" class="song ${isActive ? 'active' : ''}">
          <div class="thumb" style="background-image: url('${song.image}')"></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
        </div>
      `
    })

    playList.innerHTML = htmls.join('')
  },

  getVisibleSongs() {
    const keyword = this.searchText.trim().toLowerCase()
    if (!keyword) {
      return this.songs
    }

    return this.songs.filter((song) => {
      return song.name.toLowerCase().includes(keyword) || song.singer.toLowerCase().includes(keyword)
    })
  },

  handleEvents() {
    const _this = this
    const cdWidth = cd.offsetWidth

    const cdThumbAnimate = cdThumb.animate(
      [{ transform: 'rotate(360deg)' }],
      { duration: 10000, iterations: Infinity }
    )
    cdThumbAnimate.pause()

    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrollTop
      cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : '0px'
      cd.style.opacity = newCdWidth / cdWidth
    }

    playBtn.onclick = function () {
      _this.togglePlay()
    }

    audio.onplay = function () {
      _this.isPlaying = true
      player.classList.add('playing')
      cdThumbAnimate.play()
    }

    audio.onpause = function () {
      _this.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }

    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
        progress.value = progressPercent
      }
      _this.timeCurrent()
      _this.timeDuration()
    }

    audio.onloadedmetadata = function () {
      _this.timeDuration()
    }

    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        _this.playNext()
      }
    }

    progress.oninput = function (e) {
      const seekTime = (audio.duration * e.target.value) / 100
      audio.currentTime = seekTime
    }

    nextBtn.onclick = function () {
      _this.playNext()
    }

    prevBtn.onclick = function () {
      _this.playPrev()
    }

    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    searchInput.oninput = function () {
      _this.searchText = this.value
      _this.render()
    }

    volumeRange.oninput = function () {
      audio.volume = Number(this.value)
      _this.isMuted = Number(this.value) === 0
      volumeBtn.classList.toggle('active', _this.isMuted)
      volumeBtn.innerHTML = _this.isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>'
    }

    volumeBtn.onclick = function () {
      if (_this.isMuted) {
        audio.volume = Number(volumeRange.value) || 0.5
        _this.isMuted = false
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>'
      } else {
        audio.volume = 0
        _this.isMuted = true
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>'
      }
      volumeBtn.classList.toggle('active', _this.isMuted)
    }

    window.addEventListener('keydown', function (event) {
      if (event.keyCode === 32) {
        event.preventDefault()
        _this.togglePlay()
      }
    })

    playList.onclick = function (e) {
      const songNode = e.target.closest('.song')
      if (!songNode) return

      const songId = songNode.dataset.id
      const songIndex = _this.songs.findIndex((song) => song.id === songId)
      if (songIndex >= 0) {
        _this.currentIndex = songIndex
        _this.loadCurrentSong()
        _this.render()
        _this.togglePlay()
      }
    }
  },

  togglePlay() {
    if (!this.currentSong) return

    if (this.isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  },

  loadCurrentSong() {
    if (!this.currentSong) return

    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
    audio.load()
    progress.value = 0
    progresscurrent.textContent = '00:00'
    progressduration.textContent = '00:00'
    this.render()
    this.scrollToActiveSong()
  },

  playNext() {
    if (!this.songs.length) return

    if (this.isRandom) {
      this.playRandomSong()
      return
    }

    this.currentIndex = (this.currentIndex + 1) % this.songs.length
    this.loadCurrentSong()
    if (this.isPlaying) {
      audio.play().catch(() => {})
    }
  },

  playPrev() {
    if (!this.songs.length) return

    if (this.isRandom) {
      this.playRandomSong()
      return
    }

    this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length
    this.loadCurrentSong()
    if (this.isPlaying) {
      audio.play().catch(() => {})
    }
  },

  playRandomSong() {
    if (this.songs.length <= 1) return

    let newIndex = Math.floor(Math.random() * this.songs.length)
    while (newIndex === this.currentIndex) {
      newIndex = Math.floor(Math.random() * this.songs.length)
    }

    this.currentIndex = newIndex
    this.loadCurrentSong()
    if (this.isPlaying) {
      audio.play().catch(() => {})
    }
  },

  formatTime(sec_num) {
    const hours = Math.floor(sec_num / 3600)
    const minutes = Math.floor((sec_num - hours * 3600) / 60)
    const seconds = Math.floor(sec_num - hours * 3600 - minutes * 60)

    const formattedHours = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''
    return `${formattedHours}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  timeCurrent() {
    progresscurrent.textContent = this.formatTime(audio.currentTime || 0)
  },

  timeDuration() {
    if (audio.duration) {
      progressduration.textContent = this.formatTime(audio.duration)
    }
  },

  scrollToActiveSong() {
    setTimeout(() => {
      const activeSong = $('.song.active')
      if (activeSong) {
        activeSong.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}

app.init()

