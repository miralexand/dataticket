import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketQueryParams, TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket'
import type { Department } from '@/types/auth'
import { ticketAPI } from '@/services/api'
import { useAuthStore } from './auth'

export const useTicketStore = defineStore('ticket', () => {
  const authStore = useAuthStore()

  // 状态
  const tickets = ref<Ticket[]>([])
  const allTickets = ref<Ticket[]>([]) // 保存所有工单用于统计
  const currentTicket = ref<Ticket | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref(1)

  // 计算属性 - 基于所有工单计算统计数据
  const totalTickets = computed(() => allTickets.value.length)
  const pendingTickets = computed(() => allTickets.value.filter(t => t.status === 'pending').length)
  const inProgressTickets = computed(() => allTickets.value.filter(t => t.status === 'progress').length)
  const resolvedTickets = computed(() => allTickets.value.filter(t => t.status === 'resolved').length)
  const pagination = computed(() => ({
    page: page.value,
    limit: limit.value,
    total: total.value,
    totalPages: totalPages.value
  }))

  // 生成唯一ID
  const generateId = (): string => {
    return `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 创建工单
  const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
    if (!authStore.isAuthenticated) {
      error.value = '请先登录'
      throw new Error('请先登录')
    }

    loading.value = true
    error.value = null

    try {
      const token = authStore.token!
      const newTicket = await ticketAPI.create(input, token)

      tickets.value.unshift(newTicket)
      total.value++

      return newTicket
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建工单失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取工单列表
  const fetchTickets = async (params: TicketQueryParams = {}): Promise<Ticket[]> => {
    if (!authStore.isAuthenticated) {
      error.value = '请先登录'
      throw new Error('请先登录')
    }

    loading.value = true
    error.value = null

    try {
      const token = authStore.token!
      const response = await ticketAPI.list(params, token)

      tickets.value = response.tickets
      total.value = response.total
      page.value = response.page
      limit.value = response.limit
      totalPages.value = response.totalPages

      // 如果没有筛选条件（即获取所有工单），更新 allTickets 用于统计
      // 如果有时间范围筛选，也更新 allTickets 用于统计
      const hasTimeFilter = params.startDate || params.endDate || params.finishStartDate || params.finishEndDate
      if (!params.status && !params.priority && !params.category && !params.search &&
          !params.finishOperator && !params.workType) {
        allTickets.value = response.tickets
      } else if (hasTimeFilter && !params.status && !params.priority && !params.category &&
                 !params.search && !params.finishOperator && !params.workType) {
        // 如果只有时间筛选，也更新统计数据
        allTickets.value = response.tickets
      }

      return response.tickets
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取工单列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个工单
  const fetchTicketById = async (id: string): Promise<Ticket | null> => {
    if (!authStore.isAuthenticated) {
      error.value = '请先登录'
      throw new Error('请先登录')
    }

    loading.value = true
    error.value = null

    try {
      const token = authStore.token!
      const ticket = await ticketAPI.get(id, token)
      currentTicket.value = ticket

      return ticket
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取工单失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新工单
  const updateTicket = async (id: string, updates: UpdateTicketInput): Promise<Ticket> => {
    if (!authStore.isAuthenticated) {
      error.value = '请先登录'
      throw new Error('请先登录')
    }

    loading.value = true
    error.value = null

    try {
      const token = authStore.token!
      const updatedTicket = await ticketAPI.update(id, updates, token)

      // 更新本地列表
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = updatedTicket
      }

      // 更新当前工单
      if (currentTicket.value?.id === id) {
        currentTicket.value = updatedTicket
      }

      return updatedTicket
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新工单失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除工单
  const deleteTicket = async (id: string): Promise<void> => {
    if (!authStore.isAuthenticated) {
      error.value = '请先登录'
      throw new Error('请先登录')
    }

    loading.value = true
    error.value = null

    try {
      const token = authStore.token!
      await ticketAPI.delete(id, token)

      // 从本地列表移除
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value.splice(index, 1)
        total.value--
      }

      // 清除当前工单
      if (currentTicket.value?.id === id) {
        currentTicket.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除工单失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 分配工单
  const assignTicket = async (id: string, assigneeId: string): Promise<Ticket> => {
    if (!authStore.isAuthenticated) {
      error.value = '请先登录'
      throw new Error('请先登录')
    }

    loading.value = true
    error.value = null

    try {
      const token = authStore.token!
      const updatedTicket = await ticketAPI.assign(id, assigneeId, token)

      // 更新本地列表
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = updatedTicket
      }

      // 更新当前工单
      if (currentTicket.value?.id === id) {
        currentTicket.value = updatedTicket
      }

      return updatedTicket
    } catch (err) {
      error.value = err instanceof Error ? err.message : '分配工单失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新工单状态
  const updateTicketStatus = async (id: string, status: TicketStatus): Promise<Ticket> => {
    return updateTicket(id, { status })
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 重置当前工单
  const resetCurrentTicket = () => {
    currentTicket.value = null
  }


  return {
    // 状态
    tickets,
    allTickets,
    currentTicket,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,

    // 计算属性
    totalTickets,
    pendingTickets,
    inProgressTickets,
    resolvedTickets,
    pagination,

    // 方法
    createTicket,
    fetchTickets,
    fetchTicketById,
    updateTicket,
    deleteTicket,
    assignTicket,
    updateTicketStatus,
    clearError,
    resetCurrentTicket,
  }
})
