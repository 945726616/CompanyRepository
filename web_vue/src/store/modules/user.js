// 存储用户信息vuex
let userSession = JSON.parse(sessionStorage.getItem('user_info'))
let localLanguage = localStorage.getItem('language_choice_info'); 
let chromeLang = (navigator.language || navigator.userLanguage).substr(0, 2) //浏览器语言
if (chromeLang === 'zh') {
  let originalLang = navigator.language || navigator.userLanguage
  if (originalLang === 'zh-TW') {
    chromeLang = 'tw'
  }
}
if (!userSession) {
  let userObj = {}
  sessionStorage.setItem('user_info', JSON.stringify(userObj))
}
const user = {
  state: {
    name: userSession && userSession.setName ? userSession.setName : '', // 用户名
    password: '', // 密码
    tid: userSession && userSession.setTid ? userSession.setTid : 0, // dh获取的相关加密验证id
    lid: userSession && userSession.setLid ? userSession.setLid : 0,
    sid: userSession && userSession.setSid ? userSession.setSid : 0,
    seq: userSession && userSession.setSeq ? userSession.setSeq : 0,
    shareKey: userSession && userSession.setShareKey ? userSession.setShareKey : '',
    secretKey: '', // dh校验使用的私钥
    mmqFlag: 0, // mmq是否创建标志
    mmqPickTimeFlag1: null, // mmq轮询回调计时器1标识
    mmqPickTimeFlag2: null, // mmq轮询回调计时器2标识
    qid: userSession && userSession.setQid ? userSession.setQid : '', // 存储qid用于请求中
    userLanguage: userSession && userSession.setUserLanguage ? userSession.setUserLanguage : localLanguage ? localLanguage : chromeLang, // 用户语言
    jmLogoFlag: userSession && userSession.setJmLogoFlag ? userSession.setJmLogoFlag : 0, // 江门帐号logo图标标识
    supportTreeFlag: userSession && userSession.setSupportTreeFlag ? userSession.setSupportTreeFlag : 0, // 是否支持树形结构标识
    supportFilterFlag: userSession && userSession.setSupportFilterFlag ? userSession.setSupportFilterFlag : 0, // 是否支持筛选标识
    autoPlayFlag: 0, // 自动播放标识(存储在localStorage中)
    loginFlag: userSession && userSession.setLoginFlag ? userSession.setLoginFlag : 0, // 是否登录标识
    guest: userSession && userSession.setGuest == 0? userSession.setGuest : 1, //是否为访客模式
  },

  mutations: {
    SET_NAME: (state, name) => {
      state.name = name
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setName = name
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_PASSWORD: (state, password) => {
      state.password = password
    },
    SET_TID: (state, tid) => {
      state.tid = tid
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setTid = tid
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_LID: (state, lid) => {
      state.lid = lid
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setLid = lid
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_SHARE_KEY: (state, shareKey) => {
      state.shareKey = shareKey
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setShareKey = shareKey
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_SEQ: (state, seq) => {
      state.seq = seq
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setSeq = seq
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_SID: (state, sid) => {
      state.sid = sid
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setSid = sid
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_SECRET_KEY: (state, secretKey) => {
      state.secretKey = secretKey
    },
    SET_MMQ_FLAG: (state, mmqFlag) => {
      state.mmqFlag = mmqFlag
    },
    SET_QID: (state, qid) => {
      state.qid = qid
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setQid = qid
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_MMQ_PICK_TIME_FLAG_1: (state, mmqPickTimeFlag1) => {
      state.mmqPickTimeFlag1 = mmqPickTimeFlag1
    },
    SET_MMQ_PICK_TIME_FLAG_2: (state, mmqPickTimeFlag2) => {
      state.mmqPickTimeFlag2 = mmqPickTimeFlag2
    },
    SET_USER_LANGUAGE: (state, userLanguage) => {
      state.userLanguage = userLanguage
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setUserLanguage = userLanguage
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
      localStorage.setItem("language_choice_info",userLanguage)
    },
    SET_JM_LOGO_FLAG: (state, jmLogoFlag) => {
      state.jmLogoFlag = jmLogoFlag
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setJmLogoFlag = jmLogoFlag
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_SUPPORT_TREE_FLAG: (state, supportTreeFlag) => {
      state.supportTreeFlag = supportTreeFlag
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setSupportTreeFlag = supportTreeFlag
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_SUPPORT_FILTER_FLAG: (state, supportFilterFlag) => {
      state.supportFilterFlag = supportFilterFlag
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setSupportFilterFlag = supportFilterFlag
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_AUTO_PLAY_FLAG: (state, autoPlayFlag) => {
      state.autoPlayFlag = autoPlayFlag
    },
    SET_LOGIN_FLAG: (state, loginFlag) => {
      state.loginFlag = loginFlag
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setLoginFlag = loginFlag
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
    SET_GUEST: (state, guest) => {
      state.guest = guest
      let userInfo = JSON.parse(sessionStorage.getItem('user_info'))
      userInfo.setGuest = guest
      sessionStorage.setItem('user_info',JSON.stringify(userInfo))
    },
  },

  actions: {
    setName: ({commit}, name) => commit('SET_NAME', name),
    setPassword: ({commit}, password) => commit('SET_PASSWORD', password),
    setTid: ({commit}, tid) => commit('SET_TID', tid),
    setLid: ({commit}, lid) => commit('SET_LID', lid),
    setShareKey: ({commit}, shareKey) => commit('SET_SHARE_KEY', shareKey),
    setSeq: ({commit}, seq) => commit('SET_SEQ', seq),
    setSid: ({commit}, sid) => commit('SET_SID', sid),
    setSecretKey: ({commit}, secretKey) => commit('SET_SECRET_KEY', secretKey),
    setMmqFlag: ({commit}, mmqFlag) => commit('SET_MMQ_FLAG', mmqFlag),
    setQid: ({commit}, qid) => commit('SET_QID', qid),
    setMmqPickTimeFlag1: ({commit}, mmqPickTimeFlag1) => commit('SET_MMQ_PICK_TIME_FLAG_1', mmqPickTimeFlag1),
    setMmqPickTimeFlag2: ({commit}, mmqPickTimeFlag2) => commit('SET_MMQ_PICK_TIME_FLAG_2', mmqPickTimeFlag2),
    setUserLanguage: ({commit}, userLanguage) => commit('SET_USER_LANGUAGE', userLanguage),
    setJmLogoFlag: ({ commit }, jmLogoFlag) => commit('SET_JM_LOGO_FLAG', jmLogoFlag),
    setSupportTreeFlag: ({ commit }, supportTreeFlag) => commit('SET_SUPPORT_TREE_FLAG', supportTreeFlag),
    setSupportFilterFlag: ({ commit }, supportFilterFlag) => commit('SET_SUPPORT_FILTER_FLAG', supportFilterFlag),
    setAutoPlayFlag: ({ commit }, autoPlayFlag) => commit('SET_AUTO_PLAY_FLAG', autoPlayFlag),
    setLoginFlag: ({ commit }, loginFlag) => commit('SET_LOGIN_FLAG', loginFlag),
    setGuest: ({ commit }, guest) => commit('SET_GUEST', guest),
  }
}

export default user
