<template>
  <div class="dns-container">
    <!-- 域名列表组件 -->
    <DomainList 
      @view-records="handleViewRecords"
      @create-domain="handleCreateDomain"
      ref="domainListRef"
    />
    
    <!-- 记录列表组件，以弹窗形式展示 -->
    <el-dialog
      v-model="recordDialogVisible"
      width="90%"
      :before-close="handleBackToList"
    >
      <RecordList 
        v-if="currentDomain"
        :domain-name="currentDomain"
        @back="handleBackToList"
        @add-record="handleAddRecord"
        @edit-record="handleEditRecord"
        ref="recordListRef"
      />
    </el-dialog>
    
    <!-- 域名编辑对话框 -->
    <DomainDialog 
      ref="domainDialogRef"
      @domain-created="handleDomainCreated"
      @domain-updated="handleDomainUpdated"
    />
    
    <!-- 记录编辑对话框 -->
    <RecordDialog 
      ref="recordDialogRef"
      :domain-name="currentDomain"
      @record-created="handleRecordCreated"
      @record-updated="handleRecordUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { ElMessage } from 'element-plus'
import DomainList from './components/DomainList.vue'
import RecordList from './components/RecordList.vue'
import DomainDialog from './components/DomainDialog.vue'
import RecordDialog from './components/RecordDialog.vue'
import type { DNSRecord } from '@/types/dns'

// 状态管理
const currentDomain = ref<string>('')
const recordDialogVisible = ref<boolean>(false)
const domainDialogRef = ref<InstanceType<typeof DomainDialog>>()
const recordDialogRef = ref<InstanceType<typeof RecordDialog>>()
const recordListRef = ref<InstanceType<typeof RecordList> | null>(null)
// 定义DomainList组件的类型
interface DomainListInstance {
  fetchDomainList: () => Promise<void>
  currentPage: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
}

const domainListRef = ref<DomainListInstance>()

// 事件处理函数

// 处理创建域名
function handleCreateDomain() {
  domainDialogRef.value?.openCreateDialog()
}

// 处理查看记录
function handleViewRecords(domainName: string) {
  currentDomain.value = domainName
  recordDialogVisible.value = true
}

// 处理返回域名列表
function handleBackToList() {
  recordDialogVisible.value = false
  // 延迟清空当前域名，确保弹窗关闭动画完成
  setTimeout(() => {
    currentDomain.value = ''
  }, 300)
}

// 处理刷新域名列表的函数已移除，不再需要全局刷新

// 处理域名创建成功
function handleDomainCreated() {
  ElMessage.success('创建成功')
  // 创建新域名后重置到第一页并刷新列表
  if (domainListRef.value) {
    // 直接调用刷新方法，内部会处理分页重置
    domainListRef.value.fetchDomainList() // 刷新列表
  }
}

// 处理域名更新成功
function handleDomainUpdated() {
  ElMessage.success('更新成功')
  // 刷新域名列表的逻辑将在DomainList组件中处理
}

// 处理添加记录
function handleAddRecord() {
  recordDialogRef.value?.openCreateDialog()
}

// 处理编辑记录
function handleEditRecord(record: DNSRecord) {
  recordDialogRef.value?.openEditDialog(record)
}

// 处理记录创建成功
function handleRecordCreated(record: DNSRecord) {
  ElMessage.success('创建成功')
  // 调用RecordList组件的局部添加方法
  recordListRef.value?.addRecordLocally(record)
}

// 处理记录更新成功
function handleRecordUpdated(oldRecordName: string, updatedRecord: DNSRecord) {
  ElMessage.success('更新成功')
  // 调用RecordList组件的局部更新方法
  recordListRef.value?.updateRecordLocally(oldRecordName, updatedRecord)
}
</script>


<style scoped>
.dns-container {
  padding: 0; /* 移除固定padding，让内容完全填充可用空间 */
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  min-width: 0; /* 确保可以收缩到最小宽度 */
  transition: width 0.3s ease, padding 0.3s ease; /* 添加过渡效果 */
}

/* 确保在侧边栏伸缩时的响应式布局 */
:deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
}

:deep(.el-dialog__wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 全局样式重置，确保没有额外的边距或填充影响布局 */
* {
  box-sizing: inherit;
}
</style>