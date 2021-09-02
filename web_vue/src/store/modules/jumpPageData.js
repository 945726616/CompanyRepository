// 跳转页面使用的vuex进行数据存储
console.log(sessionStorage.getItem('experienceShow') ? sessionStorage.getItem('experienceShow') : true, '1')
const jumpPageData = {
  state: {
    pageDom: '',
    pageObj: {},
    projectName: sessionStorage.getItem('projectName') ? sessionStorage.getItem('projectName') : getProjectName(), // 项目名称获取,考虑后续优化获取方法,并删除相关修改项
    localFlag: 0, // 本地模式标识
    loginWaitFlag: 0,
    experienceFlag: 0, // 是否为体验状态
    experienceShow: sessionStorage.getItem('experienceShow') === 'false' ? false : true, // 体验是否展示
    downloadManualUrl: '', // vsmahome用户手册下载域名
    playDownloadUrl: '', // 视频播放时会用到该地址
    bufferPageFlag: null, // 遮罩层计时器
    // pcOfflineFlag: GetQueryString("pc_is_offline") ? GetQueryString("pc_is_offline") : 0, // 是否为离线模式(没有修改该数据的地方所以不设置mutation以及action)
    deviceData: [], // 全局设备列表内容数据
    projectFlag: location.href.indexOf('vimtag') > -1 ? 0 : 1, // 项目判断标识(不可修改不添加mutation以及action)
    selectDeviceIpc: null, // 选择中设备sn码
    selectNick: '', // 选中的设备nick
    flashIsPlay: null, // flash自动播放
    playInfo: '', // 播放相关详情
    webClientV: "0.0.0",//版本号
    hostname: '',
    kbwin: 0, //定义全局变量查看app是否为定制kbwin  5.11.3
    historyData: null, //历史数据
    serverDevice: '', // get_req接口请求回的服务器地址
    boxDeviceData: [],// 定义的全局变量，初始化 ,标记实时播放列表显示,解决修改g_device_data 从云盒子返回设备列表页出错问题
    networkEnviron: '', // 代表内部网络访问或外部网络访问直接连接之间的区别非直接连接
    systemStopWait: null, // 系统停止等待
    loginStatus: '',// Keeping the login is ipc or user
    percent: 0, // 回放进度条百分比
    playBackObj: null, // 回放页面obj内容
    playBackSavePercent: 0, // 回放点击进度条时存储百分比
    clientP2Ping: 0, // 客户端播放时展示的KB数值
  },
  mutations: {
    SET_PAGE_DOM: (state, pageDom) => {
      state.pageDom = pageDom
    },
    SET_PAGE_OBJ: (state, pageObj) => {
      state.pageObj = pageObj
    },
    SET_PROJECT_NAME: (state, projectName) => {
      state.projectName = projectName
    },
    SET_LOCAL_FLAG: (state, localFlag) => {
      state.localFlag = localFlag
    },
    SET_LOGIN_WAIT_FLAG: (state, loginWaitFlag) => {
      state.loginWaitFlag = loginWaitFlag
    },
    SET_EXPERIENCE_FLAG: (state, experienceFlag) => {
      state.experienceFlag = experienceFlag
    },
    SET_EXPERIENCE_SHOW: (state, experienceShow) => {
      sessionStorage.setItem('experienceShow', experienceShow)
      state.experienceShow = experienceShow
    },
    SET_DOWNLOAD_MANUAL_URL: (state, downloadManualUrl) => {
      state.downloadManualUrl = downloadManualUrl
    },
    SET_PLAY_DOWNLOAD_URL: (state, playDownloadUrl) => {
      state.playDownloadUrl = playDownloadUrl
    },
    SET_BUFFER_PAGE_FLAG: (state, bufferPageFlag) => {
      state.bufferPageFlag = bufferPageFlag
    },
    SET_DEVICE_DATA: (state, deviceData) => {
      state.deviceData = deviceData
    },
    SET_SELECT_DEVICE_IPC: (state, selectDeviceIpc) => {
      state.selectDeviceIpc = selectDeviceIpc
    },
    SET_SELECT_NICK: (state, selectNick) => {
      state.selectNick = selectNick
    },
    SET_FLASH_IS_PLAY: (state, flashIsPlay) => {
      state.flashIsPlay = flashIsPlay
    },
    SET_PLAY_INFO: (state, playInfo) => {
      state.playInfo = playInfo
    },
    SET_WEB_CLIENT_V: (state, webClientV) => {
      state.webClientV = webClientV
    },
    SET_HOSTNAME: (state, hostname) => {
      state.hostname = hostname
    },
    SET_KBWIN: (state, kbwin) => {
      state.kbwin = kbwin
    },
    SET_HISTORYDATA: (state, historyData) => {
      state.historyData = historyData
    },
    SET_SERVER_DEVICE: (state, serverDevice) => {
      state.serverDevice = serverDevice
    },
    SET_NETWORK_ENVIRON: (state, networkEnviron) => {
      state.networkEnviron = networkEnviron
    },
    SET_SYSTEM_WAIT_DIV: (state, systemWaitDiv) => {
      state.systemWaitDiv = systemWaitDiv
    },
    SET_SYSTEM_STOP_WAIT: (state, systemStopWait) => {
      state.systemStopWait = systemStopWait
    },
    SET_BOX_DEVICE_DATA: (state, boxDeviceData) => {
      state.boxDeviceData = boxDeviceData
    },
    SET_LOGIN_STATUS: (state, loginStatus) => {
      state.loginStatus = loginStatus
    },
    SET_PERCENT: (state, percent) => {
      state.percent = percent
    },
    SET_PLAYBACK_OBJ:(state, playBackObj) => {
      state.playBackObj = playBackObj
    },
    SET_PLAYBACK_SAVE_PERCENT: (state, playBackSavePercent) => {
      state.playBackSavePercent = playBackSavePercent
    },
    SET_CLIENT_P2PING: (state, clientP2Ping) => {
      state.clientP2Ping = clientP2Ping
    }
  },
  actions: {
    setPageDom: ({ commit }, pageDom) => commit('SET_PAGE_DOM', pageDom),
    setPageObj: ({ commit }, pageObj) => commit('SET_PAGE_OBJ', pageObj),
    setProjectName: ({ commit }, projectName) => commit('SET_PROJECT_NAME', projectName),
    setLocalFlag: ({ commit }, localFlag) => commit('SET_LOCAL_FLAG', localFlag),
    setLoginWaitFlag: ({ commit }, loginWaitFlag) => commit('SET_LOGIN_WAIT_FLAG', loginWaitFlag),
    setExperienceFlag: ({ commit }, experienceFlag) => commit('SET_EXPERIENCE_FLAG', experienceFlag),
    setExperienceShow: ({ commit }, experienceShow) => commit('SET_EXPERIENCE_SHOW', experienceShow),
    setDownloadManualUrl: ({ commit }, downloadManualUrl) => commit('SET_DOWNLOAD_MANUAL_URL', downloadManualUrl),
    setPlayDownloadUrl: ({ commit }, playDownloadUrl) => commit('SET_PLAY_DOWNLOAD_URL', playDownloadUrl),
    setBufferPageFlag: ({ commit }, bufferPageFlag) => commit('SET_BUFFER_PAGE_FLAG', bufferPageFlag),
    setDeviceData: ({ commit }, deviceData) => {
      if (deviceData) {
        commit('SET_DEVICE_DATA', deviceData)
      }
    },
    setSelectDeviceIpc: ({ commit }, selectDeviceIpc) => commit('SET_SELECT_DEVICE_IPC', selectDeviceIpc),
    setSelectNick: ({ commit }, selectNick) => commit('SET_SELECT_NICK', selectNick),
    setFlashIsPlay: ({ commit }, flashIsPlay) => commit('SET_FLASH_IS_PLAY', flashIsPlay),
    setPlayInfo: ({ commit }, playInfo) => commit('SET_PLAY_INFO', playInfo),
    setWebClientV: ({ commit }, webClientV) => commit('SET_WEB_CLIENT_V', webClientV),
    setHostname: ({ commit }, hostname) => commit('SET_HOSTNAME', hostname),
    setServerDevice: ({ commit }, serverDevice) => commit('SET_SERVER_DEVICE', serverDevice),
    setNetworkEnviron: ({ commit }, networkEnviron) => commit('SET_NETWORK_ENVIRON', networkEnviron),
    setSystemWaitDiv: ({ commit }, systemWaitDiv) => commit('SET_SYSTEM_WAIT_DIV', systemWaitDiv),
    setSystemStopWait: ({ commit }, systemStopWait) => commit('SET_SYSTEM_STOP_WAIT', systemStopWait),
    setKbwin: ({ commit }, kbwin) => commit('SET_KBWIN', kbwin),
    setHistoryData: ({ commit }, historyData) => commit('SET_HISTORYDATA', historyData),
    setBoxDeviceData: ({ commit }, boxDeviceData) => commit('SET_BOX_DEVICE_DATA', boxDeviceData),
    setLoginStatus: ({ commit }, loginStatus) => commit('SET_LOGIN_STATUS', loginStatus),
    setPercent: ({ commit }, percent) => commit('SET_PERCENT', percent),
    setPlayBackObj: ({ commit }, playBackObj) => commit('SET_PLAYBACK_OBJ', playBackObj),
    setPlayBackSavePercent: ({ commit }, playBackSavePercent) => commit('SET_PLAYBACK_SAVE_PERCENT', playBackSavePercent),
    setClientP2Ping: ({ commit }, clientP2Ping) => commit('SET_CLIENT_P2PING', clientP2Ping),
  }
}

export default jumpPageData

function GetQueryString (name) { // 截取url参数函数判断其中是否含有搜索的字符串(目前用于离线模式的判断)
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  let r = window.location.search.substr(1).match(reg);
  if (r !== null) return unescape(r[2]);
  return null;
}

function getProjectName () { // 获取项目名称从域名中截取并存储在session中
  let returnItem
  let url = window.location.href
  // console.log(url, 'vuex_href')
  if (url.indexOf('vimtag') > 1) {
    returnItem = 'vimtag'
  } else if (url.indexOf('mipcm') > 1) {
    returnItem = 'mipcm'
  } else if (url.indexOf('ebitcam') > -1) {
    returnItem = 'ebitcam'
  } else if (url.indexOf('vsmahome') > -1) {
    returnItem = 'vsmahome'
  }
  return returnItem
}