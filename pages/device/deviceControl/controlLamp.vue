<template>
	<view class="content" >
		<m-header :title="title" :theme="true"></m-header>
		<view class="select-light">
			CH: 
			<picker @change="bindPickerChange" :value="selectIndex"  range-key="label" :range="lightArray" class="">
				<view class="uni-input top-select">{{lightArray[selectIndex].label}}</view>
			</picker>
		</view>
		<view class="lock-box" :style="{backgroundColor: isOpen ? 'rgba(255,255,255,'+ (percent / 200 + 0.5) + ')' : ''}">
			<view class="lamp-box">
				<image src="/static/img/deviceImg/Switchoff.png" @tap="ReverseLamp" style="width:25vw; height: 25vw;"></image>
				<image src="/static/img/deviceImg/Switchon2.png" @tap="ReverseLamp" style="width:25vw; height: 25vw;"></image>
			</view>
			<view class="slider-box color-box" @tap="showColorPicker" :style="{backgroundColor:('rgba('+ color.r + ',' + color.g + ',' + color.b +')')}">
				彩色选择器
			</view>
			<view class="slider-box color-select">
				色温<slider class="slider-item" :value="coldNum" @change="sliderCold" activeColor="#1cff2b" backgroundColor="#000000" block-size="24"/>
			</view>
			<view class="slider-box">
				亮度<slider  class="slider-item" :value="percent" @change="sliderChange" activeColor="#FFCC33" backgroundColor="#000000" block-size="24" step="2"/>
			</view>
		</view>	
		<!-- 颜色选择器 -->
		 <t-color-picker ref="colorPicker" :showOpcity="false" :color="color" @confirm="confirm"></t-color-picker>
	</view>
</template>

<script>
	import mHeader from '../../../components/header.vue'
	import tColorPicker from '../../../components/t-color-picker/t-color-picker.vue'
	import { settingNodeStatus, queryNodeRealStatus } from '../../../api/device.js'
	export default {
		components: {
			mHeader,
			tColorPicker
		},
		data() {
			return {
				title: '遥控灯',
				percent: 0,
				isOpen: false,
				coldNum: 0,
				haveCold: false,
				color: {r: 255,g: 255,b: 255, a: 1},
				lightArray: [{'value':'ffff','label':'全部'}],
				selectIndex: 0
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
				if(this.haveCold) {
					num += ( this.dealColdNum() + 'ff0000000200')
				} else {
					num +='00000000000200'
				}
				this.changeNodes(num)
			},
			changeNodes(status,fn){
				uni.showLoading({
				    title: '命令发送中',
					mask: true
				})
				settingNodeStatus(this.serialId, status).then(res => {
					fn && fn()
				}).catch(err => {
					uni.hideLoading()
					console.log('err',err)
				})
			},
			dealColdNum(num){
				let tarNum = num || this.coldNum
				let coldNum = (255 -  Math.round(tarNum * 2.55)).toString(16);
				console.log('coldNum',coldNum)
				return (coldNum.length > 1 ? coldNum : ('0' + coldNum))
			},
			confirm(e) {
				this.color.r = e.rgba.r
				this.color.g = e.rgba.g
				this.color.b = e.rgba.b
			},
			showColorPicker(){
				this.$refs.colorPicker.open();
			},
			bindPickerChange(e) {
				this.selectIndex = e.target.value
			},
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
.color-box {
	height: 90px;
	justify-content: center;
	color: #C0C0C0;
}
.select-light {
	width: 100%;
}
.select-light {
	color: #fff;
	width: 100%;
	margin: 10px 0;
	padding-left: 10px;
	font-size: 16px;
}
</style>
