import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// Vue.use(ElementUI)
// 配置请求的根路径
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 树形表格注册
Vue.component('tree-table', TreeTable)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截 每次请求带上token服务器会验证token
axios.interceptors.request.use(config => {
  // console.log(window.sessionStorage.getItem('token'))
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// console.log(router)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
