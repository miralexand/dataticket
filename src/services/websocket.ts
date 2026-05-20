/**
 * WebSocket 服务模块
 * 用于实时通信和工单状态更新
 */

import { useAuthStore } from '@/stores/auth'
import { useTicketStore } from '@/stores/ticket'
import { useNotification } from '@/composables/useNotification'

export interface WebSocketMessage {
  type: string
  data?: any
  timestamp?: number
  userId?: string
  ticketId?: string
}

export interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private isConnected = false
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  private authStore = useAuthStore()
  private ticketStore = useTicketStore()
  private notification: any

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    }
    this.notification = useNotification()
  }

  /**
   * 连接 WebSocket
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已连接')
      return
    }

    try {
      this.ws = new WebSocket(this.config.url)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleNetworkError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (err) {
      console.error('WebSocket 连接失败:', err)
      this.notification.error('WebSocket 连接失败')
    }
  }

  /**
   * 处理连接打开
   */
  private handleOpen(event: Event): void {
    console.log('WebSocket 连接已建立')
    this.isConnected = true
    this.reconnectAttempts = 0

    // 启动心跳
    this.startHeartbeat()

    // 通知用户
    this.notification.success('WebSocket 连接已建立')
  }

  /**
   * 处理消息接收
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      console.log('收到 WebSocket 消息:', message)

      this.handleMessageType(message)
    } catch (err) {
      console.error('解析 WebSocket 消息失败:', err)
    }
  }

  /**
   * 根据消息类型处理
   */
  private handleMessageType(message: WebSocketMessage): void {
    switch (message.type) {
      case 'ticket_created':
        this.handleTicketCreated(message)
        break

      case 'ticket_updated':
        this.handleTicketUpdated(message)
        break

      case 'ticket_assigned':
        this.handleTicketAssigned(message)
        break

      case 'ticket_status_changed':
        this.handleTicketStatusChanged(message)
        break

      case 'notification':
        this.handleNotification(message)
        break

      case 'error':
        this.handleError(message)
        break

      default:
        console.log('未知消息类型:', message.type)
    }
  }

  /**
   * 处理工单创建
   */
  private handleTicketCreated(message: WebSocketMessage): void {
    const ticket = message.data
    if (ticket) {
      // 更新工单列表
      this.ticketStore.tickets.unshift(ticket)
      this.ticketStore.total++

      // 通知用户
      this.notification.success(`新工单已创建: ${ticket.title || '未知工单'}`)

      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('ticket_created', { detail: ticket }))
    }
  }

  /**
   * 处理工单更新
   */
  private handleTicketUpdated(message: WebSocketMessage): void {
    const ticket = message.data
    if (ticket) {
      // 更新本地工单
      const index = this.ticketStore.tickets.findIndex(t => t.id === ticket.id)
      if (index !== -1) {
        this.ticketStore.tickets[index] = ticket
      }
      
      // 通知用户
      this.notification.info(`工单已更新: ${ticket.title}`)
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('ticket_updated', { detail: ticket }))
    }
  }

  /**
   * 处理工单分配
   */
  private handleTicketAssigned(message: WebSocketMessage): void {
    const { ticketId, assigneeName } = message.data || {}
    if (ticketId && assigneeName) {
      this.notification.info(`工单 ${ticketId} 已分配给 ${assigneeName}`)
    }
  }

  /**
   * 处理工单状态变更
   */
  private handleTicketStatusChanged(message: WebSocketMessage): void {
    const ticketId = message.data?.ticketId
    const status = message.data?.status
    const operator = message.data?.operator

    if (ticketId && status) {
      this.notification.info(`工单 ${ticketId} 状态变更为 ${status} (操作人: ${operator})`)

      // 更新本地工单状态
      const index = this.ticketStore.tickets.findIndex(t => t.id === ticketId)
      if (index !== -1 && this.ticketStore.tickets[index]) {
        this.ticketStore.tickets[index].status = status
      }
    }
  }

  /**
   * 处理通知消息（兼容 MatrixOrigWeb 格式）
   */
  private handleNotification(message: WebSocketMessage): void {
    const data = message.data || {}

    // 从 MatrixOrigWeb 格式转换
    const ticketId = data.workOrderId || data.id || data.ticketId
    const title = data.workOrderTitle || data.title
    const content = data.workOrderContent || data.content || data.description
    const creator = data.creator || data.requesterName
    const priority = data.priority || 'medium'
    const status = data.status || 'pending'
    const createTime = data.createTime || data.createdAt

    console.log('收到工单通知:', data)

    // 构建工单对象
    const ticket = {
      id: (ticketId || 'ticket_' + Date.now()).toString(),
      title: (title || '未知工单').toString(),
      description: (content || '').toString(),
      status: this.mapStatusFromBackend(status) as any,
      priority: this.mapPriorityFromBackend(priority) as any,
      category: 'other' as any,
      department: (data.department || '未知科室').toString(),
      requesterId: (data.requesterId || creator || 'user_mock').toString(),
      requesterName: (creator || '当前用户').toString(),
      phone: data.phone || '',
      location: data.location || '',
      urgencyNote: data.urgencyNote || '',
      tags: data.tags || [],
      attachments: data.attachments || [],
      createdAt: createTime ? new Date(createTime) : new Date(),
      updatedAt: new Date(),
      workResult: data.workResult || '',
      workContent: (content || '').toString(),
      workType: (data.workType || 'other') as any
    }

    // 更新工单列表
    this.ticketStore.tickets.unshift(ticket)
    this.ticketStore.total++

    // 显示通知
    this.notification.info(`新工单: ${title}`, { duration: 5000 })

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('ticket_created', { detail: ticket }))
  }

  /**
   * 根据优先级获取样式类
   */
  private getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      urgent: 'urgent'
    }
    return priorityMap[priority] || 'low'
  }

  /**
   * 从后端状态映射到前端状态
   */
  private mapStatusFromBackend(status: string): string {
    const statusMap: Record<string, string> = {
      '待处理': 'pending',
      'pending': 'pending',
      '处理中': 'progress',
      'progress': 'progress',
      '已完成': 'resolved',
      'resolved': 'resolved',
      '已解决': 'resolved',
      '已关闭': 'closed',
      'closed': 'closed'
    }
    return statusMap[status] || 'pending'
  }

  /**
   * 从后端优先级映射到前端优先级
   */
  private mapPriorityFromBackend(priority: string): string {
    const priorityMap: Record<string, string> = {
      '低': 'low',
      'low': 'low',
      '中': 'medium',
      'medium': 'medium',
      '高': 'high',
      'high': 'high',
      '紧急': 'urgent',
      'urgent': 'urgent'
    }
    return priorityMap[priority] || 'medium'
  }

  /**
   * 处理错误消息
   */
  private handleError(message: WebSocketMessage): void {
    const errorData = message.data || {}
    const code = errorData.code || errorData.status || 'UNKNOWN'
    const msg = errorData.msg || errorData.message || '未知错误'

    console.error('WebSocket 错误消息:', errorData)

    // 显示错误通知
    if (code === 404 && msg.includes('heartbeat')) {
      // 心跳错误，静默处理
      console.log('心跳消息不被支持，已忽略')
    } else {
      this.notification.error(`WebSocket 错误: ${msg} (代码: ${code})`)
    }
  }

  /**
   * 处理网络错误
   */
  private handleNetworkError(event: Event): void {
    console.error('WebSocket 网络错误:', event)
    this.notification.error('WebSocket 连接错误')
  }

  /**
   * 处理连接关闭
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket 连接已关闭', event.code, event.reason)
    this.isConnected = false

    // 停止心跳
    this.stopHeartbeat()

    // 尝试重连
    this.attemptReconnect()
  }

  /**
   * 发送认证信息（后端不支持，已移除）
   */
  private sendAuth(): void {
    // 后端不支持 auth 消息类型，已移除
  }

  /**
   * 发送消息
   */
  send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接，无法发送消息')
      return
    }

    try {
      this.ws.send(JSON.stringify(message))
    } catch (err) {
      console.error('发送 WebSocket 消息失败:', err)
    }
  }

  /**
   * 发送工单创建消息（兼容 MatrixOrigWeb 格式）
   */
  sendTicketCreated(ticket: any): void {
    // 转换为 MatrixOrigWeb 期望的格式
    const notificationData = {
      type: 'notification',
      workOrderId: ticket.id,
      workOrderTitle: ticket.title,
      workOrderContent: ticket.description || ticket.workContent,
      creator: ticket.requesterName,
      priority: ticket.priority,
      status: ticket.status,
      department: ticket.department,
      phone: ticket.phone,
      location: ticket.location,
      urgencyNote: ticket.urgencyNote,
      workType: ticket.workType,
      workResult: ticket.workResult,
      tags: ticket.tags,
      attachments: ticket.attachments,
      createTime: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : new Date().toLocaleString(),
      timestamp: Date.now()
    }

    this.send(notificationData)
  }

  /**
   * 发送工单创建消息（简化版，仅包含必要信息）
   */
  sendTicketCreatedSimple(ticket: any): void {
    const notificationData = {
      type: 'notification',
      workOrderId: ticket.id,
      workOrderTitle: ticket.title,
      workOrderContent: ticket.description || ticket.workContent,
      creator: ticket.requesterName,
      priority: ticket.priority,
      status: ticket.status,
      department: ticket.department,
      workType: ticket.workType,
      createTime: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : new Date().toLocaleString(),
      timestamp: Date.now()
    }

    this.send(notificationData)
  }

  /**
   * 发送工单更新消息
   */
  sendTicketUpdated(ticket: any): void {
    this.send({
      type: 'ticket_updated',
      data: ticket,
      timestamp: Date.now()
    })
  }

  /**
   * 发送工单状态变更消息
   */
  sendTicketStatusChanged(ticketId: string, status: string, operator: string): void {
    this.send({
      type: 'ticket_status_changed',
      data: {
        ticketId,
        status,
        operator,
        timestamp: Date.now()
      }
    })
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        // 发送空消息作为心跳，避免触发错误
        // 后端可能不支持心跳，我们只保持连接
        console.log('WebSocket 心跳')
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('达到最大重连次数，停止重连')
      this.notification.error('WebSocket 连接失败，请检查网络')
      return
    }

    this.reconnectAttempts++
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval)
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.stopHeartbeat()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.isConnected = false
    console.log('WebSocket 已断开连接')
  }

  /**
   * 获取连接状态
   */
  get connected(): boolean {
    return this.isConnected
  }

  /**
   * 获取重连次数
   */
  get reconnectCount(): number {
    return this.reconnectAttempts
  }
}

// 单例实例
let wsInstance: WebSocketService | null = null

/**
 * 获取 WebSocket 服务实例
 */
export function getWebSocketService(): WebSocketService {
  if (!wsInstance) {
    wsInstance = new WebSocketService({
      url: 'ws://192.168.0.124:8083/ws',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    })
  }
  return wsInstance
}

/**
 * 初始化 WebSocket 连接
 */
export function initWebSocket(): void {
  const service = getWebSocketService()
  if (!service.connected) {
    service.connect()
  }
}

/**
 * 断开 WebSocket 连接
 */
export function disconnectWebSocket(): void {
  if (wsInstance) {
    wsInstance.disconnect()
    wsInstance = null
  }
}

/**
 * 发送工单创建消息
 */
export function sendTicketCreated(ticket: any): void {
  const service = getWebSocketService()
  service.sendTicketCreated(ticket)
}

/**
 * 发送工单更新消息
 */
export function sendTicketUpdated(ticket: any): void {
  const service = getWebSocketService()
  service.sendTicketUpdated(ticket)
}

/**
 * 发送工单状态变更消息
 */
export function sendTicketStatusChanged(ticketId: string, status: string, operator: string): void {
  const service = getWebSocketService()
  service.sendTicketStatusChanged(ticketId, status, operator)
}
