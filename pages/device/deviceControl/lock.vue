<template>
	<view class="content" >
		<m-header :title="title" :theme="true"></m-header>
		<view class="lock-box">
			<view class="uni-list">
				<view class="lock-img">
					<img src="@/static/img/deviceImg/lock.png" style="width:40vw;height: 40vw;margin: 15px auto;" alt="">
				</view>
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">
						开始时间
					</view>
					<view class="uni-list-cell-db">
						<picker mode="date" :value="date" @change="bindDateChange">
							<view class="uni-input">{{date || '请选择开始时间'}}</view>
						</picker>
					</view>
				</view>
				<view class="uni-list-cell">
					<view class="uni-list-cell-left">
						结束时间
					</view>
					<view class="uni-list-cell-db">
						<picker mode="date" :value="endDate" :start="date" @change="bindDateChangeEnd">
							<view class="uni-input" placehodel="111">{{endDate || '请选择结束时间'}}</view>
						</picker>
					</view>
				</view>
				<view class="uni-list-cell no-border">
					<view class="uni-list-cell-left">
						接收人手机号码
					</view>
					<view class="uni-list-cell-db">
						<input class="uni-input" @input="onKeyInput" placeholder="请输入接收人手机号码" />
					</view>
				</view>
				<view class="uni-list-cell no-border">
					<button type="primary" class="primary sendPass" :disabled="!(date && endDate && phone && phone.length===11)" @tap="sendOpenNum">发送在线密码</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { addUserNoAuth } from '../../../api/device.js'
	import dayjs from 'dayjs'
	import mHeader from '../../../components/header.vue'
	export default {
		components: {
			mHeader
		},
		data() {
			return {
				date: "",
				endDate: "",
				phone: '',
				serialId: '',
				title: '',
			}
		},
		methods: {
			bindDateChange(e) {
				this.date = e.detail.value
			},
			bindDateChangeEnd(e) {
				this.endDate = e.detail.value
			},
			onKeyInput(event) {
				this.phone = event.target.value
			},
			sendOpenNum() {
				// serialId, startTime, endTime, mobile
				addUserNoAuth(this.serialId, (dayjs(this.date) - 0) ,(dayjs(this.endDate).add(1, 'day') - 1),this.phone).then(ele => {
					console.log('date',ele)
					uni.showToast({
						title: '发送成功',
						duration: 1000
					});
				}).catch(err => {
					console.log('err',err)
					uni.showToast({
						title: '发送错误',
						icon: 'none',
						duration: 1000
					});
				})
			}
		},
		onLoad(option){
			this.serialId = option.serialId
			if(option.title) this.title = option.title
		}
	}
</script>

<style>
.content {
	justify-content: center;
	align-items: center;
	background-color: #fff;
}
.lock-box {
	flex: 1;
	width: 100%;
	display: flex;
}
.uni-list {
    width: 100%;
    display: -webkit-box;
    display: flex;
    flex-direction: column;
	flex: 1;
	padding: 0 5vw;
}
.uni-list-cell {
    background-color: #fff;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
	border-bottom: 1px solid #ccc;
}
.lock-img {
	margin-top: 5vh;
	display: flex;
	justify-content: center;
	padding-right: 2vw;
	background-color: rgba(15, 174, 255, .2);
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
}
.uni-list-cell-left {
    white-space: nowrap;
    font-size: 14px;
    padding: 0 15px;
	flex: 0 0 130px;
}
.uni-list-cell-db, .uni-list-cell-right {
    flex: 1;
}
.sendPass {
	flex: 1;
	border-radius:unset;
	border: none;
}
.sendPass:after {
	height: 0;
}
.uni-input {
    height: 25px;
    padding: 7px 12px;
    line-height: 25px;
    font-size: 14px;
    background: #fff;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
}
</style>
