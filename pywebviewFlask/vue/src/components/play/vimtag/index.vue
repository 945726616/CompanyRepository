<template>
  <div id="play"></div>
</template>
<script>
import '../../../lib/exportModule/mCustomScrollbar'
export default {
  methods: {
    vimtagPlay (obj) {
      let _this = this
      // console.log("传递过来的数据", obj)
      let l_dom_delete_adjust_page,
        l_white_light,
        l_dom_mode_auto,
        l_dom_mode_daytime,
        l_dom_mode_night,
        l_dom_mode_white,
        l_dom_mode_infrared,
        l_dom_mode_smart,
        l_dom_adjust_mode_night,
        l_dom_adjust_mode_daytime,
        l_dom_adjust_mode_auto,
        l_dom_adjust_mode_white,
        l_dom_adjust_mode_infrared,
        l_dom_adjust_mode_smart,
        l_dom_adjust_reset,
        l_dom_ptz_control_bottom_center,
        l_dom_ptz_control_left,
        l_dom_ptz_control_right,
        l_dom_ptz_control_up,
        l_dom_ptz_control_down,
        l_dom_turn_left,
        l_dom_turn_right,
        l_dom_turn_up,
        l_dom_turn_down,
        l_dom_video_off_pic,
        l_dom_camera_off_pic,
        l_dom_talkback_off_pic,
        l_dom_adjust_off_pic,
        l_dom_control_menu,
        l_dom_video_play,
        l_dom_play_view_box,
        inner_window_info,
        // support_1080p=-1,
        support_1080p = "",
        is_playing = 0;
      if (_this.$store.state.jumpPageData.localFlag) {
        // console.log("本地")
      } else {
        // console.log("非本地")
      }
      obj.parent.html("<div id='play_box' class='noselect'>"
        + "<div id='play_content_box'>"
        + "<div id='page_top_menu'>"
        + "<div id='back'><div id='main_title_box_return_img'></div>" + mcs_back + "</div>"
        + "</div>"
        + "<div id='play_view' class='noselect'>"
        + "<div id='play_buffer_ret'></div>"
        + "<div id='play_screen' class='noselect'></div>"
        + "<div id='play_menu_box'></div>"
        + "<div id='play_view_control' class='noselect'></div>"
        + "</div>"
        + "<div id='play_dev_list' style='display:" + (_this.$store.state.jumpPageData.localFlag ? "none" : "block") + "'>"
        + "<div id='device_list_sidebar_up'>" + mcs_device_list + "</div>"
        + "<div id='device_list_sidebar_center'></div>"
        + "</div>"
        + "</div>"
        + "<div id='snapshot_preview_div'>"
        + "<div id='snapshot_preview_inner'>"
        + "<a id='snapshot_preview_url'><img id='snapshot_preview_content'><div id='snapshot_img_page_download'></div></a>"
        // +"<div class='snapshot_preview_text'>"+mcs_pic_look+"</div>"  //你可到本地查看图片
        + "</div>"
        + "<div id='snapshot_preview_close'></div>"
        + "</div>"
        + "</div>")
      let local_play_data = {};
      local_play_data.addr = obj.addr;
      local_play_data.dom = _this.publicFunc.mx("#play_screen");
      local_play_data.profile_token = "p0";

      // local_play_data.func = function (msg) { };
      let l_dom_snapshot_preview_close = _this.publicFunc.mx("#snapshot_preview_close");
      let l_dom_play_box = _this.publicFunc.mx("#play_box");
      let l_dom_play_dev_list = _this.publicFunc.mx("#play_dev_list");
      let l_dom_device_list_sidebar_up = _this.publicFunc.mx("#device_list_sidebar_up");
      let l_dom_play_menu_box = _this.publicFunc.mx("#play_menu_box");
      let l_dom_play_view = _this.publicFunc.mx("#play_view");
      // let $("#play_screen") = _this.publicFunc.mx("#play_screen");
      let l_dom_device_list_sidebar_center = _this.publicFunc.mx("#device_list_sidebar_center");
      let l_dom_play_buffer_ret = _this.publicFunc.mx("#play_buffer_ret");
      let l_dom_play_view_control = _this.publicFunc.mx("#play_view_control");
      let l_play_box_width = document.documentElement.clientWidth - 17 - 100;
      $("#play_box").css("width", l_play_box_width + 'px');
      // let l_list_width = l_dom_play_dev_list.offsetWidth + 20;
      let l_list_width = parseInt($("#play_dev_list").css("width")) + 20;
      let l_device_list_sidebar_up_height = l_dom_device_list_sidebar_up.offsetHeight;

      let l_play_view_top = l_dom_play_view.offsetTop;
      let l_dom_play_view_width = l_play_box_width - l_list_width;
      let l_dom_play_view_height = l_dom_play_view_width / 16 * 9 + 44;
      l_dom_play_view.style.width = l_dom_play_view_width + "px";
      l_dom_play_view.style.height = l_dom_play_view_height + "px";
      l_dom_play_dev_list.style.height = l_dom_play_view_height + "px";
      $("#play_screen").css('height', l_dom_play_view_width / 16 * 9 + 'px')
      l_dom_device_list_sidebar_center.style.height = (l_dom_play_view_height - l_device_list_sidebar_up_height) + "px";
      // l_dom_play_buffer_ret.style.left = l_play_view_left + "px"; 
      // l_dom_play_buffer_ret.style.top = l_play_view_top + "px";  
      _this.publicFunc.mx("#play_dev_list").setAttribute("style", "width:234px;float:left;background:#ebebeb;display:block;overflow:hidden;");
      // _this.publicFunc.mx("#page_top_menu").setAttribute("style","margin-top:15px;margin-bottom:3px;") 
      l_dom_play_buffer_ret.style.display = "none";
      if (window.fujikam == "fujikam") {
        l_dom_play_buffer_ret.style.display = "block";
        l_dom_play_box.style.width = "1200px";
        _this.publicFunc.mx("#page_top_menu").setAttribute("style", "margin-top:10px;padding-left:0px;margin-bottom:0px;");
        l_dom_play_view.style.width = (1200 - l_list_width) + "px";
        // l_dom_play_view.style.width ="1042px";
        // play_content_box    width=1276px; margin:0 auto; overflow :hidden
        // play_screen         background:black

        l_dom_play_view.style.height = "586px";
        l_dom_device_list_sidebar_center.style.height = "586px";
        l_dom_play_view.style.marginLeft = "0px";
        $("#play_screen").css('height', '100%')
        $("#play_screen").css('width', '100%')
        l_dom_play_buffer_ret.style.width = '934px';
        _this.publicFunc.mx("#play_dev_list").setAttribute("style", "width:234px;float:left;background:#ebebeb;display:block;");
        // if (pc_is_offline == 1) {
        //   _this.publicFunc.mx("#play_dev_list").setAttribute("style", "display:none;");
        // }
      }
      play_menu_control({ parent: l_dom_play_menu_box });
      if (!_this.$store.state.jumpPageData.localFlag) {
        // if (_this.$store.state.jumpPageData.localFlag) {//本地
        device_list_box_sidebar({ parent: l_dom_device_list_sidebar_center });
        play_view_control({ parent: l_dom_play_view_control });
      }
      _this.publicFunc.mx("#back").onclick = function () {
        if (obj.box_ipc == 1) {//云盒子设备播放
          // createPage("boxlist", obj)//创建云盒子页面
          _this.$router.push({ name: 'boxlist', params: obj })
        } else { //否则就是普通ipc
          // createPage("devlist", obj)//创建设备列表页面
          _this.$router.push({ name: 'devlist', params: obj })
        }
      }
      function device_list_box_sidebar (data) {
        if (_this.$store.state.jumpPageData.localFlag) {
          msdk_ctrl({ type: "local_devlist_get", data: { func: device_list } })
        } else {
          if (obj.box_ipc) {
            device_list(_this.$store.state.jumpPageData.boxDeviceData)
          } else {
            device_list(_this.$store.state.jumpPageData.deviceData)
          }
        }
        function device_list (msg) {
          data.parent.innerHTML = "<div id='vimtag_device_list'>"
          let selectNickArr
          let screen_token // 标记设备分辨率
          if (_this.$store.state.user.supportTreeFlag) { // 如果支持树状结构, 将选中设备的nick分割成数组用于比较使用
            selectNickArr = _this.$store.state.jumpPageData.selectNick.split('.')
          }
          for (let length = msg.length, i = 0; i < length; i++) {
            let dev_data = msg[i];
            if(dev_data.type !== "socket"){
            let white_light = "";
            if (dev_data.p) {
              for (let j = 0; j < dev_data.p.length; j++) {
                if (dev_data.p[j].n == "s.white_light") {
                  white_light = dev_data.p[j].v;
                }
              }
            }
            if (!dev_data) continue;
            if (dev_data && dev_data.p) {
              for (let w = 0; w < dev_data.p.length; w++) {
                if (dev_data.p[w].n == "p0") {
                  screen_token = dev_data.p[w].v;
                }
              }//标记设备分辨率
            }
            let sn = dev_data.nick ? dev_data.nick : dev_data.sn;
            // console.log(sn, '获取sn即昵称')
            if (_this.$store.state.user.supportTreeFlag) { // 如果支持树状结构
              let sn_nick_arr = sn.split('.')
              let flag_continue = 0
              // 如果分割后的nick数组比较 只展示数组最后一项不同的设备
              for (let index = 0; index < selectNickArr.length - 1; index++) {
                if (selectNickArr[index] !== sn_nick_arr[index]) {
                  flag_continue = 1
                }
              }
              if (flag_continue) {
                continue
              }

              // if (selectNickArr[0] !== sn_nick_arr[0] || selectNickArr[1] !== sn_nick_arr[1] || selectNickArr[2] !== sn_nick_arr[2]) continue
            }
            if (_this.$store.state.jumpPageData.localFlag && dev_data.stat != "Online") continue;
            if (obj.box_ipc == 1) { //如果云盒子列表
              if (dev_data.online == 1) {
                data.parent.innerHTML += "<div class='device_list_sidebar_img' state='online' sn=" + dev_data.box_sn + " ipc_sn=" + dev_data.sn + "><div class='sidebar_camera_sign_picture'></div><div class='device_sidebar_nick'><span>&bull; " + sn + "</span></div></div>";
              } else {
                data.parent.innerHTML += "<div class='device_list_sidebar_img' state='offline' sn=" + dev_data.box_sn + " ipc_sn=" + dev_data.sn + "><div class='device_sidebar_list_offline_img'></div><div class='device_sidebar_nick'><span>&bull; " + sn + "</span></div></div>";	//device_sidebar_list_offline_img 在云盒子中设备不在线时
              }
            } else {
              if ((dev_data.stat == "Online") && (dev_data.type == "BOX")) {	//实时视频播放
                continue;
              } else if (dev_data.stat == "Online") {
                data.parent.innerHTML += "<div class='device_list_sidebar_img' addr='" + dev_data.addr + "' state='online' sn='" + dev_data.sn + "' white_light='" + white_light + "' screen_token=" + screen_token + "><div class='sidebar_camera_sign_picture'></div><div class='device_sidebar_nick'><span>&bull; " + sn + "</span></div></div>";
                continue;
              } else if (dev_data.stat == "Offline") {
                data.parent.innerHTML += "<div class='device_list_sidebar_img' addr='" + dev_data.addr + "' state='offline' sn=" + dev_data.sn + " screen_token=" + screen_token + "><div class='device_sidebar_list_offline_img'></div><div class='device_sidebar_nick'><span>&bull; " + sn + "</span></div></div>"
              }
            }
          }
          }
          data.parent.innerHTML += "<div id='active_dev'></div></div>";
          device_list_event();
        }
        function device_list_event () {
          $(data.parent).mCustomScrollbar({
            callbacks: {
              onScroll: function () {
                let arr1 = $(".device_list_sidebar_img:not([data-send])");
                let arr2 = [];
                arr2 = arr1.slice(0, 3)
                $.each(arr2, function (index, item) { //滚动停止的时候发送请求
                  item.setAttribute("data-send", "true");
                });
                _this.$api.play.load_imgs({ dom: arr2 }) // 请求图片
              }
            }
          });
          let l_dom_device_list_img = _this.publicFunc.mx(".device_list_sidebar_img")
          if (obj.box_ipc == 1) { //如果是云盒子播放列表
            _this.$api.play.load_imgs({ dom: l_dom_device_list_img, box_ipc: 1 }) // 请求图片
          } else {
            sendAsk();
          }
          function sendAsk () {
            let lis = $('#device_list_sidebar_center').find(".device_list_sidebar_img");
            //swHeight=滚动的高度+窗体的高度；当li的offset高度<=swHeight,那么说明当前li显示在可视区域了
            let swHeight = $(window).scrollTop() + $(window).height();
            $.each(lis, function (index, item) {

              let mTop = item.offsetTop;
              if (mTop < swHeight && !item.getAttribute("data-send")) {
                item.setAttribute("data-send", "true");
              }
            });
            let arr = $(".device_list_sidebar_img[data-send='true']");
            _this.$api.play.load_imgs({ dom: arr }) // 请求图片
          }
          for (let length = l_dom_device_list_img.length, i = 0; i < length; ++i) {
            if (obj.box_ipc == 1) { //页面一进来选择框显示，如果云盒子播放页面，对比ipc_sn 
              if (l_dom_device_list_img[i].getAttribute("ipc_sn") == obj.ipc_sn) {
                _this.publicFunc.mx("#active_dev").style.top = (10 * (i + 1) + 145 * i) + "px";
                $(".device_sidebar_nick").eq(i).addClass("selected_style");
              }
            } else {
              if (l_dom_device_list_img[i].getAttribute("sn") == _this.$store.state.jumpPageData.selectDeviceIpc) {
                _this.publicFunc.mx("#active_dev").style.top = (10 * (i + 1) + 145 * i) + "px";
                $(".device_sidebar_nick").eq(i).addClass("selected_style");
              }
            }
            l_dom_device_list_img[i].onclick = function () {
              // console.log(l_dom_device_list_img[i], 'this.click')
              $(".device_sidebar_nick").removeClass("selected_style");
              let active_dev_top = this.offsetTop;
              let screen_token = this.getAttribute("screen_token");//点击列表中的设备，屏幕分辩率跟着变
              let ipc_sn = this.getAttribute("ipc_sn");//点击列表中的设备，获取云盒子中设备id
              let box_ipc_stat = this.getAttribute("state");//获取云盒子设备状态

              // if (this.getAttribute("white_light")) {
              //   white_light = this.getAttribute("white_light");
              // }
              // l_white_light = white_light;
              play_view_control({ parent: l_dom_play_view_control });
              obj.ipc_sn = ipc_sn; //给obj.ipc_sn重新赋值 解决回放bug
              $("#active_dev").animate({ "top": active_dev_top + "px" });
              $(this).find(".device_sidebar_nick").addClass("selected_style");
              _this.$store.dispatch('setSelectDeviceIpc', this.getAttribute("sn")) // 点击时存储sn
              if (is_playing) {
                _this.$api.play.video_stop({
                  dom: $("#play_screen")
                }).then(() => {
                  let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
                  if (_this.$store.state.jumpPageData.localFlag) { // 本地方法暂不考虑
                    local_play_data.profile_token = profile_token;
                    local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    msdk_ctrl({ type: "local_play", data: local_play_data });
                  } else {
                    if (obj.box_ipc == 1) { //点击右侧设备列表的设备，如果是云盒子
                      if (box_ipc_stat === 'offline') {
                        $("#play_screen").css('background', 'black')
                        _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 });
                        $("#enter_history_img_box_tip").show();
                        setTimeout(function () {
                          $("#enter_history_img_box_tip").hide();
                        }, 6000);
                      } else {
                        // 调用播放接口
                        _this.$api.play.play({
                          dom: $("#play_screen"),
                          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                          profile_token: "p0_" + ipc_sn + ""
                        }).then(res => {
                          play_speed(res)
                        })
                      }
                    } else {
                      $("#resolute_choice").text(screen_token);
                      $("#high_definition").text(screen_token);
                      // 调用播放接口
                      _this.$api.play.play({
                        dom: $("#play_screen"),
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        profile_token: profile_token
                      }).then(res => {
                        play_speed(res)
                      })
                    }
                  }
                })
              } else {
                let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
                if (_this.$store.state.jumpPageData.localFlag) {
                  local_play_data.profile_token = profile_token;
                  local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                  msdk_ctrl({ type: "local_play", data: local_play_data });
                } else {
                  if (obj.box_ipc == 1) {
                    if (box_ipc_stat == 'offline') {
                      $("#play_screen").style.background = 'black';
                      _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 });
                      $("#enter_history_img_box_tip").show();
                      setTimeout(function () {
                        $("#enter_history_img_box_tip").hide();
                      }, 6000);
                    } else {
                      // 调用播放接口
                      _this.$api.play.play({
                        dom: $("#play_screen"),
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        profile_token: "p0_" + ipc_sn + ""
                      }).then(res => {
                        play_speed(res)
                      })
                    }
                  } else {
                    $("#resolute_choice").text(screen_token);
                    $("#high_definition").text(screen_token);
                    // 调用播放接口
                    _this.$api.play.play({
                      dom: $("#play_screen"),
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      profile_token: profile_token
                    }).then(res => {
                      play_speed(res)
                    })
                  }
                }
                is_playing = 1;
                $("#play_view_control").show();
                l_dom_video_play.className = "video_play_start";
              }
            }
            l_dom_device_list_img[i].ondblclick = function () {
              let active_dev_top = this.offsetTop;
              let screen_token = this.getAttribute("screen_token");//点击列表中的设备，屏幕分辩率跟着变
              let ipc_sn = this.getAttribute("ipc_sn");//点击列表中的设备，获取云盒子中设备id
              obj.ipc_sn = ipc_sn; //给obj.ipc_sn重新赋值 解决回放bug
              $("#active_dev").animate({ "top": active_dev_top + "px" });
              _this.$store.dispatch('setSelectDeviceIpc', this.getAttribute("sn")) // 点击时存储sn
              if (is_playing) {
                _this.$api.play.video_stop({
                  dom: $("#play_screen")
                }).then(() => {
                  let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
                  if (_this.$store.state.jumpPageData.localFlag) {
                    local_play_data.profile_token = profile_token;
                    local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    msdk_ctrl({ type: "local_play", data: local_play_data });
                  } else {
                    if (obj.box_ipc == 1) {
                      if (box_ipc_stat == 'offline') {
                        $("#play_screen").style.background = 'black';
                        _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 });
                        $("#enter_history_img_box_tip").show();
                        setTimeout(function () {
                          $("#enter_history_img_box_tip").hide();
                        }, 6000);
                      } else {
                        // 调用播放接口
                        _this.$api.play.play({
                          dom: $("#play_screen"),
                          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                          profile_token: "p0_" + ipc_sn + ""
                        }).then(res => {
                          play_speed(res)
                        })
                      }
                    } else {
                      $("#resolute_choice").text(screen_token);
                      $("#high_definition").text(screen_token);
                      // 调用播放接口
                      _this.$api.play.play({
                        dom: $("#play_screen"),
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        profile_token: profile_token
                      }).then(res => {
                        play_speed(res)
                      })
                    }
                  }
                })
              } else {
                let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
                if (_this.$store.state.jumpPageData.localFlag) {
                  local_play_data.profile_token = profile_token;
                  local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                  msdk_ctrl({ type: "local_play", data: local_play_data });
                } else {
                  if (obj.box_ipc == 1) {
                    if (box_ipc_stat == 'offline') {
                      $("#play_screen").style.background = 'black';
                      _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 });
                      $("#enter_history_img_box_tip").show();
                      setTimeout(function () {
                        $("#enter_history_img_box_tip").hide();
                      }, 6000);
                    } else {
                      // 调用播放接口
                      _this.$api.play.play({
                        dom: $("#play_screen"),
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        profile_token: "p0_" + ipc_sn + ""
                      }).then(res => {
                        play_speed(res)
                      })
                    }
                  } else {
                    $("#resolute_choice").text(screen_token);
                    $("#high_definition").text(screen_token);
                    // 调用播放接口
                    _this.$api.play.play({
                      dom: $("#play_screen"),
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      profile_token: profile_token
                    }).then(res => {
                      play_speed(res)
                    })
                  }
                }
                is_playing = 1;
                $("#play_view_control").show();
                l_dom_video_play.className = "video_play_start";
              }
            }
          }
        }
      }
      function play_menu_control (data) {
        data.parent.innerHTML =
          "<div id='play_menu_left'>"
          + "<div id='video_play' class='video_play_stop'></div>"
          + "<div id='voice_close' class='voice_close_close'></div>"
          + "</div>"
          + "<div id='full_screen'></div>"
          + "<div class='enter_nav'></div>"
          + "<div id='play_menu_right'>"
          + "<div id='choice_play_definition'>"
          + "<div id='high_definition' class='definition_cha'></div>"
          + "<div class='definition_nav'></div>"
          + "<div id='standard_definition' class='definition_cha'>" + mcs_standard_clear + "</div>"
          + "<div class='definition_nav'></div>"
          + "<div id='fluency_definition' class='definition_cha'>" + mcs_fluent_clear + "</div>"
          + "<div class='definition_nav'></div>"
          + "<div id='auto_definition' class='definition_cha'>" + mcs_auto + "</div>"
          + "</div>"
          + "<div id='resolute_choice'></div>"
          + "<div class='enter_nav'></div>"
          + "<div id='enter_set_img'></div>"
          + "<div class='enter_nav'></div>"
          + "<div id='enter_history_img'><div id='enter_history_img_box_tip'>" + mcs_playback + "</div></div>"
          + "</div>";
        get_definition();
        l_dom_video_play = _this.publicFunc.mx("#video_play");
        let l_dom_high_definition = _this.publicFunc.mx("#high_definition");
        let l_dom_standard_definition = _this.publicFunc.mx("#standard_definition");
        let l_dom_fluency_definition = _this.publicFunc.mx("#fluency_definition");
        let l_dom_auto_definition = _this.publicFunc.mx("#auto_definition");
        let l_dom_resolute_choice = _this.publicFunc.mx("#resolute_choice");
        let l_dom_choice_play_definition = _this.publicFunc.mx("#choice_play_definition");
        let l_dom_enter_set_img = _this.publicFunc.mx("#enter_set_img");
        let l_dom_enter_history_img = _this.publicFunc.mx("#enter_history_img");
        let l_dom_voice_close_open = _this.publicFunc.mx("#voice_close");
        let l_dom_full_screen = _this.publicFunc.mx("#full_screen");
        // 全屏和声音控制按钮浏览器端不支持

        $("#full_screen").css("display", "none")
        $("#voice_close").css("display", "none")

        if (window.fujikam == "fujikam") {

          $("#full_screen").css("display", "block");
          $("#voice_close").css("display", "block");
          // l_dom_choice_play_definition.style.marginLeft=138+'px'; 
        }
        let l_top = l_dom_resolute_choice.offsetTop - 116;

        $("#choice_play_definition").css("top", l_top + "px");
        // l_dom_choice_play_definition.style.marginLeft=130+'px';
        if (_this.$store.state.jumpPageData.localFlag) {
          $("#enter_history_img").hide();
          $("#enter_set_img").hide();
        } else if (_this.$store.state.jumpPageData.experienceFlag) {
          $("#enter_set_img").hide();
        } else if (obj.box_ipc == 1) {// obj.box_ipc==1如果云盒子实时视频播放
          $("#enter_set_img").hide();
          $("#enter_set_img").next().hide(); //竖线
        }
        l_dom_auto_definition.onclick = function () {
          $("#choice_play_definition").hide();
          $("#resolute_choice").text(mcs_auto);
        };
        l_dom_fluency_definition.onclick = function () {
          $("#choice_play_definition").hide();
          sessionStorage.setItem("PlayProfile", "p2");
          $("#resolute_choice").text(mcs_fluent_clear);
          if (is_playing) {
            if (_this.$store.state.jumpPageData.localFlag) {
              local_play_data.profile_token = "p2";
              local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              msdk_ctrl({ type: "local_play", data: local_play_data });
            } else {
              // 调用播放接口
              _this.$api.play.play({
                dom: $("#play_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                profile_token: "p2"
              }).then(res => {
                play_speed(res)
              })
            }
          }
        };
        l_dom_standard_definition.onclick = function () {
          $("#choice_play_definition").hide();
          sessionStorage.setItem("PlayProfile", "p1");
          $("#resolute_choice").text(mcs_standard_clear);
          if (is_playing) {
            if (_this.$store.state.jumpPageData.localFlag) {
              local_play_data.profile_token = "p1";
              local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              msdk_ctrl({ type: "local_play", data: local_play_data });
            } else {
              // 调用播放接口
              _this.$api.play.play({
                dom: $("#play_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                profile_token: 'p1'
              }).then(res => {
                play_speed(res)
              })
            }
          }
        };
        l_dom_high_definition.onclick = function () {
          $("#choice_play_definition").hide();
          sessionStorage.setItem("PlayProfile", "p0");
          // if(support_1080p==-1){  
          // 	$("#resolute_choice").text(mcs_new_hd); 
          // }
          // else if(support_1080p==0){
          // 	$("#resolute_choice").text("720P");
          // }else if(support_1080p==1){
          // 	$("#resolute_choice").text("1080P");
          // }else if(support_1080p==2){
          // 	$("#resolute_choice").text("960P");
          // }else if(support_1080p==3){
          // 	$("#resolute_choice").text("3MP");
          // }else if(support_1080p==4){
          // 	$("#resolute_choice").text("4MP");
          // }
          $("#resolute_choice").text(support_1080p);
          if (is_playing) {
            if (_this.$store.state.jumpPageData.localFlag) {
              local_play_data.profile_token = "p0";
              local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              msdk_ctrl({ type: "local_play", data: local_play_data });
            } else {
              // 调用播放接口
              _this.$api.play.play({
                dom: $("#play_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                profile_token: 'p0'
              }).then(res => {
                play_speed(res)
              })
            }
          }
        };
        l_dom_full_screen.onclick = function () {
          _this.$api.play.fullscreen()
        }
        l_dom_enter_set_img.onclick = function () {
          // $("#buffer_page").show();
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          // console.log('play_dev_info')
          _this.$api.set.dev_info({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            _this.publicFunc.closeBufferPage()
            if (res.fisheye) {
              let jumpData = { parent: $("#page"), back_page: "play", type: 5, addr: obj.addr, web_name: "vimtag" };
              // createPage("set", { parent: $("#page"), back_page: "play", type: 5, addr: obj.addr, web_name: "vimtag" });
              _this.$router.push({ name: 'set', params: jumpData })
            } else {
              let jumpData = { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "vimtag" };
              // createPage("set", { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "vimtag" });
              _this.$router.push({ name: 'set', params: jumpData })
            }
          })
        }
        l_dom_enter_history_img.onclick = function () {
          if (obj.box_ipc == 1) { //云盒子设备实时播放时点击回放
            let jumpData = { parent: $("#page"), dev_sn: obj.ipc_sn, back_page: "playpage", addr: obj.addr, agent: obj.agent, box_ipc: obj.box_ipc, ipc_sn: obj.ipc_sn, box_live: 1, ipc_stat: obj.ipc_stat };
            // createPage("history", { parent: $("#page"), dev_sn: obj.ipc_sn, back_page: "playpage", addr: obj.addr, agent: obj.agent, box_ipc: obj.box_ipc, ipc_sn: obj.ipc_sn, box_live: 1, ipc_stat: obj.ipc_stat })
            _this.$router.push({ name: 'history', params: jumpData })
          } else {
            let jumpData = { parent: $("#page"), dev_sn: _this.$store.state.jumpPageData.selectDeviceIpc, back_page: "playpage", addr: obj.addr };
            // createPage("history", { parent: $("#page"), dev_sn: _this.$store.state.jumpPageData.selectDeviceIpc, back_page: "playpage", addr: obj.addr })
            _this.$router.push({ name: 'history', params: jumpData })
          }
        }

        l_dom_video_play.onclick = function () { // 视频播放/暂停
          let class_name = this.className;
          if (class_name == "video_play_stop") {
            is_playing = 1;
            let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
            if (_this.$store.state.jumpPageData.localFlag) {
              local_play_data.profile_token = profile_token;
              local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              msdk_ctrl({ type: "local_play", data: local_play_data });
            } else {
              if (obj.box_ipc === 1) { //如果云盒子播放时暂停
                // 调用播放接口
                _this.$api.play.play({
                  dom: $("#play_screen"),
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  profile_token: "p0_" + obj.ipc_sn
                }).then(res => {
                  play_speed(res)
                })
              } else {
                // 调用播放接口
                _this.$api.play.play({
                  dom: $("#play_screen"),
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  profile_token: profile_token
                }).then(res => {
                  play_speed(res)
                })
              }
            }
            $("#play_view_control").show();
            this.className = "video_play_start";
          } else if (class_name === "video_play_start") {
            is_playing = 0;
            _this.$api.play.video_stop({
              dom: $("#play_screen")
            }).then(res => {
              create_preview(res)
            })
            this.className = "video_play_stop";
            $("#play_view_control").hide();
          }
        }

        if (window.fujikam === "fujikam") {
          l_dom_voice_close_open.onclick = function () { // 关闭/开启播放声音 调用本地方法实现不是调用接口
            let class_name = this.className;
            if (class_name === "voice_close_close") {
              _this.$api.play.voice({ flag: 0 })
              l_dom_voice_close_open.className = "voice_close_open";
            } else {
              _this.$api.play.voice({ flag: 1 })
              l_dom_voice_close_open.className = "voice_close_close";
            }
          }
        }
        l_dom_resolute_choice.onclick = function () {
          if (obj.box_ipc == 1) { // 如果云盒子实时播放页面 只显示高清 不能选择播放分辩率
            $("#choice_play_definition").hide();
          } else {

            let is_show = $("#choice_play_definition").css("display");
            if (is_show == "none") {
              $("#choice_play_definition").show();
            } else {
              $("#choice_play_definition").hide();
            }
          }

        }
        l_dom_choice_play_definition.onmouseleave = function () {
          $("#choice_play_definition").hide();
        }

        //Get local storage resolution
        if (sessionStorage.getItem("PlayProfile") == "p0") {
          // if(support_1080p==-1){  
          // 	$("#resolute_choice").text(mcs_new_hd);
          // }
          //   else if(support_1080p==0){
          //    $("#resolute_choice").text("720P");
          //   }else if(support_1080p==1){
          //    $("#resolute_choice").text("1080P");
          //   }else if(support_1080p==2){
          //    $("#resolute_choice").text("960P");
          //   }else if(support_1080p==3){
          //   	   $("#resolute_choice").text("3MP");
          //   }else if(support_1080p==4){
          //             $("#resolute_choice").text("4MP");
          //   }
          $("#resolute_choice").text(support_1080p);
        } else if (sessionStorage.getItem("PlayProfile") == "p1") {
          $("#resolute_choice").text(mcs_standard_clear);
        } else if (sessionStorage.getItem("PlayProfile") == "p2") {
          $("#resolute_choice").text(mcs_fluent_clear);
        } else if (sessionStorage.getItem("PlayProfile") == "p3") {
          $("#resolute_choice").text(mcs_fluent_clear);
        } else {
          $("#resolute_choice").text(mcs_auto);
        }
        function get_definition () {
          function dev_info_get_ack (msg) {
            // console.log(msg, 'dev_info_get_ack_msg')
            if (msg && msg.white_light)
              l_white_light = msg.white_light;
            play_view_control({ parent: l_dom_play_view_control });
            if (obj.box_ipc == 1) {//如果云盒子实时播放页面
              $("#resolute_choice").text(mcs_new_hd);//云盒子实时播放不能切换分辩率，显示高清
            } else {
              if (msg.s_sensor == 'ok') {
                _this.publicFunc.mx("#high_definition").innerHTML = msg.def;
                _this.publicFunc.mx("#resolute_choice").innerHTML = msg.def;
                support_1080p = msg.def;
              } else {
                _this.publicFunc.mx("#high_definition").innerHTML = 'NULL';
                _this.publicFunc.mx("#resolute_choice").innerHTML = 'NULL';
                support_1080p = 'NULL';
              }
            }
            // 迁移接口请求顺序将播放接口放入设备信息请求接口后
            if (_this.$store.state.jumpPageData.localFlag) {
              let local_play_sign = {};
              local_play_sign.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              local_play_sign.addr = obj.addr;
              local_play_sign.password = sessionStorage.getItem("pass_" + _this.$store.state.jumpPageData.selectDeviceIpc);
              local_play_sign.func = function () {
                local_play_data.agent = _this.$store.state.jumpPageData.localFlag_agent;
                create_preview({ parent: $("#play_screen") });
              };
              msdk_ctrl({ type: "local_sign_in", data: local_play_sign })
            } else {
              if (obj.box_ipc === 1) { //如果是云盒子实时视频播放 参数token
                if (obj.ipc_stat === 0) {//页面一进来，标记云盒子设备是否在线
                  // 调用播放接口
                  _this.$api.play.play({
                    dom: $("#play_screen"),
                    sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                    profile_token: "p0_" + obj.ipc_sn + "",
                    ipc_stat: 0
                  }).then(res => {
                    play_speed(res)
                  })
                  $("#play_screen").style.background = 'black';
                  _this.publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 })
                  $("#enter_history_img_box_tip").show();
                  setTimeout(function () {
                    $("#enter_history_img_box_tip").hide();
                  }, 6000);

                } else {
                  // 调用播放接口
                  _this.$api.play.play({
                    dom: $("#play_screen"),
                    sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                    profile_token: "p0_" + obj.ipc_sn + ""
                  }).then(res => {
                    play_speed(res)
                  })
                }
              } else {
                // 调用播放接口
                _this.$api.play.play({
                  dom: $("#play_screen"),
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  profile_token: "p0"
                }).then(res => {
                  play_speed(res)
                })
              }
              l_dom_video_play.className = 'video_play_start'
              is_playing = 1;
              $("#play_view_control").show();
            }
          }
          _this.$api.set.dev_info({ //ms.send_msg("dev_info_get"
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            dev_info_get_ack(res)
          })
        }
      }
      function play_view_control (data) { // 摇头机镜头控制
        //1.判断是否支持红外白光
        var g_text = "";
        if (l_white_light == 1) {
          g_text =
            "<div class='adjust_line'>"
            + "<div class='adjust_cha'>" + mcs_light_mode + "</div>"
            + "<div class='adjust_mode_cha'>"
            + "<div style='width:100px;'>"
            + "<div id='adjust_mode_smart' class='mode_cha'>" + mcs_light_smart + "</div>"
            + "<div id='mode_smart' class='adjust_mode_circle'></div>"
            + "</div>"
            + "<div style='width:100px;'>"
            + "<div id='adjust_mode_infrared' class='mode_cha'>" + mcs_light_infrared + "</div>"
            + "<div id='mode_infrared' class='adjust_mode_circle'></div>"
            + "</div>"
            + "<div style='width:100px;'>"
            + "<div id='adjust_mode_white' class='mode_cha'>" + mcs_light_white + "</div>"
            + "<div id='mode_white' class='adjust_mode_circle'></div>"
            + "</div>"
            + "</div>"
            + "</div>"
        }
        data.parent.innerHTML =
          "<div id='vimtag_ptz_control'>"
          + "<div id='ptz_control_left'>"
          + "<div id='turn_left'></div>"
          + "<div id='ptz_click_left'>" + mcs_top_left + "</div>"
          + "</div>"
          + "<div id='ptz_control_center'>"
          + "<div id='ptz_control_up'>"
          + "<div id='turn_up'></div>"
          + "<div id='ptz_click_up'>" + mcs_bottom_left + "</div>"
          + "</div>"
          + "<div id='ptz_control_bottom_center'></div>"
          + "<div id='ptz_control_bottom'>"
          + "<div id='control_menu'>"
          + "<div id='video_off_pic' class='video_off_picture' style='float:left;margin-left:44px;'></div>"
          + "<div id='camera_off_pic' class='camera_off_picture' style='float:left;margin-left:44px;'></div>"
          + "<div id='talkback_off_pic' class='talkback_off_picture' style='float:left;margin-left:44px;'></div>"
          + "<div id='adjust_off_pic' class='adjust_off_picture' style='float:left;margin-left:44px;'></div>"
          + "</div>"
          + "</div>"
          + "<div id='ptz_control_down'>"
          + "<div id='turn_down'></div>"
          + "<div id='ptz_click_down'>" + mcs_bottom_right + "</div>"
          + "</div>"
          + "</div>"
          + "<div id='ptz_control_right'>"
          + "<div id='turn_right'></div>"
          + "<div id='ptz_click_right'>" + mcs_top_right + "</div>"
          + "</div>"
          + "<div id='adjust_setting'>"
          + "<div class='adjust_line'>"
          + "<div id='delete_adjust_page' class='delete_adjust_page' style='float:right;margin-top:12px;'></div>"
          + "</div>"
          + "<div class='adjust_line'>"
          + "<div class='adjust_cha'>" + mcs_mode + "</div>"
          + "<div class='adjust_mode_cha'>"
          + "<div style='width:100px;'>"
          + "<div id='adjust_mode_auto' class='mode_cha'>" + mcs_auto + "</div>"
          + "<div id='mode_auto' class='adjust_mode_circle'></div>"
          + "</div>"
          + "<div style='width:100px;'>"
          + "<div id='adjust_mode_daytime' class='mode_cha'>" + mcs_daytime + "</div>"
          + "<div id='mode_daytime' class='adjust_mode_circle'></div>"
          + "</div>"
          + "<div style='width:100px;'>"
          + "<div id='adjust_mode_night' class='mode_cha'>" + mcs_night + "</div>"
          + "<div id='mode_night' class='adjust_mode_circle'></div>"
          + "</div>"
          + "</div>"
          + "</div>"
          + g_text
          + "<div style='clear:both'></div>"
          + "<div class='adjust_line'>"
          + "<div class='adjust_cha'>" + mcs_sharpness + "</div>"
          + "<div style='width:187px;float:right;'>"
          + "<div id='brightness_value' class='adjust_show_value'></div>"
          + "<div class = 'adjust_out_box'>"
          + "<div class = 'adjust_in_box'></div>"
          + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
          + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='adjust_line'>"
          + "<div class='adjust_cha'>" + mcs_contrast + "</div>"
          + "<div style='width:187px;float:right;'>"
          + "<div id='contrast_value' class='adjust_show_value'></div>"
          + "<div class = 'adjust_out_box'>"
          + "<div class = 'adjust_in_box'></div>"
          + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
          + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='adjust_line'>"
          + "<div class='adjust_cha'>" + mcs_color_saturation + "</div>"
          + "<div style='width:187px;float:right;'>"
          + "<div id='saturation_value' class='adjust_show_value'></div>"
          + "<div class = 'adjust_out_box'>"
          + "<div class = 'adjust_in_box'></div>"
          + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
          + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='adjust_line'>"
          + "<div class='adjust_cha'>" + mcs_brightness + "</div>"
          + "<div style='width:187px;float:right;'>"
          + "<div id='sharpness_value' class='adjust_show_value'></div>"
          + "<div class = 'adjust_out_box'>"
          + "<div class = 'adjust_in_box'></div>"
          + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
          + "</div>"
          + "</div>"
          + "</div>"
          + "<div id='adjust_reset'>" + mcs_reset + "</div>"
          + "</div>"
          + "</div>";
        let l_dom_delete_adjust_page = _this.publicFunc.mx("#delete_adjust_page");
        let l_dom_mode_auto = _this.publicFunc.mx("#mode_auto");
        let l_dom_mode_daytime = _this.publicFunc.mx("#mode_daytime");
        let l_dom_mode_night = _this.publicFunc.mx("#mode_night");
        let l_dom_mode_white = _this.publicFunc.mx("#mode_white");//白光
        let l_dom_mode_infrared = _this.publicFunc.mx("#mode_infrared");//红外
        let l_dom_mode_smart = _this.publicFunc.mx("#mode_smart");//智能
        let l_dom_adjust_mode_night = _this.publicFunc.mx("#adjust_mode_night");
        let l_dom_adjust_mode_daytime = _this.publicFunc.mx("#adjust_mode_daytime");
        let l_dom_adjust_mode_auto = _this.publicFunc.mx("#adjust_mode_auto");
        let l_dom_adjust_mode_white = _this.publicFunc.mx("#adjust_mode_white");
        let l_dom_adjust_mode_infrared = _this.publicFunc.mx("#adjust_mode_infrared");
        let l_dom_adjust_mode_smart = _this.publicFunc.mx("#adjust_mode_smart");
        let l_dom_adjust_reset = _this.publicFunc.mx("#adjust_reset");
        let l_dom_ptz_control_left = _this.publicFunc.mx("#ptz_control_left");
        let l_dom_ptz_control_right = _this.publicFunc.mx("#ptz_control_right");
        let l_dom_ptz_control_up = _this.publicFunc.mx("#ptz_control_up");
        let l_dom_ptz_control_down = _this.publicFunc.mx("#ptz_control_down");
        let l_dom_turn_left = _this.publicFunc.mx("#turn_left");
        let l_dom_turn_right = _this.publicFunc.mx("#turn_right");
        let l_dom_turn_up = _this.publicFunc.mx("#turn_up");
        let l_dom_turn_down = _this.publicFunc.mx("#turn_down");
        let l_dom_video_off_pic = _this.publicFunc.mx("#video_off_pic");
        let l_dom_camera_off_pic = _this.publicFunc.mx("#camera_off_pic");
        let l_dom_talkback_off_pic = $("#talkback_off_pic");
        let l_dom_adjust_off_pic = _this.publicFunc.mx("#adjust_off_pic");
        let l_dom_control_menu = _this.publicFunc.mx("#control_menu");
        let l_dom_ptz_control_bottom_center = _this.publicFunc.mx("#ptz_control_bottom_center");
        l_dom_play_view_control.style.width = l_dom_play_view_width + 'px';
        l_dom_play_view_control.style.height = l_dom_play_view_height - 44 + 'px';
        l_dom_play_view_control.style.left = l_dom_play_view.offsetLeft + "px";
        l_dom_play_view_control.style.top = l_play_view_top + "px";
        l_dom_turn_up.className = "up_key";
        l_dom_turn_down.className = "down_key";
        l_dom_turn_left.className = "left_key";
        l_dom_turn_right.className = "right_key";
        if (window.fujikam == "fujikam") {
          l_dom_play_view_control.style.width = "946px";
          l_dom_play_view_control.style.height = "586px";
          l_dom_turn_up.className = "window_up_key";
          l_dom_turn_down.className = "window_down_key";
          l_dom_turn_left.className = "window_left_key";
          l_dom_turn_right.className = "window_right_key";
          l_dom_control_menu.style.left = "239px";
          l_dom_control_menu.style.top = "393px";
        }
        let dom_left = $(".left_button")[0],
          dom_center = $(".center_button")[0],
          dom_right = $(".right_button")[0],
          dom_out_box = $(".adjust_out_box"),
          dom_in_box = $(".adjust_in_box"),
          values_flag = [false, false, false, false],
          l_cam_conf_reset = [6, 60, 70, 50],
          dom_circle = $(".adjust_circle"),
          dom_value = $(".adjust_show_value"),
          l_cam_conf, outX, left, top, mouseX, i, evt;
        l_dom_ptz_control_left.onmouseover = function () {
          $("#turn_left").show();
        };

        l_dom_ptz_control_left.onmouseout = function () {
          $("#turn_left").hide();
        };

        l_dom_ptz_control_up.onmouseover = function () {
          $("#turn_up").show();
        };

        l_dom_ptz_control_up.onmouseout = function () {
          $("#turn_up").hide();
        };

        l_dom_ptz_control_right.onmouseover = function () {
          $("#turn_right").show();
        };

        l_dom_ptz_control_right.onmouseout = function () {
          $("#turn_right").hide();
        };

        l_dom_ptz_control_down.onmouseover = function () {
          $("#turn_down").show();
        };

        l_dom_ptz_control_down.onmouseout = function () {
          $("#turn_down").hide();
        };
        // 此处修改mousedown/mouseup方法为click, 由于请求间隔时间过短会导致终止操作的请求失败现已经改成单次点击固定偏移量移动
        l_dom_turn_left.onclick = function () {
          _this.$api.play.play_ptz_turn({ // 摄像头转向控制
            flag: "move",
            direction: "left"
          })
        };
        // l_dom_turn_left.onmouseup = function () {
        //   _this.$api.play.play_ptz_turn({ // 摄像头转向控制
        //     flag: "stop",
        //     direction: "left"
        //   })
        // };
        l_dom_turn_up.onclick = function () {
          _this.$api.play.play_ptz_turn({ // 摄像头转向控制
            flag: "move",
            direction: "up"
          })
        };
        // l_dom_turn_up.onmouseup = function () {
        //   _this.$api.play.play_ptz_turn({ // 摄像头转向控制
        //     flag: "stop",
        //     direction: "up"
        //   })
        // };
        l_dom_turn_right.onclick = function () {
          _this.$api.play.play_ptz_turn({ // 摄像头转向控制
            flag: "move",
            direction: "right"
          })
        };
        // l_dom_turn_right.onmouseup = function () {
        //   _this.$api.play.play_ptz_turn({ // 摄像头转向控制
        //     flag: "stop",
        //     direction: "right"
        //   })
        // };
        l_dom_turn_down.onclick = function () {
          _this.$api.play.play_ptz_turn({ // 摄像头转向控制
            flag: "move",
            direction: "down"
          })
        };
        // l_dom_turn_down.onmouseup = function () {
        //   _this.$api.play.play_ptz_turn({ // 摄像头转向控制
        //     flag: "stop",
        //     direction: "down"
        //   })
        // };
        l_dom_video_off_pic.onclick = function () {
          if (l_dom_video_off_pic.className == "video_on_picture") {
            l_dom_video_off_pic.className = "video_off_picture";
            _this.$api.play.play_record({
              recording: 1,
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            })
          } else {
            l_dom_video_off_pic.className = "video_on_picture";
            _this.$api.play.play_record({
              recording: 0,
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            })
          }
        }
        l_dom_camera_off_pic.onclick = function () {
          function get_snapshot_ack (url) {
            $("#snapshot_preview_div").show();
            $("#snapshot_buffer").hide();
            _this.publicFunc.mx("#snapshot_preview_content").setAttribute("src", url);
            _this.publicFunc.mx("#snapshot_preview_content").onload = function () {
              $("#snapshot_img_page_download").show();
            }
            _this.publicFunc.mx("#snapshot_preview_url").download = new Date().getTime() + ".jpg";
            _this.publicFunc.mx("#snapshot_preview_url").setAttribute("href", url);
          }
          if (_this.$store.state.jumpPageData.selectDeviceIpc) {
            if (!_this.publicFunc.mx("#snapshot_buffer")) {
              $("#ptz_control_bottom_center").append("<div id='snapshot_buffer'><img src="+require('@/assets/device/snapshot.gif')+" style='margin-top:30%;'></div>");
            }
            _this.$api.play.play_snapshot({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => { // 调用截图接口
              get_snapshot_ack(res)
            })
          }
        }

        l_dom_ptz_control_bottom_center.ondblclick = function () {
          _this.$api.play.fullscreen()
        }
        // 鼠标点击视频中间窗口弹出菜单
        l_dom_ptz_control_bottom_center.onclick = function () {
          let is_display = 0;
          // let is_innerhtml = _this.publicFunc.mx("#play_buffer_ret").innerHTML;
          $("#play_view_control").show();
          // if (is_innerhtml) {
          is_display = $("#ptz_control_bottom").css("display") == "none" ? 0 : 1;
          if (is_display) {
            $("#ptz_control_bottom").hide();
          } else {
            $("#ptz_control_bottom").show();
          }
          // }
        }
        l_dom_snapshot_preview_close.onclick = function () {
          $("#snapshot_preview_div").hide();
        }
        let _timerflag = {};  //Resolve multiple clicks
        function delay_till_last (id, fn, wait) {
          if (_timerflag[id]) {
            window.clearTimeout(_timerflag[id]);
            delete _timerflag[id];
          }
          return _timerflag[id] = window.setTimeout(function () {
            fn();
            delete _timerflag[id];
          }, wait);
        }

        l_dom_talkback_off_pic.on('click', function () {
          let class_name = this.className;
          let that = this;
          delay_till_last('id', function () {//注意 id 是唯一的
            if (class_name == "talkback_off_picture") {
              that.className = "talkback_on_picture";
              _this.$api.play.play_speak({ // 调用对讲
                flag: 1
              })
            } else {
              that.className = "talkback_off_picture";
              _this.$api.play.play_speak({ // 调用对讲
                flag: 0
              })
            }
          }, 400);
        });

        l_dom_delete_adjust_page.onclick = function () {
          $("#adjust_setting").hide();
          l_dom_adjust_off_pic.className = "adjust_off_picture";
        }
        l_dom_adjust_off_pic.onclick = function () {
          if (l_dom_adjust_off_pic.className === "adjust_off_picture") {
            l_dom_adjust_off_pic.className = "adjust_on_picture"
            _this.$api.play.adjust_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
              adjust_get_ack(res)
            })
            $("#adjust_setting").show();
          } else {
            l_dom_adjust_off_pic.className = "adjust_off_picture";
            $("#adjust_setting").hide();
          }
          set_event();
        }
        function change_cam_mode (obj) {
          l_dom_mode_auto.style.background = "#ffffff";
          l_dom_mode_daytime.style.background = "#ffffff";
          l_dom_mode_night.style.background = "#ffffff";
          switch (obj) {
            case "auto": {
              l_dom_mode_auto.style.background = "#00a6ba";
              break;
            }
            case "day": {
              l_dom_mode_daytime.style.background = "#00a6ba";
              break;
            }
            case "night": {
              l_dom_mode_night.style.background = "#00a6ba";
              break;
            }
            default:
              l_dom_mode_auto.style.background = "#00a6ba";
          }
        }
        function change_cam_light_mode (obj) {
          l_dom_mode_white.style.background = "#ffffff";//白光
          l_dom_mode_infrared.style.background = "#ffffff";//红外
          l_dom_mode_smart.style.background = "#ffffff";//智能
          switch (obj) {
            case "white": {
              l_dom_mode_white.style.background = "#00a6ba";
              break;
            }
            case "red": {
              l_dom_mode_infrared.style.background = "#00a6ba";
              break;
            }
            case "auto": {
              l_dom_mode_smart.style.background = "#00a6ba";
              break;
            }
            default:
              l_dom_mode_auto.style.background = "#00a6ba";
          }
        }
        function adjust_get_ack (data) {
          l_cam_conf = data;
          l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
          if (l_cam_conf.day) {
            //night,white;night,auto,1;auto,2,white;auto,2,auto,1
            if ((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1)) {
              dom_in_box[0].style.width = parseInt(l_cam_conf.white_light.sharpness * 1.59) + "px";
              dom_in_box[2].style.width = parseInt(l_cam_conf.white_light.color_saturation * 1.59) + "px";
              dom_in_box[1].style.width = parseInt(l_cam_conf.white_light.contrast * 1.59) + "px";
              dom_in_box[3].style.width = parseInt(l_cam_conf.white_light.brightness * 1.59) + "px";

              dom_value[3].innerHTML = parseInt(l_cam_conf.white_light.brightness);
              dom_value[1].innerHTML = parseInt(l_cam_conf.white_light.contrast);
              dom_value[2].innerHTML = parseInt(l_cam_conf.white_light.color_saturation);
              dom_value[0].innerHTML = parseInt(l_cam_conf.white_light.sharpness);
            }
            //night,red;night,auto,0;auto,2,red;auto,2,auto,0 
            else if ((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0)) {
              dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 1.59) + "px";
              dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 1.59) + "px";
              dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 1.59) + "px";
              dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 1.59) + "px";

              dom_value[3].innerHTML = parseInt(l_cam_conf.night.brightness);
              dom_value[1].innerHTML = parseInt(l_cam_conf.night.contrast);
              dom_value[2].innerHTML = parseInt(l_cam_conf.night.color_saturation);
              dom_value[0].innerHTML = parseInt(l_cam_conf.night.sharpness);
            }
            //day;auto,1
            else if (l_cam_conf.day_night == "day" || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 1)) {
              dom_in_box[0].style.width = parseInt(l_cam_conf.day.sharpness * 1.59) + "px";
              dom_in_box[2].style.width = parseInt(l_cam_conf.day.color_saturation * 1.59) + "px";
              dom_in_box[1].style.width = parseInt(l_cam_conf.day.contrast * 1.59) + "px";
              dom_in_box[3].style.width = parseInt(l_cam_conf.day.brightness * 1.59) + "px";

              dom_value[3].innerHTML = parseInt(l_cam_conf.day.brightness);
              dom_value[1].innerHTML = parseInt(l_cam_conf.day.contrast);
              dom_value[2].innerHTML = parseInt(l_cam_conf.day.color_saturation);
              dom_value[0].innerHTML = parseInt(l_cam_conf.day.sharpness);
            }
          } else {
            dom_in_box[0].style.width = parseInt(l_cam_conf.sharpness * 1.59) + "px";
            dom_in_box[2].style.width = parseInt(l_cam_conf.color_saturation * 1.59) + "px";
            dom_in_box[1].style.width = parseInt(l_cam_conf.contrast * 1.59) + "px";
            dom_in_box[3].style.width = parseInt(l_cam_conf.brightness * 1.59) + "px";

            dom_value[3].innerHTML = parseInt(l_cam_conf.brightness);
            dom_value[1].innerHTML = parseInt(l_cam_conf.contrast);
            dom_value[2].innerHTML = parseInt(l_cam_conf.color_saturation);
            dom_value[0].innerHTML = parseInt(l_cam_conf.sharpness);
          }

          for (let j = 0; j < 4; j++) {
            dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
            dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
          }
          change_cam_mode(l_cam_conf.day_night);
          if (l_white_light) {
            change_cam_light_mode(l_cam_conf.light_mode)
          }
        }
        function set_event () {
          function getLeft (e) {
            let offset = e.offsetLeft;
            if (e.offsetParent != null) offset += getLeft(e.offsetParent);
            return offset;
          }
          dom_out_box.mousedown(function (e) {
            for (i = 0; i < 4; i++) {
              if (this == dom_out_box[i]) {
                values_flag[i] = true;
                break;
              }
            }
            evt = window.event || e;
            outX = this.offsetLeft;
            mouseX = evt.clientX - getLeft($("#adjust_setting")[0]);
            let value = mouseX - outX;
            if (value > 160) {
              dom_in_box[i].style.width = "160px";
              dom_circle[i].style.left = outX + 160 + "px";
            } else if (value <= 0) {
              dom_in_box[i].style.width = "0";
              dom_circle[i].style.left = outX + "px";
            } else {
              dom_in_box[i].style.width = value + "px";
              dom_circle[i].style.left = mouseX + "px";
            }
            dom_value[i].style.display = "block";
            dom_value[i].innerHTML = parseInt(dom_in_box[i].offsetWidth / 1.6);
          });
          document.onmousemove = (function (e) {
            evt = window.event || e;
            if (values_flag[0] || values_flag[1] || values_flag[2] || values_flag[3]) {
              mouseX = evt.clientX - getLeft($("#adjust_setting")[0]);
              let value = mouseX - outX;
              //  console.log(mouseX)
              if (value > 160) {
                dom_in_box[i].style.width = "160px";
                dom_circle[i].style.left = outX + 160 + "px";
              } else if (value <= 0) {
                dom_in_box[i].style.width = "0";
                dom_circle[i].style.left = outX + "px";
              } else {
                dom_in_box[i].style.width = value + "px";
                dom_circle[i].style.left = mouseX + "px";
              }
              dom_value[i].innerHTML = parseInt(dom_in_box[i].offsetWidth / 1.59);
            }
          });
          document.onmouseup = (function (e) {
            if (values_flag[0] || values_flag[1] || values_flag[2] || values_flag[3]) {
              if (l_cam_conf.day) {
                //night,white;night,auto,1;auto,2,white;auto,2,auto,1
                if ((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1)) {
                  l_cam_conf.is_white_light = l_white_light;
                  l_cam_conf.white_light.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
                  l_cam_conf.white_light.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
                  l_cam_conf.white_light.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
                  l_cam_conf.white_light.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);
                }
                //night,red;night,auto,0;auto,2,red;auto,2,auto,0 
                else if ((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0)) {
                  l_cam_conf.night.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
                  l_cam_conf.night.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
                  l_cam_conf.night.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
                  l_cam_conf.night.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);
                }
                //day;auto,1
                else if (l_cam_conf.day_night == "day" || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 1)) {
                  l_cam_conf.day.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
                  l_cam_conf.day.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
                  l_cam_conf.day.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
                  l_cam_conf.day.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);
                }
              } else {
                l_cam_conf.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
                l_cam_conf.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
                l_cam_conf.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
                l_cam_conf.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);
              }
              _this.$api.play.adjust_set({ conf: l_cam_conf });
              values_flag = [false, false, false, false];
            }
          });
          l_dom_mode_night.onclick = function () {
            l_dom_adjust_mode_night.click();
          }
          l_dom_mode_auto.onclick = function () {
            l_dom_adjust_mode_auto.click();
          }
          l_dom_mode_daytime.onclick = function () {
            l_dom_adjust_mode_daytime.click();
          }
          if (l_dom_mode_white) {
            l_dom_mode_white.onclick = function () {
              l_dom_adjust_mode_white.click();
            }
            l_dom_mode_infrared.onclick = function () {
              l_dom_adjust_mode_infrared.click();
            }
            l_dom_mode_smart.onclick = function () {
              l_dom_adjust_mode_smart.click();
            }
          }

          l_dom_adjust_mode_auto.onclick = function () {
            let sharpness = l_cam_conf.sharpness;
            let color_saturation = l_cam_conf.color_saturation;
            let contrast = l_cam_conf.contrast;
            let brightness = l_cam_conf.brightness;
            if (l_cam_conf.day) {
              if (l_cam_conf.day_or_night == 1 || !l_cam_conf.day_or_night) {
                sharpness = l_cam_conf.day.sharpness;
                color_saturation = l_cam_conf.day.color_saturation;
                contrast = l_cam_conf.day.contrast;
                brightness = l_cam_conf.day.brightness;
              } else if (l_cam_conf.day_or_night == 2) {
                if (l_cam_conf.red_or_white == 0) {
                  sharpness = l_cam_conf.night.sharpness;
                  color_saturation = l_cam_conf.night.color_saturation;
                  contrast = l_cam_conf.night.contrast;
                  brightness = l_cam_conf.night.brightness;
                } else if (l_cam_conf.red_or_white == 1) {
                  sharpness = l_cam_conf.white_light.sharpness;
                  color_saturation = l_cam_conf.white_light.color_saturation;
                  contrast = l_cam_conf.white_light.contrast;
                  brightness = l_cam_conf.niwhite_lightght.brightness;
                }
              }
            }

            dom_in_box[0].style.width = parseInt(sharpness * 1.59) + "px";
            dom_in_box[2].style.width = parseInt(color_saturation * 1.59) + "px";
            dom_in_box[1].style.width = parseInt(contrast * 1.59) + "px";
            dom_in_box[3].style.width = parseInt(brightness * 1.59) + "px";


            dom_value[3].innerHTML = parseInt(brightness);
            dom_value[1].innerHTML = parseInt(contrast);
            dom_value[2].innerHTML = parseInt(color_saturation);
            dom_value[0].innerHTML = parseInt(sharpness);
            for (let j = 0; j < 4; j++) {

              dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
              dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
            }
            change_cam_mode("auto");
            l_cam_conf.day_night = "auto";
            l_cam_conf.is_white_light = l_white_light;
            l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            _this.$api.play.adjust_set({ conf: l_cam_conf })
          };

          l_dom_adjust_mode_daytime.onclick = function () {
            if (l_cam_conf.day) {
              dom_in_box[0].style.width = parseInt(l_cam_conf.day.sharpness * 1.59) + "px";
              dom_in_box[2].style.width = parseInt(l_cam_conf.day.color_saturation * 1.59) + "px";
              dom_in_box[1].style.width = parseInt(l_cam_conf.day.contrast * 1.59) + "px";
              dom_in_box[3].style.width = parseInt(l_cam_conf.day.brightness * 1.59) + "px";

              dom_value[3].innerHTML = parseInt(l_cam_conf.day.brightness);
              dom_value[1].innerHTML = parseInt(l_cam_conf.day.contrast);
              dom_value[2].innerHTML = parseInt(l_cam_conf.day.color_saturation);
              dom_value[0].innerHTML = parseInt(l_cam_conf.day.sharpness);
            }
            for (let j = 0; j < 4; j++) {
              dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
              dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
            }
            change_cam_mode("day");
            l_cam_conf.day_night = "day";
            l_cam_conf.is_white_light = l_white_light;
            _this.$api.play.adjust_set({ conf: l_cam_conf })
          };

          l_dom_adjust_mode_night.onclick = function () {
            if ((l_cam_conf.night && l_cam_conf.light_mode == "red") || (l_cam_conf.night && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0)) {
              dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 1.59) + "px";
              dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 1.59) + "px";
              dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 1.59) + "px";
              dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 1.59) + "px";

              dom_value[3].innerHTML = parseInt(l_cam_conf.night.brightness);
              dom_value[1].innerHTML = parseInt(l_cam_conf.night.contrast);
              dom_value[2].innerHTML = parseInt(l_cam_conf.night.color_saturation);
              dom_value[0].innerHTML = parseInt(l_cam_conf.night.sharpness);
            } else if ((l_cam_conf.night && l_cam_conf.light_mode == "white") || (l_cam_conf.night && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1)) {
              dom_in_box[0].style.width = parseInt(l_cam_conf.white_light.sharpness * 1.59) + "px";
              dom_in_box[2].style.width = parseInt(l_cam_conf.white_light.color_saturation * 1.59) + "px";
              dom_in_box[1].style.width = parseInt(l_cam_conf.white_light.contrast * 1.59) + "px";
              dom_in_box[3].style.width = parseInt(l_cam_conf.white_light.brightness * 1.59) + "px";

              dom_value[3].innerHTML = parseInt(l_cam_conf.white_light.brightness);
              dom_value[1].innerHTML = parseInt(l_cam_conf.white_light.contrast);
              dom_value[2].innerHTML = parseInt(l_cam_conf.white_light.color_saturation);
              dom_value[0].innerHTML = parseInt(l_cam_conf.white_light.sharpness);
            }

            for (let j = 0; j < 4; j++) {
              dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
              dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
            }
            change_cam_mode("night");
            l_cam_conf.day_night = "night";
            l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            l_cam_conf.is_white_light = l_white_light;
            _this.$api.play.adjust_set({ conf: l_cam_conf })
          };

          if (l_dom_adjust_mode_white) {
            l_dom_adjust_mode_white.onclick = function () {//白光
              if (l_cam_conf.day_night == "night") {
                if (l_cam_conf.white_light) {
                  dom_in_box[0].style.width = parseInt(l_cam_conf.white_light.sharpness * 1.59) + "px";
                  dom_in_box[2].style.width = parseInt(l_cam_conf.white_light.color_saturation * 1.59) + "px";
                  dom_in_box[1].style.width = parseInt(l_cam_conf.white_light.contrast * 1.59) + "px";
                  dom_in_box[3].style.width = parseInt(l_cam_conf.white_light.brightness * 1.59) + "px";

                  dom_value[3].innerHTML = parseInt(l_cam_conf.white_light.brightness);
                  dom_value[1].innerHTML = parseInt(l_cam_conf.white_light.contrast);
                  dom_value[2].innerHTML = parseInt(l_cam_conf.white_light.color_saturation);
                  dom_value[0].innerHTML = parseInt(l_cam_conf.white_light.sharpness);
                }

                for (var j = 0; j < 4; j++) {
                  dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                  dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                }
              }
              l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              l_cam_conf.is_white_light = l_white_light;
              change_cam_light_mode("white");
              l_cam_conf.light_mode = "white";
              _this.$api.play.adjust_set({ conf: l_cam_conf })
            };
            l_dom_adjust_mode_infrared.onclick = function () {//红外
              if (l_cam_conf.day_night == "night") {
                if (l_cam_conf.night) {
                  dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 1.59) + "px";
                  dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 1.59) + "px";
                  dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 1.59) + "px";
                  dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 1.59) + "px";

                  dom_value[3].innerHTML = parseInt(l_cam_conf.night.brightness);
                  dom_value[1].innerHTML = parseInt(l_cam_conf.night.contrast);
                  dom_value[2].innerHTML = parseInt(l_cam_conf.night.color_saturation);
                  dom_value[0].innerHTML = parseInt(l_cam_conf.night.sharpness);
                }

                for (var j = 0; j < 4; j++) {
                  dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                  dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                }
              }
              l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              l_cam_conf.is_white_light = l_white_light;
              change_cam_light_mode("red");
              l_cam_conf.light_mode = "red";
              _this.$api.play.adjust_set({ conf: l_cam_conf })
            };
            l_dom_adjust_mode_smart.onclick = function () {//智能
              if (l_cam_conf.day_night == "night") {
                var sharpness = l_cam_conf.sharpness;
                var color_saturation = l_cam_conf.color_saturation;
                var contrast = l_cam_conf.contrast;
                var brightness = l_cam_conf.brightness;
                if (l_cam_conf.night) {
                  if (l_cam_conf.red_or_white == 0) {
                    sharpness = l_cam_conf.night.sharpness;
                    color_saturation = l_cam_conf.night.color_saturation;
                    contrast = l_cam_conf.night.contrast;
                    brightness = l_cam_conf.night.brightness;
                  } else if (l_cam_conf.red_or_white == 1) {
                    sharpness = l_cam_conf.white_light.sharpness;
                    color_saturation = l_cam_conf.white_light.color_saturation;
                    contrast = l_cam_conf.white_light.contrast;
                    brightness = l_cam_conf.white_light.brightness;
                  }
                  dom_in_box[0].style.width = parseInt(sharpness * 1.59) + "px";
                  dom_in_box[2].style.width = parseInt(color_saturation * 1.59) + "px";
                  dom_in_box[1].style.width = parseInt(contrast * 1.59) + "px";
                  dom_in_box[3].style.width = parseInt(brightness * 1.59) + "px";

                  dom_value[3].innerHTML = parseInt(brightness);
                  dom_value[1].innerHTML = parseInt(contrast);
                  dom_value[2].innerHTML = parseInt(color_saturation);
                  dom_value[0].innerHTML = parseInt(sharpness);
                }

                for (var j = 0; j < 4; j++) {
                  dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                  dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                }
              }
              l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              l_cam_conf.is_white_light = l_white_light;
              change_cam_light_mode("auto");
              l_cam_conf.light_mode = "auto";
              _this.$api.play.adjust_set({ conf: l_cam_conf })
            };
          }

          l_dom_adjust_reset.onclick = function () {
            for (var i = 0; i < 4; i++) {
              dom_in_box[i].style.width = l_cam_conf_reset[i] * 1.6 + "px";
              dom_circle[i].style.left = dom_out_box[i].offsetLeft + dom_in_box[i].offsetWidth + "px";
              //  console.log(dom_in_box[i].style.width)
            }
            change_cam_mode("auto");
            if (l_white_light) {
              change_cam_light_mode("auto")
            }
            if (l_cam_conf.day) {
              l_cam_conf.day.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
              l_cam_conf.day.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
              l_cam_conf.day.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
              l_cam_conf.day.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);

              l_cam_conf.night.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
              l_cam_conf.night.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
              l_cam_conf.night.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
              l_cam_conf.night.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);
              if (l_cam_conf.white_light) {
                l_cam_conf.is_white_light = l_white_light;
                l_cam_conf.white_light.sharpness = parseInt(dom_in_box[0].offsetWidth / 1.59);
                l_cam_conf.white_light.contrast = parseInt(dom_in_box[1].offsetWidth / 1.59);
                l_cam_conf.white_light.color_saturation = parseInt(dom_in_box[2].offsetWidth / 1.59);
                l_cam_conf.white_light.brightness = parseInt(dom_in_box[3].offsetWidth / 1.59);
              }
            } else {
              l_cam_conf.sharpness = l_cam_conf_reset[0];
              l_cam_conf.color_saturation = l_cam_conf_reset[2];
              l_cam_conf.contrast = l_cam_conf_reset[1];
              l_cam_conf.brightness = l_cam_conf_reset[3];
            }
            dom_value[3].innerHTML = l_cam_conf_reset[3];
            dom_value[2].innerHTML = l_cam_conf_reset[2];
            dom_value[1].innerHTML = l_cam_conf_reset[1];
            dom_value[0].innerHTML = l_cam_conf_reset[0];
            l_cam_conf.day_night = "auto";
            l_cam_conf.light_mode = "auto";
            _this.$api.play.adjust_set({ conf: l_cam_conf })
          };
        }
      }
      function play_speed (data) {
        _this.publicFunc.mx("#play_buffer_ret").innerHTML = data;
        window.onresize = function () {
          l_dom_play_view_control.style.left = l_dom_play_view.offsetLeft + "px";
          l_dom_play_view_control.style.top = l_play_view_top + "px";
        }
      }
      function create_preview (data) {
        let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
        data.parent.innerHTML =
          "<div id='play_view_box'>"
          + "<div id='play_pause_pic'></div>"
          + "</div>"
        if (_this.$store.state.jumpPageData.localFlag) {
          _this.$api.play.play_preview_img({ addr: obj.addr, dom: $("#play_screen"), sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
        } else {
          if (obj.box_ipc == 1) {
            let pic_token = obj.ipc_sn + "_p3_" + Math.pow(2, 31) + "_" + Math.pow(2, 31);
            _this.$api.play.play_preview_img({ dom: $("#play_screen"), sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: pic_token })
          } else {
            _this.$api.play.play_preview_img({ dom: $("#play_screen"), sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
          }
        }
        l_dom_play_view_box = _this.publicFunc.mx("#play_view_box");
        l_dom_play_view_box.onclick = function () {
          profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
          is_playing = 1;
          if (_this.$store.state.jumpPageData.localFlag) {
            local_play_data.profile_token = profile_token;
            local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            msdk_ctrl({ type: "local_play", data: local_play_data });
          } else {
            if (obj.box_ipc === 1) {
              // 调用播放接口
              _this.$api.play.play({
                dom: $("#play_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                profile_token: "p0_" + obj.ipc_sn
              }).then(res => {
                play_speed(res)
              })
            } else {
              // 调用播放接口
              _this.$api.play.play({
                dom: $("#play_screen"),
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                profile_token: profile_token
              }).then(res => {
                play_speed(res)
              })
            }
          }
          $("#video_play").attr("class", "video_play_start");
          $("#play_view_control").show();
        }
      }
      // ********** 设置设备的时区是校验时间是否与当前系统时间相符 ********** //
      function time_alert () {
        let nowDate = new Date()
        _this.$api.devlist.time_get({ // 获取选中时区的时间
          sn: _this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res => {
          l_dev_time_get_ack(res)
        })
        function l_dev_time_get_ack (data) {
          if (data.day === nowDate.getDate() && data.hour === nowDate.getHours() && data.min === nowDate.getMinutes()) {
            _this.$api.play.set_date_time({ // 调用设置时间
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              type: _this.publicFunc.mx("#checkbox_auto_sync").checked ? "NTP" : "manually",
              timezone: l_dom_time_zone_selevt.value,
              hour: l_dom_input_hour.value,
              min: l_dom_input_minute.value,
              sec: l_dom_input_second.value,
              year: l_dom_input_year.value,
              mon: l_dom_input_month.value,
              day: l_dom_input_day.value,
              auto_sync: Number(_this.publicFunc.mx("#checkbox_auto_sync").checked),
              ntp_addr: l_dom_ntp.value
            }).then(res => {
              set_result(res)
            })
          } else {
            _this.publicFunc.delete_tips({ content: "您当前的时间与设置的时间不符确定要设置吗?", func: device_set_time }); // 时间设定询问窗
          }
          function device_set_time () { // 设置时间询问框回调
            _this.$api.play.set_date_time({ // 调用设置时间
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              type: _this.publicFunc.mx("#checkbox_auto_sync").checked ? "NTP" : "manually",
              timezone: l_dom_time_zone_selevt.value,
              hour: l_dom_input_hour.value,
              min: l_dom_input_minute.value,
              sec: l_dom_input_second.value,
              year: l_dom_input_year.value,
              mon: l_dom_input_month.value,
              day: l_dom_input_day.value,
              auto_sync: Number(_this.publicFunc.mx("#checkbox_auto_sync").checked),
              ntp_addr: l_dom_ntp.value,
            }).then(res => {
              set_result(res)
            })
          }
        }
      }
      // 调用时区提示功能 后续添加修改暂时注释不做调用
      // time_alert()
      // ********** 设置设备的时区是校验时间是否与当前系统时间相符 ********** //
      window.onresize = function () {
        l_dom_play_view_control.style.left = l_dom_play_view.offsetLeft + "px";
        l_dom_play_view_control.style.top = l_play_view_top + "px";
      }
      $(window).scroll(function () { })
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    } else {
      pageData = { parent: $("#" + this.$route.name) }
    }
    // console.log(pageData,"pageData")
    await this.vimtagPlay(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    this.publicFunc.projectReload.call(this);
  }
}
</script>