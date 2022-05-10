<template>
    <div id='osd_info' class='list_right_box'>
        <div class='list_right_item_ex'>
            <div class='attribute_key_text'> {{mcs_display_text}} </div>
            <switch-button v-model='display_name_sign' @data_updata_event='display_name_updata'></switch-button>
        </div>
        <transition name='fade'>
            <div id='input_display_name_content' class='list_right_item' v-show='display_name_sign'>
                <div class='attribute_key_text'> {{mcs_name}} </div>
                <!-- <div class='options_float_right' style='margin-top:0px;'><input type='text' id='input_display_name' onkeyup=\value=value.replace(/[^\a-\z\A-\Z]/g,'')\onpaste=\value=value.replace(/[^\a-\z\A-\Z]/g,'')\ oncontextmenu=\value=value.replace(/[^\a-\z\A-\Z]/g,'')\ maxlength='16' class='normal_input_right'></input></div> -->
                <div class='options_float_right' style='margin-top:0px;'>
                    <input type='text' id='input_display_name' maxlength='16' class='normal_input_right' v-model='input_display_name' />
                </div>
            </div>
        </transition>
        <!-- <div class='list_right_item_ex'>
            <div class='attribute_key_text'> {{mcs_display_date}} </div>
            <switch-button v-model='display_date_sign' @data_updata_event='display_date_updata'></switch-button>
        </div> -->
        <div class='list_right_item_ex'>
            <div class='attribute_key_text'> {{mcs_display_time}} </div>
            <switch-button v-model='display_time_sign' @data_updata_event='display_time_updata'></switch-button>
        </div>
        <transition name='fade'>
            <div v-show='display_time_sign'>
                <div id='display_date_content' class='list_right_item'>
                    <div class='attribute_key_text'> {{mcs_date_format}} </div>
                    <div class='options_float_right' style='margin-top:0px;'>
                        <dropdown-menu :menuData="date_format_array" :showData='date_format' @data_updata_event='data_format_updata'></dropdown-menu>
                    </div>
                </div>
                <div id='time_format_content' class='list_right_item'>
                    <div class='attribute_key_text'> {{mcs_time_format}} </div>
                    <div class='options_float_right' style='margin-top:0px;'>
                        <dropdown-menu :menuData="time_format_array" :showData='time_format' @data_updata_event='time_format_updata'></dropdown-menu>
                    </div>
                </div>
            </div>
        </transition>
        <div class='list_right_item_ex'>
            <div class='attribute_key_text'> {{mcs_display_weeks}} </div>
            <switch-button v-model='display_week_sign' @data_updata_event='display_week_updata'></switch-button>
        </div>
        <div class='options_float_right' style='clear:both'>
            <button id='button_setup' class='list_right_button' @click='setup_btn'> {{mcs_apply}} </button>
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
                mcs_display_text: mcs_display_text, //显示名称
                mcs_name: mcs_name, //名称
                mcs_display_date: mcs_display_date, //显示日期
                mcs_date_format: mcs_date_format, //日期格式
                mcs_display_time: mcs_display_time, //显示时间
                mcs_time_format: mcs_time_format, //时间格式
                mcs_display_weeks: mcs_display_weeks, //显示星期
                mcs_apply: mcs_apply, //应用

                input_display_name: '', //名称
                date_format_array: ['MM-DD-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], //日期格式数组
                date_format: '', //日期格式
                time_format_array: [mcs_12_hour, mcs_24_hour], //时间格式数组
                time_format: '', //时间格式
                display_name_sign: '', //控制是否显示名称
                display_date_sign: '', //控制是否显示日期
                display_time_sign: '', //控制是否显示时间
                display_week_sign: '', //控制是否显示星期
            }
        },
        mounted() {
            this.$api.set.osd_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                this.date_format = res.date_format;
                this.time_format = res.time_12h ? mcs_12_hour : mcs_24_hour
                if (res.text_enable) {
                    this.display_name_sign = true;
                } else {
                    this.display_name_sign = false;
                }
                this.input_display_name = res.text;
                if (res.date_enable) {
                    this.display_date_sign = true;
                } else {
                    this.display_date_sign = false;
                }
                if (res.time_enable) {
                    this.display_time_sign = true;
                } else {
                    this.display_time_sign = false;
                }
                if (res.week_enable) {
                    this.display_week_sign = true;
                } else {
                    this.display_week_sign = false;
                }
            })
        },
        methods: {
            setup_btn() { //应用
                this.$api.set.osd_set({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc,
                    text: this.input_display_name,
                    text_enable: Number(this.display_name_sign),
                    week_enable: Number(this.display_week_sign),
                    date_format: this.date_format,
                    date_enable: Number(this.display_time_sign),
                    time_12h: this.time_format === mcs_12_hour ? 1 : 0,
                    time_enable: Number(this.display_time_sign)
                }).then(res => {
                    this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                })
            },
            data_format_updata(data) { //更新日期格式
                this.date_format = data;
            },
            time_format_updata(data) { //更新时间格式
                this.time_format = data;
            },
            display_name_updata(data) { //更新是否显示名称
                this.display_name_sign = data;
            },
            display_date_updata(data) { //更新是否显示日期
                this.display_date_sign = data;
            },
            display_time_updata(data) { //更新是否显示时间
                this.display_time_sign = data;
            },
            display_week_updata(data) { //更新是否显示星期
                this.display_week_sign = data;
            }
        },
        watch: {
            input_display_name(val) { //osd名称不允许输入汉字
                if (val) {
                    this.input_display_name = val.replace(/[\u4e00-\u9fa5]/ig, "");
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

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>