<template>
	<el-dialog :title="title" v-model="visible" :width="width">
		<el-form label-width="100px" class="good-form">
			<el-form-item v-for="(item,index) in propList" :label="item.label" :prop="item.name">
				<template v-if="item.type=='list'">
					<el-transfer v-model="end_value" :data="data" :titles="['其他设备', '该游戏设备']" />
				</template>
				<template v-else-if="item.type=='tags'">
					<el-tag :key="tag" v-for="tag in phone_all" closable :disable-transitions="false" @close="handleClose(tag)">
						{{tag}}
					</el-tag>
					<el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small"
						@keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
					</el-input>
					<el-button v-else class="button-new-tag" size="small" @click="showInput">+ 添加设备</el-button>
				</template>
				<template v-else-if="item.type=='safety'">
					<el-select v-model="item.value" placeholder="请选择">
						<el-option v-for="item in safetyList" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</template>
				<template v-else-if="item.type=='money'">
					<div style="margin-bottom: 10px;">
						<el-radio v-model="radio" label="1" border style="margin-right: 25px;">快捷输入</el-radio>
						<el-radio v-model="radio" label="2" border>手动输入</el-radio>
					</div>
					<template v-if="radio == '1'">
						<el-select v-model="item.value" placeholder="请选择">
							<el-option v-for="item in moneyList" :key="item.value" :label="item.label" :value="item.value">
							</el-option>
						</el-select>
					</template>
					<template v-else>
						<el-input type="text" v-model="item.value"></el-input>
					</template>
				</template>
				<template v-else-if="item.type=='moneys'">
					<div style="margin-bottom: 10px;">
						<el-radio v-model="radio" label="1" border style="margin-right: 25px;">快捷输入</el-radio>
						<el-radio v-model="radio" label="2" border>手动输入</el-radio>
					</div>
					<template v-if="radio == '1'">
						<el-select v-model="item.value" placeholder="请选择">
							<el-option v-for="item in moneyLists[dredgeSel]" :key="item.value" :label="item.label"
								:value="item.value">
							</el-option>
						</el-select>
					</template>
					<template v-else>
						<el-input type="text" v-model="item.value"></el-input>
					</template>
				</template>
				<template v-else-if="item.type=='oldmoneys'">
					<el-input type="text" disabled v-model="oldmoneyLists[dredgeSel]"></el-input>
				</template>
				<template v-else-if="item.type=='dredge'">
					<el-select v-model="dredgeSel" placeholder="请选择">
						<el-option v-for="item in dredgeDates" :key="item.value" :label="item.label" :value="item.index">
						</el-option>
					</el-select>
				</template>
				<template v-else-if="item.type=='file'">
					<input id="file" type="file" @change="uploadFile('file')">
				</template>
				<template v-else-if="item.type=='textarea'">
					<el-input :type="item.type" v-model="item.value" :rows="5"></el-input>
				</template>
				<template v-else-if="item.type=='status'">
					<el-select v-model="item.value" placeholder="请选择">
						<el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</template>
				<template v-else-if="item.type=='datetime'">
					<div class="block">
						<div class="block">
							<el-date-picker v-model="item.value" type="datetime" placeholder="选择日期时间">
							</el-date-picker>
						</div>
					</div>
				</template>
				<template v-else>
					<el-input v-if="item.type=='number'" min="1" max="10" :type="item.type" v-model="item.value"
						:disabled="item.disabled"></el-input>
					<el-input v-else :type="item.type" v-model="item.value" :disabled="item.disabled"></el-input>
				</template>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="visible = false">取 消</el-button>
				<el-button type="primary" @click="submitForm">确 定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script>
	import {
		reactive,
		ref,
		toRefs,
		onMounted,
		watch
	} from 'vue'
	import {
		useRoute,
		useRouter
	} from 'vue-router'
	import axios from '@/utils/axios'
	import {
		hasEmoji
	} from '@/utils/index'
	import {
		ElMessage
	} from 'element-plus'
	import {
		update_pass
	} from '@/api/common'
	import {
		validateData,
		upLoadupy
	} from '@/utils/action'
	import $ from 'jquery'

	export default {
		name: 'DialogCommon',
		props: {
			width: {
				type: Number,
				default: "400px"
			},
			reload: Function,
			callBack: Function,
			safetyList: Array,
			statusList: Array,
			moneyList: Array,
			moneyLists: Array,
			oldmoneyLists: Array,
			dredgeDates: Array,
			propList: Array
		},
		data() {

		},
		methods: {
			handleClose(tag) {
				this.phone_all.splice(this.phone_all.indexOf(tag), 1);
			},
			showInput() {
				this.inputVisible = true;
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},

			handleInputConfirm() {
				let inputValue = this.inputValue;
				if (inputValue) {
					this.phone_all.push(inputValue);
				}
				this.inputVisible = false;
				this.inputValue = '';
			}
		},
		setup(props) {

			const route = useRoute()
			const router = useRouter()
			const state = reactive({
				visible: false,
				categoryLevel: 1,
				parentId: 0,
				radio: "1",
				typeList: [{

				}],
				ruleForm: {
					name: '',
					rank: ''
				},
				//穿梭框
				data: [],
				start_value: [],
				end_value: [],
				values: {},

				//Tag标签
				phone_all: [],
				inputVisible: false,
				inputValue: '',
				dredgeSel: 0,
				imgUrl: ""
			})

			const generateData = _ => {
				const data = [];
				for (let i = 1; i <= 15; i++) {
					data.push({
						key: i,
						label: `备选项 ${i}`,
						disabled: i % 4 === 0
					});
				}
				return data;
			};
			watch(() => route.path, (path) => {
				$(".main").css('background-color', path == "/scaleimg" ? "#000" : "#fff")
			})

			// 获取详情
			const getDetail = (id) => {
				axios.get(`/categories/${id}`).then(res => {
					state.ruleForm = {
						name: res.categoryName,
						rank: res.categoryRank
					}
					state.parentId = res.parentId
					state.categoryLevel = res.categoryLevel
				})
			}

			//设置当前游戏设备列表
			const setPhonesVal = (row) => {
				//每次打开窗口的时候重置数组
				state.start_value = []
				state.end_value = []
				state.values = []

				//全部设备列表
				gs_Api.phone_all_get(row.game_name, "", 1, 100).then(res => {
					if (res.code == 200) {
						if (res.data) {
							let {
								rows: data
							} = res.data
							let list = []
							let phone_all = []
							for (let i = 0; i < data.length; i++) {
								state.values[data[i].phone_ip] = i
								list.push({
									key: i,
									label: data[i].phone_ip,
								})
								phone_all.push(data[i])
							}
							state.data = list
							state.phone_all = phone_all
						}
						gs_Api.yun_games_get_one(row.id, "", "", 1, 100).then(res => {
							if (res.code == 200) {
								let list = []
								for (let i = 0; i < res.data.length; i++) {
									for (let key in state.values) {
										if (key == res.data[i].phone_ip) {
											list.push(state.values[key])
										}
									}
								}
								state.start_value = list
								state.end_value = list
							}
						})
					}
				})

			}

			// 开启弹窗
			const open = (id) => {

				state.visible = true
				if (id) {
					state.id = id
					getDetail(id)
				} else {
					// 新增类目，从路由获取父分类id 和 分类级别
					const {
						level = 1, parent_id = 0
					} = route.query
					state.ruleForm = {
						name: '',
						rank: ''
					}
					state.parentId = parent_id
					state.categoryLevel = level
				}

			}
			// 关闭弹窗
			const close = () => {
				state.visible = false
			}

			//页面局部刷新
			const pageLoad = () => {
				state.visible = false
				props.reload()
			}

			//调用父组件回调事件
			const submitForm = async () => {
				if (route.path == "/gamemanage") {
					props.callBack(props, state.start_value, state.end_value, state.values, state.imgUrl)
				} else if (route.path == "/announcemanage") {
					props.callBack(props, state.imgUrl)
				} else {
					props.callBack(props, state.dredgeSel)
				}
			}

			//上传文件
			const uploadFile = (id) => {
				upLoadupy(state, id)
			}

			return {
				...toRefs(state),
				open,
				close,
				setPhonesVal,
				submitForm,
				uploadFile
			}
		}
	}
</script>

<style>
	.el-tag+.el-tag {
		margin-left: 10px;
	}

	.button-new-tag {
		margin-left: 10px;
		height: 32px;
		line-height: 30px;
		padding-top: 0;
		padding-bottom: 0;
	}

	.input-new-tag {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}
</style>