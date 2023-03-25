<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入账户/手机号" @searchDataBack="searchData"></Search>
			<el-button @click="Recharge_open" type="success">充值云币</el-button>
			<el-button @click="set_Price_open" type="primary">设置手机价格</el-button>
		</template>

		<CommonTable :tableData="tableData" :tableColumns="tableLabel" :page="currentPage" :rows="pageSize" :total="total"
			:loading="loading" :tableOption="tableOption" @sizeChange="sizeChange" @pageChange="pageChange"
			@clickButton="clickButton" @sortChange="sortChange"></CommonTable>

		<DialogCommon ref='dialog1' width="400px" :title="title" :moneyList="moneyList" :propList="propList1"
			:callBack="rechargeSubmit" :reload="getIntegralList" />
		<DialogCommon ref='dialog2' width="400px" :title="title" :moneyLists="moneyLists" :oldmoneyLists="oldmoneyLists"
			:propList="propList2" :dredgeDates="dredgeDates" :callBack="set_PriceSubmit" :reload="getIntegralList" />
	</el-card>
</template>

<script>
	import {
		onMounted,
		reactive,
		ref,
		toRefs,
		watch,
		onUnmounted
	} from 'vue'
	import axios from '@/utils/axios'
	import {
		useRoute,
		useRouter
	} from 'vue-router'
	import {
		ElMessage
	} from 'element-plus'
	import {
		getVal,
		fromSet,
		validateData,
		copyContent,
		formatDateTime,
		getPageIndex
	} from '@/utils/action'
	import {
		register
	} from '@/api/common'
	import {
		pathMap,
		localGet
	} from '@/utils'
	import {
		useStore
	} from 'vuex'
	import $ from 'jquery'
	export default {
		name: 'UserManage',
		methods: {
			//-----------------------------------------表格事件-----------------------------------------
			// 切换当前一页展示多少条
			sizeChange(val) {
				this.pageSize = val;
				this.getIntegralList();
				console.log(`每页 ${val} 条`);
			},
			// 翻页
			pageChange(val) {
				this.changePage(val)
				console.log(`当前页: ${val}`);
			},
			// 点击事件
			clickButton(val) {
				// 调用事件
				this[val.methods](val.row);
			},
			// 排序
			sortChange(val) {
				console.log(val);
			}
		},
		setup() {
			const multipleTable = ref(null)
			const dialog1 = ref(null)
			const dialog2 = ref(null)
			const router = useRouter()
			const store = useStore()
			const state = reactive({
				isPc: true,
				userInfo: null,

				//------------表单模块------------
				title: "",
				propList: [{
					type: "text",
					label: "代理名",
					name: "username",
					value: ""
				}, {
					type: "password",
					label: "代理密码",
					name: "password",
					value: ""
				}, {
					type: "password",
					label: "确认密码",
					name: "password_new",
					value: ""
				}],
				propList1: [{
					type: "text",
					label: "账号/手机号",
					name: "username",
					value: ""
				}, {
					type: "money",
					label: "充值金额",
					name: "money",
					value: ""
				}],
				propList2: [{
					type: "dredge",
					label: "购买时长",
					name: "dredge_type",
					value: ""
				}, {
					type: "oldmoneys",
					label: "原来价格"
				}, {
					type: "moneys",
					label: "更新价格",
					name: "money",
					value: ""
				}],
				moneyList: [],
				moneyLists: [],
				oldmoneyLists: [],
				dredgeDates: [],

				//------------表格模块------------
				loading: false, //表格状态
				total: 0, //数据总条数
				currentPage: 1, // 当前页
				pageSize: 10, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "充值id",
					param: "recharge_id"
				},
				{
					label: "充值账户",
					param: "user.username",
					params: ["user", "username"]
				},
				{
					label: "手机号",
					param: "user.telephone",
					params: ["user", "telephone"]
				},
				{
					label: "充值时间",
					param: "createdAt",
					render: row => {
						return formatDateTime(new Date(row.createdAt))
					}
				},
				{
					label: "充值云币",
					param: "recharge_balance",
					render: row => {
						return row.recharge_balance.toFixed(2)
					}
				},
				{
					label: "当前云币",
					param: "after_balance",
					render: row => {
						return row.after_balance.toFixed(2)
					}
				},
				],
				// 表格操作
				tableOption: {

				},
				// 表格数据
				tableData: [],
				search: "", //搜索内容
			})

			const successReload = (text) => {
				text && ElMessage.success(text);
				dialog1.value.close()
				dialog2.value.close()
				getIntegralList()
			}

			onMounted(() => {
				setTimeout(() => {
					state.currentPage = getPageIndex() || 1
					if ($(window).width() < 1200) {
						state.isPc = false
					}
					getUserInfo()
					getMoneyList()
					getIntegralList()
				}, 200)
			})

			const getUserInfo = async () => {
				state.userInfo = store.getters.getUser
			}

			const formatDate = (dateStr) => {
				return formatDateTime(new Date(dateStr))
			}

			const getMoneyList = async () => {
				for (let i = 1; i <= 50; i++) {
					state.moneyList.push({
						label: `￥${(i * 20).toFixed(2)}元 = 【${(i * 20 * 10).toFixed(2)}云币】`,
						value: (20 * i).toFixed(2),
					})
				}
				let dredgeDates = {
					"体验版": 0,
					"周卡": 15,
					"1个月": 60,
					"3个月": 170,
					"1年": 600,
					"永久专享": 1000
				}
				let index = 0
				for (let key in dredgeDates) {
					state.dredgeDates.push({
						label: key,
						value: dredgeDates[key],
						index: index
					})
					index++
				}
				for (let key in state.dredgeDates) {
					state.moneyLists[key] = []
					for (let j = 1; j <= 10; j++) {
						let money = state.dredgeDates[key].value * (1 + (0.1 * j))
						state.moneyLists[key].push({
							label: `￥${(money).toFixed(2)}元 = 【${(money * 10).toFixed(2)}云币】`,
							value: (money * 10).toFixed(2),
						})
					}
				}

				//获取原来的价格列表
				gs_Api.price_list_get().then(res => {
					let oldmoneyLists = []
					res.data.forEach((item, index) => {
						state.oldmoneyLists[index] = (item.buy_price).toFixed(2)
					});
				})

				console.log(state.moneyLists, state.dredgeDates)
			}

			const loadingFunc = () => {
				state.loading = true
				setTimeout(() => {
					state.loading = false
					$(".el-pager li").each(function () {
						if ($(this).text() == state.currentPage) {
							$(this).addClass("active").click().siblings().removeClass("active")
						}
					})
				}, 500)
			}

			// 获取充值记录
			const getIntegralList = () => {
				loadingFunc()
				gs_Api.recharge_list_get(state.search, state.currentPage, state.pageSize).then(res => {
					if (res.code == 200) {
						const {
							rows: data,
							count
						} = res.data
						state.tableData = data
						state.total = count
					}
				})
			}

			const changePage = (val) => {
				state.currentPage = val
				store.commit('setPageIndex', val)
				getIntegralList()
			}

			//查询数据
			const searchData = (val) => {
				state.search = val
				getIntegralList()
			}

			//打开充值入口
			const Recharge_open = () => {
				state.title = "充值云币";
				dialog1.value.open()
			}

			//打开更新价格入口
			const set_Price_open = () => {
				state.title = "更新价格";
				dialog2.value.open()
			}

			//执行充值
			const rechargeSubmit = (val) => {
				const username = getVal(val, "username")
				const money = getVal(val, "money")
				let data = {
					username: username,
					recharge_balance: money
				}
				gs_Api.recharge_list_ins($qs.stringify(data)).then(res => {
					if (res.code == 200) {
						successReload("充值积分成功！")
					}
				})
			}

			//执行更新价格
			const set_PriceSubmit = (val, dredge_type) => {
				const money = getVal(val, "money")
				let data = {
					buy_price: money
				}
				gs_Api.price_list_upd(dredge_type + 1, $qs.stringify(data)).then(res => {
					if (res.code == 200) {
						successReload("更新价格成功！")
					}
				})
			}
			onUnmounted(() => {
				store.commit('delPageIndex')
			})
			
			return {
				...toRefs(state),
				dialog1,
				dialog2,
				multipleTable,
				getIntegralList,
				changePage,
				searchData,
				Recharge_open,
				set_Price_open,
				rechargeSubmit,
				set_PriceSubmit,
				formatDate
			}
		}
	}
</script>

<style scoped>
	.guest-container {
		min-height: 100%;
	}

	.el-card.is-always-shadow {
		min-height: 100% !important;
	}
</style>