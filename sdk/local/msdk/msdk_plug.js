var MSdk
(function () {
        var msdk = [];
        var isInitializing = false;
        var isInitialized = false;
        var msdk_server="";
        // 建立msdk构造对象
        MSdk = function () { }
        // 为msdk构造对象添加原型属性
        MSdk.prototype = {
            // 创建函数
            create: function (param) {
                var object;
                if (typeof param === "string") {
                    object = eval("(" + param + ")");
                } else {
                    object = param;
                }
                var data = object.data;
                var ref = object.ref;
                var callback = object.callback;
                if (isInitializing || isInitialized) {
                    return;
                }
                isInitializing = true;
                var obj = new Object();
                obj.data = data;
                obj.setting = {
                    "platform": "web",
                    "appId": "mipcm.com",
                    "language": (navigator.language || navigator.browserLanguage).toLowerCase(),
                    "sdk_version": "v1.1.1.1906122000",
                    "timeZone": "Asia\/Shanghai"
                }
                msdk.push(callback, ref);
                obj.ref = { "key_callback": msdk.indexOf(callback), "key_ref": msdk.indexOf(ref) }
                var time = setInterval(function () {
                    if (typeof msdk_create != 'undefined' && msdk_create instanceof Function) {
                        msdk_create(obj);
                        clearInterval(time);
                        isInitializing = false;
                        isInitialized = true;
                    }
                }, 500);
            },
            // 操控函数
            ctrl: function (param) {
                var objectParam;
                if (typeof param === "string") {
                    objectParam = eval("(" + param + ")");
                } else {
                    objectParam = param;
                }
                // console.log(objectParam)
                var data = objectParam.data;
                var cmd = objectParam.cmd;
                var ref = objectParam.ref;
                var object = objectParam.obj;
                var callback = objectParam.callback;
                data.func = cmd;
                if (!isInitialized) {
                    var obj;
                    if (typeof param === "string") {
                        obj = eval("(" + data + ")");
                    } else {
                        obj = data;
                    }
                    var result = new Object();
                    result.ref = obj.ref;
                    result.result = "is not create";
                    callback(result);
                }
                var obj = new Object();
                obj.data = data;

                obj.setting = {
                    "platform": "web",
                    "appId": "mipcm.com",
                    "language": "zh",
                    "sdk_version": "v1.1.1.1906122000",
                    "timeZone": "Asia\/Shanghai"
                }
                msdk.push(object, callback, ref)
                obj.ref = { "key_callback": msdk.indexOf(callback), "key_obj": msdk.indexOf(object), "key_ref": msdk.indexOf(ref) };
                msdk_ctrl(obj)
            },
            // 操控内部事件
            sdk_onEvent: function (param) {  //onEvent create ctrl
                var obj;
                if (typeof param === "string") {
                    obj = eval("(" + param + ")");
                } else {
                    obj = param;
                }
                if(!obj.data.img_src){
                    if(!obj.ref.box_sn){
                        if(obj.ref){
                            var key_callback,key_ref;
                            key_callback = (typeof obj.ref.key_callback == "number" ?obj.ref.key_callback:obj.ref.ref.key_callback);
                            key_ref = (typeof obj.ref.key_ref == "number"?obj.ref.key_ref:obj.ref.ref.key_ref);
                            msdk[key_callback](obj.data, msdk[key_ref])
                        }
                    }
                    else{
                        var ref = "sd_recording_list_ack";
                        for(var i = 0; i < msdk.length; i++){
                            if(typeof msdk[i] == "object"&&msdk[i] != null){
                                if(msdk[i].ref == ref){
                                    msdk[i-1](obj.data, msdk[i])
                                    break;
                                }
                            }
                        }
                    }
                }else{
                    var ref = "history_img_get_ack";
                    for(var i = 0; i < msdk.length; i++){
                        if(typeof msdk[i] == "object"&&msdk[i] != null){
                            if(msdk[i].ref == ref){
                                msdk[i-1](obj.data, msdk[i])
                                break;
                            }
                        }
                    }
                }
                //msdk[obj.ref.key_callback](obj.data, msdk[obj.ref.key_ref])
            },
            // video播放函数
            sdk_callNative: function (func, param, callback) { //play
                console.log(func,"func")
                console.log(param,"param")
                console.log(callback,"callback")
                var obj;
                if (typeof param === "string") {
                    obj = eval("(" + param + ")");
                } else {
                    obj = param;
                }
                console.log(obj,"obj")
                if (func == "livePlay"&&obj.data.type=="hls") {  
                        
                       function init(ref_obj)
                        {
                            return 0;
                        }
                        function start()
                        {
                            var screen = document.getElementById('screen');
                            var ref_obj = {name:'xxx'};
                            var mme_params = 
                            {
                                parent:screen,
                                ref_obj:ref_obj,
                                hls_id:'hls-video',
                                on_event:function(ref){init(ref_obj)}
                            };
                            // var me = new mme(mme_params);
                             return mme_params;
                        }
                        function playEntry(me, obj, method)
                        {

                            if(method == 'chl_create'){
                                var chl_params = "{src:[{url:\"" + obj + "\"}]}";
                                // me.ref_obj.mme.chl = me.chl_create({params:chl_params});
                                me.chl_ctrl('create', {params:chl_params});
                            }else if(method == 'chl_destroy'){
                                me.chl_ctrl('destroy',0);
                            }else if(method == 'chl_play'){
                                me.chl_ctrl('play',0);
                            }else if(method == 'chl_pause'){
                                me.chl_ctrl('pause',0);
                            }else if(method == 'chl_change'){
                                me.chl_ctrl('change',obj);
                            }else if(method == 'chl_catch_err'){
                                me.chl_ctrl('catch_err',obj);
                            }
                        }
                       var mme_params = start();
                        function tryGetM3u8(mobj, url)
                        {
                            var params = mobj.params;
                            $.ajax({url:url+'.m3u8', timeout:3000, error:function(e){
                                mobj.counts++;
                                setTimeout(function(){
                                    if(mobj.counts <= 25)
                                        tryGetM3u8(mobj, url);
                                    else
                                        alert('获取m3u8超时');
                                },1000);
                            }, success:function(data){
                                var me = new mme(params);
                                console.log(me,"me")
                                if(undefined != me.player && null != me.player){
                                    playEntry(me, url, 'chl_change');
                                    playEntry(me, 0, 'chl_play');
                                }else
                                {
                                    playEntry(me, url, 'chl_create');
                                    var obj = {
                                        call:function(ref){
                                            alert(ref);
                                        }
                                    }
                                    playEntry(me, obj, 'chl_catch_err');
                                    playEntry(me, 0, 'chl_play');
                                }
                            }})            
                        }
                        mme_params.parent.innerHTML = "<p style='color: orange'>视频加载需要等待，请稍后~~~</p><img src='"+msdk_server+"/dcm/sdk_plug/img/buffer.gif' style='position:absolute; top:35%; left:38%;'></img>";
                        var mobj = {params:mme_params, counts:0};
                        tryGetM3u8(mobj, obj.data.url);
                }
                var result = new Object();
                result.result = "";
                result.param = obj.data.param;
                eval(callback + "(" + JSON.stringify(result) + ")")
            }
        }
})()