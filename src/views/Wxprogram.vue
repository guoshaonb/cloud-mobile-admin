<template>
	<el-card class="account-container">
		&nbsp;<span>是否显示小程序的隐藏内容--></span>
		<el-radio-group v-model="radio" style="margin-left: 20px;">
			<el-radio label="yes">显示</el-radio>
			<el-radio label="no">隐藏</el-radio>
		</el-radio-group>
		<el-button @click="submitUpd" type="success" style="margin-left: 25px;">确定修改</el-button>
	</el-card>
	<el-card class="account-container">
		&nbsp;<span>今日观看量--></span>
		&nbsp;<span>{{todayWatCount}}</span>
		<el-button @click="getWatCount" type="success" style="margin-left: 10px;">重新获取</el-button>
	</el-card>
	<el-card class="account-container">
		&nbsp;<span>今日点击量--></span>
		&nbsp;<span>{{todayCliCount}}</span>
		<el-button @click="getCliCount" type="success" style="margin-left: 10px;">重新获取</el-button>
	</el-card>
</template>

<script>
	import {
		onUnmounted,
		onMounted,
		reactive,
		watch,
		toRefs
	} from 'vue'
	import {
		ElMessage
	} from 'element-plus'
	export default {
		setup() {
			let state = reactive({
				radio: "",
				todayWatCount: 0,
				todayCliCount: 0,
			})

			onMounted(() => {
				getWatCount()
				getCliCount()
			})

			gs_Api.wxveri_get().then(res => {
				state.radio = res.message
			})

			const submitUpd = () => {
				gs_Api.wxveri_set($qs.stringify({
					isshow: state.radio
				})).then(res => {
					if (res.code == 200) {
						ElMessage.success(`修改审核内容为${state.radio == 'yes' ? '显示' : '隐藏'}成功！`)
					}
				})
			}

			//获取今日观看量
			const getWatCount = () => {
				gs_Api.wx_getwatchc().then(res => {
					state.todayWatCount = res.data
				})
			}

			//获取今日点击量
			const getCliCount = () => {
				gs_Api.wx_getclickc().then(res => {
					state.todayCliCount = res.data
				})
			}

			return {
				...toRefs(state),
				submitUpd,
				getWatCount,
				getCliCount
			}
		}
	}
</script>

<style scoped="scoped">
	.account-container {
		margin-bottom: 10px;
	}
</style>