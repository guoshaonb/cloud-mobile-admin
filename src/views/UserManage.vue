<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入账户/手机号" @searchDataBack="searchData"></Search>
			<el-button type="success" @click="insPagentOpen" icon="el-icon-document-add">注册代理</el-button>
		</template>

		<CommonTable :tableData="tableData" :tableColumns="tableLabel" :page="currentPage" :rows="pageSize" :total="total"
			:loading="loading" :tableOption="tableOption" @sizeChange="sizeChange" @pageChange="pageChange"
			@clickButton="clickButton" @sortChange="sortChange"></CommonTable>
		<DialogCommon ref='dialog' width="400px" :title="title" :propList="propList" :callBack="insert_Pagent"
			:reload="getUserList" />
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
			delete(val) {
				// 我是删除
				console.log(val);
			},
			update(val) {
				this.updpListOpen(val)
			},
			delfirm(val) {
				this.announce_remove(val.id)
			},
			copy(val) {
				this.copy_invite_code(val.user_id)
			},
			detail(val) {
				this.sel_reg_userlist(val.user_id)
			},
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

				//------------表格模块------------
				loading: false,//表格状态
				total: 0,//数据总条数
				currentPage: 1, // 当前页
				pageSize: 10, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "后台账号",
					param: "username"
				},
				{
					label: "昵称",
					param: "user_nickname",
					render: row => {
						return row.user_nickname ? row.user_nickname : "无"
					}
				},
				{
					label: "推广ID",
					param: "user_id",
				},
				{
					label: "当前云币",
					param: "balance",
					render: row => {
						return row.balance.toFixed(2)
					}
				},
				{
					label: "注册数",
					param: "register_count",
				},
				],
				// 表格操作
				tableOption: {
					label: "操作",
					width: 350,
					options: [{
						label: "复制邀请码",
						type: "warning",
						icon: "el-icon-share",
						methods: `copy`
					}, {
						label: "注册明细",
						type: "info",
						icon: "el-icon-tickets",
						methods: `detail`
					}],
				},
				// 表格数据
				tableData: [],
				radio: "all",//内容选项
				search: "",//搜索内容
			})

			const successReload = (text) => {
				text && ElMessage.success(text);
				dialog.value.close()
				getUserList()
			}

			onMounted(() => {
				setTimeout(() => {
					state.currentPage = getPageIndex() || 1
					if ($(window).width() < 1200) {
						state.isPc = false
					}
					getUserInfo()
					getUserList()
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

			// 获取用户列表
			const getUserList = () => {
				loadingFunc()
				if (state.userInfo.user_num == 0) {
					if (state.search) {
						gs_Api.user_list(state.search).then(res => {
							if (res.code == 200) {
								let level = res.data[0].user_num
								if (level == 1) {
									state.tableData = res.data
									state.total = res.data.length
									for (let i = 0; i < state.tableData.length; i++) {
										//获取每个用户下面的注册个数
										gs_Api.ag_us_list(res.data[i].user_id).then(msg => {
											state.tableData[i].register_count = msg.data.count
										})
									}
								} else if (level == 2) {
									router.push({
										path: '/usermanage_child',
										query: {
											invitation_code: res.data[0].invitation_code,
											tableData: JSON.stringify(res.data),
											total: res.data.length
										}
									})
								}
							}
						})
					} else {
						gs_Api.agent_list().then(res => {
							if (res.code == 200) {
								const {
									rows: data,
									count
								} = res.data
								state.tableData = data
								state.total = count
								for (let i = 0; i < state.tableData.length; i++) {
									//获取每个用户下面的注册个数
									gs_Api.ag_us_list(data[i].user_id).then(msg => {
										state.tableData[i].register_count = msg.data.count
									})
								}
							}
						})
					}
				} else if (state.userInfo.user_num == 1) {
					router.push({
						path: '/usermanage_child',
						query: {
							invitation_code: state.userInfo.user_id
						}
					})
				}
			}

			// 选择项
			const handleSelectionChange = (val) => {
				state.multipleSelection = val
			}

			const changePage = (val) => {
				state.currentPage = val
				getUser_childList()
			}

			const handleSolve = () => {
				if (!state.multipleSelection.length) {
					ElMessage.error('请选择项')
					return
				}
				axios.put(`/users/0`, {
					ids: state.multipleSelection.map(item => item.userId)
				}).then(() => {
					ElMessage.success('解除成功')
					getUser_childList()
				})
			}
			
			const handleForbid = () => {
				if (!state.multipleSelection.length) {
					ElMessage.error('请选择项')
					return
				}
				axios.put(`/users/1`, {
					ids: state.multipleSelection.map(item => item.userId)
				}).then(() => {
					ElMessage.success('禁用成功')
					getUser_childList()
				})
			}

			//复制邀请链接
			const copy_invite_url = (invite_code) => {
				ElMessage.success('邀请链接已复制！')
				copyContent(store.state.envirUrl + invite_code)
			}

			//复制邀请码
			const copy_invite_code = (invite_code) => {
				ElMessage.success('邀请码已复制！')
				let invite_text = invite_code //encodeURI("星" + invite_code + "月云")
				copyContent(invite_text)
			}

			//查看注册明细
			const sel_reg_userlist = (invitation_code) => {
				router.push({
					path: '/usermanage_child',
					query: {
						invitation_code: invitation_code
					}
				})
				console.log(invitation_code)
			}

			//注册代理-->打开
			const insPagentOpen = () => {
				state.title = "注册代理"
				fromSet(state, "propList", [], null)
				dialog.value.open()
			}

			//注册代理-->执行
			const insert_Pagent = async (val) => {
				//获取随机昵称
				gs_Api.numnickname_get().then(res => {
					let user_nickname = res.data.name
					const username = getVal(val, "username")
					const password = getVal(val, "password")
					const password_new = getVal(val, "password_new")
					const invitation_code = state.userInfo.user_id
					let data = {
						username: username,
						password: password,
						user_nickname: user_nickname,
						invitation_code: invitation_code,
						user_num: 1
					}
					//数据校验
					if (validateData(data, "register")) {
						register(data, () => {
							successReload("注册代理成功！")
						})
					}
				})
			}

			//查询数据
			const searchData = (val) => {
				state.search = val
				getUserList()
			}

			return {
				...toRefs(state),
				dialog,
				multipleTable,
				handleSelectionChange,
				getUserList,
				changePage,
				handleSolve,
				handleForbid,
				copy_invite_url,
				copy_invite_code,
				sel_reg_userlist,
				insPagentOpen,
				insert_Pagent,
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
</style>