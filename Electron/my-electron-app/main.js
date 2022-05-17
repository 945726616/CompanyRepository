// 引入devtools模块
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
// 导入app模块(控制应用程序的事件生命周期)
// 导入BrowserWindow模块(创建和管理应用程序窗口)
// 导入ipcMain模块用于与渲染模块通信
const { app, BrowserWindow, BrowserView, ipcMain } = require('electron')

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
  })
  // child.loadURL('http://www.vimtag.com/device')
  child.loadFile('index.html')
  // child.loadFile('yuvIndex.html')
  // child.setBackgroundColor(rgba(255, 255, 255, 0))
  child.hide()


  win.loadURL('http://localhost:8080/vimtag/')//loadFile('index.html')
  // win.loadFile('yuvIndex.html')
  win.on('resize', () => {
    console.log(win.getSize(), Math.ceil(win.getSize()[0]/2))
     child.setSize(Math.ceil(win.getSize()[0]/2), Math.ceil(win.getSize()[1]/2))
  })
  win.on('move', () => {
    // console.log(win.getContentBounds(), 'move_getBounds')
    console.log('move window event')
    // child.setBounds({ x: win.getContentBounds().x + playerOrigin.x, y: win.getContentBounds().y + playerOrigin.y })
    win.webContents.send('ping', 'whoooooooh!')
  })

  // ipcMain通信方法
  // 接收从页面中传递的播放器初始位置信息(全局存储)
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
    event.reply('asynchronous-reply', 'pong')
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

