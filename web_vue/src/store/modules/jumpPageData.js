// 跳转页面使用的vuex进行数据存储
const jumpPageData = {
  state: {
    pageDom: '',
    pageObj: {},
    projectName: sessionStorage.getItem('projectName') ? sessionStorage.getItem('projectName') : getProjectName(), // 项目名称获取,考虑后续优化获取方法,并删除相关修改项
    jmLogoFlag: 0,
    localModel: window.location.protocol === "file:" ? 1 : 0,
    loginWaitFlag: 0,
    experienceFlag: 0, // 是否为体验状态
    loginFlag: 0, // 是否登录标识
    downloadManualUrl: '', // vsmahome用户手册下载域名
    playDownloadUrl: '', // 视频播放时会用到该地址
    supportFilterFlag: 0, // 是否支持筛选标识
    supportTreeFlag: 0, // 是否支持树形结构标识
    bufferPageFlag: null, // 遮罩层计时器
    pcOfflineFlag: GetQueryString("pc_is_offline") ? GetQueryString("pc_is_offline") : 0, // 是否为离线模式(没有修改该数据的地方所以不设置mutation以及action)
    localFlag: 0, // 本地模式标识
    deviceData: [], // 全局设备列表内容数据
    autoPlayFlag: 0, // 自动播放标识
    projectFlag: location.href.indexOf('vimtag') > -1 ? 0 : 1, // 项目判断标识(不可修改不添加mutation以及action)
    selectDeviceIpc: '', // 选择中设备sn码
    selectNick: '', // 选中的设备nick
    flashIsPlay: null, // flash自动播放
    playInfo: '', // 播放相关详情
    webClientV: "0.0.0",//版本号
    hostname: "",
    guest: 1, //是否为访客模式
    kbwin: 0, //定义全局变量查看app是否为定制kbwin  5.11.3
    historyData: null, //历史数据
    serverDevice: '', // get_req接口请求回的服务器地址
    boxDeviceData: [],// 定义的全局变量，初始化 ,标记实时播放列表显示,解决修改g_device_data 从云盒子返回设备列表页出错问题
    networkEnviron: '', // 代表内部网络访问或外部网络访问直接连接之间的区别非直接连接
    systemStopWait: null, // 系统停止等待
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
    SET_JM_LOGO_FLAG: (state, jmLogoFlag) => {
      state.jmLogoFlag = jmLogoFlag
    },
    SET_LOCAL_MODEL: (state, localModel) => {
      state.localModel = localModel
    },
    SET_LOGIN_WAIT_FLAG: (state, loginWaitFlag) => {
      state.loginWaitFlag = loginWaitFlag
    },
    SET_EXPERIENCE_FLAG: (state, experienceFlag) => {
      state.experienceFlag = experienceFlag
    },
    SET_LOGIN_FLAG: (state, loginFlag) => {
      state.loginFlag = loginFlag
    },
    SET_DOWNLOAD_MANUAL_URL: (state, downloadManualUrl) => {
      state.downloadManualUrl = downloadManualUrl
    },
    SET_PLAY_DOWNLOAD_URL: (state, playDownloadUrl) => {
      state.playDownloadUrl = playDownloadUrl
    },
    SET_SUPPORT_FILTER_FLAG: (state, supportFilterFlag) => {
      state.supportFilterFlag = supportFilterFlag
    },
    SET_SUPPORT_TREE_FLAG: (state, supportTreeFlag) => {
      state.supportTreeFlag = supportTreeFlag
    },
    SET_BUFFER_PAGE_FLAG: (state, bufferPageFlag) => {
      state.bufferPageFlag = bufferPageFlag
    },
    SET_DEVICE_DATA: (state, deviceData) => {
      state.deviceData = deviceData
    },
    SET_LOCAL_FLAG: (state, localFlag) => {
      state.localFlag = localFlag
    },
    SET_AUTO_PLAY_FLAG: (state, autoPlayFlag) => {
      state.autoPlayFlag = autoPlayFlag
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
    SET_GUEST: (state, guest) => {
      state.guest = guest
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
  },
  actions: {
    setPageDom: ({ commit }, pageDom) => commit('SET_PAGE_DOM', pageDom),
    setPageObj: ({ commit }, pageObj) => commit('SET_PAGE_OBJ', pageObj),
    setProjectName: ({ commit }, projectName) => commit('SET_PROJECT_NAME', projectName),
    setJmLogoFlag: ({ commit }, jmLogoFlag) => commit('SET_JM_LOGO_FLAG', jmLogoFlag),
    setLocalModel: ({ commit }, localModel) => commit('SET_LOCAL_MODEL', localModel),
    setLoginWaitFlag: ({ commit }, loginWaitFlag) => commit('SET_LOGIN_WAIT_FLAG', loginWaitFlag),
    setExperienceFlag: ({ commit }, experienceFlag) => commit('SET_EXPERIENCE_FLAG', experienceFlag),
    setLoginFlag: ({ commit }, loginFlag) => commit('SET_LOGIN_FLAG', loginFlag),
    setDownloadManualUrl: ({ commit }, downloadManualUrl) => commit('SET_DOWNLOAD_MANUAL_URL', downloadManualUrl),
    setPlayDownloadUrl: ({ commit }, playDownloadUrl) => commit('SET_PLAY_DOWNLOAD_URL', playDownloadUrl),
    setSupportFilterFlag: ({ commit }, supportFilterFlag) => commit('SET_SUPPORT_FILTER_FLAG', supportFilterFlag),
    setSupportTreeFlag: ({ commit }, supportTreeFlag) => commit('SET_SUPPORT_TREE_FLAG', supportTreeFlag),
    setBufferPageFlag: ({ commit }, bufferPageFlag) => commit('SET_BUFFER_PAGE_FLAG', bufferPageFlag),
    setDeviceData: ({ commit }, deviceData) => {
      if (deviceData) {
        commit('SET_DEVICE_DATA', deviceData)
      }
    },
    setLocalFlag: ({ commit }, localFlag) => commit('SET_LOCAL_FLAG', localFlag),
    setAutoPlayFlag: ({ commit }, autoPlayFlag) => commit('SET_AUTO_PLAY_FLAG', autoPlayFlag),
    setSelectDeviceIpc: ({ commit }, selectDeviceIpc) => commit('SET_SELECT_DEVICE_IPC', selectDeviceIpc),
    setSelectNick: ({ commit }, selectNick) => commit('SET_SELECT_NICK', selectNick),
    setFlashIsPlay: ({ commit }, flashIsPlay) => commit('SET_FLASH_IS_PLAY', flashIsPlay),
    setPlayInfo: ({ commit }, playInfo) => commit('SET_PLAY_INFO', playInfo),
    setWebClientV: ({ commit }, webClientV) => commit('SET_WEB_CLIENT_V', webClientV),
    setHostname: ({ commit }, hostname) => commit('SET_HOSTNAME', hostname),
    setGuest: ({ commit }, guest) => commit('SET_GUEST', guest),
    setServerDevice: ({ commit }, serverDevice) => commit('SET_SERVER_DEVICE', serverDevice),
    setNetworkEnviron: ({ commit }, networkEnviron) => commit('SET_NETWORK_ENVIRON', networkEnviron),
    setSystemWaitDiv: ({ commit }, systemWaitDiv) => commit('SET_SYSTEM_WAIT_DIV', systemWaitDiv),
    setSystemStopWait: ({ commit }, systemStopWait) => commit('SET_SYSTEM_STOP_WAIT', systemStopWait),
    setKbwin: ({ commit }, kbwin) => commit('SET_KBWIN', kbwin),
    setHistoryData: ({ commit }, historyData) => commit('SET_HISTORYDATA', historyData),
    setBoxDeviceData: ({ commit }, boxDeviceData) => commit('SET_BOX_DEVICE_DATA', boxDeviceData)
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
  console.log(url, 'vuex_href')
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