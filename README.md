# 开源工单管理系统

一个现代化的工单管理系统，基于 Vue 3 + TypeScript + Vite 构建，适用于医院、企业、IT 服务管理等场景。

## ✨ 特性

- 🎨 **现代化 UI**: 优雅的设计，响应式布局
- ⚡ **高性能**: 基于 Vue 3 + Vite，开发体验优秀
- 🔒 **类型安全**: 完整的 TypeScript 支持
- 🔄 **实时同步**: WebSocket 实时通知
- 📱 **响应式**: 支持桌面和移动端
- 🎯 **工单管理**: 完整的工单创建、查看、编辑、状态管理
- 🔍 **搜索筛选**: 强大的工单列表筛选功能
- 📊 **状态跟踪**: 实时跟踪工单状态变化

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境配置文件：
```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的 API 地址：
```env
VITE_API_URL=http://your-backend-api:8083
```

### 开发运行

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
ticket-system/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── ticket/         # 工单相关组件
│   │   └── ui/             # 通用 UI 组件
│   ├── composables/         # 组合式函数
│   ├── router/              # 路由配置
│   ├── services/            # API 服务和 WebSocket
│   ├── stores/              # Pinia 状态管理
│   ├── types/               # TypeScript 类型定义
│   ├── views/               # 页面组件
│   └── utils/               # 工具函数
├── public/                  # 静态资源
├── .env.example            # 环境变量示例
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目说明
```

## 🔧 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 5
- **编程语言**: TypeScript 5.7
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **UI 框架**: 原生 CSS + 现代化设计
- **HTTP 客户端**: Fetch API
- **实时通信**: WebSocket
- **代码规范**: ESLint + Prettier
- **单元测试**: Vitest + Vue Test Utils
- **类型检查**: 严格 TypeScript 模式
- **性能监控**: 自定义性能监控工具
- **错误处理**: 增强的错误处理系统

## 📖 使用说明

### 1. 工单创建

访问 `/create-ticket` 页面，填写以下信息：
- 工单标题（必填）
- 工单描述（必填）
- 工单类型（日常维护、技术支持、财务问题、功能请求、故障报告、其他）
- 优先级（低、中、高、紧急）
- 申请科室（必填）
- 联系电话（可选）
- 位置/房间号（可选）
- 紧急说明（可选）

### 2. 工单列表

访问 `/tickets` 查看所有工单，支持：
- 状态筛选（待处理、处理中、已解决、已关闭）
- 搜索功能
- 按优先级、状态排序

### 3. 工单详情

点击工单列表中的任意工单，查看详细信息和状态历史。

### 4. 实时通知

当有新的工单创建或工单状态更新时，系统会通过 WebSocket 发送实时通知。

## 🔌 API 接口

系统需要后端 API 支持，主要接口如下：

### 工单相关

- `POST /WorkApi/createWorkOrder` - 创建工单
- `POST /WorkApi/queryWorkOrders` - 查询工单列表
- `POST /WorkApi/queryWorkOrder` - 查询工单详情
- `POST /WorkApi/updateWorkOrder` - 更新工单
- `POST /WorkApi/updateWorkOrderStatus` - 更新工单状态

### WebSocket

- `ws://your-backend:port/ws` - 实时通知

### 数据格式

**创建工单请求**:
```json
{
  "title": "工单标题",
  "type": "bug",
  "priority": "高",
  "department": "信息科",
  "description": "问题描述",
  "phone": "",
  "location": "",
  "urgencyNote": "",
  "workContent": "",
  "workResult": "",
  "tags": ""
}
```

**创建工单响应**:
```json
{
  "handleType": true,
  "handleData": {
    "id": 1001,
    "title": "工单标题",
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

## 🎨 主要功能

### 工单管理
- ✅ 创建工单
- ✅ 查看工单列表
- ✅ 查看工单详情
- ✅ 编辑工单
- ✅ 更新工单状态
- ✅ 工单筛选和搜索

### 实时同步
- ✅ WebSocket 连接状态显示
- ✅ 新工单实时通知
- ✅ 工单状态更新通知

### 用户体验
- ✅ 表单验证
- ✅ 响应式设计
- ✅ 优雅的错误处理
- ✅ 加载状态提示
- ✅ 成功/错误通知

## 🛠️ 开发指南

### 代码规范和质量

- 使用 TypeScript 进行严格类型检查
- 遵循 Vue 3 最佳实践
- 使用 Composition API
- 组件按功能模块化组织
- **使用 ESLint 进行代码规范检查**
- **使用 Prettier 进行代码自动格式化**
- **遵循统一的编码风格**

#### 代码检查和格式化

```bash
# 运行 ESLint 检查并自动修复
npm run lint

# 使用 Prettier 格式化代码
npm run format

# 运行 TypeScript 类型检查
npm run type-check
```

### 添加新功能

1. 在 `src/types/` 中定义类型
2. 在 `src/services/` 中添加 API 调用
3. 在 `src/stores/` 中管理状态（如需要）
4. 在 `src/components/` 中创建组件
5. 在 `src/views/` 中创建页面
6. 在 `src/router/` 中配置路由
7. **为组件和函数编写单元测试**
8. **确保代码通过 ESLint 检查**

### 测试

项目使用 Vitest 进行单元测试，配合 Vue Test Utils 测试 Vue 组件。

```bash
# 运行所有测试
npm run test

# 运行测试并显示 UI 界面
npm run test:ui

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 TypeScript 类型检查
npm run type-check
```

#### 测试文件命名约定
- 组件测试: `ComponentName.test.ts`
- 工具函数测试: `utilityName.test.ts`
- Store 测试: `storeName.test.ts`

### 性能监控

项目内置了性能监控工具，可以监控：
- Core Web Vitals (FCP, LCP, FID, CLS)
- API 请求性能
- 内存使用情况
- 帧率 (FPS)

在开发环境下，性能监控会自动启动。生产环境下可以通过 `PerformanceMonitor.start()` 手动启动。

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 参考项目：MatrixOrigWeb
- Vue 3 社区
- 所有开源贡献者

## 📞 联系方式

如有问题或建议，请通过 GitHub Issues 提交。

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/ticket-system&type=Date)](https://star-history.com/#your-username/ticket-system&Date)

---

**注意**: 本项目为开源版本，如需生产环境使用，请确保后端 API 服务正常运行。