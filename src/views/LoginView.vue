<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>🏥 医院工单管理系统</h1>
        <p>信息科工单管理平台</p>
      </div>

      <div class="login-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>账号</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="请输入账号"
            required
            @input="clearError"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            required
            @input="clearError"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="loading">登录中...</span>
            <span v-else>立即登录</span>
          </button>
          <button type="button" @click="resetLoginForm" class="btn-secondary">
            重置
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

      </form>

      <!-- 注册表单 -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>用户名 *</label>
          <input
            v-model="registerForm.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label>密码 *</label>
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-group">
          <label>姓名 *</label>
          <input
            v-model="registerForm.name"
            type="text"
            placeholder="请输入真实姓名"
            required
          />
        </div>

        <div class="form-group">
          <label>角色 *</label>
          <select v-model="registerForm.role" required>
            <option value="">请选择角色</option>
            <option value="doctor">医生</option>
            <option value="nurse">护士</option>
            <option value="technician">医技人员</option>
            <option value="admin_staff">行政人员</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>科室 *</label>
          <select v-model="registerForm.department" required>
            <option value="">请选择科室</option>
            <optgroup label="临床科室">
              <option value="outpatient">门诊部</option>
              <option value="inpatient">住院部</option>
              <option value="emergency">急诊科</option>
              <option value="icu">重症监护室</option>
              <option value="surgery">外科</option>
              <option value="internal">内科</option>
              <option value="pediatrics">儿科</option>
              <option value="obstetrics">妇产科</option>
              <option value="ophthalmology">眼科</option>
              <option value="dentistry">口腔科</option>
            </optgroup>
            <optgroup label="医技科室">
              <option value="radiology">放射科</option>
              <option value="laboratory">检验科</option>
              <option value="pharmacy">药剂科</option>
            </optgroup>
            <optgroup label="行政科室">
              <option value="administration">行政科室</option>
              <option value="it_department">信息科</option>
            </optgroup>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label>联系电话</label>
          <input
            v-model="registerForm.phone"
            type="tel"
            placeholder="请输入联系电话"
          />
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="loading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

const loginForm = reactive<LoginRequest>({
  username: '',
  password: ''
})

const registerForm = reactive<RegisterRequest>({
  username: '',
  password: '',
  name: '',
  role: 'doctor' as const,
  department: 'internal' as const,
  phone: '',
  email: ''
})

// 清除错误信息
const clearError = () => {
  if (authStore.error) {
    authStore.clearError()
  }
}

// 重置登录表单
const resetLoginForm = () => {
  loginForm.username = ''
  loginForm.password = ''
  clearError()
}

// 处理登录
const handleLogin = async () => {
  try {
    // 表单验证
    if (!loginForm.username || !loginForm.password) {
      authStore.setError('请输入账号和密码')
      return
    }

    if (loginForm.username.length < 3) {
      authStore.setError('账号长度至少3位')
      return
    }

    // 调用登录API
    const result = await authStore.login(loginForm)

    if (result.success) {
      console.log('[Login] Login successful, redirecting...')
      console.log('[Login] Is authenticated:', authStore.isAuthenticated)
      console.log('[Login] Token:', authStore.token)

      // 登录成功，跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 300)
    }
  } catch (err) {
    // 错误已在 store 中处理
    console.error('登录异常:', err)
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    const result = await authStore.register(registerForm)
    if (result.success) {
      // 注册成功，跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 300)
    }
  } catch (err) {
    // 错误已在 store 中处理
    console.error('注册异常:', err)
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #4f46e5;
}

.tab-btn.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.login-form,
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.form-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.btn-primary {
  flex: 1;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  padding: 14px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.error-message {
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.demo-info {
  margin-top: 16px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 13px;
  color: #0369a1;
}

.demo-info p {
  margin: 4px 0;
}

@media (max-width: 480px) {
  .login-container {
    padding: 24px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
}
</style>
