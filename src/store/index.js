/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-25 16:11:14
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-29 16:10:08
 */
import { createStore } from 'vuex'
import { Base64 } from "js-base64"
// http://gs520.natapp1.cc/yunserver/file/screen/
let isExploit = location.href.includes("guoshao520.com")
export default createStore({
  state: {
    user: {},
    pageIndex: 1,
    mainUrl: `${isExploit ? "https://www.guoshao520.com/yun-admin/#/" : "/"}`,
    envirUrl: `${isExploit ? "https://www.guoshao520.com/" : "http://gs520.natapp1.cc/"}yun_phone/user/personal/login.html?invite_code=`,
    visualUrl: `${isExploit ? "https://www.guoshao520.com/yun-admin/" : "http://gs520.natapp1.cc/"}yun_trends/index.html`,
    imgPrefix: `${isExploit ? "https://www.guoshao520.com/images/screen/" : "https://www.guoshao520.com/images/screen/"}`
  },
  mutations: {
    // 存储user
    setUser(state, user) {
      const userStr = JSON.stringify(user)
      localStorage.user = Base64.encode(userStr);
    },
    // 存储安全问题
    setMytoken(state, token) {
      const userToken = JSON.stringify(token)
      localStorage.myreset = Base64.encode(userToken);
    },
    // 存储pageIndex
    setPageIndex(state, page) {
      const pageIndex = JSON.stringify(page)
      localStorage.pageIndex = Base64.encode(pageIndex);
    },
    // 清除username
    delUser(state) {
      state.user = {};
      localStorage.removeItem('user');
    },
    // 清除pageIndex
    delPageIndex(state) {
      state.pageIndex = 1;
      localStorage.removeItem('pageIndex');
    }
  },
  getters: {
    // 获取user方法
    getUser(state) {
      if (!state.user.username) {
        const user = window.localStorage.getItem('user')
        try {
          return JSON.parse(Base64.decode(user))
        } catch (error) {
          return user
        }
      } else {
        const user = state.user
        try {
          return JSON.parse(Base64.decode(user))
        } catch (error) {
          return user
        }
      }
    },
  },
  actions: {},
  modules: {}
});