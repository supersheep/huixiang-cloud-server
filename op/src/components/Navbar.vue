<template>
  <el-menu default-active="1" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="1"><router-link to="/" tag="li">首页</router-link></el-menu-item>
    <el-menu-item index="2"><router-link to="/piece" tag="li">用户内容维护</router-link></el-menu-item>
    <el-menu-item index="3">自建内容维护</el-menu-item>
    <el-menu-item index="4">当前环境: {{env}}</el-menu-item>
  </el-menu>
</template>

<script>
  import request from 'request'
  export default {
    data () {
      return {
        env: ''
      }
    },
    mounted () {
      console.log(123)
      request.get('/env')
        .then((env) => {
          console.log('env', env)
          this.env = env
        }).catch((err) => {
          console.log('err', err)
        })
    },
    methods: {
      handleSelect (key, keyPath) {
        console.log(key, keyPath, this.$router)
        // if (key === '2') {
        //   location.href = '/op/piece'
        // }
      }
    }
  }
</script>
