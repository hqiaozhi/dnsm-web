import { type UserInfo } from '@/types/user'
// 本地存储工具类

const TOKEN_KEY = 'health_platform_token'
const USER_INFO_KEY = 'health_platform_user_info'
const REMEMBERED_LOGIN_KEY = 'health_platform_remembered_login'

// 存储token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

// 获取token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// 清除token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 存储用户信息

export function setUserInfo(userInfo: UserInfo): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

// 获取用户信息
export function getUserInfo(): UserInfo | null {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

// 清除用户信息
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY)
}

// 存储记住的登录信息
export function setRememberedLogin(username: string, password: string): void {
  localStorage.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify({ username, password }))
}

// 获取记住的登录信息
export function getRememberedLogin(): { username: string; password: string } | null {
  const data = localStorage.getItem(REMEMBERED_LOGIN_KEY)
  return data ? JSON.parse(data) : null
}

// 删除记住的登录信息
export function removeRememberedLogin(): void {
  localStorage.removeItem(REMEMBERED_LOGIN_KEY)
}

// 清除所有认证相关数据
export function clearAuthData(): void {
  removeToken()
  removeUserInfo()
  removeRememberedLogin()
}
