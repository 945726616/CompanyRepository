import Vue from 'vue'
import store from "./store"
import router from "./router"
import App from './App.vue'
import Api from './api'
import $ from 'jquery'
import Public from './util/public.js'
import './util/msdk.min.js'
import './css/public.scss'

// 引入多国语言切换插件
import chooseLanguage from './lib/exportModule/languageExport'
Vue.prototype.$chooseLanguage = chooseLanguage
if (!store.state.user.userLanguage) {
  let chromeLang = (navigator.language || navigator.userLanguage).substr(0, 2)
  if (chromeLang === 'zh') {
    let originalLang = navigator.language || navigator.userLanguage
    if (originalLang === 'zh-TW') {
      chromeLang = 'tw'
    }
  }
  store.dispatch('setUserLanguage', chromeLang)
  chooseLanguage.lang(chromeLang)
} else {
  chooseLanguage.lang(store.state.user.userLanguage)
}
Date.prototype.format = function (format) {
  let o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(),    //day
    "h+": this.getHours(),   //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
    "S": this.getMilliseconds() //millisecond
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
    }
  }
  return format
}
// 赋值项目底色(项目主色调,scss方便获取)
if (store.state.jumpPageData.projectName === 'vimtag') {
  document.getElementsByTagName('body')[0].style.setProperty('--projectBackgroundColor', '#00a6ba')
  // project_color = '#00a6ba'
} else if (store.state.jumpPageData.projectName === 'ebitcam') {
  document.getElementsByTagName('body')[0].style.setProperty('--projectBackgroundColor', '#ff781f')
  // project_color = '#ff781f'
} else if (store.state.jumpPageData.projectName === 'mipcm') {
  document.getElementsByTagName('body')[0].style.setProperty('--projectBackgroundColor', '#2988cc')
  // project_color = '#2988cc'
} else {
  document.getElementsByTagName('body')[0].style.setProperty('--projectBackgroundColor', '#2988cc')
  // project_color = '#2988cc'
}
router.beforeEach((to, from, next) => {
  if (store.state.user.loginFlag === 1) { // 如果已经登录的话
    next()
  } else {
    if (to.path === '/' || to.path === '/download' || to.path === '/my' || store.state.jumpPageData.experienceFlag) { // 如果是login/my/download页面的话，直接next()
      next()
    } else { //否则 跳转到登录页面
      next({ path: '/' })
    }
  }
  // next()
  // 	console.log(to,"router to")
  // 	console.log(from,"router from")
})

Vue.prototype.$ = $
Vue.prototype.$api = Api
Vue.config.productionTip = false
Vue.prototype.publicFunc = Public

if (window.fujikam === 'fujikam') {
  Public.importCss('Public.scss')
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')