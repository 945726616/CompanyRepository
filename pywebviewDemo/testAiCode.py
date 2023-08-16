import cv2
import base64
import webview
import numpy as np
import pyaudio
import wave


# 读取 YUV 数据
with open('test.yuv', 'rb') as f:
    yuv_data = f.read()

# # 将 YUV 转换为 RGB
# width = 640
# height = 480
# # 将yuv数据格式从bytes转换numpy.ndarray格式才能进行reshape方法
# yuv = np.frombuffer(yuv_data, dtype=np.uint8)
# # 使用reshape方法将数组重新排列
# yuv = yuv.reshape((height * 3 // 2, width))
# # 转换颜色空间方法将yuv420格式(注意该方法只能转换yuv420格式其他yuv格式需要更换对应的方法)转换成bgr格式
# yuv = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR_I420)

# # 将RGB格式的图像编码为base64字符串
# retval, buffer = cv2.imencode('.jpg', yuv)
# # 添加base64头部
# jpg_as_text = 'data:image/jpeg;base64,'
# # 添加base64编码部分
# jpg_as_text += base64.b64encode(buffer).decode('utf-8')
# # 测试打印base64字符串
# print(jpg_as_text)
data_url = 'data:image/jpeg;base64,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'

class Api:
    def getPlayUrl(self, url):
        print(url)
        testEvaluateJs(url)
        return 'success'

def testEvaluateJs(url):
    print(url, '在该方法中使用evaluate')
    evaluate_js(window)
# 定义evaluate_js方法,调用html文件中的对应方法并传递图片参数
def evaluate_js(window):
    # window.evaluate_js(f'setImage("{jpg_as_text}")')
    # window.evaluate_js(f'setImage("{yuv_data}")') + this +
    # test = yuv_data.decode('utf-8')
    print('进入函数')
    window.evaluate_js(f'this.window.setImgData("{data_url}")')
# 加载网页并在其中嵌入 base64 编码的图像数据
api = Api()
window = webview.create_window('YUV to Image Example', 'http://192.168.3.181:8080/vimtag/', js_api=api)
webview.start(window, debug = True)