function login_func(obj) {
    var _this = this;
    _this.sign_in = function (param) {
        if (param.data.user == '' || param.data.pass == '') {
            var result = new Object();
            result.data = {"result": "param err"};
            result.ref = ref.ref_param;
            onEvent(JSON.stringify(result));
        }

        ms.send_msg("sign_in", {
            srv: g_server_device,
            user: param.data.user,
            password: mmd5.hex(param.data.pass)
        }, {
            "userName": param.data.user,
            "password": param.data.pass,
            "ref_param": param.ref
        }, function (msg, ref) {
            if (msg && msg.result == "") {
                g_user_name = ref.userName;
                g_user_pass = ref.password;
            }
            var result = new Object();
            result.data = {"result": msg.result};
            result.ref = ref.ref_param;
            onEvent(JSON.stringify(result));
        });
    };
}

var login_func_ctrl = new login_func();

g_func.push(
    {type: "login",login:"0", action: login_func_ctrl.sign_in}
)