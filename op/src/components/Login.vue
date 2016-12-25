<template>
  <div class="login">
    <el-form label-width="80px">
      <el-form-item label="用户名">
        <el-input
          placeholder="用户名"
          v-model="name"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          type="password"
          placeholder="密码"
          v-model="password">
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import account from 'account'

  export default {
    data () {
      return {
        name: '',
        password: ''
      }
    },
    methods: {
      onSubmit () {
        let redir = this.$route.query.redir
        account.login(this.name, this.password)
          .then(() => {
            this.$router.push({
              path: redir
            })
          })
      }
    }
  }
</script>

<style>
  .login {
    margin: 40px auto;
    width: 600px;
  }
</style>
