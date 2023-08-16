<template>
  <div id="history"></div>
</template>
<script>
import '../../../lib/plugins/jquery.ui.datepicker.js'// jQuery日期选择插件
import '../../../lib/plugins/jquery.ui.datepicker-zh-CN.js' // 日期选择中文版
export default {
  methods: {
    vimtagHistory (obj) {
      let _this = this
      obj.parent.html()
      let a_start = obj.a_start ? obj.a_start : 0;
      let b_end = obj.b_end ? obj.b_end : 0;
      let prev_sid = '';
      let prev_cid = '';
      let next_cid = '';
      let next_sid = '';
      let vedio_day = [];
      let num = 0;//记录点击前一天次数
      // let pic_token = [];//记录请求列表图片传到后台的token
      let date_infos_time = [];// 解决cid返回后日期报错问题
      // $("#buffer_page").show();
      // 展示遮罩层
      _this.publicFunc.showBufferPage()
      function device_history_list (data) {
        _this.$store.dispatch('setHistoryData', data)
        if (data.date_infos_time) {
          date_infos_time = data.date_infos_time
        }
        let l_format = 2,
          l_category = 0,
          time_length = "30min",
          start_time = data.start_time,
          end_time = data.end_time,
          iscid = 0;
        // $("#buffer_page").hide();
        _this.publicFunc.closeBufferPage()
        obj.parent.html("<div id='vimtag_device_list_box'>"
          + "<div id='history_menu_box'>"
          + "<div id='back'><div id='main_title_box_return_img'></div>" + mcs_back + "</div>" // 返回
          + "<div id='history_menu_date'>"
          + "<div id='history_menu_date_img' class='history_menu_date_img'></div>" + mcs_date // 日期
          + "</div>"
          + "<div id='history_menu_filter'>"
          + "<div id='history_menu_filter_img' class='history_menu_filter_img'></div>" + mrs_filter // 筛选
          + "</div>"
          + "<div id='history_menu_edit'>"
          + "<div id='history_menu_edit_img' class='history_menu_edit_img'></div>" + mcs_edit // 编辑
          + "</div>"
          + "<div id='calendar_input'></div>"
          + "</div>"
          + "<div id='filter_menu_box'>"
          + "<div class='filter_list'>"
          + "<div class='filter_title'>" + mcs_format_options + "</div>" // 筛选部分条件
          + "<div id='filter_snapshot' class='filter_btn filter_format_btn' format='1'><label class='radiobox'><input name='currentRadio' type='radio'></label>" + mcs_snapshot + "</div>"
          + "<div id='filter_video' class='filter_btn filter_format_btn filter_btn_active' format='2'><label class='radiobox'><input name='currentRadio' type='radio' checked></label>" + mcs_record + "</div>"
          + "<div id='filter_video_snapshot' class='filter_btn filter_format_btn'  format='0'><label class='radiobox'><input name='currentRadio' type='radio'></label>" + mcs_all + "</div>"
          + "</div>"
          + "<div class='filter_list'>"
          + "<div class='filter_title'>" + mcs_category + "</div>"
          + "<div id='filter_event' class='filter_btn filter_category_btn' category='1'><label class='radiobox'><input name='currentRadio1' type='radio'></label>" + mcs_event + "</div>"
          + "<div id='filter_all_event' class='filter_btn filter_category_btn filter_btn_active' category='0'><label class='radiobox'><input name='currentRadio1' type='radio' checked></label>" + mcs_all + "</div>"
          + "</div>"
          + "<div class='filter_list'>"
          + "<div class='filter_title'>" + mcs_time_length + "</div>"
          + "<div id='time_length_1h' class='filter_btn filter_time_btn' time_length='1h'><label class='radiobox'><input name='currentRadio2' type='radio'></label>" + mcs_one_hour + "</div>"
          + "<div id='time_length_30min' class='filter_btn filter_time_btn filter_btn_active' time_length='30min'><label class='radiobox'><input name='currentRadio2' type='radio' checked></label>" + mcs_half_hour + "</div>"
          + "<div id='time_length_5min' class='filter_btn filter_time_btn' time_length='5min'><label class='radiobox'><input name='currentRadio2' type='radio'></label>" + mcs_five_min + "</div>"
          + "</div>"
          + "</div>"
          + "<div id='history_list_main'></div>"
          + "<div id='history_list_bottom'>"
          + "<div id='page_num_box'>"
          + "<div id='page_num_main'></div>"
          + "</div>"
          + "</div>"
          + "</div>")
        _this.publicFunc.mx("#history_menu_edit").onclick = function () {
          if ($(".video_delete").css("display") == "none") {
            $(".video_delete").show();
            $(this).css("color", "#00a6ba");
            $("#history_menu_edit_img").addClass('history_menu_choose_edit_img');
          } else {
            $(".video_delete").hide();
            $(this).css("color", "#323232");
            $("#history_menu_edit_img").removeClass('history_menu_choose_edit_img');
          }
        }
        _this.publicFunc.mx("#filter_snapshot").onclick = function () {  // 根据筛选条件获取视频播放列表
          $(".filter_list").eq(2).css("display", "none");
          l_format = 1;
          iscid = 0;
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#filter_video").onclick = function () {
          $(".filter_list").eq(2).css("display", "block");
          l_format = 2;
          iscid = 0;
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 1
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#filter_video_snapshot").onclick = function () {
          $(".filter_list").eq(2).css("display", "block");
          l_format = 0;
          iscid = 0;
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#filter_event").onclick = function () {
          l_category = 1;
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#filter_all_event").onclick = function () {
          l_category = 0;
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#time_length_1h").onclick = function () {
          time_length = "1h";
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#time_length_30min").onclick = function () {
          time_length = "30min";
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        _this.publicFunc.mx("#time_length_5min").onclick = function () {
          time_length = "5min";
          // 展示遮罩层
          _this.publicFunc.showBufferPage()
          _this.$api.history.history_list_get({ // 调用获取历史记录列表
            agent: data.agent,
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: data.dev_sn,
            start_time: start_time,
            end_time: end_time,
            format: l_format,
            category: l_category,
            time_length: time_length,
            search_type: 0
          }).then(res => {
            create_history_list(res)
          })
        }
        create_history_list(data);

        let l_dom_history_menu_filter = _this.publicFunc.mx("#history_menu_filter");
        let l_dom_history_menu_date = _this.publicFunc.mx("#history_menu_date");
        $("#calendar_input").datepicker({ //点击具体日期
          showOn: 'button',
          buttonImageOnly: true,
          date_infos: data.date_infos_time,
          onSelect: function (dateText, inst) {
            // console.log(inst, 'calendar_input_select_inst')
            start_time = new Date(dateText).format("yyyy.MM.dd.00.00.00");
            start_time = _this.$api.history.getDateForStringDate(start_time).getTime();
            num = vedio_day.length - vedio_day.indexOf(start_time) - 1; //点击完日期cid检索
            end_time = start_time + 60 * 60 * 24 * 1000;
            a_start = start_time;
            b_end = end_time;
            $("#calendar_input").hide();
            $("#history_menu_date").css("color", "#323232");//选择完日期恢复颜色
            $("#history_menu_date_img").removeClass('history_menu_choose_date_img');
            iscid = 0;//标记检索录像方式
            data.noreverse = 0;
            // 展示遮罩层
            _this.publicFunc.showBufferPage()
            _this.$api.history.history_list_get({ // 调用获取历史记录列表
              agent: data.agent,
              box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              dev_sn: data.dev_sn,
              start_time: start_time,
              end_time: end_time,
              format: 2,
              category: 0,
              time_length: "30min",
              search_type: 0
            }).then(res => {
              create_history_list(res)
            })
          }
        });
        $("#calendar_input").hide();
        l_dom_history_menu_date.onclick = function () {
          let is_display = $("#calendar_input").css("display");
          if (is_display == "none") {
            $(this).css("color", "#00a6ba");
            $("#history_menu_date_img").addClass('history_menu_choose_date_img');
            $("#calendar_input").show();
          } else {
            $(this).css("color", "#323232");
            $("#history_menu_date_img").removeClass('history_menu_choose_date_img');
            $("#calendar_input").hide();
          }
        }
        l_dom_history_menu_filter.onclick = function () {
          let is_display = $("#filter_menu_box").css("display");
          if (is_display == "none") {
            $(this).css("color", "#00a6ba");
            $("#history_menu_filter_img").addClass('history_menu_choose_filter_img');
            $("#filter_menu_box").slideDown();
          } else {
            $(this).css("color", "#323232");
            $("#history_menu_filter_img").removeClass('history_menu_choose_filter_img');
            $("#filter_menu_box").slideUp();
          }
        }
        _this.publicFunc.mx("#back").onclick = function () {
          _this.publicFunc.closeBufferPage()
          if (obj.back_page == "boxlist") {
            create_boxlist_page({ parent: obj.parent, agent: obj.agent, addr: obj.addr })
          } else if (obj.back_page == "playpage") {
            let jumpData;
            if (obj.box_ipc == 1) { //如果从云盒子设备回放返回到播放页面，把box_ipc传回去 
              jumpData = {parent: obj.parent, agent: obj.agent, addr: obj.addr, box_ipc: obj.box_ipc, ipc_sn: obj.ipc_sn, box_live: obj.box_live, ipc_stat: obj.ipc_stat}
              _this.$router.push({name:'play',params:jumpData})
              // createPage("play", { parent: obj.parent, agent: obj.agent, addr: obj.addr, box_ipc: obj.box_ipc, ipc_sn: obj.ipc_sn, box_live: obj.box_live, ipc_stat: obj.ipc_stat })
            } else {
              jumpData = {parent: obj.parent, agent: obj.agent, addr: obj.addr};
              _this.$router.push({name:'play',params:jumpData})
              // createPage("play", { parent: obj.parent, agent: obj.agent, addr: obj.addr })
            }

          }
        }
        function create_history_img_page (data) {
          let token = data.replace("_p3_", "_p0_")
          if (!_this.publicFunc.mx("#history_img_page")) {
            $("body").after(
              "<div id='history_img_page'>"
              + "<div id='history_img_box'>"
              + "<div id='history_img_page_close'></div>"
              + "<div id='history_img_main'><a id='history_img_a'><img id='history_img_show'><div id='history_img_page_download'></div></a></div>"
              + "</div>"
              + "</div>"
            )
            _this.publicFunc.mx("#history_img_page_close").onclick = function () {
              $("#history_img_page").remove();
            }
            _this.$api.history.history_list_get({
              sn: _this.$store.state.jumpPageData.selectDeviceIpc,
              flag: 2,
              token: token
            }).then(res => {
              $("#history_img_show").attr('src', res)
              $("#history_img_a").attr('download', new Date().getTime() + ".jpg")
              $("#history_img_a").attr("href", res);
            })
          }
        }

        function device_history_list_event (data) {
          $(".camera_sign_picture").click(function () {
            // console.log('camera_sign_picture1')
            let type = this.getAttribute("type");
            let num = this.parentNode.getAttribute("num");
            if (type == "video") {
              // console.log("camera_sign_picture2")
              obj.token = this.getAttribute("token");
              obj.download_token = this.getAttribute("download_token"); //解决因end_new_token 引起的视频无法下载问题
              obj.pic_token = this.getAttribute("pic_token");
              obj.start_time = this.getAttribute("start_time");
              obj.end_time = this.getAttribute("end_time");
              obj.data = data.video[num].cut_video_data;
              obj.a_start = a_start;
              obj.b_end = b_end;
              // createPage("playback", obj)
              _this.$router.push({name:'playback',params:obj})
            } else {
              // console.log("camera_sign_picture3")
              let token = this.getAttribute("pic_token");
              create_history_img_page(token);
            }
          })
          // console.log("camera_sign_picture4")
          $(".video_delete").click(function () {
            // console.log("camera_sign_picture5")
            let __this = this;
            let start_time = this.parentNode.parentNode.childNodes[3].getAttribute("start_time");
            let end_time = this.parentNode.parentNode.childNodes[3].getAttribute("end_time");
            _this.publicFunc.delete_tips({
              content: mcs_delete + "?", func: function () {
                _this.$api.history.history_delete({ // 调用历史删除接口
                  box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  dev_sn: obj.dev_sn,
                  start_time: start_time,
                  end_time: end_time
                }).then(res => {
                  if (res.type === 'success') {
                    $(__this.parentNode.parentNode).hide();
                    _this.publicFunc.msg_tips({ msg: mcs_delete_success, type: "success", timeout: 3000 })
                  } else {
                    _this.publicFunc.msg_tips({ msg: mcs_delete_fail, type: "error", timeout: 3000 })
                  }
                })
              }
            })
          })
          $("#page_num_day").click(function () { // onvif录像问题 load more //后加cid检索
            iscid = 1;
            if (num == vedio_day.length - 1) {
              _this.publicFunc.msg_tips({ msg: mrs_already_earliest_video, type: "warning", timeout: 3000 });
              return
            } else {
              let start_time = vedio_day[vedio_day.length - 2 - num];
              let end_time = start_time + 86400000;
              // 展示遮罩层
              _this.publicFunc.showBufferPage()
              _this.$api.history.history_list_get({ // 调用获取历史记录列表
                agent: data.agent,
                box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: data.dev_sn,
                start_time: start_time,
                end_time: end_time,
                format: l_format,
                category: l_category,
                time_length: time_length,
                search_type: 1,
                cid: prev_cid,
                sid: prev_sid
              }).then(res => {
                create_history_list(res)
              })
            }
            num++;
          })
        }
        function photoShowDom (data, i, start_time) {
          let domString = "<div class='history_list_img' style='position:relative;' num=" + i + " img='false'>"
            + "<div class='alarm_ico_div'>"
            + "<div class='alarm_sign_ico' style='display:" + (data.video[i].flag.motion_flag ? "block" : "none") + "'></div>"
            + "<div class='snapshot_sign_ico' style='display:" + (data.video[i].flag.snapshot_flag ? "block" : "none") + "'></div>"
            + "<div class='sos_sign_ico' style='display:" + (data.video[i].flag.sos_flag ? "block" : "none") + "'></div>"
            + "<div class='door_sign_ico' style='display:" + (data.video[i].flag.door_flag ? "block" : "none") + "'></div>"
            + "</div>"
            + "<div></div>"
            + "<div></div>"
            + "<div class='camera_sign_picture' type='photo' pic_token='" + data.video[i].cut_video_data[0].pic_token + "' token='" + data.video[i].cut_video_data[0].token + "' start_time='" + data.time[i].time_start + "' end_time='" + data.time[i].time_end + "'>"
            + "<img class='video_list_picture' num=" + i + ">"
            + "</div>"
            + "<div class='device_nick'>"
            + "<span>" + start_time + "</span>"
            + "<div class='video_delete'></div>"
            + "</div>"
            + "</div>";
          history_list_dom += domString
          photoDomArr.push(domString)
          photoTokenArr.push(data.video[i].cut_video_data[0].pic_token)
          return
        }

        function create_history_list (data) { // 创建回放列表
          // console.log(data, 'data')
          if (!data.date_infos_time) { // 解决日期报错问题
            data.date_infos_time = date_infos_time;
          }
          _this.$store.dispatch('setHistoryData', data)
          _this.publicFunc.closeBufferPage()
          if (data.vedio_day) {
            vedio_day = data.vedio_day;
          }// 解决onvif录像问题
          if (obj.backplay_flag == 4 && iscid !== 1) { //顺序问题
            data.noreverse = 1;
          }
          let data_time = data.noreverse ? data.time : data.time.reverse();
          let data_video = data.noreverse ? data.video : data.video.reverse();
          if (data.videosegs) {
            let videosegs = data.videosegs;// 解决onvif录像问题
            prev_cid = videosegs[0].token.split('_')[1]
            prev_sid = videosegs[0].token.split('_')[2]
            next_cid = videosegs[videosegs.length - 1].token.split('_')[1]
            next_sid = videosegs[videosegs.length - 1].token.split('_')[2]
          }
          let history_list_dom = "";
          let token = [];
          let photoDomArr = []
          let photoTokenArr = []
          if (data_time.length > 0) {
            let data_length = data_time.length;
            {  // 折叠原本dom代码
              for (let i = 0; i < data_length; i++) {
                let start_time = new Date(data.time[i].time_start).format("yyyy-MM-dd hh:mm:ss");
                if (data.video[i].is_photo) {
                  photoShowDom(data, i, start_time)
                } else {
                  //  console.log('在该处进行图片请求')
                  let end_token = data.video[i].cut_video_data[data.video[i].cut_video_data.length - 1].pic_token.substr(17);
                  let end_new_token = '_end.cid:' + end_token.split('_')[0] + '_end.sid:' + end_token.split('_')[1]; //加上这个解决视频播放不了问题
                  history_list_dom +=
                    "<div class='history_list_img' style='position:relative;' num=" + i + " img='false'>"
                    + "<div class='alarm_ico_div'>"
                    + "<div class='alarm_sign_ico' style='display:" + (data.video[i].flag.motion_flag ? "block" : "none") + "'></div>"
                    + "<div class='snapshot_sign_ico' style='display:" + (data.video[i].flag.snapshot_flag ? "block" : "none") + "'></div>"
                    + "<div class='sos_sign_ico' style='display:" + (data.video[i].flag.sos_flag ? "block" : "none") + "'></div>"
                    + "<div class='door_sign_ico' style='display:" + (data.video[i].flag.door_flag ? "block" : "none") + "'></div>"
                    + "</div>"
                    + "<div class='video_ico_show'></div>"
                    + "<div class='video_duration_show'>" + data.time[i].time_duration + "</div>"
                    + "<div class='camera_sign_picture' type='video' pic_token='" + data.video[i].cut_video_data[0].pic_token + "' download_token='" + data.video[i].cut_video_data[0].token + "' token='" + data.video[i].cut_video_data[0].token + end_new_token + "' start_time='" + data.time[i].time_start + "' end_time='" + data.time[i].time_end + "'>"
                    + "<img class='video_list_picture' num=" + i + ">"
                    + "</div>"
                    + "<div class='device_nick'>"
                    + "<span>" + start_time + "</span>"
                    + "<div class='video_delete'></div>"
                    + "</div>"
                    + "</div>";
                  token.push(data.video[i].cut_video_data[0].pic_token);
                }
                $("#history_list_bottom").show();
                $("#history_menu_filter").removeClass('notclick');
              }
            }
          } else {
            let historyExist = _this.publicFunc.mx("#history_list_main").innerHTML // 是否存在历史记录
            if (!historyExist) { // 如果历史列表内有历史视频内容则不展示无历史记录图片提示
              history_list_dom =
                "<div id='history_no_list'>"
                + "<div id='history_no_list_img'></div>"
                + "<div id='history_no_list_content'>" + mcs_no_history + "</div>"
                + "</div>"
            } else {
              _this.publicFunc.msg_tips({ msg: mrs_not_videos, type: "warning", timeout: 3000 });
            }
            $("#history_list_bottom").hide();
            $("#history_menu_filter").addClass('notclick');
          }
          let history_page_dom = "";
          history_page_dom += "<div id='page_num_day' class='page_num_btn_no'>" + mrs_load_more + "</div>" // onvif录像
          _this.publicFunc.mx("#page_num_main").innerHTML = history_page_dom;
          if (iscid == 1) { //如果cid检索录像，往下加载视频
            _this.publicFunc.mx("#history_list_main").innerHTML += history_list_dom;
          } else { //按照时间检索，直接显示检索出来的数据
            _this.publicFunc.mx("#history_list_main").innerHTML = history_list_dom;
          }
          let loopTime = 0
          function getPic () { // 获取图片方法
            function setPhotoDom () {
              photoDomArr.splice(0, 80)
              token = photoTokenArr.splice(0, 80)
            }
            if (photoDomArr.length > 0) { // 如果图片数组内含有内容
              setPhotoDom()
            }
            let l_dom_video_list_picture = _this.publicFunc.mx(".video_list_picture"); // nodeList 需要转换成普通数组之后才能显示正常的数组内容不会多出多余杂项
            let l_dom_new_video_list = [];
            if (l_dom_video_list_picture) {
              let iData;
              for (let i in l_dom_video_list_picture) {
                iData = i;
                let hasSrc = l_dom_video_list_picture[i].src;
                if (!hasSrc) {
                  l_dom_new_video_list.push(l_dom_video_list_picture[i])
                }
              }
              if (photoDomArr.length > 0) { // 快照请求图片
                _this.$api.history.history_img_get({
                  agent: obj.agent,
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  flag: 2,
                  token: token,
                  num: iData,
                  dom: l_dom_new_video_list,
                  picFlag: 1,
                  loopTime: loopTime
                })
                loopTime++
              } else { // 录像调用请求图片
                _this.$api.history.history_img_get({
                  agent: obj.agent,
                  sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                  flag: 2,
                  token: token,
                  num: iData,
                  dom: l_dom_new_video_list
                })
              }
            }
          }
          getPic() // 调用获取图片
          device_history_list_event(data);
          $(window).scroll(function () {
            if (photoDomArr.length > 0) {
              //let scrollHeight = document.body.scrollHeight - document.body.offsetHeight  // 全文可滚动高度
              let topp = $(document).scrollTop(); // 当前滚动条高度
              if (topp > 2800) { // 可以优化成每2800左右在去请求图片 当前效果还不错, 修改的话需要添加一个请求计数变量暂存请求次数
                getPic()
              }
            }
          })
        }
      }
      obj.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
      obj.flag = 2;
      obj.start_time = 0;
      obj.end_time = 0;
      obj.search_type = 1;
      obj.func = device_history_list;
      if (obj.backplay_flag == 4) {// 点击返回无效 修改obj.parent  _this.publicFunc.mx(page
        device_history_list(_this.$store.state.jumpPageData.historyData)
      } else {
        _this.$api.history.boxlist_device_messages_get(obj).then(res => {
          device_history_list(res)
        })
      }
    }
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if(this.$route.params){
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    }else{
      pageData = {parent: $("#" + this.$route.name)}
    }
    // console.log(pageData,"pageData")
    await this.vimtagHistory(pageData) // 进入页面后加载
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