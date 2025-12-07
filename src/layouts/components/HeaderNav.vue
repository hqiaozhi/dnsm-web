<template>
  <div class="header-nav">
    <!-- 左侧区域 - 菜单控制按钮和Logo -->
    <div class="header-left">
      <!-- 菜单展开/收缩按钮 -->
      <div class="menu-toggle" @click="toggleSidebar">
        <el-icon>
          <Expand v-if="isSidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </div>
      <div class="logo" @click="goHome">
        <img v-if="logo" :src="logo" alt="Logo" class="logo-img" />
      </div>
    </div>

    <!-- 中间区域 - 导航菜单（可选） -->
    <div class="header-center">
      <slot name="navigation"></slot>
    </div>

    <!-- 右侧区域 - 用户信息和操作 -->
    <div class="header-right">
      <slot name="actions">
        <!-- 全屏切换 -->
        <el-tooltip content="全屏" placement="bottom">
          <el-button class="icon-button" link @click="toggleFullscreen">
            <el-icon :size="18">
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
          </el-button>
        </el-tooltip>

        <!-- 用户菜单组件 -->
        <UserMenu />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserMenu from '@/components/common/UserMenu.vue'
import { FullScreen, Aim, Fold, Expand } from '@element-plus/icons-vue'

// 定义组件属性
interface Props {
  logo?: string
  isSidebarCollapsed?: boolean
}

// 使用withDefaults定义默认值，但不创建props变量
withDefaults(defineProps<Props>(), {
  logo: '',
  isSidebarCollapsed: false,
})

// 定义事件
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

// 路由和用户状态
const router = useRouter()

// 全屏状态
const isFullscreen = ref(false)

// 回到首页
const goHome = () => {
  router.push('/home')
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>

<style scoped lang="scss">
.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  // z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;

    .menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      margin-right: 10px;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;

      .logo-img {
        height: 32px;
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .icon-button {
      color: #606266;

      &:hover {
        color: #409eff;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-nav {
    padding: 0 12px;

    .header-right {
      gap: 12px;
    }
  }
}
</style>
