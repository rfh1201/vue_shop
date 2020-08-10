<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="goodsParams.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table border stripe :data="goodsList">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="70"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70"></el-table-column>
                <el-table-column label="创建时间" width="160">
                    <template slot-scope="scope">
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="removeGoods(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="goodsParams.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="goodsParams.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data () {
        return {
            // 存储商品信息列表
            goodsList: [],
            // 获取商品信息配置参数
            goodsParams: {
                query: '',
                // 当前页
                pagenum: 1,
                // 每页最大显示条数,
                pagesize: 10
            },
            // 商品总条数
            total: 0
        }
    },
    created () {
        this.getGoodsList()
    },
    methods: {
        // 获取商品信息列表
        async getGoodsList () {
            let { data: res } = await this.$http.get('goods', { params: this.goodsParams })
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品信息失败!')
            }
            this.total = res.data.total
            this.goodsList = res.data.goods
        },
        // 每页最大显示条数发生变化时
        handleSizeChange (newSize) {
            this.goodsParams.pagesize = newSize
            this.getGoodsList()
        },
        // 选择页码发生变化时
        handleCurrentChange (newSize) {
            this.goodsParams.pagenum = newSize
            this.getGoodsList()
        },
        // 删除商品
        async removeGoods (id) {
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if (confirmResult !== 'confirm') {
                return this.$message.info('已经取消删除!')
            }
            let { data: res } = await this.$http.delete(`goods/${id}`)
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败!')
            }
            this.$message.success('删除商品成功!')
            this.getGoodsList()
        },
        // 跳转到添加商品页面
        goAddPage () {
            this.$router.push('/add')
        }
    }
}
</script>

<style scoped>

</style>
