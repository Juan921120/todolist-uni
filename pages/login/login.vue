<template>
  <view class="user-container">
        <view class="user-info-bar">
            <image class="user-avatar" src="/static/images/default-user.png" alt="用户头像" />
            <text class="user-name">login</text>
        </view>
    </view>
  <view class="login-container">
    <view class="login-card">
      <text class="login-title">登录</text>
      <view class="login-form">
        <view class="form-group">
          <text class="form-label">用户名</text>
          <input
            type="text"
            v-model="username"
            placeholder="请输入用户名"
            class="form-input"
          />
        </view>
        <view class="form-group">
          <text class="form-label">密码</text>
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            class="form-input"
          />
        </view>
        <button @click="handleLogin" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>
      <view class="register-link">
        还没有账号？<text @click="goToRegister" class="link-text">立即注册</text>
      </view>
      <view v-if="error" class="error-message">
        {{ error }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { http } from '../../utils/http.js'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请填写完整的登录信息'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('开始登录请求...')
    // 修改：http.login 现在直接返回 ApiResponse 对象，不需要处理 response.data
    const result = await http.login({
      username: username.value,
      password: password.value
    })

    console.log('登录响应:', result)

    // 修改：result 就是 ApiResponse 对象 { success: true, message: '登录成功', data: {...} }
    if (result.success) {
      console.log('登录成功，响应数据：', result.data)
      
      // 保存 token 和用户信息
      if (result.data?.token) {
        uni.setStorageSync('token', result.data.token)
        console.log('Token 已保存:', result.data.token)
      }
      if (result.data?.username) {
        uni.setStorageSync('username', result.data.username)
        console.log('用户名已保存:', result.data.username)
      }
      
      // 登录成功，跳转到待办列表页面
      console.log('准备跳转到 todo 页面')
      uni.navigateTo({
        url: '../todo/todo'
      })
      console.log('跳转命令已执行')
    } else {
      console.log('登录失败:', result.message)
      error.value = result.message || '登录失败'
    }
  } catch (err) {
    console.error('登录请求异常:', err)
    // 修改：错误处理，err 可能是 ApiResponse 对象或网络错误
    if (err.message) {
      error.value = err.message
    } else if (err.errMsg) {
      error.value = err.errMsg
    } else {
      error.value = '登录失败，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  console.log('点击了立即注册按钮')
  
  // 使用uni-app标准的跳转方式
  uni.navigateTo({
    url: '../register/register'
  })
}
</script>

<style scoped>
.login-container {
  margin-top: 10px;
  min-height: 100vh;
  background-image:
    url('/static/images/cat-paw.png'),
    url('/static/images/cat-paw.png');
  background-size: 80px 80px, 80px 80px;
  background-position: 0 0, 40px 40px;
  background-repeat: repeat, repeat;
  background-color: #FFEEE2;
  font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
}

.login-card {
  background: #fff8f0;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: calc(100% - 40px);
  margin: 20px auto 0;
  max-width: 400px;
  border: 3px solid #ffccaa;
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #555;
  font-weight: bold;
  font-size: 14px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #FEDEB8;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
  background-color: white;
}

.form-input:focus {
  border-color: #ff9980;
}

.login-btn {
  background-color: #ff9980;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background-color: #ff7a5a;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link-text {
  color: #ff9980;
  text-decoration: none;
  font-weight: bold;
}

.link-text:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #ffedeb;
  color: #d32f2f;
  padding: 10px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
  border: 1px solid #ffcdd2;
}

@media (max-width: 480px) {
  .login-card {
   margin: 0 auto;
   width: calc(100% - 120px);
  }
  
  .login-title {
    font-size: 20px;
  }
}
</style>