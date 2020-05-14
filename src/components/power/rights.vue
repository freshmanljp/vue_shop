<template>
  <div>
    <!-- 面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot:default="slotProps">
            <el-tag v-if="slotProps.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="slotProps.row.level === '1'">二级</el-tag>
            <el-tag type="info" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  async mounted() {
    const { data: res } = await this.$http.get('rights/list')
    if (res.meta.status !== 200) return this.$message.error('请求权限列表失败')
    this.rightsList = res.data
    // console.log(this.rightsList)
  },
  data() {
    return {
      rightsList: []
    }
  }
}
</script>

<style lang="less" scoped></style>
