<template>
  <div class="record-list-container">
    <el-card class="mb-4 custom-card">
      
      
      <!-- 工具栏 -->
      <div class="toolbar mb-4">
        <el-input v-model="searchQuery" placeholder="搜索记录" clearable prefix-icon="Search" />
        <el-select v-model="recordTypeFilter" placeholder="筛选记录类型" clearable>
          <el-option label="A" value="A"></el-option>
          <el-option label="CNAME" value="CNAME"></el-option>
          <el-option label="MX" value="MX"></el-option>
          <el-option label="TXT" value="TXT"></el-option>
        </el-select>
        <el-button type="primary" @click="fetchRecords">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleAddRecord">添加记录</el-button>
      </div>
      
      <!-- 记录列表表格 -->
      <el-table 
        :data="filteredRecordList" 
        style="width: 100%"
        row-key="id"
        stripe
        border
      >
        <el-table-column prop="name" label="记录名称" min-width="200">
          <template #default="{ row }">
            <div @click="handleCopyRecordName(row.name)">{{ row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="记录类型" width="200" />
        <el-table-column prop="value" label="记录值" min-width="200" />
        <el-table-column prop="ttl" label="TTL" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditRecord(row)">编辑</el-button>
            <el-button type="danger" link @click.stop="handleDeleteRecord(row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination" v-if="totalRecords > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRecords"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getDNSRecords, deleteDNSRecord } from '@/api/dns'
import { copyToClipboard } from '@/utils/clipboard'
import type { DNSRecord, DNSRecordAPI } from '@/types/dns'

// 定义属性
const props = defineProps<{
  domainName?: string
}>()

// 定义事件
const emit = defineEmits<{
  'back': []
  'edit-record': [record: DNSRecord]
  'add-record': []
}>()

// 状态定义
const recordList = ref<DNSRecord[]>([])
const searchQuery = ref('')
const recordTypeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const filteredRecordList = computed(() => {
  let filtered = recordList.value
  
  // 按名称搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(record => 
      (record.name || '').toLowerCase().includes(query) || 
      (record.value || '').toLowerCase().includes(query)
    )
  }
  
  // 按类型过滤
  if (recordTypeFilter.value) {
    filtered = filtered.filter(record => record.type === recordTypeFilter.value)
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 总记录数
const totalRecords = computed(() => {
  let filtered = recordList.value
  
  // 按名称搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(record => 
      (record.name || '').toLowerCase().includes(query) || 
      (record.value || '').toLowerCase().includes(query)
    )
  }
  
  // 按类型过滤
  if (recordTypeFilter.value) {
    filtered = filtered.filter(record => record.type === recordTypeFilter.value)
  }
  
  return filtered.length
})

// 监听域名变化，自动加载记录
watch(() => props.domainName, (newDomainName) => {
  if (newDomainName) {
    fetchRecords()
  }
})

// 初始化时加载记录
onMounted(() => {
  if (props.domainName) {
    fetchRecords()
  }
})

// 生成唯一ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取记录列表
async function fetchRecords() {
  if (!props.domainName) return
  
  try {
    const response = await getDNSRecords(props.domainName)
    // 从response.data.items获取记录列表并将大写字段名转换为小写，同时为每条记录生成唯一ID
    if (response && response.data && Array.isArray(response.data.items)) {
      recordList.value = response.data.items.map((item: DNSRecordAPI) => ({
        id: generateUniqueId(),
        name: item.Name || '',
        type: item.Type || '',
        value: item.Value || '',
        ttl: item.TTL || 300
      }))
    } else {
      recordList.value = []
    }
    // 重置分页
    currentPage.value = 1
  } catch {
    ElMessage.error('获取记录列表失败')
  }
}



// 处理添加记录
function handleAddRecord() {
  // 通知父组件打开添加记录对话框
  emit('add-record')
}

// 处理编辑记录
function handleEditRecord(record: DNSRecord) {
  emit('edit-record', record)
}

// 处理删除记录
async function handleDeleteRecord(recordName: string) {
  if (!props.domainName) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除记录 ${recordName} 吗？此操作无法撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteDNSRecord(props.domainName, recordName)
    ElMessage.success('删除成功')
    
    // 使用局部更新而非全局刷新
    const index = recordList.value.findIndex(record => record.name === recordName)
    if (index !== -1) {
      recordList.value.splice(index, 1)
    }
  } catch (error) {
    // 如果是用户取消操作，则不显示错误消息
    if (!(typeof error === 'string' && error === 'cancel')) {
      ElMessage.error('记录删除失败')
    }
  }
}

// 局部添加记录
function addRecordLocally(record: DNSRecord) {
  // 确保记录有唯一ID
  const newRecord = {
    ...record,
    id: record.id || generateUniqueId()
  }
  recordList.value.push(newRecord)
}

// 局部更新记录
function updateRecordLocally(oldRecordName: string, updatedRecord: DNSRecord) {
  const index = recordList.value.findIndex(record => record.name === oldRecordName)
  if (index !== -1 && recordList.value[index]) {
    recordList.value[index] = {
      ...updatedRecord,
      id: recordList.value[index].id // 保留原有的ID
    }
  }
}

// 导出方法，供父组件调用
defineExpose({
  fetchRecords,
  addRecordLocally,
  updateRecordLocally
})

// 处理复制记录名称
async function handleCopyRecordName(recordName: string) {
  const success = await copyToClipboard(recordName)
  if (success) {
    ElMessage.success('已复制')
  } else {
    ElMessage.error('复制失败')
  }
}

// 分页处理
function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
}

function handleCurrentChange(newPage: number) {
  currentPage.value = newPage
}
</script>

<style scoped>
/* 外层容器，确保内容可以延伸到最右侧 */
.record-list-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  box-sizing: border-box;
}

:deep(.el-input) {
  width: 250px;
  flex-shrink: 1;
  box-sizing: border-box;
}

:deep(.el-select) {
  width: 150px;
  flex-shrink: 1;
  box-sizing: border-box;
}

/* 调整卡片的内边距，使其更紧凑 */
:deep(.custom-card .el-card__body) {
  padding: 16px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 自定义卡片样式，改进视觉效果 */
.custom-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.custom-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.custom-card .el-card__header) {
  border-bottom: 1px solid #e4e7ed;
  padding: 16px;
  background-color: #fafafa;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 优化表格样式 */
:deep(.el-table) {
  width: 100% !important;
  border-radius: 4px;
  overflow: hidden;
  margin: 0;
  display: table;
  box-sizing: border-box;
}

/* 确保表格容器也能延伸到最右侧 */
:deep(.el-table__inner-wrapper) {
  width: 100% !important;
  overflow: hidden;
  box-sizing: border-box;
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  width: 100% !important;
  overflow: visible;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
  box-sizing: border-box;
}

:deep(.el-table td, .el-table th.is-leaf) {
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
}

/* 表格行悬停效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 优化单元格的间距 */
:deep(.el-table__cell) {
  padding: 12px;
  box-sizing: border-box;
}

/* 确保操作列正确显示 */
:deep(.el-table__fixed-right) {
  height: auto !important;
  bottom: 0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }
  
  :deep(.el-input),
  :deep(.el-select) {
    width: 100%;
  }
}
</style>