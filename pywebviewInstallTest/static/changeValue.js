// 点击按钮传递数据至主进程并返回修改后的结果并展示
const setButton = document.getElementById('btn')
const inputData = document.getElementById('inputData')
const showChangeValue = document.getElementById('changeValue')
setButton.addEventListener('click', async () => {
  let changeValue = await pywebview.api.addItem(Number(inputData.value));
  console.log(changeValue, 'changeValue')
  showChangeValue.innerHTML = changeValue
})

