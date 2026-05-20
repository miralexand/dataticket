# 快速开始

欢迎使用 **工单管理系统**！本指南将帮助你在几分钟内启动并运行项目。

## 前置要求

在开始之前，请确保你的环境满足以下要求：

- **Node.js** `^20.19.0 || >=22.12.0`
- **npm** 或 **yarn** 或 **pnpm**
- 一个现代浏览器（Chrome、Firefox、Edge、Safari）

## 安装依赖

克隆项目后，进入项目目录并安装依赖：

```bash
npm install
```

## 环境配置

1. 复制环境配置文件：

```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的 API 地址：

```bash
# .env
VITE_API_URL=http://your-backend-api:8083
```

## 开发运行

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

::: tip 提示
开发服务器支持热模块替换（HMR），修改代码后页面会自动刷新。
:::

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 预览生产版本

```bash
npm run preview
```

## 下一步

- 了解[项目结构](/guide/structure)
- 查看[环境配置详情](/guide/configuration)
- 学习[工单管理功能](/guide/ticket-management)
