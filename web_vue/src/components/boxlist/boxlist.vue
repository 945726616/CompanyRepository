<template>
    <div id='boxlist'>
        <div id='vimtag_device_list_box'>
            <div id='boxlist_menu_box'>
                <!-- 返回按钮 -->
                <div id='back' v-if='project_flag_name === "vimtag"' @click='back_btn'>
                    <div id='main_title_box_return_img'></div> {{mcs_back}}
                </div>
                <!-- 云盒子界面右上按钮行 -->
                <div :id='project_flag_name === "mipc"?"boxlist_left_menu":"boxlist_right_menu"'>
                    <!-- 添加设备 -->
                    <div id='boxlist_add_btn' class='boxlist_menu_box_btn' @click='boxlist_add_btn'>
                        <div :id='project_name+"_boxlist_add_btn_img"'></div> {{mcs_add_device}}
                    </div>
                    <!-- 搜索设备 -->
                    <div id='boxlist_search_btn' class='boxlist_btn' @click='boxlist_search_btn'>
                        <div :id='project_name+"_boxlist_search_btn_img"'></div> {{mcs_search_device}}
                        <!-- 搜索设备提示框 -->
                        <div id='boxlist_search_btn_down'> {{mrs_click_search}} </div>
                    </div>
                    <!-- 编辑(删除设备) -->
                    <div :id='project_flag_name+"_boxlist_edit_btn"' class='boxlist_btn' @click='edit_btn_sign = !edit_btn_sign'>
                        <div :id='project_name+"_boxlist_edit_btn_img"'></div> {{mcs_edit}}
                    </div>
                    <!-- 设置 -->
                    <div :id='project_flag_name+"_boxlist_set_btn"' @click='boxlist_set_btn'>
                        <div :id='project_name+"_boxlist_set_btn_img"'></div> {{mcs_settings}}
                    </div>
                </div>
            </div>
            <!-- 私有 -->
            <div id='box_per_ipc_box'>
                <div id='box_per_ipc' v-if='private_ipc_data && private_ipc_data.length>0 && project_flag_name === "vimtag"'> {{mcs_onvif_private}} </div>
                <div id='box_per_ipc_container' v-if='(private_ipc_data && private_ipc_data.length>0)'>
                    <div :class='project_flag_name === "vimtag"?"box_device_list_img":"mipc_box_device_list_img"' v-for='(item,index) in private_ipc_data' :key='index'>
                        <img class='box_camera_sign_picture' :sn='item.sn' :stat='item.online' @click='box_camera_btn' />
                        <div class='box_device_nick' :sn='item.sn'>
                            <div :class='item.online ?project_flag_name+"_box_device_online" : "box_device_offline"'></div>
                            <span class='box_device_nick_span'> {{item.nick}} </span>
                            <div class='del_box_ipc_btn' v-show='edit_btn_sign' @click='del_private_ipc_btn'></div>
                        </div>
                    </div>
                </div>
            </div>
            <!--开放接口 -->
            <div id='box_onvif_ipc_box'>
                <div id='box_onvif_ipc' v-if='box_onvif_ipc_sign && project_flag_name === "vimtag"'>ONVIF</div>
                <div id='box_onvif_ipc_container' v-if='onvif_ipc_data1 && onvif_ipc_data1.length>0'>
                    <div :class='project_flag_name === "vimtag"?"box_device_list_img":"mipc_box_device_list_img"' v-for='(item,index) in onvif_ipc_data1' :key='index'>
                        <img class='box_camera_sign_picture' :sn='item.conf.sn' :imgId='index' @click='box_camera_btn' />
                        <div class='box_device_nick' :sn='item.conf.sn' :uuid='item.conf.uuid'>
                            <div :class='item.connect_infos.status == 1 ? project_flag_name+"_box_device_online" : "box_device_offline"'></div>
                            <span class='box_device_nick_span'> {{decodeURI(item.conf.nick) ? decodeURI(item.conf.nick) : item.conf.sn}} </span>
                            <div class='box_delete_btn'>
                                <!-- 删除关联和录像 -->
                                <div class='del_box_ipc_btn' v-if='edit_btn_sign' @click='del_box_ipc_btn'></div>
                                <!-- 删除关联 -->
                                <div class='del_box_ipc_record_btn' v-if='edit_btn_sign' @click='del_box_ipc_record_btn'></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id='box_onvif_ipc_container' v-else-if='onvif_ipc_data2 && onvif_ipc_data2.length>0'>
                    <div :class='project_flag_name === "vimtag"?"box_device_list_img":"mipc_box_device_list_img"' v-for='(item,index) in onvif_ipc_data2' :key='index'>
                        <img class='box_camera_sign_picture' :sn='item.sn' @click='box_camera_btn' />
                        <div class='box_device_nick' :sn='item.sn'>
                            <!-- 暂时用conted==1代替在线判断 3时网络信号不好代替离线 -->
                            <div :class='item.conted == 1 ? project_flag_name+"_box_device_online" : "box_device_offline"'></div>
                            <span class='box_device_nick_span'> {{item.sn}} </span>
                            <div class='del_box_ipc_btn'></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id='box_per_ipc_container' style="flex-direction: column" v-if='private_ipc_data.length == 0 && onvif_ipc_data1.length == 0 && onvif_ipc_data2.length == 0'>
                <div id='empty_div_img'></div>
                <div class='empty_div_txt'> {{mcs_your_device_list_empty}} </div>
                <div id='empty_search_btn' @click='empty_search_btn'> {{mcs_search_device}} </div>
            </div>
        </div>
        <!-- 使用添加设备弹窗组件 -->
        <device-model :addDeviceModel='addDeviceModel' :addDeviceModelObj='addDeviceModelObj' @closeModel='closeModel' :onvif_box_search_ack='onvif_box_search_ack'></device-model>
        <div id='mask' v-if='addDeviceModel'></div>
    </div>
</template>

<script>
    import deviceModel from './addDeviceModel'
    export default {
        data() {
            return {
                //多国语言
                mcs_back: mcs_back, //返回
                mcs_add_device: mcs_add_device, //添加设备
                mcs_search_device: mcs_search_device, //搜索设备
                mrs_click_search: mrs_click_search, //点击搜索设备
                mcs_edit: mcs_edit, //编辑
                mcs_settings: mcs_settings, //设置
                mcs_onvif_private: mcs_onvif_private, //私有
                mcs_your_device_list_empty: mcs_your_device_list_empty, //您的设备列表为空

                project_name: '', //项目名
                project_flag_name: '', //判断是否为vimtag
                margin_width: '',
                box_onvif_ipc_sign: false, // 是否onvif盒子数据
                onvif_ipc_data: [], //onvif盒子数据
                onvif_ipc_data1: [], //onvif盒子dom渲染数据
                onvif_ipc_data2: [], //onvif盒子dom渲染数据
                boxlist_params: {}, //接受传过来的数据
                edit_btn_sign: false, // 是否点击编辑
                private_ipc_data: [], //私有盒子数据
                addDeviceModel: false, // 添加设备弹窗控制标识
                addDeviceModelObj: {}, // 添加设备弹窗展示数组
                l_get_onvif_flag: false, //用于判断onvif_list_get函数最后回调至get_onvif_list/get_onvif_unadd
            }
        },
        async mounted() {
            await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)

            this.project_flag_name = this.$store.state.jumpPageData.projectFlag ? "mipc" : "vimtag";
            this.boxlist_params = this.$route.params;
            this.project_name = this.$store.state.jumpPageData.projectName;
            this.publicFunc.showBufferPage();
            if (this.project_flag_name === 'vimtag') {
                let box_width = document.getElementById("vimtag_device_list_box").offsetWidth;
                let ipc_num = parseInt(box_width / 290)
                this.margin_width = parseInt((box_width - ipc_num * 300) / ipc_num);
                if (this.$store.state.user.userLanguage === "zh") {
                    this.publicFunc.mx("#boxlist_search_btn").onmouseenter = function() {
                        $('#boxlist_search_btn_down').show().delay(1500).hide(0);
                    }
                }
            }
            this.box_search();
        },
        methods: {
            del_box_ipc_btn(e) { //onvif删除关联和录像
                let _this = this;
                let data = e.currentTarget;
                let conf = {};
                conf.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                conf.sn = data.parentNode.parentNode.getAttribute("sn");
                conf.flag = 2;
                conf.uuid = data.parentNode.parentNode.getAttribute("uuid");
                _this.publicFunc.delete_tips({
                    content: mrs_delete_association_and_video,
                    func: function() {
                        _this.$api.boxlist.onvif_box_add_ipc(conf).then(res => { // ccm_box_set_ipc_req
                            if (res.result == '') { //如果删除关联成功 //ccm_box_set
                                _this.$api.history.history_delete({ // 调用历史删除接口
                                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                                    dev_sn: data.parentNode.parentNode.getAttribute('sn'),
                                }).then(msg => {
                                    if (msg.type === 'success') {
                                        _this.publicFunc.msg_tips({ msg: mrs_delete_association_and_video_succeed, type: "success", timeout: 3000 })
                                        data.parentNode.parentNode.parentNode.style.display = "none";
                                    } else {
                                        _this.publicFunc.msg_tips({ msg: mcs_delete_fail, type: "error", timeout: 3000 })
                                    }
                                })
                            } else if (msg.result == 'DevNotFound') {
                                _this.publicFunc.msg_tips({ msg: mrs_devide_does_not_exist, type: "error", timeout: 3000 })
                            }
                        })
                    }
                })
            },
            del_box_ipc_record_btn(e) { //onvif删除关联
                let _this = this;
                let data = e.currentTarget;
                let conf = {};
                conf.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                conf.sn = data.parentNode.parentNode.getAttribute("sn");
                conf.flag = 2;
                conf.uuid = data.parentNode.parentNode.getAttribute("uuid");
                _this.publicFunc.delete_tips({
                    content: mrs_delete_association,
                    func: function() {
                        _this.$api.boxlist.onvif_box_add_ipc(conf).then(res => { //发送删除设备请求
                            if (res.result == '') {
                                _this.publicFunc.msg_tips({ msg: mrs_delete_association_succeed, type: "success", timeout: 3000 });
                                data.parentNode.parentNode.parentNode.style.display = "none";
                            } else if (res.result == 'DevNotFound') {
                                _this.publicFunc.msg_tips({ msg: mrs_devide_does_not_exist, type: "error", timeout: 3000 })
                            }
                        })
                    }
                })
            },
            del_private_ipc_btn(e) { //私有设备删除录像
                let _this = this;
                let data = e.currentTarget;
                let dev_sn = data.parentNode.getAttribute("sn");
                _this.publicFunc.delete_tips({
                    content: mrs_delete_video,
                    func: function() {
                        _this.$api.history.history_delete({ // 调用历史删除接口
                            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            dev_sn: dev_sn,
                        }).then(res => {
                            if (res.type === 'success') {
                                data.parentNode.parentNode.style.display = "none";
                                _this.publicFunc.msg_tips({ msg: mrs_delete_video_succeed, type: "success", timeout: 3000 })
                            } else {
                                _this.publicFunc.msg_tips({ msg: mcs_delete_fail, type: "error", timeout: 3000 })
                            }
                        })
                    }
                })
            },
            back_btn() { //返回
                this.publicFunc.closeBufferPage()
                this.$router.push({ name: 'devlist', params: this.boxlist_params })
            },
            box_camera_btn(e) { // 点击录像
                if (this.boxlist_params.box_live == 1) { //如果云盒子支持实时视频播放
                    this.boxlist_params.box_ipc = 1; //给个标记，知道云盒子中的设备跳转到实时播放页面
                    this.boxlist_params.ipc_sn = e.currentTarget.getAttribute("sn"); //标记设备的sn
                    this.boxlist_params.ipc_stat = e.currentTarget.getAttribute("stat"); //标记云盒子设备的状态，进到播放页面，显示设备已离线
                    this.$router.push({ name: 'play', params: this.boxlist_params })
                } else {
                    let dev_sn = e.currentTarget.getAttribute("sn");
                    let jumpData = { dev_sn: dev_sn, addr: this.boxlist_params.addr, back_page: "boxlist", agent: this.boxlist_params.agent, box_ipc: 1 };
                    this.$router.push({ name: 'history', params: jumpData })
                }
            },
            boxlist_set_btn() { //点击设置
                let jumpData = { parent: $("#page"), back_page: "boxlist", type: 2, addr: this.boxlist_params.addr, agent: this.boxlist_params.agent, web_name: "vimtag", box_live: this.boxlist_params.box_live };
                this.$router.push({ name: 'set', params: jumpData })
            },
            boxlist_add_btn() { //根据ip 端口号进行添加设备
                this.addDeviceModel = true;
                this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'addDevicePage') // 切换至添加设备页面
                this.$set(this.addDeviceModelObj, 'menuTitle', mcs_add_device) // 设置添加设备页面顶部菜单标题
            },
            boxlist_search_btn() {
                this.addDeviceModel = true;
                this.l_get_onvif_flag = false;
                this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'searchDevicePage') // 切换至搜索设备页面
                this.$set(this.addDeviceModelObj, 'menuTitle', mcs_search_device) // 设置搜索设备页面顶部菜单标题
                this.$set(this.addDeviceModelObj, 'addDeviceProjectName', this.project_name)
                this.$api.boxlist.onvif_box_search({ // 调用ccm_box_search接口
                    box_sn: this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                    this.onvif_box_search_ack(res)
                })
            },
            empty_search_btn() { // 点击你的设备列表为空 搜索设备 注意这里就是搜索onvif设备的，私有设备没有相应接口
                this.addDeviceModel = true;
                this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'searchDevicePage') // 切换至搜索设备页面
                this.$set(this.addDeviceModelObj, 'menuTitle', mcs_search_device) // 设置搜索设备页面顶部菜单标题
            },
            closeModel() { // 子组件关闭弹窗
                this.addDeviceModel = false
                this.addDeviceModelObj = {};
                this.onvif_ipc_data1 = [];
                this.onvif_ipc_data2 = [];
                this.private_ipc_data = [];
                this.publicFunc.showBufferPage();
                this.box_search();
            },
            box_search() { //搜索盒子
                let _this = this;
                _this.onvif_ipc_data1 = [];
                _this.onvif_ipc_data2 = [];
                _this.private_ipc_data = [];
                if (_this.$store.state.jumpPageData.localFlag) { // 判断是否是本地搜素
                    let local_play_data = {};
                    local_play_data.addr = _this.boxlist_params.addr;
                    local_play_data.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                    local_play_data.flag = 1;
                    local_play_data.password = sessionStorage.getItem("pass_" + _this.$store.state.jumpPageData.selectDeviceIpc);
                    _this.$api.local.local_sign_in({
                        data: local_play_data
                    }).then(res => {
                        if (res.result === '') {
                            _this.$store.dispatch('setLid', res.lid) //登录返回lid head中
                            _this.$store.dispatch('setSid', res.sid)
                            _this.$store.dispatch('setGuest', res.guest)
                            _this.$store.dispatch('setSeq', res.seq)

                            _this.$api.boxlist.box_get({ //返回onvif后发送ccm_box_get，解决有时私有去不掉onvif问题
                                box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                                flag: 1
                            }).then(res => {
                                _this.boxlist_get_ack(res)
                            })
                        }
                    })
                } else {
                    _this.l_get_onvif_flag = true
                    _this.$api.boxlist.onvif_box_search({ // 调用ccm_box_search接口
                        box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
                    }).then(res => {
                        _this.onvif_box_search_ack()
                    })
                }
            },
            onvif_box_search_ack() { // 延时调用请求设备列表回调至get_onvif_unadd/不延时请求设备列表回调至get_onvif_list(当前页面的公共回调函数)
                // console.log(msg, 'onvif_box_search_ack_msg')
                let _this = this;
                if (_this.l_get_onvif_flag) {
                    _this.$api.boxlist.get_onvif_list({ // 调用ccm_box_conf_get接口
                        box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
                    }).then(res => {
                        //获取onvif设备列表(用于展示渲染列表)
                        if (res.conf && res.connect_infos) {
                            _this.box_onvif_ipc_sign = true; //显示onvif
                            for (let i = 0; i < res.conf.length; i++) {
                                let data = {};
                                data.conf = res.conf[i];
                                data.connect_infos = res.connect_infos[i];
                                _this.onvif_ipc_data1.push(data)
                                _this.onvif_ipc_data.push(res.conf[i])
                            }
                        } else {
                            if (res.list) {
                                for (let i = 0; i < res.list.length; i++) {
                                    if ((res.list[i].conted === 1 || res.list[i].conted === 3) && res.list[i].sn !== "") { // sn不为空，如果conted为3,按离线，云盒子已添加了的onvif设备显示到onvif
                                        _this.box_onvif_ipc_sign = true; //显示onvif
                                        _this.onvif_ipc_data2.push(res.list[i])
                                        _this.onvif_ipc_data.push(res.list[i])
                                    }
                                }
                            }
                        }
                        if (_this.box_onvif_ipc_sign) {
                            _this.$nextTick(function() {
                                // 获取onvif设备展示图片
                                _this.$api.boxlist.boxlist_img_get({ addr: _this.boxlist_params.addr, agent: 'undefined', sn: _this.$store.state.jumpPageData.selectDeviceIpc, ipc: _this.onvif_ipc_data, dom: $(".box_camera_sign_picture"), resolution: "p3" })
                            })
                        }
                        _this.$api.boxlist.box_get({ //返回onvif后发送ccm_box_get，解决有时私有去不掉onvif问题
                            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            flag: 1
                        }).then(res => {
                            _this.boxlist_get_ack(res)
                        })
                    })
                }

            },
            boxlist_get_ack(data) {
                // console.log(data, "进入boxlist_get_ack")
                let _this = this;
                let box_device_data = []; //定义的全局变量，初始化 ,标记实时播放列表显示,解决修改g_device_data 从云盒子返回设备列表页出错问题
                if (data.ipcs) { // ccm_box_get没有onvif设备
                    for (let i = 0; i < data.ipcs.length; i++) { // 实时视频播放
                        data.ipcs[i].type = 'BOX' // 实时视频播放
                        data.ipcs[i].box_sn = _this.$store.state.jumpPageData.selectDeviceIpc; // 实时视频播放 参数sn：所在的云盒子
                        box_device_data.push(data.ipcs[i])
                    } // 实时视频播放
                    _this.$store.dispatch('setBoxDeviceData', box_device_data)

                    // 去除一个数组中包含另一个数组 (在全部展示列表中过滤掉onvif设备)
                    for (let i = 0; i < _this.onvif_ipc_data.length; i++) {
                        for (let j = 0; j < data.ipcs.length; j++) {
                            if (data.ipcs[j].sn == _this.onvif_ipc_data[i].sn) {
                                data.ipcs.splice(j, 1);
                                j = j - 1;
                            }
                        }
                    }
                }
                // console.log(data.ipcs, "私有设备列表") // 得到的data.ipcs已经是去除过onvif设备的数组了
                if (data.ipcs && data.ipcs.length > 0) {
                    for (let i = 0; i < data.ipcs.length; i++) {
                        _this.private_ipc_data.push(data.ipcs[i]);
                    }
                }
                _this.publicFunc.closeBufferPage()
                _this.$nextTick(function() {
                    _this.$api.boxlist.boxlist_img_get({ addr: _this.boxlist_params.addr, agent: data.agent, sn: _this.$store.state.jumpPageData.selectDeviceIpc, ipc: data.ipcs, dom: $(".box_camera_sign_picture"), resolution: "p3" })
                    if (_this.project_flag_name === 'vimtag') { // vimtag项目动态自适应   给box_device_list_img 加margin
                        $(".box_device_list_img").css({ "margin-right": _this.margin_width / 2, "margin-left": _this.margin_width / 2 });
                    }
                })
            }
        },
        components: {
            deviceModel
        },
        watch: {
            "$store.state.jumpPageData.selectDeviceIpc"(val) {
                if (val) {
                    this.publicFunc.showBufferPage()
                    this.box_search();
                }
            }
        }
    }
</script>

<style src="./index.scss" lang="scss">

</style>