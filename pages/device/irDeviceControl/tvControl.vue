<template>
	<view class="content" >
		<m-header :title="title" theme bcgColor="#0faeff"></m-header>
		<view class="curtains-box">
			<view class="flex-around">
				<image src="../../../static/img/deviceImg/lampSwitch.png" style="width: 50px;height: 50px;" @tap="controlTv('power')"></image>
				<image src="../../../static/img/deviceImg/backhome.png" style="width: 50px;height: 50px;" @tap="controlTv('back')"></image>
				<image src="../../../static/img/deviceImg/silence.png" style="width: 50px;height: 50px;" @tap="controlTv('mute')"></image>
			</view>
			<view class="flex-around">
				<image src="../../../static/img/deviceImg/play1.png" style="width: 50px;height: 50px;" @tap="controlTv('signal')"></image>
				<image src="../../../static/img/deviceImg/menu.png" style="width: 50px;height: 50px;" @tap="controlTv('menu')"></image>
			</view>
			<view class="flex-between cen-control">
				<view class="volume-control">
					<text class="mini-btn-text" @tap="controlTv('vol%2B')">＋</text>
					<text>音量</text>
					<text class="mini-btn-text" @tap="controlTv('vol-')">-</text>
				</view>
				<view class="conter-control">
					<view class="mini-btn-text"  @tap="controlTv('up')">
						<image src="../../../static/img/to-top.png" class="direction-btn"></image>
					</view>
					<view class="center-control">
						<image src="../../../static/img/to-top.png" class="direction-btn rotate270 add-pad"  @tap="controlTv('left')"></image>
						<text class="tip-text add-pad" @tap="controlTv('ok')">ok</text>
						<image src="../../../static/img/to-top.png" class="direction-btn rotate90 add-pad"  @tap="controlTv('right')"></image>
					</view>
					<view class="mini-btn-text rotate180" @tap="controlTv('down')">
						<image src="../../../static/img/to-top.png" class="direction-btn"></image>
					</view>
				</view>
				<view class="volume-control">
					<view class="mini-btn-text"  @tap="controlTv('ch%2B')">
						<image src="../../../static/img/to-top.png" class="direction-btn"></image>
					</view>
					<text>频道</text>
					<view class="mini-btn-text rotate180"   @tap="controlTv('ch-')">
						<image src="../../../static/img/to-top.png" class="direction-btn"></image>
					</view>
				</view>
			</view>
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
				title: '电视控制器',
				serialId: '',
				index: ''
			}
		},
		computed:{
			
		},
		methods: {
			controlTv(key) {
				controlIrDevice(this.serialId, this.index, key, '0').then(res => {
					uni.showToast({
						title: '命令已下发',
						icon: 'none',
						duration: 1500
					});
				}).catch(err => {
					
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
	font-size: 16px;
}
.add-pad {
	padding: 20px 10px;
}

.primary {
	border-color: #0faeff !important;
	color: #0faeff !important;
}
</style>
