// Api接口集合文件
// 目前所有接口均根据原项目参数传递封装,但有些接口本身并不需要接收这么多参数,后续可能会根据接口文档对所有接口进行简洁化处理
import login from '@/api/login'
import devlist from '@/api/devlist'
// import test2 from '@/api/test2'

export default {
    login,
    devlist
}