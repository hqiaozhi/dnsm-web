<template>
  <div class="user-menu">
    <DropdownMenu
      :items="userMenuItems"
      button-type="text"
      button-size="default"
      placement="bottom-end"
      trigger="click"
      v-model:visible="dropdownVisible"
      @command="handleUserMenuCommand"
    >
      <template #default>
        <div class="user-info">
          <el-icon :size="20">
            <User />
          </el-icon>
          <el-icon :size="16" class="arrow-icon" :class="{ 'is-open': dropdownVisible }">
            <ArrowDown />
          </el-icon>
        </div>
      </template>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import DropdownMenu from '@/components/common/DropdownMenu.vue'
import { User, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// 路由和用户状态
const dropdownVisible = ref(false)

const { logout } = useAuth()

// 用户菜单项
const userMenuItems = computed(() => [{ key: 'logout', label: '退出登录', icon: 'SwitchButton' }])

// 处理用户菜单命令
const handleUserMenuCommand = (command: string | number) => {
  // 将数字类型转换为字符串类型以统一处理
  const commandStr = typeof command === 'number' ? command.toString() : command

  switch (commandStr) {
    case 'logout':
      ElMessage.success('退出成功')
      // 延时
      setTimeout(() => {
        handleLogout()
      }, 1000)

      break
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await logout()
  } catch {
    ElMessage.error('退出失败')
  }
}
</script>

<style scoped lang="scss">
.user-menu {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;

  .arrow-icon {
    margin-left: 4px;
    transition: transform 0.3s ease;
  }

  .arrow-icon.is-open {
    transform: rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-menu {
    .username {
      display: none;
    }
  }
}
</style>
