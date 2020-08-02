<template>
    <el-container class="home-container">
        <!-- 头部布局 -->
        <el-header>
            <div class="logo">
                <img src="../assets/images/heima.png" alt="">
                <span>AITimes电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <!-- 折叠框 -->
                <div class="toggle-btn" @click="toggleCollapse">{{ isCollapse ? '>>>' : '<<<' }}</div>
                <el-menu background-color="#313743" text-color="#fff" active-text-color="#439bf5" unique-opened
                         :collapse="isCollapse" :collapse-transition="false" router :default-active="index">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        <!-- 模板 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconObj[item.id]" class="icon"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                                      @click="saveIndex('/' + subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 信息主体区 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data () {
        return {
            menuList: [],
            iconObj: {
                '125': 'iconfont icon-users',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao',
            },
            isCollapse: false,
            // 记录当前被选中那一项的index
            index: ''
        }
    },
    created () {
        this.getMenuList()
        this.index = sessionStorage.getItem('index')
    },
    methods: {
        logout () {
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        async getMenuList () {
            let { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200) return this.$message.error('获取菜单列表失败')
            this.menuList = res.data
            // console.log(this.menuList)
        },
        toggleCollapse () {
            this.isCollapse = !this.isCollapse
        },
        // 将index的值存储到sessionStorage中
        saveIndex (index) {
            sessionStorage.setItem('index', index)
        }
    }
}
</script>

<style type="less" scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #363d40;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
}

.el-aside {
    background-color: #313743;
    //border-right: 0;
}

.el-main {
    background-color: #e9edf1;
}

.logo {
    color: #ffffff;
    font-size: 20px;
    display: flex;
    align-items: center;
}

.logo img {
    margin-right: 15px;
}

.icon {
    margin-right: 10px;
}

.el-menu {
    border-right: 0;
}

.toggle-btn {
    background-color: #475163;
    font-size: 10px;
    text-align: center;
    color: #ffffff;
    letter-spacing: 0.2em;
    line-height: 24px;
    cursor: pointer;
}
</style>
