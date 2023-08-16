<template>
  <div id="devlist">
    <div id='dev_main_page'>
      <!-- 设备列表内容 -->
      <div id='dev_main_left'>
        <!-- 设备列表菜单 -->
        <div id='dev_left_top_menu'>
          <div class='dev_main_list' id='device_add_btn'>
            <div id='menu_add_dev_btn'></div>
          </div>
          <div class='menu_nav'></div>
          <div class='dev_main_list' id='device_list_edit'>
            <div id='menu_edit_dev_btn'></div>
          </div>
          <div class='menu_nav'></div>
          <div class='dev_main_list' id='device_refresh_btn'>
            <div id='menu_refresh_dev_btn'></div>
          </div>
        </div>
        <!-- 设备列表菜单 结束 -->
        <!-- 设备列表详细 -->
        <div id='dev_list'></div>
        <!-- 设备列表详细 结束 -->
      </div>
      <!-- 设备列表内容 结束-->
      <!-- 右侧详情内容 -->
      <div id='dev_main_right'>
        <!-- 采用子路由展示右侧详情渲染播放页面/云盒子列表 -->
        <router-view></router-view>
      </div>
      <!-- 右侧详情内容 结束 -->
    </div>
  </div>
</template>
<style lang="scss">
@import 'index.scss';
</style>
<script>
import languageSelect from '../../../lib/exportModule/languageSelect.js'
import '../../../lib/exportModule/mCustomScrollbar'
export default {
  data () {
    return {};
  },
  methods: {
    mipcDevlist (obj) {
      let _this = this;
      $("#set_back").hide();
      $("#menu_box_main").show();
      if (window.fujikam) {
        // check_app_version()
      }
      // get_dev_list("refresh") // 刷新获取设备列表处理删除设备后回到列表页仍能对设备进行操作的问题
      let l_data;
      // console.log('进入创建页面, 清空dom', obj)
      obj.parent.innerHTML = null;
      // alert(obj.parent.innerHTML)
      // console.log('清空dom')
      // console.log(obj.parent[0])
      obj.parent[0].innerHTML =
        "<div id='dev_main_page'>"
        + "<div id='dev_main_left'></div>"
        + "<div id='dev_main_right'></div>"
        + "</div>";
      // console.log('重新复制')
      _this.publicFunc.mx("#dev_main_right").style.width = document.body.clientWidth - _this.publicFunc.mx("#dev_main_left").offsetWidth - 60 + "px";
      _this.publicFunc.mx("#dev_main_left").style.height = (document.documentElement.clientHeight - 54) + "px";
      function create_dev_left_page () {
        _this.publicFunc.mx("#dev_main_left").innerHTML =
          "<div id='dev_left_top_menu'>"
          + "<div class='dev_main_list' id='device_add_btn'><div id='menu_add_dev_btn'></div></div>"
          + "<div class='menu_nav'></div>"
          + "<div class='dev_main_list' id='device_list_edit'><div id='menu_edit_dev_btn'></div></div>"
          + "<div class='menu_nav'></div>"
          + "<div class='dev_main_list' id='device_refresh_btn'><div id='menu_refresh_dev_btn'></div></div>"
          + "</div>"
          + "<div id='dev_list'></div>";
        _this.publicFunc.mx("#dev_list").style.height = (_this.publicFunc.mx("#dev_main_left").offsetHeight - 43) + "px";
        // get_dev_list("refresh") // 刷新获取设备列表处理删除设备后回到列表页仍能对设备进行操作的问题
        // _this.publicFunc.mx("#dev_main_right").innerHTML = null
        function device_list (msg) {
          _this.$store.dispatch('setDeviceData', msg)
          l_data = msg;
          _this.publicFunc.mx("#dev_list").innerHTML = "";
          _this.publicFunc.mx("#dev_list").innerHTML = "<div id='dev_list_box'></div>"
          for (let i = 0; i < msg.length; i++) {
            if (msg[i].type !== "socket") {
              let device_status_img = "";
              if (msg[i].stat == "Offline") {
                device_status_img = "device_ipc_offline";
              } else if (msg[i].stat == "InvalidAuth") {
                device_status_img = "device_ipc_InvalidAuth";
              } else if (msg[i].stat == "Online") {
                if (!_this.$store.state.jumpPageData.selectDeviceIpc) {
                  _this.$store.dispatch('setSelectDeviceIpc', msg[i].sn)
                }
              }
              _this.publicFunc.mx("#dev_list_box").innerHTML +=
                "<div class='dev_list' state='" + msg[i].stat + "' dtype='" + msg[i].type + "' sn='" + msg[i].sn + "'>"
                + "<div class='device_sidebar_nick'>"
                + "<div class='device_sidebar_point'></div>"
                + "<div class='device_list_nick'>" + (msg[i].nick.length < 20 ? msg[i].nick : msg[i].nick.substr(0, 20) + "...") + "</div>"
                + "<div class='device_list_del_ico'></div>"
                + "</div>"
                + "<div class='device_list_img " + device_status_img + "'>"
                + "<div><img class='img_class'></div>"
                + "</div>"
                + "</div>";
            }
          }
          _this.publicFunc.mx("#dev_list_box").innerHTML += "<div id='active_dev_li'></div>"
          create_dev_left_event();
        }

        async function get_dev_list (type) {
          if (_this.$store.state.jumpPageData.deviceData.length == 0 || type === 'refresh') {
            await _this.$api.devlist.devs_refresh().then(res => {
              device_list(res)
            })
          } else {
            await device_list(_this.$store.state.jumpPageData.deviceData);
          }
        }
        get_dev_list()
        function create_dev_left_event () {
          _this.publicFunc.mx("#device_refresh_btn").onclick = function () {
            get_dev_list('refresh')
          }
          _this.publicFunc.mx("#device_list_edit").onclick = function () {
            if (_this.$store.state.jumpPageData.experienceFlag) {
              return;
            }
            if ($(".device_list_del_ico").css("display") == "none") {
              $(".device_list_del_ico").show();
            } else {
              $(".device_list_del_ico").hide();
            }
          }
          _this.publicFunc.mx("#device_add_btn").onclick = function () {
            $("#add_device_page").show();
            create_add_devices_box({ parent: _this.publicFunc.mx("#add_device_page") });
          }
          _this.publicFunc.mx("#dev_list_box").style.height = "100%";
          $("#dev_list_box").mCustomScrollbar();
          let length = _this.publicFunc.mx(".dev_list").length;
          let l_dom_device_list_del_ico = _this.publicFunc.mx(".device_list_del_ico");
          for (let j = 0; j < l_dom_device_list_del_ico.length; j++) {
            l_dom_device_list_del_ico[j].onclick = function (e) {
              e.stopPropagation()
              let _this_sn = this.parentNode.parentNode.getAttribute("sn");
              let _this_parent = this.parentNode.parentNode;
              _this.publicFunc.delete_tips({
                content: mcs_delete_device + "?", func: function () {
                  _this.$api.devlist.dev_del({
                    sn: _this_sn,
                    dom: _this_parent
                  }).then(res => {
                    _this.publicFunc.msg_tips({
                      msg: res.msg,
                      type: res.type,
                      timeout: 3000
                    })
                    if (res.type === 'success') {
                      _this.$api.devlist.devs_refresh().then($(res.dom).hide())
                    }
                  })
                }
              })
            }
          }
          for (let i = 0; i < length; i++) {
            let sn = _this.publicFunc.mx(".dev_list")[i].getAttribute("sn");
            let type = _this.publicFunc.mx(".dev_list")[i].getAttribute("dtype");
            let state = _this.publicFunc.mx(".dev_list")[i].getAttribute("state");
            if (sn == _this.$store.state.jumpPageData.selectDeviceIpc) {
              let active_top;
              if (obj.refresh) {
                active_top = _this.publicFunc.mx(".dev_list")[i].offsetTop;
              } else {
                active_top = _this.publicFunc.mx(".dev_list")[i].offsetTop;
              }
              _this.publicFunc.mx("#active_dev_li").style.top = active_top + "px";
              _this.publicFunc.mx(".dev_list")[i].className = "dev_list dev_list_active";
              if (type == 'IPC') {
                // createPage("play", {parent:$("#dev_main_right")})
                if (_this.$route.path != '/play') {
                  _this.$router.push({ name: 'play', params: { parent: $("#dev_main_right"), parentId: "dev_main_right" } })
                } else {
                  mipcPlay({ parent: $('#dev_main_right') })
                }
              } else if (type == "BOX") {
                let jumpData = { parent: $("#dev_main_right"), parentId: "dev_main_right" }
                // createPage("boxlist", {parent:$("#dev_main_right")})
                if (_this.$route.path != '/boxlist') {
                  _this.$router.push({ name: 'boxlist', params: jumpData })
                } else {
                  create_boxlist_page(jumpData)
                }
              }
            }
            if (state == "Online") {
              $(".img_class").eq(i).show();
            } else {
              $(".img_class").eq(i).hide();
            }
            _this.publicFunc.mx(".dev_list")[i].onclick = function () {
              let state = this.getAttribute("state");
              _this.$store.dispatch('setSelectDeviceIpc', this.getAttribute("sn"))
              if (state == "Online") {
                let type = this.getAttribute("dtype");
                let active_top;
                if (obj.refresh) {
                  active_top = this.offsetTop;
                } else {
                  active_top = this.offsetTop;
                }
                $("#active_dev_li").animate({ "top": active_top + "px" });
                $(".dev_list").removeClass("dev_list_active");
                this.className = "dev_list dev_list_active";
                if (type == 'IPC') {
                  // createPage("play", {parent: $("#dev_main_right")})
                  if (_this.$route.path != '/play') {
                    _this.$router.push({ name: 'play', params: { parent: $("#dev_main_right"), parentId: "dev_main_right" } })
                  } else {
                    mipcPlay({ parent: $('#dev_main_right') })
                  }
                } else if (type == "BOX") {
                  // createPage("boxlist", {parent: $("#dev_main_right")})
                  if (_this.$route.path != '/boxlist') {
                    _this.$router.push({ name: 'boxlist', params: { parent: $("#dev_main_right"), parentId: "dev_main_right" } })
                  } else {
                    create_boxlist_page({ parent: $("#dev_main_right") })
                  }
                }
              } else if (state == "InvalidAuth") {
                $("#add_device_page").show();
                create_add_devices_box({ parent: _this.publicFunc.mx("#add_device_page"), sn: _this.$store.state.jumpPageData.selectDeviceIpc });
              } else if (state == "Offline") {
                // createPage("set", {parent:$("#dev_main_page"),back_page:"device",type:4});
                _this.$router.push({ name: 'set', params: { parent: $("#dev_main_page"), back_page: "device", type: 4 } })
              }
            }
            _this.$api.devlist.load_noid_img({
              refresh: obj.refresh ? 1 : 0,
              sn: sn,
              num: i,
              dom: document.getElementsByClassName('dev_list')
            })
          }
        }

        function create_add_devices_box (data) {
          let d_type = "361", d_id = "";
          function add_device_select_type () {
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_choose_device_type + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div class='add_devices_type'>"
              + "<div class='add_devices_type_list' d_type='361'>"
              + "<div class='add_devices_type_list_img' style='background:url(" + require('@/assets/mipc/mipc-guide-shake.png') + ") no-repeat;'></div>"
              + "<div class='add_devices_type_list_name'>" + mcs_shaking + "</div>"
              + "</div>"
              + "<div class='add_devices_type_list' d_type='p1'>"
              + "<div class='add_devices_type_list_img' style='background:url(" + require('@/assets/mipc/mipc-guide-firearm.png') + ") no-repeat;'></div>"
              + "<div class='add_devices_type_list_name'>" + mcs_outdoor + "</div>"
              + "</div>"
              + "<div class='add_devices_type_list' d_type='m1'>"
              + "<div class='add_devices_type_list_img' style='background:url(" + require('@/assets/mipc/mipc-guide-card.png') + ") no-repeat;'></div>"
              + "<div class='add_devices_type_list_name'>" + mcs_card + "</div>"
              + "</div>"
              + "<div class='add_devices_type_list' d_type='s1'>"
              + "<div class='add_devices_type_list_img' style='background:url(" + require('@/assets/mipc/mipc-guide-box.png') + ") no-repeat;'></div>"
              + "<div class='add_devices_type_list_name'>" + mcs_cloud_box + "</div>"
              + "</div>"
              + "<div class='add_devices_type_list' d_type='fisheye'>"
              + "<div class='add_devices_type_list_img' style='background:url(" + require('@/assets/mipc/fisheye_off.png') + ") no-repeat 40% 100%'></div>"
              + "<div class='add_devices_type_list_name'>" + mrs_fisheye + "</div>"
              + "</div>"
              + "</div>"
              + "</div>"
              + "</div>";
            let l_dom_add_devices_type_list = _this.publicFunc.mx(".add_devices_type_list");
            function add_device_select_type_event () {
              for (let i = 0; i < l_dom_add_devices_type_list.length; i++) {
                l_dom_add_devices_type_list[i].onclick = function () {
                  d_type = this.getAttribute("d_type");
                  add_device_input_id()
                }
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = function () { close_add_page() }
            }
            add_device_select_type_event();
          }
          function add_device_input_id (existed) {
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_action_add_device + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_sample_img' class='add_device_sample_img add_device_sample_img_" + d_type + "'></div>"
              + "<div class='add_device_input_id_box'>"
              + "<div class='add_device_input_id_box_ico'></div>"
              + "<div id='add_device_input_id_box_del' class='add_device_input_id_box_del'></div>"
              + "<input id='add_device_input_id_box_input' class='add_device_input_id_box_input' type='text' placeholder='" + mcs_input_device_id + "'>"
              + "</div>"
              + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
              + "</div>"
              + "</div>";
            function add_device_input_id_event () {
              if (data.sn) {
                d_id = data.sn;
                _this.publicFunc.mx("#add_device_input_id_box_input").value = data.sn;
              }
              _this.publicFunc.mx("#add_devices_box_back").onclick = add_device_select_type;
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              _this.publicFunc.mx("#add_device_input_id_box_del").onclick = function () {
                _this.publicFunc.mx("#add_device_input_id_box_input").value = "";
              }
              _this.publicFunc.mx("#add_device_submit").onclick = function () {
                let device_existed;
                if (existed) {
                  device_existed = 0;
                } else {
                  device_existed = 0;
                  d_id = _this.publicFunc.mx("#add_device_input_id_box_input").value;
                  for (let i = 0; i < _this.$store.state.jumpPageData.deviceData.length; i++) {
                    if (_this.$store.state.jumpPageData.deviceData[i].sn == d_id) {
                      device_existed = 1;
                    }
                  }
                }
                if (!d_id) {
                  _this.publicFunc.msg_tips({ msg: mcs_the_user_name_is_empty, type: "error", timeout: 3000 });
                  return;
                } else if (device_existed) {
                  _this.publicFunc.msg_tips({ msg: mcs_device_existed, type: "warning", timeout: 3000 });
                } else {
                  // $("#buffer_page").show();
                  _this.publicFunc.showBufferPage()
                  _this.$api.devlist.devlist_check_online({ // 检测设备是否在线(密码为默认固定值)
                    sn: d_id,
                    pass: "1pl%*.1"
                  }).then(res => {
                    _this.publicFunc.closeBufferPage()
                    if (res === mcs_device_not_exist) { // 设备不存在
                      _this.publicFunc.msg_tips({ msg: res, type: "error", timeout: 3000 })
                    } else if (res === "user.offline") { // 设备不在线时
                      add_device_connect_power()
                    } else if (res === "") {
                      add_device_input_pass()
                    }
                  })
                }
              }
            }
            add_device_input_id_event();
          }
          function add_device_connect_power () {
            if (d_type == "s1") {
              data.parent.innerHTML =
                "<div id='add_devices_box'>"
                + "<div id='add_devices_box_menu'>"
                + "<div id='add_devices_box_back'></div>"
                + "<div id='add_devices_box_close'></div>"
                + "<div id='add_devices_box_title'>" + mcs_connect_power + "</div>"
                + "</div>"
                + "<div id='add_devices_box_body'>"
                + "<div id='add_device_sample_img' class='add_device_sample_img add_device_connect_power_" + d_type + "'></div>"
                // +"<div class='add_devices_box_note'>"+mcs_device_connect_power+"</div>"
                // +"<div class='add_devices_box_info'>"+mcs_device_connect_power_prompt+"</div>"
                + "<div class='add_devices_box_info'>" + mcs_device_box_connect_power + "<div id='add_devices_img'></div></div>"
                // +"<div id='add_devices_box_check' class='add_devices_box_check'>"
                //     +"<div id='add_devices_box_check_btn' class='add_devices_box_check_no'></div>"
                //     +"<div id='add_devices_box_check_text' class='add_devices_box_check_text'>"+mcs_lights_sound+"</div>"
                // +"</div>"
                + "<div style='height:30px;width:100%'></div>"
                + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
                + "</div>"
                + "</div>";
            } else {
              data.parent.innerHTML =
                "<div id='add_devices_box'>"
                + "<div id='add_devices_box_menu'>"
                + "<div id='add_devices_box_back'></div>"
                + "<div id='add_devices_box_close'></div>"
                + "<div id='add_devices_box_title'>" + mcs_connect_power + "</div>"
                + "</div>"
                + "<div id='add_devices_box_body'>"
                + "<div id='add_device_sample_img' class='add_device_sample_img add_device_connect_power_" + d_type + "'></div>"
                // +"<div class='add_devices_box_note'>"+mcs_device_connect_power+"</div>"
                // +"<div class='add_devices_box_info'>"+mcs_device_connect_power_prompt+"</div>"
                + "<div class='add_devices_box_info'>" + mcs_normal_device_connect_power + mcs_camera_turn_on_voice + "<div id='add_devices_img'></div></div>"
                // +"<div id='add_devices_box_check' class='add_devices_box_check'>"
                //     +"<div id='add_devices_box_check_btn' class='add_devices_box_check_no'></div>"
                //     +"<div id='add_devices_box_check_text' class='add_devices_box_check_text'>"+mcs_lights_sound+"</div>"
                // +"</div>"
                + "<div style='height:30px;width:100%'></div>"
                + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
                + "</div>"
                + "</div>";
            }
            // let add_devices_box_check_width = _this.publicFunc.mx("#add_devices_box_check_text").offsetWidth + 26;
            // _this.publicFunc.mx("#add_devices_box_check").style.width = (add_devices_box_check_width+5) + "px";
            function add_device_connect_power_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = function () {
                add_device_input_id();
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              _this.publicFunc.mx("#add_device_submit").onclick = add_device_connect_ethernet;
              $("#add_devices_img").click(function () { //缺少删除步骤
                $('body').append('<embed src="./theme/device/startSound.mp3" autostart="true" hidden="true" loop="false">');
              });
              /* _this.publicFunc.mx("#add_device_submit").onclick = function(){
                  _this.publicFunc.msg_tips({msg:mcs_comfirm_see_light, type:"error", timeout:3000});
              } */
              // _this.publicFunc.mx("#add_devices_box_check_btn").onclick = function(){
              //     if(this.className == "add_devices_box_check_no"){
              //         this.className = "add_devices_box_check_yes";
              //         _this.publicFunc.mx("#add_device_submit").onclick = add_device_connect_ethernet;
              //     }else if(this.className == "add_devices_box_check_yes"){
              //         this.className = "add_devices_box_check_no";
              //         _this.publicFunc.mx("#add_device_submit").onclick = function(){
              //             _this.publicFunc.msg_tips({msg:mcs_comfirm_see_light, type:"error", timeout:3000});
              //         }
              //     }
              // }
            }
            add_device_connect_power_event();
          }
          function add_device_connect_ethernet () {
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_connect_power + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_sample_img' class='add_device_sample_img add_device_connect_ethernet_" + d_type + "'></div>"
              // +"<div class='add_devices_box_note'>"+mcs_device_connect_ethernet+"</div>"
              + "<div class='add_devices_box_info'>" + msc_use_ethernet_cable_connect + "</div>"
              /* +"<div id='add_devices_box_check' class='add_devices_box_check'>"
                  +"<div id='add_devices_box_check_btn' class='add_devices_box_check_no'></div>"
                  +"<div id='add_devices_box_check_text' class='add_devices_box_check_text'>"+mcs_lights_sound+"</div>"
              +"</div>" */
              + "<div style='height:30px;width:100%'></div>"
              + "<div class='add_devices_wait_online'>" + mcs_state_wait_device_online + "</div>" //等待设备上线
              + "<div id='add_devices_timenum'>60</div>"
              + "</div>"
              + "</div>";
            // let add_devices_box_check_width = _this.publicFunc.mx("#add_devices_box_check_text").offsetWidth + 26;
            // _this.publicFunc.mx("#add_devices_box_check").style.width = (add_devices_box_check_width+5) + "px";
            function add_device_connect_ethernet_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = function () {
                add_device_input_id();
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              /* _this.publicFunc.mx("#add_device_submit").onclick = function(){
                  _this.publicFunc.msg_tips({msg:mcs_comfirm_see_light, type:"error", timeout:3000});
              }
              _this.publicFunc.mx("#add_devices_box_check_btn").onclick = function(){
                  if(this.className == "add_devices_box_check_no"){
                      this.className = "add_devices_box_check_yes";
                      _this.publicFunc.mx("#add_device_submit").onclick = add_device_input_id;
                  }else if(this.className == "add_devices_box_check_yes"){
                      this.className = "add_devices_box_check_no";
                      _this.publicFunc.mx("#add_device_submit").onclick = function(){
                          _this.publicFunc.msg_tips({msg:mcs_comfirm_see_light, type:"error", timeout:3000});
                      }
                  }
              } */
              let div = document.getElementById("add_devices_timenum");
              let timer1 = setInterval(function () {
                --div.innerHTML;
                if (div.innerHTML <= 0) {
                  // console.log('进入小于等于0的判断123')
                  clearInterval(timer1);
                  clearInterval(timer2)
                  add_device_unconnect_ethernet(); //等于0还没配置上，跳转到配置失败页面
                }
              }, 1000);
              let timer2 = setInterval(function () {
                _this.$api.devlist.devlist_check_online({
                  sn: d_id,
                  pass: "1pl%*.1"
                }).then(res => {
                  if (res === "") {
                    clearInterval(timer1);
                    clearInterval(timer2);
                    add_device_input_pass();
                  }
                })
              }, 5000);
              _this.publicFunc.mx("#add_devices_box_close").onclick = function () {
                close_add_page('add_dev');
                clearInterval(timer1);
                clearInterval(timer2);
              };
            }
            add_device_connect_ethernet_event();
          }
          function add_device_unconnect_ethernet () { //配置失败
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_device_unconnect_box'>"
              + "<div id='add_devices_help'></div>" //问号
              + "<div id='add_devices_box_close'></div>"
              + "</div>"
              + "<div id='add_devices_box_title' class='add_devices_unconnect_title'>" + mcs_finish + "</div>" //完成
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_fail_img'></div>"
              + "<div id='add_devices_unconnect_info' class='add_devices_box_info'>" + mcs_wifi_config_failure_reconnect + "</div>" // 配置失败，请点击重试
              + "</div>"
              + "</div>";

            function add_device_unconnect_ethernet_event () {
              _this.publicFunc.mx("#add_devices_box_close").onclick = function () {
                close_add_page('add_dev');
              };
              _this.publicFunc.mx("#add_device_fail_img").onclick = function () {
                add_device_connect_ethernet();
              }
              _this.publicFunc.mx("#add_devices_help").onclick = function () {
                add_devices_help_page();
              }
            }
            add_device_unconnect_ethernet_event();
          }
          function add_devices_help_page () { //配置失败时的帮助页面
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_help + "</div>" //帮助
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div class='device_offline_reason'>" + mcs_connect_ethernet_page_title + "</div>" //网线连接
              + "<div class='device_offline_reason_public'>" + mcs_always_cannot_online + "</div>" //设备一直无法上线
              + "<div class='device_offline_reason_public'>" + mcs_always_cannot_online_reason + "</div>"
              + "<div class='device_offline_reason_public'>" + mcs_other_problem_with_feedback + "</div>"
              + "</div>"
              + "</div>"
              + "</div>";
            function add_devices_help_page_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = function () {
                add_device_unconnect_ethernet();
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = function () {
                close_add_page('add_dev')
              };
            }
            add_devices_help_page_event();
          }
          function add_device_input_pass () { // 设备在线输入密码
            let b_id = d_id.toUpperCase();
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_action_add_device + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_info'>" + mcs_device_id + ":" + b_id + " &nbsp;&nbsp;" + mcs_status + ":" + mcs_state_device_online + "</div>"
              + "<div class='add_device_input_id_box'>"
              + "<div class='add_device_input_pass_box_ico'></div>"
              + "<div id='add_device_input_pass_box_del' class='add_device_input_id_box_del'></div>"
              + "<input id='add_device_input_pass' class='add_device_input_id_box_input' type='password' placeholder='" + mcs_input_password + "'>"
              + "</div>"
              + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
              + "<div id='add_device_forget_pass'>" + mcs_forgot_your_password + "</div>"
              + "</div>"
              + "</div>";
            function add_device_input_pass_event () {
              if (obj.sn) {
                $("#add_devices_box_back").hide();
              }
              _this.publicFunc.mx("#add_devices_box_back").onclick = function () {
                add_device_input_id();
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              _this.publicFunc.mx("#add_device_input_pass_box_del").onclick = function () {
                _this.publicFunc.mx("#add_device_input_pass").value = "";
              }
              _this.publicFunc.mx("#add_device_submit").onclick = function () {
                let password = _this.publicFunc.mx("#add_device_input_pass").value;
                if (!password) {
                  _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty, type: "error", timeout: 3000 });
                } else {
                  // $("#buffer_page").show();
                  _this.publicFunc.showBufferPage()
                  _this.$api.devlist.dev_add({ // 调用添加设备接口
                    sn: d_id,
                    password: password
                  }).then(res => {
                    _this.publicFunc.closeBufferPage()
                    if (res && res.result == "") {
                      if (password.length > 5) {
                        if (res.info && res.info.p) {
                          // 暂时不清楚判断参数的含义,但如果设备在线并且密码不为admin则不去设置任何关于摄像头的参数直接添加成功
                          for (let k = 0, length = res.info.p.length; k < length; k++) {
                            if (res.info.p[k].n == "s.wifs" && (res.info.p[k].v == "srvok")) {
                              // add_device_set_nick();
                              close_add_page('add_dev');
                              break;
                            } else if (res.info.p[k].v == "none") {
                              // add_device_set_nick();
                              close_add_page('add_dev');
                              break;
                            } else if (res.info.p[k].n == "s.wifs") {
                              // add_device_set_wifi();
                              close_add_page('add_dev');
                              break;
                            } else if (res.info.p[k].n == "s.eye") {//鱼眼
                              close_add_page('add_dev');
                              break;
                            }
                          }
                          close_add_page('add_dev');
                          _this.publicFunc.msg_tips({ msg: mcs_add_successfully, type: "success", timeout: 3000 }); // 添加成功
                        } else {
                          close_add_page('add_dev');
                        }
                      }
                      else { //如果密码是admin时，修改密码
                        add_device_edit_pass(password);
                      }
                    } else if (res.result == "accounts.pass.invalid") {
                      add_dev_info.desc = 'add device fail' + mcs_invalid_password;
                      _this.publicFunc.msg_tips({ msg: mcs_invalid_password + ".", type: "error", timeout: 3000 });
                    } else if (res.result == "subdev.exceed.device") {
                      add_dev_info.desc = 'add device fail' + mcs_devices_in_the_account_overrun;
                      _this.publicFunc.msg_tips({ msg: mcs_devices_in_the_account_overrun + ".", type: "error", timeout: 3000 });
                    } else if (res.result == "server.app.invalid") { // app限制   
                      add_dev_info.desc = 'add device fail' + mcs_device_add_app_invalid;
                      _this.publicFunc.msg_tips({ msg: mcs_device_add_app_invalid, type: "error", timeout: 3000 });
                    } else if (res.result == "server.loc.invalid") { // 地区限制 
                      add_dev_info.desc = 'add device fail' + mcs_device_add_loc_invalid;
                      _this.publicFunc.msg_tips({ msg: mcs_device_add_loc_invalid, type: "error", timeout: 3000 });
                    }
                  })
                }
              }
              _this.publicFunc.mx("#add_device_forget_pass").onclick = function () {
                add_device_forget_pass();
              }
            }
            add_device_input_pass_event();
          }
          function add_device_edit_pass (old_password) {
            let b_id = d_id.toUpperCase();
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_action_add_device + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_success'>"
              + "<div id='add_device_success_ico'></div>"
              + "<div id='add_device_success_txt'>" + mcs_device_id + ":" + b_id + " " + mcs_add_successfully + "!</div>"
              + "</div>"
              + "<div id='add_device_edit_pass_tips'>" + mcs_prompt_modify_passwd + "</div>"
              + "<div class='add_device_input_id_box'>"
              + "<div class='add_device_input_pass_box_ico'></div>"
              + "<input id='add_device_edit_pass' class='add_device_input_id_box_input' type='password' placeholder='" + mcs_input_password + "'>"
              + "</div>"
              + "<div class='add_device_input_id_box'>"
              + "<div class='add_device_input_pass_box_ico'></div>"
              + "<input id='add_device_edit_confirm_pass' class='add_device_input_id_box_input' type='password' placeholder='" + mcs_input_confirm_password + "'>"
              + "</div>"
              + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
              + "</div>"
              + "</div>";
            function add_device_edit_pass_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = add_device_input_pass;
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              _this.publicFunc.mx("#add_device_submit").onclick = function () {
                let password = _this.publicFunc.mx("#add_device_edit_pass").value;
                let re_password = _this.publicFunc.mx("#add_device_edit_confirm_pass").value;
                if (!password || !re_password) {
                  _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty, type: "error", timeout: 3000 });
                } else if (password.length <= 5) {
                  _this.publicFunc.msg_tips({ msg: mcs_password_range_hint, type: "error", timeout: 3000 });
                } else if (password != re_password) {
                  _this.publicFunc.msg_tips({ msg: mcs_two_password_input_inconsistent, type: "error", timeout: 3000 });
                } else {
                  _this.$api.devlist.dev_passwd_set({ // 设备密码设置
                    sn: d_id,
                    old_pass: old_password,
                    new_pass: password
                  }).then(res => {
                    if (res) {
                      _this.$api.devlist.dev_add({ // 添加设备
                        sn: d_id,
                        password: password
                      }).then(res => {
                        add_device_set_wifi(res)
                      })
                    } else {
                      _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 })
                    }
                  })

                }
              }
            }
            add_device_edit_pass_event();
          }
          function add_device_set_wifi () {
            let b_id = d_id.toUpperCase();
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_action_add_device + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_success'>"
              + "<div id='add_device_success_ico'></div>"
              + "<div id='add_device_success_txt'>" + mcs_device_id + ":" + b_id + " " + mcs_add_successfully + "!</div>"
              + "</div>"
              + "<div id='add_device_edit_pass_tips'>" + mcs_prompt_config_wifi + "</div>"
              + "<div id='add_device_set_wifi_refresh'></div>"
              + "<div id='add_device_set_wifi_box'>"
              + "<div class='add_device_set_wifi_box_ico'></div>"
              + "<div id='add_device_set_wifi_btn' class='add_device_set_wifi_up'></div>"
              + "<div id='add_device_set_wifi_input' class='add_device_set_wifi_input'>" + mcs_select_wifi_wizard + "</div>"
              + "<div id='add_device_set_wifi_list_box'></div>"
              + "</div>"
              + "<div class='add_device_input_id_box'>"
              + "<div class='add_device_input_pass_box_ico'></div>"
              + "<input id='add_device_wifi_password' class='add_device_input_id_box_input' type='password' placeholder='" + mcs_input_password + "'>"
              + "</div>"
              + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
              + "<div id='add_device_skip'>" + mcs_action_skip + "</div>"
              + "</div>"
              + "</div>";
            _this.publicFunc.mx("#add_device_set_wifi_refresh").onclick = function () {
              // $("#buffer_page").show();
              _this.publicFunc.showBufferPage()
              let l_dom_add_device_set_wifi_list_box = _this.publicFunc.mx("#add_device_set_wifi_list_box");
              l_dom_add_device_set_wifi_list_box.innerHTML = "";
              _this.$api.devlist.wifi_get({ // 设备可连接wifi获取
                sn: d_id
              }).then(res => {
                _this.publicFunc.closeBufferPage()
                if (res) {
                  for (let i = 0; i < res.length; i++) {
                    l_dom_add_device_set_wifi_list_box.innerHTML += "<div class='add_device_set_wifi_list'>" + res[i].ssid + "</div>"
                    // $("#add_device_set_wifi_list_box").html(wifi_Dom)
                  }
                  add_device_set_wifi_event();
                } else {
                  add_device_set_wifi_event();
                }
              })
            }
            function add_device_set_wifi_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = add_device_input_id;
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              let l_dom_add_device_set_wifi_list = _this.publicFunc.mx(".add_device_set_wifi_list");
              for (let i = 0; i < l_dom_add_device_set_wifi_list.length; i++) {
                l_dom_add_device_set_wifi_list[i].onclick = function () {
                  let select_wifi = this.innerHTML;
                  _this.publicFunc.mx("#add_device_set_wifi_input").innerHTML = select_wifi;
                  $("#add_device_set_wifi_list_box").hide();
                  _this.publicFunc.mx("#add_device_set_wifi_btn").className = "add_device_set_wifi_up";
                }
              }
              _this.publicFunc.mx("#add_device_set_wifi_btn").onclick = function () {
                if (this.className == "add_device_set_wifi_down") {
                  $("#add_device_set_wifi_list_box").slideUp();
                  this.className = "add_device_set_wifi_up";
                } else if (this.className == "add_device_set_wifi_up") {
                  $("#add_device_set_wifi_list_box").slideDown();
                  this.className = "add_device_set_wifi_down";
                }
              }

              _this.publicFunc.mx("#add_device_submit").onclick = function () {
                let wifi_password = _this.publicFunc.mx("#add_device_wifi_password").value;
                let wifi_ssid = _this.publicFunc.mx("#add_device_set_wifi_input").innerHTML;
                // if(!wifi_password){
                //     _this.publicFunc.msg_tips({msg:mcs_the_password_is_empty, type:"error", timeout:3000});
                // }else{
                // $("#buffer_page").show();
                _this.publicFunc.showBufferPage()
                _this.$api.devlist.wifi_get({ // 设备可连接wifi获取
                  sn: d_id, ssid: wifi_ssid, key: wifi_password
                }).then(res => {
                  _this.publicFunc.closeBufferPage()
                  if (res.type == 'error') {  //加上逻辑如果设置失败 不跳转页面 可以重新配置wifi或跳过
                    _this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 });
                  } else if (res.type == 'success') {
                    _this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 });
                    add_device_set_nick();
                  } else {
                    add_device_set_nick();
                  }
                })
                // }
              }
              _this.publicFunc.mx("#add_device_skip").onclick = function () {
                add_device_set_nick();
              }
            }
            _this.publicFunc.mx("#add_device_set_wifi_refresh").click();
          }
          function add_device_set_nick () {
            let b_id = d_id.toUpperCase();
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_nick_modify + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_edit_name_tips'>" + mcs_device_id + ":" + b_id + "</div>"
              + "<div class='add_device_input_id_box'>"
              + "<div class='add_device_input_name_box_ico'></div>"
              + "<input id='add_device_nick' class='add_device_input_id_box_input' type='text' placeholder='" + mcs_input_nick + "'>"
              + "</div>"
              + "<div id='add_device_submit'>" + mcs_action_next + "</div>"
              + "<div id='add_device_skip'>" + mcs_action_skip + "</div>"
              + "</div>"
              + "</div>";
            function add_device_set_nick_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = function () {
                add_device_set_wifi();
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              _this.publicFunc.mx("#add_device_submit").onclick = function () {
                let nick = _this.publicFunc.mx("#add_device_nick").value;
                if (!nick) {
                  _this.publicFunc.msg_tips({ msg: mcs_nick_not_empty, type: "error", timeout: 3000 });
                } else {
                  _this.$api.devlist.nick_set({ // 设置设备昵称
                    sn: d_id,
                    nick: nick
                  }).then(res => {
                    add_device_set_zone(res)
                  })
                }
              }
              _this.publicFunc.mx("#add_device_skip").onclick = function () {
                add_device_set_zone();
              }
            }
            add_device_set_nick_event();
          }
          function add_device_set_zone () {
            let timezone = "";
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_settings + mcs_time_zone + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_set_zone_box'>"
              + "<div class='add_device_set_zone_box_ico'></div>"
              + "<div id='add_device_set_wifi_btn' class='add_device_set_wifi_up'></div>"
              + "<div id='add_device_set_zone_input' class='add_device_set_wifi_input'></div>"
              + "<div id='add_device_set_wifi_list_box'></div>"
              + "</div>"
              + "<div id='add_device_submit'>" + mcs_ok + "</div>"
              + "<div id='add_device_skip'>" + mcs_action_skip + "</div>"
              + "</div>"
              + "</div>";

            // $("#buffer_page").show();
            _this.publicFunc.showBufferPage()
            _this.$api.devlist.time_zone_get({ // 设备时区获取
              sn: d_id
            }).then(res => {
              let wifi_Dom
              $("#add_device_set_wifi_list_box").html('')
              if (res) {
                _this.$api.devlist.time_get({ // 设备详细时间获取
                  sn: d_id
                }).then(res => {
                  time_get_ack(res)
                })
                for (let i = 0; i < res.length; i++) {
                  let zone_name_tmp = res[i].city.replace(/\(|&|\)|_/g, "")
                  let zone_name = eval("mcs_timezone_" + zone_name_tmp)
                  wifi_Dom += "<div class='add_device_set_wifi_list' utc='" + res[i].utc + "' city='" + res[i].city + "' name='" + res[i].file + "'>" + zone_name + "</div>"
                  $("#add_device_set_wifi_list_box").html(wifi_Dom)
                }
              }
            })
            function time_get_ack (msg) {
              // $("#buffer_page").hide();
              _this.publicFunc.closeBufferPage()
              let timezone_name = msg.timezone;
              let timezone_tmp = msg.timezone.replace(/\(|&|\)|_/g, "");
              timezone_tmp = eval("typeof mcs_timezone_" + timezone_tmp + "=='undefined'?'" + timezone_tmp + "':mcs_timezone_" + timezone_tmp)
              _this.publicFunc.mx("#add_device_set_zone_input").innerHTML = timezone_name;
              timezone = timezone_name;
              add_device_set_zone_event();
            }
            function add_device_set_zone_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = function () {
                add_device_set_nick();
              }
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              let l_dom_add_device_set_wifi_list = _this.publicFunc.mx(".add_device_set_wifi_list");
              for (let i = 0; i < l_dom_add_device_set_wifi_list.length; i++) {
                l_dom_add_device_set_wifi_list[i].onclick = function () {
                  _this.publicFunc.mx("#add_device_set_zone_input").innerHTML = this.innerHTML;
                  timezone = this.getAttribute("city");
                  $("#add_device_set_wifi_list_box").hide();
                  _this.publicFunc.mx("#add_device_set_wifi_btn").className = "add_device_set_wifi_up";
                }
              }
              _this.publicFunc.mx("#add_device_set_wifi_btn").onclick = function () {
                if (this.className == "add_device_set_wifi_down") {
                  $("#add_device_set_wifi_list_box").slideUp();
                  this.className = "add_device_set_wifi_up";
                } else if (this.className == "add_device_set_wifi_up") {
                  $("#add_device_set_wifi_list_box").slideDown();
                  this.className = "add_device_set_wifi_down";
                }
              }
              _this.publicFunc.mx("#add_device_submit").onclick = function () {
                // $("#buffer_page").show();
                _this.publicFunc.showBufferPage()
                _this.$api.devlist.time_set({ // 设置设备时区及时间
                  sn: d_id,
                  timezone: timezone
                }).then(res => {
                  if (res == 1) {
                    _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                  } else {
                    // $("#buffer_page").hide();
                    _this.publicFunc.closeBufferPage()
                    _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 }); //设置完时区提示
                    close_add_page('add_dev')
                  }
                })
              }
              _this.publicFunc.mx("#add_device_skip").onclick = close_add_page;
            }
          }
          function add_device_forget_pass () {
            data.parent.innerHTML =
              "<div id='add_devices_box'>"
              + "<div id='add_devices_box_menu'>"
              + "<div id='add_devices_box_back'></div>"
              + "<div id='add_devices_box_close'></div>"
              + "<div id='add_devices_box_title'>" + mcs_forgot_your_password + "</div>"
              + "</div>"
              + "<div id='add_devices_box_body'>"
              + "<div id='add_device_sample_img' class='add_device_sample_img add_reset_pass_" + d_type + "'></div>"
              + "<div class='add_devices_box_info'>" + mcs_forgetpass_action_wizard + "</div>"
              + "<div id='add_device_submit'>" + mcs_close + "</div>"
              + "</div>"
              + "</div>";
            function add_device_forget_pass_event () {
              _this.publicFunc.mx("#add_devices_box_back").onclick = add_device_input_pass;
              _this.publicFunc.mx("#add_devices_box_close").onclick = close_add_page;
              _this.publicFunc.mx("#add_device_submit").onclick = add_device_input_pass;
            }
            add_device_forget_pass_event();
          }
          if (data.sn) {
            add_device_input_id(1);
          } else {
            add_device_select_type();
          }
        }
        function close_add_page () {
          $("#add_device_page").hide();
          get_dev_list("refresh")
        }
      }
      create_dev_left_page();
      window.onresize = function () { }
    }
  },
  async mounted () {
    this.publicFunc.projectReload.call(this);
    let userLanguage = sessionStorage.getItem("userLanguage");
    if (userLanguage) {
      await this.$chooseLanguage.lang(userLanguage);
    } else {
      await this.$chooseLanguage.lang("en");
    }
    let pageData; //页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name);
    } else {
      pageData = { parent: $("#" + this.$route.name) };
    }
    // console.log(pageData, "pageData");
    await this.mipcDevlist(pageData); // 进入页面后加载
    // await this.publicFunc.importCss("Public.scss"); // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf("vimtag") === -1) {
      // mipc系列
      languageSelect.mipc($("#login_box"));
      $("#login_box").append("<div id='is_mipc_div'></div>");
    }
    if (!this.$store.state.jumpPageData.projectFlag) {
      $("#top_experience_div").css("display", "none");
    }

  }
};
</script>