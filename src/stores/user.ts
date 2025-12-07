import { defineStore } from 'pinia'
import { type UserInfo, type UserState } from '@/types/user'
import { getToken, setToken, removeToken } from '@/utils/storage' // 导入storage工具

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || null, // 使用storage工具获取token
    userInfo: (() => {
      try {
        const storedUserInfo = localStorage.getItem('health_platform_user_info')
        // 检查是否为null或'undefined'字符串
        return storedUserInfo && storedUserInfo !== 'undefined' ? JSON.parse(storedUserInfo) : null
      } catch {
        // 处理JSON解析错误
        return null
      }
    })(),
  }),
  actions: {
    // 登录：保存 Token 和用户信息
    setUserInfo(data: { token: string; userInfo: UserInfo }) {
      this.token = data.token
      this.userInfo = data.userInfo
      // 使用storage工具持久化到本地存储
      setToken(data.token)
      localStorage.setItem('health_platform_user_info', JSON.stringify(data.userInfo))
    },
    // 退出登录：清除 Token 和用户信息
    logout() {
      this.token = null
      this.userInfo = null
      // 使用storage工具清除本地存储
      removeToken()
      localStorage.removeItem('health_platform_user_info')
    },
  },
})
