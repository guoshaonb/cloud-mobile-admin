/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-19 20:48:32
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-04 15:22:45
 */
import gs_Api from './index'
import { localSet } from '@/utils'
import { ElMessage } from 'element-plus'

//用户登录
export function login(data, callBack) {
  gs_Api.login($qs.stringify({
    username: data.username,
    password: data.password,
  })).then(res => {
    if (res.code == 200) {
      if (res.data.user_num == 2) {
        ElMessage.error("登陆后台的权限不足！");
      } else {
        callBack(res)
      }
    }
  })
}

//注册代理
export function register(data, callBack) {
  gs_Api.register_agent($qs.stringify({
    username: data.username,
    password: data.password,
    user_nickname: data.user_nickname,
    invitation_code: data.invitation_code,
    user_num: data.user_num
  })).then(res => {
    if (res.code == 200) {
      ElMessage.success(res.message);
      callBack()
    }
  })
}

//修改密码
export function update_pass(data, callBack) {
  gs_Api.update_password(data.user_id, $qs.stringify({
    username: data.username,
    password_old: data.password_old,
    password_new: data.password_new,
    password_new2: data.password_new2,
  })).then(res => {
    if (res.code == 200) {
      ElMessage.success(res.message);
      callBack()
    }
  })
}

//重置密码
export function reset_pass(data, callBack) {
  gs_Api.user_reset_password($qs.stringify({
    username: data.username,
    password_new: data.password_new,
    password_new2: data.password_new2,
  })).then(res => {
    if (res.code == 200) {
      ElMessage.success(res.message);
      callBack()
    }
  })
}

//设置安全问题
export function set_safety_pro(data, callBack) {
  gs_Api.set_safety_problem($qs.stringify({
    username: data.username,
    safety_problem: data.safety_problem
  })).then(res => {
    if (res.code == 200) {
      ElMessage.success(res.message);
      callBack()
    }
  })
}

//校验安全问题
export function veri_safety_pro(data, callBack) {
  gs_Api.veri_safety_problem($qs.stringify({
    username: data.username,
    safety_problem: data.safety_problem
  })).then(res => {
    if (res.code == 200) {
      ElMessage.success(res.message);
      callBack && callBack(res)
    }
  })
}

//转换图片
export function get_phone_img(url, callBack) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(
    "GET",
    url,
    true
  );
  xmlhttp.responseType = "blob";
  xmlhttp.onload = function () {
    if (this.status == 200) {
      callBack && callBack(this.response)
    }
    if (this.status == 403) {
      callBack && callBack("no")
    }
  };
  xmlhttp.send();
}