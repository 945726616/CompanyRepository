<template>
  <div id='history'>
    <div id='vimtag_device_list_box'>
      <div id='history_menu_box'>
        <!-- 返回 -->
        <div id='back' @click='back_btn'>
          <div id='main_title_box_return_img'></div> {{mcs_back}}
        </div>
        <div id='history_menu_date' @click='menu_date_sign = !menu_date_sign' :style='menu_date_sign?"color:#00a6ba":"color:#323232"'>
          <!-- 日期 -->
          <div id='history_menu_date_img' :class='menu_date_sign?"history_menu_choose_date_img history_menu_date_img":"history_menu_date_img"'></div> {{mcs_date}}
        </div>
        <div id='history_menu_filter' @click='menu_filter_sign = !menu_filter_sign' :style='menu_filter_sign?"color:#00a6ba":"color:#323232"'>
          <!-- 筛选 -->
          <div id='history_menu_filter_img' :class='menu_filter_sign?"history_menu_filter_img history_menu_choose_filter_img":"history_menu_filter_img"'></div> {{mrs_filter}}
        </div>
        <div id='history_menu_edit' @click='menu_edit_sign = !menu_edit_sign' :style='menu_edit_sign?"color:#00a6ba":"color:#323232"'>
          <!-- 编辑 -->
          <div id='history_menu_edit_img' :class='menu_edit_sign?"history_menu_choose_edit_img history_menu_edit_img":"history_menu_edit_img"'></div> {{mcs_edit}}
        </div>
        <div id='calendar_input' v-show='menu_date_sign'></div>
      </div>
      <div id='filter_menu_box'>
        <div class='filter_list'>
          <!-- 筛选部分条件 -->
          <div class='filter_title'> {{mcs_format_options}} </div>
          <div id='filter_snapshot' class='filter_btn filter_format_btn' format='1'>
            <label class='radiobox' @change='filter_snapshot_btn'>
              <input name='currentRadio' type='radio' :checked='filter_type.format_options == 1'> {{mcs_snapshot}}
            </label>
          </div>
          <div id='filter_video' class='filter_btn filter_format_btn filter_btn_active' format='2'>
            <label class='radiobox' @change="filter_video_btn">
              <input name='currentRadio' type='radio' :checked='filter_type.format_options == 2'> {{mcs_record}}
            </label>
          </div>
          <div id='filter_video_snapshot' class='filter_btn filter_format_btn' format='0'>
            <label class='radiobox' @change="filter_video_snapshot_btn">
              <input name='currentRadio' type='radio' :checked='filter_type.format_options == 0'> {{mcs_all}}
            </label>
          </div>
        </div>
        <div class='filter_list'>
          <div class='filter_title'> {{mcs_category}} </div>
          <div id='filter_event' class='filter_btn filter_category_btn' category='1'>
            <label class='radiobox' @change="filter_event_btn">
              <input name='currentRadio1' type='radio' :checked='filter_type.category == 1'> {{mcs_event}}
            </label>
          </div>
          <div id='filter_all_event' class='filter_btn filter_category_btn filter_btn_active' category='0'>
            <label class='radiobox' @change="filter_all_event_btn">
              <input name='currentRadio1' type='radio' :checked='filter_type.category == 0'> {{mcs_all}}
            </label>
          </div>
        </div>
        <div class='filter_list' v-if='filter_type.format_options != 1'>
          <div class='filter_title'> {{mcs_time_length}} </div>
          <div id='time_length_1h' class='filter_btn filter_time_btn' time_length='1h'>
            <label class='radiobox' @change="time_length_1h_btn">
              <input name='currentRadio2' type='radio' :checked='filter_type.time_length == "1h"'>{{mcs_one_hour}}
            </label>
          </div>
          <div id='time_length_30min' class='filter_btn filter_time_btn filter_btn_active' time_length='30min'>
            <label class='radiobox' @change="time_length_30min_btn">
              <input name='currentRadio2' type='radio' :checked='filter_type.time_length == "30min"'> {{mcs_half_hour}}
            </label>
          </div>
          <div id='time_length_5min' class='filter_btn filter_time_btn' time_length='5min'>
            <label class='radiobox' @change="time_length_5min_btn">
              <input name='currentRadio2' type='radio' :checked='filter_type.time_length == "5min"'> {{mcs_five_min}}
            </label>
          </div>
        </div>
      </div>
      <div id='history_list_main' v-if='history_data && history_data.length>0'>
        <div v-for='(item,index) in history_data' :key='index' class='history_list_img' style='position:relative;' :num='index' img='false'>
          <div class='alarm_ico_div'>
            <div class='alarm_sign_ico' v-if='item.flag.motion_flag'></div>
            <div class='snapshot_sign_ico' v-if='item.flag.snapshot_flag'></div>
            <div class='sos_sign_ico' v-if='item.flag.sos_flag'></div>
            <div class='door_sign_ico' v-if='item.flag.door_flag'></div>
          </div>
          <div class='video_ico_show' v-if='!item.is_photo'></div>
          <div class='video_duration_show' v-if='!item.is_photo'>{{item.time_duration}}</div>
          <div class='camera_sign_picture' v-if='!item.is_photo' type='video' :pic_token='item.cut_video_data[0].pic_token' :download_token='item.cut_video_data[0].token' :token='item.cut_video_data[0].token + item.end_new_token' :start_time='item.time_start' :end_time='item.time_end' @click='camera_sign_picture_btn'>
            <img class='video_list_picture' :num='index'>
          </div>
          <div class='camera_sign_picture' v-else type='photo' :pic_token='item.cut_video_data[0].pic_token' :token='item.cut_video_data[0].token' :start_time='item.time_start' :end_time='item.time_end' @click='photo_sign_picture_btn'>
            <img class='video_list_picture' :num='index'>
          </div>
          <div class='device_nick'>
            <span> {{start_time[index]}} </span>
            <div class='video_delete' v-if='menu_edit_sign' @click='video_delete_btn'></div>
          </div>
        </div>
      </div>
      <div id='history_list_main' v-else>
        <div id='history_no_list'>
          <div id='history_no_list_img'></div>
          <div id='history_no_list_content'>{{mcs_no_history}}</div>
        </div>
      </div>
      <div id='history_list_bottom' v-if='history_data.length>0'>
        <div id='page_num_box'>
          <div id='page_num_main'>
            <div id='page_num_day' class='page_num_btn_no' @click="load_more_btn">{{mrs_load_more}}</div>
          </div>
        </div>
      </div>
    </div>
    <div id='history_img_page' v-if="picture_data_sign.src">
      <div id='history_img_box'>
        <div id='history_img_page_close' @click="picture_data_sign.src = ''"></div>
        <div id='history_img_main'>
          <a id='history_img_a' :href="picture_data_sign.src" :download="picture_data_sign.time + '.jpg'">
            <img id='history_img_show' :src='picture_data_sign.src'>
            <div id='history_img_page_download'></div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../../../lib/plugins/jquery.ui.datepicker.js' // jQuery日期选择插件
import '../../../lib/plugins/jquery.ui.datepicker-zh-CN.js' // 日期选择中文版
import { historyMixin } from '../mixin.js'
export default {
  mixins: [historyMixin],
  data () {
    return {
      //多国语言
      mcs_back: mcs_back, //返回
      mcs_date: mcs_date, //日期
      mrs_filter: mrs_filter, //筛选
      mcs_edit: mcs_edit, //编辑
      mcs_format_options: mcs_format_options, //格 式 :
      mcs_snapshot: mcs_snapshot, //快照
      mcs_record: mcs_record, //录像
      mcs_all: mcs_all, //全选
      mcs_category: mcs_category, //类 别 :
      mcs_event: mcs_event, //事件
      mcs_time_length: mcs_time_length, //时 长 :
      mcs_one_hour: mcs_one_hour, //一小时
      mcs_half_hour: mcs_half_hour, //半小时
      mcs_five_min: mcs_five_min, //五分钟
      mcs_no_history: mcs_no_history, //无历史记录
      mrs_load_more: mrs_load_more, //加载更多

      menu_edit_sign: false, //是否点击编辑
      menu_filter_sign: false, //是否点击筛选
      menu_date_sign: false, //是否点击日期
      photo_list_sign: false, //历史数据是否包含照片格式
      // vimtag即使是日期请求也仅仅为点击后的第一次为使用search_type = 0的日期请求后续点击加载更多则为使用search_type = 1的cid请求
      max_counts: 15000, // 获取历史录像列表的最大请求segment数量
    }
  },
  async mounted () {
    let _this = this;
    await _this.$chooseLanguage.lang(_this.$store.state.user.userLanguage)
    _this.publicFunc.showBufferPage();
    _this.history_info = _this.$route.params;
    _this.history_info.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
    _this.history_info.flag = 2;
    _this.history_info.start_time = 0;
    _this.history_info.end_time = 0;
    _this.history_info.search_type = 1;
    _this.history_info.max_counts = _this.max_counts
    // _this.a_start = _this.history_info.a_start ? _this.history_info.a_start : 0;
    // _this.b_end = _this.history_info.b_end ? _this.history_info.b_end : 0;

    if (_this.history_info.backplay_flag == 4) { // 点击返回无效 修改obj.parent  _this.publicFunc.mx(page
      _this.history_initial_data = _this.$store.state.jumpPageData.historyData;
    } else {
      await _this.$api.history.history_list_get(_this.history_info).then(res => {
        _this.history_initial_data = res;
      })
    }
    _this.history_initial_data.back_page = _this.history_info.back_page;
    _this.choose_start_time = _this.history_initial_data.start_time;
    _this.choose_end_time = _this.history_initial_data.end_time;
    _this.$store.dispatch('setHistoryData', _this.history_initial_data)

    if (_this.history_initial_data.date_infos_time) {
      _this.date_infos_time = _this.history_initial_data.date_infos_time;
    }

    _this.create_history_list(_this.history_initial_data)
    $("#calendar_input").datepicker({ //点击具体日期
      showOn: 'button',
      buttonImageOnly: true,
      date_infos: _this.history_initial_data.date_infos_time,
      onSelect: function (dateText, inst) {
        // console.log(inst, 'calendar_input_select_inst')
        let start_time = new Date(dateText).format("yyyy.MM.dd.00.00.00");
        start_time = _this.$api.history.getDateForStringDate(start_time).getTime();
        let num = _this.vedio_day.length - _this.vedio_day.indexOf(start_time) - 1; //点击完日期cid检索
        let end_time = start_time + 60 * 60 * 24 * 1000;
        // let a_start = start_time;
        // let b_end = end_time;

        _this.choose_start_time = start_time;
        _this.choose_end_time = end_time;
        _this.menu_date_sign = false;
        _this.iscid = 0; //标记检索录像方式
        _this.history_initial_data.noreverse = 0;
        // 展示遮罩层
        _this.publicFunc.showBufferPage()
        _this.$api.history.history_list_get({ // 调用获取历史记录列表
          agent: _this.history_initial_data.agent,
          box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
          dev_sn: _this.history_initial_data.dev_sn,
          start_time: start_time,
          end_time: end_time,
          format: _this.filter_type.format_options,
          category: _this.filter_type.category,
          time_length: _this.filter_type.time_length,
          search_type: 0,
          max_counts: _this.max_counts // 全局max_counts(最大请求segment数量)
        }).then(res => {
          // console.log(res)
          _this.create_history_list(res)
        })
      }
    });
  },
  methods: {
    create_history_list (data) { //创建历史列表
      let _this = this;
      if (!_this.iscid) {
        _this.history_data = [];
        _this.start_time = [];
        _this.token = [];
      }
      if (!data.date_infos_time) { // 解决日期报错问题
        data.date_infos_time = _this.date_infos_time;
      }
      _this.$store.dispatch('setHistoryData', data);
      _this.publicFunc.closeBufferPage();
      if (data.vedio_day) {
        _this.vedio_day = data.vedio_day;
      } // 解决onvif录像问题
      if (_this.history_info.backplay_flag == 4 && _this.iscid !== 1) { //顺序问题
        data.noreverse = 1;
      }
      let data_time = data.noreverse ? data.time : data.time.reverse();
      let data_video = data.noreverse ? data.video : data.video.reverse();
      if (data.videosegs) {
        let videosegs = data.videosegs; // 解决onvif录像问题
        _this.prev_cid = videosegs[0].token.split('_')[1]
        _this.prev_sid = videosegs[0].token.split('_')[2]
        _this.next_cid = videosegs[videosegs.length - 1].token.split('_')[1]
        _this.next_sid = videosegs[videosegs.length - 1].token.split('_')[2]
      }

      let photoTokenArr = []
      if (data_time.length > 0) {
        for (let i = 0; i < data_time.length; i++) {
          _this.start_time.push(new Date(data.time[i].time_start).format("yyyy-MM-dd hh:mm:ss"));
          data.video[i].time_duration = data.time[i].time_duration;
          data.video[i].time_start = data.time[i].time_start;
          data.video[i].time_end = data.time[i].time_end;
          _this.history_data.push(data.video[i])
          if (!data.video[i].is_photo) {
            let end_token = data.video[i].cut_video_data[data.video[i].cut_video_data.length - 1].pic_token.substr(17);
            let end_new_token = '_end.cid:' + end_token.split('_')[0] + '_end.sid:' + end_token.split('_')[1]; //加上这个解决视频播放不了问题
            _this.token.push(data.video[i].cut_video_data[0].pic_token);
            data.video[i].end_new_token = end_new_token;
          } else {
            photoTokenArr.push(data.video[i].cut_video_data[0].pic_token)
          }
        }
        $("#history_menu_filter").removeClass('notclick');
      } else {
        $("#history_menu_filter").addClass('notclick');
      }
      let loopTime = 0
      getPic(_this.history_data);

      function getPic (data) { // 获取图片方法
        _this.$nextTick(function () {
          let l_dom_video_list_picture = _this.publicFunc.mx(".video_list_picture"); // nodeList 需要转换成普通数组之后才能显示正常的数组内容不会多出多余杂项
          for (let i in l_dom_video_list_picture) {
            if (l_dom_video_list_picture[i].parentNode) {
              l_dom_video_list_picture[i].setAttribute('src', ' ')
              if (l_dom_video_list_picture[i].parentNode.getAttribute('type') === 'photo') {
                this.photo_list_sign = true;
                break;
              } else {
                this.photo_list_sign = false;
              }
            }
          }
          if (this.photo_list_sign) {
            _this.token = photoTokenArr.splice(0, 80)
          }
          if (l_dom_video_list_picture) {
            if (this.photo_list_sign) { // 快照请求图片
              _this.$api.history.history_img_get({
                agent: _this.history_info.agent,
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                flag: 2,
                token: _this.token,
                num: l_dom_video_list_picture.length,
                dom: l_dom_video_list_picture,
                picFlag: 1,
                loopTime: loopTime
              })
              loopTime++
            } else { // 录像调用请求图片
              _this.$api.history.history_img_get({
                agent: _this.history_info.agent,
                sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                flag: 2,
                token: _this.token,
                num: l_dom_video_list_picture.length,
                dom: l_dom_video_list_picture
              })
            }
          }
        })
      }
      $(window).scroll(() => {
        if (this.photo_list_sign) {
          //let scrollHeight = document.body.scrollHeight - document.body.offsetHeight  // 全文可滚动高度
          let topp = $(document).scrollTop(); // 当前滚动条高度
          if (topp > 2800) { // 可以优化成每2800左右在去请求图片 当前效果还不错, 修改的话需要添加一个请求计数变量暂存请求次数
            getPic()
          }
        }
      })
    },
    back_btn () { //返回
      console.log(this.history_info.back_page, 'history_info.back_page')
      this.publicFunc.closeBufferPage()
      if (this.history_info.back_page == "boxlist") {
        this.$router.push({ name: 'boxlist', params: { agent: this.history_info.agent, addr: this.history_info.addr } })
      } else if (this.history_info.back_page == "playpage") {
        let jumpData;
        if (this.history_info.box_ipc == 1) { //如果从云盒子设备回放返回到播放页面，把box_ipc传回去 
          jumpData = { agent: this.history_info.agent, addr: this.history_info.addr, box_ipc: this.history_info.box_ipc, ipc_sn: this.history_info.ipc_sn, box_live: this.history_info.box_live, ipc_stat: this.history_info.ipc_stat }
          this.$router.push({ name: 'play', params: jumpData })
        } else {
          jumpData = { agent: this.history_info.agent, addr: this.history_info.addr };
          this.$router.push({ name: 'play', params: jumpData })
        }
      }
    },
    load_more_btn () { //点击加载更多
      this.iscid = 1;
      if (this.num == this.vedio_day.length - 1) {
        this.publicFunc.msg_tips({ msg: mrs_already_earliest_video, type: "warning", timeout: 3000 });
        return
      } else {
        let start_time = this.vedio_day[this.vedio_day.length - 2 - this.num];
        let end_time = start_time + 86400000;
        // 展示遮罩层
        this.publicFunc.showBufferPage()
        this.$api.history.history_list_get({ // 调用获取历史记录列表
          agent: this.history_initial_data.agent,
          box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
          dev_sn: this.history_initial_data.dev_sn,
          start_time: start_time,
          end_time: end_time,
          format: this.filter_type.format_options,
          category: this.filter_type.category,
          time_length: this.filter_type.time_length,
          search_type: 1,
          cid: this.prev_cid,
          sid: this.prev_sid,
          max_counts: this.max_counts // 全局max_counts(最大请求segment数量)
        }).then(res => {
          this.create_history_list(res)
        })
      }
      this.num++;
    },
    video_delete_btn (e) { //删除录像
      let _this = this;
      let history_dom = e.currentTarget.parentNode.parentNode;
      let start_time = history_dom.childNodes[3].getAttribute("start_time");
      let end_time = history_dom.childNodes[3].getAttribute("end_time");
      _this.publicFunc.delete_tips({
        content: mcs_delete + "?",
        func: function () {
          _this.$api.history.history_delete({ // 调用历史删除接口
            box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            dev_sn: _this.history_info.dev_sn,
            start_time: start_time,
            end_time: end_time
          }).then(res => {
            if (res.type === 'success') {
              history_dom.style.display = "none";
              _this.publicFunc.msg_tips({ msg: mcs_delete_success, type: "success", timeout: 3000 })
            } else {
              _this.publicFunc.msg_tips({ msg: mcs_delete_fail, type: "error", timeout: 3000 })
            }
          })
        }
      })
    },
  },
  watch: {
    menu_filter_sign (val) {
      if (val) {
        $("#filter_menu_box").slideDown();
      } else {
        $("#filter_menu_box").slideUp();
      }
    },
    filter_type: {
      handler (val) {
        this.num = 0;
      },
      deep: true
    }
  }
}
</script>

<style src="./index.scss" lang='scss'>
</style>