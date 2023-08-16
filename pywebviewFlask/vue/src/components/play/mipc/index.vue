<template>
  <div id="play"></div>
</template>
<script>
import languageSelect from '../../../lib/exportModule/languageSelect.js'
export default {
  methods: {
    mipcPlay(obj) {
        let _this = this;
        let l_dom_delete_adjust_page,
            l_dom_adjust_mode_night,
            l_dom_adjust_mode_daytime,
            l_dom_adjust_mode_auto,
            l_dom_adjust_reset,
            l_dom_ptz_control_left,
            l_dom_ptz_control_right,
            l_dom_ptz_control_up,
            l_dom_ptz_control_down,
            l_dom_ptz_control_center,
            l_dom_mipc_ptz_control,
            l_dom_play_view_width,
            l_dom_play_view_height,
            l_dom_play_view_top,
            l_dom_play_view_left,
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
            l_white_light,
            l_dom_mode_light,//白光
            l_dom_adjust_mode_light,
            // support_1080p=-1,
            support_1080p = "",
            is_playing = 0;
        if (_this.$store.state.jumpPageData.localFlag) {
            // console.log("本地")
        } else {
            // console.log("非本地")
        }
        obj.parent.html("<div id='play_box'>"
            + "<div id='page_top_menu'>"
            + "<div id='play_top_menu'>"
            + "<div id='enter_history' class='play_top_menu_li'><div id='enter_history_img'></div><div id='enter_history_txt'>" + mcs_playback + "</div></div>"
            + "<div id='enter_set' class='play_top_menu_li'><div id='enter_set_img'></div><div id='enter_set_txt'>" + mcs_settings + "</div></div>"
            + "</div>"
            + "</div>"
            + "<div id='play_view'>"
            + "<div id='play_buffer_ret'></div>"
            + "<div id='play_screen'></div>"
            + "<div id='play_menu_box'></div>"
            + "<div id='play_view_control'></div>"
            + "</div>"
            + "</div>"
            + "<div id='snapshot_preview_div'>"
            + "<div id='snapshot_preview_inner'>"
            + "<a id='snapshot_preview_url'><img id='snapshot_preview_content'></a>"
            + "</div>"
            + "<div id='snapshot_preview_close'></div>"
            + "</div>")
        let local_play_data = {};
        local_play_data.addr = obj.addr;
        local_play_data.password = sessionStorage.getItem("pass_" + _this.$store.state.jumpPageData.selectDeviceIpc);
        local_play_data.dom = _this.publicFunc.mx("#play_screen");
        local_play_data.profile_token = "p0";
        local_play_data.func = function (msg) { _this.publicFunc.msg_tips({ msg: msg, type: "error", timeout: 3000 }) };
        let l_dom_play_view_control = _this.publicFunc.mx("#play_view_control");
        let l_dom_snapshot_preview_close = _this.publicFunc.mx("#snapshot_preview_close");
        let l_dom_page_top_menu = _this.publicFunc.mx("#page_top_menu");
        let l_dom_play_box = _this.publicFunc.mx("#play_box");
        let l_dom_device_list_sidebar_up = _this.publicFunc.mx("#device_list_sidebar_up");
        let l_dom_play_menu_box = _this.publicFunc.mx("#play_menu_box");
        let l_dom_play_view = _this.publicFunc.mx("#play_view");
        let l_dom_play_screen = _this.publicFunc.mx("#play_screen");
        let l_dom_device_list_sidebar_center = _this.publicFunc.mx("#device_list_sidebar_center");
        let l_dom_play_buffer_ret = _this.publicFunc.mx("#play_buffer_ret");
        let l_play_box_width = l_dom_play_box.offsetWidth;
        let l_dev_main_left = _this.publicFunc.mx("#dev_main_left");
        let l_height = _this.publicFunc.mx("#top").offsetWidth * 0.4 + 11;
        let l_play_menu_box_height = l_dom_play_menu_box.offsetHeight - 1;
        let l_play_view_top = l_dom_play_view.offsetTop;
        let l_dom_play_box_width = document.body.clientWidth - l_dev_main_left.offsetWidth - 60;
        l_dom_play_box.style.width = l_dom_play_box_width + "px";
        l_dom_play_view.style.height = l_height + "px";
        l_dom_play_screen.style.height = (l_dom_play_box_width * 0.563) + "px";
        _this.$api.set.dev_info({ //ms.send_msg("dev_info_get"
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            l_white_light = res.white_light;
            play_menu_control({ parent: l_dom_play_menu_box });
            get_definition();
          })
        play_view_control({ parent: l_dom_play_view_control });
        create_preview({ parent: l_dom_play_screen });

        function play_menu_control(data) {
            let g_text = "";
            if (l_white_light == 1) {
                g_text =
                "<div class='adjust_line'>"
                + "<div class='adjust_cha'>" + mcs_light_mode + "</div>"
                + "<div class='adjust_mode'>"
                + "<div id='adjust_mode_smart_light' class='mode_cha'>" + mcs_light_smart + "</div>"
                + "<div id='adjust_mode_infrared_light' class='mode_cha'>" + mcs_light_infrared + "</div>"
                + "<div id='adjust_mode_white_light' class='mode_cha'>" + mcs_light_white + "</div>"
                + "</div>"
                + "</div>"
            }
            data.parent.innerHTML =
                "<div id='play_menu_left'>"
                + "<div id='video_play' class='video_play_stop'></div>"
                + "<div class='enter_nav_left'></div>"
                + "<div id='video_off_pic' class='video_off_picture' style='display:none'></div>"
                + "<div id='camera_off_pic' class='camera_off_picture'></div>"
                + "<div id='talkback_off_pic' class='talkback_off_picture'></div>"
                + "<div id='adjust_off_pic' class='adjust_off_picture'></div>"
                + "</div>"
                + "<div id='full_screen' style='display:none;'></div>"
                + "<div class='enter_nav' style='display:none;'></div>"
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
                + "<div id='voice_close' class='voice_close_close'></div>"
                + "<div id='enter_set_img' style='display:none;'></div>"
                + "<div class='enter_nav' style='display:none;'></div>"
                + "<div id='enter_history_img' style='display:none;'></div>"
                + "</div>"
                + "<div id='adjust_setting'>"
                + "<div id='delete_adjust_page' class='delete_adjust_page'>×</div>"
                + "<div class='adjust_line' style='padding-top:35px;'>"
                + "<div class='adjust_cha'>" + mcs_sharpness + "</div>"
                + "<div class='adjust_cha_right'>"
                + "<div class = 'adjust_out_box'>"
                + "<div class = 'adjust_in_box'></div>"
                + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "<div class='adjust_line'>"
                + "<div class='adjust_cha'>" + mcs_contrast + "</div>"
                + "<div class='adjust_cha_right'>"
                + "<div class = 'adjust_out_box'>"
                + "<div class = 'adjust_in_box'></div>"
                + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "<div class='adjust_line'>"
                + "<div class='adjust_cha'>" + mcs_color_saturation + "</div>"
                + "<div class='adjust_cha_right'>"
                + "<div class = 'adjust_out_box'>"
                + "<div class = 'adjust_in_box'></div>"
                + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "<div class='adjust_line'>"
                + "<div class='adjust_cha'>" + mcs_brightness + "</div>"
                + "<div class='adjust_cha_right'>"
                + "<div class = 'adjust_out_box'>"
                + "<div class = 'adjust_in_box'></div>"
                + "<div class = 'adjust_circle' style='margin-top:-5px;'></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "<div class='adjust_line'>"
                + "<div class='adjust_cha'>" + mcs_mode + "</div>"
                + "<div class='adjust_mode'>"
                + "<div id='adjust_mode_auto' class='mode_cha'>" + mcs_auto + "</div>"
                + "<div id='adjust_mode_daytime' class='mode_cha'>" + mcs_daytime + "</div>"
                + "<div id='adjust_mode_night' class='mode_cha'>" + mcs_night + "</div>"
                + "</div>"
                + "</div>"
                + g_text
                + "<div id='adjust_reset'>" + mcs_reset + "</div>"
                + "</div>";
            if (_this.$store.state.jumpPageData.experienceFlag) {
                $("#enter_set").hide();
            }
            // get_definition();
            l_dom_video_play = _this.publicFunc.mx("#video_play");
            let l_dom_high_definition = _this.publicFunc.mx("#high_definition");
            let l_dom_standard_definition = _this.publicFunc.mx("#standard_definition");
            let l_dom_fluency_definition = _this.publicFunc.mx("#fluency_definition");
            let l_dom_auto_definition = _this.publicFunc.mx("#auto_definition");
            let l_dom_resolute_choice = _this.publicFunc.mx("#resolute_choice");
            let l_dom_choice_play_definition = _this.publicFunc.mx("#choice_play_definition");
            let l_dom_enter_set_img = _this.publicFunc.mx("#enter_set_img");
            let l_dom_enter_set = _this.publicFunc.mx("#enter_set");
            let l_dom_enter_history_img = _this.publicFunc.mx("#enter_history_img");
            let l_dom_enter_history = _this.publicFunc.mx("#enter_history");
            let l_dom_voice_close_open = _this.publicFunc.mx("#voice_close");
            let l_dom_full_screen = _this.publicFunc.mx("#full_screen");
            let l_dom_video_off_pic = _this.publicFunc.mx("#video_off_pic");
            let l_dom_camera_off_pic = _this.publicFunc.mx("#camera_off_pic");
            let l_dom_talkback_off_pic = _this.publicFunc.mx("#talkback_off_pic");
            let l_dom_adjust_off_pic = _this.publicFunc.mx("#adjust_off_pic");
            let l_dom_delete_adjust_page = _this.publicFunc.mx("#delete_adjust_page");
            let l_dom_adjust_mode_night = _this.publicFunc.mx("#adjust_mode_night");
            let l_dom_adjust_mode_daytime = _this.publicFunc.mx("#adjust_mode_daytime");
            let l_dom_adjust_mode_auto = _this.publicFunc.mx("#adjust_mode_auto");
            let l_dom_adjust_mode_white_light = _this.publicFunc.mx("#adjust_mode_white_light");
            let l_dom_adjust_mode_infrared_light = _this.publicFunc.mx("#adjust_mode_infrared_light");
            let l_dom_adjust_mode_smart_light = _this.publicFunc.mx("#adjust_mode_smart_light");
            let l_dom_adjust_reset = _this.publicFunc.mx("#adjust_reset");
            let l_top = l_dom_resolute_choice.offsetTop - 113;
            l_dom_choice_play_definition.style.top = l_top + "px";

            // 全屏和声音控制按钮浏览器端不支持
            l_dom_full_screen.style.display = 'none'
            l_dom_voice_close_open.style.display = 'none'

            let l_dom_definition_cha = _this.publicFunc.mx(".definition_cha")
            if (_this.$store.state.user.userLanguage === 'vi') {
                for (let i = 0; i < l_dom_definition_cha.length; i++) {
                    l_dom_definition_cha[i].style.width = 78 + 'px'
                }
            }
            let dom_left = $(".left_button")[0],
                dom_center = $(".center_button")[0],
                dom_right = $(".right_button")[0],
                dom_out_box = $(".adjust_out_box"),
                dom_in_box = $(".adjust_in_box"),
                values_flag = [false, false, false, false],
                l_cam_conf_reset = [6, 60, 70, 50],//锐度，对比度，饱和度，亮度
                dom_circle = $(".adjust_circle"),
                l_cam_conf, outX, left, top, mouseX, i, evt;
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
                        msdk_ctrl({ type: "local_device_play", data: local_play_data });
                    } else {
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
                        msdk_ctrl({ type: "local_device_play", data: local_play_data });
                    } else {
                        _this.$api.play.play({
                            dom: $("#play_screen"),
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            profile_token: "p1"
                        }).then(res => {
                            play_speed(res)
                        })
                    }
                }
            };
            l_dom_high_definition.onclick = function () {
                $("#choice_play_definition").hide();
                sessionStorage.setItem("PlayProfile", "p0");
                if (_this.$store.state.jumpPageData.projectName == "vsmahome") {
                    $("#resolute_choice").text(mcs_new_hd);
                } else {
                    // if(support_1080p==-1){  
                    //    $("#resolute_choice").text(mcs_new_hd); 
                    //    }else if(support_1080p==0){
                    //     $("#resolute_choice").text("720P");
                    // }else if(support_1080p==1){
                    //     $("#resolute_choice").text("1080P");
                    // }else if(support_1080p==2){
                    //     $("#resolute_choice").text("960P");
                    // }else if(support_1080p==3){
                    // $("#resolute_choice").text("3MP");
                    //    }else if(support_1080p==4){
                    // $("#resolute_choice").text("4MP");
                    //    }
                    $("#resolute_choice").text(support_1080p);
                }
                if (is_playing) {
                    if (_this.$store.state.jumpPageData.localFlag) {
                        local_play_data.profile_token = "p0";
                        local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                        msdk_ctrl({ type: "local_device_play", data: local_play_data });
                    } else {
                        _this.$api.play.play({
                            dom: $("#play_screen"),
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            profile_token: "p0"
                        }).then(res => {
                            play_speed(res)
                        })
                    }
                }
            };
            l_dom_full_screen.onclick = function () {
                _this.$api.play.fullscreen()
            }
            l_dom_enter_set.onclick = function () {
                _this.publicFunc.showBufferPage()
                _this.$api.set.dev_info({
                    sn: _this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                    _this.publicFunc.closeBufferPage()
                    let jumpData;
                    if (res.result == "") {
                        if (res.fisheye) {
                            jumpData = { parent: $("#page"), back_page: "play", type: 5, addr: obj.addr, web_name: "mipc" };
                            // createPage("set", { parent: $("#page"), back_page: "play", type: 5, addr: obj.addr, web_name: "mipc" });
                            _this.$router.push({name:'set',params:jumpData})
                        } else if (res.oscene) {
                            jumpData = { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "mipc" };
                            // createPage("set", { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "mipc" });
                            _this.$router.push({name:'set',params:jumpData})
                        } else {
                            jumpData = { parent: $("#page"), back_page: "play", type: 3, addr: obj.addr, web_name: "mipc" };
                            // createPage("set", { parent: $("#page"), back_page: "play", type: 3, addr: obj.addr, web_name: "mipc" });
                            _this.$router.push({name:'set',params:jumpData})
                        }
                    } else {
                        jumpData = { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "mipc" };
                        // createPage("set", { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: "mipc" });
                        _this.$router.push({name:'set',params:jumpData})
                    }
                })
            }

            l_dom_enter_history.onclick = function () {
                let jumpData = { parent: $("#dev_main_page"), dev_sn: _this.$store.state.jumpPageData.selectDeviceIpc, back_page: "playpage" };
                // createPage("history", { parent: $("#dev_main_page"), dev_sn: _this.$store.state.jumpPageData.selectDeviceIpc, back_page: "playpage" })
                _this.$router.push({name:'history',params:jumpData})
            }
            l_dom_video_play.onclick = function () {
                let class_name = this.className;
                if (class_name == "video_play_stop") {
                    is_playing = 1;
                    let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
                    if (_this.$store.state.jumpPageData.localFlag) {
                        local_play_data.profile_token = profile_token;
                        local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                        msdk_ctrl({ type: "local_device_play", data: local_play_data });
                    } else {
                        _this.$api.play.play({
                            dom: $("#play_screen"),
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            profile_token: profile_token
                        }).then(res => {
                            play_speed(res)
                        })
                    }
                    $("#play_view_control").show();
                    this.className = "video_play_start";
                } else if (class_name == "video_play_start") {
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
            l_dom_voice_close_open.onclick = function () {
                let class_name = this.className;
                if (class_name == "voice_close_close") {
                    _this.$api.play.voice({ flag: 0 })
                    l_dom_voice_close_open.className = "voice_close_open";
                } else {
                    _this.$api.play.voice({ flag: 1 })
                    l_dom_voice_close_open.className = "voice_close_close";
                }
            };
            l_dom_video_off_pic.onclick = function () {
                if (l_dom_video_off_pic.className == "video_on_picture") {
                    l_dom_video_off_pic.className = "video_off_picture";
                    _this.$api.play.play_record({
                        recording: 1,
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc
                    })
                }
                else {
                    l_dom_video_off_pic.className = "video_on_picture";
                    _this.$api.play.play_record({
                        recording: 0,
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc
                    })
                }
            }
            l_dom_resolute_choice.onclick = function () {
                let is_show = $(l_dom_choice_play_definition).css("display");
                if (is_show == "none") {
                    $("#choice_play_definition").show();
                } else {
                    $("#choice_play_definition").hide();
                }
            }
            l_dom_camera_off_pic.onclick = function () {
                function get_snapshot_ack(url) {
                    $("#snapshot_preview_div").show();
                    $("#snapshot_buffer").hide();
                    _this.publicFunc.mx("#snapshot_preview_content").setAttribute("src", url);
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
            l_dom_snapshot_preview_close.onclick = function () {
                $("#snapshot_preview_div").hide();
            }
            if (window.fujikam == "fujikam") {
                l_dom_voice_close_open.style.display = 'block'
                l_dom_talkback_off_pic.onclick = function () {
                    let class_name = this.className;
                    if (class_name == "talkback_off_picture") {
                        this.className = "talkback_on_picture";
                        _this.$api.play.play_speak({ // 调用对讲
                            flag: 1
                        })
                    } else {
                        this.className = "talkback_off_picture";
                        _this.$api.play.play_speak({ // 调用对讲
                            flag: 0
                        })
                    }
                }
            }

            l_dom_delete_adjust_page.onclick = function () {
                $("#adjust_setting").hide();
                l_dom_adjust_off_pic.className = "adjust_off_picture";
            }
            l_dom_adjust_off_pic.onclick = function () {
                if (l_dom_adjust_off_pic.className == "adjust_off_picture") {
                    l_dom_adjust_off_pic.className = "adjust_on_picture";
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
            function change_cam_mode(obj) {
                switch (obj) {
                    case "auto":
                        {
                            l_dom_adjust_mode_auto.className = "mode_cha_active";
                            l_dom_adjust_mode_daytime.className = "mode_cha";
                            l_dom_adjust_mode_night.className = "mode_cha";
                            break;
                        }
                    case "day":
                        {
                            l_dom_adjust_mode_auto.className = "mode_cha";
                            l_dom_adjust_mode_daytime.className = "mode_cha_active";
                            l_dom_adjust_mode_night.className = "mode_cha";
                            break;
                        }
                    case "night":
                        {
                            l_dom_adjust_mode_auto.className = "mode_cha";
                            l_dom_adjust_mode_daytime.className = "mode_cha";
                            l_dom_adjust_mode_night.className = "mode_cha_active";
                            break;
                        }
                    default:
                        l_dom_adjust_mode_auto.className = "mode_cha_active";
                        l_dom_adjust_mode_daytime.className = "mode_cha";
                        l_dom_adjust_mode_night.className = "mode_cha";
                }
            }
            function change_cam_light_mode(obj) {
                switch (obj) {
                    case "red":
                        {
                            l_dom_adjust_mode_infrared_light.className = "mode_cha_active";
                            l_dom_adjust_mode_white_light.className = "mode_cha";
                            l_dom_adjust_mode_smart_light.className = "mode_cha";
                            break;
                        }
                    case "smart":
                        {
                            l_dom_adjust_mode_infrared_light.className = "mode_cha";
                            l_dom_adjust_mode_white_light.className = "mode_cha";
                            l_dom_adjust_mode_smart_light.className = "mode_cha_active";
                            break;
                        }
                    case "white":
                        {
                            l_dom_adjust_mode_infrared_light.className = "mode_cha";
                            l_dom_adjust_mode_white_light.className = "mode_cha_active";
                            l_dom_adjust_mode_smart_light.className = "mode_cha";
                            break;
                        }
                    default:
                        l_dom_adjust_mode_infrared_light.className = "mode_cha";
                        l_dom_adjust_mode_white_light.className = "mode_cha";
                        l_dom_adjust_mode_smart_light.className = "mode_cha_active";
                }
            }
            function adjust_get_ack(data) {
                l_cam_conf = data;
                l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                if (l_cam_conf.day) {
                    //night,white;night,auto,1;auto,2,white;auto,2,auto,1
                    if((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1)){
                        dom_in_box[0].style.width = parseInt(l_cam_conf.white_light.sharpness * 2) + "px";
                        dom_in_box[1].style.width = parseInt(l_cam_conf.white_light.contrast * 2) + "px";
                        dom_in_box[2].style.width = parseInt(l_cam_conf.white_light.color_saturation * 2) + "px";
                        dom_in_box[3].style.width = parseInt(l_cam_conf.white_light.brightness * 2) + "px";
                    }
                    //night,red;night,auto,0;auto,2,red;auto,2,auto,0 
                    else if((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0)){
                        dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 2) + "px";
                        dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 2) + "px";
                        dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 2) + "px";
                        dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 2) + "px";
                    }
                    //day;auto,1
                    else if(l_cam_conf.day_night == "day" || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 1)){
                        dom_in_box[0].style.width = parseInt(l_cam_conf.day.sharpness * 2) + "px";
                        dom_in_box[1].style.width = parseInt(l_cam_conf.day.contrast * 2) + "px";
                        dom_in_box[2].style.width = parseInt(l_cam_conf.day.color_saturation * 2) + "px";
                        dom_in_box[3].style.width = parseInt(l_cam_conf.day.brightness * 2) + "px";
                    }
                } else {
                    dom_in_box[0].style.width = parseInt(l_cam_conf.sharpness * 2) + "px";
                    dom_in_box[1].style.width = parseInt(l_cam_conf.contrast * 2) + "px";
                    dom_in_box[2].style.width = parseInt(l_cam_conf.color_saturation * 2) + "px";
                    dom_in_box[3].style.width = parseInt(l_cam_conf.brightness * 2) + "px";
                }

                for (let j = 0; j < 4; j++) {
                    dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                    dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                }
                change_cam_mode(l_cam_conf.day_night);
                if(l_white_light){
                    change_cam_light_mode(l_cam_conf.light_mode);
                }
            }
            function set_event() {
                function getLeft(e) {
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
                    if (value > 200) {
                        dom_in_box[i].style.width = "200px";
                        dom_circle[i].style.left = outX + 200 + "px";
                    }
                    else if (value <= 0) {
                        dom_in_box[i].style.width = "0";
                        dom_circle[i].style.left = outX + "px";
                    }
                    else {
                        dom_in_box[i].style.width = value + "px";
                        dom_circle[i].style.left = mouseX + "px";
                    }
                });
                document.onmousemove = (function (e) {
                    evt = window.event || e;
                    if (values_flag[0] || values_flag[1] || values_flag[2] || values_flag[3]) {
                        mouseX = evt.clientX - getLeft($("#adjust_setting")[0]);
                        let value = mouseX - outX;
                        if (value > 200) {
                            dom_in_box[i].style.width = "200px";
                            dom_circle[i].style.left = outX + 200 + "px";
                        }
                        else if (value <= 0) {
                            dom_in_box[i].style.width = "0";
                            dom_circle[i].style.left = outX + "px";
                        }
                        else {
                            dom_in_box[i].style.width = value + "px";
                            dom_circle[i].style.left = mouseX + "px";
                        }
                    }
                });
                document.onmouseup = (function (e) {
                    if (values_flag[0] || values_flag[1] || values_flag[2] || values_flag[3]) {
                        if (l_cam_conf.day) {
                            //night,white;night,auto,1;auto,2,white;auto,2,auto,1
                            if((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "white") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1)){
                                l_cam_conf.is_white_light = l_white_light;
                                l_cam_conf.white_light.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                                l_cam_conf.white_light.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                                l_cam_conf.white_light.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                                l_cam_conf.white_light.brightness = parseInt(dom_in_box[3].offsetWidth / 2);
                            }
                            //night,red;night,auto,0;auto,2,red;auto,2,auto,0 
                            else if((l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "night" && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0) || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "red") || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 2 && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0)){
                                l_cam_conf.night.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                                l_cam_conf.night.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                                l_cam_conf.night.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                                l_cam_conf.night.brightness = parseInt(dom_in_box[3].offsetWidth / 2);
                            }
                            //day;auto,1
                            else if(l_cam_conf.day_night == "day" || (l_cam_conf.day_night == "auto" && l_cam_conf.day_or_night == 1)){
                                l_cam_conf.day.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                                l_cam_conf.day.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                                l_cam_conf.day.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                                l_cam_conf.day.brightness = parseInt(dom_in_box[3].offsetWidth / 2);
                            }
                        } else {
                            l_cam_conf.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                            l_cam_conf.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                            l_cam_conf.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                            l_cam_conf.brightness = parseInt(dom_in_box[3].offsetWidth / 2);
                        }
                        _this.$api.play.adjust_set({ conf: l_cam_conf });
                        values_flag = [false, false, false, false];
                    }
                });
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
                    dom_in_box[0].style.width = parseInt(sharpness * 2) + "px";
                    dom_in_box[1].style.width = parseInt(contrast * 2) + "px";
                    dom_in_box[2].style.width = parseInt(color_saturation * 2) + "px";
                    dom_in_box[3].style.width = parseInt(brightness * 2) + "px";
                    for (let j = 0; j < 4; j++) {
                        dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                        dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                    }
                    change_cam_mode("auto");
                    l_cam_conf.day_night = "auto";
                    l_cam_conf.is_white_light = l_white_light;
                    l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    _this.$api.play.adjust_set({ conf: l_cam_conf });
                };

                l_dom_adjust_mode_daytime.onclick = function () {
                    if (l_cam_conf.day) {
                        dom_in_box[0].style.width = parseInt(l_cam_conf.day.sharpness * 2) + "px";
                        dom_in_box[1].style.width = parseInt(l_cam_conf.day.contrast * 2) + "px";
                        dom_in_box[2].style.width = parseInt(l_cam_conf.day.color_saturation * 2) + "px";
                        dom_in_box[3].style.width = parseInt(l_cam_conf.day.brightness * 2) + "px";
                    }
                    for (let j = 0; j < 4; j++) {
                        dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                        dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                    }
                    change_cam_mode("day");
                    l_cam_conf.day_night = "day";
                    l_cam_conf.is_white_light = l_white_light;
                    _this.$api.play.adjust_set({ conf: l_cam_conf });
                };

                l_dom_adjust_mode_night.onclick = function () {
                    if ((l_cam_conf.night && l_cam_conf.light_mode == "red") || (l_cam_conf.night && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 0) ) {
                        dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 2) + "px";
                        dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 2) + "px";
                        dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 2) + "px";
                        dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 2) + "px";
                    }else if((l_cam_conf.night && l_cam_conf.light_mode == "white") || (l_cam_conf.night && l_cam_conf.light_mode == "auto" && l_cam_conf.red_or_white == 1)){
                        dom_in_box[0].style.width = parseInt(l_cam_conf.white_light.sharpness * 2) + "px";
                        dom_in_box[1].style.width = parseInt(l_cam_conf.white_light.contrast * 2) + "px";
                        dom_in_box[2].style.width = parseInt(l_cam_conf.white_light.color_saturation * 2) + "px";
                        dom_in_box[3].style.width = parseInt(l_cam_conf.white_light.brightness * 2) + "px";
                    }

                    for (let j = 0; j < 4; j++) {
                        dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                        dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                    }
                    change_cam_mode("night");
                    l_cam_conf.day_night = "night";
                    l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    l_cam_conf.is_white_light = l_white_light;
                    _this.$api.play.adjust_set({ conf: l_cam_conf });
                };
                if (l_dom_adjust_mode_white_light) {
                    l_dom_adjust_mode_white_light.onclick = function () {
                        if(l_cam_conf.day_night == "night"){ 
                            if (l_cam_conf.white_light) {
                                dom_in_box[0].style.width = parseInt(l_cam_conf.white_light.sharpness * 2) + "px";
                                dom_in_box[2].style.width = parseInt(l_cam_conf.white_light.color_saturation * 2) + "px";
                                dom_in_box[1].style.width = parseInt(l_cam_conf.white_light.contrast * 2) + "px";
                                dom_in_box[3].style.width = parseInt(l_cam_conf.white_light.brightness * 2) + "px";
                            }
                            for (let j = 0; j < 4; j++) {
                                dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                                dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                            }
                        }
                        l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                        l_cam_conf.is_white_light = l_white_light;
                        change_cam_light_mode("white");
                        l_cam_conf.light_mode = "white";
                        _this.$api.play.adjust_set({ conf: l_cam_conf });
                    };
                    l_dom_adjust_mode_infrared_light.onclick = function (){
                        if(l_cam_conf.day_night == "night"){ 
                            if (l_cam_conf.night) {
                                dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 2) + "px";
                                dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 2) + "px";
                                dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 2) + "px";
                                dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 2) + "px";
                            }
            
                            for (let j = 0; j < 4; j++) {
                                dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                                dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                            }
                        }
                        l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                        l_cam_conf.is_white_light = l_white_light;
                        change_cam_light_mode("red");
                        l_cam_conf.light_mode = "red";
                        _this.$api.play.adjust_set({ conf: l_cam_conf });
                    }
                    l_dom_adjust_mode_smart_light.onclick = function (){
                        if(l_cam_conf.day_night == "night"){
                            if (l_cam_conf.night) {
                                dom_in_box[0].style.width = parseInt(l_cam_conf.night.sharpness * 2) + "px";
                                dom_in_box[2].style.width = parseInt(l_cam_conf.night.color_saturation * 2) + "px";
                                dom_in_box[1].style.width = parseInt(l_cam_conf.night.contrast * 2) + "px";
                                dom_in_box[3].style.width = parseInt(l_cam_conf.night.brightness * 2) + "px";
                            }
            
                            for (let j = 0; j < 4; j++) {
                                dom_circle[j].style.left = dom_out_box[j].offsetLeft + dom_in_box[j].offsetWidth + "px";
                                dom_circle[j].style.top = dom_out_box[j].offsetTop + "px";
                            }
                        }
                        l_cam_conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                        l_cam_conf.is_white_light = l_white_light;
                        change_cam_light_mode("smart");
                        l_cam_conf.light_mode = "auto";
                        _this.$api.play.adjust_set({ conf: l_cam_conf });
                    }
                }
                l_dom_adjust_reset.onclick = function () {
                    for (let i = 0; i < 4; i++) {
                        dom_in_box[i].style.width = l_cam_conf_reset[i] * 2 + "px";
                        dom_circle[i].style.left = dom_out_box[i].offsetLeft + dom_in_box[i].offsetWidth + "px";
                    }
                    change_cam_mode("auto");
                    if(l_white_light){
                        change_cam_light_mode("auto")
                    }
                    if (l_cam_conf.day) {
                        l_cam_conf.day.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                        l_cam_conf.day.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                        l_cam_conf.day.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                        l_cam_conf.day.brightness = parseInt(dom_in_box[3].offsetWidth / 2);

                        l_cam_conf.night.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                        l_cam_conf.night.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                        l_cam_conf.night.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                        l_cam_conf.night.brightness = parseInt(dom_in_box[3].offsetWidth / 2);
                        if(l_cam_conf.white_light){
                            l_cam_conf.is_white_light = l_white_light;
                            l_cam_conf.white_light.sharpness = parseInt(dom_in_box[0].offsetWidth / 2);
                            l_cam_conf.white_light.contrast = parseInt(dom_in_box[1].offsetWidth / 2);
                            l_cam_conf.white_light.color_saturation = parseInt(dom_in_box[2].offsetWidth / 2);
                            l_cam_conf.white_light.brightness = parseInt(dom_in_box[3].offsetWidth / 2);
                        }
                    } else {
                        l_cam_conf.sharpness = l_cam_conf_reset[0];
                        l_cam_conf.color_saturation = l_cam_conf_reset[2];
                        l_cam_conf.contrast = l_cam_conf_reset[1];
                        l_cam_conf.brightness = l_cam_conf_reset[3];
                    }
                    l_cam_conf.day_night = "auto";
                    l_cam_conf.light_mode = "auto";
                    _this.$api.play.adjust_set({ conf: l_cam_conf });
                };
            }
            //Get local storage resolution
            if (sessionStorage.getItem("PlayProfile") == "p0") {
                if (_this.$store.state.jumpPageData.projectName == "vsmahome") {
                    $("#resolute_choice").text(mcs_new_hd);
                } else {
                    // if(support_1080p==-1){  
                    // $("#resolute_choice").text(mcs_new_hd);
                    //    }else if(support_1080p==0){
                    //     $("#resolute_choice").text("720P");
                    // }else if(support_1080p==1){
                    //     $("#resolute_choice").text("1080P");
                    // }else if(support_1080p==2){
                    //     $("#resolute_choice").text("960P");
                    // }else if(support_1080p==3){
                    //  	    $("#resolute_choice").text("3MP");
                    //       }else if(support_1080p==4){
                    //  	    $("#resolute_choice").text("4MP");
                    //       }
                    $("#resolute_choice").text(support_1080p);
                }
            }
            else if (sessionStorage.getItem("PlayProfile") == "p1") {
                $("#resolute_choice").text(mcs_standard_clear);
            }
            else if (sessionStorage.getItem("PlayProfile") == "p2") {
                $("#resolute_choice").text(mcs_fluent_clear);
            }
            else if (sessionStorage.getItem("PlayProfile") == "p3") {
                $("#resolute_choice").text(mcs_fluent_clear);
            }
            else {
                $("#resolute_choice").text(mcs_auto);
            }
            
        }
        function get_definition() {
            function dev_info_get_ack(msg) {
                l_white_light = msg.white_light;
                play_menu_control({ parent: l_dom_play_menu_box });
                if (_this.$store.state.jumpPageData.projectName == "vsmahome") {
                    _this.publicFunc.mx("#high_definition").innerHTML = mcs_high_clear;
                } else {
                    // if(!msg.def){
                    //     _this.publicFunc.mx("#high_definition").innerHTML = mcs_new_hd;
                    //     if(_this.publicFunc.mx("#resolute_choice").innerHTML!=="720P") _this.publicFunc.mx("#resolute_choice").innerHTML= mcs_new_hd;
                    //     support_1080p = -1;
                    // }else{
                    // if(msg.def=="HD1080p"){
                    //            _this.publicFunc.mx("#high_definition").innerHTML = "1080P";
                    //            if(_this.publicFunc.mx("#resolute_choice").innerHTML!=="1080P") _this.publicFunc.mx("#resolute_choice").innerHTML="1080P";
                    //            support_1080p = 1;
                    //          }else if(msg.def=="HD720p"){
                    //            _this.publicFunc.mx("#high_definition").innerHTML = "720P";
                    //            if(_this.publicFunc.mx("#resolute_choice").innerHTML!=="720P") _this.publicFunc.mx("#resolute_choice").innerHTML="720P";
                    //            support_1080p = 0;
                    //          }else if(msg.def=="HD960p"){
                    //            _this.publicFunc.mx("#high_definition").innerHTML = "960P";
                    //            if(_this.publicFunc.mx("#resolute_choice").innerHTML!=="960P") _this.publicFunc.mx("#resolute_choice").innerHTML="960P";
                    //            support_1080p = 2;
                    //          }else if(msg.def=="3MP"){
                    //        	_this.publicFunc.mx("#high_definition").innerHTML = "3MP";
                    //               if(_this.publicFunc.mx("#resolute_choice").innerHTML!=="3MP") _this.publicFunc.mx("#resolute_choice").innerHTML="3MP";
                    //               support_1080p = 3;
                    //          }else if(msg.def=="4MP"){
                    //        	_this.publicFunc.mx("#high_definition").innerHTML = "4MP";
                    //               if(_this.publicFunc.mx("#resolute_choice").innerHTML!=="4MP") _this.publicFunc.mx("#resolute_choice").innerHTML="4MP";
                    //               support_1080p = 4;
                    //          }
                    // }
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
            }
            _this.$api.set.dev_info({ //ms.send_msg("dev_info_get"
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
                dev_info_get_ack(res)
            })
        }
        function play_view_control(data) {
            data.parent.innerHTML =
                "<div id='mipc_ptz_control'>"
                + "<div id='ptz_control_left'>"
                + "<div id='turn_left' class='left_key'></div>"
                + "</div>"
                + "<div id='ptz_control_up'>"
                + "<div id='turn_up' class='up_key'></div>"
                + "</div>"
                + "<div id='ptz_control_center'></div>"
                + "<div id='ptz_control_right'>"
                + "<div id='turn_right' class='right_key'></div>"
                + "</div>"
                + "<div id='ptz_control_down'>"
                + "<div id='turn_down' class='down_key'></div>"
                + "</div>"
                + "<div>";
            l_dom_ptz_control_left = _this.publicFunc.mx("#ptz_control_left");
            l_dom_ptz_control_right = _this.publicFunc.mx("#ptz_control_right");
            l_dom_ptz_control_up = _this.publicFunc.mx("#ptz_control_up");
            l_dom_ptz_control_down = _this.publicFunc.mx("#ptz_control_down");
            l_dom_turn_left = _this.publicFunc.mx("#turn_left");
            l_dom_turn_right = _this.publicFunc.mx("#turn_right");
            l_dom_turn_up = _this.publicFunc.mx("#turn_up");
            l_dom_turn_down = _this.publicFunc.mx("#turn_down");
            l_dom_ptz_control_center = _this.publicFunc.mx("#ptz_control_center");
            l_dom_mipc_ptz_control = _this.publicFunc.mx("#mipc_ptz_control");
            l_dom_play_view_width = l_dom_play_view.offsetWidth;
            l_dom_play_view_height = l_dom_play_view.offsetHeight;
            l_dom_play_view_top = l_dom_play_view.offsetTop;
            l_dom_play_view_left = l_dom_play_view.offsetLeft;
            l_dom_mipc_ptz_control.style.width = l_dom_play_view_width + "px";
            l_dom_mipc_ptz_control.style.height = l_dom_play_view_height - 40 + "px";
            l_dom_mipc_ptz_control.style.top = l_dom_play_view_top + "px";
            l_dom_mipc_ptz_control.style.left = l_dom_play_view_left + "px";
            l_dom_ptz_control_center.ondblclick = function () {
                _this.$api.play.fullscreen()
            }
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
            l_dom_turn_left.onmousedown = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "move",
                    direction: "left"
                })
            };
            l_dom_turn_left.onmouseup = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "stop",
                    direction: "left"
                })
            };
            l_dom_turn_up.onmousedown = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "move",
                    direction: "up"
                })
            };

            l_dom_turn_up.onmouseup = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "stop",
                    direction: "up"
                })
            };

            l_dom_turn_right.onmousedown = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "move",
                    direction: "right"
                })
            };

            l_dom_turn_right.onmouseup = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "stop",
                    direction: "right"
                })
            };

            l_dom_turn_down.onmousedown = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "move",
                    direction: "down"
                })
            };

            l_dom_turn_down.onmouseup = function () {
                _this.$api.play.play_ptz_turn({ // 摄像头转向控制
                    flag: "stop",
                    direction: "down"
                })
            };
        }
        function play_speed(data) {
            _this.publicFunc.mx("#play_buffer_ret").innerHTML = data;
        }
        function create_preview(data) {
            data.parent.innerHTML =
                "<div id='play_view_box'>"
                + "<div id='play_pause_pic'></div>"
                + "</div>"
            if (_this.$store.state.jumpPageData.localFlag) {
                _this.$api.play.play_preview_img({ addr: obj.addr, dom: $("#play_screen"), sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
            } else {
                _this.$api.play.play_preview_img({ dom: $("#play_screen"), sn: _this.$store.state.jumpPageData.selectDeviceIpc, pic_token: "p1_xxxxxxxxxx" })
            }
            l_dom_play_view_box = _this.publicFunc.mx("#play_view_box");
            l_dom_play_view_box.onclick = function () {
                let profile_token = sessionStorage.getItem("PlayProfile") ? sessionStorage.getItem("PlayProfile") : "p0";
                is_playing = 1;
                if (_this.$store.state.jumpPageData.localFlag) {
                    local_play_data.profile_token = profile_token;
                    local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    msdk_ctrl({ type: "local_device_play", data: local_play_data });
                } else {
                    _this.$api.play.play({
                        dom: $("#play_screen"),
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        profile_token: profile_token
                    }).then(res => {
                        play_speed(res)
                    })
                }
                $("#video_play").attr("class", "video_play_start");
                $("#play_view_control").show();
            }
        }
        window.onresize = function () {
            if(_this.publicFunc.mx("#dev_main_left")){
                _this.publicFunc.mx("#dev_main_left").style.height = (document.documentElement.clientHeight - 54) + "px";
                _this.publicFunc.mx("#dev_list").style.height = (_this.publicFunc.mx("#dev_main_left").offsetHeight - 43) + "px";
                _this.publicFunc.mx("#dev_main_right").style.width = document.body.clientWidth - _this.publicFunc.mx("#dev_main_left").offsetWidth - 60 + "px";
                let l_dom_play_box_width = document.body.clientWidth - l_dev_main_left.offsetWidth - 60;
                l_dom_play_box.style.width = l_dom_play_box_width + "px";
                l_dom_play_screen.style.height = (l_dom_play_box_width * 0.563) + "px";
                l_dom_mipc_ptz_control.style.width = l_dom_play_box_width + "px";
                l_dom_mipc_ptz_control.style.height = (l_dom_play_box_width * 0.563) - 40 + "px"
                l_dom_mipc_ptz_control.style.top = l_dom_play_view.offsetTop + "px";
                l_dom_mipc_ptz_control.style.left = l_dom_play_view.offsetLeft + "px";
            }
        }
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if(this.$route.params){
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    }else{
      pageData = {parent: $("#" + this.$route.name)}
    }
    if(pageData.parent.length == 0){
      pageData.parent = $("#" + pageData.parentId)
    }
    // console.log(pageData,"pageData")
    await this.mipcPlay(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    this.publicFunc.projectReload.call(this);
    window.mipcPlay = this.mipcPlay;
  }
}
</script>