<template>
  <div id='time_page'>
    <div id='time_page_box' v-show='setTimePageObj.show_page === "time_page"'>
      <div id='attachmen_box_close' @click='attachmen_box_close'></div>
      <div class='set_main_page_alarm'>
        <!-- 允许报警和开关 -->
        <div class='menu_list_box'>
          <div class='menu_list record_allow'>
            <div class='list_name record_padding'> {{set_record_alarm_title}} </div>
            <switch-button v-model='allow_record_sign' @data_updata_event='allow_record_updata'></switch-button>
          </div>
        </div>
        <div class='menu_list_box_title2 record_background'> {{set_record_alarm_content}} </div>

        <!-- 设置时间 -->
        <div class='margin'>
          <div class='set_alarm_time_word' v-if='scene_data_out_sign'> {{set_record_alarm_allow_title}} </div>
          <div class='menu_list_box' id='hide_timebox' v-if='scene_data_out_sign'>
            <div id='set_out_time_box'>
              <div v-for='(item, index) in time_format' :key='index' class='selsect_set_time_btn' :index='index' :time='item.start_time + "_" + item.end_time + "_" +  week_num[index]' @click='selsect_set_time_btn'>
                <div class='time_list_name'>
                  <div class='time_list_name_title record_padding'>{{ first_click[index]?item.start_time + ":00 - " + item.end_time + ":00":start_time + ":00 - " + end_time + ":00"}}</div>
                  <div class='time_list_name_tips'> {{week[index]}} </div>
                </div>
                <div class='list_info'>
                  <div class='right_arrow'></div>
                </div>
              </div>
            </div>
            <div class='time_menu_list_add' id='set_time_add' type='add_time' time='0_24_0.1.2.3.4.5.6' @click='selsect_set_time_btn'>
              <div class='set_time_add'></div>
            </div>
          </div>
        </div>
        <div class='menu_list_apply' id='submit_apply' @click='submit_apply'> {{mcs_apply}} </div>
      </div>
    </div>
    <div id='attachmen_box' v-if='setTimePageObj.show_page === "attachmen_page" || setTimePageObj.show_page === "week_page"'>
      <div class='record_box_top'>
        <div id='record_back_box' class='record_back' @click='back_btn'>
          <div id='record_return_img'></div>
          <div class='record_back'> {{mcs_back}} </div>
        </div>
        <div class='record_edit_time'> {{mcs_edit_time}} </div>
        <div id='delete_set_record' @click='delete_record_btn'> {{setTimePageObj.show_page === "attachmen_page"?mcs_delete:" "}} </div>
      </div>
      <div id='set_time_main_page' v-show='setTimePageObj.show_page === "attachmen_page"'>
        <div class='set_time_list set_starttime_list'>
          <div class='set_time_list_left record_padding'> {{mcs_begin_time}} </div>
          <div :class='date_plugin_sign === "start_time"?"start_time_active record_padding":"record_padding"' id='start_time' @click='date_plugin_sign = "start_time"'> {{start_time}}:00</div>
        </div>
        <div style='height:2rem;background:#EFEFF4'></div>
        <div class='set_time_list set_endtime_list'>
          <div class='set_time_list_left record_padding'> {{mcs_end_time}} </div>
          <div :class='date_plugin_sign === "end_time"?"start_time_active record_padding":"record_padding"' id='end_time' @click='date_plugin_sign = "end_time"'> {{end_time}}:00</div>
        </div>
        <div class='select_time_box' id='datePlugin' :style='date_plugin_sign?"display:block":"display:none"'>
        </div>
        <div class='select_week_box' id='click_arrow' @click='select_week_btn'>
          <div style='margin-left:1rem;float:left'> {{mcs_repeat}} </div>
          <div class='week_Box' style='float:right;width:400px;'>
            <span class='week_list' id='week0' v-if='repeat_week.indexOf("0")>-1'> {{mcs_Sunday_and}} <span class='dian_tip'> 、 </span> </span>
            <span class='week_list' id='week1' v-if='repeat_week.indexOf("1")>-1'> {{mcs_Monday_and}} <span class='dian_tip'> 、 </span> </span>
            <span class='week_list' id='week2' v-if='repeat_week.indexOf("2")>-1'> {{mcs_Tuesday_and}} <span class='dian_tip'> 、 </span> </span>
            <span class='week_list' id='week3' v-if='repeat_week.indexOf("3")>-1'> {{mcs_Wednesday_and}} <span class='dian_tip'> 、 </span> </span>
            <span class='week_list' id='week4' v-if='repeat_week.indexOf("4")>-1'> {{mcs_Thursday_and}} <span class='dian_tip'> 、 </span> </span>
            <span class='week_list' id='week5' v-if='repeat_week.indexOf("5")>-1'> {{mcs_Friday_and}} <span class='dian_tip'> 、 </span> </span>
            <span class='week_list' id='week6' v-if='repeat_week.indexOf("6")>-1'> {{mcs_Saturday_and}} <span class='dian_tip'> 、 </span></span>
          </div>
        </div>
      </div>
      <div id='set_time_main_page' v-show='setTimePageObj.show_page === "week_page"'>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Sunday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='0' v-model='week_select' :class='week_select.indexOf("0")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Monday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='1' v-model='week_select' :class='week_select.indexOf("1")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Tuesday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='2' v-model='week_select' :class='week_select.indexOf("2")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Wednesday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='3' v-model='week_select' :class='week_select.indexOf("3")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Thursday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='4' v-model='week_select' :class='week_select.indexOf("4")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Friday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='5' v-model='week_select' :class='week_select.indexOf("5")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
        <div class='set_week'>
          <div class='week_every'> {{mcs_Saturday_and}} </div>
          <div class='week_every_imgbox'>
            <input type="checkbox" value='6' v-model='week_select' :class='week_select.indexOf("6")>-1?project_name+"_list_info_clickselect_img":"list_info_select_img"' />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SwitchButton from '@/module/switchButton'
import mcodec from '../../../util/mcodec.js';
import '@/lib/plugins/time_select.js';
export default {
  props: {
    setTimePageObj: { // 添加设备弹窗展示对象
      type: Object,
      default: function () { }
    }
  },
  data () {
    return {
      //多国语言
      mcs_apply: mcs_apply, //应用
      mcs_back: mcs_back, //返回
      mcs_edit_time: mcs_edit_time, //编辑时段
      mcs_delete: mcs_delete, //删除
      mcs_begin_time: mcs_begin_time, //开始时间
      mcs_end_time: mcs_end_time, //结束时间
      mcs_repeat: mcs_repeat, //重复
      mcs_Sunday_and: mcs_Sunday_and, //周日
      mcs_Monday_and: mcs_Monday_and, //周一
      mcs_Tuesday_and: mcs_Tuesday_and, //周二
      mcs_Wednesday_and: mcs_Wednesday_and, //周三
      mcs_Thursday_and: mcs_Thursday_and, //周四
      mcs_Friday_and: mcs_Friday_and, //周五
      mcs_Saturday_and: mcs_Saturday_and, //周六

      project_name: '', //项目名
      allow_record_sign: '', //控制是否允许录像/报警
      set_record_alarm_title: '', //报警/录像标题文字
      set_record_alarm_allow_title: '', //报警/录像时段文字
      set_record_alarm_content: '', //报警/录像下的详情文字
      g_show: false, //关闭弹窗是否显示确认离开
      time_format: [], //获取的时间数据
      day_list: [], //保存旧的时间数据
      scene_data_out: '', //保存获取的out数据
      scene_data_active: '', //保存获取的in数据
      scene_data_out_sign: true, //是否允许报警
      req_data: '',
      total_data: '', //点击应用时提交的时间数据
      week: [], //保存星期文字版
      week_num: [], //保存星期数字版
      start_time: '00', //开始时间
      end_time: '24', //结束时间
      repeat_week: '', //重复上显示的星期
      week_select: [], //选择的星期
      set_old_out_time: '',
      set_out_time: '', //保存点击时间段上的时间数据
      date_plugin_sign: '', //判断是否点击开始时间结束时间
      first_click: [], //是否首次修改时间
      back_sign: true, //是否返回成功
      old_week: '', //起初星期
      old_start_time: '00', //起初开始时间
      old_end_time: '00', //起初结束时间
      select_index: '', //选择的时间段
      add_time_sign: false, //判断是否为新添加时间段
      record_flag_out: true, //判断新添加时间段点击关闭是否显示提示
      switch_on_val: this.setTimePageObj.accessory_mode == 'alarm' ? 0x4 : 0x2, //允许录像或报警计算数值
      switch_off_val: this.setTimePageObj.accessory_mode == 'alarm' ? 0x3 : 0x5, //不允许录像或报警计算数值
      // 联动框架相关参数
      ealf: this.$store.state.set.deviceEalf, // 是否为支持联动框架设备
      face_detect: null, // 人脸侦测
      sound_detect: null, // 声音侦测
      human_detect: null, // 移动侦测
      alarm_dev_name: "", //附件名
      alarm_all_dev: null, // 设备所具有的附件
      flag: "", //计划表上的flag 1代表抓拍 2代表录像 4代表报警  flag表示设备所具有的功能的叠加值 exp:flag=6表示有报警加录像
      all_dev_name: [
        "", //type=0
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
      ],
      week_standard: [
        mcs_Sunday_and,
        mcs_Monday_and,
        mcs_Tuesday_and,
        mcs_Wednesday_and,
        mcs_Thursday_and,
        mcs_Friday_and,
        mcs_Saturday_and
      ],
      g_total_data: '',
      g_set_record_alarm: 'alarm', // 设置报警/录像标识
      g_hide: null,
    }
  },
  mounted () {
    this.project_name = this.$store.state.jumpPageData.projectName;
    if (this.setTimePageObj.accessory_mode == 'alarm') {
      this.set_record_alarm_title = mcs_Allow_alarm;
      this.set_record_alarm_allow_title = mcs_Allow_alarm_schedule;
      switch (this.setTimePageObj.accessory_type) {
        case '1':
          this.set_record_alarm_content = mcs_move_alarm_new_detail;
          break;
        case '5':
          this.set_record_alarm_content = mcs_sos_alarm_detail;
          break;
        case '6':
          this.set_record_alarm_content = mcs_send_alarm_notification;
          break;
        case '8':
        case '10':
          this.set_record_alarm_content = mcs_move_alarm_detail;
          break;
        case '9':
          this.set_record_alarm_content = mrs_open_switch_check_abnormal_noise_alarm;
          break;
        default:
          this.set_record_alarm_content = mcs_7x24_hours_prompt;
      }
    } else if (this.setTimePageObj.accessory_mode == 'record') {
      this.set_record_alarm_title = mcs_Allow_record;
      this.set_record_alarm_allow_title = mcs_Allow_record_schedule;
      switch (this.setTimePageObj.accessory_type) {
        case '1':
          this.set_record_alarm_content = mcs_move_record_new_detail;
          break;
        case '5':
          this.set_record_alarm_content = mcs_sos_record_detail;
          break;
        case '6':
          this.set_record_alarm_content = mcs_door_record_detail;
          break;
        case '8':
        case '10':
          this.set_record_alarm_content = mcs_move_record_detail;
          break;
        case '9':
          this.set_record_alarm_content = mrs_open_switch_check_abnormal_noise_record;
          break;
        default:
          this.set_record_alarm_content = mcs_continuous_recording_hint;
      }
    }
    // console.log(Number(this.ealf) === 0, 'this.ealf === 0', this.ealf)
    if (this.ealf === 0) {
      this.old_process() // 非联动框架执行步骤
    } else {
      this.new_process() // 联动框架执行步骤
    }
  },
  methods: {
    new_process () { // 新版流程(ealf===1, 支持联动框架 报警/录像时间设置可以分别设置)
      // console.log(this.setTimePageObj, 'enter new_process')
      this.g_js_param = this.setTimePageObj
      if (this.setTimePageObj.accessory_mode === 'record') {
        this.g_set_record_alarm = 'record'
      }
      this.new_set_alarm()
    },
    old_process () { // 旧版流程(ealf===0,不支持联动框架 报警/录像时间设置只能同步设置)
      this.publicFunc.showBufferPage()
      this.$api.set.scene_get({
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.publicFunc.closeBufferPage()
        let scene_data;
        if (res && res.result == "") {
          for (let i = 0; i < res.data.info.scene.length; i++) {
            scene_data = res.data.info.scene[i];
            if (scene_data.name == "out") {
              this.scene_data_out = res.data.info.scene[i];
              if (this.setTimePageObj.accessory_sn) {
                for (let j = 0; j < scene_data.dev.length; j++) {
                  if (scene_data.dev[j].id == this.setTimePageObj.accessory_sn) {
                    if (this.setTimePageObj.repeat_page !== 1) {
                      if (scene_data.dev[j].flag & this.switch_on_val) {
                        this.allow_record_sign = true;
                        this.scene_data_out_sign = true;
                      } else {
                        this.allow_record_sign = false;
                        this.scene_data_out_sign = false;
                      }
                    } else {
                      this.allow_record_sign = true;
                      this.scene_data_out_sign = true;
                    }
                  }
                }
              } else {
                if (this.setTimePageObj.repeat_page !== 1) {
                  if (scene_data.flag) {
                    this.allow_record_sign = true;
                    this.scene_data_out_sign = true;
                  } else {
                    this.allow_record_sign = false;
                    this.scene_data_out_sign = false;
                  }
                } else {
                  this.allow_record_sign = true;
                  this.scene_data_out_sign = true;
                }
              }
            } else if (scene_data.name == "in") {
              this.scene_data_active = res.data.info.scene[i];
            }
          }
          this.req_data = {
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            all: 1,
            info: {
              select: res.data.info.select,
              scene: [{ name: "auto", flag: 0 },
              {
                name: "out",
                flag: this.scene_data_out.flag,
                dev: this.scene_data_out.dev
              },
              {
                name: "in",
                flag: this.scene_data_active.flag,
                dev: this.scene_data_active.dev
              }
              ]
            }
          }
          if (this.setTimePageObj.repeat_page == 1) { //解决点击应用，开关值显示开，请求参数没改bug，最后开关还是关
            if (this.setTimePageObj.accessory_sn) {
              for (let i = 0; i < this.scene_data_out.dev.length; i++) {
                if (this.scene_data_out.dev[i].id == this.setTimePageObj.accessory_sn) {
                  this.req_data.info.scene[1].dev[i].flag = this.scene_data_out.dev[i].flag | this.switch_on_val; //on voice
                  this.req_data.info.scene[2].dev[i].flag = this.scene_data_active.dev[i].flag | this.switch_on_val; //on voice
                }
              }
            } else {
              this.req_data.info.scene[2].flag = 0;
              this.req_data.info.scene[1].flag = 1;
            }
          }
        }
      })
      if (this.total_data != "") {
        schedule_get(this.total_data);
      } else {
        this.$api.set.schedule_get({
          sn: this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res => {
          this.publicFunc.closeBufferPage()
          if (res && res.result == "") {
            this.total_data = res.data.sch.schedule;
            let l_data_2 = mcodec.b64_2_binary(res.data.sch.schedule, 1)
            let arr = []
            let arr2 = []
            let arr_tmp = []
            let str = "";
            if (!l_data_2) return;
            for (let k = 0; k < l_data_2.length; k++) {
              str = "";
              arr[k] = l_data_2[k].toString(2);
            }
            for (let i = 0; i < arr.length; i++) {
              for (let j = 0; j < 8; j++) {
                if (arr[i].length < 8) {
                  let addStr = "";
                  for (let k = 0; k < (8 - arr[i].length); k++) {
                    addStr += "0";
                  }
                  arr[i] = addStr + arr[i];
                }
                arr_tmp[i] = arr[i].split("").reverse().join("");
              }
            }
            for (let m = 0; m < 7; m++) {
              let n = m * 3;
              arr2[m] = arr_tmp[n] + arr_tmp[n + 1] + arr_tmp[n + 2];
            }
            let start_time = [];
            let end_time = [];
            for (let j = 0; j < arr2.length; j++) {
              let num = -1;
              start_time[j] = [];
              end_time[j] = [];
              for (let i = -1; i < arr2[j].length;) {
                if (arr2[j].indexOf(0, i) == i && i != -1) {
                  i++;
                  end_time[j][num]++;
                } else if (arr2[j].indexOf(0, i) < 0 && i > 0) {
                  i = arr2[j].length;
                } else if (arr2[j].indexOf(0, i) < 0 && i <= 0) {
                  i = arr2[j].length;
                  start_time[j][0] = 0;
                  end_time[j][0] = 0;
                } else {
                  num++;
                  start_time[j][num] = arr2[j].indexOf(0, i)
                  end_time[j][num] = arr2[j].indexOf(0, i)
                  i = arr2[j].indexOf(0, i);
                }
              }
            }
            for (let time_i = 0; time_i < 7; time_i++) {
              for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
                if (end_time[time_i][time_j]) {
                  if (this.time_format.length > 0) {
                    let is_exist = 0;
                    for (let time_format_i = 0; time_format_i < this.time_format.length; time_format_i++) {
                      if (start_time[time_i][time_j] == this.time_format[time_format_i].start_time && end_time[time_i][time_j] == this.time_format[time_format_i].end_time) {
                        this.time_format[time_format_i].week.push(time_i);
                        is_exist = 1;
                      }
                    }
                    if (is_exist == 0) {
                      this.time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                    }
                  } else {
                    this.time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                  }
                }
              }
            }
            for (let k = 0; k < this.time_format.length; k++) {
              this.week[k] = ''
              this.week_num[k] = ''
              for (let m = 0; m < this.time_format[k].week.length; m++) {
                if (this.time_format[k].week[m] == 0) {
                  this.week[k] += mcs_Sunday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                } else if (this.time_format[k].week[m] == 1) {
                  this.week[k] += mcs_Monday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                } else if (this.time_format[k].week[m] == 2) {
                  this.week[k] += mcs_Tuesday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                } else if (this.time_format[k].week[m] == 3) {
                  this.week[k] += mcs_Wednesday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                } else if (this.time_format[k].week[m] == 4) {
                  this.week[k] += mcs_Thursday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                } else if (this.time_format[k].week[m] == 5) {
                  this.week[k] += mcs_Friday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                } else if (this.time_format[k].week[m] == 6) {
                  this.week[k] += mcs_Saturday_and + "、";
                  this.week_num[k] += this.time_format[k].week[m] + ".";
                }
              }
              this.week[k] = this.week[k].substring(0, this.week[k].length - 1)
              this.week_num[k] = this.week_num[k].substring(0, this.week_num[k].length - 1)
              this.day_list.push({ start: this.time_format[k].start_time, end: this.time_format[k].end_time, week: this.week[k] });
            }
          }
        })
      }
    },
    attachmen_box_close () { //关闭弹窗
      if (this.ealf === 0) {
        this.record_flag(this.time_format, this.day_list)
      }
      // console.log(this.g_show, 'g_show')
      if (this.g_show) {
        this.publicFunc.delete_tips({
          content: mcs_is_save_hint,
          func: () => {
            this.$emit("time_page_close")
          }
        })
      } else {
        this.$emit("time_page_close")
      }
    },
    record_flag (data1, data2) {
      let a = 0,
        b = 0,
        c = 0,
        d = 0;
      let f = [];
      let g = [];
      let week_flag = 'true';
      for (let w = 0; w < data1.length; w++) {
        f.push(data1[w].week.sort().toString())
        a += data1[w].start_time
        c += data1[w].end_time
      }
      for (let j = 0; j < data2.length; j++) {
        let e = data2[j].week.split("、");
        let e_new = [];
        for (let o = 0; o < e.length; o++) {
          if (e[o] == mcs_Monday_and) {
            e_new.push(1)
          } else if (e[o] == mcs_Tuesday_and) {
            e_new.push(2)
          } else if (e[o] == mcs_Wednesday_and) {
            e_new.push(3)
          } else if (e[o] == mcs_Thursday_and) {
            e_new.push(4)
          } else if (e[o] == mcs_Friday_and) {
            e_new.push(5)
          } else if (e[o] == mcs_Saturday_and) {
            e_new.push(6)
          } else if (e[o] == mcs_Sunday_and) {
            e_new.push(0)
          }
        }
        g.push(e_new.sort().toString());
        b += data2[j].start;
        d += data2[j].end;
      }
      for (let r = 0; r < f.length; r++) {
        for (let y = 0; y < g.length; y++) {
          if (f[y] !== g[y]) {
            week_flag = 'false';
          }
        }
      }
      if (a == b && c == d && week_flag == "true") {
        this.g_show = false
      } else {
        this.g_show = true
      }
      if (this.record_flag_out == false) {
        this.g_show = false
      }
      return this.g_show;
    },
    selsect_set_time_btn (e) { //点击时间
      this.select_index = e.currentTarget.getAttribute('index')
      // console.log(e.currentTarget, 'e.currentTarget.getAttribute(index)')
      this.set_out_time = e.currentTarget.getAttribute('time')
      this.$set(this.setTimePageObj, "show_page", 'attachmen_page')
      let week_new = []; //保存选中哪些日期值
      let set_time_out_data // 设置的时间数据(联动框架需要使用)
      if (e.currentTarget.getAttribute('type') == 'add_time') {
        this.add_time_sign = true;
        this.select_index = this.time_format.length
        this.first_click[this.select_index] = true
      } else {
        this.add_time_sign = false;
      }
      if (this.first_click[this.select_index]) {
        if (this.set_old_out_time == "" && this.add_time_sign == false) {
          this.set_old_out_time = this.set_out_time;
          this.old_start_time = this.set_old_out_time.split("_")[0];
          this.old_end_time = this.set_old_out_time.split("_")[1];
          this.old_week = this.set_old_out_time.split("_")[2].split(".");
        }
        if (this.set_old_out_time != "" && this.add_time_sign == false) {
          this.old_start_time = this.set_old_out_time.split("_")[0];
          this.old_end_time = this.set_old_out_time.split("_")[1];
          this.old_week = this.set_old_out_time.split("_")[2].split(".");
        }
        if (this.set_out_time) {
          set_time_out_data = this.set_out_time.split("_");
          this.start_time = set_time_out_data[0] >= 10 ? set_time_out_data[0] : "0" + set_time_out_data[0];
          this.end_time = set_time_out_data[1] >= 10 ? set_time_out_data[1] : "0" + set_time_out_data[1];
          this.repeat_week = set_time_out_data[2] ? set_time_out_data[2].split(".") : [];
        }
        if (this.add_time_sign) {
          this.repeat_week = ['0', '1', '2', '3', '4', '5', '6']
        }

      }
      this.$nextTick(function () {
        // console.log('enter nextTick')
        $("#start_time").date({ theme: "datetime", h: this.start_time });
        $("#end_time").date({ theme: "datetime", h: this.end_time });
        for (let i = 0; i < this.time_format.length; i++) {
          this.first_click[i] = true;
        }
        this.first_click[this.select_index] = false;
      })
      if (this.ealf === 1) { // 联动框架需要执行的操作
        // console.log('enter this click event', this.select_index, this.g_total_data)
        if (this.select_index) {
          if (!this.g_total_data[this.select_index]) { // 如果选择的index不存在
            // console.log('enter this if')
            let weekArrList = [0, 0, 0, 0, 0, 0, 0]
            for (let weekIndex = 0; weekIndex < this.repeat_week.length; weekIndex++) {
              let index = Number(this.repeat_week[weekIndex])
              weekArrList[index] = 1
            }
            this.$set(this.g_total_data, this.select_index, { start: this.start_time, start_num: Number(set_time_out_data[0]), end: this.end_time, end_num: Number(set_time_out_data[1]), day: weekArrList })
          }
          // console.log(this.g_total_data, 'g_total_data')
          this.g_select_week = this.g_total_data[this.select_index].day
          this.g_js_param.set_plan.origin_day = JSON.stringify(this.g_total_data[this.select_index].day)
          this.new_set_time(this.select_index)
        } else {
          let index = "add"
          this.g_select_week = [1, 1, 1, 1, 1, 1, 1]
          this.new_set_time(index)
        }
      }
    },
    select_week_btn () { //选择星期
      this.$set(this.setTimePageObj, "show_page", 'week_page')
      this.first_click[this.select_index] = false;
      // console.log(this.repeat_week, 'this.repeat_week_select_week_btn')
      if (this.repeat_week)
        this.week_select = this.repeat_week
    },
    back_btn () { //点击返回
      // console.log('点击返回')
      this.date_plugin_sign = ''
      if (this.setTimePageObj.show_page == 'week_page') {
        this.$set(this.setTimePageObj, "show_page", 'attachmen_page')
        // console.log(this.repeat_week, 'this.repeat_week_back_btn')
        this.repeat_week = this.week_select
      } else {
        this.set_time_func("submit")
        if (this.back_sign) {
          this.$set(this.setTimePageObj, "show_page", 'time_page')
          if (this.add_time_sign && this.ealf === 0) {
            this.time_format.push({
              start_time: this.start_time,
              end_time: this.end_time,
              week: this.repeat_week
            })
          }
        }
      }
    },
    set_time_func (type) { //修改时间结果
      // console.log('调用set_time_func')
      let time_select = [];
      let tmp_data = '';
      let index = -1;
      let new_time_select = [];
      let new_week_select = [0, 0, 0, 0, 0, 0, 0]
      this.start_time = parseInt(this.publicFunc.mx("#start_time").innerHTML);
      this.end_time = parseInt(this.publicFunc.mx("#end_time").innerHTML);
      if (this.start_time >= this.end_time) { //报错：开始时间大于结束时间
        this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
        this.back_sign = false;
        return;
      } else {
        this.back_sign = true;
      }
      for (let i = 0; i < new_week_select.length; i++) { //选择重复星期
        if (this.repeat_week.indexOf(i.toString()) > -1) {
          new_week_select[i] = 1
        }
      }
      for (let i = 0; i < new_week_select.length; i++) {
        if (new_week_select[i]) {
          for (let j = 0; j < 24; j++) {
            if (j % 8 == 0) {
              tmp_data = "";
              index++;
            }
            if (j >= this.start_time && j < this.end_time) {
              tmp_data += "0"
            } else {
              tmp_data += "1"
            }
            time_select[index] = tmp_data.split("").reverse().join("");
          }
        } else {
          for (let j = 0; j < 24; j++) {
            if (j % 8 == 0) {
              tmp_data = "";
              index++;
            }
            tmp_data += "1"
            time_select[index] = tmp_data;
          }
        }
      }
      if (this.total_data != "") {
        let l_data_2 = mcodec.b64_2_binary(this.total_data, 1);
        let str = "";
        let arr = [];
        let arr2 = [];
        let arr_tmp = [];
        if (!l_data_2) return;
        for (let k = 0; k < l_data_2.length; k++) {
          str = "";
          arr[k] = l_data_2[k].toString(2);
        }
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < 8; j++) {
            if (arr[i].length < 8) {
              let addStr = "";
              for (let k = 0; k < (8 - arr[i].length); k++) {
                addStr += "0";
              }
              arr[i] = addStr + arr[i];
            }
          }
        }
        if (type == "submit") {
          if (this.add_time_sign == false) {
            for (let i = 0; i < this.old_week.length; i++) {
              let arr_all = "";
              let arr_all_arr = [];
              let arr1 = "";
              let arr2 = "";
              let arr3 = "";
              for (let j = 0; j < 3; j++) {
                arr_all += arr[this.old_week[i] * 3 + j].split("").reverse().join("");
              }
              arr_all_arr = arr_all.split("");
              for (let m = parseInt(this.old_start_time); m < parseInt(this.old_end_time); m++) {
                arr_all_arr[m] = "1";
              }
              for (let k = 0; k <= 7; k++) {
                arr1 += arr_all_arr[k];
              }
              for (let k = 8; k <= 15; k++) {
                arr2 += arr_all_arr[k]
              }
              for (let k = 16; k <= 23; k++) {
                arr3 += arr_all_arr[k]
              }
              arr[this.old_week[i] * 3] = arr1.split("").reverse().join("");
              arr[this.old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
              arr[this.old_week[i] * 3 + 2] = arr3.split("").reverse().join("");
            }
          }
          let select = [];
          if (this.add_time_sign == false) {
            for (let i = 0; i < new_week_select.length; i++) {
              if (new_week_select[i] == 1) {
                for (let j = 0; j < 3; j++) {
                  select.push(i * 3 + j);
                }
              }
            }
          }
          for (let n = 0; n < arr.length; n++) {
            let tmp_arr = arr[n].split("");
            let tmp_time_arr = time_select[n].split("");
            let arr_old = "";
            let arr_new = "";
            let tmp = "";
            for (let num = 0; num < tmp_arr.length; num++) {
              if (tmp_arr[num] == "1" && tmp_time_arr[num] == "0") {
                tmp += "0"
              } else if (tmp_arr[num] == "0" || tmp_time_arr[num] == "0") {
                tmp += "0"
              } else if (tmp_arr[num] == "0" && tmp_time_arr[num] == "0") {
                tmp += "0"
              } else if (tmp_arr[num] == "1" && tmp_time_arr[num] == "1") {
                tmp += "1"
              } else if (tmp_arr[num] == "0" && tmp_time_arr[num] == "1") {
                tmp += "0"
              }
            }
            new_time_select[n] = tmp;
          }
          new_time_select = stringToHex(new_time_select);
          let l_data_64 = mcodec.binary_2_b64(new_time_select, 1);
          this.total_data = l_data_64
        } else {
          for (let n = 0; n < arr.length; n++) {
            let tmp_arr = arr[n].split("");
            let tmp_time_arr = time_select[n].split("");
            let tmp = "";
            for (let num = 0; num < tmp_arr.length; num++) {
              if (tmp_time_arr[num] == "1") {
                tmp_time_arr[num] = "0"
              } else {
                tmp_time_arr[num] = "1"
              }
              if (tmp_arr[num] == "1" || tmp_time_arr[num] == "1") {
                tmp += "1"
              } else {
                tmp += "0"
              }
            }
            new_time_select[n] = tmp;
          }
          new_time_select = stringToHex(new_time_select);
          let l_data_64 = mcodec.binary_2_b64(new_time_select, 1);
          this.total_data = l_data_64
        }
      }

      // 联动框架
      if (this.ealf === 1) {
        let start_time = parseInt(this.publicFunc.mx("#start_time").innerHTML.split(":")[0])
        let start_str = $("#start_time").text()
        let end_time = parseInt(this.publicFunc.mx("#end_time").innerHTML.split(":")[0])
        let end_str = $("#end_time").text()
        this.$set(this.time_format, this.select_index, {
          start: start_str,
          start_time: start_time,
          end: end_str,
          end_time: end_time,
          week: this.repeat_week
        })
        // console.log(this.time_format, this.select_index, 'this.time_format')
      }

      function stringToHex (data) {
        let val = "";
        let arr = [];
        let arr0 = [];
        for (let i = 0; i < data.length; i++) {
          val = parseInt(data[i], 2).toString(16);
          arr[i] = val;
        }
        for (let j = 0; j < data.length; j++) {
          arr0[j] = 0xff & ("0x" + arr[j]);
        }
        return arr0;
      }
    },
    submit_apply () { //点击应用
      if (this.ealf === 0) { // 非联动框架点击提交
        this.record_flag_out = false;
        this.g_show = false;
        this.$api.set.schedule_set({
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          sch: {
            degree: 3600,
            schedule: this.total_data
          }
        }).then(res => {
          if (res && res.result === "") {
            this.add_time_sign = false;
            this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
          } else if (res.result === "permission.denied") {
            this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
          } else {
            this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
          }
          this.req_data.info.scene[2].flag = 0;
          this.req_data.info.scene[2].dev[0].flag = 0;
          this.$api.set.scene_set(this.req_data)
        })
      } else { // 联动框架点击提交
        let _this = this
        this.publicFunc.showBufferPage()
        let dev_name = this.g_js_param.set_plan.id //附件名称 (motion、io、face_detect、and so on)
        let sche = []
        // return;
        if (this.allow_record_sign === false) {
          if (dev_name === 'c_record') { //持续录像设置录像开关和 计划表
            sche = { plan: [{ start: 0, end: 604800, flag: 0, index: 1, mode: "" }] }
            let info = { name: "oflag", enable: 0, dev: [] }
            let info_iflag = { name: "iflag", enable: 0, dev: [] }
            this.$api.set.dev_action_set({
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              info: info_iflag
            }).then(res => {
              if (res.result === '') {
                this.$api.set.dev_action_set({
                  sn: this.$store.state.jumpPageData.selectDeviceIpc,
                  info: info
                }).then(res_second_action_set => {
                  if (res_second_action_set.result === '') {
                    this.$api.set.plan_record_set({
                      sn: this.$store.state.jumpPageData.selectDeviceIpc,
                      sche: sche
                    }).then(res_plan_record_set => {
                      this.sche_set_ack(res_plan_record_set)
                    })
                  } else {
                    this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                  }
                })
              } else {
                this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
              }
            })

          } else {
            let sche_form = this.g_js_param.set_plan.sche_form
            let cut_flag = this.g_set_record_alarm === 'alarm' ? 4 : 2
            let arr_flag_index = this.g_set_record_alarm === 'alarm' ? 1 : 2
            // // console.log(sche_form)
            sche_form.forEach(function (item, index) {
              let temp = item
              for (let i = 0; i < temp.length; i++) {
                (function (i) {
                  if (_this.change_string_to_four_bit_arr(temp[i])[arr_flag_index] === 1) {
                    temp[i] -= cut_flag
                  }
                })(i)
              }
            })
            // // console.log(sche_form)
            if (this.g_js_param.set_plan.id == 'motion') {
              sche_form.forEach(function (item, index) {
                for (let i = 0; i < item.length; i++) {
                  (function (i) {
                    item[i] += 8
                  })(i)
                }
              })
            }
            let plan_sel = this.sche_trans_to_second_format(sche_form)
            let plan = this.sche_add_action_name(plan_sel, this.g_js_param.set_plan.type)
            sche = { all: 0, dev_name: this.g_js_param.set_plan.id, plan: plan }
            this.$api.set.alarm_sche_set({
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              exdev_id: this.g_js_param.set_plan.id,
              sche: sche
            }).then(res => {
              this.sche_set_ack(res)
            })
          }
        } else {
          let commitArr = []
          // 整理上传时需要的数据
          for (let commitIndex = 0; commitIndex < this.time_format.length; commitIndex++) {
            let start
            let end
            if ((this.time_format[commitIndex].start_time + '').length < 2) {
              start = '0' + (this.time_format[commitIndex].start_time + '') + ':00'
            } else {
              start = this.time_format[commitIndex].start_time + '' + ':00'
            }
            if ((this.time_format[commitIndex].end_time + '').length < 2) {
              end = '0' + (this.time_format[commitIndex].end_time + '') + ':00'
            } else {
              end = this.time_format[commitIndex].end_time + '' + ':00'
            }
            // 星期数组
            let weekArr = [0, 0, 0, 0, 0, 0, 0]
            // console.log(this.time_format, commitIndex, 'this.time_format[commitIndex].week.length')
            for (let weekIndex = 0; weekIndex < this.time_format[commitIndex].week.length; weekIndex++) {
              let numberWeekIndex = Number(this.time_format[commitIndex].week[weekIndex])
              weekArr[numberWeekIndex] = 1
            }
            // 整理后的数组
            commitArr.push({
              start: start,
              start_time: this.time_format[commitIndex].start_time,
              end: end,
              end_time: this.time_format[commitIndex].end_time,
              day: weekArr
            })
          }
          // console.log('submit enter this if', commitArr)
          let plan_temp = []
          // let plan_flag = flag

          for (let i = 0; i < commitArr.length; i++) {
            let plan_item = commitArr[i]
            for (let j = 0; j < 7; j++) {
              if (plan_item.day[j] == 1) {
                plan_temp.push({ day: j, start: plan_item.start_time, end: plan_item.end_time })
              }
            }
          }
          // console.log(plan_temp, 'plan_temp')

          function sortArr (a, b) {
            return a.day - b.day;
          }

          //该函数对具有相同日期的计划表进行整合
          function plan_same_day_func (arr) {
            function sortStart (a, b) {
              return a.start - b.start;
            }
            let plan_start_arr = arr.sort(sortStart)
            let start_min = plan_start_arr[0].start
            let end_max = plan_start_arr[0].end
            for (let i = 0; i < plan_start_arr.length; i++) {
              let tmp = plan_start_arr[i]
              if (i != plan_start_arr.length - 1) {
                let tmp2 = plan_start_arr[i + 1]
                if (tmp.end < tmp2.start) {
                  day_select_combine.push(tmp)
                  start_min = plan_start_arr[i].start
                } else {
                  tmp2.end = tmp.end >= tmp2.end ? tmp.end : tmp2.end
                }
              } else {
                if (tmp.start > plan_start_arr[i - 1].end) {
                  day_select_combine.push(tmp)
                } else {
                  tmp.start = start_min
                  day_select_combine.push(tmp)
                }
              }
            }
          }
          let plan_info = []
          let same_num = 0
          let plan_deal_same = []
          let day_select_combine = []
          plan_temp = plan_temp.sort(sortArr)
          for (let i = 0; i < plan_temp.length; i++) {
            let tmp = plan_temp[i]
            if (i != plan_temp.length - 1) {
              let tmp2 = plan_temp[i + 1]
              if (tmp.day == tmp2.day) {
                same_num++;
              } else {
                if (same_num == 0) {
                  day_select_combine.push(tmp)
                } else {
                  let plan_same_tmp = plan_temp.slice(i - same_num, i + 1)
                  plan_same_day_func(plan_same_tmp)
                  same_num = 0
                }
              }
            } else {
              if (same_num != 0) {
                let xx = plan_temp.slice(i - same_num, i + 1)
                plan_same_day_func(xx)
                same_num = 0;
              } else {
                let day_select_final = day_select_combine[day_select_combine.length - 1] || []
                if (day_select_final.day < tmp.day || day_select_final.length == 0) {
                  day_select_combine.push(tmp)
                } else {
                  if (day_select_final.end < tmp.start) {
                    day_select_combine.push(tmp)
                  } else {
                    if (day_select_final.start >= tmp.start && day_select_final.end <= tmp.end) {
                      day_select_final = tmp
                    } else if (day_select_final.start > tmp.end) {
                      day_select_combine.push(tmp)
                    } else if (day_select_final.end <= tmp.end && day_select_final.start <= tmp.start) {
                      day_select_final.end = tmp.end
                    } else if (day_select_final.start >= tmp.start && day_select_final.end >= tmp.end) {
                      day_select_final.start = tmp.start
                    }
                  }
                }
              }
            }
          }
          let sche_form = this.g_js_param.set_plan.sche_form
          // console.log(sche_form, 'frist_sche_form')
          let add_flag = this.g_set_record_alarm == 'alarm' ? 4 : 2
          let arr_flag_index = this.g_set_record_alarm == 'alarm' ? 1 : 2
          // console.log(add_flag, arr_flag_index, 'arr_flag_index')
          // // console.log(plan_temp)
          for (let i = 0; i < sche_form.length; i++) {
            let h_arr_temp = sche_form[i]
            for (let j = 0; j < h_arr_temp.length; j++) {
              (function (j) {
                if (_this.change_string_to_four_bit_arr(h_arr_temp[j])[arr_flag_index] == 1) {
                  h_arr_temp[j] -= add_flag
                }
              })(j)
            }
          }
          //  //// console.log(sche_form)
          for (let i = 0; i < plan_temp.length; i++) {
            let temp = plan_temp[i]
            let day_arr = sche_form[temp.day]

            for (let j = 0; j < day_arr.length; j++) {
              (function (j) {
                if (j >= temp.start && j < temp.end) {
                  if (_this.change_string_to_four_bit_arr(day_arr[j])[arr_flag_index] == 0) {
                    day_arr[j] += add_flag
                  } else {
                    day_arr[j] += 0
                  }
                }
              })(j)
            }
            // // console.log(day_arr)
          }
          // // console.log(sche_form)
          // return
          if (this.g_js_param.set_plan.id == 'motion') {
            sche_form.forEach(function (item, index) {
              for (let i = 0; i < item.length; i++) {
                (function (i) {
                  item[i] += 8
                })(i)
              }
            })
          }
          // console.log(sche_form, 'sche_form')
          let plan_sel = this.sche_trans_to_second_format(sche_form)
          // console.log(plan_sel, 'plan_sel')

          // console.log('dev_name内容', dev_name)
          if (dev_name == "c_record") { //持续录像设置计划表
            // // console.log(plan_sel)
            plan_sel.forEach(function (item) {
              if (item.index == 0) {
                item.action_name = [{ name: "record", times: 0, control_time: 8000, continue_time: 16000 }]
                item.flag = 2
              }
            })
            sche = { plan: plan_sel }
            let info = { name: "oflag", enable: 1, dev: [] }
            let info_iflag = { name: "iflag", enable: 0, dev: [] }
            this.$api.set.dev_action_set({
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              info: info_iflag
            }).then(res => {
              if (res.result === '') {
                this.$api.set.dev_action_set({
                  sn: this.$store.state.jumpPageData.selectDeviceIpc,
                  info: info
                }).then(res_second_action_set => {
                  // console.log(sche, 'sche')
                  if (res_second_action_set.result === '') {
                    this.$api.set.plan_record_set({
                      sn: this.$store.state.jumpPageData.selectDeviceIpc,
                      sche: sche
                    }).then(res_plan_record_set => {
                      this.sche_set_ack(res_plan_record_set)
                    })
                  } else {
                    this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                  }
                })
              } else {
                this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
              }
            })
          } else {
            // console.log('enter this commit data')
            // console.log(plan_sel, this.g_js_param.set_plan.type, 'sche_add')
            plan_sel = this.sche_add_action_name(plan_sel, this.g_js_param.set_plan.type)
            sche = { all: 0, dev_name: dev_name, plan: plan_sel }
            // // console.log(sche, this.$store.state.jumpPageData.selectDeviceIpc, this.g_js_param.set_plan.id,'调用该方法设置报警')
            this.$api.set.alarm_sche_set({
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              exdev_id: this.g_js_param.set_plan.id,
              sche: sche
            }).then(res => {
              this.sche_set_ack(res)
            })
          }
        }
        $("#delete_tips_box").css({
          "border-radius": "0.6rem"
        })
        $("#delete_tips_content").css({
          "margin-top": "1rem",
          "margin-bottom": "1rem"
        })
      }
    },
    delete_record_btn () { //点击删除
      this.set_time_func("del");
      this.time_format.splice(this.select_index, 1)
      this.$set(this.setTimePageObj, "show_page", 'time_page')
    },
    // 联动框架方法
    sche_set_ack (msg) {
      // console.log('enter this sche_set_ack')
      if (msg && msg.result == "") {
        // $("#add_device_page").css('display', 'none');
        this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
        this.publicFunc.closeBufferPage()
        this.g_show = false
        this.$emit("time_page_close")
        // this.create_right_page({ type: 'alarm_new', dom: this.publicFunc.mx("#create_setting_page_right") ? this.publicFunc.mx("#create_setting_page_right") : this.publicFunc.mx("#create_setting_page_new") })
      } else if (msg.result == "permission.denied") {
        this.publicFunc.closeBufferPage()
        this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000, web_tips: 1 })
      } else {
        this.publicFunc.closeBufferPage()
        this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
      }
    },
    new_set_alarm () { // 报警弹窗代码
      // console.log(this.g_js_param, "g_js_param", this.g_total_data)
      let _this = this
      let all_dev_name = [
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
      let all_dev_alarm_content = [
        mcs_continuous_recording_hint, //type=0   //持续录像内容
        mcs_move_alarm_new_detail, //type=1
        mcs_continuous_recording_hint, //type=2
        mcs_continuous_recording_hint, //type=3
        mcs_continuous_recording_hint, //type=4
        mrs_sos_alarm_detail, //type=5
        mrs_send_alarm_notification, //type=6
        mcs_continuous_recording_hint, //type=7
        mcs_move_alarm_detail, //type=8
        mrs_open_switch_check_abnormal_noise_alarm, //type=9
        mcs_move_alarm_detail //type=10  此部分表示报警描述
      ]
      let flag = "" //表示附件的总和  （alarm:4,record:2,snapshot:1）
      let alarm_or_record_allow_tips = mcs_Allow_record_schedule
      let dev_name = this.g_js_param.set_plan.id //附件名称 (motion、io、face_detect、and so on)
      let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
      let control_time = 8000,
        continue_time = 16000; //alarm:control_time:0,continue_time:0,times:1  record: control_time:8000,continue_time:16000,times:0
      let times = 0
      if (this.g_set_record_alarm === "alarm") {
        alarm_or_record_allow_tips = mcs_Allow_alarm_schedule
        control_time = continue_time = 0
        times = 1
      } else if (this.g_set_record_alarm === "record") {
        alarm_or_record_allow_tips = mcs_Allow_record_schedule
        all_dev_alarm_content[1] = mcs_move_record_new_detail
        all_dev_alarm_content[5] = mrs_sos_record_detail
        all_dev_alarm_content[6] = mrs_door_record_detail
        all_dev_alarm_content[9] = mrs_open_switch_check_abnormal_noise_record
        all_dev_alarm_content[8] = all_dev_alarm_content[10] = mcs_move_record_detail //type=8
      }

      function alarm_plan_log () {
        let alarm_main_info = _this.g_js_param.set_plan
        // console.log(alarm_main_info, 'alarm_main_info', _this.g_total_data)
        if (_this.g_total_data == "") {
          // console.log('未g_total添加数据')
          _this.g_total_data = alarm_main_info.plan
        } else {
          alarm_main_info.alarm_status = "on"
        }
        if (alarm_main_info.alarm_status == "on") {
          _this.allow_record_sign = true;
          _this.scene_data_out_sign = true
        } else {
          _this.allow_record_sign = false;
          _this.scene_data_out_sign = false
        }
        // 添加计划表中已有的数据
        // console.log(_this.g_total_data, 'g_total_data')
        for (let i = 0; i < _this.g_total_data.length; i++) {
          let temp = _this.g_total_data[i]
          let alarm_day_time = _this.alarm_timeArr_to_word(_this.g_total_data[i].day)
          _this.$set(_this.week, i, alarm_day_time)
          // 存储week_num
          let week_num_arr = []
          // console.log(temp.day, 'temp.day')
          for (let week_num_index = 0; week_num_index < temp.day.length; week_num_index++) {
            if (temp.day[week_num_index]) {
              week_num_arr.push(week_num_index)
            }
          }
          _this.$set(_this.week_num, i, week_num_arr.join('.'))
          _this.$set(_this.time_format, i, {
            start_time: temp.start.split(':00')[0],
            end_time: temp.end.split(':00')[0],
            week: week_num_arr
          })
          // console.log(_this.week_num, 'week_num_arr')
        }
      }

      if (this.g_js_param.set_plan.sd_flag && this.g_js_param.set_plan.sd_flag === 'none') {
        this.publicFunc.msg_tips({ msg: mcs_no_sd_hint, type: "error", timeout: 3000, web_tips: 1 })
        this.allow_record_sign = false;
      } else {
        alarm_plan_log()
      }
    },
    new_compile_week (index, time_arr) {
      let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
      _this.publicFunc.mx("#add_device_page").innerHTML =
        "<div id='attachmen_box'>" +
        "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>" +
        "<div id='set_time_main_page'>"

        // + "<div class='alarm_time_select_tips'>" + mcs_select_time_week + "</div>"
        +
        "<div class='alarm_week_box' id ='alarm_week'></div>"

        +
        "</div>" +
        "</div>" +
        "</div>"

      if (_this.g_hide == 1) {
        _this.publicFunc.mx("#record_back_box").onclick = function () {
          if (_this.g_select_week.indexOf(1) == -1) {
            _this.publicFunc.msg_tips({ msg: mcs_select_time_week, type: 'error', timeout: 3000 });
          } else {
            new_set_time(index, time_arr);
          }
        }
      }
      for (let i = 0; i < _this.g_select_week.length; i++) {
        _this.publicFunc.mx("#alarm_week").innerHTML +=
          "<div class='set_week' flag = '" + _this.g_select_week[i] + "'>" +
          "<div class='week_every'>" + week_standard[i] + "</div>" +
          "<div class='week_every_imgbox'><div id='select_flag_" + i + "' class='list_info_select'></div></div>" +
          "</div>"

        if (_this.g_select_week[i] == 1) {
          $("#select_flag_" + i).addClass("list_info_clickselect_img")
        } else {
          $("#select_flag_" + i).addClass("list_info_select_img")
        }
      }

      $(".set_week").each(function (index) {
        $(this).click(function () {
          if ($(this).attr("flag") == 1) {
            _this.g_select_week[index] = 0
            $(this).attr("flag", 0)
            $("#select_flag_" + index).removeClass("list_info_clickselect_img")
            $("#select_flag_" + index).addClass("list_info_select_img")
          } else {
            _this.g_select_week[index] = 1
            $(this).attr("flag", 1)
            $("#select_flag_" + index).removeClass("list_info_select_img")
            $("#select_flag_" + index).addClass("list_info_clickselect_img")
          }
        })

      })
    },
    new_set_time (index, arr) { // 时间设置
      // console.log('enter set time')
      let _this = this
      this.g_hide = this.g_js_param.hide_nav;
      let start_time = ""
      let end_time = ""
      let week_str = ""
      if (arr) {
        start_time = arr.start_time
        end_time = arr.end_time
      } else {
        if (index == "add") {
          start_time = "00"
          end_time = "24"
        } else {
          start_time = this.g_total_data[index].start.split(":")[0]
          end_time = this.g_total_data[index].end.split(":")[0]
        }
      }
    },
    // 公共计算方法
    alarm_timeArr_to_word (arr) {
      // console.log(arr, 'alarm_timeArr')
      let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
      let day_str_temp = []
      let day_str = ""
      arr.forEach(function (item, index) {
        if (item == 1) {
          day_str_temp.push(week_standard[index])
        }
      })
      day_str = day_str_temp.join("、")
      // if (day_str_temp.length == 7) { // 每天
      //   day_str = mcs_every_day
      // } else {
      //   day_str = day_str_temp.join("、")
      // }
      return day_str;
    },
    time_deal (arr) {
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
      arr.forEach(function (item, index) {
        let clock_temp = {}
        clock_temp.start_clock = item.start / 3600 % 24 < 10 ? "0" + item.start / 3600 % 24 + ":00" : item.start / 3600 % 24 + ":00"
        clock_temp.end_clock = item.end / 3600 % 24 == 0 ? "24:00" : item.end / 3600 % 24 < 10 ? "0" + item.end / 3600 % 24 + ":00" : item.end / 3600 % 24 + ":00"
        clock_temp.day_num = week_standard[parseInt(item.start / 3600 / 24)]
        //跨天处理 大于一天(分为刚好end_time为整数天或者不为整数天)
        if (parseInt(item.end / 3600 / 24) - parseInt(item.start / 3600 / 24) > 1) {
          if (parseInt(item.end / 3600 / 24) == item.end / 3600 / 24) {
            alarm_all_day_choose = week_standard.slice(parseInt(item.start / 3600 / 24) + 1, parseInt(item.end / 3600 / 24)).join("、")
            alarm_arr.push({ start_clock: clock_temp.start_clock, end_clock: "24:00", day_num: clock_temp.day_num }, { start_clock: "00:00", end_clock: "24:00", day_num: alarm_all_day_choose })
          } else {
            alarm_all_day_choose = week_standard.slice(parseInt(item.start / 3600 / 24) + 1, parseInt(item.end / 3600 / 24)).join("、")
            alarm_arr.push({ start_clock: clock_temp.start_clock, end_clock: "24:00", day_num: clock_temp.day_num }, { start_clock: "00:00", end_clock: "24:00", day_num: alarm_all_day_choose }, { start_clock: "00:00", end_clock: clock_temp.end_clock, day_num: week_standard[parseInt(item.end / 3600 / 24)] })
          }
        }
        //跨天处理 小于一天
        else if (parseInt(item.end / 3600 / 24) - parseInt(item.start / 3600 / 24) == 1 && parseInt(item.end / 3600 / 24) != item.end / 3600 / 24) {
          let middle_end_clock = clock_temp.end_clock
          clock_temp.end_clock = "24:00"
          clock_temp.day_num = week_standard[parseInt(item.start / 3600 / 24)]
          alarm_arr.push(clock_temp, { start_clock: "00:00", end_clock: middle_end_clock, day_num: week_standard[parseInt(item.start / 3600 / 24) + 1] })

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
        alarm_plan_temp.day = day_str[i]
        // if (day_str[i].split("、").length == 7) { // 每天
        //   alarm_plan_temp.day = mcs_every_day
        // } else {
        //   alarm_plan_temp.day = day_str[i]
        // }
        alarm_plan.push(alarm_plan_temp)
      }
      // // console.log(alarm_plan)
      return alarm_plan;

    },
    change_string_to_four_bit_arr (str) { //将字符串转换成四位二进制字符串
      let b_str = str.toString(2)
      let str_length = b_str.length
      let add_zero_string = ''
      for (let i = str_length; i < 4; i++) {
        add_zero_string += '0'
      }
      let f_str = add_zero_string + b_str
      let arr = f_str.split('').map(Number)
      return arr;
    },
    sche_trans_to_second_format (sche) { //将7*24小时计划表转换成秒的形式
      // console.log(sche, 'sche_trans_to')
      let _this = this;
      let plan_final = []
      let plan_info = []
      let start_index = 0
      sche.forEach(function (item, index) {
        start_index = 0
        item.forEach(function (items, indexs) {
          if (indexs < 24) {
            if (item[indexs] != item[indexs + 1]) {
              plan_info.push({ start: (start_index + index * 24) * 3600, end: (indexs + 1 + index * 24) * 3600, flag: items, index: items == 0 ? 1 : 0, mode: '' })
              start_index = indexs + 1
            }
          } else {
            if (item[start_index] == item[indexs] && start_index != 24) {
              plan_info.push({ start: (start_index + index * 24) * 3600, end: (24 + index * 24) * 3600, flag: items, index: items == 0 ? 1 : 0, mode: '' })
            }
          }
        })
      })
      // // console.log(plan_info)
      plan_final = plan_info.filter(function (item, index) {
        return item.start < item.end;
      })
      // // console.log(plan_final)
      let plan_change_flag = plan_final[0].flag
      let plan_sel = []
      let j = 0
      for (let i = 0; i < plan_final.length; i++) {
        if (i == plan_final.length - 1) {
          if (j != 0) {
            plan_final[i].start = plan_final[i - j].start
            plan_sel.push(plan_final[i])
          } else {
            if (plan_sel[plan_sel.length - 1].flag == plan_final[i].flag) {
              plan_sel[plan_sel.length - 1].end = plan_final[i].end
            } else {
              plan_sel.push(plan_final[i])
            }
          }
        } else {
          let plan_next = plan_final[i + 1]
          if (plan_change_flag != plan_next.flag) {
            plan_change_flag = plan_next.flag
            if (j == 0) {
              plan_sel.push(plan_final[i])
            } else {
              plan_final[i].start = plan_final[i - j].start
              plan_sel.push(plan_final[i])
              j = 0
            }

          } else {
            j++;
          }
        }
      }
      // console.log(plan_sel, 'return_plan_sel')
      return plan_sel;
    },
    sche_add_action_name (sche, type) { // 计划表附带上动作
      let _this = this;
      let control_time = 0
      if (type == 1 || type == 8 || type == 9 || type == 10) {
        control_time = 8000
      } else {
        control_time = 0
      }
      let action_name_exp = [
        { name: 'cloud', times: 0, control_time: 8000, continue_time: 16000 },
        { name: 'alarm', times: 1, control_time: control_time, continue_time: 0 },
        { name: 'record', times: 0, control_time: 8000, continue_time: 16000 },
        { name: 'snapshot', times: 1, control_time: control_time, continue_time: 0 }
      ]
      sche.forEach(function (item, index) {
        if (item.flag != 0 && item.index == 0) {
          let flag_arr = _this.change_string_to_four_bit_arr(item.flag)
          let action_name = []
          flag_arr.forEach(function (items, indexs) {
            if (items == 1) {
              action_name.push(action_name_exp[indexs])
            }
          })
          item.action_name = action_name
        }
      })
      // console.log(sche, 'sche_add_action_name')
      return sche;
    },
    allow_record_updata (data) { //更新是否允许录像/报警
      this.allow_record_sign = data;
    }
  },
  watch: {
    repeat_week (val) {
      this.$nextTick(() => {
        let week_dom = document.getElementsByClassName('week_list')
        if (week_dom.length > 0) {
          for(let i = 0; i < week_dom.length; i++)
            week_dom[i].children[0].style.display = 'inline';
          let last_week_dom = week_dom[week_dom.length - 1];
          last_week_dom.children[0].style.display = 'none';
          this.week[this.select_index] = '';
          this.week_num[this.select_index] = '';
          if (val.indexOf('0') > -1) {
            this.week[this.select_index] += mcs_Sunday_and + "、";
            this.week_num[this.select_index] += "0.";
          }
          if (val.indexOf('1') > -1) {
            this.week[this.select_index] += mcs_Monday_and + "、";
            this.week_num[this.select_index] += "1.";
          }
          if (val.indexOf('2') > -1) {
            this.week[this.select_index] += mcs_Tuesday_and + "、";
            this.week_num[this.select_index] += "2.";
          }
          if (val.indexOf('3') > -1) {
            this.week[this.select_index] += mcs_Wednesday_and + "、";
            this.week_num[this.select_index] += "3.";
          }
          if (val.indexOf('4') > -1) {
            this.week[this.select_index] += mcs_Thursday_and + "、";
            this.week_num[this.select_index] += "4.";
          }
          if (val.indexOf('5') > -1) {
            this.week[this.select_index] += mcs_Friday_and + "、";
            this.week_num[this.select_index] += "5.";
          }
          if (val.indexOf('6') > -1) {
            this.week[this.select_index] += mcs_Saturday_and + "、";
            this.week_num[this.select_index] += "6.";
          }
          this.week[this.select_index] = this.week[this.select_index].substring(0, this.week[this.select_index].length - 1)
          this.week_num[this.select_index] = this.week_num[this.select_index].substring(0, this.week_num[this.select_index].length - 1)
        } else {
          this.week[this.select_index] = '';
          this.week_num[this.select_index] = '';
        }
      })
    },
    time_format (val) {
      for (let i = 0; i < val.length; i++) {
        this.first_click[i] = true;
      }
    },
    allow_record_sign (val) {
      if (this.ealf === 0) { //非联动框架
        if (val) {
          this.scene_data_out_sign = true;
          if (this.req_data) {
            if (this.setTimePageObj.accessory_sn) { //判断是否为持续录像
              for (let i = 0; i < this.scene_data_out.dev.length; i++) {
                if (this.scene_data_out.dev[i].id == this.setTimePageObj.accessory_sn) {
                  this.req_data.info.scene[1].dev[i].flag = this.scene_data_out.dev[i].flag | this.switch_on_val; //on video
                  this.req_data.info.scene[2].dev[i].flag = this.scene_data_active.dev[i].flag | this.switch_on_val; //on video
                }
              }
            } else {
              this.req_data.info.scene[2].flag = 0;
              this.req_data.info.scene[1].flag = 1;
            }
          }
        } else {
          this.scene_data_out_sign = false;
          if (this.req_data) {
            if (this.setTimePageObj.accessory_sn) { //判断是否为允许录像
              for (let i = 0; i < this.scene_data_out.dev.length; i++) {
                if (this.scene_data_out.dev[i].id == this.setTimePageObj.accessory_sn) {
                  this.req_data.info.scene[1].dev[i].flag = this.scene_data_out.dev[i].flag & this.switch_off_val; //off video
                  this.req_data.info.scene[2].dev[i].flag = this.scene_data_active.dev[i].flag & this.switch_off_val; //off video
                }
              }
            } else {
              this.req_data.info.scene[2].flag = 0;
              this.req_data.info.scene[1].flag = 0;
            }
          }
        }
      } else {
        if (val) {
          // this.ipc_turnover_true = 0;
          this.scene_data_out_sign = true;
          if (this.req_data) {
            for (let i = 0; i < this.scene_data_out.dev.length; i++) {
              if (this.scene_data_out.dev[i].id == this.setTimePageObj.accessory_sn) {
                this.req_data.info.scene[1].dev[i].flag = this.scene_data_out.dev[i].flag | 0x4; //on video
                this.req_data.info.scene[2].dev[i].flag = this.scene_data_active.dev[i].flag | 0x4; //on video
              }
            }
          }
        } else {
          this.scene_data_out_sign = false;
          if (this.req_data) {
            for (let i = 0; i < this.scene_data_out.dev.length; i++) {
              if (this.scene_data_out.dev[i].id == this.setTimePageObj.accessory_sn) {
                this.req_data.info.scene[1].dev[i].flag = this.scene_data_out.dev[i].flag & 0x3; //off video
                this.req_data.info.scene[2].dev[i].flag = this.scene_data_active.dev[i].flag & 0x3; //off video
              }
            }
          }
        }
      }
    }
  },
  components: {
    SwitchButton
  }
}
</script>

<style lang='scss'>
@import '../../../css/public.scss';

#time_page {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5) none repeat scroll;
  z-index: 999;
}

#time_page_box,
#attachmen_box {
  width: 660px;
  min-height: 500px;
  background: #fff;
  padding-bottom: 10px;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 6%;
  margin-left: -330px;
  cursor: default;
}

#attachmen_box_close {
  width: 20px;
  height: 20px;
  background: url(../../../assets/device/n-close.png) no-repeat;
  float: right;
  margin-top: 10px;
  margin-right: 10px;
  cursor: pointer;
}

#attachmen_box_close:hover {
  background: url(../../../assets/device/c-close.png) no-repeat;
}

.set_main_page_alarm {
  padding-top: 40px;
  margin: 0 auto;
}

.record_allow {
  height: 50px;
  border-bottom: 1px solid #ccc;
  border-top: 1px solid #ccc;
  line-height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
}

.menu_list_box_title2 {
  margin-top: -3px;
  padding: 8px 10px;
  color: #666;
}

.record_background {
  margin-top: 0;
  background: #dedede;
}

.record_padding {
  padding: 0 10px;
}

#set_out_time_box {
  max-height: 200px;
  overflow: auto;
  margin-bottom:5px;
}

#submit_apply {
  text-align: center;
  margin: 40px auto 0;
  width: 120px;
  height: 30px;
  border-radius: 4px;
  background-color: $projectColor;
  color: #fff;
  line-height: 28px;
  cursor: pointer;
}

.set_alarm_time_word {
  font-size: 14px;
  background: #dedede;
  padding: 10px;
  color: #666;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.set_time_add {
  width: 40px;
  height: 40px;
  background: url(../../../assets/device/add.png) no-repeat;
  background-size: 100%;
  margin: 0 auto;
  margin-top: 1rem;
}

.time_list_name_title {
  color: #333;
  font-size: 25px;
  font-weight: 700;
  cursor: default;
}

.time_list_name_tips {
  border-bottom: 1px solid #ccc;
  padding: 0 10px 10px 10px;
  cursor: default;
}

.record_box_top {
  background-color: #efeff4;
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
}

.record_back {
  padding-left: 4px;
  cursor: pointer;
  flex-grow: 1;
}

.record_edit_time {
  letter-spacing: 1px;
  text-align: center;
  flex-grow: 20;
}

#delete_set_record {
  color: $projectColor;
  padding-right: 10px;
  flex-grow: 1;
  text-align: right;
}

.set_starttime_list {
  overflow: hidden;
  border-top: 1px solid #e1e1e1;
  height: 30px;
  line-height: 30px;
  display: flex;
  justify-content: space-between;
}

.set_endtime_list {
  overflow: hidden;
  border-bottom: 1px solid #e1e1e1;
  height: 30px;
  line-height: 30px;
  display: flex;
  justify-content: space-between;
}

.select_week_box {
  overflow: hidden;
  width: 660px;
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}

.set_week {
  margin: 25px 13px;
  display: flex;
  justify-content: space-between;
}
#time_page {
  input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    margin: 0;
    vertical-align: text-bottom;
    margin-right: 0.1rem;
  }
}

.start_time_active {
  color: $projectColor;
}
</style>