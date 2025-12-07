export interface UserLoginData {
  username: string
  password: string
  rememberMe?: boolean
}

export interface UserInfo {
  id: number
  username: string
}

export interface UserState {
  token: string | null // Token 字符串
  userInfo: UserInfo | null // 用户信息（如用户名、权限角色等）
}
