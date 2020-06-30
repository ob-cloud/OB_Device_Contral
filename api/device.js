import { get, post } from '@/common/request'; // 导入http中创建的axios实例
// import qs from 'qs'; // 根据需求是否导入qs模块

export function getDeviceList() {//查看设备列表
 return get(`consumer/common?CMD=query_device`);  
}
export function settingNodeStatus(serialId, status) {//设置设备状态
 return post(`consumer/common?CMD=setting_node_status&serialId=${serialId}&status=${status}`);  
}
export function addUserNoAuth(serialId, startTime, endTime, mobile) {
 return post(`consumer/common?CMD=add_intelligent_remote_user_no_auth&serialId=${serialId}&nickName=OBHotel&startTime=${startTime}&endTime=${endTime}&mobile=${mobile}&isMax=1`);  
}
export function queryNodeRealStatus(serialId) {//查看设备真实状态
 return post(`consumer/common?CMD=query_node_real_status&serialId=${serialId}`);  
}
export function settingRemoteLed(obox_serial_id, serialId, status) { //设置遥控灯
 return post(`consumer/common?CMD=setting_remote_led&type=3&obox_serial_id=${obox_serial_id}&serialId=${serialId}&status=${status}`);  
}
export function queryAliDev() {//查看红外涉笔
 return post(`consumer/common?CMD=query_ali_dev`);  
}
export function queryIrDevice(serialId) {//查询红外下面设备
 return post(`consumer/common?CMD=query_ir_device&serialId=${serialId}`);  
}
export function controlIrDevice(serialId, index, key, keyType) {//控制红外空调
 return post(`consumer/common?CMD=control_ir_device&serialId=${serialId}&index=${index}&keyType=${keyType}&key=${key}`);  
}