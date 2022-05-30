function mcloud_entry(data,callback) {
    var urls_http = ["52.8.41.82:7080",
        "209.133.212.170:7080",
        "149.202.201.87:7080",
        "119.23.57.95:7080"];
    var urls_https=["www.mipcm.com:7443","www.vimtag.com:7446","www.ebitcam.com:7445","www.vsmahome.com:7444"];

    function check_link(index) {
        var temp;
        if("https:" == window.location.protocol){
            if(index >= urls_https.length){
                return;
            }
            temp = urls_https[index];
        }else{
            if(index >= urls_http.length){
                return;
            }
            temp = urls_http[index];
        }
        msdk_agent.send_msg({type: "cmipcgw_get_req", to: "cmipcgw", srv: temp}, {client: {mode: "user", id: data.userName, param: [{name: "appid",value: g_appId}]}}, {},
            function (msg, ref) {
                if (msg && msg.data.result === '') {
                    if("https:" == window.location.protocol){
                        g_server_https = msg.data.server.signal[2];
                        g_server_device = g_server_https.replace("https://", "").replace("/ccm", "");
                    }else{
                        g_server_http = msg.data.server.signal[0];
                        g_server_device = g_server_http.replace("http://", "").replace("/ccm", "");
                    }
                    if (msdk_agent) {
                        msdk_agent.set_srv(g_server_device);
                    }
                    callback();
                } else {
                    check_link(index+1);
                }
            });
    }
    check_link(0)
}