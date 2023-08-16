<template>
    <div id='lighting_page' class='list_right_box'>
        <div class='menu_list_box'>
            <div class='lighting_menu_list'>
                <div class='list_name'> {{mcs_IR_mode}} </div>
                <div class='list_info'>
                    <input type="radio" value='red' v-model='light_mode' :class='light_mode == "red"?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
                </div>
            </div>
        </div>
        <div class='menu_list_box_title2'> {{mcs_IR_mode_detail}} </div>
        <div class='menu_list_box'>
            <div class='lighting_menu_list'>
                <div class='list_name'> {{mcs_white_light_mode}} </div>
                <div class='list_info'>
                    <input type="radio" value='white' v-model='light_mode' :class='light_mode == "white"?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
                </div>
            </div>
        </div>
        <div class='menu_list_box_title2'> {{mcs_white_light_mode_detail}} </div>
        <div class='menu_list_box'>
            <div class='lighting_menu_list'>
                <div class='list_name'> {{mcs_smart_mode}} </div>
                <div class='list_info'>
                    <input type="radio" value='auto' v-model='light_mode' :class='light_mode == "auto"?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
                </div>
            </div>
        </div>
        <div class='menu_list_box_title2'> {{mcs_smart_mode_detail}} </div>
        <div id='set_lighting_btn' class='list_right_button' @click="set_lighting_btn"> {{mcs_action_apply}} </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //多国语言
                mcs_IR_mode: mcs_IR_mode, //红外模式
                mcs_IR_mode_detail: mcs_IR_mode_detail, //选择红外模式后，在夜间光线不足时，红外线开启
                mcs_white_light_mode: mcs_white_light_mode, //白光模式
                mcs_white_light_mode_detail: mcs_white_light_mode_detail, //选择白光模式后，在夜间光线不足时，白光灯开启
                mcs_smart_mode: mcs_smart_mode, //智能模式
                mcs_smart_mode_detail: mcs_smart_mode_detail, //选择智能模式后，在夜间光线不足时，默认为红外灯，如有物体移动时，切换为白光灯，白光灯时间持续一分钟
                mcs_action_apply: mcs_action_apply, //应用

                light_mode: '', //灯光模式
                project_name: '', //项目名
            }
        },
        mounted() {
            this.project_name = this.$store.state.jumpPageData.projectName;
            this.$api.set.white_light_get({
                sn: this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
                this.publicFunc.closeBufferPage()
                if (res.result === "") {
                    if (res.conf.light_mode === "red") {
                        this.light_mode = 'red';
                    } else if (res.conf.light_mode === "white") {
                        this.light_mode = 'white';
                    } else {
                        this.light_mode = 'auto';
                    }
                } else {
                    this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
                }
            })
        },
        methods: {
            set_lighting_btn() { //应用
                this.publicFunc.showBufferPage()
                this.$api.set.white_light_set({
                    light_mode: this.light_mode,
                    sn: this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                    this.publicFunc.closeBufferPage()
                    if (res.result != "") {
                        if (res.result == "permission.denied") {
                            this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                        } else {
                            this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
                        }
                    } else {
                        this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
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

    #lighting_page {
        input[type='radio'] {
            appearance: none;
            -webkit-appearance: none;
            outline: none;
            margin: 0;
            vertical-align: text-bottom;
            margin-right: 0.1rem;
        }

        .lighting_menu_list {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid rgb(204, 204, 204);
        }
    }
</style>