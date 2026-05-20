<script setup lang="ts">
import { computed, ref } from 'vue'
import TicketCard from './TicketCard.vue'
import TicketRow from './TicketRow.vue'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket'

interface Props {
  tickets: Ticket[]
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: '暂无工单数据',
})

const emit = defineEmits<{
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

// 显示模式：'card' 或 'list'
const displayMode = ref<'card' | 'list'>('card')

const hasTickets = computed(() => props.tickets.length > 0)

// 切换显示模式
const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'card' ? 'list' : 'card'
}
</script>

<template>
  <div class="ticket-list">
    <!-- 显示模式切换 -->
    <div v-if="hasTickets" class="display-mode-switch">
      <button
        :class="['mode-btn', { active: displayMode === 'card' }]"
        @click="toggleDisplayMode"
        title="卡片视图"
      >
        📊 卡片
      </button>
      <button
        :class="['mode-btn', { active: displayMode === 'list' }]"
        @click="toggleDisplayMode"
        title="列表视图"
      >
        📋 列表
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!hasTickets" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>{{ emptyMessage }}</p>
    </div>

    <div v-else>
      <!-- 卡片视图 -->
      <div v-if="displayMode === 'card'" class="tickets-grid">
        <TicketCard
          v-for="ticket in tickets"
          :key="ticket.id"
          :ticket="ticket"
          @view="emit('view', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>

      <!-- 列表视图 -->
      <div v-else class="tickets-table">
        <TicketRow
          v-for="ticket in tickets"
          :key="ticket.id"
          :ticket="ticket"
          @view="emit('view', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-list {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #6b7280;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.125rem;
  margin: 0;
}

.display-mode-switch {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.mode-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.mode-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.mode-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.tickets-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .tickets-grid {
    grid-template-columns: 1fr;
  }

  .display-mode-switch {
    flex-direction: row;
  }
}
</style>
