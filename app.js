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
const nextBnt = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const progressduration = $(".progress__duration")
const progresscurrent = $(".progress__current")
const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    songs : [
      {
        name : 'Lời anh muốn nói',
        singer : 'The Men',
        path : './assests/music/LoiAnhMuonNoi.mp3',
        image : 'https://avatar-ex-swe.nixcdn.com/playlist/2013/11/06/c/c/a/8/1383713136679_500.jpg' 
     },
     {
         name : 'Thương Em Là Điều Anh Không Thể Ngờ',
         singer : 'Noo Phước Thịnh',
         path : './assests/music/ThuongEmLaDieuAnhKhongTheNgo.mp3',
         image : 'https://i.ytimg.com/vi/NryZpeTgLeE/maxresdefault.jpg' 
      },
      {
        name : 'Cause I love you',
        singer : 'Noo Phước Thịnh',
        path : './assests/music/CauseIloveyou.mp3',
        image : 'https://i.ytimg.com/vi/QQrnrBq9yYg/hqdefault.jpg' 
     },
     {
        name : 'Beautiful In White',
        singer : 'Shane Filan',
        path : './assests/music/BeautifulInWhite.mp3',
        image : 'https://i.ytimg.com/vi/Trjrj_fQnIM/mqdefault.jpg' 
     },
     {
        name : '3103-3',
        singer : 'Duongg x Nâu x Titie',
        path : './assests/music/3107-3.mp3',
        image : 'https://kenh14cdn.com/zoom/320_200/203336854389633024/2021/8/3/photo1627997970218-1627997972375860452471.jpg' 
     },
      {
         name : 'Track quẩy Tilo banh nóc',
         singer : 'Dj Tilo',
         path : './assests/music/TrackTiloBanhNoc.mp3',
         image : 'https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/0/a/7/0/ab1f-35df-4ed9-9538-46ce82b7bce0' 
      },
      {
         name : 'Hãy trao cho anh',
         singer : 'Sơn tùng MTP',
         path : './assests/music/HayTraoChoAnh.mp3',
         image : 'https://dep.com.vn/wp-content/uploads/2019/07/deponline-sontung.jpg' 
      },
      {
         name : 'Sóng Gió',
         singer : 'Jack',
         path : './assests/music/SongGio.mp3',
         image : 'https://lyricvn.com/wp-content/uploads/2019/10/836cf31f036fb8f89b78cfd07cd77477.jpg' 
      },
      
{
        name : 'Có hẹn với thanh xuân',
        singer : 'Monstar',
        path : './assests/music/CoHenVoiThanhXuan.mp3',
        image : 'https://i.ytimg.com/vi/vpRi8S6uXAg/maxresdefault.jpg' 
     },
{
        name : 'I do',
        singer : '911',
        path : './assests/music/IDo.mp3',
        image : 'https://i.ytimg.com/vi/XyEz7KeJt-4/maxresdefault.jpg' 
     },
{
        name : 'Muộn rồi mà sao còn',
        singer : 'Sơn Tùng MTP',
        path : './assests/music/MuonRoiMaSaoCon.mp3',
        image : 'https://i.scdn.co/image/ab67616d0000b27329f906fe7a60df7777b02ee1' 
     },
{
        name : 'Yêu nhau nhé bạn thân',
        singer : 'Phạm Đình Thái Ngân',
        path : './assests/music/YeuNhauNheBanThan.mp3',
        image : 'https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/7/4/6/8/7468cda9226c9caa61730a7fe07151f3.jpg' 
     },
     {
        name : 'Chờ em trong đêm',
        singer : 'The Men',
        path : './assests/music/ChoEmTrongDem.mp3',
        image : 'https://assets-vtvcab.gviet.vn/images/hq/posters/Choemtrongdem.jpg' 
     },], 
         render:function(){
            const htmls = this.songs.map((song,index) => {
                return ` <div data-index = '${index}' class="song ${index=== this.currentIndex ? 'active' : ''}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
                </div>
                
              </div>`
            })
            playList.innerHTML = htmls.join('');
         }  ,
         defineProperties : function(){
            Object.defineProperty(this,'currentSong',{
                get : function(){
                    return  this.songs[this.currentIndex];
                }
            })
         },
         handleEvents : function(){
             const _this = this;
             const cdWidth = cd.offsetWidth

            const cdThumbAnimate =  cdThumb.animate([
                {transform : 'rotate(360deg'}
            ],{
                duration : 10000,
                iterations : Infinity
            })
            cdThumbAnimate.pause();


            document.onscroll = function(){
              const scrollTop = window.scrollY || document.documentElement.scrollTop
               const newCdWidth = cdWidth-scrollTop
               cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0
                cd.style.opacity = newCdWidth/cdWidth
            }
            playBtn.onclick  = function(){
                if(_this.isPlaying)
                {
                audio.pause();
                }
                else{
                audio.play();
                }
                
                audio.onplay = function(){
                    _this.isPlaying=true
                    player.classList.add('playing')
                    cdThumbAnimate.play()
                }
                audio.onpause = function(){
                    _this.isPlaying=false
                    player.classList.remove('playing')
                    cdThumbAnimate.pause()

                }
            }
            // New Fix Space button keydown
            window.addEventListener('keydown', function(event){
              const key = event.keyCode || event.which; 
              if(key == 32){
                event.preventDefault();
                audio.paused ? audio.play() : audio.pause();

              }
            })
            //End New Fix ..
            audio.ontimeupdate = function(){
                if(audio.duration){
                    const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                    progress.value = progressPercent
                }
                _this.timeCurrent()
                _this.timeDuration()
            }
            progress.oninput = function(e){
                const seekTime = (audio.duration*e.target.value)/100
                audio.currentTime = seekTime
            }
            nextBnt.onclick = function(){
                if(_this.isRandom)
                {
                    _this.playRandomSong()
                }
                else
                {
                    _this.nextSong()
                    //New Fix .cần thêm vào server
                    playBtn.onclick()
                }
                audio.play()
                
                _this.render()
                _this.scrollToActiveSong()
            }
            prevBtn.onclick = function(){
                if(_this.isRandom)
                {
                    _this.playRandomSong()
                }
                else
                {
                _this.prevSong()
                playBtn.onclick()

                }
                
                audio.play()
                _this.render()
                _this.scrollToActiveSong()
            }
            randomBtn.onclick = function(){
                _this.isRandom = !_this.isRandom
               randomBtn.classList.toggle('active' , _this.isRandom)
            }
            repeatBtn.onclick = function(){
                _this.isRepeat = !_this.isRepeat
               repeatBtn.classList.toggle('active' , _this.isRepeat)
            }

            audio.onended = function(){
                if(_this.isRepeat){
                    audio.play()
                }
                else{
                     nextBnt.click()
                }
               
            }
            playList.onclick = function (e) {
                const songNode = e.target.closest(".song:not(.active)")
          
                if (songNode || e.target.closest(".option")) {
                  //xử lý khi click vào bài hát
                  if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render();
                    //New Fix ..cần thêm vào hosting server
                    playBtn.onclick();
                    audio.play()
                   
                    
                  }
                }
            }
            
            
 },
         scrollToActiveSong: function () {
            setTimeout(() => {
              if (this.currentIndex <= 2) {
                $('.song.active').scrollIntoView({
                  behavior: 'smooth',
                  block: 'end',
                });
              } else {
                $('.song.active').scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }
            }, 300)
          },
         loadCurrentSong : function(){
            heading.textContent = this.currentSong.name
            cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
            audio.src = this.currentSong.path
            if ($('.song.active')) {
                $('.song.active').classList.remove('active');
              }
              const list = $$('.song');
              list.forEach((song) => {
                if (song.getAttribute('data-index') == this.currentIndex) {
                  song.classList.add('active');
                }
              });
         },

            nextSong: function(){
                this.currentIndex++
                if(this.currentIndex >= this.songs.length)
                {
                    this.currentIndex = 0
                }
                this.loadCurrentSong()
            },
            prevSong: function(){
                this.currentIndex--
                if(this.currentIndex < 0)
                {
                    this.currentIndex = this.songs.length-1
                }
                this.loadCurrentSong()
            },
            playRandomSong: function(){
                let newIndex
                do{
                    newIndex = Math.floor(Math.random()*this.songs.length)
                }
                while(newIndex === this.currentIndex)
                this.currentIndex = newIndex
                this.loadCurrentSong()
            },
            formatTime: function (sec_num) {
                let hours = Math.floor(sec_num / 3600);
                let minutes = Math.floor((sec_num - hours * 3600) / 60);
                let seconds = Math.floor(sec_num - hours * 3600 - minutes * 60);
            
                hours = hours < 10 ? (hours > 0 ? '0' + hours : 0) : hours;
            
                if (minutes < 10) {
                  minutes = '0' + minutes;
                }
                if (seconds < 10) {
                  seconds = '0' + seconds;
                }
                return (hours !== 0 ? hours + ':' : '') + minutes + ':' + seconds;
              },
              // hiển thị thời gian bài hát hiện tại
              timeCurrent: function () {
                setInterval(() => {
                  let cur = this.formatTime(audio.currentTime)
                  progresscurrent.textContent = `${cur}`;
                }, 100)
              },
              //hiển thị thời gian bài hát
              timeDuration: function () {
                if (audio.duration) {
                  let dur = this.formatTime(audio.duration)
                  progressduration.textContent = `${dur}`;
                }
              },
         start:function(){
            this.defineProperties()
            this.handleEvents()
            this.loadCurrentSong()
            this.render()
         }
}
app.start()

