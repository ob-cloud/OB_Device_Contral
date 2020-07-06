<template>
	<view class="content" >
		<m-header :title="title" theme bcgColor="#0faeff"></m-header>
		<view class="curtains-box">
			<view class="head-box" >
				<view class="text-type wrap">
					<text class="warm-num">{{showTemp}}℃</text>
					<text>温度</text>
				</view>
				<view class="other-type">
					<view class="text-type wrap">
						<text class="warm-num">{{showSpeed}}</text>
						<text>风速</text>
					</view>
					<view class="text-type wrap">
						<text class="warm-num">{{showMode}}</text>
						<text>模式</text>
					</view>
					<view class="text-type wrap">
						<text class="warm-num">{{showSwing}}</text>
						<text>摆风</text>
					</view>
				</view>
			</view>
			<view class="btn-box">
				<view class="top-btn">
					<view>
						<picker @change="bindPickerChange" :disabled="model === '00'" :value="pickIndex" :range="array" range-key="value">
							<view class="wrap">
								<image src="/static/img/deviceImg/modelChange.png" style="width:10vw; height: 10vw;"></image>
								<text>模式</text>
							</view>
						</picker>
					</view>
					<view class="wrap">
						<image v-if="model !== '00'" src="/static/img/deviceImg/btnClose.png" style="width:10vw; height: 10vw;" @tap="switchBtn('00')"></image>
						<image v-else src="/static/img/deviceImg/btnOpen.png" style="width:10vw; height: 10vw;" @tap="switchBtn('21')"></image>
						<text>开关</text>
					</view>
					<view class="wrap">
						<image src="/static/img/deviceImg/windSpeed.png" style="width:10vw; height: 10vw;" @tap="dealSpeed"></image>
						<text>风速</text>
					</view>
				</view>
				<view class="warn-btn">
					<view class="warm-btn" @tap="downWarm">-</view>
					<text>温度</text>
					<view class="warm-btn" @tap="upWarm">+</view>
				</view>
				<view class="top-btn">
					<view class="wrap">
						<image src="/static/img/deviceImg/columnContral.png" style="width:10vw; height: 10vw;" @tap="columnContral"></image>
						<text>上下摆风</text>
					</view>
					<view class="wrap">
						<image src="/static/img/deviceImg/rowControl.png" style="width:10vw; height: 10vw;" @tap="rowControl"></image>
						<text>左右摆风</text>
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
				title: '空调控制器',
				serialId: '',
				index: '',
				model: '00',
				temp: 'ff',
				speed: '00',
				upSwing: 'ff',
				leftSwing: 'ff',
				array: [
					{"key":"11","value":"自动"},
					{"key":"21","value":"制冷"},
					{"key":"31","value":"抽湿"},
					{"key":"41","value":"送风"},
					{"key":"51","value":"制热"},
				],
				pickIndex: 0,
			}
		},
		computed:{
			showMode: function(){
				if(this.model === '00') return '关机';
				if(this.model === '01') return '开机';
				return (this.array.find(ele => this.model === ele.key) || {value: '---'}).value
			},
			showSwing: function(){
				if(this.model === '00') return '--';
				return `${this.upSwing === '01' ? '↕' : ''}${this.leftSwing === '01' ? '↔' : ''}` || '--'
			},
			showSpeed: function(){
				if(this.model === '00') return '--';
				return `${this.speed === '00' ? '自动' : this.speed === '01' ? '弱' : this.speed === '02' ? '中' : this.speed === '03' ? '强' : '无效'}`
			},
			showTemp: function(){
				// 2100190000310000
				if(['21','41','51'].indexOf(this.model) === -1) return '--';
				return parseInt(this.temp, 16) || '--'
			}
		},
		methods: {
			dealStatus(status){ //处理空调状态码,开机默认制冷26度
				if(status.slice(0, 2) === '01') {
					this.model = '21';
					this.temp = '1a';
				} else {
					this.model = status.slice(0, 2);
					this.temp = status.slice(4, 6);
				}
				this.speed = status.slice(2, 4);
				this.upSwing = status.slice(6, 8);
				this.leftSwing = status.slice(8, 10);
			},
			bindPickerChange(e) {
				if(e.target.value === this.idnex) return;
				let key = this.array[e.target.value].key
				switch (key){//默认初始化制冷制热26度
					case '11':
					// 自动无温度，使用ff代替
						this.changeAir(`11${this.speed}ff${this.upSwing}${this.leftSwing}0103`)
						break;
					case '21':
						this.changeAir(`21${this.speed}1a${this.upSwing}${this.leftSwing}0103`)
						break;
					case '31':
					// 抽湿无温度，仅1挡01ff
						this.changeAir(`3101ff${this.upSwing}${this.leftSwing}0103`)
						break;
					case '41':
					// 无自动风量
						this.changeAir(`41${this.speed === '00'? '01' : this.speed}1a${this.upSwing}${this.leftSwing}0103`)
						break;
					case '51':
						this.changeAir(`51${this.speed}1a${this.upSwing}${this.leftSwing}0103`)
						break;
					default:
						break;
				}
			},
			switchBtn(str){ //开关
				this.controlIrDevice(str === '21' ? 'on' : 'off',() => {
					this.temp = '1a';
					this.speed = '00';
					this.model = str;
				})
			},
			dealSpeed() {
				// 送风(41)无自动 抽湿(31)仅1档
				if(this.model === '31') return;
				let num = '0' + (parseInt(this.speed, 16) + 1) % 4;
				if(this.model === '41' && num === '00') {
					num = '01'
				} 
				this.changeAir(`${this.model}${num}${this.temp}${this.upSwing}${this.leftSwing}0103`)
			},
			columnContral() {
				this.changeAir(`${this.model}${this.speed}${this.temp}${this.upSwing !== '01' ? '01': '00'}${this.leftSwing}0103`)
			},
			rowControl() {
				this.changeAir(`${this.model}${this.speed}${this.temp}${this.upSwing}${this.leftSwing !== '01' ? '01': '00'}0103`)
			},
			downWarm(){
				const warmNum = parseInt(this.temp, 16) - 1
				if(warmNum < 16 ) return;
				const temp = warmNum.toString(16)
				this.changeAir(`${this.model}${this.speed}${temp}${this.upSwing}${this.leftSwing}0103`)
			},
			upWarm(){
				const warmNum = parseInt(this.temp, 16) + 1
				if(warmNum > 30) return;
				const temp = warmNum.toString(16)
				this.changeAir(`${this.model}${this.speed}${temp}${this.upSwing}${this.leftSwing}0103`)
			},
			changeAir(status) { //改变状态，并查询最新status
				this.controlIrDevice(this.bytesToKey(status),() => {
					this.dealStatus(status)
				})
			},
			controlIrDevice(str,fn) {
				uni.showLoading({
				    title: '命令下发中'
				});
				controlIrDevice(this.serialId, this.index, str, '0').then(res => {
					fn && fn()
					uni.hideLoading()
				}).catch(err => {
					console.log('err', err)
					uni.hideLoading()
				})
			},
			bytesToKey(states) { //将原来bytes的参数转换为key的形式
				return this.getAirConditionKeys(states.slice(4,6),states.slice(0,2),states.slice(2,4),states.slice(6,8),states.slice(8,10))
			},
			getAirConditionKeys(templure, mode, speed, windVertical, windHorizon) {
			  const modeMap = {'11': 'a', '21': 'r', '31': 'd', '41': 'w', '51': 'h'}[mode]
			  const speedMap = {'00': 's0', '01': 's1', '02': 's2', '03': 's3'}[speed]
			  const windVerticalMap = {'00': 'u0', '01': 'u1'}[windVertical] || ''
			  const windHorizonMap = {'00': 'l0', '01': 'l1'}[windHorizon] || ''
			  return `${modeMap}_${speedMap}_${templure==='ff'? '': parseInt(templure, 16)}_${windVerticalMap}_${windHorizonMap}_p0`
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
}
.head-box {
	height: 40%;
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-direction: column;
	width: 100%;
	background-color: #0faeff;
	color: #fff;
	font-size: 15px;
	line-height: 24px;
}
.warm-num {
	font-size: 18px;
	font-weight: bold;
}
.other-type {
	width: 100%;
	display: flex;
	justify-content: space-around;
}
.btn-box {
	flex: 1;
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-direction: column;
	padding-top: 10%;
}
.top-btn {
	width: 100%;
	max-width: 375px;
	display: flex;
	justify-content: space-around;
}
.warn-btn {
	box-sizing: border-box;
	height: 40px;
	width: calc(100% - 20vw);
	max-width: 375px;
	font-size: 18px;
	font-weight: bold;
	border: 1px solid #C0C0C0;
	border-radius: 40px;
	display: flex;
	justify-content: space-between;
	align-items: stretch;
	line-height: 38px;
}
.warm-btn {
	padding: 0 40px;
}
</style>
