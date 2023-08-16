<template>
  <div id=download>
    <div id='is_mipc_download'></div>
    <div id='download_page'>
      <div id='download_soft_info' v-if="project_name == 'mipcm'">{{lang_zh_en_sign?mcs_mipc_download_describe:" "}}
      </div>
      <div id='download_soft_info' v-else-if="project_name == 'vsmahome'">
        {{lang_zh_en_sign?mcs_mipc_download_describe.replace("mipc", "vsmahome"):" "}}</div>
      <div id='download_soft_info' v-else>{{mcs_ebitcam_download_describe}}</div>
      <div class='download_hint' v-if="project_name != 'ebitcam'"> {{mcs_client_download}} </div>
      <div id='download_list' v-if='download_info.length > 0'>
        <div class='download_list download_windows' v-if="download_info[0].link_url">
          <div :id="project_name == 'ebitcam'?'ebit_download_windows_img':'download_windows_img'"></div>
          <a :href='download_info[0].link_url' target='_blank' id='download_windows'>
            <div id='download_windows_btn' class='download_btn'>Windows {{mcs_download}} </div>
          </a>
        </div>
        <div class='download_list download_mac' v-if="download_info[1].link_url">
          <div :id="project_name == 'ebitcam'?'ebit_download_mac_img':'download_mac_img'"></div>
          <a :href='download_info[1].link_url' target='_blank' id='download_mac'>
            <div id='download_mac_btn' class='download_btn'>Mac {{mcs_download}} </div>
          </a>
        </div>
        <div class='download_list download_mac' v-if="project_name === 'mipcm'">
          <div :id="project_name == 'ebitcam'?'ebit_download_mac_img':'download_mac_img'"></div>
          <a href='https://ovca17.mipcm.com:7443/dcm/static/MacCatalina/Mipcm.pkg' target='_blank' id='download_mac'>
            <div id='download_mac_btn' class='download_btn'>Mac Catalina {{mcs_download}} </div>
          </a>
        </div>
        <div class='download_list download_android' v-if="download_info[2].link_url">
          <div :id="project_name == 'ebitcam'?'ebit_download_android_img':'download_android_img'"></div>
          <a :href='download_info[2].link_url' target='_blank' id='download_android'>
            <div id='download_android_btn' class='download_btn'>Android {{mcs_download}} </div>
          </a>
        </div>
        <div class='download_list download_ios' v-if="download_info[3].link_url">
          <div :id="project_name == 'ebitcam'?'ebit_download_ios_img':'download_ios_img'"></div>
          <a target='_blank' id='download_ios' v-if="project_name == 'mipcm' && download_info[3].link_url" :href="lang_zh_sign?'https://itunes.apple.com/cn/app/id550958838':'https://itunes.apple.com/us/app/id550958838'">
            <div id='download_ios_btn' class='download_btn'>IOS {{mcs_download}} </div>
          </a>
          <a target='_blank' id='download_ios' v-else-if="project_name == 'ebitcam' && download_info[3].link_url" :href="lang_zh_sign?'https://itunes.apple.com/cn/app/ebitcam/id1037729989?mt=8':'https://itunes.apple.com/us/app/ebitcam/id1037729989?mt=8'">
            <div id='download_ios_btn' class='download_btn'>IOS {{mcs_download}} </div>
          </a>
          <a target='_blank' id='download_ios' v-else-if="project_name == 'vsmahome' && download_info[3].link_url" :href="lang_zh_sign?'https://itunes.apple.com/cn/app/vsmahomei/id1238594312?l=zh&ls=1&mt=8':'https://itunes.apple.com/us/app/vsmahomei/id1238594312?l=zh&ls=1&mt=8'">
            <div id='download_ios_btn' class='download_btn'>IOS {{mcs_download}} </div>
          </a>
        </div>
        <div class='download_list download_windows_sd' v-if="download_info[4].link_url">
          <div :id="project_name == 'ebitcam'?'ebit_download_windows_img':'download_windows_img'"></div>
          <a :href='download_info[4].link_url' target='_blank' id='download_windows_sd'>
            <div id='download_sd_btn' class='download_btn'>sdtool {{mcs_download}} </div>
          </a>
        </div>
        <div class='download_list download_mac_sd' v-if="download_info[5] && download_info[5].link_url">
          <div :id="project_name == 'ebitcam'?'ebit_download_mac_img':'download_mac_img'"></div>
          <a :href='download_info[5].link_url' target='_blank' id='download_mac_sd'>
            <div id='download_sd_btn' class='download_btn'>sdtool {{mcs_download}} </div>
          </a>
        </div>
      </div>
      <div class='operation_manual' v-if="project_name == 'mipcm' && lang_zh_en_sign"> {{mcs_user_guide}} </div>
      <div class='manual_out_box'>
        <div id='manual_box' v-if="project_name == 'mipcm' && lang_zh_en_sign">
          <div id='user_guide_device_img'></div>
          <a :href='window_location.protocol + "//" + window_location.host + "/dcm/manual/index.htm?appid=mipcm"' target='_blank' id='manual_download_box'>
            <div class='user_guide_download_text'> mipc {{mcs_user_guide}} </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 多国语言
      mcs_client_download: mcs_client_download, //客户端下载
      mcs_download: mcs_download, //下载
      mcs_user_guide: mcs_user_guide, //用户手册
      mcs_mipc_download_describe: mcs_mipc_download_describe, //mipc是一款云端监控服务软件，本软件配合云端摄像头使用，让用户随时随地查看视频资讯，我们为你提供清晰，流畅的观看体验，智能的控制让你随时关爱自己的家人，喜欢的用户快来下载吧!
      mcs_ebitcam_download_describe: mcs_ebitcam_download_describe, //ebitcam是一款云端监控服务软件，本软件配合云端摄像头使用，让用户随时随地查看视频资讯，我们为你提供清晰，流畅的观看体验，智能的控制让你随时关爱自己的家人，喜欢的用户快来下载吧!

      project_name: '', //项目名
      ver_type: [], //项目可下载的列表
      manual_lang: '', //语言
      lang_zh_en_sign: true, //语言是否为中文或英文
      lang_zh_sign: true, //语言是否为中文
      window_location: '', //url
      download_info: [], //下载信息
    }
  },
  async created () {
    this.manual_lang = localStorage.getItem("language_choice_info");
    this.project_name = this.$store.state.jumpPageData.projectName;
    this.window_location = window.location;
    if (this.manual_lang == 'zh' || this.manual_lang == null || this.manual_lang == 'en') {
      this.lang_zh_en_sign = true;
    } else {
      this.lang_zh_en_sign = false;
    }
    if (this.manual_lang == 'zh' || this.manual_lang == null) {
      this.lang_zh_sign = true;
    } else {
      this.lang_zh_sign = false;
    }
    if (this.project_name == "mipcm") {
      this.ver_type = ["windows_mipc", "mac_mipc", "android_mipc", "ios_mipc", "windows_sdtool", "mac_sdtool"];
      //add mipc specification download
      let content_manual = "";
      // let manual_download_url = g_product_url!==""?g_product_url:"http://45.113.201.4:12180"; // 废弃掉原有的地址判断存储 
      if (!this.manual_lang) {
        this.manual_lang = navigator.language;
        if (this.manual_lang === "zh-CN") {
          this.manual_lang = "zh";
        }
      }
    } else if (this.project_name == 'ebitcam') {
      this.ver_type = ["windows_ebit", "mac_ebit", "android_ebit", "ios_ebit", "windows_sdtool"];
    } else {
      this.ver_type = ["windows_vsmahome", "mac_vsmahome", "android_vsmahome", "ios_vsmahome", "windows_sdtool"];
    }
    await this.get_download_url(0)
  },
  async mounted () {
    await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
  },
  methods: {
    async get_download_url (num) { //获取下载地址
      let _this = this;
      if (num > _this.ver_type.length - 1) {
        _this.$forceUpdate();
        return;
      } else {
        await _this.$api.login.get_version({
          // srv: window.location.host, // 暂时注释由于有代理添加该参数会导致调用地址异常
          ver_type: _this.ver_type[num],
          ver_from: 'v3.7.1.1607051739',
          lang: _this.$store.state.user.userLanguage,
        }).then(res => {
          let msg = res.data;
          msg.info.link_url = msg.info.link_url.replace("209.133.212.170:2080", "us10.mipcm.com:2080")
          _this.download_info[num] = msg.info;
          _this.get_download_url(++num);
        })
      }
    }
  }
}
</script>

<style src="./index.scss" lang='scss'>
</style>