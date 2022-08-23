<template>
  <!-- 入口文件 -->
  <div id="app" @contextmenu="handleMouse">
    <div id="project_color" :class="projectClass"></div>
    <div id="tip_div"></div>
    <div id="buffer_page">
      <div id="buffer_image"></div>
    </div>
    <div id="delete_tips"></div>
    <div id='add_device_page'></div>
    <topBar />
    <!-- 调用路由部分进行渲染 -->
    <router-view />
  </div>
</template>

<script>
import TopBar from './components/top/top'
export default {
  name: "App",
  components: { // 组件注册
    topBar: TopBar
  },
  data () {
    return {
      projectClass: this.$store.state.jumpPageData.projectName
    }
  },
  methods: {
    jumpToDevlist () { // 请求超时点击可跳转回设备列表页面
      this.publicFunc.closeBufferPage()
      this.$router.push('/devlist')
    },
    handleMouse(e) { // 禁用鼠标右键点击
      e.preventDefault();
    },
  },
  async mounted () {
    import(`@/lib/plugins/jquery.mousewheel.min.js`)
    let userLanguage = localStorage.getItem('language_choice_info') ? localStorage.getItem('language_choice_info') : this.$store.state.user.userLanguage
    await this.$chooseLanguage.lang(userLanguage)
    this.$api.login.dev_msg_listener_add()
  },
  destroyed () {
    if (this.$store.state.user.setMmqPickTimeFlag1) {
      clearInterval(this.$store.state.user.setMmqPickTimeFlag1)
    }
    if (this.$store.state.user.setMmqPickTimeFlag2) {
      clearInterval(this.$store.state.user.setMmqPickTimeFlag2)
    }
    sessionStorage.removeItem('user_info')
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
#project_color {
  color: #00a6ba;
  display: none;
}
</style>