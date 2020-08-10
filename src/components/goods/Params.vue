<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示信息 -->
            <el-alert show-icon
                      title="注意，只允许第三级分类设置参数！"
                      type="warning">
            </el-alert>
            <!-- 选择分类区域 -->
            <el-row>
                <el-col style="margin-top: 15px;">
                    <span>选择商品分类：</span>
                    <el-cascader
                        v-model="selectedKeys"
                        :options="cateList"
                        :props="cateProps"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            <!-- tab 标签页 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-row>
                        <el-col>
                            <el-button type="primary" :disabled="getStatus" @click="showAddDialog">添加参数</el-button>
                        </el-col>
                    </el-row>
                    <!-- 表格 -->
                    <el-table
                        :data="manyList"
                        style="width: 100%" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 展开行 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" style="margin-right:20px;"
                                        closable @close="removeTag(i, scope.row)">
                                    {{ item }}
                                </el-tag>
                                <!-- 添加标签 -->
                                <el-input
                                    style="width: 150px;"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"
                                         width="400">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="removeParams(scope.row.attr_id)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-row>
                        <el-col>
                            <el-button type="primary" :disabled="getStatus" @click="showAddDialog">添加属性</el-button>
                        </el-col>
                    </el-row>
                    <!-- 表格 -->
                    <el-table
                        :data="onlyList"
                        style="width: 100%" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 展开行 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" style="margin-right:20px;"
                                        closable @close="removeTag(i, scope.row)">
                                    {{ item }}
                                </el-tag>
                                <!-- 添加标签 -->
                                <el-input
                                    style="width: 150px;"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称" width="400"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="removeParams(scope.row.attr_id)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加信息对话框 -->
        <el-dialog @close="dialogClosed"
                   :title="'添加' + getTitle"
                   :visible.sync="addDialogVisible"
                   width="50%">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="getTitle" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
        </el-dialog>
        <!-- 修改信息对话框 -->

        <el-dialog @close="dialogClosed"
                   :title="'修改' + getTitle"
                   :visible.sync="editDialogVisible"
                   width="50%">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="getTitle" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
        </el-dialog>


    </div>
</template>

<script>
export default {
    data () {
        return {
            // 分类信息列表
            cateList: [],
            // 级联选择器配置
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选择的分类id
            selectedKeys: [],
            // 被选择的tab标签的name
            activeName: 'many',
            // 存储静态属性信息
            onlyList: [],
            // 存储动态参数信息
            manyList: [],
            // 控制添加对话框是否显示
            addDialogVisible: false,
            // 添加属性表单数据
            addForm: {
                attr_name: ''
            },
            // 添加表单验证规则
            addFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: `请输入属性名称`,
                        trigger: 'blur'
                    }
                ]
            },
            // 编辑信息表单数据
            editForm: {
                attr_name: '',
                attr_id: '',
                attr_vals: ''
            },
            // 编辑信息验证规则
            editFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: `请输入属性名称`,
                        trigger: 'blur'
                    }
                ]
            },
            // 控制编辑对话框的显示和隐藏
            editDialogVisible: false
        }
    },
    created () {
        this.getCateList()
    }
    ,
    methods: {
        // 获取分类信息
        async getCateList () {
            let { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类信息失败!')
            }
            this.cateList = res.data
        },
        // 级联选择器发生选择时的事件
        handleChange () {
            this.getParamsList()
        },
        // 切换tab触发的事件
        handleClick () {
            this.getParamsList()
        },
        // 获取分类参数信息
        async getParamsList () {
            if (this.getStatus) {
                this.manyList = []
                this.onlyList = []
                return
            }
            let { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes`, { params: { sel: this.activeName } })
            console.log(res)
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                item.inputVisible = false
                item.inputValue = ''
            })
            if (this.activeName === 'many') {
                this.manyList = res.data
            } else {
                this.onlyList = res.data
            }
        },
        // 显示添加对话框
        showAddDialog () {
            this.addDialogVisible = true
        },
        // 添加参数
        addParams () {
            // 表单预验证
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return
                }
                let { data: res } = await this.$http.post(`categories/${this.getCateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                console.log(res)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加信息失败!')
                }
                this.$message.success('添加信息成功!')
                this.addDialogVisible = false
                this.getParamsList()
            })

        },
        // 对话框关闭事件
        dialogClosed () {
            try {
                this.$refs.addFormRef.resetFields()
            } catch (e) {
                this.$refs.editFormRef.resetFields()
            }

        },
        // 显示编辑对话框
        async showEditDialog (row) {
            console.log(row)
            this.editDialogVisible = true
            let { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes/${row.attr_id}`)
            this.editForm.attr_name = res.data.attr_name
            this.editForm.attr_id = row.attr_id
            this.editForm.attr_vals = row.attr_vals
        },
        // 提价编辑表单
        editParams () {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                console.log(this.editForm.attr_id)
                let { data: res } = await this.$http.put(`categories/${this.getCateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName,
                    attr_vals: this.editForm.attr_vals.join(' ')
                })
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('修改信息失败!')
                }
                this.$message.success('修改信息成功!')
                this.getParamsList()
                this.editDialogVisible = false
            })

        },
        // 删除属性
        async removeParams (id) {
            let confirmResult = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除!')
            }
            let { data: res } = await this.$http.delete(`categories/${this.getCateId}/attributes/${id}`)
            if (res.meta.status !== 200) {
                this.$message.error('删除属性失败!')
            }
            this.$message.success('删除属性成功!')
            this.getParamsList()
        },
        // 当摁下键盘的enter键或者鼠标离开焦点的事件
        async handleInputConfirm (row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 如果输入合法将添加标签
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 发起修改请求
            this.saveAttrValues(row)

        },
        // 显示添加新标签的input框
        showInput (row) {
            row.inputVisible = true
            // 点击之后直接获取焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
            })

        },
        // 删除标签
        removeTag (i, row) {
            row.attr_vals.splice(i, 1)
            this.saveAttrValues(row)

        },
        // 将vals存储到数据库中
        async saveAttrValues (row) {
            let { data: res } = await this.$http.put(`categories/${this.getCateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: this.activeName,
                attr_vals: row.attr_vals.join(' ')
            })
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('修改属性失败!')
            }
            this.$message.success('修改属性成功!')
        }
    },
    // 计算属性
    computed: {
        getCateId () {
            if (this.selectedKeys.length === 3) {
                return this.selectedKeys[this.selectedKeys.length - 1]
            } else {
                return null
            }
        },
        // 获取是否选择了三级分类
        getStatus () {
            if (this.selectedKeys.length === 3) {
                return false
            } else {
                return true
            }
        },
        // 获取tab选项的名字
        getTitle () {
            if (this.activeName === 'many') {
                return '动态参数'
            } else {
                return '静态属性'
            }
        }

    }
}
</script>

<style scoped>

</style>
