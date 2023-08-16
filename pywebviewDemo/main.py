from distutils.log import debug
import webview
import json

# 函数定义
def open_file_dialog(window):  # 显示文件选择框函数
    file_types = ('Image Files (*.bmp;*.jpg;*.gif)', 'All files (*.*)')

    result = window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=True, file_types=file_types)
    print(result)

def get_elements(window):
    x = {
      "number": 1,
      "string": "2",
      "object": {"a": '1', "b": 2},
      "array": [1, 2, 3]
    }
    # inputArea = window.get_elements('#testPython')
    window.evaluate_js('window.test(%s,%d)'%(x, 2))
    # window.evaluate_js('window.test("1", "2")')

# 主进程执行部分
if __name__ == '__main__':
  window = webview.create_window(
      title = '测试',
      url = 'index.html',
      # resizable = False,    # 固定窗口大小
      text_select = False,    # 禁止选择文字内容
      # confirm_close = True,   # 关闭时提示
      # fullscreen = True,      # 全屏启动窗口
      # html = html
  )
  chinese = { # 添加中文关闭提示
      'global.quitConfirmation': u'确定关闭?',
  }
  # print('显示器列表', webview.screens)  # 获取屏幕信息
  # window.load_html('<h1>This is dynamically loaded HTML</h1>')
  webview.start(get_elements, window, debug = True) # localization = chinese
