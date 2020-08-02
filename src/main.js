import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'

Vue.config.productionTip = false
Vue.prototype.$http = axios
// 位置axios的请求根路径
axios.defaults.baseURL = `http://127.0.0.1:8888/api/private/v1/`
// 使用拦截器为请求添加权限
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
