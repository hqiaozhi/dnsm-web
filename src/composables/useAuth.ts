import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { loginAPI, logoutAPI } from '@/api/user'

export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await loginAPI({ username, password })
      userStore.setUserInfo(response.data)
      ElMessage.success('登录成功')
      router.push('/home')
      return response
    } catch (error) {
      ElMessage.error({
        message: '登录失败，请检查用户名和密码',
        duration: 1000
      })
      throw error
    }
  }

  // 登出
  const logout = async () => {
    await logoutAPI()
    userStore.logout()
    router.push('/')
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!userStore.token
  }

  return {
    login,
    logout,
    isLoggedIn,
  }
}
