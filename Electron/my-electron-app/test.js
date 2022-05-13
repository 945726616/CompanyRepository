if (flvjs.isSupported()) {
  const videoElement = document.getElementById('videoPlayer')
  console.log(videoElement, 'videoElement')
  console.log(flvjs, 'flvjs')
  const play = document.getElementById('play')
  const flvPlayer = flvjs.createPlayer({
    type: 'flv',
    isLive: true,
    // hasAudio: false,
    url: 'http://localhost:8000/live/STREAM_NAME.flv',
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