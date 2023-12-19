<template>
  <div id="login">
  </div>
</template>

<style lang="scss">
// @import url(./index.scss); (暂时注释后续分离样式后放开)
#login {
  height: calc(100% - 62px);
}
</style>

<script>
import languageSelect from '../../lib/exportModule/languageSelect.js'
import md5 from '@/util/mmd5.js'
import mme from '@/util/mme.js'
export default {
  data () {
    return {
      appid: 'vimtag.com', // location.origin.split('www.')[1] // 获取项目地址vimtag.com/mipcm.com
      name: 'vimtag' // appid.split('.')[0] // 获取项目名 vimtag/mipcm
    }
  },
  methods: {
    create_login_page (obj) {
      // 创建登录页面dom结构
      // 暂存全局obj变量
      // g_obj_login = obj
      let _this = this // jq代码报错全局this指向(后续会有部分选择器内操作代码会导致this指向错误需要用_this进行保留,同时data中定义的变量也需要使用_this,暂且这样后续使用vueDom时修复)
      let l_password_value // 暂定义局部记住密码时获取到的存储的密码
      let l_pwd_val // 函数内接口使用的密码值
      obj.parent.html(
        "<div id='login_page'>" +
        "<div id='login_box'>" +
        "<div id='vimtag_signin_inner'>" +
        "<div id='signin_logo_vimtag'></div>" +
        "<div id='sigin_in_username' class='input_div'>" +
        "<div class='vimtag_login_user'></div>" +
        "<input id='signin_name' class='input_username' value='" +
        mcs_username +
        "'>" + // 登录时用户名
        "<div class='vimtag_login_input'></div>" +
        '</div>' +
        "<div id='register_username' class='input_div'>" +
        "<div class='vimtag_login_user'></div>" +
        "<input id='register_signin_name' class='input_username' value='" +
        mcs_input_username +
        "'>" + // 注册时填写用户名
        "<div class='vimtag_login_input'></div>" +
        '</div>' +
        "<div id='sigin_in_password' class='input_div'>" +
        "<div class='vimtag_password_img'></div>" +
        "<input id='signin_pw' class='input_password' type='text' value='" +
        mcs_password +
        "'>" + // 登录时密码
        "<div id='password_eye' class='password_eye_gray'></div>" +
        "<div class='vimtag_login_input'></div>" +
        '</div>' +
        "<div id='register_account_pwd' class='input_div'>" +
        "<div class='vimtag_password_img'></div>" +
        "<input id='register_signin_pw' class='input_password' type='text' value='" +
        mcs_input_password +
        "'>" + // 注册时填写密码
        "<div id='register_password_eye' class='password_eye_gray'></div>" +
        "<div class='vimtag_login_input'></div>" +
        '</div>' +
        "<div id='register_account_pwd_again' class='input_div'>" +
        "<div class='vimtag_password_img'></div>" +
        "<input id='register_signin_pw_again' class='input_password' type='text' value='" +
        mcs_confirm_password +
        "'>" + // 注册时填写确认密码
        "<div id='register_password_eye_again' class='password_eye_gray'></div>" +
        "<div class='vimtag_login_input'></div>" +
        '</div>' +
        "<div id='keep_sign_in'>" +
        "<input id='keep_sign_in_check' type='checkbox'><span>" +
        mcs_remember_password +
        '</span>' + // 记住密码选框
        '</div>' +
        "<button class='vimtag_btn' id='sign_in'>" +
        mcs_sign_in +
        '</button>' + // 登录页面中登录按钮
        "<button class='vimtag_btn' id='register_btn'>" +
        mcs_sign_up +
        '</button>' + // 注册页面中注册按钮
        '<div>' +
        "<span id='register_account'>" +
        mcs_sign_up +
        '</span>' + // 登录页面中注册文字按钮
        "<span id='forget_pass'>" +
        mcs_forgot_your_password +
        '?</span>' + // 登录页面中忘记密码文字按钮
        "<span id='sign_account'>" +
        mcs_sign_in +
        '</span>' + // 注册页面中登录文字按钮
        '</div>' +
        '</div>' +
        "<div id='forget_pass_inner_main'>" + // 忘记密码点击弹窗渲染节点
        '</div>' +
        '</div>' +
        '</div>'
      )
      // 默认展示登录页面的节点
      $('#keep_sign_in').show()
      $('#register_username').hide()
      $('#register_account_pwd').hide()
      $('#register_account_pwd_again').hide()
      $('#register_btn').hide()
      $('#sign_account').hide()
      let bt, aaa, username

      if(window.location.href.indexOf('vimtag')>-1){
        _this.name = 'vimtag';
      }else if(window.location.href.indexOf('ebitcam')>-1){
        _this.name = 'ebit';
      }else if(window.location.href.indexOf('mipcm')>-1){
        _this.name = 'mipc';
      }else{
        _this.name = 'vsmahome';
      }

      if (localStorage.getItem('remember_msg_info')) {
        // mlocal_storage参见\web\lib\mlib.core.localstorage.js
        bt = localStorage.getItem('remember_msg_info')
        aaa = eval('(' + bt + ')') // aaa为remember_msg_info字符串方法的结果
        username = aaa.user
      }
      if (!localStorage.getItem('keep_pw')) { // 本地加密存储帐号密码 改变自动登录状态
        if (username) {
          localStorage.setItem('remember_msg_info', JSON.stringify({ user: username }))
        }
      }

      let l_remember_data = localStorage.getItem('remember_msg_info') // 从存储空间中取出账户名和密码并填写渲染在页面中
      let l_remember_data_obj = l_remember_data ? eval('(' + l_remember_data + ')') : null
      if (l_remember_data_obj && l_remember_data_obj.user) {
        $('#signin_name').val(l_remember_data_obj.user)
        $('#signin_name').attr('style', 'color: #404040')
      }
      if (l_remember_data_obj && l_remember_data_obj.password) {
        $('#signin_pw').val('••••••')
        l_password_value = l_remember_data_obj.password
        $('#signin_pw').css('color', '#404040')
      }
      if($('#signin_pw').val() == "••••••"){
        $('#password_eye').css('display', 'none')
      }
      $('#signin_pw').on("input",function(){
        if($('#signin_pw').val().indexOf("•") == -1){
          $('#password_eye').css('display', 'block');
        }else{
          $('#password_eye').css('display', 'none');
        }
      })
      if (localStorage.getItem('keep_pw')) { // 存储中保持登录状态被选中
        // JSON.parse(localStorage.getItem('keep_pw'))
        // console.log('记住密码')
        $('#keep_sign_in_check').attr('checked', 'true') // 页面中添加被选中效果
      }
      $('#forget_pass').click(function () { // 忘记密码渲染dom
        let dom_forget_pass =
          "<div id='forget_pass_inner'>" +
          "<div id='binding_account_cancel_btn'>&times </div>" +
          "<div style='margin-top:50px;' id='input_account_page'>" +
          "<div style='font-size:20px; color:#323232;'>" +
          mcs_forgot_your_password +
          '</div>' + // 忘记密码 (弹框title)
          "<div style='font-size:14px; color:#646464; margin-top:40px; margin-bottom:20px;'>" +
          mcs_valid_user_name +
          '</div>' + // 第一步：请输入有效用户名
          "<div style='margin-bottom:20px;'>" +
          "<input class='standard_inputs_normal' id='binding_account_name' type='text' style='width:230px; float:none;' value='" +
          mcs_please_input_username +
          "'>" + // 请输入用户名
          "<input class='standard_inputs_normal' id='binding_account' type='text' style='display:none; color:#404040; width:230px; float:none;'>" +
          '</div>' +
          "<div style='width:235px; margin:auto;'>" + // 下一步按钮
          "<input id='binding_account_next_btn' style='width:100%; line-height:34px; height:34px;' type='button' class='vimtag_button_right' value='" +
          mcs_action_next +
          "'>" +
          '</div>' +
          '</div>' +
          "<div style='margin-top:50px; display:none; color:#00a6ba; font-size:14px;' id='input_email_page'>" +
          "<div style='font-size:20px; color:#323232;'>" +
          mcs_forgot_your_password +
          '</div>' + // 忘记密码 (弹框title)
          "<div style='font-size:14px; color:#646464; margin-top:40px; margin-bottom:10px;'>" +
          mcs_binding_mailbox +
          '</div>' + // 第二步：请输入绑定的邮箱
          "<div id='email_warn' style='display:none; margin-bottom:10px;'>" +
          '<span>' +
          mcs_prompt +
          ": </span><span id='binding_account_email'></span>" + // 提示: 绑定的邮箱隐去中间部分
          '</div>' +
          "<div style='margin-bottom:10px;'>" +
          "<input class='standard_inputs_normal' id='recovery_pass_email_addr' type='text' style='width:230px; float:none;' value='" +
          mcs_input_email_addr +
          "'>" + // 邮箱输入框部分
          "<input class='standard_inputs_normal' id='recovery_pass_email' type='text' style='display:none; color:#404040; width:230px; float:none;'>" +
          '</div>' +
          "<div style='width:235px; margin:auto; margin-top:10px;'>" +
          "<input id='recovery_pass_ok_btn' style='width:100%; line-height:34px; height:34px;' type='button' class='vimtag_button_left' value='" +
          mcs_ok +
          "'>" + // 确定按钮
          "<input id='recovery_pass_cancel_btn' style='display:none;' type='button' class='vimtag_button_right' value='" +
          mcs_cancel +
          "'>" + // 取消按钮
          '</div>' +
          '</div>' +
          "<div style='margin-top:50px; display:none; color:#00a6ba; font-size:14px;' id='forget_password_page'>" +
          "<div style='font-size:20px; color:#323232;'>" +
          mcs_forgot_your_password +
          '</div>' + // 忘记密码 (弹框title)
          "<div style='margin-bottom:10px; margin:0 auto; margin-top:60px; font-size:14px; color:#323232; width:335px;' id='retrieve_password_warn'></div>" +
          "<div style='width:235px; margin:auto; margin-top:20px; '>" + // 提示内容
          "<input id='forget_password_close_btn' style='width:100%; line-height:34px; height:34px; background-color:#00a6ba;' type='button' class='vimtag_button_left' value='" +
          mcs_ok +
          "'>" + // 确定按钮
          '</div>' +
          '</div>' +
          '</div>'
        // 在登录页面中插入忘记密码弹窗dom
        $('#forget_pass_inner_main').html(dom_forget_pass)
        // dom绑定局部元素
        let l_username_value = $('#signin_name').val().trim() // 获取用户名 去除空格
        if (l_username_value && l_username_value !== mcs_username) {
          $('#binding_account_name').css('display', 'none')
          $('#binding_account').css('display', 'inline')
          $('#binding_account').val(l_username_value)
        }

        $('#binding_account_name').focus(function () { // 当焦点在用户名输入框时,隐藏展示的input 显示隐藏的input框
          $('#binding_account_name').css('display', 'none')
          $('#binding_account').css('display', 'inline')
          $('#binding_account').focus()
        })
        $('#binding_account').focus(function () { // 触发select事件
          $('#binding_account').select()
        })
        $('#binding_account').blur(function () { // 焦点离开时事件操作
          if ($('#binding_account').val() === '') { // 未输入任何值时隐藏输入框显示默认展示框
            $('#binding_account').css('display', 'none')
            $('#binding_account_name').css('display', 'inline')
          }
        })
        $('#recovery_pass_email_addr').focus(function () { // 邮箱验证框
          $('#recovery_pass_email_addr').css('display', 'none')
          $('#recovery_pass_email').css('display', 'inline')
          $('#recovery_pass_email').focus()
        })
        $('#recovery_pass_email').focus(function () {
          $('#recovery_pass_email').select()
        })
        $('#recovery_pass_email').blur(function () { // 焦点离开邮箱验证
          if ($('#recovery_pass_email').val() === '') {
            $('#recovery_pass_email').css('display', 'none')
            $('#recovery_pass_email_addr').css('display', 'inline')
          }
        })
        $('#binding_account_next_btn').click(function () { // 点击下一步按钮
          if (!$('#binding_account').val()) { // 未输入任何值弹出报错信息
            _this.publicFunc.msg_tips({
              msg: mcs_the_user_name_is_empty,
              type: 'error',
              timeout: 3000
            })
            return
          }
          // 调用绑定邮箱接口
          _this.$api.login.binding_email_get({
            username: $('#binding_account').val(),
            appid: _this.appid
          }).then(res => {
            //console.log(res, 'binding_email_get')
            binding_accounts_info_ack(res)
            function binding_accounts_info_ack (msg) {
              // 用户名验证回调函数
              if (msg.data.result) {
                if (msg.result === 'accounts.user.unknown') {
                  _this.publicFunc.msg_tips({
                    msg: mcs_username_does_not_exis,
                    type: 'error',
                    timeout: 3000
                  })
                } else {
                  _this.publicFunc.msg_tips({
                    msg: msg.data.result,
                    type: 'error',
                    timeout: 3000
                  })
                }
              } else {
                if (msg.data.email) {
                  // 用户绑定邮箱
                  $('#input_account_page').css('display', 'none')
                  $('#input_email_page').css('display', 'block')
                  $('#email_warn').css('display', 'block')
                  $('#binding_account_email').html(msg.data.email)
                } else {
                  _this.publicFunc.msg_tips({
                    msg: mcs_recovery_fail_no_mail,
                    type: 'error',
                    timeout: 3000
                  })
                }
              }
            }
          })
        })
        $('#recovery_pass_ok_btn').click(function () { // 邮箱验证确定按钮点击事件
          let reg
          if (!$('#recovery_pass_email').val() || $('#recovery_pass_email').val() === mcs_input_email_addr) { // 验证输入的邮箱号是否与账户绑定的邮箱一致
            _this.publicFunc.msg_tips({
              msg: mcs_invalid_email_addr,
              type: 'error',
              timeout: 3000
            })
            return
          } else {
            reg = /^([a-zA-Z0-9]+[_|\\_|\\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\\_|\\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
            if (!reg.exec($('#recovery_pass_email').val())) {
              _this.publicFunc.msg_tips({
                msg: mcs_invalid_email_addr,
                type: 'error',
                timeout: 3000
              })
              return
            }
          }
          _this.$api.login.recovery_binding_email({ // 发送重置密码邮件
            username: $('#binding_account').val(),
            email: $('#recovery_pass_email').val(),
            appid: _this.appid,
            name: _this.name,
            lang: _this.$store.state.user.userLanguage
          }).then(res => {
            //console.log(res.data, 'recovery_binding_email_res')
            recovery_binding_email_ack(res.data)
            function recovery_binding_email_ack (msg) {
              // 重置密码回调处理函数
              if (msg.result !== '') {
                _this.publicFunc.msg_tips({
                  msg: msg,
                  type: 'error',
                  timeout: 3000
                })
              } else {
                $('#input_email_page').css('display', 'none')
                $('#forget_password_page').css('display', 'block')
                $('#retrieve_password_warn').html(
                  mcs_password_reset_confirmation
                )
              }
            }
          })
        })
        // 取消按钮事件
        $('#recovery_pass_cancel_btn').click(function () {
          $('#forget_pass_inner_main').html('')
        })
        $('#binding_account_cancel_btn').click(function () {
          $('#forget_pass_inner_main').html('')
        })
        $('#forget_password_close_btn').click(function () {
          $('#forget_pass_inner_main').html('')
        })
      })
      $('#signin_name').focus(function () { // 用户名输入框聚焦
        if (this.value === mcs_username) {
          this.value = ''
        }
        this.style.color = '#404040'
      })
      $('#signin_name').blur(function () { // 用户名输入框失焦
        if (this.value === '') {
          this.style.color = '#bdbdbd'
          this.value = mcs_username
        } else {
          this.style.color = '#404040'
        }
      })
      $('#password_eye').click(function () { // 密码框输入密码可视状态
        if ($('#password_eye').attr('class') === 'password_eye') {
          $('#password_eye').attr('class', 'password_eye_gray')
          $('#signin_pw').attr('type', 'password')
        } else {
          $('#password_eye').attr('class', 'password_eye')
          $('#signin_pw').attr('type', 'text')
        }
        if ($('#signin_pw').val() === mcs_password) {
          $('#signin_pw').attr('type', 'text')
        }
      })
      $('#signin_pw').focus(function () { // 密码输入框聚焦(内含密码可见情况判断)
        if ($('#password_eye').attr('class') === 'password_eye_gray') {
          $('#signin_pw').attr('type', 'password')
        } else {
          $('#signin_pw').attr('type', 'text')
        }
        $('#signin_pw').css('color', '#404040')
        if ($('#signin_pw').val() === mcs_password) {
          $('#signin_pw').val('')
        }
      })
      $('#signin_pw').blur(function () { // 密码输入框失焦
        if ($('#signin_pw').val() === '') {
          $('#signin_pw').css('color', '#bdbdbd')
          $('#signin_pw').val(mcs_password)
        } else {
          $('#signin_pw').css('color', '#404040')
        }
        if ($('#password_eye').attr('class') === 'password_eye_gray' && $('#signin_pw').val() !== mcs_password) {
          $('#signin_pw').attr('type', 'password')
        } else {
          $('#signin_pw').attr('type', 'text')
        }
      })
      $('#signin_pw').keypress(function (e) { // 监听回车键是否按下
        let evt = e || window.event
        if ((evt.which || evt.keyCode) === 13) {
          $('#sign_in').click()
          evt.returnValue = false
        }
      })
      /*注册按钮点击事件*/
      $('#register_account').click(function () {
        $('#sigin_in_username').hide()
        $('#sigin_in_password').hide()
        $('#sign_in').hide()
        $('#register_account').hide()
        $('#register_username').show()
        $('#register_account_pwd').show()
        $('#register_account_pwd_again').show()
        $('#keep_sign_in').hide()
        $('#register_btn').show()
        $('#sign_account').show()
        $('#forget_pass').css('display', 'none')
      })
      // 登录按钮点击事件
      $('#sign_account').click(function () {
        $('#sigin_in_username').show()
        $('#sigin_in_password').show()
        $('#sign_in').show()
        $('#register_account').show()
        $('#register_username').hide()
        $('#register_account_pwd').hide()
        $('#register_account_pwd_again').hide()
        $('#keep_sign_in').show()
        $('#register_btn').hide()
        $('#sign_account').hide()
        $('#forget_pass').css('display', 'block')
      })
      $('#register_signin_name').focus(function () {
        if ($('#register_signin_name').val() === mcs_input_username) {
          $('#register_signin_name').val('')
        }
        $('#register_signin_name').css('color', '#404040')
      })
      $('#register_signin_name').blur(function () {
        if ($('#register_signin_name').val() === '') {
          $('#register_signin_name').css('color', '#bdbdbd')
          $('#register_signin_name').val(mcs_input_username)
        } else {
          $('#register_signin_name').css('color', '#404040')
        }
      })
      $('#register_signin_pw').focus(function () {
        if ($('#register_password_eye').attr('class') === 'password_eye_gray') {
          $('#register_signin_pw').attr('type', 'password')
        } else {
          $('#register_signin_pw').attr('type', 'text')
        }
        $('#register_signin_pw').css('color', '#404040')
        if ($('#register_signin_pw').val() === mcs_input_password) {
          $('#register_signin_pw').val('')
        }
      })
      $('#register_signin_pw').blur(function () {
        if ($('#register_signin_pw').val() === '') {
          $('#register_signin_pw').css('color', '#bdbdbd')
          $('#register_signin_pw').val(mcs_input_password)
        } else {
          $('#register_signin_pw').css('color', '#404040')
        }
        if (
          $('#register_password_eye').attr('class') === 'password_eye_gray' &&
          $('#register_signin_pw').val() !== mcs_input_password
        ) {
          $('#register_signin_pw').attr('type', 'password')
        } else {
          $('#register_signin_pw').attr('type', 'text')
        }
      })
      $('#register_password_eye').click(function () {
        if ($('#register_password_eye').attr('class') === 'password_eye') {
          $('#register_password_eye').attr('class', 'password_eye_gray')
          $('#register_signin_pw').attr('type', 'password')
        } else {
          $('#register_password_eye').attr('class', 'password_eye')
          $('#register_signin_pw').attr('type', 'text')
        }
        if ($('#register_signin_pw').val() === mcs_input_password) {
          $('#register_signin_pw').attr('type', 'text')
        }
      })
      $('#register_signin_pw_again').focus(function () {
        if ($('#register_password_eye_again').attr('class') === 'password_eye_gray') {
          $('#register_signin_pw_again').attr('type', 'password')
        } else {
          $('#register_signin_pw_again').attr('type', 'text')
        }
        $('#register_signin_pw_again').css('color', '#404040')
        if ($('#register_signin_pw_again').val() === mcs_confirm_password) {
          $('#register_signin_pw_again').val('')
        }
      })
      $('#register_signin_pw_again').blur(function () {
        if ($('#register_signin_pw_again').val() === '') {
          $('#register_signin_pw_again').css('color', '#bdbdbd')
          $('#register_signin_pw_again').val(mcs_confirm_password)
        } else {
          $('#register_signin_pw_again').css('color', '#404040')
        }
        if (
          $('#register_password_eye_again').attr('class') ===
          'password_eye_gray' &&
          $('#register_signin_pw_again').val() !== mcs_confirm_password
        ) {
          $('#register_signin_pw_again').attr('type', 'password')
        } else {
          $('#register_signin_pw_again').attr('type', 'text')
        }
      })
      $('#register_password_eye_again').click(function () {
        if ($('#register_password_eye_again').attr('class') === 'password_eye') {
          $('#register_password_eye_again').attr('class', 'password_eye_gray')
          $('#register_signin_pw_again').attr('type', 'password')
        } else {
          $('#register_password_eye_again').attr('class', 'password_eye')
          $('#register_signin_pw_again').attr('type', 'text')
        }
        if ($('#register_signin_pw_again').val() === mcs_confirm_password) {
          $('#register_signin_pw_again').attr('type', 'text')
        }
      })
      //Login key events 点击登录按钮事件
      let loginWaitFlag = _this.$store.state.jumpPageData.loginWaitFlag
      $('#sign_in').click(function () {
        if ($('#keep_sign_in_check').is(':checked')) {
          localStorage.setItem('keep_pw', 1)
        } else {
          localStorage.setItem('keep_pw', '')
        }
        if ($('#signin_pw').val() === 'amdin') {
          $('#signin_pw').val('admin')
        }
        // 获取登录时输入的帐号密码
        let username_value = $('#signin_name').val().trim()
        let password_value = $('#signin_pw').val().trim()
        //storage the password use mmd5 format
        if (password_value === '••••••') {
          l_pwd_val = l_password_value
        } else {
          l_pwd_val = md5.hex(password_value)
        }
        let isDevicesID = username_value.search(/1jfie/i) // 校验是否为设备id登录
        if (!username_value || username_value === mcs_username) {
          _this.publicFunc.msg_tips({
            msg: mcs_the_user_name_is_empty,
            type: 'error',
            timeout: 3000
          })
          return
        }
        if (!password_value || password_value === mcs_password) {
          if (!localStorage.getItem('remember_msg_info')) {
            _this.publicFunc.msg_tips({
              msg: mcs_the_password_is_empty,
              type: 'error',
              timeout: 3000
            })
          }
          return
        }
        /*IPC to debug so annotation these lines*/
        if (isDevicesID === 0 && _this.name !== 'mipc') { // 非mipc项目/设备id用户名校验未通过,提示拒绝登录
          _this.publicFunc.msg_tips({
            msg: mcs_register_prompt,
            type: 'error',
            timeout: 3000
          })
          return
        }
        //Judgment is ipc login or user login 记录用户是ipc登录还是账户登录
        let reg = /^\d/
        if (reg.exec(username_value)) _this.$store.dispatch('setLoginStatus', 'ipc')
        else _this.$store.dispatch('setLoginStatus', 'register_user')
        if (!loginWaitFlag) {
          // 用户登录
          _this.$store.dispatch('setLoginWaitFlag', 1)
          _this.$api.login.sign_in({
            user: username_value, // 用户名
            password: l_pwd_val // 密码
          }).then(res => {
            login_ack(res.data)
            // 登录回调处理
            function login_ack (msg) {
              console.log(msg, 'login_ack')
              //There is a problem before returning, no result is a successful login
              if (msg.result === '') {
                // _this.$store.dispatch('setLid', msg.lid) //登录返回lid head中
                _this.$store.dispatch('setName', username_value)
                _this.$store.dispatch('setSid', msg.sid)
                _this.$store.dispatch('setGuest', msg.guest)
                _this.$store.dispatch('setSeq', msg.seq)
                let version_type = ''
                if (navigator.userAgent.indexOf('Intel Mac') > -1) {
                  version_type = 'mac_' + _this.name
                } else if (navigator.userAgent.indexOf('Windows') > -1) {
                  version_type = 'windows_' + _this.name
                }
                if ($('#top_menu_my')) {
                  $('#top_menu_my').html(username_value)
                }
                // 获取版本信息接口(暂未发现调用该接口用途, 存储的结果包含固定值)
                _this.$api.login.get_version({
                  // srv: window.location.host, // 暂时注释由于有代理添加该参数会导致调用地址异常
                  ver_type: version_type,
                  ver_from: 'v3.9.1.1607051739',
                  lang: _this.$store.state.user.userLanguage,
                  p: [{ n: "status", v: "main" }]
                }).then(res => {
                  get_version_ack(res.data)
                  function get_version_ack (msg) {
                    if (msg && msg.result === '') {
                      // app_verson = msg.info.ver_to //登录日志 app版本号  暂时未发现用处注释
                      // if (msg.info.p && msg.info.p[0].n === 'checksum') { // 日志功能暂时无法对接注释
                      //   //登录日志 app checksum
                      //   app_checksum = msg.info.p[0].v
                      // }
                      if (window.location.protocol === 'https:') {
                        msg.info.link_url = msg.info.link_url.replace('http://209.133.212.170:2080', 'https://us10.vimtag.com:2446')
                        msg.info.link_url = msg.info.link_url.replace('http://61.147.109.92:7080', 'https://js.vimtag.com:7446')
                      }
                      _this.$store.dispatch('setPlayDownloadUrl', msg.info.link_url) // 存储播放时需要用到的url
                    }
                  }
                })
                // 设备消息轮询
                _this.$api.login.dev_msg_listener_add()
                // 获取iframe相关服务器地址参数
                _this.$api.login.get_req({
                  client: {
                    mode: "",
                    id: username_value
                  },
                  srv: _this.appid
                }).then(res => {
                  let host = res.data.server.signal[0].substring(res.data.server.signal[0].indexOf("//")+2,res.data.server.signal[0].lastIndexOf("/"))
                  _this.$store.dispatch('setServerDevice', host)
                  get_req_ack(res)
                  function get_req_ack (msg) {
                    if (msg && msg.data && msg.data.server && msg.data.server.param) {
                      let param = msg.data.server.param
                      console.log(msg, param, 'get_req_ack')
                      for (let i = 0; i < param.length; i++) {
                        if (param[i].name === 'f_multi_screen' && param[i].value === '1') {
                          mme.prototype.check_plug_install('', function (ref, version) {
                            if (!version) {
                              _this.$store.dispatch('setAutoPlayFlag', 0)
                            } else {
                              _this.$store.dispatch('setAutoPlayFlag', 1)
                              let auto_play = localStorage.getItem('auto_play')
                              if (auto_play !== 0) {
                                _this.$store.dispatch('setAutoPlayFlag', 1)
                              } else {
                                _this.$store.dispatch('setAutoPlayFlag', 0)
                              }
                            }
                          })
                        }
                        if (param[i].name === 'f_filter' && param[i].value === '1') {
                          _this.$store.dispatch('setSupportFilterFlag', 1)
                        }
                        if (param[i].name === 'f_grp' && param[i].value === '1') {
                          _this.$store.dispatch('setSupportTreeFlag', 1)
                        }
                        if (param[i].name === 'sc.logo') {
                          //给江门xhjymclz修改设备列表页面图标
                          // g_supprot_clogo = 1;
                          _this.$store.commit('SET_JM_LOGO_FLAG', 1)
                          // createPage('top', { parent: $('#top') })
                          _this.$router.push({name:'top',params:{parent: $("#top")}})
                        }
                      }
                    }
                    _this.$store.dispatch('setDownloadManualUrl', msg.data.server.signal[2])
                    // upload_log("log_app_login")  //登录请求返回后发送日志
                    // createPage('devlist', { parent: obj.parent })
                    _this.$router.push({name:'devlist',params:{parent: obj.parent}}) // 跳转至设备列表页面
                  }
                })
                if (!_this.$store.state.jumpPageData.experienceFlag) { // 判断是否为体验
                  // 记住密码状态/自动登录状态设置
                  localStorage.setItem('remember_msg_info', JSON.stringify({ user: username_value, password: l_pwd_val }))
                  localStorage.setItem('auto_login', '1')
                  _this.$store.dispatch('setLoginFlag', 1) // 存储登录状态标识
                }
              } else {
                //登录结果失败
                //console.log('fail_login')
                _this.$store.dispatch('setLoginWaitFlag', 0)
                if (msg.result === 'accounts.user.offline') {
                  _this.publicFunc.msg_tips({
                    msg: mcs_offline,
                    type: 'warning',
                    timeout: 3000
                  })
                } else if (msg.result === 'accounts.user.unknown') {
                  _this.publicFunc.msg_tips({
                    msg: mcs_username_does_not_exis,
                    type: 'warning',
                    timeout: 3000
                  })
                } else if (msg.result === 'accounts.pass.invalid') {
                  _this.publicFunc.msg_tips({
                    msg: mcs_invalid_password,
                    type: 'warning',
                    timeout: 3000
                  })
                } else if (msg.result === 'accounts.user.inactive') {
                  _this.publicFunc.msg_tips({
                    msg: mcs_email_inactive,
                    type: 'warning',
                    timeout: 3000
                  })
                } else {
                  _this.publicFunc.msg_tips({
                    msg: mrs_request_error,
                    type: 'warning',
                    timeout: 3000
                  })
                }
                // upload_log("log_app_login")  //登录请求返回后发送日志
              }
            }
          })
        }
      })

      // 注册页面点击注册按钮(注册验证提交)
      $('#register_btn').click(function () {
        let reg,
          username_value = $('#register_signin_name').val(),
          password_value = $('#register_signin_pw').val(),
          pw_confirm_value = $('#register_signin_pw_again').val()

        if (!username_value || username_value == mcs_input_username) {
          _this.publicFunc.msg_tips({
            msg: mcs_the_user_name_is_empty,
            type: 'error',
            timeout: 3000
          })
          return
        } else {
          reg = /^([a-zA-Z][a-zA-Z0-9]{5,31})$/
          if (!reg.exec(username_value)) {
            _this.publicFunc.msg_tips({
              msg: mcs_user_letter_range_hint,
              type: 'warning',
              timeout: 5000
            })
            return
          }
        }
        if (!password_value || password_value === mcs_input_password) {
          _this.publicFunc.msg_tips({
            msg: mcs_the_password_is_empty,
            type: 'error',
            timeout: 3000
          })
          return
        } else {
          reg = /^[0-9a-zA-Z]{8,32}$/
          if (!reg.exec(password_value)) {
            _this.publicFunc.msg_tips({
              msg: mcs_password_range_hint,
              type: 'warning',
              timeout: 5000
            })
            return
          }
        }
        if (!pw_confirm_value || pw_confirm_value === mcs_confirm_password) {
          _this.publicFunc.msg_tips({
            msg: mcs_password_empty,
            type: 'error',
            timeout: 3000
          })
          return
        }
        if (pw_confirm_value !== password_value) {
          _this.publicFunc.msg_tips({
            msg: mcs_two_password_input_inconsistent,
            type: 'error',
            timeout: 3000
          })
          return
        }
        _this.$api.login.sign_up({ // 调用用户注册接口
          username: username_value,
          password: password_value,
        }).then(res => {
          let msg_data = res.data
          let msg
          if (msg_data && msg_data.result === "") { // 对返回的数据进行处理
            msg = mcs_successful_sign_up;
          } else if (msg_data.result === "accounts.user.existed") {
            msg = mcs_username_already_exists;
          } else {
            msg = mcs_sign_up_failed;
          }
          if (msg === mcs_successful_sign_up) { // 判断返回值进行提示
            _this.publicFunc.msg_tips({
              msg: msg,
              type: 'success',
              timeout: 3000
            })
            // createPage('login', obj)
            _this.create_login_page({ parent: $('#login') }) // 切换回登录页面(此处后期可改成点击登录按钮事件)
          } else {
            _this.publicFunc.msg_tips({ msg: msg, type: 'error', timeout: 3000 })
          }
        })
      })
      if (localStorage.getItem('auto_login') == 1) {
        // 自动登录状态为1时,相当于操作一次点击登录按钮
        $('#sign_in').click()
      }
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if(this.$route.params){
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    }else{
      pageData = {parent: $("#" + this.$route.name)}
    }
    // console.log(pageData,"pageData")
    await this.create_login_page(pageData) // 进入页面后加载
    // await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (this.$store.state.jumpPageData.projectName.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    // 获取网络环境
    await this.$api.login.svr_dev_get().then(res => {
      if (res.result != "") return;
      //Access server
      if (res.type === "MS") {
        this.$store.dispatch('setNetworkEnviron', 'public')
      } else if (res.type === "IPC" || res.type === "BOX") {//Visit the IPC or box equipment
      this.$store.dispatch('setNetworkEnviron', 'private')
      }
      // l_server_type = res.type;
      // l_server_sn = res.sn;
      // if (g_local) {
      //   createPage("devlist", { parent: $("#page") });
      // } else {
      //   setTimeout(function () {
      //     createPage("login", { parent: $("#page"), type: l_server_type, sn: l_server_sn });
      //     // create_login_page({ parent: mx("#page"), type: l_server_type, sn: l_server_sn });
      //   }, 100)
      // }
    })
  } 
}
</script>