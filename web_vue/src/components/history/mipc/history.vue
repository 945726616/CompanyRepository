<template>
  <div id='history'>
    <div id='history_list_bottom'>
      <div id='page_num_box'>
        <div id='page_num_main' v-if='all_page_num<=5'>
          <div :class='now_page == n?"page_num_btn page_num_btn_yes":"page_num_btn page_num_btn_no"' v-for='n in all_page_num' :key='n' :value='n' @click="page_jump_btn">{{n}}</div>
        </div>
        <div id='page_num_main' v-else>
          <div :class='now_page == 1?"page_num_btn page_num_btn_yes":"page_num_btn page_num_btn_no"' :value='1' @click="page_jump_btn">{{1}}</div>
          <div style='float:left;width:10px;' v-if='now_page>3'>...</div>

          <div :value='page_list[0]' :class='now_page == page_list[0]?"page_num_btn page_num_btn_yes":"page_num_btn page_num_btn_no"' @click="page_jump_btn">{{page_list[0]}}</div>
          <div :value='page_list[1]' :class='now_page == page_list[1]?"page_num_btn page_num_btn_yes":"page_num_btn page_num_btn_no"' @click="page_jump_btn">{{page_list[1]}}</div>
          <div :value='page_list[2]' :class='now_page == page_list[2]?"page_num_btn page_num_btn_yes":"page_num_btn page_num_btn_no"' @click="page_jump_btn">{{page_list[2]}}</div>

          <div style='float:left;width:10px;' v-if='now_page<all_page_num-2'>...</div>
          <div :class='now_page == all_page_num?"page_num_btn page_num_btn_yes":"page_num_btn page_num_btn_no"' :value='all_page_num' @click="page_jump_btn">{{all_page_num}}</div>
          <input type='number' class='page_jump_input' ref='page_jump_num' />
          <button class='page_jump_btn' @click='page_jump_click'> {{mrs_jump_to}} </button>
        </div>
      </div>
    </div>
    <div id='mipc_device_list_box'>
      <div id='mipc_history_menu_box'>
        <div id='date_box'>
          <div id='select_date'>
            <span class='history_select_data'> {{mcs_date}} </span>
            <span id='select_day'>{{show_data}}</span>
          </div>
          <div id='mipc_datepicker'></div>
        </div>
        <div class='history_menu_li'>
          <div id='history_menu_edit' @click='menu_edit_sign = !menu_edit_sign'> {{mcs_edit}} </div>
        </div>
        <div class='history_menu_li'>
          <div class='history_select'> {{mcs_format_options}} </div>
          <div id='select_format_box'>
            <div id='filter_snapshot' :class='filter_type.format_options == 1?"select_filter_li_active":"filter_format_btn"' format='1' @click="filter_snapshot_btn"> {{mcs_snapshot}} </div>
            <div id='filter_video' :class='filter_type.format_options == 2?"select_filter_li_active":"filter_format_btn"' format='2' @click="filter_video_btn"> {{mcs_record}} </div>
            <div id='filter_video_snapshot' :class='filter_type.format_options == 0?"select_filter_li_active":"filter_format_btn"' format='0' @click="filter_video_snapshot_btn"> {{mcs_all}} </div>
          </div>
        </div>
        <div class='history_menu_li'>
          <div class='history_select'> {{mcs_source}} </div>
          <div id='select_source_box'>
            <div id='filter_event' :class='filter_type.category == 1?"select_filter_li_active":"filter_category_btn"' category='1' @click="filter_event_btn"> {{mcs_event}} </div>
            <div id='filter_all_event' :class='filter_type.category == 0?"select_filter_li_active":"filter_category_btn"' category='0' @click="filter_all_event_btn"> {{mcs_all}} </div>
          </div>
        </div>
        <div class='history_menu_li'>
          <div class='history_select'> {{mcs_time_length}} </div>
          <div id='select_time_box'>
            <div id='time_length_1h' :class='filter_type.time_length == "1h"?"select_filter_li_active":"filter_time_btn"' time_length='1h' @click="time_length_1h_btn"> {{mcs_one_hour}} </div>
            <div id='time_length_30min' :class='filter_type.time_length == "30min"?"select_filter_li_active":"filter_time_btn"' time_length='30min' @click="time_length_30min_btn"> {{mcs_half_hour}} </div>
            <div id='time_length_5min' :class='filter_type.time_length == "5min"?"select_filter_li_active":"filter_time_btn"' time_length='5min' @click="time_length_5min_btn"> {{mcs_five_min}} </div>
          </div>
        </div>
      </div>
      <div id='history_list_main' v-if='history_data && history_data.length>0' :style='"width:"+menu_right_style.width+"px;height:"+menu_right_style.height+"px;"'>
        <div class='history_list_img' style='position:relative;' :num='index' img='false' v-for='(item,index) in history_data' :key='index'>
          <div class='alarm_ico_div'>
            <div class='alarm_sign_ico' v-if='item.flag.motion_flag'></div>
            <div class='snapshot_sign_ico' v-if='item.flag.snapshot_flag'></div>
            <div class='sos_sign_ico' v-if='item.flag.sos_flag'></div>
            <div class='door_sign_ico' v-if='item.flag.door_flag'></div>
          </div>
          <div class='video_ico_show' v-if='!item.is_photo'></div>
          <div class='video_duration_show' v-if='!item.is_photo'>{{item.time_duration}}</div>
          <div class='camera_sign_picture' :type='item.is_photo?"photo":"video"' :pic_token='item.cut_video_data[0].pic_token' :token='item.cut_video_data[0].token' :start_time='item.time_start' :end_time='item.time_end' @click="item.is_photo?photo_sign_picture_btn($event):camera_sign_picture_btn($event)">
            <img class='video_list_picture' :num='index'>
          </div>
          <div class='device_nick'>
            <span> {{start_time[index]}} </span>
            <div class='video_delete' v-if='menu_edit_sign' @click='video_delete_btn'></div>
          </div>
        </div>
      </div>
      <div id='history_list_main' v-else :style='"width:"+menu_right_style.width+"px;height:"+menu_right_style.height+"px;"'>
        <div id='history_no_list'>
          <div id='history_no_list_img'></div>
          <div id='history_no_list_content'> {{mcs_no_history}} </div>
        </div>
      </div>
    </div>
    <div id='history_img_page' v-if="picture_data_sign.src">
      <div id='history_img_box'>
        <div id='history_img_page_close' @click="picture_data_sign.src = ''"></div>
        <div id='history_img_main'>
          <a id='history_img_a' :href="picture_data_sign.src" :download="picture_data_sign.time + '.jpg'">
            <img id='history_img_show' :src='picture_data_sign.src'>
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
      mcs_date: mcs_date, //日期
      mcs_edit: mcs_edit, //编辑
      mcs_format_options: mcs_format_options, //格 式 :
      mcs_snapshot: mcs_snapshot, //快照
      mcs_record: mcs_record, //录像
      mcs_all: mcs_all, //全选
      mcs_source: mcs_source, //来源
      mcs_event: mcs_event, //事件
      mcs_time_length: mcs_time_length, //时 长 :
      mcs_one_hour: mcs_one_hour, //一小时
      mcs_half_hour: mcs_half_hour, //半小时
      mcs_five_min: mcs_five_min, //五分钟
      mcs_no_history: mcs_no_history, //无历史记录
      mrs_jump_to: mrs_jump_to, //跳到

      show_data: '', //今日日期
      now_page: 1, //当前页数
      all_page_num: 1, //最大页数数目 
      page_list: [2, 3, 4], //页数显示
      menu_right_style: { width: '', height: '' }, // 右边菜单宽度高度
      menu_edit_sign: false, //是否点击编辑
      history_info_data: [], // 历史保存数据
      // mipc系列由于其录像列表为分页展示则需要提前获取完成所有的视频信息,最后进行展示
      max_counts: 15000, // 获取历史录像列表的最大请求segment数量
      // get_history_counts: 0, // 获取历史录像的次数计数器
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
    _this.show_data = new Date().format("MM/dd/yyyy");
    _this.menu_right_style.width = document.getElementById('history').offsetWidth - 20 - 260;
    _this.menu_right_style.height = document.documentElement.clientHeight - 54;
    await _this.$api.history.boxlist_device_messages_get(_this.history_info).then(res => {
      _this.history_initial_data = res;
    })
    _this.choose_start_time = _this.history_initial_data.start_time;
    _this.choose_end_time = _this.history_initial_data.end_time;
    _this.create_history_list(_this.history_initial_data)
    $("#mipc_datepicker").datepicker({
      showOn: 'button',
      buttonImageOnly: true,
      date_infos: _this.history_initial_data.date_infos_time,
      onSelect: function (dateText, inst) {
        _this.now_page = 1
        let start_time = new Date(dateText).format("yyyy.MM.dd.00.00.00");
        start_time = _this.$api.history.getDateForStringDate(start_time).getTime();
        let end_time = start_time + 60 * 60 * 24 * 1000;
        _this.choose_start_time = start_time;
        _this.choose_end_time = end_time;
        _this.show_data = new Date(dateText).format("MM/dd/yyyy");
        _this.publicFunc.showBufferPage()
        _this.history_list_get_func(1)
      }
    });
  },
  methods: {
    async history_list_get_func (flag, params) { // 请求历史页面接口封装 flag: 1 (第一次获取日历中选择的录像内容) params: 传递的参数
      let _this = this
      console.log(params, 'params history_list_get_func')
      let response
      await this.$api.history.history_list_get({
        box_sn: _this.$store.state.jumpPageData.selectDeviceIpc,
        dev_sn: _this.history_initial_data.dev_sn,
        start_time: _this.choose_start_time,
        end_time: _this.choose_end_time,
        search_type: params !== undefined && params.search_type ? params.search_type : 0,
        format: _this.filter_type.format_options,
        category: _this.filter_type.category,
        time_length: _this.filter_type.time_length,
        max_counts: params !== undefined && params.max_counts ? params.max_counts : _this.max_counts,
        cid: params !== undefined && params.cid ? params.cid : null,
        sid: params !== undefined && params.sid ? params.sid : null,
        direction: params !== undefined ? params.direction : null
      }).then(async res => {
        console.log(res, '点击日期获取到的数据')
        if (flag === 1) { // 第一次请求则分配到两个不同的处理函数中
          if (res.total_segs_counts > _this.max_counts) { // 第一次请求后未能完全获取全部录像
            _this.get_history_list(res)
          } else {
            _this.create_history_list(res)
          }
        } else {
          response = res
        }
      })
      if (response !== undefined) {
        return response
      }
    },
    create_history_list (data) { //创建历史页表
      let _this = this;
      _this.history_info_data = data;
      _this.publicFunc.closeBufferPage();
      _this.history_data = [];
      _this.start_time = [];
      _this.token = [];
      let data_time = data.noreverse ? data.time : data.time.reverse();
      let data_video = data.noreverse ? data.video : data.video.reverse();
      if (data_time.length > 0) {
        let data_length = data_time.length;
        let x_num = parseInt(_this.publicFunc.mx("#history_list_main").offsetWidth / 314);
        let y_num = parseInt((_this.publicFunc.mx("#history_list_main").offsetHeight - 60) / 215);
        let all_num = x_num * y_num; //每页显示的视频数
        _this.all_page_num = Math.ceil(data_length / all_num); //总页数
        let start_num = ((_this.now_page - 1) * all_num);
        let end_num = (_this.now_page * all_num) > data_length ? data_length : (_this.now_page * all_num);
        for (let i = start_num; i < end_num; i++) {
          _this.start_time.push(new Date(data.time[i].time_start).format("yyyy-MM-dd hh:mm:ss"));
          _this.token.push(data.video[i].cut_video_data[0].pic_token);
          data.video[i].time_duration = data.time[i].time_duration;
          data.video[i].time_start = data.time[i].time_start;
          data.video[i].time_end = data.time[i].time_end;
          _this.history_data.push(data.video[i])
        }
        _this.$nextTick(function () {
          let l_dom_video_list_picture = _this.publicFunc.mx(".video_list_picture"); // nodeList 需要转换成普通数组之后才能显示正常的数组内容不会多出多余杂项
          for (let i in l_dom_video_list_picture) {
            if (l_dom_video_list_picture[i].parentNode) {
              l_dom_video_list_picture[i].setAttribute('src', ' ')
            }
          }
          _this.$api.history.history_img_get({
            sn: _this.$store.state.jumpPageData.selectDeviceIpc,
            flag: 2,
            token: _this.token,
            dom: _this.publicFunc.mx(".video_list_picture"),
          })
        })
      }
    },
    async get_history_list (data) { // 如果单次获取单日录像未获取完全, 则调用该方法获取剩余的录像内容并将其拼接
      let saveGetData = data
      let i = 1
      console.log(saveGetData, '存储之前获取到的数据', (i + 1) * this.max_counts)
      for (; saveGetData.total_segs_counts > i * this.max_counts; i++) {
        let nextGetData = saveGetData
        let nextCid = nextGetData.videosegs[nextGetData.videosegs.length - 1].cid
        let nextSid = nextGetData.videosegs[nextGetData.videosegs.length - 1].sid
        let last_counts
        if ((i + 1) * this.max_counts > saveGetData.total_segs_counts) {
          last_counts = saveGetData.total_segs_counts - (i * this.max_counts)
          nextGetData = await this.history_list_get_func(0, { cid: nextCid, sid: nextSid, direction: 1, search_type: 1, max_counts: last_counts })
        } else {
          nextGetData = await this.history_list_get_func(0, { cid: nextCid, sid: nextSid, direction: 1, search_type: 1 })
        }
        console.log(nextGetData, 'nextData')
        let newTimeArr = saveGetData.time.concat(nextGetData.time)
        let newVideo = saveGetData.video.concat(nextGetData.video)
        let newVideosegs = saveGetData.videosegs.concat(nextGetData.videosegs)
        console.log(newTimeArr, 'newTimeArr')
        saveGetData.time = newTimeArr
        saveGetData.video = newVideo
        saveGetData.videosegs = newVideosegs
      }
      console.log(saveGetData, 'saveGetData')
      this.create_history_list(saveGetData)
    },
    page_jump_btn (e) { //点击页数
      this.now_page = e.currentTarget.getAttribute('value');
      this.history_info_data.noreverse = 1;
      this.create_history_list(this.history_info_data);
    },
    page_jump_click () { //输入页数跳转
      let num = this.$refs.page_jump_num.value;
      num = parseInt(num);
      if (num) {
        if (num <= this.all_page_num) {
          this.now_page = num;
        } else if (num > this.all_page_num) {
          this.now_page = this.all_page_num;
        }
        this.$refs.page_jump_num.value = '';
        this.history_info_data.noreverse = 1;
        this.create_history_list(this.history_info_data);
      }
    }
  },
  watch: {
    now_page (val) {
      val = val * 1;
      if (this.all_page_num > 5) {
        if (val == 1 || val == 2) {
          this.page_list = [2, 3, 4];
        }
        if (val > 2 && val < this.all_page_num - 1) {
          this.page_list = [val - 1, val, val + 1];
        }
        if (val == this.all_page_num || val == this.all_page_num - 1) {
          this.page_list = [this.all_page_num - 3, this.all_page_num - 2, this.all_page_num - 1];
        }
      }
    }
  }
}
</script>

<style src="./index.scss" lang='scss'>
</style>