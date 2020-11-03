<template>
	<view class="content" >
		<m-header :title="title" :theme="true"></m-header>
		<view class="lock-box" :style="{backgroundColor: isOpen ? 'rgba(255,255,255,'+ (percent / 200 + 0.5) + ')' : ''}">
			<view class="lamp-box">
				<image :src="isOpen ? '/static/img/deviceImg/lampSwitch.png' : '/static/img/deviceImg/Switchoff.png'" @tap="ReverseLamp" style="width:25vw; height: 25vw;"></image>
			</view>
			<view class="slider-box color-select" v-if="haveCold">
				色温<slider class="slider-item" :value="coldNum" @change="sliderCold" activeColor="#1cff2b" backgroundColor="#000000" block-size="24"/>
			</view>
			<view class="slider-box">
				亮度<slider  class="slider-item" :value="percent" @change="sliderChange" activeColor="#FFCC33" backgroundColor="#000000" block-size="24" step="2"/>
			</view>
		</view>	
	</view>
</template>

<script>
	import mHeader from '@/components/header.vue'
	import { settingNodeStatus, queryNodeRealStatus } from '@/api/device.js'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				title: '单色灯管理',
				percent: 0,
				isOpen: false,
				coldNum: 0,
				haveCold: false,
				serialId: '',
				timer: null,
				controlNum: 0
			}
		},
		methods: {
			sliderChange(e) {
				let setNum = e.detail.value === 0 ? '00' : (e.detail.value + 154).toString(16)
				if(this.haveCold) {
					this.changeNodes(setNum + (this.dealColdNum() + 'ff0000000200'))
				} else {
					this.changeNodes(setNum + '00000000000200')
				}
			},
			sliderCold(e) {
				let setNum = this.percent === 0 ? '00' : (this.percent + 154).toString(16)
				this.changeNodes(setNum + (this.dealColdNum(e.detail.value) + 'ff0000000200'))
			},
			ReverseLamp() {
				let num = (this.isOpen ? '00' : 'ff')
				this.isOpen = !this.isOpen;
				if(this.haveCold) {
					num += ( this.dealColdNum() + 'ff0000000200')
				} else {
					num +='00000000000200'
				}
				this.changeNodes(num)
			},
			changeNodes(status,fn){
				// uni.showLoading({
				//     title: '命令发送中',
				// 	mask: true
				// })
				this.controlNum += 1;
				settingNodeStatus(this.serialId, status).then(res => {
					fn && fn()
					this.checkStatus(this.controlNum);
				}).catch(err => {
					uni.hideLoading()
					console.log('err',err)
				})
			},
			checkStatus(num){
				if(this.timer) {
					clearTimeout(this.timer);	
				};
				this.timer =  setTimeout(() => {
						this.getRealStatus(num)
						this.timer = null;
				}, 1000)
			},
			getRealStatus(num){
				queryNodeRealStatus(this.serialId).then(res => {
					uni.hideLoading()
					if(res.data && res.data.status && this.controlNum === num) {
						// 单色灯第一位
						let switchsArr = parseInt(res.data.status.slice(0,2),16)
						if(switchsArr > 0) {
							this.isOpen = true;
							this.percent = switchsArr - 154
						} else {
							this.isOpen = false;
							this.percent = 0
						}
						if(this.haveCold) {
							let switchsArr = parseInt(res.data.status.slice(2,4),16)
							this.coldNum = 100 - Math.round(switchsArr / 2.55)
						}
					}
				}).catch(err => {
					uni.hideLoading()
					console.log('err', err)
				})
			},
			dealColdNum(num){
				let tarNum = num >= 0 ? num : this.coldNum
				let coldNum = (255 -  Math.round(tarNum * 2.55)).toString(16);
				console.log('coldNum',coldNum)
				return (coldNum.length > 1 ? coldNum : ('0' + coldNum))
			}
		},
		onLoad(option){
			this.serialId = option.serialId
			if(option.title) this.title = option.title
			if(option.status) {
				let switchsArr = parseInt(option.status.slice(0,2),16)
				if(switchsArr > 0) {
					this.isOpen = true;
					this.percent = switchsArr - 154
				}
			}
			// 双色灯处理
			if(option.color) {
				this.haveCold = true;
				let switchsArr = parseInt(option.status.slice(2,4),16)
				this.coldNum = 100 - Math.round(switchsArr / 2.55)
			}
		}
	}
</script>

<style>
.content {
	justify-content: center;
	align-items: center;
	background-color: #3e4450;
}
.lock-box {
	flex: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.slider-box {
	margin: 0 6vw 20px;
	border-radius: 20px;
	background-color: #fff;
	display: flex;
	align-items: center;
	padding-left: 1em;
	font-size: 12px;
	color: #666666;
}
.slider-item {
	flex: 1;
}
.color-select {
	background-image: linear-gradient(to right, #fff, #ffffd4, #ffaa00, #ff9100);
}
.lamp-box {
	display: flex;
	justify-content: center;
	margin-bottom: 40px;
}
</style>
