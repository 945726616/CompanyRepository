function devInfo_func(obj){
    var _this = this;
    _this.get_dev_info = function(param){
        ms.send_msg("devs_refresh",{},param.ref,function(msg,ref){
            var result = new Object();
            if(msg && msg.data.devs != ""){
                for (i=0;i<msg.data.devs.length;i++){
                    if(msg.data.devs[i].sn === param.data.sn){
                        result.data = {"result":"","sn":msg.data.devs[i].sn,"dev_stat":msg.data.devs[i].stat};
                        result.ref = ref;
                        onEvent(JSON.stringify(result).toLowerCase())
                        return;
                    }
                }
                result.data = {"result":"not find dev in list"};
                result.ref = ref;
                onEvent(JSON.stringify(result))
            }else{
                result.data = {"result":"not find dev in list"};
                result.ref = ref;
                onEvent(JSON.stringify(result))
            }
        });
    }
}
var devInfo_func_ctrl = new devInfo_func();
g_func.push(
    {type:"get_dev_info",login:"1",action:devInfo_func_ctrl.get_dev_info}
)