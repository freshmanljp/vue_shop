<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像框部分 -->
      <div class="avatar_box">
        <img src="../assets/head.jpg">
      </div>
      <!-- 表单部分 -->
      <el-form ref="login_ref" :model="login_form" :rules="login_rules" label-width="0px" class="login_form">
        <el-form-item prop="username" >
          <el-input v-model="login_form.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password" >
          <el-input v-model="login_form.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
        </el-form-item>
        <el-form-item class="login_button">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset_form">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 表单数据绑定
      login_form: {
        username: 'admin',
        password: ''
      },
      // 表单内容格式验证
      login_rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset_form () {
      this.$refs.login_ref.resetFields()
    },
    login: function () {
      this.$refs.login_ref.validate(async result => {
        if (!result) {
          return false
        } else {
          // 注意因为$http为Vue的prototype方法，所以其组件可以直接通过this使用
          const { data: res } = await this.$http.post('/login', this.login_form)
          if (res.meta.status === 200) {
            // 消息的使用方式
            this.$message.success('登录成功')
            // 将登录成功后的token保存在客户端的sessionStorage中
            // 保存在sessionStorage中只在当前网站打开的时候生效，localStorage是长期存储
            window.sessionStorage.setItem('token', res.data.token)
            // 编程式导航跳转到后台主页
            this.$router.push('/home')
          } else {
            this.$message.error('登录失败')
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    height: 100%;
    background-color: #2b4b6b;
  }
  .login_box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 450px;
    height: 300px;
    border-radius: 3px;
    background-color: #fff;
    transform: translate(-50%, -50%);
    .avatar_box {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      border-radius: 75px;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 10px;
      box-sizing: border-box;
      .login_button {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
