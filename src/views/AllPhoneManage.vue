<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入设备名称/设备IP" @searchDataBack="searchData"></Search>
			<el-button type="success" @click="insphone_Open" icon="el-icon-document-add">新增设备</el-button>
		</template>

		<CommonTable :isPc="isPc" @getPhonescreenBack="get_Scale_img" :tableData="tableData" :tableColumns="tableLabel"
			:page="currentPage" :rows="pageSize" :total="total" :loading="loading" :tableOption="tableOption"
			@sizeChange="sizeChange" @pageChange="pageChange" @clickButton="clickButton" @sortChange="sortChange">
		</CommonTable>
		<DialogCommon ref='dialog1' :title="title" :propList="propList1" :callBack="update_Phone" :reload="getPhoneList" />
		<DialogCommon ref='dialog2' :title="title" :propList="propList2" :callBack="insert_Phone" :reload="getPhoneList" />
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
		get_phone_img
	} from '@/api/common'
	import {
		getVal,
		fromSet,
		validateData,
		getPageIndex
	} from '@/utils/action'
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
			//移除设备
			delfirm(val) {
				this.phone_Remove(val.id)
			},
			//刷新设备
			reload(val) {
				this.reload_Status(val)
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
				imgList: [],

				//------------表单模块------------
				title: "",
				id: "",
				propList1: [{
					type: "text",
					label: "设备名称",
					name: "phone_name",
					value: ""
				}, {
					type: "text",
					label: "IP地址",
					name: "phone_ip",
					value: ""
				}],
				propList2: [{
					type: "text",
					label: "设备名称",
					name: "phone_name",
					value: ""
				}, {
					type: "text",
					label: "IP地址",
					name: "phone_ip",
					value: ""
				}],

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
					label: "当前屏幕[点图预览]",
					fieldtype: "phonescreen",
					param: "phone_pic"
				},
				],
				// 表格操作
				tableOption: {
					label: "操作",
					width: "500",
					options: [{
						label: "刷新状态",
						type: "success",
						icon: "el-icon-refresh-right",
						methods: `reload`
					}, {
						label: "编辑设备",
						type: "primary",
						icon: "el-icon-edit",
						methods: `update`
					}],
					popconfirms: [{
						label: "移除设备",
						contit: "确定移除",
						title: "确定移除该设备吗？",
						buttype: "danger",
						titicon: "el-icon-delete",
						buticon: "el-icon-delete",
						methods: `delfirm`
					}],
				},
				// 表格数据
				tableData: [],
				radio: "all",//内容选项
				search: "",//搜索内容
			})

			onMounted(() => {
				setTimeout(() => {
					state.currentPage = getPageIndex() || 1
					if ($(window).width() < 1200) {
						state.isPc = false
					}
					getUserInfo()
					getPhoneList()
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
				}, 500)
			}

			const successReload = (text) => {
				text && ElMessage.success(text);
				dialog1.value.close()
				dialog2.value.close()
				getPhoneList()
			}

			// 获取设备列表
			const getPhoneList = () => {
				loadingFunc()
				gs_Api.phone_all_get("", state.search, state.currentPage, state.pageSize).then(res => {
					if (res.code == 200) {

						const {
							rows: data,
							count
						} = res.data
						const isRelease = location.href.includes("guoshao520.com") 
							? 'xingyue' : 'guoshao'
						state.tableData = data
						state.total = count

						//获取当前的设备屏幕
						for (let i = 0; i < state.tableData.length; i++) {
							const urlStr = "/" + isRelease +
							  "/api/v1/phoneall/screen/?ip=" +
								state.tableData[i].phone_ip +
								"&urll=snapshot1&t=" +
								new Date().getTime()
							get_phone_img(urlStr, res => {
								if (res != "no") {
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
				console.log("这里了", row)
				state.title = "编辑设备"
				state.id = row.id
				fromSet(state, "propList1", ["phone_name", "phone_ip"], row)
				dialog1.value.open()
			}

			//编辑设备-->执行
			const update_Phone = (val) => {
				const phone_name = getVal(val, "phone_name")
				const phone_ip = getVal(val, "phone_ip")
				let data = {
					phone_name: phone_name,
					phone_ip: phone_ip
				}
				//数据校验
				if (validateData(data)) {
					gs_Api.phone_all_upd(state.id, $qs.stringify(data)).then(res => {
						if (res.code == 200) {
							successReload("编辑设备成功！")
						}
					})
				}
			}

			//添加设备-->打开
			const insphone_Open = (row) => {
				state.title = "添加设备"
				fromSet(state, "propList2", [], row)
				dialog2.value.open()
			}

			//添加设备-->执行
			const insert_Phone = (val) => {
				const phone_name = getVal(val, "phone_name")
				const phone_ip = getVal(val, "phone_ip")
				let data = {
					phone_name: phone_name,
					phone_ip: phone_ip
				}
				//数据校验
				if (validateData(data)) {
					gs_Api.phone_all_ins($qs.stringify(data)).then(res => {
						if (res.code == 200) {
							successReload("添加设备成功！")
						}
					})
				}
			}

			//移除设备
			const phone_Remove = (id) => {
				gs_Api.phone_all_del(id).then(res => {
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
						const urlStr = "/guoshao/api/v1/phoneall/screen/?ip=" +
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
				dialog1,
				dialog2,
				updphone_Open,
				insphone_Open,
				update_Phone,
				insert_Phone,
				phone_Remove,
				get_Scale_img,
				reload_Status,
				searchData,
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