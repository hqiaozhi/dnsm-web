import { type Router, type RouteLocationNormalized } from 'vue-router'
import { logoutAPI } from '@/api/user'
import { useUserStore } from '@/stores/user'

// 全局前置守卫
export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, from, next) => {
    // 设置页面标题
    document.title = `${to.meta.title || 'DNSM域名解析管理系统'}`

    const userStore = useUserStore()
    const isLoggedIn = !!userStore.token

    // 处理退出登录
    if (to.path === '/logout') {
      userStore.logout()
      await logoutAPI()
      next('/')
      return
    }

    // 不需要登录的页面（包括登录页本身）
    if (to.path === '/' || to.meta.hidden) {
      next()
      return
    }

    // 需要登录但未登录
    if (!isLoggedIn) {
      next('/')
      return
    }

    // 已登录，继续访问
    next()
  })

  // 全局后置守卫
  router.afterEach(() => {})
}

