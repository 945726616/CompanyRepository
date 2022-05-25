const webpack = require("webpack")
const FileManagerPlugin = require('filemanager-webpack-plugin')
// let scssVariables = require('./src/css/variables.scss.js')
// const cssvariables = require("postcss-css-variables")

// 版本管理
// let date = new Date()
// let month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
// let day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
// const time = String(date.getFullYear()) + String(month) + String(day) //版本号后拼接的日期参数
// console.log(process.env, 'process.env.npm_config_argv')
const argv = JSON.parse(process.env.npm_config_argv)
const config = {}
// 获取自定义参数
let idx = 2
const cooked = argv.cooked
const length = argv.cooked.length
while ((idx += 2) <= length) {
  config[cooked[idx - 2]] = cooked[idx - 1]
}
// console.log(config, "config") // { '--name': 'vimtag', '--appVersion': 'v1.0.0' } 获取到命令行传递的参数
process.env.VUE_APP_VERSION = config['--appVersion']
process.env.VUE_APP_PROJECT_NAME = config['--name']

module.exports = {
  transpileDependencies: [
    'webpack-dev-server/client',
  ],
  devServer: {
    proxy: {
      '/api': {
        // target: process.env.VUE_APP_PROJECT_NAME === 'vimtag' ? 'https://wsbgp12.' + process.env.VUE_APP_PROJECT_NAME + '.com:7446' : 'https://wsbgp12.' + process.env.VUE_APP_PROJECT_NAME + '.com:7443', // 代理目标地址为正式版通用域名地址'https://wsbgp14.' + process.env.VUE_APP_PROJECT_NAME + '.com:7446'
        target: process.env.VUE_APP_PROJECT_NAME === 'vimtag' ? 'http://45.120.103.34:7080/' : 'http://45.120.103.34:7080/', // 代理目标地址为正式版通用域名地址'https://wsbgp14.' + process.env.VUE_APP_PROJECT_NAME + '.com:7446'
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/project': {
        target: 'http://' + process.env.VUE_APP_PROJECT_NAME + '.com',
        changeOrigin: true,
        pathRewrite: {
          '^/project': ''
        }
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? "./" : "/" + process.env.VUE_APP_PROJECT_NAME + "/", // 设置本地服务域名后缀
  outputDir: './dist/http_' + process.env.VUE_APP_VERSION, //  + time项目打包输出路径
  productionSourceMap: false,
  css: {
    extract: false,
    // loaderOptions: {
    //   sass: {
    //     prependData: Object.keys(scssVariables)
    //       .map(k => `\$${k.replace('_', '-')}: ${scssVariables[k]};`)
    //       .join('\n')
    //   }
    // }
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') { // 生产环境打包使用插件
      // 为生产环境修改配置...
      // config.entry = ['babel-polyfill', './src/main.js'] //转换一些IE不支持的API，达成IE,客户端可用firebase
      config.optimization.minimize = true // 是否压缩代码
      config.mode = 'production'
      config.plugins.push(
        new FileManagerPlugin({ // 打包文件处理插件 用于构造合适的压缩包路径以及删除多余的打包内容 打包时需要传递--appVersion=xxx参数
          // onEnd: {
          //   mkdir: [
          //     './packageZip'
          //   ],
          //   copy: [{
          //     source: './dist/http_' + process.env.VUE_APP_VERSION,
          //     destination: './packageZip/http_' + process.env.VUE_APP_VERSION
          //   }],
          //   archive: [
          //     { source: './packageZip', destination: './dist/http_' + process.env.VUE_APP_VERSION + '.zip' },
          //   ],
          //   delete: [
          //     './packageZip'
          //   ]
          // }
          onEnd: {
            mkdir: [
              './packageZip/website'
            ],
            copy: [{
              source: './dist/http_' + process.env.VUE_APP_VERSION,
              destination: './packageZip/website/pkg-website-' + process.env.VUE_APP_VERSION
            }],
            archive: [
              { source: './packageZip', destination: './dist/http_' + process.env.VUE_APP_VERSION + '.zip' },
            ],
            delete: [
              './packageZip'
            ]
          }
        })
      )
    }
    config.plugins.push(
      new webpack.DefinePlugin({ // 定义默认参数 在项目中可以获取到package.json中的version 项目中使用 process.env.MY_VERSION 输出
        'process.env.MY_VERSION': JSON.stringify(require('./package.json').version)
      })
    )
    config.plugins.push(
      new webpack.ProvidePlugin({// 全局使用jQuery
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      })
    )
    // config.plugins.push(
    //   new cssvariables({
    //     preserve: true
    //   })
    // )
  },
  chainWebpack: config => { // 解决webpack无法打包.ico文件
    config.module // 解决webpack无法打包.ico文件
      .rule('image')
      .test(/\.ico$/)
      .use('url-loader')
      .loader('url-loader')
    config.module // 解决webpack无法打包.swf文件
      .rule('swf')
      .test(/\.swf$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10000
      })
  }
}