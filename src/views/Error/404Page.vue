<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-content">
        <div class="error-number">404</div>
        <div class="error-title">页面未找到</div>
        <div class="error-description">抱歉，您访问的页面不存在或已被移除</div>
        <div class="error-actions">
          <el-button type="primary" @click="goHome" size="large"> 返回首页 </el-button>
          <el-button @click="goBack" size="large"> 返回上一页 </el-button>
        </div>
      </div>
      <div class="error-image">
        <svg viewBox="0 0 24 24" width="200" height="200" fill="currentColor" class="error-icon">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'

const router = useRouter()

const goHome = () => router.push('/admin')
const goBack = () => router.go(-1)
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 60px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 900px;
  width: 100%;
}

.error-content {
  flex: 1;
  text-align: center;
}

.error-number {
  font-size: 120px;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 20px;
  line-height: 1;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.error-description {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.error-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-icon {
  color: #667eea;
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-container {
    flex-direction: column;
    gap: 30px;
    padding: 40px 20px;
  }

  .error-number {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 16px;
  }

  .error-actions {
    flex-direction: column;
    gap: 15px;
  }

  .error-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
