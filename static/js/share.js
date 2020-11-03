export default{
    data(){
        return {
                       //设置默认的分享参数
            share:{
                title:'OB Smart设备管理',
                path:'/pages/device/deviceList',
                imageUrl:'https://www.on-bright-gz.com/data/article/1598235519621918130.png',
                desc:'',
                content:''
            }
        }
    },
    onShareAppMessage(res) {
        return {
            title:this.share.title,
            path:this.share.path,
            imageUrl:this.share.imageUrl,
            desc:this.share.desc,
            content:this.share.content,
            success(res){
                uni.showToast({
                    title:'分享成功'
                })
            },
            fail(res){
                uni.showToast({
                    title:'分享失败',
                    icon:'none'
                })
            }
        }
    }
}