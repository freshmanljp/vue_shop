import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入axios
import axios from 'axios'

// 导入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器相关样式表
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置请求的根路径和将axios配置为vue的prototype方法
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求拦截器配置请求头的Authorization字段提供token令牌
// 在请求拦截器中配置进度条开始
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  NProgress.start()
  return config
})
// 在响应拦截器中配置进度条结束
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

// 挂载vue-table-with-tree-grid组件
Vue.component('tree-table', TreeTable)
// 挂载富文本编辑器组件
Vue.use(VueQuillEditor)

// 挂载时间格式处理过滤器,输入的是毫秒为单位的时间变量
Vue.filter('dateFormat', function(originData) {
  // 先创建一个时间对象,get方法返回的是num类型的数据，利用padstart方法进行补全
  const dt = new Date(originData)
  const y = dt.getFullYear()
  // month是0到11
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  // 挂载路由对象
  router,
  // 渲染app组件
  render: h => h(App)
  // 挂载el元素
}).$mount('#app')

alert('上线环境')
