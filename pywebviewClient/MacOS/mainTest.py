import ctypes
from mec_struct import *
import base64
import threading
import queue
import os
import subprocess
import time
import json
import struct
import traceback
import requests

# 获取动态链接库所在的目录
dir_path = os.path.dirname(os.path.abspath(__file__))
lib_path = os.path.join(dir_path, 'libmmec.debug.dylib')
# 引入动态链接库
dll = ctypes.cdll.LoadLibrary(lib_path)
# 下载标识
download_flag = True
# 查询循环标识
query_flag = True

# 调用动态库方法，用于解码mec_ctrl方法请求query的结果
def json_get_child_string(obj, child_len, child_name_const, out_value_pointer):
    # 添加返回结果格式转换，如果不添加则返回的数据格式不是json_object结构体，无法继续调用json_get_string方法
    dll.json_get_child_by_name.restype = ctypes.POINTER(json_object)
    child = dll.json_get_child_by_name(obj, None, child_len, child_name_const)
    res =  dll.json_get_string(child, out_value_pointer)
    return res
# 定义定时器线程，用于获取视频下载/播放进度
class TimeQuery(threading.Thread):
    def __init__(self):
        super(TimeQuery, self).__init__()  # 调用父类的 __init__() 方法
        self.stop_flag = False
        self.result_queue = queue.Queue()
    # 开始查询
    def start_query(self):
        # 基础数据定义
        query_method = len_str()
        query_method_str = 'query'
        query_method.data = ctypes.c_char_p(query_method_str.encode('utf-8'))
        query_method.len = len(query_method.data)

        query_params = len_str()
        query_params_str = '{}'
        query_params.data = ctypes.c_char_p(query_params_str.encode('utf-8'))
        query_params.len = len(query_params.data)

        dll.mec_ctrl.restype = ctypes.POINTER(mec_event)
        print (self.stop_flag, 'stop_flag')

        while not self.stop_flag:
            print('chl_id', chl_id)
            # 调用动态库中的方法
            query_event_struct = dll.mec_ctrl(ctypes.byref(mecObjPointer.contents), chl_id, ctypes.byref(query_method), ctypes.byref(query_params))
            # 要查询的字符串数组
            query_str_array = ['total_bytes', 'p2ping', 'played_duration', 'buffer_percent', 'buffering', 'last_sample_abtime_played']
            # 用于存储查询结果的字符串数组
            query_res_array = []
            # 定义动态库方法存储查询结果的len_str结构体
            value_struct = len_str()
            value_ptr = ctypes.pointer(value_struct)

            # 循环请求动态库方法，并将获取的值存储
            for i in range(len(query_str_array)):

                query_str_len = len(query_str_array[i].encode('utf-8'))
                query_res = json_get_child_string(query_event_struct.contents.data, query_str_len, ctypes.c_char_p(query_str_array[i].encode('utf-8')), value_ptr)
                query_res_array.append(value_ptr.contents.data.decode())
            # 将查询结果转换为字典类型
            query_dict = dict(zip(query_str_array, query_res_array))

            print(query_dict, 'query_dict')
            # 将查询结果存储到 result_queue 中
            self.result_queue.put(query_dict)
            # 等待 1 秒钟
            time.sleep(1)
    # 将结果返回到主进程
    def get_result(self):
        result_list = []
        while not self.result_queue.empty():
            # 取出查询结果中的单个字典元素，并将其添加到返回列表中
            result = self.result_queue.get()
            result_list.append(result)
        return result_list
    # 停止查询
    def stop_query(self):
        self.stop_flag = True
        while not self.result_queue.empty():
            self.result_queue.get()
# 实例化查询线程的方法
def create_query_thread():
    global timeQuery
    # 实例化查询线程
    timeQuery = TimeQuery()
    # 开启查询线程
    timeQuery.start()
# 定义动态库回调函数
def test_on_pack( mec, pack, refer):
    global player
    data_major = pack.contents.type.contents.major.data
    # 传递两种数值 video/audio 其中video的width/height是正常比例  audio的width/height含义为文件采样率16000Hz/采样深度为16bit
    if data_major == b'audio':
        try:
            if player and player.is_running:
                audio_data = pack.contents.data.data
                byte_ptr = ctypes.cast(audio_data, ctypes.POINTER(ctypes.c_ubyte))
                byte_count = pack.contents.data.len
                # pcm_data为最终的音频数据
                pcm_data = bytes(byte_ptr[:byte_count])
                # 将pcm音频数据传入音频播放线程中
                player.play_audio(pcm_data)
                return
        except Exception as e:
            print('此处弹出报错：', e)
            return
    else:
        # 以下注释为yuv数据处理
        yuv_height = pack.contents.type.contents.format.video.height
        yuv_width = pack.contents.type.contents.format.video.width
        yuv_data = pack.contents.data.data
        byte_ptr = ctypes.cast(yuv_data, ctypes.POINTER(ctypes.c_ubyte))
        byte_count = pack.contents.data.len
        byte_array = bytes(byte_ptr[:byte_count])

        yuv_str = base64.b64encode(byte_array).decode('ascii')
        send_video_data(yuv_str, yuv_width, yuv_height)
# 通道事件回调
def test_on_event( mec, evt, refer):
    # 将获取到的evt参数传递出去，进行相应的判断和处理， 如果在该回调函数中调用则会出现死锁现象
    get_event_params(evt)

# 定义pywebview的api方法
class Api:
    # 获取视频播放链接
    def getPlayUrl(self, url, videoType):
        # 先尝试注销当前存在的播放线程，确保播放时是新线程播放
        destroyVideo()
        getVideo(url, videoType, '')
        return 'success'
    def getRecordPlay(self):
        recordPlay()
    def downloadVideo(self):
        global download_flag, query_flag
        if download_flag:
            download_flag = False
            query_flag = True
            print('query_video', download_flag)
            download_test()
    def queryVideo(self):
        global timeQuery
        timeQuery.start_query()
    # 终止视频播放获取
    def destroyPlay(self):
        print('enter destroyPlay!!!!!!!!!!!!!!!!!')
        destroyVideo()
    # 点击开始下载按钮
    def begin_download(self, url, folder_path):
        print(url, 'download_url')
        print(folder_path, 'folder_path')
        getVideo(url, 'download', folder_path)
    def download_stop(self):
        global downloadFolderPathGlobal, query_flag
        query_flag = False
        # 终止循环查询线程
        timeQuery.stop_query()
        # 注销下载的通道
        destroyVideo()
        # 转换mp4文件并删除缓存文件
        # 将 Python 字符串转换为 bytes 类型，并定义为变量 path_bytes
        path_str = downloadFolderPathGlobal
        path_bytes = path_str.encode('utf-8')
        # 将 bytes 类型数据传递给 C 函数，通过 c_char_p 类型进行转换
        path_c = ctypes.c_char_p(path_bytes)
        dll.mavio_mp4_convert(path_c)
        dll.mavio_mp4_remove_tmp(path_c)
    # 点击暂停下载时获取当前下载到的seg
    def download_pause(self):
        global downloadFolderPathGlobal, query_flag, query_param
        query_flag = False
        # 终止循环查询线程
        timeQuery.stop_query()
        # 注销下载的通道
        destroyVideo()
        # 将 Python 字符串转换为 bytes 类型，并定义为变量 path_bytes
        path_str = downloadFolderPathGlobal
        path_bytes = path_str.encode('utf-8')
        # 将 bytes 类型数据传递给 C 函数，通过 c_char_p 类型进行转换
        path_c = ctypes.c_char_p(path_bytes)
        query_param = mavio_mp4_query()
        query_param.path = path_c
        # 查询mp4结果
        query_mp4_res = dll.mavio_mp4_query(ctypes.byref(query_param))

    # 点击下载继续, 执行断点续传, 向web端回传查询到的下载的最后一个seg下标, 使用该下标获取下载token
    def download_continue(self):
        global query_param, download_continue_flag
        download_continue_flag = True
        print('enter continue')
        print(query_param.key_video_frame_counts, 'query_param.key_video_frame_counts')
        return query_param.key_video_frame_counts

# 定义evaluate_js方法
def escape_string(s):
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace("'", "\\'")
    return s
# 调用html文件中的对应方法并传递yuv字符串及相关参数
def send_video_data(jpg_as_text, yuv_width, yuv_height):
    print('最终传递至html的yuv字符串')
    print('该部分按需求打印查看yuv字符串/yuv视频宽高')

def download_test():
    global query_flag, timeQuery
    donwnload_chl_params = len_str()
    donwnload_chl_params_str = '{"src":[{"url":"' + playUrlGlobal + '"}], "dst":[{"url":"file://' + downloadFolderPathGlobal + '", "thread":"channel"}], "speaker":{"mute":"1"}, "audio":{"type":"none"}, "thread":"channel", "canvas":"none"}'
    donwnload_chl_params.data = ctypes.c_char_p(donwnload_chl_params_str.encode('utf-8'))
    donwnload_chl_params.len = len(donwnload_chl_params.data)

    download_method = len_str()
    download_method_str = 'play'
    download_method.data = ctypes.c_char_p(download_method_str.encode('utf-8'))
    download_method.len = len(download_method.data)

    download_result = dll.mec_ctrl( ctypes.byref(mecObjPointer.contents), chl_id, ctypes.byref(download_method), ctypes.byref(donwnload_chl_params) )
# 获取event回调中的关键参数
def get_event_params(evt):
    global chl_id, download_flag
    chl_id = evt.contents.chl.id
    print(evt.contents.chl.id, '获取chl_id')
    print(evt.contents.chl.type.data, '获取chl_data')
    print(evt.contents.type.data,'获取type')
    print(evt.contents.code.data, '获取code')
    # 在type属性为link且满足code。data为linked和videoTypeFlag为record的时候为录像管道调用mec_ctrl方法并使用该管道chl_id（全局）
    if evt.contents.type.data == b'link':
        if evt.contents.code.data == b'linked':
            if videoTypeFlag == 'record':
                print('该部分需要在客户端下执行')
            elif videoTypeFlag == 'download':
                download_flag = True
                print('该部分需要在客户端下执行')

# 定义播放参数
str_desc = "{container:{url:'com.vimtag.vimtaga'},canvas:{type:'yuv/420p',fps:25,padding:{align:8}}, module:{rtdp:{back_local_log:1}}}"
str_params="{key:'data:application/octet-stream;base64,SoVpDLcrbd0693vy5mmgOXdmqNkRUle3oY/JA5MZlFJ60FjZQgW8zL2kvKzYiHCbo1PpZdiXr013t6jWHQwUxyZpan/2zWhVrJ1B+/sL/mci9GKjg8OQDhWiebUCbTl71qZzCdJX/S0k3SC4Y4kjLsuODwxH/ROTD4eGBF+w54Q',canvas:{type:'yuv/420p', width:800, height:600, vertical_reverse:0, fps:25,padding:{align:8}}}"

#构造desc参数
desc = mec_desc()
desc.on_pack = on_pack_ptr(test_on_pack)
desc.on_event = on_event_ptr(test_on_event)
desc.params = len_str()
desc.params.data = ctypes.c_char_p(str_desc.encode('utf-8'))
desc.params.len = len(desc.params.data)

# 构造params参数
params = len_str()
params.data = ctypes.c_char_p(str_params.encode('utf-8'))
params.len = len(params.data)


# 通过播放地址获取视频数据
def getVideo (playUrl, videoType, download_folder_path):
    global mecObjPointer, videoTypeFlag, playUrlGlobal, downloadFolderPathGlobal, download_continue_flag, query_flag
    videoTypeFlag = videoType
    # 调用c语言函数
    dll.mec_create.restype = ctypes.POINTER(mec_desc)
    mecObjPointer = dll.mec_create( ctypes.byref(desc), ctypes.byref(params) )
    print(mecObjPointer, 'mec_create_return')

    # 调用mec_chl_create方法 'rtdp://192.99.39.134:6030/live/1jfiegbq2lpia_p0_QUGODZTNRCLZ'
    # playUrl = 'rtdp://45.120.103.34:5030/history/1jfiegbp2n65a_642232'
    playUrlGlobal = playUrl
    chl_params = len_str()
    # 回放
    if videoTypeFlag == 'record':
        print('mec_chl_create_record', playUrl)
        query_flag = True
        create_query_thread()
        chl_params_str = "{pic:{position:'null'},src:[{url:'" + playUrl + "'}], dst:[{url:'data:/',thread:'istream'}], trans:[{flow_ctrl:'delay', thread:'istream'}],thread:'istream', delay:{buf:{min:3000}}, speaker:{mute:1}}"
    # 下载
    elif videoTypeFlag == 'download':
        query_flag = True
        create_query_thread()
        # 如果不是继续下载则重新拼接下载地址 继续下载则不拼接地址使用之前的地址进行下载
        if not download_continue_flag:
            downloadFolderPathGlobal = download_folder_path + "/" + playUrl.split("/")[-1] + ".mp4"
        print(downloadFolderPathGlobal, '传入的播放链接')
        chl_params_str = '{"src":[{"url":"' + playUrl + '"}], "dst":[{"url":"file://' + downloadFolderPathGlobal + '", "thread":"channel"}], "speaker":{"mute":"1"}, "audio":{"type":"none"}, "thread":"channel", "canvas":"none"}'
    # 播放
    else:
        print('mec_chl_create_play', playUrl)
        # create_audio_thread()
        chl_params_str = "{src:[{url:'" + playUrl + "', bitrate:{min:65536, max:524288, init:131072, type:'all', keeplive_interval:6000}}], dst:[{url:'data://', type:'audio/pcm,video/yuv/420p', keeplive_interval:6000}]}"
    chl_params.data = ctypes.c_char_p(chl_params_str.encode('utf-8'))
    chl_params.len = len(chl_params.data)
    res_chl_create = dll.mec_chl_create( ctypes.byref(mecObjPointer.contents), ctypes.byref(chl_params) )

# 判断为回放时需要调用ctrl方法进行播放
def recordPlay():
    print('enter recordPlay', playUrlGlobal)
    record_params = len_str()
    record_params_str = "{pic:{position:'null'},src:[{url:'" + playUrlGlobal + "'}], dst:[{url:'data:/',thread:'istream'}], trans:[{flow_ctrl:'delay', thread:'istream'}],thread:'istream', delay:{buf:{min:3000}}, speaker:{mute:1}}"
    record_params.data = ctypes.c_char_p(record_params_str.encode('utf-8'))
    record_params.len = len(record_params.data)

    record_method = len_str()
    record_method_str = 'play'
    record_method.data = ctypes.c_char_p(record_method_str.encode('utf-8'))
    record_method.len = len(record_method.data)

    print(chl_id, 'record_chl_id')
    print(ctypes.byref(mecObjPointer.contents), 'record_mec')
    print(ctypes.byref(record_method), 'record_method')
    print(ctypes.byref(record_params), 'record_params')

    # mec_ctrl方法调用
    record_result = dll.mec_ctrl( ctypes.byref(mecObjPointer.contents), chl_id, ctypes.byref(record_method), ctypes.byref(record_params) )
    print(record_result, 'record_result')

# 对讲获取到的数据传输
def useMecWrite(pcm_audio_data, voice_chl_id):
    print(voice_chl_id, 'useMecWrite_voice_chl_id', type(voice_chl_id))
    # pcm数据存储结构
    pcm_params = len_str()
    pcm_params.data = ctypes.c_char_p(pcm_audio_data)
    pcm_params.len = len(pcm_params.data)

    major_param = len_str()
    major_param_str = 'audio'
    major_param.data = ctypes.c_char_p(major_param_str.encode('utf-8'))
    major_param.len = len(major_param.data)

    sub_param = len_str()
    sub_param_str = 'pcm'
    sub_param.data = ctypes.c_char_p(sub_param_str.encode('utf-8'))
    sub_param.len = len(sub_param.data)

    # 初始化audio和format
    audio_params = audio()
    audio_params.channels = 1
    audio_params.sample_rates = 16000
    audio_params.sample_bits = 16

    my_format = Format()
    my_format.audio = audio_params

    voice_pack_type = mec_pack_type()
    voice_pack_type.changed_seq = voice_chl_id
    voice_pack_type.major = major_param
    voice_pack_type.sub = sub_param
    voice_pack_type.format = my_format

    voice_data = data()
    voice_data.len = len(pcm_audio_data)
    voice_data.data = ctypes.cast(pcm_audio_data, ctypes.POINTER(ctypes.c_ubyte))
    print(voice_data.data, voice_data.len, 'voice_data_len_str')

    # mec_write接口中mec_pack数据
    params_pack = mec_pack()
    params_pack.chl_id = voice_chl_id
    params_pack.type =  ctypes.pointer(voice_pack_type)
    params_pack.data = voice_data

    write_result = dll.mec_write(ctypes.byref(mecObjPointer.contents), ctypes.byref(params_pack))
    print(write_result, 'write_result_code')

# 关闭视频音频流获取
def destroyVideo():
    print('enter destroyVideo!!!!!!!!!!')
    global download_continue_flag, query_flag, timeQuery
    download_continue_flag = False
    if 'mecObjPointer' in globals() and mecObjPointer is not None:
        print(ctypes.byref(mecObjPointer.contents), 'arg1')
        print(chl_id, 'arg2')
        destroy_result = dll.mec_chl_destroy(ctypes.byref(mecObjPointer.contents), chl_id)
        print(destroy_result,'destroy_result')
        if query_flag:
            query_flag = False
            if timeQuery:
                timeQuery.stop_query()

# 此处输入播放url
urlTest = ''
# 此处输入播放类型live/record/download
videoTypeTest = 'live'
# 此处输入视频文件下载至本地的路径,非下载默认填写''
foldPathTest = ''
getVideo(urlTest, videoTypeTest, foldPathTest)