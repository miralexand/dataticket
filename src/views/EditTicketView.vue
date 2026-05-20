<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import TicketForm from '@/components/ticket/TicketForm.vue'
import Button from '@/components/ui/Button.vue'
import type { Ticket, UpdateTicketInput, CreateTicketInput } from '@/types/ticket'
import { getWebSocketService } from '@/services/websocket'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()
const authStore = useAuthStore()
const { success, error: showError } = useNotification()

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
      error.value = '工单未找到'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载工单失败'
    showError('加载工单失败')
  } finally {
    loading.value = false
  }
}

// 处理工单更新
const handleUpdateTicket = async (formData: CreateTicketInput | UpdateTicketInput) => {
  if (!ticket.value) return

  loading.value = true

  try {
    // 构建更新数据 - 只提取 UpdateTicketInput 需要的字段
    const updateData: UpdateTicketInput = {
      title: formData.title,
      description: formData.description,
      priority: typeof formData.priority === 'string' && !['low', 'medium', 'high', 'urgent'].includes(formData.priority)
        ? undefined
        : formData.priority as UpdateTicketInput['priority'],
      category: formData.category,
      department: formData.department,
      phone: formData.phone,
      location: formData.location,
      urgencyNote: formData.urgencyNote,
      tags: formData.tags,
      workType: formData.workType,
      workContent: formData.workContent,
      workResult: formData.workResult,
      // 自动记录处理人
      assigneeId: authStore.user?.id,
      assigneeName: authStore.user?.name
    }

    // 调用 store 更新工单
    const updatedTicket = await ticketStore.updateTicket(ticket.value.id, updateData)

    // 发送 WebSocket 通知
    const wsService = getWebSocketService()
    if (wsService) {
      wsService.sendTicketUpdated(updatedTicket)

      // 如果状态变更，发送状态变更通知 (status 只存在于 UpdateTicketInput)
      if ('status' in formData && formData.status && formData.status !== ticket.value.status) {
        wsService.sendTicketStatusChanged(
          updatedTicket.id,
          formData.status,
          authStore.user?.name || '未知用户'
        )
      }
    }

    success('工单更新成功')
    
    // 1.5秒后跳转到详情页
    setTimeout(() => {
      router.push(`/tickets/${updatedTicket.id}`)
    }, 1500)
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新工单失败'
    showError(message)
  } finally {
    loading.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  if (ticket.value) {
    router.push(`/tickets/${ticket.value.id}`)
  } else {
    router.push('/tickets')
  }
}

// 检查权限
const checkPermission = () => {
  if (!canEdit.value) {
    showError('您没有权限编辑此工单')
    router.push('/tickets')
  }
}

onMounted(() => {
  checkPermission()
  loadTicket()
})
</script>

<template>
  <div class="edit-ticket-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>编辑工单</h1>
        <div class="header-actions">
          <Button variant="secondary" @click="cancelEdit" :disabled="loading">
            取消
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

    <!-- 编辑表单 -->
    <div v-else-if="ticket" class="edit-form-container">
      <TicketForm
        :ticket="ticket"
        mode="edit"
        :loading="loading"
        @submit="handleUpdateTicket"
        @cancel="cancelEdit"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>工单不存在</h3>
      <p>该工单可能已被删除或不存在</p>
      <Button @click="cancelEdit">返回列表</Button>
    </div>
  </div>
</template>

<style scoped>
.edit-ticket-view {
  padding: 2rem;
  max-width: 800px;
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

/* 编辑表单容器 */
.edit-form-container {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .edit-ticket-view {
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

  .edit-form-container {
    padding: 1rem;
  }
}
</style>
