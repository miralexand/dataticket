# 贡献指南

感谢您对开源工单系统的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 🔧 修复 Bug
- 📚 改进文档
- 🎨 改进 UI/UX

## 📋 贡献流程

### 1. 寻找贡献机会

- 查看 [Issues](https://github.com/your-username/ticket-system/issues) 页面
- 关注带有 `good first issue` 标签的任务
- 或者提出您自己的想法

### 2. 开始贡献

#### Fork 仓库

```bash
# Fork 本仓库到您的 GitHub 账户
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/ticket-system.git
cd ticket-system
```

#### 创建分支

```bash
# 创建特性分支
git checkout -b feature/your-feature-name

# 或修复 Bug
git checkout -b fix/your-bug-fix
```

#### 安装依赖

```bash
npm install
```

#### 开发运行

```bash
npm run dev
```

### 3. 提交更改

#### 代码规范

- 遵循项目现有的代码风格
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 最佳实践
- 组件按功能模块化组织

#### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具链更新
```

示例：
```bash
git commit -m "feat: 添加工单筛选功能"
git commit -m "fix: 修复表单验证问题"
git commit -m "docs: 更新 API 文档"
```

#### 代码检查

```bash
# 运行类型检查
npm run type-check

# 运行构建
npm run build
```

### 4. 推送并创建 Pull Request

```bash
# 推送分支到您的 Fork
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
```

#### Pull Request 模板

创建 PR 时，请填写以下信息：

- **标题**: 简洁描述更改
- **描述**: 
  - 解决了什么问题？
  - 做了哪些更改？
  - 有没有副作用？
- **测试**: 如何测试这些更改？
- **截图**: 如有 UI 更改，请提供截图

### 5. 代码审查

- 维护者会审查您的 PR
- 可能需要进行一些修改
- 一旦通过，您的更改将被合并

## 🎯 开发指南

### 项目结构

```
src/
├── components/          # Vue 组件
│   ├── ticket/         # 工单相关组件
│   └── ui/             # 通用 UI 组件
├── composables/         # 组合式函数
├── router/              # 路由配置
├── services/            # API 服务和 WebSocket
├── stores/              # Pinia 状态管理
├── types/               # TypeScript 类型定义
├── views/               # 页面组件
└── utils/               # 工具函数
```

### 添加新功能

1. **定义类型** (`src/types/`)
   ```typescript
   // src/types/your-feature.ts
   export interface YourFeature {
     id: string
     name: string
   }
   ```

2. **添加 API 调用** (`src/services/`)
   ```typescript
   // src/services/your-feature.ts
   export const yourFeatureAPI = {
     async getFeatures(token: string): Promise<YourFeature[]> {
       // 实现 API 调用
     }
   }
   ```

3. **管理状态** (`src/stores/`) - 如需要
   ```typescript
   // src/stores/your-feature.ts
   export const useYourFeatureStore = defineStore('yourFeature', () => {
     // 实现状态管理
   })
   ```

4. **创建组件** (`src/components/`)
   ```vue
   <!-- src/components/YourFeature.vue -->
   <template>
     <!-- 组件模板 -->
   </template>
   
   <script setup lang="ts">
   // 组件逻辑
   </script>
   ```

5. **创建页面** (`src/views/`)
   ```vue
   <!-- src/views/YourFeatureView.vue -->
   <template>
     <!-- 页面模板 -->
   </template>
   
   <script setup lang="ts">
   // 页面逻辑
   </script>
   ```

6. **配置路由** (`src/router/`)
   ```typescript
   // src/router/index.ts
   {
     path: '/your-feature',
     name: 'YourFeature',
     component: () => import('@/views/YourFeatureView.vue')
   }
   ```

### 测试

```bash
# 运行类型检查
npm run type-check

# 运行构建
npm run build

# 预览生产版本
npm run preview
```

## 📝 文档贡献

### 改进文档

- 修正错别字
- 添加示例代码
- 补充 API 文档
- 翻译文档

### 文档位置

- `README.md` - 项目主文档
- `CONTRIBUTING.md` - 贡献指南（本文件）
- 代码注释 - 代码中的文档

## 🐛 报告 Bug

### 创建 Issue

1. 访问 [Issues](https://github.com/your-username/ticket-system/issues) 页面
2. 点击 "New Issue"
3. 选择 "Bug Report" 模板
4. 填写详细信息：

**必需信息**：
- Bug 描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器、操作系统等）
- 截图（如有）

**可选信息**：
- 可能的解决方案
- 相关的 Issue 链接

## 💡 提出新功能

### 创建 Feature Request

1. 访问 [Issues](https://github.com/your-username/ticket-system/issues) 页面
2. 点击 "New Issue"
3. 选择 "Feature Request" 模板
4. 填写详细信息：

**必需信息**：
- 功能描述
- 使用场景
- 预期行为

**可选信息**：
- 实现建议
- 替代方案
- 截图/原型图

## 🎨 设计贡献

### UI/UX 改进

- 提交设计提案
- 提供 Figma/Sketch 原型
- 改进现有界面
- 添加动画效果

### 需要包含的内容

- 设计说明
- 截图或原型链接
- 实现建议

## 📊 代码审查指南

### 审查者 checklist

- [ ] 代码符合项目规范
- [ ] 类型定义完整
- [ ] 文档已更新
- [ ] 测试通过
- [ ] 没有破坏性更改
- [ ] 提交信息规范

### 提交者 checklist

- [ ] 代码经过自测
- [ ] 类型检查通过
- [ ] 构建成功
- [ ] 文档已更新
- [ ] 遵循提交规范

## 🤝 行为准则

我们采用 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则：

- 使用友好和包容的语言
- 尊重不同意见和经历
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 📢 社区交流

- **GitHub Issues**: 用于 Bug 报告和功能请求
- **Discussions**: 用于一般讨论和问题
- **Pull Requests**: 用于代码贡献

## 📜 许可证

您的贡献将根据本项目的 MIT 许可证进行授权。

## 🙏 感谢

感谢所有贡献者的时间和努力！您的贡献使这个项目变得更好！

---

**问题？** 请查看 [FAQ](https://github.com/your-username/ticket-system/discussions/categories/q-a) 或创建一个新的讨论。