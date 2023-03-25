<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入账户/手机号/设备IP" @searchDataBack="searchData"></Search>
			<el-radio-group v-model="radio">
				<el-radio label="all">全部</el-radio>
				<el-radio label="employ">空闲</el-radio>
				<el-radio label="noemploy">已占用</el-radio>
				<el-radio label="safeguard">维护中</el-radio>
			</el-radio-group>
			<el-popconfirm confirmButtonText='确定批量回收' cancelButtonText='不用了' icon="el-icon-info" iconColor="red"
				title="确定批量回收不用的设备吗？" @confirm="recyclesPhone" style="margin-left: 20px;">
				<template #reference>
					<el-button type="danger" icon="el-icon-delete-solid">批量回收不用的设备</el-button>
				</template>
			</el-popconfirm>
		</template>

		<CommonTable :isPc="isPc" @getPhonescreenBack="get_Scale_img" :tableData="tableData" :tableColumns="tableLabel"
			:page="currentPage" :rows="pageSize" :total="total" :loading="loading" :tableOption="tableOption"
			@sizeChange="sizeChange" @pageChange="pageChange" @clickButton="clickButton" @sortChange="sortChange">
		</CommonTable>
		<DialogCommon ref='dialog' :title="title" :propList="propList" :callBack="update_Phone" :statusList="statusList"
			:reload="getPhoneList" />
	</el-card>
</template>

<script>
	import {
		onMounted,
		onUnmounted,
		reactive,
		ref,
		toRefs,
		watch
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
		get_phone_img
	} from '@/api/common'
	import {
		getVal,
		fromSet,
		validateData,
		WebSocketInit,
		doSend,
		getPageIndex
	} from '@/utils/action'
	import { array_pro } from '@/utils/array_pro'
	import {
		pathMap,
		localGet,
		localSet
	} from '@/utils'
	import {
		useStore
	} from 'vuex'
	import $ from 'jquery'
	export default {
		name: 'PhoneManage',
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
			//编辑设备
			update(val) {
				this.updphone_Open(val)
			},
			//回收设备
			recycle(val) {
				this.phone_Reset(val.id)
			},
			//移除设备
			remfirm(val) {
				this.phone_Remove(val.id)
			},
			//刷新状态
			reload(val) {
				this.reload_Status(val)
			},
			//重连设备
			reconnect(val) {
				this.reconnect_Phone(val)
			}
		},
		setup() {
			const multipleTable = ref(null)
			const dialog = ref(null)
			const router = useRouter()
			const route = useRoute()
			const store = useStore()
			const state = reactive({
				isPc: true,
				userInfo: null,
				imgList: [],

				//------------表单模块------------
				title: "",
				id: "",
				propList: [{
					type: "text",
					label: "设备名称",
					name: "phone_name",
					value: ""
				}, {
					type: "text",
					label: "IP地址",
					name: "phone_ip",
					value: ""
				}, {
					type: "status",
					label: "设备状态",
					name: "phone_status",
					value: ""
				}],
				statusList: [{
					label: "空闲",
					value: 0
				}, {
					label: "已占用",
					value: 1
				}, {
					label: "维护中",
					value: 2
				}],
				gameId: 0,
				radio: "all",

				//------------表格模块------------
				loading: false,//表格状态
				total: 0,//数据总条数
				currentPage: 1, // 当前页
				pageSize: 5, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "设备id",
					param: "id"
				}, {
					label: "设备名称",
					param: "phone_name"
				},
				{
					label: "设备ip",
					param: "phone_ip",
				},
				{
					label: "对应手机架编号",
					param: "phone_id",
				},
				{
					label: "当前屏幕[点图预览]",
					fieldtype: "phonescreen",
					param: "phone_pic"
				},
				{
					label: "设备状态",
					fieldtype: "phone_status",
					param: "phone_status"
				},
				],

				// 表格操作
				tableOption: {
					label: "操作",
					width: "700",
					options: [{
						label: "刷新状态",
						type: "success",
						icon: "el-icon-refresh-right",
						methods: `reload`
					}, {
						label: "重连设备",
						type: "success",
						icon: "el-icon-refresh",
						methods: `reconnect`
					}, {
						label: "编辑设备",
						type: "primary",
						icon: "el-icon-edit",
						methods: `update`
					}],
					popconfirms: [{
						label: "回收设备",
						contit: "确定回收",
						title: "确定回收该设备吗？",
						buttype: "danger",
						titicon: "el-icon-delete",
						buticon: "el-icon-delete",
						methods: `recycle`
					}, {
						label: "移除设备",
						contit: "确定移除",
						title: "确定移除该设备吗？",
						buttype: "danger",
						titicon: "el-icon-delete",
						buticon: "el-icon-delete-solid",
						methods: `remfirm`
					}],
				},
				// 表格数据
				tableData: [],
				radio: "all",//内容选项
				search: "",//搜索内容
			})

			watch(() => route.query.gameId, (path) => {
				if (route.path == "/gamephonemanage") {
					state.gameId = route.query.gameId
					getUserInfo()
					getPhoneList()
				}
			})

			watch(() => state.radio, (val) => {
				getPhoneList()
			})

			onMounted(() => {
				setTimeout(() => {
					state.currentPage = getPageIndex() || 1
					if ($(window).width() < 1200) {
						state.isPc = false
					}
					state.gameId = route.query.gameId
					getUserInfo()
					getPhoneList()
					WebSocketInit()
				}, 200)
			})

			onUnmounted(() => {
				store.commit('delPageIndex')
			})

			const getUserInfo = async () => {
				state.userInfo = store.getters.getUser
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
				}, 1000)
			}

			const successReload = (text) => {
				state.radio = "all"
				text && ElMessage.success(text);
				dialog.value.close()
				getPhoneList()
			}

			// 获取设备列表
			const getPhoneList = () => {
				loadingFunc()
				gs_Api.yun_games_get_one(state.gameId, state.search, state.radio, state.currentPage, state.pageSize).then(res => {
					if (res) {
						if (res.code == 200) {
							const isRelease = location.href.includes("guoshao520.com")
								? 'xingyue' : 'guoshao'
							state.tableData = res.data
							state.total = res.count
							//获取当前的设备屏幕
							for (let i = 0; i < state.tableData.length; i++) {
								const urlStr = "/" + isRelease +
								  "/api/v1/phoneall/screen/?ip=" +
									state.tableData[i].phone_ip +
									"&urll=snapshot1&t=" +
									new Date().getTime()
								let ips = state.tableData[i].phone_ip.split(".")
								let bianhao = parseInt((ips[2] - 1) * 2) + parseInt(ips[3])
								state.tableData[i].phone_id = "云" + bianhao
								get_phone_img(urlStr, res => {
									if (res != "no") {
										console.log(res)
										let src = window.URL.createObjectURL(res)
										state.tableData[i].phone_pic = src
										state.imgList.push({
											id: state.tableData[i].id,
											src: src,
											phone_name: state.tableData[i].phone_name,
											phone_ip: state.tableData[i].phone_ip
										})
									}
								})
							}
						}
					}
				})
			}
			// 选择项
			const handleSelectionChange = (val) => {
				state.multipleSelection = val
			}
			const changePage = (val) => {
				state.currentPage = val
				store.commit('setPageIndex', val)
				getPhoneList()
			}

			//编辑设备-->打开
			const updphone_Open = (row) => {
				state.title = "编辑设备"
				state.id = row.id
				fromSet(state, "propList", ["phone_name", "phone_ip", "phone_status"], row)
				dialog.value.open()
			}

			//编辑设备-->执行
			const update_Phone = (val) => {
				const phone_name = getVal(val, "phone_name")
				const phone_ip = getVal(val, "phone_ip")
				const homeat_group_name = getVal(val, "homeat_group_name")
				const phone_status = getVal(val, "phone_status")
				let data = {
					phone_name: phone_name,
					phone_ip: phone_ip,
					homeat_group_name: homeat_group_name,
					phone_status: phone_status
				}
				//数据校验
				if (validateData(data)) {
					gs_Api.phone_list_upd(state.id, $qs.stringify(data)).then(res => {
						if (res.code == 200) {
							successReload("编辑设备成功！")
						}
					})
				}
			}

			//回收设备
			const phone_Reset = (id) => {
				gs_Api.phone_list_rst(id).then(res => {
					if (res.code == 200) {
						successReload("回收成功！")
					}
				})
			}

			//批量回收设备
			const recyclesPhone = () => {
				array_pro() //数组原型方法绑定
				ElMessage.warning(`请耐心等待30秒哦，系统正在批量回收...`);
				setTimeout(() => {
					let recycles = []
					let remphids = []
					let remphusers = []
					gs_Api.user_list().then(res => {
						if (res.code == 200) {
							for (let i in res.data) {
								setTimeout(() => {
									gs_Api.order_list_get(res.data[i].username).then(res => {
										if (res.code == 200) {
											let {
												rows: data
											} = res.data
											if (data) {
												let last_phone = data[data.length - 1]
												if (last_phone) {
													let curTimeDate = new Date().getTime()
													let expirTimeDate = new Date(last_phone.expiration_date).getTime()
													if (((curTimeDate - expirTimeDate) > 24 * (60000 * 60 * 3)) 
														&& !last_phone.is_expire) {
														recycles.push(last_phone.game_phone.phone_ip)
														remphids[last_phone.game_phone.id] = last_phone.game_phone.phone_ip
														remphusers[last_phone.game_phone.id] = last_phone.user.username
													}
												}
											}
										}
									})
								}, 150 * i)
							}
							let remphids_k = []
							setTimeout(() => {
								recycles = recycles.unIque()
								for (let key in remphids) {
									if (recycles.includes(remphids[key])) {
										remphids_k.push(key)
									}
								}
								for (let i in remphids_k) {
									let id = remphids_k[i]
									if (typeof id == "string") {
										gs_Api.phone_list_rst(id).then(res => {
											if (res.code == 200) {
												ElMessage.success(`编号为${id}的回收成功！`);
											}
										})
									}
								}
								setTimeout(() => {
									successReload(`全部回收成功！`)
								}, 200 * remphids_k.length + 1000)

							}, 150 * res.data.length + 1000)
						}
					})
				}, 2000)
			}

			//移除设备
			const phone_Remove = (id) => {
				gs_Api.phone_list_del(id).then(res => {
					if (res.code == 200) {
						successReload("移除成功！")
					}
				})
			}

			//查看大图
			const get_Scale_img = (id) => {
				console.log(JSON.stringify(state.imgList))
				router.push({
					path: "/scaleimg",
					query: {
						id: id,
						pageIndex: getPageIndex(),
						imgList: JSON.stringify(state.imgList)
					}
				})
			}

			//刷新状态
			const reload_Status = (row) => {
				//获取当前的设备屏幕
				for (let i = 0; i < state.tableData.length; i++) {
					if (row.id == state.tableData[i].id) {
						const is_kaifa = location.host.indexOf("xingyue.xin") != -1
						const urlPrefix = is_kaifa ? "/apis/apis" : "/yunserapis/apis/apis"
						const urlStr = urlPrefix +
							"/screen/?ip=" +
							state.tableData[i].phone_ip +
							"&urll=snapshot1&t=" +
							new Date().getTime()
						get_phone_img(urlStr, res => {
							let src = window.URL.createObjectURL(res)
							state.tableData[i].phone_pic = src
							state.imgList.push({
								id: state.tableData[i].id,
								src: src,
								phone_name: state.tableData[i].phone_name,
								phone_ip: state.tableData[i].phone_ip
							})
							ElMessage.success('设备状态已刷新！')
						})
						break;
					}
				}
			}

			//重连设备
			const reconnect_Phone = (row) => {
				ElMessage.success('重连设备成功！')
				console.log("这里了--------------》", row.phone_ip)
				doSend("rebinding:" + row.phone_ip + "'")
			}

			//查询数据
			const searchData = (val) => {
				state.search = val
				getPhoneList()
			}
			return {
				...toRefs(state),
				multipleTable,
				handleSelectionChange,
				getPhoneList,
				changePage,
				dialog,
				updphone_Open,
				update_Phone,
				phone_Reset,
				phone_Remove,
				recyclesPhone,
				get_Scale_img,
				reload_Status,
				reconnect_Phone,
				searchData
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

	/*图片预览 缩略图*/

	.preview figure {
		float: left;
		width: 30%;
		height: calc(30vw - 0px);
		margin: 1.5%;
	}

	.preview figure img {
		width: 100%;
	}
</style>