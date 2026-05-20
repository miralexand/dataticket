# 测试指南

## 测试框架

项目使用 **Vitest** + **Vue Test Utils** 进行单元测试。

## 运行测试

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

## 测试文件命名

| 类型 | 命名规范 |
|------|----------|
| 组件测试 | `ComponentName.test.ts` |
| 工具函数测试 | `utilityName.test.ts` |
| Store 测试 | `storeName.test.ts` |

## 组件测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketCard from '@/components/ticket/TicketCard.vue'

describe('TicketCard', () => {
  const mockTicket = {
    id: '1',
    title: '测试工单',
    status: 'pending',
    priority: 'high',
    department: '信息科',
    requesterName: '张三',
    createdAt: new Date()
  }

  it('正确渲染工单信息', () => {
    const wrapper = mount(TicketCard, {
      props: { ticket: mockTicket }
    })

    expect(wrapper.text()).toContain('测试工单')
    expect(wrapper.text()).toContain('信息科')
  })

  it('点击触发 view 事件', async () => {
    const wrapper = mount(TicketCard, {
      props: { ticket: mockTicket }
    })

    await wrapper.find('.ticket-card').trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')[0]).toEqual(['1'])
  })
})
```

## Store 测试示例

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTicketStore } from '@/stores/ticket'

describe('Ticket Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为空', () => {
    const store = useTicketStore()
    expect(store.tickets).toEqual([])
    expect(store.loading).toBe(false)
  })
})
```

## 测试配置

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

## 测试覆盖目标

- 组件渲染测试
- 用户交互测试
- Store 状态变更测试
- 工具函数测试

## 最佳实践

1. **测试行为而非实现** - 关注用户可见的结果
2. **一个测试一个断言** - 保持测试简洁明了
3. **使用有意义的描述** - 描述测试的意图
4. **避免测试第三方库** - 专注测试自己的代码
