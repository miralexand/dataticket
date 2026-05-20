<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket'
import Button from '@/components/ui/Button.vue'

interface Props {
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  filter: [filters: {
    status?: TicketStatus
    priority?: TicketPriority
    category?: TicketCategory
    search?: string
    finishOperator?: string
    startDate?: string
    endDate?: string
    finishStartDate?: string
    finishEndDate?: string
    workType?: string
  }]
  reset: []
}>()

const status = ref<TicketStatus | ''>('')
const priority = ref<TicketPriority | ''>('')
const category = ref<TicketCategory | ''>('')
const search = ref('')
const finishOperator = ref('')
const startDate = ref('')
const endDate = ref('')
const finishStartDate = ref('')
const finishEndDate = ref('')
const workType = ref('')

const statuses: Array<{ value: TicketStatus; label: string }> = [
  { value: 'pending' as TicketStatus, label: '待处理' },
  { value: 'progress' as TicketStatus, label: '进行中' },
  { value: 'resolved' as TicketStatus, label: '已解决' },
  { value: 'closed' as TicketStatus, label: '已关闭' },
]

const priorities: Array<{ value: TicketPriority; label: string }> = [
  { value: 'low' as TicketPriority, label: '低' },
  { value: 'medium' as TicketPriority, label: '中' },
  { value: 'high' as TicketPriority, label: '高' },
  { value: 'urgent' as TicketPriority, label: '紧急' },
]

const categories: Array<{ value: TicketCategory; label: string }> = [
  { value: 'system_failure' as TicketCategory, label: '系统故障' },
  { value: 'device_failure' as TicketCategory, label: '设备报修' },
  { value: 'network_issue' as TicketCategory, label: '网络问题' },
  { value: 'software_request' as TicketCategory, label: '软件需求' },
  { value: 'data_query' as TicketCategory, label: '数据查询' },
  { value: 'account_issue' as TicketCategory, label: '账号问题' },
  { value: 'other' as TicketCategory, label: '其他' },
]

const applyFilters = () => {
  const filters: {
    status?: TicketStatus
    priority?: TicketPriority
    category?: TicketCategory
    search?: string
    finishOperator?: string
    startDate?: string
    endDate?: string
    finishStartDate?: string
    finishEndDate?: string
    workType?: string
  } = {}

  if (status.value) filters.status = status.value as TicketStatus
  if (priority.value) filters.priority = priority.value as TicketPriority
  if (category.value) filters.category = category.value as TicketCategory
  if (search.value.trim()) filters.search = search.value.trim()
  if (finishOperator.value.trim()) filters.finishOperator = finishOperator.value.trim()
  if (startDate.value) filters.startDate = startDate.value
  if (endDate.value) filters.endDate = endDate.value
  if (finishStartDate.value) filters.finishStartDate = finishStartDate.value
  if (finishEndDate.value) filters.finishEndDate = finishEndDate.value
  if (workType.value) filters.workType = workType.value

  emit('filter', filters)
}

const resetFilters = () => {
  status.value = ''
  priority.value = ''
  category.value = ''
  search.value = ''
  finishOperator.value = ''
  startDate.value = ''
  endDate.value = ''
  finishStartDate.value = ''
  finishEndDate.value = ''
  workType.value = ''
  emit('reset')
}

// 防抖搜索 - 仅在搜索框变化时触发
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // 只有当搜索框有内容时才自动应用筛选
    if (newVal.trim()) {
      applyFilters()
    } else if (!status.value && !priority.value && !category.value && !finishOperator.value && !startDate.value && !endDate.value && !finishStartDate.value && !finishEndDate.value && !workType.value) {
      // 如果搜索框清空且没有其他筛选，重置筛选
      emit('reset')
    }
  }, 300)
})
</script>

<template>
  <div class="ticket-filter">
    <div class="filter-header">
      <h3>🔍 筛选工单</h3>
      <span v-if="status || priority || category || search" class="active-filters">
        已应用筛选
      </span>
    </div>

    <div class="filter-row">
      <div class="filter-group search-group">
        <label for="search">🔍 搜索</label>
        <input
          id="search"
          v-model="search"
          type="text"
          placeholder="搜索标题、描述、科室、申请人..."
          :disabled="loading"
        />
        <span v-if="search" class="search-hint">自动搜索中...</span>
      </div>

      <div class="filter-group">
        <label for="status">📊 状态</label>
        <select id="status" v-model="status" @change="applyFilters" :disabled="loading">
          <option value="">全部状态</option>
          <option v-for="s in statuses" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="priority">⚡ 优先级</label>
        <select id="priority" v-model="priority" @change="applyFilters" :disabled="loading">
          <option value="">全部优先级</option>
          <option v-for="p in priorities" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="category">📁 分类</label>
        <select id="category" v-model="category" @change="applyFilters" :disabled="loading">
          <option value="">全部分类</option>
          <option v-for="c in categories" :key="c.value" :value="c.value">
            {{ c.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 新增筛选行 -->
    <div class="filter-row">
      <div class="filter-group">
        <label for="workType">📋 工单类型</label>
        <select id="workType" v-model="workType" @change="applyFilters" :disabled="loading">
          <option value="">全部类型</option>
          <option value="simple">简单工单</option>
          <option value="technical">技术工单</option>
          <option value="bug">故障报修</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="finishOperator">👤 处理人</label>
        <input
          id="finishOperator"
          v-model="finishOperator"
          type="text"
          placeholder="输入处理人姓名"
          :disabled="loading"
        />
      </div>

      <div class="filter-group">
        <label for="startDate">📅 创建开始</label>
        <input
          id="startDate"
          v-model="startDate"
          type="date"
          :disabled="loading"
        />
      </div>

      <div class="filter-group">
        <label for="endDate">📅 创建结束</label>
        <input
          id="endDate"
          v-model="endDate"
          type="date"
          :disabled="loading"
        />
      </div>
    </div>

    <!-- 完成时间筛选行 -->
    <div class="filter-row">
      <div class="filter-group">
        <label for="finishStartDate">✅ 完成开始</label>
        <input
          id="finishStartDate"
          v-model="finishStartDate"
          type="date"
          :disabled="loading"
        />
      </div>

      <div class="filter-group">
        <label for="finishEndDate">✅ 完成结束</label>
        <input
          id="finishEndDate"
          v-model="finishEndDate"
          type="date"
          :disabled="loading"
        />
      </div>

      <div class="filter-group" style="grid-column: span 2;"></div>
    </div>

    <div class="filter-actions">
      <Button variant="secondary" @click="resetFilters" :disabled="loading">
        🔄 重置筛选
      </Button>
      <Button @click="applyFilters" :loading="loading">
        ✅ 应用筛选
      </Button>
    </div>
  </div>
</template>

<style scoped>
.ticket-filter {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.active-filters {
  font-size: 0.875rem;
  color: #4f46e5;
  font-weight: 500;
  background: #eef2ff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.search-group {
  grid-column: span 2;
}

.search-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

input,
select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled,
select:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
}
</style>
