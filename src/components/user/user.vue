<template>
  <div>
    <!-- 面包屑部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片内容部分 -->
    <el-card>
      <!-- gutter 属性来指定每一栏之间的间隔 -->
      <el-row :gutter="60">
        <!-- row分成24份 -->
        <el-col :span="10">
          <!-- 搜索框部分，clearable配置是否可清空输入框,清空时触发clear事件 -->
          <el-input placeholder="请输入内容" v-model="queryParams.query" clearable @clear="getUserList"><el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button></el-input>
        </el-col>
        <!-- 添加用户按钮，设置对话框可见 -->
        <el-col :span="6"><el-button type="primary" @click="adddialogVisible = true">添加用户</el-button></el-col>
      </el-row>
      <!-- 添加用户对话框部分，title配置对话框标题，close事件绑定清空表单框操作 -->
      <el-dialog :visible.sync="adddialogVisible" width="50%" title="添加用户" @close="adduserClosed">
        <!-- 用户添加表达部分，包含验证表达数据 -->
        <el-form ref="adduserRef" :model="addUser" label-width="80px" :rules="adduserRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUser.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUser.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUser.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addUser.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adddialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="adduserSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框部分，title配置对话框标题，close事件绑定清空表单框操作 -->
      <el-dialog :visible.sync="editdialogVisible" width="50%" title="修改用户" @close="edituserClosed">
        <!-- 用户添加表单部分，包含验证表达数据，:model绑定的是表单默认数值 -->
        <el-form ref="edituserRef" :model="editUser" label-width="80px" :rules="edituserRules">
          <!-- prop是用于表单验证的输入框绑定 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editUser.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUser.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editUser.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="edituserSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 用户列表展示部分 -->
      <!-- border设置表格边框，stripe设置表格间隔条纹 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <!-- type="index"属性设置表格索引 -->
        <el-table-column type="index"></el-table-column>
        <!-- prop绑定:data数据里的成员名 -->
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="手机"></el-table-column>
        <el-table-column prop="my_state" label="状态">
          <template v-slot:default="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChange(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="slotProps">
            <!-- 用户信息修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="medium" @click="showeditDialog(slotProps.row.id)"></el-button>
            <!-- 用户删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="medium" @click="deletebyId(slotProps.row.id)"></el-button>
            <!-- 配置按钮弹出消息提醒,禁止鼠标进入提示框 -->
            <el-tooltip class="item" effect="dark" content="角色分配" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="medium"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能的实现 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[2, 1, 4, 8]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalPage"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data: function() {
    // 自定义邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (emailReg.test(value)) {
        return callback()
      }
      return callback(new Error('请输入正确的邮箱'))
    }
    // 自定义手机验证规则
    var checkTelephone = (rule, value, callback) => {
      const emailReg = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/
      if (emailReg.test(value)) {
        return callback()
      }
      return callback(new Error('请输入正确的手机号码'))
    }
    return {
      // 用户列表请求参数
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表数据存储数组
      userList: [],
      // 用户列表的显示总页数
      totalPage: 0,
      // 添加和修改用户对话框是否可视
      adddialogVisible: false,
      editdialogVisible: false,
      // 添加用户表单数据
      addUser: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单规则验证
      adduserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkTelephone, trigger: 'blur' }
        ]
      },
      // 修改用户表单数据
      editUser: {},
      // 修改用户表单规则验证
      edituserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkTelephone, trigger: 'blur' }
        ]
      }
    }
  },
  mounted: function() {
    this.getUserList()
  },
  methods: {
    // 获取相应格式的用户列表
    getUserList: async function() {
      const { data: res } = await this.$http.get('/users', { params: this.queryParams })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('用户列表请求失败')
      this.userList = res.data.users
      this.totalPage = res.data.total
    },
    // 处理pagesize改变事件
    handleSizeChange: function(pageSize) {
      this.queryParams.pagesize = pageSize
      this.getUserList()
    },
    // 处理pagenum改变事件
    handleCurrentChange: function(pageNum) {
      this.queryParams.pagenum = pageNum
      this.getUserList()
    },
    // 处理用户状态改变事件
    userStateChange: async function(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 处理添加用户对话框关闭事件
    adduserClosed: function() {
      this.$refs.adduserRef.resetFields()
    },
    // 处理添用户对话框提交事件
    adduserSubmit: function() {
      // 验证表单数据是否合法
      this.$refs.adduserRef.validate(async result => {
        if (!result) return
        // 数据合法则向服务端发送添加用户请求
        const { data: res } = await this.$http.post('/users', this.addUser)
        if (res.meta.status === 201) this.$message.success('添加用户成功')
        else return this.$message.error('添加用户失败')
        // 关闭对话框并刷新用户列表
        this.adddialogVisible = false
        this.getUserList()
      })
    },
    // 展示修改用户对话框
    showeditDialog: async function(id) {
      // 向服务端请求该用户相关信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      this.editUser = res.data
      // 绑定数据后展示对话框
      this.editdialogVisible = true
    },
    // 处理修改用户对话框关闭事件
    edituserClosed: function() {
      this.$refs.edituserRef.resetFields()
    },
    // 处理修改用户表单提交事件
    edituserSubmit: function() {
      this.$refs.edituserRef.validate(async (result) => {
        // 验证不通过则阻止提交操作
        if (!result) return
        // 向服务端发送修改请求
        const { data: res } = await this.$http.put('users/' + this.editUser.id, {
          email: this.editUser.email,
          mobile: this.editUser.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('用户信息更新失败')
        // 数据更新成功后刷新列表,关闭对话框并显示信息
        this.getUserList()
        this.editdialogVisible = false
        this.$message.success('用户信息更新成功')
      })
    },
    // 处理删除用户事件
    deletebyId: async function(id) {
      // 弹消息框警告用户是否确认删除
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消时会报错，所以需要用catch捕获错误并返回，函数体只有return时可如下简写
      }).catch(err => err)
      // 取消则显示取消弹框信息
      if (result !== 'confirm') return this.$message.info('已取消删除用户操作')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped></style>
