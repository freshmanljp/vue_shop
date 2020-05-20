<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局部分 -->
    <el-card class="box-card">
      <!-- 商品分类按钮 -->
      <el-row>
        <el-button type="primary" id="addCateBtn" @click="addCateDialogShow">添加分类</el-button>
      </el-row>
      <!-- 商品分类列表 -->
      <tree-table :data="goodsCateList" :columns="columns"
      :show-index="true" index-text="" border :expand-type="false" :selection-type="false" :show-row-hover="false">
        <template v-slot:isOk="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color: seagreen;"></i>
          <i v-else-if="scope.row.cat_deleted === true" class="el-icon-error" style="color: red;"></i>
        </template>
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="info" size="mini">三级</el-tag>
        </template>
        <template v-slot:opt="scope">
          <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" class="el-icon-delete" size="mini" @click="deletebyId(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页控件 -->
      <el-pagination
        @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum" :page-sizes="[8, 16, 24, 32]" :page-size="8"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" @close="addCateClose()">
      <el-form :model="addCate" :rules="addrules" ref="addCateRefs">
        <el-form-item label="分类名称: " label-width="100px" prop="cat_name">
          <el-input v-model="addCate.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类: " label-width="100px" prop="parCate">
          <!-- 父级分类的选择采用级联选择器来实现 -->
          <!-- model为选中项绑定值，必须是数组，option为选择器中的选项数组，prop为选择器的具体配置 -->
          <el-cascader
              v-model="parCateId" :options="parCatesList" :props="parCateProps"
              clearable
              @change="parCateIdChange"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCateSubmit()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible">
      <el-form :model="editCate" :rules="editrules" ref="editCateRefs">
        <el-form-item label="分类名称: " label-width="100px" prop="cat_name">
          <el-input v-model="editCate.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCateSubmit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      // 商品分类数据列表
      goodsCateList: [],
      // 商品分类数据的请求数据
      queryParams: {
        type: 3,
        pagenum: 1,
        pagesize: 8
      },
      total: 0,
      // 树形表格的列数据格式规则
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 对话框是否可视变量
      addCateDialogVisible: false,
      editCateDialogVisible: false,
      // 添加分类数据
      addCate: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类验证规则
      addrules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { max: 15, message: '长度在 0 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类的选中值
      parCateId: [],
      // 父级分类的展示数据列表
      parCatesList: [],
      // 级联选择器配置参数
      parCateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 是否严格的遵守父子节点不互相关联
        checkStrictly: true
      },
      // 修改分类数据
      editCate: {
        cat_name: '',
        cat_id: 0
      },
      // 修改分类验证规则
      editrules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { max: 15, message: '长度在 0 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getGoodsCate()
  },
  methods: {
    // 获取商品分类列表信息
    getGoodsCate: async function() {
      const { data: res } = await this.$http.get('/categories', { params: this.queryParams })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类信息失败')
      this.goodsCateList = res.data.result
      this.total = res.data.total
      // console.log(this.goodsCateList)
    },
    // 分页控件的方法
    handleSizeChange: function(sizeNum) {
      this.queryParams.pagesize = sizeNum
      this.getGoodsCate()
    },
    handleCurrentChange: function(pageNum) {
      this.queryParams.pagenum = pageNum
      this.getGoodsCate()
    },
    // 展示添加商品分类的对话框处理、
    addCateDialogShow: async function() {
      // 获取父级商品分类数据
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级商品分类信息失败')
      this.parCatesList = res.data
      // console.log(this.parCatesList)
      // 展示对话框
      this.addCateDialogVisible = true
    },
    // 级联选择器值改变时更新addCate中的值
    parCateIdChange: function() {
      if (this.parCateId.length !== 0) {
        this.addCate.cat_pid = this.parCateId[this.parCateId.length - 1]
        this.addCate.cat_level = this.parCateId.length
      } else {
        this.addCate.cat_pid = 0
        this.addCate.cat_level = 0
      }
    },
    // 添加商品分类提交事件
    addCateSubmit: function() {
      this.$refs.addCateRefs.validate(async result => {
        if (!result) return
        const { data: res } = await this.$http.post('categories', this.addCate)
        if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
        this.$message.success('添加商品分类成功')
        this.getGoodsCate()
        this.addCateDialogVisible = false
      })
    },
    // 添加商品分类对话框关闭清空数据事件
    addCateClose: function() {
      this.$refs.addCateRefs.resetFields()
      this.parCateId = []
      this.addCate.cat_level = 0
      this.addCate.cat_pid = 0
    },
    // 展示修改分类对话框
    showEditDialog: async function(id) {
      this.editCateDialogVisible = true
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询该商品分类失败')
      this.editCate.cat_name = res.data.cat_name
      this.editCate.cat_id = res.data.cat_id
    },
    // 修改商品分类提交事件
    editCateSubmit: function() {
      this.$refs.editCateRefs.validate(async result => {
        if (!result) return
        const { data: res } = await this.$http.put('categories/' + this.editCate.cat_id, { cat_name: this.editCate.cat_name })
        if (res.meta.status !== 200) return this.$message.error('修改商品分类失败')
        this.$message.success('修改商品分类成功')
        this.getGoodsCate()
        this.editCateDialogVisible = false
      })
    },
    // 处理删除分类事件
    deletebyId: async function(id) {
      // 弹消息框警告用户是否确认删除
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 取消时会报错，所以需要用catch捕获错误并返回，函数体只有return时可如下简写
      }).catch(err => err)
      // 取消则显示取消弹框信息
      if (result !== 'confirm') return this.$message.info('已取消删除分类操作')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getGoodsCate()
    }
  }
}
</script>

<style lang="less" scoped>
  #addCateBtn {
    margin-bottom: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
