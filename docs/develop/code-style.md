# 代码规范

## ESLint 配置

项目使用 Vue 官方推荐的 ESLint 配置：

```json
{
  "extends": [
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier"
  ]
}
```

## Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## 代码风格

### Vue 单文件组件

```vue
<script setup lang="ts">
// 1. 导入（按类型分组）
import { ref, computed } from 'vue'
import type { Ticket } from '@/types/ticket'

// 2. 类型定义
type ViewMode = 'quick' | 'month' | 'all'

// 3. 组合式函数调用
const ticketStore = useTicketStore()

// 4. 响应式状态
const viewMode = ref<ViewMode>('quick')
const loading = ref(false)

// 5. 计算属性
const stats = computed(() => ({
  total: ticketStore.tickets.length
}))

// 6. 方法
const refreshData = async () => {
  loading.value = true
  try {
    await ticketStore.fetchTickets()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式内容 */
</style>
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `TicketCard.vue` |
| 组合式函数 | camelCase，前缀 use | `useNotification` |
| Store | camelCase，后缀 Store | `ticketStore` |
| 类型/接口 | PascalCase | `TicketStatus` |
| 枚举 | PascalCase | `TicketPriority` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |

### 文件组织

- 每个组件单独文件
- 相关文件放在同一目录
- 测试文件与被测文件同名，后缀 `.test.ts`

## 代码检查

```bash
# 运行 ESLint 检查并自动修复
npm run lint

# 使用 Prettier 格式化代码
npm run format

# 运行 TypeScript 类型检查
npm run type-check
```

## Git 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

示例：

```bash
git commit -m "feat: 添加工单筛选功能"
git commit -m "fix: 修复登录页表单验证错误"
git commit -m "docs: 更新 API 文档"
```
