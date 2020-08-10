import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import tableTree from 'vue-table-with-tree-grid'
// 导入富文本编辑器依赖
import VueQuillEditor from 'vue-quill-editor'

Vue.component('tree-table', tableTree)
Vue.config.productionTip = false
Vue.prototype.$http = axios
// 位置axios的请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 使用拦截器为请求添加权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 将富文本编辑器注册为全局
Vue.use(VueQuillEditor)

// 自定义全局事件格式处理过滤器
Vue.filter('dateFormat', function (date) {
    let dt = new Date(date)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
