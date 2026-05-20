# 贡献指南

感谢你对工单管理系统的关注！欢迎提交 Issue 和 Pull Request。

## 开发流程

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 **Pull Request**

## 提交规范

使用约定式提交（Conventional Commits）：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复问题 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |

### 示例

```bash
feat(ticket): 添加工单筛选功能
fix(auth): 修复登录状态持久化问题
docs(api): 更新 WebSocket 文档
test(ticket): 添加 TicketCard 组件测试
```

## 代码要求

- 通过 ESLint 检查
- 通过 TypeScript 类型检查
- 新功能需要添加测试
- 保持测试覆盖率不降低

## 报告问题

提交 Issue 时请包含：

1. 问题描述
2. 复现步骤
3. 期望行为
4. 实际行为
5. 环境信息（浏览器、Node.js 版本等）

## 代码审查

所有提交都需要经过代码审查：

- 至少 1 个维护者批准
- 所有 CI 检查通过
- 无冲突

## 许可证

通过提交代码，你同意将你的贡献基于 MIT 许可证发布。
