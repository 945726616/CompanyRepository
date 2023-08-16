# 定义基础structure内容
import ctypes
import os
import struct

# 定义全局变量
MEC_PACK_EXTRA_DATA_BUF_SIZE = 120
MSG_VERSION_MASK_BIG_ENDIAN = 0x80    # b10000000
MSG_VERSION_MASK_HEADER_SIZE = 0x7c   # b01111100 , value directly always 4 bytes align
MSG_VERSION_MASK_ID = 0x03            # b00000011

# 定义通用结构体len_str
class len_str(ctypes.Structure):
    _fields_ = [("len", ctypes.c_ulong), 
                ("data", ctypes.c_char_p)]

# 定义sockaddr_in
class sockaddr_in(ctypes.Structure):
    _fields_ = [
        ("sin_family", ctypes.c_ushort),
        ("sin_port", ctypes.c_ushort),
        ("sin_addr", ctypes.c_ulong),
        ("sin_zero", ctypes.c_char * 8)]
# 定义message
class message(ctypes.Structure):
    _fields_ = [
        ("version", ctypes.c_uint8),
        ("flag", ctypes.c_uint8),
        ("age", ctypes.c_uint16),
        ("size", ctypes.c_uint32),
        ("check_sum", ctypes.c_uint32),
        ("flag_ex", ctypes.c_uint32),
        ("from_address", ctypes.c_int32),
        ("to", ctypes.c_int32),
        ("from_handle", ctypes.c_int32),
        ("to_handle", ctypes.c_int32),
        ("data_base_addr", ctypes.c_uint64),
        ("type_magic", ctypes.c_uint32),
        ("type", ctypes.c_char * 4)]
# 定义message结构体相关的宏
# 定义 msg_sizeof_header 函数
def msg_sizeof_header(type_len):
    return ctypes.sizeof(message) + ((type_len) & 0xfffffffc)
# 定义 msg_set_version 函数
def msg_set_version(msg, is_big_endian, header_size, id):
    version = ((is_big_endian) << 7) | (header_size & MSG_VERSION_MASK_HEADER_SIZE) | (id & MSG_VERSION_MASK_ID)
    msg.version = version & 0xff  # 将结果截断为 8 位无符号整数
# 定义 msg_set_type 宏
def msg_set_type(msg, type_str, type_str_len):
    # 将 type_str_len 对齐到 4 的倍数
    type_str_len = (type_str_len + 3) & ~3
    # 获取 msg.type 的 ctypes 指针
    type_ptr = ctypes.cast(msg.type, ctypes.POINTER(ctypes.c_uint32))
    # 计算要填充为 0 的字节数
    padding = 4 - type_str_len % 4
    # 将多余部分填充为 0
    if padding < 4:
        ctypes.memset(ctypes.addressof(type_ptr[type_str_len // 4]), 0, padding)
    # 复制 type_str 到 msg.type 中
    ctypes.memmove(msg.type, type_str.encode(), type_str_len)
# 定义 msg_get_header_size 宏
msg_get_header_size = lambda msg: msg.version & MSG_VERSION_MASK_HEADER_SIZE
# 定义 msg_get_data 宏
def msg_get_data(msg):
    header_size = msg_get_header_size(msg)
    char_ptr_type = ctypes.POINTER(ctypes.c_char)
    msg_addr = ctypes.addressof(msg)
    data_ptr_int = msg_addr + header_size
    data_ptr = ctypes.cast(data_ptr_int, char_ptr_type)
    return data_ptr

# 定义函数指针类型 mmbc_user_on_recv_msg
mmbc_user_on_recv_msg = ctypes.CFUNCTYPE(
    ctypes.c_long,
    ctypes.c_void_p,
    ctypes.POINTER(message),
    ctypes.POINTER(sockaddr_in))
# 定义函数指针类型 mmbc_user_on_recv_json_msg
mmbc_user_on_recv_json_msg = ctypes.CFUNCTYPE(
    ctypes.c_long,
    ctypes.c_void_p,
    ctypes.POINTER(len_str),
    ctypes.POINTER(len_str),
    ctypes.POINTER(sockaddr_in))
# 定义结构体 pack_def_list, pack_def 和 pack_field
class pack_def(ctypes.Structure):
    pass

class pack_field(ctypes.Structure):
    pass

class in_list(ctypes.Structure):
    _fields_ = [
        ("next", ctypes.POINTER(pack_def)),
        ("prev", ctypes.POINTER(pack_def))
    ]

class fields(ctypes.Structure):
    _fields_ = [
        ("counts", ctypes.c_ulong),
        ("list", ctypes.POINTER(pack_field))
    ]

class in_def(ctypes.Structure):
    _fields_ = [
        ("next", ctypes.POINTER(pack_field)),
        ("prev", ctypes.POINTER(pack_field))
    ]

class counts(ctypes.Structure):
    _fields_ = [
        ("min", ctypes.c_ulong),
        ("max", ctypes.c_ulong),
        ("flag", ctypes.c_ulong)
    ]

pack_def._fields_ = [
    ("in_list", in_list),
    ("type", ctypes.c_ulong),
    ("name", len_str),
    ("size", ctypes.c_ulong),
    ("magic", ctypes.c_uint32),
    ("reserved", ctypes.c_uint32),
    ("fields", fields),
    ("alias", ctypes.POINTER(pack_def)),
    ("user_data", ctypes.c_void_p * 4)
]

pack_field._fields_ = [
    ("in_def", in_def),
    ("name", len_str),
    ("def", ctypes.POINTER(pack_def)),
    ("pos", ctypes.c_ulong),
    ("size", ctypes.c_ulong),
    ("counts", counts),
    ("info", len_str),
    ("user_data", ctypes.c_void_p * 2)
]

class pack_def_list(ctypes.Structure):
    _fields_ = [
        ("magic", ctypes.c_char * 8),
        ("self_sz", ctypes.c_uint32),
        ("pack_def_struct_sz", ctypes.c_uint32),
        ("pack_field_struct_sz", ctypes.c_uint32),
        ("variable", ctypes.c_uint32),

        ("counts", ctypes.c_uint32),
        ("defs", ctypes.POINTER(pack_def))
    ]

# 定义结构体 mmbc_create_param
class mmbc_create_param(ctypes.Structure):
    _fields_ = [
        ("broadcast_addr", len_str),
        ("multicast_addr", len_str),
        ("port", ctypes.c_long),
        ("refer", ctypes.c_void_p),
        ("def_list", ctypes.POINTER(pack_def_list)),
        ("on_recv_msg", mmbc_user_on_recv_msg),
        ("on_recv_json_msg", mmbc_user_on_recv_json_msg),
        ("disable_listen", ctypes.c_long)]
# 定义mpack_buf
class mpack_buf(ctypes.Structure):
    _fields_ = [
        ("start", ctypes.POINTER(ctypes.c_ubyte)),
        ("end", ctypes.POINTER(ctypes.c_ubyte)),
        ("index", ctypes.POINTER(ctypes.c_ubyte))]
# 定义mpbuf_init
def mpbuf_init(pbuf, buf_pointer, buf_size):
    if not pbuf or not buf_pointer:
        raise ValueError('Invalid input parameters')
    # 将 buf_pointer 转换为合适的指针类型
    c_buf_pointer = ctypes.cast(buf_pointer, ctypes.POINTER(ctypes.c_ubyte))
    # 计算 end 指针的地址
    c_end_pointer = ctypes.cast(ctypes.addressof(c_buf_pointer.contents) + buf_size, ctypes.POINTER(ctypes.c_ubyte))
    # 将结果存储到 pbuf 中
    pbuf.start = c_buf_pointer
    pbuf.end = c_end_pointer
    pbuf.index = c_buf_pointer
# 定义msg_set_data_base_addr
def msg_set_data_base_addr(msg, value):
    # 将 value 转换为一个指针类型
    p_value = ctypes.cast(value, ctypes.POINTER(ctypes.c_ulonglong))
    # 将指针所指向的 unsigned long long 数值存储到 data_base_addr 中
    msg.data_base_addr = p_value.contents.value

# 以上部分为结构体和调用的宏定义

# 获取动态链接库所在的目录
dir_path = os.path.dirname(os.path.abspath(__file__))
lib_path = os.path.join(dir_path, 'libmmec.debug.dylib')
# 引入动态链接库
dll = ctypes.cdll.LoadLibrary(lib_path)

# 本地搜索回调实例
def on_recv_json_msg(ref, msg_type, msg_json, remote_addrin):
        print('1')

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
print('1')
dll.mmbc_create.restype = ctypes.c_void_p

mmbc_handle = dll.mmbc_create(ctypes.byref(param))
print(mmbc_handle)

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

# test = dll.mmbc_send_msg(mmbc_handle, None, ctypes.byref(local_search_msg))
print(test)
while True:
        pass