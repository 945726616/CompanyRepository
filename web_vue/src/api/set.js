'use strict'
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import devlist from './devlist'
import play from './play'
import store from '../store'
import router from '@/router/vimtag'
// import md5 from '@/util/mmd5.js'
// import mcodec from '@/util/mcodec.js'
import mme from '@/util/mme.js'
const set = {
  /*
  ** 设备详细信息
  */
  async dev_info (params) {
    let sn = ""
    let mfc = ""
    let model = ""
    let ver = ""
    let name = ""
    let logo = ""
    let os = ""
    let wifi = ""
    let sensor = ""
    let type = ""
    let uptime = ""
    let def = ""
    let s_sensor = ""
    let exdev = ""
    let rffreq = ""
    let exver = ""
    let oscene = ""
    let white_light = ""
    let motion_track = ""
    let sound_detect = ""
    let face_detect = ""
    let human_detect = ""
    let onvif = ""
    let new_ealf = ""
    let wwan_exist = ""
    let fisheye = ""
    let result
    let returnItem
    await axios.get('/ccm/ccm_dev_info_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        select: params.select
      }
    }).then(res => {
      result = login.get_ret(res)
      if (result === '') {
        let msg = res.data ? res.data : "";
        sn = msg.sn;
        ver = msg.img_ver;
        name = msg.nick;
        type = msg.type;//增加返回值的type属性
        os = msg.os;
        wifi = msg.wifi;
        sensor = msg.sensor;
        if (msg.p) {
          for (let i = 0; i < msg.p.length; i++) {
            if (msg.p[i].n == "s.logo") {
              logo = msg.p[i].v;
            }
            if (msg.p[i].n == "s.mfc") {
              mfc = msg.p[i].v;
            }
            if (msg.p[i].n == "model") {
              model = msg.p[i].v;
            }
            if (msg.p[i].n == "uptime") {
              uptime = msg.p[i].v;
            }
            if (msg.p[i].n == "p0") {
              def = msg.p[i].v;
            }
            if (msg.p[i].n == "s.sensor") {
              s_sensor = msg.p[i].v;
            }
            if (msg.p[i].n == "s.exdev") {
              exdev = msg.p[i].v;
            }
            if (msg.p[i].n == "s.rffreq") {
              rffreq = msg.p[i].v;
            }
            if (msg.p[i].n == "s.exver") {
              exver = msg.p[i].v;
            }
            if (msg.p[i].n == "s.oscene") {
              oscene = msg.p[i].v;
            }
            if (msg.p[i].n == "s.white_light") {
              white_light = msg.p[i].v;
            }
            if (msg.p[i].n == "s.motion_track") {
              motion_track = msg.p[i].v
            }
            if (msg.p[i].n == "s.face_detect") {
              face_detect = msg.p[i].v;
            }
            if (msg.p[i].n == "s.sound_detect") {
              sound_detect = msg.p[i].v;
            }
            if (msg.p[i].n == "onvif") {
              onvif = msg.p[i].v;
            }
            // 添加联动框架参数判断
            if (msg.p[i].n == "dc.new_ealf") {
              new_ealf = msg.p[i].v;
            }
            // 移动检测
            if (msg.p[i].n == "s.human_detect") {
              human_detect = msg.p[i].v;
            }
            //4G
            if (msg.p[i].n == "wwan_exist" && msg.p[i].v == "existence") {
              wwan_exist = msg.p[i].v;
            }//鱼眼
            if (msg.p[i].n == "s.eye") {
              fisheye = msg.p[i].v;
            }
          }
        }
      }
      returnItem = {
        result: result,
        sn: sn,
        mfc: mfc,
        model: model,
        ver: ver,
        name: name,
        logo: logo,
        type: type,
        os: os,
        wifi: wifi,
        sensor: sensor,
        uptime: uptime,
        def: def,
        s_sensor: s_sensor,
        exdev: exdev,
        rffreq: rffreq,
        exver: exver,
        oscene: oscene,
        white_light: white_light,
        face_detect: face_detect,
        sound_detect: sound_detect,
        motion_track: motion_track,
        onvif: onvif,
        new_ealf: new_ealf,
        human_detect: human_detect,
        wwan_exist: wwan_exist,
        fisheye: fisheye
      }
    })
    return returnItem
  },
  /*
  ** 设置列表选项获取(列表风格)
  */
  async set_list_get (params) {
    let menu_data = [];
    if (params.flag == 1) {
      menu_data = [
        { name: mcs_about, type: "about" },
        { name: mcs_nickname, type: "nickname" },
        { name: mcs_admin_password, type: "admin_password" },
        { name: mcs_guest_password, type: "guest_password" },
        { name: mcs_network, type: "network" },
        { name: mcs_osd, type: "osd" },
        { name: mcs_sdcord, type: "sdcord" },
        { name: mcs_storage_device, type: "storage_device" },
        // {name:mcs_scenes,type:"scenes"}, //g 情景
        { name: mcs_w_s, type: "accessory" },
        { name: mcs_record, type: "record" },
        { name: mcs_motion_notification, type: "alarm_device_tips" },
        { name: mcs_date_time, type: "date_time" },
        { name: mcs_system, type: "system" },
        { name: mcs_others, type: "others" },
        { name: mcs_motion, type: "motion_detect" },	//新加移动侦测
        { name: mcs_light_mode, type: "lighting" },
        { name: mcs_delete_device, type: "delete_device" }
      ]
    } else if (params.flag == 2) { //云盒子
      menu_data = [
        { name: mcs_about, type: "about" },
        { name: mcs_nickname, type: "nickname" },
        { name: mcs_admin_password, type: "admin_password" },
        { name: mcs_guest_password, type: "guest_password" },
        { name: mcs_network, type: "network" },
        { name: mcs_hard_disk, type: "sdcord" },
        { name: mcs_date_time, type: "date_time" },
        { name: mcs_system, type: "system" },
        // {name:"onvif",type:"onvif"},  //onvif
        { name: mcs_delete_device, type: "delete_device" }
      ]
    } else if (params.flag == 3) {
      menu_data = [
        { name: mcs_about, type: "about" },
        { name: mcs_nickname, type: "nickname" },
        { name: mcs_admin_password, type: "admin_password" },
        { name: mcs_guest_password, type: "guest_password" },
        { name: mcs_network, type: "network" },
        { name: mcs_osd, type: "osd" },
        { name: mcs_sdcord, type: "sdcord" },
        { name: mcs_storage_device, type: "storage_device" },
        { name: mcs_alarm_device, type: "alarm_device" },
        { name: mcs_alarm_action, type: "alarm_action" },
        { name: mcs_scheduled_alerting, type: "scheduled_alerting" },
        { name: mcs_scheduled_recording, type: "scheduled_recording" },
        { name: mcs_date_time, type: "date_time" },
        { name: mcs_system, type: "system" },
        { name: mcs_others, type: "others" },
        { name: mcs_delete_device, type: "delete_device" }
      ]
    } else if (params.flag == 4) {
      menu_data = [
        { name: mcs_about, type: "about" },
        { name: mcs_delete_device, type: "delete_device" }
      ]
    } else if (params.flag == 5) { //鱼眼
      menu_data = [
        { name: mcs_about, type: "about" },
        { name: mcs_nickname, type: "nickname" },
        { name: mcs_admin_password, type: "admin_password" },
        { name: mcs_guest_password, type: "guest_password" },
        { name: mcs_network, type: "network" },
        { name: mcs_sdcord, type: "sdcord" },
        { name: mcs_storage_device, type: "storage_device" },
        // {name:mcs_scenes,type:"scenes"}, //g 情景
        { name: mcs_w_s, type: "accessory" },
        { name: mcs_record, type: "record" },
        { name: mcs_motion_notification, type: "alarm_device_tips" },
        { name: mcs_date_time, type: "date_time" },
        { name: mcs_system, type: "system" },
        { name: mcs_others, type: "others" },
        { name: mcs_motion, type: "motion_detect" },	//新加移动侦测
        { name: mcs_light_mode, type: "lighting" },
        { name: mcs_delete_device, type: "delete_device" }
      ]
    }
    return await menu_data
  },
  /*
  ** 设置列表选项获取(app方块风格)
  */
  async set_new_list_get (params) {
    let menu_data = [];
    if (params.flag == 1 || params.flag == 3) {
      menu_data = [
        {
          category: mcs_system,
          content: [
            { name: mcs_about, type: "about" },
            { name: mcs_date_time, type: "date_time" },
            { name: mcs_system_upgrade, type: "system_upgrade" },
            { name: mcs_reboot, type: "reboot" },
            { name: mcs_restore_the_factory_settings, type: "system_reset" }
          ]
        },
        {
          category: mcs_safety,
          content: [
            { name: mcs_device_password, type: "admin_password" }
          ]
        },
        {
          category: mcs_alarm_and_video,
          content: [
            { name: mcs_w_s, type: "accessory" },
            { name: mcs_alarm, type: "alarm" },
            { name: mcs_record, type: "record_new" }
          ]
        },
        {
          category: mcs_Storage,
          content: [
            { name: mcs_sdcord, type: "sdcord" },
            { name: mcs_storage_device, type: "storage_device" },
            { name: mcs_cloud_storage, type: "cloud-storage" }
          ]
        },
        {
          category: mcs_network,
          content: [
            { name: mcs_ethernet, type: "ethernet" },
            { name: "WiFi", type: "wifi" }
          ]
        },
        {
          category: mcs_picture,
          content: [
            { name: mcs_Screen_flip, type: "equipment_flip" },
            { name: "OSD", type: "osd" }
          ]
        },
        {
          category: mcs_others,
          content: [
            { name: mcs_sound, type: "sound" },
            { name: mcs_frequency, type: "power_frequency" },
            { name: mcs_light_mode, type: "lighting" },
            { name: mcs_motion_detection, type: "motion_detect" }
            // {name:mcs_screen_size,type:"resolute"} 画面设置
          ]
        }
      ]
    } else if (params.flag == 2) {
      menu_data = [
        {
          category: mcs_system,
          content: [
            { name: mcs_about, type: "about" },
            { name: mcs_system_upgrade, type: "system_upgrade" },
            { name: mcs_reboot, type: "reboot" },
            { name: mcs_restore_the_factory_settings, type: "system_reset" }
          ]
        },
        {
          category: mcs_safety,
          content: [
            { name: mcs_device_password, type: "admin_password" }
          ]
        },
        {
          category: mcs_Storage,
          content: [
            { name: mcs_hard_disk, type: "sdcord" }
          ]
        },
        {
          category: mcs_network,
          content: [
            { name: mcs_ethernet, type: "ethernet" }
          ]
        }
      ]
    }
    else if (params.flag == 4) {
      menu_data = [
        {
          category: mcs_system,
          content: [
            { name: mcs_about, type: "about" },
            { name: mcs_date_time, type: "date_time" },
            { name: mcs_system_upgrade, type: "system_upgrade" },
            { name: mcs_reboot, type: "reboot" },
            { name: mcs_restore_the_factory_settings, type: "system_reset" }
          ]
        },
        {
          category: mcs_safety,
          content: [
            { name: mcs_device_password, type: "admin_password" }
          ]
        },
        {
          category: mcs_alarm_and_video,
          content: [
            { name: mcs_accessory, type: "accessory" },
            { name: mcs_alarm, type: "alarm" },
            { name: mcs_record, type: "record" }
          ]
        },
        {
          category: mcs_Storage,
          content: [
            { name: mcs_sdcord, type: "sdcord" },
            { name: mcs_storage_device, type: "storage_device" }
          ]
        },
        {
          category: mcs_network,
          content: [
            { name: mcs_ethernet, type: "ethernet" },
            { name: "WiFi", type: "wifi" }
          ]
        },
        {
          category: mcs_picture,
          content: [
            { name: mcs_Screen_flip, type: "equipment_flip" },
            { name: "OSD", type: "osd" }
          ]
        },
        {
          category: mcs_others,
          content: [
            { name: mcs_sound, type: "sound" },
            { name: mcs_frequency, type: "power_frequency" }
          ]
        }
      ]
    } else if (params.flag == 5) {
      menu_data = [
        {
          category: mcs_system,
          content: [
            { name: mcs_about, type: "about" },
            { name: mcs_date_time, type: "date_time" },
            { name: mcs_system_upgrade, type: "system_upgrade" },
            { name: mcs_reboot, type: "reboot" },
            { name: mcs_restore_the_factory_settings, type: "system_reset" }
          ]
        },
        {
          category: mcs_safety,
          content: [
            { name: mcs_device_password, type: "admin_password" }
          ]
        },
        {
          category: mcs_alarm_and_video,
          content: [
            { name: mcs_w_s, type: "accessory" },
            { name: mcs_alarm, type: "alarm" },
            { name: mcs_record, type: "record_new" }
          ]
        },
        {
          category: mcs_Storage,
          content: [
            { name: mcs_sdcord, type: "sdcord" },
            { name: mcs_storage_device, type: "storage_device" },
            { name: mcs_cloud_storage, type: "cloud-storage" }
          ]
        },
        {
          category: mcs_network,
          content: [
            { name: mcs_ethernet, type: "ethernet" },
            { name: "WiFi", type: "wifi" }
          ]
        },
        {
          category: mcs_picture,
          content: [
            { name: mcs_Screen_flip, type: "equipment_flip" },
          ]
        },
        {
          category: mcs_others,
          content: [
            { name: mcs_sound, type: "sound" },
            { name: mcs_frequency, type: "power_frequency" },
            { name: mcs_light_mode, type: "lighting" },
            { name: mcs_motion_detection, type: "motion_detect" }
            // {name:mcs_screen_size,type:"resolute"} 画面设置
          ]
        }
      ]
    }
    return await menu_data
  },
  /*
  ** 获取升级
  */
  async upgrade_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_upgrade_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        check: params.check ? params.check : 0
      }
    }).then(res => {
      let result = login.get_ret(res)
      let status
      let progress
      let os_ver
      let ver_current
      let ver_valid
      let ver_extends
      let chang_history
      let ext_prj
      let ext_hw
      if (result === "") {
        let msg = res.data ? res.data : ""
        status = msg.task ? msg.task.stat : msg.stat;
        progress = msg.progress;
        os_ver = msg.os_ver ? msg.os_ver : "";
        ver_current = msg._cur_ver;
        ver_valid = msg._valid_ver;
        ver_extends = msg.remark;
        chang_history = msg.changes;
        ext_prj = msg.prj_ext;
        ext_hw = msg.hw_ext;
      }
      returnItem = {
        result: result,
        status: status,
        progress: progress,
        os_ver: os_ver,
        ver_current: ver_current,
        ver_valid: ver_valid,
        ver_extends: ver_extends,
        chang_history: chang_history,
        ext_prj: ext_prj,
        ext_hw: ext_hw,
        check_ver: params.check ? params.check : 0
      }
    })
    return await returnItem
  },
  /*
  ** 关于
  */
  async about (params) {
    let returnItem
    await set.upgrade_get({
      sn: params.sn,
      check: 1
    }).then(async res => {
      await set.dev_info({
        sn: params.sn
      }).then(res_dev_info => {
        if (res.result === '') {
          if ((res.ver_valid.length !== 0 && res.ver_current.length !== 0 && res.ver_valid !== res.ver_current) || (res.ext_prj !== res.ext_hw && res.ext_hw.length !== 0)) {
            res_dev_info.check_ver = 1
          } else {
            res_dev_info.check_ver = 0
          }
        }
        res_dev_info.sn = params.sn
        mme.prototype.check_plug_install("", function (res, version) {
          res_dev_info.plugin_version = version
        });
        returnItem = res_dev_info
      })
    })
    return await returnItem
  },
  /*
  ** 设置昵称
  */
  async nickname_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_nick_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        nick: params.name
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    if (returnItem && returnItem.result === "") {
      if (!store.state.jumpPageData.localFlag) {
        devlist.ldev_get(params.sn).nick = params.val;
      }
      returnItem = { msg: mcs_set_successfully, type: "success" }
      //更改vuex里deviceData中的设备昵称
      let snIndex = store.state.jumpPageData.deviceData.findIndex(({sn})=>sn === store.state.jumpPageData.selectDeviceIpc);
      let deviceData = store.state.jumpPageData.deviceData;
      deviceData[snIndex].nick = params.name;
      store.dispatch('setDeviceData',deviceData)
    } else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 获取昵称
  */
  async nickname_get (params) {
    let returnItem
    if (store.state.jumpPageData.localFlag) {
      set.dev_info({ sn: params.sn }).then(res => {
        returnItem = { nick: res.name ? res.name : params.sn }
      })
    } else {
      let nick = devlist.ldev_get(params.sn).nick ? devlist.ldev_get(params.sn).nick : params.sn;
      returnItem = { nick: nick }
    }
    return await returnItem
  },
  /*
  ** 设置管理密码
  */
  async admin_password_set (params) {
    let returnItem
    await devlist.dev_passwd_set({
      sn: params.sn,
      old_pass: params.old_pass,
      new_pass: params.new_pass,
      is_guest: 0
    }).then(async res => {
      if (res && res.result === "") {
        if (store.state.jumpPageData.loginStatus === "register_user") {
          await devlist.dev_add({ sn: params.sn, password: params.new_pass }).then(res_dev_add => {
            if (res_dev_add && res_dev_add.result === "") {
              returnItem = { msg: mcs_set_successfully, type: "success" }
              if (!store.state.jumpPageData.localFlag) {
                devlist.ldev_get(res_dev_add.info.sn).stat = res_dev_add.info.stat;
              }
            } else if (res_dev_add.result === "permission.denied") {
              returnItem = { msg: mcs_permission_denied, type: "error" }
            } else {
              returnItem = { msg: mcs_failed_to_set_the, type: "error" }
            }
          })
        }
      } else if (res.result === "accounts.pass.invalid") {
        returnItem = { msg: mcs_invalid_password, type: "error" }
      }
    })
    return returnItem
  },
  /*
  ** 设置访客密码
  */
  async guest_password_set (params) {
    let returnItem
    await devlist.dev_passwd_set({
      sn: params.sn,
      old_pass: params.old_pass,
      new_pass: params.new_pass,
      is_guest: 1
    }).then(res => {
      if (res && res.result == "") {
        returnItem = { msg: mcs_set_successfully, type: "success" }
      }
      else if (res.result == "accounts.pass.invalid") {
        returnItem = { msg: mcs_invalid_password, type: "error" }
      }
    })
    return returnItem
  },
  /*
  ** 设置有线网络
  */
  async set_network (params) {
    let returnItem
    await devlist.net_set({
      sn: params.sn,
      networks: params.networks,
      dns: params.dns
    }).then(res => {
      let result = login.get_ret(res)
      if (result === '') {
        returnItem = { msg: mcs_set_successfully, type: "success", select: params.select }
      } else if (result === "permission.denied") {
        returnItem = { msg: mcs_permission_denied, type: "error", select: params.select }
      } else {
        returnItem = { msg: mcs_failed_to_set_the, type: "error", select: params.select }
      }
    })
    return returnItem
  },
  /*
  ** 获取有线网络
  */
  async get_network (params) {
    let returnItem
    let networks, dns
    await set.dev_info({
      sn: params.sn
    }).then(async res => {
      let wwan_exist
      if (res && res.result === "") {   //The beginning of a new version of the old version is no v v v string comparison there is not necessarily greater than v
        if (res.wwan_exist) {
          wwan_exist = res.wwan_exist
        }
        if (res.ver < "12.10.17.23.45") {
          // l_old_version = 1;
          // ms.send_msg("net_get",{sn:data.sn,force_scan:0},{select:mcs_ethernet},dev_net_get_ack);
        } else {
          // l_old_version = 0;
          await devlist.net_get({ sn: params.sn, force_scan: 0, filter: "all" }).then(res_net_get => {
            let result = login.get_ret(res_net_get)
            if (result === '') {
              let res_net_get_returnItem // 对net_get接口返回的参数进行整理处理后的结果
              let msg = res_net_get.data ? res_net_get.data.info : ""
              networks = msg.ifs;
              dns = msg.dns;
              res_net_get_returnItem = { result: result, networks: networks, dns: dns }
              res_net_get_returnItem.wwan_exist = wwan_exist
              returnItem = [res_net_get_returnItem, { ip: store.state.jumpPageData.serverDevice, select: (params.select == null ? null : params.select) }]
            }
          })
        }
      }
    })
    return await returnItem
  },
  /*
  ** 设置osd
  */
  async osd_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_osd_set', {
      params: {
        sess: { nid: login.create_nid(), sn: params.sn },
        osd: {
          text: params.text, text_enable: params.text_enable, week: params.week_enable,
          date: { format: params.date_format, date_enable: params.date_enable, enable_12h: params.time_12h, time_enable: params.time_enable }
        }
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    if (returnItem && returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success" }
    } else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 获取osd
  */
  async osd_get (params) {
    let returnItem
    let text
    let text_enable
    let week_enable
    let date_format
    let date_enable
    let time_12h
    let time_enable
    await axios.get('/ccm/ccm_osd_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res);
      if (result === "") {
        let msg = res.data ? res.data.osd : "";
        text = msg.text;
        text_enable = msg.text_enable;
        week_enable = msg.week;
        date_format = msg.date.format;
        date_enable = msg.date.date_enable;
        time_12h = msg.date.enable_12h;
        time_enable = msg.date.time_enable;
      }
      returnItem = {
        result: result,
        text: text,
        text_enable: text_enable,
        week_enable: week_enable,
        date_format: date_format, 
        date_enable: date_enable,
        time_12h: time_12h,
        time_enable: time_enable
      }

    })
    return returnItem
  },
  /*
  ** sd卡存储接口
  ** 该接口调用两次, 两次含有不同的参数传入, 将参数区别放在传入调用处
  */
  async disk_ctl (params) {
    let returnItem
    await axios.get('/ccm/ccm_disk_ctl', {
      params: params
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem
  },
  /*
  ** sd卡设置
  */
  async sd_set (params) {
    let returnItem
    if (params.no_conf) {
      await set.disk_ctl({
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "sd",
        type: params.ctrl_type ? params.ctrl_type : ""
      }).then(res => {
        if (res && res.result === '') {
          returnItem = res
        }
      })
    } else {
      let record_mode = params.record_mode || ""
      await set.disk_ctl({
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "sd",
        type: params.ctrl_type ? params.ctrl_type : "",
        conf: {
          enable: params.flag ? 1 : 0,
          record_mode: record_mode
        }
      }).then(res => {
        if (res && res.result === '') {
          returnItem = res
        }
      })
    }
    if (returnItem && returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success" }
    } else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** sd卡设置获取
  */
  async sd_get (params) {
    let returnItem
    let enable, status, capacity, usage, availableSize, conf, no_sdcard;
    await axios.get('/ccm/ccm_disk_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res);
      if (result === "") {
        let msg = (res.data && res.data.disks) ? res.data.disks[0] : res.data;
        enable = msg.conf.enable;
        status = msg.stat;    /* readonly/mount/repairing/formating/umount/empty */
        capacity = msg.size;  /* Total disk size */
        usage = msg.used_size;    /* Used size */
        availableSize = msg.available_size;
        conf = msg.conf;
        if (status == "empty") {
          no_sdcard = devlist.ldev_get(params.sn).type == "BOX" ? mcs_no_hard_disk : mcs_no_sdcard;
        }
      }
      returnItem = {
        result: result,
        enable: enable,
        status: status,
        capacity: capacity,
        usage: usage,
        availableSize: availableSize,
        conf: conf,
        no_sdcard: no_sdcard
      }
    })
    // if (returnItem && returnItem.result === "") {
    //   returnItem = { msg: mcs_set_successfully, type: "success" }
    // } else if (msg.result === "permission.denied") {
    //   returnItem = { msg: mcs_permission_denied, type: "error" }
    // } else {
    //   returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    // }
    return returnItem
  },
  /*
  ** 存储设置
  */
  async storage_device_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_box_login', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        },
        enable: params.enable,
        username: params.username,
        password: params.password
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    if (returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success" }
    }
    else if (returnItem.result == "accounts.pass.invalid") {
      returnItem = { msg: mcs_invalid_password, type: "error" }
    }
    else if (returnItem.result == "accounts.user.offline") {
      returnItem = { msg: mcs_offline, type: "error" }
    }
    else if (returnItem.result == "accounts.user.unknown") {
      returnItem = { msg: mcs_invalid_dev, type: "error" }
    }
    else if (returnItem.result == "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 存储设置获取
  */
  async storage_device_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_box_conf_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res)
      if (result === "" && res.data) {
        returnItem = { result: login.get_ret(res), conf: res.data }
      } else {
        returnItem = { result: result }
      }
    })
    return returnItem
  },
  /*
  ** 获取门磁
  */
  async exdev_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_exdev_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        id: params.id,
        flag: params.flag,
        start: params.start,
        counts: params.counts
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 设置门磁
  */
  async exdev_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_exdev_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        dev: params.dev
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 删除门磁
  */
  async exdev_del (params) {
    let returnItem
    await axios.get('/ccm/ccm_exdev_del', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        id: params.id
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 添加门磁
  */
  async exdev_add (params) {
    let returnItem
    await axios.get('/ccm/ccm_exdev_add', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        id: params.id,
        model: params.model
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 搜索门磁
  */
  async exdev_discover (params) {
    let returnItem
    await axios.get('/ccm/ccm_exdev_discover', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        flag: params.flag,
        timeout: params.timeout,
        interval: params.interval
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** scene获取
  */
  async scene_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_scene_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res), data: res.data }
    })
    return returnItem
  },
  /*
  ** scene设置
  */
  async scene_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_scene_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        all: params.all,
        info: params.info
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res), data: res.data }
    })
    if (returnItem && returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success", select: params.select }
    } else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error", select: params.select }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error", select: params.select }
    }
    return returnItem
  },
  /*
  ** 报警设置
  */
  async alarm_device_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_alert_dev_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        conf: {
          io_in_mode: params.io_input,
          io_out_mode: params.io_output,
          motion_level: params.sensitivity,
          motion_level_night: params.night_sensitivity,
          audio_level: params.audio_level,
          motion_track_switch: params.motion_track_switch,
          face_detect_switch: params.face_detect_switch
        }
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res)
      }
    })
    if (returnItem && returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success" }
    } else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 报警获取
  */
  async alarm_device_get (params) {
    let returnItem
    let io_input, io_output, sensitivity, night_sensitivity, motion_track_switch, face_detect_switch, audio_level
    await axios.get('/ccm/ccm_alert_dev_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res);
      if (result === "") {
        let msg = res.data ? res.data.conf : "";
        io_input = msg.io_in_mode;   /* Open:always open; Close:always close */
        io_output = msg.io_out_mode;    /* Open:always open; Close:always close */
        sensitivity = msg.motion_level;  /* level of sensitivity about motion detect at day 0-100 */
        night_sensitivity = msg.motion_level_night;    /* level of sensitivity about motion detect at night */
        motion_track_switch = msg.motion_track_switch;
        face_detect_switch = msg.face_detect_switch;
        // human_detect_switch =msg.human_detect_switch;
        audio_level = msg.audio_level;
      }
      returnItem = {
        result: result,
        io_input: io_input,
        io_output: io_output,
        sensitivity: sensitivity,
        night_sensitivity: night_sensitivity,
        motion_track_switch: motion_track_switch,
        face_detect_switch: face_detect_switch,
        audio_level: audio_level
      }
    })
    if (returnItem && returnItem.result === "") {
      returnItem.data_flag = params.flag;
    }
    return returnItem
  },
  /*
  ** 报警动作设置
  */
  alarm_action_set (params) {
    let returnItem
    let req_data = {
      sess: {
        nid: login.create_nid(),
        sn: params.sn
      },
      enable: params.enable,
      actions: params.actions
    }
    returnItem = set.alert_task_get(req_data)
    if (returnItem && returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success" }
    } else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 报警动作获取
  */
  async alarm_action_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_alert_action_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res);
      if (result === "") {
        let msg = res.data ? res.data : "";
        enable = msg.enable;
        actions = msg.actions;
      }
      returnItem = { result: result, enable: enable, actions: actions }
    })
    return returnItem
  },
  /*
  ** 警告任务获取
  */
  async alert_task_get (params) {
    let enable, full_time, times
    let returnItem
    await axios.get('/ccm/ccm_alert_action_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(res);
      if (result === "") {
        let msg = res.data ? res.data : "";
        enable = msg.sch.enable;
        full_time = msg.sch.full_time;
        times = msg.sch.times;
      }
      returnItem = { result: result, enable: enable, times: times, full_time: full_time }
    })
    return returnItem
  },
  /*
  ** 警告任务设置接口
  */
  async alert_task_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_alert_action_set', {
      params: params
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem
  },
  /*
  ** 警告任务设置
  */
  use_alert_task_set (params) {
    let returnItem
    set.alarm_action_get({ sn: params.sn }).then(res => {
      set.alert_task_set({ sn: params.sn, enable: res.enable, sch_enable: params.sch_enable, full_time: 0, times: params.times }).then(res_task_set => {
        if (res_task_set && res_task_set.result === "") {
          returnItem = { msg: mcs_set_successfully, type: "success" }
        }
        else if (res_task_set.result === "permission.denied") {
          returnItem = { msg: mcs_permission_denied, type: "error" }
        }
      })
    })
    return returnItem
  },
  /*
  ** 计划表获取
  */
  async schedule_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_schedule_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 计划表设置
  */
  async schedule_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_schedule_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        sch: params.sch
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 回放设置(该函数在play中已经封装过了后续可以考虑合并处理)
  */
  async record_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_record_task_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        task: {
          sch: {
            enable: params.enable,
            full_time: params.full_time,
            times: params.times
          }
        }
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res)
      }
    })
    if (returnItem && returnItem.result === "") {
      returnItem = { msg: mcs_set_successfully, type: "success" }
    }
    else if (returnItem.result === "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" }
    }
    return returnItem
  },
  /*
  ** 回放设置获取(该函数在play中已经封装过了后续可以考虑合并处理)
  */
  async record_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_record_task_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      let result = login.get_ret(msg);
      if (result === "") {
        sd_ready = res.data.sd_ready
        let msg = res.data ? res.data.task.sch : ""
        enable = msg.enable
        full_time = msg.full_time
        times = msg.times
      }
      returnItem = {
        result: result,
        enable: enable,
        full_time: full_time,
        times: times,
        sd_ready: sd_ready
      }
    })
    return returnItem
  },
  /*
  ** 时间设置(ccm_ntp_set函数在devlist中已经封装过了后续可以考虑合并处理)
  */
  async time_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_date_set', {
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
    }).then(async res => {
      let result = login.get_ret(res);
      if (result === "") {
        await axios.get('/ccm/ccm_ntp_set', {
          params: {
            sess: {
              nid: login.create_nid(),
              sn: params.sn
            },
            auto_sync: params.auto_sync, manual: { ip: params.ntp_addr }
          }
        }).then(res_ntp_set => {
          returnItem = {
            result: login.get_ret(res_ntp_set)
          }
        })
      }
      else {
        returnItem = { result: result }
      }
    })
    if (returnItem && returnItem.result == "") {
      returnItem = { msg: mcs_set_successfully, type: "success" };
    } else if (returnItem.result == "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" };
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 时间设置获取
  */
  async time_get (params) {
    let returnItem
    let timezone, auto_sync, ntp_addr, hour, min, sec, year, mon, day
    await axios.get('/ccm/ccm_ntp_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(async res => {
      let result = login.get_ret(res);
      if (result === "") {
        let msg = res.data ? res.data.info : "";
        timezone = msg.timezone;
        // g_timezone = msg.TimeZone;
        auto_sync = msg.auto_sync_enable;
        ntp_addr = msg.manual[0].ip;
        await axios.get('/ccm/ccm_date_get', {
          params: {
            sess: {
              nid: login.create_nid(),
              sn: params.sn
            }
          }
        }).then(res_date_get => {
          let result = login.get_ret(res_date_get);
          if (result == "") {
            let msg2 = res_date_get.data ? res_date_get.data.utc_date : "";
            hour = msg2.time.hour;
            min = msg2.time.min;
            sec = msg2.time.sec;
            year = msg2.date.year;
            mon = msg2.date.mon;
            day = msg2.date.day;
          }
          returnItem = {
            result: result,
            timezone: timezone,
            auto_sync: auto_sync,
            ntp_addr: ntp_addr,
            hour: hour,
            min: min,
            sec: sec,
            year: year,
            mon: mon,
            day: day
          }
        })
      } else {
        returnItem = { result: result }
      }
    })
    return returnItem
  },
  /*
  ** 重启设备
  */
  async reboot_device (params) {
    let returnItem
    await axios.get('/ccm/ccm_reboot', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    if (returnItem.result === "") {
      return returnItem;
    }
    return null
  },
  /*
  ** 重置设备
  */
  async reset_device (params) {
    await axios.get('/ccm/ccm_restore', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        backup: params.keep_cofig
      }
    }).then(async res => {
      if (login.get_ret(res) === '') {
        await set.reboot_device(params)
      }
    })
  },
  /*
  ** 启用设备
  */
  async dev_activate (params) {
    let returnItem
    await axios.get('/ccm/ccm_active', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        ActivationCode: params.activationCode
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem
  },
  /*
  ** 获取描述
  */
  async desc_get (params) {
    let returnItem
    await axios.get('/ccm/ccvs_get_desc_req', {
      params: {
        sess: {
          nid: login.create_nid()
        },
        ver_type: params.ver_type,
        ver_from: params.ver_from,
        ver_to: params.ver_to,
        lang: params.lang
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 升级设置
  */
  async upgrade_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_upgrade', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        img_src: "download"
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    if (params.check) {
      returnItem.check_ver = params.check
    }
    returnItem.type = ""
    return returnItem
  },
  /*
  ** 语音设置接口
  */
  async speaker_set (params) {
    return await axios.get('/ccm/ccm_speaker_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        conf: {
          token: "ao0", level: params.speaker_level
        },
        force_persistence: 1
      }
    })
  },
  /*
  ** 语音设置获取接口
  */
  async speaker_get (params) {
    return await axios.get('/ccm/ccm_speaker_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "ao0"
      }
    })
  },
  /*
  ** mic获取接口
  */
  async mic_get (params) {
    return await axios.get('/ccm/ccm_mic_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    })
  },
  /*
  ** mic设置接口
  */
  async mic_set (params) {
    return await axios.get('/ccm/ccm_mic_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        conf: {
          entity: params.entity,
          token: params.token,
          silent: params.silent,
          level: params.mic_level
        },
        force_persistence: 1
      }
    })
  },
  /*
  ** 音频设置
  */
  async audio_set (params) {
    let returnItem
    await set.speaker_set({
      sn: params.sn,
      speaker_level: params.speaker_level
    }).then(async res_speaker_set => {
      if (login.get_ret(res_speaker_set) === '') {
        await set.mic_get({ sn: params.sn }).then(async res_mic_get => {
          var msg, entity, silent, token
          if (login.get_ret(res_mic_get) === '') {
            msg = res_mic_get.data ? res_mic_get.data.conf[0] : ""
            entity = msg.entity
            silent = msg.silent
            token = msg.token
            await set.mic_set({
              sn: params.sn,
              entity: entity,
              token: token,
              silent: silent,
              mic_level: params.mic_level
            }).then(res_mic_set => {
              returnItem = { result: login.get_ret(res_mic_set) }
            })
          } else {
            returnItem = { result: login.get_ret(res_mic_get) }
          }
        })
      } else {
        returnItem = { result: login.get_ret(res_speaker_set) }
      }
    })
    if (returnItem && returnItem.result == "") {
      returnItem = { msg: mcs_set_successfully, type: "success" };
    } else if (returnItem.result == "permission.denied") {
      returnItem = { msg: mcs_permission_denied, type: "error" };
    } else {
      returnItem = { msg: mcs_failed_to_set_the, type: "error" }
    }
    return returnItem
  },
  /*
  ** 音频设置获取
  */
  async audio_get (params) {
    let returnItem
    await set.speaker_get({
      sn: params.sn
    }).then(async res_speaker_get => {
      if (login.get_ret(res_speaker_get) === '') {
        await set.mic_get({
          sn: params.sn
        }).then(res_mic_get => {
          returnItem = { result: login.get_ret(res_mic_get), speaker_level: res_speaker_get.data.conf.level, mic_level: res_mic_get.data.conf[0].level }
        })
      } else {
        returnItem = { result: login.get_ret(res_speaker_get) }
      }
    })
    return await returnItem
  },
  /*
  ** 画面翻转设置
  */
  async cam_set (params) {
    let returnItem;
    let l_cam_info = {};
    await play.adjust_get({sn: params.sn}).then(async res => {
      l_cam_info = res;
      l_cam_info.sn = params.sn;
      l_cam_info.flip = params.flip;
      l_cam_info.flicker_freq = params.flicker_freq;
      await play.adjust_set(l_cam_info).then(res_cam_set => {
        returnItem = res_cam_set;
      })
    })
    return returnItem;
  },
  /*
  ** 白光设置
  */
  async white_light_set (params) {
    let returnItem;
    await axios.get('/ccm/ccm_img_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        token: "vs0",
        conf: { light_mode: params.light_mode }
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem;
  },
  /*
  ** 白光设置获取
  */
  async white_light_get (params) {
    let returnItem
    await play.img_get({
      sn: params.sn
    }).then(res => {
      if (login.get_ret(res) === '' && res.data) {
        returnItem = { result: login.get_ret(res), conf: res.data.conf }
      } else {
        returnItem = { result: login.get_ret(res) }
      }
    })
    return returnItem
  },
  /*
  ** 联动框架获取动作开关
  */
  async dev_action_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_dev_action_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        action_name: params.action_name
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res), data: res.data }
    })
    return returnItem
  },
  /*
  ** 联动框架设置动作开关
  */
  async dev_action_set (params) {
    let returnItem
    await axios.get('/ccm/ccm_dev_action_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        info: params.info
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res), data: res.data }
    })
    if (returnItem && returnItem.result !== "") {
      if (returnItem.result === "permission.denied") {
        returnItem = { msg: mcs_permission_denied, type: "error" }
      } else {
        returnItem = { msg: mcs_failed_to_set_the, type: "error" }
      }
    }
    return returnItem
  },
  /*
  ** 联动框架->设置持续录像计划表
  */
  async plan_record_set (params) {
    let returnItem
    await axios.post('/ccms/ccm_plan_record_set', {
      sess: {
        nid: login.create_nid(),
        sn: params.sn
      },
      sche: params.sche
    }).then(res => {
      returnItem = { result: login.get_ret(res), data: res.data }
    })
    if (returnItem && returnItem.result !== "") {
      if (returnItem.result === "permission.denied") {
        returnItem = { msg: mcs_permission_denied, type: "error" }
      } else {
        returnItem = { msg: mcs_failed_to_set_the, type: "error" }
      }
    }
    return returnItem
  },
  /*
  ** 联动框架->设置动作时间表
  ** 计划表长度太长所以用post方式提交
  */
  async alarm_sche_set (params) {
    let returnItem
    await axios.post('/ccms/ccm_action_sche_set', {
      sess: {
        nid: login.create_nid(),
        sn: params.sn
      },
      exdev_id: params.exdev_id,
      sche: params.sche
    }).then(res => {
      if (res && login.get_ret(res) === "") {
        returnItem = { result: login.get_ret(res), data: res.data }
      } else if (login.get_ret(res) === "permission.denied") {
        returnItem = { msg: mcs_permission_denied, type: "error" }
      } else {
        returnItem = { msg: mcs_failed_to_set_the, type: "error" }
      }
    })
    return returnItem
  },
  /*
  ** 联动框架->获取附件配置表
  */
  async profile_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_dev_profile_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: { info: res.data.info }
      }
    })
    return returnItem
  },
  /*
  ** 联动框架->获取持续录像计划表
  */
  async plan_record_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_plan_record_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        }
      }
    }).then(res => {
      returnItem = {
        result: login.get_ret(res),
        data: res.data
      }
    })
    return returnItem
  },
  /*
  ** 联动框架->获取动作时间表
  */
  async alarm_sche_get (params) {
    let returnItem
    await axios.get('/ccm/ccm_action_sche_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.sn
        },
        exdev_id: params.exdev_id
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res), data: res.data }
    })
    return returnItem
  }
}

export default set