<template>
    <div id="download">
    </div>
</template>
<script>
import languageSelect from '../../lib/exportModule/languageSelect.js'
import '../../lib/exportModule/mCustomScrollbar'
export default {
  data() {
    return {};
  },
  methods: {
    create_download_page(obj) {
        let _this = this;
        // console.log(obj, "downloadObj")
        obj.parent.html("<div id='is_mipc_download'></div>"
        + "<div id='download_page'>"
        + "<div id='download_soft_info'></div>"
        + "<div class='download_hint'>" + mcs_client_download + "</div>"
        + "<div id='download_list'>"
        + "<div class='download_list download_windows'>"
        + "<div id='download_windows_img'></div>"
        + "<a href='javascript:;' target='_blank' id='download_windows'><div id='download_windows_btn' class='download_btn'>Windows" + "&nbsp" + mcs_download + "</div></a>"
        + "</div>"
        + "<div class='download_list download_mac'>"
        + "<div id='download_mac_img'></div>"
        + "<a href='javascript:;' target='_blank' id='download_mac'><div id='download_mac_btn' class='download_btn'>Mac" + "&nbsp" + mcs_download + "</div></a>"
        + "</div>"
        + "<div class='download_list download_android'>"
        + "<div id='download_android_img'></div>"
        + "<a href='javascript:;' target='_blank' id='download_android'><div id='download_android_btn' class='download_btn'>Android" + "&nbsp" + mcs_download + "</div></a>"
        + "</div>"
        + "<div class='download_list download_ios'>"
        + "<div id='download_ios_img'></div>"
        + "<a href='javascript:;' target='_blank' id='download_ios'><div id='download_ios_btn' class='download_btn'>IOS" + "&nbsp" + mcs_download + "</div></a>"
        + "</div>"
        + "<div class='download_list download_windows_sd'>"
        + "<div id='download_windows_img'></div>"
        + "<a href='javascript:;' target='_blank' id='download_windows_sd'><div id='download_sd_btn' class='download_btn'>sdtool" + "&nbsp" + mcs_download + "</div></a>"
        + "</div>"
        + "<div class='download_list download_mac_sd'>"
        + "<div id='download_mac_img'></div>"
        + "<a href='javascript:;' target='_blank' id='download_mac_sd'><div id='download_sd_btn' class='download_btn'>sdtool" + mcs_download + "</div></a>"
        + "</div>"
        + "</div>"
        + "<div class='operation_manual'>" + mcs_user_guide + "</div>"
        + "<div class='manual_out_box'>"
        + "<div id='manual_box'></div>"
        + "</div>"
        + "</div>")

        let ver_type = [];
        let manual_lang = localStorage.getItem("language_choice_info");
        // console.log(manual_lang, "manual_lang")
        // console.log(navigator.language, "浏览器语言")
        if (_this.$store.state.jumpPageData.projectName == "mipcm") {
            if (manual_lang == 'zh' || manual_lang == null || manual_lang == 'en') {
                _this.publicFunc.mx("#download_soft_info").innerHTML = mcs_mipc_download_describe;
            } else {
                _this.publicFunc.mx("#download_soft_info").innerHTML = "&nbsp";
            }

            ver_type = ["windows_mipc", "mac_mipc", "android_mipc", "ios_mipc", "windows_sdtool", "mac_sdtool"];
            let manual_lang = localStorage.getItem("language_choice_info");

            if (manual_lang == 'zh' || manual_lang == null) {
                _this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/cn/app/id550958838";
            } else {
                _this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/us/app/id550958838";
            }
            //		_this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/us/app/id550958838";
            //add mipc specification download
            let content_manual = "";
            // let manual_download_url = g_product_url!==""?g_product_url:"http://45.113.201.4:12180"; // 废弃掉原有的地址判断存储 
            if (!manual_lang) {
                manual_lang = navigator.language
                if (manual_lang === "zh-CN") {
                    manual_lang = "zh"
                }
            }
            if (manual_lang == 'zh' || manual_lang == 'en') {
                // console.log("进入该判断1")
                content_manual += "<div id='user_guide_device_img'></div>"
                    + "<a href='javascript:;' target='_blank' id='manual_download_box'>"
                    + "<div class='user_guide_download_text'>" + 'mipc' + mcs_user_guide + "</div>"
                    + "</div>"
                    + "</a>"
                // + "</div>"
                //    +"<img src='"+manual_download_url+"//"+"images/MIPCVSmaHome.png' style='width:95px;height:95px;'>" 废弃掉的图片展示
                $("#manual_box").html(content_manual);
                _this.publicFunc.mx("#manual_download_box").href = window.location.protocol + "//" + window.location.host + "/dcm/manual/index.htm?appid=mipcm";

            } else {
                $(".operation_manual").css("display", "none")
            }
        } else if (_this.$store.state.jumpPageData.projectName == "ebitcam") {
            // console.log("进入该判断2")
            let manual_lang = localStorage.getItem("language_choice_info");
            _this.publicFunc.mx("#download_soft_info").innerHTML = mcs_ebitcam_download_describe;
            ver_type = ["windows_ebit", "mac_ebit", "android_ebit", "ios_ebit", "windows_sdtool"];
            if (manual_lang == 'zh' || manual_lang == null) {
                _this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/cn/app/ebitcam/id1037729989?mt=8";
            } else {
                _this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/us/app/ebitcam/id1037729989?mt=8";
            }
            $(".download_hint").hide();
            $(".operation_manual").hide();
        } else if (_this.$store.state.jumpPageData.projectName == "vsmahome") {
            // console.log("进入该判断3")
            let manual_lang = localStorage.getItem("language_choice_info");
            if (manual_lang == 'zh' || manual_lang == null || manual_lang == 'en') {
                _this.publicFunc.mx("#download_soft_info").innerHTML = mcs_mipc_download_describe;
                // // console.log(mcs_mipc_download_describe)
                let vsmahome_download_describe = mcs_mipc_download_describe.replace("mipc", "vsmahome");
                vsmahome_download_describe = vsmahome_download_describe.replace("MIPC", "vsmahome");
                vsmahome_download_describe = vsmahome_download_describe.replace("Mipc", "vsmahome");
                vsmahome_download_describe = vsmahome_download_describe.replace("MiPC", "vsmahome");
                _this.publicFunc.mx("#download_soft_info").innerHTML = vsmahome_download_describe;
            } else {
                _this.publicFunc.mx("#download_soft_info").innerHTML = "&nbsp";
            }


            //		_this.publicFunc.mx("#download_soft_info").innerHTML = vsmahome_download_describe;
            ver_type = ["windows_vsmahome", "mac_vsmahome", "android_vsmahome", "ios_vsmahome", "windows_sdtool"];
            if (manual_lang == 'zh' || manual_lang == null) {
                _this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/cn/app/vsmahomei/id1238594312?l=zh&ls=1&mt=8";
            } else {
                _this.publicFunc.mx("#download_ios").href = "https://itunes.apple.com/us/app/vsmahomei/id1238594312?l=zh&ls=1&mt=8";
            }
            $(".operation_manual").hide();
            //add vsmahome specification download
            let content_manual = "";
            // let manual_download_url = g_product_url!==""?g_product_url:"http://45.113.201.4:12180"; // 废弃掉原有的地址判断存储 
            let manual_download_url = _this.$store.state.jumpPageData.downloadManualUrl + '/dcm/manual/vsmahome_zh.zip'
            // 暂未确定vsmahome用户手册跳转地址暂时注释
            // if (manual_lang == 'zh' || manual_lang == 'en') {
            //     content_manual += "<div id='user_guide_device_img'></div>"
            //         + "<a href='javascript:;' target='_blank' id='v_manual_download_box'>"
            //         + "<div class='user_guide_download_text'>" + 'vsmahome' + mcs_user_guide + "</div>"
            //         + "</div>"
            //         + "</a>"
            //     $("#manual_box").html(content_manual);
            //     _this.publicFunc.mx("#v_manual_download_box").href = manual_download_url
            //     //    +"<img src='"+manual_download_url+"//"+"/images/MIPCVSmaHome.png' style='width:95px;height:95px;'>"废弃不用的图片展示
            // } else if (manual_lang == 'tw') {
            //     content_manual += "<div id='user_guide_device_img'></div>"
            //         + "<a href='javascript:;' target='_blank' id='v_manual_download_box'>"
            //         + "<div class='user_guide_download_text'>" + 'vsmahome' + mcs_user_guide + "</div>"
            //         + "</div>"
            //         + "</a>"
            //     $("#manual_box").html(content_manual);
            //     _this.publicFunc.mx("#v_manual_download_box").href = manual_download_url
            // } else if (manual_lang == null) {
            //     content_manual += "<div id='user_guide_device_img'></div>"
            //         + "<a href='javascript:;' target='_blank' id='v_manual_download_box'>"
            //         + "<div class='user_guide_download_text'>" + 'vsmahome' + mcs_user_guide + "</div>"
            //         + "</div>"
            //         + "</a>"
            //     $("#manual_box").html(content_manual);
            //     _this.publicFunc.mx("#v_manual_download_box").href = manual_download_url
            // } else {
            //     content_manual += "<div id='user_guide_device_img'></div>"
            //         + "<a href='javascript:;' target='_blank' id='v_manual_download_box'>"
            //         + "<div class='user_guide_download_text'>" + 'vsmahome' + mcs_user_guide + "</div>"
            //         + "</div>"
            //         + "</a>"
            //     $("#manual_box").html(content_manual);
            //     _this.publicFunc.mx("#v_manual_download_box").href = manual_download_url
            // }

        }
        let download_info = [];
        // // console.log(download_info)
        function set_download_url() {
            if (download_info[0].link_url) {
                _this.publicFunc.mx("#download_windows").href = download_info[0].link_url;
                _this.publicFunc.mx("#download_windows").parentNode.style.display = "block";
            }
            if (download_info[1].link_url) {
                _this.publicFunc.mx("#download_mac").href = download_info[1].link_url;
                _this.publicFunc.mx("#download_mac").parentNode.style.display = "block";
            }
            if (download_info[2].link_url) {
                _this.publicFunc.mx("#download_android").href = download_info[2].link_url;
                _this.publicFunc.mx("#download_android").parentNode.style.display = "block";
            }
            if (download_info[3].link_url) {
                _this.publicFunc.mx("#download_ios").parentNode.style.display = "block";
            }
            if (download_info[4] && download_info[4].link_url) {
                _this.publicFunc.mx("#download_windows_sd").href = download_info[4].link_url;
                _this.publicFunc.mx("#download_windows_sd").parentNode.style.display = "block";
            }
            if (download_info[5] && download_info[5].link_url) {
                _this.publicFunc.mx("#download_mac_sd").href = download_info[5].link_url;
                _this.publicFunc.mx("#download_mac_sd").parentNode.style.display = "block";
            }
        }
        function get_download_url(num) {
            if (num > ver_type.length - 1) {
                set_download_url();
                return;
            }
            else {
                _this.$api.login.get_version({
                  // srv: window.location.host, // 暂时注释由于有代理添加该参数会导致调用地址异常
                  ver_type: ver_type[num],
                  ver_from: 'v3.7.1.1607051739',
                  lang: _this.$store.state.user.userLanguage,
                }).then(res => {
                    let msg = res.data;
                    msg.info.link_url = msg.info.link_url.replace("209.133.212.170:2080", "us10.mipcm.com:2080")
                    download_info[num] = msg.info;
                    get_download_url(++num);
                })
            }
        }
        get_download_url(0)
        window.onresize = function () {

        }
    }
  },
  async mounted() {
    this.publicFunc.projectReload.call(this);
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
    let pageData; //页面创建相关对象
    if (this.$route.params) {
      pageData = this.$route.params;
      pageData.parent = $("#" + this.$route.name);
    } else {
      pageData = { parent: $("#" + this.$route.name) };
    }
    // console.log(pageData, "pageData");
    await this.create_download_page(pageData); // 进入页面后加载
    await this.publicFunc.importCss("Public.scss"); // 动态引入css样式 页面加载完成后加载样式(如果加载过早则会无法改变jq填充的dom)
    if (window.location.href.indexOf("vimtag") === -1) {
      // mipc系列
      languageSelect.mipc($("#login_box"));
      $("#login_box").append("<div id='is_mipc_div'></div>");
    }
    if (!this.$store.state.jumpPageData.projectFlag) {
      $("#top_experience_div").css("display", "none");
    }
    
  }
};
</script>