# 定义基础structure内容
import ctypes

# 定义全局变量
MEC_PACK_EXTRA_DATA_BUF_SIZE = 120
MSG_VERSION_MASK_BIG_ENDIAN = 0x80    # b10000000
MSG_VERSION_MASK_HEADER_SIZE = 0x7c   # b01111100 , value directly always 4 bytes align
MSG_VERSION_MASK_ID = 0x03            # b00000011

# 定义通用结构体len_str
class len_str(ctypes.Structure):
    _fields_ = [("len", ctypes.c_ulong), 
                ("data", ctypes.c_char_p)]

# mec_event结构
class chl_struct(ctypes.Structure):
	_fields_ = [("id", ctypes.c_long),
				("type", len_str), 
				("url", len_str)]

# 定义json_object结构体
class json_object_type(ctypes.c_int):
    ejot_integer = 0
    ejot_number = 1
    ejot_string = 2
    ejot_object = 3
    ejot_array = 4

class json_in_parent(ctypes.Structure):
    _fields_ = [
        ('prev', ctypes.POINTER('json_object')),
        ('next', ctypes.POINTER('json_object')),
        ('owner', ctypes.POINTER('json_object'))
    ]

class json_object_list(ctypes.Structure):
    _fields_ = [
        ('counts', ctypes.c_ulong),
        ('list', ctypes.POINTER('json_object'))
    ]

class json_object_value(ctypes.Union):
    _fields_ = [
        ('string', len_str), # none
        ('object', json_object_list), # counts = 0   list = null pointer access
        ('array', json_object_list) # counts = 0   list = null pointer access
    ]

class json_object(ctypes.Structure):
    _fields_ = [
        ('in_parent', json_in_parent),
        ('type', json_object_type),
        ('name', len_str), # <mec_struct.len_str object at 0x10b76cf80>    name.data崩溃无效的内存地址
        ('v', json_object_value)
    ]

class mec_event(ctypes.Structure):
    _fields_ = [("magic", ctypes.c_char * ctypes.sizeof(ctypes.c_long)),
                ("type", len_str),
                ("status", ctypes.c_long),
                ("code", len_str),
                ("chl", chl_struct),
                ("data", ctypes.POINTER(json_object))] #ctypes.POINTER(json_object)

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
	_fields_ = [("chl_id", ctypes.c_long),
                ("is_stop_play", ctypes.c_ulong),
                ("frame_size", ctypes.c_ulong),
                ("type", ctypes.POINTER(mec_pack_type)),
                ("loop_handle", ctypes.c_ulong),
                ("frame_handle", ctypes.c_ulong),
                ("extra_data", len_str),
                ("extra_data_buf", ctypes.c_char * MEC_PACK_EXTRA_DATA_BUF_SIZE),
                ("time_stamp", ctypes.c_ulong),
                ("sample_id", ctypes.c_ulong),
                ("ab_time", ctypes.c_ulonglong),
                ("data", data),
                ("flag", ctypes.c_ubyte),
                ("tag", ctypes.c_ubyte),
                ("reserved", ctypes.c_ubyte * 2)]

# 定义回调函数原型
on_pack_ptr = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(mec_pack), ctypes.c_void_p)    
on_event_ptr = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_char_p, ctypes.POINTER(mec_event), ctypes.c_void_p)

# 定义mec_desc结构体
class mec_desc(ctypes.Structure):
    _fields_ = [
                ("on_event", on_event_ptr),
                ("on_pack", on_pack_ptr),
                ("refer", ctypes.c_void_p),
                ("params", len_str)]

# 定义查询下载文件内容参数结构体
class mavio_mp4_query(ctypes.Structure):
    _fields_ = [
        ('path', ctypes.c_char_p),
        ('video_width', ctypes.c_uint),
        ('video_height', ctypes.c_uint),
        ('video_vps_len', ctypes.c_uint),
        ('video_sps_len', ctypes.c_uint),
        ('video_pps_len', ctypes.c_uint),
        ('audio_sample_rate', ctypes.c_uint),
        ('video_frame_counts', ctypes.c_int),
        ('audio_frame_counts', ctypes.c_int),
        ('key_video_frame_counts', ctypes.c_int),
        ('video_frame_size', ctypes.c_int),
        ('audio_frame_size', ctypes.c_int),
        ('audio_start_time', ctypes.c_int),
        ('audio_end_time', ctypes.c_int),
        ('video_start_time', ctypes.c_int),
        ('video_end_time', ctypes.c_int),
        ('total_duration', ctypes.c_int)]
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
# 定义len_str_casecmp_const宏
def len_str_casecmp_const(_str, _const_str):
    if _str.len != len(_const_str) - 1:
        return _str.len - (len(_const_str) - 1)
    else:
        return ctypes.strncasecmp(_str.data, _const_str, len(_const_str) - 1)

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







