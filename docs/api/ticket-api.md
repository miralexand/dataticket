# 工单接口

## 创建工单

### 请求

```http
POST /WorkApi/createWorkOrder
Content-Type: application/json

{
  "title": "打印机无法连接",
  "type": "bug",
  "priority": "高",
  "department": "信息科",
  "description": "办公室打印机无法连接到网络，显示离线状态",
  "phone": "13800138000",
  "location": "A栋302室",
  "urgencyNote": "影响日常办公"
}
```

### 响应

```json
{
  "handleType": true,
  "handleData": {
    "id": 1001,
    "title": "打印机无法连接",
    "type": "bug",
    "priority": "高",
    "status": "待处理",
    "assignee": "",
    "createTime": "2026-02-03T10:30:00",
    "updateTime": "2026-02-03T10:30:00"
  },
  "handleMessage": "工单创建成功"
}
```

## 查询工单列表

### 请求

```http
POST /WorkApi/queryWorkOrders
Content-Type: application/json

{
  "page": 1,
  "limit": 20,
  "status": "pending",
  "priority": "high",
  "search": "打印机"
}
```

### 响应

```json
{
  "handleType": true,
  "handleData": {
    "tickets": [
      {
        "id": "1001",
        "title": "打印机无法连接",
        "status": "pending",
        "priority": "high",
        "department": "信息科",
        "requesterName": "张三",
        "createdAt": "2026-02-03T10:30:00"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "handleMessage": "查询成功"
}
```

## 查询工单详情

### 请求

```http
POST /WorkApi/queryWorkOrder
Content-Type: application/json

{
  "id": "1001"
}
```

### 响应

```json
{
  "handleType": true,
  "handleData": {
    "id": "1001",
    "title": "打印机无法连接",
    "description": "办公室打印机无法连接到网络...",
    "status": "pending",
    "priority": "high",
    "category": "device_failure",
    "department": "信息科",
    "requesterId": "user001",
    "requesterName": "张三",
    "assigneeName": null,
    "phone": "13800138000",
    "location": "A栋302室",
    "createdAt": "2026-02-03T10:30:00",
    "updatedAt": "2026-02-03T10:30:00"
  },
  "handleMessage": "查询成功"
}
```

## 更新工单

### 请求

```http
POST /WorkApi/updateWorkOrder
Content-Type: application/json

{
  "id": "1001",
  "title": "打印机无法连接-已修复",
  "status": "resolved",
  "workResult": "重新配置了网络设置，打印机已恢复正常"
}
```

## 更新工单状态

### 请求

```http
POST /WorkApi/updateWorkOrderStatus
Content-Type: application/json

{
  "id": "1001",
  "status": "resolved"
}
```

## 查询参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 工单ID |
| `title` | string | 否 | 工单标题 |
| `description` | string | 否 | 工单描述 |
| `type` | string | 否 | 工单类型 |
| `priority` | string | 否 | 优先级 |
| `status` | string | 否 | 状态 |
| `department` | string | 否 | 申请科室 |
| `workResult` | string | 否 | 处理结果 |

::: tip 提示
更新接口只传需要修改的字段即可，未传的字段保持原值不变。
:::
