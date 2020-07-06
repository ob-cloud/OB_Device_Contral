<template>
	<view class="content" >
		<m-header :title="title" theme bcgColor="#0faeff"></m-header>
		<view class="curtains-box">
			<button type="primary" plain="true" class="primary" v-for="(item, index) in extendsKeys" :key="index" @tap="controlTv(item.key)">{{item.name}}</button>
			<text class="tip-text" v-if="extendsKeys.length === 0">暂无自定义按钮</text>
		</view>
	</view>
</template>

<script>
	import mHeader from '@/components/header.vue'
	import { controlIrDevice } from '@/api/device.js'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				title: '自定义按钮',
				serialId: '',
				index: '',
				extendsKeys: []
			}
		},
		methods: {
			controlTv(key) {
				console.log('key',key)
				controlIrDevice(this.serialId, this.index, key, '1').then(res => {
					console.log('res', res)
					uni.showToast({
						title: '命令已下发',
						icon: 'none',
						duration: 1500
					});
				}).catch(err => {
					console.log('err', err)
				})
			}
		},
		onLoad(option){
			console.log('option',option)
			this.serialId = option.serialId
			this.index = option.index
			this.title = option.name
			try{
				this.extendsKeys = JSON.parse(option.extendsKeys).map(ele => {
					const tarArr = ele.key.split('|')
					return {
						name: tarArr[0],
						key: `1%7C${tarArr[1]}`
					}
				})
			}catch(e){
				console.log('e', e)
				//TODO handle the exception
			}
			console.log('this.extendsKeys',this.extendsKeys)
		}
	}
</script>

<style>
.content {
	justify-content: center;
	align-items: center;
	background-color: #ffffff;
}
.curtains-box {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	justify-content: flex-start;
	align-items: flex-start;
	align-content: flex-start;
}
.primary {
	width: 40%;
	margin: 10px 5%;
	border-color: #0faeff !important;
	color: #0faeff !important;
}
.tip-text {
	text-align: center;
	color: #ccc;
	font-size: 12px;
	width: 100%;
	line-height: 40px;
}
</style>
