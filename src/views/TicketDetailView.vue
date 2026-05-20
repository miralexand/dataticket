<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import TicketDetail from '@/components/ticket/TicketDetail.vue'
import Button from '@/components/ui/Button.vue'
import type { Ticket } from '@/types/ticket'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()
const authStore = useAuthStore()
const { success, error: showError, info } = useNotification()

const ticket = ref<Ticket | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 计算属性：是否可以编辑
const canEdit = computed(() => {
  if (!ticket.value || !authStore.user) return false
  
  // 只有创建者、处理人或管理员可以编辑
  const isCreator = ticket.value.requesterId === authStore.user.id
  const isAssignee = ticket.value.assigneeId === authStore.user.id
  const isAdmin = authStore.user.role === 'admin'
  
  return isCreator || isAssignee || isAdmin
})

// 计算属性：是否可以删除
const canDelete = computed(() => {
  if (!ticket.value || !authStore.user) return false
  
  // 只有创建者或管理员可以删除
  const isCreator = ticket.value.requesterId === authStore.user.id
  const isAdmin = authStore.user.role === 'admin'
  
  return isCreator || isAdmin
})

// 计算属性：状态标签样式
const statusClass = computed(() => {
  if (!ticket.value) return ''
  
  const statusMap: Record<string, string> = {
    pending: 'status-pending',
    progress: 'status-progress',
    resolved: 'status-resolved',
    closed: 'status-closed'
  }
  
  return statusMap[ticket.value.status] || 'status-pending'
})

// 计算属性：优先级标签样式
const priorityClass = computed(() => {
  if (!ticket.value) return ''
  
  const priorityMap: Record<string, string> = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    urgent: 'priority-urgent'
  }
  
  return priorityMap[ticket.value.priority] || 'priority-medium'
})

// 加载工单详情
const loadTicket = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = '工单ID不存在'
    return
  }

  loading.value = true
  error.value = null

  try {
    // 从 store 中查找工单
    const foundTicket = ticketStore.tickets.find(t => t.id === id)
    
    if (foundTicket) {
      ticket.value = foundTicket
    } else {
      // 如果不在 store 中，尝试从 API 获取
      // 这里可以调用 ticketStore.fetchTicketById(id)
      // 暂时显示错误
      error.value = '工单未找到'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载工单失败'
    showError('加载工单失败')
  } finally {
    loading.value = false
  }
}

// 编辑工单
const editTicket = () => {
  if (!ticket.value) return
  router.push(`/tickets/${ticket.value.id}/edit`)
}

// 删除工单
const deleteTicket = async () => {
  if (!ticket.value) return
  
  if (!confirm('确定要删除这个工单吗？此操作不可恢复。')) {
    return
  }

  loading.value = true

  try {
    await ticketStore.deleteTicket(ticket.value.id)
    success('工单已删除')
    router.push('/tickets')
  } catch (err) {
    const message = err instanceof Error ? err.message : '删除工单失败'
    showError(message)
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/tickets')
}

// 监听工单更新事件
const handleTicketUpdated = (event: CustomEvent) => {
  const updatedTicket = event.detail
  if (ticket.value && updatedTicket.id === ticket.value.id) {
    ticket.value = updatedTicket
    info('工单已更新')
  }
}

// 监听工单状态变更事件
const handleTicketStatusChanged = (event: CustomEvent) => {
  const { ticketId, status } = event.detail
  if (ticket.value && ticketId === ticket.value.id) {
    ticket.value.status = status
    info(`工单状态已变更为: ${status}`)
  }
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    progress: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return statusMap[status] || status
}

// 获取优先级标签
const getPriorityLabel = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

// 获取分类标签
const getCategoryLabel = (category: string): string => {
  const categoryMap: Record<string, string> = {
    system_failure: '系统故障',
    device_failure: '设备报修',
    network_issue: '网络问题',
    software_request: '软件需求',
    data_query: '数据查询',
    account_issue: '账号问题',
    other: '其他'
  }
  return categoryMap[category] || category
}

// 格式化日期
const formatDate = (date: Date): string => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadTicket()

  // 监听自定义事件
  window.addEventListener('ticket_updated', handleTicketUpdated as EventListener)
  window.addEventListener('ticket_status_changed', handleTicketStatusChanged as EventListener)
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('ticket_updated', handleTicketUpdated as EventListener)
  window.removeEventListener('ticket_status_changed', handleTicketStatusChanged as EventListener)
})
</script>

<template>
  <div class="ticket-detail-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>工单详情</h1>
        <div class="header-actions">
          <Button variant="secondary" @click="goBack" :disabled="loading">
            返回列表
          </Button>
          <Button v-if="canEdit" @click="editTicket" :disabled="loading">
            编辑工单
          </Button>
          <Button v-if="canDelete" variant="danger" @click="deleteTicket" :disabled="loading">
            删除工单
          </Button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <Button @click="loadTicket">重试</Button>
    </div>

    <!-- 工单详情 -->
    <div v-else-if="ticket" class="ticket-detail-container">
      <!-- 状态和优先级标签 -->
      <div class="ticket-meta">
        <span class="status-badge" :class="statusClass">
          {{ getStatusLabel(ticket.status) }}
        </span>
        <span class="priority-badge" :class="priorityClass">
          {{ getPriorityLabel(ticket.priority) }}
        </span>
        <span class="category-badge">
          {{ getCategoryLabel(ticket.category) }}
        </span>
      </div>

      <!-- 工单详情组件 -->
      <TicketDetail :ticket="ticket" />

      <!-- 处理信息（如果已处理） -->
      <div v-if="ticket.assigneeName || ticket.workResult" class="processing-info">
        <h3>处理信息</h3>
        <div class="info-grid">
          <div v-if="ticket.assigneeName" class="info-item">
            <span class="label">处理人</span>
            <span class="value">{{ ticket.assigneeName }}</span>
          </div>
          <div v-if="ticket.workResult" class="info-item full-width">
            <span class="label">处理结果</span>
            <span class="value">{{ ticket.workResult }}</span>
          </div>
          <div v-if="ticket.finishOperator" class="info-item">
            <span class="label">完成人</span>
            <span class="value">{{ ticket.finishOperator }}</span>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="timeline">
        <h3>时间线</h3>
        <div class="timeline-items">
          <div class="timeline-item">
            <div class="timeline-dot created"></div>
            <div class="timeline-content">
              <div class="timeline-title">工单创建</div>
              <div class="timeline-time">{{ formatDate(ticket.createdAt) }}</div>
              <div class="timeline-desc">由 {{ ticket.requesterName }} 创建</div>
            </div>
          </div>
          
          <div v-if="ticket.updatedAt && ticket.updatedAt.getTime() !== ticket.createdAt.getTime()" class="timeline-item">
            <div class="timeline-dot updated"></div>
            <div class="timeline-content">
              <div class="timeline-title">最后更新</div>
              <div class="timeline-time">{{ formatDate(ticket.updatedAt) }}</div>
              <div class="timeline-desc">状态: {{ getStatusLabel(ticket.status) }}</div>
            </div>
          </div>

          <div v-if="ticket.closedAt" class="timeline-item">
            <div class="timeline-dot closed"></div>
            <div class="timeline-content">
              <div class="timeline-title">工单关闭</div>
              <div class="timeline-time">{{ formatDate(ticket.closedAt) }}</div>
              <div class="timeline-desc">工单已关闭</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>工单不存在</h3>
      <p>该工单可能已被删除或不存在</p>
      <Button @click="goBack">返回列表</Button>
    </div>
  </div>
</template>

<style scoped>
.ticket-detail-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #111827;
}

.error-state p,
.empty-state p {
  margin: 0 0 1.5rem;
  color: #6b7280;
}

/* 工单详情容器 */
.ticket-detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 元数据标签 */
.ticket-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.status-badge,
.priority-badge,
.category-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-resolved {
  background: #d1fae5;
  color: #065f46;
}

.status-closed {
  background: #e5e7eb;
  color: #374151;
}

.priority-low {
  background: #d1fae5;
  color: #065f46;
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-high {
  background: #fee2e2;
  color: #991b1b;
}

.priority-urgent {
  background: #7f1d1d;
  color: #fef2f2;
}

.category-badge {
  background: #f3f4f6;
  color: #374151;
}

/* 处理信息 */
.processing-info {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.processing-info h3 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  color: #111827;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-item .value {
  font-size: 0.9375rem;
  color: #111827;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 时间线 */
.timeline {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.timeline h3 {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  color: #111827;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  padding-left: 2rem;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e5e7eb;
}

.timeline-dot.created {
  background: #667eea;
}

.timeline-dot.updated {
  background: #f59e0b;
}

.timeline-dot.closed {
  background: #6b7280;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.timeline-time {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.timeline-desc {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ticket-detail-view {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .timeline-items::before {
    left: 8px;
  }

  .timeline-item {
    padding-left: 1.5rem;
  }

  .timeline-dot {
    width: 20px;
    height: 20px;
    left: -2px;
  }
}
</style>
