<template>
  <!-- 进度条插件 -->
  <div class="progress-bar" ref="progressBar" @click="adjustProgress($event)">
    <div class="bar-inner" id="barProgress">
      <div class="progress" ref="progress" id="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn">
        <div class="progress-btn" ref='dragBtn' @mousedown="handleSliderMouseDown"></div>
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
      offsetFlag: true, // 防止连续点击按钮导致获取offset异常值
      progressBarLeft: null, // 进度条容器左侧偏移量
      // progressBarWidth: null, // 进度条容器宽度
      // progressWidth: null, // 计算后进度条长度
    }
  },
  props: {
    percent: {
      type: Number,
      default: 0
    },
    progressWidth: { // 进度条长度
      type: Number,
      default: 300
    }
  },
  mounted () {
    let _this = this
    this.btnWidth = this.$refs.dragBtn.clientWidth // 获取按钮宽度大小
    this.progressBarLeft = this.$refs.progressBar.getBoundingClientRect().left
  },
  methods: {
    // 进度条点击事件
    adjustProgress (e) {
      e.preventDefault()
      if (!this.offsetFlag) { // 点击节流 目前为1秒内允许点击一次
        return
      }
      // 获取进度条相关的信息
      // e.clientX：鼠标点击的位置到最左侧的距离
      this.progressSelectWidth = e.clientX - this.progressBarLeft
      this.updatePercent(this.progressSelectWidth, this.progressWidth, 1) // 计算进度条百分比并传回父组件(仅负责动画效果)
      this.$emit('videoPlaySignal', true) // 传递播放标识(仅通知父组件进行播放操作)
      this.offsetFlag = false
      setTimeout(() => { // 定时器设置复位点击节流标识
        this.offsetFlag = true
      }, 1000)
    },
    // 更新进度条百分比并传递给父组件
    updatePercent (progressSelectWidth, width, code) {
      console.log(progressSelectWidth, width, 'progressWidth', code)
      let barWidth = this.progressWidth
      let percent = Math.min(1, progressSelectWidth / barWidth)
      console.log(barWidth, percent, 'percent')
      this.$emit('percentChange', percent) // 发送给父组件(进度条移动的百分比)
    },
    // 拖动事件
    handleSliderMouseDown (event) {
      //如果不添加以下两处的阻止默认事件，会出现以下情况: 鼠标点击滑块向前拉动，移出进度条范围时，会自动选择文字等元素，
      //出现禁用图标。松开鼠标，再次进入进度条，即使没有按住滑块，滑块也会跟随鼠标移动。这不是我们想要看到的效果。
      event.preventDefault()
      // 滑块点击坐标
      const offsetX = event.offsetX
      document.onmousemove = (e) => {
        e.preventDefault()
        // 滑动距离可视区域左侧的距离
        const X = e.clientX
        // 减去滑块偏移量
        const cl = X - offsetX
        // 除去滑块按钮长度的进度条长度
        const ml = cl - this.progressBarLeft
        let progressWidth
        if (ml <= 0) {
          //进度条长度最小和最大值的界定
          progressWidth = 0
        } else if (ml >= this.progressWidth) {
          progressWidth = this.progressWidth
        } else {
          progressWidth = ml
        }
        // 更新当前时间
        this.updatePercent(progressWidth, this.progressWidth, 2)
      }
      //抬起鼠标，结束移动事件
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
        this.$emit('videoPlaySignal', true) // 通知父组件进行播放操作
        this.offsetFlag = false
        setTimeout(() => { // 定时器设置复位点击节流标识
          this.offsetFlag = true
        }, 1000)
      }
    },
    // 设置偏移
    _setOffset (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px` // 设置进度长度随着百分比变化
      this.$refs.progressBtn.style.transform = `translate3d(${offsetWidth}px, 0, 0)` // 设置按钮随着百分比偏移
    }
  },
  watch: {
    // 父组件更新进度条百分比后 进度条更新具体效果
    percent (newPercent, oldPercent) { // 监听进度条百分比变化
      if (newPercent > 0) {
        console.log('enter watch', newPercent)
        // 进度条总长度
        this.percent = newPercent
        let offsetWidth = this.progressWidth * newPercent
        console.log(offsetWidth, 'offsetWidth')
        this._setOffset(offsetWidth) // 设置进度条及按钮偏移
      } else if (newPercent === 0){ // 播放完成初始化进度条
        console.log('初始化进度条')
        this._setOffset(0)
      }
    },
    progressWidth (newProgressWidth, oldProgressWidth) {
      this.progressWidth = newProgressWidth
      let offsetWidth = this.progressWidth * this.percent
      this.progressBarLeft = this.$refs.progressBar.getBoundingClientRect().left
      this._setOffset(offsetWidth) // 设置进度条及按钮偏移
      console.log(newProgressWidth, oldProgressWidth, this.progressWidth, '子组件中获取到的进度条长度')
    }
  },
}
</script>

<style lang="scss">
.progress-bar {
  height: 5px;

  .bar-inner {
    position: relative;
    height: 5px;
    background-color: rgba($color: #000, $alpha: 0.3);
    pointer-events: auto;

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