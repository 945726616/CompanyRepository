<template>
  <div id="my"></div>
</template>
<script>
import mme from '@/util/mme.js'
export default {
  methods: {
    mipcMyPage (obj) {
      let _this = this;
      let feedback_url
      let g_now_lang = this.$store.state.user.userLanguage
      if (window.location.protocol == "https:") {
        feedback_url = 'https://js11.vimtag.com:12446/feedback/feedback.htm?hl=' + g_now_lang;
      } else {
        feedback_url = 'http://61.147.115.218:12180/feedback/feedback.htm?hl=' + g_now_lang;
      }
      obj.parent.html("<div id='set_main'>"
        + "<div id='set_left'>"
        + "<ul id='left_ul'>"
        + "<li class='set_list active_list'>"
        + "<div class='set_img' id='about'></div>"
        + "<div class='set_name'>" + mcs_software_version + "</div>"
        + "</li>"
        + "<li class='set_list'>"
        + "<div class='set_img' id='manage_password'></div>"
        + "<div class='set_name'>" + mcs_user_admin_password + "</div>"
        + "</li>"
        + "<li class='set_list'>"
        + "<div class='set_img' id='guest_password'></div>"
        + "<div class='set_name'>" + mcs_user_guest_password + "</div>"
        + "</li>"
        + "<li class='set_list'>"
        + "<div class='set_img' id='add_email'></div>"
        + "<div class='set_name'>" + mcs_binding_email + "</div>"
        + "</li>"
        + "<li class='set_list'>"
        + "<div class='set_img' id='feedback'></div>"
        + "<div class='set_name'>" + mcs_feedback + "</div>"
        + "</li>"
        + "<li class='set_list' id='sd_export_hide'>"
        + "<div class='set_img' id='sd_export'></div>"
        + "<div class='set_name'>" + mcs_export_sd_data + "</div>"
        + "</li>"
        + "<li class='set_list' style='display:none'>"
        + "<div class='set_img' id='error_log_commit'></div>"
        + "<div class='set_name'>错误诊断</div>"
        + "</li>"
        + "<li class='set_list' id='local_div_hide'>"
        + "<div class='set_img' id='local_devs'></div>"
        + "<div class='set_name' id='local_div'>" + mcs_local_device + "</div>"
        + "</li>"
        + "<li class='set_list'>"
        + "<div class='set_img' id='exit_btn_img'></div>"
        + "<div class='set_name' id='exit_btn'>" + mcs_exit + "</div>"
        + "</li>"
        + "</ul>"
        + "</div>"
        + "<div id='set_right'>"
        + "<div id='set_right_content'>"
        + "<div id='set_manage_password_page' class='set_page'>"
        + "<div id='mp_lable'>"
        + "<div class='mp_list'>"
        + "<div class='mp_title'>" + mcs_old_password + "</div>"
        + "<div class='mp_input'><input id='old_password' type='password' placeholder='" + mcs_input_password + "'></div>"
        + "<div class='mp_password_empty'>" + mcs_the_password_is_empty + "</div>"
        + "<div id='mp_updata_password_error'>" + mcs_invalid_password + "</div>"
        + "<div class='mp_empty'></div>"
        + "</div>"
        + "<div class='mp_list'>"
        + "<div class='mp_title'>" + mcs_input_new_pass + "</div>"
        + "<div class='mp_input'><input id='new_password' type='password' placeholder='" + mcs_input_new_pass + "'></div>"
        + "<div class='mp_password_empty'>" + mcs_the_password_is_empty + "</div>"
        + "<div class='mp_password_demand'>" + mcs_password_demand + "</div>"
        + "<div class='mp_password_inconsistent'>" + mcs_two_password_input_inconsistent + "</div>"
        + "<div class='mp_same_op'>" + mrs_new_password_setting_failed + "</div>"
        + "<div class='mp_empty'></div>"
        + "</div>"
        + "<div class='mp_list'>"
        + "<div class='mp_title'>" + mcs_confirm_password + "</div>"
        + "<div class='mp_input'><input id='new_password2' type='password' placeholder='" + mcs_confirm_password + "'></div>"
        + "<div id='mp_btn'>" + mcs_ok + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='mp_updata_password'>" + mcs_state_modify_pass_success + "</div>"
        + "</div>"
        + "<div id='set_guest_password_page' class='set_page'>"
        + "<div id='gp_lable'>"
        + "<div class='gp_list'>"
        + "<div class='gp_title'>" + mcs_admin_password + "</div>"
        + "<div class='gp_input'><input id='guest_pw' type='password' placeholder='" + mcs_admin_password + "'></div>"
        + "<div class='gp_password_empty'>" + mcs_the_password_is_empty + "</div>"
        + "<div id='gp_updata_password_error'>" + mcs_invalid_password + "</div>"
        + "<div class='gp_empty'></div>"
        + "</div>"
        + "<div class='gp_list'>"
        + "<div class='gp_title'>" + mcs_guest_password + "</div>"
        + "<div class='gp_input'><input id='guest_pw1' type='password' placeholder='" + mcs_guest_password + "'></div>"
        + "<div class='gp_password_empty'>" + mcs_the_password_is_empty + "</div>"
        + "<div class='gp_password_demand'>" + mcs_password_demand + "</div>"
        + "<div class='gp_password_inconsistent'>" + mcs_two_password_input_inconsistent + "</div>"
        + "<div class='gp_same_ap'>" + mrs_guest_password_setting_failed + "</div>"
        + "<div class='gp_empty'></div>"
        + "</div>"
        + "<div class='gp_list'>"
        + "<div class='gp_title'>" + mcs_confirm_password + "</div>"
        + "<div class='gp_input'><input id='guest_pw2' type='password' placeholder='" + mcs_confirm_password + "'></div>"
        + "<div id='gp_btn'>" + mcs_ok + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='gp_updata_password'>" + mcs_state_modify_pass_success + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='set_add_email_page' class='set_page'>"
        + "<div id='ae_lable'>"
        + "<div class='ae_list'>"
        + "<div class='ae_title'>" + mcs_email_address + "</div>"
        + "<div class='ae_input'><input id='email_addr' type='text' placeholder='" + mcs_email_address + "'></div>"
        + "<div id='ae_btn'>" + mcs_ok + "</div>"
        + "</div>"
        + "<div class='ae_list'>"
        + "<div class='ae_title'></div>"
        + "<div class='ae_tips'>" + mcs_binding_email_prompt + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='send_msg'>" + mcs_binding_send_prompt + "</div>"
        + "<div id='email_invalid'>" + mcs_invalid_email_addr + "</div>"
        + "<div id='ae_email_exist'>" + mcs_accounts_bind_email_exist + "</div>"
        + "<div id='ae_email_busy'>" + mcs_accounts_bind_email_busy + "</div>"
        + "<div id='ae_email_inactive' class='ae_email'>" + mcs_email_inactive + "</div>"
        + "</div>"
        + "<div id='set_feedback_page' class='set_page' style='display:none;'>"
        // + "<iframe style='display:block;' id='feedback_ifr' src='" + feedback_url + "'></iframe>"
        + "</div>"
        //sd export
        + "<div id='set_sd_export_page' class='set_page'>"
        + "<div id='export_success_icon'>Export success</div>"
        + "<div id='notice_content'>Please remove SD card in equipment, through the card reader connected to the computer, and then select the export path below, click on the export. The export process may be stuck, please do not close the program.Note: please don't formatted SD card</div>"
        + "<div id='progress_bar_div'>"
        + "<div id='progress_bar_box' style='display:none;'>"
        + "<div id='progress_bar'></div>"
        + "</div>"
        + "<span id='progress_bar_num'></span>"
        + "</div>"
        + "<div id='sd_export_box'>"
        + "<div id='sd_export_path'>"
        + "<div id='sd_export_path_show'></div>"
        + "<div id='sd_export_path_btn'>Select Path</div>"
        + "</div>"
        + "<div id='sd_export_submit'>Export data</div>"
        + "<div id='sd_export_submit_tip' style='float:left;margin-top:25px;margin-left:20px;'></div>"
        + "<div id='buffer_page'>"
        + "<div id='buffer_image'></div>"
        + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='set_error_log_commit_page' class='set_page' style='display:none'>"
        + "<div id='ec_lable'>"
        + "<div class='ec_list'>"
        + "<div class='ec_title'>App记录了近期的错误日志，请选择提交按钮上传错误日志，感谢您的配合！</div>"
        + "<div id='error_log_commit_btn' class='vim_log_btn'>提交</div>"
        + "<div id='error_log_commit_tip' style='float:left;margin-top:65px;margin-left:20px;color:#00A7BA;'></div>"
        + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='set_about_page' class='set_page'>"
        + "<div class='about_list'>"
        + "<div id='version_logo_img_mipc_new'></div>"
        + "<div id='about_title' class='about_title'>" + mcs_software_version + "</div>"
        + "<div class='about_input'>" + process.env.VUE_APP_VERSION  + "</div>"
        + "</div>"
        + "</div>"
        + "<div id='set_developer_option_page' class='set_page' style='display:none;'>"
        + "<form>"
        + "<p style='margin:10px 0 10px;'><input type='checkbox' name='tree_id' value='1' />&nbsp;&nbsp;Load Plugin</p>"
        + "<p style='margin:10px 0 10px;'><input type='checkbox' name='tree_id' value='2' />&nbsp;&nbsp;Load Peripherals</p>"
        + "<input type='button' value='OK' id='developer_ok' style='width:100px;height:34px;color:#ffffff;background-color:#0ea9bb;border:0;'/>"
        + "</form>"
        + "</div>"
        + "</div>"
        + "</div>"
        + "</div>")

      if (_this.$store.state.user.loginFlag) {
        _this.publicFunc.mx("#about").parentNode.style.display = "block";
        _this.publicFunc.mx("#exit_btn").parentNode.style.display = "block";
        _this.publicFunc.mx("#manage_password").parentNode.style.display = "block";
        _this.publicFunc.mx("#guest_password").parentNode.style.display = "block";
        _this.publicFunc.mx("#add_email").parentNode.style.display = "block";
      } else {
        _this.publicFunc.mx("#about").parentNode.style.display = "block";
      }
      $(document).ready(function () {
        _this.$options.methods.create_my_page.call(_this);
      })
    },
    create_my_page () {
      let _this = this
      let sd_is_export = 0;

      set_add_event();
      set_apply_btn_event();

      function set_add_event () {
        // console.log(_this)
        if (!_this.$store.state.jumpPageData.projectFlag) { // vimtag项目特有的鼠标滑过效果
          $(".set_list").mouseenter(function () {
            $(".set_list").removeClass("active_list");
            $(this).addClass("active_list");
          })
        }

        $(".set_list").click(function () { // 对功能菜单中的每一项绑定点击事件
          let id_name = $(this).children(".set_img").attr("id");
          //  console.log(id_name, 'id_name')
          $(".set_page").hide();
          $("#set_" + id_name + "_page").show();
          if (!_this.$store.state.jumpPageData.projectFlag) { // vimtag项目将会隐藏列表内容单独展示选项内容
            $("#set_left").hide();
            $("#my_page_box_back_manage").show();
          } else { // mipc系列会保留侧边栏,同时在右侧进行渲染选项内容
            $(".set_list").removeClass("active_list");
            $(this).addClass("active_list");
          }

          if (_this.publicFunc.mx("#set_add_email_page").style.display == "block") binding_accounts_info();
          // ********此处代码在当前项目中并未真正应用******** //
          if (id_name == "sd_export") {
            if (!sd_is_export) {
              let sd_exist = window.check_SDCard();
              if (sd_exist == 0) {
                _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
              } else {
                _this.publicFunc.mx("#sd_export_submit_tip").style.display = 'none';
                _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "<img src="+require('@/assets/device/add_loading.gif')+">";
                // 暂时将双项目的代码简单捏合
                if (location.href.indexOf("ebit") > -1) { // 判断页面是否为ebit
                  _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "<img src="+require('@/assets/mipc/ebit_loading.gif')+">";
                } else { // vshome/mipc
                  _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "<img src="+require('@/assets/mipc/mipc_loading.gif')+">";
                }
              }
            }
          }
          // ************************************************ //
          if (id_name == "feedback") { // 反馈
            let l_dom_feedback_type = _this.publicFunc.mx("#feedback_type");
            l_dom_feedback_type.onclick = function () {
              _this.publicFunc.mx("#add_device_page").innerHTML = "";
              $("#add_device_page").show(); //遮罩层
              $("#pb_select_sl").show();
            }
            $("ul#ul_id").on("click", "li", function () {
              $("#pb_select_sl").hide();
              $("#add_device_page").hide();
              l_dom_feedback_type.value = $(this).text();
            });

            let l_dom_feedback_upload_image = _this.publicFunc.mx("#upload_image");
            let l_dom_feedback_submit = _this.publicFunc.mx("#feedback_submit_btn");
            let l_dom_feedback_content = _this.publicFunc.mx("#feedback_describe_text");
            let l_dom_feedback_email_address = _this.publicFunc.mx("#feedback_email_address");
            let l_dom_upload_image_btn = _this.publicFunc.mx("#upload_image_btn");
            let l_dom_pre_img_btn = _this.publicFunc.mx("#pre_img_btn");
            let img_url = '';
            l_dom_feedback_upload_image.onchange = function (e) {
              // l_dom_upload_image_btn.style.display="none";
              let reader = new FileReader();
              let newimg = new Image();
              reader.readAsDataURL(e.target.files[0]);
              reader.onload = function () {
                let img = document.getElementById("pre_img");
                img.src = this.result;
                img.style.width = '90px';
                img.style.height = '90px';
                if (this.result.indexOf("data:image/png;base64,") > -1) {
                  let str = "data:image/png;base64,";
                  img_url = "data:application/octet-stream;base64," + this.result.substr(str.length);
                } else if (this.result.indexOf("data:image/jpeg;base64,") > -1) {
                  let str = "data:image/jpeg;base64,";
                  img_url = "data:application/octet-stream;base64," + this.result.substr(str.length);
                }
                newimg.src = this.result;
              }
            }
            l_dom_upload_image_btn.onclick = function () {
              l_dom_feedback_upload_image.click();
            }
            l_dom_pre_img_btn.onclick = function () {
              l_dom_feedback_upload_image.click();
            }
            l_dom_feedback_submit.onclick = function () {
              let feedback_type = l_dom_feedback_type.value;
              let feedback_content = l_dom_feedback_content.value;
              let feedback_email_address = l_dom_feedback_email_address.value;
              let feedback_pic = document.getElementById("pre_img");
              // let feedback_arr = { data: feedback_content };
              let filter = /(^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$|^\d{6,12}$)/; // 修改正则验证QQ和邮箱
              if (!feedback_content || feedback_content == "") {
                $(".feedback_error_content_tip").eq(1).show();
                setTimeout(function () {
                  $(".feedback_error_content_tip").eq(1).hide();
                }, 3000)
              } else if (!feedback_email_address || feedback_email_address == "" || !filter.test(feedback_email_address)) {
                $(".feedback_error_content_tip").eq(0).show();
                setTimeout(function () {
                  $(".feedback_error_content_tip").eq(0).hide();
                }, 3000)
              } else { // 发送意见反馈部分(请求部分配置见\interface\mlib.cloud.agent.js 需要修改请求头配置)
                let time_stamp = new Date().getTime();
                // let params = {
                // 	hfrom_handle: "160199",
                // 	flag: 1,
                // 	content: 1,
                // 	content_flag: 1,
                // 	content_sign: "vimtag",
                // 	content_title: feedback_type,
                // 	content_creator: username_value,
                // 	content_platform: "web",
                // 	content_native_ver: process.env.VUE_APP_VERSION,
                // 	content_web_ver: process.env.VUE_APP_VERSION,
                // 	content_create_time: time_stamp,
                // 	content_item__x_countz_: 1,
                // 	content_item: 1,
                // 	content_item_time: time_stamp,
                // 	content_item_user: username_value,
                // 	content_item_title: feedback_type,
                // 	content_item_content: feedback_content,
                // 	content_item_pic__x_countz_: 0
                // }

                let params = {
                  sign: "vimtag",
                  platform: "pc",
                  // native_ver: process.env.VUE_APP_VERSION,
                  web_ver: process.env.VUE_APP_VERSION,
                  title: feedback_type,
                  creator: username_value,
                  email: feedback_email_address,
                  item__x_countz_: 1,
                  create_time: time_stamp,
                  item: {
                    time: time_stamp,
                    user: username_value,
                    email: feedback_email_address,
                    title: feedback_type,
                    content: feedback_content,
                    pic: feedback_pic.src
                  }
                }
                if (!feedback_pic.width) {
                  delete params.item.pic;
                }
                // console.log(params)
                // msdk_agent.feedback_submit(params, null, feedback_submit_ack);
              }
              function feedback_submit_ack (msg) {
                if (msg && msg.result == "") {
                  _this.publicFunc.msg_tips({ msg: mcs_feedback_submit_success, type: "success", timeout: 3000 });
                  $("#upload_image").val("");
                  l_dom_feedback_type.value = "";
                  // $("#pre_img")[0].src = "";
                  // $("#pre_img")[0].style = "";
                  l_dom_feedback_content.val("");
                  l_dom_feedback_email_address.val("");
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_feedback_submit_fail, type: "error", timeout: 3000 });
                }
              }
            };
          }
          if (id_name == "exit_btn_img") {
            if (!_this.$store.state.jumpPageData.projectFlag) { // vimtag项目隐藏退出登录内容页面的返回按钮
              $("#my_page_box_back_manage").hide()
            }
            // g_loacl部分目前仅vimtag可以使用,mipc系列暂不支持相关参数
            _this.$store.dispatch('setLocalFlag', (_this.publicFunc.urlParam() && _this.publicFunc.urlParam().l === "local") ? 1 : 0)
            if (_this.$store.state.user.loginFlag) {
              _this.publicFunc.delete_tips({
                content: mcs_prompt_exit, flag: "my_page", func: function () { //g 5.5 flag是后加的，判断是my_page页面，点击取消
                  localStorage.setItem("auto_login", 0);
                  if (!localStorage.getItem("keep_pw")) {
                    let remember_msg_info_data = localStorage.getItem("remember_msg_info");
                    let remember_msg_info_json = eval("(" + remember_msg_info_data + ")");
                    let username = remember_msg_info_json.user;
                    localStorage.setItem("remember_msg_info", JSON.stringify({ user: username }));
                  }
                  if (_this.$store.state.jumpPageData.localFlag) {
                    let url = location.href;
                    location.href = url.replace("&l=local&c=1", "");
                    sessionStorage.clear();
                  } else {
                    sessionStorage.clear();
                    location.reload()
                  }
                }
              })
            } else {
              if (_this.$store.state.jumpPageData.localFlag) {
                let url = location.href;
                location.href = url.replace("&l=local&c=0", "");
                sessionStorage.clear();
              } else {
                sessionStorage.clear();
                location.reload()
              }
            }
          }
          if (id_name == "sd_export") {
            _this.publicFunc.mx("#sd_export").style.background = "url("+require('@/assets/device/c-sd.png')+") no-repeat";
          } else {
            _this.publicFunc.mx("#sd_export").style.background = "url("+require('@/assets/device/sd.png')+") no-repeat";
          }
          if (id_name == "local_devs") { // 点击本地搜索按钮后执行
            // console.log("进入判断")
            // console.log(location.href, "location.href")
            // console.log(_this.$store.state.user.loginFlag, "_this.$store.state.user.loginFlag")
            // console.log(urlparms, "urlparms")
            //  console.log(_this.$store.state.jumpPageData.localFlag, "_this.$store.state.jumpPageData.localFlag")
            // location.href=location.href+"&l=local"+(location.href.indexOf("file=vimtag")>-1?"&file=vimtag":"");
            location.href = location.href + "&l=local&c=" + _this.$store.state.user.loginFlag + "" + (location.href.indexOf("file=vimtag") > -1 ? "&file=vimtag" : "");
            // alert(location.href)
          }
          if (id_name == "my_other") {
            let dev_set_num;
            let l_dome_dev_set_input = _this.publicFunc.mx("#dev_set_input");
            let l_dom_button_setup = _this.publicFunc.mx("#button_setup");
            let dev_set_input_num = "";
            $("#dev_set_input").keyup(function () {
              let reg;
              reg = /^\+?[1-9]\d*$/;
              if (reg.test(this.value)) {
                dev_set_input_num = this.value;
              } else {
                this.value = "";
                dev_set_input_num = 4;
              }
            })
            $("#button_setup").click(function () {
              if (dev_set_input_num > 0 && dev_set_input_num < 5) {
                sessionStorage.setItem("device_list_num", dev_set_input_num)
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_failed_to_set_the, type: "error", timeout: 3000 })
              }
            })
          }
        })
        if (_this.publicFunc.mx("#my_page_box_back_manage")) {
          _this.publicFunc.mx("#my_page_box_back_manage").onclick = function () {
            // createPage("my", obj)
            _this.MipcMyPage({ parent: $('#my') })
          }
        }
      }

      function binding_accounts_info () {
        let appid = "vimtag.com";
        let user_info = eval("(" + localStorage.getItem("remember_msg_info") + ")")
        _this.$api.login.binding_email_get({
          username: user_info.user,
          appid: appid
        }).then(res => {
          binding_accounts_info_ack(res)
        })
      }

      function binding_accounts_info_ack (msg) {
        if (msg && msg.data.email !== "") {
          if (msg.data.active_email) {
            _this.publicFunc.mx("#email_addr").value = msg.data.email;
            _this.publicFunc.mx("#email_addr").disabled = "true";
            $("#ae_btn").hide();
          } else {
            _this.publicFunc.mx("#email_addr").value = msg.data.email;
            _this.publicFunc.mx("#ae_email_inactive").style.display = "block";
          }
        } else {
          return;
        }
      }

      function set_apply_btn_event () {
        let l_dom_manage_password = _this.publicFunc.mx("#mp_btn");
        let l_dom_guest_password = _this.publicFunc.mx("#gp_btn");
        let l_dom_add_email_page = _this.publicFunc.mx("#ae_btn");
        let l_dom_admin_pw = _this.publicFunc.mx("#old_password");
        let l_dom_admin_pw1 = _this.publicFunc.mx("#new_password");
        let l_dom_admin_pw2 = _this.publicFunc.mx("#new_password2");
        let l_dom_guest_pw = _this.publicFunc.mx("#guest_pw");
        let l_dom_guest_pw1 = _this.publicFunc.mx("#guest_pw1");
        let l_dom_guest_pw2 = _this.publicFunc.mx("#guest_pw2");
        let l_dom_email_addr = _this.publicFunc.mx("#email_addr");
        let l_dom_about_title = _this.publicFunc.mx("#about_title");
        let l_dom_developer_option = _this.publicFunc.mx("#developer_option");
        let l_dom_developer_ok = _this.publicFunc.mx("#developer_ok");
        // let l_dom_error_log_commit_btn = _this.publicFunc.mx("#error_log_commit_btn");
        let l_dom_sd_export_select_path = _this.publicFunc.mx("#sd_export_path_btn");
        let l_dom_sd_export_submit = _this.publicFunc.mx("#sd_export_submit");
        let l_dom_sd_export_path_show = _this.publicFunc.mx("#sd_export_path_show");
        let l_dom_feedback_submit = _this.publicFunc.mx("#feedback_submit_btn");
        let l_dom_feedback_content = _this.publicFunc.mx("#feedback_describe_text");
        let l_dom_feedback_email_address = _this.publicFunc.mx("#feedback_email_address");
        let l_dom_feedback_upload_image = _this.publicFunc.mx("#upload_image");
        let l_dom_buffer_page = _this.publicFunc.mx("#buffer_page");
        let img_base;
        let image = new Image(),
          canvas = document.createElement("canvas"),
          ctx = canvas.getContext('2d'),
          quality = 0.2;
        let set_mme = {};
        function set_creat_mme (obj) {
          function mme_on_event (data) {
            switch (data.type) {
              case "install_ui": {
                data.panel.innerHTML = "";
                break;
              }
            }
          }
          let mme_params,
            ua = navigator.userAgent.toLowerCase(),
            url_params = (location.search || location.hash || "");
          $("#set_left").append("<div id='mme_select_path' style='width:1px;height:1px;'></div>");
          let l_dom_search = $("#mme_select_path");
          let params_key = 'data:application/octet-stream;base64,NGO/Mnqt7aXYO3hdsIe87bCTuqTRRSPMwJGuT26CuSedGTi2h7wroHY0IZObBPKYA/exp+e/efFj35sLiDKQpRfRFz8Th8zlYtrYki24JiN7vpGb2bUN9nY7quZ56SicUoqLd+KcCrvWheZ5NaE+slPpCg+F+hUdhNl4JXbVxzx5U6jS92D/SBoDfpMTvF8n3ELgtVFOm3VG+22f97jzrRT22WqSzmmwsM5CNX3cwVfeM5vSPVzeo/kw0ERT9k1mdqG1lScyhMuYsgrWZ0zQSKUni7AUUoiO8qqSfW28XR6CJgp5/JiLHa0kAQtVCVxm886cpuLLUn2SJCHQwS985Fd6PH49IhI+ZgKK5NA+LX+qV3tHHkGdt0C+4n7AMOxHGB+iqepOiK13Bm3YkX7BB9uR80IAltc5YVA0CWg/jog8cCETr1pWm8XngSP4pJa4ZwJq5VuPcBKDTYzqXPJsnIDpZ7L+oz457Ysz+Cc7N7keTCXuI3aFPOjxvdAdCQqKb0Hra3LuxCr5FCfZxx/mn1rddD24Ol74WXtfRJqDs8K/zYpWMnuLU7NjTNdJGMjDs2zYpq56Vd2gq0sS+yyHyhvU4lcIxT05+YfiDMSznuF4BQuKyK7yxa0X73GjUNZFxV3lqIkGKWXjMf4rv4RyE2j1mEqgqGuAW+s2PZ35xOE';
          mme_params = {
            parent: l_dom_search, enable_native_plug: true, enable_flash_plug: true, params: JSON.stringify(params_key),
            on_event: function (e) { mme_on_event(e) }, ref_obj: obj,
            debug: (0 <= (location.search || location.hash || "").indexOf("debug=1"))
          };
          if (ua.match(/windows|win32/)) {
            if (0 <= url_params.indexOf("windowless=0")) {
              mme_params.windowless = false;
            } else if (0 <= url_params.indexOf("windowless=1")) {
              mme_params.windowless = true;
            }
          }
          set_mme.mme = new mme(mme_params);
        }
        set_creat_mme({});
        l_dom_sd_export_path_show.innerHTML = "c:\\downloads";
        l_dom_sd_export_select_path.onclick = function () {
          let select_path = set_mme.mme.ctrl(0, "path.select", "aaa");
          select_path_data = select_path.replace(/\\/g, "/");
          select_path_data = eval("(" + select_path_data + ")");
          if (select_path_data.status == 0) {
            let select_path_str = select_path_data.code.replace(/\//g, "\\");
            l_dom_sd_export_path_show.innerHTML = select_path_str;
          }
          let sd_export_path = window.fun()
          l_dom_sd_export_path_show.innerHTML = sd_export_path;
        }
        function sd_export_pause () {
          let sd_export_path = l_dom_sd_export_path_show.innerHTML;
          _this.publicFunc.mx("#sd_export_submit_tip").style.display = "none";
          l_dom_sd_export_submit.innerHTML = "continue";
          l_dom_sd_export_submit.onclick = sd_export_continue;
          window.export_ctrl(sd_export_path + "\\opt", "1")
        }
        function sd_export_continue () {
          let sd_export_path = l_dom_sd_export_path_show.innerHTML;
          _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
          l_dom_sd_export_submit.innerHTML = "pause";
          l_dom_sd_export_submit.onclick = sd_export_pause;
          window.export_ctrl(sd_export_path + "\\opt", "3");
        }
        function sd_export_submit_func () {
          let sd_exist = window.check_SDCard();
          if (sd_exist == 0) return;
          if (window.system_type == "mac") {
            let export_path = l_dom_sd_export_path_show.innerHTML;
            export_path = export_path.replace(/\\/g, "/");
            let resutl = set_mme.mme.ctrl(0, 'system.commit', 'osascript -e "do shell script \\"cd ' + window.cmd_path + '; export DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH:./; ./mcard_test -path ' + export_path + ' \\" with administrator privileges"');
            _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
            _this.publicFunc.mx("#buffer_page").style.display = "none";
            _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "Export success";
            _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#00a6ba";
            document.getElementById("sd_export_submit").style.background = "#00a6ba";
            let l_dom_progress_bar = _this.publicFunc.mx("#progress_bar");
            let l_dom_progress_bar_box = _this.publicFunc.mx("#progress_bar_box");
            l_dom_progress_bar_box.style.position = "relative";
            l_dom_progress_bar.style.position = "relative";
            l_dom_progress_bar.style.left = "0";
            l_dom_progress_bar.style.width = "20px";
          } else if (window.system_type == "windows") {
            let l_dom_progress_bar = _this.publicFunc.mx("#progress_bar");
            let l_dom_progress_bar_box = _this.publicFunc.mx("#progress_bar_box");
            let l_dom_progress_bar_num = _this.publicFunc.mx("#progress_bar_num");
            l_dom_progress_bar_box.style.position = "relative";
            l_dom_progress_bar.style.position = "relative";
            l_dom_progress_bar.style.left = "0";
            l_dom_progress_bar.style.width = "20px";
            _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
            let sd_export_path = l_dom_sd_export_path_show.innerHTML;

            setTimeout(function () {
              let result = window.sd_export(sd_export_path);
              let timer = null;
              timer = setInterval(function () {
                //Export completed
                if (result == 2) {
                  sd_is_export = 1;
                  l_dom_sd_export_submit.innerHTML = "pause";
                  l_dom_sd_export_submit.onclick = sd_export_pause;
                  get_progress(sd_export_path);
                  clearInterval(timer);
                  //no data
                } else if (result == 0) {
                  l_dom_progress_bar_box.style.display = "none";
                  _this.publicFunc.mx("#buffer_page").style.display = "none";
                  _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                  _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                  document.getElementById("sd_export_submit").style.background = "#00a6ba";
                  clearInterval(timer);
                  //no_sd
                } else if (result == 1) {
                  l_dom_progress_bar_box.style.display = "none";
                  _this.publicFunc.mx("#buffer_page").style.display = "none";
                  _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                  _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                  document.getElementById("sd_export_submit").style.background = "#00a6ba";
                  clearInterval(timer);
                }
              }, 100);
            }, 100)
          } else {
            document.getElementById("sd_export_submit").style.background = "#ccc";
            _this.publicFunc.mx("#sd_export_submit_tip").style.display = "block";
            setTimeout(function () {
              let result = window.sd_export(l_dom_sd_export_path_show.innerHTML);
              let timer = null;
              timer = setInterval(function () {
                //Export completed
                if (result == 2) {
                  l_dom_progress_bar.style.left = "0";
                  _this.publicFunc.mx("#export_success_icon").style.display = "block";
                  _this.publicFunc.mx("#sd_export_submit_tip").style.display = "none";
                  document.getElementById("sd_export_submit").style.background = "#00a6ba";
                  clearInterval(timer);
                  //no data
                } else if (result == 0) {
                  l_dom_progress_bar_box.style.display = "none";
                  _this.publicFunc.mx("#buffer_page").style.display = "none";
                  _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                  _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                  document.getElementById("sd_export_submit").style.background = "#00a6ba";
                  clearInterval(timer);
                  //no_sd
                } else if (result == 1) {
                  l_dom_progress_bar_box.style.display = "none";
                  _this.publicFunc.mx("#buffer_page").style.display = "none";
                  _this.publicFunc.mx("#sd_export_submit_tip").innerHTML = "no sd card";
                  _this.publicFunc.mx("#sd_export_submit_tip").style.color = "#ff0000";
                  document.getElementById("sd_export_submit").style.background = "#00a6ba";
                  clearInterval(timer);
                }
              }, 100);
            }, 100)
            let l_dom_progress_bar = _this.publicFunc.mx("#progress_bar");
            let l_dom_progress_bar_box = _this.publicFunc.mx("#progress_bar_box");
            l_dom_progress_bar_box.style.position = "relative";

            l_dom_progress_bar.style.position = "relative";
            l_dom_progress_bar.style.left = "0";
            l_dom_progress_bar.style.width = "20px";
          }
          function get_progress () {
            let progress_time = null;
            let progress_num = 0;
            progress_time = setInterval(function () {
              l_dom_progress_bar_box.css("display", "block");
              progress_num = window.progress(sd_export_path + "\\progress");
              progress_num = parseInt(progress_num);
              let show_progress_num = progress_num + "%";
              l_dom_progress_bar.style.width = show_progress_num;
              l_dom_progress_bar_num.innerHTML = show_progress_num;
              if (progress_num == 100) {
                $("#export_success_icon").css("display", "block");
                $("#sd_export_submit_tip").parent().css("display", "none");
                document.getElementById("sd_export_submit").style.background = "#00a6ba";
                clearInterval(progress_time);
                l_dom_sd_export_submit.innerHTML = "Export success";
                l_dom_sd_export_submit.onclick = sd_export_submit_func;
                sd_is_export = 0;
              }
            }, 100)
          }
        }
        l_dom_sd_export_submit.onclick = sd_export_submit_func;
        // l_dom_about_title.ondblclick = function () {
        // 	$("#set_about_page").append(
        // 		"<div id='develop_page' style='font-size:18px;color:#666;float:left;'>"
        // 		+ "<form>"
        // 		+ "<p style='height:50px;line-height:50px;'>Developer password: <input type='text' id='develop_pw'/></p>"
        // 		+ "<input type='button' value='OK' id='develop_ok' style='width:100px;height:34px;color:#ffffff;background-color:#0ea9bb;border:0;'/>"
        // 		+ "<div id='develop_warn' style='color:#f00;height:50px;line-height:50px;'></div>"
        // 		+ "</form>"
        // 		+ "</div>");
        // 	_this.publicFunc.mx("#develop_ok").onclick = function () {
        // 		if (_this.publicFunc.mx("#develop_pw").value == "Vimtag@2016") {
        // 			l_dom_developer_option.parentNode.style.display = "block";
        // 		} else {
        // 			_this.publicFunc.mx("#develop_warn").innerHTML = "The password is error";
        // 			setTimeout(function () {
        // 				_this.publicFunc.mx("#develop_warn").innerHTML = "";
        // 			}, 3000)
        // 		}
        // 	};
        // };
        l_dom_developer_ok.onclick = function () {
          let tree_id = _this.publicFunc.mx("tree_id");
          let checkbox_check;
          for (let i = 0, length = tree_id.length; i < length; i++) {
            if (tree_id[i].checked) {
              checkbox_check = !i ? 1 : checkbox_check | (0x1 << i);
            } else {
              checkbox_check = !i ? 0 : checkbox_check;
            }
          }
          sessionStorage.setItem("developer", checkbox_check);
        };
        $("#mp_btn").click(function () { // 点击提交修改管理密码按钮
          if (_this.$store.state.user.guest) {
            _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
          } else {
            let reg;
            if (!l_dom_admin_pw || l_dom_admin_pw.value == "") { // 未输入当前管理密码
              $(".mp_password_empty").eq(0).show(); // 错误提示语句
              setTimeout(function () {
                $(".mp_password_empty").eq(0).hide();
              }, 3000)
              return;
            }
            if (!l_dom_admin_pw1.value || l_dom_admin_pw1.value == "") { // 未输入新管理密码
              $(".mp_password_empty").eq(1).show();
              setTimeout(function () {
                $(".mp_password_empty").eq(1).hide();
              }, 3000)
              return;
            }
            if (!l_dom_admin_pw2.value || l_dom_admin_pw2.value == "") { // 未输入确认密码
              $(".mp_password_empty").eq(2).show();
              setTimeout(function () {
                $(".mp_password_empty").eq(2).hide();
              }, 3000)
              return;
            } else {
              reg = /^(?![^A-z]+$)(?!\D+$)[A-z\d]{8,32}$/; // 密码格式验证(8-32位字母数字)
              if (!reg.exec(l_dom_admin_pw1.value)) {
                $(".mp_password_demand").eq(0).show();
                setTimeout(function () {
                  $(".mp_password_demand").eq(0).hide();
                }, 3000)
                return;
              }
            }
            if (!l_dom_admin_pw2.value || l_dom_admin_pw2.value == "") {
              $(".mp_password_empty").eq(1).show();
              setTimeout(function () {
                $(".mp_password_empty").eq(1).hide();
              }, 3000)
              return;
            }
            if (l_dom_admin_pw1.value != l_dom_admin_pw2.value) { // 两次输入的新密码不一致
              $(".mp_password_inconsistent").show();
              setTimeout(function () {
                $(".mp_password_inconsistent").hide();
              }, 3000)
              return;
            }
            if (l_dom_admin_pw.value === l_dom_admin_pw1.value) { // 修改密码时新密码不能与旧密码一致
              _this.publicFunc.msg_tips({ msg: mrs_new_password_setting_failed, type: "error", timeout: 3000 })
              return
            }
            _this.$api.my.account_passwd_set({ // 修改管理/访客密码(管理)
              old_pass: l_dom_admin_pw.value,
              new_pass: l_dom_admin_pw1.value,
              is_guest: 0
            }).then(res => {
              user_passwd_set_ack(res)
            })
          }
        })
        $("#gp_btn").click(function () { // 点击提交访客密码按钮
          if (_this.$store.state.user.guest) {
            _this.publicFunc.msg_tips({ msg: mcs_permission_denied, type: "error", timeout: 3000 });
          } else {
            let reg;
            if (!l_dom_guest_pw.value || l_dom_guest_pw.value == "") { // 输入为空判断提示
              $(".gp_password_empty").eq(0).show();
              setTimeout(function () {
                $(".gp_password_empty").eq(0).hide();
              }, 3000);
              return;
            }
            if (!l_dom_guest_pw1.value || l_dom_guest_pw1.value == "") { // 输入为空判断提示
              $(".gp_password_empty").eq(1).show();
              setTimeout(function () {
                $(".gp_password_empty").eq(1).hide();
              }, 3000)
              return;
            } else {
              reg = /^\S{6,20}$/;
              if (!reg.exec(l_dom_guest_pw1.value)) { // 访客密码校验
                $(".gp_password_demand").eq(0).show();
                setTimeout(function () {
                  $(".gp_password_demand").eq(0).hide();
                }, 3000)
                return;
              }
            }
            if (!l_dom_guest_pw2.value || l_dom_guest_pw2.value == "") { // 输入为空判断提示
              $(".gp_password_empty").eq(1).show();
              setTimeout(function () {
                $(".gp_password_empty").eq(1).hide();
              }, 3000)
              return;
            }
            if (l_dom_guest_pw1.value != l_dom_guest_pw2.value) { // 两次访客密码输入不一致
              $(".gp_password_inconsistent").eq(0).show();
              setTimeout(function () {
                $(".gp_password_inconsistent").eq(0).hide();
              }, 3000)
              return;
            }
            if (l_dom_guest_pw1.value === l_dom_guest_pw.value) { // 输入的访客密码与管理密码一致
              _this.publicFunc.msg_tips({ msg: mrs_guest_password_setting_failed, type: "error", timeout: 3000 })
              // 注释内容为原mipc系列提示
              // $(".gp_same_ap").eq(0).show();
              // setTimeout(function () {
              // 	$(".gp_same_ap").eq(0).hide();
              // }, 3000)
              return
            }
            _this.$api.my.account_passwd_set({ // 修改管理/访客密码(访客)
              old_pass: l_dom_guest_pw.value,
              new_pass: l_dom_guest_pw2.value,
              is_guest: 1
            }).then(res => {
              user_passwd_set_ack(res)
            })
          }
        });
        $("#ae_btn").click(function () { // 绑定邮箱
          let email_reg = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          if (!l_dom_email_addr.value || l_dom_email_addr.value == "" || !email_reg.test(l_dom_email_addr.value)) {
            $("#email_invalid").show();
            setTimeout(function () {
              $("#email_invalid").hide();
            }, 3000)
            return;
          }
          let appid = "vimtag.com";
          let user_info = eval("(" + localStorage.getItem("remember_msg_info") + ")")
          _this.$api.my.binding_email({
            email: l_dom_email_addr.value,
            user: user_info.user,
            pass: user_info.password,
            appid: appid,
            lang: _this.$store.state.user.userLanguage
          }).then(res => {
            binding_email_ack(res)
          })
        })
        _this.$store.dispatch('setHostname', "vimtag.com")

        function binding_email_ack (msg) {
          if (msg && msg.result == "") {
            $("#send_msg").show();
            setTimeout(function () {
              $("#send_msg").hide();
            }, 5000)
          } else if (msg.result == "accounts.bind.email.exist") {
            $("#ae_email_exist").show();
            setTimeout(function () {
              $("#ae_email_exist").hide();
            }, 5000)
            return;
          } else if (msg.result == "accounts.bind.email.busy") {
            $("#ae_email_busy").show();
            setTimeout(function () {
              $("#ae_email_busy").hide();
            }, 5000)
            return;
          }
        }
        function user_passwd_set_ack (msg) {
          if (!msg.result) {
            if (msg.is_guest == 1) {
              $("#gp_updata_password").show();
              setTimeout(function () {
                $("#gp_updata_password").hide();
              }, 3000)
            } else {
              $("#mp_updata_password").show();
              setTimeout(function () {
                $("#mp_updata_password").hide();
              }, 3000)
            }
          } else if (msg.result == "accounts.pass.invalid") {
            if (msg.is_guest) {
              $("#gp_updata_password_error").show();
              setTimeout(function () {
                $("#gp_updata_password_error").hide();
              }, 3000)
            } else {
              $("#mp_updata_password_error").show();
              setTimeout(function () {
                $("#mp_updata_password_error").hide();
              }, 3000)
            }
          }
        }

        // function feedback_submit_ack (msg) {
        //   if (!msg.result) {
        //     l_dom_buffer_page.parent().css("display","none");
        //     _this.publicFunc.msg_tips({ msg: mcs_feedback_submit_success, type: "warning", timeout: 3000 })
        //   } else {
        //     l_dom_buffer_page.parent().css("display","none");
        //     _this.publicFunc.msg_tips({ msg: mcs_feedback_submit_fail, type: "error", timeout: 3000 })
        //   }
        // }
        $("#set_auto_play_btn").iButton({
          change: function () {
            if (_this.publicFunc.mx("#set_auto_play_btn").checked && _this.$store.state.user.autoPlayFlag) {
              localStorage.setItem("auto_play", 1)
              _this.$store.dispatch('setAutoPlayFlag', 1)
            } else {
              localStorage.setItem("auto_play", "0");
              _this.$store.dispatch('setAutoPlayFlag', 0)
            }
          }
        });
        let auto_play = localStorage.getItem("auto_play");
        if (auto_play == 0) {
          $("#set_auto_play_btn").iButton("toggle", false)
        } else {
          $("#set_auto_play_btn").iButton("toggle", true)
        }
      }

      window.onresize = function () {

      }
    }
  },
  async mounted () {
    this.publicFunc.projectReload.call(this)
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    } else {
      pageData = { parent: $("#" + this.$route.name) }
    }
    // console.log(pageData, "pageData")
    await this.mipcMyPage(pageData) // 进入页面后加载
    // await this.create_my_page({ parent: $('#my') })
    // await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    // if (window.location.href.indexOf('vimtag') === -1) {
    //   // mipc系列
    //   languageSelect.mipc($('#login_box'))
    //   $('#login_box').append("<div id='is_mipc_div'></div>")
    // }
    window.mipcMyPage = this.mipcMyPage
  }
}
</script>