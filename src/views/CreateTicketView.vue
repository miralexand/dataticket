<template>
  <div class="create-ticket-view">
    <div class="page-header">
      <div class="header-content">
        <h1>创建新工单</h1>
        <p>填写工单信息，提交后系统将自动同步到服务器</p>
        <div :class="['ws-status', wsConnected ? 'connected' : 'disconnected']">
          <span class="status-dot"></span>
          {{ wsConnected ? 'WebSocket 已连接' : 'WebSocket 未连接' }}
        </div>
      </div>
      <div class="header-actions">
        <Button variant="secondary" @click="handleCancel" :disabled="isSubmitting">
          取消
        </Button>
      </div>
    </div>

    <div class="form-container">
      <TicketForm
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import TicketForm from '@/components/ticket/TicketForm.vue'
import Button from '@/components/ui/Button.vue'
import type { CreateTicketInput } from '@/types/ticket'
import { initWebSocket, disconnectWebSocket, getWebSocketService } from '@/services/websocket'

const router = useRouter()
const ticketStore = useTicketStore()
const authStore = useAuthStore()
const { success, error: showError, info } = useNotification()

const isSubmitting = ref(false)
const wsConnected = ref(false)

// 监听 WebSocket 事件
const handleTicketCreated = (event: CustomEvent) => {
  const ticket = event.detail
  info(`新工单已创建: ${ticket.title}`)
}

const handleTicketUpdated = (event: CustomEvent) => {
  const ticket = event.detail
  info(`工单已更新: ${ticket.title}`)
}

onMounted(() => {
  // 初始化 WebSocket 连接
  if (authStore.isAuthenticated) {
    initWebSocket()

    // 检查连接状态
    const wsService = getWebSocketService()
    wsConnected.value = wsService.connected

    // 监听自定义事件
    window.addEventListener('ticket_created', handleTicketCreated as EventListener)
    window.addEventListener('ticket_updated', handleTicketUpdated as EventListener)

    // 定期检查连接状态
    const interval = setInterval(() => {
      wsConnected.value = wsService.connected
    }, 5000)

    // 清理定时器
    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('ticket_created', handleTicketCreated as EventListener)
  window.removeEventListener('ticket_updated', handleTicketUpdated as EventListener)
})

const handleSubmit = async (data: CreateTicketInput | any) => {
  isSubmitting.value = true

  try {
    const ticket = await ticketStore.createTicket(data as CreateTicketInput)
    success(`工单 "${ticket.title}" 创建成功！`)

    // 显示 WebSocket 状态
    if (wsConnected.value) {
      info('WebSocket 连接正常，工单已同步到服务器')
    } else {
      info('WebSocket 未连接，工单将在下次连接时同步')
    }

    // 1.5秒后跳转到详情页
    setTimeout(() => {
      router.push(`/tickets/${ticket.id}`)
    }, 1500)
  } catch (err) {
    showError('创建失败: ' + (err instanceof Error ? err.message : '未知错误'))
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.create-ticket-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-content h1::before {
  content: "📋";
  font-size: 1.5rem;
}

.header-content p {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.9375rem;
}

.header-actions {
  flex-shrink: 0;
}

.form-container {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ws-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.ws-status.connected {
  background: #d1fae5;
  color: #065f46;
}

.ws-status.disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 768px) {
  .create-ticket-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-container {
    padding: 1.25rem;
  }
}
</style>
