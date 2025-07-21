// ========== 统一的HTTP工具类 ==========
class HttpUtil {
  constructor() {
    // 配置
    this.config = {
      // 根据环境设置baseUrl
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-api.com' 
        : '',  // 开发环境使用代理
      timeout: 10000,
      
      // API接口路径
      endpoints: {
        // 认证相关
        login: '/auth/login',
        register: '/auth/register',
        
        // 任务相关
        taskAll: '/task/all',
        taskPending: '/task/pending',
        taskCompleted: '/task/completed',
        taskCount: '/task/count',
        taskAdd: '/task/add',
        taskComplete: '/task/complete',
        taskCompleteBatch: '/task/complete/batch',
      }
    }
  }

  // 判断是否为白名单接口（不需要token）
  isWhiteList(url) {
    const whiteList = ['/auth/login', '/auth/register']
    return whiteList.some(item => url.includes(item))
  }

  // 请求拦截器
  requestInterceptor(options) {
    // 显示加载提示
    uni.showLoading({
      title: '加载中...'
    })
    
    // 从缓存中获取token
    const token = uni.getStorageSync('token')
    
    // 如果有token且不是白名单接口，则添加Authorization头
    if (token && !this.isWhiteList(options.url)) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      }
    }
    
    console.log('请求参数：', options) // 调试日志
    return options
  }

  // 响应拦截器 - 统一处理 ApiResponse 格式
  responseInterceptor(response) {
    uni.hideLoading()
    
    console.log('响应数据：', response) // 调试日志
    
    // 检查HTTP状态码
    if (response.statusCode !== 200) {
      if (response.statusCode === 401) {
        // 401未授权，清除token并跳转登录页
        uni.removeStorageSync('token')
        uni.removeStorageSync('username')
        uni.showToast({
          title: '登录已过期',
          icon: 'none'
        })
        uni.reLaunch({
          url: '/pages/login/login'
        })
      } else {
        uni.showToast({
          title: `请求失败 ${response.statusCode}`,
          icon: 'none'
        })
      }
      return Promise.reject(response)
    }
    
    // 统一处理 ApiResponse 格式的数据
    const { data } = response
    
    // 检查是否是 ApiResponse 格式 { success: boolean, message: string, data: T }
    if (data && typeof data.success === 'boolean') {
      if (!data.success) {
        // 业务失败，显示错误信息
        uni.showToast({
          title: data.message || '操作失败',
          icon: 'none'
        })
        return Promise.reject(data)
      }
      // 业务成功，返回 ApiResponse 对象
      return data
    }
    
    // 如果不是标准的 ApiResponse 格式，直接返回原数据
    return data
  }

  // 通用请求方法
  request(options) {
    // 请求拦截
    const requestOptions = this.requestInterceptor({
      url: this.config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: this.config.timeout
    })

    return new Promise((resolve, reject) => {
      uni.request({
        ...requestOptions,
        success: (res) => {
          try {
            const response = this.responseInterceptor(res)
            if (response && response.then) {
              response.catch(reject)
            } else {
              resolve(response)
            }
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          uni.hideLoading()
          console.error('网络请求失败：', error)
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }

  // GET请求
  get(url, data = {}) {
    return this.request({
      url,
      method: 'GET',
      data
    })
  }

  // POST请求
  post(url, data = {}) {
    return this.request({
      url,
      method: 'POST',
      data
    })
  }

  // PUT请求
  put(url, data = {}) {
    return this.request({
      url,
      method: 'PUT',
      data
    })
  }

  // DELETE请求
  delete(url, data = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data
    })
  }

  // ========== API方法 ==========
  
  // 认证相关
  login(loginData) {
    return this.post(this.config.endpoints.login, loginData)
  }

  register(registerData) {
    return this.post(this.config.endpoints.register, registerData)
  }

  // 任务相关
  getTaskAll() {
    return this.get(this.config.endpoints.taskAll)
  }

  getTaskPending() {
    return this.get(this.config.endpoints.taskPending)
  }

  getTaskCompleted() {
    return this.get(this.config.endpoints.taskCompleted)
  }

  getTaskCount() {
    return this.get(this.config.endpoints.taskCount)
  }

  addTask(taskData) {
    return this.post(this.config.endpoints.taskAdd, taskData)
  }

  completeTask(taskId) {
    return this.put(`${this.config.endpoints.taskComplete}/${taskId}`)
  }

  completeTaskBatch(taskIds) {
    return this.put(this.config.endpoints.taskCompleteBatch, taskIds)
  }
}

// 创建单例实例
export const http = new HttpUtil()

// 也可以导出api对象保持兼容性
export const api = http