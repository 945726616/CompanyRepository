import ctypes
from ctypes import *
import cv2
import base64
import numpy as np
import logging
import webview
import pyaudio


# 调用动态库中的add函数
dll = cdll.LoadLibrary(r'/Users/mac1/Desktop/testPy/libmmec.debug.dylib')

#定义全局常量
MEC_PACK_EXTRA_DATA_BUF_SIZE = 120

# 定义pywebview的api方法
class Api:
    def getPlayUrl(self, url):
        print(url)
        testEvaluateJs(url)
        return 'success'

def testEvaluateJs(url):
    print(url, '在该方法中使用evaluate')
    getVideo(url)

api = Api()
# 加载网页并在其中嵌入 base64 编码的图像数据
window = webview.create_window('YUV to Image Example', 'testAudio.html', js_api=api)

# 定义结构体类型
class len_str(ctypes.Structure):
    _fields_ = [("len", ctypes.c_ulong), 
                ("data", ctypes.c_char_p)]

# mec_event结构
class chl_struct(ctypes.Structure):
	_fields_ = [("id", ctypes.c_long),
				("type", len_str),
				("url", len_str)]

class mec_event(ctypes.Structure):
    _fields_ = [("magic", ctypes.c_char * sizeof(ctypes.c_long)),
                ("type", len_str),
                ("status", ctypes.c_long),
                ("code", len_str),
                ("chl", chl_struct),
                ("data", ctypes.c_void_p)]

# mec_pack结构
class content(ctypes.Structure):
    _fields_ = [
        ('left', ctypes.c_ulong),
        ('top', ctypes.c_ulong),
        ('width', ctypes.c_ulong),
        ('height', ctypes.c_ulong)
    ]

class planer(ctypes.Structure):
    _fields_ = [
        ('line_bytes', ctypes.c_long),
        ('size', ctypes.c_long),
        ('line_counts', ctypes.c_long)
    ]

class ext(ctypes.Structure):
    _fields_ = [
        ('len', ctypes.c_ulong),
        ('data', ctypes.POINTER(ctypes.c_ubyte))
    ]

class video(ctypes.Structure):
	_fields_ = [
	    ('radians', ctypes.c_long),
	    ('width', ctypes.c_ulong),
	    ('height', ctypes.c_ulong),
	    ('content', content),
	    ('planers_counts', ctypes.c_ulong),
	    ('planers', (planer * 4)),
        ('ext_counts', ctypes.c_ulong),
        ('ext', (ext * 4))
    ]

class audio(ctypes.Structure):
    _fields_ = [
        ('channels', ctypes.c_ulong),
        ('sample_rates', ctypes.c_ulong),
        ('sample_bits', ctypes.c_ulong),
        ('ext_counts', ctypes.c_ulong),
        ('ext', (ext * 4))
    ]

class Format(ctypes.Union):
    _fields_ = [
        ('video', video),
        ('audio', audio)
    ]

class mec_pack_type(ctypes.Structure):
	_fields_ = [
		('changed_seq', ctypes.c_ulong),
		('major', len_str),
		('sub', len_str),
		('format', Format)
	]

class data(ctypes.Structure):
	_fields_ = [
		('len', ctypes.c_ulong),
		('data', ctypes.POINTER(ctypes.c_ubyte))
	]


class mec_pack(ctypes.Structure):
	_fields_ = [("chl_id", c_long),
                ("is_stop_play", c_ulong),
                ("frame_size", c_ulong),
                ("type", POINTER(mec_pack_type)),
                ("loop_handle", c_ulong),
                ("frame_handle", c_ulong),
                ("extra_data", len_str),
                ("extra_data_buf", c_char * MEC_PACK_EXTRA_DATA_BUF_SIZE),
                ("time_stamp", c_ulong),
                ("sample_id", c_ulong),
                ("ab_time", c_ulonglong),
                ("data", data),
                ("flag", c_ubyte),
                ("tag", c_ubyte),
                ("reserved", c_ubyte * 2)]

# 定义回调函数原型
on_pack_ptr = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(mec_pack), ctypes.c_void_p)
on_event_ptr = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(mec_event), ctypes.c_void_p)

class mec_desc(ctypes.Structure):
    _fields_ = [
                ("on_event", on_event_ptr),
                ("on_pack", on_pack_ptr),
                ("refer", ctypes.c_char_p),
                ("params", len_str),
                ]

str_desc = "{container:{url:'com.vimtag.vimtaga'},canvas:{type:'yuv/420p',fps:25,padding:{align:8}}, module:{rtdp:{back_local_log:1}}}";
str_params="{key:'data:application/octet-stream;base64,SoVpDLcrbd0693vy5mmgOXdmqNkRUle3oY/JA5MZlFJ60FjZQgW8zL2kvKzYiHCbo1PpZdiXr013t6jWHQwUxyZpan/2zWhVrJ1B+/sL/mci9GKjg8OQDhWiebUCbTl71qZzCdJX/S0k3SC4Y4kjLsuODwxH/ROTD4eGBF+w54Q',canvas:{type:'yuv/420p', width:1920, height:1080, vertical_reverse:0, fps:25,padding:{align:8}}}"

# 定义python中的回调函数
# 定义evaluate_js方法,调用html文件中的对应方法并传递图片参数
def send_video_data(window, jpg_as_text):
    if jpg_as_text:
        window.evaluate_js(f'window.setImgData("{jpg_as_text}")')
# 视频音频会调
def test_on_pack( mec, pack, refer):
    print("get major")
    data_major = pack.contents.type.contents.major.data
    # 传递两种数值 video/audio 其中video的width/height是正常比例  audio的width/height含义为文件采样率16000Hz/采样深度为16bit
    print(data_major)
    if data_major == b'audio':
        audio_data = pack.contents.data.data
        byte_ptr = ctypes.cast(audio_data, ctypes.POINTER(ctypes.c_ubyte))
        byte_count = pack.contents.data.len
        pcm_data = bytes(byte_ptr[:byte_count])
        #将数据写入test_pcm_audio.pcm文件内
        # with open('test_pcm_audio.pcm', 'ab') as f:
        #     f.write(pcm_data)
        # 初始化pyaudio
        p = pyaudio.PyAudio()

        # 打开音频流
        stream = p.open(format=pyaudio.paInt16, # 采样深度
                        channels=1, # 声道数
                        rate=16000, # 采样率
                        output=True)

        # 播放PCM音频数据
        stream.write(pcm_data)

        # 关闭音频流
        stream.stop_stream()
        stream.close()

        # 终止pyaudio
        p.terminate()
        return
    print("get height")
    yuv_height = pack.contents.type.contents.format.video.height
    print(yuv_height)
    print("get width")
    yuv_width = pack.contents.type.contents.format.video.width
    print(yuv_width)
    print("get yuv_data")
    yuv_data = pack.contents.data.data
    byte_ptr = ctypes.cast(yuv_data, ctypes.POINTER(ctypes.c_ubyte))
    byte_count = pack.contents.data.len 
    byte_array = bytes(byte_ptr[:byte_count])

    # 写入数据
    # with open('output_mac.yuv', 'ab') as f:
    #     f.write(byte_array)

    # 将yuv数据格式从bytes转换numpy.ndarray格式才能进行reshape方法
    yuv = np.frombuffer(byte_array, dtype=np.uint8)
    # 使用reshape方法将数组重新排列
    yuv = yuv.reshape((yuv_height * 3 // 2, yuv_width))
    # 转换颜色空间方法将yuv420格式(注意该方法只能转换yuv420格式其他yuv格式需要更换对应的方法)转换成bgr格式
    yuv = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR_I420)

    # 将RGB格式的图像编码为base64字符串
    retval, buffer = cv2.imencode('.jpg', yuv)
    # 添加base64头部
    jpg_as_text = 'data:image/jpeg;base64,'
    # 添加base64编码部分
    jpg_as_text += base64.b64encode(buffer).decode('utf-8')
    send_video_data(window, jpg_as_text)

# 通道事件回调
def test_on_event( mec, evt, refer):
    print("get event")
    print(evt.contents.type.data)

#构造desc参数
desc = mec_desc();
desc.on_pack = on_pack_ptr(test_on_pack);
desc.on_event = on_event_ptr(test_on_event)
desc.params = len_str();
desc.params.data = ctypes.c_char_p(str_desc.encode('utf-8'));
desc.params.len = len(desc.params.data);

# 构造params参数
params = len_str();
params.data = ctypes.c_char_p(str_params.encode('utf-8'));
params.len = len(params.data);
#null_func_ptr = ctypes.cast(None, ctypes.c_void_p)

def getVideo (playUrl):
    # 调用c语言函数
    dll.mec_create.restype = ctypes.POINTER(mec_desc)
    mecobj_pointer = dll.mec_create( ctypes.byref(desc), ctypes.byref(params) );
    # mecobj_struct = mec_desc.from_address(ctypes.addressof(mecobj.contents))
    # print(mecobj_struct.on_event);

    # 调用mec_chl_create方法 'rtdp://192.99.39.134:6030/live/1jfiegbq2lpia_p0_QUGODZTNRCLZ'
    chl_params = len_str()
    chl_params_str = "{src:[{url:'" + playUrl + "', bitrate:{min:65536, max:524288, init:131072, type:'all', keeplive_interval:6000}}], dst:[{url:'data://', type:'audio/pcm,video/yuv/420sp', keeplive_interval:6000}]}"
    chl_params.data = ctypes.c_char_p(chl_params_str.encode('utf-8'))
    chl_params.len = len(chl_params.data)
    res_chl_create = dll.mec_chl_create( ctypes.byref(mecobj_pointer.contents), ctypes.byref(chl_params) )
    print(res_chl_create)

webview.start(debug = True)
