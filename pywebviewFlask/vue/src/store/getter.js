// 所有vuex文件中暴露出的getter参数

const getters = {
  name: state => state.user.name,
  password: state => state.user.password,
  loginWaitFlag: state => state.jumpPageData.loginWaitFlag
}
export default getters