<template>
  <view class="page">
    <view class="user-container">
      <view class="user-info-bar">
        <image class="user-avatar" src="/static/images/default-user.png" mode="aspectFill"></image>
        <text class="user-name">注册</text>
      </view>
    </view>
    
    <view class="register-container">
      <view class="register-card">
        <text class="register-title">注册</text>
        
        <view class="register-form">
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
          
          <view class="form-group">
            <text class="form-label">确认密码</text>
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="请再次输入密码"
              class="form-input"
              maxlength="20"
            />
          </view>
          
          <button 
            class="register-btn" 
            @click="handleRegister"
            :disabled="loading"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </view>
        
        <view class="login-link">
          <text>已有账号？</text>
          <text class="link-text" @click="goToLogin">立即登录</text>
        </view>
        
        <view v-if="error" class="error-message">
          <text>{{ error }}</text>
        </view>
        
        <view v-if="success" class="success-message">
          <text>{{ success }}</text>
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
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    const handleRegister = async () => {
      // 表单验证
      if (!username.value || !password.value || !confirmPassword.value) {
        error.value = '请填写完整的注册信息'
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致'
        uni.showToast({
          title: '密码不一致',
          icon: 'none'
        })
        return
      }

      if (password.value.length < 6) {
        error.value = '密码长度至少6位'
        uni.showToast({
          title: '密码至少6位',
          icon: 'none'
        })
        return
      }

      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const response = await request.post('/api/auth/register', {
          username: username.value,
          password: password.value
        })

        if (response.success) {
          success.value = '注册成功！正在跳转到登录页面...'
          
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          
          // 如果注册后直接返回了token，可以选择自动登录
          if (response.data?.token) {
            uni.setStorageSync('token', response.data.token)
            if (response.data?.username) {
              uni.setStorageSync('username', response.data.username)
            }
            // 注册成功后直接跳转到待办页面
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/todo/todo'
              })
            }, 2000)
          } else {
            // 3秒后跳转到登录页面
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/login/login'
              })
            }, 3000)
          }
        } else {
          error.value = response.message || '注册失败'
          uni.showToast({
            title: response.message || '注册失败',
            icon: 'error'
          })
        }
      } catch (err) {
        console.error('注册失败：', err)
        error.value = err.message || '注册失败，请检查网络连接'
        uni.showToast({
          title: '注册失败',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const goToLogin = () => {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }

    return {
      username,
      password,
      confirmPassword,
      loading,
      error,
      success,
      handleRegister,
      goToLogin
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

.register-container {
  padding: 20px;
}

.register-card {
  box-sizing: border-box;
  padding: 40px;
  background: #fff8f0;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 10px auto 0;
  border: 3px solid #ffccaa;
  max-width: 400px;
}

.register-title {
  display: block;
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.register-form {
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

.register-btn {
  background-color: #ff9980;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

.register-btn:active {
  background-color: #ff7a5a;
}

.register-btn[disabled] {
  background-color: #ccc;
}

.login-link {
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

.success-message {
  background-color: #e8f5e8;
  padding: 10px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
  border: 1px solid #c8e6c9;
}

.success-message text {
  color: #2e7d32;
}

/* 响应式设计 */
@media screen and (max-width: 600px) {
  .register-card {
    margin: 0 auto;
    padding: 30px 20px;
  }
  
  .register-title {
    font-size: 20px;
  }
  
  .form-input {
    font-size: 14px;
  }
}
</style>