// uni-app 版本的请求工具
const BASE_URL = '/api'
const TIMEOUT = 10000

// 请求拦截器 - 自动添加 token
const addAuthHeader = (options) => {
  const token = uni.getStorageSync('token')
  if (token) {
    options.header = options.header || {}
    options.header.Authorization = `Bearer ${token}`
  }
  return options
}

// 响应拦截器 - 处理认证错误和统一错误处理
const handleResponse = (response, reject) => {
  const { statusCode, data } = response

  // 401 统一拦截
  if (statusCode === 401) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('username')
    uni.showToast({ title: '登录已过期', icon: 'none' })
    uni.reLaunch({ url: '/pages/login/login' })
    return reject(new Error('登录已过期'))
  }

  // 2xx 视为成功
  if (statusCode >= 200 && statusCode < 300) {
    // 后端始终返回对象：
    // 登录成功：{ token, username }
    // 登录失败：{ message }
    if (data.token && data.username) {
      // 自动存储登录态
      uni.setStorageSync('token', data.token)
      uni.setStorageSync('username', data.username)
      return data
    } else if (data.message) {
      // 有 message 但无 token，视为业务错误
      return reject(new Error(data.message))
    } else {
      // 既无 token 也无 message，则直接透传整个 data
      return data
    }
  } else {
    // 非 2xx
    const errMsg = data?.message || `请求失败，状态码：${statusCode}`
    const error = new Error(errMsg)
    error.statusCode = statusCode
    error.data = data
    return reject(error)
  }
}

// 统一请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: options.timeout || TIMEOUT,
      ...options
    }

    addAuthHeader(requestOptions)

    console.log('发起请求：', requestOptions)

    uni.request({
      ...requestOptions,
      success: (response) => {
        console.log('请求成功：', response)
        try {
          const result = handleResponse(response, reject)
          // handleResponse 里如果是业务错误已经调用了 reject，这里只要 result 不为 undefined，就 resolve
          if (result !== undefined) {
            resolve(result)
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        console.error('请求失败：', error)
        let errorMessage = '网络请求失败'
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMessage = '请求超时'
          } else if (error.errMsg.includes('fail')) {
            errorMessage = '网络连接失败'
          }
        }
        uni.showToast({ title: errorMessage, icon: 'none' })
        const requestError = new Error(errorMessage)
        requestError.original = error
        reject(requestError)
      }
    })
  })
}

// 封装常用的请求方法（无变化）
const api = {
  get(url, params = {}, options = {}) {
    return request({ url, method: 'GET', data: params, ...options })
  },
  post(url, data = {}, options = {}) {
    return request({ url, method: 'POST', data, ...options })
  },
  put(url, data = {}, options = {}) {
    return request({ url, method: 'PUT', data, ...[object Object] })
  },
  delete(url, data = {}, options = {}) {
    return request({ url, method: 'DELETE', data, ...options })
  },
  upload(url, filePath, formData = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync('token')
      const header = { ...options.header }
      if (token) header.Authorization = `Bearer ${token}`

      uni.uploadFile({
        url: BASE_URL + url,
        filePath,
        name: options.name || 'file',
        formData,
        header,
        success: (response) => {
          try {
            const data = JSON.parse(response.data)
            resolve(data)
          } catch (error) {
            resolve(response.data)
          }
        },
        fail: (error) => {
          console.error('上传失败：', error)
          uni.showToast({ title: '上传失败', icon: 'none' })
          reject(error)
        }
      })
    })
  }
}

api.setBaseURL = (url) => { BASE_URL = url }
api.getBaseURL = () => BASE_URL

export default api
