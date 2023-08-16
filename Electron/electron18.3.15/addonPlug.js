//结果显示
let showResult = document.getElementById('result')


// 发送字符串
// let sendStringBtn = document.getElementById('btn-send-string')
// // 发送字符串按钮监听
// sendStringBtn.addEventListener('click', async () => {
//   let obj = {
//     type: 'RetStr'
//   }
//   let getValue = await window.electronAPI.useAddonPlug(obj)
//   showResult.innerHTML = getValue
// })


// 计算加法
let addValue1 = document.getElementById('addValue1')
let addValue2 = document.getElementById('addValue2')
let sendAddBtn = document.getElementById('btn-send-add')
sendAddBtn.addEventListener('click', async () => {
  let obj = {
    type: 'add',
    data: [
      Number(addValue1.value),
      Number(addValue2.value)
    ]
  }
  console.log(obj, '发送的obj')
  let getValue = await window.electronAPI.useAddonPlug(obj)
  showResult.innerHTML = getValue
})

// callBack回调
// let callBackBtn = document.getElementById('btn-call-back')
// let callBackInput = document.getElementById('callBackInput')
// callBackBtn.addEventListener('click', async () => {
//   let obj = {
//     type: 'CreateObject',
//     data: callBackInput.value
//   }
//   let getValue = await window.electronAPI.useAddonPlug(obj)
//   showResult.innerHTML = getValue
// })