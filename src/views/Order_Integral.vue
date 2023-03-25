<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入账户/手机号" @searchDataBack="searchData"></Search>
			<el-radio-group v-model="radio" style="margin-left: 20px;">
				<el-radio label="all">全部</el-radio>
				<el-radio label="no_expire">未过期</el-radio>
				<el-radio label="alr_expire">已过期</el-radio>
			</el-radio-group>
		</template>

		<CommonTable :tableData="tableData" :tableColumns="tableLabel" :page="currentPage" :rows="pageSize" :total="total"
			:loading="loading" :tableOption="tableOption" @sizeChange="sizeChange" @pageChange="pageChange"
			@clickButton="clickButton" @sortChange="sortChange"></CommonTable>
		<DialogCommon ref='dialog' :title="title" :propList="propList" :callBack="updateOrder" :reload="getOrderList" />
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
				this.getOrderList();
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
			},
			//编辑订单
			update(val) {
				this.updOrderOpen(val.user.telephone, val.game_phone.phone_ip, val)
			}
		},
		setup() {
			const multipleTable = ref(null)
			const dialog = ref(null)
			const router = useRouter()
			const store = useStore()
			const state = reactive({
				isPc: true,
				userInfo: null,

				//------------表单模块------------
				title: "",
				id: 0,
				propList: [{
					type: "text",
					label: "手机号",
					name: "telephone",
					value: "",
					disabled: true
				}, {
					type: "text",
					label: "设备ip",
					name: "phone_ip",
					value: "",
					disabled: true
				}, {
					type: "datetime",
					label: "到期时间",
					name: "expiration_date",
					value: ""
				}],

				//------------表格模块------------
				loading: false, //表格状态
				total: 0, //数据总条数
				currentPage: 1, // 当前页
				pageSize: 10, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "订单id",
					param: "order_id"
				},
				{
					label: "订单账户",
					param: "user.username",
					params: ["user", "username"]
				},
				{
					label: "手机号",
					param: "user.telephone",
					params: ["user", "telephone"]
				},
				{
					label: "订单价格",
					param: "order_price",
					render: row => {
						return row.after_balance.toFixed(2)
					}
				},
				{
					label: "购买设备ip",
					param: "game_phone.phone_name",
					params: ["game_phone", "phone_ip"]
				},
				{
					label: "当前云币",
					param: "after_balance",
					render: row => {
						return row.after_balance.toFixed(2)
					}
				},
				{
					label: "购买时长",
					param: "buy_duration"
				},
				{
					label: "到期时间",
					param: "expiration_date",
					render: row => {
						return formatDateTime(new Date(row.expiration_date))
					}
				},
				{
					label: "是否已过期",
					param: "is_expire",
					render: row => {
						if (row.is_expire) {
							return `已过期`
						} else {
							return `未过期`
						}
					}
				}
				],
				// 表格操作
				tableOption: {
					label: "操作",
					options: [{
						label: "编辑订单",
						type: "primary",
						icon: "el-icon-edit",
						methods: `update`
					}]
				},
				// 表格数据
				tableData: [],
				radio: "all", //内容选项
				search: "", //搜索内容
			})

			const successReload = (text) => {
				text && ElMessage.success(text);
				dialog.value.close()
				getOrderList()
			}

			watch(() => state.radio, (val) => {
				getOrderList()
			})

			onMounted(() => {
				setTimeout(() => {
					state.currentPage = getPageIndex() || 1
					if ($(window).width() < 1200) {
						state.isPc = false
					}
					getUserInfo()
					getOrderList()
				}, 200)
			})

			const getUserInfo = async () => {
				state.userInfo = store.getters.getUser
			}

			const formatDate = (dateStr) => {
				return formatDateTime(new Date(dateStr))
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

			// 获取订单记录
			const getOrderList = () => {
				loadingFunc()
				gs_Api.order_list_get(state.search, state.radio, state.currentPage, state.pageSize).then(res => {
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
				getOrderList()
			}

			//查询数据
			const searchData = (val) => {
				state.search = val
				getOrderList()
			}

			onUnmounted(() => {
				store.commit('delPageIndex')
			})

			//编辑订单 --打开
			const updOrderOpen = (telephone, phone_ip, row) => {
				state.title = "编辑订单"
				state.id = row.id
				row.telephone = telephone
				row.phone_ip = phone_ip
				fromSet(state, "propList", ["telephone", "phone_ip", "expiration_date"], row)
				dialog.value.open()
				console.log("这里了", 12345)
			}

			//编辑订单 --执行
			const updateOrder = (val) => {
				let telephone = getVal(val, "telephone")
				let expiration_date = getVal(val, "expiration_date")
				expiration_date = formatDateTime(new Date(expiration_date))
				gs_Api.order_list_upd(state.id, $qs.stringify({
					expiration_date: expiration_date
				})).then(res => {
					if (res.code == 200) {
						successReload(`编辑手机号为${telephone}的订单成功！`)
					}
				})
			}

			return {
				...toRefs(state),
				multipleTable,
				getOrderList,
				changePage,
				searchData,
				formatDate,
				dialog,
				updOrderOpen,
				updateOrder
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