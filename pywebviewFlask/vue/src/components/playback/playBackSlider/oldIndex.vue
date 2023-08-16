<template>
  <!-- 进度条插件 -->
  <div class="progress-bar" ref="progressBar" >
    <div class="bar-inner" id="barProgress" @click.prevent="progressClick">
      <div class="progress" ref="progress" id="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn">
        <div class="progress-btn" ref='dragBtn' @click.prevent="offsetFlag = false"></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      btnWidth: { // 进度条按钮宽度,由于style中没有设置width,因此只能用clientWidth获取
        type: Number,
        default: 0
      },
      offsetFlag: true // 防止连续点击按钮导致获取offset异常值
    }
  },
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  mounted () {
    let _this = this
    this.btnWidth = document.getElementsByClassName('progress-btn')[0].clientWidth // 获取按钮宽度大小
    this.$refs.progressBtn.onmousedown = function (e) { // 按钮拖动事件(鼠标按下)
      _this.$refs.progressBar.setAttribute('drag-flag', false) // 初始化拖动标识
      let width = _this.$refs.progress.clientWidth // 记录进度条长度
      let disX = e.clientX
      document.onmousemove = function (e) { // 按钮拖动事件(鼠标按下并移动)
        _this.$refs.progressBar.setAttribute('drag-flag', true) // 将拖动标识改为true
        let newWidth = e.clientX - disX + width // 拖拽时获取新的进度条长度
        let scale = newWidth / _this.$refs.progressBar.clientWidth // 获得拖拽时新的百分比
        _this.$emit('percentChange', scale) // 发送给父组件(进度条移动的百分比)
      }
      document.onmouseup = function () { // 按钮拖动事件(鼠标抬起)
        document.onmousemove = document.onmouseup = null // 清空事件防止抬起后按钮继续移动
      }
    }
  },
  methods: {
    progressClick (e) { // 进度条点击事件
      console.log(e, 'progressClick_e')
      const isDrag = this.$refs.progressBar.getAttribute('drag-flag') // 获取点击/拖动标识 (true:拖动, false: 点击)
      if (isDrag === 'true') {
        this.$refs.progressBar.setAttribute('drag-flag', false) // 将标识初始化为点击事件
        return
      }
      this._setOffset(e.offsetX) // 设置进度条及按钮偏移
      this._triggerPercent() // 通知父组件播放进度变化
    },
    _triggerPercent () { // 计算百分比并发送至父组件
      const barWidth = this.$refs.progressBar.clientWidth - this.btnWidth
      const percent = Math.min(1, this.$refs.progress.clientWidth / barWidth)
      this.$emit('percentChange', percent) // 发送给父组件(进度条移动的百分比)
    },
    _setOffset (offsetWidth) { // 设置偏移
      if (offsetWidth < 0 || !this.offsetFlag) { // 去抖动防止鼠标点击过近导致的offsetX获取异常值
        this.offsetFlag = true
        return
      }
      this.$refs.progress.style.width = `${offsetWidth}px` // 设置进度长度随着百分比变化
      this.$refs.progressBtn.style.transform = `translate3d(${offsetWidth}px, 0, 0)` // 设置按钮随着百分比偏移
    }
  },
  watch: {
    percent (newPercent, oldPercent) { // 监听进度条百分比变化
      if (newPercent > 0) {
        console.log('enter watch', newPercent)
        // 进度条总长度
        const barWidth = this.$refs.progressBar.clientWidth - this.btnWidth
        const offsetWidth = barWidth * newPercent
        this._setOffset(offsetWidth) // 设置进度条及按钮偏移
        // this._triggerPercent() // 通知父组件播放进度变化
      }
    },
    // '$store.state.jumpPageData.percent'(val) {
    //   if (val > 0) {
    //     console.log('enter watch vuex', val)
    //     // 进度条总长度
    //     const barWidth = this.$refs.progressBar.clientWidth - this.btnWidth
    //     const offsetWidth = barWidth * val
    //     this._setOffset(offsetWidth) // 设置进度条及按钮偏移
    //     this._triggerPercent() // 通知父组件播放进度变化
    //   }
    // }
  }
}
</script>

<style lang="scss">
.progress-bar {
  height: 5px;
  .bar-inner {
    position: relative;
    height: 5px;
    background-color: rgba($color: #000, $alpha: 0.3);
    pointer-events:auto;
    .progress {
      position: absolute;
      height: 100%;
      background-color: blue;
      z-index: 10;
      // opacity: 0.8;
    }
    .progress-btn-wrapper {
      position: absolute;
      left: -2px;
      top: -4px;
      width: 10px;
      height: 10px;
      z-index: 10;
      .progress-btn {
        position: relative;
        top: 0.12rem;
        left: 0.12rem;
        box-sizing: border-box;
        width: 10px;
        height: 10px;
        border: 1px solid #fff;
        border-radius: 50%;
        background-color: blue;
        z-index: 11;
      }
    }
  }
}
</style>