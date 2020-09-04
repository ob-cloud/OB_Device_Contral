<template>
	<view class="content" >
		<m-header :title="title"></m-header>
		<view class="swicth-box">
			<view class="img-infrared" v-if="infraredList.length > 0">
				<!-- 红外 -->
				<image v-for="(item, index) in infraredList" :key="index" :src="'/static/img/deviceImg/' + (item ? 'infrared.png' : 'infraredoff.png')" @tap="changeInfrared(index)" :style="{width: '15vw', height: '10vw'}" class="infrared-img"></image>
			</view>
			<view class="img-scene" v-if="screenList.length > 0">
				<!-- 场景 -->
				<image v-for="(item, index) in screenList" :key="index" :src="'/static/img/deviceImg/' + (item ? 'sceneon.png' : 'sceneoff.png')" @tap="changeScene(index)" class="switch-img" :class="{'four-items': screenList.length === 4 }"></image>
			</view>
			<view class="img-box" v-if="switchsList.length > 0">
				<!-- 开关 -->
				<image v-for="(item, index) in switchsList" :key="index" :src="'/static/img/deviceImg/' + (item ? 'Switchon.png' : 'Switchoff.png')" @tap="changeSwitchs(index)" :style="{order: 100 - index}" class="switch-img"  :class="{'four-items': switchsList.length === 4 }"></image>
			</view>
			<view class="img-socket" v-if="socketList.length > 0">
				<!-- 插座2 -->
				<image v-for="(item, index) in socketList" :key="index" :src="'/static/img/deviceImg/' + (item ? 'socketon.png' : 'socketoff.png')" @tap="changeSocket(index)" :style="{order: 100 - index}" class="switch-img" :class="{'four-items': socketList.length === 4 }"></image>
			</view>
			<view class="img-curtain" v-if="curtainList.length > 0">
				<!-- 窗帘控制面板 -->
				<view class="img-curtain-item" v-for="(item, index) in curtainList" :key="index">
					<image  :src="'/static/img/deviceImg/' + (item ? 'sceneon.png' : 'sceneoff.png')" @tap="changeCurtain(index)" class="curtain-img"></image>
					<text>{{['打开','停止','关闭'][index % 3]}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { settingNodeStatus, queryNodeRealStatus } from '@/api/device.js'
	import mHeader from '@/components/header.vue'
	import deviceInfo from '@/common/deviceInfo.js'
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
				curtainList: [], //窗帘控制面板
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
					// this.switchsList = tarArr
				})
			},
			changeSocket(index) {//插座事件
				const sceneNum = Math.pow(2, index).toString(16)
				const tarArr = Object.assign([],this.socketList, {[index]: !this.socketList[index]})
				this.settingStatus(this.dealSocket(tarArr), () => {
					// this.socketList = tarArr
				})
			},
			changeCurtain(index) {
				const tarNum = ('0'+ Math.pow(2,index).toString(16)).slice(-2) + '00000000000000';
				this.settingStatus(tarNum , () => {
					this.curtainList = Object.assign([],this.curtainList,{[index]: true})
					setTimeout(() => {
						this.curtainList = Object.assign([],this.curtainList,{[index]: false})
					},1000)
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
					title: '发送中',
					mask: true
				});
				settingNodeStatus(this.serialId, status).then(res => {
					fn && fn()
					this.lock = false
					setTimeout(() => {
						this.getRealStatus()
					}, 800)
				}).catch(err => {
					console.log('err settingStatus',err)
					this.lock = false
					uni.hideLoading()
				})
			},
			getRealStatus(){//重新获取状态渲染按钮
				queryNodeRealStatus(this.serialId).then(res => {
					uni.hideLoading()
					if(res.data && res.data.status) {
						if(this.switchsList.length) { //处理按钮
							let statusStr,switchsArr,switchsList=[];
							if(this.screenList.length > 0) {
								switchsArr = this.PrefixInteger(parseInt(res.data.status.slice(2,4),16).toString(2), this.switchsList.length * 2);
							} else {
								switchsArr = this.PrefixInteger(parseInt(res.data.status.slice(0,2),16).toString(2), this.switchsList.length * 2);
							}
							for (let i = 0; i < this.switchsList.length; i++) {
								switchsList[i] = switchsArr.substr(i*2, 2) === '01'
							}
							this.switchsList = switchsList
						}
						if(this.socketList.length) { //处理插座
							let switchsArr,socketList=[];
							switchsArr = this.PrefixInteger(parseInt(res.data.status.slice(0,2),16).toString(2), this.socketList.length * 1);
							for (let i = 0; i < this.socketList.length; i++) {
								socketList[i] = switchsArr[i] === '1'
							}
							this.socketList = socketList
						}
					}
				}).catch(err => {
					uni.hideLoading()
					console.log('err', err)
				})
			},
			PrefixInteger(num, length) {//凑长度为8字节
				return (Array(length).join('0') + num).slice(-length);
			}
		},
		onLoad(option){
			// option.curtainNum = 2
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
			if(option.curtainNum) { //处理插座，插座是单独使用的
				this.curtainList = new Array(option.curtainNum * 3).fill(false)
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
	/* flex: 3 1; */
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
.img-curtain {
	display: flex;
	justify-content: space-around;
	width: 94%;
	flex-wrap: wrap;
	align-content:flex-start;
}
.img-curtain-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: #fff;
	margin-bottom: 20px;
}
.curtain-img {
	margin:0;
	width: 25vw;
	height: 25vw;
}
.switch-img {
	margin: 20px 0;
	width: 25vw;
	height: 25vw;
}
.four-items {
	margin: 20px 10vw;
}
.img-infrared {
	/* flex: 1 1; */
	display: flex;
	align-items:flex-end;
	margin-bottom: 15px;
}
.img-socket {
	/* flex: 3 1; */
	display: flex;
	justify-content: space-around;
	width: 94%;
	flex-wrap: wrap;
	align-content:end;
}
.swicth-box {
	flex: 1;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	width: 100%;
}
</style>
