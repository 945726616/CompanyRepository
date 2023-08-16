<template>
  <div id="history"></div>
</template>
<script>
import '../../../lib/plugins/jquery.ui.datepicker.js'// $日期选择插件
import '../../../lib/plugins/jquery.ui.datepicker-zh-CN.js' // 日期选择中文版
import languageSelect from '../../../lib/exportModule/languageSelect.js'
export default {
  methods: {
    mipcHistory(obj) {
        let _this = this;
        let now_page = 1;
        obj.parent.html()
        _this.publicFunc.showBufferPage()
        function device_history_list(data) {
            // console.log(data, "data_device_history")
            let l_format = 0,
                l_category = 0,
                time_length = "30min",
                start_time = data.start_time,
                end_time = data.end_time;
            _this.publicFunc.closeBufferPage()
            
            obj.parent.html("<div id='history_list_bottom'>"
            + "<div id='page_num_box'>"
            + "<div id='page_num_main'></div>"
            + "</div>"
            + "</div>"
            + "<div id='mipc_device_list_box'>"
            + "<div id='mipc_history_menu_box'>"
            + "<div id='date_box'>"
            + "<div id='select_date'>"
            + "<span class='history_select_data'>" + mcs_date + "</span>"
            + "<span id='select_day'></span>"
            + "</div>"
            + "<div id='mipc_datepicker'></div>"
            + "</div>"
            + "<div class='history_menu_li'>"
            + "<div id='history_menu_edit'>" + mcs_edit + "</div>"
            + "</div>"
            + "<div class='history_menu_li'>"
            + "<div class='history_select'>" + mcs_format_options + "</div>"
            + "<div id='select_format_box'>"
            + "<div id='filter_snapshot' class='filter_format_btn' format='1'>" + mcs_snapshot + "</div>"
            + "<div id='filter_video' class='filter_format_btn' format='2'>" + mcs_record + "</div>"
            + "<div id='filter_video_snapshot' class='filter_format_btn select_filter_li_active' format='0'>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='history_menu_li'>"
            + "<div class='history_select'>" + mcs_source + "</div>"
            + "<div id='select_source_box'>"
            + "<div id='filter_event' class='filter_category_btn' category='1'>" + mcs_event + "</div>"
            + "<div id='filter_all_event' class='filter_category_btn select_filter_li_active' category='0'>" + mcs_all + "</div>"
            + "</div>"
            + "</div>"
            + "<div class='history_menu_li'>"
            + "<div class='history_select'>" + mcs_time_length + "</div>"
            + "<div id='select_time_box'>"
            + "<div id='time_length_1h' class='filter_time_btn' time_length='1h'>" + mcs_one_hour + "</div>"
            + "<div id='time_length_30min' class='filter_time_btn select_filter_li_active' time_length='30min'>" + mcs_half_hour + "</div>"
            + "<div id='time_length_5min' class='filter_time_btn' time_length='5min'>" + mcs_five_min + "</div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div id='history_list_main'></div>"
            + "</div>")
            // 获取今天的日期
            _this.publicFunc.mx("#select_day").innerHTML = new Date().format("MM/dd/yyyy")
            _this.publicFunc.mx("#history_list_main").style.width = (obj.parent.width() - 20 - 260) + "px";
            _this.publicFunc.mx("#history").style.height = (document.documentElement.clientHeight - 54) + "px";
            _this.publicFunc.mx("#mipcBack").onclick = function () {
                $("#set_back").hide();
                $("#menu_box_main").show();
                _this.$router.push({name:'devlist',params:{ parent: obj.parent }})
                // createPage("devlist", { parent: obj.parent })
            }
            _this.publicFunc.mx("#filter_snapshot").onclick = function () {
                now_page = 1
                l_format = 1;
                $(".filter_format_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({ // 调用获取历史记录列表
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#filter_video").onclick = function () {
                now_page = 1
                l_format = 2;
                $(".filter_format_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                 _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#filter_video_snapshot").onclick = function () {
                now_page = 1
                l_format = 0;
                $(".filter_format_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#filter_event").onclick = function () {
                now_page = 1
                l_category = 1;
                $(".filter_category_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#filter_all_event").onclick = function () {
                now_page = 1
                l_category = 0;
                $(".filter_category_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#time_length_1h").onclick = function () {
                now_page = 1
                time_length = "1h";
                $(".filter_time_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#time_length_30min").onclick = function () {
                now_page = 1
                time_length = "30min";
                $(".filter_time_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            _this.publicFunc.mx("#time_length_5min").onclick = function () {
                now_page = 1
                time_length = "5min";
                $(".filter_time_btn").removeClass("select_filter_li_active");
                $(this).addClass("select_filter_li_active");
                _this.publicFunc.showBufferPage()
                _this.$api.history.history_list_get({
                    box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                    dev_sn: data.dev_sn, 
                    start_time: start_time, 
                    end_time: end_time, 
                    format: l_format, 
                    category: l_category, 
                    time_length: time_length
                }).then(res => {
                    create_history_list(res)
                })
            }
            create_history_list(data);
            let l_dom_history_menu_filter = _this.publicFunc.mx("#history_menu_filter");
            let l_dom_history_menu_date = _this.publicFunc.mx("#history_menu_date");
            $("#mipc_datepicker").datepicker({
                showOn: 'button',
                buttonImageOnly: true,
                date_infos: data.date_infos_time,
                onSelect: function (dateText, inst) {
                    now_page = 1
                    start_time = new Date(dateText).format("yyyy.MM.dd.00.00.00");
                    let show_time = new Date(dateText).format("MM/dd/yyyy");
                    _this.publicFunc.mx("#select_day").innerHTML = show_time;
                    start_time = _this.$api.history.getDateForStringDate(start_time).getTime();
                    end_time = start_time + 60 * 60 * 24 * 1000;
                    $("#calendar_input").hide();
                    _this.publicFunc.showBufferPage()
                    _this.$api.history.history_list_get({
                        box_sn: _this.$store.state.jumpPageData.selectDeviceIpc, 
                        dev_sn: data.dev_sn, 
                        start_time: start_time, 
                        end_time: end_time, 
                        search_type:0, 
                        format: 0, 
                        category: 0, 
                        time_length: "30min"
                    }).then(res => {
                        create_history_list(res)
                    })
                }
            });
            function create_history_img_page(data) {
                let token = data.replace("_p3_", "_p0_")
                if (!_this.publicFunc.mx("#history_img_page")) {
                    $("body").append(
                        "<div id='history_img_page'>"
                        + "<div id='history_img_box'>"
                        + "<div id='history_img_page_close'></div>"
                        + "<div id='history_img_main'><a id='history_img_a'><img id='history_img_show'></a></div>"
                        + "</div>"
                        + "</div>"
                    )
                    _this.publicFunc.mx("#history_img_page_close").style.left = (_this.publicFunc.mx("#history_img_page_close").offsetLeft + 641) + "px";
                    _this.publicFunc.mx("#history_img_page_close").onclick = function () {
                        $("#history_img_page").remove();
                    }
                    _this.$api.history.history_list_get({
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        flag: 2,
                        token: token
                    }).then(res => {
                        _this.publicFunc.mx("#history_img_show").src = res;
                        _this.publicFunc.mx("#history_img_a").download = new Date().getTime() + ".jpg";
                        _this.publicFunc.mx("#history_img_a").setAttribute("href", res);
                    })
                }
            }
            function device_history_list_event(data) {
                let l_dom_camera_sign_picture = _this.publicFunc.mx(".camera_sign_picture");
                let l_dom_page_num_btn = _this.publicFunc.mx(".page_num_btn");
                let l_dom_page_jump_btn = _this.publicFunc.mx(".page_jump_btn");
                for (let i = 0; i < l_dom_camera_sign_picture.length; i++) {
                    l_dom_camera_sign_picture[i].onclick = function () {
                        let type = this.getAttribute("type");
                        let num = this.parentNode.getAttribute("num");
                        if (type == "video") {
                            obj.token = this.getAttribute("token");
                            obj.pic_token = this.getAttribute("pic_token");
                            obj.start_time = this.getAttribute("start_time");
                            obj.end_time = this.getAttribute("end_time");
                            obj.data = data.video[num].cut_video_data;
                            // createPage("playback", obj)
                            _this.$router.push({name:'playback',params:obj})
                        } else {
                            let token = this.getAttribute("pic_token");
                            create_history_img_page(token);
                        }
                    }
                    _this.publicFunc.mx(".video_delete")[i].onclick = function () {
                        let _this = this;
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
                    }
                    _this.publicFunc.mx("#history_menu_edit").onclick = function () {
                        if ($(".video_delete").css("display") == "none") {
                            $(".video_delete").show();
                        } else {
                            $(".video_delete").hide();
                        }
                    }
                    if(l_dom_page_jump_btn[0]){
                        l_dom_page_jump_btn[0].onclick = function(){
                            let num = _this.publicFunc.mx(".page_jump_input")[0].value;
                            if(num.trim()){
                                let data_time = data.noreverse?data.time:data.time.reverse();
                                let data_length = data_time.length;
                                let x_num = parseInt(_this.publicFunc.mx("#history_list_main").offsetWidth/314);
                                let y_num = parseInt((_this.publicFunc.mx("#history_list_main").offsetHeight-60)/215);
                                let all_num = x_num * y_num;//每页显示的视频数
                                let all_page_num = Math.ceil(data_length/all_num);//总页数
                                if(num > all_page_num){
                                    now_page = parseInt(all_page_num);
                                }else if(num < 1){
                                    now_page = parseInt(1);
                                }else{
                                    now_page = parseInt(num);
                                }
                                data.noreverse = 1;
                                create_history_list(data);
                            }
                        }
                    }
                }
                for (let j = 0; j < l_dom_page_num_btn.length; j++) {
                    l_dom_page_num_btn[j].onclick = function () {
                        let num = this.innerHTML;
                        now_page = parseInt(num);
                        data.noreverse = 1;
                        create_history_list(data);
                    }
                }
            }
            function create_history_list(data) {
                _this.publicFunc.closeBufferPage()
                let data_time = data.noreverse ? data.time : data.time.reverse();
                let data_video = data.noreverse ? data.video : data.video.reverse();
                let history_list_dom = "";
                let token = [];
                if (data_time.length > 0) {
                    $("#history_list_bottom").show();
                    let data_length = data_time.length;
                    let x_num = parseInt(_this.publicFunc.mx("#history_list_main").offsetWidth / 314);
                    let y_num = parseInt((_this.publicFunc.mx("#history_list_main").offsetHeight - 60) / 215);
                    let all_num = x_num * y_num;//每页显示的视频数
                    let all_page_num = Math.ceil(data_length / all_num);//总页数
                    let start_num = ((now_page - 1) * all_num);
                    let end_num = (now_page * all_num) > data_length ? data_length : (now_page * all_num);
                    
                    for (let i = start_num; i < end_num; i++) {
                        let start_time = new Date(data.time[i].time_start).format("yyyy-MM-dd hh:mm:ss");
                        if (data.video[i].is_photo) {
                            history_list_dom +=
                                "<div class='history_list_img' style='position:relative;' num=" + i + " img='false'>"
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
                        } else {
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
                                + "<div class='camera_sign_picture' type='video' pic_token='" + data.video[i].cut_video_data[0].pic_token + "' token='" + data.video[i].cut_video_data[0].token + "' start_time='" + data.time[i].time_start + "' end_time='" + data.time[i].time_end + "'>"
                                + "<img class='video_list_picture' num=" + i + ">"
                                + "</div>"
                                + "<div class='device_nick'>"
                                + "<span>" + start_time + "</span>"
                                + "<div class='video_delete'></div>"
                                + "</div>"
                                + "</div>";
                        }
                        token.push(data.video[i].cut_video_data[0].pic_token);
                    }
                    let history_page_dom = "";
                    let now_page_2 = 0;
                    if (all_page_num <= 3) {
                        for (let j = 1; j <= all_page_num; j++) {
                            if (now_page == j) {
                                history_page_dom += "<div class='page_num_btn page_num_btn_yes'>" + j + "</div>"
                            } else {
                                history_page_dom += "<div class='page_num_btn page_num_btn_no'>" + j + "</div>"
                            }
                        }
                    } else {
                        if (now_page > 3) {
                            history_page_dom += "<div class='page_num_btn page_num_btn_no'>1</div><div style='float:left;width:10px;'>...</div>"
                        }
                        if (now_page == 1) {
                            now_page_2 = now_page + 2;
                            history_page_dom += "<div class='page_num_btn page_num_btn_yes'>" + now_page + "</div>"
                            history_page_dom += "<div class='page_num_btn page_num_btn_no'>" + (now_page + 1) + "</div>"
                            history_page_dom += "<div class='page_num_btn page_num_btn_no'>" + (now_page + 2) + "</div>"
                        } else if (now_page > all_page_num - 2) {
                            now_page_2 = now_page;
                            for (let j = 2; j >= 0; j--) {
                                if (now_page == (all_page_num - j)) {
                                    history_page_dom += "<div class='page_num_btn page_num_btn_yes'>" + (all_page_num - j) + "</div>"
                                } else {
                                    history_page_dom += "<div class='page_num_btn page_num_btn_no'>" + (all_page_num - j) + "</div>"
                                }
                            }
                        } else {
                            now_page_2 = now_page;
                            history_page_dom += "<div class='page_num_btn page_num_btn_no'>" + (now_page - 1) + "</div>"
                            history_page_dom += "<div class='page_num_btn page_num_btn_yes'>" + now_page + "</div>"
                            history_page_dom += "<div class='page_num_btn page_num_btn_no'>" + (now_page + 1) + "</div>"
                        }
                        if (now_page_2 <= all_page_num - 2) {
                            history_page_dom += "<div style='float:left;width:10px;'>...</div><div class='page_num_btn page_num_btn_no'>" + all_page_num + "</div>"
                        }
                        if(all_page_num>4){
                            history_page_dom +="<input type='number' class='page_jump_input'/>"
                                            +"<button class='page_jump_btn'>"+ mrs_jump_to +"</button>"
                        }
                    }
                    _this.publicFunc.mx("#page_num_main").innerHTML = history_page_dom;
                    _this.publicFunc.mx("#history_list_main").innerHTML = history_list_dom;
                    _this.$api.history.history_img_get({
                        sn: _this.$store.state.jumpPageData.selectDeviceIpc,
                        flag: 2,
                        token: token,
                        dom: _this.publicFunc.mx(".video_list_picture"),
                    })
                    device_history_list_event(data);
                } else {
                    $("#history_list_bottom").hide();
                    history_list_dom =
                        "<div id='history_no_list'>"
                        + "<div id='history_no_list_img'></div>"
                        + "<div id='history_no_list_content'>" + mcs_no_history + "</div>"
                        + "</div>"
                }
            }
        }
        obj.box_sn = _this.$store.state.jumpPageData.selectDeviceIpc;
        obj.flag = 2;
        obj.start_time = 0;
        obj.end_time = 0;
        obj.search_type = 1;
        obj.func = device_history_list;
        _this.$api.history.boxlist_device_messages_get(obj).then(res => {
            device_history_list(res)
        })
        $("#menu_box_main").hide();
        $("#set_back").show();
        window.onresize = function () {
            _this.publicFunc.mx("#history_list_main").style.width = (obj.parent.width() - 20 - 260) + "px";
            _this.publicFunc.mx("#dev_main_page").style.height = (document.documentElement.clientHeight - 54) + "px";
        }
    }
  },
  async mounted () {
    this.publicFunc.projectReload.call(this);
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData;//页面创建相关对象
    if(this.$route.params){
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name)
    }else{
      pageData = {parent: $("#" + this.$route.name)}
    }
    // console.log(pageData,"pageData")
    await this.mipcHistory(pageData) // 进入页面后加载
    await this.publicFunc.importCss('Public.scss') // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf('vimtag') === -1) {
      // mipc系列
      languageSelect.mipc($('#login_box'))
      $('#login_box').append("<div id='is_mipc_div'></div>")
    }
  }
}
</script>