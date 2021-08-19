<template>
  <div id="set"></div>
</template>
<style>
.fd-slider-bar {
	background-image: none;
	cursor: pointer;
	height: 0.5px;
    background-color: rgb(0, 166, 186) !important;
    border-bottom: 1px solid rgb(0, 166, 186) !important;
}
.fd-slider-cover {
	background: #c0c0c0 !important;
	border-bottom: 1px solid #c0c0c0 !important;
	cursor: pointer;
	height:0.5px;
}
.fd-slider-handle {
	background: none;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	-moz-border-radius: 10px;
	background: rgb(255, 255, 255) !important;
    height: 15px !important;
    width: 15px !important;
    border: 1px solid rgb(204, 204, 204) !important;
}
.fd-slider-hover .fd-slider-handle {
	background: none;
	background-color: #fff;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	-moz-border-radius: 10px;
}
.ibutton-handle-middle {
	float: right;
	margin-top: -3px;
	margin-left: 1px;
	width: 17px;
	height: 17px;
	background: none;
	background-color: #fff;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	-moz-border-radius: 10px;
	border: 1px solid #ccc;
}
.ibutton-container {
	margin-top: 18px !important;
	width: 60px !important;
	overflow: visible !important;
}
.ibutton-handle {
	height: 20px !important;
	width: 20px;
	background: none;
	padding: 0px;
}
.ibutton-container label {
	cursor: inherit;
	font-size: 12px !important;
	font-weight: normal;
	color:#0ea9bb;
}
div.ibutton-label-on {
	color: #7c7c7c;
	/*修改了这里*/
	text-shadow: 0 -1px 2px rgba(153, 153, 153, 0.4);
	left: 0;
	z-index: 1;
}
.tzSelect {
	width: 210px;
	height:34px;
}
.tzSelect .selectBox {
	position: relative;
	width:200px;
	height: 34px;
	line-height: 34px;
	text-align: center;
	padding-right: 3px;
	margin-top: 5px;
	background-color: #ffffff;
	background-image: none;
	background-repeat: no-repeat;
	background-position: 98% 40%;
	border: 1px solid #22aaaa;
	cursor: pointer;
	-moz-border-radius: 4px;
	-webkit-border-radius: 4px;
	border-radius: 4px;
	z-index: 20;
}
.tzSelect .dropDown {
	position: absolute;
	top: 30px;
	padding-top: 13px;
	padding-bottom: 13px;
	left: 0;
	width: 100%;
	border: 1px solid #22aaaa;
	background-image: none;
	background-color: #ffffff;
	-moz-background-size: 100% 100%;
	-webkit-background-size: 100% 100%;
	-o-background-size: 100% 100%;
	background-size: 100% 100%;
	list-style: none;
	-moz-box-sizing: border-box;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	-moz-border-radius: 6px;
	-webkit-border-radius: 6px;
	border-radius: 6px;
	-moz-box-shadow: 0 0 4px #111;
	-webkit-box-shadow: 0 0 4px #111;
	box-shadow: 0 0 4px #111;
	z-index: 21;
	max-height: 230px;
	overflow: auto;
}
.tzSelect .dropDown::-webkit-scrollbar{
    width:5px;
}
.tzSelect .dropDown::-webkit-scrollbar-thumb:vertical{
    background-color:#999;
    border-radius: 6px;
}
.tzSelect #select_network_edit {
	background-color: gary;
	border: 0pt;
	color: #000000;
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	position: absolute;
	line-height: 22px;
	height: 22px;
	width: 88%;
	top: 6px;
	left: 1px;
	border-radius: 8px;
	background-color: #ffffff;
	z-index: 3;
	margin-top:0;
}
#select_network_li .tzSelect {
	width: 200px;
}
#select_network_edit .dropDown{
	height:200px;
}
div.ibutton-label-on, div.ibutton-label-off {
	/*修改了这里  background-color ;height原来是9 px*/
	background-color: #dedede; 
	border-radius: 20px;
	height: 9px;
	white-space: nowrap;
	font-size: 17px;
	line-height: 17px;
	font-weight: bold;
	text-transform: uppercase;
	cursor: inherit;
	display: block;
	position: absolute;
	top: 0;
	padding-top: 3px;
	overflow: hidden;
	/*background: url("../assets/device/vimtag_img.png") no-repeat -145px -116px;*/
	width: 60px;
	/*height: 22px;*/
}
</style>
<script>
import fdSliderController from '../../util/fdSliderController'
import languageSelect from '../../lib/exportModule/languageSelect.js'
import mcodec from '../../util/mcodec.js'
import '../../css/jquery.ibutton.scss'
import "../../css/jquery.tzSelect.scss"
export default {
  data () {
    return {
      new_ealf: 0, // 设备联动框架标识
      obj: null, // 传入页面的obj
      g_show: "false",
      g_select_week: null,
      g_hide: null,
      record_flag_out: 'true',
      g_motion_track: null,
      g_is_add:'',
      g_set_out_time:'',
      native_can_back: false,
    }
  },
  methods: {
    dev_type_sort (a, b) {
      return a.type - b.type;
    },
    create_set_page (obj) {
      let _this = this
      this.obj = obj
      // console.log(obj, "create_set_page_obj")
      // let g_motion_track;
      // let g_show = "false";
      // let record_flag_out = 'true';

      obj.parent.html("<div id='device_setting_page'>"
        + "<div id='set_back'><div id='back'><div id='main_title_box_return_img'></div>" + mcs_back + "</div><div id='toggle_set_page'></div></div>"
        + "<div id='create_setting_page_left'></div>"
        + "<div id='create_setting_page_right'></div>"
        + "</div>")

      if (_this.$store.state.jumpPageData.projectFlag) { // mipc系列展示导航栏返回按钮
        $("#menu_box_main").hide();
        $("#set_back").hide();
      }

      $("#mipcBack").on("click", function () {
        // createPage("top", { parent: $("#top") });
        // _this.$router.push({ name: 'top', params: { parent: $("#top") } });
        // createPage("devlist", { parent: $("#page") })
        _this.$router.push({ name: 'devlist', params: { parent: $("#page") } });
      })
      _this.$api.set.set_list_get({ flag: obj.type, sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
        _this.create_set_list(res)
      })

      // 点击展示风格切换
      _this.publicFunc.mx('#toggle_set_page').onclick = function () {
        _this.$api.set.set_new_list_get({ flag: obj.type, sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
          create_new_set_list(res)
          toggle_setnewpage_click()
        })
      }

      function toggle_setnewpage_click () {
        _this.publicFunc.mx("#toggle_set_new_page").onclick = function () {
          let jumpData;
          if (obj.back_page == "play") {
            _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
              if (res.result == "") {
                if (res && res.fisheye) {
                  jumpData = { parent: $("#set"), back_page: "play", type: 5, addr: obj.addr, web_name: obj.web_name }
                  // createPage("set", { parent: $("#page"), back_page: "play", type: 5, addr: obj.addr, web_name: obj.web_name });
                  _this.create_set_page(jumpData);
                } else if (res.oscene) {
                  jumpData = { parent: $("#set"), back_page: "play", type: 1, addr: obj.addr, web_name: obj.web_name }
                  // createPage("set", { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: obj.web_name });
                  _this.create_set_page(jumpData);
                } else {
                  jumpData = { parent: $("#set"), back_page: "play", type: 3, addr: obj.addr, web_name: obj.web_name };
                  // createPage("set", { parent: $("#page"), back_page: "play", type: 3, addr: obj.addr, web_name: obj.web_name });
                  _this.create_set_page(jumpData);
                }
              } else {
                jumpData = { parent: $("#set"), back_page: "play", type: 1, addr: obj.addr, web_name: obj.web_name }
                // createPage("set", { parent: $("#page"), back_page: "play", type: 1, addr: obj.addr, web_name: obj.web_name });
                _this.create_set_page(jumpData);
              }
            })
          }else if (obj.back_page == "boxlist") {
            jumpData = { parent: $("#set"), back_page: "boxlist", type: 2, addr: obj.addr, agent: obj.agent, web_name: obj.web_name, box_live: obj.box_live }
            // createPage("set", { parent: $("#page"), back_page: "boxlist", type: 2, addr: obj.addr, agent: obj.agent, web_name: obj.web_name, box_live: obj.box_live });
            _this.create_set_page(jumpData);
          }
        }
      }
      function create_new_set_list (data) {
        let menu_content = "<div id='set_new_back'><div id='new_back' style='float:left'><div id='main_title_box_return_img'></div>" + mcs_back + "</div><div id='toggle_set_new_page'></div></div>";
        for (let i = 0; i < data.length; i++) {
          menu_content += "<div class='category_title'>" + data[i].category + "</div>";
          menu_content += "<div class='new_menu_list_box'>"
          let content = data[i].content;
          for (let j = 0; j < content.length; j++) {
            menu_content +=
              "<div class='new_menu_list' stype='" + content[j].type + "' " + (content[j].type == "lighting" ? "id='lighting'" : "") + " " + (content[j].type == "resolute" ? "id='resolute'" : "") + " " + (content[j].type == "accessory" ? "id='accessory'" : "") + " >"
              + "<div class='new_menu_list_img' style='background:url(" + require("@/assets/device/set_" + content[j].type + ".png") + ") no-repeat;width:34px;height:34px;background-size:100% 100%'></div>"
              + "<div class='new_menu_list_name' style='font-size:15px;margin-top:15px'>" + content[j].name + "</div>"
              + "</div>"
          }
          menu_content += "</div>";
        }
        obj.parent.html("<div id='set_new_main_page' style='margin:0 auto;width:90%;'>"
          + menu_content
          + "<div id='delete_dev_btn' class='menu_list_delete' stype='delete_device' style='background:#f1474f;margin:50px auto;border-radius:2px;width:174px;color:#fff;padding:5px;text-align:center;'><div style='cursor:pointer'>" + mcs_delete_device + "</div></div>"
          + "</div>")
        $("[stype='cloud-storage']").css('display', 'none');   //隐藏掉云存储
        set_new_list_event();
      }

      function set_new_list_event () {
        _this.publicFunc.mx("#new_back").onclick = function () {
          if (obj.back_page == "play") {
            // createPage("play", obj);
            _this.$router.push({ name: 'play', params: obj });
          } else if (obj.back_page == "boxlist") {
            // createPage("boxlist", obj);
            _this.$router.push({ name: 'boxlist', params: obj });
          }
        }
        let l_dom_new_menu_list = _this.publicFunc.mx(".new_menu_list");
        for (let j = 0; j < l_dom_new_menu_list.length; j++) {
          l_dom_new_menu_list[j].index = j;
          l_dom_new_menu_list[j].onclick = function () {
            obj.parent.html("<div id='new_page_back'><div id='main_title_box_return_img'></div>" + mcs_back + "</div>"
              + "<div id='create_setting_page_new'></div>")
            let __this = this;
            // let index = _this.index;
            // alarm_device_tips
            let list_name = $(__this)[0].innerText;  //后加云盒子硬盘显示文字与sd卡区分
            let info_data = { type: __this.getAttribute('stype'), list_name: list_name, dom: _this.publicFunc.mx("#create_setting_page_new") };
            _this.create_right_page(info_data);
            $('#create_setting_page_new').find('#ntp').css({ 'height': '50px', 'border-bottom': '1px solid #d6d7dc', 'border-top': '1px solid #d6d7dc' });
            let system_update_content = $('#create_setting_page_new').find("#system_upgrade_div");
            system_update_content.css('color', "#00a6ba");

            _this.publicFunc.mx('#new_page_back').onclick = function () {
              _this.$api.set.set_new_list_get({ flag: obj.type, sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                create_new_set_list(res)
                toggle_setnewpage_click()
              })
            }
            $(".list_right_box").css("margin", "0 auto");
          }
        }
        $("#lighting").hide();
        $("#accessory").hide();
        //console.log("get_dev_info_this")
        _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
          if (res.result === "") {
            if (res.white_light) {
              $("#lighting").show();
            }
            if (res.rffreq === "868") {
              $("#accessory").show();
            }
            //console.log(res, 'sound_detect_test')
            if (res.face_detect === "1" || res.sound_detect === "1") { //人型检测||msg.human_detect==1
              $("#accessory").show();
            }
          }
        })
        _this.publicFunc.mx('#delete_dev_btn').onclick = function () {
          _this.publicFunc.delete_tips({ content: mcs_delete_device + "?", func: delete_device })
          function delete_device () {
            _this.$api.devlist.dev_del({
              sn: _this_sn,
              dom: _this_parent
            }).then(res => {
              _this.set_result(res)
            })
          }
        }
      }
      // ********************* //

      // ******************************************** 设置switch结束 ********************************************************* //


      function set_time_func (type) {
        repeat = false;
        let index = -1;
        let time_select = [];
        let start_time = parseInt(mx("#start_time").innerHTML);
        let end_time = parseInt(mx("#end_time").innerHTML);
        let new_time_select = [];
        let tmp_data;
        if (start_time >= end_time) {
          repeat = true;
          flag = false;
          _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
          return;
        }
        flag = true;
        for (let i = 0; i < week_select.length; i++) {
          if (week_select[i]) {
            for (let j = 0; j < 24; j++) {
              if (j % 8 == 0) {
                tmp_data = "";
                index++;
              }
              if (j >= start_time && j < end_time) {
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
        function get_select_time (g_total_data) {
          if (g_total_data != "") {
            let l_data_2 = mcodec.b64_2_binary(g_total_data, 1), str = "", arr = [], arr2 = [], arr_tmp = [];
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
              if (_this.g_is_add == "false") {
                for (let i = 0; i < old_week.length; i++) {
                  let arr_all = "";
                  let arr_all_arr = [];
                  let arr1 = "", arr2 = "", arr3 = "";
                  for (let j = 0; j < 3; j++) {
                    arr_all += arr[old_week[i] * 3 + j].split("").reverse().join("");
                  }
                  arr_all_arr = arr_all.split("");
                  for (let m = parseInt(old_start_time); m < parseInt(old_end_time); m++) {
                    arr_all_arr[m] = "1";
                  }
                  for (let k = 0; k <= 7; k++) {
                    arr1 += arr_all_arr[k];
                  }
                  for (k = 8; k <= 15; k++) {
                    arr2 += arr_all_arr[k]
                  }
                  for (k = 16; k <= 23; k++) {
                    arr3 += arr_all_arr[k]
                  }
                  arr[old_week[i] * 3] = arr1.split("").reverse().join("");
                  arr[old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
                  arr[old_week[i] * 3 + 2] = arr3.split("").reverse().join("");
                }
              }
              let select = [];
              if (_this.g_is_add == "false") {
                for (let i = 0; i < week_select.length; i++) {
                  if (week_select[i] == 1) {
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
              g_total_data = l_data_64
              g_aa_data = l_data_64;
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
              g_total_data = l_data_64
              g_aa_data = l_data_64;
            }
          }
        }//get_select_time
        get_select_time(g_total_data)
      }//set_time_func

      let g_system_stop_wait = function (str) {
        let wait_div = _this.publicFunc.mx("#system_wait_div"),
          wait_display_div = _this.publicFunc.mx("#system_wait_display_div");
        document.documentElement.onkeydown = null;
        if (wait_div) {
          wait_div["innerHTML"] = "";
          wait_div.parentNode[s_removeChild](wait_div);
          wait_div = null;
        }
        if (wait_display_div) {
          wait_display_div["innerHTML"] = "";
          wait_display_div.parentNode[s_removeChild](wait_display_div);
          wait_display_div = null;
        }
      }
      _this.$store.dispatch('setSystemStopWait', g_system_stop_wait)
      function scene_set_ack (msg) {
        // $("#buffer_page").hide();
        _this.publicFunc.closeBufferPage()
        _this.set_result(msg);
      }
      
    },
    async create_set_list (data) { // 创建设置列表
      let _this = this
      for (let i = 0; i < data.length; i++) {
        if (_this.$store.state.jumpPageData.projectFlag) { // 渲染设置列表时mipc系列不添加图标
          _this.publicFunc.mx("#create_setting_page_left").innerHTML +=
            "<div class='list_idle_div list_idle_div_active' type='" + data[i].type + "' " + (data[i].type == "lighting" ? "id='lighting'" : "") + " " + (data[i].type == "delete_device" ? "id='set_delete_device'" : "") + " " + (data[i].type == "accessory" ? "id='accessory'" : "") + ">"
            + "<span class='list_left_text'>" + data[i].name + "</span>"
            + "<div class='list_img'></div>"
            + (data[i].type == "system" ? "<div id='system_new_version' class='system_new_version'>new</div>" : "")
            + "</div>"
        } else {
          if (_this.publicFunc.mx("#create_setting_page_left")) {
            _this.publicFunc.mx("#create_setting_page_left").innerHTML +=
              "<div class='list_idle_div list_idle_div_active' type='" + data[i].type + "' " + (data[i].type == "lighting" ? "id='lighting'" : "") + " " + (data[i].type == "delete_device" ? "id='set_delete_device'" : "") + " " + (data[i].type == "accessory" ? "id='accessory'" : "") + ">"
              + "<div " + (data[i].type == "delete_device" ? "" : "style='background:url(" + require("@/assets/device/set_" + data[i].type + ".png") + ") no-repeat 0 13px;width:19px;height:40px;background-size:100%;float:left'") + "></div>"
              + "<span class='list_left_text'>" + data[i].name + "</span>"
              + "<div class='list_img'></div>"
              + (data[i].type == "system" ? "<div id='system_new_version' class='system_new_version'>new</div>" : "")
              + "</div>"
          }
        }
      }
      $("#lighting").hide();
      $("#accessory").hide();
      $("#set_delete_device").children('span').css('margin-left', "0"); //解决删除设备不居中
      //console.log("get_dev_info_this")
      await _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
        if (res && res.result === "") {
          if (res.white_light) {
            $("#lighting").show();
          }
          if ($("#lighting").css('display') === "none") { //优化删除设备上面显示横线
            $("#set_delete_device").prev().prev().css("border-bottom", "none")
          } else {
            $("#set_delete_device").prev().css("border-bottom", "none")
          }
          if (res.rffreq === "868") {
            $("#accessory").show();
          }
          //console.log(res, 'sound_detect_test')
          if (res.face_detect === "1" || res.sound_detect === "1") { //人型检测||msg.human_detect==1
            $("#accessory").show();
          }
          if (res.new_ealf === "1") {
            _this.new_ealf = 1
          }
        }
      })
      _this.set_list_event();
    },
    set_list_event () { // 列表的点击事件绑定
      let _this = this
      if (_this.publicFunc.mx("#back")) {
        _this.publicFunc.mx("#back").onclick = function () {
          if (_this.obj.web_name == "vimtag") {
            if (_this.obj.back_page == "play") {
              // createPage("play", obj);
              _this.$router.push({ name: 'play', params: _this.obj });
            } else if (_this.obj.back_page == "boxlist") {
              // createPage("boxlist", obj);
              _this.$router.push({ name: 'boxlist', params: _this.obj });
            }
          }
          if (_this.obj.web_name == "mipc") {
            // createPage("top", { parent: _this.publicFunc.mx("#top") });
            _this.$router.push({ name: 'devlist', params: { parent: _this.publicFunc.mx("#top") } });
            // createPage("devlist", { parent: obj.parent })
            _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
          }
        }
      }
      let l_dom_list_idle_div = _this.publicFunc.mx(".list_idle_div");
      for (let j = 0; j < l_dom_list_idle_div.length; j++) {
        l_dom_list_idle_div[j].index = j;
        l_dom_list_idle_div[j].onclick = function () {
          let index = this.index;
          $(".list_idle_div").removeClass("list_idle_div_active");
          $(".list_idle_div").eq(index).addClass("list_idle_div_active");
          let list_name = $(this).children("span")[0].innerHTML;  //后加云盒子硬盘显示文字与sd卡区分
          let info_data = { type: this.getAttribute('type'), list_name: list_name, dom: _this.publicFunc.mx("#create_setting_page_right") };
          _this.create_right_page(info_data)
        }
      }
      if (l_dom_list_idle_div[0]) l_dom_list_idle_div[0].click();
    },
    async create_right_page (info) { // 创建设置右栏内容
      let _this = this
      // 判断是否含有联动标识
      if (_this.new_ealf && info.type === "record") {
        info.type = "record_new"
      }
      if (_this.new_ealf && info.type === "alarm_device_tips") {
        info.type = "alarm_new"
      }
      if (_this.new_ealf && info.type === "alarm") {
        info.type = "alarm_new"
      }
      switch (info.type) {
        case "about": {
          info.dom.innerHTML =
            "<div id = 'about_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_model + "</span>"
            + "<span class = 'attribute_value_text'></span>"
            + "</div>"
            + "<div class = 'list_right_item' style='display:none;'>"
            + "<span class = 'attribute_key_text'>" + mcs_manufacturer + "</span>"
            + "<span class = 'attribute_value_text'></span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_firmware_version + "</span>"
            + "<span class = 'attribute_value_text'></span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_plugin_version + "</span>"
            + "<span class = 'attribute_value_text'></span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_device_id + "</span>"
            + "<span class = 'attribute_value_text'></span>"
            + "</div>"
            + "<div class = 'list_right_item' style='display:none;' id='dev_sensor'>"
            + "<span class = 'attribute_key_text'>" + mcs_sensor_status + "</span>"
            + "<span class = 'attribute_value_text'>" + mcs_fault + "</span>"
            + "</div>"
            + "</div>";
          await _this.$api.set.about({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            if (res.check_ver) {
              $("#system_new_version").show();
            }
            let l_dom_attribute_value_text = _this.publicFunc.mx(".attribute_value_text");
            l_dom_attribute_value_text[0].innerHTML = res.model;
            l_dom_attribute_value_text[2].innerHTML = res.ver;
            l_dom_attribute_value_text[3].innerHTML = res.plugin_version ? res.plugin_version : mcs_not_installed;
            l_dom_attribute_value_text[4].innerHTML = res.sn;
          })
          // let upgrade_get_res 
          // await _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
          //   upgrade_get_res = res
          // })
          // let dev_info_res 
          // await _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
          //   dev_info_res = res
          // })
          // console.log(upgrade_get_res, dev_info_res, 'about')
          break;
        }
        case "nickname": {
          info.dom.innerHTML =
            "<div id = 'dev_name_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_nickname + ":</span>"
            + "<input type = 'text' id = 'dev_name_input' class = 'list_right_input' value=''>"
            + "</div>"
            + "<input id = 'set_dev_name' value = " + mcs_action_apply + " class = 'list_right_button' type = 'button'>"
            + "</div>";
          let l_dom_dev_name_input = _this.publicFunc.mx("#dev_name_input");
          l_dom_dev_name_input.onfocus = function () {
            if (this.value == _this.$store.state.jumpPageData.selectDeviceIpc) {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus) g_standard_input_box_onfocus(this);
          };
          l_dom_dev_name_input.onblur = function () {
            if (this.value == "") {
              this.value = _this.$store.state.jumpPageData.selectDeviceIpc;
            }
            // if (g_standard_input_box_onblur) g_standard_input_box_onblur(this);
          };
          _this.publicFunc.mx("#set_dev_name").onclick = function () {
            if (l_dom_dev_name_input.value && l_dom_dev_name_input.value != mcs_input_nick) {
              let reg = /['|"|<|>|+]/g;
              if (l_dom_dev_name_input.value.search(reg) > -1) {
                _this.publicFunc.msg_tips({ msg: mrs_enter_contain_illegal_characters, type: 'error', timeout: 3000 });
              } else {
                _this.$api.set.nickname_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, val: l_dom_dev_name_input.value }).then(res => {
                  _this.set_result(res)
                })
              }
            }
          }
          _this.$api.set.nickname_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            _this.publicFunc.mx("#dev_name_input").value = res.nick
          })
          break
        }
        case "admin_password": {
          info.dom.innerHTML =
            "<div id = 'admin_pwd_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item set_password_left'>"
            + "<span class = 'attribute_key_text'>" + mcs_admin_password + ":</span>"
            + "<input type = 'password' id = 'admin_pwd_input' class = 'list_right_input' value='@M!N*T'>"
            + "</div>"
            + "<div class = 'list_right_item_ex set_password_left'>"
            + "<span class = 'attribute_key_text'>" + mcs_new_password + ":</span>"
            + "<input type = 'password' id = 'new_admin_pwd_input' class = 'list_right_input' value='@M!N*T'>"
            + "</div>"
            + "<div class = 'list_right_item_ex set_password_left'>"
            + "<span class = 'attribute_key_text'>" + mcs_confirm_new_password + ":</span>"
            + "<input type = 'password' id = 'new_admin_pwd_input_re' class = 'list_right_input' value='@M!N*T'>"
            + "</div>"
            + "<input id='admin_pwd_button_setup' type = 'button' value = " + mcs_action_apply + " class = 'list_right_button'>"
            + "</div>";
          let l_dom_input_current_password = _this.publicFunc.mx("#admin_pwd_input");
          let l_dom_input_new_password = _this.publicFunc.mx("#new_admin_pwd_input");
          let l_dom_input_confirm_password = _this.publicFunc.mx("#new_admin_pwd_input_re");
          l_dom_input_current_password.onfocus = function () {
            if (this.value == "@M!N*T") {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus) g_standard_input_box_onfocus(this);
          };
          l_dom_input_current_password.onblur = function () {
            if (this.value == "") {
              this.value = "@M!N*T";
            }
            // if (g_standard_input_box_onblur) g_standard_input_box_onblur(this);
          };
          l_dom_input_new_password.onfocus = function () {
            if (this.value == "@M!N*T") {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus) g_standard_input_box_onfocus(this);
          };
          l_dom_input_new_password.onblur = function () {
            if (this.value == "") {
              this.value = "@M!N*T";
            }
            // if (g_standard_input_box_onblur) g_standard_input_box_onblur(this);
          };
          l_dom_input_confirm_password.onfocus = function () {
            if (this.value == "@M!N*T") {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus) g_standard_input_box_onfocus(this);
          };
          l_dom_input_confirm_password.onblur = function () {
            if (this.value == "") {
              this.value = "@M!N*T";
            }
            // if (g_standard_input_box_onblur) g_standard_input_box_onblur(this);
          };
          _this.publicFunc.mx("#admin_pwd_button_setup").onclick = function () {
            if (_this.$store.state.user.guest) {
              _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
            } else {
              if (l_dom_input_current_password.value == "amdin") {
                l_dom_input_current_password.value = "admin";
              }
              if (l_dom_input_current_password.value == "@M!N*T") {
                _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 });
                return;
              }
              if (l_dom_input_new_password.value == "@M!N*T") {
                _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 });
                return;
              }
              if (l_dom_input_new_password.value === l_dom_input_current_password.value) {
                _this.publicFunc.msg_tips({ msg: mrs_new_password_setting_failed, type: "error", timeout: 3000 });
                return;
              }
              if (l_dom_input_new_password.value != l_dom_input_confirm_password.value) {
                _this.publicFunc.msg_tips({ msg: mcs_two_password_input_inconsistent + ".", type: "error", timeout: 3000 });
                return;
              } else {
                let reg = /^\S{6,20}$/;
                if (!reg.exec(l_dom_input_new_password.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_password_demand + ".", type: "error", timeout: 3000 });
                  return;
                }
              }
              _this.$api.set.admin_password_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                old_pass: l_dom_input_current_password.value,
                new_pass: l_dom_input_new_password.value
              }).then(res => {
                _this.set_result(res)
              })
            }
          }
          break;
        }
        case "guest_password": {
          info.dom.innerHTML =
            "<div id = 'visitor_pwd_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_admin_password + ":</span>"
            + "<input type = 'password' id = 'visitor_pwd_input' class = 'list_right_input' value='@M!N*T'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_guest_password + ":</span>"
            + "<input type = 'password' id = 'new_visitor_pwd_input' class = 'list_right_input' value='@M!N*T'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_confirm_new_password + ":</span>"
            + "<input type = 'password' id = 'new_visitor_pwd_input_re' class = 'list_right_input' value='@M!N*T'>"
            + "</div>"
            + "<input id='visitor_pwd_button_setup' type = 'button' value = " + mcs_action_apply + " class = 'list_right_button'>"
            + "</div>";
          let l_dom_input_current_password = _this.publicFunc.mx("#visitor_pwd_input");
          let l_dom_input_new_password = _this.publicFunc.mx("#new_visitor_pwd_input");
          let l_dom_input_confirm_password = _this.publicFunc.mx("#new_visitor_pwd_input_re");
          l_dom_input_current_password.onfocus = function () {
            if (this.value == "@M!N*T") {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus)
            //   g_standard_input_box_onfocus(this);
          };
          l_dom_input_current_password.onblur = function () {
            if (this.value == "") {
              this.value = "@M!N*T";
            }
            // if (g_standard_input_box_onblur)
            //   g_standard_input_box_onblur(this);
          };
          l_dom_input_new_password.onfocus = function () {
            if (this.value == "@M!N*T") {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus)
            //   g_standard_input_box_onfocus(this);
          };
          l_dom_input_new_password.onblur = function () {
            if (this.value == "") {
              this.value = "@M!N*T";
            }
            // if (g_standard_input_box_onblur)
            //   g_standard_input_box_onblur(this);
          };
          l_dom_input_confirm_password.onfocus = function () {
            if (this.value == "@M!N*T") {
              this.value = "";
            }
            // if (g_standard_input_box_onfocus)
            // g_standard_input_box_onfocus(this);
          };
          l_dom_input_confirm_password.onblur = function () {
            if (this.value == "") {
              this.value = "@M!N*T";
            }
            // if (g_standard_input_box_onblur)
            // g_standard_input_box_onblur(this);
          };
          _this.publicFunc.mx("#visitor_pwd_button_setup").onclick = function () {
            if (_this.$store.state.user.guest) {
              _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
            } else {
              if (l_dom_input_current_password.value == "amdin") {
                l_dom_input_current_password.value = "admin";
              }
              if (l_dom_input_current_password.value == "@M!N*T") {
                _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 });
                return;
              }
              if (l_dom_input_new_password.value == "@M!N*T") {
                _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty + ".", type: "error", timeout: 3000 });
                return;
              }
              if (l_dom_input_new_password.value != l_dom_input_confirm_password.value) {
                _this.publicFunc.msg_tips({ msg: mcs_two_password_input_inconsistent + ".", type: "error", timeout: 3000 });
                return;
              }
              else {
                let reg = /^\S{6,20}$/;
                if (!reg.exec(l_dom_input_new_password.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_password_demand + ".", type: "error", timeout: 3000 });
                  return;
                }
              }
              if (l_dom_input_current_password.value == l_dom_input_confirm_password.value) {
                _this.publicFunc.msg_tips({ msg: mrs_guest_password_setting_failed, type: "error", timeout: 3000 })
                return;
              }
              _this.$api.set.guest_password_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                old_pass: l_dom_input_current_password.value,
                new_pass: l_dom_input_new_password.value
              }).then(res => {
                _this.set_result(res)
              })
            }
          }
          break
        }
        case "network": {
          info.dom.innerHTML =
            "<div id='network_info' class='list_right_box'>"
            + "<div id='nic_select_div' class = 'list_right_item'>"
            + "<div class='attribute_key_text'>" + mcs_network_interface + "</div>" //网卡
            + "<div class='options_float_right select_block' style='margin-top:0px;'><select id='select_nic'></select></div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_enabled + "</div>" //启动
            + "<div id='nic_enabled_switch' class='options_float_right' style='margin-top:0px;'>"
            + "<input id='nic_switch_checkbox' type='checkbox' checked/>"
            + "</div>"
            + "</div>"
            + "<div id='nic_enabled_content'>"
            + "<div id='mac_address' class='list_right_item'>"
            + "<div class='attribute_key_text'>" + mcs_mac_address + "</div>"
            + "<div class='options_float_right'><input type='text' id='input_mac_address' class='input_read_only' disabled></input></div>"
            + "</div>"
            + "<div id='nic_mode_select' class='list_right_item_ex' style='clear:both'>"
            + "<div class='attribute_key_text'>" + mcs_wifi_mode + "</div>"
            + "<div class='options_float_right'>"
            + "<select id='select_wifi_mode'>"
            + "<option value='1'>" + mcs_client + "</option>"
            + "<option value='2'>" + mcs_ap + "</option>"
            + "</select>"
            + "</div>"
            + "</div>"
            + "<div id='nic_not_conn_content' class='list_right_item' style='display:none'>"
            + "<div class='attribute_key_text'>" + mcs_network_status + "</div>"
            + "<div class='options_float_right'><input type='text' id='input_status' value='" + mcs_not_connected + "' class='input_read_only' disabled></input></div>"
            + "</div>"
            + "<div id='nic_ap_mode_content' style='display:none'>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_dhcp + "</div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>- " + mcs_start_address + "</div>"
            + "<div class='options_float_right'><input id='input_ap_start_address' type='text' class='input_read_only' disabled></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>- " + mcs_end_address + "</div>"
            + "<div class='options_float_right'><input id='input_ap_end_address' type='text' class='input_read_only' disabled></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>- " + mcs_gateway + "</div>"
            + "<div class='options_float_right'><input id='input_ap_gateway' type='text' class='input_read_only' disabled></input></div>"
            + "</div>"
            + "</div>"
            + "<div id='select_network_li' style='display:none'>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_select_network + " :</div><div id='ssid_status' class='options_float_right options_status'></div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>- " + mcs_wifi_list + "</div>"
            + "<div class='options_float_right'>"
            + "<select id='select_network' style='float:none;'></select>"
            + "<button id='button_refresh' class='list_right_button' style='margin-top:7px;'>" + mcs_refresh + "</button>"
            + "</div>"
            + "</div>"
            + "<div id='user_set_wifi_name_li' style='display:none' class = 'list_right_item'>"
            + "<div class='attribute_key_text'>- " + mcs_input_wifi_name + "</div>"
            + "<div class='options_float_right'>"
            + "<input type='text' id='user_set_wifi_name' class='normal_input_right'></input><span style='font-size:12px;color:#E5393F;line-height:40px;'></span>"
            // + "<button id='button_connect' class='standard_buttons_white' style='display:none'>" + mcs_connect + "</button>"
            + "</div>"
            + "</div>"
            + "<div id='select_network_password_li' style='display:none' class = 'list_right_item'>"
            + "<div class='attribute_key_text'>- " + mcs_password + "</div>"
            + "<div class='options_float_right'>"
            + "<input type='password' id='select_network_password' class='normal_input_right'></input><span style='font-size:12px;color:#E5393F;line-height:40px;'></span>"
            + "<button id='button_connect' class='standard_buttons_white' style='display:none'>" + mcs_connect + "</button>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div id='nic_conn_content' style='display:none;clear:both'>"
            + "<div id='ip_address_content'>"
            + "<div class='list_right_item_ex'>"
            + "<div class='options_left_title'>IP :</div><div id='ip_status' class='options_float_right options_status'></div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>- " + mcs_auto_obtain + "</div>"
            + "<div class='options_float_right'><input type='radio' id='radio_auto_obtain_ip' name='ip'/></div>"
            + "</div>"
            + "<div id='auto_obtain_ip_content' style='display:none'>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_ip_address + "</div>"
            + "<div class='options_float_right'><input id='input_auto_ip_address' type='text' class='input_read_only' disabled=true></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_gateway + "</div>"
            + "<div class='options_float_right'><input id='input_auto_gateway' type='text' class='input_read_only' disabled=true></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_network_mask + "</div>"
            + "<div class='options_float_right'><input id='input_auto_subnet_mask' type= 'text' class='input_read_only' disabled=true></input></div>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>- " + mcs_manually_set + "</div>"
            + "<div class='options_float_right'><input type='radio' id='radio_use_following_ip' name='ip'/></div>"
            + "</div>"
            + "<div id='use_following_ip_content' style='display:none'>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_ip_address + "</div>"
            + "<div class='options_float_right'><input id='input_following_ip_address' type='text' class='normal_input_right'></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_gateway + "</div>"
            + "<div class='options_float_right'><input id='input_following_gateway' type='text' class='normal_input_right'></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_network_mask + "</div>"
            + "<div class='options_float_right'><input id='input_following_subnet_mask' type='text' class='normal_input_right'></input></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div id='dns_content'>"
            + "<div class='list_right_item_ex'>"
            + "<div class='options_left_title'>DNS :</div><div id='dns_status' class='options_float_right options_status'></div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>- " + mcs_auto_obtain + "</div>"
            + "<div class='options_float_right'><input type='radio' id='radio_auto_obtain_dns' name='dns'/></div>"
            + "</div>"
            + "<div id='auto_obtain_dns_content' style='display:none'>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_dns + "</div>"
            + "<div class='options_float_right'><input id='input_auto_dns' type='text' class='input_read_only' disabled=true></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_secondary_dns + "</div>"
            + "<div class='options_float_right'><input id='input_auto_alternate_dns' type='text' class='input_read_only' disabled=true></input></div>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>- " + mcs_manually_set + "</div>"
            + "<div class='options_float_right'><input type='radio' id='radio_use_following_dns' name='dns'/></div>"
            + "</div>"
            + "<div id='use_following_dns_content' style='display:none' class='list_right_item'>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_dns + "</div>"
            + "<div class='options_float_right'><input id='input_following_dns' type='text' class='normal_input_right'></input></div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='attribute_key_text'>&nbsp;&nbsp;-- " + mcs_secondary_dns + "</div>"
            + "<div class='options_float_right'><input id='input_following_alternate_dns' type='text' class='normal_input_right'></input></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div>"
            + "<div class='options_float_right' style='clear:both'>"
            + "<button id='button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>"
            + "</div>"
            + "</div>";
          // let l_sni_bind_func = null,
          // l_ndg_bind_func = null,
          // l_dns_bind_func = null,
          let l_swc_bind_func = null,
            // l_network_token = "",
            // l_set_network_interfaces_response_ok = 1,
            // l_set_network_default_gateway_response_ok = 1,
            // l_set_dns_response_ok = 1,
            // l_set_wifi_config_response_ok = 1,
            l_ip_is_DHCP = 0,
            l_dns_is_DHCP = 0,
            l_origin_ethernet_addr = "",
            l_origin_wireless_addr = "",
            // l_timeout_count = 0,
            l_refresh_timer,
            // l_nic_enabled_status_flag = 0,
            l_nic_conn_status_flag = 0,
            l_nic_wifi_con = 0,
            l_old_version = 0,
            l_select_net;
          let l_nic_enabled_status_flag = 1;
          let l_dom_select_nic = _this.publicFunc.mx("#select_nic");
          let l_dom_select_wifi_mode = _this.publicFunc.mx("#select_wifi_mode");
          let l_dom_nic_switch_checkbox = _this.publicFunc.mx("#nic_switch_checkbox");
          let l_dom_nic_enabled_content = _this.publicFunc.mx("#nic_enabled_content");
          let l_dom_mac_address = _this.publicFunc.mx("#mac_address");
          let l_dom_nic_mode_select = _this.publicFunc.mx("#nic_mode_select");
          let l_dom_nic_not_conn_content = _this.publicFunc.mx("#nic_not_conn_content");
          let l_dom_manager_page = _this.publicFunc.mx("#manager_page");
          let l_dom_input_status = _this.publicFunc.mx("#input_status");
          let l_dom_radio_auto_obtain_ip = _this.publicFunc.mx("#radio_auto_obtain_ip");
          let l_dom_nic_ap_mode_content = _this.publicFunc.mx("#nic_ap_mode_content");
          let l_dom_select_network = _this.publicFunc.mx("#select_network");
          let l_dom_select_network_li = _this.publicFunc.mx("#select_network_li");
          let l_dom_input_mac_address = _this.publicFunc.mx("#input_mac_address");
          let l_dom_nic_conn_content = _this.publicFunc.mx("#nic_conn_content");
          let l_dom_auto_obtain_ip_content = _this.publicFunc.mx("#auto_obtain_ip_content");
          let l_dom_use_following_ip_content = _this.publicFunc.mx("#use_following_ip_content");
          let l_dom_auto_obtain_dns_content = _this.publicFunc.mx("#auto_obtain_dns_content");
          let l_dom_use_following_dns_content = _this.publicFunc.mx("#use_following_dns_content");
          let l_dom_input_auto_ip_address = _this.publicFunc.mx("#input_auto_ip_address");
          let l_dom_input_auto_subnet_mask = _this.publicFunc.mx("#input_auto_subnet_mask");
          let l_dom_input_auto_gateway = _this.publicFunc.mx("#input_auto_gateway");
          let l_dom_input_auto_dns = _this.publicFunc.mx("#input_auto_dns");
          let l_dom_input_auto_alternate_dns = _this.publicFunc.mx("#input_auto_alternate_dns");
          let l_dom_input_following_alternate_dns = _this.publicFunc.mx("#input_following_alternate_dns");
          let l_dom_button_refresh = _this.publicFunc.mx("#button_refresh");
          let l_dom_button_connect = _this.publicFunc.mx("#button_connect");
          let l_dom_radio_use_following_ip = _this.publicFunc.mx("#radio_use_following_ip");
          let l_dom_input_ap_start_address = _this.publicFunc.mx("#input_ap_start_address");
          let l_dom_input_ap_end_address = _this.publicFunc.mx("#input_ap_end_address");
          let l_dom_input_ap_gateway = _this.publicFunc.mx("#input_ap_gateway");
          let l_dom_select_network_password = _this.publicFunc.mx("#select_network_password");
          let l_dom_input_following_ip_address = _this.publicFunc.mx("#input_following_ip_address");
          let l_dom_input_following_gateway = _this.publicFunc.mx("#input_following_gateway");
          let l_dom_input_following_subnet_mask = _this.publicFunc.mx("#input_following_subnet_mask");
          let l_dom_radio_auto_obtain_dns = _this.publicFunc.mx("#radio_auto_obtain_dns");
          let l_dom_radio_use_following_dns = _this.publicFunc.mx("#radio_use_following_dns");
          let l_dom_input_following_dns = _this.publicFunc.mx("#input_following_dns");
          let l_dom_select_network_password_li = _this.publicFunc.mx("#select_network_password_li");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          // console.log('selectdevicetype')
          // console.log(_this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).type)
          // $("#select_nic").tzSelect();
          $("#select_wifi_mode").tzSelect();
          $("#nic_switch_checkbox").iButton({
            labelOn: "On",
            labelOff: "Off",
            change: function () {
              if (!l_nic_enabled_status_flag) {
                $("#nic_enabled_content").fadeOut();
                return;
              }
              if (_this.publicFunc.mx("#nic_switch_checkbox").checked) {
                $("#nic_enabled_content").fadeIn();
                if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                  $("#mac_address").fadeIn(450);
                  $("#nic_mode_select").fadeOut();
                  if (l_nic_conn_status_flag) {
                    $("#nic_not_conn_content").fadeIn(450);
                    l_dom_input_status.value = mcs_connnected;
                    $("#nic_conn_content").fadeIn(450, function () {
                      // $("#manager_page").mCustomScrollbar("update"); //未知用法，暂时注释，下同
                    });
                  }
                  else {
                    $("#nic_not_conn_content").fadeIn(450);
                    l_dom_input_status.value = mcs_not_connected;
                    $("#nic_conn_content").fadeIn(450, function () {
                      $("#manager_page").mCustomScrollbar("update");
                    });
                  }
                }
                else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                  if (!l_nic_conn_status_flag) {
                    l_nic_conn_status_flag = 0;
                    _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_ip);
                    $("#nic_mode_select").fadeOut();
                    $("#nic_ap_mode_content").fadeOut();
                    $(l_dom_select_network_li).fadeOut();
                    $("#nic_conn_content").fadeOut(300);
                    l_dom_input_status.value = mcs_fault;
                    $("#mac_address").fadeOut();
                    $("#nic_not_conn_content").fadeIn(450);
                    return;
                  }
                  $("#nic_mode_select").fadeIn()
                  l_dom_select_wifi_mode.change_value();
                }
              }
              else {
                $("#nic_enabled_content").fadeOut();
                if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                  $(l_dom_select_network_li).fadeOut();
                  $("#nic_mode_select").fadeOut();
                }
                $("#nic_not_conn_content").fadeOut(300);
                $("#nic_conn_content").fadeOut(350, function () {
                  $("#manager_page").mCustomScrollbar("update");
                });
              }
            }
          });
          //Back to the list wifi Refresh
          function wifi_list (msg) { // wifi列表最终显示 包含信号强度 ccm_net_get
            l_dom_button_refresh.style.color = "#ffffff";
            l_dom_button_refresh.style.cursor = "pointer";
            let i, length, inner_html = "";
            if (msg.networks && msg.networks[1].token == "ra0" && msg.networks[1].wifi_client.ap_list) {
              let msg_wifi_list = msg.networks[1].wifi_client.ap_list;
              inner_html += "<option>" + mcs_not_select + "</option>"; // 未选择
              inner_html += "<option>" + mcs_input_wifi_name + "</option>"; // 手动输入
              length = msg_wifi_list.length;
              for (i = 0; i < length; ++i) {
                if (msg_wifi_list[i].ssid == "") continue;
                if (msg_wifi_list[i].signal < 0) {
                  msg_wifi_list[i].signal = msg_wifi_list[i].signal + 100;
                }
                signal_level = Math.floor(msg_wifi_list[i].signal / 20);
                signal_level = (signal_level >= 5 ? 4 : signal_level);
                if (msg_wifi_list[i].connect) {
                  inner_html += "<option value='" + msg_wifi_list[i].ssid + "' selected='selected' front_img='/imgs/device_status_green.png' rear_img='/imgs/wifi_signal" + signal_level + ".png'>" + msg_wifi_list[i].ssid + "</option>";
                }
                else {
                  inner_html += "<option value='" + msg_wifi_list[i].ssid + "' rear_img='/imgs/wifi_signal" + signal_level + ".png'>" + msg_wifi_list[i].ssid + "</option>";
                }
              }
              $(l_dom_select_network).html(inner_html);
              l_dom_select_network.change_value();
            }
            $(l_dom_select_network).tzSelect(null, 1);


          }
          function add_network_event () {
            //wifi select
            l_dom_select_network.change_value = function () {
              if (this[this.selectedIndex].text === mcs_input_wifi_name) {
                $(_this.publicFunc.mx("#user_set_wifi_name_li")).fadeIn("normal", function () {
                  $("#manager_page").mCustomScrollbar("update");
                });
              } else { // 选择其他wifi之后隐藏手动输入框 并清空其中内容
                _this.publicFunc.mx("#user_set_wifi_name").value = ""
                $(_this.publicFunc.mx("#user_set_wifi_name_li")).fadeOut();
              }
              //if(this[this.selectedIndex].text == mcs_not_select)
              //   $(l_dom_select_network_password_li).fadeOut();
              //else
              $(l_dom_select_network_password_li).fadeIn("normal", function () {
                $("#manager_page").mCustomScrollbar("update");
              });
              $(l_dom_select_network).tzSelect(null, 1);
            };
            //wifi Refresh button
            l_dom_button_refresh.onclick = function () {
              // if (g_domain_oems_vimtag) {
              //   this.style.color = "#ccc";
              //   this.style.cursor = "wait";
              // }
              _this.$api.devlist.wifi_get({ // 设备可连接wifi获取
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                wifi_list(res)
              })
            };
            //wifi Connect button
            l_dom_button_connect.onclick = function () {
              //Role confirm function is to ask whether the connection to the network returns
              if (confirm(mcs_continue_switch_wireless_network)) {
                //network_Business.ctrl({type:"ccm_connect_wifi_request",data:{info:{ssid:l_dom_select_network[l_dom_select_network.selectedIndex].value, psk:l_dom_select_network_password.value}}});
                //ccm_connect_wifi_request({ssid:l_dom_select_network[l_dom_select_network.selectedIndex].value, psk:l_dom_select_network_password.value});
              }
            };
            l_dom_radio_auto_obtain_ip.onclick = function () {
              if (this.checked) {
                $(l_dom_use_following_ip_content).fadeOut("normal", function () {
                  if (l_ip_is_DHCP)
                    $(l_dom_auto_obtain_ip_content).slideDown("normal", function () {
                      // $("#manager_page").mCustomScrollbar("update");
                    });
                  else
                    $(l_dom_auto_obtain_ip_content).slideUp("normal", function () {
                      // $("#manager_page").mCustomScrollbar("update");
                    });
                });
              }
            };
            l_dom_radio_use_following_ip.onclick = function () {
              if (this.checked) {
                $(l_dom_auto_obtain_ip_content).fadeOut("normal", function () {
                  $(l_dom_use_following_ip_content).slideDown("normal", function () {
                    // $("#manager_page").mCustomScrollbar("update");
                  });
                });
              }
            };
            l_dom_input_ap_start_address.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_ap_start_address.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_ap_end_address.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_ap_end_address.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_ap_gateway.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_ap_gateway.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_select_network_password.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_select_network_password.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_following_ip_address.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_following_ip_address.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_following_gateway.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_following_gateway.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_following_subnet_mask.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_following_subnet_mask.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_radio_auto_obtain_dns.onclick = function () {
              if (this.checked) {
                $(l_dom_use_following_dns_content).slideUp("normal", function () {
                  if (l_dns_is_DHCP)
                    $(l_dom_auto_obtain_dns_content).slideDown("normal", function () {
                      // $("#manager_page").mCustomScrollbar("update");
                    });
                  else
                    $(l_dom_auto_obtain_dns_content).slideUp("normal", function () {
                      // $("#manager_page").mCustomScrollbar("update");
                    });
                });
              }
            };
            l_dom_radio_use_following_dns.onclick = function () {
              if (this.checked) {
                $(l_dom_use_following_dns_content).slideDown("normal", function () {
                  $(l_dom_auto_obtain_dns_content).slideUp("normal", function () {
                    // $("#manager_page").mCustomScrollbar("update");
                  });
                });
              }
            };
            l_dom_input_following_dns.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_following_dns.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_following_alternate_dns.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_following_alternate_dns.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
          }
          function subnet_mask_available_and_trans (obj) {
            let ip_pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
            if (!ip_pattern.test(obj.data)) return -1;

            let ip_array = obj.data.split("."),
              i, length, value, ip_binary = "";
            // let ip;
            length = ip_array.length;
            for (i = 0; i < length; ++i) {
              value = parseInt(ip_array[i]);
              if (value < 0 || value > 255) {
                return -1;
              }
              ip_binary += (value + 256).toString(2).substring(1);
            }
            if (-1 != ip_binary.indexOf("01"))
              return -1;
            return ip_binary.replace(/0/g, '').length;
          }
          //Set network parameters
          function ccm_set_network_info_request (obj) {
            let node, node_sn,
              i, count = 0, net_info = {}, now_ifs, now_net_info = {};
            // let length,dns = {};
            node_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            node = _this.$api.devlist.ldev_get(node_sn);
            if (!node) return;
            //obj_merge(net_info, obj.ori_net_info);
            net_info = obj.ori_net_info.networks;
            //Determine how many network connection is available
            for (i = 0; i < net_info.length; ++i) {
              if (net_info[i].enabled)
                ++count;
            }
            now_ifs = net_info[l_dom_select_nic.selectedIndex];
            if (obj.type == mcs_ethernet) {
              if (nic_switch_checkbox.checked) {
                if (l_nic_enabled_status_flag) {
                  now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                  //Automatically obtain ip
                  if (l_dom_radio_auto_obtain_ip.checked) {
                    now_net_info.ifs["ipv4"] = { conf: { enabled: now_ifs.ipv4.conf.enabled, mode: "dhcp", static_ip: "", debug_ip: "" } };
                  }
                  else if (l_dom_radio_use_following_ip.checked)//Manually set ip
                  {
                    now_net_info.ifs["ipv4"] = {
                      conf: {
                        enabled: now_ifs.ipv4.conf.enabled, mode: "static",
                        static_ip: {
                          addr: l_dom_input_following_ip_address.value, gw: l_dom_input_following_gateway.value,
                          mask: now_ifs.ipv4.conf.static_ip ? now_ifs.ipv4.conf.static_ip.mask : ""
                        },
                        debug_ip: now_ifs.ipv4.conf.debug_ip
                      }
                    };
                    if (subnet_mask_available_and_trans({ data: l_dom_input_following_subnet_mask.value }) >= 0)
                      now_net_info.ifs.ipv4.conf.static_ip.mask = l_dom_input_following_subnet_mask.value;
                    else {
                      _this.publicFunc.msg_tips({ msg: mcs_subnet_mask_wrong_format, type: "error", timeout: 3000 })
                      // system_pop_confirm_box({ alert: true, str: mcs_subnet_mask_wrong_format });
                      return;
                    }
                  }
                }
                else {
                  now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                }
              }
              else//Close Ethernet connection
              {
                if (count < 2) {
                  _this.publicFunc.msg_tips({ msg: mcs_not_allowed_close_two_network_cards, type: "error", timeout: 3000 })
                  // system_pop_confirm_box({ alert: true, str: mcs_not_allowed_close_two_network_cards });
                  return;
                }
                else
                  now_net_info["ifs"] = { token: now_ifs.token, enabled: 0 };
              }
            }
            else if (obj.type == mcs_wifi) {
              if (nic_switch_checkbox.checked) {
                if (l_nic_enabled_status_flag) {
                  now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                  //if(_this.publicFunc.mx("#nic_mode_switch_checkbox").checked)             //client
                  if (l_dom_select_wifi_mode[l_dom_select_wifi_mode.selectedIndex].text == mcs_client) {
                    now_net_info.ifs["phy"] = { conf: { mode: "wificlient", mtu: now_ifs.phy.conf.mtu } };
                    if (l_dom_radio_auto_obtain_ip.checked) {
                      now_net_info.ifs["ipv4"] = { conf: { enabled: now_ifs.ipv4.conf.enabled, mode: "dhcp", static_ip: "", debug_ip: "" } };
                    }
                    else if (l_dom_radio_use_following_ip.checked) {
                      now_net_info.ifs["ipv4"] = {
                        conf: {
                          enabled: now_ifs.ipv4.conf.enabled, mode: "static",
                          static_ip: {
                            addr: l_dom_input_following_ip_address.value, gw: l_dom_input_following_gateway.value,
                            mask: now_ifs.ipv4.conf.static_ip ? now_ifs.ipv4.conf.static_ip.mask : ""
                          },
                          debug_ip: now_ifs.ipv4.conf.debug_ip
                        }
                      };
                      if (subnet_mask_available_and_trans({ data: l_dom_input_following_subnet_mask.value }) >= 0)
                        now_net_info.ifs.ipv4.conf.static_ip.mask = l_dom_input_following_subnet_mask.value;
                      else {
                        _this.publicFunc.msg_tips({ msg: mcs_subnet_mask_wrong_format, type: "error", timeout: 3000 })
                        // system_pop_confirm_box({ alert: true, str: mcs_subnet_mask_wrong_format });
                        return;
                      }
                    }

                    if (_this.publicFunc.mx("#user_set_wifi_name").value !== "" || l_dom_select_network[l_dom_select_network.selectedIndex].text === mcs_input_wifi_name) { //如果是手动输入的话传递值取输入框中的内容 (后续添加判断选中值为手动输入)
                      now_net_info.ifs["wifi_client"] = {
                        conf: {
                          enabled: 1, ssid: _this.publicFunc.mx("#user_set_wifi_name").value,
                          usr: _this.publicFunc.mx("#user_set_wifi_name").value,
                          key: l_dom_select_network_password.value
                        }
                      };
                    } else {
                      now_net_info.ifs["wifi_client"] = {
                        conf: {
                          enabled: 1, ssid: l_dom_select_network[l_dom_select_network.selectedIndex].value,
                          usr: l_dom_select_network[l_dom_select_network.selectedIndex].value,
                          key: l_dom_select_network_password.value
                        }
                      };
                    }
                  }
                  else if (l_dom_select_wifi_mode[l_dom_select_wifi_mode.selectedIndex].text == mcs_ap)                                                   //adhoc
                  {
                    now_net_info.ifs["phy"] = { conf: { mode: "adhoc", mtu: now_ifs.phy.conf.mtu } };
                    now_net_info.ifs["dhcp_srv"] = {
                      conf: {
                        enabled: now_ifs.dhcp_srv.conf.enabled, gw: l_dom_input_ap_gateway.value,
                        ip_start: l_dom_input_ap_start_address.value, ip_end: l_dom_input_ap_end_address.value
                      }
                    }
                  }
                }
                else {
                  now_net_info["ifs"] = { token: now_ifs.token, enabled: 1 };
                }
              }
              else {
                if (count < 2) {
                  _this.publicFunc.msg_tips({ msg: mcs_not_allowed_close_two_network_cards, type: "error", timeout: 3000 })
                  // system_pop_confirm_box({ alert: true, str: mcs_not_allowed_close_two_network_cards });
                  return;
                }
                else
                  now_net_info["ifs"] = { token: now_ifs.token, enabled: 0 };
              }
            }
            if (l_nic_enabled_status_flag) {
              if (l_dom_radio_auto_obtain_dns.checked) {
                now_net_info["dns"] = { conf: { enalbed: obj.ori_net_info.dns.conf.enabled, mode: "dhcp", static_dns: obj.ori_net_info.dns.conf.static_dns } };
              }
              else if (l_dom_radio_use_following_dns.checked) {
                now_net_info["dns"] = {
                  conf: {
                    enalbed: obj.ori_net_info.dns.conf.enabled, mode: "static",
                    static_dns: [l_dom_input_following_dns.value, l_dom_input_following_alternate_dns.value]
                  }
                };
              }
            }
            console.log(_this.$store.state.jumpPageData.selectDeviceIpc,"sn")
            console.log(now_net_info.ifs,"networks")
            console.log(now_net_info.dns,"dns")
            console.log(l_dom_select_nic[l_dom_select_nic.selectedIndex].text,"select")
            _this.$api.set.set_network({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              networks: now_net_info.ifs,
              dns: now_net_info.dns,
              select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
            }).then(res => {
              ccm_net_set_ack(res)
            })
          }
          function ccm_net_set_ack (msg) {
            if (msg.type == "success") {
              _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
              l_refresh_timer = setInterval(function () {
                _this.$api.set.get_network({
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  select: msg.select
                }).then(res => {
                  dev_net_get_ack(res[0], res[1])
                })
              }, 3500);
            }
            else {
              _this.set_result(msg);
            }
          }
          function dev_net_get_ack (msg, ref) {
            _this.$store.state.jumpPageData.systemStopWait();
            clearInterval(l_refresh_timer);
            let net_info;
            net_info = msg.networks;
            if (net_info) {
              let i, length = net_info.length, inner_html = "";
              for (i = 0; i < length; ++i) {
                if (net_info[i].token == "eth0")
                  if (ref && ref.select == mcs_ethernet)
                    inner_html += "<option value ='" + i + "' selected='selected'>" + mcs_ethernet + "</option>";
                  else
                    inner_html += "<option value ='" + i + "'>" + mcs_ethernet + "</option>";
                else if (net_info[i].token == "ra0")
                  if (ref && ref.select == mcs_wifi)
                    inner_html += "<option value ='" + i + "' selected='selected'>" + mcs_wifi + "</option>";
                  else
                    inner_html += "<option value ='" + i + "'>" + mcs_wifi + "</option>";
              }
              $(l_dom_select_nic).html(inner_html);
              //Ethernet and wireless network selection
              l_dom_select_nic.change_value = function () {
                if (l_select_net == mcs_wifi) {
                  l_dom_select_nic[1].selected = true;
                  l_select_net = "";
                }
                else if (l_select_net == mcs_connnected) {
                  l_dom_select_nic[0].selected = true;
                  l_select_net = "";
                }
                $(l_dom_select_nic).tzSelect();
                l_nic_enabled_status_flag = 0;
                l_nic_conn_status_flag = 0;
                l_ip_is_DHCP = 0;
                //Select the Ethernet
                if (this[this.selectedIndex].text == mcs_ethernet) {
                  $(l_dom_button_setup).unbind();
                  generate_eth_setup_ex(net_info[this.selectedIndex]);
                }
                //Select a wireless network
                else if (this[this.selectedIndex].text == mcs_wifi) {
                  $(l_dom_button_setup).unbind();
                  generate_wireless_setup_ex(net_info[this.selectedIndex]);
                }
                if (msg.dns) {
                  if (msg.dns.info.stat == "ok") {
                    // if (!g_domain_oems_vimtag) background_img_set(_this.publicFunc.mx("#dns_status"), sub_img_status0);
                    _this.publicFunc.mx("#dns_status").setAttribute("title", mcs_connnected);
                  }
                  // else if (msg.dns.info.stat == "err") {
                  //   if (!g_domain_oems_vimtag) background_img_set(_this.publicFunc.mx("#dns_status"), sub_img_status1);
                  // }
                  if (msg.dns.conf.mode == "dhcp") {
                    //net_dns=msg.dns;
                    l_dom_input_auto_dns.value = msg.dns.info.dns[0] || "0.0.0.0";
                    if (msg.dns.info.dns.length > 1)
                      l_dom_input_auto_alternate_dns.value = msg.dns.info.dns[1] || "0.0.0.0";
                    l_dns_is_DHCP = 1;
                    _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_dns);
                  }
                  else if (msg.dns.conf.mode == "static") {
                    l_dom_input_following_dns.value = msg.dns.conf.static_dns[0] || "0.0.0.0";
                    if (msg.dns.conf.static_dns.length > 1)
                      l_dom_input_following_alternate_dns.value = msg.dns.conf.static_dns[1] || "0.0.0.0";
                    l_dns_is_DHCP = 0;
                    _this.publicFunc.trigger_click(l_dom_radio_use_following_dns);
                  }
                }
                // else {
                // }
                //Apply Click event
                $(l_dom_button_setup).bind("click", function () {
                  let ip_address, ip_refresh = "", origin_connected = "";
                  if (_this.$store.state.jumpPageData.selectDeviceIpc && _this.$store.state.jumpPageData.networkEnviron == "private")          //Direct Connect
                  {
                    if (l_origin_ethernet_addr == window.location.host) {
                      origin_connected = l_origin_ethernet_addr;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet && l_dom_radio_auto_obtain_ip.checked && !l_ip_is_DHCP) {
                        ip_refresh = origin_connected;
                      }
                    }
                    else if (l_origin_wireless_addr == window.location.host) {
                      origin_connected = l_origin_wireless_addr;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi && l_dom_radio_auto_obtain_ip.checked && !l_ip_is_DHCP) {
                        ip_refresh = origin_connected;
                      }
                    }
                    if (l_dom_radio_use_following_ip.checked) {
                      ip_address = l_dom_input_following_ip_address.value;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                        if ((ip_address != l_origin_ethernet_addr) && (origin_connected == l_origin_ethernet_addr))
                          ip_refresh = ip_address;
                      }
                      else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                        if ((ip_address != l_origin_wireless_addr) && (origin_connected == l_origin_wireless_addr))
                          ip_refresh = ip_address;
                      }
                    }
                  }
                  else {
                    if (l_dom_radio_auto_obtain_ip.checked) {
                      if (!l_ip_is_DHCP) {
                        if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                          ip_refresh = l_origin_wireless_addr;
                        }
                        else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                          ip_refresh = l_origin_ethernet_addr;
                        }
                      }
                    }
                    else if (l_dom_radio_use_following_ip.checked) {
                      ip_address = l_dom_input_following_ip_address.value;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                        if (ip_address != l_origin_wireless_addr)
                          ip_refresh = ip_address;
                      }
                      else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                        if (ip_address != l_origin_ethernet_addr)
                          ip_refresh = ip_address;
                      }
                    }
                  }
                  if (ip_refresh) {
                    let type = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).type;
                    if (type == "IPC" && _this.$store.state.jumpPageData.networkEnviron == "private" || type == "BOX")                //Direct Connect
                    {
                      _this.publicFunc.delete_tips(
                        {
                          content: mcs_modify_network_prompt, func: function () {
                            ccm_set_network_info_request({
                              type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                              ori_net_info: msg, to: ip_refresh + ":" + location.port,
                              select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                            })
                          }
                        })
                      // system_pop_confirm_box({
                      //   str: mcs_modify_network_prompt, callback_func: function () {
                      //     ccm_set_network_info_request({
                      //       type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                      //       ori_net_info: msg, to: ip_refresh + ":" + location.port, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                      //     });
                      //   }
                      // });
                    }
                    else                                                                                                //Through the server
                    {
                      _this.publicFunc.delete_tips(
                        {
                          content: mcs_modify_network_prompt, func: function () {
                            ccm_set_network_info_request(
                              {
                                type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                                ori_net_info: msg, to: ref.ip, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                              }
                            )
                          }
                        })
                      // system_pop_confirm_box({
                      //   str: mcs_modify_network_prompt, callback_func: function () {
                      //     ccm_set_network_info_request({
                      //       type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                      //       ori_net_info: msg, to: ref.ip, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                      //     });
                      //   }
                      // });
                    }
                  }
                  else {
                    _this.publicFunc.delete_tips(
                      {
                        content: mcs_modify_network_prompt, func: function () {
                          ccm_set_network_info_request(
                            {
                              type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                              ori_net_info: msg, to: ip_refresh, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                            }
                          )
                        }
                      })
                    // system_pop_confirm_box({
                    //   str: mcs_modify_network_prompt, callback_func: function () {
                    //     ccm_set_network_info_request({
                    //       type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                    //       ori_net_info: msg, to: ip_refresh, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                    //     });
                    //   }
                    // });
                  }
                });
              };
              l_dom_select_nic.change_value();
            }
            else {
              return -1;
            }
          }
          function get_network_ack (msg, ref) {
            let net_info;
            net_info = msg.networks;
            let deviceType // 设备类型(摄像头IPC/云盒子BOX)
            deviceType = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).type
            //console.log(msg, 'get_network_ack_msg')
            //console.log(deviceType, 'get_network_ack_deviceType')
            if (net_info) {
              let i, length = net_info.length, inner_html = "";
              for (i = 0; i < length; ++i) {
                if (net_info[i].token == "eth0") {
                  if (ref && ref.select == mcs_ethernet) {
                    inner_html += "<option value ='" + i + "' selected='selected'>" + mcs_ethernet + "</option>";
                  } else {
                    inner_html += "<option value ='" + i + "'>" + mcs_ethernet + "</option>";
                  }
                } else if (net_info[i].token == "ra0" && deviceType !== "BOX" && msg.wwan_exist != "existence") { // 云盒子和4G设备网络设置中不含有wifi配置
                  if (ref && ref.select == mcs_wifi) {
                    inner_html += "<option value ='" + i + "' selected='selected'>" + mcs_wifi + "</option>";
                  } else {
                    inner_html += "<option value ='" + i + "'>" + mcs_wifi + "</option>";
                  }
                }
              }
              $(l_dom_select_nic).html(inner_html);

              l_dom_select_nic.change_value = function () {
                if (l_select_net == mcs_wifi) {
                  l_dom_select_nic[1].selected = true;
                  l_select_net = "";
                }
                else if (l_select_net == mcs_connnected) {
                  l_dom_select_nic[0].selected = true;
                  l_select_net = "";
                }

                $(l_dom_select_nic).tzSelect();

                l_nic_enabled_status_flag = 0;
                l_nic_conn_status_flag = 0;
                l_ip_is_DHCP = 0;

                // Select the Ethernet
                if (this[this.selectedIndex].text == mcs_ethernet) {
                  $(l_dom_button_setup).unbind();
                  generate_eth_setup_ex(net_info[this.selectedIndex]);
                }
                //Select a wireless network
                else if (this[this.selectedIndex].text == mcs_wifi) {
                  $(l_dom_button_setup).unbind();
                  generate_wireless_setup_ex(net_info[this.selectedIndex]);
                }

                if (msg.dns) {
                  if (msg.dns.info.stat == "ok" && !_this.$store.state.jumpPageData.projectFlag) { // vimtag特有内容添加
                    if (_this.publicFunc.mx("#dns_status")) {
                      _this.publicFunc.mx("#dns_status").setAttribute("title", mcs_connnected);
                    }
                  }
                  // else if (msg.dns.info.stat == "err") {

                  // }
                  if (msg.dns.conf.mode == "dhcp") {
                    //net_dns=msg.dns;
                    l_dom_input_auto_dns.value = msg.dns.info.dns[0] || "0.0.0.0";
                    if (msg.dns.info.dns.length > 1)
                      l_dom_input_auto_alternate_dns.value = msg.dns.info.dns[1] || "0.0.0.0";
                    l_dns_is_DHCP = 1;
                    _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_dns);
                  }
                  else if (msg.dns.conf.mode == "static") {
                    l_dom_input_following_dns.value = msg.dns.conf.static_dns[0] || "0.0.0.0";
                    if (msg.dns.conf.static_dns.length > 1)
                      l_dom_input_following_alternate_dns.value = msg.dns.conf.static_dns[1] || "0.0.0.0";
                    l_dns_is_DHCP = 0;
                    _this.publicFunc.trigger_click(l_dom_radio_use_following_dns);
                  }
                }
                //Apply Click event
                $(l_dom_button_setup).bind("click", function () {
                  let ip_address, ip_refresh = "", origin_connected = "";
                  if (_this.$store.state.jumpPageData.selectDeviceIpc && _this.$store.state.jumpPageData.networkEnviron == "private")          //Direct Connect
                  {
                    if (l_origin_ethernet_addr == window.location.host) {
                      origin_connected = l_origin_ethernet_addr;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet && l_dom_radio_auto_obtain_ip.checked && !l_ip_is_DHCP) {
                        ip_refresh = origin_connected;
                      }
                    }
                    else if (l_origin_wireless_addr == window.location.host) {
                      origin_connected = l_origin_wireless_addr;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi && l_dom_radio_auto_obtain_ip.checked && !l_ip_is_DHCP) {
                        ip_refresh = origin_connected;
                      }
                    }
                    if (l_dom_radio_use_following_ip.checked) {
                      ip_address = l_dom_input_following_ip_address.value;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                        if ((ip_address != l_origin_ethernet_addr) && (origin_connected == l_origin_ethernet_addr))
                          ip_refresh = ip_address;
                      }
                      else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                        if ((ip_address != l_origin_wireless_addr) && (origin_connected == l_origin_wireless_addr))
                          ip_refresh = ip_address;
                      }
                    }
                  }
                  else {
                    if (l_dom_radio_auto_obtain_ip.checked) {
                      if (!l_ip_is_DHCP) {
                        if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                          ip_refresh = l_origin_wireless_addr;
                        }
                        else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                          ip_refresh = l_origin_ethernet_addr;
                        }
                      }
                    }
                    else if (l_dom_radio_use_following_ip.checked) {
                      ip_address = l_dom_input_following_ip_address.value;
                      if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_wifi) {
                        if (ip_address != l_origin_wireless_addr)
                          ip_refresh = ip_address;
                      }
                      else if (l_dom_select_nic[l_dom_select_nic.selectedIndex].text == mcs_ethernet) {
                        if (ip_address != l_origin_ethernet_addr)
                          ip_refresh = ip_address;
                      }
                    }
                  }
                  if (ip_refresh) {
                    let type = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).type;
                    if (type == "IPC" && _this.$store.state.jumpPageData.networkEnviron == "private" || type == "BOX")                //Direct Connect
                    {
                      _this.publicFunc.delete_tips(
                        {
                          content: mcs_modify_network_prompt, func: function () {
                            ccm_set_network_info_request(
                              {
                                type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                                ori_net_info: msg, to: ip_refresh + ":" + location.port,
                                select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                              }
                            )
                          }
                        })
                    }
                    else                                                                                                //Through the server
                    {
                      _this.publicFunc.delete_tips({
                        content: mcs_modify_network_prompt, func: function () {
                          ccm_set_network_info_request({
                            type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                            ori_net_info: msg, to: ref.ip, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                          })
                        }
                      })
                    }
                  }
                  else {
                    _this.publicFunc.delete_tips({
                      content: mcs_modify_network_prompt, func: function () {
                        ccm_set_network_info_request({
                          type: l_dom_select_nic[l_dom_select_nic.selectedIndex].text,
                          ori_net_info: msg, to: ip_refresh, select: l_dom_select_nic[l_dom_select_nic.selectedIndex].text
                        })
                      }
                    })
                  }
                });
              };
              l_dom_select_nic.change_value();
            }

          }
          //Load Ethernet interface
          function generate_eth_setup_ex (now_ifs) {
            $(l_dom_select_network_li).fadeOut();
            $("#nic_ap_mode_content").fadeOut();
            if (now_ifs.enabled) {
              l_nic_enabled_status_flag = 1;
              if (now_ifs.phy) {
                l_dom_input_mac_address.value = now_ifs.phy.info.mac;
                if (now_ifs.phy.info.stat == "ok") {
                  l_nic_conn_status_flag = 1;
                  if (now_ifs.ipv4) {
                    if (now_ifs.ipv4.info.stat === "ok" && !_this.$store.state.jumpPageData.projectFlag) { // vimtag特有内容添加
                      if (_this.publicFunc.mx("#ip_status")) {
                        _this.publicFunc.mx("#ip_status").setAttribute("title", mcs_connnected);
                      }
                    }
                    // else if (now_ifs.ipv4.info.stat == "err") {

                    // }
                    if (now_ifs.ipv4.conf.mode == "dhcp") {
                      l_ip_is_DHCP = 1;
                      l_dom_input_auto_ip_address.value = now_ifs.ipv4.info.ip.addr || "0.0.0.0";
                      l_dom_input_auto_subnet_mask.value = now_ifs.ipv4.info.ip.mask || "0.0.0.0";
                      l_dom_input_auto_gateway.value = now_ifs.ipv4.info.ip.gw || "0.0.0.0";
                      _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_ip);
                    }
                    else if (now_ifs.ipv4.conf.mode == "static") {
                      l_ip_is_DHCP = 0;
                      l_dom_input_following_ip_address.value = now_ifs.ipv4.conf.static_ip.addr || "0.0.0.0";
                      l_dom_input_following_subnet_mask.value = now_ifs.ipv4.conf.static_ip.mask || "0.0.0.0";
                      l_dom_input_following_gateway.value = now_ifs.ipv4.conf.static_ip.gw || "0.0.0.0";
                      _this.publicFunc.trigger_click(l_dom_radio_use_following_ip);
                    }
                    l_origin_ethernet_addr = l_ip_is_DHCP ? now_ifs.ipv4.info.ip.addr : now_ifs.ipv4.conf.static_ip.addr;
                  }
                } else if (now_ifs.internet) {
                  if (now_ifs.internet.info.stat == "err") {
                    l_nic_conn_status_flag = 0;
                    if (now_ifs.ipv4) {
                      if (now_ifs.ipv4.info.stat == "ok") {
                        _this.publicFunc.mx("#ip_status").setAttribute("title", mcs_connnected);
                      }
                      // else if (now_ifs.ipv4.info.stat == "err") {

                      // }
                      if (now_ifs.ipv4.conf.mode == "dhcp") {
                        l_ip_is_DHCP = 1;
                        l_dom_input_auto_ip_address.value = now_ifs.ipv4.info.ip.addr || "0.0.0.0";
                        l_dom_input_auto_subnet_mask.value = now_ifs.ipv4.info.ip.mask || "0.0.0.0";
                        l_dom_input_auto_gateway.value = now_ifs.ipv4.info.ip.gw || "0.0.0.0";
                        _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_ip);
                      }
                      else if (now_ifs.ipv4.conf.mode == "static") {
                        l_ip_is_DHCP = 0;
                        l_dom_input_following_ip_address.value = "0.0.0.0";
                        l_dom_input_following_subnet_mask.value = "0.0.0.0";
                        l_dom_input_following_gateway.value = "0.0.0.0";
                        _this.publicFunc.trigger_click(l_dom_radio_use_following_ip);
                      }
                      l_origin_ethernet_addr = l_ip_is_DHCP ? now_ifs.ipv4.info.ip.addr : now_ifs.ipv4.conf.static_ip.addr;
                    }
                  }
                }
              }
              $("#nic_switch_checkbox").iButton("toggle", true);
            }
            else {
              $("#nic_switch_checkbox").iButton("toggle", false);
            }
          }
          //Wireless mode switch
          l_dom_select_wifi_mode.change_value = function () {
            if (l_dom_select_wifi_mode[l_dom_select_wifi_mode.selectedIndex].text == mcs_client) {
              $("#nic_ap_mode_content").fadeOut(300);
              if (l_nic_conn_status_flag) {
                $("#nic_not_conn_content").fadeIn(450);
                l_dom_input_status.value = l_nic_wifi_con ? mcs_connnected : mcs_not_connected;
                $("#nic_conn_content").fadeIn(450, function () {
                  $("#manager_page").mCustomScrollbar("update");
                });
              }
              else {
                $("#nic_conn_content").fadeIn(450);
                l_dom_input_status.value = mcs_not_connected;
                $("#nic_not_conn_content").fadeIn(450, function () {
                  $("#manager_page").mCustomScrollbar("update");
                });
              }
              if (l_old_version) {
                network_Business.ctrl({ type: "ccm_get_wifi_list_request" });
                $(l_dom_button_setup).unbind();
                $(l_dom_button_setup).bind("click", l_swc_bind_func);
              }
              else {
                $(l_dom_select_network_li).fadeIn();
                $("#nic_not_conn_content").fadeIn(450);
                $("#nic_conn_content").fadeIn(450, function () {
                  $("#manager_page").mCustomScrollbar("update");
                });
              }
              l_dom_button_refresh.onclick();
            }
            else if (l_dom_select_wifi_mode[l_dom_select_wifi_mode.selectedIndex].text == mcs_ap) {
              $("#mac_address").fadeIn(450);
              $(l_dom_select_network_li).fadeOut();
              $("#nic_conn_content").fadeOut(300);
              $("#nic_not_conn_content").fadeIn(450);
              $("#nic_ap_mode_content").fadeIn(450, function () {
                $("#manager_page").mCustomScrollbar("update");
              });

              if (l_old_version) {
                $(l_dom_button_setup).unbind();
                $(l_dom_button_setup).bind("click", l_swc_bind_func);
              }
            }
          }
          function generate_wireless_setup_ex (now_ifs) {
            if (now_ifs.enabled) {
              l_nic_enabled_status_flag = 1;
              // l_network_token = now_ifs.token;
              if (now_ifs.phy && now_ifs.phy.conf && now_ifs.phy.info) {
                if (now_ifs.phy.info.stat == "ok") {
                  l_nic_conn_status_flag = 1;
                  if (now_ifs.phy.conf.mode == "wificlient") {
                    l_dom_select_wifi_mode[0].selected = true;
                    $(l_dom_select_wifi_mode).tzSelect();
                    l_dom_input_mac_address.value = now_ifs.phy.info.mac;
                    if (now_ifs.ipv4) {
                      if (now_ifs.ipv4.info.stat == "ok") {
                        _this.publicFunc.mx("#ip_status").setAttribute("title", mcs_connnected);
                      }
                      // else if (now_ifs.ipv4.info.stat == "err") {

                      // }
                      if (now_ifs.ipv4.conf.mode == "dhcp") {
                        l_ip_is_DHCP = 1;
                        l_dom_input_auto_ip_address.value = now_ifs.ipv4.info.ip.addr || "0.0.0.0";
                        l_dom_input_auto_subnet_mask.value = now_ifs.ipv4.info.ip.mask || "0.0.0.0";
                        l_dom_input_auto_gateway.value = now_ifs.ipv4.info.ip.gw || "0.0.0.0";
                        _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_ip);
                      }
                      else if (now_ifs.ipv4.conf.mode == "static") {
                        l_ip_is_DHCP = 0;
                        l_dom_input_following_ip_address.value = now_ifs.ipv4.conf.static_ip.addr || "0.0.0.0";
                        l_dom_input_following_subnet_mask.value = now_ifs.ipv4.conf.static_ip.mask || "0.0.0.0";
                        l_dom_input_following_gateway.value = now_ifs.ipv4.conf.static_ip.gw || "0.0.0.0";
                        _this.publicFunc.trigger_click(l_dom_radio_use_following_ip);
                      }
                      l_origin_wireless_addr = l_ip_is_DHCP ? now_ifs.ipv4.info.ip.addr : now_ifs.ipv4.conf.static_ip.addr;
                    }
                    l_dom_input_ap_start_address.value = "192.168.188.100";
                    l_dom_input_ap_end_address.value = "192.168.188.253";
                    l_dom_input_ap_gateway.value = "192.168.188.254";

                    l_dom_select_wifi_mode.change_value();
                  }
                  else if (now_ifs.phy.conf.mode == "adhoc") {
                    l_dom_select_wifi_mode[1].selected = true;
                    $(l_dom_select_wifi_mode).tzSelect();
                    if (now_ifs.dhcp_srv) {
                      l_dom_input_ap_start_address.value = now_ifs.dhcp_srv.conf.ip_start;
                      l_dom_input_ap_end_address.value = now_ifs.dhcp_srv.conf.ip_end;
                      l_dom_input_ap_gateway.value = now_ifs.dhcp_srv.conf.gw;

                      _this.publicFunc.mx("#ip_status").style.cssText = "";
                      l_dom_input_following_ip_address.value = "";
                      l_dom_input_following_subnet_mask.value = "";
                      l_dom_input_following_gateway.value = "";

                      if (now_ifs.ipv4.conf.mode == "dhcp") {
                        _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_ip);
                      }
                      else if (now_ifs.ipv4.conf.mode == "static") {
                        l_dom_input_following_ip_address.value = now_ifs.ipv4.conf.static_ip.addr || "0.0.0.0";
                        l_dom_input_following_subnet_mask.value = now_ifs.ipv4.conf.static_ip.mask || "0.0.0.0";
                        l_dom_input_following_gateway.value = now_ifs.ipv4.conf.static_ip.gw || "0.0.0.0";
                        _this.publicFunc.trigger_click(l_dom_radio_use_following_ip);
                      }
                    }
                    l_dom_select_wifi_mode.change_value();
                  }
                  else if (now_ifs.phy.conf.mode == "monitor") {
                    l_dom_select_wifi_mode[0].selected = true;
                    $(l_dom_select_wifi_mode).tzSelect();
                    //When in WiFi intelligent configuration mode, hide options
                    l_dom_select_wifi_mode.change_value();
                  }
                  if (now_ifs.wifi_client.ap_list) {
                    let i, length, signal_level = 0, inner_html = "",
                      wifi_list = now_ifs.wifi_client.ap_list;
                    inner_html += "<option>" + mcs_not_select + "</option>";
                    inner_html += "<option>" + mcs_input_wifi_name + "</option>"; // 手动输入
                    length = wifi_list.length;

                    if (now_ifs.wifi_client.info.stat == "ok") {
                      l_nic_wifi_con = 1;
                      _this.publicFunc.mx("#ssid_status").setAttribute("title", mcs_connnected);
                      _this.publicFunc.mx("/span", l_dom_select_network_password_li)[0].innerHTML = "";
                      for (i = 0; i < length; ++i) {
                        if (wifi_list[i].ssid == "") continue;
                        if (wifi_list[i].signal < 0) {
                          wifi_list[i].signal = wifi_list[i].signal + 100;
                        }
                        if (wifi_list[i].quality >= 0 && wifi_list[i].quality <= 100) {
                          signal_level = Math.floor(wifi_list[i].signal / 20);
                          signal_level = (signal_level >= 5 ? 4 : signal_level);
                        }
                        if (wifi_list[i].connect) {
                          inner_html += "<option value='" + wifi_list[i].ssid + "' selected='selected' front_img='/imgs/device_status_green.png' rear_img='/imgs/wifi_signal" + signal_level + ".png'>" + wifi_list[i].ssid + "</option>";
                        }
                        else {
                          inner_html += "<option value='" + wifi_list[i].ssid + "' rear_img='/imgs/wifi_signal" + signal_level + ".png'>" + wifi_list[i].ssid + "</option>";
                        }
                      }
                      l_dom_select_network_password.value = now_ifs.wifi_client.conf.key;
                    }
                    else {
                      $(l_dom_select_network_password_li).fadeIn("normal", function () {
                        $("#manager_page").mCustomScrollbar("update");
                      });
                      if (now_ifs.wifi_client.info.stat == "err" && now_ifs.wifi_client.usr) {
                        l_nic_wifi_con = 0;
                        _this.publicFunc.mx("#ssid_status").setAttribute("title", mcs_connect_fail);
                        _this.publicFunc.mx("/span", l_dom_select_network_password_li)[0].innerHTML = "&nbsp;&nbsp;&nbsp; " + mcs_connect_fail;
                      }
                      else if (now_ifs.wifi_client.info.stat == "info.connecting") {
                        _this.publicFunc.mx("#ssid_status").setAttribute("title", mcs_connecting);
                        _this.publicFunc.mx("/span", l_dom_select_network_password_li)[0].innerHTML = "&nbsp;&nbsp;&nbsp; " + mcs_connecting;
                      }
                      else
                        _this.publicFunc.mx("/span", l_dom_select_network_password_li)[0].innerHTML = "";
                      for (i = 0; i < length; ++i) {
                        if (wifi_list[i].ssid == "") continue;
                        if (wifi_list[i].signal < 0) {
                          wifi_list[i].signal = wifi_list[i].signal + 100;
                        }
                        if (wifi_list[i].quality >= 0 && wifi_list[i].quality <= 100) {
                          signal_level = Math.floor(wifi_list[i].signal / 20);
                          signal_level = (signal_level >= 5 ? 4 : signal_level);
                        }
                        if (wifi_list[i].ssid == now_ifs.wifi_client.conf.ssid) {
                          inner_html += "<option value='" + wifi_list[i].ssid + "' selected='selected' front_img='/imgs/device_status_yellow.png' rear_img='/imgs/wifi_signal" + signal_level + ".png'>" + wifi_list[i].ssid + "</option>";
                        }
                        else {
                          inner_html += "<option value='" + wifi_list[i].ssid + "' rear_img='/imgs/wifi_signal" + signal_level + ".png'><pre>" + wifi_list[i].ssid + "</pre></option>";
                        }
                      }
                    }
                    $(l_dom_select_network).html(inner_html);
                  }
                  $(l_dom_select_network).tzSelect(null, 1);

                }
                else if (now_ifs.phy.info.stat == "err") {
                  l_nic_conn_status_flag = 0;
                  _this.publicFunc.trigger_click(l_dom_radio_auto_obtain_ip);
                  $("#nic_mode_select").fadeOut();
                  $("#nic_ap_mode_content").fadeOut();
                  $(l_dom_select_network_li).fadeOut();
                  $("#nic_conn_content").fadeOut(300);
                  l_dom_input_status.value = mcs_fault;
                  $("#mac_address").fadeOut();
                  return;
                }
              }
              $("#nic_switch_checkbox").iButton("toggle", true);
            }
            else {
              $("#nic_switch_checkbox").iButton("toggle", false);
            }
          }
          add_network_event()
          async function net_get () {
            await _this.$api.set.get_network({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              // console.log(res, 'net_get_res')
              get_network_ack(res[0], res[1])
            })
          }
          net_get()
          break
        }
        case "osd": {
          info.dom.innerHTML =
            "<div id='osd_info'>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_display_text + "</div>"
            + "<div id='checkbox_display_name_div' class='options_float_right' style='margin-top:0px;'><input type='checkbox' id='checkbox_display_name'/></div>"
            + "</div>"
            + "<div id='input_display_name_content' class='list_right_item'>"
            + "<div class='attribute_key_text'>" + mcs_name + "</div>"
            // +   "<div class='options_float_right' style='margin-top:0px;'><input type='text' id='input_display_name' onkeyup=\"value=value.replace(/[^\a-\z\A-\Z]/g,'')\"onpaste=\"value=value.replace(/[^\a-\z\A-\Z]/g,'')\" oncontextmenu = \"value=value.replace(/[^\a-\z\A-\Z]/g,'')\" maxlength='16' class='normal_input_right'></input></div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input type='text' id='input_display_name' maxlength='16' class='normal_input_right'></input></div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_display_date + "</div>"
            + "<div id='checkbox_display_date_div' class='options_float_right' style='margin-top:0px;'><input type='checkbox' id='checkbox_display_date'/></div>"
            + "</div>"
            + "<div id='display_date_content' class='list_right_item'>"
            + "<div class='attribute_key_text'>" + mcs_date_format + "</div>"
            + "<div class='options_float_right' style='margin-top:0px;'>"
            + "<select id='select_date' style='margin-top:0px;'>"
            + "<option>MM-DD-YYYY</option>"
            + "<option>YYYY-MM-DD</option>"
            + "<option>DD-MM-YYYY</option>"
            + "</select>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_display_time + "</div>"
            + "<div id='checkbox_display_time_div' class='options_float_right' style='margin-top:0px;'><input type='checkbox' id='checkbox_display_time'/></div>"
            + "</div>"
            + "<div id='time_format_content' class='list_right_item'>"
            + "<div class='attribute_key_text'>" + mcs_time_format + "</div>"
            + "<div class='options_float_right' style='margin-top:0px;'>"
            + "<select id='select_hour' style='width:300px;'><option value='12h'>" + mcs_12_hour + "</option><option value='24h'>" + mcs_24_hour + "</option></select>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item_ex'>"
            + "<div class='attribute_key_text'>" + mcs_display_weeks + "</div>"
            + "<div id='checkbox_display_weeks_div' class='options_float_right' style='margin-top:0px;'><input type='checkbox' id='checkbox_display_weeks'/></div>"
            + "</div>"
            + "<div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>"
            + "</div>";
          let l_dom_checkbox_display_name = _this.publicFunc.mx("#checkbox_display_name");
          let l_dom_input_display_name = _this.publicFunc.mx("#input_display_name");
          let l_dom_checkbox_display_date = _this.publicFunc.mx("#checkbox_display_date");
          let l_dom_select_date = _this.publicFunc.mx("#select_date");
          let l_dom_checkbox_display_time = _this.publicFunc.mx("#checkbox_display_time");
          let l_dom_checkbox_display_weeks = _this.publicFunc.mx("#checkbox_display_weeks");
          let l_dom_select_hour = _this.publicFunc.mx("#select_hour");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_dom_input_display_name_content = _this.publicFunc.mx("#input_display_name_content");
          let l_dom_display_date_content = _this.publicFunc.mx("#display_date_content");
          let l_dom_time_format_content = _this.publicFunc.mx("#time_format_content");
          function osd_get_ack (data) {
            add_asd_event();
            if (data.text_enable) {
              $(l_dom_checkbox_display_name).iButton("toggle", true);
            }
            else {
              $(l_dom_checkbox_display_name).iButton("toggle", false);
            }
            l_dom_input_display_name.value = data.text;
            if (data.date_enable) {
              $(l_dom_checkbox_display_date).iButton("toggle", true);
              let i, length = l_dom_select_date.length;
              for (i = 0; i < length; ++i) {
                if (l_dom_select_date[i].text == data.date_format) {
                  l_dom_select_date[i].selected = true;
                }
              }
            }
            else {
              $(l_dom_checkbox_display_date).iButton("toggle", false);
            }
            if (data.time_enable) {
              $(l_dom_checkbox_display_time).iButton("toggle", true);
              if (data.time_12h)
                l_dom_select_hour[0].selected = true;
              else
                l_dom_select_hour[1].selected = true;
            }
            else {
              $(l_dom_checkbox_display_time).iButton("toggle", false);
            }
            if (data.week_enable) {
              $(l_dom_checkbox_display_weeks).iButton("toggle", true);
            } else {
              $(l_dom_checkbox_display_weeks).iButton("toggle", false);
            }
            $(l_dom_select_date).tzSelect();
            $(l_dom_select_hour).tzSelect();
          }
          function add_asd_event () {
            l_dom_input_display_name.onfocus = function () {
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_display_name.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_button_setup.onclick = function () {
              _this.$api.set.osd_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                text: l_dom_input_display_name.value,
                text_enable: Number(l_dom_checkbox_display_name.checked),
                week_enable: Number(l_dom_checkbox_display_weeks.checked),
                date_format: l_dom_select_date[l_dom_select_date.selectedIndex].text,
                date_enable: Number(l_dom_checkbox_display_date.checked),
                time_12h: Number(!l_dom_select_hour.selectedIndex),
                time_enable: Number(l_dom_checkbox_display_time.checked)
              }).then(res => {
                _this.set_result(res)
              })
            };
            $(l_dom_checkbox_display_name).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_checkbox_display_name.checked) {
                  //l_dom_input_display_name_content.style.display="inline";
                  $(l_dom_input_display_name_content).fadeIn();
                } else {
                  $(l_dom_input_display_name_content).fadeOut();
                }
              }
            });
            $(l_dom_checkbox_display_date).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_checkbox_display_date.checked) {
                  //l_dom_display_date_content.style.display="inline";
                  $(l_dom_display_date_content).fadeIn();
                } else {
                  $(l_dom_display_date_content).fadeOut();
                }
              }
            });
            $(l_dom_checkbox_display_time).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_checkbox_display_time.checked) {
                  //l_dom_time_format_content.style.display="inline";
                  $(l_dom_time_format_content).fadeIn();
                } else {
                  $(l_dom_time_format_content).fadeOut();
                }
              }
            });
            $(l_dom_checkbox_display_weeks).iButton({
              labelOn: "On",
              labelOff: "Off"
            });
          }
          _this.$api.set.osd_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            osd_get_ack(res)
          })
          break;
        }
        case "sdcord": {
          info.dom.innerHTML =
            "<div id = 'sd_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_enabled + "</span>"
            + "<div class = 'label_sd' >"
            // +             "<span id = 'label_text_left_sd' class = 'label_text_left'>ON</span>"
            + "<div id = 'label_img_sd' class = 'label_img'></div>"
            // +             "<span id = 'label_text_right_sd' class = 'label_text_right'>OFF</span>"
            + "</div>"
            + "</div>"
            + "<div id = 'open_switch'>"
            + "<div class = 'list_right_item'>"
            + "<span class = 'attribute_key_text'>" + mcs_status + "</span>"
            + "<div class='options_float_right'><input type='text' id='input_status' class='input_read_only'  disabled></input></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex' id='input_capacity_content'>"
            + "<span class = 'attribute_key_text'>" + mcs_capacity + "</span>"
            + "<div class='options_float_right'><input type='text' id='input_capacity' class='input_read_only' disabled></input></div>"
            + "</div>"
            // +          "<div class = 'list_right_item_ex' id='input_usage_content'>"
            // +             "<span class = 'attribute_key_text'>"+mcs_usage+"</span>"
            // +             "<div class='options_float_right'><input type='text' id='input_usage' class='input_read_only' disabled></input></div>"
            // +          "</div>"
            + "<div class = 'list_right_item' id='input_available_content'>"
            + "<span class = 'attribute_key_text'>" + mcs_valid + "</span>"
            + "<div class='options_float_right'><input type='text' id='input_available' class='input_read_only' disabled></input></div>"
            + "</div>"

            + "<div id='sd_describe'>"  //sd卡描述
            + "<div>" + mcs_sd_first + "</div>"
            + "<div>" + mcs_sd_nospace + "</div>"
            + "</div>"
            + "<div id='sd_export_link'>" + mcs_how_to_export_sd + "</div>"     //如何导出sd卡    
            + "<div id='sd_export_link_content'>" + mrs_login_please + "www." + _this.$store.state.jumpPageData.projectName + ".com," + mrs_sd_export_tips + "</div>"
            + "<div id='disk_describe'>" + mcs_hard_disk_title_1 + "</div>"//硬盘描述

            // +"<div id='sd_mode'>"
            //    +  "<div class='sd_display'>"
            //       +"<div class='menu_list_box_title2 menu_list_mode sd_mode_text'>"+mcs_mode+"</div>"
            //       +"<div class='menu_list_box'>"
            //        +"<div class='menu_list menu_list_children_mode' style=''><div class='list_name sd_mode_text'>"+mcs_normal_mode+"</div><div class='list_info'><div type='0' class='list_info_select list_info_select_img'></div></div></div>"
            //        +"<div class='menu_list menu_list_children_mode' style=''><div class='list_name sd_mode_text'>"+mcs_long_video_mode+"</div><div class='list_info'><div type='50' class='list_info_select list_info_select_img'></div></div></div>"
            //        +"<div class='menu_list menu_list_children_mode' style=''><div class='list_name sd_mode_text'>"+mcs_super_long_video_mode+"</div><div class='list_info'><div type='100' class='list_info_select list_info_select_img'></div></div></div>"
            //       +"</div>"
            //    +"</div>"
            // +"</div>"

            + "<div class = 'list_right_item_ex' id='format_content'>"
            + "<span class = 'attribute_key_text'>-" + mcs_format + "</span>"
            + "<input id='format_btn' type = 'button' class = 'list_right_button_ex options_float_right_button' value = " + mcs_format + ">"
            + "</div>"
            + "</div>"
            + "<input id='sd_apply' type = 'button' class = 'list_right_button' value = " + mcs_action_apply + ">"
            + "</div>";
          let l_dom_input_status = _this.publicFunc.mx("#input_status");
          let l_dom_input_capacity = _this.publicFunc.mx("#input_capacity");
          // let l_dom_input_usage      = _this.publicFunc.mx("#input_usage");
          let l_dom_button_format = _this.publicFunc.mx("#format_btn");
          let l_dom_button_umount = _this.publicFunc.mx("#unmount_btn");
          let l_dom_disk_button_setup = _this.publicFunc.mx("#sd_apply");
          let l_dom_input_available = _this.publicFunc.mx("#input_available");
          // let l_dom_input_usage      = _this.publicFunc.mx("#input_usage");
          let l_dom_format_content = _this.publicFunc.mx("#format_content");
          // let l_dom_umount_content   = _this.publicFunc.mx("#umount_content");
          let l_dom_input_capacity_content = _this.publicFunc.mx("#input_capacity_content");
          // let l_dom_input_usage_content    = _this.publicFunc.mx("#input_usage_content");
          let l_dom_input_available_content = _this.publicFunc.mx("#input_available_content");
          let l_dom_label_text_right_sd = _this.publicFunc.mx("#label_text_right_sd");
          let l_dom_label_img_sd = _this.publicFunc.mx("#label_img_sd");
          // let l_dom_label_text_left_sd = _this.publicFunc.mx("#label_text_left_sd");
          let l_dom_open_switch = _this.publicFunc.mx("#open_switch");
          let l_dom_disk_switch_checkbox = _this.publicFunc.mx("#disk_switch_checkbox");
          let l_dom_labels = _this.publicFunc.mx(".label_sd");
          // let l_dom_sd_mode = _this.publicFunc.mx("#sd_mode"); 
          // let record_mode;
          let g_switch_flag = 1;
          $(l_dom_format_content).hide();
          $(l_dom_input_capacity_content).hide();
          // $(l_dom_input_usage_content).hide();
          $(l_dom_input_available_content).hide();
          // $(l_dom_sd_mode).hide();
          // $(".list_info_select_img").css({"margin-top":"0rem"});
          //sd卡后加
          let l_dom_sd_describe = _this.publicFunc.mx("#sd_describe");
          let l_dom_sd_export_link = _this.publicFunc.mx("#sd_export_link");
          let l_dom_sd_export_link_content = _this.publicFunc.mx("#sd_export_link_content");
          let l_dom_disk_describe = _this.publicFunc.mx("#disk_describe");
          $(l_dom_sd_describe).hide();
          $(l_dom_disk_describe).hide();
          $(l_dom_sd_export_link).hide();
          $(l_dom_sd_export_link_content).hide();

          function add_sd_event () {
            // let length = _this.publicFunc.mx(".list_info_select").length; 
            // for(let i = 0; i < length; i++){
            //     _this.publicFunc.mx(".list_info_select")[i].onclick = function(){
            //     record_mode = this.getAttribute("type");  
            //     $(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img');
            //     $(this).removeClass('list_info_select_img').addClass('list_info_clickselect_img');
            //     }
            // }
            l_dom_labels[0].onclick = function () {
              if (g_switch_flag == 0) {
                g_switch_flag = 1;
                $(l_dom_label_text_right_sd).fadeOut("fast");
                $(l_dom_label_img_sd).animate({ marginRight: "0px" });
                $(l_dom_labels).removeClass("switch_close_color")
                // $(l_dom_labels).css({ "background": "#00a6ba" }); //修改了这里 
                // $(l_dom_label_text_left_sd).fadeIn("fast");
                $(l_dom_open_switch).fadeIn("slow");
              }
              else {
                g_switch_flag = 0;
                $(l_dom_label_text_right_sd).fadeIn("fast");
                $(l_dom_labels).addClass("switch_close_color")
                // $(l_dom_labels).css({ "background": "#dedede" }); //修改了这里
                $(l_dom_label_img_sd).animate({ marginRight: "40px" });
                // $(l_dom_label_text_left_sd).fadeOut("fast");
                $(l_dom_open_switch).fadeOut("slow");
              }
            };
            //sd card format button
            l_dom_button_format.onclick = function () {
              let flag = (g_switch_flag == 1) ? 1 : 0;
              _this.publicFunc.delete_tips({
                content: mcs_format_prompt, func: function () {
                  _this.$api.set.sd_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "format", flag: flag }).then(res => {
                    _this.set_result(res)
                  })
                }
              })
            }
            //Application of key events
            l_dom_disk_button_setup.onclick = function () {
              let flag = (g_switch_flag == 1) ? 1 : 0;
              _this.$api.set.sd_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "", flag: flag }).then(res => {
                _this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
              })
            }
            l_dom_sd_export_link.onclick = function () {
              $(l_dom_sd_export_link_content).show();
            }

          }

          function sdcord_get_ack (msg) {
            // console.log(msg, 'sdcord_get_ack_msg')
            $(l_dom_format_content).hide();
            $(l_dom_input_available_content).hide();
            $(l_dom_input_capacity_content).hide();
            // $(l_dom_input_usage_content).hide();
            if (msg) {

              // if(msg.conf){ 注销 修改sd卡同手机
              //   record_mode = msg.conf.record_mode;
              //   if(msg.conf.record_mode == 0){
              //     _this.publicFunc.mx(".list_info_select_img")[0].click();
              //   }else if(msg.conf.record_mode == 50){
              //     _this.publicFunc.mx(".list_info_select_img")[1].click();
              //   }else if(msg.conf.record_mode == 100){
              //     _this.publicFunc.mx(".list_info_select_img")[2].click();
              //   }
              // }
              l_dom_input_capacity.value = msg.capacity + "MB";
              // l_dom_input_usage.value     =  msg.usage +"MB";
              l_dom_input_available.value = msg.availableSize + "MB";
              // According to sd card status display button
              switch (msg.status) {
                case "empty":
                  {
                    l_dom_input_status.value = msg.no_sdcard;
                    break;
                  }
                case "ro":
                case "readonly":
                  {
                    l_dom_input_status.value = mcs_fault;
                    $(l_dom_repair_content).show();
                    $(l_dom_format_content).show();
                    break;
                  }
                case "mount":
                  {
                    l_dom_input_status.value = mcs_connnected;
                    $(l_dom_input_capacity_content).show();
                    // $(l_dom_input_usage_content).show();
                    $(l_dom_input_available_content).show();
                    // $(l_dom_umount_content).show();
                    $(l_dom_format_content).show();
                    // $(l_dom_sd_mode).show();
                    if (info.list_name == "SD卡") {
                      $(l_dom_sd_describe).show();
                      $(l_dom_sd_export_link).show();
                    } else if (info.list_name == "硬盘") {
                      $(l_dom_disk_describe).show();
                    }

                    break;
                  }
                case "repairing":
                  {
                    l_dom_input_status.value = mcs_repairing;
                    break;
                  }
                case "formating":
                  {
                    l_dom_input_status.value = mcs_formating;
                    break;
                  }
                case "umount":
                  {
                    l_dom_input_status.value = mcs_unmounted;
                    break;
                  }
                case "mounting":
                  {
                    l_dom_input_status.value = mcs_loading;
                    break;
                  }
              }
              if (msg.enable) {
                g_switch_flag = 1;
                $(l_dom_label_text_right_sd).fadeOut("fast");
                $(l_dom_labels).removeClass("switch_close_color")
                // $(l_dom_labels).css({ "background": "#00a6ba" });//修改了这里
                $(l_dom_label_img_sd).animate({ marginRight: "0px" });
                // $(l_dom_label_text_left_sd).fadeIn("fast");
                $(l_dom_open_switch).fadeIn("slow");
              } else {
                g_switch_flag = 0;
                $(l_dom_label_text_right_sd).fadeIn("fast");
                $(l_dom_labels).addClass("switch_close_color")
                // $(l_dom_labels).css({ "background": "#dedede" });//修改了这里
                $(l_dom_label_img_sd).animate({ marginRight: "40px" });
                // $(l_dom_label_text_left_sd).fadeOut("fast");
                $(l_dom_open_switch).fadeOut("slow");
              }
            }
            else {
              l_dom_input_status.value = mcs_not_connected;
              // $(l_dom_umount_content).hide();
              $(l_dom_format_content).hide();
            }
          }
          add_sd_event();
          _this.$api.set.sd_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            sdcord_get_ack(res)
          })
          break;
        }
        case "storage_device": { // 存储设备
          info.dom.innerHTML =
            "<div id = 'storage_device_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_enabled + "</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='storage_device_switch_checkbox' type='checkbox' checked/></div>"
            + "</div>"
            + "<div id = 'storage_device_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_device_id + "</div>"
            + "<div class='options_float_right'><input type='text' id='input_device_id' class='list_right_input'></input></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'><label for='input_password'>" + mcs_password + "</label></div>"
            + "<div class='options_float_right'>"
            + "<input type='password' name='input_password' id='input_password' class='list_right_input'></input>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_network_status + "</div>"
            + "<div class='options_float_right'><input type='text' id='input_status' value='" + mcs_not_connected + "' class='input_read_only' disabled></input></div>"
            + "</div>"
            + "</div>"
            + "<button id='storage_device_button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>";
          let l_dom_input_device_id = _this.publicFunc.mx("#input_device_id");
          let l_dom_input_password = _this.publicFunc.mx("#input_password");
          let l_dom_storage_device_button_setup = _this.publicFunc.mx("#storage_device_button_setup");
          let l_dom_storage_device_content = _this.publicFunc.mx("#storage_device_content");
          let l_dom_input_status = _this.publicFunc.mx("#input_status");
          let l_dom_storage_device_switch_checkbox = _this.publicFunc.mx("#storage_device_switch_checkbox");
          $(l_dom_storage_device_switch_checkbox).iButton({
            labelOn: "On",
            labelOff: "Off",
            change: function () {
              if (l_dom_storage_device_switch_checkbox.checked) {
                $(l_dom_storage_device_content)[0].style.display = "inline";
              }
              else {
                $(l_dom_storage_device_content).fadeOut();
              }
            }
          });
          function add_storage_device_event () {
            // 点击应用按钮 调用函数
            l_dom_storage_device_button_setup.onclick = function () {
              if (_this.$store.state.user.guest) {
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
              } else {
                let flag = _this.publicFunc.mx("#storage_device_switch_checkbox").checked ? 1 : 0;
                if (flag) {
                  if (!l_dom_input_device_id.value) {
                    _this.publicFunc.msg_tips({ msg: mcs_blank_device_id, type: "warning", timeout: 3000 })
                    return;
                  }
                  if (!l_dom_input_password.value) {
                    _this.publicFunc.msg_tips({ msg: mcs_the_password_is_empty, type: "warning", timeout: 3000 })
                    return;
                  } else {
                    let reg = /^\S{6,20}$|admin/;
                    if (!reg.exec(l_dom_input_password.value)) {
                      _this.publicFunc.msg_tips({ msg: mcs_password_demand, type: "warning", timeout: 3000 })
                      return;
                    }
                  }
                }
                _this.$api.set.storage_device_set({
                  box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  enable: flag,
                  username: l_dom_input_device_id.value,
                  password: l_dom_input_password.value
                }).then(res => {
                  _this.set_result(res)
                })
              }
            };
          }
          function storage_device_get_ack (msg) {
            l_dom_input_device_id.value = msg.conf.conf[0].username;  //show the BOX ID
            l_dom_input_password.value = msg.conf.conf[0].password; //show the BOX  password
            if (msg.conf.connect == 1) {
              l_dom_input_status.value = mcs_connnected;
            }
            if (msg.conf.conf[0].enable == 0) {
              $(l_dom_storage_device_switch_checkbox).iButton("toggle", false);
            }
          }
          add_storage_device_event();
          _this.$api.set.storage_device_get({ box_sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            storage_device_get_ack(res)
          })
          break;
        }
        case "accessory": { //外设
          info.dom.innerHTML =
            "<div id='scene_devices_list' class = 'list_right_box'></div>";
          let l_dom_scene_devices_list = _this.publicFunc.mx("#scene_devices_list");
          let l_sence_data;
          // let l_select_scene;
          let l_conf;

          function accessory_create_move_page (obj, index) {
            if (window.fujikam !== "fujikam") {
              let add_device_page_height;
              if (document.getElementById("create_setting_page_left")) {
                add_device_page_height = document.getElementById("create_setting_page_left").offsetHeight + 120;
              } else {
                add_device_page_height = document.getElementById("page").offsetHeight + 100;
              }
              $("#add_device_page").css('height', add_device_page_height);
            }
            $("#add_device_page").show();
            // let l_dom_attachmen_box_close;
            // let l_dom_attachmen_event_ico;
            let data = obj[1].dev[index];
            let l_obj = obj;
            let l_attachmen_id = data.id;
            let dev_type = data.type
            let scene_class, dev_type_name
            let dev_video_set_page
            // let in_ico = "", out_ico = "";
            // let dev_f;
            // let in_num, out_num;
            let motion_track = _this.g_motion_track;
            let motion_track_switch, face_detect_switch;//human_detect_switch

            if (dev_type == 1) {
              scene_class = 'attachmen_info_img_move';
              dev_type_name = mcs_motion_detection;
              dev_video_set_page =
                "<div class='menu_switch' id='mobile_tracking_switch_box' style='height: 4.4rem; width: 100%;background-color: #fff;margin-top: 30px'>"
                + "<div class='list_name' id='menu_name_switch' style='color:#333;float: left;height: 4.4rem;line-height: 4.4rem;'>" + mcs_mobile_tracking + "</div>"
                + "<div class='list_info'><input id='mobile_tracking_switch' type='checkbox'></div>"
                + "</div>"//智能追踪
                + "<div class='attachmen_set_list_title'>" + mcs_motion_detection_sensitivity + "</div>"
                + "<div id='attachmen_door_day'>"
                + "<div id='attachmen_day_img'></div>"
                + "<div id='attachmen_day_text'>" + mcs_daytime + "</div>"
                + "<div class='options_float_right' style='width:500px;'>"
                + "<label for='input_threshold'></label>"
                + "<input name='slider' type='text' id='input_threshold' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'></input>"
                + "</div>"
                + "</div>"
                + "<div id='attachmen_door_night'>"
                + "<div id='attachmen_night_img'></div>"
                + "<div id='attachmen_night_text'>" + mcs_night + "</div>"
                + "<div class='options_float_right' style='width:500px;'>"
                + "<label for='input_thresholdLevelNight'></label>"
                + "<input name='slider' type='text' id='input_thresholdLevelNight' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'></input>"
                + "</div>"
                + "</div>"
            } else if (dev_type == 5) { //紧急按钮
              scene_class = 'attachmen_info_img_sos';
              dev_type_name = mcs_sos;
              dev_video_set_page =
                "<div class='attachmen_set_list_title' style='display:none;'>" + mcs_record + "</div>"
                + "<div id='attachmen_video' style='display:none'>"
                + "<div id='attachmen_video_img'></div>"
                + "<div id='attachmen_video_text'>" + mcs_record_time + "</div>"
                + "<div id='attachmen_video_time'><input id='attachmen_video_time_input' type='text' value='00'></div>"
                + "</div>"
            } else if (dev_type == 6) { //门磁
              scene_class = 'attachmen_info_img_door';
              dev_type_name = mcs_magnetic;
              dev_video_set_page =
                "<div class='attachmen_set_list_title' style='display:none;'>" + mcs_record + "</div>"
                + "<div id='attachmen_video' style='display:none;'>"
                + "<div id='attachmen_video_img'></div>"
                + "<div id='attachmen_video_text'>" + mcs_record_time + "</div>"
                + "<div id='attachmen_video_time'><input id='attachmen_video_time_input' type='text' value='00'></div>"
                + "</div>"
            } else if (dev_type == 8) {
              scene_class = 'scene_list_face';
              dev_type_name = mcs_face_detection;
              dev_video_set_page =
                "<div class='menu_switch' id='face_detection_switch_box' style='height: 4.4rem; width: 100%;background-color: #fff;margin-top: 30px'>"
                + "<div class='list_name' id='menu_face_switch' style='float: left;height: 4.4rem;line-height: 4.4rem;'>" + mcs_face_detection_frame + "</div>"
                + "<div class='list_info'><input id='face_detection_switch' type='checkbox'></div>"
                + "</div>"
            } else if (dev_type == 9) { //声音检测 
              scene_class = 'scene_list_sound';
              dev_type_name = mcs_sound_detection;
              dev_video_set_page =
                "<div class='attachmen_set_list_title'>" + mcs_sound_sensitivity + "</div>"
                + "<div id='attachmen_door_day'>"
                + "<div id='attachmen_sound_img'></div>"
                + "<div id='attachmen_day_text'>" + mcs_sound + "</div>"
                + "<div class='options_float_right' style='width:500px;'>"
                + "<label for='input_threshold'></label>"
                + "<input name='slider' type='text' id='input_sound_threshold' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'></input>"
                + "</div>"
                + "</div>"
            }
            // else if(dev_type == 10){ //人型检测
            //       scene_class = 'scene_list_human_detector';
            //       dev_type_name = mrs_human_detection; 
            //       dev_video_set_page = 
            //      "<div class='menu_switch' id='face_detection_switch_box' style='height: 4.4rem; width: 100%;background-color: #fff;margin-top: 30px'>" 
            //         +"<div class='list_name' id='menu_face_switch' style='float: left;height: 4.4rem;line-height: 4.4rem;'>"+mrs_human_detection_frame+"</div>"
            //         +"<div class='list_info'><input id='human_detection_switch' type='checkbox'></div>"
            //      +"</div>"
            // }
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"
              + "<div id='attachmen_box_main'>"
              + "<div id='attachmen_info'>"
              + "<div id='attachmen_info_img' class='" + scene_class + "'></div>"
              + "<div id='attachmen_info_text'>"
              + "<div id='attachmen_info_list'>"
              + "<div id='attachmen_info_type'>" + dev_type_name + "</div>"
              + "</div>"
              + "<div id='attachmen_info_sn'>ID:" + data.id + "</div>"
              + "</div>"
              + "<div class='attachmen_set_list'>" + dev_video_set_page + "</div>"
              + "<div id='attachmen_btn_box'>"
              + "<div id='attachmen_btn_submit'>" + mcs_apply + "</div>"
              + "<div id='attachmen_btn_del'>" + mcs_delete + "</div>"
              + "</div>"
              + "</div>"
              + "</div>"
              + "<div id='attachmen_del_box'>"
              + "<div id='attachmen_del_box_text'>" + mcs_are_you_sure_delete + "</div>"
              + "<div id='attachmen_del_box_ok'>" + mcs_ok + "</div>"
              + "<div id='attachmen_del_box_cancel'>" + mcs_cancel + "</div>"
              + "</div>"
              + "</div>";
            let l_dom_menu_swicth = _this.publicFunc.mx("#mobile_tracking_switch_box");
            let l_dom_face_detection_switch_box = _this.publicFunc.mx("#face_detection_switch_box");
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            let l_dom_attachmen_event_ico = _this.publicFunc.mx(".attachmen_event_ico");
            let l_dom_input_threshold = _this.publicFunc.mx("#input_threshold");
            let l_dom_input_sound_threshold = _this.publicFunc.mx("#input_sound_threshold");
            let l_dom_attachmen_btn_submit = _this.publicFunc.mx("#attachmen_btn_submit");
            let l_dom_input_thresholdLevelNight = _this.publicFunc.mx("#input_thresholdLevelNight");
            let l_dom_attachmen_video_time_input = _this.publicFunc.mx("#attachmen_video_time_input");
            let l_dom_attachmen_btn_del = _this.publicFunc.mx("#attachmen_btn_del");
            let l_dom_attachmen_del_box_ok = _this.publicFunc.mx("#attachmen_del_box_ok");
            let l_dom_attachmen_del_box_cancel = _this.publicFunc.mx("#attachmen_del_box_cancel");
            let l_dom_attachmen_del_box = _this.publicFunc.mx("#attachmen_del_box");
            let l_dom_mobile_tracking_switch = _this.publicFunc.mx("#mobile_tracking_switch");
            $(l_dom_mobile_tracking_switch).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_mobile_tracking_switch.checked) {
                  motion_track_switch = 1;
                } else {
                  motion_track_switch = 0;
                }
              }
            });

            if (motion_track != 1) {
              if (l_dom_menu_swicth) {
                l_dom_menu_swicth.style.display = 'none'
              }
            }
            let l_dom_face_detection_switch = _this.publicFunc.mx("#face_detection_switch");
            $(l_dom_face_detection_switch).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_face_detection_switch.checked) {
                  face_detect_switch = 1;
                } else {
                  face_detect_switch = 0;
                }
              }
            })
            if (dev_type == 5 || dev_type == 6) { // 外设紧急按钮和门磁 只可以删除设备隐藏应用
              $("#attachmen_btn_submit").hide();
            }
            if (dev_type == 1 || dev_type == 8 || dev_type == 9) {  //人形检测 ||dev_type==10
              $("#attachmen_btn_del").hide();
            }
            l_dom_attachmen_btn_del.onclick = function () {
              $("#attachmen_btn_del").hide();
              $("#attachmen_del_box").show();
            }
            l_dom_attachmen_del_box_ok.onclick = function () {
              _this.$api.set.exdev_del({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                id: l_attachmen_id
              }).then(res => {
                if (res && res.result === "") {
                  console.log('enter this')
                  $("#add_device_page").hide()
                  _this.create_right_page(info)
                }
              })
            }
            l_dom_attachmen_del_box_cancel.onclick = function () {
              $("#attachmen_del_box").hide();
              $("#attachmen_btn_del").show();
            }
            l_dom_attachmen_box_close.onclick = function () {
              _this.$api.set.scene_get({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                scene_get_ack(res)
              })
              $("#add_device_page").hide();
            }

            l_dom_attachmen_btn_submit.onclick = function () {
              if (dev_type == 1 || dev_type == 8 || dev_type == 9) {
                let conf = l_conf;
                conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
                conf.io_input = "Open";
                conf.io_output = "Open";
                conf.ref = { data: l_obj, id: l_attachmen_id };
                if (dev_type == 1) {
                  conf.sensitivity = l_dom_input_threshold.value;
                  conf.night_sensitivity = l_dom_input_thresholdLevelNight.value;
                  conf.motion_track_switch = motion_track_switch;
                }
                else if (dev_type == 9) {
                  conf.audio_level = l_dom_input_sound_threshold.value;
                }
                else if (dev_type == 8) {
                  conf.face_detect_switch = face_detect_switch;
                }
                _this.$api.set.alarm_device_set(conf).then(res =>{
                  _this.set_result(res)
                })
              }
              else {
                _this.$api.set.exdev_get({
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  id: data.id,
                  flag: 3,
                  start: 0,
                  counts: 1
                }).then(res => {
                  if (res && res.result == "") {
                    let dev_in, dev_out;
                    for (let i = 0; i < l_obj.length; i++) {
                      if (l_obj[i].name == "out") {
                        dev_out = l_obj[i].dev[index].flag;
                      } else if (l_obj[i].name == "in") {
                        dev_in = l_obj[i].dev[index].flag;
                      }
                    }
                    let dev = res.data.devs[0];
                    dev.flag = [dev_out, dev_in];
                    let rtime = l_dom_attachmen_video_time_input.value > 8 ? l_dom_attachmen_video_time_input.value : 8;
                    dev.rtime = parseInt(rtime) * 1000;
                    _this.$api.set.exdev_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      dev: dev
                    }).then(res => {
                      console.log('click this')
                      if (res.result === "") {
                        $("#add_device_page").hide();
                        _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                      } else if (res.result === "permission.denied") {
                        _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                      } else {
                        _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                      }
                    })
                  }
                })
              }
            }
            fdSliderController.create();

            function alarm_get_ack (msg) {
              l_conf = msg;
              if (msg && msg.result == "") {
                if (l_dom_input_thresholdLevelNight)
                  fdSliderController.increment("input_thresholdLevelNight", msg.night_sensitivity - l_dom_input_thresholdLevelNight.value);
                if (l_dom_input_threshold)
                  fdSliderController.increment("input_threshold", msg.sensitivity - l_dom_input_threshold.value);
                if (l_dom_input_sound_threshold)
                  fdSliderController.increment("input_sound_threshold", msg.audio_level - l_dom_input_sound_threshold.value);
                if (msg.motion_track_switch == 1) {
                  $(l_dom_mobile_tracking_switch).iButton("toggle", true);
                } else {
                  $(l_dom_mobile_tracking_switch).iButton("toggle", false);
                }
                if (msg.face_detect_switch == 1) {
                  $(l_dom_face_detection_switch).iButton("toggle", true);
                } else {
                  $(l_dom_face_detection_switch).iButton("toggle", false);
                }
              }
            }
            function exdev_get_ack (msg) {
              if (msg && msg.result == "") {
                l_dom_attachmen_video_time_input.value = msg.data.devs[0].rtime / 1000;
              } else if (msg.result == "permission.denied") {
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
              }
            }
            if (dev_type == 1 || dev_type == 2 || dev_type == 9 || dev_type == 8) { // ||dev_type==10
              _this.$api.set.alarm_device_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, flag: 1 }).then(res => {
                alarm_get_ack(res)
              })
            } else {
              _this.$api.set.exdev_get({
                flag: 3,
                start: 0,
                counts: 100,
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                id: l_attachmen_id
              }).then(res => {
                exdev_get_ack(res)
              })
            }
          }

          function scene_list_event () {
            let l_dom_option_scene_list = _this.publicFunc.mx(".option_scene_list");
            let l_dom_option_scene_list_add = _this.publicFunc.mx("#option_scene_list_add");
            for (let i = 0; i < l_dom_option_scene_list.length; i++) {
              l_dom_option_scene_list[i].index = i;
              l_dom_option_scene_list[i].onclick = function () {
                // let type = this.getAttribute("attachmen_type");
                let index = this.index;  // 4 ,8 ,9声音检测页面...     
                // if(type==1){
                //     accessory_create_move_page(l_sence_data,index);
                // }else if(type==2){
                //     accessory_create_move_page(l_sence_data,index);
                // }else if(type==5||type==6){
                //     accessory_create_move_page(l_sence_data,index);
                // }else if(type==8){ 
                //   accessory_create_move_page(l_sence_data,index);
                // }else if(type==9){ 
                //   accessory_create_move_page(l_sence_data,index);
                // }else if(type==10){ //人型检测
                //   accessory_create_move_page(l_sence_data,index);
                // }
                accessory_create_move_page(l_sence_data, index);
              }
            }
            l_dom_option_scene_list_add.onclick = function () {
              create_scene_add_page();
            }
          }
          function create_scene_result_page (obj) {
            let content_img, content_text, content_btn;
            if (obj.result) {
              content_img = "background:url(" + require("@/assets/device/success.png") + ") no-repeat;";
              content_text = mcs_add_successfully;
              content_btn = mcs_ok;
            } else {
              content_img = "background:url(" + require("@/assets/device/fail.png") + ") no-repeat;"
              content_text = mcs_add_failed;
              content_btn = mcs_action_retry;
            }
            info.dom.innerHTML =
              "<div id='option_attachmen_result_box'>"
              + "<div id='option_attachmen_result_title'>"
              + "<div id='option_attachmen_result_back'></div>"
              + "<div id='option_attachmen_search_result_text'>" + mcs_add_accessory + "</div>"
              + "</div>"
              + "<div id='option_attachmen_result_content'>"
              + "<div id='option_attachmen_result_content_img' style='" + content_img + "''></div>"
              + "<div id='option_attachmen_result_content_text'>" + content_text + "</div>"
              + "</div>"
              + "<div id='option_attachmen_result_submit'>" + content_btn + "</div>"
              + "</div>"
            let l_dom_option_attachmen_result_submit = _this.publicFunc.mx("#option_attachmen_result_submit");
            let l_dom_option_attachmen_result_back = _this.publicFunc.mx("#option_attachmen_result_back");
            l_dom_option_attachmen_result_submit.onclick = function () {
              _this.create_right_page(info)
            }
            l_dom_option_attachmen_result_back.onclick = function () {
              create_scene_edit_name_page(obj);
            }
          }
          function create_scene_edit_name_page (obj) {
            info.dom.innerHTML =
              "<div id='option_attachmen_edit_box'>"
              + "<div id='option_attachmen_edit_title'>"
              + "<div id='option_attachmen_edit_back'></div>"
              + "<div id='option_attachmen_search_title_text'>" + mcs_add_accessory + "</div>"
              + "</div>"
              + "<div id='option_attachmen_edit_content'>"
              + "<div id='option_attachmen_edit_content_id'>" + mcs_device_id + ":" + obj.id + "</div>"
              + "<div id='option_attachmen_edit_content_nick'><input type='text' id='option_attachmen_edit_content_nick_input' value='" + mcs_input_nick + "'></div>"
              + "</div>"
              + "<div id='option_attachmen_edit_submit'>" + mcs_ok + "</div>"
              + "</div>"
            let l_dom_option_attachmen_edit_submit = _this.publicFunc.mx("#option_attachmen_edit_submit");
            let l_dom_option_attachmen_edit_back = _this.publicFunc.mx("#option_attachmen_edit_back");
            let l_dom_option_attachmen_edit_content_nick_input = _this.publicFunc.mx("#option_attachmen_edit_content_nick_input");
            function exdev_set_ack (msg) {
              // $("#buffer_page").hide();
              _this.publicFunc.closeBufferPage()
              if (msg && msg.result == "") {
                obj.result = 1;
                create_scene_result_page(obj);
              } else {
                obj.result = 0;
                create_scene_result_page(obj);
              }
            }
            function exdev_add_ack (msg, ref) {
              if (ref.num > 20) {
                // $("#buffer_page").hide();
                _this.publicFunc.closeBufferPage()
                return;
              }
              if (msg && msg.result == "") {
                _this.$api.set.exdev_get({
                  flag: 1,
                  start: 0,
                  counts: 100,
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  ref: { num: ref.num }
                }).then(res => {
                  for (let i = 0; i < msg.data.devs.length; i++) {
                    if (msg.data.devs[i].id == obj.id) {
                      let dev = obj.data;
                      if (l_dom_option_attachmen_edit_content_nick_input.value != mcs_input_nick) {
                        dev.nick = l_dom_option_attachmen_edit_content_nick_input.value;
                      }
                      dev.flag = [7, 0]
                      _this.$api.set.exdev_set({
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        dev: dev
                      }).then(res => {
                        iexdev_set_ack(res)
                      })
                      return
                    }
                  }
                  exdev_add_ack({ result: "" }, { num: ++ref.num });
                })
              } else {
                // $("#buffer_page").hide();
                _this.publicFunc.closeBufferPage()
                create_scene_result_page({ result: 0 });
              }
            }
            l_dom_option_attachmen_edit_submit.onclick = function () {
              // $("#buffer_page").show();
              // 展示遮罩层
              _this.publicFunc.showBufferPage()
              _this.$api.set.exdev_add({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                id: obj.id,
                model: 2,
                ref: { num: 0 }
              }).then(res => {
                exdev_add_ack(res)
              })
            }
            l_dom_option_attachmen_edit_back.onclick = function () {
              create_scene_search_page(obj);
            }
            l_dom_option_attachmen_edit_content_nick_input.onfocus = function () {
              let this_val = this.value;
              if (this_val == mcs_input_nick) {
                this.value = "";
              }
            }
            l_dom_option_attachmen_edit_content_nick_input.onblur = function () {
              let this_val = this.value;
              if (this_val == "") {
                this.value = mcs_input_nick;
              }
            }
          }
          function create_scene_search_page (obj) {
            let demo_img_url, type, content_tips;
            let temp = 1;//搜索点击
            let exdev_get_time;
            if (obj.type == "door") {
              demo_img_url = '@/assets/device/door.gif';
              type = 6;
              content_tips = mcs_search_magnetic_start + mcs_search_magnetic_end;
            } else if (obj.type == "sos") {
              demo_img_url = '@/assets/device/sos.gif';
              type = 5;
              content_tips = mcs_search_sos_strat + mcs_search_sos_end;
            } else if (obj.type == "infra") {
              demo_img_url = '@/assets/device/pir.gif';
              content_tips = "";
            } else if (obj.type == "smoke") {
              demo_img_url = '@/assets/device/smoke.gif';
              content_tips = "";
            }
            info.dom.innerHTML =
              "<div id='option_attachmen_search_box'>"
              + "<div id='option_attachmen_search_title'>"
              + "<div id='option_attachmen_search_back'></div>"
              + "<div id='option_attachmen_search_title_text'>" + mcs_add_accessory + "</div>"
              + "</div>"
              + "<div id='option_attachmen_search_content'>"
              + "<img id='option_attachmen_search_content_img' src='" + demo_img_url + "'>"
              + "<div id='option_attachmen_search_content_tips'>" + content_tips + "</div>"
              + "<div id='option_attachmen_search_content_btn'>"
              + "<img id='option_attachmen_search_content_btn_ico' src="+require('@/assets/device/search.png')+">"
              + "<span id='option_attachmen_search_content_btn_txt'>" + mcs_search + "</span>"
              + "</div>"
              + "</div>"
              + "<div id='option_attachmen_search_list_box'></div>"
              + "</div>";
            let l_dom_option_attachmen_search_back = _this.publicFunc.mx("#option_attachmen_search_back");
            let l_dom_option_attachmen_search_content_btn = _this.publicFunc.mx("#option_attachmen_search_content_btn");
            function add_exdev_event (data) {
              let l_dom_option_attachmen_search_list_btn = _this.publicFunc.mx(".option_attachmen_search_list_btn");
              for (let i = 0; i < l_dom_option_attachmen_search_list_btn.length; i++) {
                l_dom_option_attachmen_search_list_btn[i].onclick = function () {
                  let id = this.getAttribute("sn");
                  let index = this.getAttribute("index");
                  obj.id = id;
                  obj.data = data[index];
                  create_scene_edit_name_page(obj);
                }
              }
            }
            // let time_num = 0;
            function search_peripheral (msg) {
              let list_img = "";
              if (type == 5) {
                list_img = "background:url(" + require("@/assets/device/add_sos.png") + ") no-repeat;";
              } else if (type == 6) {
                list_img = "background:url(" + require("@/assets/device/add_door.png") + ") no-repeat;";
              }
              if (msg && msg.result == "") {
                if (_this.publicFunc.mx("#option_attachmen_search_list_box")) {
                  _this.publicFunc.mx("#option_attachmen_search_list_box").innerHTML = ""
                  let data_devs = msg.data.devs ? msg.data.devs : "";
                  for (let i = 0; i < data_devs.length; i++) {
                    if (type == data_devs[i].type) {
                      _this.publicFunc.mx("#option_attachmen_search_list_box").innerHTML +=
                        "<div class='option_attachmen_search_list'>"
                        + "<div class='option_attachmen_search_list_img' style=" + list_img + "></div>"
                        + "<div class='option_attachmen_search_list_id'>ID:" + data_devs[i].id + "</div>"
                        + "<div class='option_attachmen_search_list_btn' index=" + i + " sn=" + data_devs[i].id + ">" + mcs_add + "</div>"
                        + "</div>"
                    }
                  }
                  add_exdev_event(data_devs);
                }
              }
            }
            function exdev_discover_ack (msg) {
              if (msg && msg.result == "") {
                let time_num = 0;
                if (msg.data.stop) {
                  clearInterval(exdev_get_time);
                  create_scene_edit_name_page(obj)
                } else {
                  exdev_get_time = setInterval(function () {
                    time_num++;
                    if (time_num > 20 || !_this.publicFunc.mx("#option_attachmen_search_content_btn")) {
                      clearInterval(exdev_get_time);
                      $(l_dom_option_attachmen_search_content_btn).css({ "background": "#00a6ba" });
                      if (_this.publicFunc.mx("#option_attachmen_search_content_btn_txt")) {
                        _this.publicFunc.mx("#option_attachmen_search_content_btn_txt").innerHTML = mcs_search;
                      }
                    }
                    _this.$api.set.exdev_get({
                      flag: 2,
                      start: 0,
                      counts: 100,
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc
                    }).then(res => {
                      search_peripheral(res)
                    })
                  }, 3000);
                }
              }
            }
            l_dom_option_attachmen_search_content_btn.onclick = function () {
              if (temp) {
                $(this).css({ "background": "#ccc" });
                _this.publicFunc.mx("#option_attachmen_search_content_btn_txt").innerHTML = mcs_search + "...";
                _this.$api.set.exdev_discover({
                  flag: 1,
                  timeout: 100000,
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                  exdev_discover_ack(res)
                })
              } else {
                $(this).css({ "background": "#00a6ba" });
                _this.publicFunc.mx("#option_attachmen_search_content_btn_txt").innerHTML = mcs_search;
                _this.$api.set.exdev_discover({
                  flag: 1,
                  timeout: 0,
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                  exdev_discover_ack(res)
                })
              }
              temp = !temp;
            }
            l_dom_option_attachmen_search_back.onclick = function () {
              create_scene_add_page();
            }
          }
          function create_scene_add_page () {
            info.dom.innerHTML =
              "<div id='option_attachmen_add_box'>"
              + "<div id='option_attachmen_add_title'>"
              + "<div id='option_attachmen_add_back'></div>"
              + "<div id='option_attachmen_add_title_text'>" + mcs_select + mcs_accessory_type + "</div>"
              + "</div>"
              + "<div id='option_attachmen_add_content'>"
              + "<div class='attachmen_add_type_list' type='door'>"
              + "<div id='select_add_door_img'></div>"
              + "<div class='select_add_name'>" + mcs_magnetic + "</div>"
              + "</div>"
              + "<div class='attachmen_add_type_list' type='sos'>"
              + "<div id='select_add_sos_img'></div>"
              + "<div class='select_add_name'>" + mcs_sos + "</div>"
              + "</div>"
              // +"<div class='attachmen_add_type_list' type='infra'>"
              //     +"<div id='select_add_infra_red_img'></div>"
              //     +"<div class='select_add_name'></div>"
              // +"</div>"
              // +"<div class='attachmen_add_type_list_end' type='smoke'>"
              //     +"<div id='select_add_smoke_img'></div>"
              //     +"<div class='select_add_name'></div>"
              // +"</div>"
              + "</div>"
              + "</div>";
            let l_dom_attachmen_add_type_list = _this.publicFunc.mx("#option_attachmen_add_content").childNodes;
            let l_dom_option_attachmen_add_back = _this.publicFunc.mx("#option_attachmen_add_back");
            for (let i = 0; i < l_dom_attachmen_add_type_list.length; i++) {
              l_dom_attachmen_add_type_list[i].onclick = function () {
                let type = this.getAttribute("type");
                create_scene_search_page({ type: type });
              }
            }
            l_dom_option_attachmen_add_back.onclick = function () {
              // class_options_attachmen(obj);
              _this.create_right_page(info);
            }
          }
          function scene_get_ack (msg) {
            l_dom_scene_devices_list.innerHTML = "";
            l_sence_data = msg.data.info.scene;
            let l_scene_devs = msg.data.info.scene[1] ? msg.data.info.scene[1].dev : "";
            for (let i = 0; i < l_scene_devs.length; i++) {
              let dev_id = l_scene_devs[i].id;
              let dev_nick = l_scene_devs[i].nick;
              let dev_type = l_scene_devs[i].type, scene_class, dev_type_name;
              // let dev_f;
              // let in_ico = "", out_ico = "";
              if (dev_type == 1) {
                scene_class = 'scene_list_motion';
                dev_type_name = mcs_motion_detection;
              } else if (dev_type == 2) { //红外线探测器
                scene_class = 'scene_list_infra_detector'
                dev_type_name = mcs_Infrared_detector;
              } else if (dev_type == 4) { //烟雾报警器
                scene_class = 'scene_list_smoke_detector'
                dev_type_name = mcs_smoke_detector;
              } else if (dev_type == 5) {
                scene_class = 'scene_list_sos';
                dev_type_name = mcs_sos;
              } else if (dev_type == 6) {
                scene_class = 'scene_list_door';
                dev_type_name = mcs_magnetic;
              } else if (dev_type == 8) {
                scene_class = 'scene_list_face';
                dev_type_name = mcs_face_detection;
              } else if (dev_type == 9) {
                scene_class = 'scene_list_sound'
                dev_type_name = mcs_sound_detection;
              }
              // else if(dev_type == 10){ //human_detect
              //    // continue;
              //    scene_class= 'scene_list_human_detector' //人型检测
              //    dev_type_name = mrs_human_detection;
              // }

              let id_nick = dev_nick ? dev_nick : dev_id;
              let weather_show = (dev_type == 8 || dev_type == 9 || dev_type == 10) ? "none" : "block";
              l_dom_scene_devices_list.innerHTML +=
                "<div class='option_scene_list option_scene_list_btn' style='display:" + weather_show + " ' attachmen_id=" + dev_id + " attachmen_type=" + dev_type + " attachmen_class=" + scene_class + " attachmen_nick=" + dev_nick + ">"
                + "<div class='scene_list_img " + scene_class + "'></div>"
                + "<div class='option_scene_list_right'>"
                + "<div class='option_scene_list_text'>"
                + "<div class='option_scene_list_text_left'>" + dev_type_name + "</div>"
                + "<div class='option_scene_list_text_right'>" + id_nick + "</div>"
                + "</div>"
                + "</div>"
                + "</div>";

            }
            l_dom_scene_devices_list.innerHTML +=
              "<div id='option_scene_list_add' attachmen_type='0'>"
              + "<div class='scene_list_img scene_list_add'></div>"
              + "<div class='option_scene_list_right'><div>"
              + "<div class='option_scene_list_text_left'></div>"
              + "</div>";
            scene_list_event();
            //console.log("get_dev_info_this")
            _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
              let length = _this.publicFunc.mx(".option_scene_list_btn").length;
              let face_detect = res.face_detect;
              let sound_detect = res.sound_detect;
              _this.g_motion_track = res.motion_track;
              if (face_detect == 1 || sound_detect == 1) {
                let l_dom_option_scene_list_btn = _this.publicFunc.mx(".option_scene_list_btn");
                for (let i = 0; i < l_dom_option_scene_list_btn.length; i++) {
                  if (l_dom_option_scene_list_btn[i].getAttribute("attachmen_type") === "8" && face_detect === "1") {
                    l_dom_option_scene_list_btn[i].style.display = "block";
                  }
                  if (l_dom_option_scene_list_btn[i].getAttribute("attachmen_type") === "9" && sound_detect === "1") {
                    l_dom_option_scene_list_btn[i].style.display = "block";
                  }
                }
              }
              if (res.rffreq === "868") {
                $("#option_scene_list_add").show();
              }
            })
          }
          _this.$api.set.scene_get({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            scene_get_ack(res)
          })
          break;
        }
        case "record": { // 旧录像逻辑
          info.dom.innerHTML =
            "<div id='set_main_page' class='record_page'>"
            + "<div style='height:2rem;margin-top:1rem'>" + mcs_continuous_recording + "</div>"
            + "<div class='menu_list2_box' id='record_plan' style='overflow:hidden'>"
            + "<div class='menu_record'><div class='list_name'>"
            + "<div class='list_name_title'>" + mcs_continuous_recording + "</div>"
            + "<div class='list_name_tips' id='is_show'></div>"  //下面开启关闭
            + "</div><div class='list_info'>"
            + "<div class='right_arrow'></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'>" + mcs_Event_record + "</div>"
            + "<div class='menu_list2_box' id='record_event'></div>"

            + "<div id='sd_mode'>"
            + "<div class='sd_display'>"
            + "<div class='menu_list_box_title2 menu_list_mode'>" + mcs_mode + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list menu_list_children_mode' style=''><div class='sd_mode_text'>" + mcs_normal_mode + "</div><div class='list_info'><div type='0' class='list_info_select list_info_select_img'></div></div></div>"
            + "<div id='no' class='record_sd_calculate'></div>"
            + "<div class='menu_list menu_list_children_mode' style=''><div class='sd_mode_text'>" + mcs_long_video_mode + "</div><div class='list_info'><div type='50' class='list_info_select list_info_select_img'></div></div></div>"
            + "<div id='lo' class='record_sd_calculate'></div>"
            + "<div class='menu_list menu_list_children_mode' style=''><div class='sd_mode_text'>" + mcs_super_long_video_mode + "</div><div class='list_info'><div type='100' class='list_info_select list_info_select_img'></div></div></div>"
            + "<div id='su' class='record_sd_calculate'></div>"
            + "</div>"
            + "<div id='sd_mode_btn' class='list_right_button'>" + mcs_apply + "</div>"
            + "</div>"
            + "</div>"

            + "</div>";

          var l_dom_record_event = _this.publicFunc.mx("#record_event");
          var data;
          var l_scene_data_out, l_scene_data_active;
          var l_select_scene_name;
          var face_detect = ''
          var sound_detect = "";
          var g_accessory_sn = "";
          var g_accessory_type = "";
          _this.g_show = "false";
          var time_format = [];
          $("#sd_mode").hide();

          //原来function add_event()位置

          var day_list = [];
          var g_total_type = "";
          var g_aa_data = "";
          var g_set_old_out_time = "";
          var index = -1;
          var g_week_w = [];
          var g_total_data = "";
          var set_record_alarm_title, set_record_alarm_content;

          function create_set_record_page (repeat_page) { //允许录像设置开关时间页面
            // console.log("enter create_set_record_page")
            let set_record_alarm_title, set_record_alarm_content;
            _this.record_flag_out = 'true';
            set_record_alarm_title = mcs_Allow_record;
            set_record_alarm_allow_title = mcs_Allow_record_schedule;
            if (g_accessory_type == 1) { //移动侦测
              set_record_alarm_content = mcs_move_record_new_detail;
            } else if (g_accessory_type == 5) {
              set_record_alarm_content = mcs_sos_record_detail;
            } else if (g_accessory_type == 6) {
              set_record_alarm_content = mcs_door_record_detail;
            } else if (g_accessory_type == 8) {
              set_record_alarm_content = mcs_move_record_detail;
            } else if (g_accessory_type == 9) {
              set_record_alarm_content = mcs_move_record_detail;
            } else if (g_accessory_type == "") {
              set_record_alarm_content = mcs_continuous_recording_hint;
            }
            $("#add_device_page").show();
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"
              + "<div class='set_main_page_alarm'>"
              + "<div class='menu_list_box'>" //允许录像和开关
              + "<div class='menu_list record_allow'>"
              + "<div class='list_name record_padding'>" + set_record_alarm_title + "</div>"  //set_record_alarm_title
              + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_box_title2 record_background'>" + set_record_alarm_content + "</div>" //set_record_alarm_content

              + "<div class='margin'>" //设置时间
              + "<div class='set_alarm_time_word' style='display:none;'>" + set_record_alarm_allow_title + "</div>" //set_record_alarm_allow_title
              + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
              + "<div id='set_out_time_box'></div>"
              + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"
              + "</div>"
              + "</div>"
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            l_dom_attachmen_box_close.onclick = function () {
              _this.record_flag(time_format, day_list)
              if (_this.g_show == "true") {
                _this.publicFunc.delete_tips({
                  content: mcs_is_save_hint, func: function () {
                    $("#add_device_page").css('display', 'none');
                    _this.create_right_page({ type: 'record', dom: _this.publicFunc.mx("#create_setting_page_right") })
                  }
                })
              } else {
                _this.create_right_page({ type: 'record', dom: _this.publicFunc.mx("#create_setting_page_right") });
                $("#add_device_page").css('display', 'none');
              }
            }
            let data, l_scene_data_out, l_scene_data_active;
            let req_data;
            $("#at_home_btn").switchBtn();

            _this.publicFunc.mx("#set_time_add").onclick = function () {
              _this.g_set_out_time = "";
              _this.g_is_add = "true";
              record_set_time();
            }
            function record_set_event () {
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                  if (at_home_type == "true") {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video
                    $("#hide_timebox").show();
                    $(".set_alarm_time_word").show();
                  } else {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag & 0x5; //off video
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag & 0x5; //off video
                    $("#hide_timebox").hide();
                    $(".set_alarm_time_word").hide();
                  }
                }
              }
            } //record_set_event 
            function set_plan_record () { //允许录像开关
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              if (at_home_type == "true") {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 1;
                $("#hide_timebox").show();
                $(".set_alarm_time_word").show();
              } else {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 0;
                $("#hide_timebox").hide();
                $(".set_alarm_time_word").hide();
              }
            }

            function get_scene_ack (msg) {
              let scene_data;
              g_total_type = msg;
              _this.publicFunc.closeBufferPage()
              if (msg && msg.result == "") {
                data = msg;
                for (let i = 0; i < msg.data.info.scene.length; i++) {
                  scene_data = msg.data.info.scene[i];
                  if (scene_data.name == "out") {
                    l_scene_data_out = msg.data.info.scene[i];
                    if (g_accessory_sn) {
                      for (let j = 0; j < scene_data.dev.length; j++) {
                        if (scene_data.dev[j].id == g_accessory_sn) {
                          if (repeat_page !== 1) {
                            if (scene_data.dev[j].flag & 0x2) {
                              $("#at_home_btn").switchBtn(true, "", "", record_set_event);
                              $("#hide_timebox").show();
                              $(".set_alarm_time_word").show();
                            } else {
                              $("#at_home_btn").switchBtn(false, "", "", record_set_event);
                              $("#hide_timebox").hide();
                              $(".set_alarm_time_word").hide();
                            }
                          } else {
                            $("#at_home_btn").switchBtn(true, "", "", record_set_event);
                            $("#hide_timebox").show();
                            $(".set_alarm_time_word").show();
                          }

                        }
                      }
                    } else {
                      if (repeat_page !== 1) { //标记是第一次打开create_set_record_page页面，还是设置完时间返回的页面
                        if (scene_data.flag) {
                          $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                          $("#hide_timebox").show();
                          $(".set_alarm_time_word").show();
                        } else {
                          $("#at_home_btn").switchBtn(false, "", "", set_plan_record);
                          $("#hide_timebox").hide();
                        }
                      } else {
                        $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                        $("#hide_timebox").show();
                        $(".set_alarm_time_word").show();
                      }

                    }
                  } else if (scene_data.name == "in") {
                    l_scene_data_active = msg.data.info.scene[i];
                  }
                }
                req_data = {
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1,
                  info: {
                    select: data.data.info.select,
                    scene: [{ name: "auto", flag: 0 },
                    {
                      name: "out",
                      flag: l_scene_data_out.flag,
                      dev: l_scene_data_out.dev
                    },
                    {
                      name: "in",
                      flag: l_scene_data_active.flag,
                      dev: l_scene_data_active.dev
                    }]
                  },
                  func: function () {//msg
                    //_this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
                  }
                }
                if (repeat_page == 1) { //解决点击应用，开关值显示开，请求参数没改bug，最后开关还是关
                  if (g_accessory_sn) {
                    for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                      if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                        req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
                        req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video         
                      }
                    }
                  } else {
                    req_data.info.scene[2].flag = 0;
                    req_data.info.scene[1].flag = 1;
                  }
                }
              }
            }//get_scene_ack 


            // function get_scene(msg){  
            //  let scene_data;
            //  $("#buffer_page").hide();
            //  if(msg&&msg.result==""){
            //       data = msg;
            //  for(let i=0;i<msg.data.info.scene.length;i++){
            //    scene_data = msg.data.info.scene[i];
            //    if(scene_data.name=="out"){
            //    l_scene_data_out = msg.data.info.scene[i];
            //        if(g_accessory_sn){ 
            //            for(let j=0;j<scene_data.dev.length;j++){
            //                if(scene_data.dev[j].id==g_accessory_sn){
            //                  if(scene_data.dev[j].flag&0x2){
            //                      $("#at_home_btn").switchBtn(true,"","",record_set_event);
            //                      $("#hide_timebox").show();
            //                      $(".set_alarm_time_word").show();
            //                  }else{
            //                      $("#at_home_btn").switchBtn(false,"","",record_set_event);
            //                      $("#hide_timebox").hide();
            //                      $(".set_alarm_time_word").hide();
            //                  }
            //                }
            //            }
            //        }else{
            //          if(scene_data.flag){
            //              $("#at_home_btn").switchBtn(true,"","",set_plan_record);
            //              $("#hide_timebox").show();
            //              $(".set_alarm_time_word").show();
            //          }else{
            //              $("#at_home_btn").switchBtn(false,"","",set_plan_record);
            //              $("#hide_timebox").hide();
            //          }
            //        }
            //      }else if(scene_data.name=="in"){
            //                l_scene_data_active = msg.data.info.scene[i];
            //      }
            //  }
            //  req_data = {
            //    sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1,
            //    info: {
            //      select: data.data.info.select,
            //      scene: [{name: "auto", flag: 0},
            //      {
            //        name: "out",
            //        flag: l_scene_data_out.flag,
            //        dev: l_scene_data_out.dev
            //      },
            //      {
            //        name: "in",
            //        flag: l_scene_data_active.flag,
            //        dev: l_scene_data_active.dev
            //      }]
            //    },
            //    func:function(msg){
            //  //                    _this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
            //  }

            //  }
            //  } 
            // }

            // $("#buffer_page").show();
            // 展示遮罩层
            _this.publicFunc.showBufferPage()
            _this.$api.set.scene_get({ //页面一上来从接口取得值渲染开关页面
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              get_scene_ack(res)
            })
            let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");

            if (g_total_data != "") {      //根据设置的时间日期值渲染开关页面
              schedule_get(g_total_data);
            } else {
              //获取跟设置的时间请求，页面一上来从接口取得值渲染开关页面
              _this.$api.set.schedule_get({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                schedule_get_ack(res)
              })
            }

            function schedule_get () { //设置完时间日期 点返回走的函数 (g_data)
              if (day_list.length != 0) {
                for (let i = 0; i < day_list.length; i++) {
                  let classname = '';
                  if (i == day_list.length - 1) {
                    classname = 'time_menu_list_last';
                  } else {
                    classname = 'time_menu_list';
                  }
                  l_dom_set_out_time_box.innerHTML +=
                    "<div class='" + classname + " select_set_time_btn' index='" + i + "' time='" + day_list[i].start + "_" + day_list[i].end + "_" + day_list[i].week + "'>"
                    + "<div class='time_list_name'>"
                    + "<div class='time_list_name_title record_padding'>" + day_list[i].start + ":00 - " + day_list[i].end + ":00</div>"
                    + "<div class='time_list_name_tips'>" + day_list[i].week + "</div>"
                    + "</div>"
                    + "<div class='list_info'>"
                    + "<div class='right_arrow'></div>"
                    + "</div>"
                    + "</div>";
                }
                let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.select_set_time_btn');
                for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                  l_dom_selsect_set_time_btn[n].onclick = function () {
                    _this.g_is_add = "false";
                    let time = this.getAttribute('time');
                    index = this.getAttribute('index');
                    let arr = "";
                    if (time.split("_")[2].indexOf(mcs_Sunday_and) != -1) {
                      arr += "0."
                    }
                    if (time.split("_")[2].indexOf(mcs_Monday_and) != -1) {
                      arr += "1."
                    }
                    if (time.split("_")[2].indexOf(mcs_Tuesday_and) != -1) {
                      arr += "2."
                    }
                    if (time.split("_")[2].indexOf(mcs_Wednesday_and) != -1) {
                      arr += "3."
                    }
                    if (time.split("_")[2].indexOf(mcs_Thursday_and) != -1) {
                      arr += "4."
                    }
                    if (time.split("_")[2].indexOf(mcs_Friday_and) != -1) {
                      arr += "5."
                    }
                    if (time.split("_")[2].indexOf(mcs_Saturday_and) != -1) {
                      arr += "6."
                    }
                    arr = arr.substring(0, arr.length - 1);
                    _this.g_set_out_time = day_list[index].start + "_" + day_list[index].end + "_" + arr;
                    record_set_time();
                  }
                }
              }
            }//schedule_get

            function schedule_time_format (arr) {
              let start_time = [], end_time = [];
              for (let j = 0; j < arr.length; j++) {
                let num = -1;
                start_time[j] = [];
                end_time[j] = [];
                for (let i = -1; i < arr[j].length;) {
                  if (arr[j].indexOf(0, i) == i && i != -1) {
                    i++;
                    end_time[j][num]++;
                  } else if (arr[j].indexOf(0, i) < 0 && i > 0) {
                    i = arr[j].length;
                  } else if (arr[j].indexOf(0, i) < 0 && i <= 0) {
                    i = arr[j].length;
                    start_time[j][0] = 0;
                    end_time[j][0] = 0;
                  } else {
                    num++;
                    start_time[j][num] = arr[j].indexOf(0, i)
                    end_time[j][num] = arr[j].indexOf(0, i)
                    i = arr[j].indexOf(0, i);
                  }
                }
              }
              let length;
              for (let time_i = 0; time_i < 7; time_i++) {
                for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
                  if (end_time[time_i][time_j]) {
                    length = time_format.length;
                    if (length > 0) {
                      let is_exist = 0;
                      for (let time_format_i = 0; time_format_i < length; time_format_i++) {
                        if (start_time[time_i][time_j] == time_format[time_format_i].start_time && end_time[time_i][time_j] == time_format[time_format_i].end_time) {
                          time_format[time_format_i].week.push(time_i);
                          is_exist = 1;
                        }
                      }
                      if (is_exist == 0) {
                        time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                      }
                    } else {
                      time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                    }
                  }
                }
              }
              // l_dom_set_out_time_box.innerHTML = "<div id='set_time_box'></div>"
              for (let k = 0; k < time_format.length; k++) {
                let week = "";
                let week_num = '';
                for (let m = 0; m < time_format[k].week.length; m++) {
                  if (time_format[k].week[m] == 0) {
                    week += mcs_Sunday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 1) {
                    week += mcs_Monday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 2) {
                    week += mcs_Tuesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 3) {
                    week += mcs_Wednesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 4) {
                    week += mcs_Thursday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 5) {
                    week += mcs_Friday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 6) {
                    week += mcs_Saturday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  }
                }
                week = week.substring(0, week.length - 1)
                week_num = week_num.substring(0, week_num.length - 1)

                let classname = '';
                // if (k == time_format.length - 1) {
                //   classname = 'time_menu_list_last';
                // } else {
                //   classname = 'time_menu_list';
                // }
                l_dom_set_out_time_box.innerHTML +=
                  "<div class='" + classname + " selsect_set_time_btn' index='" + k + "' time='" + time_format[k].start_time + "_" + time_format[k].end_time + "_" + week_num + "'>"
                  + "<div class='time_list_name'>"
                  + "<div class='time_list_name_title record_padding'>" + time_format[k].start_time + ":00 - " + time_format[k].end_time + ":00</div>"
                  + "<div class='time_list_name_tips'>" + week + "</div>"
                  + "</div>"
                  + "<div class='list_info'>"
                  + "<div class='right_arrow'></div>"
                  + "</div>"
                  + "</div>";
                day_list.push({ start: time_format[k].start_time, end: time_format[k].end_time, week: week });
              }
              let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.selsect_set_time_btn');
              for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                l_dom_selsect_set_time_btn[n].onclick = function () {
                  _this.g_is_add = "false";
                  let time = this.getAttribute('time');
                  index = this.getAttribute('index');
                  _this.g_set_out_time = time;
                  // console.log("从此处进入set_time")
                  record_set_time();
                }
              }
            }//schedule_time_format

            _this.publicFunc.mx("#submit_apply").onclick = function () { //点击应用
              _this.record_flag_out = "false";
              _this.g_show = 'false';
              _this.$api.set.schedule_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                sch: {
                  degree: 3600,
                  schedule: g_total_data
                }
              }).then(res => {
                if (res && res.result === "") {
                  _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                } else if (res.result === "permission.denied") {
                  _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                }
              })
              req_data.info.scene[2].flag = 0;
              req_data.info.scene[2].dev[0].flag = 0;
              _this.$api.set.scene_set(req_data)
            }

            function compile_week () {
              let week_select = _this.g_select_week.slice();
              $("add_device_page").show();
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Sunday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Monday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Tuesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Wednesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Thursday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Friday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Saturday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "</div>"
                + "</div>"

              let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");
              let l_dom_set_week_list = _this.publicFunc.mx(".set_week");
              for (let i = 0; i < l_dom_set_week_list.length; i++) {
                l_dom_set_week_list[i].index = i;
                l_dom_set_week_list[i].onclick = function () {
                  if ($(this).find(".list_info_select").hasClass("list_info_select_img")) {
                    week_select[this.index] = 1;
                    $(this).find(".list_info_select").removeClass('list_info_select_img').addClass('list_info_clickselect_img')
                  } else {
                    week_select[this.index] = 0;
                    $(this).find(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img')
                  }
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i] == 1) {
                      g_week_w = "[" + week_select.join() + "]";
                      return;
                    }
                  }
                  _this.native_can_back= false;
                }
              }
              for (i = 0; i < week_select.length; i++) {
                if (week_select[i]) {
                  l_dom_set_week_list[i].click();
                }
              }
              l_dom_record_back_box.onclick = function () {  //设置完星期返回到时间设置页面
                if (week_select.indexOf(1) == -1) {
                  $(".time_select_tips").show();
                  setTimeout("$('.time_select_tips').hide();", 3000)
                } else {
                  record_set_time();
                }
              }
            }//compile_week

            function record_set_time () {
              // console.log("进入set_time")
              _this.native_can_back= true;
              g_aa_data = g_total_data;
              let flag = true;
              let repeat = false;
              let start_time = '00';
              let end_time = '24';
              // let old_start_time = '00';
              // let old_end_time = "00";
              // let old_week = "";
              let week = '';
              let week_new = []; //保存选中哪些日期值
              if (g_set_old_out_time == "" && _this.g_is_add == "false") {
                g_set_old_out_time = _this.g_set_out_time;
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (g_set_old_out_time != "" && _this.g_is_add == "false") {
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (_this.g_set_out_time) {
                let set_time_out_data = _this.g_set_out_time.split("_");
                start_time = set_time_out_data[0] >= 10 ? set_time_out_data[0] : "0" + set_time_out_data[0];
                end_time = set_time_out_data[1] >= 10 ? set_time_out_data[1] : "0" + set_time_out_data[1];
                week = set_time_out_data[2] ? set_time_out_data[2].split(".") : [];
              }
              //add default time
              if (_this.g_is_add == "true") {
                week = [0, 1, 2, 3, 4, 5, 6]
              }

              let temp = eval(g_week_w);
              if (temp.length == 7) {
                let j = 0;
                for (i = 0; i < temp.length; i++) {
                  if (temp[i]) {
                    week_new[j] = i;
                    j++;
                  }
                }
              }
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div><div id='delete_set_record'>" + mcs_delete + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_time_list set_starttime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
                + "</div>"

                + "<div style='height:2rem;background:#EFEFF4'></div>"
                + "<div class='set_time_list set_endtime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
                + "</div>"
                + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
                + "</div>"
                + "<div class='select_week_box' id='click_arrow' style='overflow:hidden;width:660px;margin-top:30px;'>"
                + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
                + "<div class='week_Box' style='float:right;width:400px;'>"
                + "<div class='week_list' id='week0'>" + mcs_Sunday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week1'>" + mcs_Monday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week2'>" + mcs_Tuesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week3'>" + mcs_Wednesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week4'>" + mcs_Thursday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week5'>" + mcs_Friday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week6'>" + mcs_Saturday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
                + "</div>"

                + "</div>"
                + "</div>"
                + "</div>"
              //        +"<div id='set_time_submit_btn' class='set_submit_btn'>"+mcs_ok+"</div>"
              //        +"<div id='set_time_del_btn' class='set_del_btn'>"+mcs_delete+"</div>";


              _this.publicFunc.mx("#click_arrow").onclick = function () {
                if (temp.length != 0) {
                  _this.g_select_week = week_select;
                } else {
                  _this.g_select_week = old_week_select;
                }
                let time = parseInt(_this.publicFunc.mx("#start_time").innerHTML) + "_" + parseInt(_this.publicFunc.mx("#end_time").innerHTML) + "_";
                for (let i = 0; i < _this.g_select_week.length; i++) {
                  if (_this.g_select_week[i] == 1) {
                    time += i + "."
                  }
                }
                time.substring(0, time.length - 1)
                _this.g_set_out_time = time;
                compile_week();
              }

              let week_select = [0, 0, 0, 0, 0, 0, 0];
              let old_week_select = [0, 0, 0, 0, 0, 0, 0];

              if (temp.length !== 0) {
                week_select = temp;
              }

              // function stringToHex (data) {
              //   let val = "", arr = [], arr0 = [];
              //   for (let i = 0; i < data.length; i++) {
              //     val = parseInt(data[i], 2).toString(16);
              //     arr[i] = val;
              //   }
              //   for (let j = 0; j < data.length; j++) {
              //     arr0[j] = 0xff & ("0x" + arr[j]);
              //   }
              //   return arr0;
              // }


              function set_time_event () {
                $("#start_time").date({ theme: "datetime", h: start_time });
                $("#end_time").date({ theme: "datetime", h: end_time });
                $("#start_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })

                $("#end_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })
                let l_dom_week_list = _this.publicFunc.mx(".week_list");
                for (let i = 0; i < l_dom_week_list.length; i++) {
                  // let is_has = $(this).hasClass("week_list_active");
                  l_dom_week_list[i].index = i;
                  for (let h = 0; h < week_new.length; h++) {
                    if (i == week_new[h]) {
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (h == week_new.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }
                  for (let j = 0; j < week.length; j++) {
                    if (week_new.length !== 0) {
                      continue;
                    }
                    if (i == week[j]) {
                      old_week_select[i] = 1;
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (j == week.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }
                }

                if (temp.length != 0) {
                  let y = temp;
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                      }
                      week_select[i] = y[i];
                    }
                  }
                } else {
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                        week_select[i] = 1;
                      }
                    }
                  }
                }
                function set_time_func (type) {
                  repeat = false;
                  let index = -1;
                  let time_select = [];
                  let start_time = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                  let end_time = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                  let new_time_select = [];
                  if (start_time >= end_time) {
                    repeat = true;
                    flag = false;
                    _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
                    return;
                  }
                  flag = true;
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i]) {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        if (j >= start_time && j < end_time) {
                          tmp_data += "0"
                        } else {
                          tmp_data += "1"
                        }
                        time_select[index] = tmp_data.split("").reverse().join("");
                      }
                    } else {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        tmp_data += "1"
                        time_select[index] = tmp_data;
                      }
                    }
                  }
                  function get_select_time (g_total_data) {
                    if (g_total_data != "") {
                      let l_data_2 = mcodec.b64_2_binary(g_total_data, 1), str = "", arr = [], arr2 = [], arr_tmp = [];
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
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < old_week.length; i++) {
                            let arr_all = "";
                            let arr_all_arr = [];
                            let arr1 = "", arr2 = "", arr3 = "";
                            for (let j = 0; j < 3; j++) {
                              arr_all += arr[old_week[i] * 3 + j].split("").reverse().join("");
                            }
                            arr_all_arr = arr_all.split("");
                            for (let m = parseInt(old_start_time); m < parseInt(old_end_time); m++) {
                              arr_all_arr[m] = "1";
                            }
                            for (let k = 0; k <= 7; k++) {
                              arr1 += arr_all_arr[k];
                            }
                            for (k = 8; k <= 15; k++) {
                              arr2 += arr_all_arr[k]
                            }
                            for (k = 16; k <= 23; k++) {
                              arr3 += arr_all_arr[k]
                            }
                            arr[old_week[i] * 3] = arr1.split("").reverse().join("");
                            arr[old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
                            arr[old_week[i] * 3 + 2] = arr3.split("").reverse().join("");
                          }
                        }
                        let select = [];
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < week_select.length; i++) {
                            if (week_select[i] == 1) {
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;
                      }
                    }
                  }//get_select_time
                  get_select_time(g_total_data)
                }//set_time_func
                let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");

                l_dom_record_back_box.onclick = function () { //设置完时间，返回到允许录像开关页面
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  set_time_func("submit");
                  if (!flag) {
                    return;
                  }
                  if (_this.g_is_add == "false") {
                    day_list[index].start = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                    day_list[index].end = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                    day_list[index].week = arr;
                  } else {
                    day_list.push({ start: parseInt(_this.publicFunc.mx("#start_time").innerHTML), end: parseInt(_this.publicFunc.mx("#end_time").innerHTML), week: arr })
                  }
                  if (!repeat) {
                    g_set_old_out_time = "";
                    _this.g_set_out_time = "";
                    g_week_w = [];
                    g_total_data = g_aa_data;
                    create_set_record_page(1);
                  }
                }

                _this.publicFunc.mx("#delete_set_record").onclick = function () { //设置完时间日期页面点击删除
                  let arr;// eslint-disable-line no-unused-vars
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  if (_this.g_is_add == "false") {
                    day_list.splice(index, 1);
                  } else {
                    create_set_record_page();
                    return;
                  }
                  set_time_func("del");
                  if (!repeat) {
                    g_set_old_out_time = "";
                    g_total_data = g_aa_data;
                    create_set_record_page();
                  }
                }
              }//set_time_event

              set_time_event();
            }//record_set_time
          }//create_set_record_page  

          // $("#buffer_page").show();
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          // console.log("调用获取设备参数")
          //console.log("get_dev_info_this")
          _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            face_detect = res.face_detect;
            sound_detect = res.sound_detect;
            _this.$api.set.scene_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              record_get_ack(res)
            })
          })
          break;
        }
        case "alarm_device_tips": { //报警
          info.dom.innerHTML =
            "<div id='set_main_page' class='alarm_page'>"
            + "<div style='height:2rem;margin-top:1rem;display:none'>" + mcs_continuous_recording + "</div>"
            + "<div class='menu_list2_box' id='record_plan' style='overflow:hidden;display:none'>"
            + "<div class='menu_record' style='display:none;'><div class='list_name'>"
            + "<div class='list_name_title'>" + mcs_continuous_recording + "</div>"
            + "<div class='list_name_tips' id='is_show'></div>"  //下面开启关闭
            + "</div><div class='list_info'>"
            + "<div class='right_arrow'></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'>" + mcs_allow_type + "</div>"
            + "<div class='menu_list2_box' id='record_event'></div>"
            + "</div>";
          l_dom_record_event = _this.publicFunc.mx("#record_event");
          // let data;
          // let l_scene_data_out, l_scene_data_active;
          // let l_select_scene_name;
          face_detect = '';
          sound_detect = "";
          g_accessory_sn = "";
          g_accessory_type = "";
          _this.g_show = "false";
          time_format = [];

          day_list = [];
          g_total_type = "";
          g_aa_data = "";
          g_set_old_out_time = "";
          index = -1;
          g_week_w = [];
          g_total_data = "";
          // let set_record_alarm_title, set_record_alarm_content;
          function create_set_alarm_device_tips_page (repeat_page) { //允许报警设置开关时间页面
            //控制显示内容
            let set_record_alarm_title, set_record_alarm_content;
            _this.record_flag_out = 'true';
            set_record_alarm_title = mcs_Allow_alarm;
            set_record_alarm_allow_title = mcs_Allow_alarm_schedule;
            if (g_accessory_type == 1) {

              set_record_alarm_content = mcs_move_alarm_new_detail;
            } else if (g_accessory_type == 5) {

              set_record_alarm_content = mcs_sos_alarm_detail;
            } else if (g_accessory_type == 6) {

              set_record_alarm_content = mcs_send_alarm_notification;
            } else if (g_accessory_type == 8) {

              set_record_alarm_content = mcs_move_record_detail;
            } else if (g_accessory_type == 9) {

              set_record_alarm_content = mcs_move_record_detail;
            }
            else if (g_accessory_type == "") {

              set_record_alarm_content = mcs_7x24_hours_prompt;
            }
            $("#add_device_page").show();
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"

              + "<div class='set_main_page_alarm'>"
              + "<div class='menu_list_box'>" //允许报警和开关
              + "<div class='menu_list record_allow'>"
              + "<div class='list_name record_padding'>" + set_record_alarm_title + "</div>"  //set_record_alarm_title
              + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_box_title2 record_background'>" + set_record_alarm_content + "</div>" //set_record_alarm_content

              + "<div class='margin'>" //设置时间
              + "<div class='set_alarm_time_word' style='display:none;'>" + set_record_alarm_allow_title + "</div>" //set_record_alarm_allow_title
              + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
              + "<div id='set_out_time_box'></div>"
              + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"
              + "</div>"
              + "</div>"


            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            l_dom_attachmen_box_close.onclick = function () {
              _this.record_flag(time_format, day_list)
              if (_this.g_show == "true") {
                _this.publicFunc.delete_tips({
                  content: mcs_is_save_hint, func: function () {
                    $("#add_device_page").css('display', 'none');
                    _this.create_right_page({ type: 'alarm_device_tips', dom: _this.publicFunc.mx("#create_setting_page_right") })
                  }
                })
              } else {
                _this.create_right_page({ type: 'alarm_device_tips', dom: _this.publicFunc.mx("#create_setting_page_right") });
                $("#add_device_page").css('display', 'none');
              }
            }
            let data, l_scene_data_out, l_scene_data_active;
            let req_data;
            $("#at_home_btn").switchBtn();

            _this.publicFunc.mx("#set_time_add").onclick = function () {
              _this.g_set_out_time = "";
              _this.g_is_add = "true";
              alarm_device_tips_set_time();
            }

            function set_event () {
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                  if (at_home_type == "true") { //baojing
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x4; //on voice
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x4; //on voice
                    $(".set_alarm_time_word").show();
                    $("#hide_timebox").show();
                  } else {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag & 0x3; //off voice
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag & 0x3; //off voice
                    $("#hide_timebox").hide();
                    $(".set_alarm_time_word").hide();
                  }
                }
              }
            }//set_event
            function set_plan_record () { //允许录像开关
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              if (at_home_type == "true") {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 1;
                $("#hide_timebox").show();
                $(".set_alarm_time_word").show();
              } else {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 0;
                $("#hide_timebox").hide();
                $(".set_alarm_time_word").hide();
              }
            }//set_plan_record

            function get_scene_ack (msg) {
              let scene_data;
              g_total_type = msg;
              // $("#buffer_page").hide();
              _this.publicFunc.closeBufferPage()
              if (msg && msg.result == "") {
                data = msg;
                for (let i = 0; i < msg.data.info.scene.length; i++) {
                  scene_data = msg.data.info.scene[i];
                  if (scene_data.name == "out") {
                    l_scene_data_out = msg.data.info.scene[i];
                    if (g_accessory_sn) {
                      for (let j = 0; j < scene_data.dev.length; j++) {
                        if (scene_data.dev[j].id == g_accessory_sn) {
                          if (repeat_page !== 1) {
                            if (scene_data.dev[j].flag & 0x4) {
                              $("#at_home_btn").switchBtn(true, "", "", set_event);
                              $("#hide_timebox").show();
                              $(".set_alarm_time_word").show();
                            } else {
                              $("#at_home_btn").switchBtn(false, "", "", set_event);
                              $("#hide_timebox").hide();
                              $(".set_alarm_time_word").hide();
                            }
                          } else {
                            $("#at_home_btn").switchBtn(true, "", "", set_event);
                            $("#hide_timebox").show();
                            $(".set_alarm_time_word").show();
                          }

                        }
                      }
                    } else {
                      if (repeat_page !== 1) {
                        if (scene_data.flag) {
                          $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                          $("#hide_timebox").show();
                          $(".set_alarm_time_word").show();
                        } else {
                          $("#at_home_btn").switchBtn(false, "", "", set_plan_record);
                          $("#hide_timebox").hide();
                        }
                      } else {
                        $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                        $("#hide_timebox").show();
                        $(".set_alarm_time_word").show();
                      }

                    }
                  } else if (scene_data.name == "in") {
                    l_scene_data_active = msg.data.info.scene[i];
                  }
                }
                req_data = {
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1,
                  info: {
                    select: data.data.info.select,
                    scene: [{ name: "auto", flag: 0 },
                    {
                      name: "out",
                      flag: l_scene_data_out.flag,
                      dev: l_scene_data_out.dev
                    },
                    {
                      name: "in",
                      flag: l_scene_data_active.flag,
                      dev: l_scene_data_active.dev
                    }]
                  },
                  func: function () {//(msg)
                    //_this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
                  }
                }

                if (repeat_page == 1) { //解决点击应用，开关值显示开，请求参数没改bug，最后开关还是关
                  if (g_accessory_sn) {
                    for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                      if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                        // req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
                        // req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video 
                        req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x4; //on voice
                        req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x4; //on voice        
                      }
                    }
                  } else {
                    // req_data.info.scene[2].flag=0;
                    // req_data.info.scene[1].flag=1;
                    req_data.info.scene[2].flag = 0;
                    req_data.info.scene[1].flag = 1;
                  }
                }
              }
            }//get_scene_ack

            // function get_scene(msg){
            //  let scene_data;
            //  $("#buffer_page").hide();
            //  if(msg&&msg.result==""){
            //    data = msg;
            //    for(let i=0;i<msg.data.info.scene.length;i++){
            //      scene_data = msg.data.info.scene[i];
            //      if(scene_data.name=="out"){
            //          l_scene_data_out = msg.data.info.scene[i];
            //          if(g_accessory_sn){ 
            //              for(let j=0;j<scene_data.dev.length;j++){
            //                if(scene_data.dev[j].id==g_accessory_sn){
            //                if(scene_data.dev[j].flag&0x4){
            //                  $("#at_home_btn").switchBtn(true,"","",set_event);
            //                  $("#hide_timebox").show();
            //                  $(".set_alarm_time_word").show();
            //                }else{
            //                  $("#at_home_btn").switchBtn(false,"","",set_event);
            //                  $("#hide_timebox").hide();
            //                  $(".set_alarm_time_word").hide();
            //                }
            //              }
            //              }
            //          }else{
            //            if(scene_data.flag){            
            //              $("#at_home_btn").switchBtn(true,"","",set_plan_record);
            //              $("#hide_timebox").show();
            //              $(".set_alarm_time_word").show();
            //            }else{ 
            //              $("#at_home_btn").switchBtn(false,"","",set_plan_record);
            //              $("#hide_timebox").hide();
            //            }
            //          }
            //        }else if(scene_data.name=="in"){
            //          l_scene_data_active = msg.data.info.scene[i];
            //        }
            //    }
            //    req_data = {
            //        sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1, info: {
            //          select: data.data.info.select,
            //          scene: [{name: "auto", flag: 0},
            //          {
            //            name: "out",
            //            flag: l_scene_data_out.flag,
            //            dev: l_scene_data_out.dev
            //          },
            //          {
            //            name: "in",
            //            flag: l_scene_data_active.flag,
            //            dev: l_scene_data_active.dev
            //          }]
            //        },
            //        func:function(msg){
            //      //_this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
            //      }
            //    }
            //  } 
            // }//get_scene

            // $("#buffer_page").show();
            // 展示遮罩层
            _this.publicFunc.showBufferPage()
            _this.$api.set.scene_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              get_scene_ack(res)
            })
            //为了实现开关效果
            let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");

            if (g_total_data != "") {      //根据设置的时间日期值渲染开关页面
              schedule_get(g_total_data);
            } else {                       //页面一上来从接口取得值渲染开关页面
              _this.$api.set.schedule_get({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                schedule_get_ack(res)
              })
            }

            function schedule_get (g_data) { //设置完时间日期 点返回走的函数
              if (day_list.length != 0) {
                for (let i = 0; i < day_list.length; i++) {
                  let classname = '';
                  if (i == day_list.length - 1) {
                    classname = 'time_menu_list_last';
                  } else {
                    classname = 'time_menu_list';
                  }
                  l_dom_set_out_time_box.innerHTML +=
                    "<div class='" + classname + " select_set_time_btn' index='" + i + "' time='" + day_list[i].start + "_" + day_list[i].end + "_" + day_list[i].week + "'>"
                    + "<div class='time_list_name'>"
                    + "<div class='time_list_name_title record_padding'>" + day_list[i].start + ":00 - " + day_list[i].end + ":00</div>"
                    + "<div class='time_list_name_tips'>" + day_list[i].week + "</div>"
                    + "</div>"
                    + "<div class='list_info'>"
                    + "<div class='right_arrow'></div>"
                    + "</div>"
                    + "</div>";
                }
                let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.select_set_time_btn');
                for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                  l_dom_selsect_set_time_btn[n].onclick = function () {
                    _this.g_is_add = "false";
                    let time = this.getAttribute('time');
                    index = this.getAttribute('index');
                    let arr = "";
                    if (time.split("_")[2].indexOf(mcs_Sunday_and) != -1) {
                      arr += "0."
                    }
                    if (time.split("_")[2].indexOf(mcs_Monday_and) != -1) {
                      arr += "1."
                    }
                    if (time.split("_")[2].indexOf(mcs_Tuesday_and) != -1) {
                      arr += "2."
                    }
                    if (time.split("_")[2].indexOf(mcs_Wednesday_and) != -1) {
                      arr += "3."
                    }
                    if (time.split("_")[2].indexOf(mcs_Thursday_and) != -1) {
                      arr += "4."
                    }
                    if (time.split("_")[2].indexOf(mcs_Friday_and) != -1) {
                      arr += "5."
                    }
                    if (time.split("_")[2].indexOf(mcs_Saturday_and) != -1) {
                      arr += "6."
                    }
                    arr = arr.substring(0, arr.length - 1);
                    _this.g_set_out_time = day_list[index].start + "_" + day_list[index].end + "_" + arr;
                    alarm_device_tips_set_time();
                  }
                }
              }
            }//schedule_get

            function schedule_time_format (arr) {
              let start_time = [], end_time = [];
              for (let j = 0; j < arr.length; j++) {
                let num = -1;
                start_time[j] = [];
                end_time[j] = [];
                for (let i = -1; i < arr[j].length;) {
                  if (arr[j].indexOf(0, i) == i && i != -1) {
                    i++;
                    end_time[j][num]++;
                  } else if (arr[j].indexOf(0, i) < 0 && i > 0) {
                    i = arr[j].length;
                  } else if (arr[j].indexOf(0, i) < 0 && i <= 0) {
                    i = arr[j].length;
                    start_time[j][0] = 0;
                    end_time[j][0] = 0;
                  } else {
                    num++;
                    start_time[j][num] = arr[j].indexOf(0, i)
                    end_time[j][num] = arr[j].indexOf(0, i)
                    i = arr[j].indexOf(0, i);
                  }
                }
              }
              let length;
              for (let time_i = 0; time_i < 7; time_i++) {
                for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
                  if (end_time[time_i][time_j]) {
                    length = time_format.length;
                    if (length > 0) {
                      let is_exist = 0;
                      for (let time_format_i = 0; time_format_i < length; time_format_i++) {
                        if (start_time[time_i][time_j] == time_format[time_format_i].start_time && end_time[time_i][time_j] == time_format[time_format_i].end_time) {
                          time_format[time_format_i].week.push(time_i);
                          is_exist = 1;
                        }
                      }
                      if (is_exist == 0) {
                        time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                      }
                    } else {
                      time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                    }
                  }
                }
              }
              // l_dom_set_out_time_box.innerHTML = "<div id='set_time_box'></div>"
              for (let k = 0; k < time_format.length; k++) {
                let week = "";
                let week_num = '';
                for (let m = 0; m < time_format[k].week.length; m++) {
                  if (time_format[k].week[m] == 0) {
                    week += mcs_Sunday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 1) {
                    week += mcs_Monday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 2) {
                    week += mcs_Tuesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 3) {
                    week += mcs_Wednesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 4) {
                    week += mcs_Thursday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 5) {
                    week += mcs_Friday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 6) {
                    week += mcs_Saturday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  }
                }
                week = week.substring(0, week.length - 1)
                week_num = week_num.substring(0, week_num.length - 1)

                let classname = '';
                // if (k == time_format.length - 1) {
                //   classname = 'time_menu_list_last';
                // } else {
                //   classname = 'time_menu_list';
                // }
                l_dom_set_out_time_box.innerHTML +=
                  "<div class='" + classname + " selsect_set_time_btn' index='" + k + "' time='" + time_format[k].start_time + "_" + time_format[k].end_time + "_" + week_num + "'>"
                  + "<div class='time_list_name'>"
                  + "<div class='time_list_name_title record_padding'>" + time_format[k].start_time + ":00 - " + time_format[k].end_time + ":00</div>"
                  + "<div class='time_list_name_tips'>" + week + "</div>"
                  + "</div>"
                  + "<div class='list_info'>"
                  + "<div class='right_arrow'></div>"
                  + "</div>"
                  + "</div>";
                day_list.push({ start: time_format[k].start_time, end: time_format[k].end_time, week: week });
              }
              let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.selsect_set_time_btn');
              for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                l_dom_selsect_set_time_btn[n].onclick = function () { //点击每一个设置时间按钮
                  _this.g_is_add = "false";
                  let time = this.getAttribute('time');
                  index = this.getAttribute('index');
                  _this.g_set_out_time = time;
                  alarm_device_tips_set_time();
                }
              }
            }//schedule_time_format

            _this.publicFunc.mx("#submit_apply").onclick = function () {
              _this.record_flag_out = "false";
              _this.g_show = 'false';
              _this.$api.set.schedule_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                sch: {
                  degree: 3600,
                  schedule: g_total_data
                }
              }).then(res => {
                if (res && res.result === "") {
                  _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                } else if (res.result === "permission.denied") {
                  _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                }
              })
              req_data.info.scene[2].flag = 0;
              req_data.info.scene[2].dev[0].flag = 0;
              _this.$api.set.scene_set(req_data)
            }

            function compile_week () {
              let week_select = _this.g_select_week.slice();
              $("add_device_page").show();
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Sunday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Monday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Tuesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Wednesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Thursday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Friday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Saturday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "</div>"

                + "</div>"

              let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");
              let l_dom_set_week_list = _this.publicFunc.mx(".set_week");
              for (let i = 0; i < l_dom_set_week_list.length; i++) {
                l_dom_set_week_list[i].index = i;
                l_dom_set_week_list[i].onclick = function () {
                  if ($(this).find(".list_info_select").hasClass("list_info_select_img")) {
                    week_select[this.index] = 1;
                    $(this).find(".list_info_select").removeClass('list_info_select_img').addClass('list_info_clickselect_img')

                  } else {
                    week_select[this.index] = 0;
                    $(this).find(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img')
                  }
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i] == 1) {
                      g_week_w = "[" + week_select.join() + "]";
                      return;
                    }
                  }
                  _this.native_can_back= false;
                }
              }

              for (i = 0; i < week_select.length; i++) {
                if (week_select[i]) {
                  l_dom_set_week_list[i].click();
                }
              }
              l_dom_record_back_box.onclick = function () {
                if (week_select.indexOf(1) == -1) {
                  $(".time_select_tips").show();
                  setTimeout("$('.time_select_tips').hide();", 3000)
                } else {
                  alarm_device_tips_set_time();
                }
              }
            }//compile_week

            function alarm_device_tips_set_time () {
              _this.native_can_back= true;
              g_aa_data = g_total_data;
              let flag = true;
              let repeat = false;
              let start_time = '00';
              let end_time = '24';
              let old_start_time = '00';
              let old_end_time = "00";
              let old_week = "";
              let week = '';
              let week_new = []; //保存选中哪些日期值
              if (g_set_old_out_time == "" && _this.g_is_add == "false") {
                g_set_old_out_time = _this.g_set_out_time;
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (g_set_old_out_time != "" && _this.g_is_add == "false") {
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (_this.g_set_out_time) {
                let set_time_out_data = _this.g_set_out_time.split("_");
                start_time = set_time_out_data[0] >= 10 ? set_time_out_data[0] : "0" + set_time_out_data[0];
                end_time = set_time_out_data[1] >= 10 ? set_time_out_data[1] : "0" + set_time_out_data[1];
                week = set_time_out_data[2] ? set_time_out_data[2].split(".") : [];
              }
              //add default time
              if (_this.g_is_add == "true") {
                week = [0, 1, 2, 3, 4, 5, 6]
              }
              let temp = eval(g_week_w);
              if (temp.length == 7) {
                let j = 0;
                for (i = 0; i < temp.length; i++) {
                  if (temp[i]) {
                    week_new[j] = i;
                    j++;
                  }
                }
              }
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div><div id='delete_set_record'>" + mcs_delete + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_time_list set_starttime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
                + "</div>"

                + "<div style='height:2rem;background:#EFEFF4'></div>"
                + "<div class='set_time_list set_endtime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
                + "</div>"
                + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
                + "</div>"
                + "<div class='select_week_box' id='click_arrow' style='overflow:hidden;width:660px;margin-top:30px;'>"
                + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
                + "<div class='week_Box' style='float:right;width:400px;'>"
                + "<div class='week_list' id='week0'>" + mcs_Sunday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week1'>" + mcs_Monday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week2'>" + mcs_Tuesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week3'>" + mcs_Wednesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week4'>" + mcs_Thursday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week5'>" + mcs_Friday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week6'>" + mcs_Saturday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
                + "</div>"

                + "</div>"
                + "</div>"
                + "</div>"
              //+"<div id='set_time_submit_btn' class='set_submit_btn'>"+mcs_ok+"</div>"
              //+"<div id='set_time_del_btn' class='set_del_btn'>"+mcs_delete+"</div>";
              _this.publicFunc.mx("#click_arrow").onclick = function () {
                if (temp.length != 0) {
                  _this.g_select_week = week_select;
                } else {
                  _this.g_select_week = old_week_select;
                }
                let time = parseInt(_this.publicFunc.mx("#start_time").innerHTML) + "_" + parseInt(_this.publicFunc.mx("#end_time").innerHTML) + "_";
                for (let i = 0; i < _this.g_select_week.length; i++) {
                  if (_this.g_select_week[i] == 1) {
                    time += i + "."
                  }
                }
                time.substring(0, time.length - 1)
                _this.g_set_out_time = time;
                compile_week();
              }
              let week_select = [0, 0, 0, 0, 0, 0, 0];
              let old_week_select = [0, 0, 0, 0, 0, 0, 0];

              if (temp.length !== 0) {
                week_select = temp;
              }

              function stringToHex (data) {
                let val = "", arr = [], arr0 = [];
                for (let i = 0; i < data.length; i++) {
                  val = parseInt(data[i], 2).toString(16);
                  arr[i] = val;
                }
                for (let j = 0; j < data.length; j++) {
                  arr0[j] = 0xff & ("0x" + arr[j]);
                }
                return arr0;
              }

              function set_time_event () {
                $("#start_time").date({ theme: "datetime", h: start_time });
                $("#end_time").date({ theme: "datetime", h: end_time });
                $("#start_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })

                $("#end_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })
                let l_dom_week_list = _this.publicFunc.mx(".week_list");
                for (let i = 0; i < l_dom_week_list.length; i++) {
                  let is_has = $(this).hasClass("week_list_active");
                  l_dom_week_list[i].index = i;
                  for (let h = 0; h < week_new.length; h++) {
                    if (i == week_new[h]) {
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (h == week_new.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }

                  for (let j = 0; j < week.length; j++) {
                    if (week_new.length !== 0) {
                      continue;
                    }
                    if (i == week[j]) {
                      //l_dom_week_list[i].click();
                      old_week_select[i] = 1;
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (j == week.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                      //$(id_week).addClass("week_list_active")
                    }
                  }
                }
                if (temp.length != 0) {
                  let y = temp;
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                      }
                      week_select[i] = y[i];
                    }
                  }
                } else {
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                        week_select[i] = 1;
                      }
                    }
                  }
                }
                function set_time_func (type) {
                  repeat = false;
                  let index = -1;
                  let time_select = [];
                  let start_time = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                  let end_time = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                  let new_time_select = [];
                  if (start_time >= end_time) {
                    repeat = true;
                    flag = false;
                    _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
                    return;
                  }
                  flag = true;
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i]) {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        if (j >= start_time && j < end_time) {
                          tmp_data += "0"
                        } else {
                          tmp_data += "1"
                        }
                        time_select[index] = tmp_data.split("").reverse().join("");
                      }
                    } else {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        tmp_data += "1"
                        time_select[index] = tmp_data;
                      }
                    }
                  }
                  function get_select_time (g_total_data) {
                    if (g_total_data != "") {
                      let l_data_2 = mcodec.b64_2_binary(g_total_data, 1), str = "", arr = [], arr2 = [], arr_tmp = [];
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
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < old_week.length; i++) {
                            let arr_all = "";
                            let arr_all_arr = [];
                            let arr1 = "", arr2 = "", arr3 = "";
                            for (let j = 0; j < 3; j++) {
                              arr_all += arr[old_week[i] * 3 + j].split("").reverse().join("");
                            }
                            arr_all_arr = arr_all.split("");
                            for (let m = parseInt(old_start_time); m < parseInt(old_end_time); m++) {
                              arr_all_arr[m] = "1";
                            }
                            for (let k = 0; k <= 7; k++) {
                              arr1 += arr_all_arr[k];
                            }
                            for (k = 8; k <= 15; k++) {
                              arr2 += arr_all_arr[k]
                            }
                            for (k = 16; k <= 23; k++) {
                              arr3 += arr_all_arr[k]
                            }
                            arr[old_week[i] * 3] = arr1.split("").reverse().join("");
                            arr[old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
                            arr[old_week[i] * 3 + 2] = arr3.split("").reverse().join("");

                          }
                        }
                        let select = [];
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < week_select.length; i++) {
                            if (week_select[i] == 1) {
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;
                      }
                    }
                  }
                  get_select_time(g_total_data)
                }
                let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");
                l_dom_record_back_box.onclick = function () {
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  set_time_func("submit");
                  if (!flag) {
                    return;
                  }
                  if (_this.g_is_add == "false") {
                    day_list[index].start = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                    day_list[index].end = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                    day_list[index].week = arr;
                  } else {
                    day_list.push({ start: parseInt(_this.publicFunc.mx("#start_time").innerHTML), end: parseInt(_this.publicFunc.mx("#end_time").innerHTML), week: arr })
                  }
                  if (!repeat) {
                    g_set_old_out_time = "";
                    _this.g_set_out_time = "";
                    g_week_w = [];
                    g_total_data = g_aa_data;
                    create_set_alarm_device_tips_page(1);
                  }
                }
                _this.publicFunc.mx("#delete_set_record").onclick = function () { //设置完时间日期页面点击删除
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  if (_this.g_is_add == "false") {
                    day_list.splice(index, 1);
                  } else {
                    create_set_alarm_device_tips_page();
                    return;
                  }
                  set_time_func("del");
                  if (!repeat) {
                    g_set_old_out_time = "";
                    g_total_data = g_aa_data;
                    create_set_alarm_device_tips_page();
                  }
                }
              }
              set_time_event();
            }//alarm_device_tips_set_time
          }//create_set_alarm_device_tips_page

          // $("#buffer_page").show();
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          //console.log("get_dev_info_this")
          _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            face_detect = res.face_detect;
            sound_detect = res.sound_detect;
            _this.$api.set.scene_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              record_get_ack(res)
            })
          })
          break;
        }
        case "alarm_device": { //data.flag=3 无ocsene时 I/O报警
          info.dom.innerHTML =
            "<div id = 'alert_dev_info' class = 'list_right_box' >"
            + "<div class = 'list_right_item_ex' style='display:none;'>"
            + "<div class='options_float_left'>" + mcs_i_o_alarm + ":</div>"
            + "<div id='checkbox_deployment_div' class='options_float_right'></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex' style='display:none;'>"
            + "<div class='options_float_left'>- " + mcs_input + "</div>"
            + "<div class='options_float_right select_block'>"
            + "<input type='text' id='select_input_level' class='input_read_only'  disabled/>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item' style='display:none;'>"
            + "<div class='options_float_left'>- " + mcs_outinput + "</div>"
            + "<div class='options_float_right '>"
            + "<input  id='select_linkage_level' class='input_read_only'  disabled/>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_motion_detection_sensitivity + "</span>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='vimtag_options_float_left'>- " + mcs_daytime + "</div>"
            + "<div class='options_float_right' style='width:200px;'>"
            + "<label for='input_threshold'></label>"
            + "<input name='slider' type='text' id='input_threshold' class='fd_tween fd_classname_extraclass fd_hide_input "
            + "fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='vimtag_options_float_left'>- " + mcs_night + "</div>"
            + "<div class='options_float_right' style='width:200px;'>"
            + "<label for='input_thresholdLevelNight'></label>"
            + "<input name='slider' type='text' id='input_thresholdLevelNight' class='fd_tween fd_classname_extraclass fd_hide_input "
            + "fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
            + "</div>"
            + "</div>"
            + "<div class='options_float_right' style='clear:both'>"
            + "<button id='button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>"
            + "</div>";
          let l_dom_checkbox_deployment_div = _this.publicFunc.mx("#checkbox_deployment_div");
          let l_dom_select_input_level = _this.publicFunc.mx("#select_input_level");
          let l_dom_select_linkage_level = _this.publicFunc.mx("#select_linkage_level");
          let l_dom_input_threshold = _this.publicFunc.mx("#input_threshold");
          let l_dom_input_thresholdLevelNight = _this.publicFunc.mx("#input_thresholdLevelNight");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_dom_mask_switch_checkbox = _this.publicFunc.mx("#mask_switch_checkbox");
          function add_alarm_device_event () {
            l_dom_button_setup.onclick = function () {
              let IoInputMode, IoOutputMode;
              l_dom_select_input_level.value == 1 ? IoInputMode = "Close" : IoInputMode = "Open";
              l_dom_select_linkage_level.value == 1 ? IoOutputMode = "Colse" : IoOutputMode = "Open";
              let conf = { sn: _this.$store.state.jumpPageData.selectDeviceIpc, io_input: IoInputMode, io_output: IoOutputMode, sensitivity: l_dom_input_threshold.value, night_sensitivity: l_dom_input_thresholdLevelNight.value };
              conf.func = function (msg) {
                if (msg.result == "") {
                  _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                } else if (msg.result == "permission.denied") {
                  _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                }
              }
              _this.$api.set.alarm_device_set(conf).then(res =>{
                _this.set_result(res)
              })
            };
          }
          function alarm_device_get_ack (msg) {
            if (msg.data_flag == 1) {
              if (msg.io_input == "Open") {
                l_dom_select_input_level.value = mcs_normally_open;
              }
              else {
                l_dom_select_input_level.value = mcs_normally_close;
              }
              if (msg.io_output == "Open") {
                l_dom_select_linkage_level.value = mcs_normally_open;
              }
              else {
                l_dom_select_linkage_level.value = mcs_normally_close;
              }
              if (l_dom_input_thresholdLevelNight)
                fdSliderController.increment("input_thresholdLevelNight", msg.night_sensitivity - l_dom_input_thresholdLevelNight.value);
              if (l_dom_input_threshold)
                fdSliderController.increment("input_threshold", msg.sensitivity - l_dom_input_threshold.value);
            } else {
              if (msg.conf.enable == 1) {
                $(l_dom_mask_switch_checkbox).iButton("toggle", true);
              }
              else {
                $(l_dom_mask_switch_checkbox).iButton("toggle", false);
              }
            }

          }
          add_alarm_device_event();
          fdSliderController.create();
          _this.$api.set.alarm_device_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, flag: 1 }).then(res => {
            alarm_device_get_ack(res)
          })
          if (determine_the_version({ type: "Positive", version: version_Category.curise_motion_version })) {
            _this.$api.set.alarm_device_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, flag: 2 }).then(res => {
              alarm_device_get_ack(res)
            })
          }
          break;
        }
        case "alarm_action": { //data.flag==3时报警联动
          info.dom.innerHTML =
            "<div id = 'alert_linkage_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_name + "</div>"
            + "<div  class='options_float_right select_block' style='margin-top:0px;'><select id='select_input_devices'></select></div>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_enabled + "</div>"
            + "<div  class='options_float_right' style='margin-top:0px;'>"
            + "<input id='alarm_switch_checkbox' type='checkbox' />"
            + "</div>"
            + "</div>"
            + "<div id = 'open_switch'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_alarm_sources + "</div>"
            + "<div class='options_float_right'><input type='text' id='alarm_sources' class='input_read_only'  disabled/></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_alarm_action + ":</div>"
            + "<div class='options_float_right'></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>- " + mcs_i_o_alarm + "</div>"
            + "<div class='options_float_right'><input type='checkbox' id='IoOutputEnable'/></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>- " + mcs_snapshot + "</div>"
            + "<div class='options_float_right'><input type='checkbox' id='SnapShotEnable' /></div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>- " + mcs_record + "</div>"
            + "<div class='options_float_right'><input type='checkbox' id='RecordEnable' /></div>"
            + "</div>"
            + "</div>"
            + "<div class='options_float_right' style='clear:both'>"
            + "<button id='Arming_button' class='list_right_button'>" + mcs_alert_on + "</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            + "<button id='button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>"
            + "</div>";
          let l_dom_IoOutputEnable = _this.publicFunc.mx("#IoOutputEnable");
          let l_dom_SnapShotEnable = _this.publicFunc.mx("#SnapShotEnable");
          let l_dom_RecordEnable = _this.publicFunc.mx("#RecordEnable");
          let l_dom_select_input_devices = _this.publicFunc.mx("#select_input_devices");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_dom_alarm_sources = _this.publicFunc.mx("#alarm_sources");
          let l_dom_Arming_button = _this.publicFunc.mx("#Arming_button");
          let l_dom_alarm_switch_checkbox = _this.publicFunc.mx("#alarm_switch_checkbox");
          let l_dom_open_switch = _this.publicFunc.mx("#open_switch");
          let l_dom_Action = {};
          $(l_dom_select_input_devices).tzSelect();
          function add_alarm_action_event () {
            $(l_dom_IoOutputEnable).iButton({
              labelOn: "On",
              labelOff: "Off"
            });
            $(l_dom_SnapShotEnable).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_SnapShotEnable.checked) {
                  $("#SnapShotInterval_content").fadeIn();
                } else {
                  $("#SnapShotInterval_content").fadeOut();
                }
              }
            });
            $(l_dom_RecordEnable).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_RecordEnable.checked) {
                  //$("#PreRecordTime_content").fadeIn();
                }
                else {
                  //$("#PreRecordTime_content").fadeOut();
                }
              }
            });
            $(l_dom_alarm_switch_checkbox).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_alarm_switch_checkbox.checked) {
                  $(l_dom_open_switch).fadeIn();
                }
                else {
                  $(l_dom_open_switch).fadeOut();
                }
              }
            });
            //Arm & Disarm key events
            l_dom_Arming_button.onclick = function () {  //Arm
              if (l_dom_Arming_button["innerHTML"] == mcs_alert_on) {
                _this.publicFunc.delete_tips({
                  content: mcs_prompt_alert_on, func: function () {
                    _this.$api.set.alarm_action_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, enable: 1 }).then(res => {
                      _this.set_result(res)
                    })
                  }
                });
              }
              else//Disarm
              {
                _this.publicFunc.delete_tips({
                  content: mcs_prompt_alert_off, func: function () {
                    _this.$api.set.alarm_action_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, enable: 0 }).then(res => {
                      _this.set_result(res)
                    })
                  }
                });
              }
            }
            //Application of key events
            l_dom_button_setup.onclick = function () {
              let Actions_one = new Object();
              let Arming_Enable;
              Actions_one.token = l_dom_Action.token;
              Actions_one.enable = l_dom_alarm_switch_checkbox.checked ? 1 : 0;
              Actions_one.name = l_dom_Action.name;
              Actions_one.srcs = l_dom_Action.srcs;
              Actions_one.io_out_enable = l_dom_IoOutputEnable.checked ? 1 : 0;
              Actions_one.snapshot_enable = l_dom_SnapShotEnable.checked ? 1 : 0;
              Actions_one.record_enable = l_dom_RecordEnable.checked ? 1 : 0;
              Actions_one.snapshot_interval = l_dom_Action.snapshot_interval;
              //Actions_one.pre_record_time=PreRecordTime.value;
              if (l_dom_Arming_button["innerHTML"] == mcs_alert_on) {
                Arming_Enable = 0;
              }
              else {
                Arming_Enable = 1;
              }
              _this.$api.set.alarm_action_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, enable: 1, actions: Actions_one }).then(res => {
                _this.set_result(res)
              })
            }
          }
          function ccm_AlertAction_Info (obj) {
            l_dom_Action = obj;
            if (l_dom_Action.enable) {
              $(l_dom_alarm_switch_checkbox).iButton("toggle", true);
              $(l_dom_open_switch).fadeIn();
            } else {
              $(l_dom_alarm_switch_checkbox).iButton("toggle", false);
              $(l_dom_open_switch).fadeOut();
            }
            if (l_dom_Action.io_out_enable) {
              $(l_dom_IoOutputEnable).iButton("toggle", true);
            } else {
              $(l_dom_IoOutputEnable).iButton("toggle", false);
            }
            if (l_dom_Action.snapshot_enable) {
              $(l_dom_SnapShotEnable).iButton("toggle", true);

            } else {
              $(l_dom_SnapShotEnable).iButton("toggle", false);

            }
            if (l_dom_Action.record_enable) {
              $(l_dom_RecordEnable).iButton("toggle", true);
              //$("#PreRecordTime_content").fadeIn();
            } else {
              $(l_dom_RecordEnable).iButton("toggle", false);
              //$("#PreRecordTime_content").fadeOut();
            }
            //PreRecordTime.value    = l_dom_Action.pre_record_time;
            if (l_dom_Action.srcs) {
              let innerhtml = "";
              for (let i = 0; i < l_dom_Action.srcs.length; i++) {
                if (!l_dom_Action.srcs[i].devs) continue;
                for (j = 0; j < l_dom_Action.srcs[i].devs.length; j++) {
                  if (l_dom_Action.srcs[i].devs[j] == "motion")
                    innerhtml += mcs_motion;
                  else if (l_dom_Action.srcs[i].devs[j] == "io")
                    innerhtml += mcs_i_o_alarm;
                  else if (l_dom_Action.srcs[i].devs[j] == "pir")
                    innerhtml += mcs_pir;

                  if (l_dom_Action.srcs[i].devs[j + 1])
                    innerhtml += "/";
                }
                if (l_dom_Action.srcs[i + 1])
                  innerhtml += "  |  ";
              }
              l_dom_alarm_sources.value = innerhtml;
            }
          }
          function alarm_action_get_ack (msg) {
            if (msg.actions) {
              let innerhtml;
              for (let i = 0; i < msg.actions.length; i++) {
                if (msg.actions[i].name == "io_alert") {
                  innerhtml += "<option value='io_alert'>" + mcs_i_o_alarm + "</option>";
                }
                else if (msg.actions[i].name == "motion_alert") {
                  innerhtml += "<option value='motion_alert'>" + mcs_motion + "</option>";
                }
                else if (msg.actions[i].name == "pir") {
                  innerhtml += "<option value='pir'>" + mcs_pir + "</option>";
                } else {
                  innerhtml += "<option value='" + msg.actions[i].name + "'>" + msg.actions[i].name + "</option>";
                }
              }
              $(l_dom_select_input_devices).html(innerhtml);
              $(l_dom_select_input_devices).tzSelect();

              ccm_AlertAction_Info(msg.actions[0]);
              l_dom_select_input_devices.change_value = function (obj) {
                $(l_dom_select_input_devices).tzSelect();
                for (let i = 0; i < msg.actions.length; i++) {
                  if (l_dom_select_input_devices.value == msg.actions[i].name) {
                    ccm_AlertAction_Info(msg.actions[i]);
                  }
                }
              }
            }
            if (msg.enable) {
              l_dom_Arming_button["innerHTML"] = mcs_alert_off;
            } else {
              l_dom_Arming_button["innerHTML"] = mcs_alert_on;
            }
          }
          add_alarm_action_event();
          _this.$api.set.alarm_action_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            alarm_action_get_ack(res)
          })
          break
        }
        case "scheduled_alerting": {
          info.dom.innerHTML =
            "<div id = 'alert_plan_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_enabled + "</div>"
            + "<div id='alert_checkbox_schedule_div' class='options_float_right' style='margin-top:0px;'><input type='checkbox' id='alert_checkbox_schedule'/></div>"
            + "</div>"
            + "<div id = 'schedule_alert_content'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_scheduled_alerting + "</div>"
            + "</div>"
            + "<div id='alert_radio_schedule_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_alerting_one + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'>"
            + "<input id='schedule_alert1' type='checkbox'/>"
            + "</div>"
            + "</div>"
            + "<div id='schedule_alert1_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='alert_input_begin_time1' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='alert_input_end_time1' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div1' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class1'  value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='alert_week_checkbox1_div' style='float:left;margin-left:10px;'><input type='checkbox' id='alert_week_checkbox1'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_alerting_two + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='schedule_alert2' type='checkbox' /></div>"
            + "</div>"
            + "<div id='schedule_alert2_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='alert_input_begin_time2' type='text' value='00:00' class='time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='alert_input_end_time2' type='text' value='00:00' class='time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div2' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class2' value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='alert_week_checkbox2_div' style='float:left;margin-left:10px;'><input type='checkbox' id='alert_week_checkbox2'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_alerting_three + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='schedule_alert3' type='checkbox' /></div>"
            + "</div>"
            + "<div id='schedule_alert3_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='alert_input_begin_time3' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='alert_input_end_time3' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div3' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class3' value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='alert_week_checkbox3_div' style='float:left;margin-left:10px;'><input type='checkbox'  id='alert_week_checkbox3'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_alerting_four + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='schedule_alert4' type='checkbox' /></div>"
            + "</div>"
            + "<div id='schedule_alert4_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='alert_input_begin_time4' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='alert_input_end_time4' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div4' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class4' value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='alert_week_checkbox4_div' style='float:left;margin-left:10px;' ><input type='checkbox'  id='alert_week_checkbox4'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<input class = 'list_right_button' id='button_setup' type = 'button' value = " + mcs_action_apply + ">"
            + "</div>";
          let l_dom_checkbox_schedule = _this.publicFunc.mx("#alert_checkbox_schedule");
          let l_dom_schedule_alert_content = _this.publicFunc.mx("#schedule_alert_content");
          let l_dom_input_begin_time1 = _this.publicFunc.mx("#alert_input_begin_time1");
          let l_dom_input_end_time1 = _this.publicFunc.mx("#alert_input_end_time1");
          let l_dom_input_begin_time2 = _this.publicFunc.mx("#alert_input_begin_time2");
          let l_dom_input_end_time2 = _this.publicFunc.mx("#alert_input_end_time2");
          let l_dom_input_begin_time3 = _this.publicFunc.mx("#alert_input_begin_time3");
          let l_dom_input_end_time3 = _this.publicFunc.mx("#alert_input_end_time3");
          let l_dom_input_begin_time4 = _this.publicFunc.mx("#alert_input_begin_time4");
          let l_dom_input_end_time4 = _this.publicFunc.mx("#alert_input_end_time4");

          let l_dom_schedule_alert1 = _this.publicFunc.mx("#schedule_alert1");
          let l_dom_schedule_alert2 = _this.publicFunc.mx("#schedule_alert2");
          let l_dom_schedule_alert3 = _this.publicFunc.mx("#schedule_alert3");
          let l_dom_schedule_alert4 = _this.publicFunc.mx("#schedule_alert4");

          let l_dom_week_checkbox1 = _this.publicFunc.mx("#alert_week_checkbox1");
          let l_dom_week_checkbox2 = _this.publicFunc.mx("#alert_week_checkbox2");
          let l_dom_week_checkbox3 = _this.publicFunc.mx("#alert_week_checkbox3");
          let l_dom_week_checkbox4 = _this.publicFunc.mx("#alert_week_checkbox4");

          let l_dom_schedule_alert1_content = _this.publicFunc.mx("#schedule_alert1_content");
          let l_dom_schedule_alert2_content = _this.publicFunc.mx("#schedule_alert2_content");
          let l_dom_schedule_alert3_content = _this.publicFunc.mx("#schedule_alert3_content");
          let l_dom_schedule_alert4_content = _this.publicFunc.mx("#schedule_alert4_content");

          let l_dom_alert_week_checkbox1_div = _this.publicFunc.mx("#alert_week_checkbox1_div");
          let l_dom_alert_week_checkbox2_div = _this.publicFunc.mx("#alert_week_checkbox2_div");
          let l_dom_alert_week_checkbox3_div = _this.publicFunc.mx("#alert_week_checkbox3_div");
          let l_dom_alert_week_checkbox4_div = _this.publicFunc.mx("#alert_week_checkbox4_div");
          let l_dom_week_checkbox_div1 = _this.publicFunc.mx(".week_checkbox_div1");
          let l_dom_week_checkbox_div2 = _this.publicFunc.mx(".week_checkbox_div2");
          let l_dom_week_checkbox_div3 = _this.publicFunc.mx(".week_checkbox_div3");
          let l_dom_week_checkbox_div4 = _this.publicFunc.mx(".week_checkbox_div4");
          let l_dom_radio_schedule_content = _this.publicFunc.mx("#alert_radio_schedule_content");
          let l_dom_week_checkbox = _this.publicFunc.mx("#alert_week_checkbox");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_dom_week_checkbox_class1 = _this.publicFunc.mx(".week_checkbox_class1");
          let l_dom_week_checkbox_class2 = _this.publicFunc.mx(".week_checkbox_class2");
          let l_dom_week_checkbox_class3 = _this.publicFunc.mx(".week_checkbox_class3");
          let l_dom_week_checkbox_class4 = _this.publicFunc.mx(".week_checkbox_class4");
          let l_dom_manager_page = _this.publicFunc.mx("#manager_page");
          let l_week_array = ["0x1", "0x2", "0x4", "0x8", "0x10", "0x20", "0x40"];
          function checkbox_checkbox1_callback () {
            let week_checkbox_class = l_dom_week_checkbox_class1;
            if (l_dom_week_checkbox1.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(l_dom_week_checkbox_div1).jNice();
          }
          function checkbox_checkbox2_callback () {
            let week_checkbox_class = l_dom_week_checkbox_class2;
            if (l_dom_week_checkbox2.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div2").jNice();
          }
          function checkbox_checkbox3_callback () {
            let week_checkbox_class = l_dom_week_checkbox_class3;
            if (l_dom_week_checkbox3.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div3").jNice();
          }
          function checkbox_checkbox4_callback () {
            let week_checkbox_class = l_dom_week_checkbox_class4;
            if (l_dom_week_checkbox4.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div4").jNice();
          }
          $(l_dom_radio_schedule_content).hide();
          $(l_dom_schedule_alert_content).hide();
          $(l_dom_schedule_alert1_content).hide();
          $(l_dom_schedule_alert2_content).hide();
          $(l_dom_schedule_alert3_content).hide();
          $(l_dom_schedule_alert4_content).hide();
          $(l_dom_alert_week_checkbox1_div).jNice({ callback: checkbox_checkbox1_callback });
          $(l_dom_alert_week_checkbox2_div).jNice({ callback: checkbox_checkbox2_callback });
          $(l_dom_alert_week_checkbox3_div).jNice({ callback: checkbox_checkbox3_callback });
          $(l_dom_alert_week_checkbox4_div).jNice({ callback: checkbox_checkbox4_callback });
          $(l_dom_week_checkbox_div1).jNice();
          $(l_dom_week_checkbox_div2).jNice();
          $(l_dom_week_checkbox_div3).jNice();
          $(l_dom_week_checkbox_div4).jNice();
          function add_scheduled_alerting_event () {
            function time_check () {
              let time_Standard = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
              if (l_dom_schedule_alert1.checked) {
                if (!time_Standard.test(l_dom_input_begin_time1.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time1.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time1.value >= l_dom_input_end_time1.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              if (l_dom_schedule_alert2.checked) {
                if (!time_Standard.test(l_dom_input_begin_time2.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time2.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time2.value >= l_dom_input_end_time2.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              if (l_dom_schedule_alert3.checked) {
                if (!time_Standard.test(l_dom_input_begin_time3.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time3.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time3.value >= l_dom_input_end_time3.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              if (l_dom_schedule_alert4.checked) {
                if (!time_Standard.test(l_dom_input_begin_time4.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time4.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time4.value >= l_dom_input_end_time4.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              return true;
            }
            l_dom_button_setup.onclick = function () {
              if (!time_check()) return;
              let week_checkbox_array = Array();
              for (i = 0; i < 4; i++) {
                if (_this.publicFunc.mx("#schedule_alert" + (i + 1)).checked) {
                  week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class" + (i + 1));
                  let wday = 0;
                  for (j = 0; j < week_checkbox_class.length; j++) {
                    if (week_checkbox_class[j].checked) {
                      wday = wday | l_week_array[week_checkbox_class[j].value];
                    }
                  }
                  if (wday == 0) {
                    //system_tooltip({parent:_this.publicFunc.mx("#week_checkbox"+(i+1)+"_div"), color:"red", position:"right", disappear_way:"time", str:mcs_end_time_should_lt_begin + "."});
                    //return;
                  }
                  let input_begin_time = _this.publicFunc.mx("#alert_input_begin_time" + (i + 1)).value;
                  let input_end_time = _this.publicFunc.mx("#alert_input_end_time" + (i + 1)).value;
                  week_checkbox_array.push({ wday: wday, start: input_time_change({ type: "string", data: input_begin_time }), end: input_time_change({ type: "string", data: input_end_time }) });
                }
              }
              _this.$api.set.use_alert_task_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                sch_enable: l_dom_checkbox_schedule.checked ? 1 : 0,
                times: week_checkbox_array
              }).then(res => {
                _this.set_result(res)
              })
            }
            $(l_dom_schedule_alert1).iButton({
              change: function () {
                if (l_dom_schedule_alert1.checked) {
                  $(l_dom_schedule_alert1_content).fadeIn();
                } else {
                  $(l_dom_schedule_alert1_content).fadeOut();
                }
                $(l_dom_manager_page).mCustomScrollbar("update");

              }
            });
            $(l_dom_schedule_alert2).iButton({
              change: function () {
                if (l_dom_schedule_alert2.checked) {
                  $(l_dom_schedule_alert2_content).fadeIn();
                } else {
                  $(l_dom_schedule_alert2_content).fadeOut();
                }
                $(l_dom_manager_page).mCustomScrollbar("update");
              }
            });
            $(l_dom_schedule_alert3).iButton({
              change: function () {
                if (l_dom_schedule_alert3.checked) {
                  $(l_dom_schedule_alert3_content).fadeIn();
                } else {
                  $(l_dom_schedule_alert3_content).fadeOut();
                }
                $(l_dom_manager_page).mCustomScrollbar("update");
              }
            });
            $(l_dom_schedule_alert4).iButton({
              change: function () {
                if (l_dom_schedule_alert4.checked) {
                  $(l_dom_schedule_alert4_content).fadeIn();
                } else {
                  $(l_dom_schedule_alert4_content).fadeOut();
                }
                $(l_dom_manager_page).mCustomScrollbar("update");
              }
            });
            $(l_dom_checkbox_schedule).iButton({
              change: function () {
                if (l_dom_checkbox_schedule.checked) {
                  $(l_dom_schedule_alert_content).fadeIn();
                } else {
                  $(l_dom_schedule_alert_content).fadeOut();
                }
                $(l_dom_manager_page).mCustomScrollbar("update");
                $(l_dom_radio_schedule_content).show();
              }
            });
          }
          function input_time_change (obj) {
            if (obj.type == "string") {
              return obj.data.substring(obj.data.indexOf(":"), 0) * 60 * 60 + obj.data.substring(obj.data.indexOf(":") + 1, obj.data.length) * 60;
            }
            else if (obj.type == "int") {
              let hour, Minute;
              hour = parseInt(obj.data / 3600);
              Minute = (obj.data % 3600) / 60;
              if (hour < 10) {
                hour = "0" + hour;
              }
              if (Minute < 10) {
                Minute = "0" + Minute;
              }
              return hour + ":" + Minute;
            }
          }
          function dev_alert_get_ack (msg) {
            if (msg.enable) {
              $(l_dom_checkbox_schedule).iButton("toggle", true);
              $(l_dom_radio_schedule_content).show();
              $("#manager_page").mCustomScrollbar("update");
            } else {
              $(l_dom_checkbox_schedule).iButton("toggle", false);
            }
            if (msg.times) {
              $(l_dom_radio_schedule_content).show();
              $("#manager_page").mCustomScrollbar("update");
              for (i = 0; i < msg.times.length; i++) {
                if (msg.times[i].wday) {
                  $("#schedule_alert" + (i + 1)).iButton("toggle", true);
                  week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class" + (i + 1));
                  _this.publicFunc.mx("#alert_input_begin_time" + (i + 1)).value = input_time_change({ type: "int", data: msg.times[i].start });
                  _this.publicFunc.mx("#alert_input_end_time" + (i + 1)).value = input_time_change({ type: "int", data: msg.times[i].end });
                  for (j = 0; j < l_week_array.length; j++) {
                    if (msg.times[i].wday & l_week_array[j]) {
                      for (k = 0; k < week_checkbox_class.length; k++) {
                        if (week_checkbox_class[k].value == j) {
                          week_checkbox_class[k].checked = true;
                        }
                      }
                    }
                  }
                }
                else {
                  $("#schedule_alert" + (i + 1)).iButton("toggle", false);
                }
              }
            }
            $("#manager_page").mCustomScrollbar("update");
            $(".week_checkbox_div1").jNice();
            $(".week_checkbox_div2").jNice();
            $(".week_checkbox_div3").jNice();
            $(".week_checkbox_div4").jNice();
          }
          add_scheduled_alerting_event();
          _this.$api.set.alert_task_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            dev_alert_get_ack(res)
          })
          break//data.flag==3时计划报警
        }
        case "scheduled_recording": {//data.flag==3时计划录像
          info.dom.innerHTML =
            "<div id = 'plan_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_enabled + "</div>"
            + "<div id='checkbox_schedule_div' class='options_float_right' style='margin-top:0px;'><input type='checkbox' id='checkbox_schedule'/></div>"
            + "</div>"
            + "<div id = 'schedule_record_content'>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_7x24_hours + "</div>"
            + "<div class='options_float_right' id='div_radio_H7_24' style='margin-top:15px;'><input id='radio_H7_24' type='radio' name='record_type' ></input></div>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='options_float_left'>" + mcs_scheduled_recording + "</div>"
            + "<div class='options_float_right' id='div_radio_schedule' style='margin-top:15px;'><input id='radio_schedule' type='radio' name='record_type'></input></div>"
            + "</div>"
            + "<div id='radio_schedule_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_one + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'>"
            + "<input id='schedule_record1' type='checkbox'/>"
            + "</div>"
            + "</div>"
            + "<div id='schedule_record1_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='input_begin_time1' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='input_end_time1' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div1' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class1'  value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div1'><input type='checkbox' class='week_checkbox_class1' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='week_checkbox1_div' style='float:left;margin-left:10px;'><input type='checkbox' id='week_checkbox1'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_two + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='schedule_record2' type='checkbox' /></div>"
            + "</div>"
            + "<div id='schedule_record2_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='input_begin_time2' type='text' value='00:00' class='time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='input_end_time2' type='text' value='00:00' class='time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div2' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class2' value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div2'><input type='checkbox' class='week_checkbox_class2' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='week_checkbox2_div' style='float:left;margin-left:10px;'><input type='checkbox' id='week_checkbox2'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_three + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='schedule_record3' type='checkbox' /></div>"
            + "</div>"
            + "<div id='schedule_record3_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='input_begin_time3' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='input_end_time3' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div3' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class3' value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div3'><input type='checkbox' class='week_checkbox_class3' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='week_checkbox3_div' style='float:left;margin-left:10px;'><input type='checkbox'  id='week_checkbox3'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_scheduled_four + ":</div>"
            + "<div class='options_float_right' style='margin-top:0px;'><input id='schedule_record4' type='checkbox' /></div>"
            + "</div>"
            + "<div id='schedule_record4_content'>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_begin_time + "</span>"
            + "<input id='input_begin_time4' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_end_time + "</span>"
            + "<input id='input_end_time4' type = 'text' value = '00:00' class = 'time_input'>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<span class = 'attribute_key_text'>" + mcs_week + "</span>"
            + "</div>"
            + "<div class = 'list_right_item'>"
            + "<div class='vimtag_week_checkbox_div4' style='margin-left:0px;'><input type='checkbox' class='week_checkbox_class4' value='0'></input>" + mcs_sun + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='1'></input>" + mcs_mon + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='2'></input>" + mcs_tue + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='3'></input>" + mcs_wed + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='4'></input>" + mcs_thu + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='5'></input>" + mcs_fri + "</div>"
            + "<div class='vimtag_week_checkbox_div4'><input type='checkbox' class='week_checkbox_class4' value='6'></input>" + mcs_sat + "</div>"
            + "<div id='week_checkbox4_div' style='float:left;margin-left:10px;' ><input type='checkbox'  id='week_checkbox4'></input>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<input class = 'list_right_button' id='button_setup' type = 'button' value = " + mcs_action_apply + ">"
            + "</div>";
          let l_dom_checkbox_schedule = _this.publicFunc.mx("#checkbox_schedule");
          let l_dom_schedule_record_content = _this.publicFunc.mx("#schedule_record_content");
          let l_dom_radio_H7_24 = _this.publicFunc.mx("#radio_H7_24");
          let l_dom_radio_schedule = _this.publicFunc.mx("#radio_schedule");

          let l_dom_input_begin_time1 = _this.publicFunc.mx("#input_begin_time1");
          let l_dom_input_end_time1 = _this.publicFunc.mx("#input_end_time1");
          let l_dom_input_begin_time2 = _this.publicFunc.mx("#input_begin_time2");
          let l_dom_input_end_time2 = _this.publicFunc.mx("#input_end_time2");
          let l_dom_input_begin_time3 = _this.publicFunc.mx("#input_begin_time3");
          let l_dom_input_end_time3 = _this.publicFunc.mx("#input_end_time3");
          let l_dom_input_begin_time4 = _this.publicFunc.mx("#input_begin_time4");
          let l_dom_input_end_time4 = _this.publicFunc.mx("#input_end_time4");

          let l_dom_schedule_record1 = _this.publicFunc.mx("#schedule_record1");
          let l_dom_schedule_record2 = _this.publicFunc.mx("#schedule_record2");
          let l_dom_schedule_record3 = _this.publicFunc.mx("#schedule_record3");
          let l_dom_schedule_record4 = _this.publicFunc.mx("#schedule_record4");

          let l_dom_week_checkbox1 = _this.publicFunc.mx("#week_checkbox1");
          let l_dom_week_checkbox2 = _this.publicFunc.mx("#week_checkbox2");
          let l_dom_week_checkbox3 = _this.publicFunc.mx("#week_checkbox3");
          let l_dom_week_checkbox4 = _this.publicFunc.mx("#week_checkbox4");

          let l_dom_schedule_record1_content = _this.publicFunc.mx("#schedule_record1_content");
          let l_dom_schedule_record2_content = _this.publicFunc.mx("#schedule_record2_content");
          let l_dom_schedule_record3_content = _this.publicFunc.mx("#schedule_record3_content");
          let l_dom_schedule_record4_content = _this.publicFunc.mx("#schedule_record4_content");

          let l_dom_week_checkbox1_div = _this.publicFunc.mx("#week_checkbox1_div");
          let l_dom_week_checkbox2_div = _this.publicFunc.mx("#week_checkbox2_div");
          let l_dom_week_checkbox3_div = _this.publicFunc.mx("#week_checkbox3_div");
          let l_dom_week_checkbox4_div = _this.publicFunc.mx("#week_checkbox4_div");
          let l_dom_week_checkbox_div1 = _this.publicFunc.mx(".week_checkbox_div1");
          let l_dom_week_checkbox_div2 = _this.publicFunc.mx(".week_checkbox_div2");
          let l_dom_week_checkbox_div3 = _this.publicFunc.mx(".week_checkbox_div3");
          let l_dom_week_checkbox_div4 = _this.publicFunc.mx(".week_checkbox_div4");
          let l_dom_radio_schedule_content = _this.publicFunc.mx("#radio_schedule_content");
          let l_week_checkbox = _this.publicFunc.mx("#week_checkbox");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_week_array = ["0x1", "0x2", "0x4", "0x8", "0x10", "0x20", "0x40"];
          $(l_dom_radio_schedule_content).hide();
          $(l_dom_schedule_record1_content).hide();
          $(l_dom_schedule_record2_content).hide();
          $(l_dom_schedule_record3_content).hide();
          $(l_dom_schedule_record4_content).hide();
          $(l_dom_week_checkbox1_div).jNice({ callback: checkbox_checkbox1_callback });
          $(l_dom_week_checkbox2_div).jNice({ callback: checkbox_checkbox2_callback });
          $(l_dom_week_checkbox3_div).jNice({ callback: checkbox_checkbox3_callback });
          $(l_dom_week_checkbox4_div).jNice({ callback: checkbox_checkbox4_callback });
          $(l_dom_week_checkbox_div1).jNice();
          $(l_dom_week_checkbox_div2).jNice();
          $(l_dom_week_checkbox_div3).jNice();
          $(l_dom_week_checkbox_div4).jNice();
          function checkbox_checkbox1_callback () {
            week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class1");
            if (l_dom_week_checkbox1.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div1").jNice();
          }
          function checkbox_checkbox2_callback () {
            week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class2");
            if (l_dom_week_checkbox2.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div2").jNice();
          }
          function checkbox_checkbox3_callback () {
            week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class3");
            if (l_dom_week_checkbox3.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div3").jNice();
          }
          function checkbox_checkbox4_callback () {
            week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class4");
            if (l_dom_week_checkbox4.checked) {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = true;
              }
            }
            else {
              for (i = 0; i < week_checkbox_class.length; i++) {
                week_checkbox_class[i].checked = false;
              }
            }
            $(".week_checkbox_div4").jNice();
          }
          function add_scheduled_recording_event () {
            l_dom_radio_H7_24.onclick = function () {
              if (this.checked) {
                $(l_dom_radio_schedule_content).hide();
                $("#manager_page").mCustomScrollbar("update");
              }
            }
            l_dom_radio_schedule.onclick = function () {
              if (this.checked) {
                $(l_dom_radio_schedule_content).show();
                $("#manager_page").mCustomScrollbar("update");
              }
            }
            function time_check () {
              time_Standard = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
              if (l_dom_schedule_record1.checked) {
                if (!time_Standard.test(l_dom_input_begin_time1.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time1.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time1.value >= l_dom_input_end_time1.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              if (l_dom_schedule_record2.checked) {
                if (!time_Standard.test(l_dom_input_begin_time2.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time2.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time2.value >= l_dom_input_end_time2.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              if (l_dom_schedule_record3.checked) {
                if (!time_Standard.test(l_dom_input_begin_time3.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time3.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time3.value >= l_dom_input_end_time3.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              if (l_dom_schedule_record4.checked) {
                if (!time_Standard.test(l_dom_input_begin_time4.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (!time_Standard.test(l_dom_input_end_time4.value)) {
                  _this.publicFunc.msg_tips({ msg: mcs_format_error + ".", type: "error", timeout: 3000 });
                  return false;
                }
                if (l_dom_input_begin_time4.value >= l_dom_input_end_time4.value) {
                  _this.publicFunc.msg_tips({ msg: mcs_end_time_should_lt_begin + ".", type: "error", timeout: 3000 });
                  return false;
                }
              }
              return true;
            }
            l_dom_button_setup.onclick = function () {
              if (!time_check()) return;
              week_checkbox_array = Array();
              if (l_dom_radio_schedule.checked) {
                for (i = 0; i < 4; i++) {
                  if (_this.publicFunc.mx("#schedule_record" + (i + 1)).checked) {
                    week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class" + (i + 1));
                    let wday = 0;
                    for (j = 0; j < week_checkbox_class.length; j++) {
                      if (week_checkbox_class[j].checked) {
                        wday = wday | l_week_array[week_checkbox_class[j].value];
                      }
                    }
                    if (wday == 0) {
                      //system_tooltip({parent:_this.publicFunc.mx("#week_checkbox"+(i+1)+"_div"), color:"red", position:"right", disappear_way:"time", str:mcs_end_time_should_lt_begin + "."});
                      //return;
                    }
                    let input_begin_time = _this.publicFunc.mx("#input_begin_time" + (i + 1)).value;
                    let input_end_time = _this.publicFunc.mx("#input_end_time" + (i + 1)).value;
                    week_checkbox_array.push({ wday: wday, start: input_time_change({ type: "string", data: input_begin_time }), end: input_time_change({ type: "string", data: input_end_time }) });
                  }
                }
              }
              _this.$api.set.record_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                enable: l_dom_checkbox_schedule.checked ? 1 : 0,
                full_time: l_dom_radio_H7_24.checked ? 1 : 0,
                times: week_checkbox_array
              }).then(res => {
                _this.set_result(res)
              })
            }
            $(l_dom_schedule_record1).iButton({
              change: function () {
                if (l_dom_schedule_record1.checked) {
                  $(l_dom_schedule_record1_content).fadeIn();
                } else {
                  $(l_dom_schedule_record1_content).fadeOut();
                }
                $("#manager_page").mCustomScrollbar("update");
              }
            });
            $(l_dom_checkbox_schedule).iButton({
              change: function () {
                if (l_dom_checkbox_schedule.checked) {
                  $(l_dom_schedule_record_content).fadeIn();
                } else {
                  $(l_dom_schedule_record_content).fadeOut();
                }
                $("#manager_page").mCustomScrollbar("update");
              }
            });
            $(l_dom_schedule_record2).iButton({
              change: function () {
                if (l_dom_schedule_record2.checked) {
                  $(l_dom_schedule_record2_content).fadeIn();
                } else {
                  $(l_dom_schedule_record2_content).fadeOut();
                }
                $("#manager_page").mCustomScrollbar("update");
              }
            });
            $(l_dom_schedule_record3).iButton({
              change: function () {
                if (l_dom_schedule_record3.checked) {
                  $(l_dom_schedule_record3_content).fadeIn();
                } else {
                  $(l_dom_schedule_record3_content).fadeOut();
                }
                $("#manager_page").mCustomScrollbar("update");
              }
            });
            $(l_dom_schedule_record4).iButton({
              change: function () {
                if (l_dom_schedule_record4.checked) {
                  $(l_dom_schedule_record4_content).fadeIn();
                } else {
                  $(l_dom_schedule_record4_content).fadeOut();
                }
                $("#manager_page").mCustomScrollbar("update");
              }
            });
          }
          function dev_record_get_ack (msg) {
            if (msg.enable) {
              $(l_dom_checkbox_schedule).iButton("toggle", true);
            } else {
              $(l_dom_checkbox_schedule).iButton("toggle", false);
            }
            if (msg.full_time) {
              $(l_dom_radio_H7_24).click();
              $(l_dom_radio_schedule_content).hide();
            }
            else if (msg.times) {
              $(l_dom_radio_schedule).click();
              $(l_dom_radio_schedule_content).show();
              for (i = 0; i < msg.times.length; i++) {
                if (msg.times[i].wday) {
                  $("#schedule_record" + (i + 1)).iButton("toggle", true);
                  week_checkbox_class = _this.publicFunc.mx(".week_checkbox_class" + (i + 1));

                  _this.publicFunc.mx("#input_begin_time" + (i + 1)).value = input_time_change({ type: "int", data: msg.times[i].start });
                  _this.publicFunc.mx("#input_end_time" + (i + 1)).value = input_time_change({ type: "int", data: msg.times[i].end });
                  for (j = 0; j < l_week_array.length; j++) {
                    if (msg.times[i].wday & l_week_array[j]) {
                      for (k = 0; k < week_checkbox_class.length; k++) {
                        if (week_checkbox_class[k].value == j) {
                          week_checkbox_class[k].checked = true;
                        }
                      }
                    }
                  }
                }
                else {
                  $("#schedule_record" + (i + 1)).iButton("toggle", false);
                }
              }
            }
            $("#manager_page").mCustomScrollbar("update");
            $(".week_checkbox_div1").jNice();
            $(".week_checkbox_div2").jNice();
            $(".week_checkbox_div3").jNice();
            $(".week_checkbox_div4").jNice();
          }
          function input_time_change (obj) {
            if (obj.type == "string") {
              return obj.data.substring(obj.data.indexOf(":"), 0) * 60 * 60 + obj.data.substring(obj.data.indexOf(":") + 1, obj.data.length) * 60;
            }
            else if (obj.type == "int") {
              let hour, Minute;
              hour = parseInt(obj.data / 3600);
              Minute = (obj.data % 3600) / 60;
              if (hour < 10) {
                hour = "0" + hour;
              }
              if (Minute < 10) {
                Minute = "0" + Minute;
              }
              return hour + ":" + Minute;
            }
          }
          add_scheduled_recording_event();
          _this.$api.set.record_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            dev_record_get_ack(res)
          })
          break;
        }
        case "date_time": { // 日期时间
          info.dom.innerHTML =
            "<div id = 'date_info' class = 'list_right_box'>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='options_float_left'>" + mcs_date + "</div>"
            + "<div class='options_float_right'>"
            + "<input id='input_date_year' class='vimtag_date' type='text' style='width:43px' ></input>"
            + "<span id='date_year_span' style='padding:0 2px 0 2px'>" + mcs_year + "</span>"
            + "<input id='input_date_month' class='vimtag_date' type='text' style='width:38px'></input>"
            + "<span id='date_month_span' style='padding:0 2px 0 2px'>" + mcs_month + "</span>"
            + "<input id='input_date_day' class='vimtag_date' type='text' style='width:38px'></input>"
            + "<span id='date_day_span' style='padding:0 2px 0 2px'>" + mcs_day + "</span>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item' id='date_time'>"
            + "<div class='options_float_left'>" + mcs_time + "</div>"
            + "<div class='options_float_right'>"
            + "<input id='input_time_hour' class='vimtag_date' type='text' style='width:54px'></input>"
            + "<span id='time_hour_span' style='padding:0 2px 0 2px'>:</span>"
            + "<input id='input_time_minute' class='vimtag_date' type='text' style='width:53px'></input>"
            + "<span id='time_minute_span' style='padding:0 2px 0 2px'>:</span>"
            + "<input id='input_time_second' class='vimtag_date' type='text' style='width:53px'></input>"
            + "</div>"
            + "</div>"
            + "<div id='time_zone_selevt_content'>"
            + "<div class='options_float_left'>" + mcs_time_zone + "</div>"
            + "<div class='options_float_right select_block'>"
            + "<select id='time_zone_selevt' class='set_timezone_select'>"
            + "</select>"
            + "</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div id='auto_date_box'>"
            + "<div class='options_float_left'>" + mcs_auto_sync_date_time + "</div>"
            + "<div id='checkbox_auto_sync_div' class='options_float_right'><input id='checkbox_auto_sync' type='checkbox'/></div>"
            + "</div>"
            + "<div id='ntp' class='clear'>"
            + "<div class='options_float_left'>" + mcs_ntp + "</div>"
            + "<div class='options_float_right'><input id='input_ntp' class='vimtag_service_address' type='text' style='width:145px'></input></div>"
            + "</div>"
            + "<div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' >" + mcs_apply + "</button></div>"
            + "</div>";
          let l_dom_input_year = _this.publicFunc.mx("#input_date_year");
          let l_dom_input_month = _this.publicFunc.mx("#input_date_month");
          let l_dom_input_day = _this.publicFunc.mx("#input_date_day");
          let l_dom_input_hour = _this.publicFunc.mx("#input_time_hour");
          let l_dom_input_minute = _this.publicFunc.mx("#input_time_minute");
          let l_dom_input_second = _this.publicFunc.mx("#input_time_second");
          let l_dom_time_zone_selevt = _this.publicFunc.mx("#time_zone_selevt");
          let l_dom_time_zone_selevt_content = _this.publicFunc.mx("#time_zone_selevt_content");
          let l_dom_ntp = _this.publicFunc.mx("#input_ntp");
          let l_dom_auto_box = $("#auto_date_box");
          let l_ntp = $("#ntp");
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_don_date_year_span = _this.publicFunc.mx("#date_year_span");
          let l_dom_date_month_span = _this.publicFunc.mx("#date_month_span");
          let l_dom_date_day_span = _this.publicFunc.mx("#date_day_span");
          let l_dom_time_hour_span = _this.publicFunc.mx("#time_hour_span");
          let l_dom_time_minute_span = _this.publicFunc.mx("#time_minute_span");
          let l_dom_checkbox_auto_sync = _this.publicFunc.mx("#checkbox_auto_sync");
          let stop_time = { input_year: "", input_month: "", input_day: "", input_hour: "", input_minute: "", input_second: "" };
          let l_refresh_time_id;
          l_dom_auto_box.hide();
          l_ntp.hide();
          function add_date_time_event () {
            l_dom_input_year.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_year.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_month.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
              _this.publicFunc.mx("#date_year_span").style.paddingRight = "1px";
              _this.publicFunc.mx("#date_month_span").style.paddingLeft = "1px";
            };
            l_dom_input_month.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
              _this.publicFunc.mx("#date_year_span").style.paddingRight = "2px";
              _this.publicFunc.mx("#date_month_span").style.paddingLeft = "2px";
            };
            l_dom_input_day.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
              _this.publicFunc.mx("#date_month_span").style.paddingRight = "1px";
              _this.publicFunc.mx("#date_day_span").style.paddingLeft = "1px";
            };
            l_dom_input_day.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
              _this.publicFunc.mx("#date_month_span").style.paddingRight = "2px";
              _this.publicFunc.mx("#date_day_span").style.paddingLeft = "2px";
            };
            l_dom_input_hour.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_hour.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            l_dom_input_minute.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
              _this.publicFunc.mx("#time_hour_span").style.paddingRight = "1px";
              _this.publicFunc.mx("#time_minute_span").style.paddingLeft = "1px";
            };
            l_dom_input_minute.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
              _this.publicFunc.mx("#time_hour_span").style.paddingRight = "2px";
              _this.publicFunc.mx("#time_minute_span").style.paddingLeft = "2px";
            };
            l_dom_input_second.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
              _this.publicFunc.mx("#time_minute_span").style.paddingRight = "0px";
            };
            l_dom_input_second.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
              _this.publicFunc.mx("#time_minute_span").style.paddingRight = "2px";
            };
            l_dom_ntp.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_ntp.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            $("#checkbox_auto_sync").iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (_this.publicFunc.mx("#checkbox_auto_sync").checked) {
                  $("#input_date_year").attr("disabled", "disabled");
                  $("#input_date_day").attr("disabled", "disabled");
                  $("#input_time_hour").attr("disabled", "disabled");
                  $("#input_date_month").attr("disabled", "disabled");
                  $("#input_time_minute").attr("disabled", "disabled");
                  $("#input_time_second").attr("disabled", "disabled");
                  $("#date_info").find("input").css('background-color', 'white');
                  // _this.publicFunc.mx("#ntp").style.display="block";
                }
                else {
                  $("#input_date_year").removeAttr("disabled");
                  $("#input_date_day").removeAttr("disabled");
                  $("#input_time_hour").removeAttr("disabled");
                  $("#input_date_month").removeAttr("disabled");
                  $("#input_time_minute").removeAttr("disabled");
                  $("#input_time_second").removeAttr("disabled");
                  // $("#ntp").fadeOut(500);
                }
              }
            });
            l_dom_button_setup.onclick = function () {
              _this.$api.set.time_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                type: _this.publicFunc.mx("#checkbox_auto_sync").checked ? "NTP" : "manually",
                timezone: l_dom_time_zone_selevt.value,
                hour: l_dom_input_hour.value,
                min: l_dom_input_minute.value,
                sec: l_dom_input_second.value,
                year: l_dom_input_year.value,
                mon: l_dom_input_month.value,
                day: l_dom_input_day.value,
                auto_sync: Number(_this.publicFunc.mx("#checkbox_auto_sync").checked),
                ntp_addr: l_dom_ntp.value
              }).then(res => {
                _this.set_result(res)
              })
            };
          }
          function dev_time_get_ack (msg) {
            l_dom_input_year.value = msg.year;
            l_dom_input_month.value = msg.mon;
            l_dom_input_day.value = msg.day;
            l_dom_input_hour.value = msg.hour;
            l_dom_input_minute.value = msg.min;
            l_dom_input_second.value = msg.sec;
            if (msg.auto_sync)
              $("#checkbox_auto_sync").iButton("toggle", true);
            else
              $("#checkbox_auto_sync").iButton("toggle", false);
            if (msg.ntp_addr) {
              l_dom_ntp.value = msg.ntp_addr;
            }
            if (msg.timezone) {
              l_dom_time_zone_selevt.value = msg.timezone;
            }
            refresh_time_func({
              year: l_dom_input_year.value, month: l_dom_input_month.value, day: l_dom_input_day.value, hour: l_dom_input_hour.value
              , minute: l_dom_input_minute.value, second: l_dom_input_second.value
            });
          }
          function refresh_time_func (obj) {
            let me = this
            let year, month, day, hour, minute, second
            let leap_year = false;

            year = parseInt(obj.year, 10);
            month = parseInt(obj.month, 10);
            day = parseInt(obj.day, 10);
            hour = parseInt(obj.hour, 10);
            minute = parseInt(obj.minute, 10);
            second = parseInt(obj.second, 10);
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
                  if ((month == 1 || month == 3 || month == 5 || month == 7
                    || month == 8 || month == 10 || month == 12) && (day > 31)) {
                    month += 1;
                    day = 0;
                  }
                  else if ((month == 2) && (day > (leap_year ? 29 : 28))) {
                    month += 1;
                    day = 0;
                  }
                  else if (day > 30) {
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
            filling_time({ year: year, month: month, day: day, hour: hour, minute: minute, second: second });
            l_refresh_time_id = setTimeout(function () { refresh_time_func({ year: year, month: month, day: day, hour: hour, minute: minute, second: second }) }, 1000);
          }
          function filling_time (obj) {
            let focus_id = document.activeElement.id;
            if (focus_id != "input_date_year" && focus_id != "input_date_month" && focus_id != "input_date_day" && focus_id != "input_time_hour" && focus_id != "input_time_minute" && focus_id != "input_time_second") {
              if (stop_time.input_year) {
                if (stop_time.input_year != l_dom_input_year.value || stop_time.input_month != l_dom_input_month.value || stop_time.input_day != l_dom_input_day.value || stop_time.input_hour != l_dom_input_hour.value || l_dom_input_minute.value != stop_time.input_minute || l_dom_input_second.value != stop_time.input_second)
                  return;
              }
              if (stop_time.input_year) {
                stop_time.input_year = "";
                stop_time.input_month = "";
                stop_time.input_day = "";
                stop_time.input_hour = "";
                stop_time.input_minute = "";
                stop_time.input_second = "";
              }
              l_dom_input_year.value = obj.year;
              l_dom_input_month.value = obj.month;
              l_dom_input_day.value = obj.day;
              l_dom_input_hour.value = obj.hour;
              l_dom_input_minute.value = obj.minute;
              l_dom_input_second.value = obj.second;
            } else if (focus_id == "input_date_year" || focus_id == "input_date_month" || focus_id == "input_date_day" || focus_id == "input_time_hour" || focus_id == "input_time_minute" || focus_id == "input_time_second") {
              if (stop_time.input_year == "") {
                stop_time.input_year = l_dom_input_year.value;
                stop_time.input_month = l_dom_input_month.value;
                stop_time.input_day = l_dom_input_day.value;
                stop_time.input_hour = l_dom_input_hour.value;
                stop_time.input_minute = l_dom_input_minute.value;
                stop_time.input_second = l_dom_input_second.value;
              }
            }
          }
          function time_zone_get_ack (data) {
            if (data) {
              for (let i = 0; i < data.length; i++) {
                let zone_name_tmp = data[i].city.replace(/\(|&|\)|_/g, "")
                let zone_name = eval("mcs_timezone_" + zone_name_tmp)
                l_dom_time_zone_selevt.innerHTML += "<option zone='" + data[i].utc + "' value='" + data[i].city + "' city='" + data[i].file + "'>" + zone_name + "</option>"
              }
            }

          }
          add_date_time_event();
          await _this.$api.devlist.time_zone_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res_time_zone_get => {
            //console.log(res_time_zone_get, 'time_zone_get_res')
            time_zone_get_ack(res_time_zone_get)
          })
          _this.$api.set.time_get({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            dev_time_get_ack(res)
          })
          break
        }
        case "system": { // 系统
          let l_inner_html = "";
          l_inner_html = // 为mipc添加system_class判断样式
            "<div class='list_right_item" + " " + (_this.$store.state.jumpPageData.projectFlag ? 'system_class' : '') + "'>"
            + "<div class='options_float_left' id='system_upgrade_left' style='" + ((_this.$store.state.user.userLanguage == 'ja' || _this.$store.state.user.userLanguage == 'ru') ? "width:132px" : "") + "'></div>" //在线升级
            + "<div id='system_upgrade_div' class='options_float_right options_float_right_button'></div>"
            + "</div>";
          //Direct Connect Uploads upgrades
          if (_this.$store.state.jumpPageData.networkEnviron == "private") {
            l_inner_html +=
              "<div class='list_right_item" + " " + (_this.$store.state.jumpPageData.projectFlag ? 'system_class' : '') + "'>"
              + "<div class='options_float_left'>" + mcs_upload_upgrade + "</div>" //？上传升级
              + "<div id='file_upload_div' class='options_float_right' style='position:relative;right:40px;top:10px;cursor:pointer;'></div>"
              + "</div>";
          }
          l_inner_html +=
            "<div id='activation_div' class='list_right_item" + " " + (_this.$store.state.jumpPageData.projectFlag ? 'system_class' : '') + "'>"
            + "<div class='options_float_left'>" + mcs_activation + "</div>"
            + "<div class='options_float_right'>"
            + "<input type='text' id='input_activation' class='vimtag_service_address'></input>"
            + "<button id='button_activation' class='list_right_button_ex'>" + mcs_activate + "</button>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item" + " " + (_this.$store.state.jumpPageData.projectFlag ? 'system_class' : '') + "'>"
            + "<div class='options_float_left'>" + mcs_restore_the_factory_settings + "</div>" //恢复出厂设置
            + "<div class='options_float_right options_float_right_button'><button id='button_restore_default_settings' class='list_right_button_ex'>" + mcs_restore + "</button></div>"
            + "</div>"
            + "<div class='list_right_item" + " " + (_this.$store.state.jumpPageData.projectFlag ? 'system_class' : '') + "'>"
            + "<div class='options_float_left'>" + mcs_restore_camera + "</div>"  //重启
            + "<div class='options_float_right options_float_right_button'><button id='button_restart_device' class='list_right_button_ex'>" + mcs_reboot + "</button></div>"
            + "</div>";
          info.dom.innerHTML = l_inner_html;
          let l_dom_detail_div_page = _this.publicFunc.dom_create_child(info.dom, "div", "detail_div_page");
          l_dom_detail_div_page.innerHTML = "<div id='detail_div_inner'><div>";
          let l_dom_detail_div_inner = _this.publicFunc.mx("#detail_div_inner");
          let l_dom_system_upgrade_div = _this.publicFunc.mx("#system_upgrade_div");
          let l_dom_input_activation = _this.publicFunc.mx("#input_activation");
          let l_dom_button_activation = _this.publicFunc.mx("#button_activation");
          let l_dom_button_restore = _this.publicFunc.mx("#button_restore_default_settings");
          let l_dom_button_restart = _this.publicFunc.mx("#button_restart_device");
          let l_dom_system_upgrade_left = _this.publicFunc.mx("#system_upgrade_left");
          let l_extra_timer = 1;
          if (_this.$store.state.jumpPageData.selectDeviceIpc.substr(0, 3) != "166") _this.publicFunc.mx("#activation_div").style.display = "none";
          function add_system_event () {
            function device_reboot () {
              if (_this.$store.state.user.guest) {
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
              } else {
                _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res =>{
                  setTimeout(function () {
                    _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                    _this.$router.push({name:'devlist'})
                  }, 3000)
                })
              }
            }
            function system_device_reset () {
              if (_this.$store.state.user.guest) {
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
              } else {
                if (_this.publicFunc.mx("#save_configuration").checked) {
                  _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 1 }).then(res =>{
                    setTimeout(function () {
                      _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                      _this.$router.push({name:'devlist'})
                    }, 3000)
                  })
                } else {
                  _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 0 }).then(res =>{
                    setTimeout(function () {
                      _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                      _this.$router.push({name:'devlist'})
                    }, 3000)
                  })
                }
              }
            }
            //Enter the activation code box event
            l_dom_input_activation.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_activation.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            //Activate button click event
            l_dom_button_activation.onclick = function () {
              _this.$api.set.dev_activate({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                activationCode: l_dom_input_activation.value
              })
            };
            //reset
            l_dom_button_restore.onclick = function () {//恢复出厂设置
              _this.publicFunc.delete_tips({ content: mcs_restore_factory_settings_prompt + "<br><input type='checkbox' id='save_configuration' checked='checked'>&nbsp;" + mcs_keep_network_settings, func: system_device_reset });
            };
            //Reboot Set
            l_dom_button_restart.onclick = function () {//重启
              _this.publicFunc.delete_tips({ content: mcs_restart_prompt, func: device_reboot });
            };
            $(document).bind("click", function (event) {
              let e = event || window.event;
              let elem = e.srcElement || e.target;
              while (elem) {
                if (elem.id == "Detail_id" || elem.id == "detail_div_page") {
                  return;
                }
                elem = elem.parentNode;
              }
              $(l_dom_detail_div_page).hide();
            });
          }
          function system_dev_upgrade_get_ack (msg) {
            //console.log(msg.check_ver, 'system_dev_upgrade_get_ack_msg')
            if (null == _this.$store.state.jumpPageData.systemWaitDiv) {
              let g_system_wait_div = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div;
                let l_page = _this.publicFunc.mx("#system_upgrade_div");
                let l_client_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // let l_client_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let l_client_w = _this.publicFunc.mx("#create_setting_page_right").offsetWidth;
                if (!wait_div) {

                  document.documentElement.onkeydown = function (e) { let evt = e || window.event; if (evt.keyCode != 116) return false; };
                  wait_div = document.createElement("div");
                  wait_div.setAttribute("id", "system_wait_div");
                  l_page.parentNode.appendChild(wait_div);
                  // wait_display_div = document.createElement("div")
                  // wait_display_div.setAttribute("id", "system_wait_display_div");
                  // l_page.parentNode.appendChild(wait_display_div);
                  wait_div[s_style][s_cssText] = "float:right;background-color:#fff;"
                    + "filter:alpha(opacity=10);z-index:100";
                  // wait_display_div[s_style][s_cssText] = "top:" + (l_client_h / 3) + "px;left:" + (l_client_w / 2) + "px";
                  wait_div["innerHTML"] =
                    "<div id='cl_wait_div' style='text-align:center'></div>"
                  // +"<div id='cl_str_div' style='padding-left:10px;padding-top:10px;font-weight:900;font-size:18px;color:#EEE'>" + str + "</div>";

                  let cl = new CanvasLoader("cl_wait_div", { id: "canvasLoader", safeVML: true });
                  cl.setColor('#8bb238');
                  cl.setDiameter(36);
                  cl.setDensity(43);
                  cl.setRange(1.1);
                  cl.show();
                }
              }
              _this.$store.dispatch('setSystemWaitDiv', g_system_wait_div)
            }
            if (null == _this.$store.state.jumpPageData.systemStopWait) {
              let g_system_stop_wait = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div = _this.publicFunc.mx("#system_wait_display_div");

                document.documentElement.onkeydown = null;
                if (wait_div) {
                  wait_div["innerHTML"] = "";
                  wait_div.parentNode[s_removeChild](wait_div);
                  wait_div = null;
                }
                if (wait_display_div) {
                  wait_display_div["innerHTML"] = "";
                  wait_display_div.parentNode[s_removeChild](wait_display_div);
                  wait_display_div = null;
                }
              }
              _this.$store.dispatch('setSystemStopWait', g_system_stop_wait)
            }
            let msg_status = msg.status;
            if (msg.check_ver && msg_status == "fail") {
              msg_status = "free";
            }
            if (msg.type == "online" && msg_status == "") {
              l_dom_system_upgrade_div.innerHTML = mcs_already_latest_version;
            }
            else if (msg_status == "fail") {
              _this.publicFunc.msg_tips({ msg: mcs_fail + ":" + msg.remark, type: "error", timeout: 3000 })
              // system_pop_confirm_box({ alert: true, str: mcs_fail + ":" + msg.remark });
            }
            else if (msg_status != "free" && msg_status != "" && msg_status != "finish") {
              let wait_div = _this.publicFunc.mx("#system_wait_div"), str_div = _this.publicFunc.mx("#cl_str_div"),
                i, extra = "";
              setTimeout(function () {
                _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                  system_dev_upgrade_get_ack(res)
                })
              }, 1000);
              // if(ref.type == "online")
              l_dom_system_upgrade_div["innerHTML"] = mcs_upgrading + "...";
              if (!wait_div) _this.$store.state.jumpPageData.systemWaitDiv("");
              else {
                for (i = 1; i <= l_extra_timer; ++i) {
                  extra += "."
                }
                l_extra_timer = ++l_extra_timer > 3 ? 1 : l_extra_timer;
                if (msg_status == "download") {
                  str_div["innerHTML"] = mcs_downloading + extra;
                }
                else if (msg_status == "erase") {
                  str_div["innerHTML"] = mcs_erasing + extra;
                }
                else if (msg_status == "write") {
                  str_div["innerHTML"] = mcs_writing + " " + msg.progress + "%";  //Download shows the percentage
                }
              }
            }
            else if (msg.check_ver && msg_status == "finish") { //发现降级升级时 没有download 直接返回finish
              _this.publicFunc.delete_tips({
                content: mcs_upgrade_successful_restart_to_take_effect, func: function () {
                  _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                    setTimeout(function () {
                      // createPage("devlist", { parent: obj.parent });
                      _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                    }, 1000);
                  })
                }
              })
            }
            else {
              _this.$store.state.jumpPageData.systemStopWait();
              l_extra_timer = 1;
              if (msg.check_ver) {
                if (msg.ver_current < "12.09.13.04.04") {
                  l_dom_system_upgrade_div.parentNode[s_style].display = "none";
                }
                // if(msg.ext_hw=="unknown"){is_unknown="";msg.ext_hw=is_unknown} //bug
                if ((msg.ver_valid.length != 0 && msg.ver_current.length != 0 && msg.ver_valid != msg.ver_current) || (msg.ext_prj != msg.ext_hw && msg.ext_hw.length != 0)) {
                  //console.log('test error')
                  l_dom_system_upgrade_left.innerHTML = mcs_online_upgrade;
                  l_dom_system_upgrade_div.innerHTML = "<div style='float:left;margin-right:8px;" + ((_this.$store.state.user.userLanguage == "vi" || _this.$store.state.user.userLanguage == "ja") ? "width:242px" : "width:233px") + "'>" + mcs_new_version + msg.ver_valid + mcs_valid + "</div><div style='padding-top:20px;float:left'><div id='Detail_id'></div></div>&nbsp;<button class='list_right_button_ex'>" + mcs_upgrade + "</button>";
                  //console.log('test error')
                  _this.publicFunc.mx("#Detail_id").onclick = function () {
                    $(l_dom_detail_div_page).toggle();
                    $(l_dom_detail_div_inner).mCustomScrollbar("update");
                  }
                  //Upgrade button click event
                  _this.publicFunc.mx("/button", l_dom_system_upgrade_div)[0].onclick = function () {//升级
                    let img_ver = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).img_ver;
                    let valid_ver = msg.ver_valid;
                    let ver_update_warn = "";
                    if (!_this.$store.state.user.guest) {
                      _this.$api.set.desc_get({
                        ver_type: "windows",
                        ver_from: img_ver,
                        ver_to: msg.ver_valid,
                        lang: _this.$store.state.user.userLanguage
                      }).then(res => {
                        if (res.result === '') {
                          desc_get_ack(res)
                        }
                      })
                    } else {
                      _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                    }
                    function desc_get_ack (msg) {
                      if (msg.data.desc) {
                        for (let i = 0, length = msg.data.desc.length; i < length; i++) {
                          ver_update_warn += msg.data.desc[i] + "<br>";
                        }
                      }
                      _this.publicFunc.delete_tips({
                        content: (ver_update_warn ? ver_update_warn : (mcs_upgrade_to_the_latest_version + valid_ver)), func: function () {
                          _this.$api.set.upgrade_set({
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            check: 1
                          }).then(() => {
                            _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
                              system_dev_upgrade_get_ack(res)
                            })
                          })
                        }
                      })
                    }
                  }
                  $("#Detail_id").hide();
                } else {
                  l_dom_system_upgrade_left["innerHTML"] = mcs_online_upgrade;
                  l_dom_system_upgrade_div["innerHTML"] = mcs_already_latest_version;
                }
              }
              else {
                //console.log('enter this')
                //Reboot the device upgrade is successful
                _this.publicFunc.delete_tips({
                  content: mcs_upgrade_successful_restart_to_take_effect, func: function () {
                    _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                      setTimeout(function () {
                        // createPage("devlist", { parent: obj.parent });
                        _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                      }, 1000);
                    })
                  }
                })
              }
            }
          }
          add_system_event();
          _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
            res.check_ver = 1
            system_dev_upgrade_get_ack(res)
          })
          break;
        }
        case "others": { // 其他
          info.dom.innerHTML =
            "<div id = 'other_info' class = 'list_right_box'>"
            + "<div class='list_right_item'>"
            + "<div class='vimtag_options_float_left sd_mode_text'>" + mcs_audio + " :</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex'>"
            + "<div class='vimtag_options_float_left sd_mode_text'>- " + mcs_speaker + "</div>"
            + "<div class='options_float_right' style='width:200px;'>"
            + "<label for='input_speaker'></label>"
            + "<input name='slider' type='text' id='input_speaker' class='fd_tween fd_classname_extraclass fd_hide_input "
            + "fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<div class='vimtag_options_float_left sd_mode_text'>- " + mcs_mic + "</div>"
            + "<div class='options_float_right' style='width:200px;'>"
            + "<label for='input_microphone'></label>"
            + "<input name='slider' type='text' id='input_microphone' class='fd_tween fd_classname_extraclass fd_hide_input "
            + "fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item'>"
            + "<span class='attribute_key_text'>" + mcs_equipment_flip + "</span>"
            + "<div id='checkbox_ipc_turnover_div' class='options_float_right'><input id='checkbox_ipc_turnover' type='checkbox'/></div>"
            + "</div>"
            + "<div id='power_fr_div'>"
            + "<div class='options_float_left'>" + mcs_power_frequency + "</div>" //电源频率
            + "<div class='options_float_right select_block'><select id='power_fr'>"
            + "<option>50hz</option>"
            + "<option>60hz</option>"
            + "</select>"
            + "</div>"
            + "</div>"
            + "<div id='screen_fr_div'>"
            + "<div class='options_float_left'>" + mcs_screen_size + "</div>"
            + "<div class='options_float_right select_block'><select id='screen_fr'>"
            + "<option>4:3</option>"
            + "<option>16:9</option>"
            + "</select>"
            + "</div>"
            + "</div>"
            + "<div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>"
            + "</div>";
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_dom_input_speaker = _this.publicFunc.mx("#input_speaker");
          let l_dom_input_microphone = _this.publicFunc.mx("#input_microphone");
          let l_dom_ipc_turnover = _this.publicFunc.mx("#checkbox_ipc_turnover");
          let l_dom_power_fr = _this.publicFunc.mx("#power_fr");
          let l_dom_screen_fr = _this.publicFunc.mx("#screen_fr");
          _this.publicFunc.mx("#screen_fr_div").style.display = "none";
          let l_ipc_turnover_true = 0;
          let l_cam_info;
          let l_ratio = 0;
          async function cam_resolute_set () {
            let flip, flicker_freq;
            l_cam_info.flip = Number(l_dom_ipc_turnover.checked);
            l_cam_info.flicker_freq = l_dom_power_fr.selectedIndex;
            l_cam_info.resolute = l_dom_screen_fr.selectedIndex ? "16:9" : "4:3";
            await _this.$api.play.adjust_set({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              flip: Number(l_dom_ipc_turnover.checked),
              flicker_freq: l_dom_power_fr.selectedIndex
            }).then(res => {
              if (res.result === "permission.denied") {
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
              } else if (res.result !== "") {
                _this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
                _this.publicFunc.delete_tips({
                  content: mcs_restart_prompt, func: async function () {
                    await _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc })
                    setTimeout(function () {
                      // createPage("devlist", { parent: obj.parent });
                      _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                    }, 1000);
                  }
                });
              }
            })
          }
          function add_others_event () {
            $("#checkbox_ipc_turnover").iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_ipc_turnover_true) {
                  l_ipc_turnover_true = 0;
                } else {
                  cam_set();
                }
              }
            });
            $("#power_fr").change(
              function () {
                cam_set();
              });
            $("#screen_fr").change(
              function () {
                cam_resolute_set();
              });
            l_dom_button_setup.onclick = function () {
              let output_level, speaker_level;
              speaker_level = parseInt(_this.publicFunc.mx(".fd-slider-handle", _this.publicFunc.mx("#fd-slider-input_speaker"))[0].getAttribute("aria-valuenow"), 10);
              output_level = parseInt(_this.publicFunc.mx(".fd-slider-handle", _this.publicFunc.mx("#fd-slider-input_microphone"))[0].getAttribute("aria-valuenow"), 10);
              _this.$api.set.audio_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                mic_level: output_level,
                speaker_level: speaker_level
              }).then(res => {

                _this.set_result(res)
              })
            };
          }
          function cam_set () {
            _this.$api.set.cam_set({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              flip: Number(l_dom_ipc_turnover.checked),
              flicker_freq: l_dom_power_fr.selectedIndex
            }).then(res => {
              if (res.result !== "") {
                if (res.result === "permission.denied") {
                  _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                  _this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
                }
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
              }
            })
          }
          function dev_audio_get_ack (msg) {
            //console.log(msg, 'test error')
            if (l_dom_input_speaker) {
              fdSliderController.increment("input_speaker", msg.speaker_level - l_dom_input_speaker.value);
            }
            if (l_dom_input_microphone) {
              fdSliderController.increment("input_microphone", msg.mic_level - l_dom_input_microphone.value);
            }
            //console.log('test error')
          }
          function others_cam_get_ack (msg) {
            l_ipc_turnover_true = 1;
            l_cam_info = msg;
            l_cam_info.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            msg.flicker_freq ? (l_dom_power_fr[1].selected = true) : (l_dom_power_fr[0].selected = true);

            let param = Array();
            param = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).p;
            for (let i = 0; i < param.length; i++) {
              if (param[i].n == "s.ratio" && param[i].v.length) {
                l_ratio = 1;
                _this.publicFunc.mx("#screen_fr_div").style.display = "block";
                (msg.resolute == "16:9") ? (l_dom_screen_fr[1].selected = true) : (l_dom_screen_fr[0].selected = true);
                break;
              }
            }

            if (msg.flip) {
              $("#checkbox_ipc_turnover").iButton("toggle", true);
            } else {
              $("#checkbox_ipc_turnover").iButton("toggle", false);
            }
          }
          add_others_event();
          fdSliderController.create();
          async function get_other () {
            await _this.$api.set.audio_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(async res => {
              await dev_audio_get_ack(res)
            })
            await _this.$api.play.adjust_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(async res => {
              await others_cam_get_ack(res)
            })
          }
          get_other()
          break;
        }
        case "delete_device": { // 删除设备
          info.dom.innerHTML =
            "<div class='options_float_right' style='clear:both'><button id='del_dev_button_setup'>" + mcs_delete_device + "</button>"
            + "</div>";
          let l_dom_button_setup = _this.publicFunc.mx("#del_dev_button_setup");
          function add_delete_device_event () { // 点击删除设备
            l_dom_button_setup.onclick = function () {
              function delete_device () {
                _this.$api.devlist.dev_del({
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc
                }).then(res => {
                  set_result_del_device(res)
                })
              }
              _this.publicFunc.delete_tips({ content: mcs_delete_device + "?", func: delete_device })
              // window.location.reload()
            };
          }
          add_delete_device_event();
          function set_result_del_device (data) { // 设置删除设备回调函数
            // console.log('进入删除设备回调', data)
            _this.publicFunc.msg_tips({ msg: data.msg, type: data.type, timeout: 3000 })
            if (data.type === "success") {
              window.location.reload()
            } else {
              // 删除失败重载当前设置页面
              _this.publicFunc.mx("#create_setting_page_left").innerHTML = null // 清空左侧选项列表 防止重复
              _this.$api.set.set_list_get({ flag: obj.type, sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                _this.create_set_list(res)
              })
            }
          }
          break;
        }
        case "lighting": {
          let conf = {};
          info.dom.innerHTML =
            "<div id='lighting_page'>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_IR_mode + "</div><div class='list_info'><div type='red' class='list_info_select list_info_select_img'></div></div></div>"
            + "</div>"
            + "<div class='menu_list_box_title2'>" + mcs_IR_mode_detail + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_white_light_mode + "</div><div class='list_info'><div type='white' class='list_info_select list_info_select_img'></div></div></div>"
            + "</div>"
            + "<div class='menu_list_box_title2'>" + mcs_white_light_mode_detail + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_smart_mode + "</div><div class='list_info'><div type='auto' class='list_info_select list_info_select_img'></div></div></div>"
            + "</div>"
            + "<div class='menu_list_box_title2'>" + mcs_smart_mode_detail + "</div>"
            + "<div id='set_lighting_btn' class='set_btn'>" + mcs_action_apply + "</div>"
            + "</div>";
          function lighting_cam_get_ack (msg) {
            // $("#buffer_page").hide();
            _this.publicFunc.closeBufferPage()
            if (msg.result === "") {
              if (msg.conf.light_mode === "red") {
                _this.publicFunc.mx(".list_info_select")[0].click();
              } else if (msg.conf.light_mode === "white") {
                _this.publicFunc.mx(".list_info_select")[1].click();
              } else {
                _this.publicFunc.mx(".list_info_select")[2].click();
              }
            } else {
              _this.publicFunc.msg_tips({ msg: msg.result, type: "error", timeout: 3000 });
            }
          }
          function select_event () {
            let length = _this.publicFunc.mx(".list_info_select").length;
            for (let i = 0; i < length; i++) {
              _this.publicFunc.mx(".list_info_select")[i].onclick = function () {
                conf.light_mode = this.getAttribute("type");
                $(".list_info_select").removeClass('list_info_clickselect_img');
                $(this).addClass('list_info_clickselect_img');
              }
            }
            _this.publicFunc.mx("#set_lighting_btn").onclick = function () {
              // $("#buffer_page").show();
              // 展示遮罩层
              _this.publicFunc.showBufferPage()
              conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              conf.func = function (msg) {
                // $("#buffer_page").hide();
                _this.publicFunc.closeBufferPage()
                if (msg.result != "") {
                  if (msg.result == "permission.denied") {
                    _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                  } else {
                    _this.publicFunc.msg_tips({ msg: msg.result, type: "error", timeout: 3000 });
                  }
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
                }
              }
              _this.$api.set.white_light_set({
                ...conf,
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                conf.func(res)
              })
            }
          }
          select_event();
          _this.$api.set.white_light_get({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            lighting_cam_get_ack(res)
          })
          break;
        }
        case "system_upgrade": { //升级
          let l_inner_html = "";
          l_inner_html =
            "<div class='list_right_item' style='margin:0 auto'>"
            + "<div class='options_float_left' id='system_upgrade_left'></div>" //在线升级
            + "<div id='system_upgrade_div' class='options_float_right options_float_right_button'></div>"
            + "</div>";
          //Direct Connect Uploads upgrades
          if (_this.$store.state.jumpPageData.networkEnviron == "private") {
            l_inner_html +=
              "<div class='list_right_item'>"
              + "<div class='options_float_left'>" + mcs_upload_upgrade + "</div>" //？上传升级
              + "<div id='file_upload_div' class='options_float_right' style='position:relative;right:40px;top:10px;cursor:pointer;'></div>"
              + "</div>";
          }
          l_inner_html +=
            "<div id='activation_div' class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_activation + "</div>"
            + "<div class='options_float_right'>"
            + "<input type='text' id='input_activation' class='vimtag_service_address'></input>"
            + "<button id='button_activation' class='list_right_button_ex'>" + mcs_activate + "</button>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_restore_the_factory_settings + "</div>" //恢复出厂设置
            + "<div class='options_float_right options_float_right_button'><button id='button_restore_default_settings' class='list_right_button_ex'>" + mcs_restore + "</button></div>"
            + "</div>"
            + "<div class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_reboot + "</div>"  //重启
            + "<div class='options_float_right options_float_right_button'><button id='button_restart_device' class='list_right_button_ex'>" + mcs_reboot + "</button></div>"
            + "</div>";
          info.dom.innerHTML = l_inner_html;

          let l_dom_detail_div_page = _this.publicFunc.dom_create_child(info.dom, "div", "detail_div_page");
          l_dom_detail_div_page.innerHTML = "<div id='detail_div_inner'><div>";
          let l_dom_detail_div_inner = _this.publicFunc.mx("#detail_div_inner");
          let l_dom_system_upgrade_div = _this.publicFunc.mx("#system_upgrade_div");
          let l_dom_input_activation = _this.publicFunc.mx("#input_activation");
          let l_dom_button_activation = _this.publicFunc.mx("#button_activation");
          let l_dom_button_restore = _this.publicFunc.mx("#button_restore_default_settings");
          let l_dom_button_restart = _this.publicFunc.mx("#button_restart_device");
          let l_dom_system_upgrade_left = _this.publicFunc.mx("#system_upgrade_left");
          let l_extra_timer = 1;
          if (_this.$store.state.jumpPageData.selectDeviceIpc.substr(0, 3) != "166") _this.publicFunc.mx("#activation_div").style.display = "none";
          function add_system_upgrade_event () {
            function device_reboot () {
              _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc })
              setTimeout(function () {
                // createPage("devlist", { parent: obj.parent });
                _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
              }, 1000);
            }
            function system_upgrade_device_reset () {
              if (_this.publicFunc.mx("#save_configuration").checked) {
                _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 1 })
              } else {
                _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 0 })
              }

            }
            //Enter the activation code box event
            l_dom_input_activation.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_activation.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            //Activate button click event
            l_dom_button_activation.onclick = function () {
              _this.$api.set.dev_activate({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                activationCode: l_dom_input_activation.value
              })
            };
            //reset
            l_dom_button_restore.onclick = function () {
              _this.publicFunc.delete_tips({ content: mcs_restore_factory_settings_prompt + "<br><input type='checkbox' id='save_configuration' checked='checked'>&nbsp;" + mcs_keep_network_settings, func: system_upgrade_device_reset });
            };
            //Reboot Set
            l_dom_button_restart.onclick = function () {
              _this.publicFunc.delete_tips({ content: mcs_restart_prompt, func: device_reboot });
            };
            $(document).bind("click", function (event) {
              let e = event || window.event;
              let elem = e.srcElement || e.target;
              while (elem) {
                if (elem.id == "Detail_id" || elem.id == "detail_div_page") {
                  return;
                }
                elem = elem.parentNode;
              }
              $(l_dom_detail_div_page).hide();
            });
          }
          function dev_upgrade_get_ack (msg) {
            //console.log(msg, 'dev_upgrade_get_ack_msg')
            if (null == _this.$store.state.jumpPageData.systemWaitDiv) {
              let g_system_wait_div = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div;
                let l_page = _this.publicFunc.mx("#system_upgrade_div");
                let l_client_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // let l_client_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let l_client_w = _this.publicFunc.mx("#create_setting_page_right").offsetWidth;
                if (!wait_div) {

                  document.documentElement.onkeydown = function (e) { let evt = e || window.event; if (evt.keyCode != 116) return false; };
                  wait_div = document.createElement("div");
                  wait_div.setAttribute("id", "system_wait_div");
                  l_page.parentNode.appendChild(wait_div);
                  // wait_display_div = document.createElement("div")
                  // wait_display_div.setAttribute("id", "system_wait_display_div");
                  // l_page.parentNode.appendChild(wait_display_div);
                  wait_div[s_style][s_cssText] = "float:right;background-color:#fff;"
                    + "filter:alpha(opacity=10);z-index:100";
                  // wait_display_div[s_style][s_cssText] = "top:" + (l_client_h / 3) + "px;left:" + (l_client_w / 2) + "px";
                  wait_div["innerHTML"] =
                    "<div id='cl_wait_div' style='text-align:center'></div>"
                  // +"<div id='cl_str_div' style='padding-left:10px;padding-top:10px;font-weight:900;font-size:18px;color:#EEE'>" + str + "</div>";

                  let cl = new CanvasLoader("cl_wait_div", { id: "canvasLoader", safeVML: true });
                  cl.setColor('#8bb238');
                  cl.setDiameter(36);
                  cl.setDensity(43);
                  cl.setRange(1.1);
                  cl.show();
                }
              }
              _this.$store.dispatch('setSystemWaitDiv', g_system_wait_div)
            }
            if (null == _this.$store.state.jumpPageData.systemStopWait) {
              let g_system_stop_wait = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div = _this.publicFunc.mx("#system_wait_display_div");

                document.documentElement.onkeydown = null;
                if (wait_div) {
                  wait_div["innerHTML"] = "";
                  wait_div.parentNode[s_removeChild](wait_div);
                  wait_div = null;
                }
                if (wait_display_div) {
                  wait_display_div["innerHTML"] = "";
                  wait_display_div.parentNode[s_removeChild](wait_display_div);
                  wait_display_div = null;
                }
              }
              _this.$store.dispatch('setSystemStopWait', g_system_stop_wait)
            }
            let msg_status = msg.status;
            if (msg.check_ver && msg_status == "fail") {
              msg_status = "free";
            }
            if (msg.type == "online" && msg_status == "") {
              l_dom_system_upgrade_div.innerHTML = mcs_already_latest_version;
            }
            else if (msg_status == "fail") {
              _this.publicFunc.msg_tips({ msg: mcs_fail + ":" + msg.remark, type: "error", timeout: 3000 })
              // system_pop_confirm_box({ alert: true, str: mcs_fail + ":" + msg.remark });
            }
            else if (msg_status != "free" && msg_status != "" && msg_status != "finish") {
              let wait_div = _this.publicFunc.mx("#system_wait_div"), str_div = _this.publicFunc.mx("#cl_str_div"),
                i, extra = "";
              setTimeout(function () {
                _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                  dev_upgrade_get_ack(res)
                })
              }, 1000);
              // if(ref.type == "online")
              l_dom_system_upgrade_div["innerHTML"] = mcs_upgrading + "...";
              if (!wait_div) _this.$store.state.jumpPageData.systemWaitDiv("");
              else {
                for (i = 1; i <= l_extra_timer; ++i) {
                  extra += "."
                }
                l_extra_timer = ++l_extra_timer > 3 ? 1 : l_extra_timer;
                if (msg_status == "download") {
                  str_div["innerHTML"] = mcs_downloading + extra;
                }
                else if (msg_status == "erase") {
                  str_div["innerHTML"] = mcs_erasing + extra;
                }
                else if (msg_status == "write") {
                  str_div["innerHTML"] = mcs_writing + " " + msg.progress + "%";  //Download shows the percentage
                }
              }
            }
            else {
              _this.$store.state.jumpPageData.systemStopWait();
              l_extra_timer = 1;
              if (msg.check_ver) {
                if (msg.ver_current < "12.09.13.04.04") {
                  l_dom_system_upgrade_div.parentNode[s_style].display = "none";
                }
                if ((msg.ver_valid.length != 0 && msg.ver_current.length != 0 && msg.ver_valid != msg.ver_current) || (msg.ext_prj != msg.ext_hw && msg.ext_hw.length != 0)) {
                  l_dom_system_upgrade_left.innerHTML = mcs_online_upgrade;
                  l_dom_system_upgrade_div.innerHTML = "<div style='float:left;margin-top:8px;'>" + mcs_new_version + msg.ver_valid + mcs_valid + "</div><div style='padding-top:20px;float:left'><div id='Detail_id'></div></div>&nbsp;<button class='list_right_button_ex'>" + mcs_upgrade + "</button>";
                  _this.publicFunc.mx("#Detail_id").onclick = function () {
                    $(l_dom_detail_div_page).toggle();
                    $(l_dom_detail_div_inner).mCustomScrollbar("update");
                  }
                  //Upgrade button click event
                  _this.publicFunc.mx("/button", l_dom_system_upgrade_div)[0].onclick = function () {
                    let img_ver = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).img_ver;
                    let valid_ver = msg.ver_valid;
                    let ver_update_warn = "";
                    function desc_get_ack (msg) {
                      if (msg.data.desc) {
                        for (let i = 0, length = msg.data.desc.length; i < length; i++) {
                          ver_update_warn += msg.data.desc[i] + "<br>";
                        }
                      }
                      _this.publicFunc.delete_tips({
                        content: (ver_update_warn ? ver_update_warn : (mcs_upgrade_to_the_latest_version + valid_ver)), func: function () {
                          _this.$api.set.upgrade_set({
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            check: 1
                          }).then(() => {
                            _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
                              dev_upgrade_get_ack(res)
                            })
                          })
                        }
                      })
                    }
                    _this.$api.set.desc_get({
                      ver_type: "windows",
                      ver_from: img_ver,
                      ver_to: msg.ver_valid,
                      lang: _this.$store.state.user.userLanguage
                    }).then(res => {
                      if (res.result === '') {
                        desc_get_ack(res)
                      }
                    })
                  }
                  $("#Detail_id").hide();
                } else {
                  l_dom_system_upgrade_left["innerHTML"] = mcs_online_upgrade;
                  l_dom_system_upgrade_div["innerHTML"] = mcs_already_latest_version;
                }
              }
              else {
                //Reboot the device upgrade is successful
                _this.publicFunc.delete_tips({
                  content: mcs_upgrade_successful_restart_to_take_effect, func: function () {
                    _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                      setTimeout(function () {
                        // createPage("devlist", { parent: obj.parent });
                        _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                      }, 1000);
                    })
                  }
                })
              }
            }
          }
          add_system_upgrade_event();
          _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
            dev_upgrade_get_ack(res)
          })
          break;
        }
        case "reboot": {//重启
          let l_inner_html = "";
          l_inner_html =
            "<div class='list_right_item' style='display:none'>"
            + "<div class='options_float_left' id='system_upgrade_left'></div>" //在线升级
            + "<div id='system_upgrade_div' class='options_float_right options_float_right_button'></div>"
            + "</div>";
          //Direct Connect Uploads upgrades
          if (_this.$store.state.jumpPageData.networkEnviron == "private") {
            l_inner_html +=
              "<div class='list_right_item' style='display:none'>"
              + "<div class='options_float_left'>" + mcs_upload_upgrade + "</div>" //？上传升级
              + "<div id='file_upload_div' class='options_float_right' style='position:relative;right:40px;top:10px;cursor:pointer;'></div>"
              + "</div>";
          }
          l_inner_html +=
            "<div id='activation_div' class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_activation + "</div>"
            + "<div class='options_float_right'>"
            + "<input type='text' id='input_activation' class='vimtag_service_address'></input>"
            + "<button id='button_activation' class='list_right_button_ex'>" + mcs_activate + "</button>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_restore_the_factory_settings + "</div>" //恢复出厂设置
            + "<div class='options_float_right options_float_right_button'><button id='button_restore_default_settings' class='list_right_button_ex'>" + mcs_restore + "</button></div>"
            + "</div>"
            + "<div class='list_right_item' style='margin:0 auto'>"
            + "<div class='options_float_left' id='reboot_left'>" + mcs_reboot + "</div>"  //重启
            + "<div class='options_float_right options_float_right_button'><button id='button_restart_device' class='list_right_button_ex'>" + mcs_reboot + "</button></div>"
            + "</div>";
          info.dom.innerHTML = l_inner_html;

          let l_dom_detail_div_page = _this.publicFunc.dom_create_child(info.dom, "div", "detail_div_page");
          l_dom_detail_div_page.innerHTML = "<div id='detail_div_inner'><div>";
          let l_dom_detail_div_inner = _this.publicFunc.mx("#detail_div_inner");
          let l_dom_system_upgrade_div = _this.publicFunc.mx("#system_upgrade_div");
          let l_dom_input_activation = _this.publicFunc.mx("#input_activation");
          let l_dom_button_activation = _this.publicFunc.mx("#button_activation");
          let l_dom_button_restore = _this.publicFunc.mx("#button_restore_default_settings");
          let l_dom_button_restart = _this.publicFunc.mx("#button_restart_device");
          let l_dom_system_upgrade_left = _this.publicFunc.mx("#system_upgrade_left");
          let l_extra_timer = 1;
          if (_this.$store.state.jumpPageData.selectDeviceIpc.substr(0, 3) != "166") _this.publicFunc.mx("#activation_div").style.display = "none";
          function add_system_reboot_event () {
            function device_reboot () {
              _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res =>{
                setTimeout(function () {
                  _this.$router.push({name:'devlist'})
                }, 3000)
              })
            }
            function reboot_device_reset () {
              if (_this.publicFunc.mx("#save_configuration").checked) {
                _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 1 })
              } else {
                _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 0 })
              }

            }
            //Enter the activation code box event
            l_dom_input_activation.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_activation.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            //Activate button click event
            l_dom_button_activation.onclick = function () {
              _this.$api.set.dev_activate({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                activationCode: l_dom_input_activation.value
              })
            };
            //reset
            l_dom_button_restore.onclick = function () {
              _this.publicFunc.delete_tips({ content: mcs_restore_factory_settings_prompt + "<br><input type='checkbox' id='save_configuration' checked='checked'>&nbsp;" + mcs_keep_network_settings, func: reboot_device_reset });
            };
            //Reboot Set
            l_dom_button_restart.onclick = function () {
              _this.publicFunc.delete_tips({ content: mcs_restart_prompt, func: device_reboot });
            };
            $(document).bind("click", function (event) {
              let e = event || window.event;
              let elem = e.srcElement || e.target;
              while (elem) {
                if (elem.id == "Detail_id" || elem.id == "detail_div_page") {
                  return;
                }
                elem = elem.parentNode;
              }
              $(l_dom_detail_div_page).hide();
            });
          }
          function reboot_dev_upgrade_get_ack (msg) {
            if (null == _this.$store.state.jumpPageData.systemWaitDiv) {
              let g_system_wait_div = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div;
                let l_page = _this.publicFunc.mx("#system_upgrade_div");
                let l_client_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // let l_client_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let l_client_w = _this.publicFunc.mx("#create_setting_page_right").offsetWidth;
                if (!wait_div) {

                  document.documentElement.onkeydown = function (e) { let evt = e || window.event; if (evt.keyCode != 116) return false; };
                  wait_div = document.createElement("div");
                  wait_div.setAttribute("id", "system_wait_div");
                  l_page.parentNode.appendChild(wait_div);
                  // wait_display_div = document.createElement("div")
                  // wait_display_div.setAttribute("id", "system_wait_display_div");
                  // l_page.parentNode.appendChild(wait_display_div);
                  wait_div[s_style][s_cssText] = "float:right;background-color:#fff;"
                    + "filter:alpha(opacity=10);z-index:100";
                  // wait_display_div[s_style][s_cssText] = "top:" + (l_client_h / 3) + "px;left:" + (l_client_w / 2) + "px";
                  wait_div["innerHTML"] =
                    "<div id='cl_wait_div' style='text-align:center'></div>"
                  // +"<div id='cl_str_div' style='padding-left:10px;padding-top:10px;font-weight:900;font-size:18px;color:#EEE'>" + str + "</div>";

                  let cl = new CanvasLoader("cl_wait_div", { id: "canvasLoader", safeVML: true });
                  cl.setColor('#8bb238');
                  cl.setDiameter(36);
                  cl.setDensity(43);
                  cl.setRange(1.1);
                  cl.show();
                }
              }
              _this.$store.dispatch('setSystemWaitDiv', g_system_wait_div)
            }
            if (null == _this.$store.state.jumpPageData.systemStopWait) {
              let g_system_stop_wait = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div = _this.publicFunc.mx("#system_wait_display_div");

                document.documentElement.onkeydown = null;
                if (wait_div) {
                  wait_div["innerHTML"] = "";
                  wait_div.parentNode[s_removeChild](wait_div);
                  wait_div = null;
                }
                if (wait_display_div) {
                  wait_display_div["innerHTML"] = "";
                  wait_display_div.parentNode[s_removeChild](wait_display_div);
                  wait_display_div = null;
                }
              }
              _this.$store.dispatch('setSystemStopWait', g_system_stop_wait)
            }
            let msg_status = msg.status;
            if (msg.check_ver && msg_status == "fail") {
              msg_status = "free";
            }
            if (msg.type == "online" && msg_status == "") {
              l_dom_system_upgrade_div.innerHTML = mcs_already_latest_version;
            }
            else if (msg_status == "fail") {
              _this.publicFunc.msg_tips({ msg: mcs_fail + ":" + msg.remark, type: "error", timeout: 3000 })
              // system_pop_confirm_box({ alert: true, str: mcs_fail + ":" + msg.remark });
            }
            else if (msg_status != "free" && msg_status != "" && msg_status != "finish") {
              let wait_div = _this.publicFunc.mx("#system_wait_div"), str_div = _this.publicFunc.mx("#cl_str_div"),
                i, extra = "";
              setTimeout(function () {
                _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                  reboot_dev_upgrade_get_ack(res)
                })
              }, 1000);
              // if(ref.type == "online")
              l_dom_system_upgrade_div["innerHTML"] = mcs_upgrading + "...";
              if (!wait_div) _this.$store.state.jumpPageData.systemWaitDiv("");
              else {
                for (i = 1; i <= l_extra_timer; ++i) {
                  extra += "."
                }
                l_extra_timer = ++l_extra_timer > 3 ? 1 : l_extra_timer;
                if (msg_status == "download") {
                  str_div["innerHTML"] = mcs_downloading + extra;
                }
                else if (msg_status == "erase") {
                  str_div["innerHTML"] = mcs_erasing + extra;
                }
                else if (msg_status == "write") {
                  str_div["innerHTML"] = mcs_writing + " " + msg.progress + "%";  //Download shows the percentage
                }
              }
            }
            else {
              _this.$store.state.jumpPageData.systemStopWait();
              l_extra_timer = 1;
              if (msg.check_ver) {
                if (msg.ver_current < "12.09.13.04.04") {
                  l_dom_system_upgrade_div.parentNode[s_style].display = "none";
                }
                if ((msg.ver_valid.length != 0 && msg.ver_current.length != 0 && msg.ver_valid != msg.ver_current) || (msg.ext_prj != msg.ext_hw && msg.ext_hw.length != 0)) {
                  l_dom_system_upgrade_left.innerHTML = mcs_online_upgrade;
                  l_dom_system_upgrade_div.innerHTML = "<div style='float:left;margin-top:8px;'>" + mcs_new_version + msg.ver_valid + mcs_valid + "</div><div style='padding-top:20px;float:left'><div id='Detail_id'></div></div>&nbsp;<button class='list_right_button_ex'>" + mcs_upgrade + "</button>";
                  _this.publicFunc.mx("#Detail_id").onclick = function () {
                    $(l_dom_detail_div_page).toggle();
                    $(l_dom_detail_div_inner).mCustomScrollbar("update");
                  }
                  //Upgrade button click event
                  _this.publicFunc.mx("/button", l_dom_system_upgrade_div)[0].onclick = function () {
                    let img_ver = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).img_ver;
                    let valid_ver = msg.ver_valid;
                    let ver_update_warn = "";
                    function desc_get_ack (msg) {
                      if (msg.data.desc) {
                        for (let i = 0, length = msg.data.desc.length; i < length; i++) {
                          ver_update_warn += msg.data.desc[i] + "<br>";
                        }
                      }
                      _this.publicFunc.delete_tips({
                        content: (ver_update_warn ? ver_update_warn : (mcs_upgrade_to_the_latest_version + valid_ver)), func: function () {
                          _this.$api.set.upgrade_set({
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            check: 1
                          }).then(() => {
                            _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
                              reboot_dev_upgrade_get_ack(res)
                            })
                          })
                        }
                      })
                    }
                    _this.$api.set.desc_get({
                      ver_type: "windows",
                      ver_from: img_ver,
                      ver_to: msg.ver_valid,
                      lang: _this.$store.state.user.userLanguage
                    }).then(res => {
                      if (res.result === '') {
                        desc_get_ack(res)
                      }
                    })
                  }
                  $("#Detail_id").hide();
                } else {
                  l_dom_system_upgrade_left["innerHTML"] = mcs_online_upgrade;
                  l_dom_system_upgrade_div["innerHTML"] = mcs_already_latest_version;
                }
              }
              else {
                //Reboot the device upgrade is successful
                _this.publicFunc.delete_tips({
                  content: mcs_upgrade_successful_restart_to_take_effect, func: function () {
                    _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                      setTimeout(function () {
                        // createPage("devlist", { parent: obj.parent });
                        _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                      }, 1000);
                    })
                  }
                })
              }
            }
          }
          add_system_reboot_event();
          _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
            reboot_dev_upgrade_get_ack(res)
          })
          break;
        }
        case "system_reset": {//恢复出厂设置
          let l_inner_html = "";
          l_inner_html =
            "<div class='list_right_item' style='display:none'>"
            + "<div class='options_float_left' id='system_upgrade_left'></div>" //在线升级
            + "<div id='system_upgrade_div' class='options_float_right options_float_right_button'></div>"
            + "</div>";
          //Direct Connect Uploads upgrades
          if (_this.$store.state.jumpPageData.networkEnviron == "private") {
            l_inner_html +=
              "<div class='list_right_item' style='display:none'>"
              + "<div class='options_float_left'>" + mcs_upload_upgrade + "</div>" //？上传升级
              + "<div id='file_upload_div' class='options_float_right' style='position:relative;right:40px;top:10px;cursor:pointer;'></div>"
              + "</div>";
          }
          l_inner_html +=
            "<div id='activation_div' class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_activation + "</div>"
            + "<div class='options_float_right'>"
            + "<input type='text' id='input_activation' class='vimtag_service_address'></input>"
            + "<button id='button_activation' class='list_right_button_ex'>" + mcs_activate + "</button>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item' style='margin:0 auto'>"
            + "<div class='options_float_left' id='restore_left'>" + mcs_restore_the_factory_settings + "</div>" //恢复出厂设置
            + "<div class='options_float_right options_float_right_button'><button id='button_restore_default_settings' class='list_right_button_ex'>" + mcs_restore + "</button></div>"
            + "</div>"
            + "<div class='list_right_item' style='display:none'>"
            + "<div class='options_float_left'>" + mcs_reboot + "</div>"  //重启
            + "<div class='options_float_right options_float_right_button'><button id='button_restart_device' class='list_right_button_ex'>" + mcs_reboot + "</button></div>"
            + "</div>";
          info.dom.innerHTML = l_inner_html;

          let l_dom_detail_div_page = _this.publicFunc.dom_create_child(info.dom, "div", "detail_div_page");
          l_dom_detail_div_page.innerHTML = "<div id='detail_div_inner'><div>";
          let l_dom_detail_div_inner = _this.publicFunc.mx("#detail_div_inner");
          let l_dom_system_upgrade_div = _this.publicFunc.mx("#system_upgrade_div");
          let l_dom_input_activation = _this.publicFunc.mx("#input_activation");
          let l_dom_button_activation = _this.publicFunc.mx("#button_activation");
          let l_dom_button_restore = _this.publicFunc.mx("#button_restore_default_settings");
          let l_dom_button_restart = _this.publicFunc.mx("#button_restart_device");
          let l_dom_system_upgrade_left = _this.publicFunc.mx("#system_upgrade_left");
          let l_extra_timer = 1;
          if (_this.$store.state.jumpPageData.selectDeviceIpc.substr(0, 3) != "166") _this.publicFunc.mx("#activation_div").style.display = "none";
          function add_system_reset_event () {
            function device_reboot () {
              _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res =>{
                setTimeout(function () {
                  _this.$router.push({name:'devlist'})
                }, 3000)
              })
            }
            function device_reset () {
              if (_this.publicFunc.mx("#save_configuration").checked) {
                _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 1 })
              } else {
                _this.$api.set.reset_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, keep_cofig: 0 })
              }
              setTimeout(function () {
                // createPage("devlist", { parent: obj.parent });
                _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
              }, 3000);
            }
            //Enter the activation code box event
            l_dom_input_activation.onfocus = function () {
              this.select();
              // if (g_standard_input_box_onfocus)
              // g_standard_input_box_onfocus(this);
            };
            l_dom_input_activation.onblur = function () {
              // if (g_standard_input_box_onblur)
              // g_standard_input_box_onblur(this);
            };
            //Activate button click event
            l_dom_button_activation.onclick = function () {
              _this.$api.set.dev_activate({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                activationCode: l_dom_input_activation.value
              })
            };
            //reset
            l_dom_button_restore.onclick = function () {
              _this.publicFunc.delete_tips({ content: mcs_restore_factory_settings_prompt + "<br><input type='checkbox' id='save_configuration' checked='checked'>&nbsp;" + mcs_keep_network_settings, func: device_reset });
            };
            //Reboot Set
            l_dom_button_restart.onclick = function () {
              _this.publicFunc.delete_tips({ content: mcs_restart_prompt, func: device_reboot });
            };
            $(document).bind("click", function (event) {
              let e = event || window.event;
              let elem = e.srcElement || e.target;
              while (elem) {
                if (elem.id == "Detail_id" || elem.id == "detail_div_page") {
                  return;
                }
                elem = elem.parentNode;
              }
              $(l_dom_detail_div_page).hide();
            });
          }
          function system_reset_dev_upgrade_get_ack (msg) {
            if (null == _this.$store.state.jumpPageData.systemWaitDiv) {
              let g_system_wait_div = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div;
                let l_page = _this.publicFunc.mx("#system_upgrade_div");
                let l_client_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // let l_client_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let l_client_w = _this.publicFunc.mx("#create_setting_page_right").offsetWidth;
                if (!wait_div) {

                  document.documentElement.onkeydown = function (e) { let evt = e || window.event; if (evt.keyCode != 116) return false; };
                  wait_div = document.createElement("div");
                  wait_div.setAttribute("id", "system_wait_div");
                  l_page.parentNode.appendChild(wait_div);
                  // wait_display_div = document.createElement("div")
                  // wait_display_div.setAttribute("id", "system_wait_display_div");
                  // l_page.parentNode.appendChild(wait_display_div);
                  wait_div[s_style][s_cssText] = "float:right;background-color:#fff;"
                    + "filter:alpha(opacity=10);z-index:100";
                  // wait_display_div[s_style][s_cssText] = "top:" + (l_client_h / 3) + "px;left:" + (l_client_w / 2) + "px";
                  wait_div["innerHTML"] =
                    "<div id='cl_wait_div' style='text-align:center'></div>"
                  // +"<div id='cl_str_div' style='padding-left:10px;padding-top:10px;font-weight:900;font-size:18px;color:#EEE'>" + str + "</div>";

                  let cl = new CanvasLoader("cl_wait_div", { id: "canvasLoader", safeVML: true });
                  cl.setColor('#8bb238');
                  cl.setDiameter(36);
                  cl.setDensity(43);
                  cl.setRange(1.1);
                  cl.show();
                }
              }
              _this.$store.dispatch('setSystemWaitDiv', g_system_wait_div)
            }
            if (null == _this.$store.state.jumpPageData.systemStopWait) {
              let g_system_stop_wait = function (str) {
                let wait_div = _this.publicFunc.mx("#system_wait_div"),
                  wait_display_div = _this.publicFunc.mx("#system_wait_display_div");

                document.documentElement.onkeydown = null;
                if (wait_div) {
                  wait_div["innerHTML"] = "";
                  wait_div.parentNode[s_removeChild](wait_div);
                  wait_div = null;
                }
                if (wait_display_div) {
                  wait_display_div["innerHTML"] = "";
                  wait_display_div.parentNode[s_removeChild](wait_display_div);
                  wait_display_div = null;
                }
              }
              _this.$store.dispatch('setSystemStopWait', g_system_stop_wait)
            }
            let msg_status = msg.status;
            if (msg.check_ver && msg_status == "fail") {
              msg_status = "free";
            }
            if (msg.type == "online" && msg_status == "") {
              l_dom_system_upgrade_div.innerHTML = mcs_already_latest_version;
            }
            else if (msg_status == "fail") {
              _this.publicFunc.msg_tips({ msg: mcs_fail + ":" + msg.remark, type: "error", timeout: 3000 })
              // system_pop_confirm_box({ alert: true, str: mcs_fail + ":" + msg.remark });
            }
            else if (msg_status != "free" && msg_status != "" && msg_status != "finish") {
              let wait_div = _this.publicFunc.mx("#system_wait_div"), str_div = _this.publicFunc.mx("#cl_str_div"),
                i, extra = "";
              setTimeout(function () {
                _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                  system_reset_dev_upgrade_get_ack(res)
                })
              }, 1000);
              // if(ref.type == "online")
              l_dom_system_upgrade_div["innerHTML"] = mcs_upgrading + "...";
              if (!wait_div) _this.$store.state.jumpPageData.systemWaitDiv("");
              else {
                for (i = 1; i <= l_extra_timer; ++i) {
                  extra += "."
                }
                l_extra_timer = ++l_extra_timer > 3 ? 1 : l_extra_timer;
                if (msg_status == "download") {
                  str_div["innerHTML"] = mcs_downloading + extra;
                }
                else if (msg_status == "erase") {
                  str_div["innerHTML"] = mcs_erasing + extra;
                }
                else if (msg_status == "write") {
                  str_div["innerHTML"] = mcs_writing + " " + msg.progress + "%";  //Download shows the percentage
                }
              }
            }
            else {
              _this.$store.state.jumpPageData.systemStopWait();
              l_extra_timer = 1;
              if (msg.check_ver) {
                if (msg.ver_current < "12.09.13.04.04") {
                  l_dom_system_upgrade_div.parentNode[s_style].display = "none";
                }
                if ((msg.ver_valid.length != 0 && msg.ver_current.length != 0 && msg.ver_valid != msg.ver_current) || (msg.ext_prj != msg.ext_hw && msg.ext_hw.length != 0)) {
                  l_dom_system_upgrade_left.innerHTML = mcs_online_upgrade;
                  l_dom_system_upgrade_div.innerHTML = "<div style='float:left;margin-top:8px;'>" + mcs_new_version + msg.ver_valid + mcs_valid + "</div><div style='padding-top:20px;float:left'><div id='Detail_id'></div></div>&nbsp;<button class='list_right_button_ex'>" + mcs_upgrade + "</button>";
                  _this.publicFunc.mx("#Detail_id").onclick = function () {
                    $(l_dom_detail_div_page).toggle();
                    $(l_dom_detail_div_inner).mCustomScrollbar("update");
                  }
                  //Upgrade button click event
                  _this.publicFunc.mx("/button", l_dom_system_upgrade_div)[0].onclick = function () {
                    let img_ver = _this.$api.devlist.ldev_get(_this.$store.state.jumpPageData.selectDeviceIpc).img_ver;
                    let valid_ver = msg.ver_valid;
                    let ver_update_warn = "";
                    function desc_get_ack (msg) {
                      if (msg.data.desc) {
                        for (let i = 0, length = msg.data.desc.length; i < length; i++) {
                          ver_update_warn += msg.data.desc[i] + "<br>";
                        }
                      }
                      _this.publicFunc.delete_tips({
                        content: (ver_update_warn ? ver_update_warn : (mcs_upgrade_to_the_latest_version + valid_ver)), func: function () {
                          _this.$api.set.upgrade_set({
                            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                            check: 1
                          }).then(() => {
                            _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
                              system_reset_dev_upgrade_get_ack(res)
                            })
                          })
                        }
                      })
                    }
                    _this.$api.set.desc_get({
                      ver_type: "windows",
                      ver_from: img_ver,
                      ver_to: msg.ver_valid,
                      lang: _this.$store.state.user.userLanguage
                    }).then(res => {
                      if (res.result === '') {
                        desc_get_ack(res)
                      }
                    })
                  }
                  $("#Detail_id").hide();
                } else {
                  l_dom_system_upgrade_left["innerHTML"] = mcs_online_upgrade;
                  l_dom_system_upgrade_div["innerHTML"] = mcs_already_latest_version;
                }
              }
              else {
                //Reboot the device upgrade is successful
                _this.publicFunc.delete_tips({
                  content: mcs_upgrade_successful_restart_to_take_effect, func: function () {
                    _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(() => {
                      setTimeout(function () {
                        // createPage("devlist", { parent: obj.parent });
                        _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                      }, 1000);
                    })
                  }
                })
              }
            }
          }
          add_system_reset_event();
          _this.$api.set.upgrade_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, check: 1 }).then(res => {
            system_reset_dev_upgrade_get_ack(res)
          })
          break;
        }
        case "ethernet": {//以太网
          info.dom.innerHTML =
            "<div id='set_main_page' class='ethernet_info'>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_startup_status + "</div><div class='list_info'><div id='ethernet_open_btn'></div></div></div>"
            + "</div>"
            + "<div id='ethernet_box'>"
            // +"<div class='menu_list_box_no_margin'>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_mac_address + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_network_status + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_dhcp_ip + "</div><div class='list_info'><div id='eth_auto_get_ip_btn'></div></div></div>"

            + "<div id='eth_auto_get_ip_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_ip_address + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_gateway + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_network_mask + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_dhcp_dns + "</div><div class='list_info'><div id='eth_auto_get_dns_btn'></div></div></div>"
            + "<div id='eth_auto_get_dns_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_dns_prim + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_secondary_dns + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "</div>"
            // +"</div>"
            + "</div>"
            + "<div id='eth_set_btn' class='set_btn'>" + mcs_action_apply + "</div>"
            + "</div>"
          $("#ethernet_open_btn").switchBtn();
          $("#eth_auto_get_ip_btn").switchBtn();
          $("#eth_auto_get_dns_btn").switchBtn();
          let l_dom_list_info = _this.publicFunc.mx(".list_info");
          let networks, dns;
          function get_ethernet_ack (msg) {
            // $("#buffer_page").hide();
            _this.publicFunc.closeBufferPage()
            if (msg && msg.result == "") {
              networks = msg.networks[0];
              dns = msg.dns;
              l_dom_list_info[1].innerHTML = networks.phy.info.mac;
              l_dom_list_info[2].innerHTML = networks.ipv4.info.stat == "ok" ? mcs_connnected : mcs_not_connected;
              l_dom_list_info[4].innerHTML = networks.ipv4.info.ip.addr;
              l_dom_list_info[5].innerHTML = networks.ipv4.info.ip.gw;
              l_dom_list_info[6].innerHTML = networks.ipv4.info.ip.mask;
              l_dom_list_info[8].innerHTML = dns.info.dns[0];
              l_dom_list_info[9].innerHTML = dns.info.dns[1];
              if (networks.ipv4.conf.mode == "dhcp") {
                $("#eth_auto_get_ip_btn").switchBtn(true, $("#eth_auto_get_ip_box"), 1);
              } else {
                $("#eth_auto_get_ip_btn").switchBtn(false, $("#eth_auto_get_ip_box"), 2);
              }
              if (dns.conf.mode == "dhcp") {
                $("#eth_auto_get_dns_btn").switchBtn(true, $("#eth_auto_get_dns_box"), 1);
              } else {
                $("#eth_auto_get_dns_btn").switchBtn(false, $("#eth_auto_get_dns_box"), 2);
              }
              if (networks.enabled) {
                $("#ethernet_open_btn").switchBtn(true, $("#ethernet_box"));
              } else {
                $("#ethernet_open_btn").switchBtn(false, $("#ethernet_box"));
              }
            }
          }
          function ethernet_ccm_net_set_ack (msg) {
            _this.publicFunc.msg_tips({ msg: msg.msg, type: msg.type, timeout: 3000 });
          }
          _this.publicFunc.mx("#eth_set_btn").onclick = function () {
            let req_networks = {}, req_dns = {};
            let ethernet_open_btn_type = _this.publicFunc.mx("#ethernet_open_btn").getAttribute("type");
            let eth_auto_get_ip_btn_type = _this.publicFunc.mx("#eth_auto_get_ip_btn").getAttribute("type");
            let eth_auto_get_dns_btn_type = _this.publicFunc.mx("#eth_auto_get_dns_btn").getAttribute("type");
            req_networks.enabled = ethernet_open_btn_type == "true" ? 1 : 0;
            req_networks.token = "eth0";
            if (eth_auto_get_ip_btn_type == "true") {
              networks.ipv4 = { conf: { enabled: 1, mode: "dhcp", static_ip: "", debug_ip: "" } };
            } else {
              networks.ipv4 = { conf: { enabled: 0, mode: "static" } };
              networks.ipv4.conf.static_ip = {
                gw: (l_dom_list_info[5].childNodes ? l_dom_list_info[5].childNodes[0].value : l_dom_list_info[5].innerHTML),
                addr: (l_dom_list_info[4].childNodes ? l_dom_list_info[4].childNodes[0].value : l_dom_list_info[4].innerHTML),
                mask: (l_dom_list_info[6].childNodes ? l_dom_list_info[6].childNodes[0].value : l_dom_list_info[6].innerHTML)
              }
            }
            if (eth_auto_get_dns_btn_type == "true") {
              req_dns = { conf: { enalbed: 1, mode: "dhcp", static_dns: dns.conf.static_dns } };
            } else {
              req_dns = {
                conf: {
                  enalbed: 0, mode: "static",
                  static_dns: []
                }
              };
              req_dns.conf.static_dns[0] = l_dom_list_info[8].childNodes ? l_dom_list_info[8].childNodes[0].value : l_dom_list_info[8].innerHTML;
              req_dns.conf.static_dns[1] = l_dom_list_info[9].childNodes ? l_dom_list_info[9].childNodes[0].value : l_dom_list_info[9].innerHTML;
            }
            _this.$api.set.set_network({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              networks: req_networks,
              dns: req_dns,
              select: "ethernet"
            }).then(res => {
              ethernet_ccm_net_set_ack(res)
            })
          }
          // $("#buffer_page").show();
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.set.get_network({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            get_ethernet_ack(res[0], res[1])
          })

          break;
        }
        case "wifi": {
          info.dom.innerHTML =

            "<div id='set_main_page'>"
            + "<div id='wifi_page'>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_startup_status + "</div><div class='list_info'><div id='wifi_open_btn'></div></div></div>"
            + "</div>"
            + "<div id='wifi_box'>"
            + "<div class='menu_list_box_no_margin'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_mac_address + "</div><div class='list_info'></div></div>"
            + "<div style='display: none' class='menu_list_last'><div class='list_name'>" + mcs_network_status + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "<div class='wifi_mode_title' id='wifi_mode_title'>" + mcs_wifi_mode + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list_last'>"
            + "<div class='menu_list_toogle_box' id='menu_list_toogle_box'>"
            + "<div id='select_wifi_client' class='menu_list_toogle_btn_2 menu_list_toogle_btn_active'>" + mcs_client + "</div>"
            + "<div id='select_wifi_ap' class='menu_list_toogle_btn_2'>" + mcs_ap + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div id='wifi_client_box'>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_wifi_list + "</div><div class='list_info' style='position:relative'> </div></div>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_password + "</div><div class='list_info'><input class='set_input_black' type='password'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_connect_status + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_dhcp_ip + "</div><div class='list_info'><div id='wifi_auto_get_ip_btn'></div></div></div>"
            + "<div id='wifi_auto_get_ip_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_ip_address + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_gateway + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_network_mask + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_dhcp_dns + "</div><div class='list_info'><div id='wifi_auto_get_dns_btn'></div></div></div>"
            + "<div id='wifi_auto_get_dns_box'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_dns_prim + "</div><div class='list_info'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_secondary_dns + "</div><div class='list_info'></div></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div id='wifi_ap_box'>"
            + "<div class='wifi_mode_title' id='dhcp_server'>" + mcs_dhcp_server + "</div>"
            + "<div class='menu_list_box_no_margin'>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_start_address + "</div><div class='list_info'><input class='set_input_black'></div></div>"
            + "<div class='menu_list'><div class='list_name'>" + mcs_end_address + "</div><div class='list_info'><input class='set_input_black'></div></div>"
            + "<div class='menu_list_last'><div class='list_name'>" + mcs_gateway + "</div><div class='list_info'><input class='set_input_black'></div></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div id='set_wifi_btn' class='set_btn'>" + mcs_action_apply + "</div>"
            + "</div>"
            + "<div id='wifi_list'></div>"
            + "</div>"
          $("#wifi_open_btn").switchBtn();
          $("#wifi_auto_get_ip_btn").switchBtn();
          $("#wifi_auto_get_dns_btn").switchBtn();
          $("#wifi_ap_box").hide();
          $("#wifi_list").hide();
          let l_dom_list_info = _this.publicFunc.mx(".list_info");
          let networks, dns;
          let wifi_name;
          let wifi_mode = "client";
          _this.publicFunc.mx("#select_wifi_client").onclick = function () {
            wifi_mode = "client";
            $(".menu_list_toogle_btn_2").removeClass("menu_list_toogle_btn_active");
            $(this).addClass("menu_list_toogle_btn_active");
            $("#wifi_client_box").slideDown();
            $("#wifi_ap_box").slideUp();
          }
          _this.publicFunc.mx("#select_wifi_ap").onclick = function () {
            wifi_mode = "ap"
            $(".menu_list_toogle_btn_2").removeClass("menu_list_toogle_btn_active");
            $(this).addClass("menu_list_toogle_btn_active");
            $("#wifi_ap_box").slideDown();
            $("#wifi_client_box").slideUp();
          }
          function get_wifi_network_ack (msg) {
            // $("#buffer_page").hide();
            _this.publicFunc.closeBufferPage()
            let wifi_list_content = "";
            if (msg && msg.result == "") {
              networks = msg.networks[1];
              dns = msg.dns;
              l_dom_list_info[1].innerHTML = networks.phy.info.mac;
              l_dom_list_info[2].innerHTML = networks.wifi_client.info.stat == "ok" ? mcs_connnected : mcs_not_connected;
              l_dom_list_info[3].innerHTML = networks.wifi_client.conf.ssid ? "<span id='set_wifi_name'>" + networks.wifi_client.conf.ssid + "</span><div class='right_arrow'></div>" : "<span id='set_wifi_name'>" + mcs_not_select + "</span><div class='right_arrow'></div>";
              l_dom_list_info[4].childNodes[0].value = networks.wifi_client.conf.key;
              l_dom_list_info[5].innerHTML = networks.wifi_client.info.stat == "ok" ? mcs_connnected : mcs_not_connected;
              l_dom_list_info[7].innerHTML = networks.ipv4.info.ip.addr;
              l_dom_list_info[8].innerHTML = networks.ipv4.info.ip.gw;
              l_dom_list_info[9].innerHTML = networks.ipv4.info.ip.mask;
              l_dom_list_info[11].innerHTML = dns.info.dns[0];
              l_dom_list_info[12].innerHTML = dns.info.dns[1];
              l_dom_list_info[13].childNodes[0].value = networks.dhcp_srv.conf.ip_start;
              l_dom_list_info[14].childNodes[0].value = networks.dhcp_srv.conf.ip_end;
              l_dom_list_info[15].childNodes[0].value = networks.dhcp_srv.conf.gw;
              if (networks.ipv4.conf.mode == "dhcp") {
                $("#wifi_auto_get_ip_btn").switchBtn(true, $("#wifi_auto_get_ip_box"), 1);
              } else {
                $("#wifi_auto_get_ip_btn").switchBtn(false, $("#wifi_auto_get_ip_box"), 2);
              }
              if (dns.conf.mode == "dhcp") {
                $("#wifi_auto_get_dns_btn").switchBtn(true, $("#wifi_auto_get_dns_box"), 1);
              } else {
                $("#wifi_auto_get_dns_btn").switchBtn(false, $("#wifi_auto_get_dns_box"), 2);
              }
              if (networks.enabled) {
                $("#wifi_open_btn").switchBtn(true, $("#wifi_box"));
              } else {
                $("#wifi_open_btn").switchBtn(false, $("#wifi_box"));
              }
              let wifi_list = networks.wifi_client.ap_list || [];
              for (let i = 0; i < wifi_list.length; i++) {
                if (wifi_list[i].ssid == "") continue;
                if (wifi_list[i].signal < 0) {
                  wifi_list[i].signal = wifi_list[i].signal + 100;
                }
                let signal_level = Math.floor(wifi_list[i].signal / 20);
                signal_level = (signal_level >= 5 ? 4 : signal_level);
                wifi_list_content +=
                  "<div class='wifi_button'>"
                  + "<img class='left_img' src='/imgs/wifi_signal" + signal_level + ".png'>"
                  + "<span class = 'wifi_name'>" + wifi_list[i].ssid + "</span>"
                  // +"<img class='right_img' src='../imgs/wifi_selected"+g_device_pixelRatio+"'>"
                  + "</div>";
              }
              _this.publicFunc.mx("#wifi_list").innerHTML = wifi_list_content;
              let l_dom_wifi_button = $(".wifi_button");
              for (let j = 0; j < l_dom_wifi_button.length; j++) {
                l_dom_wifi_button[j].onmouseenter = function () {
                  this.style.background = '#ccc'
                }
                l_dom_wifi_button[j].onmouseleave = function () {
                  this.style.background = '#fff'
                }
                l_dom_wifi_button[j].onclick = function () {
                  l_dom_list_info[3].innerHTML = "<span id='set_wifi_name'>" + this.lastChild.innerHTML + "</span><div class='right_arrow'></div>";
                  $("#wifi_list").hide();
                }
              }
              l_dom_list_info[3].onclick = function () {
                $("#wifi_list").slideDown();
              }
              function wifi_ccm_net_set_ack (msg) {
                let l_refresh_timer;
                let count_error = 0;
                let count_ok = 0;
                if (msg.type == "success") {
                  if (wifi_mode != "client") {
                    _this.publicFunc.msg_tips({ msg: mcs_connection_successfully, type: "success", timeout: 3000 });
                    // $("#buffer_page").hide();
                    _this.publicFunc.closeBufferPage()
                    return;
                  }
                  l_refresh_timer = window.setInterval(function () {
                    _this.$api.set.get_network({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      select: "wifi"
                    }).then(res => {
                      let msg = res[0]
                      if (msg.networks[1].wifi_client.info.stat == 'err') {
                        window.clearInterval(l_refresh_timer);
                        if (count_error == 0) {
                          _this.publicFunc.msg_tips({ msg: mcs_not_connected, type: "error", timeout: 3000 });
                          // $("#buffer_page").hide();
                          _this.publicFunc.closeBufferPage()
                          get_wifi_network_ack(msg);
                        }
                        count_error++;
                      } else if (msg.networks[1].wifi_client.info.stat == 'info.keyincorrect') {
                        window.clearInterval(l_refresh_timer);
                        if (count_error == 0) {
                          _this.publicFunc.msg_tips({ msg: mcs_not_connected, type: "error", timeout: 3000 });
                          // $("#buffer_page").hide();
                          _this.publicFunc.closeBufferPage()
                          get_wifi_network_ack(msg);
                        }
                        count_error++;
                      } else if (msg.networks[1].wifi_client.info.stat == 'ok') {
                        window.clearInterval(l_refresh_timer);
                        if (count_ok == 0) {
                          _this.publicFunc.msg_tips({ msg: mcs_connnected, type: "success", timeout: 3000 });
                          // $("#buffer_page").hide();
                          _this.publicFunc.closeBufferPage()
                          get_wifi_network_ack(msg);
                        }
                        count_ok++;
                      }
                    })
                  }, 5000);
                }
                else {
                  _this.publicFunc.msg_tips({ msg: msg.msg, type: msg.type, timeout: 3000 });
                }
              }
              _this.publicFunc.mx("#set_wifi_btn").onclick = function () {
                let req_networks = {}, req_dns = {};
                req_networks.token = "ra0";
                let wifi_open_btn_type = _this.publicFunc.mx("#wifi_open_btn").getAttribute("type");
                let wifi_auto_get_ip_btn_type = _this.publicFunc.mx("#wifi_auto_get_ip_btn").getAttribute("type");
                let wifi_auto_get_dns_btn_type = _this.publicFunc.mx("#wifi_auto_get_dns_btn").getAttribute("type");
                req_networks.enabled = wifi_open_btn_type == "true" ? 1 : 0;
                if (wifi_auto_get_dns_btn_type == "true") {
                  req_dns = { conf: { enalbed: 1, mode: "dhcp", static_dns: dns.conf.static_dns } };
                } else {
                  req_dns = {
                    conf: {
                      enalbed: 0, mode: "static",
                      static_dns: []
                    }
                  };
                  req_dns.conf.static_dns[0] = l_dom_list_info[11].childNodes ? l_dom_list_info[11].childNodes[0].value : l_dom_list_info[11].innerHTML;
                  req_dns.conf.static_dns[1] = l_dom_list_info[12].childNodes ? l_dom_list_info[12].childNodes[0].value : l_dom_list_info[12].innerHTML;
                }
                if (wifi_mode == "client") {
                  req_networks.phy = { conf: { mode: "wificlient", mtu: networks.phy.conf.mtu } };
                  if (wifi_auto_get_ip_btn_type == "true") {
                    req_networks.ipv4 = { conf: { enabled: 1, mode: "dhcp", static_ip: "", debug_ip: "" } };
                  } else {
                    req_networks.ipv4 = { conf: { enabled: 0, mode: "static", static_ip: {} } };
                    req_networks.ipv4.conf.static_ip.addr = l_dom_list_info[7].childNodes ? l_dom_list_info[7].childNodes[0].value : l_dom_list_info[7].innerHTML;
                    req_networks.ipv4.conf.static_ip.gw = l_dom_list_info[8].childNodes ? l_dom_list_info[8].childNodes[0].value : l_dom_list_info[8].innerHTML;
                    req_networks.ipv4.conf.static_ip.mask = l_dom_list_info[9].childNodes ? l_dom_list_info[9].childNodes[0].value : l_dom_list_info[9].innerHTML;
                    req_networks.ipv4.conf.debug_ip = networks.ipv4.conf.debug_ip;
                  }
                  req_networks.wifi_client = { conf: { enabled: 1 } }
                  req_networks.wifi_client.conf.ssid = _this.publicFunc.mx("#set_wifi_name") ? _this.publicFunc.mx("#set_wifi_name").innerHTML : "";
                  req_networks.wifi_client.conf.key = l_dom_list_info[4].childNodes[0].value;
                } else {
                  req_networks.phy = { conf: { mode: "adhoc", mtu: networks.phy.conf.mtu } };
                  req_networks.dhcp_srv = { conf: { enabled: 1 } }
                  req_networks.dhcp_srv.conf.gw = l_dom_list_info[15].childNodes[0].value;
                  req_networks.dhcp_srv.conf.ip_start = l_dom_list_info[13].childNodes[0].value;
                  req_networks.dhcp_srv.conf.ip_end = l_dom_list_info[14].childNodes[0].value;
                }
                // $("#buffer_page").show();
                // 展示遮罩层
                _this.publicFunc.showBufferPage()
                _this.$api.set.set_network({
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  networks: req_networks,
                  dns: req_dns,
                  select: "wifi"
                }).then(res => {
                  wifi_ccm_net_set_ack(res)
                })
              }
            }
          }
          // $("#buffer_page").show();
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.set.get_network({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            get_wifi_network_ack(res[0], res[1])
          })

          break;
        }
        case "sound": {//声音
          info.dom.innerHTML =
            "<div id = 'other_info' class = 'list_right_box'>"
            + "<div class='list_right_item'>"
            + "<div class='vimtag_options_float_left sd_mode_text'>" + mcs_audio + " :</div>"
            + "</div>"
            + "<div class = 'list_right_item_ex' id='speaker_new'>"
            + "<div class='vimtag_options_float_left sd_mode_text'>- " + mcs_speaker + "</div>"
            + "<div class='options_float_right' style='width:200px;'>"
            + "<label for='input_speaker'></label>"
            + "<input name='slider' type='text' id='input_speaker' class='fd_tween fd_classname_extraclass fd_hide_input "
            + "fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
            + "</div>"
            + "</div>"
            + "<div class='list_right_item' id='mic_new'>"
            + "<div class='vimtag_options_float_left sd_mode_text'>- " + mcs_mic + "</div>"
            + "<div class='options_float_right' style='width:200px;'>"
            + "<label for='input_microphone'></label>"
            + "<input name='slider' type='text' id='input_microphone' class='fd_tween fd_classname_extraclass fd_hide_input "
            + "fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'</input>"
            + "</div>"
            + "</div>"

            + "<div class='options_float_right' style='clear:both'><button id='button_setup' class='list_right_button' >" + mcs_apply + "</button>"
            + "</div>"
            + "</div>";
          let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
          let l_dom_input_speaker = _this.publicFunc.mx("#input_speaker");
          let l_dom_input_microphone = _this.publicFunc.mx("#input_microphone");
          let l_cam_info;
          let l_ratio = 0;

          function sound_add_others_event () {

            l_dom_button_setup.onclick = function () {
              let output_level, speaker_level;
              speaker_level = parseInt(_this.publicFunc.mx(".fd-slider-handle", _this.publicFunc.mx("#fd-slider-input_speaker"))[0].getAttribute("aria-valuenow"), 10);
              output_level = parseInt(_this.publicFunc.mx(".fd-slider-handle", _this.publicFunc.mx("#fd-slider-input_microphone"))[0].getAttribute("aria-valuenow"), 10);
              _this.$api.set.audio_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                mic_level: output_level,
                speaker_level: speaker_level
              }).then(res => {
                _this.set_result(res)
              })
            };
          }

          function dev_audio_get_ack (msg) {
            //console.log('test error2')
            if (l_dom_input_speaker) {
              fdSliderController.increment("input_speaker", msg.speaker_level - l_dom_input_speaker.value);
            }
            if (l_dom_input_microphone) {
              fdSliderController.increment("input_microphone", msg.mic_level - l_dom_input_microphone.value);
            }
            //console.log('test error2')
          }

          sound_add_others_event();
          fdSliderController.create();
          _this.$api.set.audio_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            dev_audio_get_ack(res)
          })
          break;
        }
        case "power_frequency": {//频率
          info.dom.innerHTML =
            "<div id = 'other_info' class = 'list_right_box'>"

            + "<div id='power_fr_div'>"
            + "<div class='options_float_left'>" + mcs_power_frequency + "</div>" //电源频率
            + "<div class='options_float_right select_block'><select id='power_fr'>"
            + "<option>50hz</option>"
            + "<option>60hz</option>"
            + "</select>"
            + "</div>"
            + "</div>"


            + "</div>";

          let l_dom_power_fr = _this.publicFunc.mx("#power_fr");

          let l_cam_info;
          let l_ratio = 0;
          function cam_resolute_set () {
            let flip, flicker_freq;
            l_cam_info.flip = Number(l_dom_ipc_turnover.checked);
            l_cam_info.flicker_freq = l_dom_power_fr.selectedIndex;
            l_cam_info.resolute = l_dom_screen_fr.selectedIndex ? "16:9" : "4:3";
            _this.$api.play.adjust_set({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              flip: Number(l_dom_ipc_turnover.checked),
              flicker_freq: l_dom_power_fr.selectedIndex
            }).then(res => {
              if (res.result == "permission.denied") {
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
              } else if (res.result != "") {
                _this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
                _this.publicFunc.delete_tips({
                  content: mcs_restart_prompt, func: function () {
                    _this.$api.set.reboot_device({ sn: _this.$store.state.jumpPageData.selectDeviceIpc })
                    setTimeout(function () {
                      // createPage("devlist", { parent: obj.parent });
                      _this.$router.push({ name: 'devlist', params: { parent: obj.parent } });
                    }, 1000);
                  }
                });
              }
            })
          }
          function power_frequency_add_others_event () {

            $("#power_fr").change(
              function () {
                power_frequency_cam_set();
              });


          }
          function power_frequency_cam_set () {
            _this.$api.play.adjust_set({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              flicker_freq: l_dom_power_fr.selectedIndex
            }).then(res => {
              if (res.result != "") {
                _this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
              }
            })

          }

          function power_frequency_cam_get_ack (msg) {

            l_cam_info = msg;
            l_cam_info.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
            msg.flicker_freq ? (l_dom_power_fr[1].selected = true) : (l_dom_power_fr[0].selected = true);

          }
          power_frequency_add_others_event();
          _this.$api.play.adjust_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            power_frequency_cam_get_ack(res)
          })
          break;
        }
        case "equipment_flip": { //图像翻转
          info.dom.innerHTML =
            "<div id = 'other_info' class = 'list_right_box'>"

            + "<div class='list_right_item'>"
            + "<span class='attribute_key_text'>" + mcs_equipment_flip + "</span>"
            + "<div id='checkbox_ipc_turnover_div' class='options_float_right'><input id='checkbox_ipc_turnover' type='checkbox'/></div>"
            + "</div>"

            + "</div>";
          let l_dom_ipc_turnover = _this.publicFunc.mx("#checkbox_ipc_turnover");

          let l_ipc_turnover_true = 0;
          let l_cam_info;

          function equipment_flip_add_others_event () {
            $("#checkbox_ipc_turnover").iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_ipc_turnover_true) {
                  l_ipc_turnover_true = 0;
                } else {
                  equipment_flip_cam_set();
                }
              }
            });

          }
          function equipment_flip_cam_set () {
            _this.$api.play.adjust_set({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              flip: Number(l_dom_ipc_turnover.checked)
            }).then(res => {
              if (res.result !== "") {
                _this.publicFunc.msg_tips({ msg: res.result, type: "error", timeout: 3000 });
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
              }
            })
          }

          function equipment_flip_cam_get_ack (msg) {
            l_ipc_turnover_true = 1;
            l_cam_info = msg;
            l_cam_info.sn = _this.$store.state.jumpPageData.selectDeviceIpc;

            if (msg.flip) {
              $("#checkbox_ipc_turnover").iButton("toggle", true);
            } else {
              $("#checkbox_ipc_turnover").iButton("toggle", false);
            }
          }
          equipment_flip_add_others_event();

          _this.$api.play.adjust_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            equipment_flip_cam_get_ack(res)
          })
          break;
        }
        case "alarm": {
          info.dom.innerHTML =
            "<div id='set_main_page' class='alarm_page'>"
            + "<div style='height:2rem;margin-top:1rem;display:none'>" + mcs_continuous_recording + "</div>"
            + "<div class='menu_list2_box' id='record_plan' style='overflow:hidden;display:none'>"
            + "<div class='menu_record' style='display:none;'><div class='list_name'>"
            + "<div class='list_name_title'>" + mcs_continuous_recording + "</div>"
            + "<div class='list_name_tips' id='is_show'></div>"  //下面开启关闭
            + "</div><div class='list_info'>"
            + "<div class='right_arrow'></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'>" + mcs_allow_type + "</div>"
            + "<div class='menu_list2_box' id='record_event'></div>"

            + "</div>";

          l_dom_record_event = _this.publicFunc.mx("#record_event");
          // let data;
          // let l_scene_data_out, l_scene_data_active;
          // let l_select_scene_name;
          face_detect = ''
          sound_detect = "";
          g_accessory_sn = "";
          g_accessory_type = "";
          _this.g_show = "false";
          time_format = [];

          day_list = [];
          g_total_type = "";
          g_aa_data = "";
          g_set_old_out_time = "";
          index = -1;
          g_week_w = [];
          g_total_data = "";
          // let set_record_alarm_title, set_record_alarm_content;
          function create_set_alarm_page (repeat_page) { //允许报警设置开关时间页面
            //控制显示内容
            let set_record_alarm_title, set_record_alarm_content;
            _this.record_flag_out = 'true';
            set_record_alarm_title = mcs_Allow_alarm;
            set_record_alarm_allow_title = mcs_Allow_alarm_schedule;
            if (g_accessory_type == 1) {

              set_record_alarm_content = mcs_move_alarm_new_detail;
            } else if (g_accessory_type == 5) {

              set_record_alarm_content = mcs_sos_alarm_detail;
            } else if (g_accessory_type == 6) {

              set_record_alarm_content = mcs_send_alarm_notification;
            } else if (g_accessory_type == 8) {

              set_record_alarm_content = mcs_move_record_detail;
            } else if (g_accessory_type == 9) {

              set_record_alarm_content = mcs_move_record_detail;
            }
            else if (g_accessory_type == "") {
              set_record_alarm_content = mcs_7x24_hours_prompt;
            }

            $("#add_device_page").show();
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"

              + "<div class='set_main_page_alarm'>"
              + "<div class='menu_list_box'>" //允许报警和开关
              + "<div class='menu_list record_allow'>"
              + "<div class='list_name record_padding'>" + set_record_alarm_title + "</div>"  //set_record_alarm_title
              + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_box_title2 record_background'>" + set_record_alarm_content + "</div>" //set_record_alarm_content

              + "<div class='margin'>" //设置时间
              + "<div class='set_alarm_time_word' style='display:none;'>" + set_record_alarm_allow_title + "</div>" //set_record_alarm_allow_title
              + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
              + "<div id='set_out_time_box'></div>"
              + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"

              + "</div>"
              + "</div>"
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            l_dom_attachmen_box_close.onclick = function () {
              _this.record_flag(time_format, day_list)
              if (_this.g_show == "true") {
                _this.publicFunc.delete_tips({
                  content: mcs_is_save_hint, func: function () {
                    $("#add_device_page").css('display', 'none');
                    _this.create_right_page({ type: 'alarm', dom: _this.publicFunc.mx("#create_setting_page_new") })
                  }
                })
              } else {
                _this.create_right_page({ type: 'alarm', dom: _this.publicFunc.mx("#create_setting_page_new") });
                $("#add_device_page").css('display', 'none');
              }
            }
            let data, l_scene_data_out, l_scene_data_active;
            let req_data;
            $("#at_home_btn").switchBtn();
            _this.publicFunc.mx("#set_time_add").onclick = function () {
              _this.g_set_out_time = "";
              _this.g_is_add = "true";
              set_time();
            }
            function alarm_set_event () {
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                  if (at_home_type == "true") {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x4; //on voice
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x4; //on voice
                    $(".set_alarm_time_word").show();
                    $("#hide_timebox").show();
                  } else {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag & 0x3; //off voice
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag & 0x3; //off voice
                    $("#hide_timebox").hide();
                    $(".set_alarm_time_word").hide();
                  }
                }
              }
            }//alarm_set_event
            function set_plan_record () {
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              if (at_home_type == "true") {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 1;
                $("#hide_timebox").show();
                $(".set_alarm_time_word").show();
              } else {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 0;
                $("#hide_timebox").hide();
                $(".set_alarm_time_word").hide();

              }
            }//set_plan_record

            function get_scene_ack (msg) {
              let scene_data;
              g_total_type = msg;
              // $("#buffer_page").hide();
              _this.publicFunc.closeBufferPage()
              if (msg && msg.result == "") {
                data = msg;
                for (let i = 0; i < msg.data.info.scene.length; i++) {
                  scene_data = msg.data.info.scene[i];
                  if (scene_data.name == "out") {
                    l_scene_data_out = msg.data.info.scene[i];
                    if (g_accessory_sn) {
                      for (let j = 0; j < scene_data.dev.length; j++) {
                        if (scene_data.dev[j].id == g_accessory_sn) {
                          if (repeat_page !== 1) {
                            if (scene_data.dev[j].flag & 0x4) {
                              $("#at_home_btn").switchBtn(true, "", "", alarm_set_event);
                              $("#hide_timebox").show();
                              $(".set_alarm_time_word").show();
                            } else {
                              $("#at_home_btn").switchBtn(false, "", "", alarm_set_event);
                              $("#hide_timebox").hide();
                              $(".set_alarm_time_word").hide();
                            }
                          } else {
                            $("#at_home_btn").switchBtn(true, "", "", alarm_set_event);
                            $("#hide_timebox").show();
                            $(".set_alarm_time_word").show();
                          }
                        }
                      }
                    } else {
                      if (repeat_page !== 1) {
                        if (scene_data.flag) {
                          $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                          $("#hide_timebox").show();
                          $(".set_alarm_time_word").show();
                        } else {
                          $("#at_home_btn").switchBtn(false, "", "", set_plan_record);
                          $("#hide_timebox").hide();
                        }
                      } else {
                        $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                        $("#hide_timebox").show();
                        $(".set_alarm_time_word").show();
                      }

                    }
                  } else if (scene_data.name == "in") {
                    l_scene_data_active = msg.data.info.scene[i];
                  }
                }
                req_data = {
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1, info: {
                    select: data.data.info.select,
                    scene: [{ name: "auto", flag: 0 },
                    {
                      name: "out",
                      flag: l_scene_data_out.flag,
                      dev: l_scene_data_out.dev
                    },
                    {
                      name: "in",
                      flag: l_scene_data_active.flag,
                      dev: l_scene_data_active.dev
                    }]
                  },
                  func: function (msg) {
                    //                    _this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
                  }
                }

                if (repeat_page == 1) { //解决点击应用，开关值显示开，请求参数没改bug，最后开关还是关
                  if (g_accessory_sn) {
                    for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                      if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                        // req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
                        // req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video 
                        req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x4; //on voice
                        req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x4; //on voice        
                      }
                    }
                  } else {
                    // req_data.info.scene[2].flag=0;
                    // req_data.info.scene[1].flag=1;
                    req_data.info.scene[2].flag = 0;
                    req_data.info.scene[1].flag = 1;
                  }
                }

              }
            }//get_scene_ack

            // $("#buffer_page").show();
            // 展示遮罩层
            _this.publicFunc.showBufferPage()
            _this.$api.set.scene_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              get_scene_ack(res)
            })
            let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");

            if (g_total_data != "") {
              schedule_get(g_total_data);
            } else {
              _this.$api.set.schedule_get({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                schedule_get_ack(res)
              })
            }

            function schedule_get (g_data) {
              if (day_list.length != 0) {
                for (let i = 0; i < day_list.length; i++) {
                  let classname = '';
                  if (i == day_list.length - 1) {
                    classname = 'time_menu_list_last';
                  } else {
                    classname = 'time_menu_list';
                  }
                  l_dom_set_out_time_box.innerHTML +=
                    "<div class='" + classname + " select_set_time_btn' index='" + i + "' time='" + day_list[i].start + "_" + day_list[i].end + "_" + day_list[i].week + "'>"
                    + "<div class='time_list_name'>"
                    + "<div class='time_list_name_title record_padding'>" + day_list[i].start + ":00 - " + day_list[i].end + ":00</div>"
                    + "<div class='time_list_name_tips'>" + day_list[i].week + "</div>"
                    + "</div>"
                    + "<div class='list_info'>"
                    + "<div class='right_arrow'></div>"
                    + "</div>"
                    + "</div>";
                }
                let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.select_set_time_btn');
                for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                  l_dom_selsect_set_time_btn[n].onclick = function () {
                    _this.g_is_add = "false";
                    let time = this.getAttribute('time');
                    index = this.getAttribute('index');
                    let arr = "";
                    if (time.split("_")[2].indexOf(mcs_Sunday_and) != -1) {
                      arr += "0."
                    }
                    if (time.split("_")[2].indexOf(mcs_Monday_and) != -1) {
                      arr += "1."
                    }
                    if (time.split("_")[2].indexOf(mcs_Tuesday_and) != -1) {
                      arr += "2."
                    }
                    if (time.split("_")[2].indexOf(mcs_Wednesday_and) != -1) {
                      arr += "3."
                    }
                    if (time.split("_")[2].indexOf(mcs_Thursday_and) != -1) {
                      arr += "4."
                    }
                    if (time.split("_")[2].indexOf(mcs_Friday_and) != -1) {
                      arr += "5."
                    }
                    if (time.split("_")[2].indexOf(mcs_Saturday_and) != -1) {
                      arr += "6."
                    }
                    arr = arr.substring(0, arr.length - 1);
                    _this.g_set_out_time = day_list[index].start + "_" + day_list[index].end + "_" + arr;
                    set_time();
                  }
                }
              }
            }//schedule_get

            function schedule_time_format (arr) {
              let start_time = [], end_time = [];
              for (let j = 0; j < arr.length; j++) {
                let num = -1;
                start_time[j] = [];
                end_time[j] = [];
                for (let i = -1; i < arr[j].length;) {
                  if (arr[j].indexOf(0, i) == i && i != -1) {
                    i++;
                    end_time[j][num]++;
                  } else if (arr[j].indexOf(0, i) < 0 && i > 0) {
                    i = arr[j].length;
                  } else if (arr[j].indexOf(0, i) < 0 && i <= 0) {
                    i = arr[j].length;
                    start_time[j][0] = 0;
                    end_time[j][0] = 0;
                  } else {
                    num++;
                    start_time[j][num] = arr[j].indexOf(0, i)
                    end_time[j][num] = arr[j].indexOf(0, i)
                    i = arr[j].indexOf(0, i);
                  }
                }
              }
              let length;
              for (let time_i = 0; time_i < 7; time_i++) {
                for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
                  if (end_time[time_i][time_j]) {
                    length = time_format.length;
                    if (length > 0) {
                      let is_exist = 0;
                      for (let time_format_i = 0; time_format_i < length; time_format_i++) {
                        if (start_time[time_i][time_j] == time_format[time_format_i].start_time && end_time[time_i][time_j] == time_format[time_format_i].end_time) {
                          time_format[time_format_i].week.push(time_i);
                          is_exist = 1;
                        }
                      }
                      if (is_exist == 0) {
                        time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                      }
                    } else {
                      time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                    }
                  }
                }
              }
              // l_dom_set_out_time_box.innerHTML = "<div id='set_time_box'></div>"
              for (let k = 0; k < time_format.length; k++) {
                let week = "";
                let week_num = '';
                for (let m = 0; m < time_format[k].week.length; m++) {
                  if (time_format[k].week[m] == 0) {
                    week += mcs_Sunday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 1) {
                    week += mcs_Monday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 2) {
                    week += mcs_Tuesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 3) {
                    week += mcs_Wednesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 4) {
                    week += mcs_Thursday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 5) {
                    week += mcs_Friday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 6) {
                    week += mcs_Saturday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  }
                }
                week = week.substring(0, week.length - 1)
                week_num = week_num.substring(0, week_num.length - 1)

                let classname = '';
                // if (k == time_format.length - 1) {
                //   classname = 'time_menu_list_last';
                // } else {
                //   classname = 'time_menu_list';
                // }
                l_dom_set_out_time_box.innerHTML +=
                  "<div class='" + classname + " selsect_set_time_btn' index='" + k + "' time='" + time_format[k].start_time + "_" + time_format[k].end_time + "_" + week_num + "'>"
                  + "<div class='time_list_name'>"
                  + "<div class='time_list_name_title record_padding'>" + time_format[k].start_time + ":00 - " + time_format[k].end_time + ":00</div>"
                  + "<div class='time_list_name_tips'>" + week + "</div>"
                  + "</div>"
                  + "<div class='list_info'>"
                  + "<div class='right_arrow'></div>"
                  + "</div>"
                  + "</div>";
                day_list.push({ start: time_format[k].start_time, end: time_format[k].end_time, week: week });
              }
              let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.selsect_set_time_btn');
              for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                l_dom_selsect_set_time_btn[n].onclick = function () {
                  _this.g_is_add = "false";
                  let time = this.getAttribute('time');
                  index = this.getAttribute('index');
                  _this.g_set_out_time = time;
                  set_time();
                }
              }
            }//schedule_time_format

            _this.publicFunc.mx("#submit_apply").onclick = function () {
              _this.record_flag_out = "false";
              _this.g_show = 'false';
              // console.log(g_total_data, "报警g_total_data")
              _this.$api.set.schedule_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                sch: {
                  degree: 3600,
                  schedule: g_total_data
                }
              }).then(res => {
                if (res && res.result === "") {
                  _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                } else if (res.result === "permission.denied") {
                  _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                }
              })
              req_data.info.scene[2].flag = 0;
              req_data.info.scene[2].dev[0].flag = 0;
              _this.$api.set.scene_set(req_data)
            }

            function compile_week () {
              let week_select = _this.g_select_week.slice();
              $("add_device_page").show();
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Sunday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Monday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Tuesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Wednesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Thursday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Friday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Saturday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "</div>"

                + "</div>"

              let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");
              let l_dom_set_week_list = _this.publicFunc.mx(".set_week");
              for (let i = 0; i < l_dom_set_week_list.length; i++) {
                l_dom_set_week_list[i].index = i;
                l_dom_set_week_list[i].onclick = function () {
                  if ($(this).find(".list_info_select").hasClass("list_info_select_img")) {
                    week_select[this.index] = 1;
                    $(this).find(".list_info_select").removeClass('list_info_select_img').addClass('list_info_clickselect_img')

                  } else {
                    week_select[this.index] = 0;
                    $(this).find(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img')
                  }
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i] == 1) {
                      g_week_w = "[" + week_select.join() + "]";
                      return;
                    }
                  }
                  _this.native_can_back= false;
                }

              }

              for (i = 0; i < week_select.length; i++) {
                if (week_select[i]) {
                  l_dom_set_week_list[i].click();
                }

              }


              l_dom_record_back_box.onclick = function () {
                if (week_select.indexOf(1) == -1) {
                  $(".time_select_tips").show();
                  setTimeout("$('.time_select_tips').hide();", 3000)
                } else {
                  set_time();
                }
              }
            }//compile_week

            function set_time () {
              _this.native_can_back= true;
              g_aa_data = g_total_data;
              let flag = true;
              let repeat = false;
              let start_time = '00';
              let end_time = '24';
              let old_start_time = '00';
              let old_end_time = "00";
              let old_week = "";
              let week = '';
              let week_new = []; //保存选中哪些日期值
              if (g_set_old_out_time == "" && _this.g_is_add == "false") {
                g_set_old_out_time = _this.g_set_out_time;
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (g_set_old_out_time != "" && _this.g_is_add == "false") {
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (_this.g_set_out_time) {
                let set_time_out_data = _this.g_set_out_time.split("_");
                start_time = set_time_out_data[0] >= 10 ? set_time_out_data[0] : "0" + set_time_out_data[0];
                end_time = set_time_out_data[1] >= 10 ? set_time_out_data[1] : "0" + set_time_out_data[1];
                week = set_time_out_data[2] ? set_time_out_data[2].split(".") : [];
              }
              //add default time

              if (_this.g_is_add == "true") {
                week = [0, 1, 2, 3, 4, 5, 6]
              }

              let temp = eval(g_week_w);
              if (temp.length == 7) {
                let j = 0;
                for (i = 0; i < temp.length; i++) {
                  if (temp[i]) {
                    week_new[j] = i;
                    j++;
                  }
                }
              }
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div><div id='delete_set_record'>" + mcs_delete + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_time_list set_starttime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
                + "</div>"

                + "<div style='height:2rem;background:#EFEFF4'></div>"
                + "<div class='set_time_list set_endtime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
                + "</div>"
                + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
                + "</div>"
                + "<div class='select_week_box' id='click_arrow' style='overflow:hidden;width:660px;margin-top:30px;'>"
                + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
                + "<div class='week_Box' style='float:right;width:400px;'>"
                + "<div class='week_list' id='week0'>" + mcs_Sunday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week1'>" + mcs_Monday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week2'>" + mcs_Tuesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week3'>" + mcs_Wednesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week4'>" + mcs_Thursday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week5'>" + mcs_Friday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week6'>" + mcs_Saturday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "</div>"
              //        +"<div id='set_time_submit_btn' class='set_submit_btn'>"+mcs_ok+"</div>"
              //        +"<div id='set_time_del_btn' class='set_del_btn'>"+mcs_delete+"</div>";

              _this.publicFunc.mx("#click_arrow").onclick = function () {
                if (temp.length != 0) {
                  _this.g_select_week = week_select;
                } else {
                  _this.g_select_week = old_week_select;
                }
                let time = parseInt(_this.publicFunc.mx("#start_time").innerHTML) + "_" + parseInt(_this.publicFunc.mx("#end_time").innerHTML) + "_";
                for (let i = 0; i < _this.g_select_week.length; i++) {
                  if (_this.g_select_week[i] == 1) {
                    time += i + "."
                  }
                }
                time.substring(0, time.length - 1)
                _this.g_set_out_time = time;
                compile_week();
              }

              let week_select = [0, 0, 0, 0, 0, 0, 0];
              let old_week_select = [0, 0, 0, 0, 0, 0, 0];

              if (temp.length !== 0) {
                week_select = temp;
              }

              function stringToHex (data) {
                let val = "", arr = [], arr0 = [];
                for (let i = 0; i < data.length; i++) {
                  val = parseInt(data[i], 2).toString(16);
                  arr[i] = val;
                }
                for (let j = 0; j < data.length; j++) {
                  arr0[j] = 0xff & ("0x" + arr[j]);
                }
                return arr0;
              }

              function set_time_event () {
                $("#start_time").date({ theme: "datetime", h: start_time });
                $("#end_time").date({ theme: "datetime", h: end_time });
                $("#start_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })

                $("#end_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })
                let l_dom_week_list = _this.publicFunc.mx(".week_list");
                for (let i = 0; i < l_dom_week_list.length; i++) {
                  let is_has = $(this).hasClass("week_list_active");
                  l_dom_week_list[i].index = i;
                  for (let h = 0; h < week_new.length; h++) {
                    if (i == week_new[h]) {
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (h == week_new.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }
                  for (let j = 0; j < week.length; j++) {
                    if (week_new.length !== 0) {
                      continue;
                    }
                    if (i == week[j]) {
                      //  l_dom_week_list[i].click();
                      old_week_select[i] = 1;
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (j == week.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }
                }
                if (temp.length != 0) {
                  let y = temp;
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                      }
                      week_select[i] = y[i];
                    }
                  }
                } else {
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                        week_select[i] = 1;
                      }
                    }
                  }
                }
                function set_time_func (type) {
                  repeat = false;
                  let index = -1;
                  let time_select = [];
                  let start_time = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                  let end_time = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                  let new_time_select = [];
                  if (start_time >= end_time) {
                    repeat = true;
                    flag = false;
                    _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
                    return;
                  }
                  flag = true;
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i]) {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        if (j >= start_time && j < end_time) {
                          tmp_data += "0"
                        } else {
                          tmp_data += "1"
                        }
                        time_select[index] = tmp_data.split("").reverse().join("");
                      }
                    } else {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        tmp_data += "1"
                        time_select[index] = tmp_data;
                      }
                    }
                  }
                  function get_select_time (g_total_data) {
                    if (g_total_data != "") {
                      let l_data_2 = mcodec.b64_2_binary(g_total_data, 1), str = "", arr = [], arr2 = [], arr_tmp = [];
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
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < old_week.length; i++) {
                            let arr_all = "";
                            let arr_all_arr = [];
                            let arr1 = "", arr2 = "", arr3 = "";
                            for (let j = 0; j < 3; j++) {
                              arr_all += arr[old_week[i] * 3 + j].split("").reverse().join("");
                            }
                            arr_all_arr = arr_all.split("");
                            for (let m = parseInt(old_start_time); m < parseInt(old_end_time); m++) {
                              arr_all_arr[m] = "1";
                            }
                            for (let k = 0; k <= 7; k++) {
                              arr1 += arr_all_arr[k];
                            }
                            for (k = 8; k <= 15; k++) {
                              arr2 += arr_all_arr[k]
                            }
                            for (k = 16; k <= 23; k++) {
                              arr3 += arr_all_arr[k]
                            }
                            arr[old_week[i] * 3] = arr1.split("").reverse().join("");
                            arr[old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
                            arr[old_week[i] * 3 + 2] = arr3.split("").reverse().join("");

                          }
                        }
                        let select = [];
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < week_select.length; i++) {
                            if (week_select[i] == 1) {
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;

                      }
                    }
                  }//get_select_time
                  get_select_time(g_total_data)
                }
                let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");

                l_dom_record_back_box.onclick = function () {
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  set_time_func("submit");
                  if (!flag) {
                    return;
                  }
                  if (_this.g_is_add == "false") {
                    day_list[index].start = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                    day_list[index].end = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                    day_list[index].week = arr;
                  } else {
                    day_list.push({ start: parseInt(_this.publicFunc.mx("#start_time").innerHTML), end: parseInt(_this.publicFunc.mx("#end_time").innerHTML), week: arr })
                  }
                  if (!repeat) {
                    g_set_old_out_time = "";
                    _this.g_set_out_time = "";
                    g_week_w = [];
                    g_total_data = g_aa_data;
                    create_set_alarm_page(1);
                  }
                }
                // 报警时间设置页面删除按钮事件
                _this.publicFunc.mx("#delete_set_record").onclick = function () {
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  if (_this.g_is_add == "false") {
                    day_list.splice(index, 1);
                  } else {
                    create_set_alarm_page();
                    return;
                  }
                  set_time_func("del");
                  if (!repeat) {
                    g_set_old_out_time = "";
                    g_total_data = g_aa_data;
                    create_set_alarm_page();
                  }
                }
              }
              set_time_event();
            }
          }

          // $("#buffer_page").show();
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          //console.log("get_dev_info_this")
          _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            face_detect = res.face_detect;
            sound_detect = res.sound_detect;
            _this.$api.set.scene_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              record_get_ack(res)
            })
          })

          break;
        }
        case "motion_detect": { //将移动侦测从外设中取出
          let l_conf;
          info.dom.innerHTML =
            "<div class='list_right_box'>"
            + "<div class='option_scene_list option_scene_list_btn' attachmen_class='scene_list_motion'>"
            + "<div class='scene_list_img scene_list_motion'></div>"
            + "<div class='option_scene_list_right'>"
            + "<div class='option_scene_list_text'>"
            + "<div class='option_scene_list_text_left'>" + mcs_motion_detection + "</div>"
            + "<div class='option_scene_list_text_right'>motion</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>";
          //console.log("get_dev_info_this")
          _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            _this.g_motion_track = res.motion_track;
          })
          let l_dom_option_scene_list = _this.publicFunc.mx(".option_scene_list");
          l_dom_option_scene_list[0].onclick = function () {
            create_move_page();
          }
          function create_move_page () {
            if (window.fujikam !== "fujikam") {
              let add_device_page_height;
              if (document.getElementById("create_setting_page_left")) {
                add_device_page_height = document.getElementById("create_setting_page_left").offsetHeight + 120;
              } else {
                add_device_page_height = document.getElementById("page").offsetHeight + 100;
              }
              $("#add_device_page").css('height', add_device_page_height);
            }
            $("#add_device_page").show();
            // let l_dom_attachmen_box_close;
            let motion_track = _this.g_motion_track;
            let motion_track_switch;
            let dev_video_set_page =
              "<div class='menu_switch' id='mobile_tracking_switch_box' style='height: 4.4rem; width: 100%;background-color: #fff;margin-top: 30px'>"
              + "<div class='list_name' id='menu_name_switch' style='color:#333;float: left;height: 4.4rem;line-height: 4.4rem;'>" + mcs_mobile_tracking + "</div>"
              + "<div class='list_info'><input id='mobile_tracking_switch' type='checkbox'></div>"
              + "</div>"//智能追踪   
              + "<div class='attachmen_set_list_title'>" + mcs_motion_detection_sensitivity + "</div>"
              + "<div id='attachmen_door_day'>"
              + "<div id='attachmen_day_img'></div>"
              + "<div id='attachmen_day_text'>" + mcs_daytime + "</div>"
              + "<div class='options_float_right' style='width:500px;'>"
              + "<label for='input_threshold'></label>"
              + "<input name='slider' type='text' id='input_threshold' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'></input>"
              + "</div>"
              + "</div>"
              + "<div id='attachmen_door_night'>"
              + "<div id='attachmen_night_img'></div>"
              + "<div id='attachmen_night_text'>" + mcs_night + "</div>"
              + "<div class='options_float_right' style='width:500px;'>"
              + "<label for='input_thresholdLevelNight'></label>"
              + "<input name='slider' type='text' id='input_thresholdLevelNight' class='fd_tween fd_classname_extraclass fd_hide_input fd_slider_cb_create_ms.TT-init fd_slider_cb_update_ms.TT-update fd_slider_cb_move_ms.TT-update' value='0%'></input>"
              + "</div>"
              + "</div>"

            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"
              + "<div id='attachmen_box_main'>"
              + "<div id='attachmen_info'>"
              + "<div id='attachmen_info_img' class='attachmen_info_img_move'></div>"
              + "<div id='attachmen_info_text'>"
              + "<div id='attachmen_info_list'>"
              + "<div id='attachmen_info_type'>" + mcs_motion_detection + "</div>"
              + "</div>"
              + "<div id='attachmen_info_sn'>ID:" + _this.$store.state.jumpPageData.selectDeviceIpc + "</div>"
              + "</div>"
              + "<div class='attachmen_set_list'>" + dev_video_set_page + "</div>"
              + "<div id='attachmen_btn_box'>"
              + "<div id='attachmen_btn_submit'>" + mcs_apply + "</div>"
              // +"<div id='attachmen_btn_del'>"+mcs_delete+"</div>"
              + "</div>"
              + "</div>"
              + "</div>"
              + "<div id='attachmen_del_box'>"
              + "<div id='attachmen_del_box_text'>" + mcs_are_you_sure_delete + "</div>"
              + "<div id='attachmen_del_box_ok'>" + mcs_ok + "</div>"
              + "<div id='attachmen_del_box_cancel'>" + mcs_cancel + "</div>"
              + "</div>"
              + "</div>";
            let l_dom_menu_swicth = _this.publicFunc.mx("#mobile_tracking_switch_box");
            // let l_dom_face_detection_switch_box  =_this.publicFunc.mx("#face_detection_switch_box"); 
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            // let l_dom_attachmen_event_ico = _this.publicFunc.mx(".attachmen_event_ico");
            let l_dom_input_threshold = _this.publicFunc.mx("#input_threshold");
            // let l_dom_input_sound_threshold =_this.publicFunc.mx("#input_sound_threshold");
            let l_dom_attachmen_btn_submit = _this.publicFunc.mx("#attachmen_btn_submit");
            let l_dom_input_thresholdLevelNight = _this.publicFunc.mx("#input_thresholdLevelNight");
            let l_dom_attachmen_video_time_input = _this.publicFunc.mx("#attachmen_video_time_input");
            // let l_dom_attachmen_btn_del = _this.publicFunc.mx("#attachmen_btn_del");
            let l_dom_attachmen_del_box_ok = _this.publicFunc.mx("#attachmen_del_box_ok");
            let l_dom_attachmen_del_box_cancel = _this.publicFunc.mx("#attachmen_del_box_cancel");
            let l_dom_attachmen_del_box = _this.publicFunc.mx("#attachmen_del_box");
            let l_dom_mobile_tracking_switch = _this.publicFunc.mx("#mobile_tracking_switch");
            $(l_dom_mobile_tracking_switch).iButton({
              labelOn: "On",
              labelOff: "Off",
              change: function () {
                if (l_dom_mobile_tracking_switch.checked) {
                  motion_track_switch = 1;
                } else {
                  motion_track_switch = 0;
                }
              }
            });
            if (motion_track != 1) {
              if (l_dom_menu_swicth) {
                l_dom_menu_swicth.style.display = 'none'
              }
            }

            l_dom_attachmen_box_close.onclick = function () {
              $("#add_device_page").hide();
            }

            l_dom_attachmen_btn_submit.onclick = function () {
              let conf = l_conf;
              conf.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
              conf.io_input = "Open";
              conf.io_output = "Open";
              conf.sensitivity = l_dom_input_threshold.value;
              conf.night_sensitivity = l_dom_input_thresholdLevelNight.value;
              conf.motion_track_switch = motion_track_switch;
              _this.$api.set.alarm_device_set(conf).then(res =>{
                _this.set_result(res)
              })
            }
            //console.log(fdSliderController, 'fdSliderController')
            fdSliderController.create();

            function alarm_get_ack (msg) {
              l_conf = msg;
              if (msg && msg.result == "") {
                if (l_dom_input_thresholdLevelNight)
                  fdSliderController.increment("input_thresholdLevelNight", msg.night_sensitivity - l_dom_input_thresholdLevelNight.value);
                if (l_dom_input_threshold)
                  fdSliderController.increment("input_threshold", msg.sensitivity - l_dom_input_threshold.value);
                // if(l_dom_input_sound_threshold)
                //   fdSliderController.increment("input_sound_threshold", msg.audio_level - l_dom_input_sound_threshold.value);
                if (msg.motion_track_switch == 1) {
                  $(l_dom_mobile_tracking_switch).iButton("toggle", true);
                } else {
                  $(l_dom_mobile_tracking_switch).iButton("toggle", false);
                }

              }
            }
            _this.$api.set.alarm_device_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, flag: 1 }).then(res => {
              alarm_get_ack(res)
            })
          }
          break;
        }
        case "record_new": { // 联动接口录像
          info.dom.innerHTML = "<div id='set_main_page' class='record_page'>"
            + "<div style='height:2rem;margin-top:1rem'>" + mcs_continuous_recording + "</div>"
            + "<div class='menu_list2_box' id='record_plan' style='overflow:hidden'>"
            + "<div class='menu_record flag_click_event'><div class='list_name'>"
            + "<div class='list_name_title'>" + mcs_continuous_recording + "</div>"
            + "<div class='list_name_tips' id='is_show'></div>"
            + "</div><div class='list_info'>"
            + "<div class='right_arrow'></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'>" + mcs_Event_record + "</div>"
            + "<div class='menu_list2_box' id='record_event'></div>"

            + "<div id='sd_mode'>"
            + "<div class='sd_display'>"
            + "<div class='menu_list_box_title2 menu_list_mode'>" + mcs_mode + "</div>"
            + "<div class='menu_list_box'>"
            + "<div class='menu_list menu_list_children_mode' style=''><div class='sd_mode_text'>" + mcs_normal_mode + "</div><div class='list_info'><div type='0' class='list_info_select list_info_select_img'></div></div></div>"
            + "<div id='no' class='record_sd_calculate'></div>"
            + "<div class='menu_list menu_list_children_mode' style=''><div class='sd_mode_text'>" + mcs_long_video_mode + "</div><div class='list_info'><div type='50' class='list_info_select list_info_select_img'></div></div></div>"
            + "<div id='lo' class='record_sd_calculate'></div>"
            + "<div class='menu_list menu_list_children_mode' style=''><div class='sd_mode_text'>" + mcs_super_long_video_mode + "</div><div class='list_info'><div type='100' class='list_info_select list_info_select_img'></div></div></div>"
            + "<div id='su' class='record_sd_calculate'></div>"
            + "</div>"
            + "<div id='sd_mode_btn' class='list_right_button'>" + mcs_apply + "</div>"
            + "</div>"
            + "</div>"

            + "</div>";

          let l_dom_record_event = _this.publicFunc.mx("#record_event");
          let data;
          let l_scene_data_out, l_scene_data_active;
          let l_select_scene_name;
          let face_detect = ''
          let sound_detect = "";
          let human_detect = ''
          let g_accessory_sn = "";
          let g_accessory_type = "";
          _this.g_show = "false";
          let time_format = [];

          let day_list = [];
          let g_total_type = "";
          let g_aa_data = "";
          let g_set_old_out_time = "";
          let index = -1;
          let g_week_w = [];
          let g_total_data = "";
          let set_record_alarm_title, set_record_alarm_content;
          // 添加联动模块后添加的变量
          let record_plan_continue = {}
          let record_all_dev = [] //有效附件名
          let plan_tmp = []       //计划表中间参数
          let new_record_final_all_dev = [] //设备所具有的附件外加计划表和开关状态等
          let all_dev_name = [
            mcs_continuous_recording, //type=0  //持续录像
            mcs_motion_detection,  //type=1
            mcs_Infrared_detector, //type=2
            "",                    //type=3
            mcs_smoke_detector,    //type=4
            mcs_sos,               //type=5
            mcs_magnetic,          //type=6
            "",                    //type=7
            mcs_face_detection,    //type=8
            mcs_sound_detection,   //type=9
            mrs_human_detection    //type=10      此部分表示联动框架对应type的附件名
          ]
          let g_js_param = {}
          let g_set_record_alarm = "record"

          function record_new_set_time (index, arr) {
            _this.g_hide = g_js_param.hide_nav;
            // console.log("进入新时间设置", g_js_param)
            // call_native("send_title", "&title=" + mcs_Setting_time, "");
            let start_time = ""
            let end_time = ""
            let week_str = ""
            if (arr) {
              start_time = arr.start_time
              end_time = arr.end_time
            }
            else {
              if (index == "add") {
                start_time = "00"
                end_time = "24"
              }
              else {
                start_time = g_total_data[index].start.split(":")[0]
                end_time = g_total_data[index].end.split(":")[0]
              }
            }

            week_str = _this.alarm_timeArr_to_word(_this.g_select_week)
            // console.log(week_str, "星期字符串")
            _this.publicFunc.mx("#add_device_page").innerHTML =

              "<div id='attachmen_box'>"
              + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
              + "<div id='set_time_main_page'>"
              + "<div class='set_time_list set_starttime_list'>"
              + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
              + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
              + "</div>"

              + "<div style='height:2rem;background:#EFEFF4'></div>"
              + "<div class='set_time_list set_endtime_list'>"
              + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
              + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
              + "</div>"
              + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
              + "</div>"
              + "<div class='select_week_box' id='alarm_day_select' style='overflow:hidden;width:660px;margin-top:30px;'>"
              + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
              + "<div class='week_Box' style='float:right;width:400px;'>"
              + "<div style='float: right;color: #323232;font-size: 1rem;margin-right:1rem'>" + week_str + "</div>"
              + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
              + "</div>"

              + "</div>"
              // 时间点选择确定取消按钮
              + "<div class='set_time_btn_line'>"
              + "<div id='set_time_confirm_btn' class='set_submit_btn'>" + mcs_ok + "</div>"
              + "<div id='set_time_delete_btn' class='set_del_btn'>" + mcs_delete + "</div>";
            + "</div>"

              + "</div>"
              + "</div>"
            // + "<div class='public-martop-5r'></div>"


            // "<div class='bg_color'></div>"
            // + "<div id='set_time_main_page'>"
            // + "<div class='set_time_list' >"
            // + "<div class='set_time_list_left'>" + mcs_begin_time + "</div>"
            // + "<div class='set_time_list_right' id='start_time'>" + start_time + ":00" + "</div>"
            // + "</div>"
            // + "<div class='bg_color'></div>"
            // + "<div class='set_time_list' >"
            // + "<div class='set_time_list_left'>" + mcs_end_time + "</div>"
            // + "<div class='set_time_list_right' id='end_time' >" + end_time + ":00" + "</div>"
            // + "</div>"
            // + "<div class='select_time_box' id='datePlugin'></div>"
            // + "<div class='public-distance'></div>"
            // + "<div class='alarm_day_select_box' id='alarm_day_select'>"
            // + "<div class='alarm_repeat_word'>" + mcs_repeat + "</div>"
            // + "<div class='alarm_day_str_box'>"
            // + "<div class='alarm_day_str'>" + week_str + "</div>"
            //  + "<img src='" + ASSETS_IMG + "arrow@3x.png' alt=''>"
            // + "</div>"
            // + "</div>"
            // + "</div>"
            // + "<div class='public-martop-5r'></div>"
            // + "<div id='set_time_confirm_btn' class='set_submit_btn'>" + mcs_ok + "</div>"
            // + "<div id='set_time_delete_btn' class='set_del_btn'>" + mcs_delete + "</div>";
            function set_time_event () {
              // console.log("进入set_time_event")
              $("#start_time").date({ theme: "datetime", h: start_time });
              $("#end_time").date({ theme: "datetime", h: end_time });
              $("#start_time").click(function () {
                $("#datePlugin").css("visibility", "visible");

              })

              $("#end_time").click(function () {
                $("#datePlugin").css("visibility", "visible");
              })
              if (_this.g_hide == 1) {
                $("#title_name").text(mcs_edit_time)
                _this.publicFunc.mx("#record_back_box").onclick = function () {
                  if (index != 'add') {
                    g_total_data[index].day = JSON.parse(g_js_param.set_plan.origin_day)
                  }
                  new_set_record_alarm();
                }
                _this.publicFunc.mx("#set_time_confirm_btn").onclick = function () {
                  let flag = ""
                  let start_time = parseInt($("#start_time").text().split(":")[0])
                  let start_str = $("#start_time").text()
                  let end_time = parseInt($("#end_time").text().split(":")[0])
                  let end_str = $("#end_time").text()
                  if (start_time >= end_time) {
                    _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000, web_tips: 1 })
                    return;
                  }
                  else {
                    if (index == "add") {
                      g_total_data.push({
                        start: start_str,
                        start_num: start_time,
                        end: end_str,
                        end_num: end_time,
                        day: _this.g_select_week
                      })
                    }
                    else {
                      g_total_data[index].day = _this.g_select_week
                      g_total_data[index].end = end_str
                      g_total_data[index].end_num = end_time
                      g_total_data[index].start = start_str
                      g_total_data[index].start_num = start_time
                    }
                  }
                  new_set_record_alarm();
                }

                _this.publicFunc.mx("#set_time_delete_btn").onclick = function () {
                  if (index != 'add') {
                    g_total_data.splice(index, 1)
                  }
                  new_set_record_alarm();
                }
              }
              $("#alarm_day_select").click(function () {
                let time_arr = {}
                time_arr.start_time = $("#start_time").text().split(":")[0]
                time_arr.end_time = $("#end_time").text().split(":")[0]
                if (parseInt(time_arr.start_time) >= parseInt(time_arr.end_time)) {
                  _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000, web_tips: 1 })
                  return;
                }
                else {
                  // console.log("是否调用了new_compile_week")
                  record_new_compile_week(index, time_arr)
                }

              })
            }
            set_time_event();
          }

          function record_new_compile_week (index, time_arr) {
            let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
              + "<div id='set_time_main_page'>"

              // + "<div class='alarm_time_select_tips'>" + mcs_select_time_week + "</div>"
              + "<div class='alarm_week_box' id ='alarm_week'></div>"

              + "</div>"
              + "</div>"
              + "</div>"

            if (_this.g_hide == 1) {
              _this.publicFunc.mx("#record_back_box").onclick = function () {
                if (_this.g_select_week.indexOf(1) == -1) {
                  _this.publicFunc.msg_tips({ msg: mcs_select_time_week, type: 'error', timeout: 3000 });
                } else {
                  record_new_set_time(index, time_arr);
                }
              }
            }
            for (let i = 0; i < _this.g_select_week.length; i++) {
              _this.publicFunc.mx("#alarm_week").innerHTML +=
                "<div class='set_week' flag = '" + _this.g_select_week[i] + "'>"
                + "<div class='week_every'>" + week_standard[i] + "</div>"
                + "<div class='week_every_imgbox'><div id='select_flag_" + i + "' class='list_info_select'></div></div>"
                + "</div>"

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
                }
                else {
                  _this.g_select_week[index] = 1
                  $(this).attr("flag", 1)
                  $("#select_flag_" + index).removeClass("list_info_select_img")
                  $("#select_flag_" + index).addClass("list_info_clickselect_img")
                }
              })

            })
          }

          function record_sd_get_ack (msg) {
            // console.log(msg, "enter sd_get_ack")
            // console.log("查看record_plan_continue", record_plan_continue)
            let length = _this.publicFunc.mx(".list_info_select").length;
            let record_mode
            for (let i = 0; i < length; i++) {
              _this.publicFunc.mx(".list_info_select")[i].onclick = function () {
                record_mode = this.getAttribute("type");
                $(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img');
                $(this).removeClass('list_info_select_img').addClass('list_info_clickselect_img');
                console.log(record_mode, 'click record_mode')
              }
            }
            if (msg && msg.result == "") {
              _this.publicFunc.closeBufferPage()
              if (msg.conf) {
                record_mode = msg.conf.record_mode;
                if (msg.conf.record_mode == 0) {
                  _this.publicFunc.mx(".list_info_select_img")[0].click();
                } else if (msg.conf.record_mode == 50) {
                  _this.publicFunc.mx(".list_info_select_img")[1].click();
                } else if (msg.conf.record_mode == 100) {
                  _this.publicFunc.mx(".list_info_select_img")[2].click();
                }
              }
              $(".sd_mode").show();
              //record memory hint
              String.prototype.format = function () {
                if (arguments.length == 0) return this;
                let obj = arguments[0];
                let s = this;
                for (let key in obj) {
                  s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
                }
                return s;
              }
              let sd = msg.capacity / 1000;
              let temp = 2;
              for (let i = 0; i < 15; i++) {
                if (sd < temp) {
                  sd = temp;
                  break;
                }
                temp = temp << 1;

              }
              let data_normal = {
                size: sd + "G",
                days: Math.round(msg.capacity / 1000 / 8)
              }
              let data_long_video = {
                size: sd + "G",
                days: Math.round(msg.capacity / 1000 / 3)
              }
              let data_super_video = {
                size: sd + "G",
                days: Math.round(msg.capacity / 1000 / 2)
              }
              let normal_hint = mcs_normal_mode_hint.format(data_normal);
              let long_video_hint = mcs_long_video_mode_hint.format(data_long_video);
              let super_video_hint = mcs_super_long_video_mode_hint.format(data_super_video);
              $("#no").html(normal_hint)
              $("#lo").html(long_video_hint)
              $("#su").html(super_video_hint)

              if (msg.status != "mount") {
                $("#sd_card").hide();
                $("#submit_apply").hide();
              }
              if (msg.status == "empty") {
                $("#new_record_continue").text(mcs_close)
                record_plan_continue.alarm_status = "off"
                record_plan_continue.sd_flag = 'none'
              }
              // 有存储卡的情况下允许调用录像模式
              mode_sd_get_ack_event()
            } else {
              // 关闭遮罩层以及录像模式选择
              _this.publicFunc.closeBufferPage()
              $(".sd_mode").hide();
              _this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
            }
            // 移植部分 可能没有作用暂做保留
            let new_record_open_dev = new_record_final_all_dev.filter(function (item) {
              return item.alarm_status == 'on'
            })
            if (new_record_open_dev.length == 0 && record_plan_continue.alarm_status == 'off') {
              $('.new_record_list').css('color', '#999')
            } else {
              $('.new_record_list').css('color', '#323232')
            }
            // _this.publicFunc.mx("#sd_mode_btn").onclick = function () {
            //   console.log(record_mode, 'record_mode')
            //   _this.$api.set.sd_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "", record_mode: record_mode, flag: 1 }).then(res => {
            //     _this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
            //   })
            // }
          }

          // ccm_dev_action_get获取动作开关接口回调
          function c_record_switch_get (msg) {
            // console.log("enter c_record_switch_get")
            if (msg && msg.result == "") {
              // console.log(msg, "ccm_dev_action_get_ack接口返回参数")
              data = msg;
              if (msg.data.info.enable == 0) {
                $("#is_show").text(mcs_turn_off)
                record_plan_continue.alarm_status = "off"
              } else {
                // console.log(record_plan_continue.alarm_status, "查看record_plan_continue参数内容")
                //这种情况是当持续录像的总开关是开但计划表为空，开关状态照样为关
                if (record_plan_continue.alarm_status == "off") {
                  $("#is_show").text(mcs_turn_off)
                } else {
                  $("#is_show").text(mcs_turn_on)
                  record_plan_continue.alarm_status = "on"
                }
              }
              _this.$api.set.sd_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                record_sd_get_ack(res)
              })
            }
            else {
              _this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
              _this.publicFunc.closeBufferPage()
            }
          }

          // ccm_plan_record_get获取持续计划表接口回调
          function plan_record_get_ack (msg) {
            // console.log(msg, "plan_record_get_ack_msg")
            if (msg.result == "") {
              record_plan_continue.id = "c_record"
              record_plan_continue.nick = "c_record"
              record_plan_continue.type = 0
              record_plan_continue.origin_plan = msg.data.sche.plan || []   //原有的计划表
              if (msg.data.sche.plan) {
                let record_select = msg.data.sche.plan.filter(function (item) {
                  return item.index == 0;
                })
                record_plan_continue.sche_form = _this.sche_format(msg.data.sche.plan)
                if (record_select.length > 0) {
                  record_plan_continue.alarm_status = "on"
                  record_select = _this.time_deal(record_select)
                  record_select.forEach(function (item, index) {
                    let day_arr = item.day.split("、")
                    item.day = _this.change_day_to_arr(day_arr)
                  })
                  record_plan_continue.plan = record_select
                } else {
                  record_plan_continue.alarm_status = "off"
                  record_plan_continue.plan = []
                  record_plan_continue.sche_form = _this.sche_format(record_plan_continue.plan)
                }
              } else {
                record_plan_continue.alarm_status = "off"
                record_plan_continue.plan = []
                record_plan_continue.sche_form = _this.sche_format(record_plan_continue.plan)

              }
              record_plan_continue.action_name_list = [{ name: 'record', times: 0, control_time: 8000, continue_time: 16000 }]
            }
            else {
              _this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
              _this.publicFunc.closeBufferPage()
              return;
            }
            console.log(record_plan_continue, "获取持续计划表后record_plan_continue内容")
            _this.$api.set.dev_action_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              action_name: "oflag"
            }).then(res => {
              c_record_switch_get(res)
            })
          }

          // 手机端复制过来的弹窗代码
          function new_set_record_alarm () {
            // console.log(g_js_param)
            let all_dev_name = [
              mcs_continuous_recording, //type=0  //持续录像
              mcs_motion_detection,  //type=1
              mcs_Infrared_detector, //type=2
              "",                    //type=3
              mcs_smoke_detector,    //type=4
              mcs_sos,               //type=5
              mcs_magnetic,          //type=6
              "",                    //type=7
              mcs_face_detection,    //type=8
              mcs_sound_detection,   //type=9
              mrs_human_detection    //type=10      此部分表示联动框架对应type的附件名
            ]
            let all_dev_alarm_content = [
              mcs_continuous_recording_hint,  //type=0   //持续录像内容
              mcs_move_alarm_new_detail,      //type=1
              mcs_continuous_recording_hint,  //type=2
              mcs_continuous_recording_hint,  //type=3
              mcs_continuous_recording_hint,  //type=4
              mrs_sos_alarm_detail,           //type=5
              mrs_send_alarm_notification,    //type=6
              mcs_continuous_recording_hint,  //type=7
              mcs_move_alarm_detail,         //type=8
              mrs_open_switch_check_abnormal_noise_alarm,         //type=9
              mcs_move_alarm_detail          //type=10  此部分表示报警描述
            ]
            let flag = ""  //表示附件的总和  （alarm:4,record:2,snapshot:1）
            let alarm_or_record_allow_tips = mcs_Allow_record_schedule
            let dev_name = g_js_param.set_plan.id  //附件名称 (motion、io、face_detect、and so on)
            let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
            let control_time = 8000, continue_time = 16000; //alarm:control_time:0,continue_time:0,times:1  record: control_time:8000,continue_time:16000,times:0
            let times = 0

            alarm_or_record_allow_tips = mcs_Allow_record_schedule
            all_dev_alarm_content[1] = mcs_move_record_new_detail
            all_dev_alarm_content[5] = mrs_sos_record_detail
            all_dev_alarm_content[6] = mrs_door_record_detail
            all_dev_alarm_content[9] = mrs_open_switch_check_abnormal_noise_record
            all_dev_alarm_content[8] = all_dev_alarm_content[10] = mcs_move_record_detail         //type=8

            $("#add_device_page").show();
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"

              + "<div class='set_main_page_alarm'>"
              + "<div class='menu_list_box'>"
              + "<div class='menu_list record_allow'>"
              + "<div class='list_name record_padding'>" + mcs_Allow_record + "</div>"
              + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_box_title2 record_background'>" + all_dev_alarm_content[g_js_param.set_plan.type] + "</div>"

              + "<div class='margin'>"
              + "<div class='set_alarm_time_word' style='display:none;'>" + alarm_or_record_allow_tips + "</div>"
              + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
              + "<div id='set_out_time_box'></div>"
              + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"

              + "</div>"
              + "</div>"

            // 弹窗点击关闭按钮执行代码
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            l_dom_attachmen_box_close.onclick = function () {
              _this.record_flag(time_format, day_list)
              if (_this.g_show == "true") {
                _this.publicFunc.delete_tips({
                  content: mcs_is_save_hint, func: function () {
                    $("#add_device_page").css('display', 'none');
                    _this.create_right_page({ type: 'record_new', dom: _this.publicFunc.mx("#create_setting_page_right") ? _this.publicFunc.mx("#create_setting_page_right") : _this.publicFunc.mx("#create_setting_page_new") })
                  }
                })
              } else {
                $("#add_device_page").css('display', 'none');
                _this.create_right_page({ type: 'record_new', dom: _this.publicFunc.mx("#create_setting_page_right") ? _this.publicFunc.mx("#create_setting_page_right") : _this.publicFunc.mx("#create_setting_page_new") });
              }
            } // 关闭弹窗代码结束

            function sche_set_ack (msg) {
              // console.log(msg)
              if (msg && msg.result == "") {
                $("#add_device_page").css('display', 'none');
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 });
                _this.create_right_page({ type: 'record_new', dom: _this.publicFunc.mx("#create_setting_page_right") ? _this.publicFunc.mx("#create_setting_page_right") : _this.publicFunc.mx("#create_setting_page_new") })
              }
              else if (msg.result == "permission.denied") {
                _this.publicFunc.closeBufferPage()
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000, web_tips: 1 })
              } else {
                _this.publicFunc.closeBufferPage()
                _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
              }
            }
            function alarm_set_plan_event () {
              $("#at_home_btn").click(function () {
                let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
                if (at_home_type === "true") {
                  $("#hide_timebox").show();
                  $(".set_alarm_time_word").show();
                } else {
                  $("#hide_timebox").hide();
                  $(".set_alarm_time_word").hide();
                }
              })
              $("#set_time_add").click(function () {
                let index = "add"
                _this.g_select_week = [1, 1, 1, 1, 1, 1, 1]
                record_new_set_time(index)
              })
              $("#submit_apply").click(function () {
                _this.publicFunc.showBufferPage()

                let sche = []
                // return;
                if ($("#at_home_btn").attr("type") == "false") {
                  console.log('submit enter this if false')
                  if (dev_name == 'c_record') {    //持续录像设置录像开关和 计划表
                    sche = { plan: [{ start: 0, end: 604800, flag: 0, index: 1, mode: "" }] }
                    let info = { name: "oflag", enable: 0, dev: [] }
                    let info_iflag = { name: "iflag", enable: 0, dev: [] }
                    _this.$api.set.dev_action_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      info: info_iflag
                    }).then(res => {
                      if (res.result === '') {
                        _this.$api.set.dev_action_set({
                          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                          info: info
                        }).then(res_second_action_set => {
                          if (res_second_action_set.result === '') {
                            _this.$api.set.plan_record_set({
                              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                              sche: sche
                            }).then(res_plan_record_set => {
                              sche_set_ack(res_plan_record_set)
                            })
                          } else {
                            _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                          }
                        })
                      } else {
                        _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                      }
                    })
                  } else {
                    let sche_form = g_js_param.set_plan.sche_form
                    let cut_flag = g_set_record_alarm == 'alarm' ? 4 : 2
                    let arr_flag_index = g_set_record_alarm == 'alarm' ? 1 : 2
                    // console.log(sche_form)
                    sche_form.forEach(function (item, index) {
                      let temp = item
                      for (let i = 0; i < temp.length; i++) {
                        (function (i) {
                          if (_this.change_string_to_four_bit_arr(temp[i])[arr_flag_index] == 1) {
                            temp[i] -= cut_flag
                          }
                        })(i)
                      }
                    })
                    // console.log(sche_form)
                    if (g_js_param.set_plan.id == 'motion') {
                      sche_form.forEach(function (item, index) {
                        for (let i = 0; i < item.length; i++) {
                          (function (i) {
                            item[i] += 8
                          })(i)
                        }
                      })
                    }
                    let plan_sel = _this.sche_trans_to_second_format(sche_form)
                    // console.log(plan_sel)
                    let plan = _this.sche_add_action_name(plan_sel, g_js_param.set_plan.type)
                    sche = { all: 0, dev_name: g_js_param.set_plan.id, plan: plan }
                    _this.$api.set.alarm_sche_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      exdev_id: g_js_param.set_plan.id,
                      sche: sche
                    }).then(res => {
                      sche_set_ack(res)
                    })
                  }
                } else {
                  console.log('submit enter this if', g_total_data)
                  let plan_temp = []
                  // let plan_flag = flag
                  for (let i = 0; i < g_total_data.length; i++) {
                    let plan_item = g_total_data[i]
                    for (let j = 0; j < 7; j++) {
                      if (plan_item.day[j] == 1) {
                        plan_temp.push({ day: j, start: plan_item.start_num, end: plan_item.end_num })

                      }
                    }
                  }
                  console.log(plan_temp, 'plan_temp')
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
                  let sche_form = g_js_param.set_plan.sche_form
                  console.log(sche_form, 'frist_sche_form')
                  let add_flag = g_set_record_alarm == 'alarm' ? 4 : 2
                  let arr_flag_index = g_set_record_alarm == 'alarm' ? 1 : 2
                  console.log(add_flag, arr_flag_index, 'arr_flag_index')
                  // console.log(plan_temp)
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
                  //  //console.log(sche_form)
                  for (let i = 0; i < plan_temp.length; i++) {
                    let temp = plan_temp[i]
                    let day_arr = sche_form[temp.day]

                    for (let j = 0; j < day_arr.length; j++) {
                      (function (j) {
                        if (j >= temp.start && j < temp.end) {
                          if (_this.change_string_to_four_bit_arr(day_arr[j])[arr_flag_index] == 0) {
                            day_arr[j] += add_flag
                          }
                          else {
                            day_arr[j] += 0
                          }
                        }
                      })(j)
                    }
                    // console.log(day_arr)
                  }
                  // console.log(sche_form)
                  // return
                  if (g_js_param.set_plan.id == 'motion') {
                    sche_form.forEach(function (item, index) {
                      for (let i = 0; i < item.length; i++) {
                        (function (i) {
                          item[i] += 8
                        })(i)
                      }
                    })
                  }
                  console.log(sche_form, 'sche_form')
                  let plan_sel = _this.sche_trans_to_second_format(sche_form)
                  console.log(plan_sel, 'plan_sel')
                  if (dev_name == "c_record") {    //持续录像设置计划表
                    // console.log(plan_sel)
                    plan_sel.forEach(function (item) {
                      if (item.index == 0) {
                        item.action_name = [{ name: "record", times: 0, control_time: 8000, continue_time: 16000 }]
                        item.flag = 2
                      }
                    })
                    sche = { plan: plan_sel }
                    let info = { name: "oflag", enable: 1, dev: [] }
                    let info_iflag = { name: "iflag", enable: 0, dev: [] }
                    _this.$api.set.dev_action_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      info: info_iflag
                    }).then(res => {
                      if (res.result === '') {
                        _this.$api.set.dev_action_set({
                          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                          info: info
                        }).then(res_second_action_set => {
                          console.log(sche, 'sche')
                          if (res_second_action_set.result === '') {
                            _this.$api.set.plan_record_set({
                              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                              sche: sche
                            }).then(res_plan_record_set => {
                              sche_set_ack(res_plan_record_set)
                            })
                          } else {
                            _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                          }
                        })
                      } else {
                        _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                      }
                    })
                  }
                  else {
                    plan_sel = _this.sche_add_action_name(plan_sel, g_js_param.set_plan.type)
                    sche = { all: 0, dev_name: dev_name, plan: plan_sel }
                    _this.$api.set.alarm_sche_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      exdev_id: g_js_param.set_plan.id,
                      sche: sche
                    }).then(res => {
                      sche_set_ack(res)
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
              })
            }
            function record_new_plan_log () {
              let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");
              let classname = '';
              // console.log('test error')
              // if (k == time_format.length - 1) {
              //   classname = 'time_menu_list_last';
              // } else {
              //   classname = 'time_menu_list';
              // }
              // console.log('test error')
              let alarm_main_info = g_js_param.set_plan
              if (g_total_data == "") {
                g_total_data = alarm_main_info.plan
                // g_data_before  = JSON.stringify(g_total_data);
              }
              else {
                alarm_main_info.alarm_status = "on"
              }
              if (alarm_main_info.alarm_status == "on") {
                $("#at_home_btn").switchBtn(true)
                $("#hide_timebox").show();
                $(".set_alarm_time_word").show();
              }
              else {
                $("#at_home_btn").switchBtn(false)
                $("#hide_timebox").hide();
                $(".set_alarm_time_word").hide();
              }

              for (let i = 0; i < g_total_data.length; i++) {
                let temp = g_total_data[i]
                let alarm_day_time = _this.alarm_timeArr_to_word(g_total_data[i].day)
                l_dom_set_out_time_box.innerHTML +=
                  "<div class='" + classname + " selsect_set_time_btn' index='" + i + "' time='" + temp.start + "_" + temp.end + "'>"
                  + "<div class='time_list_name'>"
                  + "<div class='time_list_name_title record_padding'>" + temp.start + " - " + temp.end + "</div>"
                  + "<div class='time_list_name_tips'>" + alarm_day_time + "</div>"
                  + "</div>"
                  + "<div class='list_info'>"
                  + "<div class='right_arrow'></div>"
                  + "</div>"
                  + "</div>";
              }
              $(".selsect_set_time_btn").each(function (index) {
                $(this).click(function () {
                  _this.g_select_week = g_total_data[index].day
                  g_js_param.set_plan.origin_day = JSON.stringify(g_total_data[index].day)
                  record_new_set_time(index);
                })
              })
            }
            $("#at_home_btn").switchBtn();
            if (g_js_param.set_plan.sd_flag && g_js_param.set_plan.sd_flag == 'none') {
              _this.publicFunc.msg_tips({ msg: mcs_no_sd_hint, type: "error", timeout: 3000, web_tips: 1 })
              $("#at_home_btn").switchBtn(false);
              $("#submit_apply").hide();
            }
            else {
              record_new_plan_log();
              alarm_set_plan_event();
            }

          }

          // 绘制设置右侧详情dom
          function new_record_creat_div () {
            for (let i = 0; i < new_record_final_all_dev.length; i++) {
              let dev_item = new_record_final_all_dev[i]
              let classNameString = (i == new_record_final_all_dev.length - 1 ? "class='menu_list2_last record_event_btn_new flag_click_event'" : "class='menu_list2 record_event_btn_new flag_click_event'")
              let nickNameStrting = (dev_item.type == 2 || dev_item.type == 4 || dev_item.type == 5 || dev_item.type == 6 ? (dev_item.nick == "" ? all_dev_name[dev_item.type] : dev_item.nick) : all_dev_name[dev_item.type])
              //  //console.log("<div "+ classNameString + " style='overflow:hidden;border-top:1px solid #ccc' sn='"+dev_item.id+"' type='"+dev_item.type+"'>", "firstLineDom")
              l_dom_record_event.innerHTML +=
                "<div " + classNameString + " style='overflow:hidden;border-top:1px solid #ccc' sn='" + dev_item.id + "' type='" + dev_item.type + "'>"
                + "<div class='list_name'>"
                + "<div class='list_name_title'>" + nickNameStrting + "</div>"
                + "<div class='list_name_tips'>" + (dev_item.plan.length > 0 ? mcs_turn_on : mcs_turn_off) + "</div>"
                + "</div>"
                + "<div class='list_info'>"
                + "<div class='right_arrow'></div>"
                + "</div>"
            }
            for (let i = 0; i < new_record_final_all_dev.length; i++) {
              let tmp = new_record_final_all_dev[i]
              for (let j = 0; j < tmp.plan.length; j++) {
                let final_plan_temp = tmp.plan[j]
                let day_arr = final_plan_temp.day.split("、")
                final_plan_temp.day = _this.change_day_to_arr(day_arr)
              }
            }
            _this.$api.set.plan_record_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              plan_record_get_ack(res)
            })
            $(".flag_click_event").each(function (index) {
              $(this).click(function () {
                if (index == 0) {
                  g_js_param.set_plan = record_plan_continue
                  g_js_param.set_record_alarm = "c_record";
                } else {
                  g_js_param.set_plan = new_record_final_all_dev[index - 1]
                  g_js_param.set_record_alarm = "record";

                  // g_js_param.action_name_list
                }
                // return;
                g_js_param.hide_nav = 1;
                // g_json_string = JSON.stringify(g_js_param);
                // console.log(g_js_param, "创建新页面传递的参数")
                new_set_record_alarm()
                // create_set_record_page()
                // call_native("creat_new_page", URL+URL_symbol+"htmlName=add_device_html/new_set_record_alarm.html&mode=push&leftButton=back&rightButton=default&jsParam=" + g_json_string);
              })
            })
          }

          // ccm_dev_profile_get获取附件接口回调函数
          async function new_record_get_ack (msg) {
            // console.log(msg, "进入获取附件接口函数")
            // 关闭弹窗
            // _this.publicFunc.closeBufferPage()
            if (msg && msg.result == "") {
              record_all_dev = msg.data.info.dev
              for (let index = 0; index < record_all_dev.length; index++) {
                let item = record_all_dev[index]
                item.plan = []
                if (item.id == "face_detect") {
                  if (face_detect != 1) {
                    record_all_dev.splice(index, 1)
                    index = index - 1;
                    continue;
                  }
                }
                if (item.id == "sound_detect") {
                  if (sound_detect != 1) {
                    record_all_dev.splice(index, 1)
                    index = index - 1;
                    continue;
                  }
                }
                if (item.id == "human_detect") {
                  if (human_detect != 1) {
                    record_all_dev.splice(index, 1)
                    index = index - 1;

                  }
                }
              }
              //将所有外设的id改为io以方便计划表的设置
              record_all_dev = record_all_dev.sort(_this.dev_type_sort)
              for(let i = 0; i < record_all_dev.length; i++){
                let item = record_all_dev[i];
                let plan_eftiv_val = [] //计划表有效值（index==0）
                await _this.$api.set.alarm_sche_get({
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  exdev_id: item.id
                }).then(res => {
                  if (res && res.result == '') {
                    item.origin_plan = res.data.sche.plan || []   //原有的计划表
                    if (!res.data.sche.plan) {
                      item.plan = []
                      item.alarm_status = "off"
                      item.action_name_list = []
                      new_record_final_all_dev.push(item)
                      item.sche_form = _this.sche_format(item.plan)
                    } else {
                      plan_tmp = res.data.sche.plan
                      item.sche_form = _this.sche_format(plan_tmp)
                      let plan_filter = plan_tmp.filter(function (item, i) {
                        if (item.action_name) {
                          if (item.action_name.filter(function (s_item, s_index) {
                            return s_item.name == 'record'
                          }).length > 0) {
                            return item;
                          }
                        }
                      })
                      if (plan_filter.length > 0) {
                        item.alarm_status = "on"
                        item.plan = _this.time_deal(plan_filter);
                      } else {
                        item.alarm_status = "off"
                        item.plan = []
                      }
                      // console.log(item, "进入alarm_sche_get后得到的item")
                      new_record_final_all_dev.push(item)
                    }
                    // console.log(new_record_final_all_dev, "new_record_final_all_dev")
                    if (new_record_final_all_dev.length == record_all_dev.length) {
                      new_record_final_all_dev = new_record_final_all_dev.sort(_this.dev_type_sort)
                      new_record_creat_div(item, i)   //开始动态打印div
                    }
                  } else {
                    _this.publicFunc.msg_tips({ msg: res.result, type: 'error', timeout: 3000 });
                    // 关闭弹窗
                    _this.publicFunc.closeBufferPage()
                    return;
                  }
                })
              }
            }
            else {
              _this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
              // 关闭弹窗
              _this.publicFunc.closeBufferPage()
              return;
            }
          }

          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          //console.log("get_dev_info_this")
          _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            face_detect = res.face_detect;
            sound_detect = res.sound_detect;
            human_detect = res.human_detect;
            //console.log(res, 'res_profile_get')
            _this.$api.set.profile_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res_profile_get => {
              new_record_get_ack(res_profile_get)
            })
          })
          break;
        }
        case "alarm_new": { // 联动报警接口
          // console.log('进入新报警处理', info)
          info.dom.innerHTML =
            "<div id='set_main_page' class='alarm_page'>"
            + "<div style='height:2rem;margin-top:1rem;display:none'>" + mcs_continuous_recording + "</div>"
            + "<div class='menu_list2_box' id='record_plan' style='overflow:hidden;display:none'>"
            + "<div class='menu_record' style='display:none;'><div class='list_name'>"
            + "<div class='list_name_title'>" + mcs_continuous_recording + "</div>"
            + "<div class='list_name_tips' id='is_show'></div>"  //下面开启关闭
            + "</div><div class='list_info'>"
            + "<div class='right_arrow'></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='menu_list_box_title3' style='height:2rem;margin-top:1rem'>" + mcs_allow_type + "</div>"
            + "<div class='menu_list2_box' id='record_event'></div>"

            + "</div>";

          // "<div id='set_main_page'>"
          // + "<div class='alarm_title'>" + mcs_allow_type + "</div>"
          // + "<div class='alarm_list_box' id='alarm_event'></div>"
          // + "</div>";

          $("#alarm_btn").switchBtn();
          let l_dom_alarm_event = _this.publicFunc.mx("#record_event");
          let face_detect = ''
          let sound_detect = ''
          let human_detect = "";
          let alarm_dev_name = ""   //附件名
          let alarm_all_dev = []   // 设备所具有的附件
          let alarm_final_all_dev = [] //设备所具有的附件外加计划表和开关状态等
          let flag = "" //计划表上的flag 1代表抓拍 2代表录像 4代表报警  flag表示设备所具有的功能的叠加值 exp:flag=6表示有报警加录像
          let all_dev_name = [
            "",                    //type=0
            mcs_motion_detection,  //type=1
            mcs_Infrared_detector, //type=2
            "",                    //type=3
            mcs_smoke_detector,    //type=4
            mcs_sos,               //type=5
            mcs_magnetic,          //type=6
            "",                    //type=7
            mcs_face_detection,    //type=8
            mcs_sound_detection,   //type=9
            mrs_human_detection    //type=10      此部分表示联动框架对应type的附件名
          ]
          let week_standard = [
            mcs_Sunday_and,
            mcs_Monday_and,
            mcs_Tuesday_and,
            mcs_Wednesday_and,
            mcs_Thursday_and,
            mcs_Friday_and,
            mcs_Saturday_and
          ]
          let g_js_param = {}
          let g_total_data = ""
          let g_set_record_alarm = "alarm"
          let time_format = [];
          let day_list = [];

          function new_set_time (index, arr) {
            console.log('enter set time')
            _this.g_hide = g_js_param.hide_nav;
            // console.log("进入新时间设置", g_js_param)
            // call_native("send_title", "&title=" + mcs_Setting_time, "");
            let start_time = ""
            let end_time = ""
            let week_str = ""
            if (arr) {
              start_time = arr.start_time
              end_time = arr.end_time
            }
            else {
              if (index == "add") {
                start_time = "00"
                end_time = "24"
              }
              else {
                start_time = g_total_data[index].start.split(":")[0]
                end_time = g_total_data[index].end.split(":")[0]
              }
            }

            week_str = _this.alarm_timeArr_to_word(_this.g_select_week)
            // console.log(week_str, "星期字符串")
            _this.publicFunc.mx("#add_device_page").innerHTML =

              "<div id='attachmen_box'>"
              + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
              + "<div id='set_time_main_page'>"
              + "<div class='set_time_list set_starttime_list'>"
              + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
              + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
              + "</div>"

              + "<div style='height:2rem;background:#EFEFF4'></div>"
              + "<div class='set_time_list set_endtime_list'>"
              + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
              + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
              + "</div>"
              + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
              + "</div>"
              + "<div class='select_week_box' id='alarm_day_select' style='overflow:hidden;width:660px;margin-top:30px;'>"
              + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
              + "<div class='week_Box' style='float:right;width:400px;'>"
              + "<div style='float: right;color: #323232;font-size: 1rem;margin-right:1rem'>" + week_str + "</div>"
              + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
              + "</div>"

              + "</div>"
              // 时间点选择确定取消按钮
              + "<div class='set_time_btn_line'>"
              + "<div id='set_time_confirm_btn' class='set_submit_btn'>" + mcs_ok + "</div>"
              + "<div id='set_time_delete_btn' class='set_del_btn'>" + mcs_delete + "</div>";
            + "</div>"

              + "</div>"
              + "</div>"
            // + "<div class='public-martop-5r'></div>"


            // "<div class='bg_color'></div>"
            // + "<div id='set_time_main_page'>"
            // + "<div class='set_time_list' >"
            // + "<div class='set_time_list_left'>" + mcs_begin_time + "</div>"
            // + "<div class='set_time_list_right' id='start_time'>" + start_time + ":00" + "</div>"
            // + "</div>"
            // + "<div class='bg_color'></div>"
            // + "<div class='set_time_list' >"
            // + "<div class='set_time_list_left'>" + mcs_end_time + "</div>"
            // + "<div class='set_time_list_right' id='end_time' >" + end_time + ":00" + "</div>"
            // + "</div>"
            // + "<div class='select_time_box' id='datePlugin'></div>"
            // + "<div class='public-distance'></div>"
            // + "<div class='alarm_day_select_box' id='alarm_day_select'>"
            // + "<div class='alarm_repeat_word'>" + mcs_repeat + "</div>"
            // + "<div class='alarm_day_str_box'>"
            // + "<div class='alarm_day_str'>" + week_str + "</div>"
            //  + "<img src='" + ASSETS_IMG + "arrow@3x.png' alt=''>"
            // + "</div>"
            // + "</div>"
            // + "</div>"
            // + "<div class='public-martop-5r'></div>"
            // + "<div id='set_time_confirm_btn' class='set_submit_btn'>" + mcs_ok + "</div>"
            // + "<div id='set_time_delete_btn' class='set_del_btn'>" + mcs_delete + "</div>";
            function set_time_event () {
              // console.log("进入set_time_event")
              $("#start_time").date({ theme: "datetime", h: start_time });
              $("#end_time").date({ theme: "datetime", h: end_time });
              $("#start_time").click(function () {
                $("#datePlugin").css("visibility", "visible");

              })

              $("#end_time").click(function () {
                $("#datePlugin").css("visibility", "visible");
              })
              if (_this.g_hide == 1) {
                $("#title_name").text(mcs_edit_time)
                _this.publicFunc.mx("#record_back_box").onclick = function () {
                  if (index != 'add') {
                    g_total_data[index].day = JSON.parse(g_js_param.set_plan.origin_day)
                  }
                  new_set_alarm();
                }
                _this.publicFunc.mx("#set_time_confirm_btn").onclick = function () {
                  let flag = ""
                  let start_time = parseInt($("#start_time").text().split(":")[0])
                  let start_str = $("#start_time").text()
                  let end_time = parseInt($("#end_time").text().split(":")[0])
                  let end_str = $("#end_time").text()
                  if (start_time >= end_time) {
                    _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000, web_tips: 1 })
                    return;
                  }
                  else {
                    if (index == "add") {
                      g_total_data.push({
                        start: start_str,
                        start_num: start_time,
                        end: end_str,
                        end_num: end_time,
                        day: _this.g_select_week
                      })
                    }
                    else {
                      g_total_data[index].day = _this.g_select_week
                      g_total_data[index].end = end_str
                      g_total_data[index].end_num = end_time
                      g_total_data[index].start = start_str
                      g_total_data[index].start_num = start_time
                    }
                  }
                  new_set_alarm();
                }

                _this.publicFunc.mx("#set_time_delete_btn").onclick = function () {
                  if (index != 'add') {
                    g_total_data.splice(index, 1)
                  }
                  new_set_alarm();
                }
              }
              $("#alarm_day_select").click(function () {
                let time_arr = {}
                time_arr.start_time = $("#start_time").text().split(":")[0]
                time_arr.end_time = $("#end_time").text().split(":")[0]
                if (parseInt(time_arr.start_time) >= parseInt(time_arr.end_time)) {
                  _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000, web_tips: 1 })
                  return;
                }
                else {
                  // console.log("是否调用了new_compile_week")
                  new_compile_week(index, time_arr)
                }

              })
            }
            set_time_event();
          }

          function new_compile_week (index, time_arr) {
            let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
              + "<div id='set_time_main_page'>"

              // + "<div class='alarm_time_select_tips'>" + mcs_select_time_week + "</div>"
              + "<div class='alarm_week_box' id ='alarm_week'></div>"

              + "</div>"
              + "</div>"
              + "</div>"

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
                "<div class='set_week' flag = '" + _this.g_select_week[i] + "'>"
                + "<div class='week_every'>" + week_standard[i] + "</div>"
                + "<div class='week_every_imgbox'><div id='select_flag_" + i + "' class='list_info_select'></div></div>"
                + "</div>"

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
                }
                else {
                  _this.g_select_week[index] = 1
                  $(this).attr("flag", 1)
                  $("#select_flag_" + index).removeClass("list_info_select_img")
                  $("#select_flag_" + index).addClass("list_info_clickselect_img")
                }
              })

            })
          }

          function sd_get_ack (msg) {
            // console.log(msg, "enter sd_get_ack")
            // console.log("查看record_plan_continue", record_plan_continue)
            let length = _this.publicFunc.mx(".list_info_select").length;
            for (let i = 0; i < length; i++) {
              _this.publicFunc.mx(".list_info_select")[i].onclick = function () {
                record_mode = this.getAttribute("type");
                $(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img');
                $(this).removeClass('list_info_select_img').addClass('list_info_clickselect_img');
              }
            }
            if (msg && msg.result == "") {
              _this.publicFunc.closeBufferPage()
              if (msg.conf) {
                record_mode = msg.conf.record_mode;
                if (msg.conf.record_mode == 0) {
                  _this.publicFunc.mx(".list_info_select_img")[0].click();
                } else if (msg.conf.record_mode == 50) {
                  _this.publicFunc.mx(".list_info_select_img")[1].click();
                } else if (msg.conf.record_mode == 100) {
                  _this.publicFunc.mx(".list_info_select_img")[2].click();
                }
              }
              $(".sd_mode").show();
              //record memory hint
              String.prototype.format = function () {
                if (arguments.length == 0) return this;
                let obj = arguments[0];
                let s = this;
                for (let key in obj) {
                  s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
                }
                return s;
              }
              let sd = msg.capacity / 1000;
              let temp = 2;
              for (let i = 0; i < 15; i++) {
                if (sd < temp) {
                  sd = temp;
                  break;
                }
                temp = temp << 1;

              }
              let data_normal = {
                size: sd + "G",
                days: Math.round(msg.capacity / 1000 / 8)
              }
              let data_long_video = {
                size: sd + "G",
                days: Math.round(msg.capacity / 1000 / 3)
              }
              let data_super_video = {
                size: sd + "G",
                days: Math.round(msg.capacity / 1000 / 2)
              }

              let normal_hint = mcs_normal_mode_hint.format(data_normal);
              let long_video_hint = mcs_long_video_mode_hint.format(data_long_video);
              let super_video_hint = mcs_super_long_video_mode_hint.format(data_super_video);
              $("#no").html(normal_hint)
              $("#lo").html(long_video_hint)
              $("#su").html(super_video_hint)

              if (msg.status != "mount") {
                $("#sd_card").hide();
                $("#submit_apply").hide();
              }
              if (msg.status == "empty") {
                $("#new_record_continue").text(mcs_close)
                record_plan_continue.alarm_status = "off"
                record_plan_continue.sd_flag = 'none'
              }

            } else {
              $("#buffer_page").hide();
              _this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
            }
            // 移植部分 可能没有作用暂做保留
            let new_record_open_dev = new_record_final_all_dev.filter(function (item) {
              return item.alarm_status == 'on'
            })
            if (new_record_open_dev.length == 0 && record_plan_continue.alarm_status == 'off') {
              $('.new_record_list').css('color', '#999')
            } else {
              $('.new_record_list').css('color', '#323232')
            }
          }

          // 报警弹窗代码
          function new_set_alarm () {
            console.log(g_js_param, "g_js_param")
            let all_dev_name = [
              mcs_continuous_recording, //type=0  //持续录像
              mcs_motion_detection,  //type=1
              mcs_Infrared_detector, //type=2
              "",                    //type=3
              mcs_smoke_detector,    //type=4
              mcs_sos,               //type=5
              mcs_magnetic,          //type=6
              "",                    //type=7
              mcs_face_detection,    //type=8
              mcs_sound_detection,   //type=9
              mrs_human_detection    //type=10      此部分表示联动框架对应type的附件名
            ]
            let all_dev_alarm_content = [
              mcs_continuous_recording_hint,  //type=0   //持续录像内容
              mcs_move_alarm_new_detail,      //type=1
              mcs_continuous_recording_hint,  //type=2
              mcs_continuous_recording_hint,  //type=3
              mcs_continuous_recording_hint,  //type=4
              mrs_sos_alarm_detail,           //type=5
              mrs_send_alarm_notification,    //type=6
              mcs_continuous_recording_hint,  //type=7
              mcs_move_alarm_detail,         //type=8
              mrs_open_switch_check_abnormal_noise_alarm,         //type=9
              mcs_move_alarm_detail          //type=10  此部分表示报警描述
            ]
            let flag = ""  //表示附件的总和  （alarm:4,record:2,snapshot:1）
            let alarm_or_record_allow_tips = mcs_Allow_record_schedule
            let dev_name = g_js_param.set_plan.id  //附件名称 (motion、io、face_detect、and so on)
            let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
            let control_time = 8000, continue_time = 16000; //alarm:control_time:0,continue_time:0,times:1  record: control_time:8000,continue_time:16000,times:0
            let times = 0
            if (g_set_record_alarm == "alarm") {
              alarm_or_record_allow_tips = mcs_Allow_alarm_schedule
              control_time = continue_time = 0
              times = 1
            } else if (g_set_record_alarm == "record") {
              alarm_or_record_allow_tips = mcs_Allow_record_schedule
              all_dev_alarm_content[1] = mcs_move_record_new_detail
              all_dev_alarm_content[5] = mrs_sos_record_detail
              all_dev_alarm_content[6] = mrs_door_record_detail
              all_dev_alarm_content[9] = mrs_open_switch_check_abnormal_noise_record
              all_dev_alarm_content[8] = all_dev_alarm_content[10] = mcs_move_record_detail         //type=8
            }
            // let action_name  =  g_js_param.set_plan.action_name_list.filter(function(item){
            //     return item.name!='cloud'
            // })
            // $("#title_name").text(all_dev_name[g_js_param.set_plan.type]);
            $("#add_device_page").show();
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"

              + "<div class='set_main_page_alarm'>"
              + "<div class='menu_list_box'>"
              + "<div class='menu_list record_allow'>"
              + "<div class='list_name record_padding'>" + mcs_Allow_alarm + "</div>"
              + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_box_title2 record_background'>" + all_dev_alarm_content[g_js_param.set_plan.type] + "</div>"

              + "<div class='margin'>"
              + "<div class='set_alarm_time_word' style='display:none;'>" + alarm_or_record_allow_tips + "</div>"
              + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
              + "<div id='set_out_time_box'></div>"
              + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"

              + "</div>"
              + "</div>"

            $("#at_home_btn").switchBtn();
            // 弹窗点击关闭按钮执行代码
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            l_dom_attachmen_box_close.onclick = function () {
              _this.record_flag(time_format, day_list)
              if (_this.g_show == "true") {
                _this.publicFunc.delete_tips({
                  content: mcs_is_save_hint, func: function () {
                    $("#add_device_page").css('display', 'none');
                    _this.create_right_page({ type: 'alarm_new', dom: _this.publicFunc.mx("#create_setting_page_right") })
                  }
                })
              } else {
                $("#add_device_page").css('display', 'none');
                _this.create_right_page({ type: 'alarm_new', dom: _this.publicFunc.mx("#create_setting_page_right") });
              }
            } // 关闭弹窗代码结束

            function sche_set_ack (msg) {
              if (msg && msg.result == "") {
                $("#add_device_page").css('display', 'none');
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                _this.create_right_page({ type: 'alarm_new', dom: _this.publicFunc.mx("#create_setting_page_right") ? _this.publicFunc.mx("#create_setting_page_right") : _this.publicFunc.mx("#create_setting_page_new") })
              }
              else if (msg.result == "permission.denied") {
                _this.publicFunc.closeBufferPage()
                _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000, web_tips: 1 })
              } else {
                _this.publicFunc.closeBufferPage()
                _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
              }
            }

            function new_alarm_set_plan_event () { // 弹窗对应的点击事件
              // console.log("进入报警的提交处理")
              $("#at_home_btn").click(function () {
                let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
                if (at_home_type === "true") {
                  $("#hide_timebox").show();
                  $(".set_alarm_time_word").show();
                } else {
                  $("#hide_timebox").hide();
                  $(".set_alarm_time_word").hide();
                }
              })
              $("#set_time_add").click(function () {
                let index = "add"
                _this.g_select_week = [1, 1, 1, 1, 1, 1, 1]
                new_set_time(index)
              })
              $("#submit_apply").click(function () {
                _this.publicFunc.showBufferPage()

                let sche = []
                // return;
                console.log($("#at_home_btn").attr("type"), '$("#at_home_btn").attr("type")')
                if ($("#at_home_btn").attr("type") == "false") {
                  if (dev_name == 'c_record') {    //持续录像设置录像开关和 计划表
                    sche = { plan: [{ start: 0, end: 604800, flag: 0, index: 1, mode: "" }] }
                    let info = { name: "oflag", enable: 0, dev: [] }
                    let info_iflag = { name: "iflag", enable: 0, dev: [] }
                    _this.$api.set.dev_action_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      info: info_iflag
                    }).then(res => {
                      if (res.result === '') {
                        _this.$api.set.dev_action_set({
                          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                          info: info
                        }).then(res_second_action_set => {
                          if (res_second_action_set.result === '') {
                            _this.$api.set.plan_record_set({
                              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                              sche: sche
                            }).then(res_plan_record_set => {
                              sche_set_ack(res_plan_record_set)
                            })
                          } else {
                            _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                          }
                        })
                      } else {
                        _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                      }
                    })

                  } else {
                    let sche_form = g_js_param.set_plan.sche_form
                    let cut_flag = g_set_record_alarm == 'alarm' ? 4 : 2
                    let arr_flag_index = g_set_record_alarm == 'alarm' ? 1 : 2
                    // console.log(sche_form)
                    sche_form.forEach(function (item, index) {
                      let temp = item
                      for (let i = 0; i < temp.length; i++) {
                        (function (i) {
                          if (_this.change_string_to_four_bit_arr(temp[i])[arr_flag_index] == 1) {
                            temp[i] -= cut_flag
                          }
                        })(i)
                      }
                    })
                    // console.log(sche_form)
                    if (g_js_param.set_plan.id == 'motion') {
                      sche_form.forEach(function (item, index) {
                        for (let i = 0; i < item.length; i++) {
                          (function (i) {
                            item[i] += 8
                          })(i)
                        }
                      })
                    }
                    let plan_sel = _this.sche_trans_to_second_format(sche_form)
                    let plan = _this.sche_add_action_name(plan_sel, g_js_param.set_plan.type)
                    sche = { all: 0, dev_name: g_js_param.set_plan.id, plan: plan }
                    _this.$api.set.alarm_sche_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      exdev_id: g_js_param.set_plan.id,
                      sche: sche
                    }).then(res => {
                      sche_set_ack(res)
                    })
                  }
                } else {
                  console.log('submit enter this if', g_total_data)
                  let plan_temp = []
                  // let plan_flag = flag
                  console.log(g_total_data, 'g_total_data')
                  for (let i = 0; i < g_total_data.length; i++) {
                    let plan_item = g_total_data[i]
                    for (let j = 0; j < 7; j++) {
                      if (plan_item.day[j] == 1) {
                        plan_temp.push({ day: j, start: plan_item.start_num, end: plan_item.end_num })
                      }
                    }
                  }
                  console.log(plan_temp, 'plan_temp')
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
                  let sche_form = g_js_param.set_plan.sche_form
                  console.log(sche_form, 'frist_sche_form')
                  let add_flag = g_set_record_alarm == 'alarm' ? 4 : 2
                  let arr_flag_index = g_set_record_alarm == 'alarm' ? 1 : 2
                  console.log(add_flag, arr_flag_index, 'arr_flag_index')
                  // console.log(plan_temp)
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
                  //  //console.log(sche_form)
                  for (let i = 0; i < plan_temp.length; i++) {
                    let temp = plan_temp[i]
                    let day_arr = sche_form[temp.day]

                    for (let j = 0; j < day_arr.length; j++) {
                      (function (j) {
                        if (j >= temp.start && j < temp.end) {
                          if (_this.change_string_to_four_bit_arr(day_arr[j])[arr_flag_index] == 0) {
                            day_arr[j] += add_flag
                          }
                          else {
                            day_arr[j] += 0
                          }
                        }
                      })(j)
                    }
                    // console.log(day_arr)
                  }
                  // console.log(sche_form)
                  // return
                  if (g_js_param.set_plan.id == 'motion') {
                    sche_form.forEach(function (item, index) {
                      for (let i = 0; i < item.length; i++) {
                        (function (i) {
                          item[i] += 8
                        })(i)
                      }
                    })
                  }
                  console.log(sche_form, 'sche_form')
                  let plan_sel = _this.sche_trans_to_second_format(sche_form)
                  console.log(plan_sel, 'plan_sel')
                  if (dev_name == "c_record") {    //持续录像设置计划表
                    // console.log(plan_sel)
                    plan_sel.forEach(function (item) {
                      if (item.index == 0) {
                        item.action_name = [{ name: "record", times: 0, control_time: 8000, continue_time: 16000 }]
                        item.flag = 2
                      }
                    })
                    sche = { plan: plan_sel }
                    let info = { name: "oflag", enable: 1, dev: [] }
                    let info_iflag = { name: "iflag", enable: 0, dev: [] }
                    _this.$api.set.dev_action_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      info: info_iflag
                    }).then(res => {
                      if (res.result === '') {
                        _this.$api.set.dev_action_set({
                          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                          info: info
                        }).then(res_second_action_set => {
                          if (res_second_action_set.result === '') {
                            _this.$api.set.plan_record_set({
                              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                              sche: sche
                            }).then(res_plan_record_set => {
                              sche_set_ack(res_plan_record_set)
                            })
                          } else {
                            _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                          }
                        })
                      } else {
                        _this.publicFunc.msg_tips({ msg: msg.msg, type: "error", timeout: 3000, web_tips: 1 })
                      }
                    })
                  }
                  else {
                    console.log('enter this commit data')
                    console.log(plan_sel, g_js_param.set_plan.type, 'sche_add')
                    plan_sel = _this.sche_add_action_name(plan_sel, g_js_param.set_plan.type)
                    sche = { all: 0, dev_name: dev_name, plan: plan_sel }
                    // console.log(sche, _this.$store.state.jumpPageData.selectDeviceIpc, g_js_param.set_plan.id,'调用该方法设置报警')
                    _this.$api.set.alarm_sche_set({
                      sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                      exdev_id: g_js_param.set_plan.id,
                      sche: sche
                    }).then(res => {
                      sche_set_ack(res)
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
              })
            }

            function alarm_plan_log () {
              let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");
              let classname = '';
              // if (k == time_format.length - 1) {
              //   classname = 'time_menu_list_last';
              // } else {
              //   classname = 'time_menu_list';
              // }
              let alarm_main_info = g_js_param.set_plan
              if (g_total_data == "") {
                g_total_data = alarm_main_info.plan
                // g_data_before  = JSON.stringify(g_total_data);
              }
              else {
                alarm_main_info.alarm_status = "on"
              }
              if (alarm_main_info.alarm_status == "on") {
                $("#at_home_btn").switchBtn(true)
                $("#hide_timebox").show();
                $(".set_alarm_time_word").show();
              }
              else {
                $("#at_home_btn").switchBtn(false)
                $("#hide_timebox").hide();
                $(".set_alarm_time_word").hide();
              }

              for (let i = 0; i < g_total_data.length; i++) {
                let temp = g_total_data[i]
                let alarm_day_time = _this.alarm_timeArr_to_word(g_total_data[i].day)
                l_dom_set_out_time_box.innerHTML +=
                  "<div class='" + classname + " selsect_set_time_btn' index='" + i + "' time='" + temp.start + "_" + temp.end + "'>"
                  + "<div class='time_list_name'>"
                  + "<div class='time_list_name_title record_padding'>" + temp.start + " - " + temp.end + "</div>"
                  + "<div class='time_list_name_tips'>" + alarm_day_time + "</div>"
                  + "</div>"
                  + "<div class='list_info'>"
                  + "<div class='right_arrow'></div>"
                  + "</div>"
                  + "</div>";
              }
              $(".selsect_set_time_btn").each(function (index) {
                $(this).click(function () {
                  _this.g_select_week = g_total_data[index].day
                  g_js_param.set_plan.origin_day = JSON.stringify(g_total_data[index].day)
                  new_set_time(index);
                })
              })
            }

            {
              // function alarm_plan_log() {
              //   // console.log(g_total_data, "g_total_data alarm_plan_log")
              //   // console.log(g_js_param, "alarm_plan_log")
              //   let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");
              //   let alarm_main_info = g_js_param.set_plan
              //   if (g_total_data == "") {
              //     g_total_data = alarm_main_info.plan
              //     g_data_before = JSON.stringify(g_total_data);
              //   }
              //   else {
              //     alarm_main_info.alarm_status = "on"
              //   }
              //   if (alarm_main_info.alarm_status == "on") {
              //     $("#at_home_btn").switchBtn(true)
              //   }
              //   else {
              //     $("#at_home_btn").switchBtn(false)
              //   }

              //   for (let i = 0; i < g_total_data.length; i++) {
              //     let temp = g_total_data[i]
              //     let alarm_day_time = _this.alarm_timeArr_to_word(g_total_data[i].day)
              //     l_dom_set_out_time_box.innerHTML +=
              //       "<div " + (i == g_total_data.length - 1 ? "class='alarm_list alarm_list_bottom_none'" : "class='alarm_list'") + " >"
              //       + "<div class='alarm_time_info_box'>"
              //       + "<div class='alarm_plan_clock'>" + temp.start + " - " + temp.end + "</div>"
              //       + "<div class='alarm_plan_day'>" + alarm_day_time + "</div>"
              //       + "</div>"
              //       + "<img class='alarm_arrow_img' src='" + ASSETS_IMG + "arrow@3x.png' alt=''>"
              //       + "</div>"
              //   }
              //   $(".alarm_list").each(function (index) {
              //     $(this).click(function () {
              //       _this.g_select_week = g_total_data[index].day
              //       g_js_param.set_plan.origin_day = JSON.stringify(g_total_data[index].day)
              //       new_set_time(index);
              //     })
              //   })
              // }
            }

            $("#at_home_btn").switchBtn();
            if (g_js_param.set_plan.sd_flag && g_js_param.set_plan.sd_flag == 'none') {
              _this.publicFunc.msg_tips({ msg: mcs_no_sd_hint, type: "error", timeout: 3000, web_tips: 1 })
              $("#at_home_btn").switchBtn(false);
              $("#submit_apply").hide();
            }
            else {
              // $("#alarm_allow_btn").switchBtn()
              alarm_plan_log();
              new_alarm_set_plan_event();
            }


          }

          // 报警右侧dom代码
          function alarm_creat_div () {
            // 关闭遮罩层
            _this.publicFunc.closeBufferPage()
            for (let i = 0; i < alarm_final_all_dev.length; i++) {
              let dev_item = alarm_final_all_dev[i]
              let classNameString = (i == alarm_final_all_dev.length - 1 ? "class='menu_list2_last record_event_btn_new flag_click_event'" : "class='menu_list2 record_event_btn_new flag_click_event'")
              let nickNameStrting = (dev_item.type == 2 || dev_item.type == 4 || dev_item.type == 5 || dev_item.type == 6 ? (dev_item.nick == "" ? all_dev_name[dev_item.type] : dev_item.nick) : all_dev_name[dev_item.type])
              l_dom_alarm_event.innerHTML +=
                "<div " + classNameString + " style='overflow:hidden;border-top:1px solid #ccc' sn='" + dev_item.id + "' type='" + dev_item.type + "'>"
                + "<div class='list_name'>"
                + "<div class='list_name_title'>" + nickNameStrting + "</div>"
                + "<div class='list_name_tips'>" + (dev_item.plan.length > 0 ? mcs_turn_on : mcs_turn_off) + "</div>"
                + "</div>"
                + "<div class='list_info'>"
                + "<div class='right_arrow'></div>"
                + "</div>"
            }
            for (let i = 0; i < alarm_final_all_dev.length; i++) {
              let tmp = alarm_final_all_dev[i]
              for (let j = 0; j < tmp.plan.length; j++) {
                let final_plan_temp = tmp.plan[j]
                let day_arr = final_plan_temp.day.split("、")
                final_plan_temp.day = _this.change_day_to_arr(day_arr)
              }
            }
            $(".flag_click_event").each(function (index) {
              $(this).click(function () {
                g_js_param.set_plan = alarm_final_all_dev[index]
                g_js_param.set_record_alarm = "alarm";
                g_js_param.hide_nav = 1;
                new_set_alarm()
              })
            })
          }

          async function alarm_get_ack (msg, ref) {
            if (msg && msg.result == "") {
              alarm_all_dev = msg.data.info.dev
              for (let index = 0; index < alarm_all_dev.length; index++) {
                let item = alarm_all_dev[index]
                item.plan = []
                if (item.id == "face_detect") {
                  if (face_detect != 1) {
                    alarm_all_dev.splice(index, 1)
                    index = index - 1;
                    continue;


                  }
                }
                if (item.id == "sound_detect") {
                  if (sound_detect != 1) {
                    alarm_all_dev.splice(index, 1)
                    index = index - 1;
                    continue;
                  }
                }
                if (item.id == "human_detect") {
                  if (human_detect != 1) {
                    alarm_all_dev.splice(index, 1)
                    index = index - 1;

                  }
                }
              }
              for(let i = 0; i < alarm_all_dev.length; i++){
                let item = alarm_all_dev[i];
                await _this.$api.set.alarm_sche_get({
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  exdev_id: item.id
                }).then(res => {
                  let plan_eftiv_val = [] //计划表有效值（index==1）
                  let plan_tmp = []
                  if (res && res.result == '') {
                    item.origin_plan = res.data.sche.plan || []   //原有的计划表
                    if (!res.data.sche.plan) {
                      item.plan = []
                      item.alarm_status = "off"
                      // item.action_name_list = []
                      console.log(alarm_final_all_dev, 'alarm_final_all_dev1')
                      alarm_final_all_dev.push(item)
                      console.log(alarm_final_all_dev, 'alarm_final_all_dev2')
                      item.sche_form = _this.sche_format(item.plan)

                    } else {
                      plan_tmp = res.data.sche.plan
                      item.sche_form = _this.sche_format(plan_tmp)
                      let plan_filter = plan_tmp.filter(function (item, i) {
                        if (item.action_name) {
                          if (item.action_name.filter(function (s_item, s_index) {
                            return s_item.name == 'alarm'
                          }).length > 0) {
                            return item;
                          }
                        }
                      })
                      // console.log(plan_filter)
                      if (plan_filter.length > 0) {
                        item.alarm_status = "on"
                        item.plan = _this.time_deal(plan_filter);
                      } else {
                        item.alarm_status = "off"
                        item.plan = []
                      }
                      // console.log(item)
                      // item.action_name_list = plan_action
                      console.log(alarm_final_all_dev, 'alarm_final_all_dev3')
                      alarm_final_all_dev.push(item)
                      console.log(alarm_final_all_dev, 'alarm_final_all_dev4')
                      // console.log(alarm_final_all_dev)
                    }

                    if (alarm_final_all_dev.length == alarm_all_dev.length) {
                      alarm_final_all_dev = alarm_final_all_dev.sort(_this.dev_type_sort)
                      alarm_creat_div();   //开始动态打印div
                    }
                  } else {
                    _this.publicFunc.msg_tips({ msg: res.result, type: 'error', timeout: 3000 });
                    _this.publicFunc.closeBufferPage()
                    return;
                  }
                })
              }
            } else {
              _this.publicFunc.msg_tips({ msg: msg.result, type: 'error', timeout: 3000 });
              _this.publicFunc.closeBufferPage()
              return;
            }
          }
          // 开启遮罩层
          _this.publicFunc.showBufferPage()
          //console.log("get_dev_info_this1111")
          await _this.$api.set.dev_info({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(async res => {
              face_detect = res.face_detect;
            sound_detect = res.sound_detect;
            human_detect = res.human_detect;
            await _this.$api.set.profile_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res_profile_get => {
              alarm_get_ack(res_profile_get)
            })
          })
          break;
        }
      }

      // ************************************************此处为创建设置列表的公用函数区************************************************************** //

      //报警录像公用代码
      function mode_sd_get_ack (msg) {
        let length = _this.publicFunc.mx(".list_info_select").length;
        let record_mode;
        for (let i = 0; i < length; i++) {
          _this.publicFunc.mx(".list_info_select")[i].onclick = function () {
            record_mode = this.getAttribute("type");
            $(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img');
            $(this).removeClass('list_info_select_img').addClass('list_info_clickselect_img');
          }
        }
        if (msg && msg.result == "" && msg.status == "mount") {
          $("#sd_mode").show();
          add_event();
          if (msg.conf) {
            record_mode = msg.conf.record_mode;
            if (msg.conf.record_mode == 0) {
              _this.publicFunc.mx(".list_info_select_img")[0].click();
            } else if (msg.conf.record_mode == 50) {
              _this.publicFunc.mx(".list_info_select_img")[1].click();
            } else if (msg.conf.record_mode == 100) {
              _this.publicFunc.mx(".list_info_select_img")[2].click();
            }
          }
          String.prototype.format = function () {
            if (arguments.length == 0) return this;
            let obj = arguments[0];
            let s = this;
            for (let key in obj) {
              s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
            }
            return s;
          }
          let sd = msg.capacity / 1000;
          let temp = 2;
          for (let i = 0; i < 15; i++) {
            if (sd < temp) {
              sd = temp;
              break;
            }
            temp = temp << 1;
          }
          let data_normal = {
            size: sd + "G",
            days: Math.round(msg.capacity / 1000 / 8)
          }
          let data_long_video = {
            size: sd + "G",
            days: Math.round(msg.capacity / 1000 / 3)
          }
          let data_super_video = {
            size: sd + "G",
            days: Math.round(msg.capacity / 1000 / 2)
          }
          let normal_hint = mcs_normal_mode_hint.format(data_normal);
          let long_video_hint = mcs_long_video_mode_hint.format(data_long_video);
          let super_video_hint = mcs_super_long_video_mode_hint.format(data_super_video);
          $("#no").html(normal_hint)
          $("#lo").html(long_video_hint)
          $("#su").html(super_video_hint)
        } else {
          if ($("#set_main_page").hasClass('record_page')) { //录像没有sd卡不能设置时间
            no_sd_event(); //未检测到sd卡
          } else if ($("#set_main_page").hasClass('alarm_page')) { //如果报警 跟sd卡无关
            add_event();
          }
        }
        mode_sd_get_ack_event();
      }
      function mode_sd_get_ack_event () {
        let length = _this.publicFunc.mx(".list_info_select").length;
        let record_mode
        for (let i = 0; i < length; i++) {
          _this.publicFunc.mx(".list_info_select")[i].onclick = function () {
            record_mode = this.getAttribute("type");
            $(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img');
            $(this).removeClass('list_info_select_img').addClass('list_info_clickselect_img');
            console.log('this click', record_mode)
          }
        }
        _this.publicFunc.mx("#sd_mode_btn").onclick = function () {
          console.log(record_mode, 'record_mode')
          _this.$api.set.sd_set({ sn: _this.$store.state.jumpPageData.selectDeviceIpc, ctrl_type: "", record_mode: record_mode, flag: 1 }).then(res => {
            _this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
          })
        }
      }
      function no_sd_event () {
        $(".list_name_tips").text(mcs_turn_off);
        _this.publicFunc.mx("#record_plan").onclick = function () { //点击提示没有检测到sd卡
          _this.publicFunc.msg_tips({ msg: mcs_no_sd_hint, type: "error", timeout: 3000 });
        }
        let l_dom_record_event_btn = _this.publicFunc.mx(".record_event_btn");
        for (let k = 0; k < l_dom_record_event_btn.length; k++) {
          l_dom_record_event_btn[k].onclick = function () {
            _this.publicFunc.msg_tips({ msg: mcs_no_sd_hint, type: "error", timeout: 3000 });
          }
        }
      }
      function add_event () {
        _this.publicFunc.mx("#record_plan").onclick = function () { //点击持续录像
          // console.log("调用create_set_record_page", g_js_param)
          create_set_record_page()
        }
        let l_dom_record_event_btn = _this.publicFunc.mx(".record_event_btn");
        for (let k = 0; k < l_dom_record_event_btn.length; k++) {
          l_dom_record_event_btn[k].onclick = function () {
            //定义变量区分点击的是事件录像还是持续录像那
            let record_sn = this.getAttribute("sn"); //重要
            let type = this.getAttribute("type");
            g_accessory_sn = record_sn;
            g_accessory_type = type;
            // console.log("调用create_set_record_page")
            create_set_alarm_page()
          }
        }
      }
      // ccm_scene_get接口回调函数
      function record_get_ack (msg, ref) {
        // $("#buffer_page").hide();
        _this.publicFunc.closeBufferPage()
        if (msg && msg.result == "") {
          // data = msg;
          if (msg.data.info.scene[0].flag == 0) {
            $("#is_show").text(mcs_turn_off)
          } else {
            $("#is_show").text(mcs_turn_on)
          }
          let l_scene_data = msg.data.info.scene;
          // console.log(msg.data.info, "msg.data.info")
          let event_record = 0;
          // l_select_scene_name = msg.data.info.select;
          for (let i = 0, len = l_scene_data.length; i < len; i++) {
            if (l_scene_data[i].name == "out") {
              l_scene_data_out = l_scene_data[i];
            } else if (l_scene_data[i].name == "in") {
              l_scene_data_active = l_scene_data[i];
            }
          }

          // console.log(human_detect, "human_detect")
          for (let j = 0; j < l_scene_data_out.dev.length; j++) {
            let record_event_name, record_event_type;
            if (l_scene_data_out.dev[j].type == 1) {
              record_event_name = mcs_motion_detection;
            } else if (l_scene_data_out.dev[j].type == 6) {
              record_event_name = mcs_magnetic;
            } else if (l_scene_data_out.dev[j].type == 5) {
              record_event_name = mcs_sos;
            } else if (l_scene_data_out.dev[j].type == 8) {
              if (face_detect == 0) { continue; }
              record_event_name = mcs_face_detection;
            } else if (l_scene_data_out.dev[j].type == 9) {
              //console.log(res, 'sound_detect_test')
              if (sound_detect == 0) { continue; }
              record_event_name = mcs_sound_detection;
            } else if (l_scene_data_out.dev[j].type == 2) {
              record_event_name = mcs_Infrared_detector;
            } else if (l_scene_data_out.dev[j].type == 4) {
              record_event_name = mcs_smoke_detector;
            } else if (l_scene_data_out.dev[j].type == 7) {
              continue;
            } else if (l_scene_data_out.dev[j].type == 10) { //human_detect
              continue
            }
            // console.log(l_scene_data_out.dev[j].flag, "l_scene_data_out.dev[j].flag")
            if (info.type == 'record' || info.type == 'record_new') { //区分不同case
              if (!(l_scene_data_out.dev[j].flag & 0x2)) {
                record_event_type = mcs_turn_off;
                // event_record = 1;
              } else if ((l_scene_data_out.dev[j].flag & 0x2)) {
                record_event_type = mcs_turn_on;
                event_record = 1;
              }
            } else if (info.type == 'alarm_device_tips' || info.type == 'alarm') {
              if (!(l_scene_data_out.dev[j].flag & 0x4)) {
                record_event_type = mcs_turn_off;
              } else if ((l_scene_data_out.dev[j].flag & 0x4)) {
                record_event_type = mcs_turn_on;
                let open_alarm = 1;
              }
            }
            if (j == l_scene_data_out.dev.length - 1) {
              l_dom_record_event.innerHTML +=
                "<div class='menu_list2_last record_event_btn' style='overflow:hidden;border-top:1px solid #ccc;border-bottom:1px solid #ccc' sn='" + l_scene_data_out.dev[j].id + "' type='" + l_scene_data_out.dev[j].type + "'>"
                + "<div class='list_name'>"
                + "<div class='list_name_title'>" + record_event_name + "</div>"
                + "<div class='list_name_tips'>" + record_event_type + "</div>"
                + "</div>"
                + "<div class='list_info'>"
                + "<div class='right_arrow'></div>"
                + "</div>"
                + "</div>"
            } else {
              l_dom_record_event.innerHTML +=
                "<div class='menu_list2 record_event_btn' style='overflow:hidden;border-top:1px solid #ccc' sn='" + l_scene_data_out.dev[j].id + "' type='" + l_scene_data_out.dev[j].type + "'>"
                + "<div class='list_name'>"
                + "<div class='list_name_title'>" + record_event_name + "</div>"
                + "<div class='list_name_tips'>" + record_event_type + "</div>"
                + "</div>"
                + "<div class='list_info'>"
                + "<div class='right_arrow'></div>"
                + "</div>"
                + "</div>"
            }
          }
          if (info.type == 'alarm_device_tips' || info.type == 'alarm') { //如果报警 不走sd逻辑
            add_event()
          }
          // add_event() 
        }
        if (info.type === 'record' || info.type === 'record_new') {
          _this.$api.set.sd_get({ sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
            mode_sd_get_ack(res)
          })
        }
      }
      async function create_set_alarm_page (repeat_page) { //允许报警设置开关时间页面
            //控制显示内容
            let set_record_alarm_title, set_record_alarm_content;
            _this.record_flag_out = 'true';
            set_record_alarm_title = mcs_Allow_alarm;
            let set_record_alarm_allow_title = mcs_Allow_alarm_schedule;
            if (g_accessory_type == 1) {

              set_record_alarm_content = mcs_move_alarm_new_detail;
            } else if (g_accessory_type == 5) {

              set_record_alarm_content = mcs_sos_alarm_detail;
            } else if (g_accessory_type == 6) {

              set_record_alarm_content = mcs_send_alarm_notification;
            } else if (g_accessory_type == 8) {

              set_record_alarm_content = mcs_move_record_detail;
            } else if (g_accessory_type == 9) {

              set_record_alarm_content = mcs_move_record_detail;
            }
            else if (g_accessory_type == "") {
              set_record_alarm_content = mcs_7x24_hours_prompt;
            }

            $("#add_device_page").show();
            _this.publicFunc.mx("#add_device_page").innerHTML =
              "<div id='attachmen_box'>"
              + "<div id='attachmen_box_close'></div>"

              + "<div class='set_main_page_alarm'>"
              + "<div class='menu_list_box'>" //允许报警和开关
              + "<div class='menu_list record_allow'>"
              + "<div class='list_name record_padding'>" + set_record_alarm_title + "</div>"  //set_record_alarm_title
              + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_box_title2 record_background'>" + set_record_alarm_content + "</div>" //set_record_alarm_content

              + "<div class='margin'>" //设置时间
              + "<div class='set_alarm_time_word' style='display:none;'>" + set_record_alarm_allow_title + "</div>" //set_record_alarm_allow_title
              + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
              + "<div id='set_out_time_box'></div>"
              + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
              + "</div>"
              + "</div>"
              + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"

              + "</div>"
              + "</div>"
            let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
            l_dom_attachmen_box_close.onclick = function () {
              _this.record_flag(time_format, day_list)
              if (_this.g_show == "true") {
                _this.publicFunc.delete_tips({
                  content: mcs_is_save_hint, func: function () {
                    $("#add_device_page").css('display', 'none');
                    _this.create_right_page({ type: 'alarm', dom: _this.publicFunc.mx("#create_setting_page_new") })
                  }
                })
              } else {
                _this.create_right_page({ type: 'alarm', dom: _this.publicFunc.mx("#create_setting_page_right") });
                $("#add_device_page").css('display', 'none');
              }
            }
            let data, l_scene_data_out, l_scene_data_active;
            let req_data;
            $("#at_home_btn").switchBtn();
            _this.publicFunc.mx("#set_time_add").onclick = function () {
              _this.g_set_out_time = "";
              _this.g_is_add = "true";
              set_time();
            }
            function alarm_set_event () {
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                  if (at_home_type == "true") {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x4; //on voice
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x4; //on voice
                    $(".set_alarm_time_word").show();
                    $("#hide_timebox").show();
                  } else {
                    //away
                    req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag & 0x3; //off voice
                    req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag & 0x3; //off voice
                    $("#hide_timebox").hide();
                    $(".set_alarm_time_word").hide();
                  }
                }
              }
            }//alarm_set_event
            function set_plan_record () {
              let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
              if (at_home_type == "true") {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 1;
                $("#hide_timebox").show();
                $(".set_alarm_time_word").show();
              } else {
                req_data.info.scene[2].flag = 0;
                req_data.info.scene[1].flag = 0;
                $("#hide_timebox").hide();
                $(".set_alarm_time_word").hide();

              }
            }//set_plan_record

            function get_scene_ack (msg) {
              let scene_data;
              g_total_type = msg;
              // $("#buffer_page").hide();
              _this.publicFunc.closeBufferPage()
              if (msg && msg.result == "") {
                data = msg;
                for (let i = 0; i < msg.data.info.scene.length; i++) {
                  scene_data = msg.data.info.scene[i];
                  if (scene_data.name == "out") {
                    l_scene_data_out = msg.data.info.scene[i];
                    if (g_accessory_sn) {
                      for (let j = 0; j < scene_data.dev.length; j++) {
                        if (scene_data.dev[j].id == g_accessory_sn) {
                          if (repeat_page !== 1) {
                            if (scene_data.dev[j].flag & 0x4) {
                              $("#at_home_btn").switchBtn(true, "", "", alarm_set_event);
                              $("#hide_timebox").show();
                              $(".set_alarm_time_word").show();
                            } else {
                              $("#at_home_btn").switchBtn(false, "", "", alarm_set_event);
                              $("#hide_timebox").hide();
                              $(".set_alarm_time_word").hide();
                            }
                          } else {
                            $("#at_home_btn").switchBtn(true, "", "", alarm_set_event);
                            $("#hide_timebox").show();
                            $(".set_alarm_time_word").show();
                          }
                        }
                      }
                    } else {
                      if (repeat_page !== 1) {
                        if (scene_data.flag) {
                          $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                          $("#hide_timebox").show();
                          $(".set_alarm_time_word").show();
                        } else {
                          $("#at_home_btn").switchBtn(false, "", "", set_plan_record);
                          $("#hide_timebox").hide();
                        }
                      } else {
                        $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                        $("#hide_timebox").show();
                        $(".set_alarm_time_word").show();
                      }

                    }
                  } else if (scene_data.name == "in") {
                    l_scene_data_active = msg.data.info.scene[i];
                  }
                }
                req_data = {
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1, info: {
                    select: data.data.info.select,
                    scene: [{ name: "auto", flag: 0 },
                    {
                      name: "out",
                      flag: l_scene_data_out.flag,
                      dev: l_scene_data_out.dev
                    },
                    {
                      name: "in",
                      flag: l_scene_data_active.flag,
                      dev: l_scene_data_active.dev
                    }]
                  },
                  func: function (msg) {
                    //                    _this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
                  }
                }

                if (repeat_page == 1) { //解决点击应用，开关值显示开，请求参数没改bug，最后开关还是关
                  if (g_accessory_sn) {
                    for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                      if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                        // req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
                        // req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video 
                        req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x4; //on voice
                        req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x4; //on voice        
                      }
                    }
                  } else {
                    // req_data.info.scene[2].flag=0;
                    // req_data.info.scene[1].flag=1;
                    req_data.info.scene[2].flag = 0;
                    req_data.info.scene[1].flag = 1;
                  }
                }

              }
            }//get_scene_ack

            // $("#buffer_page").show();
            // 展示遮罩层
            _this.publicFunc.showBufferPage()
            await _this.$api.set.scene_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              get_scene_ack(res)
            })
            let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");
            if (g_total_data != "") {
              schedule_get(g_total_data);
            } else {
              await _this.$api.set.schedule_get({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc
              }).then(res => {
                schedule_get_ack(res)
              })
            }

            function schedule_get (g_data) {
              if (day_list.length != 0) {
                for (let i = 0; i < day_list.length; i++) {
                  let classname = '';
                  if (i == day_list.length - 1) {
                    classname = 'time_menu_list_last';
                  } else {
                    classname = 'time_menu_list';
                  }
                  l_dom_set_out_time_box.innerHTML +=
                    "<div class='" + classname + " select_set_time_btn' index='" + i + "' time='" + day_list[i].start + "_" + day_list[i].end + "_" + day_list[i].week + "'>"
                    + "<div class='time_list_name'>"
                    + "<div class='time_list_name_title record_padding'>" + day_list[i].start + ":00 - " + day_list[i].end + ":00</div>"
                    + "<div class='time_list_name_tips'>" + day_list[i].week + "</div>"
                    + "</div>"
                    + "<div class='list_info'>"
                    + "<div class='right_arrow'></div>"
                    + "</div>"
                    + "</div>";
                }
                let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.select_set_time_btn');
                for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                  l_dom_selsect_set_time_btn[n].onclick = function () {
                    _this.g_is_add = "false";
                    let time = this.getAttribute('time');
                    index = this.getAttribute('index');
                    let arr = "";
                    if (time.split("_")[2].indexOf(mcs_Sunday_and) != -1) {
                      arr += "0."
                    }
                    if (time.split("_")[2].indexOf(mcs_Monday_and) != -1) {
                      arr += "1."
                    }
                    if (time.split("_")[2].indexOf(mcs_Tuesday_and) != -1) {
                      arr += "2."
                    }
                    if (time.split("_")[2].indexOf(mcs_Wednesday_and) != -1) {
                      arr += "3."
                    }
                    if (time.split("_")[2].indexOf(mcs_Thursday_and) != -1) {
                      arr += "4."
                    }
                    if (time.split("_")[2].indexOf(mcs_Friday_and) != -1) {
                      arr += "5."
                    }
                    if (time.split("_")[2].indexOf(mcs_Saturday_and) != -1) {
                      arr += "6."
                    }
                    arr = arr.substring(0, arr.length - 1);
                    _this.g_set_out_time = day_list[index].start + "_" + day_list[index].end + "_" + arr;
                    set_time();
                  }
                }
              }
            }//schedule_get

            function schedule_time_format (arr) {
              let start_time = [], end_time = [];
              for (let j = 0; j < arr.length; j++) {
                let num = -1;
                start_time[j] = [];
                end_time[j] = [];
                for (let i = -1; i < arr[j].length;) {
                  if (arr[j].indexOf(0, i) == i && i != -1) {
                    i++;
                    end_time[j][num]++;
                  } else if (arr[j].indexOf(0, i) < 0 && i > 0) {
                    i = arr[j].length;
                  } else if (arr[j].indexOf(0, i) < 0 && i <= 0) {
                    i = arr[j].length;
                    start_time[j][0] = 0;
                    end_time[j][0] = 0;
                  } else {
                    num++;
                    start_time[j][num] = arr[j].indexOf(0, i)
                    end_time[j][num] = arr[j].indexOf(0, i)
                    i = arr[j].indexOf(0, i);
                  }
                }
              }
              let length;
              for (let time_i = 0; time_i < 7; time_i++) {
                for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
                  if (end_time[time_i][time_j]) {
                    length = time_format.length;
                    if (length > 0) {
                      let is_exist = 0;
                      for (let time_format_i = 0; time_format_i < length; time_format_i++) {
                        if (start_time[time_i][time_j] == time_format[time_format_i].start_time && end_time[time_i][time_j] == time_format[time_format_i].end_time) {
                          time_format[time_format_i].week.push(time_i);
                          is_exist = 1;
                        }
                      }
                      if (is_exist == 0) {
                        time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                      }
                    } else {
                      time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                    }
                  }
                }
              }
              // l_dom_set_out_time_box.innerHTML = "<div id='set_time_box'></div>"
              for (let k = 0; k < time_format.length; k++) {
                let week = "";
                let week_num = '';
                for (let m = 0; m < time_format[k].week.length; m++) {
                  if (time_format[k].week[m] == 0) {
                    week += mcs_Sunday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 1) {
                    week += mcs_Monday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 2) {
                    week += mcs_Tuesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 3) {
                    week += mcs_Wednesday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 4) {
                    week += mcs_Thursday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 5) {
                    week += mcs_Friday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  } else if (time_format[k].week[m] == 6) {
                    week += mcs_Saturday_and + "、";
                    week_num += time_format[k].week[m] + ".";
                  }
                }
                week = week.substring(0, week.length - 1)
                week_num = week_num.substring(0, week_num.length - 1)

                let classname = '';
                // if (k == time_format.length - 1) {
                //   classname = 'time_menu_list_last';
                // } else {
                //   classname = 'time_menu_list';
                // }
                l_dom_set_out_time_box.innerHTML +=
                  "<div class='" + classname + " selsect_set_time_btn' index='" + k + "' time='" + time_format[k].start_time + "_" + time_format[k].end_time + "_" + week_num + "'>"
                  + "<div class='time_list_name'>"
                  + "<div class='time_list_name_title record_padding'>" + time_format[k].start_time + ":00 - " + time_format[k].end_time + ":00</div>"
                  + "<div class='time_list_name_tips'>" + week + "</div>"
                  + "</div>"
                  + "<div class='list_info'>"
                  + "<div class='right_arrow'></div>"
                  + "</div>"
                  + "</div>";
                day_list.push({ start: time_format[k].start_time, end: time_format[k].end_time, week: week });
              }
              let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.selsect_set_time_btn');
              for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
                l_dom_selsect_set_time_btn[n].onclick = function () {
                  _this.g_is_add = "false";
                  let time = this.getAttribute('time');
                  index = this.getAttribute('index');
                  _this.g_set_out_time = time;
                  set_time();
                }
              }
            }//schedule_time_format

            _this.publicFunc.mx("#submit_apply").onclick = async function () {
              _this.record_flag_out = "false";
              _this.g_show = 'false';
              // console.log(g_total_data, "报警g_total_data")
              await _this.$api.set.schedule_set({
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                sch: {
                  degree: 3600,
                  schedule: g_total_data
                }
              }).then(res => {
                if (res && res.result === "") {
                  _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
                } else if (res.result === "permission.denied") {
                  _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
                }
              })
              req_data.info.scene[2].flag = 0;
              req_data.info.scene[2].dev[0].flag = 0;
              await _this.$api.set.scene_set(req_data)
            }

            function compile_week () {
              let week_select = _this.g_select_week.slice();
              $("add_device_page").show();
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Sunday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Monday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Tuesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Wednesday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Thursday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Friday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "<div class='set_week'>"
                + "<div class='week_every'>" + mcs_Saturday_and + "</div>"
                + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
                + "</div>"
                + "</div>"

                + "</div>"

              let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");
              let l_dom_set_week_list = _this.publicFunc.mx(".set_week");
              for (let i = 0; i < l_dom_set_week_list.length; i++) {
                l_dom_set_week_list[i].index = i;
                l_dom_set_week_list[i].onclick = function () {
                  if ($(this).find(".list_info_select").hasClass("list_info_select_img")) {
                    week_select[this.index] = 1;
                    $(this).find(".list_info_select").removeClass('list_info_select_img').addClass('list_info_clickselect_img')

                  } else {
                    week_select[this.index] = 0;
                    $(this).find(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img')
                  }
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i] == 1) {
                      g_week_w = "[" + week_select.join() + "]";
                      return;
                    }
                  }
                  _this.native_can_back= false;
                }

              }

              for (i = 0; i < week_select.length; i++) {
                if (week_select[i]) {
                  l_dom_set_week_list[i].click();
                }

              }


              l_dom_record_back_box.onclick = function () {
                if (week_select.indexOf(1) == -1) {
                  $(".time_select_tips").show();
                  setTimeout("$('.time_select_tips').hide();", 3000)
                } else {
                  set_time();
                }
              }
            }//compile_week

            function set_time () {
              _this.native_can_back= true;
              g_aa_data = g_total_data;
              let flag = true;
              let repeat = false;
              let start_time = '00';
              let end_time = '24';
              let old_start_time = '00';
              let old_end_time = "00";
              let old_week = "";
              let week = '';
              let week_new = []; //保存选中哪些日期值
              if (g_set_old_out_time == "" && _this.g_is_add == "false") {
                g_set_old_out_time = _this.g_set_out_time;
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (g_set_old_out_time != "" && _this.g_is_add == "false") {
                old_start_time = g_set_old_out_time.split("_")[0];
                old_end_time = g_set_old_out_time.split("_")[1];
                old_week = g_set_old_out_time.split("_")[2].split(".");
              }
              if (_this.g_set_out_time) {
                let set_time_out_data = _this.g_set_out_time.split("_");
                start_time = set_time_out_data[0] >= 10 ? set_time_out_data[0] : "0" + set_time_out_data[0];
                end_time = set_time_out_data[1] >= 10 ? set_time_out_data[1] : "0" + set_time_out_data[1];
                week = set_time_out_data[2] ? set_time_out_data[2].split(".") : [];
              }
              //add default time

              if (_this.g_is_add == "true") {
                week = [0, 1, 2, 3, 4, 5, 6]
              }

              let temp = eval(g_week_w);
              if (temp.length == 7) {
                let j = 0;
                for (i = 0; i < temp.length; i++) {
                  if (temp[i]) {
                    week_new[j] = i;
                    j++;
                  }
                }
              }
              _this.publicFunc.mx("#add_device_page").innerHTML =
                "<div id='attachmen_box'>"
                + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div><div id='delete_set_record'>" + mcs_delete + "</div></div>"
                + "<div id='set_time_main_page'>"
                + "<div class='set_time_list set_starttime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
                + "</div>"

                + "<div style='height:2rem;background:#EFEFF4'></div>"
                + "<div class='set_time_list set_endtime_list'>"
                + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
                + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
                + "</div>"
                + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
                + "</div>"
                + "<div class='select_week_box' id='click_arrow' style='overflow:hidden;width:660px;margin-top:30px;'>"
                + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
                + "<div class='week_Box' style='float:right;width:400px;'>"
                + "<div class='week_list' id='week0'>" + mcs_Sunday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week1'>" + mcs_Monday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week2'>" + mcs_Tuesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week3'>" + mcs_Wednesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week4'>" + mcs_Thursday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week5'>" + mcs_Friday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div class='week_list' id='week6'>" + mcs_Saturday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
                + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
                + "</div>"
                + "</div>"
                + "</div>"
                + "</div>"
              //        +"<div id='set_time_submit_btn' class='set_submit_btn'>"+mcs_ok+"</div>"
              //        +"<div id='set_time_del_btn' class='set_del_btn'>"+mcs_delete+"</div>";

              _this.publicFunc.mx("#click_arrow").onclick = function () {
                if (temp.length != 0) {
                  _this.g_select_week = week_select;
                } else {
                  _this.g_select_week = old_week_select;
                }
                let time = parseInt(_this.publicFunc.mx("#start_time").innerHTML) + "_" + parseInt(_this.publicFunc.mx("#end_time").innerHTML) + "_";
                for (let i = 0; i < _this.g_select_week.length; i++) {
                  if (_this.g_select_week[i] == 1) {
                    time += i + "."
                  }
                }
                time.substring(0, time.length - 1)
                _this.g_set_out_time = time;
                compile_week();
              }

              let week_select = [0, 0, 0, 0, 0, 0, 0];
              let old_week_select = [0, 0, 0, 0, 0, 0, 0];

              if (temp.length !== 0) {
                week_select = temp;
              }

              function stringToHex (data) {
                let val = "", arr = [], arr0 = [];
                for (let i = 0; i < data.length; i++) {
                  val = parseInt(data[i], 2).toString(16);
                  arr[i] = val;
                }
                for (let j = 0; j < data.length; j++) {
                  arr0[j] = 0xff & ("0x" + arr[j]);
                }
                return arr0;
              }

              function set_time_event () {
                $("#start_time").date({ theme: "datetime", h: start_time });
                $("#end_time").date({ theme: "datetime", h: end_time });
                $("#start_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })

                $("#end_time").click(function () {
                  $("#start_time").addClass('start_time_active');
                  $("#datePlugin").css("visibility", "visible");
                })
                let l_dom_week_list = _this.publicFunc.mx(".week_list");
                for (let i = 0; i < l_dom_week_list.length; i++) {
                  let is_has = $(this).hasClass("week_list_active");
                  l_dom_week_list[i].index = i;
                  for (let h = 0; h < week_new.length; h++) {
                    if (i == week_new[h]) {
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (h == week_new.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }
                  for (let j = 0; j < week.length; j++) {
                    if (week_new.length !== 0) {
                      continue;
                    }
                    if (i == week[j]) {
                      //  l_dom_week_list[i].click();
                      old_week_select[i] = 1;
                      let id_week = "#week" + i;
                      $(id_week).css("display", "block");
                      if (j == week.length - 1) {
                        $(id_week).find(".dian_tip").css("display", "none");
                      }
                    }
                  }
                }
                if (temp.length != 0) {
                  let y = temp;
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                      }
                      week_select[i] = y[i];
                    }
                  }
                } else {
                  for (let i = 0; i < l_dom_week_list.length; i++) {
                    for (let j = 0; j < week.length; j++) {
                      if (i == week[j]) {
                        old_week_select[i] = 1;
                        week_select[i] = 1;
                      }
                    }
                  }
                }
                function set_time_func (type) {
                  repeat = false;
                  let index = -1;
                  let tmp_data = "";
                  let time_select = [];
                  let start_time = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                  let end_time = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                  let new_time_select = [];
                  if (start_time >= end_time) {
                    repeat = true;
                    flag = false;
                    _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
                    return;
                  }
                  flag = true;
                  for (let i = 0; i < week_select.length; i++) {
                    if (week_select[i]) {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        if (j >= start_time && j < end_time) {
                          tmp_data += "0"
                        } else {
                          tmp_data += "1"
                        }
                        time_select[index] = tmp_data.split("").reverse().join("");
                      }
                    } else {
                      for (let j = 0; j < 24; j++) {
                        if (j % 8 == 0) {
                          let tmp_data = "";
                          index++;
                        }
                        tmp_data += "1"
                        time_select[index] = tmp_data;
                      }
                    }
                  }
                  function get_select_time (g_total_data) {
                    if (g_total_data != "") {
                      let l_data_2 = mcodec.b64_2_binary(g_total_data, 1), str = "", arr = [], arr2 = [], arr_tmp = [];
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
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < old_week.length; i++) {
                            let arr_all = "";
                            let arr_all_arr = [];
                            let arr1 = "", arr2 = "", arr3 = "";
                            for (let j = 0; j < 3; j++) {
                              arr_all += arr[old_week[i] * 3 + j].split("").reverse().join("");
                            }
                            arr_all_arr = arr_all.split("");
                            for (let m = parseInt(old_start_time); m < parseInt(old_end_time); m++) {
                              arr_all_arr[m] = "1";
                            }
                            for (let k = 0; k <= 7; k++) {
                              arr1 += arr_all_arr[k];
                            }
                            for (k = 8; k <= 15; k++) {
                              arr2 += arr_all_arr[k]
                            }
                            for (k = 16; k <= 23; k++) {
                              arr3 += arr_all_arr[k]
                            }
                            arr[old_week[i] * 3] = arr1.split("").reverse().join("");
                            arr[old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
                            arr[old_week[i] * 3 + 2] = arr3.split("").reverse().join("");

                          }
                        }
                        let select = [];
                        if (_this.g_is_add == "false") {
                          for (let i = 0; i < week_select.length; i++) {
                            if (week_select[i] == 1) {
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;
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
                        g_total_data = l_data_64
                        g_aa_data = l_data_64;

                      }
                    }
                  }//get_select_time
                  get_select_time(g_total_data)
                }
                let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");

                l_dom_record_back_box.onclick = function () {
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  set_time_func("submit");
                  if (!flag) {
                    return;
                  }
                  if (_this.g_is_add == "false") {
                    day_list[index].start = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
                    day_list[index].end = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
                    day_list[index].week = arr;
                  } else {
                    day_list.push({ start: parseInt(_this.publicFunc.mx("#start_time").innerHTML), end: parseInt(_this.publicFunc.mx("#end_time").innerHTML), week: arr })
                  }
                  if (!repeat) {
                    g_set_old_out_time = "";
                    _this.g_set_out_time = "";
                    g_week_w = [];
                    g_total_data = g_aa_data;
                    create_set_alarm_page(1);
                  }
                }
                // 报警时间设置页面删除按钮事件
                _this.publicFunc.mx("#delete_set_record").onclick = function () {
                  let arr = "";
                  if (week_select[0] == 1) {
                    arr += mcs_Sunday_and + "、";
                  }
                  if (week_select[1] == 1) {
                    arr += mcs_Monday_and + "、";
                  }
                  if (week_select[2] == 1) {
                    arr += mcs_Tuesday_and + "、";
                  }
                  if (week_select[3] == 1) {
                    arr += mcs_Wednesday_and + "、";
                  }
                  if (week_select[4] == 1) {
                    arr += mcs_Thursday_and + "、";
                  }
                  if (week_select[5] == 1) {
                    arr += mcs_Friday_and + "、";
                  }
                  if (week_select[6] == 1) {
                    arr += mcs_Saturday_and + "、";
                  }
                  arr = arr.substring(0, arr.length - 1);
                  if (_this.g_is_add == "false") {
                    day_list.splice(index, 1);
                  } else {
                    create_set_alarm_page();
                    return;
                  }
                  set_time_func("del");
                  if (!repeat) {
                    g_set_old_out_time = "";
                    g_total_data = g_aa_data;
                    create_set_alarm_page();
                  }
                }
              }
              set_time_event();
            }
          }
      function schedule_get_ack (msg) {
        _this.publicFunc.closeBufferPage()
        if (msg && msg.result == "") {
          g_total_data = msg.data.sch.schedule;
          let l_data_2 = mcodec.b64_2_binary(msg.data.sch.schedule, 1), arr = [], arr2 = [], arr_tmp = [];
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
          schedule_time_format(arr2)
        }
      }//schedule_get_ack
function schedule_time_format (arr) {
    let start_time = [], end_time = [];
    let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");
    for (let j = 0; j < arr.length; j++) {
      let num = -1;
      start_time[j] = [];
      end_time[j] = [];
      for (let i = -1; i < arr[j].length;) {
        if (arr[j].indexOf(0, i) == i && i != -1) {
          i++;
          end_time[j][num]++;
        } else if (arr[j].indexOf(0, i) < 0 && i > 0) {
          i = arr[j].length;
        } else if (arr[j].indexOf(0, i) < 0 && i <= 0) {
          i = arr[j].length;
          start_time[j][0] = 0;
          end_time[j][0] = 0;
        } else {
          num++;
          start_time[j][num] = arr[j].indexOf(0, i)
          end_time[j][num] = arr[j].indexOf(0, i)
          i = arr[j].indexOf(0, i);
        }
      }
    }
    let length;
    for (let time_i = 0; time_i < 7; time_i++) {
      for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
        if (end_time[time_i][time_j]) {
          length = time_format.length;
          if (length > 0) {
            let is_exist = 0;
            for (let time_format_i = 0; time_format_i < length; time_format_i++) {
              if (start_time[time_i][time_j] == time_format[time_format_i].start_time && end_time[time_i][time_j] == time_format[time_format_i].end_time) {
                time_format[time_format_i].week.push(time_i);
                is_exist = 1;
              }
            }
            if (is_exist == 0) {
              time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
            }
          } else {
            time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
          }
        }
      }
    }
    // l_dom_set_out_time_box.innerHTML = "<div id='set_time_box'></div>"
    for (let k = 0; k < time_format.length; k++) {
      let week = "";
      let week_num = '';
      for (let m = 0; m < time_format[k].week.length; m++) {
        if (time_format[k].week[m] == 0) {
          week += mcs_Sunday_and + "、";
          week_num += time_format[k].week[m] + ".";
        } else if (time_format[k].week[m] == 1) {
          week += mcs_Monday_and + "、";
          week_num += time_format[k].week[m] + ".";
        } else if (time_format[k].week[m] == 2) {
          week += mcs_Tuesday_and + "、";
          week_num += time_format[k].week[m] + ".";
        } else if (time_format[k].week[m] == 3) {
          week += mcs_Wednesday_and + "、";
          week_num += time_format[k].week[m] + ".";
        } else if (time_format[k].week[m] == 4) {
          week += mcs_Thursday_and + "、";
          week_num += time_format[k].week[m] + ".";
        } else if (time_format[k].week[m] == 5) {
          week += mcs_Friday_and + "、";
          week_num += time_format[k].week[m] + ".";
        } else if (time_format[k].week[m] == 6) {
          week += mcs_Saturday_and + "、";
          week_num += time_format[k].week[m] + ".";
        }
      }
      week = week.substring(0, week.length - 1)
      week_num = week_num.substring(0, week_num.length - 1)

      let classname = '';
      // if (k == time_format.length - 1) {
      //   classname = 'time_menu_list_last';
      // } else {
      //   classname = 'time_menu_list';
      // }
      l_dom_set_out_time_box.innerHTML +=
        "<div class='" + classname + " selsect_set_time_btn' index='" + k + "' time='" + time_format[k].start_time + "_" + time_format[k].end_time + "_" + week_num + "'>"
        + "<div class='time_list_name'>"
        + "<div class='time_list_name_title record_padding'>" + time_format[k].start_time + ":00 - " + time_format[k].end_time + ":00</div>"
        + "<div class='time_list_name_tips'>" + week + "</div>"
        + "</div>"
        + "<div class='list_info'>"
        + "<div class='right_arrow'></div>"
        + "</div>"
        + "</div>";
      day_list.push({ start: time_format[k].start_time, end: time_format[k].end_time, week: week });
    }
    let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.selsect_set_time_btn');
    for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
      l_dom_selsect_set_time_btn[n].onclick = function () {
        _this.g_is_add = "false";
        let time = this.getAttribute('time');
        index = this.getAttribute('index');
        _this.g_set_out_time = time;
        // console.log("从此处进入set_time")
        record_set_time();
      }
    }
      function record_set_time () {
        // console.log("进入set_time")
        _this.native_can_back= true;
        g_aa_data = g_total_data;
        let flag = true;
        let repeat = false;
        let start_time = '00';
        let end_time = '24';
        let old_start_time = '00';
        let old_end_time = "00";
        let old_week = "";
        let week = '';
        let tmp_data = '';
        let week_new = []; //保存选中哪些日期值
        if (g_set_old_out_time == "" && _this.g_is_add == "false") {
          g_set_old_out_time = _this.g_set_out_time;
          old_start_time = g_set_old_out_time.split("_")[0];
          old_end_time = g_set_old_out_time.split("_")[1];
          old_week = g_set_old_out_time.split("_")[2].split(".");
        }
        if (g_set_old_out_time != "" && _this.g_is_add == "false") {
          old_start_time = g_set_old_out_time.split("_")[0];
          old_end_time = g_set_old_out_time.split("_")[1];
          old_week = g_set_old_out_time.split("_")[2].split(".");
        }
        if (_this.g_set_out_time) {
          let set_time_out_data = _this.g_set_out_time.split("_");
          start_time = set_time_out_data[0] >= 10 ? set_time_out_data[0] : "0" + set_time_out_data[0];
          end_time = set_time_out_data[1] >= 10 ? set_time_out_data[1] : "0" + set_time_out_data[1];
          week = set_time_out_data[2] ? set_time_out_data[2].split(".") : [];
        }
        //add default time
        if (_this.g_is_add == "true") {
          week = [0, 1, 2, 3, 4, 5, 6]
        }

        let temp = eval(g_week_w);
        if (temp.length == 7) {
          let j = 0;
          for (let i = 0; i < temp.length; i++) {
            if (temp[i]) {
              week_new[j] = i;
              j++;
            }
          }
        }
        _this.publicFunc.mx("#add_device_page").innerHTML =
          "<div id='attachmen_box'>"
          + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div><div id='delete_set_record'>" + mcs_delete + "</div></div>"
          + "<div id='set_time_main_page'>"
          + "<div class='set_time_list set_starttime_list'>"
          + "<div class='set_time_list_left record_padding'>" + mcs_begin_time + "</div>"
          + "<div class='set_time_list_right record_padding' id='start_time'>" + start_time + ":00</div>"
          + "</div>"

          + "<div style='height:2rem;background:#EFEFF4'></div>"
          + "<div class='set_time_list set_endtime_list'>"
          + "<div class='set_time_list_left record_padding'>" + mcs_end_time + "</div>"
          + "<div class='set_time_list_right record_padding' id='end_time'>" + end_time + ":00</div>"
          + "</div>"
          + "<div class='select_time_box' id='datePlugin' style='visibility:hidden'>"
          + "</div>"
          + "<div class='select_week_box' id='click_arrow' style='overflow:hidden;width:660px;margin-top:30px;'>"
          + "<div style='margin-left:1rem;float:left'>" + mcs_repeat + "</div>"
          + "<div class='week_Box' style='float:right;width:400px;'>"
          + "<div class='week_list' id='week0'>" + mcs_Sunday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div class='week_list' id='week1'>" + mcs_Monday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div class='week_list' id='week2'>" + mcs_Tuesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div class='week_list' id='week3'>" + mcs_Wednesday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div class='week_list' id='week4'>" + mcs_Thursday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div class='week_list' id='week5'>" + mcs_Friday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div class='week_list' id='week6'>" + mcs_Saturday_and + "<span class='dian_tip'>" + "、" + "</span>" + "</div>"
          + "<div id='click_arrow' class='right_arrow' style='margin-right:1.2rem;float:right'></div>"
          + "</div>"

          + "</div>"
          + "</div>"
          + "</div>"
        //        +"<div id='set_time_submit_btn' class='set_submit_btn'>"+mcs_ok+"</div>"
        //        +"<div id='set_time_del_btn' class='set_del_btn'>"+mcs_delete+"</div>";


        _this.publicFunc.mx("#click_arrow").onclick = function () {
          if (temp.length != 0) {
            _this.g_select_week = week_select;
          } else {
            _this.g_select_week = old_week_select;
          }
          let time = parseInt(_this.publicFunc.mx("#start_time").innerHTML) + "_" + parseInt(_this.publicFunc.mx("#end_time").innerHTML) + "_";
          for (let i = 0; i < _this.g_select_week.length; i++) {
            if (_this.g_select_week[i] == 1) {
              time += i + "."
            }
          }
          time.substring(0, time.length - 1)
          _this.g_set_out_time = time;
          compile_week();
        }

        let week_select = [0, 0, 0, 0, 0, 0, 0];
        let old_week_select = [0, 0, 0, 0, 0, 0, 0];

        if (temp.length !== 0) {
          week_select = temp;
        }

        function stringToHex (data) {
          let val = "", arr = [], arr0 = [];
          for (let i = 0; i < data.length; i++) {
            val = parseInt(data[i], 2).toString(16);
            arr[i] = val;
          }
          for (let j = 0; j < data.length; j++) {
            arr0[j] = 0xff & ("0x" + arr[j]);
          }
          return arr0;
        }


        function set_time_event () {
          $("#start_time").date({ theme: "datetime", h: start_time });
          $("#end_time").date({ theme: "datetime", h: end_time });
          $("#start_time").click(function () {
            $("#start_time").addClass('start_time_active');
            $("#datePlugin").css("visibility", "visible");
          })

          $("#end_time").click(function () {
            $("#start_time").addClass('start_time_active');
            $("#datePlugin").css("visibility", "visible");
          })
          let l_dom_week_list = _this.publicFunc.mx(".week_list");
          for (let i = 0; i < l_dom_week_list.length; i++) {
            // let is_has = $(this).hasClass("week_list_active");
            l_dom_week_list[i].index = i;
            for (let h = 0; h < week_new.length; h++) {
              if (i == week_new[h]) {
                let id_week = "#week" + i;
                $(id_week).css("display", "block");
                if (h == week_new.length - 1) {
                  $(id_week).find(".dian_tip").css("display", "none");
                }
              }
            }
            for (let j = 0; j < week.length; j++) {
              if (week_new.length !== 0) {
                continue;
              }
              if (i == week[j]) {
                old_week_select[i] = 1;
                let id_week = "#week" + i;
                $(id_week).css("display", "block");
                if (j == week.length - 1) {
                  $(id_week).find(".dian_tip").css("display", "none");
                }
              }
            }
          }

          if (temp.length != 0) {
            let y = temp;
            for (let i = 0; i < l_dom_week_list.length; i++) {
              for (let j = 0; j < week.length; j++) {
                if (i == week[j]) {
                  old_week_select[i] = 1;
                }
                week_select[i] = y[i];
              }
            }
          } else {
            for (let i = 0; i < l_dom_week_list.length; i++) {
              for (let j = 0; j < week.length; j++) {
                if (i == week[j]) {
                  old_week_select[i] = 1;
                  week_select[i] = 1;
                }
              }
            }
          }
          function set_time_func (type) {
            repeat = false;
            let index = -1;
            let time_select = [];
            let start_time = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
            let end_time = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
            let new_time_select = [];
            if (start_time >= end_time) {
              repeat = true;
              flag = false;
              _this.publicFunc.msg_tips({ msg: mcs_start_time_is_greater, type: "error", timeout: 3000 })
              return;
            }
            flag = true;
            for (let i = 0; i < week_select.length; i++) {
              if (week_select[i]) {
                for (let j = 0; j < 24; j++) {
                  if (j % 8 == 0) {
                    tmp_data = "";
                    index++;
                  }
                  if (j >= start_time && j < end_time) {
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
            function get_select_time (g_total_data) {
              if (g_total_data != "") {
                let l_data_2 = mcodec.b64_2_binary(g_total_data, 1), str = "", arr = [], arr2 = [], arr_tmp = [];
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
                  if (_this.g_is_add == "false") {
                    for (let i = 0; i < old_week.length; i++) {
                      let arr_all = "";
                      let arr_all_arr = [];
                      let arr1 = "", arr2 = "", arr3 = "";
                      for (let j = 0; j < 3; j++) {
                        arr_all += arr[old_week[i] * 3 + j].split("").reverse().join("");
                      }
                      arr_all_arr = arr_all.split("");
                      for (let m = parseInt(old_start_time); m < parseInt(old_end_time); m++) {
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
                      arr[old_week[i] * 3] = arr1.split("").reverse().join("");
                      arr[old_week[i] * 3 + 1] = arr2.split("").reverse().join("");
                      arr[old_week[i] * 3 + 2] = arr3.split("").reverse().join("");
                    }
                  }
                  let select = [];
                  if (_this.g_is_add == "false") {
                    for (let i = 0; i < week_select.length; i++) {
                      if (week_select[i] == 1) {
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
                  g_total_data = l_data_64
                  g_aa_data = l_data_64;
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
                  g_total_data = l_data_64
                  g_aa_data = l_data_64;
                }
              }
            }//get_select_time
            get_select_time(g_total_data)
          }//set_time_func
          let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");

          l_dom_record_back_box.onclick = function () { //设置完时间，返回到允许录像开关页面
            let arr = "";
            if (week_select[0] == 1) {
              arr += mcs_Sunday_and + "、";
            }
            if (week_select[1] == 1) {
              arr += mcs_Monday_and + "、";
            }
            if (week_select[2] == 1) {
              arr += mcs_Tuesday_and + "、";
            }
            if (week_select[3] == 1) {
              arr += mcs_Wednesday_and + "、";
            }
            if (week_select[4] == 1) {
              arr += mcs_Thursday_and + "、";
            }
            if (week_select[5] == 1) {
              arr += mcs_Friday_and + "、";
            }
            if (week_select[6] == 1) {
              arr += mcs_Saturday_and + "、";
            }
            arr = arr.substring(0, arr.length - 1);
            set_time_func("submit");
            if (!flag) {
              return;
            }
            if (_this.g_is_add == "false") {
              day_list[index].start = parseInt(_this.publicFunc.mx("#start_time").innerHTML);
              day_list[index].end = parseInt(_this.publicFunc.mx("#end_time").innerHTML);
              day_list[index].week = arr;
            } else {
              day_list.push({ start: parseInt(_this.publicFunc.mx("#start_time").innerHTML), end: parseInt(_this.publicFunc.mx("#end_time").innerHTML), week: arr })
            }
            if (!repeat) {
              g_set_old_out_time = "";
              _this.g_set_out_time = "";
              g_week_w = [];
              g_total_data = g_aa_data;
              create_set_record_page(1);
            }
          }

          _this.publicFunc.mx("#delete_set_record").onclick = function () { //设置完时间日期页面点击删除
            let arr;// eslint-disable-line no-unused-vars
            if (week_select[0] == 1) {
              arr += mcs_Sunday_and + "、";
            }
            if (week_select[1] == 1) {
              arr += mcs_Monday_and + "、";
            }
            if (week_select[2] == 1) {
              arr += mcs_Tuesday_and + "、";
            }
            if (week_select[3] == 1) {
              arr += mcs_Wednesday_and + "、";
            }
            if (week_select[4] == 1) {
              arr += mcs_Thursday_and + "、";
            }
            if (week_select[5] == 1) {
              arr += mcs_Friday_and + "、";
            }
            if (week_select[6] == 1) {
              arr += mcs_Saturday_and + "、";
            }
            arr = arr.substring(0, arr.length - 1);
            if (_this.g_is_add == "false") {
              day_list.splice(index, 1);
            } else {
              create_set_record_page();
              return;
            }
            set_time_func("del");
            if (!repeat) {
              g_set_old_out_time = "";
              g_total_data = g_aa_data;
              create_set_record_page();
            }
          }
        }//set_time_event

        set_time_event();
      }//record_set_time
    function create_set_record_page (repeat_page) { //允许录像设置开关时间页面
      // console.log("enter create_set_record_page")
      let set_record_alarm_title, set_record_alarm_content;
      _this.record_flag_out = 'true';
      set_record_alarm_title = mcs_Allow_record;
      let set_record_alarm_allow_title = mcs_Allow_record_schedule;
      if (g_accessory_type == 1) { //移动侦测
        set_record_alarm_content = mcs_move_record_new_detail;
      } else if (g_accessory_type == 5) {
        set_record_alarm_content = mcs_sos_record_detail;
      } else if (g_accessory_type == 6) {
        set_record_alarm_content = mcs_door_record_detail;
      } else if (g_accessory_type == 8) {
        set_record_alarm_content = mcs_move_record_detail;
      } else if (g_accessory_type == 9) {
        set_record_alarm_content = mcs_move_record_detail;
      } else if (g_accessory_type == "") {
        set_record_alarm_content = mcs_continuous_recording_hint;
      }
      $("#add_device_page").show();
      _this.publicFunc.mx("#add_device_page").innerHTML =
        "<div id='attachmen_box'>"
        + "<div id='attachmen_box_close'></div>"
        + "<div class='set_main_page_alarm'>"
        + "<div class='menu_list_box'>" //允许录像和开关
        + "<div class='menu_list record_allow'>"
        + "<div class='list_name record_padding'>" + set_record_alarm_title + "</div>"  //set_record_alarm_title
        + "<div class='list_info record_padding'><div id='at_home_btn'></div></div>"
        + "</div>"
        + "</div>"
        + "<div class='menu_list_box_title2 record_background'>" + set_record_alarm_content + "</div>" //set_record_alarm_content

        + "<div class='margin'>" //设置时间
        + "<div class='set_alarm_time_word' style='display:none;'>" + set_record_alarm_allow_title + "</div>" //set_record_alarm_allow_title
        + "<div class='menu_list_box' id='hide_timebox' style='display:none'>"
        + "<div id='set_out_time_box'></div>"
        + "<div class='time_menu_list_add' id='set_time_add'><div class='set_time_add'></div></div>"
        + "</div>"
        + "</div>"
        + "<div class='menu_list_apply' id='submit_apply'>" + mcs_apply + "</div>"
        + "</div>"
        + "</div>"
      let l_dom_attachmen_box_close = _this.publicFunc.mx("#attachmen_box_close");
      l_dom_attachmen_box_close.onclick = function () {
        _this.record_flag(time_format, day_list)
        if (_this.g_show == "true") {
          _this.publicFunc.delete_tips({
            content: mcs_is_save_hint, func: function () {
              $("#add_device_page").css('display', 'none');
              _this.create_right_page({ type: 'record', dom: _this.publicFunc.mx("#create_setting_page_right") })
            }
          })
        } else {
          _this.create_right_page({ type: 'record', dom: _this.publicFunc.mx("#create_setting_page_right") });
          $("#add_device_page").css('display', 'none');
        }
      }
      let data, l_scene_data_out, l_scene_data_active;
      let req_data;
      $("#at_home_btn").switchBtn();

      _this.publicFunc.mx("#set_time_add").onclick = function () {
        _this.g_set_out_time = "";
        _this.g_is_add = "true";
        record_set_time();
      }
      function record_set_event () {
        let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
        for (let i = 0; i < l_scene_data_out.dev.length; i++) {
          if (l_scene_data_out.dev[i].id == g_accessory_sn) {
            if (at_home_type == "true") {
              //away
              req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
              req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video
              $("#hide_timebox").show();
              $(".set_alarm_time_word").show();
            } else {
              //away
              req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag & 0x5; //off video
              req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag & 0x5; //off video
              $("#hide_timebox").hide();
              $(".set_alarm_time_word").hide();
            }
          }
        }
      } //record_set_event 
      function set_plan_record () { //允许录像开关
        let at_home_type = _this.publicFunc.mx("#at_home_btn").getAttribute("type");
        if (at_home_type == "true") {
          req_data.info.scene[2].flag = 0;
          req_data.info.scene[1].flag = 1;
          $("#hide_timebox").show();
          $(".set_alarm_time_word").show();
        } else {
          req_data.info.scene[2].flag = 0;
          req_data.info.scene[1].flag = 0;
          $("#hide_timebox").hide();
          $(".set_alarm_time_word").hide();
        }
      }

      function get_scene_ack (msg) {
        let scene_data;
        g_total_type = msg;
        _this.publicFunc.closeBufferPage()
        if (msg && msg.result == "") {
          data = msg;
          for (let i = 0; i < msg.data.info.scene.length; i++) {
            scene_data = msg.data.info.scene[i];
            if (scene_data.name == "out") {
              l_scene_data_out = msg.data.info.scene[i];
              if (g_accessory_sn) {
                for (let j = 0; j < scene_data.dev.length; j++) {
                  if (scene_data.dev[j].id == g_accessory_sn) {
                    if (repeat_page !== 1) {
                      if (scene_data.dev[j].flag & 0x2) {
                        $("#at_home_btn").switchBtn(true, "", "", record_set_event);
                        $("#hide_timebox").show();
                        $(".set_alarm_time_word").show();
                      } else {
                        $("#at_home_btn").switchBtn(false, "", "", record_set_event);
                        $("#hide_timebox").hide();
                        $(".set_alarm_time_word").hide();
                      }
                    } else {
                      $("#at_home_btn").switchBtn(true, "", "", record_set_event);
                      $("#hide_timebox").show();
                      $(".set_alarm_time_word").show();
                    }

                  }
                }
              } else {
                if (repeat_page !== 1) { //标记是第一次打开create_set_record_page页面，还是设置完时间返回的页面
                  if (scene_data.flag) {
                    $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                    $("#hide_timebox").show();
                    $(".set_alarm_time_word").show();
                  } else {
                    $("#at_home_btn").switchBtn(false, "", "", set_plan_record);
                    $("#hide_timebox").hide();
                  }
                } else {
                  $("#at_home_btn").switchBtn(true, "", "", set_plan_record);
                  $("#hide_timebox").show();
                  $(".set_alarm_time_word").show();
                }

              }
            } else if (scene_data.name == "in") {
              l_scene_data_active = msg.data.info.scene[i];
            }
          }
          req_data = {
            sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1,
            info: {
              select: data.data.info.select,
              scene: [{ name: "auto", flag: 0 },
              {
                name: "out",
                flag: l_scene_data_out.flag,
                dev: l_scene_data_out.dev
    },
              {
                name: "in",
                flag: l_scene_data_active.flag,
                dev: l_scene_data_active.dev
              }]
            },
            func: function () {//msg
              //_this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
            }
          }
          if (repeat_page == 1) { //解决点击应用，开关值显示开，请求参数没改bug，最后开关还是关
            if (g_accessory_sn) {
              for (let i = 0; i < l_scene_data_out.dev.length; i++) {
                if (l_scene_data_out.dev[i].id == g_accessory_sn) {
                  req_data.info.scene[1].dev[i].flag = l_scene_data_out.dev[i].flag | 0x2; //on video
                  req_data.info.scene[2].dev[i].flag = l_scene_data_active.dev[i].flag | 0x2; //on video         
                }
              }
            } else {
              req_data.info.scene[2].flag = 0;
              req_data.info.scene[1].flag = 1;
            }
          }
        }
      }//get_scene_ack 


      // function get_scene(msg){  
      //  let scene_data;
      //  $("#buffer_page").hide();
      //  if(msg&&msg.result==""){
      //       data = msg;
      //  for(let i=0;i<msg.data.info.scene.length;i++){
      //    scene_data = msg.data.info.scene[i];
      //    if(scene_data.name=="out"){
      //    l_scene_data_out = msg.data.info.scene[i];
      //        if(g_accessory_sn){ 
      //            for(let j=0;j<scene_data.dev.length;j++){
      //                if(scene_data.dev[j].id==g_accessory_sn){
      //                  if(scene_data.dev[j].flag&0x2){
      //                      $("#at_home_btn").switchBtn(true,"","",record_set_event);
      //                      $("#hide_timebox").show();
      //                      $(".set_alarm_time_word").show();
      //                  }else{
      //                      $("#at_home_btn").switchBtn(false,"","",record_set_event);
      //                      $("#hide_timebox").hide();
      //                      $(".set_alarm_time_word").hide();
      //                  }
      //                }
      //            }
      //        }else{
      //          if(scene_data.flag){
      //              $("#at_home_btn").switchBtn(true,"","",set_plan_record);
      //              $("#hide_timebox").show();
      //              $(".set_alarm_time_word").show();
      //          }else{
      //              $("#at_home_btn").switchBtn(false,"","",set_plan_record);
      //              $("#hide_timebox").hide();
      //          }
      //        }
      //      }else if(scene_data.name=="in"){
      //                l_scene_data_active = msg.data.info.scene[i];
      //      }
      //  }
      //  req_data = {
      //    sn: _this.$store.state.jumpPageData.selectDeviceIpc, all: 1,
      //    info: {
      //      select: data.data.info.select,
      //      scene: [{name: "auto", flag: 0},
      //      {
      //        name: "out",
      //        flag: l_scene_data_out.flag,
      //        dev: l_scene_data_out.dev
      //      },
      //      {
      //        name: "in",
      //        flag: l_scene_data_active.flag,
      //        dev: l_scene_data_active.dev
      //      }]
      //    },
      //    func:function(msg){
      //  //                    _this.publicFunc.msg_tips({msg:msg.msg, type:msg.type, timeout:3000});
      //  }

      //  }
      //  } 
      // }

      // $("#buffer_page").show();
      // 展示遮罩层
      _this.publicFunc.showBufferPage()
      _this.$api.set.scene_get({ //页面一上来从接口取得值渲染开关页面
        sn: _this.$store.state.jumpPageData.selectDeviceIpc
      }).then(res => {
        get_scene_ack(res)
      })
      let l_dom_set_out_time_box = _this.publicFunc.mx("#set_out_time_box");

      if (g_total_data != "") {      //根据设置的时间日期值渲染开关页面
        schedule_get(g_total_data);
      } else {
        //获取跟设置的时间请求，页面一上来从接口取得值渲染开关页面
        _this.$api.set.schedule_get({
          sn: _this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res => {
          schedule_get_ack(res)
        })
      }

      function schedule_get () { //设置完时间日期 点返回走的函数 (g_data)
        if (day_list.length != 0) {
          for (let i = 0; i < day_list.length; i++) {
            let classname = '';
            if (i == day_list.length - 1) {
              classname = 'time_menu_list_last';
            } else {
              classname = 'time_menu_list';
            }
            l_dom_set_out_time_box.innerHTML +=
              "<div class='" + classname + " select_set_time_btn' index='" + i + "' time='" + day_list[i].start + "_" + day_list[i].end + "_" + day_list[i].week + "'>"
              + "<div class='time_list_name'>"
              + "<div class='time_list_name_title record_padding'>" + day_list[i].start + ":00 - " + day_list[i].end + ":00</div>"
              + "<div class='time_list_name_tips'>" + day_list[i].week + "</div>"
              + "</div>"
              + "<div class='list_info'>"
              + "<div class='right_arrow'></div>"
              + "</div>"
              + "</div>";
          }
          let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.select_set_time_btn');
          for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
            l_dom_selsect_set_time_btn[n].onclick = function () {
              _this.g_is_add = "false";
              let time = this.getAttribute('time');
              index = this.getAttribute('index');
              let arr = "";
              if (time.split("_")[2].indexOf(mcs_Sunday_and) != -1) {
                arr += "0."
              }
              if (time.split("_")[2].indexOf(mcs_Monday_and) != -1) {
                arr += "1."
              }
              if (time.split("_")[2].indexOf(mcs_Tuesday_and) != -1) {
                arr += "2."
              }
              if (time.split("_")[2].indexOf(mcs_Wednesday_and) != -1) {
                arr += "3."
              }
              if (time.split("_")[2].indexOf(mcs_Thursday_and) != -1) {
                arr += "4."
              }
              if (time.split("_")[2].indexOf(mcs_Friday_and) != -1) {
                arr += "5."
              }
              if (time.split("_")[2].indexOf(mcs_Saturday_and) != -1) {
                arr += "6."
              }
              arr = arr.substring(0, arr.length - 1);
              _this.g_set_out_time = day_list[index].start + "_" + day_list[index].end + "_" + arr;
              record_set_time();
            }
          }
        }
      }//schedule_get

      function schedule_time_format (arr) {
        let start_time = [], end_time = [];
        for (let j = 0; j < arr.length; j++) {
          let num = -1;
          start_time[j] = [];
          end_time[j] = [];
          for (let i = -1; i < arr[j].length;) {
            if (arr[j].indexOf(0, i) == i && i != -1) {
              i++;
              end_time[j][num]++;
            } else if (arr[j].indexOf(0, i) < 0 && i > 0) {
              i = arr[j].length;
            } else if (arr[j].indexOf(0, i) < 0 && i <= 0) {
              i = arr[j].length;
              start_time[j][0] = 0;
              end_time[j][0] = 0;
            } else {
              num++;
              start_time[j][num] = arr[j].indexOf(0, i)
              end_time[j][num] = arr[j].indexOf(0, i)
              i = arr[j].indexOf(0, i);
            }
          }
        }
        let length;
        for (let time_i = 0; time_i < 7; time_i++) {
          for (let time_j = 0; time_j < start_time[time_i].length; time_j++) {
            if (end_time[time_i][time_j]) {
              length = time_format.length;
              if (length > 0) {
                let is_exist = 0;
                for (let time_format_i = 0; time_format_i < length; time_format_i++) {
                  if (start_time[time_i][time_j] == time_format[time_format_i].start_time && end_time[time_i][time_j] == time_format[time_format_i].end_time) {
                    time_format[time_format_i].week.push(time_i);
                    is_exist = 1;
                  }
                }
                if (is_exist == 0) {
                  time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
                }
              } else {
                time_format.push({ start_time: start_time[time_i][time_j], end_time: end_time[time_i][time_j], week: [time_i] })
              }
            }
          }
        }
        // l_dom_set_out_time_box.innerHTML = "<div id='set_time_box'></div>"
        for (let k = 0; k < time_format.length; k++) {
          let week = "";
          let week_num = '';
          for (let m = 0; m < time_format[k].week.length; m++) {
            if (time_format[k].week[m] == 0) {
              week += mcs_Sunday_and + "、";
              week_num += time_format[k].week[m] + ".";
            } else if (time_format[k].week[m] == 1) {
              week += mcs_Monday_and + "、";
              week_num += time_format[k].week[m] + ".";
            } else if (time_format[k].week[m] == 2) {
              week += mcs_Tuesday_and + "、";
              week_num += time_format[k].week[m] + ".";
            } else if (time_format[k].week[m] == 3) {
              week += mcs_Wednesday_and + "、";
              week_num += time_format[k].week[m] + ".";
            } else if (time_format[k].week[m] == 4) {
              week += mcs_Thursday_and + "、";
              week_num += time_format[k].week[m] + ".";
            } else if (time_format[k].week[m] == 5) {
              week += mcs_Friday_and + "、";
              week_num += time_format[k].week[m] + ".";
            } else if (time_format[k].week[m] == 6) {
              week += mcs_Saturday_and + "、";
              week_num += time_format[k].week[m] + ".";
            }
          }
          week = week.substring(0, week.length - 1)
          week_num = week_num.substring(0, week_num.length - 1)

          let classname = '';
          // if (k == time_format.length - 1) {
          //   classname = 'time_menu_list_last';
          // } else {
          //   classname = 'time_menu_list';
          // }
          l_dom_set_out_time_box.innerHTML +=
            "<div class='" + classname + " selsect_set_time_btn' index='" + k + "' time='" + time_format[k].start_time + "_" + time_format[k].end_time + "_" + week_num + "'>"
            + "<div class='time_list_name'>"
            + "<div class='time_list_name_title record_padding'>" + time_format[k].start_time + ":00 - " + time_format[k].end_time + ":00</div>"
            + "<div class='time_list_name_tips'>" + week + "</div>"
            + "</div>"
            + "<div class='list_info'>"
            + "<div class='right_arrow'></div>"
            + "</div>"
            + "</div>";
          day_list.push({ start: time_format[k].start_time, end: time_format[k].end_time, week: week });
        }
        let l_dom_selsect_set_time_btn = _this.publicFunc.mx('.selsect_set_time_btn');
        for (let n = 0; n < l_dom_selsect_set_time_btn.length; n++) {
          l_dom_selsect_set_time_btn[n].onclick = function () {
            _this.g_is_add = "false";
            let time = this.getAttribute('time');
            index = this.getAttribute('index');
            _this.g_set_out_time = time;
            // console.log("从此处进入set_time")
            record_set_time();
          }
        }
      }//schedule_time_format

      _this.publicFunc.mx("#submit_apply").onclick = function () { //点击应用
        _this.record_flag_out = "false";
        _this.g_show = 'false';
        _this.$api.set.schedule_set({
          sn: _this.$store.state.jumpPageData.selectDeviceIpc,
          sch: {
            degree: 3600,
            schedule: g_total_data
          }
        }).then(res => {
          if (res && res.result === "") {
            _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
          } else if (res.result === "permission.denied") {
            _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
          } else {
            _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 });
          }
        req_data.info.scene[2].flag = 0;
        req_data.info.scene[2].dev[0].flag = 0;
        _this.$api.set.scene_set(req_data)
        })
      }

    }//create_set_record_page  
    function compile_week () {
      let week_select = _this.g_select_week.slice();
      $("add_device_page").show();
      _this.publicFunc.mx("#add_device_page").innerHTML =
        "<div id='attachmen_box'>"
        + "<div class='record_box_top'><div id='record_back_box' class='record_back'><div id='record_return_img'></div><div class='record_back'>" + mcs_back + "</div></div><div class='record_edit_time'>" + mcs_edit_time + "</div></div>"
        + "<div id='set_time_main_page'>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Sunday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Monday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Tuesday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Wednesday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Thursday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Friday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "<div class='set_week'>"
        + "<div class='week_every'>" + mcs_Saturday_and + "</div>"
        + "<div class='week_every_imgbox'><div class='list_info_select list_info_select_img'></div></div>"
        + "</div>"
        + "</div>"
        + "</div>"

      let l_dom_record_back_box = _this.publicFunc.mx("#record_back_box");
      let l_dom_set_week_list = _this.publicFunc.mx(".set_week");
      for (let i = 0; i < l_dom_set_week_list.length; i++) {
        l_dom_set_week_list[i].index = i;
        l_dom_set_week_list[i].onclick = function () {
          if ($(this).find(".list_info_select").hasClass("list_info_select_img")) {
            week_select[this.index] = 1;
            $(this).find(".list_info_select").removeClass('list_info_select_img').addClass('list_info_clickselect_img')
          } else {
            week_select[this.index] = 0;
            $(this).find(".list_info_select").removeClass('list_info_clickselect_img').addClass('list_info_select_img')
          }
          for (let i = 0; i < week_select.length; i++) {
            if (week_select[i] == 1) {
              g_week_w = "[" + week_select.join() + "]";
              return;
            }
          }
          _this.native_can_back= false;
        }
      }
      for (let i = 0; i < week_select.length; i++) {
        if (week_select[i]) {
          l_dom_set_week_list[i].click();
        }
      }
      l_dom_record_back_box.onclick = function () {  //设置完星期返回到时间设置页面
        if (week_select.indexOf(1) == -1) {
          $(".time_select_tips").show();
          setTimeout("$('.time_select_tips').hide();", 3000)
        } else {
          record_set_time();
        }
      }
    }//compile_week
  }//schedule_time_format
    },
    // ************************************* 联动框架公共函数 ************************************* //
    // 创建设置列表接口 回调至创建列表函数
    set_result (data) { // 设置结果反馈函数
      let _this = this
      _this.publicFunc.msg_tips({ msg: data.msg, type: data.type, timeout: 3000 })
      // 调用创建设置列表方法,用于刷新左侧内容的改变(无论成功还是失败都会进行重载)
      if (_this.publicFunc.mx("#create_setting_page_left")) {
        _this.publicFunc.mx("#create_setting_page_left").innerHTML = null // 清空左侧选项列表 防止重复
      }
      _this.$api.set.set_list_get({ flag: _this.obj.type, sn: _this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
        $('#add_device_page').hide()
        _this.create_set_list(res)
      })
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
                  }
                  else {
                    tt[i] += 0
                  }
                })(i)
              }
              day_h[start_day] = tt.join('')
            }
          }
          else {
            if (item.action_name) {
              let t_s = day_h[start_day].split('').map(Number)
              let t_e = day_h[end_day].split('').map(Number)
              for (let i = 0; i < 25; i++) {
                (function (i) {
                  if (i >= start_h && i < 24) {
                    t_s[i] += add_flag
                  }
                  else {
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
                  }
                  else {
                    temp.push(0)
                  }
                }
                day_h[i] = temp.join('')
              }
              for (let i = 0; i < 25; i++) {
                (function (i) {
                  if (i < end_h) {
                    t_e[i] += add_flag
                  }
                  else {
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
        clock_temp.start_clock = item.start / 3600 % 24 < 10 ? "0" + item.start / 3600 % 24 + ":00" : item.start / 3600 % 24 + ":00"
        clock_temp.end_clock = item.end / 3600 % 24 == 0 ? "24:00" : item.end / 3600 % 24 < 10 ? "0" + item.end / 3600 % 24 + ":00" : item.end / 3600 % 24 + ":00"
        clock_temp.day_num = week_standard[parseInt(item.start / 3600 / 24)]
        //跨天处理 大于一天(分为刚好end_time为整数天或者不为整数天)
        if (parseInt(item.end / 3600 / 24) - parseInt(item.start / 3600 / 24) > 1) {
          if (parseInt(item.end / 3600 / 24) == item.end / 3600 / 24) {
            alarm_all_day_choose = week_standard.slice(parseInt(item.start / 3600 / 24) + 1, parseInt(item.end / 3600 / 24)).join("、")
            alarm_arr.push(
              { start_clock: clock_temp.start_clock, end_clock: "24:00", day_num: clock_temp.day_num },
              { start_clock: "00:00", end_clock: "24:00", day_num: alarm_all_day_choose }
            )
          } else {
            alarm_all_day_choose = week_standard.slice(parseInt(item.start / 3600 / 24) + 1, parseInt(item.end / 3600 / 24)).join("、")
            alarm_arr.push(
              { start_clock: clock_temp.start_clock, end_clock: "24:00", day_num: clock_temp.day_num },
              { start_clock: "00:00", end_clock: "24:00", day_num: alarm_all_day_choose },
              { start_clock: "00:00", end_clock: clock_temp.end_clock, day_num: week_standard[parseInt(item.end / 3600 / 24)] }
            )
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
      console.log(sche, 'sche_trans_to')
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
          }
          else {
            if (item[start_index] == item[indexs] && start_index != 24) {
              plan_info.push({ start: (start_index + index * 24) * 3600, end: (24 + index * 24) * 3600, flag: items, index: items == 0 ? 1 : 0, mode: '' })
            }
          }
        })
      })
      // console.log(plan_info)
      plan_final = plan_info.filter(function (item, index) {
        return item.start < item.end;
      })
      // console.log(plan_final)
      let plan_change_flag = plan_final[0].flag
      let plan_sel = []
      let j = 0
      for (let i = 0; i < plan_final.length; i++) {
        if (i == plan_final.length - 1) {
          if (j != 0) {
            plan_final[i].start = plan_final[i - j].start
            plan_sel.push(plan_final[i])
          }
          else {
            if (plan_sel[plan_sel.length - 1].flag == plan_final[i].flag) {
              plan_sel[plan_sel.length - 1].end = plan_final[i].end
            }
            else {
              plan_sel.push(plan_final[i])
            }
          }
        }
        else {
          let plan_next = plan_final[i + 1]
          if (plan_change_flag != plan_next.flag) {
            plan_change_flag = plan_next.flag
            if (j == 0) {
              plan_sel.push(plan_final[i])
            }
            else {
              plan_final[i].start = plan_final[i - j].start
              plan_sel.push(plan_final[i])
              j = 0
            }

          }
          else {
            j++;
          }
        }
      }
      console.log(plan_sel, 'return_plan_sel')
      return plan_sel;
    },

    sche_add_action_name (sche, type) { // 计划表附带上动作
      let _this = this;
      let control_time = 0
      if (type == 1 || type == 8 || type == 9 || type == 10) {
        control_time = 8000
      }
      else {
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
      console.log(sche, 'sche_add_action_name')
      return sche;
    },

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

    alarm_timeArr_to_word (arr) {
      let week_standard = [mcs_Sunday_and, mcs_Monday_and, mcs_Tuesday_and, mcs_Wednesday_and, mcs_Thursday_and, mcs_Friday_and, mcs_Saturday_and]
      let day_str_temp = []
      let day_str = ""
      arr.forEach(function (item, index) {
        if (item == 1) {
          day_str_temp.push(week_standard[index])
        }
      })
      if (day_str_temp.length == 7) {
        day_str = mcs_every_day
      } else {
        day_str = day_str_temp.join("、")
      }
      return day_str;
    },

    record_flag (data1, data2) {
      let _this = this
      let a = 0, b = 0, c = 0, d = 0;
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
        _this.g_show = "false"
      } else {
        _this.g_show = "true"
      }
      if (_this.record_flag_out == "false") {
        _this.g_show = "false"
      }
      return _this.g_show;
    }

    // **************************************************************************************** //
  },
  async mounted () {
    import(`@/lib/plugins/jquery.tzSelect.js`)
    import(`@/lib/plugins/time_select.js`)
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    } else {
      pageData = { parent: $("#" + this.$route.name) }
    }
    // console.log(pageData,"pageData")
    await this.create_set_page(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    this.publicFunc.projectReload.call(this);
  }
}
</script>