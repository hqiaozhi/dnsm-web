<template>
  <div class="dropdown-menu">
    <el-dropdown
      :type="type"
      :trigger="trigger"
      :placement="placement"
      :show-timeout="showTimeout"
      :hide-timeout="hideTimeout"
      :visible="visible"
      @command="handleCommand"
      @visible-change="handleVisibleChange"
    >
      <!-- 下拉触发器 -->
      <template #dropdown>
        <el-dropdown-menu>
          <template v-for="(item, index) in items" :key="item.key || index">
            <!-- 移除分隔线 -->
            <!-- 菜单项 -->
            <el-dropdown-item
              :command="item.key"
              :disabled="item.disabled"
              :icon="item.icon"
              class="centered-dropdown-item"
            >
              <template v-if="item.template">
                <component :is="item.template" :item="item" />
              </template>
              <template v-else>
                {{ item.label }}
              </template>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>

      <!-- 下拉按钮或自定义触发器 -->
      <template v-if="$slots.default">
        <slot></slot>
      </template>
      <template v-else>
        <el-button
          :type="buttonType"
          :size="buttonSize"
          :icon="buttonIcon"
          :loading="loading"
          :disabled="disabled"
        >
          {{ buttonText || '下拉菜单' }}
          <template #suffix v-if="!buttonIcon">
            <el-icon>
              <arrow-down />
            </el-icon>
          </template>
        </el-button>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
// 修复导入语句，使用正确的 Element Plus 组件名称
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElIcon } from 'element-plus'

// 定义普通菜单项类型
interface DropdownMenuItem {
  key?: string | number
  label: string
  disabled?: boolean
  divider?: false
  icon?: string
  template?: string
  [key: string]: string | number | boolean | undefined
}

// 定义分隔线项类型
interface DropdownMenuDivider {
  divider: true
  key?: string | number
  label?: string
  disabled?: boolean
  icon?: string
  template?: string
  [key: string]: string | number | boolean | undefined
}

// 联合类型
type DropdownItem = DropdownMenuItem | DropdownMenuDivider

// 组件属性定义
interface Props {
  type?: 'default' | 'text' | 'primary'
  trigger?: 'hover' | 'click' | 'contextmenu'
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'
  showTimeout?: number
  hideTimeout?: number
  items?: DropdownItem[]
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  buttonSize?: 'large' | 'default' | 'small'
  buttonText?: string
  buttonIcon?: string
  loading?: boolean
  disabled?: boolean
  // 控制下拉菜单显隐
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  trigger: 'hover',
  placement: 'bottom',
  showTimeout: 250,
  hideTimeout: 150,
  items: () => [],
  buttonType: 'primary',
  buttonSize: 'default',
  buttonText: '',
  buttonIcon: '',
  loading: false,
  disabled: false,
  modelValue: undefined,
})

// 使用 void 操作符消除未使用变量警告
void props

// 组件事件定义
const emit = defineEmits<{
  command: [command: string | number]
  'visible-change': [visible: boolean]
  'update:modelValue': [visible: boolean]
}>()

// 控制下拉菜单显隐状态
const visible = ref(false)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined) {
      visible.value = newValue
    }
  },
  { immediate: true },
)

// 处理命令
const handleCommand = (command: string | number) => {
  // 如果是 click 触发模式，则在选择后隐藏菜单
  if (props.trigger === 'click') {
    visible.value = false
    emit('update:modelValue', false)
  }
  emit('command', command)
}

// 处理可见性变化
const handleVisibleChange = (newVisible: boolean) => {
  visible.value = newVisible
  emit('update:modelValue', newVisible)
  emit('visible-change', newVisible)
}
</script>

<style scoped>
.dropdown-menu {
  display: inline-block;
}

/* 自定义下拉菜单样式 - 更强力的居中方法 */
:deep(.el-dropdown-menu__item) {
  transition: all 0.2s ease;
  text-align: center !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 8px 20px !important;
  width: 100% !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-dropdown-menu__item > *) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 特别处理图标和文字的布局 */
:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

:deep(.el-dropdown-menu__item .el-dropdown-menu__item__content) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;
}

/* 隐藏分隔线 */
.dropdown-divider {
  display: none;
}

/* 为居中的菜单项添加额外样式 */
.centered-dropdown-item {
  text-align: center !important;
  justify-content: center !important;
  display: flex !important;
  width: 100% !important;
}
</style>
