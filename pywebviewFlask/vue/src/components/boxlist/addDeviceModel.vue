<template>
  <div id='add_device_box' v-if='addDeviceModel'>
    <div id='add_onvif_devices_box'>
      <div id='add_devices_box_menu'>
        <div id='add_onvif_devices_box_back' v-if='addDeviceModelObj.addDeviceBodyFlag == "addDetailedDevicePage"' @click='$set(addDeviceModelObj, "addDeviceBodyFlag", "searchDevicePage")'> {{mcs_back}} </div>
        <div id='add_devices_box_close' @click='closeModel'></div>
        <!-- 添加设备 -->
        <div id='add_devices_box_title'> {{addDeviceModelObj.menuTitle}} </div>
      </div>
      <div id='add_devices_box_body' v-if='addDeviceModelObj.addDeviceBodyFlag == "addDevicePage"'>
        <div class='add_device_input_id_box' style='margin-top:98px'>
          <div class='vimtag_add_device_input_id_box_ico'></div>
          <div class='add_device_input_id_box_del' @click='del_input' value='user'></div>
          <!-- 输入用户名 -->
          <input id='add_device_input_id_box_input' class='add_device_input_id_box_input' :placeholder='mcs_please_input_username' v-model="user_val">
        </div>
        <div class='add_device_input_id_box'>
          <div class='vimtag_add_device_input_pass_box_ico'></div>
          <div class='add_device_input_id_box_del' @click='del_input' value='pwd'></div>
          <!-- 输入密码 -->
          <input id='add_device_input_pass' class='add_device_input_id_box_input' :placeholder='mcs_input_password' v-model="pwd_val">
        </div>
        <div class='add_device_input_id_box'>
          <div class='vimtag_add_device_input_ip_box_ico'></div>
          <div class='add_device_input_id_box_del' @click='del_input' value='ip'></div>
          <!-- 输入IP -->
          <input id='add_device_input_ip' class='add_device_input_id_box_input' :placeholder='mrs_input_ip' @blur='checkIp' v-model="ip_val">
        </div>
        <div class='add_device_input_id_box'>
          <div class='vimtag_add_device_input_port_box_ico'></div>
          <div class='add_device_input_id_box_del' @click='del_input' value='port'></div>
          <!-- 输入端口号 -->
          <input id='add_device_input_port' class='add_device_input_id_box_input' :placeholder='mrs_input_port' @blur='checkPort' v-model="port_val">
        </div>
        <div id='add_device_submit' @click="add_device_submit"> {{mcs_add}} </div>
      </div>
      <div id='add_devices_box_body' v-if='addDeviceModelObj.addDeviceBodyFlag == "searchDevicePage"'>
        <div id='box_onvif_img_tip'>
          <div id='box_onvif_img'></div>
          <div> {{mcs_connect_same_area}} </div>
        </div>
        <div :id='addDeviceModelObj.addDeviceProjectName === "ebitcam"?"ebit_onvif_searching":"onvif_searching"' v-if='searching_sign'> {{mrs_searching}} </div>
        <div id='box_onvif_unadd_box' v-if='unadd_device_list && unadd_device_list.length > 0'>
          <div class='box_onvif_unadd_img_box' v-for='(item,index) in unadd_device_list' :key='index'>
            <img class='box_onvif_unadd_img' :src="require('@/assets/device/onvif_camera.png')" />
            <!-- 昵称 -->
            <div class='box_onvif_unadd_device_nick'> {{mcs_old_nick}} </div>
            <!-- IP地址 -->
            <div class='box_onvif_unadd_ip'> {{mcs_ip_address}} : {{item.ip}} </div>
            <div class='box_onvif_unadd_port'> {{mcs_port}} : {{item.port}} </div>
            <div class='box_onvif_add_btn' :uuid='item.uuid' :ip='item.ip' :port='item.port' :type='item.type' @click='box_onvif_add_btn'> {{mcs_add}} </div>
          </div>
        </div>
        <div id='onvif_no_searching' v-if='add_device_sign'> {{mrs_net_nosearch_devcice}} </div>
        <div id='onvif_re_searching' @click='onvif_re_searching_btn' v-if="add_device_sign "> {{mrs_research}} </div>
      </div>
      <div id='add_devices_box_body' v-if='addDeviceModelObj.addDeviceBodyFlag == "addDetailedDevicePage"'>
        <div class='add_device_input_id_box' style='margin-top:164px'>
          <div class='add_device_input_id_box_ico'></div>
          <div class='add_device_input_id_box_del' @click='del_input' value='user'></div>
          <input id='add_device_input_id_box_input' class='add_device_input_id_box_input' :placeholder='mcs_please_input_username' v-model='user_val'>
        </div>
        <div class='add_device_input_id_box'>
          <div class='add_device_input_pass_box_ico'></div>
          <div class='add_device_input_id_box_del' @click='del_input' value='pwd'></div>
          <input id='add_device_input_pass' class='add_device_input_id_box_input' :placeholder='mcs_input_password' v-model='pwd_val'>
        </div>
        <div id='add_device_submit' @click='add_detailed_device_submit'> {{mcs_add}} </div>
      </div>
    </div>

  </div>
</template>
<script>
export default {
  name: 'device-Model',
  props: {
    addDeviceModel: { // 添加设备弹窗控制标识
      type: Boolean,
      default: false
    },
    addDeviceModelObj: { // 添加设备弹窗展示对象
      type: Object,
      default: function () { }
    },
    onvif_box_search_ack: { //搜索设备返回
      type: Function,
      default: null
    }
  },
  data () {
    return {
      //多国语言
      mcs_add_device: mcs_add_device, //添加设备
      mcs_please_input_username: mcs_please_input_username, //请输入用户名
      mcs_input_password: mcs_input_password, //输入密码
      mrs_input_ip: mrs_input_ip, //请输入ip地址
      mrs_input_port: mrs_input_port, //请输入端口号
      mcs_add: mcs_add, //添加
      mcs_connect_same_area: mcs_connect_same_area, //请将您的摄像机和存储设备用网线连接同一台路由器
      mrs_searching: mrs_searching, //正在搜索,请稍后
      mrs_net_nosearch_devcice: mrs_net_nosearch_devcice, //局域网内没有搜索到可添加设备
      mrs_research: mrs_research, //重新搜索
      mcs_old_nick: mcs_old_nick, //昵称
      mcs_ip_address: mcs_ip_address, //IP地址
      mcs_port: mcs_port, //端口
      mcs_back: mcs_back, //返回

      user_val: '', //用户名
      pwd_val: '', //密码
      ip_val: '', //ip地址
      port_val: '', //端口号
      searching_sign: true, //正在搜索
      add_device_sign: false, //是否可添加设备
      unadd_device_list: [], //未添加设备列表
      conf: {}, //添加设备信息
    }
  },
  watch: {
    "addDeviceModelObj.addDeviceBodyFlag" (val) {
      if (val == "searchDevicePage") {
        this.get_onvif_unadd();
      } else {
        this.searching_sign = true;
      }
    }
  },
  methods: {
    closeModel () { // 关闭弹窗
      this.user_val = ''
      this.pwd_val = ''
      this.ip_val = ''
      this.port_val = ''
      this.searching_sign = true
      this.add_device_sign = false
      this.$emit('closeModel')
    },
    del_input (e) { //清空输入框
      switch (e.currentTarget.getAttribute('value')) {
        case 'user':
          this.user_val = '';
          break;
        case 'pwd':
          this.pwd_val = '';
          break;
        case 'ip':
          this.ip_val = '';
          break;
        case 'port':
          this.port_val = '';
          break;
      }
    },
    checkIp (data) { //检查ip地址是否规范
      let exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      let reg = this.ip_val.match(exp);
      if (reg == null) {
        this.publicFunc.msg_tips({ msg: mrs_ip_illegal, type: "error", timeout: 3000 }); // IP地址不合法
        this.ip_val = "";
      }
    },
    checkPort (data) { //检查端口号是否规范
      let parten = /^(\d)+$/g;
      if (parten.test(this.port_val) && parseInt(this.port_val) <= 65535 && parseInt(this.port_val) >= 0) {
        return true;
      } else {
        this.publicFunc.msg_tips({ msg: mrs_port_illegal, type: "error", timeout: 3000 }); // 端口号不合规范
        this.port_val = "";
        // return false;
      }
    },
    add_device_submit () { // 点击onvif添加按钮
      let conf = {};
      conf.box_sn = this.$store.state.jumpPageData.selectDeviceIpc;
      if (this.user_val == "" || this.pwd_val == "") {
        this.publicFunc.msg_tips({ msg: mrs_username_password_empty, type: "error", timeout: 3000 }); // 用户名或密码为空
      } else if (this.ip_val == "") {
        this.publicFunc.msg_tips({ msg: mrs_ip_illegal, type: "error", timeout: 3000 }); // IP地址不合法
      } else if (this.port_val == "") {
        this.publicFunc.msg_tips({ msg: mrs_port_illegal, type: "error", timeout: 3000 }); // 端口号不合规范
      } else {
        conf.username = this.user_val;
        conf.password = this.pwd_val;
        conf.ip = this.ip_val;
        conf.port = this.port_val;
        conf.enable = 1;
        conf.flag = 0;
        conf.type = "ONVIF_IPC";
        this.$api.boxlist.onvif_box_add_ipc(conf).then(res => { //发送添加设备请求
          this.onvif_box_add_ipc_ack(res)
        })
      }
    },
    onvif_re_searching_btn () { //重新搜索
      this.searching_sign = true;
      this.add_device_sign = false;
      this.$api.boxlist.onvif_box_search({ // 调用ccm_box_search接口
        box_sn: this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        this.get_onvif_unadd(res)
      })
    },
    get_onvif_unadd () { //搜索设备
      this.unadd_device_list = [];
      setTimeout(() => {
        this.$api.boxlist.get_onvif_list({ // 调用ccm_box_conf_get接口
          box_sn: this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res => {
          //获取未添加的设备 渲染页面
          if (res.list) {
            for (let i = 0; i < res.list.length; i++) {
              if (res.list[i].conted == 0) {
                this.searching_sign = false;
                this.add_device_sign = false;
                this.unadd_device_list.push(res.list[i])
              }
            //    else if (!res.list[i].conted == 0) { // 如果有列表但没有可添加设备
            if(this.unadd_device_list.length == 0){
                setTimeout(() => {
                  this.searching_sign = false;
                  this.add_device_sign = true;
                }, 10000)
              }
            }
          } else { // 没有list
            setTimeout(() => {
              this.searching_sign = false;
              this.add_device_sign = true;
            }, 10000)
          }
          this.$nextTick(() => {
            let add_onvif_devices_box_height = document.getElementById("add_onvif_devices_box").offsetHeight;
            let height_onvif;
            if (window.fujikam == "fujikam") {
              let vimtag_device_list_box_height = document.getElementById("vimtag_device_list_box").offsetHeight;
              if (vimtag_device_list_box_height < add_onvif_devices_box_height) {
                height_onvif = add_onvif_devices_box_height + 500;
              } else {
                height_onvif = vimtag_device_list_box_height + 500;
              }
              $("#add_device_box").css('height', height_onvif);
            } else {
              if (document.body.scrollHeight < add_onvif_devices_box_height) {
                height_onvif = add_onvif_devices_box_height + 100;
              } else {
                height_onvif = document.body.scrollHeight + 100;
              }
              $("#add_device_box").css('height', height_onvif);
            }
          })
        })
      }, 2000)
    },
    box_onvif_add_btn (e) { //点击设备添加按钮
      let onvif_uuid = e.currentTarget.getAttribute('uuid');
      let onvif_port = e.currentTarget.getAttribute('port');
      let onvif_ip = e.currentTarget.getAttribute('ip');
      let onvif_type = e.currentTarget.getAttribute('type');
      this.conf.uuid = onvif_uuid;
      this.conf.port = onvif_port;
      this.conf.ip = onvif_ip;
      this.conf.type = onvif_type;
      this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'addDetailedDevicePage') // 切换至添加详情设备页面
    },
    add_detailed_device_submit () { //点击onvif添加按钮
      this.conf.username = this.user_val;
      this.conf.password = this.pwd_val;
      this.conf.enable = 1;
      this.conf.code_match = 0;
      this.conf.box_sn = this.$store.state.jumpPageData.selectDeviceIpc;
      this.conf.record = 0;
      this.conf.flag = 0;
      this.conf.no_ack = 0;
      this.$api.boxlist.onvif_box_add_ipc(this.conf).then(res => { //发送添加设备请求
        this.onvif_box_add_ipc_ack(res)
      })
    },
    onvif_box_add_ipc_ack (msg) { //如果添加成功，刷新页面 msg没有用 这个接口没有明确的返回值
      if (msg.result == "") {
        this.publicFunc.msg_tips({ msg: mcs_add_successfully, type: "success", timeout: 3000 }); // 添加成功
        this.closeModel();
      } else if (msg.result == "AuthenticateFailed") {
        this.publicFunc.msg_tips({ msg: mcs_user_or_password_invalid, type: "error", timeout: 3000 }) // 用户名或密码错误
        return
      } else if (msg.result == "NetworkUnreachable") {
        this.publicFunc.msg_tips({ msg: mrs_cloudbox_unsearch_device, type: "error", timeout: 3000 }) // 设备离线或与云盒子不在同一局域网内
        return
      } else {
        this.publicFunc.msg_tips({ msg: mcs_add_failed, type: "error", timeout: 3000 }) // 添加失败
        return
      }
    }
  }
}
</script>
<style lang='scss'>
@import '../../css/public.scss';

#add_device_box {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1099;
}

#add_onvif_devices_box {
  width: 840px;
  min-height: 580px;
  background: #fff;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 300px;
  margin-left: -420px;
  margin-top: -290px;
  box-sizing: border-box;
}

#add_devices_box_close {
  width: 20px;
  height: 20px;
  margin-right: 20px;
  margin-top: 17px;
  float: right;
  cursor: pointer;
  background: url(../../assets/device/n-close.png) no-repeat;
}

#add_devices_box_close:hover {
  background: url(../../assets/device/c-close.png) no-repeat;
}

#add_devices_box_title {
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid #d6d7dc;
  color: #333333;
  font-size: 16px;
}

#add_devices_box_body {
  width: 772px;
  margin: 0 auto;
}

.add_device_input_id_box {
  width: 240px;
  height: 35px;
  margin: 0 auto;
  border: 1px solid #999;
  border-radius: 5px;
  margin-bottom: 30px;
}

.vimtag_add_device_input_ip_box_ico {
  width: 16px;
  height: 16px;
  float: left;
  margin: 10px;
  background: url(../../assets/device/add_ovf_ip.png) no-repeat;
}

.vimtag_add_device_input_port_box_ico {
  width: 16px;
  height: 16px;
  float: left;
  margin: 10px;
  background: url(../../assets/device/add_ovf_port.png) no-repeat;
}

.vimtag_add_device_input_id_box_ico {
  width: 16px;
  height: 16px;
  float: left;
  margin: 10px;
  background: url(../../assets/device/user_icon.png) no-repeat;
}

.vimtag_add_device_input_pass_box_ico {
  width: 16px;
  height: 16px;
  float: left;
  margin: 10px;
  background: url(../../assets/device/pw_icon.png) no-repeat;
}

.add_device_input_id_box_del {
  width: 16px;
  height: 16px;
  float: right;
  margin: 10px;
  background: url('../../assets/device/cause.png') no-repeat;
}

.add_device_input_id_box_input {
  border: none;
  height: 35px;
  width: 160px;
}

#add_device_submit {
  color: #fff;
  width: 240px;
  text-align: center;
  cursor: pointer;
  line-height: 35px;
  margin: 0 auto;
  border-radius: 5px;
  background: $projectColor;
}

#box_onvif_img {
  width: 367px;
  height: 184px;
  margin: 0 auto;
  background: url(../../assets/device/Harddisk.png) no-repeat;
}

#box_onvif_img_tip {
  width: 685px;
  height: 262px;
  text-align: center;
  font-size: 16px;
  color: #323232;
  margin: 0 auto;
  padding: 30px 0;
  box-sizing: border-box;
}

#onvif_searching {
  /*width: 685px;
    margin: 0 auto;*/
  text-align: center;
  font-size: 16px;
  color: #323232;
  background: url(../../assets/device/loading.gif) no-repeat;
  background-size: 18px;
  margin-top: 40px;
  background-position: 247px 1px;
}

#ebit_onvif_searching {
  /*width: 685px;
    margin: 0 auto;*/
  text-align: center;
  font-size: 16px;
  color: #323232;
  background: url(../../assets/mipc/ebit_loading.gif) no-repeat;
  background-size: 18px;
  margin-top: 40px;
  background-position: 247px 1px;
}

#box_onvif_unadd_box {
  width: 685px;
  margin: 0 auto;
  border-top: 1px solid #ccc;
  overflow: hidden;
}

.box_onvif_unadd_img_box {
  /*width:190px; 设计稿为190px 但一排显示3个 有空白*/
  width: 170px;
  height: 256px;
  box-sizing: border-box;
  color: #323232;
  float: left;
}

.box_onvif_unadd_img {
  margin-top: 26px;
  margin-left: 62px;
  width: 46px;
  height: 48px;
}

.box_onvif_unadd_device_nick {
  text-align: center;
  margin-top: 13px;
  font-size: 16px;
}

.box_onvif_unadd_ip {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}

.box_onvif_unadd_port {
  text-align: center;
  font-size: 14px;
}

.box_onvif_add_btn {
  margin: 24px auto 0;
  width: 76px;
  height: 32px;
  font-size: 16px;
  line-height: 32px;
  text-align: center;
  color: $projectColor;
  border: 1px solid $projectColor;
  border-radius: 4px;
  cursor: pointer;
}

#onvif_no_searching {
  width: 685px;
  margin: 0 auto;
  text-align: center;
  font-size: 16px;
  color: #323232;
  margin-top: 40px;
}

#onvif_re_searching {
  width: 685px;
  margin: 0 auto;
  text-align: center;
  font-size: 16px;
  color: $projectColor;
  margin-top: 30px;
  cursor: default;
}

#add_onvif_devices_box_back {
  float: left;
  cursor: pointer;
  padding-left: 13px;
  line-height: 60px;
  margin-left: 20px;
  background: url('../../assets/device/back.png') 0 24px no-repeat;
}

#add_onvif_devices_box_back:hover {
  color: $projectColor;
  background: url('../../assets/device/choose-back.png') 0 24px no-repeat;
}

.add_device_input_id_box_ico {
  width: 16px;
  height: 16px;
  float: left;
  margin: 10px;
  background: url('../../assets/device/camera.png') no-repeat;
}

.add_device_input_pass_box_ico {
  width: 16px;
  height: 16px;
  float: left;
  margin: 10px;
  background: url('../../assets/device/key.png') no-repeat;
}
</style>