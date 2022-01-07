<template>
    <div id='network_info' class='list_right_box'>
        <div id='nic_select_div' class='list_right_item'>
            <!-- 网卡 -->
            <div class='attribute_key_text'> {{mcs_network_interface}} </div>
            <div class='options_float_right select_block' style='margin-top:0px;'>
                <dropdown-menu :menuData="network_card_array" :showData='network_card' @data_updata_event='network_card_updata'></dropdown-menu>
            </div>
        </div>
        <div class='list_right_item_ex'>
            <!-- 启动 -->
            <div class='attribute_key_text'> {{mcs_enabled}} </div>
            <switch-button v-model='nic_enabled_sign' @data_updata_event='nic_enabled_updata'></switch-button>
        </div>
        <div id='nic_enabled_content'>
            <div id='mac_address' class='list_right_item'>
                <div class='attribute_key_text'> {{mcs_mac_address}} </div>
                <div class='options_float_right'><input type='text' id='input_mac_address' class='input_read_only' v-model='input_mac_address' disabled /></div>
            </div>
            <div id='nic_mode_select' class='list_right_item_ex' style='clear:both'>
                <div class='attribute_key_text'> {{mcs_wifi_mode}} </div>
                <div class='options_float_right'>
                    <dropdown-menu :menuData="wifi_mode_array" :showData='wifi_mode' @data_updata_event='wifi_mode_updata'></dropdown-menu>
                </div>
            </div>
            <div id='nic_not_conn_content' class='list_right_item'>
                <div class='attribute_key_text'> {{mcs_network_status}} </div>
                <div class='options_float_right'><input type='text' id='input_status' class='input_read_only' disabled v-model='input_status' /></div>
            </div>
            <div id='nic_ap_mode_content' style='display:none'>
                <div class='list_right_item_ex'>
                    <div class='attribute_key_text'> {{mcs_dhcp}} </div>
                </div>
                <div class='list_right_item'>
                    <div class='attribute_key_text'>- {{mcs_start_address}} </div>
                    <div class='options_float_right'><input id='input_ap_start_address' type='text' class='input_read_only' disabled v-model='input_ap_start_address' /></div>
                </div>
                <div class='list_right_item'>
                    <div class='attribute_key_text'>- {{mcs_end_address}} </div>
                    <div class='options_float_right'><input id='input_ap_end_address' type='text' class='input_read_only' disabled v-model='input_ap_end_address' /></div>
                </div>
                <div class='list_right_item'>
                    <div class='attribute_key_text'>- {{mcs_gateway}} </div>
                    <div class='options_float_right'><input id='input_ap_gateway' type='text' class='input_read_only' disabled v-model='input_ap_gateway' /></div>
                </div>
            </div>
            <div id='select_network_li'>
                <div class='list_right_item_ex'>
                    <div class='attribute_key_text'> {{mcs_select_network}} :</div>
                    <div id='ssid_status' class='options_float_right options_status'></div>
                </div>
                <div class='list_right_item_ex'>
                    <div class='attribute_key_text'>- {{mcs_wifi_list}} </div>
                    <div class='options_float_right'>
                        <dropdown-menu :menuData="client_wifi_array" :showData='client_wifi' :extraData='dropdown_extra_data' @data_updata_event='client_wifi_updata'></dropdown-menu>
                        <button id='button_refresh' class='list_right_button' style='margin-top:7px;' @click='refresh_btn'> {{mcs_refresh}} </button>
                    </div>
                </div>
                <div id='user_set_wifi_name_li' style='display:none' class='list_right_item'>
                    <div class='attribute_key_text'>- {{mcs_input_wifi_name}} </div>
                    <div class='options_float_right'>
                        <input type='text' id='user_set_wifi_name' class='normal_input_right' v-model.trim='input_wifi_name' /><span style='font-size:12px;color:#E5393F;line-height:40px;'></span>
                        <!-- <button id='button_connect' class='standard_buttons_white' style='display:none'> {{mcs_connect}} </button> -->
                    </div>
                </div>
                <div id='select_network_password_li' style='display:none' class='list_right_item'>
                    <div class='attribute_key_text'>- {{mcs_password}} </div>
                    <div class='options_float_right'>
                        <input type='password' id='select_network_password' class='normal_input_right' v-model='select_network_password' /><span style='font-size:12px;color:#E5393F;line-height:40px;'></span>
                        <button id='button_connect' class='standard_buttons_white' style='display:none'> {{mcs_connect}} </button>
                    </div>
                </div>
            </div>
            <div id='nic_conn_content' style='display:none;clear:both'>
                <div id='ip_address_content'>
                    <div class='list_right_item_ex'>
                        <div class='options_left_title'>IP :</div>
                        <div id='ip_status' class='options_float_right options_status'></div>
                    </div>
                    <div class='list_right_item_ex'>
                        <div class='attribute_key_text'>- {{mcs_auto_obtain}} </div>
                        <div class='options_float_right'><input type='radio' id='radio_auto_obtain_ip' name='ip' @change='radio_ip_btn' v-model='radio_ip' value='1' /></div>
                    </div>
                    <div id='auto_obtain_ip_content' style='display:none'>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_ip_address}} </div>
                            <div class='options_float_right'><input id='input_auto_ip_address' type='text' class='input_read_only' disabled=true v-model='input_auto_ip_address' /></div>
                        </div>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_gateway}} </div>
                            <div class='options_float_right'><input id='input_auto_gateway' type='text' class='input_read_only' disabled=true v-model='input_auto_gateway' /></div>
                        </div>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_network_mask}} </div>
                            <div class='options_float_right'><input id='input_auto_subnet_mask' type='text' class='input_read_only' disabled=true v-model='input_auto_subnet_mask' /></div>
                        </div>
                    </div>
                    <div class='list_right_item_ex'>
                        <div class='attribute_key_text'>- {{mcs_manually_set}} </div>
                        <div class='options_float_right'><input type='radio' id='radio_use_following_ip' name='ip' @change='radio_ip_btn' v-model='radio_ip' value='0' /></div>
                    </div>
                    <div id='use_following_ip_content' style='display:none'>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_ip_address}} </div>
                            <div class='options_float_right'><input id='input_following_ip_address' type='text' class='normal_input_right' v-model='input_following_ip_address' /></div>
                        </div>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_gateway}} </div>
                            <div class='options_float_right'><input id='input_following_gateway' type='text' class='normal_input_right' v-model='input_following_gateway' /></div>
                        </div>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_network_mask}} </div>
                            <div class='options_float_right'><input id='input_following_subnet_mask' type='text' class='normal_input_right' v-model='input_following_subnet_mask' /></div>
                        </div>
                    </div>
                </div>
                <div id='dns_content'>
                    <div class='list_right_item_ex'>
                        <div class='options_left_title'>DNS :</div>
                        <div id='dns_status' class='options_float_right options_status'></div>
                    </div>
                    <div class='list_right_item_ex'>
                        <div class='attribute_key_text'>- {{mcs_auto_obtain}} </div>
                        <div class='options_float_right'><input type='radio' id='radio_auto_obtain_dns' name='dns' @change='radio_dns_btn' v-model='radio_dns' value='1' /></div>
                    </div>
                    <div id='auto_obtain_dns_content' style='display:none'>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_dns}} </div>
                            <div class='options_float_right'><input id='input_auto_dns' type='text' class='input_read_only' disabled=true v-model='input_auto_dns' /></div>
                        </div>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_secondary_dns}} </div>
                            <div class='options_float_right'><input id='input_auto_alternate_dns' type='text' class='input_read_only' disabled=true v-model='input_auto_alternate_dns' /></div>
                        </div>
                    </div>
                    <div class='list_right_item_ex'>
                        <div class='attribute_key_text'>- {{mcs_manually_set}} </div>
                        <div class='options_float_right'><input type='radio' id='radio_use_following_dns' name='dns' @change='radio_dns_btn' v-model='radio_dns' value='0' /></div>
                    </div>
                    <div id='use_following_dns_content' style='display:none' class='list_right_item'>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_dns}} </div>
                            <div class='options_float_right'><input id='input_following_dns' type='text' class='normal_input_right' v-model='input_following_dns' /></div>
                        </div>
                        <div class='list_right_item'>
                            <div class='attribute_key_text'>&nbsp;&nbsp;-- {{mcs_secondary_dns}} </div>
                            <div class='options_float_right'><input id='input_following_alternate_dns' type='text' class='normal_input_right' v-model='input_following_alternate_dns' /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class='options_float_right' style='clear:both'>
                <button id='button_setup' class='list_right_button' @click='setup_btn'> {{mcs_apply}} </button>
            </div>
        </div>
    </div>
</template>

<script>
    import DropdownMenu from '@/module/dropdownMenu'
    import SwitchButton from '@/module/switchButton'
    export default {
        data() {
            return {
                //多国语言
                mcs_network_interface: mcs_network_interface, //网卡
                mcs_enabled: mcs_enabled, //启用状态
                mcs_mac_address: mcs_mac_address, //MAC地址
                mcs_wifi_mode: mcs_wifi_mode, //Wi-Fi模式
                mcs_network_status: mcs_network_status, //连接状态
                mcs_dhcp: mcs_dhcp, //DHCP
                mcs_start_address: mcs_start_address, //开始地址
                mcs_end_address: mcs_end_address, //结束地址
                mcs_gateway: mcs_gateway, //网关
                mcs_select_network: mcs_select_network, //选择网络
                mcs_wifi_list: mcs_wifi_list, //Wi-Fi列表
                mcs_refresh: mcs_refresh, //刷新
                mcs_input_wifi_name: mcs_input_wifi_name, //请输入Wi-Fi名称
                mcs_password: mcs_password, //密码
                mcs_connect: mcs_connect, //连接
                mcs_auto_obtain: mcs_auto_obtain, //自动获取
                mcs_ip_address: mcs_ip_address, //IP地址
                mcs_network_mask: mcs_network_mask, //子网掩码
                mcs_manually_set: mcs_manually_set, //手动设置
                mcs_dns: mcs_dns, //DNS
                mcs_secondary_dns: mcs_secondary_dns, //备用DNS
                mcs_apply: mcs_apply, //应用

                l_dom_button_setup: '',
                l_dom_radio_auto_obtain_dns: '',
                l_dom_radio_use_following_dns: '',
                l_dom_select_network_li: '',
                l_dom_select_network_password_li: '',
                l_dom_radio_auto_obtain_ip: '',
                l_dom_radio_use_following_ip: '',

                l_nic_enabled_status_flag: 1,
                l_nic_conn_status_flag: 0,
                l_nic_wifi_con: 0,
                l_old_version: 0,
                l_ip_is_DHCP: 0,
                l_dns_is_DHCP: 0,
                l_select_net: '',
                l_origin_ethernet_addr: '',
                l_origin_wireless_addr: '',
                l_refresh_timer: '',
                input_status: mcs_not_connected,
                radio_ip: '', //判断IP设置状态
                radio_dns: '', //判断DNS设置状态
                input_mac_address: '', //MAC地址 
                input_auto_ip_address: '', //IP地址
                input_auto_subnet_mask: '', //子网掩码 
                input_auto_gateway: '', //网关 
                input_following_ip_address: '', //手动IP地址
                input_following_subnet_mask: '', //手动子网掩码
                input_following_gateway: '', //手动网关
                select_network_password: '', //密码
                input_auto_dns: '', //DNS
                input_auto_alternate_dns: '', //备用DNS
                input_following_dns: '', //手动DNS 
                input_following_alternate_dns: '', //手动备用DNS
                input_ap_start_address: '', //开始地址
                input_ap_end_address: '', //结束地址
                input_ap_gateway: '', //网关
                network_info: '', // 网络信息
                network_card_array: [], //网卡数组
                network_card: '', //网卡
                wifi_mode_array: [mcs_client, mcs_ap], //wifi模式数组
                wifi_mode: '', //wifi模式
                client_wifi_array: [], //wifi列表数组
                client_wifi: mcs_not_select, //wifi列表数组
                input_wifi_name: '', //手动wifi名称
                dropdown_extra_data: {}, //下拉框额外添加wifi信号信号强度图片数组
                nic_enabled_sign: '', //控制是否启用按钮
            }
        },
        mounted() {
            let _this = this;
            _this.publicFunc.showBufferPage()
            _this.l_dom_button_setup = _this.publicFunc.mx("#button_setup");
            _this.l_dom_select_network_li = _this.publicFunc.mx("#select_network_li");
            _this.l_dom_select_network_password_li = _this.publicFunc.mx("#select_network_password_li");
            _this.l_dom_radio_auto_obtain_ip = _this.publicFunc.mx("#radio_auto_obtain_ip");
            _this.l_dom_radio_use_following_ip = _this.publicFunc.mx("#radio_use_following_ip");
            _this.l_dom_radio_auto_obtain_dns = _this.publicFunc.mx("#radio_auto_obtain_dns");
            _this.l_dom_radio_use_following_dns = _this.publicFunc.mx("#radio_use_following_dns");

            _this.$api.set.get_network({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
                _this.publicFunc.closeBufferPage()
                _this.network_info = res;
                this.network_card = mcs_ethernet;
                let net_info = res[0].networks;
                let deviceType = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).type // 设备类型(摄像头IPC/云盒子BOX)
                if (net_info) {
                    for (let i = 0; i < net_info.length; ++i) {
                        if (net_info[i].token == "eth0") {
                            this.network_card_array.push(mcs_ethernet);
                            if (res[1] && res[1].select == mcs_ethernet) {
                                this.network_card = mcs_ethernet;
                            }
                        } else if (net_info[i].token == "ra0" && deviceType !== "BOX" && res[0].wwan_exist != "existence") { // 云盒子和4G设备网络设置中不含有wifi配置
                            this.network_card_array.push(mcs_wifi);
                            if (res[1] && res[1].select == mcs_wifi) {
                                this.network_card = mcs_wifi;
                            }
                        }
                    }
                } else {
                    return -1;
                }
            })

        },
        methods: {
            refresh_btn() {
                this.$api.devlist.wifi_get({ // 设备可连接wifi获取
                    sn: this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => { //wifi列表最终显示 包含信号强度 ccm_net_get
                    this.publicFunc.mx("#button_refresh").style.color = "#ffffff";
                    this.publicFunc.mx("#button_refresh").style.cursor = "pointer";
                    if (res.networks && res.networks[1].token == "ra0" && res.networks[1].wifi_client.ap_list) {
                        let msg_wifi_list = res.networks[1].wifi_client.ap_list;
                        let wifi_signal_png = [];
                        this.client_wifi_array = [];
                        this.client_wifi_array.push(mcs_not_select, mcs_input_wifi_name);
                        for (let i = 0; i < msg_wifi_list.length; ++i) {
                            if (msg_wifi_list[i].ssid == "") continue;
                            if (msg_wifi_list[i].signal < 0) {
                                msg_wifi_list[i].signal = msg_wifi_list[i].signal + 100;
                            }
                            let signal_level = Math.floor(msg_wifi_list[i].signal / 20);
                            signal_level = (signal_level >= 5 ? 4 : signal_level);
                            this.client_wifi_array.push(msg_wifi_list[i].ssid)
                            if (msg_wifi_list[i].connect) {
                                wifi_signal_png.push({
                                    front_img: require('@/assets/device/device_status_green.png'),
                                    rear_img: require('@/assets/device/wifi_signal' + signal_level + '.png')
                                })
                            } else {
                                wifi_signal_png.push({
                                    rear_img: require('@/assets/device/wifi_signal' + signal_level + '.png')
                                })
                            }
                        }
                        wifi_signal_png.splice(0, 0, ' ', ' '); //在数组前添加两个空白使其和client_wifi长度相同
                        this.$set(this.dropdown_extra_data, 'wifi_signal_png', wifi_signal_png)
                        this.$nextTick(() => {
                            if (this.input_status == mcs_connnected) {
                                this.client_wifi = msg_wifi_list[0].ssid;
                            } else {
                                this.client_wifi = this.client_wifi_array[0];
                            }

                        })
                    }
                })
            },

            setup_btn() { //应用
                let _this = this;
                let ip_address;
                let ip_refresh = "";
                let origin_connected = "";
                if (_this.$store.state.jumpPageData.selectDeviceIpc && _this.$store.state.jumpPageData.networkEnviron == "private") { //Direct Connect
                    if (_this.l_origin_ethernet_addr == window.location.host) {
                        origin_connected = _this.l_origin_ethernet_addr;
                        if (_this.network_card == mcs_ethernet && _this.radio_ip && !_this.l_ip_is_DHCP) {
                            ip_refresh = origin_connected;
                        }
                    } else if (_this.l_origin_wireless_addr == window.location.host) {
                        origin_connected = _this.l_origin_wireless_addr;
                        if (_this.network_card == mcs_wifi && _this.l_dom_radio_auto_obtain_ip.checked && !l_ip_is_DHCP) {
                            ip_refresh = origin_connected;
                        }
                    }
                    if (!_this.radio_ip) {
                        ip_address = _this.input_following_ip_address;
                        if (_this.network_card == mcs_ethernet) {
                            if ((ip_address != _this.l_origin_ethernet_addr) && (origin_connected == _this.l_origin_ethernet_addr))
                                ip_refresh = ip_address;
                        } else if (_this.network_card == mcs_wifi) {
                            if ((ip_address != _this.l_origin_wireless_addr) && (origin_connected == _this.l_origin_wireless_addr))
                                ip_refresh = ip_address;
                        }
                    }
                } else {
                    if (_this.radio_ip) {
                        if (!_this.l_ip_is_DHCP) {
                            if (_this.network_card == mcs_wifi) {
                                ip_refresh = _this.l_origin_wireless_addr;
                            } else if (_this.network_card == mcs_ethernet) {
                                ip_refresh = _this.l_origin_ethernet_addr;
                            }
                        }
                    } else if (!_this.radio_ip) {
                        ip_address = _this.input_following_ip_address;
                        if (_this.network_card == mcs_wifi) {
                            if (ip_address != _this.l_origin_wireless_addr)
                                ip_refresh = ip_address;
                        } else if (_this.network_card == mcs_ethernet) {
                            if (ip_address != _this.l_origin_ethernet_addr)
                                ip_refresh = ip_address;
                        }
                    }
                }
                if (ip_refresh) {
                    let type = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).type;
                    if (type == "IPC" && _this.$store.state.jumpPageData.networkEnviron == "private" || type == "BOX") { //Direct Connect
                        _this.publicFunc.delete_tips({
                            content: mcs_modify_network_prompt,
                            func: function() {
                                _this.ccm_set_network_info_request({
                                    type: _this.network_card,
                                    ori_net_info: _this.network_info[0],
                                    to: ip_refresh + ":" + location.port,
                                    select: _this.network_card
                                })
                            }
                        })
                    } else { //Through the server
                        _this.publicFunc.delete_tips({
                            content: mcs_modify_network_prompt,
                            func: function() {
                                _this.ccm_set_network_info_request({
                                    type: _this.network_card,
                                    ori_net_info: _this.network_info[0],
                                    to: _this.network_info[1].ip,
                                    select: _this.network_card
                                })
                            }
                        })
                    }
                } else {
                    _this.publicFunc.delete_tips({
                        content: mcs_modify_network_prompt,
                        func: function() {
                            _this.ccm_set_network_info_request({
                                type: _this.network_card,
                                ori_net_info: _this.network_info[0],
                                to: ip_refresh,
                                select: _this.network_card
                            })
                        }
                    })
                }
            },

            generate_eth_setup_ex(now_ifs) {
                $("#select_network_li").fadeOut();
                $("#nic_ap_mode_content").fadeOut();
                if (now_ifs.enabled) {
                    this.l_nic_enabled_status_flag = 1;
                    if (now_ifs.phy) {
                        this.input_mac_address = now_ifs.phy.info.mac;
                        if (now_ifs.phy.info.stat == "ok") {
                            this.l_nic_conn_status_flag = 1;
                            if (now_ifs.ipv4) {
                                if (now_ifs.ipv4.info.stat === "ok" && !this.$store.state.jumpPageData.projectFlag) { // vimtag特有内容添加
                                    if (this.publicFunc.mx("#ip_status")) {
                                        this.publicFunc.mx("#ip_status").setAttribute("title", mcs_connnected);
                                    }
                                }
                                // else if (now_ifs.ipv4.info.stat == "err") {

                                // }
                                if (now_ifs.ipv4.conf.mode == "dhcp") {
                                    this.l_ip_is_DHCP = 1;
                                    this.input_auto_ip_address = now_ifs.ipv4.info.ip.addr || "0.0.0.0";
                                    this.input_auto_subnet_mask = now_ifs.ipv4.info.ip.mask || "0.0.0.0";
                                    this.input_auto_gateway = now_ifs.ipv4.info.ip.gw || "0.0.0.0";
                                    this.publicFunc.trigger_click(this.l_dom_radio_auto_obtain_ip);
                                } else if (now_ifs.ipv4.conf.mode == "static") {
                                    this.l_ip_is_DHCP = 0;
                                    this.input_following_ip_address = now_ifs.ipv4.conf.static_ip.addr || "0.0.0.0";
                                    this.input_following_subnet_mask = now_ifs.ipv4.conf.static_ip.mask || "0.0.0.0";
                                    this.input_following_gateway = now_ifs.ipv4.conf.static_ip.gw || "0.0.0.0";
                                    this.publicFunc.trigger_click(this.l_dom_radio_use_following_ip);
                                }
                                this.l_origin_ethernet_addr = this.l_ip_is_DHCP ? now_ifs.ipv4.info.ip.addr : now_ifs.ipv4.conf.static_ip.addr;
                            }
                        } else if (now_ifs.internet) {
                            if (now_ifs.internet.info.stat == "err") {
                                this.l_nic_conn_status_flag = 0;
                                if (now_ifs.ipv4) {
                                    if (now_ifs.ipv4.info.stat == "ok") {
                                        this.publicFunc.mx("#ip_status").setAttribute("title", mcs_connnected);
                                    }
                                    // else if (now_ifs.ipv4.info.stat == "err") {

                                    // }
                                    if (now_ifs.ipv4.conf.mode == "dhcp") {
                                        this.l_ip_is_DHCP = 1;
                                        this.input_auto_ip_address = now_ifs.ipv4.info.ip.addr || "0.0.0.0";
                                        this.input_auto_subnet_mask = now_ifs.ipv4.info.ip.mask || "0.0.0.0";
                                        this.input_auto_gateway = now_ifs.ipv4.info.ip.gw || "0.0.0.0";
                                        this.publicFunc.trigger_click(this.l_dom_radio_auto_obtain_ip);
                                    } else if (now_ifs.ipv4.conf.mode == "static") {
                                        this.l_ip_is_DHCP = 0;
                                        this.input_following_ip_address = "0.0.0.0";
                                        this.input_following_subnet_mask = "0.0.0.0";
                                        this.input_following_gateway = "0.0.0.0";
                                        this.publicFunc.trigger_click(this.l_dom_radio_use_following_ip);
                                    }
                                    this.l_origin_ethernet_addr = this.l_ip_is_DHCP ? now_ifs.ipv4.info.ip.addr : now_ifs.ipv4.conf.static_ip.addr;
                                }
                            }
                        }
                    }
                    this.nic_enabled_sign = true;
                    $("#nic_mode_select").fadeOut();
                } else {
                    this.nic_enabled_sign = false;
                }
            },

            generate_wireless_setup_ex(now_ifs) {
                if (now_ifs.enabled) {
                    this.l_nic_enabled_status_flag = 1;
                    // l_network_token = now_ifs.token;
                    if (now_ifs.phy && now_ifs.phy.conf && now_ifs.phy.info) {
                        if (now_ifs.phy.info.stat == "ok") {
                            this.l_nic_conn_status_flag = 1;
                            if (now_ifs.phy.conf.mode == "wificlient") {
                                this.wifi_mode = mcs_client;
                                this.input_mac_address = now_ifs.phy.info.mac;
                                if (now_ifs.ipv4) {
                                    if (now_ifs.ipv4.info.stat == "ok") {
                                        this.publicFunc.mx("#ip_status").setAttribute("title", mcs_connnected);
                                    }
                                    // else if (now_ifs.ipv4.info.stat == "err") {

                                    // }
                                    if (now_ifs.ipv4.conf.mode == "dhcp") {
                                        this.l_ip_is_DHCP = 1;
                                        this.input_auto_ip_address = now_ifs.ipv4.info.ip.addr || "0.0.0.0";
                                        this.input_auto_subnet_mask = now_ifs.ipv4.info.ip.mask || "0.0.0.0";
                                        this.input_auto_gateway = now_ifs.ipv4.info.ip.gw || "0.0.0.0";
                                        this.publicFunc.trigger_click(this.l_dom_radio_auto_obtain_ip);
                                    } else if (now_ifs.ipv4.conf.mode == "static") {
                                        this.l_ip_is_DHCP = 0;
                                        this.input_following_ip_address = now_ifs.ipv4.conf.static_ip.addr || "0.0.0.0";
                                        this.input_following_subnet_mask = now_ifs.ipv4.conf.static_ip.mask || "0.0.0.0";
                                        this.input_following_gateway = now_ifs.ipv4.conf.static_ip.gw || "0.0.0.0";
                                        this.publicFunc.trigger_click(this.l_dom_radio_use_following_ip);
                                    }
                                    this.l_origin_wireless_addr = this.l_ip_is_DHCP ? now_ifs.ipv4.info.ip.addr : now_ifs.ipv4.conf.static_ip.addr;
                                }
                                this.input_ap_start_address = "192.168.188.100";
                                this.input_ap_end_address = "192.168.188.253";
                                this.input_ap_gateway = "192.168.188.254";

                            } else if (now_ifs.phy.conf.mode == "adhoc") {
                                this.wifi_mode = mcs_ap;
                                if (now_ifs.dhcp_srv) {
                                    this.input_ap_start_address = now_ifs.dhcp_srv.conf.ip_start;
                                    this.input_ap_end_address = now_ifs.dhcp_srv.conf.ip_end;
                                    this.input_ap_gateway = now_ifs.dhcp_srv.conf.gw;

                                    this.publicFunc.mx("#ip_status").style.cssText = "";
                                    this.input_following_ip_address = "";
                                    this.input_following_subnet_mask = "";
                                    this.input_following_gateway = "";

                                    if (now_ifs.ipv4.conf.mode == "dhcp") {
                                        this.publicFunc.trigger_click(this.l_dom_radio_auto_obtain_ip);
                                    } else if (now_ifs.ipv4.conf.mode == "static") {
                                        this.input_following_ip_address = now_ifs.ipv4.conf.static_ip.addr || "0.0.0.0";
                                        this.input_following_subnet_mask = now_ifs.ipv4.conf.static_ip.mask || "0.0.0.0";
                                        this.input_following_gateway = now_ifs.ipv4.conf.static_ip.gw || "0.0.0.0";
                                        this.publicFunc.trigger_click(this.l_dom_radio_use_following_ip);
                                    }
                                }
                            } else if (now_ifs.phy.conf.mode == "monitor") {
                                this.wifi_mode = mcs_client;
                                //When in WiFi intelligent configuration mode, hide options
                            }
                            if (now_ifs.wifi_client.ap_list) {
                                let signal_level = 0;
                                let wifi_list = now_ifs.wifi_client.ap_list;
                                let wifi_signal_png = [];
                                this.client_wifi_array = [];
                                this.client_wifi_array.push(mcs_not_select, mcs_input_wifi_name)
                                if (now_ifs.wifi_client.info.stat == "ok") {
                                    this.l_nic_wifi_con = 1;
                                    this.publicFunc.mx("#ssid_status").setAttribute("title", mcs_connnected);
                                    this.publicFunc.mx("/span", this.l_dom_select_network_password_li)[0].innerHTML = "";
                                    for (let i = 0; i < wifi_list.length; ++i) {
                                        if (wifi_list[i].ssid == "") continue;
                                        if (wifi_list[i].signal < 0) {
                                            wifi_list[i].signal = wifi_list[i].signal + 100;
                                        }
                                        if (wifi_list[i].quality >= 0 && wifi_list[i].quality <= 100) {
                                            signal_level = Math.floor(wifi_list[i].signal / 20);
                                            signal_level = (signal_level >= 5 ? 4 : signal_level);
                                        }
                                        this.client_wifi_array.push(wifi_list[i].ssid)
                                        if (wifi_list[i].connect) {
                                            wifi_signal_png.push({
                                                front_img: require('@/assets/device/device_status_green.png'),
                                                rear_img: require('@/assets/device/wifi_signal' + signal_level + '.png')
                                            })
                                        } else {
                                            wifi_signal_png.push({
                                                rear_img: require('@/assets/device/wifi_signal' + signal_level + '.png')
                                            })
                                        }
                                    }
                                    this.select_network_password = now_ifs.wifi_client.conf.key;
                                } else {
                                    $(this.l_dom_select_network_password_li).fadeIn("normal", function() {
                                        // $("#manager_page").mCustomScrollbar("update");
                                    });
                                    if (now_ifs.wifi_client.info.stat == "err" && now_ifs.wifi_client.usr) {
                                        this.l_nic_wifi_con = 0;
                                        this.publicFunc.mx("#ssid_status").setAttribute("title", mcs_connect_fail);
                                        this.publicFunc.mx("/span", this.l_dom_select_network_password_li)[0].innerHTML = "&nbsp;&nbsp;&nbsp; " + mcs_connect_fail;
                                    } else if (now_ifs.wifi_client.info.stat == "info.connecting") {
                                        this.publicFunc.mx("#ssid_status").setAttribute("title", mcs_connecting);
                                        this.publicFunc.mx("/span", this.l_dom_select_network_password_li)[0].innerHTML = "&nbsp;&nbsp;&nbsp; " + mcs_connecting;
                                    } else
                                        this.publicFunc.mx("/span", this.l_dom_select_network_password_li)[0].innerHTML = "";
                                    for (let i = 0; i < wifi_list.length; ++i) {
                                        if (wifi_list[i].ssid == "") continue;
                                        if (wifi_list[i].signal < 0) {
                                            wifi_list[i].signal = wifi_list[i].signal + 100;
                                        }
                                        if (wifi_list[i].quality >= 0 && wifi_list[i].quality <= 100) {
                                            signal_level = Math.floor(wifi_list[i].signal / 20);
                                            signal_level = (signal_level >= 5 ? 4 : signal_level);
                                        }
                                        this.client_wifi_array.push(wifi_list[i].ssid)
                                        if (wifi_list[i].ssid == now_ifs.wifi_client.conf.ssid) {
                                            wifi_signal_png.push({
                                                front_img: require('@/assets/device/device_status_yellow.png'),
                                                rear_img: require('@/assets/device/wifi_signal' + signal_level + '.png')
                                            })
                                        } else {
                                            wifi_signal_png.push({
                                                rear_img: require('@/assets/device/wifi_signal' + signal_level + '.png')
                                            })
                                        }
                                    }
                                }
                                wifi_signal_png.splice(0, 0, ' ', ' '); //在数组前添加两个空白使其和client_wifi长度相同
                                this.$set(this.dropdown_extra_data, 'wifi_signal_png', wifi_signal_png)
                                this.$nextTick(() => {
                                    if (this.input_status == mcs_connnected) {
                                        this.client_wifi = wifi_list[0].ssid; //切换到wifi模式自动获取已连接的wifi名
                                    } else {
                                        this.client_wifi = this.client_wifi_array[0];
                                    }
                                })
                            }
                        } else if (now_ifs.phy.info.stat == "err") {
                            this.l_nic_conn_status_flag = 0;
                            this.publicFunc.trigger_click(this.l_dom_radio_auto_obtain_ip);
                            $("#nic_mode_select").fadeOut();
                            $("#nic_ap_mode_content").fadeOut();
                            $("#select_network_li").fadeOut();
                            $("#nic_conn_content").fadeOut(300);
                            this.input_status = mcs_fault;
                            $("#mac_address").fadeOut();
                            return;
                        }
                    }
                    this.nic_enabled_sign = true;
                    $("#nic_mode_select").fadeIn();
                } else {
                    this.nic_enabled_sign = false;
                }
            },

            ccm_set_network_info_request(obj) { //Set network parameters
                let _this = this;
                let selectedIndex = _this.network_card == mcs_ethernet ? 0 : 1;
                let node_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                let node = _this.$api.devlist.ldev_get(node_sn);
                let count = 0
                let net_info = obj.ori_net_info.networks;
                let now_ifs;
                let now_net_info = {};
                if (!node) return;

                for (let i = 0; i < net_info.length; ++i) {
                    if (net_info[i].enabled)
                        ++count;
                }
                now_ifs = net_info[selectedIndex];
                if (obj.type == mcs_ethernet) {
                    if (_this.nic_enabled_sign) {
                        if (_this.l_nic_enabled_status_flag) {
                            now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                            //Automatically obtain ip
                            if (_this.l_dom_radio_auto_obtain_ip.checked) {
                                now_net_info.ifs["ipv4"] = { conf: { enabled: now_ifs.ipv4.conf.enabled, mode: "dhcp", static_ip: "", debug_ip: "" } };
                            } else if (_this.l_dom_radio_use_following_ip.checked) { //Manually set ip
                                now_net_info.ifs["ipv4"] = {
                                    conf: {
                                        enabled: now_ifs.ipv4.conf.enabled,
                                        mode: "static",
                                        static_ip: {
                                            addr: _this.input_following_ip_address,
                                            gw: _this.input_following_gateway,
                                            mask: now_ifs.ipv4.conf.static_ip ? now_ifs.ipv4.conf.static_ip.mask : ""
                                        },
                                        debug_ip: now_ifs.ipv4.conf.debug_ip
                                    }
                                };
                                if (subnet_mask_available_and_trans({ data: _this.input_following_subnet_mask }) >= 0) {
                                    now_net_info.ifs.ipv4.conf.static_ip.mask = _this.input_following_subnet_mask;
                                } else {
                                    _this.publicFunc.msg_tips({ msg: mcs_subnet_mask_wrong_format, type: "error", timeout: 3000 })
                                    return;
                                }
                            }
                        } else {
                            now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                        }
                    } else { //Close Ethernet connection
                        if (count < 2) {
                            _this.publicFunc.msg_tips({ msg: mcs_not_allowed_close_two_network_cards, type: "error", timeout: 3000 })
                            return;
                        } else {
                            now_net_info["ifs"] = { token: now_ifs.token, enabled: 0 };
                        }
                    }
                } else if (obj.type == mcs_wifi) {
                    if (_this.nic_enabled_sign) {
                        if (_this.l_nic_enabled_status_flag) {
                            now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                            //if(_this.publicFunc.mx("#nic_mode_switch_checkbox").checked)             //client
                            if (_this.wifi_mode == mcs_client) {
                                now_net_info.ifs["phy"] = { conf: { mode: "wificlient", mtu: now_ifs.phy.conf.mtu } };
                                if (_this.radio_ip) {
                                    now_net_info.ifs["ipv4"] = { conf: { enabled: now_ifs.ipv4.conf.enabled, mode: "dhcp", static_ip: "", debug_ip: "" } };
                                } else if (!_this.radio_ip) {
                                    now_net_info.ifs["ipv4"] = {
                                        conf: {
                                            enabled: now_ifs.ipv4.conf.enabled,
                                            mode: "static",
                                            static_ip: {
                                                addr: _this.input_following_ip_address,
                                                gw: _this.input_following_gateway,
                                                mask: now_ifs.ipv4.conf.static_ip ? now_ifs.ipv4.conf.static_ip.mask : ""
                                            },
                                            debug_ip: now_ifs.ipv4.conf.debug_ip
                                        }
                                    };
                                    if (subnet_mask_available_and_trans({ data: _this.input_following_subnet_mask }) >= 0)
                                        now_net_info.ifs.ipv4.conf.static_ip.mask = _this.input_following_subnet_mask;
                                    else {
                                        _this.publicFunc.msg_tips({ msg: mcs_subnet_mask_wrong_format, type: "error", timeout: 3000 })
                                        return;
                                    }
                                }

                                if (_this.input_wifi_name !== "" || _this.client_wifi === mcs_input_wifi_name) { //如果是手动输入的话传递值取输入框中的内容 (后续添加判断选中值为手动输入)
                                    now_net_info.ifs["wifi_client"] = {
                                        conf: {
                                            enabled: 1,
                                            ssid: _this.input_wifi_name,
                                            usr: _this.input_wifi_name,
                                            key: _this.select_network_password
                                        }
                                    };
                                } else {
                                    now_net_info.ifs["wifi_client"] = {
                                        conf: {
                                            enabled: 1,
                                            ssid: _this.client_wifi,
                                            usr: _this.client_wifi,
                                            key: _this.select_network_password
                                        }
                                    };
                                }
                            } else if (_this.wifi_mode == mcs_ap) //adhoc
                            {
                                now_net_info.ifs["phy"] = { conf: { mode: "adhoc", mtu: now_ifs.phy.conf.mtu } };
                                now_net_info.ifs["dhcp_srv"] = {
                                    conf: {
                                        enabled: now_ifs.dhcp_srv.conf.enabled,
                                        gw: _this.input_ap_gateway,
                                        ip_start: _this.input_ap_start_address,
                                        ip_end: _this.input_ap_end_address
                                    }
                                }
                            }
                        } else {
                            now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                        }
                    } else {
                        if (count < 2) {
                            _this.publicFunc.msg_tips({ msg: mcs_not_allowed_close_two_network_cards, type: "error", timeout: 3000 })
                            return;
                        } else
                            now_net_info["ifs"] = { token: now_ifs.token, enabled: 0 };
                    }
                }

                if (_this.l_nic_enabled_status_flag) {
                    if (_this.radio_dns) {
                        now_net_info["dns"] = { conf: { enalbed: obj.ori_net_info.dns.conf.enabled, mode: "dhcp", static_dns: obj.ori_net_info.dns.conf.static_dns } };
                    } else if (!_this.radio_dns) {
                        now_net_info["dns"] = {
                            conf: {
                                enalbed: obj.ori_net_info.dns.conf.enabled,
                                mode: "static",
                                static_dns: [_this.input_following_dns, _this.input_following_alternate_dns]
                            }
                        };
                    }
                }
                _this.$api.set.set_network({
                    sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                    networks: now_net_info.ifs,
                    dns: now_net_info.dns,
                    select: _this.network_card
                }).then(res => {
                    if (res.type == "success") {
                        _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                        _this.l_refresh_timer = setInterval(function() {
                            _this.$api.set.get_network({
                                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                                select: res.select
                            }).then(res => {
                                _this.$store.state.jumpPageData.systemStopWait;
                                clearInterval(_this.l_refresh_timer);
                                let net_info = res.networks;
                                if (net_info) {
                                    let inner_html = "";
                                    for (let i = 0; i < net_info.length; ++i) {
                                        if (net_info[i].token == "eth0") {
                                            this.network_card_array.push(mcs_ethernet);
                                            if (res[1] && res[1].select == mcs_ethernet)
                                                this.network_card = mcs_ethernet;
                                        } else if (net_info[i].token == "ra0") {
                                            this.network_card_array.push(mcs_wifi);
                                            if (res[1] && res[1].select == mcs_wifi)
                                                this.network_card = mcs_wifi;
                                        }
                                    }
                                } else {
                                    return -1;
                                }
                            })
                        }, 3500);
                    } else {
                        _this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                    }
                })

                function subnet_mask_available_and_trans(obj) {
                    let ip_pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
                    if (!ip_pattern.test(obj.data)) return -1;

                    let ip_array = obj.data.split("."),
                        i, length, value, ip_binary = "";
                    // let ip;
                    length = ip_array.length;
                    for (i = 0; i < length; ++i) {
                        value = parseInt(ip_array[i]);
                        if (value < 0 || value > 255) {
                            return -1;
                        }
                        ip_binary += (value + 256).toString(2).substring(1);
                    }
                    if (-1 != ip_binary.indexOf("01"))
                        return -1;
                    return ip_binary.replace(/0/g, '').length;
                }
            },

            radio_ip_btn() { //切换IP自动/手动设置
                let l_dom_auto_obtain_ip_content = this.publicFunc.mx("#auto_obtain_ip_content");
                let l_dom_use_following_ip_content = this.publicFunc.mx("#use_following_ip_content");
                if (this.radio_ip == 1) { //选择自动
                    $(l_dom_use_following_ip_content).fadeOut("normal", () => {
                        if (this.l_ip_is_DHCP) {
                            $(l_dom_auto_obtain_ip_content).slideDown("normal", function() {
                                // $("#manager_page").mCustomScrollbar("update");
                            });
                        } else {
                            $(l_dom_auto_obtain_ip_content).slideUp("normal", function() {
                                // $("#manager_page").mCustomScrollbar("update");
                            });
                        }
                    });
                } else { //选择手动
                    $(l_dom_auto_obtain_ip_content).fadeOut("normal", function() {
                        $(l_dom_use_following_ip_content).slideDown("normal", function() {
                            // $("#manager_page").mCustomScrollbar("update");
                        });
                    });
                }
            },

            radio_dns_btn() { //切换DNS自动/手动设置
                let l_dom_use_following_dns_content = this.publicFunc.mx("#use_following_dns_content");
                let l_dom_auto_obtain_dns_content = this.publicFunc.mx("#auto_obtain_dns_content");
                if (this.radio_dns == 1) { //选择自动
                    $(l_dom_use_following_dns_content).slideUp("normal", () => {
                        if (this.l_dns_is_DHCP)
                            $(l_dom_auto_obtain_dns_content).slideDown("normal", function() {
                                // $("#manager_page").mCustomScrollbar("update");
                            });
                        else
                            $(l_dom_auto_obtain_dns_content).slideUp("normal", function() {
                                // $("#manager_page").mCustomScrollbar("update");
                            });
                    });
                } else { //选择手动
                    $(l_dom_use_following_dns_content).slideDown("normal", function() {
                        $(l_dom_auto_obtain_dns_content).slideUp("normal", function() {
                            // $("#manager_page").mCustomScrollbar("update");
                        });
                    });
                }
            },
            network_card_updata(data) { //更新网卡
                this.network_card = data;
            },
            wifi_mode_updata(data) { //更新wifi模式
                this.wifi_mode = data;
            },
            client_wifi_updata(data) { //更新选择wifi
                this.client_wifi = data;
            },
            nic_enabled_updata(data) { //更新启用状态
                this.nic_enabled_sign = data;
            }
        },
        watch: {
            network_card(val) {
                let selectedIndex = val == mcs_ethernet ? 0 : 1;
                this.l_nic_enabled_status_flag = 0;
                this.l_nic_conn_status_flag = 0;
                this.l_ip_is_DHCP = 0;
                // Select the Ethernet
                if (val == mcs_ethernet) {
                    this.wifi_mode = '';
                    $(this.l_dom_button_setup).unbind();
                    this.generate_eth_setup_ex(this.network_info[0].networks[selectedIndex]);
                }
                //Select a wireless network
                else if (val == mcs_wifi) {
                    this.wifi_mode = mcs_client;
                    $(this.l_dom_button_setup).unbind();
                    this.generate_wireless_setup_ex(this.network_info[0].networks[selectedIndex]);
                }
                if (this.network_info[0].dns) {
                    if (this.network_info[0].dns.info.stat == "ok" && !this.$store.state.jumpPageData.projectFlag) { // vimtag特有内容添加
                        if (this.publicFunc.mx("#dns_status")) {
                            this.publicFunc.mx("#dns_status").setAttribute("title", mcs_connnected);
                        }
                    }
                    // else if (this.network_info[0].dns.info.stat == "err") {

                    // }
                    if (this.network_info[0].dns.conf.mode == "dhcp") {
                        //net_dns=this.network_info[0].dns;
                        this.input_auto_dns = this.network_info[0].dns.info.dns[0] || "0.0.0.0";
                        if (this.network_info[0].dns.info.dns.length > 1)
                            this.input_auto_alternate_dns = this.network_info[0].dns.info.dns[1] || "0.0.0.0";
                        this.l_dns_is_DHCP = 1;
                        this.publicFunc.trigger_click(this.l_dom_radio_auto_obtain_dns);
                    } else if (this.network_info[0].dns.conf.mode == "static") {
                        this.input_following_dns = this.network_info[0].dns.conf.static_dns[0] || "0.0.0.0";
                        if (this.network_info[0].dns.conf.static_dns.length > 1)
                            this.input_following_alternate_dns = this.network_info[0].dns.conf.static_dns[1] || "0.0.0.0";
                        this.l_dns_is_DHCP = 0;
                        this.publicFunc.trigger_click(this.l_dom_radio_use_following_dns);
                    }
                }
            },
            wifi_mode(val) {
                let l_swc_bind_func = null
                if (val == mcs_client) {
                    $("#nic_ap_mode_content").fadeOut(300);
                    if (this.l_nic_conn_status_flag) {
                        $("#nic_not_conn_content").fadeIn(450);
                        this.input_status = this.l_nic_wifi_con ? mcs_connnected : mcs_not_connected;
                        $("#nic_conn_content").fadeIn(450, function() {
                            // $("#manager_page").mCustomScrollbar("update");
                        });
                    } else {
                        $("#nic_conn_content").fadeIn(450);
                        this.input_status = mcs_not_connected;
                        $("#nic_not_conn_content").fadeIn(450, function() {
                            // $("#manager_page").mCustomScrollbar("update");
                        });
                    }
                    if (this.l_old_version) {
                        network_Business.ctrl({ type: "ccm_get_wifi_list_request" });
                        $(this.l_dom_button_setup).unbind();
                        $(this.l_dom_button_setup).bind("click", l_swc_bind_func);
                    } else {
                        $(this.l_dom_select_network_li).fadeIn();
                        $("#nic_not_conn_content").fadeIn(450);
                        $("#nic_conn_content").fadeIn(450, function() {
                            // $("#manager_page").mCustomScrollbar("update");
                        });
                    }
                    this.refresh_btn();
                } else if (val == mcs_ap) {
                    $("#mac_address").fadeIn(450);
                    $(this.l_dom_select_network_li).fadeOut();
                    $("#nic_conn_content").fadeOut(300);
                    $("#nic_not_conn_content").fadeIn(450);
                    $("#nic_ap_mode_content").fadeIn(450, function() {
                        // $("#manager_page").mCustomScrollbar("update");
                    });

                    if (this.l_old_version) {
                        $(this.l_dom_button_setup).unbind();
                        $(this.l_dom_button_setup).bind("click", l_swc_bind_func);
                    }
                }
            },
            client_wifi(val) {
                if (val === mcs_input_wifi_name) {
                    $(this.publicFunc.mx("#user_set_wifi_name_li")).fadeIn("normal", function() {
                        // $("#manager_page").mCustomScrollbar("update");
                    });
                } else { // 选择其他wifi之后隐藏手动输入框 并清空其中内容
                    this.input_wifi_name = ""
                    $(this.publicFunc.mx("#user_set_wifi_name_li")).fadeOut();
                }
                //if(_this[_this.selectedIndex].text == mcs_not_select)
                //   $(this.l_dom_select_network_password_li).fadeOut();
                //else
                $(this.l_dom_select_network_password_li).fadeIn("normal", function() {
                    // $("#manager_page").mCustomScrollbar("update");
                });
            },
            nic_enabled_sign(val) {
                if (!this.l_nic_enabled_status_flag) {
                    $("#nic_enabled_content").fadeOut();
                    return;
                }
                if (val) { //启用状态为打开时
                    $("#nic_enabled_content").fadeIn();
                    if (this.network_card == mcs_ethernet) { //当前为网线连接状态
                        $("#mac_address").fadeIn(450);
                        $("#nic_mode_select").fadeOut();
                        if (this.l_nic_conn_status_flag) {
                            $("#nic_not_conn_content").fadeIn(450);
                            this.input_status = mcs_connnected;
                            $("#nic_conn_content").fadeIn(450, function() {
                                // $("#manager_page").mCustomScrollbar("update"); //未知用法，暂时注释，下同
                            });
                        } else {
                            $("#nic_not_conn_content").fadeIn(450);
                            this.input_status = mcs_not_connected;
                            $("#nic_conn_content").fadeIn(450, function() {
                                // $("#manager_page").mCustomScrollbar("update");
                            });
                        }
                    } else if (this.network_card == mcs_wifi) { //当前为wifi连接状态
                        if (!this.l_nic_conn_status_flag) {
                            this.l_nic_conn_status_flag = 0;
                            this.publicFunc.trigger_click(this.publicFunc.mx("#radio_auto_obtain_ip"));
                            $("#nic_mode_select").fadeOut();
                            $("#nic_ap_mode_content").fadeOut();
                            $("#select_network_li").fadeOut();
                            $("#nic_conn_content").fadeOut(300);
                            this.input_status = mcs_fault;
                            $("#mac_address").fadeOut();
                            $("#nic_not_conn_content").fadeIn(450);
                            return;
                        }
                        $("#nic_mode_select").fadeIn();
                        this.wifi_mode = mcs_client;
                    }
                } else { //启用状态为关闭时
                    $("#nic_enabled_content").fadeOut();
                    if (this.network_card == mcs_wifi) {
                        $("#select_network_li").fadeOut();
                        $("#nic_mode_select").fadeOut();
                    }
                    $("#nic_not_conn_content").fadeOut(300);
                    $("#nic_conn_content").fadeOut(350, function() {
                        // $("#manager_page").mCustomScrollbar("update");
                    });
                    this.wifi_mode = '';
                }
            }
        },
        components: {
            DropdownMenu,
            SwitchButton
        }
    }
</script>

<style lang='scss'>
    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }

    .options_left_title {
        clear: both;
        float: left;
        font-size: 14px;
        line-height: 40px;
    }

    .options_float_right {
        display: flex;
        justify-content: space-around;
    }
</style>