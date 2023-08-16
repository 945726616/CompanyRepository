<template>
  <div id='playback'>
    <div id='playback_box'>
      <div id='page_top_menu' v-if='!project_flag'>
        <div id='back' @click="back_btn">
          <div id='main_title_box_return_img'></div> {{mcs_back}}
        </div>
      </div>
      <div id='playback_view'>
        <div id='playback_buffer_ret'></div>
        <div id='playback_screen'>
          <div id='download_progress'></div>
          <div id='download_stop'>{{mcs_stop}}</div>
          <div id='download_pause'>{{mcs_pause}}</div>
        </div>
      </div>
      <div id='playback_menu_box'>
        <div id='play_menu_left'>
          <div id='video_play' class='video_play_start' @click='video_play_btn'></div>
          <div id='playback_start_time' style='display:none'> {{playback_start_time ?playback_start_time :start_time}} </div>
        </div>
        <div id='playback_progress_bar'>
          <input name='slider' type='text' id='playback_progressbar' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%' />
        </div>
        <div id='play_menu_right' v-show='fujikam_sign'>
          <div id='playback_download_img' :style='fujikam_sign?"background-size:100% 100%":""' @click='download_page_sign = true'></div>
          <div id='playback_voice_close' class='voice_close_open' style='display:none;'></div>
          <div id='playback_end_time' style='display:none'> {{end_time}} </div>
        </div>
      </div>
      <div id='playback_download_path_box' v-show="download_page_sign">
        <div id='playback_download_path_main'> {{mcs_input_download_path}} <input id='playback_download_path_input' value='' type='text' v-model="download_path_value"></div>
        <div id='playback_download_path_cancel' @click="download_page_sign = false"> {{mcs_cancel}} </div>
        <div id='playback_download_path_submit' @click="download_path_submit"> {{mcs_ok}} </div>
      </div>
    </div>
  </div>
</template>

<script>
import '@/lib/plugins/slider.js'
import fdSliderController from '../../util/fdSliderController'
import languageSelect from '../../lib/exportModule/languageSelect.js'
export default {
  data () {
    return {
      //多国语言
      mcs_back: mcs_back,
      mcs_input_download_path: mcs_input_download_path,
      mcs_cancel: mcs_cancel,
      mcs_ok: mcs_ok,
      mcs_stop: mcs_stop,
      mcs_pause: mcs_pause,
      // 多国语言 结束
      project_flag: 0, // 判断是否为vimtag
      playback_params: {}, //接受传过来的数据
      download_path_value: '', //下载路径
      videoSize: 0, //时长
      start_time: 0, //开始时间
      end_time: 0, //结束时间
      fujikam_sign: false, //是否为客户端
      first: sessionStorage.getItem('play_first') ? sessionStorage.getItem('play_first') : false,
      bo_type: sessionStorage.getItem('bo_type') ? sessionStorage.getItem('bo_type') : false,
      play_back_token: '',
      playback_start_time: '', //进度条时间
      is_playing: 0,
      download_page_sign: false, //是否显示下载页
    }
  },
  async mounted () {
    let _this = this;
    await _this.$chooseLanguage.lang(_this.$store.state.user.userLanguage)

    _this.project_flag = _this.$store.state.jumpPageData.projectFlag;
    _this.playback_params = _this.$route.params;
    _this.download_path_value = (navigator.platform.indexOf("Win") > -1 ? ('c:/downloads/') : ('/Users/Shared/'));

    let l_dom_playback_screen = _this.publicFunc.mx("#playback_screen");
    let l_dom_playback_menu_box = _this.publicFunc.mx("#playback_menu_box");
    let l_dom_playback_download_path_box = _this.publicFunc.mx("#playback_download_path_box");
    let l_height = _this.publicFunc.mx("#top").offsetWidth * 0.4 + 11;
    let l_download_path_box_top = _this.publicFunc.mx("#playback_box").offsetTop + 200;
    let l_download_path_box_left = _this.publicFunc.mx("#playback_box").offsetLeft + 430;
    let l_playback_menu_box_height = l_dom_playback_menu_box.offsetHeight - 1;
    l_dom_playback_screen.style.height = (l_height - l_playback_menu_box_height) + "px";
    l_dom_playback_download_path_box.style.top = l_download_path_box_top + "px";
    l_dom_playback_download_path_box.style.left = l_download_path_box_left + "px";
    _this.publicFunc.mx("#playback_view").style.height = l_height + "px";
    _this.publicFunc.mx("#playback_buffer_ret").style.left = (l_dom_playback_screen.offsetLeft + l_dom_playback_screen.offsetWidth - 50) + "px";

    _this.playback_params.start_time = parseInt(_this.playback_params.start_time);
    _this.playback_params.end_time = parseInt(_this.playback_params.end_time);
    _this.videoSize = _this.playback_params.end_time - _this.playback_params.start_time;
    _this.start_time = new Date(_this.playback_params.start_time).format("hh:mm:ss")
    _this.end_time = new Date(_this.playback_params.end_time).format("hh:mm:ss");

    if (_this.$store.state.jumpPageData.localFlag) {
      $("#playback_download_img").hide();
    }
    if (window.fujikam == "fujikam") { // 浏览器不显示进度条和下载功能
      _this.fujikam_sign = true;
      // $("#playback_progress_bar").show();
      // $("#playback_start_time").show();
      // $("#playback_end_time").show();
    }
    let l_width = _this.publicFunc.mx("#play_menu_left").offsetWidth;
    let r_width = _this.publicFunc.mx("#play_menu_right").offsetWidth;
    // let r_width = parseInt($("#play_menu_right").css("width"));
    let box_width = _this.publicFunc.mx("#playback_menu_box").offsetWidth;
    _this.publicFunc.mx("#playback_progress_bar").style.width = (box_width - l_width - r_width - 30) + "px"
    fdSliderController.create()

    let vedio_flag_arr = []; //移动侦测标记集合
    if (_this.playback_params.data) {
      for (let j = 0; j < _this.playback_params.data.length; j++) {
        vedio_flag_arr.push(_this.playback_params.data[j].f)
      }
      let process_flag_dom = document.createElement("span")
      process_flag_dom.setAttribute("class", "fd_slider_flag")
      document.getElementById("fd-slider-playback_progressbar").appendChild(process_flag_dom)
      for (let i = 0; i < vedio_flag_arr.length; i++) {
        if (vedio_flag_arr[i] != "0") {
          let process_flag = document.createElement("span")
          process_flag.setAttribute("class", "flag_item")
          process_flag.style.width = (1 / vedio_flag_arr.length * 100 + "%")
          process_flag_dom.appendChild(process_flag)
        } else {
          let process_flag = document.createElement("span")
          process_flag.setAttribute("class", "no_flag_item")
          process_flag.style.width = (1 / vedio_flag_arr.length * 100 + "%")
          process_flag_dom.appendChild(process_flag);
        }
      }
      fdSliderController.addEvent(_this.publicFunc.mx("#playback_progress_bar"), "mouseup", playback_event_mouseup) // 监听鼠标点击事件
      function playback_event_mouseup () {
        _this.first = true
        sessionStorage.setItem('play_first', true)
        let play_progress = _this.publicFunc.mx("#playback_progressbar").value / 100
        let data_length = _this.playback_params.data.length
        let new_token = parseInt(data_length * play_progress)
        _this.play_back_token = _this.playback_params.data[new_token].token
        let l_video_time = _this.playback_params.end_time - _this.playback_params.start_time
        let play_progress_time_stamp = _this.playback_params.start_time + (l_video_time * play_progress)
        sessionStorage.setItem("play_progress_time_stamp", play_progress_time_stamp)
        _this.play_progress_time = new Date(play_progress_time_stamp).format("hh:mm:ss")

        if (_this.is_playing) {
          _this.$api.play.video_stop({
            dom: $("#playback_screen")
          }).then(() => { // 原函数中是存在返回值调用至函数的情况
            _this.$api.playback.play({ // 原playback接口
              agent: _this.playback_params.agent,
              dom: $("#playback_screen"),
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              videoSize: _this.videoSize,
              token: _this.play_back_token,
              playback: 1 // 此处额外添加参数
            }).then(res => {
              console.log(res, 'playBack_playSpeed')
              // _this.playback_speed(res[0], res[1], res[2])
            })
          })
        }
      }
    }
  },
  methods: {
    back_btn () { //返回
      if (this.playback_params.box_ipc == 1) { //如果从云盒子实时播放进来回放播放
        let jumpData = { dev_sn: this.playback_params.dev_sn, back_page: this.playback_params.back_page, agent: this.playback_params.agent, addr: this.playback_params.addr, a_start: this.playback_params.a_start, b_end: this.playback_params.b_end, box_ipc: 1, ipc_sn: this.playback_params.ipc_sn, box_sn: this.playback_params.box_sn, box_live: 1, backplay_flag: 4, ipc_stat: this.playback_params.ipc_stat };
        this.$router.push({ name: 'history', params: jumpData });
      } else {
        let jumpData = { dev_sn: this.playback_params.dev_sn, back_page: this.playback_params.back_page, agent: this.playback_params.agent, addr: this.playback_params.addr, a_start: this.playback_params.a_start, b_end: this.playback_params.b_end, backplay_flag: 4 };
        this.$router.push({ name: 'history', params: jumpData });
      }
    },
    video_play_btn () { //视频播放
      if (window.fujikam == "fujikam") { // 客户端播放方法
        if (this.is_playing) { // 当前播放状态 1 为播放中 0 为未播放
          this.is_playing = 0
          $("#video_play").attr("class", "video_play_stop")
          this.$api.play.video_stop({
            dom: $("#playback_screen")
          }).then(res => {
            create_preview(res)
          })
        } else {
          this.is_playing = 1
          if (!this.first) {
            sessionStorage.setItem('bo_type', true)
            this.bo_type = true
            $("#playback_start_time").html(start_time)
            this.$api.playback.play({ // 原playback接口
              agent: this.playback_params.agent,
              dom: $("#playback_screen"),
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              videoSize: this.videoSize,
              token: this.playback_params.token,
              playback: 1 // 此处额外添加参数
            }).then(res => {
              playback_speed(res[0], res[1], res[2])
            })
          } else {
            // console.log('运行至此处')
            this.$api.playback.play({ // 原playback接口
              agent: this.playback_params.agent,
              dom: $("#playback_screen"),
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              videoSize: this.videoSize,
              token: this.play_back_token,
              playback: 1 // 此处额外添加参数
            }).then(res => {
              playback_speed(res[0], res[1], res[2])
            })
          }
          $("#video_play").attr("class", "video_play_start");
        }
      }
    },
    download_path_submit () { //下载录像
      this.download_page_sign = false;

    },
    playback_speed (data, progress, record_played_duration) {
      let progress2 = sessionStorage.getItem("aaa")
      sessionStorage.setItem("aaa", progress);
      if (this.bo_type) {
        start_time = b_start_time;
        sessionStorage.setItem('bo_type', false)
        this.bo_type = false;
      } else {
        start_time = start_time + record_played_duration;
      }
      let play_start_time_stop = new Date(start_time).format("yyyy-MM-dd hh:mm:ss")
      let play_start_time = new Date(start_time).format("hh:mm:ss")
      $("#playback_start_time").html(play_start_time);
      let play_end_time_stop = new Date(end_time).format("yyyy-MM-dd hh:mm:ss")
      let play_end_time = new Date(end_time).format("hh:mm:ss")
      if (play_start_time_stop >= play_end_time_stop) {
        $("#playback_start_time").html(play_end_time)
        _this.$api.play.video_stop({
          dom: $("#playback_screen")
        }).then(res => {
          create_preview(res)
        })
        // msdk_ctrl({ type: "play_video_stop", data: { dom: l_dom_playback_screen, func: create_preview } });
      }
      if (first) {
        progress = Number(progress) - Number(progress2) + Number(_this.publicFunc.mx("#playback_progressbar").value);
        let play_progress_time_stamp = sessionStorage.getItem("play_progress_time_stamp");
        let get_drag_duration = sessionStorage.getItem("duration");
        let drag_start_time = parseInt(play_progress_time_stamp) + parseInt(get_drag_duration);
        let play_start_time = new Date(drag_start_time).format("hh:mm:ss")
        let play_start_time_stop = new Date(drag_start_time).format("yyyy-MM-dd hh:mm:ss")
        $("#playback_start_time").html(play_start_time);
        let play_end_time = new Date(end_time).format("hh:mm:ss");
        let play_end_time_stop = new Date(end_time).format("yyyy-MM-dd hh:mm:ss");
        if (play_start_time_stop >= play_end_time_stop) {
          $("#playback_start_time").html(play_end_time);
          _this.$api.play.video_stop({
            dom: $("#playback_screen")
          }).then(res => {
            create_preview(res)
          })
        }
      }
      if (!data) data = null
      _this.publicFunc.mx("#playback_buffer_ret").innerHTML = data;
      fdSliderController.increment("playback_progressbar", progress - _this.publicFunc.mx("#playback_progressbar").value);
    },
    create_preview (data) {
      sessionStorage.setItem("pause_start_time", start_time)
      data.parent.html(
        "<div id='play_view_box'>" +
        "<div id='play_pause_pic'></div>" +
        "</div>")
      let pic_token = obj.pic_token.replace("_p3_", "_p0_");
      _this.$api.play.play_preview_img({
        dom: $("#playback_screen"),
        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
        pic_token: pic_token
      })
      // msdk_ctrl({ type: "play_preview_img", data: { dom: l_dom_playback_screen, sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: pic_token } });
      let l_dom_play_view_box = _this.publicFunc.mx("#play_view_box");
      l_dom_play_view_box.onclick = function () {
        let pic_token = [];
        for (let i = 0; i < obj.data.length; i++) {
          pic_token.push(obj.data[i].pic_token)
        }
        is_playing = 1;
        if (!first) {
          sessionStorage.setItem('bo_type', true)
          bo_type = true;
          let bof_start_time = new Date(b_start_time).format("hh:mm:ss");
          $("#playback_start_time").html(bof_start_time);
          _this.$api.playback.play({ // 原playback接口
            agent: obj.agent,
            dom: $("#playback_screen"),
            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            videoSize: videoSize,
            token: obj.token,
            playback: 1 // 此处额外添加参数
          }).then(res => {
            playback_speed(res)
          })
        } else {
          _this.$api.playback.play({ // 原playback接口
            agent: obj.agent,
            dom: $("#playback_screen"),
            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            videoSize: videoSize,
            token: play_back_token,
            playback: 1 // 此处额外添加参数
          }).then(res => {
            playback_speed(res[0], res[1], res[2])
          })
        }
        $("#video_play").attr("class", "video_play_start");
      }
    }
  }
}
</script>

<style lang='scss'>
</style>