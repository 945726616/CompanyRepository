'use strict'
// 已经整合到play.js中
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import play from './play'
import store from '../store'
// import md5 from '@/util/mmd5.js'
// import mcodec from '@/util/mcodec.js'
import mme from '@/util/mme.js'
import publicFunc from '@/util/public.js'
import fdSliderController from '@/util/fdSliderController'
import chooseLanguage from '@/lib/exportModule/languageExport'
console.log('language', store.state.user.userLanguage)
chooseLanguage.lang(store.state.user.userLanguage)
let mrs_download_completed = mrs_download_completed
const playback = {
  /*
  ** 停止视频播放
  */
  async video_stop (params) {
    let flash_isplay = store.state.jumpPageData.flashIsPlay
    let play_info = store.state.jumpPageData.playInfo
    console.log(flash_isplay, 'flash_isplay 进入video_stop')
    if (flash_isplay) {
      clearInterval(flash_isplay)
    }
    if (play_info.inner_window_info.video_chls) {
      play_info.inner_window_info.mme.chl_destroy(play_info.inner_window_info.video_chls);
    }
    if (play_info.inner_window_info.audio_chls)
      play_info.inner_window_info.mme.chl_destroy(play_info.inner_window_info.audio_chls);
    play_info.inner_window_info.node_sn = "none";
    play_info.inner_window_info.device_list_li_span = null;
    play_info.inner_window_info.profile_token = "";
    play_info.inner_window_info.ptz_token = "";
    play_info.inner_window_info.video_encoding = "";
    play_info.inner_window_info.video_resolution_w = 0;
    play_info.inner_window_info.video_resolution_h = 0;
    play_info.inner_window_info.video_frame_rate = 0;
    play_info.inner_window_info.video_max_bit_rate = 0;
    play_info.inner_window_info.video_min_bit_rate = 0;
    if (params.isDownload) {
      $("#download_dom").html('')
    } else {
      params.dom.html('')
    }
    return { parent: params.dom }
  },
  /*
  ** 播放总接口(不包含回放下载功能)
  */
  async play (data) {
    let _this = this
    let returnItem
    let judge_enable_native_plug = true;
    let judge_enable_flash_plug = false;
    let ref_obj = create_play_ipc(data);
    let playbackFlag = data.playback ? 1 : 0;
    let flash_isplay = store.state.jumpPageData.flashIsPlay;
    let l_plug_type;
    if (ref_obj.isDownload) { // 播放弹窗dom
      if (!$("#download_dom").length > 0) {
        $("body").append("<div id='download_dom' style='width:1px;height:1px;'></div>")
      }
      data.dom = $("#download_dom");
    }
    let mme_params = {
      parent: data.dom,
      enable_native_plug: judge_enable_native_plug,
      enable_flash_plug: judge_enable_flash_plug,
      params: "{key:'data:application/octet-stream;base64,OenOl2/PvPX7EuqqZdvMsNf5PqEOlOJZ4sROOBtnvW8F6Fc+azokLNtti6Cb/oiuO9qhOxvDfL8cVpGY4UcCe81OIVHkbiNzuHKwiE+K6gmmWwIoHgSRn2RN4qsZO62QkqGePdR6L94n2ruSeixjqAgWFTW8AIlQptovRZSN1Dh/8M87RIRdYyVFqKqsZoZTYibPLyDFONKIqxzrFkJPtqR/wn8jnYMc1qUH/w3IYJZh/OqctPTDp8tYuQSWN3EE6+kVmDIMV9F92SZJORMnvxy+zYzpbO7Gz44fBQNQSGMelsf7yQpfTF/X8t1Qn73fu53xp3MTIGH0kklFH2tMPkO/Raelhw5A4JQbczWg0n4pcNxpRl6mCEIjFprTboJ/B2eI0qUX/zTPM7l1hBmxjxsewORsXp0y2+NnCRH0uVBGUq6fOWrdhJwotIIu5ZAZwdoDZZu6eaycol2TIS5smusoD0ODPtQ2xZoCy7djIC4MVhB5uKe0zDXbLr+Serdlq6en5HyvUN0EEmYle0fORmgNFn0DTqqTab6cx8WfFkysciJSveN4swoR66qMQUi9+TfkHTnZ/REp3kHJtSq8XJyzTe+KCXlJXGx07nAbK4svIPanx39A5o5XlpLK/ohxiMpEJZ6OhmWb9yAnL+8Bedw+epvbNQkhADh2QqB4ItsIq5KTOsNzA0aNn3FEXzyd7WLVBqcF1lUVxu1vpYRPKv01im1ORbVhDoJ9eiqkfchutpAGYOwhYzxFWOIhTMouY+m/oQhc1d8FF4T+zSx6WVmj2f+RDUdOKbQVxJdEeiGKyIDm14K34Kz+RdzF0fY50sbs/SUfMWwuKQsEPFU5KQ'}",
      on_event: function (e) {
        e.sn = data.sn;
        on_plug_event(e)
      },
      ref_obj: ref_obj,
      debug: 0
    };
    if (data.ipc_stat != 0) {
      ref_obj.inner_window_info.mme = await new mme(mme_params);
    }
    store.dispatch('setPlayInfo', ref_obj)
    function create_play_ipc (obj) { // 整理传递的数据(用于创建mme实例)
      obj.protocol = "auto";
      obj.videoSize = obj.videoSize ? obj.videoSize : 0;
      obj.localPath = obj.download_path ? obj.download_path : null;
      obj.isDownload = obj.isDownload ? 1 : 0;
      obj.inner_window_info = {
        dom_id: ("play_screen"),
        index: 1,
        video_chls: null,
        audio_chls: null,
        mme: null,
        ipc_state: "",
        node_sn: obj.sn,
        profile_token: obj.profile_token
      };
      return obj;
    }
    async function on_plug_event (obj) { // 调用创建mme插件事件
      // console.log(obj, 'on_plug_event_obj')
      sessionStorage.setItem("type_tip", obj.type);
      sessionStorage.setItem("code_tip", obj.code);
      switch (obj.type) {
        case "missing": {
          if (!playbackFlag) {
            // if ((navigator.userAgent.toLowerCase().match(/chrome\/[\d.]+/gi) + "").replace(/[^0-9.]/ig, "") > "44") {
            //   location.href = "https://www.adobe.com/go/getflashplayer";
            // }
            if (flash_isplay) clearInterval(flash_isplay);
            flash_isplay = setInterval(function () { flash_play() }, 1000);
          } else {
            if (flash_isplay) clearInterval(flash_isplay);
            let i = 0;
            flash_isplay = setInterval(function () {
              flash_play(i);
              i++;
              if (i > data.token.length) clearInterval(flash_isplay);
            }, 1000);
          }
          break;
        }
        case "ready": {
          let proto = obj.ref_obj.protocol;
          if (obj.plug.type.name == "flash") {
            l_plug_type = "flash";
            proto = "rtmp";
          } else {
            if (proto == "auto") proto = "rtdp";
          }
          await axios.get('/ccm/ccm_replay', {
            params: {
              sess: {
                nid: login.create_nid(),
                sn: ref_obj.sn
              },
              setup: {
                stream: "RTP_Unicast",
                trans: {
                  proto: proto
                }
              },
              token: data.token
            }
          }).then(res => {
            // console.log(res, 'ccm_replay_res')
            returnItem = {
              result: login.get_ret(res),
              url: (res.data.url ? res.data.url : ""),
              type: "playback"
            }
          })
          return await play_ack(returnItem, store.state.jumpPageData.playInfo)
        }
        case "install_ui": {
          obj.panel.innerHTML = ''
          obj.panel.id = "plugin_install_page"
          let play_oem = "";
          if (store.state.jumpPageData.projectName === "vimtag") {
            play_oem = "Vimtag";
          } else if (store.state.jumpPageData.projectName === "mipcm") {
            mcs_download_client = mcs_download_client.replace("Vimtag", "MIPC");
            play_oem = "MIPC";
          } else if (store.state.jumpPageData.projectName === "ebitcam") {
            mcs_download_client = mcs_download_client.replace("Vimtag", "EBIT");
            play_oem = "EBIT";
          } else if (store.state.jumpPageData.projectName === "vsmahome") {
            mcs_download_client = mcs_download_client.replace("Vimtag", "VSMAHOME");
            play_oem = "VSMAHOME";
          }
          // if(store.state.jumpPageData.projectName=="vimtag"){

          // obj.panel.innerHTML = "<div id='plugin_install_box' style='" + (data.ipc_stat === 0 ? 'display:none' : '') + "'>"
          //   + "<div id='plugin_install_tips'>" + mcs_download_client + "</div>"
          //   + "<div id='plugin_install_download'><div id='plugin_install_download_name'>" + play_oem + " " + mcs_client_new + "</div><a href='" + store.state.jumpPageData.playDownloadUrl + "' target='_blank'><div id='plugin_install_download_btn'></div></a></div>"
          //   + "<div style='margin-top: 85px;'><a name='flash' href='javascript:;'><div id='use_ordinary_video'>" + mcs_temporarily_installed_use_ordinary_video + "</div></a></div>"
          //   + "</div>"//旧版download,暂时无用(若由https访问进来时，下载页访问不了)

          obj.panel.innerHTML = "<div id='plugin_install_box' style='" + (data.ipc_stat === 0 ? 'display:none' : '') + "'>"
            + "<div id='plugin_install_tips'>" + mcs_download_client + "</div>"
            + "<div id='plugin_install_download'><div id='plugin_install_download_name'>" + play_oem + " " + mcs_client_new + "</div><div id='plugin_install_download_btn'></div></div>"
            + "<div style='margin-top: 85px;'><a name='flash' href='javascript:;'><div id='use_ordinary_video'>" + mcs_temporarily_installed_use_ordinary_video + "</div></a></div>"
            + "</div>"

          $("#plugin_install_download").on('click',()=>{
            if(store.state.jumpPageData.projectName === 'ebitcam'){
              window.open("http://www.ebitcam.com/download")
            }else if(store.state.jumpPageData.projectName === 'mipcm'){
              window.open("http://www.mipcm.com/download")
            }else if(store.state.jumpPageData.projectName === 'vsmahome'){
              window.open("http://www.vsmahome.com/download")
            }else{
              window.open("http://www.vimtag.com/download")
            }
          })

          let plugin_install_page_width = $("#plugin_install_page").outerWidth() / 2;
          let plugin_install_download_width = $("#plugin_install_download").outerWidth() / 2;
          // jQuery("#use_ordinary_video").css({"margin-left":(plugin_install_page_width-use_ordinary_video_width)+"px"});
          $("#plugin_install_download").css({ "margin-left": (plugin_install_page_width - plugin_install_download_width) + "px" })
          break;
        }
      }
    }
    async function play_ack (msg, ref) { // 点击播放(网页端)
      console.log('进入play_ack')
      // console.log(msg, ref, 'play_ack_ref_msg')
      if (msg.result == "") {
        // if(data.box_ipc) { //云盒子
        //   publicFunc.log_upload('playback_box', 'success')  //记录日志：云盒子录像播放成功
        // }else{ //sd卡
        //   publicFunc.log_upload('playback_sd', 'success') //记录日志：sd卡录像播放成功
        // }
        
        await chl_video_create({ type: msg.type, uri: msg.url, inner_window_info: ref.inner_window_info, localPath: ref.localPath, isDownload: ref.isDownload });
      } else {
        // if(data.box_ipc) { //云盒子
        //   publicFunc.log_upload('playback_box', 'fail', msg.result) //记录日志：云盒子录像播放失败，失败原因
        // }else{ //sd卡
        //   publicFunc.log_upload('playback_sd', 'fail', msg.result) //记录日志：sd卡录像播放失败，失败原因
        // }
        
        if (msg.result == "accounts.user.offline") { //6.1.1
          publicFunc.msg_tips({ msg: mcs_video_play_offline, type: "error", timeout: 3000 })
        } else if (msg.result == "ccm.system.err") { //临时解决一下
          publicFunc.msg_tips({ msg: mcs_video_play_fail, type: "error", timeout: 3000 })
        } else if (msg.result == "4g.device.lock") {
          publicFunc.msg_tips({ msg: mrs_sim_invalid, type: "error", timeout: 3000 })
        }
      }
    }
    async function chl_video_create (obj) { // 创建播放器
      console.log('进入chl_video_create')
      let uri = obj.uri,
        chl_params = (obj.type == "publish") ? "" : ",thread:\"istream\", jitter:{max:3000}"/* for old version's mme plugin */,
        trans_params = (obj.type == "play") ? ",trans:[{flow_ctrl:\"jitter\",thread:\"istream\"}]" :
          ((obj.type == "playback") ? ",trans:[{flow_ctrl:\"delay\",thread:\"istream\"}]" : "");
      let params_data;
      let l_ipc_speed_time;
      let l_Last_speed = 0;
      let l_speed = 0;
      let l_progress = 0;
      if (obj.isDownload) {
        obj.localPath = obj.localPath.replace(/[/]/g, '\\/') + data.token + ".mp4";
      }
      if (obj.type == "playback" && obj.isDownload) {
        params_data = "{src:[{url:\"" + uri + "\"}], dst:[{url:\"file://" + obj.localPath + "\",thread:\"channel\"}],speaker:{mute:\"1\"},audio:{type:\"none\"},thread:\"channel\",canvas:\"none\"}}"
      } else {
        params_data = "{" + ((obj.type == "publish") ? "dst" : "src") + ":[{url:\"" + uri + "\"}]" + trans_params + chl_params + "}";
      }
      obj.inner_window_info.video_chls = obj.inner_window_info.mme.chl_create({
        params: params_data
      });
      if (obj.inner_window_info.video_chls !== null) {
        obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "speaker.mute", obj.type == "playback" ? "{value:0}" : "{value:1}") // 参考旧代码此处原本含有一处全局变量判断,但未发现该值有后赋值行为默认删减成单一属性
        if (l_ipc_speed_time) {
          clearInterval(l_ipc_speed_time);
        }
        if (l_plug_type !== "flash") { // 该判断条件中需要添加!此为客户端逻辑(去掉!用于在浏览器中测试使用)
          l_ipc_speed_time = setInterval(function () {
            let string_speed = obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "query", "{}");
            // console.log(string_speed, 'download_string_speed', obj, 'download_obj')
            if (string_speed.length >= 150) {
              let json_speed = eval("(" + string_speed + ")");
              console.log(json_speed, 'json_speed') // json_speed是视频播放的相关参数 可以根据该参数进行视频内容和进度条的对齐
              console.log(data, playbackFlag, 'data_playbackFlag')
              if (data.isDownload) {
                if (json_speed.data.played_duration / data.videoSize > 1) {
                  json_speed.data.played_duration = data.videoSize;
                  l_speed = "100%";
                  clearInterval(l_ipc_speed_time);//5.11.3后加
                  publicFunc.msg_tips({ msg: mrs_download_completed, type: "success", timeout: 3000 });
                  // }
                } else {
                  record_played_duration_num = 0;
                  record_played_duration = json_speed.data.played_duration;
                  l_speed = parseInt((json_speed.data.played_duration / data.videoSize) * 100) + "%";
                }
                // returnItem = l_speed
                data.func(l_speed)
              } else if (playbackFlag) {
                let duration2 = sessionStorage.getItem("duration");
                let kb = json_speed.data.p2ping ? "kB" : "KB";
                l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes - l_Last_speed) / 1000) + kb : l_Last_speed = 0;
                if (duration2 == json_speed.data.played_duration) {
                  let duration_tip = true;
                  sessionStorage.setItem("duration_tip", duration_tip)
                }
                l_Last_speed = json_speed.data.total_bytes;
                l_progress = json_speed.data.played_duration / data.videoSize
                //store.dispatch('setPercent', l_progress) // 赋值播放进度百分比
                console.log(l_progress, '播放百分比进度')
                sessionStorage.setItem("duration", json_speed.data.played_duration);
                let record_played_duration = json_speed.data.played_duration // - duration2;
                // returnItem = [l_speed, l_progress, record_played_duration]
                console.log('enter_playback_speed')
                playback_speed(l_speed, l_progress, record_played_duration)
              } else {
                console.log('enter this else')
                let kb = json_speed.data.p2ping ? "kB" : "KB";
                l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes - l_Last_speed) / 1000) + kb : l_Last_speed = 0;
                l_Last_speed = json_speed.data.total_bytes;
                // returnItem = l_speed
              }
              store.dispatch('setClientP2Ping', l_speed)
            }
          }, 1000)
          store.dispatch('setFlashIsPlay', l_ipc_speed_time)
        } else {
          // 浏览器执行 l_plug_type = flash 由于不显示进度条所以直接传递null值
          returnItem = null
        }
      }
      if (obj.type == "playback") {
        setTimeout(function () { play_ipc(obj) }, 1000)
      }
    }
    function play_ipc (obj) { // 播放Ipc
      console.log('进入play_ipc')
      obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "play", "");
      obj.inner_window_info.playback_state = "play";
      return 0;
    }
    function flash_play (i) {
      console.log('进入flash_play')
      let profile_token_choice = get_profile_token_choice(data.profile_token);
      let urls;
      if (!playbackFlag) {
        if (process.env.NODE_ENV === 'production') {
          urls = window.location.protocol + "//" + store.state.jumpPageData.serverDevice + "/ccm/ccm_pic_get.js?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + profile_token_choice.profile_token_choice_value + "&dencode_type=2";
        } else {
          urls = "http://45.113.201.4:7080/ccm/ccm_pic_get.js?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + profile_token_choice.profile_token_choice_value + "&dencode_type=2";
        }
      } else {
        let pic_token = data.token[i];
        if (process.env.NODE_ENV === 'production') {
          urls = window.location.protocol + "//" + store.state.jumpPageData.serverDevice + "/ccm/ccm_pic_get.js?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + pic_token + "&dencode_type=2";
        } else {
          urls = "http://localhost:8080/api/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + pic_token + "&dflag=2" + "&dencode_type=2";
        }
      }
      data.dom.html("<img id='flash_img' width='1px' src='" + urls + "'>")
      if (publicFunc.mx("#flash_img")) {
        publicFunc.mx("#flash_img").onload = function () {
          data.dom.css('backgroundImage', "url(" + this.src + ")")
          data.dom.css('backgroundSize', "100% 100%")
        }
      } else {
        clearInterval(flash_isplay)
      }
    }
    function playback_speed (data, progress, record_played_duration) { // 客户端回放进度条
      console.log('进入playback_speed playback.js')
      let progress2 = sessionStorage.getItem("aaa")
      sessionStorage.setItem("aaa", progress);
      let bo_type = sessionStorage.getItem('bo_type')
      let start_time = JSON.parse(sessionStorage.getItem('play_back_startTime'))
      let end_time = JSON.parse(sessionStorage.getItem('play_back_endTime'))
      let b_start_time = JSON.parse(sessionStorage.getItem('b_start_time'))
      let first = sessionStorage.getItem('play_first') // 进度条点击标识
      let percent = store.state.jumpPageData.percent // 获取播放百分比
      let playBackTime = end_time - b_start_time // 播放总时间 record_played_duration: 播放的时长
      console.log(percent, 'playBackPercent', bo_type)
      if (bo_type && bo_type === 'true') {
        start_time = b_start_time;
        bo_type = false
        sessionStorage.setItem('bo_type', false)
      } else {
        start_time = b_start_time + record_played_duration + (store.state.jumpPageData.playBackSavePercent * playBackTime) // 原始开始时间 + 播放经过时间 + 点击偏移百分比所经过的时间(偏移百分比默认为0) = 当前时间戳
      }
      sessionStorage.setItem('play_back_startTime', start_time)
      let play_start_time_stop = new Date(start_time).format("yyyy-MM-dd hh:mm:ss") // 当前时间戳
      let play_end_time_stop = new Date(end_time).format("yyyy-MM-dd hh:mm:ss") // 结束时间戳
      // let play_end_time = new Date(end_time).format("hh:mm:ss");
      percent = (record_played_duration + (store.state.jumpPageData.playBackSavePercent * playBackTime)) / playBackTime
      store.dispatch('setPercent', percent) // 计算进度条百分比并赋值
      console.log(playback, 'playback', percent, playBackTime, record_played_duration)
      if (play_start_time_stop >= play_end_time_stop) {
        console.log('进入终止播放函数')
        store.dispatch('setPlayBackSavePercent', 0) // 偏移百分比设置为0
        store.dispatch('setPercent', 1) // 停止播放百分比设置1
        playback.video_stop({
          dom: $("#playback_screen")
        }).then(res => {
          // create_preview(res)
          sessionStorage.setItem("pause_start_time", start_time)
          let pic_token = store.state.jumpPageData.playBackObj.pic_token.replace("_p3_", "_p0_")
          play.play_preview_img({
            dom: $("#playback_screen"),
            sn: store.state.jumpPageData.selectDeviceIpc,
            pic_token: pic_token
          })
          console.log('执行遮罩层')
          publicFunc.mx('#playback_screen').innerHTML =
            "<div id='play_view_box'>"
            + "<div id='play_pause_pic'></div>"
            + "</div>"
        })
        // msdk_ctrl({ type: "play_video_stop", data: { dom: l_dom_playback_screen, func: create_preview } });
      }
      console.log(first, 'first playback')
      // if (first) {
      //   if (publicFunc.mx("#playback_progressbar")) { // 进度条报错(客户端)
      //     progress = Number(progress) - Number(progress2) + Number(publicFunc.mx("#playback_progressbar").value);
      //   }
      //   let play_progress_time_stamp = sessionStorage.getItem("play_progress_time_stamp");
      //   let get_drag_duration = sessionStorage.getItem("duration");
      //   let drag_start_time = parseInt(play_progress_time_stamp) + parseInt(get_drag_duration);
      //   let play_start_time = new Date(drag_start_time).format("hh:mm:ss")
      //   let play_start_time_stop = new Date(drag_start_time).format("yyyy-MM-dd hh:mm:ss")
      //   $("#playback_start_time").html(play_start_time);
      //   let play_end_time = new Date(end_time).format("hh:mm:ss");
      //   let play_end_time_stop = new Date(end_time).format("yyyy-MM-dd hh:mm:ss");
      //   if (play_start_time_stop >= play_end_time_stop) {
      //     $("#playback_start_time").html(play_end_time);
      //     playback.video_stop({
      //       dom: $("#playback_screen")
      //     }).then(res => {
      //       create_preview(res)
      //     })
      //   }
      // }
      // if (!data) data = null
      // publicFunc.mx("#playback_buffer_ret").innerHTML = data;
      // if (publicFunc.mx("#playback_progressbar")) { // 进度条报错(客户端)
      //   fdSliderController.increment("playback_progressbar", progress - publicFunc.mx("#playback_progressbar").value);
      // }
    }
    // return returnItem
  },
  /*
   ** 客户端回放下载功能
   */
  async replay_download (data) {
    // console.log(data, '进入回放下载')
    let ref_obj = create_play_ipc(data)
    let judge_enable_native_plug = true
    let judge_enable_flash_plug = false
    if (data.isDownload) {
      if (!$("#download_dom").length > 0) {
        $("body").append("<div id='download_dom' style='width:1px;height:1px;'></div>")
      }
      data.dom = $("#download_dom");
    }
    let mme_params = {
      parent: data.dom,
      enable_native_plug: judge_enable_native_plug,
      enable_flash_plug: judge_enable_flash_plug,
      params: "{key:'data:application/octet-stream;base64,OenOl2/PvPX7EuqqZdvMsNf5PqEOlOJZ4sROOBtnvW8F6Fc+azokLNtti6Cb/oiuO9qhOxvDfL8cVpGY4UcCe81OIVHkbiNzuHKwiE+K6gmmWwIoHgSRn2RN4qsZO62QkqGePdR6L94n2ruSeixjqAgWFTW8AIlQptovRZSN1Dh/8M87RIRdYyVFqKqsZoZTYibPLyDFONKIqxzrFkJPtqR/wn8jnYMc1qUH/w3IYJZh/OqctPTDp8tYuQSWN3EE6+kVmDIMV9F92SZJORMnvxy+zYzpbO7Gz44fBQNQSGMelsf7yQpfTF/X8t1Qn73fu53xp3MTIGH0kklFH2tMPkO/Raelhw5A4JQbczWg0n4pcNxpRl6mCEIjFprTboJ/B2eI0qUX/zTPM7l1hBmxjxsewORsXp0y2+NnCRH0uVBGUq6fOWrdhJwotIIu5ZAZwdoDZZu6eaycol2TIS5smusoD0ODPtQ2xZoCy7djIC4MVhB5uKe0zDXbLr+Serdlq6en5HyvUN0EEmYle0fORmgNFn0DTqqTab6cx8WfFkysciJSveN4swoR66qMQUi9+TfkHTnZ/REp3kHJtSq8XJyzTe+KCXlJXGx07nAbK4svIPanx39A5o5XlpLK/ohxiMpEJZ6OhmWb9yAnL+8Bedw+epvbNQkhADh2QqB4ItsIq5KTOsNzA0aNn3FEXzyd7WLVBqcF1lUVxu1vpYRPKv01im1ORbVhDoJ9eiqkfchutpAGYOwhYzxFWOIhTMouY+m/oQhc1d8FF4T+zSx6WVmj2f+RDUdOKbQVxJdEeiGKyIDm14K34Kz+RdzF0fY50sbs/SUfMWwuKQsEPFU5KQ'}",
      on_event: function (e) {
        e.sn = data.sn;
        on_plug_event(e)
      },
      ref_obj: ref_obj,
      debug: 0
    }
    if (data.ipc_stat != 0) { // 实例化mme对象
      // console.log('use mme_create')
      ref_obj.inner_window_info.mme = await new mme(mme_params)
      // console.log(ref_obj.inner_window_info.mme, '初始化完成的mme')
      store.dispatch('setPlayInfo', ref_obj) // 全局存储播放对象
    }
    async function on_plug_event (obj) {
      sessionStorage.setItem("type_tip", obj.type);
      sessionStorage.setItem("code_tip", obj.code);
      switch (obj.type) {
        case "ready": {
          let proto = 'rtdp'
          let res = await axios.get('/ccm/ccm_replay', { // 客户端调用回放下载接口
            params: {
              sess: {
                nid: login.create_nid(),
                sn: ref_obj.sn
              },
              setup: {
                stream: "RTP_Unicast",
                trans: {
                  proto: proto
                }
              },
              token: data.token
            }
          })
          let playback_res = {
            result: login.get_ret(res),
            url: (res.data.url ? res.data.url : ""),
            type: "playback"
          }
          // console.log(res, playback_res, '接口执行完成 play_ack函数参数拼接完成')
          await play_ack(playback_res, store.state.jumpPageData.playInfo) // 等待播放回调完成
          break
        }
        default: {
          console.log(obj, "error type")
        }
      }
    }
    async function play_ack (msg, ref) {
      if (msg.result == "") {
        // console.log(msg, ref, '进入chl_video_create/play_ack')
        let play_ack_res = await chl_video_create({
          type: msg.type,
          uri: msg.url,
          inner_window_info: ref.inner_window_info,
          localPath: ref.localPath,
          isDownload: ref.isDownload
        })
        return play_ack_res
      } else { // 错误返回值判断
        if (msg.result == "accounts.user.offline") { //6.1.1
          publicFunc.msg_tips({
            msg: mcs_video_play_offline,
            type: "error",
            timeout: 3000
          })
        } else if (msg.result == "ccm.system.err") { //临时解决一下
          publicFunc.msg_tips({
            msg: mcs_video_play_fail,
            type: "error",
            timeout: 3000
          })
        } else if (msg.result == "4g.device.lock") {
          publicFunc.msg_tips({
            msg: mrs_sim_invalid,
            type: "error",
            timeout: 3000
          })
        }
      }
    }
    async function chl_video_create (obj) {
      // console.log(obj, '进入chl_video_create')
      let uri = obj.uri
      let chl_params = (obj.type == "publish") ? "" : ",thread:\"istream\", jitter:{max:3000}" /* for old version's mme plugin */
      let trans_params = (obj.type == "play") ? ",trans:[{flow_ctrl:\"jitter\",thread:\"istream\"}]" : ((obj.type == "playback") ? ",trans:[{flow_ctrl:\"delay\",thread:\"istream\"}]" : "")
      let params_data
      let l_ipc_speed_time
      let l_speed = 0
      let record_played_duration_num = 0
      let record_played_duration = 0
      if (obj.isDownload) {
        obj.localPath = obj.localPath.replace(/[/]/g, '\\/') + data.token + ".mp4"
      }
      if (obj.type == "playback" && obj.isDownload) {
        params_data = "{src:[{url:\"" + uri + "\"}], dst:[{url:\"file://" + obj.localPath + "\",thread:\"channel\"}],speaker:{mute:\"1\"},audio:{type:\"none\"},thread:\"channel\",canvas:\"none\"}}"
      } else {
        params_data = "{" + ((obj.type == "publish") ? "dst" : "src") + ":[{url:\"" + uri + "\"}]" + trans_params + chl_params + "}";
      }
      obj.inner_window_info.video_chls = obj.inner_window_info.mme.chl_create({
        params: params_data
      })
      if (obj.inner_window_info.video_chls !== null) {
        // console.log('准备下载', obj.inner_window_info.mme)
        obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "speaker.mute", obj.type == "playback" ? "{value:0}" : "{value:1}") // 参考旧代码此处原本含有一处全局变量判断,但未发现该值有后赋值行为默认删减成单一属性
        if (l_ipc_speed_time) {
          clearInterval(l_ipc_speed_time);
        }
        l_ipc_speed_time = setInterval(function () {
          let string_speed = obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "query", "{}");
          // console.log(string_speed, 'download_string_speed', obj, 'download_obj')
          if (string_speed.length >= 150) {
            let json_speed = eval("(" + string_speed + ")");
            console.log(json_speed.data.played_duration / data.videoSize, 'json_speed.data.played_duration / data.videoSize')
            if (json_speed.data.played_duration / data.videoSize > 1) {
              json_speed.data.played_duration = data.videoSize;
              l_speed = "100%";
              clearInterval(l_ipc_speed_time); //5.11.3后加
              publicFunc.msg_tips({
                msg: mrs_download_completed,
                type: "success",
                timeout: 3000
              });
            } else {
              record_played_duration_num = 0;
              record_played_duration = json_speed.data.played_duration;
              l_speed = parseInt((json_speed.data.played_duration / data.videoSize) * 100) + "%";
            }
            // returnItem = l_speed
            download_info(l_speed)
            function download_info (data) {
              console.log(data, 'download_info_data')
              let data_num = data.substring(0, data.length - 1);
              $("#download_progress").html(data)
              if (data_num > 99) {
                // create_preview({parent:l_dom_playback_screen});
                playback.video_stop({
                  dom: $("#playback_screen"),
                  isDownload: 1 // 是否下载中特殊标记
                }).then(res => {
                  // sessionStorage.setItem("pause_start_time", start_time)
                  let pic_token = store.state.jumpPageData.playBackObj.pic_token.replace("_p3_", "_p0_")
                  play.play_preview_img({
                    dom: $("#playback_screen"),
                    sn: store.state.jumpPageData.selectDeviceIpc,
                    pic_token: pic_token
                  })
                  console.log('下载')
                  publicFunc.mx('#playback_buffer_ret').style.display = "none"
                  //   "<div id='play_view_box'>"
                  //   + "<div id='play_pause_pic'></div>"
                  //   + "</div>"
                })
                // msdk_ctrl({ type: "play_download_stop", data: { dom: l_dom_playback_screen, func: create_preview } })
              }
            }
            function create_preview (data) {
              sessionStorage.setItem("pause_start_time", start_time)
              data.parent.innerHTML =
                "<div id='play_view_box'>"
                + "<div id='play_pause_pic'></div>"
                + "</div>"
              let pic_token = obj.pic_token.replace("_p3_", "_p0_");
              playback.play_preview_img({
                dom: $("#playback_screen"),
                sn: store.state.jumpPageData.selectDeviceIpc,
                pic_token: pic_token
              })
            }
          }
        }, 1000)
      }
      if (obj.type == "playback") {
        setTimeout(function () {
          play_ipc(obj)
        }, 1000)
      }
      function play_ipc (obj) {
        obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "play", "");
        obj.inner_window_info.playback_state = "play";
        return 0;
      }
      // return returnItem;
    }
    function create_play_ipc (obj) { // 传递的参数整理
      obj.protocol = "auto";
      obj.videoSize = obj.videoSize ? obj.videoSize : 0;
      obj.localPath = obj.download_path ? obj.download_path : null;
      obj.isDownload = obj.isDownload ? 1 : 0;
      obj.inner_window_info = {
        dom_id: ("play_screen"),
        index: 1,
        video_chls: null,
        audio_chls: null,
        mme: null,
        ipc_state: "",
        node_sn: obj.sn,
        profile_token: obj.profile_token
      };
      return obj;
    }
  },
  /*
  ** 暂停下载
  */
  async pause_ipc () {
    let play_info = store.state.jumpPageData.playInfo
    if (play_info.inner_window_info.mme) {
      play_info.inner_window_info.mme.ctrl(play_info.inner_window_info.video_chls, "pause", "")
    }
    play_info.inner_window_info.playback_state = "pause";
  },
  /*
  ** 继续下载
  */
  async play_download_continue () {
    let play_info = store.state.jumpPageData.playInfo
    play_info.inner_window_info.mme.ctrl(play_info.inner_window_info.video_chls, "play", "");
    play_info.inner_window_info.playback_state = "play";
  },
  /*
  ** 播放封面图
  */
  play_preview_img (data) {
    let url;
    if (process.env.NODE_ENV === 'production') {
      url = (data.addr ? "http://" + data.addr : window.location.protocol + "//" + window.location.host) + "/ccm/ccm_pic_get.js?dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + data.pic_token + "&dflag=2";
    } else {
      url = (data.addr ? "http://" + data.addr : window.location.protocol + "//" + window.location.host) + "/api/ccm/ccm_pic_get.js?dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + data.pic_token + "&dflag=2";
    }
    data.dom[0].style.backgroundImage = 'url(' + url + ')';
    data.dom[0].style.backgroundSize = '100% 100%';
    data.dom[0].style.backgroundRepeat = 'no-repeat';
    // data.dom[0].attr('style', 'background: url('+url+') no-repeat')
    // data.dom[0].attr('style', 'backgroundSize: 100% 100%')
  }
}

export default playback

function get_profile_token_choice (data) {
  var profile_token_obj = new Object();
  var profile_token_choice = data;
  if (profile_token_choice == "" || profile_token_choice == null) {
    if (store.state.jumpPageData.networkEnviron == "private") {
      profile_token_obj.profile_token_choice_value = "p0_xxxxxxxxxx";
      profile_token_obj.few_seconds = 3000;
    } else {
      profile_token_obj.profile_token_choice_value = "p1_xxxxxxxxxx";
      profile_token_obj.few_seconds = 1000;
    }
  } else if (profile_token_choice == "p0") {
    profile_token_obj.profile_token_choice_value = "p0_xxxxxxxxxx";
    profile_token_obj.few_seconds = 3000;
  } else if (profile_token_choice == "p1") {
    profile_token_obj.profile_token_choice_value = "p1_xxxxxxxxxx";
    profile_token_obj.few_seconds = 1000;
  } else if (profile_token_choice == "p2") {
    profile_token_obj.profile_token_choice_value = "p2_xxxxxxxxxx";
    profile_token_obj.few_seconds = 500;
  } else if (profile_token_choice == "p3") {
    profile_token_obj.profile_token_choice_value = "p3_xxxxxxxxxx";
    profile_token_obj.few_seconds = 500;
  }
  return profile_token_obj;
}