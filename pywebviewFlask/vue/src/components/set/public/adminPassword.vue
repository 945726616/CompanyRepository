<template>
  <div id='admin_pwd_info' class='list_right_box'>
    <div class='list_right_item'>
      <span class='attribute_key_text'> {{ mcs_admin_password }} :</span>
      <input type='password' id='admin_pwd_input' class='list_right_input' v-model='admin_pwd_value'
        :placeholder="mcs_hint_password_old">
    </div>
    <div class='list_right_item_ex'>
      <span class='attribute_key_text'> {{ mcs_new_password }} :</span>
      <input type='password' id='new_admin_pwd_input' class='list_right_input' v-model='new_admin_pwd_value'
        :placeholder="mcs_hint_password_new">
    </div>
    <div class='list_right_item_ex'>
      <span class='attribute_key_text'> {{ mcs_confirm_new_password }} :</span>
      <input type='password' id='new_admin_pwd_input_re' class='list_right_input' v-model='confirm_admin_pwd_value'
        :placeholder="mcs_hint_password_new_again">
    </div>
    <button class='list_right_button' @click="apply_btn">{{ mcs_action_apply }}</button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      //多国语言
      mcs_admin_password: mcs_admin_password, //管理密码
      mcs_new_password: mcs_new_password, //新密码
      mcs_confirm_new_password: mcs_confirm_new_password, //新密码确认
      mcs_action_apply: mcs_action_apply, //应用
      mcs_hint_password_old: mcs_hint_password_old, // 请输入旧密码
      mcs_hint_password_new: mcs_hint_password_new, // 请输入新的密码
      mcs_hint_password_new_again: mcs_hint_password_new_again, // 请再次输入新密码

      admin_pwd_value: '', //管理密码
      new_admin_pwd_value: '', //新密码
      confirm_admin_pwd_value: '', //确认新密码
    }
  },
  methods: {
    apply_btn () { //点击应用
      if (this.admin_pwd_value === "amdin") {
        this.admin_pwd_value = "admin"
      }
      if (this.admin_pwd_value === "") {
        this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 })
        return
      }
      if (this.new_admin_pwd_value === "") {
        this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 })
        return
      }
      if (this.new_admin_pwd_value === this.admin_pwd_value) {
        this.publicFunc.msg_tips({ msg: mrs_new_password_setting_failed, type: "error", timeout: 3000 })
        return
      }
      if (this.new_admin_pwd_value !== this.confirm_admin_pwd_value) {
        this.publicFunc.msg_tips({ msg: mcs_two_password_input_inconsistent + ".", type: "error", timeout: 3000 })
        return
      } else {
        let reg = /^[0-9A-Za-z]{6,20}$/;
        if (!reg.exec(this.new_admin_pwd_value)) {
          this.publicFunc.msg_tips({ msg: mcs_password_demand + ".", type: "error", timeout: 3000 })
          return
        }
      }
      this.$api.set.admin_password_set({
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        old_pass: this.admin_pwd_value,
        new_pass: this.new_admin_pwd_value
      }).then(res => {
        console.log(res, 'set_res')
        if (res.type === 'success') { // 设置成功清空输入框
          this.admin_pwd_value = ''
          this.new_admin_pwd_value = ''
          this.confirm_admin_pwd_value = ''
        }
        this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
      })
    },
  }
}
</script>

<style lang='scss'>
.list_right_box {
  width: 520px;
  margin: 0 auto;
}
</style>