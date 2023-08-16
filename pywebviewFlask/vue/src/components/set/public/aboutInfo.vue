<template>
    <div id='about_info' class='list_right_box'>
        <!-- 修改昵称 -->
        <div>
            <div class='dev_nick_modify'>{{mcs_nick_modify}}</div>
            <div class='list_right_item_ex'>
                <span class='attribute_key_text'> {{mcs_nickname}} :</span>
                <input type='text' id='dev_name_input' class='list_right_input' v-model='nickname' @focus="focus_input" @blur="blur_input">
            </div>
        </div>
        <!-- 设备型号等信息 -->
        <div class='dev_model'>
            <div class='list_right_item'>
                <span class='attribute_key_text'> {{mcs_model}} </span>
                <span class='attribute_value_text'>{{about_info.model}}</span>
            </div>
            <div class='list_right_item' style='display:none;'>
                <span class='attribute_key_text'> {{mcs_manufacturer}} </span>
                <span class='attribute_value_text'></span>
            </div>
            <div class='list_right_item'>
                <span class='attribute_key_text'> {{mcs_firmware_version}} </span>
                <span class='attribute_value_text'>{{about_info.ver}}</span>
            </div>
            <!-- <div class='list_right_item'>
                <span class='attribute_key_text'> {{mcs_plugin_version}} </span>
                <span class='attribute_value_text'>{{about_info.plugin_version}}</span>
            </div> -->
            <div class='list_right_item'>
                <span class='attribute_key_text'> {{mcs_device_id}} </span>
                <span class='attribute_value_text'>{{about_info.sn}}</span>
            </div>
            <div class='list_right_item' style='display:none;' id='dev_sensor'>
                <span class='attribute_key_text'> {{mcs_sensor_status}} </span>
                <span class='attribute_value_text'> {{mcs_fault}} </span>
            </div>
        </div>
        <button class='list_right_button' @click="apply_btn">{{mcs_action_apply}}</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //多国语言
                mcs_model: mcs_model, //型号
                mcs_manufacturer: mcs_manufacturer, //厂商
                mcs_firmware_version: mcs_firmware_version, //固件版本
                mcs_plugin_version: mcs_plugin_version, //插件版本
                mcs_device_id: mcs_device_id, //设备ID
                mcs_sensor_status: mcs_sensor_status, //Sensor状态
                mcs_fault: mcs_fault, //故障
                mcs_nickname: mcs_nickname, //设备昵称
                mcs_action_apply: mcs_action_apply, //应用
                mcs_nick_modify: mcs_nick_modify, //修改昵称

                nickname: '', //设备昵称
                about_info: { //关于信息
                    model: '',
                    ver: '',
                    plugin_version: '',
                    sn: ''
                }
            }
        },
        mounted() {
            this.$api.set.nickname_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                this.nickname = res.nick
            })

            this.$api.set.about({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                if (res.check_ver) {
                    this.$emit('system_new_event', true)
                }
                this.about_info.model = res.model;
                this.about_info.ver = res.ver;
                this.about_info.plugin_version = res.plugin_version ? res.plugin_version : mcs_not_installed;
                this.about_info.sn = res.sn;
            })
        },
        methods: {
            focus_input() { //点击输入框
                if (this.nickname == this.$store.state.jumpPageData.selectDeviceIpc) {
                    this.nickname = "";
                }
            },
            blur_input() { //离开输入框
                if (this.nickname == "") {
                    this.nickname = this.$store.state.jumpPageData.selectDeviceIpc;
                }
            },
            apply_btn() { //点击应用
                if (this.nickname != mcs_input_nick) {
                    let reg = /['|"|<|>|+]/g;
                    if (this.nickname.search(reg) > -1) {
                        this.publicFunc.msg_tips({ msg: mrs_enter_contain_illegal_characters, type: 'error', timeout: 3000 });
                    } else {
                        this.$api.set.nickname_set({ sn: this.$store.state.jumpPageData.selectDeviceIpc, name: this.nickname }).then(res => {
                            this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                        })
                    }
                }
            }
        }
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }

    .attribute_value_text {
        float: right;
        font-size: 14px;
        margin-right: 10px;
        color: $projectColor;
    }

    .dev_nick_modify {
        color: #000;
        padding-bottom: 10px;
        border-bottom: 1px solid #c0c0c0;
    }

    .dev_model {
        margin-top: 20px;
    }
</style>