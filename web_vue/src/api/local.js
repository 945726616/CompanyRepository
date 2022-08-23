'use strict'
import axios from '@/axios'
import mdh from '@/util/DHKeyExchange.js'
import CryptoJS from '@/util/cryptojs_tripledes.js'
import mcodec from '@/util/mcodec.js'
import mme from '@/util/mme.js'
import md5 from '@/util/mmd5.js'
import store from '../store'
import login from './login'
import play from './play'
import devlist from './devlist'
import publicFunc from '@/util/public.js'
let secret_key // 公共私钥变量用于mdh接口与后续回调的接口公用同一私钥值
let default_InvalidAuth_img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATAAAACrBAMAAAATA930AAAAIVBMVEXZ2dny8vLf39/c3Nzv7+/o6Ojk5OTq6urs7Ozm5ubh4eEqh4/4AAACCUlEQVR42u3dPWsUURSH8WUWU9hdiJuUFxWVVIPr+rLdSjSmlDWoXaIiahdNYxnfiHVe6yzkcyY5DMnOGTIQCPwP5HmqvcMWPw4zt7gMTGehH7LDzuPbIfvYedgJ2R1gwOoBkwcMmAuYPGDAXMDkAQPmAiYPGDAXMHnAgLmAyQMGzAVMHjBgLmDyrhC28HVlZe8wHKzY/5NOevUzx4IN36SqF5NIsOFGOmtpEgfW3UlTLZdhYPdTre9RYMV6HTaXg8AeJNevGDAbmBtZCNig4ixubS1WP8chYJ+S9fdDv3/vXbJ6EWDFyCz/sy0ObDGbA8AGRrmVK+ZrW24HgN2tS57Z8rke1l2zgZVnaxtZr9TDNm3ncrvavB52c3R6s6+eX5ixC1kOm7EdtZwaoe23q3KYPZQvG/vaWA57Yg9h4zH9IYc9PWX8bl6Rw6r5NGYYAzau3XUxYI+iwpgYE2Ni0WDNid2IACuO7HTg3+epvtg5wbesgvlDC99yKYQNUktjIWytDdbTwbrrbbC5UgYrNttg81kHG7XBZoEBAwYMGDBgwIABAwYMGDBg1wMW9lCl234MpYP5t438u0c6WLFxsWspi2DWcPftBb2fVH+RvzxZFe3lSWCXDJg8YMBcwOQBA+YCJg8YMBcwecCAuYDJAwbMBUweMGAuYPKAAXMBkxcYFvY7I1G/zHIMMIc+sbj4o2sAAAAASUVORK5CYII=";
// 本地模式所用方法
const local = {
    /*
     ** 公钥验证接口(Diffie Hellman加密)
     ** bnum_prime 公钥 固定值791658605174853458830696113306796803
     ** root_num 公钥 固定值5
     ** key_a2b 转换后加密的值
     */
    mdh() {
        secret_key = mdh.gen_private()
        return axios.get('/ccm/cacs_dh_req', {
            params: {
                bnum_prime: mdh.prime,
                root_num: mdh.g,
                key_a2b: mdh.gen_public(secret_key),
                tid: store.state.user.localTid
            }
        })
    },
    // CryptoJS 加密工具函数
    get_uctx(data) {
        let l_share_key = store.state.user.localShareKey
        let json_buf = JSON.stringify(data)
        let key = CryptoJS.MD5(l_share_key)
        //to do 8 byte alignment
        let json_bufs = login.bytes_align(json_buf)
        let bytes_len = 8 * (parseInt(json_buf.length / 8) + 1),
            str_len = bytes_len / 4
        let json_obj = { sigBytes: bytes_len, words: json_bufs, length: str_len }
        let json_uctx = CryptoJS.DES.encrypt(json_obj, key, { iv: CryptoJS.enc.Hex.parse('0000000000000000'), padding: CryptoJS.pad.NoPadding }).ciphertext.toString()
        let b = login.str_2_16bytes(json_uctx)
        let uctx = "data:application/octet-stream;base64," + mcodec.binary_2_b64(b)
        return uctx
    },
    pwd_encrypt(pwd_md5_hex) {
        return CryptoJS.DES.encrypt(CryptoJS.enc.Hex.parse(pwd_md5_hex), CryptoJS.enc.Hex.parse(md5.hex(store.state.user.localShareKey)), { iv: CryptoJS.enc.Hex.parse('0000000000000000'), padding: CryptoJS.pad.NoPadding }).ciphertext.toString()
    },
    /*
     ** 登录验证接口
     ** user 用户名
     ** password md5转换后的密码
     */
    async sign_in(params) {
        let returnItem // then函数中return并不能正确的返回到调用处 所以添加该变量作为局部中转使用
        await local.mdh().then(async res => {
            let data = res ? res.data : null
            if ((!data) || data.result) { // 请求失败的情况
                returnItem = false
            }
            // 请求成功 存储用户关键id信息
            store.dispatch('setLocalTid', data.tid)
            store.dispatch('setLocalLid', data.lid)
            // 注: 此处secret_key值为mdh()函数中所使用的secret_key,使用方法创建会重新随机私钥导致无法匹配
            store.dispatch('setLocalShareKey', mdh.gen_shared_secret(secret_key, data.key_b2a))
            let uctx = local.get_uctx({ app: { id: params.appid } })
            returnItem = axios.get('/ccm/cacs_login_req', { // 调用登录接口
                params: {
                    lid: store.state.user.localLid,
                    nid: login.create_nid_ex(2), // 计算nid
                    user: params.user,
                    pass: local.pwd_encrypt(params.password),
                    session_req: 1,
                    param: [{ name: "spv", value: "v1" }, { name: "uctx", value: uctx }]
                }
            })
        })

        return returnItem
    },
    /*
     ** 本地模式获取设备列表
     ** {sess: nid: create_nid} nid固定格式
     ** start: 0 固定值
     ** counts: 1024 固定值
     */
    async local_devlist_get() {
        let is_exist_ipc = [];
        let return_data = [];
        let l_dom_search = publicFunc.dom_create_child(publicFunc.mx("#app"), "div", "search")
        // console.log(l_dom_search, 'l_dom_search')
        l_dom_search['style']['cssText'] = "width:1px;height:1px"
        let mme_params
        let ua = navigator.userAgent.toLowerCase()
        let url_params = (location.search || location.hash || "")
        let obj = {}
        let params_key = "{key:'data:application/octet-stream;base64,OenOl2/PvPX7EuqqZdvMsNf5PqEOlOJZ4sROOBtnvW8F6Fc+azokLNtti6Cb/oiuO9qhOxvDfL8cVpGY4UcCe81OIVHkbiNzuHKwiE+K6gmmWwIoHgSRn2RN4qsZO62QkqGePdR6L94n2ruSeixjqAgWFTW8AIlQptovRZSN1Dh/8M87RIRdYyVFqKqsZoZTYibPLyDFONKIqxzrFkJPtqR/wn8jnYMc1qUH/w3IYJZh/OqctPTDp8tYuQSWN3EE6+kVmDIMV9F92SZJORMnvxy+zYzpbO7Gz44fBQNQSGMelsf7yQpfTF/X8t1Qn73fu53xp3MTIGH0kklFH2tMPkO/Raelhw5A4JQbczWg0n4pcNxpRl6mCEIjFprTboJ/B2eI0qUX/zTPM7l1hBmxjxsewORsXp0y2+NnCRH0uVBGUq6fOWrdhJwotIIu5ZAZwdoDZZu6eaycol2TIS5smusoD0ODPtQ2xZoCy7djIC4MVhB5uKe0zDXbLr+Serdlq6en5HyvUN0EEmYle0fORmgNFn0DTqqTab6cx8WfFkysciJSveN4swoR66qMQUi9+TfkHTnZ/REp3kHJtSq8XJyzTe+KCXlJXGx07nAbK4svIPanx39A5o5XlpLK/ohxiMpEJZ6OhmWb9yAnL+8Bedw+epvbNQkhADh2QqB4ItsIq5KTOsNzA0aNn3FEXzyd7WLVBqcF1lUVxu1vpYRPKv01im1ORbVhDoJ9eiqkfchutpAGYOwhYzxFWOIhTMouY+m/oQhc1d8FF4T+zSx6WVmj2f+RDUdOKbQVxJdEeiGKyIDm14K34Kz+RdzF0fY50sbs/SUfMWwuKQsEPFU5KQ'}"
        mme_params = {
            parent: l_dom_search,
            enable_native_plug: true,
            enable_flash_plug: true,
            params: params_key,
            on_event: mme_on_event,
            ref_obj: obj,
            debug: (0 <= (location.search || location.hash || "").indexOf("debug=1"))
        }
        // console.log(mme_params, 'mme_params')
        if (ua.match(/windows|win32/)) {
            if (0 <= url_params.indexOf("windowless=0")) {
                mme_params.windowless = false;
            } else if (0 <= url_params.indexOf("windowless=1")) {
                mme_params.windowless = true;
            }
        }
        obj.mme = await new mme(mme_params);
        async function mme_on_event(e) {
            let local_devs_data
            async function mme_send(counts) {
                counts++;
                if (counts >= 20) return;
                let send_params = JSON.stringify({ type: "ProbeRequest", data: "{}" });
                let b = obj.mme.ctrl(0, "mbc.send", send_params);
                let send_data = eval('(' + b + ')');
                if (send_data.status !== 0) {
                    await mme_send(counts);
                }
            }
            async function get_local_dev_req(num) {
                num++;
                if (num >= 30) return;
                let a = obj.mme.ctrl(0, "mbc.create", "<aaa></aaa>");
                let data = eval('(' + a + ')');
                if (data.status == 0) {
                    await mme_send(0);
                } else {
                    await get_local_dev_req(num)
                }
            }
            if (e.type == "ready") {
                await get_local_dev_req(0);
            } else if (e.type == "ProbeResponse") {
                local_devs_data = eval('(' + mcodec.obj_2_str(e.data) + ')');
                // filter duplication ipc
                for (let i = 0; i < is_exist_ipc.length; i++) {
                    if (is_exist_ipc[i] == local_devs_data.sn) return;
                } //
                is_exist_ipc.push(local_devs_data.sn);
                let tmp_local_dev_password = sessionStorage.getItem("pass_" + local_devs_data.sn);
                let tmp_local_devs_data = {
                    sn: local_devs_data.sn,
                    type: local_devs_data.type,
                    def_img: tmp_local_dev_password ? "" : default_InvalidAuth_img,
                    nick: (local_devs_data.ProbeMatch[0].Nick ? local_devs_data.ProbeMatch[0].Nick : local_devs_data.sn),
                    addr: local_devs_data.ProbeMatch[0].XAddrs,
                    stat: tmp_local_dev_password ? "Online" : "InvalidAuth"
                }
                return_data.push(tmp_local_devs_data);
            }
        }

        function destroyMME(ms) { // 延时销毁mme操作
            return new Promise((resolve) => {
                setTimeout(() => resolve(function() {
                    obj.mme.chl_destroy();
                    $("#search").remove();
                }), ms)
            })
        }
        async function returnData() { // 同步返回获取内容
            return return_data
        }
        await destroyMME(1000) // 通过await造成中断完成同步执行效果
        return await returnData()
    },
    /*
     ** 本地模式登录
     */
    async local_sign_in(params) {
        let returnItem;
        let param = params.data;
        param.password = param.password.length >= 16 ? param.password : md5.hex(param.password);
        await local.sign_in({
            user: param.sn,
            password: param.password
        }).then(res => {
            returnItem = res.data;
            if (returnItem.result === '') {
                sessionStorage.setItem("pass_" + param.sn, param.password)
            } else if (returnItem.result === 'accounts.pass.invalid') {
                sessionStorage.removeItem("pass_" + param.sn);
            }
        })
        return returnItem;
    },
    /*
     ** 视频播放接口
     */
    async play(params) {
        let returnItem
        await axios.get('/ccm/ccm_play', {
            params: {
                sess: { nid: login.create_nid(), sn: params.sn },
                setup: { stream: "RTP_Unicast", trans: { proto: params.protocol } },
                token: params.profile_token
            }
        }).then(res => {
            returnItem = {
                result: login.get_ret(res),
                url: res.data.uri ? res.data.uri.url : ""
            }
        })
        return returnItem
    },
    /*
     ** 本地模式播放
     */
    async local_device_play(params) {
        let returnItem;
        let param = params.data;
        param.password = param.password.length >= 16 ? param.password : md5.hex(param.password);
        await local.sign_in({
            user: param.sn,
            password: param.password,
        }).then(async res => {
            await play.play({
                dom: param.dom,
                sn: param.sn,
                profile_token: param.profile_token
            }).then(res => {
                console.log(res, '播放res')
            })
            returnItem = { result: res.data.result }
        })
        return returnItem;
    },
    async local_play(params) {
        let param = params.data;
        await play.play({
            dom: param.dom,
            sn: param.sn,
            profile_token: param.profile_token
        }).then(res => {
            console.log(res, '播放res')
        })
    },
    async local_box(params) {
        let param = params.data;
        // console.log(param,"param_data")
        param.dom.parentNode.childNodes[0].childNodes[0].src = devlist.pic_url_get({ sn: param.sn, token: "p1" });
    }
}
export default local