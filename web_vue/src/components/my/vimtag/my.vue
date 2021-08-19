<template>
    <div id="my">
        <div id='set_main'>
            <div id='set_left' v-if='my_enter_list.my_page'>
                <div class='set_list' id='logo_exit'>
                    <!-- 用户名 -->
                    <div class='user_logo'><span id='user_logo_username'> {{username_value ? username_value : mcs_username }} </span></div>
                    <!-- 退出登录按钮 -->
                    <div class='set_img' id='exit_btn_img' style='width:180px;height:34px' @click="exit_btn"> {{login_sign ? mcs_exit: mcs_sign_in + "/" + mcs_sign_up}} </div>
                </div>
                <ul id='left_ul_top' class='ul_public' :style="(!fujikam_sign && login_sign) || !login_sign?'border:inherit':''">
                    <li class='set_list' id='local_div_hide' v-if="fujikam_sign && login_sign" @click="clickLocalSearch">
                        <div class='set_img' id='local_devs'></div>
                        <!-- 本地搜索(客户端实现 网页端隐藏) -->
                        <div class='set_name' id='local_div'> {{mcs_local_search}} </div>
                    </li>
                </ul>
                <ul id='left_ul_middle' class='ul_public'>
                    <li class='set_list' v-if="login_sign" @click="enter_page">
                        <div class='set_img' id='manage_password'></div>
                        <!-- 用户管理密码 -->
                        <div class='set_name'> {{mcs_user_admin_password}} </div>
                    </li>
                    <li class='set_list' v-if="login_sign" @click="enter_page">
                        <div class='set_img' id='guest_password'></div>
                        <!-- 用户访客密码 -->
                        <div class='set_name'> {{mcs_user_guest_password}} </div>
                    </li>
                    <li class='set_list' v-if="login_sign" @click="enter_page">
                        <div class='set_img' id='add_email'></div>
                        <!-- 绑定邮箱 -->
                        <div class='set_name'> {{mcs_binding_email}} </div>
                    </li>
                    <span id='li_line' :style="login_sign?'display:none':'border:inherit'"></span>
                </ul>
                <ul id='left_ul_bottom' class='ul_public' :style="!login_sign?'border:inherit':''">
                    <li class='set_list' v-if="auto_play_page_sign" @click="enter_page">
                        <div class='set_img' id='auto_play'></div>
                        <!-- 自动播放(客户端) -->
                        <div class='set_name'> {{mcs_auto_play}} </div>
                    </li>
                    <li class='set_list' id='sd_export_hide' style='display:none;' @click="enter_page">
                        <div class='set_img' id='sd_export' :style="my_enter_list.sd_export?'background:url('+require('@/assets/device/c-sd.png')+') no-repeat':'background:url('+require('@/assets/device/sd.png')+') no-repeat'"></div>
                        <!-- 导出sd卡数据 -->
                        <div class='set_name'> {{mcs_export_sd_data}} </div>
                    </li>
                    <li class='set_list' @click="enter_page">
                        <div class='set_img' id='feedback'></div>
                        <!-- 意见反馈 -->
                        <div class='set_name'> {{mcs_feedback}} </div>
                    </li>
                    <li class='set_list' id='other' v-if='login_sign' @click="enter_page">
                        <div class='set_img' id='my_other'></div>
                        <!-- 其他 -->
                        <div class='set_name'> {{mcs_others}} </div>
                    </li>
                    <li class='set_list' @click="enter_page">
                        <div class='set_img' id='about'></div>
                        <!-- 软件版本 -->
                        <div class='set_name'> {{mcs_software_version}} </div>
                    </li>
                </ul>
                <div id='mme_select_path' style='width:1px;height:1px;' ref='mme_select_path'></div>
            </div>
            <div id='set_right'>
                <!-- 返回 -->
                <div id='my_page_box_back_manage' class='my_page_box_back' v-if="!my_enter_list.my_page" @click="back_my_page"> {{mcs_back}} </div>
                <div id='set_right_content'>
                    <div id='set_my_other_page' class='set_page' v-if='my_enter_list.my_other'>
                        <div id='devilist_num_set'>
                            <div class='menu_list_box'>
                                <div class='menu_list_last'>
                                    <div class='list_name'> {{mcs_setting_device_list}} </div>
                                    <div class='options_float_right'><input id='dev_set_input' type='text' class='normal_input_right' v-model="dev_set_input_num"></div>
                                </div>
                            </div>
                            <div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' @click='dev_set_btn'> {{mcs_apply}} </button>
                            </div>
                        </div>
                    </div>
                    <div id='set_about_page' class='set_page' v-if='my_enter_list.about'>
                        <div class='about_list'>
                            <div id='about_title' class='about_title'> {{mcs_software_version}} </div>
                            <div class='about_input'> {{version_number}} </div>
                        </div>
                    </div>
                    <div id='set_manage_password_page' class='set_page' v-if='my_enter_list.manage_password'>
                        <!-- 修改密码 用户管理密码 -->
                        <manage-password></manage-password>
                    </div>

                    <div id='set_guest_password_page' class='set_page' v-if='my_enter_list.guest_password'>
                        <!-- 设置访客密码 -->
                        <guest-password></guest-password>
                    </div>

                    <div id='set_add_email_page' class='set_page' v-if='my_enter_list.add_email'>
                        <!-- 绑定邮箱 -->
                        <add-email></add-email>
                    </div>
                    <!-- 自动播放 -->
                    <div id='set_auto_play_page' class='set_page' style='width:600px;' v-if='my_enter_list.auto_play'>
                        <div id='set_auto_play_box'>
                            <div class='set_auto_play_box_name'> {{mcs_auto_play}} </div>
                            <switch-button v-model='auto_play_sign' @data_updata_event='auto_play_updata'></switch-button>
                        </div>
                    </div>
                    <div id='set_feedback_page' class='set_page' v-if='my_enter_list.feedback'>
                        <feedback></feedback>
                    </div>
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
                                <div id='sd_export_path_show'>{{sd_export_path}}</div>
                                <div id='sd_export_path_btn' @click='sd_export_path_btn'>Select Path</div>
                            </div>
                            <div id='sd_export_submit' @click='sd_export_submit'>Export data</div>
                            <div id='sd_export_submit_tip' :style='!sd_exist_sign?"float:left;margin-top:25px;margin-left:20px;color:#ff0000":"float:left;margin-top:25px;margin-left:20px;display:none"'>
                                {{!sd_exist_sign?mcs_no_sdcard:''}}
                                <img src="@/assets/device/add_loading.gif" v-if="sd_exist_sign" />
                            </div>
                            <div id='buffer_page'>
                                <div id='buffer_image'></div>
                            </div>
                        </div>
                    </div>
                    <div id='set_developer_option_page' class='set_page' v-if='my_enter_list.developer_option'>
                        <form>
                            <p style='margin:10px 0 10px;'><input type='checkbox' name='tree_id' value='1' />&nbsp;&nbsp;Load Plugin</p>
                            <p style='margin:10px 0 10px;'><input type='checkbox' name='tree_id' value='2' />&nbsp;&nbsp;Load Peripherals</p>
                            <input type='button' value='OK' id='developer_ok' style='width:100px;height:34px;color:#ffffff;background-color:#0ea9bb;border:0;' @click="developer_ok_btn" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import mme from '@/util/mme.js'
    import ManagePassword from '../public/managePassword'
    import GuestPassword from '../public/guestPassword'
    import AddEmail from '../public/addEmail'
    import Feedback from '../public/feedback'
    import SwitchButton from '@/module/switchButton'
    export default {
        data() {
            return {
                //多国语言
                mcs_username: mcs_username, //用户名
                mcs_exit: mcs_exit, //退出
                mcs_local_search: mcs_local_search, //本地搜索
                mcs_user_admin_password: mcs_user_admin_password, //用户管理密码
                mcs_user_guest_password: mcs_user_guest_password, //用户访客密码
                mcs_binding_email: mcs_binding_email, //绑定邮箱
                mcs_auto_play: mcs_auto_play, //自动播放
                mcs_export_sd_data: mcs_export_sd_data, //导出SD卡数据
                mcs_feedback: mcs_feedback, //意见反馈
                mcs_others: mcs_others, //其他
                mcs_software_version: mcs_software_version, //软件版本
                mcs_back: mcs_back, //返回
                mcs_setting_device_list: mcs_setting_device_list, //设备列表每行显示数(1-4)
                mcs_apply: mcs_apply, //应用
                mcs_sign_up: mcs_sign_up, //注册
                mcs_sign_in: mcs_sign_in, //登录
                mcs_no_sdcard: mcs_no_sdcard, //没有SD卡
                mcs_prompt_exit: mcs_prompt_exit, //是否退出?
                mcs_set_successfully: mcs_set_successfully, //设置成功
                mcs_failed_to_set_the: mcs_failed_to_set_the, //设置失败

                fujikam_sign: false, //判断是否为客户端
                username_value: '', //用户名
                l_pwd_val: '', //密码
                login_sign: false, //是否登录
                auto_play_sign: false, //控制是否自动播放
                auto_play_page_sign: false, //控制是否显示自动播放
                sd_is_export: 0,
                my_enter_list: { my_other: false, about: false, manage_password: false, guest_password: false, add_email: false, auto_play: false, feedback: false, sd_export: false, developer_option: false, local_devs: false, my_page: true }, //进入功能详情页               
                sd_exist_sign: false, //判断是否存在sd卡
                dev_set_input_num: '', //设备列表单行显示数
                set_mme: {},
                sd_export_path: "c:\\downloads", //sd导出地址
                version_number: '', //版本号
            }
        },
        async mounted() {
            let _this = this;
            await _this.$chooseLanguage.lang(_this.$store.state.user.userLanguage)
            if (window.fujikam == "fujikam") {
                _this.fujikam_sign = true;
            } else {
                _this.fujikam_sign = false;
            }
            if (_this.$store.state.user.loginFlag) {
                _this.login_sign = true;
                _this.username_value = JSON.parse(localStorage.getItem("remember_msg_info")).user;
                if (_this.$store.state.user.autoPlayFlag) {
                    _this.auto_play_page_sign = true;
                }
            }
            if (_this.$store.state.jumpPageData.localFlag) {
                let l_remember_data = localStorage.getItem("remember_msg_info"); //点击本地搜索后这个还有
                l_remember_data = eval('(' + l_remember_data + ')');
                if (_this.login_sign) {
                    _this.username_value = l_remember_data.user;
                    _this.l_pwd_val = l_remember_data.password;
                }
            }

            _this.version_number = process.env.VUE_APP_VERSION;
            _this.set_creat_mme({});
            _this.$store.dispatch('setHostname', "vimtag.com");

            let auto_play = localStorage.getItem("auto_play");
            if (auto_play == 0) {
                _this.auto_play_sign = false;
            } else {
                _this.auto_play_sign = true;
            }
        },
        methods: {
            enter_page(e) { //进入功能页
                let id_name = e.currentTarget.children[0].getAttribute('id');
                this.my_enter_list[id_name] = true;
                this.my_enter_list.my_page = false;
                switch (id_name) {
                    case 'sd_export': //此功能在当前项目中并未真正应用
                        if (!this.sd_is_export) {
                            let sd_exist = window.check_SDCard();
                            if (sd_exist == 0) {
                                this.sd_exist_sign = false;
                            } else {
                                this.sd_exist_sign = true;
                            }
                        }
                        break;
                    case 'local_devs':
                        location.href = location.href + "&l=local&c=" + this.$store.state.user.loginFlag + "" + (location.href.indexOf("file=vimtag") > -1 ? "&file=vimtag" : "");
                        break;
                }
            },
            back_my_page() { //退出功能页
                for (let i in this.my_enter_list) {
                    this.my_enter_list[i] = false;
                }
                this.my_enter_list.my_page = true;
            },
            exit_btn() { //退出登录 / 登录/注册
                let _this = this;
                if (_this.$store.state.user.loginFlag) {
                    _this.publicFunc.delete_tips({ //g 5.5 flag是后加的，判断是my_page页面，点击取消
                        content: mcs_prompt_exit,
                        flag: "my_page",
                        func: function() {
                            localStorage.setItem("auto_login", 0);
                            _this.$store.dispatch("setLoginFlag",0)
                            if (!localStorage.getItem("keep_pw")) {
                                let remember_msg_info_data = localStorage.getItem("remember_msg_info");
                                let remember_msg_info_json = eval("(" + remember_msg_info_data + ")");
                                let username = remember_msg_info_json.user;
                                localStorage.setItem("remember_msg_info", JSON.stringify({ user: username }));
                            }
                            _this.$router.push({ name: 'login' })
                            // if (_this.$store.state.jumpPageData.localFlag) {
                            //     let url = location.href;
                            //     location.href = url.replace("&l=local&c=1", "");
                            //     sessionStorage.clear();
                            // } else {
                                sessionStorage.clear();
                                location.reload();
                            // }
                        }
                    })
                } else {
                    _this.$router.push({ name: 'login' })
                    if (_this.$store.state.jumpPageData.localFlag) {
                        let url = location.href;
                        location.href = url.replace("&l=local&c=0", "");
                        sessionStorage.clear();
                    } else {
                        // sessionStorage.clear();
                        location.reload();
                    }
                }
            },
            dev_set_btn() { //设置设备列表单行显示数
                if (this.dev_set_input_num > 0 && this.dev_set_input_num < 5) {
                    sessionStorage.setItem("device_list_num", this.dev_set_input_num)
                    this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                } else {
                    this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 })
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
                let mme_params
                let ua = navigator.userAgent.toLowerCase()
                let url_params = (location.search || location.hash || "")
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
            sd_export_path_btn() { //sd路径导出
                let select_path = this.set_mme.mme.ctrl(0, "path.select", "aaa");
                let select_path_data = select_path.replace(/\\/g, "/");
                select_path_data = eval("(" + select_path_data + ")");
                if (select_path_data.status == 0) {
                    let select_path_str = select_path_data.code.replace(/\//g, "\\");
                    this.sd_export_path = select_path_str;
                }
                let sd_export_path = window.fun()
                this.sd_export_path = sd_export_path;
            },
            sd_export_submit() { //sd导出(未修改)
                let _this = this;
                let sd_exist = window.check_SDCard();
                if (sd_exist == 0) return;
                if (window.system_type == "mac") {
                    let export_path = _this.sd_export_path;
                    export_path = export_path.replace(/\\/g, "/");
                    let resutl = _this.set_mme.mme.ctrl(0, 'system.commit', 'osascript -e "do shell script \\"cd ' + window.cmd_path + '; export DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH:./; ./mcard_test -path ' + export_path + ' \\" with administrator privileges"');
                    _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
                    _this.publicFunc.mx("#buffer_page").style.display = "none";
                    _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "Export success";
                    _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#00a6ba";
                    document.getElementById("sd_export_submit").style.background = "#00a6ba";
                    let l_dom_progress_bar = _this.publicFunc.mx("#progress_bar");
                    let l_dom_progress_bar_box = _this.publicFunc.mx("#progress_bar_box");
                    l_dom_progress_bar_box.style.position = "relative";
                    l_dom_progress_bar.style.position = "relative";
                    l_dom_progress_bar.style.left = "0";
                    l_dom_progress_bar.style.width = "20px";
                } else if (window.system_type == "windows") {
                    let l_dom_progress_bar = _this.publicFunc.mx("#progress_bar");
                    let l_dom_progress_bar_box = _this.publicFunc.mx("#progress_bar_box");
                    let l_dom_progress_bar_num = _this.publicFunc.mx("#progress_bar_num");
                    l_dom_progress_bar_box.style.position = "relative";
                    l_dom_progress_bar.style.position = "relative";
                    l_dom_progress_bar.style.left = "0";
                    l_dom_progress_bar.style.width = "20px";
                    _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
                    let sd_export_path = _this.sd_export_path;

                    setTimeout(function() {
                        let result = window.sd_export(sd_export_path);
                        let timer = null;
                        timer = setInterval(function() {
                            //Export completed
                            if (result == 2) {
                                sd_is_export = 1;
                                l_dom_sd_export_submit.innerHTML = "pause";
                                l_dom_sd_export_submit.onclick = sd_export_pause;
                                get_progress(sd_export_path);
                                clearInterval(timer);
                                //no data
                            } else if (result == 0) {
                                l_dom_progress_bar_box.style.display = "none";
                                _this.publicFunc.mx("#buffer_page").style.display = "none";
                                _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                                _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                                document.getElementById("sd_export_submit").style.background = "#00a6ba";
                                clearInterval(timer);
                                //no_sd
                            } else if (result == 1) {
                                l_dom_progress_bar_box.style.display = "none";
                                _this.publicFunc.mx("#buffer_page").style.display = "none";
                                _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                                _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                                document.getElementById("sd_export_submit").style.background = "#00a6ba";
                                clearInterval(timer);
                            }
                        }, 100);
                    }, 100)
                } else {
                    document.getElementById("sd_export_submit").style.background = "#ccc";
                    _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
                    setTimeout(function() {
                        let result = window.sd_export(_this.sd_export_path);
                        let timer = null;
                        timer = setInterval(function() {
                            //Export completed
                            if (result == 2) {
                                l_dom_progress_bar.style.left = "0";
                                _this.publicFunc.mx("#export_success_icon").style.display = "block";
                                _this.publicFunc.mx("#sd_export_submit_tip").style.display = "none";
                                document.getElementById("sd_export_submit").style.background = "#00a6ba";
                                clearInterval(timer);
                                //no data
                            } else if (result == 0) {
                                l_dom_progress_bar_box.style.display = "none";
                                _this.publicFunc.mx("#buffer_page").style.display = "none";
                                _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                                _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                                document.getElementById("sd_export_submit").style.background = "#00a6ba";
                                clearInterval(timer);
                                //no_sd
                            } else if (result == 1) {
                                l_dom_progress_bar_box.style.display = "none";
                                _this.publicFunc.mx("#buffer_page").style.display = "none";
                                _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                                _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                                document.getElementById("sd_export_submit").style.background = "#00a6ba";
                                clearInterval(timer);
                            }
                        }, 100);
                    }, 100)
                    let l_dom_progress_bar = _this.publicFunc.mx("#progress_bar");
                    let l_dom_progress_bar_box = _this.publicFunc.mx("#progress_bar_box");
                    l_dom_progress_bar_box.style.position = "relative";

                    l_dom_progress_bar.style.position = "relative";
                    l_dom_progress_bar.style.left = "0";
                    l_dom_progress_bar.style.width = "20px";
                }

                function get_progress() {
                    let progress_time = null;
                    let progress_num = 0;
                    progress_time = setInterval(function() {
                        l_dom_progress_bar_box.css("display", "block");
                        progress_num = window.progress(sd_export_path + "\\progress");
                        progress_num = parseInt(progress_num);
                        let show_progress_num = progress_num + "%";
                        l_dom_progress_bar.style.width = show_progress_num;
                        l_dom_progress_bar_num.innerHTML = show_progress_num;
                        if (progress_num == 100) {
                            $("#export_success_icon").css("display", "block");
                            $("#sd_export_submit_tip").parent().css("display", "none");
                            document.getElementById("sd_export_submit").style.background = "#00a6ba";
                            clearInterval(progress_time);
                            l_dom_sd_export_submit.innerHTML = "Export success";
                            l_dom_sd_export_submit.onclick = sd_export_submit_func;
                            sd_is_export = 0;
                        }
                    }, 100)
                }

                function sd_export_pause() {
                    let sd_export_path = l_dom_sd_export_path_show.innerHTML;
                    _this.publicFunc.mx("#sd_export_submit_tip").style.display = "none";
                    l_dom_sd_export_submit.innerHTML = "continue";
                    l_dom_sd_export_submit.onclick = sd_export_continue;
                    window.export_ctrl(sd_export_path + "\\opt", "1")
                }

                function sd_export_continue() {
                    let sd_export_path = l_dom_sd_export_path_show.innerHTML;
                    _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
                    l_dom_sd_export_submit.innerHTML = "pause";
                    l_dom_sd_export_submit.onclick = sd_export_pause;
                    window.export_ctrl(sd_export_path + "\\opt", "3");
                }
            },
            developer_ok_btn() { //(未修改)
                let tree_id = this.publicFunc.mx("tree_id");
                let checkbox_check;
                for (let i = 0, length = tree_id.length; i < length; i++) {
                    if (tree_id[i].checked) {
                        checkbox_check = !i ? 1 : checkbox_check | (0x1 << i);
                    } else {
                        checkbox_check = !i ? 0 : checkbox_check;
                    }
                }
                sessionStorage.setItem("developer", checkbox_check);
            },
            clickLocalSearch() { // 点击本地搜索
                console.log('点击本地搜索', window.location.protocol === "file:" ? 1 : 0)
                this.$store.dispatch('setLocalFlag', 1)
                this.$router.push({ name: 'devlist' })
                // document.getElementById('main_ifr').setAttribute('src', location.href + "&l=local&c=" + 1 + "" + (location.href.indexOf("file=vimtag") > -1 ? "&file=vimtag" : ""))
                // let changeHref = location.href.split('#')[0] + "&l=local&c=" + 1 + "" + (location.href.indexOf("file=vimtag") > -1 ? "&file=vimtag" : "") + '#/devlist'
                // console.log(changeHref, 'href')
                // location.href = changeHref
            },
            auto_play_updata(data) { //更新是否自动播放
                this.auto_play_sign = data;
            }
        },
        watch: {
            dev_set_input_num(val) {
                let reg = /^\+?[1-9]\d*$/;
                if (!reg.test(val)) {
                    this.dev_set_input_num = '';
                }
            },
            auto_play_sign(val) {
                if (val && this.$store.state.user.autoPlayFlag) {
                    localStorage.setItem("auto_play", 1)
                    this.$store.dispatch('setAutoPlayFlag', 1)
                } else {
                    localStorage.setItem("auto_play", "0");
                    this.$store.dispatch('setAutoPlayFlag', 0)
                }
            }
        },
        components: { ManagePassword, AddEmail, GuestPassword, Feedback, SwitchButton }
    }
</script>

<style src="./index.scss" lang='scss'>
    #set_auto_play_box {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>