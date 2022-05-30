function callNative(func, param, callback) {
    if (g_browser == "ios") {
        call_ios_native(func, param, callback);
    } else if (g_browser == "android") {
        call_android_native(func, param, callback);
    }else if(g_browser == "web"){
         var msdk = new MSdk(param)
        msdk.sdk_callNative(func, param, callback)
    }else {
        log("Unsupported system");
    }
}

function onEvent(param){
    //log(param)
    if (g_browser == "ios") {
        call_ios_event(param);
    } else if (g_browser == "android") {
        call_android_event(param);
    }else if(g_browser == "web"){
        call_web_event(param)
    } else {
        log("Unsupported system");
    }
}

function callback_live_play(param){
    var obj;
    if(typeof param === "string"){
        obj = eval("(" + param + ")");
    }else{
        obj = param;
    }
    console.log(obj,"obj")
    console.log(obj.param.data,"obj.param.data")
    var result = new Object();
    result.data = {"ref":obj.param.data.ref,"result":obj.result};
    result.ref = obj.param.ref;
    onEvent(JSON.stringify(result));
}

function callback_play_destory(param){
    var obj;
    if(typeof param === "string"){
        obj = eval("(" + param + ")");
    }else{
        obj = param;
    }
    var result = new Object();
    result.data = {"ref":obj.param.data.ref,"result":obj.result};
    result.ref = obj.param.ref;
    onEvent(JSON.stringify(result));
}

function call_android_native(func, param, callback){
    window.McldActivityNativeJS.callNative(func, param, callback);
}

function call_android_event(param){
    window.McldActivityNativeJS.onEvent(param);
}

function call_ios_native(func, param, callback){
    callOCNative(func,param,callback);
}

function call_ios_event(param){
    callOCOnEvent(param);
}

function call_web_event(param){
     var msdk = new MSdk(param)
    msdk.sdk_onEvent(param)
}


function log(string){
    if(g_isLog){
        console.log(string)
    }
}