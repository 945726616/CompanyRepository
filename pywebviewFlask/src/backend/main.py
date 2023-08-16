# import logging
import webview
import os
import threading
import time
import sys
import random

# from contextlib import redirect_stdout
# from io import StringIO
# from server import server

# logger = logging.getLogger(__name__)
class Api:
  # 设置品牌名称
  def setProjectName(self):
    response = 'vimtag'
    return response

if __name__ == '__main__':
  api = Api()

  gui_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'gui')
  web_path = os.path.join(gui_dir, 'index.html')

  window = webview.create_window('test', web_path, js_api=api,  min_size=(600, 450))
  webview.start(debug=True)