<template>
	<div class="table">
		<!-- 表格开始 -->
		<el-table ref="table" v-loading="loading" element-loading-text="加载中" :data="tableData" border stripe
			style="width: 100%;" @sort-change="handleSortChange">
			<!-- prop是对应列内容的字段名 width是对应列宽度 sortable是是否排序 label是对应列名称 -->
			<el-table-column v-for="(item, index) in tableColumns" :key="index" :prop="item.param"
				:width="item.width ? item.width : ''" :sortable="item.sortable ? true : false" :label="item.label">
				<template v-slot="scope">
					<!-- 需要特殊处理的表格字段 -->
					<template v-if="item.fieldtype">
						<template v-if="item.fieldtype == 'imgurl'">
							<img class="imgurl-img" @click="getScaleImgBack(scope.row)" :src="imgPrefix+scope.row[item.param]"
								:style="{width: isPc ? '58px' : 'auto',height:isPc ? '105px' : '70px'}" />
						</template>
						<template v-else-if="item.fieldtype == 'phonescreen'">
							<img class="phonescreen" @click="getPhonescreenBack(scope.row)" :src="scope.row[item.param]"
								:style="{width: isPc ? '58px' : 'auto',height: isPc ? '105px' : '70px'}" />
						</template>
						<template v-else-if="item.fieldtype == 'ypyimg'">
							<img class="ypyimg-img" :src="scope.row[item.param]" style="width: 100%;height: 100%;" />
						</template>
						<template v-if="item.fieldtype == 'phone_status'">
							<span v-if="scope.row.phone_status==0" style="color:orange">空闲</span>
							<span v-else-if="scope.row.phone_status==2" style="color:grey">维护中</span>
							<span v-else style="color:red">
								<span v-if="scope.row.telephone == '16666666666'">
									后台账户{{scope.row.username}}已占用
								</span>
								<span v-else>
									手机号{{scope.row.telephone}}已占用
								</span>
							</span>
						</template>
						<template v-else-if="item.fieldtype == 'select'">
							<el-select v-model="phone_value" placeholder="点我查看">
								<el-option disabled v-for="item in phone_list[scope.row.id]" :key="item.value" :label="item.label"
									:value="item.value">
								</el-option>
							</el-select>
						</template>
					</template>
					<!-- 一般的表格字段 -->
					<template v-else>
						<span v-if="item.render">
							{{ item.render(scope.row) }}
						</span>
						<span v-else>{{ item.params ? scope.row[item.params[0]][item.params[1]] : scope.row[item.param] }}</span>
					</template>
				</template>
			</el-table-column>
			<!-- 操作 -->
			<el-table-column v-if="tableOption.label" :width="tableOption.width || ''" :label="tableOption.label"
				align="center" class-name="small-padding fixed-width">
				<template v-slot="scope">
					<el-button v-for="(item, index) in tableOption.options" :key="index" :type="item.type" :icon="item.icon"
						@click="handleButton(item.methods, scope.row, scope.$index)">
						{{ item.label }}
					</el-button>
					<el-popconfirm v-for="(item, index) in tableOption.popconfirms" :key="index" :confirmButtonText='item.contit'
						cancelButtonText='不用了' :icon="item.titicon" iconColor="red" :title="item.title"
						@confirm="handleButton(item.methods, scope.row, scope.$index)">
						<template #reference>
							<el-button :type="item.buttype" :icon="item.buticon">{{ item.label }}</el-button>
						</template>
					</el-popconfirm>
				</template>
			</el-table-column>
		</el-table>
		<!-- 表格结束 -->
		<!-- 翻页 -->
		<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
			:page-sizes="[5 , 10, 20, 50, 100]" :page-size="rows" layout="total, sizes, prev, pager, next, jumper"
			:total="total">
		</el-pagination>
	</div>
</template>
<script>
	export default {
		props: {
			//主要属性
			loading: {
				// 预加载
				type: Boolean,
				default: false
			},
			tableData: {
				// 表格数据
				type: Array,
				default: () => {
					return [];
				}
			},
			tableColumns: {
				// 表头数据
				type: Array,
				default: () => {
					return [];
				}
			},
			tableOption: {
				// 表格操作
				type: Object,
				default: () => {
					return {};
				}
			},
			page: {
				// 当前页
				type: Number,
				default: () => {
					return 1;
				}
			},
			rows: {
				// 当前页展示数
				type: Number,
				default: () => {
					return 20;
				}
			},
			total: {
				// 总数
				type: Number,
				default: () => {
					return 0;
				}
			},
			//其他属性
			imgPrefix: {
				// 图片url前缀
				type: String,
				default: ""
			},
			phone_value: {
				// 设备选项
				type: String,
				default: ""
			},
			phone_list: {
				// 设备列表数据
				type: Array,
				default: () => {
					return [];
				}
			},
			isPc: {
				// 是否为PC端
				type: Boolean,
				default: false
			},
		},
		methods: {
			// 切换当前一页展示多少条
			handleSizeChange(val) {
				this.$emit("sizeChange", val);
			},
			// 翻页
			handleCurrentChange(val) {
				this.$emit("pageChange", val);
			},
			// 按钮点击事件
			// methods方法名 row当前点击列数据 index当前点击的index
			handleButton(methods, row, index) {
				this.$emit("clickButton", {
					methods: methods,
					row: row,
					index: index
				});
			},
			// 点击排序
			handleSortChange(val) {
				this.$emit("sortChange", val);
			},
			// 其他事件
			getScaleImgBack(val) {
				this.$emit("getScaleImgBack", val);
			},
			getPhonescreenBack(val) {
				this.$emit("getPhonescreenBack", val.id);
			},
		}
	};
</script>

<style scoped="scoped">
	.table {
		margin-top: 10px;
	}

	.el-table {
		margin: 10px 0;
	}

	.el-table td,
	.el-table th {
		text-align: center;
	}

	.el-pagination {
		text-align: right;
	}
</style>