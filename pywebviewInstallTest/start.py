from distutils.log import debug
import os
import webview
# 与c混合编程库
import ctypes
import sys

def res_path(relative_path):
  """获取dll文件绝对路径"""
  try:
    base_path = sys._MEIPASS
  except Exception:
    base_path = os.path.abspath('.')
  return os.path.join(base_path, relative_path)

print(res_path('test.dll'))
# os.chdir(r'E:\\Git\\companyrepository\\pywebviewInstallTest\\loseDLL')
_mod = ctypes.cdll.LoadLibrary('test.dll')

# 尝试定位引入的dll文件
# _file = 'static\\Dll1.dll'
# # 先获取当前运行时临时目录路径
# if getattr(sys, 'frozen', None):
#     basedir = sys._MEIPASS
# else:
#     basedir = os.path.dirname(__file__)
# # 使用 os.path.join() 方法，将 临时目录路径与文件相对路径拼接
# _path = os.path.join(basedir, _file)
# print(_path)
# 使用python3.11 需要添加dll至搜索目录
# os.add_dll_directory(_path)
# _path_test = 'static'
# absPath = os.path.dirname(os.path.abspath(__file__))
# print(absPath, 'absPath')
# fileList = os.walk('.')
# print(fileList)
# _path = os.path.join(*(os.path.split(__file__)[:-1] + (_file,)))
# os.system("pause")
# _mod = ctypes.cdll.LoadLibrary(_path)
# os.system("pause")


class Api():
    def addItem(self, item):
        print('Added item %s' % item)
        return item + 1

    def dllAddItem(self, item):
        result = _mod.funAdd(item[0], item[1])
        print('dllAddItem item %s' % item)
        return result
        # return _path

if __name__ == '__main__':
    api = Api()
    webview.create_window('PYwebview Demo', './static/index.html', js_api=api, min_size=(600, 450)) #assets/index.html
    webview.start(debug = True)