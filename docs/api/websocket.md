# WebSocket 接口

## 连接地址

```
ws://your-backend:port/ws
```

## 连接方式

建立 WebSocket 连接时，需要在连接 URL 中携带认证 Token：

```javascript
const ws = new WebSocket(`ws://api.example.com/ws?token=${authToken}`)
```

## 事件类型

### 客户端发送

| 事件 | 说明 |
|------|------|
| `ping` | 心跳检测 |
| `subscribe:tickets` | 订阅工单更新 |

### 服务端推送

| 事件 | 说明 | 数据格式 |
|------|------|----------|
| `ticket_created` | 新工单创建 | `{ id, title, status, ... }` |
| `ticket_updated` | 工单更新 | `{ id, changes, ... }` |
| `ticket_status_changed` | 状态变更 | `{ ticketId, status, timestamp }` |
| `pong` | 心跳响应 | `{ time }` |

## 客户端示例

```javascript
const ws = new WebSocket('ws://localhost:8083/ws')

ws.onopen = () => {
  console.log('WebSocket 已连接')
  // 订阅工单更新
  ws.send(JSON.stringify({
    type: 'subscribe:tickets'
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch (data.type) {
    case 'ticket_created':
      console.log('新工单:', data.payload)
      break
    case 'ticket_updated':
      console.log('工单更新:', data.payload)
      break
    case 'ticket_status_changed':
      console.log('状态变更:', data.payload)
      break
  }
}

ws.onclose = () => {
  console.log('WebSocket 已断开')
}

ws.onerror = (error) => {
  console.error('WebSocket 错误:', error)
}
```

## 心跳机制

建议每 30 秒发送一次心跳：

```javascript
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }))
  }
}, 30000)
```

## 断线重连

```javascript
function connect() {
  const ws = new WebSocket('ws://localhost:8083/ws')
  
  ws.onclose = () => {
    // 5秒后重连
    setTimeout(connect, 5000)
  }
  
  return ws
}
```
