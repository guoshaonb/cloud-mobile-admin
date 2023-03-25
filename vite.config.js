/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-18 12:27:48
 * @LastEditors: 郭少
 * @LastEditTime: 2021-07-19 16:06:49
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vitePluginImport from 'vite-plugin-babel-import';
import path from 'path'

const baseUrl = {
  development: './',
  beta: './',
  release: './'
}

// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
  plugins: [
    vue()
    //取消element-plus的按需导入
    // vitePluginImport([{
    //     libraryName: 'element-plus',
    //     libraryDirectory: 'es',
    //     style(name) {
    //         return `element-plus/lib/theme-chalk/${name}.css`;
    //     },
    // }])
  ],
  base: baseUrl[mode],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-api-02.newbee.ltd/manage-api/v1',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/apis': {
        target: 'http://112.111.22.36:9009/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/apis/, '')
      },
      '/guoshao': {
        target: 'http://guoshao520.natapp1.cc/xingyue',
        changeOrigin: true, // 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
        rewrite: path => path.replace(/^\/guoshao/, '')
      }
    }
  }
})