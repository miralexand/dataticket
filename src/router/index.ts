import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dashboardConfig } from '@/support/config'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: !dashboardConfig.enabled }
    },
    {
      path: '/departments',
      name: 'departments',
      component: () => import('../views/DepartmentView.vue'),
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('../views/TicketListView.vue'),
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
    {
      path: '/tickets/create',
      name: 'create-ticket',
      component: () => import('../views/CreateTicketView.vue'),
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
    {
      path: '/tickets/:id',
      name: 'ticket-detail',
      component: () => import('../views/TicketDetailView.vue'),
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
    {
      path: '/tickets/:id/edit',
      name: 'edit-ticket',
      component: () => import('../views/EditTicketView.vue'),
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: !dashboardConfig.enabled }
    },
  ],
})

// 看板模式下，跳过所有路由守卫
const skipAuth = dashboardConfig.enabled

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 看板模式下跳过认证检查
  if (skipAuth) {
    next()
    return
  }

  const authStore = useAuthStore()

  console.log('[Router] Route guard triggered:', to.path)
  console.log('[Router] AUTH_INITIALIZED:', window.__AUTH_INITIALIZED__)

  // 确保 auth store 已初始化（只在第一次时初始化）
  // 使用全局变量来跟踪是否已初始化，避免重复调用
  if (!window.__AUTH_INITIALIZED__) {
    console.log('[Router] Initializing auth store...')
    await authStore.init()
    window.__AUTH_INITIALIZED__ = true
    console.log('[Router] Auth store initialized')
  }

  console.log('[Router] Is authenticated:', authStore.isAuthenticated)

  // 需要登录的页面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('[Router] Redirecting to login - requires auth')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 只需要访客访问的页面（如登录页）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('[Router] Redirecting to home - requires guest')
    next({ name: 'home' })
    return
  }

  console.log('[Router] Allowing navigation')
  next()
})

export default router
