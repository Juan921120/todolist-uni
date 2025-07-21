<template>
  <view class="page">
    <view class="user-container">
      <view class="user-info-bar">
        <image class="user-avatar" src="/static/images/default-user.png" mode="aspectFill"></image>
        <text class="user-name">登录</text>
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
              maxlength="20"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">密码</text>
            <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
              class="form-input"
              maxlength="20"
            />
          </view>
          
          <button 
            class="login-btn" 
            @click="handleLogin"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </view>
        
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="link-text" @click="goToRegister">立即注册</text>
        </view>
        
        <view v-if="error" class="error-message">
          <text>{{ error }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import request from '@/utils/request.js'

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      if (!username.value || !password.value) {
        error.value = '请填写完整的登录信息'
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      loading.value = true
      error.value = ''

      try {
        const response = await request.post('/api/auth/login', {
          username: username.value,
          password: password.value
        })

        if (response.success) {
          console.log('登录成功，响应数据：', response)
          
          // 保存 token 和用户信息
          if (response.data?.token) {
            uni.setStorageSync('token', response.data.token)
            console.log('Token 已保存')
          }
          if (response.data?.username) {
            uni.setStorageSync('username', response.data.username)
            console.log('用户名已保存')
          }
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 登录成功，跳转到待办列表页面
          console.log('准备跳转到 todo 页面')
          uni.reLaunch({
            url: '/pages/todlolist/todolist'
          })
        } else {
          error.value = response.message || '登录失败'
          uni.showToast({
            title: response.message || '登录失败',
            icon: 'error'
          })
        }
      } catch (err) {
        console.error('登录失败：', err)
        error.value = err.message || '登录失败，请检查网络连接'
        uni.showToast({
          title: '登录失败',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const goToRegister = () => {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    }

    return {
      username,
      password,
      loading,
      error,
      handleLogin,
      goToRegister
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-image: 
    url('/static/images/cat-paw.png'),
    url('/static/images/cat-paw.png');
  background-size: 80px 80px, 80px 80px;
  background-repeat: repeat, repeat;
  background-color: #FFEEE2;
  font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
}

.user-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.user-info-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  border-radius: 20px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.login-container {
  padding: 20px;
}

.login-card {
  background: #fff8f0;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 20px auto 0;
  max-width: 400px;
  border: 3px solid #ffccaa;
  box-sizing: border-box;
}

.login-title {
  display: block;
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
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
  margin-top: 10px;
}

.login-btn:active {
  background-color: #ff7a5a;
}

.login-btn[disabled] {
  background-color: #ccc;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link-text {
  color: #ff9980;
  font-weight: bold;
  margin-left: 5px;
}

.error-message {
  background-color: #ffedeb;
  padding: 10px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
  border: 1px solid #ffcdd2;
}

.error-message text {
  color: #d32f2f;
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
  .login-card {
    margin: 0 auto;
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 20px;
  }
  
  .form-input {
    font-size: 14px;
  }
}
</style>