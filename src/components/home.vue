<template>
  <div>
    home组件
    <el-button type="info" @click="logout">退出登录</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout: function() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped></style>
