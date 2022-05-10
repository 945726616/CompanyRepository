<template>
  <div id="devlist">
    <!-- 顶部设备列表菜单栏 -->
    <div id='device_list_menu' :style="fujikamFlag ? 'width:85%;height:40px;margin:0 auto;margin-top:20px' :''">
      <div id='device_list_tree_box' v-show="treeFlag" :style="treeBoxStyle">
        <div id='device_list_tree_div'>
          <div id='device_list_tree'>
            <div class='device_list_tree_level_box' id='device_list_tree_level_box'>
            </div>
            <div id='device_list_tree_all'>{{mcs_all}}</div><!-- 全选 -->
            <div id='device_list_tree_leaf'></div>
          </div>
        </div>
        <div id='device_list_tree_box_btn' :style="treeBoxBtnStyle"></div>
      </div>
      <div id='device_refresh_btn' @click="get_dev_list('refresh')"></div>
      <div id='dev_search' v-if="!$store.state.jumpPageData.localFlag">
        <input type='text' id='dev_search_input' :placeholder="placeholder" value=''>
        <div id='dev_search_btn'></div>
      </div>
      <div id='dev_filter_box' v-if="supportFilterFlag && !$store.state.jumpPageData.localFlag">
        <div id='online_btn'>
          <span id='online_btn_span'>{{mcs_all}}</span><!-- 全选 -->
          <div id='online_btn_direction' class='online_btn_down'></div>
        </div>
        <div id='online_btn_box'>
          <div id='online_btn_select_all'>{{mcs_all}}</div><!-- 全选 -->
          <div id='online_btn_select_online'>{{mcs_state_device_online}}</div><!-- 在线 -->
          <div id='online_btn_select_offline'>{{mcs_offline_status}}</div><!-- 离线 -->
        </div>
      </div>
      <div id='device_list_edit' v-if="!$store.state.jumpPageData.experienceFlag && !$store.state.jumpPageData.localFlag" class='device_list_menu' @click="click_edit_flag = !click_edit_flag">{{mcs_edit}}</div><!-- 编辑 -->
      <div id='device_add_btn' v-if="!$store.state.jumpPageData.experienceFlag && !$store.state.jumpPageData.localFlag" class='device_list_menu' @mouseenter="addHoverflag = true" @mouseleave="addHoverflag = false" @click="addDevClick">
        {{mcs_add_device}}
        <!-- 添加设备 -->
        <div id='device_add_btn_down' v-show="addHoverflag">{{mcs_click_add_equipment}}</div><!-- 点击添加设备(hover提示框) -->
      </div>
      <!-- 分屏轮播 -->
      <!-- <div id="split_screen" @click="jumpToSplitScreen">Split Screen</div> -->
    </div>
    <!-- 顶部设备列表菜单栏 结束 -->
    <!-- 设备列表展示部分 -->
    <div id='vimtag_device_list_box' :class="{'device_tree_class': treeListFlag === 1 && treeClassFlag}">
      <div v-if="!devlistEmptyFlag" style='overflow:hidden'>
        <!-- 摄像机展示 -->
        <div class='dev_box' style='overflow:hidden;font-size:15px'>
          <div id='dev_camera' :style="ipc_num === 1 ? 'display:block' : 'display:none'">{{mcs_camera}}</div><!-- 摄像机 -->
          <!-- 实现拖拽功能 -->
          <div :style='{width: autoImgWidth + "%", height: autoImgHeight + "px"}' class='device_list_img' v-for="IPCCamera in dev_list_dom" :key="IPCCamera.sn" :play='IPCCamera.play' :img='IPCCamera.img' :nick='IPCCamera.nick' :state='IPCCamera.stat' :sn="IPCCamera.sn" :dtype='IPCCamera.type' :addr='IPCCamera.addr' :sort="IPCCamera.sort ? IPCCamera.sort : ''" :tree="IPCCamera.tree ? IPCCamera.tree : ''" @ondrop='drop(event,this)' @ondragover='allowDrop(event)' draggable='true' @ondragstart='drag(event, this)'>
            <div class='device_list_alert_box'>
              <img class='device_list_move_ico' :sn="IPCCamera.sn" :src="require('@/assets/device/move.png')" alt=''>
              <img class='device_list_door_ico' :sn="IPCCamera.sn" :src="require('@/assets/device/door.png')" alt=''>
              <img class='device_list_sos_ico' :sn="IPCCamera.sn" :src="require('@/assets/device/sos.png')" alt=''>
            </div>
            <div class='device_list_img_child' :style='{height: (autoImgHeight - 34) + "px"}'>
              <div v-show="IPCCamera.imgFlag === undefined || IPCCamera.imgFlag" class='camera_sign_picture_div' @click="clickCameraSignPic(IPCCamera)">
                <img :src='IPCCamera.def_img' class='img_class' alt=''><!-- 图片 -->
              </div>
              <div class='camera_sign_video'></div>
            </div>
            <div class='device_nick'>
              <div class='device_list_del_ico' v-show="click_edit_flag" @click="delDevice(IPCCamera)"></div>
              <div class='device_list_sort_box' v-show="$store.state.user.supportTreeFlag && click_edit_flag">
                <input class='device_list_sort_num' :value='IPCCamera.sort || ""'>
                <div class='device_list_sort_btn' @click="setDeviceNickName(IPCCamera)">{{mcs_edit}}</div>
              </div>
              <span class='device_IPC_nick'>{{IPCCamera.nick}}</span>
            </div>
          </div>
        </div>
        <!-- 摄像机展示结束 -->
        <!-- 云盒子展示 -->
        <div class='dev_box' style='display:block;font-size:15px'>
          <div id='dev_cloudbox' :style="box_num == 1 ? 'display:block' : 'display:none'">{{mcs_cloud_box}}</div><!-- 云盒子 -->
          <div :style='{width: autoImgWidth + "%", height: autoImgHeight + "px"}' class='device_list_img' v-for="BoxItem in dev_list_dom_box" :key="BoxItem.sn" :play='BoxItem.play' :img='BoxItem.img' :nick='BoxItem.nick' :state='BoxItem.stat' :box_live='BoxItem.box_live ? BoxItem.box_live : 0' :sn="BoxItem.sn" :dtype='BoxItem.type' :addr='BoxItem.addr' :sort="BoxItem.sort ? BoxItem.sort : ''" :tree="BoxItem.tree ? BoxItem.tree : ''" @ondrop='drop(event,this)' @ondragover='allowDrop(event)' draggable='true' @ondragstart='drag(event, this)'>
            <div class='device_list_alert_box'>
              <img class='device_list_move_ico' :sn="BoxItem.sn" :src="require('@/assets/device/move.png')" alt=''>
              <img class='device_list_door_ico' :sn="BoxItem.sn" :src="require('@/assets/device/door.png')" alt=''>
              <img class='device_list_sos_ico' :sn="BoxItem.sn" :src="require('@/assets/device/sos.png')" alt=''>
            </div>
            <div class='device_list_img_child' :style='{height: (autoImgHeight - 34) + "px"}'>
              <div class='camera_sign_picture_div' @click="clickCameraSignPic(BoxItem)">
                <img :src='BoxItem.def_img' class='img_class' alt=''>
              </div>
              <div class='camera_sign_video'></div>
            </div>
            <div class='device_nick'>
              <div class='device_list_del_ico' v-show="click_edit_flag" @click="delDevice(BoxItem)"></div>
              <div class='device_list_sort_box' v-show="$store.state.user.supportTreeFlag && click_edit_flag">
                <input class='device_list_sort_num' :value='BoxItem.sort || ""'>
                <div class='device_list_sort_btn' @click="setDeviceNickName(BoxItem)">{{mcs_edit}}</div>
              </div>
              <span v-html="(BoxItem.nick.length < 14) ? BoxItem.nick : (BoxItem.nick.substr(0, 14) + '...')"></span>
            </div>
          </div>
        </div>
        <!-- 云盒子展示结束 -->
      </div>
      <!-- 没有设备时展示 -->
      <div v-else style='overflow:hidden;font-size:15px'>
        <div id='empty_div_img'></div>
        <div class='empty_div_txt'>{{mcs_your_device_list_empty}}</div>
      </div>
      <!-- 没有设备时展示内容结束 -->
    </div>
    <!-- 设备列表展示部分 结束 -->
    <!-- 本地设备列表输入密码处 -->
    <div id='input_password_page' v-if='local_input_sign'>
      <div id='input_password_box'>
        <div id='input_password_box_close' @click='local_password_box_close'></div>
        <div id='input_password_username'>
          <div id='input_password_username_ico'></div>
          <input type='text' id='input_password_username_input' readonly='readonly' :value='local_devlist_data.sn ? local_devlist_data.sn : mcs_input_device_id'>
          <div id='input_password_username_div'></div>
        </div>
        <div id='input_password_password'>
          <div id='input_password_password_ico'></div>
          <input :type='eye_hide_sign?"password":"text"' id='input_password_password_input' v-model='input_local_password'> <!-- 密码框输入密码可视状态 -->
          <div id='dev_pwd_eye' :class='eye_hide_sign?"dev_pwd_eye_hide":"dev_pwd_eye_show"' @click='eye_hide_sign = !eye_hide_sign'></div>
          <div id='input_password_password_div'></div>
        </div>
        <div id='input_password_submit' @click='local_input_password_submit'> {{mcs_ok}} </div>
      </div>
    </div>
    <!-- 使用添加设备弹窗组件 -->
    <device-Model :addDeviceModelObj='addDeviceModelObj' :addDeviceModel='addDeviceModel' :add_device_type_arr='add_device_type_arr' @closeModel='closeModel' :add_device_input_id='add_device_input_id'></device-Model>
  </div>
</template>
<style lang="scss">
@import 'index.scss';
</style>
<script>
import deviceModel from '../addDeviceModel'
export default {
  components: {
    deviceModel
  },
  computed: {
    fujikamFlag: function () { // 客户端判别标识
      if (window.fujikam === 'fujikam') {
        return true
      } else {
        return false
      }
    },
    supportFilterFlag: function () { // 支持在线/离线设备筛选标识
      return this.$store.state.user.supportFilterFlag
    },
    autoImgWidth: function () { // 动态计算图片宽度
      let device_list_num = sessionStorage.getItem("device_list_num") ? sessionStorage.getItem("device_list_num") : 4
      return 100 / device_list_num
    },
    autoImgHeight: function () { // 动态计算图片高度
      let singalImage = document.body.clientWidth * (this.autoImgWidth / 100)
      return (singalImage / 16 * 9) + 34
    }
  },
  data () {
    return {
      // 多国语言
      mcs_all: mcs_all,
      mcs_state_device_online: mcs_state_device_online,
      mcs_offline_status: mcs_offline_status,
      mcs_edit: mcs_edit,
      mcs_add_device: mcs_add_device,
      mcs_click_add_equipment: mcs_click_add_equipment,
      mcs_camera: mcs_camera,
      mcs_cloud_box: mcs_cloud_box,
      mcs_your_device_list_empty: mcs_your_device_list_empty,
      mcs_choose_device_type: mcs_choose_device_type,
      mcs_cloud_camera: mcs_cloud_camera,
      mcs_intelligent_cloud_camera: mcs_intelligent_cloud_camera,
      mcs_back: mcs_back,
      mcs_action_next: mcs_action_next,
      mcs_input_device_id: mcs_input_device_id,
      mcs_device_offline_use_iphone: mcs_device_offline_use_iphone,
      mcs_device_outdoor_camera_connect_power: mcs_device_outdoor_camera_connect_power,
      mcs_device_box_connect_power: mcs_device_box_connect_power,
      mcs_normal_device_connect_power: mcs_normal_device_connect_power,
      mcs_camera_turn_on_voice: mcs_camera_turn_on_voice,
      msc_use_ethernet_cable_connect: msc_use_ethernet_cable_connect,
      mcs_state_wait_device_online: mcs_state_wait_device_online,
      mcs_wifi_config_failure_reconnect: mcs_wifi_config_failure_reconnect,
      mcs_connect_ethernet_page_title: mcs_connect_ethernet_page_title,
      mcs_always_cannot_online: mcs_always_cannot_online,
      mcs_always_cannot_online_reason: mcs_always_cannot_online_reason,
      mcs_other_problem_with_feedback: mcs_other_problem_with_feedback,
      mcs_device_id: mcs_device_id,
      mcs_status: mcs_status,
      mcs_input_password: mcs_input_password,
      mcs_forgot_your_password: mcs_forgot_your_password,
      mcs_change: mcs_change,
      mcs_input_confirm_password: mcs_input_confirm_password,
      mcs_device_password_too_simple: mcs_device_password_too_simple,
      mcs_add_successfully: mcs_add_successfully,
      mcs_prompt_config_wifi: mcs_prompt_config_wifi,
      mcs_action_skip: mcs_action_skip,
      mcs_input_nick: mcs_input_nick,
      mcs_ok: mcs_ok,
      mcs_close: mcs_close,
      mcs_bseries_forget_password: mcs_bseries_forget_password,
      mcs_press_hole_restore_to_reset_password: mcs_press_hole_restore_to_reset_password,
      mcs_press_button_restore_to_reset_password: mcs_press_button_restore_to_reset_password,
      mcs_ethernet_configuration: mcs_ethernet_configuration,
      mcs_connect_power: mcs_connect_power,
      mcs_select_wifi_wizard: mcs_select_wifi_wizard,
      mcs_search_help: mcs_search_help,
      mcs_video_play_offline: mcs_video_play_offline,
      mcs_device_offline_reson: mcs_device_offline_reson,
      mcs_device_offline_first_reson: mcs_device_offline_first_reson,
      mcs_device_offline_check: mcs_device_offline_check,
      mcs_reconfigure: mcs_reconfigure,
      mcs_device_offline_fourth_reson: mcs_device_offline_fourth_reson,
      mcs_device_offline: mcs_device_offline,
      // 多国语言结束
      // 添加设备弹窗展示数组
      add_device_type_arr: [
        { type: 'p1', url: require('@/assets/device/add_p1.png'), name: 'P1' + mcs_intelligent_cloud_camera },
        { type: 'cp1', url: require('@/assets/device/add_cp1.png'), name: 'CP1' + mcs_intelligent_cloud_camera },
        { type: 'm1', url: require('@/assets/device/add_m1.png'), name: 'M1' + mcs_intelligent_cloud_camera },
        { type: '361', url: require('@/assets/device/add_361.png'), name: '361' + mcs_intelligent_cloud_camera },
        { type: 'cm1', url: require('@/assets/device/add_cm1.png'), name: 'CM1' + mcs_intelligent_cloud_camera },
        { type: 'b1', url: require('@/assets/device/add_b1.png'), name: 'B1' + mcs_intelligent_cloud_camera },
        { type: 's1', url: require('@/assets/device/add_s1.png'), name: mcs_cloud_box },
        { type: 'fisheye', url: require('@/assets/device/add_fisheye.png'), name: 'fisheye' + mcs_intelligent_cloud_camera },
        { type: 'b2', url: require('@/assets/device/b2.png'), name: 'B2' + mcs_intelligent_cloud_camera },
        { type: 'b3', url: require('@/assets/device/b3.png'), name: 'B3' + mcs_intelligent_cloud_camera }
      ],
      addDeviceBodyFlag: '',
      placeholder: this.$store.state.user.userLanguage === 'zh' ? '请输入关键词' : '', // 搜索input提示内容
      pageObj: null, // 页面数据
      addHoverflag: false, // 添加设备提示框展示标识
      addDeviceModel: false, // 添加设备弹窗控制标识
      addDeviceModelObj: {}, // 添加设备弹窗展示数组
      add_device_input_id: null, // 添加设备输入设备Id Input框value
      add_device_password: null, // 添加设备输入密码 Input框value
      edit_password_1st: null, // 修改密码第一次输入 Input框value
      edit_password_2nd: null, // 修改密码第二次输入 Input框value
      input_wifi_password: null, // 设置wifi密码输入
      input_device_nick: null, // 设置设备昵称输入
      dev_list_dom: [], // 摄像头设备数组
      dev_list_dom_box: [], // 云盒子设备数组
      connectNetTimeArr: [], // 等待网络链接定时器数组
      ipc_num: 0, // 是否存在摄像头设备标识
      box_num: 0, // 是否存在云盒子设备标识
      devlistEmptyFlag: false, // 设备列表为空标识
      treeFlag: false, // 树状结构标识
      treeClassFlag: false, // 树状结构样式添加标识
      treeListFlag: 1, // 默认树状列表标识
      treeBoxStyle: null, // 树状展示区域绑定style
      treeBoxBtnStyle: null, // 树状展示区域按钮绑定style
      tree_back_data: null, // 树状返回数据
      srcdiv: null,
      devlistData: null,
      searchData: [],
      filterData: [],
      searchDevId: '',
      devImgWidth: null,
      addDeviceList: [],
      addDeviceTime: '',
      tmpData: [],
      search_sort: [],
      search_tree: [],
      device_offline_sign: false, //判断点击关闭弹窗时当前设备是否离线
      click_edit_flag: false, // 是否点击编辑标识
      local_input_sign: false, //本地设备密码框是否显示
      eye_hide_sign: true, //本地设备输入密码是否显示
      local_devlist_data: {}, //本地点击设备数据
      input_local_password: '', //本地设备输入密码
    }
  },
  methods: {
    vimtagDevlist (obj) { // 设备列表入口函数
      let _this = this
      this.pageObj = obj
      // console.log("进入设备列表页" ,obj)
      // if (isAction) {
      //     $.playBar.Stop() // 录像播放停止
      // }
      // get_dev_list("refresh") // 刷新获取设备列表处理删除设备后回到列表页仍能对设备进行操作的问题
      // 展示遮罩层
      this.publicFunc.showBufferPage()
      // $("#buffer_page").show();
      obj.box_ipc = 0;
      // obj.parent[0].innerHTML = "";
      this.get_dev_list() //创建设备列表页面
      $(".device_list_sort_btn").click(function () { // 向cfsf添加sort（设备排序用） tree（显示树状列表用，不和昵称绑定）数据
        let sn = this.parentNode.parentNode.parentNode.getAttribute("sn");
        let tree = this.parentNode.parentNode.parentNode.getAttribute("tree");
        let sort = this.parentNode.parentNode.parentNode.getAttribute("sort");
        create_devices_group({ parent: $("#vimtag_device_list_box"), sn: sn, tree: tree, sort: sort }); // 点击编辑，显示设置设备分组页面
      })
      if ($("#dev_search_btn")) {
        $("#dev_search_btn").click(function () {
          let search_id = $("#dev_search_input").val();
          let tmp_data = [];
          if (search_id) {
            for (let i = 0; i < _this.filterData.length; i++) {
              if (_this.filterData[i].nick.indexOf(search_id) > -1 || _this.filterData[i].sn.indexOf(search_id) > -1) {
                tmp_data.push(_this.filterData[i])
              }
              _this.searchData = tmp_data;
              _this.device_list(tmp_data, search_id)
            }
          } else {
            _this.searchData = _this.devlistData;
            _this.device_list(_this.filterData)
          }
        })
        $("#dev_search_input").keyup(function () {
          let search_id = $("#dev_search_input").val();
          let tmp_data = [];
          if (search_id != _this.searchDevId) {
            _this.searchDevId = search_id;
            if (search_id) {
              for (let i = 0; i < _this.filterData.length; i++) {
                if (_this.filterData[i].nick.indexOf(search_id) > -1 || _this.filterData[i].sn.indexOf(search_id) > -1) {
                  tmp_data.push(_this.filterData[i])
                }
              }
              _this.searchData = tmp_data;
              _this.device_list(tmp_data, search_id)
            } else {
              _this.searchData = _this.devlistData;
              _this.device_list(_this.filterData)
            }
          }
        })
        $("#online_btn").click(function () {
          if ($("#online_btn_box").css("display") == "none") {
            $("#online_btn_box").slideDown();
            $("#online_btn_direction").attr('class', 'online_btn_up')
          } else {
            $("#online_btn_box").slideUp();
            $("#online_btn_direction").attr('class', 'online_btn_down')
          }
        })
        $("#online_btn_select_all").click(function () {
          $("#online_btn_box").hide();
          $("#online_btn_direction").attr('class', 'online_btn_down')
          $("#online_btn_span").html(mcs_all)
          $("#online_btn").attr('class', 'online_btn')
          _this.filterData = _this.devlistData;
          _this.device_list(_this.searchData)
        })

        $("#online_btn_select_online").click(function () {
          $("#online_btn_box").hide();
          $("#online_btn_direction").attr('class', 'online_btn_down')
          $("#online_btn_span").html(mcs_state_device_online)
          let tmp_data = [];
          let tmp_filter_data = [];
          $("#online_btn").attr('class', 'online_btn_active')
          for (let i = 0; i < _this.searchData.length; i++) {
            if (_this.searchData[i].stat == "Online") {
              tmp_data.push(_this.searchData[i])
            }
          }
          for (let j = 0; j < _this.devlistData.length; j++) {
            if (_this.devlistData[j].stat == "Online") {
              tmp_filter_data.push(_this.devlistData[j])
            }
          }
          _this.filterData = tmp_filter_data;
          _this.device_list(tmp_data)
        })
        $("#online_btn_select_offline").click(function () {
          $("#online_btn_box").hide();
          $("#online_btn_direction").attr('class', 'online_btn_down')
          $("#online_btn_span").html(mcs_offline_status)
          let tmp_data = [];
          let tmp_filter_data = [];
          $("#online_btn").attr('class', 'online_btn_active')
          for (let i = 0; i < _this.searchData.length; i++) {
            if (_this.searchData[i].stat == "Offline") {
              tmp_data.push(_this.searchData[i])
            }
          }
          for (let j = 0; j < _this.devlistData.length; j++) {
            if (_this.devlistData[j].stat == "Offline") {
              tmp_filter_data.push(_this.devlistData[j])
            }
          }
          _this.filterData = tmp_filter_data;
          _this.device_list(tmp_data)
        })
      }

      function create_devices_group (data) { //tree后设备树状分组弹出框
        data.parent.innerHTML +=
          "<div id='add_device_group_box'>" +
          "<div style='overflow:hidden'>" +
          "<div id='device_group_sn' class='device_group_box'>sn:" + data.sn + "</div>" +
          "<div id='input_password_box_close'></div>" +
          "</div>"

          +
          "<div class='device_group_box'>" +
          "<label for = 'group_name'>" + mrs_create_group + "</label>" +
          "<input id = 'group_name' placeholder='" + mrs_group_tip + "' value='" + data.tree + "'></input>" +
          "<div id='grounp_standard'>( " + mrs_tree_format + " : xxx.xxx.xxx... )</div>" +
          "</div>"

          +
          "<div class='device_group_box'>" +
          "<label for = 'device_sort'>" + mrs_sort + "</label>" +
          "<input id='device_sort' placeholder='" + mrs_sort_tip + "' value='" + data.sort + "'>" +
          "</div>"

          +
          "<div id='add_device_group_buttton'>" + mcs_ok + "</div>"

          +
          "</div>";

        function create_devices_group_event () {
          $("#device_sort").keyup(function () { //限制sort输入框只能输入正整数
            reg = /^[0-9]*[1-9][0-9]*$/;
            if (reg.test(this.value)) {
              dev_set_input_num = this.value;
            } else {
              this.value = "";
            }
          })

          $("#add_device_group_buttton").click(function () { //点击确定
            let treelist = $('#group_name').val();
            let num = $('#device_sort').val();
            let sn = data.sn
            // 调用tree接口
            _this.$api.devlist.service_record_set({
              keys: [_this.$store.state.user.name + "_" + sn + "_sort"],
              datas: [num]
            })
            _this.$api.devlist.service_record_set({
              keys: [_this.$store.state.user.name + "_" + sn + "_tree"],
              datas: [treelist]
            }).then(res => {
              if (res.rflags[0] === 0) {
                _this.publicFunc.msg_tips({ msg: mcs_set_successfully, type: "success", timeout: 3000 })
              }
            })
          })
          $("#input_password_box_close").click(function () { //点击关闭
            $("#add_device_group_box").hide()
            get_dev_list()
            // $("#device_list_tree_all").click(); 新加了点击全选清除sessionst
          })
        }
        create_devices_group_event();
      }

      window.onresize = function () { // 监听窗口改变事件
        if (!_this.$store.state.jumpPageData.localFlag && _this.$store.state.user.autoPlayFlag) { // 判断是否为客户端且为本地模式的自动播放情况
          this.device_list_load(); // 重载设备列表
        }
      }
    },
    get_dev_list (type) { // 获取设备列表
      if (type === 'refresh' && this.treeFlag === true) { // 树状样式是否添加判断
        this.treeClassFlag = true
      }
      if (this.$store.state.pcOfflineFlag === 1) { // 离线模式
        this.$store.dispatch('setLocalFlag', 1)
      }
      // console.log(this.$store.state.jumpPageData.localFlag, 'this.$store.state.jumpPageData.localFlag')
      if (this.$store.state.jumpPageData.localFlag) {
        // console.log('本地模式res进入')
        this.$api.local.local_devlist_get().then(res => {
          // console.log('本地模式res', res)
          this.device_list(res)
        })
      } else {
        if (!this.device_offline_sign) {
          // if (this.$store.state.jumpPageData.deviceData.length === 0 || type === 'refresh') {
            //发送设备列表请求
            this.$api.devlist.devs_refresh().then(res => {
              // console.log(res, '获取设备列表数据')
              this.devlist_get_ack(res)
            })
          // } else {
          //   this.devlist_get_ack(this.$store.state.jumpPageData.deviceData)
          // }
        }
      }
    },
    devlist_get_ack (data) { // 设备列表数据整理并存储
      // console.log("进入devlist_get_ack回调", data)
      let flag = 1 //从播放页面返回的标记，不发送cfsf请求
      if (data) {
        this.$store.dispatch('setDeviceData', data)
      } else {
        data = this.$store.state.jumpPageData.deviceData;
        flag = 0
      }
      for (let key in data) {
        this.search_sort[key] = this.$store.state.user.name + "_" + data[key].sn + "_sort"
        this.search_tree[key] = this.$store.state.user.name + "_" + data[key].sn + "_tree"
      }
      if (this.$store.state.user.supportTreeFlag && flag === 1) { //是不是支持树状结构
        this.get_service_record_list(0, data)
      } else if (this.$store.state.user.supportTreeFlag && flag === 0) { // 从播放页面返回，不发cfsf请求
        let back_flag = sessionStorage.getItem("back_flag")
        if (back_flag === null || !back_flag) {
          this.filterData = data // 解决返回后搜索设备功能无效问题
          this.tree_list(this.tree_back_data)
          this.device_list(this.tree_back_data)
        } else {
          let back_data = []
          let getNickRecord = sessionStorage.getItem("saveNickRecord")
          for (let m = 0; m < data.length; m++) {
            if (data[m].nick.indexOf(getNickRecord) > -1) {
              back_data.push(data[m])
            }
          }
          this.filterData = data; // 解决返回后搜索设备功能无效问题
          this.tree_list(this.tree_back_data)
          this.device_list(back_data)
        }
      } else {
        this.devlistData = this.$store.state.jumpPageData.deviceData;
        this.searchData = data
        this.filterData = data
        this.device_list(data)
      }
    },
    device_list (data, searchId) { // 设备列表渲染
      // console.log(data, 'device_list_data')
      this.dev_list_dom = [] // 清空设备列表数组
      this.dev_list_dom_box = [] // 清空云盒子设备列表数组
      this.publicFunc.closeBufferPage()
      let search_id = searchId ? searchId : ""
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].type === 'IPC') {
            this.ipc_num = 1
            data[i].play = 0
            data[i].img = 0
            this.dev_list_dom.push(data[i])
          }
          if (data[i].type === 'BOX') {
            this.box_num = 1
            data[i].play = 0
            data[i].img = 0
            this.dev_list_dom_box.push(data[i])
          }
        }
        this.devlistEmptyFlag = false
      } else {
        this.devlistEmptyFlag = true
      }
      if (this.$store.state.jumpPageData.localFlag) {
        this.device_event()
      } else {
        this.device_list_load()
      }
    },
    device_list_load () { // 设备块大小设置
      let _this = this
      let imgWidth = _this.autoImgWidth
      imgWidth = parseFloat(imgWidth) / 100
      let client_width = document.getElementById("vimtag_device_list_box") ? document.getElementById("vimtag_device_list_box").offsetWidth : null
      let dev_list_dom_width = client_width * imgWidth
      let dev_list_dom_height = dev_list_dom_width / 16 * 9 + 34
      let client_height = window.innerHeight
      let x_num = parseInt(client_width / dev_list_dom_width)
      let y_num = parseInt(client_height / dev_list_dom_height)
      let num = x_num * y_num
      let stop_scroll = null
      let asnyc_time = _this.$store.state.user.autoPlayFlag ? 2000 : 100

      function scroll_device_event () {
        if (document.getElementById("vimtag_device_list_box")) {
          let scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset // 兼容监听scrolltop
          if (_this.$store.state.user.autoPlayFlag) {
            stop_scroll = setInterval(() => {
              clearInterval(stop_scroll)
              let top = scrollTop - 111
              let show_height = Math.ceil(top / dev_list_dom_height) // 从第几行开始显示
              _this.device_event((show_height * x_num), num)
            }, asnyc_time)
          } else {
            clearInterval(stop_scroll)
            let top = scrollTop - 111
            let show_height = Math.ceil(top / dev_list_dom_height) // 从第几行开始显示
            _this.device_event((show_height * x_num), num)
          }
        }
      }
      stop_scroll = setInterval(() => {
        clearInterval(stop_scroll)
        _this.device_event(0, num)
      }, asnyc_time)
      window.onscroll = () => { // 滚动懒加载
        if (stop_scroll) {
          clearInterval(stop_scroll)
        }
        if (!_this.$store.state.jumpPageData.localFlag) {
          scroll_device_event()
        }
      }
      if (_this.$store.state.jumpPageData.localFlag) { //本地模式不触发懒加载
        scroll_device_event()
      }
    },
    device_event (n, num) { //n为第几个开始，num为显示的个数 每行显示设备数量以及设备列表数据中第几个开始展示
      let length
      let _this = this
      this.$nextTick(async () => {
        let camera_sign_picture_length = document.getElementsByClassName("camera_sign_picture_div").length
        if (this.$store.state.jumpPageData.localFlag) {
          n = 0
          length = camera_sign_picture_length
        } else {
          length = n + num > camera_sign_picture_length ? camera_sign_picture_length : n + num;
        }
        //add list click event
        for (let i = 0; i < camera_sign_picture_length; i++) {
          let l_dom_device_list_img = document.getElementsByClassName("camera_sign_picture_div")[i].parentNode.parentNode;
          let device_sn = l_dom_device_list_img.getAttribute("sn")
          // let device_info = mcloud_agent.devs
          if (i >= n && i < length) {
            if (l_dom_device_list_img.getAttribute("state") === "Online") {
              if (_this.$store.state.jumpPageData.localFlag) {
                if (l_dom_device_list_img.getAttribute("dtype") === "IPC") {
                  let local_play_data = {};
                  local_play_data.addr = l_dom_device_list_img.getAttribute("addr");
                  local_play_data.sn = l_dom_device_list_img.getAttribute("sn");
                  local_play_data.password = sessionStorage.getItem("pass_" + local_play_data.sn);
                  local_play_data.dom = $(".camera_sign_picture_div")[i].parentNode.childNodes[1];
                  local_play_data.profile_token = "p3";

                  await _this.$api.local.local_sign_in({ data: local_play_data }).then(async res => {
                    console.log('setLid', res.lid)
                    if (res.result === '') {
                      _this.$store.dispatch('setLid', res.lid) //登录返回lid head中
                      _this.$store.dispatch('setSid', res.sid)
                      _this.$store.dispatch('setSeq', res.seq)
                      await _this.$api.local.local_play({ data: local_play_data })
                    }
                  })
                } else if (l_dom_device_list_img.getAttribute("dtype") === "BOX") {
                  let local_play_data = {};
                  local_play_data.addr = l_dom_device_list_img.getAttribute("addr");
                  local_play_data.sn = l_dom_device_list_img.getAttribute("sn");
                  local_play_data.password = sessionStorage.getItem("pass_" + local_play_data.sn);
                  local_play_data.dom = $(".camera_sign_picture_div")[i].parentNode.childNodes[1];
                  local_play_data.profile_token = "p3";

                  await _this.$api.local.local_sign_in({ data: local_play_data }).then(async res => {
                    console.log('setLid', res.lid)
                    if (res.result === '') {
                      _this.$store.dispatch('setLid', res.lid) //登录返回lid head中
                      _this.$store.dispatch('setSid', res.sid)
                      _this.$store.dispatch('setSeq', res.seq)
                      await _this.$api.local.local_box({ data: local_play_data })
                    }
                  })
                }
              } else {
                if (l_dom_device_list_img.getAttribute("dtype") === "IPC") {
                  if (this.$store.state.user.autoPlayFlag) {
                    let is_play = l_dom_device_list_img.getAttribute("play");
                    if (is_play === 0) {
                      $($(".camera_sign_picture_div")[i].childNodes[0]).hide();
                      $(".camera_sign_picture_div")[i].childNodes[0].src = "";
                      l_dom_device_list_img.setAttribute("play", 1)
                      this.$api.devlist.play({
                        dom: $(".camera_sign_video")[i],
                        sn: l_dom_device_list_img.getAttribute("sn"),
                        profile_token: "p2"
                      }).then(res => {
                        console.log(res, '播放res')
                      })
                    }
                  } else {
                    let is_img = l_dom_device_list_img.getAttribute("img");
                    l_dom_device_list_img.setAttribute("img", 1)
                    if (is_img == 0) { //6.5.2
                      this.$api.devlist.load_noid_img({
                        refresh: this.pageObj.refresh ? 1 : 0,
                        sn: device_sn,
                        num: i,
                        dom: document.getElementsByClassName('device_list_img')
                      })
                    }
                  }
                } else {
                  let is_img = l_dom_device_list_img.getAttribute("img");
                  l_dom_device_list_img.setAttribute("img", 1)
                  if (is_img == '0') {
                    this.$api.devlist.load_noid_img({
                      refresh: this.pageObj.refresh ? 1 : 0,
                      sn: device_sn,
                      num: i,
                      dom: document.getElementsByClassName('device_list_img')
                    })
                  }
                }
              }
            } else {
              l_dom_device_list_img.setAttribute("img", 0)
            }
          } else {
            if (l_dom_device_list_img.getAttribute("dtype") === "IPC") {
              let is_play = l_dom_device_list_img.getAttribute("play");
              if (is_play == 1) {
                l_dom_device_list_img.setAttribute("play", 0)
                $(".camera_sign_video")[i].innerHTML = null;
                $($(".camera_sign_picture_div")[i].childNodes[0]).show();
                this.$api.devlist.load_noid_img({
                  refresh: this.pageObj.refresh ? 1 : 0,
                  sn: device_sn,
                  num: i,
                  dom: document.getElementsByClassName('device_list_img')
                })
              }
            }
          }
        }
      })
    },
    delDevClick () { // 点击设备的删除图标(未对接)
      $(".device_list_del_ico").on('click', function () {
        let _this_sn = this.parentNode.parentNode.getAttribute("sn");
        let _this_parent = this.parentNode.parentNode;
        _this.publicFunc.delete_tips({
          content: mcs_delete_device + "?",
          func: function () {
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
      })
    },
    clickCameraSignPic (item) { // 点击设备标记图片
      // console.log(item, 'item')
      if (item.stat === "Online") { // 设备在线
        //State Normal equipment click event
        this.$store.dispatch('setSelectDeviceIpc', item.sn) // 点击时获取sn
        this.$store.dispatch('setSelectNick', item.nick) // 点击时获取nick
        let type = item.type
        let state = item.stat
        let addr = item.addr
        if (state === "Online" && type === "IPC") {
          this.pageObj.addr = addr
          this.$router.push({ name: 'play', params: this.pageObj })
        } else if (state === "Online" && type === "BOX") {
          let box_live = item.box_live // 获取云盒子是否支持实时播放
          this.pageObj.addr = addr
          this.pageObj.box_live = box_live
          this.$router.push({ name: 'boxlist', params: this.pageObj })
        }
      } else if (item.stat === "InvalidAuth") { // 身份无效
        this.$store.dispatch('setSelectDeviceIpc', item.sn) // 点击时存储sn
        let type = item.type
        let addr = item.addr
        let domParentChild
        if (this.$store.state.jumpPageData.localFlag) { // 本地化内容暂缓
          for (let i = 0; i < this.dev_list_dom.length; i++) {
            if (item.sn === this.dev_list_dom[i].sn) {
              domParentChild = document.getElementsByClassName('camera_sign_picture_div')[i].parentNode.childNodes[1]
            }
          }
          if (type === "IPC") {
            this.local_devlist_data = {
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              addr: addr,
              dom: domParentChild,
              type: "IPC"
            }
          } else if (type === "BOX") {
            this.local_devlist_data = {
              sn: this.$store.state.jumpPageData.selectDeviceIpc,
              addr: addr,
              dom: domParentChild,
              type: "BOX"
            }
          }
          this.local_input_sign = true;
        } else { // 展示输入密码弹框
          this.addDeviceModel = true
          this.add_device_input_id = this.$store.state.jumpPageData.selectDeviceIpc
          this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'inputDevicePassword') // 切换至输入设备密码页面
          this.$set(this.addDeviceModelObj, 'menuTitle', mcs_action_add_device) // 设置输入设备密码页面顶部菜单标题
          this.$set(this.addDeviceModelObj, 'deviceType', type) // 设置设备类型
          // create_add_devices_box({ parent: $("#add_device_page"), sn: this.$store.state.jumpPageData.selectDeviceIpc });
        }
      } else if (item.stat === "Offline") { // 此处暂留 还未加入添加设备Dom
        this.$store.dispatch('setSelectDeviceIpc', item.sn) // 点击时存储sn
        let type = item.type
        let state = item.stat
        let addr = item.addr
        let nick = item.nick
        this.addDeviceModel = true
        this.add_device_input_id = this.$store.state.jumpPageData.selectDeviceIpc
        this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'offlineDeviceAlert')
        this.$set(this.addDeviceModelObj, 'deviceType', type) // 设置设备类型
        this.$set(this.addDeviceModelObj, 'menuTitle', nick) // 设置设备昵称
      }
    },
    delDevice (item) { // 点击删除设备图标
      let _this_sn = item.sn
      this.publicFunc.delete_tips({
        content: mcs_delete_device + "?",
        func: () => {
          this.$api.devlist.dev_del({
            sn: _this_sn,
          }).then(res => {
            this.publicFunc.msg_tips({
              msg: res.msg,
              type: res.type,
              timeout: 3000
            })
            if (res.type === 'success') {
              this.get_dev_list('refresh') // 刷新设备列表
            }
          })
        }
      })
    },
    closeModel () { // 子组件关闭弹窗
      if (this.addDeviceModelObj.addDeviceBodyFlag === "offlineDeviceAlert") {
        this.device_offline_sign = true;
      } else {
        this.device_offline_sign = false;
      }
      this.addDeviceModel = false
      this.addDeviceModelObj = {}
      this.add_device_input_id = null
      this.get_dev_list("refresh")
    },
    addDevClick () { // 添加设备点击事件
      // this.addDeviceTime = new Date().getTime();//日志 点击添加设备时间 暂时注释后续添加日志记录
      this.addHoverflag = false // 关闭添加设备hover下拉提示框
      this.addDeviceModel = true // 展示添加设备弹窗
      this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'chooseDevice') // 展示产品选择页面
      this.$set(this.addDeviceModelObj, 'menuTitle', mcs_choose_device_type) // 设置产品选择页面顶部菜单标题
    },
    jumpToSplitScreen () { // 点击跳转至分屏轮播页面
      this.$router.push({ name: 'splitScreen' })
    },
    setDeviceNickName (item) { // 树状分类结构特有的编辑设备昵称功能
      this.addDeviceModel = true // 展示添加设备弹窗
      this.$set(this.addDeviceModelObj, 'addDeviceBodyFlag', 'setTreeDeviceNick')
      this.$set(this.addDeviceModelObj, 'menuTitle', mcs_nick_modify)
      this.$set(this.addDeviceModelObj, 'treeDeviceId', item.sn)
      this.$set(this.addDeviceModelObj, 'treeDeviceNick', item.nick)
    },
    // 点击事件处理函数结束
    add_device_connect_power_event () {
      $("#add_devices_box_back").click(function () {
        add_device_input_id();
      })
      $("#add_devices_img").click(function () { //缺少删除步骤
        $('body').append('<embed src="./theme/device/startSound.mp3" autostart="true" hidden="true" loop="false">');
      });
      $("#add_devices_box_close").click(function () {
        close_add_page('add_dev');
      })
      $("#add_device_submit").click(add_device_connect_ethernet())
    },
    // 树状列表
    get_service_record_list (n, data) {
      let s_length = this.search_sort.length
      let tmp_search_sort = []
      let tmp_search_tree = []
      let back_flag
      if (s_length > n * 100) {
        let j = 0;
        for (let i = n * 100; i < s_length && i < (n + 1) * 100; i++) {
          tmp_search_sort[j] = this.search_sort[i]
          tmp_search_tree[j] = this.search_tree[i]
          j++
        }
        this.$api.devlist.service_record_get({ // 获取服务记录接口
          keys: tmp_search_sort
        }).then(res => {
          // console.log(res, 'service_record_get_   sort')
          if (res && res.ret === "") {
            for (let i = n * 100; i < res.datas.length + n * 100; i++) {
              data[i].sort = parseInt(res.datas[i]);
            }
          }
          this.$api.devlist.service_record_get({
            keys: tmp_search_tree
          }).then(res_tree => {
            if (res_tree && res_tree.ret === "") {
              for (let w = n * 100; w < res_tree.datas.length + n * 100; w++) {
                if (n == 0) {
                  data[w].tree = (res_tree.datas[w] !== "") ? res_tree.datas[w] : data[w].nick
                } else {
                  data[w].tree = (res_tree.datas[w - n * 100] !== "") ? res_tree.datas[w - n * 100] : data[w].nick
                }
              }
            }
            this.get_service_record_list(++n, data)
          })
        })
      } else {
        data = data.sort(compare)
        // console.log(data, 'sortAfterData')
        this.tree_back_data = data
        this.tree_list(data)
        this.devlistData = this.$store.state.jumpPageData.deviceData
        this.searchData = data
        this.filterData = data
        back_flag = sessionStorage.getItem("back_flag")
        if (back_flag === null || !back_flag) {
          // console.log(data, 'data1')
          this.device_list(data)
        } else {
          let back_data = []
          let getNickRecord = sessionStorage.getItem("saveNickRecord")
          for (let m = 0; m < data.length; m++) {
            if (data[m].nick.indexOf(getNickRecord) > -1) {
              back_data.push(data[m])
            }
            // console.log(data, 'data2')
            this.device_list(back_data)
          }
        }
      }

      function compare (obj1, obj2) { // compare 工具函数
        let val1 = obj1.sort;
        let val2 = obj2.sort;
        if (val1 < val2 || (!isNaN(val1)) && (isNaN(val2))) {
          return -1;
        } else if (val1 > val2 || (!isNaN(val2)) && (isNaN(val1))) {
          return 1;
        } else {
          return 0;
        }
      }
    },
    tree_list (data) {
      let _this = this
      // console.log(data, 'tree_list_data')
      this.treeFlag = true
      let height = document.documentElement.clientHeight
      this.treeBoxStyle = { "height": (height - 82) + "px" }
      this.treeBoxBtnStyle = { "margin-top": ((height - 82) / 2) + "px" }
      window.onscroll = () => {
        if (document.getElementById("device_list_tree")) {
          let scrollTop = document.documentElement.scrollTop
          if (scrollTop > 82) {
            this.treeBoxStyle = { "height": height + "px", "top": "0" }
          } else {
            this.treeBoxStyle = { "height": (height + scrollTop - 82) + "px", "top": (82 - scrollTop) + "px" }
          }
        }
      }
      let l_dom_device_list_tree_leaf = document.getElementById("device_list_tree_leaf")
      let data_1 = [],
        data_2 = []
      let req_data = []
      let tree_level = 0
      l_dom_device_list_tree_leaf.innerHTML = ""
      document.getElementById("device_list_tree_level_box").innerHTML = ""
      let tree_data_arr = []
      for (let i = 0; i < data.length; i++) {
        // tree_data_arr[i] = data[i].nick;
        tree_data_arr[i] = data[i].tree !== "" ? data[i].tree : data[i].nick
      }
      let data_1_pre = tree_data_arr // 解决sn名字不统一 树状结构变乱问题
      function change_data (arr) {
        let newarr = []
        for (let i = 0; i < arr.length; i++) {
          let text = arr[i]
          let re = /·|\s+/gi
          newarr[i] = text.replace(re, '.')
        }
        return newarr
      }
      data_1 = change_data(data_1_pre)
      // console.log(data_1, "data_1")

      for (let k = 0; k < data_1.length; k++) {
        let tmp_tree_level = data_1[k].split('.').length - 2;
        let index = data_1[k].lastIndexOf('.');
        let parent_id = data_1[k].substring(index, 0);
        let show_id = data_1[k].substring(index + 1, data_1[k].length);
        // console.log(tmp_tree_level, index, parent_id, show_id, 'show_id')

        if (tmp_tree_level > tree_level) { tree_level = tmp_tree_level; }
        let con = "";
        if (index === -1) {
          con = "<div class='tree_list_menu' child='" + data_1[k] + "'>" + show_id + "</div><div child='" + data_1[k] + "' id='" + data_1[k] + "_box' style='margin-left:20px;'></div>"
        }

        data_2[k] = {
          id: data_1[k],
          parent_id: parent_id,
          con: con
        }
      }
      // console.log(data_2, tree_level, 'before_tree_recursion')
      for (let j = 0; j < data_2.length; j++) {
        this.tree_recursion(data_2[j], tree_level);
      }
      let l_dom_tree_list_menu = document.getElementsByClassName("tree_list_menu")
      for (let l = 0; l < l_dom_tree_list_menu.length; l++) {
        let child = l_dom_tree_list_menu[l].getAttribute("child")
        jQuery(l_dom_tree_list_menu[l]).before("<div class='tree_list_display tree_list_display_active' child='" + child + "'></div>")
        l_dom_tree_list_menu[l].onclick = function () {
          jQuery(".tree_list_menu").removeClass("tree_list_menu_active");
          jQuery("#device_list_tree_all").removeClass("tree_list_menu_active");
          jQuery(this).addClass("tree_list_menu_active");
          let nick = this.getAttribute("child");
          let saveNickRecord = sessionStorage.setItem("saveNickRecord", nick);
          let back_flag = sessionStorage.setItem("back_flag", true);
          let tree_scroll_height = sessionStorage.setItem("tree_scroll_height", this.offsetTop);
          req_data = [];
          for (let m = 0; m < data_1.length; m++) {
            if (data_1[m].indexOf(nick) > -1) {
              req_data.push(data[m])
            }
          }
          // console.log(req_data, "req_data")
          _this.device_list(req_data);
        }
      }
      //Open
      let l_dom_tree_list_display = document.getElementsByClassName("tree_list_display");
      for (let n = 0; n < l_dom_tree_list_display.length; n++) {
        l_dom_tree_list_display[n].onclick = function () {
          let is_display = jQuery(this).hasClass("tree_list_display_active")
          let child = this.getAttribute("child")
          if (is_display) {
            jQuery(this).removeClass("tree_list_display_active")
            // mlocal_storage.set("tree_"+child,1)
            jQuery(mx("#" + child + "_box")).slideUp()
          } else {
            jQuery(this).addClass("tree_list_display_active")
            // mlocal_storage.set("tree_"+child)
            jQuery(mx("#" + child + "_box")).slideDown()
          }
        }
        // let tree_step_type = l_dom_tree_list_display[n].getAttribute("child");
        // let tree_step = mlocal_storage.get("tree_"+tree_step_type);
        // if(tree_step){
        //     jQuery(l_dom_tree_list_display[n]).removeClass("tree_list_display_active");
        //     jQuery(mx("#"+tree_step_type+"_box")).hide();
        // }
      }
      let back_flag = sessionStorage.getItem("back_flag"); //set scroll position
      if (back_flag && back_flag !== null) {
        let l_dom_device_list_tree = document.getElementById("device_list_tree");
        let scroll_height = sessionStorage.getItem("tree_scroll_height");
        l_dom_device_list_tree.scrollTop = scroll_height - 300;
      } //set scroll position

      //display tree
      mx("#device_list_tree_box_btn").onclick = function () {
        let is_display = jQuery("#device_list_tree").css("display");
        if (is_display == "none") {
          // g_treelist = 1;
          jQuery(this).css({ "background": "url(" + require('@/assets/device/tree_close.png') + ") no-repeat", "background-size": "100%" });
          jQuery("#device_list_tree").show()
          jQuery("#device_list_tree").animate({ "width": "120px", "padding-left": "10px", "padding-right": "10px" })
          jQuery("#vimtag_device_list_box").addClass("device_tree_class");
        } else {
          // g_treelist = 2;
          jQuery(this).css({ "background": "url(" + require('@/assets/device/tree_open.png') + ") no-repeat", "background-size": "100%" });
          jQuery("#device_list_tree").animate({ "width": "0px", "padding-left": "0px", "padding-right": "0px" }, function () { jQuery("#device_list_tree").hide() });
          jQuery("#vimtag_device_list_box").removeClass("device_tree_class");
        }
      }
      //select all ipc
      mx("#device_list_tree_all").onclick = function () { //点击设备列表全选
        jQuery(".tree_list_menu").removeClass("tree_list_menu_active");
        jQuery(this).addClass("tree_list_menu_active");
        // sessionStorage.clear()
        _this.device_list(data);
      }
      for (let lv = 0; lv < tree_level; lv++) {
        mx("#device_list_tree_level_box").innerHTML += "<div class='device_list_tree_level'>" + (lv + 1) + "</div>";
      }
      for (let lvl = 0; lvl < tree_level; lvl++) {
        mx(".device_list_tree_level")[lvl].index = lvl;
        mx(".device_list_tree_level")[lvl].onclick = function () {
          jQuery(".tree_list_display_parent_" + this.index).children(".tree_list_display").click();
        }
      }
    },
    tree_recursion (obj, num) {
      // console.log(obj, num, 'tree_recursion')
      let getNickRecord = sessionStorage.getItem("saveNickRecord")
      let l_dom_device_list_tree_leaf = document.getElementById("device_list_tree_leaf")
      if (obj.parent_id === "") {
        l_dom_device_list_tree_leaf.innerHTML += obj.con
      } else if (document.getElementById(obj.parent_id + "_box")) {
        document.getElementById(obj.parent_id + "_box").innerHTML += obj.con
      } else {
        let last_p_num = obj.parent_id.lastIndexOf(".");
        let parent_id = obj.parent_id.substr(0, last_p_num);
        let show_id = obj.parent_id.substring(last_p_num + 1, obj.parent_id.length);
        if (document.getElementById(obj.parent_id + "_box")) {
          document.getElementById(parent_id + "_box").innerHTML += obj.con
        } else {
          let con = "<div id='" + parent_id + "_box' class='tree_list_display_parent_" + num + "'><div class='tree_list_menu' child='" + obj.parent_id + "'>" + show_id + "</div><div child='" + obj.parent_id + "' id='" + obj.parent_id + "_box' style='margin-left:20px;'>" + obj.con + "</div></div>";
          this.tree_recursion({ id: obj.parent_id, parent_id: parent_id, con: con }, --num);
        }
      }
      if (obj.id == getNickRecord) {
        let a = jQuery(".tree_list_menu");
        a.each(function (i) {
          if ($(this).attr("child") === obj.id) {
            jQuery(this).addClass("tree_list_menu_active")
            sessionStorage.setItem("back_flag", true)
          }
        })
      }
    },
    // 树状列表 结束
    //实现拖拽功能
    allowDrop (ev) {
      ev.preventDefault();
    },
    drag (ev, divdom) {
      srcdiv = divdom;
      ev.dataTransfer.setData("text/html", divdom.innerHTML);
    },
    drop (ev, divdom) {
      ev.preventDefault();
      if (srcdiv != divdom) {
        srcdiv.innerHTML = divdom.innerHTML;
        divdom.innerHTML = ev.dataTransfer.getData("text/html");
      }
    },
    local_password_box_close () { //本地设备密码框点击关闭
      this.local_input_sign = false;
      this.input_local_password = '';
    },
    local_input_password_submit () { //本地设备输入密码确定提交
      let obj = this.pageObj;
      let data = this.local_devlist_data;
      let local_play_data = {};
      // local_play_data.addr = data.addr;
      local_play_data.sn = data.sn;
      local_play_data.password = this.input_local_password;
      local_play_data.dom = data.dom;
      local_play_data.profile_token = "p3";
      this.$api.local.local_sign_in({
        data: local_play_data
      }).then(res => {
        console.log('setLid', res.lid)
        if (res.result === "accounts.pass.invalid") {
          this.publicFunc.msg_tips({ msg: mcs_invalid_password, type: "error", timeout: 3000 })
        } else if (res.result === '') {
          this.$store.dispatch('setLid', res.lid) //登录返回lid head中
          this.$store.dispatch('setSid', res.sid)
          this.$store.dispatch('setSeq', res.seq)
          if (data.type == "IPC") {
            obj.addr = data.addr;
            this.$router.push({ name: 'play', params: obj })
          } else if (data.type == "BOX") {
            obj.addr = data.addr;
            this.$router.push({ name: 'boxlist', params: obj })
          }
          this.local_input_sign = false;
          this.input_local_password = '';
        }
      })
    }
  },
  async mounted () {
    let pageData; //页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    } else {
      pageData = { parent: $("#" + this.$route.name) }
    }
    console.log(pageData,"pageData", this.$route.name)
    await this.vimtagDevlist(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
    // this.publicFunc.projectReload.call(this);
  },
  created () {
    console.log('enter created deviceList')
    this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
  },
  destroyed () {
    console.log('destroty devlist')
  },
  watch: {
    "$store.state.jumpPageData.localFlag" (val) {
      if (val === 0) {
        this.vimtagDevlist(this.pageObj)
      }
    }
  }
}
</script>