<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/logo.png" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px': '200px'">
        <!-- 侧边菜单展开收缩按钮 -->
        <div class="collapse_button" @click="toggle_collapse">|||</div>
        <!-- unique-opened属性设置是否只保持一个子菜单的展开,collapse是否水平折叠收起菜单,collapse-transition是否开启折叠动画，default-active当前激活菜单的 index -->
        <!-- router属性配置是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
        <el-menu :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :default-active='navState' router>
          <!-- 一级菜单 -->
          <!-- index属性每个submenu需统一，所以采用动态绑定方式绑定id，需注意的是必须是string数据，可用作路由名称 -->
          <el-submenu :index="item.id + ''" v-for="(item, index) in menu_list" :key="item.id">
            <template slot="title">
              <!-- 注意：含有变量的属性必须要动态绑定 -->
              <i :class="icon_list[index]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 一级菜单内容 -->
            <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/' + subitem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data: function() {
    return {
      // 菜单选项列表
      menu_list: [],
      // 菜单选项对应的字体图标
      icon_list: {
        0: 'iconfont icon-users',
        1: 'iconfont icon-tijikongjian',
        2: 'iconfont icon-shangpin',
        3: 'iconfont icon-danju',
        4: 'iconfont icon-baobiao'
      },
      // 是否折叠按钮的标志位
      isCollapse: false,
      // 菜单选项记录
      navState: ''
    }
  },
  mounted: async function() {
    const { data: res } = await this.$http.get('/menus')
    if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    this.menu_list = res.data
    // console.log(this.menu_list)
    // 取出当前的菜单激活选项
    this.navState = window.sessionStorage.getItem('navState')
  },
  methods: {
    logout: function() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    toggle_collapse: function() {
      this.isCollapse = !this.isCollapse
    },
    // 用于配置激活的菜单选项,存储于session中方便页面刷新的时候能保存状态
    saveNavState: function(navState) {
      window.sessionStorage.setItem('navState', navState)
      this.navState = navState
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #22227e;
  display: flex;
  padding-left: 0;
  justify-content: space-between;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    img {
      height: 58px;
      margin-right: 20px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.el-aside {
  .el-menu {
    border-right: none;
  }
}
.collapse_button {
  height: 24px;
  line-height: 24px;
  font-size: 16px;
  background-color: #ECF5FF;
  text-align: center;
  cursor: pointer;
}
</style>
