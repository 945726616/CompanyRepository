<template>
  <div id="playback">
    <div id="playback_box">
      <!-- vimtag专属返回栏 -->
      <div id="page_top_menu" v-show="!$store.state.jumpPageData.projectFlag">
        <div id="back" @click="clickBack">
          <div id="main_title_box_return_img"></div>
          {{ mcs_back }}
        </div>
      </div>
      <!-- vimtag专属返回栏 结束 -->
      <div id="playback_view">
        <div id="playback_buffer_ret" ref='downloadBufferFlag'>
          <!-- 下载弹窗 -->
          <div id='download_info_box'>
            <div id='download_progress'>{{downloadPercent}}</div>
            <div id='download_stop' @click="clickDownloadStop">{{mcs_stop}}</div>
            <div id='download_pause' @click="clickDownloadPause">{{downloadShowWorld}}</div>
          </div>
          <!-- 下载弹窗结束 -->
        </div>
        <!-- 顶部数据传输kb值暂时条 -->
        <div id='topClientP2Ping' v-show="clientFlag">{{clientP2PingValue}}</div>
        <!-- 回放视频播放 -->
        <div id="playback_screen">
          <!-- 暂停播放遮罩层 -->
          <div id="play_view_box" @click="clickPlayViewBox" v-show="!is_playing">
            <div id="play_pause_pic"></div>
          </div>
          <!-- 客户端部分视频播放区域 -->
          <div v-show="clientFlag && is_playing" id="play_img">
            <canvas id="video" ref="video" @dblclick="clickFullScreen"></canvas>
          </div>
        </div>
        <!-- 回放视频播放 结束 -->
        <!-- 播放菜单控制 -->
        <div id="playback_menu_box" ref="playback_menu_box">
          <div id="play_menu_left" ref="play_menu_left">
            <div id="video_play" :class="{'video_play_stop':!is_playing, 'video_play_start': is_playing }"
              @click="clickPlay"></div>
            <div id="playback_start_time" v-show="clientFlag">
              {{ start_time_show }}
            </div>
          </div>
          <!-- 进度条展示 -->
          <div id="playback_progress_bar" ref="playback_progress_bar" v-show="clientFlag">
            <progress-bar :percent="percent" :progressWidth="progressWidth" @percentChange="setProgress" @videoPlaySignal="playVideo"></progress-bar>
            <!-- 进度条组件(传递进度百分比) -->
          </div>
          <!-- 进度条展示 结束 -->
          <div id="play_menu_right" ref="play_menu_right" v-show="clientFlag">
            <div id="playback_end_time">
              {{ end_time_show }}
            </div>
            <div id="playback_download_img" v-show="clientFlag" @click="downloadBoxFlag = true"></div>
            <!-- 声音开关暂且注释 -->
            <!-- <div id="playback_voice_close" class="voice_close_open" v-show="clientFlag" @click="clickVoice($event)"></div> -->
          </div>
        </div>
        <!-- 播放菜单控制 结束 -->
        <!-- 下载提示弹窗  v-show="downloadBoxFlag"-->
        <div id="playback_download_path_box" v-show="downloadBoxFlag">
          <div id="playback_download_path_main">
            <span>{{ mcs_input_download_path }}</span>
            <input id="playback_download_path_input" :value="folderPath" type="text" />
            <button @click="selectFolder">选择下载目录</button>
          </div>
          <div id="playback_download_path_cancel" @click="downloadBoxFlag = false">{{ mcs_cancel }}</div>
          <div id="playback_download_path_submit" @click="clickDownloadSubmit">{{ mcs_ok }}</div>
        </div>
        <!-- 下载提示弹窗 结束 -->
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import './index.scss';
</style>
<script>
import "@/lib/plugins/slider.js"
import fdSliderController from "../../util/fdSliderController"
import languageSelect from "../../lib/exportModule/languageSelect.js"
import progressBar from './playBackSlider'
import WebglScreen from '../../lib/plugins/WebglScreen.js'
export default {
  components: {
    progressBar,
  },
  data () {
    return {
      //多国语言
      mcs_back: mcs_back,
      mcs_input_download_path: mcs_input_download_path,
      mcs_cancel: mcs_cancel,
      mcs_ok: mcs_ok,
      mcs_stop: mcs_stop,
      mcs_pause: mcs_pause,
      mcs_continue: mcs_continue,
      // 多国语言 结束
      createPlaybackObj: null, // 页面使用的obj
      video_flag_arr: [], // 移动侦测标记集合
      start_time: null, // 视频开始时间(时间戳)
      start_time_show: null, // 视频当前时间/开始时间(展示值)
      end_time: null, // 视频结束时间
      end_time_show: null, // 视频结束时间(展示值)
      is_playing: 0, // 播放状态记录 0: 未播放 1: 播放
      videoSize: 0, // 视频大小记录
      first: sessionStorage.getItem('play_first') ? sessionStorage.getItem('play_first') : false, // 是否第一次播放
      bo_type: sessionStorage.getItem('bo_type') ? sessionStorage.getItem('bo_type') : false, // 播放类型
      play_back_token: null, // 回放token
      b_start_time: null, // 原始开始时间(该时间不变, 始终未回放视频最开始的时间)
      clientFlag: this.$store.state.user.clientFlag, // 客户端判别标识(true: 客户端, false: 网页端)
      play_progress: null, // 回放进度条参数
      percent: 0, // 传递至进度条组件的百分比
      progressWidth: 300, // 传递至进度条组件的进度条宽度
      downloadBoxFlag: false, // 下载提示框标识
      downloadShowWorld: null, // 下载中暂停/开始按钮文字
      clientP2PingValue: '0kB', // 客户端视频播放流数据值显示
      downloadFlag: this.$store.state.jumpPageData.playbackDownloadFlag, // 下载标识
      listenFunc: null, // 监听函数
      pageData: null, // 页面传递的参数
      scheduled: false, // canvas标识
      queue: [], // 队列
      renderer: null,
      video: document.getElementById('video'),
      canvasInitFlag: false, // canvas初始化标识
      playBackViewWidth: null, // 回放窗口宽度
      playBackViewHeight: null, // 回放窗口高度
      folderPath: '', // 下载文件存放路径
      queryData: {}, // 插件查询结果返回对象
      downloadPercent: '0%', // 下载的百分比
    }
  },
  methods: {
    create_playback_page (obj) {
      console.log(obj, '进入create_playBack_page函数的obj')
      this.createPlaybackObj = obj // 存储调用时的obj内容
      this.$store.dispatch('setPlayBackObj', this.createPlaybackObj)
      if (obj.data) { // 移动侦测标识数组
        for (let j = 0; j < obj.data.length; j++) {
          this.video_flag_arr.push(obj.data[j].f)
        }
      }

      if (this.publicFunc.mx("#playback_download_path_input")) { // 下载地址填充(windos: c:/downloads/  其他(mac): /Users/Shared/)
        this.folderPath = (navigator.platform.indexOf("Win") > -1 ? ('c:/downloads') : ('/Users/Shared'))
      }
      // 回放页面相关尺寸设置
      let l_dom_playback_view = this.publicFunc.mx("#playback_view")
      let l_dom_playback_screen = this.publicFunc.mx("#playback_screen")
      let l_dom_playback_menu_box = this.publicFunc.mx("#playback_menu_box")
      let l_height = this.publicFunc.mx("#top").offsetWidth * 0.4 + 11
      let l_playback_menu_box_height = l_dom_playback_menu_box.offsetHeight - 1
      l_dom_playback_view.style.height = l_height + "px" // 回放页面高度设置
      console.log(l_height, 'l_height')
      console.log(l_playback_menu_box_height, 'l_playback_menu_box_height')
      l_dom_playback_screen.style.height = (l_height - l_playback_menu_box_height) + "px" // 播放器高度设置
      // this.publicFunc.mx("#playback_buffer_ret").style.left = (l_dom_playback_screen.offsetLeft + l_dom_playback_screen.offsetWidth - 50) + "px" // 下载进度偏移量设置
      // 回放页面相关尺寸设置 结束
      // 获取回放开始时间戳
      this.createPlaybackObj.start_time = parseInt(this.createPlaybackObj.start_time) // 将存储的obj中开始时间
      this.start_time = obj.start_time
      sessionStorage.setItem('play_back_startTime', JSON.stringify(this.start_time)) // 存储开始时间(playback.js中使用)
      // 存储初始开始时间 (后期会对start_time进行赋值,但不会更改b_start_time)
      this.b_start_time = obj.start_time;
      sessionStorage.setItem('b_start_time', JSON.stringify(this.b_start_time))
      // 获取回放结束时间戳
      this.createPlaybackObj.end_time = parseInt(this.createPlaybackObj.end_time)
      this.end_time = obj.end_time
      sessionStorage.setItem('play_back_endTime', JSON.stringify(this.end_time)) // 存储结束时间(playback.js中使用)
      // 存储页面展示时间(格式: 小时:分钟:秒)
      console.log(this.start_time, 'start_time', new Date(this.start_time).format('hh:mm:ss'))
      console.log(this.end_time, 'end_time', new Date(this.end_time).format('hh:mm:ss'))
      this.start_time_show = new Date(this.start_time).format('hh:mm:ss')
      this.end_time_show = new Date(this.end_time).format('hh:mm:ss')
      // 时间相关赋值结束
      this.play_menu_control({ parent: l_dom_playback_menu_box }) // 调用播放器控制菜单渲染
      this.create_preview({ parent: $("#playback_screen") }) // 创建暂停遮罩层渲染
      // 更改页面大小时重新设置相应高度
      window.addEventListener('resize', this.listeningFunc)
    },
    listeningFunc () {
      console.log(this.is_playing)
      if (this.is_playing) {
        this.clickPlay()
      }
      this.canvasInitFlag = false
      this.create_playback_page(this.pageData)
    },
    play_menu_control (data) { // 播放控制菜单
      let _this = this
      this.videoSize = this.end_time - this.start_time // 视频长度

      if (this.$store.state.jumpPageData.localFlag) { // 本地模式下隐藏下载功能
        this.clientFlag = false
      }
      if (this.$refs.playback_progress_bar) { // 进度条相关参数获取
        let l_width = this.$refs.play_menu_left.getBoundingClientRect().width // 增加margin值 getBoundingClientRect()方法只能获取元素自身宽度
        let r_width = this.$refs.play_menu_right ? this.$refs.play_menu_right.getBoundingClientRect().width : null
        let box_width = this.$refs.playback_menu_box.getBoundingClientRect().width
        this.publicFunc.mx("#playback_progress_bar").style.width = (box_width - l_width - r_width - 30) + "px" // 30为margin不计算在进度条长度中
        this.progressWidth = this.$refs.playback_progress_bar.getBoundingClientRect().width
        console.log(this.progressWidth,this.$refs.playback_progress_bar.getBoundingClientRect().width, '在主页面获取到进度条长度')
        // console.log(box_width, l_width, r_width, 'style_null')
      }
      // 添加移动侦测进度条标识
      function create_flag_item (msg) {
        for (let i = 0; i < msg.length; i++) {
          // console.log(msg[i], 'create_flag_item msg[i]')
          if (msg[i] !== 0) {
            // console.log('enter true')
            let process_flag_true = document.createElement("span")
            process_flag_true.setAttribute("class", "flag_item")
            process_flag_true.style.width = (1 / msg.length * 100 + "%")
            process_flag_dom.appendChild(process_flag_true)
          } else {
            // console.log('enter false')
            let process_flag_false = document.createElement("span")
            process_flag_false.setAttribute("class", "no_flag_item")
            process_flag_false.style.width = (1 / msg.length * 100 + "%")
            process_flag_dom.appendChild(process_flag_false)
          }
          // console.log(process_flag_dom, 'process_flag_dom')
        }
      }
      let process_flag_dom = document.createElement("span")
      process_flag_dom.setAttribute("class", "fd_slider_flag")
      // console.log(document.getElementById('barProgress'), 'progress_extend')
      if (document.getElementById('barProgress')) { // 进度条相关报错
        document.getElementById('barProgress').appendChild(process_flag_dom)
      }
      create_flag_item(this.video_flag_arr)
      // 添加移动侦测进度条标识 结束
    },
    create_preview (data) { // 创建暂停遮罩层
      let _this = this
      let getPauseTime = JSON.parse(sessionStorage.getItem('play_back_startTime'))
      sessionStorage.setItem("pause_start_time", getPauseTime) // 存储暂停时间
      console.log(getPauseTime, '查看getPauseTime')
      let pic_token = this.createPlaybackObj.pic_token.replace("_p3_", "_p0_")

      this.$api.play_mac.play_preview_img({
        dom: $("#playback_screen"),
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        pic_token: pic_token
      })
    },
    // 点击事件
    clickPlay () { // 点击播放（客户端）
      console.log(this.downloadFlag, 'downloadFlag')
      if (this.downloadFlag) { // 当前为下载状态则直接忽略播放请求
        return
      }
      // if (window.fujikam !== "fujikam") { // 客户端播放方法
      //   return
      // }
      console.log(this.is_playing, '播放标识')
      if (this.is_playing) { // 当前播放状态 1 为播放中 0 为未播放 (切换为暂停)
        this.is_playing = 0
        window.pywebview.api.destroyPlay()
        this.create_preview(res)
      } else { // 当前为暂停状态(切换为播放)
        this.is_playing = 1
        console.log(JSON.parse(sessionStorage.getItem('pause_start_time')), this.b_start_time, '开始结束时间')
        if (JSON.parse(sessionStorage.getItem('pause_start_time')) && JSON.parse(sessionStorage.getItem('pause_start_time')) !== this.b_start_time) { // 如果存在暂停时间且时间不等于原始开始时间
          this.start_time = Number(sessionStorage.getItem('pause_start_time'))
          this.start_time_show = new Date(this.start_time).format("hh:mm:ss")
          // console.log(this.start_time_show, '展示的开始时间')
          sessionStorage.setItem('bo_type', true)
          this.bo_type = true
          this.percent = (this.start_time - this.b_start_time) / (this.end_time - this.b_start_time) // 计算暂停的时间所占的百分比
          console.log(this.percent, '查看计算后的百分比')
          this.$store.dispatch('setPercent', this.percent) // 存储至vuex中
          this.$store.dispatch('setPlayBackSavePercent', this.percent) // 中断续播存储至vuex中
          let new_token = parseInt(this.createPlaybackObj.data.length * this.percent) // 计算回放token
          this.play_back_token = this.createPlaybackObj.data[new_token].token // 计算回放token
          // console.log(this.percent, '中断续播')
          this.$api.playback_mac.python_play({ // 调用播放接口(从中间暂停点播放)
            agent: this.createPlaybackObj.agent,
            dom: $("#playback_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            videoSize: this.videoSize,
            token: this.play_back_token,
            playback: 1, // 此处额外添加参数
            box_ipc: this.createPlaybackObj.box_ipc //判断是否为云盒子的录像
          }).then(res => {
            console.log(1, res)
            window.pywebview.api.getPlayUrl(res.data.url, 'record')
          })
        } else {
          console.log('从头开始')
          this.$api.playback_mac.python_play({ // 调用播放接口(从开始播放)
            agent: this.createPlaybackObj.agent,
            dom: $("#playback_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            videoSize: this.videoSize,
            token: this.createPlaybackObj.token,
            playback: 1, // 此处额外添加参数
            box_ipc: this.createPlaybackObj.box_ipc //判断是否为云盒子的录像
          }).then(res => {
            console.log(2, res)
            window.pywebview.api.getPlayUrl(res.data.url, 'record')
          })
        }
      }
    },
    clickPlayViewBox () { // 点击播放视图
      console.log(this.downloadFlag, 'downloadFlag')
      if (this.downloadFlag) { // 当前为下载状态则直接忽略播放请求
        return
      }
      let pic_token = [];
      for (let i = 0; i < this.createPlaybackObj.data.length; i++) {
        pic_token.push(this.createPlaybackObj.data[i].pic_token)
      }
      this.is_playing = 1 // 是否播放标识
      // console.log(this.percent, 'set_percent')
      sessionStorage.setItem('playBackPercent', this.percent)
      console.log(JSON.parse(sessionStorage.getItem('pause_start_time')), this.b_start_time, '开始结束时间')
      if (JSON.parse(sessionStorage.getItem('pause_start_time')) && JSON.parse(sessionStorage.getItem('pause_start_time')) !== this.b_start_time) { // 如果存在暂停时间且时间不等于原始开始时间
        this.start_time = Number(sessionStorage.getItem('pause_start_time'))
        this.start_time_show = new Date(this.start_time).format("hh:mm:ss")
        sessionStorage.setItem('bo_type', true)
        this.bo_type = true
        this.percent = (this.start_time - this.b_start_time) / (this.end_time - this.b_start_time) // 计算暂停的时间所占的百分比
        this.$store.dispatch('setPercent', this.percent) // 存储至vuex中
        this.$store.dispatch('setPlayBackSavePercent', this.percent) // 中断续播存储至vuex中
        let new_token = parseInt(this.createPlaybackObj.data.length * this.percent) // 计算回放token
        this.play_back_token = this.createPlaybackObj.data[new_token].token // 计算回放token
        // console.log(this.percent, '中断续播')
        this.$api.playback_mac.python_play({ // 调用播放接口(从中间暂停点播放)
          agent: this.createPlaybackObj.agent,
          dom: $("#playback_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          videoSize: this.videoSize,
          token: this.play_back_token,
          playback: 1, // 此处额外添加参数
          box_ipc: this.createPlaybackObj.box_ipc //判断是否为云盒子的录像
        }).then(res => {
          console.log(3, res)
          window.pywebview.api.getPlayUrl(res.data.url, 'record')
        })
      } else {
        console.log('从头开始')
        this.$api.playback_mac.python_play({ // 调用播放接口(从开始播放)
          agent: this.createPlaybackObj.agent,
          dom: $("#playback_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          videoSize: this.videoSize,
          token: this.createPlaybackObj.token,
          playback: 1, // 此处额外添加参数
          box_ipc: this.createPlaybackObj.box_ipc //判断是否为云盒子的录像
        }).then(res => {
          console.log(4, res)
          window.pywebview.api.getPlayUrl(res.data.url, 'record')
        })
      }
    },
    clickBack () { // 点击返回
      // console.log(this.createPlaybackObj, 'createPlaybackObj')
      this.$store.dispatch('setPlayBackSavePercent', 0) // 返回时偏移百分比重置为0
      if (this.createPlaybackObj.box_ipc == 1) { //如果从云盒子实时播放进来回放播放
        let jumpData = {
          parent: this.createPlaybackObj.parent,
          dev_sn: this.createPlaybackObj.dev_sn,
          back_page: this.createPlaybackObj.back_page,
          agent: this.createPlaybackObj.agent,
          addr: this.createPlaybackObj.addr,
          a_start: this.createPlaybackObj.a_start,
          b_end: this.createPlaybackObj.b_end,
          box_ipc: 1,
          ipc_sn: this.createPlaybackObj.ipc_sn,
          box_sn: this.createPlaybackObj.box_sn,
          box_live: 1,
          backplay_flag: 4,
          ipc_stat: this.createPlaybackObj.ipc_stat
        }
        this.$router.push({ name: 'history', params: jumpData })
      } else {
        let jumpData = {
          parent: this.createPlaybackObj.parent,
          dev_sn: this.createPlaybackObj.dev_sn,
          back_page: this.createPlaybackObj.back_page,
          agent: this.createPlaybackObj.agent,
          addr: this.createPlaybackObj.addr,
          a_start: this.createPlaybackObj.a_start,
          b_end: this.createPlaybackObj.b_end,
          backplay_flag: 4
        }
        this.$router.push({ name: 'history', params: jumpData })
      }
    },
    clickProgress () { // 点击进度条
      this.first = true
      sessionStorage.setItem('play_first', true)
      this.$store.dispatch('setPlayBackSavePercent', this.percent)
      this.play_progress = this.percent
      let new_token = parseInt(this.createPlaybackObj.data.length * this.play_progress)
      this.play_back_token = this.createPlaybackObj.data[new_token].token
      let play_progress_time_stamp = this.b_start_time + (this.videoSize * this.percent)
      let play_progress_time = new Date(play_progress_time_stamp).format("hh:mm:ss")
      sessionStorage.setItem("play_progress_time_stamp", play_progress_time_stamp)
      //拖动时显示对应的时间
      this.start_time_show = play_progress_time
      // $("#playback_start_time").html(play_progress_time)
      // moveProgressBar
    },
    clickDownloadSubmit () { // 点击下载弹窗中确定事件
      // 添加下载标识(下载过程中禁止再次播放)
      this.$store.dispatch('setPlaybackDownloadFlag', true)
      console.log(this.$store.state.jumpPageData.playbackDownloadFlag, 'change download flag')
      // 添加点击下载后暂停后台视频播放
      if (this.is_playing) { // 当前播放状态 1 为播放中 0 为未播放 (切换为暂停)
        this.is_playing = 0
        this.$api.playback_mac.video_stop({
          dom: $("#playback_screen")
        }).then(res => {
          this.create_preview(res)
        })
      }
      this.downloadShowWorld = this.mcs_pause // 赋值暂停
      let download_path = this.folderPath //下载路径
      this.downloadBoxFlag = false
      // 添加下载弹窗内容
      this.publicFunc.mx("#playback_screen").style.background = "#000" // 播放区域黑色背景
      this.$refs.downloadBufferFlag.style.display = 'block' // 下载进度弹出
      if (this.publicFunc.mx('#play_view_box')) { // 如果有播放遮罩层也为黑色
        this.publicFunc.mx('#play_view_box').style.background = '#000'
      }
      if (this.$store.state.jumpPageData.projectName === "vimtag") {
        this.$api.playback_mac.python_download({ // 原play_back_download接口
          agent: this.createPlaybackObj.agent,
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          videoSize: this.videoSize,
          token: this.createPlaybackObj.download_token,
          download_path: download_path,
          playback: 1, // 此处额外添加参数
          isDownload: 1 // 此处额外添加参数
        })
      } else {
        console.log(this.createPlaybackObj, 'this.createPlaybackObj')
        this.$api.playback_mac.python_download({ // 原play_back_download接口
          agent: this.createPlaybackObj.agent,
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          videoSize: this.videoSize,
          token: this.createPlaybackObj.token,
          download_path: download_path,
          playback: 1, // 此处额外添加参数
          isDownload: 1 // 此处额外添加参数
        })
      }
    },
    async clickDownloadPause () { // 点击下载暂停
      if (this.downloadShowWorld === this.mcs_pause) {
        console.log('调用暂停')
        this.downloadShowWorld = this.mcs_continue
        window.pywebview.api.download_pause()
      } else {
        // 获取当前下载到的seg下标值
        let get_download_seg = await window.pywebview.api.download_continue()
        let download_token = this.createPlaybackObj.data[get_download_seg].token
        this.$api.playback_mac.python_download({ // 原play_back_download接口
          agent: this.createPlaybackObj.agent,
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          videoSize: this.videoSize,
          token: download_token,
          download_path: this.folderPath,
          playback: 1, // 此处额外添加参数
          isDownload: 1 // 此处额外添加参数
        })
        this.downloadShowWorld = this.mcs_pause
      }
    },
    clickDownloadStop () { // 点击下载终止
      this.$store.dispatch('setPlaybackDownloadFlag', false)
      this.$refs.downloadBufferFlag.style.display = 'none'
      window.pywebview.api.download_stop()
      // this.$api.playback_mac.video_stop({
      //   dom: $("#playback_screen"),
      //   isDownload: 1 // 是否下载中特殊标记
      // }).then(res => {
      //   this.create_preview(res)
      // })
    },
    clickVoice (event) { // 点击声音图标
      let class_name = event.target.className
      if (class_name === "voice_close_close") {
        this.$api.play_mac.voice({ flag: 0 })
        event.target.className = "voice_close_open"
      } else {
        this.$api.play_mac.voice({ flag: 1 })
        event.target.className = "voice_close_close"
      }
    },
    async clickFullScreen () { // 点击全屏按钮
      let _this = this
      await this.$fullscreen.toggle(this.$refs.video, {
        teleport: true,
        callback: (isFullscreen) => {
          console.log(isFullscreen, 'fullScreen')
          if (isFullscreen) {
            _this.cameraControlDivFlag = false
          } else {
            _this.cameraControlDivFlag = true
          }
          // state.fullscreen = isFullscreen
        },
      })
    },
    // 点击事件 结束
    // 进度条相关
    setProgress (percent) { // 设置进度
      // console.log(percent, 'setProgressPercent')
      if (percent > 1 || percent < 0) {
        return
      }
      this.percent = percent
      this.$store.dispatch('setPercent', this.percent) // vuex中存储percent
      // 计算当前播放时间
      let nowTimeStamp = this.b_start_time + (this.videoSize * percent)
      this.start_time_show = new Date(nowTimeStamp).format('hh:mm:ss')
      // console.log(this.start_time_show, '拖动后改变时间')
      // 计算当前播放时间 结束
      this.clickProgress() // 调用点击进度条事件
    },
    // 播放视频信号 返回值默认为true 播放视频信号 避免拖动导致频繁触发播放请求
    playVideo (flag) {
      console.log(flag, 'playVideoFlag')
      if (this.is_playing && flag) { // 播放中的视频才会直接调用播放, 处于暂停状态下的视频不做处理
        window.pywebview.api.destroyPlay()
        this.$api.playback_mac.python_play({ // 原playback接口
          agent: this.createPlaybackObj.agent,
          dom: $("#playback_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          videoSize: this.videoSize,
          token: this.play_back_token,
          playback: 1, // 此处额外添加参数
          box_ipc: this.createPlaybackObj.box_ipc //判断是否为云盒子的录像
        }).then(res => {
          window.pywebview.api.getPlayUrl(res.data.url, 'record')
        })
      }
    },
    // 进度条 结束
    // canvas 展示视频方法
    schedule () {
      const data = this.queue.shift()
      if (data) {
        this.render(new Uint8Array(data))
        if (this.queue.length > 5) {
          this.queue = []
        }
        requestAnimationFrame(this.schedule)
      } else {
        this.scheduled = false
      }
    },
    render (buff) {
      // console.log(video, '打印video')
      if (this.renderer == null) {
        return
      }

      const width = video.width
      const height = video.height
      this.renderer.renderImg(width, height, buff)
    },

    initialCanvas (canvas, width, height) {
      console.log('canvas width height', canvas, width, height)
      canvas.width = width
      canvas.height = height
      canvas.style.width = document.getElementById('playback_screen').offsetWidth + 'px'
      canvas.style.height = document.getElementById('playback_screen').offsetHeight + 'px'
      return new WebglScreen(canvas)
    },
    // canvas 展示视频方法 结束
    // 文件路径选择方法
    async selectFolder () {
      let path = await window.pywebview.api.select_folder()
      this.folderPath = path[0]
      console.log(this.folderPath, '获取到的文件夹地址')
    },
    // 文件路径选择方法 结束
  },
  watch: {
    "$store.state.jumpPageData.percent" (val) {
      console.log('playBack percent', val)
      let percent = val
      if (percent > 1 || percent < 0) {
        return
      }
      this.percent = percent
      this.$store.dispatch('setPercent', this.percent) // vuex中存储percent
      // 计算当前播放时间
      let nowTimeStamp = this.b_start_time + (this.videoSize * percent)
      this.start_time_show = new Date(nowTimeStamp).format('hh:mm:ss')
      console.log(this.start_time, 'watch start_time', this.b_start_time)
      if (this.percent === 0) { // 百分比为0时初始化进度条
        this.setProgress(this.percent)
        // 重置暂停时间
        sessionStorage.setItem("pause_start_time", JSON.parse(this.b_start_time))
        console.log(JSON.parse(sessionStorage.getItem('pause_start_time')), '修改过后')
        this.is_playing = 0 // 切换成暂停
        console.log(this.is_playing, '检查is_playing')
      }
    },
    "$store.state.jumpPageData.clientP2Ping" (val) {
      if (val) {
        this.clientP2PingValue = val
        // console.log(val, 'p2pingvalue')
      }
    },
    "$store.state.jumpPageData.playbackDownloadFlag" (val) {
      // console.log(val, 'watchVal')
      this.downloadFlag = val
      // console.log(this.downloadFlag)
    },
    // 监听图片内容改变(客户端视频播放用)
    "$store.state.jumpPageData.pywebviewImgData" (val) {
      if (val) {
        // 初次进入页面获取到视频数据后对canvas进行初始化
        if (!this.canvasInitFlag) {
          const canvas = this.$refs.video
          let canvasDrawWidth = this.$store.state.jumpPageData.pywebviewImgWidth
          let canvasDrawHeight = this.$store.state.jumpPageData.pywebviewImgHeight
          if (!this.canvasInitFlag || this.nowCanvasHeight !== canvasDrawHeight || this.nowCanvasWidth !== canvasDrawWidth) {
            this.renderer = this.initialCanvas(canvas, canvasDrawWidth, canvasDrawHeight)
            this.nowCanvasHeight = canvasDrawHeight
            this.nowCanvasWidth = canvasDrawWidth
            this.canvasInitFlag = true
          }
        }
        let binaryData = atob(val)
        let yuvData = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          yuvData[i] = binaryData.charCodeAt(i)
        }
        this.queue.push(yuvData)
        if (!this.scheduled) {
          this.schedule()
          this.scheduled = true
        }
      }
    },
    // 监听定时查询回来的数据是否有改变(并根据改变进行相应的操作)
    queryData (val, oldVal) {
      console.log(val, 'watch_val')
      console.log(oldVal, 'oldVal')
      console.log(this.end_time, 'this.end_time')
      let now_time = val.last_sample_abtime_played
      if (now_time <= 0) {
        return
      }
      // 下载时查询数据处理
      if (this.downloadFlag) {
        let remainder = 1 - ((this.end_time - now_time)/this.videoSize)
        this.downloadPercent = Math.floor(remainder * 100) + "%"
        if (now_time >= this.end_time) {
          // 停止下载
          window.pywebview.api.download_stop()
          this.clickDownloadStop()
        }
      } else {
        // 回放视频时对查询的数据进行处理
        // 计算播放百分比用于控制进度条组件
        console.log('进入回放查询判断')
        let playBackPercent = 1 - ((this.end_time - now_time)/this.videoSize)
        console.log(playBackPercent, '回放时查询计算的百分比')
        this.percent = playBackPercent
        this.$store.dispatch('setPercent', this.percent)
        // 计算每秒kb值
        let kb_value = val.played_duration - oldVal.played_duration
        this.clientP2PingValue = Math.ceil(kb_value / 10) + 'kb'
      }
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    console.log(this.$route, 'route')
    if (this.$route.params) {
      this.pageData = this.$route.params
      this.pageData.parent = $("#" + this.$route.name)
    } else {
      this.pageData = { parent: $("#" + this.$route.name) }
    }
    // // console.log(pageData,"pageData")
    this.publicFunc.projectReload.call(this)
    console.log(this.pageData, 'pageData')
    // 进入播放页面时优先调用创建播放引擎方法
    window.pywebview.api.createPlayerEngine()
    await this.create_playback_page(this.pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    // 插件定时查询方法,查询结果返回至data中
    window.setQueryData = (data) => {
      console.log(data, 'client_data')
      this.queryData = { ...data }
    }
  },
  beforeRouteLeave(to, from, next) {
    // 销毁当前组件实例
    this.$destroy()
    next()
  },
  destroyed () {
    window.removeEventListener('resize', this.listenFunc)
    // 销毁页面时注销播放
    if(this.clientFlag) {
      window.pywebview.api.leavePlayPage()
    }
  }
}
</script>