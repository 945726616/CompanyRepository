<template>
    <div id='motion_detect' class='list_right_box'>
        <div class='option_scene_list option_scene_list_btn' attachmen_class='scene_list_motion' @click='motion_detect_btn'>
            <div class='scene_list_img scene_list_motion'></div>
            <div class='option_scene_list_right'>
                <div class='option_scene_list_text'>
                    <div class='option_scene_list_text_left'> {{mcs_motion_detection}} </div>
                    <!-- <div class='option_scene_list_text_right'>motion</div> -->
                </div>
            </div>
        </div>
        <scene-page v-if='setScenePage' :setScenePageObj='setScenePageObj' @scene_page_close='scene_page_close'></scene-page>
    </div>
</template>

<script>
    import scenePage from './setScenePage'
    export default {
        data() {
            return {
                //多国语言
                mcs_motion_detection: mcs_motion_detection, //移动侦测

                setScenePage: false, //控制弹窗是否显示
                setScenePageObj: {}, //控制弹窗展示对象
            }
        },
        methods: {
            motion_detect_btn() { //点击移动侦测
                this.setScenePage = true;
                this.$set(this.setScenePageObj, 'detailPageFlag', 'motionDetectPage')
                this.$set(this.setScenePageObj, 'devType', 1)
            },
            scene_page_close() { //关闭弹窗
                this.setScenePage = false;
            }
        },
        mounted() {
            this.$api.set.dev_info({ sn: this.$store.state.jumpPageData.selectDeviceIpc }).then(res => {
                this.$store.dispatch('setMotionTrack', res.motion_track)
            })
        },
        components: {
            scenePage
        }
    }
</script>

<style lang='scss'>
    @import "../../../css/public.scss";

    .list_right_box {
        width: 520px;
        margin: 0 auto;
    }

    .option_scene_list {
        width: 520px;
        padding: 20px 0;
        float: left;
        border-bottom: 1px solid $projectColor;
    }

    .scene_list_img {
        float: left;
        width: 120px;
        height: 120px;
        border: 1px solid #e1e1e1;
        margin-left: 50px;
        background-size: 100% 100%;
    }

    .scene_list_motion {
        /*background: url("../assets/device/scene_move.png") no-repeat 10px 0;*/
        background: url("../../../assets/device/scene_move.png") no-repeat -25px -20px;
    }

    .option_scene_list_right {
        float: left;
        margin-left: 20px;
        width: 320px;
    }

    .option_scene_list_text {
        width: 100%;
        margin-top: 10px;
        color: #333;
        font-size: 16px;
        float: left;
        cursor: default;
        display: flex;
        justify-content: space-between;
    }
</style>