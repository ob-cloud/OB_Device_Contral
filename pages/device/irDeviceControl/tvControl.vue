<template>
	<view class="content" >
		<m-header :title="title" theme bcgColor="#0faeff"></m-header>
		<view class="curtains-box">
			<view class="flex-around">
				<image src="../../../static/img/deviceImg/lampSwitch.png" style="width: 60px;height: 60px;" @tap="controlTv('power')"></image>
				<image src="../../../static/img/deviceImg/silence.png" style="width: 60px;height: 60px;" @tap="controlTv('mute')"></image>
			</view>
			<view class="flex-between cen-control">
				<view class="volume-control">
					<text class="mini-btn-text" @tap="controlTv('vol%2B')">＋</text>
					<text>音量</text>
					<text class="mini-btn-text" @tap="controlTv('vol-')">-</text>
				</view>
				<view class="conter-control">
					<view class="mini-btn-text">
						<image src="../../../static/img/to-top.png" class="direction-btn"  @tap="controlTv('up')"></image>
					</view>
					<view class="center-control">
						<image src="../../../static/img/to-top.png" class="direction-btn rotate270"  @tap="controlTv('left')"></image>
						<text class="tip-text">确定</text>
						<image src="../../../static/img/to-top.png" class="direction-btn rotate90"  @tap="controlTv('right')"></image>
					</view>
					<view class="mini-btn-text rotate180">
						<image src="../../../static/img/to-top.png" class="direction-btn"  @tap="controlTv('down')"></image>
					</view>
				</view>
				<view class="volume-control">
					<view class="mini-btn-text">
						<image src="../../../static/img/to-top.png" class="direction-btn"  @tap="controlTv('ch%2B')"></image>
					</view>
					<text>音量</text>
					<view class="mini-btn-text rotate180">
						<image src="../../../static/img/to-top.png" class="direction-btn"  @tap="controlTv('ch-')"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import mHeader from '@/components/header.vue'
	import { settingNodeStatus, controlIrDevice } from '@/api/device.js'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				title: '电视控制器',
				serialId: '',
				index: ''
			}
		},
		computed:{
			
		},
		methods: {
			controlTv(key) {
				console.log('key',key)
				controlIrDevice(this.serialId, this.index, key, '0').then(res => {
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
			this.serialId = option.serialId
			this.index = option.index
			this.title = option.name
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
	flex-flow: column wrap;
	width: 100%;
	max-width: 500px;
}
.cen-control {
	align-items: stretch;
}
.volume-control {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-direction: column;
	border-radius: 40px;
	font-size: 12px;
	font-weight: bold;
	border: 1px solid #ccc;
}
.mini-btn-text {
	line-height: 2.3;
	font-size: 16px;
	padding: 0 1.34em;
}
.direction-btn {
	width: 20px;
	height: 20px;
}
.conter-control {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	height: 150px;
	width: 150px;
	border-radius: 100%;
	border: 1px solid #ccc;
}
.center-control {
	width: 100%;
	display: flex;
	justify-content: space-around;
}
.tip-text {
	color: #ccc;
	font-size: 14px;
}
</style>
