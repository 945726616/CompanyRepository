<template>
    <div class='dropdownMenu'>
        <div class='clickMenu' @click.stop='show_sign = !show_sign'>{{showData}}</div>
        <transition name='menu-slide'>
            <div class='selectBox' v-show='show_sign' @click.stop=''>
                <div v-for='(item,index) in menuData' :key='index' @click="changeData" :value='item' :title='item'>
                    <div class='selectItem extraItem' v-if='extraData && extraData.wifi_signal_png'>
                        <img class='front_img' v-if='extraData.wifi_signal_png[index] && extraData.wifi_signal_png[index].front_img' :src='extraData.wifi_signal_png[index].front_img' />
                        <span v-else> </span>
                        <span class='item_text'>{{item}}</span>
                        <img class='rear_img' v-if='extraData.wifi_signal_png[index] && extraData.wifi_signal_png[index].rear_img' :src='extraData.wifi_signal_png[index].rear_img' />
                        <span v-else> </span>
                    </div>
                    <div class='selectItem' v-else>
                        <span class='item_text'>{{item}}</span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'dropdown-menu',
        props: {
            menuData: { //下拉框展示的数据
                type: Array,
                default: function() {
                    return []
                }
            },
            showData: { //展示数据
                type: String,
                default: ''
            },
            extraData: { //下拉框额外数据展示
                type: Object,
                default: function() {}
            },
        },
        data() {
            return {
                show_sign: false, //是否展示下拉框
            }
        },
        mounted() {
            document.addEventListener('click', this.hiddenMenu)
        },
        methods: {
            hiddenMenu() { //隐藏下拉框
                this.show_sign = false;
            },
            changeData(e) { //点击下拉框菜单
                this.show_sign = false;
                let updata_data = e.currentTarget.getAttribute('value').trim();
                if (updata_data !== this.showData) //如果更改的数据和之前数据一样，则不回传数据更改结果
                    this.$emit('data_updata_event', updata_data)
            }
        }
    }
</script>

<style lang='scss'>
    @import "../css/public.scss";

    .dropdownMenu {
        position: relative;

        .clickMenu {
            position: relative;
            min-width: 200px;
            height: 34px;
            line-height: 34px;
            text-align: center;
            padding:0 10px;
            background-color: #ffffff;
            background-image: none;
            background-repeat: no-repeat;
            background-position: 98% 40%;
            border: 1px solid $projectColor;
            cursor: pointer;
            border-radius: 4px;
            z-index: 20;

            &:hover {
                background-image: url("../assets/mipc/down.png");
            }
        }

        .selectBox {
            position: absolute;
            // top: 30px;
            padding: 13px 0;
            left: 0;
            min-width: 100%;
            max-height: 230px;
            max-width: 200px;
            border: 1px solid $projectColor;
            background-image: none;
            background-color: #ffffff;
            background-size: 100% 100%;
            list-style: none;
            box-sizing: border-box;
            border-radius: 6px;
            box-shadow: 0 0 4px #111;
            z-index: 21;
            overflow: auto;

            .selectItem {
                height: 12px;
                line-height: 12px;
                cursor: pointer;
                padding: 6px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                justify-content: center;
                align-items: center;

                &:hover {
                    background-color: #ccc;
                }

                .item_text {
                    max-width: 180px;
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            .extraItem {
                justify-content: space-between;
            }
        }
    }

    .menu-slide-enter-active {
        animation: slide-down .5s ease;
    }

    .menu-slide-leave-active {
        animation: slide-up .5s ease;
    }

    @keyframes slide-down {
        from {
            max-height: 0px;
            padding: 0;
        }

        to {
            max-height: 230px;
            padding: 13px 0;
        }
    }

    @keyframes slide-up {
        from {
            max-height: 230px;
            padding: 13px 0;
        }

        to {
            max-height: 0px;
            padding: 0;
        }
    }
</style>