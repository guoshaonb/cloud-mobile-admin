/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-18 12:27:48
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-25 21:23:16
 */
export function localGet(key) {
  const value = window.localStorage.getItem(key)
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch (error) {
    return value
  }
}

export function localSet(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function localRemove(key) {
  window.localStorage.removeItem(key)
}

// 判断内容是否含有表情字符，现有数据库不支持。
export function hasEmoji(str = '') {
  const reg = /[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g;
  return str.match(reg) && str.match(reg).length
}

export const pathMap = {
  login: '登录',
  empty: '空界面',
  dashboard: '云系统事迹',
  usermanage: '用户管理',
  usermanage_child: '用户管理 > 子账号',
  allphonemanage: '所有设备',
  gamephonemanage: '游戏设备',
  gamemanage: '游戏管理',
  announcemanage: '公告管理',
  userlogmanage: '日志管理',
  scaleimg: "查看大图",
  account: '修改密码',
  personal: '个人资料',
  retrieve: '安全问题',
  recharge_integral: '充值查询',
  order_integral: '订单查询',
  wxprogram: '星月云手机'
}