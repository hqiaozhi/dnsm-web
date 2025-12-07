import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '',
  timeout: 5000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 检查HTTP状态码是否为200
    if (response.status !== 200) {
      // 登录API的错误由useAuth.ts单独处理，避免重复提示
      if (response.config.url?.includes('/login')) {
        return Promise.reject(new Error(`HTTP_ERROR_${response.status}`))
      }
      // ElMessage.error(`请求失败: ${response.statusText} (${response.status})`)
      return Promise.reject(new Error(`HTTP_ERROR_${response.status}`))
    }

    // 检查业务状态码
    const { code, message } = response.data
    // 特殊处理401未授权错误
    if (code === 401) {
      // 登录API的401错误不显示提示，由useAuth.ts处理
      if (!response.config.url?.includes('/login')) {
        ElMessage.error('登录已过期，请重新登录')

        const userStore = useUserStore()
        userStore.logout()

        // 异步跳转并等待完成后 reject
        setTimeout(() => {
          router.push('/')
        }, 1000)
        // 强制刷新当前页面
        location.reload()
      }

      return Promise.reject(new Error('TOKEN_EXPIRED'))
    }
    if (code && code !== 200) {
      // 登录API的错误由useAuth.ts单独处理，避免重复提示
      if (response.config.url?.includes('/login')) {
        return Promise.reject(new Error(`BUSINESS_ERROR_${code}`))
      }
      // 其他业务错误码统一处理
      ElMessage.error(message || `请求失败: ${code}`)
      return Promise.reject(new Error(`BUSINESS_ERROR_${code}`))
    }

    return response.data
  },
  (error) => {
    // 处理HTTP错误状态码
    if (error.response) {
      const { status, statusText } = error.response
      // 特殊处理401未授权错误
      if (status === 401) {
        // 登录请求的401错误不显示提示，由useAuth.ts处理
        if (!error.config.url?.includes('/login')) {
          ElMessage.error('登录已过期，请重新登录')
          
          const userStore = useUserStore()
          userStore.logout()
          setTimeout(() => {
            router.push('/')
          }, 1000)
        }

        return Promise.reject(new Error('TOKEN_EXPIRED'))
      }

      // 登录API的错误由useAuth.ts单独处理，避免重复提示
      if (!error.config.url?.includes('/login')) {
        // 其他HTTP错误状态码统一处理
        ElMessage.error(`请求失败: ${statusText} (${status})`)
      }
    } else if (error.request) {
      // 网络错误
      console.error('网络连接失败，请检查网络')
      // 登录API的错误由useAuth.ts单独处理，避免重复提示
      if (!error.config.url?.includes('/login')) {
        ElMessage.error('网络连接失败，请检查网络')
      }
    } else {
      // 其他错误
      // 登录API的错误由useAuth.ts单独处理，避免重复提示
      if (!error.config.url?.includes('/login')) {
        ElMessage.error('请求发生未知错误')
      }
    }

    return Promise.reject(error)
  },
)

export default service
