<template>
	<div class="header">
		<div class="left">
			<i v-if="hasBack" class="el-icon-back" @click="back"></i>
			<span style="font-size: 17px">{{ name }}</span>
			&nbsp;
			<el-button v-if="isback" size="medium" @click="back" class="el-icon-arrow-left">返回</el-button>
			<el-button v-if="isset_safety" size="medium" @click="set_safety_open" class="el-icon-lock" type="success">
				&nbsp;设置安全问题</el-button>
			<el-button v-if="isvisual" size="medium" @click="leaveforVisual" class="el-icon-s-home">&nbsp;前往可视化界面
			</el-button>
		</div>
		<div class="right">
			<el-popover placement="bottom" :width="320" trigger="click" popper-class="popper-user-box">
				<template #reference>
					<div class="author">
						<i class="icon el-icon-s-custom" />
						{{ userInfo && userInfo.username || '' }}&nbsp;
						<i class="el-icon-caret-bottom" />
					</div>
				</template>
				<div class="nickname">
					<p>用户名：{{ userInfo && userInfo.username || '' }}</p>
					<p>昵称：{{ userInfo && decodeURI(userInfo.user_nickname) }}</p>
					<p>身份等级：{{ userInfo && user_num_txt[userInfo.user_num] || '' }}</p>
					<p>当前云币：{{ userInfo && (userInfo.balance).toFixed(2) || '' }}</p>
					<el-tag size="small" effect="dark" class="logout" @click="logout">退出</el-tag>
				</div>
			</el-popover>
		</div>
		<DialogCommon ref='dialog' :title="title" :safetyList="safetyList" :propList="propList" :callBack="succ_set_safety"
			:reload="getPhoneList" />
	</div>
</template>

<script>
	import {
		onMounted,
		reactive,
		toRefs,
		ref
	} from 'vue'
	import {
		useRoute,
		useRouter
	} from 'vue-router'
	import axios from '@/utils/axios'
	import {
		ElMessage
	} from 'element-plus'
	import {
		localGet,
		localSet,
		localRemove,
		pathMap
	} from '@/utils'
	import {
		getVal,
		fromSet,
		validateData
	} from '@/utils/action'
	import {
		set_safety_pro
	} from '@/api/common'
	import {
		useStore
	} from 'vuex'
	import DialogCommon from '@/components/DialogCommon.vue'
	import $ from 'jquery'
	export default {
		name: 'Header',
		components: {
			DialogCommon
		},
		setup() {
			const route = useRoute()
			const router = useRouter()
			const dialog = ref(null)
			const store = useStore()
			const state = reactive({
				name: 'dashboard',
				isback: false,
				isvisual: false,
				isset_safety: false,
				userInfo: null,
				hasBack: false,
				isgetImg: false,
				user_num_txt: {
					"0": "管理员",
					"1": "代理",
					"2": "个人"
				},
				value: "",
				gotoUrls: ["/usermanage_child", "/scaleimg"],
				routerUrl: "",
				//弹窗
				title: "",
				safetyList: [{
					label: "手机型号",
					value: "手机型号"
				}, {
					label: "学校名称",
					value: "学校名称"
				}, {
					label: "家乡地址",
					value: "家乡地址"
				}, {
					label: "重要的人",
					value: "重要的人"
				}, {
					label: "生日时间",
					value: "生日时间"
				}],
				propList: [{
					type: "safety",
					label: "安全问题",
					name: "safety",
					value: ""
				}, {
					type: "text",
					label: "问题答案",
					name: "problem",
					value: ""
				}]
			})

			const successReload = (text) => {
				text && ElMessage.success(text);
				dialog.value.close()
				getUserInfo()
				const path = route.path
				router.push({
					path: "/empty"
				})
				setTimeout(() => {
					router.push({
						path: path
					})
				}, 500)
			}

			onMounted(() => {
				const pathname = window.location.hash.split('/')[1] || ''
				if (!['login'].includes(pathname)) {
					getUserInfo()
				}
			})

			const getUserInfo = async () => {
				state.userInfo = store.getters.getUser
				gs_Api.user_status().then(res => {
					if (res && res.code == 200) {
						state.userInfo.balance = res.data.balance
					}
				})
			}

			const logout = () => {
				ElMessage.success({
					message: "正在退出登陆，请稍后...",
					type: 'success'
				});
				setTimeout(() => {
					localRemove('user')
					localRemove('myreset')
					setTimeout(() => {
						router.push({
							path: "/login"
						})
					}, 500)
					if (route.path != "/retrieve") {
						location.reload()
					}
				}, 500)
			}
			
			const back = () => {
				state.isgetImg || store.commit('delPageIndex')
				$(".main").css('background-color', "#fff")
				if (route.path.indexOf("_child") != -1) {
					router.push({
						path: "/usermanage"
					})
				} else {
					router.back()
				}
			}
			
			router.afterEach((to) => {
				state.routerUrl = to.path

				//设置是否出现返回按钮
				if (state.routerUrl == "/usermanage_child" && state.userInfo.user_num == 1) {
					state.isback = false
				} else {
					state.isback = state.gotoUrls.indexOf(state.routerUrl) != -1
				}
				//为了返回刚才界面的时候能保留页数
				state.isgetImg = state.routerUrl.indexOf("scaleimg") != -1

				//设置是否出现前往可视化界面按钮
				state.isvisual = state.routerUrl == "/dashboard"
				//设置是否出现安全问题按钮
				state.isset_safety = state.routerUrl == "/retrieve"

				const {
					id
				} = to.query
				state.name = pathMap[to.name]
				if (id && to.name == 'add') {
					state.name = '编辑商品'
				}
				state.hasBack = ['level2', 'level3', 'order_detail'].includes(to.name)
			})

			//设置安全问题
			const set_safety_open = () => {
				state.title = "设置安全问题"
				dialog.value.open()
			}

			//重置用户数据缓存
			const reset_userData = (safety_problem) => {
				state.userInfo.safety_problem = "ok"
				store.commit("setUser", state.userInfo)
			}

			//设置安全问题确定
			const succ_set_safety = async (val) => {
				const safety = getVal(val, "safety")
				const problem = getVal(val, "problem")
				let data = {
					safety_problem: safety + "|" + problem
				}
				set_safety_pro(data, safety_problem => {
					//重置用户数据缓存
					reset_userData(safety + "|" + problem)
					successReload()
				})
			}

			const leaveforVisual = () => {
				window.open(store.state.visualUrl)
			}

			return {
				...toRefs(state),
				logout,
				back,
				dialog,
				set_safety_open,
				succ_set_safety,
				leaveforVisual
			}
		}
	}
</script>

<style scoped>
	.header {
		height: 50px;
		border-bottom: 1px solid #e9e9e9;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20px;
	}

	.el-icon-back {
		border: 1px solid #e9e9e9;
		padding: 4px;
		border-radius: 50px;
		margin-right: 10px;
	}

	.right>div>.icon {
		font-size: 18px;
		margin-right: 6px;
	}

	.author {
		margin-left: 10px;
		cursor: pointer;
	}
</style>
<style>
	.popper-user-box {
		background: url('https://s.yezgea02.com/lingling-h5/static/account-banner-bg.png') 50% 50% no-repeat !important;
		background-size: cover !important;
		border-radius: 0 !important;
	}

	.popper-user-box .nickname {
		position: relative;
		color: #ffffff;
	}

	.popper-user-box .nickname .logout {
		position: absolute;
		right: 0;
		top: 0;
		cursor: pointer;
	}
</style>