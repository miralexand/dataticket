/**
 * 工单系统类型定义
 * 针对医院信息科业务场景优化
 */

export type { Department, DepartmentLabels, UserRole } from './auth'
import type { Department } from './auth'

// 工单状态
export enum TicketStatus {
  PENDING = 'pending',      // 待处理
  IN_PROGRESS = 'progress', // 进行中
  RESOLVED = 'resolved',    // 已解决
  CLOSED = 'closed',        // 已关闭
}

// 工单状态映射（用于显示）
export const TicketStatusLabels: Record<TicketStatus, string> = {
  [TicketStatus.PENDING]: '待处理',
  [TicketStatus.IN_PROGRESS]: '处理中',
  [TicketStatus.RESOLVED]: '已解决',
  [TicketStatus.CLOSED]: '已关闭'
}

// 工单优先级
export enum TicketPriority {
  LOW = 'low',       // 低
  MEDIUM = 'medium', // 中
  HIGH = 'high',     // 高
  URGENT = 'urgent', // 紧急
}

// 工单优先级映射（用于显示）
export const TicketPriorityLabels: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: '低',
  [TicketPriority.MEDIUM]: '中',
  [TicketPriority.HIGH]: '高',
  [TicketPriority.URGENT]: '紧急'
}

// 工单分类（针对医院场景优化）
export enum TicketCategory {
  SYSTEM_FAILURE = 'system_failure',    // 系统故障
  DEVICE_FAILURE = 'device_failure',    // 设备报修
  NETWORK_ISSUE = 'network_issue',      // 网络问题
  SOFTWARE_REQUEST = 'software_request',// 软件需求
  DATA_QUERY = 'data_query',            // 数据查询
  ACCOUNT_ISSUE = 'account_issue',      // 账号问题
  OTHER = 'other',                      // 其他
}

// 工单分类映射（用于显示）
export const TicketCategoryLabels: Record<TicketCategory, string> = {
  [TicketCategory.SYSTEM_FAILURE]: '系统故障',
  [TicketCategory.DEVICE_FAILURE]: '设备报修',
  [TicketCategory.NETWORK_ISSUE]: '网络问题',
  [TicketCategory.SOFTWARE_REQUEST]: '软件需求',
  [TicketCategory.DATA_QUERY]: '数据查询',
  [TicketCategory.ACCOUNT_ISSUE]: '账号问题',
  [TicketCategory.OTHER]: '其他'
}

// 工单类型（兼容 MatrixOrigWeb）
export type WorkType = 'simple' | 'technical' | 'billing' | 'feature' | 'bug' | 'other'

// 工单类型映射（用于显示）
export const WorkTypeLabels: Record<WorkType, string> = {
  simple: '日常维护',
  technical: '技术支持',
  billing: '财务问题',
  feature: '功能请求',
  bug: '故障报告',
  other: '其他'
}

// 工单基础接口
export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  department: Department  // 申请科室
  requesterId: string     // 申请人ID
  requesterName: string   // 申请人姓名
  assigneeId?: string     // 处理人ID
  assigneeName?: string   // 处理人姓名
  phone?: string          // 联系电话
  location?: string       // 位置/房间号
  urgencyNote?: string    // 紧急说明
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
  tags: string[]
  attachments?: string[]  // 附件
  // 扩展字段：工单结果
  workResult?: string
  // 扩展字段：处理人（兼容旧字段）
  finishOperator?: string
  // 扩展字段：工单内容
  workContent?: string
  // 扩展字段：工单类型（兼容 MatrixOrigWeb）
  workType?: WorkType
  // 扩展字段：工单主题（兼容 MatrixOrigWeb）
  workTitle?: string
}

// 创建工单的输入接口
export interface CreateTicketInput {
  title?: string          // 兼容旧字段
  workTitle?: string      // 工单主题（参考 MatrixOrigWeb）
  description: string
  priority: TicketPriority | string  // 支持中文优先级（参考 MatrixOrigWeb）
  category: TicketCategory
  department: Department  // 申请科室
  phone?: string          // 联系电话
  location?: string       // 位置/房间号
  urgencyNote?: string    // 紧急说明
  tags?: string[]
  attachments?: string[]  // 附件
  workType?: WorkType     // 工单类型（参考 MatrixOrigWeb）
  workContent?: string    // 工单内容
  workResult?: string     // 工单结果
}

// 更新工单的输入接口
export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  department?: Department
  phone?: string
  location?: string
  urgencyNote?: string
  assigneeId?: string
  assigneeName?: string
  tags?: string[]
  attachments?: string[]
  workType?: WorkType
  workContent?: string
  workResult?: string
}

// 工单查询参数
export interface TicketQueryParams {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  department?: Department
  assigneeId?: string
  requesterId?: string
  search?: string
  page?: number
  limit?: number
  // 新增筛选字段
  finishOperator?: string  // 处理人
  startDate?: string       // 创建开始时间
  endDate?: string         // 创建结束时间
  finishStartDate?: string // 完成开始时间
  finishEndDate?: string   // 完成结束时间
  workType?: string        // 工单类型
}

// 工单列表响应
export interface TicketListResponse {
  tickets: Ticket[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 工单评论
export interface TicketComment {
  id: string
  ticketId: string
  author: string
  content: string
  createdAt: Date
}

// 工单历史记录
export interface TicketHistory {
  id: string
  ticketId: string
  action: string
  changedBy: string
  changes: Record<string, { old: any; new: any }>
  createdAt: Date
}
