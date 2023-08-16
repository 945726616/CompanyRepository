<template>
  <div id="top"></div>
</template>
<script>
import md5 from '@/util/mmd5.js'
export default {
  methods: {
    create_top (obj) {
      let _this = this
      if (window.location.href.indexOf('vimtag') > -1) {
        // vimtag结构
        obj.parent.html(
          "<div id='top_box'>" +
          "<div id='top_box_main'>" +
          "<div id='top_box_left'>" +
          "<a target='_top'><div id='top_logo'></div></a>" +
          '</div>' +
          "<div id='top_box_right'>" +
          "<div id='bottom_select_lang'></div>" +
          "<div id='select_lang_box'>" +
          "<div class='select_lang' value='ar'>العربية</div>" +
          "<div class='select_lang' value='en'>English</div>" +
          "<div class='select_lang' value='es'>española</div>" +
          "<div class='select_lang' value='fr'>française</div>" +
          "<div class='select_lang' value='de'>Deutsch</div>" +
          "<div class='select_lang' value='it'>italiana</div>" +
          "<div class='select_lang' value='ja'>日本語</div>" +
          "<div class='select_lang' value='ko'>한국의</div>" +
          "<div class='select_lang' value='pt'>português</div>" +
          "<div class='select_lang' value='ru'>русский</div>" +
          "<div class='select_lang' value='zh'>中文(简体)</div>" +
          "<div class='select_lang' value='tw'>中文(繁体)</div>" +
          "<div class='select_lang' value='hu'>magyar</div>" +
          "<div class='select_lang' value='nl'>Nederlands</div>" +
          "<div class='select_lang' value='sk'>slovenského jazyk</div>" +
          "<div class='select_lang' value='tr'>Türk dili</div>" +
          "<div class='select_lang' value='cz'>Česky</div>" +
          "<div class='select_lang' value='vi'>Người việt nam</div>" +
          "<div class='select_lang' value='iw'>עברית</div>" +
          "<div class='select_lang' value='pl'>Polski</div>" +
          "<div class='select_lang' value='uk'>Українська мова</div>" + //乌克兰语
          "<div class='select_lang' value='th'>ภาษาไทย</div>" + //泰国语
          '</div>' +
          "<div id='top_menu_my' class='top_right_menu'></div>" +
          "<div id='top_login_div'><span id='top_login_span'>" +
          mcs_my_device +
          '</span></div>' +
          "<div id='top_experience_div' class='top_right_menu'>" +
          mcs_demo +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>'
        )
      } else {
        // mipc结构
        obj.parent.html(
          "<div id='menu_box' class='menu_box'>" +
          "<div id='menu_box_main'>" +
          "<div id='mipc_logo_img'></div>" +
          "<div id='menu_more' class='menu_top_li'>" +
          "<div id='menu_more_img' class='menu_img'></div>" +
          "<div id='menu_more_txt' class='menu_txt'>" +
          mcs_more_options +
          '</div>' +
          '</div>' +
          "<div id='menu_download' class='menu_top_li'>" +
          "<div id='menu_download_img' class='menu_img'></div>" +
          "<div id='menu_download_txt' class='menu_txt'>" +
          mcs_download +
          '</div>' +
          '</div>' +
          '</div>' +
          "<div id='set_back'><div id='mipcBack'><div id='main_title_box_return_img'></div>" +
          mcs_back +
          '</div></div>' +
          '</div>'
        )
        if (window.fujikam === 'fujikam') {
          let mipc_appparam_url = location.href
          if (_this.GetUrlParam_kb('kbwin', mipc_appparam_url)) {
            _this.$store.dispatch('setKbwin', _this.GetUrlParam_kb('kbwin', mipc_appparam_url) ? _this.GetUrlParam_kb('kbwin', mipc_appparam_url) : 0)
          }
        }
        if (_this.$store.state.jumpPageData.kbwin === 1) {
          $('#mipc_logo_img').attr('class', 'kbwin_logo_img')
          $('#menu_download').hide()
        }

        $('#menu_download').on('click', function () {
          // console.log(this)
          $('#menu_more').attr('class', 'menu_top_li')
          $('#menu_download').attr('class', 'menu_top_li_active')
          // createPage('download', { parent: $('#page') })
          _this.$router.push({name:'download',params:{parent: $('#page')}});
        })
        $('#menu_more').on('click', function () {
          $('#menu_download').attr('class', 'menu_top_li')
          $('#menu_more').attr('class', 'menu_top_li_active')
          // createPage('my', { parent: $('#page') })
          _this.$router.push({name:'my',params:{parent: $('#page')}});
        })
        $('#mipc_logo_img').on('click', function () {
          $('#menu_more').attr('class', 'menu_top_li')
          $('#menu_download').attr('class', 'menu_top_li')
          if (_this.$store.state.user.loginFlag) {
            // createPage('devlist', { parent: $('#page') })
            _this.$router.push({name:'devlist',params:{parent: $('#page')}});
          } else if (_this.$store.state.jumpPageData.experienceFlag) {
            // createPage('devlist', { parent: $('#page') })
            _this.$router.push({name:'devlist',params:{parent: $('#page')}});
          } else {
            _this.$store.dispatch('setLoginWaitFlag', 0)
            // createPage('login', { parent: $('#page') })
            _this.$router.push({name:'login',params:{parent: $('#page')}});
          }
        })
      }
      // _this.publicFunc.mx("#top_login_div").setAttribute("style","border:none;height:100%;line-height:62px;margin-top:0;padding:0 10px;");
      if (_this.$store.state.user.jmLogoFlag === 1) { // vimtag江门专属logo
        $('#top_logo').children()[0].setAttribute('src', '../../asset/device/m_logo.png')
        $('#top_logo').children()[0].width = '220'
        $('#top_logo').children()[0].height = '36'
      }
      let username_value = mcs_my // 定义用户名
      // console.log(_this.publicFunc.urlParam(), 'url')
      if (_this.$store.state.jumpPageData.localFlag) { // 判断是否为本地离线模式
        _this.$store.state.user.loginFlag = _this.publicFunc.urlParam() && _this.publicFunc.urlParam().c == 1 ? 1 : 0
        l_remember_data = sessionStorage.get('remember_msg_info')
        l_remember_data = eval('(' + l_remember_data + ')')
        if (_this.$store.state.user.loginFlag) {
          username_value = l_remember_data.user
          l_pwd_val = l_remember_data.password
        }
      }
      // 个人中心填写用户名
      $('#top_menu_my').html(username_value)
      $('#top_box_left').on('click', function () {
        // 左上角logo图标点击事件
        if (window.fujikam == 'fujikam') {
          // 如果是客户端则屏蔽跳转功能
          return false
        }
        location.href = 'https://www.vimtag.com/'
      })

      if (window.fujikam == 'fujikam') {
        if (!_this.$store.state.jumpPageData.projectFlag) {
          // vimtag顶部导航专属样式添加
          $('#top').attr('style', 'width:100%;height:81px;')
        }
        $('#top_box').attr('style', 'height:81px;line-height:81px')
        $('#top_box_main').attr('style', 'width:90%')
        $('#top_experience_div').attr('style', 'line-height:81px')
        $('#top_login_div').attr('style', 'line-height:81px')
        $('#bottom_select_lang').attr('style', 'line-height:81px')
        $('#top_menu_my').attr('style', 'line-height:81px')
        $('#select_lang_btn').attr('style', 'height:360px') // 用于修复在客户端滚轮轻微滚动,语言选择条移动距离过大的问题
        $('.top_list_menu').hide()
      }
      if (window.location.host.indexOf('www') === -1) {
        $('#top_menu_about').hide()
      }
      $('#top_menu_my').click(function () {
        // 点击个人中心
        if (_this.publicFunc.urlParam().l == 'local') {
          _this.$store.dispatch('setLocalFlag', 1)
        }
        if (_this.$store.state.jumpPageData.localFlag) {
          _this.$store.state.user.loginFlag = _this.publicFunc.urlParam() && _this.publicFunc.urlParam().c == 1 ? 1 : 0
        }
        if(_this.$route.path != '/my'){
          _this.$router.push({name:'my'})
        }else{
          vimtagMyPage({ parent: $('#my') })
        }
        // createPage('my', { parent: $('#page') })
      })

      $('#top_login_div').click(function () {
        if (_this.$store.state.jumpPageData.localFlag) {
          //如果点击了本地搜索
          _this.$store.state.user.loginFlag = _this.publicFunc.urlParam() && _this.publicFunc.urlParam().c == 1 ? 1 : 0
          if (_this.$store.state.user.loginFlag) {
            //已经登录了	点击我的设备无效
            // console.log('登录状态点击我的设备')
            _this.$store.dispatch('setLocalFlag', 0)
            // console.log(location.href)  // http://45.113.201.4:7080/dcm/http_v10.1.4.1911140933/device/v10.1.4.1911140…main.product.htm?v10.1.4.19111409331&m=test.vimtag.com&ta=&tp=&l=local&c=1
            // console.log(location.href.split("&"), '切割后的数组')
            if (window.fujikam === 'fujikam') {
              // 根据是否是客户端进行两种不同的截取方式 客户端多一个版本号的参数
              // console.log("客户端下的链接")
              location.href =
                location.href.split('&')[0] + '&' + location.href.split('&')[1] // 将切割后第部分进行拼接保证链接正确
              // console.log(location.href, "客户端内部")
            } else {
              location.href = location.href.split('&')[0]
              // console.log(location.href, "浏览器部分")
            }
            // createPage('devlist', { parent: $('#page') })
            _this.$router.push({name:'devlist',params:{parent: $('#page')}});
          } else {
            //没有登录点击我的设备 跳转到登录页面
            // console.log("_this.$store.state.user.loginFlag === 0")
            location.href = location.href.replace('&l=local&c=0', '')
          }
        } else {
          //没有点击本地搜索
          if (_this.$store.state.jumpPageData.experienceFlag === 1) {
            // g_experience为体验权限 0非体验 1体验
            // createPage('login', { parent: $('#page') })
            _this.$router.push({name:'login',params:{parent: $('#page')}});
          } else {
            _this.$store.dispatch('setExperienceFlag', 0)
            if (_this.$store.state.user.loginFlag) {
              //已经登录，直接到设备列表页面
              // console.log('点击了设备列表按钮')
              // createPage('devlist', { parent: $('#page') })
              _this.$router.push({name:'devlist',params:{parent: $('#page')}});
            } else {
              //没有登录，跳转到登录页面
              // createPage('login', { parent: $('#page') })
              _this.$router.push({name:'login',params:{parent: $('#page')}});
            }
          }
        }
      })

      $('#top_experience_div').click(function () {
        //点击体验
        let username = _this.publicFunc.urlParam().ta ? _this.publicFunc.urlParam().ta : 'vimtag';
        let password = _this.publicFunc.urlParam().tp ? _this.publicFunc.urlParam().tp : 'vimtag';
        _this.$api.login.sign_in({
          user: username, // 用户名
          password: md5.hex(password) // 密码
        }).then(res => { // 登录回调处理
          console.log(res, 'res')
          // 跳转至设备列表页面
          // _this.$store.state.jumpPageData.experienceFlag = 1
          _this.$router.push({name:'devlist',params:{parent: $('#page')}});
          // createPage('devlist', { parent: $('#page') })
        })
      })
      select_lang()
      function select_lang () {
        let l_select_lang = document.getElementsByClassName('select_lang')
        let language_choice_info = _this.$store.state.user.userLanguage
        let l_lang = language_choice_info ? language_choice_info : 'en'

        for (let l = 0; l < l_select_lang.length; l++) {
          // console.log(l_select_lang[l].getAttribute('value'), 'lang_val')
          if (l_select_lang[l].getAttribute('value') === l_lang) {
            $('#bottom_select_lang').html(l_select_lang[l].innerHTML)
          }
        }
        $('#bottom_select_lang').click(function () {
          let is_show = $('#select_lang_box').css('display')
          if (is_show === 'none') {
            let top = this.offsetTop + 52
            let left = this.offsetLeft
            $('#select_lang_box').css({
              top: top + 'px',
              left: left + 'px'
            })
            $('#select_lang_box').show()
          } else {
            $('#select_lang_box').hide()
          }

          // $("#top_box_right").mouseleave(function(event) {
          $('#top_box_right').mouseleave(function () {
            $('#select_lang_box').hide()
          })
        })

        $('.select_lang').click(function () {
          let val = $(this).attr('value')
          localStorage.setItem('language_choice_info', val)
          location.reload()
        })
      }

      // let pc_is_offline = GetQueryString('pc_is_offline')
      function GetQueryString (name) {
        // 截取url参数函数
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
        let r = window.location.search.substr(1).match(reg)
        if (r != null) return unescape(r[2])
        return null
      }

      // if (pc_is_offline == 1) {
      //   // createPage('devlist', { parent: $('#page') })
      //   _this.$router.push({name:'devlist',params:{parent: $('#page')}})
      // }
      // 截取url登录相关参数
      let exp_username = _this.publicFunc.urlParam().user ? _this.publicFunc.urlParam().user : '' // 用户名
      let exp_password = _this.publicFunc.urlParam().pw ? _this.publicFunc.urlParam().pw : '' // 密码
      if (exp_username) {
        // 调用登录接口
        this.$api.login.sign_in({
          user: exp_username, // 用户名
          password: md5.hex(exp_password) // 密码
        }).then(res => { // 登录回调处理
          console.log(res, 'res')
          // 跳转至设备列表页面
        })
      }
    },
    // 暂时不清楚kbwin是那个具体项目暂时简单搬迁
    GetUrlParam_kb (paraName, url) {
      let arrObj = url.split('?')
      if (arrObj.length > 1) {
        let arrPara = arrObj[1].split('&')
        let arr
        for (let i = 0; i < arrPara.length; i++) {
          arr = arrPara[i].split('=')
          if (arr != null && arr[0] == paraName) {
            return arr[1]
          }
        }
        return ''
      } else {
        return ''
      }
    }
  },
  mounted () {
    this.$nextTick(async () => {
      // 强制重新引入多国语言 main.js中的引用无法确保在调用top时能够全局使用
      await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
      if (!this.$store.state.jumpPageData.projectFlag) { 
        $("#top_experience_div").css("display","none");
      }
      await this.create_top({ parent: $('#top') })
      // await this.publicFunc.importCss('Public.scss')
    })
  }
}
</script>