import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

// 引入多个路由表
import vimtagRouter from './vimtag'
import mipcRouter from './mipc'

let uesRouter
if (location.href.indexOf('vimtag') > -1) { // 根据域名判断使用那个路由表
  uesRouter = vimtagRouter
} else {
  uesRouter = mipcRouter
}
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}
const router = uesRouter

export default router