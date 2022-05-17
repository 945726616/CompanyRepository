// 预加载文件
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setPlayerOrigin: (arg) => ipcRenderer.send('send-player-origin', arg), // 页面加载完成后获取player的初始位置
  setPlayerPosition: (arg) => ipcRenderer.send('send-message', arg),
  // receiveMessageTest: () => {}
})

// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) {
//       element.innerText = text
//     }
//   }

//   for (const dependency of ['chrome', 'node', 'electron']) {
//     replaceText(`${dependency}-version`, process.versions[dependency])
//   }
// })