<template>
    <div id='visitor_pwd_info' class='list_right_box'>
        <div class='list_right_item'>
            <span class='attribute_key_text'> {{mcs_admin_password}} :</span>
            <input type='password' id='visitor_pwd_input' class='list_right_input' value='@M!N*T' @focus="focus_input" @blur="blur_input" v-model='admin_pwd_value'>
        </div>
        <div class='list_right_item_ex'>
            <span class='attribute_key_text'> {{mcs_guest_password}} :</span>
            <input type='password' id='new_visitor_pwd_input' class='list_right_input' value='@M!N*T' @focus="focus_input" @blur="blur_input" v-model='guest_pwd_value'>
        </div>
        <div class='list_right_item_ex'>
            <span class='attribute_key_text'> {{mcs_confirm_new_password}} :</span>
            <input type='password' id='new_visitor_pwd_input_re' class='list_right_input' value='@M!N*T' @focus="focus_input" @blur="blur_input" v-model='confirm_guest_pwd_value'>
        </div>
        <button class='list_right_button' @click="apply_btn">{{mcs_action_apply}}</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //多国语言
                mcs_admin_password: mcs_admin_password, //管理密码
                mcs_guest_password: mcs_guest_password, //访客密码
                mcs_confirm_new_password: mcs_confirm_new_password, //新密码确认
                mcs_action_apply: mcs_action_apply, //应用

                admin_pwd_value: '@M!N*T', //管理密码
                guest_pwd_value: '@M!N*T', //访客密码
                confirm_guest_pwd_value: '@M!N*T', //确认新密码
            }
        },
        methods: {
            apply_btn() { //点击应用
                if (this.$store.state.user.guest) {
                    this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                    if (this.admin_pwd_value === "amdin") {
                        this.admin_pwd_value = "admin";
                    }
                    if (this.admin_pwd_value === "@M!N*T") {
                        this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 });
                        return;
                    }
                    if (this.guest_pwd_value === "@M!N*T") {
                        this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 });
                        return;
                    }
                    if (this.guest_pwd_value === this.admin_pwd_value) {
                        this.publicFunc.msg_tips({ msg: mrs_new_password_setting_failed, type: "error", timeout: 3000 });
                        return;
                    }
                    if (this.guest_pwd_value !== this.confirm_guest_pwd_value) {
                        this.publicFunc.msg_tips({ msg: mcs_two_password_input_inconsistent + ".", type: "error", timeout: 3000 });
                        return;
                    } else {
                        let reg = /^\S{6,20}$/;
                        if (!reg.exec(this.guest_pwd_value)) {
                            this.publicFunc.msg_tips({ msg: mcs_password_demand + ".", type: "error", timeout: 3000 });
                            return;
                        }
                    }
                    this.$api.set.guest_password_set({
                        sn: this.$store.state.jumpPageData.selectDeviceIpc,
                        old_pass: this.admin_pwd_value,
                        new_pass: this.guest_pwd_value
                    }).then(res => {
                        this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                    })
                }
            },
            focus_input(e) { //若输入框内容为@M!N*T，则点击置为空
                let input_id = e.currentTarget.getAttribute('id')
                if (e.currentTarget.value === '@M!N*T') {
                    if (input_id === 'visitor_pwd_input') {
                        this.admin_pwd_value = '';
                    } else if (input_id === 'new_visitor_pwd_input') {
                        this.guest_pwd_value = '';
                    } else {
                        this.confirm_guest_pwd_value = '';
                    }
                }
            },
            blur_input(e) { //若离开输入框时内容为空，则将其置为@M!N*T
                let input_id = e.currentTarget.getAttribute('id')
                if (e.currentTarget.value === '') {
                    if (input_id === 'visitor_pwd_input') {
                        this.admin_pwd_value = '@M!N*T';
                    } else if (input_id === 'new_visitor_pwd_input') {
                        this.guest_pwd_value = '@M!N*T';
                    } else {
                        this.confirm_guest_pwd_value = '@M!N*T';
                    }
                }
            }
        }
    }
</script>

<style lang='scss'>
    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }
</style>