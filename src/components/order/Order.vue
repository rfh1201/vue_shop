<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/home' }">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="90"></el-table-column>
                <el-table-column label="是否付款" width="100">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="100"></el-table-column>
                <el-table-column label="下单时间" width="180">
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog"></el-button>
                        <el-button type="success" icon="el-icon-location-outline" size="mini"
                                   @click="showProgressDialog"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog
            title="修改地址"
            :visible.sync="cityDialogVisible"
            width="50%"
            @close="dialogClosed">
            <el-form :model="cityForm" :rules="cityFormRules" ref="cityFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="city">
                    <el-cascader
                        v-model="selectedKeys"
                        :options="cityData"
                        :props="cityProps"
                        @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address">
                    <el-input></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
    <el-button @click="cityDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="cityDialogVisible = false">确 定</el-button>
  </span>
        </el-dialog>
        <!-- 物流信息对话框 -->
        <el-dialog
            title="物流进展"
            :visible.sync="progressDialogVisible"
            width="50%">
            <el-timeline :reverse="true">
                <el-timeline-item
                    v-for="(activity, index) in progressInfo"
                    :key="index"
                    :timestamp="activity.time">
                    {{ activity.context }}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from '../../assets/js/citydata.js'

export default {
    data () {
        return {
            // 存储订单列表信息
            orderList: [],
            // 获取订单信息请求配置参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5
            },
            // 订单信息总条数
            total: 0,
            // 存储城市信息的列表
            cityData,
            // 控制修改地址的对话框是否显示
            cityDialogVisible: false,
            cityForm: {},
            cityFormRules: {
                city: [
                    {
                        required: true,
                        message: '请选择城市',
                        trigger: 'blur'
                    }
                ],
                address: [
                    {
                        required: true,
                        message: '请输入详细详细地址',
                        trigger: 'blur'
                    }
                ]
            },
            // 级联选择器配置参数
            cityProps: {
                expandTrigger: 'hover',
                value: 'value',
                label: 'label',
                children: 'children'
            },
            selectedKeys: [],
            // 控制物流进展对话框的显示与隐藏
            progressDialogVisible: false,
            // 物流信息
            progressInfo: []
        }
    },
    methods: {
        // 获取订单信息列表
        async getOrderList () {
            let { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('获取订单信息失败!')
            }
            this.orderList = res.data.goods
            this.total = res.data.total

        },
        handleSizeChange (newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()

        },
        handleCurrentChange (newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        // 修改地址对话框关闭之后
        dialogClosed () {
            this.$refs.cityFormRef.resetFields()
        },
        // 显示修改地址对话框
        showEditDialog () {
            this.cityDialogVisible = true
        },
        // 级联选择器发生选择
        handleChange () {

        },
        // 显示物流进展的对话框
        async showProgressDialog () {
            let { data: res } = await this.$http.get('/kuaidi/1106975712662')
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('获取物流信息失败!')
            }
            this.progressInfo = res.data
            this.progressDialogVisible = true
        }
    },
    created () {
        this.getOrderList()
    }
}
</script>

<style scoped>
.el-cascader {
    width: 100%;
}
</style>
