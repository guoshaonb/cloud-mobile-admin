<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入App账号/手机号" @searchDataBack="searchData"></Search>
			<el-radio-group v-model="radio">
				<el-radio label="all">全部用户</el-radio>
				<el-radio label="common">普通用户</el-radio>
				<el-radio label="weixin">微信用户</el-radio>
			</el-radio-group>
			<el-button type="warning" @click="copy_invite_code" icon="el-icon-share" style="margin-left: 20px;">复制邀请码
			</el-button>
		</template>

		<CommonTable :tableData="tableData" :tableColumns="tableLabel" :page="currentPage" :rows="pageSize" :total="total"
			:loading="loading" :tableOption="tableOption" @sizeChange="sizeChange" @pageChange="pageChange"
			@clickButton="clickButton" @sortChange="sortChange"></CommonTable>
		<DialogCommon ref='dialog' :title="title" :propList="propList" :callBack="update_Pass"
			:reload="getUser_childList" />
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
		reset_pass
	} from '@/api/common'
	import {
		getVal,
		fromSet,
		validateData,
		copyContent,
		formatDateTime,
		getPageIndex
	} from '@/utils/action'
	import {
		useStore
	} from "vuex"
	import $ from 'jquery'
	export default {
		name: 'UserManage_Son',
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
			delfirm(val) {
				this.user_forbidden_start(val.id)
			},
			sucfirm(val) {
				this.user_forbidden_end(val.id)
			},
			reset(val) {
				this.updpass_Open(val)
			},
			recover(val) {
				this.covErexperience(val)
			},
			inform(val) {
				this.shortNote(val)
			},
		},
		setup() {
			const multipleTable = ref(null)
			const store = useStore()
			const dialog = ref(null)
			const router = useRouter()
			const route = useRoute()
			const state = reactive({
				loading: false,
				isPc: true,
				userInfo: {},

				//------------表单模块------------
				title: "",
				propList: [{
					type: "text",
					label: "账号名",
					name: "username",
					value: "",
					disabled: true
				}, {
					type: "password",
					label: "新密码",
					name: "password_new",
					value: ""
				}, {
					type: "password",
					label: "再次输入",
					name: "password_new2",
					value: ""
				}],
				radio: "all",
				isSearch: false,

				//------------表格模块------------
				loading: false,//表格状态
				total: 0,//数据总条数
				currentPage: 1, // 当前页
				pageSize: 10, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "APP账号",
					param: "username"
				},
				{
					label: "昵称",
					param: "user_nickname",
					render: row => {
						return row.user_nickname || "无"
					},
				},
				{
					label: "所属渠道",
					param: "invitation_code"
				},
				{
					label: "账户状态",
					param: "is_forbidden",
					render: row => {
						return !row.is_forbidden ? "正常" : "已禁用"
					},
				},
				{
					label: "手机号",
					param: "telephone"
				},
				{
					label: "当前云币",
					param: "balance",
					render: row => {
						return row.balance.toFixed(2)
					}
				},
				{
					label: "充值云币",
					param: "rec_balances",
					render: row => {
						return !row.rec_balances ? '0.00' : (row.rec_balances).toFixed(2)
					}
				},
				{
					label: "设备数",
					param: "phone_count",
				},
				{
					label: "注册日期",
					param: "createdAt",
					render: row => {
						return formatDateTime(new Date(row.createdAt))
					}
				},
				],

				// 表格操作
				tableOption: {
					label: "操作",
					width: "600",
					options: [],
					popconfirms: [{
						label: "禁用",
						contit: "坚决禁用",
						title: "确定禁用该用户吗？",
						titicon: "el-icon-delete",
						buttype: "danger",
						buticon: "el-icon-delete",
						methods: `delfirm`
					}, {
						label: "解除",
						contit: "确定解除",
						title: "确定解除该用户吗？",
						titicon: "el-icon-info",
						buttype: "success",
						buticon: "el-icon-unlock",
						methods: `sucfirm`
					}]
				},
				// 表格数据
				tableData: [],
				radio: "all",//内容选项
				search: "",//搜索内容
			})

			watch(() => state.radio, (val) => {
				getUser_childList()
			})

			onMounted(() => {
				setTimeout(() => {
					let { tableData, total } = route.query
					if (tableData) {
						state.tableData = tableData ? JSON.parse(tableData) : []
						state.total = total || 0
						state.isSearch = tableData ? true : false
						console.log("这里了哦", state.tableData, state.total)
						state.currentPage = getPageIndex() || 1
						if ($(window).width() < 1200) {
							state.isPc = false
						}
						setOption(true)
					} else {
						getUserInfo()
						setOption()
						getUser_childList()
					}

				}, 200)
			})

			const setOption = async (isSearch) => {
				if (state.userInfo.user_num == 0 || isSearch) {
					state.tableOption.options = [
						{
							label: "重置密码",
							type: "primary",
							icon: "el-icon-edit",
							methods: `reset`
						},
						{
							label: "恢复体验",
							type: "success",
							icon: "el-icon-loading",
							methods: `recover`
						},
						{
							label: "短信通知",
							type: "success",
							icon: "el-icon-notebook-2",
							methods: `inform`
						},
					]
					console.log("这里了", state.tableOption.options)
				}
			}

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
				dialog.value.close()
				getUser_childList()
			}

			const formatDate = (dateStr) => {
				return formatDateTime(new Date(dateStr))
			}

			// 获取用户列表
			const getUser_childList = () => {
				loadingFunc()
				const invitation_code = route.query.invitation_code
				gs_Api.ag_us_list(invitation_code, state.search, state.radio, state.currentPage, state.pageSize).then(res => {
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

			// 选择项
			const handleSelectionChange = (val) => {
				state.multipleSelection = val
			}
			
			const changePage = (val) => {
				state.currentPage = val
				store.commit('setPageIndex', val)
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

			//用户禁用
			const user_forbidden_start = (id) => {
				console.log("这里了---------------->", id)
				gs_Api.user_forbidden(id, $qs.stringify({
					is_forbidden: 1
				})).then(res => {
					if (res.code == 200) {
						console.log(res)
						ElMessage.success(res.message)
						getUser_childList()
					}
				})
			}

			//解除禁用
			const user_forbidden_end = (id) => {
				gs_Api.user_forbidden(id, $qs.stringify({
					is_forbidden: 0
				})).then(res => {
					if (res.code == 200) {
						console.log(res)
						ElMessage.success(res.message)
						getUser_childList()
					}
				})
			}

			//恢复体验
			const covErexperience = (row) => {
				console.log(row)
				gs_Api.user_recoverexperience($qs.stringify({
					username: row.username
				})).then(res => {
					ElMessage.success(`给手机号为${row.telephone}的体验资格重置成功！`)
				})
			}

			//重置密码-->打开
			const updpass_Open = (row) => {
				state.title = "重置密码"
				fromSet(state, "propList", ["username"], row)
				dialog.value.open()
			}

			//重置密码-->执行
			const update_Pass = async (val) => {
				const username = getVal(val, "username")
				const password_new = getVal(val, "password_new")
				const password_new2 = getVal(val, "password_new2")
				let data = {
					username: username,
					password_new: password_new,
					password_new2: password_new2,
				}
				//数据校验
				if (validateData(data)) {
					reset_pass(data, () => {
						successReload()
					})
				}
			}

			//短信通知
			const shortNote = (row) => {
				gs_Api.user_sendnotice($qs.stringify({
					telephone: row.telephone
				})).then(res => {
					if (res.code == 200) {
						ElMessage.success(`发送给手机号为${row.telephone}的短信通知，已发送成功！`)
					}
				})
			}

			//复制邀请链接
			const copy_invite_url = () => {
				ElMessage.success('邀请链接已复制！')
				const invite_code = route.query.invitation_code
				copyContent(store.state.envirUrl + invite_code)
			}

			//复制邀请码
			const copy_invite_code = () => {
				ElMessage.success('邀请码已复制！')
				const invite_code = route.query.invitation_code
				let invite_text = invite_code //encodeURI("星" + invite_code + "月云")
				copyContent(invite_text)
			}

			//查询数据
			const searchData = (val) => {
				state.search = val
				getUser_childList()
			}

			onUnmounted(() => {
				store.commit('delPageIndex')
			})
			
			return {
				...toRefs(state),
				multipleTable,
				handleSelectionChange,
				getUser_childList,
				changePage,
				handleSolve,
				handleForbid,
				dialog,
				user_forbidden_start,
				user_forbidden_end,
				covErexperience,
				updpass_Open,
				update_Pass,
				shortNote,
				copy_invite_url,
				copy_invite_code,
				searchData,
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