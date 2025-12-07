<template>
  <div class="main-layout">
    <div class="layout-wrapper">
      <!-- 侧边栏部分 -->
      <aside class="layout-sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <SidebarMenu :title="title" :collapsed="isSidebarCollapsed" />
      </aside>

      <!-- 主内容部分 -->
      <div class="layout-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
        <header class="layout-header">
          <!-- 头部内容 -->
          <HeaderNav :is-sidebar-collapsed="isSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
        </header>
        <div class="layout-container">
          <main class="layout-main">
            <RouterView />
          </main>
        </div>
      </div>

      <!-- 固定底部 -->
      <footer class="layout-footer">
        <!-- 底部内容 -->
        <div class="footer-content">
          <span>© 2025 DNSM域名解析管理系统. All rights reserved.</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderNav from './components/HeaderNav.vue'
import SidebarMenu from './components/SidebarMenu.vue'
import { RouterView } from 'vue-router'

const title = ref('DNSM域名解析管理系统')
const isSidebarCollapsed = ref(true)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
}

.layout-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.layout-sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
  height: 100vh; /* 修改为完整视口高度 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.layout-sidebar.collapsed {
  width: 64px;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 200px;
  height: 100vh; /* 修改为完整视口高度 */
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.layout-content.sidebar-collapsed {
  margin-left: 64px;
}

.layout-container {
  flex: 1;
  overflow: hidden;
}

.layout-main {
  min-height: calc(100vh - 60px); /* 使用最小高度而非固定高度 */
  padding: 20px;
  overflow-x: hidden; /* 隐藏水平溢出，让内容组件自己处理 */
  overflow-y: auto;
  background-color: #f5f7fa;
  box-sizing: border-box;
  position: relative;
}

.layout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 1002; /* 提高z-index确保在侧边栏上方 */
  background-color: transparent;
  border-top: none;
}

/* 调整侧边栏和内容区域的高度以适应完整视口 */
.layout-sidebar,
.layout-content {
  height: 100vh;
}

/* 确保侧边栏内容可以撑满整个高度 */
.layout-sidebar :deep(.sidebar-menu) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .layout-sidebar {
    width: 64px;
    height: 100vh;
  }

  .layout-sidebar.collapsed {
    width: 0;
    overflow: hidden;
  }

  .layout-content {
    margin-left: 64px;
    height: 100vh;
  }

  .layout-content.sidebar-collapsed {
    margin-left: 0;
  }

  .layout-main {
    padding: 12px;
    min-height: calc(100vh - 60px);
    overflow-x: hidden;
  }
}
</style>
