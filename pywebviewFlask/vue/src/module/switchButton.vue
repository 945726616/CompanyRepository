<template>
    <div class='switchButton'>
        <div class="weui-switch" :class="{'weui-switch-on' : isChecked}" @click="onChange" style="position:relative">
            <div v-if="isChecked" style="width:100%;height:100%;position:absolute;padding:0 5px;line-height:20px;color:#FFF;user-select:none">
            </div>
            <div v-else style="width:100%;height:100%;position:absolute;padding:0 5px;right:2px;line-height:22px;color:#7A7A7A;text-align:right;user-select:none">
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'switch-button',
        props: {
            value: { //控制按钮开或关
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isChecked: this.value
            }
        },
        methods: {
            onChange() {
                this.isChecked = !this.isChecked;
            }
        },
        watch: {
            value(val){
                this.isChecked = val;
            },
            isChecked(val) {
                this.$emit('data_updata_event', val)
            }
        }
    }
</script>

<style lang='scss'>
    @import "../css/public.scss";

    .weui-switch {
        display: block;
        position: relative;
        width: 60px;
        height: 12px;
        border: 1px solid #DFDFDF;
        outline: 0;
        border-radius: 16px;
        box-sizing: border-box;
        background-color: #DFDFDF;
        transition: background-color 0.1s, border 0.1s;
        cursor: pointer;
    }

    .weui-switch:after {
        content: " ";
        position: absolute;
        top: -5px;
        left: -5px;
        width: 17px;
        height: 17px;
        border-radius: 17px;
        background-color: #FFFFFF;
        border: 1px solid #ccc;
        transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
    }

    .weui-switch-on {
        border-color: $projectColor;
        background-color: $projectColor;
    }

    .weui-switch-on:after {
        transform: translateX(46px);
    }
</style>