<template>
  <div class="login-container">
    <!-- 平台标题 -->
    <div class="platform-title">
      <h1>DNSM域名解析管理系统</h1>
    </div>

    <!-- 登录表单容器 -->
    <div class="login-form-wrapper">
      <h2 class="login-title">用户登录</h2>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <el-link
              type="primary"
              :underline="false"
              @click="handleForgotPassword"
              class="forgot-password-link"
              >忘记密码?</el-link
            >
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { setRememberedLogin, getRememberedLogin, removeRememberedLogin } from '@/utils/storage'
import type { UserLoginData } from '@/types/user'

// 路由
const router = useRouter()

// 登录逻辑
const { login } = useAuth()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive<UserLoginData>({
  username: '',
  password: '',
  rememberMe: false,
})

// 表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' },
  ],
})

// 处理登录
const handleLogin = async () => {
  // 表单验证
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 调用登录方法
    await login(loginForm.username, loginForm.password)

    // 处理记住我
    if (loginForm.rememberMe) {
      setRememberedLogin(loginForm.username, loginForm.password)
    } else {
      removeRememberedLogin()
    }

    // 登录成功后跳转到域名列表页
    router.push('/admin/dns')
  } catch {
    // 登录失败的处理已在useAuth.ts中处理
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能暂未开放')
  // 未来可以实现跳转到忘记密码页面
}

// 页面加载时尝试恢复记住的登录信息
const initForm = () => {
  const rememberedLogin = getRememberedLogin()
  if (rememberedLogin) {
    loginForm.username = rememberedLogin.username
    loginForm.password = rememberedLogin.password
    loginForm.rememberMe = true
  }
}

// 初始化表单
initForm()
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;

  // 添加背景装饰效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
    z-index: 0;
  }
}

.platform-title {
  position: relative;
  z-index: 1;
  margin-bottom: 40px;

  h1 {
    font-size: 36px;
    font-weight: 700;
    color: white;
    text-align: center;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    margin: 0;

    // 添加发光效果
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      text-shadow:
        0 2px 10px rgba(0, 0, 0, 0.3),
        0 0 10px rgba(255, 255, 255, 0.4);
    }
    to {
      text-shadow:
        0 2px 10px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(255, 255, 255, 0.6);
    }
  }
}

.login-form-wrapper {
  position: relative;
  z-index: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(10px);

  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 30px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
    }
  }

  .login-form {
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      width: 100%;
    }

    .forgot-password-link {
      margin-left: auto;
      text-align: right;
      flex-shrink: 0;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border: none;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .platform-title h1 {
    font-size: 28px;
  }

  .login-form-wrapper {
    padding: 30px 20px;
    max-width: 100%;
    margin-top: 20px;

    .login-title {
      font-size: 20px;
    }
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  .platform-title {
    margin-bottom: 30px;

    h1 {
      font-size: 24px;
    }
  }

  .login-form-wrapper {
    padding: 25px 15px;
    border-radius: 12px;

    .login-button {
      height: 44px;
      font-size: 15px;
    }
  }
}
</style>
