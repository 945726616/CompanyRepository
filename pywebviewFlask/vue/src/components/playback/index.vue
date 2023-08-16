<template>
  <div id="playback"></div>
</template>
<script>
import fdSliderController from '../../util/fdSliderController'
import languageSelect from '../../lib/exportModule/languageSelect.js'
export default {
  methods: {
    create_playback_page (obj) {
      let _this = this
      let videoSize = 0;
      let first = sessionStorage.getItem('play_first') ? sessionStorage.getItem('play_first') :false;
      let bo_type = sessionStorage.getItem('bo_type') ? sessionStorage.getItem('bo_type') : false;
      let play_back_token;
      let play_progress;
      let b_start_time;
      let l_dom_video_play,
        is_playing = 0;
      let vedio_flag_arr = [];//移动侦测标记集合

      if (_this.$store.state.jumpPageData.projectFlag){
        obj.parent[0].innerHTML =
        "<div id='playback_box'>"
        + "<div id='playback_view'>"
        + "<div id='playback_buffer_ret'></div>"
        + "<div id='playback_screen'></div>"
        + "<div id='playback_menu_box'></div>"
        + "<div id='playback_download_path_box'>"
        + "<div id='playback_download_path_main'>" + mcs_input_download_path + "<input id='playback_download_path_input' value='' type='text'></div>"
        + "<div id='playback_download_path_cancel'>" + mcs_cancel + "</div>"
        + "<div id='playback_download_path_submit'>" + mcs_ok + "</div>"
        + "</div>"
        + "</div>"
        + "</div>"
      }else{
        obj.parent[0].innerHTML = 
        "<div id='playback_box'>"
        + "<div id='page_top_menu'>"
        + "<div id='back'><div id='main_title_box_return_img'></div>" + mcs_back + "</div>"
        + "</div>"
        + "<div id='playback_view'>"
        + "<div id='playback_buffer_ret'></div>"
        + "<div id='playback_screen'></div>"
        + "<div id='playback_menu_box'></div>"
        + "<div id='playback_download_path_box'>"
        + "<div id='playback_download_path_main'>" + mcs_input_download_path + "<input id='playback_download_path_input' value='' type='text'></div>"
        + "<div id='playback_download_path_cancel'>" + mcs_cancel + "</div>"
        + "<div id='playback_download_path_submit'>" + mcs_ok + "</div>"
        + "</div>"
        + "</div>"
        + "</div>"
      }
      if(obj.data){
      for (let j = 0; j < obj.data.length; j++) {
        vedio_flag_arr.push(obj.data[j].f)
      }
      }
      if(_this.publicFunc.mx("#playback_download_path_input"))
      _this.publicFunc.mx("#playback_download_path_input").value = (navigator.platform.indexOf("Win") > -1 ? ('c:/downloads/') : ('/Users/Shared/'));
      let l_dom_playback_view = _this.publicFunc.mx("#playback_view");
      let l_dom_playback_screen = _this.publicFunc.mx("#playback_screen");
      let l_dom_playback_menu_box = _this.publicFunc.mx("#playback_menu_box");
      let l_dom_playback_download_path_box = _this.publicFunc.mx("#playback_download_path_box");
      let l_height = _this.publicFunc.mx("#top").offsetWidth * 0.4 + 11;
      let l_download_path_box_top = _this.publicFunc.mx("#playback_box").offsetTop + 200;
      let l_download_path_box_left = _this.publicFunc.mx("#playback_box").offsetLeft + 430;
      let l_playback_menu_box_height = l_dom_playback_menu_box.offsetHeight - 1;
      l_dom_playback_view.style.height = l_height + "px";
      l_dom_playback_screen.style.height = (l_height - l_playback_menu_box_height) + "px";
      l_dom_playback_download_path_box.style.top = l_download_path_box_top + "px";
      l_dom_playback_download_path_box.style.left = l_download_path_box_left + "px";
      _this.publicFunc.mx("#playback_buffer_ret").style.left = (l_dom_playback_screen.offsetLeft + l_dom_playback_screen.offsetWidth - 50) + "px";
      play_menu_control({ parent: l_dom_playback_menu_box });
      create_preview({ parent: $("#playback_screen") });
      function play_menu_control (data) {
        obj.start_time = parseInt(obj.start_time);
        obj.end_time = parseInt(obj.end_time);
        videoSize = obj.end_time - obj.start_time;
        let start_time = new Date(obj.start_time).format("hh:mm:ss")
        let end_time = new Date(obj.end_time).format("hh:mm:ss");
        let data_length = obj.data.length;
        let l_video_start_time_stamp = obj.start_time;
        let l_video_end_time_stamp = obj.end_time;
        let l_video_time = l_video_end_time_stamp - l_video_start_time_stamp;
        // let l_video_token = parseInt(obj.token.substring(obj.token.lastIndexOf("_") + 1));
        // let l_video_token_header = obj.token.substring(0, obj.token.lastIndexOf("_") + 1);
        data.parent.innerHTML =
          "<div id='play_menu_left'>"
          + "<div id='video_play' class='video_play_start'></div>"
          + "<div id='playback_start_time' style='display:none'>" + start_time + "</div>"
          + "</div>"
          + "<div id='playback_progress_bar' style='display:none'>"
          + "<input name='slider' type='text' id='playback_progressbar' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
          + "</div>"
          + "<div id='play_menu_right' style='display:none'>"
          + "<div id='playback_download_img'></div>"
          + "<div id='playback_voice_close' class='voice_close_open' style='display:none;'></div>"
          + "<div id='playback_end_time' style='display:none'>" + end_time + "</div>"
          + "</div>";
        if (_this.$store.state.jumpPageData.localFlag) {
          $("#playback_download_img").hide();
        }
        if (window.fujikam == "fujikam") { // 浏览器不显示进度条和下载功能
          $("#playback_download_img").css("background-size", "100% 100%");
          // $("#playback_progress_bar").show();
          // $("#playback_start_time").show();
          // $("#playback_end_time").show();
          $("#play_menu_right").show();
        }
        l_dom_video_play = _this.publicFunc.mx("#video_play");
        let l_width = _this.publicFunc.mx("#play_menu_left").offsetWidth;
        let r_width = _this.publicFunc.mx("#play_menu_right").offsetWidth;
        // let r_width = parseInt($("#play_menu_right").css("width"));
        let box_width = _this.publicFunc.mx("#playback_menu_box").offsetWidth;
        _this.publicFunc.mx("#playback_progress_bar").style.width = (box_width - l_width - r_width - 30) + "px";
        fdSliderController.create();
        function create_flag_item (msg) {
          for (let i = 0; i < msg.length; i++) {
            if (msg[i] != "0") {
              let process_flag = document.createElement("span");
              process_flag.setAttribute("class", "flag_item");
              process_flag.style.width = (1 / msg.length * 100 + "%");
              process_flag_dom.appendChild(process_flag);
            } else {
              let process_flag = document.createElement("span");
              process_flag.setAttribute("class", "no_flag_item");
              process_flag.style.width = (1 / msg.length * 100 + "%");
              process_flag_dom.appendChild(process_flag);
            }
          }
        }
        let process_flag_dom = document.createElement("span");
        process_flag_dom.setAttribute("class", "fd_slider_flag");
        document.getElementById("fd-slider-playback_progressbar").appendChild(process_flag_dom);
        create_flag_item(vedio_flag_arr);
        fdSliderController.addEvent(_this.publicFunc.mx("#playback_progress_bar"), "mouseup", playback_event_mouseup); // 监听鼠标点击事件
        function playback_event_mouseup () {
          // console.log('play_back_event_mouseup')
          first = true;
          sessionStorage.setItem('play_first', true)
          play_progress = _this.publicFunc.mx("#playback_progressbar").value / 100;
          let new_token = parseInt(data_length * play_progress);
          play_back_token = obj.data[new_token].token;
          let play_progress_time_stamp = l_video_start_time_stamp + (l_video_time * play_progress);
          let play_progress_time = new Date(play_progress_time_stamp).format("hh:mm:ss");
          sessionStorage.setItem("play_progress_time_stamp", play_progress_time_stamp)
          //拖动时显示对应的时间
          $("#playback_start_time").html(play_progress_time);
          // moveProgressBar
          if (is_playing) {
            _this.$api.play.video_stop({
              dom: $("#playback_screen")
            }).then(() => { // 原函数中是存在返回值调用至函数的情况
              _this.$api.playback.play({ // 原playback接口
                agent: obj.agent,
                dom: $("#playback_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                videoSize: videoSize,
                token: play_back_token,
                playback: 1 // 此处额外添加参数
              }).then(res => {
                console.log(res, 'playBack_playSpeed')
                playback_speed(res[0], res[1], res[2])
              })
            })
          }
        }
        if (window.fujikam == "fujikam") { // 客户端播放方法
          l_dom_video_play.onclick = function () {
            // console.log('进入执行', is_playing)
            if (is_playing) { // 当前播放状态 1 为播放中 0 为未播放
              is_playing = 0;
              $("#video_play").attr("class", "video_play_stop");
              _this.$api.play.video_stop({
                dom: $("#playback_screen")
              }).then(res => {
                create_preview(res)
              })
            } else {
              is_playing = 1;
              if (!first) {
                sessionStorage.setItem('bo_type', true)
                bo_type = true;
                $("#playback_start_time").html(start_time)
                _this.$api.playback.play({ // 原playback接口
                  agent: obj.agent,
                  dom: $("#playback_screen"),
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  videoSize: videoSize,
                  token: obj.token,
                  playback: 1 // 此处额外添加参数
                }).then(res => {
                  playback_speed(res[0], res[1], res[2])
                })
              } else {
                // console.log('运行至此处')
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

        _this.publicFunc.mx("#playback_download_img").onclick = function () {
          $("#playback_download_path_box").show();
        }
        _this.publicFunc.mx("#playback_download_path_cancel").onclick = function () {
          $("#playback_download_path_box").hide();
        }
        if (!_this.$store.state.jumpPageData.projectFlag) {
          _this.publicFunc.mx("#back").onclick = function () {
            // create_history_page({parent:obj.parent,dev_sn:obj.dev_sn,back_page:obj.back_page,agent:obj.agent,addr:obj.addr})
            if (obj.box_ipc == 1) { //如果从云盒子实时播放进来回放播放
              let jumpData = {parent: obj.parent, dev_sn: obj.dev_sn, back_page: obj.back_page, agent: obj.agent, addr: obj.addr, a_start: obj.a_start, b_end: obj.b_end, box_ipc: 1, ipc_sn: obj.ipc_sn, box_sn: obj.box_sn, box_live: 1, backplay_flag: 4, ipc_stat: obj.ipc_stat};
              // createPage("history", { parent: obj.parent, dev_sn: obj.dev_sn, back_page: obj.back_page, agent: obj.agent, addr: obj.addr, a_start: obj.a_start, b_end: obj.b_end, box_ipc: 1, ipc_sn: obj.ipc_sn, box_sn: obj.box_sn, box_live: 1, backplay_flag: 4, ipc_stat: obj.ipc_stat })
              _this.$router.push({name:'history',params:jumpData});
              // sessionStorage.clear();
            } else {
              let jumpData = {parent: obj.parent, dev_sn: obj.dev_sn, back_page: obj.back_page, agent: obj.agent, addr: obj.addr, a_start: obj.a_start, b_end: obj.b_end, backplay_flag: 4};
              // createPage("history", { parent: obj.parent, dev_sn: obj.dev_sn, back_page: obj.back_page, agent: obj.agent, addr: obj.addr, a_start: obj.a_start, b_end: obj.b_end, backplay_flag: 4 })
              _this.$router.push({name:'history',params:jumpData});
              // sessionStorage.clear();
            }
          }
        } 
        _this.publicFunc.mx("#playback_download_path_submit").onclick = function () { // 下载部分函数
          let download_path = _this.publicFunc.mx("#playback_download_path_input").value; //下载路径
          $("#playback_download_path_box").hide();
          _this.publicFunc.mx("#playback_screen").style.background = "#000";
          _this.publicFunc.mx("#playback_screen").innerHTML = "<div id='download_info_box'>"
            + "<div id='download_progress'></div>"
            + "<div id='download_stop'>" + mcs_stop + "</div>"
            + "<div id='download_pause'>" + mcs_pause + "</div>"
            + "</div>";
          _this.publicFunc.mx("#download_pause").onclick = function () {
            if (_this.publicFunc.mx("#download_pause").innerHTML == mcs_pause) {
              _this.$api.playback.pause_ipc().then($("#download_pause").html(mcs_continue))
            } else {
              _this.$api.playback.play_download_continue().then($("#download_pause").html(mcs_pause))
            }
          }
          _this.publicFunc.mx("#download_stop").onclick = function () {
            _this.$api.playback.video_stop({
              dom: $("#playback_screen"),
              isDownload: 1 // 是否下载中特殊标记
            }).then(res => {
              create_preview(res)
            })
            // msdk_ctrl({ type: "play_download_stop", data: { dom: l_dom_playback_screen, func: create_preview } })
          }
          if (_this.$store.state.jumpPageData.projectName === "vimtag") {
            _this.$api.playback.replay_download({ // 原play_back_download接口
              agent: obj.agent,
              dom: $("#playback_screen"),
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              videoSize: videoSize,
              token: obj.download_token,
              download_path: download_path,
              playback: 1, // 此处额外添加参数
              isDownload: 1 // 此处额外添加参数
            })
          } else {
            _this.$api.playback.replay_download({ // 原play_back_download接口
              agent: obj.agent,
              dom: $("#playback_screen"),
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              videoSize: videoSize,
              token: obj.token,
              download_path: download_path,
              playback: 1, // 此处额外添加参数
              isDownload: 1 // 此处额外添加参数
            })
          }
        }
      }
      function download_info (data) {
        // console.log(data, 'download_info_data')
        let data_num = data.substring(0, data.length - 1);
        if (_this.publicFunc.mx("#download_progress")) {
          _this.publicFunc.mx("#download_progress").innerHTML = data;
        }
        if (data_num == 100) {
          // create_preview({parent:l_dom_playback_screen});
          _this.$api.playback.video_stop({
              dom: $("#playback_screen"),
              isDownload: 1 // 是否下载中特殊标记
            }).then(res => {
              create_preview(res)
            })
          // msdk_ctrl({ type: "play_download_stop", data: { dom: l_dom_playback_screen, func: create_preview } })
        }
      }

      //get start_time
      obj.start_time = parseInt(obj.start_time);
      let start_time = obj.start_time;
      sessionStorage.setItem('play_back_startTime', JSON.stringify(start_time))
      //get end_time
      obj.end_time = parseInt(obj.end_time);
      let end_time = obj.end_time;
      sessionStorage.setItem('play_back_endTime', JSON.stringify(end_time))
      function playback_speed (data, progress, record_played_duration) {
        console.log('enter Play_speed')
        let progress2 = sessionStorage.getItem("aaa")
        sessionStorage.setItem("aaa", progress);
        if (bo_type) {
          start_time = b_start_time;
          sessionStorage.setItem('bo_type', false)
          bo_type = false;
        } else {
          start_time = start_time + record_played_duration;
        }
        let play_start_time_stop = new Date(start_time).format("yyyy-MM-dd hh:mm:ss");
        let play_start_time = new Date(start_time).format("hh:mm:ss");
        $("#playback_start_time").html(play_start_time);
        let play_end_time_stop = new Date(end_time).format("yyyy-MM-dd hh:mm:ss");
        let play_end_time = new Date(end_time).format("hh:mm:ss");
        if (play_start_time_stop >= play_end_time_stop) {
          $("#playback_start_time").html(play_end_time);
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
        if(!data) data = null
        _this.publicFunc.mx("#playback_buffer_ret").innerHTML = data;
        fdSliderController.increment("playback_progressbar", progress - _this.publicFunc.mx("#playback_progressbar").value);
      }
      b_start_time = obj.start_time;
      sessionStorage.setItem('b_start_time', JSON.stringify(b_start_time))
      function create_preview (data) {
        sessionStorage.setItem("pause_start_time", start_time)
        data.parent.html(
          "<div id='play_view_box'>"
          + "<div id='play_pause_pic'></div>"
          + "</div>")
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
          for(let i = 0; i < obj.data.length; i++){
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
      window.onresize = function () {}
    }
  },
  async mounted () {
    import(`@/lib/plugins/slider.js`)
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if(this.$route.params){
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    }else{
      pageData = {parent: $("#" + this.$route.name)}
    }
    // console.log(pageData,"pageData")
    this.publicFunc.projectReload.call(this);
    await this.create_playback_page(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
  }
}
</script>