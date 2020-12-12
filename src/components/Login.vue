<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_login">
        <img src="../assets/logo.png">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRule" class="login_form" label-width="0px">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" />
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password" />
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重制</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRule: {
        username: [
          {
            required: true,
            message: '请输入登录名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login: function() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post(
          '/login',
          this.loginForm
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败!')
        }
        this.$message.success('登录成功!')
        // console.log(res.data.token) // 看下token
        window.sessionStorage.setItem('token', res.data.token) // 把token保存起来
        // this.$router.push('/users')
        this.$router.push({ name: 'test', params: { userId: '123' }})
      })
    }
  }
}
</script>

<style lang="less" scope>
.login_container {
    height: 100%;
    background-color: #2b4b6b;
}

.login_box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
}

.avatar_login {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 5px #ddd;
    background-color: #fff;
    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}

.btns {
    display: flex;
    justify-content: flex-end;
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>
