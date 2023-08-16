<template>
  <div id='alarm' class='list_right_box'>
    <div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'> {{mcs_allow_type}} </div>
    <div class='menu_list2_box' id='record_event'>
      <div class='menu_list2_box' id='record_event' v-if="scene_data_out.dev && scene_data_out.dev.length > 0">
        <!-- 确保其中有值再进行渲染防止数组更新vue无法检测 -->
        <div v-for='(item, index) in scene_data_out.dev' :key='index'>
          <div v-if='item.record_event_name && item.record_event_type' :num='index' :class="[ealf === 0 ? 'menu_list record_event_btn' : item.classNameString]" :sn='item.id' :type='item.type' @click='record_event_btn'>
            <div class='list_name'>
              <div class='list_name_title'> {{item.record_event_name}} </div>
              <div class='list_name_tips'> {{item.record_event_type}} </div>
            </div>
            <div class='list_info'>
              <div class='right_arrow'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <time-page v-if='setTimePage' :setTimePageObj='setTimePageObj' @time_page_close='time_page_close'></time-page>
  </div>
</template>

<script>
import timePage from './setTimePage'
export default {
  data () {
    return {
      //多国语言
      mcs_allow_type: mcs_allow_type, //报警类型
      
      face_detect: '',
      sound_detect: '',
      human_detect: '',
      list_name_show: '',
      scene_data_out: {},
      scene_data_active: '',
      setTimePage: false, //控制弹窗是否显示
      setTimePageObj: {}, //控制弹窗展示对象
      ealf: this.$store.state.set.deviceEalf, // 设备联动框架标识
      alarm_final_all_dev: [], //设备所具有的附件外加计划表和开关状态等
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
        mrs_human_detection //type=10
      ], //此部分表示联动框架对应type的附件名
    }
  },
  methods: {
    old_process () { // 非联动框架设备执行的步骤
      this.publicFunc.showBufferPage()
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
              if (!(this.scene_data_out.dev[j].flag & 0x4)) {
                record_event_type = mcs_turn_off;
              } else if (this.scene_data_out.dev[j].flag & 0x4) {
                record_event_type = mcs_turn_on;
              }
              this.scene_data_out.dev[j].record_event_name = record_event_name
              this.scene_data_out.dev[j].record_event_type = record_event_type
            }
          }
        })
      })
    },
    record_event_btn (e) {
      console.log(e.currentTarget, 'click item', this.alarm_final_all_dev[e.currentTarget.getAttribute('num')])
      this.setTimePage = true
      this.$set(this.setTimePageObj, "show_page", 'time_page')
      this.$set(this.setTimePageObj, "accessory_type", e.currentTarget.getAttribute('type'))
      this.$set(this.setTimePageObj, "accessory_sn", e.currentTarget.getAttribute('sn'))
      this.$set(this.setTimePageObj, "accessory_mode", 'alarm') //报警模式
      if (this.ealf === 1) { // 联动框架额外传递的参数
        this.$set(this.setTimePageObj, "set_plan", this.alarm_final_all_dev[e.currentTarget.getAttribute('num')])
        this.$set(this.setTimePageObj, "set_record_alarm", 'alarm')
        this.$set(this.setTimePageObj, "hide_nav", 1)
        this.alarm_final_all_dev = [] // 清空设备所具有的附件外加计划表和开关状态等(防止多层push导致判断失效)
      }
    },
    time_page_close () { //关闭弹框
      this.setTimePage = false
      if (this.ealf === 0) {
        this.old_process()
      } else {
        this.new_process()
      }
    },
    // 联动框架设备方法
    new_process () { // 联动框架设备执行的步骤
      console.log('enter this')
      this.publicFunc.showBufferPage() // 开启遮罩层
      // 获取设备信息
      this.$api.set.dev_info({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(async res => {
        // 获取设备相关侦测信息数据
        this.face_detect = res.face_detect
        this.sound_detect = res.sound_detect
        this.human_detect = res.human_detect
        await this.$api.set.profile_get({ // 获取附件配置表
          sn: this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res_profile_get => {
          this.alarm_get_ack(res_profile_get)
        })
      })
    },
    async alarm_get_ack (msg, ref) { // 接口调用回调处理
      if (msg && msg.result == "") {
        this.alarm_all_dev = msg.data.info.dev
        for (let index = 0; index < this.alarm_all_dev.length; index++) {
          let item = this.alarm_all_dev[index]
          item.plan = []
          if (item.id == "face_detect") {
            if (this.face_detect != 1) {
              this.alarm_all_dev.splice(index, 1)
              index = index - 1
              continue
            }
          }
          if (item.id == "sound_detect") {
            if (this.sound_detect != 1) {
              this.alarm_all_dev.splice(index, 1)
              index = index - 1
              continue
            }
          }
          if (item.id == "human_detect") {
            if (this.human_detect != 1) {
              this.alarm_all_dev.splice(index, 1)
              index = index - 1
            }
          }
        }
        for (let i = 0; i < this.alarm_all_dev.length; i++) {
          let item = this.alarm_all_dev[i]
          await this.$api.set.alarm_sche_get({
            sn: this.$store.state.jumpPageData.selectDeviceIpc,
            exdev_id: item.id
          }).then(res => {
            let plan_eftiv_val = [] //计划表有效值（index==1）
            let plan_tmp = []
            if (res && res.result == '') {
              item.origin_plan = res.data.sche.plan || [] //原有的计划表
              if (!res.data.sche.plan) {
                item.plan = []
                item.alarm_status = "off"
                // item.action_name_list = []
                console.log(this.alarm_final_all_dev, 'alarm_final_all_dev1')
                this.alarm_final_all_dev.push(item)
                console.log(this.alarm_final_all_dev, 'alarm_final_all_dev2')
                item.sche_form = this.sche_format(item.plan)
              } else {
                plan_tmp = res.data.sche.plan
                item.sche_form = this.sche_format(plan_tmp)
                let plan_filter = plan_tmp.filter(function (item, i) {
                  if (item.action_name) {
                    if (item.action_name.filter(function (s_item, s_index) {
                      return s_item.name == 'alarm'
                    }).length > 0) {
                      return item
                    }
                  }
                })
                if (plan_filter.length > 0) {
                  item.alarm_status = "on"
                  console.log(plan_filter, 'plan_filter')
                  item.plan = this.time_deal(plan_filter);
                  console.log(item.plan, item.plan)
                } else {
                  item.alarm_status = "off"
                  item.plan = []
                }
                console.log(this.alarm_final_all_dev, 'alarm_final_all_dev3')
                this.alarm_final_all_dev.push(item)
                console.log(this.alarm_final_all_dev, 'alarm_final_all_dev4')
              }
              console.log(this.alarm_all_dev, 'this.alarm_all_dev')
              if (this.alarm_final_all_dev.length === this.alarm_all_dev.length) {
                this.alarm_final_all_dev = this.alarm_final_all_dev.sort(this.dev_type_sort)
                this.alarm_creat_div() //开始动态打印div
              }
            } else {
              this.publicFunc.msg_tips({ msg: res.result, type: 'error', timeout: 3000 })
              this.publicFunc.closeBufferPage()
              return
            }
          })
        }
      } else {
        this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 })
        this.publicFunc.closeBufferPage()
        return
      }
    },
    alarm_creat_div () { // 创建报警右侧主界面dom
      let showArr = []
      for (let i = 0; i < this.alarm_final_all_dev.length; i++) {
        let dev_item = this.alarm_final_all_dev[i]
        let classNameString = (i == this.alarm_final_all_dev.length - 1 ? 'menu_list2_last record_event_btn_new flag_click_event' :
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
      for (let i = 0; i < this.alarm_final_all_dev.length; i++) {
        let tmp = this.alarm_final_all_dev[i]
        for (let j = 0; j < tmp.plan.length; j++) {
          let final_plan_temp = tmp.plan[j]
          let day_arr = final_plan_temp.day.split("、")
          final_plan_temp.day = this.change_day_to_arr(day_arr)
        }
      }
      this.$set(this.scene_data_out, 'dev', showArr) // 将渲染的内容赋值到scene_data_out.dev中
      console.log(this.scene_data_out.dev, 'this.scene_data_out.dev')
      // 关闭遮罩层
      this.publicFunc.closeBufferPage()
      console.log('执行关闭弹窗')
    },
    // 工具函数
    change_day_to_arr (arr) {
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
    time_deal (arr) {
      // console.log(arr)
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

      // console.log(alarm_arr)
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
      // console.log(alarm_arr)
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
      // console.log(alarm_plan)
      return alarm_plan;

    },
    sche_format (sche) { // 生成7*24小时计划表
      console.log(sche, 'sche_format')
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
      //  //console.log(day_h)
      if (sche.length > 0) {
        sche.forEach(function (item, index) {
          start_h = parseInt(item.start / 3600 % 24)
          end_h = parseInt(item.end / 3600 % 24) == 0 ? 24 : parseInt(item.end / 3600 % 24)
          start_day = parseInt(item.start / 86400)
          end_day = parseInt(item.end / 86401)
          let add_flag = item.flag >= 8 ? item.flag - 8 : item.flag
          if (start_day == end_day) {
            if (item.action_name) {
              let tt = day_h[start_day].split('').map(Number)
              for (let i = 0; i < 25; i++) {
                (function (i) {
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
                (function (i) {
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
                (function (i) {
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
      day_h.forEach(function (item, index) {
        final_form.push(item.split('').map(Number))
      })
      console.log(final_form, 'final_form')
      return final_form;
    },
  },
  mounted () {
    console.log(this.ealf, 'ealf')
    if (this.ealf === 0) { // 判断设备是联动框架/非联动框架设备
      this.old_process()
    } else {
      this.new_process()
    }

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

.menu_list {
  overflow: hidden;
  border-top: 1px solid #ccc;
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

.record_sd_calculate {
  height: 35px;
  font-size: 14px;
  line-height: 35px;
  color: $projectColor;
}
</style>