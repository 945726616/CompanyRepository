import os
from ctypes import windll

# 调用动态库中的add函数
dll = windll.LoadLibrary('test.dll')
print(dll.funAdd(2, 2))

# 暂停程序，否则黑框会在程序运行结束后立即关掉
os.system('pause')