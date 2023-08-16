<template>
    <div id='date_info' class='list_right_box'>
        <div class='list_right_item_ex'>
            <div class='options_float_left'> {{mcs_date}} </div>
            <div class='options_float_right'>
                <input id='input_date_year' class='vimtag_date' type='text' style='width:43px' :disabled='auto_sync_sign' v-model='date_year' />
                <span id='date_year_span' style='padding:0 2px 0 2px'> {{mcs_year}} </span>
                <input id='input_date_month' class='vimtag_date' type='text' style='width:38px' :disabled='auto_sync_sign' v-model='date_month' />
                <span id='date_month_span' style='padding:0 2px 0 2px'> {{mcs_month}} </span>
                <input id='input_date_day' class='vimtag_date' type='text' style='width:38px' :disabled='auto_sync_sign' v-model='date_day' />
                <span id='date_day_span' style='padding:0 2px 0 2px'> {{mcs_day}} </span>
            </div>
        </div>
        <div class='list_right_item' id='date_time'>
            <div class='options_float_left'> {{mcs_time}} </div>
            <div class='options_float_right'>
                <input id='input_time_hour' class='vimtag_date' type='text' style='width:54px' :disabled='auto_sync_sign' v-model="time_hour" />
                <span id='time_hour_span' style='padding:0 2px 0 2px'>:</span>
                <input id='input_time_minute' class='vimtag_date' type='text' style='width:53px' :disabled='auto_sync_sign' v-model="time_minute" />
                <span id='time_minute_span' style='padding:0 2px 0 2px'>:</span>
                <input id='input_time_second' class='vimtag_date' type='text' style='width:53px' :disabled='auto_sync_sign' v-model="time_second" />
            </div>
        </div>
        <div id='time_zone_selevt_content' class='list_right_item_ex'>
            <div class='options_float_left'> {{mcs_time_zone}} </div>
            <div class='options_float_right select_block'>
                <dropdown-menu :menuData="time_zone_array" :showData='time_zone' @data_updata_event='time_zone_updata'></dropdown-menu>
            </div>
        </div>
        <div class='list_right_item_ex' id='auto_date_box' style="display:none;">
            <div class='options_float_left'> {{mcs_auto_sync_date_time}} </div>
            <switch-button v-model='auto_sync_sign' @data_updata_event='auto_sync_updata'></switch-button>
        </div>
        <div class='list_right_item' style='display:none'>
            <div id='ntp' class='clear'>
                <div class='options_float_left'> {{mcs_ntp}} </div>
                <div class='options_float_right'><input id='input_ntp' class='vimtag_service_address' type='text' style='width:145px' v-model="input_ntp" /></div>
            </div>
        </div>
        <div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' @click='button_setup_btn'> {{mcs_apply}} </button></div>
    </div>
</template>

<script>
    import DropdownMenu from '@/module/dropdownMenu'
    import SwitchButton from '@/module/switchButton'
    export default {
        data() {
            return {
                //多国语言
                mcs_date: mcs_date, //日期
                mcs_year: mcs_year, //年
                mcs_month: mcs_month, //月
                mcs_day: mcs_day, //日
                mcs_time: mcs_time, //时间
                mcs_time_zone: mcs_time_zone, //时区
                mcs_auto_sync_date_time: mcs_auto_sync_date_time, //自动设置日期和时间
                mcs_ntp: mcs_ntp, //时间服务器地址
                mcs_apply: mcs_apply, //应用

                auto_sync_sign: '', //是否自动设置时间
                time_zone_list: [], //获取的时区列表
                time_zone_array: [], //时区数组
                time_zone: '', //时区
                time_hour: '', //时
                time_minute: '', //分
                time_second: '', //秒
                date_year: '', //年
                date_month: '', //月
                date_day: '', //日
                input_ntp: '', //时间服务器地址
                stop_time: { input_year: "", input_month: "", input_day: "", input_hour: "", input_minute: "", input_second: "" },
            }
        },
        mounted() {
            let _this = this;
            let l_refresh_time_id = '';

            _this.$api.devlist.time_zone_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                if (res) {
                    for (let i = 0; i < res.length; i++) {
                        let zone_name_tmp = res[i].city.replace(/\(|&|\)|_/g, "")
                        let zone_name = eval("mcs_timezone_" + zone_name_tmp)
                        _this.time_zone_list.push({
                            utc: res[i].utc,
                            city: res[i].city,
                            file: res[i].file,
                            name: zone_name
                        })
                        _this.time_zone_array.push(zone_name)
                    }
                }
            })
            _this.$api.set.time_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                _this.date_year = res.year;
                _this.date_month = res.mon;
                _this.date_day = res.day;
                _this.time_hour = res.hour;
                _this.time_minute = res.min;
                _this.time_second = res.sec;
                if (res.auto_sync)
                    this.auto_sync_sign = true;
                else
                    this.auto_sync_sign = false
                if (res.ntp_addr) {
                    _this.input_ntp = res.ntp_addr;
                }
                if (res.timezone) {
                    let zone_name_tmp = res.timezone.replace(/\(|&|\)|_/g, "")
                    _this.time_zone = eval("mcs_timezone_" + zone_name_tmp)
                }
                refresh_time_func({
                    year: _this.date_year,
                    month: _this.date_month,
                    day: _this.date_day,
                    hour: _this.time_hour,
                    minute: _this.time_minute,
                    second: _this.time_second
                });
            })

            function refresh_time_func(obj) {
                let year = parseInt(obj.year, 10);
                let month = parseInt(obj.month, 10);
                let day = parseInt(obj.day, 10);
                let hour = parseInt(obj.hour, 10);
                let minute = parseInt(obj.minute, 10);
                let second = parseInt(obj.second, 10);
                let leap_year = false;

                clearTimeout(l_refresh_time_id);
                if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
                    leap_year = true;
                }
                if (++second >= 60) {
                    minute += 1;
                    second = 0;
                    if (minute >= 60) {
                        hour += 1;
                        minute = 0;
                        if (hour >= 24) {
                            day += 1;
                            hour = 0;
                            if ((month == 1 || month == 3 || month == 5 || month == 7 ||
                                    month == 8 || month == 10 || month == 12) && (day > 31)) {
                                month += 1;
                                day = 0;
                            } else if ((month == 2) && (day > (leap_year ? 29 : 28))) {
                                month += 1;
                                day = 0;
                            } else if (day > 30) {
                                month += 1;
                                day = 0;
                            }
                            if (month > 12) {
                                year += 1;
                                month = 0;
                            }
                        }
                    }
                }
                if (second < 10)
                    second = "0" + second;
                if (minute < 10)
                    minute = "0" + minute;
                let focus_id = document.activeElement.id;
                if (focus_id != "input_date_year" && focus_id != "input_date_month" && focus_id != "input_date_day" && focus_id != "input_time_hour" && focus_id != "input_time_minute" && focus_id != "input_time_second") {
                    if (_this.stop_time.input_year) {
                        if (_this.stop_time.input_year != _this.date_year || _this.stop_time.input_month != _this.date_month || _this.stop_time.input_day != _this.date_day || _this.stop_time.input_hour != _this.time_hour || _this.time_minute != _this.stop_time.input_minute || _this.time_second != _this.stop_time.input_second) {
                            return;
                        }
                    }
                    if (_this.stop_time.input_year) {
                        _this.stop_time.input_year = "";
                        _this.stop_time.input_month = "";
                        _this.stop_time.input_day = "";
                        _this.stop_time.input_hour = "";
                        _this.stop_time.input_minute = "";
                        _this.stop_time.input_second = "";
                    }
                    _this.date_year = year;
                    _this.date_month = month;
                    _this.date_day = day;
                    _this.time_hour = hour;
                    _this.time_minute = minute;
                    _this.time_second = second;
                } else if (focus_id == "input_date_year" || focus_id == "input_date_month" || focus_id == "input_date_day" || focus_id == "input_time_hour" || focus_id == "input_time_minute" || focus_id == "input_time_second") {
                    if (_this.stop_time.input_year == "") {
                        _this.stop_time.input_year = _this.date_year;
                        _this.stop_time.input_month = _this.date_month;
                        _this.stop_time.input_day = _this.date_day;
                        _this.stop_time.input_hour = _this.time_hour;
                        _this.stop_time.input_minute = _this.time_minute;
                        _this.stop_time.input_second = _this.time_second;
                    }
                }
                l_refresh_time_id = setTimeout(function() { refresh_time_func({ year: year, month: month, day: day, hour: hour, minute: minute, second: second }) }, 1000);
            }
        },
        methods: {
            button_setup_btn() { //应用
                let time_zone_index = this.time_zone_list.findIndex(obj => obj.name == this.time_zone)
                this.$api.set.time_set({
                    sn: this.$store.state.jumpPageData.selectDeviceIpc,
                    type: this.auto_sync_sign ? "NTP" : "manually",
                    timezone: this.time_zone_list[time_zone_index].city,
                    hour: this.time_hour,
                    min: this.time_minute,
                    sec: this.time_second,
                    year: this.date_year,
                    mon: this.date_month,
                    day: this.date_day,
                    auto_sync: Number(this.auto_sync_sign),
                    ntp_addr: this.input_ntp
                }).then(res => {
                    this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                })
            },
            time_zone_updata(data) { //更新时区
                this.time_zone = data;
            },
            auto_sync_updata(data) { //更新自动设置时间日期
                this.auto_sync_sign = data;
            }
        },
        components: {
            DropdownMenu,
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

    .vimtag_date {
        width: 52px;
        color: $projectColor;
        height: 34px;
        font-weight: 400;
        background-color: white;
        border-radius: 4px;
        border: 1px solid $projectColor;
        text-align: center;
    }

    #date_info .options_float_right {
        display: flex;
        align-items: center;
    }
</style>