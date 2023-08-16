/* eslint-disable */
import { dom } from 'video.js'
import mme_hls from './mme_hls.js'
// 建立msdk构造对象
let MSdk = function () { }
let msdk = []
let isInitializing = false
let isInitialized = false
// 为msdk构造对象添加原型属性
MSdk.prototype = {
  // 创建函数
  create: async function (param) {
    console.log('enter msdk_create', param)
    let data = param.data
    let obj = new Object()
    obj.data = data
    obj.setting = {
      "platform": "web",
      "appId": "mipcm.com",
      "language": (navigator.language || navigator.browserLanguage).toLowerCase(),
      "sdk_version": "v1.1.1.1906122000",
      "timeZone": "Asia\/Shanghai"
    }

    let iframe = document.createElement('iframe')
    iframe.src = "http://www.mipcm.com/entry.html"
    iframe.style = "display:none"
    document.body.appendChild(iframe)

    await new Promise((resolve) => {
      window.addEventListener('message', function (e) {
        console.log(e, 'msdk_plug_e')
        let time = setInterval(function () {
          if (typeof this.msdk_create != 'undefined' && this.msdk_create instanceof Function) {
            console.log('定时器进入')
            this.msdk_create(obj)
            clearInterval(time)
            isInitializing = false
            isInitialized = true
          }
        }.bind(this), 500)
      }.bind(this))
    })
    return obj
  },
  // 操控函数
  ctrl: function (param) {
    console.log(param, 'msdk_ctrl')
    var objectParam;
    if (typeof param === "string") {
      objectParam = eval("(" + param + ")");
    } else {
      objectParam = param;
    }
    console.log(objectParam)
    var data = objectParam.data;
    var cmd = objectParam.cmd;
    var ref = objectParam.ref;
    var object = objectParam.obj;
    var callback = objectParam.callback;
    data.func = cmd;
    // if (!isInitialized) {
    //   var obj;
    //   if (typeof param === "string") {
    //     obj = eval("(" + data + ")");
    //   } else {
    //     obj = data;
    //   }
    //   var result = new Object();
    //   result.ref = obj.ref;
    //   result.result = "is not create";
    //   callback(result);
    // }
    var obj = new Object();
    obj.data = data;

    obj.setting = {
      "platform": "web",
      "appId": "mipcm.com",
      "language": "zh",
      "sdk_version": "v1.1.1.1906122000",
      "timeZone": "Asia\/Shanghai"
    }
    msdk.push(object, callback, ref)
    obj.ref = { "key_callback": msdk.indexOf(callback), "key_obj": msdk.indexOf(object), "key_ref": msdk.indexOf(ref) };
    console.log(obj, 'msdk_ctrl_obj')
    // this.msdk_ctrl(obj)
  },
  // 操控内部事件
  sdk_onEvent: async function (param) {  //onEvent create ctrl
    var obj
    if (typeof param === "string") {
      obj = eval("(" + param + ")")
    } else {
      obj = param
    }
    // alert(JSON.stringify(obj),'sdk_onEvent')
    console.log(obj, 'sdk_onEvent_obj')
    return true
    //msdk[obj.ref.key_callback](obj.data, msdk[obj.ref.key_ref])
  },
  // video播放函数
  sdk_callNative: async function (func, param) { //play
    var obj
    obj = param
    console.log(obj, 'sdk_callNative')
    function init (ref_obj) {
      return 0;
    }
    function start () {
      console.log('enter sdk_callNative_start', obj)
      var screen // document.getElementById(obj.data.param.dom)
      if (func == "livePlay" && obj.data.type == "hls") {
        screen = obj.data.param.dom[0]
      } else {
        screen = obj.dom[0]
      }
      console.log(screen, 'screen')
      var ref_obj = { name: 'xxx' }
      var mme_params =
      {
        parent: screen,
        ref_obj: ref_obj,
        hls_id: 'hls-video',
        on_event: function (ref) { init(ref_obj) }
      };
      console.log(mme_params, 'mme_params')
      return mme_params;
    }
    function playEntry (me, obj, method) {

      if (method == 'chl_create') {
        var chl_params = "{src:[{url:\"" + obj + "\"}]}";
        me.chl_ctrl('create', { params: chl_params });
      } else if (method == 'chl_destroy') {
        console.log('enter destory')
        me.chl_ctrl('destroy', 0);
      } else if (method == 'chl_play') {
        me.chl_ctrl('play', 0);
      } else if (method == 'chl_pause') {
        me.chl_ctrl('pause', 0);
      } else if (method == 'chl_change') {
        me.chl_ctrl('change', obj);
      } else if (method == 'chl_catch_err') {
        console.log('enter ERROR')
        me.chl_ctrl('catch_err', obj);
      }
    }
    function tryGetM3u8 (mobj, url) {
      console.log(mobj, url, 'tryGetM3u8')
      var params = mobj.params;
      console.log(url, 'slice_url')
      $.ajax({
        url: url + '.m3u8',
        timeout: 3000,
        error: function (e) {
          mobj.counts++;
          setTimeout(function () {
            if (mobj.counts <= 25)
              tryGetM3u8(mobj, url);
            else
              alert('获取m3u8超时');
          }, 1000);
        },
        success: function (data) {
          // g_hls_play_flag = true
          console.log(params, 'getUrl')
          if (undefined != me.player && null != me.player) {
            playEntry(me, url, 'chl_change');
            playEntry(me, 0, 'chl_play');
          } else {
            playEntry(me, url, 'chl_create');
            var obj = {
              call: function (ref) {
                console.log(ref);
              }
            }
            playEntry(me, obj, 'chl_catch_err');
            playEntry(me, 0, 'chl_play');
          }
        }
      })
    }
    var mme_params = start()
    var mobj = { params: mme_params, counts: 0 }
    var me = new mme_hls(mme_params)
    // console.log(mobj, obj.data.url, 'tryGetM3u8')
    if (func == "livePlay" && obj.data.type == "hls") {
      tryGetM3u8(mobj, obj.data.url)
    }
     else if (func == 'destroyPlay'){
      console.log(123)
      playEntry(me, 0, 'chl_destroy')
    }
    var result = new Object();
    result.result = "";
    // result.param = obj.data.param;
    console.log(result, 'finish_result')
    return JSON.stringify(result)
    // eval(callback + "(" + JSON.stringify(result) + ")")
  },
  // msdk_create函数
  msdk_create: function (param) {
    console.log(JSON.stringify(param), 'msdk_create')
    let obj
    if (typeof param === "string") {
      obj = eval("(" + param + ")")
    } else {
      obj = param
    }
    // g_appId = obj.setting.appId
    // g_browser = obj.setting.platform
    // g_language = obj.setting.language
    // g_sdk_version = obj.setting.sdk_version
    // g_time_zone = obj.setting.timeZone

    // msdk_agent = new mcloud_agent()
    // window.ms = new class_mining_software()
    let result = new Object()
    result.data = { "result": "" }
    this.sdk_onEvent(JSON.stringify(result))
  },
}
export default MSdk