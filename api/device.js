import { get, post } from '@/common/request'; // 导入http中创建的axios实例
// import qs from 'qs'; // 根据需求是否导入qs模块

export function getDeviceList(data) {
 return get(`consumer/common?CMD=query_device`);  
}
export function settingNodeStatus(serialId, status) {
 return post(`consumer/common?CMD=setting_node_status&serialId=${serialId}&status=${status}`);  
}
export function addUserNoAuth(serialId, startTime, endTime, mobile) {
 return post(`consumer/common?CMD=add_intelligent_remote_user_no_auth&serialId=${serialId}&nickName=OBHotel&startTime=${startTime}&endTime=${endTime}&mobile=${mobile}&isMax=1`);  
}
export function queryNodeRealStatus(serialId) {
 return post(`consumer/common?CMD=query_node_real_status&serialId=${serialId}`);  
}