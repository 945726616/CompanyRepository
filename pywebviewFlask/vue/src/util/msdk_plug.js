/* eslint-disable */
import mme_hls from './mme_hls.js'
// 建立msdk构造对象
let MSdk = function () {}
// 为msdk构造对象添加原型属性
MSdk.prototype = {
  // 创建函数
  create: async function (param) {
    console.log('enter msdk_create')
    var data = param.data
    var obj = new Object()
    obj.data = data
    obj.setting = {
      "platform": "web",
      "appId": "mipcm.com",
      "language": (navigator.language || navigator.browserLanguage).toLowerCase(),
      "sdk_version": "v1.1.1.1906122000",
      "timeZone": "Asia\/Shanghai"
    }
    // obj.ref = { "key_callback": msdk.indexOf(callback), "key_ref": msdk.indexOf(ref) }
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
    msdk_ctrl_mac(obj)
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
    var obj;
    obj = param
    console.log(obj, 'sdk_callNative')
    if (func == "livePlay" && obj.data.type == "hls") {

      function init (ref_obj) {
        return 0;
      }
      function start () {
        console.log('enter sdk_callNative_start', obj)
        var screen = document.getElementById(obj.data.param.data.dom)
        var ref_obj = { name: 'xxx' };
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
      var mme_params = start();
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
            me = new mme_hls(params);
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
      var mobj = { params: mme_params, counts: 0 };
      console.log(mobj, obj.data.url, 'tryGetM3u8')
      tryGetM3u8(mobj, obj.data.url);
    } else if (func == 'livePlayDestory') {
      me.chl_ctrl('destroy', 0)
    }
    var result = new Object();
    result.result = "";
    result.param = obj.data.param;
    console.log(result, 'finish_result')
    return JSON.stringify(result)
    // eval(callback + "(" + JSON.stringify(result) + ")")
  }
}
export default MSdk