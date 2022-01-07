<template>
    <div id='my'>
        <div id='set_main'>
            <div id='set_left'>
                <ul id='left_ul'>
                    <li :class='my_enter_list.about?"set_list active_list":"set_list"' @click='enter_page'>
                        <div class='set_img' id='about'></div>
                        <div class='set_name'> {{mcs_software_version}} </div>
                    </li>
                    <li :class='my_enter_list.manage_password?"set_list active_list":"set_list"' v-if='login_sign' @click='enter_page'>
                        <div class='set_img' id='manage_password'></div>
                        <div class='set_name'> {{mcs_user_admin_password}} </div>
                    </li>
                    <li :class='my_enter_list.add_email?"set_list active_list":"set_list"' v-if='login_sign' @click='enter_page'>
                        <div class='set_img' id='add_email'></div>
                        <div class='set_name'> {{mcs_binding_email}} </div>
                    </li>
                    <li :class='my_enter_list.feedback?"set_list active_list":"set_list"' style="display:none">
                        <div class='set_img' id='feedback'></div>
                        <div class='set_name'> {{mcs_feedback}} </div>
                    </li>
                    <li :class='my_enter_list.sd_export?"set_list active_list":"set_list"' id='sd_export_hide' style='display:none'>
                        <div class='set_img' id='sd_export' :style="my_enter_list.sd_export?'background:url('+require('@/assets/device/c-sd.png')+') no-repeat':'background:url('+require('@/assets/device/sd.png')+') no-repeat'"></div>
                        <div class='set_name'> {{mcs_export_sd_data}} </div>
                    </li>
                    <li class='set_list' style='display:none'>
                        <div class='set_img' id='error_log_commit'></div>
                        <div class='set_name'>{{mcs_erro_diagnosis}}</div>
                    </li>
                    <li :class='my_enter_list.local_devs?"set_list active_list":"set_list"' id='local_div_hide' style='display:none'>
                        <div class='set_img' id='local_devs'></div>
                        <div class='set_name' id='local_div'> {{mcs_local_device}} </div>
                    </li>
                    <li :class='my_enter_list.exit_btn_img?"set_list active_list":"set_list"' v-if='login_sign' @click='enter_page'>
                        <div class='set_img' id='exit_btn_img'></div>
                        <div class='set_name' id='exit_btn'> {{mcs_exit}} </div>
                    </li>
                </ul>
                <div id='mme_select_path' style='width:1px;height:1px;' ref='mme_select_path'></div>
            </div>
            <div id='set_right'>
                <div id='set_right_content'>
                    <div id='set_manage_password_page' class='set_page' v-if='my_enter_list.manage_password'>
                        <manage-password></manage-password>
                    </div>
                </div>
                <div id='set_add_email_page' class='set_page' v-if='my_enter_list.add_email'>
                    <add-email></add-email>
                </div>
                <div id='set_feedback_page' class='set_page' v-if='my_enter_list.feedback'>
                    <iframe style='display:block;' id='feedback_ifr' :src='feedback_url'></iframe>
                </div>
                <!-- sd export -->
                <div id='set_sd_export_page' class='set_page' v-if='my_enter_list.sd_export'>
                    <div id='export_success_icon'>Export success</div>
                    <div id='notice_content'>Please remove SD card in equipment, through the card reader connected to the computer, and then select the export path below, click on the export. The export process may be stuck, please do not close the program.Note: please don't formatted SD card</div>
                    <div id='progress_bar_div'>
                        <div id='progress_bar_box' style='display:none;'>
                            <div id='progress_bar'></div>
                        </div>
                        <span id='progress_bar_num'></span>
                    </div>
                    <div id='sd_export_box'>
                        <div id='sd_export_path'>
                            <div id='sd_export_path_show'></div>
                            <div id='sd_export_path_btn'>Select Path</div>
                        </div>
                        <div id='sd_export_submit'>Export data</div>
                        <div id='sd_export_submit_tip' :style='!sd_exist_sign?"float:left;margin-top:25px;margin-left:20px;color:#ff0000":"float:left;margin-top:25px;margin-left:20px;display:none"'>
                            {{!sd_exist_sign?mcs_no_sdcard:''}}
                            <img src="@/assets/mipc/ebit_loading.gif" v-if="sd_exist_sign && project_name == 'ebitcam'" />
                            <img src="@/assets/mipc/mipc_loading.gif" v-else />
                        </div>
                        <div id='buffer_page'>
                            <div id='buffer_image'></div>
                        </div>
                    </div>
                </div>
                <div id='set_error_log_commit_page' class='set_page' style='display:none'>
                    <div id='ec_lable'>
                        <div class='ec_list'>
                            <div class='ec_title'>App记录了近期的错误日志，请选择提交按钮上传错误日志，感谢您的配合！</div>
                            <div id='error_log_commit_btn' class='vim_log_btn'>{{mcs_feedback_submit}}</div>
                            <div id='error_log_commit_tip' style='float:left;margin-top:65px;margin-left:20px;color:#00A7BA;'></div>
                        </div>
                    </div>
                </div>
                <div id='set_about_page' class='set_page' v-if='my_enter_list.about' style="margin-top:100px">
                    <div class='about_list'>
                        <div id='version_logo_img_ebit_new' v-if='project_name == "ebitcam"'></div>
                        <div id='version_logo_img_vsmahome_new' v-else-if='project_name == "vsmahome"'></div>
                        <div v-else style='margin-top:50px'></div>
                        <div id='about_title' class='about_title'> {{mcs_software_version}} </div>
                        <div class='about_input'> {{version_number}} </div>
                    </div>
                </div>
                <div id='set_developer_option_page' class='set_page' v-if='my_enter_list.developer_option'>
                    <form>
                        <p style='margin:10px 0 10px;'><input type='checkbox' name='tree_id' value='1' />&nbsp;&nbsp;Load Plugin</p>
                        <p style='margin:10px 0 10px;'><input type='checkbox' name='tree_id' value='2' />&nbsp;&nbsp;Load Peripherals</p>
                        <input type='button' value='OK' id='developer_ok' style='width:100px;height:34px;color:#ffffff;background-color:#0ea9bb;border:0;' />
                    </form>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import mme from '@/util/mme.js'
    import ManagePassword from '../public/managePassword.vue'
    import AddEmail from '../public/addEmail.vue'
    export default {
        data() {
            return {
                //多国语言
                mcs_software_version: mcs_software_version, //软件版本 
                mcs_user_admin_password: mcs_user_admin_password, //用户管理密码
                mcs_binding_email: mcs_binding_email, //绑定邮箱
                mcs_feedback: mcs_feedback, //意见反馈
                mcs_export_sd_data: mcs_export_sd_data, //导出SD卡数据
                mcs_erro_diagnosis: mcs_erro_diagnosis, //错误诊断
                mcs_local_device: mcs_local_device, //发现新设备
                mcs_exit: mcs_exit, //退出
                mcs_feedback_submit: mcs_feedback_submit, //提交

                project_name: '', //项目名
                version_number: '', //版本号
                feedback_url: '',
                login_sign: false, //是否登录
                my_enter_list: { about: true, manage_password: false, add_email: false, feedback: false, sd_export: false, developer_option: false, local_devs: false, exit_btn_img: false }, //进入功能详情页
                sd_is_export: 0,
                sd_exist_sign: false, //判断是否存在sd卡
                set_mme: {},
            }
        },
        async mounted() {
            await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
            this.version_number = process.env.VUE_APP_VERSION;
            this.project_name = this.$store.state.jumpPageData.projectName;

            let g_now_lang = this.$store.state.user.userLanguage
            if (window.location.protocol == "https:") {
                this.feedback_url = 'https://js11.vimtag.com:12446/feedback/feedback.htm?hl=' + g_now_lang;
            } else {
                this.feedback_url = 'http://61.147.115.218:12180/feedback/feedback.htm?hl=' + g_now_lang;
            }
            if (this.$store.state.user.loginFlag) {
                this.login_sign = true;
            }
            this.set_creat_mme({});
            this.$store.dispatch('setHostname', "vimtag.com");
        },
        methods: {
            enter_page(e) { //进入功能页
                let _this = this;
                let id_name = e.currentTarget.children[0].getAttribute('id');
                for (let i in _this.my_enter_list) {
                    _this.my_enter_list[i] = false;
                }
                _this.my_enter_list[id_name] = true;
                switch (id_name) {
                    case 'sd_export': //此功能在当前项目中并未真正应用
                        if (!_this.sd_is_export) {
                            let sd_exist = window.check_SDCard();
                            if (sd_exist == 0) {
                                _this.sd_exist_sign = false;
                            } else {
                                _this.sd_exist_sign = true;
                            }
                        }
                        break;
                    case 'local_devs':
                        location.href = location.href + "&l=local&c=" + _this.$store.state.user.loginFlag + "" + (location.href.indexOf("file=vimtag") > -1 ? "&file=vimtag" : "");
                        break;
                    case 'feedback': //反馈（未添加）
                        break;
                    case 'exit_btn_img': //退出登录
                        _this.publicFunc.delete_tips({
                            content: mcs_prompt_exit,
                            flag: "my_page",
                            func: function() { //g 5.5 flag是后加的，判断是my_page页面，点击取消
                                localStorage.setItem("auto_login", 0);
                                if (!localStorage.getItem("keep_pw")) {
                                    let remember_msg_info_data = localStorage.getItem("remember_msg_info");
                                    let remember_msg_info_json = eval("(" + remember_msg_info_data + ")");
                                    let username = remember_msg_info_json.user;
                                    localStorage.setItem("remember_msg_info", JSON.stringify({ user: username }));
                                }
                                _this.$router.push({ name: 'login' })
                                sessionStorage.clear()
                                location.reload();
                            }
                        })

                        break;
                }
            },
            set_creat_mme(obj) {
                function mme_on_event(data) {
                    switch (data.type) {
                        case "install_ui": {
                            data.panel.innerHTML = "";
                            break;
                        }
                    }
                }
                let mme_params;
                let ua = navigator.userAgent.toLowerCase();
                let url_params = (location.search || location.hash || "");
                let params_key = 'data:application/octet-stream;base64,NGO/Mnqt7aXYO3hdsIe87bCTuqTRRSPMwJGuT26CuSedGTi2h7wroHY0IZObBPKYA/exp+e/efFj35sLiDKQpRfRFz8Th8zlYtrYki24JiN7vpGb2bUN9nY7quZ56SicUoqLd+KcCrvWheZ5NaE+slPpCg+F+hUdhNl4JXbVxzx5U6jS92D/SBoDfpMTvF8n3ELgtVFOm3VG+22f97jzrRT22WqSzmmwsM5CNX3cwVfeM5vSPVzeo/kw0ERT9k1mdqG1lScyhMuYsgrWZ0zQSKUni7AUUoiO8qqSfW28XR6CJgp5/JiLHa0kAQtVCVxm886cpuLLUn2SJCHQwS985Fd6PH49IhI+ZgKK5NA+LX+qV3tHHkGdt0C+4n7AMOxHGB+iqepOiK13Bm3YkX7BB9uR80IAltc5YVA0CWg/jog8cCETr1pWm8XngSP4pJa4ZwJq5VuPcBKDTYzqXPJsnIDpZ7L+oz457Ysz+Cc7N7keTCXuI3aFPOjxvdAdCQqKb0Hra3LuxCr5FCfZxx/mn1rddD24Ol74WXtfRJqDs8K/zYpWMnuLU7NjTNdJGMjDs2zYpq56Vd2gq0sS+yyHyhvU4lcIxT05+YfiDMSznuF4BQuKyK7yxa0X73GjUNZFxV3lqIkGKWXjMf4rv4RyE2j1mEqgqGuAW+s2PZ35xOE';
                mme_params = {
                    parent: this.$refs.mme_select_path,
                    enable_native_plug: true,
                    enable_flash_plug: true,
                    params: JSON.stringify(params_key),
                    on_event: function(e) { mme_on_event(e) },
                    ref_obj: obj,
                    debug: (0 <= (location.search || location.hash || "").indexOf("debug=1"))
                };
                if (ua.match(/windows|win32/)) {
                    if (0 <= url_params.indexOf("windowless=0")) {
                        mme_params.windowless = false;
                    } else if (0 <= url_params.indexOf("windowless=1")) {
                        mme_params.windowless = true;
                    }
                }
                this.set_mme.mme = new mme(mme_params);
            },
        },
        components: { ManagePassword, AddEmail }
    }
</script>

<style src="./index.scss" lang='scss'>

</style>