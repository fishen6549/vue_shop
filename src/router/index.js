import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/users/User.vue'
import Roles from '../components/roles/Roles.vue'
import Rights from '../components/rights/Rights.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import Test from '../components/test'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: 'login' },
    { path: '/login', component: Login },
    {
      path: '/home', component: Home,
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: User },
        { path: '/roles', component: Roles },
        { path: '/rights', component: Rights },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/test', name: 'test', component: Test }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  const token = window.sessionStorage.getItem('token')
  if (!token) {
    return next('/login')
  }
  next()
})

export default router
