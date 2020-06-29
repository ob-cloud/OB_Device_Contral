<template>
	<view class="content" >
		<m-header :title="title" :theme="true"></m-header>
		<view class="select-light">
			CH: 
			<picker @change="bindPickerChange" :value="selectIndex"  range-key="label" :range="lightArray" class="my-pick">
				<view class="uni-input top-select">{{lightArray[selectIndex].label}}</view>
			</picker>
		</view>
		<view class="slider-box radio-switch">
			<radio-group @change="radioChange">
				<label class="radio mr10"><radio value="r1" :checked="mySwitch === 'r1'" color="#2d8df9" />彩色</label>
				<label class="radio"><radio value="r2" :checked="mySwitch === 'r2'" color="#2d8df9" />色温</label>
			</radio-group>
		</view>
		<view class="lock-box" :style="{backgroundColor: isOpen ? 'rgba(255,255,255,'+ (percent / 200 + 0.5) + ')' : ''}">
			<view class="lamp-box">
				<image src="/static/img/deviceImg/Switchoff.png" @tap="ReverseLamp('02')" style="width:25vw; height: 25vw;"></image>
				<image src="/static/img/deviceImg/Switchon2.png" @tap="ReverseLamp('01')" style="width:25vw; height: 25vw;"></image>
			</view>
			<view class="slider-box color-box" v-if="mySwitch=== 'r1'" @tap="showColorPicker" :style="{backgroundColor:('rgba('+ color.r + ',' + color.g + ',' + color.b +')')}">
				彩色选择器
			</view>
			<view class="slider-box color-select" v-if="mySwitch=== 'r2'">
				色温<slider class="slider-item" :value="coldNum" @change="sliderCold" activeColor="#1cff2b" backgroundColor="#000000" block-size="24"/>
			</view>
			<view class="slider-box" v-if="mySwitch=== 'r2'">
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
	import { settingNodeStatus, settingRemoteLed } from '../../../api/device.js'
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
				lightArray: [
					{'value':'ffff','label':'全部'},
					{'value':'0100','label':'CH1'},
					{'value':'0200','label':'CH2'},
					{'value':'0400','label':'CH3'},
					{'value':'0800','label':'CH4'},
					{'value':'1000','label':'CH5'},
					{'value':'2000','label':'CH6'},
					{'value':'4000','label':'CH7'},
					{'value':'8000','label':'CH8'},
					{'value':'0001','label':'CH9'},
					{'value':'0002','label':'CH10'},
					{'value':'0004','label':'CH11'},
					{'value':'0008','label':'CH12'},
					{'value':'0010','label':'CH13'},
					{'value':'0020','label':'CH14'},
					{'value':'0040','label':'CH15'},
					{'value':'0080','label':'CH16'},
				],
				selectIndex: 0,
				mySwitch: 'r1'
			}
		},
		methods: {
			sliderChange(e) {
				this.percent = e.detail.value
				this.ReverseLamp()
			},
			sliderCold(e) {
				this.coldNum = e.detail.value
				this.ReverseLamp()
			},
			ReverseLamp(num) {
				const type = num || (this.mySwitch === 'r1'? 'fe':'fd')
				let status = `03${type}${this.lightArray[this.selectIndex].value}`
				if(this.mySwitch === 'r1') {
					let colorR = this.color.r.toString(16),colorG = this.color.g.toString(16),colorB = this.color.b.toString(16);
					status += `${colorR.length > 1 ? colorR : ('0' + colorR)}${colorG.length > 1 ? colorG : ('0' + colorG)}${colorB.length > 1 ? colorB : ('0' + colorB)}05`
				} else if(this.mySwitch === 'r2'){
					let lightNum = Math.round(this.percent).toString(16);
					let coldNum = (100 -  this.coldNum).toString(16);
					status += `${lightNum.length > 1 ? lightNum : ('0' + lightNum)}${coldNum.length > 1 ? coldNum : ('0' + coldNum)}0005`
				}
				this.changeNodes(status)
			},
			changeNodes(status,fn){
				uni.showLoading({
				    title: '命令发送中',
					mask: true
				})
				settingRemoteLed(this.obox_serial_id, this.serialId, status).then(res => {
					fn && fn()
					uni.hideLoading()
					uni.showToast({
					    title: '下发成功',
					    duration: 2000
					});
				}).catch(err => {
					uni.hideLoading()
					console.log('err',err)
				})
			},
			confirm(e) {
				this.color.r = e.rgba.r
				this.color.g = e.rgba.g
				this.color.b = e.rgba.b
				this.ReverseLamp();
			},
			showColorPicker(){
				this.$refs.colorPicker.open();
			},
			bindPickerChange(e) {
				this.selectIndex = e.target.value
			},
			radioChange(e) {
				this.mySwitch = e.target.value
			},
		},
		onLoad(option){
			this.serialId = option.serialId
			this.obox_serial_id = option.obox_serial_id
			if(option.title) this.title = option.title
			if(option.status) {
				// 根据2~4位判断当前设置的类型
				let type = option.status.slice(2,4)
				let colorR = parseInt(option.status.slice(8,10), 16)
				let colorG = parseInt(option.status.slice(10,12), 16)
				let colorB = parseInt(option.status.slice(12,14), 16)
				if(type === 'fd') { //色温,亮度的值是0-100
					this.mySwitch = 'r2'
					this.percent = colorR
					if(colorG > 0 && colorG < 101) { 
						this.coldNum = 100 - colorG
					}
				} else { //彩色
					this.color = {r: colorR,g: colorG,b: colorB, a: 1}
				}
			}
		}
	}
</script>

<style>
.content {
	justify-content: center;
	align-items: center;
	background-color: #0faeff;
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
	justify-content: center;
	color: #C0C0C0;
	height: 50vw;
	width: 50vw;
	border-radius: 50%;
	margin: 0 auto;
	padding: 0;
	box-shadow: 0px 0px 10px #fff;
}
.select-light {
	color: #fff;
	width: 100%;
	margin: 10px 0;
	padding-left: 30px;
	font-size: 16px;
}
.radio-switch {
	background: transparent;
	color: #fff;
	width: 100%;
	padding-left: 30px;
}
.my-pick {
	display: inline-block;
	width: 50vw;
	padding-left: 2vw;
}
</style>
