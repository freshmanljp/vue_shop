import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

// 配置请求的根路径和将axios配置为vue的prototype方法
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求拦截器配置请求头的Authorization字段提供token令牌
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

// 挂载vue-table-with-tree-grid组件
Vue.component('tree-table', TreeTable)

new Vue({
  // 挂载路由对象
  router,
  // 渲染app组件
  render: h => h(App)
  // 挂载el元素
}).$mount('#app')
