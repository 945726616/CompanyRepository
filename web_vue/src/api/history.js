'use strict'
import axios from '@/axios' // 导入http中创建的axios实例
import login from './login'
import store from '../store'
import devlist from './devlist'
import mcodec from '@/util/mcodec.js'
// import md5 from '@/util/mmd5.js'
const history = {
  /*
   ** 历史录像列表获取
   */
  async history_list_get (params) {
    let returnItem
    let cid = params.cid ? params.cid : -1;
    let sid = params.sid ? params.sid : -1;
    let direction = params.direction ? 1 : 0;
    params.flag = 8;
    await axios.get('/ccm/ccm_box_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        },
        sn: params.dev_sn,
        flag: params.flag,
        start_time: params.start_time,
        end_time: params.end_time,
        search_type: params.search_type,
        cid: cid,
        sid: sid,
        direction: direction,
        max_counts: params.max_counts
      }
    }).then(res => {
      let result = login.get_ret(res)
      console.log('history接口获取到的数据', res, '处理后的result', result)
      if (result === '' && res.data) {
        switch (params.flag) {
          case 1:
            returnItem = {
              result: result,
              ipcs: res.data.ipcs
            }
            break
          case 2:
            returnItem = {
              result: result,
              date_infos: res.data.date_infos
            }
            break
          case 4:
            returnItem = {
              result: result,
              segs: res.data.segs
            }
            break
          case 8:
            returnItem = {
              result: result,
              segs_sdc: res.data.segs_sdc,
              total_segs_counts: res.data.total_segs_counts
            }
            break
          default:
            break
        }
      } else {
        returnItem = {
          result: result
        }
      }
    })
    return history.ccm_segs_get_ack(returnItem, params)
  },
  ccm_segs_get_ack (msg, ref) { //msg 第二次ccm_box_get返回的加密数据
    let returnItem
    if (msg && !msg.result && (msg.segs_sdc || msg.segs)) {
      let videosegs = history.cutVideo({
        msg: msg,
        base_start_time: ref.start_time,
        base_end_time: ref.end_time,
        dev_sn: ref.dev_sn,
        search_type: ref.search_type
      }); //解密成一个个seg 
      console.log(videosegs, 'videosegs')
      if (videosegs.length == 0) {
        return returnItem = {
          video: [],
          time: [],
          date_infos_time: ref.date_infos_time,
          dev_sn: ref.dev_sn,
          start_time: ref.start_time,
          end_time: ref.end_time
        }
      }
      let videoData = history.draw_data_rect({
        videosegs: videosegs,
        time_length: ref.time_length,
        format: ref.format,
        category: ref.category
      }); //seg拼接，处理好的视频可以体现出数量 每个视频时间
      console.log(videoData, 'videoData')
      returnItem = {
        video: videoData.local_cut_video_data,
        time: videoData.local_video_time_duration,
        date_infos_time: ref.date_infos_time,
        dev_sn: ref.dev_sn,
        start_time: ref.start_time,
        end_time: ref.end_time,
        videosegs: videosegs,
        vedio_day: ref.vedio_day,
        total_segs_counts: msg.total_segs_counts
      }
    } else {
      returnItem = {
        video: [],
        time: [],
        date_infos_time: ref.date_infos_time,
        dev_sn: ref.dev_sn,
        start_time: ref.start_time,
        end_time: ref.end_time
      }
    }
    return returnItem
  },
  cutVideo (obj) { //obj.msg就是第二次请求返回的加密数据
    let l_local_segs = [],
      l_segs = [],
      local_segs_index = 0,
      cid, sid, stm, etm, f;
    cid = history.sdc_decode(obj.msg.segs_sdc.cid, obj.msg.segs_sdc.record_num); //将加密数据解析成数组，个数record_num
    sid = history.sdc_decode(obj.msg.segs_sdc.sid, obj.msg.segs_sdc.record_num);
    stm = history.sdc_decode(obj.msg.segs_sdc.stm, obj.msg.segs_sdc.record_num);
    etm = history.sdc_decode(obj.msg.segs_sdc.etm, obj.msg.segs_sdc.record_num);
    f = history.sdc_decode(obj.msg.segs_sdc.f, obj.msg.segs_sdc.record_num);
    if (!cid || !sid || !stm || !etm || !f) {
      return;
    } else {
      for (let i = 0; i < (cid ? cid.length : 0); i++) {
        let flag = parseInt(f[i]);
        let s_sid = parseInt(sid[i]);
        l_segs[i] = {
          cid: cid[i],
          sid: s_sid,
          stm: stm[i],
          etm: etm[i],
          f: flag
        };
      }
      //将cid sid stm etm f这些数组的每项依次匹配形成一个数组
    }
    for (let i = 0; i < l_segs.length; i++) {
      let video_segment_start_time = parseInt((l_segs[i].stm), 16);
      let video_segment_end_time = parseInt((l_segs[i].etm), 16);
      if (obj.search_type == 0) { //如果按照时间检索在筛选视频
        // if(video_segment_start_time < obj.base_start_time) continue;//解决显示其他天日期视频问题
        if (video_segment_start_time < obj.base_start_time || video_segment_end_time > obj.base_end_time) continue; //解决显示其他天日期视频问题
      }
      l_local_segs[local_segs_index] = {
        pos_start: video_segment_start_time,
        pos_end: video_segment_end_time,
        token: obj.dev_sn + "_" + l_segs[i].cid + "_" + l_segs[i].sid,
        pic_token: obj.dev_sn + "_p3_" + l_segs[i].cid + "_" + l_segs[i].sid,
        f: l_segs[i].f,
        cid: l_segs[i].cid,
        sid: l_segs[i].sid
      };
      local_segs_index++;
    }
    return l_local_segs;
  },
  sdc_decode (pcomp, record_num) {
    let l_data = [],
      l_data_index = 0;
    let l_pcomp = mcodec.b64_2_binary(pcomp);
    let l_sdc_len = l_pcomp.length;
    let l_record_num = record_num;
    let l_base, l_base_len, l_pcomp_index = 0;
    if (sdc_base_decode()) return;
    for (l_pcomp_index = l_base_len; l_pcomp_index < l_sdc_len;) {
      if (sdc_group_decode()) break;
    }
    return array_to_string();

    function sdc_base_decode () /*decode the base area data*/ {
      let bytes, value;
      let pbase = l_pcomp[0];
      if (l_sdc_len < 1) {
        return 1;
      }
      bytes = pbase & 0xf;
      l_base_len = bytes + 1;
      l_base = pbase >> 4;
      if (bytes > 0) {
        if ((bytes * 8 + 4) > 32) {
          l_base = big_number_operation(l_base, bytes, 0);
        } else {
          for (let i = 1; i < l_base_len; i++) {
            l_base |= ((l_pcomp[i]) << ((i - 1) * 8 + 4));
          }
        }
      }
      l_data[0] = l_base;
      return 0;
    }

    function sdc_group_decode () /*decode the group area data*/ {
      let pdelta, is_compress, plen, i, pdata, value, plen_bytes;
      if (l_sdc_len < 1) {
        return 1;
      }
      is_compress = (l_pcomp[l_pcomp_index] >= 128); /*judge the group's first number is 1 or 0;*/
      for (i = 0; i < 4; i++) /*get the item_num*/ {
        if (i == 0) {
          plen = l_pcomp[l_pcomp_index] & 0x7f;
        } else {
          plen = (plen << 8) | (l_pcomp[l_pcomp_index + i]);
        }
      }
      l_pcomp_index = l_pcomp_index + 4;
      if (plen > l_record_num) {
        return 1;
      }
      if (is_compress) {
        let compress_data_delta = "";
        compress_data_delta = l_pcomp[l_pcomp_index] >> 4;
        let delta_num = l_pcomp[l_pcomp_index] & 0xf;
        let max_count = delta_num * 8 + 4;
        let pdelta_array;
        if (max_count > 32) {
          pdelta_array = big_number_operation(pdelta, delta_num, 1);
        } else {
          for (i = 0; i < delta_num; i++) {
            compress_data_delta |= ((l_pcomp[l_pcomp_index + 1 + i]) << (i * 8 + 4));
          }
        }
        for (i = 0; i < plen; i++) {
          l_data_index++;
          if (l_data_index >= l_record_num) return 1;
          l_data[l_data_index] = (typeof (l_data[l_data_index - 1]) == "number" && !pdelta_array) ?
            (l_data[l_data_index - 1] + compress_data_delta) : (big_number_add(l_data[l_data_index - 1], pdelta_array ? pdelta_array : compress_data_delta));
        }
        l_pcomp_index = l_pcomp_index + 1 + delta_num;
      }
      if (!is_compress && (plen != 0)) {
        for (i = 0; i < plen; i++) {
          pdelta = l_pcomp[l_pcomp_index] >> 4;
          let delta_num = l_pcomp[l_pcomp_index] & 0xf;
          let pdelta_array;
          let max_count = delta_num * 8 + 4;
          if (max_count > 32) {
            pdelta_array = big_number_operation(pdelta, delta_num, 0);
          } else {
            for (let j = 0; j < delta_num; j++) {
              pdelta |= ((l_pcomp[l_pcomp_index + 1 + j]) << (j * 8 + 4));
            }
          }
          l_data_index++;
          if (l_data_index >= l_record_num) return 1;
          l_data[l_data_index - 1];
          l_data[l_data_index] = (typeof (l_data[l_data_index - 1]) == "number" && !pdelta_array) ?
            (l_data[l_data_index - 1] + pdelta) : (big_number_add(l_data[l_data_index - 1], pdelta_array ? pdelta_array : pdelta));
          l_pcomp_index = l_pcomp_index + 1 + delta_num;
          pdelta = "";
          pdelta_array = "";
        }
      }
      return 0;
    }

    function array_to_string () {
      for (let i = 0; i < l_data.length; i++) {
        if (l_data[i] instanceof Array) {
          l_data[i] = "0x" + (l_data[i][0].toString(16)) + (int_to_string_4(l_data[i][1])) + (int_to_string_4(l_data[i][2])) + (int_to_string_4(l_data[i][3]));
        }
      }
      return l_data;
    }

    function int_to_string_4 (data_int) {
      let ret_data = data_int.toString(16);
      return ret_data = (ret_data.length == 4) ? ret_data : (ret_data.length == 3) ? ("0" + ret_data) : (ret_data.length == 2) ? ("00" + ret_data) : ("000" + ret_data);
    }

    function trans_to_4 (data_int) {
      let return_data;
      return return_data = (data_int.length == 4) ? data_int : (data_int.length == 3) ? ("0" + data_int) : (data_int.length == 2) ? ("00" + data_int) : ("000" + data_int);
    }

    function big_number_add (num_a, num_b) {
      let num = [],
        sum;
      num_a = to_big_number(num_a);
      num_b = to_big_number(num_b);
      let num_add = [],
        carry_num = 0;
      for (let j = 3; j > -1; j--) {
        let c = "0x" + num_a[j].toString(16);
        let d = "0x" + num_b[j].toString(16);
        num_add[j] = (parseInt(c) + parseInt(d) + (carry_num ? 1 : 0)).toString(16);
        carry_num = ("0x" + num_add[j]) & 0x10000;
        if (carry_num) num_add[j] = (("0x" + num_add[j]) & 0xffff).toString(16);
      }
      sum = ("0x" + num_add[0] + (trans_to_4(num_add[1])) + (trans_to_4(num_add[2])) + (trans_to_4(num_add[3])));
      for (let i = 3; i > -1; i--) {
        if (sum) {
          num[i] = parseInt(sum.substring((((sum.length - 4) > 0) ? (sum.length - 4) : 0), sum.length), 16);
          sum = sum.substring(0, (((sum.length - 4) > 0) ? (sum.length - 4) : 0));
        } else num[i] = 0;
      }
      return num;
    }

    function to_big_number (num) {
      let ret = [];
      if (typeof (num) == "number") {
        let tem_num = num.toString(2);
        if (tem_num.length < 16) {
          return ret = [0, 0, 0, num];
        } else if (tem_num.length < 32) {
          return ret = [0, 0, num >> 16, num & 0xffff];
        }
      } else return num;
    }

    function big_number_operation (pdelta, delta_num, ptype) {
      let type_num = ptype ? 5 : 1;
      let tdelta = [0, 0, 0, pdelta];
      for (let i = 0; i < delta_num; i++) {
        let tcomp = l_pcomp[l_pcomp_index + type_num + i];
        let move_num = (i * 8 + 4) + 8;
        if (move_num < 16) {
          tdelta[3] |= (tcomp << (move_num - 8));
        } else if (move_num > 16 && move_num < 32) {
          if (move_num < 24) {
            let digit = 16 - (32 - move_num);
            let tcomp_2 = tcomp.toString(2);
            tcomp_2 = tcomp_2.substring(tcomp_2.length - digit, tcomp_2.length);
            for (let j = 0; j < 32 - move_num; j++) {
              tcomp_2 += "0";
            }
            tdelta[3] |= parseInt(tcomp_2, 2);
            tdelta[2] |= tcomp >> (32 - move_num - 8);
          } else {
            tdelta[2] |= (tcomp << (move_num - 16 - 8));
          }
        } else if (move_num > 32 && move_num < 48) {
          if (move_num < 40) {
            let digit = 16 - (48 - move_num);
            let tcomp_2 = tcomp.toString(2);
            tcomp_2 = tcomp_2.substring(tcomp_2.length - digit, tcomp_2.length);
            for (let j = 0; j < 48 - move_num; j++) {
              tcomp_2 += "0";
            }
            tdelta[2] |= parseInt(tcomp_2, 2);
            tdelta[1] |= tcomp >> (48 - move_num - 8);
          } else {
            tdelta[1] |= (tcomp << (move_num - 32 - 8));
          }
        } else if (move_num > 48 && move_num < 72) {
          if (move_num < 56) {
            let digit = 16 - (64 - move_num);
            let tcomp_2;
            if (tcomp) {
              tcomp_2 = tcomp.toString(2);
              tcomp_2 = tcomp_2.substring(tcomp_2.length - digit, tcomp_2.length);
            }
            for (let j = 0; j < 64 - move_num; j++) {
              tcomp_2 += "0";
            }
            tdelta[1] |= parseInt(tcomp_2, 2);
            tdelta[0] |= tcomp >> (64 - move_num - 8);
          } else {
            tdelta[0] |= (tcomp << (move_num - 48 - 8));
          }
        }
      }
      return tdelta;
    }
  },
  draw_data_rect (obj) {
    let cut_video_data = [],
      cut_video_data_index = 0,
      cut_photo_data = [],
      cut_photo_data_index = 0,
      local_cut_video_data_index = 0,
      local_cut_video_data = [],
      local_video_time_duration = [],
      local_video_time_duration_index = 0,
      mark_video_segment_start_time = 0,
      video_clip_start_time = 0,
      mark_alarm = "",
      select_incise_time;
    let motion_flag_old = 1,
      motion_flag_new = 8,
      snapshot_flag = 2,
      io_flag = 4,
      door_flag = 16,
      sos_flag = 32;

    function set_flag (c, flag) {
      flag = flag ? flag : {};
      flag.sos_flag = parseInt(c / sos_flag) ? 1 : flag.sos_flag;
      flag.door_flag = parseInt((c % sos_flag) / door_flag) ? 1 : flag.door_flag;
      flag.motion_flag = parseInt(((c % sos_flag) % door_flag) / motion_flag_new) ? 1 : flag.motion_flag;
      flag.io_flag = parseInt((((c % sos_flag) % door_flag) % motion_flag_new) / io_flag) ? 1 : flag.io_flag;
      flag.snapshot_flag = parseInt(((((c % sos_flag) % door_flag) % motion_flag_new) % io_flag) / snapshot_flag) ? 1 : flag.snapshot_flag;
      flag.motion_flag = parseInt(((((c % sos_flag) % door_flag) % motion_flag_new) % io_flag) % snapshot_flag) ? 1 : flag.motion_flag;
      return flag;
    }
    let flag = {
      sos_flag: 0,
      door_flag: 0,
      motion_flag: 0,
      io_flag: 0,
      snapshot_flag: 0
    }
    if (obj.time_length == "5min") {
      select_incise_time = 5 * 60 * 1000;
    } else if (obj.time_length == "1h") {
      select_incise_time = 60 * 60 * 1000;
    } else {
      select_incise_time = 30 * 60 * 1000;
    }
    /*mark_ico mean the source of alarm, mark_ico[0] mean motion 1and8, mark_ico[1] mean snapshot 2, mark_ico[2] mean io 4, mark_ico[3] mean door 16, mark_ico[4] meansos 32*/
    function mark_alarm_info (a) {
      let mark_ico = [0, 0, 0, 0, 0];
      let x = l_local_segs[a].f;
      for (let i = 4; i >= 0; i--) {
        if (x >= Math.pow(2, i + 1)) {
          mark_ico[i] = 1;
          x = x % Math.pow(2, i);
        }
      }
      return mark_ico;
    }
    let l_local_segs = obj.videosegs,
      local_segs_index = obj.videosegs ? obj.videosegs.length : 0;
    mark_video_segment_start_time = l_local_segs[0].pos_start,
      video_clip_start_time = l_local_segs[0].pos_end;

    for (let j = 0; j < local_segs_index; j++) {
      if (obj.format == 1 || obj.format == 0) {
        if (l_local_segs[j].f > 0) {
          cut_photo_data[0] = l_local_segs[j];
          local_cut_video_data[local_cut_video_data_index] = {
            cut_video_data: cut_photo_data,
            is_photo: 1,
            flag: set_flag(l_local_segs[j].f)
          }
          cut_photo_data = [];
          local_cut_video_data_index++;
        }
      }
      if (obj.format == 2 || obj.format == 0) {
        if (j == local_segs_index - 1) {
          if (j != 0) {
            if (l_local_segs[j].f != 2 && l_local_segs[j].pos_start != l_local_segs[j].pos_end && l_local_segs[j].pos_end - mark_video_segment_start_time < select_incise_time) {
              cut_video_data[cut_video_data_index] = l_local_segs[j];
              cut_video_data_index++;
            }
          }
        } else if (j == 0) {
          cut_video_data[cut_video_data_index] = l_local_segs[0];
          cut_video_data_index++;
        } else {
          let end_to_start_time = Math.abs(l_local_segs[j].pos_start - l_local_segs[j - 1].pos_end);
          if (l_local_segs[j].f != 2) {
            if (l_local_segs[j].pos_start == l_local_segs[j].pos_end) {
              // console.log(l_local_segs[j].pos_start == l_local_segs[j].pos_end)
            } else if ((end_to_start_time <= 7 * 1000) && (l_local_segs[j].pos_end - mark_video_segment_start_time < select_incise_time)) {
              cut_video_data[cut_video_data_index] = l_local_segs[j];
              cut_video_data_index++;
            } else {
              if (cut_video_data.length) {
                let mark_flag = {};
                for (let k = 0; k < cut_video_data.length; k++) {
                  mark_flag = set_flag(cut_video_data[k].f, mark_flag);
                }
                local_cut_video_data[local_cut_video_data_index] = {
                  cut_video_data: cut_video_data,
                  flag: mark_flag
                }
                local_cut_video_data_index++;
              }
              cut_video_data = [];
              cut_video_data_index = 0;
              cut_video_data[cut_video_data_index] = l_local_segs[j];
              cut_video_data_index++;
              mark_video_segment_start_time = l_local_segs[j].pos_start;
            }
          }
        }
      }
    }
    if (cut_video_data.length) {
      let mark_flag = {};
      for (let k = 0; k < cut_video_data.length; k++) {
        mark_flag = set_flag(cut_video_data[k].f, mark_flag);
      }
      local_cut_video_data[local_cut_video_data_index] = {
        cut_video_data: cut_video_data,
        flag: mark_flag
      }
      cut_video_data = [];
      cut_video_data_index = 0;
    }
    if (obj.category == 1) {
      let local_cut_video_data_tmp = local_cut_video_data;
      local_cut_video_data = [];
      for (let l = 0; l < local_cut_video_data_tmp.length; l++) {
        if (local_cut_video_data_tmp[l].flag.door_flag || local_cut_video_data_tmp[l].flag.io_flag || local_cut_video_data_tmp[l].flag.motion_flag || local_cut_video_data_tmp[l].flag.snapshot_flag || local_cut_video_data_tmp[l].flag.sos_flag) {
          local_cut_video_data.push(local_cut_video_data_tmp[l])
        }
      }
    }
    for (let m = 0; m < local_cut_video_data.length; m++) {
      let len = local_cut_video_data[m].cut_video_data.length;
      let video_time_duration_start = parseInt(local_cut_video_data[m].cut_video_data[0].pos_start);
      let video_time_duration_end = parseInt(local_cut_video_data[m].cut_video_data[len - 1].pos_end);
      let video_time_duration = (video_time_duration_end - video_time_duration_start) / 1000;
      // let video_time_start = new Date(local_cut_video_data[m].cut_video_data[0].pos_start).format("yyyy-MM-dd hh:mm:ss");
      // let video_time_end = new Date(local_cut_video_data[m].cut_video_data[len-1].pos_end).format("yyyy-MM-dd hh:mm:ss");
      let video_time_start = local_cut_video_data[m].cut_video_data[0].pos_start;
      let video_time_end = local_cut_video_data[m].cut_video_data[len - 1].pos_end;
      local_video_time_duration[local_video_time_duration_index] = {
        time_duration: formatSeconds(video_time_duration),
        time_start: video_time_start,
        time_end: video_time_end
      };
      local_video_time_duration_index++;
    }
    function formatSeconds (value) { //将时间转为xx:xx模式
      let theTime = parseInt(value);
      let theTime1 = 0;
      if (theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
      }
      theTime = theTime > 9 ? theTime : "0" + theTime;
      theTime1 = theTime1 > 9 ? theTime1 : "0" + theTime1;
      let result = ":" + theTime;
      result = theTime1 + result;

      return result;
    }
    let cutVideoData = {
      local_cut_video_data: local_cut_video_data,
      local_video_time_duration: local_video_time_duration
    };
    return cutVideoData;
  },

  /*
   ** 历史录像图片获取
   */
  history_img_get (data) {
    let img = [];
    let photoNodeList = $(".history_list_img").find(".camera_sign_picture").find("img")
    let photoNodeArr = []
    for (let index in photoNodeList) {
      photoNodeArr.push(photoNodeList[index])
    }
    for (let i = 0; i < data.token.length; i++) { // 原本代码为data.dom.length 但由于参数传递导致其将部分无关内容也变成了 数组长度的一部分 所以现改用token.length保证循环次数正常
      img[i] = new Image();
      if (store.state.jumpPageData.loaclFlag) {
        img[i].src = devlist.pic_url_get({
          sn: data.sn,
          token: data.token[i],
          flag: data.flag,
          is_history: 1
        });
      } else {
        img[i].src = devlist.pic_url_get({
          sn: data.sn,
          token: data.token[i],
          flag: data.flag,
          is_history: 1
        });
      }
      if (data.picFlag) { // 为快照请求图片
        img[i].dom = data.dom[i];
        photoNodeArr[i + (data.loopTime * 80)].src = img[i].src
      } else { // 其他普通请求图片
        img[i].dom = data.dom[i];
        img[i].onload = function () { // 将请求到的图片渲染至页面
          this.dom.src = this.src;
        }
      }
    }
  },
  /*
   ** 盒子设备信息获取
   */
  async boxlist_device_messages_get (params) {
    console.log(params, 'boxlist_device_params')
    let returnItem
    let cid = params.cid ? params.cid : -1;
    let sid = params.sid ? params.sid : -1;
    let direction = params.direction ? 1 : 0;
    await axios.get('/ccm/ccm_box_get', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        },
        sn: params.dev_sn,
        flag: params.flag,
        start_time: params.start_time,
        end_time: params.end_time,
        search_type: params.search_type,
        cid: cid,
        sid: sid,
        direction: direction,
        max_counts: params.max_counts
      }
    }).then(res => {
      let result = login.get_ret(res)
      if (result === '' && res.data) {
        switch (params.flag) {
          case 1:
            returnItem = {
              result: result,
              ipcs: res.data.ipcs
            }
            break
          case 2:
            returnItem = {
              result: result,
              date_infos: res.data.date_infos
            }
            break
          case 4:
            returnItem = {
              result: result,
              segs: res.data.segs
            }
            break
          case 8:
            returnItem = {
              result: result,
              segs_sdc: res.data.segs_sdc
            }
            break
          default:
            break
        }
      } else {
        returnItem = {
          result: result
        }
      }
    })
    return history.boxlist_device_messages_get_ack(returnItem, params)
  },
  async boxlist_device_messages_get_ack (msg, ref) {
    let returnItem;
    if (msg && !msg.result && msg.date_infos) {
      let l_local_date_infos = [];
      let date_infos_time = [];
      let vedio_day = []; //标记哪些天有视频 去了重
      let l_date_infos = msg.date_infos; //第一次知道哪些天有视频返回的日期
      let start_time, end_time, search_type, cid, sid;
      for (let i = 0; i < l_date_infos.length; i++) {
        let date_mis = new Date(l_date_infos[i].date * 1000).format("yyyy.MM.dd.00.00.00");
        if (i > 0) {
          l_local_date_infos[l_local_date_infos.length] = date_mis;
          date_infos_time[date_infos_time.length] = (this.getDateForStringDate(l_local_date_infos[l_local_date_infos.length - 1])).getTime();
        } else if (i === 0) {
          l_local_date_infos[i] = date_mis;
          date_infos_time[i] = (this.getDateForStringDate(l_local_date_infos[i])).getTime();
        }
      }
      let nowtime = new Date().getTime(); //当前的时间 如果记录哪天有视频的返回时间超过该值，过滤掉
      for (let i = 0; i < date_infos_time.length; i++) { //6.4.3 onvif录像
        if (date_infos_time[i] > nowtime) {
          continue;
        } else if (vedio_day.indexOf(date_infos_time[i]) == -1) {
          vedio_day.push(date_infos_time[i])
        }
      }
      vedio_day.sort(function (a, b) {
        return a - b
      }); //从小到大排序
      if (ref.start_time === 0) {
        start_time = new Date(l_date_infos[l_date_infos.length - 1].date * 1000).format("yyyy.MM.dd.00.00.00");
        start_time = this.getDateForStringDate(start_time).getTime();
        if (start_time === -28800000) {
          start_time = 0
        }
        end_time = start_time + 60 * 60 * 24 * 1000; //第二次请求开始时间：最后一天凌晨 结束时间：次日凌晨 
        search_type = ref.search_type;
      } else { //如果点击日期播放返回到该日期的录像
        start_time = ref.start_time;
        end_time = ref.end_time;
        search_type = ref.search_type;
      }
      await history.history_list_get({
        box_sn: ref.box_sn,
        dev_sn: ref.dev_sn,
        start_time: start_time,
        end_time: end_time,
        date_infos_time: date_infos_time,
        format: 2,
        category: 0,
        time_length: "30min",
        search_type: search_type,
        cid: cid,
        sid: sid,
        vedio_day: vedio_day,
        flag: 8,
        max_counts: ref.max_counts
      }).then(res => {
        returnItem = res
      })
    } else {
      returnItem = {
        video: [],
        time: [],
        date_infos_time: [],
        dev_sn: ref.dev_sn,
        start_time: ref.start_time,
        end_time: ref.end_time
      }
    }
    return returnItem
  },
  getDateForStringDate (strDate) {
    let s = strDate.split(".");
    return new Date(s[0], s[1] - 1, s[2], s[3], s[4], s[5]);
  },
  /*
   ** 历史记录删除
   */
  async history_delete (params) {
    let returnItem
    params.cmd = params.start_time ? "erase" : "erase_all"
    await axios.get('/ccm/ccm_box_set', {
      params: {
        sess: {
          nid: login.create_nid(),
          sn: params.box_sn
        },
        sn: params.dev_sn,
        cmd: params.cmd,
        start_time: params.start_time,
        end_time: params.end_time
      }
    }).then(res => {
      let result = login.get_ret(res)
      if (result === '' && res) {
        returnItem = {
          type: 'success'
        }
      } else {
        returnItem = {
          type: 'error'
        }
      }
    })
    return returnItem
  }
}

export default history