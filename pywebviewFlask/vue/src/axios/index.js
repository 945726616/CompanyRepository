/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 */
import axios from 'axios'
// import x2js from 'x2js' //xml数据处理插件
import mcodec from '../util/mcodec'
// const x2Js = new x2js()
import store from '../store'
// import router from '../router'
import QS from 'qs';//引入qs模块，用来序列化post类型的数据
/** 
 * 提示函数 
 * 禁止点击蒙层、显示一秒后关闭
 */
// const tip = msg => {
//     // Toast({
//     //     message: msg,
//     //     duration: 1000,
//     //     forbidClick: true
//     // })
// }

/** 
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
// const toLogin = () => {
//     router.replace({
//         path: '/login',
//         query: {
//             redirect: router.currentRoute.fullPath
//         }
//     })
// }

/** 
 * 请求失败后的错误统一处理 
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, other) => {
  // 状态码判断
  // switch (status) {
  //     // 401: 未登录状态，跳转登录页
  //     case 401:
  //         toLogin()
  //         break
  //     // 403 token过期
  //     // 清除token并跳转登录页
  //     case 403:
  //         tip('登录过期，请重新登录')
  //         localStorage.removeItem('token')
  //         store.commit('loginSuccess', null)
  //         setTimeout(() => {
  //             toLogin()
  //         }, 1000)
  //         break
  //     // 404请求不存在
  //     case 404:
  //         tip('请求的资源不存在')
  //         break
  //     default:
  //         console.log(other)
  // }
  console.log(status, other)
}

// 创建axios实例
let instance = axios.create({ timeout: 400000 })
let hfrom_handle = Math.floor(Math.random()*10000)

// 设置post请求头
// instance.defaults.headers['Access-Control-Allow-Origin'] = '*'//解决cors头问题
// instance.defaults.headers['Access-Control-Allow-Credentials'] = 'true'//解决session问题
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'//将表单数据传递转化为form-data类型 ; charset=UTF-8

/**
 * 请求拦截器
 * 每次请求前，重新拼接请求参数键名添加d
 */
instance.interceptors.request.use(
  config => {
    if(config.method === 'get'){
      let param = config.params // 取得当前get传递的对象
      let newParams = {} // 新建对象用于存储变更后的对象
      // console.log(param, 'config_param')
      newParams = mcodec.obj_2_url(param, '&') // 采用原项目中对参数进行加密的方法进行封装
      // for (let paramName in param) {
      //   newParams['d' + paramName] = param[paramName] // 遍历对象键值对并重新命名属性名 后续此处需要添加两个额外的固定参数数据值通过vuex进行存取
      // }
      config.params = {
        hfrom_handle: hfrom_handle++,
        hqid: store.state.user.qid,
        ...newParams
      } // 修改后的对象
      // console.log(config, 'getConfig', location.host)
      if (process.env.NODE_ENV !== 'production') { // 如果是测试环境下接口添加/api采用代理地址进行访问,解决跨域等问题
        let url = config.url
        if (!config.params.dsrv) { // 特殊请求地址判断 含有dsrv的为特殊请求地址需要用特殊地址进行访问
          config.url = '/api' + url + '.js'
        } else {
          config.url = '/project' + url + '.js'
        }
      }else{
        // if (!config.params.dsrv) { // 特殊请求地址判断 含有dsrv的为特殊请求地址需要用特殊地址进行访问
          // console.log('enter get config url')
          config.url = config.url + '.js'
        // } else { // 对cmipcgw/cmipcgw_get_req特殊处理
        //   config.url = 'https://vimtag.com' + config.url + '.js'
        // }
      }
    }else if(config.method === "post"){
      let param = config.data // 取得当前get传递的对象
      let newParams = {} // 新建对象用于存储变更后的对象
      // console.log(param, 'config_param')
      newParams = mcodec.obj_2_url(param, '&') // 采用原项目中对参数进行加密的方法进行封装
      config.data = {
        hfrom_handle: 27141,
        hqid: store.state.user.qid,
        ...newParams
      } // 修改后的对象
      config['withCredentials'] = true
      config.data = QS.stringify(config.data)//要使用对提交从参数对象进行序列化的操作
      if (process.env.NODE_ENV !== 'production') { // 如果是测试环境下接口添加/api采用代理地址进行访问,解决跨域等问题
        let url = config.url
        // console.log(config.params, 'srv', config.params.dsrv)
        // if (!config.params.dsrv) {
          config.url = '/api' + url + '.js'
        // } else {
        //   config.url = '/project' + url + '.js'
        // }
      }else{
        config.url = config.url + '.js'
      }
    }
    
    // config.url = location.host + config.url
    // console.log(config, 'axiosConfig')
    return config
  },
  error => Promise.error(error))

// 响应拦截器
instance.interceptors.response.use(
  // 请求成功
  res => {
    if (res.status === 200) { // 接口请求成功进行接口数据处理
      let getRes = eval(res.data)
      // console.log(getRes, 'getRes')
      // /* eslint-disable */
      function message (obj) { // 该函数在服务器端用于渲染iframe 目前暂时先在此处进行返回值处理
        return obj
      }
      res.data = getRes
      // res = {
      //   status: res.status, // 接口返回状态值
      //   statusText: res.statusText, // 返回状态文字
      //   ...x2Js.xml2js(getRes.data).message // 使用xml插件进行解析后的message数据
      // }
      Promise.resolve(res)
    } else {
      Promise.reject(res)
    }
    return res.data
  },
  // 请求失败
  error => {
    const { response } = error
    console.log(response)
    if (response) {
      // 请求已发出，但是不在2xx的范围
      errorHandle(response.status, response.data.message)
      return Promise.reject(response)
    } else {
      // 处理断网的情况
      // eg:请求超时或断网时，更新state的network状态
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
      if (!window.navigator.onLine) {
        // store.commit('changeNetwork', false)
      } else {
        return Promise.reject(error)
      }
    }
  })

export default instance