<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-alert
                title="添加商品信息"
                type="info"
                show-icon
                center>
            </el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成" name="6"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <!-- tabs标签页 -->
                <el-tabs tab-position="left" style="height: 100%;" v-model="activeIndex" :before-leave="tabsChange"
                         @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" v type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!-- 级联选择器 -->
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="queryInfo"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyList" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox v-for="(item2, i) in item.attr_vals" :label="item2" :key="i"
                                             border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyList" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!--
                            action: 上传文件的路径
                            on-preview: 预览事件
                            on-remove: 移除上传之后的图片
                            list-type: 预览图片的方式
                         -->
                        <el-upload
                            class="upload-demo"
                            :action="uploadUrl"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :headers="headersObj"
                            :on-success="handleSuccess"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" style="margin-top: 10px;" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewDialogVisible"
            width="50%">
            <img :src="previewUrl" alt="" width="100%">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    data () {
        return {
            // 进度条的进度
            activeIndex: '0',
            // 添加表单数据
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 级联选择器选中的分类id
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            // 添加表单验证规则
            addFormRules: {
                goods_name: [
                    {
                        required: true,
                        message: '请输入商品名称!',
                        trigger: 'blur'
                    }
                ],
                goods_price: [
                    {
                        required: true,
                        message: '请输入商品价格!',
                        trigger: 'blur'
                    }
                ],
                goods_weight: [
                    {
                        required: true,
                        message: '请输入商品重量!',
                        trigger: 'blur'
                    }
                ],
                goods_number: [
                    {
                        required: true,
                        message: '请输入商品数量!',
                        trigger: 'blur'
                    }
                ],
                goods_cat: [
                    {
                        required: true,
                        message: '请选择商品分类!',
                        trigger: 'blur'
                    },

                ]
            },
            // 级联选择器的参数
            queryInfo: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 获取到的分类信息
            cateList: [],
            // 获取到的动态参数
            manyList: [],
            // 获取到的静态属性
            onlyList: [],
            // 上传图片路径
            uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
            headersObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 控制图片预览对话框是否显示
            previewDialogVisible: false,
            // 存储预览图片的图片地址
            previewUrl: ''
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        // 级联选择器发生选择时触发
        handleChange () {
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
            }
            console.log(this.addForm.goods_cat)
        },
        // 获取分类信息列表
        async getCateList () {
            let { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类信息失败!')
            }
            this.cateList = res.data
        },
        // tabs 选择项发生变化时触发
        tabsChange (active, old) {
            if (old === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请选择商品分类!')
                return false
            }
        },
        // tabs 发生选择时触发
        async tabClick () {
            // 动态参数
            let { data: res } = await this.$http.get(`categories/${this.getCardId}/attributes`, { params: { sel: 'many' } })
            if (res.meta.status !== 200) {
                this.$message.error('获取动态属性失败!')
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            })
            this.manyList = res.data
            console.log(this.manyList)
            // 静态属性
            let { data: res2 } = await this.$http.get(`categories/${this.getCardId}/attributes`, { params: { sel: 'only' } })
            if (res2.meta.status !== 200) {
                this.$message.error('获取静态参数失败!')
            }
            this.onlyList = res2.data
        },
        // 图片预览事件
        handlePreview (file) {
            this.previewDialogVisible = true
            this.previewUrl = file.response.data.url
        },
        // 点击上传图片缩略图上的小叉号触发
        handleRemove (file) {
            // 获取移除的文件的临时路径
            const filePath = file.response.data.tmp_path
            // 找到这个文件的索引
            const removeIndex = this.addForm.pics.findIndex(item => {
                return item === filePath
            })
            // 从数组中根据index移除图片地址
            console.log(this.addForm.pics)
            this.addForm.pics.splice(removeIndex, 1)
            console.log(this.addForm.pics)
        },
        // 文件上传成功触发
        handleSuccess (response) {
            this.addForm.pics.push(response.data.tmp_path)
        },
        // 添加商品
        addGoods () {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请填写完善需要的表单项!')
                }
                let form = _.cloneDeep(this.addForm)
                form.goods_cat = form.goods_cat.join(',')
                // 处理动态属性
                console.log(this.manyList)
                this.manyList.forEach(item => {
                    let newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(',')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态参数
                this.onlyList.forEach(item => {
                    let newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs

                let {data: res} = await this.$http.post('goods', form)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加商品失败')
                }
                this.$message.success('添加商品成功!')
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        getCardId () {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style scoped>

</style>
