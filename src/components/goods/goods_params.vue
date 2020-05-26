<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card class="box-card">
      <!-- 警示信息，配置：不可关闭，带图标 -->
      <el-alert title="注意:只允许为第三级分类添加分类参数" type="warning" :closable="false" show-icon></el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <!-- model为选中项绑定值，必须是数组，option为选择器中的选项数组，prop为选择器的具体配置 -->
          <el-cascader v-model="CateId" :options="goodsCateList" :props="cascaderProps" clearable @change="CateIdChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- 选项卡参数配置部分 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many" size="mini">
          <el-button type="primary" :disabled="btnOn" @click="addAttrDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格部分 -->
          <el-table :data="catemanyList" border stripe>
            <!-- 扩展列用于显示动态参数的具体值 -->
            <el-table-column type="expand" v-slot:default="slotProps">
              <el-tag v-for="(item, index) in slotProps.row.attr_vals" :key="index" @close="tagClose(index, slotProps.row)" closable>{{item}}</el-tag>
              <!-- 动态编辑标签，包括输入框和按钮的动态切换 -->
              <el-input
                class="input-new-tag"
                v-if="slotProps.row.inputVisible"
                v-model="slotProps.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(slotProps.row)"
                @blur="handleInputConfirm(slotProps.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="名称"></el-table-column>
            <el-table-column v-slot:default="slotProps" label="操作">
              <!-- 属性信息修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAttrDialogShow(slotProps.row.attr_id)"></el-button>
              <!-- 属性删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(slotProps.row.attr_id)"></el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only" size="mini">
          <el-button type="primary" :disabled="btnOn" @click="addAttrDialogShow = true">添加属性</el-button>
          <!-- 静态属性表格部分 -->
          <el-table :data="cateonlyList" border stripe>
            <el-table-column type="expand" v-slot:default="slotProps">
              <!-- 循环渲染值标签 -->
              <el-tag v-for="(item, index) in slotProps.row.attr_vals" :key="index" @close="tagClose(index, slotProps.row)" closable>{{item}}</el-tag>
              <!-- 动态编辑标签，包括输入框和按钮的动态切换 -->
              <el-input
                class="input-new-tag"
                v-if="slotProps.row.inputVisible"
                v-model="slotProps.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(slotProps.row)"
                @blur="handleInputConfirm(slotProps.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="名称"></el-table-column>
            <el-table-column v-slot:default="slotProps" label="操作">
              <!-- 属性信息修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAttrDialogShow(slotProps.row.attr_id)"></el-button>
              <!-- 属性删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttr(slotProps.row.attr_id)"></el-button>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加属性对话框 -->
    <el-dialog :title="'添加' + dialogName" :visible.sync="addAttrDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addAttrForm" :rules="addrules" ref="addAttrFormRefs" label-width="100px">
        <el-form-item :label="dialogName" prop="attr_name"><el-input v-model="addAttrForm.attr_name"></el-input></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttrSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改属性对话框 -->
    <el-dialog :title="'修改' + dialogName" :visible.sync="editAttrDialogVisible" width="50%">
      <el-form :model="editAttrForm" :rules="editrules" ref="editAttrFormRefs" label-width="100px">
        <el-form-item :label="dialogName" prop="attr_name"><el-input v-model="editAttrForm.attr_name"></el-input></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttrSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goodsCateList: [],
      // 级联选择器绑定参数
      CateId: [],
      // 级联选择器配置参数
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选项卡绑定值
      activeName: 'many',
      // 商品动态参数列表
      catemanyList: [],
      // 商品静态参数列表
      cateonlyList: [],
      // 添加属性对话框控制变量
      addAttrDialogVisible: false,
      // 添加属性表单绑定数据
      addAttrForm: {
        attr_name: ''
      },
      // 添加属性验证规则
      addrules: {
        attr_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      // 修改属性对话框控制变量
      editAttrDialogVisible: false,
      // 修改属性表单绑定数据
      editAttrForm: {
        attr_name: ''
      },
      // 修改属性验证规则
      editrules: {
        attr_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 根据是否选中分来来判断按钮是否禁用
    btnOn: function() {
      if (this.CateId.length > 2) return false
      return true
    },
    // 选中的三级商品分类
    thirdCateId: function() {
      if (this.CateId.length > 2) return this.CateId[2]
      return null
    },
    // 对话框中的文本显示变量
    dialogName: function() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  created() {
    this.getGoodsCate()
  },
  methods: {
    // 获取商品分类列表信息
    getGoodsCate: async function() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类信息失败')
      this.goodsCateList = res.data
      // console.log(this.goodsCateList)
    },
    // 获取某商品分类的参数信息
    getGoodsParams: async function() {
      const { data: res } = await this.$http.get(`categories/${this.thirdCateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类参数失败')
      this.cateParamsList = res.data
      // 将参数的value从空格分隔的字符串形式转化成数组
      this.cateParamsList.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        // 给每个参数加上动态编辑标签的布尔值和绑定值，保证每个参数的动态编辑标签的布尔值和绑定值都是独一的
        element.inputVisible = false
        element.inputValue = ''
      })
      console.log(this.cateParamsList)
      // 根据标签栏的激活项绑定数据
      if (this.activeName === 'many') {
        this.catemanyList = res.data
      } else {
        this.cateonlyList = res.data
      }
    },
    // 级联选择器选中第三级参数时触发获取参数
    CateIdChange: function() {
      if (!this.btnOn) {
        this.getGoodsParams()
      } else {
        this.catemanyList = []
        this.cateonlyList = []
      }
    },
    // tab栏变化且有第三参数时触发获取参数
    handleTabClick: function() {
      if (!this.btnOn) {
        this.getGoodsParams()
      }
    },
    addAttrSubmit: function() {
      this.$refs.addAttrFormRefs.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.thirdCateId}/attributes`, {
          attr_name: this.addAttrForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加属性失败')
        this.$message.success('添加属性成功')
        this.addAttrDialogVisible = false
        this.getGoodsParams()
      })
    },
    addDialogClose: function() {
      this.$refs.addAttrFormRefs.resetFields()
    },
    // 修改属性对话框展示
    editAttrDialogShow: async function(id) {
      this.editAttrDialogVisible = true
      const { data: res } = await this.$http.get(`categories/${this.thirdCateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('查询属性名称失败')
      this.editAttrForm = res.data
    },
    // 修改属性提交事件
    editAttrSubmit: function() {
      this.$refs.editAttrFormRefs.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.thirdCateId}/attributes/${this.editAttrForm.attr_id}`, {
          attr_name: this.editAttrForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改属性失败')
        this.$message.success('修改属性成功')
        this.editAttrDialogVisible = false
        this.getGoodsParams()
      })
    },
    // 删除属性事件
    deleteAttr: async function(id) {
      // 弹消息框警告用户是否确认删除
      const result = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消时会报错，所以需要用catch捕获错误并返回，函数体只有return时可如下简写
      }).catch(err => err)
      // 取消则显示取消弹框信息
      if (result !== 'confirm') return this.$message.info('已取消删除属性操作')
      const { data: res } = await this.$http.delete(`categories/${this.thirdCateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除属性失败')
      }
      this.$message.success('删除属性成功')
      this.getGoodsParams()
    },
    // 保存属性事件处理
    saveAttr: async function(row) {
      const { data: res } = await this.$http.put(`categories/${this.thirdCateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改参数值失败')
      this.$message.success('修改参数值成功')
    },
    // 动态编辑标签确认事件处理
    handleInputConfirm: function(row) {
      if (row.inputValue.trim().length <= 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue)
        this.saveAttr(row)
        row.inputValue = ''
        row.inputVisible = false
      }
    },
    // 动态编辑标签点击编辑处理
    showInput: function(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 参数值标签删除处理
    tagClose: function(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttr(row)
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 25px;
}
.input-new-tag {
  width: 100px;
  margin-left: 5px;
}
</style>
