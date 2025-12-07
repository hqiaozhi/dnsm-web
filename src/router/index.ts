import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Login/LoginPage.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/logout',
    name: 'Logout',
    redirect: '/',
    meta: { title: '退出登录', hidden: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { title: '管理员首页' },
    children: [
      {
        path: 'dns',
        name: 'DNS',
        component: () => import('@/views/DNS/DNSManagement.vue'),
        meta: { title: '域名列表' },
      },
    ],
  },

  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Error/403Page.vue'),
    meta: { title: '无权限', hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Error/404Page.vue'),
    meta: { title: '页面不存在', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 注册路由守卫
setupRouterGuards(router)

export default router
