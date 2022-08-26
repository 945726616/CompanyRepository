<template>
  <div id='login'>
    <div id='login_page'>
      <div id='login_box' :class="name == 'vimtag'?'vimtag_login_bg':''" :style="name == 'ebit'?'background:#F5F5F5':''">
        <div id='vimtag_signin_inner' :style="name == 'vimtag'?'width:290px':'width:230px'">
          <div :id="'signin_logo_'+name"></div>
          <div id='sigin_in_username' class='input_div' v-if="!register_sign">
            <div :class="name+'_login_user'"></div>
            <input id='signin_name' :class="name == 'vimtag'?'vimtag_input_username':'mipc_input_username'" :placeholder="mcs_username" :style="remember_data_sign?'color: #404040':''" v-model="user_val">
            <!-- 登录时用户名 -->
            <div :class="name+'_login_input'"></div>
          </div>
          <div id='register_username' class='input_div' v-if="register_sign">
            <div :class="name+'_login_user'"></div>
            <input id='register_signin_name' :class="name == 'vimtag'?'vimtag_input_username':'mipc_input_username'" :placeholder="mcs_input_username" v-model="register_name_val">
            <!-- 注册时填写用户名 -->
            <div :class="name+'_login_input'"></div>
          </div>
          <div id='sigin_in_password' class='input_div' v-if="!register_sign">
            <div :class="name+'_password_img'"></div>
            <input id='signin_pw' :class="name == 'vimtag'?'vimtag_input_password':'mipc_input_password'" :type='password_eye_sign?"password":"text"' :style="l_remember_data_obj&&l_remember_data_obj.password?'color: #404040':''" v-model="password_val" :placeholder="mcs_password" @keyup.enter="sign_in">
            <!-- 登录时密码 -->
            <div id='password_eye' :class='password_eye_sign?"password_eye_gray":"password_eye"' v-if="eye_sign && name == 'vimtag'" @click="password_eye_sign = !password_eye_sign">
            </div>
            <div :class="name+'_login_input'"></div>
          </div>
          <div id='register_account_pwd' class='input_div' v-if="register_sign">
            <div :class="name+'_password_img'"></div>
            <input id='register_signin_pw' :class="name == 'vimtag'?'vimtag_input_password':'mipc_input_password'" v-model="register_pw_val" :type='register_password_eye_sign?"password":"text"' :placeholder='mcs_input_password'>
            <!-- 注册时填写密码 -->
            <div id='register_password_eye' v-if="name == 'vimtag'" :class='register_password_eye_sign?"password_eye_gray":"password_eye"' @click="register_password_eye_sign = !register_password_eye_sign"></div>
            <div :class="name+'_login_input'"></div>
          </div>
          <div id='register_account_pwd_again' class='input_div' v-if="register_sign">
            <div :class="name+'_password_img'"></div>
            <input id='register_signin_pw_again' :class="name == 'vimtag'?'vimtag_input_password':'mipc_input_password'" :type='register_password_eye_again_sign?"password":"text"' :placeholder='mcs_confirm_password' v-model="register_pw_again_val"><!-- 注册时填写确认密码 -->
            <div id='register_password_eye_again' v-if="name == 'vimtag'" :class='register_password_eye_again_sign?"password_eye_gray":"password_eye"' @click="register_password_eye_again_sign = !register_password_eye_again_sign"></div>
            <div :class="name+'_login_input'"></div>
          </div>
          <div id='keep_sign_in' v-if="!register_sign">
            <input id='keep_sign_in_check' type='checkbox' v-model="keep_pw"><span>{{mcs_remember_password}}</span>
            <!-- 记住密码选框 -->
          </div>
          <button :class="name == 'vimtag'?'vimtag_btn':'mipc_btn'" id='sign_in' v-if="!register_sign" @click="sign_in">{{mcs_sign_in}}</button><!-- 登录页面中登录按钮 -->
          <button :class="name == 'vimtag'?'vimtag_btn':'mipc_btn'" id='register_btn' @click="sign_up" v-if="register_sign">{{mcs_sign_up}}</button><!-- 注册页面中注册按钮 -->
          <div>
            <span id='register_account' @click="register_button" v-if="!register_sign">{{mcs_sign_up}}</span>
            <!-- 登录页面中注册文字按钮 -->
            <span id='forget_pass' @click="forget_pw_sign = true" v-if="!register_sign">{{mcs_forgot_your_password}}?</span>
            <!-- 登录页面中忘记密码文字按钮 -->
            <span id='sign_account' v-if="register_sign" @click="register_sign = false">{{mcs_sign_in}}</span>
            <!-- 注册页面中登录文字按钮 -->
          </div>
        </div>
        <div id='forget_pass_inner_main'>
          <!-- 忘记密码点击弹窗渲染节点 -->
          <div id='forget_pass_inner' v-if="forget_pw_sign">
            <div id='binding_account_cancel_btn' @click="forget_password_close_btn">&times;</div>
            <div :style='forget_pass_first?"margin-top:50px;":"margin-top:50px;display:none;"' id='input_account_page'>
              <div style='font-size:20px; color:#323232;'>
                {{mcs_forgot_your_password}}
              </div>
              <!-- 忘记密码 (弹框title) -->
              <div style='font-size:14px; color:#646464; margin-top:40px; margin-bottom:20px;'>
                {{mcs_valid_user_name}}
              </div>
              <!--  第一步：请输入有效用户名 -->
              <div style='margin-bottom:20px;'>
                <input class='standard_inputs_normal' id='binding_account_name' type='text' style="width:230px; float:none;" v-model='binding_account_val' :placeholder='mcs_please_input_username'>
                <!-- 请输入用户名 -->
                <!-- <input class='standard_inputs_normal' id='binding_account' type='text' :style='remember_data_sign?"display:inline":""' v-model="binding_account_val"> -->
              </div>
              <div style='width:235px; margin:auto;'>
                <!-- 下一步按钮 -->
                <input id='binding_account_next_btn' style='width:100%; line-height:34px; height:34px;' type='button' class='vimtag_button_right' :value='mcs_action_next' @click="binding_account_next_btn">
              </div>
            </div>
            <div v-if='forget_pass_second' id='input_email_page'>
              <div style='font-size:20px; color:#323232;'>
                {{mcs_forgot_your_password}}
              </div>
              <!-- 忘记密码 (弹框title) -->
              <div style='font-size:14px; color:#646464; margin-top:40px; margin-bottom:10px;'>
                {{mcs_binding_mailbox}}
              </div>
              <!-- 第二步：请输入绑定的邮箱 -->
              <div id='email_warn' v-if='email_sign' style='margin-bottom:10px;'>
                <span>
                  {{mcs_prompt}}
                  : </span><span id='binding_account_email'>{{email_val}}</span>
                <!-- 提示: 绑定的邮箱隐去中间部分 -->
              </div>
              <div style='margin-bottom:10px;'>
                <input class='standard_inputs_normal' id='recovery_pass_email_addr' type='text' style='width:230px; float:none;' :placeholder='mcs_input_email_addr' v-model="pass_email_val">
                <!-- 邮箱输入框部分 -->
                <input class='standard_inputs_normal' id='recovery_pass_email' type='text' style='display:none; color:#404040; width:230px; float:none;'>
              </div>
              <div style='width:235px; margin:auto; margin-top:10px;'>
                <input id='recovery_pass_ok_btn' style='width:100%; line-height:34px; height:34px;' type='button' class='vimtag_button_left' :value='mcs_ok' @click="pass_ok_btn">
                <!-- 确定按钮 -->
                <input id='recovery_pass_cancel_btn' style='display:none;' type='button' class='vimtag_button_right' :value='mcs_cancel'>
                <!-- 取消按钮 -->
              </div>

            </div>
            <div :style='binding_email_sign?"display:block":""' id='forget_password_page'>
              <div style='font-size:20px; color:#323232;'>
                {{mcs_forgot_your_password}}
              </div>
              <!-- 忘记密码 (弹框title) -->
              <div style='margin-bottom:10px; margin:0 auto; margin-top:60px; font-size:14px; color:#323232; width:335px;' id='retrieve_password_warn'>{{binding_email_sign?mcs_password_reset_confirmation:""}}
              </div>
              <div style='width:235px; margin:auto; margin-top:20px; '>
                <!-- 提示内容 -->
                <input id='forget_password_close_btn' @click="forget_password_close_btn" style='width:100%; line-height:34px; height:34px;' type='button' class='vimtag_button_left' :value='mcs_ok'>
                <!-- 确定按钮 -->
              </div>
            </div>
          </div>
        </div>
        <div id='select_lang_btn' v-if="name != 'vimtag'">
          <select id='select_language_mipc_new' class='select_language_mipc_new' v-model="current_language" @change="choose_language_btn(current_language)" :style="name == 'ebit'?'background:#F5F5F5':''">
            <option v-for="(item,index) in language_list" :key='index' class='select_language_option' :tag='item.val' :value="item.val">{{item.lang}}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import languageSelect from '../../lib/exportModule/languageSelect.js'
import md5 from '@/util/mmd5.js'
import mme from '@/util/mme.js'
export default {
  data () {
    return {
      // 多国语言
      mcs_username: mcs_username, //用户名
      mcs_input_username: mcs_input_username, //输入用户名
      mcs_password: mcs_password, //密码
      mcs_input_password: mcs_input_password, //输入密码
      mcs_confirm_password: mcs_confirm_password, //确认密码
      mcs_remember_password: mcs_remember_password, //记住密码
      mcs_sign_in: mcs_sign_in, //登录
      mcs_sign_up: mcs_sign_up, //注册
      mcs_forgot_your_password: mcs_forgot_your_password, //忘记密码
      mcs_valid_user_name: mcs_valid_user_name, //第一步：请输入有效用户名
      mcs_please_input_username: mcs_please_input_username, //请输入用户名
      mcs_action_next: mcs_action_next, //下一步
      mcs_binding_mailbox: mcs_binding_mailbox, //第二步：请输入绑定的邮箱
      mcs_prompt: mcs_prompt, //提示
      mcs_ok: mcs_ok, //确定
      mcs_cancel: mcs_cancel, //取消
      mcs_input_email_addr: mcs_input_email_addr, //输入邮箱地址
      mcs_invalid_email_addr: mcs_invalid_email_addr, //邮箱地址无效
      mcs_accounts_bind_email_exist: mcs_accounts_bind_email_exist, //该账号已经绑定过邮箱
      mcs_accounts_bind_email_busy: mcs_accounts_bind_email_busy, //该邮箱已经绑定过账号
      mcs_email_unmatch: mcs_email_unmatch, //邮箱不匹配
      mcs_recovery_fail_no_mail: mcs_recovery_fail_no_mail, //密码重置失败，本账号未绑定邮件地址
      mcs_login_fail_inactive: mcs_login_fail_inactive, //帐号未激活，请查收邮件进行激活
      mcs_invalid_user: mcs_invalid_user, //用户名无效
      mcs_password_reset_confirmation: mcs_password_reset_confirmation, //提交成功，已发送重置邮件到你提交的邮件地址，请参考邮件内容重置密码
      mcs_the_user_name_is_empty: mcs_the_user_name_is_empty, //用户名为空
      mcs_the_password_is_empty: mcs_the_password_is_empty, //密码为空
      mcs_offline: mcs_offline, //设备离线
      mcs_username_does_not_exis: mcs_username_does_not_exis, //用户名不存在
      mcs_invalid_password: mcs_invalid_password, //密码错误
      mcs_email_inactive: mcs_email_inactive, //邮箱没有激活
      mrs_request_error: mrs_request_error, //请求数据错误，请重新登录后再试
      mcs_user_letter_range_hint: mcs_user_letter_range_hint, //账号为6-32位数字(0-9)或字母(a-z、A-Z)，需以字母开头
      mcs_password_range_hint: mcs_password_range_hint, //密码为8-32位数字和字母
      mcs_two_password_input_inconsistent: mcs_two_password_input_inconsistent, //两次密码输入不一致
      mcs_successful_sign_up: mcs_successful_sign_up, //注册成功
      mcs_username_already_exists: mcs_username_already_exists, //用户名已存在
      mcs_sign_up_failed: mcs_sign_up_failed, //注册失败

      appid: '', // location.origin.split('www.')[1] // 获取项目地址vimtag.com/mipcm.com
      name: '', // appid.split('.')[0] // 获取项目名 vimtag/mipcm
      l_remember_data_obj: {}, //用户信息
      keep_pw: false, //是否记住密码
      forget_pw_sign: false, //是否点击忘记密码
      remember_data_sign: false, //是否已有登录用户名记录
      eye_sign: true, //是否显示眼睛
      user_val: '', //用户名
      password_val: '', //密码
      l_pwd_val: '', // 函数内接口使用的密码值
      l_password_value: '', // 暂定义局部记住密码时获取到的存储的密码
      binding_account_val: '', //忘记密码用户名
      email_sign: false, //忘记密码用户名是否绑定邮箱
      email_val: '', //后台返回绑定邮箱
      pass_email_val: '', //用户绑定邮箱
      binding_email_sign: false, //是否成功发送重置右邮件
      forget_pass_first: true, //忘记密码第一步显示
      forget_pass_second: false, //忘记密码第二步显示
      password_eye_sign: true, //密码input中type改变
      register_sign: false, //是否点击注册
      register_password_eye_sign: true, //注册输入密码input中type改变
      register_password_eye_again_sign: true, //注册确认密码input中type改变
      register_name_val: '', //注册用户名
      register_pw_val: '', //注册密码
      register_pw_again_val: '', //注册确认密码
      language_list: [{ val: "ar", lang: "العربية" }, { val: "en", lang: "English" }, { val: "es", lang: "española" }, { val: "fr", lang: "française" }, { val: "de", lang: "Deutsch" }, { val: "it", lang: "italiana" }, { val: "ja", lang: "日本語" }, { val: "ko", lang: "한국의" }, { val: "pt", lang: "português" }, { val: "ru", lang: "русский" }, { val: "zh", lang: "中文(简体)" }, { val: "tw", lang: "中文(繁体)" }, { val: "hu", lang: "magyar" }, { val: "nl", lang: "Nederlands" }, { val: "sk", lang: "slovenského jazyk" }, { val: "tr", lang: "Türk dili" }, { val: "cz", lang: "Česky" }, { val: "vi", lang: "Người việt nam" }, { val: "iw", lang: "עברית" }, { val: "pl", lang: "Polski" }, { val: "uk", lang: "Українська мова" }, { val: "th", lang: "ภาษาไทย" }],
      current_language: '', //当前语言
    }
  },
  async mounted () {
    if (window.location.href.indexOf('vimtag') > -1) {
      this.name = 'vimtag';
      this.appid = 'vimtag.com'
    } else if (window.location.href.indexOf('ebitcam') > -1) {
      this.name = 'ebit';
      this.appid = 'ebitcam.com'
    } else if (window.location.href.indexOf('mipcm') > -1) {
      this.name = 'mipc';
      this.appid = 'mipcm.com'
    } else {
      this.name = 'vsmahome';
      this.appid = 'vsmahome.com'
    }

    let remember_msg_info
    let username
    if (localStorage.getItem('remember_msg_info')) {
      // mlocal_storage参见\web\lib\mlib.core.localstorage.js
      remember_msg_info = localStorage.getItem('remember_msg_info')
      remember_msg_info = eval('(' + remember_msg_info + ')') // 为remember_msg_info字符串方法的结果
      username = remember_msg_info.user
    }
    if (!localStorage.getItem('keep_pw')) { // 本地加密存储帐号密码 改变自动登录状态
      if (username) {
        localStorage.setItem('remember_msg_info', JSON.stringify({
          user: username
        }))
      }
    }
    let l_remember_data = localStorage.getItem('remember_msg_info') // 从存储空间中取出账户名和密码并填写渲染在页面中
    this.l_remember_data_obj = l_remember_data ? eval('(' + l_remember_data + ')') : null
    if (this.l_remember_data_obj && this.l_remember_data_obj.user) {
      this.remember_data_sign = true;
      this.user_val = this.l_remember_data_obj.user;
    }
    if (this.l_remember_data_obj && this.l_remember_data_obj.password) {
      this.password_val = "••••••"
      this.l_password_value = this.l_remember_data_obj.password
    }
    if (this.password_val == "••••••") {
      this.eye_sign = false;
    }
    if (localStorage.getItem('keep_pw')) { // 存储中保持登录状态被选中
      this.keep_pw = true;
    } else {
      this.keep_pw = false;
    }
    if (this.user_val && this.user_val != mcs_username) {
      this.binding_account_val = this.user_val;
    }
    if (localStorage.getItem('auto_login') == 1) {
      // 自动登录状态为1时,相当于操作一次点击登录按钮
      this.sign_in();
    }
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)

    // 获取网络环境
    await this.$api.login.svr_dev_get().then(res => {
      if (res.result != "") return;
      //Access server
      if (res.type === "MS") {
        this.$store.dispatch('setNetworkEnviron', 'public')
      } else if (res.type === "IPC" || res.type === "BOX") { //Visit the IPC or box equipment
        this.$store.dispatch('setNetworkEnviron', 'private')
      }
    })

    //设置语言
    // 根据session中存储的语言类型渲染下拉选择框
    this.current_language = this.$store.state.user.userLanguage
  },
  methods: {
    binding_account_next_btn () { // 点击下一步按钮
      let _this = this;
      // analysis.logEvent('logintest');
      if (_this.binding_account_val.length === 0 || _this.binding_account_val === mcs_please_input_username) { // 未输入任何值弹出报错信息
        _this.publicFunc.msg_tips({
          msg: mcs_the_user_name_is_empty,
          type: 'error',
          timeout: 3000
        })
        return
      }
      // 调用绑定邮箱接口
      _this.$api.login.binding_email_get({
        username: _this.binding_account_val,
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
              _this.email_sign = true;
              _this.forget_pass_first = false;
              _this.forget_pass_second = true;
              _this.email_val = msg.data.email;
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
    },
    pass_ok_btn () { // 邮箱验证确定按钮点击事件
      let reg;
      let _this = this;
      if (!_this.pass_email_val || _this.pass_email_val ===
        mcs_input_email_addr) { // 验证输入的邮箱号是否与账户绑定的邮箱一致
        _this.publicFunc.msg_tips({
          msg: mcs_invalid_email_addr,
          type: 'error',
          timeout: 3000
        })
        return
      } else {
        reg =
          /^([a-zA-Z0-9]+[_|\\_|\\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\\_|\\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
        if (!reg.exec(_this.pass_email_val)) {
          _this.publicFunc.msg_tips({
            msg: mcs_invalid_email_addr,
            type: 'error',
            timeout: 3000
          })
          return
        }
      }
      _this.$api.login.recovery_binding_email({ // 发送重置密码邮件
        username: _this.binding_account_val,
        email: _this.pass_email_val,
        appid: _this.appid,
        name: _this.name,
        lang: _this.$store.state.user.userLanguage
      }).then(res => {
        let return_data;
        let msg = res.data;
        // console.log(msg, 'recovery_binding_email_res')
        if (msg && msg.result == "") {
          return_data = "";
        } else if (msg.result == "accounts.bind.email.exist") {
          return_data = mcs_accounts_bind_email_exist;
        } else if (msg.result == "accounts.bind.email.busy") {
          return_data = mcs_accounts_bind_email_busy;
        } else if (msg.result == "accounts.recovery.email.unmatch") {
          return_data = mcs_email_unmatch;
        } else if (msg.result == "accounts.recovery.email.unbind") {
          return_data = mcs_recovery_fail_no_mail;
        } else if (msg.result == "accounts.recovery.email.inactive") {
          return_data = mcs_login_fail_inactive;
        } else if (msg.result == "accounts.user.unknown") {
          return_data = mcs_invalid_user;
        } else {
          return_data = msg.result;
        }
        recovery_binding_email_ack(return_data)

        function recovery_binding_email_ack (msg) {
          // 重置密码回调处理函数
          if (msg !== '') {
            _this.publicFunc.msg_tips({
              msg: msg,
              type: 'error',
              timeout: 3000
            })
          } else {
            _this.forget_pass_second = false;
            _this.binding_email_sign = true;
          }
        }
      })
    },
    forget_password_close_btn () { // 忘记密码弹出框关闭事件
      this.forget_pw_sign = false;
      this.forget_pass_first = true;
      this.email_sign = false;
      this.email_val = '';
      this.pass_email_val = '';
      this.binding_email_sign = false;
      this.forget_pass_first = true;
      this.forget_pass_second = false;
    },
    sign_in () { //点击登录事件
      let _this = this;
      let loginWaitFlag = _this.$store.state.jumpPageData.loginWaitFlag;
      if (_this.keep_pw) { // 判断是否记住密码
        localStorage.setItem('keep_pw', 1);
      } else {
        localStorage.setItem('keep_pw', '');
      }
      if (_this.password_val === 'amdin') {
        _this.password_val = "admin";
      }
      // 获取登录时输入的帐号密码
      let username_value = _this.user_val.trim();
      let password_value = _this.password_val.trim();
      //storage the password use mmd5 format
      if (password_value === '••••••') {
        _this.l_pwd_val = _this.l_password_value;
      } else {
        _this.l_pwd_val = md5.hex(password_value);
      }
      let isDevicesID = username_value.search(/1jfie/i) // 校验是否为设备id登录
      if (!username_value) {
        _this.publicFunc.msg_tips({
          msg: mcs_the_user_name_is_empty,
          type: 'error',
          timeout: 3000
        })
        return
      }
      if (!password_value) {
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
          password: _this.l_pwd_val // 密码
        }).then(res => {
          login_ack(res.data)
          // 登录回调处理
          function login_ack (msg) {
            //There is a problem before returning, no result is a successful login
            console.log('setLid', res)
            if (msg.result === '') {
              // _this.publicFunc.log_upload('login', "success"); //记录日志：登录成功

              // _this.$store.dispatch('setLid', msg.lid) //登录返回lid head中
              _this.$store.dispatch('setName', username_value)
              _this.$store.dispatch('setSid', msg.sid)
              _this.$store.dispatch('setSeq', msg.seq)

              let version_type = ''
              if (navigator.userAgent.indexOf('Intel Mac') > -1) {
                version_type = 'mac_' + _this.name
              } else if (navigator.userAgent.indexOf('Windows') > -1) {
                version_type = 'windows_' + _this.name
              }

              // 获取版本信息接口(暂未发现调用该接口用途, 存储的结果包含固定值)
              _this.$api.login.get_version({
                // srv: window.location.host, // 暂时注释由于有代理添加该参数会导致调用地址异常
                ver_type: version_type,
                ver_from: 'v3.9.1.1607051739',
                lang: _this.$store.state.user.userLanguage,
                p: [{
                  n: "status",
                  v: "main"
                }]
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
                      msg.info.link_url = msg.info.link_url.replace(
                        'http://209.133.212.170:2080',
                        'https://us10.vimtag.com:2446')
                      msg.info.link_url = msg.info.link_url.replace(
                        'http://61.147.109.92:7080',
                        'https://js.vimtag.com:7446')
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
                // srv: _this.appid
              }).then(res => {
                // let host = res.data.server.signal[0].substring(res.data.server.signal[0].indexOf("//") + 2, res.data.server.signal[0].lastIndexOf("/"))
                // _this.$store.dispatch('setServerDevice', host)
                // console.log(host, 'host')
                get_req_ack(res)

                function get_req_ack (msg) {
                  if (msg && msg.data && msg.data.items[0] && msg.data.items[0].p) {
                    let param = msg.data.items[0].p
                    for (let i = 0; i < param.length; i++) {
                      if (param[i].n === 'f_multi_screen' && param[i].v === '1') {
                        mme.prototype.check_plug_install('',
                          function (ref, version) {
                            if (!version) {
                              _this.$store.dispatch('setAutoPlayFlag', 0)
                            } else {
                              let auto_play = Number(localStorage.getItem('auto_play'))
                              if (auto_play !== 0) {
                                _this.$store.dispatch('setAutoPlayFlag', 1)
                              } else {
                                _this.$store.dispatch('setAutoPlayFlag', 0)
                              }
                            }
                          })
                      }
                      if (param[i].n === 'f_filter' && param[i].v === '1') {
                        _this.$store.dispatch('setSupportFilterFlag', 1)
                      }
                      // console.log(param[i], 'param')
                      if (param[i].n === 'f_grp' && param[i].v === '1') {
                        _this.$store.dispatch('setSupportTreeFlag', 1)
                      }
                      if (param[i].n === 'sc.logo' && param[i].v === '1') {
                        //给江门xhjymclz修改设备列表页面图标
                        _this.$store.dispatch('setJmLogoFlag', 1)
                      }
                    }
                  }
                  // _this.$store.dispatch('setDownloadManualUrl', msg.data.server.signal[2])
                  // upload_log("log_app_login")  //登录请求返回后发送日志
                  // createPage('devlist', { parent: obj.parent })
                  _this.$router.push({
                    name: 'devlist'
                  }) // 跳转至设备列表页面
                }
              })

              if (!_this.$store.state.jumpPageData.experienceFlag) { // 判断是否为体验
                // 记住密码状态/自动登录状态设置
                localStorage.setItem('remember_msg_info', JSON.stringify({ // 本地存储帐号密码
                  user: username_value,
                  password: _this.l_pwd_val
                }))
                localStorage.setItem('auto_login', '1') // 本地存储自动登录标识
                _this.$store.dispatch('setLoginFlag', 1) // 存储登录状态标识
                _this.$store.dispatch('setExperienceShow', false) // vimtag隐藏体验标识
              }
            } else {
              //登录结果失败
              //console.log('fail_login')
              // _this.publicFunc.log_upload('login', 'fail', msg.result); //记录日志：登录失败，失败原因

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
    },
    sign_up () { //注册页面点击注册按钮(注册验证提交)
      let _this = this;
      let reg;
      let username_value = _this.register_name_val;
      let password_value = _this.register_pw_val;
      let pw_confirm_value = _this.register_pw_again_val;
      if (!username_value) {
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
      if (!password_value) {
        _this.publicFunc.msg_tips({
          msg: mcs_the_password_is_empty,
          type: 'error',
          timeout: 3000
        })
        return
      } else {
        reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{8,32}$/ //同时包含数字和字母
        if (!reg.exec(password_value)) {
          _this.publicFunc.msg_tips({
            msg: mcs_password_range_hint,
            type: 'warning',
            timeout: 5000
          })
          return
        }
      }
      if (!pw_confirm_value) {
        _this.publicFunc.msg_tips({
          msg: mcs_the_password_is_empty,
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
          msg = mcs_successful_sign_up
          // _this.publicFunc.log_upload('regist', 'success'); //记录日志：注册成功
        } else {
          // _this.publicFunc.log_upload('regist', 'fail', msg_data.result); //记录日志：注册失败，失败原因
          if (msg_data.result === "accounts.user.existed") {
            msg = mcs_username_already_exists
          } else {
            msg = mcs_sign_up_failed
          }
        }
        if (msg === mcs_successful_sign_up) { // 判断返回值进行提示
          _this.publicFunc.msg_tips({
            msg: msg,
            type: 'success',
            timeout: 3000
          })
          // createPage('login', obj)
          _this.register_sign = false
          // 填入注册成功的用户名
          _this.user_val = username_value
          // 清空密码框
          _this.password_val = ''
          // 取消记住密码单选框
          _this.keep_pw = false
          // 切换回登录页面(此处后期可改成点击登录按钮事件)
        } else {
          _this.publicFunc.msg_tips({
            msg: msg,
            type: 'error',
            timeout: 3000
          })
        }
      })
    },
    choose_language_btn (lang_val) { //选择语言
      this.$chooseLanguage.lang(lang_val)
      location.reload() // 刷新页面进行语言文件重载
    },
    register_button () { //登录界面点击注册
      this.register_sign = true;
      this.register_name_val = '';
      this.register_pw_val = '';
      this.register_pw_again_val = '';
    }

  },
  watch: {
    password_val (val) { // 检测密码框中是否有隐藏密码(存在时展示显示密码图标)
      if (val.indexOf("•") === -1) {
        this.eye_sign = true
      } else {
        this.eye_sign = false
      }
    },
    "$store.state.jumpPageData.experienceFlag" (val) {
      if (val) {
        this.user_val = 'vimtag'
        this.password_val = 'vimtag'
        this.sign_in()
      } else {
        location.reload();
        console.log('error val')
      }
    }
  }
}
</script>
<style src="./index.scss" lang='scss'>
</style>