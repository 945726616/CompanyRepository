<template>
  <div id="play">
    <div id='play_box' class='noselect' v-if="!fullScreenFlag">
      <div id='play_content_box'>
        <!-- 顶部返回 -->
        <div id='page_top_menu'>
          <div id='back' @click="clickBack">
            <div id='main_title_box_return_img'></div>{{mcs_back}}
          </div>
        </div>
        <!-- 顶部返回 结束 -->
        <!-- 视频播放区 -->
        <!-- 非全屏 -->
        <div id='play_view' ref="play_view" class='noselect' :style="playViewStyle" :v-show="!fullScreenFlag">
          <div id='play_buffer_ret'></div>
          <div style="position: relative;">
            <!-- 设备时区与设置时区不同提示 -->
            <div id='timezone_err_tip' v-show='timezone_err_sign'>
              {{mcs_set_timezone_prompt_start}}{{current_time_zone}},{{mcs_set_timezone_prompt_end}}
              <span class='err_tip_close' @click='timezone_err_sign = false'></span>
            </div>
            <!-- 报警倒计时 -->
            <div id='alarm_countdown' v-show='alarm_sign'>
              <div class='audio_alarm'></div>
              <div>{{mrs_audio_alarm}}</div>
              <div>{{alarm_countdown_code}}</div>
            </div>
            <div id='play_screen' class='noselect'>
              <!-- 客户端部分视频播放区域 -->
              <div v-show="playFlag" id="play_img">
                <canvas id="video" ref="video" @click="clickFullScreen"></canvas>
              </div>
              <!-- 暂停播放遮罩层 -->
              <div v-show="!playFlag" id='play_view_box' @click="clickPreview">
                <div id='play_pause_pic'></div>
              </div>
              <!-- 暂停播放遮罩 -->
            </div>
          </div>
          <!-- 播放底部菜单栏 -->
          <div id='play_menu_box'>
            <div id='play_menu_left'>
              <div id='video_play' :class="playFlag ? 'video_play_start' : 'video_play_stop'" @click="clickPlay()"></div>
              <div id='voice_close' :class="voiceFlag ? 'voice_close_open' : 'voice_close_close'" v-show="clientFlag" @click="clickVoice()"></div>
            </div>
            <div id='play_menu_right'>
              <div id='enter_history_img' @click="clickEnterHistory">
                <div id='enter_history_img_box_tip'>{{mcs_playback}}</div>
              </div>
              <div class='enter_nav'></div>
              <div id='enter_set_img' @click="clickEnterSet"></div>
              <div class='enter_nav'></div>
              <div id="resolute_div">
                <!-- 清晰度选择弹出菜单 -->
                <div id='choice_play_definition' v-show="definitionListFlag" :style="{top: definitionTop}">
                  <div id='high_definition' class='definition_cha' @click="clickVideoDefinition">{{highDefinitionClear}}
                  </div>
                  <div class='definition_nav'></div>
                  <div id='standard_definition' class='definition_cha' @click="clickStandard">{{mcs_standard_clear}}
                  </div>
                  <div class='definition_nav'></div>
                  <div id='fluency_definition' class='definition_cha' @click="clickFluency">{{mcs_fluent_clear}}</div>
                  <div class='definition_nav'></div>
                  <div id='auto_definition' class='definition_cha' @click="clickAuto">{{mcs_auto}}</div>
                </div>
                <!-- 清晰度选择弹出菜单 结束 -->
                <!-- 点击选择按钮对菜单展示标识取反 -->
                <div ref="resolute_choice" id='resolute_choice' @click="definitionListFlag = !definitionListFlag">
                  {{definitionSelect}}</div>
              </div>
              <div class='enter_nav' v-show="clientFlag"></div>
              <div id='full_screen' v-show="clientFlag" @click="clickFullScreen"></div><!-- 全屏播放 -->
            </div>
          </div>
          <!-- 播放底部菜单栏 结束 -->
          <div id='play_view_control' class='noselect' v-show="Boolean(cameraControlDivFlag)">
            <!--:style="{
            'width': (document.documentElement.clientWidth - 17 - 100) - ($refs.play_dev_list.width + 20) + 'px',
            'height': playViewHeight - 44 + 'px',
            'left': $refs.play_view.offsetLeft + 'px',
            'top': playViewTop + "px"}"-->
            <!-- 顶部数据传输kb值暂时条(放在这里与控制菜单置于同一层避免影响播放界面效果) -->
            <div id='vimtag_ptz_control'>
              <div id='ptz_control_left' @mouseover="leftControl = true" @mouseout="leftControl = false">
                <div id='turn_left' class='left_key' v-show="leftControl" @mousedown="turnCamera('move', 'left')"
                  @mouseup="turnCamera('stop', 'left')"></div>
                <div id='ptz_click_left'>{{mcs_top_left}}</div>
              </div>
              <div id='ptz_control_center'>
                <div id='ptz_control_up' @mouseover="topControl = true" @mouseout="topControl = false">
                  <div id='turn_up' class='up_key' v-show="topControl" @mousedown="turnCamera('move', 'up')"
                    @mouseup="turnCamera('stop', 'up')"></div>
                  <div id='ptz_click_up'>{{mcs_bottom_left}}</div>
                </div>
                <div id='ptz_control_bottom_center' @dblclick="$api.play_mac.fullscreen()"></div>
                <div id='ptz_control_bottom'>
                  <!-- 弹出控制选项按钮 -->
                  <div id='control_menu'>
                    <div id='video_off_pic' class='video_off_picture' v-show="recordFlag"
                      @click="clickRecordVideo($event)"></div>
                    <div id='camera_off_pic' class='camera_off_picture' @click="clickScreenShot"></div>
                    <div id='talkback_off_pic' class='talkback_off_picture' v-show="clientFlag"
                      @click="clickTalkback($event)"></div>
                    <div id='adjust_off_pic' :class='adjustSettingFlag?"adjust_on_picture":"adjust_off_picture"'
                      @click="clickAdjust($event)"></div>
                    <div id='alarm_pic' :class='alarm_sign?"alarm_on_picture":"alarm_off_picture"' @click="clickAlarm"
                      v-show='audio_alarm_manually'></div>
                  </div>
                  <!-- 弹出控制选项按钮 结束-->
                </div>
                <div id='ptz_control_down' @mouseover="downControl = true" @mouseout="downControl = false">
                  <div id='turn_down' class='down_key' v-show="downControl" @mousedown="turnCamera('move', 'down')"
                    @mouseup="turnCamera('stop', 'down')"></div>
                  <div id='ptz_click_down'>{{mcs_bottom_right}}</div>
                </div>
              </div>
              <div id='ptz_control_right' @mouseover="rightControl = true" @mouseout="rightControl = false">
                <div id='turn_right' class='right_key' v-show="rightControl" @mousedown="turnCamera('move', 'right')"
                  @mouseup="turnCamera('stop', 'right')"></div>
                <div id='ptz_click_right'>{{mcs_top_right}}</div>
              </div>
              <!-- 摄像头设置弹窗 -->
              <div id='adjust_setting' v-show="adjustSettingFlag">
                <div class='adjust_line'>
                  <div id='delete_adjust_page' class='delete_adjust_page' @click="clickAdjustClose()"></div>
                </div>
                <div class='adjust_line'>
                  <div class='adjust_cha'>{{mcs_mode}}</div>
                  <div class='adjust_mode_cha'>
                    <label class='adjust_mode'>
                      <input type='radio' v-model='mode' value='auto' />
                      <div id='adjust_mode_auto' class='mode_cha'>{{mcs_auto}}</div>
                    </label>
                    <label class='adjust_mode'>
                      <input type='radio' v-model='mode' value='day' />
                      <div id='adjust_mode_daytime' class='mode_cha'>{{mcs_daytime}}</div>
                    </label>
                    <label class='adjust_mode'>
                      <input type='radio' v-model='mode' value='night' />
                      <div id='adjust_mode_night' class='mode_cha'>{{mcs_night}}</div>
                    </label>
                  </div>
                </div>
                <!-- 白光时设置框内容 -->
                <div class='adjust_line' v-if="whiteLight">
                  <div class='adjust_cha'>{{mcs_light_mode}}</div>
                  <div class='adjust_mode_cha'>
                    <label class='adjust_mode'>
                      <div id='mode_smart' class='adjust_mode_circle'></div>
                      <input type='radio' v-model='light_mode' value='auto' />
                      <div id='adjust_mode_smart' class='mode_cha'>{{mcs_light_smart}}</div>
                    </label>
                    <label class='adjust_mode'>
                      <input type='radio' v-model='light_mode' value='red' />
                      <div id='adjust_mode_infrared' class='mode_cha'>{{mcs_light_infrared}}</div>
                    </label>
                    <label class='adjust_mode'>
                      <input type='radio' v-model='light_mode' value='white' />
                      <div id='adjust_mode_white' class='mode_cha'>{{mcs_light_white}}</div>
                    </label>
                  </div>
                </div>
                <!-- 白光时设置框内容 结束 -->
                <div class='adjust_line'>
                  <div class='adjust_cha'>{{mcs_sharpness}}</div>
                  <input type='range' v-model='sharpness_value' min='0' max='100' ref='sharpness'
                    @mouseup="adjust_set" />
                  <div id='brightness_value' class='adjust_show_value'>{{sharpness_value}}</div>
                </div>
                <div class='adjust_line'>
                  <div class='adjust_cha'>{{mcs_contrast}}</div>
                  <input type='range' v-model='contrast_value' min='0' max='100' ref='contrast' @mouseup="adjust_set" />
                  <div id='contrast_value' class='adjust_show_value'>{{contrast_value}}</div>
                </div>
                <div class='adjust_line'>
                  <div class='adjust_cha'>{{mcs_color_saturation}}</div>
                  <input type='range' v-model='color_saturation_value' min='0' max='100' ref='color_saturation'
                    @mouseup="adjust_set" />
                  <div id='saturation_value' class='adjust_show_value'>{{color_saturation_value}}</div>
                </div>
                <div class='adjust_line'>
                  <div class='adjust_cha'>{{mcs_brightness}}</div>
                  <input type='range' v-model='brightness_value' min='0' max='100' ref='brightness'
                    @mouseup="adjust_set" />
                  <div id='sharpness_value' class='adjust_show_value'>{{brightness_value}}</div>
                </div>
                <div id='adjust_reset' @click='adjust_reset'>{{mcs_reset}}</div>
              </div>
              <!-- 摄像头设置弹窗 结束 -->
            </div>
          </div>
        </div>
        <!-- 全屏 -->
        <!-- <canvas id="fullScreenCanvas" :v-show="fullScreenFlag"></canvas> -->
        <!-- 视频播放区 结束 -->
        <!-- 侧边播放列表 -->
        <div id='play_dev_list' ref="play_dev_list" v-show="!this.$store.state.jumpPageData.localFlag"
          :style="{height: playViewHeight + 'px'}">
          <div id='device_list_sidebar_up'>{{mcs_device_list}}</div>
          <div id='device_list_sidebar_center' :style="{height: playListHeight + 'px'}">
            <div class='device_list_sidebar_img' v-for="data in device_list_data" :key="data.sn" :stat="data.stat === 'Online' ? 'Online' : 'offline'" :sn="data.box_sn" :ipc_sn="data.sn" @click="clickPlayDevice(data)">
              <div class='sidebar_camera_sign_picture' :style="{ 'background-image': data.stat === 'Online' ? data.picSrc : data.def_img, 'background-size': '100% 100%' }">
                <!-- :style="{backgroundImage: 'url(' + data.picSrc + ')'}" -->
                <!-- <img :src="data.stat === 'Online' ? data.picSrc : data.def_img" width="100%" height="100%"> -->
              </div>
              <div class='device_sidebar_nick' :class="data.selectFlag ? 'selected_style' : ''" >
                <span>&bull; {{data.nick}}</span>
              </div>
            </div>
            <div id="active_dev" :style="{top: selectDeviceTop}"></div>
          </div>
        </div>
        <!-- 侧边播放列表 结束 -->
      </div>
      <!-- 截图弹窗 -->
      <div id='snapshot_preview_div' v-show="snapshotFlag">
        <div id='snapshot_preview_inner'>
          <img id='snapshot_preview_content' :src="snapshotUrl">
          <!-- 注释部分为web端使用的截图下载功能 -->
          <!-- <a id='snapshot_preview_url' :download="snapshotDownloadName" :href="snapshotUrl"> -->
          <a id='snapshot_preview_url' @click="clickSnapshotDownload">
            <div id='snapshot_img_page_download'></div>
          </a>
        </div>
        <div id='snapshot_preview_close' @click="snapshotFlag = false"></div>
      </div>
      <!-- 截图弹窗 结束 -->
    </div>
  </div>
</template>
<style lang="scss">
@import './index.scss';
</style>
<script>
import store from '../../../store'
import WebglScreen from '../../../lib/plugins/WebglScreen.js'
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
      mcs_back: mcs_back,
      mcs_top_left: mcs_top_left,
      mcs_bottom_left: mcs_bottom_left,
      mcs_bottom_right: mcs_bottom_right,
      mcs_top_right: mcs_top_right,
      mcs_device_list: mcs_device_list,
      mcs_set_timezone_prompt_start: mcs_set_timezone_prompt_start,
      mcs_set_timezone_prompt_end: mcs_set_timezone_prompt_end,
      mrs_audio_alarm: mrs_audio_alarm,
      // 多国语言结束
      whiteLight: null, // 设备白光信息存储
      playFlag: 0, // 播放状态标识
      definitionListFlag: false, // 清晰度选择列表展示标识
      definitionSelect: null, // 最终选择的清晰度
      support_1080p: '', // 1080p分辨率内容展示
      clientP2PingValue: '0kB', // 客户端视频播放流数据值显示
      clientFlag: store.state.user.clientFlag, // 客户端标识控制以下功能的显隐: 声音控制图标标识(在客户端中展示,浏览器端隐藏)、全屏控制图标标识(在客户端中展示,浏览器端隐藏)、客户端视频播放展示KB值。对讲控制图标标识(在客户端中展示,浏览器端隐藏)
      recordFlag: false, // 隐藏控制菜单中录像按钮
      snapshotFlag: false, // 截图弹窗展示标识
      snapshotUrl: null, // 截图图片url
      snapshotDownloadName: null, // 截图图片下载的文件名
      adjustSettingFlag: false, // 设置弹出框标识
      definitionTop: '', // 清晰度选择弹窗top属性
      cameraControlDivFlag: false, // 摄像头转向控制区域展示标识
      leftControl: false, // 摄像头左转控制标识
      rightControl: false, // 摄像头右转控制标识
      topControl: false, // 摄像头上转控制标识
      downControl: false, // 摄像头下转控制标识
      playScreenHeight: null, // 播放区域高度样式
      vimtagPlayObj: null, // 调用vimtagPlay的obj内容
      playViewStyle: null, // 播放器样式
      playViewHeight: null, // 播放器高度数值
      playViewWidth: null, // 播放器宽度数值
      playViewTop: null, // 播放器顶部偏移数值
      playListHeight: null, // 播放列表高度数值
      mode: '', //控制模式（自动，白天，夜间）
      light_mode: '', //控制灯光模式（智能，白光，红外）
      sharpness_value: '', //锐度
      contrast_value: '', //对比度
      color_saturation_value: '', //饱和度
      brightness_value: '', //亮度
      cam_conf: '', //保存设备模式亮度等数据
      highDefinitionClear: '', // 接口获取的该设备可播放的最高清晰度
      local_play_data: {}, //本地播放数值
      timezone_err_sign: false, //设置的时区与本地时区是否一致标识
      current_time_zone: null, //当前时区
      alarm_sign: false, //是否手动报警
      audio_alarm_manually: '', //设备是否能手动报警
      alarm_countdown_code: 60, //报警60s倒计时
      scheduled: false, // canvas标识
      queue: [], // 队列
      renderer: null,
      video: document.getElementById('video'),
      canvasInitFlag: false, // canvas初始化标识
      fullScreenFlag: false, // 是否为全屏播放标识
      device_list_data: null, // 设备列表数据
      selectDeviceTop: null, // 设备列表选中框top值
      voiceFlag: 0, // 播放页声音开关标识
      nowCanvasWidth: 0, // 当前canvas渲染的宽度
      nowCanvasHeight: 0, // 当前canvas渲染的高度
    }
  },
  methods: {
    vimtagPlay (obj) {
      let _this = this
      this.vimtagPlayObj = obj // 暂存调用的obj内容
      console.log("传递过来的数据", obj)
      this.local_play_data.addr = obj.addr
      this.local_play_data.dom = _this.publicFunc.mx("#play_screen")
      this.local_play_data.profile_token = "p0"

      let l_dom_play_menu_box = _this.publicFunc.mx("#play_menu_box");
      let l_dom_play_buffer_ret = _this.publicFunc.mx("#play_buffer_ret");
      let l_play_box_width = document.documentElement.clientWidth - 17 - 100;
      $("#play_box").css("width", l_play_box_width + 'px');

      _this.publicFunc.mx("#play_dev_list").setAttribute("style", "width:234px;float:left;background:#ebebeb;display:block;overflow:hidden;position: relative;");
      l_dom_play_buffer_ret.style.display = "none";
      // 动态设置播放器大小
      this.playViewWidth = (document.documentElement.clientWidth - 17 - 100) - (parseInt($("#play_dev_list").css("width")) + 20)
      this.playViewHeight = this.playViewWidth / 16 * 9 + 44
      this.playViewStyle = { width: this.playViewWidth + 'px', height: this.playViewHeight + 'px' }

      // 添加占位div高度
      document.getElementById('play_screen').style.height = this.playViewHeight - 44 + 'px'

      document.getElementById('timezone_err_tip').style.width = this.playViewWidth + 'px';
      this.playListHeight = this.playViewHeight - document.getElementById('device_list_sidebar_up').offsetHeight
      this.playViewTop = document.getElementById('play_view').offsetTop
      // 动态设置播放器大小 结束
      if (_this.$store.state.jumpPageData.localFlag) {
        // 本地搜索模式禁用回放/设置
        $("#enter_history_img").hide()
        $("#enter_set_img").hide()
      } else if (_this.$store.state.jumpPageData.experienceFlag) {
        // 体验模式禁用设置
        $("#enter_set_img").hide()
      } else if (obj.box_ipc == 1) {
        // obj.box_ipc==1 代表云盒子  隐藏设置
        $("#enter_set_img").hide()
        $("#enter_set_img").next().hide() // 竖线
      }
      this.play_menu_control({ parent: l_dom_play_menu_box })
      if (!_this.$store.state.jumpPageData.localFlag) {
        this.device_list_box_sidebar()
        this.play_view_control()
      }
      setTimeout(() => { // 设定时器是为了ccm_date_get接口不能及时获取当前时区的时间
        this.time_zone_alert();
      }, 2000)
      // ********** 设置设备的时区是校验时间是否与当前系统时间相符 ********** //
    },
    // 播放回调 播放速度
    play_speed (data) {
      console.log(data, 'play_speed')
      window.pywebview.api.getPlayUrl(data.data.url, 'live')
      // this.publicFunc.mx("#play_buffer_ret").innerHTML = data
    },
    // 播放回调 播放速度 结束
    // 播放器菜单栏控制
    play_menu_control (data) {
      let _this = this
      let obj = this.vimtagPlayObj
      this.$api.set.dev_info({ //ms.send_msg("dev_info_get"
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        dev_info_get_ack(res)

        function dev_info_get_ack (msg) {
          // console.log(msg, 'dev_info_get_ack_msg')
          if (msg && msg.white_light) {
            _this.whiteLight = msg.white_light;
          }
          _this.play_view_control()
          if (obj.box_ipc === 1) { //如果云盒子实时播放页面
            _this.definitionSelect = mcs_new_hd //云盒子实时播放不能切换分辩率，显示高清
          } else {
            if (msg.s_sensor === 'ok') {
              _this.highDefinitionClear = msg.def
              _this.definitionSelect = msg.def
              _this.support_1080p = msg.def
            } else {
              _this.highDefinitionClear = 'NULL'
              _this.definitionSelect = 'NULL'
              _this.support_1080p = 'NULL'
            }
          }
          // 迁移接口请求顺序将播放接口放入设备信息请求接口后
          if (_this.$store.state.jumpPageData.localFlag) {
            let local_play_sign = {}
            local_play_sign.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            local_play_sign.addr = obj.addr
            local_play_sign.password = sessionStorage.getItem("pass_" + _this.$store.state.jumpPageData.selectDeviceIpc)
            _this.$api.local.local_sign_in({
              data: local_play_sign
            }).then(res => {
              if (res.result === '') {
                _this.$store.dispatch('setLocalLid', res.lid) //登录返回lid head中
                _this.$store.dispatch('setLocalSid', res.sid)
                _this.$store.dispatch('setLocalSeq', res.seq)
              }
              _this.local_play_data.agent = _this.$store.state.jumpPageData.localFlag_agent
              _this.create_preview({ parent: $("#play_screen") })
            })
          } else {
            if (obj.box_ipc === 1) { //如果是云盒子实时视频播放 参数token
              if (obj.ipc_stat === 0) { //页面一进来，标记云盒子设备是否在线
                // 调用播放接口
                _this.$api.play_mac.play({
                  dom: $("#play_screen"),
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  profile_token: "p0_" + obj.ipc_sn + "",
                  ipc_stat: 0
                }).then(res => {
                  _this.play_speed(res)
                })
                $("#play_screen").style.background = 'black'
                _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 })
                $("#enter_history_img_box_tip").show()
                setTimeout(function () {
                  $("#enter_history_img_box_tip").hide()
                }, 6000);

              } else {
                // 调用播放接口
                _this.$api.play_mac.play({
                  dom: $("#play_screen"),
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  profile_token: "p0_" + obj.ipc_sn + ""
                }).then(res => {
                  _this.play_speed(res)
                })
              }
            } else {
              // 此处为非云盒子, 设备ipc进入后执行的播放接口
              // 调用播放接口
              _this.$api.play_mac.play({
                dom: $("#play_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                profile_token: "p0"
              }).then(res => {
                _this.play_speed(res)
              })
            }
            _this.playFlag = 1
            _this.cameraControlDivFlag = true
          }
          _this.audio_alarm_manually = msg.audio_alarm_manually //判断设备是否能手动报警
        }
      })
    },
    create_preview (data) {
      let _this = this
      let obj = this.vimtagPlayObj
      let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0"
      this.cameraControlDivFlag = false
      if (_this.$store.state.jumpPageData.localFlag) {
        _this.$api.play_mac.play_preview_img({ addr: obj.addr, sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
      } else {
        if (obj.box_ipc == 1) {
          let pic_token = obj.ipc_sn + "_p3_" + Math.pow(2, 31) + "_" + Math.pow(2, 31)
          _this.$api.play_mac.play_preview_img({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: pic_token })
        } else {
          _this.$api.play_mac.play_preview_img({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
        }
      }
      l_dom_play_view_box.onclick = function () {
        profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0"
        _this.playFlag = 1
        if (obj.box_ipc === 1) {
          // 调用播放接口
          _this.$api.play_mac.play({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: "p0_" + obj.ipc_sn
          }).then(res => {
            _this.play_speed(res)
          })
        } else {
          // 调用播放接口
          _this.$api.play_mac.play({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: profile_token
          }).then(res => {
            _this.play_speed(res)
          })
        }
        _this.cameraControlDivFlag = true
      }
    },
    // 获取设备列表信息
    async device_list_box_sidebar () {
      let obj = this.vimtagPlayObj
      if (this.$store.state.jumpPageData.localFlag) {
        // 在本地模式下获取设备列表信息
        window.pywebview.api.local_search()
      } else {
        // 从设备列表中取出存留的设备列表信息
        if (obj.box_ipc) {
          // 盒子设备信息
          this.$api.play_mac.load_imgs({ dom: l_dom_device_list_img, box_ipc: 1 }) // 请求图片
          // this.device_list(this.$store.state.jumpPageData.boxDeviceData)
        } else {
          this.device_list_data = this.$store.state.jumpPageData.deviceData
          for(let i = 0; i < this.device_list_data.length; i++) {
            let picSrc = this.$api.play_mac.load_list_imgs(this.device_list_data[i]) // 请求图片
            // let picSrc = await this.$api.devlist.pic_url_get(this.device_list_data[i].sn) // 请求图片
            if (this.device_list_data[i].sn === this.$store.state.jumpPageData.selectDeviceIpc) {
              this.$set(this.device_list_data[i], 'selectFlag', 1)
              this.selectDeviceTop = (10 * (i + 1) + 145 * i) + "px"
            } else {
              this.$set(this.device_list_data[i], 'selectFlag', 0)
            }
            this.$set(this.device_list_data[i], 'picSrc', picSrc)
          }
          // this.device_list(this.$store.state.jumpPageData.deviceData)
        }
      }
    },
    // 点击播放页播放列表
    clickPlayDevice (data) {
      this.publicFunc.showBufferPage()
      let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0"
      // 重新设置设备列表的数据
      for(let i = 0; i < this.device_list_data.length; i++) {
        if (this.device_list_data[i].sn === data.sn) {
          this.$set(this.device_list_data[i], 'selectFlag', 1)
          this.selectDeviceTop = (10 * (i + 1) + 145 * i) + "px"
        } else {
          this.$set(this.device_list_data[i], 'selectFlag', 0)
        }
      }
      let ipc_sn = data.sn // 点击列表中的设备，获取云盒子中设备id
      let box_ipc_stat = data.stat // 获取云盒子设备状态

      this.play_view_control()
      this.vimtagPlayObj.ipc_sn = ipc_sn //给this.vimtagPlayObj.ipc_sn重新赋值 解决回放bug
      this.$store.dispatch('setSelectDeviceIpc', data.sn) // 点击时存储sn
      if (data.stat === 'online') {
        this.time_zone_alert()
      } else if (data.stat === 'offline') { //设备不在线不显示时区错误提示
        this.timezone_err_sign = false
      }
      this.$api.set.dev_info({
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.audio_alarm_manually = res.audio_alarm_manually //判断设备是否能手动报警
      })
      console.log(this.playFlag, '播放状态')
      if (this.playFlag) {
        window.pywebview.api.destroyPlay()
        // this.queue = []
        console.log('queue', this.queue)
      }
      if (this.vimtagPlayObj.box_ipc == 1) {
        // 云盒子离线
        if (box_ipc_stat == 'offline') {
          $("#play_screen").style.background = 'black'
          _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 })
          $("#enter_history_img_box_tip").show()
          setTimeout(function () {
            $("#enter_history_img_box_tip").hide()
          }, 6000)
        } else {
          // 云盒子在线
          // 调用播放接口
          window.pywebview.api.destroyPlay()
          this.$api.play_mac.play({
            dom: $("#play_screen"),
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            profile_token: "p0_" + ipc_sn + ""
          }).then(res => {
            this.play_speed(res)
          })
        }
      } else {
        // 设备在线
        // 调用播放接口
        this.$api.play_mac.play({
          dom: $("#play_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: profile_token
        }).then(res => {
          this.play_speed(res)
        })
      }
      this.playFlag = 1
      this.cameraControlDivFlag = true
      // $("#play_view_control").show()
      this.publicFunc.mx("#video_play").className = "video_play_start"
    },
    // 摇头机镜头控制
    play_view_control (data) {
      let l_dom_turn_left = this.publicFunc.mx("#turn_left");
      let l_dom_turn_right = this.publicFunc.mx("#turn_right");
      let l_dom_turn_up = this.publicFunc.mx("#turn_up");
      let l_dom_turn_down = this.publicFunc.mx("#turn_down");
      let l_dom_ptz_control_bottom_center = this.publicFunc.mx("#ptz_control_bottom_center");
      let l_dom_play_view_control = this.publicFunc.mx("#play_view_control")
      l_dom_play_view_control.style.width = (document.documentElement.clientWidth - 17 - 100) - (parseInt($("#play_dev_list").css("width")) + 20) + 'px';
      l_dom_play_view_control.style.height = this.playViewHeight - 44 + 'px';
      l_dom_play_view_control.style.left = this.publicFunc.mx('#play_view').offsetLeft + "px";
      l_dom_play_view_control.style.top = this.playViewTop + "px";
      l_dom_turn_up.className = "up_key";
      l_dom_turn_down.className = "down_key";
      l_dom_turn_left.className = "left_key";
      l_dom_turn_right.className = "right_key";

      // 鼠标点击视频中间窗口弹出菜单
      l_dom_ptz_control_bottom_center.onclick = function () {
        let is_display = 0;
        // let is_innerhtml = this.publicFunc.mx("#play_buffer_ret").innerHTML;
        this.cameraControlDivFlag = true
        // $("#play_view_control").show();
        // if (is_innerhtml) {
        is_display = $("#ptz_control_bottom").css("display") == "none" ? 0 : 1;
        if (is_display) {
          $("#ptz_control_bottom").hide();
        } else {
          $("#ptz_control_bottom").show();
        }
        // }
      }
      // let _timerflag = {}; //Resolve multiple clicks
    },
    // 获取设备列表信息 结束
    // 按钮点击事件
    clickPreview () {
      let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
      this.playFlag = 1
      if (this.vimtagPlayObj.box_ipc === 1) {
        // 调用播放接口
        this.$api.play_mac.play({
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: "p0_" + this.vimtagPlayObj.ipc_sn
        }).then(res => {
          this.play_speed(res)
        })
      } else {
        // 调用播放接口
        this.$api.play_mac.play({
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: profile_token
        }).then(res => {
          this.play_speed(res)
        })
      }
      this.cameraControlDivFlag = true
    },
    clickPlay () { // 点击播放按钮
      if (!this.playFlag) { // 当前处于暂停状态
        this.playFlag = 1 // 更改播放状态至播放
        let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
        this.$api.play_mac.play({ // 调用播放接口进行视频播放
          dom: $("#play_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: profile_token
        }).then(res => {
          this.play_speed(res) // 调用播放速度回调函数
        })
        this.cameraControlDivFlag = true // 摄像头方向控制按钮展示
      } else { // 当前处于播放状态
        this.playFlag = 0 // 更改播放状态至暂停
        // 注销视频线程
        window.pywebview.api.destroyPlay()
        // 如果当前处于音频线程开启状态则关闭音频
        if (this.voiceFlag) {
          window.pywebview.api.voice_close()
          this.voiceFlag = 0
        }
        this.create_preview({ parent: $("#play_screen") }) // 绘制暂停封面以及按钮
        if (this.$store.state.jumpPageData.localFlag) {
          this.$api.play_mac.play_preview_img({ addr: obj.addr, dom: $("#play_screen"), sn: this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
        } else {
          this.$api.play_mac.play_preview_img({ dom: $("#play_screen"), sn: this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
        }
        event.target.className = "video_play_stop" // 更改播放按钮的className
        this.cameraControlDivFlag = false // 摄像头方向控制按钮展示
        // $("#play_view_control").hide()
        console.log(this.cameraControlDivFlag, '隐藏控制')
      }
    },
    clickVideoDefinition () { // 点击选择视频清晰度
      this.definitionListFlag = false
      sessionStorage.setItem("PlayProfile", "p0")
      if (this.$store.state.jumpPageData.projectName === "vsmahome") {
        this.definitionSelect = this.mcs_new_hd
      } else {
        this.definitionSelect = this.support_1080p
      }
      if (this.playFlag) {
        this.$api.play_mac.play({
          dom: $("#play_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: "p0"
        }).then(res => {
          this.play_speed(res)
        })
      }
    },
    clickStandard () { // 点击标准清晰度
      window.pywebview.api.destroyPlay() // 注销当前视频通道
      this.definitionListFlag = false // 隐藏清晰度选择弹窗
      sessionStorage.setItem("PlayProfile", "p1")
      this.definitionSelect = this.mcs_standard_clear
      if (this.playFlag) {
        if (this.$store.state.jumpPageData.localFlag) { // 本地内容暂缓
          this.local_play_data.profile_token = "p1"
          this.local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
          // this.$api.local.local_device_play({ data: this.local_play_data })
          this.$api.local.local_play({ data: this.local_play_data })
        } else {
          this.$api.play_mac.play({
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
      window.pywebview.api.destroyPlay() // 注销当前视频通道
      this.definitionListFlag = false // 隐藏清晰度选择弹窗
      sessionStorage.setItem("PlayProfile", "p2")
      this.definitionSelect = this.mcs_fluent_clear
      if (this.playFlag) {
        if (this.$store.state.jumpPageData.localFlag) { // 本地内容暂缓
          this.local_play_data.profile_token = "p2"
          this.local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
          // this.$api.local.local_device_play({ data: this.local_play_data })
          this.$api.local.local_play({ data: this.local_play_data })
        } else {
          this.$api.play_mac.play({
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
      this.publicFunc.showBufferPage()
      let obj = this.vimtagPlayObj
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
      if (this.vimtagPlayObj.box_ipc == 1) { //云盒子设备实时播放时点击回放
        let jumpData = { parent: $("#dev_main_page"), dev_sn: this.vimtagPlayObj.ipc_sn, back_page: "play", box_ipc: this.vimtagPlayObj.box_ipc, ipc_sn: this.vimtagPlayObj.ipc_sn, box_live: 1 };
        this.$router.push({ name: 'history', params: jumpData })
      } else {
        let jumpData = { parent: $("#dev_main_page"), dev_sn: this.$store.state.jumpPageData.selectDeviceIpc, back_page: "play" }
        this.$router.push({ name: 'history', params: jumpData })
      }
    },
    clickVoice () { // 点击声音图标
      if (!this.voiceFlag) {
        window.pywebview.api.voice_open()
        this.voiceFlag = 1
      } else {
        window.pywebview.api.voice_close()
        this.voiceFlag = 0
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
    clickRecordVideo (event) { // 点击隐藏菜单中的录像按钮
      if (event.target.className === "video_on_picture") {
        event.target.className = "video_off_picture"
        this.$api.play_mac.play_record({
          recording: 1,
          sn: this.$store.state.jumpPageData.selectDeviceIpc
        })
      } else {
        event.target.className = "video_on_picture"
        this.$api.play_mac.play_record({
          recording: 0,
          sn: this.$store.state.jumpPageData.selectDeviceIpc
        })
      }
    },
    clickScreenShot () { // 点击隐藏菜单中的截图按钮
      if (this.$store.state.jumpPageData.selectDeviceIpc) {
        this.$api.play_mac.play_snapshot({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => { // 调用截图接口
          // this.publicFunc.log_upload('take_picture'); //记录日志：拍照
          console.log(res, '截图res')
          this.snapshotFlag = true
          this.snapshotUrl = res
          this.snapshotDownloadName = new Date().getTime() + ".jpg"
        })
      }
    },
    clickSnapshotDownload () { // 点击调用截图下载按钮
      // snapshotDownloadName为截图保存名称, snapshotUrl为截图下载链接
      window.pywebview.api.snapshotDownload(this.snapshotDownloadName, this.snapshotUrl)
    },
    clickTalkback (event) { // 调用对讲功能
      let class_name = event.target.className
      if (class_name === "talkback_off_picture") {
        console.log('开始对讲')
        event.target.className = "talkback_on_picture"
        this.$api.play_mac.push_talk({
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          protocol: 'rtdp',
          token: 'p1'
        }).then(res => {
          console.log(res, 'talk_res')
          // 获取对讲地址链接 并传递给客户端
          window.pywebview.api.startGetVoice(res.url)
        })
      } else {
        event.target.className = "talkback_off_picture"
        console.log('结束对讲')
        window.pywebview.api.endGetVoice()
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

      this.mode = this.cam_conf.day_night;
    },
    clickAdjust (event) { // 点击设备调整按钮
      if (event.target.className === "adjust_off_picture") {
        event.target.className = "adjust_on_picture"
        this.$api.play_mac.adjust_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
          this.cam_conf = res
          this.cam_conf.sn = this.$store.state.jumpPageData.selectDeviceIpc
          this.adjust_show()
          if (this.whiteLight) {
            this.light_mode = this.cam_conf.light_mode
          }
        })
        this.adjustSettingFlag = true
      } else {
        event.target.className = "adjust_off_picture"
        this.adjustSettingFlag = false
      }
    },
    clickAdjustClose () { // 点击关闭设置弹窗
      this.adjustSettingFlag = false
    },
    turnCamera (action, direction) { // 摄像头转向方法调用
      this.$api.play_mac.play_ptz_turn({ // 摄像头转向控制
        flag: action,
        direction: direction
      })
    },
    clickPlayView () { // 点击视频播放区域
      let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0"
      this.playFlag = 1
      if (this.$store.state.jumpPageData.localFlag) { // 本地接口暂缓
        this.local_play_data.profile_token = profile_token
        this.local_play_data.sn = this.$store.state.jumpPageData.selectDeviceIpc
        // this.$api.local.local_device_play({ data: this.local_play_data })
        this.$api.local.local_play({ data: this.local_play_data })
      } else {
        this.$api.play_mac.play({
          dom: $("#play_screen"),
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          profile_token: profile_token
        }).then(res => {
          this.play_speed(res)
        })
      }
      $("#video_play").attr("class", "video_play_start");
      this.cameraControlDivFlag = true
    },
    clickBack () { // 点击返回
      let obj = this.vimtagPlayObj
      if (obj.box_ipc == 1) { //云盒子设备播放
        // createPage("boxlist", obj)//创建云盒子页面
        this.$router.push({ name: 'boxlist', params: obj })
      } else { //否则就是普通ipc
        // createPage("devlist", obj)//创建设备列表页面
        this.$router.push({ name: 'devlist', params: obj })
      }
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
      this.mode = "auto";
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
        if (res.day === nowDate.getDate() && res.hour === nowDate.getHours() || this.$store.state.jumpPageData.localFlag) { //本地模式下不显示提示
          this.timezone_err_sign = false
        } else {
          this.timezone_err_sign = true
        }
      })
    },
    clickAlarm () { //点击报警
      if (this.alarm_sign) {
        this.$api.play_mac.alarm({ // 手动关闭报警
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          cmd: 'stop'
        })
        this.alarm_sign = false
      } else {
        this.publicFunc.delete_tips({
          content: mrs_alarm_tip_msg,
          title: mrs_manual_alarm,
          func: () => {
            this.$api.play_mac.alarm({ // 手动开启报警
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              cmd: 'play'
            })
            this.alarm_sign = true
            setTimeout(() => { //60s后自动关闭报警
              this.$api.play_mac.alarm({
                sn: this.$store.state.jumpPageData.selectDeviceIpc,
                cmd: 'stop'
              })
              this.alarm_sign = false
            }, 60000)
          }
        })
      }
    },
    startVoice () { // 开始对讲
      console.log('点击开始对讲')
      this.$api.play_mac.push_talk({
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        protocol: 'rtdp',
        token: 'p1'
      }).then(res => {
        console.log(res, 'talk_res')
        // 获取对讲地址链接 并传递给客户端
        window.pywebview.api.startGetVoice(res.url)
      })
    },
    endVoice () { // 结束对讲
      console.log('点击结束对讲')
      window.pywebview.api.endGetVoice()
    },

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
      if (this.renderer === null) {
        return
      }

      const width = video.width
      const height = video.height
      this.renderer.renderImg(width, height, buff)
    },

    initialCanvas (canvas, width, height) {
      canvas.width = width
      canvas.height = height
      canvas.style.width = this.playViewWidth + 'px'
      canvas.style.height = (this.playViewHeight - 44) + 'px'
      return new WebglScreen(canvas)
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    console.log(this.$store.state.jumpPageData.deviceData, 'data')
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
    // 接入pywebview数据传输接口 接收base64图片内容
    console.log(this.clientFlag, '查看客户端标识')
    // 定义本地搜索数据
    window.setLocalDeviceInfo = (data) =>{
      let default_InvalidAuth_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATAAAACrBAMAAAATA930AAAAIVBMVEXZ2dny8vLf39/c3Nzv7+/o6Ojk5OTq6urs7Ozm5ubh4eEqh4/4AAACCUlEQVR42u3dPWsUURSH8WUWU9hdiJuUFxWVVIPr+rLdSjSmlDWoXaIiahdNYxnfiHVe6yzkcyY5DMnOGTIQCPwP5HmqvcMWPw4zt7gMTGehH7LDzuPbIfvYedgJ2R1gwOoBkwcMmAuYPGDAXMDkAQPmAiYPGDAXMHnAgLmAyQMGzAVMHjBgLmDyrhC28HVlZe8wHKzY/5NOevUzx4IN36SqF5NIsOFGOmtpEgfW3UlTLZdhYPdTre9RYMV6HTaXg8AeJNevGDAbmBtZCNig4ixubS1WP8chYJ+S9fdDv3/vXbJ6EWDFyCz/sy0ObDGbA8AGRrmVK+ZrW24HgN2tS57Z8rke1l2zgZVnaxtZr9TDNm3ncrvavB52c3R6s6+eX5ixC1kOm7EdtZwaoe23q3KYPZQvG/vaWA57Yg9h4zH9IYc9PWX8bl6Rw6r5NGYYAzau3XUxYI+iwpgYE2Ni0WDNid2IACuO7HTg3+epvtg5wbesgvlDC99yKYQNUktjIWytDdbTwbrrbbC5UgYrNttg81kHG7XBZoEBAwYMGDBgwIABAwYMGDBg1wMW9lCl234MpYP5t438u0c6WLFxsWspi2DWcPftBb2fVH+RvzxZFe3lSWCXDJg8YMBcwOQBA+YCJg8YMBcwecCAuYDJAwbMBUweMGAuYPKAAXMBkxcYFvY7I1G/zHIMMIc+sbj4o2sAAAAASUVORK5CYII=";
      console.log(data, '本地搜索返回的数据')
      let local_devs_data = data
      console.log(local_devs_data, '转换后的对象')
      // 判断传递过来的本地设备数据是否为重复内容
      for(let i = 0; i < this.is_exist_ipc.length; i++){
        if (this.is_exist_ipc[i] == local_devs_data.sn){
          return
        }
      }
      this.is_exist_ipc.push(local_devs_data.sn)
      let tmp_local_dev_password = sessionStorage.getItem("pass_" + local_devs_data.sn)
      let tmp_local_devs_data = {
        sn: local_devs_data.sn,
        type: local_devs_data.type,
        def_img: tmp_local_dev_password ? "" : default_InvalidAuth_img,
        nick: (local_devs_data.ProbeMatch[0].Nick ? local_devs_data.ProbeMatch[0].Nick : local_devs_data.sn),
        addr: local_devs_data.ProbeMatch[0].XAddrs,
        stat: tmp_local_dev_password ? "Online" : "InvalidAuth"
      }
      this.local_device_list.push(tmp_local_devs_data)
      console.log(this.local_device_list, 'local_device_list')
      this.device_list(this.local_device_list, { parent: this.publicFunc.mx("#device_list_sidebar_center") })
    }
    // 页面大小改变
    window.onresize = () => {
      return (() => {
        console.log('play enter onresize')
        this.vimtagPlay(pageData)
        this.canvasInitFlag = false
      })()
    }
    // 进入播放页面时优先调用创建播放引擎方法
    window.pywebview.api.createPlayerEngine()
    await this.vimtagPlay(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
  },
  beforeRouteLeave(to, from, next) {
    console.log('enter beforeRouteLeave')
    // 销毁当前组件实例
    this.$destroy()
    next()
  },
  destroyed () {
    // 销毁页面时注销播放
    if(this.clientFlag) {
      window.pywebview.api.leavePlayPage()
    }
  },
  watch: {
    sharpness_value (val) {
      if (val || val == 0) {
        this.$refs.sharpness.style.backgroundSize = val + '% 100%';
      }
    },
    contrast_value (val) {
      if (val || val == 0) {
        this.$refs.contrast.style.backgroundSize = val + '% 100%';
      }
    },
    color_saturation_value (val) {
      if (val || val == 0) {
        this.$refs.color_saturation.style.backgroundSize = val + '% 100%';
      }
    },
    brightness_value (val) {
      if (val || val == 0) {
        this.$refs.brightness.style.backgroundSize = val + '% 100%';
      }
    },
    mode (val) {
      if (val) {
        this.cam_conf.day_night = val;
        this.adjust_show();
      }
    },
    light_mode (val) {
      if (val) {
        this.cam_conf.light_mode = val;
      }
    },
    cam_conf: {
      handler (val) {
        if (val) {
          this.$api.play_mac.adjust_set({ conf: this.cam_conf });
        }
      },
      deep: true
    },
    "$store.state.jumpPageData.clientP2Ping" (val) {
      if (val) {
        this.clientP2PingValue = val
        // console.log(val, 'p2pingvalue')
      }
    },
    alarm_sign (val) {
      let timer = null;
      if (val) {
        this.alarm_countdown_code = 60;
        timer = setInterval(() => {
          this.alarm_countdown_code--;
          if (this.alarm_countdown_code <= 0 || this.alarm_sign === false) {
            clearInterval(timer)
          }
        }, 1000)
      }
    },
    // 监听图片内容改变
    "$store.state.jumpPageData.pywebviewImgData" (val) {
      if (val) {
        const canvas = this.$refs.video
        let canvasDrawWidth = this.$store.state.jumpPageData.pywebviewImgWidth
        let canvasDrawHeight = this.$store.state.jumpPageData.pywebviewImgHeight
        this.publicFunc.closeBufferPage()
        // 初次进入页面获取到视频数据后对canvas进行初始化 or 传入的视频数据宽度与高度发生改变时重新绘制canvas
        if (!this.canvasInitFlag || this.nowCanvasHeight !== canvasDrawHeight || this.nowCanvasWidth !== canvasDrawWidth) {
          this.renderer = this.initialCanvas(canvas, canvasDrawWidth, canvasDrawHeight)
          this.nowCanvasHeight = canvasDrawHeight
          this.nowCanvasWidth = canvasDrawWidth
          this.canvasInitFlag = true
        }
        let binaryData = atob(val)
        let yuvData = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          yuvData[i] = binaryData.charCodeAt(i)
        }
        this.queue.push(yuvData)
        // console.log(pushData, '放入queue中的内容')
        // this.queue.push(pushData)
        if (!this.scheduled) {
          this.schedule()
          this.scheduled = true
        }
      }
    },
  }
}
</script>