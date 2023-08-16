//结果显示
let showResult = document.getElementById('result')

// 计算加法
let addValue1 = document.getElementById('addValue1')
let addValue2 = document.getElementById('addValue2')
let sendAddBtn = document.getElementById('btn-send-add')
sendAddBtn.addEventListener('click', async () => {
  let arr = [
      Number(addValue1.value),
      Number(addValue2.value)
    ]
  console.log(arr, '发送的obj')
  let getValue = await pywebview.api.dllAddItem(arr)
  showResult.innerHTML = getValue
})
