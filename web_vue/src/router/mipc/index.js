// mipc系列项目调用路由表

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const login = () => import(/* webpackChunkName: "group-Mipc" */'@/components/login/login')
const devlist = () => import(/* webpackChunkName: "group-Mipc" */'@/components/devlist/mipc')
const boxlist = () => import(/* webpackChunkName: "group-Mipc" */'@/components/boxlist/boxlist')
const play = () => import(/* webpackChunkName: "group-Mipc" */'@/components/play/mipc/play')
const history = () => import(/* webpackChunkName: "group-Mipc" */'@/components/history/mipc/history')
const set = () => import(/* webpackChunkName: "group-Mipc" */'@/components/set/set')
const playback = () => import(/* webpackChunkName: "group-Mipc" */'@/components/playback/playback')
const my = () => import(/* webpackChunkName: "group-Mipc" */'@/components/my/mipc/my')
const download = () => import(/* webpackChunkName: "group-Mipc" */'@/components/download/download')
const playMac = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/play/mipc/play_mac') // mac系统play页面
const playbackMac = () => import(/* webpackChunkName: "group-Vimtag" */'@/components/playback/playback_mac') // mac系统playback页面

const mipcRouter = new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: login
    },
    {
      path: '/devlist',
      name: 'devlist',
      component: devlist,
      children:[
        {
          path: '/devlist',
          name: 'boxlist',
          component: boxlist
        },
        {
          path: '/devlist',
          name: 'play',
          component: play
        },
        {
          path: '/devlist',
          name: 'playMac',
          component: playMac
        },
      ]
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
      path: '/playback',
      name: 'playback',
      component: playback
    },
    {
      path: '/my',
      name: 'my',
      component: my
    },
    {
      path: '/download',
      name: 'download',
      component: download
    },
    {
      path: '/playback_mac',
      name: 'playbackMac',
      component: playbackMac
    },
  ]
})

export default mipcRouter