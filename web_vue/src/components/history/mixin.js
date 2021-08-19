export const historyMixin = {
    data() {
        return {
            history_info: {}, //历史信息
            history_initial_data: '', //历史初始数据
            history_data: [], //历史数据
            start_time: [], //历史数据开始时间
            date_infos_time: [], // 解决cid返回后日期报错问题
            vedio_day: [],
            iscid: 0, //cid检索
            a_start: '',
            b_end: '',
            prev_sid: '',
            prev_cid: '',
            next_cid: '',
            next_sid: '',
            num: 0, //记录点击前一天次数
            choose_start_time: '', //选择日期的开始时间
            choose_end_time: '', //选择日期的结束时间
            filter_type: { format_options: 2, category: 0, time_length: '30min' }, //筛选条件(格式：快照1/录像2/全选0，类别：事件1/全选0，时长：1h/30min/5min)
            picture_data_sign: { src: '', time: '' }, //是否点击照片获取照片数据
            token: [], //图片token
        }
    },
    methods: {
        video_delete_btn(e) { //删除录像
            let _this = this;
            let history_dom = e.currentTarget.parentNode.parentNode;
            let start_time = history_dom.childNodes[3].getAttribute("start_time");
            let end_time = history_dom.childNodes[3].getAttribute("end_time");
            _this.publicFunc.delete_tips({
                content: mcs_delete + "?",
                func: function() {
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
        filter_snapshot_btn() { //点击格式-快照
            this.filter_type.format_options = 1;
            this.iscid = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表 
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        filter_video_btn() { //点击格式-录像
            this.filter_type.format_options = 2;
            this.iscid = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表 
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 1
            }).then(res => {
                this.create_history_list(res)
            })
        },
        filter_video_snapshot_btn() { //点击格式-全选
            this.filter_type.format_options = 0;
            this.iscid = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表 
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        filter_event_btn() { //点击类别-事件
            this.filter_type.category = 1;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        filter_all_event_btn() { //点击类别-全选
            this.filter_type.category = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        time_length_1h_btn() { //点击时长-一小时
            this.filter_type.time_length = "1h";
            this.iscid = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        time_length_30min_btn() { //点击时长-半小时
            this.filter_type.time_length = "30min";
            this.iscid = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        time_length_5min_btn() { //点击时长-五分钟
            this.filter_type.time_length = "5min";
            this.iscid = 0;
            this.publicFunc.showBufferPage()
            this.$api.history.history_list_get({ // 调用获取历史记录列表
                agent: this.history_initial_data.agent,
                box_sn: this.$store.state.jumpPageData.selectDeviceIpc,
                dev_sn: this.history_initial_data.dev_sn,
                start_time: this.choose_start_time,
                end_time: this.choose_end_time,
                format: this.filter_type.format_options,
                category: this.filter_type.category,
                time_length: this.filter_type.time_length,
                search_type: 0
            }).then(res => {
                this.create_history_list(res)
            })
        },
        camera_sign_picture_btn(e) { //点击录像
            let jumpData = this.history_initial_data;
            let num = e.currentTarget.parentNode.getAttribute("num");
            jumpData.token = e.currentTarget.getAttribute("token");
            jumpData.download_token = e.currentTarget.getAttribute("download_token"); //解决因end_new_token 引起的视频无法下载问题
            jumpData.pic_token = e.currentTarget.getAttribute("pic_token");
            jumpData.start_time = e.currentTarget.getAttribute("start_time");
            jumpData.end_time = e.currentTarget.getAttribute("end_time");
            jumpData.data = this.history_data[num].cut_video_data;
            jumpData.a_start = this.a_start;
            jumpData.b_end = this.b_end;
            if(this.history_info.box_ipc){ //云盒子
                jumpData.box_ipc = this.history_info.box_ipc;
            }
            this.$router.push({ name: 'playback', params: jumpData })
        },
        photo_sign_picture_btn(e) { //点击照片
            let token = e.currentTarget.getAttribute("pic_token");
            token = token.replace("_p3_", "_p0_");
            this.picture_data_sign.src = this.$api.devlist.pic_url_get({
                sn: this.$store.state.jumpPageData.selectDeviceIpc,
                flag: 2,
                token: token,
                is_history: 1
            })
            this.picture_data_sign.time = new Date().getTime();
        },
    }
}