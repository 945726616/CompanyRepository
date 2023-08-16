<template>
    <div id='system' class='list_right_box'>
        <div :class='project_flag?"system_class list_right_item":"list_right_item"' v-if='system_upgrade_div_sign'>
            <!-- 在线升级 -->
            <div class='options_float_left' id='system_upgrade_left' :style='language === "ja" || language === "ru"?"width:132px":""'>{{system_upgrade_left}}</div>
            <div id='system_upgrade_div' class='options_float_right options_float_right_button'>
                <div v-if='system_upgrade_sign'>
                    <div :style='language === "vi" || language === "ja"?"width:242px;float:left;margin-right:8px;":"width:233px;float:left;margin-right:8px;"'> {{mcs_new_version}} {{ver_valid}} {{mcs_valid}} </div>
                    <div style='padding-top:20px;float:left'>
                        <div id='Detail_id'></div>
                    </div>
                    <button class='list_right_button_ex' @click='system_upgrade_btn'> {{mcs_upgrade}} </button>
                </div>
                <div v-else>{{system_upgrade_div}}</div>
            </div>
        </div>
        <div :class='project_flag?"system_class list_right_item":"list_right_item"' v-if='networkEnviron === "private"'>
            <!-- ？上传升级 -->
            <div class='options_float_left'> {{mcs_upload_upgrade}} </div>
            <div id='file_upload_div' class='options_float_right' style='position:relative;right:40px;top:10px;cursor:pointer;'></div>
        </div>
        <div id='activation_div' :class='project_flag?"system_class list_right_item":"list_right_item"' v-if='activation_div_sign'>
            <div class='options_float_left'> {{mcs_activation}} </div>
            <div class='options_float_right'>
                <input type='text' id='input_activation' class='vimtag_service_address' v-model='input_activation' />
                <button id='button_activation' class='list_right_button_ex' @click='activation_btn'> {{mcs_activate}} </button>
            </div>
        </div>
        <div :class='project_flag?"system_class list_right_item":"list_right_item"'>
            <!-- 恢复出厂设置 -->
            <div class='options_float_left'> {{mcs_restore_the_factory_settings}} </div>
            <div class='options_float_right options_float_right_button'>
                <button id='button_restore_default_settings' class='list_right_button_ex' @click='restore_btn'> {{mcs_restore}} </button>
            </div>
        </div>
        <div :class='project_flag?"system_class list_right_item":"list_right_item"'>
            <!-- 重启 -->
            <div class='options_float_left'> {{mcs_restore_camera}} </div>
            <div class='options_float_right options_float_right_button'>
                <button id='button_restart_device' class='list_right_button_ex' @click="restart_btn"> {{mcs_reboot}} </button>
            </div>
        </div>
    </div>
</template>

<script>
    import CanvasLoader from '@/lib/plugins/heartcode-canvasloader.js'
    export default {
        data() {
            return {
                //多国语言
                mcs_upload_upgrade: mcs_upload_upgrade, //上传升级
                mcs_activation: mcs_activation, //激活码
                mcs_activate: mcs_activate, //激活
                mcs_restore_the_factory_settings: mcs_restore_the_factory_settings, //恢复出厂设置
                mcs_restore_camera: mcs_restore_camera, //设备重启
                mcs_restore: mcs_restore, //恢复
                mcs_reboot: mcs_reboot, //重启
                mcs_new_version: mcs_new_version, //有新版本
                mcs_valid: mcs_valid, //启用
                mcs_upgrade: mcs_upgrade, //升级

                networkEnviron: '',
                project_flag: 0, //是否为vimtag
                language: '', //语言
                extra_timer: 1,
                system_upgrade_div_sign: true, //系统升级是否显示
                activation_div_sign: true, //激活选项是否显示
                input_activation: '', //激活码
                system_upgrade_div: '', //系统升级文本
                system_upgrade_left: '', //系统升级左侧文本
                system_upgrade_sign: false, //是否可以升级
                ver_valid: '', //版本号
            }
        },
        mounted() {
            this.project_flag = this.$store.state.jumpPageData.projectFlag;
            this.language = this.$store.state.user.userLanguage;
            this.networkEnviron = this.$store.state.jumpPageData.networkEnviron;

            if (this.$store.state.jumpPageData.selectDeviceIpc.substr(0, 3) != "166") {
                this.activation_div_sign = false;
            }
            this.$api.set.upgrade_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
                res.check_ver = 1
                this.system_dev_upgrade_get_ack(res)
            })
        },
        methods: {
            activation_btn() { //激活
                this.$api.set.dev_activate({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc,
                    activationCode: this.input_activation
                })
            },
            restore_btn() { //恢复出厂
                this.publicFunc.delete_tips({
                    content: mcs_restore_factory_settings_prompt + "<br><input type='checkbox' id='save_configuration' checked='checked'>&nbsp;" + mcs_keep_network_settings,
                    func: () => {
                        if (document.getElementById("save_configuration").checked) {
                            this.$api.set.reset_device({ sn: this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 1 }).then(res => {
                                setTimeout(() => {
                                    this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                                    this.$router.push({ name: 'devlist' })
                                }, 3000)
                            })
                        } else {
                            this.$api.set.reset_device({ sn: this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 0 }).then(res => {
                                setTimeout(() => {
                                    this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                                    this.$router.push({ name: 'devlist' })
                                }, 3000)
                            })
                        }
                    }
                });
            },
            restart_btn() { //重启
                this.publicFunc.delete_tips({
                    content: mcs_restart_prompt,
                    func: () => {
                        this.$api.set.reboot_device({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                            setTimeout(() => {
                                this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                                this.$router.push({ name: 'devlist' })
                            }, 3000)
                        })
                    }
                });
            },
            system_dev_upgrade_get_ack(msg) {
                if (null == this.$store.state.jumpPageData.systemWaitDiv) {
                    let g_system_wait_div = (str) => {
                        let wait_div = this.publicFunc.mx("#system_wait_div");
                        let wait_display_div;
                        let l_page = this.publicFunc.mx("#system_upgrade_div");
                        let l_client_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                        // let l_client_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                        let l_client_w = this.publicFunc.mx("#create_setting_page_right").offsetWidth;
                        if (!wait_div) {

                            document.documentElement.onkeydown = function(e) { let evt = e || window.event; if (evt.keyCode != 116) return false; };
                            wait_div = document.createElement("div");
                            wait_div.setAttribute("id", "system_wait_div");
                            l_page.parentNode.appendChild(wait_div);
                            // wait_display_div = document.createElement("div")
                            // wait_display_div.setAttribute("id", "system_wait_display_div");
                            // l_page.parentNode.appendChild(wait_display_div);
                            wait_div.style.cssText = "float:right;background-color:#fff;" +
                                "filter:alpha(opacity=10);z-index:100";
                            // wait_display_div[s_style][s_cssText] = "top:" + (l_client_h / 3) + "px;left:" + (l_client_w / 2) + "px";
                            wait_div.innerHTML =
                                "<div id='cl_wait_div' style='text-align:center'></div>"
                            // +"<div id='cl_str_div' style='padding-left:10px;padding-top:10px;font-weight:900;font-size:18px;color:#EEE'>" + str + "</div>";

                            let cl = new CanvasLoader("cl_wait_div", { id: "canvasLoader", safeVML: true });
                            cl.setColor('#8bb238');
                            cl.setDiameter(36);
                            cl.setDensity(43);
                            cl.setRange(1.1);
                            cl.show();
                        }
                    }
                    this.$store.dispatch('setSystemWaitDiv', g_system_wait_div)
                }
                if (null == this.$store.state.jumpPageData.systemStopWait) {
                    let g_system_stop_wait = (str) => {
                        let wait_div = this.publicFunc.mx("#system_wait_div");
                        let wait_display_div = this.publicFunc.mx("#system_wait_display_div");

                        document.documentElement.onkeydown = null;
                        if (wait_div) {
                            wait_div.innerHTML = "";
                            wait_div.parentNode.removeChild(wait_div);
                            wait_div = null;
                        }
                        if (wait_display_div) {
                            wait_display_div.innerHTML = "";
                            wait_display_div.parentNode.removeChild(wait_display_div);
                            wait_display_div = null;
                        }
                    }
                    this.$store.dispatch('setSystemStopWait', g_system_stop_wait)
                }
                let msg_status = msg.status;
                if (msg.check_ver && msg_status == "fail") {
                    msg_status = "free";
                }
                if (msg.type == "online" && msg_status == "") {
                    this.system_upgrade_div = mcs_already_latest_version;
                } else if (msg_status == "fail") {
                    this.publicFunc.msg_tips({ msg: mcs_fail + ":" + msg.remark, type: "error", timeout: 3000 })
                } else if (msg_status != "free" && msg_status != "" && msg_status != "finish") {
                    let wait_div = this.publicFunc.mx("#system_wait_div");
                    let str_div = this.publicFunc.mx("#cl_str_div");
                    let extra = "";
                    setTimeout(() => {
                        this.$api.set.upgrade_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                            this.system_dev_upgrade_get_ack(res)
                        })
                    }, 1000);
                    this.system_upgrade_div = mcs_upgrading + "...";
                    if (!wait_div) {
                        this.$store.state.jumpPageData.systemWaitDiv("");
                    } else {
                        for (let i = 1; i <= this.extra_timer; ++i) {
                            extra += "."
                        }
                        this.extra_timer = ++this.extra_timer > 3 ? 1 : this.extra_timer;
                        if (str_div) {
                            if (msg_status == "download") {
                                str_div.innerHTML = mcs_downloading + extra;
                            } else if (msg_status == "erase") {
                                str_div.innerHTML = mcs_erasing + extra;
                            } else if (msg_status == "write") {
                                str_div.innerHTML = mcs_writing + " " + msg.progress + "%"; //Download shows the percentage
                            }
                        }
                    }
                } else if (msg.check_ver && msg_status == "finish") { //发现降级升级时 没有download 直接返回finish
                    this.publicFunc.delete_tips({
                        content: mcs_upgrade_successful_restart_to_take_effect,
                        func: () => {
                            this.$api.set.reboot_device({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                                setTimeout(() => {
                                    this.$router.push({ name: 'devlist' });
                                }, 1000);
                            })
                        }
                    })
                } else {
                    this.$store.state.jumpPageData.systemStopWait();
                    this.extra_timer = 1;
                    if (msg.check_ver) {
                        if (msg.ver_current < "12.09.13.04.04") {
                            this.system_upgrade_div_sign = false;
                        }
                        if ((msg.ver_valid.length != 0 && msg.ver_current.length != 0 && msg.ver_valid != msg.ver_current) || (msg.ext_prj != msg.ext_hw && msg.ext_hw.length != 0)) {
                            this.system_upgrade_sign = true
                            this.system_upgrade_left = mcs_online_upgrade
                            this.ver_valid = msg.ver_valid;
                            // document.getElementById("Detail_id").onclick = function() { //未知用法，先注释
                            //     $(l_dom_detail_div_page).toggle();
                            //     $("#detail_div_inner").mCustomScrollbar("update");
                            // }
                            // document.getElementById("Detail_id").style.display = 'none';
                        } else {
                            this.system_upgrade_left = mcs_online_upgrade;
                            this.system_upgrade_div = mcs_already_latest_version;
                        }
                    } else {
                        this.publicFunc.delete_tips({
                            content: mcs_upgrade_successful_restart_to_take_effect,
                            func: () => {
                                this.$api.set.reboot_device({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                                    setTimeout(() => {
                                        this.$router.push({ name: 'devlist' });
                                    }, 1000);
                                })
                            }
                        })
                    }
                }
            },
            system_upgrade_btn() { //系统升级
                let img_ver = this.$api.devlist.ldev_get(this.$store.state.jumpPageData.selectDeviceIpc).img_ver;
                let valid_ver = this.ver_valid;
                let ver_update_warn = "";
                this.$api.set.desc_get({
                    ver_type: "windows",
                    ver_from: img_ver,
                    ver_to: this.ver_valid,
                    lang: this.$store.state.user.userLanguage
                }).then(res => {
                    if (res.result === '') {
                        if (res.data.desc) {
                            for (let i = 0; i < res.data.desc.length; i++) {
                                ver_update_warn += res.data.desc[i] + "<br>";
                            }
                        }
                        this.publicFunc.delete_tips({
                            content: (ver_update_warn ? ver_update_warn : (mcs_upgrade_to_the_latest_version + valid_ver)),
                            func: () => {
                                this.system_upgrade_sign = false;
                                this.$api.set.upgrade_set({
                                    sn: this.$store.state.jumpPageData.selectDeviceIpc,
                                    check: 1
                                }).then(() => {
                                    this.$api.set.upgrade_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
                                        this.system_dev_upgrade_get_ack(res)
                                    })
                                })
                            }
                        })
                    }
                })

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