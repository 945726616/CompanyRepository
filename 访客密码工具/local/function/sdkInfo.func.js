function sdkInfo_func(data){
    var _this = this;
    _this.get_sdk_info = function(param){
        var result = new Object();
        result.data = {"result":"","version":g_version};
        result.ref = param.ref;
        onEvent(JSON.stringify(result));
    }
}

var sdkInfo_func_ctrl = new sdkInfo_func();
g_func.push(
    {type:"get_info",login:"0",action:sdkInfo_func_ctrl.get_sdk_info}
)