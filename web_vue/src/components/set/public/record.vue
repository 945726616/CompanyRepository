<template>
    <div id='record' class='list_right_box'>
        <div style='height:2rem;margin-top:1rem'> {{mcs_continuous_recording}} </div>
        <div class='menu_list2_box' id='record_plan' style='overflow:hidden' @click='record_event_btn'>
            <div class='menu_record'>
                <div class='list_name'>
                    <div class='list_name_title'> {{mcs_continuous_recording}} </div>
                    <!-- 下面开启关闭 -->
                    <div class='list_name_tips' id='is_show'>{{sd_sign?list_name_show:mcs_turn_off}}</div>
                </div>
                <div class='list_info'>
                    <div class='right_arrow'></div>
                </div>
            </div>
        </div>
        <div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'> {{mcs_Event_record}} </div>
        <div class='menu_list2_box' id='record_event'>
            <div v-for='(item, index) in scene_data_out.dev' :key='item.id'>
                <div v-if='item.record_event_name && item.record_event_type' class='menu_list record_event_btn' :index='index+1' :sn='item.id' :type='item.type' @click='record_event_btn'>
                    <div class='list_name'>
                        <div class='list_name_title'> {{item.record_event_name}} </div>
                        <div class='list_name_tips'> {{sd_sign?item.record_event_type:mcs_turn_off}} </div>
                    </div>
                    <div class='list_info'>
                        <div class='right_arrow'></div>
                    </div>
                </div>
            </div>
        </div>

        <div id='sd_mode' v-if='sd_mode_sign'>
            <div class='sd_display'>
                <div class='menu_list_box_title2 menu_list_mode'> {{mcs_mode}} </div>
                <div class='menu_list_box'>
                    <div class='menu_list menu_list_children_mode' style=''>
                        <div class='sd_mode_text'> {{mcs_normal_mode}} </div>
                        <div class='list_info'>
                            <input type="radio" value='0' v-model='record_mode' :class='record_mode == "0"?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
                        </div>
                    </div>
                    <div id='no' class='record_sd_calculate'>{{normal_hint}}</div>
                    <div class='menu_list menu_list_children_mode' style=''>
                        <div class='sd_mode_text'> {{mcs_long_video_mode}} </div>
                        <div class='list_info'>
                            <input type="radio" value='50' v-model='record_mode' :class='record_mode == "50"?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
                        </div>
                    </div>
                    <div id='lo' class='record_sd_calculate'>{{long_video_hint}}</div>
                    <div class='menu_list menu_list_children_mode' style=''>
                        <div class='sd_mode_text'> {{mcs_super_long_video_mode}} </div>
                        <div class='list_info'>
                            <input type="radio" value='100' v-model='record_mode' :class='record_mode == "100"?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
                        </div>
                    </div>
                    <div id='su' class='record_sd_calculate'>{{super_video_hint}}</div>
                </div>
                <div id='sd_mode_btn' class='list_right_button' @click='sd_mode_btn'> {{mcs_apply}} </div>
            </div>
        </div>
        <time-page v-if='setTimePage' :setTimePageObj='setTimePageObj' @time_page_close='time_page_close'></time-page>
    </div>
</template>

<script>
    import timePage from './setTimePage'
    export default {
        data() {
            return {
                //多国语言
                mcs_continuous_recording: mcs_continuous_recording, //持续录像
                mcs_Event_record: mcs_Event_record, //事件录像
                mcs_mode: mcs_mode, //模式
                mcs_normal_mode: mcs_normal_mode, //普通模式
                mcs_long_video_mode: mcs_long_video_mode, //长录像模式
                mcs_super_long_video_mode: mcs_super_long_video_mode, //超长录像模式
                mcs_apply: mcs_apply, //应用
                mcs_turn_off: mcs_turn_off, //关

                face_detect: '',
                sound_detect: '',
                list_name_show: '',
                scene_data_out: {},
                setTimePage: false, //控制弹窗是否显示
                setTimePageObj: {}, //控制弹窗展示对象
                record_mode: '', //录像模式
                sd_mode_sign: false, //录像模式是否显示
                normal_hint: '', //普通模式
                long_video_hint: '', //长录像模式
                super_video_hint: '', //超长录像模式
                sd_sign: true, //是否含sd卡
                project_name: '', //项目名
                // 联动设备相关参数
                ealf: this.$store.state.set.deviceEalf, // 设备联动框架标识
                human_detect: '',
                // record_all_dev: [], // 有效附件名
                new_record_final_all_dev: [], // 设备所具有的附件外加计划表和开关状态等
                plan_tmp: [], // 计划表中间参数
                record_plan_continue: {},
                all_dev_name: [
                    mcs_continuous_recording, //type=0  //持续录像
                    mcs_motion_detection, //type=1
                    mcs_Infrared_detector, //type=2
                    "", //type=3
                    mcs_smoke_detector, //type=4
                    mcs_sos, //type=5
                    mcs_magnetic, //type=6
                    "", //type=7
                    mcs_face_detection, //type=8
                    mcs_sound_detection, //type=9
                    mrs_human_detection //type=10      此部分表示联动框架对应type的附件名
                ]
            }
        },
        mounted() {
            this.project_name = this.$store.state.jumpPageData.projectName;
            this.publicFunc.showBufferPage()
            if (this.ealf === 0) { // 非联动框架录像
                this.get_dev_info()
            } else { // 联动框架录像
                this.new_process()
            }
        },
        methods: {
            record_event_btn(e) { //打开弹框
                if (this.sd_sign) {
                    this.setTimePage = true;
                    this.$set(this.setTimePageObj, "show_page", 'time_page') //打开是否允许录像弹框
                    this.$set(this.setTimePageObj, "accessory_type", e.currentTarget.getAttribute('type')) //录像类型
                    this.$set(this.setTimePageObj, "accessory_sn", e.currentTarget.getAttribute('sn')) //设备ID
                    this.$set(this.setTimePageObj, "accessory_mode", 'record') //录像模式
                    if (this.ealf === 1) {
                        let index = Number(e.currentTarget.getAttribute('index'))
                        if (index === 0) {
                            this.$set(this.setTimePageObj, "set_plan", this.record_plan_continue)
                            this.$set(this.setTimePageObj, "set_record_alarm", 'c_record')
                        } else {
                            this.$set(this.setTimePageObj, "set_plan", this.new_record_final_all_dev[index - 1])
                            this.$set(this.setTimePageObj, "set_record_alarm", 'record')
                        }
                        this.$set(this.setTimePageObj, "hide_nav", 1)
                        this.new_record_final_all_dev = [] // 清空设备所具有的附件外加计划表和开关状态等(防止多层push导致判断失效)
                    }
                } else {
                    this.publicFunc.msg_tips({ msg: mcs_no_sd_hint, type: "error", timeout: 3000 });
                }
            },
            time_page_close() { //关闭弹框
                this.setTimePage = false
                this.publicFunc.showBufferPage()
                if (this.ealf === 0) {
                    this.get_dev_info()
                } else {
                    // console.log('关闭弹窗再次调用')
                    this.new_process()
                }
            },
            sd_mode_btn() { //点击应用录像模式
                this.publicFunc.showBufferPage()
                this.$api.set.sd_set({ sn: this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "", record_mode: this.record_mode, flag: 1 }).then(res => {
                    this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                    this.publicFunc.closeBufferPage()
                })
            },
            get_dev_info() { //获取信息
                this.$api.set.dev_info({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                    this.face_detect = res.face_detect;
                    this.sound_detect = res.sound_detect;
                    this.$api.set.scene_get({
                        sn: this.$store.state.jumpPageData.selectDeviceIpc
                    }).then(res => {
                        this.publicFunc.closeBufferPage()
                        if (res && res.result == "") {
                            if (res.data.info.scene[0].flag == 0) {
                                this.list_name_show = mcs_turn_off
                            } else {
                                this.list_name_show = mcs_turn_on
                            }
                            let scene_data = res.data.info.scene;
                            let event_record = 0;
                            // l_select_scene_name = msg.data.info.select;
                            for (let i = 0; i < scene_data.length; i++) {
                                if (scene_data[i].name == "out") {
                                    this.scene_data_out = scene_data[i];
                                } else if (scene_data[i].name == "in") {
                                    this.scene_data_active = scene_data[i];
                                }
                            }
                            for (let j = 0; j < this.scene_data_out.dev.length; j++) {
                                let record_event_name
                                let record_event_type
                                if (this.scene_data_out.dev[j].type == 1) {
                                    record_event_name = mcs_motion_detection;
                                } else if (this.scene_data_out.dev[j].type == 6) {
                                    record_event_name = mcs_magnetic;
                                } else if (this.scene_data_out.dev[j].type == 5) {
                                    record_event_name = mcs_sos;
                                } else if (this.scene_data_out.dev[j].type == 8) {
                                    if (this.face_detect == 0) { continue; }
                                    record_event_name = mcs_face_detection;
                                } else if (this.scene_data_out.dev[j].type == 9) {
                                    if (this.sound_detect == 0) { continue; }
                                    record_event_name = mcs_sound_detection;
                                } else if (this.scene_data_out.dev[j].type == 2) {
                                    record_event_name = mcs_Infrared_detector;
                                } else if (this.scene_data_out.dev[j].type == 4) {
                                    record_event_name = mcs_smoke_detector;
                                } else if (this.scene_data_out.dev[j].type == 7) {
                                    continue;
                                } else if (this.scene_data_out.dev[j].type == 10) { //human_detect
                                    continue
                                }
                                if (!(this.scene_data_out.dev[j].flag & 0x2)) {
                                    record_event_type = mcs_turn_off;
                                } else if (this.scene_data_out.dev[j].flag & 0x2) {
                                    record_event_type = mcs_turn_on;
                                    // event_record = 1;
                                }

                                this.scene_data_out.dev[j].record_event_name = record_event_name
                                this.scene_data_out.dev[j].record_event_type = record_event_type
                            }
                            this.$api.set.sd_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                                if (res && res.result == "" && res.status == "mount") {
                                    this.sd_sign = true;
                                    this.sd_mode_sign = true;
                                    if (res.conf) {
                                        this.record_mode = res.conf.record_mode;
                                    }
                                    String.prototype.format = function() {
                                        if (arguments.length == 0) return this;
                                        let obj = arguments[0];
                                        let s = this;
                                        for (let key in obj) {
                                            s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
                                        }
                                        return s;
                                    }
                                    let sd = res.capacity / 1000;
                                    let temp = 2;
                                    for (let i = 0; i < 15; i++) {
                                        if (sd < temp) {
                                            sd = temp;
                                            break;
                                        }
                                        temp = temp << 1;
                                    }
                                    let data_normal = {
                                        size: sd + "G",
                                        days: Math.round(res.capacity / 1000 / 8)
                                    }
                                    let data_long_video = {
                                        size: sd + "G",
                                        days: Math.round(res.capacity / 1000 / 3)
                                    }
                                    let data_super_video = {
                                        size: sd + "G",
                                        days: Math.round(res.capacity / 1000 / 2)
                                    }
                                    this.normal_hint = mcs_normal_mode_hint.format(data_normal);
                                    this.long_video_hint = mcs_long_video_mode_hint.format(data_long_video);
                                    this.super_video_hint = mcs_super_long_video_mode_hint.format(data_super_video);
                                } else {
                                    this.sd_sign = false; //未检测到sd卡
                                }
                            })
                        }
                    })
                })
            },
            // 联动框架方法
            new_process() {
                this.$api.set.dev_info({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                    this.face_detect = res.face_detect;
                    this.sound_detect = res.sound_detect;
                    this.human_detect = res.human_detect;
                    //// console.log(res, 'res_profile_get')
                    this.$api.set.profile_get({
                        sn: this.$store.state.jumpPageData.selectDeviceIpc
                    }).then(res_profile_get => {
                        this.new_record_get_ack(res_profile_get)
                    })
                })
            },
            async new_record_get_ack(msg) { // ccm_dev_profile_get获取附件接口回调函数
                // console.log(msg, "进入获取附件接口函数")
                // 关闭弹窗
                // _this.publicFunc.closeBufferPage()
                if (msg && msg.result == "") {
                    this.record_all_dev = msg.data.info.dev
                    for (let index = 0; index < this.record_all_dev.length; index++) {
                        let item = this.record_all_dev[index]
                        item.plan = []
                        if (item.id === "face_detect") {
                            if (this.face_detect != 1) {
                                this.record_all_dev.splice(index, 1)
                                index = index - 1
                                continue
                            }
                        }
                        if (item.id === "sound_detect") {
                            if (this.sound_detect != 1) {
                                this.record_all_dev.splice(index, 1)
                                index = index - 1
                                continue
                            }
                        }
                        if (item.id === "human_detect") {
                            if (this.human_detect != 1) {
                                this.record_all_dev.splice(index, 1)
                                index = index - 1
                            }
                        }
                    }
                    //将所有外设的id改为io以方便计划表的设置
                    // this.record_all_dev = this.record_all_dev.sort(this.dev_type_sort)
                    for (let i = 0; i < this.record_all_dev.length; i++) {
                        let item = this.record_all_dev[i]
                        let plan_eftiv_val = [] //计划表有效值（index==0）
                        await this.$api.set.alarm_sche_get({
                            sn: this.$store.state.jumpPageData.selectDeviceIpc,
                            exdev_id: item.id
                        }).then(res => {
                            if (res && res.result == '') {
                                item.origin_plan = res.data.sche.plan || [] //原有的计划表
                                if (!res.data.sche.plan) {
                                    item.plan = []
                                    item.alarm_status = "off"
                                    item.action_name_list = []
                                    this.new_record_final_all_dev.push(item)
                                    item.sche_form = this.sche_format(item.plan)
                                } else {
                                    this.plan_tmp = res.data.sche.plan
                                    item.sche_form = this.sche_format(this.plan_tmp)
                                    let plan_filter = this.plan_tmp.filter(function(item, i) {
                                        if (item.action_name) {
                                            if (item.action_name.filter(function(s_item, s_index) {
                                                    return s_item.name == 'record'
                                                }).length > 0) {
                                                return item
                                            }
                                        }
                                    })
                                    if (plan_filter.length > 0) {
                                        item.alarm_status = "on"
                                        item.plan = this.time_deal(plan_filter);
                                    } else {
                                        item.alarm_status = "off"
                                        item.plan = []
                                    }
                                    // // console.log(item, "进入alarm_sche_get后得到的item")
                                    this.new_record_final_all_dev.push(item)
                                }
                                // console.log(this.new_record_final_all_dev, "new_record_final_all_dev", this.record_all_dev)
                                if (this.new_record_final_all_dev.length === this.record_all_dev.length) {
                                    this.new_record_final_all_dev = this.new_record_final_all_dev.sort(this.dev_type_sort)
                                    this.new_record_creat_div(item, i) //开始动态打印div
                                }
                            } else {
                                this.publicFunc.msg_tips({ msg: res.result, type: 'error', timeout: 3000 })
                                // 关闭弹窗
                                this.publicFunc.closeBufferPage()
                                return
                            }
                        })
                    }
                } else {
                    this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 })
                    // 关闭弹窗
                    this.publicFunc.closeBufferPage()
                    return
                }
            },
            new_record_creat_div() { // 绘制设置右侧详情dom
                this.publicFunc.closeBufferPage()
                // console.log('执行关闭弹窗')
                let showArr = []
                for (let i = 0; i < this.new_record_final_all_dev.length; i++) {
                    let dev_item = this.new_record_final_all_dev[i]
                    let classNameString = (i == this.new_record_final_all_dev.length - 1 ? 'menu_list2_last record_event_btn_new flag_click_event' :
                        'menu_list2 record_event_btn_new flag_click_event')
                    let nickNameStrting = (dev_item.type == 2 || dev_item.type == 4 || dev_item.type == 5 || dev_item.type == 6 ? (dev_item.nick == "" ? this.all_dev_name[dev_item.type] : dev_item.nick) : this.all_dev_name[dev_item.type])
                    showArr.push({
                        classNameString: classNameString,
                        id: dev_item.id,
                        type: dev_item.type,
                        record_event_name: nickNameStrting,
                        record_event_type: dev_item.plan.length > 0 ? mcs_turn_on : mcs_turn_off
                    })
                }
                for (let i = 0; i < this.new_record_final_all_dev.length; i++) {
                    let tmp = this.new_record_final_all_dev[i]
                    for (let j = 0; j < tmp.plan.length; j++) {
                        let final_plan_temp = tmp.plan[j]
                        let day_arr = final_plan_temp.day.split("、")
                        final_plan_temp.day = this.change_day_to_arr(day_arr)
                    }
                }
                this.$set(this.scene_data_out, 'dev', showArr) // 将渲染的内容赋值到scene_data_out.dev中
                // console.log(this.scene_data_out.dev, 'this.scene_data_out.dev')

                this.$api.set.plan_record_get({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                    this.plan_record_get_ack(res)
                })
            },
            plan_record_get_ack(msg) {
                let _this = this
                // // console.log(msg, "plan_record_get_ack_msg")
                if (msg.result == "") {
                    this.record_plan_continue.id = "c_record"
                    this.record_plan_continue.nick = "c_record"
                    this.record_plan_continue.type = 0
                    this.record_plan_continue.origin_plan = msg.data.sche.plan || [] //原有的计划表
                    if (msg.data.sche.plan) {
                        let record_select = msg.data.sche.plan.filter(function(item) {
                            return item.index == 0;
                        })
                        this.record_plan_continue.sche_form = this.sche_format(msg.data.sche.plan)
                        if (record_select.length > 0) {
                            this.record_plan_continue.alarm_status = "on"
                            record_select = this.time_deal(record_select)
                            record_select.forEach(function(item, index) {
                                let day_arr = item.day.split("、")
                                item.day = _this.change_day_to_arr(day_arr) // forEach函数内需要全局this
                            })
                            this.record_plan_continue.plan = record_select
                        } else {
                            this.record_plan_continue.alarm_status = "off"
                            this.record_plan_continue.plan = []
                            this.record_plan_continue.sche_form = this.sche_format(this.record_plan_continue.plan)
                        }
                    } else {
                        this.record_plan_continue.alarm_status = "off"
                        this.record_plan_continue.plan = []
                        this.record_plan_continue.sche_form = this.sche_format(this.record_plan_continue.plan)

                    }
                    this.record_plan_continue.action_name_list = [{ name: 'record', times: 0, control_time: 8000, continue_time: 16000 }]
                } else {
                    this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
                    this.publicFunc.closeBufferPage()
                    return;
                }
                // console.log(this.record_plan_continue, "获取持续计划表后record_plan_continue内容")
                this.$api.set.dev_action_get({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc,
                    action_name: "oflag"
                }).then(res => {
                    this.c_record_switch_get(res)
                })
            },
            c_record_switch_get(msg) { // ccm_dev_action_get获取动作开关接口回调
                // console.log("enter c_record_switch_get")
                if (msg && msg.result == "") {
                    // console.log(msg, "ccm_dev_action_get_ack接口返回参数")
                    this.$api.set.sd_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                        this.record_sd_get_ack(res)
                        if (this.sd_sign) {
                            if (msg.data.info.enable == 0) {
                                $("#is_show").text(mcs_turn_off)
                                this.record_plan_continue.alarm_status = "off"
                            } else {
                                // console.log(this.record_plan_continue.alarm_status, "查看record_plan_continue参数内容")
                                //这种情况是当持续录像的总开关是开但计划表为空，开关状态照样为关
                                if (this.record_plan_continue.alarm_status == "off") {
                                    $("#is_show").text(mcs_turn_off)
                                } else {
                                    $("#is_show").text(mcs_turn_on)
                                    this.record_plan_continue.alarm_status = "on"
                                }
                            }
                        }
                    })
                } else {
                    this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
                    this.publicFunc.closeBufferPage()
                }
            },
            record_sd_get_ack(msg) {
                // console.log(msg, "enter sd_get_ack")
                // // console.log("查看record_plan_continue", record_plan_continue)
                let length = this.publicFunc.mx(".list_info_select").length;
                let record_mode
                if (msg && msg.result == "" && msg.status == "mount") {
                    this.publicFunc.closeBufferPage()
                    this.sd_sign = true
                    this.sd_mode_sign = true
                    if (msg.conf) {
                        this.record_mode = msg.conf.record_mode
                    }
                    //record memory hint
                    String.prototype.format = function() {
                        if (arguments.length == 0) return this;
                        let obj = arguments[0];
                        let s = this;
                        for (let key in obj) {
                            s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
                        }
                        return s;
                    }
                    let sd = msg.capacity / 1000;
                    let temp = 2;
                    for (let i = 0; i < 15; i++) {
                        if (sd < temp) {
                            sd = temp;
                            break;
                        }
                        temp = temp << 1;

                    }
                    let data_normal = {
                        size: sd + "G",
                        days: Math.round(msg.capacity / 1000 / 8)
                    }
                    let data_long_video = {
                        size: sd + "G",
                        days: Math.round(msg.capacity / 1000 / 3)
                    }
                    let data_super_video = {
                        size: sd + "G",
                        days: Math.round(msg.capacity / 1000 / 2)
                    }
                    this.normal_hint = mcs_normal_mode_hint.format(data_normal)
                    this.long_video_hint = mcs_long_video_mode_hint.format(data_long_video)
                    this.super_video_hint = mcs_super_long_video_mode_hint.format(data_super_video)

                    if (msg.status != "mount") {
                        $("#sd_card").hide();
                        $("#submit_apply").hide();
                    }
                    if (msg.status == "empty") {
                        $("#new_record_continue").text(mcs_close)
                        this.record_plan_continue.alarm_status = "off"
                        this.record_plan_continue.sd_flag = 'none'
                    }
                    // 有存储卡的情况下允许调用录像模式
                    // this.mode_sd_get_ack_event()
                } else {
                    // 关闭遮罩层以及录像模式选择
                    this.publicFunc.closeBufferPage()
                    // $(".sd_mode").hide();
                    this.sd_sign = false
                    if (msg.no_sdcard) { //没有SD卡
                        this.publicFunc.msg_tips({ msg: msg.no_sdcard, type: 'error', timeout: 3000 });
                    } else if (msg.status === 'umount') { //SD卡已卸载
                        this.publicFunc.msg_tips({ msg: 'SD'+ mcs_unmounted, type: 'error', timeout: 3000 });
                    } else {
                        this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
                    }
                }
                // 移植部分 可能没有作用暂做保留
                let new_record_open_dev = this.new_record_final_all_dev.filter(function(item) {
                    return item.alarm_status == 'on'
                })
                if (new_record_open_dev.length == 0 && this.record_plan_continue.alarm_status == 'off') {
                    $('.new_record_list').css('color', '#999')
                } else {
                    $('.new_record_list').css('color', '#323232')
                }
            },
            // 工具函数
            change_day_to_arr(arr) {
                let week_standard = [
                    mcs_Sunday_and,
                    mcs_Monday_and,
                    mcs_Tuesday_and,
                    mcs_Wednesday_and,
                    mcs_Thursday_and,
                    mcs_Friday_and,
                    mcs_Saturday_and
                ]
                let final_arr = []
                if (arr[0] == mcs_every_day) {
                    final_arr = [1, 1, 1, 1, 1, 1, 1]
                } else {
                    for (let i = 0; i < 7; i++) {
                        if (arr.indexOf(week_standard[i]) == -1) {
                            final_arr[i] = 0
                        } else {
                            final_arr[i] = 1
                        }
                    }
                }
                return final_arr;
            },
            time_deal(arr) {
                // // console.log(arr)
                let week_standard = [
                    mcs_Sunday_and,
                    mcs_Monday_and,
                    mcs_Tuesday_and,
                    mcs_Wednesday_and,
                    mcs_Thursday_and,
                    mcs_Friday_and,
                    mcs_Saturday_and
                ]
                let alarm_plan = []
                let alarm_arr = []
                let clock_str = []
                let day_str = []
                let alarm_all_day_choose = ""
                arr.forEach(function(item, index) {
                    let clock_temp = {}
                    clock_temp.start_clock = item.start / 3600 % 24 < 10 ? item.start / 3600 % 24 + ":00" : item.start / 3600 % 24 + ":00"
                    clock_temp.end_clock = item.end / 3600 % 24 == 0 ? "24:00" : item.end / 3600 % 24 < 10 ? item.end / 3600 % 24 + ":00" : item.end / 3600 % 24 + ":00"
                    clock_temp.day_num = week_standard[parseInt(item.start / 3600 / 24)]
                    //跨天处理 大于一天(分为刚好end_time为整数天或者不为整数天)
                    if (parseInt(item.end / 3600 / 24) - parseInt(item.start / 3600 / 24) > 1) {
                        if (parseInt(item.end / 3600 / 24) == item.end / 3600 / 24) {
                            alarm_all_day_choose = week_standard.slice(parseInt(item.start / 3600 / 24) + 1, parseInt(item.end / 3600 / 24)).join("、")
                            alarm_arr.push({ start_clock: clock_temp.start_clock, end_clock: "24:00", day_num: clock_temp.day_num }, { start_clock: "0:00", end_clock: "24:00", day_num: alarm_all_day_choose })
                        } else {
                            alarm_all_day_choose = week_standard.slice(parseInt(item.start / 3600 / 24) + 1, parseInt(item.end / 3600 / 24)).join("、")
                            alarm_arr.push({ start_clock: clock_temp.start_clock, end_clock: "24:00", day_num: clock_temp.day_num }, { start_clock: "0:00", end_clock: "24:00", day_num: alarm_all_day_choose }, { start_clock: "0:00", end_clock: clock_temp.end_clock, day_num: week_standard[parseInt(item.end / 3600 / 24)] })
                        }
                    }
                    //跨天处理 小于一天
                    else if (parseInt(item.end / 3600 / 24) - parseInt(item.start / 3600 / 24) == 1 && parseInt(item.end / 3600 / 24) != item.end / 3600 / 24) {
                        let middle_end_clock = clock_temp.end_clock
                        clock_temp.end_clock = "24:00"
                        clock_temp.day_num = week_standard[parseInt(item.start / 3600 / 24)]
                        alarm_arr.push(clock_temp, { start_clock: "0:00", end_clock: middle_end_clock, day_num: week_standard[parseInt(item.start / 3600 / 24) + 1] })

                    } else {
                        clock_temp.day_num = week_standard[parseInt(item.start / 3600 / 24)]
                        alarm_arr.push(clock_temp)
                    }
                })

                // // console.log(alarm_arr)
                for (let i = 0; i < alarm_arr.length; i++) {
                    if (i != alarm_arr.length - 1) {
                        let temp = alarm_arr[i]
                        let next = alarm_arr[i + 1]
                        if (temp.end_clock == next.start_clock && temp.day_num == next.day_num) {
                            let insert_obj = { start_clock: temp.start_clock, end_clock: next.end_clock, day_num: temp.day_num }
                            alarm_arr.splice(i, 2, insert_obj)
                            i = i - 1
                        }

                    }
                }
                // // console.log(alarm_arr)
                // 若出现同样的开始和结束时间则将对应的日期连接在原有的日期时间上， 否则直接push
                for (let i = 0; i < alarm_arr.length; i++) {
                    let tmp = alarm_arr[i]
                    let str_tmp = tmp.start_clock + "," + tmp.end_clock
                    if (clock_str.indexOf(str_tmp) == -1) {
                        clock_str.push(str_tmp)
                        day_str.push(tmp.day_num)
                    } else {
                        day_str[clock_str.indexOf(str_tmp)] += "、" + tmp.day_num
                    }
                }
                for (let i = 0; i < clock_str.length; i++) {
                    let temp = clock_str[i]
                    let alarm_plan_temp = {}
                    alarm_plan_temp.start = temp.split(",")[0]
                    alarm_plan_temp.start_num = parseInt(alarm_plan_temp.start)
                    alarm_plan_temp.end = temp.split(",")[1]
                    alarm_plan_temp.end_num = parseInt(alarm_plan_temp.end)
                    if (day_str[i].split("、").length == 7) {
                        alarm_plan_temp.day = mcs_every_day
                    } else {
                        alarm_plan_temp.day = day_str[i]
                    }
                    alarm_plan.push(alarm_plan_temp)
                }
                // // console.log(alarm_plan)
                return alarm_plan;

            },
            dev_type_sort(a, b) {
                return a.type - b.type;
            },
            sche_format(sche) { // 生成7*24小时计划表
                // console.log(sche, 'sche_format')
                let start_h = ''
                let end_h = ''
                let start_day = ''
                let end_day = ''
                let day_h = []
                let arr_h = []
                for (let i = 0; i < 25; i++) {
                    arr_h.push(0)
                }
                for (let i = 0; i < 7; i++) {
                    day_h.push(arr_h.join(''))
                }
                //  //// console.log(day_h)
                if (sche.length > 0) {
                    sche.forEach(function(item, index) {
                        start_h = parseInt(item.start / 3600 % 24)
                        end_h = parseInt(item.end / 3600 % 24) == 0 ? 24 : parseInt(item.end / 3600 % 24)
                        start_day = parseInt(item.start / 86400)
                        end_day = parseInt(item.end / 86401)
                        let add_flag = item.flag >= 8 ? item.flag - 8 : item.flag
                        if (start_day == end_day) {
                            if (item.action_name) {
                                let tt = day_h[start_day].split('').map(Number)
                                for (let i = 0; i < 25; i++) {
                                    (function(i) {
                                        if (i >= start_h && i < end_h) {
                                            tt[i] += add_flag
                                        } else {
                                            tt[i] += 0
                                        }
                                    })(i)
                                }
                                day_h[start_day] = tt.join('')
                            }
                        } else {
                            if (item.action_name) {
                                let t_s = day_h[start_day].split('').map(Number)
                                let t_e = day_h[end_day].split('').map(Number)
                                for (let i = 0; i < 25; i++) {
                                    (function(i) {
                                        if (i >= start_h && i < 24) {
                                            t_s[i] += add_flag
                                        } else {
                                            t_s[i] += 0
                                        }
                                    })(i)
                                }
                                day_h[start_day] = t_s.join('')
                                for (let i = start_day + 1; i < end_day; i++) {
                                    let temp = []
                                    for (let j = 0; j < 25; j++) {
                                        if (j >= 0 && j < 24) {
                                            temp.push(add_flag)
                                        } else {
                                            temp.push(0)
                                        }
                                    }
                                    day_h[i] = temp.join('')
                                }
                                for (let i = 0; i < 25; i++) {
                                    (function(i) {
                                        if (i < end_h) {
                                            t_e[i] += add_flag
                                        } else {
                                            t_e[i] += 0
                                        }
                                    })(i)

                                }
                                day_h[end_day] = t_e.join('')
                            }

                        }

                    })
                }
                let final_form = []
                day_h.forEach(function(item, index) {
                    final_form.push(item.split('').map(Number))
                })
                // console.log(final_form, 'final_form')
                return final_form;
            },
        },
        components: {
            timePage
        }
    }
</script>

<style lang='scss'>
    @import '../../../css/public.scss';

    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }

    #record_plan {
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
    }

    .menu_list {
        overflow: hidden;
        height: 50px;
        border-bottom: 1px solid rgb(204, 204, 204);
        line-height: 50px;

        &:last-child {
            border-bottom: none;
            border-top: 1px solid rgb(204, 204, 204);
        }
    }

    .list_name {
        width: 100%;
    }

    .list_name_title {
        float: left;
        font-size: 14px;
        color: #666;
    }

    .list_name_tips {
        float: right;
        font-size: 14px;
        color: #666;
    }

    .menu_list_mode {
        border-bottom: 1px solid #ccc;
        padding: 10px 0;
        color: #000;
        margin-top: 20px;
    }

    #record {
        input[type='radio'] {
            appearance: none;
            -webkit-appearance: none;
            outline: none;
            margin: 0;
            vertical-align: text-bottom;
            margin-right: 0.1rem;
        }
    }

    .record_sd_calculate {
        height: 35px;
        font-size: 14px;
        line-height: 35px;
        color: $projectColor;
    }
</style>