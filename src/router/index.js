/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-18 12:27:48
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-25 21:23:47
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
    routes: [{
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () =>
            import('../views/Index.vue')
    },
    {
        path: '/login',
        name: 'login',
        component: () =>
            import('../views/Login.vue')
    },
    {
        path: '/usermanage',
        name: 'usermanage',
        component: () =>
            import('../views/UserManage.vue')
    },
    {
        path: '/usermanage_child',
        name: 'usermanage_child',
        component: () =>
            import('../views/UserManage_Child.vue')
    },
    {
        path: '/allphonemanage',
        name: 'allphonemanage',
        component: () =>
            import('../views/AllPhoneManage.vue')
    },
    {
        path: '/gamephonemanage',
        name: 'gamephonemanage',
        component: () =>
            import('../views/GamePhoneManage.vue')
    },
    {
        path: '/gamemanage',
        name: 'gamemanage',
        component: () =>
            import('../views/GameManage.vue')
    },
    {
        path: '/announcemanage',
        name: 'announcemanage',
        component: () =>
            import('../views/AnnounceManage.vue')
    },
    {
        path: '/userlogmanage',
        name: 'userlogmanage',
        component: () =>
            import('../views/UserLogManage.vue')
    },
    {
        path: '/recharge_integral',
        name: 'recharge_integral',
        component: () =>
            import('../views/Recharge_Integral.vue')
    },
    {
        path: '/order_integral',
        name: 'order_integral',
        component: () =>
            import('../views/Order_Integral.vue')
    },
    {
        path: '/account',
        name: 'account',
        component: () =>
            import('../views/Account.vue')
    },
    {
        path: '/personal',
        name: 'personal',
        component: () =>
            import('../views/Personal.vue')
    },
    {
        path: '/retrieve',
        name: 'retrieve',
        component: () =>
            import('../views/Retrieve.vue')
    },
    {
        path: '/empty',
        name: 'empty',
        component: () =>
            import('../views/Empty.vue')
    },
    {
        path: '/scaleimg',
        name: 'scaleimg',
        component: () =>
            import('../views/ScaleImg.vue')
    },
    {
        path: '/wxprogram',
        name: 'wxprogram',
        component: () =>
            import('../views/Wxprogram.vue')
    },
    ]
})

export default router