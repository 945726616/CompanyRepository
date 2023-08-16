// 修改package.json中的版本号信息
// 采用node命令对文件package.json中的version值进行更改

const shell = require("shelljs") //同步执行cmd命令


module.exports = function writePackageJson(cbDataPackage, wholeVersion) {
  console.log(wholeVersion, 'wholeVersion')
  // 调用npm命令修改version值
  shell.exec("npm version " + wholeVersion)
  // console.log('----------------------修改package.json文件完毕，version修改为：', wholeVersion)
}
