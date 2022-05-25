// 引入devtools模块
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
// 导入app模块(控制应用程序的事件生命周期)
// 导入BrowserWindow模块(创建和管理应用程序窗口)
// 导入ipcMain模块用于与渲染模块通信
const { app, BrowserWindow, BrowserView, ipcMain, screen } = require('electron')

// 引入Node.js中的path模块
const path = require('path')
// const fs = require('fs')

// ffi插件声明
const ffi = require('ffi-napi')
const ref = require('ref-napi')
// const refArray = require('ref-array')
const StructType = require('ref-struct-di')(ref)

const myAddDll = new ffi.Library('Dll1', {
  'funAdd': // 声明这个dll中的一个函数
    [
      'int', [ref.types.int, ref.types.int], // 第一个int是返回类型，[]里面的是参数的数据类型 // ref.refType('int')
       // 这三种写法的int都是可以的
    ],
})

const result = myAddDll.funAdd(5,8)
console.log(result)// 13

let screenSizeHeight, screenSizeWidth
// function showText(text) {
//   return new Buffer(text, 'ucs2').toString('binary')
// }

// const myUser32 = new ffi.Library('user32',{
//   'MessageBoxW':['int32',['int32', 'string', 'string', 'int32'],]
// })

// const isOk = myUser32.MessageBoxW(0, showText('I am Node.js!'), showText('Hello, world'), 1)

// const mecTest = new ffi.Library('mmec', {
//   'mec_chl_create': []
// })

// console.log(isOk, 'isOkConsole')

// ffmpeg插件声明
// const ffmpeg = require('fluent-ffmpeg')
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg')
// const ffprobePath = require('@ffprobe-installer/ffprobe')
// const { Stream } = require('stream')

// ffmpeg.setFfmpegPath(ffmpegPath.path)
// ffmpeg.setFfprobePath(ffprobePath.path)
// ffmpeg插件声明结束

// 关闭GPU渲染
app.disableHardwareAcceleration()

// 添加createWindow方法将本地index.html加载进BrowserWindow实例
function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 600,
    // 用于访问Node.js中的process.versions对象
    // __dirname 字符串指向当前正在执行的脚本的路径
    // path.join API 将多个路径段连接在一起，创建一个适用于所有平台的组合路径字符串。
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // nodeIntegration: true,
      // contextIsolation: false
    }
  })

  // 子窗口创建
  child = new BrowserWindow({ // transparent: true
    parent: win,
    frame: false,
    shadow: false, // 关闭阴影
  })
  // child.loadURL('http://www.vimtag.com/device')
  // child.loadFile('index.html')
  child.loadFile('yuvIndex.html')
  // child.setBackgroundColor(rgba(255, 255, 255, 0))
  child.hide()


  win.loadURL('http://localhost:8080/vimtag/')//loadFile('index.html')
  // win.loadFile('yuvIndex.html')
  // win.setBackgroundColor(rgba(255, 255, 255, 0))
  // 点击最大化按钮事件
  win.on('maximize', () => {
    win.webContents.send('request-player-position', 0)
    // 监听子进程返回接口
    ipcMain.once('window-maximize', (event, value) => {
      console.log(value, 'maximize callback') // 将打印到 Node 控制台
      let getMaxValue = JSON.parse(value)
      // 纠正回传值不超过屏幕最大展示范围
      getMaxValue.width = getMaxValue.width > screenSizeWidth ? screenSizeWidth : getMaxValue.width
      getMaxValue.height = getMaxValue.height > screenSizeHeight ? screenSizeHeight : getMaxValue.height
      child.setBounds({
        x: win.getContentBounds().x + (getMaxValue.x > 0 ? getMaxValue.x : 0),
        y: win.getContentBounds().y + (getMaxValue.y > 0 ? getMaxValue.y : 0)
      })
      child.setSize(Math.floor(getMaxValue.width), Math.floor(getMaxValue.height))
      // 根据子窗口设置主窗口的最小值
      win.setMinimumSize(Math.floor((getMaxValue.x > 0 ? getMaxValue.x : 0) + getMaxValue.width) + 100,
        Math.floor((getMaxValue.y > 0 ? getMaxValue.y : 0) + getMaxValue.height) + 200)
    })
  })
  // 取消最大化事件
  win.on('unmaximize', () => {
    win.webContents.send('request-player-position', 1)
    // 监听子进程返回接口
    ipcMain.once('window-unmaximize', (event, value) => {
      console.log(value, 'unmaximize callback') // 将打印到 Node 控制台
      let getUnMaxValue = JSON.parse(value)
      // 纠正回传值不超过屏幕最大展示范围
      getUnMaxValue.width = getUnMaxValue.width > screenSizeWidth ? screenSizeWidth : getUnMaxValue.width
      getUnMaxValue.height = getUnMaxValue.height > screenSizeHeight ? screenSizeHeight : getUnMaxValue.height
      child.setBounds({
        x: win.getContentBounds().x + (getUnMaxValue.x > 0 ? getUnMaxValue.x : 0),
        y: win.getContentBounds().y + (getUnMaxValue.y > 0 ? getUnMaxValue.y : 0)
      })
      let childWidth = Math.floor(getUnMaxValue.width)
      let childHeight = Math.floor(getUnMaxValue.height)
      child.setSize(childWidth, childHeight)
      // 需要先设置一次主窗口大小后再设置最小值
      let parentWidth = Math.floor((getUnMaxValue.x > 0 ? getUnMaxValue.x : 0) + getUnMaxValue.width) + 100
      let parentHeight = Math.floor((getUnMaxValue.y > 0 ? getUnMaxValue.y : 0) + getUnMaxValue.height) + 200
      win.setSize(parentWidth > screenSizeWidth ? screenSizeWidth : parentWidth,
        parentHeight > screenSizeHeight ? screenSizeHeight : parentHeight)
      // 设置窗口居中
      win.center()
      // 根据子窗口设置主窗口的最小值
      win.setMinimumSize(parentWidth > screenSizeWidth ? screenSizeWidth : parentWidth,
        parentHeight > screenSizeHeight ? screenSizeHeight : parentHeight)
    })
  })
  // 拖动窗口改变大小事件
  win.on('resize', () => {
    console.log(win.getSize(), Math.ceil(win.getSize()[0]/2))
    // child.setSize(Math.ceil(win.getSize()[0]/2), Math.ceil(win.getSize()[1]/2))
    // 向渲染进程发送消息要求返回播放器位置信息
    win.webContents.send('request-player-position', 2)
    // 监听子进程返回接口
    ipcMain.on('window-resize', (event, value) => {
      console.log(value, 'resize callback') // 将打印到 Node 控制台
      let getResizeValue = JSON.parse(value)
      // 纠正回传值不超过屏幕最大展示范围
      getResizeValue.width = getResizeValue.width > screenSizeWidth ? screenSizeWidth : getResizeValue.width
      getResizeValue.height = getResizeValue.height > screenSizeHeight ? screenSizeHeight : getResizeValue.height
      child.setBounds({
        x: win.getContentBounds().x + (getResizeValue.x > 0 ? getResizeValue.x : 0),
        y: win.getContentBounds().y + (getResizeValue.y > 0 ? getResizeValue.y : 0)
      })
      if (child.getSize()[0] !== Math.floor(getResizeValue.width) && child.getSize()[1] !== Math.floor(getResizeValue.height)) {
        child.setSize(Math.floor(getResizeValue.width), Math.floor(getResizeValue.height))
      }
      // 根据子窗口设置主窗口的最小值
      win.setMinimumSize(Math.floor((getResizeValue.x > 0 ? getResizeValue.x : 0) + getResizeValue.width) + 100,
        Math.floor((getResizeValue.y > 0 ? getResizeValue.y : 0) + getResizeValue.height) + 200)
    })
  })
  // 拖动窗口事件
  win.on('move', () => {
    // console.log(win.getContentBounds(), 'move_getBounds')
    // console.log('move window event', win.getBounds(), newBounds)
    // 向渲染进程发送消息要求返回播放器位置信息
    win.webContents.send('request-player-position', 3)
    // 监听返回事件
    ipcMain.once('window-move', (event, value) => {
      console.log(value, 'move callback') // 将打印到 Node 控制台
      let getMoveValue = JSON.parse(value)
      // 纠正回传值不超过屏幕最大展示范围
      getMoveValue.width = getMoveValue.width > screenSizeWidth ? screenSizeWidth : getMoveValue.width
      getMoveValue.height = getMoveValue.height > screenSizeHeight ? screenSizeHeight : getMoveValue.height
      child.setBounds({
        x: win.getContentBounds().x + (getMoveValue.x > 0 ? getMoveValue.x : 0),
        y: win.getContentBounds().y + (getMoveValue.y > 0 ? getMoveValue.y : 0)
      })
      console.log(child.getSize(), 'child getSize')
      console.log(Math.floor(getMoveValue.width), Math.floor(getMoveValue.height), 'Math.floor(getMoveValue.width), Math.floor(getMoveValue.height)')
      // 子窗口长宽未改变时不重复赋值, 减少拖拽频闪问题
      if (child.getSize()[0] !== Math.floor(getMoveValue.width) && child.getSize()[1] !== Math.floor(getMoveValue.height)) {
        console.log('enter change width height')
        child.setSize(Math.floor(getMoveValue.width), Math.floor(getMoveValue.height))
      }
    })
  })
  // 最小化事件
  win.on('restore', () => {
    console.log('enter restore')
    child.show()
    // 使用move事件相同的方法请求child窗口参数即可
    win.webContents.send('request-player-position', 3)
    // 监听返回事件
    ipcMain.once('window-move', (event, value) => {
      console.log(value, 'move callback') // 将打印到 Node 控制台
      let getMoveValue = JSON.parse(value)
      // 纠正回传值不超过屏幕最大展示范围
      getMoveValue.width = getMoveValue.width > screenSizeWidth ? screenSizeWidth : getMoveValue.width
      getMoveValue.height = getMoveValue.height > screenSizeHeight ? screenSizeHeight : getMoveValue.height
      child.setBounds({
        x: win.getContentBounds().x + (getMoveValue.x > 0 ? getMoveValue.x : 0),
        y: win.getContentBounds().y + (getMoveValue.y > 0 ? getMoveValue.y : 0)
      })
      console.log(child.getSize(), 'child getSize')
      console.log(Math.floor(getMoveValue.width), Math.floor(getMoveValue.height), 'Math.floor(getMoveValue.width), Math.floor(getMoveValue.height)')
      // 子窗口长宽未改变时不重复赋值, 减少拖拽频闪问题
      if (child.getSize()[0] !== Math.floor(getMoveValue.width) && child.getSize()[1] !== Math.floor(getMoveValue.height)) {
        console.log('enter change width height')
        child.setSize(Math.floor(getMoveValue.width), Math.floor(getMoveValue.height))
      }
    })
  })

  // 接收从页面中传递的播放器初始位置信息
  ipcMain.on('send-player-origin', (event, arg) => {
    child.show()// 展示child窗口
    console.log('originPlay', arg)
    let playerOrigin = JSON.parse(arg)
    let x1 = win.getContentBounds().x + playerOrigin.x
    let y1 = win.getContentBounds().y + playerOrigin.y
    console.log('x, y', x1, y1)
    child.setBounds({x: x1, y: y1})
    child.setSize(playerOrigin.width, playerOrigin.height)
  })

  // 页面滚动时获取播放器位置相关数据
  ipcMain.on('send-message', (event, arg) => {
    console.log('get ipcRenderer message', arg) // prints "ping"
    console.log('win.getBounds', win.getContentBounds())
    let argObj = JSON.parse(arg)
    // 子窗口x轴偏移量为主窗口位置+播放器的offsetLeft
    // 子窗口y轴偏移量为主窗口位置+播放器的offsetTop-纵向滚动条的scrollTop
    let childScrollX = win.getContentBounds().x + argObj.offsetLeft
    let childScrollY = win.getContentBounds().y + (argObj.offsetTop > argObj.scrollTop ? argObj.offsetTop - argObj.scrollTop : 0)
    child.setBounds({ x: childScrollX, y: childScrollY })
    console.log('changChild', child.getContentBounds())
    // event.reply('asynchronous-reply', 'pong')
  })

  // 离开播放页面关闭播放窗口
  ipcMain.on('hide-player', (event, arg) => {
    console.log('hidePlayer', arg)
    child.hide()
  })

  // ffmpeg
  // console.log(ffmpegPath.path, 'ffmpegPath.path')
  // console.log(ffprobePath.path, 'ffprobePath.path')
  // 执行部分代码
  // ffmpeg('./video.h264')
  //   // .input('./video.h264')
  //   .on('start', function (e) {
  //     console.log('start ffmpeg')
  //     console.log(e)
  //   })
  //   .output('./ffmpegVideo/1.mp4')
  //   // .output(Stream)
  //   .on('progress', function(e) {
  //     // console.log('stream', JSON.stringify(Stream))
  //     console.log('progress.e', e)
  //   })
  //   .on('end', function() {
  //     console.log('end ffmpeg')
  //   })
  //   .run()
  // ffmpeg结束
}

// ipcMain通信方法
// ipcMain.on('synchronous-message', (event, arg) => {
//   console.log('get ipcRenderer message')
//   console.log(arg) // prints "ping"
//   // event.reply('asynchronous-reply', 'pong')
// })

// ipcMain.on('synchronous-message', (event, arg) => {
//   console.log(arg) // prints "ping"
//   event.returnValue = 'pong'
// })


// app模块中的ready事件被激发后才能创建浏览器窗口, 使用app.whenReady()监听
app.whenReady().then(() => {
  // 获取显示器工作区域大小
  const screenSize = screen.getPrimaryDisplay().workAreaSize
  screenSizeWidth = screenSize.width
  screenSizeHeight = screenSize.height
  console.log(screenSize, 'screenSize')
  console.log(screenSizeWidth, 'screenSizeWidth')
  console.log(screenSizeHeight, 'screenSizeHeight')
  createWindow()
  // 引入devtools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))

  // MacOS在没有打开任何窗口的情况下也继续运行, 并且在没有窗口可用的情况下激活应用时会打开新的窗口
  // 由于窗口无法在ready事件前创建, 在应用初始化后仅监听activate事件, 通过现有的whenReady()回调中附加监听器来完成
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Windows & Linux关闭所有窗口时退出一个应用程序
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

