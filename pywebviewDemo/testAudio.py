import pyaudio
import struct

# 定义采样参数
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000

# 打开PCM文件
with open('5.pcm', 'rb') as pcmfile:
    pcm_data = pcmfile.read()

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
