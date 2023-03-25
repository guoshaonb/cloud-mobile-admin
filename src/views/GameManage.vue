<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入游戏名" @searchDataBack="searchData"></Search>
			<el-button type="success" @click="inspListOpen" icon="el-icon-document-add">新建云游戏</el-button>
		</template>

		<CommonTable :phone_value="phone_value" :phone_list="phone_list" :tableData="tableData" :tableColumns="tableLabel"
			:page="currentPage" :rows="pageSize" :total="total" :loading="loading" :tableOption="tableOption"
			@sizeChange="sizeChange" @pageChange="pageChange" @clickButton="clickButton" @sortChange="sortChange">
		</CommonTable>
		<DialogCommon ref='dialog1' width="800px" :title="title" :propList="propList1" :callBack="update_List"
			:reload="getGameList" />
		<DialogCommon ref='dialog2' width="800px" :title="title" :propList="propList2" :callBack="insert_List"
			:reload="getGameList" />
	</el-card>
</template>

<script>
	import {
		onMounted,
		onUnmounted,
		reactive,
		ref,
		toRefs
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
		getPageIndex
	} from '@/utils/action'
	import {
		useStore
	} from 'vuex'
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
			//编辑云游戏
			update(val) {
				this.updpListOpen(val)
			},
			//删除云游戏
			delfirm(val) {
				this.game_Remove(val.id)
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
				value: "",
				game_name: "",

				//------------表单模块------------
				title: "",
				id: "",
				propList1: [{
					type: "text",
					label: "游戏名",
					name: "game_name",
					value: ""
				}, {
					type: "number",
					label: "排序值",
					name: "sort",
					value: ""
				}, {
					type: "list",
					label: "分配设备",
					name: "phone_list",
					value: ""
				}, {
					type: "file",
					label: "游戏logo",
					name: "game_logo",
					value: ""
				}, {
					type: "textarea",
					label: "游戏介绍",
					name: "game_introduce",
					value: ""
				}],
				propList2: [{
					type: "text",
					label: "游戏名",
					name: "game_name",
					value: ""
				}, {
					type: "number",
					label: "排序值",
					name: "sort",
					value: "",
				}, {
					type: "file",
					label: "游戏logo",
					name: "game_logo",
					value: ""
				}, {
					type: "textarea",
					label: "游戏介绍",
					name: "game_introduce",
					value: ""
				},],
				phone_list: {},
				phone_value: "",
				search: "",

				//------------表格模块------------
				loading: false,//表格状态
				total: 0,//数据总条数
				currentPage: 1, // 当前页
				pageSize: 10, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "ID",
					param: "id"
				},
				{
					label: "游戏名",
					param: "game_name"
				},
				{
					label: "设备列表",
					fieldtype: "select",
					param: "phone_list"
				},
				{
					label: "排序值",
					param: "sort",
				}
				],
				// 表格操作
				tableOption: {
					label: "操作",
					options: [{
						label: "编辑游戏",
						type: "primary",
						icon: "el-icon-edit",
						methods: `update`
					}],
					popconfirms: [{
						label: "移除游戏",
						contit: "确定移除",
						title: "确定移除该云游戏吗？",
						titicon: "el-icon-delete",
						buttype: "danger",
						buticon: "el-icon-delete",
						methods: `delfirm`
					}]
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
					getGameList()
				}, 200)
			})

			onUnmounted(() => {
				store.commit('delPageIndex')
			})

			//查询数据
			const searchData = (val) => {
				state.search = val
				getGameList()
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
				getGameList()
			}

			// 获取游戏列表
			const getGameList = () => {
				loadingFunc()
				gs_Api.yun_games_get(state.search).then(res => {
					if (res.code == 200) {
						state.tableData = res.data
						state.total = res.data.length
						for (let i = 0; i < res.data.length; i++) {
							state.tableData[i].phone_list = []
							gs_Api.yun_games_get_one(state.tableData[i].id).then(res => {
								if (res.code == 200) {
									state.phone_list[state.tableData[i].id] = []
									for (let j = 0; j < res.data.length; j++) {
										state.phone_list[state.tableData[i].id].push({
											label: res.data[j].phone_ip,
											value: res.data[j].phone_ip
										})
									}
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
				getGameList()
			}

			//编辑游戏-->打开
			const updpListOpen = (row) => {
				state.title = "编辑游戏【注意：分配设备时，左移和右移，每次提交只能有一种操作】"
				fromSet(state, "propList1", ["game_name", "sort", "game_introduce"], row)
				state.id = row.id
				state.game_name = row.game_name
				dialog1.value.open()
				dialog1.value.setPhonesVal(row)
			}

			//编辑游戏-->执行
			const update_List = (val, start_value, end_value, values, imgUrl) => {

				//两边对比，来校验是创建还是移除
				let addProps = []
				let remProps = []
				let start_Props = []
				let end_Props = []
				for (let key in start_value) {
					start_Props.push(start_value[key])
				}
				for (let key in end_value) {
					end_Props.push(end_value[key])
				}
				//对比左边
				if (start_Props.length > end_Props.length) {
					for (let i = 0; i < start_Props.length; i++) {
						if (!end_Props.includes(start_Props[i])) {
							for (let key in values) {
								if (values[key] == start_Props[i]) {
									remProps.push(key)
									break;
								}
							}
						}
					}
				} else {
					//对比右边
					for (let key in end_value) {
						if (!start_value.hasOwnProperty(key)) {
							for (let key1 in values) {
								if (values[key1] == end_value[key]) {
									addProps.push(key1)
									break;
								}
							}
						}
					}
				}

				//分配操作
				if (addProps.length > 0) {
					if (remProps.length > 0) {
						ElMessage.error('左移和右移，每次提交只能有一种操作')
						return
					}
					gs_Api.phone_list_edits($qs.stringify({
						type: 0,
						ips: addProps.toString(),
						gameId: state.id,
						distri_game: state.game_name,
					}))
				}

				//移除操作
				if (remProps.length > 0) {
					if (addProps.length > 0) {
						ElMessage.error('左移和右移，每次提交只能有一种操作')
						return
					}
					gs_Api.phone_list_edits($qs.stringify({
						type: 1,
						ips: remProps.toString(),
						gameId: state.id
					}))
				}

				const baseUrl = 'http://guoshao-service.test.upcdn.net/file-path/'
				let data = {
					game_name: getVal(val, "game_name").trim(),
					sort: getVal(val, "sort"),
					game_logo: imgUrl ? (baseUrl + imgUrl) : '',
					game_introduce: getVal(val, "game_introduce")
				}

				if (data.sort < 1 || data.sort > 9) {
					ElMessage.error('排序值只能为1~9之间')
					return
				}
				gs_Api.yun_games_upd(state.id, $qs.stringify(data)).then(res => {
					if (res.code == 200) {
						successReload("编辑游戏成功！")
					}
				})

			}

			//新增云游戏-->打开
			const inspListOpen = () => {
				state.title = "新增云游戏"
				fromSet(state, "propList2", [], null)
				dialog2.value.open()
				dialog2.value.setPhonesVal(null)
			}

			//新增云游戏-->执行
			const insert_List = (val, start_value, end_value, values, imgUrl) => {
				const baseUrl = 'http://guoshao-service.test.upcdn.net/file-path/'
				let data = {
					game_name: getVal(val, "game_name").trim(),
					sort: getVal(val, "sort"),
					game_logo: imgUrl ? (baseUrl + imgUrl) : '',
					game_introduce: getVal(val, "game_introduce"),
				}
				if (!data.game_logo) {
					ElMessage.error('请上传游戏logo')
					return
				}
				if (!data.game_introduce) {
					ElMessage.error('请输入游戏介绍')
					return
				} else {
					if (data.game_introduce.length < 20) {
						ElMessage.error('游戏介绍的长度不得小于20个字')
						return
					}
				}
				if (data.sort < 1 || data.sort > 9) {
					ElMessage.error('排序值只能为1~9之间')
					return
				}
				gs_Api.yun_games_ins($qs.stringify(data)).then(res => {
					if (res.code == 200) {
						successReload("新增云游戏成功！")
					}
				})
			}

			//删除云游戏
			const game_Remove = (id) => {
				gs_Api.yun_games_del(id).then(res => {
					if (res.code == 200) {
						successReload('移除该云游戏成功！')
					}
				})
			}
			
			return {
				...toRefs(state),
				searchData,
				multipleTable,
				handleSelectionChange,
				getGameList,
				changePage,
				dialog1,
				dialog2,
				updpListOpen,
				update_List,
				inspListOpen,
				insert_List,
				game_Remove
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