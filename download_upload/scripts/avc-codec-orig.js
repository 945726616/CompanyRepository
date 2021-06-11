try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function(filename) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename).toString();
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename).toString();
    }
    return ret;
  };

  Module['load'] = function(f) {
    globalEval(read(f));
  };

  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  // Polyfill over SpiderMonkey/V8 differences
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function(f) { snarf(f) };
  }

  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }

  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
Module.print = Module['print'];
Module.printErr = Module['printErr'];
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  BITSHIFT64_SHL: 0,
  BITSHIFT64_ASHR: 1,
  BITSHIFT64_LSHR: 2,
  bitshift64: function (low, high, op, bits) {
    var ret;
    var ander = Math.pow(2, bits)-1;
    if (bits < 32) {
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [low << bits, (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits))];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [(((low >>> bits ) | ((high&ander) << (32 - bits))) >> 0) >>> 0, (high >> bits) >>> 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [((low >>> bits) | ((high&ander) << (32 - bits))) >>> 0, high >>> bits];
          break;
      }
    } else if (bits == 32) {
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [0, low];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [high, (high|0) < 0 ? ander : 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [high, 0];
          break;
      }
    } else { // bits > 32
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [0, low << (bits - 32)];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [(high >> (bits - 32)) >>> 0, (high|0) < 0 ? ander : 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [high >>>  (bits - 32) , 0];
          break;
      }
    }
    HEAP32[tempDoublePtr>>2] = ret[0]; // cannot use utility functions since we are in runtime itself
    HEAP32[tempDoublePtr+4>>2] = ret[1];
  },
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func, sig) {
    assert(sig);
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function stackAlloc(size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2); return ret; },
  staticAlloc: function staticAlloc(size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function alignMemory(size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function makeBigInt(low,high,unsigned) { var ret = (unsigned ? (((low)>>>0)+(((high)>>>0)*4294967296)) : (((low)>>>0)+(((high)|0)*4294967296))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}





var CorrectionsMonitor = {
  MAX_ALLOWED: 0, // XXX
  corrections: 0,
  sigs: {},

  note: function(type, succeed, sig) {
    if (!succeed) {
      this.corrections++;
      if (this.corrections >= this.MAX_ALLOWED) abort('\n\nToo many corrections!');
    }
  },

  print: function() {
  }
};
var __THREW__ = 0;
var setjmpId = 1;
var setjmpLabels = {};
var ABORT = false;
var undef = 0;
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
function getCFunc(ident) {
  try {
    var func = eval('_' + ident);
  } catch(e) {
    try {
      func = globalScope['Module']['_' + ident]; // closure exported function
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((ptr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]); break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_NONE = 3;
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
var _memset = function(ptr, value, num) {
  var stop = ptr + num;
  while (ptr < stop) {
    HEAP8[(ptr++)]=value;
  }
}

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*

function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    _memset(ret, 0, size);
    return ret;
  }

  if (singleType === 'i8') {
    HEAPU8.set(new Uint8Array(slab), ret);
    return ret;
  }

  var i = 0, type;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);
    i += Runtime.getNativeTypeSize(type);
  }

  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  var utf8 = new Runtime.UTF8Processor();
  var nullTerminated = typeof(length) == "undefined";
  var ret = "";
  var i = 0;
  var t;
  while (1) {
    t = HEAPU8[((ptr)+(i))];
    if (nullTerminated && t == 0) break;
    ret += utf8.processCChar(t);
    i += 1;
    if (!nullTerminated && i == length) break;
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
function Array_stringify(array) {
  var ret = "";
  for (var i = 0; i < array.length; i++) {
    ret += String.fromCharCode(array[i]);
  }
  return ret;
}
Module['Array_stringify'] = Array_stringify;
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 52428800;
var FAST_MEMORY = Module['FAST_MEMORY'] || 12582912;
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
         'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK;
var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code is increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY);
var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
function initRuntime() {
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);

  // Print summary of correction activity
  CorrectionsMonitor.print();
}
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[((buffer)+(i))]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[((buffer)+(i))]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
  // TODO: clean up previous line
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
var runDependencies = 0;
var runDependencyTracking = {};
var calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
assert(STATICTOP == STACK_MAX);
assert(STACK_MAX == TOTAL_STACK);
STATICTOP += 7724;
assert(STATICTOP < TOTAL_MEMORY);
allocate([22,6,117,117,36,36,36,36,83,83,83,83,83,83,83,83,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50] /* \16\06uu$$$$SSSSSSSS */, "i8", ALLOC_NONE, 5242880);
allocate([134,6,37,37,20,20,20,20,115,115,115,115,115,115,115,115,99,99,99,99,99,99,99,99,51,51,51,51,51,51,51,51,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66] /* \86\06%%\14\14\14\14 */, "i8", ALLOC_NONE, 5242944);
allocate([150,6,21,21,116,116,116,116,131,131,131,131,131,131,131,131,99,99,99,99,99,99,99,99,67,67,67,67,67,67,67,67,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82] /* \96\06\15\15tttt\83\ */, "i8", ALLOC_NONE, 5243008);
allocate([166,6,21,21,132,132,132,132,147,147,147,147,147,147,147,147,115,115,115,115,115,115,115,115,99,99,99,99,99,99,99,99,83,83,83,83,83,83,83,83,67,67,67,67,67,67,67,67,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35] /* \A6\06\15\15\84\84\8 */, "i8", ALLOC_NONE, 5243072);
allocate([181,149,164,164,132,132,36,36,20,20,4,4,115,115,115,115,99,99,99,99,83,83,83,83,67,67,67,67,51,51,51,51] /* \B5\95\A4\A4\84\84$$ */, "i8", ALLOC_NONE, 5243136);
allocate([197,181,165,5,148,148,116,116,52,52,36,36,131,131,131,131,99,99,99,99,83,83,83,83,67,67,67,67,19,19,19,19] /* \C5\B5\A5\05\94\94tt */, "i8", ALLOC_NONE, 5243168);
allocate([214,182,197,197,165,165,149,149,132,132,132,132,84,84,84,84,68,68,68,68,4,4,4,4,115,115,115,115,115,115,115,115,99,99,99,99,99,99,99,99,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,19,19,19,19,19,19,19,19] /* \D6\B6\C5\C5\A5\A5\9 */, "i8", ALLOC_NONE, 5243200);
allocate([230,214,198,182,165,165,149,149,132,132,132,132,116,116,116,116,100,100,100,100,84,84,84,84,67,67,67,67,67,67,67,67,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,19,19,19,19,19,19,19,19,3,3,3,3,3,3,3,3] /* \E6\D6\C6\B6\A5\A5\9 */, "i8", ALLOC_NONE, 5243264);
allocate([0,249,233,217,200,200,184,184,167,167,167,167,151,151,151,151,134,134,134,134,134,134,134,134,118,118,118,118,118,118,118,118] /* \00\F9\E9\D9\C8\C8\B */, "i8", ALLOC_NONE, 5243328);
allocate([0,0,101,85,68,68,52,52,35,35,35,35,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] /* \00\00eUDD44####\13\ */, "i8", ALLOC_NONE, 5243360);
allocate([2,18,33,33] /* \02\12!! */, "i8", ALLOC_NONE, 5243392);
allocate([3,19,50,50,33,33,33,33] /* \03\1322!!!! */, "i8", ALLOC_NONE, 5243396);
allocate([4,20,67,67,34,34,34,34,49,49,49,49,49,49,49,49] /* \04\14CC\22\22\22\22 */, "i8", ALLOC_NONE, 5243404);
allocate([4,20,35,35,51,51,83,83,65,65,65,65,65,65,65,65] /* \04\14##33SSAAAAAAAA */, "i8", ALLOC_NONE, 5243420);
allocate([21,5,100,100,35,35,35,35,82,82,82,82,82,82,82,82,66,66,66,66,66,66,66,66,50,50,50,50,50,50,50,50] /* \15\05dd####RRRRRRRR */, "i8", ALLOC_NONE, 5243436);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,2,3,1,2,3,2,2,3,2,2,4,2,3,4,2,3,4,3,3,5,3,4,6,3,4,6,4,5,7,4,5,8,4,6,9,5,7,10,6,8,11,6,8,13,7,10,14,8,11,16,9,12,18,10,13,20,11,15,23,13,17,25], "i8", ALLOC_NONE, 5243468);
allocate([85,78,65,66,76,69,32,84,79,32,65,76,76,79,67,65,84,69,32,77,69,77,79,82,89,0] /* UNABLE TO ALLOCATE M */, "i8", ALLOC_NONE, 5243624);
allocate([68,69,67,79,68,69,82,32,73,78,73,84,73,65,76,73,90,65,84,73,79,78,32,70,65,73,76,69,68,0] /* DECODER INITIALIZATI */, "i8", ALLOC_NONE, 5243652);
allocate([19,35,67,51,99,83,2,2] /* \13#C3cS\02\02 */, "i8", ALLOC_NONE, 5243684);
allocate([83,67,51,35,18,18,2,2] /* SC3#\12\12\02\02 */, "i8", ALLOC_NONE, 5243692);
allocate([67,51,34,34,18,18,2,2] /* C3\22\22\12\12\02\02 */, "i8", ALLOC_NONE, 5243700);
allocate([50,34,18,2] /* 2\22\12\02 */, "i8", ALLOC_NONE, 5243708);
allocate([34,18,1,1] /* \22\12\01\01 */, "i8", ALLOC_NONE, 5243712);
allocate([17,1] /* \11\01 */, "i8", ALLOC_NONE, 5243716);
allocate([0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3] /* \00\01\02\03\04\05\0 */, "i8", ALLOC_NONE, 5243720);
allocate([0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,8] /* \00\00\00\00\00\00\0 */, "i8", ALLOC_NONE, 5243772);
allocate(4, "i8", ALLOC_NONE, 5243824);
allocate(4, "i8", ALLOC_NONE, 5243828);
allocate(24, "i8", ALLOC_NONE, 5243832);
allocate([0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0], "i8", ALLOC_NONE, 5243856);
allocate([10,0,0,0,13,0,0,0,16,0,0,0,11,0,0,0,14,0,0,0,18,0,0,0,13,0,0,0,16,0,0,0,20,0,0,0,14,0,0,0,18,0,0,0,23,0,0,0,16,0,0,0,20,0,0,0,25,0,0,0,18,0,0,0,23,0,0,0,29,0,0,0], "i8", ALLOC_NONE, 5243920);
allocate([0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,34,0,0,0,35,0,0,0,35,0,0,0,36,0,0,0,36,0,0,0,37,0,0,0,37,0,0,0,37,0,0,0,38,0,0,0,38,0,0,0,38,0,0,0,39,0,0,0,39,0,0,0,39,0,0,0,39,0,0,0], "i8", ALLOC_NONE, 5243992);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255] /* \00\00\00\00\00\00\0 */, "i8", ALLOC_NONE, 5244200);
allocate([0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,8,0,0,0,12,0,0,0,12,0,0,0,8,0,0,0,8,0,0,0,12,0,0,0,12,0,0,0], "i8", ALLOC_NONE, 5245480);
allocate([0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,8,0,0,0,12,0,0,0], "i8", ALLOC_NONE, 5245544);
allocate(16, "i8", ALLOC_NONE, 5245608);
allocate(4, "i8", ALLOC_NONE, 5245624);
allocate(4, "i8", ALLOC_NONE, 5245628);
allocate(16, "i8", ALLOC_NONE, 5245632);
allocate(48, "i8", ALLOC_NONE, 5245648);
allocate([0,0,0,0,1,0,0,0,4,0,0,0,5,0,0,0,2,0,0,0,3,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,12,0,0,0,13,0,0,0,10,0,0,0,11,0,0,0,14,0,0,0,15,0,0,0], "i8", ALLOC_NONE, 5245696);
allocate([103,32,103,32,72,32,40,32,71,24,71,24,39,24,39,24,6,32,6,32,6,32,6,32,6,24,6,24,6,24,6,24,6,16,6,16,6,16,6,16,102,24,102,24,102,24,102,24,38,16,38,16,38,16,38,16,6,8,6,8,6,8,6,8], "i8", ALLOC_NONE, 5245760);
allocate([0,0,67,16,2,0,2,0,33,8,33,8,33,8,33,8], "i8", ALLOC_NONE, 5245824);
allocate([6,8,38,8,0,0,6,0,6,16,38,16,70,16,0,0,6,24,38,24,70,24,102,24,6,32,38,32,70,32,102,32,6,40,38,40,70,40,102,40,6,48,38,48,70,48,102,48,6,56,38,56,70,56,102,56,6,64,38,64,70,64,102,64,6,72,38,72,70,72,102,72,6,80,38,80,70,80,102,80,6,88,38,88,70,88,102,88,6,96,38,96,70,96,102,96,6,104,38,104,70,104,102,104,6,112,38,112,70,112,102,112,6,120,38,120,70,120,102,120,6,128,38,128,70,128,102,128], "i8", ALLOC_NONE, 5245840);
allocate([0,0,10,128,106,128,74,128,42,128,10,120,106,120,74,120,42,120,10,112,106,112,74,112,42,112,10,104,41,104,41,104,9,96,9,96,73,104,73,104,41,96,41,96,9,88,9,88,105,104,105,104,73,96,73,96,41,88,41,88,9,80,9,80,104,96,104,96,104,96,104,96,72,88,72,88,72,88,72,88,40,80,40,80,40,80,40,80,8,72,8,72,8,72,8,72,104,88,104,88,104,88,104,88,72,80,72,80,72,80,72,80,40,72,40,72,40,72,40,72,8,64,8,64,8,64,8,64,7,56,7,56,7,56,7,56,7,56,7,56,7,56,7,56,7,48,7,48,7,48,7,48,7,48,7,48,7,48,7,48,71,72,71,72,71,72,71,72,71,72,71,72,71,72,71,72,7,40,7,40,7,40,7,40,7,40,7,40,7,40,7,40,103,80,103,80,103,80,103,80,103,80,103,80,103,80,103,80,71,64,71,64,71,64,71,64,71,64,71,64,71,64,71,64,39,64,39,64,39,64,39,64,39,64,39,64,39,64,39,64,7,32,7,32,7,32,7,32,7,32,7,32,7,32,7,32], "i8", ALLOC_NONE, 5245968);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,24,70,56,38,56,6,16,102,72,70,48,38,48,6,8,37,40,37,40,69,40,69,40,37,32,37,32,69,32,69,32,37,24,37,24,101,64,101,64,69,24,69,24,37,16,37,16,100,56,100,56,100,56,100,56,100,48,100,48,100,48,100,48,100,40,100,40,100,40,100,40,100,32,100,32,100,32,100,32,100,24,100,24,100,24,100,24,68,16,68,16,68,16,68,16,36,8,36,8,36,8,36,8,4,0,4,0,4,0,4,0], "i8", ALLOC_NONE, 5246224);
allocate([0,0,0,0,109,120,109,120,110,128,78,128,46,128,14,128,46,120,14,120,78,120,46,112,77,112,77,112,13,112,13,112,109,112,109,112,77,104,77,104,45,104,45,104,13,104,13,104,109,104,109,104,77,96,77,96,45,96,45,96,13,96,13,96,12,88,12,88,12,88,12,88,76,88,76,88,76,88,76,88,44,88,44,88,44,88,44,88,12,80,12,80,12,80,12,80,108,96,108,96,108,96,108,96,76,80,76,80,76,80,76,80,44,80,44,80,44,80,44,80,12,72,12,72,12,72,12,72,107,88,107,88,107,88,107,88,107,88,107,88,107,88,107,88,75,72,75,72,75,72,75,72,75,72,75,72,75,72,75,72,43,72,43,72,43,72,43,72,43,72,43,72,43,72,43,72,11,64,11,64,11,64,11,64,11,64,11,64,11,64,11,64,107,80,107,80,107,80,107,80,107,80,107,80,107,80,107,80,75,64,75,64,75,64,75,64,75,64,75,64,75,64,75,64,43,64,43,64,43,64,43,64,43,64,43,64,43,64,43,64,11,56,11,56,11,56,11,56,11,56,11,56,11,56,11,56], "i8", ALLOC_NONE, 5246352);
allocate([0,0,0,0,0,0,0,0,105,72,73,56,41,56,9,48,8,40,8,40,72,48,72,48,40,48,40,48,8,32,8,32,103,64,103,64,103,64,103,64,71,40,71,40,71,40,71,40,39,40,39,40,39,40,39,40,7,24,7,24,7,24,7,24], "i8", ALLOC_NONE, 5246608);
allocate([0,0,0,0,0,0,0,0,102,56,70,32,38,32,6,16,102,48,70,24,38,24,6,8,101,40,101,40,37,16,37,16,100,32,100,32,100,32,100,32,100,24,100,24,100,24,100,24,67,16,67,16,67,16,67,16,67,16,67,16,67,16,67,16], "i8", ALLOC_NONE, 5246672);
allocate([0,0,0,0,47,104,47,104,16,128,80,128,48,128,16,120,112,128,80,120,48,120,16,112,112,120,80,112,48,112,16,104,111,112,111,112,79,104,79,104,47,96,47,96,15,96,15,96,111,104,111,104,79,96,79,96,47,88,47,88,15,88,15,88], "i8", ALLOC_NONE, 5246736);
allocate([110,96,78,88,46,80,14,80,110,88,78,80,46,72,14,72,13,64,13,64,77,72,77,72,45,64,45,64,13,56,13,56,109,80,109,80,77,64,77,64,45,56,45,56,13,48,13,48,107,72,107,72,107,72,107,72,107,72,107,72,107,72,107,72,75,56,75,56,75,56,75,56,75,56,75,56,75,56,75,56,43,48,43,48,43,48,43,48,43,48,43,48,43,48,43,48,11,40,11,40,11,40,11,40,11,40,11,40,11,40,11,40], "i8", ALLOC_NONE, 5246800);
allocate([0,0,0,0,0,0,0,0,106,64,74,48,42,40,10,32,105,56,105,56,73,40,73,40,41,32,41,32,9,24,9,24,104,48,104,48,104,48,104,48,72,32,72,32,72,32,72,32,40,24,40,24,40,24,40,24,8,16,8,16,8,16,8,16,103,40,103,40,103,40,103,40,103,40,103,40,103,40,103,40,71,24,71,24,71,24,71,24,71,24,71,24,71,24,71,24], "i8", ALLOC_NONE, 5246912);
allocate([0,0,0,0,0,0,102,32,38,16,6,8,101,24,101,24,67,16,67,16,67,16,67,16,67,16,67,16,67,16,67,16,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8], "i8", ALLOC_NONE, 5247008);
allocate([47,31,15,0,23,27,29,30,7,11,13,14,39,43,45,46,16,3,5,10,12,19,21,26,28,35,37,42,44,1,2,4,8,17,18,20,24,6,9,22,25,32,33,34,36,40,38,41] /* /\1F\0F\00\17\1B\1D\ */, "i8", ALLOC_NONE, 5247072);
allocate([0,16,1,2,4,8,32,3,5,10,12,15,47,7,11,13,14,6,9,31,35,37,42,44,33,34,36,40,39,43,45,46,17,18,20,24,19,21,26,28,23,27,29,30,22,25,38,41] /* \00\10\01\02\04\08 \ */, "i8", ALLOC_NONE, 5247120);
allocate(16, "i8", ALLOC_NONE, 5247168);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,3,3,3,3,4,4,4,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18] /* \00\00\00\00\00\00\0 */, "i8", ALLOC_NONE, 5247184);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,6,7,8,9,10,12,13,15,17,20,22,25,28,32,36,40,45,50,56,63,71,80,90,101,113,127,144,162,182,203,226,255,255] /* \00\00\00\00\00\00\0 */, "i8", ALLOC_NONE, 5247236);
allocate(468, "i8", ALLOC_NONE, 5247288);
allocate([3,0,0,0,15,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,3,0,0,0,15,0,0,0,0,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,3,0,0,0,15,0,0,0,1,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,3,0,0,0,15,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,7,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,13,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,3,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0], "i8", ALLOC_NONE, 5247756);
allocate([3,0,0,0,15,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,3,0,0,0,19,0,0,0,1,0,0,0,18,0,0,0,0,0,0,0,17,0,0,0,4,0,0,0,16,0,0,0,3,0,0,0,23,0,0,0,1,0,0,0,22,0,0,0,0,0,0,0,21,0,0,0,4,0,0,0,20,0,0,0], "i8", ALLOC_NONE, 5248268);
allocate([1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,4,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,2,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,15,0,0,0,2,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,15,0,0,0,2,0,0,0,10,0,0,0,4,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,12,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,12,0,0,0,255,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,2,0,0,0,255,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,2,0,0,0,4,0,0,0,13,0,0,0,255,0,0,0,8,0,0,0], "i8", ALLOC_NONE, 5248460);
allocate([1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,4,0,0,0,1,0,0,0,15,0,0,0,2,0,0,0,10,0,0,0,4,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,12,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,2,0,0,0,4,0,0,0,13,0,0,0,255,0,0,0,8,0,0,0,1,0,0,0,19,0,0,0,2,0,0,0,18,0,0,0,4,0,0,0,17,0,0,0,255,0,0,0,16,0,0,0,1,0,0,0,23,0,0,0,2,0,0,0,22,0,0,0,4,0,0,0,21,0,0,0,255,0,0,0,20,0,0,0], "i8", ALLOC_NONE, 5248972);
allocate([1,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,4,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,11,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,11,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,4,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,1,0,0,0,15,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,1,0,0,0,15,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,12,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,13,0,0,0], "i8", ALLOC_NONE, 5249164);
allocate([1,0,0,0,10,0,0,0,1,0,0,0,11,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,14,0,0,0,1,0,0,0,15,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,13,0,0,0,1,0,0,0,18,0,0,0,1,0,0,0,19,0,0,0,4,0,0,0,16,0,0,0,4,0,0,0,17,0,0,0,1,0,0,0,22,0,0,0,1,0,0,0,23,0,0,0,4,0,0,0,20,0,0,0,4,0,0,0,21,0,0,0], "i8", ALLOC_NONE, 5249676);
allocate([0,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,7,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,3,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,13,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,15,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,15,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,11,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,11,0,0,0,4,0,0,0,14,0,0,0], "i8", ALLOC_NONE, 5249868);
allocate([0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,15,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,11,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,17,0,0,0,4,0,0,0,16,0,0,0,0,0,0,0,19,0,0,0,4,0,0,0,18,0,0,0,0,0,0,0,21,0,0,0,4,0,0,0,20,0,0,0,0,0,0,0,23,0,0,0,4,0,0,0,22,0,0,0], "i8", ALLOC_NONE, 5250380);
allocate([1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0], "i8", ALLOC_NONE, 5250572);
function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }
var _llvm_memcpy_p0i8_p0i8_i32;
function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if (num|0 >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }
var _llvm_memset_p0i8_i32;
var _broadwayOnHeadersDecoded;
var _broadwayOnPictureDecoded;
function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
function ___errno_location() {
      return ___setErrNo.ret;
    }
var ___errno;
function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
  
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
      return ret;  // Previous break location.
    }
var _llvm_memset_p0i8_i64;
var _stdin=allocate(1, "i32*", ALLOC_STACK);
var _stdout=allocate(1, "i32*", ALLOC_STACK);
var _stderr=allocate(1, "i32*", ALLOC_STACK);
var __impure_ptr=allocate(1, "i32*", ALLOC_STACK);
var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
  
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
  
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
  
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
  
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
    
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
          if (!hasByteServing) chunkSize = datalength;
    
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
    
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
    
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
    
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.ensureObjects();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureRoot();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
  
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === '\n'.charCodeAt(0)) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
  
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
  
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
  
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        assert(Math.max(_stdin, _stdout, _stderr) < 128); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
  
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
  
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output('\n'.charCodeAt(0));
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output('\n'.charCodeAt(0));
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[((buf)+(i))];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }
function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[((buf)+(i))]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }
function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]|0 != 0) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[(_fputc.ret)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc('\n'.charCodeAt(0), stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],ensureObjects:function () {
        if (Browser.ensured) return;
        Browser.ensured = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(-3)];
          return ret;
        }
  
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return name.substr(-4) in { '.jpg': 1, '.png': 1, '.bmp': 1 };
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
      },createContext:function (canvas, useWebGL, setInModule) {
        try {
          var ctx = canvas.getContext(useWebGL ? 'experimental-webgl' : '2d');
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
        }
        return ctx;
      },requestFullScreen:function () {
        var canvas = Module['canvas'];
        function fullScreenChange() {
          var isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                        canvas['mozRequestPointerLock'] ||
                                        canvas['webkitRequestPointerLock'];
            canvas.requestPointerLock();
            isFullScreen = true;
          }
          if (Module['onFullScreen']) Module['onFullScreen'](isFullScreen);
        }
  
        document.addEventListener('fullscreenchange', fullScreenChange, false);
        document.addEventListener('mozfullscreenchange', fullScreenChange, false);
        document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen(); 
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200) {
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      }};
___setErrNo(0);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });
__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });
__ATEXIT__.push({ func: function() { FS.quit() } });
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function() { Browser.requestFullScreen() };
Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var FUNCTION_TABLE = [0,0,_h264bsdFillRow7,0,_FillRow1,0];
function _h264bsdCountLeadingZeros($value) {
  var $zeros_03 = 0;
  var $mask_04 = 134217728;
  while (1) {
    var $mask_04;
    var $zeros_03;
    if (($mask_04 & $value | 0) != 0) {
      var $zeros_0_lcssa = $zeros_03;
      break;
    }
    var $inc = $zeros_03 + 1 | 0;
    var $shr = $mask_04 >>> 1;
    if (($shr | 0) == 0) {
      var $zeros_0_lcssa = $inc;
      break;
    } else {
      var $zeros_03 = $inc;
      var $mask_04 = $shr;
    }
  }
  var $zeros_0_lcssa;
  return $zeros_0_lcssa;
}
function _abs($a) {
  return ($a | 0) < 0 ? -$a | 0 : $a;
}
function _clip($x, $y, $z) {
  if (($z | 0) < ($x | 0)) {
    var $cond5 = $x;
  } else {
    var $cond5 = ($z | 0) > ($y | 0) ? $y : $z;
  }
  var $cond5;
  return $cond5;
}
function _h264bsdProcessBlock($data, $qp, $skip, $coeffMap) {
  var $data$s2 = $data >> 2;
  var label = 0;
  var $conv = HEAPU8[$qp + 5243772 | 0];
  var $idxprom = HEAPU8[$qp + 5243720 | 0];
  var $shl = HEAP32[($idxprom * 3 | 0) + 1310980] << $conv;
  var $shl8 = HEAP32[($idxprom * 3 | 0) + 1310981] << $conv;
  var $shl13 = HEAP32[($idxprom * 3 | 0) + 1310982] << $conv;
  if (($skip | 0) == 0) {
    HEAP32[$data$s2] = HEAP32[$data$s2] * $shl & -1;
  }
  L14 : do {
    if (($coeffMap & 65436 | 0) == 0) {
      if (($coeffMap & 98 | 0) == 0) {
        var $shr144 = HEAP32[$data$s2] + 32 >> 6;
        if (($shr144 + 512 | 0) >>> 0 > 1023) {
          var $retval_0 = 1;
          var $retval_0;
          return $retval_0;
        } else {
          HEAP32[$data$s2 + 15] = $shr144;
          HEAP32[$data$s2 + 14] = $shr144;
          HEAP32[$data$s2 + 13] = $shr144;
          HEAP32[$data$s2 + 12] = $shr144;
          HEAP32[$data$s2 + 11] = $shr144;
          HEAP32[$data$s2 + 10] = $shr144;
          HEAP32[$data$s2 + 9] = $shr144;
          HEAP32[$data$s2 + 8] = $shr144;
          HEAP32[$data$s2 + 7] = $shr144;
          HEAP32[$data$s2 + 6] = $shr144;
          HEAP32[$data$s2 + 5] = $shr144;
          HEAP32[$data$s2 + 4] = $shr144;
          HEAP32[$data$s2 + 3] = $shr144;
          HEAP32[$data$s2 + 2] = $shr144;
          HEAP32[$data$s2 + 1] = $shr144;
          HEAP32[$data$s2] = $shr144;
          break;
        }
      }
      var $arrayidx167 = $data + 4 | 0;
      var $mul168 = HEAP32[$arrayidx167 >> 2] * $shl8 & -1;
      var $arrayidx170 = $data + 20 | 0;
      var $mul171 = HEAP32[$arrayidx170 >> 2] * $shl & -1;
      var $arrayidx173 = $data + 24 | 0;
      var $mul174 = HEAP32[$arrayidx173 >> 2] * $shl8 & -1;
      var $30 = HEAP32[$data$s2];
      var $sub185 = ($mul168 >> 1) - $mul174 | 0;
      var $add189 = ($mul174 >> 1) + $mul168 | 0;
      var $add190 = $30 + ($mul171 + 32) | 0;
      var $shr192 = $add190 + $add189 >> 6;
      HEAP32[$data$s2] = $shr192;
      var $add194 = $30 - $mul171 + 32 | 0;
      var $shr196 = $add194 + $sub185 >> 6;
      HEAP32[$arrayidx167 >> 2] = $shr196;
      var $shr200 = $add194 - $sub185 >> 6;
      HEAP32[$data$s2 + 2] = $shr200;
      var $shr204 = $add190 - $add189 >> 6;
      HEAP32[$data$s2 + 3] = $shr204;
      HEAP32[$data$s2 + 12] = $shr192;
      HEAP32[$data$s2 + 8] = $shr192;
      HEAP32[$data$s2 + 4] = $shr192;
      HEAP32[$data$s2 + 13] = $shr196;
      HEAP32[$data$s2 + 9] = $shr196;
      HEAP32[$arrayidx170 >> 2] = $shr196;
      HEAP32[$data$s2 + 14] = $shr200;
      HEAP32[$data$s2 + 10] = $shr200;
      HEAP32[$arrayidx173 >> 2] = $shr200;
      HEAP32[$data$s2 + 15] = $shr204;
      HEAP32[$data$s2 + 11] = $shr204;
      HEAP32[$data$s2 + 7] = $shr204;
      if (($shr192 + 512 | 0) >>> 0 > 1023) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if (($shr196 + 512 | 0) >>> 0 > 1023) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if (($shr200 + 512 | 0) >>> 0 > 1023) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if (($shr204 + 512 | 0) >>> 0 > 1023) {
        var $retval_0 = 1;
      } else {
        break;
      }
      var $retval_0;
      return $retval_0;
    } else {
      var $arrayidx18 = $data + 4 | 0;
      var $arrayidx19 = $data + 56 | 0;
      var $7 = HEAP32[$arrayidx19 >> 2];
      var $arrayidx20 = $data + 60 | 0;
      var $mul21 = HEAP32[$arrayidx18 >> 2] * $shl8 & -1;
      var $mul25 = HEAP32[$arrayidx20 >> 2] * $shl13 & -1;
      var $arrayidx27 = $data + 8 | 0;
      var $9 = HEAP32[$arrayidx27 >> 2];
      var $arrayidx28 = $data + 20 | 0;
      var $arrayidx29 = $data + 16 | 0;
      var $mul32 = HEAP32[$arrayidx28 >> 2] * $shl & -1;
      var $mul34 = HEAP32[$arrayidx29 >> 2] * $shl13 & -1;
      var $arrayidx36 = $data + 32 | 0;
      var $arrayidx37 = $data + 12 | 0;
      var $13 = HEAP32[$arrayidx37 >> 2];
      var $arrayidx38 = $data + 24 | 0;
      var $mul39 = HEAP32[$arrayidx36 >> 2] * $shl8 & -1;
      var $mul42 = HEAP32[$arrayidx38 >> 2] * $shl8 & -1;
      var $arrayidx44 = $data + 28 | 0;
      var $15 = HEAP32[$arrayidx44 >> 2];
      var $arrayidx45 = $data + 48 | 0;
      var $arrayidx46 = $data + 36 | 0;
      var $17 = HEAP32[$arrayidx46 >> 2];
      var $mul49 = HEAP32[$arrayidx45 >> 2] * $shl13 & -1;
      var $arrayidx54 = $data + 40 | 0;
      var $arrayidx55 = $data + 44 | 0;
      var $19 = HEAP32[$arrayidx55 >> 2];
      var $arrayidx56 = $data + 52 | 0;
      var $mul57 = HEAP32[$arrayidx54 >> 2] * $shl13 & -1;
      var $mul61 = HEAP32[$arrayidx56 >> 2] * $shl8 & -1;
      var $21 = HEAP32[$data$s2];
      var $add = $mul32 + $21 | 0;
      var $sub = $21 - $mul32 | 0;
      var $sub70 = ($mul21 >> 1) - $mul42 | 0;
      var $add74 = ($mul42 >> 1) + $mul21 | 0;
      HEAP32[$data$s2] = $add74 + $add | 0;
      HEAP32[$arrayidx18 >> 2] = $sub70 + $sub | 0;
      HEAP32[$arrayidx27 >> 2] = $sub - $sub70 | 0;
      HEAP32[$arrayidx37 >> 2] = $add - $add74 | 0;
      var $add_1 = $shl8 * ($15 + $9) & -1;
      var $sub_1 = ($9 - $15) * $shl8 & -1;
      var $sub70_1 = ($mul34 >> 1) - $mul49 | 0;
      var $add74_1 = ($mul49 >> 1) + $mul34 | 0;
      HEAP32[$arrayidx29 >> 2] = $add74_1 + $add_1 | 0;
      HEAP32[$arrayidx28 >> 2] = $sub70_1 + $sub_1 | 0;
      HEAP32[$arrayidx38 >> 2] = $sub_1 - $sub70_1 | 0;
      HEAP32[$arrayidx44 >> 2] = $add_1 - $add74_1 | 0;
      var $add_2 = $shl * ($19 + $13) & -1;
      var $sub_2 = ($13 - $19) * $shl & -1;
      var $sub70_2 = ($mul39 >> 1) - $mul61 | 0;
      var $add74_2 = ($mul61 >> 1) + $mul39 | 0;
      HEAP32[$arrayidx36 >> 2] = $add74_2 + $add_2 | 0;
      HEAP32[$arrayidx46 >> 2] = $sub70_2 + $sub_2 | 0;
      HEAP32[$arrayidx54 >> 2] = $sub_2 - $sub70_2 | 0;
      HEAP32[$arrayidx55 >> 2] = $add_2 - $add74_2 | 0;
      var $add_3 = $shl8 * ($7 + $17) & -1;
      var $sub_3 = ($17 - $7) * $shl8 & -1;
      var $sub70_3 = ($mul57 >> 1) - $mul25 | 0;
      var $add74_3 = ($mul25 >> 1) + $mul57 | 0;
      HEAP32[$arrayidx45 >> 2] = $add74_3 + $add_3 | 0;
      HEAP32[$arrayidx56 >> 2] = $sub70_3 + $sub_3 | 0;
      HEAP32[$arrayidx19 >> 2] = $sub_3 - $sub70_3 | 0;
      HEAP32[$arrayidx20 >> 2] = $add_3 - $add74_3 | 0;
      var $col_0 = 4;
      var $data_addr_0 = $data;
      while (1) {
        var $data_addr_0;
        var $col_0;
        if (($col_0 | 0) == 0) {
          break L14;
        }
        var $22 = HEAP32[$data_addr_0 >> 2];
        var $arrayidx88 = $data_addr_0 + 32 | 0;
        var $23 = HEAP32[$arrayidx88 >> 2];
        var $arrayidx93 = $data_addr_0 + 16 | 0;
        var $24 = HEAP32[$arrayidx93 >> 2];
        var $arrayidx95 = $data_addr_0 + 48 | 0;
        var $25 = HEAP32[$arrayidx95 >> 2];
        var $sub96 = ($24 >> 1) - $25 | 0;
        var $add100 = ($25 >> 1) + $24 | 0;
        var $add101 = $22 + ($23 + 32) | 0;
        var $shr103 = $add101 + $add100 >> 6;
        HEAP32[$data_addr_0 >> 2] = $shr103;
        var $add105 = $22 - $23 + 32 | 0;
        var $shr107 = $add105 + $sub96 >> 6;
        HEAP32[$arrayidx93 >> 2] = $shr107;
        var $shr111 = $add105 - $sub96 >> 6;
        HEAP32[$arrayidx88 >> 2] = $shr111;
        var $shr115 = $add101 - $add100 >> 6;
        HEAP32[$arrayidx95 >> 2] = $shr115;
        if (($shr103 + 512 | 0) >>> 0 > 1023) {
          var $retval_0 = 1;
          label = 27;
          break;
        }
        if (($shr107 + 512 | 0) >>> 0 > 1023) {
          var $retval_0 = 1;
          label = 28;
          break;
        }
        if (($shr111 + 512 | 0) >>> 0 > 1023) {
          var $retval_0 = 1;
          label = 29;
          break;
        }
        if (($shr115 + 512 | 0) >>> 0 > 1023) {
          var $retval_0 = 1;
          label = 30;
          break;
        } else {
          var $col_0 = $col_0 - 1 | 0;
          var $data_addr_0 = $data_addr_0 + 4 | 0;
        }
      }
      if (label == 27) {
        var $retval_0;
        return $retval_0;
      } else if (label == 28) {
        var $retval_0;
        return $retval_0;
      } else if (label == 29) {
        var $retval_0;
        return $retval_0;
      } else if (label == 30) {
        var $retval_0;
        return $retval_0;
      }
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdProcessBlock["X"] = 1;
function _h264bsdProcessLumaDc($data, $qp) {
  var $arrayidx32_3$s2;
  var $arrayidx28_3$s2;
  var $arrayidx31$s2;
  var $arrayidx24$s2;
  var $arrayidx22$s2;
  var $arrayidx21$s2;
  var $arrayidx18$s2;
  var $arrayidx16$s2;
  var $arrayidx14$s2;
  var $arrayidx12$s2;
  var $arrayidx10$s2;
  var $arrayidx9$s2;
  var $arrayidx6$s2;
  var $arrayidx4$s2;
  var $arrayidx3$s2;
  var $0 = HEAP8[$qp + 5243720 | 0];
  var $1 = HEAP8[$qp + 5243772 | 0];
  var $arrayidx3$s2 = ($data + 8 | 0) >> 2;
  var $2 = HEAP32[$arrayidx3$s2];
  var $arrayidx4$s2 = ($data + 20 | 0) >> 2;
  var $3 = HEAP32[$arrayidx4$s2];
  var $arrayidx6$s2 = ($data + 16 | 0) >> 2;
  var $4 = HEAP32[$arrayidx6$s2];
  var $arrayidx9$s2 = ($data + 32 | 0) >> 2;
  var $5 = HEAP32[$arrayidx9$s2];
  var $arrayidx10$s2 = ($data + 12 | 0) >> 2;
  var $6 = HEAP32[$arrayidx10$s2];
  var $arrayidx12$s2 = ($data + 24 | 0) >> 2;
  var $7 = HEAP32[$arrayidx12$s2];
  var $arrayidx14$s2 = ($data + 28 | 0) >> 2;
  var $8 = HEAP32[$arrayidx14$s2];
  var $arrayidx16$s2 = ($data + 48 | 0) >> 2;
  var $9 = HEAP32[$arrayidx16$s2];
  var $arrayidx18$s2 = ($data + 36 | 0) >> 2;
  var $10 = HEAP32[$arrayidx18$s2];
  var $arrayidx21$s2 = ($data + 40 | 0) >> 2;
  var $11 = HEAP32[$arrayidx21$s2];
  var $arrayidx22$s2 = ($data + 44 | 0) >> 2;
  var $12 = HEAP32[$arrayidx22$s2];
  var $arrayidx24$s2 = ($data + 52 | 0) >> 2;
  var $13 = HEAP32[$arrayidx24$s2];
  var $14 = HEAP32[$data >> 2];
  var $add = $3 + $14 | 0;
  var $sub = $14 - $3 | 0;
  var $arrayidx31$s2 = ($data + 4 | 0) >> 2;
  var $15 = HEAP32[$arrayidx31$s2];
  var $sub33 = $15 - $7 | 0;
  var $add36 = $7 + $15 | 0;
  var $add37 = $add36 + $add | 0;
  HEAP32[$data >> 2] = $add37;
  var $add39 = $sub33 + $sub | 0;
  HEAP32[$arrayidx31$s2] = $add39;
  var $sub41 = $sub - $sub33 | 0;
  HEAP32[$arrayidx3$s2] = $sub41;
  var $sub43 = $add - $add36 | 0;
  HEAP32[$arrayidx10$s2] = $sub43;
  var $add_1 = $8 + $2 | 0;
  var $sub_1 = $2 - $8 | 0;
  var $sub33_1 = $4 - $9 | 0;
  var $add36_1 = $9 + $4 | 0;
  var $add37_1 = $add36_1 + $add_1 | 0;
  HEAP32[$arrayidx6$s2] = $add37_1;
  var $add39_1 = $sub33_1 + $sub_1 | 0;
  HEAP32[$arrayidx4$s2] = $add39_1;
  var $sub41_1 = $sub_1 - $sub33_1 | 0;
  HEAP32[$arrayidx12$s2] = $sub41_1;
  var $sub43_1 = $add_1 - $add36_1 | 0;
  HEAP32[$arrayidx14$s2] = $sub43_1;
  var $add_2 = $12 + $6 | 0;
  var $sub_2 = $6 - $12 | 0;
  var $sub33_2 = $5 - $13 | 0;
  var $add36_2 = $13 + $5 | 0;
  var $add37_2 = $add36_2 + $add_2 | 0;
  HEAP32[$arrayidx9$s2] = $add37_2;
  var $add39_2 = $sub33_2 + $sub_2 | 0;
  HEAP32[$arrayidx18$s2] = $add39_2;
  var $sub41_2 = $sub_2 - $sub33_2 | 0;
  HEAP32[$arrayidx21$s2] = $sub41_2;
  var $sub43_2 = $add_2 - $add36_2 | 0;
  HEAP32[$arrayidx22$s2] = $sub43_2;
  var $arrayidx28_3$s2 = ($data + 56 | 0) >> 2;
  var $16 = HEAP32[$arrayidx28_3$s2];
  var $add_3 = $16 + $10 | 0;
  var $sub_3 = $10 - $16 | 0;
  var $arrayidx32_3$s2 = ($data + 60 | 0) >> 2;
  var $17 = HEAP32[$arrayidx32_3$s2];
  var $sub33_3 = $11 - $17 | 0;
  var $add36_3 = $17 + $11 | 0;
  var $add37_3 = $add36_3 + $add_3 | 0;
  HEAP32[$arrayidx16$s2] = $add37_3;
  var $add39_3 = $sub33_3 + $sub_3 | 0;
  HEAP32[$arrayidx24$s2] = $add39_3;
  var $sub41_3 = $sub_3 - $sub33_3 | 0;
  HEAP32[$arrayidx28_3$s2] = $sub41_3;
  var $sub43_3 = $add_3 - $add36_3 | 0;
  HEAP32[$arrayidx32_3$s2] = $sub43_3;
  var $conv2 = $1 & 255;
  var $18 = HEAP32[(($0 & 255) * 3 | 0) + 1310980];
  if ($qp >>> 0 > 11) {
    var $shl = $18 << $conv2 - 2;
    var $add55 = $add37_2 + $add37 | 0;
    var $sub58 = $add37 - $add37_2 | 0;
    var $sub61 = $add37_1 - $add37_3 | 0;
    var $add64 = $add37_3 + $add37_1 | 0;
    HEAP32[$data >> 2] = ($add64 + $add55) * $shl & -1;
    HEAP32[$arrayidx6$s2] = ($sub61 + $sub58) * $shl & -1;
    HEAP32[$arrayidx9$s2] = ($sub58 - $sub61) * $shl & -1;
    HEAP32[$arrayidx16$s2] = ($add55 - $add64) * $shl & -1;
    var $add55_1 = $add39_2 + $add39 | 0;
    var $sub58_1 = $add39 - $add39_2 | 0;
    var $sub61_1 = $add39_1 - $add39_3 | 0;
    var $add64_1 = $add39_3 + $add39_1 | 0;
    HEAP32[$arrayidx31$s2] = ($add64_1 + $add55_1) * $shl & -1;
    HEAP32[$arrayidx4$s2] = ($sub61_1 + $sub58_1) * $shl & -1;
    HEAP32[$arrayidx18$s2] = ($sub58_1 - $sub61_1) * $shl & -1;
    HEAP32[$arrayidx24$s2] = ($add55_1 - $add64_1) * $shl & -1;
    var $add55_2 = $sub41_2 + $sub41 | 0;
    var $sub58_2 = $sub41 - $sub41_2 | 0;
    var $sub61_2 = $sub41_1 - $sub41_3 | 0;
    var $add64_2 = $sub41_3 + $sub41_1 | 0;
    HEAP32[$arrayidx3$s2] = ($add64_2 + $add55_2) * $shl & -1;
    HEAP32[$arrayidx12$s2] = ($sub61_2 + $sub58_2) * $shl & -1;
    HEAP32[$arrayidx21$s2] = ($sub58_2 - $sub61_2) * $shl & -1;
    HEAP32[$arrayidx28_3$s2] = ($add55_2 - $add64_2) * $shl & -1;
    var $add55_3 = $sub43_2 + $sub43 | 0;
    var $sub58_3 = $sub43 - $sub43_2 | 0;
    var $sub61_3 = $sub43_1 - $sub43_3 | 0;
    var $add64_3 = $sub43_3 + $sub43_1 | 0;
    HEAP32[$arrayidx10$s2] = ($add64_3 + $add55_3) * $shl & -1;
    HEAP32[$arrayidx14$s2] = ($sub61_3 + $sub58_3) * $shl & -1;
    HEAP32[$arrayidx22$s2] = ($sub58_3 - $sub61_3) * $shl & -1;
    var $storemerge = ($add55_3 - $add64_3) * $shl & -1;
    var $storemerge;
    HEAP32[$arrayidx32_3$s2] = $storemerge;
    return;
  } else {
    var $cond = ($qp - 6 | 0) >>> 0 < 6 ? 1 : 2;
    var $sub100 = 2 - $conv2 | 0;
    var $add87 = $add37_2 + $add37 | 0;
    var $sub90 = $add37 - $add37_2 | 0;
    var $sub93 = $add37_1 - $add37_3 | 0;
    var $add96 = $add37_3 + $add37_1 | 0;
    HEAP32[$data >> 2] = (($add96 + $add87) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx6$s2] = (($sub93 + $sub90) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx9$s2] = (($sub90 - $sub93) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx16$s2] = (($add87 - $add96) * $18 & -1) + $cond >> $sub100;
    var $add87_1 = $add39_2 + $add39 | 0;
    var $sub90_1 = $add39 - $add39_2 | 0;
    var $sub93_1 = $add39_1 - $add39_3 | 0;
    var $add96_1 = $add39_3 + $add39_1 | 0;
    HEAP32[$arrayidx31$s2] = (($add96_1 + $add87_1) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx4$s2] = (($sub93_1 + $sub90_1) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx18$s2] = (($sub90_1 - $sub93_1) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx24$s2] = (($add87_1 - $add96_1) * $18 & -1) + $cond >> $sub100;
    var $add87_2 = $sub41_2 + $sub41 | 0;
    var $sub90_2 = $sub41 - $sub41_2 | 0;
    var $sub93_2 = $sub41_1 - $sub41_3 | 0;
    var $add96_2 = $sub41_3 + $sub41_1 | 0;
    HEAP32[$arrayidx3$s2] = (($add96_2 + $add87_2) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx12$s2] = (($sub93_2 + $sub90_2) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx21$s2] = (($sub90_2 - $sub93_2) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx28_3$s2] = (($add87_2 - $add96_2) * $18 & -1) + $cond >> $sub100;
    var $add87_3 = $sub43_2 + $sub43 | 0;
    var $sub90_3 = $sub43 - $sub43_2 | 0;
    var $sub93_3 = $sub43_1 - $sub43_3 | 0;
    var $add96_3 = $sub43_3 + $sub43_1 | 0;
    HEAP32[$arrayidx10$s2] = (($add96_3 + $add87_3) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx14$s2] = (($sub93_3 + $sub90_3) * $18 & -1) + $cond >> $sub100;
    HEAP32[$arrayidx22$s2] = (($sub90_3 - $sub93_3) * $18 & -1) + $cond >> $sub100;
    var $storemerge = (($add87_3 - $add96_3) * $18 & -1) + $cond >> $sub100;
    var $storemerge;
    HEAP32[$arrayidx32_3$s2] = $storemerge;
    return;
  }
}
_h264bsdProcessLumaDc["X"] = 1;
function _h264bsdProcessChromaDc($data, $qp) {
  var $1 = HEAP32[(HEAPU8[$qp + 5243720 | 0] * 3 | 0) + 1310980];
  if ($qp >>> 0 > 5) {
    var $levShift_0 = 0;
    var $levScale_0 = $1 << HEAPU8[$qp + 5243772 | 0] - 1;
  } else {
    var $levShift_0 = 1;
    var $levScale_0 = $1;
  }
  var $levScale_0;
  var $levShift_0;
  var $3 = HEAP32[$data >> 2];
  var $arrayidx6 = $data + 8 | 0;
  var $4 = HEAP32[$arrayidx6 >> 2];
  var $add = $4 + $3 | 0;
  var $sub9 = $3 - $4 | 0;
  var $arrayidx10 = $data + 4 | 0;
  var $5 = HEAP32[$arrayidx10 >> 2];
  var $arrayidx11 = $data + 12 | 0;
  var $6 = HEAP32[$arrayidx11 >> 2];
  var $sub12 = $5 - $6 | 0;
  var $add15 = $6 + $5 | 0;
  HEAP32[$data >> 2] = (($add15 + $add) * $levScale_0 & -1) >> $levShift_0;
  HEAP32[$arrayidx10 >> 2] = (($add - $add15) * $levScale_0 & -1) >> $levShift_0;
  HEAP32[$arrayidx6 >> 2] = (($sub12 + $sub9) * $levScale_0 & -1) >> $levShift_0;
  HEAP32[$arrayidx11 >> 2] = (($sub9 - $sub12) * $levScale_0 & -1) >> $levShift_0;
  var $arrayidx30 = $data + 16 | 0;
  var $7 = HEAP32[$arrayidx30 >> 2];
  var $arrayidx31 = $data + 24 | 0;
  var $8 = HEAP32[$arrayidx31 >> 2];
  var $add32 = $8 + $7 | 0;
  var $sub35 = $7 - $8 | 0;
  var $arrayidx36 = $data + 20 | 0;
  var $9 = HEAP32[$arrayidx36 >> 2];
  var $arrayidx37 = $data + 28 | 0;
  var $10 = HEAP32[$arrayidx37 >> 2];
  var $sub38 = $9 - $10 | 0;
  var $add41 = $10 + $9 | 0;
  HEAP32[$arrayidx30 >> 2] = (($add41 + $add32) * $levScale_0 & -1) >> $levShift_0;
  HEAP32[$arrayidx36 >> 2] = (($add32 - $add41) * $levScale_0 & -1) >> $levShift_0;
  HEAP32[$arrayidx31 >> 2] = (($sub38 + $sub35) * $levScale_0 & -1) >> $levShift_0;
  HEAP32[$arrayidx37 >> 2] = (($sub35 - $sub38) * $levScale_0 & -1) >> $levShift_0;
  return;
}
_h264bsdProcessChromaDc["X"] = 1;
function _h264bsdNextMbAddress($pSliceGroupMap, $picSizeInMbs, $currMbAddr) {
  var $0 = HEAP32[$pSliceGroupMap + ($currMbAddr << 2) >> 2];
  var $i_0_sink = $currMbAddr;
  while (1) {
    var $i_0_sink;
    var $inc = $i_0_sink + 1 | 0;
    if ($inc >>> 0 >= $picSizeInMbs >>> 0) {
      break;
    }
    if ((HEAP32[$pSliceGroupMap + ($inc << 2) >> 2] | 0) == ($0 | 0)) {
      break;
    } else {
      var $i_0_sink = $inc;
    }
  }
  return ($inc | 0) == ($picSizeInMbs | 0) ? 0 : $inc;
}
function _h264bsdSetCurrImageMbPointers($image, $mbNum) {
  var $image$s2 = $image >> 2;
  var $0 = HEAP32[$image$s2 + 1];
  var $rem = ($mbNum >>> 0) % ($0 >>> 0);
  var $mul = $mbNum - $rem | 0;
  var $mul3 = HEAP32[$image$s2 + 2] * $0 & -1;
  var $2 = HEAP32[$image$s2];
  HEAP32[$image$s2 + 3] = ($mul << 8) + ($rem << 4) + $2 | 0;
  var $add_ptr11_sum = ($mul3 << 8) + ($mul << 6) + ($rem << 3) | 0;
  HEAP32[$image$s2 + 4] = $2 + $add_ptr11_sum | 0;
  HEAP32[$image$s2 + 5] = ($mul3 << 6) + $2 + $add_ptr11_sum | 0;
  return;
}
function _h264bsdRbspTrailingBits($pStrmData) {
  _h264bsdGetBits($pStrmData, 8 - HEAP32[$pStrmData + 8 >> 2] | 0);
  return;
}
function _h264bsdMoreRbspData($pStrmData) {
  var $mul = HEAP32[$pStrmData + 12 >> 2] << 3;
  var $1 = HEAP32[$pStrmData + 16 >> 2];
  var $sub = $mul - $1 | 0;
  if (($mul | 0) == ($1 | 0)) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  if ($sub >>> 0 > 8) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  } else {
    return (_h264bsdShowBits32($pStrmData) >>> ((32 - $sub | 0) >>> 0) | 0) != (1 << $sub - 1 | 0) & 1;
  }
}
function _GetDpbSize($picSizeInMbs, $levelIdc) {
  var label = 0;
  do {
    if (($levelIdc | 0) == 31) {
      var $maxPicSizeInMbs_0 = 3600;
      var $tmp_0 = 6912e3;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 32) {
      var $maxPicSizeInMbs_0 = 5120;
      var $tmp_0 = 7864320;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 20) {
      var $maxPicSizeInMbs_0 = 396;
      var $tmp_0 = 912384;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 50) {
      var $maxPicSizeInMbs_0 = 22080;
      var $tmp_0 = 42393600;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 51) {
      var $maxPicSizeInMbs_0 = 36864;
      var $tmp_0 = 70778880;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 42) {
      var $maxPicSizeInMbs_0 = 8704;
      var $tmp_0 = 13369344;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 10) {
      var $maxPicSizeInMbs_0 = 99;
      var $tmp_0 = 152064;
      label = 73;
    } else if (($levelIdc | 0) == 11) {
      var $maxPicSizeInMbs_0 = 396;
      var $tmp_0 = 345600;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 22) {
      var $maxPicSizeInMbs_0 = 1620;
      var $tmp_0 = 3110400;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 21) {
      var $maxPicSizeInMbs_0 = 792;
      var $tmp_0 = 1824768;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 40) {
      var $maxPicSizeInMbs_0 = 8192;
      var $tmp_0 = 12582912;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 41) {
      var $maxPicSizeInMbs_0 = 8192;
      var $tmp_0 = 12582912;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 13) {
      var $maxPicSizeInMbs_0 = 396;
      var $tmp_0 = 912384;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 12) {
      var $maxPicSizeInMbs_0 = 396;
      var $tmp_0 = 912384;
      label = 73;
      break;
    } else if (($levelIdc | 0) == 30) {
      var $maxPicSizeInMbs_0 = 1620;
      var $tmp_0 = 3110400;
      label = 73;
      break;
    } else {
      var $retval_0 = 2147483647;
    }
  } while (0);
  do {
    if (label == 73) {
      var $tmp_0;
      var $maxPicSizeInMbs_0;
      if ($maxPicSizeInMbs_0 >>> 0 < $picSizeInMbs >>> 0) {
        var $retval_0 = 2147483647;
        break;
      }
      var $div = Math.floor(($tmp_0 >>> 0) / (($picSizeInMbs * 384 & -1) >>> 0));
      var $retval_0 = $div >>> 0 < 16 ? $div : 16;
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
function _h264bsdExtractNalUnit($pByteStream, $len, $pStrmData, $readBytes) {
  var $strmBuffSize85$s2;
  var $pStrmData$s2 = $pStrmData >> 2;
  var label = 0;
  L91 : do {
    if ($len >>> 0 > 3) {
      if (HEAP8[$pByteStream] << 24 >> 24 != 0) {
        label = 94;
        break;
      }
      if (HEAP8[$pByteStream + 1 | 0] << 24 >> 24 != 0) {
        label = 94;
        break;
      }
      var $2 = HEAP8[$pByteStream + 2 | 0];
      if (($2 & 255) >= 2) {
        label = 94;
        break;
      }
      L96 : do {
        if (($len | 0) != 3) {
          var $zeroCount_083 = 2;
          var $incdec_ptr85 = $pByteStream + 3 | 0;
          var $inc86 = 3;
          var $inc_neg87 = -3;
          var $3 = $2;
          while (1) {
            var $3;
            var $inc_neg87;
            var $inc86;
            var $incdec_ptr85;
            var $zeroCount_083;
            if ($3 << 24 >> 24 == 0) {
              var $zeroCount_0_be = $zeroCount_083 + 1 | 0;
            } else if ($3 << 24 >> 24 == 1) {
              if ($zeroCount_083 >>> 0 > 1) {
                var $readPtr_1 = $incdec_ptr85;
                var $invalidStream_0 = 0;
                var $hasEmulation_0 = 0;
                var $zeroCount_1 = 0;
                var $byteCount_1 = $inc86;
                break;
              } else {
                var $zeroCount_0_be = 0;
              }
            } else {
              var $zeroCount_0_be = 0;
            }
            var $zeroCount_0_be;
            var $inc = $inc86 + 1 | 0;
            if (($inc | 0) == ($len | 0)) {
              break L96;
            }
            var $inc_neg = $inc86 ^ -1;
            var $_pre114 = HEAP8[$incdec_ptr85];
            var $zeroCount_083 = $zeroCount_0_be;
            var $incdec_ptr85 = $incdec_ptr85 + 1 | 0;
            var $inc86 = $inc;
            var $inc_neg87 = $inc_neg;
            var $3 = $_pre114;
          }
          while (1) {
            var $byteCount_1;
            var $zeroCount_1;
            var $hasEmulation_0;
            var $invalidStream_0;
            var $readPtr_1;
            var $4 = HEAP8[$readPtr_1];
            var $inc38 = $byteCount_1 + 1 | 0;
            var $tobool39 = $4 << 24 >> 24 != 0;
            var $zeroCount_2 = ($tobool39 & 1 ^ 1) + $zeroCount_1 | 0;
            var $hasEmulation_1 = $4 << 24 >> 24 == 3 & ($zeroCount_2 | 0) == 2 ? 1 : $hasEmulation_0;
            if ($4 << 24 >> 24 == 1 & $zeroCount_2 >>> 0 > 1) {
              label = 89;
              break;
            }
            if ($tobool39) {
              var $invalidStream_2 = $zeroCount_2 >>> 0 > 2 ? 1 : $invalidStream_0;
              var $zeroCount_3 = 0;
            } else {
              var $invalidStream_2 = $invalidStream_0;
              var $zeroCount_3 = $zeroCount_2;
            }
            var $zeroCount_3;
            var $invalidStream_2;
            if (($inc38 | 0) == ($len | 0)) {
              label = 93;
              break;
            } else {
              var $readPtr_1 = $readPtr_1 + 1 | 0;
              var $invalidStream_0 = $invalidStream_2;
              var $hasEmulation_0 = $hasEmulation_1;
              var $zeroCount_1 = $zeroCount_3;
              var $byteCount_1 = $inc38;
            }
          }
          if (label == 89) {
            var $sub59 = $inc_neg87 + $byteCount_1 - $zeroCount_2 | 0;
            HEAP32[$pStrmData$s2 + 3] = $sub59;
            var $invalidStream_3 = $invalidStream_0;
            var $hasEmulation_2 = $hasEmulation_1;
            var $zeroCount_4 = $zeroCount_2 - ($zeroCount_2 >>> 0 < 3 ? $zeroCount_2 : 3) | 0;
            var $initByteCount_0 = $inc86;
            var $6 = $sub59;
            break L91;
          } else if (label == 93) {
            var $sub76 = $inc_neg87 + $len - $zeroCount_3 | 0;
            HEAP32[$pStrmData$s2 + 3] = $sub76;
            var $invalidStream_3 = $invalidStream_2;
            var $hasEmulation_2 = $hasEmulation_1;
            var $zeroCount_4 = $zeroCount_3;
            var $initByteCount_0 = $inc86;
            var $6 = $sub76;
            break L91;
          }
        }
      } while (0);
      HEAP32[$readBytes >> 2] = $len;
      var $retval_0 = 1;
      var $retval_0;
      return $retval_0;
    } else {
      label = 94;
    }
  } while (0);
  if (label == 94) {
    HEAP32[$pStrmData$s2 + 3] = $len;
    var $invalidStream_3 = 0;
    var $hasEmulation_2 = 1;
    var $zeroCount_4 = 0;
    var $initByteCount_0 = 0;
    var $6 = $len;
  }
  var $6;
  var $initByteCount_0;
  var $zeroCount_4;
  var $hasEmulation_2;
  var $invalidStream_3;
  var $add_ptr83 = $pByteStream + $initByteCount_0 | 0;
  var $pStrmBuffStart = $pStrmData | 0;
  HEAP32[$pStrmBuffStart >> 2] = $add_ptr83;
  HEAP32[$pStrmData$s2 + 1] = $add_ptr83;
  HEAP32[$pStrmData$s2 + 2] = 0;
  HEAP32[$pStrmData$s2 + 4] = 0;
  var $strmBuffSize85$s2 = ($pStrmData + 12 | 0) >> 2;
  HEAP32[$readBytes >> 2] = $zeroCount_4 + $initByteCount_0 + $6 | 0;
  if (($invalidStream_3 | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if (($hasEmulation_2 | 0) == 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $8 = HEAP32[$pStrmBuffStart >> 2];
  var $writePtr_0_ph = $8;
  var $readPtr_2_ph = $8;
  var $zeroCount_5_ph = 0;
  var $i_0_ph = HEAP32[$strmBuffSize85$s2];
  L125 : while (1) {
    var $i_0_ph;
    var $zeroCount_5_ph;
    var $readPtr_2_ph;
    var $writePtr_0_ph;
    var $readPtr_2 = $readPtr_2_ph;
    var $zeroCount_5 = $zeroCount_5_ph;
    var $i_0 = $i_0_ph;
    while (1) {
      var $i_0;
      var $zeroCount_5;
      var $readPtr_2;
      var $dec = $i_0 - 1 | 0;
      if (($i_0 | 0) == 0) {
        label = 106;
        break L125;
      }
      var $9 = HEAP8[$readPtr_2];
      if (($zeroCount_5 | 0) != 2) {
        var $zeroCount_594 = $zeroCount_5;
        break;
      }
      if ($9 << 24 >> 24 != 3) {
        label = 104;
        break;
      }
      if (($dec | 0) == 0) {
        var $retval_0 = 1;
        label = 111;
        break L125;
      }
      var $add_ptr104 = $readPtr_2 + 1 | 0;
      if (HEAPU8[$add_ptr104] > 3) {
        var $retval_0 = 1;
        label = 112;
        break L125;
      } else {
        var $readPtr_2 = $add_ptr104;
        var $zeroCount_5 = 0;
        var $i_0 = $dec;
      }
    }
    if (label == 104) {
      label = 0;
      if (($9 & 255) < 3) {
        var $retval_0 = 1;
        label = 113;
        break;
      } else {
        var $zeroCount_594 = 2;
      }
    }
    var $zeroCount_594;
    HEAP8[$writePtr_0_ph] = $9;
    var $writePtr_0_ph = $writePtr_0_ph + 1 | 0;
    var $readPtr_2_ph = $readPtr_2 + 1 | 0;
    var $zeroCount_5_ph = $9 << 24 >> 24 == 0 ? $zeroCount_594 + 1 | 0 : 0;
    var $i_0_ph = $dec;
  }
  if (label == 106) {
    HEAP32[$strmBuffSize85$s2] = $writePtr_0_ph - $readPtr_2 + HEAP32[$strmBuffSize85$s2] | 0;
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  } else if (label == 111) {
    var $retval_0;
    return $retval_0;
  } else if (label == 112) {
    var $retval_0;
    return $retval_0;
  } else if (label == 113) {
    var $retval_0;
    return $retval_0;
  }
}
_h264bsdExtractNalUnit["X"] = 1;
function _h264bsdCompareSeqParamSets($pSps1, $pSps2) {
  var $pSps2$s2 = $pSps2 >> 2;
  var $pSps1$s2 = $pSps1 >> 2;
  if ((HEAP32[$pSps1$s2] | 0) != (HEAP32[$pSps2$s2] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 1] | 0) != (HEAP32[$pSps2$s2 + 1] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 3] | 0) != (HEAP32[$pSps2$s2 + 3] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $6 = HEAP32[$pSps1$s2 + 4];
  if (($6 | 0) != (HEAP32[$pSps2$s2 + 4] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 11] | 0) != (HEAP32[$pSps2$s2 + 11] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 12] | 0) != (HEAP32[$pSps2$s2 + 12] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 13] | 0) != (HEAP32[$pSps2$s2 + 13] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 14] | 0) != (HEAP32[$pSps2$s2 + 14] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $16 = HEAP32[$pSps1$s2 + 15];
  if (($16 | 0) != (HEAP32[$pSps2$s2 + 15] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$pSps1$s2 + 20] | 0) != (HEAP32[$pSps2$s2 + 20] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  L173 : do {
    if (($6 | 0) == 0) {
      if ((HEAP32[$pSps1$s2 + 5] | 0) == (HEAP32[$pSps2$s2 + 5] | 0)) {
        break;
      } else {
        var $retval_0 = 1;
      }
      var $retval_0;
      return $retval_0;
    } else if (($6 | 0) == 1) {
      if ((HEAP32[$pSps1$s2 + 6] | 0) != (HEAP32[$pSps2$s2 + 6] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if ((HEAP32[$pSps1$s2 + 7] | 0) != (HEAP32[$pSps2$s2 + 7] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if ((HEAP32[$pSps1$s2 + 8] | 0) != (HEAP32[$pSps2$s2 + 8] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $28 = HEAP32[$pSps1$s2 + 9];
      if (($28 | 0) != (HEAP32[$pSps2$s2 + 9] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $offsetForRefFrame = $pSps1 + 40 | 0;
      var $offsetForRefFrame51 = $pSps2 + 40 | 0;
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if ($i_0 >>> 0 >= $28 >>> 0) {
          break L173;
        }
        if ((HEAP32[HEAP32[$offsetForRefFrame >> 2] + ($i_0 << 2) >> 2] | 0) == (HEAP32[HEAP32[$offsetForRefFrame51 >> 2] + ($i_0 << 2) >> 2] | 0)) {
          var $i_0 = $i_0 + 1 | 0;
        } else {
          var $retval_0 = 1;
          break;
        }
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  do {
    if (($16 | 0) != 0) {
      if ((HEAP32[$pSps1$s2 + 16] | 0) != (HEAP32[$pSps2$s2 + 16] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if ((HEAP32[$pSps1$s2 + 17] | 0) != (HEAP32[$pSps2$s2 + 17] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if ((HEAP32[$pSps1$s2 + 18] | 0) != (HEAP32[$pSps2$s2 + 18] | 0)) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      if ((HEAP32[$pSps1$s2 + 19] | 0) == (HEAP32[$pSps2$s2 + 19] | 0)) {
        break;
      } else {
        var $retval_0 = 1;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdCompareSeqParamSets["X"] = 1;
function _h264bsdDecodeSeqParamSet($pStrmData, $pSeqParamSet) {
  var $23$s2;
  var $maxDpbSize$s2;
  var $picHeightInMbs$s2;
  var $picWidthInMbs$s2;
  var $numRefFrames$s2;
  var $value$s2;
  var $pSeqParamSet$s2 = $pSeqParamSet >> 2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 4 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  _H264SwDecMemset($pSeqParamSet, 0, 92);
  var $call = _h264bsdGetBits($pStrmData, 8);
  L209 : do {
    if (($call | 0) == -1) {
      var $retval_0 = 1;
    } else {
      HEAP32[$pSeqParamSet$s2] = $call;
      _h264bsdGetBits($pStrmData, 1);
      _h264bsdGetBits($pStrmData, 1);
      if ((_h264bsdGetBits($pStrmData, 1) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      if ((_h264bsdGetBits($pStrmData, 5) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $call16 = _h264bsdGetBits($pStrmData, 8);
      if (($call16 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $levelIdc = $pSeqParamSet + 4 | 0;
      HEAP32[$levelIdc >> 2] = $call16;
      var $seqParameterSetId = $pSeqParamSet + 8 | 0;
      var $call20 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $seqParameterSetId);
      if (($call20 | 0) != 0) {
        var $retval_0 = $call20;
        break;
      }
      if (HEAP32[$seqParameterSetId >> 2] >>> 0 > 31) {
        var $retval_0 = 1;
        break;
      }
      var $call28 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call28 | 0) != 0) {
        var $retval_0 = $call28;
        break;
      }
      var $2 = HEAP32[$value$s2];
      if ($2 >>> 0 > 12) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pSeqParamSet$s2 + 3] = 1 << $2 + 4;
      var $call35 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call35 | 0) != 0) {
        var $retval_0 = $call35;
        break;
      }
      var $3 = HEAP32[$value$s2];
      if ($3 >>> 0 > 2) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pSeqParamSet$s2 + 4] = $3;
      L220 : do {
        if (($3 | 0) == 0) {
          var $call45 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
          if (($call45 | 0) != 0) {
            var $retval_0 = $call45;
            break L209;
          }
          var $4 = HEAP32[$value$s2];
          if ($4 >>> 0 > 12) {
            var $retval_0 = 1;
            break L209;
          }
          HEAP32[$pSeqParamSet$s2 + 5] = 1 << $4 + 4;
        } else if (($3 | 0) == 1) {
          var $call57 = _h264bsdGetBits($pStrmData, 1);
          if (($call57 | 0) == -1) {
            var $retval_0 = 1;
            break L209;
          }
          HEAP32[$pSeqParamSet$s2 + 6] = ($call57 | 0) == 1 & 1;
          var $call62 = _h264bsdDecodeExpGolombSigned($pStrmData, $pSeqParamSet + 28 | 0);
          if (($call62 | 0) != 0) {
            var $retval_0 = $call62;
            break L209;
          }
          var $call66 = _h264bsdDecodeExpGolombSigned($pStrmData, $pSeqParamSet + 32 | 0);
          if (($call66 | 0) != 0) {
            var $retval_0 = $call66;
            break L209;
          }
          var $numRefFramesInPicOrderCntCycle = $pSeqParamSet + 36 | 0;
          var $call70 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $numRefFramesInPicOrderCntCycle);
          if (($call70 | 0) != 0) {
            var $retval_0 = $call70;
            break L209;
          }
          var $5 = HEAP32[$numRefFramesInPicOrderCntCycle >> 2];
          if ($5 >>> 0 > 255) {
            var $retval_0 = 1;
            break L209;
          }
          if (($5 | 0) == 0) {
            HEAP32[$pSeqParamSet$s2 + 10] = 0;
            break;
          }
          var $call81 = _H264SwDecMalloc($5 << 2);
          var $offsetForRefFrame = $pSeqParamSet + 40 | 0;
          HEAP32[$offsetForRefFrame >> 2] = $call81;
          if (($call81 | 0) == 0) {
            var $retval_0 = 65535;
            break L209;
          } else {
            var $i_0 = 0;
          }
          while (1) {
            var $i_0;
            if ($i_0 >>> 0 >= HEAP32[$numRefFramesInPicOrderCntCycle >> 2] >>> 0) {
              break L220;
            }
            var $call89 = _h264bsdDecodeExpGolombSigned($pStrmData, ($i_0 << 2) + HEAP32[$offsetForRefFrame >> 2] | 0);
            if (($call89 | 0) == 0) {
              var $i_0 = $i_0 + 1 | 0;
            } else {
              var $retval_0 = $call89;
              break L209;
            }
          }
        }
      } while (0);
      var $numRefFrames = $pSeqParamSet + 44 | 0, $numRefFrames$s2 = $numRefFrames >> 2;
      var $call98 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $numRefFrames);
      if (($call98 | 0) != 0) {
        var $retval_0 = $call98;
        break;
      }
      if (HEAP32[$numRefFrames$s2] >>> 0 > 16) {
        var $retval_0 = 1;
        break;
      }
      var $call106 = _h264bsdGetBits($pStrmData, 1);
      if (($call106 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pSeqParamSet$s2 + 12] = ($call106 | 0) == 1 & 1;
      var $call112 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call112 | 0) != 0) {
        var $retval_0 = $call112;
        break;
      }
      var $picWidthInMbs$s2 = ($pSeqParamSet + 52 | 0) >> 2;
      HEAP32[$picWidthInMbs$s2] = HEAP32[$value$s2] + 1 | 0;
      var $call117 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call117 | 0) != 0) {
        var $retval_0 = $call117;
        break;
      }
      var $picHeightInMbs$s2 = ($pSeqParamSet + 56 | 0) >> 2;
      HEAP32[$picHeightInMbs$s2] = HEAP32[$value$s2] + 1 | 0;
      var $call122 = _h264bsdGetBits($pStrmData, 1);
      if (($call122 | 0) == -1 | ($call122 | 0) == 0) {
        var $retval_0 = 1;
        break;
      }
      if ((_h264bsdGetBits($pStrmData, 1) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $call133 = _h264bsdGetBits($pStrmData, 1);
      if (($call133 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $cmp137 = ($call133 | 0) == 1;
      HEAP32[$pSeqParamSet$s2 + 15] = $cmp137 & 1;
      if ($cmp137) {
        var $frameCropLeftOffset = $pSeqParamSet + 64 | 0;
        var $call142 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $frameCropLeftOffset);
        if (($call142 | 0) != 0) {
          var $retval_0 = $call142;
          break;
        }
        var $frameCropRightOffset = $pSeqParamSet + 68 | 0;
        var $call146 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $frameCropRightOffset);
        if (($call146 | 0) != 0) {
          var $retval_0 = $call146;
          break;
        }
        var $frameCropTopOffset = $pSeqParamSet + 72 | 0;
        var $call150 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $frameCropTopOffset);
        if (($call150 | 0) != 0) {
          var $retval_0 = $call150;
          break;
        }
        var $frameCropBottomOffset = $pSeqParamSet + 76 | 0;
        var $call154 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $frameCropBottomOffset);
        if (($call154 | 0) != 0) {
          var $retval_0 = $call154;
          break;
        }
        var $13 = HEAP32[$picWidthInMbs$s2];
        if ((HEAP32[$frameCropLeftOffset >> 2] | 0) > (($13 << 3) + (HEAP32[$frameCropRightOffset >> 2] ^ -1) | 0)) {
          var $retval_0 = 1;
          break;
        }
        var $16 = HEAP32[$picHeightInMbs$s2];
        if ((HEAP32[$frameCropTopOffset >> 2] | 0) > (($16 << 3) + (HEAP32[$frameCropBottomOffset >> 2] ^ -1) | 0)) {
          var $retval_0 = 1;
          break;
        } else {
          var $19 = $13;
          var $18 = $16;
        }
      } else {
        var $19 = HEAP32[$picWidthInMbs$s2];
        var $18 = HEAP32[$picHeightInMbs$s2];
      }
      var $18;
      var $19;
      var $call178 = _GetDpbSize($18 * $19 & -1, HEAP32[$levelIdc >> 2]);
      HEAP32[$value$s2] = $call178;
      var $_pre141 = HEAP32[$numRefFrames$s2];
      if (($call178 | 0) == 2147483647 | $_pre141 >>> 0 > $call178 >>> 0) {
        HEAP32[$value$s2] = $_pre141;
        var $21 = $_pre141;
      } else {
        var $21 = $call178;
      }
      var $21;
      var $maxDpbSize$s2 = ($pSeqParamSet + 88 | 0) >> 2;
      HEAP32[$maxDpbSize$s2] = $21;
      var $call186 = _h264bsdGetBits($pStrmData, 1);
      if (($call186 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $cmp190 = ($call186 | 0) == 1;
      HEAP32[$pSeqParamSet$s2 + 20] = $cmp190 & 1;
      do {
        if ($cmp190) {
          var $call195 = _H264SwDecMalloc(952);
          var $22 = $call195;
          var $vuiParameters = $pSeqParamSet + 84 | 0;
          HEAP32[$vuiParameters >> 2] = $22;
          if (($call195 | 0) == 0) {
            var $retval_0 = 65535;
            break L209;
          }
          var $call201 = _h264bsdDecodeVuiParameters($pStrmData, $22);
          if (($call201 | 0) != 0) {
            var $retval_0 = $call201;
            break L209;
          }
          var $23$s2 = HEAP32[$vuiParameters >> 2] >> 2;
          if ((HEAP32[$23$s2 + 230] | 0) == 0) {
            break;
          }
          var $26 = HEAP32[$23$s2 + 237];
          if (HEAP32[$23$s2 + 236] >>> 0 > $26 >>> 0) {
            var $retval_0 = 1;
            break L209;
          }
          if ($26 >>> 0 < HEAP32[$numRefFrames$s2] >>> 0) {
            var $retval_0 = 1;
            break L209;
          }
          if ($26 >>> 0 > HEAP32[$maxDpbSize$s2] >>> 0) {
            var $retval_0 = 1;
            break L209;
          }
          HEAP32[$maxDpbSize$s2] = ($26 | 0) == 0 ? 1 : $26;
        }
      } while (0);
      _h264bsdRbspTrailingBits($pStrmData);
      var $retval_0 = 0;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdDecodeSeqParamSet["X"] = 1;
function _h264bsdDecodePicParamSet($pStrmData, $pPicParamSet) {
  var $sliceGroupId$s2;
  var $topLeft$s2;
  var $numSliceGroups$s2;
  var $itmp$s2;
  var $value$s2;
  var $pPicParamSet$s2 = $pPicParamSet >> 2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  var $itmp = __stackBase__ + 4, $itmp$s2 = $itmp >> 2;
  _H264SwDecMemset($pPicParamSet, 0, 72);
  var $picParameterSetId = $pPicParamSet | 0;
  var $call = _h264bsdDecodeExpGolombUnsigned($pStrmData, $picParameterSetId);
  L269 : do {
    if (($call | 0) == 0) {
      if (HEAP32[$picParameterSetId >> 2] >>> 0 > 255) {
        var $retval_0 = 1;
        break;
      }
      var $seqParameterSetId = $pPicParamSet + 4 | 0;
      var $call8 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $seqParameterSetId);
      if (($call8 | 0) != 0) {
        var $retval_0 = $call8;
        break;
      }
      if (HEAP32[$seqParameterSetId >> 2] >>> 0 > 31) {
        var $retval_0 = 1;
        break;
      }
      if ((_h264bsdGetBits($pStrmData, 1) | 0) != 0) {
        var $retval_0 = 1;
        break;
      }
      var $call19 = _h264bsdGetBits($pStrmData, 1);
      if (($call19 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 2] = ($call19 | 0) == 1 & 1;
      var $call24 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call24 | 0) != 0) {
        var $retval_0 = $call24;
        break;
      }
      var $add = HEAP32[$value$s2] + 1 | 0;
      var $numSliceGroups$s2 = ($pPicParamSet + 12 | 0) >> 2;
      HEAP32[$numSliceGroups$s2] = $add;
      if ($add >>> 0 > 8) {
        var $retval_0 = 1;
        break;
      }
      L278 : do {
        if ($add >>> 0 > 1) {
          var $sliceGroupMapType = $pPicParamSet + 16 | 0;
          var $call35 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $sliceGroupMapType);
          if (($call35 | 0) != 0) {
            var $retval_0 = $call35;
            break L269;
          }
          var $4 = HEAP32[$sliceGroupMapType >> 2];
          if ($4 >>> 0 > 6) {
            var $retval_0 = 1;
            break L269;
          }
          if (($4 | 0) == 0) {
            var $call47 = _H264SwDecMalloc(HEAP32[$numSliceGroups$s2] << 2);
            var $runLength = $pPicParamSet + 20 | 0;
            HEAP32[$runLength >> 2] = $call47;
            if (($call47 | 0) == 0) {
              var $retval_0 = 65535;
              break L269;
            }
            if ((HEAP32[$numSliceGroups$s2] | 0) == 0) {
              break;
            } else {
              var $i_0125 = 0;
            }
            while (1) {
              var $i_0125;
              var $call54 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
              if (($call54 | 0) != 0) {
                var $retval_0 = $call54;
                break L269;
              }
              HEAP32[HEAP32[$runLength >> 2] + ($i_0125 << 2) >> 2] = HEAP32[$value$s2] + 1 | 0;
              var $inc = $i_0125 + 1 | 0;
              if ($inc >>> 0 < HEAP32[$numSliceGroups$s2] >>> 0) {
                var $i_0125 = $inc;
              } else {
                break L278;
              }
            }
          } else if (($4 | 0) == 3 | ($4 | 0) == 4 | ($4 | 0) == 5) {
            var $call106 = _h264bsdGetBits($pStrmData, 1);
            if (($call106 | 0) == -1) {
              var $retval_0 = 1;
              break L269;
            }
            HEAP32[$pPicParamSet$s2 + 8] = ($call106 | 0) == 1 & 1;
            var $call112 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call112 | 0) != 0) {
              var $retval_0 = $call112;
              break L269;
            }
            HEAP32[$pPicParamSet$s2 + 9] = HEAP32[$value$s2] + 1 | 0;
            break;
          } else if (($4 | 0) == 2) {
            var $topLeft$s2 = ($pPicParamSet + 24 | 0) >> 2;
            HEAP32[$topLeft$s2] = _H264SwDecMalloc((HEAP32[$numSliceGroups$s2] << 2) - 4 | 0);
            var $call69 = _H264SwDecMalloc((HEAP32[$numSliceGroups$s2] << 2) - 4 | 0);
            var $bottomRight = $pPicParamSet + 28 | 0;
            HEAP32[$bottomRight >> 2] = $call69;
            if ((HEAP32[$topLeft$s2] | 0) == 0 | ($call69 | 0) == 0) {
              var $retval_0 = 65535;
              break L269;
            }
            if ((HEAP32[$numSliceGroups$s2] | 0) == 1) {
              break;
            } else {
              var $i_1130 = 0;
            }
            while (1) {
              var $i_1130;
              var $call81 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
              if (($call81 | 0) != 0) {
                var $retval_0 = $call81;
                break L269;
              }
              HEAP32[HEAP32[$topLeft$s2] + ($i_1130 << 2) >> 2] = HEAP32[$value$s2];
              var $call87 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
              if (($call87 | 0) != 0) {
                var $retval_0 = $call87;
                break L269;
              }
              HEAP32[HEAP32[$bottomRight >> 2] + ($i_1130 << 2) >> 2] = HEAP32[$value$s2];
              var $inc94 = $i_1130 + 1 | 0;
              if ($inc94 >>> 0 < (HEAP32[$numSliceGroups$s2] - 1 | 0) >>> 0) {
                var $i_1130 = $inc94;
              } else {
                break L278;
              }
            }
          } else if (($4 | 0) == 6) {
            var $call121 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call121 | 0) != 0) {
              var $retval_0 = $call121;
              break L269;
            }
            var $add125 = HEAP32[$value$s2] + 1 | 0;
            var $picSizeInMapUnits = $pPicParamSet + 40 | 0;
            HEAP32[$picSizeInMapUnits >> 2] = $add125;
            var $call128 = _H264SwDecMalloc($add125 << 2);
            var $sliceGroupId$s2 = ($pPicParamSet + 44 | 0) >> 2;
            HEAP32[$sliceGroupId$s2] = $call128;
            if (($call128 | 0) == 0) {
              var $retval_0 = 65535;
              break L269;
            }
            var $26 = HEAP32[(HEAP32[$numSliceGroups$s2] - 1 << 2) + 5250572 >> 2];
            var $i_2 = 0;
            while (1) {
              var $i_2;
              if ($i_2 >>> 0 >= HEAP32[$picSizeInMapUnits >> 2] >>> 0) {
                break L278;
              }
              var $call140 = _h264bsdGetBits($pStrmData, $26);
              HEAP32[HEAP32[$sliceGroupId$s2] + ($i_2 << 2) >> 2] = $call140;
              if (HEAP32[HEAP32[$sliceGroupId$s2] + ($i_2 << 2) >> 2] >>> 0 < HEAP32[$numSliceGroups$s2] >>> 0) {
                var $i_2 = $i_2 + 1 | 0;
              } else {
                var $retval_0 = 1;
                break L269;
              }
            }
          } else {
            break;
          }
        }
      } while (0);
      var $call157 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call157 | 0) != 0) {
        var $retval_0 = $call157;
        break;
      }
      var $32 = HEAP32[$value$s2];
      if ($32 >>> 0 > 31) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 12] = $32 + 1 | 0;
      var $call165 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call165 | 0) != 0) {
        var $retval_0 = $call165;
        break;
      }
      if (HEAP32[$value$s2] >>> 0 > 31) {
        var $retval_0 = 1;
        break;
      }
      if ((_h264bsdGetBits($pStrmData, 1) | 0) != 0) {
        var $retval_0 = 1;
        break;
      }
      if (_h264bsdGetBits($pStrmData, 2) >>> 0 > 2) {
        var $retval_0 = 1;
        break;
      }
      var $call180 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
      if (($call180 | 0) != 0) {
        var $retval_0 = $call180;
        break;
      }
      var $_off = HEAP32[$itmp$s2] + 26 | 0;
      if ($_off >>> 0 > 51) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 13] = $_off;
      var $call190 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
      if (($call190 | 0) != 0) {
        var $retval_0 = $call190;
        break;
      }
      if ((HEAP32[$itmp$s2] + 26 | 0) >>> 0 > 51) {
        var $retval_0 = 1;
        break;
      }
      var $call199 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
      if (($call199 | 0) != 0) {
        var $retval_0 = $call199;
        break;
      }
      var $38 = HEAP32[$itmp$s2];
      if (($38 + 12 | 0) >>> 0 > 24) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 14] = $38;
      var $call208 = _h264bsdGetBits($pStrmData, 1);
      if (($call208 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 15] = ($call208 | 0) == 1 & 1;
      var $call214 = _h264bsdGetBits($pStrmData, 1);
      if (($call214 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 16] = ($call214 | 0) == 1 & 1;
      var $call220 = _h264bsdGetBits($pStrmData, 1);
      if (($call220 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pPicParamSet$s2 + 17] = ($call220 | 0) == 1 & 1;
      _h264bsdRbspTrailingBits($pStrmData);
      var $retval_0 = 0;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdDecodePicParamSet["X"] = 1;
function _h264bsdDecodeSliceHeader($pStrmData, $pSliceHeader, $pSeqParamSet, $pPicParamSet, $pNalUnit) {
  var $nalUnitType40$s2;
  var $sliceType$s2;
  var $itmp$s2;
  var $value$s2;
  var $pPicParamSet$s2 = $pPicParamSet >> 2;
  var $pSeqParamSet$s2 = $pSeqParamSet >> 2;
  var $pSliceHeader$s2 = $pSliceHeader >> 2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  var $itmp = __stackBase__ + 4, $itmp$s2 = $itmp >> 2;
  _H264SwDecMemset($pSliceHeader, 0, 988);
  var $mul = HEAP32[$pSeqParamSet$s2 + 14] * HEAP32[$pSeqParamSet$s2 + 13] & -1;
  var $call = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
  L321 : do {
    if (($call | 0) == 0) {
      var $3 = HEAP32[$value$s2];
      HEAP32[$pSliceHeader$s2] = $3;
      if ($3 >>> 0 >= $mul >>> 0) {
        var $retval_0 = 1;
        break;
      }
      var $call8 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call8 | 0) != 0) {
        var $retval_0 = $call8;
        break;
      }
      var $4 = HEAP32[$value$s2];
      var $sliceType$s2 = ($pSliceHeader + 4 | 0) >> 2;
      HEAP32[$sliceType$s2] = $4;
      if (($4 | 0) == 0 | ($4 | 0) == 5) {
        if ((HEAP32[$pNalUnit >> 2] | 0) == 5) {
          var $retval_0 = 1;
          break;
        }
        if ((HEAP32[$pSeqParamSet$s2 + 11] | 0) == 0) {
          var $retval_0 = 1;
          break;
        }
      } else if (!(($4 | 0) == 2 | ($4 | 0) == 7)) {
        var $retval_0 = 1;
        break;
      }
      var $call26 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
      if (($call26 | 0) != 0) {
        var $retval_0 = $call26;
        break;
      }
      var $7 = HEAP32[$value$s2];
      HEAP32[$pSliceHeader$s2 + 2] = $7;
      if (($7 | 0) != (HEAP32[$pPicParamSet$s2] | 0)) {
        var $retval_0 = 1;
        break;
      }
      var $maxFrameNum = $pSeqParamSet + 12 | 0;
      var $9 = HEAP32[$maxFrameNum >> 2];
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if (($9 >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      var $call36 = _h264bsdGetBits($pStrmData, $i_0 - 1 | 0);
      if (($call36 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $nalUnitType40$s2 = ($pNalUnit | 0) >> 2;
      if (!((HEAP32[$nalUnitType40$s2] | 0) != 5 | ($call36 | 0) == 0)) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pSliceHeader$s2 + 3] = $call36;
      if ((HEAP32[$nalUnitType40$s2] | 0) == 5) {
        var $call49 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
        if (($call49 | 0) != 0) {
          var $retval_0 = $call49;
          break;
        }
        var $12 = HEAP32[$value$s2];
        HEAP32[$pSliceHeader$s2 + 4] = $12;
        if ($12 >>> 0 > 65535) {
          var $retval_0 = 1;
          break;
        }
      }
      var $picOrderCntType = $pSeqParamSet + 16 | 0;
      var $13 = HEAP32[$picOrderCntType >> 2];
      if (($13 | 0) == 0) {
        var $maxPicOrderCntLsb = $pSeqParamSet + 20 | 0;
        var $14 = HEAP32[$maxPicOrderCntLsb >> 2];
        var $i_1 = 0;
        while (1) {
          var $i_1;
          if (($14 >>> ($i_1 >>> 0) | 0) == 0) {
            break;
          } else {
            var $i_1 = $i_1 + 1 | 0;
          }
        }
        var $call66 = _h264bsdGetBits($pStrmData, $i_1 - 1 | 0);
        if (($call66 | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        var $picOrderCntLsb = $pSliceHeader + 20 | 0;
        HEAP32[$picOrderCntLsb >> 2] = $call66;
        if ((HEAP32[$pPicParamSet$s2 + 2] | 0) != 0) {
          var $call72 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
          if (($call72 | 0) != 0) {
            var $retval_0 = $call72;
            break;
          }
          HEAP32[$pSliceHeader$s2 + 6] = HEAP32[$itmp$s2];
        }
        if ((HEAP32[$nalUnitType40$s2] | 0) == 5) {
          var $18 = HEAP32[$picOrderCntLsb >> 2];
          if ($18 >>> 0 > HEAP32[$maxPicOrderCntLsb >> 2] >>> 1 >>> 0) {
            var $retval_0 = 1;
            break;
          }
          var $20 = HEAP32[$pSliceHeader$s2 + 6];
          if (($18 | 0) != ((($20 | 0) > 0 ? 0 : -$20 | 0) | 0)) {
            var $retval_0 = 1;
            break;
          }
        }
        var $21 = HEAP32[$picOrderCntType >> 2];
      } else {
        var $21 = $13;
      }
      var $21;
      do {
        if (($21 | 0) == 1) {
          if ((HEAP32[$pSeqParamSet$s2 + 6] | 0) != 0) {
            break;
          }
          var $call101 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
          if (($call101 | 0) != 0) {
            var $retval_0 = $call101;
            break L321;
          }
          var $arrayidx = $pSliceHeader + 28 | 0;
          HEAP32[$arrayidx >> 2] = HEAP32[$itmp$s2];
          if ((HEAP32[$pPicParamSet$s2 + 2] | 0) != 0) {
            var $call108 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call108 | 0) != 0) {
              var $retval_0 = $call108;
              break L321;
            }
            HEAP32[$pSliceHeader$s2 + 8] = HEAP32[$itmp$s2];
          }
          if ((HEAP32[$nalUnitType40$s2] | 0) != 5) {
            break;
          }
          var $27 = HEAP32[$arrayidx >> 2];
          var $add125 = HEAP32[$pSeqParamSet$s2 + 8] + $27 + HEAP32[$pSliceHeader$s2 + 8] | 0;
          if (((($27 | 0) < ($add125 | 0) ? $27 : $add125) | 0) != 0) {
            var $retval_0 = 1;
            break L321;
          }
        }
      } while (0);
      if ((HEAP32[$pPicParamSet$s2 + 17] | 0) != 0) {
        var $call146 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
        if (($call146 | 0) != 0) {
          var $retval_0 = $call146;
          break;
        }
        var $31 = HEAP32[$value$s2];
        HEAP32[$pSliceHeader$s2 + 9] = $31;
        if ($31 >>> 0 > 127) {
          var $retval_0 = 1;
          break;
        }
      }
      var $32 = HEAP32[$sliceType$s2];
      if (($32 | 0) == 0 | ($32 | 0) == 5) {
        var $call160 = _h264bsdGetBits($pStrmData, 1);
        if (($call160 | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        HEAP32[$pSliceHeader$s2 + 10] = $call160;
        if (($call160 | 0) == 0) {
          var $34 = HEAP32[$pPicParamSet$s2 + 12];
          if ($34 >>> 0 > 16) {
            var $retval_0 = 1;
            break;
          }
          HEAP32[$pSliceHeader$s2 + 11] = $34;
        } else {
          var $call167 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
          if (($call167 | 0) != 0) {
            var $retval_0 = $call167;
            break;
          }
          var $33 = HEAP32[$value$s2];
          if ($33 >>> 0 > 15) {
            var $retval_0 = 1;
            break;
          }
          HEAP32[$pSliceHeader$s2 + 11] = $33 + 1 | 0;
        }
        var $35 = HEAP32[$sliceType$s2];
      } else {
        var $35 = $32;
      }
      var $35;
      if (($35 | 0) == 0 | ($35 | 0) == 5) {
        var $call191 = _RefPicListReordering($pStrmData, $pSliceHeader + 68 | 0, HEAP32[$pSliceHeader$s2 + 11], HEAP32[$maxFrameNum >> 2]);
        if (($call191 | 0) != 0) {
          var $retval_0 = $call191;
          break;
        }
      }
      if ((HEAP32[$pNalUnit + 4 >> 2] | 0) != 0) {
        var $call200 = _DecRefPicMarking($pStrmData, $pSliceHeader + 276 | 0, HEAP32[$nalUnitType40$s2], HEAP32[$pSeqParamSet$s2 + 11]);
        if (($call200 | 0) != 0) {
          var $retval_0 = $call200;
          break;
        }
      }
      var $call205 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
      if (($call205 | 0) != 0) {
        var $retval_0 = $call205;
        break;
      }
      var $41 = HEAP32[$itmp$s2];
      HEAP32[$pSliceHeader$s2 + 12] = $41;
      var $add209 = $41 + HEAP32[$pPicParamSet$s2 + 13] | 0;
      HEAP32[$itmp$s2] = $add209;
      if ($add209 >>> 0 > 51) {
        var $retval_0 = 1;
        break;
      }
      do {
        if ((HEAP32[$pPicParamSet$s2 + 15] | 0) != 0) {
          var $call217 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
          if (($call217 | 0) != 0) {
            var $retval_0 = $call217;
            break L321;
          }
          var $45 = HEAP32[$value$s2];
          HEAP32[$pSliceHeader$s2 + 13] = $45;
          if ($45 >>> 0 > 2) {
            var $retval_0 = 1;
            break L321;
          }
          if (($45 | 0) == 1) {
            break;
          }
          var $call228 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
          if (($call228 | 0) != 0) {
            var $retval_0 = $call228;
            break L321;
          }
          var $46 = HEAP32[$itmp$s2];
          if (($46 + 6 | 0) >>> 0 > 12) {
            var $retval_0 = 1;
            break L321;
          }
          HEAP32[$pSliceHeader$s2 + 14] = $46 << 1;
          var $call238 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
          if (($call238 | 0) != 0) {
            var $retval_0 = $call238;
            break L321;
          }
          var $48 = HEAP32[$itmp$s2];
          if (($48 + 6 | 0) >>> 0 > 12) {
            var $retval_0 = 1;
            break L321;
          }
          HEAP32[$pSliceHeader$s2 + 15] = $48 << 1;
        }
      } while (0);
      do {
        if (HEAP32[$pPicParamSet$s2 + 3] >>> 0 > 1) {
          if ((HEAP32[$pPicParamSet$s2 + 4] - 3 | 0) >>> 0 >= 3) {
            break;
          }
          var $sliceGroupChangeRate = $pPicParamSet + 36 | 0;
          var $call258 = _h264bsdGetBits($pStrmData, _NumSliceGroupChangeCycleBits($mul, HEAP32[$sliceGroupChangeRate >> 2]));
          HEAP32[$value$s2] = $call258;
          if (($call258 | 0) == -1) {
            var $retval_0 = 1;
            break L321;
          }
          HEAP32[$pSliceHeader$s2 + 16] = $call258;
          var $54 = HEAP32[$sliceGroupChangeRate >> 2];
          if ($call258 >>> 0 > Math.floor((($mul - 1 + $54 | 0) >>> 0) / ($54 >>> 0)) >>> 0) {
            var $retval_0 = 1;
            break L321;
          }
        }
      } while (0);
      var $retval_0 = 0;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdDecodeSliceHeader["X"] = 1;
function _RefPicListReordering($pStrmData, $pRefPicListReordering, $numRefIdxActive, $maxPicNum) {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__;
  var $command = __stackBase__ + 4;
  var $call = _h264bsdGetBits($pStrmData, 1);
  L405 : do {
    if (($call | 0) == -1) {
      var $retval_0 = 1;
    } else {
      HEAP32[$pRefPicListReordering >> 2] = $call;
      if (($call | 0) != 0) {
        var $i_0 = 0;
        while (1) {
          var $i_0;
          if ($i_0 >>> 0 > $numRefIdxActive >>> 0) {
            var $retval_0 = 1;
            break L405;
          }
          var $call9 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $command);
          if (($call9 | 0) != 0) {
            var $retval_0 = $call9;
            break L405;
          }
          var $0 = HEAP32[$command >> 2];
          if ($0 >>> 0 > 3) {
            var $retval_0 = 1;
            break L405;
          }
          HEAP32[($pRefPicListReordering + 4 >> 2) + ($i_0 * 3 | 0)] = $0;
          if ($0 >>> 0 < 2) {
            var $call20 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call20 | 0) != 0) {
              var $retval_0 = $call20;
              break L405;
            }
            var $2 = HEAP32[$value >> 2];
            if ($2 >>> 0 >= $maxPicNum >>> 0) {
              var $retval_0 = 1;
              break L405;
            }
            HEAP32[($pRefPicListReordering + 8 >> 2) + ($i_0 * 3 | 0)] = $2 + 1 | 0;
          } else {
            if (($0 | 0) != 2) {
              break;
            }
            var $call31 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call31 | 0) != 0) {
              var $retval_0 = $call31;
              break L405;
            }
            HEAP32[($pRefPicListReordering + 12 >> 2) + ($i_0 * 3 | 0)] = HEAP32[$value >> 2];
          }
          if (($0 | 0) == 3) {
            break;
          } else {
            var $i_0 = $i_0 + 1 | 0;
          }
        }
        if (($i_0 | 0) == 0) {
          var $retval_0 = 1;
          break;
        }
      }
      var $retval_0 = 0;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _NumSliceGroupChangeCycleBits($picSizeInMbs, $sliceGroupChangeRate) {
  var $tmp_0 = ((($picSizeInMbs >>> 0) % ($sliceGroupChangeRate >>> 0) | 0) == 0 ? 1 : 2) + Math.floor(($picSizeInMbs >>> 0) / ($sliceGroupChangeRate >>> 0)) | 0;
  var $numBits_0 = 0;
  while (1) {
    var $numBits_0;
    var $inc = $numBits_0 + 1 | 0;
    if ((-1 << $inc & $tmp_0 | 0) == 0) {
      break;
    } else {
      var $numBits_0 = $inc;
    }
  }
  return ((1 << $numBits_0) - 1 & $tmp_0 | 0) == 0 ? $numBits_0 : $inc;
}
function _SetMbParams($pMb, $pSlice_0_12_val, $pSlice_0_13_val, $pSlice_0_14_val, $sliceId, $chromaQpIndexOffset) {
  var $pMb$s2 = $pMb >> 2;
  HEAP32[$pMb$s2 + 1] = $sliceId;
  HEAP32[$pMb$s2 + 2] = $pSlice_0_12_val;
  HEAP32[$pMb$s2 + 3] = $pSlice_0_13_val;
  HEAP32[$pMb$s2 + 4] = $pSlice_0_14_val;
  HEAP32[$pMb$s2 + 6] = $chromaQpIndexOffset;
  return;
}
function _DecRefPicMarking($pStrmData, $pDecRefPicMarking, $nalUnitType, $numRefFrames) {
  var $value$s2;
  var $pDecRefPicMarking$s2 = $pDecRefPicMarking >> 2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  var $operation = __stackBase__ + 4;
  var $call = _h264bsdGetBits($pStrmData, 1);
  var $cmp8 = ($call | 0) == -1;
  L430 : do {
    if (($nalUnitType | 0) == 5) {
      if ($cmp8) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pDecRefPicMarking$s2] = $call;
      var $call10 = _h264bsdGetBits($pStrmData, 1);
      if (($call10 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pDecRefPicMarking$s2 + 1] = $call10;
      if (($numRefFrames | 0) != 0 | ($call10 | 0) == 0) {
        label = 374;
        break;
      } else {
        var $retval_0 = 1;
        break;
      }
    } else {
      if ($cmp8) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$pDecRefPicMarking$s2 + 2] = $call;
      if (($call | 0) == 0) {
        label = 374;
        break;
      }
      var $add = ($numRefFrames << 1) + 2 | 0;
      var $num1to3_0 = 0;
      var $num6_0 = 0;
      var $num5_0 = 0;
      var $num4_0 = 0;
      var $i_0 = 0;
      while (1) {
        var $i_0;
        var $num4_0;
        var $num5_0;
        var $num6_0;
        var $num1to3_0;
        if ($i_0 >>> 0 > $add >>> 0) {
          var $retval_0 = 1;
          break L430;
        }
        var $call28 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $operation);
        if (($call28 | 0) != 0) {
          var $retval_0 = $call28;
          break L430;
        }
        var $0 = HEAP32[$operation >> 2];
        if ($0 >>> 0 > 6) {
          var $retval_0 = 1;
          break L430;
        }
        HEAP32[$pDecRefPicMarking$s2 + ($i_0 * 5 | 0) + 3] = $0;
        do {
          if (($0 | 0) == 3 | ($0 | 0) == 1) {
            var $call39 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call39 | 0) != 0) {
              var $retval_0 = $call39;
              break L430;
            }
            HEAP32[$pDecRefPicMarking$s2 + ($i_0 * 5 | 0) + 4] = HEAP32[$value$s2] + 1 | 0;
            if (($0 | 0) == 6 | ($0 | 0) == 3) {
              label = 363;
              break;
            } else if (($0 | 0) == 4) {
              label = 365;
              break;
            } else if (($0 | 0) == 2) {
              label = 361;
              break;
            } else {
              var $num4_1 = $num4_0;
              break;
            }
          } else if (($0 | 0) == 6) {
            label = 363;
          } else if (($0 | 0) == 4) {
            label = 365;
          } else if (($0 | 0) == 2) {
            label = 361;
          } else {
            var $num4_1 = $num4_0;
          }
        } while (0);
        do {
          if (label == 363) {
            label = 0;
            var $call60 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call60 | 0) != 0) {
              var $retval_0 = $call60;
              break L430;
            }
            HEAP32[$pDecRefPicMarking$s2 + ($i_0 * 5 | 0) + 6] = HEAP32[$value$s2];
            if (($0 | 0) == 4) {
              label = 365;
              break;
            } else {
              var $num4_1 = $num4_0;
              break;
            }
          } else if (label == 361) {
            label = 0;
            var $call49 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
            if (($call49 | 0) != 0) {
              var $retval_0 = $call49;
              break L430;
            }
            HEAP32[$pDecRefPicMarking$s2 + ($i_0 * 5 | 0) + 5] = HEAP32[$value$s2];
            var $num4_1 = $num4_0;
            break;
          }
        } while (0);
        if (label == 365) {
          label = 0;
          var $call69 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
          if (($call69 | 0) != 0) {
            var $retval_0 = $call69;
            break L430;
          }
          var $4 = HEAP32[$value$s2];
          if ($4 >>> 0 > $numRefFrames >>> 0) {
            var $retval_0 = 1;
            break L430;
          }
          if (($4 | 0) == 0) {
            HEAP32[$pDecRefPicMarking$s2 + ($i_0 * 5 | 0) + 7] = 65535;
          } else {
            HEAP32[$pDecRefPicMarking$s2 + ($i_0 * 5 | 0) + 7] = $4 - 1 | 0;
          }
          var $num4_1 = $num4_0 + 1 | 0;
        }
        var $num4_1;
        var $inc88_num5_0 = (($0 | 0) == 5 & 1) + $num5_0 | 0;
        var $num1to3_1 = (($0 | 0) != 0 & $0 >>> 0 < 4 & 1) + $num1to3_0 | 0;
        var $inc98_num6_0 = (($0 | 0) == 6 & 1) + $num6_0 | 0;
        if (($0 | 0) == 0) {
          break;
        } else {
          var $num1to3_0 = $num1to3_1;
          var $num6_0 = $inc98_num6_0;
          var $num5_0 = $inc88_num5_0;
          var $num4_0 = $num4_1;
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      if ($num4_1 >>> 0 > 1 | $inc88_num5_0 >>> 0 > 1 | $inc98_num6_0 >>> 0 > 1) {
        var $retval_0 = 1;
        break;
      }
      if (($num1to3_1 | 0) == 0 | ($inc88_num5_0 | 0) == 0) {
        label = 374;
        break;
      } else {
        var $retval_0 = 1;
        break;
      }
    }
  } while (0);
  if (label == 374) {
    var $retval_0 = 0;
  }
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_DecRefPicMarking["X"] = 1;
function _h264bsdCheckPpsId($pStrmData, $picParamSetId) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $value = __stackBase__;
  var $tmpStrmData = __stackBase__ + 4;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  do {
    if (($call | 0) == 0) {
      var $call5 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call5 | 0) != 0) {
        var $retval_0 = $call5;
        break;
      }
      var $call10 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call10 | 0) != 0) {
        var $retval_0 = $call10;
        break;
      }
      var $2 = HEAP32[$value >> 2];
      if ($2 >>> 0 > 255) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$picParamSetId >> 2] = $2;
      var $retval_0 = 0;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdCheckFrameNum($pStrmData, $maxFrameNum, $frameNum) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $value = __stackBase__;
  var $tmpStrmData = __stackBase__ + 4;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  do {
    if (($call | 0) == 0) {
      var $call6 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call6 | 0) != 0) {
        var $retval_0 = $call6;
        break;
      }
      var $call11 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call11 | 0) == 0) {
        var $i_0 = 0;
      } else {
        var $retval_0 = $call11;
        break;
      }
      while (1) {
        var $i_0;
        if (($maxFrameNum >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      var $call16 = _h264bsdGetBits($arraydecay, $i_0 - 1 | 0);
      if (($call16 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$frameNum >> 2] = $call16;
      var $retval_0 = 0;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdCheckIdrPicId($pStrmData, $maxFrameNum, $idrPicId) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $value = __stackBase__;
  var $tmpStrmData = __stackBase__ + 4;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  do {
    if (($call | 0) == 0) {
      var $call9 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call9 | 0) != 0) {
        var $retval_0 = $call9;
        break;
      }
      var $call14 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call14 | 0) == 0) {
        var $i_0 = 0;
      } else {
        var $retval_0 = $call14;
        break;
      }
      while (1) {
        var $i_0;
        if (($maxFrameNum >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      if ((_h264bsdGetBits($arraydecay, $i_0 - 1 | 0) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $retval_0 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $idrPicId);
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdCheckPicOrderCntLsb($pStrmData, $pSeqParamSet, $nalUnitType, $picOrderCntLsb) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $value = __stackBase__;
  var $tmpStrmData = __stackBase__ + 4;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  do {
    if (($call | 0) == 0) {
      var $call6 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call6 | 0) != 0) {
        var $retval_0 = $call6;
        break;
      }
      var $call11 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call11 | 0) != 0) {
        var $retval_0 = $call11;
        break;
      }
      var $2 = HEAP32[$pSeqParamSet + 12 >> 2];
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if (($2 >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      if ((_h264bsdGetBits($arraydecay, $i_0 - 1 | 0) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      if (($nalUnitType | 0) == 5) {
        var $call23 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
        if (($call23 | 0) != 0) {
          var $retval_0 = $call23;
          break;
        }
      }
      var $3 = HEAP32[$pSeqParamSet + 20 >> 2];
      var $i_1 = 0;
      while (1) {
        var $i_1;
        if (($3 >>> ($i_1 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_1 = $i_1 + 1 | 0;
        }
      }
      var $call36 = _h264bsdGetBits($arraydecay, $i_1 - 1 | 0);
      if (($call36 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$picOrderCntLsb >> 2] = $call36;
      var $retval_0 = 0;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdCheckDeltaPicOrderCntBottom($pStrmData, $pSeqParamSet, $nalUnitType, $deltaPicOrderCntBottom) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $value = __stackBase__;
  var $tmpStrmData = __stackBase__ + 4;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  do {
    if (($call | 0) == 0) {
      var $call6 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call6 | 0) != 0) {
        var $retval_0 = $call6;
        break;
      }
      var $call11 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call11 | 0) != 0) {
        var $retval_0 = $call11;
        break;
      }
      var $2 = HEAP32[$pSeqParamSet + 12 >> 2];
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if (($2 >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      if ((_h264bsdGetBits($arraydecay, $i_0 - 1 | 0) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      if (($nalUnitType | 0) == 5) {
        var $call23 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
        if (($call23 | 0) != 0) {
          var $retval_0 = $call23;
          break;
        }
      }
      var $3 = HEAP32[$pSeqParamSet + 20 >> 2];
      var $i_1 = 0;
      while (1) {
        var $i_1;
        if (($3 >>> ($i_1 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_1 = $i_1 + 1 | 0;
        }
      }
      if ((_h264bsdGetBits($arraydecay, $i_1 - 1 | 0) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $retval_0 = _h264bsdDecodeExpGolombSigned($arraydecay, $deltaPicOrderCntBottom);
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdCheckDeltaPicOrderCnt($pStrmData, $pSeqParamSet, $nalUnitType, $picOrderPresentFlag, $deltaPicOrderCnt) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $value = __stackBase__;
  var $tmpStrmData = __stackBase__ + 4;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  do {
    if (($call | 0) == 0) {
      var $call6 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call6 | 0) != 0) {
        var $retval_0 = $call6;
        break;
      }
      var $call11 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call11 | 0) != 0) {
        var $retval_0 = $call11;
        break;
      }
      var $2 = HEAP32[$pSeqParamSet + 12 >> 2];
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if (($2 >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      if ((_h264bsdGetBits($arraydecay, $i_0 - 1 | 0) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      if (($nalUnitType | 0) == 5) {
        var $call23 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
        if (($call23 | 0) != 0) {
          var $retval_0 = $call23;
          break;
        }
      }
      var $call29 = _h264bsdDecodeExpGolombSigned($arraydecay, $deltaPicOrderCnt);
      if (($call29 | 0) != 0) {
        var $retval_0 = $call29;
        break;
      }
      if (($picOrderPresentFlag | 0) != 0) {
        var $call37 = _h264bsdDecodeExpGolombSigned($arraydecay, $deltaPicOrderCnt + 4 | 0);
        if (($call37 | 0) != 0) {
          var $retval_0 = $call37;
          break;
        }
      }
      var $retval_0 = 0;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdCheckPriorPicsFlag($noOutputOfPriorPicsFlag, $pStrmData, $pSeqParamSet, $pPicParamSet) {
  var $1$s2;
  var $0$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 28 | 0;
  var $value = __stackBase__;
  var $ivalue = __stackBase__ + 4;
  var $tmpStrmData = __stackBase__ + 8;
  var $arraydecay = $tmpStrmData | 0;
  var $0$s2 = $tmpStrmData >> 2;
  var $1$s2 = $pStrmData >> 2;
  HEAP32[$0$s2] = HEAP32[$1$s2];
  HEAP32[$0$s2 + 1] = HEAP32[$1$s2 + 1];
  HEAP32[$0$s2 + 2] = HEAP32[$1$s2 + 2];
  HEAP32[$0$s2 + 3] = HEAP32[$1$s2 + 3];
  HEAP32[$0$s2 + 4] = HEAP32[$1$s2 + 4];
  var $call = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
  L541 : do {
    if (($call | 0) == 0) {
      var $call7 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call7 | 0) != 0) {
        var $retval_0 = $call7;
        break;
      }
      var $call12 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call12 | 0) != 0) {
        var $retval_0 = $call12;
        break;
      }
      var $2 = HEAP32[$pSeqParamSet + 12 >> 2];
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if (($2 >>> ($i_0 >>> 0) | 0) == 0) {
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      if ((_h264bsdGetBits($arraydecay, $i_0 - 1 | 0) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      var $call22 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
      if (($call22 | 0) != 0) {
        var $retval_0 = $call22;
        break;
      }
      var $picOrderCntType = $pSeqParamSet + 16 | 0;
      var $3 = HEAP32[$picOrderCntType >> 2];
      if (($3 | 0) == 0) {
        var $4 = HEAP32[$pSeqParamSet + 20 >> 2];
        var $i_1 = 0;
        while (1) {
          var $i_1;
          if (($4 >>> ($i_1 >>> 0) | 0) == 0) {
            break;
          } else {
            var $i_1 = $i_1 + 1 | 0;
          }
        }
        if ((_h264bsdGetBits($arraydecay, $i_1 - 1 | 0) | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        if ((HEAP32[$pPicParamSet + 8 >> 2] | 0) != 0) {
          var $call43 = _h264bsdDecodeExpGolombSigned($arraydecay, $ivalue);
          if (($call43 | 0) != 0) {
            var $retval_0 = $call43;
            break;
          }
        }
        var $6 = HEAP32[$picOrderCntType >> 2];
      } else {
        var $6 = $3;
      }
      var $6;
      do {
        if (($6 | 0) == 1) {
          if ((HEAP32[$pSeqParamSet + 24 >> 2] | 0) != 0) {
            break;
          }
          var $call54 = _h264bsdDecodeExpGolombSigned($arraydecay, $ivalue);
          if (($call54 | 0) != 0) {
            var $retval_0 = $call54;
            break L541;
          }
          if ((HEAP32[$pPicParamSet + 8 >> 2] | 0) == 0) {
            break;
          }
          var $call62 = _h264bsdDecodeExpGolombSigned($arraydecay, $ivalue);
          if (($call62 | 0) != 0) {
            var $retval_0 = $call62;
            break L541;
          }
        }
      } while (0);
      if ((HEAP32[$pPicParamSet + 68 >> 2] | 0) != 0) {
        var $call71 = _h264bsdDecodeExpGolombUnsigned($arraydecay, $value);
        if (($call71 | 0) != 0) {
          var $retval_0 = $call71;
          break;
        }
      }
      var $call77 = _h264bsdGetBits($arraydecay, 1);
      HEAP32[$noOutputOfPriorPicsFlag >> 2] = $call77;
      var $retval_0 = ($call77 | 0) == -1 & 1;
    } else {
      var $retval_0 = $call;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdCheckPriorPicsFlag["X"] = 1;
function _h264bsdDecodeSliceData($pStrmData, $pStorage, $currImage, $pSliceHeader) {
  var $sliceType$s2;
  var $mb$s2;
  var $activePps$s2;
  var $sliceId$s2;
  var $skipRun$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 440 | 0;
  var $mbData = __stackBase__;
  var $skipRun = __stackBase__ + 432, $skipRun$s2 = $skipRun >> 2;
  var $qpY = __stackBase__ + 436;
  var $add_ptr = $mbData + (-$mbData & 15) | 0;
  var $2 = HEAP32[$pStorage + 3376 >> 2];
  var $3 = HEAP32[$pSliceHeader >> 2];
  HEAP32[$skipRun$s2] = 0;
  var $sliceId$s2 = ($pStorage + 1192 | 0) >> 2;
  HEAP32[$sliceId$s2] = HEAP32[$sliceId$s2] + 1 | 0;
  var $lastMbAddr = $pStorage + 1200 | 0;
  HEAP32[$lastMbAddr >> 2] = 0;
  var $activePps$s2 = ($pStorage + 12 | 0) >> 2;
  HEAP32[$qpY >> 2] = HEAP32[$pSliceHeader + 48 >> 2] + HEAP32[HEAP32[$activePps$s2] + 52 >> 2] | 0;
  var $redundantPicCnt = $pSliceHeader + 36 | 0;
  var $mb$s2 = ($pStorage + 1212 | 0) >> 2;
  var $sliceType$s2 = ($pSliceHeader + 4 | 0) >> 2;
  var $picSizeInMbs = $pStorage + 1176 | 0;
  var $8 = $2 + 12 | 0;
  var $mbType = $2 | 0;
  var $numRefIdxL0Active = $pSliceHeader + 44 | 0;
  var $arraydecay49 = $pStorage + 1220 | 0;
  var $sliceGroupMap = $pStorage + 1172 | 0;
  var $pSliceHeader_idx = $pSliceHeader + 52 | 0;
  var $pSliceHeader_idx1 = $pSliceHeader + 56 | 0;
  var $pSliceHeader_idx2 = $pSliceHeader + 60 | 0;
  var $mbCount_0 = 0;
  var $currMbAddr_0 = $3;
  var $prevSkipped_0 = 0;
  var $11 = 0;
  var $10 = 0;
  var $9 = HEAP32[$mb$s2];
  L571 : while (1) {
    var $9;
    var $10;
    var $11;
    var $prevSkipped_0;
    var $currMbAddr_0;
    var $mbCount_0;
    if ((HEAP32[$redundantPicCnt >> 2] | 0) == 0) {
      if ((HEAP32[($9 + 196 >> 2) + ($currMbAddr_0 * 54 | 0)] | 0) != 0) {
        var $retval_0 = 1;
        label = 479;
        break;
      }
    }
    _SetMbParams($9 + $currMbAddr_0 * 216 | 0, HEAP32[$pSliceHeader_idx >> 2], HEAP32[$pSliceHeader_idx1 >> 2], HEAP32[$pSliceHeader_idx2 >> 2], HEAP32[$sliceId$s2], HEAP32[HEAP32[$activePps$s2] + 56 >> 2]);
    var $17 = HEAP32[$sliceType$s2];
    do {
      if (($17 | 0) == 2 | ($17 | 0) == 7) {
        var $prevSkipped_1 = $prevSkipped_0;
        var $21 = $11;
        var $20 = $10;
        label = 467;
      } else {
        if (($prevSkipped_0 | 0) != 0) {
          var $prevSkipped_1 = $prevSkipped_0;
          var $21 = $11;
          var $20 = $10;
          label = 467;
          break;
        }
        var $call = _h264bsdDecodeExpGolombUnsigned($pStrmData, $skipRun);
        if (($call | 0) != 0) {
          var $retval_0 = $call;
          label = 480;
          break L571;
        }
        var $18 = HEAP32[$skipRun$s2];
        if ($18 >>> 0 > (HEAP32[$picSizeInMbs >> 2] - $currMbAddr_0 | 0) >>> 0) {
          var $retval_0 = 1;
          label = 481;
          break L571;
        }
        if (($18 | 0) == 0) {
          var $22 = 0;
          label = 469;
          break;
        }
        _H264SwDecMemset($8, 0, 164);
        HEAP32[$mbType >> 2] = 0;
        var $prevSkipped_1 = 1;
        var $21 = $18;
        var $20 = $18;
        label = 467;
        break;
      }
    } while (0);
    do {
      if (label == 467) {
        label = 0;
        var $20;
        var $21;
        var $prevSkipped_1;
        if (($21 | 0) == 0) {
          var $22 = $20;
          label = 469;
          break;
        }
        var $dec = $21 - 1 | 0;
        HEAP32[$skipRun$s2] = $dec;
        var $prevSkipped_2 = $prevSkipped_1;
        var $27 = $dec;
        var $26 = $dec;
        break;
      }
    } while (0);
    if (label == 469) {
      label = 0;
      var $22;
      var $call42 = _h264bsdDecodeMacroblockLayer($pStrmData, $2, HEAP32[$mb$s2] + $currMbAddr_0 * 216 | 0, HEAP32[$sliceType$s2], HEAP32[$numRefIdxL0Active >> 2]);
      if (($call42 | 0) == 0) {
        var $prevSkipped_2 = 0;
        var $27 = 0;
        var $26 = $22;
      } else {
        var $retval_0 = $call42;
        label = 482;
        break;
      }
    }
    var $26;
    var $27;
    var $prevSkipped_2;
    var $call51 = _h264bsdDecodeMacroblock(HEAP32[$mb$s2] + $currMbAddr_0 * 216 | 0, $2, $currImage, $arraydecay49, $qpY, $currMbAddr_0, HEAP32[HEAP32[$activePps$s2] + 64 >> 2], $add_ptr);
    if (($call51 | 0) != 0) {
      var $retval_0 = $call51;
      label = 483;
      break;
    }
    var $31 = HEAP32[$mb$s2];
    var $inc60_mbCount_0 = ((HEAP32[($31 + 196 >> 2) + ($currMbAddr_0 * 54 | 0)] | 0) == 1 & 1) + $mbCount_0 | 0;
    var $tobool63 = (_h264bsdMoreRbspData($pStrmData) | 0) == 0;
    var $tobool64_ = ($26 | 0) != 0 | $tobool63 ^ 1;
    var $33 = HEAP32[$sliceType$s2];
    if (($33 | 0) == 2 | ($33 | 0) == 7) {
      HEAP32[$lastMbAddr >> 2] = $currMbAddr_0;
    }
    var $35 = HEAP32[$picSizeInMbs >> 2];
    var $call76 = _h264bsdNextMbAddress(HEAP32[$sliceGroupMap >> 2], $35, $currMbAddr_0);
    if ($tobool64_ & ($call76 | 0) == 0) {
      var $retval_0 = 1;
      label = 485;
      break;
    }
    if ($tobool64_) {
      var $mbCount_0 = $inc60_mbCount_0;
      var $currMbAddr_0 = $call76;
      var $prevSkipped_0 = $prevSkipped_2;
      var $11 = $tobool63 ? $26 : $27;
      var $10 = $26;
      var $9 = $31;
    } else {
      label = 475;
      break;
    }
  }
  if (label == 475) {
    var $numDecodedMbs = $pStorage + 1196 | 0;
    var $add85 = HEAP32[$numDecodedMbs >> 2] + $inc60_mbCount_0 | 0;
    if ($add85 >>> 0 > $35 >>> 0) {
      var $retval_0 = 1;
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
    HEAP32[$numDecodedMbs >> 2] = $add85;
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 481) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 482) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 483) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 479) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 480) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 485) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
}
_h264bsdDecodeSliceData["X"] = 1;
function _h264bsdMarkSliceCorrupted($pStorage, $firstMbInSlice) {
  var label = 0;
  var $0 = HEAP32[$pStorage + 1192 >> 2];
  var $1 = HEAP32[$pStorage + 1200 >> 2];
  var $mb20_pre = $pStorage + 1212 | 0;
  L606 : do {
    if (($1 | 0) == 0) {
      var $currMbAddr_0_ph = $firstMbInSlice;
    } else {
      var $activeSps = $pStorage + 16 | 0;
      var $tmp_0_ph = 0;
      var $i_0_in_ph = $1;
      while (1) {
        var $i_0_in_ph;
        var $tmp_0_ph;
        var $i_0_in = $i_0_in_ph;
        while (1) {
          var $i_0_in;
          var $i_0 = $i_0_in - 1 | 0;
          if ($i_0 >>> 0 <= $firstMbInSlice >>> 0) {
            var $currMbAddr_0_ph = $i_0;
            break L606;
          }
          if ((HEAP32[(HEAP32[$mb20_pre >> 2] + 4 >> 2) + ($i_0 * 54 | 0)] | 0) == ($0 | 0)) {
            break;
          } else {
            var $i_0_in = $i_0;
          }
        }
        var $inc = $tmp_0_ph + 1 | 0;
        var $5 = HEAP32[HEAP32[$activeSps >> 2] + 52 >> 2];
        if ($inc >>> 0 < ($5 >>> 0 > 10 ? $5 : 10) >>> 0) {
          var $tmp_0_ph = $inc;
          var $i_0_in_ph = $i_0;
        } else {
          var $currMbAddr_0_ph = $i_0;
          break L606;
        }
      }
    }
  } while (0);
  var $currMbAddr_0_ph;
  var $sliceGroupMap = $pStorage + 1172 | 0;
  var $picSizeInMbs = $pStorage + 1176 | 0;
  var $currMbAddr_0 = $currMbAddr_0_ph;
  while (1) {
    var $currMbAddr_0;
    var $6 = HEAP32[$mb20_pre >> 2];
    if ((HEAP32[($6 + 4 >> 2) + ($currMbAddr_0 * 54 | 0)] | 0) != ($0 | 0)) {
      label = 499;
      break;
    }
    var $decoded = $6 + $currMbAddr_0 * 216 + 196 | 0;
    var $8 = HEAP32[$decoded >> 2];
    if (($8 | 0) == 0) {
      label = 498;
      break;
    }
    HEAP32[$decoded >> 2] = $8 - 1 | 0;
    var $call = _h264bsdNextMbAddress(HEAP32[$sliceGroupMap >> 2], HEAP32[$picSizeInMbs >> 2], $currMbAddr_0);
    if (($call | 0) == 0) {
      label = 497;
      break;
    } else {
      var $currMbAddr_0 = $call;
    }
  }
  if (label == 497) {
    return;
  } else if (label == 498) {
    return;
  } else if (label == 499) {
    return;
  }
}
_h264bsdMarkSliceCorrupted["X"] = 1;
function _h264bsdNumMbPart($mbType) {
  if (($mbType | 0) == 2 | ($mbType | 0) == 3) {
    var $retval_0 = 2;
  } else if (($mbType | 0) == 1 | ($mbType | 0) == 0) {
    var $retval_0 = 1;
  } else {
    var $retval_0 = 4;
  }
  var $retval_0;
  return $retval_0;
}
function _h264bsdMbPartPredMode($mbType) {
  if ($mbType >>> 0 < 6) {
    var $retval_0 = 2;
  } else {
    var $retval_0 = ($mbType | 0) != 6 & 1;
  }
  var $retval_0;
  return $retval_0;
}
function _CbpIntra16x16($mbType) {
  var $sub = $mbType - 7 | 0;
  var $shr = $sub >>> 2;
  return ($sub >>> 0 > 11 ? $shr + 268435453 | 0 : $shr) << 4 | ($mbType >>> 0 > 18 ? 15 : 0);
}
function _h264bsdDecodeMacroblockLayer($pStrmData, $pMbLayer, $pMb, $sliceType, $numRefIdxActive) {
  var $value$s2;
  var $pMbLayer$s2 = $pMbLayer >> 2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  var $itmp = __stackBase__ + 4;
  _H264SwDecMemset($pMbLayer, 0, 2088);
  var $call = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
  var $1 = HEAP32[$value$s2];
  do {
    if (($sliceType | 0) == 7 | ($sliceType | 0) == 2) {
      var $add = $1 + 6 | 0;
      if ($add >>> 0 < 32 & ($call | 0) == 0) {
        HEAP32[$pMbLayer$s2] = $add;
        var $2 = $add;
        break;
      } else {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    } else {
      var $add11 = $1 + 1 | 0;
      if ($add11 >>> 0 < 32 & ($call | 0) == 0) {
        HEAP32[$pMbLayer$s2] = $add11;
        var $2 = $add11;
        break;
      } else {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    }
  } while (0);
  var $2;
  var $mbType20 = $pMbLayer | 0;
  L644 : do {
    if (($2 | 0) == 31) {
      var $pStrmData_idx = $pStrmData + 8 | 0;
      while (1) {
        if ((_h264bsdIsByteAligned(HEAP32[$pStrmData_idx >> 2]) | 0) != 0) {
          break;
        }
        if ((_h264bsdGetBits($pStrmData, 1) | 0) != 0) {
          var $retval_0 = 1;
          label = 538;
          break;
        }
      }
      if (label == 538) {
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $i_053 = 0;
      var $level_054 = $pMbLayer + 328 | 0;
      while (1) {
        var $level_054;
        var $i_053;
        var $call31 = _h264bsdGetBits($pStrmData, 8);
        HEAP32[$value$s2] = $call31;
        if (($call31 | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        HEAP32[$level_054 >> 2] = $call31;
        var $inc = $i_053 + 1 | 0;
        if ($inc >>> 0 < 384) {
          var $i_053 = $inc;
          var $level_054 = $level_054 + 4 | 0;
        } else {
          break L644;
        }
      }
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    } else {
      var $call37 = _h264bsdMbPartPredMode($2);
      do {
        if (($call37 | 0) == 2) {
          if ((_h264bsdNumMbPart($2) | 0) != 4) {
            label = 523;
            break;
          }
          var $tmp_0 = _DecodeSubMbPred($pStrmData, $pMbLayer + 176 | 0, $2, $numRefIdxActive);
          break;
        } else {
          label = 523;
        }
      } while (0);
      if (label == 523) {
        var $tmp_0 = _DecodeMbPred($pStrmData, $pMbLayer + 12 | 0, $2, $numRefIdxActive);
      }
      var $tmp_0;
      if (($tmp_0 | 0) != 0) {
        var $retval_0 = $tmp_0;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      do {
        if (($call37 | 0) == 1) {
          HEAP32[$pMbLayer$s2 + 1] = _CbpIntra16x16(HEAP32[$mbType20 >> 2]);
        } else {
          var $call55 = _h264bsdDecodeExpGolombMapped($pStrmData, $value, ($call37 | 0) == 0 & 1);
          if (($call55 | 0) == 0) {
            var $4 = HEAP32[$value$s2];
            HEAP32[$pMbLayer$s2 + 1] = $4;
            if (($4 | 0) == 0) {
              break L644;
            } else {
              break;
            }
          } else {
            var $retval_0 = $call55;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
        }
      } while (0);
      if ((_h264bsdDecodeExpGolombSigned($pStrmData, $itmp) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $5 = HEAP32[$itmp >> 2];
      if (($5 + 26 | 0) >>> 0 > 51) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      HEAP32[$pMbLayer$s2 + 2] = $5;
      var $call85 = _DecodeResidual($pStrmData, $pMbLayer + 272 | 0, $pMb, HEAP32[$mbType20 >> 2], HEAP32[$pMbLayer$s2 + 1]);
      HEAP32[$pStrmData + 16 >> 2] = (HEAP32[$pStrmData + 4 >> 2] - HEAP32[$pStrmData >> 2] << 3) + HEAP32[$pStrmData + 8 >> 2] | 0;
      if (($call85 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call85;
      }
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdDecodeMacroblockLayer["X"] = 1;
function _DecodeSubMbPred($pStrmData, $pSubMbPred, $mbType, $numRefIdxActive) {
  var $itmp$s2;
  var $value$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  var $itmp = __stackBase__ + 4, $itmp$s2 = $itmp >> 2;
  if ((_h264bsdDecodeExpGolombUnsigned($pStrmData, $value) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $0 = HEAP32[$value$s2];
  if ($0 >>> 0 > 3) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $arrayidx = $pSubMbPred | 0;
  HEAP32[$arrayidx >> 2] = $0;
  if ((_h264bsdDecodeExpGolombUnsigned($pStrmData, $value) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $17 = HEAP32[$value$s2];
  if ($17 >>> 0 > 3) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $arrayidx_1 = $pSubMbPred + 4 | 0;
  HEAP32[$arrayidx_1 >> 2] = $17;
  if ((_h264bsdDecodeExpGolombUnsigned($pStrmData, $value) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $18 = HEAP32[$value$s2];
  if ($18 >>> 0 > 3) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $arrayidx_2 = $pSubMbPred + 8 | 0;
  HEAP32[$arrayidx_2 >> 2] = $18;
  if ((_h264bsdDecodeExpGolombUnsigned($pStrmData, $value) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $19 = HEAP32[$value$s2];
  if ($19 >>> 0 > 3) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $arrayidx_3 = $pSubMbPred + 12 | 0;
  HEAP32[$arrayidx_3 >> 2] = $19;
  do {
    if (!($numRefIdxActive >>> 0 < 2 | ($mbType | 0) == 5)) {
      var $conv = $numRefIdxActive >>> 0 > 2 & 1;
      if ((_h264bsdDecodeExpGolombTruncated($pStrmData, $value, $conv) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $2 = HEAP32[$value$s2];
      if ($2 >>> 0 >= $numRefIdxActive >>> 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      HEAP32[$pSubMbPred + 16 >> 2] = $2;
      if ((_h264bsdDecodeExpGolombTruncated($pStrmData, $value, $conv) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $14 = HEAP32[$value$s2];
      if ($14 >>> 0 >= $numRefIdxActive >>> 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      HEAP32[$pSubMbPred + 20 >> 2] = $14;
      if ((_h264bsdDecodeExpGolombTruncated($pStrmData, $value, $conv) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $15 = HEAP32[$value$s2];
      if ($15 >>> 0 >= $numRefIdxActive >>> 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      HEAP32[$pSubMbPred + 24 >> 2] = $15;
      if ((_h264bsdDecodeExpGolombTruncated($pStrmData, $value, $conv) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $16 = HEAP32[$value$s2];
      if ($16 >>> 0 < $numRefIdxActive >>> 0) {
        HEAP32[$pSubMbPred + 28 >> 2] = $16;
        break;
      } else {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    }
  } while (0);
  var $call33 = _h264bsdNumSubMbPart(HEAP32[$arrayidx >> 2]);
  L734 : do {
    if (($call33 | 0) == 0) {
      label = 554;
    } else {
      var $j_029 = 0;
      var $dec2733_in = $call33;
      while (1) {
        var $dec2733_in;
        var $j_029;
        var $dec2733 = $dec2733_in - 1 | 0;
        var $call36 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
        if (($call36 | 0) != 0) {
          var $retval_0_ph = $call36;
          var $dec2733_lcssa = $dec2733;
          break L734;
        }
        HEAP16[$pSubMbPred + ($j_029 << 2) + 32 >> 1] = HEAP32[$itmp$s2] & 65535;
        var $call44 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
        if (($call44 | 0) != 0) {
          var $retval_0_ph = $call44;
          var $dec2733_lcssa = $dec2733;
          break L734;
        }
        HEAP16[$pSubMbPred + ($j_029 << 2) + 34 >> 1] = HEAP32[$itmp$s2] & 65535;
        if (($dec2733 | 0) == 0) {
          label = 554;
          break L734;
        } else {
          var $j_029 = $j_029 + 1 | 0;
          var $dec2733_in = $dec2733;
        }
      }
    }
  } while (0);
  L739 : do {
    if (label == 554) {
      var $call33_1 = _h264bsdNumSubMbPart(HEAP32[$arrayidx_1 >> 2]);
      L741 : do {
        if (($call33_1 | 0) != 0) {
          var $j_029_1 = 0;
          var $dec2733_1_in = $call33_1;
          while (1) {
            var $dec2733_1_in;
            var $j_029_1;
            var $dec2733_1 = $dec2733_1_in - 1 | 0;
            var $call36_1 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call36_1 | 0) != 0) {
              var $retval_0_ph = $call36_1;
              var $dec2733_lcssa = $dec2733_1;
              break L739;
            }
            HEAP16[$pSubMbPred + ($j_029_1 << 2) + 48 >> 1] = HEAP32[$itmp$s2] & 65535;
            var $call44_1 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call44_1 | 0) != 0) {
              var $retval_0_ph = $call44_1;
              var $dec2733_lcssa = $dec2733_1;
              break L739;
            }
            HEAP16[$pSubMbPred + ($j_029_1 << 2) + 50 >> 1] = HEAP32[$itmp$s2] & 65535;
            if (($dec2733_1 | 0) == 0) {
              break L741;
            } else {
              var $j_029_1 = $j_029_1 + 1 | 0;
              var $dec2733_1_in = $dec2733_1;
            }
          }
        }
      } while (0);
      var $call33_2 = _h264bsdNumSubMbPart(HEAP32[$arrayidx_2 >> 2]);
      L747 : do {
        if (($call33_2 | 0) != 0) {
          var $j_029_2 = 0;
          var $dec2733_2_in = $call33_2;
          while (1) {
            var $dec2733_2_in;
            var $j_029_2;
            var $dec2733_2 = $dec2733_2_in - 1 | 0;
            var $call36_2 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call36_2 | 0) != 0) {
              var $retval_0_ph = $call36_2;
              var $dec2733_lcssa = $dec2733_2;
              break L739;
            }
            HEAP16[$pSubMbPred + ($j_029_2 << 2) + 64 >> 1] = HEAP32[$itmp$s2] & 65535;
            var $call44_2 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call44_2 | 0) != 0) {
              var $retval_0_ph = $call44_2;
              var $dec2733_lcssa = $dec2733_2;
              break L739;
            }
            HEAP16[$pSubMbPred + ($j_029_2 << 2) + 66 >> 1] = HEAP32[$itmp$s2] & 65535;
            if (($dec2733_2 | 0) == 0) {
              break L747;
            } else {
              var $j_029_2 = $j_029_2 + 1 | 0;
              var $dec2733_2_in = $dec2733_2;
            }
          }
        }
      } while (0);
      var $call33_3 = _h264bsdNumSubMbPart(HEAP32[$arrayidx_3 >> 2]);
      var $dec27_3 = $call33_3 - 1 | 0;
      L753 : do {
        if (($call33_3 | 0) == 0) {
          var $dec2734_3 = $dec27_3;
        } else {
          var $j_029_3 = 0;
          var $dec2733_3 = $dec27_3;
          while (1) {
            var $dec2733_3;
            var $j_029_3;
            var $call36_3 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call36_3 | 0) != 0) {
              var $retval_0_ph = $call36_3;
              var $dec2733_lcssa = $dec2733_3;
              break L739;
            }
            HEAP16[$pSubMbPred + ($j_029_3 << 2) + 80 >> 1] = HEAP32[$itmp$s2] & 65535;
            var $call44_3 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
            if (($call44_3 | 0) != 0) {
              var $retval_0_ph = $call44_3;
              var $dec2733_lcssa = $dec2733_3;
              break L739;
            }
            HEAP16[$pSubMbPred + ($j_029_3 << 2) + 82 >> 1] = HEAP32[$itmp$s2] & 65535;
            var $dec_3 = $dec2733_3 - 1 | 0;
            if (($dec2733_3 | 0) == 0) {
              var $dec2734_3 = $dec_3;
              break L753;
            } else {
              var $j_029_3 = $j_029_3 + 1 | 0;
              var $dec2733_3 = $dec_3;
            }
          }
        }
      } while (0);
      var $dec2734_3;
      HEAP32[$value$s2] = $dec2734_3;
      var $retval_0 = 0;
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
  } while (0);
  var $dec2733_lcssa;
  var $retval_0_ph;
  HEAP32[$value$s2] = $dec2733_lcssa;
  var $retval_0 = $retval_0_ph;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_DecodeSubMbPred["X"] = 1;
function _DecodeMbPred($pStrmData, $pMbPred, $mbType, $numRefIdxActive) {
  var $itmp$s2;
  var $value$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $value = __stackBase__, $value$s2 = $value >> 2;
  var $itmp = __stackBase__ + 4, $itmp$s2 = $itmp >> 2;
  var $call = _h264bsdMbPartPredMode($mbType);
  do {
    if (($call | 0) == 0) {
      HEAP32[$itmp$s2] = 0;
      var $i_248 = 0;
      var $3 = 0;
      while (1) {
        var $3;
        var $i_248;
        var $call42 = _h264bsdShowBits32($pStrmData);
        var $_lobit = $call42 >>> 31;
        HEAP32[$pMbPred + ($i_248 << 2) >> 2] = $_lobit;
        if (($_lobit | 0) == 0) {
          HEAP32[$pMbPred + ($i_248 << 2) + 64 >> 2] = $call42 >>> 28 & 7;
          var $tmp_1 = 1;
          var $shl5445 = $call42 << 4;
        } else {
          var $tmp_1 = 0;
          var $shl5445 = $call42 << 1;
        }
        var $shl5445;
        var $tmp_1;
        var $inc5852 = $i_248 | 1;
        var $_lobit_1 = $shl5445 >>> 31;
        HEAP32[$pMbPred + ($inc5852 << 2) >> 2] = $_lobit_1;
        if (($_lobit_1 | 0) == 0) {
          HEAP32[$pMbPred + ($inc5852 << 2) + 64 >> 2] = $shl5445 >>> 28 & 7;
          var $tmp_1_1 = $tmp_1 + 1 | 0;
          var $shl5445_1 = $shl5445 << 4;
        } else {
          var $tmp_1_1 = $tmp_1;
          var $shl5445_1 = $shl5445 << 1;
        }
        var $shl5445_1;
        var $tmp_1_1;
        var $inc58_1 = $inc5852 + 1 | 0;
        var $_lobit_2 = $shl5445_1 >>> 31;
        HEAP32[$pMbPred + ($inc58_1 << 2) >> 2] = $_lobit_2;
        if (($_lobit_2 | 0) == 0) {
          HEAP32[$pMbPred + ($inc58_1 << 2) + 64 >> 2] = $shl5445_1 >>> 28 & 7;
          var $tmp_1_2 = $tmp_1_1 + 1 | 0;
          var $shl5445_2 = $shl5445_1 << 4;
        } else {
          var $tmp_1_2 = $tmp_1_1;
          var $shl5445_2 = $shl5445_1 << 1;
        }
        var $shl5445_2;
        var $tmp_1_2;
        var $inc58_253 = $i_248 | 3;
        var $_lobit_3 = $shl5445_2 >>> 31;
        HEAP32[$pMbPred + ($inc58_253 << 2) >> 2] = $_lobit_3;
        if (($_lobit_3 | 0) == 0) {
          HEAP32[$pMbPred + ($inc58_253 << 2) + 64 >> 2] = $shl5445_2 >>> 28 & 7;
          var $tmp_1_3 = $tmp_1_2 + 1 | 0;
          var $shl5445_3 = $shl5445_2 << 4;
        } else {
          var $tmp_1_3 = $tmp_1_2;
          var $shl5445_3 = $shl5445_2 << 1;
        }
        var $shl5445_3;
        var $tmp_1_3;
        var $inc58_3 = $inc58_253 + 1 | 0;
        var $_lobit_4 = $shl5445_3 >>> 31;
        HEAP32[$pMbPred + ($inc58_3 << 2) >> 2] = $_lobit_4;
        if (($_lobit_4 | 0) == 0) {
          HEAP32[$pMbPred + ($inc58_3 << 2) + 64 >> 2] = $shl5445_3 >>> 28 & 7;
          var $tmp_1_4 = $tmp_1_3 + 1 | 0;
          var $shl5445_4 = $shl5445_3 << 4;
        } else {
          var $tmp_1_4 = $tmp_1_3;
          var $shl5445_4 = $shl5445_3 << 1;
        }
        var $shl5445_4;
        var $tmp_1_4;
        var $inc58_4 = $inc58_253 + 2 | 0;
        var $_lobit_5 = $shl5445_4 >>> 31;
        HEAP32[$pMbPred + ($inc58_4 << 2) >> 2] = $_lobit_5;
        if (($_lobit_5 | 0) == 0) {
          HEAP32[$pMbPred + ($inc58_4 << 2) + 64 >> 2] = $shl5445_4 >>> 28 & 7;
          var $tmp_1_5 = $tmp_1_4 + 1 | 0;
          var $shl5445_5 = $shl5445_4 << 4;
        } else {
          var $tmp_1_5 = $tmp_1_4;
          var $shl5445_5 = $shl5445_4 << 1;
        }
        var $shl5445_5;
        var $tmp_1_5;
        var $inc58_5 = $inc58_253 + 3 | 0;
        var $_lobit_6 = $shl5445_5 >>> 31;
        HEAP32[$pMbPred + ($inc58_5 << 2) >> 2] = $_lobit_6;
        if (($_lobit_6 | 0) == 0) {
          HEAP32[$pMbPred + ($inc58_5 << 2) + 64 >> 2] = $shl5445_5 >>> 28 & 7;
          var $tmp_1_6 = $tmp_1_5 + 1 | 0;
          var $shl5445_6 = $shl5445_5 << 4;
        } else {
          var $tmp_1_6 = $tmp_1_5;
          var $shl5445_6 = $shl5445_5 << 1;
        }
        var $shl5445_6;
        var $tmp_1_6;
        var $inc58_654 = $i_248 | 7;
        var $_lobit_7 = $shl5445_6 >>> 31;
        HEAP32[$pMbPred + ($inc58_654 << 2) >> 2] = $_lobit_7;
        if (($_lobit_7 | 0) == 0) {
          HEAP32[$pMbPred + ($inc58_654 << 2) + 64 >> 2] = $shl5445_6 >>> 28 & 7;
          var $tmp_1_7 = $tmp_1_6 + 1 | 0;
          var $shl5445_7 = $shl5445_6 << 4;
        } else {
          var $tmp_1_7 = $tmp_1_6;
          var $shl5445_7 = $shl5445_6 << 1;
        }
        var $shl5445_7;
        var $tmp_1_7;
        if ((_h264bsdFlushBits($pStrmData, ($tmp_1_7 * 3 & -1) + 8 | 0) | 0) == -1) {
          break;
        }
        var $inc66 = $3 + 1 | 0;
        HEAP32[$itmp$s2] = $inc66;
        if (($inc66 | 0) < 2) {
          var $i_248 = $i_248 + 8 | 0;
          var $3 = $inc66;
        } else {
          label = 615;
          break;
        }
      }
      if (label == 615) {
        HEAP32[$value$s2] = $shl5445_7;
        break;
      }
      HEAP32[$value$s2] = $shl5445_7;
      var $retval_0 = 1;
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    } else if (($call | 0) == 2) {
      var $call5 = _h264bsdNumMbPart($mbType);
      L797 : do {
        if ($numRefIdxActive >>> 0 > 1) {
          if (($call5 | 0) == 0) {
            var $retval_0 = 0;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
          var $conv = $numRefIdxActive >>> 0 > 2 & 1;
          var $j_040 = 0;
          var $dec41_in = $call5;
          while (1) {
            var $dec41_in;
            var $j_040;
            var $dec41 = $dec41_in - 1 | 0;
            if ((_h264bsdDecodeExpGolombTruncated($pStrmData, $value, $conv) | 0) != 0) {
              var $retval_0 = 1;
              label = 641;
              break;
            }
            var $0 = HEAP32[$value$s2];
            if ($0 >>> 0 >= $numRefIdxActive >>> 0) {
              var $retval_0 = 1;
              label = 639;
              break;
            }
            HEAP32[$pMbPred + ($j_040 << 2) + 132 >> 2] = $0;
            if (($dec41 | 0) == 0) {
              break L797;
            } else {
              var $j_040 = $j_040 + 1 | 0;
              var $dec41_in = $dec41;
            }
          }
          if (label == 639) {
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else if (label == 641) {
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
        }
      } while (0);
      if (($call5 | 0) == 0) {
        var $retval_0 = 0;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      } else {
        var $j_135 = 0;
        var $dec1636_in = $call5;
      }
      while (1) {
        var $dec1636_in;
        var $j_135;
        var $dec1636 = $dec1636_in - 1 | 0;
        var $call19 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
        if (($call19 | 0) != 0) {
          var $retval_0 = $call19;
          label = 638;
          break;
        }
        HEAP16[$pMbPred + ($j_135 << 2) + 148 >> 1] = HEAP32[$itmp$s2] & 65535;
        var $call26 = _h264bsdDecodeExpGolombSigned($pStrmData, $itmp);
        if (($call26 | 0) != 0) {
          var $retval_0 = $call26;
          label = 635;
          break;
        }
        HEAP16[$pMbPred + ($j_135 << 2) + 150 >> 1] = HEAP32[$itmp$s2] & 65535;
        if (($dec1636 | 0) == 0) {
          var $retval_0 = 0;
          label = 646;
          break;
        } else {
          var $j_135 = $j_135 + 1 | 0;
          var $dec1636_in = $dec1636;
        }
      }
      if (label == 635) {
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      } else if (label == 638) {
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      } else if (label == 646) {
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    } else if (($call | 0) != 1) {
      var $retval_0 = 0;
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
  } while (0);
  if ((_h264bsdDecodeExpGolombUnsigned($pStrmData, $value) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $6 = HEAP32[$value$s2];
  if ($6 >>> 0 > 3) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP32[$pMbPred + 128 >> 2] = $6;
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_DecodeMbPred["X"] = 1;
function _DecodeResidual($pStrmData, $pResidual, $pMb, $mbType, $codedBlockPattern) {
  var label = 0;
  var $arraydecay7 = $pResidual | 0;
  do {
    if ((_h264bsdMbPartPredMode($mbType) | 0) == 1) {
      var $call10 = _h264bsdDecodeResidualBlockCavlc($pStrmData, $pResidual + 1592 | 0, _DetermineNc($pMb, 0, $arraydecay7), 16);
      if (($call10 & 15 | 0) == 0) {
        HEAP16[$pResidual + 48 >> 1] = $call10 >>> 4 & 255;
        var $is16x16_0 = 0;
        break;
      } else {
        var $retval_0 = $call10;
        var $retval_0;
        return $retval_0;
      }
    } else {
      var $is16x16_0 = 1;
    }
  } while (0);
  var $is16x16_0;
  var $codedBlockPattern_addr_061 = $codedBlockPattern;
  var $blockIndex_062 = 0;
  var $dec63 = 3;
  while (1) {
    var $dec63;
    var $blockIndex_062;
    var $codedBlockPattern_addr_061;
    var $shr18 = $codedBlockPattern_addr_061 >>> 1;
    if (($codedBlockPattern_addr_061 & 1 | 0) != 0) {
      var $call27 = _DetermineNc($pMb, $blockIndex_062, $arraydecay7);
      if ($is16x16_0) {
        var $call38 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($blockIndex_062 << 6) + $pResidual + 56 | 0, $call27, 16);
        HEAP32[$pResidual + ($blockIndex_062 << 2) + 1720 >> 2] = $call38 >>> 16;
        var $tmp_0 = $call38;
      } else {
        var $call32 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($blockIndex_062 << 6) + $pResidual + 60 | 0, $call27, 15);
        HEAP32[$pResidual + ($blockIndex_062 << 2) + 1720 >> 2] = $call32 >>> 15;
        var $tmp_0 = $call32;
      }
      var $tmp_0;
      if (($tmp_0 & 15 | 0) != 0) {
        var $retval_0 = $tmp_0;
        label = 682;
        break;
      }
      HEAP16[$pResidual + ($blockIndex_062 << 1) >> 1] = $tmp_0 >>> 4 & 255;
      var $inc66 = $blockIndex_062 | 1;
      var $call27_1 = _DetermineNc($pMb, $inc66, $arraydecay7);
      if ($is16x16_0) {
        var $call38_1 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($inc66 << 6) + $pResidual + 56 | 0, $call27_1, 16);
        HEAP32[$pResidual + ($inc66 << 2) + 1720 >> 2] = $call38_1 >>> 16;
        var $tmp_0_1 = $call38_1;
      } else {
        var $call32_1 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($inc66 << 6) + $pResidual + 60 | 0, $call27_1, 15);
        HEAP32[$pResidual + ($inc66 << 2) + 1720 >> 2] = $call32_1 >>> 15;
        var $tmp_0_1 = $call32_1;
      }
      var $tmp_0_1;
      if (($tmp_0_1 & 15 | 0) != 0) {
        var $retval_0 = $tmp_0_1;
        label = 681;
        break;
      }
      HEAP16[$pResidual + ($inc66 << 1) >> 1] = $tmp_0_1 >>> 4 & 255;
      var $inc_167 = $blockIndex_062 | 2;
      var $call27_2 = _DetermineNc($pMb, $inc_167, $arraydecay7);
      if ($is16x16_0) {
        var $call38_2 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($inc_167 << 6) + $pResidual + 56 | 0, $call27_2, 16);
        HEAP32[$pResidual + ($inc_167 << 2) + 1720 >> 2] = $call38_2 >>> 16;
        var $tmp_0_2 = $call38_2;
      } else {
        var $call32_2 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($inc_167 << 6) + $pResidual + 60 | 0, $call27_2, 15);
        HEAP32[$pResidual + ($inc_167 << 2) + 1720 >> 2] = $call32_2 >>> 15;
        var $tmp_0_2 = $call32_2;
      }
      var $tmp_0_2;
      if (($tmp_0_2 & 15 | 0) != 0) {
        var $retval_0 = $tmp_0_2;
        label = 685;
        break;
      }
      HEAP16[$pResidual + ($inc_167 << 1) >> 1] = $tmp_0_2 >>> 4 & 255;
      var $inc_268 = $blockIndex_062 | 3;
      var $call27_3 = _DetermineNc($pMb, $inc_268, $arraydecay7);
      if ($is16x16_0) {
        var $call38_3 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($inc_268 << 6) + $pResidual + 56 | 0, $call27_3, 16);
        HEAP32[$pResidual + ($inc_268 << 2) + 1720 >> 2] = $call38_3 >>> 16;
        var $tmp_0_3 = $call38_3;
      } else {
        var $call32_3 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($inc_268 << 6) + $pResidual + 60 | 0, $call27_3, 15);
        HEAP32[$pResidual + ($inc_268 << 2) + 1720 >> 2] = $call32_3 >>> 15;
        var $tmp_0_3 = $call32_3;
      }
      var $tmp_0_3;
      if (($tmp_0_3 & 15 | 0) != 0) {
        var $retval_0 = $tmp_0_3;
        label = 686;
        break;
      }
      HEAP16[$pResidual + ($inc_268 << 1) >> 1] = $tmp_0_3 >>> 4 & 255;
    }
    var $blockIndex_0_be = $blockIndex_062 + 4 | 0;
    if (($dec63 | 0) == 0) {
      label = 658;
      break;
    } else {
      var $codedBlockPattern_addr_061 = $shr18;
      var $blockIndex_062 = $blockIndex_0_be;
      var $dec63 = $dec63 - 1 | 0;
    }
  }
  if (label == 658) {
    do {
      if (($shr18 & 3 | 0) != 0) {
        var $call61 = _h264bsdDecodeResidualBlockCavlc($pStrmData, $pResidual + 1656 | 0, -1, 4);
        if (($call61 & 15 | 0) != 0) {
          var $retval_0 = $call61;
          var $retval_0;
          return $retval_0;
        }
        HEAP16[$pResidual + 50 >> 1] = $call61 >>> 4 & 255;
        var $call75 = _h264bsdDecodeResidualBlockCavlc($pStrmData, $pResidual + 1672 | 0, -1, 4);
        if (($call75 & 15 | 0) == 0) {
          HEAP16[$pResidual + 52 >> 1] = $call75 >>> 4 & 255;
          break;
        } else {
          var $retval_0 = $call75;
          var $retval_0;
          return $retval_0;
        }
      }
    } while (0);
    if (($shr18 & 2 | 0) == 0) {
      var $retval_0 = 0;
      var $retval_0;
      return $retval_0;
    } else {
      var $blockIndex_253 = $blockIndex_0_be;
      var $dec9154 = 7;
    }
    while (1) {
      var $dec9154;
      var $blockIndex_253;
      var $call100 = _h264bsdDecodeResidualBlockCavlc($pStrmData, ($blockIndex_253 << 6) + $pResidual + 60 | 0, _DetermineNc($pMb, $blockIndex_253, $arraydecay7), 15);
      if (($call100 & 15 | 0) != 0) {
        var $retval_0 = $call100;
        label = 684;
        break;
      }
      HEAP16[$pResidual + ($blockIndex_253 << 1) >> 1] = $call100 >>> 4 & 255;
      HEAP32[$pResidual + ($blockIndex_253 << 2) + 1720 >> 2] = $call100 >>> 15;
      if (($dec9154 | 0) == 0) {
        var $retval_0 = 0;
        label = 680;
        break;
      } else {
        var $blockIndex_253 = $blockIndex_253 + 1 | 0;
        var $dec9154 = $dec9154 - 1 | 0;
      }
    }
    if (label == 680) {
      var $retval_0;
      return $retval_0;
    } else if (label == 684) {
      var $retval_0;
      return $retval_0;
    }
  } else if (label == 681) {
    var $retval_0;
    return $retval_0;
  } else if (label == 682) {
    var $retval_0;
    return $retval_0;
  } else if (label == 685) {
    var $retval_0;
    return $retval_0;
  } else if (label == 686) {
    var $retval_0;
    return $retval_0;
  }
}
_DecodeResidual["X"] = 1;
function _h264bsdNumSubMbPart($subMbType) {
  if (($subMbType | 0) == 1 | ($subMbType | 0) == 2) {
    var $retval_0 = 2;
  } else if (($subMbType | 0) == 0) {
    var $retval_0 = 1;
  } else {
    var $retval_0 = 4;
  }
  var $retval_0;
  return $retval_0;
}
function _h264bsdSubMbPartMode($subMbType) {
  return $subMbType;
}
function _h264bsdPredModeIntra16x16($mbType) {
  return $mbType + 1 & 3;
}
function _h264bsdIsByteAligned($pStrmData_0_2_val) {
  return ($pStrmData_0_2_val | 0) == 0 & 1;
}
function _h264bsdShowBits32($pStrmData) {
  var $pStrmData$s2 = $pStrmData >> 2;
  var $0 = HEAP32[$pStrmData$s2 + 1];
  var $sub = (HEAP32[$pStrmData$s2 + 3] << 3) - HEAP32[$pStrmData$s2 + 4] | 0;
  if (($sub | 0) > 31) {
    var $3 = HEAP32[$pStrmData$s2 + 2];
    var $or11 = HEAPU8[$0 + 1 | 0] << 16 | HEAPU8[$0] << 24 | HEAPU8[$0 + 2 | 0] << 8 | HEAPU8[$0 + 3 | 0];
    if (($3 | 0) == 0) {
      var $retval_0 = $or11;
      var $retval_0;
      return $retval_0;
    }
    var $retval_0 = HEAPU8[$0 + 4 | 0] >>> ((8 - $3 | 0) >>> 0) | $or11 << $3;
    var $retval_0;
    return $retval_0;
  }
  if (($sub | 0) <= 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $9 = HEAP32[$pStrmData$s2 + 2];
  var $add = $9 + 24 | 0;
  var $shl23 = HEAPU8[$0] << $add;
  var $sub26 = $sub - 8 + $9 | 0;
  if (($sub26 | 0) > 0) {
    var $out_127 = $shl23;
    var $shift_028 = $add;
    var $bits_029 = $sub26;
    var $_pn = $0;
  } else {
    var $retval_0 = $shl23;
    var $retval_0;
    return $retval_0;
  }
  while (1) {
    var $_pn;
    var $bits_029;
    var $shift_028;
    var $out_127;
    var $pStrm_030 = $_pn + 1 | 0;
    var $sub29 = $shift_028 - 8 | 0;
    var $or33 = HEAPU8[$pStrm_030] << $sub29 | $out_127;
    var $sub34 = $bits_029 - 8 | 0;
    if (($sub34 | 0) > 0) {
      var $out_127 = $or33;
      var $shift_028 = $sub29;
      var $bits_029 = $sub34;
      var $_pn = $pStrm_030;
    } else {
      var $retval_0 = $or33;
      break;
    }
  }
  var $retval_0;
  return $retval_0;
}
_h264bsdShowBits32["X"] = 1;
function _h264bsdFlushBits($pStrmData, $numBits) {
  var $strmBuffReadBits = $pStrmData + 16 | 0;
  var $add = HEAP32[$strmBuffReadBits >> 2] + $numBits | 0;
  HEAP32[$strmBuffReadBits >> 2] = $add;
  HEAP32[$pStrmData + 8 >> 2] = $add & 7;
  if ($add >>> 0 > HEAP32[$pStrmData + 12 >> 2] << 3 >>> 0) {
    var $retval_0 = -1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$pStrmData + 4 >> 2] = HEAP32[$pStrmData >> 2] + ($add >>> 3) | 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
function _h264bsdDecodeMacroblock($pMb, $pMbLayer, $currImage, $dpb, $qpY, $mbNum, $constrainedIntraPredFlag, $data) {
  var $lev_049$s2;
  var $decoded$s2;
  var $qpY$s2 = $qpY >> 2;
  var $0 = HEAP32[$pMbLayer >> 2];
  HEAP32[$pMb >> 2] = $0;
  var $decoded$s2 = ($pMb + 196 | 0) >> 2;
  HEAP32[$decoded$s2] = HEAP32[$decoded$s2] + 1 | 0;
  _h264bsdSetCurrImageMbPointers($currImage, $mbNum);
  if (($0 | 0) == 31) {
    var $arraydecay = $pMb + 28 | 0;
    HEAP32[$pMb + 20 >> 2] = 0;
    if (HEAP32[$decoded$s2] >>> 0 > 1) {
      HEAP16[$arraydecay >> 1] = 16;
      HEAP16[$pMb + 30 >> 1] = 16;
      HEAP16[$pMb + 32 >> 1] = 16;
      HEAP16[$pMb + 34 >> 1] = 16;
      HEAP16[$pMb + 36 >> 1] = 16;
      HEAP16[$pMb + 38 >> 1] = 16;
      HEAP16[$pMb + 40 >> 1] = 16;
      HEAP16[$pMb + 42 >> 1] = 16;
      HEAP16[$pMb + 44 >> 1] = 16;
      HEAP16[$pMb + 46 >> 1] = 16;
      HEAP16[$pMb + 48 >> 1] = 16;
      HEAP16[$pMb + 50 >> 1] = 16;
      HEAP16[$pMb + 52 >> 1] = 16;
      HEAP16[$pMb + 54 >> 1] = 16;
      HEAP16[$pMb + 56 >> 1] = 16;
      HEAP16[$pMb + 58 >> 1] = 16;
      HEAP16[$pMb + 60 >> 1] = 16;
      HEAP16[$pMb + 62 >> 1] = 16;
      HEAP16[$pMb + 64 >> 1] = 16;
      HEAP16[$pMb + 66 >> 1] = 16;
      HEAP16[$pMb + 68 >> 1] = 16;
      HEAP16[$pMb + 70 >> 1] = 16;
      HEAP16[$pMb + 72 >> 1] = 16;
      HEAP16[$pMb + 74 >> 1] = 16;
      var $retval_0 = 0;
      var $retval_0;
      return $retval_0;
    }
    var $pData_047 = $data;
    var $tot_148 = $arraydecay;
    var $lev_049 = $pMbLayer + 328 | 0, $lev_049$s2 = $lev_049 >> 2;
    var $dec1350 = 23;
    while (1) {
      var $dec1350;
      var $lev_049;
      var $tot_148;
      var $pData_047;
      HEAP16[$tot_148 >> 1] = 16;
      HEAP8[$pData_047] = HEAP32[$lev_049$s2] & 255;
      HEAP8[$pData_047 + 1 | 0] = HEAP32[$lev_049$s2 + 1] & 255;
      HEAP8[$pData_047 + 2 | 0] = HEAP32[$lev_049$s2 + 2] & 255;
      HEAP8[$pData_047 + 3 | 0] = HEAP32[$lev_049$s2 + 3] & 255;
      HEAP8[$pData_047 + 4 | 0] = HEAP32[$lev_049$s2 + 4] & 255;
      HEAP8[$pData_047 + 5 | 0] = HEAP32[$lev_049$s2 + 5] & 255;
      HEAP8[$pData_047 + 6 | 0] = HEAP32[$lev_049$s2 + 6] & 255;
      HEAP8[$pData_047 + 7 | 0] = HEAP32[$lev_049$s2 + 7] & 255;
      HEAP8[$pData_047 + 8 | 0] = HEAP32[$lev_049$s2 + 8] & 255;
      HEAP8[$pData_047 + 9 | 0] = HEAP32[$lev_049$s2 + 9] & 255;
      HEAP8[$pData_047 + 10 | 0] = HEAP32[$lev_049$s2 + 10] & 255;
      HEAP8[$pData_047 + 11 | 0] = HEAP32[$lev_049$s2 + 11] & 255;
      HEAP8[$pData_047 + 12 | 0] = HEAP32[$lev_049$s2 + 12] & 255;
      HEAP8[$pData_047 + 13 | 0] = HEAP32[$lev_049$s2 + 13] & 255;
      HEAP8[$pData_047 + 14 | 0] = HEAP32[$lev_049$s2 + 14] & 255;
      HEAP8[$pData_047 + 15 | 0] = HEAP32[$lev_049$s2 + 15] & 255;
      if (($dec1350 | 0) == 0) {
        break;
      } else {
        var $pData_047 = $pData_047 + 16 | 0;
        var $tot_148 = $tot_148 + 2 | 0;
        var $lev_049 = $lev_049 + 64 | 0, $lev_049$s2 = $lev_049 >> 2;
        var $dec1350 = $dec1350 - 1 | 0;
      }
    }
    _h264bsdWriteMacroblock($currImage, $data);
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $19 = $pMb + 28 | 0;
  do {
    if (($0 | 0) == 0) {
      _H264SwDecMemset($19, 0, 54);
      HEAP32[$pMb + 20 >> 2] = HEAP32[$qpY$s2];
    } else {
      _H264SwDecMemcpy($19, $pMbLayer + 272 | 0, 54);
      var $21 = HEAP32[$pMbLayer + 8 >> 2];
      var $_pre = HEAP32[$qpY$s2];
      do {
        if (($21 | 0) == 0) {
          var $22 = $_pre;
        } else {
          var $add = $_pre + $21 | 0;
          HEAP32[$qpY$s2] = $add;
          if (($add | 0) < 0) {
            var $add39 = $add + 52 | 0;
            HEAP32[$qpY$s2] = $add39;
            var $22 = $add39;
            break;
          }
          if (($add | 0) <= 51) {
            var $22 = $add;
            break;
          }
          var $sub = $add - 52 | 0;
          HEAP32[$qpY$s2] = $sub;
          var $22 = $sub;
        }
      } while (0);
      var $22;
      HEAP32[$pMb + 20 >> 2] = $22;
      var $call = _ProcessResidual($pMb, $pMbLayer + 328 | 0, $pMbLayer + 1992 | 0);
      if (($call | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  do {
    if ((_h264bsdMbPartPredMode($0) | 0) == 2) {
      var $call72 = _h264bsdInterPrediction($pMb, $pMbLayer, $dpb, $mbNum, $currImage, $data);
      if (($call72 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call72;
      }
      var $retval_0;
      return $retval_0;
    } else {
      var $call66 = _h264bsdIntraPrediction($pMb, $pMbLayer, $currImage, $mbNum, $constrainedIntraPredFlag, $data);
      if (($call66 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call66;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdDecodeMacroblock["X"] = 1;
function _ProcessResidual($pMb, $residualLevel, $coeffMap) {
  var label = 0;
  var $arraydecay = $pMb + 28 | 0;
  L945 : do {
    if ((_h264bsdMbPartPredMode(HEAP32[$pMb >> 2]) | 0) == 1) {
      if (HEAP16[$pMb + 76 >> 1] << 16 >> 16 == 0) {
        var $qpY12_pre_phi = $pMb + 20 | 0;
      } else {
        var $qpY = $pMb + 20 | 0;
        _h264bsdProcessLumaDc($residualLevel + 1536 | 0, HEAP32[$qpY >> 2]);
        var $qpY12_pre_phi = $qpY;
      }
      var $qpY12_pre_phi;
      var $coeffMap_addr_047 = $coeffMap;
      var $blockData_048 = $residualLevel;
      var $totalCoeff_049 = $arraydecay;
      var $dcCoeffIdx_050 = 5245696;
      var $dec51 = 15;
      while (1) {
        var $dec51;
        var $dcCoeffIdx_050;
        var $totalCoeff_049;
        var $blockData_048;
        var $coeffMap_addr_047;
        var $incdec_ptr = $dcCoeffIdx_050 + 4 | 0;
        var $4 = HEAP32[$residualLevel + (HEAP32[$dcCoeffIdx_050 >> 2] << 2) + 1536 >> 2];
        var $arrayidx6 = $blockData_048 | 0;
        HEAP32[$arrayidx6 >> 2] = $4;
        do {
          if (($4 | 0) == 0) {
            if (HEAP16[$totalCoeff_049 >> 1] << 16 >> 16 != 0) {
              label = 745;
              break;
            }
            HEAP32[$arrayidx6 >> 2] = 16777215;
            break;
          } else {
            label = 745;
          }
        } while (0);
        if (label == 745) {
          label = 0;
          if ((_h264bsdProcessBlock($arrayidx6, HEAP32[$qpY12_pre_phi >> 2], 1, HEAP32[$coeffMap_addr_047 >> 2]) | 0) != 0) {
            var $retval_0 = 1;
            label = 765;
            break;
          }
        }
        var $incdec_ptr20 = $blockData_048 + 64 | 0;
        var $incdec_ptr21 = $totalCoeff_049 + 2 | 0;
        var $incdec_ptr22 = $coeffMap_addr_047 + 4 | 0;
        if (($dec51 | 0) == 0) {
          label = 752;
          break;
        } else {
          var $coeffMap_addr_047 = $incdec_ptr22;
          var $blockData_048 = $incdec_ptr20;
          var $totalCoeff_049 = $incdec_ptr21;
          var $dcCoeffIdx_050 = $incdec_ptr;
          var $dec51 = $dec51 - 1 | 0;
        }
      }
      if (label == 765) {
        var $retval_0;
        return $retval_0;
      } else if (label == 752) {
        var $totalCoeff_2 = $incdec_ptr21;
        var $blockData_2 = $incdec_ptr20;
        var $coeffMap_addr_2 = $incdec_ptr22;
        var $qpY46_pre_phi = $pMb + 20 | 0;
        break;
      }
    } else {
      var $qpY31 = $pMb + 20 | 0;
      var $coeffMap_addr_157 = $coeffMap;
      var $blockData_158 = $residualLevel;
      var $totalCoeff_159 = $arraydecay;
      var $dec2560 = 15;
      while (1) {
        var $dec2560;
        var $totalCoeff_159;
        var $blockData_158;
        var $coeffMap_addr_157;
        var $arraydecay30 = $blockData_158 | 0;
        if (HEAP16[$totalCoeff_159 >> 1] << 16 >> 16 == 0) {
          HEAP32[$arraydecay30 >> 2] = 16777215;
        } else {
          if ((_h264bsdProcessBlock($arraydecay30, HEAP32[$qpY31 >> 2], 0, HEAP32[$coeffMap_addr_157 >> 2]) | 0) != 0) {
            var $retval_0 = 1;
            break;
          }
        }
        var $incdec_ptr41 = $blockData_158 + 64 | 0;
        var $incdec_ptr42 = $totalCoeff_159 + 2 | 0;
        var $incdec_ptr43 = $coeffMap_addr_157 + 4 | 0;
        if (($dec2560 | 0) == 0) {
          var $totalCoeff_2 = $incdec_ptr42;
          var $blockData_2 = $incdec_ptr41;
          var $coeffMap_addr_2 = $incdec_ptr43;
          var $qpY46_pre_phi = $qpY31;
          break L945;
        } else {
          var $coeffMap_addr_157 = $incdec_ptr43;
          var $blockData_158 = $incdec_ptr41;
          var $totalCoeff_159 = $incdec_ptr42;
          var $dec2560 = $dec2560 - 1 | 0;
        }
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $qpY46_pre_phi;
  var $coeffMap_addr_2;
  var $blockData_2;
  var $totalCoeff_2;
  var $13 = HEAP32[(_clip(0, 51, HEAP32[$pMb + 24 >> 2] + HEAP32[$qpY46_pre_phi >> 2] | 0) << 2) + 5243992 >> 2];
  do {
    if (HEAP16[$pMb + 78 >> 1] << 16 >> 16 == 0) {
      if (HEAP16[$pMb + 80 >> 1] << 16 >> 16 != 0) {
        label = 756;
        break;
      }
      var $coeffMap_addr_338 = $coeffMap_addr_2;
      var $blockData_339 = $blockData_2;
      var $totalCoeff_340 = $totalCoeff_2;
      var $chromaDc_041 = $residualLevel + 1600 | 0;
      var $dec6542 = 7;
      break;
    } else {
      label = 756;
    }
  } while (0);
  do {
    if (label == 756) {
      var $arraydecay60 = $residualLevel + 1600 | 0;
      _h264bsdProcessChromaDc($arraydecay60, $13);
      var $coeffMap_addr_338 = $coeffMap_addr_2;
      var $blockData_339 = $blockData_2;
      var $totalCoeff_340 = $totalCoeff_2;
      var $chromaDc_041 = $arraydecay60;
      var $dec6542 = 7;
      break;
    }
  } while (0);
  while (1) {
    var $dec6542;
    var $chromaDc_041;
    var $totalCoeff_340;
    var $blockData_339;
    var $coeffMap_addr_338;
    var $incdec_ptr68 = $chromaDc_041 + 4 | 0;
    var $16 = HEAP32[$chromaDc_041 >> 2];
    var $arrayidx69 = $blockData_339 | 0;
    HEAP32[$arrayidx69 >> 2] = $16;
    do {
      if (($16 | 0) == 0) {
        if (HEAP16[$totalCoeff_340 >> 1] << 16 >> 16 != 0) {
          label = 759;
          break;
        }
        HEAP32[$arrayidx69 >> 2] = 16777215;
        break;
      } else {
        label = 759;
      }
    } while (0);
    if (label == 759) {
      label = 0;
      if ((_h264bsdProcessBlock($arrayidx69, $13, 1, HEAP32[$coeffMap_addr_338 >> 2]) | 0) != 0) {
        var $retval_0 = 1;
        label = 764;
        break;
      }
    }
    if (($dec6542 | 0) == 0) {
      var $retval_0 = 0;
      label = 766;
      break;
    } else {
      var $coeffMap_addr_338 = $coeffMap_addr_338 + 4 | 0;
      var $blockData_339 = $blockData_339 + 64 | 0;
      var $totalCoeff_340 = $totalCoeff_340 + 2 | 0;
      var $chromaDc_041 = $incdec_ptr68;
      var $dec6542 = $dec6542 - 1 | 0;
    }
  }
  if (label == 764) {
    var $retval_0;
    return $retval_0;
  } else if (label == 766) {
    var $retval_0;
    return $retval_0;
  }
}
_ProcessResidual["X"] = 1;
/* relooped function '_DetermineNc': */
function _DetermineNc($pMb, $blockIndex, $pTotalCoeff) {
  var $call = _h264bsdNeighbour4x4BlockA($blockIndex);
  var $call6 = _h264bsdNeighbour4x4BlockB($blockIndex);
  var $0 = HEAP8[$call + 4 | 0];
  var $1 = HEAP8[$call6 + 4 | 0];
  var $cmp9 = (HEAP32[$call6 >> 2] | 0) == 4;
  if ((HEAP32[$call >> 2] | 0) == 4) {
    var $conv = HEAP16[$pTotalCoeff + (($0 & 255) << 1) >> 1] << 16 >> 16;
    if ($cmp9) {
      var $n_1 = (HEAP16[$pTotalCoeff + (($1 & 255) << 1) >> 1] << 16 >> 17) + ($conv + 1 >> 1);
      var $n_1;
      return $n_1;
    }
    var $6 = HEAP32[$pMb + 204 >> 2];
    if ((_h264bsdIsNeighbourAvailable($pMb, $6) | 0) == 0) {
      var $n_1 = $conv;
      var $n_1;
      return $n_1;
    }
    var $n_1 = (HEAP16[$6 + (($1 & 255) << 1) + 28 >> 1] << 16 >> 17) + ($conv + 1 >> 1);
    var $n_1;
    return $n_1;
  }
  if ($cmp9) {
    var $conv37 = HEAP16[$pTotalCoeff + (($1 & 255) << 1) >> 1] << 16 >> 16;
    var $9 = HEAP32[$pMb + 200 >> 2];
    if ((_h264bsdIsNeighbourAvailable($pMb, $9) | 0) == 0) {
      var $n_1 = $conv37;
      var $n_1;
      return $n_1;
    }
    var $n_1 = (HEAP16[$9 + (($0 & 255) << 1) + 28 >> 1] << 16 >> 17) + ($conv37 + 1 >> 1);
    var $n_1;
    return $n_1;
  }
  var $11 = HEAP32[$pMb + 200 >> 2];
  if ((_h264bsdIsNeighbourAvailable($pMb, $11) | 0) == 0) {
    var $tmp_0 = 0;
    var $n_0 = 0;
  } else {
    var $tmp_0 = 1;
    var $n_0 = HEAP16[$11 + (($0 & 255) << 1) + 28 >> 1] << 16 >> 16;
  }
  var $n_0;
  var $tmp_0;
  var $13 = HEAP32[$pMb + 204 >> 2];
  if ((_h264bsdIsNeighbourAvailable($pMb, $13) | 0) == 0) {
    var $n_1 = $n_0;
    var $n_1;
    return $n_1;
  }
  var $conv80 = HEAP16[$13 + (($1 & 255) << 1) + 28 >> 1] << 16 >> 16;
  if (($tmp_0 | 0) == 0) {
    var $n_1 = $conv80;
    var $n_1;
    return $n_1;
  }
  var $n_1 = $conv80 + ($n_0 + 1) >> 1;
  var $n_1;
  return $n_1;
}
_DetermineNc["X"] = 1;
function _h264bsdGetBits($pStrmData, $numBits) {
  var $call = _h264bsdShowBits32($pStrmData);
  if ((_h264bsdFlushBits($pStrmData, $numBits) | 0) != 0) {
    var $retval_0 = -1;
    var $retval_0;
    return $retval_0;
  }
  var $retval_0 = $call >>> ((32 - $numBits | 0) >>> 0);
  var $retval_0;
  return $retval_0;
}
function _h264bsdDecodeExpGolombUnsigned($pStrmData, $codeNum) {
  var $codeNum$s2 = $codeNum >> 2;
  var $call = _h264bsdShowBits32($pStrmData);
  do {
    if (($call | 0) < 0) {
      _h264bsdFlushBits($pStrmData, 1);
      HEAP32[$codeNum$s2] = 0;
      var $retval_0 = 0;
    } else {
      if ($call >>> 0 > 1073741823) {
        if ((_h264bsdFlushBits($pStrmData, 3) | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        HEAP32[$codeNum$s2] = ($call >>> 29 & 1) + 1 | 0;
        var $retval_0 = 0;
        break;
      }
      if ($call >>> 0 > 536870911) {
        if ((_h264bsdFlushBits($pStrmData, 5) | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        HEAP32[$codeNum$s2] = ($call >>> 27 & 3) + 3 | 0;
        var $retval_0 = 0;
        break;
      }
      if ($call >>> 0 > 268435455) {
        if ((_h264bsdFlushBits($pStrmData, 7) | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        HEAP32[$codeNum$s2] = ($call >>> 25 & 7) + 7 | 0;
        var $retval_0 = 0;
        break;
      }
      var $call28 = _h264bsdCountLeadingZeros($call);
      var $add29 = $call28 + 4 | 0;
      if (($add29 | 0) != 32) {
        _h264bsdFlushBits($pStrmData, $call28 + 5 | 0);
        var $call53 = _h264bsdGetBits($pStrmData, $add29);
        if (($call53 | 0) == -1) {
          var $retval_0 = 1;
          break;
        }
        HEAP32[$codeNum$s2] = (1 << $add29) - 1 + $call53 | 0;
        var $retval_0 = 0;
        break;
      }
      HEAP32[$codeNum$s2] = 0;
      _h264bsdFlushBits($pStrmData, 32);
      if ((_h264bsdGetBits($pStrmData, 1) | 0) != 1) {
        var $retval_0 = 1;
        break;
      }
      var $call36 = _h264bsdShowBits32($pStrmData);
      if ((_h264bsdFlushBits($pStrmData, 32) | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      if (($call36 | 0) == 1) {
        HEAP32[$codeNum$s2] = -1;
        var $retval_0 = 1;
        break;
      } else if (($call36 | 0) == 0) {
        HEAP32[$codeNum$s2] = -1;
        var $retval_0 = 0;
        break;
      } else {
        var $retval_0 = 1;
        break;
      }
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
_h264bsdDecodeExpGolombUnsigned["X"] = 1;
function _h264bsdDecodeExpGolombSigned($pStrmData, $value) {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 4 | 0;
  var $codeNum = __stackBase__;
  HEAP32[$codeNum >> 2] = 0;
  var $call = _h264bsdDecodeExpGolombUnsigned($pStrmData, $codeNum);
  var $0 = HEAP32[$codeNum >> 2];
  var $cmp1 = ($call | 0) == 0;
  do {
    if (($0 | 0) == -1) {
      if ($cmp1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$value >> 2] = -2147483648;
      var $retval_0 = 0;
    } else {
      if (!$cmp1) {
        var $retval_0 = 1;
        break;
      }
      var $shr = ($0 + 1 | 0) >>> 1;
      HEAP32[$value >> 2] = ($0 & 1 | 0) != 0 ? $shr : -$shr | 0;
      var $retval_0 = 0;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdDecodeExpGolombMapped($pStrmData, $value, $isIntra) {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 4 | 0;
  var $codeNum = __stackBase__;
  do {
    if ((_h264bsdDecodeExpGolombUnsigned($pStrmData, $codeNum) | 0) == 0) {
      var $0 = HEAP32[$codeNum >> 2];
      if ($0 >>> 0 > 47) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$value >> 2] = HEAPU8[(($isIntra | 0) == 0 ? 5247120 : 5247072) + $0 | 0];
      var $retval_0 = 0;
    } else {
      var $retval_0 = 1;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _h264bsdDecodeExpGolombTruncated($pStrmData, $value, $greaterThanOne) {
  do {
    if (($greaterThanOne | 0) == 0) {
      var $call1 = _h264bsdGetBits($pStrmData, 1);
      HEAP32[$value >> 2] = $call1;
      if (($call1 | 0) == -1) {
        var $retval_0 = 1;
        break;
      }
      HEAP32[$value >> 2] = $call1 ^ 1;
      var $retval_0 = 0;
    } else {
      var $retval_0 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $value);
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
function _DecodeLevelPrefix($bits) {
  do {
    if ($bits >>> 0 > 32767) {
      var $numZeros_0 = 0;
    } else {
      if ($bits >>> 0 > 16383) {
        var $numZeros_0 = 1;
        break;
      }
      if ($bits >>> 0 > 8191) {
        var $numZeros_0 = 2;
        break;
      }
      if ($bits >>> 0 > 4095) {
        var $numZeros_0 = 3;
        break;
      }
      if ($bits >>> 0 > 2047) {
        var $numZeros_0 = 4;
        break;
      }
      if ($bits >>> 0 > 1023) {
        var $numZeros_0 = 5;
        break;
      }
      if ($bits >>> 0 > 511) {
        var $numZeros_0 = 6;
        break;
      }
      if ($bits >>> 0 > 255) {
        var $numZeros_0 = 7;
        break;
      }
      if ($bits >>> 0 > 127) {
        var $numZeros_0 = 8;
        break;
      }
      if ($bits >>> 0 > 63) {
        var $numZeros_0 = 9;
        break;
      }
      if ($bits >>> 0 > 31) {
        var $numZeros_0 = 10;
        break;
      }
      if ($bits >>> 0 > 15) {
        var $numZeros_0 = 11;
        break;
      }
      if ($bits >>> 0 > 7) {
        var $numZeros_0 = 12;
        break;
      }
      if ($bits >>> 0 > 3) {
        var $numZeros_0 = 13;
        break;
      }
      if ($bits >>> 0 > 1) {
        var $numZeros_0 = 14;
        break;
      }
      if (($bits | 0) == 0) {
        var $retval_0 = -2;
      } else {
        var $numZeros_0 = 15;
        break;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $numZeros_0;
  var $retval_0 = $numZeros_0;
  var $retval_0;
  return $retval_0;
}
function _DecodeCoeffToken($bits, $nc) {
  do {
    if ($nc >>> 0 < 2) {
      if ($bits >>> 0 > 32767) {
        var $value_0 = 1;
        break;
      }
      if ($bits >>> 0 > 3071) {
        var $value_0 = HEAPU16[($bits >>> 10 << 1) + 5247008 >> 1];
        break;
      }
      if ($bits >>> 0 > 255) {
        var $value_0 = HEAPU16[($bits >>> 6 << 1) + 5246912 >> 1];
        break;
      }
      if ($bits >>> 0 > 31) {
        var $value_0 = HEAPU16[(($bits >>> 2) - 8 << 1) + 5246800 >> 1];
        break;
      } else {
        var $value_0 = HEAPU16[($bits << 1) + 5246736 >> 1];
        break;
      }
    } else {
      if ($nc >>> 0 < 4) {
        if ($bits >>> 0 > 32767) {
          var $value_0 = ($bits & 16384 | 0) != 0 ? 2 : 2082;
          break;
        }
        if ($bits >>> 0 > 4095) {
          var $value_0 = HEAPU16[($bits >>> 10 << 1) + 5246672 >> 1];
          break;
        }
        if ($bits >>> 0 > 511) {
          var $value_0 = HEAPU16[($bits >>> 7 << 1) + 5246608 >> 1];
          break;
        } else {
          var $value_0 = HEAPU16[($bits >>> 2 << 1) + 5246352 >> 1];
          break;
        }
      } else {
        if ($nc >>> 0 < 8) {
          var $shr57 = $bits >>> 10;
          if (($shr57 - 8 | 0) >>> 0 < 56) {
            var $value_0 = HEAPU16[($shr57 << 1) + 5246224 >> 1];
            break;
          }
          var $value_0 = HEAPU16[($bits >>> 6 << 1) + 5245968 >> 1];
          break;
        }
        if ($nc >>> 0 < 17) {
          var $value_0 = HEAPU16[($bits >>> 10 << 1) + 5245840 >> 1];
          break;
        }
        var $shr74 = $bits >>> 13;
        if (($shr74 | 0) != 0) {
          var $value_0 = HEAPU16[($shr74 << 1) + 5245824 >> 1];
          break;
        }
        var $value_0 = HEAPU16[($bits >>> 8 << 1) + 5245760 >> 1];
        break;
      }
    }
  } while (0);
  var $value_0;
  return $value_0;
}
_DecodeCoeffToken["X"] = 1;
function _DecodeTotalZeros($bits, $totalCoeff, $isChromaDC) {
  do {
    if (($isChromaDC | 0) == 0) {
      if (($totalCoeff | 0) == 14) {
        var $value_0 = HEAPU8[($bits >>> 7) + 5243392 | 0];
        break;
      } else if (($totalCoeff | 0) == 7) {
        var $value_0 = HEAPU8[($bits >>> 3) + 5243008 | 0];
        break;
      } else if (($totalCoeff | 0) == 2) {
        var $value_0 = HEAPU8[($bits >>> 3) + 5243264 | 0];
        break;
      } else if (($totalCoeff | 0) == 5) {
        var $value_0 = HEAPU8[($bits >>> 4) + 5243136 | 0];
        break;
      } else if (($totalCoeff | 0) == 3) {
        var $value_0 = HEAPU8[($bits >>> 3) + 5243200 | 0];
        break;
      } else if (($totalCoeff | 0) == 8) {
        var $value_0 = HEAPU8[($bits >>> 3) + 5242944 | 0];
        break;
      } else if (($totalCoeff | 0) == 10) {
        var $value_0 = HEAPU8[($bits >>> 4) + 5243436 | 0];
        break;
      } else if (($totalCoeff | 0) == 6) {
        var $value_0 = HEAPU8[($bits >>> 3) + 5243072 | 0];
        break;
      } else if (($totalCoeff | 0) == 4) {
        var $value_0 = HEAPU8[($bits >>> 4) + 5243168 | 0];
        break;
      } else if (($totalCoeff | 0) == 9) {
        var $value_0 = HEAPU8[($bits >>> 3) + 5242880 | 0];
        break;
      } else if (($totalCoeff | 0) == 12) {
        var $value_0 = HEAPU8[($bits >>> 5) + 5243404 | 0];
        break;
      } else if (($totalCoeff | 0) == 1) {
        if ($bits >>> 0 > 31) {
          var $value_0 = HEAPU8[($bits >>> 4) + 5243360 | 0];
          break;
        }
        var $value_0 = HEAPU8[$bits + 5243328 | 0];
        break;
      } else if (($totalCoeff | 0) == 11) {
        var $value_0 = HEAPU8[($bits >>> 5) + 5243420 | 0];
        break;
      } else if (($totalCoeff | 0) == 13) {
        var $value_0 = HEAPU8[($bits >>> 6) + 5243396 | 0];
        break;
      } else {
        var $value_0 = $bits >>> 0 > 255 ? 17 : 1;
        break;
      }
    } else {
      if ($bits >>> 0 > 255) {
        var $value_0 = 1;
        break;
      }
      if (($totalCoeff | 0) == 3) {
        var $value_0 = 17;
        break;
      }
      if ($bits >>> 0 > 127) {
        var $value_0 = 18;
        break;
      }
      if (($totalCoeff | 0) == 2) {
        var $value_0 = 34;
        break;
      }
      var $value_0 = $bits >>> 0 > 63 ? 35 : 51;
    }
  } while (0);
  var $value_0;
  return $value_0;
}
_DecodeTotalZeros["X"] = 1;
function _DecodeRunBefore($bits, $zerosLeft) {
  if (($zerosLeft | 0) == 1) {
    var $value_1_in_in = ($bits >>> 10) + 5243716 | 0;
  } else if (($zerosLeft | 0) == 5) {
    var $value_1_in_in = ($bits >>> 8) + 5243692 | 0;
  } else if (($zerosLeft | 0) == 4) {
    var $value_1_in_in = ($bits >>> 8) + 5243700 | 0;
  } else if (($zerosLeft | 0) == 6) {
    var $value_1_in_in = ($bits >>> 8) + 5243684 | 0;
  } else if (($zerosLeft | 0) == 2) {
    var $value_1_in_in = ($bits >>> 9) + 5243712 | 0;
  } else if (($zerosLeft | 0) == 3) {
    var $value_1_in_in = ($bits >>> 9) + 5243708 | 0;
  } else {
    do {
      if ($bits >>> 0 > 255) {
        var $value_0 = 7 - ($bits >>> 8) << 4 | 3;
      } else {
        if ($bits >>> 0 > 127) {
          var $value_0 = 116;
          break;
        }
        if ($bits >>> 0 > 63) {
          var $value_0 = 133;
          break;
        }
        if ($bits >>> 0 > 31) {
          var $value_0 = 150;
          break;
        }
        if ($bits >>> 0 > 15) {
          var $value_0 = 167;
          break;
        }
        if ($bits >>> 0 > 7) {
          var $value_0 = 184;
          break;
        }
        if ($bits >>> 0 > 3) {
          var $value_0 = 201;
          break;
        }
        if ($bits >>> 0 > 1) {
          var $value_0 = 218;
          break;
        }
        var $value_0 = ($bits | 0) == 0 ? 0 : 235;
      }
    } while (0);
    var $value_0;
    return ($value_0 >>> 4 & 15) >>> 0 > $zerosLeft >>> 0 ? 0 : $value_0;
  }
  var $value_1_in_in;
  return HEAPU8[$value_1_in_in];
}
_DecodeRunBefore["X"] = 1;
function _h264bsdInitMbNeighbours($pMbStorage, $picWidth, $picSizeInMbs) {
  var $pMbStorage$s2 = $pMbStorage >> 2;
  var label = 0;
  if (($picSizeInMbs | 0) == 0) {
    return;
  }
  var $sub = $picWidth - 1 | 0;
  var $idx_neg18 = 1 - $picWidth | 0;
  var $idx_neg30 = $picWidth ^ -1;
  var $i_037 = 0;
  var $row_038 = 0;
  var $col_039 = 0;
  while (1) {
    var $col_039;
    var $row_038;
    var $i_037;
    var $tobool = ($col_039 | 0) != 0;
    if ($tobool) {
      HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 50] = $pMbStorage + ($i_037 - 1) * 216 | 0;
    } else {
      HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 50] = 0;
    }
    var $tobool4 = ($row_038 | 0) != 0;
    do {
      if ($tobool4) {
        HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 51] = $pMbStorage + ($i_037 - $picWidth) * 216 | 0;
        if ($col_039 >>> 0 >= $sub >>> 0) {
          label = 926;
          break;
        }
        HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 52] = $pMbStorage + ($idx_neg18 + $i_037) * 216 | 0;
        break;
      } else {
        HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 51] = 0;
        label = 926;
        break;
      }
    } while (0);
    if (label == 926) {
      label = 0;
      HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 52] = 0;
    }
    if ($tobool4 & $tobool) {
      HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 53] = $pMbStorage + ($i_037 + $idx_neg30) * 216 | 0;
    } else {
      HEAP32[$pMbStorage$s2 + ($i_037 * 54 | 0) + 53] = 0;
    }
    var $inc = $col_039 + 1 | 0;
    var $cmp37 = ($inc | 0) == ($picWidth | 0);
    var $inc41 = $i_037 + 1 | 0;
    if (($inc41 | 0) == ($picSizeInMbs | 0)) {
      break;
    } else {
      var $i_037 = $inc41;
      var $row_038 = ($cmp37 & 1) + $row_038 | 0;
      var $col_039 = $cmp37 ? 0 : $inc;
    }
  }
  return;
}
_h264bsdInitMbNeighbours["X"] = 1;
function _h264bsdGetNeighbourMb($pMb, $neighbour) {
  if (($neighbour | 0) == 0) {
    var $retval_0 = HEAP32[$pMb + 200 >> 2];
  } else if (($neighbour | 0) == 4) {
    var $retval_0 = $pMb;
  } else if (($neighbour | 0) == 3) {
    var $retval_0 = HEAP32[$pMb + 212 >> 2];
  } else if (($neighbour | 0) == 2) {
    var $retval_0 = HEAP32[$pMb + 208 >> 2];
  } else if (($neighbour | 0) == 1) {
    var $retval_0 = HEAP32[$pMb + 204 >> 2];
  } else {
    var $retval_0 = 0;
  }
  var $retval_0;
  return $retval_0;
}
function _h264bsdDecodeResidualBlockCavlc($pStrmData, $coeffLevel, $nc, $maxNumCoeff) {
  var $run$s2;
  var $level$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 128 | 0;
  var $level$s2 = __stackBase__ >> 2;
  var $run$s2 = __stackBase__ + 64 >> 2;
  var $call = _h264bsdShowBits32($pStrmData);
  var $call17 = _DecodeCoeffToken($call >>> 16, $nc);
  if (($call17 | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $and = $call17 & 31;
  var $shl = $call << $and;
  var $sub21 = 32 - $and | 0;
  var $and23 = $call17 >>> 11 & 31;
  if ($and23 >>> 0 > $maxNumCoeff >>> 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $and28 = $call17 >>> 5 & 63;
  L1204 : do {
    if (($and23 | 0) == 0) {
      var $bufferBits_12 = $sub21;
      var $levelSuffix_1 = 0;
    } else {
      if (($and28 | 0) == 0) {
        var $bufferBits_2 = $sub21;
        var $bufferValue_2 = $shl;
        var $i_1 = 0;
      } else {
        do {
          if ($sub21 >>> 0 < $and28 >>> 0) {
            if ((_h264bsdFlushBits($pStrmData, $and) | 0) == -1) {
              var $retval_0 = 1;
              var $retval_0;
              STACKTOP = __stackBase__;
              return $retval_0;
            } else {
              var $bufferBits_1 = 32;
              var $bufferValue_1 = _h264bsdShowBits32($pStrmData);
              break;
            }
          } else {
            var $bufferBits_1 = $sub21;
            var $bufferValue_1 = $shl;
          }
        } while (0);
        var $bufferValue_1;
        var $bufferBits_1;
        var $shr43 = $bufferValue_1 >>> ((32 - $and28 | 0) >>> 0);
        var $shl44 = $bufferValue_1 << $and28;
        var $tmp_0168 = 1 << $and28 - 1;
        var $i_0169 = 0;
        while (1) {
          var $i_0169;
          var $tmp_0168;
          HEAP32[($i_0169 << 2 >> 2) + $level$s2] = ($tmp_0168 & $shr43 | 0) != 0 ? -1 : 1;
          var $shr51 = $tmp_0168 >>> 1;
          var $inc = $i_0169 + 1 | 0;
          if (($shr51 | 0) == 0) {
            break;
          } else {
            var $tmp_0168 = $shr51;
            var $i_0169 = $inc;
          }
        }
        var $bufferBits_2 = $bufferBits_1 - $and28 | 0;
        var $bufferValue_2 = $shl44;
        var $i_1 = $inc;
      }
      var $i_1;
      var $bufferValue_2;
      var $bufferBits_2;
      var $cmp54 = $and28 >>> 0 < 3;
      L1218 : do {
        if ($i_1 >>> 0 < $and23 >>> 0) {
          var $i_2162 = $i_1;
          var $suffixLength_0163 = $and23 >>> 0 > 10 & $cmp54 & 1;
          var $bufferValue_3164 = $bufferValue_2;
          var $bufferBits_3165 = $bufferBits_2;
          while (1) {
            var $bufferBits_3165;
            var $bufferValue_3164;
            var $suffixLength_0163;
            var $i_2162;
            if ($bufferBits_3165 >>> 0 < 16) {
              if ((_h264bsdFlushBits($pStrmData, 32 - $bufferBits_3165 | 0) | 0) == -1) {
                var $retval_0 = 1;
                label = 994;
                break;
              }
              var $bufferBits_4 = 32;
              var $bufferValue_4 = _h264bsdShowBits32($pStrmData);
            } else {
              var $bufferBits_4 = $bufferBits_3165;
              var $bufferValue_4 = $bufferValue_3164;
            }
            var $bufferValue_4;
            var $bufferBits_4;
            var $call70 = _DecodeLevelPrefix($bufferValue_4 >>> 16);
            if (($call70 | 0) == -2) {
              var $retval_0 = 1;
              label = 993;
              break;
            }
            var $add = $call70 + 1 | 0;
            var $shl74 = $bufferValue_4 << $add;
            var $sub76 = $bufferBits_4 - $add | 0;
            do {
              if ($call70 >>> 0 < 14) {
                var $tmp_1 = $suffixLength_0163;
                label = 961;
              } else {
                var $tobool82 = ($suffixLength_0163 | 0) != 0;
                if (($call70 | 0) == 14) {
                  var $tmp_1 = $tobool82 ? $suffixLength_0163 : 4;
                  label = 961;
                  break;
                } else {
                  var $suffixLength_0_ = $tobool82 ? $suffixLength_0163 : 1;
                  var $tmp_1136 = 12;
                  var $suffixLength_2137 = $suffixLength_0_;
                  var $tobool90139 = ($suffixLength_0_ | 0) == 0;
                  var $call70_shl92141 = $call70 << $suffixLength_0_;
                  label = 962;
                  break;
                }
              }
            } while (0);
            do {
              if (label == 961) {
                label = 0;
                var $tmp_1;
                var $tobool90 = ($suffixLength_0163 | 0) == 0;
                var $shl92 = $call70 << $suffixLength_0163;
                if (($tmp_1 | 0) == 0) {
                  var $bufferBits_6 = $sub76;
                  var $bufferValue_6 = $shl74;
                  var $levelPrefix_1 = $shl92;
                  var $suffixLength_2138 = $suffixLength_0163;
                  var $tobool90140 = $tobool90;
                  break;
                } else {
                  var $tmp_1136 = $tmp_1;
                  var $suffixLength_2137 = $suffixLength_0163;
                  var $tobool90139 = $tobool90;
                  var $call70_shl92141 = $shl92;
                  label = 962;
                  break;
                }
              }
            } while (0);
            if (label == 962) {
              label = 0;
              var $call70_shl92141;
              var $tobool90139;
              var $suffixLength_2137;
              var $tmp_1136;
              if ($sub76 >>> 0 < $tmp_1136 >>> 0) {
                if ((_h264bsdFlushBits($pStrmData, 32 - $sub76 | 0) | 0) == -1) {
                  var $retval_0 = 1;
                  label = 999;
                  break;
                }
                var $bufferBits_5 = 32;
                var $bufferValue_5 = _h264bsdShowBits32($pStrmData);
              } else {
                var $bufferBits_5 = $sub76;
                var $bufferValue_5 = $shl74;
              }
              var $bufferValue_5;
              var $bufferBits_5;
              var $bufferBits_6 = $bufferBits_5 - $tmp_1136 | 0;
              var $bufferValue_6 = $bufferValue_5 << $tmp_1136;
              var $levelPrefix_1 = ($bufferValue_5 >>> ((32 - $tmp_1136 | 0) >>> 0)) + $call70_shl92141 | 0;
              var $suffixLength_2138 = $suffixLength_2137;
              var $tobool90140 = $tobool90139;
            }
            var $tobool90140;
            var $suffixLength_2138;
            var $levelPrefix_1;
            var $bufferValue_6;
            var $bufferBits_6;
            var $tmp_2 = ($i_2162 | 0) == ($and28 | 0) & $cmp54 ? $levelPrefix_1 + 2 | 0 : $levelPrefix_1;
            var $shr118 = ($tmp_2 + 2 | 0) >>> 1;
            var $_suffixLength_2 = $tobool90140 ? 1 : $suffixLength_2138;
            HEAP32[($i_2162 << 2 >> 2) + $level$s2] = ($tmp_2 & 1 | 0) == 0 ? $shr118 : -$shr118 | 0;
            var $inc140 = $i_2162 + 1 | 0;
            if ($inc140 >>> 0 < $and23 >>> 0) {
              var $i_2162 = $inc140;
              var $suffixLength_0163 = (($shr118 | 0) > (3 << $_suffixLength_2 - 1 | 0) & $_suffixLength_2 >>> 0 < 6 & 1) + $_suffixLength_2 | 0;
              var $bufferValue_3164 = $bufferValue_6;
              var $bufferBits_3165 = $bufferBits_6;
            } else {
              var $bufferValue_3_lcssa = $bufferValue_6;
              var $bufferBits_3_lcssa = $bufferBits_6;
              break L1218;
            }
          }
          if (label == 993) {
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else if (label == 994) {
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else if (label == 999) {
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
        } else {
          var $bufferValue_3_lcssa = $bufferValue_2;
          var $bufferBits_3_lcssa = $bufferBits_2;
        }
      } while (0);
      var $bufferBits_3_lcssa;
      var $bufferValue_3_lcssa;
      do {
        if ($and23 >>> 0 < $maxNumCoeff >>> 0) {
          do {
            if ($bufferBits_3_lcssa >>> 0 < 9) {
              if ((_h264bsdFlushBits($pStrmData, 32 - $bufferBits_3_lcssa | 0) | 0) == -1) {
                var $retval_0 = 1;
                var $retval_0;
                STACKTOP = __stackBase__;
                return $retval_0;
              } else {
                var $bufferBits_7 = 32;
                var $bufferValue_7 = _h264bsdShowBits32($pStrmData);
                break;
              }
            } else {
              var $bufferBits_7 = $bufferBits_3_lcssa;
              var $bufferValue_7 = $bufferValue_3_lcssa;
            }
          } while (0);
          var $bufferValue_7;
          var $bufferBits_7;
          var $call155 = _DecodeTotalZeros($bufferValue_7 >>> 23, $and23, ($maxNumCoeff | 0) == 4 & 1);
          if (($call155 | 0) == 0) {
            var $retval_0 = 1;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else {
            var $and159 = $call155 & 15;
            var $bufferBits_9_ph = $bufferBits_7 - $and159 | 0;
            var $bufferValue_9_ph = $bufferValue_7 << $and159;
            var $zerosLeft_1_ph = $call155 >>> 4 & 15;
            break;
          }
        } else {
          var $bufferBits_9_ph = $bufferBits_3_lcssa;
          var $bufferValue_9_ph = $bufferValue_3_lcssa;
          var $zerosLeft_1_ph = 0;
        }
      } while (0);
      var $zerosLeft_1_ph;
      var $bufferValue_9_ph;
      var $bufferBits_9_ph;
      var $sub168 = $and23 - 1 | 0;
      if (($sub168 | 0) == 0) {
        HEAP32[$coeffLevel + ($zerosLeft_1_ph << 2) >> 2] = HEAP32[$level$s2];
        var $bufferBits_12 = $bufferBits_9_ph;
        var $levelSuffix_1 = 1 << $zerosLeft_1_ph;
        break;
      } else {
        var $i_3151 = 0;
        var $zerosLeft_1152 = $zerosLeft_1_ph;
        var $bufferValue_9153 = $bufferValue_9_ph;
        var $bufferBits_9154 = $bufferBits_9_ph;
      }
      while (1) {
        var $bufferBits_9154;
        var $bufferValue_9153;
        var $zerosLeft_1152;
        var $i_3151;
        if (($zerosLeft_1152 | 0) == 0) {
          HEAP32[($i_3151 << 2 >> 2) + $run$s2] = 1;
          var $bufferBits_11 = $bufferBits_9154;
          var $bufferValue_11 = $bufferValue_9153;
          var $zerosLeft_2 = 0;
        } else {
          if ($bufferBits_9154 >>> 0 < 11) {
            if ((_h264bsdFlushBits($pStrmData, 32 - $bufferBits_9154 | 0) | 0) == -1) {
              var $retval_0 = 1;
              label = 996;
              break;
            }
            var $bufferBits_10 = 32;
            var $bufferValue_10 = _h264bsdShowBits32($pStrmData);
          } else {
            var $bufferBits_10 = $bufferBits_9154;
            var $bufferValue_10 = $bufferValue_9153;
          }
          var $bufferValue_10;
          var $bufferBits_10;
          var $call187 = _DecodeRunBefore($bufferValue_10 >>> 21, $zerosLeft_1152);
          if (($call187 | 0) == 0) {
            var $retval_0 = 1;
            label = 991;
            break;
          }
          var $and191 = $call187 & 15;
          var $and196 = $call187 >>> 4 & 15;
          HEAP32[($i_3151 << 2 >> 2) + $run$s2] = $and196 + 1 | 0;
          var $bufferBits_11 = $bufferBits_10 - $and191 | 0;
          var $bufferValue_11 = $bufferValue_10 << $and191;
          var $zerosLeft_2 = $zerosLeft_1152 - $and196 | 0;
        }
        var $zerosLeft_2;
        var $bufferValue_11;
        var $bufferBits_11;
        var $inc205 = $i_3151 + 1 | 0;
        if ($inc205 >>> 0 < $sub168 >>> 0) {
          var $i_3151 = $inc205;
          var $zerosLeft_1152 = $zerosLeft_2;
          var $bufferValue_9153 = $bufferValue_11;
          var $bufferBits_9154 = $bufferBits_11;
        } else {
          label = 983;
          break;
        }
      }
      if (label == 983) {
        HEAP32[$coeffLevel + ($zerosLeft_2 << 2) >> 2] = HEAP32[($sub168 << 2 >> 2) + $level$s2];
        var $tmp_3144 = $zerosLeft_2;
        var $levelSuffix_0145 = 1 << $zerosLeft_2;
        var $dec146 = $and23 - 2 | 0;
        while (1) {
          var $dec146;
          var $levelSuffix_0145;
          var $tmp_3144;
          var $add216 = HEAP32[($dec146 << 2 >> 2) + $run$s2] + $tmp_3144 | 0;
          var $or = 1 << $add216 | $levelSuffix_0145;
          HEAP32[$coeffLevel + ($add216 << 2) >> 2] = HEAP32[($dec146 << 2 >> 2) + $level$s2];
          if (($dec146 | 0) == 0) {
            var $bufferBits_12 = $bufferBits_11;
            var $levelSuffix_1 = $or;
            break L1204;
          } else {
            var $tmp_3144 = $add216;
            var $levelSuffix_0145 = $or;
            var $dec146 = $dec146 - 1 | 0;
          }
        }
      } else if (label == 991) {
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      } else if (label == 996) {
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    }
  } while (0);
  var $levelSuffix_1;
  var $bufferBits_12;
  if ((_h264bsdFlushBits($pStrmData, 32 - $bufferBits_12 | 0) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $retval_0 = $levelSuffix_1 << 16 | $and23 << 4;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdDecodeResidualBlockCavlc["X"] = 1;
function _h264bsdDecodeNalUnit($pStrmData, $pNalUnit) {
  var $nalRefIdc$s2;
  do {
    if ((_h264bsdGetBits($pStrmData, 1) | 0) == -1) {
      var $retval_0 = 1;
    } else {
      var $nalRefIdc$s2 = ($pNalUnit + 4 | 0) >> 2;
      HEAP32[$nalRefIdc$s2] = _h264bsdGetBits($pStrmData, 2);
      var $call2 = _h264bsdGetBits($pStrmData, 5);
      HEAP32[$pNalUnit >> 2] = $call2;
      if (($call2 - 2 | 0) >>> 0 < 3) {
        var $retval_0 = 1;
        break;
      }
      if (($call2 - 7 | 0) >>> 0 < 2 | ($call2 | 0) == 5) {
        if ((HEAP32[$nalRefIdc$s2] | 0) == 0) {
          var $retval_0 = 1;
          break;
        }
      }
      if (($call2 | 0) == 12 | ($call2 | 0) == 11 | ($call2 | 0) == 10 | ($call2 | 0) == 9 | ($call2 | 0) == 6) {
        if ((HEAP32[$nalRefIdc$s2] | 0) != 0) {
          var $retval_0 = 1;
          break;
        }
      }
      var $retval_0 = 0;
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
function _h264bsdIsStartOfPicture($pStorage_0_11_val) {
  return ($pStorage_0_11_val | 0) == 0 & 1;
}
function _h264bsdNeighbour4x4BlockA($blockIndex) {
  return ($blockIndex << 3) + 5250380 | 0;
}
function _h264bsdNeighbour4x4BlockB($blockIndex) {
  return ($blockIndex << 3) + 5249676 | 0;
}
function _h264bsdNeighbour4x4BlockC($blockIndex) {
  return ($blockIndex << 3) + 5248972 | 0;
}
function _h264bsdNeighbour4x4BlockD($blockIndex) {
  return ($blockIndex << 3) + 5248268 | 0;
}
function _h264bsdIsNeighbourAvailable($pMb, $pNeighbour) {
  if (($pNeighbour | 0) == 0) {
    return 0;
  } else {
    return (HEAP32[$pMb + 4 >> 2] | 0) == (HEAP32[$pNeighbour + 4 >> 2] | 0) & 1;
  }
}
function _CheckPps($pps, $sps_0_13_val, $sps_0_14_val) {
  var label = 0;
  var $mul = $sps_0_14_val * $sps_0_13_val & -1;
  var $0 = HEAP32[$pps + 12 >> 2];
  L1303 : do {
    if ($0 >>> 0 > 1) {
      var $1 = HEAP32[$pps + 16 >> 2];
      if (($1 | 0) == 0) {
        var $runLength = $pps + 20 | 0;
        var $i_0 = 0;
        while (1) {
          var $i_0;
          if ($i_0 >>> 0 >= $0 >>> 0) {
            break L1303;
          }
          if (HEAP32[HEAP32[$runLength >> 2] + ($i_0 << 2) >> 2] >>> 0 > $mul >>> 0) {
            var $retval_0 = 1;
            break;
          } else {
            var $i_0 = $i_0 + 1 | 0;
          }
        }
        var $retval_0;
        return $retval_0;
      } else if (($1 | 0) == 2) {
        var $sub = $0 - 1 | 0;
        var $topLeft = $pps + 24 | 0;
        var $bottomRight = $pps + 28 | 0;
        var $i_1 = 0;
        while (1) {
          var $i_1;
          if ($i_1 >>> 0 >= $sub >>> 0) {
            break L1303;
          }
          var $5 = HEAP32[HEAP32[$topLeft >> 2] + ($i_1 << 2) >> 2];
          var $7 = HEAP32[HEAP32[$bottomRight >> 2] + ($i_1 << 2) >> 2];
          if (!($5 >>> 0 <= $7 >>> 0 & $7 >>> 0 < $mul >>> 0)) {
            var $retval_0 = 1;
            label = 1031;
            break;
          }
          if (($5 >>> 0) % ($sps_0_13_val >>> 0) >>> 0 > ($7 >>> 0) % ($sps_0_13_val >>> 0) >>> 0) {
            var $retval_0 = 1;
            label = 1036;
            break;
          } else {
            var $i_1 = $i_1 + 1 | 0;
          }
        }
        if (label == 1036) {
          var $retval_0;
          return $retval_0;
        } else if (label == 1031) {
          var $retval_0;
          return $retval_0;
        }
      } else {
        if (($1 - 3 | 0) >>> 0 < 3) {
          if (HEAP32[$pps + 36 >> 2] >>> 0 > $mul >>> 0) {
            var $retval_0 = 1;
          } else {
            break;
          }
          var $retval_0;
          return $retval_0;
        }
        if (($1 | 0) != 6) {
          break;
        }
        if (HEAP32[$pps + 40 >> 2] >>> 0 < $mul >>> 0) {
          var $retval_0 = 1;
        } else {
          break;
        }
        var $retval_0;
        return $retval_0;
      }
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_CheckPps["X"] = 1;
function _h264bsdResetStorage($pStorage) {
  HEAP32[$pStorage + 1196 >> 2] = 0;
  HEAP32[$pStorage + 1192 >> 2] = 0;
  var $picSizeInMbs = $pStorage + 1176 | 0;
  if ((HEAP32[$picSizeInMbs >> 2] | 0) == 0) {
    return;
  }
  var $mb = $pStorage + 1212 | 0;
  var $i_09 = 0;
  while (1) {
    var $i_09;
    HEAP32[(HEAP32[$mb >> 2] + 4 >> 2) + ($i_09 * 54 | 0)] = 0;
    HEAP32[(HEAP32[$mb >> 2] + 196 >> 2) + ($i_09 * 54 | 0)] = 0;
    var $inc = $i_09 + 1 | 0;
    if ($inc >>> 0 < HEAP32[$picSizeInMbs >> 2] >>> 0) {
      var $i_09 = $inc;
    } else {
      break;
    }
  }
  return;
}
function _h264bsdIsEndOfPicture($pStorage) {
  var $pStorage$s2 = $pStorage >> 2;
  do {
    if ((HEAP32[$pStorage$s2 + 351] | 0) == 0) {
      if ((HEAP32[$pStorage$s2 + 299] | 0) == (HEAP32[$pStorage$s2 + 294] | 0)) {
        var $retval_0 = 1;
      } else {
        break;
      }
      var $retval_0;
      return $retval_0;
    } else {
      var $1 = HEAP32[$pStorage$s2 + 294];
      if (($1 | 0) == 0) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $2 = HEAP32[$pStorage$s2 + 303];
      var $i_010 = 0;
      var $tmp_011 = 0;
      while (1) {
        var $tmp_011;
        var $i_010;
        var $add = ((HEAP32[($2 + 196 >> 2) + ($i_010 * 54 | 0)] | 0) != 0 & 1) + $tmp_011 | 0;
        var $inc = $i_010 + 1 | 0;
        if ($inc >>> 0 < $1 >>> 0) {
          var $i_010 = $inc;
          var $tmp_011 = $add;
        } else {
          break;
        }
      }
      if (($add | 0) == ($1 | 0)) {
        var $retval_0 = 1;
      } else {
        break;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
function _h264bsdInitStorage($pStorage) {
  _H264SwDecMemset($pStorage, 0, 3388);
  HEAP32[$pStorage + 8 >> 2] = 32;
  HEAP32[$pStorage + 4 >> 2] = 256;
  HEAP32[$pStorage + 1332 >> 2] = 1;
  return;
}
function _h264bsdStoreSeqParamSet($pStorage, $pSeqParamSet) {
  var $arrayidx$s2;
  var $0 = HEAP32[$pSeqParamSet + 8 >> 2];
  var $arrayidx$s2 = (($0 << 2) + $pStorage + 20 | 0) >> 2;
  var $1 = HEAP32[$arrayidx$s2];
  do {
    if (($1 | 0) == 0) {
      var $call = _H264SwDecMalloc(92);
      HEAP32[$arrayidx$s2] = $call;
      if (($call | 0) != 0) {
        break;
      }
      return;
    } else {
      var $activeSpsId = $pStorage + 8 | 0;
      if (($0 | 0) != (HEAP32[$activeSpsId >> 2] | 0)) {
        _H264SwDecFree(HEAP32[$1 + 40 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 40 >> 2] = 0;
        _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 84 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 84 >> 2] = 0;
        break;
      }
      var $activeSps = $pStorage + 16 | 0;
      if ((_h264bsdCompareSeqParamSets($pSeqParamSet, HEAP32[$activeSps >> 2]) | 0) != 0) {
        _H264SwDecFree(HEAP32[$1 + 40 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 40 >> 2] = 0;
        _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 84 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 84 >> 2] = 0;
        HEAP32[$activeSpsId >> 2] = 33;
        HEAP32[$pStorage + 4 >> 2] = 257;
        HEAP32[$activeSps >> 2] = 0;
        HEAP32[$pStorage + 12 >> 2] = 0;
        break;
      }
      var $offsetForRefFrame25 = $pSeqParamSet + 40 | 0;
      _H264SwDecFree(HEAP32[$offsetForRefFrame25 >> 2]);
      HEAP32[$offsetForRefFrame25 >> 2] = 0;
      var $vuiParameters27 = $pSeqParamSet + 84 | 0;
      _H264SwDecFree(HEAP32[$vuiParameters27 >> 2]);
      HEAP32[$vuiParameters27 >> 2] = 0;
      return;
    }
  } while (0);
  var $24 = HEAP32[$arrayidx$s2];
  var $25 = $pSeqParamSet;
  for (var $$src = $25 >> 2, $$dest = $24 >> 2, $$stop = $$src + 23; $$src < $$stop; $$src++, $$dest++) {
    HEAP32[$$dest] = HEAP32[$$src];
  }
  return;
}
_h264bsdStoreSeqParamSet["X"] = 1;
function _h264bsdStorePicParamSet($pStorage, $pPicParamSet) {
  var $arrayidx$s2;
  var $0 = HEAP32[$pPicParamSet >> 2];
  var $arrayidx$s2 = (($0 << 2) + $pStorage + 148 | 0) >> 2;
  var $1 = HEAP32[$arrayidx$s2];
  do {
    if (($1 | 0) == 0) {
      var $call = _H264SwDecMalloc(72);
      HEAP32[$arrayidx$s2] = $call;
      if (($call | 0) != 0) {
        break;
      }
      return;
    } else {
      var $activePpsId = $pStorage + 4 | 0;
      if (($0 | 0) != (HEAP32[$activePpsId >> 2] | 0)) {
        _H264SwDecFree(HEAP32[$1 + 20 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 20 >> 2] = 0;
        _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 24 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 24 >> 2] = 0;
        _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 28 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 28 >> 2] = 0;
        _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 44 >> 2]);
        HEAP32[HEAP32[$arrayidx$s2] + 44 >> 2] = 0;
        break;
      }
      if ((HEAP32[$pPicParamSet + 4 >> 2] | 0) == (HEAP32[$pStorage + 8 >> 2] | 0)) {
        var $6 = $1;
      } else {
        HEAP32[$activePpsId >> 2] = 257;
        var $6 = HEAP32[$arrayidx$s2];
      }
      var $6;
      _H264SwDecFree(HEAP32[$6 + 20 >> 2]);
      HEAP32[HEAP32[$arrayidx$s2] + 20 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 24 >> 2]);
      HEAP32[HEAP32[$arrayidx$s2] + 24 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 28 >> 2]);
      HEAP32[HEAP32[$arrayidx$s2] + 28 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 44 >> 2]);
      HEAP32[HEAP32[$arrayidx$s2] + 44 >> 2] = 0;
    }
  } while (0);
  var $38 = HEAP32[$arrayidx$s2];
  var $39 = $pPicParamSet;
  for (var $$src = $39 >> 2, $$dest = $38 >> 2, $$stop = $$src + 18; $$src < $$stop; $$src++, $$dest++) {
    HEAP32[$$dest] = HEAP32[$$src];
  }
  return;
}
_h264bsdStorePicParamSet["X"] = 1;
function _h264bsdActivateParamSets($pStorage, $ppsId, $isIdr) {
  var $28$s2;
  var $picSizeInMbs39$s2;
  var $sliceGroupMap$s2;
  var $mb$s2;
  var $pendingActivation34$s2;
  var $activePpsId$s2;
  var $arrayidx$s2;
  var $pStorage$s2 = $pStorage >> 2;
  var $arrayidx$s2 = (($ppsId << 2) + $pStorage + 148 | 0) >> 2;
  var $0 = HEAP32[$arrayidx$s2];
  if (($0 | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $1 = HEAP32[$0 + 4 >> 2];
  var $2 = HEAP32[(($1 << 2) + 20 >> 2) + $pStorage$s2];
  if (($2 | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $call = _CheckPps($0, HEAP32[$2 + 52 >> 2], HEAP32[$2 + 56 >> 2]);
  if (($call | 0) != 0) {
    var $retval_0 = $call;
    var $retval_0;
    return $retval_0;
  }
  var $activePpsId$s2 = ($pStorage + 4 | 0) >> 2;
  var $3 = HEAP32[$activePpsId$s2];
  do {
    if (($3 | 0) == 256) {
      HEAP32[$activePpsId$s2] = $ppsId;
      var $4 = HEAP32[$arrayidx$s2];
      HEAP32[$pStorage$s2 + 3] = $4;
      var $5 = HEAP32[$4 + 4 >> 2];
      HEAP32[$pStorage$s2 + 2] = $5;
      var $6 = HEAP32[(($5 << 2) + 20 >> 2) + $pStorage$s2];
      HEAP32[$pStorage$s2 + 4] = $6;
      var $picWidthInMbs = $6 + 52 | 0;
      var $picHeightInMbs = $6 + 56 | 0;
      HEAP32[$pStorage$s2 + 294] = HEAP32[$picHeightInMbs >> 2] * HEAP32[$picWidthInMbs >> 2] & -1;
      HEAP32[$pStorage$s2 + 335] = HEAP32[$picWidthInMbs >> 2];
      HEAP32[$pStorage$s2 + 336] = HEAP32[$picHeightInMbs >> 2];
      HEAP32[$pStorage$s2 + 845] = 1;
    } else {
      var $pendingActivation34$s2 = ($pStorage + 3380 | 0) >> 2;
      if ((HEAP32[$pendingActivation34$s2] | 0) == 0) {
        if (($3 | 0) == ($ppsId | 0)) {
          break;
        }
        var $activeSpsId97 = $pStorage + 8 | 0;
        if (($1 | 0) == (HEAP32[$activeSpsId97 >> 2] | 0)) {
          HEAP32[$activePpsId$s2] = $ppsId;
          HEAP32[$pStorage$s2 + 3] = HEAP32[$arrayidx$s2];
          break;
        }
        if (($isIdr | 0) == 0) {
          var $retval_0 = 1;
          var $retval_0;
          return $retval_0;
        } else {
          HEAP32[$activePpsId$s2] = $ppsId;
          var $40 = HEAP32[$arrayidx$s2];
          HEAP32[$pStorage$s2 + 3] = $40;
          var $41 = HEAP32[$40 + 4 >> 2];
          HEAP32[$activeSpsId97 >> 2] = $41;
          var $42 = HEAP32[(($41 << 2) + 20 >> 2) + $pStorage$s2];
          HEAP32[$pStorage$s2 + 4] = $42;
          var $picWidthInMbs114 = $42 + 52 | 0;
          var $picHeightInMbs116 = $42 + 56 | 0;
          HEAP32[$pStorage$s2 + 294] = HEAP32[$picHeightInMbs116 >> 2] * HEAP32[$picWidthInMbs114 >> 2] & -1;
          HEAP32[$pStorage$s2 + 335] = HEAP32[$picWidthInMbs114 >> 2];
          HEAP32[$pStorage$s2 + 336] = HEAP32[$picHeightInMbs116 >> 2];
          HEAP32[$pendingActivation34$s2] = 1;
          break;
        }
      }
      HEAP32[$pendingActivation34$s2] = 0;
      var $mb$s2 = ($pStorage + 1212 | 0) >> 2;
      _H264SwDecFree(HEAP32[$mb$s2]);
      HEAP32[$mb$s2] = 0;
      var $sliceGroupMap$s2 = ($pStorage + 1172 | 0) >> 2;
      _H264SwDecFree(HEAP32[$sliceGroupMap$s2]);
      HEAP32[$sliceGroupMap$s2] = 0;
      var $picSizeInMbs39$s2 = ($pStorage + 1176 | 0) >> 2;
      HEAP32[$mb$s2] = _H264SwDecMalloc(HEAP32[$picSizeInMbs39$s2] * 216 & -1);
      var $call45 = _H264SwDecMalloc(HEAP32[$picSizeInMbs39$s2] << 2);
      HEAP32[$sliceGroupMap$s2] = $call45;
      var $20 = HEAP32[$mb$s2];
      if (($20 | 0) == 0 | ($call45 | 0) == 0) {
        var $retval_0 = 65535;
        var $retval_0;
        return $retval_0;
      }
      _H264SwDecMemset($20, 0, HEAP32[$picSizeInMbs39$s2] * 216 & -1);
      var $activeSps58 = $pStorage + 16 | 0;
      _h264bsdInitMbNeighbours(HEAP32[$mb$s2], HEAP32[HEAP32[$activeSps58 >> 2] + 52 >> 2], HEAP32[$picSizeInMbs39$s2]);
      var $28$s2 = HEAP32[$activeSps58 >> 2] >> 2;
      L1403 : do {
        if ((HEAP32[$pStorage$s2 + 304] | 0) == 0) {
          if ((HEAP32[$28$s2 + 4] | 0) == 2) {
            var $flag_0 = 1;
            break;
          }
          do {
            if ((HEAP32[$28$s2 + 20] | 0) != 0) {
              var $31 = HEAP32[$28$s2 + 21];
              if ((HEAP32[$31 + 920 >> 2] | 0) == 0) {
                break;
              }
              if ((HEAP32[$31 + 944 >> 2] | 0) == 0) {
                var $flag_0 = 1;
                break L1403;
              }
            }
          } while (0);
          var $flag_0 = 0;
        } else {
          var $flag_0 = 1;
        }
      } while (0);
      var $flag_0;
      var $call86 = _h264bsdResetDpb($pStorage + 1220 | 0, HEAP32[$28$s2 + 14] * HEAP32[$28$s2 + 13] & -1, HEAP32[$28$s2 + 22], HEAP32[$28$s2 + 11], HEAP32[$28$s2 + 3], $flag_0);
      if (($call86 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call86;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdActivateParamSets["X"] = 1;
function _h264bsdComputeSliceGroupMap($pStorage_0_3_val, $pStorage_0_4_val_0_13_val, $pStorage_0_4_val_0_14_val, $pStorage_0_7_val, $sliceGroupChangeCycle) {
  _h264bsdDecodeSliceGroupMap($pStorage_0_7_val, $pStorage_0_3_val, $sliceGroupChangeCycle, $pStorage_0_4_val_0_13_val, $pStorage_0_4_val_0_14_val);
  return;
}
function _h264bsdCheckAccessUnitBoundary($strm, $nuNext, $storage, $accessUnitBoundaryFlag) {
  var $nalUnitType$s2;
  var $accessUnitBoundaryFlag$s2 = $accessUnitBoundaryFlag >> 2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 28 | 0;
  var $ppsId = __stackBase__;
  var $frameNum = __stackBase__ + 4;
  var $idrPicId = __stackBase__ + 8;
  var $picOrderCntLsb = __stackBase__ + 12;
  var $deltaPicOrderCntBottom = __stackBase__ + 16;
  var $deltaPicOrderCnt = __stackBase__ + 20;
  HEAP32[$accessUnitBoundaryFlag$s2] = 0;
  var $nalUnitType$s2 = ($nuNext | 0) >> 2;
  var $0 = HEAP32[$nalUnitType$s2];
  if (($0 - 6 | 0) >>> 0 < 6 | ($0 - 13 | 0) >>> 0 < 6) {
    HEAP32[$accessUnitBoundaryFlag$s2] = 1;
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if (!(($0 | 0) == 1 | ($0 | 0) == 5)) {
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $arraydecay = $storage + 1300 | 0;
  var $firstCallFlag = $storage + 1332 | 0;
  if ((HEAP32[$firstCallFlag >> 2] | 0) != 0) {
    HEAP32[$accessUnitBoundaryFlag$s2] = 1;
    HEAP32[$firstCallFlag >> 2] = 0;
  }
  var $call = _h264bsdCheckPpsId($strm, $ppsId);
  if (($call | 0) != 0) {
    var $retval_0 = $call;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $5 = HEAP32[$storage + (HEAP32[$ppsId >> 2] << 2) + 148 >> 2];
  if (($5 | 0) == 0) {
    var $retval_0 = 65520;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $6 = HEAP32[$5 + 4 >> 2];
  var $7 = HEAP32[$storage + ($6 << 2) + 20 >> 2];
  if (($7 | 0) == 0) {
    var $retval_0 = 65520;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $8 = HEAP32[$storage + 8 >> 2];
  do {
    if (!(($8 | 0) == 32 | ($6 | 0) == ($8 | 0))) {
      if ((HEAP32[$nalUnitType$s2] | 0) == 5) {
        break;
      } else {
        var $retval_0 = 65520;
      }
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
  } while (0);
  var $10 = HEAP32[$storage + 1304 >> 2];
  var $11 = HEAP32[$nuNext + 4 >> 2];
  do {
    if (($10 | 0) != ($11 | 0)) {
      if (!(($10 | 0) == 0 | ($11 | 0) == 0)) {
        break;
      }
      HEAP32[$accessUnitBoundaryFlag$s2] = 1;
    }
  } while (0);
  var $nalUnitType72 = $arraydecay | 0;
  var $cmp76 = (HEAP32[$nalUnitType$s2] | 0) == 5;
  do {
    if ((HEAP32[$nalUnitType72 >> 2] | 0) == 5) {
      if ($cmp76) {
        break;
      } else {
        label = 1124;
        break;
      }
    } else {
      if ($cmp76) {
        label = 1124;
        break;
      } else {
        break;
      }
    }
  } while (0);
  if (label == 1124) {
    HEAP32[$accessUnitBoundaryFlag$s2] = 1;
  }
  var $maxFrameNum = $7 + 12 | 0;
  if ((_h264bsdCheckFrameNum($strm, HEAP32[$maxFrameNum >> 2], $frameNum) | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $prevFrameNum = $storage + 1308 | 0;
  var $16 = HEAP32[$frameNum >> 2];
  if ((HEAP32[$prevFrameNum >> 2] | 0) != ($16 | 0)) {
    HEAP32[$prevFrameNum >> 2] = $16;
    HEAP32[$accessUnitBoundaryFlag$s2] = 1;
  }
  if ((HEAP32[$nalUnitType$s2] | 0) == 5) {
    if ((_h264bsdCheckIdrPicId($strm, HEAP32[$maxFrameNum >> 2], $idrPicId) | 0) != 0) {
      var $retval_0 = 1;
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
    do {
      if ((HEAP32[$nalUnitType72 >> 2] | 0) == 5) {
        var $prevIdrPicId = $storage + 1312 | 0;
        var $20 = HEAP32[$prevIdrPicId >> 2];
        var $21 = HEAP32[$idrPicId >> 2];
        if (($20 | 0) == ($21 | 0)) {
          var $22 = $20;
          var $prevIdrPicId124_pre_phi = $prevIdrPicId;
          break;
        }
        HEAP32[$accessUnitBoundaryFlag$s2] = 1;
        var $22 = $21;
        var $prevIdrPicId124_pre_phi = $prevIdrPicId;
      } else {
        var $22 = HEAP32[$idrPicId >> 2];
        var $prevIdrPicId124_pre_phi = $storage + 1312 | 0;
      }
    } while (0);
    var $prevIdrPicId124_pre_phi;
    var $22;
    HEAP32[$prevIdrPicId124_pre_phi >> 2] = $22;
  }
  var $23 = HEAP32[$7 + 16 >> 2];
  do {
    if (($23 | 0) == 1) {
      if ((HEAP32[$7 + 24 >> 2] | 0) != 0) {
        break;
      }
      var $picOrderPresentFlag164 = $5 + 8 | 0;
      var $arraydecay165 = $deltaPicOrderCnt | 0;
      var $call166 = _h264bsdCheckDeltaPicOrderCnt($strm, $7, HEAP32[$nalUnitType$s2], HEAP32[$picOrderPresentFlag164 >> 2], $arraydecay165);
      if (($call166 | 0) != 0) {
        var $retval_0 = $call166;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $arrayidx172 = $storage + 1324 | 0;
      var $35 = HEAP32[$arraydecay165 >> 2];
      if ((HEAP32[$arrayidx172 >> 2] | 0) != ($35 | 0)) {
        HEAP32[$arrayidx172 >> 2] = $35;
        HEAP32[$accessUnitBoundaryFlag$s2] = 1;
      }
      if ((HEAP32[$picOrderPresentFlag164 >> 2] | 0) == 0) {
        break;
      }
      var $arrayidx188 = $storage + 1328 | 0;
      var $38 = HEAP32[$deltaPicOrderCnt + 4 >> 2];
      if ((HEAP32[$arrayidx188 >> 2] | 0) == ($38 | 0)) {
        break;
      }
      HEAP32[$arrayidx188 >> 2] = $38;
      HEAP32[$accessUnitBoundaryFlag$s2] = 1;
    } else if (($23 | 0) == 0) {
      if ((_h264bsdCheckPicOrderCntLsb($strm, $7, HEAP32[$nalUnitType$s2], $picOrderCntLsb) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $prevPicOrderCntLsb = $storage + 1316 | 0;
      var $26 = HEAP32[$picOrderCntLsb >> 2];
      if ((HEAP32[$prevPicOrderCntLsb >> 2] | 0) != ($26 | 0)) {
        HEAP32[$prevPicOrderCntLsb >> 2] = $26;
        HEAP32[$accessUnitBoundaryFlag$s2] = 1;
      }
      if ((HEAP32[$5 + 8 >> 2] | 0) == 0) {
        break;
      }
      var $call144 = _h264bsdCheckDeltaPicOrderCntBottom($strm, $7, HEAP32[$nalUnitType$s2], $deltaPicOrderCntBottom);
      if (($call144 | 0) != 0) {
        var $retval_0 = $call144;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $prevDeltaPicOrderCntBottom = $storage + 1320 | 0;
      var $30 = HEAP32[$deltaPicOrderCntBottom >> 2];
      if ((HEAP32[$prevDeltaPicOrderCntBottom >> 2] | 0) == ($30 | 0)) {
        break;
      }
      HEAP32[$prevDeltaPicOrderCntBottom >> 2] = $30;
      HEAP32[$accessUnitBoundaryFlag$s2] = 1;
    }
  } while (0);
  var $39 = $nuNext;
  var $40 = $arraydecay;
  var $41$1 = HEAP32[$39 + 4 >> 2];
  HEAP32[$40 >> 2] = HEAP32[$39 >> 2];
  HEAP32[$40 + 4 >> 2] = $41$1;
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_h264bsdCheckAccessUnitBoundary["X"] = 1;
function _h264bsdValidParamSets($pStorage) {
  var label = 0;
  var $i_011 = 0;
  L1492 : while (1) {
    var $i_011;
    var $0 = HEAP32[$pStorage + ($i_011 << 2) + 148 >> 2];
    do {
      if (($0 | 0) != 0) {
        var $2 = HEAP32[$pStorage + (HEAP32[$0 + 4 >> 2] << 2) + 20 >> 2];
        if (($2 | 0) == 0) {
          break;
        }
        if ((_CheckPps($0, HEAP32[$2 + 52 >> 2], HEAP32[$2 + 56 >> 2]) | 0) == 0) {
          var $retval_0 = 0;
          label = 1170;
          break L1492;
        }
      }
    } while (0);
    var $inc = $i_011 + 1 | 0;
    if ($inc >>> 0 < 256) {
      var $i_011 = $inc;
    } else {
      var $retval_0 = 1;
      label = 1171;
      break;
    }
  }
  if (label == 1170) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1171) {
    var $retval_0;
    return $retval_0;
  }
}
function _get_h264bsdClip() {
  return 5244200;
}
Module["_get_h264bsdClip"] = _get_h264bsdClip;
function _DecodeInterleavedMap($map, $numSliceGroups, $runLength, $picSize) {
  var $group_0_ph = 0;
  var $i_1_ph = 0;
  L1503 : while (1) {
    var $i_1_ph;
    var $group_0_ph;
    var $cmp1 = $i_1_ph >>> 0 < $picSize >>> 0;
    var $group_0 = $group_0_ph;
    while (1) {
      var $group_0;
      if ($group_0 >>> 0 < $numSliceGroups >>> 0 & $cmp1) {
        break;
      }
      if ($cmp1) {
        var $group_0 = 0;
      } else {
        break L1503;
      }
    }
    var $arrayidx = ($group_0 << 2) + $runLength | 0;
    var $0 = HEAP32[$arrayidx >> 2];
    L1509 : do {
      if (($0 | 0) == 0) {
        var $3 = 0;
      } else {
        var $j_015 = 0;
        var $1 = $0;
        while (1) {
          var $1;
          var $j_015;
          var $add = $j_015 + $i_1_ph | 0;
          if ($add >>> 0 >= $picSize >>> 0) {
            var $3 = $1;
            break L1509;
          }
          HEAP32[$map + ($add << 2) >> 2] = $group_0;
          var $inc = $j_015 + 1 | 0;
          var $2 = HEAP32[$arrayidx >> 2];
          if ($inc >>> 0 < $2 >>> 0) {
            var $j_015 = $inc;
            var $1 = $2;
          } else {
            var $3 = $2;
            break L1509;
          }
        }
      }
    } while (0);
    var $3;
    var $group_0_ph = $group_0 + 1 | 0;
    var $i_1_ph = $3 + $i_1_ph | 0;
  }
  return;
}
function _DecodeDispersedMap($map, $numSliceGroups, $picWidth, $picHeight) {
  var $mul = $picHeight * $picWidth & -1;
  if (($mul | 0) == 0) {
    return;
  } else {
    var $i_09 = 0;
  }
  while (1) {
    var $i_09;
    HEAP32[$map + ($i_09 << 2) >> 2] = ((((Math.floor(($i_09 >>> 0) / ($picWidth >>> 0)) * $numSliceGroups & -1) >>> 1) + ($i_09 >>> 0) % ($picWidth >>> 0) | 0) >>> 0) % ($numSliceGroups >>> 0);
    var $inc = $i_09 + 1 | 0;
    if (($inc | 0) == ($mul | 0)) {
      break;
    } else {
      var $i_09 = $inc;
    }
  }
  return;
}
function _DecodeForegroundLeftOverMap($map, $numSliceGroups, $topLeft, $bottomRight, $picWidth, $picHeight) {
  var $mul = $picHeight * $picWidth & -1;
  var $sub = $numSliceGroups - 1 | 0;
  L1522 : do {
    if (($mul | 0) != 0) {
      var $i_028 = 0;
      while (1) {
        var $i_028;
        HEAP32[$map + ($i_028 << 2) >> 2] = $sub;
        var $inc = $i_028 + 1 | 0;
        if (($inc | 0) == ($mul | 0)) {
          break L1522;
        } else {
          var $i_028 = $inc;
        }
      }
    }
  } while (0);
  if (($sub | 0) == 0) {
    return;
  }
  var $dec26 = $numSliceGroups - 2 | 0;
  while (1) {
    var $dec26;
    var $0 = HEAP32[$topLeft + ($dec26 << 2) >> 2];
    var $div = Math.floor(($0 >>> 0) / ($picWidth >>> 0));
    var $rem = ($0 >>> 0) % ($picWidth >>> 0);
    var $1 = HEAP32[$bottomRight + ($dec26 << 2) >> 2];
    var $div7 = Math.floor(($1 >>> 0) / ($picWidth >>> 0));
    var $rem9 = ($1 >>> 0) % ($picWidth >>> 0);
    L1531 : do {
      if ($div >>> 0 <= $div7 >>> 0) {
        var $cmp1420 = $rem >>> 0 > $rem9 >>> 0;
        var $y_023 = $div;
        while (1) {
          var $y_023;
          L1535 : do {
            if (!$cmp1420) {
              var $mul16 = $y_023 * $picWidth & -1;
              var $x_021 = $rem;
              while (1) {
                var $x_021;
                HEAP32[$map + ($x_021 + $mul16 << 2) >> 2] = $dec26;
                var $inc19 = $x_021 + 1 | 0;
                if ($inc19 >>> 0 > $rem9 >>> 0) {
                  break L1535;
                } else {
                  var $x_021 = $inc19;
                }
              }
            }
          } while (0);
          var $inc22 = $y_023 + 1 | 0;
          if ($inc22 >>> 0 > $div7 >>> 0) {
            break L1531;
          } else {
            var $y_023 = $inc22;
          }
        }
      }
    } while (0);
    if (($dec26 | 0) == 0) {
      break;
    } else {
      var $dec26 = $dec26 - 1 | 0;
    }
  }
  return;
}
function _DecodeBoxOutMap($map, $sliceGroupChangeDirectionFlag, $unitsInSliceGroup0, $picWidth, $picHeight) {
  var $mul = $picHeight * $picWidth & -1;
  L1543 : do {
    if (($mul | 0) != 0) {
      var $i_064 = 0;
      while (1) {
        var $i_064;
        HEAP32[$map + ($i_064 << 2) >> 2] = 1;
        var $inc = $i_064 + 1 | 0;
        if (($inc | 0) == ($mul | 0)) {
          break L1543;
        } else {
          var $i_064 = $inc;
        }
      }
    }
  } while (0);
  var $shr = ($picWidth - $sliceGroupChangeDirectionFlag | 0) >>> 1;
  var $shr2 = ($picHeight - $sliceGroupChangeDirectionFlag | 0) >>> 1;
  if (($unitsInSliceGroup0 | 0) == 0) {
    return;
  }
  var $mul20 = $sliceGroupChangeDirectionFlag << 1;
  var $sub21 = $mul20 - 1 | 0;
  var $sub27 = $picWidth - 1 | 0;
  var $sub36 = 1 - $mul20 | 0;
  var $sub57 = $picHeight - 1 | 0;
  var $k_054 = 0;
  var $x_055 = $shr;
  var $y_056 = $shr2;
  var $xDir_057 = $sliceGroupChangeDirectionFlag - 1 | 0;
  var $yDir_058 = $sliceGroupChangeDirectionFlag;
  var $leftBound_059 = $shr;
  var $topBound_060 = $shr2;
  var $rightBound_061 = $shr;
  var $bottomBound_062 = $shr2;
  while (1) {
    var $bottomBound_062;
    var $rightBound_061;
    var $topBound_060;
    var $leftBound_059;
    var $yDir_058;
    var $xDir_057;
    var $y_056;
    var $x_055;
    var $k_054;
    var $arrayidx8 = (($y_056 * $picWidth & -1) + $x_055 << 2) + $map | 0;
    var $cmp9 = (HEAP32[$arrayidx8 >> 2] | 0) == 1;
    var $cond = $cmp9 & 1;
    if ($cmp9) {
      HEAP32[$arrayidx8 >> 2] = 0;
    }
    do {
      if (($xDir_057 | 0) == -1 & ($x_055 | 0) == ($leftBound_059 | 0)) {
        var $sub16 = $leftBound_059 - 1 | 0;
        var $sub16_ = ($sub16 | 0) > 0 ? $sub16 : 0;
        var $bottomBound_1 = $bottomBound_062;
        var $rightBound_1 = $rightBound_061;
        var $topBound_1 = $topBound_060;
        var $leftBound_1 = $sub16_;
        var $yDir_1 = $sub21;
        var $xDir_1 = 0;
        var $y_1 = $y_056;
        var $x_1 = $sub16_;
      } else {
        if (($xDir_057 | 0) == 1 & ($x_055 | 0) == ($rightBound_061 | 0)) {
          var $add26 = $rightBound_061 + 1 | 0;
          var $add26_sub27 = ($add26 | 0) < ($sub27 | 0) ? $add26 : $sub27;
          var $bottomBound_1 = $bottomBound_062;
          var $rightBound_1 = $add26_sub27;
          var $topBound_1 = $topBound_060;
          var $leftBound_1 = $leftBound_059;
          var $yDir_1 = $sub36;
          var $xDir_1 = 0;
          var $y_1 = $y_056;
          var $x_1 = $add26_sub27;
          break;
        }
        if (($yDir_058 | 0) == -1 & ($y_056 | 0) == ($topBound_060 | 0)) {
          var $sub42 = $topBound_060 - 1 | 0;
          var $sub42_ = ($sub42 | 0) > 0 ? $sub42 : 0;
          var $bottomBound_1 = $bottomBound_062;
          var $rightBound_1 = $rightBound_061;
          var $topBound_1 = $sub42_;
          var $leftBound_1 = $leftBound_059;
          var $yDir_1 = 0;
          var $xDir_1 = $sub36;
          var $y_1 = $sub42_;
          var $x_1 = $x_055;
          break;
        }
        if (($yDir_058 | 0) == 1 & ($y_056 | 0) == ($bottomBound_062 | 0)) {
          var $add56 = $bottomBound_062 + 1 | 0;
          var $add56_sub57 = ($add56 | 0) < ($sub57 | 0) ? $add56 : $sub57;
          var $bottomBound_1 = $add56_sub57;
          var $rightBound_1 = $rightBound_061;
          var $topBound_1 = $topBound_060;
          var $leftBound_1 = $leftBound_059;
          var $yDir_1 = 0;
          var $xDir_1 = $sub21;
          var $y_1 = $add56_sub57;
          var $x_1 = $x_055;
          break;
        } else {
          var $bottomBound_1 = $bottomBound_062;
          var $rightBound_1 = $rightBound_061;
          var $topBound_1 = $topBound_060;
          var $leftBound_1 = $leftBound_059;
          var $yDir_1 = $yDir_058;
          var $xDir_1 = $xDir_057;
          var $y_1 = $yDir_058 + $y_056 | 0;
          var $x_1 = $xDir_057 + $x_055 | 0;
          break;
        }
      }
    } while (0);
    var $x_1;
    var $y_1;
    var $xDir_1;
    var $yDir_1;
    var $leftBound_1;
    var $topBound_1;
    var $rightBound_1;
    var $bottomBound_1;
    var $add77 = $cond + $k_054 | 0;
    if ($add77 >>> 0 < $unitsInSliceGroup0 >>> 0) {
      var $k_054 = $add77;
      var $x_055 = $x_1;
      var $y_056 = $y_1;
      var $xDir_057 = $xDir_1;
      var $yDir_058 = $yDir_1;
      var $leftBound_059 = $leftBound_1;
      var $topBound_060 = $topBound_1;
      var $rightBound_061 = $rightBound_1;
      var $bottomBound_062 = $bottomBound_1;
    } else {
      break;
    }
  }
  return;
}
_DecodeBoxOutMap["X"] = 1;
function _DecodeRasterScanMap($map, $sliceGroupChangeDirectionFlag, $sizeOfUpperLeftGroup, $picSize) {
  if (($picSize | 0) == 0) {
    return;
  }
  var $sub = 1 - $sliceGroupChangeDirectionFlag | 0;
  var $i_07 = 0;
  while (1) {
    var $i_07;
    HEAP32[$map + ($i_07 << 2) >> 2] = $i_07 >>> 0 < $sizeOfUpperLeftGroup >>> 0 ? $sliceGroupChangeDirectionFlag : $sub;
    var $inc = $i_07 + 1 | 0;
    if (($inc | 0) == ($picSize | 0)) {
      break;
    } else {
      var $i_07 = $inc;
    }
  }
  return;
}
function _DecodeWipeMap($map, $sliceGroupChangeDirectionFlag, $sizeOfUpperLeftGroup, $picWidth, $picHeight) {
  if (($picWidth | 0) == 0) {
    return;
  }
  var $cmp210 = ($picHeight | 0) == 0;
  var $sub = 1 - $sliceGroupChangeDirectionFlag | 0;
  var $j_014 = 0;
  var $k_015 = 0;
  while (1) {
    var $k_015;
    var $j_014;
    if ($cmp210) {
      var $k_1_lcssa = $k_015;
    } else {
      var $i_011 = 0;
      var $k_112 = $k_015;
      while (1) {
        var $k_112;
        var $i_011;
        HEAP32[$map + (($i_011 * $picWidth & -1) + $j_014 << 2) >> 2] = $k_112 >>> 0 < $sizeOfUpperLeftGroup >>> 0 ? $sliceGroupChangeDirectionFlag : $sub;
        var $inc8 = $i_011 + 1 | 0;
        if (($inc8 | 0) == ($picHeight | 0)) {
          break;
        } else {
          var $i_011 = $inc8;
          var $k_112 = $k_112 + 1 | 0;
        }
      }
      var $k_1_lcssa = $k_015 + $picHeight | 0;
    }
    var $k_1_lcssa;
    var $inc10 = $j_014 + 1 | 0;
    if (($inc10 | 0) == ($picWidth | 0)) {
      break;
    } else {
      var $j_014 = $inc10;
      var $k_015 = $k_1_lcssa;
    }
  }
  return;
}
function _h264bsdGetNeighbourPels($image, $above, $left, $mbNum) {
  if (($mbNum | 0) == 0) {
    return;
  }
  var $0 = HEAP32[$image + 4 >> 2];
  var $mul = HEAP32[$image + 8 >> 2] * $0 & -1;
  var $div = Math.floor(($mbNum >>> 0) / ($0 >>> 0));
  var $mul4 = $div * $0 & -1;
  var $sub = $mbNum - $mul4 | 0;
  var $mul5 = $0 << 4;
  var $data = $image | 0;
  var $2 = HEAP32[$data >> 2];
  var $add_ptr_sum = ($sub << 4) + (($0 << 8) * $div & -1) | 0;
  var $tobool10 = ($div | 0) != 0;
  if ($tobool10) {
    var $add_ptr9_sum52 = $add_ptr_sum - ($mul5 | 1) | 0;
    HEAP8[$above] = HEAP8[$2 + $add_ptr9_sum52 | 0];
    HEAP8[$above + 1 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 1) | 0];
    HEAP8[$above + 2 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 2) | 0];
    HEAP8[$above + 3 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 3) | 0];
    HEAP8[$above + 4 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 4) | 0];
    HEAP8[$above + 5 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 5) | 0];
    HEAP8[$above + 6 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 6) | 0];
    HEAP8[$above + 7 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 7) | 0];
    HEAP8[$above + 8 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 8) | 0];
    HEAP8[$above + 9 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 9) | 0];
    HEAP8[$above + 10 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 10) | 0];
    HEAP8[$above + 11 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 11) | 0];
    HEAP8[$above + 12 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 12) | 0];
    HEAP8[$above + 13 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 13) | 0];
    HEAP8[$above + 14 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 14) | 0];
    HEAP8[$above + 15 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 15) | 0];
    HEAP8[$above + 16 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 16) | 0];
    HEAP8[$above + 17 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 17) | 0];
    HEAP8[$above + 18 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 18) | 0];
    HEAP8[$above + 19 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 19) | 0];
    HEAP8[$above + 20 | 0] = HEAP8[$add_ptr9_sum52 + ($2 + 20) | 0];
    var $above_addr_1 = $above + 21 | 0;
  } else {
    var $above_addr_1 = $above;
  }
  var $above_addr_1;
  var $tobool16 = ($mul4 | 0) != ($mbNum | 0);
  if ($tobool16) {
    var $add_ptr9_sum = $add_ptr_sum - 1 | 0;
    HEAP8[$left] = HEAP8[$2 + $add_ptr9_sum | 0];
    var $incdec_ptr18_sum = $add_ptr9_sum + $mul5 | 0;
    HEAP8[$left + 1 | 0] = HEAP8[$2 + $incdec_ptr18_sum | 0];
    var $add_ptr24_sum = $incdec_ptr18_sum + $mul5 | 0;
    HEAP8[$left + 2 | 0] = HEAP8[$2 + $add_ptr24_sum | 0];
    var $add_ptr24_1_sum = $add_ptr24_sum + $mul5 | 0;
    HEAP8[$left + 3 | 0] = HEAP8[$2 + $add_ptr24_1_sum | 0];
    var $add_ptr24_2_sum = $add_ptr24_1_sum + $mul5 | 0;
    HEAP8[$left + 4 | 0] = HEAP8[$2 + $add_ptr24_2_sum | 0];
    var $add_ptr24_3_sum = $add_ptr24_2_sum + $mul5 | 0;
    HEAP8[$left + 5 | 0] = HEAP8[$2 + $add_ptr24_3_sum | 0];
    var $add_ptr24_4_sum = $add_ptr24_3_sum + $mul5 | 0;
    HEAP8[$left + 6 | 0] = HEAP8[$2 + $add_ptr24_4_sum | 0];
    var $add_ptr24_5_sum = $add_ptr24_4_sum + $mul5 | 0;
    HEAP8[$left + 7 | 0] = HEAP8[$2 + $add_ptr24_5_sum | 0];
    var $add_ptr24_6_sum = $add_ptr24_5_sum + $mul5 | 0;
    HEAP8[$left + 8 | 0] = HEAP8[$2 + $add_ptr24_6_sum | 0];
    var $add_ptr24_7_sum = $add_ptr24_6_sum + $mul5 | 0;
    HEAP8[$left + 9 | 0] = HEAP8[$2 + $add_ptr24_7_sum | 0];
    var $add_ptr24_8_sum = $add_ptr24_7_sum + $mul5 | 0;
    HEAP8[$left + 10 | 0] = HEAP8[$2 + $add_ptr24_8_sum | 0];
    var $add_ptr24_9_sum = $add_ptr24_8_sum + $mul5 | 0;
    HEAP8[$left + 11 | 0] = HEAP8[$2 + $add_ptr24_9_sum | 0];
    var $add_ptr24_10_sum = $add_ptr24_9_sum + $mul5 | 0;
    HEAP8[$left + 12 | 0] = HEAP8[$2 + $add_ptr24_10_sum | 0];
    var $add_ptr24_11_sum = $add_ptr24_10_sum + $mul5 | 0;
    HEAP8[$left + 13 | 0] = HEAP8[$2 + $add_ptr24_11_sum | 0];
    var $add_ptr24_12_sum = $add_ptr24_11_sum + $mul5 | 0;
    HEAP8[$left + 14 | 0] = HEAP8[$2 + $add_ptr24_12_sum | 0];
    HEAP8[$left + 15 | 0] = HEAP8[$2 + $add_ptr24_12_sum + $mul5 | 0];
    var $left_addr_1 = $left + 16 | 0;
  } else {
    var $left_addr_1 = $left;
  }
  var $left_addr_1;
  var $shr = $0 << 3 & 2147483640;
  var $41 = HEAP32[$data >> 2];
  var $mul28 = $mul << 8;
  var $mul30 = $div << 3;
  var $mul33 = $sub << 3;
  var $add_ptr32_sum = ($mul30 * $shr & -1) + $mul28 + $mul33 | 0;
  if ($tobool10) {
    var $add_ptr34_sum50 = $add_ptr32_sum - ($shr | 1) | 0;
    var $46 = (($mul30 - 1) * $shr & -1) + $mul28 + $mul33 | 7;
    HEAP8[$above_addr_1] = HEAP8[$41 + $add_ptr34_sum50 | 0];
    HEAP8[$above_addr_1 + 1 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 1) | 0];
    HEAP8[$above_addr_1 + 2 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 2) | 0];
    HEAP8[$above_addr_1 + 3 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 3) | 0];
    HEAP8[$above_addr_1 + 4 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 4) | 0];
    HEAP8[$above_addr_1 + 5 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 5) | 0];
    HEAP8[$above_addr_1 + 6 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 6) | 0];
    HEAP8[$above_addr_1 + 7 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 7) | 0];
    HEAP8[$above_addr_1 + 8 | 0] = HEAP8[$add_ptr34_sum50 + ($41 + 8) | 0];
    var $mul47 = $mul << 6;
    var $scevgep74_sum = $46 + ($mul47 - 8) | 0;
    HEAP8[$above_addr_1 + 9 | 0] = HEAP8[$41 + $scevgep74_sum | 0];
    HEAP8[$above_addr_1 + 10 | 0] = HEAP8[$scevgep74_sum + ($41 + 1) | 0];
    HEAP8[$above_addr_1 + 11 | 0] = HEAP8[$scevgep74_sum + ($41 + 2) | 0];
    HEAP8[$above_addr_1 + 12 | 0] = HEAP8[$scevgep74_sum + ($41 + 3) | 0];
    HEAP8[$above_addr_1 + 13 | 0] = HEAP8[$scevgep74_sum + ($41 + 4) | 0];
    HEAP8[$above_addr_1 + 14 | 0] = HEAP8[$scevgep74_sum + ($41 + 5) | 0];
    HEAP8[$above_addr_1 + 15 | 0] = HEAP8[$scevgep74_sum + ($41 + 6) | 0];
    HEAP8[$above_addr_1 + 16 | 0] = HEAP8[$scevgep74_sum + ($41 + 7) | 0];
    HEAP8[$above_addr_1 + 17 | 0] = HEAP8[$41 + $46 + $mul47 | 0];
  }
  if (!$tobool16) {
    return;
  }
  var $add_ptr34_sum = $add_ptr32_sum - 1 | 0;
  HEAP8[$left_addr_1] = HEAP8[$41 + $add_ptr34_sum | 0];
  var $incdec_ptr60_sum = $add_ptr34_sum + $shr | 0;
  HEAP8[$left_addr_1 + 1 | 0] = HEAP8[$41 + $incdec_ptr60_sum | 0];
  var $add_ptr67_sum77 = $incdec_ptr60_sum + $shr | 0;
  HEAP8[$left_addr_1 + 2 | 0] = HEAP8[$41 + $add_ptr67_sum77 | 0];
  var $add_ptr67_1_sum = $add_ptr67_sum77 + $shr | 0;
  HEAP8[$left_addr_1 + 3 | 0] = HEAP8[$41 + $add_ptr67_1_sum | 0];
  var $add_ptr67_2_sum = $add_ptr67_1_sum + $shr | 0;
  HEAP8[$left_addr_1 + 4 | 0] = HEAP8[$41 + $add_ptr67_2_sum | 0];
  var $add_ptr67_3_sum = $add_ptr67_2_sum + $shr | 0;
  HEAP8[$left_addr_1 + 5 | 0] = HEAP8[$41 + $add_ptr67_3_sum | 0];
  var $add_ptr67_4_sum = $add_ptr67_3_sum + $shr | 0;
  HEAP8[$left_addr_1 + 6 | 0] = HEAP8[$41 + $add_ptr67_4_sum | 0];
  HEAP8[$left_addr_1 + 7 | 0] = HEAP8[$41 + $add_ptr67_4_sum + $shr | 0];
  var $scevgep71_sum = (($mul30 | 7) * $shr & -1) + $mul28 + $mul33 - 1 + $shr + (($mul << 6) - ($0 << 6)) | 0;
  HEAP8[$left_addr_1 + 8 | 0] = HEAP8[$41 + $scevgep71_sum | 0];
  var $add_ptr72_sum = $scevgep71_sum + $shr | 0;
  HEAP8[$left_addr_1 + 9 | 0] = HEAP8[$41 + $add_ptr72_sum | 0];
  var $add_ptr79_sum = $add_ptr72_sum + $shr | 0;
  HEAP8[$left_addr_1 + 10 | 0] = HEAP8[$41 + $add_ptr79_sum | 0];
  var $add_ptr79_1_sum = $add_ptr79_sum + $shr | 0;
  HEAP8[$left_addr_1 + 11 | 0] = HEAP8[$41 + $add_ptr79_1_sum | 0];
  var $add_ptr79_2_sum = $add_ptr79_1_sum + $shr | 0;
  HEAP8[$left_addr_1 + 12 | 0] = HEAP8[$41 + $add_ptr79_2_sum | 0];
  var $add_ptr79_3_sum = $add_ptr79_2_sum + $shr | 0;
  HEAP8[$left_addr_1 + 13 | 0] = HEAP8[$41 + $add_ptr79_3_sum | 0];
  var $add_ptr79_4_sum = $add_ptr79_3_sum + $shr | 0;
  HEAP8[$left_addr_1 + 14 | 0] = HEAP8[$41 + $add_ptr79_4_sum | 0];
  HEAP8[$left_addr_1 + 15 | 0] = HEAP8[$41 + $add_ptr79_4_sum + $shr | 0];
  return;
}
_h264bsdGetNeighbourPels["X"] = 1;
function _h264bsdDecodeSliceGroupMap($map, $pps, $sliceGroupChangeCycle, $picWidth, $picHeight) {
  var $pps$s2 = $pps >> 2;
  var $mul = $picHeight * $picWidth & -1;
  var $0 = HEAP32[$pps$s2 + 3];
  if (($0 | 0) == 1) {
    _H264SwDecMemset($map, 0, $mul << 2);
    return;
  }
  var $2 = HEAP32[$pps$s2 + 4];
  do {
    if (($2 - 3 | 0) >>> 0 < 3) {
      var $mul6 = HEAP32[$pps$s2 + 9] * $sliceGroupChangeCycle & -1;
      var $mul6_mul = $mul6 >>> 0 < $mul >>> 0 ? $mul6 : $mul;
      var $5 = HEAP32[$pps$s2 + 8];
      if (($2 - 4 | 0) >>> 0 < 2) {
        var $sizeOfUpperLeftGroup_0 = ($5 | 0) == 0 ? $mul6_mul : $mul - $mul6_mul | 0;
        break;
      }
      _DecodeBoxOutMap($map, $5, $mul6_mul, $picWidth, $picHeight);
      return;
    } else {
      var $sizeOfUpperLeftGroup_0 = 0;
    }
  } while (0);
  var $sizeOfUpperLeftGroup_0;
  if (($2 | 0) == 5) {
    _DecodeWipeMap($map, HEAP32[$pps$s2 + 8], $sizeOfUpperLeftGroup_0, $picWidth, $picHeight);
    return;
  } else if (($2 | 0) == 1) {
    _DecodeDispersedMap($map, $0, $picWidth, $picHeight);
    return;
  } else if (($2 | 0) == 0) {
    _DecodeInterleavedMap($map, $0, HEAP32[$pps$s2 + 5], $mul);
    return;
  } else if (($2 | 0) == 4) {
    _DecodeRasterScanMap($map, HEAP32[$pps$s2 + 8], $sizeOfUpperLeftGroup_0, $mul);
    return;
  } else if (($2 | 0) == 2) {
    _DecodeForegroundLeftOverMap($map, $0, HEAP32[$pps$s2 + 6], HEAP32[$pps$s2 + 7], $picWidth, $picHeight);
    return;
  } else {
    if (($mul | 0) == 0) {
      return;
    }
    var $sliceGroupId = $pps + 44 | 0;
    var $i_049 = 0;
    while (1) {
      var $i_049;
      HEAP32[$map + ($i_049 << 2) >> 2] = HEAP32[HEAP32[$sliceGroupId >> 2] + ($i_049 << 2) >> 2];
      var $inc = $i_049 + 1 | 0;
      if (($inc | 0) == ($mul | 0)) {
        break;
      } else {
        var $i_049 = $inc;
      }
    }
    return;
  }
}
_h264bsdDecodeSliceGroupMap["X"] = 1;
function _h264bsdIntraPrediction($pMb, $mbLayer, $image, $mbNum, $constrainedIntraPred, $data) {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 72 | 0;
  var $pelAbove = __stackBase__;
  var $pelLeft = __stackBase__ + 40;
  var $arraydecay = $pelAbove | 0;
  var $arraydecay1 = $pelLeft | 0;
  _h264bsdGetNeighbourPels($image, $arraydecay, $arraydecay1, $mbNum);
  do {
    if ((_h264bsdMbPartPredMode(HEAP32[$pMb >> 2]) | 0) == 1) {
      var $call5 = _h264bsdIntra16x16Prediction($pMb, $data, $mbLayer + 328 | 0, $arraydecay, $arraydecay1, $constrainedIntraPred);
      if (($call5 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call5;
      }
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    } else {
      var $call10 = _h264bsdIntra4x4Prediction($pMb, $data, $mbLayer, $arraydecay, $arraydecay1, $constrainedIntraPred);
      if (($call10 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call10;
      }
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
  } while (0);
  var $call23 = _h264bsdIntraChromaPrediction($pMb, $data + 256 | 0, $mbLayer + 1352 | 0, $pelAbove + 21 | 0, $pelLeft + 16 | 0, HEAP32[$mbLayer + 140 >> 2], $constrainedIntraPred);
  if (($call23 | 0) != 0) {
    var $retval_0 = $call23;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if (HEAP32[$pMb + 196 >> 2] >>> 0 > 1) {
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  _h264bsdWriteMacroblock($image, $data);
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _Intra16x16VerticalPrediction($data, $above) {
  var $arrayidx_1 = $above + 1 | 0;
  var $arrayidx_2 = $above + 2 | 0;
  var $arrayidx_3 = $above + 3 | 0;
  var $arrayidx_4 = $above + 4 | 0;
  var $arrayidx_5 = $above + 5 | 0;
  var $arrayidx_6 = $above + 6 | 0;
  var $arrayidx_7 = $above + 7 | 0;
  var $arrayidx_8 = $above + 8 | 0;
  var $arrayidx_9 = $above + 9 | 0;
  var $arrayidx_10 = $above + 10 | 0;
  var $arrayidx_11 = $above + 11 | 0;
  var $arrayidx_12 = $above + 12 | 0;
  var $arrayidx_13 = $above + 13 | 0;
  var $arrayidx_14 = $above + 14 | 0;
  var $arrayidx_15 = $above + 15 | 0;
  var $data_addr_06 = $data;
  var $i_07 = 0;
  while (1) {
    var $i_07;
    var $data_addr_06;
    HEAP8[$data_addr_06] = HEAP8[$above];
    HEAP8[$data_addr_06 + 1 | 0] = HEAP8[$arrayidx_1];
    HEAP8[$data_addr_06 + 2 | 0] = HEAP8[$arrayidx_2];
    HEAP8[$data_addr_06 + 3 | 0] = HEAP8[$arrayidx_3];
    HEAP8[$data_addr_06 + 4 | 0] = HEAP8[$arrayidx_4];
    HEAP8[$data_addr_06 + 5 | 0] = HEAP8[$arrayidx_5];
    HEAP8[$data_addr_06 + 6 | 0] = HEAP8[$arrayidx_6];
    HEAP8[$data_addr_06 + 7 | 0] = HEAP8[$arrayidx_7];
    HEAP8[$data_addr_06 + 8 | 0] = HEAP8[$arrayidx_8];
    HEAP8[$data_addr_06 + 9 | 0] = HEAP8[$arrayidx_9];
    HEAP8[$data_addr_06 + 10 | 0] = HEAP8[$arrayidx_10];
    HEAP8[$data_addr_06 + 11 | 0] = HEAP8[$arrayidx_11];
    HEAP8[$data_addr_06 + 12 | 0] = HEAP8[$arrayidx_12];
    HEAP8[$data_addr_06 + 13 | 0] = HEAP8[$arrayidx_13];
    HEAP8[$data_addr_06 + 14 | 0] = HEAP8[$arrayidx_14];
    HEAP8[$data_addr_06 + 15 | 0] = HEAP8[$arrayidx_15];
    var $inc5 = $i_07 + 1 | 0;
    if (($inc5 | 0) == 16) {
      break;
    } else {
      var $data_addr_06 = $data_addr_06 + 16 | 0;
      var $i_07 = $inc5;
    }
  }
  return;
}
_Intra16x16VerticalPrediction["X"] = 1;
function _Intra16x16HorizontalPrediction($data, $left) {
  var $data_addr_05 = $data;
  var $i_06 = 0;
  while (1) {
    var $i_06;
    var $data_addr_05;
    var $arrayidx = $left + $i_06 | 0;
    HEAP8[$data_addr_05] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 1 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 2 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 3 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 4 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 5 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 6 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 7 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 8 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 9 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 10 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 11 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 12 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 13 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 14 | 0] = HEAP8[$arrayidx];
    HEAP8[$data_addr_05 + 15 | 0] = HEAP8[$arrayidx];
    var $inc5 = $i_06 + 1 | 0;
    if (($inc5 | 0) == 16) {
      break;
    } else {
      var $data_addr_05 = $data_addr_05 + 16 | 0;
      var $i_06 = $inc5;
    }
  }
  return;
}
_Intra16x16HorizontalPrediction["X"] = 1;
function _Intra16x16PlanePrediction($data, $above, $left) {
  var $conv = HEAPU8[$above + 15 | 0];
  var $conv2 = HEAPU8[$left + 15 | 0];
  var $conv9_7 = HEAPU8[$above - 1 | 0];
  var $shr = ((($conv - $conv9_7 << 3) + (HEAPU8[$above + 11 | 0] - HEAPU8[$above + 3 | 0] << 2) + (HEAPU8[$above + 9 | 0] - HEAPU8[$above + 5 | 0] << 1) + ((HEAPU8[$above + 14 | 0] - HEAPU8[$above]) * 7 & -1) + ((HEAPU8[$above + 13 | 0] - HEAPU8[$above + 1 | 0]) * 6 & -1) + ((HEAPU8[$above + 12 | 0] - HEAPU8[$above + 2 | 0]) * 5 & -1) + ((HEAPU8[$above + 10 | 0] - HEAPU8[$above + 4 | 0]) * 3 & -1) + (HEAPU8[$above + 8 | 0] - HEAPU8[$above + 6 | 0])) * 5 & -1) + 32 >> 6;
  var $shr43 = ((($conv2 - $conv9_7 << 3) + (HEAPU8[$left + 11 | 0] - HEAPU8[$left + 3 | 0] << 2) + (HEAPU8[$left + 9 | 0] - HEAPU8[$left + 5 | 0] << 1) + ((HEAPU8[$left + 14 | 0] - HEAPU8[$left]) * 7 & -1) + ((HEAPU8[$left + 13 | 0] - HEAPU8[$left + 1 | 0]) * 6 & -1) + ((HEAPU8[$left + 12 | 0] - HEAPU8[$left + 2 | 0]) * 5 & -1) + ((HEAPU8[$left + 10 | 0] - HEAPU8[$left + 4 | 0]) * 3 & -1) + (HEAPU8[$left + 8 | 0] - HEAPU8[$left + 6 | 0])) * 5 & -1) + 32 >> 6;
  var $add54 = ($conv2 + $conv << 4) + 16 | 0;
  var $i_230 = 0;
  while (1) {
    var $i_230;
    var $add57 = $add54 + (($i_230 - 7) * $shr43 & -1) | 0;
    var $mul69 = $i_230 << 4;
    var $j_029 = 0;
    while (1) {
      var $j_029;
      var $shr59 = $add57 + (($j_029 - 7) * $shr & -1) >> 5;
      if (($shr59 | 0) < 0) {
        var $cond67 = 0;
      } else {
        var $cond67 = ($shr59 | 0) > 255 ? -1 : $shr59 & 255;
      }
      var $cond67;
      HEAP8[$data + $j_029 + $mul69 | 0] = $cond67;
      var $inc73 = $j_029 + 1 | 0;
      if (($inc73 | 0) == 16) {
        break;
      } else {
        var $j_029 = $inc73;
      }
    }
    var $inc76 = $i_230 + 1 | 0;
    if (($inc76 | 0) == 16) {
      break;
    } else {
      var $i_230 = $inc76;
    }
  }
  return;
}
_Intra16x16PlanePrediction["X"] = 1;
function _h264bsdIntra16x16Prediction($pMb, $data, $residual, $above, $left, $constrainedIntraPred) {
  var $0 = HEAP32[$pMb + 200 >> 2];
  var $call = _h264bsdIsNeighbourAvailable($pMb, $0);
  var $tobool1 = ($constrainedIntraPred | 0) == 0;
  if (($call | 0) == 0 | $tobool1) {
    var $availableA_0 = $call;
  } else {
    var $availableA_0 = (_h264bsdMbPartPredMode(HEAP32[$0 >> 2]) | 0) == 2 ? 0 : $call;
  }
  var $availableA_0;
  var $2 = HEAP32[$pMb + 204 >> 2];
  var $call5 = _h264bsdIsNeighbourAvailable($pMb, $2);
  if (($call5 | 0) == 0 | $tobool1) {
    var $availableB_0 = $call5;
  } else {
    var $availableB_0 = (_h264bsdMbPartPredMode(HEAP32[$2 >> 2]) | 0) == 2 ? 0 : $call5;
  }
  var $availableB_0;
  var $4 = HEAP32[$pMb + 212 >> 2];
  var $call16 = _h264bsdIsNeighbourAvailable($pMb, $4);
  if (($call16 | 0) == 0 | $tobool1) {
    var $availableD_0 = $call16;
  } else {
    var $availableD_0 = (_h264bsdMbPartPredMode(HEAP32[$4 >> 2]) | 0) == 2 ? 0 : $call16;
  }
  var $availableD_0;
  var $call28 = _h264bsdPredModeIntra16x16(HEAP32[$pMb >> 2]);
  do {
    if (($call28 | 0) == 0) {
      if (($availableB_0 | 0) == 0) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        _Intra16x16VerticalPrediction($data, $above + 1 | 0);
        break;
      }
    } else if (($call28 | 0) == 1) {
      if (($availableA_0 | 0) == 0) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        _Intra16x16HorizontalPrediction($data, $left);
        break;
      }
    } else if (($call28 | 0) == 2) {
      _Intra16x16DcPrediction($data, $above + 1 | 0, $left, $availableA_0, $availableB_0);
    } else {
      if (($availableA_0 | 0) == 0 | ($availableB_0 | 0) == 0 | ($availableD_0 | 0) == 0) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        _Intra16x16PlanePrediction($data, $above + 1 | 0, $left);
        break;
      }
    }
  } while (0);
  _h264bsdAddResidual($data, $residual | 0, 0);
  _h264bsdAddResidual($data, $residual + 64 | 0, 1);
  _h264bsdAddResidual($data, $residual + 128 | 0, 2);
  _h264bsdAddResidual($data, $residual + 192 | 0, 3);
  _h264bsdAddResidual($data, $residual + 256 | 0, 4);
  _h264bsdAddResidual($data, $residual + 320 | 0, 5);
  _h264bsdAddResidual($data, $residual + 384 | 0, 6);
  _h264bsdAddResidual($data, $residual + 448 | 0, 7);
  _h264bsdAddResidual($data, $residual + 512 | 0, 8);
  _h264bsdAddResidual($data, $residual + 576 | 0, 9);
  _h264bsdAddResidual($data, $residual + 640 | 0, 10);
  _h264bsdAddResidual($data, $residual + 704 | 0, 11);
  _h264bsdAddResidual($data, $residual + 768 | 0, 12);
  _h264bsdAddResidual($data, $residual + 832 | 0, 13);
  _h264bsdAddResidual($data, $residual + 896 | 0, 14);
  _h264bsdAddResidual($data, $residual + 960 | 0, 15);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdIntra16x16Prediction["X"] = 1;
function _h264bsdIntra4x4Prediction($pMb, $data, $mbLayer, $above, $left, $constrainedIntraPred) {
  var $st$3$0$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 36 | 0;
  var $a = __stackBase__;
  var $l = __stackBase__ + 12;
  var $tobool3 = ($constrainedIntraPred | 0) == 0;
  var $arraydecay = $a | 0;
  var $arraydecay51 = $l | 0;
  var $0 = __stackBase__ + 20;
  var $add_ptr143 = $l + 1 | 0;
  var $add_ptr = $a + 1 | 0;
  var $arrayidx76 = $a + 4 | 0;
  var $arrayidx80 = $a + 5 | 0;
  var $block_066 = 0;
  while (1) {
    var $block_066;
    var $1 = _h264bsdNeighbour4x4BlockA($block_066);
    var $st$3$0 = $1 | 0, $st$3$0$s2 = $st$3$0 >> 2;
    var $st$3$1 = $1 + 4 | 0;
    var $neighbour_sroa_1_4_extract_trunc6 = HEAP32[$st$3$1 >> 2] & 255;
    var $call1 = _h264bsdGetNeighbourMb($pMb, HEAP32[$st$3$0$s2]);
    var $call2 = _h264bsdIsNeighbourAvailable($pMb, $call1);
    if (($call2 | 0) == 0 | $tobool3) {
      var $availableA_0 = $call2;
    } else {
      var $availableA_0 = (_h264bsdMbPartPredMode(HEAP32[$call1 >> 2]) | 0) == 2 ? 0 : $call2;
    }
    var $availableA_0;
    var $4 = _h264bsdNeighbour4x4BlockB($block_066);
    var $st$3$0 = $4 | 0, $st$3$0$s2 = $st$3$0 >> 2;
    var $st$3$1 = $4 + 4 | 0;
    var $neighbourB_sroa_1_4_extract_trunc = HEAP32[$st$3$1 >> 2] & 255;
    var $call9 = _h264bsdGetNeighbourMb($pMb, HEAP32[$st$3$0$s2]);
    var $call10 = _h264bsdIsNeighbourAvailable($pMb, $call9);
    if (($call10 | 0) == 0 | $tobool3) {
      var $availableB_0 = $call10;
    } else {
      var $availableB_0 = (_h264bsdMbPartPredMode(HEAP32[$call9 >> 2]) | 0) == 2 ? 0 : $call10;
    }
    var $availableB_0;
    var $tobool20 = ($availableA_0 | 0) != 0;
    var $call22 = _DetermineIntra4x4PredMode($mbLayer, $tobool20 & ($availableB_0 | 0) != 0 & 1, $neighbour_sroa_1_4_extract_trunc6, $neighbourB_sroa_1_4_extract_trunc, $block_066, $call1, $call9);
    HEAP8[$pMb + ($block_066 + 82) | 0] = $call22 & 255;
    var $call25 = _h264bsdGetNeighbourMb($pMb, HEAP32[_h264bsdNeighbour4x4BlockC($block_066) >> 2]);
    var $call26 = _h264bsdIsNeighbourAvailable($pMb, $call25);
    if (($call26 | 0) == 0 | $tobool3) {
      var $availableC_0 = $call26;
    } else {
      var $availableC_0 = (_h264bsdMbPartPredMode(HEAP32[$call25 >> 2]) | 0) == 2 ? 0 : $call26;
    }
    var $availableC_0;
    var $11 = _h264bsdNeighbour4x4BlockD($block_066);
    var $st$3$0 = $11 | 0, $st$3$0$s2 = $st$3$0 >> 2;
    var $st$3$1 = $11 + 4 | 0;
    var $call39 = _h264bsdGetNeighbourMb($pMb, HEAP32[$st$3$0$s2]);
    var $call40 = _h264bsdIsNeighbourAvailable($pMb, $call39);
    if (($call40 | 0) == 0 | $tobool3) {
      var $availableD_0 = $call40;
    } else {
      var $availableD_0 = (_h264bsdMbPartPredMode(HEAP32[$call39 >> 2]) | 0) == 2 ? 0 : $call40;
    }
    var $availableD_0;
    _Get4x4NeighbourPels($arraydecay, $arraydecay51, $data, $above, $left, $block_066);
    if (($call22 | 0) == 3) {
      if (($availableB_0 | 0) == 0) {
        var $retval_0 = 1;
        label = 1351;
        break;
      }
      if (($availableC_0 | 0) == 0) {
        _memset($arrayidx80, HEAP8[$arrayidx76], 4);
      }
      _Intra4x4DiagonalDownLeftPrediction($0, $add_ptr);
    } else if (($call22 | 0) == 1) {
      if (!$tobool20) {
        var $retval_0 = 1;
        label = 1352;
        break;
      }
      _Intra4x4HorizontalPrediction($0, $add_ptr143);
    } else if (($call22 | 0) == 2) {
      _Intra4x4DcPrediction($0, $add_ptr, $add_ptr143, $availableA_0, $availableB_0);
    } else if (($call22 | 0) == 7) {
      if (($availableB_0 | 0) == 0) {
        var $retval_0 = 1;
        label = 1353;
        break;
      }
      if (($availableC_0 | 0) == 0) {
        _memset($arrayidx80, HEAP8[$arrayidx76], 4);
      }
      _Intra4x4VerticalLeftPrediction($0, $add_ptr);
    } else if (($call22 | 0) == 4) {
      if (($availableB_0 | 0) == 0 | $tobool20 ^ 1 | ($availableD_0 | 0) == 0) {
        var $retval_0 = 1;
        label = 1355;
        break;
      }
      _Intra4x4DiagonalDownRightPrediction($0, $add_ptr, $add_ptr143);
    } else if (($call22 | 0) == 5) {
      if (($availableB_0 | 0) == 0 | $tobool20 ^ 1 | ($availableD_0 | 0) == 0) {
        var $retval_0 = 1;
        label = 1357;
        break;
      }
      _Intra4x4VerticalRightPrediction($0, $add_ptr, $add_ptr143);
    } else if (($call22 | 0) == 6) {
      if (($availableB_0 | 0) == 0 | $tobool20 ^ 1 | ($availableD_0 | 0) == 0) {
        var $retval_0 = 1;
        label = 1358;
        break;
      }
      _Intra4x4HorizontalDownPrediction($0, $add_ptr, $add_ptr143);
    } else if (($call22 | 0) == 0) {
      if (($availableB_0 | 0) == 0) {
        var $retval_0 = 1;
        label = 1359;
        break;
      }
      _Intra4x4VerticalPrediction($0, $add_ptr);
    } else {
      if (!$tobool20) {
        var $retval_0 = 1;
        label = 1356;
        break;
      }
      _Intra4x4HorizontalUpPrediction($0, $add_ptr143);
    }
    _Write4x4To16x16($data, $0, $block_066);
    _h264bsdAddResidual($data, ($block_066 << 6) + $mbLayer + 328 | 0, $block_066);
    var $inc = $block_066 + 1 | 0;
    if ($inc >>> 0 < 16) {
      var $block_066 = $inc;
    } else {
      var $retval_0 = 0;
      label = 1354;
      break;
    }
  }
  if (label == 1351) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1354) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1355) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1356) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1357) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1352) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1353) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1358) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (label == 1359) {
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
}
_h264bsdIntra4x4Prediction["X"] = 1;
function _h264bsdIntraChromaPrediction($pMb, $data, $residual, $above, $left, $predMode, $constrainedIntraPred) {
  var label = 0;
  var $0 = HEAP32[$pMb + 200 >> 2];
  var $call = _h264bsdIsNeighbourAvailable($pMb, $0);
  var $tobool1 = ($constrainedIntraPred | 0) == 0;
  if (($call | 0) == 0 | $tobool1) {
    var $availableA_0 = $call;
  } else {
    var $availableA_0 = (_h264bsdMbPartPredMode(HEAP32[$0 >> 2]) | 0) == 2 ? 0 : $call;
  }
  var $availableA_0;
  var $2 = HEAP32[$pMb + 204 >> 2];
  var $call5 = _h264bsdIsNeighbourAvailable($pMb, $2);
  if (($call5 | 0) == 0 | $tobool1) {
    var $availableB_0 = $call5;
  } else {
    var $availableB_0 = (_h264bsdMbPartPredMode(HEAP32[$2 >> 2]) | 0) == 2 ? 0 : $call5;
  }
  var $availableB_0;
  var $4 = HEAP32[$pMb + 212 >> 2];
  var $call16 = _h264bsdIsNeighbourAvailable($pMb, $4);
  if (($call16 | 0) == 0 | $tobool1) {
    var $availableD_0 = $call16;
  } else {
    var $availableD_0 = (_h264bsdMbPartPredMode(HEAP32[$4 >> 2]) | 0) == 2 ? 0 : $call16;
  }
  var $availableD_0;
  var $tobool37 = ($availableA_0 | 0) == 0;
  var $tobool38 = ($availableB_0 | 0) == 0;
  var $or_cond36 = $tobool37 | $tobool38 | ($availableD_0 | 0) == 0;
  var $residual_addr_039 = $residual;
  var $above_addr_040 = $above;
  var $left_addr_041 = $left;
  var $data_addr_042 = $data;
  var $comp_043 = 0;
  var $block_044 = 16;
  while (1) {
    var $block_044;
    var $comp_043;
    var $data_addr_042;
    var $left_addr_041;
    var $above_addr_040;
    var $residual_addr_039;
    if (($predMode | 0) == 2) {
      if ($tobool38) {
        var $retval_0 = 1;
        label = 1378;
        break;
      }
      _IntraChromaVerticalPrediction($data_addr_042, $above_addr_040 + 1 | 0);
    } else if (($predMode | 0) == 1) {
      if ($tobool37) {
        var $retval_0 = 1;
        label = 1379;
        break;
      }
      _IntraChromaHorizontalPrediction($data_addr_042, $left_addr_041);
    } else if (($predMode | 0) == 0) {
      _IntraChromaDcPrediction($data_addr_042, $above_addr_040 + 1 | 0, $left_addr_041, $availableA_0, $availableB_0);
    } else {
      if ($or_cond36) {
        var $retval_0 = 1;
        label = 1377;
        break;
      }
      _IntraChromaPlanePrediction($data_addr_042, $above_addr_040 + 1 | 0, $left_addr_041);
    }
    _h264bsdAddResidual($data_addr_042, $residual_addr_039 | 0, $block_044);
    var $inc4745 = $block_044 | 1;
    _h264bsdAddResidual($data_addr_042, $residual_addr_039 + 64 | 0, $inc4745);
    _h264bsdAddResidual($data_addr_042, $residual_addr_039 + 128 | 0, $inc4745 + 1 | 0);
    _h264bsdAddResidual($data_addr_042, $residual_addr_039 + 192 | 0, $block_044 | 3);
    var $inc53 = $comp_043 + 1 | 0;
    if ($inc53 >>> 0 < 2) {
      var $residual_addr_039 = $residual_addr_039 + 256 | 0;
      var $above_addr_040 = $above_addr_040 + 9 | 0;
      var $left_addr_041 = $left_addr_041 + 8 | 0;
      var $data_addr_042 = $data_addr_042 + 64 | 0;
      var $comp_043 = $inc53;
      var $block_044 = $block_044 + 4 | 0;
    } else {
      var $retval_0 = 0;
      label = 1380;
      break;
    }
  }
  if (label == 1380) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1378) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1377) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1379) {
    var $retval_0;
    return $retval_0;
  }
}
_h264bsdIntraChromaPrediction["X"] = 1;
function _Intra16x16DcPrediction($data, $above, $left, $availableA, $availableB) {
  var $tobool = ($availableA | 0) != 0;
  var $tobool1 = ($availableB | 0) == 0;
  if (!($tobool1 | $tobool ^ 1)) {
    var $i_028 = 0;
    var $tmp_029 = 0;
    while (1) {
      var $tmp_029;
      var $i_028;
      var $add4 = HEAPU8[$above + $i_028 | 0] + $tmp_029 + HEAPU8[$left + $i_028 | 0] | 0;
      var $inc = $i_028 + 1 | 0;
      if (($inc | 0) == 16) {
        break;
      } else {
        var $i_028 = $inc;
        var $tmp_029 = $add4;
      }
    }
    var $tmp_3 = ($add4 + 16 | 0) >>> 5;
    var $tmp_3;
    var $conv42 = $tmp_3 & 255;
    _memset($data, $conv42, 256);
    return;
  }
  if ($tobool) {
    var $tmp_3 = (HEAPU8[$left + 15 | 0] + HEAPU8[$left + 14 | 0] + HEAPU8[$left + 13 | 0] + HEAPU8[$left + 12 | 0] + HEAPU8[$left + 11 | 0] + HEAPU8[$left + 10 | 0] + HEAPU8[$left + 9 | 0] + HEAPU8[$left + 8 | 0] + HEAPU8[$left + 7 | 0] + HEAPU8[$left + 6 | 0] + HEAPU8[$left + 5 | 0] + HEAPU8[$left + 4 | 0] + HEAPU8[$left + 3 | 0] + HEAPU8[$left + 2 | 0] + HEAPU8[$left + 1 | 0] + HEAPU8[$left] + 8 | 0) >>> 4;
    var $tmp_3;
    var $conv42 = $tmp_3 & 255;
    _memset($data, $conv42, 256);
    return;
  }
  if ($tobool1) {
    var $tmp_3 = 128;
    var $tmp_3;
    var $conv42 = $tmp_3 & 255;
    _memset($data, $conv42, 256);
    return;
  }
  var $tmp_3 = (HEAPU8[$above + 15 | 0] + HEAPU8[$above + 14 | 0] + HEAPU8[$above + 13 | 0] + HEAPU8[$above + 12 | 0] + HEAPU8[$above + 11 | 0] + HEAPU8[$above + 10 | 0] + HEAPU8[$above + 9 | 0] + HEAPU8[$above + 8 | 0] + HEAPU8[$above + 7 | 0] + HEAPU8[$above + 6 | 0] + HEAPU8[$above + 5 | 0] + HEAPU8[$above + 4 | 0] + HEAPU8[$above + 3 | 0] + HEAPU8[$above + 2 | 0] + HEAPU8[$above + 1 | 0] + HEAPU8[$above] + 8 | 0) >>> 4;
  var $tmp_3;
  var $conv42 = $tmp_3 & 255;
  _memset($data, $conv42, 256);
  return;
}
_Intra16x16DcPrediction["X"] = 1;
function _h264bsdAddResidual($data, $residual, $blockNum) {
  var $residual$s2 = $residual >> 2;
  var $0 = HEAP32[$residual$s2];
  if (($0 | 0) == 16777215) {
    return;
  }
  var $cmp6 = $blockNum >>> 0 < 16;
  var $width_0 = $cmp6 ? 16 : 8;
  var $blockNum_pn = $cmp6 ? $blockNum : $blockNum & 3;
  var $add_ptr_sum = (HEAP32[($blockNum_pn << 2) + 5245480 >> 2] * $width_0 & -1) + HEAP32[($blockNum_pn << 2) + 5245544 >> 2] | 0;
  var $add_ptr14 = $data + $add_ptr_sum | 0;
  var $2 = HEAP32[$residual$s2 + 1];
  var $arrayidx17 = $add_ptr_sum + ($data + 1) | 0;
  var $conv18 = HEAPU8[$arrayidx17];
  HEAP8[$add_ptr14] = HEAP8[$0 + HEAPU8[$add_ptr14] + 5244712 | 0];
  var $5 = HEAP32[$residual$s2 + 2];
  var $arrayidx22 = $add_ptr_sum + ($data + 2) | 0;
  var $conv23 = HEAPU8[$arrayidx22];
  HEAP8[$arrayidx17] = HEAP8[$conv18 + ($2 + 5244712) | 0];
  var $arrayidx28 = $add_ptr_sum + ($data + 3) | 0;
  var $11 = HEAP8[HEAP32[$residual$s2 + 3] + HEAPU8[$arrayidx28] + 5244712 | 0];
  HEAP8[$arrayidx22] = HEAP8[$conv23 + ($5 + 5244712) | 0];
  HEAP8[$arrayidx28] = $11;
  var $add_ptr14_sum37 = $add_ptr_sum + $width_0 | 0;
  var $add_ptr40 = $data + $add_ptr14_sum37 | 0;
  var $14 = HEAP32[$residual$s2 + 5];
  var $arrayidx17_1 = $add_ptr14_sum37 + ($data + 1) | 0;
  var $conv18_1 = HEAPU8[$arrayidx17_1];
  HEAP8[$add_ptr40] = HEAP8[HEAP32[$residual$s2 + 4] + HEAPU8[$add_ptr40] + 5244712 | 0];
  var $17 = HEAP32[$residual$s2 + 6];
  var $arrayidx22_1 = $add_ptr14_sum37 + ($data + 2) | 0;
  var $conv23_1 = HEAPU8[$arrayidx22_1];
  HEAP8[$arrayidx17_1] = HEAP8[$conv18_1 + ($14 + 5244712) | 0];
  var $arrayidx28_1 = $add_ptr14_sum37 + ($data + 3) | 0;
  var $23 = HEAP8[HEAP32[$residual$s2 + 7] + HEAPU8[$arrayidx28_1] + 5244712 | 0];
  HEAP8[$arrayidx22_1] = HEAP8[$conv23_1 + ($17 + 5244712) | 0];
  HEAP8[$arrayidx28_1] = $23;
  var $add_ptr40_sum40 = $add_ptr14_sum37 + $width_0 | 0;
  var $add_ptr40_1 = $data + $add_ptr40_sum40 | 0;
  var $26 = HEAP32[$residual$s2 + 9];
  var $arrayidx17_2 = $add_ptr40_sum40 + ($data + 1) | 0;
  var $conv18_2 = HEAPU8[$arrayidx17_2];
  HEAP8[$add_ptr40_1] = HEAP8[HEAP32[$residual$s2 + 8] + HEAPU8[$add_ptr40_1] + 5244712 | 0];
  var $29 = HEAP32[$residual$s2 + 10];
  var $arrayidx22_2 = $add_ptr40_sum40 + ($data + 2) | 0;
  var $conv23_2 = HEAPU8[$arrayidx22_2];
  HEAP8[$arrayidx17_2] = HEAP8[$conv18_2 + ($26 + 5244712) | 0];
  var $arrayidx28_2 = $add_ptr40_sum40 + ($data + 3) | 0;
  var $35 = HEAP8[HEAP32[$residual$s2 + 11] + HEAPU8[$arrayidx28_2] + 5244712 | 0];
  HEAP8[$arrayidx22_2] = HEAP8[$conv23_2 + ($29 + 5244712) | 0];
  HEAP8[$arrayidx28_2] = $35;
  var $add_ptr40_1_sum43 = $add_ptr40_sum40 + $width_0 | 0;
  var $add_ptr40_2 = $data + $add_ptr40_1_sum43 | 0;
  var $38 = HEAP32[$residual$s2 + 13];
  var $arrayidx17_3 = $add_ptr40_1_sum43 + ($data + 1) | 0;
  var $conv18_3 = HEAPU8[$arrayidx17_3];
  HEAP8[$add_ptr40_2] = HEAP8[HEAP32[$residual$s2 + 12] + HEAPU8[$add_ptr40_2] + 5244712 | 0];
  var $41 = HEAP32[$residual$s2 + 14];
  var $arrayidx22_3 = $add_ptr40_1_sum43 + ($data + 2) | 0;
  var $conv23_3 = HEAPU8[$arrayidx22_3];
  HEAP8[$arrayidx17_3] = HEAP8[$conv18_3 + ($38 + 5244712) | 0];
  var $arrayidx28_3 = $add_ptr40_1_sum43 + ($data + 3) | 0;
  var $47 = HEAP8[HEAP32[$residual$s2 + 15] + HEAPU8[$arrayidx28_3] + 5244712 | 0];
  HEAP8[$arrayidx22_3] = HEAP8[$conv23_3 + ($41 + 5244712) | 0];
  HEAP8[$arrayidx28_3] = $47;
  return;
}
_h264bsdAddResidual["X"] = 1;
function _Get4x4NeighbourPels($a, $l, $data, $above, $left, $blockNum) {
  var $0 = HEAP32[($blockNum << 2) + 5245544 >> 2];
  var $1 = HEAP32[($blockNum << 2) + 5245480 >> 2];
  var $cmp = (1285 >>> ($blockNum >>> 0) & 1 | 0) != 0;
  if ($cmp) {
    var $5 = HEAP8[$1 + ($left + 1) | 0];
    HEAP8[$l + 1 | 0] = HEAP8[$left + $1 | 0];
    HEAP8[$l + 2 | 0] = $5;
    var $7 = HEAP8[$1 + ($left + 3) | 0];
    HEAP8[$l + 3 | 0] = HEAP8[$1 + ($left + 2) | 0];
    HEAP8[$l + 4 | 0] = $7;
  } else {
    var $add12 = ($1 << 4) + $0 | 0;
    var $9 = HEAP8[$add12 + ($data + 15) | 0];
    HEAP8[$l + 1 | 0] = HEAP8[$data + ($add12 - 1) | 0];
    HEAP8[$l + 2 | 0] = $9;
    var $11 = HEAP8[$add12 + ($data + 47) | 0];
    HEAP8[$l + 3 | 0] = HEAP8[$add12 + ($data + 31) | 0];
    HEAP8[$l + 4 | 0] = $11;
  }
  if ((51 >>> ($blockNum >>> 0) & 1 | 0) != 0) {
    var $14 = HEAP8[$above + $0 | 0];
    HEAP8[$l] = $14;
    HEAP8[$a] = $14;
    var $16 = HEAP8[$0 + ($above + 2) | 0];
    HEAP8[$a + 1 | 0] = HEAP8[$0 + ($above + 1) | 0];
    HEAP8[$a + 2 | 0] = $16;
    var $18 = HEAP8[$0 + ($above + 4) | 0];
    HEAP8[$a + 3 | 0] = HEAP8[$0 + ($above + 3) | 0];
    HEAP8[$a + 4 | 0] = $18;
    var $20 = HEAP8[$0 + ($above + 6) | 0];
    HEAP8[$a + 5 | 0] = HEAP8[$0 + ($above + 5) | 0];
    HEAP8[$a + 6 | 0] = $20;
    var $22 = HEAP8[$0 + ($above + 8) | 0];
    HEAP8[$a + 7 | 0] = HEAP8[$0 + ($above + 7) | 0];
    HEAP8[$a + 8 | 0] = $22;
    return;
  }
  var $sub64 = $1 - 1 | 0;
  var $add66 = ($sub64 << 4) + $0 | 0;
  var $24 = HEAP8[$add66 + ($data + 1) | 0];
  HEAP8[$a + 1 | 0] = HEAP8[$data + $add66 | 0];
  HEAP8[$a + 2 | 0] = $24;
  var $26 = HEAP8[$add66 + ($data + 3) | 0];
  HEAP8[$a + 3 | 0] = HEAP8[$add66 + ($data + 2) | 0];
  HEAP8[$a + 4 | 0] = $26;
  var $28 = HEAP8[$add66 + ($data + 5) | 0];
  HEAP8[$a + 5 | 0] = HEAP8[$add66 + ($data + 4) | 0];
  HEAP8[$a + 6 | 0] = $28;
  var $30 = HEAP8[$add66 + ($data + 7) | 0];
  HEAP8[$a + 7 | 0] = HEAP8[$add66 + ($data + 6) | 0];
  HEAP8[$a + 8 | 0] = $30;
  if ($cmp) {
    var $31 = HEAP8[$left + $sub64 | 0];
    HEAP8[$a] = $31;
    HEAP8[$l] = $31;
    return;
  } else {
    var $32 = HEAP8[$data + ($add66 - 1) | 0];
    HEAP8[$a] = $32;
    HEAP8[$l] = $32;
    return;
  }
}
_Get4x4NeighbourPels["X"] = 1;
function _Intra4x4VerticalPrediction($data, $above) {
  var $0 = HEAP8[$above];
  var $1 = HEAP8[$above + 1 | 0];
  HEAP8[$data + 12 | 0] = $0;
  HEAP8[$data + 8 | 0] = $0;
  HEAP8[$data + 4 | 0] = $0;
  HEAP8[$data] = $0;
  HEAP8[$data + 13 | 0] = $1;
  HEAP8[$data + 9 | 0] = $1;
  HEAP8[$data + 5 | 0] = $1;
  HEAP8[$data + 1 | 0] = $1;
  var $2 = HEAP8[$above + 2 | 0];
  var $3 = HEAP8[$above + 3 | 0];
  HEAP8[$data + 14 | 0] = $2;
  HEAP8[$data + 10 | 0] = $2;
  HEAP8[$data + 6 | 0] = $2;
  HEAP8[$data + 2 | 0] = $2;
  HEAP8[$data + 15 | 0] = $3;
  HEAP8[$data + 11 | 0] = $3;
  HEAP8[$data + 7 | 0] = $3;
  HEAP8[$data + 3 | 0] = $3;
  return;
}
function _Intra4x4DiagonalDownLeftPrediction($data, $above) {
  var $arrayidx1 = $above + 1 | 0;
  var $arrayidx3 = $above + 2 | 0;
  HEAP8[$data] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$above] + HEAPU8[$arrayidx3] + 2 | 0) >>> 2 & 255;
  var $arrayidx15 = $above + 3 | 0;
  HEAP8[$data + 1 | 0] = ((HEAPU8[$arrayidx3] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx15] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 4 | 0] = ((HEAPU8[$arrayidx3] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx15] + 2 | 0) >>> 2 & 255;
  var $arrayidx41 = $above + 4 | 0;
  HEAP8[$data + 2 | 0] = ((HEAPU8[$arrayidx15] << 1) + HEAPU8[$arrayidx3] + HEAPU8[$arrayidx41] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 5 | 0] = ((HEAPU8[$arrayidx15] << 1) + HEAPU8[$arrayidx3] + HEAPU8[$arrayidx41] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 8 | 0] = ((HEAPU8[$arrayidx15] << 1) + HEAPU8[$arrayidx3] + HEAPU8[$arrayidx41] + 2 | 0) >>> 2 & 255;
  var $arrayidx80 = $above + 5 | 0;
  HEAP8[$data + 3 | 0] = ((HEAPU8[$arrayidx41] << 1) + HEAPU8[$arrayidx15] + HEAPU8[$arrayidx80] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 6 | 0] = ((HEAPU8[$arrayidx41] << 1) + HEAPU8[$arrayidx15] + HEAPU8[$arrayidx80] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 9 | 0] = ((HEAPU8[$arrayidx41] << 1) + HEAPU8[$arrayidx15] + HEAPU8[$arrayidx80] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 12 | 0] = ((HEAPU8[$arrayidx41] << 1) + HEAPU8[$arrayidx15] + HEAPU8[$arrayidx80] + 2 | 0) >>> 2 & 255;
  var $arrayidx132 = $above + 6 | 0;
  HEAP8[$data + 7 | 0] = ((HEAPU8[$arrayidx80] << 1) + HEAPU8[$arrayidx41] + HEAPU8[$arrayidx132] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 10 | 0] = ((HEAPU8[$arrayidx80] << 1) + HEAPU8[$arrayidx41] + HEAPU8[$arrayidx132] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 13 | 0] = ((HEAPU8[$arrayidx80] << 1) + HEAPU8[$arrayidx41] + HEAPU8[$arrayidx132] + 2 | 0) >>> 2 & 255;
  var $arrayidx171 = $above + 7 | 0;
  HEAP8[$data + 11 | 0] = ((HEAPU8[$arrayidx132] << 1) + HEAPU8[$arrayidx80] + HEAPU8[$arrayidx171] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 14 | 0] = ((HEAPU8[$arrayidx132] << 1) + HEAPU8[$arrayidx80] + HEAPU8[$arrayidx171] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 15 | 0] = (HEAPU8[$arrayidx132] + (HEAPU8[$arrayidx171] * 3 & -1) + 2 | 0) >>> 2 & 255;
  return;
}
_Intra4x4DiagonalDownLeftPrediction["X"] = 1;
function _DetermineIntra4x4PredMode($pMbLayer, $available, $nA_0_1_val, $nB_0_1_val, $index, $nMbA, $nMbB) {
  if (($available | 0) == 0) {
    var $mode1_1 = 2;
  } else {
    if ((_h264bsdMbPartPredMode(HEAP32[$nMbA >> 2]) | 0) == 0) {
      var $mode1_0 = HEAPU8[($nA_0_1_val & 255) + $nMbA + 82 | 0];
    } else {
      var $mode1_0 = 2;
    }
    var $mode1_0;
    if ((_h264bsdMbPartPredMode(HEAP32[$nMbB >> 2]) | 0) == 0) {
      var $mode2_0 = HEAPU8[($nB_0_1_val & 255) + $nMbB + 82 | 0];
    } else {
      var $mode2_0 = 2;
    }
    var $mode2_0;
    var $mode1_1 = $mode1_0 >>> 0 < $mode2_0 >>> 0 ? $mode1_0 : $mode2_0;
  }
  var $mode1_1;
  if ((HEAP32[$pMbLayer + ($index << 2) + 12 >> 2] | 0) == 0) {
    var $5 = HEAP32[$pMbLayer + ($index << 2) + 76 >> 2];
    return ($5 >>> 0 >= $mode1_1 >>> 0 & 1) + $5 | 0;
  } else {
    return $mode1_1;
  }
}
function _Intra4x4HorizontalPrediction($data, $left) {
  var $1 = HEAP8[$left + 1 | 0];
  _memset($data, HEAP8[$left], 4);
  _memset($data + 4 | 0, $1, 4);
  var $3 = HEAP8[$left + 3 | 0];
  _memset($data + 8 | 0, HEAP8[$left + 2 | 0], 4);
  _memset($data + 12 | 0, $3, 4);
  return;
}
function _Intra4x4DcPrediction($data, $above, $left, $availableA, $availableB) {
  var $tobool = ($availableA | 0) != 0;
  var $tobool5 = ($availableB | 0) == 0;
  if (!($tobool5 | $tobool ^ 1)) {
    var $tmp_0 = (HEAPU8[$above] + HEAPU8[$above + 1 | 0] + HEAPU8[$above + 2 | 0] + HEAPU8[$above + 3 | 0] + HEAPU8[$left] + HEAPU8[$left + 1 | 0] + HEAPU8[$left + 2 | 0] + HEAPU8[$left + 3 | 0] + 4 | 0) >>> 3;
    var $tmp_0;
    var $conv61 = $tmp_0 & 255;
    _memset($data, $conv61, 16);
    return;
  }
  if ($tobool) {
    var $tmp_0 = (HEAPU8[$left] + HEAPU8[$left + 1 | 0] + HEAPU8[$left + 2 | 0] + HEAPU8[$left + 3 | 0] + 2 | 0) >>> 2;
    var $tmp_0;
    var $conv61 = $tmp_0 & 255;
    _memset($data, $conv61, 16);
    return;
  }
  if ($tobool5) {
    var $tmp_0 = 128;
    var $tmp_0;
    var $conv61 = $tmp_0 & 255;
    _memset($data, $conv61, 16);
    return;
  }
  var $tmp_0 = (HEAPU8[$above] + HEAPU8[$above + 1 | 0] + HEAPU8[$above + 2 | 0] + HEAPU8[$above + 3 | 0] + 2 | 0) >>> 2;
  var $tmp_0;
  var $conv61 = $tmp_0 & 255;
  _memset($data, $conv61, 16);
  return;
}
_Intra4x4DcPrediction["X"] = 1;
function _Intra4x4DiagonalDownRightPrediction($data, $above, $left) {
  var $arrayidx1 = $above - 1 | 0;
  HEAP8[$data] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 5 | 0] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 10 | 0] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 15 | 0] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  var $arrayidx54 = $above + 1 | 0;
  HEAP8[$data + 1 | 0] = ((HEAPU8[$above] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx54] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 6 | 0] = ((HEAPU8[$above] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx54] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 11 | 0] = ((HEAPU8[$above] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx54] + 2 | 0) >>> 2 & 255;
  var $arrayidx93 = $above + 2 | 0;
  HEAP8[$data + 2 | 0] = ((HEAPU8[$arrayidx54] << 1) + HEAPU8[$above] + HEAPU8[$arrayidx93] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 7 | 0] = ((HEAPU8[$arrayidx54] << 1) + HEAPU8[$above] + HEAPU8[$arrayidx93] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 3 | 0] = ((HEAPU8[$arrayidx93] << 1) + HEAPU8[$arrayidx54] + HEAPU8[$above + 3 | 0] + 2 | 0) >>> 2 & 255;
  var $arrayidx126 = $left - 1 | 0;
  var $arrayidx132 = $left + 1 | 0;
  HEAP8[$data + 4 | 0] = ((HEAPU8[$left] << 1) + HEAPU8[$arrayidx126] + HEAPU8[$arrayidx132] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 9 | 0] = ((HEAPU8[$left] << 1) + HEAPU8[$arrayidx126] + HEAPU8[$arrayidx132] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 14 | 0] = ((HEAPU8[$left] << 1) + HEAPU8[$arrayidx126] + HEAPU8[$arrayidx132] + 2 | 0) >>> 2 & 255;
  var $arrayidx171 = $left + 2 | 0;
  HEAP8[$data + 8 | 0] = ((HEAPU8[$arrayidx132] << 1) + HEAPU8[$left] + HEAPU8[$arrayidx171] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 13 | 0] = ((HEAPU8[$arrayidx132] << 1) + HEAPU8[$left] + HEAPU8[$arrayidx171] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 12 | 0] = ((HEAPU8[$arrayidx171] << 1) + HEAPU8[$arrayidx132] + HEAPU8[$left + 3 | 0] + 2 | 0) >>> 2 & 255;
  return;
}
_Intra4x4DiagonalDownRightPrediction["X"] = 1;
function _Intra4x4VerticalRightPrediction($data, $above, $left) {
  var $arrayidx = $above - 1 | 0;
  HEAP8[$data] = (HEAPU8[$arrayidx] + HEAPU8[$above] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 9 | 0] = (HEAPU8[$arrayidx] + HEAPU8[$above] + 1 | 0) >>> 1 & 255;
  var $arrayidx20 = $above + 1 | 0;
  HEAP8[$data + 5 | 0] = ((HEAPU8[$above] << 1) + HEAPU8[$arrayidx] + HEAPU8[$arrayidx20] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 14 | 0] = ((HEAPU8[$above] << 1) + HEAPU8[$arrayidx] + HEAPU8[$arrayidx20] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 4 | 0] = ((HEAPU8[$arrayidx] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 13 | 0] = ((HEAPU8[$arrayidx] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 1 | 0] = (HEAPU8[$above] + HEAPU8[$arrayidx20] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 10 | 0] = (HEAPU8[$above] + HEAPU8[$arrayidx20] + 1 | 0) >>> 1 & 255;
  var $arrayidx90 = $above + 2 | 0;
  HEAP8[$data + 6 | 0] = ((HEAPU8[$arrayidx20] << 1) + HEAPU8[$above] + HEAPU8[$arrayidx90] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 15 | 0] = ((HEAPU8[$arrayidx20] << 1) + HEAPU8[$above] + HEAPU8[$arrayidx90] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 2 | 0] = (HEAPU8[$arrayidx20] + HEAPU8[$arrayidx90] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 11 | 0] = (HEAPU8[$arrayidx20] + HEAPU8[$arrayidx90] + 1 | 0) >>> 1 & 255;
  var $arrayidx134 = $above + 3 | 0;
  HEAP8[$data + 7 | 0] = ((HEAPU8[$arrayidx90] << 1) + HEAPU8[$arrayidx20] + HEAPU8[$arrayidx134] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 3 | 0] = (HEAPU8[$arrayidx90] + HEAPU8[$arrayidx134] + 1 | 0) >>> 1 & 255;
  var $arrayidx150 = $left + 1 | 0;
  HEAP8[$data + 8 | 0] = ((HEAPU8[$left] << 1) + HEAPU8[$arrayidx150] + HEAPU8[$left - 1 | 0] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 12 | 0] = ((HEAPU8[$arrayidx150] << 1) + HEAPU8[$left + 2 | 0] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  return;
}
_Intra4x4VerticalRightPrediction["X"] = 1;
function _Intra4x4HorizontalDownPrediction($data, $above, $left) {
  var $arrayidx = $left - 1 | 0;
  HEAP8[$data] = (HEAPU8[$arrayidx] + HEAPU8[$left] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 6 | 0] = (HEAPU8[$arrayidx] + HEAPU8[$left] + 1 | 0) >>> 1 & 255;
  var $arrayidx20 = $left + 1 | 0;
  HEAP8[$data + 5 | 0] = ((HEAPU8[$left] << 1) + HEAPU8[$arrayidx] + HEAPU8[$arrayidx20] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 11 | 0] = ((HEAPU8[$left] << 1) + HEAPU8[$arrayidx] + HEAPU8[$arrayidx20] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 4 | 0] = (HEAPU8[$left] + HEAPU8[$arrayidx20] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 10 | 0] = (HEAPU8[$left] + HEAPU8[$arrayidx20] + 1 | 0) >>> 1 & 255;
  var $arrayidx64 = $left + 2 | 0;
  HEAP8[$data + 9 | 0] = ((HEAPU8[$arrayidx20] << 1) + HEAPU8[$left] + HEAPU8[$arrayidx64] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 15 | 0] = ((HEAPU8[$arrayidx20] << 1) + HEAPU8[$left] + HEAPU8[$arrayidx64] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 8 | 0] = (HEAPU8[$arrayidx20] + HEAPU8[$arrayidx64] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 14 | 0] = (HEAPU8[$arrayidx20] + HEAPU8[$arrayidx64] + 1 | 0) >>> 1 & 255;
  var $arrayidx108 = $left + 3 | 0;
  HEAP8[$data + 13 | 0] = ((HEAPU8[$arrayidx64] << 1) + HEAPU8[$arrayidx20] + HEAPU8[$arrayidx108] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 12 | 0] = (HEAPU8[$arrayidx64] + HEAPU8[$arrayidx108] + 1 | 0) >>> 1 & 255;
  var $arrayidx126 = $above - 1 | 0;
  HEAP8[$data + 1 | 0] = ((HEAPU8[$arrayidx126] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 7 | 0] = ((HEAPU8[$arrayidx126] << 1) + HEAPU8[$above] + HEAPU8[$left] + 2 | 0) >>> 2 & 255;
  var $arrayidx150 = $above + 1 | 0;
  HEAP8[$data + 2 | 0] = ((HEAPU8[$above] << 1) + HEAPU8[$arrayidx150] + HEAPU8[$arrayidx126] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 3 | 0] = ((HEAPU8[$arrayidx150] << 1) + HEAPU8[$above + 2 | 0] + HEAPU8[$above] + 2 | 0) >>> 2 & 255;
  return;
}
_Intra4x4HorizontalDownPrediction["X"] = 1;
function _Intra4x4VerticalLeftPrediction($data, $above) {
  var $arrayidx1 = $above + 1 | 0;
  HEAP8[$data] = (HEAPU8[$above] + HEAPU8[$arrayidx1] + 1 | 0) >>> 1 & 255;
  var $arrayidx8 = $above + 2 | 0;
  HEAP8[$data + 1 | 0] = (HEAPU8[$arrayidx1] + HEAPU8[$arrayidx8] + 1 | 0) >>> 1 & 255;
  var $arrayidx17 = $above + 3 | 0;
  HEAP8[$data + 2 | 0] = (HEAPU8[$arrayidx8] + HEAPU8[$arrayidx17] + 1 | 0) >>> 1 & 255;
  var $arrayidx26 = $above + 4 | 0;
  HEAP8[$data + 3 | 0] = (HEAPU8[$arrayidx17] + HEAPU8[$arrayidx26] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 4 | 0] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$above] + HEAPU8[$arrayidx8] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 5 | 0] = ((HEAPU8[$arrayidx8] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx17] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 6 | 0] = ((HEAPU8[$arrayidx17] << 1) + HEAPU8[$arrayidx8] + HEAPU8[$arrayidx26] + 2 | 0) >>> 2 & 255;
  var $arrayidx77 = $above + 5 | 0;
  HEAP8[$data + 7 | 0] = ((HEAPU8[$arrayidx26] << 1) + HEAPU8[$arrayidx17] + HEAPU8[$arrayidx77] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 8 | 0] = (HEAPU8[$arrayidx1] + HEAPU8[$arrayidx8] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 9 | 0] = (HEAPU8[$arrayidx8] + HEAPU8[$arrayidx17] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 10 | 0] = (HEAPU8[$arrayidx17] + HEAPU8[$arrayidx26] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 11 | 0] = (HEAPU8[$arrayidx26] + HEAPU8[$arrayidx77] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 12 | 0] = ((HEAPU8[$arrayidx8] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx17] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 13 | 0] = ((HEAPU8[$arrayidx17] << 1) + HEAPU8[$arrayidx8] + HEAPU8[$arrayidx26] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 14 | 0] = ((HEAPU8[$arrayidx26] << 1) + HEAPU8[$arrayidx17] + HEAPU8[$arrayidx77] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 15 | 0] = ((HEAPU8[$arrayidx77] << 1) + HEAPU8[$arrayidx26] + HEAPU8[$above + 6 | 0] + 2 | 0) >>> 2 & 255;
  return;
}
_Intra4x4VerticalLeftPrediction["X"] = 1;
function _Intra4x4HorizontalUpPrediction($data, $left) {
  var $arrayidx1 = $left + 1 | 0;
  HEAP8[$data] = (HEAPU8[$left] + HEAPU8[$arrayidx1] + 1 | 0) >>> 1 & 255;
  var $arrayidx11 = $left + 2 | 0;
  HEAP8[$data + 1 | 0] = ((HEAPU8[$arrayidx1] << 1) + HEAPU8[$left] + HEAPU8[$arrayidx11] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 2 | 0] = (HEAPU8[$arrayidx1] + HEAPU8[$arrayidx11] + 1 | 0) >>> 1 & 255;
  var $arrayidx33 = $left + 3 | 0;
  HEAP8[$data + 3 | 0] = ((HEAPU8[$arrayidx11] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx33] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 4 | 0] = (HEAPU8[$arrayidx1] + HEAPU8[$arrayidx11] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 5 | 0] = ((HEAPU8[$arrayidx11] << 1) + HEAPU8[$arrayidx1] + HEAPU8[$arrayidx33] + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 6 | 0] = (HEAPU8[$arrayidx11] + HEAPU8[$arrayidx33] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 7 | 0] = (HEAPU8[$arrayidx11] + (HEAPU8[$arrayidx33] * 3 & -1) + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 8 | 0] = (HEAPU8[$arrayidx11] + HEAPU8[$arrayidx33] + 1 | 0) >>> 1 & 255;
  HEAP8[$data + 9 | 0] = (HEAPU8[$arrayidx11] + (HEAPU8[$arrayidx33] * 3 & -1) + 2 | 0) >>> 2 & 255;
  HEAP8[$data + 10 | 0] = HEAP8[$arrayidx33];
  HEAP8[$data + 11 | 0] = HEAP8[$arrayidx33];
  HEAP8[$data + 12 | 0] = HEAP8[$arrayidx33];
  HEAP8[$data + 13 | 0] = HEAP8[$arrayidx33];
  HEAP8[$data + 14 | 0] = HEAP8[$arrayidx33];
  HEAP8[$data + 15 | 0] = HEAP8[$arrayidx33];
  return;
}
_Intra4x4HorizontalUpPrediction["X"] = 1;
function _Write4x4To16x16($data, $data4x4, $blockNum) {
  var $add$s2;
  var $add$s2 = ((HEAP32[($blockNum << 2) + 5245480 >> 2] << 4) + HEAP32[($blockNum << 2) + 5245544 >> 2] | 0) >> 2;
  HEAP32[($data >> 2) + $add$s2] = HEAP32[$data4x4 >> 2];
  HEAP32[($data + 16 >> 2) + $add$s2] = HEAP32[$data4x4 + 4 >> 2];
  HEAP32[($data + 32 >> 2) + $add$s2] = HEAP32[$data4x4 + 8 >> 2];
  HEAP32[($data + 48 >> 2) + $add$s2] = HEAP32[$data4x4 + 12 >> 2];
  return;
}
function _IntraChromaHorizontalPrediction($data, $left) {
  var $data_addr_015 = $data;
  var $left_addr_016 = $left;
  var $i_017 = 8;
  while (1) {
    var $i_017;
    var $left_addr_016;
    var $data_addr_015;
    var $dec = $i_017 - 1 | 0;
    HEAP8[$data_addr_015] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 1 | 0] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 2 | 0] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 3 | 0] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 4 | 0] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 5 | 0] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 6 | 0] = HEAP8[$left_addr_016];
    HEAP8[$data_addr_015 + 7 | 0] = HEAP8[$left_addr_016];
    if (($dec | 0) == 0) {
      break;
    } else {
      var $data_addr_015 = $data_addr_015 + 8 | 0;
      var $left_addr_016 = $left_addr_016 + 1 | 0;
      var $i_017 = $dec;
    }
  }
  return;
}
function _IntraChromaVerticalPrediction($data, $above) {
  var $data_addr_016 = $data;
  var $above_addr_017 = $above;
  var $i_018 = 8;
  while (1) {
    var $i_018;
    var $above_addr_017;
    var $data_addr_016;
    var $dec = $i_018 - 1 | 0;
    HEAP8[$data_addr_016] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 8 | 0] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 16 | 0] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 24 | 0] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 32 | 0] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 40 | 0] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 48 | 0] = HEAP8[$above_addr_017];
    HEAP8[$data_addr_016 + 56 | 0] = HEAP8[$above_addr_017];
    if (($dec | 0) == 0) {
      break;
    } else {
      var $data_addr_016 = $data_addr_016 + 1 | 0;
      var $above_addr_017 = $above_addr_017 + 1 | 0;
      var $i_018 = $dec;
    }
  }
  return;
}
function _IntraChromaPlanePrediction($data, $above, $left) {
  var $conv = HEAPU8[$above + 7 | 0];
  var $conv3 = HEAPU8[$left + 7 | 0];
  var $conv25 = HEAPU8[$above - 1 | 0];
  var $shr = ((($conv - $conv25 << 2) + (HEAPU8[$above + 5 | 0] - HEAPU8[$above + 1 | 0] << 1) + (HEAPU8[$above + 4 | 0] - HEAPU8[$above + 2 | 0]) + ((HEAPU8[$above + 6 | 0] - HEAPU8[$above]) * 3 & -1)) * 17 & -1) + 16 >> 5;
  var $shr59 = ((($conv3 - $conv25 << 2) + (HEAPU8[$left + 5 | 0] - HEAPU8[$left + 1 | 0] << 1) + (HEAPU8[$left + 4 | 0] - HEAPU8[$left + 2 | 0]) + ((HEAPU8[$left + 6 | 0] - HEAPU8[$left]) * 3 & -1)) * 17 & -1) + 16 >> 5;
  var $16 = $shr * -3 & -1;
  var $a_064 = ($conv3 + $conv << 4) + ($shr59 * -3 & -1) + 16 | 0;
  var $i_065 = 8;
  var $data_addr_066 = $data;
  while (1) {
    var $data_addr_066;
    var $i_065;
    var $a_064;
    var $dec = $i_065 - 1 | 0;
    var $sub64 = $a_064 + $16 | 0;
    HEAP8[$data_addr_066] = HEAP8[($sub64 >> 5) + 5244712 | 0];
    var $add67 = $sub64 + $shr | 0;
    HEAP8[$data_addr_066 + 1 | 0] = HEAP8[($add67 >> 5) + 5244712 | 0];
    var $add71 = $add67 + $shr | 0;
    HEAP8[$data_addr_066 + 2 | 0] = HEAP8[($add71 >> 5) + 5244712 | 0];
    var $add75 = $add71 + $shr | 0;
    HEAP8[$data_addr_066 + 3 | 0] = HEAP8[($add75 >> 5) + 5244712 | 0];
    var $add79 = $add75 + $shr | 0;
    HEAP8[$data_addr_066 + 4 | 0] = HEAP8[($add79 >> 5) + 5244712 | 0];
    var $add83 = $add79 + $shr | 0;
    HEAP8[$data_addr_066 + 5 | 0] = HEAP8[($add83 >> 5) + 5244712 | 0];
    var $add87 = $add83 + $shr | 0;
    HEAP8[$data_addr_066 + 6 | 0] = HEAP8[($add87 >> 5) + 5244712 | 0];
    HEAP8[$data_addr_066 + 7 | 0] = HEAP8[($add87 + $shr >> 5) + 5244712 | 0];
    if (($dec | 0) == 0) {
      break;
    } else {
      var $a_064 = $a_064 + $shr59 | 0;
      var $i_065 = $dec;
      var $data_addr_066 = $data_addr_066 + 8 | 0;
    }
  }
  return;
}
_IntraChromaPlanePrediction["X"] = 1;
function _IntraChromaDcPrediction($data, $above, $left, $availableA, $availableB) {
  var $tobool = ($availableA | 0) != 0;
  var $tobool1 = ($availableB | 0) == 0;
  do {
    if ($tobool1 | $tobool ^ 1) {
      if (!$tobool1) {
        var $tmp2_0 = (HEAPU8[$above + 4 | 0] + HEAPU8[$above + 5 | 0] + HEAPU8[$above + 6 | 0] + HEAPU8[$above + 7 | 0] + 2 | 0) >>> 2;
        var $tmp1_0 = (HEAPU8[$above] + HEAPU8[$above + 1 | 0] + HEAPU8[$above + 2 | 0] + HEAPU8[$above + 3 | 0] + 2 | 0) >>> 2;
        break;
      }
      if (!$tobool) {
        var $tmp2_0 = 128;
        var $tmp1_0 = 128;
        break;
      }
      var $shr79 = (HEAPU8[$left] + HEAPU8[$left + 1 | 0] + HEAPU8[$left + 2 | 0] + HEAPU8[$left + 3 | 0] + 2 | 0) >>> 2;
      var $tmp2_0 = $shr79;
      var $tmp1_0 = $shr79;
    } else {
      var $tmp2_0 = (HEAPU8[$above + 4 | 0] + HEAPU8[$above + 5 | 0] + HEAPU8[$above + 6 | 0] + HEAPU8[$above + 7 | 0] + 2 | 0) >>> 2;
      var $tmp1_0 = (HEAPU8[$above] + HEAPU8[$above + 1 | 0] + HEAPU8[$above + 2 | 0] + HEAPU8[$above + 3 | 0] + HEAPU8[$left] + HEAPU8[$left + 1 | 0] + HEAPU8[$left + 2 | 0] + HEAPU8[$left + 3 | 0] + 4 | 0) >>> 3;
    }
  } while (0);
  var $tmp1_0;
  var $tmp2_0;
  var $conv84 = $tmp1_0 & 255;
  var $conv91 = $tmp2_0 & 255;
  _memset($data, $conv84, 4);
  _memset($data + 4 | 0, $conv91, 4);
  _memset($data + 8 | 0, $conv84, 4);
  _memset($data + 12 | 0, $conv91, 4);
  _memset($data + 16 | 0, $conv84, 4);
  _memset($data + 20 | 0, $conv91, 4);
  var $scevgep = $data + 32 | 0;
  _memset($data + 24 | 0, $conv84, 4);
  _memset($data + 28 | 0, $conv91, 4);
  do {
    if ($tobool) {
      var $conv102 = HEAPU8[$left + 4 | 0];
      var $conv104 = HEAPU8[$left + 5 | 0];
      var $conv107 = HEAPU8[$left + 6 | 0];
      var $conv110 = HEAPU8[$left + 7 | 0];
      var $shr113 = ($conv110 + ($conv102 + ($conv107 + ($conv104 + 2))) | 0) >>> 2;
      if ($tobool1) {
        var $tmp2_1 = $shr113;
        var $tmp1_1 = $shr113;
        break;
      }
      var $tmp2_1 = ($conv102 + $conv104 + $conv107 + $conv110 + HEAPU8[$above + 4 | 0] + HEAPU8[$above + 5 | 0] + HEAPU8[$above + 6 | 0] + HEAPU8[$above + 7 | 0] + 4 | 0) >>> 3;
      var $tmp1_1 = $shr113;
    } else {
      if ($tobool1) {
        var $tmp2_1 = 128;
        var $tmp1_1 = 128;
        break;
      }
      var $tmp2_1 = (HEAPU8[$above + 4 | 0] + HEAPU8[$above + 5 | 0] + HEAPU8[$above + 6 | 0] + HEAPU8[$above + 7 | 0] + 2 | 0) >>> 2;
      var $tmp1_1 = (HEAPU8[$above] + HEAPU8[$above + 1 | 0] + HEAPU8[$above + 2 | 0] + HEAPU8[$above + 3 | 0] + 2 | 0) >>> 2;
    }
  } while (0);
  var $tmp1_1;
  var $tmp2_1;
  var $conv179 = $tmp1_1 & 255;
  var $conv187 = $tmp2_1 & 255;
  _memset($scevgep, $conv179, 4);
  _memset($data + 36 | 0, $conv187, 4);
  _memset($data + 40 | 0, $conv179, 4);
  _memset($data + 44 | 0, $conv187, 4);
  _memset($data + 48 | 0, $conv179, 4);
  _memset($data + 52 | 0, $conv187, 4);
  _memset($data + 56 | 0, $conv179, 4);
  _memset($data + 60 | 0, $conv187, 4);
  return;
}
_IntraChromaDcPrediction["X"] = 1;
function _h264bsdInterPrediction($pMb, $pMbLayer, $dpb, $mbNum, $currImage, $data) {
  var $refImage$s2;
  var $pMb$s2 = $pMb >> 2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 24 | 0;
  var $refImage = __stackBase__, $refImage$s2 = $refImage >> 2;
  var $width = $currImage + 4 | 0;
  var $0 = HEAP32[$width >> 2];
  var $div = Math.floor(($mbNum >>> 0) / ($0 >>> 0));
  var $mul2 = $div << 4;
  var $mul3 = $mbNum - ($div * $0 & -1) << 4;
  HEAP32[$refImage$s2 + 1] = $0;
  var $height = $currImage + 8 | 0;
  HEAP32[$refImage$s2 + 2] = HEAP32[$height >> 2];
  var $mbType = $pMb | 0;
  var $2 = HEAP32[$mbType >> 2];
  L1866 : do {
    if (($2 | 0) == 0 | ($2 | 0) == 1) {
      if ((_MvPrediction16x16($pMb, $pMbLayer + 12 | 0, $dpb) | 0) == 0) {
        HEAP32[$refImage$s2] = HEAP32[$pMb$s2 + 29];
        _h264bsdPredictSamples($data, $pMb + 132 | 0, $refImage, $mul3, $mul2, 0, 0, 16, 16);
        break;
      } else {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    } else if (($2 | 0) == 2) {
      if ((_MvPrediction16x8($pMb, $pMbLayer + 12 | 0, $dpb) | 0) == 0) {
        var $data16 = $refImage | 0;
        HEAP32[$data16 >> 2] = HEAP32[$pMb$s2 + 29];
        _h264bsdPredictSamples($data, $pMb + 132 | 0, $refImage, $mul3, $mul2, 0, 0, 16, 8);
        HEAP32[$data16 >> 2] = HEAP32[$pMb$s2 + 31];
        _h264bsdPredictSamples($data, $pMb + 164 | 0, $refImage, $mul3, $mul2, 0, 8, 16, 8);
        break;
      } else {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    } else if (($2 | 0) == 3) {
      if ((_MvPrediction8x16($pMb, $pMbLayer + 12 | 0, $dpb) | 0) == 0) {
        var $data32 = $refImage | 0;
        HEAP32[$data32 >> 2] = HEAP32[$pMb$s2 + 29];
        _h264bsdPredictSamples($data, $pMb + 132 | 0, $refImage, $mul3, $mul2, 0, 0, 8, 16);
        HEAP32[$data32 >> 2] = HEAP32[$pMb$s2 + 30];
        _h264bsdPredictSamples($data, $pMb + 148 | 0, $refImage, $mul3, $mul2, 8, 0, 8, 16);
        break;
      } else {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    } else {
      if ((_MvPrediction8x8($pMb, $pMbLayer + 176 | 0, $dpb) | 0) != 0) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      var $data48 = $refImage | 0;
      var $i_0124 = 0;
      while (1) {
        var $i_0124;
        HEAP32[$data48 >> 2] = HEAP32[(($i_0124 << 2) + 116 >> 2) + $pMb$s2];
        var $call51 = _h264bsdSubMbPartMode(HEAP32[$pMbLayer + ($i_0124 << 2) + 176 >> 2]);
        var $10 = $i_0124 << 3 & 8;
        var $cond53 = $i_0124 >>> 0 < 2 ? 0 : 8;
        if (($call51 | 0) == 1) {
          var $mul62 = $i_0124 << 2;
          _h264bsdPredictSamples($data, ($mul62 << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10, $cond53, 8, 4);
          _h264bsdPredictSamples($data, (($mul62 | 2) << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10, $cond53 | 4, 8, 4);
        } else if (($call51 | 0) == 0) {
          _h264bsdPredictSamples($data, ($i_0124 << 4) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10, $cond53, 8, 8);
        } else if (($call51 | 0) == 2) {
          var $mul72 = $i_0124 << 2;
          _h264bsdPredictSamples($data, ($mul72 << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10, $cond53, 4, 8);
          _h264bsdPredictSamples($data, (($mul72 | 1) << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10 | 4, $cond53, 4, 8);
        } else {
          var $mul83 = $i_0124 << 2;
          _h264bsdPredictSamples($data, ($mul83 << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10, $cond53, 4, 4);
          var $add90120 = $10 | 4;
          _h264bsdPredictSamples($data, (($mul83 | 1) << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $add90120, $cond53, 4, 4);
          var $add96122 = $cond53 | 4;
          _h264bsdPredictSamples($data, (($mul83 | 2) << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $10, $add96122, 4, 4);
          _h264bsdPredictSamples($data, (($mul83 | 3) << 2) + $pMb + 132 | 0, $refImage, $mul3, $mul2, $add90120, $add96122, 4, 4);
        }
        var $inc = $i_0124 + 1 | 0;
        if (($inc | 0) == 4) {
          break L1866;
        } else {
          var $i_0124 = $inc;
        }
      }
    }
  } while (0);
  if (HEAP32[$pMb$s2 + 49] >>> 0 > 1) {
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if ((HEAP32[$mbType >> 2] | 0) == 0) {
    _h264bsdWriteMacroblock($currImage, $data);
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else {
    _h264bsdWriteOutputBlocks(HEAP32[$currImage >> 2], HEAP32[$width >> 2], HEAP32[$height >> 2], $mbNum, $data, $pMbLayer + 328 | 0);
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
}
_h264bsdInterPrediction["X"] = 1;
function _MvPrediction16x16($pMb, $mbPred, $dpb) {
  var $sliceId$s2;
  var $a$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 40 | 0;
  var $mvPred = __stackBase__;
  var $a = __stackBase__ + 4, $a$s2 = $a >> 2;
  var $0 = HEAP32[$mbPred + 132 >> 2];
  var $sliceId$s2 = ($pMb + 4 | 0) >> 2;
  var $arraydecay = $a | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 200 >> 2], $arraydecay, 5);
  _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 204 >> 2], $a + 12 | 0, 10);
  var $5 = $a + 8 | 0;
  var $6 = $a + 20 | 0;
  do {
    if ((HEAP32[$pMb >> 2] | 0) == 0) {
      if ((HEAP32[$a$s2] | 0) == 0) {
        var $mv_sroa_1_0 = 0;
        var $mv_sroa_0_0 = 0;
        break;
      }
      if ((HEAP32[$a$s2 + 3] | 0) == 0) {
        var $mv_sroa_1_0 = 0;
        var $mv_sroa_0_0 = 0;
        break;
      }
      if ((HEAP32[$a$s2 + 1] | 0) == 0) {
        if ((HEAP32[$5 >> 2] | 0) == 0) {
          var $mv_sroa_1_0 = 0;
          var $mv_sroa_0_0 = 0;
          break;
        }
      }
      if ((HEAP32[$a$s2 + 4] | 0) != 0) {
        label = 1494;
        break;
      }
      if ((HEAP32[$6 >> 2] | 0) == 0) {
        var $mv_sroa_1_0 = 0;
        var $mv_sroa_0_0 = 0;
        break;
      } else {
        label = 1494;
        break;
      }
    } else {
      label = 1494;
    }
  } while (0);
  do {
    if (label == 1494) {
      var $mv_sroa_0_0_copyload12 = HEAP16[$mbPred + 148 >> 1];
      var $mv_sroa_1_2_copyload16 = HEAP16[$mbPred + 150 >> 1];
      var $add_ptr28 = $a + 24 | 0;
      _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 208 >> 2], $add_ptr28, 10);
      if ((HEAP32[$a$s2 + 6] | 0) == 0) {
        _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 212 >> 2], $add_ptr28, 15);
      }
      _GetPredictionMv($mvPred, $arraydecay, $0);
      var $add = HEAP16[$mvPred >> 1] + $mv_sroa_0_0_copyload12 & 65535;
      var $add45 = HEAP16[$mvPred + 2 >> 1] + $mv_sroa_1_2_copyload16 & 65535;
      if ((($add << 16 >> 16) + 8192 | 0) >>> 0 > 16383) {
        var $retval_0 = 1;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
      if ((($add45 << 16 >> 16) + 2048 | 0) >>> 0 > 4095) {
        var $retval_0 = 1;
      } else {
        var $mv_sroa_1_0 = $add45;
        var $mv_sroa_0_0 = $add;
        break;
      }
      var $retval_0;
      STACKTOP = __stackBase__;
      return $retval_0;
    }
  } while (0);
  var $mv_sroa_0_0;
  var $mv_sroa_1_0;
  var $call = _h264bsdGetRefPicData($dpb, $0);
  if (($call | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP16[$pMb + 192 >> 1] = $mv_sroa_0_0;
  HEAP16[$pMb + 194 >> 1] = $mv_sroa_1_0;
  var $21 = $pMb + 192 | 0;
  var $22 = $pMb + 188 | 0;
  var $23 = HEAPU16[$21 >> 1] | HEAPU16[$21 + 2 >> 1] << 16;
  tempBigInt = $23;
  HEAP16[$22 >> 1] = tempBigInt & 65535;
  HEAP16[$22 + 2 >> 1] = tempBigInt >> 16;
  var $24 = $pMb + 184 | 0;
  tempBigInt = $23;
  HEAP16[$24 >> 1] = tempBigInt & 65535;
  HEAP16[$24 + 2 >> 1] = tempBigInt >> 16;
  var $25 = $pMb + 180 | 0;
  tempBigInt = $23;
  HEAP16[$25 >> 1] = tempBigInt & 65535;
  HEAP16[$25 + 2 >> 1] = tempBigInt >> 16;
  var $26 = $pMb + 176 | 0;
  tempBigInt = $23;
  HEAP16[$26 >> 1] = tempBigInt & 65535;
  HEAP16[$26 + 2 >> 1] = tempBigInt >> 16;
  var $27 = $pMb + 172 | 0;
  tempBigInt = $23;
  HEAP16[$27 >> 1] = tempBigInt & 65535;
  HEAP16[$27 + 2 >> 1] = tempBigInt >> 16;
  var $28 = $pMb + 168 | 0;
  tempBigInt = $23;
  HEAP16[$28 >> 1] = tempBigInt & 65535;
  HEAP16[$28 + 2 >> 1] = tempBigInt >> 16;
  var $29 = $pMb + 164 | 0;
  tempBigInt = $23;
  HEAP16[$29 >> 1] = tempBigInt & 65535;
  HEAP16[$29 + 2 >> 1] = tempBigInt >> 16;
  var $30 = $pMb + 160 | 0;
  tempBigInt = $23;
  HEAP16[$30 >> 1] = tempBigInt & 65535;
  HEAP16[$30 + 2 >> 1] = tempBigInt >> 16;
  var $31 = $pMb + 156 | 0;
  tempBigInt = $23;
  HEAP16[$31 >> 1] = tempBigInt & 65535;
  HEAP16[$31 + 2 >> 1] = tempBigInt >> 16;
  var $32 = $pMb + 152 | 0;
  tempBigInt = $23;
  HEAP16[$32 >> 1] = tempBigInt & 65535;
  HEAP16[$32 + 2 >> 1] = tempBigInt >> 16;
  var $33 = $pMb + 148 | 0;
  tempBigInt = $23;
  HEAP16[$33 >> 1] = tempBigInt & 65535;
  HEAP16[$33 + 2 >> 1] = tempBigInt >> 16;
  var $34 = $pMb + 144 | 0;
  tempBigInt = $23;
  HEAP16[$34 >> 1] = tempBigInt & 65535;
  HEAP16[$34 + 2 >> 1] = tempBigInt >> 16;
  var $35 = $pMb + 140 | 0;
  tempBigInt = $23;
  HEAP16[$35 >> 1] = tempBigInt & 65535;
  HEAP16[$35 + 2 >> 1] = tempBigInt >> 16;
  var $36 = $pMb + 136 | 0;
  tempBigInt = $23;
  HEAP16[$36 >> 1] = tempBigInt & 65535;
  HEAP16[$36 + 2 >> 1] = tempBigInt >> 16;
  var $37 = $pMb + 132 | 0;
  tempBigInt = $23;
  HEAP16[$37 >> 1] = tempBigInt & 65535;
  HEAP16[$37 + 2 >> 1] = tempBigInt >> 16;
  HEAP32[$pMb + 100 >> 2] = $0;
  HEAP32[$pMb + 104 >> 2] = $0;
  HEAP32[$pMb + 108 >> 2] = $0;
  HEAP32[$pMb + 112 >> 2] = $0;
  HEAP32[$pMb + 116 >> 2] = $call;
  HEAP32[$pMb + 120 >> 2] = $call;
  HEAP32[$pMb + 124 >> 2] = $call;
  HEAP32[$pMb + 128 >> 2] = $call;
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_MvPrediction16x16["X"] = 1;
function _MedianFilter($a, $b, $c) {
  if (($b | 0) > ($a | 0)) {
    var $min_0 = $a;
    var $max_0 = $b;
  } else {
    var $min_0 = ($b | 0) < ($a | 0) ? $b : $a;
    var $max_0 = $a;
  }
  var $max_0;
  var $min_0;
  if (($max_0 | 0) < ($c | 0)) {
    var $med_0 = $max_0;
    var $med_0;
    return $med_0;
  }
  var $med_0 = ($min_0 | 0) > ($c | 0) ? $min_0 : $c;
  var $med_0;
  return $med_0;
}
function _GetInterNeighbour($sliceId, $nMb, $n, $index) {
  var $available = $n | 0;
  HEAP32[$available >> 2] = 0;
  var $refIndex = $n + 4 | 0;
  HEAP32[$refIndex >> 2] = -1;
  var $mv = $n + 8 | 0;
  HEAP16[$n + 10 >> 1] = 0;
  HEAP16[$mv >> 1] = 0;
  if (($nMb | 0) == 0) {
    return;
  }
  if ((HEAP32[$nMb + 4 >> 2] | 0) != ($sliceId | 0)) {
    return;
  }
  var $1 = HEAP32[$nMb >> 2];
  HEAP32[$available >> 2] = 1;
  if ($1 >>> 0 >= 6) {
    return;
  }
  var $2 = ($index << 2) + $nMb + 132 | 0;
  var $3 = HEAPU16[$2 >> 1] | HEAPU16[$2 + 2 >> 1] << 16;
  HEAP32[$refIndex >> 2] = HEAP32[$nMb + ($index >>> 2 << 2) + 100 >> 2];
  var $5 = $mv;
  tempBigInt = $3;
  HEAP16[$5 >> 1] = tempBigInt & 65535;
  HEAP16[$5 + 2 >> 1] = tempBigInt >> 16;
  return;
}
function _MvPrediction16x8($pMb, $mbPred, $dpb) {
  var $23$s1;
  var $sliceId$s2;
  var $a$s2;
  var $mvPred$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 4 | 0;
  var $mvPred = __stackBase__, $mvPred$s2 = $mvPred >> 2;
  var $tmpcast = $mvPred;
  var $a = STACKTOP, $a$s2 = $a >> 2;
  STACKTOP = STACKTOP + 36 | 0;
  var $mv_sroa_0_0_copyload23 = HEAP16[$mbPred + 148 >> 1];
  var $mv_sroa_1_2_copyload33 = HEAP16[$mbPred + 150 >> 1];
  var $0 = HEAP32[$mbPred + 132 >> 2];
  var $sliceId$s2 = ($pMb + 4 | 0) >> 2;
  var $arraydecay = $a | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 204 >> 2], $a + 12 | 0, 10);
  var $refIndex3 = $a + 16 | 0;
  if ((HEAP32[$refIndex3 >> 2] | 0) == ($0 | 0)) {
    var $5 = HEAP32[$a$s2 + 5];
    HEAP32[$mvPred$s2] = $5;
    var $_in_in = $5;
  } else {
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 200 >> 2], $arraydecay, 5);
    var $add_ptr10 = $a + 24 | 0;
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 208 >> 2], $add_ptr10, 10);
    if ((HEAP32[$a$s2 + 6] | 0) == 0) {
      _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 212 >> 2], $add_ptr10, 15);
    }
    _GetPredictionMv($tmpcast, $arraydecay, $0);
    var $_in_in = HEAP32[$mvPred$s2];
  }
  var $_in_in;
  var $add = ($_in_in & 65535) + $mv_sroa_0_0_copyload23 & 65535;
  var $add24 = ($_in_in >>> 16 & 65535) + $mv_sroa_1_2_copyload33 & 65535;
  if ((($add << 16 >> 16) + 8192 | 0) >>> 0 > 16383) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if ((($add24 << 16 >> 16) + 2048 | 0) >>> 0 > 4095) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $call = _h264bsdGetRefPicData($dpb, $0);
  if (($call | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP16[$pMb + 160 >> 1] = $add;
  HEAP16[$pMb + 162 >> 1] = $add24;
  var $15 = $pMb + 160 | 0;
  var $16 = $pMb + 156 | 0;
  var $17 = HEAPU16[$15 >> 1] | HEAPU16[$15 + 2 >> 1] << 16;
  tempBigInt = $17;
  HEAP16[$16 >> 1] = tempBigInt & 65535;
  HEAP16[$16 + 2 >> 1] = tempBigInt >> 16;
  var $18 = $pMb + 152 | 0;
  tempBigInt = $17;
  HEAP16[$18 >> 1] = tempBigInt & 65535;
  HEAP16[$18 + 2 >> 1] = tempBigInt >> 16;
  var $19 = $pMb + 148 | 0;
  tempBigInt = $17;
  HEAP16[$19 >> 1] = tempBigInt & 65535;
  HEAP16[$19 + 2 >> 1] = tempBigInt >> 16;
  var $20 = $pMb + 144 | 0;
  tempBigInt = $17;
  HEAP16[$20 >> 1] = tempBigInt & 65535;
  HEAP16[$20 + 2 >> 1] = tempBigInt >> 16;
  var $21 = $pMb + 140 | 0;
  tempBigInt = $17;
  HEAP16[$21 >> 1] = tempBigInt & 65535;
  HEAP16[$21 + 2 >> 1] = tempBigInt >> 16;
  var $22 = $pMb + 136 | 0;
  tempBigInt = $17;
  HEAP16[$22 >> 1] = tempBigInt & 65535;
  HEAP16[$22 + 2 >> 1] = tempBigInt >> 16;
  var $23$s1 = ($pMb + 132 | 0) >> 1;
  tempBigInt = $17;
  HEAP16[$23$s1] = tempBigInt & 65535;
  HEAP16[$23$s1 + 1] = tempBigInt >> 16;
  var $arrayidx60 = $pMb + 100 | 0;
  HEAP32[$arrayidx60 >> 2] = $0;
  HEAP32[$pMb + 104 >> 2] = $0;
  HEAP32[$pMb + 116 >> 2] = $call;
  HEAP32[$pMb + 120 >> 2] = $call;
  var $mv_sroa_0_0_copyload17 = HEAP16[$mbPred + 152 >> 1];
  var $mv_sroa_1_2_copyload27 = HEAP16[$mbPred + 154 >> 1];
  var $24 = HEAP32[$mbPred + 136 >> 2];
  var $mbA71 = $pMb + 200 | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$mbA71 >> 2], $arraydecay, 13);
  if ((HEAP32[$a$s2 + 1] | 0) == ($24 | 0)) {
    var $29 = HEAP32[$a$s2 + 2];
    HEAP32[$mvPred$s2] = $29;
    var $_in85_in = $29;
  } else {
    HEAP32[$a$s2 + 3] = 1;
    HEAP32[$refIndex3 >> 2] = HEAP32[$arrayidx60 >> 2];
    HEAP32[$a$s2 + 5] = HEAPU16[$23$s1] | HEAPU16[$23$s1 + 1] << 16;
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$mbA71 >> 2], $a + 24 | 0, 7);
    _GetPredictionMv($tmpcast, $arraydecay, $24);
    var $_in85_in = HEAP32[$mvPred$s2];
  }
  var $_in85_in;
  var $add101 = ($_in85_in & 65535) + $mv_sroa_0_0_copyload17 & 65535;
  var $add107 = ($_in85_in >>> 16 & 65535) + $mv_sroa_1_2_copyload27 & 65535;
  if ((($add101 << 16 >> 16) + 8192 | 0) >>> 0 > 16383) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if ((($add107 << 16 >> 16) + 2048 | 0) >>> 0 > 4095) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $call123 = _h264bsdGetRefPicData($dpb, $24);
  if (($call123 | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP16[$pMb + 192 >> 1] = $add101;
  HEAP16[$pMb + 194 >> 1] = $add107;
  var $37 = $pMb + 192 | 0;
  var $38 = $pMb + 188 | 0;
  var $39 = HEAPU16[$37 >> 1] | HEAPU16[$37 + 2 >> 1] << 16;
  tempBigInt = $39;
  HEAP16[$38 >> 1] = tempBigInt & 65535;
  HEAP16[$38 + 2 >> 1] = tempBigInt >> 16;
  var $40 = $pMb + 184 | 0;
  tempBigInt = $39;
  HEAP16[$40 >> 1] = tempBigInt & 65535;
  HEAP16[$40 + 2 >> 1] = tempBigInt >> 16;
  var $41 = $pMb + 180 | 0;
  tempBigInt = $39;
  HEAP16[$41 >> 1] = tempBigInt & 65535;
  HEAP16[$41 + 2 >> 1] = tempBigInt >> 16;
  var $42 = $pMb + 176 | 0;
  tempBigInt = $39;
  HEAP16[$42 >> 1] = tempBigInt & 65535;
  HEAP16[$42 + 2 >> 1] = tempBigInt >> 16;
  var $43 = $pMb + 172 | 0;
  tempBigInt = $39;
  HEAP16[$43 >> 1] = tempBigInt & 65535;
  HEAP16[$43 + 2 >> 1] = tempBigInt >> 16;
  var $44 = $pMb + 168 | 0;
  tempBigInt = $39;
  HEAP16[$44 >> 1] = tempBigInt & 65535;
  HEAP16[$44 + 2 >> 1] = tempBigInt >> 16;
  var $45 = $pMb + 164 | 0;
  tempBigInt = $39;
  HEAP16[$45 >> 1] = tempBigInt & 65535;
  HEAP16[$45 + 2 >> 1] = tempBigInt >> 16;
  HEAP32[$pMb + 108 >> 2] = $24;
  HEAP32[$pMb + 112 >> 2] = $24;
  HEAP32[$pMb + 124 >> 2] = $call123;
  HEAP32[$pMb + 128 >> 2] = $call123;
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_MvPrediction16x8["X"] = 1;
function _MvPrediction8x16($pMb, $mbPred, $dpb) {
  var $23$s1;
  var $sliceId$s2;
  var $a$s2;
  var $mvPred$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 4 | 0;
  var $mvPred = __stackBase__, $mvPred$s2 = $mvPred >> 2;
  var $tmpcast = $mvPred;
  var $a = STACKTOP, $a$s2 = $a >> 2;
  STACKTOP = STACKTOP + 36 | 0;
  var $mv_sroa_0_0_copyload23 = HEAP16[$mbPred + 148 >> 1];
  var $mv_sroa_1_2_copyload33 = HEAP16[$mbPred + 150 >> 1];
  var $0 = HEAP32[$mbPred + 132 >> 2];
  var $sliceId$s2 = ($pMb + 4 | 0) >> 2;
  var $arraydecay = $a | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 200 >> 2], $arraydecay, 5);
  var $refIndex3 = $a + 4 | 0;
  if ((HEAP32[$refIndex3 >> 2] | 0) == ($0 | 0)) {
    var $5 = HEAP32[$a$s2 + 2];
    HEAP32[$mvPred$s2] = $5;
    var $_in_in = $5;
  } else {
    var $mbB = $pMb + 204 | 0;
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$mbB >> 2], $a + 12 | 0, 10);
    var $add_ptr11 = $a + 24 | 0;
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$mbB >> 2], $add_ptr11, 14);
    if ((HEAP32[$a$s2 + 6] | 0) == 0) {
      _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 212 >> 2], $add_ptr11, 15);
    }
    _GetPredictionMv($tmpcast, $arraydecay, $0);
    var $_in_in = HEAP32[$mvPred$s2];
  }
  var $_in_in;
  var $add = ($_in_in & 65535) + $mv_sroa_0_0_copyload23 & 65535;
  var $add25 = ($_in_in >>> 16 & 65535) + $mv_sroa_1_2_copyload33 & 65535;
  if ((($add << 16 >> 16) + 8192 | 0) >>> 0 > 16383) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if ((($add25 << 16 >> 16) + 2048 | 0) >>> 0 > 4095) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $call = _h264bsdGetRefPicData($dpb, $0);
  if (($call | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP16[$pMb + 176 >> 1] = $add;
  HEAP16[$pMb + 178 >> 1] = $add25;
  var $15 = $pMb + 176 | 0;
  var $16 = $pMb + 172 | 0;
  var $17 = HEAPU16[$15 >> 1] | HEAPU16[$15 + 2 >> 1] << 16;
  tempBigInt = $17;
  HEAP16[$16 >> 1] = tempBigInt & 65535;
  HEAP16[$16 + 2 >> 1] = tempBigInt >> 16;
  var $18 = $pMb + 168 | 0;
  tempBigInt = $17;
  HEAP16[$18 >> 1] = tempBigInt & 65535;
  HEAP16[$18 + 2 >> 1] = tempBigInt >> 16;
  var $19 = $pMb + 164 | 0;
  tempBigInt = $17;
  HEAP16[$19 >> 1] = tempBigInt & 65535;
  HEAP16[$19 + 2 >> 1] = tempBigInt >> 16;
  var $20 = $pMb + 144 | 0;
  tempBigInt = $17;
  HEAP16[$20 >> 1] = tempBigInt & 65535;
  HEAP16[$20 + 2 >> 1] = tempBigInt >> 16;
  var $21 = $pMb + 140 | 0;
  tempBigInt = $17;
  HEAP16[$21 >> 1] = tempBigInt & 65535;
  HEAP16[$21 + 2 >> 1] = tempBigInt >> 16;
  var $22 = $pMb + 136 | 0;
  tempBigInt = $17;
  HEAP16[$22 >> 1] = tempBigInt & 65535;
  HEAP16[$22 + 2 >> 1] = tempBigInt >> 16;
  var $23$s1 = ($pMb + 132 | 0) >> 1;
  tempBigInt = $17;
  HEAP16[$23$s1] = tempBigInt & 65535;
  HEAP16[$23$s1 + 1] = tempBigInt >> 16;
  var $arrayidx61 = $pMb + 100 | 0;
  HEAP32[$arrayidx61 >> 2] = $0;
  HEAP32[$pMb + 108 >> 2] = $0;
  HEAP32[$pMb + 116 >> 2] = $call;
  HEAP32[$pMb + 124 >> 2] = $call;
  var $mv_sroa_0_0_copyload17 = HEAP16[$mbPred + 152 >> 1];
  var $mv_sroa_1_2_copyload27 = HEAP16[$mbPred + 154 >> 1];
  var $24 = HEAP32[$mbPred + 136 >> 2];
  var $add_ptr73 = $a + 24 | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 208 >> 2], $add_ptr73, 10);
  if ((HEAP32[$a$s2 + 6] | 0) == 0) {
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 204 >> 2], $add_ptr73, 11);
  }
  if ((HEAP32[$a$s2 + 7] | 0) == ($24 | 0)) {
    var $32 = HEAP32[$a$s2 + 8];
    HEAP32[$mvPred$s2] = $32;
    var $_in87_in = $32;
  } else {
    HEAP32[$a$s2] = 1;
    HEAP32[$refIndex3 >> 2] = HEAP32[$arrayidx61 >> 2];
    HEAP32[$a$s2 + 2] = HEAPU16[$23$s1] | HEAPU16[$23$s1 + 1] << 16;
    _GetInterNeighbour(HEAP32[$sliceId$s2], HEAP32[$pMb + 204 >> 2], $a + 12 | 0, 14);
    _GetPredictionMv($tmpcast, $arraydecay, $24);
    var $_in87_in = HEAP32[$mvPred$s2];
  }
  var $_in87_in;
  var $add111 = ($_in87_in & 65535) + $mv_sroa_0_0_copyload17 & 65535;
  var $add117 = ($_in87_in >>> 16 & 65535) + $mv_sroa_1_2_copyload27 & 65535;
  if ((($add111 << 16 >> 16) + 8192 | 0) >>> 0 > 16383) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if ((($add117 << 16 >> 16) + 2048 | 0) >>> 0 > 4095) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $call133 = _h264bsdGetRefPicData($dpb, $24);
  if (($call133 | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP16[$pMb + 192 >> 1] = $add111;
  HEAP16[$pMb + 194 >> 1] = $add117;
  var $40 = $pMb + 192 | 0;
  var $41 = $pMb + 188 | 0;
  var $42 = HEAPU16[$40 >> 1] | HEAPU16[$40 + 2 >> 1] << 16;
  tempBigInt = $42;
  HEAP16[$41 >> 1] = tempBigInt & 65535;
  HEAP16[$41 + 2 >> 1] = tempBigInt >> 16;
  var $43 = $pMb + 184 | 0;
  tempBigInt = $42;
  HEAP16[$43 >> 1] = tempBigInt & 65535;
  HEAP16[$43 + 2 >> 1] = tempBigInt >> 16;
  var $44 = $pMb + 180 | 0;
  tempBigInt = $42;
  HEAP16[$44 >> 1] = tempBigInt & 65535;
  HEAP16[$44 + 2 >> 1] = tempBigInt >> 16;
  var $45 = $pMb + 160 | 0;
  tempBigInt = $42;
  HEAP16[$45 >> 1] = tempBigInt & 65535;
  HEAP16[$45 + 2 >> 1] = tempBigInt >> 16;
  var $46 = $pMb + 156 | 0;
  tempBigInt = $42;
  HEAP16[$46 >> 1] = tempBigInt & 65535;
  HEAP16[$46 + 2 >> 1] = tempBigInt >> 16;
  var $47 = $pMb + 152 | 0;
  tempBigInt = $42;
  HEAP16[$47 >> 1] = tempBigInt & 65535;
  HEAP16[$47 + 2 >> 1] = tempBigInt >> 16;
  var $48 = $pMb + 148 | 0;
  tempBigInt = $42;
  HEAP16[$48 >> 1] = tempBigInt & 65535;
  HEAP16[$48 + 2 >> 1] = tempBigInt >> 16;
  HEAP32[$pMb + 104 >> 2] = $24;
  HEAP32[$pMb + 112 >> 2] = $24;
  HEAP32[$pMb + 120 >> 2] = $call133;
  HEAP32[$pMb + 128 >> 2] = $call133;
  var $retval_0 = 0;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_MvPrediction8x16["X"] = 1;
function _MvPrediction8x8($pMb, $subMbPred, $dpb) {
  var label = 0;
  var $i_018 = 0;
  L2008 : while (1) {
    var $i_018;
    var $call = _h264bsdNumSubMbPart(HEAP32[$subMbPred + ($i_018 << 2) >> 2]);
    var $arrayidx1 = ($i_018 << 2) + $subMbPred + 16 | 0;
    HEAP32[$pMb + ($i_018 << 2) + 100 >> 2] = HEAP32[$arrayidx1 >> 2];
    var $call5 = _h264bsdGetRefPicData($dpb, HEAP32[$arrayidx1 >> 2]);
    HEAP32[$pMb + ($i_018 << 2) + 116 >> 2] = $call5;
    if (($call5 | 0) == 0) {
      var $retval_0 = 1;
      label = 1575;
      break;
    } else {
      var $j_0 = 0;
    }
    while (1) {
      var $j_0;
      if ($j_0 >>> 0 >= $call >>> 0) {
        break;
      }
      if ((_MvPrediction($pMb, $subMbPred, $i_018, $j_0) | 0) == 0) {
        var $j_0 = $j_0 + 1 | 0;
      } else {
        var $retval_0 = 1;
        label = 1577;
        break L2008;
      }
    }
    var $inc18 = $i_018 + 1 | 0;
    if ($inc18 >>> 0 < 4) {
      var $i_018 = $inc18;
    } else {
      var $retval_0 = 0;
      label = 1576;
      break;
    }
  }
  if (label == 1575) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1576) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1577) {
    var $retval_0;
    return $retval_0;
  }
}
function _MvPrediction($pMb, $subMbPred, $mbPartIdx, $subMbPartIdx) {
  var $sliceId$s2;
  var $pMb$s1 = $pMb >> 1;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 40 | 0;
  var $mvPred = __stackBase__;
  var $a = __stackBase__ + 4;
  var $mv_sroa_0_0_copyload33 = HEAP16[$subMbPred + ($mbPartIdx << 4) + ($subMbPartIdx << 2) + 32 >> 1];
  var $mv_sroa_1_2_copyload53 = HEAP16[$subMbPred + ($mbPartIdx << 4) + ($subMbPartIdx << 2) + 34 >> 1];
  var $call = _h264bsdSubMbPartMode(HEAP32[$subMbPred + ($mbPartIdx << 2) >> 2]);
  var $1 = HEAP32[$subMbPred + ($mbPartIdx << 2) + 16 >> 2];
  var $call6 = _h264bsdGetNeighbourMb($pMb, HEAP32[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5249868 >> 2]);
  var $sliceId$s2 = ($pMb + 4 | 0) >> 2;
  var $arraydecay7 = $a | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], $call6, $arraydecay7, HEAPU8[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5249872 | 0]);
  var $call13 = _h264bsdGetNeighbourMb($pMb, HEAP32[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5249164 >> 2]);
  _GetInterNeighbour(HEAP32[$sliceId$s2], $call13, $a + 12 | 0, HEAPU8[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5249168 | 0]);
  var $call24 = _h264bsdGetNeighbourMb($pMb, HEAP32[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5248460 >> 2]);
  var $add_ptr27 = $a + 24 | 0;
  _GetInterNeighbour(HEAP32[$sliceId$s2], $call24, $add_ptr27, HEAPU8[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5248464 | 0]);
  if ((HEAP32[$a + 24 >> 2] | 0) == 0) {
    var $call36 = _h264bsdGetNeighbourMb($pMb, HEAP32[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5247756 >> 2]);
    _GetInterNeighbour(HEAP32[$sliceId$s2], $call36, $add_ptr27, HEAPU8[($mbPartIdx << 7) + ($call << 5) + ($subMbPartIdx << 3) + 5247760 | 0]);
  }
  _GetPredictionMv($mvPred, $arraydecay7, $1);
  var $add = HEAP16[$mvPred >> 1] + $mv_sroa_0_0_copyload33 & 65535;
  var $add50 = HEAP16[$mvPred + 2 >> 1] + $mv_sroa_1_2_copyload53 & 65535;
  if ((($add << 16 >> 16) + 8192 | 0) >>> 0 > 16383) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if ((($add50 << 16 >> 16) + 2048 | 0) >>> 0 > 4095) {
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  if (($call | 0) == 0) {
    var $mul = $mbPartIdx << 2;
    HEAP16[(($mul << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($mul << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $add68101 = $mul | 1;
    HEAP16[(($add68101 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add68101 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $add72102 = $mul | 2;
    HEAP16[(($add72102 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add72102 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $add76103 = $mul | 3;
    HEAP16[(($add76103 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add76103 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (($call | 0) == 2) {
    var $add93 = ($mbPartIdx << 2) + $subMbPartIdx | 0;
    HEAP16[(($add93 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add93 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $add98 = $add93 + 2 | 0;
    HEAP16[(($add98 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add98 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (($call | 0) == 3) {
    var $add103 = ($mbPartIdx << 2) + $subMbPartIdx | 0;
    HEAP16[(($add103 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add103 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (($call | 0) == 1) {
    var $add82 = ($mbPartIdx << 2) + ($subMbPartIdx << 1) | 0;
    HEAP16[(($add82 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add82 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $add88100 = $add82 | 1;
    HEAP16[(($add88100 << 2) + 132 >> 1) + $pMb$s1] = $add;
    HEAP16[(($add88100 << 2) + 134 >> 1) + $pMb$s1] = $add50;
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else {
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
}
_MvPrediction["X"] = 1;
function _GetPredictionMv($mv, $a, $refIndex) {
  do {
    if ((HEAP32[$a + 12 >> 2] | 0) == 0) {
      if ((HEAP32[$a + 24 >> 2] | 0) != 0) {
        break;
      }
      if ((HEAP32[$a >> 2] | 0) == 0) {
        break;
      }
      var $21 = $a + 8 | 0;
      var $22 = $mv;
      tempBigInt = HEAPU16[$21 >> 1] | HEAPU16[$21 + 2 >> 1] << 16;
      HEAP16[$22 >> 1] = tempBigInt & 65535;
      HEAP16[$22 + 2 >> 1] = tempBigInt >> 16;
      return;
    }
  } while (0);
  var $cmp = (HEAP32[$a + 4 >> 2] | 0) == ($refIndex | 0);
  var $cmp12 = (HEAP32[$a + 16 >> 2] | 0) == ($refIndex | 0);
  if ((($cmp12 & 1) + ($cmp & 1) + ((HEAP32[$a + 28 >> 2] | 0) == ($refIndex | 0) & 1) | 0) != 1) {
    HEAP16[$mv >> 1] = _MedianFilter(HEAP16[$a + 8 >> 1] << 16 >> 16, HEAP16[$a + 20 >> 1] << 16 >> 16, HEAP16[$a + 32 >> 1] << 16 >> 16) & 65535;
    HEAP16[$mv + 2 >> 1] = _MedianFilter(HEAP16[$a + 10 >> 1] << 16 >> 16, HEAP16[$a + 22 >> 1] << 16 >> 16, HEAP16[$a + 34 >> 1] << 16 >> 16) & 65535;
    return;
  }
  if ($cmp) {
    var $12 = $a + 8 | 0;
    var $13 = $mv;
    tempBigInt = HEAPU16[$12 >> 1] | HEAPU16[$12 + 2 >> 1] << 16;
    HEAP16[$13 >> 1] = tempBigInt & 65535;
    HEAP16[$13 + 2 >> 1] = tempBigInt >> 16;
    return;
  }
  if ($cmp12) {
    var $15 = $a + 20 | 0;
    var $16 = $mv;
    tempBigInt = HEAPU16[$15 >> 1] | HEAPU16[$15 + 2 >> 1] << 16;
    HEAP16[$16 >> 1] = tempBigInt & 65535;
    HEAP16[$16 + 2 >> 1] = tempBigInt >> 16;
    return;
  } else {
    var $18 = $a + 32 | 0;
    var $19 = $mv;
    tempBigInt = HEAPU16[$18 >> 1] | HEAPU16[$18 + 2 >> 1] << 16;
    HEAP16[$19 >> 1] = tempBigInt & 65535;
    HEAP16[$19 + 2 >> 1] = tempBigInt >> 16;
    return;
  }
}
_GetPredictionMv["X"] = 1;
function _h264bsdInterpolateChromaHor($pRef, $predPartChroma, $x0, $y0, $width, $height, $xFrac, $chromaPartWidth, $chromaPartHeight) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 144 | 0;
  var $block = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1615;
    } else {
      if (($chromaPartWidth + ($x0 + 1) | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1615;
        break;
      }
      if (($chromaPartHeight + $y0 | 0) >>> 0 > $height >>> 0) {
        label = 1615;
        break;
      } else {
        var $pRef_addr_0 = $pRef;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        var $height_addr_0 = $height;
        break;
      }
    }
  } while (0);
  if (label == 1615) {
    var $arraydecay = $block | 0;
    var $add8 = $chromaPartWidth + 1 | 0;
    _h264bsdFillBlock($pRef, $arraydecay, $x0, $y0, $width, $height, $add8, $chromaPartHeight, $add8);
    _h264bsdFillBlock($pRef + ($height * $width & -1) | 0, $block + ($add8 * $chromaPartHeight & -1) | 0, $x0, $y0, $width, $height, $add8, $chromaPartHeight, $add8);
    var $pRef_addr_0 = $arraydecay;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add8;
    var $height_addr_0 = $chromaPartHeight;
  }
  var $height_addr_0;
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $pRef_addr_0;
  var $sub = 8 - $xFrac | 0;
  var $shr = $chromaPartHeight >>> 1;
  var $shr29 = $chromaPartWidth >>> 1;
  var $tobool3171 = ($shr29 | 0) == 0;
  var $sub72 = 16 - $chromaPartWidth | 0;
  var $sub75 = ($width_addr_0 << 1) - $chromaPartWidth | 0;
  var $incdec_ptr_sum = $width_addr_0 + 1 | 0;
  var $incdec_ptr36_sum = $width_addr_0 + 2 | 0;
  var $0 = $shr29 << 1;
  if (($shr | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $y_077 = $shr;
  var $ptrA_078 = $pRef_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) + $x0_addr_0 | 0;
  var $cbr_079 = $predPartChroma;
  while (1) {
    var $cbr_079;
    var $ptrA_078;
    var $y_077;
    if ($tobool3171) {
      var $ptrA_1_lcssa = $ptrA_078;
      var $cbr_1_lcssa = $cbr_079;
    } else {
      var $scevgep = $cbr_079 + $0 | 0;
      var $x_072 = $shr29;
      var $ptrA_173 = $ptrA_078;
      var $cbr_174 = $cbr_079;
      while (1) {
        var $cbr_174;
        var $ptrA_173;
        var $x_072;
        var $conv33 = HEAPU8[$ptrA_173];
        var $conv35 = HEAPU8[$ptrA_173 + $incdec_ptr_sum | 0];
        var $incdec_ptr36 = $ptrA_173 + 2 | 0;
        var $conv37 = HEAPU8[$ptrA_173 + 1 | 0];
        HEAP8[$cbr_174 + 8 | 0] = ((($conv35 * $xFrac & -1) + (HEAPU8[$ptrA_173 + $width_addr_0 | 0] * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_174] = ((($conv37 * $xFrac & -1) + ($conv33 * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $conv55 = HEAPU8[$incdec_ptr36];
        HEAP8[$cbr_174 + 9 | 0] = (((HEAPU8[$ptrA_173 + $incdec_ptr36_sum | 0] * $xFrac & -1) + ($conv35 * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_174 + 1 | 0] = ((($conv55 * $xFrac & -1) + ($conv37 * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $dec = $x_072 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $x_072 = $dec;
          var $ptrA_173 = $incdec_ptr36;
          var $cbr_174 = $cbr_174 + 2 | 0;
        }
      }
      var $ptrA_1_lcssa = $ptrA_078 + $0 | 0;
      var $cbr_1_lcssa = $scevgep;
    }
    var $cbr_1_lcssa;
    var $ptrA_1_lcssa;
    var $dec78 = $y_077 - 1 | 0;
    if (($dec78 | 0) == 0) {
      break;
    } else {
      var $y_077 = $dec78;
      var $ptrA_078 = $ptrA_1_lcssa + $sub75 | 0;
      var $cbr_079 = $cbr_1_lcssa + $sub72 | 0;
    }
  }
  var $y_077_1 = $shr;
  var $ptrA_078_1 = $pRef_addr_0 + (($height_addr_0 + $y0_addr_0) * $width_addr_0 & -1) + $x0_addr_0 | 0;
  var $cbr_079_1 = $predPartChroma + 64 | 0;
  while (1) {
    var $cbr_079_1;
    var $ptrA_078_1;
    var $y_077_1;
    if ($tobool3171) {
      var $ptrA_1_lcssa_1 = $ptrA_078_1;
      var $cbr_1_lcssa_1 = $cbr_079_1;
    } else {
      var $scevgep_1 = $cbr_079_1 + $0 | 0;
      var $x_072_1 = $shr29;
      var $ptrA_173_1 = $ptrA_078_1;
      var $cbr_174_1 = $cbr_079_1;
      while (1) {
        var $cbr_174_1;
        var $ptrA_173_1;
        var $x_072_1;
        var $conv33_1 = HEAPU8[$ptrA_173_1];
        var $conv35_1 = HEAPU8[$ptrA_173_1 + $incdec_ptr_sum | 0];
        var $incdec_ptr36_1 = $ptrA_173_1 + 2 | 0;
        var $conv37_1 = HEAPU8[$ptrA_173_1 + 1 | 0];
        HEAP8[$cbr_174_1 + 8 | 0] = ((($conv35_1 * $xFrac & -1) + (HEAPU8[$ptrA_173_1 + $width_addr_0 | 0] * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_174_1] = ((($conv37_1 * $xFrac & -1) + ($conv33_1 * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $conv55_1 = HEAPU8[$incdec_ptr36_1];
        HEAP8[$cbr_174_1 + 9 | 0] = (((HEAPU8[$ptrA_173_1 + $incdec_ptr36_sum | 0] * $xFrac & -1) + ($conv35_1 * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_174_1 + 1 | 0] = ((($conv55_1 * $xFrac & -1) + ($conv37_1 * $sub & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $dec_1 = $x_072_1 - 1 | 0;
        if (($dec_1 | 0) == 0) {
          break;
        } else {
          var $x_072_1 = $dec_1;
          var $ptrA_173_1 = $incdec_ptr36_1;
          var $cbr_174_1 = $cbr_174_1 + 2 | 0;
        }
      }
      var $ptrA_1_lcssa_1 = $ptrA_078_1 + $0 | 0;
      var $cbr_1_lcssa_1 = $scevgep_1;
    }
    var $cbr_1_lcssa_1;
    var $ptrA_1_lcssa_1;
    var $dec78_1 = $y_077_1 - 1 | 0;
    if (($dec78_1 | 0) == 0) {
      break;
    } else {
      var $y_077_1 = $dec78_1;
      var $ptrA_078_1 = $ptrA_1_lcssa_1 + $sub75 | 0;
      var $cbr_079_1 = $cbr_1_lcssa_1 + $sub72 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateChromaHor["X"] = 1;
function _h264bsdFillBlock($ref, $fill, $x0, $y0, $width, $height, $blockWidth, $blockHeight, $fillScanLength) {
  var $add = $blockWidth + $x0 | 0;
  var $add1 = $blockHeight + $y0 | 0;
  var $fp_0 = ($x0 | 0) < 0 | ($add | 0) > ($width | 0) ? 2 : 4;
  var $sub_y0 = ($add1 | 0) < 0 ? -$blockHeight | 0 : $y0;
  var $x0_addr_0 = ($add | 0) < 0 ? -$blockWidth | 0 : $x0;
  var $height_sub_y0 = ($sub_y0 | 0) > ($height | 0) ? $height : $sub_y0;
  var $x0_addr_1 = ($x0_addr_0 | 0) > ($width | 0) ? $width : $x0_addr_0;
  var $add16 = $x0_addr_1 + $blockWidth | 0;
  var $add17 = $height_sub_y0 + $blockHeight | 0;
  if (($x0_addr_1 | 0) > 0) {
    var $ref_addr_0 = $ref + $x0_addr_1 | 0;
  } else {
    var $ref_addr_0 = $ref;
  }
  var $ref_addr_0;
  if (($height_sub_y0 | 0) > 0) {
    var $ref_addr_1 = $ref_addr_0 + ($height_sub_y0 * $width & -1) | 0;
  } else {
    var $ref_addr_1 = $ref_addr_0;
  }
  var $ref_addr_1;
  var $sub26_ = ($x0_addr_1 | 0) < 0 ? -$x0_addr_1 | 0 : 0;
  var $cond32 = ($add16 | 0) > ($width | 0) ? $add16 - $width | 0 : 0;
  var $sub34 = $blockWidth - $sub26_ - $cond32 | 0;
  var $sub37_ = ($height_sub_y0 | 0) < 0 ? -$height_sub_y0 | 0 : 0;
  var $cond46 = ($add17 | 0) > ($height | 0) ? $add17 - $height | 0 : 0;
  var $sub47 = $blockHeight - $sub37_ | 0;
  var $sub48 = $sub47 - $cond46 | 0;
  if (($sub37_ | 0) == 0) {
    var $fill_addr_0_lcssa = $fill;
  } else {
    var $0 = $height ^ -1;
    var $3 = $blockHeight - 1 - (($add1 | 0) > 0 ? $add1 : 0) | 0;
    var $smax80 = ($3 | 0) < ($0 | 0) ? $0 : $3;
    var $5 = $smax80 ^ -1;
    var $9 = ($smax80 + (($5 | 0) > 0 ? $5 : 0) + 1) * $fillScanLength & -1;
    var $fill_addr_072 = $fill;
    var $top_073 = $sub37_;
    while (1) {
      var $top_073;
      var $fill_addr_072;
      FUNCTION_TABLE[$fp_0]($ref_addr_1, $fill_addr_072, $sub26_, $sub34, $cond32);
      var $dec = $top_073 - 1 | 0;
      if (($dec | 0) == 0) {
        break;
      } else {
        var $fill_addr_072 = $fill_addr_072 + $fillScanLength | 0;
        var $top_073 = $dec;
      }
    }
    var $fill_addr_0_lcssa = $fill + $9 | 0;
  }
  var $fill_addr_0_lcssa;
  if (($sub47 | 0) == ($cond46 | 0)) {
    var $fill_addr_1_lcssa = $fill_addr_0_lcssa;
    var $ref_addr_2_lcssa = $ref_addr_1;
  } else {
    var $12 = $blockHeight - 1 | 0;
    var $13 = $height ^ -1;
    var $15 = $12 - (($add1 | 0) > 0 ? $add1 : 0) | 0;
    var $smax75 = ($15 | 0) < ($13 | 0) ? $13 : $15;
    var $17 = $12 - $smax75 | 0;
    var $21 = $smax75 ^ -1;
    var $23 = $blockHeight + $height - 1 - (($17 | 0) < ($height | 0) ? $height : $17) - $smax75 - (($21 | 0) > 0 ? $21 : 0) | 0;
    var $24 = $23 * $fillScanLength & -1;
    var $25 = $23 * $width & -1;
    var $fill_addr_167 = $fill_addr_0_lcssa;
    var $ref_addr_268 = $ref_addr_1;
    var $y_069 = $sub48;
    while (1) {
      var $y_069;
      var $ref_addr_268;
      var $fill_addr_167;
      FUNCTION_TABLE[$fp_0]($ref_addr_268, $fill_addr_167, $sub26_, $sub34, $cond32);
      var $dec56 = $y_069 - 1 | 0;
      if (($dec56 | 0) == 0) {
        break;
      } else {
        var $fill_addr_167 = $fill_addr_167 + $fillScanLength | 0;
        var $ref_addr_268 = $ref_addr_268 + $width | 0;
        var $y_069 = $dec56;
      }
    }
    var $fill_addr_1_lcssa = $fill_addr_0_lcssa + $24 | 0;
    var $ref_addr_2_lcssa = $ref_addr_1 + $25 | 0;
  }
  var $ref_addr_2_lcssa;
  var $fill_addr_1_lcssa;
  var $add_ptr58 = $ref_addr_2_lcssa + -$width | 0;
  if (($cond46 | 0) == 0) {
    return;
  } else {
    var $fill_addr_264 = $fill_addr_1_lcssa;
    var $bottom_065 = $cond46;
  }
  while (1) {
    var $bottom_065;
    var $fill_addr_264;
    FUNCTION_TABLE[$fp_0]($add_ptr58, $fill_addr_264, $sub26_, $sub34, $cond32);
    var $dec64 = $bottom_065 - 1 | 0;
    if (($dec64 | 0) == 0) {
      break;
    } else {
      var $fill_addr_264 = $fill_addr_264 + $fillScanLength | 0;
      var $bottom_065 = $dec64;
    }
  }
  return;
}
_h264bsdFillBlock["X"] = 1;
function _h264bsdInterpolateChromaVer($pRef, $predPartChroma, $x0, $y0, $width, $height, $yFrac, $chromaPartWidth, $chromaPartHeight) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 144 | 0;
  var $block = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1652;
    } else {
      if (($chromaPartWidth + $x0 | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1652;
        break;
      }
      if (($chromaPartHeight + ($y0 + 1) | 0) >>> 0 > $height >>> 0) {
        label = 1652;
        break;
      } else {
        var $pRef_addr_0 = $pRef;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        var $height_addr_0 = $height;
        break;
      }
    }
  } while (0);
  if (label == 1652) {
    var $arraydecay = $block | 0;
    var $add8 = $chromaPartHeight + 1 | 0;
    _h264bsdFillBlock($pRef, $arraydecay, $x0, $y0, $width, $height, $chromaPartWidth, $add8, $chromaPartWidth);
    _h264bsdFillBlock($pRef + ($height * $width & -1) | 0, $block + ($add8 * $chromaPartWidth & -1) | 0, $x0, $y0, $width, $height, $chromaPartWidth, $add8, $chromaPartWidth);
    var $pRef_addr_0 = $arraydecay;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $chromaPartWidth;
    var $height_addr_0 = $add8;
  }
  var $height_addr_0;
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $pRef_addr_0;
  var $sub = 8 - $yFrac | 0;
  var $shr = $chromaPartHeight >>> 1;
  var $shr27 = $chromaPartWidth >>> 1;
  var $tobool2974 = ($shr27 | 0) == 0;
  var $sub73 = 16 - $chromaPartWidth | 0;
  var $mul75 = $width_addr_0 << 1;
  var $sub76 = $mul75 - $chromaPartWidth | 0;
  var $incdec_ptr_sum73 = $mul75 | 1;
  var $incdec_ptr_sum = $width_addr_0 + 1 | 0;
  var $0 = $shr27 << 1;
  if (($shr | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $y_080 = $shr;
  var $ptrA_081 = $pRef_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) + $x0_addr_0 | 0;
  var $cbr_082 = $predPartChroma;
  while (1) {
    var $cbr_082;
    var $ptrA_081;
    var $y_080;
    if ($tobool2974) {
      var $ptrA_1_lcssa = $ptrA_081;
      var $cbr_1_lcssa = $cbr_082;
    } else {
      var $scevgep = $cbr_082 + $0 | 0;
      var $x_075 = $shr27;
      var $ptrA_176 = $ptrA_081;
      var $cbr_177 = $cbr_082;
      while (1) {
        var $cbr_177;
        var $ptrA_176;
        var $x_075;
        var $conv33 = HEAPU8[$ptrA_176 + $width_addr_0 | 0];
        var $conv34 = HEAPU8[$ptrA_176];
        HEAP8[$cbr_177 + 8 | 0] = ((($conv33 * $sub & -1) + (HEAPU8[$ptrA_176 + $mul75 | 0] * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_177] = ((($conv34 * $sub & -1) + ($conv33 * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $conv54 = HEAPU8[$ptrA_176 + $incdec_ptr_sum | 0];
        var $conv56 = HEAPU8[$ptrA_176 + 1 | 0];
        HEAP8[$cbr_177 + 9 | 0] = ((($conv54 * $sub & -1) + (HEAPU8[$ptrA_176 + $incdec_ptr_sum73 | 0] * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_177 + 1 | 0] = ((($conv56 * $sub & -1) + ($conv54 * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $dec = $x_075 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $x_075 = $dec;
          var $ptrA_176 = $ptrA_176 + 2 | 0;
          var $cbr_177 = $cbr_177 + 2 | 0;
        }
      }
      var $ptrA_1_lcssa = $ptrA_081 + $0 | 0;
      var $cbr_1_lcssa = $scevgep;
    }
    var $cbr_1_lcssa;
    var $ptrA_1_lcssa;
    var $dec79 = $y_080 - 1 | 0;
    if (($dec79 | 0) == 0) {
      break;
    } else {
      var $y_080 = $dec79;
      var $ptrA_081 = $ptrA_1_lcssa + $sub76 | 0;
      var $cbr_082 = $cbr_1_lcssa + $sub73 | 0;
    }
  }
  var $y_080_1 = $shr;
  var $ptrA_081_1 = $pRef_addr_0 + (($height_addr_0 + $y0_addr_0) * $width_addr_0 & -1) + $x0_addr_0 | 0;
  var $cbr_082_1 = $predPartChroma + 64 | 0;
  while (1) {
    var $cbr_082_1;
    var $ptrA_081_1;
    var $y_080_1;
    if ($tobool2974) {
      var $ptrA_1_lcssa_1 = $ptrA_081_1;
      var $cbr_1_lcssa_1 = $cbr_082_1;
    } else {
      var $scevgep_1 = $cbr_082_1 + $0 | 0;
      var $x_075_1 = $shr27;
      var $ptrA_176_1 = $ptrA_081_1;
      var $cbr_177_1 = $cbr_082_1;
      while (1) {
        var $cbr_177_1;
        var $ptrA_176_1;
        var $x_075_1;
        var $conv33_1 = HEAPU8[$ptrA_176_1 + $width_addr_0 | 0];
        var $conv34_1 = HEAPU8[$ptrA_176_1];
        HEAP8[$cbr_177_1 + 8 | 0] = ((($conv33_1 * $sub & -1) + (HEAPU8[$ptrA_176_1 + $mul75 | 0] * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_177_1] = ((($conv34_1 * $sub & -1) + ($conv33_1 * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $conv54_1 = HEAPU8[$ptrA_176_1 + $incdec_ptr_sum | 0];
        var $conv56_1 = HEAPU8[$ptrA_176_1 + 1 | 0];
        HEAP8[$cbr_177_1 + 9 | 0] = ((($conv54_1 * $sub & -1) + (HEAPU8[$ptrA_176_1 + $incdec_ptr_sum73 | 0] * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        HEAP8[$cbr_177_1 + 1 | 0] = ((($conv56_1 * $sub & -1) + ($conv54_1 * $yFrac & -1) << 3) + 32 | 0) >>> 6 & 255;
        var $dec_1 = $x_075_1 - 1 | 0;
        if (($dec_1 | 0) == 0) {
          break;
        } else {
          var $x_075_1 = $dec_1;
          var $ptrA_176_1 = $ptrA_176_1 + 2 | 0;
          var $cbr_177_1 = $cbr_177_1 + 2 | 0;
        }
      }
      var $ptrA_1_lcssa_1 = $ptrA_081_1 + $0 | 0;
      var $cbr_1_lcssa_1 = $scevgep_1;
    }
    var $cbr_1_lcssa_1;
    var $ptrA_1_lcssa_1;
    var $dec79_1 = $y_080_1 - 1 | 0;
    if (($dec79_1 | 0) == 0) {
      break;
    } else {
      var $y_080_1 = $dec79_1;
      var $ptrA_081_1 = $ptrA_1_lcssa_1 + $sub76 | 0;
      var $cbr_082_1 = $cbr_1_lcssa_1 + $sub73 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateChromaVer["X"] = 1;
function _h264bsdInterpolateChromaHorVer($ref, $predPartChroma, $x0, $y0, $width, $height, $xFrac, $yFrac, $chromaPartWidth, $chromaPartHeight) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 164 | 0;
  var $block = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1672;
    } else {
      if (($chromaPartWidth + ($x0 + 1) | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1672;
        break;
      }
      if (($chromaPartHeight + ($y0 + 1) | 0) >>> 0 > $height >>> 0) {
        label = 1672;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        var $height_addr_0 = $height;
        break;
      }
    }
  } while (0);
  if (label == 1672) {
    var $arraydecay = $block | 0;
    var $add9 = $chromaPartWidth + 1 | 0;
    var $add10 = $chromaPartHeight + 1 | 0;
    _h264bsdFillBlock($ref, $arraydecay, $x0, $y0, $width, $height, $add9, $add10, $add9);
    _h264bsdFillBlock($ref + ($height * $width & -1) | 0, $block + ($add10 * $add9 & -1) | 0, $x0, $y0, $width, $height, $add9, $add10, $add9);
    var $ref_addr_0 = $arraydecay;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add9;
    var $height_addr_0 = $add10;
  }
  var $height_addr_0;
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  var $sub = 8 - $xFrac | 0;
  var $sub23 = 8 - $yFrac | 0;
  var $shr = $chromaPartHeight >>> 1;
  var $tobool122 = ($shr | 0) == 0;
  var $mul36 = $width_addr_0 << 1;
  var $shr45 = $chromaPartWidth >>> 1;
  var $tobool47115 = ($shr45 | 0) == 0;
  var $sub102 = 16 - $chromaPartWidth | 0;
  var $sub105 = $mul36 - $chromaPartWidth | 0;
  var $incdec_ptr_sum = $width_addr_0 + 1 | 0;
  var $incdec_ptr_sum112113 = $mul36 | 1;
  var $incdec_ptr75_sum = $width_addr_0 + 2 | 0;
  var $incdec_ptr75_sum114 = $mul36 + 2 | 0;
  var $0 = $shr45 << 1;
  var $comp_0126 = 0;
  while (1) {
    var $comp_0126;
    L2147 : do {
      if (!$tobool122) {
        var $y_0123 = $shr;
        var $ptrA_0124 = $ref_addr_0 + ((($comp_0126 * $height_addr_0 & -1) + $y0_addr_0) * $width_addr_0 & -1) + $x0_addr_0 | 0;
        var $cbr_0125 = ($comp_0126 << 6) + $predPartChroma | 0;
        while (1) {
          var $cbr_0125;
          var $ptrA_0124;
          var $y_0123;
          var $conv35 = HEAPU8[$ptrA_0124 + $width_addr_0 | 0];
          if ($tobool47115) {
            var $ptrA_1_lcssa = $ptrA_0124;
            var $cbr_1_lcssa = $cbr_0125;
          } else {
            var $scevgep = $cbr_0125 + $0 | 0;
            var $tmp1_0116 = ($conv35 * $yFrac & -1) + (HEAPU8[$ptrA_0124] * $sub23 & -1) | 0;
            var $x_0117 = $shr45;
            var $tmp3_0118 = (HEAPU8[$ptrA_0124 + $mul36 | 0] * $yFrac & -1) + ($conv35 * $sub23 & -1) | 0;
            var $ptrA_1119 = $ptrA_0124;
            var $cbr_1120 = $cbr_0125;
            while (1) {
              var $cbr_1120;
              var $ptrA_1119;
              var $tmp3_0118;
              var $x_0117;
              var $tmp1_0116;
              var $conv51 = HEAPU8[$ptrA_1119 + $incdec_ptr_sum | 0];
              var $add57 = ($conv51 * $yFrac & -1) + (HEAPU8[$ptrA_1119 + 1 | 0] * $sub23 & -1) | 0;
              var $add60 = (HEAPU8[$ptrA_1119 + $incdec_ptr_sum112113 | 0] * $yFrac & -1) + ($conv51 * $sub23 & -1) | 0;
              HEAP8[$cbr_1120 + 8 | 0] = (($tmp3_0118 * $sub & -1) + ($add60 * $xFrac & -1) + 32 | 0) >>> 6 & 255;
              HEAP8[$cbr_1120] = (($tmp1_0116 * $sub & -1) + ($add57 * $xFrac & -1) + 32 | 0) >>> 6 & 255;
              var $incdec_ptr75 = $ptrA_1119 + 2 | 0;
              var $conv78 = HEAPU8[$ptrA_1119 + $incdec_ptr75_sum | 0];
              var $add84 = ($conv78 * $yFrac & -1) + (HEAPU8[$incdec_ptr75] * $sub23 & -1) | 0;
              var $add87 = (HEAPU8[$ptrA_1119 + $incdec_ptr75_sum114 | 0] * $yFrac & -1) + ($conv78 * $sub23 & -1) | 0;
              HEAP8[$cbr_1120 + 9 | 0] = (($add60 * $sub & -1) + ($add87 * $xFrac & -1) + 32 | 0) >>> 6 & 255;
              HEAP8[$cbr_1120 + 1 | 0] = (($add57 * $sub & -1) + ($add84 * $xFrac & -1) + 32 | 0) >>> 6 & 255;
              var $dec = $x_0117 - 1 | 0;
              if (($dec | 0) == 0) {
                break;
              } else {
                var $tmp1_0116 = $add84;
                var $x_0117 = $dec;
                var $tmp3_0118 = $add87;
                var $ptrA_1119 = $incdec_ptr75;
                var $cbr_1120 = $cbr_1120 + 2 | 0;
              }
            }
            var $ptrA_1_lcssa = $ptrA_0124 + $0 | 0;
            var $cbr_1_lcssa = $scevgep;
          }
          var $cbr_1_lcssa;
          var $ptrA_1_lcssa;
          var $dec108 = $y_0123 - 1 | 0;
          if (($dec108 | 0) == 0) {
            break L2147;
          } else {
            var $y_0123 = $dec108;
            var $ptrA_0124 = $ptrA_1_lcssa + $sub105 | 0;
            var $cbr_0125 = $cbr_1_lcssa + $sub102 | 0;
          }
        }
      }
    } while (0);
    var $inc = $comp_0126 + 1 | 0;
    if (($inc | 0) == 2) {
      break;
    } else {
      var $comp_0126 = $inc;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateChromaHorVer["X"] = 1;
function _h264bsdInterpolateVerHalf($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 444 | 0;
  var $p1 = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1686;
    } else {
      if (($partWidth + $x0 | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1686;
        break;
      }
      if (($partHeight + ($y0 + 5) | 0) >>> 0 > $height >>> 0) {
        label = 1686;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        break;
      }
    }
  } while (0);
  if (label == 1686) {
    var $0 = $p1;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $partWidth, $partHeight + 5 | 0, $partWidth);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $partWidth;
  }
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  var $add_ptr_sum = $x0_addr_0 + $width_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) | 0;
  var $shr = $partHeight >>> 2;
  if (($shr | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $tobool15122 = ($partWidth | 0) == 0;
  var $sub101 = ($width_addr_0 << 2) - $partWidth | 0;
  var $sub106 = 64 - $partWidth | 0;
  var $sub = -$width_addr_0 | 0;
  var $mul17 = $sub << 1;
  var $mul23 = $width_addr_0 << 1;
  var $i_0130 = $shr;
  var $mb_addr_0131 = $mb;
  var $ptrC_0132 = $ref_addr_0 + $add_ptr_sum | 0;
  var $ptrV_0133 = $ref_addr_0 + $add_ptr_sum + ($width_addr_0 * 5 & -1) | 0;
  while (1) {
    var $ptrV_0133;
    var $ptrC_0132;
    var $mb_addr_0131;
    var $i_0130;
    if ($tobool15122) {
      var $mb_addr_1_lcssa = $mb_addr_0131;
      var $ptrC_1_lcssa = $ptrC_0132;
      var $ptrV_1_lcssa = $ptrV_0133;
    } else {
      var $scevgep134 = $mb_addr_0131 + $partWidth | 0;
      var $j_0123 = $partWidth;
      var $mb_addr_1124 = $mb_addr_0131;
      var $ptrC_1125 = $ptrC_0132;
      var $ptrV_1126 = $ptrV_0133;
      while (1) {
        var $ptrV_1126;
        var $ptrC_1125;
        var $mb_addr_1124;
        var $j_0123;
        var $conv = HEAPU8[$ptrV_1126 + $mul17 | 0];
        var $conv20 = HEAPU8[$ptrV_1126 + $sub | 0];
        var $conv22 = HEAPU8[$ptrV_1126 + $width_addr_0 | 0];
        var $conv26 = HEAPU8[$ptrV_1126];
        var $add27 = $conv22 + $conv | 0;
        var $conv34 = HEAPU8[$ptrC_1125 + $mul23 | 0];
        HEAP8[$mb_addr_1124 + 48 | 0] = HEAP8[(HEAPU8[$ptrV_1126 + $mul23 | 0] + 16 - $add27 - ($add27 << 2) + $conv34 + (($conv26 + $conv20) * 20 & -1) >> 5) + 5244712 | 0];
        var $add46 = $conv34 + $conv26 | 0;
        var $conv52 = HEAPU8[$ptrC_1125 + $width_addr_0 | 0];
        HEAP8[$mb_addr_1124 + 32 | 0] = HEAP8[($conv22 + 16 - $add46 - ($add46 << 2) + $conv52 + (($conv20 + $conv) * 20 & -1) >> 5) + 5244712 | 0];
        var $add64 = $conv52 + $conv20 | 0;
        var $conv69 = HEAPU8[$ptrC_1125];
        HEAP8[$mb_addr_1124 + 16 | 0] = HEAP8[($conv26 + 16 - $add64 - ($add64 << 2) + $conv69 + (($conv34 + $conv) * 20 & -1) >> 5) + 5244712 | 0];
        var $add81 = $conv69 + $conv | 0;
        HEAP8[$mb_addr_1124] = HEAP8[($conv20 + 16 - $add81 - ($add81 << 2) + HEAPU8[$ptrC_1125 + $sub | 0] + (($conv52 + $conv34) * 20 & -1) >> 5) + 5244712 | 0];
        var $dec = $j_0123 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $j_0123 = $dec;
          var $mb_addr_1124 = $mb_addr_1124 + 1 | 0;
          var $ptrC_1125 = $ptrC_1125 + 1 | 0;
          var $ptrV_1126 = $ptrV_1126 + 1 | 0;
        }
      }
      var $mb_addr_1_lcssa = $scevgep134;
      var $ptrC_1_lcssa = $ptrC_0132 + $partWidth | 0;
      var $ptrV_1_lcssa = $ptrV_0133 + $partWidth | 0;
    }
    var $ptrV_1_lcssa;
    var $ptrC_1_lcssa;
    var $mb_addr_1_lcssa;
    var $dec109 = $i_0130 - 1 | 0;
    if (($dec109 | 0) == 0) {
      break;
    } else {
      var $i_0130 = $dec109;
      var $mb_addr_0131 = $mb_addr_1_lcssa + $sub106 | 0;
      var $ptrC_0132 = $ptrC_1_lcssa + $sub101 | 0;
      var $ptrV_0133 = $ptrV_1_lcssa + $sub101 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateVerHalf["X"] = 1;
function _h264bsdInterpolateVerQuarter($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight, $verOffset) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 444 | 0;
  var $p1 = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1700;
    } else {
      if (($partWidth + $x0 | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1700;
        break;
      }
      if (($partHeight + ($y0 + 5) | 0) >>> 0 > $height >>> 0) {
        label = 1700;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        break;
      }
    }
  } while (0);
  if (label == 1700) {
    var $0 = $p1;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $partWidth, $partHeight + 5 | 0, $partWidth);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $partWidth;
  }
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  var $add_ptr_sum = $x0_addr_0 + $width_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) | 0;
  var $shr = $partHeight >>> 2;
  if (($shr | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $tobool18143 = ($partWidth | 0) == 0;
  var $sub125 = ($width_addr_0 << 2) - $partWidth | 0;
  var $sub133 = 64 - $partWidth | 0;
  var $sub = -$width_addr_0 | 0;
  var $mul20 = $sub << 1;
  var $mul26 = $width_addr_0 << 1;
  var $i_0153 = $shr;
  var $mb_addr_0154 = $mb;
  var $ptrC_0155 = $ref_addr_0 + $add_ptr_sum | 0;
  var $ptrV_0156 = $ref_addr_0 + $add_ptr_sum + ($width_addr_0 * 5 & -1) | 0;
  var $ptrInt_0157 = $ref_addr_0 + $add_ptr_sum + ($width_addr_0 * ($verOffset + 2) & -1) | 0;
  while (1) {
    var $ptrInt_0157;
    var $ptrV_0156;
    var $ptrC_0155;
    var $mb_addr_0154;
    var $i_0153;
    if ($tobool18143) {
      var $mb_addr_1_lcssa = $mb_addr_0154;
      var $ptrC_1_lcssa = $ptrC_0155;
      var $ptrV_1_lcssa = $ptrV_0156;
      var $ptrInt_1_lcssa = $ptrInt_0157;
    } else {
      var $scevgep = $ptrInt_0157 + $partWidth | 0;
      var $scevgep159 = $mb_addr_0154 + $partWidth | 0;
      var $j_0144 = $partWidth;
      var $mb_addr_1145 = $mb_addr_0154;
      var $ptrC_1146 = $ptrC_0155;
      var $ptrV_1147 = $ptrV_0156;
      var $ptrInt_1148 = $ptrInt_0157;
      while (1) {
        var $ptrInt_1148;
        var $ptrV_1147;
        var $ptrC_1146;
        var $mb_addr_1145;
        var $j_0144;
        var $conv = HEAPU8[$ptrV_1147 + $mul20 | 0];
        var $conv23 = HEAPU8[$ptrV_1147 + $sub | 0];
        var $conv25 = HEAPU8[$ptrV_1147 + $width_addr_0 | 0];
        var $conv29 = HEAPU8[$ptrV_1147];
        var $add30 = $conv25 + $conv | 0;
        var $conv37 = HEAPU8[$ptrC_1146 + $mul26 | 0];
        HEAP8[$mb_addr_1145 + 48 | 0] = (HEAPU8[(HEAPU8[$ptrV_1147 + $mul26 | 0] + 16 - $add30 - ($add30 << 2) + $conv37 + (($conv29 + $conv23) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$ptrInt_1148 + $mul26 | 0] + 1 | 0) >>> 1 & 255;
        var $add54 = $conv37 + $conv29 | 0;
        var $conv60 = HEAPU8[$ptrC_1146 + $width_addr_0 | 0];
        HEAP8[$mb_addr_1145 + 32 | 0] = (HEAPU8[($conv25 + 16 - $add54 - ($add54 << 2) + $conv60 + (($conv23 + $conv) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$ptrInt_1148 + $width_addr_0 | 0] + 1 | 0) >>> 1 & 255;
        var $add77 = $conv60 + $conv23 | 0;
        var $conv82 = HEAPU8[$ptrC_1146];
        HEAP8[$mb_addr_1145 + 16 | 0] = (HEAPU8[($conv29 + 16 - $add77 - ($add77 << 2) + $conv82 + (($conv37 + $conv) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$ptrInt_1148] + 1 | 0) >>> 1 & 255;
        var $add98 = $conv82 + $conv | 0;
        HEAP8[$mb_addr_1145] = (HEAPU8[($conv23 + 16 - $add98 - ($add98 << 2) + HEAPU8[$ptrC_1146 + $sub | 0] + (($conv60 + $conv37) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$ptrInt_1148 + $sub | 0] + 1 | 0) >>> 1 & 255;
        var $dec = $j_0144 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $j_0144 = $dec;
          var $mb_addr_1145 = $mb_addr_1145 + 1 | 0;
          var $ptrC_1146 = $ptrC_1146 + 1 | 0;
          var $ptrV_1147 = $ptrV_1147 + 1 | 0;
          var $ptrInt_1148 = $ptrInt_1148 + 1 | 0;
        }
      }
      var $mb_addr_1_lcssa = $scevgep159;
      var $ptrC_1_lcssa = $ptrC_0155 + $partWidth | 0;
      var $ptrV_1_lcssa = $ptrV_0156 + $partWidth | 0;
      var $ptrInt_1_lcssa = $scevgep;
    }
    var $ptrInt_1_lcssa;
    var $ptrV_1_lcssa;
    var $ptrC_1_lcssa;
    var $mb_addr_1_lcssa;
    var $dec136 = $i_0153 - 1 | 0;
    if (($dec136 | 0) == 0) {
      break;
    } else {
      var $i_0153 = $dec136;
      var $mb_addr_0154 = $mb_addr_1_lcssa + $sub133 | 0;
      var $ptrC_0155 = $ptrC_1_lcssa + $sub125 | 0;
      var $ptrV_0156 = $ptrV_1_lcssa + $sub125 | 0;
      var $ptrInt_0157 = $ptrInt_1_lcssa + $sub125 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateVerQuarter["X"] = 1;
function _h264bsdInterpolateHorHalf($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 444 | 0;
  var $p1 = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1714;
    } else {
      if (($partWidth + ($x0 + 5) | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1714;
        break;
      }
      if (($partHeight + $y0 | 0) >>> 0 > $height >>> 0) {
        label = 1714;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        break;
      }
    }
  } while (0);
  if (label == 1714) {
    var $0 = $p1;
    var $add8 = $partWidth + 5 | 0;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $add8, $partHeight, $add8);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add8;
  }
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  if (($partHeight | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $shr = $partWidth >>> 2;
  var $tobool24116 = ($shr | 0) == 0;
  var $sub94 = $width_addr_0 - $partWidth | 0;
  var $sub96 = 16 - $partWidth | 0;
  var $1 = $shr << 2;
  var $ptrJ_0127 = $ref_addr_0 + $x0_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) + 5 | 0;
  var $y_0128 = $partHeight;
  var $mb_addr_0129 = $mb;
  while (1) {
    var $mb_addr_0129;
    var $y_0128;
    var $ptrJ_0127;
    if ($tobool24116) {
      var $ptrJ_1_lcssa = $ptrJ_0127;
      var $mb_addr_1_lcssa = $mb_addr_0129;
    } else {
      var $scevgep = $mb_addr_0129 + $1 | 0;
      var $ptrJ_1117 = $ptrJ_0127;
      var $x_0118 = $shr;
      var $tmp2_0119 = HEAPU8[$ptrJ_0127 - 1 | 0];
      var $tmp3_0120 = HEAPU8[$ptrJ_0127 - 2 | 0];
      var $tmp4_0121 = HEAPU8[$ptrJ_0127 - 3 | 0];
      var $tmp5_0122 = HEAPU8[$ptrJ_0127 - 4 | 0];
      var $tmp6_0123 = HEAPU8[$ptrJ_0127 - 5 | 0];
      var $mb_addr_1124 = $mb_addr_0129;
      while (1) {
        var $mb_addr_1124;
        var $tmp6_0123;
        var $tmp5_0122;
        var $tmp4_0121;
        var $tmp3_0120;
        var $tmp2_0119;
        var $x_0118;
        var $ptrJ_1117;
        var $add31 = $tmp5_0122 + $tmp2_0119 | 0;
        var $conv32 = HEAPU8[$ptrJ_1117];
        HEAP8[$mb_addr_1124] = HEAP8[($tmp6_0123 + 16 - $add31 - ($add31 << 2) + $conv32 + (($tmp4_0121 + $tmp3_0120) * 20 & -1) >> 5) + 5244712 | 0];
        var $add46 = $conv32 + $tmp4_0121 | 0;
        var $conv48 = HEAPU8[$ptrJ_1117 + 1 | 0];
        HEAP8[$mb_addr_1124 + 1 | 0] = HEAP8[($tmp5_0122 + 16 - $add46 - ($add46 << 2) + $conv48 + (($tmp3_0120 + $tmp2_0119) * 20 & -1) >> 5) + 5244712 | 0];
        var $add64 = $conv48 + $tmp3_0120 | 0;
        var $conv66 = HEAPU8[$ptrJ_1117 + 2 | 0];
        HEAP8[$mb_addr_1124 + 2 | 0] = HEAP8[($tmp4_0121 + 16 - $add64 - ($add64 << 2) + $conv66 + (($conv32 + $tmp2_0119) * 20 & -1) >> 5) + 5244712 | 0];
        var $add82 = $conv66 + $tmp2_0119 | 0;
        var $conv84 = HEAPU8[$ptrJ_1117 + 3 | 0];
        HEAP8[$mb_addr_1124 + 3 | 0] = HEAP8[($tmp3_0120 + 16 - $add82 - ($add82 << 2) + $conv84 + (($conv48 + $conv32) * 20 & -1) >> 5) + 5244712 | 0];
        var $dec = $x_0118 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $ptrJ_1117 = $ptrJ_1117 + 4 | 0;
          var $x_0118 = $dec;
          var $tmp6_0123 = $tmp2_0119;
          var $tmp2_0119 = $conv84;
          var $tmp3_0120 = $conv66;
          var $tmp4_0121 = $conv48;
          var $tmp5_0122 = $conv32;
          var $mb_addr_1124 = $mb_addr_1124 + 4 | 0;
        }
      }
      var $ptrJ_1_lcssa = $ptrJ_0127 + $1 | 0;
      var $mb_addr_1_lcssa = $scevgep;
    }
    var $mb_addr_1_lcssa;
    var $ptrJ_1_lcssa;
    var $dec99 = $y_0128 - 1 | 0;
    if (($dec99 | 0) == 0) {
      break;
    } else {
      var $ptrJ_0127 = $ptrJ_1_lcssa + $sub94 | 0;
      var $y_0128 = $dec99;
      var $mb_addr_0129 = $mb_addr_1_lcssa + $sub96 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateHorHalf["X"] = 1;
function _h264bsdInterpolateHorQuarter($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight, $horOffset) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 444 | 0;
  var $p1 = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1728;
    } else {
      if (($partWidth + ($x0 + 5) | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1728;
        break;
      }
      if (($partHeight + $y0 | 0) >>> 0 > $height >>> 0) {
        label = 1728;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        break;
      }
    }
  } while (0);
  if (label == 1728) {
    var $0 = $p1;
    var $add8 = $partWidth + 5 | 0;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $add8, $partHeight, $add8);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add8;
  }
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  if (($partHeight | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $shr = $partWidth >>> 2;
  var $tobool24138 = ($shr | 0) == 0;
  var $sub125 = $width_addr_0 - $partWidth | 0;
  var $sub127 = 16 - $partWidth | 0;
  var $tobool39 = ($horOffset | 0) != 0;
  var $1 = $shr << 2;
  var $ptrJ_0149 = $ref_addr_0 + $x0_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) + 5 | 0;
  var $y_0150 = $partHeight;
  var $mb_addr_0151 = $mb;
  while (1) {
    var $mb_addr_0151;
    var $y_0150;
    var $ptrJ_0149;
    if ($tobool24138) {
      var $ptrJ_1_lcssa = $ptrJ_0149;
      var $mb_addr_1_lcssa = $mb_addr_0151;
    } else {
      var $scevgep = $mb_addr_0151 + $1 | 0;
      var $ptrJ_1139 = $ptrJ_0149;
      var $x_0140 = $shr;
      var $mb_addr_1141 = $mb_addr_0151;
      var $tmp2_0142 = HEAPU8[$ptrJ_0149 - 1 | 0];
      var $tmp3_0143 = HEAPU8[$ptrJ_0149 - 2 | 0];
      var $tmp4_0144 = HEAPU8[$ptrJ_0149 - 3 | 0];
      var $tmp5_0145 = HEAPU8[$ptrJ_0149 - 4 | 0];
      var $tmp6_0146 = HEAPU8[$ptrJ_0149 - 5 | 0];
      while (1) {
        var $tmp6_0146;
        var $tmp5_0145;
        var $tmp4_0144;
        var $tmp3_0143;
        var $tmp2_0142;
        var $mb_addr_1141;
        var $x_0140;
        var $ptrJ_1139;
        var $add31 = $tmp5_0145 + $tmp2_0142 | 0;
        var $conv32 = HEAPU8[$ptrJ_1139];
        HEAP8[$mb_addr_1141] = (($tobool39 ? $tmp3_0143 : $tmp4_0144) + HEAPU8[($tmp6_0146 + 16 - $add31 - ($add31 << 2) + $conv32 + (($tmp4_0144 + $tmp3_0143) * 20 & -1) >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add53 = $conv32 + $tmp4_0144 | 0;
        var $conv55 = HEAPU8[$ptrJ_1139 + 1 | 0];
        HEAP8[$mb_addr_1141 + 1 | 0] = (($tobool39 ? $tmp2_0142 : $tmp3_0143) + HEAPU8[($tmp5_0145 + 16 - $add53 - ($add53 << 2) + $conv55 + (($tmp3_0143 + $tmp2_0142) * 20 & -1) >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add79 = $conv55 + $tmp3_0143 | 0;
        var $conv81 = HEAPU8[$ptrJ_1139 + 2 | 0];
        HEAP8[$mb_addr_1141 + 2 | 0] = (($tobool39 ? $conv32 : $tmp2_0142) + HEAPU8[($tmp4_0144 + 16 - $add79 - ($add79 << 2) + $conv81 + (($conv32 + $tmp2_0142) * 20 & -1) >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add105 = $conv81 + $tmp2_0142 | 0;
        var $conv107 = HEAPU8[$ptrJ_1139 + 3 | 0];
        HEAP8[$mb_addr_1141 + 3 | 0] = (($tobool39 ? $conv55 : $conv32) + HEAPU8[($tmp3_0143 + 16 - $add105 - ($add105 << 2) + $conv107 + (($conv55 + $conv32) * 20 & -1) >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $dec = $x_0140 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $ptrJ_1139 = $ptrJ_1139 + 4 | 0;
          var $x_0140 = $dec;
          var $mb_addr_1141 = $mb_addr_1141 + 4 | 0;
          var $tmp6_0146 = $tmp2_0142;
          var $tmp2_0142 = $conv107;
          var $tmp3_0143 = $conv81;
          var $tmp4_0144 = $conv55;
          var $tmp5_0145 = $conv32;
        }
      }
      var $ptrJ_1_lcssa = $ptrJ_0149 + $1 | 0;
      var $mb_addr_1_lcssa = $scevgep;
    }
    var $mb_addr_1_lcssa;
    var $ptrJ_1_lcssa;
    var $dec130 = $y_0150 - 1 | 0;
    if (($dec130 | 0) == 0) {
      break;
    } else {
      var $ptrJ_0149 = $ptrJ_1_lcssa + $sub125 | 0;
      var $y_0150 = $dec130;
      var $mb_addr_0151 = $mb_addr_1_lcssa + $sub127 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateHorQuarter["X"] = 1;
function _h264bsdInterpolateHorVerQuarter($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight, $horVerOffset) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 444 | 0;
  var $p1 = __stackBase__;
  do {
    if (($x0 | 0) < 0) {
      label = 1742;
    } else {
      if (($partWidth + ($x0 + 5) | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1742;
        break;
      }
      if (($partHeight + ($y0 + 5) | 0) >>> 0 > $height >>> 0) {
        label = 1742;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        break;
      }
    }
  } while (0);
  if (label == 1742) {
    var $0 = $p1;
    var $add9 = $partWidth + 5 | 0;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $add9, $partHeight + 5 | 0, $add9);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add9;
  }
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  var $add14 = ($y0_addr_0 * $width_addr_0 & -1) + $x0_addr_0 | 0;
  var $add_ptr20_sum = ($horVerOffset & 1 | 2) + $width_addr_0 + $add14 | 0;
  var $add_ptr22 = $ref_addr_0 + $add_ptr20_sum | 0;
  if (($partHeight | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $shr32 = $partWidth >>> 2;
  var $tobool34265 = ($shr32 | 0) == 0;
  var $sub104 = $width_addr_0 - $partWidth | 0;
  var $sub106 = 16 - $partWidth | 0;
  var $1 = $shr32 << 2;
  var $mb_addr_0277 = $mb;
  var $ptrJ_0278 = $ref_addr_0 + ($width_addr_0 * ($horVerOffset >>> 1 & 1 | 2) & -1) + $add14 + 5 | 0;
  var $y_0279 = $partHeight;
  while (1) {
    var $y_0279;
    var $ptrJ_0278;
    var $mb_addr_0277;
    if ($tobool34265) {
      var $mb_addr_1_lcssa = $mb_addr_0277;
      var $ptrJ_1_lcssa = $ptrJ_0278;
    } else {
      var $scevgep284 = $mb_addr_0277 + $1 | 0;
      var $mb_addr_1266 = $mb_addr_0277;
      var $ptrJ_1267 = $ptrJ_0278;
      var $x_0268 = $shr32;
      var $tmp2_0269 = HEAPU8[$ptrJ_0278 - 1 | 0];
      var $tmp3_0270 = HEAPU8[$ptrJ_0278 - 2 | 0];
      var $tmp4_0271 = HEAPU8[$ptrJ_0278 - 3 | 0];
      var $tmp5_0272 = HEAPU8[$ptrJ_0278 - 4 | 0];
      var $tmp6_0273 = HEAPU8[$ptrJ_0278 - 5 | 0];
      while (1) {
        var $tmp6_0273;
        var $tmp5_0272;
        var $tmp4_0271;
        var $tmp3_0270;
        var $tmp2_0269;
        var $x_0268;
        var $ptrJ_1267;
        var $mb_addr_1266;
        var $add41 = $tmp5_0272 + $tmp2_0269 | 0;
        var $conv42 = HEAPU8[$ptrJ_1267];
        HEAP8[$mb_addr_1266] = HEAP8[($tmp6_0273 + 16 - $add41 - ($add41 << 2) + $conv42 + (($tmp4_0271 + $tmp3_0270) * 20 & -1) >> 5) + 5244712 | 0];
        var $add56 = $conv42 + $tmp4_0271 | 0;
        var $conv58 = HEAPU8[$ptrJ_1267 + 1 | 0];
        HEAP8[$mb_addr_1266 + 1 | 0] = HEAP8[($tmp5_0272 + 16 - $add56 - ($add56 << 2) + $conv58 + (($tmp3_0270 + $tmp2_0269) * 20 & -1) >> 5) + 5244712 | 0];
        var $add74 = $conv58 + $tmp3_0270 | 0;
        var $conv76 = HEAPU8[$ptrJ_1267 + 2 | 0];
        HEAP8[$mb_addr_1266 + 2 | 0] = HEAP8[($tmp4_0271 + 16 - $add74 - ($add74 << 2) + $conv76 + (($conv42 + $tmp2_0269) * 20 & -1) >> 5) + 5244712 | 0];
        var $add92 = $conv76 + $tmp2_0269 | 0;
        var $conv94 = HEAPU8[$ptrJ_1267 + 3 | 0];
        HEAP8[$mb_addr_1266 + 3 | 0] = HEAP8[($tmp3_0270 + 16 - $add92 - ($add92 << 2) + $conv94 + (($conv58 + $conv42) * 20 & -1) >> 5) + 5244712 | 0];
        var $dec = $x_0268 - 1 | 0;
        if (($dec | 0) == 0) {
          break;
        } else {
          var $mb_addr_1266 = $mb_addr_1266 + 4 | 0;
          var $ptrJ_1267 = $ptrJ_1267 + 4 | 0;
          var $x_0268 = $dec;
          var $tmp6_0273 = $tmp2_0269;
          var $tmp2_0269 = $conv94;
          var $tmp3_0270 = $conv76;
          var $tmp4_0271 = $conv58;
          var $tmp5_0272 = $conv42;
        }
      }
      var $mb_addr_1_lcssa = $scevgep284;
      var $ptrJ_1_lcssa = $ptrJ_0278 + $1 | 0;
    }
    var $ptrJ_1_lcssa;
    var $mb_addr_1_lcssa;
    var $dec109 = $y_0279 - 1 | 0;
    if (($dec109 | 0) == 0) {
      break;
    } else {
      var $mb_addr_0277 = $mb_addr_1_lcssa + $sub106 | 0;
      var $ptrJ_0278 = $ptrJ_1_lcssa + $sub104 | 0;
      var $y_0279 = $dec109;
    }
  }
  var $shr115 = $partHeight >>> 2;
  if (($shr115 | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $tobool120253 = ($partWidth | 0) == 0;
  var $sub232 = ($width_addr_0 << 2) - $partWidth | 0;
  var $sub237 = 64 - $partWidth | 0;
  var $sub122 = -$width_addr_0 | 0;
  var $mul123 = $sub122 << 1;
  var $mul131 = $width_addr_0 << 1;
  var $mb_addr_2261 = $mb_addr_1_lcssa + ($sub106 - ($partHeight << 4)) | 0;
  var $ptrC_0262 = $add_ptr22;
  var $ptrV_0263 = $ref_addr_0 + $add_ptr20_sum + ($width_addr_0 * 5 & -1) | 0;
  var $y_1264 = $shr115;
  while (1) {
    var $y_1264;
    var $ptrV_0263;
    var $ptrC_0262;
    var $mb_addr_2261;
    if ($tobool120253) {
      var $mb_addr_3_lcssa = $mb_addr_2261;
      var $ptrC_1_lcssa = $ptrC_0262;
      var $ptrV_1_lcssa = $ptrV_0263;
    } else {
      var $scevgep282 = $mb_addr_2261 + $partWidth | 0;
      var $mb_addr_3254 = $mb_addr_2261;
      var $ptrC_1255 = $ptrC_0262;
      var $ptrV_1256 = $ptrV_0263;
      var $x_1257 = $partWidth;
      while (1) {
        var $x_1257;
        var $ptrV_1256;
        var $ptrC_1255;
        var $mb_addr_3254;
        var $conv125 = HEAPU8[$ptrV_1256 + $mul123 | 0];
        var $conv128 = HEAPU8[$ptrV_1256 + $sub122 | 0];
        var $conv130 = HEAPU8[$ptrV_1256 + $width_addr_0 | 0];
        var $conv135 = HEAPU8[$ptrV_1256];
        var $add136 = $conv130 + $conv125 | 0;
        var $conv144 = HEAPU8[$ptrC_1255 + $mul131 | 0];
        var $arrayidx153 = $mb_addr_3254 + 48 | 0;
        HEAP8[$arrayidx153] = (HEAPU8[(HEAPU8[$ptrV_1256 + $mul131 | 0] + 16 - $add136 - ($add136 << 2) + $conv144 + (($conv135 + $conv128) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$arrayidx153] + 1 | 0) >>> 1 & 255;
        var $add160 = $conv144 + $conv135 | 0;
        var $conv166 = HEAPU8[$ptrC_1255 + $width_addr_0 | 0];
        var $arrayidx175 = $mb_addr_3254 + 32 | 0;
        HEAP8[$arrayidx175] = (HEAPU8[($conv130 + 16 - $add160 - ($add160 << 2) + $conv166 + (($conv128 + $conv125) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$arrayidx175] + 1 | 0) >>> 1 & 255;
        var $conv183 = HEAPU8[$ptrC_1255];
        var $add184 = $conv166 + $conv128 | 0;
        var $arrayidx197 = $mb_addr_3254 + 16 | 0;
        HEAP8[$arrayidx197] = (HEAPU8[($conv135 + 16 - $add184 - ($add184 << 2) + $conv183 + (($conv144 + $conv125) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$arrayidx197] + 1 | 0) >>> 1 & 255;
        var $add208 = $conv183 + $conv125 | 0;
        HEAP8[$mb_addr_3254] = (HEAPU8[($conv128 + 16 - $add208 - ($add208 << 2) + HEAPU8[$ptrC_1255 + $sub122 | 0] + (($conv166 + $conv144) * 20 & -1) >> 5) + 5244712 | 0] + HEAPU8[$mb_addr_3254] + 1 | 0) >>> 1 & 255;
        var $dec229 = $x_1257 - 1 | 0;
        if (($dec229 | 0) == 0) {
          break;
        } else {
          var $mb_addr_3254 = $mb_addr_3254 + 1 | 0;
          var $ptrC_1255 = $ptrC_1255 + 1 | 0;
          var $ptrV_1256 = $ptrV_1256 + 1 | 0;
          var $x_1257 = $dec229;
        }
      }
      var $mb_addr_3_lcssa = $scevgep282;
      var $ptrC_1_lcssa = $ptrC_0262 + $partWidth | 0;
      var $ptrV_1_lcssa = $ptrV_0263 + $partWidth | 0;
    }
    var $ptrV_1_lcssa;
    var $ptrC_1_lcssa;
    var $mb_addr_3_lcssa;
    var $dec240 = $y_1264 - 1 | 0;
    if (($dec240 | 0) == 0) {
      break;
    } else {
      var $mb_addr_2261 = $mb_addr_3_lcssa + $sub237 | 0;
      var $ptrC_0262 = $ptrC_1_lcssa + $sub232 | 0;
      var $ptrV_0263 = $ptrV_1_lcssa + $sub232 | 0;
      var $y_1264 = $dec240;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateHorVerQuarter["X"] = 1;
function _h264bsdInterpolateMidHalf($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight) {
  var $ptrV_1217$s2;
  var $ptrC_1216$s2;
  var $b1_1232$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 1788 | 0;
  var $p1 = __stackBase__;
  var $table = __stackBase__ + 444;
  do {
    if (($x0 | 0) < 0) {
      label = 1765;
    } else {
      var $add = $x0 + 5 | 0;
      if (($add + $partWidth | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1765;
        break;
      }
      if (($partHeight + ($y0 + 5) | 0) >>> 0 > $height >>> 0) {
        label = 1765;
        break;
      }
      var $ref_addr_0 = $ref;
      var $x0_addr_0 = $add;
      var $y0_addr_0 = $y0;
      var $width_addr_0 = $width;
      var $add17_pre_phi = $partHeight + 5 | 0;
      break;
    }
  } while (0);
  if (label == 1765) {
    var $0 = $p1;
    var $add9 = $partWidth + 5 | 0;
    var $add10 = $partHeight + 5 | 0;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $add9, $add10, $add9);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 5;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add9;
    var $add17_pre_phi = $add10;
  }
  var $add17_pre_phi;
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  L2274 : do {
    if (($add17_pre_phi | 0) != 0) {
      var $shr = $partWidth >>> 2;
      var $tobool28225 = ($shr | 0) == 0;
      var $sub79 = $width_addr_0 - $partWidth | 0;
      var $1 = $shr << 2;
      var $y_0237 = $add17_pre_phi;
      var $b1_0238 = $table | 0;
      var $ptrJ_0239 = $ref_addr_0 + $x0_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) | 0;
      while (1) {
        var $ptrJ_0239;
        var $b1_0238;
        var $y_0237;
        if ($tobool28225) {
          var $b1_1_lcssa = $b1_0238;
          var $ptrJ_1_lcssa = $ptrJ_0239;
        } else {
          var $scevgep242 = ($1 << 2) + $b1_0238 | 0;
          var $x_0226 = $shr;
          var $tmp2_0227 = HEAPU8[$ptrJ_0239 - 1 | 0];
          var $tmp3_0228 = HEAPU8[$ptrJ_0239 - 2 | 0];
          var $tmp4_0229 = HEAPU8[$ptrJ_0239 - 3 | 0];
          var $tmp5_0230 = HEAPU8[$ptrJ_0239 - 4 | 0];
          var $tmp6_0231 = HEAPU8[$ptrJ_0239 - 5 | 0];
          var $b1_1232 = $b1_0238, $b1_1232$s2 = $b1_1232 >> 2;
          var $ptrJ_1233 = $ptrJ_0239;
          while (1) {
            var $ptrJ_1233;
            var $b1_1232;
            var $tmp6_0231;
            var $tmp5_0230;
            var $tmp4_0229;
            var $tmp3_0228;
            var $tmp2_0227;
            var $x_0226;
            var $add34 = $tmp5_0230 + $tmp2_0227 | 0;
            var $conv35 = HEAPU8[$ptrJ_1233];
            HEAP32[$b1_1232$s2] = $tmp6_0231 - $add34 - ($add34 << 2) + $conv35 + (($tmp4_0229 + $tmp3_0228) * 20 & -1) | 0;
            var $add45 = $conv35 + $tmp4_0229 | 0;
            var $conv47 = HEAPU8[$ptrJ_1233 + 1 | 0];
            HEAP32[$b1_1232$s2 + 1] = $tmp5_0230 - $add45 + $conv47 - ($add45 << 2) + (($tmp3_0228 + $tmp2_0227) * 20 & -1) | 0;
            var $add58 = $conv47 + $tmp3_0228 | 0;
            var $conv60 = HEAPU8[$ptrJ_1233 + 2 | 0];
            HEAP32[$b1_1232$s2 + 2] = $tmp4_0229 - $add58 + $conv60 - ($add58 << 2) + (($conv35 + $tmp2_0227) * 20 & -1) | 0;
            var $add71 = $conv60 + $tmp2_0227 | 0;
            var $conv73 = HEAPU8[$ptrJ_1233 + 3 | 0];
            HEAP32[$b1_1232$s2 + 3] = $tmp3_0228 - $add71 + $conv73 - ($add71 << 2) + (($conv47 + $conv35) * 20 & -1) | 0;
            var $dec = $x_0226 - 1 | 0;
            if (($dec | 0) == 0) {
              break;
            } else {
              var $x_0226 = $dec;
              var $tmp6_0231 = $tmp2_0227;
              var $tmp2_0227 = $conv73;
              var $tmp3_0228 = $conv60;
              var $tmp4_0229 = $conv47;
              var $tmp5_0230 = $conv35;
              var $b1_1232 = $b1_1232 + 16 | 0, $b1_1232$s2 = $b1_1232 >> 2;
              var $ptrJ_1233 = $ptrJ_1233 + 4 | 0;
            }
          }
          var $b1_1_lcssa = $scevgep242;
          var $ptrJ_1_lcssa = $ptrJ_0239 + $1 | 0;
        }
        var $ptrJ_1_lcssa;
        var $b1_1_lcssa;
        var $dec82 = $y_0237 - 1 | 0;
        if (($dec82 | 0) == 0) {
          break L2274;
        } else {
          var $y_0237 = $dec82;
          var $b1_0238 = $b1_1_lcssa;
          var $ptrJ_0239 = $ptrJ_1_lcssa + $sub79 | 0;
        }
      }
    }
  } while (0);
  var $shr88 = $partHeight >>> 2;
  if (($shr88 | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $tobool93213 = ($partWidth | 0) == 0;
  var $sub176 = 64 - $partWidth | 0;
  var $mul178 = $partWidth * 3 & -1;
  var $sub95 = -$partWidth | 0;
  var $mul96 = $sub95 << 1;
  var $mul100 = $partWidth << 1;
  var $mb_addr_0221 = $mb;
  var $y_1222 = $shr88;
  var $ptrC_0223 = ($partWidth << 2) + $table | 0;
  var $ptrV_0224 = (($partWidth * 6 & -1) << 2) + $table | 0;
  while (1) {
    var $ptrV_0224;
    var $ptrC_0223;
    var $y_1222;
    var $mb_addr_0221;
    if ($tobool93213) {
      var $mb_addr_1_lcssa = $mb_addr_0221;
      var $ptrC_1_lcssa = $ptrC_0223;
      var $ptrV_1_lcssa = $ptrV_0224;
    } else {
      var $scevgep240 = $mb_addr_0221 + $partWidth | 0;
      var $mb_addr_1214 = $mb_addr_0221;
      var $x_1215 = $partWidth;
      var $ptrC_1216 = $ptrC_0223, $ptrC_1216$s2 = $ptrC_1216 >> 2;
      var $ptrV_1217 = $ptrV_0224, $ptrV_1217$s2 = $ptrV_1217 >> 2;
      while (1) {
        var $ptrV_1217;
        var $ptrC_1216;
        var $x_1215;
        var $mb_addr_1214;
        var $11 = HEAP32[($mul96 << 2 >> 2) + $ptrV_1217$s2];
        var $12 = HEAP32[($sub95 << 2 >> 2) + $ptrV_1217$s2];
        var $13 = HEAP32[($partWidth << 2 >> 2) + $ptrV_1217$s2];
        var $15 = HEAP32[$ptrV_1217$s2];
        var $add103 = $13 + $11 | 0;
        var $16 = HEAP32[($mul100 << 2 >> 2) + $ptrC_1216$s2];
        HEAP8[$mb_addr_1214 + 48 | 0] = HEAP8[(HEAP32[($mul100 << 2 >> 2) + $ptrV_1217$s2] + 512 - $add103 - ($add103 << 2) + $16 + (($15 + $12) * 20 & -1) >> 10) + 5244712 | 0];
        var $add122 = $16 + $15 | 0;
        var $18 = HEAP32[($partWidth << 2 >> 2) + $ptrC_1216$s2];
        HEAP8[$mb_addr_1214 + 32 | 0] = HEAP8[($13 + 512 - $add122 - ($add122 << 2) + $18 + (($12 + $11) * 20 & -1) >> 10) + 5244712 | 0];
        var $20 = HEAP32[$ptrC_1216$s2];
        var $add139 = $18 + $12 | 0;
        HEAP8[$mb_addr_1214 + 16 | 0] = HEAP8[($15 + 512 - $add139 - ($add139 << 2) + $20 + (($16 + $11) * 20 & -1) >> 10) + 5244712 | 0];
        var $add157 = $20 + $11 | 0;
        HEAP8[$mb_addr_1214] = HEAP8[($12 + 512 - $add157 - ($add157 << 2) + HEAP32[($sub95 << 2 >> 2) + $ptrC_1216$s2] + (($18 + $16) * 20 & -1) >> 10) + 5244712 | 0];
        var $dec174 = $x_1215 - 1 | 0;
        if (($dec174 | 0) == 0) {
          break;
        } else {
          var $mb_addr_1214 = $mb_addr_1214 + 1 | 0;
          var $x_1215 = $dec174;
          var $ptrC_1216 = $ptrC_1216 + 4 | 0, $ptrC_1216$s2 = $ptrC_1216 >> 2;
          var $ptrV_1217 = $ptrV_1217 + 4 | 0, $ptrV_1217$s2 = $ptrV_1217 >> 2;
        }
      }
      var $mb_addr_1_lcssa = $scevgep240;
      var $ptrC_1_lcssa = ($partWidth << 2) + $ptrC_0223 | 0;
      var $ptrV_1_lcssa = ($partWidth << 2) + $ptrV_0224 | 0;
    }
    var $ptrV_1_lcssa;
    var $ptrC_1_lcssa;
    var $mb_addr_1_lcssa;
    var $dec183 = $y_1222 - 1 | 0;
    if (($dec183 | 0) == 0) {
      break;
    } else {
      var $mb_addr_0221 = $mb_addr_1_lcssa + $sub176 | 0;
      var $y_1222 = $dec183;
      var $ptrC_0223 = ($mul178 << 2) + $ptrC_1_lcssa | 0;
      var $ptrV_0224 = ($mul178 << 2) + $ptrV_1_lcssa | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateMidHalf["X"] = 1;
function _h264bsdInterpolateMidVerQuarter($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight, $verOffset) {
  var $ptrInt_1254$s2;
  var $ptrV_1253$s2;
  var $ptrC_1252$s2;
  var $b1_1271$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 1788 | 0;
  var $p1 = __stackBase__;
  var $table = __stackBase__ + 444;
  do {
    if (($x0 | 0) < 0) {
      label = 1787;
    } else {
      var $add = $x0 + 5 | 0;
      if (($add + $partWidth | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1787;
        break;
      }
      if (($partHeight + ($y0 + 5) | 0) >>> 0 > $height >>> 0) {
        label = 1787;
        break;
      }
      var $ref_addr_0 = $ref;
      var $x0_addr_0 = $add;
      var $y0_addr_0 = $y0;
      var $width_addr_0 = $width;
      var $add17_pre_phi = $partHeight + 5 | 0;
      break;
    }
  } while (0);
  if (label == 1787) {
    var $0 = $p1;
    var $add9 = $partWidth + 5 | 0;
    var $add10 = $partHeight + 5 | 0;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $add9, $add10, $add9);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 5;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add9;
    var $add17_pre_phi = $add10;
  }
  var $add17_pre_phi;
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  L2305 : do {
    if (($add17_pre_phi | 0) != 0) {
      var $shr = $partWidth >>> 2;
      var $tobool28264 = ($shr | 0) == 0;
      var $sub79 = $width_addr_0 - $partWidth | 0;
      var $1 = $shr << 2;
      var $y_0276 = $add17_pre_phi;
      var $b1_0277 = $table | 0;
      var $ptrJ_0278 = $ref_addr_0 + $x0_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) | 0;
      while (1) {
        var $ptrJ_0278;
        var $b1_0277;
        var $y_0276;
        if ($tobool28264) {
          var $b1_1_lcssa = $b1_0277;
          var $ptrJ_1_lcssa = $ptrJ_0278;
        } else {
          var $scevgep282 = ($1 << 2) + $b1_0277 | 0;
          var $x_0265 = $shr;
          var $tmp2_0266 = HEAPU8[$ptrJ_0278 - 1 | 0];
          var $tmp3_0267 = HEAPU8[$ptrJ_0278 - 2 | 0];
          var $tmp4_0268 = HEAPU8[$ptrJ_0278 - 3 | 0];
          var $tmp5_0269 = HEAPU8[$ptrJ_0278 - 4 | 0];
          var $tmp6_0270 = HEAPU8[$ptrJ_0278 - 5 | 0];
          var $b1_1271 = $b1_0277, $b1_1271$s2 = $b1_1271 >> 2;
          var $ptrJ_1272 = $ptrJ_0278;
          while (1) {
            var $ptrJ_1272;
            var $b1_1271;
            var $tmp6_0270;
            var $tmp5_0269;
            var $tmp4_0268;
            var $tmp3_0267;
            var $tmp2_0266;
            var $x_0265;
            var $add34 = $tmp5_0269 + $tmp2_0266 | 0;
            var $conv35 = HEAPU8[$ptrJ_1272];
            HEAP32[$b1_1271$s2] = $tmp6_0270 - $add34 - ($add34 << 2) + $conv35 + (($tmp4_0268 + $tmp3_0267) * 20 & -1) | 0;
            var $add45 = $conv35 + $tmp4_0268 | 0;
            var $conv47 = HEAPU8[$ptrJ_1272 + 1 | 0];
            HEAP32[$b1_1271$s2 + 1] = $tmp5_0269 - $add45 + $conv47 - ($add45 << 2) + (($tmp3_0267 + $tmp2_0266) * 20 & -1) | 0;
            var $add58 = $conv47 + $tmp3_0267 | 0;
            var $conv60 = HEAPU8[$ptrJ_1272 + 2 | 0];
            HEAP32[$b1_1271$s2 + 2] = $tmp4_0268 - $add58 + $conv60 - ($add58 << 2) + (($conv35 + $tmp2_0266) * 20 & -1) | 0;
            var $add71 = $conv60 + $tmp2_0266 | 0;
            var $conv73 = HEAPU8[$ptrJ_1272 + 3 | 0];
            HEAP32[$b1_1271$s2 + 3] = $tmp3_0267 - $add71 + $conv73 - ($add71 << 2) + (($conv47 + $conv35) * 20 & -1) | 0;
            var $dec = $x_0265 - 1 | 0;
            if (($dec | 0) == 0) {
              break;
            } else {
              var $x_0265 = $dec;
              var $tmp6_0270 = $tmp2_0266;
              var $tmp2_0266 = $conv73;
              var $tmp3_0267 = $conv60;
              var $tmp4_0268 = $conv47;
              var $tmp5_0269 = $conv35;
              var $b1_1271 = $b1_1271 + 16 | 0, $b1_1271$s2 = $b1_1271 >> 2;
              var $ptrJ_1272 = $ptrJ_1272 + 4 | 0;
            }
          }
          var $b1_1_lcssa = $scevgep282;
          var $ptrJ_1_lcssa = $ptrJ_0278 + $1 | 0;
        }
        var $ptrJ_1_lcssa;
        var $b1_1_lcssa;
        var $dec82 = $y_0276 - 1 | 0;
        if (($dec82 | 0) == 0) {
          break L2305;
        } else {
          var $y_0276 = $dec82;
          var $b1_0277 = $b1_1_lcssa;
          var $ptrJ_0278 = $ptrJ_1_lcssa + $sub79 | 0;
        }
      }
    }
  } while (0);
  var $shr91 = $partHeight >>> 2;
  if (($shr91 | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $tobool96249 = ($partWidth | 0) == 0;
  var $sub212 = 64 - $partWidth | 0;
  var $mul214 = $partWidth * 3 & -1;
  var $sub98 = -$partWidth | 0;
  var $mul99 = $sub98 << 1;
  var $mul103 = $partWidth << 1;
  var $mb_addr_0259 = $mb;
  var $y_1260 = $shr91;
  var $ptrC_0261 = ($partWidth << 2) + $table | 0;
  var $ptrV_0262 = (($partWidth * 6 & -1) << 2) + $table | 0;
  var $ptrInt_0263 = ((($verOffset + 2) * $partWidth & -1) + $partWidth << 2) + $table | 0;
  while (1) {
    var $ptrInt_0263;
    var $ptrV_0262;
    var $ptrC_0261;
    var $y_1260;
    var $mb_addr_0259;
    if ($tobool96249) {
      var $mb_addr_1_lcssa = $mb_addr_0259;
      var $ptrC_1_lcssa = $ptrC_0261;
      var $ptrV_1_lcssa = $ptrV_0262;
      var $ptrInt_1_lcssa = $ptrInt_0263;
    } else {
      var $scevgep = ($partWidth << 2) + $ptrInt_0263 | 0;
      var $scevgep280 = $mb_addr_0259 + $partWidth | 0;
      var $mb_addr_1250 = $mb_addr_0259;
      var $x_1251 = $partWidth;
      var $ptrC_1252 = $ptrC_0261, $ptrC_1252$s2 = $ptrC_1252 >> 2;
      var $ptrV_1253 = $ptrV_0262, $ptrV_1253$s2 = $ptrV_1253 >> 2;
      var $ptrInt_1254 = $ptrInt_0263, $ptrInt_1254$s2 = $ptrInt_1254 >> 2;
      while (1) {
        var $ptrInt_1254;
        var $ptrV_1253;
        var $ptrC_1252;
        var $x_1251;
        var $mb_addr_1250;
        var $11 = HEAP32[($mul99 << 2 >> 2) + $ptrV_1253$s2];
        var $12 = HEAP32[($sub98 << 2 >> 2) + $ptrV_1253$s2];
        var $13 = HEAP32[($partWidth << 2 >> 2) + $ptrV_1253$s2];
        var $15 = HEAP32[$ptrV_1253$s2];
        var $add106 = $13 + $11 | 0;
        var $16 = HEAP32[($mul103 << 2 >> 2) + $ptrC_1252$s2];
        HEAP8[$mb_addr_1250 + 48 | 0] = (HEAPU8[(HEAP32[($mul103 << 2 >> 2) + $ptrV_1253$s2] + 512 - $add106 - ($add106 << 2) + $16 + (($15 + $12) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[($mul103 << 2 >> 2) + $ptrInt_1254$s2] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add133 = $16 + $15 | 0;
        var $20 = HEAP32[($partWidth << 2 >> 2) + $ptrC_1252$s2];
        HEAP8[$mb_addr_1250 + 32 | 0] = (HEAPU8[($13 + 512 - $add133 - ($add133 << 2) + $20 + (($12 + $11) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[($partWidth << 2 >> 2) + $ptrInt_1254$s2] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $24 = HEAP32[$ptrC_1252$s2];
        var $add158 = $20 + $12 | 0;
        HEAP8[$mb_addr_1250 + 16 | 0] = (HEAPU8[($15 + 512 - $add158 - ($add158 << 2) + $24 + (($16 + $11) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[$ptrInt_1254$s2] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add183 = $24 + $11 | 0;
        HEAP8[$mb_addr_1250] = (HEAPU8[($12 + 512 - $add183 - ($add183 << 2) + HEAP32[($sub98 << 2 >> 2) + $ptrC_1252$s2] + (($20 + $16) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[($sub98 << 2 >> 2) + $ptrInt_1254$s2] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $dec210 = $x_1251 - 1 | 0;
        if (($dec210 | 0) == 0) {
          break;
        } else {
          var $mb_addr_1250 = $mb_addr_1250 + 1 | 0;
          var $x_1251 = $dec210;
          var $ptrC_1252 = $ptrC_1252 + 4 | 0, $ptrC_1252$s2 = $ptrC_1252 >> 2;
          var $ptrV_1253 = $ptrV_1253 + 4 | 0, $ptrV_1253$s2 = $ptrV_1253 >> 2;
          var $ptrInt_1254 = $ptrInt_1254 + 4 | 0, $ptrInt_1254$s2 = $ptrInt_1254 >> 2;
        }
      }
      var $mb_addr_1_lcssa = $scevgep280;
      var $ptrC_1_lcssa = ($partWidth << 2) + $ptrC_0261 | 0;
      var $ptrV_1_lcssa = ($partWidth << 2) + $ptrV_0262 | 0;
      var $ptrInt_1_lcssa = $scevgep;
    }
    var $ptrInt_1_lcssa;
    var $ptrV_1_lcssa;
    var $ptrC_1_lcssa;
    var $mb_addr_1_lcssa;
    var $dec221 = $y_1260 - 1 | 0;
    if (($dec221 | 0) == 0) {
      break;
    } else {
      var $mb_addr_0259 = $mb_addr_1_lcssa + $sub212 | 0;
      var $y_1260 = $dec221;
      var $ptrC_0261 = ($mul214 << 2) + $ptrC_1_lcssa | 0;
      var $ptrV_0262 = ($mul214 << 2) + $ptrV_1_lcssa | 0;
      var $ptrInt_0263 = ($mul214 << 2) + $ptrInt_1_lcssa | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateMidVerQuarter["X"] = 1;
function _h264bsdInterpolateMidHorQuarter($ref, $mb, $x0, $y0, $width, $height, $partWidth, $partHeight, $horOffset) {
  var $ptrInt_1256$s2;
  var $ptrJ_1255$s2;
  var $h1_1267$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 1788 | 0;
  var $p1 = __stackBase__;
  var $table = __stackBase__ + 444;
  var $add = $partWidth + 5 | 0;
  do {
    if (($x0 | 0) < 0) {
      label = 1808;
    } else {
      if (($partWidth + ($x0 + 5) | 0) >>> 0 > $width >>> 0 | ($y0 | 0) < 0) {
        label = 1808;
        break;
      }
      if (($partHeight + ($y0 + 5) | 0) >>> 0 > $height >>> 0) {
        label = 1808;
        break;
      } else {
        var $ref_addr_0 = $ref;
        var $x0_addr_0 = $x0;
        var $y0_addr_0 = $y0;
        var $width_addr_0 = $width;
        break;
      }
    }
  } while (0);
  if (label == 1808) {
    var $0 = $p1;
    _h264bsdFillBlock($ref, $0, $x0, $y0, $width, $height, $add, $partHeight + 5 | 0, $add);
    var $ref_addr_0 = $0;
    var $x0_addr_0 = 0;
    var $y0_addr_0 = 0;
    var $width_addr_0 = $add;
  }
  var $width_addr_0;
  var $y0_addr_0;
  var $x0_addr_0;
  var $ref_addr_0;
  var $add_ptr_sum = $x0_addr_0 + $width_addr_0 + ($y0_addr_0 * $width_addr_0 & -1) | 0;
  var $shr = $partHeight >>> 2;
  L2335 : do {
    if (($shr | 0) != 0) {
      var $tobool22265 = ($add | 0) == 0;
      var $sub91 = ($width_addr_0 << 2) - $partWidth - 5 | 0;
      var $mul97 = $add * 3 & -1;
      var $sub = -$width_addr_0 | 0;
      var $mul24 = $sub << 1;
      var $mul30 = $width_addr_0 << 1;
      var $mul46 = $add << 1;
      var $sub85 = -5 - $partWidth | 0;
      var $y_0274 = $shr;
      var $h1_0275 = ($add << 2) + $table | 0;
      var $ptrC_0276 = $ref_addr_0 + $add_ptr_sum | 0;
      var $ptrV_0277 = $ref_addr_0 + $add_ptr_sum + ($width_addr_0 * 5 & -1) | 0;
      while (1) {
        var $ptrV_0277;
        var $ptrC_0276;
        var $h1_0275;
        var $y_0274;
        if ($tobool22265) {
          var $h1_1_lcssa = $h1_0275;
          var $ptrC_1_lcssa = $ptrC_0276;
          var $ptrV_1_lcssa = $ptrV_0277;
        } else {
          var $scevgep281 = ($add << 2) + $h1_0275 | 0;
          var $x_0266 = $add;
          var $h1_1267 = $h1_0275, $h1_1267$s2 = $h1_1267 >> 2;
          var $ptrC_1268 = $ptrC_0276;
          var $ptrV_1269 = $ptrV_0277;
          while (1) {
            var $ptrV_1269;
            var $ptrC_1268;
            var $h1_1267;
            var $x_0266;
            var $conv = HEAPU8[$ptrV_1269 + $mul24 | 0];
            var $conv27 = HEAPU8[$ptrV_1269 + $sub | 0];
            var $conv29 = HEAPU8[$ptrV_1269 + $width_addr_0 | 0];
            var $conv33 = HEAPU8[$ptrV_1269];
            var $add34 = $conv29 + $conv | 0;
            var $conv40 = HEAPU8[$ptrC_1268 + $mul30 | 0];
            HEAP32[($mul46 << 2 >> 2) + $h1_1267$s2] = HEAPU8[$ptrV_1269 + $mul30 | 0] - $add34 - ($add34 << 2) + $conv40 + (($conv33 + $conv27) * 20 & -1) | 0;
            var $add48 = $conv40 + $conv33 | 0;
            var $conv54 = HEAPU8[$ptrC_1268 + $width_addr_0 | 0];
            HEAP32[($add << 2 >> 2) + $h1_1267$s2] = $conv29 - $add48 + $conv54 - ($add48 << 2) + (($conv27 + $conv) * 20 & -1) | 0;
            var $conv61 = HEAPU8[$ptrC_1268];
            var $add62 = $conv54 + $conv27 | 0;
            HEAP32[$h1_1267$s2] = $conv33 - $add62 + $conv61 - ($add62 << 2) + (($conv40 + $conv) * 20 & -1) | 0;
            var $add75 = $conv61 + $conv | 0;
            HEAP32[($sub85 << 2 >> 2) + $h1_1267$s2] = $conv27 - $add75 + HEAPU8[$ptrC_1268 + $sub | 0] - ($add75 << 2) + (($conv54 + $conv40) * 20 & -1) | 0;
            var $dec = $x_0266 - 1 | 0;
            if (($dec | 0) == 0) {
              break;
            } else {
              var $x_0266 = $dec;
              var $h1_1267 = $h1_1267 + 4 | 0, $h1_1267$s2 = $h1_1267 >> 2;
              var $ptrC_1268 = $ptrC_1268 + 1 | 0;
              var $ptrV_1269 = $ptrV_1269 + 1 | 0;
            }
          }
          var $h1_1_lcssa = $scevgep281;
          var $ptrC_1_lcssa = $ptrC_0276 + $add | 0;
          var $ptrV_1_lcssa = $ptrV_0277 + $add | 0;
        }
        var $ptrV_1_lcssa;
        var $ptrC_1_lcssa;
        var $h1_1_lcssa;
        var $dec100 = $y_0274 - 1 | 0;
        if (($dec100 | 0) == 0) {
          break L2335;
        } else {
          var $y_0274 = $dec100;
          var $h1_0275 = ($mul97 << 2) + $h1_1_lcssa | 0;
          var $ptrC_0276 = $ptrC_1_lcssa + $sub91 | 0;
          var $ptrV_0277 = $ptrV_1_lcssa + $sub91 | 0;
        }
      }
    }
  } while (0);
  if (($partHeight | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $shr115 = $partWidth >>> 2;
  var $tobool117248 = ($shr115 | 0) == 0;
  var $sub223 = 16 - $partWidth | 0;
  var $10 = $shr115 << 2;
  var $y_1261 = $partHeight;
  var $ptrJ_0262 = $table + 20 | 0;
  var $ptrInt_0263 = ($horOffset + 2 << 2) + $table | 0;
  var $mb_addr_0264 = $mb;
  while (1) {
    var $mb_addr_0264;
    var $ptrInt_0263;
    var $ptrJ_0262;
    var $y_1261;
    if ($tobool117248) {
      var $ptrJ_1_lcssa = $ptrJ_0262;
      var $ptrInt_1_lcssa = $ptrInt_0263;
      var $mb_addr_1_lcssa = $mb_addr_0264;
    } else {
      var $scevgep278 = ($10 << 2) + $ptrInt_0263 | 0;
      var $x_1249 = $shr115;
      var $tmp2_0250 = HEAP32[$ptrJ_0262 - 4 >> 2];
      var $tmp3_0251 = HEAP32[$ptrJ_0262 - 8 >> 2];
      var $tmp4_0252 = HEAP32[$ptrJ_0262 - 12 >> 2];
      var $tmp5_0253 = HEAP32[$ptrJ_0262 - 16 >> 2];
      var $tmp6_0254 = HEAP32[$ptrJ_0262 - 20 >> 2];
      var $ptrJ_1255 = $ptrJ_0262, $ptrJ_1255$s2 = $ptrJ_1255 >> 2;
      var $ptrInt_1256 = $ptrInt_0263, $ptrInt_1256$s2 = $ptrInt_1256 >> 2;
      var $mb_addr_1257 = $mb_addr_0264;
      while (1) {
        var $mb_addr_1257;
        var $ptrInt_1256;
        var $ptrJ_1255;
        var $tmp6_0254;
        var $tmp5_0253;
        var $tmp4_0252;
        var $tmp3_0251;
        var $tmp2_0250;
        var $x_1249;
        var $add125 = $tmp5_0253 + $tmp2_0250 | 0;
        var $16 = HEAP32[$ptrJ_1255$s2];
        HEAP8[$mb_addr_1257] = (HEAPU8[($tmp6_0254 + 512 - $add125 - ($add125 << 2) + $16 + (($tmp4_0252 + $tmp3_0251) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[$ptrInt_1256$s2] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add149 = $16 + $tmp4_0252 | 0;
        var $20 = HEAP32[$ptrJ_1255$s2 + 1];
        HEAP8[$mb_addr_1257 + 1 | 0] = (HEAPU8[($tmp5_0253 + 512 - $add149 - ($add149 << 2) + $20 + (($tmp3_0251 + $tmp2_0250) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[$ptrInt_1256$s2 + 1] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add174 = $20 + $tmp3_0251 | 0;
        var $24 = HEAP32[$ptrJ_1255$s2 + 2];
        HEAP8[$mb_addr_1257 + 2 | 0] = (HEAPU8[($tmp4_0252 + 512 - $add174 - ($add174 << 2) + $24 + (($16 + $tmp2_0250) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[$ptrInt_1256$s2 + 2] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $add199 = $24 + $tmp2_0250 | 0;
        var $28 = HEAP32[$ptrJ_1255$s2 + 3];
        HEAP8[$mb_addr_1257 + 3 | 0] = (HEAPU8[($tmp3_0251 + 512 - $add199 - ($add199 << 2) + $28 + (($20 + $16) * 20 & -1) >> 10) + 5244712 | 0] + HEAPU8[(HEAP32[$ptrInt_1256$s2 + 3] + 16 >> 5) + 5244712 | 0] + 1 | 0) >>> 1 & 255;
        var $dec219 = $x_1249 - 1 | 0;
        if (($dec219 | 0) == 0) {
          break;
        }
        var $x_1249 = $dec219;
        var $tmp6_0254 = $tmp2_0250;
        var $tmp2_0250 = $28;
        var $tmp3_0251 = $24;
        var $tmp4_0252 = $20;
        var $tmp5_0253 = $16;
        var $ptrJ_1255 = $ptrJ_1255 + 16 | 0, $ptrJ_1255$s2 = $ptrJ_1255 >> 2;
        var $ptrInt_1256 = $ptrInt_1256 + 16 | 0, $ptrInt_1256$s2 = $ptrInt_1256 >> 2;
        var $mb_addr_1257 = $mb_addr_1257 + 4 | 0;
      }
      var $ptrJ_1_lcssa = ($10 << 2) + $ptrJ_0262 | 0;
      var $ptrInt_1_lcssa = $scevgep278;
      var $mb_addr_1_lcssa = $mb_addr_0264 + $10 | 0;
    }
    var $mb_addr_1_lcssa;
    var $ptrInt_1_lcssa;
    var $ptrJ_1_lcssa;
    var $dec226 = $y_1261 - 1 | 0;
    if (($dec226 | 0) == 0) {
      break;
    } else {
      var $y_1261 = $dec226;
      var $ptrJ_0262 = $ptrJ_1_lcssa + 20 | 0;
      var $ptrInt_0263 = $ptrInt_1_lcssa + 20 | 0;
      var $mb_addr_0264 = $mb_addr_1_lcssa + $sub223 | 0;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdInterpolateMidHorQuarter["X"] = 1;
function _SetPicNums($dpb, $currFrameNum) {
  var $2$s2;
  var $numRefFrames = $dpb + 40 | 0;
  var $0 = HEAP32[$numRefFrames >> 2];
  if (($0 | 0) == 0) {
    return;
  }
  var $buffer = $dpb | 0;
  var $maxFrameNum = $dpb + 32 | 0;
  var $i_014 = 0;
  var $1 = $0;
  while (1) {
    var $1;
    var $i_014;
    var $2$s2 = HEAP32[$buffer >> 2] >> 2;
    if ((HEAP32[$2$s2 + ($i_014 * 10 | 0) + 5] - 1 | 0) >>> 0 < 2) {
      var $4 = HEAP32[$2$s2 + ($i_014 * 10 | 0) + 3];
      if ($4 >>> 0 > $currFrameNum >>> 0) {
        var $frameNumWrap_0 = $4 - HEAP32[$maxFrameNum >> 2] | 0;
      } else {
        var $frameNumWrap_0 = $4;
      }
      var $frameNumWrap_0;
      HEAP32[$2$s2 + ($i_014 * 10 | 0) + 2] = $frameNumWrap_0;
      var $6 = HEAP32[$numRefFrames >> 2];
    } else {
      var $6 = $1;
    }
    var $6;
    var $inc = $i_014 + 1 | 0;
    if ($inc >>> 0 < $6 >>> 0) {
      var $i_014 = $inc;
      var $1 = $6;
    } else {
      break;
    }
  }
  return;
}
function _FindDpbPic($dpb, $picNum, $isShortTerm) {
  var $0 = HEAP32[$dpb + 24 >> 2];
  var $buffer21 = $dpb | 0;
  if (($isShortTerm | 0) == 0) {
    var $i_1_ph = 0;
    L2374 : while (1) {
      var $i_1_ph;
      var $cmp15 = $i_1_ph >>> 0 < $0 >>> 0;
      var $found_1 = 0;
      while (1) {
        var $found_1;
        if (!($cmp15 & ($found_1 | 0) == 0)) {
          var $found_2 = $found_1;
          var $i_2 = $i_1_ph;
          break L2374;
        }
        var $4 = HEAP32[$buffer21 >> 2];
        if ((HEAP32[($4 + 20 >> 2) + ($i_1_ph * 10 | 0)] | 0) != 3) {
          break;
        }
        if ((HEAP32[($4 + 8 >> 2) + ($i_1_ph * 10 | 0)] | 0) == ($picNum | 0)) {
          var $found_1 = 1;
        } else {
          break;
        }
      }
      var $i_1_ph = $i_1_ph + 1 | 0;
    }
    var $i_2;
    var $found_2;
    var $tobool36 = ($found_2 | 0) == 0;
    var $_i_2 = $tobool36 ? -1 : $i_2;
    return $_i_2;
  } else {
    var $i_0_ph = 0;
    L2382 : while (1) {
      var $i_0_ph;
      var $cmp = $i_0_ph >>> 0 < $0 >>> 0;
      var $found_0 = 0;
      while (1) {
        var $found_0;
        if (!($cmp & ($found_0 | 0) == 0)) {
          var $found_2 = $found_0;
          var $i_2 = $i_0_ph;
          break L2382;
        }
        var $1 = HEAP32[$buffer21 >> 2];
        if ((HEAP32[($1 + 20 >> 2) + ($i_0_ph * 10 | 0)] - 1 | 0) >>> 0 >= 2) {
          break;
        }
        if ((HEAP32[($1 + 8 >> 2) + ($i_0_ph * 10 | 0)] | 0) == ($picNum | 0)) {
          var $found_0 = 1;
        } else {
          break;
        }
      }
      var $i_0_ph = $i_0_ph + 1 | 0;
    }
    var $i_2;
    var $found_2;
    var $tobool36 = ($found_2 | 0) == 0;
    var $_i_2 = $tobool36 ? -1 : $i_2;
    return $_i_2;
  }
}
function _h264bsdPredictSamples($data, $mv, $refPic, $xA, $yA, $partX, $partY, $partWidth, $partHeight) {
  var $refPic$s2 = $refPic >> 2;
  var $add_ptr1 = ($partY << 4) + $data + $partX | 0;
  var $conv = HEAP16[$mv >> 1] << 16 >> 16;
  var $conv2 = HEAP16[$mv + 2 >> 1] << 16 >> 16;
  var $width4 = $refPic + 4 | 0;
  var $mul5 = HEAP32[$width4 >> 2] << 4;
  var $height6 = $refPic + 8 | 0;
  var $mul7 = HEAP32[$height6 >> 2] << 4;
  var $add = $partX + $xA | 0;
  var $add10 = ($conv >> 2) + $add | 0;
  var $add11 = $partY + $yA | 0;
  var $add15 = ($conv2 >> 2) + $add11 | 0;
  var $4 = HEAP32[(($conv & 3) << 4) + (($conv2 & 3) << 2) + 5243856 >> 2];
  if (($4 | 0) == 7) {
    _h264bsdInterpolateHorVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 2);
  } else if (($4 | 0) == 0) {
    _h264bsdFillBlock(HEAP32[$refPic$s2], $add_ptr1, $add10, $add15, $mul5, $mul7, $partWidth, $partHeight, 16);
  } else if (($4 | 0) == 1) {
    _h264bsdInterpolateVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 0);
  } else if (($4 | 0) == 4) {
    _h264bsdInterpolateHorQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15, $mul5, $mul7, $partWidth, $partHeight, 0);
  } else if (($4 | 0) == 5) {
    _h264bsdInterpolateHorVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 0);
  } else if (($4 | 0) == 9) {
    _h264bsdInterpolateMidVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 0);
  } else if (($4 | 0) == 3) {
    _h264bsdInterpolateVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 1);
  } else if (($4 | 0) == 10) {
    _h264bsdInterpolateMidHalf(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight);
  } else if (($4 | 0) == 14) {
    _h264bsdInterpolateMidHorQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 1);
  } else if (($4 | 0) == 11) {
    _h264bsdInterpolateMidVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 1);
  } else if (($4 | 0) == 8) {
    _h264bsdInterpolateHorHalf(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15, $mul5, $mul7, $partWidth, $partHeight);
  } else if (($4 | 0) == 13) {
    _h264bsdInterpolateHorVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 1);
  } else if (($4 | 0) == 2) {
    _h264bsdInterpolateVerHalf(HEAP32[$refPic$s2], $add_ptr1, $add10, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight);
  } else if (($4 | 0) == 12) {
    _h264bsdInterpolateHorQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15, $mul5, $mul7, $partWidth, $partHeight, 1);
  } else if (($4 | 0) == 6) {
    _h264bsdInterpolateMidHorQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 0);
  } else {
    _h264bsdInterpolateHorVerQuarter(HEAP32[$refPic$s2], $add_ptr1, $add10 - 2 | 0, $add15 - 2 | 0, $mul5, $mul7, $partWidth, $partHeight, 3);
  }
  var $mv_idx_val = HEAP32[$mv >> 2];
  _PredictChroma(($partY >>> 1 << 3) + $data + ($partX >>> 1) + 256 | 0, $add, $add11, $partWidth, $partHeight, $mv_idx_val & 65535, $mv_idx_val >>> 16 & 65535, HEAP32[$refPic$s2], HEAP32[$width4 >> 2], HEAP32[$height6 >> 2]);
  return;
}
_h264bsdPredictSamples["X"] = 1;
function _PredictChroma($mbPartChroma, $xAL, $yAL, $partWidth, $partHeight, $mv_0_0_val, $mv_0_1_val, $refPic_0_0_val, $refPic_0_1_val, $refPic_0_2_val) {
  var $mul = $refPic_0_1_val << 3;
  var $mul3 = $refPic_0_2_val << 3;
  var $conv = $mv_0_0_val << 16 >> 16;
  var $add = ($conv >> 3) + ($xAL >>> 1) | 0;
  var $conv6 = $mv_0_1_val << 16 >> 16;
  var $add8 = ($conv6 >> 3) + ($yAL >>> 1) | 0;
  var $and = $conv & 7;
  var $and13 = $conv6 & 7;
  var $shr14 = $partWidth >>> 1;
  var $shr15 = $partHeight >>> 1;
  var $mul19 = ($refPic_0_1_val << 8) * $refPic_0_2_val & -1;
  var $add_ptr = $refPic_0_0_val + $mul19 | 0;
  var $tobool = ($and | 0) != 0;
  var $tobool20 = ($and13 | 0) == 0;
  if (!($tobool20 | $tobool ^ 1)) {
    _h264bsdInterpolateChromaHorVer($add_ptr, $mbPartChroma, $add, $add8, $mul, $mul3, $and, $and13, $shr14, $shr15);
    return;
  }
  if ($tobool) {
    _h264bsdInterpolateChromaHor($add_ptr, $mbPartChroma, $add, $add8, $mul, $mul3, $and, $shr14, $shr15);
    return;
  }
  if ($tobool20) {
    _h264bsdFillBlock($add_ptr, $mbPartChroma, $add, $add8, $mul, $mul3, $shr14, $shr15, 8);
    _h264bsdFillBlock($refPic_0_0_val + ($mul3 * $mul & -1) + $mul19 | 0, $mbPartChroma + 64 | 0, $add, $add8, $mul, $mul3, $shr14, $shr15, 8);
    return;
  } else {
    _h264bsdInterpolateChromaVer($add_ptr, $mbPartChroma, $add, $add8, $mul, $mul3, $and13, $shr14, $shr15);
    return;
  }
}
function _h264bsdFillRow7($ref, $fill, $left, $center, $right) {
  if (($left | 0) == 0) {
    var $fill_addr_0_lcssa = $fill;
  } else {
    _memset($fill, HEAP8[$ref], $left);
    var $fill_addr_0_lcssa = $fill + $left | 0;
  }
  var $fill_addr_0_lcssa;
  if (($center | 0) == 0) {
    var $ref_addr_0_lcssa = $ref;
    var $fill_addr_1_lcssa = $fill_addr_0_lcssa;
  } else {
    var $scevgep = $fill_addr_0_lcssa + $center | 0;
    var $ref_addr_015 = $ref;
    var $fill_addr_116 = $fill_addr_0_lcssa;
    var $center_addr_017 = $center;
    while (1) {
      var $center_addr_017;
      var $fill_addr_116;
      var $ref_addr_015;
      HEAP8[$fill_addr_116] = HEAP8[$ref_addr_015];
      var $dec8 = $center_addr_017 - 1 | 0;
      if (($dec8 | 0) == 0) {
        break;
      }
      var $ref_addr_015 = $ref_addr_015 + 1 | 0;
      var $fill_addr_116 = $fill_addr_116 + 1 | 0;
      var $center_addr_017 = $dec8;
    }
    var $ref_addr_0_lcssa = $ref + $center | 0;
    var $fill_addr_1_lcssa = $scevgep;
  }
  var $fill_addr_1_lcssa;
  var $ref_addr_0_lcssa;
  if (($right | 0) == 0) {
    return;
  }
  _memset($fill_addr_1_lcssa, HEAP8[$ref_addr_0_lcssa - 1 | 0], $right);
  return;
}
function _FillRow1($ref, $fill, $left, $center, $right) {
  _H264SwDecMemcpy($fill, $ref, $center);
  return;
}
function _h264bsdReorderRefPicList($dpb, $order, $currFrameNum, $numRefIdxActive) {
  var $list48$s2;
  var $maxFrameNum$s2;
  var $buffer$s2;
  var $order$s2 = $order >> 2;
  var label = 0;
  _SetPicNums($dpb, $currFrameNum);
  if ((HEAP32[$order$s2] | 0) == 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $buffer$s2 = ($dpb | 0) >> 2;
  var $1 = HEAP32[$order$s2 + 1];
  if ($1 >>> 0 >= 3) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $maxFrameNum$s2 = ($dpb + 32 | 0) >> 2;
  var $list48$s2 = ($dpb + 4 | 0) >> 2;
  var $picNumPred_054 = $currFrameNum;
  var $refIdx_055 = 0;
  var $2 = $1;
  while (1) {
    var $2;
    var $refIdx_055;
    var $picNumPred_054;
    do {
      if ($2 >>> 0 < 2) {
        var $3 = HEAP32[$order$s2 + ($refIdx_055 * 3 | 0) + 2];
        do {
          if (($2 | 0) == 0) {
            var $sub = $picNumPred_054 - $3 | 0;
            if (($sub | 0) >= 0) {
              var $picNumNoWrap_0 = $sub;
              break;
            }
            var $picNumNoWrap_0 = HEAP32[$maxFrameNum$s2] + $sub | 0;
          } else {
            var $add19 = $3 + $picNumPred_054 | 0;
            var $5 = HEAP32[$maxFrameNum$s2];
            var $picNumNoWrap_0 = $add19 - (($add19 | 0) < ($5 | 0) ? 0 : $5) | 0;
          }
        } while (0);
        var $picNumNoWrap_0;
        if ($picNumNoWrap_0 >>> 0 <= $currFrameNum >>> 0) {
          var $isShortTerm_0 = 1;
          var $picNum_1 = $picNumNoWrap_0;
          var $picNumPred_1 = $picNumNoWrap_0;
          break;
        }
        var $isShortTerm_0 = 1;
        var $picNum_1 = $picNumNoWrap_0 - HEAP32[$maxFrameNum$s2] | 0;
        var $picNumPred_1 = $picNumNoWrap_0;
      } else {
        var $isShortTerm_0 = 0;
        var $picNum_1 = HEAP32[$order$s2 + ($refIdx_055 * 3 | 0) + 3];
        var $picNumPred_1 = $picNumPred_054;
      }
    } while (0);
    var $picNumPred_1;
    var $picNum_1;
    var $isShortTerm_0;
    var $call = _FindDpbPic($dpb, $picNum_1, $isShortTerm_0);
    if (($call | 0) < 0) {
      var $retval_0 = 1;
      label = 1916;
      break;
    }
    var $8 = HEAP32[$buffer$s2];
    if (HEAP32[($8 + 20 >> 2) + ($call * 10 | 0)] >>> 0 <= 1) {
      var $retval_0 = 1;
      label = 1917;
      break;
    }
    if ($refIdx_055 >>> 0 < $numRefIdxActive >>> 0) {
      var $j_046 = $numRefIdxActive;
      while (1) {
        var $j_046;
        var $sub42 = $j_046 - 1 | 0;
        var $10 = HEAP32[$list48$s2];
        HEAP32[$10 + ($j_046 << 2) >> 2] = HEAP32[$10 + ($sub42 << 2) >> 2];
        if ($sub42 >>> 0 > $refIdx_055 >>> 0) {
          var $j_046 = $sub42;
        } else {
          break;
        }
      }
      var $12 = HEAP32[$buffer$s2];
    } else {
      var $12 = $8;
    }
    var $12;
    var $inc = $refIdx_055 + 1 | 0;
    HEAP32[HEAP32[$list48$s2] + ($refIdx_055 << 2) >> 2] = $12 + $call * 40 | 0;
    L2465 : do {
      if ($inc >>> 0 <= $numRefIdxActive >>> 0) {
        var $j_148 = $inc;
        var $k_049 = $inc;
        while (1) {
          var $k_049;
          var $j_148;
          var $14 = HEAP32[$list48$s2];
          var $15 = HEAP32[$14 + ($j_148 << 2) >> 2];
          if (($15 | 0) == (HEAP32[$buffer$s2] + $call * 40 | 0)) {
            var $k_1 = $k_049;
          } else {
            HEAP32[$14 + ($k_049 << 2) >> 2] = $15;
            var $k_1 = $k_049 + 1 | 0;
          }
          var $k_1;
          var $inc66 = $j_148 + 1 | 0;
          if ($inc66 >>> 0 > $numRefIdxActive >>> 0) {
            break L2465;
          } else {
            var $j_148 = $inc66;
            var $k_049 = $k_1;
          }
        }
      }
    } while (0);
    var $17 = HEAP32[$order$s2 + ($inc * 3 | 0) + 1];
    if ($17 >>> 0 < 3) {
      var $picNumPred_054 = $picNumPred_1;
      var $refIdx_055 = $inc;
      var $2 = $17;
    } else {
      var $retval_0 = 0;
      label = 1918;
      break;
    }
  }
  if (label == 1916) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1917) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1918) {
    var $retval_0;
    return $retval_0;
  }
}
_h264bsdReorderRefPicList["X"] = 1;
function _h264bsdMarkDecRefPic($dpb, $mark, $image_0_0_val, $frameNum, $picOrderCnt, $isIdr, $currentPicId, $numErrMbs) {
  var $outBuf$s2;
  var $numOut122$s2;
  var $numRefFrames90$s2;
  var $noReordering$s2;
  var $currentOut$s2;
  var $mark$s2 = $mark >> 2;
  var $dpb$s2 = $dpb >> 2;
  var label = 0;
  var $currentOut$s2 = ($dpb + 8 | 0) >> 2;
  var $0 = HEAP32[$currentOut$s2];
  if ((HEAP32[$0 >> 2] | 0) != ($image_0_0_val | 0)) {
    return;
  }
  var $lastContainsMmco5 = $dpb + 52 | 0;
  HEAP32[$lastContainsMmco5 >> 2] = 0;
  var $noReordering$s2 = ($dpb + 56 | 0) >> 2;
  var $cond = (HEAP32[$noReordering$s2] | 0) == 0 & 1;
  do {
    if (($mark | 0) == 0) {
      HEAP32[$0 + 20 >> 2] = 0;
      HEAP32[HEAP32[$currentOut$s2] + 12 >> 2] = $frameNum;
      HEAP32[HEAP32[$currentOut$s2] + 8 >> 2] = $frameNum;
      HEAP32[HEAP32[$currentOut$s2] + 16 >> 2] = $picOrderCnt;
      HEAP32[HEAP32[$currentOut$s2] + 24 >> 2] = $cond;
      if ((HEAP32[$noReordering$s2] | 0) != 0) {
        break;
      }
      var $fullness = $dpb + 44 | 0;
      HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] + 1 | 0;
    } else {
      if (($isIdr | 0) != 0) {
        var $outIndex = $dpb + 20 | 0;
        HEAP32[$outIndex >> 2] = 0;
        var $numOut = $dpb + 16 | 0;
        HEAP32[$numOut >> 2] = 0;
        _Mmcop5($dpb);
        do {
          if ((HEAP32[$mark$s2] | 0) == 0) {
            if ((HEAP32[$noReordering$s2] | 0) == 0) {
              break;
            } else {
              label = 1928;
              break;
            }
          } else {
            label = 1928;
          }
        } while (0);
        if (label == 1928) {
          HEAP32[$numOut >> 2] = 0;
          HEAP32[$outIndex >> 2] = 0;
        }
        var $status29 = HEAP32[$currentOut$s2] + 20 | 0;
        if ((HEAP32[$mark$s2 + 1] | 0) == 0) {
          HEAP32[$status29 >> 2] = 2;
          HEAP32[$dpb$s2 + 9] = 65535;
        } else {
          HEAP32[$status29 >> 2] = 3;
          HEAP32[$dpb$s2 + 9] = 0;
        }
        HEAP32[HEAP32[$currentOut$s2] + 12 >> 2] = 0;
        HEAP32[HEAP32[$currentOut$s2] + 8 >> 2] = 0;
        HEAP32[HEAP32[$currentOut$s2] + 16 >> 2] = 0;
        HEAP32[HEAP32[$currentOut$s2] + 24 >> 2] = $cond;
        HEAP32[$dpb$s2 + 11] = 1;
        HEAP32[$dpb$s2 + 10] = 1;
        break;
      }
      if ((HEAP32[$mark$s2 + 2] | 0) == 0) {
        _SlidingWindowRefPicMarking($dpb);
        var $frameNum_addr_2103 = $frameNum;
      } else {
        var $markedAsLongTerm_0 = 0;
        var $i_0 = 0;
        var $frameNum_addr_0 = $frameNum;
        L2498 : while (1) {
          var $frameNum_addr_0;
          var $i_0;
          var $markedAsLongTerm_0;
          var $18 = HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 3];
          do {
            if (($18 | 0) == 4) {
              _Mmcop4($dpb, HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 7]);
              var $frameNum_addr_197 = $frameNum_addr_0;
              var $markedAsLongTerm_199 = $markedAsLongTerm_0;
              break;
            } else if (($18 | 0) == 6) {
              var $call77 = _Mmcop6($dpb, $frameNum_addr_0, $picOrderCnt, HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 6]);
              var $markedAsLongTerm_1 = ($call77 | 0) == 0 ? 1 : $markedAsLongTerm_0;
              var $status_1 = $call77;
              label = 1941;
              break;
            } else if (($18 | 0) == 5) {
              _Mmcop5($dpb);
              HEAP32[$lastContainsMmco5 >> 2] = 1;
              var $frameNum_addr_197 = 0;
              var $markedAsLongTerm_199 = $markedAsLongTerm_0;
              break;
            } else if (($18 | 0) == 2) {
              var $markedAsLongTerm_1 = $markedAsLongTerm_0;
              var $status_1 = _Mmcop2($dpb, HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 5]);
              label = 1941;
              break;
            } else if (($18 | 0) == 3) {
              var $markedAsLongTerm_1 = $markedAsLongTerm_0;
              var $status_1 = _Mmcop3($dpb, $frameNum_addr_0, HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 4], HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 6]);
              label = 1941;
              break;
            } else if (($18 | 0) == 1) {
              var $markedAsLongTerm_1 = $markedAsLongTerm_0;
              var $status_1 = _Mmcop1($dpb, $frameNum_addr_0, HEAP32[$mark$s2 + ($i_0 * 5 | 0) + 4]);
              label = 1941;
              break;
            } else {
              var $markedAsLongTerm_2 = $markedAsLongTerm_0;
              break L2498;
            }
          } while (0);
          if (label == 1941) {
            label = 0;
            var $status_1;
            var $markedAsLongTerm_1;
            if (($status_1 | 0) == 0) {
              var $frameNum_addr_197 = $frameNum_addr_0;
              var $markedAsLongTerm_199 = $markedAsLongTerm_1;
            } else {
              var $markedAsLongTerm_2 = $markedAsLongTerm_1;
              break;
            }
          }
          var $markedAsLongTerm_199;
          var $frameNum_addr_197;
          var $markedAsLongTerm_0 = $markedAsLongTerm_199;
          var $i_0 = $i_0 + 1 | 0;
          var $frameNum_addr_0 = $frameNum_addr_197;
        }
        var $markedAsLongTerm_2;
        if (($markedAsLongTerm_2 | 0) == 0) {
          var $frameNum_addr_2103 = $frameNum_addr_0;
        } else {
          break;
        }
      }
      var $frameNum_addr_2103;
      var $numRefFrames90$s2 = ($dpb + 40 | 0) >> 2;
      if (HEAP32[$numRefFrames90$s2] >>> 0 >= HEAP32[$dpb$s2 + 6] >>> 0) {
        break;
      }
      HEAP32[HEAP32[$currentOut$s2] + 12 >> 2] = $frameNum_addr_2103;
      HEAP32[HEAP32[$currentOut$s2] + 8 >> 2] = $frameNum_addr_2103;
      HEAP32[HEAP32[$currentOut$s2] + 16 >> 2] = $picOrderCnt;
      HEAP32[HEAP32[$currentOut$s2] + 20 >> 2] = 2;
      HEAP32[HEAP32[$currentOut$s2] + 24 >> 2] = $cond;
      var $fullness103 = $dpb + 44 | 0;
      HEAP32[$fullness103 >> 2] = HEAP32[$fullness103 >> 2] + 1 | 0;
      HEAP32[$numRefFrames90$s2] = HEAP32[$numRefFrames90$s2] + 1 | 0;
    }
  } while (0);
  HEAP32[HEAP32[$currentOut$s2] + 36 >> 2] = $isIdr;
  HEAP32[HEAP32[$currentOut$s2] + 28 >> 2] = $currentPicId;
  HEAP32[HEAP32[$currentOut$s2] + 32 >> 2] = $numErrMbs;
  L2514 : do {
    if ((HEAP32[$noReordering$s2] | 0) == 0) {
      var $fullness147 = $dpb + 44 | 0;
      var $dpbSize = $dpb + 28 | 0;
      var $39 = HEAP32[$dpbSize >> 2];
      if (HEAP32[$fullness147 >> 2] >>> 0 <= $39 >>> 0) {
        var $59 = $39;
        break;
      }
      while (1) {
        _OutputPicture($dpb);
        var $58 = HEAP32[$dpbSize >> 2];
        if (HEAP32[$fullness147 >> 2] >>> 0 <= $58 >>> 0) {
          var $59 = $58;
          break L2514;
        }
      }
    } else {
      var $numOut122$s2 = ($dpb + 16 | 0) >> 2;
      var $outBuf$s2 = ($dpb + 12 | 0) >> 2;
      HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut122$s2] << 4) >> 2] = HEAP32[HEAP32[$currentOut$s2] >> 2];
      HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut122$s2] << 4) + 12 >> 2] = HEAP32[HEAP32[$currentOut$s2] + 36 >> 2];
      HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut122$s2] << 4) + 4 >> 2] = HEAP32[HEAP32[$currentOut$s2] + 28 >> 2];
      HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut122$s2] << 4) + 8 >> 2] = HEAP32[HEAP32[$currentOut$s2] + 32 >> 2];
      HEAP32[$numOut122$s2] = HEAP32[$numOut122$s2] + 1 | 0;
      var $59 = HEAP32[$dpb$s2 + 7];
    }
  } while (0);
  var $59;
  _ShellSort(HEAP32[$dpb$s2], $59 + 1 | 0);
  return;
}
_h264bsdMarkDecRefPic["X"] = 1;
function _Mmcop5($dpb) {
  var $buffer = $dpb | 0;
  var $fullness = $dpb + 44 | 0;
  var $i_01 = 0;
  var $0 = HEAP32[$buffer >> 2];
  while (1) {
    var $0;
    var $i_01;
    var $status = $0 + $i_01 * 40 + 20 | 0;
    do {
      if ((HEAP32[$status >> 2] | 0) == 0) {
        var $5 = $0;
      } else {
        HEAP32[$status >> 2] = 0;
        var $2 = HEAP32[$buffer >> 2];
        if ((HEAP32[($2 + 24 >> 2) + ($i_01 * 10 | 0)] | 0) != 0) {
          var $5 = $2;
          break;
        }
        HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
        var $5 = $2;
      }
    } while (0);
    var $5;
    var $inc = $i_01 + 1 | 0;
    if (($inc | 0) == 16) {
      break;
    } else {
      var $i_01 = $inc;
      var $0 = $5;
    }
  }
  while (1) {
    if ((_OutputPicture($dpb) | 0) != 0) {
      break;
    }
  }
  HEAP32[$dpb + 40 >> 2] = 0;
  HEAP32[$dpb + 36 >> 2] = 65535;
  HEAP32[$dpb + 48 >> 2] = 0;
  return;
}
function _Mmcop1($dpb, $currPicNum, $differenceOfPicNums) {
  var $call = _FindDpbPic($dpb, $currPicNum - $differenceOfPicNums | 0, 1);
  if (($call | 0) < 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $buffer = $dpb | 0;
  HEAP32[(HEAP32[$buffer >> 2] + 20 >> 2) + ($call * 10 | 0)] = 0;
  var $numRefFrames = $dpb + 40 | 0;
  HEAP32[$numRefFrames >> 2] = HEAP32[$numRefFrames >> 2] - 1 | 0;
  if ((HEAP32[(HEAP32[$buffer >> 2] + 24 >> 2) + ($call * 10 | 0)] | 0) != 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $fullness = $dpb + 44 | 0;
  HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
function _Mmcop2($dpb, $longTermPicNum) {
  var $call = _FindDpbPic($dpb, $longTermPicNum, 0);
  if (($call | 0) < 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $buffer = $dpb | 0;
  HEAP32[(HEAP32[$buffer >> 2] + 20 >> 2) + ($call * 10 | 0)] = 0;
  var $numRefFrames = $dpb + 40 | 0;
  HEAP32[$numRefFrames >> 2] = HEAP32[$numRefFrames >> 2] - 1 | 0;
  if ((HEAP32[(HEAP32[$buffer >> 2] + 24 >> 2) + ($call * 10 | 0)] | 0) != 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $fullness = $dpb + 44 | 0;
  HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
function _Mmcop4($dpb, $maxLongTermFrameIdx) {
  var $maxLongTermFrameIdx1 = $dpb + 36 | 0;
  HEAP32[$maxLongTermFrameIdx1 >> 2] = $maxLongTermFrameIdx;
  var $maxRefFrames = $dpb + 24 | 0;
  if ((HEAP32[$maxRefFrames >> 2] | 0) == 0) {
    return;
  }
  var $buffer = $dpb | 0;
  var $numRefFrames = $dpb + 40 | 0;
  var $fullness = $dpb + 44 | 0;
  var $i_02 = 0;
  var $1 = HEAP32[$buffer >> 2];
  while (1) {
    var $1;
    var $i_02;
    var $status = $1 + $i_02 * 40 + 20 | 0;
    do {
      if ((HEAP32[$status >> 2] | 0) == 3) {
        if (HEAP32[($1 + 8 >> 2) + ($i_02 * 10 | 0)] >>> 0 <= $maxLongTermFrameIdx >>> 0) {
          if ((HEAP32[$maxLongTermFrameIdx1 >> 2] | 0) != 65535) {
            var $9 = $1;
            break;
          }
        }
        HEAP32[$status >> 2] = 0;
        HEAP32[$numRefFrames >> 2] = HEAP32[$numRefFrames >> 2] - 1 | 0;
        var $6 = HEAP32[$buffer >> 2];
        if ((HEAP32[($6 + 24 >> 2) + ($i_02 * 10 | 0)] | 0) != 0) {
          var $9 = $6;
          break;
        }
        HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
        var $9 = $6;
      } else {
        var $9 = $1;
      }
    } while (0);
    var $9;
    var $inc = $i_02 + 1 | 0;
    if ($inc >>> 0 < HEAP32[$maxRefFrames >> 2] >>> 0) {
      var $i_02 = $inc;
      var $1 = $9;
    } else {
      break;
    }
  }
  return;
}
function _Mmcop6($dpb, $frameNum, $picOrderCnt, $longTermFrameIdx) {
  var $currentOut$s2;
  var label = 0;
  var $0 = HEAP32[$dpb + 36 >> 2];
  if (($0 | 0) == 65535 | $0 >>> 0 < $longTermFrameIdx >>> 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $maxRefFrames = $dpb + 24 | 0;
  var $1 = HEAP32[$maxRefFrames >> 2];
  L2565 : do {
    if (($1 | 0) == 0) {
      label = 1995;
    } else {
      var $buffer = $dpb | 0;
      var $2 = HEAP32[$buffer >> 2];
      var $i_030 = 0;
      while (1) {
        var $i_030;
        var $status = $2 + $i_030 * 40 + 20 | 0;
        if ((HEAP32[$status >> 2] | 0) == 3) {
          if ((HEAP32[($2 + 8 >> 2) + ($i_030 * 10 | 0)] | 0) == ($longTermFrameIdx | 0)) {
            break;
          }
        }
        var $inc = $i_030 + 1 | 0;
        if ($inc >>> 0 < $1 >>> 0) {
          var $i_030 = $inc;
        } else {
          label = 1995;
          break L2565;
        }
      }
      HEAP32[$status >> 2] = 0;
      var $numRefFrames = $dpb + 40 | 0;
      var $dec = HEAP32[$numRefFrames >> 2] - 1 | 0;
      HEAP32[$numRefFrames >> 2] = $dec;
      if ((HEAP32[(HEAP32[$buffer >> 2] + 24 >> 2) + ($i_030 * 10 | 0)] | 0) != 0) {
        var $9 = $dec;
        break;
      }
      var $fullness = $dpb + 44 | 0;
      HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
      var $9 = $dec;
      break;
    }
  } while (0);
  if (label == 1995) {
    var $9 = HEAP32[$dpb + 40 >> 2];
  }
  var $9;
  var $numRefFrames18 = $dpb + 40 | 0;
  if ($9 >>> 0 >= HEAP32[$maxRefFrames >> 2] >>> 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $currentOut$s2 = ($dpb + 8 | 0) >> 2;
  HEAP32[HEAP32[$currentOut$s2] + 12 >> 2] = $frameNum;
  HEAP32[HEAP32[$currentOut$s2] + 8 >> 2] = $longTermFrameIdx;
  HEAP32[HEAP32[$currentOut$s2] + 16 >> 2] = $picOrderCnt;
  HEAP32[HEAP32[$currentOut$s2] + 20 >> 2] = 3;
  HEAP32[HEAP32[$currentOut$s2] + 24 >> 2] = (HEAP32[$dpb + 56 >> 2] | 0) == 0 & 1;
  HEAP32[$numRefFrames18 >> 2] = HEAP32[$numRefFrames18 >> 2] + 1 | 0;
  var $fullness38 = $dpb + 44 | 0;
  HEAP32[$fullness38 >> 2] = HEAP32[$fullness38 >> 2] + 1 | 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_Mmcop6["X"] = 1;
function _SlidingWindowRefPicMarking($dpb) {
  var $2$s2;
  var $numRefFrames$s2;
  var $numRefFrames$s2 = ($dpb + 40 | 0) >> 2;
  var $0 = HEAP32[$numRefFrames$s2];
  if ($0 >>> 0 < HEAP32[$dpb + 24 >> 2] >>> 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  if (($0 | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $buffer = $dpb | 0;
  var $2$s2 = HEAP32[$buffer >> 2] >> 2;
  var $index_021 = -1;
  var $picNum_022 = 0;
  var $i_023 = 0;
  while (1) {
    var $i_023;
    var $picNum_022;
    var $index_021;
    if ((HEAP32[$2$s2 + ($i_023 * 10 | 0) + 5] - 1 | 0) >>> 0 < 2) {
      var $4 = HEAP32[$2$s2 + ($i_023 * 10 | 0) + 2];
      var $or_cond = ($4 | 0) < ($picNum_022 | 0) | ($index_021 | 0) == -1;
      var $picNum_1 = $or_cond ? $4 : $picNum_022;
      var $index_1 = $or_cond ? $i_023 : $index_021;
    } else {
      var $picNum_1 = $picNum_022;
      var $index_1 = $index_021;
    }
    var $index_1;
    var $picNum_1;
    var $inc = $i_023 + 1 | 0;
    if ($inc >>> 0 < $0 >>> 0) {
      var $index_021 = $index_1;
      var $picNum_022 = $picNum_1;
      var $i_023 = $inc;
    } else {
      break;
    }
  }
  if (($index_1 | 0) <= -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$2$s2 + ($index_1 * 10 | 0) + 5] = 0;
  HEAP32[$numRefFrames$s2] = HEAP32[$numRefFrames$s2] - 1 | 0;
  if ((HEAP32[(HEAP32[$buffer >> 2] + 24 >> 2) + ($index_1 * 10 | 0)] | 0) != 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $fullness = $dpb + 44 | 0;
  HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_SlidingWindowRefPicMarking["X"] = 1;
function _h264bsdGetRefPicData($dpb, $index) {
  do {
    if ($index >>> 0 > 16) {
      var $retval_0 = 0;
    } else {
      var $1 = HEAP32[HEAP32[$dpb + 4 >> 2] + ($index << 2) >> 2];
      if (($1 | 0) == 0) {
        var $retval_0 = 0;
        break;
      }
      if (HEAP32[$1 + 20 >> 2] >>> 0 <= 1) {
        var $retval_0 = 0;
        break;
      }
      var $retval_0 = HEAP32[$1 >> 2];
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
function _h264bsdAllocateDpbImage($dpb) {
  var $add_ptr = HEAP32[$dpb >> 2] + HEAP32[$dpb + 28 >> 2] * 40 | 0;
  HEAP32[$dpb + 8 >> 2] = $add_ptr;
  return HEAP32[$add_ptr >> 2];
}
function _h264bsdInitRefPicList($dpb) {
  var $numRefFrames = $dpb + 40 | 0;
  if ((HEAP32[$numRefFrames >> 2] | 0) == 0) {
    return;
  }
  var $buffer = $dpb | 0;
  var $list = $dpb + 4 | 0;
  var $i_07 = 0;
  while (1) {
    var $i_07;
    HEAP32[HEAP32[$list >> 2] + ($i_07 << 2) >> 2] = HEAP32[$buffer >> 2] + $i_07 * 40 | 0;
    var $inc = $i_07 + 1 | 0;
    if ($inc >>> 0 < HEAP32[$numRefFrames >> 2] >>> 0) {
      var $i_07 = $inc;
    } else {
      break;
    }
  }
  return;
}
function _h264bsdDpbOutputPicture($dpb) {
  var $outIndex = $dpb + 20 | 0;
  var $0 = HEAP32[$outIndex >> 2];
  if ($0 >>> 0 >= HEAP32[$dpb + 16 >> 2] >>> 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $2 = HEAP32[$dpb + 12 >> 2];
  HEAP32[$outIndex >> 2] = $0 + 1 | 0;
  var $retval_0 = ($0 << 4) + $2 | 0;
  var $retval_0;
  return $retval_0;
}
function _ComparePictures($ptr1, $ptr2) {
  var $1 = HEAP32[$ptr1 + 20 >> 2];
  var $3 = HEAP32[$ptr2 + 20 >> 2];
  var $tobool2 = ($3 | 0) == 0;
  do {
    if (($1 | 0) == 0) {
      if (!$tobool2) {
        var $retval_0 = 1;
        break;
      }
      var $tobool12 = (HEAP32[$ptr2 + 24 >> 2] | 0) == 0;
      if ((HEAP32[$ptr1 + 24 >> 2] | 0) == 0) {
        if (!$tobool12) {
          var $retval_0 = 1;
          break;
        }
      } else {
        if ($tobool12) {
          var $retval_0 = -1;
          break;
        }
      }
      var $retval_0 = 0;
    } else {
      if ($tobool2) {
        var $retval_0 = -1;
        break;
      }
      var $switch = ($3 - 1 | 0) >>> 0 < 2;
      if (($1 - 1 | 0) >>> 0 < 2) {
        if (!$switch) {
          var $retval_0 = -1;
          break;
        }
        var $7 = HEAP32[$ptr1 + 8 >> 2];
        var $9 = HEAP32[$ptr2 + 8 >> 2];
        if (($7 | 0) > ($9 | 0)) {
          var $retval_0 = -1;
          break;
        }
        var $retval_0 = ($7 | 0) < ($9 | 0) & 1;
        break;
      } else {
        if ($switch) {
          var $retval_0 = 1;
          break;
        }
        var $11 = HEAP32[$ptr1 + 8 >> 2];
        var $13 = HEAP32[$ptr2 + 8 >> 2];
        if (($11 | 0) > ($13 | 0)) {
          var $retval_0 = 1;
          break;
        }
        var $retval_0 = (($11 | 0) < ($13 | 0)) << 31 >> 31;
        break;
      }
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
_ComparePictures["X"] = 1;
function _FindSmallestPicOrderCnt($dpb_0_0_val, $dpb_0_7_val) {
  var $i_010 = 0;
  var $picOrderCnt_011 = 2147483647;
  var $tmp_012 = 0;
  while (1) {
    var $tmp_012;
    var $picOrderCnt_011;
    var $i_010;
    if ((HEAP32[($dpb_0_0_val + 24 >> 2) + ($i_010 * 10 | 0)] | 0) == 0) {
      var $tmp_1 = $tmp_012;
      var $picOrderCnt_1 = $picOrderCnt_011;
    } else {
      var $1 = HEAP32[($dpb_0_0_val + 16 >> 2) + ($i_010 * 10 | 0)];
      var $cmp4 = ($1 | 0) < ($picOrderCnt_011 | 0);
      var $tmp_1 = $cmp4 ? $dpb_0_0_val + $i_010 * 40 | 0 : $tmp_012;
      var $picOrderCnt_1 = $cmp4 ? $1 : $picOrderCnt_011;
    }
    var $picOrderCnt_1;
    var $tmp_1;
    var $inc = $i_010 + 1 | 0;
    if ($inc >>> 0 > $dpb_0_7_val >>> 0) {
      break;
    } else {
      var $i_010 = $inc;
      var $picOrderCnt_011 = $picOrderCnt_1;
      var $tmp_012 = $tmp_1;
    }
  }
  return $tmp_1;
}
function _Mmcop3($dpb, $currPicNum, $differenceOfPicNums, $longTermFrameIdx) {
  var $0 = HEAP32[$dpb + 36 >> 2];
  if (($0 | 0) == 65535 | $0 >>> 0 < $longTermFrameIdx >>> 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $1 = HEAP32[$dpb + 24 >> 2];
  L2649 : do {
    if (($1 | 0) != 0) {
      var $buffer = $dpb | 0;
      var $2 = HEAP32[$buffer >> 2];
      var $i_025 = 0;
      while (1) {
        var $i_025;
        var $status = $2 + $i_025 * 40 + 20 | 0;
        if ((HEAP32[$status >> 2] | 0) == 3) {
          if ((HEAP32[($2 + 8 >> 2) + ($i_025 * 10 | 0)] | 0) == ($longTermFrameIdx | 0)) {
            break;
          }
        }
        var $inc = $i_025 + 1 | 0;
        if ($inc >>> 0 < $1 >>> 0) {
          var $i_025 = $inc;
        } else {
          break L2649;
        }
      }
      HEAP32[$status >> 2] = 0;
      var $numRefFrames = $dpb + 40 | 0;
      HEAP32[$numRefFrames >> 2] = HEAP32[$numRefFrames >> 2] - 1 | 0;
      if ((HEAP32[(HEAP32[$buffer >> 2] + 24 >> 2) + ($i_025 * 10 | 0)] | 0) != 0) {
        break;
      }
      var $fullness = $dpb + 44 | 0;
      HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
    }
  } while (0);
  var $call = _FindDpbPic($dpb, $currPicNum - $differenceOfPicNums | 0, 1);
  if (($call | 0) < 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $buffer22 = $dpb | 0;
  var $status24 = HEAP32[$buffer22 >> 2] + $call * 40 + 20 | 0;
  if (HEAP32[$status24 >> 2] >>> 0 <= 1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$status24 >> 2] = 3;
  HEAP32[(HEAP32[$buffer22 >> 2] + 8 >> 2) + ($call * 10 | 0)] = $longTermFrameIdx;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_Mmcop3["X"] = 1;
function _OutputPicture($dpb) {
  var $outBuf$s2;
  var $numOut$s2;
  var $call$s2;
  if ((HEAP32[$dpb + 56 >> 2] | 0) != 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $call = _FindSmallestPicOrderCnt(HEAP32[$dpb >> 2], HEAP32[$dpb + 28 >> 2]), $call$s2 = $call >> 2;
  if (($call | 0) == 0) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $numOut$s2 = ($dpb + 16 | 0) >> 2;
  var $outBuf$s2 = ($dpb + 12 | 0) >> 2;
  HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut$s2] << 4) >> 2] = HEAP32[$call$s2];
  HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut$s2] << 4) + 12 >> 2] = HEAP32[$call$s2 + 9];
  HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut$s2] << 4) + 4 >> 2] = HEAP32[$call$s2 + 7];
  HEAP32[HEAP32[$outBuf$s2] + (HEAP32[$numOut$s2] << 4) + 8 >> 2] = HEAP32[$call$s2 + 8];
  HEAP32[$numOut$s2] = HEAP32[$numOut$s2] + 1 | 0;
  HEAP32[$call$s2 + 6] = 0;
  if ((HEAP32[$call$s2 + 5] | 0) != 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $fullness = $dpb + 44 | 0;
  HEAP32[$fullness >> 2] = HEAP32[$fullness >> 2] - 1 | 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_OutputPicture["X"] = 1;
function _ShellSort($pPic, $num) {
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 40 | 0;
  var $0 = __stackBase__;
  var $step_024 = 7;
  while (1) {
    var $step_024;
    L2680 : do {
      if ($step_024 >>> 0 < $num >>> 0) {
        var $i_023 = $step_024;
        while (1) {
          var $i_023;
          var $1 = $pPic + $i_023 * 40 | 0;
          for (var $$src = $1 >> 2, $$dest = $0 >> 2, $$stop = $$src + 10; $$src < $$stop; $$src++, $$dest++) {
            HEAP32[$$dest] = HEAP32[$$src];
          }
          L2683 : do {
            if ($i_023 >>> 0 < $step_024 >>> 0) {
              var $j_0_lcssa = $i_023;
              label = 2082;
            } else {
              var $j_021 = $i_023;
              while (1) {
                var $j_021;
                var $add_ptr_sum = $j_021 - $step_024 | 0;
                var $2 = $pPic + $add_ptr_sum * 40 | 0;
                var $arrayidx6 = $pPic + $j_021 * 40 | 0;
                if ((_ComparePictures($2, $0) | 0) <= 0) {
                  var $arrayidx618 = $arrayidx6;
                  break L2683;
                }
                var $3 = $arrayidx6;
                for (var $$src = $2 >> 2, $$dest = $3 >> 2, $$stop = $$src + 10; $$src < $$stop; $$src++, $$dest++) {
                  HEAP32[$$dest] = HEAP32[$$src];
                }
                if ($add_ptr_sum >>> 0 < $step_024 >>> 0) {
                  var $j_0_lcssa = $add_ptr_sum;
                  label = 2082;
                  break L2683;
                } else {
                  var $j_021 = $add_ptr_sum;
                }
              }
            }
          } while (0);
          if (label == 2082) {
            label = 0;
            var $j_0_lcssa;
            var $arrayidx618 = $pPic + $j_0_lcssa * 40 | 0;
          }
          var $arrayidx618;
          var $4 = $arrayidx618;
          for (var $$src = $0 >> 2, $$dest = $4 >> 2, $$stop = $$src + 10; $$src < $$stop; $$src++, $$dest++) {
            HEAP32[$$dest] = HEAP32[$$src];
          }
          var $inc = $i_023 + 1 | 0;
          if (($inc | 0) == ($num | 0)) {
            break L2680;
          } else {
            var $i_023 = $inc;
          }
        }
      }
    } while (0);
    var $shr = $step_024 >>> 1;
    if (($shr | 0) == 0) {
      break;
    } else {
      var $step_024 = $shr;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
function _h264bsdInitDpb($dpb, $picSizeInMbs, $dpbSize, $maxRefFrames, $maxFrameNum, $noReordering) {
  var $buffer$s2;
  var $dpbSize4$s2;
  var $dpb$s2 = $dpb >> 2;
  HEAP32[$dpb$s2 + 9] = 65535;
  var $cond = $maxRefFrames >>> 0 > 1 ? $maxRefFrames : 1;
  HEAP32[$dpb$s2 + 6] = $cond;
  var $dpbSize4$s2 = ($dpb + 28 | 0) >> 2;
  HEAP32[$dpbSize4$s2] = ($noReordering | 0) == 0 ? $dpbSize : $cond;
  HEAP32[$dpb$s2 + 8] = $maxFrameNum;
  HEAP32[$dpb$s2 + 14] = $noReordering;
  HEAP32[$dpb$s2 + 11] = 0;
  HEAP32[$dpb$s2 + 10] = 0;
  HEAP32[$dpb$s2 + 12] = 0;
  var $call = _H264SwDecMalloc(680);
  var $buffer$s2 = ($dpb | 0) >> 2;
  HEAP32[$buffer$s2] = $call;
  if (($call | 0) == 0) {
    var $retval_0 = 65535;
    var $retval_0;
    return $retval_0;
  }
  _H264SwDecMemset($call, 0, 680);
  L2696 : do {
    if ((HEAP32[$dpbSize4$s2] | 0) != -1) {
      var $add1536 = $picSizeInMbs * 384 & -1 | 47;
      var $i_039 = 0;
      while (1) {
        var $i_039;
        var $call17 = _H264SwDecMalloc($add1536);
        HEAP32[(HEAP32[$buffer$s2] + 4 >> 2) + ($i_039 * 10 | 0)] = $call17;
        var $3 = HEAP32[$buffer$s2];
        var $4 = HEAP32[($3 + 4 >> 2) + ($i_039 * 10 | 0)];
        if (($4 | 0) == 0) {
          var $retval_0 = 65535;
          break;
        }
        HEAP32[($3 >> 2) + ($i_039 * 10 | 0)] = $4 + (-$4 & 15) | 0;
        var $inc = $i_039 + 1 | 0;
        if ($inc >>> 0 < (HEAP32[$dpbSize4$s2] + 1 | 0) >>> 0) {
          var $i_039 = $inc;
        } else {
          break L2696;
        }
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $list = $dpb + 4 | 0;
  HEAP32[$list >> 2] = _H264SwDecMalloc(68);
  var $call37 = _H264SwDecMalloc((HEAP32[$dpbSize4$s2] << 4) + 16 | 0);
  HEAP32[$dpb$s2 + 3] = $call37;
  var $11 = HEAP32[$list >> 2];
  if (($11 | 0) == 0 | ($call37 | 0) == 0) {
    var $retval_0 = 65535;
    var $retval_0;
    return $retval_0;
  }
  _H264SwDecMemset($11, 0, 68);
  HEAP32[$dpb$s2 + 5] = 0;
  HEAP32[$dpb$s2 + 4] = 0;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdInitDpb["X"] = 1;
function _h264bsdResetDpb($dpb, $picSizeInMbs, $dpbSize, $maxRefFrames, $maxFrameNum, $noReordering) {
  _h264bsdFreeDpb($dpb);
  return _h264bsdInitDpb($dpb, $picSizeInMbs, $dpbSize, $maxRefFrames, $maxFrameNum, $noReordering);
}
function _h264bsdFreeDpb($dpb) {
  var $buffer$s2;
  var $buffer$s2 = ($dpb | 0) >> 2;
  var $0 = HEAP32[$buffer$s2];
  L2709 : do {
    if (($0 | 0) == 0) {
      var $6 = 0;
    } else {
      var $dpbSize = $dpb + 28 | 0;
      if ((HEAP32[$dpbSize >> 2] | 0) == -1) {
        var $6 = $0;
        break;
      } else {
        var $i_015 = 0;
        var $2 = $0;
      }
      while (1) {
        var $2;
        var $i_015;
        _H264SwDecFree(HEAP32[($2 + 4 >> 2) + ($i_015 * 10 | 0)]);
        HEAP32[(HEAP32[$buffer$s2] + 4 >> 2) + ($i_015 * 10 | 0)] = 0;
        var $inc = $i_015 + 1 | 0;
        var $_pre17 = HEAP32[$buffer$s2];
        if ($inc >>> 0 < (HEAP32[$dpbSize >> 2] + 1 | 0) >>> 0) {
          var $i_015 = $inc;
          var $2 = $_pre17;
        } else {
          var $6 = $_pre17;
          break L2709;
        }
      }
    }
  } while (0);
  var $6;
  _H264SwDecFree($6);
  HEAP32[$buffer$s2] = 0;
  var $list = $dpb + 4 | 0;
  _H264SwDecFree(HEAP32[$list >> 2]);
  HEAP32[$list >> 2] = 0;
  var $outBuf = $dpb + 12 | 0;
  _H264SwDecFree(HEAP32[$outBuf >> 2]);
  HEAP32[$outBuf >> 2] = 0;
  return;
}
function _h264bsdCheckGapsInFrameNum($dpb, $frameNum, $isRefPic, $gapsAllowed) {
  var $fullness$s2;
  var $buffer$s2;
  var $dpbSize$s2;
  var $prevRefFrameNum$s2;
  var label = 0;
  var $numOut = $dpb + 16 | 0;
  HEAP32[$numOut >> 2] = 0;
  HEAP32[$dpb + 20 >> 2] = 0;
  if (($gapsAllowed | 0) == 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $prevRefFrameNum$s2 = ($dpb + 48 | 0) >> 2;
  var $0 = HEAP32[$prevRefFrameNum$s2];
  var $cmp = ($0 | 0) == ($frameNum | 0);
  L2718 : do {
    if ($cmp) {
      label = 2120;
    } else {
      var $maxFrameNum = $dpb + 32 | 0;
      var $rem = (($0 + 1 | 0) >>> 0) % (HEAP32[$maxFrameNum >> 2] >>> 0);
      if (($rem | 0) == ($frameNum | 0)) {
        label = 2120;
        break;
      }
      var $dpbSize$s2 = ($dpb + 28 | 0) >> 2;
      var $buffer$s2 = ($dpb | 0) >> 2;
      var $4 = HEAP32[(HEAP32[$buffer$s2] >> 2) + (HEAP32[$dpbSize$s2] * 10 | 0)];
      var $fullness$s2 = ($dpb + 44 | 0) >> 2;
      var $numRefFrames = $dpb + 40 | 0;
      var $unUsedShortTermFrameNum_0 = $rem;
      while (1) {
        var $unUsedShortTermFrameNum_0;
        _SetPicNums($dpb, $unUsedShortTermFrameNum_0);
        if ((_SlidingWindowRefPicMarking($dpb) | 0) != 0) {
          var $retval_0 = 1;
          label = 2128;
          break;
        }
        var $6 = HEAP32[$dpbSize$s2];
        L2724 : do {
          if (HEAP32[$fullness$s2] >>> 0 < $6 >>> 0) {
            var $_lcssa64 = $6;
          } else {
            while (1) {
              _OutputPicture($dpb);
              var $8 = HEAP32[$dpbSize$s2];
              if (HEAP32[$fullness$s2] >>> 0 < $8 >>> 0) {
                var $_lcssa64 = $8;
                break L2724;
              }
            }
          }
        } while (0);
        var $_lcssa64;
        HEAP32[(HEAP32[$buffer$s2] + 20 >> 2) + ($_lcssa64 * 10 | 0)] = 1;
        HEAP32[(HEAP32[$buffer$s2] + 12 >> 2) + (HEAP32[$dpbSize$s2] * 10 | 0)] = $unUsedShortTermFrameNum_0;
        HEAP32[(HEAP32[$buffer$s2] + 8 >> 2) + (HEAP32[$dpbSize$s2] * 10 | 0)] = $unUsedShortTermFrameNum_0;
        HEAP32[(HEAP32[$buffer$s2] + 16 >> 2) + (HEAP32[$dpbSize$s2] * 10 | 0)] = 0;
        HEAP32[(HEAP32[$buffer$s2] + 24 >> 2) + (HEAP32[$dpbSize$s2] * 10 | 0)] = 0;
        HEAP32[$fullness$s2] = HEAP32[$fullness$s2] + 1 | 0;
        HEAP32[$numRefFrames >> 2] = HEAP32[$numRefFrames >> 2] + 1 | 0;
        _ShellSort(HEAP32[$buffer$s2], HEAP32[$dpbSize$s2] + 1 | 0);
        var $rem37 = (($unUsedShortTermFrameNum_0 + 1 | 0) >>> 0) % (HEAP32[$maxFrameNum >> 2] >>> 0);
        if (($rem37 | 0) == ($frameNum | 0)) {
          break;
        } else {
          var $unUsedShortTermFrameNum_0 = $rem37;
        }
      }
      if (label == 2128) {
        var $retval_0;
        return $retval_0;
      }
      var $23 = HEAP32[$numOut >> 2];
      if (($23 | 0) == 0) {
        label = 2122;
        break;
      }
      var $outBuf = $dpb + 12 | 0;
      var $i_0 = 0;
      while (1) {
        var $i_0;
        if ($i_0 >>> 0 >= $23 >>> 0) {
          label = 2122;
          break L2718;
        }
        var $25 = HEAP32[HEAP32[$outBuf >> 2] + ($i_0 << 4) >> 2];
        var $26 = HEAP32[$dpbSize$s2];
        var $27 = HEAP32[$buffer$s2];
        if (($25 | 0) == (HEAP32[($27 >> 2) + ($26 * 10 | 0)] | 0)) {
          var $i_1 = 0;
          break;
        } else {
          var $i_0 = $i_0 + 1 | 0;
        }
      }
      while (1) {
        var $i_1;
        if ($i_1 >>> 0 >= $26 >>> 0) {
          label = 2122;
          break L2718;
        }
        var $data59 = $27 + $i_1 * 40 | 0;
        if ((HEAP32[$data59 >> 2] | 0) == ($4 | 0)) {
          break;
        } else {
          var $i_1 = $i_1 + 1 | 0;
        }
      }
      HEAP32[$data59 >> 2] = $25;
      HEAP32[(HEAP32[$buffer$s2] >> 2) + (HEAP32[$dpbSize$s2] * 10 | 0)] = $4;
      label = 2122;
      break;
    }
  } while (0);
  do {
    if (label == 2120) {
      if (($isRefPic | 0) == 0) {
        var $32 = $0;
        break;
      }
      if ($cmp) {
        var $retval_0 = 1;
      } else {
        label = 2122;
        break;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  do {
    if (label == 2122) {
      if (($isRefPic | 0) == 0) {
        var $32 = HEAP32[$prevRefFrameNum$s2];
        break;
      }
      HEAP32[$prevRefFrameNum$s2] = $frameNum;
      var $retval_0 = 0;
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $32;
  if (($32 | 0) == ($frameNum | 0)) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $33 = HEAP32[$dpb + 32 >> 2];
  HEAP32[$prevRefFrameNum$s2] = (($frameNum - 1 + $33 | 0) >>> 0) % ($33 >>> 0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdCheckGapsInFrameNum["X"] = 1;
function _h264bsdFlushDpb($dpb) {
  if ((HEAP32[$dpb >> 2] | 0) == 0) {
    return;
  }
  HEAP32[$dpb + 60 >> 2] = 1;
  while (1) {
    if ((_OutputPicture($dpb) | 0) != 0) {
      break;
    }
  }
  return;
}
function _h264bsdWriteMacroblock($image, $data) {
  var $11$s2;
  var $10$s2;
  var $ptr_042$s2;
  var $lum_041$s2;
  var $data$s2 = $data >> 2;
  var $0 = HEAP32[$image + 4 >> 2];
  var $3 = HEAP32[$image + 16 >> 2];
  var $4 = HEAP32[$image + 20 >> 2];
  var $mul = $0 << 2;
  var $scevgep44 = $data + 256 | 0;
  var $i_040 = 16;
  var $lum_041 = HEAP32[$image + 12 >> 2], $lum_041$s2 = $lum_041 >> 2;
  var $ptr_042 = $data, $ptr_042$s2 = $ptr_042 >> 2;
  while (1) {
    var $ptr_042;
    var $lum_041;
    var $i_040;
    var $7 = HEAP32[$ptr_042$s2 + 1];
    HEAP32[$lum_041$s2] = HEAP32[$ptr_042$s2];
    HEAP32[$lum_041$s2 + 1] = $7;
    var $9 = HEAP32[$ptr_042$s2 + 3];
    HEAP32[$lum_041$s2 + 2] = HEAP32[$ptr_042$s2 + 2];
    HEAP32[$lum_041$s2 + 3] = $9;
    var $dec = $i_040 - 1 | 0;
    if (($dec | 0) == 0) {
      break;
    } else {
      var $i_040 = $dec;
      var $lum_041 = ($mul << 2) + $lum_041 | 0, $lum_041$s2 = $lum_041 >> 2;
      var $ptr_042 = $ptr_042 + 16 | 0, $ptr_042$s2 = $ptr_042 >> 2;
    }
  }
  var $10$s2 = $3 >> 2;
  var $11$s2 = $4 >> 2;
  var $shr = $0 << 1 & 2147483646;
  var $16 = HEAP32[$data$s2 + 65];
  HEAP32[$10$s2] = HEAP32[$scevgep44 >> 2];
  HEAP32[$3 + 4 >> 2] = $16;
  var $21 = HEAP32[$data$s2 + 67];
  var $add_ptr19_sum46 = $shr | 1;
  HEAP32[($shr << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 66];
  HEAP32[($add_ptr19_sum46 << 2 >> 2) + $10$s2] = $21;
  var $25 = HEAP32[$data$s2 + 69];
  var $add_ptr19_1_sum47 = $mul | 1;
  HEAP32[($mul << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 68];
  HEAP32[($add_ptr19_1_sum47 << 2 >> 2) + $10$s2] = $25;
  var $add_ptr19_1_sum = $mul + $shr | 0;
  var $29 = HEAP32[$data$s2 + 71];
  var $add_ptr19_2_sum48 = $add_ptr19_1_sum | 1;
  HEAP32[($add_ptr19_1_sum << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 70];
  HEAP32[($add_ptr19_2_sum48 << 2 >> 2) + $10$s2] = $29;
  var $add_ptr19_2_sum = $add_ptr19_1_sum + $shr | 0;
  var $33 = HEAP32[$data$s2 + 73];
  var $add_ptr19_3_sum49 = $add_ptr19_2_sum | 1;
  HEAP32[($add_ptr19_2_sum << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 72];
  HEAP32[($add_ptr19_3_sum49 << 2 >> 2) + $10$s2] = $33;
  var $add_ptr19_3_sum = $add_ptr19_2_sum + $shr | 0;
  var $37 = HEAP32[$data$s2 + 75];
  var $add_ptr19_4_sum50 = $add_ptr19_3_sum | 1;
  HEAP32[($add_ptr19_3_sum << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 74];
  HEAP32[($add_ptr19_4_sum50 << 2 >> 2) + $10$s2] = $37;
  var $add_ptr19_4_sum = $add_ptr19_3_sum + $shr | 0;
  var $41 = HEAP32[$data$s2 + 77];
  var $add_ptr19_5_sum51 = $add_ptr19_4_sum | 1;
  HEAP32[($add_ptr19_4_sum << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 76];
  HEAP32[($add_ptr19_5_sum51 << 2 >> 2) + $10$s2] = $41;
  var $add_ptr19_5_sum = $add_ptr19_4_sum + $shr | 0;
  var $44 = HEAP32[$data$s2 + 79];
  var $add_ptr19_6_sum = $add_ptr19_5_sum | 1;
  HEAP32[($add_ptr19_5_sum << 2 >> 2) + $10$s2] = HEAP32[$data$s2 + 78];
  HEAP32[($add_ptr19_6_sum << 2 >> 2) + $10$s2] = $44;
  var $48 = HEAP32[$data$s2 + 81];
  HEAP32[$11$s2] = HEAP32[$data$s2 + 80];
  HEAP32[$4 + 4 >> 2] = $48;
  var $53 = HEAP32[$data$s2 + 83];
  HEAP32[($shr << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 82];
  HEAP32[($add_ptr19_sum46 << 2 >> 2) + $11$s2] = $53;
  var $57 = HEAP32[$data$s2 + 85];
  HEAP32[($mul << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 84];
  HEAP32[($add_ptr19_1_sum47 << 2 >> 2) + $11$s2] = $57;
  var $61 = HEAP32[$data$s2 + 87];
  HEAP32[($add_ptr19_1_sum << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 86];
  HEAP32[($add_ptr19_2_sum48 << 2 >> 2) + $11$s2] = $61;
  var $65 = HEAP32[$data$s2 + 89];
  HEAP32[($add_ptr19_2_sum << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 88];
  HEAP32[($add_ptr19_3_sum49 << 2 >> 2) + $11$s2] = $65;
  var $69 = HEAP32[$data$s2 + 91];
  HEAP32[($add_ptr19_3_sum << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 90];
  HEAP32[($add_ptr19_4_sum50 << 2 >> 2) + $11$s2] = $69;
  var $73 = HEAP32[$data$s2 + 93];
  HEAP32[($add_ptr19_4_sum << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 92];
  HEAP32[($add_ptr19_5_sum51 << 2 >> 2) + $11$s2] = $73;
  var $76 = HEAP32[$data$s2 + 95];
  HEAP32[($add_ptr19_5_sum << 2 >> 2) + $11$s2] = HEAP32[$data$s2 + 94];
  HEAP32[($add_ptr19_6_sum << 2 >> 2) + $11$s2] = $76;
  return;
}
_h264bsdWriteMacroblock["X"] = 1;
function _h264bsdWriteOutputBlocks($image_0_0_val, $image_0_1_val, $image_0_2_val, $mbNum, $data, $residual) {
  var $112$s2;
  var $add101$s2;
  var $add_ptr98_add_ptr94$s2;
  var $52$s2;
  var $add_ptr31_sum$s2;
  var $residual$s2 = $residual >> 2;
  var $mul = $image_0_2_val * $image_0_1_val & -1;
  var $rem = ($mbNum >>> 0) % ($image_0_1_val >>> 0);
  var $mul13 = $mbNum - $rem | 0;
  var $add_ptr_sum = ($mul13 << 8) + ($rem << 4) | 0;
  var $mul18 = $mul << 8;
  var $mul23 = $rem << 3;
  var $mul27 = $image_0_1_val << 4;
  var $div42 = $image_0_1_val << 2 & 1073741820;
  var $add_ptr43_sum = $div42 << 1;
  var $add_ptr45_sum = $add_ptr43_sum + $div42 | 0;
  var $block_0155 = 0;
  while (1) {
    var $block_0155;
    var $1 = HEAP32[($block_0155 << 2) + 5245544 >> 2];
    var $2 = HEAP32[($block_0155 << 2) + 5245480 >> 2];
    var $add_ptr31_sum = ($2 << 4) + $1 | 0, $add_ptr31_sum$s2 = $add_ptr31_sum >> 2;
    var $add_ptr32 = $data + $add_ptr31_sum | 0;
    var $add_ptr34_sum = $add_ptr_sum + $1 + ($2 * $mul27 & -1) | 0;
    var $add_ptr35 = $image_0_0_val + $add_ptr34_sum | 0;
    var $3 = HEAP32[($block_0155 << 6 >> 2) + $residual$s2];
    if (($3 | 0) == 16777215) {
      var $52$s2 = $add_ptr35 >> 2;
      var $55 = HEAP32[($data + 16 >> 2) + $add_ptr31_sum$s2];
      HEAP32[$52$s2] = HEAP32[$add_ptr32 >> 2];
      HEAP32[($div42 << 2 >> 2) + $52$s2] = $55;
      var $59 = HEAP32[($data + 48 >> 2) + $add_ptr31_sum$s2];
      HEAP32[($add_ptr43_sum << 2 >> 2) + $52$s2] = HEAP32[($data + 32 >> 2) + $add_ptr31_sum$s2];
      HEAP32[($add_ptr45_sum << 2 >> 2) + $52$s2] = $59;
    } else {
      var $conv53 = HEAPU8[$add_ptr31_sum + ($data + 1) | 0];
      var $7 = HEAP32[(($block_0155 << 6) + 4 >> 2) + $residual$s2];
      HEAP8[$add_ptr35] = HEAP8[$3 + HEAPU8[$add_ptr32] + 5244712 | 0];
      var $conv63 = HEAPU8[$add_ptr31_sum + ($data + 2) | 0];
      var $10 = HEAP32[(($block_0155 << 6) + 8 >> 2) + $residual$s2];
      HEAP8[$add_ptr34_sum + ($image_0_0_val + 1) | 0] = HEAP8[($conv53 | 512) + $7 + 5244200 | 0];
      var $conv71 = HEAPU8[$add_ptr31_sum + ($data + 3) | 0];
      var $13 = HEAP32[(($block_0155 << 6) + 12 >> 2) + $residual$s2];
      HEAP8[$add_ptr34_sum + ($image_0_0_val + 2) | 0] = HEAP8[$conv63 + ($10 + 5244712) | 0];
      HEAP8[$add_ptr34_sum + ($image_0_0_val + 3) | 0] = HEAP8[$conv71 + ($13 + 5244712) | 0];
      var $add_ptr35_sum165 = $add_ptr34_sum + $mul27 | 0;
      var $conv53_1 = HEAPU8[$add_ptr31_sum + ($data + 17) | 0];
      var $19 = HEAP32[(($block_0155 << 6) + 20 >> 2) + $residual$s2];
      HEAP8[$image_0_0_val + $add_ptr35_sum165 | 0] = HEAP8[HEAP32[(($block_0155 << 6) + 16 >> 2) + $residual$s2] + HEAPU8[$add_ptr31_sum + ($data + 16) | 0] + 5244712 | 0];
      var $conv63_1 = HEAPU8[$add_ptr31_sum + ($data + 18) | 0];
      var $22 = HEAP32[(($block_0155 << 6) + 24 >> 2) + $residual$s2];
      HEAP8[$add_ptr35_sum165 + ($image_0_0_val + 1) | 0] = HEAP8[($conv53_1 | 512) + $19 + 5244200 | 0];
      var $conv71_1 = HEAPU8[$add_ptr31_sum + ($data + 19) | 0];
      var $25 = HEAP32[(($block_0155 << 6) + 28 >> 2) + $residual$s2];
      HEAP8[$add_ptr35_sum165 + ($image_0_0_val + 2) | 0] = HEAP8[$conv63_1 + ($22 + 5244712) | 0];
      HEAP8[$add_ptr35_sum165 + ($image_0_0_val + 3) | 0] = HEAP8[$conv71_1 + ($25 + 5244712) | 0];
      var $add_ptr81_sum171 = $add_ptr35_sum165 + $mul27 | 0;
      var $conv53_2 = HEAPU8[$add_ptr31_sum + ($data + 33) | 0];
      var $31 = HEAP32[(($block_0155 << 6) + 36 >> 2) + $residual$s2];
      HEAP8[$image_0_0_val + $add_ptr81_sum171 | 0] = HEAP8[HEAP32[(($block_0155 << 6) + 32 >> 2) + $residual$s2] + HEAPU8[$add_ptr31_sum + ($data + 32) | 0] + 5244712 | 0];
      var $conv63_2 = HEAPU8[$add_ptr31_sum + ($data + 34) | 0];
      var $34 = HEAP32[(($block_0155 << 6) + 40 >> 2) + $residual$s2];
      HEAP8[$add_ptr81_sum171 + ($image_0_0_val + 1) | 0] = HEAP8[($conv53_2 | 512) + $31 + 5244200 | 0];
      var $conv71_2 = HEAPU8[$add_ptr31_sum + ($data + 35) | 0];
      var $37 = HEAP32[(($block_0155 << 6) + 44 >> 2) + $residual$s2];
      HEAP8[$add_ptr81_sum171 + ($image_0_0_val + 2) | 0] = HEAP8[$conv63_2 + ($34 + 5244712) | 0];
      HEAP8[$add_ptr81_sum171 + ($image_0_0_val + 3) | 0] = HEAP8[$conv71_2 + ($37 + 5244712) | 0];
      var $add_ptr81_1_sum177 = $add_ptr81_sum171 + $mul27 | 0;
      var $conv53_3 = HEAPU8[$add_ptr31_sum + ($data + 49) | 0];
      var $43 = HEAP32[(($block_0155 << 6) + 52 >> 2) + $residual$s2];
      HEAP8[$image_0_0_val + $add_ptr81_1_sum177 | 0] = HEAP8[HEAP32[(($block_0155 << 6) + 48 >> 2) + $residual$s2] + HEAPU8[$add_ptr31_sum + ($data + 48) | 0] + 5244712 | 0];
      var $conv63_3 = HEAPU8[$add_ptr31_sum + ($data + 50) | 0];
      var $46 = HEAP32[(($block_0155 << 6) + 56 >> 2) + $residual$s2];
      HEAP8[$add_ptr81_1_sum177 + ($image_0_0_val + 1) | 0] = HEAP8[($conv53_3 | 512) + $43 + 5244200 | 0];
      var $conv71_3 = HEAPU8[$add_ptr31_sum + ($data + 51) | 0];
      var $49 = HEAP32[(($block_0155 << 6) + 60 >> 2) + $residual$s2];
      HEAP8[$add_ptr81_1_sum177 + ($image_0_0_val + 2) | 0] = HEAP8[$conv63_3 + ($46 + 5244712) | 0];
      HEAP8[$add_ptr81_1_sum177 + ($image_0_0_val + 3) | 0] = HEAP8[$conv71_3 + ($49 + 5244712) | 0];
    }
    var $inc = $block_0155 + 1 | 0;
    if (($inc | 0) == 16) {
      break;
    } else {
      var $block_0155 = $inc;
    }
  }
  var $mul25 = $mul << 6;
  var $div84 = $image_0_1_val << 3 & 2147483640;
  var $add_ptr94 = $data + 256 | 0;
  var $add_ptr98 = $data + 320 | 0;
  var $add_ptr19_sum = ($mul13 << 6) + $mul23 + $mul18 | 0;
  var $div116 = $div84 >>> 2;
  var $add_ptr117_sum = $div84 >>> 1;
  var $add_ptr119_sum = $add_ptr117_sum + $div116 | 0;
  var $block_1150 = 16;
  while (1) {
    var $block_1150;
    var $and = $block_1150 & 3;
    var $61 = HEAP32[($and << 2) + 5245544 >> 2];
    var $62 = HEAP32[($and << 2) + 5245480 >> 2];
    var $cmp95 = $block_1150 >>> 0 > 19;
    var $add_ptr98_add_ptr94 = $cmp95 ? $add_ptr98 : $add_ptr94, $add_ptr98_add_ptr94$s2 = $add_ptr98_add_ptr94 >> 2;
    var $add101 = ($62 << 3) + $61 | 0, $add101$s2 = $add101 >> 2;
    var $add_ptr102 = $add_ptr98_add_ptr94 + $add101 | 0;
    var $imageBlock_1_sum = $add_ptr19_sum + ($cmp95 ? $mul25 : 0) + $61 + ($62 * $div84 & -1) | 0;
    var $add_ptr105 = $image_0_0_val + $imageBlock_1_sum | 0;
    var $63 = HEAP32[($block_1150 << 6 >> 2) + $residual$s2];
    if (($63 | 0) == 16777215) {
      var $112$s2 = $add_ptr105 >> 2;
      var $115 = HEAP32[$add101$s2 + ($add_ptr98_add_ptr94$s2 + 2)];
      HEAP32[$112$s2] = HEAP32[$add_ptr102 >> 2];
      HEAP32[($div116 << 2 >> 2) + $112$s2] = $115;
      var $119 = HEAP32[$add101$s2 + ($add_ptr98_add_ptr94$s2 + 6)];
      HEAP32[($add_ptr117_sum << 2 >> 2) + $112$s2] = HEAP32[$add101$s2 + ($add_ptr98_add_ptr94$s2 + 4)];
      HEAP32[($add_ptr119_sum << 2 >> 2) + $112$s2] = $119;
    } else {
      var $conv131 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 1) | 0];
      var $67 = HEAP32[(($block_1150 << 6) + 4 >> 2) + $residual$s2];
      HEAP8[$add_ptr105] = HEAP8[$63 + HEAPU8[$add_ptr102] + 5244712 | 0];
      var $conv142 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 2) | 0];
      var $70 = HEAP32[(($block_1150 << 6) + 8 >> 2) + $residual$s2];
      HEAP8[$imageBlock_1_sum + ($image_0_0_val + 1) | 0] = HEAP8[($conv131 | 512) + $67 + 5244200 | 0];
      var $conv150 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 3) | 0];
      var $73 = HEAP32[(($block_1150 << 6) + 12 >> 2) + $residual$s2];
      HEAP8[$imageBlock_1_sum + ($image_0_0_val + 2) | 0] = HEAP8[$conv142 + ($70 + 5244712) | 0];
      HEAP8[$imageBlock_1_sum + ($image_0_0_val + 3) | 0] = HEAP8[$conv150 + ($73 + 5244712) | 0];
      var $add_ptr105_sum188 = $imageBlock_1_sum + $div84 | 0;
      var $conv131_1 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 9) | 0];
      var $79 = HEAP32[(($block_1150 << 6) + 20 >> 2) + $residual$s2];
      HEAP8[$image_0_0_val + $add_ptr105_sum188 | 0] = HEAP8[HEAP32[(($block_1150 << 6) + 16 >> 2) + $residual$s2] + HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 8) | 0] + 5244712 | 0];
      var $conv142_1 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 10) | 0];
      var $82 = HEAP32[(($block_1150 << 6) + 24 >> 2) + $residual$s2];
      HEAP8[$add_ptr105_sum188 + ($image_0_0_val + 1) | 0] = HEAP8[($conv131_1 | 512) + $79 + 5244200 | 0];
      var $conv150_1 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 11) | 0];
      var $85 = HEAP32[(($block_1150 << 6) + 28 >> 2) + $residual$s2];
      HEAP8[$add_ptr105_sum188 + ($image_0_0_val + 2) | 0] = HEAP8[$conv142_1 + ($82 + 5244712) | 0];
      HEAP8[$add_ptr105_sum188 + ($image_0_0_val + 3) | 0] = HEAP8[$conv150_1 + ($85 + 5244712) | 0];
      var $add_ptr160_sum194 = $add_ptr105_sum188 + $div84 | 0;
      var $conv131_2 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 17) | 0];
      var $91 = HEAP32[(($block_1150 << 6) + 36 >> 2) + $residual$s2];
      HEAP8[$image_0_0_val + $add_ptr160_sum194 | 0] = HEAP8[HEAP32[(($block_1150 << 6) + 32 >> 2) + $residual$s2] + HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 16) | 0] + 5244712 | 0];
      var $conv142_2 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 18) | 0];
      var $94 = HEAP32[(($block_1150 << 6) + 40 >> 2) + $residual$s2];
      HEAP8[$add_ptr160_sum194 + ($image_0_0_val + 1) | 0] = HEAP8[($conv131_2 | 512) + $91 + 5244200 | 0];
      var $conv150_2 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 19) | 0];
      var $97 = HEAP32[(($block_1150 << 6) + 44 >> 2) + $residual$s2];
      HEAP8[$add_ptr160_sum194 + ($image_0_0_val + 2) | 0] = HEAP8[$conv142_2 + ($94 + 5244712) | 0];
      HEAP8[$add_ptr160_sum194 + ($image_0_0_val + 3) | 0] = HEAP8[$conv150_2 + ($97 + 5244712) | 0];
      var $add_ptr160_1_sum200 = $add_ptr160_sum194 + $div84 | 0;
      var $conv131_3 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 25) | 0];
      var $103 = HEAP32[(($block_1150 << 6) + 52 >> 2) + $residual$s2];
      HEAP8[$image_0_0_val + $add_ptr160_1_sum200 | 0] = HEAP8[HEAP32[(($block_1150 << 6) + 48 >> 2) + $residual$s2] + HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 24) | 0] + 5244712 | 0];
      var $conv142_3 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 26) | 0];
      var $106 = HEAP32[(($block_1150 << 6) + 56 >> 2) + $residual$s2];
      HEAP8[$add_ptr160_1_sum200 + ($image_0_0_val + 1) | 0] = HEAP8[($conv131_3 | 512) + $103 + 5244200 | 0];
      var $conv150_3 = HEAPU8[$add101 + ($add_ptr98_add_ptr94 + 27) | 0];
      var $109 = HEAP32[(($block_1150 << 6) + 60 >> 2) + $residual$s2];
      HEAP8[$add_ptr160_1_sum200 + ($image_0_0_val + 2) | 0] = HEAP8[$conv142_3 + ($106 + 5244712) | 0];
      HEAP8[$add_ptr160_1_sum200 + ($image_0_0_val + 3) | 0] = HEAP8[$conv150_3 + ($109 + 5244712) | 0];
    }
    var $inc166 = $block_1150 + 1 | 0;
    if (($inc166 | 0) == 24) {
      break;
    } else {
      var $block_1150 = $inc166;
    }
  }
  return;
}
_h264bsdWriteOutputBlocks["X"] = 1;
function _h264bsdFilterPicture($image, $mb) {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 164 | 0;
  var $0 = HEAP32[$image + 4 >> 2];
  var $data1 = $image | 0;
  var $height = $image + 8 | 0;
  var $1 = HEAP32[$height >> 2];
  var $mul = $1 * $0 & -1;
  if (($1 | 0) == 0) {
    STACKTOP = __stackBase__;
    return;
  }
  var $arraydecay = __stackBase__ | 0;
  var $arraydecay6 = __stackBase__ + 128 | 0;
  var $mul14 = $0 << 4;
  var $mul17 = $mul << 8;
  var $mul24 = $mul << 6;
  var $mul28 = $0 << 3;
  var $mbCol_029 = 0;
  var $mbRow_030 = 0;
  var $pMb_031 = $mb;
  while (1) {
    var $pMb_031;
    var $mbRow_030;
    var $mbCol_029;
    var $call = _GetMbFilteringFlags($pMb_031);
    do {
      if (($call | 0) != 0) {
        if ((_GetBoundaryStrengths($pMb_031, $arraydecay, $call) | 0) == 0) {
          break;
        }
        _GetLumaEdgeThresholds($arraydecay6, $pMb_031, $call);
        var $mul8 = $mbRow_030 * $0 & -1;
        _FilterLuma(($mul8 << 8) + ($mbCol_029 << 4) + HEAP32[$data1 >> 2] | 0, $arraydecay, $arraydecay6, $mul14);
        _GetChromaEdgeThresholds($arraydecay6, $pMb_031, $call, HEAP32[$pMb_031 + 24 >> 2]);
        var $4 = HEAP32[$data1 >> 2];
        var $add_ptr21_sum = ($mul8 << 6) + ($mbCol_029 << 3) + $mul17 | 0;
        _FilterChroma($4 + $add_ptr21_sum | 0, $4 + $add_ptr21_sum + $mul24 | 0, $arraydecay, $arraydecay6, $mul28);
      }
    } while (0);
    var $inc = $mbCol_029 + 1 | 0;
    var $cmp30 = ($inc | 0) == ($0 | 0);
    var $inc32_mbRow_0 = ($cmp30 & 1) + $mbRow_030 | 0;
    if ($inc32_mbRow_0 >>> 0 < HEAP32[$height >> 2] >>> 0) {
      var $mbCol_029 = $cmp30 ? 0 : $inc;
      var $mbRow_030 = $inc32_mbRow_0;
      var $pMb_031 = $pMb_031 + 216 | 0;
    } else {
      break;
    }
  }
  STACKTOP = __stackBase__;
  return;
}
_h264bsdFilterPicture["X"] = 1;
function _GetMbFilteringFlags($mb) {
  var $mb$s2 = $mb >> 2;
  var $0 = HEAP32[$mb$s2 + 2];
  if (($0 | 0) == 1) {
    var $flags_1 = 0;
    var $flags_1;
    return $flags_1;
  }
  var $1 = HEAP32[$mb$s2 + 50];
  do {
    if (($1 | 0) == 0) {
      var $flags_0 = 1;
    } else {
      if (($0 | 0) == 2) {
        if ((_IsSliceBoundaryOnLeft(HEAP32[$mb$s2 + 1], HEAP32[$1 + 4 >> 2]) | 0) != 0) {
          var $flags_0 = 1;
          break;
        }
      }
      var $flags_0 = 5;
    }
  } while (0);
  var $flags_0;
  var $2 = HEAP32[$mb$s2 + 51];
  if (($2 | 0) == 0) {
    var $flags_1 = $flags_0;
    var $flags_1;
    return $flags_1;
  }
  do {
    if (($0 | 0) == 2) {
      if ((_IsSliceBoundaryOnTop(HEAP32[$mb$s2 + 1], HEAP32[$2 + 4 >> 2]) | 0) == 0) {
        break;
      } else {
        var $flags_1 = $flags_0;
      }
      var $flags_1;
      return $flags_1;
    }
  } while (0);
  var $flags_1 = $flags_0 | 2;
  var $flags_1;
  return $flags_1;
}
function _GetBoundaryStrengths($mb, $bS, $flags) {
  var $arrayidx538$s1;
  var $arrayidx525$s1;
  var $arrayidx512$s1;
  var $arrayidx499$s1;
  var $arrayidx486$s1;
  var $arrayidx473$s1;
  var $arrayidx460$s1;
  var $arrayidx447$s1;
  var $arrayidx248$s1;
  var $arrayidx235$s1;
  var $arrayidx196$s1;
  var $arrayidx183$s1;
  var $mbA$s2;
  var $mbB$s2;
  var $bS$s2 = $bS >> 2;
  L2810 : do {
    if (($flags & 2 | 0) == 0) {
      HEAP32[$bS$s2 + 6] = 0;
      HEAP32[$bS$s2 + 4] = 0;
      HEAP32[$bS$s2 + 2] = 0;
      HEAP32[$bS$s2] = 0;
      var $nonZeroBs_0 = 0;
    } else {
      do {
        if (HEAP32[$mb >> 2] >>> 0 <= 5) {
          var $mbB$s2 = ($mb + 204 | 0) >> 2;
          var $1 = HEAP32[$mbB$s2];
          if (HEAP32[$1 >> 2] >>> 0 > 5) {
            break;
          }
          var $call = _EdgeBoundaryStrength($mb, $1, 0, 10);
          HEAP32[$bS$s2] = $call;
          var $call14 = _EdgeBoundaryStrength($mb, HEAP32[$mbB$s2], 1, 11);
          HEAP32[$bS$s2 + 2] = $call14;
          var $call18 = _EdgeBoundaryStrength($mb, HEAP32[$mbB$s2], 4, 14);
          HEAP32[$bS$s2 + 4] = $call18;
          var $call22 = _EdgeBoundaryStrength($mb, HEAP32[$mbB$s2], 5, 15);
          HEAP32[$bS$s2 + 6] = $call22;
          if (($call | $call14 | 0) == 0) {
            if (($call18 | $call22 | 0) == 0) {
              var $nonZeroBs_0 = 0;
              break L2810;
            }
          }
          var $nonZeroBs_0 = 1;
          break L2810;
        }
      } while (0);
      HEAP32[$bS$s2 + 6] = 4;
      HEAP32[$bS$s2 + 4] = 4;
      HEAP32[$bS$s2 + 2] = 4;
      HEAP32[$bS$s2] = 4;
      var $nonZeroBs_0 = 1;
    }
  } while (0);
  var $nonZeroBs_0;
  L2821 : do {
    if (($flags & 4 | 0) == 0) {
      HEAP32[$bS$s2 + 25] = 0;
      HEAP32[$bS$s2 + 17] = 0;
      HEAP32[$bS$s2 + 9] = 0;
      HEAP32[$bS$s2 + 1] = 0;
      var $nonZeroBs_1 = $nonZeroBs_0;
      var $mbType114_pre_phi = $mb | 0;
    } else {
      var $mbType55 = $mb | 0;
      do {
        if (HEAP32[$mbType55 >> 2] >>> 0 <= 5) {
          var $mbA$s2 = ($mb + 200 | 0) >> 2;
          var $11 = HEAP32[$mbA$s2];
          if (HEAP32[$11 >> 2] >>> 0 > 5) {
            break;
          }
          var $call70 = _EdgeBoundaryStrength($mb, $11, 0, 5);
          HEAP32[$bS$s2 + 1] = $call70;
          var $call74 = _EdgeBoundaryStrength($mb, HEAP32[$mbA$s2], 2, 7);
          HEAP32[$bS$s2 + 9] = $call74;
          var $call78 = _EdgeBoundaryStrength($mb, HEAP32[$mbA$s2], 8, 13);
          HEAP32[$bS$s2 + 17] = $call78;
          var $call82 = _EdgeBoundaryStrength($mb, HEAP32[$mbA$s2], 10, 15);
          HEAP32[$bS$s2 + 25] = $call82;
          if (($nonZeroBs_0 | 0) != 0) {
            var $nonZeroBs_1 = $nonZeroBs_0;
            var $mbType114_pre_phi = $mbType55;
            break L2821;
          }
          if (($call70 | $call74 | 0) == 0) {
            if (($call78 | $call82 | 0) == 0) {
              var $nonZeroBs_1 = 0;
              var $mbType114_pre_phi = $mbType55;
              break L2821;
            }
          }
          var $nonZeroBs_1 = 1;
          var $mbType114_pre_phi = $mbType55;
          break L2821;
        }
      } while (0);
      HEAP32[$bS$s2 + 25] = 4;
      HEAP32[$bS$s2 + 17] = 4;
      HEAP32[$bS$s2 + 9] = 4;
      HEAP32[$bS$s2 + 1] = 4;
      var $nonZeroBs_1 = 1;
      var $mbType114_pre_phi = $mbType55;
    }
  } while (0);
  var $mbType114_pre_phi;
  var $nonZeroBs_1;
  var $20 = HEAP32[$mbType114_pre_phi >> 2];
  if ($20 >>> 0 > 5) {
    HEAP32[$bS$s2 + 30] = 3;
    HEAP32[$bS$s2 + 28] = 3;
    HEAP32[$bS$s2 + 26] = 3;
    HEAP32[$bS$s2 + 24] = 3;
    HEAP32[$bS$s2 + 22] = 3;
    HEAP32[$bS$s2 + 20] = 3;
    HEAP32[$bS$s2 + 18] = 3;
    HEAP32[$bS$s2 + 16] = 3;
    HEAP32[$bS$s2 + 14] = 3;
    HEAP32[$bS$s2 + 12] = 3;
    HEAP32[$bS$s2 + 10] = 3;
    HEAP32[$bS$s2 + 8] = 3;
    HEAP32[$bS$s2 + 31] = 3;
    HEAP32[$bS$s2 + 29] = 3;
    HEAP32[$bS$s2 + 27] = 3;
    HEAP32[$bS$s2 + 23] = 3;
    HEAP32[$bS$s2 + 21] = 3;
    HEAP32[$bS$s2 + 19] = 3;
    HEAP32[$bS$s2 + 15] = 3;
    HEAP32[$bS$s2 + 13] = 3;
    HEAP32[$bS$s2 + 11] = 3;
    HEAP32[$bS$s2 + 7] = 3;
    HEAP32[$bS$s2 + 5] = 3;
    HEAP32[$bS$s2 + 3] = 3;
    var $nonZeroBs_2 = 1;
    var $nonZeroBs_2;
    return $nonZeroBs_2;
  }
  do {
    if ((_h264bsdNumMbPart($20) | 0) == 1) {
      _GetBoundaryStrengthsA($mb, $bS);
    } else {
      if (($20 | 0) == 2) {
        var $totalCoeff = $mb + 28 | 0;
        var $arrayidx174 = $mb + 32 | 0;
        if (HEAP16[$arrayidx174 >> 1] << 16 >> 16 == 0) {
          var $23 = HEAP16[$totalCoeff >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $23 = 2;
        }
        var $23;
        HEAP32[$bS$s2 + 8] = $23;
        var $arrayidx183$s1 = ($mb + 34 | 0) >> 1;
        if (HEAP16[$arrayidx183$s1] << 16 >> 16 == 0) {
          var $26 = HEAP16[$mb + 30 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $26 = 2;
        }
        var $26;
        HEAP32[$bS$s2 + 10] = $26;
        var $arrayidx196$s1 = ($mb + 40 | 0) >> 1;
        if (HEAP16[$arrayidx196$s1] << 16 >> 16 == 0) {
          var $29 = HEAP16[$mb + 36 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $29 = 2;
        }
        var $29;
        HEAP32[$bS$s2 + 12] = $29;
        var $arrayidx209 = $mb + 42 | 0;
        if (HEAP16[$arrayidx209 >> 1] << 16 >> 16 == 0) {
          var $32 = HEAP16[$mb + 38 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $32 = 2;
        }
        var $32;
        HEAP32[$bS$s2 + 14] = $32;
        var $arrayidx222 = $mb + 48 | 0;
        if (HEAP16[$arrayidx222 >> 1] << 16 >> 16 == 0) {
          var $35 = HEAP16[$mb + 44 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $35 = 2;
        }
        var $35;
        HEAP32[$bS$s2 + 24] = $35;
        var $arrayidx235$s1 = ($mb + 50 | 0) >> 1;
        if (HEAP16[$arrayidx235$s1] << 16 >> 16 == 0) {
          var $38 = HEAP16[$mb + 46 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $38 = 2;
        }
        var $38;
        HEAP32[$bS$s2 + 26] = $38;
        var $arrayidx248$s1 = ($mb + 56 | 0) >> 1;
        if (HEAP16[$arrayidx248$s1] << 16 >> 16 == 0) {
          var $41 = HEAP16[$mb + 52 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $41 = 2;
        }
        var $41;
        HEAP32[$bS$s2 + 28] = $41;
        var $arrayidx261 = $mb + 58 | 0;
        if (HEAP16[$arrayidx261 >> 1] << 16 >> 16 == 0) {
          var $44 = HEAP16[$mb + 54 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $44 = 2;
        }
        var $44;
        HEAP32[$bS$s2 + 30] = $44;
        HEAP32[$bS$s2 + 16] = _InnerBoundaryStrength($mb, 8, 2);
        HEAP32[$bS$s2 + 18] = _InnerBoundaryStrength($mb, 9, 3);
        HEAP32[$bS$s2 + 20] = _InnerBoundaryStrength($mb, 12, 6);
        HEAP32[$bS$s2 + 22] = _InnerBoundaryStrength($mb, 13, 7);
        var $arrayidx286 = $mb + 30 | 0;
        if (HEAP16[$arrayidx286 >> 1] << 16 >> 16 == 0) {
          var $47 = HEAP16[$totalCoeff >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $47 = 2;
        }
        var $47;
        HEAP32[$bS$s2 + 3] = $47;
        var $arrayidx299 = $mb + 36 | 0;
        if (HEAP16[$arrayidx299 >> 1] << 16 >> 16 == 0) {
          var $50 = HEAP16[$arrayidx286 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $50 = 2;
        }
        var $50;
        HEAP32[$bS$s2 + 5] = $50;
        if (HEAP16[$mb + 38 >> 1] << 16 >> 16 == 0) {
          var $53 = HEAP16[$arrayidx299 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $53 = 2;
        }
        var $53;
        HEAP32[$bS$s2 + 7] = $53;
        if (HEAP16[$arrayidx183$s1] << 16 >> 16 == 0) {
          var $56 = HEAP16[$arrayidx174 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $56 = 2;
        }
        var $56;
        HEAP32[$bS$s2 + 11] = $56;
        if (HEAP16[$arrayidx196$s1] << 16 >> 16 == 0) {
          var $59 = HEAP16[$arrayidx183$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $59 = 2;
        }
        var $59;
        HEAP32[$bS$s2 + 13] = $59;
        if (HEAP16[$arrayidx209 >> 1] << 16 >> 16 == 0) {
          var $62 = HEAP16[$arrayidx196$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $62 = 2;
        }
        var $62;
        HEAP32[$bS$s2 + 15] = $62;
        var $arrayidx364 = $mb + 46 | 0;
        if (HEAP16[$arrayidx364 >> 1] << 16 >> 16 == 0) {
          var $65 = HEAP16[$mb + 44 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $65 = 2;
        }
        var $65;
        HEAP32[$bS$s2 + 19] = $65;
        var $arrayidx377 = $mb + 52 | 0;
        if (HEAP16[$arrayidx377 >> 1] << 16 >> 16 == 0) {
          var $68 = HEAP16[$arrayidx364 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $68 = 2;
        }
        var $68;
        HEAP32[$bS$s2 + 21] = $68;
        if (HEAP16[$mb + 54 >> 1] << 16 >> 16 == 0) {
          var $71 = HEAP16[$arrayidx377 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $71 = 2;
        }
        var $71;
        HEAP32[$bS$s2 + 23] = $71;
        if (HEAP16[$arrayidx235$s1] << 16 >> 16 == 0) {
          var $74 = HEAP16[$arrayidx222 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $74 = 2;
        }
        var $74;
        HEAP32[$bS$s2 + 27] = $74;
        if (HEAP16[$arrayidx248$s1] << 16 >> 16 == 0) {
          var $77 = HEAP16[$arrayidx235$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $77 = 2;
        }
        var $77;
        HEAP32[$bS$s2 + 29] = $77;
        if (HEAP16[$arrayidx261 >> 1] << 16 >> 16 == 0) {
          var $80 = HEAP16[$arrayidx248$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $80 = 2;
        }
        var $80;
        HEAP32[$bS$s2 + 31] = $80;
        break;
      } else if (($20 | 0) == 3) {
        var $totalCoeff446 = $mb + 28 | 0;
        var $arrayidx447$s1 = ($mb + 32 | 0) >> 1;
        if (HEAP16[$arrayidx447$s1] << 16 >> 16 == 0) {
          var $83 = HEAP16[$totalCoeff446 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $83 = 2;
        }
        var $83;
        HEAP32[$bS$s2 + 8] = $83;
        var $arrayidx460$s1 = ($mb + 34 | 0) >> 1;
        if (HEAP16[$arrayidx460$s1] << 16 >> 16 == 0) {
          var $86 = HEAP16[$mb + 30 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $86 = 2;
        }
        var $86;
        HEAP32[$bS$s2 + 10] = $86;
        var $arrayidx473$s1 = ($mb + 40 | 0) >> 1;
        if (HEAP16[$arrayidx473$s1] << 16 >> 16 == 0) {
          var $89 = HEAP16[$mb + 36 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $89 = 2;
        }
        var $89;
        HEAP32[$bS$s2 + 12] = $89;
        var $arrayidx486$s1 = ($mb + 42 | 0) >> 1;
        if (HEAP16[$arrayidx486$s1] << 16 >> 16 == 0) {
          var $92 = HEAP16[$mb + 38 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $92 = 2;
        }
        var $92;
        HEAP32[$bS$s2 + 14] = $92;
        var $arrayidx499$s1 = ($mb + 44 | 0) >> 1;
        if (HEAP16[$arrayidx499$s1] << 16 >> 16 == 0) {
          var $95 = HEAP16[$arrayidx447$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $95 = 2;
        }
        var $95;
        HEAP32[$bS$s2 + 16] = $95;
        var $arrayidx512$s1 = ($mb + 46 | 0) >> 1;
        if (HEAP16[$arrayidx512$s1] << 16 >> 16 == 0) {
          var $98 = HEAP16[$arrayidx460$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $98 = 2;
        }
        var $98;
        HEAP32[$bS$s2 + 18] = $98;
        var $arrayidx525$s1 = ($mb + 52 | 0) >> 1;
        if (HEAP16[$arrayidx525$s1] << 16 >> 16 == 0) {
          var $101 = HEAP16[$arrayidx473$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $101 = 2;
        }
        var $101;
        HEAP32[$bS$s2 + 20] = $101;
        var $arrayidx538$s1 = ($mb + 54 | 0) >> 1;
        if (HEAP16[$arrayidx538$s1] << 16 >> 16 == 0) {
          var $104 = HEAP16[$arrayidx486$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $104 = 2;
        }
        var $104;
        HEAP32[$bS$s2 + 22] = $104;
        var $arrayidx551 = $mb + 48 | 0;
        if (HEAP16[$arrayidx551 >> 1] << 16 >> 16 == 0) {
          var $107 = HEAP16[$arrayidx499$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $107 = 2;
        }
        var $107;
        HEAP32[$bS$s2 + 24] = $107;
        var $arrayidx564 = $mb + 50 | 0;
        if (HEAP16[$arrayidx564 >> 1] << 16 >> 16 == 0) {
          var $110 = HEAP16[$arrayidx512$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $110 = 2;
        }
        var $110;
        HEAP32[$bS$s2 + 26] = $110;
        var $arrayidx577 = $mb + 56 | 0;
        if (HEAP16[$arrayidx577 >> 1] << 16 >> 16 == 0) {
          var $113 = HEAP16[$arrayidx525$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $113 = 2;
        }
        var $113;
        HEAP32[$bS$s2 + 28] = $113;
        var $arrayidx590 = $mb + 58 | 0;
        if (HEAP16[$arrayidx590 >> 1] << 16 >> 16 == 0) {
          var $116 = HEAP16[$arrayidx538$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $116 = 2;
        }
        var $116;
        HEAP32[$bS$s2 + 30] = $116;
        if (HEAP16[$mb + 30 >> 1] << 16 >> 16 == 0) {
          var $119 = HEAP16[$totalCoeff446 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $119 = 2;
        }
        var $119;
        HEAP32[$bS$s2 + 3] = $119;
        if (HEAP16[$mb + 38 >> 1] << 16 >> 16 == 0) {
          var $122 = HEAP16[$mb + 36 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $122 = 2;
        }
        var $122;
        HEAP32[$bS$s2 + 7] = $122;
        if (HEAP16[$arrayidx460$s1] << 16 >> 16 == 0) {
          var $125 = HEAP16[$arrayidx447$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $125 = 2;
        }
        var $125;
        HEAP32[$bS$s2 + 11] = $125;
        if (HEAP16[$arrayidx486$s1] << 16 >> 16 == 0) {
          var $128 = HEAP16[$arrayidx473$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $128 = 2;
        }
        var $128;
        HEAP32[$bS$s2 + 15] = $128;
        if (HEAP16[$arrayidx512$s1] << 16 >> 16 == 0) {
          var $131 = HEAP16[$arrayidx499$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $131 = 2;
        }
        var $131;
        HEAP32[$bS$s2 + 19] = $131;
        if (HEAP16[$arrayidx538$s1] << 16 >> 16 == 0) {
          var $134 = HEAP16[$arrayidx525$s1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $134 = 2;
        }
        var $134;
        HEAP32[$bS$s2 + 23] = $134;
        if (HEAP16[$arrayidx564 >> 1] << 16 >> 16 == 0) {
          var $137 = HEAP16[$arrayidx551 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $137 = 2;
        }
        var $137;
        HEAP32[$bS$s2 + 27] = $137;
        if (HEAP16[$arrayidx590 >> 1] << 16 >> 16 == 0) {
          var $140 = HEAP16[$arrayidx577 >> 1] << 16 >> 16 != 0 ? 2 : 0;
        } else {
          var $140 = 2;
        }
        var $140;
        HEAP32[$bS$s2 + 31] = $140;
        HEAP32[$bS$s2 + 5] = _InnerBoundaryStrength($mb, 4, 1);
        HEAP32[$bS$s2 + 13] = _InnerBoundaryStrength($mb, 6, 3);
        HEAP32[$bS$s2 + 21] = _InnerBoundaryStrength($mb, 12, 9);
        HEAP32[$bS$s2 + 29] = _InnerBoundaryStrength($mb, 14, 11);
        break;
      } else {
        HEAP32[$bS$s2 + 8] = _InnerBoundaryStrength($mb, 2, 0);
        HEAP32[$bS$s2 + 10] = _InnerBoundaryStrength($mb, 3, 1);
        HEAP32[$bS$s2 + 12] = _InnerBoundaryStrength($mb, 6, 4);
        HEAP32[$bS$s2 + 14] = _InnerBoundaryStrength($mb, 7, 5);
        HEAP32[$bS$s2 + 16] = _InnerBoundaryStrength($mb, 8, 2);
        HEAP32[$bS$s2 + 18] = _InnerBoundaryStrength($mb, 9, 3);
        HEAP32[$bS$s2 + 20] = _InnerBoundaryStrength($mb, 12, 6);
        HEAP32[$bS$s2 + 22] = _InnerBoundaryStrength($mb, 13, 7);
        HEAP32[$bS$s2 + 24] = _InnerBoundaryStrength($mb, 10, 8);
        HEAP32[$bS$s2 + 26] = _InnerBoundaryStrength($mb, 11, 9);
        HEAP32[$bS$s2 + 28] = _InnerBoundaryStrength($mb, 14, 12);
        HEAP32[$bS$s2 + 30] = _InnerBoundaryStrength($mb, 15, 13);
        HEAP32[$bS$s2 + 3] = _InnerBoundaryStrength($mb, 1, 0);
        HEAP32[$bS$s2 + 5] = _InnerBoundaryStrength($mb, 4, 1);
        HEAP32[$bS$s2 + 7] = _InnerBoundaryStrength($mb, 5, 4);
        HEAP32[$bS$s2 + 11] = _InnerBoundaryStrength($mb, 3, 2);
        HEAP32[$bS$s2 + 13] = _InnerBoundaryStrength($mb, 6, 3);
        HEAP32[$bS$s2 + 15] = _InnerBoundaryStrength($mb, 7, 6);
        HEAP32[$bS$s2 + 19] = _InnerBoundaryStrength($mb, 9, 8);
        HEAP32[$bS$s2 + 21] = _InnerBoundaryStrength($mb, 12, 9);
        HEAP32[$bS$s2 + 23] = _InnerBoundaryStrength($mb, 13, 12);
        HEAP32[$bS$s2 + 27] = _InnerBoundaryStrength($mb, 11, 10);
        HEAP32[$bS$s2 + 29] = _InnerBoundaryStrength($mb, 14, 11);
        HEAP32[$bS$s2 + 31] = _InnerBoundaryStrength($mb, 15, 14);
        break;
      }
    }
  } while (0);
  if (($nonZeroBs_1 | 0) != 0) {
    var $nonZeroBs_2 = $nonZeroBs_1;
    var $nonZeroBs_2;
    return $nonZeroBs_2;
  }
  do {
    if ((HEAP32[$bS$s2 + 8] | 0) == 0) {
      if ((HEAP32[$bS$s2 + 10] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 12] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 14] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 16] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 18] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 20] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 22] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 24] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 26] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 28] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 30] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 3] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 5] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 7] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 11] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 13] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 15] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 19] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 21] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 23] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 27] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 29] | 0) != 0) {
        break;
      }
      if ((HEAP32[$bS$s2 + 31] | 0) == 0) {
        var $nonZeroBs_2 = 0;
      } else {
        break;
      }
      var $nonZeroBs_2;
      return $nonZeroBs_2;
    }
  } while (0);
  var $nonZeroBs_2 = 1;
  var $nonZeroBs_2;
  return $nonZeroBs_2;
}
_GetBoundaryStrengths["X"] = 1;
function _GetBoundaryStrengthsA($mb, $bS) {
  var $arrayidx124$s1;
  var $arrayidx111$s1;
  var $arrayidx85$s1;
  var $arrayidx72$s1;
  var $arrayidx59$s1;
  var $arrayidx46$s1;
  var $arrayidx33$s1;
  var $arrayidx20$s1;
  var $arrayidx7$s1;
  var $arrayidx$s1;
  var $bS$s2 = $bS >> 2;
  var $totalCoeff = $mb + 28 | 0;
  var $arrayidx$s1 = ($mb + 32 | 0) >> 1;
  if (HEAP16[$arrayidx$s1] << 16 >> 16 == 0) {
    var $2 = HEAP16[$totalCoeff >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $2 = 2;
  }
  var $2;
  HEAP32[$bS$s2 + 8] = $2;
  var $arrayidx7$s1 = ($mb + 34 | 0) >> 1;
  if (HEAP16[$arrayidx7$s1] << 16 >> 16 == 0) {
    var $5 = HEAP16[$mb + 30 >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $5 = 2;
  }
  var $5;
  HEAP32[$bS$s2 + 10] = $5;
  var $arrayidx20$s1 = ($mb + 40 | 0) >> 1;
  if (HEAP16[$arrayidx20$s1] << 16 >> 16 == 0) {
    var $8 = HEAP16[$mb + 36 >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $8 = 2;
  }
  var $8;
  HEAP32[$bS$s2 + 12] = $8;
  var $arrayidx33$s1 = ($mb + 42 | 0) >> 1;
  if (HEAP16[$arrayidx33$s1] << 16 >> 16 == 0) {
    var $11 = HEAP16[$mb + 38 >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $11 = 2;
  }
  var $11;
  HEAP32[$bS$s2 + 14] = $11;
  var $arrayidx46$s1 = ($mb + 44 | 0) >> 1;
  if (HEAP16[$arrayidx46$s1] << 16 >> 16 == 0) {
    var $14 = HEAP16[$arrayidx$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $14 = 2;
  }
  var $14;
  HEAP32[$bS$s2 + 16] = $14;
  var $arrayidx59$s1 = ($mb + 46 | 0) >> 1;
  if (HEAP16[$arrayidx59$s1] << 16 >> 16 == 0) {
    var $17 = HEAP16[$arrayidx7$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $17 = 2;
  }
  var $17;
  HEAP32[$bS$s2 + 18] = $17;
  var $arrayidx72$s1 = ($mb + 52 | 0) >> 1;
  if (HEAP16[$arrayidx72$s1] << 16 >> 16 == 0) {
    var $20 = HEAP16[$arrayidx20$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $20 = 2;
  }
  var $20;
  HEAP32[$bS$s2 + 20] = $20;
  var $arrayidx85$s1 = ($mb + 54 | 0) >> 1;
  if (HEAP16[$arrayidx85$s1] << 16 >> 16 == 0) {
    var $23 = HEAP16[$arrayidx33$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $23 = 2;
  }
  var $23;
  HEAP32[$bS$s2 + 22] = $23;
  var $arrayidx98 = $mb + 48 | 0;
  if (HEAP16[$arrayidx98 >> 1] << 16 >> 16 == 0) {
    var $26 = HEAP16[$arrayidx46$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $26 = 2;
  }
  var $26;
  HEAP32[$bS$s2 + 24] = $26;
  var $arrayidx111$s1 = ($mb + 50 | 0) >> 1;
  if (HEAP16[$arrayidx111$s1] << 16 >> 16 == 0) {
    var $29 = HEAP16[$arrayidx59$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $29 = 2;
  }
  var $29;
  HEAP32[$bS$s2 + 26] = $29;
  var $arrayidx124$s1 = ($mb + 56 | 0) >> 1;
  if (HEAP16[$arrayidx124$s1] << 16 >> 16 == 0) {
    var $32 = HEAP16[$arrayidx72$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $32 = 2;
  }
  var $32;
  HEAP32[$bS$s2 + 28] = $32;
  var $arrayidx137 = $mb + 58 | 0;
  if (HEAP16[$arrayidx137 >> 1] << 16 >> 16 == 0) {
    var $35 = HEAP16[$arrayidx85$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $35 = 2;
  }
  var $35;
  HEAP32[$bS$s2 + 30] = $35;
  var $arrayidx150 = $mb + 30 | 0;
  if (HEAP16[$arrayidx150 >> 1] << 16 >> 16 == 0) {
    var $38 = HEAP16[$totalCoeff >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $38 = 2;
  }
  var $38;
  HEAP32[$bS$s2 + 3] = $38;
  var $arrayidx162 = $mb + 36 | 0;
  if (HEAP16[$arrayidx162 >> 1] << 16 >> 16 == 0) {
    var $41 = HEAP16[$arrayidx150 >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $41 = 2;
  }
  var $41;
  HEAP32[$bS$s2 + 5] = $41;
  if (HEAP16[$mb + 38 >> 1] << 16 >> 16 == 0) {
    var $44 = HEAP16[$arrayidx162 >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $44 = 2;
  }
  var $44;
  HEAP32[$bS$s2 + 7] = $44;
  if (HEAP16[$arrayidx7$s1] << 16 >> 16 == 0) {
    var $47 = HEAP16[$arrayidx$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $47 = 2;
  }
  var $47;
  HEAP32[$bS$s2 + 11] = $47;
  if (HEAP16[$arrayidx20$s1] << 16 >> 16 == 0) {
    var $50 = HEAP16[$arrayidx7$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $50 = 2;
  }
  var $50;
  HEAP32[$bS$s2 + 13] = $50;
  if (HEAP16[$arrayidx33$s1] << 16 >> 16 == 0) {
    var $53 = HEAP16[$arrayidx20$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $53 = 2;
  }
  var $53;
  HEAP32[$bS$s2 + 15] = $53;
  if (HEAP16[$arrayidx59$s1] << 16 >> 16 == 0) {
    var $56 = HEAP16[$arrayidx46$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $56 = 2;
  }
  var $56;
  HEAP32[$bS$s2 + 19] = $56;
  if (HEAP16[$arrayidx72$s1] << 16 >> 16 == 0) {
    var $59 = HEAP16[$arrayidx59$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $59 = 2;
  }
  var $59;
  HEAP32[$bS$s2 + 21] = $59;
  if (HEAP16[$arrayidx85$s1] << 16 >> 16 == 0) {
    var $62 = HEAP16[$arrayidx72$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $62 = 2;
  }
  var $62;
  HEAP32[$bS$s2 + 23] = $62;
  if (HEAP16[$arrayidx111$s1] << 16 >> 16 == 0) {
    var $65 = HEAP16[$arrayidx98 >> 1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $65 = 2;
  }
  var $65;
  HEAP32[$bS$s2 + 27] = $65;
  if (HEAP16[$arrayidx124$s1] << 16 >> 16 == 0) {
    var $68 = HEAP16[$arrayidx111$s1] << 16 >> 16 != 0 ? 2 : 0;
  } else {
    var $68 = 2;
  }
  var $68;
  HEAP32[$bS$s2 + 29] = $68;
  if (HEAP16[$arrayidx137 >> 1] << 16 >> 16 != 0) {
    var $71 = 2;
    var $71;
    var $left303 = $bS + 124 | 0;
    HEAP32[$left303 >> 2] = $71;
    return;
  }
  var $71 = HEAP16[$arrayidx124$s1] << 16 >> 16 != 0 ? 2 : 0;
  var $71;
  var $left303 = $bS + 124 | 0;
  HEAP32[$left303 >> 2] = $71;
  return;
}
_GetBoundaryStrengthsA["X"] = 1;
function _GetLumaEdgeThresholds($thresholds, $mb, $filteringFlags) {
  var $filterOffsetB$s2;
  var $filterOffsetA$s2;
  var $thresholds$s2 = $thresholds >> 2;
  var $0 = HEAP32[$mb + 20 >> 2];
  var $filterOffsetA$s2 = ($mb + 12 | 0) >> 2;
  var $call = _clip(0, 51, HEAP32[$filterOffsetA$s2] + $0 | 0);
  var $filterOffsetB$s2 = ($mb + 16 | 0) >> 2;
  var $call2 = _clip(0, 51, HEAP32[$filterOffsetB$s2] + $0 | 0);
  var $conv = HEAPU8[$call + 5247236 | 0];
  HEAP32[$thresholds$s2 + 7] = $conv;
  var $conv5 = HEAPU8[$call2 + 5247184 | 0];
  HEAP32[$thresholds$s2 + 8] = $conv5;
  var $arraydecay = $call * 3 + 5243468 | 0;
  HEAP32[$thresholds$s2 + 6] = $arraydecay;
  do {
    if (($filteringFlags & 2 | 0) != 0) {
      var $6 = HEAP32[HEAP32[$mb + 204 >> 2] + 20 >> 2];
      if (($6 | 0) == ($0 | 0)) {
        HEAP32[$thresholds$s2 + 1] = $conv;
        HEAP32[$thresholds$s2 + 2] = $conv5;
        HEAP32[$thresholds$s2] = $arraydecay;
        break;
      } else {
        var $shr = ($6 + ($0 + 1) | 0) >>> 1;
        var $call16 = _clip(0, 51, HEAP32[$filterOffsetA$s2] + $shr | 0);
        var $call19 = _clip(0, 51, HEAP32[$filterOffsetB$s2] + $shr | 0);
        HEAP32[$thresholds$s2 + 1] = HEAPU8[$call16 + 5247236 | 0];
        HEAP32[$thresholds$s2 + 2] = HEAPU8[$call19 + 5247184 | 0];
        HEAP32[$thresholds$s2] = $call16 * 3 + 5243468 | 0;
        break;
      }
    }
  } while (0);
  if (($filteringFlags & 4 | 0) == 0) {
    return;
  }
  var $12 = HEAP32[HEAP32[$mb + 200 >> 2] + 20 >> 2];
  if (($12 | 0) == ($0 | 0)) {
    HEAP32[$thresholds$s2 + 4] = $conv;
    HEAP32[$thresholds$s2 + 5] = $conv5;
    HEAP32[$thresholds$s2 + 3] = $arraydecay;
    return;
  } else {
    var $shr54 = ($12 + ($0 + 1) | 0) >>> 1;
    var $call57 = _clip(0, 51, HEAP32[$filterOffsetA$s2] + $shr54 | 0);
    var $call60 = _clip(0, 51, HEAP32[$filterOffsetB$s2] + $shr54 | 0);
    HEAP32[$thresholds$s2 + 4] = HEAPU8[$call57 + 5247236 | 0];
    HEAP32[$thresholds$s2 + 5] = HEAPU8[$call60 + 5247184 | 0];
    HEAP32[$thresholds$s2 + 3] = $call57 * 3 + 5243468 | 0;
    return;
  }
}
_GetLumaEdgeThresholds["X"] = 1;
function _FilterLuma($data, $bS, $thresholds, $width) {
  var $tmp_055$s2;
  var label = 0;
  var $mul = $width << 2;
  var $add_ptr31 = $thresholds + 24 | 0;
  var $add_ptr = $thresholds + 12 | 0;
  var $tmp_055 = $bS, $tmp_055$s2 = $tmp_055 >> 2;
  var $ptr_056 = $data;
  var $offset_058 = 0;
  var $dec59 = 3;
  while (1) {
    var $dec59;
    var $offset_058;
    var $ptr_056;
    var $tmp_055;
    var $0 = HEAP32[$tmp_055$s2 + 1];
    if (($0 | 0) != 0) {
      _FilterVerLumaEdge($ptr_056, $0, $add_ptr, $width);
    }
    var $1 = HEAP32[$tmp_055$s2 + 3];
    if (($1 | 0) != 0) {
      _FilterVerLumaEdge($ptr_056 + 4 | 0, $1, $add_ptr31, $width);
    }
    var $arrayidx15 = $tmp_055 + 16 | 0;
    var $2 = HEAP32[$tmp_055$s2 + 5];
    if (($2 | 0) != 0) {
      _FilterVerLumaEdge($ptr_056 + 8 | 0, $2, $add_ptr31, $width);
    }
    var $arrayidx24 = $tmp_055 + 24 | 0;
    var $3 = HEAP32[$tmp_055$s2 + 7];
    if (($3 | 0) != 0) {
      _FilterVerLumaEdge($ptr_056 + 12 | 0, $3, $add_ptr31, $width);
    }
    var $4 = HEAP32[$tmp_055$s2];
    var $top35 = $tmp_055 + 8 | 0;
    var $5 = HEAP32[$top35 >> 2];
    do {
      if (($4 | 0) == ($5 | 0)) {
        if (($4 | 0) != (HEAP32[$arrayidx15 >> 2] | 0)) {
          label = 2390;
          break;
        }
        if (($4 | 0) != (HEAP32[$arrayidx24 >> 2] | 0)) {
          label = 2390;
          break;
        }
        if (($4 | 0) == 0) {
          break;
        }
        _FilterHorLuma($ptr_056, $4, $thresholds + $offset_058 * 12 | 0, $width);
        break;
      } else {
        label = 2390;
      }
    } while (0);
    do {
      if (label == 2390) {
        label = 0;
        if (($4 | 0) == 0) {
          var $8 = $5;
        } else {
          _FilterHorLumaEdge($ptr_056, $4, $thresholds + $offset_058 * 12 | 0, $width);
          var $8 = HEAP32[$top35 >> 2];
        }
        var $8;
        if (($8 | 0) != 0) {
          _FilterHorLumaEdge($ptr_056 + 4 | 0, $8, $thresholds + $offset_058 * 12 | 0, $width);
        }
        var $9 = HEAP32[$arrayidx15 >> 2];
        if (($9 | 0) != 0) {
          _FilterHorLumaEdge($ptr_056 + 8 | 0, $9, $thresholds + $offset_058 * 12 | 0, $width);
        }
        var $10 = HEAP32[$arrayidx24 >> 2];
        if (($10 | 0) == 0) {
          break;
        }
        _FilterHorLumaEdge($ptr_056 + 12 | 0, $10, $thresholds + $offset_058 * 12 | 0, $width);
      }
    } while (0);
    if (($dec59 | 0) == 0) {
      break;
    } else {
      var $tmp_055 = $tmp_055 + 32 | 0, $tmp_055$s2 = $tmp_055 >> 2;
      var $ptr_056 = $ptr_056 + $mul | 0;
      var $offset_058 = 2;
      var $dec59 = $dec59 - 1 | 0;
    }
  }
  return;
}
_FilterLuma["X"] = 1;
function _GetChromaEdgeThresholds($thresholds, $mb, $filteringFlags, $chromaQpIndexOffset) {
  var $filterOffsetB$s2;
  var $filterOffsetA$s2;
  var $qpY$s2;
  var $thresholds$s2 = $thresholds >> 2;
  var $qpY$s2 = ($mb + 20 | 0) >> 2;
  var $1 = HEAP32[(_clip(0, 51, HEAP32[$qpY$s2] + $chromaQpIndexOffset | 0) << 2) + 5243992 >> 2];
  var $filterOffsetA$s2 = ($mb + 12 | 0) >> 2;
  var $call2 = _clip(0, 51, HEAP32[$filterOffsetA$s2] + $1 | 0);
  var $filterOffsetB$s2 = ($mb + 16 | 0) >> 2;
  var $call4 = _clip(0, 51, HEAP32[$filterOffsetB$s2] + $1 | 0);
  var $conv = HEAPU8[$call2 + 5247236 | 0];
  HEAP32[$thresholds$s2 + 7] = $conv;
  var $conv8 = HEAPU8[$call4 + 5247184 | 0];
  HEAP32[$thresholds$s2 + 8] = $conv8;
  var $arraydecay = $call2 * 3 + 5243468 | 0;
  HEAP32[$thresholds$s2 + 6] = $arraydecay;
  do {
    if (($filteringFlags & 2 | 0) != 0) {
      var $7 = HEAP32[HEAP32[$mb + 204 >> 2] + 20 >> 2];
      if (($7 | 0) == (HEAP32[$qpY$s2] | 0)) {
        HEAP32[$thresholds$s2 + 1] = $conv;
        HEAP32[$thresholds$s2 + 2] = $conv8;
        HEAP32[$thresholds$s2] = $arraydecay;
        break;
      } else {
        var $shr = ($1 + HEAP32[(_clip(0, 51, $7 + $chromaQpIndexOffset | 0) << 2) + 5243992 >> 2] + 1 | 0) >>> 1;
        var $call23 = _clip(0, 51, $shr + HEAP32[$filterOffsetA$s2] | 0);
        var $call26 = _clip(0, 51, HEAP32[$filterOffsetB$s2] + $shr | 0);
        HEAP32[$thresholds$s2 + 1] = HEAPU8[$call23 + 5247236 | 0];
        HEAP32[$thresholds$s2 + 2] = HEAPU8[$call26 + 5247184 | 0];
        HEAP32[$thresholds$s2] = $call23 * 3 + 5243468 | 0;
        break;
      }
    }
  } while (0);
  if (($filteringFlags & 4 | 0) == 0) {
    return;
  }
  var $15 = HEAP32[HEAP32[$mb + 200 >> 2] + 20 >> 2];
  if (($15 | 0) == (HEAP32[$qpY$s2] | 0)) {
    HEAP32[$thresholds$s2 + 4] = $conv;
    HEAP32[$thresholds$s2 + 5] = $conv8;
    HEAP32[$thresholds$s2 + 3] = $arraydecay;
    return;
  } else {
    var $shr65 = ($1 + HEAP32[(_clip(0, 51, $15 + $chromaQpIndexOffset | 0) << 2) + 5243992 >> 2] + 1 | 0) >>> 1;
    var $call68 = _clip(0, 51, $shr65 + HEAP32[$filterOffsetA$s2] | 0);
    var $call71 = _clip(0, 51, HEAP32[$filterOffsetB$s2] + $shr65 | 0);
    HEAP32[$thresholds$s2 + 4] = HEAPU8[$call68 + 5247236 | 0];
    HEAP32[$thresholds$s2 + 5] = HEAPU8[$call71 + 5247184 | 0];
    HEAP32[$thresholds$s2 + 3] = $call68 * 3 + 5243468 | 0;
    return;
  }
}
_GetChromaEdgeThresholds["X"] = 1;
function _FilterChroma($dataCb, $dataCr, $bS, $thresholds, $width) {
  var $top53$s2;
  var $top$s2;
  var label = 0;
  var $mul130 = $width << 2;
  var $mul38 = $width << 1;
  var $add_ptr39_sum = $mul38 + 4 | 0;
  var $add_ptr43 = $thresholds + 24 | 0;
  var $add_ptr14 = $thresholds + 12 | 0;
  var $dataCr_addr_0102 = $dataCr;
  var $dataCb_addr_0104 = $dataCb;
  var $vblock_0106 = 0;
  var $tmp_0107 = $bS;
  var $offset_0109 = 0;
  while (1) {
    var $offset_0109;
    var $tmp_0107;
    var $vblock_0106;
    var $dataCb_addr_0104;
    var $dataCr_addr_0102;
    var $left = $tmp_0107 + 4 | 0;
    var $0 = HEAP32[$left >> 2];
    if (($0 | 0) != 0) {
      _FilterVerChromaEdge($dataCb_addr_0104, $0, $add_ptr14, $width);
      _FilterVerChromaEdge($dataCr_addr_0102, HEAP32[$left >> 2], $add_ptr14, $width);
    }
    var $left8 = $tmp_0107 + 36 | 0;
    var $2 = HEAP32[$left8 >> 2];
    if (($2 | 0) != 0) {
      _FilterVerChromaEdge($dataCb_addr_0104 + $mul38 | 0, $2, $add_ptr14, $width);
      _FilterVerChromaEdge($dataCr_addr_0102 + $mul38 | 0, HEAP32[$left8 >> 2], $add_ptr14, $width);
    }
    var $arrayidx21 = $tmp_0107 + 16 | 0;
    var $left22 = $tmp_0107 + 20 | 0;
    var $4 = HEAP32[$left22 >> 2];
    if (($4 | 0) != 0) {
      _FilterVerChromaEdge($dataCb_addr_0104 + 4 | 0, $4, $add_ptr43, $width);
      _FilterVerChromaEdge($dataCr_addr_0102 + 4 | 0, HEAP32[$left22 >> 2], $add_ptr43, $width);
    }
    var $left35 = $tmp_0107 + 52 | 0;
    var $6 = HEAP32[$left35 >> 2];
    if (($6 | 0) != 0) {
      _FilterVerChromaEdge($dataCb_addr_0104 + $add_ptr39_sum | 0, $6, $add_ptr43, $width);
      _FilterVerChromaEdge($dataCr_addr_0102 + $add_ptr39_sum | 0, HEAP32[$left35 >> 2], $add_ptr43, $width);
    }
    var $top$s2 = ($tmp_0107 | 0) >> 2;
    var $8 = HEAP32[$top$s2];
    var $top53$s2 = ($tmp_0107 + 8 | 0) >> 2;
    var $9 = HEAP32[$top53$s2];
    do {
      if (($8 | 0) == ($9 | 0)) {
        if (($8 | 0) != (HEAP32[$arrayidx21 >> 2] | 0)) {
          label = 2426;
          break;
        }
        if (($8 | 0) != (HEAP32[$tmp_0107 + 24 >> 2] | 0)) {
          label = 2426;
          break;
        }
        if (($8 | 0) == 0) {
          break;
        }
        var $add_ptr73 = $thresholds + $offset_0109 * 12 | 0;
        _FilterHorChroma($dataCb_addr_0104, $8, $add_ptr73, $width);
        _FilterHorChroma($dataCr_addr_0102, HEAP32[$top$s2], $add_ptr73, $width);
        break;
      } else {
        label = 2426;
      }
    } while (0);
    do {
      if (label == 2426) {
        label = 0;
        if (($8 | 0) == 0) {
          var $14 = $9;
        } else {
          var $add_ptr84 = $thresholds + $offset_0109 * 12 | 0;
          _FilterHorChromaEdge($dataCb_addr_0104, $8, $add_ptr84, $width);
          _FilterHorChromaEdge($dataCr_addr_0102, HEAP32[$top$s2], $add_ptr84, $width);
          var $14 = HEAP32[$top53$s2];
        }
        var $14;
        if (($14 | 0) != 0) {
          var $add_ptr96 = $thresholds + $offset_0109 * 12 | 0;
          _FilterHorChromaEdge($dataCb_addr_0104 + 2 | 0, $14, $add_ptr96, $width);
          _FilterHorChromaEdge($dataCr_addr_0102 + 2 | 0, HEAP32[$top53$s2], $add_ptr96, $width);
        }
        var $top103 = $arrayidx21 | 0;
        var $16 = HEAP32[$top103 >> 2];
        if (($16 | 0) != 0) {
          var $add_ptr109 = $thresholds + $offset_0109 * 12 | 0;
          _FilterHorChromaEdge($dataCb_addr_0104 + 4 | 0, $16, $add_ptr109, $width);
          _FilterHorChromaEdge($dataCr_addr_0102 + 4 | 0, HEAP32[$top103 >> 2], $add_ptr109, $width);
        }
        var $top116 = $tmp_0107 + 24 | 0;
        var $18 = HEAP32[$top116 >> 2];
        if (($18 | 0) == 0) {
          break;
        }
        var $add_ptr122 = $thresholds + $offset_0109 * 12 | 0;
        _FilterHorChromaEdge($dataCb_addr_0104 + 6 | 0, $18, $add_ptr122, $width);
        _FilterHorChromaEdge($dataCr_addr_0102 + 6 | 0, HEAP32[$top116 >> 2], $add_ptr122, $width);
      }
    } while (0);
    var $inc = $vblock_0106 + 1 | 0;
    if (($inc | 0) == 2) {
      break;
    } else {
      var $dataCr_addr_0102 = $dataCr_addr_0102 + $mul130 | 0;
      var $dataCb_addr_0104 = $dataCb_addr_0104 + $mul130 | 0;
      var $vblock_0106 = $inc;
      var $tmp_0107 = $tmp_0107 + 64 | 0;
      var $offset_0109 = 2;
    }
  }
  return;
}
_FilterChroma["X"] = 1;
function _FilterVerChromaEdge($data, $bS, $thresholds, $width) {
  var $arrayidx1 = $data - 1 | 0;
  var $2 = HEAP8[$data + 1 | 0];
  var $conv = HEAPU8[$arrayidx1];
  var $conv4 = HEAPU8[$data];
  var $alpha = $thresholds + 4 | 0;
  do {
    if (Math.abs($conv - $conv4 | 0) >>> 0 < HEAP32[$alpha >> 2] >>> 0) {
      var $conv6 = HEAPU8[$data - 2 | 0];
      var $call9 = Math.abs($conv6 - $conv | 0);
      var $5 = HEAP32[$thresholds + 8 >> 2];
      if ($call9 >>> 0 >= $5 >>> 0) {
        break;
      }
      var $conv13 = $2 & 255;
      if (Math.abs($conv13 - $conv4 | 0) >>> 0 >= $5 >>> 0) {
        break;
      }
      if ($bS >>> 0 < 4) {
        var $conv25 = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
        var $call35 = _clip($conv25 ^ -1, $conv25 + 1 | 0, 4 - $conv13 + ($conv4 - $conv << 2) + $conv6 >> 3);
        var $9 = HEAP8[($conv4 | 512) - $call35 + 5244200 | 0];
        HEAP8[$arrayidx1] = HEAP8[($conv | 512) + $call35 + 5244200 | 0];
        HEAP8[$data] = $9;
        break;
      } else {
        HEAP8[$arrayidx1] = (($conv6 << 1) + $conv + $conv13 + 2 | 0) >>> 2 & 255;
        HEAP8[$data] = (($conv13 << 1) + $conv4 + $conv6 + 2 | 0) >>> 2 & 255;
        break;
      }
    }
  } while (0);
  var $add_ptr = $data + $width | 0;
  var $arrayidx65 = $data + ($width - 1) | 0;
  var $12 = HEAP8[$width + ($data + 1) | 0];
  var $conv68 = HEAPU8[$arrayidx65];
  var $conv69 = HEAPU8[$add_ptr];
  if (Math.abs($conv68 - $conv69 | 0) >>> 0 >= HEAP32[$alpha >> 2] >>> 0) {
    return;
  }
  var $conv76 = HEAPU8[$data + ($width - 2) | 0];
  var $call79 = Math.abs($conv76 - $conv68 | 0);
  var $15 = HEAP32[$thresholds + 8 >> 2];
  if ($call79 >>> 0 >= $15 >>> 0) {
    return;
  }
  var $conv84 = $12 & 255;
  if (Math.abs($conv84 - $conv69 | 0) >>> 0 >= $15 >>> 0) {
    return;
  }
  if ($bS >>> 0 < 4) {
    var $conv98 = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
    var $call111 = _clip($conv98 ^ -1, $conv98 + 1 | 0, 4 - $conv84 + ($conv69 - $conv68 << 2) + $conv76 >> 3);
    var $19 = HEAP8[($conv69 | 512) - $call111 + 5244200 | 0];
    HEAP8[$arrayidx65] = HEAP8[($conv68 | 512) + $call111 + 5244200 | 0];
    HEAP8[$add_ptr] = $19;
    return;
  } else {
    HEAP8[$arrayidx65] = (($conv76 << 1) + $conv68 + $conv84 + 2 | 0) >>> 2 & 255;
    HEAP8[$add_ptr] = (($conv84 << 1) + $conv69 + $conv76 + 2 | 0) >>> 2 & 255;
    return;
  }
}
_FilterVerChromaEdge["X"] = 1;
function _FilterHorChroma($data, $bS, $thresholds, $width) {
  if ($bS >>> 0 < 4) {
    var $conv = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
    var $add = $conv + 1 | 0;
    var $sub1 = -$width | 0;
    var $alpha = $thresholds + 4 | 0;
    var $mul = $sub1 << 1;
    var $beta = $thresholds + 8 | 0;
    var $sub27 = $conv ^ -1;
    var $i_057 = 7;
    var $data_addr_058 = $data;
    while (1) {
      var $data_addr_058;
      var $i_057;
      var $arrayidx4 = $data_addr_058 + $sub1 | 0;
      var $4 = HEAP8[$data_addr_058 + $width | 0];
      var $conv7 = HEAPU8[$arrayidx4];
      var $conv8 = HEAPU8[$data_addr_058];
      do {
        if (Math.abs($conv7 - $conv8 | 0) >>> 0 < HEAP32[$alpha >> 2] >>> 0) {
          var $conv12 = HEAPU8[$data_addr_058 + $mul | 0];
          var $call15 = Math.abs($conv12 - $conv7 | 0);
          var $7 = HEAP32[$beta >> 2];
          if ($call15 >>> 0 >= $7 >>> 0) {
            break;
          }
          var $conv19 = $4 & 255;
          if (Math.abs($conv19 - $conv8 | 0) >>> 0 >= $7 >>> 0) {
            break;
          }
          var $call36 = _clip($sub27, $add, 4 - $conv19 + ($conv8 - $conv7 << 2) + $conv12 >> 3);
          var $9 = HEAP8[($conv8 | 512) - $call36 + 5244200 | 0];
          HEAP8[$arrayidx4] = HEAP8[($conv7 | 512) + $call36 + 5244200 | 0];
          HEAP8[$data_addr_058] = $9;
        }
      } while (0);
      if (($i_057 | 0) == 0) {
        break;
      }
      var $i_057 = $i_057 - 1 | 0;
      var $data_addr_058 = $data_addr_058 + 1 | 0;
    }
    return;
  } else {
    var $sub49 = -$width | 0;
    var $alpha60 = $thresholds + 4 | 0;
    var $mul50 = $sub49 << 1;
    var $beta68 = $thresholds + 8 | 0;
    var $i_160 = 7;
    var $data_addr_161 = $data;
    while (1) {
      var $data_addr_161;
      var $i_160;
      var $arrayidx53 = $data_addr_161 + $sub49 | 0;
      var $12 = HEAP8[$data_addr_161 + $width | 0];
      var $conv56 = HEAPU8[$arrayidx53];
      var $conv57 = HEAPU8[$data_addr_161];
      do {
        if (Math.abs($conv56 - $conv57 | 0) >>> 0 < HEAP32[$alpha60 >> 2] >>> 0) {
          var $conv64 = HEAPU8[$data_addr_161 + $mul50 | 0];
          var $call67 = Math.abs($conv64 - $conv56 | 0);
          var $15 = HEAP32[$beta68 >> 2];
          if ($call67 >>> 0 >= $15 >>> 0) {
            break;
          }
          var $conv72 = $12 & 255;
          if (Math.abs($conv72 - $conv57 | 0) >>> 0 >= $15 >>> 0) {
            break;
          }
          HEAP8[$arrayidx53] = (($conv64 << 1) + $conv56 + $conv72 + 2 | 0) >>> 2 & 255;
          HEAP8[$data_addr_161] = (($conv72 << 1) + $conv57 + $conv64 + 2 | 0) >>> 2 & 255;
        }
      } while (0);
      if (($i_160 | 0) == 0) {
        break;
      }
      var $i_160 = $i_160 - 1 | 0;
      var $data_addr_161 = $data_addr_161 + 1 | 0;
    }
    return;
  }
}
_FilterHorChroma["X"] = 1;
function _FilterHorChromaEdge($data, $bS, $thresholds, $width) {
  var $conv = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
  var $add = $conv + 1 | 0;
  var $sub1 = -$width | 0;
  var $alpha = $thresholds + 4 | 0;
  var $mul = $sub1 << 1;
  var $beta = $thresholds + 8 | 0;
  var $sub25 = $conv ^ -1;
  var $arrayidx4 = $data + $sub1 | 0;
  var $4 = HEAP8[$data + $width | 0];
  var $conv7 = HEAPU8[$arrayidx4];
  var $conv8 = HEAPU8[$data];
  var $call = Math.abs($conv7 - $conv8 | 0);
  var $5 = HEAP32[$alpha >> 2];
  do {
    if ($call >>> 0 < $5 >>> 0) {
      var $conv11 = HEAPU8[$data + $mul | 0];
      var $call14 = Math.abs($conv11 - $conv7 | 0);
      var $7 = HEAP32[$beta >> 2];
      if ($call14 >>> 0 >= $7 >>> 0) {
        var $10 = $5;
        break;
      }
      var $conv18 = $4 & 255;
      if (Math.abs($conv18 - $conv8 | 0) >>> 0 >= $7 >>> 0) {
        var $10 = $5;
        break;
      }
      var $call34 = _clip($sub25, $add, 4 - $conv18 + ($conv8 - $conv7 << 2) + $conv11 >> 3);
      var $9 = HEAP8[($conv8 | 512) - $call34 + 5244200 | 0];
      HEAP8[$arrayidx4] = HEAP8[($conv7 | 512) + $call34 + 5244200 | 0];
      HEAP8[$data] = $9;
      var $10 = HEAP32[$alpha >> 2];
    } else {
      var $10 = $5;
    }
  } while (0);
  var $10;
  var $incdec_ptr = $data + 1 | 0;
  var $arrayidx4_1 = $data + (1 - $width) | 0;
  var $13 = HEAP8[$width + ($data + 1) | 0];
  var $conv7_1 = HEAPU8[$arrayidx4_1];
  var $conv8_1 = HEAPU8[$incdec_ptr];
  if (Math.abs($conv7_1 - $conv8_1 | 0) >>> 0 >= $10 >>> 0) {
    return;
  }
  var $conv11_1 = HEAPU8[$data + ($mul | 1) | 0];
  var $call14_1 = Math.abs($conv11_1 - $conv7_1 | 0);
  var $15 = HEAP32[$beta >> 2];
  if ($call14_1 >>> 0 >= $15 >>> 0) {
    return;
  }
  var $conv18_1 = $13 & 255;
  if (Math.abs($conv18_1 - $conv8_1 | 0) >>> 0 >= $15 >>> 0) {
    return;
  }
  var $call34_1 = _clip($sub25, $add, 4 - $conv18_1 + ($conv8_1 - $conv7_1 << 2) + $conv11_1 >> 3);
  var $17 = HEAP8[($conv8_1 | 512) - $call34_1 + 5244200 | 0];
  HEAP8[$arrayidx4_1] = HEAP8[($conv7_1 | 512) + $call34_1 + 5244200 | 0];
  HEAP8[$incdec_ptr] = $17;
  return;
}
_FilterHorChromaEdge["X"] = 1;
function _FilterVerLumaEdge($data, $bS, $thresholds, $imageWidth) {
  var $0 = HEAP32[$thresholds + 4 >> 2];
  var $1 = HEAP32[$thresholds + 8 >> 2];
  if ($bS >>> 0 < 4) {
    var $conv = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
    var $sub49 = -$conv | 0;
    var $inc = $conv + 1 | 0;
    var $i_0120 = 4;
    var $data_addr_0121 = $data;
    while (1) {
      var $data_addr_0121;
      var $i_0120;
      var $arrayidx15 = $data_addr_0121 - 2 | 0;
      var $conv16 = HEAPU8[$arrayidx15];
      var $arrayidx17 = $data_addr_0121 - 1 | 0;
      var $conv18 = HEAPU8[$arrayidx17];
      var $conv20 = HEAPU8[$data_addr_0121];
      var $arrayidx21 = $data_addr_0121 + 1 | 0;
      var $conv22 = HEAPU8[$arrayidx21];
      do {
        if (Math.abs($conv18 - $conv20 | 0) >>> 0 < $0 >>> 0) {
          if (Math.abs($conv16 - $conv18 | 0) >>> 0 >= $1 >>> 0) {
            break;
          }
          if (Math.abs($conv22 - $conv20 | 0) >>> 0 >= $1 >>> 0) {
            break;
          }
          var $conv37 = HEAPU8[$data_addr_0121 - 3 | 0];
          var $conv39 = HEAPU8[$data_addr_0121 + 2 | 0];
          if (Math.abs($conv37 - $conv18 | 0) >>> 0 < $1 >>> 0) {
            HEAP8[$arrayidx15] = _clip($sub49, $conv, (($conv20 + ($conv18 + 1) | 0) >>> 1) - ($conv16 << 1) + $conv37 >> 1) + $conv16 & 255;
            var $tmp_1 = $inc;
          } else {
            var $tmp_1 = $conv;
          }
          var $tmp_1;
          if (Math.abs($conv39 - $conv20 | 0) >>> 0 < $1 >>> 0) {
            HEAP8[$arrayidx21] = _clip($sub49, $conv, (($conv20 + ($conv18 + 1) | 0) >>> 1) - ($conv22 << 1) + $conv39 >> 1) + $conv22 & 255;
            var $tmp_2 = $tmp_1 + 1 | 0;
          } else {
            var $tmp_2 = $tmp_1;
          }
          var $tmp_2;
          var $call80 = _clip(-$tmp_2 | 0, $tmp_2, $conv16 + 4 - $conv22 + ($conv20 - $conv18 << 2) >> 3);
          var $11 = HEAP8[($conv20 | 512) - $call80 + 5244200 | 0];
          HEAP8[$arrayidx17] = HEAP8[($conv18 | 512) + $call80 + 5244200 | 0];
          HEAP8[$data_addr_0121] = $11;
        }
      } while (0);
      var $dec = $i_0120 - 1 | 0;
      if (($dec | 0) == 0) {
        break;
      } else {
        var $i_0120 = $dec;
        var $data_addr_0121 = $data_addr_0121 + $imageWidth | 0;
      }
    }
    return;
  }
  var $add121 = ($0 >>> 2) + 2 | 0;
  var $i_1124 = 4;
  var $data_addr_1125 = $data;
  while (1) {
    var $data_addr_1125;
    var $i_1124;
    var $arrayidx95 = $data_addr_1125 - 2 | 0;
    var $conv96 = HEAPU8[$arrayidx95];
    var $arrayidx97 = $data_addr_1125 - 1 | 0;
    var $conv98 = HEAPU8[$arrayidx97];
    var $conv100 = HEAPU8[$data_addr_1125];
    var $arrayidx101 = $data_addr_1125 + 1 | 0;
    var $conv102 = HEAPU8[$arrayidx101];
    var $call104 = Math.abs($conv98 - $conv100 | 0);
    L3248 : do {
      if ($call104 >>> 0 < $0 >>> 0) {
        if (Math.abs($conv96 - $conv98 | 0) >>> 0 >= $1 >>> 0) {
          break;
        }
        if (Math.abs($conv102 - $conv100 | 0) >>> 0 >= $1 >>> 0) {
          break;
        }
        var $arrayidx124 = $data_addr_1125 - 3 | 0;
        var $conv125 = HEAPU8[$arrayidx124];
        var $arrayidx126 = $data_addr_1125 + 2 | 0;
        var $conv127 = HEAPU8[$arrayidx126];
        do {
          if ($call104 >>> 0 < $add121 >>> 0) {
            if (Math.abs($conv125 - $conv98 | 0) >>> 0 < $1 >>> 0) {
              var $add136 = $conv98 + $conv96 + $conv100 | 0;
              HEAP8[$arrayidx97] = (($add136 << 1) + $conv102 + $conv125 + 4 | 0) >>> 3 & 255;
              HEAP8[$arrayidx95] = ($conv125 + ($add136 + 2) | 0) >>> 2 & 255;
              HEAP8[$arrayidx124] = ((HEAPU8[$data_addr_1125 - 4 | 0] << 1) + $add136 + ($conv125 * 3 & -1) + 4 | 0) >>> 3 & 255;
            } else {
              HEAP8[$arrayidx97] = (($conv96 << 1) + $conv98 + $conv102 + 2 | 0) >>> 2 & 255;
            }
            if (Math.abs($conv127 - $conv100 | 0) >>> 0 >= $1 >>> 0) {
              break;
            }
            var $add175 = $conv100 + $conv98 + $conv102 | 0;
            HEAP8[$data_addr_1125] = (($add175 << 1) + $conv96 + $conv127 + 4 | 0) >>> 3 & 255;
            HEAP8[$arrayidx101] = ($conv127 + ($add175 + 2) | 0) >>> 2 & 255;
            HEAP8[$arrayidx126] = ((HEAPU8[$data_addr_1125 + 3 | 0] << 1) + $add175 + ($conv127 * 3 & -1) + 4 | 0) >>> 3 & 255;
            break L3248;
          } else {
            HEAP8[$arrayidx97] = (($conv96 << 1) + $conv98 + $conv102 + 2 | 0) >>> 2 & 255;
          }
        } while (0);
        HEAP8[$data_addr_1125] = (($conv102 << 1) + $conv96 + $conv100 + 2 | 0) >>> 2 & 255;
      }
    } while (0);
    var $dec209 = $i_1124 - 1 | 0;
    if (($dec209 | 0) == 0) {
      break;
    } else {
      var $i_1124 = $dec209;
      var $data_addr_1125 = $data_addr_1125 + $imageWidth | 0;
    }
  }
  return;
}
_FilterVerLumaEdge["X"] = 1;
function _IsSliceBoundaryOnLeft($mb_0_1_val, $mb_0_13_val_0_1_val) {
  return ($mb_0_1_val | 0) != ($mb_0_13_val_0_1_val | 0) & 1;
}
function _IsSliceBoundaryOnTop($mb_0_1_val, $mb_0_14_val_0_1_val) {
  return ($mb_0_1_val | 0) != ($mb_0_14_val_0_1_val | 0) & 1;
}
function _FilterHorLuma($data, $bS, $thresholds, $imageWidth) {
  var $0 = HEAP32[$thresholds + 4 >> 2];
  var $1 = HEAP32[$thresholds + 8 >> 2];
  if ($bS >>> 0 < 4) {
    var $conv = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
    var $sub15 = -$imageWidth | 0;
    var $mul = $sub15 << 1;
    var $mul39 = $imageWidth * -3 & -1;
    var $sub51 = -$conv | 0;
    var $inc = $conv + 1 | 0;
    var $mul58 = $imageWidth << 1;
    var $i_0139 = 16;
    var $data_addr_0140 = $data;
    while (1) {
      var $data_addr_0140;
      var $i_0139;
      var $arrayidx16 = $data_addr_0140 + $mul | 0;
      var $conv17 = HEAPU8[$arrayidx16];
      var $arrayidx19 = $data_addr_0140 + $sub15 | 0;
      var $conv20 = HEAPU8[$arrayidx19];
      var $conv22 = HEAPU8[$data_addr_0140];
      var $arrayidx23 = $data_addr_0140 + $imageWidth | 0;
      var $conv24 = HEAPU8[$arrayidx23];
      do {
        if (Math.abs($conv20 - $conv22 | 0) >>> 0 < $0 >>> 0) {
          if (Math.abs($conv17 - $conv20 | 0) >>> 0 >= $1 >>> 0) {
            break;
          }
          if (Math.abs($conv24 - $conv22 | 0) >>> 0 >= $1 >>> 0) {
            break;
          }
          var $conv41 = HEAPU8[$data_addr_0140 + $mul39 | 0];
          if (Math.abs($conv41 - $conv20 | 0) >>> 0 < $1 >>> 0) {
            HEAP8[$arrayidx16] = _clip($sub51, $conv, (($conv22 + ($conv20 + 1) | 0) >>> 1) - ($conv17 << 1) + $conv41 >> 1) + $conv17 & 255;
            var $tmp_1 = $inc;
          } else {
            var $tmp_1 = $conv;
          }
          var $tmp_1;
          var $conv60 = HEAPU8[$data_addr_0140 + $mul58 | 0];
          if (Math.abs($conv60 - $conv22 | 0) >>> 0 < $1 >>> 0) {
            HEAP8[$arrayidx23] = _clip($sub51, $conv, (($conv22 + ($conv20 + 1) | 0) >>> 1) - ($conv24 << 1) + $conv60 >> 1) + $conv24 & 255;
            var $tmp_2 = $tmp_1 + 1 | 0;
          } else {
            var $tmp_2 = $tmp_1;
          }
          var $tmp_2;
          var $call87 = _clip(-$tmp_2 | 0, $tmp_2, $conv17 + 4 - $conv24 + ($conv22 - $conv20 << 2) >> 3);
          var $11 = HEAP8[($conv22 | 512) - $call87 + 5244200 | 0];
          HEAP8[$arrayidx19] = HEAP8[($conv20 | 512) + $call87 + 5244200 | 0];
          HEAP8[$data_addr_0140] = $11;
        }
      } while (0);
      var $dec = $i_0139 - 1 | 0;
      if (($dec | 0) == 0) {
        break;
      } else {
        var $i_0139 = $dec;
        var $data_addr_0140 = $data_addr_0140 + 1 | 0;
      }
    }
    return;
  }
  var $sub103 = -$imageWidth | 0;
  var $mul104 = $sub103 << 1;
  var $add132 = ($0 >>> 2) + 2 | 0;
  var $mul136 = $imageWidth * -3 & -1;
  var $mul139 = $imageWidth << 1;
  var $mul167 = $sub103 << 2;
  var $mul211 = $imageWidth * 3 & -1;
  var $i_1143 = 16;
  var $data_addr_1144 = $data;
  while (1) {
    var $data_addr_1144;
    var $i_1143;
    var $arrayidx105 = $data_addr_1144 + $mul104 | 0;
    var $conv106 = HEAPU8[$arrayidx105];
    var $arrayidx108 = $data_addr_1144 + $sub103 | 0;
    var $conv109 = HEAPU8[$arrayidx108];
    var $conv111 = HEAPU8[$data_addr_1144];
    var $arrayidx112 = $data_addr_1144 + $imageWidth | 0;
    var $conv113 = HEAPU8[$arrayidx112];
    var $call115 = Math.abs($conv109 - $conv111 | 0);
    L22 : do {
      if ($call115 >>> 0 < $0 >>> 0) {
        if (Math.abs($conv106 - $conv109 | 0) >>> 0 >= $1 >>> 0) {
          break;
        }
        if (Math.abs($conv113 - $conv111 | 0) >>> 0 >= $1 >>> 0) {
          break;
        }
        var $arrayidx137 = $data_addr_1144 + $mul136 | 0;
        var $conv138 = HEAPU8[$arrayidx137];
        var $arrayidx140 = $data_addr_1144 + $mul139 | 0;
        var $conv141 = HEAPU8[$arrayidx140];
        do {
          if ($call115 >>> 0 < $add132 >>> 0) {
            if (Math.abs($conv138 - $conv109 | 0) >>> 0 < $1 >>> 0) {
              var $add150 = $conv109 + $conv106 + $conv111 | 0;
              HEAP8[$arrayidx108] = (($add150 << 1) + $conv113 + $conv138 + 4 | 0) >>> 3 & 255;
              HEAP8[$arrayidx105] = ($conv138 + ($add150 + 2) | 0) >>> 2 & 255;
              HEAP8[$arrayidx137] = ((HEAPU8[$data_addr_1144 + $mul167 | 0] << 1) + $add150 + ($conv138 * 3 & -1) + 4 | 0) >>> 3 & 255;
            } else {
              HEAP8[$arrayidx108] = (($conv106 << 1) + $conv109 + $conv113 + 2 | 0) >>> 2 & 255;
            }
            if (Math.abs($conv141 - $conv111 | 0) >>> 0 >= $1 >>> 0) {
              break;
            }
            var $add198 = $conv111 + $conv109 + $conv113 | 0;
            HEAP8[$data_addr_1144] = (($add198 << 1) + $conv106 + $conv141 + 4 | 0) >>> 3 & 255;
            HEAP8[$arrayidx112] = ($conv141 + ($add198 + 2) | 0) >>> 2 & 255;
            HEAP8[$arrayidx140] = ((HEAPU8[$data_addr_1144 + $mul211 | 0] << 1) + $add198 + ($conv141 * 3 & -1) + 4 | 0) >>> 3 & 255;
            break L22;
          } else {
            HEAP8[$arrayidx108] = (($conv106 << 1) + $conv109 + $conv113 + 2 | 0) >>> 2 & 255;
          }
        } while (0);
        HEAP8[$data_addr_1144] = (($conv113 << 1) + $conv106 + $conv111 + 2 | 0) >>> 2 & 255;
      }
    } while (0);
    var $dec234 = $i_1143 - 1 | 0;
    if (($dec234 | 0) == 0) {
      break;
    } else {
      var $i_1143 = $dec234;
      var $data_addr_1144 = $data_addr_1144 + 1 | 0;
    }
  }
  return;
}
_FilterHorLuma["X"] = 1;
function _FilterHorLumaEdge($data, $bS, $thresholds, $imageWidth) {
  var $conv = HEAPU8[HEAP32[$thresholds >> 2] + ($bS - 1) | 0];
  var $sub10 = -$imageWidth | 0;
  var $mul = $sub10 << 1;
  var $alpha = $thresholds + 4 | 0;
  var $beta = $thresholds + 8 | 0;
  var $mul35 = $imageWidth * -3 & -1;
  var $sub54 = -$conv | 0;
  var $inc = $conv + 1 | 0;
  var $mul61 = $imageWidth << 1;
  var $i_059 = 3;
  var $data_addr_060 = $data;
  while (1) {
    var $data_addr_060;
    var $i_059;
    var $arrayidx11 = $data_addr_060 + $mul | 0;
    var $arrayidx13 = $data_addr_060 + $sub10 | 0;
    var $arrayidx15 = $data_addr_060 + $imageWidth | 0;
    var $4 = HEAP8[$arrayidx15];
    var $conv16 = HEAPU8[$arrayidx13];
    var $conv17 = HEAPU8[$data_addr_060];
    do {
      if (Math.abs($conv16 - $conv17 | 0) >>> 0 < HEAP32[$alpha >> 2] >>> 0) {
        var $conv20 = HEAPU8[$arrayidx11];
        var $call23 = Math.abs($conv20 - $conv16 | 0);
        var $7 = HEAP32[$beta >> 2];
        if ($call23 >>> 0 >= $7 >>> 0) {
          break;
        }
        var $conv27 = $4 & 255;
        if (Math.abs($conv27 - $conv17 | 0) >>> 0 >= $7 >>> 0) {
          break;
        }
        var $conv37 = HEAPU8[$data_addr_060 + $mul35 | 0];
        if (Math.abs($conv37 - $conv16 | 0) >>> 0 < $7 >>> 0) {
          HEAP8[$arrayidx11] = _clip($sub54, $conv, (($conv17 + ($conv16 + 1) | 0) >>> 1) - ($conv20 << 1) + $conv37 >> 1) + $conv20 & 255;
          var $tmp_1 = $inc;
          var $9 = HEAP32[$beta >> 2];
        } else {
          var $tmp_1 = $conv;
          var $9 = $7;
        }
        var $9;
        var $tmp_1;
        var $conv63 = HEAPU8[$data_addr_060 + $mul61 | 0];
        if (Math.abs($conv63 - $conv17 | 0) >>> 0 < $9 >>> 0) {
          HEAP8[$arrayidx15] = _clip($sub54, $conv, (($conv17 + ($conv16 + 1) | 0) >>> 1) - ($conv27 << 1) + $conv63 >> 1) + $conv27 & 255;
          var $tmp_2 = $tmp_1 + 1 | 0;
        } else {
          var $tmp_2 = $tmp_1;
        }
        var $tmp_2;
        var $call101 = _clip(-$tmp_2 | 0, $tmp_2, 4 - $conv27 + ($conv17 - $conv16 << 2) + $conv20 >> 3);
        var $12 = HEAP8[($conv17 | 512) - $call101 + 5244200 | 0];
        HEAP8[$arrayidx13] = HEAP8[($conv16 | 512) + $call101 + 5244200 | 0];
        HEAP8[$data_addr_060] = $12;
      }
    } while (0);
    if (($i_059 | 0) == 0) {
      break;
    }
    var $i_059 = $i_059 - 1 | 0;
    var $data_addr_060 = $data_addr_060 + 1 | 0;
  }
  return;
}
_FilterHorLumaEdge["X"] = 1;
function _EdgeBoundaryStrength($mb1, $mb2, $ind1, $ind2) {
  if (HEAP16[$mb1 + ($ind1 << 1) + 28 >> 1] << 16 >> 16 != 0) {
    var $retval_0 = 2;
    var $retval_0;
    return $retval_0;
  }
  if (HEAP16[$mb2 + ($ind2 << 1) + 28 >> 1] << 16 >> 16 != 0) {
    var $retval_0 = 2;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$mb1 + ($ind1 >>> 2 << 2) + 116 >> 2] | 0) != (HEAP32[$mb2 + ($ind2 >>> 2 << 2) + 116 >> 2] | 0)) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((Math.abs((HEAP16[$mb1 + ($ind1 << 2) + 132 >> 1] << 16 >> 16) - (HEAP16[$mb2 + ($ind2 << 2) + 132 >> 1] << 16 >> 16) | 0) | 0) > 3) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  } else {
    return (Math.abs((HEAP16[$mb1 + ($ind1 << 2) + 134 >> 1] << 16 >> 16) - (HEAP16[$mb2 + ($ind2 << 2) + 134 >> 1] << 16 >> 16) | 0) | 0) > 3 & 1;
  }
}
function _InnerBoundaryStrength($mb1, $ind1, $ind2) {
  var $conv12 = HEAP16[$mb1 + ($ind1 << 2) + 134 >> 1] << 16 >> 16;
  var $conv16 = HEAP16[$mb1 + ($ind2 << 2) + 134 >> 1] << 16 >> 16;
  if (HEAP16[$mb1 + ($ind1 << 1) + 28 >> 1] << 16 >> 16 != 0) {
    var $retval_0 = 2;
    var $retval_0;
    return $retval_0;
  }
  if (HEAP16[$mb1 + ($ind2 << 1) + 28 >> 1] << 16 >> 16 != 0) {
    var $retval_0 = 2;
    var $retval_0;
    return $retval_0;
  }
  if ((Math.abs((HEAP16[$mb1 + ($ind1 << 2) + 132 >> 1] << 16 >> 16) - (HEAP16[$mb1 + ($ind2 << 2) + 132 >> 1] << 16 >> 16) | 0) | 0) > 3) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  if ((Math.abs($conv12 - $conv16 | 0) | 0) > 3) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  } else {
    return (HEAP32[$mb1 + ($ind1 >>> 2 << 2) + 116 >> 2] | 0) != (HEAP32[$mb1 + ($ind2 >>> 2 << 2) + 116 >> 2] | 0) & 1;
  }
}
function _h264bsdConceal($pStorage, $currImage, $sliceType) {
  var $mb11$s2;
  var $picSizeInMbs$s2;
  var label = 0;
  var $0 = HEAP32[$currImage + 4 >> 2];
  var $1 = HEAP32[$currImage + 8 >> 2];
  do {
    if (($sliceType | 0) == 5 | ($sliceType | 0) == 0) {
      label = 64;
    } else {
      if ((HEAP32[$pStorage + 3384 >> 2] | 0) == 0) {
        var $refData_0 = 0;
        break;
      } else {
        label = 64;
        break;
      }
    }
  } while (0);
  L82 : do {
    if (label == 64) {
      var $arraydecay = $pStorage + 1220 | 0;
      var $i_0 = 0;
      while (1) {
        var $i_0;
        var $call = _h264bsdGetRefPicData($arraydecay, $i_0);
        var $inc = $i_0 + 1 | 0;
        if ($inc >>> 0 < 16 & ($call | 0) == 0) {
          var $i_0 = $inc;
        } else {
          var $refData_0 = $call;
          break L82;
        }
      }
    }
  } while (0);
  var $refData_0;
  var $picSizeInMbs$s2 = ($pStorage + 1176 | 0) >> 2;
  var $3 = HEAP32[$picSizeInMbs$s2];
  do {
    if (($3 | 0) != 0) {
      var $mb11$s2 = ($pStorage + 1212 | 0) >> 2;
      var $4 = HEAP32[$mb11$s2];
      var $row_0121 = 0;
      var $col_0122 = 0;
      var $i_1123 = 0;
      while (1) {
        var $i_1123;
        var $col_0122;
        var $row_0121;
        if ((HEAP32[($4 + 196 >> 2) + ($i_1123 * 54 | 0)] | 0) != 0) {
          var $row_0_lcssa = $row_0121;
          var $col_0_lcssa = $col_0122;
          var $i_1_lcssa = $i_1123;
          break;
        }
        var $inc12 = $i_1123 + 1 | 0;
        var $inc13 = $col_0122 + 1 | 0;
        var $cmp14 = ($inc13 | 0) == ($0 | 0);
        var $inc16_row_0 = ($cmp14 & 1) + $row_0121 | 0;
        var $_inc13 = $cmp14 ? 0 : $inc13;
        if ($inc12 >>> 0 < $3 >>> 0) {
          var $row_0121 = $inc16_row_0;
          var $col_0122 = $_inc13;
          var $i_1123 = $inc12;
        } else {
          var $row_0_lcssa = $inc16_row_0;
          var $col_0_lcssa = $_inc13;
          var $i_1_lcssa = $inc12;
          break;
        }
      }
      var $i_1_lcssa;
      var $col_0_lcssa;
      var $row_0_lcssa;
      if (($i_1_lcssa | 0) == ($3 | 0)) {
        break;
      }
      var $mul42 = $row_0_lcssa * $0 & -1;
      L94 : do {
        if (($col_0_lcssa | 0) != 0) {
          var $numConcealedMbs50 = $pStorage + 1204 | 0;
          var $dec119_in = $col_0_lcssa;
          while (1) {
            var $dec119_in;
            var $dec119 = $dec119_in - 1 | 0;
            var $add_ptr_sum102 = $dec119 + $mul42 | 0;
            _ConcealMb($4 + $add_ptr_sum102 * 216 | 0, $currImage, $row_0_lcssa, $dec119, $sliceType, $refData_0);
            HEAP32[($4 + 196 >> 2) + ($add_ptr_sum102 * 54 | 0)] = 1;
            HEAP32[$numConcealedMbs50 >> 2] = HEAP32[$numConcealedMbs50 >> 2] + 1 | 0;
            if (($dec119 | 0) == 0) {
              break L94;
            } else {
              var $dec119_in = $dec119;
            }
          }
        }
      } while (0);
      var $j_1114 = $col_0_lcssa + 1 | 0;
      L99 : do {
        if ($j_1114 >>> 0 < $0 >>> 0) {
          var $numConcealedMbs64 = $pStorage + 1204 | 0;
          var $j_1116 = $j_1114;
          while (1) {
            var $j_1116;
            var $add_ptr_sum = $j_1116 + $mul42 | 0;
            var $decoded57 = $4 + $add_ptr_sum * 216 + 196 | 0;
            if ((HEAP32[$decoded57 >> 2] | 0) == 0) {
              _ConcealMb($4 + $add_ptr_sum * 216 | 0, $currImage, $row_0_lcssa, $j_1116, $sliceType, $refData_0);
              HEAP32[$decoded57 >> 2] = 1;
              HEAP32[$numConcealedMbs64 >> 2] = HEAP32[$numConcealedMbs64 >> 2] + 1 | 0;
            }
            var $j_1 = $j_1116 + 1 | 0;
            if (($j_1 | 0) == ($0 | 0)) {
              break L99;
            } else {
              var $j_1116 = $j_1;
            }
          }
        }
      } while (0);
      L107 : do {
        if (($row_0_lcssa | 0) == 0) {
          var $i_4_in_ph = 0;
        } else {
          if (($0 | 0) == 0) {
            var $i_4_in_ph = $row_0_lcssa;
            break;
          }
          var $sub = $row_0_lcssa - 1 | 0;
          var $mul76 = $sub * $0 & -1;
          var $numConcealedMbs82 = $pStorage + 1204 | 0;
          var $idx_neg = -$0 | 0;
          var $j_2113 = 0;
          while (1) {
            var $j_2113;
            var $mb_0 = HEAP32[$mb11$s2] + ($j_2113 + $mul76) * 216 | 0;
            var $i_3 = $sub;
            while (1) {
              var $i_3;
              var $mb_0;
              _ConcealMb($mb_0, $currImage, $i_3, $j_2113, $sliceType, $refData_0);
              HEAP32[$mb_0 + 196 >> 2] = 1;
              HEAP32[$numConcealedMbs82 >> 2] = HEAP32[$numConcealedMbs82 >> 2] + 1 | 0;
              if (($i_3 | 0) == 0) {
                break;
              } else {
                var $mb_0 = $mb_0 + $idx_neg * 216 | 0;
                var $i_3 = $i_3 - 1 | 0;
              }
            }
            var $inc90 = $j_2113 + 1 | 0;
            if (($inc90 | 0) == ($0 | 0)) {
              var $i_4_in_ph = $row_0_lcssa;
              break L107;
            } else {
              var $j_2113 = $inc90;
            }
          }
        }
      } while (0);
      var $i_4_in_ph;
      var $i_4109 = $i_4_in_ph + 1 | 0;
      if ($i_4109 >>> 0 >= $1 >>> 0) {
        return;
      }
      var $cmp101106 = ($0 | 0) == 0;
      var $numConcealedMbs111 = $pStorage + 1204 | 0;
      var $i_4111 = $i_4109;
      while (1) {
        var $i_4111;
        var $17 = HEAP32[$mb11$s2];
        var $mul98 = $i_4111 * $0 & -1;
        L121 : do {
          if (!$cmp101106) {
            var $j_3107 = 0;
            while (1) {
              var $j_3107;
              var $add_ptr99_sum = $j_3107 + $mul98 | 0;
              var $decoded104 = $17 + $add_ptr99_sum * 216 + 196 | 0;
              if ((HEAP32[$decoded104 >> 2] | 0) == 0) {
                _ConcealMb($17 + $add_ptr99_sum * 216 | 0, $currImage, $i_4111, $j_3107, $sliceType, $refData_0);
                HEAP32[$decoded104 >> 2] = 1;
                HEAP32[$numConcealedMbs111 >> 2] = HEAP32[$numConcealedMbs111 >> 2] + 1 | 0;
              }
              var $inc115 = $j_3107 + 1 | 0;
              if (($inc115 | 0) == ($0 | 0)) {
                break L121;
              } else {
                var $j_3107 = $inc115;
              }
            }
          }
        } while (0);
        var $i_4 = $i_4111 + 1 | 0;
        if (($i_4 | 0) == ($1 | 0)) {
          break;
        } else {
          var $i_4111 = $i_4;
        }
      }
      return;
    }
  } while (0);
  do {
    if (($sliceType | 0) == 7 | ($sliceType | 0) == 2) {
      if ((HEAP32[$pStorage + 3384 >> 2] | 0) == 0 | ($refData_0 | 0) == 0) {
        label = 74;
        break;
      } else {
        label = 75;
        break;
      }
    } else {
      if (($refData_0 | 0) == 0) {
        label = 74;
        break;
      } else {
        label = 75;
        break;
      }
    }
  } while (0);
  if (label == 75) {
    _H264SwDecMemcpy(HEAP32[$currImage >> 2], $refData_0, ($0 * 384 & -1) * $1 & -1);
  } else if (label == 74) {
    _H264SwDecMemset(HEAP32[$currImage >> 2], 128, ($0 * 384 & -1) * $1 & -1);
  }
  var $9 = HEAP32[$picSizeInMbs$s2];
  HEAP32[$pStorage + 1204 >> 2] = $9;
  if (($9 | 0) == 0) {
    return;
  }
  var $mb37 = $pStorage + 1212 | 0;
  var $i_2105 = 0;
  while (1) {
    var $i_2105;
    HEAP32[(HEAP32[$mb37 >> 2] + 8 >> 2) + ($i_2105 * 54 | 0)] = 1;
    var $inc39 = $i_2105 + 1 | 0;
    if ($inc39 >>> 0 < HEAP32[$picSizeInMbs$s2] >>> 0) {
      var $i_2105 = $inc39;
    } else {
      break;
    }
  }
  return;
}
_h264bsdConceal["X"] = 1;
function _ConcealMb($pMb, $currImage, $row, $col, $sliceType, $refData) {
  var $arrayidx702$s2;
  var $arrayidx586$s2;
  var $arraydecay34$s2;
  var $refImage$s2;
  var $firstPhase$s2;
  var $pMb$s2 = $pMb >> 2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 452 | 0;
  var $data = __stackBase__;
  var $firstPhase = __stackBase__ + 384, $firstPhase$s2 = $firstPhase >> 2;
  var $mv = __stackBase__ + 448;
  var $tmpcast = $mv;
  var $refImage = STACKTOP, $refImage$s2 = $refImage >> 2;
  STACKTOP = STACKTOP + 24 | 0;
  var $0 = HEAP32[$currImage + 4 >> 2];
  var $1 = HEAP32[$currImage + 8 >> 2];
  _h264bsdSetCurrImageMbPointers($currImage, ($0 * $row & -1) + $col | 0);
  var $data13 = $currImage | 0;
  var $2 = HEAP32[$data13 >> 2];
  var $mul14 = $row << 4;
  var $mul17 = $col << 4;
  var $add_ptr_sum = (($row << 8) * $0 & -1) + $mul17 | 0;
  HEAP32[$pMb$s2 + 5] = 40;
  HEAP32[$pMb$s2 + 2] = 0;
  HEAP32[$pMb$s2] = 6;
  HEAP32[$pMb$s2 + 3] = 0;
  HEAP32[$pMb$s2 + 4] = 0;
  HEAP32[$pMb$s2 + 6] = 0;
  do {
    if (($sliceType | 0) == 7 | ($sliceType | 0) == 2) {
      _H264SwDecMemset($data | 0, 0, 384);
    } else {
      HEAP32[$mv >> 2] = 0;
      HEAP32[$refImage$s2 + 1] = $0;
      HEAP32[$refImage$s2 + 2] = $1;
      HEAP32[$refImage$s2] = $refData;
      var $arraydecay27 = $data | 0;
      if (($refData | 0) == 0) {
        _H264SwDecMemset($arraydecay27, 0, 384);
        break;
      }
      _h264bsdPredictSamples($arraydecay27, $tmpcast, $refImage, $mul17, $mul14, 0, 0, 16, 16);
      _h264bsdWriteMacroblock($currImage, $arraydecay27);
      STACKTOP = __stackBase__;
      return;
    }
  } while (0);
  var $arraydecay34 = $firstPhase | 0, $arraydecay34$s2 = $arraydecay34 >> 2;
  var $3 = $firstPhase;
  _H264SwDecMemset($3, 0, 64);
  do {
    if (($row | 0) == 0) {
      var $hor_0 = 0;
    } else {
      if ((HEAP32[$pMb$s2 + (-$0 * 54 | 0) + 49] | 0) == 0) {
        var $hor_0 = 0;
        break;
      }
      var $add_ptr18_sum43 = $add_ptr_sum - ($0 << 4) | 0;
      var $add_ptr41_sum44 = $add_ptr18_sum43 | 1;
      var $incdec_ptr42_sum45 = $add_ptr18_sum43 | 3;
      var $add53 = HEAPU8[$2 + $add_ptr41_sum44 | 0] + HEAPU8[$2 + $add_ptr18_sum43 | 0] + HEAPU8[$add_ptr41_sum44 + ($2 + 1) | 0] + HEAPU8[$2 + $incdec_ptr42_sum45 | 0] | 0;
      var $incdec_ptr57_sum46 = $add_ptr18_sum43 | 7;
      var $add68 = HEAPU8[$incdec_ptr42_sum45 + ($2 + 2) | 0] + HEAPU8[$incdec_ptr42_sum45 + ($2 + 1) | 0] + HEAPU8[$incdec_ptr42_sum45 + ($2 + 3) | 0] + HEAPU8[$2 + $incdec_ptr57_sum46 | 0] | 0;
      var $add83 = HEAPU8[$incdec_ptr57_sum46 + ($2 + 2) | 0] + HEAPU8[$incdec_ptr57_sum46 + ($2 + 1) | 0] + HEAPU8[$incdec_ptr57_sum46 + ($2 + 3) | 0] + HEAPU8[$incdec_ptr57_sum46 + ($2 + 4) | 0] | 0;
      var $add98 = HEAPU8[$incdec_ptr57_sum46 + ($2 + 6) | 0] + HEAPU8[$incdec_ptr57_sum46 + ($2 + 5) | 0] + HEAPU8[$incdec_ptr57_sum46 + ($2 + 7) | 0] + HEAPU8[$2 + ($add_ptr18_sum43 | 15) | 0] | 0;
      var $add102 = $add68 + $add53 | 0;
      HEAP32[$arraydecay34$s2] = $add83 + $add102 + HEAP32[$arraydecay34$s2] + $add98 | 0;
      var $arrayidx115 = $firstPhase + 4 | 0;
      HEAP32[$arrayidx115 >> 2] = $add102 - $add83 - $add98 + HEAP32[$arrayidx115 >> 2] | 0;
      var $a_sroa_0_0 = $add53;
      var $a_sroa_1_0 = $add68;
      var $a_sroa_2_0 = $add83;
      var $a_sroa_3_0 = $add98;
      var $hor_0 = 1;
    }
  } while (0);
  var $hor_0;
  var $a_sroa_3_0;
  var $a_sroa_2_0;
  var $a_sroa_1_0;
  var $a_sroa_0_0;
  do {
    if (($1 - 1 | 0) == ($row | 0)) {
      var $B_0 = 0;
      var $hor_1 = $hor_0;
    } else {
      if ((HEAP32[$pMb$s2 + ($0 * 54 | 0) + 49] | 0) == 0) {
        var $B_0 = 0;
        var $hor_1 = $hor_0;
        break;
      }
      var $add_ptr18_sum38 = ($0 << 8) + $add_ptr_sum | 0;
      var $add_ptr128_sum39 = $add_ptr18_sum38 | 1;
      var $incdec_ptr132_sum40 = $add_ptr18_sum38 | 3;
      var $add143 = HEAPU8[$2 + $add_ptr128_sum39 | 0] + HEAPU8[$2 + $add_ptr18_sum38 | 0] + HEAPU8[$add_ptr128_sum39 + ($2 + 1) | 0] + HEAPU8[$2 + $incdec_ptr132_sum40 | 0] | 0;
      var $incdec_ptr147_sum41 = $add_ptr18_sum38 | 7;
      var $add158 = HEAPU8[$incdec_ptr132_sum40 + ($2 + 2) | 0] + HEAPU8[$incdec_ptr132_sum40 + ($2 + 1) | 0] + HEAPU8[$incdec_ptr132_sum40 + ($2 + 3) | 0] + HEAPU8[$2 + $incdec_ptr147_sum41 | 0] | 0;
      var $add173 = HEAPU8[$incdec_ptr147_sum41 + ($2 + 2) | 0] + HEAPU8[$incdec_ptr147_sum41 + ($2 + 1) | 0] + HEAPU8[$incdec_ptr147_sum41 + ($2 + 3) | 0] + HEAPU8[$incdec_ptr147_sum41 + ($2 + 4) | 0] | 0;
      var $add188 = HEAPU8[$incdec_ptr147_sum41 + ($2 + 6) | 0] + HEAPU8[$incdec_ptr147_sum41 + ($2 + 5) | 0] + HEAPU8[$incdec_ptr147_sum41 + ($2 + 7) | 0] + HEAPU8[$2 + ($add_ptr18_sum38 | 15) | 0] | 0;
      var $add193 = $add158 + $add143 | 0;
      HEAP32[$arraydecay34$s2] = $add173 + $add193 + HEAP32[$arraydecay34$s2] + $add188 | 0;
      var $arrayidx207 = $firstPhase + 4 | 0;
      HEAP32[$arrayidx207 >> 2] = $add193 - $add173 - $add188 + HEAP32[$arrayidx207 >> 2] | 0;
      var $B_0 = 1;
      var $b_sroa_0_0 = $add143;
      var $b_sroa_1_0 = $add158;
      var $b_sroa_2_0 = $add173;
      var $b_sroa_3_0 = $add188;
      var $hor_1 = $hor_0 + 1 | 0;
    }
  } while (0);
  var $hor_1;
  var $b_sroa_3_0;
  var $b_sroa_2_0;
  var $b_sroa_1_0;
  var $b_sroa_0_0;
  var $B_0;
  do {
    if (($col | 0) == 0) {
      var $j_2 = $hor_1;
      var $ver_0 = 0;
    } else {
      if ((HEAP32[$pMb - 216 + 196 >> 2] | 0) == 0) {
        var $j_2 = $hor_1;
        var $ver_0 = 0;
        break;
      }
      var $add_ptr18_sum26 = $add_ptr_sum - 1 | 0;
      var $mul220 = $0 << 4;
      var $mul225 = $0 << 5;
      var $mul230 = $0 * 48 & -1;
      var $add234 = HEAPU8[$2 + $add_ptr18_sum26 + $mul220 | 0] + HEAPU8[$2 + $add_ptr18_sum26 | 0] + HEAPU8[$2 + $add_ptr18_sum26 + $mul225 | 0] + HEAPU8[$2 + $add_ptr18_sum26 + $mul230 | 0] | 0;
      var $mul235 = $0 << 6;
      var $add_ptr216_sum29 = $add_ptr18_sum26 + $mul235 | 0;
      var $add254 = HEAPU8[$2 + $add_ptr216_sum29 + $mul220 | 0] + HEAPU8[$2 + $add_ptr216_sum29 | 0] + HEAPU8[$2 + $add_ptr216_sum29 + $mul225 | 0] + HEAPU8[$2 + $add_ptr216_sum29 + $mul230 | 0] | 0;
      var $add_ptr236_sum32 = $add_ptr216_sum29 + $mul235 | 0;
      var $add274 = HEAPU8[$2 + $add_ptr236_sum32 + $mul220 | 0] + HEAPU8[$2 + $add_ptr236_sum32 | 0] + HEAPU8[$2 + $add_ptr236_sum32 + $mul225 | 0] + HEAPU8[$2 + $add_ptr236_sum32 + $mul230 | 0] | 0;
      var $add_ptr256_sum35 = $add_ptr236_sum32 + $mul235 | 0;
      var $add294 = HEAPU8[$2 + $add_ptr256_sum35 + $mul220 | 0] + HEAPU8[$2 + $add_ptr256_sum35 | 0] + HEAPU8[$2 + $add_ptr256_sum35 + $mul225 | 0] + HEAPU8[$2 + $add_ptr256_sum35 + $mul230 | 0] | 0;
      var $add299 = $add254 + $add234 | 0;
      HEAP32[$arraydecay34$s2] = $add274 + $add299 + HEAP32[$arraydecay34$s2] + $add294 | 0;
      var $arrayidx313 = $firstPhase + 16 | 0;
      HEAP32[$arrayidx313 >> 2] = $add299 - $add274 - $add294 + HEAP32[$arrayidx313 >> 2] | 0;
      var $l_sroa_0_0 = $add234;
      var $l_sroa_1_0 = $add254;
      var $l_sroa_2_0 = $add274;
      var $l_sroa_3_0 = $add294;
      var $j_2 = $hor_1 + 1 | 0;
      var $ver_0 = 1;
    }
  } while (0);
  var $ver_0;
  var $j_2;
  var $l_sroa_3_0;
  var $l_sroa_2_0;
  var $l_sroa_1_0;
  var $l_sroa_0_0;
  do {
    if (($0 - 1 | 0) == ($col | 0)) {
      label = 121;
    } else {
      if ((HEAP32[$pMb$s2 + 103] | 0) == 0) {
        label = 121;
        break;
      }
      var $add_ptr18_sum = $add_ptr_sum + 16 | 0;
      var $mul328 = $0 << 4;
      var $mul333 = $0 << 5;
      var $mul338 = $0 * 48 & -1;
      var $add342 = HEAPU8[$2 + $add_ptr18_sum + $mul328 | 0] + HEAPU8[$2 + $add_ptr18_sum | 0] + HEAPU8[$2 + $add_ptr18_sum + $mul333 | 0] + HEAPU8[$2 + $add_ptr18_sum + $mul338 | 0] | 0;
      var $mul343 = $0 << 6;
      var $add_ptr324_sum17 = $add_ptr18_sum + $mul343 | 0;
      var $add362 = HEAPU8[$2 + $add_ptr324_sum17 + $mul328 | 0] + HEAPU8[$2 + $add_ptr324_sum17 | 0] + HEAPU8[$2 + $add_ptr324_sum17 + $mul333 | 0] + HEAPU8[$2 + $add_ptr324_sum17 + $mul338 | 0] | 0;
      var $add_ptr344_sum20 = $add_ptr324_sum17 + $mul343 | 0;
      var $add382 = HEAPU8[$2 + $add_ptr344_sum20 + $mul328 | 0] + HEAPU8[$2 + $add_ptr344_sum20 | 0] + HEAPU8[$2 + $add_ptr344_sum20 + $mul333 | 0] + HEAPU8[$2 + $add_ptr344_sum20 + $mul338 | 0] | 0;
      var $add_ptr364_sum23 = $add_ptr344_sum20 + $mul343 | 0;
      var $add402 = HEAPU8[$2 + $add_ptr364_sum23 + $mul328 | 0] + HEAPU8[$2 + $add_ptr364_sum23 | 0] + HEAPU8[$2 + $add_ptr364_sum23 + $mul333 | 0] + HEAPU8[$2 + $add_ptr364_sum23 + $mul338 | 0] | 0;
      var $inc403 = $j_2 + 1 | 0;
      var $inc404 = $ver_0 + 1 | 0;
      var $add407 = $add362 + $add342 | 0;
      HEAP32[$arraydecay34$s2] = $add382 + $add407 + HEAP32[$arraydecay34$s2] + $add402 | 0;
      var $arrayidx421 = $firstPhase + 16 | 0;
      var $add422 = $add407 - $add382 - $add402 + HEAP32[$arrayidx421 >> 2] | 0;
      HEAP32[$arrayidx421 >> 2] = $add422;
      var $tobool424 = ($hor_1 | 0) != 0;
      if ($tobool424 | ($ver_0 | 0) == 0) {
        if ($tobool424) {
          var $R_07274 = 1;
          var $j_36279 = $inc403;
          var $ver_16080 = $inc404;
          label = 125;
          break;
        } else {
          var $ver_15998100 = $inc404;
          var $j_36197101 = $inc403;
          var $R_07187106 = 1;
          var $81 = $add422;
          label = 130;
          break;
        }
      } else {
        HEAP32[$firstPhase$s2 + 1] = $l_sroa_2_0 + $l_sroa_3_0 + $l_sroa_1_0 + $l_sroa_0_0 - $add342 - $add362 - $add382 - $add402 >> 5;
        var $ver_15998100 = $inc404;
        var $j_36197101 = $inc403;
        var $R_07187106 = 1;
        var $81 = $add422;
        label = 130;
        break;
      }
    }
  } while (0);
  do {
    if (label == 121) {
      if (($hor_1 | 0) == 0) {
        var $ver_159 = $ver_0;
        var $j_361 = $j_2;
        var $R_071 = 0;
        label = 126;
        break;
      } else {
        var $R_07274 = 0;
        var $j_36279 = $j_2;
        var $ver_16080 = $ver_0;
        label = 125;
        break;
      }
    }
  } while (0);
  do {
    if (label == 125) {
      var $ver_16080;
      var $j_36279;
      var $R_07274;
      var $arrayidx450 = $firstPhase + 4 | 0;
      HEAP32[$arrayidx450 >> 2] = HEAP32[$arrayidx450 >> 2] >> $hor_1 + 3;
      var $ver_159 = $ver_16080;
      var $j_361 = $j_36279;
      var $R_071 = $R_07274;
      label = 126;
      break;
    }
  } while (0);
  do {
    if (label == 126) {
      var $R_071;
      var $j_361;
      var $ver_159;
      var $tobool454 = ($ver_159 | 0) != 0;
      if (!($tobool454 | ($hor_0 | 0) == 0 | ($B_0 | 0) == 0)) {
        HEAP32[$firstPhase$s2 + 4] = $a_sroa_2_0 + $a_sroa_3_0 + $a_sroa_1_0 + $a_sroa_0_0 - $b_sroa_3_0 - $b_sroa_2_0 - $b_sroa_1_0 - $b_sroa_0_0 >> 5;
        var $R_07186 = $R_071;
        var $j_36196 = $j_361;
        break;
      }
      if (!$tobool454) {
        var $R_07186 = $R_071;
        var $j_36196 = $j_361;
        break;
      }
      var $ver_15998100 = $ver_159;
      var $j_36197101 = $j_361;
      var $R_07187106 = $R_071;
      var $81 = HEAP32[$firstPhase$s2 + 4];
      label = 130;
      break;
    }
  } while (0);
  if (label == 130) {
    var $81;
    var $R_07187106;
    var $j_36197101;
    var $ver_15998100;
    HEAP32[$firstPhase$s2 + 4] = $81 >> $ver_15998100 + 3;
    var $R_07186 = $R_07187106;
    var $j_36196 = $j_36197101;
  }
  var $j_36196;
  var $R_07186;
  if (($j_36196 | 0) == 1) {
    HEAP32[$arraydecay34$s2] = HEAP32[$arraydecay34$s2] >> 4;
  } else if (($j_36196 | 0) == 2) {
    HEAP32[$arraydecay34$s2] = HEAP32[$arraydecay34$s2] >> 5;
  } else if (($j_36196 | 0) == 3) {
    HEAP32[$arraydecay34$s2] = (HEAP32[$arraydecay34$s2] * 21 & -1) >> 10;
  } else {
    HEAP32[$arraydecay34$s2] = HEAP32[$arraydecay34$s2] >> 6;
  }
  _Transform($arraydecay34);
  var $arraydecay498 = $data | 0;
  var $i_0175 = 0;
  var $pData_0176 = $arraydecay498;
  var $pTmp_0177 = $arraydecay34;
  while (1) {
    var $pTmp_0177;
    var $pData_0176;
    var $i_0175;
    var $86 = HEAP32[$pTmp_0177 + (($i_0175 >>> 2 & 3) << 2) >> 2];
    if (($86 | 0) < 0) {
      var $cond511 = 0;
    } else {
      var $cond511 = ($86 | 0) > 255 ? -1 : $86 & 255;
    }
    var $cond511;
    HEAP8[$pData_0176] = $cond511;
    var $inc514 = $i_0175 + 1 | 0;
    if (($inc514 | 0) == 256) {
      break;
    } else {
      var $i_0175 = $inc514;
      var $pData_0176 = $pData_0176 + 1 | 0;
      var $pTmp_0177 = ($inc514 & 63 | 0) == 0 ? $pTmp_0177 + 16 | 0 : $pTmp_0177;
    }
  }
  var $mul521 = $1 * $0 & -1;
  var $tobool535 = ($hor_0 | 0) != 0;
  var $mul537 = $0 << 3;
  var $idx_neg538 = -$mul537 | 0;
  var $add_ptr539_sum11 = $idx_neg538 | 1;
  var $incdec_ptr540_sum = $add_ptr539_sum11 + 1 | 0;
  var $incdec_ptr543_sum12 = $idx_neg538 | 3;
  var $incdec_ptr547_sum = $incdec_ptr543_sum12 + 1 | 0;
  var $incdec_ptr550_sum = $incdec_ptr543_sum12 + 2 | 0;
  var $incdec_ptr554_sum = $incdec_ptr543_sum12 + 3 | 0;
  var $incdec_ptr557_sum13 = $idx_neg538 | 7;
  var $arrayidx586$s2 = ($firstPhase + 4 | 0) >> 2;
  var $tobool589 = ($B_0 | 0) != 0;
  var $mul592 = $0 << 6;
  var $add_ptr593_sum8 = $mul592 | 1;
  var $incdec_ptr594_sum = $add_ptr593_sum8 + 1 | 0;
  var $incdec_ptr597_sum9 = $mul592 | 3;
  var $incdec_ptr601_sum = $incdec_ptr597_sum9 + 1 | 0;
  var $incdec_ptr604_sum = $incdec_ptr597_sum9 + 2 | 0;
  var $incdec_ptr608_sum = $incdec_ptr597_sum9 + 3 | 0;
  var $incdec_ptr611_sum10 = $mul592 | 7;
  var $tobool643 = ($ver_0 | 0) != 0;
  var $add_ptr645_sum = $mul537 - 1 | 0;
  var $mul654 = $0 << 4;
  var $add_ptr645_sum5 = $mul654 - 1 | 0;
  var $add_ptr655_sum = $add_ptr645_sum5 + $mul537 | 0;
  var $add_ptr655_sum6 = $add_ptr645_sum5 + $mul654 | 0;
  var $add_ptr665_sum = $add_ptr655_sum6 + $mul537 | 0;
  var $add_ptr665_sum7 = $add_ptr655_sum6 + $mul654 | 0;
  var $add_ptr675_sum = $add_ptr665_sum7 + $mul537 | 0;
  var $arrayidx702$s2 = ($firstPhase + 16 | 0) >> 2;
  var $tobool705 = ($R_07186 | 0) != 0;
  var $add_ptr707_sum = $mul537 + 8 | 0;
  var $add_ptr707_sum12 = $mul654 | 8;
  var $add_ptr717_sum = $add_ptr707_sum12 + $mul537 | 0;
  var $add_ptr717_sum3 = $add_ptr707_sum12 + $mul654 | 0;
  var $add_ptr727_sum = $add_ptr717_sum3 + $mul537 | 0;
  var $add_ptr727_sum4 = $add_ptr717_sum3 + $mul654 | 0;
  var $add_ptr737_sum = $add_ptr727_sum4 + $mul537 | 0;
  var $tobool643_not = $tobool643 ^ 1;
  var $tobool705_not = $tobool705 ^ 1;
  var $tobool535_not = $tobool535 ^ 1;
  var $tobool589_not = $tobool589 ^ 1;
  var $mul879 = $mul521 << 6;
  var $comp_0157 = 0;
  var $mbPos_0158 = ($mul521 << 8) + ($col << 3) + HEAP32[$data13 >> 2] + (($row << 6) * $0 & -1) | 0;
  var $a_sroa_3_1159 = $a_sroa_3_0;
  var $a_sroa_2_1160 = $a_sroa_2_0;
  var $a_sroa_1_1161 = $a_sroa_1_0;
  var $a_sroa_0_1162 = $a_sroa_0_0;
  var $b_sroa_3_1163 = $b_sroa_3_0;
  var $b_sroa_2_1164 = $b_sroa_2_0;
  var $b_sroa_1_1165 = $b_sroa_1_0;
  var $b_sroa_0_1166 = $b_sroa_0_0;
  var $l_sroa_3_1167 = $l_sroa_3_0;
  var $l_sroa_2_1168 = $l_sroa_2_0;
  var $l_sroa_1_1169 = $l_sroa_1_0;
  var $l_sroa_0_1170 = $l_sroa_0_0;
  while (1) {
    var $l_sroa_0_1170;
    var $l_sroa_1_1169;
    var $l_sroa_2_1168;
    var $l_sroa_3_1167;
    var $b_sroa_0_1166;
    var $b_sroa_1_1165;
    var $b_sroa_2_1164;
    var $b_sroa_3_1163;
    var $a_sroa_0_1162;
    var $a_sroa_1_1161;
    var $a_sroa_2_1160;
    var $a_sroa_3_1159;
    var $mbPos_0158;
    var $comp_0157;
    _H264SwDecMemset($3, 0, 64);
    if ($tobool535) {
      var $add546 = HEAPU8[$mbPos_0158 + $add_ptr539_sum11 | 0] + HEAPU8[$mbPos_0158 + $idx_neg538 | 0] | 0;
      var $add553 = HEAPU8[$mbPos_0158 + $incdec_ptr543_sum12 | 0] + HEAPU8[$mbPos_0158 + $incdec_ptr540_sum | 0] | 0;
      var $add560 = HEAPU8[$mbPos_0158 + $incdec_ptr550_sum | 0] + HEAPU8[$mbPos_0158 + $incdec_ptr547_sum | 0] | 0;
      var $add567 = HEAPU8[$mbPos_0158 + $incdec_ptr557_sum13 | 0] + HEAPU8[$mbPos_0158 + $incdec_ptr554_sum | 0] | 0;
      var $add572 = $add553 + $add546 | 0;
      HEAP32[$arraydecay34$s2] = $add560 + $add572 + HEAP32[$arraydecay34$s2] + $add567 | 0;
      HEAP32[$arrayidx586$s2] = $add572 - $add560 - $add567 + HEAP32[$arrayidx586$s2] | 0;
      var $a_sroa_0_2 = $add546;
      var $a_sroa_1_2 = $add553;
      var $a_sroa_2_2 = $add560;
      var $a_sroa_3_2 = $add567;
      var $hor_2 = 1;
    } else {
      var $a_sroa_0_2 = $a_sroa_0_1162;
      var $a_sroa_1_2 = $a_sroa_1_1161;
      var $a_sroa_2_2 = $a_sroa_2_1160;
      var $a_sroa_3_2 = $a_sroa_3_1159;
      var $hor_2 = 0;
    }
    var $hor_2;
    var $a_sroa_3_2;
    var $a_sroa_2_2;
    var $a_sroa_1_2;
    var $a_sroa_0_2;
    if ($tobool589) {
      var $add600 = HEAPU8[$mbPos_0158 + $add_ptr593_sum8 | 0] + HEAPU8[$mbPos_0158 + $mul592 | 0] | 0;
      var $add607 = HEAPU8[$mbPos_0158 + $incdec_ptr597_sum9 | 0] + HEAPU8[$mbPos_0158 + $incdec_ptr594_sum | 0] | 0;
      var $add614 = HEAPU8[$mbPos_0158 + $incdec_ptr604_sum | 0] + HEAPU8[$mbPos_0158 + $incdec_ptr601_sum | 0] | 0;
      var $add621 = HEAPU8[$mbPos_0158 + $incdec_ptr611_sum10 | 0] + HEAPU8[$mbPos_0158 + $incdec_ptr608_sum | 0] | 0;
      var $add626 = $add607 + $add600 | 0;
      HEAP32[$arraydecay34$s2] = $add614 + $add626 + HEAP32[$arraydecay34$s2] + $add621 | 0;
      HEAP32[$arrayidx586$s2] = $add626 - $add614 - $add621 + HEAP32[$arrayidx586$s2] | 0;
      var $b_sroa_0_2 = $add600;
      var $b_sroa_1_2 = $add607;
      var $b_sroa_2_2 = $add614;
      var $b_sroa_3_2 = $add621;
      var $hor_3 = $hor_2 + 1 | 0;
    } else {
      var $b_sroa_0_2 = $b_sroa_0_1166;
      var $b_sroa_1_2 = $b_sroa_1_1165;
      var $b_sroa_2_2 = $b_sroa_2_1164;
      var $b_sroa_3_2 = $b_sroa_3_1163;
      var $hor_3 = $hor_2;
    }
    var $hor_3;
    var $b_sroa_3_2;
    var $b_sroa_2_2;
    var $b_sroa_1_2;
    var $b_sroa_0_2;
    if ($tobool643) {
      var $add653 = HEAPU8[$mbPos_0158 + $add_ptr645_sum | 0] + HEAPU8[$mbPos_0158 - 1 | 0] | 0;
      var $add663 = HEAPU8[$mbPos_0158 + $add_ptr655_sum | 0] + HEAPU8[$mbPos_0158 + $add_ptr645_sum5 | 0] | 0;
      var $add673 = HEAPU8[$mbPos_0158 + $add_ptr665_sum | 0] + HEAPU8[$mbPos_0158 + $add_ptr655_sum6 | 0] | 0;
      var $add683 = HEAPU8[$mbPos_0158 + $add_ptr675_sum | 0] + HEAPU8[$mbPos_0158 + $add_ptr665_sum7 | 0] | 0;
      var $add688 = $add663 + $add653 | 0;
      HEAP32[$arraydecay34$s2] = $add673 + $add688 + HEAP32[$arraydecay34$s2] + $add683 | 0;
      HEAP32[$arrayidx702$s2] = $add688 - $add673 - $add683 + HEAP32[$arrayidx702$s2] | 0;
      var $l_sroa_0_2 = $add653;
      var $l_sroa_1_2 = $add663;
      var $l_sroa_2_2 = $add673;
      var $l_sroa_3_2 = $add683;
      var $j_6 = $hor_3 + 1 | 0;
      var $ver_2 = 1;
    } else {
      var $l_sroa_0_2 = $l_sroa_0_1170;
      var $l_sroa_1_2 = $l_sroa_1_1169;
      var $l_sroa_2_2 = $l_sroa_2_1168;
      var $l_sroa_3_2 = $l_sroa_3_1167;
      var $j_6 = $hor_3;
      var $ver_2 = 0;
    }
    var $ver_2;
    var $j_6;
    var $l_sroa_3_2;
    var $l_sroa_2_2;
    var $l_sroa_1_2;
    var $l_sroa_0_2;
    do {
      if ($tobool705) {
        var $add715 = HEAPU8[$mbPos_0158 + $add_ptr707_sum | 0] + HEAPU8[$mbPos_0158 + 8 | 0] | 0;
        var $add725 = HEAPU8[$mbPos_0158 + $add_ptr717_sum | 0] + HEAPU8[$mbPos_0158 + $add_ptr707_sum12 | 0] | 0;
        var $add735 = HEAPU8[$mbPos_0158 + $add_ptr727_sum | 0] + HEAPU8[$mbPos_0158 + $add_ptr717_sum3 | 0] | 0;
        var $add745 = HEAPU8[$mbPos_0158 + $add_ptr737_sum | 0] + HEAPU8[$mbPos_0158 + $add_ptr727_sum4 | 0] | 0;
        var $inc746 = $j_6 + 1 | 0;
        var $inc747 = $ver_2 + 1 | 0;
        var $add750 = $add725 + $add715 | 0;
        HEAP32[$arraydecay34$s2] = $add735 + $add750 + HEAP32[$arraydecay34$s2] + $add745 | 0;
        var $add765 = $add750 - $add735 - $add745 + HEAP32[$arrayidx702$s2] | 0;
        HEAP32[$arrayidx702$s2] = $add765;
        var $tobool767 = ($hor_3 | 0) != 0;
        if ($tobool767 | $tobool643_not | $tobool705_not) {
          if ($tobool767) {
            var $j_7115129 = $inc746;
            var $ver_3113130 = $inc747;
            label = 152;
            break;
          } else {
            var $ver_3112146148 = $inc747;
            var $j_7114145149 = $inc746;
            var $130 = $add765;
            label = 157;
            break;
          }
        } else {
          HEAP32[$arrayidx586$s2] = $l_sroa_2_2 + $l_sroa_3_2 + $l_sroa_1_2 + $l_sroa_0_2 - $add715 - $add725 - $add735 - $add745 >> 4;
          var $ver_3112146148 = $inc747;
          var $j_7114145149 = $inc746;
          var $130 = $add765;
          label = 157;
          break;
        }
      } else {
        if (($hor_3 | 0) == 0) {
          var $ver_3112 = $ver_2;
          var $j_7114 = $j_6;
          label = 153;
          break;
        } else {
          var $j_7115129 = $j_6;
          var $ver_3113130 = $ver_2;
          label = 152;
          break;
        }
      }
    } while (0);
    do {
      if (label == 152) {
        label = 0;
        var $ver_3113130;
        var $j_7115129;
        HEAP32[$arrayidx586$s2] = HEAP32[$arrayidx586$s2] >> $hor_3 + 2;
        var $ver_3112 = $ver_3113130;
        var $j_7114 = $j_7115129;
        label = 153;
        break;
      }
    } while (0);
    do {
      if (label == 153) {
        label = 0;
        var $j_7114;
        var $ver_3112;
        var $tobool798 = ($ver_3112 | 0) != 0;
        if (!($tobool798 | $tobool535_not | $tobool589_not)) {
          HEAP32[$arrayidx702$s2] = $a_sroa_2_2 + $a_sroa_3_2 + $a_sroa_1_2 + $a_sroa_0_2 - $b_sroa_3_2 - $b_sroa_2_2 - $b_sroa_1_2 - $b_sroa_0_2 >> 4;
          var $j_7114144 = $j_7114;
          break;
        }
        if (!$tobool798) {
          var $j_7114144 = $j_7114;
          break;
        }
        var $ver_3112146148 = $ver_3112;
        var $j_7114145149 = $j_7114;
        var $130 = HEAP32[$arrayidx702$s2];
        label = 157;
        break;
      }
    } while (0);
    if (label == 157) {
      label = 0;
      var $130;
      var $j_7114145149;
      var $ver_3112146148;
      HEAP32[$arrayidx702$s2] = $130 >> $ver_3112146148 + 2;
      var $j_7114144 = $j_7114145149;
    }
    var $j_7114144;
    if (($j_7114144 | 0) == 1) {
      HEAP32[$arraydecay34$s2] = HEAP32[$arraydecay34$s2] >> 3;
    } else if (($j_7114144 | 0) == 2) {
      HEAP32[$arraydecay34$s2] = HEAP32[$arraydecay34$s2] >> 4;
    } else if (($j_7114144 | 0) == 3) {
      HEAP32[$arraydecay34$s2] = (HEAP32[$arraydecay34$s2] * 21 & -1) >> 9;
    } else {
      HEAP32[$arraydecay34$s2] = HEAP32[$arraydecay34$s2] >> 5;
    }
    _Transform($arraydecay34);
    var $i_1154 = 0;
    var $pData_1155 = ($comp_0157 << 6) + $data + 256 | 0;
    var $pTmp_1156 = $arraydecay34;
    while (1) {
      var $pTmp_1156;
      var $pData_1155;
      var $i_1154;
      var $135 = HEAP32[$pTmp_1156 + (($i_1154 >>> 1 & 3) << 2) >> 2];
      if (($135 | 0) < 0) {
        var $cond868 = 0;
      } else {
        var $cond868 = ($135 | 0) > 255 ? -1 : $135 & 255;
      }
      var $cond868;
      HEAP8[$pData_1155] = $cond868;
      var $inc871 = $i_1154 + 1 | 0;
      if (($inc871 | 0) == 64) {
        break;
      } else {
        var $i_1154 = $inc871;
        var $pData_1155 = $pData_1155 + 1 | 0;
        var $pTmp_1156 = ($inc871 & 15 | 0) == 0 ? $pTmp_1156 + 16 | 0 : $pTmp_1156;
      }
    }
    var $inc881 = $comp_0157 + 1 | 0;
    if (($inc881 | 0) == 2) {
      break;
    } else {
      var $comp_0157 = $inc881;
      var $mbPos_0158 = $mbPos_0158 + $mul879 | 0;
      var $a_sroa_3_1159 = $a_sroa_3_2;
      var $a_sroa_2_1160 = $a_sroa_2_2;
      var $a_sroa_1_1161 = $a_sroa_1_2;
      var $a_sroa_0_1162 = $a_sroa_0_2;
      var $b_sroa_3_1163 = $b_sroa_3_2;
      var $b_sroa_2_1164 = $b_sroa_2_2;
      var $b_sroa_1_1165 = $b_sroa_1_2;
      var $b_sroa_0_1166 = $b_sroa_0_2;
      var $l_sroa_3_1167 = $l_sroa_3_2;
      var $l_sroa_2_1168 = $l_sroa_2_2;
      var $l_sroa_1_1169 = $l_sroa_1_2;
      var $l_sroa_0_1170 = $l_sroa_0_2;
    }
  }
  _h264bsdWriteMacroblock($currImage, $arraydecay498);
  STACKTOP = __stackBase__;
  return;
}
_ConcealMb["X"] = 1;
function _Transform($data) {
  var $arrayidx1$s2;
  var $arrayidx$s2;
  var $data$s2 = $data >> 2;
  var $arrayidx$s2 = ($data + 4 | 0) >> 2;
  var $0 = HEAP32[$arrayidx$s2];
  var $arrayidx1$s2 = ($data + 16 | 0) >> 2;
  var $1 = HEAP32[$arrayidx1$s2];
  var $4 = HEAP32[$data$s2];
  if (($0 | $1 | 0) == 0) {
    HEAP32[$data$s2 + 15] = $4;
    HEAP32[$data$s2 + 14] = $4;
    HEAP32[$data$s2 + 13] = $4;
    HEAP32[$data$s2 + 12] = $4;
    HEAP32[$data$s2 + 11] = $4;
    HEAP32[$data$s2 + 10] = $4;
    HEAP32[$data$s2 + 9] = $4;
    HEAP32[$data$s2 + 8] = $4;
    HEAP32[$data$s2 + 7] = $4;
    HEAP32[$data$s2 + 6] = $4;
    HEAP32[$data$s2 + 5] = $4;
    HEAP32[$arrayidx1$s2] = $4;
    HEAP32[$data$s2 + 3] = $4;
    HEAP32[$data$s2 + 2] = $4;
    HEAP32[$arrayidx$s2] = $4;
    return;
  } else {
    var $add = $0 + $4 | 0;
    var $shr = $0 >> 1;
    var $add22 = $shr + $4 | 0;
    var $sub = $4 - $shr | 0;
    var $sub26 = $4 - $0 | 0;
    HEAP32[$data$s2] = $1 + $add | 0;
    var $shr37 = $1 >> 1;
    HEAP32[$arrayidx1$s2] = $shr37 + $add | 0;
    HEAP32[$data$s2 + 8] = $add - $shr37 | 0;
    HEAP32[$data$s2 + 12] = $add - $1 | 0;
    HEAP32[$arrayidx$s2] = $1 + $add22 | 0;
    HEAP32[$data$s2 + 5] = $shr37 + $add22 | 0;
    HEAP32[$data$s2 + 9] = $add22 - $shr37 | 0;
    HEAP32[$data$s2 + 13] = $add22 - $1 | 0;
    HEAP32[$data$s2 + 2] = $1 + $sub | 0;
    HEAP32[$data$s2 + 6] = $shr37 + $sub | 0;
    HEAP32[$data$s2 + 10] = $sub - $shr37 | 0;
    HEAP32[$data$s2 + 14] = $sub - $1 | 0;
    HEAP32[$data$s2 + 3] = $1 + $sub26 | 0;
    HEAP32[$data$s2 + 7] = $shr37 + $sub26 | 0;
    HEAP32[$data$s2 + 11] = $sub26 - $shr37 | 0;
    HEAP32[$data$s2 + 15] = $sub26 - $1 | 0;
    return;
  }
}
_Transform["X"] = 1;
function _h264bsdDecodePicOrderCnt($poc, $sps, $pSliceHeader, $pNalUnit) {
  var $pNalUnit$s2 = $pNalUnit >> 2;
  var $pSliceHeader$s2 = $pSliceHeader >> 2;
  var $sps$s2 = $sps >> 2;
  var $poc$s2 = $poc >> 2;
  var label = 0;
  L244 : do {
    if ((HEAP32[$pSliceHeader$s2 + 71] | 0) == 0) {
      var $containsMmco5_0 = 0;
    } else {
      var $i_0 = 0;
      while (1) {
        var $i_0;
        var $1 = HEAP32[$pSliceHeader$s2 + ($i_0 * 5 | 0) + 72];
        if (($1 | 0) == 5) {
          break;
        } else if (($1 | 0) == 0) {
          var $containsMmco5_0 = 0;
          break L244;
        }
        var $i_0 = $i_0 + 1 | 0;
      }
      var $containsMmco5_0 = 1;
    }
  } while (0);
  var $containsMmco5_0;
  var $2 = HEAP32[$sps$s2 + 4];
  if (($2 | 0) == 0) {
    if ((HEAP32[$pNalUnit$s2] | 0) == 5) {
      HEAP32[$poc$s2 + 1] = 0;
      HEAP32[$poc$s2] = 0;
      var $4 = 0;
    } else {
      var $4 = HEAP32[$poc$s2];
    }
    var $4;
    var $picOrderCntLsb = $pSliceHeader + 20 | 0;
    var $5 = HEAP32[$picOrderCntLsb >> 2];
    var $prevPicOrderCntLsb12 = $poc | 0;
    do {
      if ($5 >>> 0 < $4 >>> 0) {
        var $6 = HEAP32[$sps$s2 + 5];
        if (($4 - $5 | 0) >>> 0 < $6 >>> 1 >>> 0) {
          label = 189;
          break;
        }
        var $picOrderCnt_0 = HEAP32[$poc$s2 + 1] + $6 | 0;
        break;
      } else {
        label = 189;
      }
    } while (0);
    L259 : do {
      if (label == 189) {
        do {
          if ($5 >>> 0 > $4 >>> 0) {
            var $8 = HEAP32[$sps$s2 + 5];
            if (($5 - $4 | 0) >>> 0 <= $8 >>> 1 >>> 0) {
              break;
            }
            var $picOrderCnt_0 = HEAP32[$poc$s2 + 1] - $8 | 0;
            break L259;
          }
        } while (0);
        var $picOrderCnt_0 = HEAP32[$poc$s2 + 1];
      }
    } while (0);
    var $picOrderCnt_0;
    var $nalRefIdc = $pNalUnit + 4 | 0;
    if ((HEAP32[$nalRefIdc >> 2] | 0) == 0) {
      var $12 = HEAP32[$pSliceHeader$s2 + 6];
      var $picOrderCnt_7 = $5 + $picOrderCnt_0 + (($12 | 0) < 0 ? $12 : 0) | 0;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    }
    var $prevPicOrderCntMsb40 = $poc + 4 | 0;
    HEAP32[$prevPicOrderCntMsb40 >> 2] = $picOrderCnt_0;
    var $_pre = HEAP32[$picOrderCntLsb >> 2];
    var $deltaPicOrderCntBottom = $pSliceHeader + 24 | 0;
    var $13 = HEAP32[$deltaPicOrderCntBottom >> 2];
    var $picOrderCnt_1 = $_pre + $picOrderCnt_0 + (($13 | 0) < 0 ? $13 : 0) | 0;
    if ((HEAP32[$nalRefIdc >> 2] | 0) == 0) {
      var $picOrderCnt_7 = $picOrderCnt_1;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    }
    if (($containsMmco5_0 | 0) == 0) {
      HEAP32[$prevPicOrderCntLsb12 >> 2] = $_pre;
      var $picOrderCnt_7 = $picOrderCnt_1;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    } else {
      HEAP32[$prevPicOrderCntMsb40 >> 2] = 0;
      var $14 = HEAP32[$deltaPicOrderCntBottom >> 2];
      HEAP32[$prevPicOrderCntLsb12 >> 2] = ($14 | 0) < 0 ? -$14 | 0 : 0;
      var $picOrderCnt_7 = 0;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    }
  } else if (($2 | 0) == 1) {
    do {
      if ((HEAP32[$pNalUnit$s2] | 0) == 5) {
        var $frameNumOffset_0 = 0;
      } else {
        var $18 = HEAP32[$poc$s2 + 3];
        if (HEAP32[$poc$s2 + 2] >>> 0 <= HEAP32[$pSliceHeader$s2 + 3] >>> 0) {
          var $frameNumOffset_0 = $18;
          break;
        }
        var $frameNumOffset_0 = HEAP32[$sps$s2 + 3] + $18 | 0;
      }
    } while (0);
    var $frameNumOffset_0;
    var $20 = HEAP32[$sps$s2 + 9];
    var $tobool81 = ($20 | 0) == 0;
    if ($tobool81) {
      var $absFrameNum_0 = 0;
    } else {
      var $absFrameNum_0 = HEAP32[$pSliceHeader$s2 + 3] + $frameNumOffset_0 | 0;
    }
    var $absFrameNum_0;
    var $notlhs = (HEAP32[$pNalUnit$s2 + 1] | 0) == 0;
    var $absFrameNum_1 = ((($absFrameNum_0 | 0) != 0 & $notlhs) << 31 >> 31) + $absFrameNum_0 | 0;
    var $cmp94 = ($absFrameNum_1 | 0) != 0;
    if ($cmp94) {
      var $sub96 = $absFrameNum_1 - 1 | 0;
      var $frameNumInPicOrderCntCycle_0 = ($sub96 >>> 0) % ($20 >>> 0);
      var $picOrderCntCycleCnt_0 = Math.floor(($sub96 >>> 0) / ($20 >>> 0));
    }
    var $picOrderCntCycleCnt_0;
    var $frameNumInPicOrderCntCycle_0;
    L303 : do {
      if ($tobool81) {
        var $expectedDeltaPicOrderCntCycle_0_lcssa = 0;
      } else {
        var $23 = HEAP32[$sps$s2 + 10];
        var $i_1101 = 0;
        var $expectedDeltaPicOrderCntCycle_0102 = 0;
        while (1) {
          var $expectedDeltaPicOrderCntCycle_0102;
          var $i_1101;
          var $add105 = HEAP32[$23 + ($i_1101 << 2) >> 2] + $expectedDeltaPicOrderCntCycle_0102 | 0;
          var $inc106 = $i_1101 + 1 | 0;
          if ($inc106 >>> 0 < $20 >>> 0) {
            var $i_1101 = $inc106;
            var $expectedDeltaPicOrderCntCycle_0102 = $add105;
          } else {
            var $expectedDeltaPicOrderCntCycle_0_lcssa = $add105;
            break L303;
          }
        }
      }
    } while (0);
    var $expectedDeltaPicOrderCntCycle_0_lcssa;
    L308 : do {
      if ($cmp94) {
        var $25 = HEAP32[$sps$s2 + 10];
        var $i_298 = 0;
        var $picOrderCnt_299 = $expectedDeltaPicOrderCntCycle_0_lcssa * $picOrderCntCycleCnt_0 & -1;
        while (1) {
          var $picOrderCnt_299;
          var $i_298;
          var $add114 = HEAP32[$25 + ($i_298 << 2) >> 2] + $picOrderCnt_299 | 0;
          var $inc116 = $i_298 + 1 | 0;
          if ($inc116 >>> 0 > $frameNumInPicOrderCntCycle_0 >>> 0) {
            var $picOrderCnt_3 = $add114;
            break L308;
          } else {
            var $i_298 = $inc116;
            var $picOrderCnt_299 = $add114;
          }
        }
      } else {
        var $picOrderCnt_3 = 0;
      }
    } while (0);
    var $picOrderCnt_3;
    if ($notlhs) {
      var $picOrderCnt_4 = HEAP32[$sps$s2 + 7] + $picOrderCnt_3 | 0;
    } else {
      var $picOrderCnt_4 = $picOrderCnt_3;
    }
    var $picOrderCnt_4;
    var $add129 = HEAP32[$pSliceHeader$s2 + 8] + HEAP32[$sps$s2 + 8] | 0;
    var $prevFrameNumOffset140 = $poc + 12 | 0;
    if (($containsMmco5_0 | 0) == 0) {
      var $picOrderCnt_5 = (($add129 | 0) < 0 ? $add129 : 0) + $picOrderCnt_4 + HEAP32[$pSliceHeader$s2 + 7] | 0;
      HEAP32[$prevFrameNumOffset140 >> 2] = $frameNumOffset_0;
      HEAP32[$poc$s2 + 2] = HEAP32[$pSliceHeader$s2 + 3];
      var $picOrderCnt_7 = $picOrderCnt_5;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    } else {
      HEAP32[$prevFrameNumOffset140 >> 2] = 0;
      HEAP32[$poc$s2 + 2] = 0;
      var $picOrderCnt_7 = 0;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    }
  } else {
    do {
      if ((HEAP32[$pNalUnit$s2] | 0) == 5) {
        var $picOrderCnt_6 = 0;
        var $frameNumOffset_197 = 0;
        var $prevFrameNumOffset181_pre_phi = $poc + 12 | 0;
      } else {
        var $34 = HEAP32[$pSliceHeader$s2 + 3];
        var $prevFrameNumOffset155 = $poc + 12 | 0;
        var $35 = HEAP32[$prevFrameNumOffset155 >> 2];
        if (HEAP32[$poc$s2 + 2] >>> 0 > $34 >>> 0) {
          var $frameNumOffset_1_ph = HEAP32[$sps$s2 + 3] + $35 | 0;
        } else {
          var $frameNumOffset_1_ph = $35;
        }
        var $frameNumOffset_1_ph;
        var $mul171 = $34 + $frameNumOffset_1_ph << 1;
        if ((HEAP32[$pNalUnit$s2 + 1] | 0) != 0) {
          var $picOrderCnt_6 = $mul171;
          var $frameNumOffset_197 = $frameNumOffset_1_ph;
          var $prevFrameNumOffset181_pre_phi = $prevFrameNumOffset155;
          break;
        }
        var $picOrderCnt_6 = $mul171 - 1 | 0;
        var $frameNumOffset_197 = $frameNumOffset_1_ph;
        var $prevFrameNumOffset181_pre_phi = $prevFrameNumOffset155;
      }
    } while (0);
    var $prevFrameNumOffset181_pre_phi;
    var $frameNumOffset_197;
    var $picOrderCnt_6;
    if (($containsMmco5_0 | 0) == 0) {
      HEAP32[$prevFrameNumOffset181_pre_phi >> 2] = $frameNumOffset_197;
      HEAP32[$poc$s2 + 2] = HEAP32[$pSliceHeader$s2 + 3];
      var $picOrderCnt_7 = $picOrderCnt_6;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    } else {
      HEAP32[$prevFrameNumOffset181_pre_phi >> 2] = 0;
      HEAP32[$poc$s2 + 2] = 0;
      var $picOrderCnt_7 = 0;
      var $picOrderCnt_7;
      return $picOrderCnt_7;
    }
  }
}
_h264bsdDecodePicOrderCnt["X"] = 1;
function _h264bsdDecodeVuiParameters($pStrmData, $pVuiParameters) {
  var $pVuiParameters$s2 = $pVuiParameters >> 2;
  var label = 0;
  _H264SwDecMemset($pVuiParameters, 0, 952);
  var $call = _h264bsdGetBits($pStrmData, 1);
  if (($call | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp1 = ($call | 0) == 1;
  HEAP32[$pVuiParameters$s2] = $cmp1 & 1;
  do {
    if ($cmp1) {
      var $call4 = _h264bsdGetBits($pStrmData, 8);
      if (($call4 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 1] = $call4;
      if (($call4 | 0) != 255) {
        break;
      }
      var $call11 = _h264bsdGetBits($pStrmData, 16);
      if (($call11 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 2] = $call11;
      var $call15 = _h264bsdGetBits($pStrmData, 16);
      if (($call15 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        HEAP32[$pVuiParameters$s2 + 3] = $call15;
        break;
      }
    }
  } while (0);
  var $call21 = _h264bsdGetBits($pStrmData, 1);
  if (($call21 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp25 = ($call21 | 0) == 1;
  HEAP32[$pVuiParameters$s2 + 4] = $cmp25 & 1;
  do {
    if ($cmp25) {
      var $call30 = _h264bsdGetBits($pStrmData, 1);
      if (($call30 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        HEAP32[$pVuiParameters$s2 + 5] = ($call30 | 0) == 1 & 1;
        break;
      }
    }
  } while (0);
  var $call37 = _h264bsdGetBits($pStrmData, 1);
  if (($call37 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp41 = ($call37 | 0) == 1;
  HEAP32[$pVuiParameters$s2 + 6] = $cmp41 & 1;
  do {
    if ($cmp41) {
      var $call46 = _h264bsdGetBits($pStrmData, 3);
      if (($call46 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 7] = $call46;
      var $call50 = _h264bsdGetBits($pStrmData, 1);
      if (($call50 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 8] = ($call50 | 0) == 1 & 1;
      var $call56 = _h264bsdGetBits($pStrmData, 1);
      if (($call56 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $cmp60 = ($call56 | 0) == 1;
      HEAP32[$pVuiParameters$s2 + 9] = $cmp60 & 1;
      if (!$cmp60) {
        HEAP32[$pVuiParameters$s2 + 10] = 2;
        HEAP32[$pVuiParameters$s2 + 11] = 2;
        HEAP32[$pVuiParameters$s2 + 12] = 2;
        break;
      }
      var $call65 = _h264bsdGetBits($pStrmData, 8);
      if (($call65 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 10] = $call65;
      var $call69 = _h264bsdGetBits($pStrmData, 8);
      if (($call69 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 11] = $call69;
      var $call73 = _h264bsdGetBits($pStrmData, 8);
      if (($call73 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        HEAP32[$pVuiParameters$s2 + 12] = $call73;
        break;
      }
    } else {
      HEAP32[$pVuiParameters$s2 + 7] = 5;
      HEAP32[$pVuiParameters$s2 + 10] = 2;
      HEAP32[$pVuiParameters$s2 + 11] = 2;
      HEAP32[$pVuiParameters$s2 + 12] = 2;
    }
  } while (0);
  var $call87 = _h264bsdGetBits($pStrmData, 1);
  if (($call87 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp91 = ($call87 | 0) == 1;
  HEAP32[$pVuiParameters$s2 + 13] = $cmp91 & 1;
  do {
    if ($cmp91) {
      var $chromaSampleLocTypeTopField = $pVuiParameters + 56 | 0;
      var $call96 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $chromaSampleLocTypeTopField);
      if (($call96 | 0) != 0) {
        var $retval_0 = $call96;
        var $retval_0;
        return $retval_0;
      }
      if (HEAP32[$chromaSampleLocTypeTopField >> 2] >>> 0 > 5) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $chromaSampleLocTypeBottomField = $pVuiParameters + 60 | 0;
      var $call104 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $chromaSampleLocTypeBottomField);
      if (($call104 | 0) != 0) {
        var $retval_0 = $call104;
        var $retval_0;
        return $retval_0;
      }
      if (HEAP32[$chromaSampleLocTypeBottomField >> 2] >>> 0 > 5) {
        var $retval_0 = 1;
      } else {
        break;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $call113 = _h264bsdGetBits($pStrmData, 1);
  if (($call113 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp117 = ($call113 | 0) == 1;
  HEAP32[$pVuiParameters$s2 + 16] = $cmp117 & 1;
  do {
    if ($cmp117) {
      var $call122 = _h264bsdShowBits32($pStrmData);
      if ((_h264bsdFlushBits($pStrmData, 32) | 0) == -1 | ($call122 | 0) == 0) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 17] = $call122;
      var $call130 = _h264bsdShowBits32($pStrmData);
      if ((_h264bsdFlushBits($pStrmData, 32) | 0) == -1 | ($call130 | 0) == 0) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 18] = $call130;
      var $call138 = _h264bsdGetBits($pStrmData, 1);
      if (($call138 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        HEAP32[$pVuiParameters$s2 + 19] = ($call138 | 0) == 1 & 1;
        break;
      }
    }
  } while (0);
  var $call145 = _h264bsdGetBits($pStrmData, 1);
  if (($call145 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp149 = ($call145 | 0) == 1;
  var $nalHrdParametersPresentFlag = $pVuiParameters + 80 | 0;
  HEAP32[$nalHrdParametersPresentFlag >> 2] = $cmp149 & 1;
  do {
    if ($cmp149) {
      var $call154 = _DecodeHrdParameters($pStrmData, $pVuiParameters + 84 | 0);
      if (($call154 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call154;
      }
      var $retval_0;
      return $retval_0;
    } else {
      HEAP32[$pVuiParameters$s2 + 21] = 1;
      HEAP32[$pVuiParameters$s2 + 24] = 288000001;
      HEAP32[$pVuiParameters$s2 + 56] = 288000001;
      HEAP32[$pVuiParameters$s2 + 120] = 24;
      HEAP32[$pVuiParameters$s2 + 121] = 24;
      HEAP32[$pVuiParameters$s2 + 122] = 24;
      HEAP32[$pVuiParameters$s2 + 123] = 24;
    }
  } while (0);
  var $call168 = _h264bsdGetBits($pStrmData, 1);
  if (($call168 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp172 = ($call168 | 0) == 1;
  var $vclHrdParametersPresentFlag = $pVuiParameters + 496 | 0;
  HEAP32[$vclHrdParametersPresentFlag >> 2] = $cmp172 & 1;
  do {
    if ($cmp172) {
      var $call177 = _DecodeHrdParameters($pStrmData, $pVuiParameters + 500 | 0);
      if (($call177 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call177;
      }
      var $retval_0;
      return $retval_0;
    } else {
      HEAP32[$pVuiParameters$s2 + 125] = 1;
      HEAP32[$pVuiParameters$s2 + 128] = 240000001;
      HEAP32[$pVuiParameters$s2 + 160] = 240000001;
      HEAP32[$pVuiParameters$s2 + 224] = 24;
      HEAP32[$pVuiParameters$s2 + 225] = 24;
      HEAP32[$pVuiParameters$s2 + 226] = 24;
      HEAP32[$pVuiParameters$s2 + 227] = 24;
    }
  } while (0);
  do {
    if ((HEAP32[$nalHrdParametersPresentFlag >> 2] | 0) == 0) {
      if ((HEAP32[$vclHrdParametersPresentFlag >> 2] | 0) == 0) {
        break;
      } else {
        label = 280;
        break;
      }
    } else {
      label = 280;
    }
  } while (0);
  do {
    if (label == 280) {
      var $call204 = _h264bsdGetBits($pStrmData, 1);
      if (($call204 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      } else {
        HEAP32[$pVuiParameters$s2 + 228] = ($call204 | 0) == 1 & 1;
        break;
      }
    }
  } while (0);
  var $call211 = _h264bsdGetBits($pStrmData, 1);
  if (($call211 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$pVuiParameters$s2 + 229] = ($call211 | 0) == 1 & 1;
  var $call217 = _h264bsdGetBits($pStrmData, 1);
  if (($call217 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cmp221 = ($call217 | 0) == 1;
  HEAP32[$pVuiParameters$s2 + 230] = $cmp221 & 1;
  do {
    if ($cmp221) {
      var $call226 = _h264bsdGetBits($pStrmData, 1);
      if (($call226 | 0) == -1) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      HEAP32[$pVuiParameters$s2 + 231] = ($call226 | 0) == 1 & 1;
      var $maxBytesPerPicDenom = $pVuiParameters + 928 | 0;
      var $call232 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $maxBytesPerPicDenom);
      if (($call232 | 0) != 0) {
        var $retval_0 = $call232;
        var $retval_0;
        return $retval_0;
      }
      if (HEAP32[$maxBytesPerPicDenom >> 2] >>> 0 > 16) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $maxBitsPerMbDenom = $pVuiParameters + 932 | 0;
      var $call240 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $maxBitsPerMbDenom);
      if (($call240 | 0) != 0) {
        var $retval_0 = $call240;
        var $retval_0;
        return $retval_0;
      }
      if (HEAP32[$maxBitsPerMbDenom >> 2] >>> 0 > 16) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $log2MaxMvLengthHorizontal = $pVuiParameters + 936 | 0;
      var $call248 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $log2MaxMvLengthHorizontal);
      if (($call248 | 0) != 0) {
        var $retval_0 = $call248;
        var $retval_0;
        return $retval_0;
      }
      if (HEAP32[$log2MaxMvLengthHorizontal >> 2] >>> 0 > 16) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $log2MaxMvLengthVertical = $pVuiParameters + 940 | 0;
      var $call256 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $log2MaxMvLengthVertical);
      if (($call256 | 0) != 0) {
        var $retval_0 = $call256;
        var $retval_0;
        return $retval_0;
      }
      if (HEAP32[$log2MaxMvLengthVertical >> 2] >>> 0 > 16) {
        var $retval_0 = 1;
        var $retval_0;
        return $retval_0;
      }
      var $call264 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $pVuiParameters + 944 | 0);
      if (($call264 | 0) != 0) {
        var $retval_0 = $call264;
        var $retval_0;
        return $retval_0;
      }
      var $call268 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $pVuiParameters + 948 | 0);
      if (($call268 | 0) == 0) {
        break;
      } else {
        var $retval_0 = $call268;
      }
      var $retval_0;
      return $retval_0;
    } else {
      HEAP32[$pVuiParameters$s2 + 231] = 1;
      HEAP32[$pVuiParameters$s2 + 232] = 2;
      HEAP32[$pVuiParameters$s2 + 233] = 1;
      HEAP32[$pVuiParameters$s2 + 234] = 16;
      HEAP32[$pVuiParameters$s2 + 235] = 16;
      HEAP32[$pVuiParameters$s2 + 236] = 16;
      HEAP32[$pVuiParameters$s2 + 237] = 16;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_h264bsdDecodeVuiParameters["X"] = 1;
function _DecodeHrdParameters($pStrmData, $pHrdParameters) {
  var $arrayidx32$s2;
  var $arrayidx$s2;
  var $cpbCnt$s2;
  var $pHrdParameters$s2 = $pHrdParameters >> 2;
  var label = 0;
  var $cpbCnt = $pHrdParameters | 0, $cpbCnt$s2 = $cpbCnt >> 2;
  var $call = _h264bsdDecodeExpGolombUnsigned($pStrmData, $cpbCnt);
  if (($call | 0) != 0) {
    var $retval_0 = $call;
    var $retval_0;
    return $retval_0;
  }
  var $inc = HEAP32[$cpbCnt$s2] + 1 | 0;
  HEAP32[$cpbCnt$s2] = $inc;
  if ($inc >>> 0 > 32) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $call7 = _h264bsdGetBits($pStrmData, 4);
  if (($call7 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $bitRateScale = $pHrdParameters + 4 | 0;
  HEAP32[$bitRateScale >> 2] = $call7;
  var $call11 = _h264bsdGetBits($pStrmData, 4);
  if (($call11 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  var $cpbSizeScale = $pHrdParameters + 8 | 0;
  HEAP32[$cpbSizeScale >> 2] = $call11;
  L485 : do {
    if ((HEAP32[$cpbCnt$s2] | 0) != 0) {
      var $i_059 = 0;
      while (1) {
        var $i_059;
        var $arrayidx = ($i_059 << 2) + $pHrdParameters + 12 | 0, $arrayidx$s2 = $arrayidx >> 2;
        var $call17 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $arrayidx);
        if (($call17 | 0) != 0) {
          var $retval_0 = $call17;
          label = 361;
          break;
        }
        var $2 = HEAP32[$arrayidx$s2];
        if (($2 | 0) == -1) {
          var $retval_0 = 1;
          label = 362;
          break;
        }
        var $inc28 = $2 + 1 | 0;
        HEAP32[$arrayidx$s2] = $inc28;
        HEAP32[$arrayidx$s2] = $inc28 << HEAP32[$bitRateScale >> 2] + 6;
        var $arrayidx32 = ($i_059 << 2) + $pHrdParameters + 140 | 0, $arrayidx32$s2 = $arrayidx32 >> 2;
        var $call33 = _h264bsdDecodeExpGolombUnsigned($pStrmData, $arrayidx32);
        if (($call33 | 0) != 0) {
          var $retval_0 = $call33;
          label = 363;
          break;
        }
        var $4 = HEAP32[$arrayidx32$s2];
        if (($4 | 0) == -1) {
          var $retval_0 = 1;
          label = 364;
          break;
        }
        var $inc44 = $4 + 1 | 0;
        HEAP32[$arrayidx32$s2] = $inc44;
        HEAP32[$arrayidx32$s2] = $inc44 << HEAP32[$cpbSizeScale >> 2] + 4;
        var $call51 = _h264bsdGetBits($pStrmData, 1);
        if (($call51 | 0) == -1) {
          var $retval_0 = 1;
          label = 365;
          break;
        }
        HEAP32[(($i_059 << 2) + 268 >> 2) + $pHrdParameters$s2] = ($call51 | 0) == 1 & 1;
        var $inc57 = $i_059 + 1 | 0;
        if ($inc57 >>> 0 < HEAP32[$cpbCnt$s2] >>> 0) {
          var $i_059 = $inc57;
        } else {
          break L485;
        }
      }
      if (label == 361) {
        var $retval_0;
        return $retval_0;
      } else if (label == 362) {
        var $retval_0;
        return $retval_0;
      } else if (label == 363) {
        var $retval_0;
        return $retval_0;
      } else if (label == 364) {
        var $retval_0;
        return $retval_0;
      } else if (label == 365) {
        var $retval_0;
        return $retval_0;
      }
    }
  } while (0);
  var $call58 = _h264bsdGetBits($pStrmData, 5);
  if (($call58 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$pHrdParameters$s2 + 99] = $call58 + 1 | 0;
  var $call63 = _h264bsdGetBits($pStrmData, 5);
  if (($call63 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$pHrdParameters$s2 + 100] = $call63 + 1 | 0;
  var $call68 = _h264bsdGetBits($pStrmData, 5);
  if (($call68 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$pHrdParameters$s2 + 101] = $call68 + 1 | 0;
  var $call73 = _h264bsdGetBits($pStrmData, 5);
  if (($call73 | 0) == -1) {
    var $retval_0 = 1;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$pHrdParameters$s2 + 102] = $call73;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_DecodeHrdParameters["X"] = 1;
function _h264bsdPicWidth($pStorage_0_4_val) {
  if (($pStorage_0_4_val | 0) == 0) {
    var $retval_0 = 0;
  } else {
    var $retval_0 = HEAP32[$pStorage_0_4_val + 52 >> 2];
  }
  var $retval_0;
  return $retval_0;
}
function _h264bsdPicHeight($pStorage_0_4_val) {
  if (($pStorage_0_4_val | 0) == 0) {
    var $retval_0 = 0;
  } else {
    var $retval_0 = HEAP32[$pStorage_0_4_val + 56 >> 2];
  }
  var $retval_0;
  return $retval_0;
}
function _h264bsdVideoRange($pStorage_0_4_val) {
  do {
    if (($pStorage_0_4_val | 0) != 0) {
      if ((HEAP32[$pStorage_0_4_val + 80 >> 2] | 0) == 0) {
        break;
      }
      var $1 = HEAP32[$pStorage_0_4_val + 84 >> 2];
      if (($1 | 0) == 0) {
        break;
      }
      if ((HEAP32[$1 + 24 >> 2] | 0) == 0) {
        break;
      }
      if ((HEAP32[$1 + 32 >> 2] | 0) == 0) {
        break;
      } else {
        var $retval_0 = 1;
      }
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
function _h264bsdMatrixCoefficients($pStorage_0_4_val) {
  var $1$s2;
  do {
    if (($pStorage_0_4_val | 0) == 0) {
      var $retval_0 = 2;
    } else {
      if ((HEAP32[$pStorage_0_4_val + 80 >> 2] | 0) == 0) {
        var $retval_0 = 2;
        break;
      }
      var $1 = HEAP32[$pStorage_0_4_val + 84 >> 2], $1$s2 = $1 >> 2;
      if (($1 | 0) == 0) {
        var $retval_0 = 2;
        break;
      }
      if ((HEAP32[$1$s2 + 6] | 0) == 0) {
        var $retval_0 = 2;
        break;
      }
      if ((HEAP32[$1$s2 + 9] | 0) == 0) {
        var $retval_0 = 2;
        break;
      }
      var $retval_0 = HEAP32[$1$s2 + 12];
    }
  } while (0);
  var $retval_0;
  return $retval_0;
}
function _h264bsdSampleAspectRatio($pStorage_0_4_val) {
  var $1$s2;
  do {
    if (($pStorage_0_4_val | 0) == 0) {
      var $h_0 = 1;
      var $w_0 = 1;
    } else {
      if ((HEAP32[$pStorage_0_4_val + 80 >> 2] | 0) == 0) {
        var $h_0 = 1;
        var $w_0 = 1;
        break;
      }
      var $1 = HEAP32[$pStorage_0_4_val + 84 >> 2], $1$s2 = $1 >> 2;
      if (($1 | 0) == 0) {
        var $h_0 = 1;
        var $w_0 = 1;
        break;
      }
      if ((HEAP32[$1$s2] | 0) == 0) {
        var $h_0 = 1;
        var $w_0 = 1;
        break;
      }
      var $3 = HEAP32[$1$s2 + 1];
      if (($3 | 0) == 9) {
        var $h_0 = 33;
        var $w_0 = 80;
        break;
      } else if (($3 | 0) == 3) {
        var $h_0 = 11;
        var $w_0 = 10;
        break;
      } else if (($3 | 0) == 7) {
        var $h_0 = 11;
        var $w_0 = 20;
        break;
      } else if (($3 | 0) == 5) {
        var $h_0 = 33;
        var $w_0 = 40;
        break;
      } else if (($3 | 0) == 8) {
        var $h_0 = 11;
        var $w_0 = 32;
        break;
      } else if (($3 | 0) == 6) {
        var $h_0 = 11;
        var $w_0 = 24;
        break;
      } else if (($3 | 0) == 2) {
        var $h_0 = 11;
        var $w_0 = 12;
        break;
      } else if (($3 | 0) == 4) {
        var $h_0 = 11;
        var $w_0 = 16;
        break;
      } else if (($3 | 0) == 0 | ($3 | 0) == 1) {
        var $h_0 = $3;
        var $w_0 = $3;
        break;
      } else if (($3 | 0) == 255) {
        var $4 = HEAP32[$1$s2 + 2];
        var $5 = HEAP32[$1$s2 + 3];
        var $or_cond = ($4 | 0) == 0 | ($5 | 0) == 0;
        var $h_0 = $or_cond ? 0 : $5;
        var $w_0 = $or_cond ? 0 : $4;
        break;
      } else if (($3 | 0) == 13) {
        var $h_0 = 99;
        var $w_0 = 160;
        break;
      } else if (($3 | 0) == 12) {
        var $h_0 = 33;
        var $w_0 = 64;
        break;
      } else if (($3 | 0) == 11) {
        var $h_0 = 11;
        var $w_0 = 15;
        break;
      } else if (($3 | 0) == 10) {
        var $h_0 = 11;
        var $w_0 = 18;
        break;
      } else {
        var $h_0 = 0;
        var $w_0 = 0;
        break;
      }
    }
  } while (0);
  var $w_0;
  var $h_0;
  HEAP32[1311417] = $w_0;
  HEAP32[1311418] = $h_0;
  return;
}
function _h264bsdProfile($pStorage_0_4_val) {
  if (($pStorage_0_4_val | 0) == 0) {
    var $retval_0 = 0;
  } else {
    var $retval_0 = HEAP32[$pStorage_0_4_val >> 2];
  }
  var $retval_0;
  return $retval_0;
}
function _h264bsdInit($pStorage) {
  _h264bsdInitStorage($pStorage);
  var $call = _H264SwDecMalloc(2112);
  HEAP32[$pStorage + 3376 >> 2] = $call;
  return ($call | 0) == 0 ? 1 : 0;
}
function _h264bsdDecode($pStorage, $byteStrm, $len, $picId, $readBytes) {
  var $activeSps163$s2;
  var $oldSPS_0$s2;
  var $33$s2;
  var $activeSpsId$s2;
  var $pStorage_idx1$s2;
  var $nalUnitType$s2;
  var $7$s2;
  var $6$s2;
  var $3$s2;
  var $2$s2;
  var $prevBufNotFinished$s2;
  var $strm$s2;
  var $pStorage$s2 = $pStorage >> 2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 204 | 0;
  var $ppsId = __stackBase__;
  var $nalUnit = __stackBase__ + 4;
  var $seqParamSet = __stackBase__ + 12;
  var $picParamSet = __stackBase__ + 104;
  var $strm = __stackBase__ + 176, $strm$s2 = $strm >> 2;
  var $accessUnitBoundaryFlag = __stackBase__ + 196;
  var $noOutputOfPriorPicsFlag = __stackBase__ + 200;
  HEAP32[$accessUnitBoundaryFlag >> 2] = 0;
  var $prevBufNotFinished$s2 = ($pStorage + 3344 | 0) >> 2;
  do {
    if ((HEAP32[$prevBufNotFinished$s2] | 0) == 0) {
      label = 420;
    } else {
      if ((HEAP32[$pStorage$s2 + 837] | 0) != ($byteStrm | 0)) {
        label = 420;
        break;
      }
      var $2$s2 = $strm >> 2;
      var $3$s2 = ($pStorage + 3356 | 0) >> 2;
      HEAP32[$2$s2] = HEAP32[$3$s2];
      HEAP32[$2$s2 + 1] = HEAP32[$3$s2 + 1];
      HEAP32[$2$s2 + 2] = HEAP32[$3$s2 + 2];
      HEAP32[$2$s2 + 3] = HEAP32[$3$s2 + 3];
      HEAP32[$strm$s2 + 1] = HEAP32[$strm$s2];
      HEAP32[$strm$s2 + 2] = 0;
      HEAP32[$strm$s2 + 4] = 0;
      HEAP32[$readBytes >> 2] = HEAP32[$pStorage$s2 + 838];
      break;
    }
  } while (0);
  do {
    if (label == 420) {
      if ((_h264bsdExtractNalUnit($byteStrm, $len, $strm, $readBytes) | 0) == 0) {
        var $6$s2 = ($pStorage + 3356 | 0) >> 2;
        var $7$s2 = $strm >> 2;
        HEAP32[$6$s2] = HEAP32[$7$s2];
        HEAP32[$6$s2 + 1] = HEAP32[$7$s2 + 1];
        HEAP32[$6$s2 + 2] = HEAP32[$7$s2 + 2];
        HEAP32[$6$s2 + 3] = HEAP32[$7$s2 + 3];
        HEAP32[$6$s2 + 4] = HEAP32[$7$s2 + 4];
        HEAP32[$pStorage$s2 + 838] = HEAP32[$readBytes >> 2];
        HEAP32[$pStorage$s2 + 837] = $byteStrm;
        break;
      } else {
        var $retval_0 = 3;
        var $retval_0;
        STACKTOP = __stackBase__;
        return $retval_0;
      }
    }
  } while (0);
  HEAP32[$prevBufNotFinished$s2] = 0;
  if ((_h264bsdDecodeNalUnit($strm, $nalUnit) | 0) != 0) {
    var $retval_0 = 3;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $nalUnitType$s2 = ($nalUnit | 0) >> 2;
  var $9 = HEAP32[$nalUnitType$s2];
  if (($9 | 0) == 0 | $9 >>> 0 > 12) {
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $call28 = _h264bsdCheckAccessUnitBoundary($strm, $nalUnit, $pStorage, $accessUnitBoundaryFlag);
  if (($call28 | 0) == 0) {
    L585 : do {
      if ((HEAP32[$accessUnitBoundaryFlag >> 2] | 0) == 0) {
        label = 435;
      } else {
        do {
          if ((HEAP32[$pStorage$s2 + 296] | 0) != 0) {
            if ((HEAP32[$pStorage$s2 + 4] | 0) == 0) {
              break;
            }
            if ((HEAP32[$pStorage$s2 + 845] | 0) != 0) {
              var $retval_0 = 3;
              var $retval_0;
              STACKTOP = __stackBase__;
              return $retval_0;
            }
            if ((HEAP32[$pStorage$s2 + 297] | 0) == 0) {
              var $arraydecay = $pStorage + 1220 | 0;
              var $arraydecay47 = $pStorage + 1336 | 0;
              HEAP32[$arraydecay47 >> 2] = _h264bsdAllocateDpbImage($arraydecay);
              _h264bsdInitRefPicList($arraydecay);
              _h264bsdConceal($pStorage, $arraydecay47, 0);
            } else {
              _h264bsdConceal($pStorage, $pStorage + 1336 | 0, HEAP32[$pStorage$s2 + 343]);
            }
            HEAP32[$readBytes >> 2] = 0;
            HEAP32[$prevBufNotFinished$s2] = 1;
            HEAP32[$pStorage$s2 + 295] = 0;
            var $arraydecay237_pre_phi = $pStorage + 1336 | 0;
            var $arraydecay243_pre_phi = $pStorage + 1360 | 0;
            break L585;
          }
        } while (0);
        HEAP32[$pStorage$s2 + 297] = 0;
        HEAP32[$pStorage$s2 + 295] = 0;
        label = 435;
        break;
      }
    } while (0);
    do {
      if (label == 435) {
        var $16 = HEAP32[$nalUnitType$s2];
        if (($16 | 0) == 7) {
          if ((_h264bsdDecodeSeqParamSet($strm, $seqParamSet) | 0) == 0) {
            _h264bsdStoreSeqParamSet($pStorage, $seqParamSet);
            var $retval_0 = 0;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else {
            var $offsetForRefFrame = $seqParamSet + 40 | 0;
            _H264SwDecFree(HEAP32[$offsetForRefFrame >> 2]);
            HEAP32[$offsetForRefFrame >> 2] = 0;
            var $vuiParameters = $seqParamSet + 84 | 0;
            _H264SwDecFree(HEAP32[$vuiParameters >> 2]);
            HEAP32[$vuiParameters >> 2] = 0;
            var $retval_0 = 3;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
        } else if (($16 | 0) == 8) {
          if ((_h264bsdDecodePicParamSet($strm, $picParamSet) | 0) == 0) {
            _h264bsdStorePicParamSet($pStorage, $picParamSet);
            var $retval_0 = 0;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else {
            var $runLength = $picParamSet + 20 | 0;
            _H264SwDecFree(HEAP32[$runLength >> 2]);
            HEAP32[$runLength >> 2] = 0;
            var $topLeft = $picParamSet + 24 | 0;
            _H264SwDecFree(HEAP32[$topLeft >> 2]);
            HEAP32[$topLeft >> 2] = 0;
            var $bottomRight = $picParamSet + 28 | 0;
            _H264SwDecFree(HEAP32[$bottomRight >> 2]);
            HEAP32[$bottomRight >> 2] = 0;
            var $sliceGroupId = $picParamSet + 44 | 0;
            _H264SwDecFree(HEAP32[$sliceGroupId >> 2]);
            HEAP32[$sliceGroupId >> 2] = 0;
            var $retval_0 = 3;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
        } else if (($16 | 0) == 5 | ($16 | 0) == 1) {
          var $skipRedundantSlices86 = $pStorage + 1180 | 0;
          if ((HEAP32[$skipRedundantSlices86 >> 2] | 0) != 0) {
            var $retval_0 = 0;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
          HEAP32[$pStorage$s2 + 296] = 1;
          var $pStorage_idx1$s2 = ($pStorage + 1188 | 0) >> 2;
          do {
            if ((_h264bsdIsStartOfPicture(HEAP32[$pStorage_idx1$s2]) | 0) != 0) {
              HEAP32[$pStorage$s2 + 301] = 0;
              HEAP32[$pStorage$s2 + 302] = $picId;
              _h264bsdCheckPpsId($strm, $ppsId);
              var $activeSpsId$s2 = ($pStorage + 8 | 0) >> 2;
              var $30 = HEAP32[$activeSpsId$s2];
              var $cmp96 = ($16 | 0) == 5;
              var $call97 = _h264bsdActivateParamSets($pStorage, HEAP32[$ppsId >> 2], $cmp96 & 1);
              if (($call97 | 0) != 0) {
                HEAP32[$pStorage$s2 + 1] = 256;
                HEAP32[$pStorage$s2 + 3] = 0;
                HEAP32[$activeSpsId$s2] = 32;
                HEAP32[$pStorage$s2 + 4] = 0;
                HEAP32[$pStorage$s2 + 845] = 0;
                var $retval_0 = ($call97 | 0) == 65535 ? 5 : 4;
                var $retval_0;
                STACKTOP = __stackBase__;
                return $retval_0;
              }
              if (($30 | 0) == (HEAP32[$activeSpsId$s2] | 0)) {
                break;
              }
              var $33 = HEAP32[$pStorage$s2 + 4], $33$s2 = $33 >> 2;
              HEAP32[$noOutputOfPriorPicsFlag >> 2] = 1;
              var $oldSpsId = $pStorage | 0;
              var $34 = HEAP32[$oldSpsId >> 2];
              if ($34 >>> 0 < 32) {
                var $oldSPS_0 = HEAP32[(($34 << 2) + 20 >> 2) + $pStorage$s2], $oldSPS_0$s2 = $oldSPS_0 >> 2;
              } else {
                var $oldSPS_0 = 0, $oldSPS_0$s2 = $oldSPS_0 >> 2;
              }
              var $oldSPS_0;
              HEAP32[$readBytes >> 2] = 0;
              HEAP32[$prevBufNotFinished$s2] = 1;
              do {
                if ($cmp96) {
                  if ((_h264bsdCheckPriorPicsFlag($noOutputOfPriorPicsFlag, $strm, $33, HEAP32[$pStorage$s2 + 3]) | HEAP32[$noOutputOfPriorPicsFlag >> 2] | 0) != 0) {
                    label = 455;
                    break;
                  }
                  if ((HEAP32[$pStorage$s2 + 319] | 0) != 0 | ($oldSPS_0 | 0) == 0) {
                    label = 455;
                    break;
                  }
                  if ((HEAP32[$oldSPS_0$s2 + 13] | 0) != (HEAP32[$33$s2 + 13] | 0)) {
                    label = 455;
                    break;
                  }
                  if ((HEAP32[$oldSPS_0$s2 + 14] | 0) != (HEAP32[$33$s2 + 14] | 0)) {
                    label = 455;
                    break;
                  }
                  if ((HEAP32[$oldSPS_0$s2 + 22] | 0) != (HEAP32[$33$s2 + 22] | 0)) {
                    label = 455;
                    break;
                  }
                  _h264bsdFlushDpb($pStorage + 1220 | 0);
                  break;
                } else {
                  label = 455;
                }
              } while (0);
              if (label == 455) {
                HEAP32[$pStorage$s2 + 320] = 0;
              }
              HEAP32[$oldSpsId >> 2] = HEAP32[$activeSpsId$s2];
              var $retval_0 = 2;
              var $retval_0;
              STACKTOP = __stackBase__;
              return $retval_0;
            }
          } while (0);
          if ((HEAP32[$pStorage$s2 + 845] | 0) != 0) {
            var $retval_0 = 3;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
          var $sliceHeader161 = $pStorage + 1368 | 0;
          var $arraydecay162 = $sliceHeader161 | 0;
          var $add_ptr = $pStorage + 2356 | 0;
          var $activeSps163$s2 = ($pStorage + 16 | 0) >> 2;
          var $activePps164 = $pStorage + 12 | 0;
          if ((_h264bsdDecodeSliceHeader($strm, $add_ptr, HEAP32[$activeSps163$s2], HEAP32[$activePps164 >> 2], $nalUnit) | 0) != 0) {
            var $retval_0 = 3;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
          if ((_h264bsdIsStartOfPicture(HEAP32[$pStorage_idx1$s2]) | 0) == 0) {
            var $arraydecay203_pre_phi = $pStorage + 1220 | 0;
          } else {
            var $arraydecay188_pre = $pStorage + 1220 | 0;
            do {
              if ((HEAP32[$nalUnitType$s2] | 0) != 5) {
                if ((_h264bsdCheckGapsInFrameNum($arraydecay188_pre, HEAP32[$pStorage$s2 + 592], (HEAP32[$nalUnit + 4 >> 2] | 0) != 0 & 1, HEAP32[HEAP32[$activeSps163$s2] + 48 >> 2]) | 0) == 0) {
                  break;
                } else {
                  var $retval_0 = 3;
                }
                var $retval_0;
                STACKTOP = __stackBase__;
                return $retval_0;
              }
            } while (0);
            HEAP32[$pStorage$s2 + 334] = _h264bsdAllocateDpbImage($arraydecay188_pre);
            var $arraydecay203_pre_phi = $arraydecay188_pre;
          }
          var $arraydecay203_pre_phi;
          var $56 = $sliceHeader161;
          var $57 = $add_ptr;
          for (var $$src = $57 >> 2, $$dest = $56 >> 2, $$stop = $$src + 247; $$src < $$stop; $$src++, $$dest++) {
            HEAP32[$$dest] = HEAP32[$$src];
          }
          HEAP32[$pStorage_idx1$s2] = 1;
          var $arrayidx199 = $pStorage + 1360 | 0;
          var $58 = $nalUnit;
          var $59 = $arrayidx199;
          var $60$1 = HEAP32[$58 + 4 >> 2];
          HEAP32[$59 >> 2] = HEAP32[$58 >> 2];
          HEAP32[$59 + 4 >> 2] = $60$1;
          var $pStorage_idx3_val = HEAP32[$activeSps163$s2];
          _h264bsdComputeSliceGroupMap(HEAP32[$activePps164 >> 2], HEAP32[$pStorage_idx3_val + 52 >> 2], HEAP32[$pStorage_idx3_val + 56 >> 2], HEAP32[$pStorage$s2 + 293], HEAP32[$pStorage$s2 + 358]);
          _h264bsdInitRefPicList($arraydecay203_pre_phi);
          if ((_h264bsdReorderRefPicList($arraydecay203_pre_phi, $pStorage + 1436 | 0, HEAP32[$pStorage$s2 + 345], HEAP32[$pStorage$s2 + 353]) | 0) != 0) {
            var $retval_0 = 3;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
          var $arraydecay218 = $pStorage + 1336 | 0;
          if ((_h264bsdDecodeSliceData($strm, $pStorage, $arraydecay218, $arraydecay162) | 0) != 0) {
            _h264bsdMarkSliceCorrupted($pStorage, HEAP32[$sliceHeader161 >> 2]);
            var $retval_0 = 3;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          }
          if ((_h264bsdIsEndOfPicture($pStorage) | 0) == 0) {
            var $retval_0 = 0;
            var $retval_0;
            STACKTOP = __stackBase__;
            return $retval_0;
          } else {
            HEAP32[$skipRedundantSlices86 >> 2] = 1;
            var $arraydecay237_pre_phi = $arraydecay218;
            var $arraydecay243_pre_phi = $arrayidx199;
            break;
          }
        } else {
          var $retval_0 = 0;
          var $retval_0;
          STACKTOP = __stackBase__;
          return $retval_0;
        }
      }
    } while (0);
    var $arraydecay243_pre_phi;
    var $arraydecay237_pre_phi;
    _h264bsdFilterPicture($arraydecay237_pre_phi, HEAP32[$pStorage$s2 + 303]);
    _h264bsdResetStorage($pStorage);
    var $call244 = _h264bsdDecodePicOrderCnt($pStorage + 1284 | 0, HEAP32[$pStorage$s2 + 4], $pStorage + 1368 | 0, $arraydecay243_pre_phi);
    var $validSliceInAccessUnit245 = $pStorage + 1188 | 0;
    do {
      if ((HEAP32[$validSliceInAccessUnit245 >> 2] | 0) != 0) {
        var $arraydecay254 = $pStorage + 1220 | 0;
        if ((HEAP32[$pStorage$s2 + 341] | 0) == 0) {
          _h264bsdMarkDecRefPic($arraydecay254, 0, HEAP32[$arraydecay237_pre_phi >> 2], HEAP32[$pStorage$s2 + 345], $call244, (HEAP32[$arraydecay243_pre_phi >> 2] | 0) == 5 & 1, HEAP32[$pStorage$s2 + 302], HEAP32[$pStorage$s2 + 301]);
          break;
        } else {
          _h264bsdMarkDecRefPic($arraydecay254, $pStorage + 1644 | 0, HEAP32[$arraydecay237_pre_phi >> 2], HEAP32[$pStorage$s2 + 345], $call244, (HEAP32[$arraydecay243_pre_phi >> 2] | 0) == 5 & 1, HEAP32[$pStorage$s2 + 302], HEAP32[$pStorage$s2 + 301]);
          break;
        }
      }
    } while (0);
    HEAP32[$pStorage$s2 + 296] = 0;
    HEAP32[$validSliceInAccessUnit245 >> 2] = 0;
    var $retval_0 = 1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else if (($call28 | 0) == 65520) {
    var $retval_0 = 4;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  } else {
    var $retval_0 = 3;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
}
_h264bsdDecode["X"] = 1;
function _h264bsdShutdown($pStorage) {
  var $arrayidx18$s2;
  var $arrayidx$s2;
  var $i_047 = 0;
  while (1) {
    var $i_047;
    var $arrayidx$s2 = (($i_047 << 2) + $pStorage + 20 | 0) >> 2;
    var $0 = HEAP32[$arrayidx$s2];
    if (($0 | 0) != 0) {
      _H264SwDecFree(HEAP32[$0 + 40 >> 2]);
      HEAP32[HEAP32[$arrayidx$s2] + 40 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx$s2] + 84 >> 2]);
      HEAP32[HEAP32[$arrayidx$s2] + 84 >> 2] = 0;
      _H264SwDecFree(HEAP32[$arrayidx$s2]);
      HEAP32[$arrayidx$s2] = 0;
    }
    var $inc = $i_047 + 1 | 0;
    if (($inc | 0) == 32) {
      var $i_146 = 0;
      break;
    } else {
      var $i_047 = $inc;
    }
  }
  while (1) {
    var $i_146;
    var $arrayidx18$s2 = (($i_146 << 2) + $pStorage + 148 | 0) >> 2;
    var $10 = HEAP32[$arrayidx18$s2];
    if (($10 | 0) != 0) {
      _H264SwDecFree(HEAP32[$10 + 20 >> 2]);
      HEAP32[HEAP32[$arrayidx18$s2] + 20 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx18$s2] + 24 >> 2]);
      HEAP32[HEAP32[$arrayidx18$s2] + 24 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx18$s2] + 28 >> 2]);
      HEAP32[HEAP32[$arrayidx18$s2] + 28 >> 2] = 0;
      _H264SwDecFree(HEAP32[HEAP32[$arrayidx18$s2] + 44 >> 2]);
      HEAP32[HEAP32[$arrayidx18$s2] + 44 >> 2] = 0;
      _H264SwDecFree(HEAP32[$arrayidx18$s2]);
      HEAP32[$arrayidx18$s2] = 0;
    }
    var $inc47 = $i_146 + 1 | 0;
    if (($inc47 | 0) == 256) {
      break;
    } else {
      var $i_146 = $inc47;
    }
  }
  var $mbLayer = $pStorage + 3376 | 0;
  _H264SwDecFree(HEAP32[$mbLayer >> 2]);
  HEAP32[$mbLayer >> 2] = 0;
  var $mb = $pStorage + 1212 | 0;
  _H264SwDecFree(HEAP32[$mb >> 2]);
  HEAP32[$mb >> 2] = 0;
  var $sliceGroupMap = $pStorage + 1172 | 0;
  _H264SwDecFree(HEAP32[$sliceGroupMap >> 2]);
  HEAP32[$sliceGroupMap >> 2] = 0;
  _h264bsdFreeDpb($pStorage + 1220 | 0);
  return;
}
_h264bsdShutdown["X"] = 1;
function _h264bsdNextOutputPicture($pStorage, $picId, $isIdrPic, $numErrMbs) {
  var $call$s2;
  var $call = _h264bsdDpbOutputPicture($pStorage + 1220 | 0), $call$s2 = $call >> 2;
  if (($call | 0) == 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[$picId >> 2] = HEAP32[$call$s2 + 1];
  HEAP32[$isIdrPic >> 2] = HEAP32[$call$s2 + 3];
  HEAP32[$numErrMbs >> 2] = HEAP32[$call$s2 + 2];
  var $retval_0 = HEAP32[$call$s2];
  var $retval_0;
  return $retval_0;
}
function _h264bsdCheckValidParamSets($pStorage) {
  return (_h264bsdValidParamSets($pStorage) | 0) == 0 & 1;
}
function _h264bsdCroppingParams($pStorage) {
  var $0$s2;
  var $0 = HEAP32[$pStorage + 16 >> 2], $0$s2 = $0 >> 2;
  do {
    if (($0 | 0) != 0) {
      if ((HEAP32[$0$s2 + 15] | 0) == 0) {
        break;
      }
      HEAP32[1311419] = 1;
      var $2 = HEAP32[$0$s2 + 16];
      HEAP32[1311420] = $2 << 1;
      HEAP32[1311421] = (HEAP32[$0$s2 + 13] << 4) - (HEAP32[$0$s2 + 17] + $2 << 1) | 0;
      var $5 = HEAP32[$0$s2 + 18];
      HEAP32[1311422] = $5 << 1;
      var $storemerge = (HEAP32[$0$s2 + 14] << 4) - (HEAP32[$0$s2 + 19] + $5 << 1) | 0;
      var $storemerge;
      HEAP32[1311423] = $storemerge;
      return;
    }
  } while (0);
  HEAP32[1311419] = 0;
  HEAP32[1311420] = 0;
  HEAP32[1311421] = 0;
  HEAP32[1311422] = 0;
  var $storemerge = 0;
  var $storemerge;
  HEAP32[1311423] = $storemerge;
  return;
}
function _H264SwDecInit() {
  var $call = _H264SwDecMalloc(3396);
  if (($call | 0) == 0) {
    var $retval_0 = -4;
    var $retval_0;
    return $retval_0;
  }
  if ((_h264bsdInit($call + 8 | 0) | 0) == 0) {
    HEAP32[$call >> 2] = 1;
    HEAP32[$call + 4 >> 2] = 0;
    HEAP32[1311407] = $call;
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  } else {
    _H264SwDecRelease($call);
    var $retval_0 = -4;
    var $retval_0;
    return $retval_0;
  }
}
function _H264SwDecRelease($decInst) {
  if (($decInst | 0) == 0) {
    return;
  }
  _h264bsdShutdown($decInst + 8 | 0);
  _H264SwDecFree($decInst);
  return;
}
function _broadwaySetStreamLength($length) {
  HEAP32[1311792] = $length;
  return;
}
Module["_broadwaySetStreamLength"] = _broadwaySetStreamLength;
function _broadwayExit() {
  return;
}
Module["_broadwayExit"] = _broadwayExit;
function _H264SwDecGetAPIVersion($agg_result) {
  HEAP32[$agg_result >> 2] = 2;
  HEAP32[$agg_result + 4 >> 2] = 3;
  return;
}
function _H264SwDecGetInfo($decInst) {
  var $1$s2;
  if (($decInst | 0) == 0) {
    var $retval_0 = -1;
    var $retval_0;
    return $retval_0;
  }
  var $1$s2 = ($decInst + 24 | 0) >> 2;
  var $2 = HEAP32[$1$s2];
  if (($2 | 0) == 0) {
    var $retval_0 = -6;
    var $retval_0;
    return $retval_0;
  }
  if ((HEAP32[$decInst + 20 >> 2] | 0) == 0) {
    var $retval_0 = -6;
    var $retval_0;
    return $retval_0;
  }
  HEAP32[1311413] = _h264bsdPicWidth($2) << 4;
  HEAP32[1311414] = _h264bsdPicHeight($2) << 4;
  HEAP32[1311415] = _h264bsdVideoRange($2);
  HEAP32[1311416] = _h264bsdMatrixCoefficients($2);
  _h264bsdCroppingParams($decInst + 8 | 0);
  _h264bsdSampleAspectRatio(HEAP32[$1$s2]);
  HEAP32[1311412] = _h264bsdProfile(HEAP32[$1$s2]);
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
function _H264SwDecDecode($decInst) {
  var $decStat$s2;
  var label = 0;
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 4 | 0;
  var $numReadBytes = __stackBase__;
  var $0 = HEAP32[1311408];
  L727 : do {
    if (($0 | 0) == 0) {
      var $retval_0 = -1;
    } else {
      var $1 = HEAP32[1311409];
      if (($1 | 0) == 0) {
        var $retval_0 = -1;
        break;
      }
      if (($decInst | 0) == 0) {
        var $retval_0 = -3;
        break;
      }
      var $decStat$s2 = $decInst >> 2;
      var $2 = HEAP32[$decStat$s2];
      if (($2 | 0) == 0) {
        var $retval_0 = -3;
        break;
      }
      HEAP32[1311406] = 0;
      HEAP32[$numReadBytes >> 2] = 0;
      var $4 = $decInst + 8 | 0;
      HEAP32[$decInst + 3392 >> 2] = HEAP32[1311411];
      var $returnValue_0 = 1;
      var $tmpStream_0 = $0;
      var $strmLen_0 = $1;
      var $7 = 0;
      var $6 = $2;
      while (1) {
        var $6;
        var $7;
        var $strmLen_0;
        var $tmpStream_0;
        var $returnValue_0;
        if (($6 | 0) == 2) {
          label = 549;
          break;
        }
        var $call = _h264bsdDecode($4, $tmpStream_0, $strmLen_0, HEAP32[1311410], $numReadBytes);
        var $9 = HEAP32[$numReadBytes >> 2];
        var $add_ptr = $tmpStream_0 + $9 | 0;
        var $sub = $strmLen_0 - $9 | 0;
        var $sub_ = ($sub | 0) < 0 ? 0 : $sub;
        HEAP32[1311406] = $add_ptr;
        if (($call | 0) == 2) {
          break;
        } else if (($call | 0) == 1) {
          label = 554;
          break;
        } else if (($call | 0) == 4) {
          var $returnValue_2 = (_h264bsdCheckValidParamSets($4) | $sub_ | 0) == 0 ? -2 : $returnValue_0;
        } else if (($call | 0) == 5) {
          var $retval_0 = -4;
          break L727;
        } else {
          var $returnValue_2 = $returnValue_0;
        }
        var $returnValue_2;
        if (($sub_ | 0) == 0) {
          var $retval_0 = $returnValue_2;
          break L727;
        }
        var $returnValue_0 = $returnValue_2;
        var $tmpStream_0 = $add_ptr;
        var $strmLen_0 = $sub_;
        var $7 = $9;
        var $6 = HEAP32[$decStat$s2];
      }
      if (label == 549) {
        HEAP32[$decStat$s2] = 1;
        HEAP32[1311406] = $tmpStream_0 + $7 | 0;
      } else if (label == 554) {
        var $16 = $decInst + 4 | 0;
        HEAP32[$16 >> 2] = HEAP32[$16 >> 2] + 1 | 0;
        var $retval_0 = ($sub_ | 0) == 0 ? 2 : 3;
        break;
      }
      var $10 = $decInst + 1288 | 0;
      if ((HEAP32[$10 >> 2] | 0) == 0) {
        var $retval_0 = 4;
        break;
      }
      if ((HEAP32[$decInst + 1244 >> 2] | 0) == (HEAP32[$decInst + 1248 >> 2] | 0)) {
        var $retval_0 = 4;
        break;
      }
      HEAP32[$10 >> 2] = 0;
      HEAP32[$decStat$s2] = 2;
      var $retval_0 = 3;
    }
  } while (0);
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
_H264SwDecDecode["X"] = 1;
function _H264SwDecNextPicture($decInst) {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 12 | 0;
  var $numErrMbs = __stackBase__;
  var $isIdrPic = __stackBase__ + 4;
  var $picId = __stackBase__ + 8;
  if (($decInst | 0) == 0) {
    var $retval_0 = -1;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  var $call = _h264bsdNextOutputPicture($decInst + 8 | 0, $picId, $isIdrPic, $numErrMbs);
  if (($call | 0) == 0) {
    var $retval_0 = 0;
    var $retval_0;
    STACKTOP = __stackBase__;
    return $retval_0;
  }
  HEAP32[1311402] = $call;
  HEAP32[1311403] = HEAP32[$picId >> 2];
  HEAP32[1311404] = HEAP32[$isIdrPic >> 2];
  HEAP32[1311405] = HEAP32[$numErrMbs >> 2];
  var $retval_0 = 2;
  var $retval_0;
  STACKTOP = __stackBase__;
  return $retval_0;
}
function _streamInit($length) {
  var $call = _malloc($length);
  HEAP32[1311794] = $call;
  HEAP32[1311793] = $call;
  HEAP32[1311792] = $length;
  HEAP32[1311795] = $call + $length | 0;
  return;
}
function _playStream() {
  HEAP32[1311408] = HEAP32[1311793];
  HEAP32[1311409] = HEAP32[1311792];
  while (1) {
    _broadwayDecode();
    if ((HEAP32[1311409] | 0) == 0) {
      break;
    }
  }
  return;
}
function _broadwayCreateStream($length) {
  _streamInit($length);
  return HEAP32[1311793];
}
Module["_broadwayCreateStream"] = _broadwayCreateStream;
function _broadwayPlayStream() {
  _playStream();
  return;
}
Module["_broadwayPlayStream"] = _broadwayPlayStream;
function _broadwayInit() {
  if ((_H264SwDecInit() | 0) == 0) {
    HEAP32[1310956] = 1;
    HEAP32[1310957] = 1;
    return -1;
  } else {
    _puts(5243652);
    return -1;
  }
}
Module["_broadwayInit"] = _broadwayInit;
function _broadwayDecode() {
  HEAP32[1311410] = HEAP32[1310957];
  var $call = _H264SwDecDecode(HEAP32[1311407]);
  if (($call | 0) == 4) {
    if ((_H264SwDecGetInfo(HEAP32[1311407]) | 0) != 0) {
      return;
    }
    _broadwayOnHeadersDecoded();
    var $3 = HEAP32[1311406];
    HEAP32[1311409] = HEAP32[1311408] - $3 + HEAP32[1311409] | 0;
    HEAP32[1311408] = $3;
    return;
  } else if (($call | 0) == 3) {
    var $6 = HEAP32[1311406];
    HEAP32[1311409] = HEAP32[1311408] - $6 + HEAP32[1311409] | 0;
    HEAP32[1311408] = $6;
  } else if (($call | 0) == 2) {
    HEAP32[1311409] = 0;
  } else if (($call | 0) == -2 | ($call | 0) == 1) {
    HEAP32[1311409] = 0;
    return;
  } else {
    return;
  }
  HEAP32[1310957] = HEAP32[1310957] + 1 | 0;
  if ((_H264SwDecNextPicture(HEAP32[1311407]) | 0) != 2) {
    return;
  }
  while (1) {
    HEAP32[1310956] = HEAP32[1310956] + 1 | 0;
    _broadwayOnPictureDecoded(HEAP32[1311402], HEAP32[1311413], HEAP32[1311414]);
    if ((_H264SwDecNextPicture(HEAP32[1311407]) | 0) != 2) {
      break;
    }
  }
  return;
}
_broadwayDecode["X"] = 1;
function _broadwayCreateStreamBuffer($size) {
  var $call = _malloc($size);
  if (($call | 0) != 0) {
    return $call;
  }
  _puts(5243624);
  return $call;
}
Module["_broadwayCreateStreamBuffer"] = _broadwayCreateStreamBuffer;
function _broadwayGetMajorVersion() {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $tmp = __stackBase__;
  _H264SwDecGetAPIVersion($tmp);
  STACKTOP = __stackBase__;
  return HEAP32[$tmp >> 2];
}
Module["_broadwayGetMajorVersion"] = _broadwayGetMajorVersion;
function _broadwayGetMinorVersion() {
  var __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  var $tmp = __stackBase__;
  _H264SwDecGetAPIVersion($tmp);
  STACKTOP = __stackBase__;
  return HEAP32[$tmp + 4 >> 2];
}
Module["_broadwayGetMinorVersion"] = _broadwayGetMinorVersion;
function _H264SwDecMalloc($size) {
  return _malloc($size);
}
function _H264SwDecFree($ptr) {
  _free($ptr);
  return;
}
function _H264SwDecMemcpy($dest, $src, $count) {
  _memcpy($dest, $src, $count);
  return;
}
function _H264SwDecMemset($ptr, $value, $count) {
  _memset($ptr, $value & 255, $count);
  return;
}
function _malloc($bytes) {
  do {
    if ($bytes >>> 0 < 245) {
      if ($bytes >>> 0 < 11) {
        var $cond = 16;
      } else {
        var $cond = $bytes + 11 & -8;
      }
      var $cond;
      var $shr = $cond >>> 3;
      var $0 = HEAP32[1311822];
      var $shr3 = $0 >>> ($shr >>> 0);
      if (($shr3 & 3 | 0) != 0) {
        var $add8 = ($shr3 & 1 ^ 1) + $shr | 0;
        var $shl = $add8 << 1;
        var $1 = ($shl << 2) + 5247328 | 0;
        var $2 = ($shl + 2 << 2) + 5247328 | 0;
        var $3 = HEAP32[$2 >> 2];
        var $fd9 = $3 + 8 | 0;
        var $4 = HEAP32[$fd9 >> 2];
        do {
          if (($1 | 0) == ($4 | 0)) {
            HEAP32[1311822] = $0 & (1 << $add8 ^ -1);
          } else {
            if ($4 >>> 0 < HEAP32[1311826] >>> 0) {
              _abort();
            } else {
              HEAP32[$2 >> 2] = $4;
              HEAP32[$4 + 12 >> 2] = $1;
              break;
            }
          }
        } while (0);
        var $shl20 = $add8 << 3;
        HEAP32[$3 + 4 >> 2] = $shl20 | 3;
        var $8 = $3 + ($shl20 | 4) | 0;
        HEAP32[$8 >> 2] = HEAP32[$8 >> 2] | 1;
        var $mem_0 = $fd9;
        var $mem_0;
        return $mem_0;
      }
      if ($cond >>> 0 <= HEAP32[1311824] >>> 0) {
        var $nb_0 = $cond;
        break;
      }
      if (($shr3 | 0) == 0) {
        if ((HEAP32[1311823] | 0) == 0) {
          var $nb_0 = $cond;
          break;
        }
        var $call = _tmalloc_small($cond);
        if (($call | 0) == 0) {
          var $nb_0 = $cond;
          break;
        } else {
          var $mem_0 = $call;
        }
        var $mem_0;
        return $mem_0;
      }
      var $shl37 = 2 << $shr;
      var $and41 = $shr3 << $shr & ($shl37 | -$shl37);
      var $sub44 = ($and41 & -$and41) - 1 | 0;
      var $and46 = $sub44 >>> 12 & 16;
      var $shr47 = $sub44 >>> ($and46 >>> 0);
      var $and49 = $shr47 >>> 5 & 8;
      var $shr51 = $shr47 >>> ($and49 >>> 0);
      var $and53 = $shr51 >>> 2 & 4;
      var $shr55 = $shr51 >>> ($and53 >>> 0);
      var $and57 = $shr55 >>> 1 & 2;
      var $shr59 = $shr55 >>> ($and57 >>> 0);
      var $and61 = $shr59 >>> 1 & 1;
      var $add64 = ($and49 | $and46 | $and53 | $and57 | $and61) + ($shr59 >>> ($and61 >>> 0)) | 0;
      var $shl65 = $add64 << 1;
      var $12 = ($shl65 << 2) + 5247328 | 0;
      var $13 = ($shl65 + 2 << 2) + 5247328 | 0;
      var $14 = HEAP32[$13 >> 2];
      var $fd69 = $14 + 8 | 0;
      var $15 = HEAP32[$fd69 >> 2];
      do {
        if (($12 | 0) == ($15 | 0)) {
          HEAP32[1311822] = $0 & (1 << $add64 ^ -1);
        } else {
          if ($15 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          } else {
            HEAP32[$13 >> 2] = $15;
            HEAP32[$15 + 12 >> 2] = $12;
            break;
          }
        }
      } while (0);
      var $shl87 = $add64 << 3;
      var $sub88 = $shl87 - $cond | 0;
      HEAP32[$14 + 4 >> 2] = $cond | 3;
      var $18 = $14;
      var $19 = $18 + $cond | 0;
      HEAP32[$18 + ($cond | 4) >> 2] = $sub88 | 1;
      HEAP32[$18 + $shl87 >> 2] = $sub88;
      var $21 = HEAP32[1311824];
      if (($21 | 0) != 0) {
        var $22 = HEAP32[1311827];
        var $shr99 = $21 >>> 3;
        var $shl100 = $shr99 << 1;
        var $23 = ($shl100 << 2) + 5247328 | 0;
        var $24 = HEAP32[1311822];
        var $shl103 = 1 << $shr99;
        do {
          if (($24 & $shl103 | 0) == 0) {
            HEAP32[1311822] = $24 | $shl103;
            var $F102_0 = $23;
            var $_pre_phi = ($shl100 + 2 << 2) + 5247328 | 0;
          } else {
            var $25 = ($shl100 + 2 << 2) + 5247328 | 0;
            var $26 = HEAP32[$25 >> 2];
            if ($26 >>> 0 >= HEAP32[1311826] >>> 0) {
              var $F102_0 = $26;
              var $_pre_phi = $25;
              break;
            }
            _abort();
          }
        } while (0);
        var $_pre_phi;
        var $F102_0;
        HEAP32[$_pre_phi >> 2] = $22;
        HEAP32[$F102_0 + 12 >> 2] = $22;
        HEAP32[$22 + 8 >> 2] = $F102_0;
        HEAP32[$22 + 12 >> 2] = $23;
      }
      HEAP32[1311824] = $sub88;
      HEAP32[1311827] = $19;
      var $mem_0 = $fd69;
      var $mem_0;
      return $mem_0;
    } else {
      if ($bytes >>> 0 > 4294967231) {
        var $nb_0 = -1;
        break;
      }
      var $and143 = $bytes + 11 & -8;
      if ((HEAP32[1311823] | 0) == 0) {
        var $nb_0 = $and143;
        break;
      }
      var $call147 = _tmalloc_large($and143);
      if (($call147 | 0) == 0) {
        var $nb_0 = $and143;
        break;
      } else {
        var $mem_0 = $call147;
      }
      var $mem_0;
      return $mem_0;
    }
  } while (0);
  var $nb_0;
  var $32 = HEAP32[1311824];
  if ($nb_0 >>> 0 > $32 >>> 0) {
    var $41 = HEAP32[1311825];
    if ($nb_0 >>> 0 < $41 >>> 0) {
      var $sub186 = $41 - $nb_0 | 0;
      HEAP32[1311825] = $sub186;
      var $42 = HEAP32[1311828];
      var $43 = $42;
      HEAP32[1311828] = $43 + $nb_0 | 0;
      HEAP32[$nb_0 + ($43 + 4) >> 2] = $sub186 | 1;
      HEAP32[$42 + 4 >> 2] = $nb_0 | 3;
      var $mem_0 = $42 + 8 | 0;
      var $mem_0;
      return $mem_0;
    } else {
      var $mem_0 = _sys_alloc($nb_0);
      var $mem_0;
      return $mem_0;
    }
  } else {
    var $sub158 = $32 - $nb_0 | 0;
    var $33 = HEAP32[1311827];
    if ($sub158 >>> 0 > 15) {
      var $34 = $33;
      HEAP32[1311827] = $34 + $nb_0 | 0;
      HEAP32[1311824] = $sub158;
      HEAP32[$nb_0 + ($34 + 4) >> 2] = $sub158 | 1;
      HEAP32[$34 + $32 >> 2] = $sub158;
      HEAP32[$33 + 4 >> 2] = $nb_0 | 3;
    } else {
      HEAP32[1311824] = 0;
      HEAP32[1311827] = 0;
      HEAP32[$33 + 4 >> 2] = $32 | 3;
      var $38 = $32 + ($33 + 4) | 0;
      HEAP32[$38 >> 2] = HEAP32[$38 >> 2] | 1;
    }
    var $mem_0 = $33 + 8 | 0;
    var $mem_0;
    return $mem_0;
  }
}
_malloc["X"] = 1;
function _tmalloc_small($nb) {
  var $R_1$s2;
  var $v_0$s2;
  var $0 = HEAP32[1311823];
  var $sub2 = ($0 & -$0) - 1 | 0;
  var $and3 = $sub2 >>> 12 & 16;
  var $shr4 = $sub2 >>> ($and3 >>> 0);
  var $and6 = $shr4 >>> 5 & 8;
  var $shr7 = $shr4 >>> ($and6 >>> 0);
  var $and9 = $shr7 >>> 2 & 4;
  var $shr11 = $shr7 >>> ($and9 >>> 0);
  var $and13 = $shr11 >>> 1 & 2;
  var $shr15 = $shr11 >>> ($and13 >>> 0);
  var $and17 = $shr15 >>> 1 & 1;
  var $1 = HEAP32[(($and6 | $and3 | $and9 | $and13 | $and17) + ($shr15 >>> ($and17 >>> 0)) << 2) + 5247592 >> 2];
  var $t_0 = $1;
  var $v_0 = $1, $v_0$s2 = $v_0 >> 2;
  var $rsize_0 = (HEAP32[$1 + 4 >> 2] & -8) - $nb | 0;
  while (1) {
    var $rsize_0;
    var $v_0;
    var $t_0;
    var $3 = HEAP32[$t_0 + 16 >> 2];
    if (($3 | 0) == 0) {
      var $4 = HEAP32[$t_0 + 20 >> 2];
      if (($4 | 0) == 0) {
        break;
      } else {
        var $cond5 = $4;
      }
    } else {
      var $cond5 = $3;
    }
    var $cond5;
    var $sub31 = (HEAP32[$cond5 + 4 >> 2] & -8) - $nb | 0;
    var $cmp32 = $sub31 >>> 0 < $rsize_0 >>> 0;
    var $t_0 = $cond5;
    var $v_0 = $cmp32 ? $cond5 : $v_0, $v_0$s2 = $v_0 >> 2;
    var $rsize_0 = $cmp32 ? $sub31 : $rsize_0;
  }
  var $6 = $v_0;
  var $7 = HEAP32[1311826];
  if ($6 >>> 0 < $7 >>> 0) {
    _abort();
  }
  var $add_ptr = $6 + $nb | 0;
  var $8 = $add_ptr;
  if ($6 >>> 0 >= $add_ptr >>> 0) {
    _abort();
  }
  var $9 = HEAP32[$v_0$s2 + 6];
  var $10 = HEAP32[$v_0$s2 + 3];
  L866 : do {
    if (($10 | 0) == ($v_0 | 0)) {
      var $arrayidx55 = $v_0 + 20 | 0;
      var $13 = HEAP32[$arrayidx55 >> 2];
      do {
        if (($13 | 0) == 0) {
          var $arrayidx59 = $v_0 + 16 | 0;
          var $14 = HEAP32[$arrayidx59 >> 2];
          if (($14 | 0) == 0) {
            var $R_1 = 0, $R_1$s2 = $R_1 >> 2;
            break L866;
          } else {
            var $R_0 = $14;
            var $RP_0 = $arrayidx59;
            break;
          }
        } else {
          var $R_0 = $13;
          var $RP_0 = $arrayidx55;
        }
      } while (0);
      while (1) {
        var $RP_0;
        var $R_0;
        var $arrayidx65 = $R_0 + 20 | 0;
        var $15 = HEAP32[$arrayidx65 >> 2];
        if (($15 | 0) != 0) {
          var $R_0 = $15;
          var $RP_0 = $arrayidx65;
          continue;
        }
        var $arrayidx69 = $R_0 + 16 | 0;
        var $16 = HEAP32[$arrayidx69 >> 2];
        if (($16 | 0) == 0) {
          break;
        } else {
          var $R_0 = $16;
          var $RP_0 = $arrayidx69;
        }
      }
      if ($RP_0 >>> 0 < $7 >>> 0) {
        _abort();
      } else {
        HEAP32[$RP_0 >> 2] = 0;
        var $R_1 = $R_0, $R_1$s2 = $R_1 >> 2;
        break;
      }
    } else {
      var $11 = HEAP32[$v_0$s2 + 2];
      if ($11 >>> 0 < $7 >>> 0) {
        _abort();
      } else {
        HEAP32[$11 + 12 >> 2] = $10;
        HEAP32[$10 + 8 >> 2] = $11;
        var $R_1 = $10, $R_1$s2 = $R_1 >> 2;
        break;
      }
    }
  } while (0);
  var $R_1;
  L882 : do {
    if (($9 | 0) != 0) {
      var $index = $v_0 + 28 | 0;
      var $arrayidx88 = (HEAP32[$index >> 2] << 2) + 5247592 | 0;
      do {
        if (($v_0 | 0) == (HEAP32[$arrayidx88 >> 2] | 0)) {
          HEAP32[$arrayidx88 >> 2] = $R_1;
          if (($R_1 | 0) != 0) {
            break;
          }
          HEAP32[1311823] = HEAP32[1311823] & (1 << HEAP32[$index >> 2] ^ -1);
          break L882;
        } else {
          if ($9 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          }
          var $arrayidx107 = $9 + 16 | 0;
          if ((HEAP32[$arrayidx107 >> 2] | 0) == ($v_0 | 0)) {
            HEAP32[$arrayidx107 >> 2] = $R_1;
          } else {
            HEAP32[$9 + 20 >> 2] = $R_1;
          }
          if (($R_1 | 0) == 0) {
            break L882;
          }
        }
      } while (0);
      if ($R_1 >>> 0 < HEAP32[1311826] >>> 0) {
        _abort();
      }
      HEAP32[$R_1$s2 + 6] = $9;
      var $27 = HEAP32[$v_0$s2 + 4];
      do {
        if (($27 | 0) != 0) {
          if ($27 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          } else {
            HEAP32[$R_1$s2 + 4] = $27;
            HEAP32[$27 + 24 >> 2] = $R_1;
            break;
          }
        }
      } while (0);
      var $30 = HEAP32[$v_0$s2 + 5];
      if (($30 | 0) == 0) {
        break;
      }
      if ($30 >>> 0 < HEAP32[1311826] >>> 0) {
        _abort();
      } else {
        HEAP32[$R_1$s2 + 5] = $30;
        HEAP32[$30 + 24 >> 2] = $R_1;
        break;
      }
    }
  } while (0);
  if ($rsize_0 >>> 0 < 16) {
    var $add171 = $rsize_0 + $nb | 0;
    HEAP32[$v_0$s2 + 1] = $add171 | 3;
    var $33 = $add171 + ($6 + 4) | 0;
    HEAP32[$33 >> 2] = HEAP32[$33 >> 2] | 1;
    var $add_ptr219 = $v_0 + 8 | 0;
    var $44 = $add_ptr219;
    return $44;
  }
  HEAP32[$v_0$s2 + 1] = $nb | 3;
  HEAP32[$nb + ($6 + 4) >> 2] = $rsize_0 | 1;
  HEAP32[$6 + $rsize_0 + $nb >> 2] = $rsize_0;
  var $36 = HEAP32[1311824];
  if (($36 | 0) != 0) {
    var $37 = HEAP32[1311827];
    var $shr188 = $36 >>> 3;
    var $shl189 = $shr188 << 1;
    var $38 = ($shl189 << 2) + 5247328 | 0;
    var $39 = HEAP32[1311822];
    var $shl192 = 1 << $shr188;
    do {
      if (($39 & $shl192 | 0) == 0) {
        HEAP32[1311822] = $39 | $shl192;
        var $F191_0 = $38;
        var $_pre_phi = ($shl189 + 2 << 2) + 5247328 | 0;
      } else {
        var $40 = ($shl189 + 2 << 2) + 5247328 | 0;
        var $41 = HEAP32[$40 >> 2];
        if ($41 >>> 0 >= HEAP32[1311826] >>> 0) {
          var $F191_0 = $41;
          var $_pre_phi = $40;
          break;
        }
        _abort();
      }
    } while (0);
    var $_pre_phi;
    var $F191_0;
    HEAP32[$_pre_phi >> 2] = $37;
    HEAP32[$F191_0 + 12 >> 2] = $37;
    HEAP32[$37 + 8 >> 2] = $F191_0;
    HEAP32[$37 + 12 >> 2] = $38;
  }
  HEAP32[1311824] = $rsize_0;
  HEAP32[1311827] = $8;
  var $add_ptr219 = $v_0 + 8 | 0;
  var $44 = $add_ptr219;
  return $44;
}
_tmalloc_small["X"] = 1;
function _tmalloc_large($nb) {
  var $R_1$s2;
  var $10$s2;
  var $t_221$s2;
  var $v_3_lcssa$s2;
  var $t_0$s2;
  var $nb$s2 = $nb >> 2;
  var label = 0;
  var $sub = -$nb | 0;
  var $shr = $nb >>> 8;
  do {
    if (($shr | 0) == 0) {
      var $idx_0 = 0;
    } else {
      if ($nb >>> 0 > 16777215) {
        var $idx_0 = 31;
        break;
      }
      var $and = ($shr + 1048320 | 0) >>> 16 & 8;
      var $shl = $shr << $and;
      var $and8 = ($shl + 520192 | 0) >>> 16 & 4;
      var $shl9 = $shl << $and8;
      var $and12 = ($shl9 + 245760 | 0) >>> 16 & 2;
      var $add17 = 14 - ($and8 | $and | $and12) + ($shl9 << $and12 >>> 15) | 0;
      var $idx_0 = $nb >>> (($add17 + 7 | 0) >>> 0) & 1 | $add17 << 1;
    }
  } while (0);
  var $idx_0;
  var $0 = HEAP32[($idx_0 << 2) + 5247592 >> 2];
  L928 : do {
    if (($0 | 0) == 0) {
      var $v_2 = 0;
      var $rsize_2 = $sub;
      var $t_1 = 0;
    } else {
      if (($idx_0 | 0) == 31) {
        var $cond = 0;
      } else {
        var $cond = 25 - ($idx_0 >>> 1) | 0;
      }
      var $cond;
      var $v_0 = 0;
      var $rsize_0 = $sub;
      var $t_0 = $0, $t_0$s2 = $t_0 >> 2;
      var $sizebits_0 = $nb << $cond;
      var $rst_0 = 0;
      while (1) {
        var $rst_0;
        var $sizebits_0;
        var $t_0;
        var $rsize_0;
        var $v_0;
        var $and32 = HEAP32[$t_0$s2 + 1] & -8;
        var $sub33 = $and32 - $nb | 0;
        if ($sub33 >>> 0 < $rsize_0 >>> 0) {
          if (($and32 | 0) == ($nb | 0)) {
            var $v_2 = $t_0;
            var $rsize_2 = $sub33;
            var $t_1 = $t_0;
            break L928;
          } else {
            var $v_1 = $t_0;
            var $rsize_1 = $sub33;
          }
        } else {
          var $v_1 = $v_0;
          var $rsize_1 = $rsize_0;
        }
        var $rsize_1;
        var $v_1;
        var $2 = HEAP32[$t_0$s2 + 5];
        var $3 = HEAP32[(($sizebits_0 >>> 31 << 2) + 16 >> 2) + $t_0$s2];
        var $rst_1 = ($2 | 0) == 0 | ($2 | 0) == ($3 | 0) ? $rst_0 : $2;
        if (($3 | 0) == 0) {
          var $v_2 = $v_1;
          var $rsize_2 = $rsize_1;
          var $t_1 = $rst_1;
          break L928;
        } else {
          var $v_0 = $v_1;
          var $rsize_0 = $rsize_1;
          var $t_0 = $3, $t_0$s2 = $t_0 >> 2;
          var $sizebits_0 = $sizebits_0 << 1;
          var $rst_0 = $rst_1;
        }
      }
    }
  } while (0);
  var $t_1;
  var $rsize_2;
  var $v_2;
  do {
    if (($t_1 | 0) == 0 & ($v_2 | 0) == 0) {
      var $shl59 = 2 << $idx_0;
      var $and63 = HEAP32[1311823] & ($shl59 | -$shl59);
      if (($and63 | 0) == 0) {
        var $retval_0 = 0;
        var $retval_0;
        return $retval_0;
      } else {
        var $sub69 = ($and63 & -$and63) - 1 | 0;
        var $and72 = $sub69 >>> 12 & 16;
        var $shr74 = $sub69 >>> ($and72 >>> 0);
        var $and76 = $shr74 >>> 5 & 8;
        var $shr78 = $shr74 >>> ($and76 >>> 0);
        var $and80 = $shr78 >>> 2 & 4;
        var $shr82 = $shr78 >>> ($and80 >>> 0);
        var $and84 = $shr82 >>> 1 & 2;
        var $shr86 = $shr82 >>> ($and84 >>> 0);
        var $and88 = $shr86 >>> 1 & 1;
        var $t_2_ph = HEAP32[(($and76 | $and72 | $and80 | $and84 | $and88) + ($shr86 >>> ($and88 >>> 0)) << 2) + 5247592 >> 2];
        break;
      }
    } else {
      var $t_2_ph = $t_1;
    }
  } while (0);
  var $t_2_ph;
  L945 : do {
    if (($t_2_ph | 0) == 0) {
      var $rsize_3_lcssa = $rsize_2;
      var $v_3_lcssa = $v_2, $v_3_lcssa$s2 = $v_3_lcssa >> 2;
    } else {
      var $t_221 = $t_2_ph, $t_221$s2 = $t_221 >> 2;
      var $rsize_322 = $rsize_2;
      var $v_323 = $v_2;
      while (1) {
        var $v_323;
        var $rsize_322;
        var $t_221;
        var $sub100 = (HEAP32[$t_221$s2 + 1] & -8) - $nb | 0;
        var $cmp101 = $sub100 >>> 0 < $rsize_322 >>> 0;
        var $sub100_rsize_3 = $cmp101 ? $sub100 : $rsize_322;
        var $t_2_v_3 = $cmp101 ? $t_221 : $v_323;
        var $7 = HEAP32[$t_221$s2 + 4];
        if (($7 | 0) != 0) {
          var $t_221 = $7, $t_221$s2 = $t_221 >> 2;
          var $rsize_322 = $sub100_rsize_3;
          var $v_323 = $t_2_v_3;
          continue;
        }
        var $8 = HEAP32[$t_221$s2 + 5];
        if (($8 | 0) == 0) {
          var $rsize_3_lcssa = $sub100_rsize_3;
          var $v_3_lcssa = $t_2_v_3, $v_3_lcssa$s2 = $v_3_lcssa >> 2;
          break L945;
        } else {
          var $t_221 = $8, $t_221$s2 = $t_221 >> 2;
          var $rsize_322 = $sub100_rsize_3;
          var $v_323 = $t_2_v_3;
        }
      }
    }
  } while (0);
  var $v_3_lcssa;
  var $rsize_3_lcssa;
  if (($v_3_lcssa | 0) == 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  if ($rsize_3_lcssa >>> 0 >= (HEAP32[1311824] - $nb | 0) >>> 0) {
    var $retval_0 = 0;
    var $retval_0;
    return $retval_0;
  }
  var $10 = $v_3_lcssa, $10$s2 = $10 >> 2;
  var $11 = HEAP32[1311826];
  if ($10 >>> 0 < $11 >>> 0) {
    _abort();
  }
  var $add_ptr = $10 + $nb | 0;
  var $12 = $add_ptr;
  if ($10 >>> 0 >= $add_ptr >>> 0) {
    _abort();
  }
  var $13 = HEAP32[$v_3_lcssa$s2 + 6];
  var $14 = HEAP32[$v_3_lcssa$s2 + 3];
  L962 : do {
    if (($14 | 0) == ($v_3_lcssa | 0)) {
      var $arrayidx143 = $v_3_lcssa + 20 | 0;
      var $17 = HEAP32[$arrayidx143 >> 2];
      do {
        if (($17 | 0) == 0) {
          var $arrayidx147 = $v_3_lcssa + 16 | 0;
          var $18 = HEAP32[$arrayidx147 >> 2];
          if (($18 | 0) == 0) {
            var $R_1 = 0, $R_1$s2 = $R_1 >> 2;
            break L962;
          } else {
            var $R_0 = $18;
            var $RP_0 = $arrayidx147;
            break;
          }
        } else {
          var $R_0 = $17;
          var $RP_0 = $arrayidx143;
        }
      } while (0);
      while (1) {
        var $RP_0;
        var $R_0;
        var $arrayidx153 = $R_0 + 20 | 0;
        var $19 = HEAP32[$arrayidx153 >> 2];
        if (($19 | 0) != 0) {
          var $R_0 = $19;
          var $RP_0 = $arrayidx153;
          continue;
        }
        var $arrayidx157 = $R_0 + 16 | 0;
        var $20 = HEAP32[$arrayidx157 >> 2];
        if (($20 | 0) == 0) {
          break;
        } else {
          var $R_0 = $20;
          var $RP_0 = $arrayidx157;
        }
      }
      if ($RP_0 >>> 0 < $11 >>> 0) {
        _abort();
      } else {
        HEAP32[$RP_0 >> 2] = 0;
        var $R_1 = $R_0, $R_1$s2 = $R_1 >> 2;
        break;
      }
    } else {
      var $15 = HEAP32[$v_3_lcssa$s2 + 2];
      if ($15 >>> 0 < $11 >>> 0) {
        _abort();
      } else {
        HEAP32[$15 + 12 >> 2] = $14;
        HEAP32[$14 + 8 >> 2] = $15;
        var $R_1 = $14, $R_1$s2 = $R_1 >> 2;
        break;
      }
    }
  } while (0);
  var $R_1;
  L978 : do {
    if (($13 | 0) == 0) {
      var $v_3_lcssa2 = $v_3_lcssa;
    } else {
      var $index = $v_3_lcssa + 28 | 0;
      var $arrayidx176 = (HEAP32[$index >> 2] << 2) + 5247592 | 0;
      do {
        if (($v_3_lcssa | 0) == (HEAP32[$arrayidx176 >> 2] | 0)) {
          HEAP32[$arrayidx176 >> 2] = $R_1;
          if (($R_1 | 0) != 0) {
            break;
          }
          HEAP32[1311823] = HEAP32[1311823] & (1 << HEAP32[$index >> 2] ^ -1);
          var $v_3_lcssa2 = $v_3_lcssa;
          break L978;
        } else {
          if ($13 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          }
          var $arrayidx196 = $13 + 16 | 0;
          if ((HEAP32[$arrayidx196 >> 2] | 0) == ($v_3_lcssa | 0)) {
            HEAP32[$arrayidx196 >> 2] = $R_1;
          } else {
            HEAP32[$13 + 20 >> 2] = $R_1;
          }
          if (($R_1 | 0) == 0) {
            var $v_3_lcssa2 = $v_3_lcssa;
            break L978;
          }
        }
      } while (0);
      if ($R_1 >>> 0 < HEAP32[1311826] >>> 0) {
        _abort();
      }
      HEAP32[$R_1$s2 + 6] = $13;
      var $31 = HEAP32[$v_3_lcssa$s2 + 4];
      do {
        if (($31 | 0) != 0) {
          if ($31 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          } else {
            HEAP32[$R_1$s2 + 4] = $31;
            HEAP32[$31 + 24 >> 2] = $R_1;
            break;
          }
        }
      } while (0);
      var $34 = HEAP32[$v_3_lcssa$s2 + 5];
      if (($34 | 0) == 0) {
        var $v_3_lcssa2 = $v_3_lcssa;
        break;
      }
      if ($34 >>> 0 < HEAP32[1311826] >>> 0) {
        _abort();
      } else {
        HEAP32[$R_1$s2 + 5] = $34;
        HEAP32[$34 + 24 >> 2] = $R_1;
        var $v_3_lcssa2 = $v_3_lcssa;
        break;
      }
    }
  } while (0);
  var $v_3_lcssa2;
  do {
    if ($rsize_3_lcssa >>> 0 < 16) {
      var $add260 = $rsize_3_lcssa + $nb | 0;
      HEAP32[$v_3_lcssa2 + 4 >> 2] = $add260 | 3;
      var $37 = $add260 + ($10 + 4) | 0;
      HEAP32[$37 >> 2] = HEAP32[$37 >> 2] | 1;
    } else {
      HEAP32[$v_3_lcssa2 + 4 >> 2] = $nb | 3;
      HEAP32[$nb$s2 + ($10$s2 + 1)] = $rsize_3_lcssa | 1;
      HEAP32[($rsize_3_lcssa >> 2) + $10$s2 + $nb$s2] = $rsize_3_lcssa;
      var $shr275 = $rsize_3_lcssa >>> 3;
      if ($rsize_3_lcssa >>> 0 < 256) {
        var $shl280 = $shr275 << 1;
        var $40 = ($shl280 << 2) + 5247328 | 0;
        var $41 = HEAP32[1311822];
        var $shl283 = 1 << $shr275;
        do {
          if (($41 & $shl283 | 0) == 0) {
            HEAP32[1311822] = $41 | $shl283;
            var $F282_0 = $40;
            var $_pre_phi = ($shl280 + 2 << 2) + 5247328 | 0;
          } else {
            var $42 = ($shl280 + 2 << 2) + 5247328 | 0;
            var $43 = HEAP32[$42 >> 2];
            if ($43 >>> 0 >= HEAP32[1311826] >>> 0) {
              var $F282_0 = $43;
              var $_pre_phi = $42;
              break;
            }
            _abort();
          }
        } while (0);
        var $_pre_phi;
        var $F282_0;
        HEAP32[$_pre_phi >> 2] = $12;
        HEAP32[$F282_0 + 12 >> 2] = $12;
        HEAP32[$nb$s2 + ($10$s2 + 2)] = $F282_0;
        HEAP32[$nb$s2 + ($10$s2 + 3)] = $40;
        break;
      }
      var $48 = $add_ptr;
      var $shr310 = $rsize_3_lcssa >>> 8;
      do {
        if (($shr310 | 0) == 0) {
          var $I308_0 = 0;
        } else {
          if ($rsize_3_lcssa >>> 0 > 16777215) {
            var $I308_0 = 31;
            break;
          }
          var $and323 = ($shr310 + 1048320 | 0) >>> 16 & 8;
          var $shl325 = $shr310 << $and323;
          var $and328 = ($shl325 + 520192 | 0) >>> 16 & 4;
          var $shl330 = $shl325 << $and328;
          var $and333 = ($shl330 + 245760 | 0) >>> 16 & 2;
          var $add338 = 14 - ($and328 | $and323 | $and333) + ($shl330 << $and333 >>> 15) | 0;
          var $I308_0 = $rsize_3_lcssa >>> (($add338 + 7 | 0) >>> 0) & 1 | $add338 << 1;
        }
      } while (0);
      var $I308_0;
      var $arrayidx347 = ($I308_0 << 2) + 5247592 | 0;
      HEAP32[$nb$s2 + ($10$s2 + 7)] = $I308_0;
      HEAP32[$nb$s2 + ($10$s2 + 5)] = 0;
      HEAP32[$nb$s2 + ($10$s2 + 4)] = 0;
      var $51 = HEAP32[1311823];
      var $shl354 = 1 << $I308_0;
      if (($51 & $shl354 | 0) == 0) {
        HEAP32[1311823] = $51 | $shl354;
        HEAP32[$arrayidx347 >> 2] = $48;
        HEAP32[$nb$s2 + ($10$s2 + 6)] = $arrayidx347;
        HEAP32[$nb$s2 + ($10$s2 + 3)] = $48;
        HEAP32[$nb$s2 + ($10$s2 + 2)] = $48;
        break;
      }
      if (($I308_0 | 0) == 31) {
        var $cond375 = 0;
      } else {
        var $cond375 = 25 - ($I308_0 >>> 1) | 0;
      }
      var $cond375;
      var $K365_0 = $rsize_3_lcssa << $cond375;
      var $T_0 = HEAP32[$arrayidx347 >> 2];
      while (1) {
        var $T_0;
        var $K365_0;
        if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($rsize_3_lcssa | 0)) {
          break;
        }
        var $arrayidx386 = ($K365_0 >>> 31 << 2) + $T_0 + 16 | 0;
        var $58 = HEAP32[$arrayidx386 >> 2];
        if (($58 | 0) == 0) {
          label = 770;
          break;
        } else {
          var $K365_0 = $K365_0 << 1;
          var $T_0 = $58;
        }
      }
      if (label == 770) {
        if ($arrayidx386 >>> 0 < HEAP32[1311826] >>> 0) {
          _abort();
        } else {
          HEAP32[$arrayidx386 >> 2] = $48;
          HEAP32[$nb$s2 + ($10$s2 + 6)] = $T_0;
          HEAP32[$nb$s2 + ($10$s2 + 3)] = $48;
          HEAP32[$nb$s2 + ($10$s2 + 2)] = $48;
          break;
        }
      }
      var $fd405 = $T_0 + 8 | 0;
      var $64 = HEAP32[$fd405 >> 2];
      var $66 = HEAP32[1311826];
      if ($T_0 >>> 0 < $66 >>> 0) {
        _abort();
      }
      if ($64 >>> 0 < $66 >>> 0) {
        _abort();
      } else {
        HEAP32[$64 + 12 >> 2] = $48;
        HEAP32[$fd405 >> 2] = $48;
        HEAP32[$nb$s2 + ($10$s2 + 2)] = $64;
        HEAP32[$nb$s2 + ($10$s2 + 3)] = $T_0;
        HEAP32[$nb$s2 + ($10$s2 + 6)] = 0;
        break;
      }
    }
  } while (0);
  var $retval_0 = $v_3_lcssa2 + 8 | 0;
  var $retval_0;
  return $retval_0;
}
_tmalloc_large["X"] = 1;
function _sys_alloc($nb) {
  var $sp_039$s2;
  var label = 0;
  if ((HEAP32[1310958] | 0) == 0) {
    _init_mparams();
  }
  L1048 : do {
    if ((HEAP32[1311932] & 4 | 0) == 0) {
      var $2 = HEAP32[1311828];
      do {
        if (($2 | 0) == 0) {
          label = 793;
        } else {
          var $call15 = _segment_holding($2);
          if (($call15 | 0) == 0) {
            label = 793;
            break;
          }
          var $8 = HEAP32[1310960];
          var $and50 = $nb + 47 - HEAP32[1311825] + $8 & -$8;
          if ($and50 >>> 0 >= 2147483647) {
            var $tsize_091517_ph = 0;
            break;
          }
          var $call53 = _sbrk($and50);
          var $cmp55 = ($call53 | 0) == (HEAP32[$call15 >> 2] + HEAP32[$call15 + 4 >> 2] | 0);
          var $tbase_0 = $cmp55 ? $call53 : -1;
          var $tsize_0 = $cmp55 ? $and50 : 0;
          var $br_0 = $call53;
          var $asize_1 = $and50;
          label = 800;
          break;
        }
      } while (0);
      do {
        if (label == 793) {
          var $call18 = _sbrk(0);
          if (($call18 | 0) == -1) {
            var $tsize_091517_ph = 0;
            break;
          }
          var $4 = HEAP32[1310960];
          var $and23 = $4 + ($nb + 47) & -$4;
          var $5 = $call18;
          var $6 = HEAP32[1310959];
          var $sub24 = $6 - 1 | 0;
          if (($sub24 & $5 | 0) == 0) {
            var $asize_0 = $and23;
          } else {
            var $asize_0 = $and23 - $5 + ($sub24 + $5 & -$6) | 0;
          }
          var $asize_0;
          if ($asize_0 >>> 0 >= 2147483647) {
            var $tsize_091517_ph = 0;
            break;
          }
          var $call38 = _sbrk($asize_0);
          var $cmp39 = ($call38 | 0) == ($call18 | 0);
          var $tbase_0 = $cmp39 ? $call18 : -1;
          var $tsize_0 = $cmp39 ? $asize_0 : 0;
          var $br_0 = $call38;
          var $asize_1 = $asize_0;
          label = 800;
          break;
        }
      } while (0);
      L1061 : do {
        if (label == 800) {
          var $asize_1;
          var $br_0;
          var $tsize_0;
          var $tbase_0;
          var $sub82 = -$asize_1 | 0;
          if (($tbase_0 | 0) != -1) {
            var $tsize_227 = $tsize_0;
            var $tbase_228 = $tbase_0;
            label = 813;
            break L1048;
          }
          do {
            if (($br_0 | 0) != -1 & $asize_1 >>> 0 < 2147483647) {
              if ($asize_1 >>> 0 >= ($nb + 48 | 0) >>> 0) {
                var $asize_2 = $asize_1;
                break;
              }
              var $11 = HEAP32[1310960];
              var $and74 = $nb + 47 - $asize_1 + $11 & -$11;
              if ($and74 >>> 0 >= 2147483647) {
                var $asize_2 = $asize_1;
                break;
              }
              if ((_sbrk($and74) | 0) == -1) {
                _sbrk($sub82);
                var $tsize_091517_ph = $tsize_0;
                break L1061;
              } else {
                var $asize_2 = $and74 + $asize_1 | 0;
                break;
              }
            } else {
              var $asize_2 = $asize_1;
            }
          } while (0);
          var $asize_2;
          if (($br_0 | 0) != -1) {
            var $tsize_227 = $asize_2;
            var $tbase_228 = $br_0;
            label = 813;
            break L1048;
          }
          HEAP32[1311932] = HEAP32[1311932] | 4;
          var $tsize_122 = $tsize_0;
          label = 810;
          break L1048;
        }
      } while (0);
      var $tsize_091517_ph;
      HEAP32[1311932] = HEAP32[1311932] | 4;
      var $tsize_122 = $tsize_091517_ph;
      label = 810;
      break;
    } else {
      var $tsize_122 = 0;
      label = 810;
    }
  } while (0);
  do {
    if (label == 810) {
      var $tsize_122;
      var $14 = HEAP32[1310960];
      var $and103 = $14 + ($nb + 47) & -$14;
      if ($and103 >>> 0 >= 2147483647) {
        break;
      }
      var $call108 = _sbrk($and103);
      var $call109 = _sbrk(0);
      if (!(($call109 | 0) != -1 & ($call108 | 0) != -1 & $call108 >>> 0 < $call109 >>> 0)) {
        break;
      }
      var $sub_ptr_sub = $call109 - $call108 | 0;
      var $cmp117 = $sub_ptr_sub >>> 0 > ($nb + 40 | 0) >>> 0;
      var $call108_tbase_1 = $cmp117 ? $call108 : -1;
      if (($call108_tbase_1 | 0) == -1) {
        break;
      } else {
        var $tsize_227 = $cmp117 ? $sub_ptr_sub : $tsize_122;
        var $tbase_228 = $call108_tbase_1;
        label = 813;
        break;
      }
    }
  } while (0);
  do {
    if (label == 813) {
      var $tbase_228;
      var $tsize_227;
      var $add125 = HEAP32[1311930] + $tsize_227 | 0;
      HEAP32[1311930] = $add125;
      if ($add125 >>> 0 > HEAP32[1311931] >>> 0) {
        HEAP32[1311931] = $add125;
      }
      var $17 = HEAP32[1311828];
      L1083 : do {
        if (($17 | 0) == 0) {
          var $18 = HEAP32[1311826];
          if (($18 | 0) == 0 | $tbase_228 >>> 0 < $18 >>> 0) {
            HEAP32[1311826] = $tbase_228;
          }
          HEAP32[1311933] = $tbase_228;
          HEAP32[1311934] = $tsize_227;
          HEAP32[1311936] = 0;
          HEAP32[1311831] = HEAP32[1310958];
          HEAP32[1311830] = -1;
          _init_bins();
          _init_top($tbase_228, $tsize_227 - 40 | 0);
        } else {
          var $sp_039 = 5247732, $sp_039$s2 = $sp_039 >> 2;
          while (1) {
            var $sp_039;
            var $21 = HEAP32[$sp_039$s2];
            var $size162 = $sp_039 + 4 | 0;
            var $22 = HEAP32[$size162 >> 2];
            if (($tbase_228 | 0) == ($21 + $22 | 0)) {
              label = 821;
              break;
            }
            var $23 = HEAP32[$sp_039$s2 + 2];
            if (($23 | 0) == 0) {
              break;
            } else {
              var $sp_039 = $23, $sp_039$s2 = $sp_039 >> 2;
            }
          }
          do {
            if (label == 821) {
              if ((HEAP32[$sp_039$s2 + 3] & 8 | 0) != 0) {
                break;
              }
              var $25 = $17;
              if (!($25 >>> 0 >= $21 >>> 0 & $25 >>> 0 < $tbase_228 >>> 0)) {
                break;
              }
              HEAP32[$size162 >> 2] = $22 + $tsize_227 | 0;
              _init_top(HEAP32[1311828], HEAP32[1311825] + $tsize_227 | 0);
              break L1083;
            }
          } while (0);
          if ($tbase_228 >>> 0 < HEAP32[1311826] >>> 0) {
            HEAP32[1311826] = $tbase_228;
          }
          var $add_ptr201 = $tbase_228 + $tsize_227 | 0;
          var $sp_135 = 5247732;
          while (1) {
            var $sp_135;
            var $base200 = $sp_135 | 0;
            if ((HEAP32[$base200 >> 2] | 0) == ($add_ptr201 | 0)) {
              label = 829;
              break;
            }
            var $30 = HEAP32[$sp_135 + 8 >> 2];
            if (($30 | 0) == 0) {
              break;
            } else {
              var $sp_135 = $30;
            }
          }
          do {
            if (label == 829) {
              if ((HEAP32[$sp_135 + 12 >> 2] & 8 | 0) != 0) {
                break;
              }
              HEAP32[$base200 >> 2] = $tbase_228;
              var $size219 = $sp_135 + 4 | 0;
              HEAP32[$size219 >> 2] = HEAP32[$size219 >> 2] + $tsize_227 | 0;
              var $retval_0 = _prepend_alloc($tbase_228, $add_ptr201, $nb);
              var $retval_0;
              return $retval_0;
            }
          } while (0);
          _add_segment($tbase_228, $tsize_227);
        }
      } while (0);
      var $33 = HEAP32[1311825];
      if ($33 >>> 0 <= $nb >>> 0) {
        break;
      }
      var $sub230 = $33 - $nb | 0;
      HEAP32[1311825] = $sub230;
      var $34 = HEAP32[1311828];
      var $35 = $34;
      HEAP32[1311828] = $35 + $nb | 0;
      HEAP32[$nb + ($35 + 4) >> 2] = $sub230 | 1;
      HEAP32[$34 + 4 >> 2] = $nb | 3;
      var $retval_0 = $34 + 8 | 0;
      var $retval_0;
      return $retval_0;
    }
  } while (0);
  HEAP32[___errno_location() >> 2] = 12;
  var $retval_0 = 0;
  var $retval_0;
  return $retval_0;
}
_sys_alloc["X"] = 1;
function _release_unused_segments() {
  var $sp_0_in = 5247740;
  while (1) {
    var $sp_0_in;
    var $sp_0 = HEAP32[$sp_0_in >> 2];
    if (($sp_0 | 0) == 0) {
      break;
    } else {
      var $sp_0_in = $sp_0 + 8 | 0;
    }
  }
  HEAP32[1311830] = -1;
  return;
}
function _sys_trim() {
  var $size$s2;
  if ((HEAP32[1310958] | 0) == 0) {
    _init_mparams();
  }
  var $1 = HEAP32[1311828];
  if (($1 | 0) == 0) {
    return;
  }
  var $2 = HEAP32[1311825];
  do {
    if ($2 >>> 0 > 40) {
      var $3 = HEAP32[1310960];
      var $mul = (Math.floor((($2 - 41 + $3 | 0) >>> 0) / ($3 >>> 0)) - 1) * $3 & -1;
      var $call10 = _segment_holding($1);
      if ((HEAP32[$call10 + 12 >> 2] & 8 | 0) != 0) {
        break;
      }
      var $call20 = _sbrk(0);
      var $size$s2 = ($call10 + 4 | 0) >> 2;
      if (($call20 | 0) != (HEAP32[$call10 >> 2] + HEAP32[$size$s2] | 0)) {
        break;
      }
      var $call24 = _sbrk(-($mul >>> 0 > 2147483646 ? -2147483648 - $3 | 0 : $mul) | 0);
      var $call25 = _sbrk(0);
      if (!(($call24 | 0) != -1 & $call25 >>> 0 < $call20 >>> 0)) {
        break;
      }
      var $sub_ptr_sub = $call20 - $call25 | 0;
      if (($call20 | 0) == ($call25 | 0)) {
        break;
      }
      HEAP32[$size$s2] = HEAP32[$size$s2] - $sub_ptr_sub | 0;
      HEAP32[1311930] = HEAP32[1311930] - $sub_ptr_sub | 0;
      _init_top(HEAP32[1311828], HEAP32[1311825] - $sub_ptr_sub | 0);
      return;
    }
  } while (0);
  if (HEAP32[1311825] >>> 0 <= HEAP32[1311829] >>> 0) {
    return;
  }
  HEAP32[1311829] = -1;
  return;
}
_sys_trim["X"] = 1;
function _free($mem) {
  var $R288_1$s2;
  var $51$s2;
  var $R_1$s2;
  var $p_0$s2;
  var $47$s2;
  var $add_ptr_sum215$s2;
  var $and5$s2;
  var $mem$s2 = $mem >> 2;
  var label = 0;
  if (($mem | 0) == 0) {
    return;
  }
  var $add_ptr = $mem - 8 | 0;
  var $0 = $add_ptr;
  var $1 = HEAP32[1311826];
  if ($add_ptr >>> 0 < $1 >>> 0) {
    _abort();
  }
  var $3 = HEAP32[$mem - 4 >> 2];
  var $and = $3 & 3;
  if (($and | 0) == 1) {
    _abort();
  }
  var $and5 = $3 & -8, $and5$s2 = $and5 >> 2;
  var $add_ptr6 = $mem + ($and5 - 8) | 0;
  var $4 = $add_ptr6;
  L1145 : do {
    if (($3 & 1 | 0) == 0) {
      var $5 = HEAP32[$add_ptr >> 2];
      if (($and | 0) == 0) {
        return;
      }
      var $add_ptr_sum215 = -8 - $5 | 0, $add_ptr_sum215$s2 = $add_ptr_sum215 >> 2;
      var $add_ptr16 = $mem + $add_ptr_sum215 | 0;
      var $6 = $add_ptr16;
      var $add17 = $5 + $and5 | 0;
      if ($add_ptr16 >>> 0 < $1 >>> 0) {
        _abort();
      }
      if (($6 | 0) == (HEAP32[1311827] | 0)) {
        var $47$s2 = ($mem + ($and5 - 4) | 0) >> 2;
        if ((HEAP32[$47$s2] & 3 | 0) != 3) {
          var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
          var $psize_0 = $add17;
          break;
        }
        HEAP32[1311824] = $add17;
        HEAP32[$47$s2] = HEAP32[$47$s2] & -2;
        HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 1)] = $add17 | 1;
        HEAP32[$add_ptr6 >> 2] = $add17;
        return;
      }
      var $shr = $5 >>> 3;
      if ($5 >>> 0 < 256) {
        var $9 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 2)];
        var $11 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 3)];
        if (($9 | 0) == ($11 | 0)) {
          HEAP32[1311822] = HEAP32[1311822] & (1 << $shr ^ -1);
          var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
          var $psize_0 = $add17;
          break;
        }
        var $13 = ($shr << 3) + 5247328 | 0;
        if (($9 | 0) != ($13 | 0) & $9 >>> 0 < $1 >>> 0) {
          _abort();
        }
        if (($11 | 0) == ($13 | 0) | $11 >>> 0 >= $1 >>> 0) {
          HEAP32[$9 + 12 >> 2] = $11;
          HEAP32[$11 + 8 >> 2] = $9;
          var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
          var $psize_0 = $add17;
          break;
        } else {
          _abort();
        }
      }
      var $16 = $add_ptr16;
      var $18 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 6)];
      var $20 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 3)];
      L1170 : do {
        if (($20 | 0) == ($16 | 0)) {
          var $24 = $add_ptr_sum215 + ($mem + 20) | 0;
          var $25 = HEAP32[$24 >> 2];
          do {
            if (($25 | 0) == 0) {
              var $arrayidx78 = $add_ptr_sum215 + ($mem + 16) | 0;
              var $26 = HEAP32[$arrayidx78 >> 2];
              if (($26 | 0) == 0) {
                var $R_1 = 0, $R_1$s2 = $R_1 >> 2;
                break L1170;
              } else {
                var $R_0 = $26;
                var $RP_0 = $arrayidx78;
                break;
              }
            } else {
              var $R_0 = $25;
              var $RP_0 = $24;
            }
          } while (0);
          while (1) {
            var $RP_0;
            var $R_0;
            var $arrayidx83 = $R_0 + 20 | 0;
            var $27 = HEAP32[$arrayidx83 >> 2];
            if (($27 | 0) != 0) {
              var $R_0 = $27;
              var $RP_0 = $arrayidx83;
              continue;
            }
            var $arrayidx88 = $R_0 + 16 | 0;
            var $28 = HEAP32[$arrayidx88 >> 2];
            if (($28 | 0) == 0) {
              break;
            } else {
              var $R_0 = $28;
              var $RP_0 = $arrayidx88;
            }
          }
          if ($RP_0 >>> 0 < $1 >>> 0) {
            _abort();
          } else {
            HEAP32[$RP_0 >> 2] = 0;
            var $R_1 = $R_0, $R_1$s2 = $R_1 >> 2;
            break;
          }
        } else {
          var $22 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 2)];
          if ($22 >>> 0 < $1 >>> 0) {
            _abort();
          } else {
            HEAP32[$22 + 12 >> 2] = $20;
            HEAP32[$20 + 8 >> 2] = $22;
            var $R_1 = $20, $R_1$s2 = $R_1 >> 2;
            break;
          }
        }
      } while (0);
      var $R_1;
      if (($18 | 0) == 0) {
        var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
        var $psize_0 = $add17;
        break;
      }
      var $30 = $add_ptr_sum215 + ($mem + 28) | 0;
      var $arrayidx104 = (HEAP32[$30 >> 2] << 2) + 5247592 | 0;
      do {
        if (($16 | 0) == (HEAP32[$arrayidx104 >> 2] | 0)) {
          HEAP32[$arrayidx104 >> 2] = $R_1;
          if (($R_1 | 0) != 0) {
            break;
          }
          HEAP32[1311823] = HEAP32[1311823] & (1 << HEAP32[$30 >> 2] ^ -1);
          var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
          var $psize_0 = $add17;
          break L1145;
        } else {
          if ($18 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          }
          var $arrayidx123 = $18 + 16 | 0;
          if ((HEAP32[$arrayidx123 >> 2] | 0) == ($16 | 0)) {
            HEAP32[$arrayidx123 >> 2] = $R_1;
          } else {
            HEAP32[$18 + 20 >> 2] = $R_1;
          }
          if (($R_1 | 0) == 0) {
            var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
            var $psize_0 = $add17;
            break L1145;
          }
        }
      } while (0);
      if ($R_1 >>> 0 < HEAP32[1311826] >>> 0) {
        _abort();
      }
      HEAP32[$R_1$s2 + 6] = $18;
      var $40 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 4)];
      do {
        if (($40 | 0) != 0) {
          if ($40 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          } else {
            HEAP32[$R_1$s2 + 4] = $40;
            HEAP32[$40 + 24 >> 2] = $R_1;
            break;
          }
        }
      } while (0);
      var $44 = HEAP32[$add_ptr_sum215$s2 + ($mem$s2 + 5)];
      if (($44 | 0) == 0) {
        var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
        var $psize_0 = $add17;
        break;
      }
      if ($44 >>> 0 < HEAP32[1311826] >>> 0) {
        _abort();
      } else {
        HEAP32[$R_1$s2 + 5] = $44;
        HEAP32[$44 + 24 >> 2] = $R_1;
        var $p_0 = $6, $p_0$s2 = $p_0 >> 2;
        var $psize_0 = $add17;
        break;
      }
    } else {
      var $p_0 = $0, $p_0$s2 = $p_0 >> 2;
      var $psize_0 = $and5;
    }
  } while (0);
  var $psize_0;
  var $p_0;
  var $51 = $p_0, $51$s2 = $51 >> 2;
  if ($51 >>> 0 >= $add_ptr6 >>> 0) {
    _abort();
  }
  var $52 = $mem + ($and5 - 4) | 0;
  var $53 = HEAP32[$52 >> 2];
  if (($53 & 1 | 0) == 0) {
    _abort();
  }
  do {
    if (($53 & 2 | 0) == 0) {
      if (($4 | 0) == (HEAP32[1311828] | 0)) {
        var $add217 = HEAP32[1311825] + $psize_0 | 0;
        HEAP32[1311825] = $add217;
        HEAP32[1311828] = $p_0;
        HEAP32[$p_0$s2 + 1] = $add217 | 1;
        if (($p_0 | 0) == (HEAP32[1311827] | 0)) {
          HEAP32[1311827] = 0;
          HEAP32[1311824] = 0;
        }
        if ($add217 >>> 0 <= HEAP32[1311829] >>> 0) {
          return;
        }
        _sys_trim();
        return;
      }
      if (($4 | 0) == (HEAP32[1311827] | 0)) {
        var $add232 = HEAP32[1311824] + $psize_0 | 0;
        HEAP32[1311824] = $add232;
        HEAP32[1311827] = $p_0;
        HEAP32[$p_0$s2 + 1] = $add232 | 1;
        HEAP32[($add232 >> 2) + $51$s2] = $add232;
        return;
      }
      var $add240 = ($53 & -8) + $psize_0 | 0;
      var $shr241 = $53 >>> 3;
      L1235 : do {
        if ($53 >>> 0 < 256) {
          var $61 = HEAP32[$mem$s2 + $and5$s2];
          var $63 = HEAP32[(($and5 | 4) >> 2) + $mem$s2];
          if (($61 | 0) == ($63 | 0)) {
            HEAP32[1311822] = HEAP32[1311822] & (1 << $shr241 ^ -1);
            break;
          }
          var $65 = ($shr241 << 3) + 5247328 | 0;
          do {
            if (($61 | 0) != ($65 | 0)) {
              if ($61 >>> 0 >= HEAP32[1311826] >>> 0) {
                break;
              }
              _abort();
            }
          } while (0);
          do {
            if (($63 | 0) != ($65 | 0)) {
              if ($63 >>> 0 >= HEAP32[1311826] >>> 0) {
                break;
              }
              _abort();
            }
          } while (0);
          HEAP32[$61 + 12 >> 2] = $63;
          HEAP32[$63 + 8 >> 2] = $61;
        } else {
          var $70 = $add_ptr6;
          var $72 = HEAP32[$and5$s2 + ($mem$s2 + 4)];
          var $74 = HEAP32[(($and5 | 4) >> 2) + $mem$s2];
          L1249 : do {
            if (($74 | 0) == ($70 | 0)) {
              var $79 = $and5 + ($mem + 12) | 0;
              var $80 = HEAP32[$79 >> 2];
              do {
                if (($80 | 0) == 0) {
                  var $arrayidx313 = $and5 + ($mem + 8) | 0;
                  var $81 = HEAP32[$arrayidx313 >> 2];
                  if (($81 | 0) == 0) {
                    var $R288_1 = 0, $R288_1$s2 = $R288_1 >> 2;
                    break L1249;
                  } else {
                    var $R288_0 = $81;
                    var $RP306_0 = $arrayidx313;
                    break;
                  }
                } else {
                  var $R288_0 = $80;
                  var $RP306_0 = $79;
                }
              } while (0);
              while (1) {
                var $RP306_0;
                var $R288_0;
                var $arrayidx320 = $R288_0 + 20 | 0;
                var $82 = HEAP32[$arrayidx320 >> 2];
                if (($82 | 0) != 0) {
                  var $R288_0 = $82;
                  var $RP306_0 = $arrayidx320;
                  continue;
                }
                var $arrayidx325 = $R288_0 + 16 | 0;
                var $83 = HEAP32[$arrayidx325 >> 2];
                if (($83 | 0) == 0) {
                  break;
                } else {
                  var $R288_0 = $83;
                  var $RP306_0 = $arrayidx325;
                }
              }
              if ($RP306_0 >>> 0 < HEAP32[1311826] >>> 0) {
                _abort();
              } else {
                HEAP32[$RP306_0 >> 2] = 0;
                var $R288_1 = $R288_0, $R288_1$s2 = $R288_1 >> 2;
                break;
              }
            } else {
              var $76 = HEAP32[$mem$s2 + $and5$s2];
              if ($76 >>> 0 < HEAP32[1311826] >>> 0) {
                _abort();
              } else {
                HEAP32[$76 + 12 >> 2] = $74;
                HEAP32[$74 + 8 >> 2] = $76;
                var $R288_1 = $74, $R288_1$s2 = $R288_1 >> 2;
                break;
              }
            }
          } while (0);
          var $R288_1;
          if (($72 | 0) == 0) {
            break;
          }
          var $86 = $and5 + ($mem + 20) | 0;
          var $arrayidx345 = (HEAP32[$86 >> 2] << 2) + 5247592 | 0;
          do {
            if (($70 | 0) == (HEAP32[$arrayidx345 >> 2] | 0)) {
              HEAP32[$arrayidx345 >> 2] = $R288_1;
              if (($R288_1 | 0) != 0) {
                break;
              }
              HEAP32[1311823] = HEAP32[1311823] & (1 << HEAP32[$86 >> 2] ^ -1);
              break L1235;
            } else {
              if ($72 >>> 0 < HEAP32[1311826] >>> 0) {
                _abort();
              }
              var $arrayidx364 = $72 + 16 | 0;
              if ((HEAP32[$arrayidx364 >> 2] | 0) == ($70 | 0)) {
                HEAP32[$arrayidx364 >> 2] = $R288_1;
              } else {
                HEAP32[$72 + 20 >> 2] = $R288_1;
              }
              if (($R288_1 | 0) == 0) {
                break L1235;
              }
            }
          } while (0);
          if ($R288_1 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          }
          HEAP32[$R288_1$s2 + 6] = $72;
          var $96 = HEAP32[$and5$s2 + ($mem$s2 + 2)];
          do {
            if (($96 | 0) != 0) {
              if ($96 >>> 0 < HEAP32[1311826] >>> 0) {
                _abort();
              } else {
                HEAP32[$R288_1$s2 + 4] = $96;
                HEAP32[$96 + 24 >> 2] = $R288_1;
                break;
              }
            }
          } while (0);
          var $100 = HEAP32[$and5$s2 + ($mem$s2 + 3)];
          if (($100 | 0) == 0) {
            break;
          }
          if ($100 >>> 0 < HEAP32[1311826] >>> 0) {
            _abort();
          } else {
            HEAP32[$R288_1$s2 + 5] = $100;
            HEAP32[$100 + 24 >> 2] = $R288_1;
            break;
          }
        }
      } while (0);
      HEAP32[$p_0$s2 + 1] = $add240 | 1;
      HEAP32[($add240 >> 2) + $51$s2] = $add240;
      if (($p_0 | 0) != (HEAP32[1311827] | 0)) {
        var $psize_1 = $add240;
        break;
      }
      HEAP32[1311824] = $add240;
      return;
    } else {
      HEAP32[$52 >> 2] = $53 & -2;
      HEAP32[$p_0$s2 + 1] = $psize_0 | 1;
      HEAP32[($psize_0 >> 2) + $51$s2] = $psize_0;
      var $psize_1 = $psize_0;
    }
  } while (0);
  var $psize_1;
  var $shr443 = $psize_1 >>> 3;
  if ($psize_1 >>> 0 < 256) {
    var $shl450 = $shr443 << 1;
    var $104 = ($shl450 << 2) + 5247328 | 0;
    var $105 = HEAP32[1311822];
    var $shl453 = 1 << $shr443;
    do {
      if (($105 & $shl453 | 0) == 0) {
        HEAP32[1311822] = $105 | $shl453;
        var $F452_0 = $104;
        var $_pre_phi = ($shl450 + 2 << 2) + 5247328 | 0;
      } else {
        var $106 = ($shl450 + 2 << 2) + 5247328 | 0;
        var $107 = HEAP32[$106 >> 2];
        if ($107 >>> 0 >= HEAP32[1311826] >>> 0) {
          var $F452_0 = $107;
          var $_pre_phi = $106;
          break;
        }
        _abort();
      }
    } while (0);
    var $_pre_phi;
    var $F452_0;
    HEAP32[$_pre_phi >> 2] = $p_0;
    HEAP32[$F452_0 + 12 >> 2] = $p_0;
    HEAP32[$p_0$s2 + 2] = $F452_0;
    HEAP32[$p_0$s2 + 3] = $104;
    return;
  }
  var $110 = $p_0;
  var $shr477 = $psize_1 >>> 8;
  do {
    if (($shr477 | 0) == 0) {
      var $I476_0 = 0;
    } else {
      if ($psize_1 >>> 0 > 16777215) {
        var $I476_0 = 31;
        break;
      }
      var $and487 = ($shr477 + 1048320 | 0) >>> 16 & 8;
      var $shl488 = $shr477 << $and487;
      var $and491 = ($shl488 + 520192 | 0) >>> 16 & 4;
      var $shl493 = $shl488 << $and491;
      var $and496 = ($shl493 + 245760 | 0) >>> 16 & 2;
      var $add501 = 14 - ($and491 | $and487 | $and496) + ($shl493 << $and496 >>> 15) | 0;
      var $I476_0 = $psize_1 >>> (($add501 + 7 | 0) >>> 0) & 1 | $add501 << 1;
    }
  } while (0);
  var $I476_0;
  var $arrayidx509 = ($I476_0 << 2) + 5247592 | 0;
  HEAP32[$p_0$s2 + 7] = $I476_0;
  HEAP32[$p_0$s2 + 5] = 0;
  HEAP32[$p_0$s2 + 4] = 0;
  var $112 = HEAP32[1311823];
  var $shl515 = 1 << $I476_0;
  do {
    if (($112 & $shl515 | 0) == 0) {
      HEAP32[1311823] = $112 | $shl515;
      HEAP32[$arrayidx509 >> 2] = $110;
      HEAP32[$p_0$s2 + 6] = $arrayidx509;
      HEAP32[$p_0$s2 + 3] = $p_0;
      HEAP32[$p_0$s2 + 2] = $p_0;
    } else {
      if (($I476_0 | 0) == 31) {
        var $cond = 0;
      } else {
        var $cond = 25 - ($I476_0 >>> 1) | 0;
      }
      var $cond;
      var $K525_0 = $psize_1 << $cond;
      var $T_0 = HEAP32[$arrayidx509 >> 2];
      while (1) {
        var $T_0;
        var $K525_0;
        if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($psize_1 | 0)) {
          break;
        }
        var $arrayidx541 = ($K525_0 >>> 31 << 2) + $T_0 + 16 | 0;
        var $115 = HEAP32[$arrayidx541 >> 2];
        if (($115 | 0) == 0) {
          label = 974;
          break;
        } else {
          var $K525_0 = $K525_0 << 1;
          var $T_0 = $115;
        }
      }
      if (label == 974) {
        if ($arrayidx541 >>> 0 < HEAP32[1311826] >>> 0) {
          _abort();
        } else {
          HEAP32[$arrayidx541 >> 2] = $110;
          HEAP32[$p_0$s2 + 6] = $T_0;
          HEAP32[$p_0$s2 + 3] = $p_0;
          HEAP32[$p_0$s2 + 2] = $p_0;
          break;
        }
      }
      var $fd559 = $T_0 + 8 | 0;
      var $118 = HEAP32[$fd559 >> 2];
      var $120 = HEAP32[1311826];
      if ($T_0 >>> 0 < $120 >>> 0) {
        _abort();
      }
      if ($118 >>> 0 < $120 >>> 0) {
        _abort();
      } else {
        HEAP32[$118 + 12 >> 2] = $110;
        HEAP32[$fd559 >> 2] = $110;
        HEAP32[$p_0$s2 + 2] = $118;
        HEAP32[$p_0$s2 + 3] = $T_0;
        HEAP32[$p_0$s2 + 6] = 0;
        break;
      }
    }
  } while (0);
  var $dec = HEAP32[1311830] - 1 | 0;
  HEAP32[1311830] = $dec;
  if (($dec | 0) != 0) {
    return;
  }
  _release_unused_segments();
  return;
}
_free["X"] = 1;
function _segment_holding($addr) {
  var $sp_0$s2;
  var label = 0;
  var $sp_0 = 5247732, $sp_0$s2 = $sp_0 >> 2;
  while (1) {
    var $sp_0;
    var $0 = HEAP32[$sp_0$s2];
    if ($0 >>> 0 <= $addr >>> 0) {
      if (($0 + HEAP32[$sp_0$s2 + 1] | 0) >>> 0 > $addr >>> 0) {
        var $retval_0 = $sp_0;
        label = 1011;
        break;
      }
    }
    var $2 = HEAP32[$sp_0$s2 + 2];
    if (($2 | 0) == 0) {
      var $retval_0 = 0;
      label = 1012;
      break;
    } else {
      var $sp_0 = $2, $sp_0$s2 = $sp_0 >> 2;
    }
  }
  if (label == 1012) {
    var $retval_0;
    return $retval_0;
  } else if (label == 1011) {
    var $retval_0;
    return $retval_0;
  }
}
function _init_top($p, $psize) {
  var $0 = $p;
  var $1 = $p + 8 | 0;
  if (($1 & 7 | 0) == 0) {
    var $cond = 0;
  } else {
    var $cond = -$1 & 7;
  }
  var $cond;
  var $sub5 = $psize - $cond | 0;
  HEAP32[1311828] = $0 + $cond | 0;
  HEAP32[1311825] = $sub5;
  HEAP32[$cond + ($0 + 4) >> 2] = $sub5 | 1;
  HEAP32[$psize + ($0 + 4) >> 2] = 40;
  HEAP32[1311829] = HEAP32[1310962];
  return;
}
function _init_bins() {
  var $i_02 = 0;
  while (1) {
    var $i_02;
    var $shl = $i_02 << 1;
    var $0 = ($shl << 2) + 5247328 | 0;
    HEAP32[($shl + 3 << 2) + 5247328 >> 2] = $0;
    HEAP32[($shl + 2 << 2) + 5247328 >> 2] = $0;
    var $inc = $i_02 + 1 | 0;
    if (($inc | 0) == 32) {
      break;
    } else {
      var $i_02 = $inc;
    }
  }
  return;
}
function _init_mparams() {
  if ((HEAP32[1310958] | 0) != 0) {
    return;
  }
  var $call = _sysconf(8);
  if (($call - 1 & $call | 0) != 0) {
    _abort();
  }
  HEAP32[1310960] = $call;
  HEAP32[1310959] = $call;
  HEAP32[1310961] = -1;
  HEAP32[1310962] = 2097152;
  HEAP32[1310963] = 0;
  HEAP32[1311932] = 0;
  HEAP32[1310958] = _time(0) & -16 ^ 1431655768;
  return;
}
function _prepend_alloc($newbase, $oldbase, $nb) {
  var $R_1$s2;
  var $add_ptr4_sum$s2;
  var $cond15$s2;
  var $oldbase$s2 = $oldbase >> 2;
  var $newbase$s2 = $newbase >> 2;
  var label = 0;
  var $0 = $newbase + 8 | 0;
  if (($0 & 7 | 0) == 0) {
    var $cond = 0;
  } else {
    var $cond = -$0 & 7;
  }
  var $cond;
  var $2 = $oldbase + 8 | 0;
  if (($2 & 7 | 0) == 0) {
    var $cond15 = 0, $cond15$s2 = $cond15 >> 2;
  } else {
    var $cond15 = -$2 & 7, $cond15$s2 = $cond15 >> 2;
  }
  var $cond15;
  var $add_ptr16 = $oldbase + $cond15 | 0;
  var $4 = $add_ptr16;
  var $add_ptr4_sum = $cond + $nb | 0, $add_ptr4_sum$s2 = $add_ptr4_sum >> 2;
  var $add_ptr17 = $newbase + $add_ptr4_sum | 0;
  var $5 = $add_ptr17;
  var $sub18 = $add_ptr16 - ($newbase + $cond) - $nb | 0;
  HEAP32[($cond + 4 >> 2) + $newbase$s2] = $nb | 3;
  if (($4 | 0) == (HEAP32[1311828] | 0)) {
    var $add = HEAP32[1311825] + $sub18 | 0;
    HEAP32[1311825] = $add;
    HEAP32[1311828] = $5;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 1)] = $add | 1;
    var $add_ptr4_sum1415 = $cond | 8;
    var $add_ptr353 = $newbase + $add_ptr4_sum1415 | 0;
    return $add_ptr353;
  }
  if (($4 | 0) == (HEAP32[1311827] | 0)) {
    var $add26 = HEAP32[1311824] + $sub18 | 0;
    HEAP32[1311824] = $add26;
    HEAP32[1311827] = $5;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 1)] = $add26 | 1;
    HEAP32[($add26 >> 2) + $newbase$s2 + $add_ptr4_sum$s2] = $add26;
    var $add_ptr4_sum1415 = $cond | 8;
    var $add_ptr353 = $newbase + $add_ptr4_sum1415 | 0;
    return $add_ptr353;
  }
  var $14 = HEAP32[$cond15$s2 + ($oldbase$s2 + 1)];
  if (($14 & 3 | 0) == 1) {
    var $and37 = $14 & -8;
    var $shr = $14 >>> 3;
    L1377 : do {
      if ($14 >>> 0 < 256) {
        var $16 = HEAP32[(($cond15 | 8) >> 2) + $oldbase$s2];
        var $18 = HEAP32[$cond15$s2 + ($oldbase$s2 + 3)];
        if (($16 | 0) == ($18 | 0)) {
          HEAP32[1311822] = HEAP32[1311822] & (1 << $shr ^ -1);
          break;
        }
        var $20 = ($shr << 3) + 5247328 | 0;
        do {
          if (($16 | 0) != ($20 | 0)) {
            if ($16 >>> 0 >= HEAP32[1311826] >>> 0) {
              break;
            }
            _abort();
          }
        } while (0);
        do {
          if (($18 | 0) != ($20 | 0)) {
            if ($18 >>> 0 >= HEAP32[1311826] >>> 0) {
              break;
            }
            _abort();
          }
        } while (0);
        HEAP32[$16 + 12 >> 2] = $18;
        HEAP32[$18 + 8 >> 2] = $16;
      } else {
        var $25 = $add_ptr16;
        var $27 = HEAP32[(($cond15 | 24) >> 2) + $oldbase$s2];
        var $29 = HEAP32[$cond15$s2 + ($oldbase$s2 + 3)];
        L1391 : do {
          if (($29 | 0) == ($25 | 0)) {
            var $add_ptr16_sum56 = $cond15 | 16;
            var $34 = $add_ptr16_sum56 + ($oldbase + 4) | 0;
            var $35 = HEAP32[$34 >> 2];
            do {
              if (($35 | 0) == 0) {
                var $arrayidx81 = $oldbase + $add_ptr16_sum56 | 0;
                var $36 = HEAP32[$arrayidx81 >> 2];
                if (($36 | 0) == 0) {
                  var $R_1 = 0, $R_1$s2 = $R_1 >> 2;
                  break L1391;
                } else {
                  var $R_0 = $36;
                  var $RP_0 = $arrayidx81;
                  break;
                }
              } else {
                var $R_0 = $35;
                var $RP_0 = $34;
              }
            } while (0);
            while (1) {
              var $RP_0;
              var $R_0;
              var $arrayidx86 = $R_0 + 20 | 0;
              var $37 = HEAP32[$arrayidx86 >> 2];
              if (($37 | 0) != 0) {
                var $R_0 = $37;
                var $RP_0 = $arrayidx86;
                continue;
              }
              var $arrayidx91 = $R_0 + 16 | 0;
              var $38 = HEAP32[$arrayidx91 >> 2];
              if (($38 | 0) == 0) {
                break;
              } else {
                var $R_0 = $38;
                var $RP_0 = $arrayidx91;
              }
            }
            if ($RP_0 >>> 0 < HEAP32[1311826] >>> 0) {
              _abort();
            } else {
              HEAP32[$RP_0 >> 2] = 0;
              var $R_1 = $R_0, $R_1$s2 = $R_1 >> 2;
              break;
            }
          } else {
            var $31 = HEAP32[(($cond15 | 8) >> 2) + $oldbase$s2];
            if ($31 >>> 0 < HEAP32[1311826] >>> 0) {
              _abort();
            } else {
              HEAP32[$31 + 12 >> 2] = $29;
              HEAP32[$29 + 8 >> 2] = $31;
              var $R_1 = $29, $R_1$s2 = $R_1 >> 2;
              break;
            }
          }
        } while (0);
        var $R_1;
        if (($27 | 0) == 0) {
          break;
        }
        var $41 = $cond15 + ($oldbase + 28) | 0;
        var $arrayidx108 = (HEAP32[$41 >> 2] << 2) + 5247592 | 0;
        do {
          if (($25 | 0) == (HEAP32[$arrayidx108 >> 2] | 0)) {
            HEAP32[$arrayidx108 >> 2] = $R_1;
            if (($R_1 | 0) != 0) {
              break;
            }
            HEAP32[1311823] = HEAP32[1311823] & (1 << HEAP32[$41 >> 2] ^ -1);
            break L1377;
          } else {
            if ($27 >>> 0 < HEAP32[1311826] >>> 0) {
              _abort();
            }
            var $arrayidx128 = $27 + 16 | 0;
            if ((HEAP32[$arrayidx128 >> 2] | 0) == ($25 | 0)) {
              HEAP32[$arrayidx128 >> 2] = $R_1;
            } else {
              HEAP32[$27 + 20 >> 2] = $R_1;
            }
            if (($R_1 | 0) == 0) {
              break L1377;
            }
          }
        } while (0);
        if ($R_1 >>> 0 < HEAP32[1311826] >>> 0) {
          _abort();
        }
        HEAP32[$R_1$s2 + 6] = $27;
        var $add_ptr16_sum2627 = $cond15 | 16;
        var $51 = HEAP32[($add_ptr16_sum2627 >> 2) + $oldbase$s2];
        do {
          if (($51 | 0) != 0) {
            if ($51 >>> 0 < HEAP32[1311826] >>> 0) {
              _abort();
            } else {
              HEAP32[$R_1$s2 + 4] = $51;
              HEAP32[$51 + 24 >> 2] = $R_1;
              break;
            }
          }
        } while (0);
        var $55 = HEAP32[($add_ptr16_sum2627 + 4 >> 2) + $oldbase$s2];
        if (($55 | 0) == 0) {
          break;
        }
        if ($55 >>> 0 < HEAP32[1311826] >>> 0) {
          _abort();
        } else {
          HEAP32[$R_1$s2 + 5] = $55;
          HEAP32[$55 + 24 >> 2] = $R_1;
          break;
        }
      }
    } while (0);
    var $oldfirst_0 = $oldbase + ($and37 | $cond15) | 0;
    var $qsize_0 = $and37 + $sub18 | 0;
  } else {
    var $oldfirst_0 = $4;
    var $qsize_0 = $sub18;
  }
  var $qsize_0;
  var $oldfirst_0;
  var $head193 = $oldfirst_0 + 4 | 0;
  HEAP32[$head193 >> 2] = HEAP32[$head193 >> 2] & -2;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 1)] = $qsize_0 | 1;
  HEAP32[($qsize_0 >> 2) + $newbase$s2 + $add_ptr4_sum$s2] = $qsize_0;
  var $shr199 = $qsize_0 >>> 3;
  if ($qsize_0 >>> 0 < 256) {
    var $shl206 = $shr199 << 1;
    var $61 = ($shl206 << 2) + 5247328 | 0;
    var $62 = HEAP32[1311822];
    var $shl211 = 1 << $shr199;
    do {
      if (($62 & $shl211 | 0) == 0) {
        HEAP32[1311822] = $62 | $shl211;
        var $F209_0 = $61;
        var $_pre_phi = ($shl206 + 2 << 2) + 5247328 | 0;
      } else {
        var $63 = ($shl206 + 2 << 2) + 5247328 | 0;
        var $64 = HEAP32[$63 >> 2];
        if ($64 >>> 0 >= HEAP32[1311826] >>> 0) {
          var $F209_0 = $64;
          var $_pre_phi = $63;
          break;
        }
        _abort();
      }
    } while (0);
    var $_pre_phi;
    var $F209_0;
    HEAP32[$_pre_phi >> 2] = $5;
    HEAP32[$F209_0 + 12 >> 2] = $5;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 2)] = $F209_0;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 3)] = $61;
    var $add_ptr4_sum1415 = $cond | 8;
    var $add_ptr353 = $newbase + $add_ptr4_sum1415 | 0;
    return $add_ptr353;
  }
  var $69 = $add_ptr17;
  var $shr238 = $qsize_0 >>> 8;
  do {
    if (($shr238 | 0) == 0) {
      var $I237_0 = 0;
    } else {
      if ($qsize_0 >>> 0 > 16777215) {
        var $I237_0 = 31;
        break;
      }
      var $and249 = ($shr238 + 1048320 | 0) >>> 16 & 8;
      var $shl250 = $shr238 << $and249;
      var $and253 = ($shl250 + 520192 | 0) >>> 16 & 4;
      var $shl255 = $shl250 << $and253;
      var $and258 = ($shl255 + 245760 | 0) >>> 16 & 2;
      var $add263 = 14 - ($and253 | $and249 | $and258) + ($shl255 << $and258 >>> 15) | 0;
      var $I237_0 = $qsize_0 >>> (($add263 + 7 | 0) >>> 0) & 1 | $add263 << 1;
    }
  } while (0);
  var $I237_0;
  var $arrayidx272 = ($I237_0 << 2) + 5247592 | 0;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 7)] = $I237_0;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 5)] = 0;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 4)] = 0;
  var $72 = HEAP32[1311823];
  var $shl279 = 1 << $I237_0;
  if (($72 & $shl279 | 0) == 0) {
    HEAP32[1311823] = $72 | $shl279;
    HEAP32[$arrayidx272 >> 2] = $69;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 6)] = $arrayidx272;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 3)] = $69;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 2)] = $69;
    var $add_ptr4_sum1415 = $cond | 8;
    var $add_ptr353 = $newbase + $add_ptr4_sum1415 | 0;
    return $add_ptr353;
  }
  if (($I237_0 | 0) == 31) {
    var $cond300 = 0;
  } else {
    var $cond300 = 25 - ($I237_0 >>> 1) | 0;
  }
  var $cond300;
  var $K290_0 = $qsize_0 << $cond300;
  var $T_0 = HEAP32[$arrayidx272 >> 2];
  while (1) {
    var $T_0;
    var $K290_0;
    if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($qsize_0 | 0)) {
      break;
    }
    var $arrayidx310 = ($K290_0 >>> 31 << 2) + $T_0 + 16 | 0;
    var $79 = HEAP32[$arrayidx310 >> 2];
    if (($79 | 0) == 0) {
      label = 1092;
      break;
    } else {
      var $K290_0 = $K290_0 << 1;
      var $T_0 = $79;
    }
  }
  if (label == 1092) {
    if ($arrayidx310 >>> 0 < HEAP32[1311826] >>> 0) {
      _abort();
    }
    HEAP32[$arrayidx310 >> 2] = $69;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 6)] = $T_0;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 3)] = $69;
    HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 2)] = $69;
    var $add_ptr4_sum1415 = $cond | 8;
    var $add_ptr353 = $newbase + $add_ptr4_sum1415 | 0;
    return $add_ptr353;
  }
  var $fd329 = $T_0 + 8 | 0;
  var $85 = HEAP32[$fd329 >> 2];
  var $87 = HEAP32[1311826];
  if ($T_0 >>> 0 < $87 >>> 0) {
    _abort();
  }
  if ($85 >>> 0 < $87 >>> 0) {
    _abort();
  }
  HEAP32[$85 + 12 >> 2] = $69;
  HEAP32[$fd329 >> 2] = $69;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 2)] = $85;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 3)] = $T_0;
  HEAP32[$add_ptr4_sum$s2 + ($newbase$s2 + 6)] = 0;
  var $add_ptr4_sum1415 = $cond | 8;
  var $add_ptr353 = $newbase + $add_ptr4_sum1415 | 0;
  return $add_ptr353;
}
_prepend_alloc["X"] = 1;
function _add_segment($tbase, $tsize) {
  var $add_ptr14$s2;
  var $0$s2;
  var label = 0;
  var $0 = HEAP32[1311828], $0$s2 = $0 >> 2;
  var $1 = $0;
  var $call = _segment_holding($1);
  var $2 = HEAP32[$call >> 2];
  var $3 = HEAP32[$call + 4 >> 2];
  var $add_ptr = $2 + $3 | 0;
  var $4 = $2 + ($3 - 39) | 0;
  if (($4 & 7 | 0) == 0) {
    var $cond = 0;
  } else {
    var $cond = -$4 & 7;
  }
  var $cond;
  var $add_ptr7 = $2 + ($3 - 47) + $cond | 0;
  var $cond13 = $add_ptr7 >>> 0 < ($0 + 16 | 0) >>> 0 ? $1 : $add_ptr7;
  var $add_ptr14 = $cond13 + 8 | 0, $add_ptr14$s2 = $add_ptr14 >> 2;
  _init_top($tbase, $tsize - 40 | 0);
  HEAP32[$cond13 + 4 >> 2] = 27;
  HEAP32[$add_ptr14$s2] = HEAP32[1311933];
  HEAP32[$add_ptr14$s2 + 1] = HEAP32[1311934];
  HEAP32[$add_ptr14$s2 + 2] = HEAP32[1311935];
  HEAP32[$add_ptr14$s2 + 3] = HEAP32[1311936];
  HEAP32[1311933] = $tbase;
  HEAP32[1311934] = $tsize;
  HEAP32[1311936] = 0;
  HEAP32[1311935] = $add_ptr14;
  var $9 = $cond13 + 28 | 0;
  HEAP32[$9 >> 2] = 7;
  L1476 : do {
    if (($cond13 + 32 | 0) >>> 0 < $add_ptr >>> 0) {
      var $add_ptr2413 = $9;
      while (1) {
        var $add_ptr2413;
        var $11 = $add_ptr2413 + 4 | 0;
        HEAP32[$11 >> 2] = 7;
        if (($add_ptr2413 + 8 | 0) >>> 0 < $add_ptr >>> 0) {
          var $add_ptr2413 = $11;
        } else {
          break L1476;
        }
      }
    }
  } while (0);
  if (($cond13 | 0) == ($1 | 0)) {
    return;
  }
  var $sub_ptr_sub = $cond13 - $0 | 0;
  var $14 = $sub_ptr_sub + ($1 + 4) | 0;
  HEAP32[$14 >> 2] = HEAP32[$14 >> 2] & -2;
  HEAP32[$0$s2 + 1] = $sub_ptr_sub | 1;
  HEAP32[$1 + $sub_ptr_sub >> 2] = $sub_ptr_sub;
  var $shr = $sub_ptr_sub >>> 3;
  if ($sub_ptr_sub >>> 0 < 256) {
    var $shl = $shr << 1;
    var $16 = ($shl << 2) + 5247328 | 0;
    var $17 = HEAP32[1311822];
    var $shl39 = 1 << $shr;
    do {
      if (($17 & $shl39 | 0) == 0) {
        HEAP32[1311822] = $17 | $shl39;
        var $F_0 = $16;
        var $_pre_phi = ($shl + 2 << 2) + 5247328 | 0;
      } else {
        var $18 = ($shl + 2 << 2) + 5247328 | 0;
        var $19 = HEAP32[$18 >> 2];
        if ($19 >>> 0 >= HEAP32[1311826] >>> 0) {
          var $F_0 = $19;
          var $_pre_phi = $18;
          break;
        }
        _abort();
      }
    } while (0);
    var $_pre_phi;
    var $F_0;
    HEAP32[$_pre_phi >> 2] = $0;
    HEAP32[$F_0 + 12 >> 2] = $0;
    HEAP32[$0$s2 + 2] = $F_0;
    HEAP32[$0$s2 + 3] = $16;
    return;
  }
  var $22 = $0;
  var $shr58 = $sub_ptr_sub >>> 8;
  do {
    if (($shr58 | 0) == 0) {
      var $I57_0 = 0;
    } else {
      if ($sub_ptr_sub >>> 0 > 16777215) {
        var $I57_0 = 31;
        break;
      }
      var $and69 = ($shr58 + 1048320 | 0) >>> 16 & 8;
      var $shl70 = $shr58 << $and69;
      var $and73 = ($shl70 + 520192 | 0) >>> 16 & 4;
      var $shl75 = $shl70 << $and73;
      var $and78 = ($shl75 + 245760 | 0) >>> 16 & 2;
      var $add83 = 14 - ($and73 | $and69 | $and78) + ($shl75 << $and78 >>> 15) | 0;
      var $I57_0 = $sub_ptr_sub >>> (($add83 + 7 | 0) >>> 0) & 1 | $add83 << 1;
    }
  } while (0);
  var $I57_0;
  var $arrayidx91 = ($I57_0 << 2) + 5247592 | 0;
  HEAP32[$0$s2 + 7] = $I57_0;
  HEAP32[$0$s2 + 5] = 0;
  HEAP32[$0$s2 + 4] = 0;
  var $24 = HEAP32[1311823];
  var $shl95 = 1 << $I57_0;
  if (($24 & $shl95 | 0) == 0) {
    HEAP32[1311823] = $24 | $shl95;
    HEAP32[$arrayidx91 >> 2] = $22;
    HEAP32[$0$s2 + 6] = $arrayidx91;
    HEAP32[$0$s2 + 3] = $0;
    HEAP32[$0$s2 + 2] = $0;
    return;
  }
  if (($I57_0 | 0) == 31) {
    var $cond115 = 0;
  } else {
    var $cond115 = 25 - ($I57_0 >>> 1) | 0;
  }
  var $cond115;
  var $K105_0 = $sub_ptr_sub << $cond115;
  var $T_0 = HEAP32[$arrayidx91 >> 2];
  while (1) {
    var $T_0;
    var $K105_0;
    if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($sub_ptr_sub | 0)) {
      break;
    }
    var $arrayidx126 = ($K105_0 >>> 31 << 2) + $T_0 + 16 | 0;
    var $27 = HEAP32[$arrayidx126 >> 2];
    if (($27 | 0) == 0) {
      label = 1131;
      break;
    } else {
      var $K105_0 = $K105_0 << 1;
      var $T_0 = $27;
    }
  }
  if (label == 1131) {
    if ($arrayidx126 >>> 0 < HEAP32[1311826] >>> 0) {
      _abort();
    }
    HEAP32[$arrayidx126 >> 2] = $22;
    HEAP32[$0$s2 + 6] = $T_0;
    HEAP32[$0$s2 + 3] = $0;
    HEAP32[$0$s2 + 2] = $0;
    return;
  }
  var $fd145 = $T_0 + 8 | 0;
  var $30 = HEAP32[$fd145 >> 2];
  var $32 = HEAP32[1311826];
  if ($T_0 >>> 0 < $32 >>> 0) {
    _abort();
  }
  if ($30 >>> 0 < $32 >>> 0) {
    _abort();
  }
  HEAP32[$30 + 12 >> 2] = $22;
  HEAP32[$fd145 >> 2] = $22;
  HEAP32[$0$s2 + 2] = $30;
  HEAP32[$0$s2 + 3] = $T_0;
  HEAP32[$0$s2 + 6] = 0;
  return;
}
_add_segment["X"]=1;
var i64Math = null;
Module.callMain = function callMain(args) {
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);


  var ret;

  ret = Module['_main'](argc, argv, 0);


  return ret;
}





function run(args) {
  args = args || Module['arguments'];

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }

  function doRun() {
    var ret = 0;
    calledRun = true;
    if (Module['_main']) {
      preMain();
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
initRuntime();
var shouldRunNow = false;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
if (shouldRunNow) {
  var ret = run();
}
if (FS) {
  Module['FS'] = FS;
}
Module['HEAPU8'] = HEAPU8;
Module['CorrectionsMonitor'] = CorrectionsMonitor;
FS['createDataFile'] = FS.createDataFile;
var breakLoop = false;
_runMainLoop = function() {
  window.addEventListener("message", function() {
    _mainLoopIteration();
    if (!breakLoop) {
      window.postMessage(0, "*");
    }
  }, false);
};
Module['play'] = function() {
  breakLoop = false;
  window.postMessage(0, "*");
};
Module['stop'] = function() {
  breakLoop = true;
};
Module['onFrameDecoded'] = function () { }


_broadwayOnFrameDecoded = function() {
  Module['onFrameDecoded']();
};
Module['createStreamBuffer'] = _broadwayCreateStreamBuffer;
var patches = Module['patches'] = {};
function getGlobalScope() {
  return function () { return this; }.call(null);
}
assert = function (condition, message) {
  if (!condition) {
    throw "Assertion: " + message;
  }
};
Module['patch'] = function (scope, name, value) {
  assert (typeof(value) == "function");
  if (!scope) {
    scope = getGlobalScope();
  }
  if (Module["CC_VARIABLE_MAP"]) {
    name = Module["CC_VARIABLE_MAP"][name]; 
  }
  assert (name in scope && (typeof(scope[name]) === "function" || typeof(scope[name]) === "undefined"), "Can only patch functions.");
  patches[name] = scope[name];
  scope[name] = value;
  return patches[name];
};
Module['unpatch'] = function (scope, name) {
  if (!scope) {
    scope = getGlobalScope();
  }
  if (Module["CC_VARIABLE_MAP"]) {
    name = Module["CC_VARIABLE_MAP"][name];
  }
  assert (name in scope && typeof(scope[name]) == "function");
  if (name in patches) {
    scope[name] = patches[name];
  }
};
_abs = Math.abs;
_clip = function clip(x, y, z) {
  return z < x ? x : (z > y ? y : z);
};
