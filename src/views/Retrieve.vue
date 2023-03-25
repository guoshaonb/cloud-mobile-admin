<template>
	<div class="safety-main">
		<template v-if="!is_set_safety">
			<el-dialog title="提示" v-model="dialogVisible" :width="isPc ? '30%' : '50%'">
				<span>您还没有设置安全问题哦[用于找回密码]，请点↖方向的设置安全按钮<span style="color: orangered;">☹☹</span></span>
				<template #footer>
					<span class="dialog-footer">
						<el-button type="primary" @click="dialogVisible = false">我知道了</el-button>
					</span>
				</template>
			</el-dialog>
		</template>
	</div>
</template>

<script>
	import {
		onMounted,
		reactive,
		ref,
		toRefs
	} from 'vue'
	import axios from '@/utils/axios'
	import {
		ElMessage
	} from 'element-plus'
	import {
		update_pass,
		veri_safety_pro,
		reset_pass
	} from '@/api/common'
	import {
		validateData
	} from '@/utils/action'
	import {
		pathMap,
		localGet,
		localSet
	} from '@/utils'
	import {
		useStore
	} from 'vuex'
	import md5 from 'js-md5'
	import $ from 'jquery'
	export default {
		name: 'Account',
		setup() {
			const nameRef = ref(null)
			const passRef = ref(null)
			const store = useStore()
			const state = reactive({
				user: null,
				isPc: true,
				nameForm: {
					loginName: '',
					nickName: ''
				},
				safetyForm: {
					username: "",
					safety: '',
					problem: ''
				},
				passForm: {
					newpass_xin: '',
					newpass_new: ''
				},

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

			//判断是否有设置过安全问题
			const is_safety_Func = () => {
				const user = store.getters.getUser
				if (user) {
					state.is_set_safety = user.safety_problem
				}
			}

			onMounted(() => {
				if ($(document).width() < 1200) {
					state.isPc = false
				}
				is_safety_Func()
			})

			return {
				...toRefs(state),
				nameRef,
				passRef
			}
		}
	}
</script>

<style>
	.account-container {
		margin-bottom: 20px;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.safety-main {
		height: 100%;
		background-image: url("@/assets/images/safety-bannner.jpg");
		background-repeat: no-repeat;
		background-size: 100%;
	}
</style>