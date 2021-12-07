<template>
  <div>
    <div id='ae_lable'>
      <div class='ae_tips'> {{mcs_binding_email_prompt}} </div>
      <div class='ae_list'>
        <div class='ae_title'> {{mcs_email_address}} </div>
        <div class='ae_input'><input id='email_addr' type='text' :placeholder='mcs_email_address' v-model="email_addr" :disabled="bind_email_sign"></div>
      </div>
      <div id='ae_btn' v-if="!bind_email_sign" @click='bind_email_btn'> {{mcs_apply}} </div>
    </div>
    <div id='send_msg' v-if="email_verification.success"> {{mcs_binding_send_prompt}} </div>
    <div id='email_invalid' v-if='email_invalid_sign'> {{mcs_invalid_email_addr}} </div>
    <div id='ae_email_exist' v-if='email_verification.exist'> {{mcs_accounts_bind_email_exist}} </div>
    <div id='ae_email_busy' v-if='email_verification.busy'> {{mcs_accounts_bind_email_busy}} </div>
    <div id='ae_email_inactive' class='ae_email' v-if="!bind_email_sign"> {{mcs_email_inactive}} </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //多国语言
      mcs_binding_email_prompt: mcs_binding_email_prompt,
      mcs_email_address: mcs_email_address,
      mcs_apply: mcs_apply,
      mcs_binding_send_prompt: mcs_binding_send_prompt,
      mcs_invalid_email_addr: mcs_invalid_email_addr,
      mcs_accounts_bind_email_exist: mcs_accounts_bind_email_exist,
      mcs_accounts_bind_email_busy: mcs_accounts_bind_email_busy,
      mcs_email_inactive: mcs_email_inactive,

      email_addr: '', //邮箱地址
      bind_email_sign: false, //是否绑定邮箱
      email_invalid_sign: false, //邮箱是否无效
      email_verification: { success: false, exist: false, busy: false }, //邮箱验证
    }
  },
  mounted () {
    this.binding_accounts_info();
  },
  methods: {
    binding_accounts_info () { //点击绑定邮箱功能
      let appid = "vimtag.com";
      let user_info = eval("(" + localStorage.getItem("remember_msg_info") + ")")
      // this.$api.login.binding_email_get({
      //     username: user_info.user,
      //     appid: appid
      // }).then(res => {
      //     if (res && res.data.email !== "") {
      //         if (res.data.active_email) {
      //             this.email_addr = res.data.email;
      //             this.bind_email_sign = true;
      //         } else {
      //             this.email_addr = res.data.email;
      //             this.bind_email_sign = false;
      //         }
      //     } else {
      //         return;
      //     }
      // })
      this.$api.my.get_user_email({
        username: user_info.user,
        appid: appid
      }).then(res => {
        if (res && res.data.email !== "") {
          if (res.data.active_email) {
            this.email_addr = res.data.email;
            this.bind_email_sign = true;
          } else {
            this.email_addr = res.data.email;
            this.bind_email_sign = false;
          }
        } else {
          return;
        }
      })
    },
    bind_email_btn () { //点击绑定邮箱应用
      let _this = this;
      let email_reg = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (!_this.email_addr || _this.email_addr == '' || !email_reg.test(_this.email_addr)) {
        _this.email_invalid_sign = true;
        setTimeout(function () {
          _this.email_invalid_sign = false;
        }, 3000)
        return;
      }
      let appid = "vimtag.com";
      let user_info = eval("(" + localStorage.getItem("remember_msg_info") + ")")
      _this.$api.my.binding_email({
        email: _this.email_addr,
        user: user_info.user,
        pass: user_info.password,
        appid: appid,
        lang: _this.$store.state.user.userLanguage
      }).then(res => {
        if (res && res.result == '') {
          _this.email_verification.success = true;
          setTimeout(function () {
            _this.email_verification.success = false;
          }, 5000)
        } else if (res.result == "accounts.bind.email.exist") {
          _this.email_verification.exist = true;
          setTimeout(function () {
            _this.email_verification.exist = false;
          }, 5000)
        } else if (res.result == "accounts.bind.email.busy") {
          _this.email_verification.busy = true;
          setTimeout(function () {
            _this.email_verification.busy = false;
          }, 5000)
          return;
        }
      })
    },
  }
}
</script>

<style lang='scss'>
@import '../../../css/public.scss';

#ae_lable {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  // width:80%;
}

.ae_tips {
  margin-top: 100px;
  margin-left: 12px;
  float: left;
  font-size: 14px;
  color: #999;
}

.ae_list {
  width: 600px;
  padding: 0 12px;
  float: left;
  box-sizing: border-box;
  border-bottom: 1px solid #ccc;
}

.ae_title {
  float: left;
  width: 150px;
  height: 50px;
  font-size: 16px;
  color: #333333;
  line-height: 50px;
}

.ae_input {
  height: 50px;
  float: right;
}

.ae_input input {
  margin-top: 8px;
  width: 200px;
  height: 34px;
  border-radius: 4px;
  border: 1px solid #ccc;
  padding-left: 10px;
  box-sizing: border-box;
  outline: none;
}

#ae_btn {
  // float: right;
  width: 120px;
  height: 30px;
  border-radius: 4px;
  color: #fff;
  background: $projectColor;
  text-align: center;
  line-height: 30px;
  margin-top: 60px;
  cursor: pointer;
  align-self: center;
}

#send_msg {
  color: #00a7ba;
  float: left;
  width: 100%;
  text-align: center;
}

#email_invalid {
  color: #f00;
  float: left;
  width: 100%;
  text-align: center;
}

#ae_email_exist {
  color: #f00;
  float: left;
  width: 100%;
  text-align: center;
}

#ae_email_busy {
  color: #f00;
  float: left;
  width: 100%;
  text-align: center;
}

#ae_email_inactive {
  color: #f00;
  float: left;
  width: 100%;
  text-align: center;
}
</style>