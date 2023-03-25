<template>
  <el-config-provider :locale="locale">
    <slot name="app"></slot>
  </el-config-provider>
  <div class="layout">
    <el-container v-if="state.showMenu" class="container">
      <el-aside class="aside">
        <div class="head">
          <div>
            <img src="https://s.weituibao.com/1582958061265/mlogo.png" alt="logo">
            <span>星月云管理</span>
          </div>
        </div>
        <div class="line" />
        <el-menu :default-openeds="state.defaultOpen" background-color="#222832" text-color="#fff" :router="true"
          :default-active='state.currentPath'>
          <el-submenu index="1" v-show="state.userInfo && state.userInfo.user_num==0">
            <template #title>
              <i class="el-icon-house"></i>
              <span>系统首页</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/dashboard"><i class="el-icon-cloudy" />云系统事迹</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template #title>
              <i class="el-icon-menu"></i>
              <span>管理菜单</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/usermanage"><i class="el-icon-user" />用户管理</el-menu-item>
              <el-menu-item index="/gamemanage" v-if="state.userInfo && state.userInfo.user_num==0"><i
                  class="el-icon-goods" />游戏管理</el-menu-item>
              <el-menu-item index="/announcemanage" v-if="state.userInfo && state.userInfo.user_num==0"><i
                  class="el-icon-chat-dot-round" />公告管理</el-menu-item>
              <el-menu-item index="/userlogmanage" v-if="state.userInfo && state.userInfo.user_num==0"><i
                  class="el-icon-date" />日志管理</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <!-- 内部用户可以充值 -->
          <el-submenu index="3" v-show="state.userInfo && state.userInfo.username.indexOf('test')!=-1">
            <template #title>
              <i class="el-icon-s-help"></i>
              <span>云币系统</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/recharge_integral"><i class="el-icon-date"></i>充值查询</el-menu-item>
              <el-menu-item index="/order_integral"><i class="el-icon-shopping-cart-full"></i>订单查询
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="4" v-show="state.userInfo && state.userInfo.user_num==0">
            <template #title>
              <i class="el-icon-mobile-phone"></i>
              <span>设备系统</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/allphonemanage"><i class="el-icon-star-off"></i>所有设备</el-menu-item>
              <el-submenu index="4-1">
                <template #title><i class="el-icon-star-off"></i>游戏设备</template>
                <el-menu-item style="color: rgb(255, 255, 255);" v-for="(item,index) in state.gameList" :key="index"
                  index="4-1-1" @click="gotoGamePhone(item)">{{item.game_name}}</el-menu-item>
              </el-submenu>
              <el-submenu index="4-2">
                <template #title><i class="el-icon-star-off"></i>状态查看</template>
                <el-menu-item index="4-2-1" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('1')">1~10台
                </el-menu-item>
                <el-menu-item index="4-2-2" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('2')">11~20台
                </el-menu-item>
                <el-menu-item index="4-2-3" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('3')">21~30台
                </el-menu-item>
                <el-menu-item index="4-2-4" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('4')">31~40台
                </el-menu-item>
                <el-menu-item index="4-2-5" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('5')">41~50台
                </el-menu-item>
                <el-menu-item index="4-2-6" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('6')">51~60台
                </el-menu-item>
                <el-menu-item index="4-2-7" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('7')">61~70台
                </el-menu-item>
                <el-menu-item index="4-2-8" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('8')">71~80台
                </el-menu-item>
                <el-menu-item index="4-2-9" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('9')">81~90台
                </el-menu-item>
                <el-menu-item index="4-2-10" style="color: rgb(255, 255, 255);" @click="gotoGetPhones('10')">91~100台
                </el-menu-item>
              </el-submenu>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="5">
            <template #title>
              <i class="el-icon-setting"></i>
              <span>系统设置</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/account"><i class="el-icon-lock" />修改密码</el-menu-item>
              <el-menu-item index="/personal"><i class="el-icon-lock" />个人资料</el-menu-item>
              <el-menu-item index="/retrieve"><i class="el-icon-lock" />安全问题</el-menu-item>
              <el-menu-item v-show="state.userInfo && state.userInfo.user_num==0" index="/wxprogram"><i
                  class="el-icon-lock" />星月小程序</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container class="content">
        <Header />
        <div class="main">
          <router-view />
        </div>
        <Footer />
      </el-container>
    </el-container>
    <el-container v-else class="container">
      <router-view />
    </el-container>
  </div>
</template>

<script>
  import {
    onUnmounted,
    onMounted,
    reactive,
    watch,
    watchEffect
  } from 'vue'
  import Header from '@/components/Header.vue'
  import Footer from '@/components/Footer.vue'
  import {
    useRouter,
    useRoute
  } from 'vue-router'
  import {
    pathMap,
    localGet
  } from '@/utils'
  import {
    prohibit
  } from '@/utils/action'
  import {
    useStore
  } from 'vuex'
  import $ from 'jquery'
  //引入vue方法
  import {
    ElConfigProvider
  } from 'element-plus'
  //中文包
  import zhCn from 'element-plus/lib/locale/lang/zh-cn'
  import en from 'element-plus/lib/locale/lang/en'
  import ru from 'element-plus/lib/locale/lang/ru'
  export default {
    name: 'App',
    components: {
      Header,
      Footer,
      [ElConfigProvider.name]: ElConfigProvider
    },
    setup() {

      let locale = zhCn
      const noMenu = ['/login']
      const router = useRouter()
      const route = useRoute()
      const store = useStore()
      const state = reactive({
        // defaultOpen: ['1', '2', '3', '4'],
        gameList: [],
        showMenu: true,
        currentPath: '/dashboard',
        count: {
          number: 1
        },
        userInfo: null
      })

      const unwatch = router.beforeEach((to, from, next) => {
        state.userInfo = store.getters.getUser
        // 监听浏览器原生回退事件
        if (window.history && window.history.pushState) {
          history.pushState(null, null, document.URL);
          window.addEventListener('popstate', () => {
            if (!state.userInfo) {
              state.showMenu = false
            }
          }, false);
        }
        if (to.path == '/login' || to.path == '/retrieve') {
          // 如果路径是 /login 则正常执行
          next()
        } else {
          // 如果不是 /login，判断是否有登录
          if (!state.userInfo) {
            // 如果没有，则跳至登录页面
            next({
              path: '/login'
            })
          } else {
            // 否则继续执行
            next()
          }
        }
        state.showMenu = !noMenu.includes(to.path)
        state.currentPath = to.path
        document.title = pathMap[to.name]
      })

      onMounted(() => {
        setTimeout(() => {
          $("body .el-aside").css("width", "70px")
        }, 2000)
        //生产环境中：禁止打开控制台和ctrl + s
        location.host.indexOf("guoshao520.com") != -1 && prohibit()
        //获取游戏列表
        gs_Api.yun_games_get().then(res => {
          if (res && res.code == 200) {
            state.gameList = res.data
          }
        })
      })

      onUnmounted(() => {
        unwatch()
      })

      const gotoGamePhone = (item) => {
        router.push({
          path: "/gamephonemanage",
          query: {
            game_name: item.game_name,
            gameId: item.id
          }
        })
      }

      //查看云设备列表
      const gotoGetPhones = (index) => {
        window.open(`http://gs520.natapp1.cc/phone_gets/index${index}.html`)
      }

      //前往云可视化界面
      const gotoVisual = () => {
        window.open(`http://gs520.natapp1.cc/yun_trends/index.html`)
      }

      return {
        state,
        locale,
        gotoGamePhone,
        gotoGetPhones,
        gotoVisual
      }
    }
  }
</script>

<style scoped>
  .layout {
    min-height: 100vh;
    background-color: #ffffff;
  }

  .container {
    height: 100vh;
  }

  .aside {
    width: 200px !important;
    background-color: #222832;
    overflow: hidden;
    overflow-y: auto;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
  }

  .aside::-webkit-scrollbar {
    display: none;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
  }

  .head>div {
    display: flex;
    align-items: center;
  }

  .head img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .head span {
    font-size: 16px;
    color: #ffffff;
  }

  .line {
    border-top: 1px solid hsla(0, 0%, 100%, .05);
    border-bottom: 1px solid rgba(0, 0, 0, .2);
  }

  .content {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    overflow: hidden;
  }

  .main {
    height: calc(100vh - 75px);
    overflow: auto;
    padding: 10px;
  }
</style>
<style>
  body {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .el-menu {
    border-right: none !important;
  }

  .el-submenu {
    border-top: 1px solid hsla(0, 0%, 100%, .05);
    border-bottom: 1px solid rgba(0, 0, 0, .2);
  }

  .el-submenu:first-child {
    border-top: none;
  }

  .el-submenu [class^="el-icon-"] {
    vertical-align: -1px !important;
  }

  a {
    color: #409eff;
    text-decoration: none;
  }

  .el-pagination {
    text-align: center;
    margin-top: 20px;
  }

  .el-popper__arrow {
    display: none;
  }
</style>