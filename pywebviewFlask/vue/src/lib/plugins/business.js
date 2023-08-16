/* eslint-disable */
var err_cacs_system = "accounts.system",
    err_cacs_user_existed_0 = "accounts.user.existed",
    err_cacs_user_existed_1 = "User existed",
    err_cacs_user_offline_0 = "accounts.user.offline",
    err_cacs_user_offline_1 = "Device Offline",
    err_cacs_user_unknown_0 = "accounts.user.unknown",
    err_cacs_user_unknown_1 = "Invalid user",
    err_cacs_pass_invalid_0 = "accounts.pass.invalid",
    err_cacs_pass_invalid_1 = "Invalid pass",
    err_cacs_lid_invalid_0 = "accounts.lid.invalid",
    err_cacs_lid_invalid_1 = "invalid lid",
    err_cacs_sid_invalid_0 = "accounts.sid.invalid",
    err_cacs_sid_invalid_1 = "invalid sid",
    err_cacs_nid_invalid_0 = "accounts.nid.invalid",
    err_cacs_nid_invalid_1 = "invalid nid";
function class_account_business(obj) {
    var str =
    {
        idle_lid_relate_str: "idle_lid_relate_info",
        remember_msg_str: "remember_msg_info",
        cacs_tid_str: "cacs_tid_info"
    };

    var me = this,
        parent_callback = obj.on_event,
        now_handle_info = { tid: 0, lid: 0, sid: 0, seq: 0, share_key: "", addr: "" },
        temp_password = null,
        system_signal_trans = new class_system_signal_trans(),
        auto_login = false,
        ready_login = false,
        login_use_local = false,
        InvalidSession = false,
        temporary_account, Duplicate_send_msg_ex,
        last_login = { date: "", hfrom_handle: "" };

    function deteformat(date) {
        year = date.getFullYear();
        year = year.toString().length < 2 ? "0" + year : year;
        month = date.getMonth() + 1;
        month = month.toString().length < 2 ? "0" + month : month;
        day = date.getDate();
        day = day.toString().length < 2 ? "0" + day : day;
        hour = date.getHours();
        hour = hour.toString().length < 2 ? "0" + hour : hour;
        minute = date.getMinutes();
        minute = minute.toString().length < 2 ? "0" + minute : minute;
        second = date.getSeconds();
        second = second.toString().length < 2 ? "0" + second : second;

        return year + "" + month + "" + day + "" + hour + "" + minute + "" + second;
    }
    function on_cacs_dh_ack(type, msg, ref) {
        if (msg.result == "") {
            var share_key = dh.gen_shared_secret(ref.secret_key, msg.key_b2a);
            local_storage.set(str.cacs_tid_str, msg.tid);

            set_storage_data({ str: str.idle_lid_relate_str, data: { lid: msg.lid, share_key: share_key } });
            now_handle_info.tid = msg.tid;
            now_handle_info.lid = msg.lid;
            now_handle_info.share_key = share_key;



            var md5password = md5_message_encrypt(temp_password);
            var remember_data = local_storage.get("remember_msg_info");
            if (remember_data) {
                remember_data = eval("(" + remember_data + ")");
                if (remember_data.pass == temp_password)
                    md5password = CryptoJS.enc.Hex.parse(remember_data.pass);
            }

            var password = des_md5_encrypt(md5password, share_key);
            temp_password = null;

            me.send_msg("cacs_login_req", { lid: msg.lid, nid: acs.create_nid_base_lid(acs.ctrl({ type: "get_info" })), user: ref.user, pass: password, session_req: 1, param: [{ name: "spv", value: "v1" }] },
                function (type, msg, ref) { on_cacs_login_ack(type, msg, ref); },
                { ip: ref.ip, user: ref.user, lid_relate: { lid: msg.lid, share_key: share_key }, pass: md5password.toString(), remember: ref.flag, to: "ccm" });
        }
        else {

        }
    }
    function on_cacs_register_dh_ack(type, msg, ref) {
        if (msg.result == "") {
            var share_key = dh.gen_shared_secret(ref.secret_key, msg.key_b2a);
            local_storage.set(str.cacs_tid_str, msg.tid);
            set_storage_data({ str: str.idle_lid_relate_str, data: { lid: msg.lid, share_key: share_key } });
            now_handle_info.tid = msg.tid;
            now_handle_info.lid = msg.lid;
            now_handle_info.share_key = share_key;

            var md5password = md5_message_encrypt(temp_password);
            var password = des_md5_encrypt(md5password, share_key);
            me.send_msg("cacs_reg_req", { lid: msg.lid, nid: acs.create_nid_base_lid(acs.ctrl({ type: "get_info" })), user: ref.user, pass: password, session_req: 1 },
                function (type, msg, ref) { on_cacs_reg_ack(type, msg, ref); }, { ip: ref.ip, to: "ccm", user: ref.user });
        }
        else {

        }
    }
    me.create_nid = function (obj) {
        ++obj.seq;
        var nid = codec.nid(obj.seq, obj.sid, obj.share_key, 0, null, null, md5_ex, "hex");
        return nid;
    }
    me.create_nid_base_lid = function (obj) {
        ++obj.seq;
        var nid = codec.nid(obj.seq, obj.lid, obj.share_key, 2, null, null, md5_ex, "hex");
        return nid;
    }
    function md5_message_encrypt(message) {
        return CryptoJS.MD5(message);
    }
    function des_md5_encrypt(md5_message, pass) {
        var key = CryptoJS.MD5(pass);
        var iv = CryptoJS.enc.Hex.parse('0000000000000000');
        var des = CryptoJS.DES.encrypt(md5_message, key, { iv: iv, padding: CryptoJS.pad.NoPadding }).ciphertext.toString();
        return des;
    }
    function get_storage_data(obj) {
        var data_str;
        data_str = local_storage.get(obj.str);
        if (undefined == data_str || 0 == data_str.length)
            return null;
        return meval(data_str);
    }
    function set_storage_data(obj) {
        var data_str = codec.obj_2_str(obj.data);
        local_storage.set(obj.str, data_str);
    }
    function cacs_reg_req(obj) {
        var idle_lid_relate_data;
        temp_password = obj.password;
        if ((null == now_handle_info.share_key) || ("" == now_handle_info.share_key)) {
            var secret_key = dh.gen_private();
            var pub_key = dh.gen_public(secret_key);
            me.send_msg("cacs_dh_req", { bnum_prime: dh.prime, root_num: dh.g, key_a2b: pub_key, tid: now_handle_info.tid },
                function (type, msg, ref) { on_cacs_register_dh_ack(type, msg, ref); },
                { ip: g_ref.server_device, to: "ccm", secret_key: secret_key, user: obj.user });
        }
        else {
            var md5password = md5_message_encrypt(obj.password);
            var password = des_md5_encrypt(md5password, now_handle_info.share_key);

            me.send_msg("cacs_reg_req", { lid: now_handle_info.lid, user: obj.user, pass: password },
                function (type, msg, ref) { on_cacs_reg_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm", user: obj.user });
        }
    }
    function on_cacs_reg_ack(type, msg, ref) {
        if (!msg.result) {
            parent_callback({ type: "mcs_successful_whether_login", user: ref.user, password: temp_password, flag: 0 });
            // system_pop_confirm_box({str:mcs_successful_whether_login,
            //     callback_func:function(obj){cacs_login_req({user:ref.user, password:temp_password, flag:0}); temp_password = null;}});
        }
        else {
            if (msg.result == err_cacs_user_existed_0 || msg.result == err_cacs_user_existed_1) {
                parent_callback({ type: "already_exists" });
            }
        }
        g_ref.register_waiting_flag = 1;
    }
    function on_cacs_dh_req(obj) {
        var secret_key = dh.gen_private();
        var pub_key = dh.gen_public(secret_key);
        me.send_msg("cacs_dh_req", { bnum_prime: dh.prime, root_num: dh.g, key_a2b: pub_key, tid: tid },
            function (type, msg, ref) { on_cacs_dh_ack(type, msg, ref); },
            { ip: g_ref.server_device, to: "ccm", secret_key: secret_key, obj: obj });
    }
    function cacs_login_req(obj) {
        var idle_lid_relate_data, tid = now_handle_info.tid || local_storage.get(str.cacs_tid_str) || 0;
        now_handle_info.tid = tid;

        temp_password = obj.password;

        if (((null == now_handle_info.share_key) || ("" == now_handle_info.share_key))
            && (idle_lid_relate_data = get_storage_data({ str: str.idle_lid_relate_str }))) {
            now_handle_info.lid = idle_lid_relate_data.lid;
            now_handle_info.share_key = idle_lid_relate_data.share_key;
        }

        if ((null == now_handle_info.share_key) || ("" == now_handle_info.share_key)) {
            var secret_key = dh.gen_private();
            var pub_key = dh.gen_public(secret_key);
            me.send_msg("cacs_dh_req", { bnum_prime: dh.prime, root_num: dh.g, key_a2b: pub_key, tid: tid },
                function (type, msg, ref) { on_cacs_dh_ack(type, msg, ref); },
                { ip: g_ref.server_device, to: "ccm", secret_key: secret_key, user: obj.user, flag: obj.flag });
        }
        else {
            var md5password = md5_message_encrypt(obj.password);
            var password = des_md5_encrypt(md5password, now_handle_info.share_key);
            if (login_use_local != "used")
                login_use_local = "use";
            me.send_msg("cacs_login_req", { lid: now_handle_info.lid, user: obj.user, pass: password, session_req: 1, param: [{ name: "spv", value: "v1" }] },
                function (type, msg, ref) { on_cacs_login_ack(type, msg, ref); },
                { ip: g_ref.server_device, user: obj.user, pass: md5password.toString(), lid_relate: { lid: now_handle_info.lid, share_key: now_handle_info.share_key }, remember: obj.flag, to: "ccm" });
        }
    }
    function on_cacs_login_ack(type, msg, ref) {
        if (msg.result == "") {
            g_ref.login_waiting_flag = 1;
            now_handle_info.sid = msg.sid;
            now_handle_info.seq = msg.seq;
            now_handle_info.addr = msg.addr;
            local_storage.set(str.idle_lid_relate_str, "");

            temporary_account = { user: ref.user, pass: ref.pass, lid: ref.lid_relate.lid, share_key: ref.lid_relate.share_key };
            if (ref.remember) {
                set_storage_data({ str: str.remember_msg_str, data: { user: ref.user, pass: ref.pass, lid: ref.lid_relate.lid, share_key: ref.lid_relate.share_key } });
            }
            var reg = /^\d/;
            if (reg.exec(ref.user))
                g_ref.login_status = "ipc";
            else
                g_ref.login_status = "register_user";
            ready_login = true;
            ms.ctrl({ type: "ccm_get_device", data: { ip: ref.ip } });
        }
        else {
            if (login_use_local == "use") {
                login_use_local = "used";
                var secret_key = dh.gen_private();
                var pub_key = dh.gen_public(secret_key);
                me.send_msg("cacs_dh_req", { bnum_prime: dh.prime, root_num: dh.g, key_a2b: pub_key, tid: local_storage.get(str.cacs_tid_str) || 0 },
                    function (type, msg, ref) { on_cacs_dh_ack(type, msg, ref); },
                    { ip: g_ref.server_device, to: "ccm", secret_key: secret_key, user: ref.user, flag: ref.flag });
            }
            else if (msg.result == err_cacs_user_offline_0 || msg.result == err_cacs_user_offline_1) {

                parent_callback({ type: "mcs_offline" });

                g_ref.login_waiting_flag = 1;
                return -1;
            }
            else if (msg.result == err_cacs_user_unknown_0 || msg.result == err_cacs_user_unknown_1) {
                parent_callback({ type: "mcs_username_does_not_exis" });

                g_ref.login_waiting_flag = 1;
                return -1;
            }
            else if (msg.result == err_cacs_pass_invalid_0 || msg.result == err_cacs_pass_invalid_1) {
                parent_callback({ type: "mcs_invalid_password" });
                g_ref.login_waiting_flag = 1;
                return -1;
            }
        }
    }
    function on_cacs_new_dh_req(obj) {
        tid = now_handle_info.tid;
        var secret_key = dh.gen_private();
        var pub_key = dh.gen_public(secret_key);
        me.send_msg("cacs_dh_req", { bnum_prime: dh.prime, root_num: dh.g, key_a2b: pub_key, tid: tid },
            function (type, msg, ref) { on_cacs_new_dh_ack(type, msg, ref); },
            { ip: g_ref.server_device, to: "ccm", secret_key: secret_key, user: obj.user, pass: obj.pass });
    }
    function on_cacs_new_dh_ack(type, msg, ref) {
        if (msg.result == "") {
            var share_key = dh.gen_shared_secret(ref.secret_key, msg.key_b2a);
            local_storage.set(str.cacs_tid_str, msg.tid);

            set_storage_data({ str: str.idle_lid_relate_str, data: { lid: msg.lid, share_key: share_key } });
            now_handle_info.tid = msg.tid;
            now_handle_info.lid = msg.lid;
            now_handle_info.share_key = share_key;

            var md5password = CryptoJS.enc.Hex.parse(ref.pass)
            var password = des_md5_encrypt(md5password, share_key);


            me.send_msg("cacs_login_req", { lid: msg.lid, nid: acs.create_nid_base_lid(acs.ctrl({ type: "get_info" })), user: ref.user, pass: password, session_req: 1, param: [{ name: "spv", value: "v1" }] },
                function (type, msg, ref) { on_cacs_new_login_ack(type, msg, ref); },
                { ip: ref.ip, user: ref.user, lid_relate: { lid: msg.lid, share_key: share_key }, pass: ref.pass, to: "ccm" });
        }
        else {

        }
    }
    function on_cacs_new_login_ack(type, msg, ref) {
        if (msg.result == "") {

            g_ref.login_waiting_flag = 1;
            now_handle_info.sid = msg.sid;
            now_handle_info.seq = msg.seq;
            now_handle_info.addr = msg.addr;
            ms.ctrl({ type: "re_login" });
            return;
        }
        else {
            parent_callback({ type: "mcs_connection_is_interrupted" });
        }
    }
    function Duplicate_send_msg(obj) {
        if (Duplicate_send_msg_ex.ref) {
            Duplicate_send_msg_ex.ref.Repeat = true;
        }
        else {
            Duplicate_send_msg_ex.ref = { Repeat: true };
        }
        if (Duplicate_send_msg_ex.send_msg) {
            var data = Duplicate_send_msg_ex.data;

            if (Duplicate_send_msg_ex.data && Duplicate_send_msg_ex.data.sess) {
                data = { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })) } };
            } else if (Duplicate_send_msg_ex.data && Duplicate_send_msg_ex.data.nid) {
                data = { nid: acs.create_nid(acs.ctrl({ type: "get_info" })) };
            }

            me.send_msg(Duplicate_send_msg_ex.type, data, Duplicate_send_msg_ex.on_ack, Duplicate_send_msg_ex.ref);
        }
        else {
            me.send_msg_ex(Duplicate_send_msg_ex.sn, Duplicate_send_msg_ex.type, Duplicate_send_msg_ex.data, Duplicate_send_msg_ex.on_ack, Duplicate_send_msg_ex.ref);
        }
    }
    function on_cacs_logout_ack(type, msg, ref) {
        if (msg.result == "") {
            var remember_data = get_storage_data({ str: str.remember_msg_str });
            local_storage.set(str.remember_msg_str, "");
        }
        else {

        }
        ms.ctrl({ type: "create_login_interface", data: { type: ref.type, sn: ref.sn } });
    }
    function cacs_passwd_req(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.now_server_sn;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in cacs_passwd_req.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }

        acs.send_msg("cacs_passwd_req", {
            nid: acs.create_nid(acs.ctrl({ type: "get_info" })),
            old_pass: me.ctrl({ type: "md5_pass", data: { pass: obj.old_pass } }),
            new_pass: me.ctrl({ type: "md5_pass", data: { pass: obj.pass } }), guest: obj.guest ? 1 : 0
        },

            function (type, msg, ref) { cacs_passwd_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", sn: node_sn, guest: obj.guest ? 1 : 0 });
    }
    function cacs_passwd_ack(type, msg, ref) {
        parent_callback({ type: "cacs_passwd_ack", data: { type: type, msg: msg, ref: ref } });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "begin":
                {
                    var remember_data = get_storage_data({ str: str.remember_msg_str });
                    if (remember_data) {
                        var reg = /^\d/;
                        if (reg.exec(remember_data.user))
                            g_ref.login_status = "ipc";
                        else
                            g_ref.login_status = "register_user";
                        now_handle_info.lid = remember_data.lid;
                        now_handle_info.share_key = remember_data.share_key;
                        parent_callback({ type: "ready" });
                        now_handle_info.share_key = null;

                    }
                    else {
                        parent_callback({ type: "ready" });
                    }
                    break;
                }
            case "get_info":
                {
                    return now_handle_info;
                }
            case "register":
                {
                    cacs_reg_req(obj.data);
                    return;
                }
            case "login":
                {
                    cacs_login_req(obj.data);
                    break;
                }
            case "logout":
                {
                    me.send_msg("cacs_logout_req", { nid: acs.create_nid(acs.ctrl({ type: "get_info" })) },
                        function (type, msg, ref) { on_cacs_logout_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm", type: obj.data.type, sn: obj.data.sn });
                    break;
                }
            case "md5_pass":
                {
                    return des_md5_encrypt(md5_message_encrypt(obj.data.pass), now_handle_info.share_key);
                }
            case "ready_login":
                {
                    return auto_login || ready_login;
                }
            case "cacs_passwd_req":
                {
                    cacs_passwd_req(obj.data);
                    break;
                }
            case "Duplicate_send_msg":
                {
                    Duplicate_send_msg();
                    break;
                }
            default:

        }
    }
    me.send_msg = function (type, data, on_ack, ref) {
        if (type != "mmq_pick")
            system_signal_trans.create(type);
        rpc.call({
            srv: "http://" + ref.ip + "/", to: ref.to, type: type, data: data, ref: ref, "static": false, way: "json", qid: (ref.qid == null) ? null : ref.qid,
            on_ack: function (msg, ref) {
                if (type != "mmq_pick")
                    system_signal_trans.destroy(type);

                if (msg && msg.data && msg.data.ret && msg.data.ret.sub && type != "mmq_pick") {
                    if (msg.data.ret.reason == "InvalidSession" || msg.data.ret.sub == "accounts.sid.invalid" || msg.data.ret.sub == "accounts.nid.invalid" || msg.data.ret.sub == "accounts.lid.invalid" || msg.data.ret.sub == "ccms.session.invalid") {
                        if (msg.from_handle < last_login.hfrom_handle) {
                            if (data.sess) {
                                data.sess = { id: me.create_nid(now_handle_info) };
                            }
                            if (data.nid) {
                                data.nid = me.create_nid(now_handle_info);
                            }
                            acs.send_msg(type, data, on_ack, ref);
                        }
                        else if ((deteformat(new Date()) - last_login.date) > 5) {
                            if (type != "cacs_login_req" && type != "cacs_dh_req" && type != "mmq_pick") {
                                Duplicate_send_msg_ex = { type: type, data: data, on_ack: on_ack, ref: ref, send_msg: 1 };
                            }
                            ms.ctrl({ type: "mmq_destroy" });
                            setTimeout(function () { on_cacs_new_dh_req(temporary_account); }, 1000);
                        }
                        else if ((deteformat(new Date()) - last_login.date) < 5) {
                            parent_callback({ type: "mcs_connection_is_interrupted" });
                        }

                    }
                    if (msg.data.ret.sub == "permission.denied") {
                        parent_callback({ type: "permission_denied" });
                    }
                }
                if (msg && msg.data && msg.data.result == "permission.denied") {
                    parent_callback({ type: "permission_denied" });
                }
                if ("object" == typeof (msg)) {
                    if (type == "cacs_login_req") {
                        last_login.date = deteformat(new Date());
                        last_login.handle = msg.from_handle;
                    }
                    if (0 == system_exception_handling(msg.type, msg.data))
                        on_ack(msg.type, msg.data, ref);
                }
                else if ("cancel" != msg) {
                    if (0 == system_exception_handling(msg.type, msg.data))
                        on_ack(msg, msg, ref);
                }
            }
        });
    }
    var dd = 1;
    me.send_msg_ex = function (sn, type, data, on_ack, ref) {
        var node, node_sn, pnode, pnode_sn;


        node_sn = sn;
        node = g_ref.device_list_obj["sn_" + sn];
        if (!node) {

            return -1;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }

        data["sess"] = { nid: me.create_nid(now_handle_info), sn: node_sn };


        system_signal_trans.create(type);

        rpc.call({
            srv: "http://" + pnode.ip + "/", to: "ccm", type: type, data: data, ref: ref, "static": false, way: "json", qid: null,
            on_ack: function (msg, ref) {
                system_signal_trans.destroy(type);
                if (msg && msg.data && msg.data.ret && msg.data.ret.sub) {
                    if (msg.data.ret.reason == "InvalidSession" || msg.data.ret.sub == "accounts.sid.invalid" || msg.data.ret.sub == "accounts.nid.invalid" || msg.data.ret.sub == "accounts.lid.invalid" || msg.data.ret.sub == "ccms.session.invalid") {
                        if (msg.from_handle < last_login.hfrom_handle) {
                            acs.send_msg(type, data, on_ack, ref);
                        }
                        else if ((deteformat(new Date()) - last_login.date) > 5) {
                            if (type != "cacs_login_req" && type != "cacs_dh_req") {
                                Duplicate_send_msg_ex = { sn: sn, type: type, data: data, on_ack: on_ack, ref: ref, send_msg: 0 };
                            }
                            ms.ctrl({ type: "mmq_destroy" });
                            setTimeout(function () { on_cacs_new_dh_req(temporary_account); }, 1000);
                        }
                        else if ((deteformat(new Date()) - last_login.date) < 5) {
                            parent_callback({ type: "mcs_connection_is_interrupted" });

                        }

                    }
                    if (msg.data.ret.sub == "permission.denied") {
                        parent_callback({ type: "permission_denied" });
                    }

                }
                if (msg && msg.data && msg.data.result == "permission.denied") {
                    parent_callback({ type: "permission_denied" });
                }
                if ("object" == typeof (msg)) {
                    if (0 == system_exception_handling(msg.type, msg.data))
                        on_ack(msg.type, msg.data, ref);
                }
                else if ("cancel" != msg) {
                    if (0 == system_exception_handling(msg.type, msg.data))
                        on_ack(msg, msg, ref);
                }
            }
        });
    }
}
function class_Business_devices(obj) {
    var me = this,
        parent_callback = obj.on_event,
        device_SerialNumber, device_Nick, device_Type, device_ip,
        qid, me_qid, notif_count = 0, create_mmq = true, mmq_pick_time, re_login = false;


    function ccm_info_get_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            var data_str;
            if (acs.ctrl({ type: "ready_login" })) {
                var name;
                if (msg.type == "MS") {
                    g_ref.service_options = msg.type;
                    device_SerialNumber = msg.sn;
                    device_Nick = msg.nick;
                    device_Type = msg.type;
                    device_ip = ref.ip;
                    acs.send_msg("mmq_create", { timeout: 30000 },
                        function (type, msg, ref) { mmq_create_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm" });
                    if (g_ref.login_status == "register_user")
                        g_ref.now_server_sn = msg.sn;
                }
                else if (msg.type == "IPC") {
                    g_ref.network_environ = "private";
                    Version = "";
                    g_ref.service_options = msg.type;
                    g_ref.view_split_count = g_ref.playback_split_count = 1;
                    name = msg.nick || msg.sn;
                    g_ref.device_list_link.add("sn_" + msg.sn);

                    if (msg.ver != "") {
                        if (msg.ver >= "13.09.14.12.30") {
                            Version = version_Category.guest_version;
                        }
                        else if (msg.ver >= "13.05.20.17.57") {
                            Version = version_Category.Schedule_recording;
                        }
                        else if (msg.ver >= "13.05.09.17.57") {
                            Version = version_Category.Version_recording;
                        }
                        else if (msg.ver > "13.04.01.01.35") {
                            Version = version_Category.Info_version
                        } else if (msg.ver <= "13.04.01.01.35" && msg.ver > "13.01.01.01.35") {
                            Version = version_Category.Snapshot_version;
                        } else {
                            Version = version_Category.Basic_version;
                        }
                    }
                    else {
                        Version = version_Category.Basic_version;
                    }

                    g_ref.device_list_obj["sn_" + msg.sn] = {
                        name: name, Version: Version, type: msg.type, ip: ref.ip, isParent: true,
                        state: { online: "Online", view: 0, recording: 0, call: 0, playback: 0 }
                    };

                    acs.send_msg("mmq_create", { timeout: 30000 },
                        function (type, msg, ref) { mmq_create_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm" });
                    parent_callback({ type: "main_page_create", data: { type: msg.type, sn: msg.sn } });
                }
            }
            else {
                parent_callback({ type: "login_page_create", data: { type: msg.type, sn: msg.sn } });

            }
        }
        else {

            return -1
        }
    }
    function ccm_get_sub_devices_request(obj) {
        if (g_ref.service_options != "IPC") {
            acs.send_msg("ccm_devs_get", {
                sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: device_SerialNumber },
                start: 0, counts: 128
            },
                function (type, msg, ref) { ccm_devs_get_ack(type, msg, ref); },
                { ip: device_ip, sn: device_SerialNumber, nick: device_Nick, type: device_Type, to: "ccm", Refresh: obj.Refresh ? obj.Refresh : 0 });
        }
    }
    function ccm_devs_get_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            var i, length, name, devices;
            if (ref.Refresh) {
                g_ref.device_list_link.empty();
                g_ref.device_list_obj = {};
            }
            if (msg.total == 1) {
                g_ref.view_split_count = g_ref.playback_split_count = 1;
            }
            name = ref.nick || ref.sn;
            g_ref.device_list_obj["sn_" + ref.sn] = {
                name: name, type: "MS", ip: ref.ip, isParent: true,
                state: { online: "Online", view: 0, recording: 0, call: 0, playback: 0 }
            };
            devices = msg.devs;
            if (devices) {
                length = devices.length;
                for (i = 0; i < length; ++i) {
                    name = devices[i].nick || devices[i].sn;
                    Version = "";

                    if (devices[i].stat === "Online")
                        g_ref.device_list_link.add("sn_" + devices[i].sn);
                    else if (devices[i].stat === "InvalidAuth")
                        g_ref.device_list_link.add("sn_" + devices[i].sn);
                    else if (devices[i].stat === "Offline")
                        g_ref.device_list_link.add("sn_" + devices[i].sn);

                    if (devices[i].img_ver != "") {
                        if (devices[i].img_ver >= "13.09.14.12.30") {
                            Version = version_Category.guest_version;
                        }
                        else if (devices[i].img_ver >= "13.05.20.17.57") {
                            Version = version_Category.Schedule_recording;
                        }
                        else if (devices[i].img_ver >= "13.05.09.17.57") {
                            Version = version_Category.Version_recording;
                        }
                        else if (devices[i].img_ver > "13.04.01.01.35") {
                            Version = version_Category.Info_version
                        } else if (devices[i].img_ver <= "13.04.01.01.35" && devices[i].img_ver > "13.01.01.01.35") {
                            Version = version_Category.Snapshot_version;
                        } else {
                            Version = version_Category.Basic_version;
                        }
                    }
                    else {
                        Version = version_Category.Basic_version;
                    }

                    g_ref.device_list_obj["sn_" + devices[i].sn] = {
                        name: name, Version: Version, type: devices[i].type, ip: devices[i].addr, isParent: false, parent_sn: ref.sn,
                        state: { online: devices[i].stat, view: 0, recording: 0, call: 0, playback: 0 }
                    };
                }
            }
            else {

            }
            if (!ref.Refresh) {
                parent_callback({ type: "main_page_create", data: { type: ref.type, sn: ref.sn } });
            } else {
                parent_callback({ type: "refresh_device_list", data: 1, sn: ref.sn });
            }
            if (re_login) {
                re_login = false;
                acs.ctrl({ type: "Duplicate_send_msg" });
            }

        }
        else {

            return -1;
        }
    }
    function mmq_create_ack(type, msg, ref) {

        if (!msg.result) {
            me_qid = msg.qid;
            acs.send_msg("ccm_subscribe", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })) } },
                function (type, msg, ref) { ccm_subscribe_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm", qid: me_qid, Refresh: ref.Refresh ? ref.Refresh : 0 });
        }
        else {
            return -1;
        }
    }
    function ccm_subscribe_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (create_mmq) {
                ccm_get_sub_devices_request({ Refresh: ref.Refresh ? ref.Refresh : 0 });
            }
            mmq_pick_req();
        }
        else {
            return -1;
        }
    }
    function mmq_pick_req(obj) {
        if (mmq_pick_time) {
            clearInterval(mmq_pick_time);
            mmq_pick_time = null;
        }
        acs.send_msg("mmq_pick", { qid: me_qid, timeout: 300000 },
            function (type, msg, ref) { mmq_pick_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm", qid: me_qid });
        mmq_pick_time = setInterval(function () { mmq_pick_req() }, 330000);
    }
    function mmq_pick_ack(type, msg, ref) {

        if (msg && msg.result == "err.mmq.pick.duplicate") {
            return -1;
        }
        if (type == "mmq_pick_ack") {
            if (msg.result) {
                create_mmq = false;
                setTimeout(function () {
                    acs.send_msg("mmq_create", { timeout: 30000 },
                        function (type, msg, ref) { mmq_create_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm" });
                }, 3000);
                return -1;
            }
        }
        else if (type == "ccm_msg") {
            var i, length = msg.items.length, old_count = notif_count;
            for (i = 0; i < length; ++i) {
                if (msg.items && msg.items[i].msg_id) {
                    parent_callback({ type: "refresh_notif_latest", data: { now_item: msg.items[length - 1], sn: msg.items[i].msg_id } });
                }
                if (msg.items[i].type == "device" && msg.items[i].code == "info") {
                    for (j = 0; j < msg.items[i].p.length; j++) {
                        var device_list_obj;
                        if (g_ref.device_list_obj["sn_" + msg.items[i].sn.toLowerCase()])
                            device_list_obj = g_ref.device_list_obj["sn_" + msg.items[i].sn.toLowerCase()];
                        else if (g_ref.device_list_obj["sn_" + msg.items[i].sn.toUpperCase()])
                            device_list_obj = g_ref.device_list_obj["sn_" + msg.items[i].sn.toUpperCase()];

                        if (msg.items[i].p[j].n == "status" && msg.items[i].p[j].v == "Online") {
                            g_ref.device_list_link.add("sn_" + msg.items[i].sn);
                            device_list_obj.state.online = "Online";
                        }
                        else if (msg.items[i].p[j].n == "status" && msg.items[i].p[j].v == "Offline") {
                            g_ref.device_list_link.add("sn_" + msg.items[i].sn);
                            device_list_obj.state.online = "Offline";
                        }
                        else if (msg.items[i].p[j].n == "status" && msg.items[i].p[j].v == "InvalidAuth") {
                            if (!device_list_obj) return;
                            device_list_obj.state.online = "InvalidAuth";
                        }
                        else if (msg.items[i].p[j].n == "nick" && device_list_obj) {
                            var new_nick = msg.items[i].p[j].v || msg.items[i].sn.toLowerCase();

                            device_list_obj.name = new_nick;

                        }
                        else if (msg.items[i].p[j].n == "firmware_version" && device_list_obj) {
                            Version = version_Category.Basic_version;
                            if (msg.items[i].p[j].v != "") {
                                if (msg.items[i].p[j].v >= "13.09.14.12.30") {
                                    Version = version_Category.guest_version;
                                }
                                else if (msg.items[i].p[j].v >= "13.05.20.17.57") {
                                    Version = version_Category.Schedule_recording;
                                }
                                else if (msg.items[i].p[j].v > "13.05.09.17.57") {
                                    Version = version_Category.Version_recording;
                                }
                                else if (msg.items[i].p[j].v > "13.04.01.01.35") {
                                    Version = version_Category.Info_version;
                                } else if (msg.items[i].p[j].v <= "13.04.01.01.35" && msg.items[i].p[j].v > "13.01.01.01.35") {
                                    Version = version_Category.Snapshot_version;
                                } else {
                                    Version = version_Category.Basic_version;
                                }
                            }
                            device_list_obj.Version = Version;
                        }
                    }

                    parent_callback({ type: "refresh_device_list", data: 1, sn: msg.items[i].sn });

                }
                else if (msg.items[i].type == "nick") {
                    for (j = 0; j < msg.items[i].p.length; j++) {
                        if (msg.items[i].p[j].n == "nick") {
                            var new_nick = msg.items[i].p[j].v || msg.items[i].sn.toLowerCase();

                            if (g_ref.device_list_obj["sn_" + msg.items[i].sn.toLowerCase()])
                                g_ref.device_list_obj["sn_" + msg.items[i].sn.toLowerCase()].name = new_nick;
                            else if (g_ref.device_list_obj["sn_" + msg.items[i].sn.toUpperCase()])
                                g_ref.device_list_obj["sn_" + msg.items[i].sn.toUpperCase()].name = new_nick;
                        }
                    }
                    parent_callback({ type: "refresh_device_list", data: 1, sn: msg.items[i].sn });
                }
                else if (msg.items[i].msg_id != 0) {
                    if (determine_the_version({ type: "Anti", version: version_Category.Snapshot_version })) {
                        return;
                    }

                    if (msg.items[i].p) {
                        for (j = 0; j < msg.items[i].p.length; j++) {

                            if (msg.items[i].p[j].n == "content") {
                                var objs = eval("(" + msg.items[i].p[j].v + ")");
                                if (objs.Extension) {
                                    imagings = { type: "update_imaging", Brightness_value: "", Contrast_value: "", ColorSaturation_value: "", Sharpness_value: "" };
                                    imagings.Brightness_value = objs.Extension.Imaging.Brightness;
                                    imagings.Contrast_value = objs.Extension.Imaging.Contrast;
                                    imagings.ColorSaturation_value = objs.Extension.Imaging.ColorSaturation;
                                    imagings.Sharpness_value = objs.Extension.Imaging.Sharpness;
                                    parent_callback(imagings);
                                }
                                return;
                            }
                        }
                    }
                    var msgs = new Object();
                    msgs.items = msg.items[i];
                    msg.items[i].display = 0;
                    //is not a good habit
                    notif_count = 0;
                    if (!g_ref.notif_info["sn_" + msg.items[i].sn]) {
                        g_ref.notif_info["sn_" + msg.items[i].sn] = createLinkList();
                    }
                    g_ref.notif_info["sn_" + msg.items[i].sn].add(msgs);
                    if (msg.items[i].sn == g_ref.select_device_ipc && g_ref.now_page == "alarm")
                        parent_callback({ type: "refresh_alarm", data: { item: msgs } });
                    else {
                        if (old_count < 99 && !mx("#alarm_search_content_tb" + msg.items[i].msg_id)) {
                            for (var i in g_ref.notif_info) {
                                if (g_ref.notif_info.hasOwnProperty(i)) {
                                    ++notif_count;
                                }
                            }
                        }
                        else
                            notif_count = old_count;
                    }
                }

            }
            if (notif_count != old_count) {
                //  parent_callback({type:"refresh_notif",data:{notif_count:notif_count,sn:msg.sess?msg.sess.sn:null}});
            }
        }
        mmq_pick_req();

    }
    function mmq_destroy_ack(type, msg, ref) {

        if (msg.result == "") {
            clearInterval(mmq_pick_time);
        }

    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_get_device":
                {

                    acs.send_msg("ccm_info_get", {}, function (type, msg, ref) { ccm_info_get_ack(type, msg, ref); }, { ip: obj.data.ip, to: "ccm" });
                    break;
                }
            case "Refresh_devs":
                {
                    ccm_get_sub_devices_request({ Refresh: 1 });
                    break;
                }
            case "mmq_destroy":
                {
                    acs.send_msg("mmq_destroy", { qid: me_qid },
                        function (type, msg, ref) { mmq_destroy_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm", qid: me_qid });
                    break;
                }
            case "re_login":
                {
                    re_login = true;
                    create_mmq = true;
                    acs.send_msg("mmq_create", { timeout: 30000 },
                        function (type, msg, ref) { mmq_create_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm", Refresh: 3 });
                    break;
                }
            case "ccm_get_sub_dvices":
                {
                    ccm_get_sub_devices_request({});
                    break;
                }
            default:
            // me.ctrl not obj.type is class_Business_login

        }
    }
}
function class_device_list_business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_dev_add_ack(type, msg, ref) {
        parent_callback({ type: "ccm_dev_add_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_dev_del_ack(type, msg, ref) {
        parent_callback({ type: "ccm_dev_del_ack", data: { type: type, msg: msg, ref: ref } });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_dev_add":
                {
                    acs.send_msg_ex(g_ref.now_server_sn, "ccm_dev_add",
                        { sn: obj.sn, pwd: acs.ctrl({ type: "md5_pass", data: { pass: obj.pass } }) },
                        function (type, msg, ref) { ccm_dev_add_ack(type, msg, ref); }, { sn: g_ref.now_server_sn, pass_length: obj.pass.length });
                    break;
                }
            case "ccm_dev_del":
                {
                    acs.send_msg_ex(obj.sn, "ccm_dev_del", { sn: obj.sn },
                        function (type, msg, ref) { ccm_dev_del_ack(type, msg, ref); }, { sn: obj.sn });
                    break;
                }
        }
    }
}
function class_home_business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        video_sources_token = "";

    function create_ipc(obj) {
        if (!obj.node_sn) return;
        if (!g_ref.view_link.add(obj.node_sn)) {
            var pos = g_ref.view_link.pos(obj.node_sn) + 1,
                inner_window_info, page_state;

            if (g_ref.view_link.length >= (g_ref.view_split_count * g_ref.view_pages))
                ++g_ref.view_pages;
            var trow = mx("/tr", mx("#now_page_state"))[0];
            var tcol = trow.insertCell(-1);
            if (pos <= (g_ref.view_split_count * g_ref.now_view_page)) {
                inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: pos - g_ref.view_split_count * (g_ref.now_view_page - 1) } });

                parent_callback({ type: "add_home_ipc", data: { inner_window_info: inner_window_info, node_sn: obj.node_sn } });

            }
            g_ref.device_list_obj["sn_" + obj.node_sn].state.view = 1;
            if (g_ref.now_view_page == Math.ceil(pos / g_ref.view_split_count)) {
                parent_callback({ type: "adjust_play_button_state", data: { play_state: "play" } });

            }
        }
    }
    function delete_ipc(obj) {
        if (g_ref.view_link.del(obj.node_sn)) {
            var pos = g_ref.view_link.pos(obj.node_sn),
                trol, page_state;

            if (trol = mx("/tr", mx("#now_page_state"))[0]) {
                trol.deleteCell(pos);
            }
            if (obj.type != "refresh") g_ref.device_list_obj["sn_" + obj.node_sn].state.view = 0;
            parent_callback({ type: "adjust_play_button_state", data: { play_state: "stop" } });
            if (g_ref.view_pages > 1 && g_ref.view_link.length <= (g_ref.view_split_count * (g_ref.view_pages - 1))) {
                --g_ref.view_pages;
                if (g_ref.view_link.length && g_ref.view_link.length == (g_ref.view_split_count * (g_ref.now_view_page - 1)))                   //the last page is empty
                {
                    --g_ref.now_view_page;
                    if (g_ref.view_page_redraw)
                        g_ref.view_page_redraw();
                }
            }

            var i = 0, in_pos, count_pos,
                temp_pos = pos - g_ref.view_split_count * g_ref.now_view_page,
                list_obj = g_ref.view_link.get_first(),
                trow, inner_window_info;

            if (temp_pos < 0) {
                in_pos = 0;
                count_pos = g_ref.view_split_count * (g_ref.now_view_page - 1);
            }
            else if (temp_pos > g_ref.view_split_count) {
                in_pos = g_ref.view_split_count;
                count_pos = 0;
            }
            else {
                in_pos = temp_pos;
                count_pos = pos;
                if (list_obj == null)                //the last remaining
                {
                    inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: in_pos + 1 } });
                    parent_callback({ type: "remove_ipc", data: { inner_window_info: inner_window_info } });
                    return;
                }
            }

            while (i++ < count_pos)
                list_obj = list_obj.next;
            if (list_obj == null)                    //the one that at the end of
            {
                g_ref.select_inner_ipc = "";
            }
            else
                g_ref.select_inner_ipc = list_obj.data;
            for (; in_pos < g_ref.view_split_count && in_pos < g_ref.view_link.length - g_ref.view_split_count * (g_ref.now_view_page - 1); ++in_pos) {
                inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: in_pos + 1 } });
                parent_callback({ type: "remove_ipc", data: { inner_window_info: inner_window_info } });
                parent_callback({ type: "add_home_ipc", data: { inner_window_info: inner_window_info, node_sn: list_obj.data } });
                pos = g_ref.view_link.pos(list_obj.data);
                if (trow = mx("/tr", mx("#now_page_state"))[0]) {
                    // page_state = dom_create_child(tcol, "div");
                    //  background_img_set(page_state, sub_img_page_state0);
                }
                list_obj = list_obj.next;
            }
            if (in_pos < g_ref.view_split_count) {
                inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: in_pos + 1 } });
                parent_callback({ type: "remove_ipc", data: { inner_window_info: inner_window_info } });
                parent_callback({ type: "snapshot", data: 1 });
            }
        }
    }
    function split_screen(obj) {
        if (g_ref.split_update)
            g_ref.split_update({ count: obj.count });
    }
    function ccm_video_srcs_get_ack(type, msg, ref) {

        var imaging;
        if (msg && msg.ret && msg.ret.code == "") {
            if (msg.vss) {
                if (msg.vss[0].extension && msg.vss[0].extension.conf) {
                    if (imaging) {
                        obj_merge(imaging, msg.vss[0].extension.conf);
                    }
                    else {
                        imaging = msg.vss[0].extension.conf;
                    }
                    video_sources_token = msg.vss[0].token;
                }
                else {
                    imaging = null;

                    return -1;
                }
            }
            else {
                imaging = null;

                return -1;
            }
        }
        else {
            imaging = null;

            return -1;
        }
        parent_callback({ type: "ccm_video_srcs_get_ack", data: { imaging: imaging } });
    }
    function ccm_img_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {

        }
        else {
            //log("error:SetImagingSettingsResponse return Result error in class_home_cntr.");
            return -1;
        }
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "create_ipc":
                {
                    create_ipc(obj.data);
                    break;
                }

            case "delete_ipc":
                {
                    delete_ipc(obj.data);
                    break;
                }
            case "ccm_img_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_img_set", { token: video_sources_token, conf: obj.conf },
                        function (type, msg, ref) { ccm_img_set_ack(type, msg, ref); });
                    break;
                }

            case "ccm_video_srcs_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_video_srcs_get", {}, function (type, msg, ref) { ccm_video_srcs_get_ack(type, msg, ref); });
                    break;
                }
        }
    }
}
function class_playback_business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        get_event_count = -10;
    function create_ipc(obj) {
        if (!g_ref.playback_link.add(obj.node_sn)) {
            var pos = g_ref.playback_link.pos(obj.node_sn) + 1, inner_window_info;

            if (g_ref.playback_link.length <= (g_ref.playback_split_count * g_ref.now_playback_page)) {
                inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: g_ref.playback_link.length - g_ref.playback_split_count * (g_ref.now_playback_page - 1) } });
                parent_callback({ type: "add_playback_ipc", data: { inner_window_info: inner_window_info, node_sn: obj.node_sn } });
            }
            g_ref.device_list_obj["sn_" + obj.node_sn].state.playback = 1;
            if (g_ref.playback_link.length >= (g_ref.playback_split_count * g_ref.playback_pages))
                ++g_ref.playback_pages;

        }
    }
    function delete_ipc(obj) {
        if (g_ref.playback_link.del(obj.node_sn)) {


            var pos = g_ref.playback_link.pos(obj.node_sn),
                trol, page_state;

            if (trol = mx("/tr", mx("#now_page_state"))[0]) {
                trol.deleteCell(pos);
            }
            if (obj.type != "refresh") g_ref.device_list_obj["sn_" + obj.node_sn].state.playback = 0;
            parent_callback({ type: "adjust_play_button_state", data: { play_state: "pause" } });

            if (g_ref.view_pages > 1 && g_ref.view_link.length <= (g_ref.view_split_count * (g_ref.view_pages - 1))) {
                --g_ref.view_pages;
                if (g_ref.view_link.length && g_ref.view_link.length == (g_ref.view_split_count * (g_ref.now_view_page - 1)))                   //the last page is empty
                {
                    --g_ref.now_view_page;
                    if (g_ref.view_page_redraw)
                        g_ref.view_page_redraw();
                }
            }

            var i = 0, in_pos, count_pos,
                temp_pos = pos - g_ref.playback_split_count * g_ref.now_playback_page,
                list_obj = g_ref.playback_link.get_first(), inner_window_info;

            if (temp_pos < 0) {
                in_pos = 0;
                count_pos = g_ref.playback_split_count * (g_ref.now_playback_page - 1);
            }
            else if (temp_pos > g_ref.playback_split_count) {
                in_pos = g_ref.playback_split_count;
                count_pos = 0;
            }
            else {
                in_pos = temp_pos;
                count_pos = pos;
                if (list_obj == null)                //the last remaining
                {
                    parent_callback({ type: "get_inner_window_info", data: { index: in_pos + 1 } });
                    parent_callback({ type: "remove_ipc", data: { inner_window_info: inner_window_info } });
                    return;
                }
            }

            while (i++ < count_pos)
                list_obj = list_obj.next;
            if (list_obj == null)                    //the one that at the end of
            {
                g_ref.select_inner_ipc = "";
            }
            else
                g_ref.select_inner_ipc = list_obj.data;
            for (; in_pos < g_ref.playback_split_count && in_pos < g_ref.playback_link.length - g_ref.playback_split_count * (g_ref.now_playback_page - 1); ++in_pos) {
                inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: in_pos + 1 } });
                parent_callback({ type: "remove_ipc", data: { inner_window_info: inner_window_info } });
                parent_callback({ type: "add_playback_ipc", data: { inner_window_info: inner_window_info, node_sn: lis_obj.data } });
                list_obj = list_obj.next;
            }
            if (in_pos < g_ref.playback_split_count) {
                inner_window_info = parent_callback({ type: "get_inner_window_info", data: { index: in_pos + 1 } });
                parent_callback({ type: "remove_ipc", data: { inner_window_info: inner_window_info } });
            }
        }
    }
    function get_current_date(obj) {
        var i, length = 0, begin_event, end_event, pos,
            offset_millisecond, offset_date,
            between_millisecond = (search_end_date - search_begin_date);

        if (undefined !== obj.date) {
            offset_date = obj.date;
            if (event_array)
                length = event_array.length;
            for (i = 0; i < length; ++i) {
                if (offset_date < event_array[i].date) {
                    if (event_array[i].type == "end") {
                        return {
                            state: "normal", offset_date: offset_date,
                            offset_value: Math.round(playback_slider_max_range * (offset_date - search_begin_date) / between_millisecond)
                        };
                    }
                    else if (event_array[i].type == "begin") {
                        offset_date = event_array[i].date;
                        return {
                            state: "jump", offset_date: offset_date,
                            offset_value: Math.round(playback_slider_max_range * (offset_date - search_begin_date) / between_millisecond)
                        };
                    }
                }
            }
            //Not in any event in front of That is the last event behind the event
            if (event_array[length - 1].type == "begin") {
                return {
                    offset_date: offset_date,
                    offset_value: Math.round(playback_slider_max_range * (offset_date - search_begin_date) / between_millisecond)
                };
            }
            else {
                return { offset_date: 0, offset_value: 0 };
            }
        }
        else if (undefined !== obj.value) {
            pos = obj.value / playback_slider_max_range;
            offset_millisecond = Math.round(between_millisecond * pos);
            offset_date = search_begin_date + offset_millisecond;
            if (event_array && event_array.length)
                length = event_array.length;
            else return { offset_date: 0, offset_value: 0 };
            for (i = 0; i < length; ++i) {
                if (offset_date < event_array[i].date) {
                    if (event_array[i].type == "end") {
                        return { state: "normal", offset_date: offset_date, offset_value: obj.value };
                    }
                    else if (event_array[i].type == "begin") {
                        offset_date = event_array[i].date;
                        return {
                            state: "jump", offset_date: offset_date,
                            offset_value: Math.round(playback_slider_max_range * (offset_date - search_begin_date) / between_millisecond)
                        };
                    }
                }
            }

            if (event_array[length - 1].type == "begin") {
                return { offset_date: offset_date, offset_value: obj.value };
            }
            else {
                return { offset_date: 0, offset_value: 0 };
            }
        }
    }
    function ccm_message_search(obj) {
        var node, node_sn, pnode, pnode_sn;

        parent_callback({ type: "remove_playback_slider_block" });

        event_array = new Array();

        node_sn = obj.inner_window_info ? obj.inner_window_info.node_sn : g_ref.select_device_ipc;
        if (node_sn == "none") {
            obj.inner_window_info = null;
            node_sn = g_ref.select_device_ipc;
        }
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {

            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }

        obj.start_point = obj.start_point ? Date.parse(obj.start_point) / 1000 : "";
        obj.end_point = obj.end_point ? Date.parse(obj.end_point) / 1000 : "";

        acs.send_msg("ccm_msg_get", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, flag: 0,
            start_time: obj.start_point, end_time: obj.end_point, filter: "record", start: (obj.search_time ? obj.search_time : 0X7fffffff), counts: get_event_count
        },
            function (type, msg, ref) { ccm_msg_get_ack(type, msg, ref); },
            { ip: pnode.ip, to: "ccm", sn: node_sn, psn: pnode_sn, start_point: obj.start_point, end_point: obj.end_point, inner_window_info: obj.inner_window_info || null });
    }
    function ccm_msg_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_msg_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "create_ipc":
                {
                    create_ipc(obj.data);
                    break;
                }
            case "delete_ipc":
                {
                    delete_ipc(obj.data);
                    break;
                }
            case "get_current_date":
                {
                    return get_current_date(obj.data);
                }
            case "ccm_message_search":
                {
                    ccm_message_search(obj.data);
                    break;
                }
        }

    }
}
function class_view_page_business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        RecordingToken,
        window_array_info;
    function get_profiles_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = obj.inner_window_info.node_sn;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        ccm_profiles_get({ ip: pnode.ip, to: "ccm", sn: node_sn, inner_window_info: obj.inner_window_info })

    }
    function ccm_profiles_get(obj) {
        var i, pos = -1;
        obj.inner_window_info.profile_token = local_storage.get("PlayProfile");
        if (!obj.inner_window_info.profile_token) {
            if (g_ref.network_environ == "private") {
                obj.inner_window_info.profile_token = "p0";
                pos = 0;
            }
            else if (g_ref.network_environ == "public") {
                obj.inner_window_info.profile_token = "p1";
                pos = 1;
            }
        }
        else {
            for (i = 0; i < 4; ++i) {
                if (obj.inner_window_info.profile_token == ("p" + i)) {

                    obj.inner_window_info.profile_token = "p" + i;
                    pos = i;
                }
            }
            if (pos < 0) {
                if (g_ref.network_environ == "private") {
                    obj.inner_window_info.profile_token = "p0";
                    pos = 0;
                }
                else if (g_ref.network_environ == "public") {
                    obj.inner_window_info.profile_token = "p1";
                    pos = 1;
                }

            }
        }
        ccm_media_get_request({ type: "video", inner_window_info: obj.inner_window_info });
    }
    function ccm_media_get_request(obj) {
        var proto = "auto";
        if (obj.type == "video")
            parent_callback({ type: "create_mme", data: { inner_window_info: obj.inner_window_info, protocol: "auto", page: g_ref.now_page } });
        else if (obj.type == "audio") {
            if ("" == "flash") {
                proto = "rtmp"
            }
            else {
                if (proto == "auto")
                    proto = "rtdp";
            }
            ccm_get_audio_output_stream_uri_request({ inner_window_info: obj.inner_window_info, protocol: proto });
        }

    }
    function get_stream_uri_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = obj.inner_window_info.node_sn;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (node && node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_play", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            setup: { stream: "RTP_Unicast", trans: { proto: obj.protocol } }, token: obj.inner_window_info.profile_token
        },
            function (type, msg, ref) { ccm_play_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", inner_window_info: obj.inner_window_info });
    }
    function ccm_get_audio_output_stream_uri_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = obj.inner_window_info.node_sn;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_talk", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            setup: { stream: "RTP_Unicast", trans: { proto: obj.protocol } }, token: obj.inner_window_info.profile_token
        },
            function (type, msg, ref) { ccm_talk_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", inner_window_info: obj.inner_window_info });
    }
    function ccm_talk_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            g_ref.audio_output_uri = msg.uri.url;
            chl_audio_create({ type: "publish", uri: msg.uri.url, inner_window_info: ref.inner_window_info });
        }
        else {
            //log("error:CcmGetAudioOutputStreamUriResponse return Result error in class_view_page.");
            return -1;
        }
    }
    function ccm_play_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            g_ref.video_stream_uri = msg.uri.url;
            parent_callback({ type: "chl_video_create", data: { type: "play", uri: msg.uri.url, inner_window_info: ref.inner_window_info } });
        }
        else {

            return -1;
        }
    }
    function get_replay_uri_request(obj) {

        var node, node_sn, pnode, pnode_sn;

        node_sn = obj.inner_window_info.node_sn;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_replay", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            setup: { stream: "RTP_Unicast", trans: { proto: obj.protocol } }, token: RecordingToken
        },
            function (type, msg, ref) { ccm_replay_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", inner_window_info: obj.inner_window_info });
    }
    function get_snapshot_uri_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        //node_sn = obj.inner_window.node_sn;
        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {

            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        profile_token = local_storage.get("SnapshotProfile_" + node_sn);
        if (!profile_token) {
            if (obj.inner_window.profile_token)
                profile_token = obj.inner_window.profile_token;
            else {
                obj.inner_window.video_resolution_w = 1280;
                obj.inner_window.video_resolution_h = 720;
                acs.send_msg("ccm_snapshot", {
                    sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
                    token: "p0"
                },
                    function (type, msg, ref) { ccm_snapshot_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", inner_window: obj.inner_window });
                return;
            }
        }
        acs.send_msg("ccm_snapshot", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            token: profile_token
        },
            function (type, msg, ref) { ccm_snapshot_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", inner_window: obj.inner_window });
    }
    function ccm_snapshot_ack(type, msg, ref) {
        var urls = "http://" + g_ref.server_device + "/ccm/ccm_pic_get.jpg?hfrom_handle=887330&dsess=1&dsess_nid=" + acs.create_nid(acs.ctrl({ type: "get_info" })) + "&dsess_sn=" + g_ref.select_device_ipc + "&dtoken=" + msg.token;

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "create_snapshot_preview_div", data: { resolution_w: 640, resolution_h: 360, uri: urls } });
        }
        else {
            //  log("error:GetSnapshotUriResponse return Result error in class_view_page.");
            return -1;
        }
    }

    function ccm_replay_ack(type, msg, ref) {
        // console.log('进入ccm_replay_ack函数')
        // console.log(msg,"msg")
        // console.log(ref,"ref")
        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "chl_video_create", data: { type: "playback", uri: msg.url, inner_window_info: ref.inner_window_info } });
        }
        else {
            //log("error:GetReplayUriResponse return Result error in class_view_page.");
            return -1;
        }
    }
    function relative_move_request(obj) {
        var node, node_sn, pnode, pnode_sn, pos, str, inner_window_info;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn.toLowerCase()];
        if (!node)
            node = g_ref.device_list_obj["sn_" + node_sn.toUpperCase()];
        if (!node) {
            //  log("Please select the specific device in relative_move_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        pos = g_ref.device_list_link.pos("sn_" + node_sn);
        str = mx(".device_list_li_span")[pos].getAttribute("window_id");
        if (str) {
            inner_window_info = window_array_info["inner_window" + str.substr(str.length - 1, 1)]
        }
        acs.send_msg("ccm_ptz_ctl", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, token: inner_window_info.ptz_token,
            trans: {
                pan_tilt: { x: obj.data.pantilt.x, y: obj.data.pantilt.y, space: obj.data.pantilt.space },
                _deprecated_zoom: { x: obj.data.zoom.x, space: obj.data.zoom.space }
            },
            speed: {
                pan_tilt: { x: obj.data.speed.pantilt.x, y: obj.data.speed.pantilt.y, space: obj.data.speed.pantilt.space },
                _deprecated_zoom: { x: obj.data.speed.zoom.x, space: obj.data.speed.zoom.space }
            }
        },
            function (type, msg, ref) { ccm_ptz_ctl_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", mark: obj.data.mark ? obj.data.mark : null });
    }
    function ccm_ptz_ctl_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (ref.mark)
                ref.mark.flag = "ready";
        }
        else {
            //log("error:RelativeMoveResponse return Result error in class_view_page.");
            return -1;
        }
    }
    function chl_audio_create(obj) {
        var uri = obj.uri, chl_params = "";
        obj.inner_window_info.audio_chls = obj.inner_window_info.mme.chl_create({
            params: ("{src:[{url:'mic://0',type:'audio'}], dst:[{url:'" + uri + "'}]" + (("" != chl_params) ? "," : "") + chl_params + "}")
        });
        if (obj.inner_window_info.audio_chls !== null) {
        }
    }



    me.ctrl = function (obj) {
        switch (obj.type) {
            case "RecordingToken":
                {
                    RecordingToken = obj.data;
                    break;
                }
            case "get_profiles_request":
                {
                    get_profiles_request(obj.data);
                    break;
                }
            case "get_stream_uri_request":
                {
                    get_stream_uri_request(obj.data);
                    break;
                }
            case "get_replay_uri_request":
                {
                    get_replay_uri_request(obj.data);
                    break;
                }
            case "get_snapshot_uri_request":
                {
                    get_snapshot_uri_request(obj.data);
                    break;
                }
            case "relative_move_request":
                {
                    window_array_info = obj.window_array_info;
                    relative_move_request(obj.data);

                    break;
                }
            case "ccm_media_get_request":
                {
                    ccm_media_get_request(obj.data);
                    break;
                }
        }
    }
}
function class_home_control_business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        recording_status = 1;


    function ccm_set_recording_task_config_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in ccm_set_recording_task_config_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_record_task_set", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            task: obj
        },
            function (type, msg, ref) { ccm_record_task_set_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_record_task_get_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (ref.type == "create") {
                if (msg.task.sch.enable && msg.task.sch.full_time) {
                    parent_callback({ type: "adjust_recording_button_state", data: "recording" });
                }
                else {
                    parent_callback({ type: "adjust_recording_button_state", data: "normal" });
                    //  adjust_recording_button_state({recording_state:"normal"});
                }
            }
            else if (ref.type == "recording" && msg.sd_ready == 1) {

                if (determine_the_version({ type: "Positive", version: version_Category.Version_recording })) {
                    parent_callback({ type: "recordset_Interval", data: msg });

                }
                else {
                    if (msg.task.sch.enable && msg.task.sch.full_time) {
                        msg.task.sch.enable = 0;
                        msg.task.sch.full_time = 0;
                        g_ref.device_list_obj["sn_" + ref.sn].state.recording = 0;
                        //  adjust_recording_button_state({recording_state:"normal"});
                        parent_callback({ type: "adjust_recording_button_state", data: "normal" });
                    }
                    else {
                        msg.task.sch.enable = 1;
                        msg.task.sch.full_time = 1;
                        g_ref.device_list_obj["sn_" + ref.sn].state.recording = 1;
                        //adjust_recording_button_state({recording_state:"recording"}); 
                        parent_callback({ type: "adjust_recording_button_state", data: "recording" });
                    }
                    ccm_set_recording_task_config_request(msg.task);
                }
            }
            else if (ref.type == "setup") {
                create_control_recording_setup({ task_config: msg.task });
            }
            else if (msg.sd_ready == 0) {
                g_ref.system_prompt_box(mcs_sdcard_not_ready, -10, -200);
            }
        }
        else {
            return -1;
        }
    }

    function ccm_record_task_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {

        }
        else if (msg && msg.ret && msg.ret.code == "SdIsNotReady") {
            // adjust_recording_button_state({recording_state:"normal"});
            parent_callback({ type: "adjust_recording_button_state", data: "normal" });
            return -1;
        }
        else {
            parent_callback({ type: "adjust_recording_button_state", data: "normal" });
        }
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_record_task_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_record_task_get", {},
                        function (type, msg, ref) { ccm_record_task_get_ack(type, msg, ref); }, { type: obj.data, sn: g_ref.select_device_ipc });
                    break;
                }
            case "set_recording_task":
                {
                    ccm_set_recording_task_config_request(obj.data);
                    break;
                }

        }
    }
}
function class_alarm_page_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;
    function ccm_msg_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_msg_get_ack", data: { type: type, msg: msg, ref: ref } });
    }

    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_message_search":
                {
                    acs.send_msg("ccm_msg_get", {
                        sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: obj.sn },
                        flag: obj.flag, start_time: obj.start_time, end_time: obj.end_time, filter: obj.filter, start: obj.start, counts: obj.counts
                    },
                        function (type, msg, ref) { ccm_msg_get_ack(type, msg, ref); }, { ip: obj.pnode.ip, to: "ccm", sn: obj.node_sn, psn: obj.pnode_sn });
                    break;
                }
        }
    }
}
function options_product_info_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;


    function ccm_dev_info_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_dev_info_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccms_get_ipc_config_ack(type, msg, ref) {
        parent_callback({ type: "ccms_get_ipc_config_ack", data: { type: type, msg: msg, ref: ref } });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_dev_info_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_dev_info_get", {}, function (type, msg, ref) { ccm_dev_info_get_ack(type, msg, ref); });
                    break;
                }
            case "ccms_get_ipc_config_req":
                {
                    acs.send_msg("ccms_get_ipc_config_req", { Session: { Nid: acs.create_nid(acs.ctrl({ type: "get_info" })), SerialNumber: g_ref.select_device_ipc } },
                        function (type, msg, ref) { ccms_get_ipc_config_ack(type, msg, ref); }, { ip: g_ref.server_device, to: "ccm" });
                    break;
                }
        }
    }
}
function options_device_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;


    function ccm_nick_set_ack(type, msg, ref) {
        parent_callback({ type: "ccm_nick_set_ack", data: { type: type, msg: msg, ref: ref } });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_nick_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_nick_set", { nick: obj.data }, function (type, msg, ref) { ccm_nick_set_ack(type, msg, ref); });
                    break;
                }
        }
    }
}
function options_password_page_Business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        temp_password;


    function ccm_pwd_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {

            if (g_ref.login_status == "register_user") {
                acs.send_msg_ex(g_ref.now_server_sn, "ccm_dev_add",
                    { sn: g_ref.select_device_ipc, pwd: acs.ctrl({ type: "md5_pass", data: { pass: temp_password } }) },
                    function (type, msg, ref) { ccm_dev_add_ack(type, msg, ref); }, { sn: g_ref.now_server_sn });

            }
            else {
                parent_callback({ type: "mcs_set_successfully" });
            }
            temp_password = "";
        }
        else if (msg && msg.ret && msg.ret.code == "accounts.pass.invalid") {
            parent_callback({ type: "accounts_pass_invalid" });
        }
        else {
            //log("error:SetUserResponse return Result error in class_options_device.");
            return -1;
        }
    }
    function ccm_dev_add_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "refresh_device", data: { info: msg.info, sn: ref.sn } });
        }
        else {
            //log("error:CcmAddSubDeviceResponse return Result error in class_options_device.");
            return -1;
        }
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_pwd_set":
                {
                    temp_password = obj.data.pwd;
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_pwd_set", {
                        user: [{
                            username: obj.data.username,
                            old_pwd: acs.ctrl({ type: "md5_pass", data: { pass: obj.data.old_pwd } }),
                            pwd: acs.ctrl({ type: "md5_pass", data: { pass: obj.data.pwd } }), level: ""
                        }]
                    },
                        function (type, msg, ref) { ccm_pwd_set_ack(type, msg, ref); });
                    break;
                }
        }
    }
}
function options_guest_password_Business(obj) {

    var me = this,
        parent_callback = obj.on_event;
    function ccm_pwd_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });
        }
        else if (msg && msg.ret && msg.ret.code == "accounts.pass.invalid") {
            parent_callback({ type: "accounts_pass_invalid" });
        }
        else {

            return -1;
        }
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_pwd_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_pwd_set", {
                        user: [{
                            username: obj.username,
                            old_pwd: acs.ctrl({ type: "md5_pass", data: { pass: obj.old } }),
                            pwd: acs.ctrl({ type: "md5_pass", data: { pass: obj.pwd } }), level: "", guest: 1
                        }]
                    },
                        function (type, msg, ref) { ccm_pwd_set_ack(type, msg, ref); });
                    break;
                }
        }
    }
}
function options_network_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;


    function get_network_interfaces_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in get_network_interfaces_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("GetNetworkInterfacesRequest", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { get_network_interfaces_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm", select: obj.select });
    }
    function get_network_interfaces_response(type, msg, ref) {
        parent_callback({ type: "get_network_interfaces_response", data: { type: type, msg: msg, ref: ref } });
    }
    function set_network_interfaces_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in set_network_interfaces_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        set_network_interfaces_response_ok = 0;
        acs.send_msg("SetNetworkInterfacesRequest", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            InterfaceToken: obj.InterfaceToken, NetworkInterface: obj.NetworkInterface
        },
            function (type, msg, ref) { set_network_interfaces_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm", sn: node_sn, psn: pnode_sn, ip_refresh: obj.ip_refresh, select: obj.select });
    }
    function set_network_interfaces_response(type, msg, ref) {
        parent_callback({ type: "set_network_interfaces_response", data: { type: type, msg: msg, ref: ref } });
    }
    function get_network_default_gateway_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in get_network_default_gateway_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("GetNetworkDefaultGatewayRequest", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            token: network_token
        },
            function (type, msg, ref) { get_network_default_gateway_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function get_network_default_gateway_response(type, msg, ref) {
        parent_callback({ type: "get_network_default_gateway_response", data: { type: type, msg: msg, ref: ref } });
    }
    function get_device_info_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //  log("Please select the specific device in get_device_info_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_dev_info_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_dev_info_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_dev_info_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_dev_info_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function set_network_default_gateway_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in set_network_default_gateway_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        set_network_default_gateway_response_ok = 0;
        acs.send_msg("SetNetworkDefaultGatewayRequest", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            token: obj.token, NetworkGateway: obj.NetworkGateway
        },
            function (type, msg, ref) { set_network_default_gateway_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function set_network_default_gateway_response(type, msg, ref) {
        parent_callback({ type: "set_network_default_gateway_response", data: { type: type, msg: msg, ref: ref } });
    }
    function get_dns_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in get_dns_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("GetDNSRequest", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { get_dns_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function get_dns_response(type, msg, ref) {
        parent_callback({ type: "get_dns_response", data: { type: type, msg: msg, ref: ref } });
    }
    function set_dns_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in set_dns_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        set_dns_response_ok = 0;
        acs.send_msg("SetDNSRequest", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            FramDHCP: obj.FromDHCP, DNSManual: obj.DNSManual
        },
            function (type, msg, ref) { set_dns_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_get_wifi_list_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in ccm_get_wifi_list_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("CcmGetWifiListRequest", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_get_wifi_list_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_get_wifi_list_response(type, msg, ref) {
        parent_callback({ type: "ccm_get_wifi_list_response", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_connect_wifi_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in ccm_connect_wifi_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("CcmConnectWifiRequest", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            info: obj.info
        },
            function (type, msg, ref) { ccm_connect_wifi_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_connect_wifi_response(type, msg, ref) {
        parent_callback({ type: "ccm_connect_wifi_response", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_get_wifi_conn_status_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in ccm_get_wifi_conn_status_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("CcmGetWifiConnStatusRequest", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_get_wifi_conn_status_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_get_wifi_conn_status_response(type, msg, ref) {
        parent_callback({ type: "ccm_get_wifi_conn_status_response", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_get_wifi_configuration_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in ccm_get_wifi_configuration_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("CcmGetWifiConfigurationRequest", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_get_wifi_configuration_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm", net_itfs: obj.net_itfs });
    }
    function ccm_get_wifi_configuration_response(type, msg, ref) {
        parent_callback({ type: "ccm_get_wifi_configuration_response", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_set_wifi_configuration_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in ccm_set_wifi_configuration_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        set_wifi_config_response_ok = 0;
        acs.send_msg("CcmSetWifiConfigurationRequest", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, conf: obj.conf },
            function (type, msg, ref) { ccm_set_wifi_configuration_response(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_set_wifi_configuration_response(type, msg, ref) {
        parent_callback({ type: "ccm_set_wifi_configuration_response", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_get_network_info_request(filter) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in ccm_get_network_info_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        set_wifi_config_response_ok = 0;
        acs.send_msg("ccm_net_get", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            tokens: ["eth0", "ra0"], items: [filter, filter], force_scan: filter == "all" ? 0 : 1
        },
            function (type, msg, ref) {
                if (filter == "all")
                    ccm_net_get_ack(type, msg, ref);
                else
                    ccm_get_wifi_client_info_response(type, msg, ref);
            }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_net_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_net_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_get_wifi_client_info_response(type, msg, ref) {
        parent_callback({ type: "ccm_get_wifi_client_info_response", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_net_set_ack(type, msg, ref) {
        parent_callback({ type: "ccm_net_set_ack", data: { type: type, msg: msg, ref: ref } });
    }

    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_get_network_info_request":
                {
                    ccm_get_network_info_request(obj.data);
                    break;
                }
            case "get_network_interfaces_request":
                {
                    get_network_interfaces_request(obj.data);
                    break;
                }
            case "get_device_info_request":
                {
                    get_device_info_request();
                    break;
                }
            case "get_network_default_gateway_request":
                {
                    get_network_default_gateway_request();
                    break;
                }
            case "set_network_default_gateway_request":
                {
                    set_network_default_gateway_request(obj.data);
                    break;
                }
            case "get_dns_request":
                {
                    get_dns_request();
                    break;
                }
            case "set_dns_request":
                {
                    set_dns_request(obj.data);
                    break;
                }
            case "ccm_get_wifi_list_request":
                {
                    ccm_get_wifi_list_request();
                    break;
                }
            case "ccm_connect_wifi_request":
                {
                    ccm_connect_wifi_request(obj.data);
                    break;
                }
            case "ccm_get_wifi_conn_status_request":
                {
                    ccm_get_wifi_conn_status_request();
                    break;
                }
            case "ccm_get_wifi_configuration_request":
                {
                    ccm_get_wifi_configuration_request(obj.data);
                    break;
                }
            case "ccm_set_wifi_configuration_request":
                {
                    ccm_set_wifi_configuration_request(obj.data);
                    break;
                }
            case "cacs_check_nid_req":
                {
                    acs.send_msg("cacs_check_nid_req", { nid: acs.create_nid(acs.ctrl({ type: "get_info" })) },
                        function (type, msg, ref) { on_cacs_check_nid_ack(type, msg, ref); }, { sn: obj.sn, ip: obj.ip, to: "ccm" });
                    break;
                }
            case "ccm_net_get":
                {
                    acs.send_msg("ccm_net_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: g_ref.select_device_ipc } },
                        function (type, msg, ref) { ccm_net_get_ack(type, msg, ref); }, { ip: obj.ip, to: "ccm", select: obj.select });
                    break;
                }
            case "ccm_net_set":
                {
                    acs.send_msg("ccm_net_set", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: obj.sn }, info: obj.info },
                        function (type, msg, ref) { ccm_net_set_ack(type, msg, ref); }, { ip: obj.ip, to: "ccm", sn: obj.sn, ip_refresh: obj.ip_refresh, select: obj.select });
                    break;
                }
            case "set_network_interfaces_request":
                {
                    set_network_interfaces_request(obj.data);
                    break;
                }
        }
    }
}
function options_OSD_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_osd_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_osd_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_osd_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });
        }
        else {
            return -1;
        }
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_osd_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_osd_get", {}, function (type, msg, ref) { ccm_osd_get_ack(type, msg, ref); });
                    break;
                }
            case "ccm_osd_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_osd_set", { osd: obj.data }, function (type, msg, ref) { ccm_osd_set_ack(type, msg, ref); });
                    break;
                }
        }
    }
}
function options_SD_card_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_disk_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_disk_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_disk_ctl_ack(type, msg, ref) {
        if (msg && msg.ret && msg.ret.code == "") {

            if (ref.crtlType == "format" || ref.crtlType == "repair") {
                system_pop_confirm_box({
                    str: mcs_need_to_restart_the_camera_to_take_effect, button_left: mcs_reset_now, button_right: mcs_reset_later,
                    callback_func: function (obj) { system_reboot_request(); }
                });
            }
            else {
                parent_callback({ type: "mcs_set_successfully" });
                setTimeout(function () {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_disk_get", {}, function (type, msg, ref) { ccm_disk_get_ack(type, msg, ref); });
                }, 100);
            }
        }
        else {
            //log("error:ccm_DiskCtrlResponse return Result error in class_options_SD_card.");
        }
    }
    function system_reboot_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        if (g_ref.device_list_obj["sn_" + node_sn.toUpperCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toUpperCase()];
        else if (g_ref.device_list_obj["sn_" + node_sn.toLowerCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toLowerCase()];
        if (!node) {
            //log("Please select the specific device in system_reboot_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_reboot", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_reboot_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", sn: node_sn, psn: pnode_sn });
    }
    function ccm_reboot_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });
        }
        else {

            return -1;
        }
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_disk_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_disk_get", {}, function (type, msg, ref) { ccm_disk_get_ack(type, msg, ref); });
                    break;
                }
            case "system_reboot_request":
                {
                    system_reboot_request();
                    break;
                }
            case "ccm_disk_ctl_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_disk_ctl", { token: "sd", conf: obj.data }, function (type, msg, ref) { ccm_disk_ctl_ack(type, msg, ref); }, { crtlType: "conf" });
                    break;
                }
            case "ccm_disk_ctl":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_disk_ctl", { token: "sd", type: obj.data }, function (type, msg, ref) { ccm_disk_ctl_ack(type, msg, ref); }, { crtlType: obj.data });
                    break;
                }
        }
    }
}
function options_alarm_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_alert_dev_set_ack(type, msg, ref) {
        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });
        }
        else {
            return -1;
        }
    }
    function ccm_alert_dev_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_alert_dev_get_ack", data: { type: type, msg: msg, ref: ref } })
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_alert_dev_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_alert_dev_set", { conf: obj.data },
                        function (type, msg, ref) { ccm_alert_dev_set_ack(type, msg, ref); });
                    break;
                }
            case "ccm_alert_dev_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_alert_dev_get", {}, function (type, msg, ref) { ccm_alert_dev_get_ack(type, msg, ref); });
                    break;
                }
        }

    }
}
function options_alarm_linkage_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_alert_action_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_alert_action_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_alert_action_set_ack(type, msg, ref) {
        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });
            acs.send_msg_ex(g_ref.select_device_ipc, "ccm_alert_action_get", {}, function (type, msg, ref) { ccm_alert_action_get_ack(type, msg, ref); });
        }
    }

    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_alert_action_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_alert_action_get", {}, function (type, msg, ref) { ccm_alert_action_get_ack(type, msg, ref); });
                    break;
                }
            case "ccm_alert_action_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_alert_action_set", obj.data,
                        function (type, msg, ref) { ccm_alert_action_set_ack(type, msg, ref); });
                    break;
                }
        }
    }
}

function options_record_setting_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_record_task_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_record_task_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_record_task_set_ack(type, msg, ref) {
        parent_callback({ type: "ccm_record_task_set_ack", data: { type: type, msg: msg, ref: ref } });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_record_task_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_record_task_get", {},
                        function (type, msg, ref) { ccm_record_task_get_ack(type, msg, ref); }, { type: "setup", sn: g_ref.select_device_ipc });
                    break;
                }
            case "ccm_record_task_set":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_record_task_set", obj.data,
                        function (type, msg, ref) { ccm_record_task_set_ack(type, msg, ref); }, { type: "setup", sn: g_ref.select_device_ipc });
                    break;
                }

        }
    }
}
function options_time_date_Business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        set_system_date_time_response_ok = 0,
        set_ntp_response_ok = 0
        ;
    function get_system_date_time_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in get_system_date_time_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_date_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_date_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function get_ntp_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in get_ntp_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_ntp_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_ntp_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_ntp_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_ntp_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_date_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_date_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function set_ntp_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];

        if (!node) {
            //log("Please select the specific device in set_ntp_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_ntp_set", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, auto_sync: obj.auto_sync, dhcp: obj.dhcp, manual: obj.manual },
            function (type, msg, ref) { ccm_ntp_set_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_date_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (ref.type == "setup") {
            }
            else if (ref.type == "update") {
                get_system_date_time_request();
                get_ntp_request();
            }
            set_system_date_time_response_ok = 1;
            if (set_ntp_response_ok)
                parent_callback({ type: "mcs_set_successfully" });
        }
        else {

            return -1;
        }
    }
    function ccm_ntp_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            set_ntp_response_ok = 1;
            if (set_system_date_time_response_ok)
                parent_callback({ type: "mcs_set_successfully" });
        }
        else {

            return -1;
        }
    }
    function ccm_date_set(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in set_system_date_time_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_date_set", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, type: obj.data.type, daylight_savings: 0, timezone: obj.data.timezone, utc_date: obj.data.utc_date },
            function (type, msg, ref) { ccm_date_set_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", type: obj.type });
    }
    me.ctrl = function (obj) {
        switch (obj.type) {
            case "get_system_date_time_request":
                {
                    get_system_date_time_request();
                    break;
                }
            case "get_ntp_request":
                {
                    get_ntp_request();
                    break;
                }
            case "set_ntp_request":
                {
                    set_ntp_request(obj.data);
                    break;
                }
            case "ccm_date_set":
                {
                    ccm_date_set(obj);//acs.send_msg_ex("ccm_date_set", obj.data,
                    //function(type, msg, ref){ccm_date_set_ack(type, msg, ref);}, {ip:pnode.ip, to:"ccm", type:obj.type});
                    break;
                }
        }
    }
}

function options_system_maintenance_Business(obj) {
    var me = this,
        parent_callback = obj.on_event;

    function ccm_active_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });
        }
        else {
            return -1;
        }
    }
    function ccm_upgrade_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        if (g_ref.device_list_obj["sn_" + node_sn.toUpperCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toUpperCase()];
        else if (g_ref.device_list_obj["sn_" + node_sn.toLowerCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toLowerCase()];
        if (!node) {
            //log("Please select the specific device in ccm_upgrade_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_upgrade", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, img_src: obj.firmware_src },
            function (type, msg, ref) { ccm_upgrade_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", sn: node_sn, psn: pnode_sn });
    }
    function ccm_upgrade_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            ccm_get_upgrade_status_request({ type: "online" });
        }
        else {

            return -1;
        }
    }
    function ccm_get_upgrade_status_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        if (g_ref.device_list_obj["sn_" + node_sn.toUpperCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toUpperCase()];
        else if (g_ref.device_list_obj["sn_" + node_sn.toLowerCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toLowerCase()];
        if (!node) {
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_upgrade_get", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            check: (obj && obj.check) ? obj.check : 0
        },
            function (type, msg, ref) { ccm_upgrade_get_ack(type, msg, ref); },
            { ip: pnode.ip, to: "ccm", sn: node_sn, psn: pnode_sn, check_ver: (obj && obj.check) ? obj.check : 0, type: (obj && obj.type) ? obj.type : 0 });
    }
    function ccm_upgrade_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_upgrade_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function restore_system_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        if (g_ref.device_list_obj["sn_" + node_sn.toUpperCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toUpperCase()];
        else if (g_ref.device_list_obj["sn_" + node_sn.toLowerCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toLowerCase()];
        if (!node) {
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_restore", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn }, backup: obj.save_configuration },
            function (type, msg, ref) { ccm_restore_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_restore_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            system_reboot_request();
        }
        else {

        }
    }
    function system_reboot_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        if (g_ref.device_list_obj["sn_" + node_sn.toUpperCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toUpperCase()];
        else if (g_ref.device_list_obj["sn_" + node_sn.toLowerCase()])
            node = g_ref.device_list_obj["sn_" + node_sn.toLowerCase()];
        if (!node) {

            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_reboot", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_reboot_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm", sn: node_sn, psn: pnode_sn });
    }
    function ccm_reboot_ack(type, msg, ref) {
        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "mcs_set_successfully" });

        }
        else {

            return -1;
        }
    }

    me.ctrl = function (obj) {
        switch (obj.type) {
            case "restore_system_request":
                {
                    restore_system_request(obj.data);
                    break;
                }
            case "ccm_upgrade_request":
                {
                    ccm_upgrade_request(obj.data);
                    break;
                }
            case "ccm_get_upgrade_status_request":
                {
                    ccm_get_upgrade_status_request(obj.data);
                    break;
                }
            case "system_reboot_request":
                {
                    system_reboot_request();
                    break;
                }
            case "ccm_active":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_active", { ActivationCode: obj.ActivationCode },
                        function (type, msg, ref) { ccm_active_ack(type, msg, ref); });
                    break;
                }

        }
    }

}
function options_others_Business(obj) {
    var me = this,
        parent_callback = obj.on_event,
        set_config_response_ok = 0,
        set_audio_output_config_response_ok = 0,
        set_audio_source_config_response_ok = 0;

    function ccm_speakers_get_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (msg.speakers) {
                acs.send_msg_ex(g_ref.select_device_ipc, "ccm_speaker_get", { token: msg.speakers[0].token },
                    function (type, msg, ref) { ccm_speaker_get_ack(type, msg, ref); });
            }
            else {
                // log("info:GetAudioOutputsResponse return AudioOutputs is null in class_options_others.");
            }
        }
        else {
            //log("error:GetAudioOutputsResponse return Result error in class_options_others.");
            return -1;
        }
    }
    function ccm_speaker_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_speaker_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_mic_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (set_config_response_ok && set_audio_output_config_response_ok && (ccm_set_system_info_response_ok || old_version)) {
                parent_callback({ type: "smcs_set_successfully" });
                set_config_response_ok = 0;
                set_audio_output_config_response_ok = 0;
                ccm_set_system_info_response_ok = 0;
            }
            else {
                set_audio_source_config_response_ok = 1;
            }
        }
        else {
            //log("error:SetAudioSourceConfigurationResponse return Result error in class_options_others.");
            return -1;
        }
    }
    function set_audio_output_config_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in set_audio_output_config_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }

        set_audio_output_config_response_ok = 0;
        acs.send_msg("ccm_speaker_set", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            conf: obj.conf, force_persistence: 1
        },
            function (type, msg, ref) { ccm_speaker_set_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function get_device_info_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in get_device_info_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_dev_info_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_dev_info_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_get_system_info_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in ccm_get_system_info_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_misc_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_misc_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_misc_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_misc_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_dev_info_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_dev_info_get_ack", data: { type: type, msg: msg, ref: ref } });
    }
    function ccm_speaker_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            if (set_config_response_ok && set_audio_source_config_response_ok && (ccm_set_system_info_response_ok || old_version)) {
                parent_callback({ type: "smcs_set_successfully" });
                set_config_response_ok = 0;
                set_audio_source_config_response_ok = 0;
                ccm_set_system_info_response_ok = 0;
            }
            else {
                set_audio_output_config_response_ok = 1;
            }
        }
        else {
            // log("error:SetAudioOutputConfigurationResponse return Result error in class_options_others.");
            return -1;
        }
    }
    function get_audio_sources_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {

            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_mics_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_mics_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_mics_get_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            get_audio_source_config_options_request({ token: msg.mics[0].token });
        }
        else {
            //   log("error:GetAudioSourcesResponse return Result error in class_options_others.");
            return -1;
        }
    }
    function ccm_set_system_info_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        ccm_set_system_info_response_ok = 0;
        acs.send_msg("ccm_misc_set", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            info: obj.info
        },  //TSH selected框框用数组枚举
            function (type, msg, ref) { ccm_misc_set_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_misc_set_ack(type, msg, ref) {

        if (msg && msg.ret && msg.ret.code == "") {
            parent_callback({ type: "smcs_set_successfully" });
            if (set_config_response_ok && set_audio_output_config_response_ok && set_audio_source_config_response_ok) {

                set_config_response_ok = 0;
                set_audio_output_config_response_ok = 0;
                set_audio_source_config_response_ok = 0;
            }
            else {
                ccm_set_system_info_response_ok = 1;
            }
        }
        else {
            return -1;
        }
    }
    function get_audio_source_config_options_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            // log("Please select the specific device in get_audio_source_config_options_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        get_audio_source_configs_request();
    }
    function set_audio_source_config_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in set_audio_source_config_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }

        set_audio_source_config_response_ok = 0;
        acs.send_msg("ccm_mic_set", {
            sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn },
            conf: obj.conf, force_persistence: 1
        },
            function (type, msg, ref) { ccm_mic_set_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function get_audio_source_configs_request(obj) {
        var node, node_sn, pnode, pnode_sn;

        node_sn = g_ref.select_device_ipc;
        node = g_ref.device_list_obj["sn_" + node_sn];
        if (!node) {
            //log("Please select the specific device in get_audio_source_configs_request.");
            return;
        }
        if (node.isParent) {
            pnode = node;
            pnode_sn = node_sn;
        }
        else {
            pnode_sn = node.parent_sn;
            pnode = g_ref.device_list_obj["sn_" + pnode_sn];
        }
        acs.send_msg("ccm_mic_get", { sess: { nid: acs.create_nid(acs.ctrl({ type: "get_info" })), sn: node_sn } },
            function (type, msg, ref) { ccm_mic_get_ack(type, msg, ref); }, { ip: pnode.ip, to: "ccm" });
    }
    function ccm_mic_get_ack(type, msg, ref) {
        parent_callback({ type: "ccm_mic_get_ack", data: { type: type, msg: msg, ref: ref } });
    }

    me.ctrl = function (obj) {
        switch (obj.type) {
            case "ccm_speakers_get":
                {
                    acs.send_msg_ex(g_ref.select_device_ipc, "ccm_speakers_get", {}, function (type, msg, ref) { ccm_speakers_get_ack(type, msg, ref); });
                    break;
                }
            case "get_audio_sources_request":
                {
                    get_audio_sources_request();
                    break;
                }
            case "get_device_info_request":
                {
                    get_device_info_request();
                    break;
                }
            case "set_audio_output_config_request":
                {
                    set_audio_output_config_request(obj.data);
                    break;
                }
            case "set_audio_source_config_request":
                {
                    set_audio_source_config_request(obj.data);
                    break;
                }
            case "ccm_set_system_info_request":
                {
                    ccm_set_system_info_request(obj.data);
                    break;
                }
            case "ccm_get_system_info_request":
                {
                    ccm_get_system_info_request();
                    break;
                }
        }
    }
}