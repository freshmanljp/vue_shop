<template>
  <div class="container">
    <!-- 面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card>
      <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
      <div id="main" style="width: 800px;height: 400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 引入echarts对象
import echarts from 'echarts'
// 引入lodash,要用到lodash的merge合并两个对象的方法
import _ from 'lodash'
export default {
  data() {
    return {
      // echarts指定图表的配置项和数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      },
      // 服务器返回的report数据，需要和option进行合并才能使用
      reportData: {}
    }
  },
  created() {},
  async mounted() {
    await this.getReportData()
    // 基于准备好的dom，初始化echarts实例
    // 需要dom元素操作，所以必须放在mounted函数中初始化
    const myChart = echarts.init(document.getElementById('main'))
    const result = _.merge(this.reportData, this.options)
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {
    async getReportData() {
      const { data: res } = await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) return this.$message.error('获取报表信息失败')
      this.reportData = res.data
    }
  }
}
</script>
<style scoped lang="less"></style>
