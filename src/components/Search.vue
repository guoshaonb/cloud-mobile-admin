<template>
	<el-input :style="{width:isPc ? '25%' : '50%','margin-right': isPc ? '20px' : '10px'}" v-model="search"
		@keyup.enter.native="searchDataBack" :placeholder="placeh">
		<template #append>
			<el-button icon="el-icon-search" @click="searchDataBack"></el-button>
		</template>
	</el-input>
</template>

<script>
	export default {
		props: {
			//主要属性
			isPc: {
				type: Boolean,
				default: false
			},
			search: {
				type: String,
				default: ""
			},
			placeh: {
				type: String,
				default: ""
			},
		},
		methods: {
			searchDataBack() {
				this.$emit("searchDataBack", this.search);
			}
		}
	}
</script>
<style>
</style>