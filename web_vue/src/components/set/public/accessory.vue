<template>
    <div id='accessory' class='list_right_box'>
        <div v-if='scene_list_add_page == "initial"'>
            <div v-for='(item,index) in accessory_data' :key='index'>
                <div v-if='item.weather_show && item.dev_type != 10' class='option_scene_list option_scene_list_btn' :attachmen_id='item.dev_id' :attachmen_type='item.dev_type' :attachmen_class='item.scene_class' :attachmen_nick='item.dev_nick' @click='accessory_btn'>
                    <div :class='"scene_list_img " + item.scene_class'></div>
                    <div class='option_scene_list_right'>
                        <div class='option_scene_list_text'>
                            <div class='option_scene_list_text_left'> {{item.dev_type_name}} </div>
                            <!-- <div class='option_scene_list_text_right'> {{item.id_nick}} </div> -->
                        </div>
                    </div>
                </div>
            </div>
            <div id='option_scene_list_add' attachmen_type='0' v-if='scene_list_add_sign' @click='scene_list_add_page = "add_scene"'>
                <div class='scene_list_img scene_list_add'></div>
                <div class='option_scene_list_right'>
                    <div>
                        <div class='option_scene_list_text_left'></div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if='scene_list_add_page == "add_scene"'>
            <div id='option_attachmen_add_box'>
                <div id='option_attachmen_add_title'>
                    <div class='option_attachmen_back' @click='scene_list_add_page = "initial"'></div>
                    <div class='option_attachmen_title_text'> {{mcs_select}} {{mcs_accessory_type}} </div>
                </div>
                <div class='option_attachmen_content'>
                    <div class='attachmen_add_type_list' type='door' @click='search_secne_btn'>
                        <div id='select_add_door_img'></div>
                        <div class='select_add_name'> {{mcs_magnetic}} </div>
                    </div>
                    <div class='attachmen_add_type_list' type='sos' @click='search_secne_btn'>
                        <div id='select_add_sos_img'></div>
                        <div class='select_add_name'> {{mcs_sos}} </div>
                    </div>
                    <!-- <div class='attachmen_add_type_list' type='infra'>
                        <div id='select_add_infra_red_img'></div>
                        <div class='select_add_name'></div>
                    </div>
                    <div class='attachmen_add_type_list_end' type='smoke'>
                        <div id='select_add_smoke_img'></div>
                        <div class='select_add_name'></div>
                    </div> -->
                </div>
            </div>
        </div>
        <div v-else-if='scene_list_add_page == "search_secne"'>
            <div id='option_attachmen_search_box'>
                <div id='option_attachmen_search_title'>
                    <div class='option_attachmen_back' @click='scene_list_add_page = "add_scene"'></div>
                    <div class='option_attachmen_title_text'> {{mcs_add_accessory}} </div>
                </div>
                <div class='option_attachmen_content'>
                    <img id='option_attachmen_search_content_img' :src='demo_img_url'>
                    <div id='option_attachmen_search_content_tips'> {{content_tips}} </div>
                    <div id='option_attachmen_search_content_btn' @click='option_attachmen_search_content_btn' :style='searching_temp?"background-color:#ccc":"background-color:#00a6ba"'>
                        <img id='option_attachmen_search_content_btn_ico' :src="require('@/assets/device/search.png')" />
                        <span id='option_attachmen_search_content_btn_txt'> {{searching_text}} </span>
                    </div>
                </div>
                <div id='option_attachmen_search_list_box'></div>
            </div>
        </div>
        <div v-else-if='scene_list_add_page == "option_box"'>
            <div id='option_attachmen_edit_box'>
                <div id='option_attachmen_edit_title'>
                    <div id='option_attachmen_edit_back'></div>
                    <div id='option_attachmen_search_title_text'> {{mcs_add_accessory}} </div>
                </div>
                <div id='option_attachmen_edit_content'>
                    <div id='option_attachmen_edit_content_id'> {{mcs_device_id}} : {{option_data.id}} </div>
                    <div id='option_attachmen_edit_content_nick'><input type='text' id='option_attachmen_edit_content_nick_input' v-model="option_nick_input"></div>
                </div>
                <div id='option_attachmen_edit_submit' @click='option_attachmen_edit_submit'> {{mcs_ok}} </div>
            </div>
        </div>
        <div v-else-if='scene_list_add_page == "create_secne"'>
            <div id='option_attachmen_result_box'>
                <div id='option_attachmen_result_title'>
                    <div id='option_attachmen_result_back' @click='scene_list_add_page = "option_box"'></div>
                    <div id='option_attachmen_search_result_text'> {{mcs_add_accessory}} </div>
                </div>
                <div id='option_attachmen_result_content'>
                    <div id='option_attachmen_result_content_img' :style='content_img'></div>
                    <div id='option_attachmen_result_content_text'> {{content_text}} </div>
                </div>
                <div id='option_attachmen_result_submit'> {{content_btn}} </div>
            </div>
        </div>
        <scene-page v-if='setScenePage' :setScenePageObj='setScenePageObj' @scene_page_close='scene_page_close'></scene-page>
    </div>
</template>

<script>
    import scenePage from './setScenePage'
    export default {
        data() {
            return {
                // 多国语言
                mcs_select: mcs_select, //请选择
                mcs_accessory_type: mcs_accessory_type, //附件类型
                mcs_magnetic: mcs_magnetic, //门磁
                mcs_sos: mcs_sos, //紧急按钮
                mcs_add_accessory: mcs_add_accessory, //添加附件
                mcs_search: mcs_search, //搜索
                mcs_ok: mcs_ok, //确定
                mcs_device_id: mcs_device_id, //设备ID

                sence_data: '',
                accessory_data: [],
                setScenePage: false, //控制弹窗是否显示
                setScenePageObj: {}, //控制弹窗展示对象
                scene_list_add_sign: false, //是否显示添加外设
                scene_list_add_page: 'initial', //添加外设跳转页
                content_tips: '', //添加外设文本
                demo_img_url: '', //添加外设图片
                secne_type: '', //外设类型
                searching_temp: false, //是否正在搜索
                searching_text: mcs_search, //搜索文本
                exdev_get_time: '', //搜索外设定时器
                content_img: '',
                content_text: '',
                content_btn: '',
                option_data: {},
                option_nick_input: mcs_input_nick,
            }
        },
        mounted() {
            this.$api.set.scene_get({
                sn: this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
                this.scene_get_ack(res)
            })
        },
        methods: {
            scene_get_ack(res) { //获取外设数据后
                this.accessory_data = []
                this.sence_data = res.data.info.scene;
                let scene_devs = res.data.info.scene[1] ? res.data.info.scene[1].dev : "";
                for (let i = 0; i < scene_devs.length; i++) {
                    this.accessory_data.push({
                        dev_id: scene_devs[i].id,
                        dev_nick: scene_devs[i].nick,
                        dev_type: scene_devs[i].type
                    })
                    let dev_type = scene_devs[i].type;
                    let scene_class;
                    let dev_type_name;

                    if (dev_type == 1) {
                        this.accessory_data[i].scene_class = 'scene_list_motion';
                        this.accessory_data[i].dev_type_name = mcs_motion_detection;
                    } else if (dev_type == 2) { //红外线探测器
                        this.accessory_data[i].scene_class = 'scene_list_infra_detector'
                        this.accessory_data[i].dev_type_name = mcs_Infrared_detector;
                    } else if (dev_type == 4) { //烟雾报警器
                        this.accessory_data[i].scene_class = 'scene_list_smoke_detector'
                        this.accessory_data[i].dev_type_name = mcs_smoke_detector;
                    } else if (dev_type == 5) {
                        this.accessory_data[i].scene_class = 'scene_list_sos';
                        this.accessory_data[i].dev_type_name = mcs_sos;
                    } else if (dev_type == 6) {
                        this.accessory_data[i].scene_class = 'scene_list_door';
                        this.accessory_data[i].dev_type_name = mcs_magnetic;
                    } else if (dev_type == 8) {
                        this.accessory_data[i].scene_class = 'scene_list_face';
                        this.accessory_data[i].dev_type_name = mcs_face_detection;
                    } else if (dev_type == 9) {
                        this.accessory_data[i].scene_class = 'scene_list_sound'
                        this.accessory_data[i].dev_type_name = mcs_sound_detection;
                    }
                    // else if(dev_type == 10){ //human_detect
                    //    // continue;
                    //    accessory_data[i].scene_class= 'scene_list_human_detector' //人型检测
                    //    accessory_data[i].dev_type_name = mrs_human_detection;
                    // }
                    this.accessory_data[i].id_nick = scene_devs[i].nick ? scene_devs[i].nick : scene_devs[i].id
                    this.accessory_data[i].weather_show = (dev_type == 8 || dev_type == 9 || dev_type == 10) ? "true" : "false";
                }
                this.$api.set.dev_info({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                    let face_detect = res.face_detect;
                    let sound_detect = res.sound_detect;
                    this.$store.dispatch('setMotionTrack', res.motion_track)
                    if (face_detect == 1 || sound_detect == 1) {
                        let l_dom_option_scene_list_btn = this.publicFunc.mx(".option_scene_list_btn");
                        for (let i = 0; i < l_dom_option_scene_list_btn.length; i++) {
                            if (l_dom_option_scene_list_btn[i].getAttribute("attachmen_type") === "8" && face_detect === "1") {
                                l_dom_option_scene_list_btn[i].style.display = "block";
                            }
                            if (l_dom_option_scene_list_btn[i].getAttribute("attachmen_type") === "9" && sound_detect === "1") {
                                l_dom_option_scene_list_btn[i].style.display = "block";
                            }
                        }
                    }
                    if (res.rffreq === "868") {
                        this.scene_list_add_sign = true;
                    }
                })
            },
            scene_page_close() { //关闭弹窗
                this.setScenePage = false;
                this.$api.set.scene_get({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                    this.scene_get_ack(res)
                })
            },
            accessory_btn(e) { //打开弹窗
                this.setScenePage = true;
                let dev_type = e.currentTarget.getAttribute('attachmen_type')
                let dev_ID = e.currentTarget.getAttribute('attachmen_id')
                this.$set(this.setScenePageObj, 'devID', dev_ID)
                this.$set(this.setScenePageObj, 'senceData', this.sence_data)
                if (dev_type == 1) { //移动侦测
                    this.$set(this.setScenePageObj, 'detailPageFlag', 'motionDetectPage')
                    this.$set(this.setScenePageObj, 'devType', 1)
                } else if (dev_type == 5) { //紧急按钮
                    this.$set(this.setScenePageObj, 'detailPageFlag', 'sosPage')
                    this.$set(this.setScenePageObj, 'devType', 5)
                } else if (dev_type == 6) { //门磁
                    this.$set(this.setScenePageObj, 'detailPageFlag', 'magneticPage')
                    this.$set(this.setScenePageObj, 'devType', 6)
                } else if (dev_type == 8) { //人脸检测
                    this.$set(this.setScenePageObj, 'detailPageFlag', 'faceDetectPage')
                    this.$set(this.setScenePageObj, 'devType', 8)
                } else if (dev_type == 9) { //声音检测 
                    this.$set(this.setScenePageObj, 'detailPageFlag', 'soundDetectPage')
                    this.$set(this.setScenePageObj, 'devType', 9)
                }
            },
            search_secne_btn(e) { //添加外设
                let secne_type = e.currentTarget.getAttribute('type')
                this.scene_list_add_page = "search_secne"
                if (secne_type == "door") {
                    this.demo_img_url = require('@/assets/device/door.gif');
                    this.secne_type = 6;
                    this.content_tips = mcs_search_magnetic_start + mcs_search_magnetic_end;
                } else if (secne_type == "sos") {
                    this.demo_img_url = require('@/assets/device/sos.gif');
                    this.secne_type = 5;
                    this.content_tips = mcs_search_sos_strat + mcs_search_sos_end;
                } else if (secne_type == "infra") {
                    // this.demo_img_url = require('@/assets/device/pir.gif');//无该图片
                    this.content_tips = "";
                } else if (secne_type == "smoke") {
                    // this.demo_img_url = require('@/assets/device/smoke.gif');//无该图片
                    this.content_tips = "";
                }
            },
            option_attachmen_search_content_btn() { //搜索外设
                let _this = this;
                _this.searching_temp = !_this.searching_temp
                if (_this.searching_temp) {
                    _this.searching_text = mcs_search + "...";
                    _this.$api.set.exdev_discover({
                        flag: 1,
                        timeout: 100000,
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc
                    }).then(res => {
                        if (res && res.result == "") {
                            let time_num = 0;
                            _this.exdev_get_time = setInterval(function() {
                                time_num++;
                                if (time_num > 20 || !document.getElementById("option_attachmen_search_content_btn")) {
                                    clearInterval(_this.exdev_get_time);
                                    _this.searching_temp = false;
                                    _this.searching_text = mcs_search;
                                }
                                _this.$api.set.exdev_get({
                                    flag: 2,
                                    start: 0,
                                    counts: 100,
                                    sn: _this.$store.state.jumpPageData.selectDeviceIpc
                                }).then(res => {
                                    let list_img = "";
                                    if (_this.secne_type == 5) {
                                        list_img = "background:url(" + require("@/assets/device/add_sos.png") + ") no-repeat;";
                                    } else if (_this.secne_type == 6) {
                                        list_img = "background:url(" + require("@/assets/device/add_door.png") + ") no-repeat;";
                                    }
                                    if (res && res.result == "") {
                                        if (_this.publicFunc.mx("#option_attachmen_search_list_box")) {
                                            _this.publicFunc.mx("#option_attachmen_search_list_box").innerHTML = ""
                                            let data_devs = res.data.devs ? res.data.devs : "";
                                            for (let i = 0; i < data_devs.length; i++) {
                                                if (_this.secne_type == data_devs[i].type) {
                                                    _this.publicFunc.mx("#option_attachmen_search_list_box").innerHTML +=
                                                        "<div class='option_attachmen_search_list'>" +
                                                        "<div class='option_attachmen_search_list_img' style=" + list_img + "></div>" +
                                                        "<div class='option_attachmen_search_list_id'>ID:" + data_devs[i].id + "</div>" +
                                                        "<div class='option_attachmen_search_list_btn' index=" + i + " sn=" + data_devs[i].id + ">" + mcs_add + "</div>" +
                                                        "</div>"
                                                }
                                            }
                                            let l_dom_option_attachmen_search_list_btn = _this.publicFunc.mx(".option_attachmen_search_list_btn");
                                            for (let i = 0; i < l_dom_option_attachmen_search_list_btn.length; i++) {
                                                l_dom_option_attachmen_search_list_btn[i].onclick = function() {
                                                    let id = this.getAttribute("sn");
                                                    let index = this.getAttribute("index");
                                                    this.option_data.id = id;
                                                    this.option_data.data = data_devs[index];
                                                    this.scene_list_add_page = "option_box";
                                                    create_scene_edit_name_page(obj)
                                                }
                                            }

                                        }
                                    }
                                })
                            }, 3000);
                        }
                    })
                } else {
                    _this.searching_text = mcs_search;
                    clearInterval(_this.exdev_get_time);
                }

            },
            option_attachmen_edit_submit() {
                this.publicFunc.showBufferPage();
                this.$api.set.exdev_add({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc,
                    id: this.option_data.id,
                    model: 2,
                    ref: { num: 0 }
                }).then(res => {
                    exdev_add_ack(res, { num: 0 })

                    function exdev_add_ack(msg, ref) {
                        if (ref.num > 20) {
                            this.publicFunc.closeBufferPage()
                            return;
                        }
                        if (msg && msg.result == "") {
                            this.$api.set.exdev_get({
                                flag: 1,
                                start: 0,
                                counts: 100,
                                sn: this.$store.state.jumpPageData.selectDeviceIpc,
                                ref: { num: ref.num }
                            }).then(res => {
                                for (let i = 0; i < msg.data.devs.length; i++) {
                                    if (msg.data.devs[i].id == this.option_data.id) {
                                        let dev = this.option_data.data;
                                        if (this.option_nick_input != mcs_input_nick) {
                                            dev.nick = this.option_nick_input;
                                        }
                                        dev.flag = [7, 0]
                                        this.$api.set.exdev_set({
                                            sn: this.$store.state.jumpPageData.selectDeviceIpc,
                                            dev: dev
                                        }).then(res => {
                                            this.publicFunc.closeBufferPage()
                                            if (res && res.result == "") {
                                                this.option_data.result = 1;
                                                this.create_scene_result_page(this.option_data);
                                            } else {
                                                this.option_data.result = 0;
                                                this.create_scene_result_page(this.option_data);
                                            }
                                        })
                                        return
                                    }
                                }
                                exdev_add_ack({ result: "" }, { num: ++ref.num });
                            })
                        } else {
                            this.publicFunc.closeBufferPage()
                            this.create_scene_result_page({ result: 0 });
                        }
                    }
                })
            },
            create_scene_result_page(obj) {
                this.scene_list_add_page = "create_secne"
                let project_name = this.$store.state.jumpPageData.projectName;
                if (obj.result) {
                    switch (project_name) {
                        case "vimtag":
                            this.content_img = "background:url(" + require("@/assets/device/success.png") + ") no-repeat;";
                            break;
                        case "ebitcam":
                            this.content_img = "background:url(" + require("@/assets/ebitcam/ebit_success.png") + ") no-repeat;";
                            break;
                        default:
                            this.content_img = "background:url(" + require("@/assets/mipc/mipc_success.png") + ") no-repeat;";
                            break;
                    }
                    this.content_text = mcs_add_successfully;
                    this.content_btn = mcs_ok;
                } else {
                    switch (project_name) {
                        case "vimtag":
                            this.content_img = "background:url(" + require("@/assets/device/fail.png") + ") no-repeat;"
                            break;
                        case "ebitcam":
                            this.content_img = "background:url(" + require("@/assets/ebitcam/ebit_fail.png") + ") no-repeat;";
                            break;
                        default:
                            this.content_img = "background:url(" + require("@/assets/mipc/mipc_fail.png") + ") no-repeat;";
                            break;
                    }
                    this.content_text = mcs_add_failed;
                    this.content_btn = mcs_action_retry;
                }
            }
        },
        components: {
            scenePage
        }
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }

    .option_scene_list {
        width: 520px;
        padding: 20px 0;
        float: left;
        border-bottom: 1px solid $projectColor;
    }

    .scene_list_img {
        float: left;
        width: 120px;
        height: 120px;
        border: 1px solid #e1e1e1;
        margin-left: 50px;
        background-size: 100% 100%;
    }

    .scene_list_motion {
        /*background: url("../assets/device/scene_move.png") no-repeat 10px 0;*/
        background: url("../../../assets/device/scene_move.png") no-repeat -25px -20px;
    }

    .option_scene_list_right {
        float: left;
        margin-left: 20px;
        width: 320px;
    }

    .option_scene_list_text {
        width: 100%;
        margin-top: 10px;
        color: #333;
        font-size: 16px;
        float: left;
        cursor: default;
        display: flex;
        justify-content: space-between;
    }

    .scene_list_face {
        background: url("../../../assets/device/face_attachmen.png") no-repeat 0px 0;
        background-size: 100% 100%;
    }

    .scene_list_sound {
        background: url("../../../assets/device/sound_attachmen.png") no-repeat 0px 0;
        background-size: 100% 100%;
    }

    .scene_list_infra_detector {
        background: url("../../../assets/device/infra_detector_attachmen.png") no-repeat 0px 0;
        background-size: 100% 100%;
    }

    .scene_list_smoke_detector {
        background: url("../../../assets/device/smoke_detector_attachmen.png") no-repeat 0px 0;
        background-size: 100% 100%;
    }

    .scene_list_human_detector {
        /*6.4.3*/
        background: url("../../../assets/device/human_attachmen.png") no-repeat 0px 0;
        background-size: 100% 100%;
    }

    #option_scene_list_add {
        width: 520px;
        padding: 20px 0;
        float: left;
        /*border-top: 1px solid $projectColor;*/
        border-bottom: 1px solid $projectColor;
    }

    .scene_list_add {
        background: url("../../../assets/device/add_attachmen.png") no-repeat 16px 16px;
    }

    #option_attachmen_add_title {
        width: 100%;
        float: left;
    }

    .option_attachmen_back {
        float: left;
        width: 18px;
        height: 18px;
        margin-right: 10px;
        cursor: pointer;
        background: url(../../../assets/device/add_back.png) no-repeat;
    }

    .option_attachmen_title_text {
        font-size: 16px;
        color: #333;
    }

    .option_attachmen_content {
        width: 100%;
        float: left;
        height: 200px;
        border-top: 1px solid $projectColor;
        border-bottom: 1px solid $projectColor;
        text-align: center;
        margin-top: 14px;
    }

    .attachmen_add_type_list {
        width: 140px;
        height: 150px;
        margin-top: 25px;
        float: left;
        cursor: pointer;
        border-right: 1px solid #d6d7dc;
    }

    #select_add_door_img {
        width: 88px;
        height: 88px;
        margin-top: 20px;
        margin-left: 26px;
        background: url(../../../assets/device/add_door.png) no-repeat;
    }

    .select_add_name {
        width: 100%;
        text-align: center;
        font-size: 14px;
        color: #646464;
    }

    #select_add_sos_img {
        width: 88px;
        height: 88px;
        margin-top: 20px;
        margin-left: 26px;
        background: url(../../../assets/device/add_sos.png) no-repeat;
    }

    #option_attachmen_search_content_img {
        width: 200px;
        margin-top: 10px;
    }

    #option_attachmen_search_content_tips {
        font-size: 14px;
        margin-bottom: 10px;
    }

    #option_attachmen_search_content_btn {
        width: 200px;
        height: 28px;
        border-radius: 4px;
        text-align: center;
        line-height: 28px;
        cursor: pointer;
        background: $projectColor;
        margin: 0 auto;
        color: #fff;
    }

    #option_attachmen_search_content_btn_ico {
        margin-top: 4px;
        margin-right: 10px;
        width: 11px;
    }

    #option_attachmen_result_box {
        width: 570px;
    }

    #option_attachmen_result_title {
        width: 100%;
        float: left;
    }

    #option_attachmen_result_back {
        float: left;
        width: 18px;
        height: 18px;
        margin-right: 10px;
        cursor: pointer;
        background: url(../../../assets/device/add_back.png) no-repeat;
    }

    #option_attachmen_search_result_text {
        font-size: 16px;
        color: #333;
    }

    #option_attachmen_result_content {
        width: 100%;
        float: left;
        height: 200px;
        border-top: 1px solid $projectColor;
        border-bottom: 1px solid $projectColor;
        text-align: center;
        margin-top: 14px;
    }

    #option_attachmen_result_content_img {
        width: 80px;
        height: 80px;
        margin: 0 auto;
        margin-top: 50px;
    }

    #option_attachmen_result_content_text {
        margin-top: 14px;
    }

    #option_attachmen_result_submit {
        background: $projectColor;
        float: right;
        color: #fff;
        border: 1px solid $projectColor;
        border-radius: 5px;
        width: 120px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        margin-top: 30px;
        cursor: pointer;
    }

    #option_attachmen_edit_back {
        float: left;
        width: 18px;
        height: 18px;
        margin-right: 10px;
        cursor: pointer;
        background: url(../../../assets/device/add_back.png) no-repeat;
    }

    #option_attachmen_search_title_text {
        font-size: 16px;
        color: #333;
    }

    #option_attachmen_edit_content {
        width: 100%;
        float: left;
        height: 200px;
        border-top: 1px solid $projectColor;
        border-bottom: 1px solid $projectColor;
        text-align: center;
        margin-top: 14px;
    }

    #option_attachmen_edit_content_id {
        font-size: 14px;
        color: #646464;
        margin-top: 50px;
        margin-bottom: 15px;
    }

    #option_attachmen_edit_content_nick {
        width: 220px;
        margin: 0 auto;
        height: 24px;
        border: 1px solid $projectColor;
        border-radius: 15px;
    }

    #option_attachmen_edit_content_nick_input {
        width: 90%;
        height: 100%;
        border: none;
        color: #999;
        background: #efeff4;
    }

    #option_attachmen_edit_submit {
        background: $projectColor;
        float: right;
        color: #fff;
        border: 1px solid $projectColor;
        border-radius: 5px;
        width: 120px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        margin-top: 30px;
        cursor: pointer;
    }
</style>