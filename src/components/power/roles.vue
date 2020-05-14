<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="adddialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 添加用户对话框部分，title配置对话框标题，close事件绑定清空表单框操作 -->
      <el-dialog :visible.sync="adddialogVisible" width="50%" title="添加角色" @close="addroleClosed">
        <!-- 用户添加表达部分，包含验证表达数据 -->
        <el-form ref="addroleRef" :model="addrole" label-width="80px" :rules="addroleRules">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addrole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addrole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adddialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addroleSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框部分，title配置对话框标题，close事件绑定清空表单框操作 -->
      <el-dialog :visible.sync="editdialogVisible" width="50%" title="添加角色" @close="editroleClosed">
        <!-- 角色修改表单部分，包含验证表单数据 -->
        <el-form ref="editroleRef" :model="editrole" label-width="80px" :rules="editroleRules">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editrole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editrole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editroleSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 角色列表展示部分 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <!-- 扩展按钮列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽获取该行角色信息 -->
          <template v-slot:default="slotProps">
            <!-- 角色权限列表树展示 -->
            <el-row v-for="(item1, i1) in slotProps.row.children" :key="item1.id"
            :class="['bottomborder', i1 === 0 ? 'topborder': '', 'vert-center']">
              <!-- 一级权限展示 -->
              <el-col :span="9">
                <el-tag  closable @close="deleteRight(slotProps.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限和三级权限展示 -->
              <el-col :span="15">
                <!-- 二级权限展示 -->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                :class="[i2 === 0 ? '' : 'topborder', 'vert-center']">
                  <el-col :span="8">
                    <el-tag type="success"  closable @close="deleteRight(slotProps.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限展示 -->
                  <el-col :span="16">
                    <!-- el-tag组件可添加closable属性来设置成可关闭状态，关闭时可触发close事件 -->
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="deleteRight(slotProps.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{slotProps.row}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <!-- 操作列 -->
        <el-table-column v-slot:default="slotProps" label="操作" width="180px">
          <!-- 角色信息修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditDialog(slotProps.row.id)"></el-button>
          <!-- 角色删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deletebyId(slotProps.row.id)"></el-button>
          <!-- 配置按钮弹出消息提醒,禁止鼠标进入提示框 -->
          <el-tooltip class="item" effect="dark" content="角色权限配置" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showsetroleDialog(slotProps.row)"></el-button>
          </el-tooltip>
          <!-- 配置角色权限部分，title配置对话框标题，close事件绑定清空表单框操作 -->
          <el-dialog :visible.sync="setroledialogVisible" width="50%" title="分配权限" @close="closesetroleDialog">
            <!-- 树形控件显示权限配置界面,data属性绑定树形控件的数据列表，props是显示内容的配置,node-key为树形每个节点的唯一标识，default-checked-keys为默认展开的树形节点，用id来选择
            default-expand-all默认展开所有节点,show-checkbox每个节点显示复选框 -->
            <el-tree :data="rightsList" :props="defaultProps" node-key="id" :default-checked-keys="defaultKeys"
            default-expand-all show-checkbox ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
              <el-button @click="setroledialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="allotRole">确 定</el-button>
            </span>
          </el-dialog>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      adddialogVisible: false,
      editdialogVisible: false,
      setroledialogVisible: false,
      // 添加角色存储对象
      addrole: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单规则验证
      addroleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 修改角色存储对象
      editrole: {},
      // 修改角色表单规则验证
      editroleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 树形权限列表数据
      rightsList: [],
      // 树形控件显示内容的配置
      defaultProps: {
        // 树形子节点名称
        children: 'children',
        // 节点标签名
        label: 'authName'
      },
      // 默认展开的树形节点数组
      defaultKeys: [],
      // 要分配权限的角色id
      roleId: ''
    }
  },
  created: async function() {
    this.getrolesList()
  },
  methods: {
    getrolesList: async function() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
      if (res.meta.status !== 200) return this.$message.error('请求角色列表失败')
    },
    addroleClosed: function() {
      this.$refs.addroleRef.resetFields()
    },
    addroleSubmit: function() {
      this.$refs.addroleRef.validate(async (result) => {
        if (!result) return
        const { data: res } = await this.$http.post('roles', this.addrole)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.adddialogVisible = false
        this.getrolesList()
      })
    },
    editroleClosed: function() {
      this.$refs.editroleRef.resetFields()
    },
    // 展示修改用户对话框
    showeditDialog: async function(id) {
      // 向服务端请求该用户相关信息
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败')
      this.editrole = res.data
      // 绑定数据后展示对话框
      this.editdialogVisible = true
    },
    // 处理修改用户表单提交事件
    editroleSubmit: function() {
      this.$refs.editroleRef.validate(async (result) => {
        // 验证不通过则阻止提交操作
        if (!result) return
        console.log(this.editrole)
        // 向服务端发送修改请求I
        const { data: res } = await this.$http.put('roles/' + this.editrole.roleId, {
          roleName: this.editrole.roleName,
          roleDesc: this.editrole.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('角色信息更新失败')
        // 数据更新成功后刷新列表,关闭对话框并显示信息
        this.getrolesList()
        this.editdialogVisible = false
        this.$message.success('角色信息更新成功')
      })
    },
    // 处理删除用户事件
    deletebyId: async function(id) {
      // 弹消息框警告用户是否确认删除
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消时会报错，所以需要用catch捕获错误并返回，函数体只有return时可如下简写
      }).catch(err => err)
      // 取消则显示取消弹框信息
      if (result !== 'confirm') return this.$message.info('已取消删除角色操作')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getrolesList()
    },
    // 处理删除某一级权限事件处理
    deleteRight: async function(role, rightId) {
      // 弹消息框警告用户是否确认删除
      const result = await this.$confirm('此操作将永久删除该角色下的权限，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消时会报错，所以需要用catch捕获错误并返回，函数体只有return时可如下简写
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('已取消删除权限操作')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('权限删除失败')
      // 删除权限成功后服务端会返回最新的当前角色权限数据,可直接更新该角色的权限数据,而不需要刷新整个用户列表数据,提升用户使用的体验感
      role.children = res.data // 注意，返回的仅仅是权限数据，而不是用户完整的数据
      this.$message.success('权限删除成功')
    },
    showsetroleDialog: async function(role) {
      // 获取要分配权限的角色id，供对话框提交按钮事件使用
      this.roleId = role.id
      this.setroledialogVisible = true
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('权限列表请求失败')
      // 填充树形权限列表
      this.rightsList = res.data
      // 获取默认展开的树形节点数组
      this.getdefaultKeys(role, this.defaultKeys)
    },
    // 得到特定角色拥有权限所对应的树形节点id数组
    getdefaultKeys: function(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => {
        this.getdefaultKeys(item, arr)
      })
    },
    closesetroleDialog: function() {
      this.defaultKeys = []
    },
    allotRole: async function() {
      const roleArr = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const roleStr = roleArr.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: roleStr
      })
      if (res.meta.status !== 200) return this.$message.error('角色权限分配失败')
      this.$message.success('角色权限分配成功')
      this.getrolesList()
      this.setroledialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-row {
    padding: 10px;
  }
  .topborder {
    border-top: 1px solid #eee;
  }
  .bottomborder {
    border-bottom: 1px solid #eee;
  }
  .vert-center {
    display: flex;
    align-items: center;
  }
</style>
