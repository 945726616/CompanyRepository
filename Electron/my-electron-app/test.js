if (flvjs.isSupported()) {
  const videoElement = document.getElementById('videoPlayer')
  console.log(videoElement, 'videoElement')
  console.log(flvjs, 'flvjs')
  const play = document.getElementById('play')
  const flvPlayer = flvjs.createPlayer({
    type: 'flv',
    isLive: true,
    // hasAudio: false,
    url: 'rtmp://127.0.0.1:1935/live/test',
  }, {
    enableStashBuffer: true,
  })
  flvPlayer.attachMediaElement(videoElement)
  play.onclick = () => {
    console.log('click play btn')
    flvPlayer.load()
    console.log('do load')
    flvPlayer.play()
    console.log('do play')
  }
}