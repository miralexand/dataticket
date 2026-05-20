/**
 * 用户认证 Store
 * 使用 Pinia 管理用户登录状态
 * 支持看板模式：自动使用配置账号登录
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthState, LoginRequest, RegisterRequest, UserInfo } from '@/types/auth'
import { authAPI } from '@/services/api'
import { dashboardConfig } from '@/support/config'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const state = ref<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false
  })

  // 计算属性
  const token = computed(() => state.value.token)
  const user = computed(() => state.value.user)
  const isAuthenticated = computed(() => state.value.isAuthenticated)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)

  // 从 localStorage 恢复状态
  const restoreState = () => {
    const savedToken = localStorage.getItem('ticket_system_token')
    const savedUser = localStorage.getItem('ticket_system_user')

    console.log('[Auth] Restoring state from localStorage')
    console.log('[Auth] Token exists:', !!savedToken)
    console.log('[Auth] User exists:', !!savedUser)

    if (savedToken && savedUser) {
      state.value.token = savedToken
      state.value.user = JSON.parse(savedUser)
      state.value.isAuthenticated = true
      console.log('[Auth] State restored successfully')
    } else {
      console.log('[Auth] No saved state found')
    }
  }

  // 保存状态到 localStorage
  const saveState = (token: string, user: UserInfo) => {
    console.log('[Auth] Saving state to localStorage')
    console.log('[Auth] Token:', token)
    console.log('[Auth] User:', user)
    localStorage.setItem('ticket_system_token', token)
    localStorage.setItem('ticket_system_user', JSON.stringify(user))

    // 验证保存是否成功
    const savedToken = localStorage.getItem('ticket_system_token')
    const savedUser = localStorage.getItem('ticket_system_user')
    console.log('[Auth] Verify save - Token exists:', !!savedToken)
    console.log('[Auth] Verify save - User exists:', !!savedUser)
  }

  // 清除状态
  const clearState = () => {
    localStorage.removeItem('ticket_system_token')
    localStorage.removeItem('ticket_system_user')
    state.value.token = null
    state.value.user = null
    state.value.isAuthenticated = false
    state.value.error = null
  }

  // 登录
  const login = async (credentials: LoginRequest) => {
    state.value.loading = true
    state.value.error = null
    
    try {
      const response = await authAPI.login(credentials)
      
      state.value.token = response.token
      state.value.user = response.user
      state.value.isAuthenticated = true
      
      saveState(response.token, response.user)
      
      return { success: true, user: response.user }
    } catch (err: any) {
      state.value.error = err.message || '登录失败'
      return { success: false, error: err.message }
    } finally {
      state.value.loading = false
    }
  }

  // 注册
  const register = async (data: RegisterRequest) => {
    state.value.loading = true
    state.value.error = null
    
    try {
      const response = await authAPI.register(data)
      
      state.value.token = response.token
      state.value.user = response.user
      state.value.isAuthenticated = true
      
      saveState(response.token, response.user)
      
      return { success: true, user: response.user }
    } catch (err: any) {
      state.value.error = err.message || '注册失败'
      return { success: false, error: err.message }
    } finally {
      state.value.loading = false
    }
  }

  // 验证 Token
  const verify = async () => {
    if (!state.value.token) {
      return false
    }
    
    try {
      const user = await authAPI.verify(state.value.token)
      state.value.user = user
      state.value.isAuthenticated = true
      return true
    } catch (err) {
      clearState()
      return false
    }
  }

  // 登出
  const logout = () => {
    clearState()
  }

  // 设置错误
  const setError = (message: string) => {
    state.value.error = message
  }

  // 清除错误
  const clearError = () => {
    state.value.error = null
  }

  // 初始化
  const init = async () => {
    console.log('[Auth] Initializing auth store')
    restoreState()
    console.log('[Auth] Token after restore:', state.value.token)
    console.log('[Auth] Is authenticated after restore:', state.value.isAuthenticated)

    // 看板模式：自动登录
    if (dashboardConfig.enabled) {
      console.log('[Auth] Dashboard mode enabled, attempting auto-login')

      // 如果已有 token，先尝试恢复
      if (state.value.token) {
        console.log('[Auth] Token found, assuming authenticated')
        state.value.isAuthenticated = true
        return
      }

      // 没有 token，尝试自动登录
      state.value.loading = true
      try {
        const result = await login({
          username: dashboardConfig.username,
          password: dashboardConfig.password
        })

        if (result.success) {
          console.log('[Auth] Auto-login successful')
        } else {
          console.error('[Auth] Auto-login failed:', result.error)
          state.value.error = result.error || '自动登录失败'
        }
      } catch (err) {
        console.error('[Auth] Auto-login error:', err)
      } finally {
        state.value.loading = false
      }
      return
    }

    // 正常模式：如果token存在，认为用户已登录
    if (state.value.token) {
      console.log('[Auth] Token found, assuming authenticated')
      state.value.isAuthenticated = true
    }
  }

  return {
    // 状态
    state,
    token,
    user,
    isAuthenticated,
    loading,
    error,

    // 方法
    login,
    register,
    verify,
    logout,
    setError,
    clearError,
    init
  }
})
