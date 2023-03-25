/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-18 17:46:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-30 00:12:41
 */
// 模块接口文件，暴漏给外部模块使用

// 导入核心模块
import { request } from "../utils/request/core";
// 导入请求方式
import METHODS from "../utils/request/methods";
// 导入请求接口
import URL from "../utils/request/url";
import { JSEncrypt } from 'jsencrypt'
import { getPageIndex } from '@/utils/action'
const apis = location.href.includes("guoshao520.com") ? "/xingyue/api/v1" : "/guoshao/api/v1"
const gs_Api = {

  /**
   --------------------数据走势--------------------
   */
  //获取用户总数
  user_count(params) {
    return request(METHODS.GET, apis + "/user/list/counts", params);
  },
  //获取购设备总数
  buy_phones_count(params) {
    return request(METHODS.GET, apis + "/game_phone/list/counts", params);
  },
  //获取当日新增用户
  user_dayadds(params) {
    return request(METHODS.GET, apis + "/user/list/today", params);
  },
  //获取今日购设备数
  buy_phones_dayadds(params) {
    return request(METHODS.GET, apis + "/game_phone/list/today", params);
  },
  //获取本周的新增数据列表
  user_weekadds(params) {
    return request(METHODS.GET, apis + "/user/list/thisweek", params);
  },
  //获取本周购买设备日增
  buy_phones_weekadds(params) {
    return request(METHODS.GET, apis + "/game_phone/list/thisweek", params);
  },

  /**
   --------------------用户管理--------------------
   */
  //用户登录
  login(params) {
    return request(METHODS.POST, apis + "/user/login", params);
  },
  //注册代理
  register_agent(params) {
    return request(METHODS.POST, apis + "/user/register", params);
  },
  //随机昵称
  numnickname_get(params) {
    return request(METHODS.GET, apis + "/user/getnumnickname", params);
  },
  //编辑昵称
  nickname_upd(params) {
    return request(METHODS.PUT, apis + "/user/updnickname", params);
  },
  //修改密码
  update_password(user_id, params) {
    return request(METHODS.PUT, apis + "/user/updpass", params);
  },
  //设置安全问题
  set_safety_problem(params) {
    return request(METHODS.PUT, apis + "/user/setsafety", params);
  },
  //校验安全信息
  veri_safety_problem(params) {
    return request(METHODS.POST, apis + "/user/verisafety", params);
  },
  //重置密码
  user_reset_password(params) {
    return request(METHODS.PUT, apis + "/user/resetpass", params);
  },
  //恢复体验资格
  user_recoverexperience(params) {
    return request(METHODS.POST, apis + "/user/recoverexperience", params);
  },
  //短信通知
  user_sendnotice(params) {
    return request(METHODS.POST, apis + `/user/usersendnotice`, params);
  },
  //获取用户列表
  user_list(keyword = "") {
    return request(METHODS.GET, apis + `/user/list/?keyword=${keyword}`);
  },
  //获取代理列表
  agent_list(keyword = "", pageIndex = 1, pageSize = 10) {
    return request(METHODS.GET, apis + `/user/list/agents/?keyword=${keyword}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  //返回某个代理下面的用户列表
  ag_us_list(user_id, keyword = "", filterType = "", pageIndex = 1, pageSize = 10) {
    return request(METHODS.GET, apis + `/user/list/agents/users/${user_id}/?keyword=${keyword}&filterType=${filterType}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  //用户禁用 | 解除禁用
  user_forbidden(id, params) {
    return request(METHODS.PUT, apis + "/user/forbidden/" + id + "/", params);
  },
  //获取用户的当前状态
  user_status(params) {
    return request(METHODS.GET, apis + "/user/userstatus", params);
  },

  /**
  游戏管理
  */
  yun_games_get(keyword = "") {
    return request(METHODS.GET, apis + `/game/list/?keyword=${keyword}`);
  },
  yun_games_get_one(id, keyword = "", filterType = "", pageIndex = 1, pageSize = 10) {
    //IP地址正则
    var regexIP = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
    let search = !regexIP.test(keyword) ? `keyword=${keyword}` : `phone_ip=${keyword}`
    return request(METHODS.GET, apis + `/game/phonelist/${id}/?${search}&filterType=${filterType}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  yun_games_upd(id, params) {
    return request(METHODS.PUT, apis + "/game/update/" + id + "/", params);
  },
  yun_games_ins(params) {
    return request(METHODS.POST, apis + "/game/create", params);
  },
  yun_games_del(id, params) {
    return request(METHODS.DELETE, apis + "/game/delete/" + id + "/", params);
  },

  /**
  设备管理
  */
  //所有设备
  phone_all_get(keyword = "", phone_name = "", pageIndex = 1, pageSize = 10) {
    //IP地址正则
    var regexIP = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
    let search = !regexIP.test(phone_name) ? `phone_name=${phone_name}` : `phone_ip=${phone_name}`
    return request(METHODS.GET, apis + `/phoneall/list/?keyword=${keyword}&${search}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  phone_all_upd(id, params) {
    return request(METHODS.PUT, apis + "/phoneall/update/" + id + "/", params);
  },
  phone_all_ins(params) {
    return request(METHODS.POST, apis + "/phoneall/create/", params);
  },
  phone_all_del(id, params) {
    return request(METHODS.DELETE, apis + "/phoneall/delete/" + id + "/", params);
  },
  //游戏设备
  phone_list_get(id, params) {
    return request(METHODS.GET, apis + `/game_phone/list/`, params);
  },
  phone_list_upd(id, params) {
    return request(METHODS.PUT, apis + "/game_phone/update/" + id + "/", params);
  },
  phone_list_del(id, params) {
    return request(METHODS.DELETE, apis + "/game_phone/delete/" + id + "/", params);
  },
  phone_list_rst(id, params) {
    return request(METHODS.PUT, apis + "/game_phone/resetphone/" + id + "/", params);
  },
  phone_list_edits(params) {
    return request(METHODS.POST, apis + "/game_phone/edits/", params);
  },

  //云币系统
  //---------------------充值记录---------------------
  recharge_list_get(keyword = "", pageIndex = 1, pageSize = 10) {
    return request(METHODS.GET, apis + `/user/recharge/list/?keyword=${keyword}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  recharge_list_ins(params) {
    return request(METHODS.POST, apis + "/user/recharge/create", params);
  },
  //---------------------订单记录---------------------
  order_list_get(keyword = "", is_expire = "", pageIndex = 1, pageSize = 10) {
    return request(METHODS.GET, apis + `/user/order/list/?keyword=${keyword}&is_expire=${is_expire}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  order_list_ins(params) {
    return request(METHODS.POST, apis + "/user/order/create/", params);
  },
  order_list_upd(id, params) {
    return request(METHODS.PUT, apis + `/user/order/update/${id}`, params);
  },
  //---------------------设备价格---------------------
  price_list_get(params) {
    return request(METHODS.GET, apis + `/phoneprice/list/`, params);
  },
  price_list_upd(id, params) {
    return request(METHODS.PUT, apis + `/phoneprice/update/${id}`, params);
  },
  //---------------------公告管理---------------------
  announce_list_get(keyword = "") {
    return request(METHODS.GET, apis + `/announce/list/?keyword=${keyword}`);
  },
  announce_list_ins(params) {
    return request(METHODS.POST, apis + `/announce/create`, params);
  },
  announce_list_upd(id, params) {
    return request(METHODS.PUT, apis + `/announce/update/${id}`, params);
  },
  announce_list_del(id, params) {
    return request(METHODS.DELETE, apis + `/announce/delete/${id}`, params);
  },
  //---------------------日志管理---------------------
  user_log_get(keyword = "", pageIndex = 1, pageSize = 10) {
    return request(METHODS.GET, apis + `/user_log/list/?keyword=${keyword}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  user_log_del(id) {
    return request(METHODS.DELETE, apis + `/user_log/delete/${id}`);
  },
  //---------------------审核管理---------------------
  wxveri_get() {
    return request(METHODS.GET, apis + `/user/getveri/`);
  },
  wxveri_set(params) {
    return request(METHODS.PUT, apis + `/user/setveri/`, params);
  },
  //---------------------广告管理---------------------
  wx_getwatchc(params) {
    return request(METHODS.GET, apis + `/user/getwatchc/`, params);
  },
  wx_getclickc(params) {
    return request(METHODS.GET, apis + `/user/getclickc/`, params);
  },
};

export default gs_Api