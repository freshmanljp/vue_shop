<template>
  <div class="container">
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template v-slot:default="slotProps">
            <el-tag type="success" size="mini" v-if="slotProps.row.order_pay==='1'">已付款</el-tag>
            <el-tag type="danger" size="mini" v-if="slotProps.row.order_pay==='0'">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pay_status" label="是否发货">
          <template v-slot:default="slotProps">
            <span v-if="slotProps.row.pay_status==='1'">是</span>
            <span v-if="slotProps.row.pay_status==='0'">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间"></el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressDialogVisible=true"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showKuaiDiInfo"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="quertInfo.pagenum" :page-sizes="[8, 16, 24, 32]" :page-size="quertInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      <!-- 编辑订单地址对话框 -->
      <el-dialog :visible.sync="addressDialogVisible" width="50%" title="修改地址" @close="closeAddressDialog">
        <el-form ref="setAddrForm" :model="addrForm" :rules="rules" label-width="100px">
          <el-form-item label="省市区/县" prop="addr1">
            <el-cascader v-model="addrForm.addr1" :options="options"
              :props="{ expandTrigger: 'hover' }"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="addr2">
            <el-input v-model="addrForm.addr2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setroledialogVisible = false">取 消</el-button>
          <el-button type="primary">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 查看物流信息对话框 -->
      <el-dialog :visible.sync="transInfoDialogVisible" width="50%" title="物流信息">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in kuaiDiInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import options from './citydata'
export default {
  data() {
    return {
      quertInfo: {
        query: '',
        pagenum: 1,
        pagesize: 8
      },
      total: 0,
      orderList: [],
      addressDialogVisible: false,
      transInfoDialogVisible: false,
      addrForm: {
        addr1: [],
        addr2: ''
      },
      rules: {
        addr1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        addr2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      options,
      // 订单物流信息
      kuaiDiInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.quertInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(val) {
      this.quertInfo.pagesize = val
      this.getOrderList()
    },
    handleCurrentChange(val) {
      this.quertInfo.pagenum = val
      this.getOrderList()
    },
    closeAddressDialog() {
      this.$refs.setAddrForm.resetFields()
    },
    // 获取订单的物流信息
    async getKuaiDiInfo() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取订单物流信息失败')
      this.kuaiDiInfo = res.data
    },
    // 获取物流信息事件处理
    showKuaiDiInfo() {
      this.getKuaiDiInfo()
      this.transInfoDialogVisible = true
    }
  }
}
</script>
<style scoped lang="less"></style>
