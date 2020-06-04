<template>
  <div class="container">
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryParams.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="addGood">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="105px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="130px">
          <!-- 调用时间格式处理过滤器处理时间函数 -->
          <template v-slot:default="slotProps">{{slotProps.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="170px" v-slot:default="slotProps">
          <el-button type="primary" class="el-icon-edit" size="mini">编辑</el-button>
          <el-button
            type="danger"
            class="el-icon-delete"
            size="mini"
            @click="deleteGoodById(slotProps.row.goods_id)"
          >删除</el-button>
        </el-table-column>
      </el-table>
      <!-- 分页控件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[8, 16, 24, 32]"
        :page-size="8"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品列表请求参数
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 8
      },
      // 商品列表数据存储
      goodList: [],
      // 总页数
      total: 0
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    // 获取商品列表
    getGoodList: async function() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    // 分页控件的方法
    handleSizeChange: function(sizeNum) {
      this.queryParams.pagesize = sizeNum
      this.getGoodList()
    },
    handleCurrentChange: function(pageNum) {
      this.queryParams.pagenum = pageNum
      this.getGoodList()
    },
    // 删除商品操作
    deleteGoodById: async function(id) {
      const result = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品操作失败')
      this.$message.success('删除商品操作成功')
      this.getGoodList()
    },
    // 添加商品的页面跳转
    addGood: function() {
      this.$router.push('goods/add')
    }
  }
}
</script>
<style scoped lang="less"></style>
