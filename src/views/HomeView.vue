<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useTicketStore } from '@/stores/ticket'
import { dashboardConfig } from '@/support/config'
import type { Ticket } from '@/types/ticket'
import DashboardCharts from '@/components/charts/DashboardCharts.vue'
import type { TimeRange } from '@/components/charts/DashboardCharts.vue'

const ticketStore = useTicketStore()

// 查看模式：快速选择 or 自定义月份 or 全部
type ViewMode = 'quick' | 'month' | 'all'
const viewMode = ref<ViewMode>('quick')

// 时间范围（快速选择）
const timeRange = ref<TimeRange>('week')

// 自定义月份
const selectedMonth = ref<string>('')

// 生成最近12个月的选项
const monthOptions = computed(() => {
  const options: { value: string; label: string }[] = []
  const now = new Date()

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const value = `${year}-${String(month).padStart(2, '0')}`
    const label = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    options.push({ value, label })
  }

  return options
})

// 初始化默认选择当前月份
const initSelectedMonth = () => {
  const firstOption = monthOptions.value[0]
  if (firstOption) {
    selectedMonth.value = firstOption.value
  }
}
initSelectedMonth()

// 根据选择获取日期范围
const dateRange = computed(() => {
  // 全部模式：返回一个很大的日期范围
  if (viewMode.value === 'all') {
    const startDate = new Date(2000, 0, 1) // 从2000年开始
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(2100, 11, 31) // 到2100年结束
    endDate.setHours(23, 59, 59, 999)
    return { startDate, endDate, days: 36500 }
  }

  if (viewMode.value === 'month') {
    // 自定义月份模式
    const parts = selectedMonth.value.split('-').map(Number)
    const year = parts[0] ?? new Date().getFullYear()
    const month = parts[1] ?? (new Date().getMonth() + 1)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // 该月最后一天

    // 设置为整天
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate, days: endDate.getDate() }
  } else {
    // 快速选择模式
    const days = timeRange.value === 'week' ? 7 : (timeRange.value === 'month' ? 30 : 90)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate, days }
  }
})

// 监听查看模式变化，重置选择
watch(viewMode, (newMode) => {
  if (newMode === 'month') {
    const firstOption = monthOptions.value[0]
    if (firstOption) {
      selectedMonth.value = firstOption.value
    }
  } else {
    timeRange.value = 'week'
  }
})

// 根据时间范围筛选工单
const filteredTickets = computed(() => {
  const { startDate, endDate } = dateRange.value

  return ticketStore.allTickets.filter((ticket: Ticket) => {
    const createdAt = new Date(ticket.createdAt)
    return createdAt >= startDate && createdAt <= endDate
  })
})

// 筛选后的统计数据
const stats = computed(() => ({
  total: filteredTickets.value.length,
  pending: filteredTickets.value.filter(t => t.status === 'pending').length,
  inProgress: filteredTickets.value.filter(t => t.status === 'progress').length,
  resolved: filteredTickets.value.filter(t => t.status === 'resolved' || t.status === 'closed').length,
}))

// 工单分类统计
const categoryStats = computed(() => {
  const categories: Record<string, number> = {}
  filteredTickets.value.forEach((ticket: Ticket) => {
    const category = ticket.category || 'other'
    categories[category] = (categories[category] || 0) + 1
  })
  return categories
})

// 优先级统计
const priorityStats = computed(() => {
  const priorities: Record<string, number> = {}
  filteredTickets.value.forEach((ticket: Ticket) => {
    const priority = ticket.priority || 'medium'
    priorities[priority] = (priorities[priority] || 0) + 1
  })
  return priorities
})

// 最新工单
const recentTickets = computed(() => {
  return [...filteredTickets.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
})

// 当前周期统计
const periodStats = computed(() => {
  const { startDate } = dateRange.value
  
  const periodTickets = filteredTickets.value
  const periodResolved = filteredTickets.value.filter((ticket: Ticket) => {
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') return false
    const updatedAt = new Date(ticket.updatedAt)
    return updatedAt >= startDate
  })
  
  return {
    created: periodTickets.length,
    resolved: periodResolved.length,
    resolveRate: periodTickets.length > 0 ? Math.round((periodResolved.length / periodTickets.length) * 100) : 0
  }
})

// 时间范围选项（快速选择）
const timeRangeOptions = [
  { value: 'week', label: '本周', days: 7 },
  { value: 'month', label: '本月', days: 30 },
  { value: 'quarter', label: '本季度', days: 90 }
]

// 获取当前视图的标题
const currentViewTitle = computed(() => {
  if (viewMode.value === 'all') {
    return '全部工单'
  }
  if (viewMode.value === 'month') {
    const option = monthOptions.value.find(o => o.value === selectedMonth.value)
    return option?.label || '选择月份'
  } else {
    const option = timeRangeOptions.find(o => o.value === timeRange.value)
    return option?.label || '本周'
  }
})

// 加载状态
const loading = ref(true)
const error = ref<string | null>(null)

// 刷新数据
const refreshData = async () => {
  loading.value = true
  error.value = null
  try {
    await ticketStore.fetchTickets({ limit: 1000 })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 状态颜色映射
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    progress: '#3b82f6',
    resolved: '#10b981',
    closed: '#6b7280'
  }
  return colors[status] || '#6b7280'
}

// 优先级颜色映射
const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: '#10b981',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  }
  return colors[priority] || '#6b7280'
}

// 分类标签映射
const categoryLabels: Record<string, string> = {
  system_failure: '日常维护',
  device_failure: '技术支持',
  network_issue: '网络问题',
  software_request: '软件需求',
  data_query: '数据查询',
  account_issue: '账号问题',
  other: '功能请求'
}

// 状态标签映射
const statusLabels: Record<string, string> = {
  pending: '待处理',
  progress: '处理中',
  resolved: '已解决',
  closed: '已关闭'
}

// 优先级标签映射
const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
}

// 自动刷新状态（默认关闭）
const autoRefresh = ref(false)
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value

  if (autoRefresh.value) {
    // 开启自动刷新
    autoRefreshInterval = setInterval(refreshData, 60000)
  } else {
    // 关闭自动刷新
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }
}

onMounted(async () => {
  // 立即刷新数据
  loading.value = true
  try {
    await ticketStore.fetchTickets({ limit: 1000 })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- 顶部标题 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1>🏥 工单数据可视化看板</h1>
        <p>医院信息科工单实时监控系统</p>
      </div>
      <div class="header-right">
        <!-- 查看模式切换 -->
        <div class="view-mode-selector">
          <button
            :class="['mode-btn', { active: viewMode === 'quick' }]"
            @click="viewMode = 'quick'"
          >
            快速选择
          </button>
          <button
            :class="['mode-btn', { active: viewMode === 'month' }]"
            @click="viewMode = 'month'"
          >
            按月份
          </button>
          <button
            :class="['mode-btn', { active: viewMode === 'all' }]"
            @click="viewMode = 'all'"
          >
            全部
          </button>
        </div>
        
        <!-- 时间范围选择器 -->
        <div class="time-range-selector" v-if="viewMode === 'quick'">
          <button
            v-for="option in timeRangeOptions"
            :key="option.value"
            :class="['range-btn', { active: timeRange === option.value }]"
            @click="timeRange = option.value as TimeRange"
          >
            {{ option.label }}
          </button>
        </div>
        
        <!-- 月份选择器 -->
        <div class="month-selector" v-else-if="viewMode === 'month'">
          <select v-model="selectedMonth" class="month-select">
            <option v-for="option in monthOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="refresh-info">
          <!-- iOS风格自动刷新开关 -->
          <div class="auto-refresh-toggle">
            <span class="toggle-label">自动刷新</span>
            <button
              class="ios-switch"
              :class="{ active: autoRefresh }"
              @click="toggleAutoRefresh"
            >
              <span class="ios-switch-thumb"></span>
            </button>
          </div>
          <span class="last-update">最后更新: {{ formatDate(new Date()) }}</span>
          <button class="refresh-btn" @click="refreshData" :disabled="loading">
            {{ loading ? '刷新中...' : '🔄 刷新数据' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 当前查看范围提示 -->
    <div class="view-range-hint">
      <span class="hint-icon">📋</span>
      <span class="hint-text">当前查看: <strong>{{ currentViewTitle }}</strong></span>
      <span class="hint-stats">共 {{ stats.total }} 个工单</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-banner">
      <span>⚠️</span>
      <span>{{ error }}</span>
      <button @click="error = null">×</button>
    </div>

    <!-- 核心统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">{{ currentViewTitle }} 总工单</div>
        </div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card stat-progress">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.inProgress }}</div>
          <div class="stat-label">处理中</div>
        </div>
      </div>
      <div class="stat-card stat-resolved">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.resolved }}</div>
          <div class="stat-label">已解决</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <DashboardCharts :tickets="filteredTickets" :time-range="timeRange" />

    <!-- 周期统计和分类统计 -->
    <div class="secondary-stats">
      <!-- 周期统计 -->
      <div class="today-stats">
        <h3>📅 {{ currentViewTitle }} 动态</h3>
        <div class="today-grid">
          <div class="today-item">
            <span class="today-value">{{ periodStats.created }}</span>
            <span class="today-label">新增工单</span>
          </div>
          <div class="today-item">
            <span class="today-value">{{ periodStats.resolved }}</span>
            <span class="today-label">已解决</span>
          </div>
          <div class="today-item">
            <span class="today-value">{{ periodStats.resolveRate }}%</span>
            <span class="today-label">解决率</span>
          </div>
        </div>
      </div>

      <!-- 分类统计 -->
      <div class="category-stats">
        <h3>📂 工单分类</h3>
        <div class="category-list">
          <div 
            v-for="(count, category) in categoryStats" 
            :key="category"
            class="category-item"
          >
            <span class="category-name">{{ categoryLabels[category] || category }}</span>
            <div class="category-bar">
              <div 
                class="category-fill" 
                :style="{ width: (count / stats.total * 100) + '%' }"
              ></div>
            </div>
            <span class="category-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- 优先级统计 -->
      <div class="priority-stats">
        <h3>🔢 优先级分布</h3>
        <div class="priority-list">
          <div 
            v-for="(count, priority) in priorityStats" 
            :key="priority"
            class="priority-item"
          >
            <span 
              class="priority-badge"
              :style="{ backgroundColor: getPriorityColor(priority) }"
            >
              {{ priorityLabels[priority] || priority }}
            </span>
            <span class="priority-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新工单列表 -->
    <div class="recent-tickets">
      <h3>📝 最新工单</h3>
      <div class="tickets-table">
        <table>
          <thead>
            <tr>
              <th>状态</th>
              <th>优先级</th>
              <th>标题</th>
              <th>科室</th>
              <th>登记人</th>
              <th>处理人</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && recentTickets.length === 0">
              <td colspan="7" class="loading-cell">加载中...</td>
            </tr>
            <tr v-else-if="recentTickets.length === 0">
              <td colspan="7" class="empty-cell">暂无工单数据</td>
            </tr>
            <tr v-for="ticket in recentTickets" :key="ticket.id">
              <td>
                <span 
                  class="status-badge"
                  :style="{ backgroundColor: getStatusColor(ticket.status) }"
                >
                  {{ statusLabels[ticket.status] || ticket.status }}
                </span>
              </td>
              <td>
                <span 
                  class="priority-dot"
                  :style="{ backgroundColor: getPriorityColor(ticket.priority) }"
                ></span>
                {{ priorityLabels[ticket.priority] || ticket.priority }}
              </td>
              <td class="title-cell" :title="ticket.title">
                {{ ticket.title }}
              </td>
              <td>{{ ticket.department }}</td>
              <td>{{ ticket.requesterName }}</td>
              <td>{{ ticket.assigneeName || '-' }}</td>
              <td>{{ formatDate(ticket.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* 顶部标题 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  color: white;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.header-left p {
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

/* 查看模式切换 */
.view-mode-selector {
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.mode-btn {
  padding: 0.35rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  color: white;
}

.mode-btn.active {
  background: white;
  color: #2563eb;
}

/* 时间范围选择器 */
.time-range-selector {
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.range-btn {
  padding: 0.4rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.range-btn.active {
  background: white;
  color: #2563eb;
}

/* 月份选择器 */
.month-selector {
  display: flex;
  align-items: center;
}

.month-select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 150px;
}

.month-select option {
  background: #1e3a5f;
  color: white;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-update {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* iOS风格自动刷新开关 */
.auto-refresh-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 0.875rem;
  opacity: 0.9;
  white-space: nowrap;
}

.ios-switch {
  position: relative;
  width: 48px;
  height: 28px;
  background: rgba(120, 120, 128, 0.32);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 2px;
}

.ios-switch.active {
  background: #34c759;
}

.ios-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.ios-switch.active .ios-switch-thumb {
  transform: translateX(20px);
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 查看范围提示 */
.view-range-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.hint-icon {
  font-size: 1.25rem;
}

.hint-text {
  color: #374151;
  font-size: 0.9375rem;
}

.hint-text strong {
  color: #2563eb;
}

.hint-stats {
  margin-left: auto;
  color: #6b7280;
  font-size: 0.875rem;
}

/* 错误提示 */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
}

.error-banner button {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #dc2626;
}

/* 核心统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.stat-total {
  border-left: 4px solid #6366f1;
}

.stat-pending {
  border-left: 4px solid #f59e0b;
}

.stat-progress {
  border-left: 4px solid #3b82f6;
}

.stat-resolved {
  border-left: 4px solid #10b981;
}

/* 次级统计 */
.secondary-stats {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
}

.today-stats,
.category-stats,
.priority-stats {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.today-stats h3,
.category-stats h3,
.priority-stats h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.today-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.today-item {
  display: flex;
  flex-direction: column;
}

.today-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

.today-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-name {
  width: 80px;
  font-size: 0.875rem;
  color: #374151;
}

.category-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s;
}

.category-count {
  width: 30px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.priority-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.priority-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
}

.priority-count {
  font-weight: 600;
  color: #374151;
}

/* 最新工单列表 */
.recent-tickets {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.recent-tickets h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.tickets-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th {
  text-align: left;
  padding: 0.75rem 0.5rem;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

tr:hover {
  background: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
}

.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.25rem;
}

.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-cell,
.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .secondary-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-right {
    align-items: flex-start;
    width: 100%;
  }
  
  .view-mode-selector,
  .time-range-selector {
    width: 100%;
  }
  
  .mode-btn,
  .range-btn {
    flex: 1;
    text-align: center;
  }
  
  .month-select {
    width: 100%;
  }
  
  .refresh-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .view-range-hint {
    flex-wrap: wrap;
  }
  
  .hint-stats {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 0.75rem;
  }
  
  th, td {
    padding: 0.5rem 0.25rem;
  }
}

/* 暗黑模式支持 */
:global(.dark-mode) .dashboard-container {
  background: #1a1a2e;
}

:global(.dark-mode) .dashboard-header {
  background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
}

:global(.dark-mode) .header-left h2 {
  color: #e8e8e8;
}

:global(.dark-mode) .hint-text {
  color: #a0a0a0;
}

:global(.dark-mode) .hint-text strong {
  color: #fbbf24;
}

:global(.dark-mode) .mode-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:global(.dark-mode) .mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

:global(.dark-mode) .time-range-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
}

:global(.dark-mode) .time-range-btn.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

:global(.dark-mode) .month-select {
  background: #16213e;
  color: #e8e8e8;
  border-color: #2a2a4a;
}

:global(.dark-mode) .auto-refresh-toggle .toggle-label {
  color: #a0a0a0;
}

:global(.dark-mode) .ios-switch {
  background: rgba(120, 120, 128, 0.4);
}

:global(.dark-mode) .ios-switch.active {
  background: #34c759;
  box-shadow: 0 0 12px rgba(52, 199, 89, 0.4);
}

:global(.dark-mode) .last-update {
  color: #a0a0a0;
}

:global(.dark-mode) .stats-grid {
  gap: 16px;
}

:global(.dark-mode) .stat-card {
  background: #16213e;
  border: 1px solid #2a2a4a;
}

:global(.dark-mode) .stat-value {
  color: #e8e8e8;
}

:global(.dark-mode) .stat-label {
  color: #a0a0a0;
}

:global(.dark-mode) .chart-card {
  background: #16213e;
  border: 1px solid #2a2a4a;
}

:global(.dark-mode) .chart-title {
  color: #e8e8e8;
}

:global(.dark-mode) .chart-subtitle {
  color: #a0a0a0;
}

:global(.dark-mode) .charts-grid {
  gap: 20px;
}

:global(.dark-mode) .pie-charts-grid {
  gap: 16px;
}

:global(.dark-mode) .pie-chart-card {
  background: #16213e;
  border: 1px solid #2a2a4a;
}

:global(.dark-mode) .recent-card {
  background: #16213e;
  border: 1px solid #2a2a4a;
}

:global(.dark-mode) .recent-title {
  color: #e8e8e8;
}

:global(.dark-mode) .recent-table {
  background: transparent;
}

:global(.dark-mode) .recent-table th {
  color: #a0a0a0;
  border-bottom: 1px solid #2a2a4a;
}

:global(.dark-mode) .recent-table td {
  color: #e8e8e8;
  border-bottom: 1px solid #2a2a4a;
}

:global(.dark-mode) .status-badge.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

:global(.dark-mode) .status-badge.resolved {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

:global(.dark-mode) .status-badge.in-progress {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

:global(.dark-mode) .priority-badge {
  color: #e8e8e8;
}

:global(.dark-mode) .empty-state {
  color: #a0a0a0;
}

:global(.dark-mode) .loading-container,
:global(.dark-mode) .error-container {
  color: #e8e8e8;
}

@media (max-width: 768px) {
  :global(.dark-mode) .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  :global(.dark-mode) .charts-grid {
    grid-template-columns: 1fr;
  }

  :global(.dark-mode) .pie-charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  :global(.dark-mode) .stats-grid {
    grid-template-columns: 1fr;
  }

  :global(.dark-mode) .pie-charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
