<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/rights' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card>
            <!-- 添加用户按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id"
                                :class="['rolesBottom', index1 === 0 ? 'rolesTop' : '']">
                            <el-col :span="5">
                                <el-tag type="primary" closable @close="removeRight(scope.row, item1.id)">
                                    {{ item1.authName }}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>

                            <el-col :span="19">
                                <el-row v-for="(item2, index2) in item1.children" :key="item2.id"
                                        :class="[index2 === 0 ? '' : 'rolesTop']">
                                    <el-col :span="8">
                                        <el-tag type="success" closable @close="removeRight(scope.row, item2.id)">
                                            {{ item2.authName }}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>

                                    <el-col :span="16">
                                        <el-tag v-for="(item3, index3) in item2.children" type="warning" closable
                                                @close="removeRight(scope.row, item3.id)">
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column label="id" type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">修改</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                                   @click="showSetRightDialog(scope.row)">分配权限
                        </el-button>
                    </template>
                </el-table-column>

            </el-table>
        </el-card>
        <!-- 分配权限对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%" @close="clearArr">
            <el-tree :data="rightList" :props="rolesProps" show-checkbox default-expand-all node-key="id"
                     :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRight">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            rolesList: [],
            // 控制分切权限对话框
            setRightDialogVisible: false,
            rolesProps: {
                children: 'children',
                label: 'authName'
            },
            rightList: [],
            // 默认勾选的节点
            defKeys: [],
            roleID: ''
        }
    },
    created () {
        this.getRolesList()
    },
    methods: {
        // 获取角色信息列表
        async getRolesList () {
            let { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$message.error('获取角色信息失败!')
            this.rolesList = res.data
        },
        // 根据id删除权限
        async removeRight (roles, rightID) {
            let confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if (confirmRes !== 'confirm') {
                return this.$message.info('取消删除!')
            }

            let { data: res } = await this.$http.delete(`roles/${roles.id}/rights/${rightID}`)
            roles.children = res.data

        },
        // 控制显示分配权限对话框
        async showSetRightDialog (role) {
            let { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) return this.$message.error('获取权限信息失败!')
            // 将服务器返回的数据赋值给tree列表
            this.rightList = res.data
            // 调用递归函数获取三级权限的id
            this.getKeys(role, this.defKeys)
            // 将角色id存储于到data中
            this.roleID = role.id
            // 控制对话框显示
            this.setRightDialogVisible = true
        },
        // 递归获取三级权限的id
        getKeys (node, arr) {
            if (!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                this.getKeys(item, arr)
            })
        },
        // 清除默认勾选的节点
        clearArr () {
            this.defKeys = []
        },
        // 分配权限
        async editRight () {
            let rightArr = [...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()]
            let keysStr = rightArr.join(',')

            let {data: res} = await this.$http.post(`roles/${this.roleID}/rights`, { rids: keysStr })
            if (res.meta.status !== 200) return this.$message.error('分配权限失败!')
            this.$message.success('分配权限成功!')
            this.setRightDialogVisible = false
            this.getRolesList()
        }
    }
}
</script>

<style scoped>
.rolesBottom {
    border-bottom: 1px #eeeeee solid;
}

.rolesTop {
    border-top: 1px #eeeeee solid;
}

.el-tag {
    margin: 10px;
}

.el-row {
    display: flex;
    align-items: center;
}
</style>
