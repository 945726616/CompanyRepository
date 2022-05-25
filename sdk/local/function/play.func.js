function play_func(obj) {
    var _this = this;
    var l_plug_type = "";
    var flash_flag = false; //flash标记
    if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
        platform = 'phone'
    } else {
        platform = 'pc';
    }
    // console.log(platform)

    _this.play = function (data) {
        // console.log(data)
        if (platform == 'pc') { //flash播放
            var judge_enable_native_plug = true;
            var judge_enable_flash_plug = false;
            var ref_obj = create_play_ipc(data);
            var playback = data.playback ? 1 : 0;
            if(playback){
                var token = data.data.token.split("-");
                data.data.sn = token[0];
                data.data.token = token[0] + "_" + token[1] + "_" + token[2] + "_end.cid:" + token[3] + "_end.sid:" + token[4];
                data.data.videoSize = data.data.duration*1000;
            }
            var screen = document.getElementById('screen');
            screen.style.display = "block";
            var mme_params = {
                parent: screen,
                enable_native_plug: judge_enable_native_plug,
                enable_flash_plug: judge_enable_flash_plug,
                params: "{key:'data:application/octet-stream;base64,OenOl2/PvPX7EuqqZdvMsNf5PqEOlOJZ4sROOBtnvW8F6Fc+azokLNtti6Cb/oiuO9qhOxvDfL8cVpGY4UcCe81OIVHkbiNzuHKwiE+K6gmmWwIoHgSRn2RN4qsZO62QkqGePdR6L94n2ruSeixjqAgWFTW8AIlQptovRZSN1Dh/8M87RIRdYyVFqKqsZoZTYibPLyDFONKIqxzrFkJPtqR/wn8jnYMc1qUH/w3IYJZh/OqctPTDp8tYuQSWN3EE6+kVmDIMV9F92SZJORMnvxy+zYzpbO7Gz44fBQNQSGMelsf7yQpfTF/X8t1Qn73fu53xp3MTIGH0kklFH2tMPkO/Raelhw5A4JQbczWg0n4pcNxpRl6mCEIjFprTboJ/B2eI0qUX/zTPM7l1hBmxjxsewORsXp0y2+NnCRH0uVBGUq6fOWrdhJwotIIu5ZAZwdoDZZu6eaycol2TIS5smusoD0ODPtQ2xZoCy7djIC4MVhB5uKe0zDXbLr+Serdlq6en5HyvUN0EEmYle0fORmgNFn0DTqqTab6cx8WfFkysciJSveN4swoR66qMQUi9+TfkHTnZ/REp3kHJtSq8XJyzTe+KCXlJXGx07nAbK4svIPanx39A5o5XlpLK/ohxiMpEJZ6OhmWb9yAnL+8Bedw+epvbNQkhADh2QqB4ItsIq5KTOsNzA0aNn3FEXzyd7WLVBqcF1lUVxu1vpYRPKv01im1ORbVhDoJ9eiqkfchutpAGYOwhYzxFWOIhTMouY+m/oQhc1d8FF4T+zSx6WVmj2f+RDUdOKbQVxJdEeiGKyIDm14K34Kz+RdzF0fY50sbs/SUfMWwuKQsEPFU5KQ'}",
                on_event: function (e) {
                    e.sn = data.sn;
                    on_plug_event(e)
                },
                ref_obj: ref_obj,
                debug: 0
            };
            var me1 = new mme(mme_params);

            function on_plug_event(obj) {
                // console.log(obj.type)
                switch (obj.type) {
                    case "missing": {
                        if (!playback) {
                            if ((navigator.userAgent.toLowerCase().match(/chrome\/[\d.]+/gi) + "").replace(/[^0-9.]/ig, "") > "44") {
                                location.href = "https://www.adobe.com/go/getflashplayer";
                            }
                        }

                        flash_flag = !flash_flag;
                        if (flash_flag == false) { //flash失败hls
                            var resolution = "p3"
                            if (data.data.stream === "major") {
                                resolution = "p1"
                            }
                            if (data.data.key_mme == '' || data.data.sn == '') {
                                var result = new Object();
                                result.data = {
                                    "result": "param err"
                                };
                                result.ref = data.ref;
                                onEvent(JSON.stringify(result))
                            }
                            var var_protocol = "rtdp"
                            if (g_browser == "web") {
                                var_protocol = "http";
                            }
                            
                            if (!playback) {
                                ms.send_msg("play", {
                                    sn: data.data.sn,
                                    token: resolution,
                                    protocol: var_protocol,
                                    ref: ""
                                }, data.ref, function (msg, ref) {
                                    var result = new Object();
                                    result.data = {
                                        "sn": data.data.sn,
                                        "url": msg.url,
                                        "type": "hls",
                                        "key_mme": data.data.key_mme,
                                        "param": data
                                    };
                                    result.ref = ref;
                                    callNative("livePlay", JSON.stringify(result), "callback_live_play");
                                });
                            } else {
                                ms.send_msg("playback", {
                                    sn: data.data.sn,
                                    token: data.data.token,
                                    protocol: var_protocol,
                                    ref: ""
                                }, data.ref, function (msg, ref) {
                                    var result = new Object();
                                    result.data = {
                                        "sn": data.data.sn,
                                        "url": msg.url,
                                        "type": "hls",
                                        "key_mme": data.data.key_mme,
                                        "param": data
                                    };
                                    result.ref = ref;
                                    callNative("livePlay", JSON.stringify(result), "callback_live_play");
                                });
                            }
                        }
                        break;
                    }
                    case "ready": {
                        console.log(obj.ref_obj.inner_window_info)
                        var proto = obj.ref_obj.protocol;
                        if (obj.plug.type.name == "flash") {
                            l_plug_type = "flash";
                            proto = "rtmp";
                        } else {
                            if (proto == "auto")
                                proto = "rtdp";
                        }
                        if (playback) {
                            ref_obj = ref_obj.data;
                            ms.send_msg("playback", {
                                sn: ref_obj.sn,
                                token: ref_obj.token,
                                protocol: proto,
                                ref: obj.ref_obj
                            }, obj.ref_obj, function (msg, ref) {
                                msg.type = "playback";
                                play_ack(msg, ref);
                            });
                        } else {
                            ms.send_msg("play", {
                                sn: ref_obj.data.sn,
                                token: obj.ref_obj.inner_window_info.profile_token,
                                protocol: proto,
                                ref: obj.ref_obj
                            }, obj.ref_obj, function (msg, ref) {
                                msg.type = "play";
                                play_ack(msg, ref);
                            });
                        }
                        break;
                    }
                    case "install_ui": {
                        obj.panel.id = "plugin_install_page";
                        break;
                    }

                }
            }

            function play_ack(msg, ref) {
                chl_video_create({
                    type: msg.type,
                    uri: msg.url,
                    me1: me1
                });
                var result = new Object();
                result.data = {
                    "sn": data.data.sn,
                    "url": msg.url,
                    "key_mme": data.data.key_mme,
                    "param": data
                };
                result.ref = ref;
                console.log(result,"result")
                console.log(data)
                callNative("livePlay", JSON.stringify(result), "callback_live_play");
            }


            function chl_video_create(obj) {
                var uri = obj.uri,
                    chl_params = (obj.type == "publish") ? "" : ",thread:\"istream\", jitter:{max:3000}" /* for old version's mme plugin */ ,
                    trans_params = (obj.type == "play") ? ",trans:[{flow_ctrl:\"jitter\",thread:\"istream\"}]" :
                    ((obj.type == "playback") ? ",trans:[{flow_ctrl:\"delay\",thread:\"istream\"}]" : "");

                var params_data;
                var l_ipc_speed_time;
                var l_Last_speed = 0;
                var l_speed = 0;
                var l_progress = 0;

                params_data = "{" + ((obj.type == "publish") ? "dst" : "src") + ":[{url:\"" + uri + "\"}]" + trans_params + chl_params + "}";
                me1.video_chls = me1.chl_create({
                    params: params_data
                });
                if(me1.video_chls !== null){
                    if(l_ipc_speed_time){
                        clearInterval(l_ipc_speed_time);
                    }
                    if(l_plug_type !== "flash"){ // 该判断条件中需要添加!此为客户端逻辑(去掉!用于在浏览器中测试使用)
                        l_ipc_speed_time = setInterval(function(){
                            var string_speed = me1.ctrl(me1.video_chls,"query","{}");
                            if(string_speed.length >= 150){
                                var json_speed=eval("(" + string_speed + ")");
                                 if(playback){
                                    var duration2 = sessionStorage.getItem("duration");    	
                                    var kb = json_speed.data.p2ping ? "kB" : "KB";
                                    l_speed = json_speed.data.total_bytes > l_Last_speed ? parseInt((json_speed.data.total_bytes-l_Last_speed)/1000)+kb : l_Last_speed=0;
                                    if(duration2 == json_speed.data.played_duration){
                                        duration_tip = true;
                                        sessionStorage.setItem("duration_tip",duration_tip)
                                    }
                                    l_Last_speed = json_speed.data.total_bytes;
                                    l_progress = parseInt((json_speed.data.played_duration/data.videoSize)*100);
                                    sessionStorage.setItem("duration",json_speed.data.played_duration);
                                    
                                }else{
                                    var kb = json_speed.data.p2ping?"kB":"KB";
                                    l_speed = json_speed.data.total_bytes>l_Last_speed?parseInt((json_speed.data.total_bytes-l_Last_speed)/1000)+kb:l_Last_speed=0;
                                    l_Last_speed = json_speed.data.total_bytes;
                                }
                            }
                        },1000)
                    }
                }
                if(obj.type == "playback"){
                    setTimeout(function(){play_ipc(obj)},1000)
                }
            }

            function play_ipc(obj){
                me1.ctrl(me1.video_chls, "play", "");
                me1.playback_state = "play";
                return 0;
            }

            function create_play_ipc(obj) {
                obj.protocol = "auto";
                obj.videoSize = obj.videoSize?obj.videoSize:0;
        	    obj.localPath = obj.download_path?obj.download_path:null;
                obj.inner_window_info = {
                    dom_id: ("play_screen"),
                    index: 1,
                    video_chls: null,
                    audio_chls: null,
                    mme: null,
                    ipc_state: "",
                    node_sn: obj.sn,
                    profile_token: 'p0'
                };
                return obj;
            }

        } else {
            var resolution = "p3"
            if (data.data.stream === "major") {
                resolution = "p1"
            }
            if (data.data.key_mme == '' || data.data.sn == '') {
                var result = new Object();
                result.data = {
                    "result": "param err"
                };
                result.ref = data.ref;
                onEvent(JSON.stringify(result))
            }
            var var_protocol = "rtdp"
            if (g_browser == "web") {
                var_protocol = "http";
            }
            if (!playback) {
                ms.send_msg("play", {
                    sn: data.data.sn,
                    token: resolution,
                    protocol: var_protocol,
                    ref: ""
                }, data.ref, function (msg, ref) {
                    var result = new Object();
                    result.data = {
                        "sn": data.data.sn,
                        "url": msg.url,
                        "type": "hls",
                        "key_mme": data.data.key_mme,
                        "param": data
                    };
                    result.ref = ref;
                    callNative("livePlay", JSON.stringify(result), "callback_live_play");
                });
            } else {
                ms.send_msg("playback", {
                    sn: data.data.sn,
                    token: resolution,
                    protocol: var_protocol,
                    ref: ""
                }, data.ref, function (msg, ref) {
                    // console.log(msg)
                    var result = new Object();
                    result.data = {
                        "sn": data.data.sn,
                        "url": msg.url,
                        "type": "hls",
                        "key_mme": data.data.key_mme,
                        "param": data
                    };
                    result.ref = ref;
                    callNative("livePlay", JSON.stringify(result), "callback_live_play");
                });
            }
        }

    }


    _this.play_destory = function (param) {
        var screen = document.getElementById('screen');
        screen.style.display = "none";
        var result = new Object();
        result.data = {
            "param": param
        };
        result.ref = param.ref;
        callNative("PlayDestory", JSON.stringify(result), "callback_play_destory");
    }
}


var play_func_ctrl = new play_func();

g_func.push(
    {type: "live_play",login: "1",action: play_func_ctrl.play}, 
    {type: "sd_recording_play",login: "1",action: function (data) {data.playback = 1;play_func_ctrl.play(data)}}, 
    {type: "sd_recording_play_destory",login: "0",action: play_func_ctrl.play_destory},
    {type: "live_play_destory",login: "0",action: play_func_ctrl.play_destory}
)