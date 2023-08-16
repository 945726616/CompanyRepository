/* eslint-disable */
/*
    mmd5
    depends : none
    ----history----------
    author: chengzhiyong date: 2014-08-13 action: update depends info
*/
/*-----------------mmd5---------------------------------------------------*/
/*--trim by kugle 2012-07-08 for better speed and compress size-------------*/
var mmd5 = mmd5 || (function () {

  var
    /**
    @Description: Used Internally. The case of the hex output (0 = lowercase 1 = uppercase)
    */
    /* hexcase = 0, */

    hex_tab = /* hexcase ? "0123456789ABCDEF" : */"0123456789abcdef",
    b64_tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    /**
    @Description: Used Internally. base-64 pad character "=" for strict RFC compliance
    */
    b64pad = '=',

    /**
    @Description: Used Internally. bits per input character. 8 - ASCII; 16 - Unicode
    */
    chrsz = 8;

  /*
   * These are the functions you'll usually want to call
   * They take string arguments and return either hex or base-64 encoded strings
   */

  /**
  @Description: Used Internally.  Add integers, wrapping at 2^32. This uses 16-bit operations internally * to work around bugs in some JS interpreters.
  */
  function safe_add (x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  /**
  @Description: Used Internally. Bitwise rotate a 32-bit number to the left.
  */
  function bit_rol (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /**
  @Description: Used Internally.
  */
  function cmn (q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
  }

  /**
  @Description: Used Internally.
  */
  function ff (a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  /**
  @Description: Used Internally.
  */
  function gg (a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  /**
  @Description: Used Internally.
  */
  function hh (a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  /**
  @Description: Used Internally.
  */
  function ii (a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  /**
  @Description: Used Internally.   Calculate the MD5 of an array of little-endian words, and a bit length
  */
  function core (x, len) {

    /* append padding */
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var a = 1732584193,
      b = -271733879,
      c = -1732584194,
      d = 271733878,
      i = 0,
      len = x.length;

    for (; i < len; i += 16) {
      var olda = a,
        oldb = b,
        oldc = c,
        oldd = d;

      a = ff(a, b, c, d, x[i + 0], 7, -680876936);
      d = ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = ff(c, d, a, b, x[i + 10], 17, -42063);
      b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = ff(b, c, d, a, x[i + 15], 22, 1236535329);

      a = gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = gg(b, c, d, a, x[i + 0], 20, -373897302);
      a = gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = gg(b, c, d, a, x[i + 12], 20, -1926607734);

      a = hh(a, b, c, d, x[i + 5], 4, -378558);
      d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = hh(d, a, b, c, x[i + 0], 11, -358537222);
      c = hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = hh(b, c, d, a, x[i + 2], 23, -995338651);

      a = ii(a, b, c, d, x[i + 0], 6, -198630844);
      d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = ii(b, c, d, a, x[i + 9], 21, -343485551);

      a = safe_add(a, olda);
      b = safe_add(b, oldb);
      c = safe_add(c, oldc);
      d = safe_add(d, oldd);
    }
    return [a, b, c, d];

  }

  /**
  @Description: Used Internally. Convert a string to an array of little-endian words. If this.chrsz is ASCII, characters >255 have their hi-byte silently ignored.
  */
  function str2binl (str) {
    var i = 0,
      bin = [],
      mask = (1 << chrsz) - 1;
    for (; i < str.length * chrsz; i += chrsz) {
      bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
    }
    return bin;
  }

  /**
  @Description: Used Internally.  Calculate the HMAC-MD5, of a key and some data
  */
  function core_hmac (key, data) {

    var hash, i = 0, ipad = new Array(16), opad = new Array(16), bkey = str2binl(key);
    if (bkey.length > 16) {
      bkey = core(bkey, key.length * chrsz);
    }

    for (; i < 16; i++) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    hash = core(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
    return core(opad.concat(hash), 512 + 128);
  }

  /**
  @Description: Used Internally. Convert an array of little-endian words to a hex string.
  */
  function binl2hex (binarray) {

    var i, str = "", len;
    for (i = 0, len = binarray.length * 4; i < len; i++) {
      str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
        hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
    }
    return str;
  }

  /**
  @Description: Used Internally. Convert an array of little-endian words to a string
  */
  function binl2str (bin) {
    var i = 0,
      str = "",
      mask = (1 << chrsz) - 1;
    for (; i < bin.length * 32; i += chrsz) {
      str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
    }
    return str;
  }

  /**
  @Description: Used Internally.  Convert an array of little-endian words to a base-64 string
  */
  function binl2b64 (binarray) {
    var triplet,
      j,
      i = 0,
      str = "";
    for (; i < binarray.length * 4; i += 3) {
      triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);

      for (j = 0; j < 4; j++) {

        if (i * 8 + j * 6 > binarray.length * 32) {
          str += b64pad;
        } else {
          str += b64_tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
        }
      }
    }
    return str;
  }

  return {
    /**
    @Description: Used Internally.
    */
    hex: function (s) { 
      // console.log(s, '进入mmd5时获取到的密码值'); 
    return binl2hex(core(str2binl(s), s.length * chrsz)); },

    /**
    @Description: Used Internally.
    */
    b64: function (s) { return binl2b64(core(str2binl(s), s.length * chrsz)); },

    /**
    @Description: Used Internally.
    */
    str: function (s) { return binl2str(core(str2binl(s), s.length * chrsz)); },

    /**
    @Description: Used Internally.
    */
    hex_hmac: function (key, data) { return binl2hex(core_hmac(key, data)); },

    /**
    @Description: Used Internally.
    */
    b64_hmac: function (key, data) { return binl2b64(core_hmac(key, data)); },

    /**
    @Description: Used Internally.
    */
    str_hmac: function (key, data) { return binl2str(core_hmac(key, data)); }
  };

})();

export default mmd5