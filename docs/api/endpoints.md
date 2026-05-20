# 接口概览

## 基础信息

- **Base URL**: 由环境变量 `VITE_API_URL` 配置
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token（登录后获取）

## 接口列表

### 工单相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/WorkApi/createWorkOrder` | 创建工单 |
| POST | `/WorkApi/queryWorkOrders` | 查询工单列表 |
| POST | `/WorkApi/queryWorkOrder` | 查询工单详情 |
| POST | `/WorkApi/updateWorkOrder` | 更新工单 |
| POST | `/WorkApi/updateWorkOrderStatus` | 更新工单状态 |

### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |

## 通用响应格式

```json
{
  "handleType": true,
  "handleData": { ... },
  "handleMessage": "操作成功"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `handleType` | boolean | 是否成功 |
| `handleData` | object | 响应数据 |
| `handleMessage` | string | 提示信息 |

## 错误处理

当请求失败时，响应格式如下：

```json
{
  "handleType": false,
  "handleData": null,
  "handleMessage": "错误描述信息"
}
```

HTTP 状态码：

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，Token 无效或过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
