import {
	createApp
} from 'vue'
import * as Sentry from "@sentry/browser";
import {
	Integrations
} from "@sentry/tracing";

import App from './App.vue'
import router from './router/index'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
// 修改后的主题样式必须放在最后面
import '../theme/index.css'
// 导入请求
import gs_Api from "./api/index";
import Qs from 'qs'
window.gs_Api = gs_Api
window.$qs = Qs

const orderStatus = {
	0: '待支付',
	1: '已支付',
	2: '配货完成',
	3: '出库成功',
	4: '交易成功',
	'-1': '手动关闭',
	'-2': '超时关闭',
	'-3': '商家关闭'
}

const app = createApp(App)
// 全局过滤器
app.config.globalProperties.$filters = {
	orderMap(status) {
		return orderStatus[status] || '未知状态'
	},
	prefix(url) {
		if (url && url.startsWith('http')) {
			return url
		} else {
			url = `http://backend-api-02.newbee.ltd${url}`
			return url
		}
	},
	resetImgUrl(imgObj, imgSrc, maxErrorNum) {
		if (maxErrorNum > 0) {
			imgObj.onerror = function () {
				resetImgUrl(imgObj, imgSrc, maxErrorNum - 1)
			}
			setTimeout(function () {
				imgObj.src = imgSrc
			}, 500)
		} else {
			imgObj.onerror = null
			imgObj.src = imgSrc
		}
	}
}

import DialogCommon from '@/components/DialogCommon.vue'
import CommonTable from "@/components/CommonTable.vue"
import Search from '@/components/Search.vue'

// 注册全局组件
app.component('DialogCommon', DialogCommon)
app.component('CommonTable', CommonTable)
app.component('Search', Search)

app.use(router)
	.use(Search)
	.use(store)
	.use(ElementPlus)
Sentry.init({
	dsn: "https://f866b695d21d467ba523f1adf14e0a24@o584908.ingest.sentry.io/5737358",
	integrations: [new Integrations.BrowserTracing()],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
});


app.mount('#app')
