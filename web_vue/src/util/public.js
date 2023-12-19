import store from '../store'
import router from '../router'
// import firebase from "firebase/app";
// import "firebase/analytics"
const publicFunc = {
  async importCss (docPath) { // 引入CSS文件
    if (store.state.jumpPageData.projectName.indexOf('vimtag') > -1) {
      await require('../css/vimtag' + docPath)
    } else if (store.state.jumpPageData.projectName.indexOf('ebit') > -1) {
      await require('../css/ebit' + docPath)
    } else if (store.state.jumpPageData.projectName.indexOf('mipc') > -1){
      await require('../css/mipc' + docPath)
    }else{
      await require('../css/vsmahome' + docPath)
    }
  },
  urlParam () { // 截取url参数
    let args = new Object()
    if (process.env.NODE_ENV === 'production') {
      let query = location.href.split('?')[1]//Get the query string
      let pairs = query.split("&")//Disconnect the comma
      for (let i = 0; i < pairs.length; i++) {
        let pos = pairs[i].indexOf('=')//Find name=value
        if (pos == -1) continue//If you do not find just skip
        let argname = pairs[i].substring(0, pos)//extract name
        let value = pairs[i].substring(pos + 1)//extract value
        args[argname] = unescape(value)//Save as property
      }
    }
    return args
  },
  msg_tips (options) { // 弹出的消息提示框
    let bid = parseInt(Math.random() * 100000);
    $("#tip_div").html('<div id="tip_container' + bid + '" class="container tip_container"><div id="tip' + bid + '" class="mtip"><i class="micon"></i><span id="tsc' + bid + '"></span><i id="mclose' + bid + '" class="mclose"></i></div></div>');
    let $tip_container = $("#tip_container" + bid)
    let $tip = $("#tip" + bid);
    let $tipSpan = $("#tsc" + bid);
    let $colse = $("#mclose" + bid);
    //
    clearTimeout(window.timer);
    // console.log($tip_container, 'container')
    if ($tip_container) {
      $tip.attr("class", options.type).addClass("mtip");
      $tipSpan.html(options.msg);
      $tip_container.slideDown(300);
      //
      window.timer = setTimeout(function () {
        $tip_container.slideUp(300);
      }, options.timeout);
      //
      $tip_container.on("mouseover", function () {
        clearTimeout(window.timer);
      });
      //
      $tip_container.on("mouseout", function () {
        window.timer = setTimeout(function () {
          $tip_container.slideUp(300);
        }, options.timeout);
      });
      //
      $colse.on("click", function () {
        $tip_container.slideUp(300);
      });
    }
  },
  delete_tips (obj) { // confirm提示框方法
    $("#delete_tips").html("<div id='delete_tips_box'>"
      + "<div id='delete_tips_title'></div>"
      + "<div id='delete_tips_content'></div>"
      + "<div id='delete_tips_btn'>"
      + "<div id='delete_tips_cancel'></div>"
      + "<div id='delete_tips_ok'></div>"
      + "</div>"
      + "</div>")
    $("#delete_tips_title").html(obj.title ? obj.title : mcs_prompt) //g 5.6.1
    $("#delete_tips_content").html(obj.content ? obj.content : "")
    $("#delete_tips_cancel").html(mcs_cancel)
    $("#delete_tips_ok").html(mcs_ok)
    $("#delete_tips").attr('style', 'display:block;')
    $("#delete_tips_cancel").click(function () {
      $("#delete_tips").attr('style', 'display:none;')
      if (obj.flag && obj.flag === "my_page") {
        // createPage("my",{ parent: $("#page") }) // 进入我的页面
        // router.push({name:'my',params:{parent: $('#page')}})
        if(window.location.href.indexOf('vimtag') == -1){
          // mipcMyPage({ parent: $('#my') })
        }else{
          // vimtagMyPage({ parent: $('#my') })
        }
      }
    })
    $("#delete_tips_ok").click(function () {
      obj.func()
      $("#delete_tips").attr('style', 'display:none;')
    })
  },
  showBufferPage () { // 展示遮罩层
    $("#buffer_page").show()
    if (!$("#back_to_dev_list").length > 0) { // jQ检测节点是否存在
      $("#buffer_page").append("<div id='back_to_dev_list'>" + mrs_return_dev_list + "</div>")
    }
    // 返回设备列表页
    $("#back_to_dev_list").click(function () {
      //  console.log("进入点击返回设备列表")
      if (router.currentRoute.path !== '/devlist') {
        publicFunc.closeBufferPage()
        // router.currentRoute.path = '/devlist'
        router.push({name:'devlist'})
      }
    })
    store.dispatch('setBufferPageFlag', setTimeout(function () {
      if (router.currentRoute.path !== '/devlist') {
        $("#back_to_dev_list").show()
      }
      // console.log("等待时间超过5m")
    }, 1000))
  },
  closeBufferPage () { // 关闭遮罩层
    clearTimeout(store.state.jumpPageData.bufferPageFlag)
    $("#buffer_page").hide()
    $("#back_to_dev_list").hide()
  },
  projectReload(){
    window.addEventListener("load",()=>{
      if(this.$route.path != "/"){
        this.$router.replace('/')
      }
    })
  },
  mx (selector, context) {
    let  doc = context || document;
    switch (typeof (selector)) {
      case 'string':
        {
          let name = selector.substring(1);
          switch (selector.charAt(0)) {
            case '#':
              return doc.getElementById(name);
            case '.':
              return (doc.getElementsByClassName ? doc.getElementsByClassName(name) : getElementsByClass(name, doc));
            case '/':
              return doc.getElementsByTagName(name);
            default:
              return doc.getElementsByName(selector);
          }
        }

      case 'object':
        {
          return selector;
        }

      case 'function':
        {
          mx.funcs.push(selector) // mx选中函数的情况较少如遇到请用其他选择器代替
        }
    }
  },
  dom_create_child (child_parent, child_type, child_id, child_class, insert_mode) {
    var child = document.createElement(child_type);
    if (child_id) { child["setAttribute"]("id", child_id); }
    if (child_class) {
      child["setAttribute"]("className", child_class); //for IE
      child["setAttribute"]("class", child_class);
    }
    if (child_parent) {
      if (insert_mode) {
        child_parent[insert_mode.type](child, insert_mode.node ? insert_mode.node : null)
      } else {
        child_parent.appendChild(child)
      }
    }
    return child
  },
  trigger_click (el) {
    if (el.click) el.click();
    else {
      try {
        var evt = document.createEvent('Event');
        evt.initEvent('click', true, true);
        el.dispatchEvent(evt);
      } catch (e) { system_pop_confirm_box({ alert: true, str: e }) }
    }
  },
  hasUsableFlash () { // 判断浏览器是否开启flash插件
    let flashObj
    if (typeof window.ActiveXObject !== "undefined") {
      flashObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
    } else {
      flashObj = navigator.plugins['Shockwave Flash']
    }
    return flashObj ? true : false
  },
  log_upload(event,result,failDesc) { //日志上传
    let analytics;
    console.log(event,"event")
    console.log(result,"result")
    console.log(failDesc,"failDesc")
    console.log(firebase.analytics().logEvent,"firebase.analytics().logEvent")
    firebase.analytics.isSupported().then((isSupported) => {
      console.log(isSupported,"isSupported")
      if (isSupported) {
        analytics = firebase.analytics();
        console.log(analytics,"analytics new")
        if(result === '' || result === undefined){
          // firebase.analytics().logEvent(event);
          analytics.logEvent(event);
          console.log("enter undefined")
        }else if(result === 'success'){
          // firebase.analytics().logEvent(event, { 
          //   result: 'success'
          // });
          analytics.logEvent(event, { 
            result: 'success'
          });
          console.log("enter success")
        }else if(result === 'fail'){
          // firebase.analytics().logEvent(event, {
          //   result: 'fail',
          //   failDesc: failDesc
          // });
          analytics.logEvent(event, {
            result: 'fail',
            failDesc: failDesc
          });
          console.log("enter fail")
        }
      }
    })
  }
}

export default publicFunc