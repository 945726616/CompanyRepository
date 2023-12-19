host_name = "";
var MacOSVersion
var myloc
var download // download内容html
function detectOS () {
  var u = navigator.userAgent;
  //	console.log(u)
  var OS
  if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) OS = "Android";
  if (u.indexOf('iPhone') > -1 || u.indexOf('iPad') > -1) OS = "iPhone";
  if (u.indexOf('Windows') > -1) OS = "Windows";
  if (u.indexOf('Intel Mac') > -1) {
    MacOSVersion = u.split('Intel Mac OS X ')[1]
    MacOSVersion = MacOSVersion.split(')')[0]
    OS = "Mac"
  }

  //	if(host_name == "ebit"){
  //		OS = "Android";
  //	}
  return OS;

}
function macVersionCheck () { // 检查mac系统是否为10.15以上版本(vsmahome/ebit虽然没有旧版客户端但依旧根据此方式判断)
  if (detectOS() !== 'Mac') { // 不是mac系统直接返回false
    return false
  }
  var version
  var returnFlag = false
  version = MacOSVersion.split('_')
  if (Number(version[0]) > 10) {
    returnFlag = true
  } else if (Number(version[0]) === 10 && Number(version[1]) >= 15) {
    returnFlag = true
  }
  console.log(MacOSVersion, 'MacOSVersion', version)
  return returnFlag
}
function is_weixin () {
  var ua = navigator.userAgent.toLowerCase();
  //   console.log(ua)
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  }
  return false;
}
function getParam (url, name) {
  var pattern = new RegExp("[?&]" + name + "\=([^&]+)", "g");
  var matcher = pattern.exec(url);
  // console.log(matcher)
  var items = null;
  if (null != matcher) {
    try {
      items = decodeURIComponent(decodeURIComponent(matcher[1]));
    } catch (e) {
      try {
        items = decodeURIComponent(matcher[1]);
      } catch (e) {
        items = matcher[1];
      }
    }
  }
  return items;
}
function getLanguage () {

  var hl = getParam(location.href, "hl");

  var d_language = localStorage.getItem("language_choice_info");
  if (hl) {
    nav_lang = hl;
  }
  else if (d_language) {
    nav_lang = d_language;
  } else {
    nav_lang = navigator.language || navigator.browserLanguage || navigator.userLanguage || navigator.systemLanguage || "",
      nav_lang = nav_lang.toLowerCase().substr(0, 2);

  }

}
function getUrl () {
  host = getParam(location.href, "m");
  if (host.indexOf("mipcm") > -1) {
    host_name = "MIPC";
    host_style = "style=background-color:#2987CD;border-color:#2987CD";
    hover_color = '#1e9fff' // hover颜色
    origin_color = '#2987CD' // 主题原色
  } else if (host.indexOf("vimtag") > -1) {
    host_name = "Vimtag";
    host_style = "style=background-color:#00B0CD;border-color:#00B0CD";
    hover_color = '#03cced' // hover颜色
    origin_color = '#00B0CD' // 主题原色
  } else if (host.indexOf("vsmahome") > -1) {
    host_name = "Vsmahome";
    host_style = "style=background-color:#2987CD;border-color:#2987CD";
    hover_color = '#1e9fff' // hover颜色
    origin_color = '#2987CD' // 主题原色
  } else if (host.indexOf("ebitcam") > -1) {
    host_name = "Ebitcam";
    host_style = "style=background-color:#FF781F;border-color:#FF781F";
    hover_color = '#cc590d' // hover颜色
    origin_color = '#FF781F' // 主题原色
  } else if (host.indexOf("conico") > -1) {
    host_name = "Conico";
    host_style = "style=background-color:#FF781F;border-color:#FF781F";
    hover_color = '#cc590d' // hover颜色
    origin_color = '#FF781F' // 主题原色
  }
}
function setLanguage () {
  getLanguage();
  getUrl();
  if (nav_lang == "zh") {
    load_end = ",即可完成下载。";
    choose = "选择在";
    ontap = "点击";
    right_top = "右上角";
    sar = "Safari浏览器中打开";
    andr = "浏览器中打开";
    lang_title = "应用详情";
    lang_size = "大小：";
    lang_ver = "版本：";
    lang_info = "24小时远程监控查看直播视频。";
    lang_ios = "去APP Store下载";
    lang_normal_download = "下载";
    lang_fast_download = "去Google Play下载";
    lang_introduction_header = "相关介绍";
    lang_introduction_content = host_name + "是一款手机实时视频监控类的软件，配合云摄像机使用。通过此客户端你可以随时随地查看您家里、商铺、办公室等场所的实时视频、历史录像，还可以即时接收您所关注场所的异常信息报警，第一时间采取安全防护措施。";
    pc_download = "Windows下载";
    android_download = "Android下载";
    iphone_download = "iPhone下载";
    mac_download = "Mac下载";
  } else {
    load_end = "to download。";
    choose = "，and choose";
    ontap = "Click on the ";
    right_top = "upper right corner ";
    sar = " the Safari browser ";
    andr = " the browser";
    lang_title = "APP INFO";
    lang_size = "Size：";
    lang_ver = "version：";
    lang_info = "24 hours remote monitoring and viewing live video.";
    lang_ios = "APP Store";
    lang_normal_download = "Download";
    lang_fast_download = "Google Play";
    lang_introduction_header = "Introduction";
    lang_introduction_content = host_name + " is a mobile real-time video surveillance software used with Cloud IP Camera. Through this client, you can view your home, shops, offices and other places at any time in real-time video and video history, also receive immediate alert to the place of abnormal information alarm, and take safety precautions at the first time.";
    pc_download = "Windows";
    android_download = "Android";
    iphone_download = "iPhone";
    mac_download = "Mac";
  }
}
function round (v, e) {//保留小数点后两位
  var t = 1;
  for (; e > 0; t *= 10, e--);
  for (; e < 0; t /= 10, e++);
  return Math.round(v * t) / t;
}
function layout (obj) { // 框架加载 (包含接受入口index传递的信息)
  // 判断当前页面是否为https协议
  if (window.location.protocol === 'https:') {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].link_url !== '') {
        var ip = obj[i].link_url.match(/\/\/([^/]+)/)[1];
        var ipFlag = ip.split(':')[0]
        // 根据 IP 地址和品牌名进行链接替换
        if (ipFlag === '183.240.204.65') {
          obj[i].link_url = obj[i].link_url.replace(ip, 'wsbgp13.fujikam.com:9747').replace('http://', 'https://');
        } else if (ipFlag === '192.99.39.17') {
          if (host_name === 'MIPC') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'ovca19.mipcm.com:9743').replace('http://', 'https://');
          } else if (host_name === 'Vsmahome') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'ovca19.vsmahome.com:9744').replace('http://', 'https://');
          } else if (host_name === 'Ebitcam') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'ovca19.ebitcam.com:9745').replace('http://', 'https://');
          } else if (host_name === 'Vimtag') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'ovca19.vimtag.com:9746').replace('http://', 'https://');
          }
        } else if (ipFlag === '209.133.212.170') {
          console.log('209.133.212.170')
          if (host_name === 'MIPC') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'us10.mipcm.com:9743').replace('http://', 'https://');
          } else if (host_name === 'Vsmahome') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'us10.vsmahome.com:9744').replace('http://', 'https://');
          } else if (host_name === 'Ebitcam') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'us10.ebitcam.com:9745').replace('http://', 'https://');
          } else if (host_name === 'Vimtag') {
            obj[i].link_url = obj[i].link_url.replace(ip, 'us10.vimtag.com:9746').replace('http://', 'https://');
          }
        }
      }
    };
    console.log('after change obj', obj)
  }
  setLanguage();
  document.title = lang_title;
  if (detectOS() == "Android") {
    if (host_name == "MIPC") {
      console.log(myloc, 'android myloc')
      var android_download_url = "https://play.google.com/store/apps/details?id=com.mining.app.mipca";
      // if (myloc === 'US') {
      //   var android_download_url = "https://play.google.com/store/apps/details?id=com.conico.conicoa";
      // } else {
      //   var android_download_url = "https://play.google.com/store/apps/details?id=com.mining.app.mipca";
      // }
    } else if (host_name == "Vsmahome") {
      var android_download_url = "https://play.google.com/store/apps/details?id=com.vsmahome.vsmahomea";
    } else if (host_name == "Ebitcam") {
      var android_download_url = "https://play.google.com/store/apps/details?id=com.ebit.ebitcama";
    } else if (host_name == "Vimtag") {
      var android_download_url = "https://play.google.com/store/apps/details?id=com.vimtag.vimtaga&hl=en_US";
    } else if (host_name == "Conico") {
      var android_download_url = "https://play.google.com/store/apps/details?id=com.conico.conicoa";
    }
    if (is_weixin()) {
      // vsmahome的谷歌play下载
      if (host_name == "Vsmahome") {
        download = "<a href='javascript:;'><div id='normal_download' style='width: 100%'>" + lang_normal_download + "</div></a>";
      } else {
        download = "<a href='javascript:;'><div id='normal_download'>" + lang_normal_download + "</div></a>"
        + "<a target='_top' href='" + android_download_url + "'><div id='fast_download' " + host_style + ">" + lang_fast_download + "</div></a>";
      }
      size = lang_size + (parseFloat(obj[1].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[1].ver_to;
      content_img = "<img src='images/" + host_name + "_android.png?v4.7.1'>"
      load_main();
      $("#normal_download").click(function () {
        android_load_tips();
      })
    } else {
      // 暂时删除vsmahome的谷歌play下载
      if (host_name == "Vsmahome") {
        download = "<a href='" + obj[1].link_url + "'><div id='normal_download' style='width: 100%'>" + lang_normal_download + "</div></a>";
      } else {
        download = "<a href='" + obj[1].link_url + "'><div id='normal_download'>" + lang_normal_download + "</div></a>"
        + "<a target='_top' href='" + android_download_url + "'><div id='fast_download' " + host_style + ">" + lang_fast_download + "</div></a>";
      }
      size = lang_size + (parseFloat(obj[1].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[1].ver_to;
      content_img = "<img src='images/" + host_name + "_android.png?v4.7.1'>"
      load_main();
    }
  }
  if (detectOS() == "iPhone") {
    if (host_name == "MIPC") {
      console.log(myloc, 'ios myloc')
      var ios_download_url = "https://apps.apple.com/us/app/mipc/id550958838";
      // if (myloc === 'US') {
      //   var ios_download_url = "https://apps.apple.com/cn/app/conico/id1551921491";
      // } else {
      //   var ios_download_url = "https://apps.apple.com/us/app/mipc/id550958838";
      // }
    } else if (host_name == "Vsmahome") {
      var ios_download_url = "https://itunes.apple.com/us/app/vsmahome/id1238594312";
    } else if (host_name == "Ebitcam") {
      var ios_download_url = "https://itunes.apple.com/us/app/ebitcam/id1037729989";
    } else if (host_name == "Conico") {
      var ios_download_url = "https://apps.apple.com/cn/app/conico/id1551921491";
    }
    else if (host_name == 'Vimtag') {
      var ios_download_url = "https://itunes.apple.com/us/app/vimtag/id1025437540";
    }

    if (is_weixin()) {
      download = "<a href='javascript:;'><div id='app_download' " + host_style + ">" + lang_ios + "</div></a>";
      size = lang_size + (parseFloat(obj[2].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[2].ver_to;
      content_img = "<img src='images/" + host_name + "_ios.png?v4.7.1'>"
      // location.href = obj[2].link_url;
      load_main();
      $("#app_download").click(function () {
        load_tips();
      })

    } else {
      download = "<a target='_top' href='" + ios_download_url + "'><div id='app_download' " + host_style + ">" + lang_ios + "</div></a>";
      size = lang_size + (parseFloat(obj[2].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[2].ver_to;
      content_img = "<img src='images/" + host_name + "_ios.png'>"
      // top.location.href = ios_download_url;
      load_main();
    }

  }
  if (detectOS() == "Mac") {
    var mipc_sdtool = "";
    if (host_name == "MIPC") {
      mipc_sdtool =
        "<a href='" + obj[5].link_url + "'><div id='PC_download' " + host_style + ">"
        + "<div class='img_span'><img src='images/PC.png'/></div>"
        + "<div class='down_span'>sdtool</div>"
        + "</div></a>"
    }
    if (obj[3].link_url == '') {
      download = "<div id='title_div'>" +
      "<div id='download_box'>" +
      "<div id = 'choose_download'>" +
      "<a href='" + obj[0].link_url + "'><div id='PC_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/PC.png'/></div>" + "<div class='down_span'>" + pc_download + "</div>" + "</div></a>" +
      "<a href='" + obj[1].link_url + "'><div id='Android_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/Android.png'/></div>" + "<div class='down_span'>" + android_download + "</div>" + "</div></a>" +
      "<a href='" + obj[2].link_url + "'><div id='iPhone_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/Iphone.png'/></div>" + "<div class='down_span'>" + iphone_download + "</div>" + "</div></a>" +
      mipc_sdtool +
      "<a href='" + obj[3].link_url + "'><div id='Mac_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/Mac.png'/></div>" + "<div class='down_span'>" + mac_download + "</div>" + "</div></a>" +
      "</div>" +
      "</div>";
    } else {
      download = "<div id='title_div'>" +
      "<div id='download_box'>" +
      "<a id='download_a' href='" + obj[3].link_url + "'><div id='download_url' " + host_style + ">" + lang_normal_download + "</div></a>" +
      "<div id='app_download' " + host_style + "><img src='images/little_arrow1.png' id='down_arrow'/>" + "</div>" +
      "</div>" +
      "<div id = 'choose_download'>" +
      "<a href='" + obj[0].link_url + "'><div id='PC_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/PC.png'/></div>" + "<div class='down_span'>" + pc_download + "</div>" + "</div></a>" +
      "<a href='" + obj[1].link_url + "'><div id='Android_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/Android.png'/></div>" + "<div class='down_span'>" + android_download + "</div>" + "</div></a>" +
      "<a href='" + obj[2].link_url + "'><div id='iPhone_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/Iphone.png'/></div>" + "<div class='down_span'>" + iphone_download + "</div>" + "</div></a>" +
      mipc_sdtool +
      "<a href='" + obj[3].link_url + "'><div id='Mac_download' " + host_style + ">" +
      "<div class='img_span'><img src='images/Mac.png'/></div>" + "<div class='down_span'>" + mac_download + "</div>" + "</div></a>" +
      "</div>" +
      "</div>";
    }
    if (host_name == "Vsmahome" || host_name == "Ebitcam") {
      size = lang_size + (parseFloat(obj[0].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[0].ver_to;
    } else if (host_name == "Conico") {
      size = lang_size + (parseFloat(obj[1].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[1].ver_to;
    } else {
      size = lang_size + (parseFloat(obj[3].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[3].ver_to;
    }
    content_img = "<img src='images/mac_" + host_name + ".png?v4.7.1'>"
    load_main();
    download_list();
    if(host_name === 'Conico') {
      $('#download_a').attr("href",obj[1].link_url)
    }
    // if (host_name == "vsmahome" || host_name == "ebit") {
    //   // jQuery("#Mac_download").hide();
    // }
  }
  if (detectOS() == "Windows") {
    var mipc_sdtool = "";
    if (host_name == "MIPC") {
      mipc_sdtool =
        "<a href='" + obj[4].link_url + "'><div id='SD_download' " + host_style + ">"
        + "<div class='img_span'><img src='images/PC.png'/></div>"
        + "<div class='down_span'>SDTool</div>"
        + "</div></a>"
    }
    download = "<div id='title_div'>"
      + "<div id='download_box'>"
      + "<a id='download_a' href='" + obj[0].link_url + "'><div id='download_url' " + host_style + ">" + lang_normal_download + "</div></a>"
      + "<div id='app_download' " + host_style + "><img src='images/little_arrow1.png' id='down_arrow'/>" + "</div>"
      + "</div>"
      + "<div id = 'choose_download'>"
      + "<a href='" + obj[0].link_url + "'><div id='PC_download' " + host_style + ">"
      + "<div class='img_span'><img src='images/PC.png'/></div>"
      + "<div class='down_span'>" + pc_download + "</div>"
      + "</div></a>"
      + "<a href='" + obj[1].link_url + "'><div id='Android_download' " + host_style + ">"
      + "<div class='img_span'><img src='images/Android.png'/></div>"
      + "<div class='down_span'>" + android_download + "</div>"
      + "</div></a>"
      + "<a href='" + obj[2].link_url + "'><div id='iPhone_download' " + host_style + ">"
      + "<div class='img_span'><img src='images/Iphone.png'/></div>"
      + "<div class='down_span'>" + iphone_download + "</div>"
      + "</div></a>"
      + mipc_sdtool
      + "<a href='" + obj[3].link_url + "'><div id='Mac_download' " + host_style + ">"
      + "<div class='img_span'><img src='images/Mac.png'/></div>"
      + "<div class='down_span'>" + mac_download + "</div>"
      + "</div></a>"
      + "</div>"
      + "</div>";
    if (host_name == "Conico") {
      size = lang_size + (parseFloat(obj[1].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[1].ver_to;
    } else {
      size = lang_size + (parseFloat(obj[0].size / (1024 * 1024)).toFixed(1)) + "M";
      version = lang_ver + obj[0].ver_to;
    }
    content_img = "<img src='images/windows_" + host_name + ".jpg?v4.7.1'>"
    load_main();
    download_list();
    if(host_name === 'Conico') {
      $('#download_a').attr("href",obj[1].link_url)
    }
    // if(host_name=="vsmahome"||host_name=="ebit"){
    // 	jQuery("#Mac_download").hide();
    // }
  }
}
function download_list () {
  var is_dis = false;

  $("#app_download").click(function () {

    if (!is_dis) {
      $("#choose_download").css("display", "block");
      $("#down_arrow").attr("src", "images/little_arrow2.png");
      $("#app_download").css("borderRadius", "0px 5px 0px 0px");
      $("#download_url").css("borderRadius", "5px 0px 0px 0px");
      if (host_name !== "Conico") {
        $("#PC_download").css('display','inline-block');
        $("#Mac_download").css('display','inline-block');
      }
      if (host_name === 'MIPC') {
        $("#SD_download").css('display','inline-block');
      }
      $("#Android_download").css('display','inline-block');
      $("#iPhone_download").css('display','inline-block');
      is_dis = true;
    } else {
      $("#choose_download").css("display", "none");
      $("#down_arrow").attr("src", "images/little_arrow1.png");
      $("#app_download").css("borderRadius", "0px 5px 5px 0px");
      $("#download_url").css("borderRadius", "5px 0px 0px 5px");
      is_dis = false;
    }
  });

  $("#PC_download").mouseover(function () {
    $("#PC_download").css("backgroundColor", hover_color);
  });
  $("#Android_download").mouseover(function () {
    $("#Android_download").css("backgroundColor", hover_color);
  });
  $("#iPhone_download").mouseover(function () {
    $("#iPhone_download").css("backgroundColor", hover_color);
  });
  $("#Mac_download").mouseover(function () {
    $("#Mac_download").css("backgroundColor", hover_color);
  });
  $("#SD_download").mouseover(function () {
    $("#SD_download").css("backgroundColor", hover_color);
  });

  $("#PC_download").mouseout(function () {
    $("#PC_download").css("backgroundColor", origin_color);
  });
  $("#Android_download").mouseout(function () {
    $("#Android_download").css("backgroundColor", origin_color);
  });
  $("#iPhone_download").mouseout(function () {
    $("#iPhone_download").css("backgroundColor", origin_color);
  });
  $("#Mac_download").mouseout(function () {
    $("#Mac_download").css("backgroundColor", origin_color);
  });
  $("#SD_download").mouseout(function () {
    $("#SD_download").css("backgroundColor", origin_color);
  });
}
function load_main () {
  $("#main").html("<div id='top'>"
    + "<div id='top_left'>"
    + "<div id='logo'><img src='images/" + host_name + "_logo.png'></div>"
    + "<div id='top_info'>"
    + "<div id='name'>" + host_name + "</div>"
    + "<div id='size'>" + size + "</div>"
    + "<div id='version'>" + version + "</div>"
    + "</div>"
    + "</div>"
    + "<div id='top_right'></div>"
    + "<div id='download'>"
    + download
    + "</div>"
    + "</div>"
    + "<div id='content'>"
    + "<div id='content_img'>"
    + content_img
    + "</div>"
    + "</div>"
    + "<div id='introduction'>"
    + "<div id='introduction_title'>" + lang_introduction_header + "</div>"
    + "<div id='introduction_content'>" + lang_introduction_content + "</div>"
    + "</div>"
    + "</div>")

}
function load_tips () {
  document.getElementsByTagName("body")[0].style.backgroundColor = "#303031";
  $("#main").html("<div id='weixin_body'>" +

    "<div id='weixin_top'>" +
    "<img id='arrow_img' src='images/arrow2.png'/>" +
    "</div>" +
    "<div id='weixin_word'>" + ontap + "<span id='weixin_right'>" + right_top + "</span>" + choose +
    "<span id='weixin_context'>" + sar + "</span>" + load_end +
    "</div>" +
    "</div>"
  )
}
function android_load_tips () {
  document.getElementsByTagName("body")[0].style.backgroundColor = "#303031";
  $("#main").html("<div id='weixin_body'>" +

    "<div id='weixin_top'>" +
    "<img id='arrow_img' src='images/arrow2.png'/>" +
    "</div>" +
    "<div id='weixin_word'>" + ontap + "<span id='weixin_right'>" + right_top + "</span>" + choose +
    "<span id='weixin_context'>" + andr + "</span>" + load_end +
    "</div>" +
    "</div>"
  )
}
function loadCss () {
  if (detectOS() == "Windows" || detectOS() == "Mac") {
    jQuery("head").append("<link rel='stylesheet' type='text/css' href='css/pc_index.css'/>");
  } else {
    jQuery("head").append("<link rel='stylesheet' type='text/css' href='css/index_mobile.css'/>"
      + "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=2.0' />");
  }
}
function get_download_info () {
  var hl = getParam(location.href, "hl");
  var d_language = localStorage.getItem("language_choice_info");

  if (hl) {
    nav_lang = hl;
  }
  else if (d_language) {
    nav_lang = d_language;
  } else {
    nav_lang = navigator.language || navigator.browserLanguage || navigator.userLanguage || navigator.systemLanguage || "",
      nav_lang = nav_lang.toLowerCase().substr(0, 2);
  }
  var OS = detectOS();
  var download_info = [];
  var download_type = [];
  var download_status = "main";
  var host = getParam(location.href, "m");
  var type_num = 3;
  if (host.indexOf("vimtag") > -1) {
    if (macVersionCheck()) { // 10.15版本
      download_type = ["windows_vimtag", "android_vimtag", "ios_vimtag", "mac_vimtag_Catalyst"];
    } else {
      download_type = ["windows_vimtag", "android_vimtag", "ios_vimtag", "mac_vimtag"];
    }
    if (host == "debug.vimtag.com") {
      download_status = "debug";
    } else if (host == "testing.vimtag.com" || host == "test.vimtag.com") {
      download_status = "testing";
    } else if (host == "stable.vimtag.com") {
      download_status = "stable";
    } else {
      download_status = "main";
    }
    download_even(0);
  }
  else if (host.indexOf("mipc") > -1) {
    if (macVersionCheck()) { // 10.15版本
      download_type = ["windows_mipc", "android_mipc", "ios_mipc", "mac_mipc_Catalyst", "windows_sdtool", "mac_sdtool"];
    } else {
      download_type = ["windows_mipc", "android_mipc", "ios_mipc", "mac_mipc", "windows_sdtool", "mac_sdtool"]
    }
    type_num = 5;
    if (host == "debug.mipcm.com") {
      download_status = "debug";
    } else if (host == "testing.mipcm.com" || host == "test.mipcm.com") {
      download_status = "testing";
    } else if (host == "stable.mipcm.com") {
      download_status = "stable";
    } else {
      download_status = "main";
    }
    download_even(0);
  } else if (host.indexOf("vsmahome") > -1) {
    if (macVersionCheck()) { // 10.15版本
      download_type = ["windows_vsmahome", "android_vsmahome", "ios_vsmahome", "mac_vsmahome_Catalyst"];
    } else {
      download_type = ["windows_vsmahome", "android_vsmahome", "ios_vsmahome", "mac_vsmahome"];
    }
    if (host == "debug.vsmahome.com") {
      download_status = "debug";
    } else if (host == "testing.vsmahome.com" || host == "test.vsmahome.com") {
      download_status = "testing";
    } else if (host == "stable.vsmahome.com") {
      download_status = "stable";
    } else {
      download_status = "main";
    }
    download_even(0);
  } else if (host.indexOf("ebitcam") > -1) {
    if (macVersionCheck()) { // 10.15版本
      download_type = ["windows_ebit", "android_ebit", "ios_ebit", "mac_ebit_Catalyst"]
    } else {
      download_type = ["windows_ebit", "android_ebit", "ios_ebit", "mac_ebit"]
    }
    if (host == "debug.ebitcam.com") {
      download_status = "debug";
    } else if (host == "testing.ebitcam.com" || host == "test.ebitcam.com") {
      download_status = "testing";
    } else if (host == "stable.ebitcam.com") {
      download_status = "stable";
    } else {
      download_status = "main";
    }
    download_even(0);
  } else if (host.indexOf("conico") > -1) {
    download_type = ["windows_conico", "android_conico", "ios_conico", "mac_conico"] // mac/windows客户端暂无用来占位使用
    download_status = "main"
    download_even(0)
  }
  function download_even (num) {
    if (num > type_num) {
      layout(download_info);
      return;
    }
    else {
      mcloud_agent.get_download({ srv: location.host, ver_sn: "", ver_type: download_type[num], ver_from: "v3.7.1.1607051739", lang: nav_lang, p: [{ n: "status", v: download_status }] }, { ver_type: download_type[num] }, function (msg, ref) {

        // if(host.indexOf("mipc")>-1){
        // 	msg.info.link_url = msg.info.link_url.replace("209.133.212.170:2080","us10.mipcm.com")
        // }
        // else if(host.indexOf("vimtag")>-1){
        // 	msg.info.link_url = msg.info.link_url.replace("209.133.212.170:2080","us10.vimtag.com")
        // }
        download_info[num] = msg.info;
        download_even(++num);
      })
    }
  }

}
function start () {
  var _this = this
  //步骤一:创建异步对象
  var ajax = new XMLHttpRequest()
  //步骤二:设置请求的url参数,参数一是请求的类型,参数二是请求的url,可以带参数,动态的传递参数starName到服务端
  ajax.open('get', '/cmipcgw/cmipcgw_get_req.js')
  //步骤三:发送请求
  ajax.send()
  //步骤四:注册事件 onreadystatechange 状态改变就会调用
  ajax.onreadystatechange = function () {
    if (ajax.readyState == 4 && ajax.status == 200) {
      //步骤五 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
      // console.log(ajax.responseText, typeof (ajax.responseText))//输入相应的内容
      var ajaxObj = ajax.response.slice(8, -2)
      var mylocIndex = ajaxObj.indexOf('myloc')
      myloc = ajaxObj.slice(mylocIndex + 7, mylocIndex + 9)
      loadCss();
      getUrl();
      get_download_info();
    }
  }
}
window.onload = function () {
  start();
}
