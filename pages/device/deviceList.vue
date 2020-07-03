<template>
	<view class="scene">
		<uni-section title="设备列表" type="line">
			<picker @change="bindPickerChange" :value="selectIndex"  range-key="label" :range="array">
				<view class="uni-input top-select">{{array[selectIndex].label}}</view>
			</picker>
		</uni-section>
		<view class="example-body">
			<uni-grid :column="3" :highlight="true">
				<uni-grid-item v-for="(item, index) in deviceList" :index="index" :key="index" v-if="!array[selectIndex].value || item.obox_serial_id === array[selectIndex].value"  @tap="contralDevice(index)">
					<view class="grid-item-box" style="background-color: #fff;">
						<image :src="`/static/img/deviceImg/` + getImageName(item) + '.png'">
						<text class="text">{{ item.name }}</text>
						<text class="device-status">
							{{getStatus(item)}}
						</text>
					</view>
				</uni-grid-item>
				<!-- 红外设备 -->
				<uni-grid-item v-for="(item, index) in aliDev" :index="index + 100" :key="item.deviceId" @tap="controlAliDev(item)">
					<view class="grid-item-box" style="background-color: #fff;">
						<image src="/static/img/deviceImg/infra_home.png">
						<text class="text">{{ item.name }}</text>
						<text class="device-status">
							
						</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</view>
	</view>
</template>
<script>
	import { getDeviceList ,queryAliDev } from '@/api/device.js'
	import { deviceInfo } from '@/common/deviceInfo.js'
	import Suit from '@/common/suit.umd.js'
	import { getDevicePath } from '@/common/deviceInfo.js'
	import {
		mapState,
		mapActions
	} from 'vuex'
	import uniSection from '@/components/uni-section/uni-section.vue'
	import uniGrid from '@/components/uni-grid/uni-grid.vue'
	export default {
		computed: {
			...mapState(['forcedLogin', 'hasLogin', 'oboxList']),
			array(){
				let tarArr = [{'value':'','label':'全部'}],obj = {}
				this.deviceList.forEach(ele => {
					if(ele.obox_serial_id && !obj[ele.obox_serial_id]) {
						obj[ele.obox_serial_id] = true;
						tarArr.push({'value': ele.obox_serial_id,'label': this.dealOboxName(ele.obox_serial_id)})
					} 
				})
				return tarArr
			}
		},
		components:{
			uniSection,
			uniGrid
		},
		data(){
			return {
				deviceList: [],
				selectIndex: 0,
				aliDev: []
			}
		},
		onLoad() {
		},
		onShow(){
			if (this.hasLogin) { 
				// 设备列表，红外设备
				this.getDeviceList()
				// 获取obox列表1
				if(!this.oboxList.length) {
					this.getOboxList()
				}
			} else {
				this.deviceList = []
				this.aliDev = []
				uni.showModal({
					title: '未登录',
					content: '您未登录，需要登录后才能继续',
					/**
					 * 如果需要强制登录，不显示取消按钮
					 */
					showCancel: !this.forcedLogin,
					success: (res) => {
						if (res.confirm) {
							/**
							 * 如果需要强制登录，使用reLaunch方式
							 */
							if (this.forcedLogin) {
								uni.reLaunch({
									url: '../login/login'
								});
							} else {
								uni.navigateTo({
									url: '../login/login'
								});
							}
						}
					}
				});
			}
		},        
		methods: {
			...mapActions(["getOboxList"]),
			dealExtra(item) {
				if(item.obox_serial_id) return this.dealOboxName(item.obox_serial_id)
				return ''
			},
			dealOboxName(str) {
				return (this.oboxList.find(item => item.obox_serial_id === str) || {'obox_name': str}).obox_name
			},
			bindPickerChange(e) {
				this.selectIndex = e.target.value
			},
			// 获取设备列表
			getDeviceList(){
				uni.showLoading({
				    title: '加载中'
				});
				getDeviceList({}).then(res => {
					uni.hideLoading();
					this.getAliDev(); //为了确保设备的排列顺序，与uni有关。
					if(res.status === 200 && res.data && res.data.config) {
						this.deviceList = res.data.config;
						uni.stopPullDownRefresh();
					} else {
						this.deviceList = []
						throw res
					}
				}).catch(err => {
					uni.stopPullDownRefresh();
					uni.hideLoading();
				})
			},
			getAliDev() {
				queryAliDev().then(res => {
					console.log('res', res)
					if(res.data && res.data.configs) {
						this.aliDev = res.data.configs
					} else {
						this.aliDev = []
					}
				}).catch(err => {
					console.log('err', err)
				})
			},
			controlAliDev(item) {
				uni.navigateTo({
					url: `/pages/device/irDeviceList?deviceId=${item.deviceId}&name=${item.name}`,
					fail: function(e) {
						// uni.showToast({
						// 	title: '功能开发中',
						// 	icon: 'none',
						// 	duration: 1000
						// });
					}
				});
			},
			getImageName(item) {
				let tarImg = ''
				deviceInfo.forEach(ele => {
					if(ele.id === parseInt(item.device_type, 16)) {
						if(ele.image) {
							tarImg = ele.image;
						} else if (ele.children.length) {
							ele.children.forEach(ele2 => {
								if(ele2.id === parseInt(item.device_child_type, 16)) tarImg = ele2.image;
							})
						}
					}
				})
				return tarImg || 'device';
			},
			contralDevice(index) {
				let tarObj = this.deviceList[index]
				let url = `${getDevicePath(parseInt(tarObj.device_type, 16), parseInt(tarObj.device_child_type, 16))}&serialId=${tarObj.serialId}&status=${tarObj.state}&title=${tarObj.name}`
				if(tarObj.obox_serial_id) {
					url += `&obox_serial_id=${tarObj.obox_serial_id}`
				}
				uni.navigateTo({
					url: url,
					fail: function(e) {
						console.log('e',e)
						// uni.showToast({
						// 	title: '功能开发中',
						// 	icon: 'none',
						// 	duration: 1000
						// });
					}
				});
			},
			getStatus(item){
				let tarStr;
				try{
					tarStr = Suit.getStatusDescriptor(item.state,item.device_type,item.device_child_type) || ''
				}catch(e){
					tarStr = '-'
				}
				return tarStr
			}
        },
		onPullDownRefresh:function(){
			if (this.hasLogin) { 
				this.getDeviceList();
			}
		},
 
	}
</script>

<style>
/* 头条小程序组件内不能引入字体 */
	/* #ifdef MP-TOUTIAO */
	@font-face {
		font-family: uniicons;
		font-weight: normal;
		font-style: normal;
		src: url('~@/static/uni.ttf') format('truetype');
	}

	/* #endif */

	/* #ifndef APP-NVUE */
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #efeff4;
		min-height: 100%;
		height: auto;
	}

	view {
		font-size: 14px;
		line-height: inherit;
	}
	
	/* #endif */
	
	uni-button[disabled][type=primary] {
	    background-color: rgba(0,122,255,.6);
	}
	.top-select{
		font-size: 12px;
		color: #333;
	}
	.grid-item-box {
		flex: 1;
		/* position: relative;
*/
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: space-around;
	}
	.text {
		font-size: 26rpx;
	}
	.example-body {
		padding: 15px;
	}
	image {
		width: 30px;
		height: 30px;
		display: inline-block;
		overflow: hidden;
	}
	.device-status {
		color: #b8b8b8;
		font-size: 12px;
		text-align: center;
	}
</style>
