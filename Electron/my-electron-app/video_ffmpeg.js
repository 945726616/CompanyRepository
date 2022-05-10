console.log('enter ffmpeg.js')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg')
const ffprobePath = require('@ffprobe-installer/ffprobe')

ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

console.log(ffmpegPath.path, 'ffmpegPath.path')
console.log(ffprobePath.path, 'ffprobePath.path')

ffmpeg()
  .input('./test.mp4')
  .on('progress', function(progress) {
    console.log('Processing: ' + progress.percent + '% done');
  })
console.log(11111)
ffmpeg('./test.mp4')
  .on('codecData', function (data) {
      console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
})