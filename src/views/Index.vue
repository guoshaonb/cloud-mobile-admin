<template>
	<el-card class="introduce">
		<div class="order">
			<el-card class="order-item">
				<template #header>
					<div class="card-header">
						<span>用户总数</span>
					</div>
				</template>
				<div class="item">{{user_count}}</div>
			</el-card>
			<el-card class="order-item">
				<template #header>
					<div class="card-header">
						<span>日增人数</span>
					</div>
				</template>
				<div class="item">{{user_dayadds}}</div>
			</el-card>
			<el-card class="order-item">
				<template #header>
					<div class="card-header">
						<span>总购设备数</span>
					</div>
				</template>
				<div class="item">{{buy_phones_count}}</div>
			</el-card>
			<el-card class="order-item">
				<template #header>
					<div class="card-header">
						<span>日购设备</span>
					</div>
				</template>
				<div class="item">{{buy_phones_dayadds}}</div>
			</el-card>
		</div>
		<div id="zoom"></div>
	</el-card>
</template>

<script>
	import {
		onMounted,
		onUnmounted,
		reactive,
		ref,
		toRefs,
		toRef
	} from 'vue'
	import {
		getDates
	} from '@/utils/action'
	import {
		useRoute,
		useRouter
	} from 'vue-router'
	import {
		useStore
	} from "vuex"
	let myChart = null
	export default {
		name: 'Index',
		mounted() {
			this.openFullScreen()
		},
		methods: {
			openFullScreen() {
				const loading = this.$loading({
					lock: true,
					text: '正在拼命加载，请稍后',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.7)'
				});
				setTimeout(() => {
					loading.close();
				}, 1000);
			}
		},
		setup() {
			const store = useStore()
			const route = useRoute()
			const router = useRouter()
			const state = reactive({
				user_count: 0,
				user_dayadds: 0,
				buy_phones_count: 0,
				buy_phones_dayadds: 0,
				data_list: [],
				user_weekadds: [],
				buy_phones_weekadds: [],
				userInfo: null
			})

			const getUserInfo = async () => {
				state.userInfo = store.getters.getUser
			}

			onMounted(() => {
				getUserInfo()
				if (state.userInfo.user_num != 0) {
					router.push({
						path: "/usermanage"
					})
					return
				}
				//获取用户总数
				gs_Api.user_count().then(res => {
					console.log(res.data)
					state.user_count = res.data
				}).then(res => {
					//获取日增人数
					gs_Api.user_dayadds().then(res => {
						state.user_dayadds = res.data
					})
				}).then(res => {
					//获取总购设备数
					gs_Api.buy_phones_count().then(res => {
						state.buy_phones_count = res.data
					})
				}).then(res => {
					//获取今日购设备数
					gs_Api.buy_phones_dayadds().then(res => {
						state.buy_phones_dayadds = res.data
					})
				}).then(res => {
					//获取当前一周的日期列表
					state.data_list = getDates(new Date())
				}).then(res => {
					//获取本周的新增数据列表
					gs_Api.user_weekadds().then(res => {
						console.log(res.data)
						state.user_weekadds = res.data
					})
				}).then(res => {
					//获取本周购买设备日增
					gs_Api.buy_phones_weekadds().then(res => {
						console.log(res.data)
						state.buy_phones_weekadds = res.data
					})
				}).then(res => {
					setTimeout(() => {
						//渲染数据
						console.log("data_list:" + state.data_list)
						console.log("user_weekadds:" + state.user_weekadds)
						console.log("buy_phones_weekadds:" + state.buy_phones_weekadds)
						if (window.echarts) {
							// 基于准备好的dom，初始化echarts实例
							myChart = window.echarts.init(document.getElementById('zoom'))
							// 指定图表的配置项和数据
							const option = {
								title: {
									text: '云数据走向'
								},
								tooltip: {
									trigger: 'axis',
									axisPointer: {
										type: 'cross',
										label: {
											backgroundColor: '#6a7985'
										}
									}
								},
								legend: {
									data: ['日增用户', '日购设备']
								},
								toolbox: {
									feature: {
										saveAsImage: {}
									}
								},
								grid: {
									left: '3%',
									right: '4%',
									bottom: '3%',
									containLabel: true
								},
								xAxis: [{
									type: 'category',
									boundaryGap: false,
									data: state.data_list
								}],
								yAxis: [{
									type: 'value'
								}],
								series: [{
									name: '日增用户',
									type: 'line',
									stack: '总量',
									areaStyle: {},
									emphasis: {
										focus: 'series'
									},
									data: state.user_weekadds
								}, {
									name: '日购设备',
									type: 'line',
									stack: '总量',
									areaStyle: {},
									emphasis: {
										focus: 'series'
									},
									data: state.buy_phones_weekadds
								}]
							}

							// 使用刚指定的配置项和数据显示图表。
							myChart.setOption(option)
						}
					}, 1000)
				})
			})
			onUnmounted(() => {
				if (state.userInfo.user_num == 0) {
					myChart.dispose()
				}
			})

			return {
				...toRefs(state)
			}
		}
	}
</script>

<style scoped>
	.introduce .order {
		display: flex;
		margin-bottom: 50px;
	}

	.introduce .order .order-item {
		flex: 1;
		margin-right: 20px;
	}

	.introduce .order .order-item:last-child {
		margin-right: 0;
	}

	#zoom {
		min-height: 300px;
	}
</style>