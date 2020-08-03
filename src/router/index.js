import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'

Vue.use(VueRouter)

// route匹配规则
const routes = [
    {
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
        redirect: '/users',
        children: [
            { path: '/users', component: Users},
            { path: '/rights', component: Rights},
            { path: '/roles', component: Roles},
        ]


    }
]

const router = new VueRouter({
    routes
})

// 路由导航守卫控制访问权限
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    // 获取token
    let tokenVal = window.sessionStorage.getItem('token');
    if (!tokenVal) return next('/login')
    next()
})

export default router
