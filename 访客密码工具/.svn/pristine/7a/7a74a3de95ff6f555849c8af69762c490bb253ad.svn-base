function devInfo_func (obj) {
  var _this = this;
  _this.get_dev_info = function (param) { // 获取设备列表
    ms.send_msg("devs_refresh", {}, param.ref, function (msg, ref) {
      var result = new Object();
      var devlistArray = new Array();
      if (msg && msg.data.devs != "") {
        for (i = 0; i < msg.data.devs.length; i++) {
          devlistArray.push({ "result": "", "sn": msg.data.devs[i].sn, "dev_stat": msg.data.devs[i].stat });
        }
        result.data = devlistArray;
        result.ref = ref;
        onEvent(JSON.stringify(result).toLowerCase())
      } else {
        result.data = { "result": "not find dev in list" };
        result.ref = ref;
        onEvent(JSON.stringify(result))
      }
    });
  }

  _this.set_dev_guest_password = function (param) { // 设置设备访客密码
    ms.send_msg("dev_passwd_set", param.data, param.ref, function(msg, ref) {
      var result = new Object()
      if (msg && msg.result === '') {
        result.data = {"result": "set success"}
      } else {
        result.data = {"result": "set fail"}
      }
      result.ref = ref
      onEvent(JSON.stringify(result))
    })
  }

  _this.set_guest_password = function (param) { // 设置帐号访客密码
    console.log('enter set guest_password')
    ms.send_msg("account_passwd_set", param.data, param.ref, function(msg, ref) {
      var result = new Object()
      if (msg && msg.result === '') {
        result.data = {"result": "set user guest password success"}
      } else {
        result.data = {"result": "set fail"}
      }
      result.ref = ref
      onEvent(JSON.stringify(result))
    })
  }
}
var devInfo_func_ctrl = new devInfo_func();
g_func.push(
  { type: "get_dev_info", login: "1", action: devInfo_func_ctrl.get_dev_info },
  { type: "set_dev_guest_password", action: devInfo_func_ctrl.set_dev_guest_password},
  { type: "set_guest_password", login: "1", action: devInfo_func_ctrl.set_guest_password}
)