#pragma once
#include<iostream>
extern "C"
{
    __declspec(dllexport) int funAdd(int a, int b);
	__declspec(dllexport) char* base64();
}