import ctypes
from mec_struct import *
import base64
import webview
import pyaudio
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
web_path = os.path.join(dir_path, 'index.html')
# 引入动态链接库
dll = ctypes.cdll.LoadLibrary(lib_path)
screens = webview.screens
print('Available screens are: ' + str(screens[0]))

# 播放引擎创建标识 false：当前无播放引擎需要创建播放引擎 true：有播放引擎无需创建
createPlayerFlag = False
# 销毁播放通道标识 flase：当前无播放通道不需要销毁 true：当前有播放通道需要销毁
destroyChannelFlag = False
# 下载标识
download_flag = True
# 查询循环标识
query_flag = True

# 定义播放器类，包含队列数据检测，将新获取的数据传递到音频处理线程中去
class AudioPlayer(threading.Thread):
    def __init__(self):
        super(AudioPlayer, self).__init__()
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(format=pyaudio.paInt16,
                                  channels=1,
                                  rate=16000,
                                  output=True,
                                  frames_per_buffer=2048)
        self.audio_queue = queue.Queue()

    def run(self):
        self.is_running = True
        while True:
            audio_data = self.audio_queue.get()
            if audio_data is None:
                break
            self.stream.write(audio_data)

        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()

    def start_recording(self, voice_chl_id):
        self.input_stream = self.p.open(format=pyaudio.paInt16,
                                        channels=1,
                                        rate=16000,
                                        input=True,
                                        frames_per_buffer=2048)
        with open("recording.pcm", "wb") as pcm_file:
            while True:
                audio_data = self.input_stream.read(2048)
                # 将音频数据传入到队列中
                self.audio_queue.put(audio_data)
                # 从队列中获取到数据并写入文件进行测试
                pcm_file.write(audio_data)
                # 调用mec_write方法将数据发送到服务器
                print(voice_chl_id, 'class_get_voice_chl_id')
                useMecWrite(audio_data, voice_chl_id)

    def stop_recording(self):
        self.is_running = False
        # 添加None元素来停止播放和录音
        self.audio_queue.put(None)
        if hasattr(self, 'input_stream'):
            self.input_stream.stop_stream()
            self.input_stream.close()

    def play_audio(self, audio_data):
        self.audio_queue.put(audio_data)
# 开启声音线程
def create_audio_thread():
    global player
    # 实例化音频播放线程
    player = AudioPlayer()
    # 添加音频输入输出设备检测部分
    try:
        device_count = player.p.get_device_count()
        print("已检测到音频输入输出设备")
    except AttributeError:
        print("未检测到音频输入输出设备，不执行音频操作")
    except Exception as e:
        # 截获 pyaudio 报错并执行相应操作
        print("发生错误:", e)
    finally:
        player.p.terminate()
    # player.terminate()
    # 启动音频播放线程
        player.start()
# 销毁声音线程
def destroy_audio_thread():
    global player
    player.stop_recording()

# 调用动态库方法，用于解码mec_ctrl方法请求query的结果
# json_get_child_string(query_event_struct.contents.data, query_str_len, ctypes.c_char_p(query_str_array[i].encode('utf-8')), value_ptr)
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
            query_event_struct = dll.mec_ctrl(ctypes.byref(mecobj_pointer.contents), chl_id, ctypes.byref(query_method), ctypes.byref(query_params))
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
    print('on_pack开始')
    global player
    print(refer, 'test_on_pack_refer')
    data_major = pack.contents.type.contents.major.data
    # 传递两种数值 video/audio 其中video的width/height是正常比例  audio的width/height含义为文件采样率16000Hz/采样深度为16bit
    # print(data_major, 'major')
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
            # print('此处弹出报错：', e)

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
        print(yuv_width, 'width', yuv_height, 'height')
        send_video_data(window, yuv_str, yuv_width, yuv_height)
        print('on_pack结束')


# 通道事件回调
def test_on_event( mec, evt, refer):
    print('on_event开始')
    # 将获取到的evt参数传递出去，进行相应的判断和处理， 如果在该回调函数中调用则会出现死锁现象
    get_event_params(evt)
    print('on_event结束')

# 本地搜索回调实例
def on_recv_json_msg(ref, msg_type, msg_json, remote_addrin):
    if ref is None:
        return 0
    send_local_device_info(window, msg_json.contents.data)
    return 0


# 定义pywebview的api方法
class Api:
    # 获取最终加载地址并重载
    def reloadUrl(self, url):
        print(url, 'reloadUrl')
        window.load_url(url)
    # 调用创建播放引擎方法
    def createPlayerEngine (self):
        global createPlayerFlag
        print('enter createPlayerEngine')
        create_player_engine()
        createPlayerFlag = True
    # 获取视频播放链接
    def getPlayUrl(self, url, videoType):
        global destroyChannelFlag, createPlayerFlag, videoUrl
        # 先尝试注销当前存在的播放管道，确保播放时是新管道播放
        # destroy_video_channel()
        for i in range(50):
            print(destroyChannelFlag, 'destroyChannelFlag')
            print(createPlayerFlag, 'createPlayerFlag')
            if destroyChannelFlag == False and createPlayerFlag:
                print(url, 'api传入的播放地址')
                videoUrl = url
                getVideo(url, videoType, '')
                break
        # return 'success'
        if destroyChannelFlag == False and createPlayerFlag == False:
            createPlayerFlag()
    # 声音线程开启
    def voice_open(self):
        create_audio_thread()
    # 声音线程关闭
    def voice_close(self):
        destroy_audio_thread()
    # 获取回放
    def getRecordPlay(self):
        recordPlay()
    def downloadVideo(self):
        global download_flag, query_flag
        print(download_flag, 'download_flag')
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
        print('enter destroy_video_channel!!!!!!!!!!!!!!!!!')
        destroy_video_channel()
        # destroyVideo()
    # 离开播放页面
    def leavePlayPage(self):
        destroyVideo()
    # 对讲录音开始
    def startGetVoice(self, voiceUrl):
        # 调用对讲时先开启音频线程
        create_audio_thread()
        print('enter startGetVoice', voiceUrl)
        startIntercom(voiceUrl)
    # 对讲录音结束
    def endGetVoice(self):
        print('enter endGetVoice')
        endIntercam()
    # 打开文件夹选择器用于选择视频下载地址
    def select_folder(self):
        folder_path = webview.windows[0].create_file_dialog(webview.FOLDER_DIALOG)
        print(folder_path)
        return folder_path
    # 点击截图下载图标，让用户选择图片存放路径并下载
    def snapshotDownload(self, snapshotName, snapshotUrl):
        print(snapshotName, 'snapshotName')
        print(snapshotUrl, 'snapshotUrl')

        response = requests.get(snapshotUrl)
        print(response)

        file_path = webview.windows[0].create_file_dialog(webview.FOLDER_DIALOG)
        print(file_path, 'file_path')
        save_path = os.path.join(file_path[0], snapshotName)
        print(save_path, 'save_path')

        # 保存图片到指定路径
        with open(save_path, 'wb') as f:
            f.write(response.content)
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
        global query_param, downloadContinueFlag
        downloadContinueFlag = True
        print('enter continue')
        print(query_param.key_video_frame_counts, 'query_param.key_video_frame_counts')
        return query_param.key_video_frame_counts

    # 点击本地搜索按钮
    def local_search(self):
        # 初始化message结构体
        local_search_msg = message()
        local_search_msg.size = 1024
        local_search_msg.from_address = 0x1231
        local_search_msg.from_handle = 1
        local_search_msg.to = 0x20500000
        local_search_msg.to_handle = 0
        msg_set_version(local_search_msg, struct.unpack('<H', b'\x01\x00')[0] == 1, msg_sizeof_header(len("ProbeRequest") - 1), 0)
        msg_set_type(local_search_msg, "ProbeRequest", len("ProbeRequest") - 1)
        local_search_msg.type_magic = 0x2bdbce08
        print(local_search_msg.type.decode(), 'type')
        pbuf = mpack_buf()
        mpbuf_init(pbuf, msg_get_data(local_search_msg), local_search_msg.size - msg_sizeof_header(len("ProbeRequest") - 1))
        msg_set_data_base_addr(local_search_msg, id(pbuf.index))
        # res_msg = dll.msg_save_finish(ctypes.byref(local_search_msg))
        # print(res_msg, 'res_msg')

        # 初始化 mmbc_create_param 调用本地搜索中的handle参数需要使用mmbc_create方法创建
        param = mmbc_create_param()
        on_recv_json_msg_c = mmbc_user_on_recv_json_msg(on_recv_json_msg)
        param_def_list = pack_def_list()

        # broadcast_addr
        broadcast_addr_param = len_str()
        broadcast_addr_param_str = "255.255.255.255"
        broadcast_addr_param.data = ctypes.c_char_p(broadcast_addr_param_str.encode('utf-8'))
        broadcast_addr_param.len = len(broadcast_addr_param.data)

        # multicast_addr
        multicast_addr_param = len_str()
        multicast_addr_param_str = "239.255.255.0"
        multicast_addr_param.data = ctypes.c_char_p(multicast_addr_param_str.encode('utf-8'))
        multicast_addr_param.len = len(multicast_addr_param.data)

        param.broadcast_addr = broadcast_addr_param
        param.multicast_addr = multicast_addr_param
        param.port = 3703
        param.on_recv_json_msg = on_recv_json_msg_c
        param.refer = ctypes.cast(ctypes.pointer(param), ctypes.c_void_p)
        param.def_list = ctypes.pointer(param_def_list)
        param.disable_listen = 1
        dll.mmbc_create.restype = ctypes.c_void_p
        mmbc_handle = dll.mmbc_create(ctypes.byref(param))
        print(mmbc_handle)
        # test = dll.mmbc_send_msg(mmbc_handle, None, ctypes.byref(local_search_msg))
        msg_data = len_str()
        msg_data_str = '{"version": 0, "flag": 0, "age": 0, "size": 112, "check_sum": 0, "flag_ex": 0, "from": 0, "to": 0, "from_handle": 0, "to_handle": 0, "data_base_addr": 0, "type_magic": 0}'
        msg_data.data = ctypes.c_char_p(msg_data_str.encode('utf-8'))
        msg_data.len = len(msg_data.data)

        msg_type = len_str()
        msg_type_str = "ProbeRequest"
        msg_type.data = ctypes.c_char_p(msg_type_str.encode('utf-8'))
        msg_type.len = len(msg_type.data)
        dll.mmbc_send_data.argtypes = [ctypes.c_void_p, ctypes.POINTER(sockaddr_in), ctypes.POINTER(len_str), ctypes.POINTER(len_str)]
        test = dll.mmbc_send_data(mmbc_handle, None, ctypes.byref(msg_type), ctypes.byref(msg_data))
        print(test)

    # 全屏播放按钮
    def fullScreen(self):
        print(window.width, 'window.width')
        print(window.height, 'window.height')
        # window.toggle_fullscreen()
        # retrunData = {'width': webview.screens[0].width, 'height': webview.screens[0].height}
        # return retrunData
# 定义evaluate_js方法
def escape_string(s):
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace("'", "\\'")
    return s
# 调用html文件中的对应方法并传递yuv字符串及相关参数
def send_video_data(window, jpg_as_text, yuv_width, yuv_height):
    if jpg_as_text:
        window.evaluate_js(f'window.setImgData("{jpg_as_text}", "{yuv_width}", "{yuv_height}")')
# 通讯方法 从web项目通知客户端获取回放数据
def send_record_play(window):
    window.evaluate_js(f'window.playRecord()')
# 通讯方法 从web项目通知客户端下载回放内容
def send_download_video(window):
    window.evaluate_js(f'window.downloadVideo()')
# 通讯方法 从web项目通知客户端进行回放/下载等数据信息查询
def send_query_video(window):
    window.evaluate_js(f'window.queryVideo()')
# 定义传递query查询到的数据方法
def send_query_data(window, data):
    if data:
        # 使用字典类型生成 JavaScript 对象字面量
        js_obj = "{{{}}}".format(", ".join(["'{}': '{}'".format(k, escape_string(v)) for k, v in data.items()]))
        window.evaluate_js(f'window.setQueryData({js_obj})')
# 传递本地搜索获取的设备信息
def send_local_device_info(window, data):
    if data:
        data_str = data.decode('utf-8')
        window.evaluate_js(f'window.setLocalDeviceInfo({data_str})')

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

    download_result = dll.mec_ctrl( ctypes.byref(mecobj_pointer.contents), chl_id, ctypes.byref(download_method), ctypes.byref(donwnload_chl_params) )
    send_query_video(window)
    print(query_flag, 'download_test query_flag')
    while query_flag:
        query_data = timeQuery.get_result()
        if query_data and len(query_data):
            print(query_data[0], 'query_data', type(query_data[0]))
            send_query_data(window, query_data[0])
        time.sleep(1)
    # videoTypeFlag = 'query'

# 获取event回调中的关键参数
def get_event_params(evt):
    global chl_id, download_flag, videoUrl, videoTypeFlag
    chl_id = evt.contents.chl.id
    print(evt.contents.chl.id, '获取chl_id')
    print(evt.contents.chl.type.data, '获取chl_data')
    print(evt.contents.type.data,'type')
    print(evt.contents.code.data, 'code')
    # 此处添加错误判断，部分错误需要重新执行

    # 在type属性为link且满足code。data为linked和videoTypeFlag为record的时候为录像管道调用mec_ctrl方法并使用该管道chl_id（全局）
    if evt.contents.type.data == b'link':
        if evt.contents.code.data == b'linked':
            if videoTypeFlag == 'record':
                print('enter recordPlay func')
                send_record_play(window)
            elif videoTypeFlag == 'download':
                download_flag = True
                print('enter download', type(window))
                print(window, 'window_inner')
                send_download_video(window)
    elif evt.contents.type.data == b'close':
        if evt.contents.code.data == b'network.connect.failed':
            getVideo(videoUrl, videoTypeFlag, '')

# 定义播放参数
str_desc = "{container:{url:'com.vimtag.vimtaga'},canvas:{type:'yuv/420p',fps:25,padding:{align:8}}, module:{rtdp:{back_local_log:1}}}"
str_params = "{key:'data:application/octet-stream;base64,SoVpDLcrbd0693vy5mmgOXdmqNkRUle3oY/JA5MZlFJ60FjZQgW8zL2kvKzYiHCbo1PpZdiXr013t6jWHQwUxyZpan/2zWhVrJ1B+/sL/mci9GKjg8OQDhWiebUCbTl71qZzCdJX/S0k3SC4Y4kjLsuODwxH/ROTD4eGBF+w54Q',canvas:{type:'yuv/420p', width:800, height:600, vertical_reverse:0, fps:25,padding:{align:8}}}"


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

# 定义创建播放器引擎 mec_create方法
def create_player_engine ():
    global mecobj_pointer, desc

    # 调用c语言函数
    dll.mec_create.restype = ctypes.POINTER(mec_desc)
    mecobj_pointer = dll.mec_create( ctypes.byref(desc), ctypes.byref(params) )
    print(mecobj_pointer, 'mec_create_return')

# 通过播放地址获取视频数据
def getVideo (playUrl, videoType, download_folder_path):
    global mecobj_pointer, videoTypeFlag, playUrlGlobal, downloadFolderPathGlobal, downloadContinueFlag, query_flag, destroyChannelFlag
    videoTypeFlag = videoType

    # if destroyFinishFlag == False:
    #     destroyFinishFlag = True
    #     create_player_engine()

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
        if not downloadContinueFlag:
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
    time.sleep(1)
    res_chl_create = dll.mec_chl_create( ctypes.byref(mecobj_pointer.contents), ctypes.byref(chl_params) )
    destroyChannelFlag = True

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
    print(ctypes.byref(mecobj_pointer.contents), 'record_mec')
    print(ctypes.byref(record_method), 'record_method')
    print(ctypes.byref(record_params), 'record_params')

    # mec_ctrl方法调用
    record_result = dll.mec_ctrl( ctypes.byref(mecobj_pointer.contents), chl_id, ctypes.byref(record_method), ctypes.byref(record_params) )
    print(record_result, 'record_result')
    send_query_video(window)
    print(query_flag, 'record query_flag')
    while query_flag:
        query_data = timeQuery.get_result()
        if query_data and len(query_data):
            print(query_data[0], 'query_data', type(query_data[0]))
            send_query_data(window, query_data[0])
        time.sleep(1)

# 对讲功能调用
def startIntercom(voiceUrl):
    print('enter start intercom')
    # 开始录音和播放
    voice_params = len_str()
    voice_params_str = "{src:[{url: 'data://',type: 'audio/pcm'}], gaec:1, gvc:0, gns:1, dst:[{url:'" + voiceUrl + "'}]}"
    voice_params.data = ctypes.c_char_p(voice_params_str.encode('utf-8'))
    voice_params.len = len(voice_params.data)

    voice_chl_create = dll.mec_chl_create( ctypes.byref(mecobj_pointer.contents), ctypes.byref(voice_params) )
    print(voice_chl_create, 'voice_chl_create_return')
    player.start_recording(voice_chl_create)

# 对讲功能关闭
def endIntercam():
    print('enter end intercom')
    # 停止录音和播放
    destroy_audio_thread()

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
    # params_pack.extra_data.len = 0

    write_result = dll.mec_write(ctypes.byref(mecobj_pointer.contents), ctypes.byref(params_pack))
    print(write_result, 'write_result_code')

# 注销当前播放通道（不注销播放器引擎）
def destroy_video_channel ():
    global mecobj_pointer, chl_id, destroyChannelFlag
    print('注销当前播放通道')
    if 'mecobj_pointer' in globals() and mecobj_pointer is not None:
        if 'chl_id' in globals() and chl_id is not None:
            # print('管道id', chl_id, type(chl_id))
            # destroyVideoChannel = dll.mec_chl_destroy(ctypes.byref(mecobj_pointer.contents), chl_id)
            # print('调用注销播放通道完成', destroyVideoChannel)
            print('开始注销引擎')
            destroyVideoEngine = dll.mec_chl_destroy(ctypes.byref(mecobj_pointer.contents), chl_id)
            print('调用注销播放引擎完成',destroyVideoEngine)
            destroyChannelFlag = False
            # create_player_engine()

# 注销播放器引擎和通道方法
def destroyVideo():
    print('注销播放器引擎方法')
    global downloadContinueFlag, query_flag, timeQuery, chl_id, createPlayerFlag, destroyChannelFlag
    downloadContinueFlag = False
    if 'mecobj_pointer' in globals() and mecobj_pointer is not None:
        print(ctypes.byref(mecobj_pointer.contents), 'arg1')
        print(chl_id, 'arg2')
        destroy_result = dll.mec_destroy(ctypes.byref(mecobj_pointer.contents))
        print(destroy_result,'destroy_result')
        createPlayerFlag = False
        destroyChannelFlag = False
        if query_flag:
            query_flag = False
            if timeQuery:
                timeQuery.stop_query()

# 窗口关闭时注销的进程
def on_closed():
    global query_flag, downloadFolderPathGlobal, timeQuery
    query_flag = False
     # 列出所有线程和进程
    # print('Threads:', threading.enumerate())
    # print('Processes:', subprocess.check_output(['ps', 'aux']))
    try:
        # 以下内容为线程注销
        if timeQuery:
            timeQuery.stop_query()
        destroy_audio_thread()
        destroyVideo()
        window.destroy()
    except Exception as e:
        print(f"Exception caught in thread {threading.current_thread().name}: {e}")
    # print('pywebview window is closed')
api = Api()
def on_page_loaded():
    print("页面加载完成，可以执行全屏操作")
    time.sleep(10)
    window.toggle_fullscreen()
# 加载网页并在其中嵌入 base64 编码的图像数据  http://192.168.3.181:8080/vimtag/  http://45.120.103.36:7080/dcm/version/repo/website/pkg-website-v10.9.1.2309051030/index.html?m=vimtag 
window = webview.create_window('Vimtag', web_path, js_api=api, width=webview.screens[0].width, height=webview.screens[0].height)
window.events.closed += on_closed
# 注册页面加载完成事件的回调函数

# window.events.loaded += on_page_loaded
webview.start(debug = True)