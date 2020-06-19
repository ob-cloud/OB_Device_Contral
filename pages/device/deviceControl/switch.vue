<template>
	<view class="content" >
		<m-header :title="title"></m-header>
		<view class="img-infrared">
			<!-- 红外 -->
			<image v-for="(item, index) in infraredList" :key="index" :src="'../../../static/img/deviceImg/' + (item ? 'infrared.png' : 'infraredoff.png')" @click="changeInfrared(index)" :style="{width: '15vw', height: '10vw'}" class="infrared-img"></image>
		</view>
		<view class="img-scene">
			<!-- 场景 -->
			<image v-for="(item, index) in screenList" :key="index" :src="'../../../static/img/deviceImg/' + (item ? 'sceneon.png' : 'sceneoff.png')" @click="changeScene(index)" :style="{width: '25vw', height: '25vw'}" class="switch-img"></image>
		</view>
		<view class="img-box" v-if="socketList.length < 1">
			<!-- 开关 -->
			<image v-for="(item, index) in switchsList" :key="index" :src="'../../../static/img/deviceImg/' + (item ? 'Switchon.png' : 'Switchoff.png')" @click="changeSwitchs(index)" :style="{order: 100 - index, width: switchWidth, height: switchWidth}" class="switch-img"></image>
		</view>
		<view class="img-socket" v-else>
			<!-- 插座2 -->
			<image v-for="(item, index) in socketList" :key="index" :src="'../../../static/img/deviceImg/' + (item ? 'socketon.png' : 'socketoff.png')" @click="changeSocket(index)" :style="{order: 100 - index, width: '25vw', height: '25vw'}" class="switch-img"></image>
		</view>
	</view>
</template>

<script>
	import { settingNodeStatus } from '../../../api/device.js'
	import mHeader from '../../../components/header.vue'
	import deviceInfo from '../../../common/deviceInfo.js'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				socketList: [],//红外场景 
				screenList: [], //场景列表
				infraredList: [],//红外场景 
				switchsList: [],//按钮
				switchWidth: '25vw',
				status: [false,false,false],
				lock: false,
				serialId: '',
				title: '',
			}
		},
		methods: {
			changeInfrared(index) {//红外场景事件
				const sceneNum = Math.pow(2, this.screenList.length + index).toString(16)
				this.settingStatus(this.dealSwitchs(this.switchsList, sceneNum.length > 1 ? sceneNum: ('0' + sceneNum) ), () => {
					this.infraredList = Object.assign([],this.infraredList,{[index]: true})
					setTimeout(() => {
						this.infraredList = Object.assign([],this.infraredList,{[index]: false})
					},1000)
				})
			},
			changeScene(index){//场景事件
				const sceneNum = Math.pow(2, index).toString(16)
				this.settingStatus(this.dealSwitchs(this.switchsList, sceneNum.length > 1 ? sceneNum: ('0' + sceneNum) ), () => {
					this.screenList = Object.assign([],this.screenList,{[index]: true})
					setTimeout(() => {
						this.screenList = Object.assign([],this.screenList,{[index]: false})
					},1000)
				})
			},
			changeSwitchs(index) {//按钮事件
				const tarArr = Object.assign([],this.switchsList, {[index]: !this.switchsList[index]})
				this.settingStatus(this.dealSwitchs(tarArr), () => {
					this.switchsList = tarArr
				})
			},
			changeSocket(index) {//插座事件
				const sceneNum = Math.pow(2, index).toString(16)
				const tarArr = Object.assign([],this.socketList, {[index]: !this.socketList[index]})
				this.settingStatus(this.dealSocket(tarArr), () => {
					this.socketList = tarArr
				})
			},
			dealSwitchs(tarArr,sceneNum){//处理开关状态status
				let num = parseInt(tarArr.map(ele => ele ? '01': '00').join('') || '0',2).toString(16)
				if(this.screenList.length) {
					return  (sceneNum || '00') + (num.length > 1 ? num : ('0'+ num)) + Array(13).join('0')
				} else {
					return  (num.length > 1 ? num : ('0'+ num)) + Array(15).join('0')
				}
			},
			dealSocket(tarArr){//处理按钮
				let num = parseInt(tarArr.map(ele => ele ? '1': '0').join(''),2).toString(16)
				return (num.length > 1 ? num : ('0'+ num)) + Array(15).join('0')
			},
			settingStatus(status,fn){//设置场景接口
				if(this.lock) return;
				this.lock = true
				uni.showLoading({
					title: '发送中'
				});
				settingNodeStatus(this.serialId, status).then(res => {
					fn && fn()
					this.lock = false
					uni.hideLoading()
				}).catch(err => {
					console.log('err settingStatus',err)
					this.lock = false
					uni.hideLoading()
				})
			},
			PrefixInteger(num, length) {//凑长度为8字节
				return (Array(length).join('0') + num).slice(-length);
			}
		},
		onLoad(option){
			console.log('option',option)
			this.serialId = option.serialId;
			if(option.title) this.title = option.title
			if(option.socketNum) { //处理插座，插座是单独使用的
				let switchsArr,socketList=[];
				switchsArr = this.PrefixInteger(parseInt(option.status.slice(0,2),16).toString(2), option.socketNum * 1);
				for (let i = 0; i < option.socketNum; i++) {
					socketList[i] = switchsArr[i] === '1'
				}
				this.socketList = socketList
			}
			if(option.sceneNum) { //处理场景,场景只要触发的时候发送值，按钮事件场景传00
				if(option.infrared) {
					this.screenList = new Array(option.sceneNum - option.infrared).fill(false)
					this.infraredList = new Array(option.infrared * 1).fill(false)
				} else {
					this.screenList = new Array(option.sceneNum * 1).fill(false)
				}
			}
			if(option.switchsNum) { //处理开关,有场景就是用第二个字段
				let statusStr,switchsArr,switchsList=[];
				if(option.sceneNum) {
					switchsArr = this.PrefixInteger(parseInt(option.status.slice(2,4),16).toString(2), option.switchsNum * 2);
				} else {
					switchsArr = this.PrefixInteger(parseInt(option.status.slice(0,2),16).toString(2), option.switchsNum * 2);
				}
				for (let i = 0; i < option.switchsNum; i++) {
					switchsList[i] = switchsArr.substr(i*2, 2) === '01'
				}
				this.switchsList = switchsList
				this.switchWidth = switchsList.length > 3 ? '20vw' : Math.floor(80 / switchsList.length) + 'vw'
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
.isOn {
	background: #0fafff;
}
.img-box {
	flex: 3 1;
	display: flex;
	justify-content: space-around;
	width: 94%;
	flex-wrap: wrap;
	align-content:flex-start;
}
.img-scene {
	display: flex;
	justify-content: space-around;
	width: 94%;
	flex-wrap: wrap;
	align-content:flex-start;
}
.switch-img {
	margin: 20px 0;
}
.img-infrared {
	flex: 1 1;
	display: flex;
	align-items:flex-end;
	margin-bottom: 15px;
}
.img-socket {
	flex: 3 1;
	display: flex;
	justify-content: space-around;
	width: 94%;
	flex-wrap: wrap;
	align-content:end;
}
</style>
