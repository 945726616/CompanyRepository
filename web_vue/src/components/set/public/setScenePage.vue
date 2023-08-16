<template>
  <div id='scene_page'>
    <div id='scene_page_box'>
      <div id='attachmen_box_close' @click='scene_page_close'></div>
      <div id='attachmen_box_main'>
        <!-- 移动侦测 -->
        <div id='attachmen_info' v-if='setScenePageObj.detailPageFlag === "motionDetectPage"'>
          <div id='attachmen_info_img' class='attachmen_info_img_move'></div>
          <div id='attachmen_info_text'>
            <div id='attachmen_info_list'>
              <div id='attachmen_info_type'> {{ mcs_motion_detection }} </div>
            </div>
            <div id='attachmen_info_sn'>ID: {{ deviceID }} </div>
          </div>
          <div class='attachmen_set_list'>
            <div id='mobile_tracking_switch_box' v-show='motionTrack == 1'>
              <div class='menu_switch'>
                <div id='menu_name_switch'> {{ mcs_mobile_tracking }} </div>
                <!-- 智能追踪 -->
                <switch-button v-model='mobile_tracking_sign' @data_updata_event='mobile_tracking_updata'>
                </switch-button>
              </div>
              <div class='carmea_detect_tip'>{{ mrs_open_mobile_tracking_carmea_detect_object }}</div>
            </div>

            <div class='attachmen_set_list_title'> {{ mcs_motion_detection_sensitivity }} </div>
            <div id='attachmen_door_day'>
              <span id='attachmen_day_img'></span>
              <span id='attachmen_day_text'> {{ mcs_daytime }} </span>
              <div class="options_float_right" style='width:50px;'>{{ input_threshold }}</div>
              <div class='options_float_right' style='width:450px;'>
                <label for='input_threshold'></label>
                <input type='range' id='input_threshold' v-model='input_threshold' min='0' max='100' ref='threshold'
                  :title='input_threshold' />
              </div>
            </div>
            <div id='attachmen_door_night'>
              <span id='attachmen_night_img'></span>
              <span id='attachmen_night_text'> {{ mcs_night }} </span>
              <div class="options_float_right" style='width:50px;'>{{ input_thresholdLevelNight }}</div>
              <div class='options_float_right' style='width:450px;'>
                <label for='input_thresholdLevelNight'></label>
                <input type='range' id='input_thresholdLevelNight' v-model='input_thresholdLevelNight' min='0' max='100'
                  ref='thresholdLevelNight' :title='input_thresholdLevelNight' />
              </div>
            </div>
          </div>
        </div>
        <!-- 紧急按钮 -->
        <div id='attachmen_info' v-else-if='setScenePageObj.detailPageFlag === "sosPage"'>
          <div id='attachmen_info_img' class='attachmen_info_img_sos'></div>
          <div id='attachmen_info_text'>
            <div id='attachmen_info_list'>
              <div id='attachmen_info_type'> {{ mcs_sos }} </div>
            </div>
            <div id='attachmen_info_sn'>ID: {{ deviceID }} </div>
          </div>
          <div class='attachmen_set_list'>
            <div class='attachmen_set_list_title' style='display:none;'> {{ mcs_record }} </div>
            <div id='attachmen_video' style='display:none'>
              <div id='attachmen_video_img'></div>
              <div id='attachmen_video_text'> {{ mcs_record_time }} </div>
              <div id='attachmen_video_time'><input id='attachmen_video_time_input' type='text' value='00'
                  v-model='video_time_input'></div>
            </div>
          </div>
        </div>
        <!-- 门磁 -->
        <div id='attachmen_info' v-else-if='setScenePageObj.detailPageFlag === "magneticPage"'>
          <div id='attachmen_info_img' class='attachmen_info_img_door'></div>
          <div id='attachmen_info_text'>
            <div id='attachmen_info_list'>
              <div id='attachmen_info_type'> {{ mcs_magnetic }} </div>
            </div>
            <div id='attachmen_info_sn'>ID: {{ deviceID }} </div>
          </div>
          <div class='attachmen_set_list'>
            <div class='attachmen_set_list_title' style='display:none;'> {{ mcs_record }} </div>
            <div id='attachmen_video' style='display:none;'>
              <div id='attachmen_video_img'></div>
              <div id='attachmen_video_text'> {{ mcs_record_time }} </div>
              <div id='attachmen_video_time'><input id='attachmen_video_time_input' type='text' value='00'
                  v-model='video_time_input'></div>
            </div>
          </div>
        </div>
        <!-- 人脸检测 -->
        <div id='attachmen_info' v-else-if='setScenePageObj.detailPageFlag === "faceDetectPage"'>
          <div id='attachmen_info_img' class='scene_list_face'></div>
          <div id='attachmen_info_text'>
            <div id='attachmen_info_list'>
              <div id='attachmen_info_type'> {{ mcs_face_detection }} </div>
            </div>
            <div id='attachmen_info_sn'>ID: {{ deviceID }} </div>
          </div>
          <div class='attachmen_set_list'>
            <div class='menu_switch' id='face_detection_switch_box'
              style='height: 4.4rem; width: 100%;background-color: #fff;margin-top: 10px'>
              <div class='list_name' id='face_detection_switch' style='float: left;height: 4.4rem;line-height: 4.4rem;'>
                {{ mrs_face_detection_switch }} </div>
              <switch-button v-model='face_detection_switch_sign' @data_updata_event='face_detection_switch_updata'>
              </switch-button>
            </div>
            <div class='menu_switch' id='face_detection_frame_box'
              style='height: 4.4rem; width: 100%;background-color: #fff;'>
              <div class='list_name' id='menu_face_switch' style='float: left;height: 4.4rem;line-height: 4.4rem;'>
                {{ mcs_face_detection_frame }} </div>
              <switch-button v-model='face_detection_sign' @data_updata_event='face_detection_updata'></switch-button>
            </div>
          </div>
        </div>
        <!-- 声音侦测 -->
        <div id='attachmen_info' v-else-if='setScenePageObj.detailPageFlag === "soundDetectPage"'>
          <div id='attachmen_info_img' class='scene_list_sound'></div>
          <div id='attachmen_info_text'>
            <div id='attachmen_info_list'>
              <div id='attachmen_info_type'> {{ mcs_sound_detection }} </div>
            </div>
            <div id='attachmen_info_sn'>ID: {{ deviceID }} </div>
          </div>
          <div class='attachmen_set_list'>
            <div class='menu_switch' id='sound_detection_switch_box'
              style='height: 4.4rem; width: 100%;background-color: #fff;margin-top: 30px'>
              <div class='list_name' id='menu_sound_switch' style='float: left;height: 4.4rem;line-height: 4.4rem;'>
                {{ mrs_sound_detection_switch }} </div>
              <switch-button v-model='sound_detection_sign' @data_updata_event='sound_detection_updata'></switch-button>
            </div>
            <div class='attachmen_set_list_title'> {{ mcs_sound_sensitivity }} </div>
            <div id='attachmen_door_day'>
              <span id='attachmen_sound_img'></span>
              <span id='attachmen_day_text'> {{ mcs_sound }} </span>
              <div class='options_float_right' style='width:50px;'>{{ input_sound_threshold }}</div>
              <div class='options_float_right' style='width:450px;'>
                <label for='input_sound_threshold'></label>
                <input type='range' id='input_sound_threshold' v-model='input_sound_threshold' min='0' max='100'
                  ref='sound_threshold' />
              </div>
            </div>
          </div>
        </div>
        <div id='attachmen_btn_box'>
          <div id='attachmen_btn_submit' @click='attachmen_btn_submit' v-if='dev_type != 5 && dev_type != 6'>
            {{ mcs_apply }} </div>
          <div id='attachmen_btn_del' v-if='dev_type != 1 && dev_type != 8 && dev_type != 9' @click='del_sign = true'>
            {{ mcs_delete }} </div>
        </div>
        <div id='attachmen_del_box' v-if='del_sign'>
          <div id='attachmen_del_box_text'> {{ mcs_are_you_sure_delete }} </div>
          <div id='attachmen_del_box_ok' @click='del_box_ok_btn'> {{ mcs_ok }} </div>
          <div id='attachmen_del_box_cancel' @click='del_sign = false'> {{ mcs_cancel }} </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SwitchButton from '@/module/switchButton'
export default {
  props: {
    setScenePageObj: { // 添加设备弹窗展示对象
      type: Object,
      default: function () { }
    },
  },
  data () {
    return {
      //多国语言
      mcs_motion_detection: mcs_motion_detection, //移动侦测
      mcs_apply: mcs_apply, //应用
      mcs_motion_detection_sensitivity: mcs_motion_detection_sensitivity, //移动侦测灵敏度
      mcs_daytime: mcs_daytime, //白天
      mcs_night: mcs_night, //夜间
      mcs_mobile_tracking: mcs_mobile_tracking, //移动追踪
      mcs_sos: mcs_sos, //紧急按钮
      mcs_magnetic: mcs_magnetic, //门磁
      mcs_face_detection: mcs_face_detection, //人脸检测
      mcs_sound_detection: mcs_sound_detection, //声音侦测
      mcs_record: mcs_record, //录像
      mcs_record_time: mcs_record_time, //录像时长(秒)
      mcs_face_detection_frame: mcs_face_detection_frame, //人脸检测画框
      mcs_sound_sensitivity: mcs_sound_sensitivity, //声音灵敏度
      mcs_sound: mcs_sound, //声音
      mcs_delete: mcs_delete, //删除
      mcs_are_you_sure_delete: mcs_are_you_sure_delete, //是否删除
      mcs_ok: mcs_ok, //确定
      mcs_cancel: mcs_cancel, //取消
      mrs_sound_detection_switch: mrs_sound_detection_switch, //声音侦测开关
      mrs_open_mobile_tracking_carmea_detect_object: mrs_open_mobile_tracking_carmea_detect_object, //打开移动追踪，摄像机会在检测到移动物体时自动跟踪
      mrs_face_detection_switch: mrs_face_detection_switch, //人脸检测开关

      deviceID: '', //设备号
      input_threshold: '', //移动侦测白天灵敏度
      input_thresholdLevelNight: '', //移动侦测夜间灵敏度
      motion_track_switch: '', //是否移动追踪
      conf: {}, //外设数据
      face_detect_switch: '', //是否人脸检测
      dev_type: '', //外设类型
      input_sound_threshold: '', //声音灵敏度
      video_time_input: '',
      del_sign: false, //是否显示删除
      mobile_tracking_sign: '', //控制是否移动追踪
      face_detection_sign: '', //控制是否人脸检测画框
      sound_detection_sign: '', //是否声音侦测开关
      profile_data: [], //新联动配置数据,
      face_detection_switch_sign: '', //是否人脸侦测开关
      motionTrack: '', //移动轨迹
    }
  },
  methods: {
    scene_page_close () { //关闭弹框
      this.$emit("scene_page_close")
    },
    attachmen_btn_submit () { //应用
      if (this.dev_type == 1 || this.dev_type == 8 || this.dev_type == 9) {
        let conf = this.conf
        conf.sn = this.$store.state.jumpPageData.selectDeviceIpc
        conf.io_input = "Open"
        conf.io_output = "Open"
        if (this.dev_type == 1) {
          conf.sensitivity = this.input_threshold
          conf.night_sensitivity = this.input_thresholdLevelNight
          conf.motion_track_switch = this.motion_track_switch
        } else if (this.dev_type == 8) {
          conf.face_detect_switch = this.face_detect_switch
        } else if (this.dev_type == 9) {
          conf.audio_level = this.input_sound_threshold
        }
        this.$api.set.profile_set({
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          info: this.profile_data
        }).then(res => {
          if (res.result == '') {
            this.$api.set.alarm_device_set(conf).then(res => {
              this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
            })
          }
        })
      } else {
        this.$api.set.exdev_get({
          sn: this.$store.state.jumpPageData.selectDeviceIpc,
          id: this.setScenePageObj.devID,
          flag: 3,
          start: 0,
          counts: 1
        }).then(res => {
          if (res && res.result == "") {
            let dev_in
            let dev_out
            for (let i = 0; i < this.setScenePageObj.senceData.length; i++) {
              if (this.setScenePageObj.senceData[i].name == "out") {
                dev_out = this.setScenePageObj.senceData[i].dev[index].flag
              } else if (this.setScenePageObj.senceData[i].name == "in") {
                dev_in = this.setScenePageObj.senceData[i].dev[index].flag
              }
            }
            let dev = res.data.devs[0]
            dev.flag = [dev_out, dev_in]
            let rtime = this.video_time_input > 8 ? this.video_time_input : 8
            dev.rtime = parseInt(rtime) * 1000
            this.$api.set.exdev_set({
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              dev: dev
            }).then(res => {
              if (res.result === "") {
                this.scene_page_close();
                this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
              } else if (res.result === "permission.denied") {
                this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 })
              } else {
                this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 })
              }
            })
          }
        })
      }
    },
    del_box_ok_btn () { //确认删除
      this.$api.set.exdev_del({
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        id: this.setScenePageObj.devID
      }).then(res => {
        if (res && res.result === "") {
          this.scene_page_close()
        }
      })
    },
    mobile_tracking_updata (data) { //更新是否移动追踪
      this.mobile_tracking_sign = data
    },
    face_detection_updata (data) { //更新是否人脸检测画框
      this.face_detection_sign = data
    },
    face_detection_switch_updata (data) { //更新是否人脸侦测开关
      this.face_detection_switch_sign = data
      for (let i = 0; i < this.profile_data.dev.length; i++) {
        if (this.profile_data.dev[i].id === "face_detect")
          this.profile_data.dev[i].enable = Number(this.face_detection_switch_sign)
      }
    },
    sound_detection_updata (data) { //更新是否声音侦测开关
      this.sound_detection_sign = data
      for (let i = 0; i < this.profile_data.dev.length; i++) {
        if (this.profile_data.dev[i].id === "sound_detect")
          this.profile_data.dev[i].enable = Number(this.sound_detection_sign)
      }
    },
  },
  mounted () {
    this.deviceID = this.$store.state.jumpPageData.selectDeviceIpc
    this.dev_type = this.setScenePageObj.devType
    this.motionTrack = this.$store.state.set.motionTrack

    if (this.dev_type == 1 || this.dev_type == 2 || this.dev_type == 8 || this.dev_type == 9) {
      this.$api.set.alarm_device_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc, flag: 1 }).then(res => {
        this.conf = res
        if (res && res.result == "") {
          this.input_thresholdLevelNight = res.night_sensitivity
          this.input_threshold = res.sensitivity
          this.input_sound_threshold = res.audio_level
          if (res.motion_track_switch == 1) {
            this.mobile_tracking_sign = true
          } else {
            this.mobile_tracking_sign = false
          }
          if (res.face_detect_switch == 1) {
            this.face_detection_sign = true
          } else {
            this.face_detection_sign = false
          }
        }
      })
      this.$api.set.profile_get({ // 获取附件配置表
        sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        if (res && res.result == "") {
          this.profile_data = res.data.info;
          let data = this.profile_data.dev;
          for (let i = 0; i < data.length; i++) {
            if (data[i].id === "sound_detect")
              this.sound_detection_sign = Boolean(data[i].enable)
            else if (data[i].id === "face_detect")
              this.face_detection_switch_sign = Boolean(data[i].enable)
          }
        }
      })
    } else {
      this.$api.set.exdev_get({
        flag: 3,
        start: 0,
        counts: 100,
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        id: this.setScenePageObj.devID
      }).then(res => {
        if (res && res.result == "") {
          this.video_time_input = res.data.devs[0].rtime / 1000;
        } else if (res.result == "permission.denied") {
          this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 })
        } else {
          this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 })
        }
      })
    }
  },
  watch: {
    input_threshold (val) {
      if (this.$refs.threshold && (val || val == 0)) {
        this.$refs.threshold.style.backgroundSize = val + '% 100%'
      }
    },
    input_thresholdLevelNight (val) {
      if (this.$refs.thresholdLevelNight && (val || val == 0)) {
        this.$refs.thresholdLevelNight.style.backgroundSize = val + '% 100%'
      }
    },
    input_sound_threshold (val) {
      if (this.$refs.sound_threshold && (val || val == 0)) {
        this.$refs.sound_threshold.style.backgroundSize = val + '% 100%'
      }
    },
    mobile_tracking_sign (val) {
      if (val) {
        this.motion_track_switch = 1
      } else {
        this.motion_track_switch = 0
      }
    },
    face_detection_sign (val) {
      if (val) {
        this.face_detect_switch = 1
      } else {
        this.face_detect_switch = 0
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

#scene_page {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5) none repeat scroll;
  z-index: 1099;
}

#scene_page_box {
  width: 660px;
  min-height: 500px;
  background: #fff;
  padding-bottom: 10px;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 6%;
  margin-left: -330px;

  .options_float_right input {
    font-size: 15px;
    color: $projectColor;
    height: 2px;
    margin: 12px 0;
  }
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

#attachmen_box_main {
  margin: 0 auto;
  width: 600px;
  padding: 0 30px 10px 30px;
}

#attachmen_info {
  width: 100%;
  float: left;
  margin-top: 30px;
}

#attachmen_info_img {
  width: 120px;
  height: 120px;
  float: left;
  border: 1px solid #d6d7dc;
  background-size: 100% 100%;
}

.attachmen_info_img_move {
  background: url(../../../assets/device/scene_move.png) no-repeat 0px 0;
}

.attachmen_info_img_sos {
  background: url(../../../assets/device/sos_attachmen.png) no-repeat 0px 0;
}

.attachmen_info_img_door {
  background: url(../../../assets/device/door_attachmen.png) no-repeat 0px 0;
}

.scene_list_face {
  background: url('../../../assets/device/face_attachmen.png') no-repeat 0px 0;
  background-size: 100% 100%;
}

.scene_list_sound {
  background: url('../../../assets/device/sound_attachmen.png') no-repeat 0px 0;
  background-size: 100% 100%;
}

#attachmen_info_text {
  width: 455px;
  float: left;
  margin-top: 30px;
  margin-left: 20px;
}

#attachmen_info_list {
  width: 100%;
  float: left;
}

#attachmen_info_type {
  float: left;
  color: #333;
  font-size: 16px;
}

#attachmen_info_sn {
  margin-top: 5px;
  float: left;
  color: #646464;
  font-size: 14px;
}

.attachmen_set_list {
  width: 100%;
  float: left;
  margin-top: 20px;
  border-bottom: 1px solid $projectColor;
}

.attachmen_set_list_title {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}

#attachmen_door_day {
  width: 100%;
  float: left;
  font-size: 14px;
  color: #333;
  line-height: 24px;
  margin-bottom: 15px;
}

#attachmen_day_img {
  float: left;
  width: 24px;
  height: 24px;
  background: url(../../../assets/device/day.png) no-repeat;
  margin-right: 10px;
}

#attachmen_door_night {
  width: 100%;
  float: left;
  font-size: 14px;
  color: #333;
  line-height: 24px;
  margin-bottom: 15px;
}

#attachmen_night_img {
  float: left;
  width: 24px;
  height: 24px;
  background: url(../../../assets/device/night.png) no-repeat;
  margin-right: 10px;
}

#attachmen_btn_box {
  width: 100%;
  float: left;
  margin-top: 30px;
}

#attachmen_btn_submit {
  background-color: $projectColor;
  border: 1px solid $projectColor;
  float: right;
  color: #fff;
  border-radius: 5px;
  width: 120px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  margin-left: 30px;
  cursor: pointer;
}

#attachmen_sound_img {
  float: left;
  width: 24px;
  height: 24px;
  background: url(../../../assets/device/sound.png) no-repeat;
  background-size: 100% 100%;
  margin-right: 10px;
}

#attachmen_btn_del {
  background: #fff;
  float: right;
  color: #fff;
  border-radius: 5px;
  width: 200px;
  height: 30px;
  background: #f1474f;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
}

#scene_page {
  input[type='range'] {
    width: 500px;
    height: 2px;
  }
}

#attachmen_del_box {
  width: 236px;
  text-align: center;
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  top: 40%;
  left: 40%;
  border-radius: 5px;
  color: #646464;
}

#attachmen_del_box_text {
  width: 100%;
  float: left;
  margin-top: 20px;
  margin-bottom: 5px;
}

#attachmen_del_box_ok {
  float: left;
  /*padding: 5px;*/
  border-top: 1px solid #ccc;
  border-right: 1px solid #ccc;
  /*border-bottom:none;*/
  /*border-radius: 3px;*/
  /*margin-left: 30px;*/
  margin-top: 30px;
  width: 116px;
  cursor: pointer;
  height: 45px;
  line-height: 45px;
}

#attachmen_del_box_cancel {
  float: right;
  /*padding: 5px;*/
  width: 118px;
  border-top: 1px solid #ccc;
  /*border-bottom:none;*/
  /*border-radius: 3px;*/
  /*margin-right: 30px;*/
  margin-top: 30px;
  height: 45px;
  line-height: 45px;
  cursor: pointer;
}

.menu_switch {
  color: rgb(51, 51, 51);
  height: 4.4rem;
  line-height: 4.4rem;
  height: 4.4rem;
  width: 100%;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.carmea_detect_tip {
  color: red;
  margin-bottom: 20px;
}
</style>