/*
    mcloud_account
    
    base on:
    cryptojs_tripledes.js
    cryptojs_pad-nopadding-min.js

    mlib.core.base.js
    mlib.core.codec.js
    mlib.core.evt.js
    mlib.core.rpc.js
    mlib.crypt.dh.js
    mlib.crypt.md5.js
    
    ----history----------
    author: chengzhiyong date: 2014-08-13 action: create
    
*/

function mcloud_account() {
    var l_srv = window.location.host/* set by kugle */, l_usr = "", l_pwd_md5_hex = "",
        l_qid = "",
        l_tid = 0, l_lid = 0, l_sid = 0, l_seq = 0, l_addr = "", l_share_key = "", l_host = "", l_from_handle = 0,
        ret_err_accounts_nid_invalid = "accounts.nid.invalid",
        ret_err_accounts_sid_invalid = "accounts.sid.invalid",
        ret_err_accounts_lid_invalid = "accounts.lid.invalid",
        ret_err_accounts_sess_invalid = "InvalidSession",
        s_cacs_login_req = "cacs_login_req",
        s_cacs_reg_req = "cacs_reg_req",
        ret_err_refer_relogin = [ret_err_accounts_nid_invalid, ret_err_accounts_sid_invalid, ret_err_accounts_lid_invalid, ret_err_accounts_sess_invalid],
        CryptoJS = window.CryptoJS,
        mmd5 = window.mmd5,
        mcodec = window.mcodec,
        mrpc = window.mrpc,
        mmq_pick_time, mmq_pick_time2, mmq_pick_time3, create_mmq;

    function get_share_key(share_key) {
        l_share_key = share_key;
    }

    function get_sid(sid) {
        l_sid = sid;
    }


    function set_srv(srv) {
        if (srv && (srv != l_srv)) {
            l_srv = srv;
            l_share_key = "";
        }
        ;
    }

    function get_srv_param(srv) {
        return l_srv = srv;
    }

    function get_srv() {
        return l_srv;
    }

    function pwd_encrypt(pwd_md5_hex) {
        var xxx = CryptoJS.enc.Hex.parse(pwd_md5_hex);
        return CryptoJS.DES.encrypt(CryptoJS.enc.Hex.parse(pwd_md5_hex), CryptoJS.enc.Hex.parse(mmd5.hex(l_share_key)),
            {iv: CryptoJS.enc.Hex.parse('0000000000000000'), padding: CryptoJS.pad.NoPadding}).ciphertext.toString();
    }

    function create_nid_ex(type/* 0:by sid, 2: by lid */) {/* \todo: if support type==>tid , plz change following line. */
        return mcodec.nid(++l_seq, type ? l_lid : l_sid, l_share_key, type, null, null, mmd5, "hex");
    }

    function create_nid() {
        return create_nid_ex(0);
    }

    function do_call(type, data, ref, on_ack) {
        if (type.to) {
            mrpc.call({
                srv: (window.location.protocol == "file:" ? "http:" : window.location.protocol) + "//" + (type.srv ? type.srv : l_srv) + "/",
                to: type.to,
                type: type.type,
                data: data,
                ref: ref,
                "static": false,
                way: (type.way ? type.way : "json"),
                qid: l_qid,
                on_ack: on_ack
            });
        }
        else {
            if (l_qid) {
                if (type == "cpns_get_req") {
                    mrpc.call({
                        srv: ref.remote_ip, to: "cpns", type: type, data: data,
                        ref: ref, "static": false, way: "json", qid: l_qid, on_ack: on_ack
                    });
                } else {
                    if (window.location.protocol == 'file:') {
                        mrpc.call({
                            srv: "http://" + l_srv + "/", to: "ccm", type: type, data: data,
                            ref: ref, "static": false, way: "json", qid: l_qid, on_ack: on_ack
                        });
                    } else {
                        mrpc.call({
                            srv: window.location.protocol + "//" + l_srv + "/", to: "ccm", type: type, data: data,
                            ref: ref, "static": false, way: "json", qid: l_qid, on_ack: on_ack
                        });
                    }
                }
            }
            else {
                if (type == "cpns_get_req") {
                    mrpc.call({
                        srv: ref.remote_ip, to: "cpns", type: type, data: data,
                        ref: ref, "static": false, way: "json", on_ack: on_ack
                    });
                }
                else {
                    if (window.location.protocol == 'file:') {
                        mrpc.call({
                            srv: "http://" + l_srv + "/", to: "ccm", type: type, data: data,
                            ref: ref, "static": false, way: "json", on_ack: on_ack
                        });
                    } else {
                        mrpc.call({
                            srv: window.location.protocol + "//" + l_srv + "/", to: "ccm", type: type, data: data,
                            ref: ref, "static": false, way: "json", on_ack: on_ack
                        });
                    }
                }
            }
        }
    }

    function get_uctx(data) {
        var json_buf = JSON.stringify(data);
        var key = CryptoJS.MD5(l_share_key);
        //to do 8 byte alignment
        var json_bufs = bytes_align(json_buf);
        var bytes_len = 8 * (parseInt(json_buf.length / 8) + 1), str_len = bytes_len / 4;

        var json_obj = {sigBytes: bytes_len, words: json_bufs, length: str_len};
        var json_uctx = CryptoJS.DES.encrypt(json_obj, key, {
            iv: CryptoJS.enc.Hex.parse('0000000000000000'),
            padding: CryptoJS.pad.NoPadding
        }).ciphertext.toString();
        var b = str_2_16bytes(json_uctx);

        var uctx = "data:application/octet-stream;base64," + mcodec.binary_2_b64(b);
        return uctx;
    }

    function do_sign_x(sign_type, srv, usr, pwd, pwd_md5_hex, ref, on_ack) {
        if (srv && (l_srv != srv)) {
            l_srv = srv;
            l_share_key = "";
            l_sid = 0;
        }
        ;
        if (usr && (usr != l_usr)) {
            l_usr = usr;
            l_sid = 0;
        }
        ;
        if (pwd && (l_pwd_md5_hex != pwd)) {
            l_pwd_md5_hex = pwd;
            l_sid = 0;
        }
        ;
        l_share_key = "";
        /* force dh now, by kugle */
        var lang = appid = name = "";
        if (sign_type == "cacs_reg_req" && ref) {
            lang = ref.lang;
            appid = ref.appid;
            name = ref.name;
        }

        function send_req() {
            if (name) {
                var json_buf = {app: {id: appid}};
                var uctx = get_uctx(json_buf);
                do_call(sign_type, {
                        lid: l_lid,
                        nid: create_nid_ex(2),
                        user: l_usr,
                        pass: pwd_encrypt(l_pwd_md5_hex),
                        session_req: 1,
                        p: [{n: "uctx", v: uctx}],
                        param: [{name: "spv", value: "v1"}]
                    }, ref,
                    function (msg, ref) {
                        var data = msg ? msg.data : null;
                        if ((sign_type == s_cacs_login_req) && data && data.result == "") {
                            l_sid = data.sid;
                            l_seq = data.seq;
                            l_addr = data.addr;
                        }
                        ;
                        on_ack(msg, ref);
                    });
            } else {
                do_call(sign_type, {
                        lid: l_lid,
                        nid: create_nid_ex(2),
                        user: l_usr,
                        pass: pwd_encrypt(l_pwd_md5_hex),
                        session_req: 1,
                        param: [{name: "spv", value: "v1"}]
                    }, ref,
                    function (msg, ref) {
                        var data = msg ? msg.data : null;
                        if ((sign_type == s_cacs_login_req) && data && data.result == "") {
                            l_sid = data.sid;
                            l_seq = data.seq;
                            l_addr = data.addr;
                        }
                        ;
                        on_ack(msg, ref);
                    });
            }
        }

        if (l_share_key) {
            send_req();
        } else {
            var secret_key = mdh.gen_private(), pub_key = mdh.gen_public(secret_key);
            do_call("cacs_dh_req", {bnum_prime: mdh.prime, root_num: mdh.g, key_a2b: pub_key, tid: l_tid}, ref,
                function (msg, ref) {
                    var data = msg ? msg.data : null;
                    if ((!data) || data.result) {
                        on_ack(msg, ref);
                        return;
                    }
                    ;
                    l_tid = data.tid;
                    l_lid = data.lid;
                    l_share_key = mdh.gen_shared_secret(secret_key, data.key_b2a);
                    send_req();
                });
        }
    }

    function check_ret_is_need_relogin(msg) {
        var i, ret, s_ret;
        if (msg && msg.data) {
            ret = msg.data.ret || msg.data.result || msg.data.Result;
            s_ret = ret ? (ret.reason || ret.sub || ret.code || ret.Reason || ret.SubCode || ret.Code) : null;
            for (i = 0; s_ret && (i < ret_err_refer_relogin.length); i++) {
                if (s_ret == ret_err_refer_relogin[i] && msg.type != "ccm_subscribe") {
                    return 1;
                }
                ;
            }
            return 0;
        }
        else if (msg == "timeout") {
            return 0;
        }
        else {
            return 1;
        }
    }

    function send_msg(type, data, ref, on_ack) {
        do_call(type, data, ref,
            function (msg, ref) {
                if (l_share_key && check_ret_is_need_relogin(msg)) {/* login again */
                    if (data && data.sess) {
                        data.sess.nid = create_nid_ex(0);
                    }
                    else if (data && data.Session) {
                        data.Session.Nid = create_nid_ex(0);
                    }
                    do_sign_x(s_cacs_login_req, l_srv, l_usr, null, l_pwd_md5_hex, ref,
                        function (msg2, ref) {
                            var ret = (msg2 && msg2.data) ? msg2.data.result : msg2;
                            if (ret) {/* error */
                                on_ack(msg2, ref);
                            }
                            else {
                                do_call(type, data, ref, on_ack);
                            }
                            ;
                        });
                } else if (msg != "timeout") {
                    on_ack(msg, ref);
                }
            });
    }

    function pwd_set(old_pass, new_pass, is_guest, ref, on_ack) {
        var old_pass = (old_pass && mmd5.hex(old_pass));
        var new_pass = (new_pass && mmd5.hex(new_pass));
        send_msg("cacs_passwd_req", {
                nid: create_nid(),
                old_pass: pwd_encrypt(old_pass),
                new_pass: pwd_encrypt(new_pass),
                guest: is_guest ? 1 : 0
            }, ref,
            function (msg, ref) {
                on_ack(msg, ref);
            });
    }

    function sign_out(ref, on_ack) {
        send_msg("cacs_logout_req", {nid: create_nid()}, ref,
            function (msg, ref) {
                on_ack(msg, ref);
            });
    }

    function binding_email(email, user, pass, lang, version, appid, name, ref, on_ack) {
        var json_buf = {app: {id: appid, name: name, ver: version}};
        var uctx = get_uctx(json_buf);
        send_msg("cacs_bind_req", {
            nid: create_nid(),
            email: email,
            user: user,
            pass: pwd_encrypt(pass),
            lang: lang,
            p: [{n: "uctx", v: uctx}]
        }, ref, function (msg, ref) {
            on_ack(msg, ref);
        });
    }

    function binding_email_get(user, appid, ref, on_ack) {
        if (ref.data == 1) {
            var secret_key = mdh.gen_private(), pub_key = mdh.gen_public(secret_key), json_buf = {app: {id: appid}};
            do_call("cacs_dh_req", {bnum_prime: mdh.prime, root_num: mdh.g, key_a2b: pub_key, tid: l_tid}, ref,
                function (msg, ref) {
                    var data = msg ? msg.data : null;
                    if ((!data) || data.result) {
                        on_ack(msg, ref);
                        return;
                    }
                    ;
                    l_tid = data.tid;
                    l_lid = data.lid;
                    l_share_key = mdh.gen_shared_secret(secret_key, data.key_b2a);

                    var uctx = get_uctx(json_buf);
                    send_msg("cacs_query_req", {
                        lid: l_lid,
                        nid: create_nid_ex(2),
                        user: user,
                        p: [{n: "uctx", v: uctx}]
                    }, ref, function (msg, ref) {
                        on_ack(msg, ref);
                    });
                });
        } else {
            var json_buf = {app: {id: appid}};
            var uctx = get_uctx(json_buf);
            send_msg("cacs_query_req", {
                nid: create_nid(),
                user: user,
                p: [{n: "uctx", v: uctx}]
            }, ref, function (msg, ref) {
                on_ack(msg, ref);
            });
        }
    }

    function recovery_binding_email(email, user, lang, appid, name, ref, on_ack) {
        var secret_key = mdh.gen_private(), pub_key = mdh.gen_public(secret_key),
            json_buf = {app: {id: appid, name: name}};
        ;
        do_call("cacs_dh_req", {bnum_prime: mdh.prime, root_num: mdh.g, key_a2b: pub_key, tid: l_tid}, ref,
            function (msg, ref) {
                var data = msg ? msg.data : null;
                if ((!data) || data.result) {
                    on_ack(msg, ref);
                    return;
                }
                ;
                l_tid = data.tid;
                l_lid = data.lid;
                l_share_key = mdh.gen_shared_secret(secret_key, data.key_b2a);

                var uctx = get_uctx(json_buf);
                send_msg("cacs_recovery_req", {
                    lid: l_lid,
                    nid: create_nid_ex(2),
                    email: email,
                    user: user,
                    lang: lang,
                    p: [{n: "uctx", v: uctx}]
                }, ref, function (msg, ref) {
                    on_ack(msg, ref);
                });
            });
    }

    function dev_msg_listener_add(ref, on_ack) {
        if (!create_mmq) {
            send_msg("mmq_create", {timeout: 30000}, ref,
                function (msg, ref) {
                    if (!msg.data.result) {
                        create_mmq = 1;
                        l_qid = msg.data.qid;
                        ccm_subscribe_req(ref, on_ack);
                    }
                    else {
                        //setTimeout(function() {dev_msg_listener_add (ref, on_ack);}, 3000);
                        return -1;
                    }
                });
        }
        else {
            mmq_pick_req(ref, on_ack);
        }

        function ccm_subscribe_req(ref, on_ack) {
            send_msg("ccm_subscribe", {sess: {nid: create_nid()}}, ref,
                function (msg2, ref) {
                    var result2 = (msg2.data && msg2.data.ret) ? msg2.data.ret.reason : null;
                    if (result2 == "") {
                        mmq_pick_req(ref, on_ack);
                    }
                    else {
                        //setTimeout(function() {ccm_subscribe_req (ref, on_ack);}, 3000);
                        return -1;
                    }
                });
        }

        function mmq_pick_req(ref, on_ack) {
            if (mmq_pick_time) {
                clearInterval(mmq_pick_time);
                mmq_pick_time = null;
            }
            send_msg("mmq_pick", {qid: l_qid, timeout: 300000}, ref,
                function (msg, ref) {
                    if (msg.type == "ccm_msg") {
                        on_ack({result: "", items: msg.data.items}, ref);
                        //mmq_pick_time2=setTimeout(function() {mmq_pick_req(ref, on_ack);}, 20000);
                        mmq_pick_req(ref, on_ack);//when the ccm_msg is finish, send mmq_pick to server at once
                    }
                    else if (msg.type == "mmq_pick_ack") {
                        create_mmq = 0;
                        mmq_pick_time3 = setTimeout(function () {
                            dev_msg_listener_add(ref, on_ack);
                        }, 3000);
                    }
                });
            mmq_pick_time = setInterval(function () {
                mmq_pick_req(ref, on_ack)
            }, 330000);
        }
    }

    function dev_msg_listener_del(ref, on_ack) {
        send_msg("mmq_destroy", {qid: l_qid}, ref,
            function (msg, ref) {
                if (msg.data.result == "") {
                    clearInterval(mmq_pick_time);
                    clearTimeout(mmq_pick_time2);
                    clearTimeout(mmq_pick_time3);
                }
                on_ack({result: msg.data.result}, ref);
            });
    }

    function bytes_align(str) {
        var val = [];
        for (var i = 0; i < str.length; i++) {
            val.push(str.charCodeAt(i).toString(16));
        }
        var get8bytes_num = parseInt(str.length / 8) + 1;
        var addbytes = 8 * get8bytes_num - str.length;
        var result = [];
        var trans_8bytes = "";
        var trans_val = "";
        for (var k = 0; k < addbytes; k++) {
            if (k == 0)
                trans_val = "0" + addbytes;
            else
                trans_val += "ff";

            if (trans_val.length == 8) {
                result.push("0x" + trans_val);
                trans_val = "";
            }
        }
        for (var j = 0; j < val.length; j++) {
            trans_val += val[j];
            if (trans_val.length == 8) {
                result.push("0x" + trans_val);
                trans_val = "";
            }
        }
        return result;
    }

    function str_2_16bytes(b) {
        if (!b) return;
        var len = b.length / 2, c = [];
        for (var i = 0; i < len; i++) {
            var a0 = b.charAt(2 * i);
            var a1 = b.charAt(2 * i + 1);
            var a2 = "0x" + a0 + a1;
            c.push(a2 & 0xff);
        }
        return c;
    }

    function cpns_get(srv, start, counts, user, appid, ref, on_ack) {
        var secret_key = mdh.gen_private(), pub_key = mdh.gen_public(secret_key);
        var share_key = mdh.gen_shared_secret(secret_key, "310105909413485164588026905566175959");

        var json_buf = {app: {id: appid}, user: user};
        json_buf = JSON.stringify(json_buf);
        var key = CryptoJS.MD5(share_key);
        //to do 8 byte alignment
        var json_bufs = bytes_align(json_buf);
        var bytes_len = 8 * (parseInt(json_buf.length / 8) + 1), str_len = bytes_len / 4;

        var json_obj = {sigBytes: bytes_len, words: json_bufs, length: str_len};
        var json_uctx = CryptoJS.DES.encrypt(json_obj, key, {
            iv: CryptoJS.enc.Hex.parse('0000000000000000'),
            padding: CryptoJS.pad.NoPadding
        }).ciphertext.toString();
        var b = str_2_16bytes(json_uctx);
        var urlProtocol = srv.substring(0, srv.indexOf(":"));

        var uctx = "data:application/octet-stream;base64," + mcodec.binary_2_b64(b);
        if (urlProtocol == "https")
            send_msg("cpns_get_req", {
                start: start,
                counts: counts,
                p: [{n: "uctx", v: uctx}, {n: "root", v: "5"}, {
                    n: "prime",
                    v: "791658605174853458830696113306796803"
                }, {n: "pubk", v: pub_key}, {n: "porto", v: "https"}]
            }, {remote_ip: srv}, function (msg, ref) {
                on_ack(msg, ref);
            });
        else
            send_msg("cpns_get_req", {
                start: start,
                counts: counts,
                p: [{n: "uctx", v: uctx}, {n: "root", v: "5"}, {
                    n: "prime",
                    v: "791658605174853458830696113306796803"
                }, {n: "pubk", v: pub_key}]
            }, {remote_ip: srv}, function (msg, ref) {
                on_ack(msg, ref);
            });
    }

    var _this = this;
    _this.qid = function () {
        return l_qid
    };
    _this.dev_msg_listener_add = dev_msg_listener_add;
    _this.dev_msg_listener_del = dev_msg_listener_del;
    _this.set_srv = set_srv;
    /* set_srv(srv) */
    _this.get_srv = get_srv;
    /* get_srv(srv) */
    _this.get_sharekey = get_share_key;
    _this.get_sid = get_sid;
    _this.pwd_encrypt = pwd_encrypt;
    /* pwd_encrypt(pwd_md5_hex) */
    _this.create_nid_ex = create_nid_ex;
    /* create_nid_ex(type) type:0 by sid, 2: by lid */
    _this.create_nid = create_nid;
    _this.sign_up = function (srv, usr, pwd, pwd_md5_hex, ref, on_ack) {
        do_sign_x(s_cacs_reg_req, srv, usr, pwd, pwd_md5_hex, ref, on_ack);
    };
    _this.sign_in = function (srv, usr, pwd, pwd_md5_hex, ref, on_ack) {
        do_sign_x(s_cacs_login_req, srv, usr, pwd, pwd_md5_hex, ref, on_ack);
    };
    _this.sign_out = sign_out;
    _this.pwd_set = pwd_set;
    _this.binding_email = binding_email;
    _this.recovery_binding_email = recovery_binding_email;
    _this.send_msg = send_msg;
    /* send_msg(type, data, ref, on_ack) */
    _this.cpns_get = cpns_get;
    _this.binding_email_get = binding_email_get;
}
