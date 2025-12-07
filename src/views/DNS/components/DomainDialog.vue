<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="dialogTitle" 
    width="60%"
    @close="handleClose"
  >
    <el-form 
      :model="domainForm" 
      label-width="100px"
      :rules="rules"
      ref="domainFormRef"
    >
      <el-form-item label="域名名称" prop="name">
        <div class="domain-input-container">
          <el-input 
            v-model="domainForm.name" 
            placeholder="请输入顶级域名，如 example.com"
            clearable
            class="short-input"
            @keyup.enter="handleSubmit"
          ></el-input>
          <el-button type="primary" @click="addRecord" class="add-record-btn">添加记录</el-button>
        </div>
      </el-form-item>
      
      <el-form-item label="记录列表" class="records-section right-aligned">
        <div v-if="domainForm.records.length === 0" class="empty-records">
          <el-alert
            title="未添加任何记录"
            type="info"
            show-icon
            description="您可以添加初始记录，或者创建域名后再添加记录"
          />
        </div>
        <div 
          v-for="(record, index) in domainForm.records" 
          :key="record.id || index" 
          class="record-item"
        >
          <el-form-item 
            :prop="`records.${index}.name`" 
            :rules="recordRules.name"
            class="record-name"
          >
            <el-input 
              v-model="record.name" 
              placeholder="记录名称，如 www"
              clearable
              @keyup.enter="handleSubmit"
            ></el-input>
          </el-form-item>
          
          <el-form-item 
            :prop="`records.${index}.type`" 
            :rules="recordRules.type"
            class="record-type"
          >
            <el-select v-model="record.type" placeholder="记录类型">
              <el-option label="A" value="A"></el-option>
              <el-option label="CNAME" value="CNAME"></el-option>
              <el-option label="MX" value="MX"></el-option>
              <el-option label="TXT" value="TXT"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item 
            :prop="`records.${index}.value`" 
            :rules="recordRules.value"
            class="record-value"
          >
            <el-input 
              v-model="record.value" 
              :placeholder="getPlaceholderByType(record.type)"
              clearable
              @keyup.enter="handleSubmit"
            ></el-input>
          </el-form-item>
          
          <el-form-item 
            :prop="`records.${index}.ttl`" 
            :rules="recordRules.ttl"
            class="record-ttl"
          >
            <el-input 
              v-model.number="record.ttl" 
              placeholder="TTL"
              type="number"
              :min="60"
              :max="86400"
              @keyup.enter="handleSubmit"
            ></el-input>
          </el-form-item>
          
          <el-form-item class="record-action">
            <el-button type="danger" @click="removeRecord(index)">删除</el-button>
          </el-form-item>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { createDNSDomain } from '@/api/dns'
import type { DNSRecord, CreateDNSDomainParams } from '@/types/dns'

// 定义事件
const emit = defineEmits<{
  'domain-created': []
  'domain-updated': [domainName: string]
}>()

// 组件引用
const domainFormRef = ref<InstanceType<typeof ElForm>>()

// 状态定义
const dialogVisible = ref(false)
const editingDomain = ref<string>('')

// 域名表单
const domainForm = reactive<CreateDNSDomainParams>({
  name: '',
  records: []
})

// 表单规则
const rules = reactive<FormRules<CreateDNSDomainParams>>({
  name: [
    { required: true, message: '请输入域名名称', trigger: 'blur' },
    { pattern: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, message: '请输入有效的域名格式', trigger: 'blur' },
    // 验证顶级域名（只允许一个点）
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入域名名称'))
          return
        }
        // 计算域名中点的数量
        const dotCount = (value.match(/\./g) || []).length
        if (dotCount !== 1) {
          callback(new Error('请输入顶级域名，如example.com'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur'
    }
  ]
})

// 记录表单规则
const recordRules = reactive<FormRules<DNSRecord>>({
  name: [
    { required: true, message: '请输入记录名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择记录类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入记录值', trigger: 'blur' }
  ],
  ttl: [
    { required: true, message: '请输入TTL值', trigger: 'blur' },
    { type: 'number', min: 60, message: 'TTL值最小为60秒', trigger: 'blur' },
    { type: 'number', max: 86400, message: 'TTL值最大为86400秒', trigger: 'blur' }
  ]
})

// 对话框标题
const dialogTitle = computed(() => {
  return editingDomain.value ? '编辑' : '创建'
})

// 对外暴露的方法，供父组件调用
const openCreateDialog = () => {
  resetForm()
  editingDomain.value = ''
  dialogVisible.value = true
}

// 导出方法
defineExpose({
  openCreateDialog
})

// 获取记录值的占位符提示
function getPlaceholderByType(type: string): string {
  switch (type) {
    case 'A':
      return 'IPv4地址，如 192.168.1.1'
    case 'CNAME':
      return '目标域名，如 example.com'
    case 'MX':
      return '邮件服务器地址，如 mail.example.com'
    case 'TXT':
      return '文本内容'
    default:
      return '请输入记录值'
  }
}

// 生成唯一ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 添加记录
function addRecord() {
  domainForm.records.push({
    id: generateUniqueId(),
    name: '',
    type: 'A',
    value: '',
    ttl: 300
  })
}

// 移除记录
function removeRecord(index: number) {
  domainForm.records.splice(index, 1)
}

// 重置表单
function resetForm() {
  if (domainFormRef.value) {
    domainFormRef.value.resetFields()
  }
  domainForm.name = ''
  domainForm.records = []
}

// 处理关闭对话框
function handleClose() {
  resetForm()
}

// 处理取消
function handleCancel() {
  resetForm()
  dialogVisible.value = false
}

// 处理提交
async function handleSubmit() {
  if (!domainFormRef.value) return
  
  try {
    await domainFormRef.value.validate()
    
    // 验证每条记录
    let isValid = true
    for (let i = 0; i < domainForm.records.length; i++) {
      const record = domainForm.records[i]
      
      // 确保记录对象存在
      if (!record) {
        ElMessage.error(`第 ${i + 1} 条记录：记录数据不完整`)
        isValid = false
        break
      }
      
      // 验证记录名称
      if (!record.name) {
        ElMessage.error(`第 ${i + 1} 条记录：请输入记录名称`)
        isValid = false
        break
      }
      
      // 验证记录类型
      if (!record.type) {
        ElMessage.error(`第 ${i + 1} 条记录：请选择记录类型`)
        isValid = false
        break
      }
      
      // 验证记录值
      if (!record.value) {
        ElMessage.error(`第 ${i + 1} 条记录：请输入记录值`)
        isValid = false
        break
      }
      
      // 根据不同记录类型验证值格式
      if (record.type === 'A' && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(record.value)) {
        ElMessage.error(`第 ${i + 1} 条记录：请输入有效的IPv4地址格式`)
        isValid = false
        break
      }
    }
    
    if (!isValid) return
    // 准备提交数据：将记录名称与域名组合成完整的记录全称
    const submitData = {
      ...domainForm,
      records: domainForm.records.map(record => {
        // 如果记录名称为@，则直接使用域名，否则组合成完整记录名
        const fullRecordName = record.name === '@' ? domainForm.name : `${record.name}.${domainForm.name}`
        return {
          ...record,
          name: fullRecordName
        }
      })
    }
    // 提交数据
    await createDNSDomain(submitData)
    
    // 触发事件
    emit('domain-created')
    
    // 关闭对话框
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    if (typeof error === 'string' && error !== 'cancel') {
      ElMessage.error('创建失败')
    }
  }
}
</script>

<style scoped>
.domain-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.short-input {
  width: 400px; /* 缩短输入框宽度 */
}

.add-record-btn {
  white-space: nowrap;
}

.records-section {
  margin-top: 20px;
}

.right-aligned .el-form-item__content {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.right-aligned .el-form-item__content > div {
  width: 100%;
}

.record-item {
  display: flex;
  align-items: end;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #fafafa;
}

.record-name {
  flex: 0 0 20%;
  margin-bottom: 0;
}

.record-type {
  flex: 0 0 15%;
  margin-bottom: 0;
}

.record-value {
  flex: 1;
  margin-bottom: 0;
}

.record-ttl {
  flex: 0 0 15%;
  margin-bottom: 0;
}

.record-action {
  flex: 0 0 10%;
  margin-bottom: 0;
  display: flex;
  justify-content: flex-end;
}

.empty-records {
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .domain-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .short-input {
    width: 100%;
  }
  
  .record-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .record-name,
  .record-type,
  .record-value,
  .record-ttl,
  .record-action {
    width: 100%;
  }
  
  .record-action {
    justify-content: flex-start;
    margin-top: 10px;
  }
}
</style>
