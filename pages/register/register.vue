<template>
  <view class="user-container">
       <view class="user-info-bar">
           <image class="user-avatar" src="/static/images/default-user.png" alt="用户头像" />
           <text class="user-name">register</text>
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
       <view class="form-group">
         <text class="form-label">确认密码</text>
         <input
           type="password"
           v-model="confirmPassword"
           placeholder="请再次输入密码"
           class="form-input"
         />
       </view>
       <button @click="handleRegister" class="register-btn" :disabled="loading">
         {{ loading ? '注册中...' : '注册' }}
       </button>
     </view>
     <view class="login-link">
       已有账号？<text @click="goToLogin" class="link-text">立即登录</text>
     </view>
     <view v-if="error" class="error-message">
       {{ error }}
     </view>
     <view v-if="success" class="success-message">
       {{ success }}
     </view>
   </view>
 </view>
</template>

<script>
import { ref } from 'vue'
import { http } from '../../utils/http.js'

export default {
  name: 'Register',
  setup() {
    // 响应式数据
    const username = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    // 注册处理函数
    const handleRegister = async () => {
      // 表单验证
      if (!username.value || !password.value || !confirmPassword.value) {
        error.value = '请填写完整的注册信息'
        return
      }

      if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致'
        return
      }

      if (password.value.length < 6) {
        error.value = '密码长度至少6位'
        return
      }

      loading.value = true
      error.value = ''
      success.value = ''

      try {
        console.log('开始注册请求...')
        // http.register 现在直接返回 ApiResponse 对象
        const result = await http.register({
          username: username.value,
          password: password.value
        })

        console.log('注册响应:', result)

        // result 就是 ApiResponse 对象 { success: true, message: '注册成功', data: {...} }
        if (result && result.success) {
          success.value = result.message || '注册成功！正在跳转...'
          
          // 如果注册后直接返回了token，可以选择自动登录
          if (result.data && result.data.token) {
            uni.setStorageSync('token', result.data.token)
            console.log('Token 已保存:', result.data.token)
            
            if (result.data && result.data.username) {
              uni.setStorageSync('username', result.data.username)
              console.log('用户名已保存:', result.data.username)
            }
            
            // 注册成功后直接跳转到待办页面
            setTimeout(() => {
              uni.navigateTo({
                url: '../todo/todo'
              })
            }, 2000)
          } else {
            // 没有返回token，3秒后跳转到登录页面
            setTimeout(() => {
              uni.navigateTo({
                url: '../login/login'
              })
            }, 3000)
          }
        } else {
          console.log('注册失败:', result && result.message ? result.message : '注册失败')
          error.value = result && result.message ? result.message : '注册失败'
        }
      } catch (err) {
        console.error('注册请求异常:', err)
        // 错误处理，err 可能是 ApiResponse 对象或网络错误
        if (err && err.message) {
          error.value = err.message
        } else if (err && err.errMsg) {
          error.value = err.errMsg
        } else {
          error.value = '注册失败，请检查网络连接'
        }
      } finally {
        loading.value = false
      }
    }

    // 跳转到登录页面
    const goToLogin = () => {
      console.log('点击了立即登录按钮')
      
      // 使用uni-app标准的跳转方式
      uni.navigateTo({
        url: '../login/login'
      })
    }

    // 暴露给模板使用的数据和方法
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
.register-container {
 font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
}

.register-card {
 box-sizing: border-box;
 padding: 40px;
 background: #fff8f0;
 border-radius: 20px;
 box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
 width: calc(100% - 40px);
 margin: 10px auto 0;
 border: 3px solid #ffccaa;
}

.register-title {
 text-align: center;
 color: #333;
 margin-bottom: 30px;
 font-size: 24px;
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
 outline: none;
 transition: border-color 0.3s;
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
 cursor: pointer;
 transition: background-color 0.3s;
 margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
 background-color: #ff7a5a;
}

.register-btn:disabled {
 background-color: #ccc;
 cursor: not-allowed;
}

.login-link {
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

.success-message {
 background-color: #e8f5e8;
 color: #2e7d32;
 padding: 10px;
 border-radius: 8px;
 margin-top: 15px;
 text-align: center;
 border: 1px solid #c8e6c9;
}
button{
	width:249px;
}
</style>