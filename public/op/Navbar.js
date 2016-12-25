HXOP.Components.Navbar = Vue.component('navbar', {
  template: `
    <el-menu default-active="1" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">用户内容维护</el-menu-item>
      <el-menu-item index="3">自建内容维护</el-menu-item>
      <el-menu-item index="4">当前环境:{{env}}</el-menu-item>
    </el-menu>`,
  methods: {
    handleSelect(key, keyPath) {
      if (keyPath === '2') {
        location.href = '/op/piece'
      }
    }
  }
})
