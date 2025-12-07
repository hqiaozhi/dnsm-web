<template>
  <div class="domain-list-container">
    <el-card class="custom-card">
      
      
      <!-- 工具栏 -->
      <div class="toolbar mb-4">
        <el-input v-model="searchQuery" placeholder="搜索域名" clearable prefix-icon="Search" />
        <el-button type="primary" @click="fetchDomainList">
          <el-icon><Refresh /></el-icon>
            刷新
        </el-button>
        <el-button type="primary" @click="handleCreateDomain">创建域名</el-button>
      </div>
      
      <!-- 域名列表表格 - 响应式宽度处理 -->
      <div class="table-wrapper">
        <el-table 
          :data="filteredDomainList" 
          style="width: 100%; height: auto;"
          row-key="name"
          stripe
          border
          v-loading="loading"
          empty-text="暂无域名数据"
          class="auto-height-table responsive-table"
        >
        <el-table-column prop="name" label="域名名称" min-width="150" max-width="400" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="domain-name-cell" @click="handleCopyDomainName(row.name)">
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="recordCount" label="记录数量" width="120" align="center">
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewRecords(row.name)">查看记录</el-button>
            <el-button type="danger" link @click.stop="handleDeleteDomain(row.name)">删除</el-button>
          </template>
        </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页组件 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage as ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getDNSDomainPageList, deleteDNSDomain } from '@/api/dns'
import { copyToClipboard } from '@/utils/clipboard'
import type { DNSDomainListItem } from '@/types/dns'

// 定义事件
const emit = defineEmits<{
  'view-records': [domainName: string]
  'refresh-domains': []
  'create-domain': []
}>()

// 状态定义
const domainList = ref<DNSDomainListItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const loading = ref(false)

// 计算过滤后的域名列表
const filteredDomainList = computed(() => {
  if (!searchQuery.value) return domainList.value
  
  const query = searchQuery.value.toLowerCase()
  return domainList.value.filter(domain => 
    domain.name.toLowerCase().includes(query)
  )
})

// 初始化
onMounted(() => {
  fetchDomainList()
})

// 获取域名列表
async function fetchDomainList() {
  loading.value = true
  try {
    const response = await getDNSDomainPageList(currentPage.value, pageSize.value)
    
    // 从response.data获取域名列表和总数
    const domains = response.data?.domains || []
    total.value = response.data?.total || 0
    
    // 适配数据格式，确保recordCount正确映射
    domainList.value = domains.map((domain: { name: string; record_count: number }) => ({
      name: domain.name,
      record_count: domain.record_count,
      recordCount: domain.record_count // 保持向后兼容
    }))
    
    // 按域名名称字母顺序排序（升序）
    domainList.value.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    })
    // ElMessage.success('刷新成功') // 避免频繁提示
    // 使用局部更新而非全局刷新
  } catch {
    ElMessage.error('获取域名列表失败')
  } finally {
    loading.value = false
  }
}

// 处理创建域名
function handleCreateDomain() {
  // 通知父组件打开创建域名对话框
  emit('create-domain')
}

// 处理查看记录
function handleViewRecords(domainName: string) {
  emit('view-records', domainName)
}

// 处理删除域名
async function handleDeleteDomain(domainName: string) {
  try {
    await ElMessageBox.confirm(
      `确定要删除域名 ${domainName} 吗？此操作无法撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteDNSDomain(domainName)
    ElMessage.success('删除成功')
    
    // 删除后重新计算总数并更新当前页
    total.value--
    
    // 如果当前页没有数据了，回退到上一页
    if (domainList.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    
    // 重新获取域名列表
    fetchDomainList()
  } catch (error) {
    // 如果是用户取消操作，则不显示错误消息
    if (error !== 'cancel') {
      ElMessage.error('域名删除失败')
    }
  }
}

// 处理复制域名名称
async function handleCopyDomainName(domainName: string) {
  const success = await copyToClipboard(domainName)
  if (success) {
    ElMessage.success('已复制')
  } else {
    ElMessage.error('复制失败')
  }
}

// 处理页码变化
function handlePageChange(page: number) {
  currentPage.value = page
  fetchDomainList()
}

// 处理每页条数变化
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  fetchDomainList()
}

// 导出方法和属性供父组件调用
defineExpose({
  fetchDomainList,
  currentPage,
  pageSize,
  total
})
</script>

<style scoped>
/* 外层容器，确保内容可以延伸到最右侧 */
.domain-list-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
  height: auto;
  min-width: 0;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
}

:deep(.el-input) {
  max-width: 300px;
  width: 100%;
  flex-shrink: 1;
  min-width: 150px;
}

/* 优化卡片内容区域 */
:deep(.el-card__body) {
  padding: 20px;
  margin: 0;
  overflow: visible;
  min-height: auto;
  height: auto;
}

/* 自定义卡片样式，确保可以自适应侧边栏伸缩 */
.custom-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, width 0.3s ease; /* 添加宽度过渡效果 */
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  display: block;
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

/* 表格包装器，添加水平滚动支持 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
  box-sizing: border-box;
}

/* 优化表格样式 - 增强响应式能力 */
:deep(.el-table) {
  width: 100% !important;
  border-radius: 4px;
  overflow: hidden;
  margin: 0;
  display: table;
  table-layout: fixed;
  height: auto !important;
  min-height: auto;
  position: relative;
  z-index: 1;
  transition: width 0.3s ease;
}

/* 确保表格容器也能延伸到最右侧并处理溢出 */
:deep(.el-table__inner-wrapper) {
  width: 100%;
  overflow-x: visible;
  overflow-y: visible;
  min-height: auto;
  height: auto;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

:deep(.el-table td, .el-table th.is-leaf) {
  border-bottom: 1px solid #ebeef5;
}

/* 表格行悬停效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 优化单元格的间距和溢出处理 */
:deep(.el-table__cell) {
    padding: 12px;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: table-cell;
    box-sizing: border-box;
  }

/* 域名名称单元格特殊处理 */
:deep(.el-table__cell:nth-child(1)) {
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: keep-all;
}
  
  /* 优化自适应高度表格 */
  .auto-height-table {
    height: auto !important;
    min-height: auto;
  }
  
  /* 确保表格body能够完全显示内容 */
  :deep(.el-table__body-wrapper) {
    height: auto !important;
    overflow-y: visible;
  }
  
  /* 优化空数据提示的显示 */
  :deep(.el-table__empty-block) {
    min-height: 100px;
  }

/* 域名名称单元格样式 - 增强响应式能力 */
.domain-name-cell {
  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 响应式表格特定样式 */
.responsive-table :deep(.el-table__header-wrapper),
.responsive-table :deep(.el-table__body-wrapper) {
  overflow-x: visible;
}

/* 增强表格列的响应式调整能力 */
:deep(.el-table__column) {
  overflow: hidden;
}

/* 确保操作列在小屏幕上也能正常显示 */
:deep(.el-table__cell:last-child) {
  min-width: 180px;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  height: auto;
  overflow: visible;
}

/* 确保整个自定义卡片容器能够根据内容自适应高度 */
.custom-card {
  height: auto !important;
  min-height: auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  box-sizing: border-box;
}

/* 确保所有元素都能自适应内容高度 */
:deep(.el-table) {
  flex: none;
  height: auto !important;
}

/* 确保自定义卡片的头部和内容区域能够正确布局 */
:deep(.custom-card .el-card__header),
:deep(.custom-card .el-card__body) {
  flex: none;
}

/* 优化分页组件跳转输入框宽度 */
:deep(.el-pagination__editor) {
  width: 50px !important;
  padding: 0 5px;
  margin: 0 5px;
}

/* 响应式设计 - 针对不同屏幕尺寸优化显示 */
@media (max-width: 1200px) {
  /* 在中等屏幕上调整域名列最大宽度 */
  :deep(.el-table__cell:nth-child(1)) {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  :deep(.el-input) {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .toolbar {
    flex-direction: column;
  }
  
  .pagination-container {
    justify-content: center;
  }
  
  /* 移动端特殊处理表格宽度 */
  :deep(.el-table) {
    width: 100% !important;
    table-layout: fixed;
  }
  
  /* 移动端优化单元格显示 */
  :deep(.el-table__cell) {
    padding: 8px 6px;
    font-size: 14px;
  }
  
  /* 移动设备上域名列更小的最大宽度 */
  :deep(.el-table__cell:nth-child(1)) {
    max-width: 200px;
  }
  
  /* 操作列按钮紧凑排列 */
  :deep(.el-table__cell:last-child .el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .table-wrapper {
    overflow-x: auto;
  }
  
  :deep(.el-table__cell) {
    padding: 6px 4px;
    font-size: 13px;
  }
  
  :deep(.el-table__cell:nth-child(1)) {
    max-width: 150px;
  }
}

/* 侧边栏伸缩时的过渡效果优化 */
:deep(.el-table),
.domain-list-container,
.custom-card {
  transition: width 0.3s ease, min-width 0.3s ease, margin 0.3s ease;
}
</style>