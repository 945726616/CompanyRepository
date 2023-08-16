<template>
    <div id='sd_info' class='list_right_box'>
        <div class='list_right_item'>
            <span class='attribute_key_text'> {{mcs_enabled}} </span>
            <switch-button v-model='switch_flag' @data_updata_event='switch_flag_updata'></switch-button>
        </div>
        <transition name='fade'>
            <div id='open_switch' v-show='switch_flag'>
                <div class='list_right_item'>
                    <span class='attribute_key_text'> {{mcs_status}} </span>
                    <div class='options_float_right'><input type='text' id='input_status' class='input_read_only' disabled v-model='input_status' /></div>
                </div>
                <div class='list_right_item_ex' id='input_capacity_content' v-if='input_capacity_content_sign'>
                    <span class='attribute_key_text'> {{mcs_capacity}} </span>
                    <div class='options_float_right'><input type='text' id='input_capacity' class='input_read_only' disabled v-model='input_capacity' /></div>
                </div>
                <!-- <div class='list_right_item_ex' id='input_usage_content'>
                    <span class='attribute_key_text'>mcs_usage</span>
                    <div class='options_float_right'><input type='text' id='input_usage' class='input_read_only' disabled /></div>
                </div> -->
                <div class='list_right_item' id='input_available_content' v-if="input_available_content_sign">
                    <span class='attribute_key_text'> {{mcs_valid}} </span>
                    <div class='options_float_right'><input type='text' id='input_available' class='input_read_only' disabled v-model='input_available' /></div>
                </div>

                <!-- sd卡描述 -->
                <div id='sd_describe' v-if="sd_describe_sign">
                    <div> {{mcs_sd_first}} </div>
                    <div> {{mcs_sd_nospace}} </div>
                </div>
                <!-- 如何导出sd卡 -->
                <div id='sd_export_link' @click='sd_export_link_content_sign = true' v-if='sd_export_link_sign'> {{mcs_how_to_export_sd}} </div>
                <div id='sd_export_link_content' v-if='sd_export_link_content_sign'> {{mrs_login_please}} www.{{project_name}}.com, {{(project_name === 'vimtag' || project_name === 'ebitcam') ? mrs_sd_export_tips_vimtag : mrs_sd_export_tips}} </div>
                <!-- 硬盘描述 -->
                <div id='disk_describe' v-if="disk_describe_sign"> {{mcs_hard_disk_title_1}} </div>

                <!-- <div id='sd_mode'>
                    <div class='sd_display'>
                        <div class='menu_list_box_title2 menu_list_mode sd_mode_text'>mcs_mode</div>
                        <div class='menu_list_box'>
                            <div class='menu_list menu_list_children_mode' style=''>
                                <div class='list_name sd_mode_text'>mcs_normal_mode</div>
                                <div class='list_info'>
                                    <div type='0' class='list_info_select list_info_select_img'></div>
                                </div>
                            </div>
                            <div class='menu_list menu_list_children_mode' style=''>
                                <div class='list_name sd_mode_text'>mcs_long_video_mode</div>
                                <div class='list_info'>
                                    <div type='50' class='list_info_select list_info_select_img'></div>
                                </div>
                            </div>
                            <div class='menu_list menu_list_children_mode' style=''>
                                <div class='list_name sd_mode_text'>mcs_super_long_video_mode</div>
                                <div class='list_info'>
                                    <div type='100' class='list_info_select list_info_select_img'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->

                <div class='list_right_item_ex' id='format_content' v-if='format_content_sign'>
                    <span class='attribute_key_text'>- {{mcs_format}} </span>
                    <button id='format_btn' class='list_right_button_ex options_float_right_button' @click='format_btn'>{{mcs_format}}</button>
                </div>
            </div>
        </transition>
        <button id='sd_apply' class='list_right_button' @click='sd_apply_btn'>{{mcs_action_apply}}</button>
    </div>
</template>

<script>
    import SwitchButton from '@/module/switchButton'
    export default {
        data() {
            return {
                //多国语言
                mcs_enabled: mcs_enabled, //启用状态
                mcs_status: mcs_status, //状态
                mcs_capacity: mcs_capacity, //容量
                mcs_valid: mcs_valid, //启用
                mcs_sd_first: mcs_sd_first, //1.当SD卡第一次插入摄像机使用时，摄像机会对SD卡自动格式化
                mcs_sd_nospace: mcs_sd_nospace, //当SD卡没有可使用空间时，会对最早空间进行覆盖
                mcs_how_to_export_sd: mcs_how_to_export_sd, //如何导出SD卡数据
                mrs_login_please: mrs_login_please, //请登录
                mcs_hard_disk_title_1: mcs_hard_disk_title_1, //当硬盘没有可使用空间时，会对最早空间进行覆盖
                mrs_sd_export_tips: mrs_sd_export_tips, //在【下载】页面中下载sdtool电脑客户端,导出SD卡数据
                mrs_sd_export_tips_vimtag: mrs_sd_export_tips_vimtag, //在服务下载页面中下载sdtool电脑客户端,导出SD卡数据
                mcs_format: mcs_format, //格式化
                mcs_action_apply: mcs_action_apply, //应用

                project_name: '', //项目名
                switch_flag: true, //启动状态
                sd_export_link_content_sign: false, //是否显示如何导出SD卡数据内容
                input_capacity: '', //容量
                input_available: '', //启用
                input_status: '', //状态
                format_content_sign: false, //是否显示格式化
                input_capacity_content_sign: false, //是否显示容量
                input_available_content_sign: false, //是否显示启用
                sd_describe_sign: false, //是否显示sd卡描述
                sd_export_link_sign: false, //是否显示如何导出sd卡数据
                disk_describe_sign: false, // 是否显示硬件描述
            }
        },
        props: {
            info: {
                type: Object,
                default: function() {}
            }
        },
        mounted() {
            this.project_name = this.$store.state.jumpPageData.projectName;
            this.$api.set.sd_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                if (res) {
                    this.switch_flag = res.enable ? true : false;
                    this.input_capacity = res.capacity + "MB";
                    this.input_available = res.availableSize + "MB";
                    switch (res.status) {
                        case "empty": {
                            this.input_status = res.no_sdcard;
                            break;
                        }
                        case "ro":
                        case "readonly": {
                            this.input_status = mcs_fault;
                            this.format_content_sign = true;
                            break;
                        }
                        case "mount": {
                            this.input_status = mcs_connnected;
                            this.input_capacity_content_sign = true;
                            this.input_available_content_sign = true;
                            this.format_content_sign = true;
                            if (this.info.list_name == "SD卡") {
                                this.sd_describe_sign = true;
                                this.sd_export_link_sign = true;
                            } else if (this.info.list_name == "硬盘") {
                                this.disk_describe_sign = true;
                            }

                            break;
                        }
                        case "repairing": {
                            this.input_status = mcs_repairing;
                            break;
                        }
                        case "formating": {
                            this.input_status = mcs_formating;
                            break;
                        }
                        case "umount": {
                            this.input_status = mcs_unmounted;
                            break;
                        }
                        case "mounting": {
                            this.input_status = mcs_loading;
                            break;
                        }
                    }
                }
            })
        },
        methods: {
            format_btn() { //格式化
                let flag = this.switch_flag ? 1 : 0;
                this.publicFunc.delete_tips({
                    content: mcs_format_prompt,
                    func: () => {
                        this.$api.set.sd_set({ sn: this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "format", flag: flag }).then(res => {
                            this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                        })
                    }
                })
            },
            sd_apply_btn() { //应用
                let flag = this.switch_flag ? 1 : 0;
                this.$api.set.sd_set({ sn: this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "", flag: flag }).then(res => {
                    this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                })
            },
            switch_flag_updata(data) { //更新SD卡启动按钮
                this.switch_flag = data;
            }
        },
        components: {
            SwitchButton
        }
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }

    #sd_describe {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
    }

    #sd_describe div {
        height: 35px;
        line-height: 35px;
    }

    #sd_export_link {
        font-size: 14px;
        color: $projectColor;
        margin-top: 15px;
        height: 40px;
        line-height: 40px;
        cursor: default;
    }

    #sd_export_link_content {
        font-size: 14px;
        color: $projectColor;
        margin-top: 15px;
        height: 40px;
        line-height: 35px;
    }

    #disk_describe {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: #666;
        margin-top: 15px;
    }
</style>