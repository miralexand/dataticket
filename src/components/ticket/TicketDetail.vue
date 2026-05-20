<script setup lang="ts">
import { computed } from 'vue'
import type { Ticket } from '@/types/ticket'
import Button from '@/components/ui/Button.vue'

interface Props {
  ticket: Ticket
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [id: string]
  delete: [id: string]
}>()

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  progress: '#3b82f6',
  resolved: '#10b981',
  closed: '#6b7280',
}

const priorityColors: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#dc2626',
}

const categoryLabels: Record<string, string> = {
  technical: '技术问题',
  billing: '账单问题',
  feature: '功能请求',
  bug: 'Bug 报告',
  other: '其他',
}

const statusLabels: Record<string, string> = {
  pending: '待处理',
  progress: '进行中',
  resolved: '已解决',
  closed: '已关闭',
}

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ticketInfo = computed(() => [
  {
    label: '工单编号',
    value: props.ticket.id,
  },
  {
    label: '创建时间',
    value: formatDate(props.ticket.createdAt),
  },
  {
    label: '更新时间',
    value: formatDate(props.ticket.updatedAt),
  },
  {
    label: '关闭时间',
    value: props.ticket.closedAt ? formatDate(props.ticket.closedAt) : '-',
  },
])
</script>

<template>
  <div class="ticket-detail">
    <div class="ticket-header">
      <div class="header-content">
        <span class="ticket-id">#{{ ticket.id.split('-')[1] }}</span>
        <h2>{{ ticket.title }}</h2>
      </div>
      <div class="header-actions">
        <Button variant="secondary" @click="$emit('close')" :disabled="loading">
          关闭
        </Button>
        <Button variant="ghost" @click="$emit('edit', ticket.id)" :disabled="loading">
          编辑
        </Button>
        <Button variant="danger" @click="$emit('delete', ticket.id)" :disabled="loading">
          删除
        </Button>
      </div>
    </div>

    <div class="ticket-content">
      <div class="section">
        <h3>描述</h3>
        <p class="description">{{ ticket.description }}</p>
      </div>

      <div class="section">
        <h3>状态信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">状态</span>
            <span class="badge" :style="{ background: statusColors[ticket.status] }">
              {{ statusLabels[ticket.status] }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">优先级</span>
            <span class="badge" :style="{ background: priorityColors[ticket.priority] }">
              {{ priorityLabels[ticket.priority] }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">分类</span>
            <span class="badge category">
              {{ categoryLabels[ticket.category] }}
            </span>
          </div>
          <div class="info-item" v-if="ticket.assigneeName">
            <span class="label">负责人</span>
            <span class="assignee">👤 {{ ticket.assigneeName }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>详细信息</h3>
        <div class="info-list">
          <div v-for="info in ticketInfo" :key="info.label" class="info-row">
            <span class="info-label">{{ info.label }}</span>
            <span class="info-value">{{ info.value }}</span>
          </div>
        </div>
      </div>

      <div v-if="ticket.tags.length > 0" class="section">
        <h3>标签</h3>
        <div class="tags">
          <span v-for="tag in ticket.tags" :key="tag" class="tag">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-detail {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.header-content {
  flex: 1;
}

.ticket-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  margin-right: 0.5rem;
}

.ticket-header h2 {
  margin: 0.5rem 0 0 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.ticket-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1.5rem;
}

.section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.description {
  margin: 0;
  line-height: 1.7;
  color: #4b5563;
  white-space: pre-wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  align-self: flex-start;
}

.badge.category {
  background: #6366f1;
  color: white;
}

.assignee {
  font-weight: 600;
  color: #374151;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.9375rem;
}

.info-value {
  color: #374151;
  font-weight: 500;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.tag:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .ticket-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
