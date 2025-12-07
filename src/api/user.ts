import request from './request'

// 用户登录
export const loginAPI = (data: { username: string; password: string }) => {
  return request({
    url: '/api/v1/user/login',
    method: 'post',
    data,
  })
}

// 登出
export const logoutAPI = () => {
  return request({
    url: '/api/v1/user/logout',
    method: 'post',
  })
}
