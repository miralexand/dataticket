<script setup lang="ts">
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket'

interface Props {
  ticket: Ticket
}

defineProps<Props>()

const emit = defineEmits<{
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

const statusColors: Record<TicketStatus, string> = {
  pending: '#f59e0b',
  progress: '#3b82f6',
  resolved: '#10b981',
  closed: '#6b7280',
}

const priorityColors: Record<TicketPriority, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
}

const categoryLabels: Record<TicketCategory, string> = {
  system_failure: '系统故障',
  device_failure: '设备报修',
  network_issue: '网络问题',
  software_request: '软件需求',
  data_query: '数据查询',
  account_issue: '账号问题',
  other: '其他',
}

const statusLabels: Record<TicketStatus, string> = {
  pending: '待处理',
  progress: '进行中',
  resolved: '已解决',
  closed: '已关闭',
}

const priorityLabels: Record<TicketPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const timeAgo = (date: Date) => {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 获取处理人显示名称
const getAssigneeDisplay = (ticket: Ticket) => {
  if (ticket.assigneeName && ticket.assigneeName !== '-' && ticket.assigneeName !== '') {
    return ticket.assigneeName
  }
  if (ticket.finishOperator && ticket.finishOperator !== '-' && ticket.finishOperator !== '') {
    return ticket.finishOperator
  }
  return null
}

// 获取工单结果显示
const getWorkResultDisplay = (ticket: Ticket) => {
  if (ticket.workResult && ticket.workResult !== '-' && ticket.workResult !== '') {
    return ticket.workResult
  }
  return null
}
</script>

<template>
  <div class="ticket-row">
    <div class="row-content">
      <!-- 左侧：工单信息 -->
      <div class="ticket-info">
        <div class="title-section">
          <span class="ticket-id">#{{ ticket.id }}</span>
          <h3 class="ticket-title">{{ ticket.title }}</h3>
          <span class="badge" :style="{ background: statusColors[ticket.status] }">
            {{ statusLabels[ticket.status] }}
          </span>
          <span class="badge" :style="{ background: priorityColors[ticket.priority] }">
            {{ priorityLabels[ticket.priority] }}
          </span>
          <span class="badge category">
            {{ categoryLabels[ticket.category] }}
          </span>
        </div>

        <div class="description-section">
          <p class="ticket-description">{{ ticket.description }}</p>
        </div>

        <div class="meta-section">
          <span class="dept-badge">🏥 {{ ticket.department }}</span>
          <span v-if="ticket.requesterName" class="requester-badge">👤 {{ ticket.requesterName }}</span>
          <span v-if="getAssigneeDisplay(ticket)" class="assignee-badge">🛠️ {{ getAssigneeDisplay(ticket) }}</span>
          <span v-if="getWorkResultDisplay(ticket)" class="result-badge">✅ {{ getWorkResultDisplay(ticket) }}</span>
        </div>

        <div class="time-section">
          <span class="create-time">创建: {{ formatDateTime(ticket.createdAt) }}</span>
          <span v-if="ticket.updatedAt" class="update-time">更新: {{ formatDate(ticket.updatedAt) }}</span>
        </div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="row-actions">
        <button class="action-btn view-btn" @click="$emit('view', ticket.id)" title="查看详情">
          👁️
        </button>
        <button class="action-btn edit-btn" @click="$emit('edit', ticket.id)" title="编辑">
          ✏️
        </button>
        <button class="action-btn danger delete-btn" @click="$emit('delete', ticket.id)" title="删除">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-row {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  transition: all 0.2s ease;
}

.ticket-row:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.row-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.ticket-info {
  flex: 1;
  min-width: 0;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.ticket-id {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.ticket-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
  min-width: 150px;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
}

.badge.category {
  background: #6366f1;
  color: white;
}

.description-section {
  margin-bottom: 0.5rem;
}

.ticket-description {
  margin: 0;
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-section {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.dept-badge, .requester-badge, .assignee-badge, .result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #4b5563;
  white-space: nowrap;
}

.result-badge {
  background: #d1fae5;
  color: #065f46;
}

.time-section {
  display: flex;
  gap: 1rem;
  font-size: 0.7rem;
  color: #6b7280;
}

.create-time, .update-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.row-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  min-width: 32px;
  min-height: 32px;
}

.action-btn:hover {
  background: #f3f4f6;
  transform: scale(1.05);
  border-color: #d1d5db;
}

.action-btn.danger:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

@media (max-width: 768px) {
  .row-content {
    flex-direction: column;
  }

  .row-actions {
    flex-direction: row;
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }

  .title-section {
    flex-wrap: wrap;
  }

  .meta-section {
    flex-direction: column;
    gap: 0.25rem;
  }

  .time-section {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
