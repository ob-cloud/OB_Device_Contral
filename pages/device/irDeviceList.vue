<template>
	<view>
		<m-header :title="title" :theme="true"></m-header>
		<scroll-view class="ir-device-list" scroll-y="true">
			<view class="ir-list" v-for="(item, index) in irList" :key="item.brandId" v-if="[7,2,0].indexOf(item.deviceType) > -1" @tap="dealIr(item)">
				<view class="device-info">
					<image :src="`/static/img/${item.deviceType === 7 ? 'air': item.deviceType === 2 ? 'tv': 'control'}-img.png`" style="width: 30px;height: 30px;"></image>
					<text class="ir-name">{{item.name}}</text>
				</view>
				<image src="/static/img/to-right.png" style="width: 20px;height: 20px;"></image>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { queryIrDevice } from '@/api/device.js'
	import mHeader from '@/components/header.vue'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				title: '红外设备列表',
				deviceId: '',
				irList: []
			}
		},
		methods: {
			getIrDevice(){
				uni.showLoading({
				    title: '加载中'
				});
				queryIrDevice(this.deviceId).then(res => {
					uni.hideLoading()
					if(res.data && res.data.rs) {
						this.irList = res.data.rs
					}
				}).catch(err => {
					uni.hideLoading()
				})
			},
			dealIr(item){
				console.log('item', item.deviceType)
				switch(item.deviceType) {
					case 7:
						uni.navigateTo({
							url: `/pages/device/irDeviceControl/airControl?serialId=${this.deviceId}&index=${item.index}&name=${item.name}`
						});
					break;
					case 2:
						uni.navigateTo({
							url: `/pages/device/irDeviceControl/tvControl?serialId=${this.deviceId}&index=${item.index}&name=${item.name}`
						});
					break;
					case 0:
						try {
							uni.navigateTo({
								url: `/pages/device/irDeviceControl/custom?serialId=${this.deviceId}&index=${item.index}&name=${item.name}&extendsKeys=${JSON.stringify(item.extendsKeys)}`
							});
						} catch(e){
							consle.log('ecustom', e)
						}
					break;
					default:
					break;
				}
			}
		},
		onLoad(option) {
			this.deviceId = option.deviceId
			this.title = option.name
			option.deviceId && this.getIrDevice()
		}
	}
</script>

<style>
.ir-device-list {
	box-sizing: border-box;
	padding: 10px;
	display: flex;
	justify-content: space-between;
	height: calc(100vh - 64px);
}
.ir-list {
	margin-bottom: 20px;
	background: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #ccc;
	padding: 10px;
	border-radius: 4px;
}
.device-info {
	display: flex;
	flex: 1;
}
.ir-name {
	margin-left: 20px;
	line-height: 24px;
	font-size: 12px;
	color: #999;
}
</style>
