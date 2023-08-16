<template>
  <div id="boxlist"></div>
</template>
<script>
import languageSelect from '../../lib/exportModule/languageSelect.js'
export default {
  data () {
    // 页面内全局变量
    return {
      l_dom_box_camera_sign_picture: [],
      onvif_ipc: '',
      box_list_dom: '',
      onvif_ipc_arr: [],
      margin_width: '',
    }
  },
  methods: {
    create_boxlist_page (obj) {
      let _this = this
      obj.parent.html('')
      // 展示遮罩层
      _this.publicFunc.showBufferPage()
      obj.parent.html("<div id='vimtag_device_list_box'>"
        + "<div id='boxlist_menu_box'>"
        + "<div id='back'><div id='main_title_box_return_img'></div>" + mcs_back + "</div>" // 返回按钮
        + "<div id='boxlist_right_menu'>" // 云盒子界面右上按钮行
        + "<div id='boxlist_add_btn' class='boxlist_menu_box_btn'><div id='boxlist_add_btn_img'></div>" + mcs_add_device + "</div>" // 添加设备
        + "<div id='boxlist_search_btn' class='boxlist_btn'><div id='boxlist_search_btn_img'></div>" + mcs_search_device + "" // 搜索设备
        + "<div id='boxlist_search_btn_down'>" + mrs_click_search + "</div>" // 搜索设备提示框
        + "</div>"
        + "<div id='boxlist_edit_btn' class='boxlist_btn'><div id='boxlist_edit_btn_img'></div>" + mcs_edit + "</div>" // 编辑(删除设备)
        + "<div id='boxlist_set_btn'><div id='boxlist_set_btn_img'></div>" + mcs_settings + "</div>" // 设置
        + "</div>"
        + "</div>"
        + "<div id='box_per_ipc_box'><div id='box_per_ipc'>" + mcs_onvif_private + "</div>" // 私有
        + "<div id='box_per_ipc_container'></div>"
        + "</div>"
        + "<div id='box_onvif_ipc_box'><div id='box_onvif_ipc'>ONVIF</div>" // 开放接口
        + "<div id='box_onvif_ipc_container'></div>"
        + "</div>"
        + "</div>")
      if (_this.$store.state.jumpPageData.projectFlag) { // mipc系列不展示返回按钮
        $("#back").hide()
      }
      if (!_this.$store.state.jumpPageData.projectFlag) { // vimtag项目   让设备自适应宽度
        let box_width = document.getElementById("vimtag_device_list_box").offsetWidth;
        let ipc_num = parseInt(box_width / 290)
        _this.margin_width = parseInt((box_width - ipc_num * 290) / ipc_num);
      }

      let onvif_unadd = '';
      let conf = {};
      let onvif_password = "", onvif_username = "", onvif_uuid = "", onvif_port = 0, onvif_ip = "", onvif_type = "";
      let l_dom_box_onvif_add_btn; //添加按钮
      let l_get_onvif_flag = false; // 用于判断onvif_list_get函数最后回调至get_onvif_list/get_onvif_unadd
      if (_this.$store.state.jumpPageData.localFlag) { // 判断是否是本地搜素
        let local_play_data = {};
        local_play_data.addr = obj.addr;
        local_play_data.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
        local_play_data.sn = _this.$store.state.jumpPageData.selectDeviceIpc;
        local_play_data.flag = 1;
        local_play_data.password = sessionStorage.getItem("pass_" + _this.$store.state.jumpPageData.selectDeviceIpc);
        local_play_data.func = function () {
          local_play_data.func = boxlist_get_ack
          msdk_ctrl({ type: "local_boxlist_get", data: local_play_data })
        }
        msdk_ctrl({ type: "local_sign_in", data: local_play_data })
      } else {
        l_get_onvif_flag = true
        _this.$api.boxlist.onvif_box_search({ // 调用ccm_box_search接口
          box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res => {
          onvif_box_search_ack(res)
        })
      }
      function onvif_box_search_ack (msg) { // 延时调用请求设备列表回调至get_onvif_unadd/不延时请求设备列表回调至get_onvif_list(当前页面的公共回调函数)
        // console.log(msg, 'onvif_box_search_ack_msg')
        if (l_get_onvif_flag) {
          _this.$api.boxlist.get_onvif_list({ // 调用ccm_box_conf_get接口
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            get_onvif_list(res)
          })
        } else {
          setTimeout(function () {
            // console.log("开始调用ccm_box_conf_get,回调至get_onvif_unadd")
            _this.$api.boxlist.get_onvif_list({ // 调用ccm_box_conf_get接口
              box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
            }).then(res => {
              get_onvif_unadd(res)
            })
          }, 2000)
        }
      }
      // 获取onvif设备列表(用于展示渲染列表)
      function get_onvif_list (msg) {
        _this.onvif_ipc_arr = [];
        _this.onvif_ipc = '';

        if (msg.conf && msg.connect_infos) {
          $("#box_onvif_ipc").show(); //显示onvif
          for (let i = 0; i < msg.conf.length; i++) {
            _this.onvif_ipc +=
              "<div class='box_device_list_img'>"
              + "<img class='box_camera_sign_picture' sn='" + msg.conf[i].sn + "' imgId='" + i + "'></img>"
              + "<div class='box_device_nick' sn='" + msg.conf[i].sn + "' uuid='" + msg.conf[i].uuid + "'>"
              + "<div class='" + (msg.connect_infos[i].status == 1 ? "box_device_online" : "box_device_offline") + "'></div>"
              + "<span class='box_device_nick_span'>" + (decodeURI(msg.conf[i].nick) ? decodeURI(msg.conf[i].nick) : msg.conf[i].sn) + "</span>"
              + "<div class='box_delete_btn'>"
              + "<div class='del_box_ipc_btn' app='vimtag'></div>"//删除关联和录像
              + "<div class='del_box_ipc_record_btn' app='vimtag'></div>" //删除关联
              + "</div>"
              + "</div>"
              + "</div>";
            _this.onvif_ipc_arr.push(msg.conf[i])
          }
        } else {
          // console.log('旧, 没有设备在线')
          if (msg.list) {
            for (let i = 0; i < msg.list.length; i++) {
              if ((msg.list[i].conted === 1 || msg.list[i].conted === 3) && msg.list[i].sn !== "") { // sn不为空，如果conted为3,按离线，云盒子已添加了的onvif设备显示到onvif
                $("#box_onvif_ipc").show(); //显示onvif
                _this.onvif_ipc +=
                  "<div class='box_device_list_img'>"
                  + "<img class='box_camera_sign_picture' sn='" + msg.list[i].sn + "'></img>"
                  + "<div class='box_device_nick' sn='" + msg.list[i].sn + "'>"
                  + "<div class='" + (msg.list[i].conted == 1 ? "box_device_online" : "box_device_offline") + "'></div>" //暂时用conted==1代替在线判断 3时网络信号不好代替离线
                  + "<span class='box_device_nick_span'>" + msg.list[i].sn + "</span>"
                  + "<div class='del_box_ipc_btn'></div>"
                  + "</div>"
                  + "</div>";
                _this.onvif_ipc_arr.push(msg.list[i])
              }
            }
          }
        }
        if (_this.onvif_ipc !== "") { // 如果含有onvif设备直接执行写入onvif设备列表的dom操作
          $("#box_onvif_ipc_container").html(_this.onvif_ipc)
          // 获取onvif设备展示图片
          _this.$api.boxlist.boxlist_img_get({ addr: obj.addr, agent: 'undefined', sn: _this.$store.state.jumpPageData.selectDeviceIpc, ipc: _this.onvif_ipc_arr, dom: $(".box_camera_sign_picture"), resolution: "p3" })
          // msdk_ctrl({ type: "boxlist_img_get", data: { addr: obj.addr, agent: 'undefined', sn: _this.$store.state.jumpPageData.selectDeviceIpc, ipc: _this.onvif_ipc_arr, dom: _this.publicFunc.mx(".box_camera_sign_picture"), resolution: "p3" } });
        }
        $(".del_box_ipc_btn").click(function(){
          let data = $(this);
          let app=data.attr("app");
          let conf={};
          conf.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
          conf.sn =data.parent().parent().attr("sn");
          conf.flag=2;
          conf.uuid=data.parent().parent().attr("uuid");
          conf.func=onvif_box_add_ipc_ack;
          _this.publicFunc.delete_tips({content:mrs_delete_association_and_video,func:function(){
            _this.$api.boxlist.onvif_box_add_ipc(conf) // ccm_box_set_ipc_req
          }})
          
          function onvif_box_add_ipc_ack(msg){
            if(msg.result==''){ //如果删除关联成功 //ccm_box_set
              _this.$api.history.history_delete({ // 调用历史删除接口
                box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: data.parent().parent().attr("sn"),
              }).then(res => {
                if (res.type === 'success') {
                  _this.publicFunc.msg_tips({ msg: mrs_delete_association_and_video_succeed, type: "success", timeout: 3000 })
                  if(app=='mipc'){
                    _this.create_boxlist_page({parent:_this.publicFunc.mx("#dev_main_right")})
                    // create_boxlist_page({parent:mx("#dev_main_right")}) 
                  }else{
                    _this.create_boxlist_page({parent:_this.publicFunc.mx("#page")})
                    // create_boxlist_page({parent:mx("#page")}) 
                  }
                } else {
                  _this.publicFunc.msg_tips({ msg: mcs_delete_fail, type: "error", timeout: 3000 })
                }
              })
            }else if(msg.result=='DevNotFound'){
              _this.publicFunc.msg_tips({msg:mrs_devide_does_not_exist, type:"error", timeout:3000})
            }
          }
        })
        $(".del_box_ipc_record_btn").click(function(){
          let data = $(this);
          let app=data.attr("app");
          let conf={};
          conf.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
          conf.sn =data.parent().parent().attr("sn");
          conf.flag=2;
          conf.uuid=data.parent().parent().attr("uuid");
          conf.func=onvif_box_add_ipc_ack;
          _this.publicFunc.delete_tips({content:mrs_delete_association,func:function(){
            _this.$api.boxlist.onvif_box_add_ipc(conf) //发送删除设备请求
          }})
          
          function onvif_box_add_ipc_ack(msg){
            if(msg.result==''){
              _this.publicFunc.msg_tips({msg:mrs_delete_association_succeed, type:"success", timeout:3000});
              if(app=='mipc'){
                // create_boxlist_page({parent:mx("#dev_main_right")}) 
                _this.create_boxlist_page({parent:_this.publicFunc.mx("#dev_main_right")})
              }else{
                _this.create_boxlist_page({parent:_this.publicFunc.mx("#page")})
                // create_boxlist_page({parent:mx("#page")}) 
              }
            }else if(msg.result=='DevNotFound'){
              _this.publicFunc.msg_tips({msg:mrs_devide_does_not_exist, type:"error", timeout:3000})
            }
          }
        })
        _this.$api.boxlist.box_get({ //返回onvif后发送ccm_box_get，解决有时私有去不掉onvif问题
          box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
          flag: 1
        }).then(res => {
          boxlist_get_ack(res)
        })
        boxlist_onvif_event();
      }
      function boxlist_get_ack (data) {
        // console.log(data, "进入boxlist_get_ack")
        let box_device_data = []; //定义的全局变量，初始化 ,标记实时播放列表显示,解决修改g_device_data 从云盒子返回设备列表页出错问题
        if (data.ipcs) { // ccm_box_get没有onvif设备
          for (let i = 0; i < data.ipcs.length; i++) {// 实时视频播放
            data.ipcs[i].type = 'BOX'// 实时视频播放
            data.ipcs[i].box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;// 实时视频播放 参数sn：所在的云盒子
            box_device_data.push(data.ipcs[i])
          }// 实时视频播放
          _this.$store.dispatch('setBoxDeviceData', box_device_data)
          array_diff(data.ipcs, _this.onvif_ipc_arr); //私有中去掉包含的onvif
          // console.log(data.ipcs, "私有设备列表") // 得到的data.ipcs已经是去除过onvif设备的数组了
        }
        // 私有设备数组长度
        let ipcs_length = data.ipcs ? data.ipcs.length : 0;
        _this.box_list_dom = '';

        

        for (let i = 0; i < ipcs_length; i++) {
          _this.box_list_dom +=
            "<div class='box_device_list_img' >"
            + "<img class='box_camera_sign_picture' sn='" + data.ipcs[i].sn + "' stat='" + data.ipcs[i].online + "'></img>"
            + "<div class='box_device_nick' sn='" + data.ipcs[i].sn + "'>"
            + "<div class='" + (data.ipcs[i].online ? "box_device_online" : "box_device_offline") + "'></div>"
            + "<span class='box_device_nick_span'>" + data.ipcs[i].nick + "</span>"
            + "<div class='del_box_ipc_btn' app='vimtag'></div>"
            + "</div>"
            + "</div>";
        }

        if (ipcs_length === 0 && _this.onvif_ipc_arr.length === 0) { //如果云盒子中没有私有设备
          _this.box_list_dom = "<div id='empty_div_img'></div>"
            + "<div class='empty_div_txt'>" + mcs_your_device_list_empty + "</div>"
            + "<div id='empty_search_btn'>" + mcs_search_device + "</div>"
        }
        _this.publicFunc.closeBufferPage()
        if (ipcs_length == 0) { //如果没有返回私有设备数据 设备列表为空页面
          $("#box_per_ipc").hide();
        } else {
          $("#box_per_ipc_container").html(_this.box_list_dom)
          
          // console.log('第二个请求')
          // 私有设备加载图片的请求
          _this.$api.boxlist.boxlist_img_get({ addr: obj.addr, agent: data.agent, sn: _this.$store.state.jumpPageData.selectDeviceIpc, ipc: data.ipcs, dom: $(".box_camera_sign_picture"), resolution: "p3" })
          // msdk_ctrl({ type: "boxlist_img_get", data: { addr: obj.addr, agent: data.agent, sn: _this.$store.state.jumpPageData.selectDeviceIpc, ipc: data.ipcs, dom: _this.publicFunc.mx(".box_camera_sign_picture"), resolution: "p3" } });
        }
        $(".del_box_ipc_btn").click(function(){
          let data = $(this);
          let app=data.attr("app");
          // let dev_sn=(app=='mipc')?data.parentNode.parentNode.getAttribute("sn"):data.parentNode.getAttribute("sn");
          let dev_sn=data.parent().attr("sn");
          _this.publicFunc.delete_tips({content:mrs_delete_video,func:function(){
              _this.$api.history.history_delete({ // 调用历史删除接口
              box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              dev_sn: dev_sn,
            }).then(res => {
                if (res.type === 'success') {
                    _this.publicFunc.msg_tips({ msg: mrs_delete_video_succeed, type: "success", timeout: 3000 })
                if(app=='mipc'){
                    _this.create_boxlist_page({parent:$("#dev_main_right")})
                  // create_boxlist_page({parent:mx("#dev_main_right")}) 
                }else{
                  _this.create_boxlist_page({parent:$("#boxlist")})
                  // create_boxlist_page({parent:mx("#page")}) 
                }
              } else {
                _this.publicFunc.msg_tips({ msg: mcs_delete_fail, type: "error", timeout: 3000 })
              }
            })
          }})
        })

        // if (_this.publicFunc.urlParam().m.indexOf('vimtag.com') > -1) {
        if ( _this.$store.state.jumpPageData.projectName === "vimtag") {
          $(".del_box_ipc_btn").attr("app", "vimtag")
          $(".del_box_ipc_record_btn").attr("app", "vimtag")
        } else {
          $(".del_box_ipc_btn").attr("app", "mipc")
          $(".del_box_ipc_record_btn").attr("app", "mipc")
        }
        boxlist_event()
      }
      function boxlist_event () {
        if (!_this.$store.state.jumpPageData.projectFlag) { // vimtag项目动态自适应   给box_device_list_img 加margin
          $(".box_device_list_img").css({ "margin-right": _this.margin_width / 2, "margin-left": _this.margin_width / 2 });
        }
        _this.l_dom_box_camera_sign_picture = _this.publicFunc.mx(".box_camera_sign_picture");
        for (let i = 0; i < _this.l_dom_box_camera_sign_picture.length; i++) {
          _this.l_dom_box_camera_sign_picture[i].onclick = function () {
            if (obj.box_live == 1) {//如果云盒子支持实时视频播放                  
              obj.box_ipc = 1;//给个标记，知道云盒子中的设备跳转到实时播放页面
              obj.ipc_sn = this.getAttribute("sn"); //标记设备的sn
              obj.ipc_stat = this.getAttribute("stat"); //标记云盒子设备的状态，进到播放页面，显示设备已离线
              // createPage("play", obj) //实时视频播放  点击返回时有bug，已解决
              _this.$router.push({name:'play',params:obj})
            } else {
              let dev_sn = this.getAttribute("sn");
              if (_this.$store.state.jumpPageData.projectFlag) {
                let jumpData = {parent: $("#dev_main_page"), dev_sn: dev_sn, back_page: "boxlist", addr: obj.addr, agent: obj.agent};
                // createPage("history", { parent: $("#dev_main_page"), dev_sn: dev_sn, back_page: "boxlist", addr: obj.addr, agent: obj.agent })
              _this.$router.push({name:'history',params:jumpData})
              } else {
                let jumpData = {parent: $("#page"), dev_sn: dev_sn, back_page: "boxlist", addr: obj.addr, agent: obj.agent};
                // createPage("history", { parent: $("#page"), dev_sn: dev_sn, back_page: "boxlist", addr: obj.addr, agent: obj.agent })
                _this.$router.push({name:'history',params:jumpData})
              }
            }
          }
        }
        if(_this.publicFunc.mx("#back")){
          _this.publicFunc.mx("#back").onclick = function () {
            _this.publicFunc.closeBufferPage()
            // createPage("devlist", obj)
            _this.$router.push({name:'devlist',params:obj})
          }
          _this.publicFunc.mx("#boxlist_set_btn").onclick = function () {
            let jumpData = {parent: $("#page"), back_page: "boxlist", type: 2, addr: obj.addr, agent: obj.agent, web_name: "vimtag", box_live: obj.box_live};
            // createPage("set", { parent: $("#page"), back_page: "boxlist", type: 2, addr: obj.addr, agent: obj.agent, web_name: "vimtag", box_live: obj.box_live });
            _this.$router.push({name:'set',params:jumpData})
          }
          _this.publicFunc.mx("#boxlist_edit_btn").onclick = function () {
            if ($(".del_box_ipc_btn").css("display") == "none") { // 删除关联和录像
              $(".del_box_ipc_btn").show();
            } else {
              $(".del_box_ipc_btn").hide();
            }
            if ($(".del_box_ipc_record_btn").css("display") == "none") { // 删除关联和录像
              $(".del_box_ipc_record_btn").show();
            } else {
              $(".del_box_ipc_record_btn").hide();
            }
          }
          _this.publicFunc.mx("#boxlist_add_btn").onclick = function () { // 根据ip 端口号进行添加设备
            $("#add_device_page").show();
            create_add_onvif_byip({ parent: _this.publicFunc.mx("#add_device_page") });
          }
          if(_this.publicFunc.mx("#empty_search_btn")){
            _this.publicFunc.mx("#empty_search_btn").onclick = function () { // 点击你的设备列表为空 搜索设备 注意这里就是搜索onvif设备的，私有设备没有相应接口
              $("#add_device_page").show();
              $("#add_device_page").css('position', 'absolute');
              create_search_onvif_box({ parent: _this.publicFunc.mx("#add_device_page") });
            }
          }
        }
      }
      function create_add_onvif_byip (data) { // 绘制添加设备弹窗
        data.parent.innerHTML = ""
        data.parent.innerHTML =
          "<div id='add_onvif_devices_box'>"
          + "<div id='add_devices_box_menu'>"
          + "<div id='add_devices_box_close'></div>"
          + "<div id='add_devices_box_title'>" + mcs_add_device + "</div>" // 添加设备
          + "</div>"
          + "<div id='add_devices_box_body'>"
          + "<div class='add_device_input_id_box' style='margin-top:98px'>"
          + "<div class='vimtag_add_device_input_id_box_ico'></div>"
          + "<div class='add_device_input_id_box_del'></div>"
          + "<input id='add_device_input_id_box_input' class='add_device_input_id_box_input' placeholder='" + mcs_please_input_username + "'>" // 输入用户名
          + "</div>"
          + "<div class='add_device_input_id_box'>"
          + "<div class='vimtag_add_device_input_pass_box_ico'></div>"
          + "<div class='add_device_input_id_box_del'></div>"
          + "<input id='add_device_input_pass' class='add_device_input_id_box_input' placeholder='" + mcs_input_password + "'>" // 输入密码
          + "</div>"
          + "<div class='add_device_input_id_box'>"
          + "<div class='vimtag_add_device_input_ip_box_ico'></div>"
          + "<div class='add_device_input_id_box_del'></div>"
          + "<input id='add_device_input_ip' class='add_device_input_id_box_input' placeholder='" + mrs_input_ip + "' onblur='checkip(this)'>" // 输入IP
          + "</div>"
          + "<div class='add_device_input_id_box'>"
          + "<div class='vimtag_add_device_input_port_box_ico'></div>"
          + "<div class='add_device_input_id_box_del'></div>"
          + "<input id='add_device_input_port' class='add_device_input_id_box_input' placeholder='" + mrs_input_port + "' onblur='isPort(this)'>" // 输入端口号
          + "</div>"
          + "<div id='add_device_submit'>" + mcs_add + "</div>"
          + "</div>"
          + "</div>";
        create_add_onvif_byip_event();
      }
      function create_add_onvif_byip_event () {
        _this.publicFunc.mx("#add_devices_box_close").onclick = function () { // 点击onvif添加设备关闭
          $("#add_device_page").hide();
          // createPage("boxlist", obj);
          _this.create_boxlist_page(obj);
        }
        for (let i = 0; i < 4; i++) {
          _this.publicFunc.mx(".add_device_input_id_box_del")[i].onclick = function () {
            this.nextSibling.value = "";
          }
        }
        _this.publicFunc.mx("#add_device_submit").onclick = function () { // 点击onvif添加按钮
          let conf = {};
          onvif_username = $("#add_device_input_id_box_input").val();
          onvif_password = $("#add_device_input_pass").val();
          onvif_ip = $("#add_device_input_ip").val();
          onvif_port = $("#add_device_input_port").val();
          conf.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
          if (onvif_username == "" || onvif_password == "") {
            _this.publicFunc.msg_tips({ msg: mrs_username_password_empty, type: "error", timeout: 3000 }); // 用户名或密码为空
          } else if (onvif_ip == "") {
            _this.publicFunc.msg_tips({ msg: mrs_ip_illegal, type: "error", timeout: 3000 }); // IP地址不合法
          } else if (onvif_port == "") {
            _this.publicFunc.msg_tips({ msg: mrs_port_illegal, type: "error", timeout: 3000 }); // 端口号不合规范
          } else {
            conf.username = onvif_username;
            conf.password = onvif_password;
            conf.ip = onvif_ip;
            conf.port = onvif_port;
            conf.enable = 1;
            conf.flag = 0;
            conf.type = "ONVIF_IPC";
            // conf.func = onvif_box_add_ipc_ack;
            _this.$api.boxlist.onvif_box_add_ipc(conf).then(res => { //发送添加设备请求
              onvif_box_add_ipc_ack(res)
            })
          }
        }
      }
      function onvif_box_add_ipc_ack (msg) { // 公共函数 如果添加成功，刷新页面 msg没有用 这个接口没有明确的返回值
        if (msg.result == "") {
          _this.publicFunc.msg_tips({ msg: mcs_add_successfully, type: "success", timeout: 3000 }); // 添加成功
          $("#add_device_page").hide();
          // createPage("boxlist", obj);
          _this.create_boxlist_page(obj);
        } else if (msg.result == "AuthenticateFailed") {
          _this.publicFunc.msg_tips({ msg: mcs_user_or_password_invalid, type: "error", timeout: 3000 })   // 用户名或密码错误
          return
        } else if (msg.result == "NetworkUnreachable") {
          _this.publicFunc.msg_tips({ msg: mrs_cloudbox_unsearch_device, type: "error", timeout: 3000 }) // 设备离线或与云盒子不在同一局域网内
          return
        } else {
          _this.publicFunc.msg_tips({ msg: mcs_add_failed, type: "error", timeout: 3000 }) // 添加失败
          return
        }
      }
      function boxlist_onvif_event () { // 点击搜索设备 搜索onvif
        if (!_this.$store.state.jumpPageData.projectFlag) { // vimtag 特殊添加搜索设备hover提示框
          if (_this.$store.state.user.userLanguage === "zh") {
            _this.publicFunc.mx("#boxlist_search_btn").onmouseenter = function () {
              $('#boxlist_search_btn_down').show().delay(1500).hide(0);
            }
          }
        }
        if(_this.publicFunc.mx("#boxlist_search_btn")){
          _this.publicFunc.mx("#boxlist_search_btn").onclick = function () {
            $("#add_device_page").show();
            $("#add_device_page").css('position', 'absolute');
            create_search_onvif_box({ parent: _this.publicFunc.mx("#add_device_page") });
          }
        }
      }
      function create_search_onvif_box (data) { // 搜索onvif设备页面
        data.parent.innerHTML =
          "<div id='add_onvif_devices_box'>"
          + "<div id='add_devices_box_menu'>"
          + "<div id='add_devices_box_close'></div>"
          + "<div id='add_devices_box_title'>" + mcs_search_device + "</div>"
          + "</div>"
          + "<div id='add_devices_box_body'>"
          + "<div id='box_onvif_img_tip'>"
          + "<div id='box_onvif_img'></div>"
          + "<div>" + mcs_connect_same_area + "</div>"
          + "</div>"
          + "<div id='onvif_searching'>" + mrs_searching + "</div>"
          + "<div id='box_onvif_unadd_box'>"
          + "</div>"
          + "<div id='onvif_no_searching'>" + mrs_net_nosearch_devcice + "</div>"
          + "<div id='onvif_re_searching'>" + mrs_research + "</div>"
          + "</div>"
          + "</div>";
        if (data.add_onvif_back == 1) { // 如果从添加设备返回的页面
          create_search_onvif_box_event(1);
        } else {
          create_search_onvif_box_event();
        }
      }
      function get_onvif_unadd (msg) { // 获取未添加的设备 渲染页面
        // console.log("进入get_onvif_unadd")
        // 由于将get_onvif_unadd函数抽离成全局函数 导致以下数据定义在两个函数中无法兼顾获得所以需要定义声明两个地方
        let l_dom_onvif_searching = $("#onvif_searching");
        let l_dom_box_onvif_unadd_box = $("#box_onvif_unadd_box");
        let l_dom_onvif_no_searching = $("#onvif_no_searching");
        let l_dom_onvif_re_searching = $("#onvif_re_searching");
        if (msg.list) {
          onvif_unadd = ""
          for (let i = 0; i < msg.list.length; i++) {
            if (msg.list[i].conted == 0) {
              l_dom_onvif_searching.hide();
              l_dom_box_onvif_unadd_box.show();
              onvif_unadd +=
                "<div class='box_onvif_unadd_img_box'>"
                + "<img class='box_onvif_unadd_img' src="+require('@/assets/device/onvif_camera.png')+"></img>"
                + "<div class='box_onvif_unadd_device_nick'>" + mcs_old_nick + "</div>" //昵称
                + "<div class='box_onvif_unadd_ip'>" + mcs_ip_address + ":" + msg.list[i].ip + "</div>"//IP地址
                + "<div class='box_onvif_unadd_port'>" + mcs_port + ":" + msg.list[i].port + "</div>"
                + "<div class='box_onvif_add_btn' uuid='" + msg.list[i].uuid + "' ip='" + msg.list[i].ip + "' port='" + msg.list[i].port + "' type='" + msg.list[i].type + "'>" + mcs_add + "</div>"
                + "</div>";
            } else if (!msg.list[i].conted == 0) { // 如果有列表但没有可添加设备
              setTimeout(function () {
                l_dom_onvif_searching.hide();
                l_dom_onvif_re_searching.show();
                l_dom_onvif_no_searching.show();
              }, 10000)
            }
          }
        } else { // 没有list
          setTimeout(function () {
            l_dom_onvif_searching.hide();
            l_dom_onvif_re_searching.show();
            l_dom_onvif_no_searching.show();
          }, 10000)
        }
        l_dom_box_onvif_unadd_box.html(onvif_unadd);
        let add_onvif_devices_box_height = document.getElementById("add_onvif_devices_box").offsetHeight;
        let height_onvif;
        if (window.fujikam == "fujikam") {
          let vimtag_device_list_box_height = document.getElementById("vimtag_device_list_box").offsetHeight;
          if (vimtag_device_list_box_height < add_onvif_devices_box_height) {
            height_onvif = add_onvif_devices_box_height + 500;
          } else {
            height_onvif = vimtag_device_list_box_height + 500;
          }
          $("#add_device_page").css('height', height_onvif);
        } else {
          if (document.body.scrollHeight < add_onvif_devices_box_height) {
            height_onvif = add_onvif_devices_box_height + 100;
          } else {
            height_onvif = document.body.scrollHeight + 100;
          }
          $("#add_device_page").css('height', height_onvif);
        }
        l_dom_box_onvif_add_btn = $(".box_onvif_add_btn");
        l_dom_box_onvif_add_btn.click(function () {
          onvif_uuid = $(this).attr('uuid');
          onvif_port = $(this).attr('port');
          onvif_ip = $(this).attr('ip');
          onvif_type = $(this).attr('type');
          conf.uuid = onvif_uuid;
          conf.port = onvif_port;
          conf.ip = onvif_ip;
          conf.type = onvif_type;
          create_add_onvif_ipc({ parent: _this.publicFunc.mx("#add_device_page") }) // 跳转到添加onvif页面
        })
      }

      function create_search_onvif_box_event (data) { // onvif搜索设备接口调用前置函数
        // onvif设备搜索,需要调用get_onvif_unadd将l_get_onvif_flag重置为false
        l_get_onvif_flag = false;
        // 如果从添加设备返回的页面，防止重复
        if (data === 1) { onvif_unadd = ''; }
        // 由于将get_onvif_unadd函数抽离成全局函数 导致以下数据定义在两个函数中无法兼顾获得所以需要定义声明两个地方
        let l_dom_onvif_searching = $("#onvif_searching");
        let l_dom_onvif_no_searching = $("#onvif_no_searching");
        let l_dom_onvif_re_searching = $("#onvif_re_searching");

        $("#add_devices_box_close").click(function () {
          $("#add_device_page").hide();
          // createPage("boxlist", obj);
          _this.create_boxlist_page(obj);
        })
        l_dom_onvif_re_searching.click(function () { // 点击重新搜索
          l_dom_onvif_searching.show();
          l_dom_onvif_re_searching.hide();
          l_dom_onvif_no_searching.hide();
          _this.$api.boxlist.onvif_box_search({ // 调用ccm_box_search接口
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
          }).then(res => {
            onvif_box_search_ack(res)
          })
        })
        _this.$api.boxlist.onvif_box_search({ // 调用ccm_box_search接口
          box_sn: _this.$store.state.jumpPageData.selectDeviceIpc
        }).then(res => {
          onvif_box_search_ack(res)
        })
      }
      function create_add_onvif_ipc (data) { // 关联部分dom结构
        data.parent.innerHTML =
          "<div id='add_onvif_devices_box'>"
          + "<div id='add_devices_box_menu'>"
          + "<div id='add_devices_box_back'>" + mcs_back + "</div>"
          + "<div id='add_devices_box_close'></div>"
          + "<div id='add_devices_box_title'>" + mcs_add_device + "</div>"
          + "</div>"
          + "<div id='add_devices_box_body'>"
          + "<div class='add_device_input_id_box' style='margin-top:164px'>"
          + "<div class='add_device_input_id_box_ico'></div>"
          + "<div id='add_device_input_id_box_del' class='add_device_input_id_box_del'></div>"
          + "<input id='add_device_input_id_box_input' class='add_device_input_id_box_input' placeholder='" + mcs_please_input_username + "'>"
          + "</div>"
          + "<div class='add_device_input_id_box'>"
          + "<div class='add_device_input_pass_box_ico'></div>"
          + "<div id='add_device_input_pass_box_del' class='add_device_input_id_box_del'></div>"
          + "<input id='add_device_input_pass' class='add_device_input_id_box_input' placeholder='" + mcs_input_password + "'>"
          + "</div>"
          + "<div id='add_device_submit'>" + mcs_add + "</div>"
          + "</div>"
          + "</div>";
        create_add_onvif_ipc_event();
      }
      function create_add_onvif_ipc_event () {
        _this.publicFunc.mx("#add_device_input_id_box_del").onclick = function () {
          _this.publicFunc.mx("#add_device_input_id_box_input").value = "";
        }
        _this.publicFunc.mx("#add_device_input_pass_box_del").onclick = function () {
          _this.publicFunc.mx("#add_device_input_pass").value = "";
        }
        _this.publicFunc.mx("#add_devices_box_close").onclick = function () { // 点击onvif添加设备关闭
          $("#add_device_page").hide();
          // createPage("boxlist", obj);
          _this.create_boxlist_page(obj);
        }
        _this.publicFunc.mx("#add_devices_box_back").onclick = function () { // 点击onvif添加设备返回
          create_search_onvif_box({ parent: _this.publicFunc.mx("#add_device_page"), add_onvif_back: 1 }); // onvif搜索页面
        }
        _this.publicFunc.mx("#add_device_submit").onclick = function () { // 点击onvif添加按钮
          // console.log("调用点击添加事件")
          onvif_username = $("#add_device_input_id_box_input").val()
          onvif_password = $("#add_device_input_pass").val()
          conf.username = onvif_username;
          conf.password = onvif_password;
          conf.enable = 1;
          conf.code_match = 0;
          conf.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
          conf.record = 0;
          conf.flag = 0;
          conf.no_ack = 0;
          // conf.func = onvif_box_add_ipc_ack;
          _this.$api.boxlist.onvif_box_add_ipc(conf).then(res => { //发送添加设备请求
            onvif_box_add_ipc_ack(res)
          })
        }
      }
      function array_diff (a, b) {  // 去除一个数组中包含另一个数组 (在全部展示列表中过滤掉onvif设备)
        for (let i = 0; i < b.length; i++) {
          for (let j = 0; j < a.length; j++) {
            if (a[j].sn == b[i].sn) {
              a.splice(j, 1);
              j = j - 1;
            }
          }
        }
        return a;
      }
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData // 页面创建相关对象
    if(this.$route.params){
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    }else{
      pageData = {parent: $("#" + this.$route.name)}
    }
    if(pageData.parent.length == 0){
      pageData.parent = $("#" + pageData.parentId)
    }
    // console.log(pageData,"pageData")
    await this.create_boxlist_page(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    // this.publicFunc.projectReload.call(this);
    window.create_boxlist_page = this.create_boxlist_page;
  }
}
</script>