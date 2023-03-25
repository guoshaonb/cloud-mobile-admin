<template>
	<el-card class="guest-container">
		<template #header>
			<Search :isPc="isPc" :search="search" placeh="请输入账户/手机号" @searchDataBack="searchData"></Search>
		</template>

		<CommonTable :isPc="isPc" :imgPrefix="imgPrefix" @getScaleImgBack="getScaleImg" :tableData="tableData"
			:tableColumns="tableLabel" :page="currentPage" :rows="pageSize" :total="total" :loading="loading"
			:tableOption="tableOption" @sizeChange="sizeChange" @pageChange="pageChange" @clickButton="clickButton"
			@sortChange="sortChange"></CommonTable>
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
			// 删除日志
			delfirm(val) {
				this.userLogDel(val.id)
			}
		},
		setup() {
			const multipleTable = ref(null)
			// const dialog = ref(null)
			const router = useRouter()
			const store = useStore()
			const state = reactive({
				isPc: true,
				imgPrefix: "",
				userInfo: null,

				//------------表格模块------------
				loading: false, //表格状态
				total: 0, //数据总条数
				currentPage: 1, // 当前页
				pageSize: 5, // 分页大小
				// 表头数据
				tableLabel: [{
					label: "id",
					param: "id"
				},
				{
					label: "账户",
					param: "user.username",
					params: ["user", "username"]
				},
				{
					label: "手机号",
					param: "user.telephone",
					params: ["user", "telephone"]
				},
				{
					label: "设备ip",
					param: "game_phone.phone_name",
					params: ["game_phone", "phone_ip"]
				},
				{
					label: "名称",
					param: "name",
				},
				{
					label: "内容",
					param: "content",
				},
				{
					label: "当前屏幕[点图预览]",
					param: "imgurl",
					fieldtype: "imgurl"
				},
				{
					label: "创建时间",
					param: "createdAt",
					render: row => {
						return formatDateTime(new Date(row.createdAt))
					}
				},
				],
				// 表格操作
				tableOption: {
					label: "操作",
					popconfirms: [{
						label: "删除",
						contit: "确定删除",
						title: "确定删除这条日志吗？",
						titicon: "el-icon-delete",
						buttype: "danger",
						buticon: "el-icon-delete",
						methods: `delfirm`
					}]
				},
				// 表格数据
				tableData: [],
				radio: "all", //内容选项
				search: "", //搜索内容
			})

			const successReload = (text) => {
				text && ElMessage.success(text);
				getUserLogList()
			}

			onMounted(() => {
				setTimeout(() => {
					state.currentPage = getPageIndex() || 1
					if ($(window).width() < 1200) {
						state.isPc = false
					}
					state.imgPrefix = store.state.imgPrefix
					getUserInfo()
					getUserLogList()
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

			// 获取日志记录
			const getUserLogList = () => {
				loadingFunc()
				gs_Api.user_log_get(state.search, state.currentPage, state.pageSize).then(res => {
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
				getUserLogList()
			}

			//查询数据
			const searchData = (val) => {
				state.search = val
				getUserLogList()
			}
			onUnmounted(() => {
				store.commit('delPageIndex')
			})

			//查看大图
			const getScaleImg = (row) => {
				router.push({
					path: "/scaleimg",
					query: {
						src: row.imgurl,
						pageIndex: getPageIndex(),
					}
				})
			}

			//删除日志
			const userLogDel = (id) => {
				gs_Api.user_log_del(id).then(res => {
					if (res.code == 200) {
						successReload('移除该条日志成功！')
					}
				})
			}
			return {
				...toRefs(state),
				multipleTable,
				getUserLogList,
				changePage,
				searchData,
				formatDate,
				getScaleImg,
				userLogDel
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

	.imgurl-img {
		width: 80px;
	}
</style>