<template>
  <div id="play">
    <div id='play_box'>
      <!-- 顶部播放菜单栏 -->
      <div id='page_top_menu'>
        <div id='play_top_menu'>
          <div id='enter_history' class='play_top_menu_li' @click="clickEnterHistory">
            <div id='enter_history_img'></div>
            <div id='enter_history_txt'>{{ mcs_playback }}</div> <!-- 查看回放 -->
          </div>
          <div id='enter_set' class='play_top_menu_li' v-if="!$store.state.jumpPageData.experienceFlag"
            @click="clickEnterSet">
            <div id='enter_set_img'></div>
            <div id='enter_set_txt'>{{ mcs_settings }}</div> <!-- 进入设备设置 -->
          </div>
        </div>
      </div>
      <!-- 顶部播放菜单栏 结束 -->
      <!-- 播放内容主体 -->
      <div ref="play_view" id='play_view' v-show="readyFlag">
        <div id='play_buffer_ret'></div>
        <!-- 视频播放区域 -->
        <div style="position: relative;">
          <!-- 设备时区与设置时区不同提示 -->
          <div id='timezone_err_tip' v-show='timezone_err_sign'>
            {{ mcs_set_timezone_prompt_start }}{{ current_time_zone }},{{ mcs_set_timezone_prompt_end }}
            <span class='err_tip_close' @click='timezone_err_sign = false'></span>
          </div>
          <!-- 报警倒计时 -->
          <div id='alarm_countdown' v-show='alarm_sign'>
            <div class='audio_alarm'></div>
            <div>{{ mrs_audio_alarm }}</div>
            <div>{{ alarm_countdown_code }}</div>
          </div>
          <!-- <div id='play_thumbnail' v-show="!playFlag" :style="playScreenHeight">
          </div> -->
          <div id='play_screen' :style="playScreenHeight">
          </div>
          <div id='play_view_box' @click="clickPlayView" v-show="!playFlag">
            <div id='play_pause_pic'></div>
          </div>
        </div>
        <!-- 视频播放区域 结束 -->
        <!-- 播放器控制菜单栏 -->
        <div id='play_menu_box'>
          <!-- 菜单栏左侧控制按钮 -->
          <div id='play_menu_left'>
            <div id='video_play' class='video_play_stop' @click="clickPlay($event)"></div>
            <div class='enter_nav_left'></div>
            <div id='video_off_pic' class='video_off_picture' v-show="recordFlag" @click="clickRecordVideo($event)">
            </div>
            <div id='camera_off_pic' class='camera_off_picture' @click="clickScreenShot"></div>
            <div id='talkback_off_pic' class='talkback_off_picture' v-show="talkbackFlag" @click="clickTalkback($event)"></div>
            <div id='adjust_off_pic' :class='adjustSettingFlag ? "adjust_on_picture" : "adjust_off_picture"' @click="clickAdjust($event)"></div>
            <div id='alarm_pic' :class='alarm_sign ? "alarm_on_picture" : "alarm_off_picture"' @click="clickAlarm" v-show='audio_alarm_manually'></div>
          </div>
          <!-- 菜单栏左侧控制按钮 结束 -->
          <!-- 隐藏的控制按钮 -->
          <div id='full_screen' v-show="fullScreenFlag" @click="clickFullScreen"></div>
          <div class='enter_nav' style='display:none;'></div>
          <!-- 隐藏的控制按钮 结束 -->
          <!-- 菜单栏右侧控制按钮 -->
          <div id='play_menu_right'>
            <!-- 清晰度选择弹出菜单 -->
            <div id='choice_play_definition' v-show="definitionListFlag" :style="{ top: definitionTop }">
              <div id='high_definition' class='definition_cha' :style="languageWidthStyle"
                @click="clickVideoDefinition">{{ highDefinitionClear }}</div>
              <div class='definition_nav'></div>
              <div id='standard_definition' class='definition_cha' :style="languageWidthStyle" @click="clickStandard">
                {{ mcs_standard_clear }}</div>
              <div class='definition_nav'></div>
              <div id='fluency_definition' class='definition_cha' :style="languageWidthStyle" @click="clickFluency">
                {{ mcs_fluent_clear }}</div>
              <div class='definition_nav'></div>
              <div id='auto_definition' class='definition_cha' :style="languageWidthStyle" @click="clickAuto">
                {{ mcs_auto }}</div>
            </div>
            <!-- 清晰度选择弹出菜单 结束 -->
            <div ref="resolute_choice" id='resolute_choice' @click="definitionListFlag = !definitionListFlag">
              {{ definitionSelect }}</div> <!-- 点击选择按钮对菜单展示标识取反 -->
            <div class='enter_nav'></div>
            <div id='voice_close' class='voice_close_close' v-show="voiceFlag" @click="clickVoice($event)"></div>
            <div id='enter_set_img' style='display:none;'></div>
            <div class='enter_nav' style='display:none;'></div>
            <div id='enter_history_img' style='display:none;'></div>
          </div>
          <!-- 菜单栏右侧控制按钮 结束 -->
          <!-- 设置弹窗 -->
          <div id='adjust_setting' v-show="adjustSettingFlag">
            <div id='delete_adjust_page' class='delete_adjust_page' @click="clickAdjustClose($event)">×</div>
            <div class='adjust_line'>
              <div class='adjust_cha'>{{ mcs_sharpness }}</div>
              <input type='range' v-model='sharpness_value' min='0' max='100' ref='sharpness' @mouseup="adjust_set" />
            </div>
            <div class='adjust_line'>
              <div class='adjust_cha'>{{ mcs_contrast }}</div>
              <input type='range' v-model='contrast_value' min='0' max='100' ref='contrast' @mouseup="adjust_set" />
            </div>
            <div class='adjust_line'>
              <div class='adjust_cha'>{{ mcs_color_saturation }}</div>
              <input type='range' v-model='color_saturation_value' min='0' max='100' ref='color_saturation'
                @mouseup="adjust_set" />
            </div>
            <div class='adjust_line'>
              <div class='adjust_cha'>{{ mcs_brightness }}</div>
              <input type='range' v-model='brightness_value' min='0' max='100' ref='brightness' @mouseup="adjust_set" />
            </div>
            <div class='adjust_line'>
              <div class='adjust_cha'>{{ mcs_mode }}</div>
              <div class='adjust_mode'>
                <div id='adjust_mode_auto' :class='mode == "auto" ? "mode_cha_active" : "mode_cha"' @click='mode = "auto"'>
                  {{ mcs_auto }}</div>
                <div id='adjust_mode_daytime' :class='mode == "day" ? "mode_cha_active" : "mode_cha"' @click='mode = "day"'>
                  {{ mcs_daytime }}</div>
                <div id='adjust_mode_night' :class='mode == "night" ? "mode_cha_active" : "mode_cha"'
                  @click='mode = "night"'>{{ mcs_night }}</div>
              </div>
            </div>
            <!-- 白光特殊样式  后续需要添加白光判断标识进行选择性展示 v-if="whiteLight"-->
            <div class='adjust_line' v-if="whiteLight">
              <div class='adjust_cha'>{{ mcs_light_mode }}</div>
              <div class='adjust_mode'>
                <div id='adjust_mode_smart_light' :class='light_mode == "auto" ? "mode_cha_active" : "mode_cha"'
                  @click='light_mode = "auto"'>{{ mcs_light_smart }}</div>
                <div id='adjust_mode_infrared_light' :class='light_mode == "red" ? "mode_cha_active" : "mode_cha"'
                  @click='light_mode = "red"'>{{ mcs_light_infrared }}</div>
                <div id='adjust_mode_white_light' :class='light_mode == "white" ? "mode_cha_active" : "mode_cha"'
                  @click='light_mode = "white"'>{{ mcs_light_white }}</div>
              </div>
            </div>
            <!-- 白光特殊样式 结束 -->
            <div id='adjust_reset' @click='adjust_reset'>{{ mcs_reset }}</div>
          </div>
          <!-- 设置弹窗 结束 -->
        </div>
        <!-- 播放器控制菜单栏 结束 -->
        <!-- 播放器控制区域 -->
        <div id='play_view_control' v-show="cameraControlDivFlag">
          <div ref="ptz_control" id='mipc_ptz_control'>
            <div id='ptz_control_left' @mouseover="leftControl = true" @mouseout="leftControl = false">
              <div id='turn_left' class='left_key' v-show="leftControl" @mousedown="turnCamera('move', 'left')"
                @mouseup="turnCamera('stop', 'left')"></div>
            </div>
            <div id='ptz_control_up' @mouseover="topControl = true" @mouseout="topControl = false">
              <div id='turn_up' class='up_key' v-show="topControl" @mousedown="turnCamera('move', 'up')"
                @mouseup="turnCamera('stop', 'up')"></div>
            </div>
            <div id='ptz_control_center' @dblclick="$api.play.fullscreen()"></div>
            <div id='ptz_control_right' @mouseover="rightControl = true" @mouseout="rightControl = false">
              <div id='turn_right' class='right_key' v-show="rightControl" @mousedown="turnCamera('move', 'right')"
                @mouseup="turnCamera('stop', 'right')"></div>
            </div>
            <div id='ptz_control_down' @mouseover="downControl = true" @mouseout="downControl = false">
              <div id='turn_down' class='down_key' v-show="downControl" @mousedown="turnCamera('move', 'down')"
                @mouseup="turnCamera('stop', 'down')"></div>
            </div>
          </div>
        </div>
        <!-- 播放器控制区域 结束 -->
      </div>
      <!-- 播放内容主体 结束 -->
    </div>
    <!-- 截图弹窗 -->
    <div id='snapshot_preview_div' v-show="snapshotFlag">
      <div id='snapshot_preview_inner'>
        <img id='snapshot_preview_content' :src="snapshotUrl">
        <a id='snapshot_preview_url' :download="snapshotDownloadName" :href="snapshotUrl">
          <div id='snapshot_img_page_download'></div>
        </a>
      </div>
      <div id='snapshot_preview_close' @click="snapshotFlag = false"></div>
    </div>
    <!-- 截图弹窗 结束 -->
  </div>
</template>
<style lang="scss">
@import './index.scss';
</style>
<script>
export default {
  data () {
    return {
      // 多国语言
      mcs_playback: mcs_playback,
      mcs_settings: mcs_settings,
      mcs_standard_clear: mcs_standard_clear,
      mcs_fluent_clear: mcs_fluent_clear,
      mcs_auto: mcs_auto,
      mcs_sharpness: mcs_sharpness,
      mcs_contrast: mcs_contrast,
      mcs_color_saturation: mcs_color_saturation,
      mcs_brightness: mcs_brightness,
      mcs_mode: mcs_mode,
      mcs_daytime: mcs_daytime,
      mcs_night: mcs_night,
      mcs_light_mode: mcs_light_mode,
      mcs_light_smart: mcs_light_smart,
      mcs_light_infrared: mcs_light_infrared,
      mcs_light_white: mcs_light_white,
      mcs_reset: mcs_reset,
      mcs_high_clear: mcs_high_clear,
      mcs_set_timezone_prompt_start: mcs_set_timezone_prompt_start,
      mcs_set_timezone_prompt_end: mcs_set_timezone_prompt_end,
      mrs_audio_alarm: mrs_audio_alarm,
      // 多国语言结束
      whiteLight: null, // 设备白光信息存储
      playFlag: 0, // 播放状态标识
      definitionListFlag: false, // 清晰度选择列表展示标识
      definitionSelect: null, // 最终选择的清晰度
      support_1080p: '', // 1080p分辨率内容展示
      voiceFlag: window.fujikam ? true : false, // 声音控制图标标识(在客户端中展示,浏览器端隐藏)
      fullScreenFlag: window.fujikam ? true : false, // 全屏控制图标标识(在客户端中展示,浏览器端隐藏)
      recordFlag: false, // 隐藏控制菜单中录像按钮
      snapshotFlag: false, // 截图弹窗展示标识
      snapshotUrl: null, // 截图图片url
      snapshotDownloadName: null, // 截图图片下载的文件名
      talkbackFlag: window.fujikam ? true : false, // 对讲控制图标标识(在客户端中展示,浏览器端隐藏)
      adjustSettingFlag: false, // 设置弹出框标识
      definitionTop: '', // 清晰度选择弹窗top属性
      languageWidthStyle: this.$store.state.user.userLanguage === 'vi' ? { width: 78 + 'px' } : null, // 特殊语言更改样式宽度
      cameraControlDivFlag: false, // 摄像头转向控制区域展示标识
      leftControl: false, // 摄像头左转控制标识
      rightControl: false, // 摄像头右转控制标识
      topControl: false, // 摄像头上转控制标识
      downControl: false, // 摄像头下转控制标识
      playScreenHeight: null, // 播放区域高度样式
      screenWidth: document.body.clientWidth, // 屏幕宽度
      mipcPlayObj: null, // mipc调用obj
      mode: '', //控制模式（自动，白天，夜间）
      light_mode: '', //控制灯光模式（智能，白光，红外）
      sharpness_value: '', //锐度
      contrast_value: '', //对比度
      color_saturation_value: '', //饱和度
      brightness_value: '', //亮度
      cam_conf: '', //保存设备模式亮度等数据
      highDefinitionClear: '', // 接口获取的该设备可播放的最高清晰度
      timezone_err_sign: false, //设置的时区与本地时区是否一致标识
      current_time_zone: null, //当前时区
      alarm_sign: false, //是否手动报警
      audio_alarm_manually: '', //设备是否能手动报警
      alarm_countdown_code: 60, //报警60s倒计时
      readyFlag: false, // 播放器相关参数获取完成标识
    }
  },
  methods: {
    mipcPlay (obj) {
      this.mipcPlayObj = obj
      this.$api.set.dev_info({ // 调用获取设备详细信息接口
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.whiteLight = res.white_light // 获取返回的白光信息
        this.audio_alarm_manually = res.audio_alarm_manually //判断设备是否能手动报警
        // this.play_menu_control() // 播放控制按钮渲染
        this.get_definition() // 获取窗口大小并绘制播放内容
      })
      // 添加占位图片绘制
      // 创建暂停画面以及暂停图标
      if (this.$store.state.jumpPageData.localFlag) {
        this.$api.play.play_preview_img({ addr: obj.addr, dom: $("#play_screen"), sn: this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
      } else {
        this.$api.play.play_preview_img({ dom: $("#play_screen"), sn: this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
      }
      // 创建暂停画面以及暂停图标 结束
      this.time_zone_alert()
    },
    get_definition () { // 获取窗口大小并绘制播放内容
      this.playScreenHeight = { height: ((document.body.clientWidth - document.getElementById('dev_main_left').offsetWidth - 60) * 0.563) + 'px' }
      this.$api.set.dev_info({ //ms.send_msg("dev_info_get"
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.dev_info_get_ack(res)
      })
    },
    dev_info_get_ack (msg) { // 获取窗口大小并绘制播放内容回调处理函数
      if (this.$store.state.jumpPageData.projectName === "vsmahome") {
        this.highDefinitionClear = this.mcs_high_clear
        this.definitionSelect = this.mcs_high_clear
      } else {
        if (msg.s_sensor === 'ok') {
          this.highDefinitionClear = msg.def
          this.support_1080p = msg.def
          if (sessionStorage.getItem("PlayProfile")) {
            let playProfile = sessionStorage.getItem("PlayProfile")
            if (playProfile === 'p0')
              this.definitionSelect = msg.def
            else if (playProfile === 'p1')
              this.definitionSelect = this.mcs_standard_clear
            else if (playProfile === 'p2')
              this.definitionSelect = this.mcs_fluent_clear
          } else {
            this.definitionSelect = msg.def
          }
        } else {
          this.highDefinitionClear = 'NULL'
          this.definitionSelect = 'NULL'
          this.support_1080p = 'NULL'
        }
      }
      // 视频播放控制区域设置
      this.$nextTick(function () {
        let l_dom_play_view_width = this.$refs.play_view.offsetWidth
        let l_dom_play_view_height = this.$refs.play_view.offsetHeight
        let l_dom_play_view_top = this.$refs.play_view.offsetTop
        let l_dom_play_view_left = this.$refs.play_view.offsetLeft
        this.$refs.ptz_control.style.width = l_dom_play_view_width + "px"
        this.$refs.ptz_control.style.height = l_dom_play_view_height - 80 + "px"
        this.$refs.ptz_control.style.top = l_dom_play_view_top + "px"
        this.$refs.ptz_control.style.left = l_dom_play_view_left + "px"
      })
      // 视频播放控制区域设置 结束
      this.readyFlag = true
    },
    play_speed (data) { // 播放速度回调
      this.publicFunc.mx("#play_buffer_ret").innerHTML = data
    },
    // 按钮点击事件
    clickPlay (event) { // 点击播放按钮
      let obj = this.mipcPlayObj
      let class_name = event.target.className
      console.log(class_name, 'event class_name')
      if (class_name === "video_play_stop") {
        this.playFlag = 1 // 更改播放状态
        let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0"
        if (this.$store.state.jumpPageData.localFlag) { // 本地功能暂缓调试
          local_play_data.profile_token = profile_token
          local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
          msdk_ctrl({ type: "local_device_play", data: local_play_data })
        } else {
          this.$api.play.play({ // 调用播放接口进行视频播放
            dom: $("#play_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: profile_token
          }).then(res => {
            this.play_speed(res) // 调用播放速度回调函数
          })
        }
        this.cameraControlDivFlag = true // 摄像头方向控制按钮展示
        event.target.className = "video_play_start" // 更改播放按钮的className
        $("#play_screen").css('background-image', 'none')
      } else if (class_name === "video_play_start") {
        this.playFlag = 0 // 更改播放状态
        this.$api.play.video_stop({
          dom: $("#play_screen")
        }).then(res => {
          console.log(res, 'stop_res')
          if (!res) { // 如果没有返回值则直接返回退出
            return
          }
          // this.create_preview(res) // 绘制暂停封面以及按钮
          if (this.$store.state.jumpPageData.localFlag) {
            this.$api.play.play_preview_img({ addr: obj.addr, dom: $("#play_screen"), sn: this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
          } else {
            this.$api.play.play_preview_img({ dom: $("#play_screen"), sn: this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
          }
        })
        event.target.className = "video_play_stop" // 更改播放按钮的className
        this.cameraControlDivFlag = false // 摄像头方向控制按钮展示
        $("#play_view_control").hide()
      }
    },
    clickVideoDefinition () { // 点击选择视频清晰度
      this.definitionListFlag = false
      sessionStorage.setItem("PlayProfile", "p0")
      if (this.$store.state.jumpPageData.projectName === "vsmahome") {
        this.definitionSelect = mcs_new_hd
      } else {
        this.definitionSelect = this.support_1080p
      }
      if (this.playFlag) {
        if (this.$store.state.jumpPageData.localFlag) {
          local_play_data.profile_token = "p0"
          local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
          msdk_ctrl({ type: "local_device_play", data: local_play_data })
        } else {
          this.$api.play.play({
            dom: $("#play_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: "p0"
          }).then(res => {
            this.play_speed(res)
          })
        }
      }
    },
    clickStandard () { // 点击标准清晰度
      this.definitionListFlag = false // 隐藏清晰度选择弹窗
      sessionStorage.setItem("PlayProfile", "p1")
      this.definitionSelect = this.mcs_standard_clear
      if (this.playFlag) {
        if (this.$store.state.jumpPageData.localFlag) { // 本地内容暂缓
          local_play_data.profile_token = "p1";
          local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
          msdk_ctrl({ type: "local_device_play", data: local_play_data })
        } else {
          this.$api.play.play({
            dom: $("#play_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: "p1"
          }).then(res => {
            this.play_speed(res)
          })
        }
      }
    },
    clickFluency () { // 点击流畅清晰度
      this.definitionListFlag = false // 隐藏清晰度选择弹窗
      sessionStorage.setItem("PlayProfile", "p2")
      this.definitionSelect = this.mcs_fluent_clear
      if (this.playFlag) {
        if (this.$store.state.jumpPageData.localFlag) { // 本地内容暂缓
          local_play_data.profile_token = "p2"
          local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
          msdk_ctrl({ type: "local_device_play", data: local_play_data })
        } else {
          this.$api.play.play({
            dom: $("#play_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: "p2"
          }).then(res => {
            this.play_speed(res)
          })
        }
      }
    },
    clickAuto () { // 点击自动清晰度
      this.definitionListFlag = false
      this.definitionSelect = this.mcs_auto
    },
    clickEnterSet () { // 跳转到设置页面
      let obj = this.mipcPlayObj
      this.publicFunc.showBufferPage()
      this.$api.set.dev_info({
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.publicFunc.closeBufferPage()
        let jumpData
        if (res.result == "") {
          if (res.oscene) {
            jumpData = { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "mipc" }
            this.$router.push({ name: 'set', params: jumpData })
          } else {
            jumpData = { parent: $("#page"), back_page: "play", type: 3, addr: obj.addr, web_name: "mipc" }
            this.$router.push({ name: 'set', params: jumpData })
          }
        } else {
          jumpData = { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "mipc" }
          this.$router.push({ name: 'set', params: jumpData })
        }
      })
    },
    clickEnterHistory () { // 跳转至历史页面
      let jumpData = { parent: $("#dev_main_page"), dev_sn: this.$store.state.jumpPageData.selectDeviceIpc, back_page: "play" }
      this.$router.push({ name: 'history', params: jumpData })
    },
    clickVoice (event) { // 点击声音图标
      let class_name = event.target.className
      if (class_name === "voice_close_close") {
        this.$api.play.voice({ flag: 0 })
        event.target.className = "voice_close_open"
      } else {
        this.$api.play.voice({ flag: 1 })
        event.target.className = "voice_close_close"
      }
    },
    clickFullScreen () { // 点击全屏按钮
      this.$api.play.fullscreen()
    },
    clickRecordVideo (event) { // 点击隐藏菜单中的录像按钮
      if (event.target.className === "video_on_picture") {
        event.target.className = "video_off_picture"
        this.$api.play.play_record({
          recording: 1,
          sn: this.$store.state.jumpPageData.selectDeviceIpc
        })
      } else {
        event.target.className = "video_on_picture"
        this.$api.play.play_record({
          recording: 0,
          sn: this.$store.state.jumpPageData.selectDeviceIpc
        })
      }
    },
    clickScreenShot () { // 点击隐藏菜单中的截图按钮
      if (this.$store.state.jumpPageData.selectDeviceIpc) {
        this.$api.play.play_snapshot({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => { // 调用截图接口
          // this.publicFunc.log_upload('take_picture'); //记录日志：拍照
          this.snapshotFlag = true
          this.snapshotUrl = res
          this.snapshotDownloadName = new Date().getTime() + ".jpg"
        })
      }
    },
    clickTalkback (event) { // 调用对讲功能
      let class_name = event.target.className
      if (class_name === "talkback_off_picture") {
        event.target.className = "talkback_on_picture"
        this.$api.play.play_speak({ // 开启对讲
          flag: 1
        })
      } else {
        event.target.className = "talkback_off_picture"
        this.$api.play.play_speak({ // 关闭对讲
          flag: 0
        })
      }
    },
    adjust_show () { //显示亮度等参数
      if (this.cam_conf.day) {
        //night,white;night,auto,1;auto,2,white;auto,2,auto,1
        if (this.cam_conf.white_light && ((this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "white") || (this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 1) || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "white") || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 1))) {
          this.sharpness_value = parseInt(this.cam_conf.white_light.sharpness)
          this.contrast_value = parseInt(this.cam_conf.white_light.contrast)
          this.color_saturation_value = parseInt(this.cam_conf.white_light.color_saturation)
          this.brightness_value = parseInt(this.cam_conf.white_light.brightness)
        }
        //night,red;night,auto,0;auto,2,red;auto,2,auto,0
        else if ((this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "red") || (this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 0) || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "red") || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 0) || (this.cam_conf.day_night == "night" && (this.cam_conf.light_mode == "auto" || this.cam_conf.light_mode == "white") && this.cam_conf.red_or_white == 1)) {
          this.sharpness_value = parseInt(this.cam_conf.night.sharpness)
          this.contrast_value = parseInt(this.cam_conf.night.contrast)
          this.color_saturation_value = parseInt(this.cam_conf.night.color_saturation)
          this.brightness_value = parseInt(this.cam_conf.night.brightness)
        }
        //day;auto,1
        else if (this.cam_conf.day_night == "day" || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 1)) {
          this.sharpness_value = parseInt(this.cam_conf.day.sharpness)
          this.contrast_value = parseInt(this.cam_conf.day.contrast)
          this.color_saturation_value = parseInt(this.cam_conf.day.color_saturation)
          this.brightness_value = parseInt(this.cam_conf.day.brightness)
        }
      } else {
        this.sharpness_value = parseInt(this.cam_conf.sharpness)
        this.contrast_value = parseInt(this.cam_conf.contrast)
        this.color_saturation_value = parseInt(this.cam_conf.color_saturation)
        this.brightness_value = parseInt(this.cam_conf.brightness)
      }

      this.mode = this.cam_conf.day_night
    },
    clickAdjust (event) { // 点击设备调整按钮
      if (event.target.className === "adjust_off_picture") {
        event.target.className = "adjust_on_picture";
        this.$api.play.adjust_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
          this.cam_conf = res;
          this.cam_conf.sn = this.$store.state.jumpPageData.selectDeviceIpc
          this.adjust_show()
          if (this.whiteLight) {
            this.light_mode = this.cam_conf.light_mode
          }
        })
        this.adjustSettingFlag = true
      } else if (event.target.className === "adjust_on_picture") {
        event.target.className = "adjust_off_picture"
        this.adjustSettingFlag = false
      }
    },
    clickAdjustClose (event) { // 点击关闭设置弹窗
      this.adjustSettingFlag = false
    },
    turnCamera (action, direction) { // 摄像头转向方法调用
      this.$api.play.play_ptz_turn({ // 摄像头转向控制
        flag: action,
        direction: direction
      })
    },
    clickPlayView () { // 点击视频播放区域
      console.log('clickplay')
      let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0"
      this.playFlag = 1
      if (this.$store.state.jumpPageData.localFlag) { // 本地接口暂缓
        local_play_data.profile_token = profile_token
        local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
        msdk_ctrl({ type: "local_device_play", data: local_play_data })
      } else {
        this.$api.play.play({
          dom: $("#play_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: profile_token
        }).then(res => {
          this.play_speed(res)
        })
      }
      $("#video_play").attr("class", "video_play_start")
      this.cameraControlDivFlag = true
    },
    // 按钮点击事件 结束
    adjust_set () { //调整亮度等参数
      if (this.cam_conf.day) {
        //night,white;night,auto,1;auto,2,white;auto,2,auto,1
        if (this.cam_conf.white_light && ((this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "white") || (this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 1) || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "white") || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 1))) {
          this.cam_conf.is_white_light = this.whiteLight
          this.cam_conf.white_light.sharpness = this.sharpness_value
          this.cam_conf.white_light.contrast = this.contrast_value
          this.cam_conf.white_light.color_saturation = this.color_saturation_value
          this.cam_conf.white_light.brightness = this.brightness_value
        }
        //night,red;night,auto,0;auto,2,red;auto,2,auto,0
        else if ((this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "red") || (this.cam_conf.day_night == "night" && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 0) || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "red") || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 2 && this.cam_conf.light_mode == "auto" && this.cam_conf.red_or_white == 0) || (this.cam_conf.day_night == "night" && (this.cam_conf.light_mode == "auto" || this.cam_conf.light_mode == "white") && this.cam_conf.red_or_white == 1)) {
          this.cam_conf.night.sharpness = this.sharpness_value
          this.cam_conf.night.contrast = this.contrast_value
          this.cam_conf.night.color_saturation = this.color_saturation_value
          this.cam_conf.night.brightness = this.brightness_value
        }
        //day;auto,1
        else if (this.cam_conf.day_night == "day" || (this.cam_conf.day_night == "auto" && this.cam_conf.day_or_night == 1)) {
          this.cam_conf.day.sharpness = this.sharpness_value
          this.cam_conf.day.contrast = this.contrast_value
          this.cam_conf.day.color_saturation = this.color_saturation_value
          this.cam_conf.day.brightness = this.brightness_value
        }
      } else {
        this.cam_conf.sharpness = this.sharpness_value
        this.cam_conf.contrast = this.contrast_value
        this.cam_conf.color_saturation = this.color_saturation_value
        this.cam_conf.brightness = this.brightness_value
      }
    },
    adjust_reset () { //点击重置
      this.mode = "auto"
      if (this.whiteLight) {
        this.light_mode = "auto"
      }
      this.sharpness_value = 6
      this.contrast_value = 60
      this.color_saturation_value = 70
      this.brightness_value = 50
      if (this.cam_conf.day) {
        if (this.cam_conf.white_light) {
          this.cam_conf.is_white_light = this.whiteLight
          this.cam_conf.white_light.sharpness = this.sharpness_value
          this.cam_conf.white_light.contrast = this.contrast_value
          this.cam_conf.white_light.color_saturation = this.color_saturation_value
          this.cam_conf.white_light.brightness = this.brightness_value
        }
        this.cam_conf.night.sharpness = this.sharpness_value
        this.cam_conf.night.contrast = this.contrast_value
        this.cam_conf.night.color_saturation = this.color_saturation_value
        this.cam_conf.night.brightness = this.brightness_value

        this.cam_conf.day.sharpness = this.sharpness_value
        this.cam_conf.day.contrast = this.contrast_value
        this.cam_conf.day.color_saturation = this.color_saturation_value
        this.cam_conf.day.brightness = this.brightness_value
      } else {
        this.cam_conf.sharpness = this.sharpness_value
        this.cam_conf.contrast = this.contrast_value
        this.cam_conf.color_saturation = this.color_saturation_value
        this.cam_conf.brightness = this.brightness_value
      }
    },
    time_zone_alert () { //当设备时区与设置时区不一致时弹出提示
      let nowDate = new Date()
      this.$api.devlist.time_get({ // 获取选中时区的时间
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.current_time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (res.day && res.hour) {
          if (res.day === nowDate.getDate() && res.hour === nowDate.getHours()) {
            this.timezone_err_sign = false
          } else {
            this.timezone_err_sign = true
          }
        }
      })
    },
    clickAlarm () { //点击报警
      if (this.alarm_sign) {
        this.$api.play.alarm({ // 手动关闭报警
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          cmd: 'stop'
        })
        this.alarm_sign = false
      } else {
        this.publicFunc.delete_tips({
          content: mrs_alarm_tip_msg,
          title: mrs_manual_alarm,
          func: () => {
            this.$api.play.alarm({ // 手动开启报警
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              cmd: 'play'
            })
            this.alarm_sign = true
            setTimeout(() => { //60s后自动关闭报警
              this.$api.play.alarm({
                sn: this.$store.state.jumpPageData.selectDeviceIpc,
                cmd: 'stop'
              }).then(res => {
                this.alarm_sign = false
              })
            }, 60000)
          }
        })
      }
    }
  },
  async mounted () {
    window.onresize = () => { //屏幕宽度改变
      window.screenWidth = document.body.clientWidth
      this.screenWidth = window.screenWidth
    }
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    console.log(this.$refs.resolute_choice.offsetTop, 'this.$refs.resolute_choice.offsetTop')
    if (this.$refs.resolute_choice.offsetTop) {
      this.definitionTop = (this.$refs.resolute_choice.offsetTop - 113) + 'px'
    }
    let pageData; //页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    } else {
      pageData = { parent: $("#" + this.$route.name) }
    }
    if (pageData.parent.length === 0) {
      pageData.parent = $("#" + pageData.parentId)
    }
    // console.log(pageData,"pageData")
    await this.mipcPlay(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
  },
  watch: {
    '$store.state.jumpPageData.selectDeviceIpc' (val) {
      this.mipcPlay()
    },
    sharpness_value (val) {
      if (val || val == 0) {
        this.$refs.sharpness.style.backgroundSize = val + '% 100%'
      }
    },
    contrast_value (val) {
      if (val || val == 0) {
        this.$refs.contrast.style.backgroundSize = val + '% 100%'
      }
    },
    color_saturation_value (val) {
      if (val || val == 0) {
        this.$refs.color_saturation.style.backgroundSize = val + '% 100%'
      }
    },
    brightness_value (val) {
      if (val || val == 0) {
        this.$refs.brightness.style.backgroundSize = val + '% 100%'
      }
    },
    mode (val) {
      if (val) {
        this.cam_conf.day_night = val
        this.adjust_show()
      }
    },
    light_mode (val) {
      if (val) {
        this.cam_conf.light_mode = val
      }
    },
    cam_conf: {
      handler (val) {
        if (val) {
          this.$api.play.adjust_set({ conf: this.cam_conf })
        }
      },
      deep: true
    },
    screenWidth (val) {
      this.playScreenHeight = { height: ((val - document.getElementById('dev_main_left').offsetWidth - 60) * 0.563) + 'px' }
      this.publicFunc.mx("#dev_main_right").style.width = val - this.publicFunc.mx("#dev_main_left").offsetWidth - 60 + "px"
      this.publicFunc.mx("#dev_main_left").style.height = (document.documentElement.clientHeight - 54) + "px"
      this.publicFunc.mx("#dev_list_nav").style.height = (this.publicFunc.mx("#dev_main_left").offsetHeight - 43) + "px"
    },
    alarm_sign (val) {
      let timer = null
      if (val) {
        this.alarm_countdown_code = 60
        timer = setInterval(() => {
          this.alarm_countdown_code--
          if (this.alarm_countdown_code <= 0 || this.alarm_sign === false) {
            clearInterval(timer)
          }
        }, 1000)
      }
    }
  }
}
</script>