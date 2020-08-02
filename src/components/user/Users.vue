<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="#/users">用户管理</a></el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片主体区 -->
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryList.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 存放用户信息的表格 -->
            <el-table :data="tableData" style="width: 100%" :border='true' stripe>
                <el-table-column type="index" label="id"></el-table-column>
                <el-table-column prop="username" label="姓名" width="180"></el-table-column>
                <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model=scope.row.mg_state @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                   @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeUserById(scope.row.id)"></el-button>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryList.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryList.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="resetAddForm"
        >
            <el-form :model="addFormData" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addFormData.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addFormData.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addFormData.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addFormData.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
        </el-dialog>
        <!-- 修改用户信息对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%" @close="editClosed">
            <el-form label-width="70px" :rules="addFormRules" :model="editFormData" ref="editFormRef">
                <el-form-item label="用户名">
                    <el-input v-model="editFormData.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editFormData.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editFormData.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        // 验证邮箱自定义验证规则
        const checkEmail = (rule, value, callback) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

            if (regEmail.test(value)) {
                // 合法的邮箱
                return callback()
            }
            callback(new Error('请输入合法的邮箱'))
        }
        const checkMobile = (rule, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (regMobile.test(value)) {
                return callback()
            }
            callback(new Error('请输入合法的手机号'))
        }
        return {
            tableData: [],
            // 请求用户数据列表参数
            queryList: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            // 总共有多少条用户信息
            total: 0,
            // 控制添加用户对话框是否显示
            addDialogVisible: false,
            // 控制修改用户信息对话框是否显示
            editDialogVisible: false,
            // 添加用户的数据表单
            addFormData: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 编辑用户表单数据
            editFormData: {
                username: '',
                email: '',
                mobile: ''
            },
            // 添加用户的验证规则
            addFormRules: {
                username: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur'
                    },
                    {
                        min: 3,
                        max: 10,
                        message: '用户名为3~10位字符',
                        trigger: 'blur'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: '请输入密码',
                        trigger: 'blur'
                    },
                    {
                        min: 6,
                        max: 16,
                        message: '密码为3~10位字符',
                        trigger: 'blur'
                    }
                ],
                email: [
                    {
                        required: true,
                        message: '请输入邮箱',
                        trigger: 'blur'
                    },
                    {
                        validator: checkEmail,
                        trigger: 'blur'
                    }
                ],
                mobile: [
                    {
                        required: true,
                        message: '请输入手机号',
                        trigger: 'blur'
                    },
                    {
                        validator: checkMobile,
                        trigger: 'blur'
                    }
                ]

            }
        }
    },
    created () {
        this.getUserList()
    },
    methods: {
        // 获取用户信息列表
        async getUserList () {
            let { data: res } = await this.$http.get('users', { params: this.queryList })
            if (res.meta.status !== 200) return this.$message.error('获取用户信息失败')
            this.tableData = res.data.users
            this.total = res.data.total
        },
        // 改变一页显示数量时的事件
        handleSizeChange (newSize) {
            this.queryList.pagesize = newSize
            this.getUserList()
        },
        // 页码值发生变化时的事件
        handleCurrentChange (newSize) {
            this.queryList.pagenum = newSize
            this.getUserList()
        },
        async userStateChanged (userInfo) {
            let { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败!')
            }
            this.$message.success('更新用户状态成功!')
        },
        // 重置添加用户表单
        resetAddForm () {
            this.$refs.addFormRef.resetFields()
        },
        // 发起添加用户请求
        addUser () {
            this.$refs.addFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) return
                let { data: res } = await this.$http.post('users', this.addFormData)
                if (res.meta.status !== 201) return this.$message.error('添加用户失败!')
                console.log(res)
                this.$message.success('添加用户成功!')
                // 隐藏对话框
                this.addDialogVisible = false
                // 刷新用户列表
                this.getUserList()
            })
        },
        // 控制显示修改对话框
        async showEditDialog (id) {
            let { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询用户信息失败!')
            this.editFormData = res.data
            // 显示修改对话框
            this.editDialogVisible = true
        },
        // 重置修改表单数据
        editClosed () {
            this.$refs.editFormRef.resetFields()
        },
        // 修改用户信息
        editUser () {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                let { data: res } = await this.$http.put('users/' + this.editFormData.id, {
                    email: this.editFormData.email,
                    mobile: this.editFormData.mobile
                })

                if (res.meta.status !== 200) return this.$message.error('修改用户失败!')
                // 提示用户修改成功
                this.$message.success('修改用户成功!')
                // 隐藏对话框
                this.editDialogVisible = false
                // 刷新用户数据列表
                this.getUserList()
            })
        },
        // 删除用户信息
        async removeUserById (id) {
            let confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(e => {
                console.log(e)
            })

            if (confirmRes !== 'confirm') {
                this.$message.info('已取消删除!')
            }
            let { data: res } = await this.$http.delete('users/' + id)
            if (res.meta.status !== 200) return this.$message.error('删除用户失败!')
            this.$message.success('删除用户成功!')
            // 刷新用户列表
            this.getUserList()
        }
    }
}
</script>

<style scoped>
.el-breadcrumb {
    font-size: 12px;
}

.el-card {
    margin-top: 20px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}

.el-table {
    margin-top: 20px;
}

.el-pagination {
    margin-top: 20px;
}
</style>
