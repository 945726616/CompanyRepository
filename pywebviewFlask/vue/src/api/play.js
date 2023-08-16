'use strict'
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import store from '../store'
import devlist from './devlist'
// import md5 from '@/util/mmd5.js'
// import mcodec from '@/util/mcodec.js'
import mme from '@/util/mme.js'
import mme_hls from '@/util/mme_hls.js'
import publicFunc from '@/util/public.js'
import MSdk from '@/util/msdk_plug.js'
let default_Play_img = "data:image/jpg;base64,/9j/4QlQaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiLz4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSJ3Ij8+/+0ALFBob3Rvc2hvcCAzLjAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAgICAgICAgICAwMDAwMDAwMDAwEBAQEBAQECAQECAgIBAgIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/90ABAA6/+4ADkFkb2JlAGTAAAAAAf/AABEIAQUB0AMAEQABEQECEQH/xABLAAEBAAAAAAAAAAAAAAAAAAAACwEBAAAAAAAAAAAAAAAAAAAAABABAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAAABEQIRAD8An/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Cf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/0Z/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Sn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Of+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/1J/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Vn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9af+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/15/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Qn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Gf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/0p/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Tn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Sf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/1Z/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Wn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9ef+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/0J/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Rn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Kf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/05/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Un/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Wf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/1p/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Xn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Cf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/0Z/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Sn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9Of+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/1J/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Vn/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9af+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/15/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z"
const play = {
  /*
   ** 请求图片
   */
  load_imgs (data) {
    let images = new Array()
    for (let length = data.dom.length, k = 0; k < length; k++) {
      let sn = data.dom[k].getAttribute("sn")
      if (data.dom[k].getAttribute("state") === "offline") continue
      images[k] = new Image();
      if (store.state.jumpPageData.localFlag) {
        images[k].src = "http://" + data.dom[k].getAttribute("addr") + "/ccm/ccm_pic_get.js?dsess=1&dsess_nid=&dsess_sn=" + data.dom[k].getAttribute("sn") + "&dtoken=p1&dencode_type=1&dpic_types_support=7" + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
      } else {
        if (sessionStorage.getItem(sn) && data.box_ipc !== 1) {
          $(data.dom).eq(k).children()[0].style.backgroundImage = "url(" + sessionStorage.getItem(sn) + ")";
          $(data.dom).eq(k).children()[0].style.backgroundSize = "100% 100%";
        } else {
          if (data.box_ipc == 1) { //如果云盒子列表
            images[k].src = devlist.pic_url_get({
              sn: data.dom[k].getAttribute("sn"),
              token: data.dom[k].getAttribute("ipc_sn") + "_p3_" + Math.pow(2, 31) + "_" + Math.pow(2, 31),
              flag: 2,
              box_ipc: 1
            });
          } else {
            images[k].src = devlist.pic_url_get({
              sn: data.dom[k].getAttribute("sn"),
              token: "p1"
            })
          }
        }
      }
      images[k].onload = function () {
        if (data.box_ipc == 1) { //6.1.2
          let j;
          for (j = 0; j < length; j++) {
            if (!$(data.dom)[j]) return;
            let dev_sn = $(data.dom).eq(j).attr("ipc_sn");
            if (this.src.indexOf(dev_sn) > -1) {
              break;
            }
          }
          $(data.dom).eq(j).children()[0].style.backgroundImage = "url(" + this.src + ")";
          $(data.dom).eq(j).children()[0].style.backgroundSize = "100% 100%";
        } else {
          let j;
          for (j = 0; j < length; j++) {
            if (!$(data.dom)[j]) return;
            let dev_sn = $(data.dom).eq(j).attr("sn");
            if (this.src.indexOf(dev_sn) > -1) {
              break;
            }
          }
          $(data.dom).eq(j).children()[0].style.backgroundImage = "url(" + this.src + ")";
          $(data.dom).eq(j).children()[0].style.backgroundSize = "100% 100%";
        }
      };
    }
  },
  /*
   ** 停止视频播放
   */
  async video_stop (params) {
    let returnItem
    console.log(params, 'video_stop_params')
    let flash_isplay = store.state.jumpPageData.flashIsPlay
    console.log(flash_isplay, 'flash_isplay')
    let play_info = store.state.jumpPageData.playInfo
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
      console.log('下载')
      $("#download_dom").html('')
      returnItem = 'download'
    } else {
      returnItem = 'pause'
      params.dom.html('')
    }
    // publicFunc.mx('#play_screen').innerHTML =
    //         "<div id='play_view_box'>"
    //         + "<div id='play_pause_pic'></div>"
    //         + "</div>"
    // return await params.dom
    return returnItem
  },
  /*
   ** 播放总接口
   */
  async play (data) { // 播放方式选择接口
    return this.play_flash(data)
    // if (window.fujikam || navigator.mimeTypes["application/x-shockwave-flash"]) { // 客户端/支持flash的浏览器使用flash播放方法
    //   console.log('use flash')
    //   return this.play_flash(data)
    // } else { // 其余则直接使用HLS进行播放
    //   console.log('use hls')
    //   let msdk = new MSdk()
    //   console.log(msdk, 'msdk')
    //   msdk.create({ data: { token: "create" } }).then(res => {
    //     console.log(res, 'isInitialized', msdk_create)
    //     let msdk_create_timer = setInterval(function () {
    //       console.log(data, 'setInterval_data')
    //       if (typeof msdk_create != 'undefined' && msdk_create instanceof Function) {
    //         msdk_create(res, data)
    //         clearInterval(msdk_create_timer)
    //       }
    //     }, 500)
    //     // if (res) {
    //     //   return this.play_hls(data)
    //     // }
    //   })
    // }
  },
  async play_flash (data) {
    let returnItem = "";
    let flash_isplay = store.state.jumpPageData.flashIsPlay
    let judge_enable_native_plug = true;
    let judge_enable_flash_plug = false;
    let ref_obj = create_play_ipc(data);
    let playback = data.playback ? 1 : 0;
    let l_plug_type = "";
    if (ref_obj.isDownload) { // 下载按钮添加
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
      // console.log('use mme_create')
      ref_obj.inner_window_info.mme = await new mme(mme_params);
    }
    store.dispatch('setPlayInfo', ref_obj)

    function flash_play () {
      let profile_token_choice = get_profile_token_choice(data.profile_token)
      let urls
      if (process.env.NODE_ENV === 'production') { // 正式环境下截图播放地址
        // urls = window.location.protocol + "//" + store.state.jumpPageData.serverDevice + "/ccm/ccm_pic_get.js?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + profile_token_choice.profile_token_choice_value;
        urls = window.location.protocol + "//" + window.location.host + "/ccm/ccm_pic_get.js?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + profile_token_choice.profile_token_choice_value + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
      } else { // 测试环境下截图播放地址
        urls = window.location.protocol + "//" + window.location.host + "/api/ccm/ccm_pic_get.js?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + data.sn + "&dtoken=" + profile_token_choice.profile_token_choice_value + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
      }
      // console.log(urls, 'urls')
      data.dom.html("<img id='flash_img' width='1px' src='" + urls + "'>") // 写入封面图
      if (publicFunc.mx("#flash_img")) {
        publicFunc.mx("#flash_img").onload = function () {
          data.dom.css('background-image', "url(" + this.src + ")")
          data.dom.css('background-size', "100% 100%")
        }
      } else {
        clearInterval(flash_isplay) // 终止定时器 取消循环请求图片播放视频
      }
    }
    async function on_plug_event (obj) { // 创建插件事件
      sessionStorage.setItem("type_tip", obj.type) // 存储类型提示
      sessionStorage.setItem("code_tip", obj.code) // 存储编码提示
      switch (obj.type) { // switch选择存储类型进行判断执行
        case "missing": {
          console.log(playback, 'switch playback')
          if (!playback) {
            // if ((navigator.userAgent.toLowerCase().match(/chrome\/[\d.]+/gi) + "").replace(/[^0-9.]/ig, "") > "44") {
            //   location.href = "https://www.adobe.com/go/getflashplayer";
            // }
            if (flash_isplay) clearInterval(flash_isplay);
            // publicFunc.log_upload('play', 'success') //记录日志：实时播放成功(无flash)
            flash_isplay = setInterval(function () {
              flash_play()
            }, 1000);
            console.log('enter setInterval')
            store.dispatch('setFlashIsPlay', flash_isplay)
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
          if (playback) { // 不使用该模块播放
            data.agent.play({
              sn: ref_obj.sn,
              token: ref_obj.token,
              protocol: proto,
              ref: obj.ref_obj
            }, obj.ref_obj, function (msg, ref) {
              msg.type = "playback";
              play_ack(msg, ref);
            });
          } else {
            // if (store.state.jumpPageData.localFlag) {
            //   data.agent.play({
            //     sn: ref_obj.sn,
            //     token: obj.ref_obj.inner_window_info.profile_token,
            //     protocol: proto,
            //     ref: obj.ref_obj
            //   }, obj.ref_obj, function (msg, ref) {
            //     msg.type = "play";
            //     play_ack(msg, ref);
            //   })
            // } else {
              // ms.send_msg("play",{sn:"1jfiegbqaml3q",token:"p0_1jfiegbqcip5q", protocol:proto,ref:obj.ref_obj},obj.ref_obj,function(msg,ref){ msg.type = "play" ; play_ack(msg,ref);}); //6.1.2测试云盒子实时视频播放 
              // ms.send_msg("play", { sn: ref_obj.sn, token: obj.ref_obj.inner_window_info.profile_token, protocol: proto, ref: obj.ref_obj }, obj.ref_obj, function (msg, ref) { msg.type = "play"; play_ack(msg, ref); });
              await axios.get('/ccm/ccm_play', {
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
                  token: obj.ref_obj.inner_window_info.profile_token
                }
              }).then(res => {
                returnItem = {
                  result: login.get_ret(res),
                  url: (res.data.uri ? res.data.uri.url : ""),
                  type: "play"
                }
              })
              return play_ack(returnItem, store.state.jumpPageData.playInfo)
            // }
          }
          break;
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

          // obj.panel.innerHTML = "<div id='plugin_install_box' style='" + (data.ipc_stat === 0 ? 'display:none' : '') + "'>" +
          //   "<div id='plugin_install_tips'>" + mcs_download_client + "</div>" +
          //   "<div id='plugin_install_download'><div id='plugin_install_download_name'>" + play_oem + " " + mcs_client_new + "</div><a href='" + store.state.jumpPageData.playDownloadUrl + "' target='_blank'><div id='plugin_install_download_btn'></div></a></div>" +
          //   "<div style='margin-top: 85px;'><a name='flash' href='javascript:;'><div id='use_ordinary_video'>" + mcs_temporarily_installed_use_ordinary_video + "</div></a></div>" +
          //   "</div>" //旧版download,暂时无用(若由https访问进来时，下载页访问不了)

          obj.panel.innerHTML = "<div id='plugin_install_box' style='" + (data.ipc_stat === 0 ? 'display:none' : '') + "'>" +
            "<div id='plugin_install_tips'>" + mcs_download_client + "</div>" +
            "<div id='plugin_install_download'><div id='plugin_install_download_name'>" + play_oem + " " + mcs_client_new + "</div><div id='plugin_install_download_btn'></div></div>" +
            "<a name='flash' href='javascript:;' style='display:inline-block; width:210px'><div id='use_ordinary_video'>" + mcs_temporarily_installed_use_ordinary_video + "</div></a>" +
            "</div>"
          
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
          break;
        }
      }
    }

    async function play_ack (msg, ref) {
      if (msg.result == "") {
        // publicFunc.log_upload('play', 'success') //记录日志：实时播放成功(mme,flash)
        return await chl_video_create({
          type: msg.type,
          uri: msg.url,
          inner_window_info: ref.inner_window_info,
          localPath: ref.localPath,
          isDownload: ref.isDownload
        });
      } else {
        // publicFunc.log_upload('play', 'fail', msg.result) //记录日志：实时播放失败，失败原因
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
      let uri = obj.uri,
        chl_params = (obj.type == "publish") ? "" : ",thread:\"istream\", jitter:{max:3000}" /* for old version's mme plugin */,
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
            // console.log(string_speed, 'play.js chl_video_create', obj.inner_window_info.video_chls)
            if (string_speed.length >= 150) {
              let json_speed = eval("(" + string_speed + ")");
              // console.log(json_speed, 'json_speed')
              if (obj.isDownload) { // 下载调用
                if (json_speed.data.played_duration / data.videoSize > 1) {
                  json_speed.data.played_duration = data.videoSize;
                  l_speed = "100%";
                  clearInterval(l_ipc_speed_time); //5.11.3后加
                  publicFunc.msg_tips({
                    msg: mrs_download_completed,
                    type: "success",
                    timeout: 3000
                  });
                  // }
                } else {
                  record_played_duration_num = 0;
                  record_played_duration = json_speed.data.played_duration;
                  l_speed = parseInt((json_speed.data.played_duration / data.videoSize) * 100) + "%";
                }
                returnItem = l_speed
              } else if (playback) { // 回放调用
                let duration2 = sessionStorage.getItem("duration");
                let kb = json_speed.data.p2ping ? "kB" : "KB";
                l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes - l_Last_speed) / 1000) + kb : l_Last_speed = 0;
                if (duration2 == json_speed.data.played_duration) {
                  duration_tip = true;
                  sessionStorage.setItem("duration_tip", duration_tip)
                }
                l_Last_speed = json_speed.data.total_bytes;
                l_progress = parseInt((json_speed.data.played_duration / data.videoSize) * 100);
                sessionStorage.setItem("duration", json_speed.data.played_duration);
                let record_played_duration = json_speed.data.played_duration - duration2;
                returnItem = [l_speed, l_progress, record_played_duration]
              } else { // 直播调用
                let kb = json_speed.data.p2ping ? "kB" : "KB";
                l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes - l_Last_speed) / 1000) + kb : l_Last_speed = 0;
                l_Last_speed = json_speed.data.total_bytes;
                // console.log(l_speed, 'l_speed')
                // console.log(json_speed, 'json_speed')
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
        setTimeout(function () {
          play_ipc(obj)
        }, 1000)
      }
      return returnItem;
    }

    function play_ipc (obj) {
      obj.inner_window_info.mme.ctrl(obj.inner_window_info.video_chls, "play", "");
      obj.inner_window_info.playback_state = "play";
      return 0;
    }

    function create_play_ipc (obj) {
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
    return returnItem
  },
  async play_hls (data) {
    console.log('enter play_hls', data)
    // dom: $("#play_screen"),
    // sn: this.$store.state.jumpPageData.selectDeviceIpc,
    // profile_token: "p0" 播放方式(插件/flash/hls/截图播放)由mme文件进行选择切换
    let macFlag = navigator.userAgent.toLowerCase().indexOf('macintosh') > -1 ? true : false // mac客户端判别标识(自动播放)
    let new_data = {
      data: { sn: data.sn, dom: data.dom[0], stream: "major" },
      ref: { ref: "live_play_ack" },
      obj: data.dom,
      callback: function (msg, ref) {
        console.log(msg, ref, '调用播放打印回调')
      }
    }
    data = new_data
    // hls 播放
    let returnItem = null
    console.log(data, 'playData')
    var judge_enable_native_plug = true
    var judge_enable_flash_plug = false
    var ref_obj = create_play_ipc(data)
    var playback = data.playback ? 1 : 0;
    if (playback) {
      var token = data.data.token.split("-");
      data.data.sn = token[0];
      data.data.token = token[0] + "_" + token[1] + "_" + token[2] + "_end.cid:" + token[3] + "_end.sid:" + token[4];
      data.data.videoSize = data.data.duration * 1000;
    }
    var screen = data.data.dom
    screen.style.display = "block";
    console.log(screen, 'screen')
    var mme_params = {
      parent: screen,
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
    console.log(mme_params, 'screen_mme_params')
    var me1 = new mme_hls(mme_params);

    async function on_plug_event (obj) {
      console.log(obj.type)
      console.log(data, ref_obj, 'data.data.key_mme')
      switch (obj.type) {
        case "missing": {
          // if (!playback) {
          //   if ((navigator.userAgent.toLowerCase().match(/chrome\/[\d.]+/gi) + "").replace(/[^0-9.]/ig, "") > "44") {
          //     location.href = "https://www.adobe.com/go/getflashplayer";
          //   }
          // }
          var resolution = "p3"
          if (data.data.stream === "major") {
            resolution = "p1"
          }
          if (data.data.key_mme == '' || data.data.sn == '') {
            var result = new Object();
            result.data = {
              "result": "param err"
            };
            result.ref = data.ref;
            // onEvent(JSON.stringify(result))
          }
          // let var_protocol = "rtdp"
          // if (g_browser == "web") {
          let var_protocol = "http";
          // }
          console.log('do this func')
          if (!playback) {
            console.log('enter this func')
            publicFunc.showBufferPage()
            await axios.get('/ccm/ccm_play', {
              params: {
                sess: {
                  nid: login.create_nid(),
                  sn: ref_obj.sn
                },
                setup: {
                  stream: "RTP_Unicast",
                  trans: {
                    proto: var_protocol
                  }
                },
                token: resolution
              }
            }).then(res => {
              console.log(res, 'play(res)', data)
              var result = new Object()
              result.data = {
                "sn": data.data.sn,
                "url": res.url,
                "type": "hls",
                "key_mme": data.data.key_mme,
                "param": data
              };
              console.log('do this 1')
              return callNative("livePlay", result, "callback_live_play", data)
            })
          } else {
            publicFunc.showBufferPage()
            ms.send_msg("playback", {
              sn: data.data.sn,
              token: data.data.token,
              protocol: var_protocol,
              ref: ""
            }, data.ref, function (msg, ref) {
              publicFunc.closeBufferPage()
              var result = new Object();
              result.data = {
                "sn": data.data.sn,
                "url": msg.url,
                "type": "hls",
                "key_mme": data.data.key_mme,
                "param": data
              };
              result.ref = ref;
              console.log('do this 2')
              callNative("livePlay", JSON.stringify(result), "callback_live_play", data);
            });
          }
          console.log('do break')
          break;
        }
        case "ready": {
          var proto = obj.ref_obj.protocol;
          if (obj.plug.type.name == "flash") {
            l_plug_type = "flash";
            proto = "rtmp";
          } else {
            if (proto == "auto")
              proto = "rtdp";
          }
          if (playback) {
            publicFunc.showBufferPage()
            ref_obj = ref_obj.data;
            ms.send_msg("playback", {
              sn: ref_obj.sn,
              token: ref_obj.token,
              protocol: proto,
              ref: obj.ref_obj
            }, obj.ref_obj, function (msg, ref) {

              msg.type = "playback";
              play_ack(msg, ref);
            });
          } else {
            ms.send_msg("play", {
              sn: ref_obj.data.sn,
              token: obj.ref_obj.inner_window_info.profile_token,
              protocol: proto,
              ref: obj.ref_obj
            }, obj.ref_obj, function (msg, ref) {
              msg.type = "play";
              play_ack(msg, ref);
            });
          }
          break;
        }
        case "install_ui": {
          obj.panel.id = "plugin_install_page"
          break;
        }

      }
    }

    async function play_ack (msg, ref) {
      console.log('enter_play_ack')
      chl_video_create({
        type: msg.type,
        uri: msg.url,
        me1: me1
      });
      var result = new Object();
      result.data = {
        "sn": data.data.sn,
        "url": msg.url,
        "key_mme": data.data.key_mme,
        "param": data
      };
      result.ref = ref;
      window.closeBufferPage()
      console.log('do this 3')
      callNative("livePlay", JSON.stringify(result), "callback_live_play", data);
    }

    async function chl_video_create (obj) {
      var uri = obj.uri,
        chl_params = (obj.type == "publish") ? "" : ",thread:\"istream\", jitter:{max:3000}" /* for old version's mme plugin */,
        trans_params = (obj.type == "play") ? ",trans:[{flow_ctrl:\"jitter\",thread:\"istream\"}]" :
          ((obj.type == "playback") ? ",trans:[{flow_ctrl:\"delay\",thread:\"istream\"}]" : "");

      var params_data;
      var l_ipc_speed_time;
      var l_Last_speed = 0;
      var l_speed = 0;
      var l_progress = 0;

      params_data = "{" + ((obj.type == "publish") ? "dst" : "src") + ":[{url:\"" + uri + "\"}]" + trans_params + chl_params + "}";
      me1.video_chls = me1.chl_create({
        params: params_data
      });
      if (me1.video_chls !== null) {
        if (l_ipc_speed_time) {
          clearInterval(l_ipc_speed_time);
        }
        if (l_plug_type !== "flash") { // 该判断条件中需要添加!此为客户端逻辑(去掉!用于在浏览器中测试使用)
          l_ipc_speed_time = setInterval(function () {
            var string_speed = me1.ctrl(me1.video_chls, "query", "{}");
            if (string_speed.length >= 150) {
              var json_speed = eval("(" + string_speed + ")");
              var kb
              if (playback) {
                var duration2 = sessionStorage.getItem("duration");
                kb = json_speed.data.p2ping ? "kB" : "KB";
                l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes - l_Last_speed) / 1000) + kb : l_Last_speed = 0;
                if (duration2 == json_speed.data.played_duration) {
                  duration_tip = true;
                  sessionStorage.setItem("duration_tip", duration_tip)
                }
                l_Last_speed = json_speed.data.total_bytes;
                l_progress = parseInt((json_speed.data.played_duration / data.videoSize) * 100);
                sessionStorage.setItem("duration", json_speed.data.played_duration);

              } else {
                kb = json_speed.data.p2ping ? "kB" : "KB";
                l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes - l_Last_speed) / 1000) + kb : l_Last_speed = 0;
                l_Last_speed = json_speed.data.total_bytes;
              }
            }
          }, 1000)
        }
      }
      if (obj.type == "playback") {
        setTimeout(function () { play_ipc(obj) }, 1000)
      }
    }

    function play_ipc (obj) {
      me1.ctrl(me1.video_chls, "play", "");
      me1.playback_state = "play";
      return 0;
    }

    function create_play_ipc (obj) {
      obj.protocol = "auto";
      obj.videoSize = obj.videoSize ? obj.videoSize : 0;
      obj.localPath = obj.download_path ? obj.download_path : null;
      obj.inner_window_info = {
        dom_id: ("play_screen"),
        index: 1,
        video_chls: null,
        audio_chls: null,
        mme: null,
        ipc_state: "",
        node_sn: obj.sn,
        profile_token: 'p0'
      };
      return obj;
    }

    // msdk调用函数
    function callNative (func, param, callback, data) {
      var msdk = new MSdk(param)
      console.log(func, param, callback, 'callNative_')
      msdk.sdk_callNative(func, param).then(res => {
        if (callback === "callback_live_play") {
          callback_live_play(res)
        }
      })
    }
    function callback_live_play (param) {
      console.log(param, 'callback_live_play_param')
      var obj;
      if (typeof param === "string") {
        obj = eval("(" + param + ")");
      } else {
        obj = param;
      }
      var result = new Object();
      result.data = { "ref": obj.param.ref, "result": obj.result };
      result.ref = obj.param.ref;
      console.log(result, 'use onEvent1')
      // onEvent(JSON.stringify(result), data)
    }
    return returnItem

  },
  /*
   ** 暂停下载
   */
  pause_ipc () {
    let play_info = store.state.jumpPageData.playInfo
    if (play_info.inner_window_info.mme) {
      play_info.inner_window_info.mme.ctrl(play_info.inner_window_info.video_chls, "pause", "")
    }
    play_info.inner_window_info.playback_state = "pause"
  },
  /*
   ** 继续下载
   */
  play_download_continue () {
    let play_info = store.state.jumpPageData.playInfo
    play_info.inner_window_info.mme.ctrl(play_info.inner_window_info.video_chls, "play", "");
    play_info.inner_window_info.playback_state = "play";
  },
  /*
   ** 播放封面图
   */
  play_preview_img (params) {
    let url
    if (process.env.NODE_ENV === 'production') {
      url = (params.addr ? "http://" + params.addr : window.location.protocol + "//" + window.location.host) + "/ccm/ccm_pic_get.js?dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.pic_token + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
    } else {
      url = (params.addr ? "http://" + params.addr : window.location.protocol + "//" + window.location.host) + "/api/ccm/ccm_pic_get.js?dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.pic_token + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
    }
    params.dom.css('background-image', 'url(' + url + ')')
  },
  /*
   ** 全屏播放
   */
  fullscreen () {
    let play_info = store.state.jumpPageData.playInfo
    play_info.inner_window_info.mme.ctrl(0, "fullscreen", "");
  },
  /*
   ** 音量控制
   */
  voice (params) {
    let play_info = store.state.jumpPageData.playInfo
    var video_chls = play_info.inner_window_info.video_chls;
    play_info.inner_window_info.mme.ctrl(video_chls, "speaker.mute", params.flag ? "{value:1}" : "{value:0}");
  },
  /*
   ** 摄像头视角控制
   */
  play_ptz_turn (params) {
    // console.log(params, 'turn_params')
    let l_mark = {
      flag: "ready"
    }
    let l_move_x = 0
    let l_move_y = 0
    let interval
    if (params.direction === "left") {
      l_move_x = 12;
    } else if (params.direction === "right") {
      l_move_x = -12;
    } else if (params.direction === "up") {
      l_move_y = 12;
    } else if (params.direction === "down") {
      l_move_y = -12;
    }
    if (l_mark.flag === "ready") {
      l_mark.flag = "move"
      play.ptz_ctrl({
        sn: store.state.jumpPageData.selectDeviceIpc,
        x: -l_move_x,
        y: l_move_y
      }).then(res => {
        if (res.result === '') {
          if (l_mark.flag) {
            l_mark.flag = 'ready'
          }
        }
      })
    }
  },
  /*
   ** 摄像头视角控制接口
   */
  async ptz_ctrl (params) {
    // console.log(params, 'ptz_ctrl_params')
    let returnItem
    await axios.get('/ccm/ccm_ptz_ctl', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        trans: {
          pan_tilt: {
            x: params.x,
            y: params.y
          }
        },
        speed: {
          pan_tilt: {
            x: 30,
            y: 30
          }
        }
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res)
      }
    })
    return returnItem
  },
  /*
   ** 摄像头录像处理
   */
  play_record (params) {
    if (params.sn) {
      if (params.recording === 1) {
        play.record({
          sn: params.sn,
          keep_time: 60000
        }).then(res => {
          play.record_ack(res, params.recording)
        })
      } else {
        play.record({
          sn: params.sn,
          keep_time: -1
        }).then(res => {
          play.record_ack(res, params.recording)
        })
      }
    }
  },
  /*
   ** 摄像头录像接口
   */
  async record (params) {
    let returnItem
    await axios.get('/ccm/ccm_record_task_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res)
      if (result === '' && res.data.sd_ready === 1) {
        res.data.task.keep = params.keep_time
        play.record_task_set({ // 调用函数录像接口返回值
          sess: {
            nid: login.create_nid(),
            sn: params.sn
          },
          task: res.data.task
        }).then(res => {
          returnItem = res
        })
      } else {
        returnItem = {
          result: result,
          sd_ready: res.data.sd_ready
        }
      }
    })
    return returnItem
  },
  /*
   ** 摄像头录像设置任务接口
   */
  async record_task_set (params) {
    let task
    let returnItem
    if (params.task) { // 为两个不同的调用设置task参数值
      task = params.task // record中调用
    } else {
      task = { // 其他调用
        sch: {
          enable: params.enable,
          full_time: params.full_time,
          times: params.times
        }
      }
    }
    await axios.get('/ccm/ccm_record_task_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        task: task
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res)
      }
    })
    return returnItem
  },
  /*
   ** 录像回调处理函数
   */
  record_ack (msg, ref) {
    if (msg && msg.sd_ready === 0) {
      publicFunc.msg_tips({
        msg: mcs_sdcard_not_ready,
        type: "error",
        timeout: 3000
      });
    } else if (msg && msg.result === "") {
      if (ref.recording === 1) {
        console.log('do nothing')
      }
    } else if (msg.result === "permission.denied") {
      publicFunc.msg_tips({
        msg: mcs_permission_denied,
        type: "error",
        timeout: 3000
      });
    }
  },
  /*
   ** 实时截图
   */
  async play_snapshot (params) {
    let returnItem
    await axios.get('/ccm/ccm_snapshot', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "p0" // 暂为固定值
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        url: devlist.pic_url_get({
          sn: params.sn,
          token: 'p0'
        })
      }
    })
    if (returnItem && returnItem.result === '') { // 最终返回值
      returnItem = returnItem.url
    } else {
      returnItem = null
    }
    return returnItem
  },
  /*
   ** 对讲处理
   */
  play_speak (params) {
    let play_info = store.state.jumpPageData.playInfo
    if (params.flag) {
      play.push_talk({
        sn: store.state.jumpPageData.selectDeviceIpc,
        protocol: "rtdp",
        token: "p1"
      }).then(res => {
        chl_audio_create({
          type: "publish",
          uri: res.url,
          inner_window_info: play_info.inner_window_info
        })
      })
    } else {
      play_info.inner_window_info.mme.chl_destroy(play_info.inner_window_info.audio_chls);
    }

    function chl_audio_create (obj) {
      var uri = obj.uri,
        chl_params = "";
      obj.inner_window_info.audio_chls = obj.inner_window_info.mme.chl_create({
        params: ("{src:[{url:'mic://0',type:'audio'}], dst:[{url:'" + uri + "'}]" + (("" != chl_params) ? "," : "") + chl_params + "}")
      })
    }
  },
  /*
   ** 对讲接口
   */
  async push_talk (params) {
    let returnItem
    await axios.get('/ccm/ccm_talk', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        setup: {
          stream: "RTP_Unicast",
          trans: {
            proto: params.protocol
          }
        },
        token: params.token
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        url: res.data.uri ? res.data.uri.url : ""
      }
    })
    return returnItem
  },
  /*
   ** 获取视频地址
   */
  async adjust_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_video_srcs_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(async res => {
      let result = login.get_ret(res)
      let vss = res.data.vss
      let day
      let night
      let white_light
      let day_night
      let flip
      let flicker_freq
      let resolute
      let day_or_night
      let red_or_white
      let light_mode
      let brightness
      let contrast
      let color_saturation
      let sharpness
      if (result === "" && vss[0].extension.conf) {
        if (vss[0].extension.conf.day) {
          day = {
            brightness: vss[0].extension.conf.day.brightness,
            contrast: vss[0].extension.conf.day.contrast,
            color_saturation: vss[0].extension.conf.day.color_saturation,
            sharpness: vss[0].extension.conf.day.sharpness
          }
          night = {
            brightness: vss[0].extension.conf.night.brightness,
            contrast: vss[0].extension.conf.night.contrast,
            color_saturation: vss[0].extension.conf.night.color_saturation,
            sharpness: vss[0].extension.conf.night.sharpness
          }
          if (vss[0].extension.conf.white_light) {
            white_light = {
              brightness: vss[0].extension.conf.white_light.brightness,
              contrast: vss[0].extension.conf.white_light.contrast,
              color_saturation: vss[0].extension.conf.white_light.color_saturation,
              sharpness: vss[0].extension.conf.white_light.sharpness
            }
          }
        } else {
          brightness = vss[0].extension.conf.brightness;
          contrast = vss[0].extension.conf.contrast;
          color_saturation = vss[0].extension.conf.color_saturation;
          sharpness = vss[0].extension.conf.sharpness;
        }
        day_or_night = vss[0].extension.conf.day_or_night;
        red_or_white = vss[0].extension.conf.red_or_white;
        if (vss[0].extension.conf.mode) {
          day_night = vss[0].extension.conf.mode;
        } else {
          day_night = "auto";
        }
        if (vss[0].extension.conf.light_mode) {
          light_mode = vss[0].extension.conf.light_mode;
        } else {
          light_mode = "auto";
        }
        await axios.get('/ccm/ccm_misc_get', { // 该接口仅调用一次所以不单独拆分了
          params: {
            sess: {
              nid: login.create_nid(),
              sn: params.sn
            }
          }
        }).then(res_misc => {
          let result = login.get_ret(res_misc);
          if (result === "") {
            let msg = res_misc.data ? res_misc.data.info : "";
            flip = msg.flip; /* 0/1 0:none-flip, 1:filp */
            flicker_freq = msg.power_freq; /* 0/1 0:60hz, 1:50hz */
            resolute = res_misc.data.resolute; /*0/1 0:(4:3) 1:(16:9) */
          }
          returnItem = {
            result: result,
            day: day,
            night: night,
            white_light: white_light,
            day_night: day_night,
            flip: flip,
            flicker_freq: flicker_freq,
            resolute: resolute,
            day_or_night: day_or_night,
            red_or_white: red_or_white,
            light_mode: light_mode,
            brightness: brightness,
            contrast: contrast,
            color_saturation: color_saturation,
            sharpness: sharpness
          }
        })
      } else {
        returnItem = {
          result: result
        }
      }
    })
    return returnItem
  },
  /*
   ** 设置视频地址
   */
  async adjust_set (obj) {
    if (obj.conf) obj = obj.conf;
    let returnItem
    if (obj.is_white_light && obj.white_light == 1) {
      await play.img_set({
        sn: obj.sn,
        token: "vs0",
        conf: {
          day: {
            brightness: obj.day.brightness,
            contrast: obj.day.contrast,
            color_saturation: obj.day.color_saturation,
            sharpness: obj.day.sharpness
          },
          night: {
            brightness: obj.night.brightness,
            contrast: obj.night.contrast,
            color_saturation: obj.night.color_saturation,
            sharpness: obj.night.sharpness
          },
          white_light: {
            brightness: obj.white_light.brightness,
            contrast: obj.white_light.contrast,
            color_saturation: obj.white_light.color_saturation,
            sharpness: obj.white_light.sharpness
          },
          mode: obj.day_night,
          light_mode: obj.light_mode
        }
      }).then(async res => {
        let result = login.get_ret(res);
        if (result === "") {
          await play.misc_set({
            sn: obj.sn,
            info: {
              flip: obj.flip,
              power_freq: obj.flicker_freq
            },
            resolute: obj.resolute
          }).then(res_misc => {
            returnItem = res_misc
          })
        } else {
          returnItem = {
            result: result
          }
        }
      })
    } else if (obj.day) {
      await play.img_set({
        sn: obj.sn,
        token: "vs0",
        conf: {
          day: {
            brightness: obj.day.brightness,
            contrast: obj.day.contrast,
            color_saturation: obj.day.color_saturation,
            sharpness: obj.day.sharpness
          },
          night: {
            brightness: obj.night.brightness,
            contrast: obj.night.contrast,
            color_saturation: obj.night.color_saturation,
            sharpness: obj.night.sharpness
          },
          mode: obj.day_night,
          light_mode: obj.light_mode
        }
      }).then(async res => {
        let result = login.get_ret(res);
        if (result == "") {
          await play.misc_set({
            sn: obj.sn,
            info: {
              flip: obj.flip,
              power_freq: obj.flicker_freq
            },
            resolute: obj.resolute
          }).then(res_misc => {
            returnItem = res_misc
          })
        } else {
          returnItem = {
            result: result
          }
        }
      })
    } else {
      await play.img_set({
        sn: obj.sn,
        token: "vs0",
        conf: {
          brightness: obj.brightness,
          contrast: obj.contrast,
          color_saturation: obj.color_saturation,
          sharpness: obj.sharpness,
          mode: obj.day_night
        }
      }).then(async res => {
        let result = login.get_ret(res);
        if (result === "") {
          await play.misc_set({
            sn: obj.sn,
            info: {
              flip: obj.flip,
              power_freq: obj.flicker_freq
            },
            resolute: obj.resolute
          }).then(res_misc => {
            returnItem = res_misc
          })
        } else {
          returnItem = {
            result: result
          }
        }
      })
      if (obj.light_mode === "white" || obj.light_mode === "red") {
        play.img_set({
          sn: obj.sn,
          token: "vs0",
          conf: {
            light_mode: obj.light_mode
          }
        }).then(res => {
          returnItem = {
            result: login.get_ret(res)
          }
        })
      }
    }
    return await returnItem
  },
  /*
   ** 设置视频地址接口
   */
  async img_set (params) {
    return await axios.get('/ccm/ccm_img_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "vs0",
        conf: params.conf
      }
    })
  },
  /*
   ** 获取设置视频地址接口
   */
  async img_get (params) {
    return await axios.get('/ccm/ccm_img_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "vs0"
      }
    })
  },
  /*
   ** 杂项设置接口
   */
  async misc_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_misc_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        info: {
          flip: params.info.flip,
          power_freq: params.info.power_freq
        },
        resolute: params.resolute
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res)
      }
    })
    return returnItem
  },
  /*
   ** 设置设备详细时间
   */
  set_date_time (params) {
    let returnItem
    // 调用设置设备日期
    devlist.date_set(params).then(res_date_set => {
      let result_date_set = login.get_ret(res_date_set)
      if (result_date_set === '') {
        // 调用设置设备ntp
        devlist.ntp_set(params).then(res_ntp_set => {
          returnItem = {
            result: login.get_ret(res_ntp_set)
          }
        })
      } else {
        returnItem = {
          result: result_date_set
        }
      }
    })
    if (returnItem && returnItem.result == "") {
      returnItem = {
        msg: mcs_set_successfully,
        type: "success"
      }
    } else if (returnItem.result == "permission.denied") {
      returnItem = {
        msg: mcs_permission_denied,
        type: "error"
      }
    } else {
      returnItem = {
        msg: mcs_failed_to_set_the,
        type: "error"
      }
    }
    return returnItem
  },
  // vue-video-player
  async getPlayUrl (data) {
    return await axios.get('/ccm/ccm_play', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: data.sn
        },
        setup: {
          stream: "RTP_Unicast",
          trans: {
            proto: 'http' //'rtmp'
          }
        },
        token: data.profile_token
      }
    })
  },
  /*
   ** 点击开始/停止报警
   */ 
  async alarm (params){
    return await axios.get('/ccm/ccm_audio_ctrl', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn,
        },
        cmd: params.cmd
      }
    })
  }
}

export default play

function get_profile_token_choice (data) {
  var profile_token_obj = new Object();
  var profile_token_choice = data;
  if (profile_token_choice == "" || profile_token_choice == null) {
    if (store.state.jumpPageData.networkEnviron === "private") {
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
// 创建msdk
function msdk_create (param, data) {
  console.log('enter msdk_create', param, data)
  // g_appId = obj.setting.appId;
  // g_browser = obj.setting.platform;
  // g_language = obj.setting.language;
  // g_sdk_version = obj.setting.sdk_version;
  // g_time_zone = obj.setting.timeZone;

  var result = new Object();
  result.data = { "result": "" };
  // result.ref = obj.ref;
  // onEvent(JSON.stringify(result), data);
  play.play_hls(data)
}
// function onEvent (param, data) {
//   console.log(param, data, 'param, data, onEvent')
//   var msdk = new MSdk(param)
//   msdk.sdk_onEvent(param).then(res => {
//     console.log(res, 'onEvent', data)
//     return play.play_hls(data)
//   })
// }