/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-18 17:48:45
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-19 16:08:28
 */
// 核心代码模块
// 引入axios
import axios from "axios";
// 导入请求方式
import METHODS from "./methods";
import { get_token, get_resettk } from "../action"
import { localRemove } from '@/utils'
import { ElMessage } from 'element-plus'
// 导入loadingl
// import { Loading } from "element-plus";
// 定义loading
var loadingInstance;
// 定义基础路径
const BASEURL = ""

// 创建 axios 配置实例
const token = get_token()
const resettk = get_resettk()
var service = axios.create({
  baseURL: BASEURL, //  默认会拼接到请求路径前面
  timeout: 6000, //  请求超时
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Bearer ' + (resettk ? resettk : token)
  }
});

// 请求发送前，弹出loading组件
// 添加请求拦截
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 弹出loading
    // loadingInstance = Loading.service({ fullscreen: true });
    return config;
  },
  error => {
    // 对请求错误做些什么
    // 提示用户错误信息
    return Promise.reject(error);
  }
);

// 请求结束后，收起loading组件
// 添加响应拦截器
service.interceptors.response.use(
  response => {
    if (response.data) {
      return response.data;
    }
  },
  error => {
    if (error.response) {
      setTimeout(() => {
        //登录状态过期
        if (error.response.data.err && error.response.data.code == 401) {
          if (error.response.data.err.message == "Authentication Error") {
            localRemove('user')
            localRemove('myreset')

            //重新返回登录
            setTimeout(() => {
              location.reload()
            }, 100)
          }
        } else {
          if (typeof error.response.data.message == "string") {
            ElMessage.warning(error.response.data.message);
          }
        }
      }, 1000)
    }
  }
);

// 请求方法
export function request(method, url, params) {

  console.log(method, url, params)
  switch (method) {
    case METHODS.GET:
      return GET(url, params);

    case METHODS.POST:
      return POST(url, params);

    case METHODS.PATCH:
      return PATCH(url, params);

    case METHODS.PUT:
      return PUT(url, params);

    case METHODS.DELETE:
      return DELETE(url, params);
  }
}

// 请求方式
function GET(url, params) {
  return service.get(url, params);
}

function POST(url, params) {
  return service.post(url, params);
}

function PATCH(url, params) {
  return service.patch(url, params);
}

function PUT(url, params) {
  return service.put(url, params);
}

function DELETE(url, params) {
  return service.delete(url, params);
}

// function PUT() { }