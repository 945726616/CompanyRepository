import os
import webview
# 与c混合编程库
from ctypes import *

"""
An example of serverless app architecture
"""


class Api():
    def addItem(self, title):
        print('Added item %s' % title)

    def removeItem(self, item):
        print('Removed item %s' % item)

    def editItem(self, item):
        print('Edited item %s' % item)

    def toggleItem(self, item):
        print('Toggled item %s' % item)

    def toggleFullscreen(self):
        webview.windows[0].toggle_fullscreen()


if __name__ == '__main__':
    open_cv_dll = CDLL('./yuvPython.dll')
    nResult = open_cv_dll.Double(8)
    print(nResult)
    add = open_cv_dll.add(4, 8)
    print(add)
    api = Api()
    webview.create_window('Todos magnificos', 'assets/index.html', js_api=api, min_size=(600, 450))
    webview.start()