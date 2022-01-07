<template>
    <div id='set'>
        <div id='device_setting_page' :style='project_flag?"width:100%":"width:90%"'>
            <div id='set_back' v-if="!project_flag">
                <div id='back' @click="back_btn">
                    <div id='main_title_box_return_img'></div> {{mcs_back}}
                </div>
            </div>
            <div id='create_setting_page_left'>
                <div v-for='(item,index) in menu_data' :key='index' :class='right_show_sign[item.type]?[page_left_class_name,page_left_active_class_name]:page_left_class_name' :type='item.type' @click='left_list_btn'>
                    <div class='list_left_img' :style='"background-image:url(" + item.imgSrc + ")"' v-show="!project_flag"></div>
                    <span class='list_left_text'> {{item.name}} </span>
                    <div class='list_img' v-if='!project_flag'></div>
                    <div id='system_new_version' class='system_new_version' v-if='item.type == "system" && system_new_sign'>new</div>
                </div>
                <div :class='right_show_sign["delete_device"]?[page_left_class_name,page_left_active_class_name]:page_left_class_name' type='delete_device' @click='left_list_btn'>
                    <span :class='project_flag?"list_left_text":""'> {{mcs_delete_device}} </span>
                </div>
            </div>
            <div id='create_setting_page_right' :style='project_flag?"margin-top:40px":""'>
                <keep-alive>
                    <about-info v-if="right_show_sign.about" @system_new_event='system_new_sign_event'></about-info> <!-- 关于 -->
                    <nickname v-if="right_show_sign.nickname"></nickname> <!-- 设备昵称 -->
                    <admin-password v-if="right_show_sign.admin_password"></admin-password> <!-- 管理密码 -->
                    <osd v-if="right_show_sign.osd"></osd> <!-- OSD -->
                    <record v-if="right_show_sign.record"></record> <!-- 录像 -->
                    <accessory v-if="right_show_sign.accessory"></accessory> <!-- 外设 -->
                    <alarm v-if="right_show_sign.alarm_device_tips"></alarm> <!-- 报警 -->
                    <date-time v-if="right_show_sign.date_time"></date-time> <!-- 日期时间 -->
                    <system v-if="right_show_sign.system"></system> <!-- 系统 -->
                    <others v-if="right_show_sign.others"></others> <!-- 其他 -->
                    <motion-detect v-if="right_show_sign.motion_detect"></motion-detect> <!-- 移动侦测 -->
                    <lighting v-if="right_show_sign.lighting"></lighting> <!-- 灯光模式 -->
                    <delete-device v-if="right_show_sign.delete_device"></delete-device> <!-- 删除设备 -->
                </keep-alive>
                <network v-if="right_show_sign.network"></network> <!-- 网络 -->
                <sdcord v-if="right_show_sign.sdcord" :info='info_data'></sdcord> <!-- SD卡 -->
                <storage-device v-if="right_show_sign.storage_device"></storage-device> <!-- 存储设备 -->
            </div>
        </div>
    </div>
</template>

<script>
    import fdSliderController from '../../util/fdSliderController'
    import languageSelect from '../../lib/exportModule/languageSelect.js'
    import mcodec from '../../util/mcodec.js'

    import aboutInfo from './public/aboutInfo.vue'
    import nickname from './public/nickname.vue'
    import adminPassword from './public/adminPassword.vue'
    import network from './public/network.vue'
    import osd from './public/osd.vue'
    import sdcord from './public/sdcord.vue'
    import storageDevice from './public/storageDevice.vue'
    import record from './public/record.vue'
    import accessory from './public/accessory.vue'
    import alarm from './public/alarm.vue'
    import dateTime from './public/dateTime.vue'
    import system from './public/system.vue'
    import others from './public/others.vue'
    import motionDetect from './public/motionDetect.vue'
    import lighting from './public/lighting.vue'
    import deleteDevice from './public/deleteDevice.vue'
    export default {
        data() {
            return {
                //多国语言
                mcs_back: mcs_back, //返回
                mcs_delete_device: mcs_delete_device, //删除设备

                project_flag: 0, //判断是否为vimtag
                project_name: '', //项目名
                page_left_class_name: 'list_idle_div', //左侧菜单栏类名
                page_left_active_class_name: 'list_idle_div_active', //左侧菜单栏选中类名
                set_params: {}, // 接受的设置的信息
                menu_data: [], //设置左侧功能列表
                right_show_sign: {
                    about: true,
                    nickname: false,
                    admin_password: false,
                    network: false,
                    osd: false,
                    sdcord: false,
                    storage_device: false,
                    scenes: false,
                    accessory: false,
                    record: false,
                    alarm_device_tips: false,
                    date_time: false,
                    system: false,
                    others: false,
                    motion_detect: false,
                    lighting: false,
                    alarm_device: false,
                    alarm_action: false,
                    scheduled_alerting: false,
                    scheduled_recording: false,
                    delete_device: false
                }, // 设置右侧详情显示
                flag: '', // 设备类型
                new_ealf: 0, // 设备联动框架标识
                info_data: {}, //传递到组件的数据
                system_new_sign: false, //判断是否有新系统
            }
        },
        mounted() {
            this.publicFunc.showBufferPage()
            let _this = this;
            _this.project_flag = _this.$store.state.jumpPageData.projectFlag;
            _this.project_name = _this.$store.state.jumpPageData.projectName;
            _this.$store.dispatch('setPageParams', _this.$route.params)
            _this.set_params = _this.$store.state.set.pageParams
            _this.flag = _this.set_params.type

            if (_this.project_flag) {
                _this.page_left_class_name = 'mipc_list_idle_div'
                _this.page_left_active_class_name = 'mipc_list_idle_div_active'
            } else {
                _this.page_left_class_name = 'vimtag_list_idle_div'
                _this.page_left_active_class_name = 'vimtag_list_idle_div_active'
            }

        },
        methods: {
            back_btn() { //点击返回
                if (this.set_params.back_page === 'play') {
                    this.$router.push({ name: 'play', params: this.set_params })
                } else if (this.set_params.back_page === 'boxlist') {
                    this.$router.push({ name: 'boxlist', params: this.set_params });
                }
            },
            left_list_btn(e) { //左侧列表点击
                let list_type = e.currentTarget.getAttribute('type');
                let list_name;
                if (e.currentTarget.children[1]) {
                    list_name = e.currentTarget.children[1].innerHTML.trim(); //后加云盒子硬盘显示文字与sd卡区分
                }
                for (let i in this.right_show_sign) {
                    this.right_show_sign[i] = false;
                }
                this.right_show_sign[list_type] = true;
                this.info_data = {
                    type: list_type,
                    list_name: list_name
                }
            },
            system_new_sign_event(data) { //更改系统更新状态
                this.system_new_sign = data;
            }
        },
        watch: {
            flag(val) {
                switch (val) {
                    case 1:
                        this.menu_data = [
                            { name: mcs_about, type: "about" },
                            { name: mcs_nickname, type: "nickname" },
                            { name: mcs_admin_password, type: "admin_password" },
                            { name: mcs_network, type: "network" },
                            { name: mcs_osd, type: "osd" },
                            { name: mcs_sdcord, type: "sdcord" },
                            { name: mcs_storage_device, type: "storage_device" },
                            // {name:mcs_scenes,type:"scenes"}, //g 情景
                            { name: mcs_w_s, type: "accessory" },
                            { name: mcs_record, type: "record" },
                            { name: mcs_motion_notification, type: "alarm_device_tips" },
                            { name: mcs_date_time, type: "date_time" },
                            { name: mcs_system, type: "system" },
                            { name: mcs_others, type: "others" },
                            { name: mcs_motion, type: "motion_detect" }, //新加移动侦测
                            { name: mcs_light_mode, type: "lighting" },
                            // { name: mcs_delete_device, type: "delete_device" }
                        ]
                        break;

                    case 2: //云盒子
                        this.menu_data = [
                            { name: mcs_about, type: "about" },
                            { name: mcs_nickname, type: "nickname" },
                            { name: mcs_admin_password, type: "admin_password" },
                            { name: mcs_network, type: "network" },
                            { name: mcs_hard_disk, type: "sdcord" },
                            { name: mcs_date_time, type: "date_time" },
                            { name: mcs_system, type: "system" },
                            // {name:"onvif",type:"onvif"},  //onvif
                            // { name: mcs_delete_device, type: "delete_device" }
                        ]
                        break;

                    case 3:
                        this.menu_data = [
                            { name: mcs_about, type: "about" },
                            { name: mcs_nickname, type: "nickname" },
                            { name: mcs_admin_password, type: "admin_password" },
                            { name: mcs_network, type: "network" },
                            { name: mcs_osd, type: "osd" },
                            { name: mcs_sdcord, type: "sdcord" },
                            { name: mcs_storage_device, type: "storage_device" },
                            { name: mcs_alarm_device, type: "alarm_device" },
                            { name: mcs_alarm_action, type: "alarm_action" },
                            { name: mcs_scheduled_alerting, type: "scheduled_alerting" },
                            { name: mcs_scheduled_recording, type: "scheduled_recording" },
                            { name: mcs_date_time, type: "date_time" },
                            { name: mcs_system, type: "system" },
                            { name: mcs_others, type: "others" },
                            // { name: mcs_delete_device, type: "delete_device" }
                        ]
                        break;

                    case 4:
                        this.menu_data = [
                            { name: mcs_about, type: "about" },
                            // { name: mcs_delete_device, type: "delete_device" }
                        ]
                        break;
                }
                this.$api.set.dev_info({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                    if (res && res.result === "") {
                        for (let i = 0; i < this.menu_data.length; i++) {
                            if (this.menu_data[i].type === 'osd' && res.fisheye == 1) { //鱼眼设备隐藏osd
                                this.menu_data.splice(i, 1)
                            }
                            if (this.menu_data[i].type === 'accessory') {
                                if ((res.face_detect !== "1" && res.sound_detect !== "1") && res.rffreq !== "868") { //人型检测||msg.human_detect==1
                                    this.menu_data.splice(i, 1)
                                }
                            }
                            if (!res.white_light && this.menu_data[i].type === 'lighting') {
                                this.menu_data.splice(i, 1)
                            }
                        }
                        if (res.new_ealf === "1") {
                            this.new_ealf = 1
                        }
                        this.$store.dispatch('setDeviceEalf', this.new_ealf)
                    }
                    this.publicFunc.closeBufferPage()
                })
                for (let i = 0; i < this.menu_data.length; i++) {
                    this.menu_data[i].imgSrc = require("@/assets/device/set_" + this.menu_data[i].type + ".png")
                }
            }
        },
        components: {
            aboutInfo,
            nickname,
            adminPassword,
            network,
            osd,
            sdcord,
            storageDevice,
            record,
            accessory,
            alarm,
            dateTime,
            system,
            others,
            motionDetect,
            lighting,
            deleteDevice,
        }
    }
</script>

<style lang='scss'>
    @import './index.scss';
</style>