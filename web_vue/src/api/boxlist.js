'use strict'
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import store from '../store'
import devlist from './devlist'
// import md5 from '@/util/mmd5.js'
// import mcodec from '@/util/mcodec.js'
const boxlist = {
  /*
  ** 获取云盒子onvif设备列表
  */
  async onvif_box_search (params) {
    let returnItem
    await axios.get('/ccm/ccm_box_search', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        }
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem
  },
  /*
  ** 获取云盒子内设备列表
  */
  async get_onvif_list (params) {
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
      if (result === '' && res.data) {
        returnItem = {
          result: result,
          list: res.data.list,
          conf: res.data.conf,
          connect_infos: res.data.connect_infos
        }
      } else {
        returnItem = { result: result }
      }
    })
    return returnItem
  },
  /*
  ** 云盒子设备列表的图片获取
  */
  boxlist_img_get (params) {
    let l_canvas_dom_array = [];
    l_canvas_dom_array = params.dom;
    let data_ipc_length = params.ipc ? params.ipc.length : 0;
    // console.log(data_ipc_length, "data_ipc_length")
    for (let i = 0; i < data_ipc_length; i++) {
      let token = params.ipc[i].sn + "_" + params.resolution + "_" + Math.pow(2, 31) + "_" + Math.pow(2, 31);
      if (store.state.jumpPageData.localFlag) {
        let url = devlist.pic_url_get({ sn: params.sn, token: token, flag: 2, is_history: 1 })
        console.log(url, 'boxlist_img_get_local')
        if (l_canvas_dom_array[i]) {
          if (l_canvas_dom_array[i].attribute) {
            if (l_canvas_dom_array[i].attributes.imgId.nodeValue === (i + "")) {
              $(".box_camera_sign_picture")[i].attr('src', url)
            }
          } else {
            l_canvas_dom_array[i].src = url;
          }
        }
      } else {
        let url;
        if(process.env.NODE_ENV === 'production'){
          url = window.location.protocol + "//" + window.location.host + "/ccm/ccm_pic_get.js?dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + token + "&dencode_type=3&dpic_types_support=2";
        }else{
          url = window.location.protocol + "//" + window.location.host + "/api/ccm/ccm_pic_get.js?dsess=1&dsess_nid=" + login.create_nid() + "&dsess_sn=" + params.sn + "&dtoken=" + token + "&dencode_type=3&dpic_types_support=2";
        }
        if (l_canvas_dom_array[i]) {
          if (l_canvas_dom_array[i].attribute) {
            if (l_canvas_dom_array[i].attributes.imgId.nodeValue === (i + "")) {
              $(".box_camera_sign_picture")[i].attr('src', url)
            }
          } else {
            l_canvas_dom_array[i].src = url;
          }
        }
      }

    }
  },
  /*
  ** 云盒子设备列表获取
  */
  async box_get (params) {
    let returnItem
    let cid = params.cid ? params.cid : -1;
    let sid = params.sid ? params.sid : -1;
    let direction = params.direction ? 1 : 0;
    await axios.get('/ccm/ccm_box_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        },
        sn: params.dev_sn,
        flag: params.flag,
        start_time: params.start_time,
        end_time: params.end_time,
        search_type: params.search_type,
        cid: cid,
        sid: sid,
        direction: direction,
        max_counts: 10000
      }
    }).then(res => {
      let result = login.get_ret(res)
      if (result === '' && res.data) {
        switch (params.flag) {
          case 1:
            returnItem = { result: result, ipcs: res.data.ipcs }
            break
          case 2:
            returnItem = { result: result, date_infos: res.data.date_infos }
            break
          case 4:
            returnItem = { result: result, segs: res.data.segs }
            break
          case 8:
            returnItem = { result: result, segs_sdc: res.data.segs_sdc }
            break
          default:
            break
        }
      } else {
        returnItem = { result: result }
      }
    })
    if (returnItem && returnItem.result === '') {
      let ipcs_length = returnItem.ipcs ? returnItem.ipcs.length : 0;
      for (let i = 0; i < ipcs_length; i++) {
        returnItem.ipcs[i].nick = returnItem.ipcs[i].nick ? returnItem.ipcs[i].nick : returnItem.ipcs[i].sn;
      }
    }
    return returnItem
  },
  /*
  ** 发送添加设备请求
  */
  async onvif_box_add_ipc (params) {
    let returnItem
    await axios.get('/ccm/ccm_box_set_ipc_req', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        },
        enable: params.enable,
        sn: params.sn,
        flag: params.flag,
        username: params.username,
        password: params.password,
        ip: params.ip,
        port: params.port,
        type: params.type,
        record: params.record,
        no_ack: params.no_ack,
        uuid: params.uuid,
        code_match: params.code_match
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem
  }
}

export default boxlist