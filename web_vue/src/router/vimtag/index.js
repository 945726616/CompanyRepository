// vimtag项目调用的路由表

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const login = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/login/login')
const devlist = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/devlist/vimtag')
const my = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/my/vimtag/my')
const play = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/play/vimtag/play')
const playback = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/playback/playback')
const history = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/history/vimtag/history')
const set = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/set/set')
const boxlist = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/boxlist/boxlist')
const splitScreen = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/splitScreen') // playPlugin
const playMac = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/play/vimtag/play_mac') // mac系统play页面
const playbackMac = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/playback/playback_mac') // mac系统playback页面

const vimtagRouter = new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: login
    },
    {
      path: '/devlist',
      name: 'devlist',
      component: devlist
    },
    {
      path: '/my',
      name: 'my',
      component: my
    },
    {
      path: '/play',
      name: 'play',
      component: play
    },
    {
      path: '/playback',
      name: 'playback',
      component: playback
    },
    {
      path: '/history',
      name: 'history',
      component: history
    },
    {
      path: '/set',
      name: 'set',
      component: set
    },
    {
      path: '/boxlist',
      name: 'boxlist',
      component: boxlist
    },
    {
      path: '/splitScreen',
      name: 'splitScreen',
      component: splitScreen
    },
    {
      path: '/play_mac',
      name: 'playMac',
      component: playMac
    },
    {
      path: '/playback_mac',
      name: 'playbackMac',
      component: playbackMac
    },
  ]
})

export default vimtagRouter