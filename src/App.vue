<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { dashboardConfig } from '@/support/config'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import NotificationContainer from './components/common/NotificationContainer.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isDashboardMode = computed(() => dashboardConfig.enabled)

// 用户信息展开/折叠状态
const isUserMenuOpen = ref(false)

// 固定顶部栏状态
const isHeaderPinned = ref(false)

// 暗黑模式状态
const isDarkMode = ref(false)

// 切换用户菜单
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

// 关闭用户菜单
const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

// 切换固定顶部栏
const toggleHeaderPin = () => {
  isHeaderPinned.value = !isHeaderPinned.value
}

// 切换暗黑模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  // 应用暗黑模式
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.setAttribute('data-theme', 'light')
  }
}

// 看板模式下直接初始化认证（同步执行，确保页面加载时已完成）
if (dashboardConfig.enabled && !window.__AUTH_INITIALIZED__) {
  authStore.init()
  window.__AUTH_INITIALIZED__ = true
}

const handleLogout = () => {
  authStore.logout()
  if (dashboardConfig.enabled) {
    window.location.reload()
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <header 
      class="app-header" 
      v-if="isAuthenticated || isDashboardMode"
      :class="{ pinned: isHeaderPinned }"
    >
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">🏥</div>
          <h1>工单系统·看板</h1>
        </div>
        <nav class="main-nav">
          <RouterLink to="/" class="nav-link" @click="closeUserMenu">看板</RouterLink>
          <template v-if="!isDashboardMode">
            <RouterLink to="/departments" class="nav-link" @click="closeUserMenu">科室</RouterLink>
            <RouterLink to="/tickets" class="nav-link" @click="closeUserMenu">工单列表</RouterLink>
            <RouterLink to="/tickets/create" class="nav-link" @click="closeUserMenu">创建工单</RouterLink>
          </template>
          <RouterLink to="/about" class="nav-link" @click="closeUserMenu">关于</RouterLink>
        </nav>
        
        <div class="header-actions">
          <!-- iOS风格固定顶部栏按钮 -->
          <button 
            class="ios-btn pin-btn" 
            :class="{ active: isHeaderPinned }"
            @click="toggleHeaderPin"
            title="固定顶部栏"
          >
            <svg v-if="isHeaderPinned" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" opacity="0.5" />
            </svg>
          </button>
          
          <!-- iOS风格暗黑模式按钮 -->
          <button 
            class="ios-btn dark-mode-btn" 
            :class="{ active: isDarkMode }"
            @click="toggleDarkMode"
            title="切换暗黑模式"
          >
            <svg v-if="isDarkMode" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,5.29C7.24,5.84 6.44,6.81 6,8.22L3.34,7M3.36,17L6,15.78C6.44,17.19 7.24,18.16 7.5,18.71L3.36,17M20.65,7L18,8.22C17.56,6.81 16.76,5.84 16.5,5.29L20.65,7M20.64,17L16.5,18.71C16.76,18.16 17.56,17.19 18,15.78L20.64,17M12,22L9.59,18.56C10.37,18.83 11.22,19 12,19C12.78,19 13.63,18.83 14.41,18.56L12,22Z" />
            </svg>
          </button>
          
          <!-- 用户信息（可折叠） -->
          <div class="user-menu-wrapper" v-if="user || isDashboardMode">
            <button 
              class="user-toggle" 
              @click="toggleUserMenu"
              :class="{ active: isUserMenuOpen }"
            >
              <div class="user-avatar">
                {{ user?.name?.charAt(0) || '👤' }}
              </div>
              <svg class="chevron" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
              </svg>
            </button>
            
            <!-- 用户下拉菜单 -->
            <Transition name="slide-fade">
              <div class="user-dropdown" v-if="isUserMenuOpen" v-click-away="closeUserMenu">
                <template v-if="user">
                  <div class="user-dropdown-header">
                    <div class="user-dropdown-avatar">{{ user.name.charAt(0) }}</div>
                    <div class="user-dropdown-info">
                      <span class="user-dropdown-name">{{ user.name }}</span>
                      <span class="user-dropdown-role">{{ user.role === 'admin' ? '管理员' : user.role === 'doctor' ? '医生' : '用户' }}</span>
                    </div>
                  </div>
                  <div class="user-dropdown-dept">
                    <span class="label">科室:</span>
                    <span class="value">{{ user.department }}</span>
                  </div>
                </template>
                <template v-else-if="isDashboardMode">
                  <div class="user-dropdown-header">
                    <div class="user-dropdown-avatar">📊</div>
                    <div class="user-dropdown-info">
                      <span class="user-dropdown-name">看板模式</span>
                      <span class="user-dropdown-role">自动登录</span>
                    </div>
                  </div>
                </template>
                <div class="user-dropdown-divider"></div>
                <button @click="handleLogout" class="user-dropdown-logout">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                  </svg>
                  {{ isDashboardMode ? '重新登录' : '退出登录' }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
    </main>

    <footer class="app-footer">
      <p>RjxZyyXxk © 2026 - Built with Vue 3 & TypeScript</p>
    </footer>

    <NotificationContainer />
  </div>
</template>

<style scoped>
/* 科技感主题变量 - 使用全局CSS变量 */
.app-container {
  --bg-primary: var(--color-background);
  --bg-secondary: var(--color-background-soft);
  --text-primary: var(--color-text);
  --text-secondary: var(--color-text-secondary);
  --border-color: var(--color-border);
  --header-bg: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  --card-bg: var(--card-bg);
  --shadow: var(--shadow-md);
}

.app-container.dark-mode {
  --bg-primary: var(--color-background);
  --bg-secondary: var(--color-background-soft);
  --text-primary: var(--color-text);
  --text-secondary: var(--color-text-secondary);
  --border-color: var(--color-border);
  --header-bg: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  --card-bg: var(--card-bg);
  --shadow: var(--shadow-xl);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

/* Apple风格导航栏 */
.app-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  color: var(--color-text);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: var(--z-index-sticky);
  transition: background-color var(--transition-normal), backdrop-filter var(--transition-normal);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* 深色模式导航栏 */
@media (prefers-color-scheme: dark) {
  .app-header {
    background: rgba(28, 28, 30, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  }
}

/* 固定在顶部 */
.app-header.pinned {
  position: sticky;
  top: 0;
}

.app-header.pinned {
  position: sticky;
  top: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-section h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: var(--color-heading);
  line-height: 1.1;
}

/* 深色模式logo颜色 */
@media (prefers-color-scheme: dark) {
  .logo-section h1 {
    color: #ffffff;
  }
}

/* Apple风格导航菜单 */
.main-nav {
  display: flex;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 10px 16px;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.23536;
  letter-spacing: -0.022em;
  transition: color var(--transition-normal);
  white-space: nowrap;
  position: relative;
}

.nav-link:hover {
  color: var(--color-text);
}

/* 活动状态指示器 */
.nav-link.router-link-exact-active {
  color: var(--color-blue);
  font-weight: 500;
}

.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--color-blue);
  border-radius: 1px;
}

/* 深色模式导航链接 */
@media (prefers-color-scheme: dark) {
  .nav-link {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .nav-link:hover {
    color: #ffffff;
  }
  
  .nav-link.router-link-exact-active {
    color: #0a84ff;
  }
  
  .nav-link.router-link-exact-active::after {
    background: #0a84ff;
  }
}

/* 头部操作按钮区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Apple风格工具栏按钮 */
.ios-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.ios-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(1.08);
}

.ios-btn:active {
  transform: scale(0.95);
}

.ios-btn.active {
  background: rgba(0, 122, 255, 0.12);
  color: var(--color-blue);
}

.ios-btn svg {
  width: 18px;
  height: 18px;
  display: block;
}

/* 深色模式按钮 */
@media (prefers-color-scheme: dark) {
  .ios-btn {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }
  
  .ios-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  .ios-btn.active {
    background: rgba(10, 132, 255, 0.2);
    color: #0a84ff;
  }
}

/* 特定按钮样式 */
.pin-btn.active {
  background: rgba(52, 199, 89, 0.12);
  color: var(--color-success);
}

.dark-mode-btn.active {
  background: rgba(255, 149, 0, 0.12);
  color: var(--color-warning);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ios-btn {
    width: 32px;
    height: 32px;
  }
  
  .ios-btn svg {
    width: 16px;
    height: 16px;
  }
}

/* 用户菜单 */
.user-menu-wrapper {
  position: relative;
}

.user-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  color: white;
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.user-toggle:hover {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-toggle.active {
  background: rgba(102, 126, 234, 0.4);
  border-color: rgba(102, 126, 234, 0.6);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.user-toggle.active .chevron {
  transform: rotate(180deg);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  z-index: 200;
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid var(--glass-border);
}

.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.user-dropdown-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.user-dropdown-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-dropdown-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}

.user-dropdown-role {
  font-size: 12px;
  color: var(--text-secondary);
}

.user-dropdown-dept {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.user-dropdown-dept .label {
  color: var(--text-secondary);
}

.user-dropdown-dept .value {
  color: var(--text-primary);
  font-weight: 500;
}

.user-dropdown-divider {
  height: 1px;
  background: var(--border-color);
}

.user-dropdown-logout {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-dropdown-logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.user-dropdown-logout svg {
  width: 18px;
  height: 18px;
}

/* 下拉菜单动画 */
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Apple风格主内容区 */
.app-main {
  flex: 1;
  width: 100%;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
  background: var(--color-background);
}

/* 内容容器 */
.app-main > * {
  max-width: 980px; /* Apple风格的最大宽度 */
  margin: 0 auto;
}

/* Apple风格页脚 */
.app-footer {
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  text-align: center;
  padding: 40px 20px;
  margin-top: auto;
  border-top: 1px solid var(--color-divider);
}

.app-footer p {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -0.01em;
}

/* 深色模式页脚 */
@media (prefers-color-scheme: dark) {
  .app-footer {
    background: var(--color-background-mute);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-main {
    padding: 28px 16px;
  }
  
  .app-footer {
    padding: 32px 16px;
  }
}

.app-footer p {
  margin: 0;
  font-size: 0.875rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .logo-section h1 {
    font-size: 1.25rem;
  }

  .main-nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .nav-link {
    font-size: 0.875rem;
    padding: 0.4rem 0.75rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
