// Api接口集合文件
// 目前所有接口均根据原项目参数传递封装,但有些接口本身并不需要接收这么多参数,后续可能会根据接口文档对所有接口进行简洁化处理
import login from '@/api/login'
import devlist from '@/api/devlist'
import boxlist from '@/api/boxlist'
import history from '@/api/history'
import my from '@/api/my'
import play from '@/api/play'
import playback from '@/api/playback'
import set from '@/api/set'
import local from '@/api/local'
import play_mac from '@/api/play_mac'
import playback_mac from '@/api/playback_mac'
// import test2 from '@/api/test2'

export default {
    login,
    devlist,
    boxlist,
    history,
    my,
    play,
    playback,
    set,
    local,
    play_mac,
    playback_mac
}