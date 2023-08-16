// 本地测试时采用的合并命令(本地服务调试可以直接使用npm run serve命令进行本地调试)
const concurrently = require('concurrently')

console.log(process.argv, 'process.argv')
let [version = ''] = process.argv.filter(
  (item, index) => {
    if (index > 1) {
      return item[index]
    }
  }
)
console.log(version, 'version')

concurrently([
  `npm version ${version}`,
  'npm run serve'
])