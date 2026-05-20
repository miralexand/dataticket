/// <reference types="vite/client" />

// 扩展 Window 接口
declare global {
  interface Window {
    __AUTH_INITIALIZED__?: boolean
  }
}

export {}
