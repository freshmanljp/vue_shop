import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login.vue'
// import Home from '../components/home.vue'
// import Welcome from '../components/welcome.vue'
const Login = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/home.vue')
const Welcome = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/welcome.vue')

// import User from '../components/user/user.vue'
// import Rights from '../components/power/rights.vue'
// import Roles from '../components/power/roles.vue'
const User = () => import(/* webpackChunkName: "user-rights-roles" */ '../components/user/user.vue')
const Rights = () => import(/* webpackChunkName: "user-rights-roles" */ '../components/power/rights.vue')
const Roles = () => import(/* webpackChunkName: "user-rights-roles" */ '../components/power/roles.vue')

// import GoodsCate from '../components/goods/goods_cate.vue'
// import GoodsParams from '../components/goods/goods_params.vue'
const GoodsCate = () => import(/* webpackChunkName: "cate-params" */ '../components/goods/goods_cate.vue')
const GoodsParams = () => import(/* webpackChunkName: "cate-params" */ '../components/goods/goods_params.vue')

// import GoodsList from '../components/goods/goods_list.vue'
// import GoodAdd from '../components/goods/goods_add.vue'
const GoodsList = () => import(/* webpackChunkName: "goodlists-goodadd" */ '../components/goods/goods_list.vue')
const GoodAdd = () => import(/* webpackChunkName: "goodlists-goodadd" */ '../components/goods/goods_add.vue')

// import Order from '../components/order/order.vue'
const Order = () => import(/* webpackChunkName: "order" */ '../components/order/order.vue')

// import Report from '../components/report/report.vue'
const Report = () => import(/* webpackChunkName: "report" */ '../components/report/report.vue')

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
},
{
  path: '/login',
  component: Login
},
{
  path: '/home',
  component: Home,
  redirect: '/welcome',
  children: [{
    path: '/welcome',
    component: Welcome
  }, {
    path: '/users',
    component: User
  }, {
    path: '/rights',
    component: Rights
  }, {
    path: '/roles',
    component: Roles
  }, {
    path: '/categories',
    component: GoodsCate
  }, {
    path: '/params',
    component: GoodsParams
  }, {
    path: '/goods',
    component: GoodsList
  }, {
    path: '/goods/add',
    component: GoodAdd
  }, {
    path: '/orders',
    component: Order
  }, {
    path: '/reports',
    component: Report
  }]
}
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to表示要访问的路径
  // from表示跳转的路径来源
  // next是跳转函数,没有参数则表示放行

  // 访问登录页面放行
  if (to.path === '/login') return next()
  // 访问其他页面要先验证token信息是否存在
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
