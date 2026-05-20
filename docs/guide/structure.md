# 项目结构

```
ticket-system/
├── docs/                    # VitePress 文档站点
│   ├── .vitepress/         # VitePress 配置
│   │   ├── config.ts       # 站点配置
│   │   └── theme/          # 自定义主题
│   ├── guide/              # 使用指南
│   ├── api/                # API 文档
│   ├── develop/            # 开发文档
│   └── index.md            # 首页
├── src/
│   ├── components/         # Vue 组件
│   │   ├── ticket/         # 工单相关组件
│   │   └── ui/             # 通用 UI 组件
│   ├── composables/        # 组合式函数
│   ├── router/             # 路由配置
│   ├── services/           # API 服务和 WebSocket
│   ├── stores/             # Pinia 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── views/              # 页面组件
│   └── utils/              # 工具函数
├── public/                  # 静态资源
├── .env.example            # 环境变量示例
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目说明
```

## 目录详解

### `src/components/`

存放可复用的 Vue 组件，按功能模块组织：

- `ticket/` - 工单相关组件（列表、表单、筛选、统计等）
- `ui/` - 通用 UI 组件（按钮、输入框等）
- `charts/` - 图表组件
- `common/` - 通用组件（加载、通知、错误边界等）

### `src/views/`

页面级组件，对应路由配置：

| 视图 | 路径 | 说明 |
|------|------|------|
| HomeView | `/` | 数据看板首页 |
| TicketListView | `/tickets` | 工单列表 |
| CreateTicketView | `/tickets/create` | 创建工单 |
| TicketDetailView | `/tickets/:id` | 工单详情 |
| EditTicketView | `/tickets/:id/edit` | 编辑工单 |
| LoginView | `/login` | 登录/注册 |
| AboutView | `/about` | 关于页面 |

### `src/stores/`

使用 Pinia 进行状态管理：

- `ticket.ts` - 工单状态管理
- `auth.ts` - 用户认证状态
- `counter.ts` - 计数器示例

### `src/services/`

API 通信层：

- `api.ts` - HTTP API 封装
- `websocket.ts` - WebSocket 实时通信

### `src/types/`

TypeScript 类型定义：

- `ticket.ts` - 工单相关类型
- `auth.ts` - 认证相关类型

### `src/utils/`

工具函数：

- `errorHandler.ts` - 错误处理
- `performanceMonitor.ts` - 性能监控
- `EncodedUtil.ts` - 编码工具
