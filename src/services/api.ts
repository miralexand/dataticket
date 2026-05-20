/**
 * API 服务
 * 所有请求使用 POST 方法
 * 针对医院信息科业务场景
 */

import type { LoginRequest, LoginResponse, RegisterRequest, UserInfo, Department, UserRole } from '@/types/auth'
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketQueryParams, TicketListResponse, WorkType } from '@/types/ticket'
import { TicketStatus, TicketPriority, TicketCategory, WorkTypeLabels } from '@/types/ticket'
import { EncodedUtil } from '@/utils/EncodedUtil'
import { sendTicketCreated, sendTicketUpdated, sendTicketStatusChanged } from '@/services/websocket'

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.124:8083'
const API_TIMEOUT = 30000

// 请求配置
interface RequestOptions {
  token?: string
  headers?: Record<string, string>
}

// 通用 POST 请求函数
async function postRequest<T>(
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (options.token) {
    headers['Authorization'] = options.token
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(API_TIMEOUT)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

// 认证相关 API
export const authAPI = {
  // 登录
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // 密码编码：Base64(密码 + 密钥 + 账号)
    const encodedPassword = EncodedUtil.encodeToBase64(data.password, data.username)

    // 构建 URL 参数：account=账号&pass=编码后的密码
    const url = `${API_BASE_URL}/api/loginQuery?account=${encodeURIComponent(data.username)}&pass=${encodeURIComponent(encodedPassword)}`

    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(API_TIMEOUT)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.handleType) {
      throw new Error(result.handleMessage || '登录失败')
    }

    // 转换响应数据
    const userData = result.handleData
    const userInfo: UserInfo = {
      id: userData.uAccount,
      username: userData.uAccount,
      name: userData.uName,
      role: userData.authority_key || 'doctor',
      department: userData.department_name || '未分配',
      phone: userData.uTel || '',
      email: userData.email || '',
      avatar: userData.headerImageUrl || ''
    }

    const token = 'Bearer_' + Date.now() + '_' + userData.uAccount
    localStorage.setItem('ticket_system_token', token)
    localStorage.setItem('ticket_system_user', JSON.stringify(userInfo))

    return {
      token,
      user: userInfo,
      expiresIn: 3600
    }
  },

  // 注册
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const formData = new URLSearchParams()
    formData.append('account', data.username)
    formData.append('pass', data.password)
    formData.append('name', data.name)
    formData.append('role', data.role)
    formData.append('department', data.department)
    formData.append('phone', data.phone || '')
    formData.append('email', data.email || '')

    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-form-urlencoded'
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(API_TIMEOUT)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.handleType) {
      throw new Error(result.handleMessage || '注册失败')
    }

    // 转换响应数据
    const userData = result.handleData
    const userInfo: UserInfo = {
      id: (userData.uAccount as string) ?? data.username,
      username: (userData.uAccount as string) ?? data.username,
      name: (userData.uName as string) ?? data.name,
      role: (userData.authority_key as UserRole) ?? data.role,
      department: (userData.department_name as Department) ?? data.department,
      phone: (userData.uTel as string) ?? data.phone,
      email: (userData.email as string) ?? data.email,
      avatar: (userData.headerImageUrl as string) ?? ''
    }

    const token = 'Bearer_' + Date.now() + '_' + ((userData.uAccount as string) ?? data.username)
    localStorage.setItem('ticket_system_token', token)
    localStorage.setItem('ticket_system_user', JSON.stringify(userInfo))

    return {
      token,
      user: userInfo,
      expiresIn: 3600
    }
  },

  // 验证 Token
  verify: async (token: string): Promise<UserInfo> => {
    const response = await fetch(`${API_BASE_URL}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(API_TIMEOUT)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.handleType) {
      throw new Error(result.handleMessage || 'Token验证失败')
    }

    // 转换响应数据
    const userData = result.handleData
    const userInfo: UserInfo = {
      id: userData.uAccount,
      username: userData.uAccount,
      name: userData.uName,
      role: userData.authority_key || 'doctor',
      department: userData.department_name || '未分配',
      phone: userData.uTel || '',
      email: userData.email || '',
      avatar: userData.headerImageUrl || ''
    }

    return userInfo
  }
}

// 工单相关 API
export const ticketAPI = {
  // 创建工单
  create: async (data: CreateTicketInput, token: string): Promise<Ticket> => {
    try {
      // 构建请求数据，完全兼容 MatrixOrigWeb 格式
      const requestData = {
        title: data.workTitle || data.title,  // 优先使用 workTitle
        type: data.workType || ticketAPI.mapCategoryToWorkType(data.category),
        priority: data.priority,  // 直接使用传入的优先级（中文）
        department: data.department,
        description: data.description,
        phone: data.phone || '',
        location: data.location || '',
        urgencyNote: data.urgencyNote || '',
        workResult: data.workResult || '',
        workContent: data.workContent || data.description,
        tags: data.tags && data.tags.length > 0 ? data.tags.join(',') : '',
        attachments: data.attachments && data.attachments.length > 0 ? data.attachments.join(',') : ''
      }

      const response = await fetch(`${API_BASE_URL}/api/getWorkInfos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(API_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      console.log('API 响应结果:', result)

      if (!result.handleType) {
        throw new Error(result.handleMessage || '创建工单失败')
      }

      // 转换响应数据
      const ticketData = result.handleData
      const ticket: Ticket = {
        id: ticketData?.id?.toString() || ticketData?.workID || ticketData?.ticket_id || 'ticket_' + Date.now(),
        title: ticketData?.workTitle || ticketData?.title,
        description: ticketData?.workContent || ticketData?.description || data.description,
        status: ticketAPI.mapStatusFromBackend(ticketData?.workStatus || ticketData?.status),
        priority: ticketAPI.mapPriorityFromBackend(ticketData?.priority),
        category: ticketAPI.mapWorkTypeToCategory(ticketData?.workType || ticketData?.type),
        department: ticketData?.department || data.department,
        requesterId: ticketData?.requesterId || ticketData?.creator || 'user_mock',
        requesterName: ticketData?.requesterName || ticketData?.creator || '当前用户',
        phone: ticketData?.phone || data.phone,
        location: ticketData?.location || data.location,
        urgencyNote: ticketData?.urgencyNote || data.urgencyNote,
        assigneeId: ticketData?.assigneeId || ticketData?.finishOperator,
        assigneeName: ticketData?.assigneeName || ticketData?.finishOperator,
        tags: ticketData.tags || data.tags || [],
        attachments: ticketData.attachments || data.attachments || [],
        createdAt: ticketData.createTime ? new Date(ticketData.createTime) : (ticketData.createDate ? new Date(ticketData.createDate) : new Date()),
        updatedAt: ticketData.updateTime ? new Date(ticketData.updateTime) : (ticketData.finishDate ? new Date(ticketData.finishDate) : new Date()),
        closedAt: ticketData.closedAt ? new Date(ticketData.closedAt) : undefined,
        // 扩展字段
        workResult: ticketData.workResult || data.workResult,
        finishOperator: ticketData.finishOperator,
        workContent: ticketData.workContent || data.description,
        workType: ticketData.workType || data.workType
      }

      // 通过 WebSocket 发送工单创建消息（兼容 MatrixOrigWeb 格式）
      // 注意：这里发送的是通知消息，用于实时同步
      sendTicketCreated(ticket)

      return ticket
    } catch (error) {
      console.error('创建工单失败:', error)
      throw error
    }
  },

  // 映射分类到工单类型
  mapCategoryToWorkType: (category: TicketCategory): WorkType => {
    const map: Record<TicketCategory, WorkType> = {
      [TicketCategory.SYSTEM_FAILURE]: 'bug',
      [TicketCategory.DEVICE_FAILURE]: 'technical',
      [TicketCategory.NETWORK_ISSUE]: 'bug',
      [TicketCategory.SOFTWARE_REQUEST]: 'feature',
      [TicketCategory.DATA_QUERY]: 'simple',
      [TicketCategory.ACCOUNT_ISSUE]: 'simple',
      [TicketCategory.OTHER]: 'other'
    }
    return map[category] || 'other'
  },

  // 映射工单类型到分类
  mapWorkTypeToCategory: (workType: string | WorkType): TicketCategory => {
    const map: Record<WorkType, TicketCategory> = {
      simple: TicketCategory.OTHER,
      technical: TicketCategory.DEVICE_FAILURE,
      billing: TicketCategory.OTHER,
      feature: TicketCategory.SOFTWARE_REQUEST,
      bug: TicketCategory.SYSTEM_FAILURE,
      other: TicketCategory.OTHER
    }
    return map[workType as WorkType] || TicketCategory.OTHER
  },

  // 映射优先级到中文标签
  mapPriorityToLabel: (priority: TicketPriority): string => {
    const map: Record<TicketPriority, string> = {
      [TicketPriority.LOW]: '低',
      [TicketPriority.MEDIUM]: '中',
      [TicketPriority.HIGH]: '高',
      [TicketPriority.URGENT]: '紧急'
    }
    return map[priority] || '中'
  },

  // 从后端映射优先级
  mapPriorityFromBackend: (priority: string): TicketPriority => {
    const map: Record<string, TicketPriority> = {
      '低': TicketPriority.LOW,
      '中': TicketPriority.MEDIUM,
      '高': TicketPriority.HIGH,
      '紧急': TicketPriority.URGENT,
      'low': TicketPriority.LOW,
      'medium': TicketPriority.MEDIUM,
      'high': TicketPriority.HIGH,
      'urgent': TicketPriority.URGENT
    }
    return map[priority] || TicketPriority.MEDIUM
  },

  // 从后端映射状态
  mapStatusFromBackend: (status: string): TicketStatus => {
    const map: Record<string, TicketStatus> = {
      '待处理': TicketStatus.PENDING,
      '处理中': TicketStatus.IN_PROGRESS,
      '已完成': TicketStatus.RESOLVED,
      '已解决': TicketStatus.RESOLVED,
      '已关闭': TicketStatus.CLOSED,
      'pending': TicketStatus.PENDING,
      'progress': TicketStatus.IN_PROGRESS,
      'resolved': TicketStatus.RESOLVED,
      'closed': TicketStatus.CLOSED
    }
    return map[status] || TicketStatus.PENDING
  },

  // 获取工单列表
  list: async (params: TicketQueryParams, token: string): Promise<TicketListResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queryAllWorks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          status: params.status || 'all',
          priority: params.priority,
          category: params.category,
          department: params.department,
          assigneeId: params.assigneeId,
          requesterId: params.requesterId,
          search: params.search,
          page: params.page || 1,
          pageSize: params.limit || 10,
          // 新增筛选参数
          finishOperator: params.finishOperator,
          startDate: params.startDate,
          endDate: params.endDate,
          finishStartDate: params.finishStartDate,
          finishEndDate: params.finishEndDate,
          workType: params.workType
        }),
        signal: AbortSignal.timeout(API_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // 检查响应状态 - 支持多种响应格式
      if (!result.handleType && !result.success) {
        throw new Error(result.handleMessage || result.message || '获取工单列表失败')
      }

      // 转换响应数据 - 支持多种格式：数组或对象
      // API返回的数据结构可能是：result.content 或 result.handleData
      const ticketList = Array.isArray(result.content) ? result.content :
                        Array.isArray(result.handleData) ? result.handleData :
                        (result.handleData?.list || result.handleData?.content || [])
      const tickets: Ticket[] = ticketList.map((ticketData: any) => {
        // 映射状态
        let status: TicketStatus = TicketStatus.PENDING
        const statusMap: Record<string, TicketStatus> = {
          '待处理': TicketStatus.PENDING,
          '处理中': TicketStatus.IN_PROGRESS,
          '已完成': TicketStatus.RESOLVED,
          '已解决': TicketStatus.RESOLVED,
          '已关闭': TicketStatus.CLOSED,
          'pending': TicketStatus.PENDING,
          'progress': TicketStatus.IN_PROGRESS,
          'resolved': TicketStatus.RESOLVED,
          'closed': TicketStatus.CLOSED
        }
        status = statusMap[ticketData.workStatus || ticketData.status] || TicketStatus.PENDING

        // 映射优先级
        let priority: TicketPriority = TicketPriority.MEDIUM
        const priorityMap: Record<string, TicketPriority> = {
          '低': TicketPriority.LOW,
          '中': TicketPriority.MEDIUM,
          '高': TicketPriority.HIGH,
          '紧急': TicketPriority.URGENT,
          'low': TicketPriority.LOW,
          'medium': TicketPriority.MEDIUM,
          'high': TicketPriority.HIGH,
          'urgent': TicketPriority.URGENT
        }
        priority = priorityMap[ticketData.priority] || TicketPriority.MEDIUM

        // 映射分类
        let category: TicketCategory = TicketCategory.OTHER
        const categoryMap: Record<string, TicketCategory> = {
          'simple': TicketCategory.SYSTEM_FAILURE,
          'technical': TicketCategory.DEVICE_FAILURE,
          'bug': TicketCategory.SYSTEM_FAILURE,
          'other': TicketCategory.OTHER,
          '系统故障': TicketCategory.SYSTEM_FAILURE,
          '设备报修': TicketCategory.DEVICE_FAILURE,
          '网络问题': TicketCategory.NETWORK_ISSUE,
          '软件需求': TicketCategory.SOFTWARE_REQUEST,
          '数据查询': TicketCategory.DATA_QUERY,
          '账号问题': TicketCategory.ACCOUNT_ISSUE,
          '其他': TicketCategory.OTHER
        }
        category = categoryMap[ticketData.workType || ticketData.type] || TicketCategory.OTHER

        return {
          id: ticketData.id?.toString() || ticketData.workID || ticketData.ticket_id,
          title: ticketData.title || ticketData.workTitle,
          description: ticketData.description || ticketData.workContent || '',
          status,
          priority,
          category,
          department: ticketData.department || 'other',
          requesterId: ticketData.requesterId || ticketData.creator || 'user_mock',
          requesterName: ticketData.requesterName || ticketData.creator || '当前用户',
          phone: ticketData.phone,
          location: ticketData.location,
          urgencyNote: ticketData.urgencyNote,
          assigneeId: ticketData.assigneeId || ticketData.finishOperator || ticketData.workAssignee,
          assigneeName: ticketData.assigneeName || ticketData.finishOperator || ticketData.workAssignee,
          tags: ticketData.tags || [],
          attachments: ticketData.attachments || [],
          createdAt: ticketData.createTime ? new Date(ticketData.createTime) : (ticketData.createDate ? new Date(ticketData.createDate) : new Date()),
          updatedAt: ticketData.updateTime ? new Date(ticketData.updateTime) : (ticketData.finishDate ? new Date(ticketData.finishDate) : new Date()),
          closedAt: ticketData.closedAt ? new Date(ticketData.closedAt) : undefined,
          // 扩展字段：工单结果
          workResult: ticketData.workResult,
          // 扩展字段：处理人
          finishOperator: ticketData.finishOperator,
          // 扩展字段：工单内容
          workContent: ticketData.workContent
        }
      })

      // 客户端筛选逻辑（因为后端可能不支持所有筛选条件）
      let filteredTickets = tickets

      // 状态筛选
      if (params.status) {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === params.status)
      }

      // 优先级筛选
      if (params.priority) {
        filteredTickets = filteredTickets.filter(ticket => ticket.priority === params.priority)
      }

      // 分类筛选
      if (params.category) {
        filteredTickets = filteredTickets.filter(ticket => ticket.category === params.category)
      }

      // 工单类型筛选
      if (params.workType) {
        filteredTickets = filteredTickets.filter(ticket => {
          // 根据 workType 映射到 category
          const workTypeMap: Record<string, string> = {
            'simple': 'system_failure',
            'technical': 'device_failure',
            'bug': 'system_failure',
            'other': 'other'
          }
          const expectedCategory = workTypeMap[params.workType!]
          return ticket.category === expectedCategory
        })
      }

      // 处理人筛选
      if (params.finishOperator) {
        const operatorLower = params.finishOperator.toLowerCase()
        filteredTickets = filteredTickets.filter(ticket =>
          (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(operatorLower)) ||
          (ticket.finishOperator && ticket.finishOperator.toLowerCase().includes(operatorLower))
        )
      }

      // 创建时间范围筛选
      if (params.startDate || params.endDate) {
        filteredTickets = filteredTickets.filter(ticket => {
          const ticketDate = ticket.createdAt
          let passStart = true
          let passEnd = true

          if (params.startDate) {
            const startDate = new Date(params.startDate)
            startDate.setHours(0, 0, 0, 0)
            passStart = ticketDate >= startDate
          }

          if (params.endDate) {
            const endDate = new Date(params.endDate)
            endDate.setHours(23, 59, 59, 999)
            passEnd = ticketDate <= endDate
          }

          return passStart && passEnd
        })
      }

      // 完成时间范围筛选
      if (params.finishStartDate || params.finishEndDate) {
        filteredTickets = filteredTickets.filter(ticket => {
          // 只筛选已完成的工单
          if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
            return false
          }

          // 使用 finishDate 或 updatedAt 作为完成时间
          const finishDate = ticket.updatedAt
          let passStart = true
          let passEnd = true

          if (params.finishStartDate) {
            const startDate = new Date(params.finishStartDate)
            startDate.setHours(0, 0, 0, 0)
            passStart = finishDate >= startDate
          }

          if (params.finishEndDate) {
            const endDate = new Date(params.finishEndDate)
            endDate.setHours(23, 59, 59, 999)
            passEnd = finishDate <= endDate
          }

          return passStart && passEnd
        })
      }

      // 关键字搜索（标题、描述、科室、申请人、处理人）
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredTickets = filteredTickets.filter(ticket =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.department.toLowerCase().includes(searchLower) ||
          ticket.requesterName.toLowerCase().includes(searchLower) ||
          (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(searchLower)) ||
          (ticket.workContent && ticket.workContent.toLowerCase().includes(searchLower)) ||
          (ticket.workResult && ticket.workResult.toLowerCase().includes(searchLower))
        )
      }

      return {
        tickets: filteredTickets,
        total: filteredTickets.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(filteredTickets.length / (params.limit || 10))
      }
    } catch (error) {
      console.error('获取工单列表失败:', error)
      throw error
    }
  },

  // 获取单个工单
  get: async (id: string, token: string): Promise<Ticket> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queryWorkContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ id: parseInt(id) || id }),
        signal: AbortSignal.timeout(API_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.handleType) {
        throw new Error(result.handleMessage || '获取工单详情失败')
      }

      // 转换响应数据
      const ticketData = result.handleData
      return {
        id: ticketData.id?.toString() || ticketData.ticket_id,
        title: ticketData.title,
        description: ticketData.description || '',
        status: ticketData.status || TicketStatus.PENDING,
        priority: ticketData.priority || TicketPriority.MEDIUM,
        category: ticketData.type || TicketCategory.OTHER,
        department: ticketData.department || 'other',
        requesterId: ticketData.requesterId || 'user_mock',
        requesterName: ticketData.requesterName || '当前用户',
        phone: ticketData.phone,
        location: ticketData.location,
        urgencyNote: ticketData.urgencyNote,
        assigneeId: ticketData.assigneeId,
        assigneeName: ticketData.assigneeName,
        tags: ticketData.tags || [],
        attachments: ticketData.attachments || [],
        createdAt: ticketData.createTime ? new Date(ticketData.createTime) : new Date(),
        updatedAt: ticketData.updateTime ? new Date(ticketData.updateTime) : new Date(),
        closedAt: ticketData.closedAt ? new Date(ticketData.closedAt) : undefined
      }
    } catch (error) {
      console.error('获取工单详情失败:', error)
      throw error
    }
  },

  // 更新工单
  update: async (id: string, data: UpdateTicketInput, token: string): Promise<Ticket> => {
    try {
      const response = await fetch(`${API_BASE_URL}/WorkApi/updateWorkOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          id: parseInt(id) || id,
          ...data
        }),
        signal: AbortSignal.timeout(API_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.handleType) {
        throw new Error(result.handleMessage || '更新工单失败')
      }

      // 转换响应数据
      const ticketData = result.handleData
      return {
        id: ticketData.id?.toString() || ticketData.ticket_id,
        title: ticketData.title,
        description: ticketData.description || '',
        status: ticketData.status || TicketStatus.PENDING,
        priority: ticketData.priority || TicketPriority.MEDIUM,
        category: ticketData.type || TicketCategory.OTHER,
        department: ticketData.department || 'other',
        requesterId: ticketData.requesterId || 'user_mock',
        requesterName: ticketData.requesterName || '当前用户',
        phone: ticketData.phone,
        location: ticketData.location,
        urgencyNote: ticketData.urgencyNote,
        assigneeId: ticketData.assigneeId,
        assigneeName: ticketData.assigneeName,
        tags: ticketData.tags || [],
        attachments: ticketData.attachments || [],
        createdAt: ticketData.createTime ? new Date(ticketData.createTime) : new Date(),
        updatedAt: ticketData.updateTime ? new Date(ticketData.updateTime) : new Date(),
        closedAt: ticketData.closedAt ? new Date(ticketData.closedAt) : undefined
      }
    } catch (error) {
      console.error('更新工单失败:', error)
      throw error
    }
  },

  // 删除工单
  delete: async (id: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/WorkApi/deleteWorkOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ id: parseInt(id) || id }),
        signal: AbortSignal.timeout(API_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.handleType) {
        throw new Error(result.handleMessage || '删除工单失败')
      }
    } catch (error) {
      console.error('删除工单失败:', error)
      throw error
    }
  },

  // 分配工单
  assign: async (id: string, assigneeId: string, token: string): Promise<Ticket> => {
    try {
      const response = await fetch(`${API_BASE_URL}/WorkApi/assignWorkOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ id: parseInt(id) || id, assigneeId }),
        signal: AbortSignal.timeout(API_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

    if (!result.handleType) {
      throw new Error(result.handleMessage || '分配工单失败')
    }

    // 转换响应数据
    const ticketData = result.handleData
    return {
      id: ticketData.id?.toString() || ticketData.ticket_id,
      title: ticketData.title,
      description: ticketData.description || '',
      status: ticketData.status || TicketStatus.IN_PROGRESS,
      priority: ticketData.priority || TicketPriority.MEDIUM,
      category: ticketData.type || TicketCategory.OTHER,
      department: ticketData.department || 'other',
      requesterId: ticketData.requesterId || 'user_mock',
      requesterName: ticketData.requesterName || '当前用户',
      assigneeId: ticketData.assigneeId || assigneeId,
      assigneeName: ticketData.assigneeName || '处理人',
      tags: ticketData.tags || [],
      attachments: ticketData.attachments || [],
      createdAt: ticketData.createTime ? new Date(ticketData.createTime) : new Date(),
      updatedAt: ticketData.updateTime ? new Date(ticketData.updateTime) : new Date()
    }
    } catch (error) {
      console.error('分配工单失败:', error)
      throw error
    }
  }
}

// 统计相关 API
export const statsAPI = {
  // 获取统计信息
  getStats: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/ticket/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(API_TIMEOUT)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.handleType) {
      throw new Error(result.handleMessage || '获取统计信息失败')
    }

    return result.handleData
  }
}
