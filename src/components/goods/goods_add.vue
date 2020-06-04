<template>
  <div class="container">
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 商品添加提醒 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false"></el-alert>
      <!-- 商品添加步骤进度条,并将active的step与标签的name绑定，需要将字符串类型转换成num -->
      <el-steps :space="200" :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏部分均为表单项，所以form组件应包裹在tabs组件外面 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="80px" label-position="top">
        <!-- tab栏部分,v-model绑定的是标签栏中name属性的值,before-leave为切换标签之前的钩子,tab-click为标签被点击事件 -->
        <el-tabs tab-position="left" v-model="activeStep" :before-leave="beforeLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList"
                :props="catProps" @change="catHandleChange" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in catManyList" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="(item, i) in catOnlyList" :key="i" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传控件，headers为图片上传的头部设置，action的地址需要为绝对路径 -->
            <el-upload :action="uploadURL" list-type="picture" :headers="uploadHeaders"
            :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <!-- 图片预览对话框 -->
            <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
              <img :src="filePrePath" alt="" class="preImg">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoodsSubmit" class="addBtn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>
<script>
// 引入lodash的深拷贝方法
import _ from 'lodash'
export default {
  data() {
    return {
      // 激活的进度步骤,同时也是标签栏的激活项
      activeStep: '0',
      // 添加商品提交数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addRules: {
        goods_name: [
          { required: true, message: '请填写商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请填写商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请填写商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请填写商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数据
      cateList: [],
      // 商品分类级联选择器配置
      catProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数数据
      catManyList: [],
      // 静态参数数据
      catOnlyList: [],
      // 上传文件路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片头部信息配置token实现鉴权
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 上传图片的临时存放地址
      fileTmpPath: '',
      // 预览图片的图片请求路径
      filePrePath: '',
      // 图片预览对话框显示控制变量
      picDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    getCateList: async function() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
    },
    // 级联选择器选择变化事件
    catHandleChange: function() {
      if (this.addForm.goods_cat.length < 3) this.addForm.goods_cat = []
    },
    // 标签切换时的处理函数,return false则阻止标签栏切换
    beforeLeave: function(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length < 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 标签被点击事件
    tabClick: async function() {
      // 动态参数设置页面
      if (this.activeStep === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cat_Id}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取商品分类参数失败')
        this.catManyList = res.data
        this.catManyList.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
      } else if (this.activeStep === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cat_Id}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取商品分类参数失败')
        this.catOnlyList = res.data
      }
    },
    // 图片预览事件处理
    handlePreview (file) {
      this.filePrePath = file.response.data.url
      this.picDialogVisible = true
    },
    // 图片删除事件处理
    handleRemove (file) {
      const i = this.addForm.pics.findIndex(item => item.pic === file.response.data.tmp_path)
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功事件处理
    handleSuccess (response) {
      if (response.meta.status !== 200) return this.$message.error('图片上传失败')
      this.$message.success('图片上传成功')
      this.fileTmpPath = response.data.tmp_path
      this.addForm.pics.push({
        pic: this.fileTmpPath
      })
    },
    // 添加商品提交事件处理
    addGoodsSubmit () {
      // 提交前进行表单整体验证
      this.$refs.addFormRef.validate(async result => {
        if (result) {
          // 深拷贝添加商品对象，因为级联选择器绑定值必须为数组数据结构
          const addFormSubmit = _.cloneDeep(this.addForm)
          // 处理添加商品对象的商品分类格式
          addFormSubmit.goods_cat = addFormSubmit.goods_cat.join(',')
          // 处理添加商品对象的商品分类属性格式
          this.catManyList.forEach(item => {
            const addManyAttr = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(addManyAttr)
          })
          this.catOnlyList.forEach(item => {
            const addOnlyAttr = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(addOnlyAttr)
          })
          addFormSubmit.attrs = this.addForm.attrs
          console.log(addFormSubmit)
          // 进行表单的提交
          const { data: res } = await this.$http.post('/goods', addFormSubmit)
          if (res.meta.status !== 201) return this.$message.error('添加商品失败')
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        } else {
          this.$message.error('请补全必要的表单信息')
        }
      })
    }
  },
  computed: {
    cat_Id: function() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return ''
      }
    }
  }
}
</script>
<style scoped lang="less">
.el-steps {
  margin-top: 15px;
  margin-bottom: 15px;
}
.el-step__title {
  font-size: 14px;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.preImg {
  width: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>
