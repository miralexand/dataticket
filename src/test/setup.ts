import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// 全局模拟函数
vi.stubGlobal('console', {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
})

// Vue Test Utils 配置
config.global.stubs = {
  Transition: false,
  'transition-group': false
}

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))