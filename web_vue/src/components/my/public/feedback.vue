<template>
    <div>
        <div id='feedback_main'>
            <div class='feedback_input'>
                <!-- 反馈类型 -->
                <div class='feedback_title'> {{mcs_feedback_type}} </div>
                <input id='feedback_type' :placeholder='mcs_feedback_please_select' @click='feedback_type_bth' v-model="feedback_type_value">
                <!-- <div class='feedback_error_content_tip'>mcs_invalid_email_addr</div> -->
            </div>
            <div id='pb_select_sl' v-if='feedback_type_sign'>
                <ul id='ul_id' class='ul_design' style='margin:0; padding:0'>
                    <li class='li_design_tittle disabled'> {{mcs_select}} {{mcs_feedback_type_prompt}} </li>
                    <li v-for='(item,index) in feedback_type_list' :key='index' class='li_design' @click='choose_type'>{{item}}</li>
                </ul>
            </div>

            <div class='feedback_input'>
                <!-- 邮箱地址 -->
                <div class='feedback_title'> {{mcs_email_address}} </div>
                <input id='feedback_email_address' :placeholder='mcs_contact_information_tips' v-model="feedback_email_value">
                <div class='feedback_error_content_tip' v-if='feedback_error_content_tip.contact_info'> {{mcs_invalid_email_addr}} </div>
            </div>

            <div class='feedback_input'>
                <div class='feedback_title'> {{mcs_feedback_dec_prompt}} </div>
                <textarea id='feedback_describe_text' type='text' :placeholder='mcs_feedback_dec' v-model='feedback_describe_value'></textarea>
                <div class='feedback_error_content_tip' v-if='feedback_error_content_tip.describe'> {{mcs_feedback_dec}} </div>
            </div>

            <div class='feedback_input' id='upload_image_box'>
                <div class='feedback_title'> {{mcs_feedback_upload_photo}} </div>
                <input id='upload_image' style='display:none' type='file' accept='.gif,.jpg,.jpeg,.png' @change='upload_image($event)' ref='upload_img'>
                <div id='upload_image_btn' @click='$refs.upload_img.click()'></div>
                <div id='pre_img_btn' @click='$refs.upload_img.click()'><img id='pre_img'></div>
            </div>
            <div style='clear:both' />
            <div id='feedback_submit_btn' @click="feedback_submit_btn"> {{mcs_feedback_submit}} </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 多国语言
                mcs_feedback_type: mcs_feedback_type, //反馈类型
                mcs_feedback_please_select: mcs_feedback_please_select, //- -请选择类型- -
                mcs_select: mcs_select, //请选择
                mcs_feedback_type_prompt: mcs_feedback_type_prompt, //问题类型
                mcs_feedback_select_option2: mcs_feedback_select_option2, //摄像机问题
                mcs_connection_problems: mcs_connection_problems, //连接问题
                mcs_interface_design: mcs_interface_design, //界面设计
                mcs_functional_issues: mcs_functional_issues, //功能问题
                mcs_show_problem: mcs_show_problem, //显示问题
                mcs_word_map_wrong: mcs_word_map_wrong, //词图错误
                mcs_photo_issue: mcs_photo_issue, //拍照问题
                mcs_other_questions_or_suggestions: mcs_other_questions_or_suggestions, //其他问题或建议
                mcs_email_address: mcs_email_address,
                mcs_contact_information_tips: mcs_contact_information_tips, //请留下QQ/手机号等联系方式(必填)
                mcs_invalid_email_addr: mcs_invalid_email_addr,
                mcs_feedback_dec_prompt: mcs_feedback_dec_prompt, //具体描述
                mcs_feedback_upload_photo: mcs_feedback_upload_photo, //上传照片
                mcs_feedback_submit: mcs_feedback_submit, //提交
                mcs_feedback_submit_success: mcs_feedback_submit_success, // 提交成功
                mcs_feedback_dec: mcs_feedback_dec, //请输入您的意见

                feedback_type_value: '', //反馈类型
                feedback_type_sign: false, //是否显示反馈类型
                feedback_type_list: [mcs_feedback_select_option2, mcs_connection_problems, mcs_interface_design, mcs_functional_issues, mcs_show_problem, mcs_word_map_wrong, mcs_photo_issue, mcs_other_questions_or_suggestions], //反馈类型列表
                feedback_describe_value: '', //具体描述
                feedback_email_value: '', //联系方式
                feedback_error_content_tip: { contact_info: false, describe: false }, //提交反馈失败提示
            }
        },
        methods: {
            feedback_type_bth() { //显示选择反馈类型弹窗
                this.publicFunc.mx("#add_device_page").innerHTML = "";
                $("#add_device_page").show(); //遮罩层
                this.feedback_type_sign = true;
            },
            choose_type(e) { //选择反馈类型
                $("#add_device_page").hide();
                this.feedback_type_sign = false;
                this.feedback_type_value = e.currentTarget.innerHTML;
            },
            upload_image(e) { //上传图片
                let reader = new FileReader();
                let newimg = new Image();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = function() {
                    let img = document.getElementById("pre_img");
                    img.src = this.result;
                    img.style.width = '90px';
                    img.style.height = '90px';
                    if (this.result.indexOf("data:image/png;base64,") > -1) {
                        let str = "data:image/png;base64,";
                        let img_url = "data:application/octet-stream;base64," + this.result.substr(str.length);
                    } else if (this.result.indexOf("data:image/jpeg;base64,") > -1) {
                        let str = "data:image/jpeg;base64,";
                        let img_url = "data:application/octet-stream;base64," + this.result.substr(str.length);
                    }
                    newimg.src = this.result;
                }
            },
            feedback_submit_btn() { //提交反馈
                let _this = this;
                let filter = /(^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$|^\d{6,12}$)/; // 修改正则验证QQ和邮箱
                if (!_this.feedback_describe_value || _this.feedback_describe_value == "") {
                    _this.feedback_error_content_tip.describe = true;
                    setTimeout(function() {
                        _this.feedback_error_content_tip.describe = false;
                    }, 3000)
                } else if (!_this.feedback_email_value || _this.feedback_email_value == "" || !filter.test(_this.feedback_email_value)) {
                    _this.feedback_error_content_tip.contact_info = true;
                    setTimeout(function() {
                        _this.feedback_error_content_tip.contact_info = false;
                    }, 3000)
                } else { // 发送意见反馈部分
                    let time_stamp = new Date().getTime();
                    let username_value = JSON.parse(localStorage.getItem("remember_msg_info")).user;
                    let img = document.getElementById("pre_img");
                    let img_src = '';
                    if (img.getAttribute('src')) {
                        img_src = img.getAttribute("src");
                    }
                    // var params = {
                    // 	hfrom_handle: "160199",
                    // 	flag: 1,
                    // 	content: 1,
                    // 	content_flag: 1,
                    // 	content_sign: "vimtag",
                    // 	content_title: feedback_type,
                    // 	content_creator: username_value,
                    // 	content_platform: "web",
                    // 	content_native_ver: g_web_client_v,
                    // 	content_web_ver: g_web_client_v,
                    // 	content_create_time: time_stamp,
                    // 	content_item__x_countz_: 1,
                    // 	content_item: 1,
                    // 	content_item_time: time_stamp,
                    // 	content_item_user: username_value,
                    // 	content_item_title: feedback_type,
                    // 	content_item_content: feedback_content,
                    // 	content_item_pic__x_countz_: 0
                    // }
                    let params = {
                        sign: "vimtag",
                        platform: "pc",
                        // native_ver: process.env.VUE_APP_VERSION,
                        web_ver: process.env.VUE_APP_VERSION,
                        title: _this.feedback_type_value,
                        creator: username_value,
                        email: _this.feedback_email_value,
                        item__x_countz_: 1,
                        create_time: time_stamp,
                        item: {
                            time: time_stamp,
                            user: username_value,
                            email: _this.feedback_email_value,
                            title: _this.feedback_type_value,
                            content: _this.feedback_describe_value,
                            pic: img_src
                        }
                    }
                    if (img_src == '') {
                        delete params.item.pic;
                    }
                    console.log(params)
                    this.publicFunc.msg_tips({
                      msg: mcs_feedback_submit_success,
                      type: 'success',
                      timeout: 3000
                    })
                }
            }
        }
    }
</script>

<style lang='scss'>
    .feedback_input {
        overflow: hidden;
        margin-bottom: 20px;
    }

    .feedback_title {
        float: left;
        width: 150px;
        font-size: 16px;
        color: #333333;
        line-height: 34px;
    }

    .feedback_input input {
        width: 360px;
        height: 34px;
        float: right;
        border: 1px solid #ccc;
        -moz-border-radius: 4px;
        -webkit-border-radius: 4px;
        border-radius: 4px;
        padding: 0 10px;
        box-sizing: border-box;
        background: url(../../../assets/device/feedback_arrow.png) no-repeat 338px center;
    }

    #pb_select_sl {
        height: 435px;
        width: 400px;
        padding: 30px 70px;
        box-sizing: border-box;
        z-index: 10000;
        top: 140px;
        left: 50%;
        margin-left: -200px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        position: fixed;
        background: #fff;
    }

    .li_design_tittle {
        font-size: 20px;
        color: #333333;
        width: 260px;
        text-align: center;
        margin-bottom: 5px;
    }

    .li_design {
        font-size: 16px;
        color: #333333;
        text-align: center;
        border-bottom: 1px solid gray;
        height: 44px;
        width: 260px;
        line-height: 44px;
        cursor: default;

        &:last-of-type {
            border-bottom: none;
        }
    }

    .feedback_error_content_tip {
        /* g float:left改为float:right margin-left:30px改为margin-right:50px*/
        font-size: 14px;
        float: right;
        line-height: 30px;
        color: #f00;
        margin-right: 50px;
    }

    .feedback_input textarea {
        /*margin-top:5px;*/
        width: 360px;
        height: 200px;
        float: right;
        outline: none;
        resize: none;
        border-radius: 4px;
        padding: 10px;
        border: 1px solid #ccc;
        box-sizing: border-box;
    }

    #upload_image_box {
        border-bottom: 1px solid #ccc;
    }

    #upload_image {
        float: left;
        width: 350px;
        margin-top: 5px;
        margin-bottom: 20px;
    }

    #upload_image_btn {
        width: 90px;
        height: 90px;
        background: url(../../../assets/device/feedback_add.png) no-repeat;
        background-size: 100% 100%;
        margin-left: 10px;
        margin-bottom: 40px;
        float: left;
    }

    #pre_img_btn {
        float: left;
        margin-left: 20px;
        cursor: pointer;
    }

    #feedback_submit_btn {
        float: right;
        width: 120px;
        height: 30px;
        color: #fff;
        background: #0EA9BB;
        border-radius: 4px;
        text-align: center;
        line-height: 30px;
        margin: 40px 0;
        cursor: pointer;
        display: block;
    }
</style>