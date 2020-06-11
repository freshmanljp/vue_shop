module.exports = {
  chainWebpack: config => { 
    // 上线环境
    config.when(process.env.NODE_ENV === 'production', config => { 
      // 入口文件设置
      config.entry('app').clear().add('./src/main-prod.js') 
      // 不打包到依赖的库声明
      config.set('externals', { 
        vue: 'Vue', 
        'vue-router': 'VueRouter', 
        axios: 'axios', 
        lodash: '_', 
        echarts: 'echarts', 
        nprogress: 'NProgress', 
        'vue-quill-editor': 'VueQuillEditor' 
      })
      config.plugin('html').tap(args => {
        args[0].isProd = true
        args[0].title = '后台管理系统'
        return args
      })
    }) 
    config.when(process.env.NODE_ENV === 'development', config => { 
      // 开发环境
      config.entry('app').clear().add('./src/main-dev.js') 
      config.plugin('html').tap(args => {
        args[0].isProd = false
        args[0].title = 'dev-后台管理系统'
        return args
      })
    }) 
  } 
}