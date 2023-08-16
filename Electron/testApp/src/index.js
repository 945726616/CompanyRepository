const { app, BrowserWindow, BrowserView, ipcMain, screen } = require('electron');
const path = require('path');
// const addonPlug = require('bindings')('napi')
// const addonPlug = require('bindings')('useDll')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // nodeIntegration: true,
      // contextIsolation: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// let appFun = require("./app.js")
// appFun.run()
console.log(process.version, 'process.version')
console.log(process.versions, 'process.versions')

// console.log("RetStr: " + addonPlug.add(1, 2))

// ********************************************************** //
// ipcMain 处理方法

// 接受页面传递的输入框信息
ipcMain.handle('send-input-value', async (event, value) => {
  // console.log('enter inputValue', value)
  let changeValue
  changeValue = Number(value) + 1
  return changeValue
})

// 调用addon插件方法
ipcMain.handle('use-addon-plug', async (event, obj) => {
  console.log(obj, 'addonObj')
  // console.log(addonPlug[obj.type].apply(this, obj.data), 'testAddonFunc')
  // 拼装调用方法并返回 (需要注意data的数据类型, 与需求参数不一致会报错)
  let resultValue
  console.log(typeof(obj.data), 'obj.data typeof')
  if (typeof(obj.data) !== 'object') {
    resultValue = addonPlug[obj.type]('MyObj').msg
    // resultValue = addonPlug[obj.type](obj.data)
  } else {
    resultValue = addonPlug[obj.type].apply(this, obj.data)
  }
  return resultValue
  // return '11'
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

// ipcMain 处理方法结束
// ********************************************************** //

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
