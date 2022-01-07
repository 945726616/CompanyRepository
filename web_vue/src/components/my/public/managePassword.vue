<template>
    <div>
        <div id='mp_lable'>
            <!-- 修改密码 用户管理密码 -->
            <div class='mp_list'>
                <div class='mp_title'> {{mcs_old_password}} </div>
                <div class='mp_input'><input id='old_password' type='password' :placeholder='mcs_input_password' v-model="old_password"></div>
                <div class='mp_password_empty' v-if='password_empty_tip.old'> {{mcs_the_password_is_empty}} </div>
                <div id='mp_updata_password_error' v-if="updata_password_error_tip"> {{mcs_invalid_password}} </div>
                <div class='mp_empty'></div>
            </div>
            <div class='mp_list'>
                <div class='mp_title'> {{mcs_input_new_pass}} </div>
                <div class='mp_input'><input id='new_password' type='password' :placeholder='mcs_input_new_pass' v-model="new_password"></div>
                <div class='mp_password_demand' v-if='password_demand_tip.new'> {{mcs_user_password_limit}} </div>
                <div class='mp_password_empty' v-if='password_empty_tip.new'> {{mcs_the_password_is_empty}} </div>
                <div class='mp_empty'></div>
            </div>
            <div class='mp_list'>
                <div class='mp_title'> {{mcs_confirm_password}} </div>
                <div class='mp_input'><input id='new_password2' type='password' :placeholder='mcs_confirm_password' v-model="confirm_password"></div>
                <div class='mp_password_demand' v-if='password_demand_tip.confirm'> {{mcs_user_password_limit}} </div>
                <div class='mp_password_empty' v-if='password_empty_tip.confirm'> {{mcs_the_password_is_empty}} </div>
                <div class='mp_password_inconsistent' v-if="password_inconsistent_tip"> {{mcs_two_password_input_inconsistent}} </div>
            </div>
            <div id='mp_btn' @click='mp_btn'> {{mcs_apply}} </div>
        </div>
        <div id='mp_updata_password' v-if="updata_password_tip"> {{mcs_state_modify_pass_success}} </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //多国语言
                mcs_old_password: mcs_old_password,
                mcs_input_password: mcs_input_password,
                mcs_the_password_is_empty: mcs_the_password_is_empty,
                mcs_invalid_password: mcs_invalid_password,
                mcs_input_new_pass: mcs_input_new_pass,
                mcs_user_password_limit: mcs_user_password_limit,
                mcs_confirm_password: mcs_confirm_password,
                mcs_two_password_input_inconsistent: mcs_two_password_input_inconsistent,
                mcs_apply: mcs_apply,
                mcs_state_modify_pass_success: mcs_state_modify_pass_success,
                mrs_new_password_setting_failed: mrs_new_password_setting_failed,

                old_password: '', //当前密码
                new_password: '', //输入新密码
                confirm_password: '', //确认密码
                password_empty_tip: { old: false, new: false, confirm: false }, //密码为空提示
                password_demand_tip: { new: false, confirm: false }, //密码格式验证提示
                password_inconsistent_tip: false, //新密码和确认密码不一致提示
                updata_password_tip: false, //密码修改成功提示
                updata_password_error_tip: false, //密码错误提示
            }
        },
        methods: {
            mp_btn() { //点击提交修改管理密码按钮
                let _this = this;
                let reg;
                if (!_this.old_password || _this.old_password == "") { // 未输入当前管理密码
                    _this.password_empty_tip.old = true; // 错误提示语句
                    setTimeout(function() {
                        _this.password_empty_tip.old = false;
                    }, 3000)
                    return;
                }
                if (!_this.new_password || _this.new_password == "") { // 未输入新管理密码
                    _this.password_empty_tip.new = true;
                    setTimeout(function() {
                        _this.password_empty_tip.new = false;
                    }, 3000)
                    return;
                }
                if (!_this.confirm_password || _this.confirm_password == "") { // 未输入确认密码
                    _this.password_empty_tip.confirm = true;
                    setTimeout(function() {
                        _this.password_empty_tip.confirm = false;
                    }, 3000)
                    return;
                } else {
                    reg = /^(?![^A-z]+$)(?!\D+$)[A-z\d]{8,32}$/; // 密码格式验证(8-32位字母数字)
                    if (!reg.exec(_this.new_password)) {
                        _this.password_demand_tip.new = true;
                        setTimeout(function() {
                            _this.password_demand_tip.new = false;
                        }, 3000)
                        return;
                    }
                }
                if (_this.new_password != _this.confirm_password) { // 两次输入的新密码不一致
                    _this.password_inconsistent_tip = true;
                    setTimeout(function() {
                        _this.password_inconsistent_tip = false;
                    }, 3000)
                    return;
                }
                if (_this.old_password === _this.new_password) { // 修改密码时新密码不能与旧密码一致
                    _this.publicFunc.msg_tips({ msg: mrs_new_password_setting_failed, type: "error", timeout: 3000 })
                    return;
                }
                _this.$api.my.account_passwd_set({ // 修改管理密码
                    old_pass: _this.old_password,
                    new_pass: _this.new_password,
                    is_guest: 0
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
        },
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    #mp_lable {
        margin-top: 100px;
    }

    .mp_list {
        width: 600px;
        padding: 0 12px;
        float: left;
        box-sizing: border-box;
        border-bottom: 1px solid #ccc;
    }

    .mp_title {
        float: left;
        /*width:250px;*/
        font-size: 16px;
        color: #333333;
        line-height: 50px;
    }

    .mp_input {
        height: 50px;
        float: right;
    }

    .mp_input input {
        margin-top: 8px;
        width: 200px;
        height: 34px;
        border-radius: 4px;
        border: 1px solid #ccc;
        outline: none;
        padding-left: 10px;
        box-sizing: border-box;
    }

    .mp_password_empty {
        font-size: 14px;
        float: right;
        line-height: 50px;
        color: #f00;
        margin-right: 10px;
    }

    #mp_updata_password_error {
        font-size: 14px;
        float: left;
        line-height: 50px;
        color: #f00;
        margin-left: 10px;
    }

    .mp_empty {
        width: 100%;
        height: 50px;
    }

    .mp_password_demand {
        font-size: 14px;
        float: right;
        line-height: 50px;
        color: #f00;
        margin-right: 10px;
    }

    .mp_password_inconsistent {
        font-size: 14px;
        float: right;
        line-height: 50px;
        color: #f00;
        margin-right: 10px;
    }

    #mp_btn {
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

    #mp_updata_password {
        color: #00A7BA;
        width: 100%;
        float: left;
        text-align: center;
    }
</style>