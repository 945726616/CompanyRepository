// 导入app模块(控制应用程序的事件生命周期)
// 导入BrowserWindow模块(创建和管理应用程序窗口)
const { app, BrowserWindow } = require('electron')

// 添加createWindow方法将本地index.html加载进BrowserWindow实例
function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 700
  })

  win.loadFile('index.html')
}

// app模块中的ready事件被激发后才能创建浏览器窗口, 使用app.whenReady()监听
app.whenReady().then(() => {
  createWindow()
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

