<template>
    <div>
        <div id='gp_lable'>
            <div class='gp_list'>
                <div class='gp_title'> {{mcs_admin_password}} </div>
                <div class='gp_input'><input id='guest_pw' type='password' :placeholder='mcs_admin_password' v-model="manage_password"></div>
                <div class='gp_password_empty' v-if='password_empty_tip.manage'> {{mcs_the_password_is_empty}} </div>
                <div id='gp_updata_password_error' v-if='updata_password_error_tip'> {{mcs_invalid_password}} </div>
                <div class='gp_empty'></div>
            </div>
            <div class='gp_list'>
                <div class='gp_title'> {{mcs_guest_password}} </div>
                <div class='gp_input'><input id='guest_pw1' type='password' :placeholder='mcs_guest_password' v-model='guest_password'></div>
                <div class='gp_password_empty' v-if='password_empty_tip.guest'> {{mcs_the_password_is_empty}} </div>
                <div class='gp_password_demand' v-if='password_demand_tip.guest'> {{mcs_user_password_limit}} </div>
                <div class='gp_empty'></div>
            </div>
            <div class='gp_list'>
                <div class='gp_title'> {{mcs_confirm_password}} </div>
                <div class='gp_input'><input id='guest_pw2' type='password' :placeholder='mcs_confirm_password' v-model='confirm_password'></div>
                <div class='gp_password_empty' v-if='password_empty_tip.confirm'> {{mcs_the_password_is_empty}} </div>
                <div class='gp_password_demand' v-if='password_demand_tip.confirm'> {{mcs_user_password_limit}} </div>
                <div class='gp_password_inconsistent' v-if='password_inconsistent_tip'> {{mcs_two_password_input_inconsistent}} </div>
            </div>
            <div id='gp_btn' @click="gp_btn"> {{mcs_apply}} </div>
        </div>
        <div id='gp_updata_password' v-if='updata_password_tip'> {{mcs_state_modify_pass_success}} </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //多国语言
                mcs_admin_password: mcs_admin_password,
                mcs_the_password_is_empty: mcs_the_password_is_empty,
                mcs_invalid_password: mcs_invalid_password,
                mcs_guest_password: mcs_guest_password,
                mcs_user_password_limit: mcs_user_password_limit,
                mcs_confirm_password: mcs_confirm_password,
                mcs_two_password_input_inconsistent: mcs_two_password_input_inconsistent,
                mcs_apply: mcs_apply,
                mcs_state_modify_pass_success: mcs_state_modify_pass_success,
                mcs_permission_denied: mcs_permission_denied,

                manage_password: '', //管理密码
                guest_password: '', //访客密码
                confirm_password: '', //确认密码
                password_empty_tip: { manage: false, guest: false, confirm: false }, //密码为空提示
                password_demand_tip: { guest: false, confirm: false }, //密码格式验证提示
                password_inconsistent_tip: false, //新密码和确认密码不一致提示
                updata_password_tip: false, //密码修改成功提示
                updata_password_error_tip: false, //密码错误提示
            }
        },
        methods: {
            gp_btn() { // 点击提交访客密码按钮
                let _this = this;
                if (_this.$store.state.user.guest) {
                    _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                    let reg;
                    if (!_this.manage_password || _this.manage_password == "") { // 输入为空判断提示
                        _this.password_empty_tip.manage = true;
                        setTimeout(function() {
                            _this.password_empty_tip.manage = false;
                        }, 3000);
                        return;
                    }
                    if (!_this.guest_password || _this.guest_password == "") { // 输入为空判断提示
                        _this.password_empty_tip.guest = true;
                        setTimeout(function() {
                            _this.password_empty_tip.guest = false;
                        }, 3000)
                        return;
                    } else {
                        reg = /^\S{6,20}$/;
                        if (!reg.exec(_this.guest_password)) { // 访客密码校验
                            _this.password_demand_tip.guest = true;
                            setTimeout(function() {
                                _this.password_demand_tip.guest = false;
                            }, 3000)
                            return;
                        }
                    }
                    if (!_this.confirm_password || _this.confirm_password == "") { // 输入为空判断提示
                        _this.password_empty_tip.confirm = true;
                        setTimeout(function() {
                            _this.password_empty_tip.confirm = false;
                        }, 3000)
                        return;
                    }
                    if (_this.guest_password != _this.confirm_password) { // 两次访客密码输入不一致
                        _this.password_inconsistent_tip = true;
                        setTimeout(function() {
                            _this.password_inconsistent_tip = false;
                        }, 3000)
                        return;
                    }
                    if (_this.guest_password === _this.manage_password) { // 输入的访客密码与管理密码一致
                        _this.publicFunc.msg_tips({ msg: mrs_guest_password_setting_failed, type: "error", timeout: 3000 })
                        return;
                    }
                    _this.$api.my.account_passwd_set({ // 修改访客密码
                        old_pass: _this.manage_password,
                        new_pass: _this.confirm_password,
                        is_guest: 1
                    }).then(res => {
                        if (!res.result) {
                            _this.updata_password_tip = true;
                            setTimeout(function() {
                                _this.updata_password_tip = true;
                            }, 3000)
                        } else if (res.result == "accounts.pass.invalid") {
                            _this.updata_password_error_tip = true;
                            setTimeout(function() {
                                _this.updata_password_error_tip = false;
                            }, 3000)
                        }
                    })
                }
            }
        }
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    #gp_lable {
        margin-top: 100px;
    }

    .gp_list {
        width: 600px;
        padding: 0 12px;
        float: left;
        box-sizing: border-box;
        border-bottom: 1px solid #ccc;
    }

    .gp_title {
        float: left;
        width: 250px;
        font-size: 16px;
        color: #333333;
        line-height: 50px;
    }

    .gp_input {
        height: 50px;
        float: right;
    }

    .gp_input input {
        margin-top: 8px;
        width: 200px;
        height: 34px;
        border-radius: 4px;
        border: 1px solid #ccc;
        outline: none;
        padding-left: 10px;
        box-sizing: border-box;
    }

    .gp_empty {
        width: 100%;
        height: 50px;
    }

    #gp_btn {
        float: right;
        width: 120px;
        height: 30px;
        border-radius: 4px;
        color: #fff;
        background: $projectColor;
        text-align: center;
        line-height: 30px;
        margin-top: 60px;
        cursor: pointer;
    }

    #gp_updata_password {
        color: #00A7BA;
        width: 100%;
        float: left;
        text-align: center;
    }

    #gp_updata_password_error {
        font-size: 14px;
        float: left;
        line-height: 50px;
        color: #f00;
        margin-left: 10px;
    }

    .gp_password_empty {
        font-size: 14px;
        float: left;
        line-height: 50px;
        color: #f00;
        margin-left: 10px;
    }

    .gp_password_demand {
        font-size: 14px;
        float: left;
        line-height: 50px;
        color: #f00;
        margin-left: 10px;
    }

    .gp_password_inconsistent {
        font-size: 14px;
        float: left;
        line-height: 50px;
        color: #f00;
        margin-left: 10px;
    }
</style>