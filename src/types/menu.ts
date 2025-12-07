// 定义菜单项类型
export interface MenuItem {
  index: string
  title: string
  icon?: string
  children?: MenuItem[]
  route?: string
  permission?: string
}

// 定义组件属性
export interface Props {
  title?: string
  logo?: string
  menuItems?: MenuItem[]
  uniqueOpened?: boolean
  enableRouter?: boolean
  // 添加collapsed属性用于接收父组件传入的折叠状态
  collapsed?: boolean
}
