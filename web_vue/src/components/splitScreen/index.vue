<template>
  <div id="splitScreen">
    <!-- <playerPlugin :playerObj='playerObj'></playerPlugin> -->
    <!-- 中间播放分屏轮播区域 -->
    <div id="centerPlayScreen">
      <!-- <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true" :options="playerOptions">
      </video-player> -->

      <div class="playScreen" @click="clickPlayScreen(1)">
        <playerPlugin v-if="showPlayer1" id="screen_1" :playerObj='playerObj1' @hiddenPlayer='hiddenPlayer'></playerPlugin>
        <div v-else id="screen_1" class="centerAddIco">+</div>
      </div>
       <!-- @click="clickPlayScreen(2)" -->
      <div class="playScreen" @click="clickPlayScreen(2)">
        <playerPlugin v-if="showPlayer2" id="screen_2" :playerObj='playerObj2' @hiddenPlayer='hiddenPlayer'></playerPlugin>
        <div v-else id="screen_2" class="centerAddIco">+</div>
      </div>
      <div class="playScreen" @click="clickPlayScreen(3)">
        <playerPlugin v-if="showPlayer3" id="screen_3" :playerObj='playerObj3' @hiddenPlayer='hiddenPlayer'></playerPlugin>
        <div v-else id="screen_3" class="centerAddIco">+</div>
      </div>
      <div class="playScreen" @click="clickPlayScreen(4)">
        <playerPlugin v-if="showPlayer4" id="screen_4" :playerObj='playerObj4' @hiddenPlayer='hiddenPlayer'></playerPlugin>
        <div v-else id="screen_4" class="centerAddIco">+</div>
      </div>
    </div>
    <div @click="clickChangeStream">点击切换视频流</div>
  </div>
</template>
<style lang="scss">
@import './index.scss';
</style>
<script>
import playerPlugin from '../playPlugin'
import videojs from 'video.js'
window.videojs = videojs
import 'video.js/dist/video-js.css'
// import 'vue-video-player/src/custom-theme.css'
// import { videoPlayer } from 'vue-video-player'
import 'videojs-flash'
import SWF_URL from 'videojs-swf/dist/video-js.swf'

// require('videojs-contrib-hls/dist/videojs-contrib-hls.js')
//引入hls.js
// import 'videojs-contrib-hls'
// import 'videojs-contrib-hls/dist/videojs-contrib-hls.js'

videojs.options.flash.swf = SWF_URL // 设置flash路径，Video.js会在不支持html5的浏览中使用flash播放视频文件
export default {
  components: {
    // videoPlayer
  playerPlugin
},
  data () {
    return {
      showPlayer1: false,
      showPlayer2: false,
      showPlayer3: false,
      showPlayer4: false,
      // playerObj1: {playRef: 'video1',},
      playerObj: {
        playRef: '',
        playSrc: 'https://d1--cn-gotcha203.bilivideo.com/live-bvc/222591/live_7734200_bs_1367666_bluray/index.m3u8?expires=1637727422&len=0&oi=1901187520&pt=h5&qn=10000&trid=100731e41cf4071c472790d3a0cc1c3bb272&sigparams=cdn,expires,len,oi,pt,qn,trid&cdn=cn-gotcha03&sign=0ff5e15daed1cca5ce700e08a23a6d2d&p2p_type=4294967294&src=173&sl=3&free_type=0&flowtype=1&machinezone=jd&sk=c9c6154426932efa80d25af02e87a3bd&source=onetier&order=1',
        playWidth: '100%',
      },
      playerObj1: {},
      playerObj2: {},
      playerObj3: {},
      playerObj4: {},
      videoSrc: '',
      playerOptions: {
        live: true,
        autoplay: true, // 如果true，浏览器准备好时开始播放
        muted: false, // 默认情况下将会消除任何音频
        loop: false, // 是否视频一结束就重新开始
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        aspectRatio: '4:3', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        controlBar: {
          timeDivider: false,
          durationDisplay: false,
          remainingTimeDisplay: false,
          currentTimeDisplay: false, // 当前时间
          volumeControl: false, // 声音控制键
          playToggle: false, // 暂停和播放键
          progressControl: false, // 进度条
          fullscreenToggle: false // 全屏按钮
        },
        // html: {
        //   hls: {
        //     withCredentials: false
        //   }
        // },
        techOrder: ['html5'], // 兼容顺序
        sources: [
          // {type: 'application/x-mpegURL', src: 'http://iqiyi.cdn9-okzy.com/20200916/15483_11c434b2/index.m3u8', withCredentials: false}
        //   {
        //   type: '', //'rtmp/flv',
        //   src: '' // 视频地址-改变它的值播放的视频会改变
        // }
        ],
        notSupportedMessage: '此视频暂无法播放，请稍后再试' // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
      }
    }
  },
  methods: {
    clickPlayScreen (num) {
      this['showPlayer' + num] = true
      // 深拷贝数据防止多次调用同一组件时赋值造成的数据污染
      let playerObjUse = JSON.parse(JSON.stringify(this.playerObj))
      playerObjUse.playRef = 'video' + num
      this['playerObj' + num] = playerObjUse
      // this.$api.play.getPlayUrl({
      //   sn: '1jfiegbqc1mxq',
      //   profile_token: 'p3'
      // }).then(res => {
      //   console.log(res, 'getPlayUrl_res')
      //   console.log(this.playerObj1, 'before this.playerObj1')
      //   // flash (测试成功)
      //   // this.$set(this.playerOptions, 'flash', {hls:{withCredentials: false}, swf: SWF_URL})
      //   // this.$set(this.playerOptions, 'techOrder', ['flash'])
      //   // this.$set(this.playerOptions, 'sources', [{type: 'rtmp/flv', src: 'rtmp://202.69.69.180:443/webcast/bshdlive-pc'}])
      //   // hls
      //   // this.$set(this.playerOptions, 'hls', true)
      //   // //'rtmp/flv' res.data.uri.url + '.m3u8'
      //   // this.$set(this.playerOptions, 'sources', [{ type: 'application/x-mpegURL', src: res.data.uri.url + '.m3u8', withCredentials: true }])
      //   // console.log(this.playerOptions, 'playerOptions')
      //   this.$set(this.playerObj1, 'playSrc', res.data.uri.url + '.m3u8')
      //   console.log(this.playerObj1, 'after this.playerObj1')
      // })
    },
    clickChangeStream () {
      this.$set(this.playerObj1, 'playSrc', 'https://d1--cn-gotcha208.bilivideo.com/live-bvc/864737/live_1596341281_80944351/index.m3u8?expires=1637727531&len=0&oi=1901187520&pt=h5&qn=10000&trid=1007d5fcaa2554464acbbb1fa5ef73a4419e&sigparams=cdn,expires,len,oi,pt,qn,trid&cdn=cn-gotcha08&sign=5c955cb1d2331b8aa461e4c262e32be5&p2p_type=4294967294&src=5&sl=2&free_type=0&flowtype=1&machinezone=jd&sk=c9c6154426932efa80d25af02e87a3bd&source=onetier&order=1')
      console.log(this.playerObj1, 'playerObj1改变后')
    },
    hiddenPlayer (data) {
      console.log(data, 'hiddenPlayerData')
      this['showPlayer' + data] = false
    }
  },
  mounted () {
    console.log('enter split Screen')
  }
}
</script>