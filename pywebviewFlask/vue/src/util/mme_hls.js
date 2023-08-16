/* eslint-disable */
/*
    mme
    depends :
        mlib.core.json.js
        mlib.core.evt.js
    
    author : chengzhiyong   date : 2014-08-13   action : add denpends info
*/
/*-----------------media_engine-------------------------------------------------*/
/* dom's background:black for chrome*/
var mme_hls = function (obj/*
  {parent:xxx,
   on_event:function(event-object{plug:this, ref_obj:xxx}){},
   ref_obj:xxx,
   plug_install_mute:true|false,
   on_install_ui:function({panel:install_div_panel, download:cosebase-url}, params:"xxx=xxx"){build html download and use flash a-link with name=[flash|plug]}},
   enable_native_plug:true[default]|false,
   enable_flash_plug:true[default]|false
   */) {
this.create(obj);
}
mme_hls.prototype =
{

magic: "mme",
langs:
{
  en: {
    plz_select: "please select ",
    mic: "microphone",
    cam: "camera",
    and: "and ",

    set_done: "OK",
    installing: "Installing...",
    rebot_hint: "After Install, Restart Browser",
    install_mme: "Install Video Pluggin",

    try_flash: "Try Video with Flash",
    download: "Download and Install",
    l1: "More clear / high resolution video screen, a better full-screen display",
    l2: "Network intelligence to adapt, video connected to faster, more fluid video and audio effects",

    l3: "Safe and viruses, ease of use, reliable and professional organizations certified signatures",
    l4: "Permanent free",
    l5: "System Requirements: Windows XP or later; browser: IE, Chrome, Firefox, Safari, Opera ..."
  },
  cn: {
    plz_select: "选择",
    mic: "麦克风",
    cam: "摄像头",
    and: "和",

    set_done: "确定",
    installing: "正在安装...",
    rebot_hint: "安装完毕后重启浏览器",
    install_mme: "安装视频加速器",

    try_flash: "我先试试普通视频",
    download: "立即安装视频加速器",
    l1: "更清晰/高分辨率的视频画面，更好的全屏显示效果",
    l2: "网络智能适应，视频接通更快，影音效果更流畅",

    l3: "安全无病毒，放心使用，专业机构认证的可靠签名",
    l4: "永久免费",
    l5: "系统要求：Windows XP 或更高版本；浏览器：IE,Chrome,Firefox,Safari,Opera..."
  }
},
types:
{
  install: { codebase: (navigator.platform == "MacIntel") ? "mme/npmme.pkg?0.160622.pkg" : "mme/mme.exe?0.160622.exe" },
  activex: { name: "activex", xname: "MME.MMECtrl.1", clsid: "F3711E49-C6C3-4598-8888-8FD986250C98", codebase: "mme/mme_ie.cab", install_url: "", install_img: "", install_hint: "" },
  xpcom: { name: "xpcom", mime: (window.fujikam == "fujikam" ? "application/mining-media-enginex" : "application/mining-media-engine"), codebase: "mme/npmme.xpi", install_url: "", install_img: "", install_hint: "" },
  flash: {
    name: "flash", xname: "ShockwaveFlash.ShockwaveFlash", mime: "application/x-shockwave-flash", clsid: "D27CDB6E-AE6D-11cf-96B8-444553540000",
    codebase: "", install_img: "",
    install_url: "https://www.adobe.com/go/getflashplayer", src: "http://45.113.201.4:7080/dcm/sdk_plug/mme/mme.swf?0.130715.swf", install_hint: ""
  }
},
debug: true,
windowless: (0 > ("" + navigator.platform).indexOf("Linux"))/* true, linux:if true will can not auto open cammer(must set global setting enable acess) */,
id_allocer: { value: 0 },
//    ver_min:0.140906,
// ver_min:0.160622,
ver_min: 0.160814,
chl_status: { closed: 0, initting: 1, initting_device: 2, running: 3 },
plug_status: { closed: 0, initting: 1, installing: 2, running: 3 },
enable_native_plug: true,
enable_flash_plug: true,
/* chls:[], type:"publish"|"play", url:"xxx", running:true|false, timer:inerval, times:time-out-check-counts, refer:user-data */
get_default_skin: function () { return { dev_panel: { width: 360, height: 180 } }; },
create_plug: function (parent, enable_flash_plug, enable_native_plug, plug_params) {
  var test, info, plug = null, id = this.id ? this.id : (++this.id_allocer.value), type = null,
    ie = (!!window.ActiveXObject || "ActiveXObject" in window);

  if (enable_native_plug && ((null == this.ver_cur) || (this.ver_cur >= this.ver_min))) {/* plugin just support win32 now */
    if (ie && (navigator.platform == "Win32")) { try { test = new ActiveXObject(this.types.activex.xname); type = this.types.activex; } catch (e) { } }
    else if ((null != navigator.mimeTypes)
      && (0 < navigator.mimeTypes.length)
      && (null != navigator.mimeTypes[this.types.xpcom.mime])
      && navigator.mimeTypes[this.types.xpcom.mime].enabledPlugin) { type = this.types.xpcom; }
  }
  if (!type && enable_flash_plug) {/* check flash */
    if (ie) { try { test = new ActiveXObject(this.types.flash.xname); type = this.types.flash; } catch (e) { } }
    else if ((null != navigator.mimeTypes)
      && (0 < navigator.mimeTypes.length)
      && (null != navigator.mimeTypes[this.types.flash.mime])
      && navigator.mimeTypes[this.types.flash.mime].enabledPlugin) { type = this.types.flash; }
  }

  if (type) {
    if (this.type != mme_hls.prototype) { this.type = type; }
    plug_params = plug_params.replace(/'/g, "\"");
    //plug_params = codec.str_2_uri_param((plug_params)?plug_params.replace(/'/g, "\""):plug_params);

    /* for chrome video color error bug hack */
    if ((navigator.platform == "Win32") && navigator.userAgent.toLowerCase().match(/chrome\/([\d.]+)/)) {
      parent.style.background = "black";
    }

    parent.innerHTML = "<object id='plug_" + id + "' width='100%' height='100%'"
      + (ie ? (" classid='clsid:" + type.clsid + "'") : (" type='" + type.mime + "'"))
      + " codebase='" + type.codebase + "'"
      + ((type == this.types.flash) ? (" data='" + type.src + "'" + (this.windowless ? (" wmode='transparent'") : "")) : "")
      + ">"
      + ((type == this.types.flash) ?
        (" <param name='movie' value='" + type.src + "'/>"
          + " <param name='allowScriptAccess' value='always'/>"
          + " <param name='flashVars' value='mme_debug=" + this.debug + "&mme_on_event=plug_" + this.id + "_on_event&mme_params=" + encodeURIComponent(plug_params) + "'/>"
          + " <param name='allowFullScreen' value='true'/>"
          + (this.windowless ? (" <param name='wmode' value='transparent'/>") : "")
          + "   <a href='" + type.install_url + "'>"
          + "        <img border='none' src='" + type.install_img + "' alt='" + type.install_hint + "'/>"
          + "   </a>")
        : (" <param name='mme_on_event' value='plug_" + this.id + "_on_event'/>"
          + (this.windowless ? (" <param name='windowless' value='" + this.windowless + "'/>") : "")
          + "<param name='mme_params' value='" + plug_params + "'/>"))
      + "</object>";
    plug = ie ? window["plug_" + id] : document.getElementById("plug_" + id);
    if (plug) {
      try {
        if ((type.name != "flash")
          && (info = meval(plug.ctrl(0, "query", "{flag:65535}")))) {
          mme_hls.prototype.ver_cur = info.version;
          if (info.version < this.ver_min) {/* version to small */
            parent.innerHTML = "";
            return null;
          }
        }
      } catch (x) { }
    }
    else {
      parent.innerHTML = "";
    }
    return plug;
  }
  return null;
},

/* plug_valid: */
check_plug_install: function (ref, on_check_ack/* function(ref, version) */) {
  var plug, info, timer, timer_counts = 20, cont = document.createElement("div"), ret = false;
  cont.style.cssText = "position:absolute;width:1px;height:1px;left:-1px;top:-1px;";
  document.body.appendChild(cont);
  if (plug = this.create_plug(cont, false, true, "{}")) {/* have none flash plugin */
    timer = setInterval(function () {
      if (((plug && ("undefined" != typeof (plug.ctrl)))
        || (0 >= (--timer_counts)))) {
        /* if("undefined" != typeof(plug.clipboard_get_img))
        {
            mme_hls.prototype.clipboard_plug = plug;
        }*/
        if (plug && ("undefined" != typeof (plug.ctrl))) {
          try {
            if (info = meval(plug.ctrl(0, "query", "{flag:65535}"))) {
              ret = (info.version >= mme_hls.prototype.ver_min);
              mme_hls.prototype.plug_valid = ret;
            }
          } catch (x) { }
        }
        clearInterval(timer);
        cont.innerHTML = "";
        cont.parentNode.removeChild(cont);
        on_check_ack(ref, info ? info.version : null);
      }
    }, 50);
  }
  else {
    cont.innerHTML = "";
    cont.parentNode.removeChild(cont);
    on_check_ack(ref, (null == this.ver_cur) ? null : this.ver_cur);
  }
},
clipboard_get_img: function (mime) {
  if (null == this.clipboard_plug) {
    document.body.appendChild(mme_hls.prototype.clipboard_cont = document.createElement("div"));
    mme_hls.prototype.clipboard_cont.style.cssText = "position:absolute;top:-1px;left:-1px;width:1px;height:1px;";
    mme_hls.prototype.clipboard_plug = mme_hls.prototype.create_plug(mme_hls.prototype.clipboard_cont, false, true, "{}");
    if ((null == mme_hls.prototype.clipboard_plug)
      || ("undefined" == typeof (mme_hls.prototype.clipboard_plug.clipboard_get_img))) {
      mme_hls.prototype.clipboard_plug = null;
      mme_hls.prototype.clipboard_cont.innerHTML = "";
      mme_hls.prototype.clipboard_cont.parentNode.removeChild(mme_hls.prototype.clipboard_cont);
      mme_hls.prototype.clipboard_cont = undefined;
    }
  }
  return this.clipboard_plug ? this.clipboard_plug.clipboard_get_img(mime) : null;
},
clear_install: function () {
  if (this.install_timer) { clearInterval(this.install_timer); delete this.install_timer; }
  if (this.install_panel) { if (this.install_panel) { this.install_panel.innerHTML = ""; this.install_panel.parentNode.removeChild(this.install_panel); } delete this.install_panel; }
  if (this.install_test_panel) { if (this.install_test_panel.parentNode) { this.install_test_panel.innerHTML = ""; this.install_test_panel.parentNode.removeChild(this.install_test_panel); } delete this.install_test_panel; }
},

install: function () {
  var a, i, link_name, alist, me = this, codebase = mme_hls.prototype.types.install.codebase,
    description_flag = 'block', button_width = 210, font_size = 18, flash_float_type = 'left', plug_float_type = 'right',
    plug_magin_top = 0, description_div, title_flag = 'block', install_div, flash_a, plug_a, title_center;
  this.clear_install();
  this.parent.appendChild(this.install_panel = document.createElement("div"));
  install_div = this.install_panel;
  function setFloatStyle (obj, style) {
    var sty = obj.style;
    if ('cssFloat' in sty) {
      obj.style.cssFloat = style;
    } else if ('styleFloat' in sty) {
      obj.style.styleFloat = style;
    }
  }
  /* build default ui */
  //this.install_panel.style.cssText = "position:absolute;left:0px;top:0px;width:100%;height:100%;background-color: black;color:#fff;line-height:2em;font-size:14px;visibility:hidden;";
  if (install_div.clientWidth < 460 || install_div.clientHeight < 320) {
    description_flag = 'none';
  }
  if (install_div.clientWidth < 460) {
    button_width = install_div.clientWidth * 0.8;
    font_size = 12;
    flash_float_type = 'none';
    plug_float_type = 'none';
    plug_magin_top = 5;
  }
  if (install_div.clientWidth < 290 || install_div.clientHeight < 160) {
    title_flag = 'none';
  }
  this.install_panel.innerHTML =
    "<div style='position:absolute;left:4%;width:92%;overflow:none;'>"
    + "<center id='title_center' style='display:" + title_flag + "'><span style='font-size:18px;'><b>" + this.lang.install_mme + "</b></span></center><br/>"
    + "<div id='install_description_div' style='display:" + description_flag + "'>"
    + "<li>" + this.lang.l1 + "</li><li>" + this.lang.l2 + "</li><li>" + this.lang.l3 + "</li>"
    + "<li>" + this.lang.l4 + "</li><li>" + this.lang.l5 + "</li><br/>"
    + "</div>"
    + "<a name='flash' href='#'"
    + " style='float:" + flash_float_type + ";background:#333;font-size:" + font_size + "px;color:#fff;text-decoration:none;text-align:center;"
    + "display:inline-block;width:" + button_width + "px;height:auto;line-height:32px;"
    + "-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5Px;"
    + mhack.css_box_shadow(1, "#666666") + "'"
    + " onmouseover='this.style.background=\"#666\";'"
    + " onmouseout='this.style.background=\"#333\";'"
    + " >" + this.lang.try_flash + "</a>"
    + "<a name='plug' href='" + codebase + "' target='_blank'"
    + " style='float:" + plug_float_type + ";background:#333;font-size:" + font_size + "px;color:#fff;text-decoration:none;text-align:center;"
    + "display:inline-block;width:" + button_width + "px;height:auto;margin-top:" + plug_magin_top + "px;line-height:32px;"
    + "-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5Px;"
    + mhack.css_box_shadow(1, "#666666") + "'"
    + " onmouseover='this.style.background=\"#666\";'"
    + " onmouseout='this.style.background=\"#333\";'"
    + ">" + this.lang.download + "</a>"
    + "<span name='plug_installing' style='display:none'></span>"
    + "</div><div style='float:clear;'></div>";

  document.body.appendChild(this.install_test_panel = document.createElement("div"));

  window.onresize = function () {
    description_div = document.getElementById("install_description_div");
    title_center = document.getElementById("title_center");
    flash_a = dom_get_item_by_name(install_div, "*", "flash");
    plug_a = dom_get_item_by_name(install_div, "*", "plug");
    if (description_div)
      description_div.style.display = (install_div.clientWidth < 460 || install_div.clientHeight < 320) ? 'none' : 'block';
    if (install_div.clientWidth < 460) {
      if (flash_a) {
        flash_a.style.width = install_div.clientWidth * 0.8 + 'px';
        setFloatStyle(flash_a, 'none');
        flash_a.style.fontSize = '12px';
      }
      if (plug_a) {
        plug_a.style.width = install_div.clientWidth * 0.8 + 'px';
        setFloatStyle(plug_a, 'none');
        plug_a.style.marginTop = '5px';
        plug_a.style.fontSize = '12px';
      }
    }
    else {
      if (flash_a) {
        // flash_a.style.width='210px';
        // setFloatStyle(flash_a,'left');
        // flash_a.style.fontSize='18px';
      }
      if (plug_a) {
        // plug_a.style.width='210px';
        // setFloatStyle(plug_a,'right');
        // plug_a.style.marginTop='0px';
        // plug_a.style.fontSize='18px';
      }
    }
    if (title_center)
      title_center.style.display = (install_div.clientWidth < 290 && install_div.clientHeight < 160) ? 'none' : 'block';
  }
  if (this.on_event) {
    /* function({panel:install_div_panel, download:cosebase-url}){ build html-content, must let first a-link as try-flash, and second a-link is download with name=[flash|plug]} */
    this.on_event({ type: "install_ui", panel: this.install_panel, download: codebase, ver_cur: this.ver_cur });
  }
  this.install_panel.style.visibility = "";
  this.install_test_panel.style.cssText = "position:absolute;left:-1px;top:-1px;width:1px;height:1px;";
  if (a = dom_get_item_by_name(this.install_panel, "*", "flash")) {
    mevt.bind(a, "click", function (e) {
      me.clear_install();
      me.status = me.plug_status.initting;
      if (null == (me.plug_obj = me.create_plug(me.parent, true, true, me.create_params))) {
        me.status = me.plug_status.closed;
        if (me.on_event) {console.log('this missing'); me.on_event({ type: "missing" }); }
      }
      else {
        if (me.on_event) { me.on_event({ type: "create" }); }
      }
      return false;
    });
  }
  if (a = dom_get_item_by_name(this.install_panel, "*", "plug")) {
    mevt.bind(a, "click", function (e) {
      a = dom_get_item_by_name(me.install_panel, "*", "plug_installing");
      if (a) {
        a.style.display = "";
        a.innerHTML = me.lang.installing;
        if (a = dom_get_item_by_name(me.install_panel, "*", "plug")) {
          a.style.display = "none";
        }
      }
      else if (a = dom_get_item_by_name(me.install_panel, "*", "plug")) {
        a.innerHTML = "<b>" + ((mhack.ie || mhack.chrome) ? me.lang.installing : me.lang.rebot_hint) + "</b>";
      }
      if (mhack.ie || mhack.chrome) {
        me.install_timer = setInterval(function () {
          if (mme_hls.prototype.create_plug(me.install_test_panel, false, true, me.create_params)) {
            me.clear_install();
            me.status = me.plug_status.initting;
            if (null == (me.plug_obj = me.create_plug(me.parent, true, true, me.create_params))) {
              me.status = me.plug_status.closed;
              if (me.on_event) { console.log('this missing'); me.on_event({ type: "missing" }); }
            }
            else {
              if (me.on_event) { me.on_event({ type: "create" }); }
            }
          }
        }, 1000);
      }
    });
  }
},

on_plug_event: function (json) {
  var e = meval(json);
  if (null == e) {/* xxxxxx error. what append. */
    return 0;
  }

  if (e.target && e.target.type && e.target.url) {
    e.chl = this.chl_get(e.target.type, e.target.url)
  }

  switch (e.type) {
    case "is_ready": { return (null != this.plug_obj); break; }
    case "ready": { this.status = this.plug_status.running; break; }
    case "close":
      {
        if (e.chl) { e.chl.status = this.chl_status.closed; e.chl.id = 0; }
        break;
      }
    case "active": { break; }
  }
  if (this.is_created && this.on_event) {
    this.on_event(e);
  }
  return 0;
},
create: function (obj) {
  console.log(obj, 'hls_mme_create_obj')
  var parent = obj.parent, me = this;
  if (undefined != obj.hls_id && null != obj.hls_id) {

    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      this.platform = 'ios';
    } else if (/(Android)/i.test(navigator.userAgent)) {
      this.platform = 'android';
    } else {
      this.platform = 'pc';
    }

    this.hls_id = obj.hls_id;
    this.ref_obj = obj.ref_obj;
    this.parent = parent;
    this.ref_obj.mme = this;
    this.on_event = obj.on_event;

    var video = null;
    if (this.platform == 'pc') {
      var play_screen = obj.parent
      play_screen.innerHTML = '<video  class="video-js vjs-default-skin vjs-big-play-centered" webkit-playsinline="true" playsinline="true" x5-video-player-type="h5-page"><source id="hls-vs" type="application/x-mpegURL"></video>';
      video = play_screen.getElementsByClassName('video-js vjs-default-skin vjs-big-play-centered')[0];
      console.log(video, 'video_dom')
      video.width = play_screen.offsetWidth;
      video.height = play_screen.offsetHeight;
    }
    video.id = this.hls_id;
    this.player = null;
    this.on_event(this.ref_obj);
    return 0;
  }

  /* init parent and skin */
  this.skin = this.get_default_skin();
  if ("object" == typeof (obj.skin)) {
    obj_merge(this.skin, obj.skin);
  }
  this.parent = parent;
  if (undefined != obj.debug) { this.debug = obj.debug; }
  if (undefined != obj.windowless) { this.windowless = obj.windowless; }
  if (undefined != obj.enable_native_plug) { this.enable_native_plug = obj.enable_native_plug; }
  if (undefined != obj.enable_flash_plug) { this.enable_flash_plug = obj.enable_flash_plug; }
  this.on_event = obj.on_event;
  this.cam_index = -1;
  this.mic_index = -1;
  this.chls = [];
  this.create_params = obj.params || "";
  this.ref_obj = obj.ref_obj;
  this.is_created = false;
  if (obj.on_event) {
    this.on_event_callback = obj.on_event;
    this.on_event = function (e) {
      e.plug = me;
      e.ref_obj = me.ref_obj;
      me.on_event_callback(e);
      e.plug = (e.ref_obj = null);
    };
  }

  /* do create */
  this.id = (++this.id_allocer.value);
  window["plug_" + this.id + "_on_event"] = function (s) { return me.on_plug_event(s); };
  this.status = this.plug_status.initting;

  /* try create native plugin */
  if (null == (this.plug_obj = this.create_plug(parent,
    this.enable_flash_plug && ((!obj.plug_install_mute) || ((navigator.platform != "Win32") && (navigator.platform != "MacIntel"))),  //(!!obj.plug_install_mute)
    this.enable_native_plug,
    this.create_params))) {/* create native plug in failed */
    if (this.enable_native_plug
      && (!obj.plug_install_mute)
      && ((navigator.platform == "Win32") || (navigator.platform == "MacIntel"))) {/* try install */

      if (this.ver_cur >= this.ver_min) {/* old plugin with lower version */
        me.status = me.plug_status.initting;
        if (null == (me.plug_obj = me.create_plug(parent, true, true, me.create_params))) {
          me.status = me.plug_status.closed;
          if (me.on_event) { console.log('this missing'); me.on_event({ type: "missing" }); }
        }
        else {
          if (me.on_event) { me.on_event({ type: "create" }); }
        }
      }
      else {
        // this.status = this.plug_status.installing;//去掉使用普通视频播放页面
        me.status = me.plug_status.initting;
        if (null == (me.plug_obj = me.create_plug(parent, true, true, me.create_params))) {
          me.status = me.plug_status.closed;
          if (me.on_event) { console.log('this missing'); me.on_event({ type: "missing" }); }
        }
        else {
          if (me.on_event) { me.on_event({ type: "create" }); }
        }
        // this.install(function() //去掉使用普通视频播放页面
        //     {
        //         me.status = me.plug_status.initting;
        //         if(null == (me.plug_obj = me.create_plug(parent, true, true, me.create_params)))
        //         {
        //             me.status = me.plug_status.closed;
        //             if(me.on_event){me.on_event({type:"missing"});};
        //         }
        //         else
        //         {
        //             if(me.on_event){me.on_event({type:"create"});};
        //         }
        //     });
      }
    }
    else {/* can not install */
      me.status = me.plug_status.closed;
      if (me.on_event) { me.on_event({ type: "missing" }); }
    }
  }
  else if ((this.status == this.plug_status.running) && me.on_event) {
    setTimeout(function () { if (me.on_event) { me.on_event({ type: "ready" }); } }, 0);
  }
  this.is_created = true;
},
destroy: function () {
  this.clear_install();
  window["plug_" + this.id + "_on_event"] = null;
  for (var chl, i = this.chls.length - 1; 0 <= i; --i) {
    if (chl = this.chls[i]) { this.chl_destroy(chl); }
  }

  if (this.dev_form) {
    this.dev_form.onsubmit = null;
    this.dev_form.innerHTML = "";
    this.dev_form.parentNode.removeChild(this.dev_form);
    delete this.dev_form;
  }

  if (this.plug_obj) { delete this.plug_obj; }
  if (this.parent) {
    this.parent.innerTHML = "";
    delete this.parent;
  }
  if (this.id) { delete this.id; }
  if (this.status) { delete this.status; }
  if (this.on_event) { delete this.on_event; }
},
update: function () {
},

is_ready: function (func) {
  return (this.plug_obj
    && (this.status == this.plug_status.running)
    && ((null == func) || (("undefined" != typeof (this.plug_obj[func])))));
},

select_device: function (cams, mics, on_done) {
  var dev, i, radio, radios, me = this, dev_form = this.dev_form, html = "";
  if (null == dev_form) {
    this.parent.appendChild(this.dev_from = (dev_form = document.createElement('form')));
    dev_form.style.cssText = "position:absolute;left:0px;top:0px;width:100%;height:100%;overflow-y:auto;overflow-x:none;padding:0px;margin:0px;background:transparent;background:#000;color:#fff;line-height:1.5em;font-size:12px;";
  }
  dev_form.style.visibility = "hidden";
  dev_form.innerHTML = "";
  //dev_form.style.display = "";
  html += "<div style='position:absolute;left:5%;width:90%'><br/><center><span style='font-size:18x;'><b>" + this.lang.plz_select + this.lang.cam + this.lang.and + this.lang.mic + "</span></center>"
  if (cams && (0 < cams.length)) {
    html += "<br/><span>" + this.lang.cam + "</span><br/>";
    for (i = 0; i < cams.length; i++) {
      dev = cams[i];
      html += "<input type='radio' name='cam' id='cam_" + dev.index + "' value='" + dev.index + "' " + ((0 == i) ? "checked" : "") + "/>"
        + "<label for='cam_" + dev.index + "'>" + dev.name + "</label><br/>"
    }
  }
  if (mics && (0 < mics.length)) {
    html += "<br/><span>" + this.lang.mic + "</span><br/>";
    for (i = 0; i < mics.length; i++) {
      dev = mics[i];
      html += "<input type='radio' name='mic' id='mic_" + dev.index + "' value='" + dev.index + "' " + ((0 == i) ? "checked" : "") + "/>"
        + "<label for='mic_" + dev.index + "'>" + dev.name + "</label><br/>"
    }
  }
  html += "<br/><center>"
    + "<input type='submit' value='" + this.lang.set_done + "'"
    + " onmouseover='this.style.background=\"#666\";'"
    + " onmouseout='this.style.background=\"#333\";'"
    + " style='cursor:pointer;border:none;padding:0px;margin:0px;font-size:14px;color:#fff;width:120px;height:24px;"
    + "-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3Px;"
    + mhack.css_box_shadow(1, "#666666")
    + "line-height:32px;background:#333;'/></center></div>";
  dev_form.innerHTML = html;

  if (this.on_event) {/* call back */
    this.on_event({ type: "select_device_ui", form: dev_form, mics: mics, cams: cams });
  }
  dev_form.style.visibility = "";

  dev_form.onsubmit = function () {
    for (i = 0, radios = dev_form.getElementsByTagName("input"); i < radios.length; ++i) {
      if (((radio = radios[i]).type == "radio") && radio.checked) {
        if (radio.name == "cam") { me.cam_index = radio.value; }
        else if (radio.name == "mic") { me.mic_index = radio.value; }
      }
    }
    dev_form.style.display = "none";
    on_done();
    return false;
  }
},
init_device: function (obj/* {on_done:function(is_valid)}*/) {
  var me = this;
  function on_init_device_done () {
    if (obj.on_done) { obj.on_done(); }
  }
  if (null == this.plug_info) {
    this.plug_info = meval(this.plug_obj.ctrl(0, "query", "{flag:65535}"));
    if (this.plug_info && this.plug_info.camera) {/* remove google vitual camera */
      var cam_arr = [], i, cam, cams = this.plug_info.camera;
      for (i = 0; i < cams.length; ++i) {
        if ((cam = cams[i]) && (cam.name.indexOf("Google Camera Adapter") < 0)) { cam_arr.push(cam); }
      }
      this.plug_info.camera = cam_arr;
    }
  }

  if ((0 > this.cam_index) && (this.plug_info.camera.length == 1)) {
    this.cam_index = this.plug_info.camera[0].index;
  }
  if ((0 > this.mic_index) && (this.plug_info.microphone.length >= 1)) {
    this.mic_index = this.plug_info.microphone[0].index;
  }
  if (((0 > this.cam_index) && (1 < this.plug_info.camera.length))
         /* ||((0 > this.mic_index) && (1 < this.plug_info.microphone.length))*/) {
    this.select_device(this.plug_info.camera, this.plug_info.microphone, on_init_device_done);
  }
  else {
    on_init_device_done();
  }
},

chl_get: function (type, url) {
  for (var chls = this.chls, i = chls.length - 1; i >= 0; --i) {
    if ((chl = chls[i]) && (chl.type == type) && (url == chl.url)) { return chl; }
  }
  return null;
},
chl_destroy: function (chl) {
  console.log(chl, chls, this.player,'destroy_chl')
  if (undefined != this.hls_id && null != this.hls_id && null != this.player) {
    this.player.dispose();
    this.player = null;
    return 0;
  }
  for (var chls = this.chls, i = chls.length - 1; i >= 0; --i) {
    if (chl == chls[i]) {
      if (chl.timer) { clearTimeout(chl.timer); chl.timer = null; }
      if (this.chl_status.initting_device == chl.status) { this.dev_from.style.display = "none"; }
      chl.status = this.chl_status.stopped;
      if (0 < chl.id) {
        if (this.is_ready("chl_destroy")) { this.plug_obj.chl_destroy(chl.id); }
        chl.id = 0;
      }
      chl.refer = null;
      chls.splice(i, 1);
      break;
    }
  }
},
chl_dev_index_param: function (cam_index, mic_index) {
  return "\ncam.index=" + cam_index + "\nmic.index=" + mic_index;
},
chl_ctrl: function (method, obj) {
  if (undefined != this.hls_id && null != this.hls_id) {
    if (method == 'create') {
      this.chl_create(obj);
    } else if (method == 'destroy') {
      this.chl_destroy(0);
      // console.log(this.player, "destroy_player")
      // this.player.dispose();
    } else if (method == 'play') {
      console.log(this.player, "play_player")
      this.player.play();
    } else if (method == 'pause') {
      this.player.pause();
    } else if (method == 'change') {
      if (this.platform == 'pc')
        this.player.src({ src: obj + '.m3u8', type: "application/x-mpegURL" });
      else {
        this.player.src = obj + '.m3u8';
        this.player.load();
      }
      // this.player.play();
    } else if (method == 'catch_err') {
      if (this.platform == 'pc') {
        this.player.on('error', function () {
          var mediaError = this.error();
          var info = null;
          if (mediaError.code == 1) {
            info = "视频播放被终止";
          } else if (mediaError.code == 2) {
            info = "网络错误导致视频下载中途失败";
          } else if (mediaError.code == 3) {
            info = "由于视频文件损坏或是该视频使用了你的浏览器不支持的功能，播放终止";
          } else if (mediaError.code == 4) {
            info = "视频因格式不支持或者服务器或网络的问题无法加载";
          } else if (mediaError.code == 5) {
            var info = "视频已加密，无法解密";
          }
          obj.call(info);
        });
      }
    }
  }
},
chl_create: function (obj/*{type:"publish"|"play", url:"xxx", params:"", refer:xxx}*/) {
  if (undefined != this.hls_id && null != this.hls_id) {
    var options = {
      html5: {
        hlsjsConfig: {
          // Put your hls.js config here
          manifestLoadingTimeOut: 20000,
          levelLoadingTimeOut: 20000,
          levelLoadingMaxRetry: 20,
          fragLoadingMaxRetry: 20,
          manifestLoadingMaxRetry: 20,
          manifestLoadingRetryDelay: 2000,
          fragLoadingRetryDelay: 1000
        }
      }
    };
    var json_chl_params = meval(obj.params);
    var url = json_chl_params.src[0].url;
    var video = document.getElementById(this.hls_id);

    if (this.platform == 'pc') {
      var videoVs = video.getElementsByTagName('source')[0];
      videoVs.src = url + '.m3u8';
      console.log(this.hls_id, options, 'videojs')
      this.player = videojs(this.hls_id, options);
      this.player.src({ src: url + '.m3u8', type: "application/x-mpegURL" });
      // player.pause();
      // this.player.play();
      return this.player;
    }
    else {
      video.src = url + '.m3u8';
      this.player = video;
      // video.play();
      return this.player;
    }
  }
  if (!this.is_ready("chl_create")) {
    return null;
  }
  else {
    var me = this, ret, chl = { params: (obj.params || "") };
    if (0 >= (chl.id = me.plug_obj.chl_create(chl.params))) {
      return null;
    }
    this.chls[this.chls.length] = chl;
    return chl;
  }
},
ctrl: function (chl, method, params) {
  try {
    return this.is_ready("ctrl") ? this.plug_obj.ctrl(chl ? chl.id : 0, method, params) : "{type:\"error\",status:-1}";
  } catch (e) {
    return "{type:\"error\",status:-1}";
  }
}
}
// 添加base文件中的dom_get_item_by_name函数
function dom_get_item_by_name (root, tag_name, name) {
  let nodes = root.getElementsByTagName(tag_name)
  if (nodes) {
    for (let node_index = 0; node_index < nodes.length; ++node_index) {
      let node = nodes[node_index]
      if (name === node.getAttribute("name")) { return node }
    }
  }
  return null;
}
function bind (element, type, handler) {
  let s_attachEvent = "attachEvent"
  let s_addEventListener = "addEventListener"
  element[s_attachEvent] ? element[s_attachEvent]('on' + type, handler) : (
    (element[s_addEventListener]) ? element[s_addEventListener](type, handler, 0) : (element['on' + type] = handler))
}
function meval (s) { try { return eval("(" + s + ")"); } catch (e) { return null; } }
// mme_hls.prototype.lang = window.lang_get ? lang_get(mme_hls.prototype.langs) : mme_hls.prototype.langs.cn;
/*-----------------media_engine-------------------------------------------------*/
export default mme_hls // 创建mme对象