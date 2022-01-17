'use strict'
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import store from '../store'
import md5 from '@/util/mmd5.js'
let default_box_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANAAAAB1BAMAAADNW3IaAAAAIVBMVEXZ2dny8vLX19f19fXs7Ozm5ubw8PDd3d3g4ODp6eni4uJPJfjYAAAEEElEQVRo3u2Zz4sTMRTHQ1Cr3kpK1VsISMVbiBa9WZsW60m0g9WTpeOANy2KxVMVhopHnYp68ldR/0vfy+pkdDsbp5m9SD6XXdhtP/tN8l7edEkgEAgEAoFAIPAfQMUvOHHgK4GvDQIIhCD1W3jjZfRe6yRJYq3Xd18+JXXLzPstomyoDE2mDG29jl4+pAKpx0KepuPhVCnZ/BOUxXo9WRkb99yUxqtITzHHdjCdjEfR99VeNL7bpuB6sYKk3CYTDbaq2yYAvoD1atr1coKp23hIHtps7iiv7ugpA0lVMH4MttWezRFlk/UcUVzRZNNsGxGG0ii4Kd6Y8w+2h/C+f1rMrkCUahb3tsWjF0UPX0Q2Sr2oy9yKOmO7KzXDutesiH6xkpo18v6ST3guunVIcVRrIo6/vcR/exo8xeKsXSMHc/5jpu7lose3hXg2hm5Trye+LU4O4T2v5KJjMr77UPBnY9sO/DXdD5R/ZeBhV3PREclUezShgqfZtBYVk6OlOApxAHYzF52Vpk211tDsG5sMvvWNc2EiTJw9EfkNihAl9XopxPE7Q68lZHLwQjzpoQZhn3PR+fxdIctoMoftutPbOZZq3RadMbN/qe1B5/5s9fHoG8WjkTC1yyG4PrdxkPbcdqC/osOlgkvYSLOZkhU9o4/FOMgFmov4bP8N1tVw4uFo6CqVrFpwdFOMUxRxK+pvrev2AJdwgUfjXw/BUpzDOGUi2i+7UOL1N2GOhvsYMjwEIu3v+72LBdGb8le3Y7OEcCkerGLdwVwcxzgHiW4deE928cRjJU9Z+Xz34JvgaX/bz08XRJ9cbThem+3a6O0dSrXe0a1xkFMF0XPnPoMrghMvFtG+kZIpPAR80y+Je68getR0Y/oubBcxF4pS+ZDa1hOIk5WezCsF0bF/HQ9bg+84ML2KMj1MmkmCDzAg72xmpR71uiA6It0a23dXv0bspzi0mZFzqMpfcJ8SKzphRU5wDh3gQE8EJ41FGukmO8AzoCaQvScqgTsDywbL5xjT5HX0WDpsp4HeSso81yB1EXp0CKq6Yd3bxlNENH70VN2eCzcE2Qe2mF6tqVjrI3q2quD+rtGzFGQ7FMcS32nLls9ckHJANZ6pejzc9QS78FdhmQriAi5UX5W8BmXqhuLEz3ZXMfnOlo87Vcbk7mVK/hmc998quVuZYp5qKtuX/MrUrYKLpqrnBXqqqzop9CX/MnUjbLf1L1O3yt2X7C3nAfalvvIvUzcUVa5UTOIt543g2AK9y7RiX/IvU3dfmknHLVdTKv4k25ZKnbFlWluqFFXu8vE3gUozZV1M4RMYOQTMY61OwLD3UeZ65Sgfv38jNF5tIsB8FOzw+Lks5LChlBJOAoFAIBAIBAKBw+EntmrvbiMfK1MAAAAASUVORK5CYII=";
let default_online_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATAAAACrAQMAAADb41KEAAAAA1BMVEXZ2dmK1ydDAAAAHUlEQVRYw+3BAQ0AAADCIPuntscHDAAAAAAAgK4DGg0AAQv6NWcAAAAASUVORK5CYII=";
let default_offline_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANAAAAB1BAMAAADNW3IaAAAAKlBMVEXZ2dny8vLX19fz8/P19fXd3d3l5eXf39/i4uLt7e3x8fHp6env7+/n5+f7WU42AAACeUlEQVRo3u2Yv2sUQRTHhwELsRpm/VEOA7dRgsUwa3J3XHPcEVBjkRN/VlFI0IBgTgQLBTmjjY3kxEpBOATri60ghMNeQ9Lkj8m+N7ndy3HlvCa8T7PsNh++M2/fm13BMAzDMAzDMAzDMAFpAUGNtJVX6+tPXlKrpHnzNWu3240vz0lN0jz1LaeU8q3aKqXJboAG8cs9I6iwD1qqQF/vUJlkmqkJkktUi2f3nJoke0wTSc7jwpXomzSR7C81RfaPIpJMW9MivUQieufUNL4r4mN2MYQbO/DuD0Gk+SZ6jk0+mAjWTt4Ggz+4G6JcuLcD964TXwQ1p6vWboKg3rUpXJP4dVfRINo2Ys7n12tG2D48+B5dlOIW5QHkZlPVOxgxZyG2SF5B0dCIPJI+n1/sZxDVQBS/FtSiEXmkG1ACl6EqIFtk0ZYC6qj4izo0+15kkd1Dkf4BiyaFwJrAsossMjsKwVWDQC9cEA1FZPoK0aPcUgZS+pOJnEgrBHcJd4hIJAYqoC+accmRtNVKIVqkFZlBOYLCcKLao/5EIIxELMJApoyUDCOL5P+yFKSESEQvrNwqA82NMBJNCwpNVVdBsbIMU4KqqZ5F0TaMiUGCHQ93rSZic7UYfCtN1SgG3xLZKMdXNxmZMPhgBEYmBKha+9AplUeyqSNo3lgNIHJr97FF6J93HlEdt8IB0o8PkBqL7paJLoK9KZnZUikP+T0RH4kFXjKruMk+xIYkInmO+tOyjOSoA83+/F+wggj7+sQPja4RVJiNwuTrq0aQISuHmQv701gj/r31cdcD395S/7CzZz48+73/XtJ60IQYwTAMwzAMwzAMc8o4ApYzoABCPc/cAAAAAElFTkSuQmCC";
let default_InvalidAuth_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATAAAACrBAMAAAATA930AAAAIVBMVEXZ2dny8vLf39/c3Nzv7+/o6Ojk5OTq6urs7Ozm5ubh4eEqh4/4AAACCUlEQVR42u3dPWsUURSH8WUWU9hdiJuUFxWVVIPr+rLdSjSmlDWoXaIiahdNYxnfiHVe6yzkcyY5DMnOGTIQCPwP5HmqvcMWPw4zt7gMTGehH7LDzuPbIfvYedgJ2R1gwOoBkwcMmAuYPGDAXMDkAQPmAiYPGDAXMHnAgLmAyQMGzAVMHjBgLmDyrhC28HVlZe8wHKzY/5NOevUzx4IN36SqF5NIsOFGOmtpEgfW3UlTLZdhYPdTre9RYMV6HTaXg8AeJNevGDAbmBtZCNig4ixubS1WP8chYJ+S9fdDv3/vXbJ6EWDFyCz/sy0ObDGbA8AGRrmVK+ZrW24HgN2tS57Z8rke1l2zgZVnaxtZr9TDNm3ncrvavB52c3R6s6+eX5ixC1kOm7EdtZwaoe23q3KYPZQvG/vaWA57Yg9h4zH9IYc9PWX8bl6Rw6r5NGYYAzau3XUxYI+iwpgYE2Ni0WDNid2IACuO7HTg3+epvtg5wbesgvlDC99yKYQNUktjIWytDdbTwbrrbbC5UgYrNttg81kHG7XBZoEBAwYMGDBgwIABAwYMGDBg1wMW9lCl234MpYP5t438u0c6WLFxsWspi2DWcPftBb2fVH+RvzxZFe3lSWCXDJg8YMBcwOQBA+YCJg8YMBcwecCAuYDJAwbMBUweMGAuYPKAAXMBkxcYFvY7I1G/zHIMMIc+sbj4o2sAAAAASUVORK5CYII=";

const devlist = {
  /*
  ** 获取设备列表
  ** {sess: nid: create_nid} nid固定格式
  ** start: 0 固定值
  ** counts: 1024 固定值
  */
  async devs_refresh () {
    let returnItem
    await axios.get('/ccm/ccm_devs_get', {
      params: {
        sess: { nid: login.create_nid() },
        start: 0,
        counts: 1024
      }
    }).then(msg => {
      if (login.get_ret(msg) === '') {
        let l_devs = [] // 暂存设备列表数据
        let devices = msg.data.devs;
        if (devices) {
          for (let i = 0; i < devices.length; ++i) {
            l_devs[i] = devices[i];
          }
          for (let j = 0; j < l_devs.length; j++) {
            let arrdev = l_devs[j].p ? l_devs[j].p : [];
            if (arrdev.length) {
              for (let w = 0; w < arrdev.length; w++) {
                if (arrdev[w].n == "dc.devtype") {
                  l_devs[j].type = arrdev[w].v; //以dc.devtype为准
                }
                if (arrdev[w].n == "s.box_live") {
                  l_devs[j].box_live = arrdev[w].v; //判断云盒子是否支持实时视频播放
                }
              }
            }
          }
        }
        let devs_data = l_devs
        let devs_data_ack = []

        for (let i = 0; i < devs_data.length; i++) {
          let tem_data = devs_data[i]
          devs_data[i].nick = tem_data.nick ? tem_data.nick : tem_data.sn;
          if ((tem_data.stat === "Online") && (tem_data.type === "BOX")) {
            devs_data[i].def_img = default_box_img;
          } else if (tem_data.stat === "Online") {
            devs_data[i].def_img = default_online_img;
          } else if (tem_data.stat === "Offline") {
            devs_data[i].def_img = default_offline_img;
          } else if (tem_data.stat === "InvalidAuth") {
            devs_data[i].def_img = default_InvalidAuth_img;
          }
          if (tem_data.type !== "VBOX") {
            devs_data_ack.push(devs_data[i])
          }
        }
        if (devs_data_ack.length > 0) {
          store.dispatch('setDeviceData', devs_data_ack)
          returnItem = devs_data_ack
        } else {
          store.dispatch('setDeviceData', devs_data)
          returnItem = devs_data
        }
      }
    })
    return returnItem
  },
  /*
  ** 检测设备是否在线
  ** 与添加设备调用同一接口,但是其密码为固定值,将其放在调用处进行填入, 区别在于不同的返回值内容整理
  */
  async devlist_check_online (params) {
    let returnItem
    await devlist.dev_add({ sn: params.sn, password: params.password }).then(res => {
      // 根据格式化后的结果判断并赋值
      if (res && res.result === "accounts.user.invalid") {
        returnItem = mcs_device_not_exist;
      } else if (res && res.result === "accounts.user.offline") {
        returnItem = "user.offline";
      } else if (res && res.result == "accounts.pass.invalid") {
        returnItem = "";
      } else if (res && res.result === "accounts.system") {
        returnItem = "accounts.system";
      } else if (res && res.result === "permission.denied") {
        returnItem = mcs_permission_denied;
      }
    })
    return returnItem
  },
  /*
  ** 添加设备
  ** 与检测设备在线共用同一接口,密码为用户输入值, 区别在于不同的返回值内容整理
  */
  async dev_add (params) {
    let returnItem
    let pwd_md5_hex = md5.hex(params.password || "")
    await axios.get('/ccm/ccm_dev_add', {
      params: {
        sess: { nid: login.create_nid() },
        sn: params.sn,
        pwd: login.pwd_encrypt(pwd_md5_hex)
      }
    }).then(res => {
      let result = login.get_ret(res)
      if (result === '') {
        let device = res.data.info
        if (device) {
          devlist.ldev_add(device)
        }
      }
      returnItem = { // 整理返回值格式
        result: result,
        info: res.data.info
      }
    })
    return returnItem
  },
  /*
  ** 删除设备
  */
  async dev_del (params) {
    let returnItem
    await axios.get('/ccm/ccm_dev_del', {
      params: {
        sess: { nid: login.create_nid() },
        sn: params.sn
      }
    }).then(res => {
      let msg = { result: login.get_ret(res) }
      if (msg && msg.result === "") {
        returnItem = { msg: mcs_delete_success, type: "success" }
      } else {
        returnItem = { msg: mcs_delete_fail, type: "error" }
      }
    })
    return returnItem
  },
  /*
  ** 设备密码设置
  */
  async dev_passwd_set (params) {
    let returnItem
    let old_pass = (params.old_pass && md5.hex(params.old_pass))
    let new_pass = (params.new_pass && md5.hex(params.new_pass))
    await axios.get('/ccm/ccm_pwd_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        user: {
          username: params.sn,
          old_pwd: login.pwd_encrypt(old_pass),
          pwd: login.pwd_encrypt(new_pass),
          level: "",
          guest: params.is_guest ? 1 : 0
        }
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
      // let result = login.get_ret(res)
      // if (result === '') {
      //   returnItem = 1
      // } else {
      //   returnItem = 0
      // }
    })
    return returnItem
  },
  /*
  ** 设备网络设置
  */
  async net_set (params) {
    let info = { dns: params.dns, ifs: params.networks }
    return await axios.get('/ccm/ccm_net_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        info: info
      }
    })
  },
  /*
  ** 设备网络获取
  */
  async net_get (params) {
    return await axios.get('/ccm/ccm_net_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        select: params.select,
        tokens: ["eth0", "ra0"],
        items: ["all", "all"],
        force_scan: 1
      }
    })
  },
  /*
  ** 设备可连接wifi获取
  */
  async wifi_get (params) {
    let returnItem
    await devlist.net_get(params).then(res => { // 调用net_get接口
      let result = login.get_ret(res)
      if (res && result === '') {
        if (res.data.info.ifs[1].wifi_client.info.stat === "ok") {
          returnItem = res.data.info.ifs[1].wifi_client.ap_list
        } else {
          returnItem = res.data.info.ifs[1].wifi_client.ap_list
        }
      }
    })
    return returnItem
  },
  /*
  ** 设备wifi设置
  */
  async wifi_set (params) {
    let now_net_info = {}
    now_net_info["ifs"] = { token: "ra0", enabled: 1 }
    now_net_info.ifs["phy"] = { conf: { mode: "wificlient" } }
    now_net_info.ifs["wifi_client"] = { conf: { enabled: 1, ssid: params.ssid, key: params.key } }
    let returnItem
    await devlist.net_get(params).then(async res => { // 调用网络获取
      let result = login.get_ret(res)
      if (res && result === '') {
        now_net_info.dns = res.dns
        let info = { ifs: now_net_info.ifs, dns: now_net_info.dns }
        await devlist.net_set({
          ...params,
          info: info
        }).then(async res => { // 调用设置wifi网络方法
          if (login.get_ret(res) === '') {
            await wifi_info_request(0)
          } else {
            returnItem = { msg: mcs_permission_denied, type: "error" }
          }
        })
      } else if (msg.result === "permission.denied") {
        returnItem = { msg: mcs_permission_denied, type: "error" }
      } else {
        returnItem = { msg: mcs_failed_to_set_the, type: "error" }
      }
    })
    async function wifi_info_request (num) {
      if (num > 10) {
        return returnItem = { msg: mcs_failed_to_set_the, type: "error" }
      }
      await devlist.net_get(params).then(async res => { // 循环调用获取wifi信息接口,查看是否设置成功
        if (res.data.info.ifs[1].wifi_client.info.stat === "ok") {
          return returnItem = { msg: mcs_set_successfully, type: 'success' }
        } else {
          await wifi_info_request(++num)
        }
      })
    }
    return returnItem
  },
  /*
  ** 设备昵称设置
  */
  async nick_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_nick_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        nick: params.nick
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res)
      }
    })
    return returnItem
  },
  /*
  ** 获取设备时区
  */
  async time_zone_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_zone_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        dev_sn: params.sn
      }
    }).then(res => {
      // console.log(res, 'time_zone_get_res')
      let result = login.get_ret(res)
      if (result === '') {
        returnItem = res.data.address.zones
      }
    })
    // console.log(returnItem, 'return_time_zone_get')
    return returnItem
  },
  /*
  ** 获取设备ntp
  */
  async ntp_get (params) {
    return await axios.get('/ccm/ccm_ntp_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    })
  },
  /*
  ** 获取设备日期
  */
  async date_get (params) {
    return await axios.get('/ccm/ccm_date_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    })
  },
  /*
  ** 获取设备时间
  ** 此处原方法中存储了一个全局时区本方法中暂未填写
  */
  async time_get (params) {
    let returnItem
    await devlist.ntp_get(params).then(async res => { // 调用获取设备ntp
      let result = login.get_ret(res)
      if (result === '') {
        let msg = res.data ? res.data.info : "";
        await devlist.date_get(params).then(res_date => { // 调用获取设备日期
          let result_date = login.get_ret(res_date)
          if (result_date === '') {
            let msg2 = res_date.data ? res_date.data.utc_date : "";
            returnItem = {
              result: result_date,
              timezone: msg.timezone, // ccm_ntp_get获取
              auto_sync: msg.auto_sync_enable, // ccm_ntp_get获取
              ntp_addr: msg.manual[0].ip, // ccm_ntp_get获取
              hour: msg2.time.hour,
              min: msg2.time.min,
              sec: msg2.time.sec,
              year: msg2.date.year,
              mon: msg2.date.mon,
              day: msg2.date.day
            }
          }
        })
      } else {
        returnItem = { result: result }
      }
    })
    return returnItem
  },
  /*
  ** 设置设备ntp
  */
  async ntp_set (params) {
    return await axios.get('/ccm/ccm_ntp_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        auto_sync: params.auto_sync,
        manual: {
          ip: params.ntp_addr
        }
      }
    })
  },
  /*
  ** 设置设备日期
  */
  async date_set (params) {
    return await axios.get('/ccm/ccm_date_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        type: params.type,
        timezone: params.timezone,
        utc_date: {
          time: {
            hour: params.hour,
            min: params.min,
            sec: params.sec
          }, date: {
            year: params.year,
            mon: params.mon,
            day: params.day
          }
        }
      }
    })
  },
  /*
  ** 设置设备详细时间
  */
  async time_set (params) {
    let returnItem
    let oDate = new Date()
    let req_obj = {}
    req_obj.year = oDate.getFullYear()
    req_obj.mon = oDate.getMonth() + 1
    req_obj.day = oDate.getDate()
    req_obj.hour = oDate.getHours()
    req_obj.min = oDate.getMinutes()
    req_obj.sec = oDate.getSeconds()
    req_obj.type = "NTP"
    req_obj.auto_sync = 1
    req_obj.sn = params.sn
    req_obj.timezone = params.timezone
    await devlist.time_get(params).then(async res => {
      req_obj.ntp_addr = res.ntp_addr
      await devlist.date_set({ // 调用设置设备日期
        ...req_obj,
        sn: params.sn
      }).then(async res_date_set => {
        let result_date_set = login.get_ret(res_date_set)
        if (result_date_set === '') {
          await devlist.ntp_set({ // 调用设置设备ntp
            ...req_obj,
            sn: params.sn
          }).then(res_ntp_set => {
            returnItem = { result: login.get_ret(res_ntp_set) }
          })
        } else {
          returnItem = { result: result_date_set }
        }
      })
    })
    return returnItem.result === '' ? null : 1
  },
  /*
  ** 获取服务记录
  */
  async service_record_get (params) {
    let returnItem
    await axios.post('/ccm/csfs_get', {
      nid: login.create_nid(),
      keys: params.keys
    }).then(res => {
      returnItem = res.data
    })
    return returnItem
  },
  /*
  ** tree后设备树状分组弹出框
  ** 参数意义不明
  */
  async service_record_set (params) {
    return await axios.get('/csfs/csfs_set', {
      params: {
        nid: login.create_nid(),
        ...params
      }
    })
  },
  /*
  ** 视频播放接口
  */
  async play (params) {
    let returnItem
    await axios.get('/ccm/ccm_play', {
      params: {
        sess: { nid: login.create_nid(), sn: params.sn },
        setup: { stream: "RTP_Unicast", trans: { proto: params.protocol } },
        token: params.token
      }
    }).then(res => {
      returnItem = {
        result: get_ret(res),
        url: res.data.uri ? res.data.uri.url : ""
      }
    })
    return returnItem
  },
  /*
  ** 图片加载预处理方法
  ** {sess: nid: create_nid(), sn: 传递的sn值}
  ** setup: {stream: "RTP_Unicast", trans: { proto: params.protocol}} stream:固定值, trans固定格式的传递值
  ** token: 传递的token
  */
  load_noid_img (params) {
    let images = [] // 创建一个img对象数组
    images[params.num] = new Image()
    if (params.sn !== null && !params.refresh) { // 如果传递的数据包含sn且该图片未加载过
      let current_get_image_time = new Date() // 请求图片时的时间戳
      let get_image_time = current_get_image_time.getTime()
      let storage_ipc_time = sessionStorage.getItem(params.sn + "_storage_time")
      if ((get_image_time - storage_ipc_time) / (60 * 60 * 1000) <= 48/*true*/ && store.state.jumpPageData.deviceData[params.num].stat === "Online") {
        let get_img = sessionStorage.getItem(params.sn)
        if (get_img) { // 如果找到对应sn码存储的图片地址
          $(params.dom)[params.num].childNodes[1].childNodes[0].childNodes[0].src = get(params.sn) // 图片请求成功直接调用get方法拿取图片地址并使用jq选择器进行src赋值
          $(params.dom)[params.num].childNodes[1].childNodes[0].childNodes[0].onerror = function () { // 图片请求失败重新调用接口进行请求
            this.src = devlist.pic_url_get({ sn: params.sn, token: "p1" }) // 调用请求图片接口
            set(params.sn, this.src) // 存储图片地址
          }
        } else {
          this.src = devlist.pic_url_get({ sn: params.sn, token: "p1" }) // 调用请求图片接口
          set(params.sn, this.src)
        }

      } else {
        images[params.num].src = devlist.pic_url_get({ sn: params.sn, token: "p1" }) // 调用请求图片接口
        set(params.sn, images[params.num].src) // 存储图片地址
        images[params.num].onload = function () {
          for (let j = 0; j < store.state.jumpPageData.deviceData.length; j++) {
            if (!$(params.dom)[j]) return;
            let dev_sn = $(params.dom).eq(j).attr("sn");
            if (this.src.indexOf(dev_sn) > -1) {
              $(params.dom)[j].childNodes[1].childNodes[0].childNodes[0].src = this.src
              break;
            }
          }
        }
      }
    } else { //6.5.2 mmq
      images[params.num].src = devlist.pic_url_get({ sn: params.sn, token: "p1" }) // 调用请求图片接口
      set(params.sn, images[params.num].src);
      images[params.num].onload = function () {
        for (let j = 0; j < store.state.jumpPageData.deviceData.length; j++) {
          if (!$(params.dom)[j]) return
          let dev_sn = $(params.dom).eq(j).attr("sn")
          if (this.src.indexOf(dev_sn) > -1) {
            break
          }
        }
        $(params.dom)[j].childNodes[1].childNodes[0].childNodes[0].src = this.src
      }
    }
    function set (key, src) { // 存储图片
      let img = document.createElement('img')
      let imgCanvas = document.createElement('canvas')
      let imgContent = imgCanvas.getContext('2d')
      img.src = src
      img.onload = async function () {
        imgCanvas.width = this.width
        imgCanvas.height = this.height
        await imgContent.drawImage(this, 0, 0, this.width, this.height)
        let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase()
        let imgAsDataUrl = imgCanvas.toDataURL("image/" + ext) // toDataURL('image/jpg' || 'image/png')
        // try {
        //   sessionStorage.setItem(key, imgAsDataUrl)
        //   let get_img = sessionStorage.getItem(key)
        //   if (get_img) {
        //     let storage_time = new Date().getTime()
        //     sessionStorage.setItem(params.sn + "_storage_time", storage_time)
        //   }
        // } catch (e) {
        //   console.log(e, '抛出异常')
        // }
      }
    }
    function get (key) { // 获取图片
      images[params.num].src = sessionStorage.getItem(key)
      return images[params.num].src
    }
  },
  /*
  ** 图片地址拼接
  ** 根据域名地址
  */
  pic_url_get (params) {
    let pic_url_return
    let locationHost = process.env.NODE_ENV === 'production' ? window.location.host : window.location.host + '/api'
    let locationProtocol = process.env.NODE_ENV === 'production' ? window.location.protocol : 'http://'
    if (params.is_history) {
      if (locationProtocol === "file:") {
        pic_url_return = "http://" + locationHost + "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.token + "&dflag=" + params.flag + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
      } else {
        pic_url_return = locationProtocol + "//" + locationHost + "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.token + "&dflag=" + params.flag + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
      }
    } else {
      if (locationProtocol === "file:") {
        pic_url_return = "http://" + locationHost + "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.token + "_xxxxxxxxxx" + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
      } else {
        if (params.box_ipc == 1) { //如果云盒子列表请求图片
          pic_url_return = locationProtocol + "//" + locationHost + "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.token + "&dflag=" + params.flag + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
        } else {
          pic_url_return = locationProtocol + "//" + locationHost + "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + params.token + "_xxxxxxxxxx" + "&dencode_type=0&dpic_types_support=2&dflag=2"//"&dencode_type=3&dpic_types_support=2";
        }
      }
    }
    return pic_url_return
  },
  /*
  ** 以下为设备列表相关操作函数
  */
  ldev_get (sn) { // 查找该设备是否存在
    let devlist = store.state.jumpPageData.deviceData
    for (let i = 0; i < devlist.length; ++i) {
      let dev = devlist[i]
      if (dev && (dev.sn === sn)) { return dev; }
    }
    return null
  },
  ldev_index_get (sn) { // 查找在暂存数据中的编号
    let devlist = store.state.jumpPageData.deviceData
    for (let i = 0, length = devlist.length; i < length; i++) {
      if (devlist[i].sn === sn) {
        return i
      }
    }
  },
  ldev_del (sn) { // 删除
    let devlist = store.state.jumpPageData.deviceData
    for (let i = 0; i < devlist.length; ++i) {
      if (devlist[i].sn === sn) {
        devlist.splice(i, 1)
        store.dispatch('setDeviceData', devlist)
      }
    }
  },
  ldev_add (dev) { // 增加
    let devlist = store.state.jumpPageData.deviceData
    let temp_dev = this.ldev_get(dev.sn)
    if (!temp_dev) {
      devlist[devlist.length] = dev
      store.dispatch('setDeviceData', devlist)
    }
  }
}
export default devlist