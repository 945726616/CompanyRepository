// 该文件是页面js部分, 只需引用preload.js中定义暴露的接口即可

// 点击按钮传递数据至主进程并返回修改后的结果并展示
const setButton = document.getElementById('btn')
const inputData = document.getElementById('inputData')
const showChangeValue = document.getElementById('changeValue')
setButton.addEventListener('click', async () => {
  const inputDataValue = inputData.value
  let changeValue = await window.electronAPI.setInputValue(inputDataValue)
  console.log(changeValue, 'changeValue')
  showChangeValue.innerHTML = changeValue
})

