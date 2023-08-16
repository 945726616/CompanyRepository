/* eslint-disable */
/*
    mcodec
    depends : none
    ----history----------
    author: chengzhiyong date:2014-08-13 action: update to indepent meval
*/
var mcodec = null;
(function (Array) {
  var fn_v2c = String.fromCharCode,
    fn_meval = function (s) { try { return eval("(" + s + ")"); } catch (e) { return null; } },
    utf8_c = [0x00, 0xc0, 0xe0, 0xf0, 0xf8, 0xfc],
    s_hex = "0123456789abcdef",
    s_base62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    s_base64 = s_base62 + "+/=",
    s_mining64 = s_base62 + "_.-",
    uri_map = {},
    html_map = [['&', '&amp;'], ['\\n', '&#10;'], ['\\r', '&#13;'], ['\\t', '&#9;'], ['`', '&#96;'], ['\'', '&#39;'], ['"', '&quot;'], [' ', '&nbsp;'], ['<', '&lt;'], ['>', '&gt;']],
    ubb_map = [{ s: /\[img\]([^\]]*)\[\/img\]/gi, d: '<img src="$1" border="0"/>' },
    {
      s: /\[flash\]([^\]]*)\[\/flash\]/gi,
      d: '<embed type="application/x-shockwave-flash"'
        + ' pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash"'
        + ' quality="heigh" src="$1"/></embed>'
    },
    { s: /\[url=([^\]]*)\]([^\]]*)\[\/url\]/gi, d: '<a href="$1" target="_blank">$2</a>' },
    { s: /\[url\]([^\]]*)\[\/url\]/gi, d: '<a href="$1" target="_blank">$1</a>' },
    { s: /\[email=([^\]]*)\]([^\]]*)\[\/email\]/gi, d: '<a href="mailto:$1">$2</a>' },
    { s: /\[email\]([^\]]*)\[\/email\]/gi, d: '<a href="mailto:$1">$1</a>' },
    { s: /\[color=([^\]]*)\]([^\]]*)\[\/color\]/gi, d: '<font color="$1">$2</font>' },
    { s: /\[face=([^\]]*)\]([^\]]*)\[\/face\]/gi, d: '<font face="$1">$2</font>' },
    { s: /\[size=1\]([^\]]*)\[\/size\]/gi, d: '<font size="1">$1</font>' },
    { s: /\[size=2\]([^\]]*)\[\/size\]/gi, d: '<font size="2">$1</font>' },
    { s: /\[size=3\]([^\]]*)\[\/size\]/gi, d: '<font size="3">$1</font>' },
    { s: /\[size=4\]([^\]]*)\[\/size\]/gi, d: '<font size="4">$1</font>' },
    { s: /\[align=([^\]]*)\]([^]]*)\[\/face\]/gi, d: '<align="$1">$2</align>' },
    { s: /\[fly\]([^\]]*)\[\/fly\]/gi, d: '<marquee>$1</marquee>' },
    { s: /\[b\]([^\]]*)\[\/b\]/gi, d: '<b>$1</b>' },
    { s: /\[i\]([^\]]*)\[\/i\]/gi, d: '<i>$1</i>' },
    { s: /\[u\]([^\]]*)\[\/u\]/gi, d: '<u>$1</u>' },
    { s: /\[code\]([^\]]*)\[\/code\]/gi, d: '<pre><font size="2" face="Verdana,Arial">$1</font></pre>' },
    { s: /\[list\]([^\]]*)\[\/list\]/gi, d: '<ul>$1</ul>' },
    { s: /\[list=1\]([^\]]*)\[\/list\]/gi, d: '<ol type="1">$1</ol>' },
    { s: /\[list=a\]([^\]]*)\[\/list\]/gi, d: '<ol type="a">$1</ol>' },
    { s: /\[\*\]([^\]]*)\[\/\*\]/gi, d: '<li>$1</li>' },
    { s: /\[quote\]([^\]]*)\[\/quote\]/gi, d: '<blockquote>$1</blockquote>' }],
    vi, vs;

  for (vi = 0, vs = "\0\t\n\r\"\\' #%&+-_./:;=?@"; vi < vs.length; ++vi) {
    uri_map[vs.charAt(vi)] = 1;
  }

  function fn_c2hex (pfx, v) { return (pfx ? pfx : "%") + s_hex.charAt(v >> 4) + s_hex.charAt(v & 15) }
  function fn_hex2i (v) { return ((48 <= v) && (57 >= v)) ? (v - 48) : (((65 <= v) && (71 >= v)) ? (v - 55) : (((97 <= v) && (102 >= v)) ? (v - 87) : 0)); }
  function fn_i2a (v, min_len) {
    var i, j, c, r = "", s = "" + v;
    if (0 == s.indexOf("0x")) {/* hex string */
      for (i = s.length - 1; i > 1;) {
        for (c = 0, j = 0; (j < 8) && (i > 1); --i, j += 4) {
          c += (fn_hex2i(s.charCodeAt(i)) << j);
        }
        r = fn_v2c(c) + r;
      }
    }
    else {/* number */
      for (i = 24; i >= 0; i -= 8) {
        if (v >= (1 << i)) { r += fn_v2c((v >> i) & 0xff); }
      }
    }
    while (r.length < min_len) { r = "\0" + r; }
    return r;
  }

  function fn_str_2_b64 (s, mining_64) {
    var v, sub_bits, bit, j, i = 0, r = "", len = s.length, map = mining_64 ? s_mining64 : s_base64;
    while (i < len) {
      for (sub_bits = 0; (sub_bits < 24) && (i < len); sub_bits += 8, ++i) {
        v = (v << 8) + s.charCodeAt(i);
      }
      for (j = 0; j < 24; j += 6, v &= ((1 << (sub_bits - j)) - 1)) {
        bit = sub_bits - j - 6;
        r += (j < sub_bits) ? map.charAt((bit < 0) ? (v << -bit) : (v >> bit)) : "";
      }
    }
    return r;
  }

  function fn_b64_2_binary (mining_64) {
    //if(!mining_64.length||mining_64.length%4)
    //return null;
    //var s_mining64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.-";
    if (!mining_64) return;
    var index64 = [];
    for (var i = 0; i < s_mining64.length; i++)
      index64[s_mining64.charAt(i)] = i;
    var c0, c1, c2, c3, b0, b1, b2;
    var len = mining_64.length;
    var len1 = len;
    if (mining_64.charAt(len - 1) == '-')
      len1 -= 4;
    var result = [];
    for (var j = 0; j < len1; j += 4) {
      c0 = index64[mining_64.charAt(j)];
      c1 = index64[mining_64.charAt(j + 1)];
      c2 = index64[mining_64.charAt(j + 2)];
      c3 = index64[mining_64.charAt(j + 3)];
      b0 = (c0 << 2) | (c1 >> 4);
      b1 = (c1 << 4) | (c2 >> 2);
      b2 = (c2 << 6) | c3;
      result.push(b0 & 0xff);
      result.push(b1 & 0xff);
      result.push(b2 & 0xff);
    }
    if (len1 != len) {
      c0 = index64[mining_64.charAt(i)];
      c1 = index64[mining_64.charAt(i + 1)];
      c2 = mining_64.charAt(i + 2);
      b0 = (c0 << 2) | (c1 >> 4);
      result.push(b0 & 0xff);
      if (c2 != '-') {
        c2 = index64[c2];
        b1 = (c1 << 4) | (c2 >> 2);
        result.push(b1 & 0xff);
      }
    }
    return result;
  }

  function fn_binary_2_b64 (s, mining_64) {
    var v, sub_bits, bit, j, i = 0, r = "", len = s.length, map = mining_64 ? s_mining64 : s_base64;
    while (i < len) {
      for (sub_bits = 0; (sub_bits < 24) && (i < len); sub_bits += 8, i++) {
        v = (v << 8) + s[i];
      }
      for (j = 0; j < 24; j += 6, v &= ((1 << (sub_bits - j)) - 1)) {
        bit = sub_bits - j - 6;
        r += (j < sub_bits) ? map.charAt((bit < 0) ? (v << -bit) : (v >> bit)) : "";
      }
    }
    return r;
  }

  function fn_str_2_uri_param (s, pfx) {
    var c, v, i, j, n, len, cs, r = "";
    for (i = 0, len = s.length; i < len; ++i) {
      if (127 >= (v = s.charCodeAt(i))) { r += uri_map[c = s.charAt(i)] ? fn_c2hex(pfx, v) : c; }
      else {/* wchar */
        cs = "";
        n = (v < 0x80) ? 0 : ((v < 0x800) ? 1 : ((v < 0x10000) ? 2 : ((v < 0x400000) ? 3 : ((v < 0x8000000) ? 4 : 5))));
        for (j = n; j > 0; --j, v = v >> 6) { cs = fn_c2hex(pfx, 0x80 | (v & 0x3f)) + cs; }
        v |= utf8_c[n];
        r += fn_c2hex(pfx, v) + cs;
      }
    }
    return r;
  }

  function fn_uri_param_2_str (s, pfx) {
    var c, v, i, imx = s.length, j, k, kmx, r = "";
    pfx = pfx || '%';
    for (i = 0; i < imx;) {
      if ((pfx != s.charAt(i)) || ((i + 3) > imx)) { r += s.charAt(i); ++i; }
      else {
        c = (fn_hex2i(s.charCodeAt(i + 1) & 0xff) << 4) + fn_hex2i(s.charCodeAt(i + 2) & 0xff);
        for (j = utf8_c.length, v = 0; j > 1; --j) {
          if (c >= utf8_c[j - 1]) {
            if ((kmx = (i + (3 * j))) <= imx) {
              v = c - utf8_c[j - 1];
              for (k = i + 3; k < kmx; k += 3) {
                if (pfx != s.charAt(k)) { break; }/* invalid */
                v = (v << 6) + (((fn_hex2i(s.charCodeAt(k + 1) & 0xff) << 4) + fn_hex2i(s.charCodeAt(k + 2) & 0xff)) & 0x5f);
              }
              if (k == kmx) { r += fn_v2c(v); i += (j * 3); } /* invalid */
            }
            break;
          }
        }
        if (0 == v) { r += fn_v2c(c); i += 3; }
      }
    }
    return r;
  }

  function fn_uri_2_obj (s) {/*  !!!!!!!!!!!!!!!!!!not match obj_2_uri, if match it need change this, this function just support 1-level param */
    var ret = {}, c, ni, vi, nlen, vlen, i, imx = s.length,
      nc = ((0 < imx) && ('-' == s.charAt(0))) ? '-' : '=', vc = ('-' == nc) ? '-' : '&', pfx = (vc == "-") ? "_" : "%";
    for (i = 1; i < imx; ++i) {
      for (ni = i; ((i < imx) && (nc != (c = s.charAt(i))) && (c != vc)); ++i) { }/* name*/
      nlen = i - ni;
      i += (((i < imx) && (nc == c)) ? 1 : 0);

      for (vi = i; ((i < imx) && (vc != s.charAt(i))); ++i) { }/*value*/
      vlen = i - vi;

      if ((0 < nlen) && (0 < vlen)) { ret[s.substr(ni, nlen)] = fn_uri_param_2_str(s.substr(vi, vlen), pfx); }
    }
    return ret;
  }
  function fn_bytes_2_uri_param (v) { //日志数据处理后加
    var s = "";
    var hex = null;
    for (var o in v) {
      hex = v[o].toString(16);
      if (hex.length <= 1) {
        hex = '0' + hex;
      }
      s += '%' + hex;
    }
    return s;
  }
  function fn_obj_2_url (obj, split/* default is "&" */) { //日志数据处理后修改
    //console.log(obj, 'obj', split, 'split')
    var nc = "="
    var vc = "&"
    var pfx = "%"
    var s = {}
    function _obj_2_uri (obj, path) {
      var test = {}
      if (obj && obj.constructor === Array) {
        s[path + "__x_countz_"] = obj.length
      }
      for (var objName in obj) {
        var objItem = obj[objName] // 传递过来的对象内容
        //console.log(objItem, "objItem", typeof(objItem), 'typeof(objItem)', objName, "objName", path, 'path')
        if ((undefined !== objItem) && (null !== objItem)) {
          if ('%' === ("" + objName).charAt(0)) { // 确定键名第一个字符不是%
            objName = objName.substr(1) // 如果第一个字符是% 则去掉%
          }
          var n_path = path + (('0' !== objName) ? ((("" === path) ? "d" : "_") + objName) : "") // 前缀加密后的键名

          if (typeof (objItem) !== "function") { // 检测对象键值是否为函数
            if (typeof (objItem) === 'object') { // 键值是否为对象
              if (objItem.constructor === Uint8Array) {
                s[n_path] = fn_bytes_2_uri_param(objItem)
              } else {
                // console.log(objItem.constructor, 'constructor', objItem)
                if (objItem.constructor !== Array) {
                  s[n_path] = 1
                }
                _obj_2_uri(objItem, n_path)
                // s += (("" == s) ? "" : vc) + ((objItem.constructor == Array) ? "" : (n_path + nc + "1" + vc)) + _obj_2_uri(objItem, n_path)
              }
            }
            else {
              s[n_path] = objItem
              // console.log(objItem, 'stringObjItemBefore', )
              // if('%' === ("" + objName).charAt(0)) {
              //   s[n_path] = objItem
              // } else {
              //   //console.log(objItem, 'fn_str_2_uri_param')
              //   s[n_path] = fn_str_2_uri_param("" + objItem, pfx)
              // }
              //  s[n_path] = ('%' === ("" + objName).charAt(0)) ? objItem : fn_str_2_uri_param("" + objItem, pfx)
              // console.log(s[n_path], 'stringObjItemAfter')
              // s += (("" == s) ? "" : vc) + n_path + nc + (('%' === ("" + objName).charAt(0)) ? objItem : fn_str_2_uri_param("" + objItem, pfx))
            }
          }
        }
      }
      //console.log(s, '打印对象')
      return s
    }
    return _obj_2_uri(obj, "")
  }

  function fn_obj_2_form (obj, action) {
    function _obj_2_form (obj, path, cpath) {
      var n, v, n_path, n_cpath, arry = obj.constructor == Array,
        s = arry ? ("<input type=\"hidden\" name=\"" + path + "__x_countz_\" value=\"" + obj.length + "\"/>\r\n") : "";
      for (n in obj) {
        if ((undefined != (v = obj[n])) && (null != v)) {
          n_path = path + ((0 != n) ? ((("" == path) ? "d" : "_") + n) : "");
          n_cpath = "" + cpath + (arry ? ("[" + n + "]") : ((("" == cpath) ? "" : ".") + n));
          if (typeof (v) == s_object) {/* check is object, create a div */
            s += "<div style=\"border:1px solid #00ffff;padding:2px;\"><br/>\r\n" + ((0 == n) ? "" : ("<input type=\"hidden\" name=\"" + n_path + "\" value=\"1\"/>\r\n")) + _obj_2_form(v, n_path, n_cpath) + "</div>\r\n";
          }
          else {
            s += "<label>" + n_cpath + ":</label>" + "<input type=\"text\" name=\"" + n_path + "\" value=\"" + v + "\"/><br/>";
          }
        }
      }
      return s;
    }
    return "<form action=\"" + action + "\" method=\"get\" style=\"border:2px solid blue;padding:1px;\"><button id=\"submit\" type=\"submit\">提交</button><br/>" + _obj_2_form(obj, "", "") + "</form>";
  }

  function fn_obj_2_str (obj) {
    if (obj) {
      var n, v, i, c, cnt = 0, len, arry = obj.constructor == Array, s = arry ? "[" : "{";
      for (n in obj) {
        v = obj[n];
        s += ((0 == (cnt++)) ? "" : ",") + (arry ? "" : (n + ":"));
        switch (typeof (v)) {
          case "number": { s += v; break; }
          case "object": { s += fn_obj_2_str(v); break; }
          case "string":
            s += "\"";
            for (i = 0, len = v.length; i < len; ++i) {
              c = v.charAt(i);
              s += ((c != '"') && (c != '\\')) ? (('\n' == c) ? "\\n" : ((c == '\r') ? "\\r" : c)) : ("\\" + c);
            }
            s += "\"";
            break;
        }
      }
      return s + (arry ? "]" : "}");
    }
    return "";
  }

  function fn_json_txt_2_form (s, action) {
    var b = s.indexOf("("), e = s.lastIndexOf(")");
    if ((0 < b) && (e > b)) { s = s.substring(b + 1, e); }
    return fn_obj_2_form(fn_meval(s), action);
  }

  function fn_str_2_html (s) { for (var i = 0; i < html_map.length; ++i) { s = s.replace(new RegExp(html_map[i][0], 'g'), html_map[i][1]); } return s; }
  function fn_html_2_str (s) { for (var i = html_map.length - 1; i >= 0; --i) { s = s.replace(new RegExp(html_map[i][1], 'g'), html_map[i][0]); } return s; }
  function fn_ubb_2_html (s) { for (var r, i = ubb_map.length; i >= 0; --i) { r = ubb_map[i]; s = s.replace(r.s, r.d); } return s; }

  function fn_hex_2_uri_param (s) {
    var i, r = "";
    for (i = 0; i < s.length; ++i) { r += ((0 == (1 & i)) ? "%" : "") + s.charAt(i); }
    return r;
  }

  /* id_type:[ 0:sid, 1:tid, 2:lid ] */
  function fn_nid (seq, id, share_key, id_type, username, password, md5_ex, md5_hex_name) {
    var s_seq = fn_i2a(seq),
      s_id = id ? fn_i2a(id) : "",
      s_id_type = id ? fn_i2a(id_type) : "",
      s_password_md5 = password ? fn_i2a("0x" + md5_ex[md5_hex_name](password)) : "",
      s_nid_idty = (s_seq ? (fn_v2c((2 << 5) + s_seq.length) + s_seq) : "")
        + (s_id ? (fn_v2c((3 << 5) + s_id.length) + s_id) : "")
        + (s_id_type ? (fn_v2c((4 << 5) + s_id_type.length) + s_id_type) : "")
        + (username ? (fn_v2c((5 << 5) + username.length) + username) : ""),
      s_md5_src = s_nid_idty
        + (share_key ? (fn_v2c((0 << 5) + share_key.length) + share_key) : "")
        + (s_password_md5 ? (fn_v2c((0 << 5) + s_password_md5.length) + s_password_md5) : "")
    var s_md5 = fn_i2a("0x" + md5_ex[md5_hex_name](s_md5_src));
    return fn_str_2_b64(fn_v2c((1 << 5) + s_md5.length) + s_md5 + s_nid_idty, 1);
  }

  /* asigned to window */
  mcodec = {
    magic: "mcodec",
    str_2_b64: fn_str_2_b64,
    b64_2_binary: fn_b64_2_binary,
    binary_2_b64: fn_binary_2_b64,
    str_2_uri_param: fn_str_2_uri_param,
    uri_param_2_str: fn_uri_param_2_str,
    uri_2_obj: fn_uri_2_obj,
    obj_2_url: fn_obj_2_url,
    obj_2_form: fn_obj_2_form,
    json_txt_2_form: fn_json_txt_2_form,
    obj_2_str: fn_obj_2_str,
    str_2_html: fn_str_2_html,
    html_2_str: fn_html_2_str,
    ubb_2_html: fn_ubb_2_html,
    hex_2_uri_param: fn_hex_2_uri_param,
    nid: fn_nid
  }
})(Array);

export default mcodec
