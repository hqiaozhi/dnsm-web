<template>
  <div class="tab-nav">
    <el-tabs
      v-model="activeTab"
      type="card"
      :closable="closable"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane v-for="tab in tabs" :key="tab.key" :label="tab.label" :name="tab.key">
        <!-- 这里可以放标签页内容，或者通过slot自定义 -->
        <slot name="tab-content" :tab="tab">
          {{ tab.content || `这是${tab.label}标签页的内容` }}
        </slot>
      </el-tab-pane>
      <!-- 可通过默认slot添加额外的标签页 -->
      <slot></slot>
    </el-tabs>

    <!-- 可选择添加操作按钮区域 -->
    <div class="tab-actions" v-if="showActions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TabsPaneContext } from 'element-plus'

// 定义标签页类型
interface Tab {
  key: string
  label: string
  content?: string
  closable?: boolean
}

// 组件属性定义
interface Props {
  modelValue?: string
  tabs?: Tab[]
  closable?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  tabs: () => [],
  closable: true,
  showActions: false,
})

// 组件事件定义
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-click': [tab: Tab]
  'tab-remove': [key: string]
}>()

// 活动标签
const activeTab = ref(
  props.modelValue ||
    (props.tabs && props.tabs.length > 0 && props.tabs[0] ? props.tabs[0].key : ''),
)

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal !== activeTab.value) {
      activeTab.value = newVal
    }
  },
)

// 监听activeTab变化，通知父组件
watch(activeTab, (newVal) => {
  emit('update:modelValue', newVal)
})

// 处理标签点击
const handleTabClick = (tab: TabsPaneContext, event?: Event) => {
  const clickedTab = props.tabs && props.tabs.find((t) => t.key === tab.props.name)
  if (clickedTab) {
    emit('tab-click', clickedTab)
  }
  // 防止 event unused warning
  if (event) {
    // noop
  }
}

// 处理标签移除
const handleTabRemove = (key: string | number) => {
  emit('tab-remove', String(key))

  // 如果移除的是当前激活的标签，切换到其他标签
  const keyStr = String(key)
  if (keyStr === activeTab.value && props.tabs && props.tabs.length > 0) {
    const remainingTabs = props.tabs.filter((t) => t.key !== keyStr)
    if (remainingTabs.length > 0 && remainingTabs[0]) {
      activeTab.value = remainingTabs[0].key
    }
  }
}
</script>

<style scoped>
.tab-nav {
  width: 100%;
}

.tab-actions {
  margin-top: 16px;
  padding: 8px 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #ebeef5;
}
</style>
