// 打包时采用的合并命令
const concurrently = require('concurrently') 

let [version = ''] = process.argv.filter(
  (item, index) => {
    if (index > 1) {
      return item[index]
    }
  }
)

concurrently([
  `npm version ${version}`,
  `npm run build --appVersion=v${version}`
])