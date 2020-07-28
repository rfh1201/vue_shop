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

new Vue({
  router,
  render: h => h(App),
  methods: {
    login () {

    }
  }
}).$mount('#app')
