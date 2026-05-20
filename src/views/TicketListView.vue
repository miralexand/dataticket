<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useNotification } from '@/composables/useNotification'
import TicketList from '@/components/ticket/TicketList.vue'
import TicketFilter from '@/components/ticket/TicketFilter.vue'
import TicketStats from '@/components/ticket/TicketStats.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import type { TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket'

const router = useRouter()
const ticketStore = useTicketStore()
const { success, error: showError, info } = useNotification()

const showFilter = ref(false)
const activeStatusFilter = ref<string>('all')
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)

const tickets = computed(() => ticketStore.tickets)
const loading = computed(() => ticketStore.loading)
const error = computed(() => ticketStore.error)

const stats = computed(() => ({
  total: ticketStore.totalTickets,
  pending: ticketStore.pendingTickets,
  inProgress: ticketStore.inProgressTickets,
  resolved: ticketStore.resolvedTickets,
}))

// 搜索功能
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(async () => {
    try {
      const filters: any = {}

      if (searchQuery.value.trim()) {
        filters.search = searchQuery.value.trim()
      }

      if (activeStatusFilter.value !== 'all') {
        filters.status = activeStatusFilter.value
      }

      await ticketStore.fetchTickets(filters)

      if (searchQuery.value.trim()) {
        info(`搜索: "${searchQuery.value}"`)
      }
    } catch (err) {
      showError('搜索失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }, 300) // 防抖 300ms
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const handleCreate = () => {
  router.push('/tickets/create')
}

const handleView = (id: string) => {
  router.push(`/tickets/${id}`)
}

const handleEdit = (id: string) => {
  router.push(`/tickets/${id}/edit`)
}

const handleDelete = async (id: string) => {
  if (confirm('确定要删除这个工单吗？此操作无法撤销。')) {
    try {
      await ticketStore.deleteTicket(id)
      success('工单已删除')
      // 刷新列表
      await ticketStore.fetchTickets()
    } catch (err) {
      showError('删除失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }
}

const handleFilter = async (filters: {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  search?: string
}) => {
  try {
    await ticketStore.fetchTickets(filters)
    const filterCount = Object.keys(filters).length
    if (filterCount > 0) {
      info(`已应用 ${filterCount} 个筛选条件`)
    }
  } catch (err) {
    showError('筛选失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}

const handleReset = async () => {
  try {
    activeStatusFilter.value = 'all'
    searchQuery.value = ''
    await ticketStore.fetchTickets()
    success('筛选已重置')
  } catch (err) {
    showError('重置失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}

// 处理统计卡片点击
const handleStatFilter = async (status: string) => {
  try {
    activeStatusFilter.value = status

    // 根据点击的状态进行筛选
    const filters: any = {}

    if (status !== 'all') {
      filters.status = status
    }

    if (searchQuery.value.trim()) {
      filters.search = searchQuery.value.trim()
    }

    await ticketStore.fetchTickets(filters)

    if (status === 'all') {
      info('显示所有工单')
    } else {
      const statusLabels = {
        'pending': '待处理',
        'progress': '进行中',
        'resolved': '已解决'
      }
      info(`已筛选: ${statusLabels[status as keyof typeof statusLabels] || status}`)
    }
  } catch (err) {
    showError('筛选失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
}

// 监听搜索输入变化
watch(searchQuery, () => {
  handleSearch()
})

onMounted(async () => {
  try {
    // 先获取所有工单用于统计
    await ticketStore.fetchTickets()
    info('欢迎使用工单系统！')
  } catch (err) {
    showError('加载工单失败: ' + (err instanceof Error ? err.message : '未知错误'))
  }
})
</script>

<template>
  <div class="ticket-list-view">
    <div class="page-header">
      <div class="header-content">
        <h1>工单管理</h1>
        <p>管理和跟踪所有工单</p>
      </div>
      <div class="header-actions">
        <Button variant="secondary" @click="showFilter = !showFilter">
          {{ showFilter ? '隐藏筛选' : '显示筛选' }}
        </Button>
        <Button @click="handleCreate">
          + 创建工单
        </Button>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <Input
        v-model="searchQuery"
        placeholder="搜索工单标题、描述、编号..."
        :disabled="loading"
        clearable
        @clear="clearSearch"
      />
      <div class="search-hint">
        <span v-if="searchQuery">搜索: "{{ searchQuery }}"</span>
        <span v-else>输入关键词实时搜索</span>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      <span>⚠️</span>
      <span>{{ error }}</span>
    </div>

    <TicketStats
      :total="stats.total"
      :pending="stats.pending"
      :in-progress="stats.inProgress"
      :resolved="stats.resolved"
      :active-filter="activeStatusFilter"
      @filter="handleStatFilter"
    />

    <TicketFilter
      v-if="showFilter"
      :loading="loading"
      @filter="handleFilter"
      @reset="handleReset"
    />

    <TicketList
      :tickets="tickets"
      :loading="loading"
      empty-message="暂无工单，点击右上角按钮创建第一个工单"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped>
.ticket-list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-content h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.header-content p {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.9375rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* 搜索框 */
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-hint {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0 0.25rem;
}

.search-hint span {
  font-weight: 500;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .ticket-list-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .header-actions button {
    flex: 1;
  }

  .search-bar {
    width: 100%;
  }
}
</style>
