<template>
	<view class="content" >
		<m-header :title="title" :theme="true" :bcgColor="status === '00' ? '#ff5500' : status === '01' ? '#d3d3d3' : '#0faeff'"></m-header>
		<view class="curtains-box">
			<view class="head-box" :style="{backgroundColor: status === '00' ? '#ff5500' : status === '01' ? '#d3d3d3' : '#0faeff'}">
				<text class="text-type">{{status === '00' ? '关闭' : status === '01' ? '停止' : '开启'}}</text>
				<image src="/static/img/deviceImg/chuanglian.png" style="width:15vw; height: 15vw;"></image>
			</view>
			<view class="btn-box">
				<view class="wrap" @tap="changeCurtains('00')">
					<text class="mb15">关闭</text>
					<image src="/static/img/deviceImg/close.png" style="width:10vw; height: 10vw;"></image>
				</view>
				<view class="wrap" @tap="changeCurtains('01')">
					<text class="mb15">暂停</text>
					<image src="/static/img/deviceImg/stop.png" style="width:10vw; height: 10vw;"></image>
				</view>
				<view class="wrap" @tap="changeCurtains('02')">
					<text class="mb15">打开</text>
					<image src="/static/img/deviceImg/open.png" style="width:10vw; height: 10vw;"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import mHeader from '../../../components/header.vue'
	import { settingNodeStatus, queryNodeRealStatus } from '../../../api/device.js'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				title: '窗帘管理',
				status: '00'
			}
		},
		methods: {
			changeCurtains(status){
				this.changeNodes(status,() => {
					this.status = status
				})
			},
			changeNodes(status,fn){
				uni.showLoading({
				    title: '命令发送中',
					mask: true
				})
				settingNodeStatus(this.serialId, status).then(res => {
					fn && fn()
					uni.hideLoading()
					uni.showToast({
					    title: '发送成功',
					    duration: 2000
					});
				}).catch(err => {
					uni.hideLoading()
				})
			},
		},
		onLoad(option){
			this.serialId = option.serialId
			if(option.title) this.title = option.title
			if(option.status) this.status = option.status.slice(0,2)
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
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 100%;
	background: skyblue;
}
.text-type {
	font-size: 14px;
	line-height: 40px;
	color: #fff;
}
.btn-box {
	flex: 1;
	display: flex;
	justify-content: space-around;
	padding-top: 10%;
}
</style>
