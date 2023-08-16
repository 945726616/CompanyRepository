const { ipcRenderer } = require('electron')
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

// 页面加载完成后发送video位置到主进程
window.addEventListener('onload', () => {
  console.log('onload', JSON.stringify([document.getElementById('player').offsetTop, document.getElementById('player').offsetLeft]))
  // ipcRenderer.sendSync('synchronous-message', JSON.stringify([document.getElementById('player').offsetTop, document.getElementById('player').offsetLeft]))
})

window.addEventListener('scroll', () => {
  let sendObj
  sendObj = {
    offsetTop: document.getElementById('player').offsetTop,
    offsetLeft: document.getElementById('player').offsetLeft,
    scrollTop: document.documentElement.scrollTop
  }
  ipcRenderer.send('send-message', JSON.stringify(sendObj))
  console.log(document.documentElement.scrollTop, 'get scroll event')
  console.log(document.getElementById('player').offsetTop, 'player top')
  console.log(document.getElementById('player').offsetLeft, 'player left')
})

// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')