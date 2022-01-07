<template>
    <div id="storage_device_info" class='list_right_box'>
        <div class="list_right_item">
            <div class="options_float_left">{{ mcs_enabled }}</div>
            <div class="options_float_right" style="margin-top: 0px">
                <switch-button v-model='storage_device_sign' @data_updata_event='storage_device_updata'></switch-button>
            </div>
        </div>
        <div id="storage_device_content">
            <div class="list_right_item_ex">
                <div class="options_float_left">{{ mcs_device_id }}</div>
                <div class="options_float_right">
                    <input type="text" id="input_device_id" class="list_right_input" v-model='input_device_id' />
                </div>
            </div>
            <div class="list_right_item_ex">
                <div class="options_float_left">
                    <label for="input_password"> {{ mcs_password }} </label>
                </div>
                <div class="options_float_right">
                    <input type="password" name="input_password" id="input_password" class="list_right_input" v-model='input_password' />
                </div>
            </div>
            <div class="list_right_item_ex">
                <div class="options_float_left">{{ mcs_network_status }}</div>
                <div class="options_float_right">
                    <input type="text" id="input_status" :value="input_status" class="input_read_only" disabled />
                </div>
            </div>
        </div>
        <button id="storage_device_button_setup" class="list_right_button" @click='storage_device_button_setup_btn'>
            {{ mcs_apply }}
        </button>
    </div>
</template>

<script>
    import SwitchButton from '@/module/switchButton'
    export default {
        data() {
            return {
                //多国语言
                mcs_enabled: mcs_enabled, //启用状态
                mcs_device_id: mcs_device_id, //设备ID
                mcs_password: mcs_password, //密码
                mcs_network_status: mcs_network_status, //连接状态
                mcs_apply: mcs_apply, //应用

                input_device_id: '', //设备ID
                input_password: '', //密码
                input_status: mcs_not_connected, //连接状态
                storage_device_sign: '', //控制是否启用存储设备
            };
        },
        mounted() {
            this.$api.set.storage_device_get({ box_sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                this.input_device_id = res.conf.conf[0].username; //show the BOX ID
                this.input_password = res.conf.conf[0].password; //show the BOX  password
                if (res.conf.connect == 1) {
                    this.input_status = mcs_connnected;
                }
                if (res.conf.conf[0].enable == 0) {
                    this.storage_device_sign = false;
                }
            })
        },
        methods: {
            storage_device_button_setup_btn() { //应用
                let flag = Number(this.storage_device_sign);
                if (flag) {
                    if (this.input_device_id == '') {
                        this.publicFunc.msg_tips({ msg: mcs_blank_device_id, type: "warning", timeout: 3000 })
                        return;
                    }
                    if (this.input_password == '') {
                        this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty, type: "warning", timeout: 3000 })
                        return;
                    } else {
                        let reg = /^\S{6,20}$|admin/;
                        if (!reg.exec(this.input_password)) {
                            this.publicFunc.msg_tips({ msg: mcs_password_demand, type: "warning", timeout: 3000 })
                            return;
                        }
                    }
                }
                this.$api.set.storage_device_set({
                    box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                    enable: flag,
                    username: this.input_device_id,
                    password: this.input_password
                }).then(res => {
                    this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                })
            },
            storage_device_updata(data) { //更新存储设备按钮
                this.storage_device_sign = data;
            }
        },
        watch: {
            storage_device_sign(val) {
                if (val) {
                    document.getElementById("storage_device_content").style.display = "inline";
                } else {
                    $("#storage_device_content").fadeOut();
                }
            }
        },
        components: {
            SwitchButton
        }
    };
</script>

<style lang='scss'>
    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }
</style>