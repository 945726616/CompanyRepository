<template>
  <div id='other_info' class='list_right_box'>
    <div class='list_right_item'>
      <div class='vimtag_options_float_left sd_mode_text'> {{mcs_audio}} :</div>
    </div>
    <div class='list_right_item_ex'>
      <div class='vimtag_options_float_left sd_mode_text'>- {{mcs_speaker}} </div>
      <div class='options_float_right' style='width:200px;'>
        <label for='input_speaker'></label>
        <input name='slider' type='range' id='input_speaker' min='0' max='100' v-model='input_speaker' ref='speaker' />
      </div>
    </div>
    <div class='list_right_item_ex'>
      <div class='vimtag_options_float_left sd_mode_text'>- {{mcs_mic}} </div>
      <div class='options_float_right' style='width:200px;'>
        <label for='input_microphone'></label>
        <input name='slider' type='range' id='input_microphone' min='0' max='100' v-model='input_microphone' ref='microphone' />
      </div>
    </div>
    <div class='list_right_item'>
      <span class='attribute_key_text'> {{mcs_equipment_flip}} </span>
      <switch-button v-model='equipment_flip_sign' @data_updata_event='equipment_flip_updata'></switch-button>
    </div>
    <div id='power_fr_div'>
      <!-- 电源频率 -->
      <div class='options_float_left'> {{mcs_power_frequency}} </div>
      <div class='options_float_right select_block'>
        <dropdown-menu :menuData="power_array" :showData='power' @data_updata_event='power_updata'></dropdown-menu>
      </div>
    </div>
    <div id='screen_fr_div' v-if="screen_fr_sign">
      <div class='options_float_left'> {{mcs_screen_size}} </div>
      <div class='options_float_right select_block'>
        <dropdown-menu :menuData="screen_array" :showData='screen' @data_updata_event='screen_updata'></dropdown-menu>
      </div>
    </div>
    <div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' @click='button_setup_btn'> {{mcs_apply}} </button>
    </div>
  </div>
</template>

<script>
import DropdownMenu from '@/module/dropdownMenu'
import SwitchButton from '@/module/switchButton'
export default {
  data () {
    return {
      //多国语言
      mcs_audio: mcs_audio, //音频
      mcs_speaker: mcs_speaker, //扬声器
      mcs_mic: mcs_mic, //麦克风
      mcs_equipment_flip: mcs_equipment_flip, //画面翻转
      mcs_power_frequency: mcs_power_frequency, //电源频率
      mcs_screen_size: mcs_screen_size, //画面设置
      mcs_apply: mcs_apply, //应用

      ipc_turnover_true: 0,
      input_speaker: '', //扬声器
      input_microphone: '', //麦克风
      cam_info: '', //其他信息
      ratio: 0,
      power_array: ['50hz', '60hz'], //频率数组
      power: '', //频率
      screen_array: ['4:3', '16:9'], //屏幕比数组
      screen: '', //屏幕比
      screen_fr_sign: '', //控制是否显示画面设置
      equipment_flip_sign: false, //控制是否画面翻转
    }
  },
  mounted () {
    this.$api.set.audio_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
      this.input_speaker = res.speaker_level;
      this.input_microphone = res.mic_level;
    })
    this.$api.play.adjust_get({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
      this.cam_info = res;
      this.cam_info.sn = this.$store.state.jumpPageData.selectDeviceIpc;
      res.flicker_freq ? this.power = '50hz' : this.power = '60hz'; // 0/1 0:60hz, 1:50hz 

      let param = Array();
      param = this.$api.devlist.ldev_get(this.$store.state.jumpPageData.selectDeviceIpc).p;
      for (let i = 0; i < param.length; i++) {
        if (param[i].n == "s.ratio" && param[i].v.length) {
          this.ratio = 1;
          this.screen_fr_sign = true;
          (res.resolute == "16:9") ? this.screen = '16:9' : this.screen = '4:3';
          break;
        }
      }
      if (res.flip) {
        this.ipc_turnover_true = 1;
        this.equipment_flip_sign = true;
      } else {
        this.equipment_flip_sign = false;
      }
    })
  },
  methods: {
    cam_set () {
      this.$api.set.cam_set({
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        flip: Number(this.equipment_flip_sign),
        flicker_freq: this.power === '60hz' ? 0 : 1
      }).then(res => {
        if (res.result !== "") {
          if (res.result === "permission.denied") {
            this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
          } else {
            this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
          }
        } else {
          this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
        }
      })
    },
    button_setup_btn () { //应用
      this.$api.set.audio_set({
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        mic_level: this.input_microphone,
        speaker_level: this.input_speaker
      }).then(res => {
        this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
      })
    },
    screen_change () {
      this.cam_info.flip = Number(this.equipment_flip_sign);
      this.cam_info.flicker_freq = this.power === '60hz' ? 0 : 1;
      this.cam_info.resolute = this.screen;
      this.$api.play.adjust_set({
        sn: this.$store.state.jumpPageData.selectDeviceIpc,
        flip: this.cam_info.flip,
        flicker_freq: this.cam_info.flicker_freq,
        resolute: this.cam_info.resolute
      }).then(res => {
        if (res.result === "permission.denied") {
          this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
        } else if (res.result !== "") {
          this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
        } else {
          this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
          this.publicFunc.delete_tips({
            content: mcs_restart_prompt,
            func: async () => {
              await this.$api.set.reboot_device({ sn: this.$store.state.jumpPageData.selectDeviceIpc })
              setTimeout(() => {
                this.$router.push({ name: 'devlist' });
              }, 1000);
            }
          });
        }
      })
    },
    power_updata (data) { //更新频率
      this.power = data;
      this.cam_set();
    },
    screen_updata (data) { //更新屏幕比
      this.screen = data;
      this.screen_change();
    },
    equipment_flip_updata (data) { //更新是否画面翻转
      this.equipment_flip_sign = data;
    }
  },
  watch: {
    input_speaker (val) {
      if (val || val == 0) {
        this.$refs.speaker.style.backgroundSize = val + '% 100%';
      }
    },
    input_microphone (val) {
      if (val || val == 0) {
        this.$refs.microphone.style.backgroundSize = val + '% 100%';
      }
    },
    equipment_flip_sign (val) {
      if (this.ipc_turnover_true) {
        this.ipc_turnover_true = 0;
      } else {
        this.cam_set();
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
@import '../../../css/public.scss';

.list_right_box {
  width: 520px;
  margin: 0 auto;
}

.list_right_item_ex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#other_info {
  input[type='range'] {
    width: 200px;
    height: 2px;
  }
}

#power_fr_div {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#screen_fr_div {
  height: 50px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#other_info {
  .options_float_right input {
    height: 2px !important;
  }
}
</style>