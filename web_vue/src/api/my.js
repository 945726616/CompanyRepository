'use strict'
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import store from '../store'
import md5 from '@/util/mmd5.js'
// import mcodec from '@/util/mcodec.js'
const my = {
  /*
  ** 修改游客/管理密码接口
  */
  async account_passwd_set (params) {
    let returnItem
    let old_pass = (params.old_pass && md5.hex(params.old_pass))
    let new_pass = (params.new_pass && md5.hex(params.new_pass))
    await axios.get('/ccm/cacs_passwd_req', {
      params: {
        nid: login.create_nid(),
        old_pass: login.pwd_encrypt(old_pass),
        new_pass: login.pwd_encrypt(new_pass),
        guest: params.is_guest ? 1 : 0
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    returnItem.is_guest = params.is_guest // 添加游客标识属性
    return returnItem
  },
  /*
  ** 获取用户邮箱接口
  */
  async get_user_email (params) {
    let returnItem
    console.log(store.state.user, 'user vuex')
    let uctx = login.get_uctx({ app: { id: params.appid } })
    returnItem = axios.get('/ccm/cacs_query_req', { // 调用获取绑定邮箱接口
      params: {
        lid: store.state.user.lid,
        nid: login.create_nid_ex(2), // 计算nid
        user: params.username,
        param: [{ n: "uctx", v: uctx }]
      }
    })
    return returnItem
  },
  /*
  ** 绑定邮箱接口
  */
  async binding_email (params) {
    let returnItem
    let json_buf = { app: { id: params.appid, name: params.name, ver: params.version } };
    let uctx = login.get_uctx(json_buf)
    await axios.get('/ccm/cacs_bind_req', {
      params: {
        nid: login.create_nid_ex(2),
        email: params.email,
        user: params.user,
        pass: login.pwd_encrypt(params.pass),
        lang: params.lang,
        p: [{ n: "uctx", v: uctx }]
      }
    }).then(res => {
      returnItem = { result: login.get_ret(res) }
    })
    return returnItem
  }
}

export default my