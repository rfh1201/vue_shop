<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">
                        添加分类
                    </el-button>
                </el-col>
            </el-row>
            <!-- 商品分类信息表格 -->
            <!--
                data 表格绑定每行的数据源
                columns 表格各项配置
                    label 列标题
                    prop 对应列内容的属性值
                    width 宽度
                    type 列类型 可选 template 是否使用自定义模板(作用域插槽)
                    template 模板名 模板要放到table里面
             -->
            <tree-table :data="cateList" :columns="tableColumns" border :selection-type="false" :expand-type="false"
                        show-index index-text="id" class="cateTable">
                <!-- 是否有效模板 -->
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
                       style="color: lightgreen;font-size: 20px"></i>
                    <i class="el-icon-error" style="color: red ;font-size: 20px" v-else></i>
                </template>
                <!-- 排序模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作模板 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pageQuery.pagenum"
                :page-sizes="[2, 3, 5, 10]"
                :page-size="pageQuery.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%" @close="dialogClosed">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="添加分类">
                    <!--
                        options 指定数据源
                        props 配置选项
                            value 选中的属性值
                            label 看到的属性值
                            children 表示父子节点之间的嵌套关系
                     -->
                    <el-cascader clearable
                                 v-model="selectedKeys"
                                 :options="parentCateList"
                                 :props="cascaderProps"
                                 @change="handleChange"></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            // 商品分类列表
            cateList: [],
            // 获取商品分类信息的参数
            pageQuery: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 总条数
            total: 0,
            // tree-table 各列配置
            tableColumns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isOk'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt',
                    width: 220
                }
            ],
            // 添加分类对话框显示隐藏
            addCateDialogVisible: false,
            // 添加分类表单数据
            addCateForm: {
                cat_name: '',
                cat_level: 0,
                cat_pid: 0
            },
            // 添加分类验证规则
            addCateFormRules:
                {
                    cat_name: [
                        {
                            required: true,
                            message: '请输入分类名称!',
                            trigger: 'blur'
                        },
                        {
                            min: 3,
                            max: 10,
                            message: '分类名称在 3~10 位',
                            trigger: 'blur'
                        }
                    ]
                },
            // parentCateList 父级分类信息列表
            parentCateList: [],
            // 级联选择器的配置对象
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true
            },
            // 选择的父级
            selectedKeys: {}
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        // 获取商品分类列表信息
        async getCateList () {
            const { data: res } = await this.$http.get('categories', { params: this.pageQuery })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类信息失败!')
            }
            this.cateList = res.data.result
            this.total = res.data.total

        },
        // 每页最大条数改变
        handleSizeChange (newSize) {
            this.pageQuery.pagesize = newSize
            this.getCateList()
        },
        // 选择的页码改变
        handleCurrentChange (newSize) {
            this.getCateList()
            this.pageQuery.pagenum = newSize
        },
        // 显示添加分类对话框
        async showAddCateDialog () {
            this.addCateDialogVisible = true
            let { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) {
                return this.$message.error('获取父级分类信息失败!')
            }
            this.parentCateList = res.data
        },
        // 级联选择器发生选择时
        handleChange () {
            if (this.selectedKeys.length > 0) {
                // 父级id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                // 为分类等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
                console.log(this.addCateForm)
                return
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
                console.log(this.addCateForm)
            }
        },
        // 对话框关闭时
        dialogClosed () {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
        },
        // 添加商品分类
        addCate () {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) {
                    return
                }
                let { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) return this.$message.error('添加分类失败!')
                this.$message.success('添加用户成功!')
                this.getCateList()
                this.addCateDialogVisible = false

            })
        }
    }
}
</script>

<style scoped>
.cateTable {
    margin-top: 15px;
}

.el-cascader {
    width: 100%;
}
</style>
