// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// 预加载文件 主要定义与主进程之间交互的接口
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 页面传递的数据并获取返回(双向)
  setInputValue: (arg) => ipcRenderer.invoke('send-input-value', arg).then((result) => {  return result }),
  // addon插件调用
  useAddonPlug: (arg) => ipcRenderer.invoke('use-addon-plug',arg).then((result) => { return result }),
  // 页面加载完成后获取player的初始位置
  setPlayerOrigin: (arg) => ipcRenderer.send('send-player-origin', arg),
  setPlayerPosition: (arg) => ipcRenderer.send('send-message', arg),
  receiveMainMessage: (callback) => ipcRenderer.on('request-player-position', callback),
  setHidePlayer: (arg) => ipcRenderer.send('hide-player', arg), // 离开页面关闭player
})
