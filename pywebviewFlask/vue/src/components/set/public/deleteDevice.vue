<template>
    <div class='options_float_right' style='clear:both'>
        <button id='del_dev_button_setup' @click='del_dev_btn'> {{mcs_delete_device}} </button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //多国语言
                mcs_delete_device: mcs_delete_device, //删除设备
            }
        },
        methods: {
            del_dev_btn() { //删除设备
                this.publicFunc.delete_tips({
                    content: mcs_delete_device + "?",
                    func: () => {
                        this.$api.devlist.dev_del({
                            sn: this.$store.state.jumpPageData.selectDeviceIpc
                        }).then(res => {
                            this.publicFunc.msg_tips({ msg: res.msg, type: res.type, timeout: 3000 })
                            if (res.type === "success") {
                                setTimeout(() => {
                                    this.$router.push({ name: 'devlist' })
                                    window.location.reload()
                                }, 1000)
                            }
                        })
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    #del_dev_button_setup {
        float: right;
        -moz-border-radius: 4px;
        -webkit-border-radius: 4px;
        border-radius: 4px;
        height: 30px;
        min-width: 120px;
        padding: 5px 10px;
        box-sizing: border-box;
        margin-right: 100px;
        border: 0;
        background-color: $projectColor;
        margin-top: 20px;
        margin-left: 20px;
        cursor: pointer;
        font-size: 15px;
        color: #ffffff;
    }
</style>