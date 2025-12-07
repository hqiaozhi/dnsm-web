<template>
  <div class="sidebar-menu" :class="{ collapsed: collapsed }">
    <!-- 侧边栏头部 (含标题) -->
    <div class="sidebar-header" v-if="!collapsed">
      <div class="logo" v-if="logo">
        <img :src="logo" alt="Logo" class="logo-img" />
      </div>
      <div class="title">{{ title }}</div>
    </div>

    <!-- 菜单列表 -->
    <el-menu
      :default-active="activeIndex"
      :collapse="collapsed"
      :collapse-transition="false"
      :unique-opened="uniqueOpened"
      :router="false"
      class="menu"
    >
      <template v-for="item in filteredMenuItems" :key="item.index">
        <!-- 有子菜单的项 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.index">
          <template #title>
            <el-icon v-if="item.icon">
              <component :is="getIconComponent(item.icon)" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.index"
            :index="child.index"
            @click="handleMenuItemClick(child)"
          >
            <el-icon v-if="child.icon">
              <component :is="getIconComponent(child.icon)" />
            </el-icon>
            <template #title>{{ child.title }}</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单的项 -->
        <el-menu-item v-else :index="item.index" @click="handleMenuItemClick(item)">
          <el-icon v-if="item.icon">
            <component :is="getIconComponent(item.icon)" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { MenuItem, Props } from '@/types/menu'
import {
  Fold,
  Expand,
  HomeFilled,
  User,
  Setting,
  Document,
  DataLine,
  Search,
  Bell,
} from '@element-plus/icons-vue'

const props = withDefaults(defineProps<Props>(), {
  title: 'DNSM域名解析管理系统',
  logo: '',
  menuItems: () => [],
  uniqueOpened: true,
  enableRouter: true,
  collapsed: false, // 默认不折叠
})

// 路由和用户状态
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单项索引，默认设置为域名列表路径
const activeIndex = ref('/admin/dns')

// 监听路由变化，更新激活的菜单项
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
  },
  { immediate: true },
)

// 图标映射
const iconMap = {
  HomeFilled,
  User,
  Setting,
  Document,
  DataLine,
  Fold,
  Expand,
  Search,
  Bell,
}

// 获取图标组件
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null
  return iconMap[iconName as keyof typeof iconMap] || null
}

// 检查用户是否有权限访问菜单项
const hasPermission = (permission?: string): boolean => {
  // 如果没有设置权限要求，则允许访问
  if (!permission) return true

  // 如果用户未登录，则不允许访问需要权限的菜单
  if (!userStore.userInfo) return false

  // 这里可以根据实际需求实现更复杂的权限检查逻辑

  // 其他权限检查逻辑...
  return true
}

// 默认菜单项
const defaultMenuItems = computed<MenuItem[]>(() => [
  {
    index: '/admin/dns', // 修改为与route一致
    title: '域名列表',
    icon: 'HomeFilled',
    route: '/admin/dns',
  }
])

// 合并菜单项并根据权限过滤
const mergedMenuItems = computed(() => {
  return props.menuItems.length > 0 ? props.menuItems : defaultMenuItems.value
})

// 根据用户权限过滤菜单项
const filteredMenuItems = computed(() => {
  const items = mergedMenuItems.value

  // 递归过滤菜单项
  const filterItems = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems.filter((item) => {
      // 检查当前项是否有权限
      if (!hasPermission(item.permission)) {
        return false
      }

      // 如果有子菜单，递归过滤子菜单
      if (item.children && item.children.length > 0) {
        item.children = filterItems(item.children)
      }

      return true
    })
  }

  return filterItems(items)
})

// 处理菜单项点击
const handleMenuItemClick = (item: MenuItem) => {
  // 立即更新激活的菜单项
  activeIndex.value = item.index

  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    // 执行路由跳转
    if (item.route) {
      router.push(item.route)
    }
  })
}
</script>

<style scoped lang="scss">
.sidebar-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
  width: 200px;

  &.collapsed {
    width: 64px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;

    .logo-img {
      height: 32px;
      margin-right: 10px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .menu {
    flex: 1;
    border-right: none;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar-menu {
    width: 64px;

    &.collapsed {
      width: 0;
      overflow: hidden;
    }

    .sidebar-header {
      display: none;
    }
  }
}
</style>
