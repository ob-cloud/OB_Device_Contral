let url_config = ""

if(process.env.NODE_ENV === 'development'){
    // 开发环境
    // url_config = 'https://alicloud.on-bright.com/'
    url_config = 'https://aliiot.on-bright.com/'
}else{
    // 生产环境
    url_config = 'https://alicloud.on-bright.com/'
}

export default url_config