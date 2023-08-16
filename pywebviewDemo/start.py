from distutils.log import debug
import os
import webview
# 与c混合编程库
import ctypes

# 尝试定位引入的dll文件
_file = 'Dll1.dll'
_path = os.path.join(*(os.path.split(__file__)[:-1] + (_file,)))
_mod = ctypes.cdll.LoadLibrary(_path)


class Api():
    def addItem(self, item):
        print('Added item %s' % item)
        return item + 1

    def dllAddItem(self, item):
        result = _mod.funAdd(item[0], item[1])
        print('dllAddItem item %s' % item)
        return result

if __name__ == '__main__':
    api = Api()
    webview.create_window('PYwebview Demo', 'index.html', js_api=api, min_size=(600, 450)) #assets/index.html
    webview.start(debug = True)