import { get, post, put } from '@/common/request'; // 导入http中创建的axios实例
// import qs from 'qs'; // 根据需求是否导入qs模块

export function getSceneList() {
 return get(`consumer/common?CMD=query_scenes`);  
}
export function controlScene(param) {
 return post(`consumer/common?CMD=execute_sc&${param}`);  
}