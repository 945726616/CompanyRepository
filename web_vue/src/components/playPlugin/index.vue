<template>
  <div v-show='playerObj' :style='{width: playerObj.playWidth}'>
    <!-- 客户端播放器插件 -->
    <div id="playerAreaClient" v-if="clientFlag">
      <!-- 播放部分核心结构 -->
      <object v-show="playerObj.playRef" :ref="playerObj.playRef" width="100%" height="100%" codebase="mme/npmme.xpi" type="application/mining-media-enginex">
        <!-- <param name='mme_on_event' :value="'plug_' + playerObj.playRef + '_on_event'"/>playTest -->
        <param name='mme_on_event' value="testParam" />
        <param name='windowless' value='true' />
        <param name='mme_params' value="{key:'data:application/octet-stream;base64,OenOl2/PvPX7EuqqZdvMsNf5PqEOlOJZ4sROOBtnvW8F6Fc+azokLNtti6Cb/oiuO9qhOxvDfL8cVpGY4UcCe81OIVHkbiNzuHKwiE+K6gmmWwIoHgSRn2RN4qsZO62QkqGePdR6L94n2ruSeixjqAgWFTW8AIlQptovRZSN1Dh/8M87RIRdYyVFqKqsZoZTYibPLyDFONKIqxzrFkJPtqR/wn8jnYMc1qUH/w3IYJZh/OqctPTDp8tYuQSWN3EE6+kVmDIMV9F92SZJORMnvxy+zYzpbO7Gz44fBQNQSGMelsf7yQpfTF/X8t1Qn73fu53xp3MTIGH0kklFH2tMPkO/Raelhw5A4JQbczWg0n4pcNxpRl6mCEIjFprTboJ/B2eI0qUX/zTPM7l1hBmxjxsewORsXp0y2+NnCRH0uVBGUq6fOWrdhJwotIIu5ZAZwdoDZZu6eaycol2TIS5smusoD0ODPtQ2xZoCy7djIC4MVhB5uKe0zDXbLr+Serdlq6en5HyvUN0EEmYle0fORmgNFn0DTqqTab6cx8WfFkysciJSveN4swoR66qMQUi9+TfkHTnZ/REp3kHJtSq8XJyzTe+KCXlJXGx07nAbK4svIPanx39A5o5XlpLK/ohxiMpEJZ6OhmWb9yAnL+8Bedw+epvbNQkhADh2QqB4ItsIq5KTOsNzA0aNn3FEXzyd7WLVBqcF1lUVxu1vpYRPKv01im1ORbVhDoJ9eiqkfchutpAGYOwhYzxFWOIhTMouY+m/oQhc1d8FF4T+zSx6WVmj2f+RDUdOKbQVxJdEeiGKyIDm14K34Kz+RdzF0fY50sbs/SUfMWwuKQsEPFU5KQ'}" />
      </object>
    </div>
    <!-- 浏览器播放器插件 -->
    <div id="playerAreaBrowser" v-else>
      <video v-show="playerObj.playRef" :id="playerObj.playRef" :ref="playerObj.playRef" class="video-js vjs-default-skin vjs-big-play-centered">{{mcs_download_client}}</video>
    </div>
    <div class="delPlayer" @click.stop="clickDelPlayer">删除</div>
  </div>
</template>
<style lang="scss">
.delPlayer {
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: pointer;
}
</style>
<script>
import videojs from "video.js"
//播放器中文，不能使用.js文件
// import videozhCN from "video.js/dist/lang/zh-CN.json";
//样式文件注意要加上
import "video.js/dist/video-js.css"
//如果要播放RTMP要使用flash 需要先npm i videojs-flash
import "videojs-flash"
export default {
  props: { // 组件封装传递参数
    playerObj: { // 调用播放器插件播放需要传递的传递的参数
      type: Object,
      default: function () { }
    },
  },
  data () {
    return {
      player: null, // 播放器对象
      mcs_download_client: mcs_download_client, // 浏览器不支持插件，请下载Vimtag客户端
      clientFlag: window.fujikam === 'fujikam' ? true : false,
      saveOptions: {},
      savePlayObj: {}
    }
  },
  watch: {
    playerObj: {
      handler (newVal) {
        console.log(newVal, this.savePlayObj, 'watch')
        if (newVal.playRef !== this.savePlayObj.playRef)
        return
        // this.$refs[newVal.playRef].src = newVal.playSrc
        this.saveOptions.sources.src = newVal.playSrc
        this.player.reset()
        this.player.src([
          {
            type: this.saveOptions.sources.type,
            src: newVal.playSrc
          }
        ])
        this.player.load()
        this.player.play()
      },
      deep: true
    }
  },
  methods: {
    clickDelPlayer () { // 点击删除时注销播放器
      this.player.dispose()
      this.$emit('hiddenPlayer', this.playerObj.playRef.charAt(this.playerObj.playRef.length - 1))
    }
  },
  //初始化播放器
  mounted () {
    this.savePlayObj = JSON.parse(JSON.stringify(this.playerObj))
    console.log('clientFlag', this.clientFlag)
    if (this.clientFlag) {
      console.log('enter playPlugin', this.playerObj, this.$refs[this.playerObj.playRef])
      this.$refs[this.playerObj.playRef].chl_create(this.playerObj.playTest)
      return
    }
    console.log('enter playPlugin', this.playerObj, this.$refs[this.playerObj.playRef])
    let options = {
      autoplay: true, //自动播放
      // controls: true, // 控制条展示
      // controlBar: {
      //   timeDivider: false,
      //   durationDisplay: false,
      //   remainingTimeDisplay: false,
      //   currentTimeDisplay: false, // 当前时间
      //   volumeControl: false, // 声音控制键
      //   playToggle: false, // 暂停和播放键
      //   progressControl: false, // 进度条
      //   fullscreenToggle: false // 全屏按钮
      // },
      preload: "auto", //自动加载
      errorDisplay: true, //错误展示
      fluid: true, //跟随外层容器变化大小，跟随的是外层宽度
      // controlBar: true,  // 设为false不渲染控制条DOM元素，只设置controls为false虽然不展示，但是存在
      // textTrackDisplay: false,  // 不渲染字幕相关DOM
      userActions: {
        hotkeys: true //是否支持热键
      },
      notSupportedMessage: "此视频暂无法播放，请稍后再试",
      // techOrder: ["flash"],//定义Video.js技术首选的顺序 "html5",
      // techOrder: ["html5"],
      // sources: [
      //   {
      //     // type: 'rtmp/flv',
      //     // src: 'rtmp://45.113.201.2:6010/live/1jfiegbqwrviq_p0_LIRAAXECKUQA'
      //     type:'application/x-mpegURL',
      //     src: 'http://iqiyi.cdn9-okzy.com/20200916/15483_11c434b2/index.m3u8'
      //     //type: 'rtmp/flv',
      //   }
      // ]
    }
    if (this.publicFunc.hasUsableFlash()) { // 判断flash是否开启方法 true为开启了flash false为关闭flash
      options.techOrder = ['flash'] // 启用flash解析
      options.sources = [{ type: 'rtmp/flv', src: 'rtmp://45.113.201.2:6010/live/1jfiegbqwrviq_p0_LIRAAXECKUQA' }]
    } else {
      options.techOrder = ['html5'] // 启用html5解析
      options.sources = [{ type: 'application/x-mpegURL', src: this.playerObj.playSrc }]
    }
    this.saveOptions = options
    this.player = videojs(
      this.$refs[this.playerObj.playRef],
      options,
      function onPlayerReady () {
        videojs.log(`Your player is ready!`, this.player)
      }
    )
    console.log(this.player, 'this.player')
    // this.player2 = videojs(
    //   this.$refs.videoNode2,
    //   options,
    //   function onPlayerReady () {
    //     videojs.log(`Your player is ready!`)
    //   }
    // )
    // this.player3 = videojs(
    //   this.$refs.videoNode3,
    //   options,
    //   function onPlayerReady () {
    //     videojs.log(`Your player is ready!`)
    //   }
    // )
    // this.player4 = videojs(
    //   this.$refs.videoNode4,
    //   options,
    //   function onPlayerReady () {
    //     videojs.log(`Your player is ready!`)
    //   }
    // )
  },
  // 页面注销时注销所有播放器
  beforeDestroy () {
    if (this.player) {
      this.player.dispose()
    }
    // if (this.player2) {
    //   this.player2.dispose()
    // }
    // if (this.player3) {
    //   this.player3.dispose()
    // }
    // if (this.player4) {
    //   this.player4.dispose()
    // }
  }
}
</script>