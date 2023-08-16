//#define BUILDING_NODE_EXTENSION

#include <node.h>

#include <iostream>

#include <windows.h>

namespace demo {

using v8::Exception;

using v8::FunctionCallbackInfo;

using v8::Isolate;

using v8::Local;

using v8::NewStringType;

using v8::Number;

using v8::Object;

using v8::String;

using v8::Value;

// 这是 "add" 方法的实现。

// 输入参数使用 const FunctionCallbackInfo<Value>& args 结构传入。

void Add(const FunctionCallbackInfo<Value>& args) {

  Isolate* isolate = args.GetIsolate();

  // 检查传入的参数的个数。

    // if (args.Length() < 2) {

    //     isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate,"参数的数量错误",NewStringType::kNormal).ToLocalChecked()));

    //     return;

    // }

  // 检查参数的类型。

  // if (!args[0]->IsNumber() || !args[1]->IsNumber()) {

  //     isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate,"参数错误",NewStringType::kNormal).ToLocalChecked()));

  //     return;

// }

  typedef int(*DllAdd)(int, int);

  HINSTANCE hDll = LoadLibrary("Dll1.dll");//加载DLL文件

  DllAdd dllAddFunc = (DllAdd)GetProcAddress(hDll, "funAdd");

  double value = dllAddFunc(args[0].As<Number>()->Value(), args[1].As<Number>()->Value());

  Local<Number> num = Number::New(isolate, value);

  FreeLibrary(hDll);

  // 执行操作

  // 设置返回值 (使用传入的 FunctionCallbackInfo<Value>&)。

  args.GetReturnValue().Set(num);

}

// void Base64(const FunctionCallbackInfo<Value>& args) {

//   Isolate* isolate = args.GetIsolate();

//   typedef char *(*DllAdd)();

//   HINSTANCE hDll = LoadLibrary("Dll1.dll");//加载DLL文件

//   DllAdd dllBase64 = (DllAdd)GetProcAddress(hDll, "base64");

//   // args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"))

//   char* value = dllBase64();

//   Local<Value> picData = picData[0];
//   if (picData -> IsString()) {
//     Local<String> ss = picData -> ToString();
//   }

//   FreeLibrary(hDll);

//   // 执行操作

//   // 设置返回值 (使用传入的 FunctionCallbackInfo<Value>&)。

//   args.GetReturnValue().Set(String::NewFromUtf8(isolate, ss));

// }

// void Method(const FunctionCallbackInfo<Value>& args) {
//   Isolate* isolate = args.GetIsolate();
//   args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
// }

void Init(Local<Object> exports) {

    // 相当于js的 module.exports=add,每个函数必有

    NODE_SET_METHOD(exports, "add", Add);
    // NODE_SET_METHOD(exports, "base64", Base64);
    // NODE_SET_METHOD(exports, "hello", Method);

}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // 命名空间示例



// Napi::Value plus(const Napi::CallbackInfo& info) {
//     Napi::Env env = info.Env();
//     Napi::EscapableHandleScope scope(env);
//     //注，若动态库还有其他依赖库，请放在同一级目录下
//     auto m = LoadLibraryExA("Dll1.dll", NULL, LOAD_WITH_ALTERED_SEARCH_PATH);
//     typedef int(*MyMessageBoxA)(int, int);
//     auto box = (MyMessageBoxA)GetProcAddress(m, "funAdd");
//     auto a = info[0].As<Napi::Number>().DoubleValue();
//     auto b = info[1].As<Napi::Number>().DoubleValue();
//     auto n = box(a, b);
//     return Napi::Number::New(env, n);
// }