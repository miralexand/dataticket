# 数据模型

## Ticket（工单）

```typescript
interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  department: Department
  requesterId: string
  requesterName: string
  assigneeId?: string
  assigneeName?: string
  phone?: string
  location?: string
  urgencyNote?: string
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
  tags: string[]
  attachments?: string[]
  workResult?: string
  finishOperator?: string
  workContent?: string
  workType?: WorkType
  workTitle?: string
}
```

## TicketStatus（工单状态）

```typescript
enum TicketStatus {
  PENDING = 'pending',      // 待处理
  IN_PROGRESS = 'progress', // 处理中
  RESOLVED = 'resolved',    // 已解决
  CLOSED = 'closed',        // 已关闭
}
```

## TicketPriority（优先级）

```typescript
enum TicketPriority {
  LOW = 'low',       // 低
  MEDIUM = 'medium', // 中
  HIGH = 'high',     // 高
  URGENT = 'urgent', // 紧急
}
```

## TicketCategory（分类）

```typescript
enum TicketCategory {
  SYSTEM_FAILURE = 'system_failure',    // 系统故障
  DEVICE_FAILURE = 'device_failure',    // 设备报修
  NETWORK_ISSUE = 'network_issue',      // 网络问题
  SOFTWARE_REQUEST = 'software_request',// 软件需求
  DATA_QUERY = 'data_query',            // 数据查询
  ACCOUNT_ISSUE = 'account_issue',      // 账号问题
  OTHER = 'other',                      // 其他
}
```

## User（用户）

```typescript
interface User {
  id: string
  username: string
  name: string
  role: UserRole
  department: Department
  phone?: string
  email?: string
  avatar?: string
}
```

## UserRole（角色）

```typescript
type UserRole = 'admin' | 'doctor' | 'nurse' | 'technician' | 'admin_staff' | 'other'
```

## Department（科室）

```typescript
type Department = 
  | 'outpatient'      // 门诊部
  | 'inpatient'       // 住院部
  | 'emergency'       // 急诊科
  | 'icu'             // 重症监护室
  | 'surgery'         // 外科
  | 'internal'        // 内科
  | 'pediatrics'      // 儿科
  | 'obstetrics'      // 妇产科
  | 'ophthalmology'   // 眼科
  | 'dentistry'       // 口腔科
  | 'radiology'       // 放射科
  | 'laboratory'      // 检验科
  | 'pharmacy'        // 药剂科
  | 'it_department'   // 信息科
  | 'administration'  // 行政科室
  | 'other'           // 其他
```

## TicketQueryParams（查询参数）

```typescript
interface TicketQueryParams {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  department?: Department
  assigneeId?: string
  requesterId?: string
  search?: string
  page?: number
  limit?: number
  finishOperator?: string
  startDate?: string
  endDate?: string
  finishStartDate?: string
  finishEndDate?: string
  workType?: string
}
```
