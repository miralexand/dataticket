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
    month: 'short',
    day: 'numeric',
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
  <div class="ticket-card">
    <div class="ticket-header">
      <div class="ticket-title">
        <span class="ticket-id">#{{ ticket.id.split('-')[1] }}</span>
        <h3>{{ ticket.title }}</h3>
      </div>
      <div class="ticket-actions">
        <button class="action-btn" @click="$emit('view', ticket.id)" title="查看详情">
          👁️
        </button>
        <button class="action-btn" @click="$emit('edit', ticket.id)" title="编辑">
          ✏️
        </button>
        <button class="action-btn danger" @click="$emit('delete', ticket.id)" title="删除">
          🗑️
        </button>
      </div>
    </div>

    <div class="ticket-description">
      {{ ticket.description }}
    </div>

    <div class="ticket-meta">
      <div class="meta-group">
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

      <div class="meta-info">
        <span v-if="getAssigneeDisplay(ticket)" class="assignee">
          👤 {{ getAssigneeDisplay(ticket) }}
        </span>
        <span class="time">
          ⏰ {{ timeAgo(ticket.createdAt) }}
        </span>
      </div>
    </div>

    <!-- 工单结果 -->
    <div v-if="getWorkResultDisplay(ticket)" class="work-result">
      <div class="result-label">处理结果：</div>
      <div class="result-content">{{ getWorkResultDisplay(ticket) }}</div>
    </div>

    <!-- 科室信息 -->
    <div class="department-info">
      <span class="dept-badge">🏥 {{ ticket.department }}</span>
      <span v-if="ticket.requesterName" class="requester-badge">👤 {{ ticket.requesterName }}</span>
    </div>

    <!-- 时间信息 -->
    <div class="time-info">
      <span class="create-time">创建: {{ formatDateTime(ticket.createdAt) }}</span>
      <span v-if="ticket.updatedAt" class="update-time">更新: {{ formatDate(ticket.updatedAt) }}</span>
    </div>

    <div v-if="ticket.tags.length > 0" class="ticket-tags">
      <span v-for="tag in ticket.tags" :key="tag" class="tag">
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.ticket-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.ticket-title {
  flex: 1;
}

.ticket-id {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
}

.ticket-title h3 {
  margin: 0.25rem 0 0 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.ticket-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.action-btn.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

.ticket-description {
  color: #4b5563;
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-group {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.category {
  background: #6366f1;
  color: white;
}

.meta-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.8125rem;
  color: #6b7280;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: #374151;
}

.time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.work-result {
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 3px solid #667eea;
}

.result-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.result-content {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

.department-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.dept-badge, .requester-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #4b5563;
}

.dept-badge:hover, .requester-badge:hover {
  background: #e5e7eb;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.create-time, .update-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ticket-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag:hover {
  background: #e5e7eb;
}
</style>
