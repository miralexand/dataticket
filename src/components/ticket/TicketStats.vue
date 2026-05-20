<script setup lang="ts">
interface Props {
  total: number
  pending: number
  inProgress: number
  resolved: number
  activeFilter?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filter: [status: string]
}>()

const handleStatClick = (status: string) => {
  emit('filter', status)
}

const stats = [
  {
    label: '总工单',
    value: 'total',
    icon: '📊',
    color: '#667eea',
    status: 'all',
  },
  {
    label: '待处理',
    value: 'pending',
    icon: '⏳',
    color: '#f59e0b',
    status: 'pending',
  },
  {
    label: '进行中',
    value: 'inProgress',
    icon: '🔄',
    color: '#3b82f6',
    status: 'progress',
  },
  {
    label: '已解决',
    value: 'resolved',
    icon: '✅',
    color: '#10b981',
    status: 'resolved',
  },
]

const getStatValue = (key: string) => {
  switch (key) {
    case 'total': return props.total
    case 'pending': return props.pending
    case 'inProgress': return props.inProgress
    case 'resolved': return props.resolved
    default: return 0
  }
}

</script>

<template>
  <div class="ticket-stats">
    <div
      v-for="stat in stats"
      :key="stat.value"
      class="stat-card"
      :class="{ active: activeFilter === stat.status }"
      :style="{ '--stat-color': stat.color }"
      @click="handleStatClick(stat.status)"
      role="button"
      tabindex="0"
      @keydown.enter="handleStatClick(stat.status)"
      @keydown.space.prevent="handleStatClick(stat.status)"
    >
      <div class="stat-icon">{{ stat.icon }}</div>
      <div class="stat-content">
        <div class="stat-value">{{ getStatValue(stat.value) }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  width: 100%;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--stat-color);
}

.stat-card.active {
  border-color: var(--stat-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(102, 126, 234, 0.1));
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.stat-card:focus {
  outline: 2px solid var(--stat-color);
  outline-offset: 2px;
}

.stat-icon {
  font-size: 2rem;
  filter: grayscale(0.2);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--stat-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 640px) {
  .ticket-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
