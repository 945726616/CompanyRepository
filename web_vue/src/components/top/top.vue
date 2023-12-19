<template>
    <div id=top :style="project_sign&&fujikam_sign?'width:100%;height:81px;':''">
        <div id='top_box' v-if="project_sign" :style="fujikam_sign?'height:81px;line-height:81px':''">
            <!-- vimtag以及江门logo -->
            <div id='top_box_main' :style="fujikam_sign?'width:90%':''">
                <div id='top_box_left' @click="top_left_click">
                    <a target='_top'>
                        <div id='top_logo'>
                            <img v-if="$store.state.user.jmLogoFlag === 1" :src="require('@/assets/device/m_logo.png')" style="width:220px;height:36px" />
                            <img v-else :src="require('@/assets/device/logo.png')" style="width:145px;height:36px" />
                        </div>
                    </a>
                </div>
                <div id='top_box_right' @mouseleave="select_lang_box_sign = false">
                    <div id='bottom_select_lang' v-if='language_switch_sign' :style="fujikam_sign?'line-height:81px':''" @click="select_lang_click($event)">
                        {{select_lang_val}}
                    </div>
                    <div id='select_lang_box' :style="select_lang_box_sign?'display:block;top:'+lang_height_val+'px;':'display:none'">
                        <div class='select_lang' v-for='(item,index) in language_list' :key="index" :value='item.val' @click="choose_language_btn">{{item.lang}}</div>
                    </div>
                    <div id='top_menu_my' class='top_right_menu' :style="fujikam_sign?'line-height:81px':''" @click="menu_my_click">{{username_value}}</div>
                    <div id='top_login_div' :style="fujikam_sign?'line-height:81px':''" @click="login_div_click"><span id='top_login_span'>
                            {{mcs_my_device}}
                        </span></div>
                    <div id='top_experience_div' class='top_right_menu' :style="fujikam_sign?'line-height:81px':''" @click="experience_div_click" v-if="project_sign && experienceShow">
                        {{mcs_demo}}
                    </div>
                </div>
            </div>
        </div>

        <div id='top_box' class='menu_box' v-else :style="project_name == 'ebitcam'?'background-color:#f5f5f5; border-bottom: 1px solid #ccc':''">
            <!-- mipc,vsmahome,ebitlogo -->
            <div id='top_box_main' v-if='!back_sign'>
                <div id='mipc_logo_img' :class="kbwin_sign?project_name+'_logo_img kbwin_logo_img':project_name+'_logo_img'" @click="mipc_logo_click_sign?mipc_logo_click():''" ref='mipc_logo'></div>
                <div id='menu_more' :class="project_name == 'ebitcam'?switch_more?'ebit_menu_top_li_active':'ebit_menu_top_li':switch_more?'menu_top_li_active':'menu_top_li'" @click="menu_more_click">
                    <div id='menu_more_img' class='menu_img'></div>
                    <div id='menu_more_txt' class='menu_txt'>
                        {{mcs_more_options}}
                    </div>
                </div>
                <div id='menu_download' :class="project_name == 'ebitcam'?switch_download?'ebit_menu_top_li_active':'ebit_menu_top_li':switch_download?'menu_top_li_active':'menu_top_li'" v-if='!kbwin_sign' @click="menu_download_click">
                    <div v-if='!fujikam_sign'>
                        <!-- 若为客户端则隐藏下载按钮 -->
                        <div id='menu_download_img' class='menu_img'></div>
                        <div id='menu_download_txt' class='menu_txt'>
                            {{mcs_download}}
                        </div>
                    </div>
                </div>
            </div>
            <div :id='project_name == "ebitcam"?"ebit_back":"top_back"' v-if='back_sign'>
                <div id='mipcBack' @click="back_btn">
                    <div :id='project_name == "ebitcam"?"ebit_main_title_box_return_img":"main_title_box_return_img"'></div>
                    {{mcs_back}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import md5 from '@/util/mmd5.js'
    import languageSelect from '../../lib/exportModule/languageSelect.js'
    export default {
        data() {
            return {
                //多国语言
                mcs_my_device: '', //我的设备
                mcs_demo: '', //体验
                mcs_more_options: '', //更多
                mcs_download: '', //下载
                mcs_back: '', //返回
                project_sign: true, //判断是vimtag(true)还是mipc(false)
                project_name: '', //项目名
                project_logo_img: '', //项目logo
                jmLogo_sign: this.$store.state.user.jmLogoFlag === 1 ? this.$store.state.user.jmLogoFlag : false, //vimtag江门专属logo
                username_value: this.$store.state.user.name !== '' ? this.$store.state.user.name : '', // 定义用户名
                l_pwd_val: '', // 定义密码
                fujikam_sign: false, //是否为客户端
                select_lang_val: '', //语言
                select_lang_box_sign: false, //是否显示语言下拉框
                lang_height_val: '', //语言下拉框高度
                kbwin_sign: '', //查看app是否为定制kbwin  5.11.3
                switch_download: false, //切换下载
                switch_more: false, //切换更多
                language_list: [{ val: "ar", lang: "العربية" }, { val: "en", lang: "English" }, { val: "es", lang: "española" }, { val: "fr", lang: "française" }, { val: "de", lang: "Deutsch" }, { val: "it", lang: "italiana" }, { val: "ja", lang: "日本語" }, { val: "ko", lang: "한국의" }, { val: "pt", lang: "português" }, { val: "ru", lang: "русский" }, { val: "zh", lang: "中文(简体)" }, { val: "tw", lang: "中文(繁体)" }, { val: "hu", lang: "magyar" }, { val: "nl", lang: "Nederlands" }, { val: "sk", lang: "slovenského jazyk" }, { val: "tr", lang: "Türk dili" }, { val: "cz", lang: "Česky" }, { val: "vi", lang: "Người việt nam" }, { val: "iw", lang: "עברית" }, { val: "pl", lang: "Polski" }, { val: "uk", lang: "Українська мова" }, { val: "th", lang: "ภาษาไทย" }],
                back_sign: false, //是否有返回键
                language_switch_sign: true, //vimtag语言选择是否显示
                experienceShow: this.$store.state.jumpPageData.experienceShow, // 获取体验按钮展示标识
                mipc_logo_click_sign: true, //左上角图标能否点击
            }
        },
        async mounted() {
            this.project_sign = (this.$store.state.jumpPageData.projectName.indexOf('vimtag') > -1) ? true : false
            console.log(this.experienceShow, 'experienceShow', this.project_sign)
            this.$nextTick(async () => {
                // 强制重新引入多国语言 main.js中的引用无法确保在调用top时能够全局使用
                await this.$chooseLanguage.lang(this.$store.state.user.userLanguage)
                this.mcs_my_device = mcs_my_device;
                this.mcs_demo = mcs_demo;
                this.mcs_more_options = mcs_more_options;
                this.mcs_download = mcs_download;
                this.mcs_back = mcs_back;
                this.project_name = this.$store.state.jumpPageData.projectName;
                if (!this.project_sign) {
                    if (window.fujikam === 'fujikam') {
                        let mipc_appparam_url = location.href
                        if (this.GetUrlParam_kb('kbwin', mipc_appparam_url)) {
                            this.$store.dispatch('setKbwin', this.GetUrlParam_kb('kbwin', mipc_appparam_url) ? this.GetUrlParam_kb('kbwin', mipc_appparam_url) : 0)
                        }
                    }
                    if (this.$store.state.jumpPageData.kbwin === 1) {
                        this.kbwin_sign = true;
                    } else {
                        this.kbwin_sign = false;
                    }
                }

                if (!this.$store.state.user.name) {
                    this.username_value = mcs_my
                }
                if (this.$store.state.jumpPageData.localFlag) { // 判断是否为本地离线模式
                    this.$store.dispatch('setLoginFlag', this.publicFunc.urlParam() && this.publicFunc.urlParam().c == 1 ? 1 : 0)
                    let l_remember_data = sessionStorage.get('remember_msg_info')
                    l_remember_data = eval('(' + l_remember_data + ')')
                    if (this.$store.state.user.loginFlag) {
                        // this.username_value = l_remember_data.user
                        this.l_pwd_val = l_remember_data.password
                    }
                }
                if (window.fujikam == 'fujikam') {
                    this.fujikam_sign = true;
                    // $('#select_lang_btn').attr('style', 'height:360px') // 用于修复在客户端滚轮轻微滚动,语言选择条移动距离过大的问题
                    // $('.top_list_menu').hide()
                }
                this.select_lang();
                // 截取url登录相关参数
                let exp_username = this.publicFunc.urlParam().user ? _this.publicFunc.urlParam().user : '' // 用户名
                let exp_password = this.publicFunc.urlParam().pw ? _this.publicFunc.urlParam().pw : '' // 密码
                if (exp_username) {
                    // 调用登录接口
                    this.$api.login.sign_in({
                        user: exp_username, // 用户名
                        password: md5.hex(exp_password) // 密码
                    }).then(res => { // 登录回调处理
                        this.$router.push({
                            name: 'devlist'
                        })
                        // 跳转至设备列表页面
                    })
                }
            })
        },
        methods: {
            top_left_click() {
                if (window.fujikam == 'fujikam') {
                    // 如果是客户端则屏蔽跳转功能
                    return false
                }
                location.href = 'https://www.vimtag.com/'
            },
            menu_my_click() { // 点击个人中心
                if (this.publicFunc.urlParam().l == 'local') {
                    this.$store.dispatch('setLocalFlag', 1)
                }
                // if (this.$store.state.jumpPageData.localFlag) {
                //     this.$store.dispatch('setLoginFlag', this.publicFunc.urlParam() && this.publicFunc.urlParam().c == 1 ? 1 : 0)
                // }
                this.$router.push({
                    name: 'my'
                })
            },
            login_div_click() { //点击我的设备
                if (this.$store.state.jumpPageData.localFlag) {
                    //如果点击了本地搜索
                    // this.$store.dispatch('setLoginFlag', this.publicFunc.urlParam() && this.publicFunc.urlParam().c == 1 ? 1 : 0)
                    if (this.$store.state.user.loginFlag) {
                        //已经登录了	点击我的设备无效
                        this.$store.dispatch('setLocalFlag', 0)
                        // if (window.fujikam === 'fujikam') {
                        //     // 根据是否是客户端进行两种不同的截取方式 客户端多一个版本号的参数
                        //     location.href =
                        //         location.href.split('&')[0] + '&' + location.href.split('&')[1] // 将切割后第部分进行拼接保证链接正确
                        //     console.log(location.href, "location.href")
                        // } else {
                        //     location.href = location.href.split('&')[0]
                        // }
                        // this.$router.push({
                        //     name: 'devlist'
                        // });
                    } else {
                        //没有登录点击我的设备 跳转到登录页面
                        location.href = location.href.replace('&l=local&c=0', '')
                    }
                } else {
                    //没有点击本地搜索
                    if (this.$store.state.jumpPageData.experienceFlag) {
                        this.$store.dispatch('setExperienceShow', true)
                        // g_experience为体验权限 0非体验 1体验
                        this.$store.dispatch('setExperienceFlag', false)
                        this.$router.push({
                            name: 'login'
                        });
                        sessionStorage.clear();
                        location.reload();
                    } else {
                        this.$store.dispatch('setExperienceFlag', false)
                        if (this.$store.state.user.loginFlag) {
                            //已经登录，直接到设备列表页面
                            this.$router.push({
                                name: 'devlist'
                            });
                        } else {
                            //没有登录，跳转到登录页面
                            this.$router.push({
                                name: 'login'
                            });
                        }
                    }
                }
            },
            experience_div_click() { //点击体验
                this.$store.dispatch('setExperienceFlag', true)
                this.$store.dispatch('setExperienceShow', false)
            },
            select_lang() { //选择语言
                let l_select_lang = document.getElementsByClassName('select_lang')
                let language_choice_info = this.$store.state.user.userLanguage
                let l_lang = language_choice_info ? language_choice_info : 'en'

                for (let l = 0; l < l_select_lang.length; l++) {
                    if (l_select_lang[l].getAttribute('value') === l_lang) {
                        this.select_lang_val = l_select_lang[l].innerHTML
                    }
                }
            },
            choose_language_btn(e) {
                let val = e.target.getAttribute('value');
                this.$chooseLanguage.lang(val);
                location.reload()
            },
            select_lang_click(e) { //点击语言下拉
                this.select_lang_box_sign = !this.select_lang_box_sign;
                this.lang_height_val = e.target.offsetTop + 52;
            },
            GetQueryString(name) { // 截取url参数函数
                let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
                let r = window.location.search.substr(1).match(reg)
                if (r != null) return unescape(r[2])
                return null
            },
            GetUrlParam_kb(paraName, url) { // 暂时不清楚kbwin是那个具体项目暂时简单搬迁
                let arrObj = url.split('?')
                if (arrObj.length > 1) {
                    let arrPara = arrObj[1].split('&')
                    let arr
                    for (let i = 0; i < arrPara.length; i++) {
                        arr = arrPara[i].split('=')
                        if (arr != null && arr[0] == paraName) {
                            return arr[1]
                        }
                    }
                    return ''
                } else {
                    return ''
                }
            },

            menu_download_click() { //点击下载
                this.switch_more = false;
                // this.switch_download = true;
                // this.$router.push({
                //     name: 'download'
                // }); //旧版download页面,暂时无用(若由https访问进来时，下载页访问不了)
                if (this.project_name == 'ebitcam') {
                    window.open("http://www.ebitcam.com/download")
                } else if (this.project_name == 'mipcm') {
                    window.open("http://www.mipcm.com/download")
                } else if (this.project_name == 'vsmahome') {
                    window.open("http://www.vsmahome.com/download")
                }
            },
            menu_more_click() { //点击更多
                this.switch_more = true;
                this.switch_download = false;
                this.$router.push({
                    name: 'my'
                });
            },
            mipc_logo_click() { //点击mipc标志
                this.switch_more = false;
                this.switch_download = false;
                if (this.$store.state.user.loginFlag) {
                    this.$router.push({
                        name: 'devlist'
                    });
                } else if (this.$store.state.jumpPageData.experienceFlag) {
                    this.$router.push({
                        name: 'devlist'
                    });
                } else {
                    this.$store.dispatch('setLoginWaitFlag', 0)
                    this.$router.push({
                        name: 'login'
                    });
                }
            },
            back_btn() { //点击返回
                if (this.$route.name == 'history' || this.$route.name == 'set') {
                    this.$router.push({ name: 'devlist' })
                } else if (this.$route.name == 'playback') {
                    this.$router.push({ name: "history", params: { dev_sn: this.$router.history.current.params.dev_sn } })
                }
            }
        },
        watch: {
            $route() {
                if (this.$route.name == 'download') {
                    this.switch_download = true;
                    this.switch_more = false;
                } else if (this.$route.name == 'my') {
                    this.switch_more = true;
                    this.switch_download = false;
                } else {
                    this.switch_more = false;
                    this.switch_download = false;
                }
                if (this.$route.name == 'history' || this.$route.name == 'set' || this.$route.name == 'playback') {
                    this.back_sign = true;
                } else {
                    this.back_sign = false;
                }
                if (this.$route.name !== 'login' && this.$store.state.user.name !== '') { // 切换至非登录页面时监听刷新用户名
                    this.username_value = this.$store.state.user.name
                }
                if (this.$route.name == 'login' || this.$route.name == 'devlist' || this.$route.name == 'my') {
                    this.language_switch_sign = true;
                } else {
                    this.language_switch_sign = false;
                }
                if (this.$refs.mipc_logo) {
                    if (this.$route.name === 'play' || this.$route.name === 'boxlist') { //如果在play或boxlist页面，左上角logo点击事件失效
                        this.$refs.mipc_logo.style.cursor = 'default';
                        this.mipc_logo_click_sign = false;
                    } else {
                        this.$refs.mipc_logo.style.cursor = 'pointer';
                        this.mipc_logo_click_sign = true;
                    }
                }
            },
            "$store.state.user.loginFlag"(val) {
                if (val === 1) {
                    this.username_value = this.$store.state.user.name;
                } else {
                    this.username_value = mcs_my;
                }
            },
            "$store.state.jumpPageData.experienceShow"(val) {
                console.log(val, 'experienceShow_val')
                this.experienceShow = val
            }
        }
    }
</script>

<style src="./index.scss" lang='scss'>
</style>