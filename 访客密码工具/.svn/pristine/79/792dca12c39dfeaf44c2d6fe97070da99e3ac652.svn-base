
function class_mining_software(){
    var l_me = this;
    l_me.send_msg=function(type,data,ref,callback)
    {   //Not mmq then create a progress bar rotation
        //console.log(type+":"+JSON.stringify(data))
        var on_ack=function(msg,ref){
            //Not mmq then delete the rotation progress bar
            switch(msg.result)
            {
                case "mcs_connection_is_interrupted":
                    system_pop_confirm_box({alert:true, str:mcs_connection_is_interrupted,callback_func:function(obj){window.location.reload(true);}});
                    return;
                case "DeviceOffline":
                case "InvalidAuth":
                    //l_device_list_box_obj.ctrl({type:"refresh"});
                    break;
                case "permission.denied":
                    if( type != "sd_set" && g_now_page != "login_page" )
                        g_domain_oems_vimtag?msg_tips({msg:mcs_permission_denied, type:"error", timeout:3000}):g_system_prompt_box(mcs_permission_denied);
                    break;
                //case "accounts.user.offline":
                //   g_system_prompt_box(mcs_device_offline);
                //   break;
                case "SdIsNotReady":
                    g_system_prompt_box(mcs_sdcard_not_ready);
                    break;
                case "":
                    break;
            }
            if(callback){
                callback(msg,ref);
            }
        }
        msdk_agent[type](data,ref,on_ack);
    }
}

function msdk_create(param){
    // console.log(JSON.stringify(param));
    var obj;
    if(typeof param === "string"){
        obj = eval("(" + param + ")");
    }else{
        obj = param;
    }
	// console.log(obj)
    g_appId = obj.setting.appId;
    g_browser = obj.setting.platform;
    g_language = obj.setting.language;
    g_sdk_version = obj.setting.sdk_version;
    g_time_zone = obj.setting.timeZone;

    msdk_agent = new mcloud_agent();
    window.ms = new class_mining_software();
    var result = new Object();
    result.data = {"result":""};
    result.ref = obj.ref;
    onEvent(JSON.stringify(result));
}

function msdk_ctrl(param){
    var obj;
    if(typeof param === "string"){
        obj = eval("(" + param + ")");
    }else{
        obj = param;
    }
    // console.log("msdk_ctrl : "+JSON.stringify(obj));
    for(var i=0;i<g_func.length;i++){
       if(g_browser/* && (g_browser === "android" || g_browser === "ios")*/){
            if(obj.data.func == g_func[i].type){
                if(g_func[i].login == "1"){
                    if(g_user_name && g_user_pass){
                        ms.send_msg("sign_in",{srv:g_server_device,user:g_user_name, password:mmd5.hex(g_user_pass)},{},
                            function (msg,ref){
                                if(msg && msg.result === ""){
                                    g_func[i].action(obj);
                                }
                            });
                    }else{
                        var result = new Object();
                        result.data = {"result":"is not login"};
                        result.ref = obj.ref;
                        onEvent(JSON.stringify(result));
                    }
                }else{
                    g_func[i].action(obj);
                }
                break;
            }
        }else{
           var result = new Object();
           result.data = {"result":"Unsupported system"};
           result.ref = obj.ref;
           onEvent(JSON.stringify(result));
        }
    }
}

function msdk_destory(){

}