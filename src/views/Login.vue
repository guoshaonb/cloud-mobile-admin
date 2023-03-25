<template>
	<div class="login-body">
		<template v-if="is_retrieve">
			<el-card class="account-container" v-if="!is_verisafety">
				<template #header>
					<div class="card-header">
						<span>第一步，核对安全信息</span>
					</div>
				</template>
				<el-form :model="safetyForm" ref="safetyRef" label-width="100px" label-position="right" class="demo-ruleForm">
					<el-form-item label="账号名" prop="username">
						<el-input style="width: 300px" v-model="safetyForm.username" placeholder="输入你要找回的用户名"></el-input>
					</el-form-item>
					<el-form-item label="设置的问题" prop="safety">
						<el-select v-model="safetyForm.safety" placeholder="选择之前设置的问题">
							<el-option v-for="item in safetyList" :key="item.value" :label="item.label" :value="item.value">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="设置的答案" prop="newpass">
						<el-input style="width: 300px" v-model="safetyForm.problem" placeholder="输入之前设置的答案"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="danger" @click="submitSafety">确认提交</el-button>
						<el-button type="warning" @click="backLogin">返回登录</el-button>
					</el-form-item>
				</el-form>
			</el-card>
			<el-card class="account-container" v-if="is_verisafety">
				<template #header>
					<div class="card-header">
						<span>第二步，重置密码</span>
					</div>
				</template>
				<el-form :model="passForm" ref="newpassRef" label-width="100px" label-position="right" class="demo-ruleForm">
					<el-form-item label="新密码：" prop="newpass">
						<el-input type="password" style="width: 300px" v-model="passForm.password_new"></el-input>
					</el-form-item>
					<el-form-item label="再次确认：" prop="newpass">
						<el-input type="password" style="width: 300px" v-model="passForm.password_new2"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="danger" @click="submitPass">确认修改</el-button>
						<el-button type="warning" @click="backLogin">返回登录</el-button>
					</el-form-item>
				</el-form>
			</el-card>
		</template>
		<template v-else>
			<div class="login-container" :style="{width:isPc ? '550px' : '360px', height:isPc ? '480px' : '320px'}">
				<div class="head" v-if="isPc">
					<img class="logo" src="@/assets/images/yun-logo.png" alt="">
					<div class="name">
						<div class="title">{{isPc ? '星月云' : '星月云管理'}}</div>
						<div class="tips">云手机后台管理</div>
					</div>
				</div>
				<el-form label-position="top" :rules="rules" :model="ruleForm" ref="loginForm" class="login-form">
					<el-form-item label="账号" prop="username"
						:style="{'margin-top':isPc?'0px':'1px','margin-bottom':isPc?'12px':'5px'}">
						<el-input type="text" v-model.trim="ruleForm.username" autocomplete="off" @keyup.enter.native="submitForm">
						</el-input>
					</el-form-item>
					<el-form-item label="密码" prop="password" :style="{'margin-bottom':isPc?'12px':'5px'}">
						<el-input type="password" v-model.trim="ruleForm.password" autocomplete="off"
							@keyup.enter.native="submitForm"></el-input>
					</el-form-item>
					<!-- <el-form-item label="验证码" class="veri-code" :style="{'margin-bottom':isPc?'12px':'2px'}">
						<div id="mpanel"></div>
					</el-form-item> -->
					<el-form-item>
						<div style="color: #333">忘记密码？<a @click="goto_retrieve">点我找回</a></div>
						<el-button style="width: 100%;margin-top: 10px;" type="primary" @click="submitForm">立即登录</el-button>
						<!-- <el-checkbox v-model="checked" @change="!checked">下次自动登录</el-checkbox> -->
					</el-form-item>
				</el-form>
			</div>
		</template>
	</div>
</template>

<script>
	import axios from '@/utils/axios'
	import md5 from 'js-md5'
	import {
		onMounted,
		onUnmounted,
		reactive,
		ref,
		toRefs,
	} from 'vue'
	import {
		ElMessage
	} from 'element-plus'
	import {
		login,
		update_pass,
		veri_safety_pro,
		reset_pass
	} from '@/api/common'
	import {
		validateData
	} from '@/utils/action'
	import {
		useRoute,
		useRouter
	} from 'vue-router'
	import {
		pathMap,
		localGet,
		localSet
	} from '@/utils'
	import {
		useStore
	} from 'vuex'

	// import $ from 'jquery'
	export default {
		name: 'Login',
		setup() {
			const loginForm = ref(null)
			const safetyRef = ref(null)
			const newpassRef = ref(null)
			const router = useRouter()
			const store = useStore()
			const state = reactive({
				ruleForm: {
					username: '',
					password: ''
				},
				checked: true,
				isPc: true,
				is_retrieve: false,
				rules: {
					username: [{
						required: 'true',
						message: '账户不能为空',
						trigger: 'blur'
					}],
					password: [{
						required: 'true',
						message: '密码不能为空',
						trigger: 'blur'
					}]
				},

				//安全问题
				safetyForm: {
					username: "",
					safety: '',
					problem: ''
				},
				passForm: {
					password_new: '',
					password_new2: ''
				},
				is_veri_codewin: false,
				is_verisafety: false,
				is_usandpas: false,
				is_set_safety: false,
				dialogVisible: true,
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
				}]
			})

			onMounted(() => {
				if ($(window).width() < 1200) {
					state.isPc = false
				}
				// bindClick()
			})

			const bindClick = () => {
				$('#mpanel').slideVerify({
					type: 1, //类型
					vOffset: 5, //误差量，根据需求自行调整
					barSize: {
						width: !state.isPc ? '250px' : '100%',
						height: '40px',
					},
					ready: function () { },
					success: function () {
						state.is_veri_codewin = true
						//......后续操作
					},
					error: function () {
						state.is_veri_codewin = false
						//alert('验证失败！');
					}
				});
			}

			const successReload = () => {
				setTimeout(() => {
					ElMessage.success("正在前往登录...");
					state.is_retrieve = false
					setTimeout(() => {
						window.location.reload()
					}, 500)
				}, 1000)
			}

			//登录
			const submitForm = async () => {
				const {
					username,
					password
				} = state.ruleForm
				const data = {
					username: username,
					password: password
				}
				loginForm.value.validate((valid) => {
					login(data, res => {
						ElMessage.success("恭喜您，登录成功！");
						let userdata = res.data
						userdata.token = res.data.token
						userdata.user_nickname = encodeURI(userdata.user_nickname)
						store.commit('setUser', userdata)
						setTimeout(() => {
							location.href = store.state.mainUrl
							setTimeout(() => {
								location.reload()
							}, 1000)
						}, 1000)
					})
				})
				// if (state.is_veri_codewin) {
					
				// } else {
				// 	ElMessage.warning("请向右滑动验证！");
				// }
			}
			
			const resetForm = () => {
				loginForm.value.resetFields();
			}

			const goto_retrieve = () => {
				state.is_retrieve = true
			}

			//核对安全信息
			const submitSafety = async () => {
				state.is_verisafety = false
				const username = state.safetyForm.username
				const safety_problem = state.safetyForm.safety + "|" + state.safetyForm.problem
				let data = {
					username: username,
					safety_problem: safety_problem
				}
				veri_safety_pro(data, res => {
					store.commit("setMytoken", res.data.token)
					state.is_verisafety = true
				})
			}

			//重置密码
			const submitPass = async () => {
				const {
					username
				} = state.safetyForm
				const {
					password_new,
					password_new2
				} = state.passForm
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

			//返回登录
			const backLogin = () => {
				state.is_retrieve = false
				setTimeout(() => {
					bindClick()
				}, 10)
			}
			return {
				...toRefs(state),
				loginForm,
				safetyRef,
				newpassRef,
				submitForm,
				resetForm,
				goto_retrieve,
				submitSafety,
				submitPass,
				backLogin
			}
		}
	}
</script>

<style scoped>
	.login-body {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		background-color: #fff;
		/* background-image: linear-gradient(25deg, #077f7c, #3aa693, #5ecfaa, #7ffac2); */
	}

	.login-container {
		width: 500px;
		height: 500px;
		background-color: #fff;
		border-radius: 4px;
		box-shadow: 0px 21px 41px 0px rgba(0, 0, 0, 0.2);
	}

	.head {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30px 0 20px 0;
	}

	.head img {
		width: 100px;
		height: 100px;
		margin-right: 40px;
	}

	.head .title {
		font-size: 25px;
		color: #1BAEAE;
		font-weight: bold;
	}

	.head .tips {
		font-size: 14px;
		color: #999;
		margin-top: 10px;
	}

	.login-form {
		width: 70%;
		margin: 0 auto;
	}
</style>
<style>
	.el-form--label-top .el-form-item__label {
		padding: 0;
	}

	.login-form .el-form-item {
		margin-bottom: 12px;
	}

	.login-container .title {
		/* text-align: center */
	}

	.login-container .logo {
		border-radius: 50%;
	}

	.verify-bar-area {
		width: 100% !important;
	}
</style>