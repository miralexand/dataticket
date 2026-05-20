<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { Ticket } from '@/types/ticket'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// 时间范围类型
export type TimeRange = 'week' | 'month' | 'quarter'

const props = defineProps<{
  tickets: Ticket[]
  timeRange?: TimeRange
}>()

const timeRange = ref<TimeRange>(props.timeRange || 'week')

watch(() => props.timeRange, (newVal) => {
  if (newVal) {
    timeRange.value = newVal
  }
})

// 根据时间范围获取天数
const getRangeDays = () => {
  switch (timeRange.value) {
    case 'month': return 30
    case 'quarter': return 90
    default: return 7
  }
}

// ===== 柱状图：工单趋势 =====
const trendChartData = computed(() => {
  const days = getRangeDays()
  const labels: string[] = []
  const counts: number[] = []

  // 根据时间范围设置数据点数量和间隔
  let totalPoints: number
  let dayInterval: number

  if (timeRange.value === 'week') {
    // 7天，每天一个点
    totalPoints = 7
    dayInterval = 1
  } else if (timeRange.value === 'month') {
    // 30天，每5天一个点（6个点）
    totalPoints = 6
    dayInterval = 5
  } else {
    // 90天，每15天一个点（6个点）
    totalPoints = 6
    dayInterval = 15
  }

  for (let i = totalPoints - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i * dayInterval)

    const label = date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
    labels.push(label)

    // 计算该时间段的工单数
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + dayInterval)

    const count = props.tickets.filter(t => {
      const createdAt = new Date(t.createdAt)
      return createdAt >= startDate && createdAt < endDate
    }).length

    counts.push(count)
  }

  const bgColors = counts.map(v => v > 0 ? 'rgba(99, 102, 241, 0.7)' : 'rgba(229, 231, 235, 0.5)')
  const borderColors = counts.map(v => v > 0 ? 'rgba(99, 102, 241, 1)' : 'rgba(209, 213, 219, 1)')

  const intervalLabel = timeRange.value === 'week' ? '每日' : (timeRange.value === 'month' ? '每5天' : '每15天')

  return {
    labels,
    datasets: [{
      label: `${intervalLabel}新增`,
      data: counts,
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: 1,
      borderRadius: 6,
      barThickness: timeRange.value === 'week' ? 32 : 40
    }]
  }
})

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}

// ===== 折线图：处理效率 =====
const efficiencyChartData = computed(() => {
  const totalPoints = timeRange.value === 'week' ? 7 : (timeRange.value === 'month' ? 6 : 6)
  const labels: string[] = []
  const created: number[] = []
  const resolved: number[] = []
  
  for (let i = totalPoints - 1; i >= 0; i--) {
    let date: Date
    let label: string
    let startDate: Date
    let endDate: Date
    
    if (timeRange.value === 'week') {
      date = new Date()
      date.setDate(date.getDate() - i)
      label = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
    } else if (timeRange.value === 'month') {
      date = new Date()
      date.setDate(date.getDate() - i * 5)
      label = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 5)
    } else {
      date = new Date()
      date.setDate(date.getDate() - i * 15)
      label = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 15)
    }
    
    labels.push(label)
    
    const createdCount = props.tickets.filter(t => {
      const createdAt = new Date(t.createdAt)
      return createdAt >= startDate && createdAt < endDate
    }).length
    
    const resolvedCount = props.tickets.filter(t => {
      if (t.status !== 'resolved' && t.status !== 'closed') return false
      const updatedAt = new Date(t.updatedAt)
      return updatedAt >= startDate && updatedAt < endDate
    }).length
    
    created.push(createdCount)
    resolved.push(resolvedCount)
  }
  
  const rangeLabels = {
    week: ['新增', '已解决'],
    month: ['每5天新增', '每5天解决'],
    quarter: ['每15天新增', '每15天解决']
  }
  
  return {
    labels,
    datasets: [
      {
        label: rangeLabels[timeRange.value][0],
        data: created,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: rangeLabels[timeRange.value][1],
        data: resolved,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const efficiencyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}

// ===== 饼图：工单分类分布 =====
const categoryChartData = computed(() => {
  const categoryMap: Record<string, number> = {}
  const colors = [
    'rgba(255,192,203)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(107, 114, 128, 0.8)'
  ]
  
  const labels: Record<string, string> = {
    system_failure: '日常维护',
    device_failure: '技术支持',
    network_issue: '网络问题',
    software_request: '软件需求',
    data_query: '数据查询',
    account_issue: '账号问题',
    other: '功能请求'
  }
  
  props.tickets.forEach(t => {
    const category = t.category || 'other'
    categoryMap[category] = (categoryMap[category] || 0) + 1
  })
  
  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
  
  return {
    labels: sortedCategories.map(([key]) => labels[key] || key),
    datasets: [{
      data: sortedCategories.map(([, count]) => count),
      backgroundColor: colors.slice(0, sortedCategories.length),
      borderWidth: 0
    }]
  }
})

const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        boxWidth: 12,
        padding: 8,
        font: { size: 11 }
      }
    }
  }
}

// ===== 环形图：工单状态分布 =====
const statusChartData = computed(() => {
  const statusMap: Record<string, number> = {}
  
  props.tickets.forEach(t => {
    const status = t.status || 'pending'
    statusMap[status] = (statusMap[status] || 0) + 1
  })
  
  const labels: Record<string, string> = {
    pending: '待处理',
    progress: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  
  const colors: Record<string, string> = {
    pending: 'rgba(245, 158, 11, 0.8)',
    progress: 'rgba(59, 130, 246, 0.8)',
    resolved: 'rgba(16, 185, 129, 0.8)',
    closed: 'rgba(107, 114, 128, 0.8)'
  }
  
  const sortedStatuses = Object.entries(statusMap)
    .sort((a, b) => b[1] - a[1])
  
  return {
    labels: sortedStatuses.map(([key]) => labels[key] || key),
    datasets: [{
      data: sortedStatuses.map(([, count]) => count),
      backgroundColor: sortedStatuses.map(([key]) => colors[key] || 'rgba(107, 114, 128, 0.8)'),
      borderWidth: 0
    }]
  }
})

const statusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 12,
        font: { size: 11 }
      }
    }
  },
  cutout: '60%'
}

// ===== 环形图：优先级分布 =====
const priorityChartData = computed(() => {
  const priorityMap: Record<string, number> = {}
  
  props.tickets.forEach(t => {
    const priority = t.priority || 'medium'
    priorityMap[priority] = (priorityMap[priority] || 0) + 1
  })
  
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  
  const colors: Record<string, string> = {
    low: 'rgba(16, 185, 129, 0.8)',
    medium: 'rgba(59, 130, 246, 0.8)',
    high: 'rgba(245, 158, 11, 0.8)',
    urgent: 'rgba(239, 68, 68, 0.8)'
  }
  
  const sortedPriorities = Object.entries(priorityMap)
    .sort((a, b) => b[1] - a[1])
  
  return {
    labels: sortedPriorities.map(([key]) => labels[key] || key),
    datasets: [{
      data: sortedPriorities.map(([, count]) => count),
      backgroundColor: sortedPriorities.map(([key]) => colors[key] || 'rgba(107, 114, 128, 0.8)'),
      borderWidth: 0
    }]
  }
})

const priorityChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 12,
        font: { size: 11 }
      }
    }
  },
  cutout: '60%'
}

// ===== 时间范围标题 =====
const rangeTitle = computed(() => {
  switch (timeRange.value) {
    case 'week': return '📈 最近7天工单趋势'
    case 'month': return '📈 最近30天工单趋势'
    case 'quarter': return '📈 最近90天工单趋势'
    default: return '📈 工单趋势'
  }
})

const efficiencyTitle = computed(() => {
  switch (timeRange.value) {
    case 'week': return '⚡ 7天处理效率对比'
    case 'month': return '⚡ 30天处理效率对比'
    case 'quarter': return '⚡ 90天处理效率对比'
    default: return '⚡ 处理效率对比'
  }
})
</script>

<template>
  <div class="charts-container">
    <!-- 柱状图：工单趋势（放大版） -->
    <div class="chart-card chart-trend">
      <h3>{{ rangeTitle }}</h3>
      <div class="chart-wrapper chart-wrapper-large">
        <Bar :data="trendChartData" :options="trendChartOptions" />
      </div>
    </div>

    <!-- 折线图：处理效率 -->
    <div class="chart-card chart-line">
      <h3>{{ efficiencyTitle }}</h3>
      <div class="chart-wrapper">
        <Line :data="efficiencyChartData" :options="efficiencyChartOptions" />
      </div>
    </div>

    <!-- 饼图：分类分布 -->
    <div class="chart-card chart-pie">
      <h3>📂 工单分类</h3>
      <div class="chart-wrapper">
        <Doughnut :data="categoryChartData" :options="categoryChartOptions" />
      </div>
    </div>

    <!-- 环形图：状态分布 -->
    <div class="chart-card chart-doughnut">
      <h3>📊 状态分布</h3>
      <div class="chart-wrapper">
        <Doughnut :data="statusChartData" :options="statusChartOptions" />
      </div>
    </div>

    <!-- 环形图：优先级分布 -->
    <div class="chart-card chart-doughnut">
      <h3>🔢 优先级分布</h3>
      <div class="chart-wrapper">
        <Doughnut :data="priorityChartData" :options="priorityChartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.chart-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
}

.chart-wrapper {
  height: 220px;
  position: relative;
}

/* 放大版趋势图 */
.chart-wrapper-large {
  height: 320px;
}

/* 趋势图占两列 */
.chart-trend {
  grid-column: span 2;
}

/* 折线图占两列 */
.chart-line {
  grid-column: span 2;
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-trend,
  .chart-line {
    grid-column: span 2;
  }

  .chart-wrapper-large {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart-trend,
  .chart-line {
    grid-column: span 1;
  }

  .chart-wrapper {
    height: 200px;
  }

  .chart-wrapper-large {
    height: 250px;
  }
}

/* 暗黑模式支持 */
:global(.dark-mode) .chart-card {
  background: #16213e;
  border: 1px solid #2a2a4a;
}

:global(.dark-mode) .chart-card h3 {
  color: #e8e8e8;
}
</style>
