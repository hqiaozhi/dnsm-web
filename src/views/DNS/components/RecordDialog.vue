<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="dialogTitle" 
    width="50%"
    @close="handleClose"
  >
    <el-form 
      :model="recordForm" 
      label-width="100px"
      :rules="rules"
      ref="recordFormRef"
    >
      <el-form-item label="记录名称" prop="name">
        <el-input 
            v-model="recordForm.name" 
            :placeholder="`记录名称，如 www (将生成 www.${domainName})`"
            clearable
            @keyup.enter="handleSubmit"
          >
          <template #append>
            <span class="domain-suffix">.{{ domainName }}</span>
          </template>
        </el-input>
        <div class="helper-text">留空表示直接使用域名</div>
      </el-form-item>
      
      <el-form-item label="记录类型" prop="type">
        <el-select v-model="recordForm.type" placeholder="请选择记录类型">
          <el-option label="A" value="A"></el-option>
          <el-option label="CNAME" value="CNAME"></el-option>
          <el-option label="MX" value="MX"></el-option>
          <el-option label="TXT" value="TXT"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="记录值" prop="value">
        <el-input 
            v-model="recordForm.value" 
            :placeholder="getPlaceholderByType(recordForm.type)"
            :type="recordForm.type === 'TXT' ? 'textarea' : 'text'"
            :rows="recordForm.type === 'TXT' ? 3 : 1"
            clearable
            @keyup.enter="handleSubmit"
          ></el-input>
      </el-form-item>
      
      <el-form-item label="TTL值" prop="ttl">
        <el-input-number 
            v-model="recordForm.ttl" 
            :min="60" 
            :max="86400"
            :step="60"
            placeholder="TTL值(秒)"
            @keyup.enter="handleSubmit"
          >
          <template #append>秒</template>
        </el-input-number>
        <div class="helper-text">建议设置为300-3600秒</div>
      </el-form-item>
      
      <template v-if="recordForm.type === 'MX'">
        <el-form-item label="优先级" prop="priority">
          <el-input-number 
            v-model="recordForm.priority" 
            :min="0" 
            :max="100"
            :step="1"
            placeholder="MX记录优先级"
            @keyup.enter="handleSubmit"
          ></el-input-number>
          <div class="helper-text">数值越小优先级越高</div>
        </el-form-item>
      </template>
    </el-form>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { addDNSRecord, updateDNSRecord } from '@/api/dns'
import type { DNSRecord, CreateDNSRecordParams, UpdateDNSRecordParams } from '@/types/dns'

// 定义属性
interface Props {
  domainName: string
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  'record-created': [record: DNSRecord]
  'record-updated': [oldRecordName: string, updatedRecord: DNSRecord]
}>()

// 组件引用
const recordFormRef = ref<InstanceType<typeof ElForm>>()

// 状态定义
const dialogVisible = ref(false)
const editingRecord = ref<DNSRecord | null>(null)

// 记录表单
const recordForm = reactive({
  name: '',
  type: 'A',
  value: '',
  ttl: 300,
  priority: 10
})

// 表单规则
const rules = reactive<FormRules<DNSRecord>>({
  name: [
    { message: '请输入记录名称', trigger: 'blur' }
    // 记录名称不是必填，允许为空（表示直接使用域名）
  ],
  type: [
    { required: true, message: '请选择记录类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入记录值', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入记录值'))
          return
        }
        
        // 根据不同记录类型验证值格式
        switch (recordForm.type) {
          case 'A':
            if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
              callback(new Error('请输入有效的IPv4地址格式'))
              return
            }
            // 验证IP地址范围
            const parts = value.split('.').map(Number)
            for (const part of parts) {
              if (part < 0 || part > 255) {
                callback(new Error('请输入有效的IPv4地址格式'))
                return
              }
            }
            break
          case 'CNAME':
            if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(value)) {
              callback(new Error('请输入有效的域名格式'))
              return
            }
            break
          case 'MX':
            if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(value)) {
              callback(new Error('请输入有效的邮件服务器地址'))
              return
            }
            break
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ],
  ttl: [
    { required: true, message: '请输入TTL值', trigger: 'blur' },
    { type: 'number', min: 60, message: 'TTL值最小为60秒', trigger: 'blur' },
    { type: 'number', max: 86400, message: 'TTL值最大为86400秒', trigger: 'blur' }
  ],
  priority: [
    { 
      // 移除动态required，通过validator处理条件验证
      message: 'MX记录必须设置优先级', 
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (recordForm.type === 'MX') {
          if (value === undefined || value === null || value === '') {
            callback(new Error('MX记录必须设置优先级'))
            return
          }
          if (value < 0 || value > 100) {
            callback(new Error('优先级必须在0-100之间'))
            return
          }
        }
        callback()
      }
    }
  ]
})

// 监听域名变化，重置表单
watch(() => props.domainName, () => {
  resetForm()
})

// 对话框标题
const dialogTitle = computed(() => {
  return editingRecord.value ? '编辑' : '添加'
})

// 导出方法
const openCreateDialog = () => {
  resetForm()
  editingRecord.value = null
  dialogVisible.value = true
}

const openEditDialog = (record: DNSRecord) => {
  resetForm()
  editingRecord.value = record
  
  // 填充表单数据，从全称中提取记录名
  recordForm.name = extractRecordName(record.name) || ''
  recordForm.type = record.type
  recordForm.value = record.value
  recordForm.ttl = record.ttl
  recordForm.priority = record.priority || 10
  
  dialogVisible.value = true
}

defineExpose({
  openCreateDialog,
  openEditDialog
})

// 生成唯一ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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

// 从全称中提取记录名（去掉域名后缀）
function extractRecordName(fullName: string): string {
  if (!fullName) return ''
  if (fullName === props.domainName) return '@' // 如果是域名本身，返回 @ 符号
  const suffix = `.${props.domainName}`
  if (fullName.endsWith(suffix)) {
    return fullName.slice(0, -suffix.length)
  }
  return fullName
}

// 将记录名转换为全称（添加域名后缀）
function getFullRecordName(recordName: string): string {
  if (!recordName || recordName === '@') return props.domainName // 如果记录名为空或 @，返回域名本身
  return `${recordName}.${props.domainName}`
}

// 重置表单
function resetForm() {
  if (recordFormRef.value) {
    recordFormRef.value.resetFields()
  }
  recordForm.name = ''
  recordForm.type = 'A'
  recordForm.value = ''
  recordForm.ttl = 300
  recordForm.priority = 10
  editingRecord.value = null
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
  if (!recordFormRef.value || !props.domainName) return
  
  try {
    await recordFormRef.value.validate()
    
    // 获取全称记录名
    const fullRecordName = getFullRecordName(recordForm.name)
    
    if (editingRecord.value) {
      // 更新记录
      const updateParams: UpdateDNSRecordParams = {
        name: fullRecordName,
        type: recordForm.type,
        value: recordForm.value,
        ttl: recordForm.ttl
      }
      
      // 只有MX记录需要优先级
      if (recordForm.type === 'MX') {
        updateParams.priority = recordForm.priority
      }
      
      const oldRecordName = editingRecord.value.name
      await updateDNSRecord(props.domainName, oldRecordName, updateParams)
      
      // 构造更新后的记录对象，包含唯一标识符
      const updatedRecord: DNSRecord = {
        id: editingRecord.value.id,
        name: fullRecordName,
        type: recordForm.type,
        value: recordForm.value,
        ttl: recordForm.ttl
      }
      if (recordForm.type === 'MX') {
        updatedRecord.priority = recordForm.priority
      }
      
      emit('record-updated', oldRecordName, updatedRecord)
    } else {
      // 创建记录
      const createParams: CreateDNSRecordParams = {
        name: fullRecordName,
        type: recordForm.type,
        value: recordForm.value,
        ttl: recordForm.ttl
      }
      
      // 只有MX记录需要优先级
      if (recordForm.type === 'MX') {
        createParams.priority = recordForm.priority
      }
      
      await addDNSRecord(props.domainName, createParams)
      
      // 构造新创建的记录对象，包含唯一标识符
      const newRecord: DNSRecord = {
        id: generateUniqueId(),
        name: fullRecordName,
        type: recordForm.type,
        value: recordForm.value,
        ttl: recordForm.ttl
      }
      if (recordForm.type === 'MX') {
        newRecord.priority = recordForm.priority
      }
      
      emit('record-created', newRecord)
    }
    
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
.domain-suffix {
  color: #909399;
  font-size: 14px;
}

.helper-text {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
