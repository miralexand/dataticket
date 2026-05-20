/**
 * 错误处理工具
 * 提供统一的错误处理机制
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', details)
    this.name = 'AuthError'
  }
}

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  static handle(error: unknown, context: string = 'global'): void {
    // 转换为 AppError
    const appError = ErrorHandler.normalize(error)
    
    console.error(`[${context}] Error:`, appError)
    
    // 可以根据错误类型进行不同的处理
    switch (appError.code) {
      case 'NETWORK_ERROR':
        // 网络错误：显示重试提示
        ErrorHandler.showToast('网络连接失败，请检查网络设置')
        break
      case 'AUTH_ERROR':
        // 认证错误：跳转到登录页
        ErrorHandler.showToast('登录已过期，请重新登录')
        // 这里可以添加跳转到登录页的逻辑
        break
      case 'VALIDATION_ERROR':
        // 验证错误：显示具体错误信息
        ErrorHandler.showToast(appError.message)
        break
      default:
        // 其他错误：显示通用错误信息
        ErrorHandler.showToast('系统错误，请稍后重试')
        break
    }
    
    // 可以将错误上报到服务器
    ErrorHandler.reportToServer(appError, context)
  }
  
  static normalize(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }
    
    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN_ERROR', { originalError: error })
    }
    
    return new AppError(String(error), 'UNKNOWN_ERROR', { original: error })
  }
  
  static showToast(message: string): void {
    // 使用现有的通知系统
    if (window.$notification) {
      window.$notification.error(message)
    } else {
      // 回退方案
      alert(message)
    }
  }
  
  static reportToServer(error: AppError, context: string): void {
    // 这里可以实现错误上报逻辑
    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      code: error.code,
      message: error.message,
      details: error.details,
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    // 可以发送到错误收集服务
    console.warn('Error reported:', errorData)
    
    // 实际实现：
    // fetch('/api/error-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // }).catch(() => { /* 忽略上报错误 */ })
  }
  
  /**
   * 包装异步函数，自动捕获错误
   */
  static async wrap<T>(
    fn: () => Promise<T>,
    context: string = 'async-operation'
  ): Promise<T | null> {
    try {
      return await fn()
    } catch (error) {
      ErrorHandler.handle(error, context)
      return null
    }
  }
}

// 全局错误处理
window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error, 'global-error-event')
})

window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'unhandled-rejection')
})

// 扩展 Window 接口
declare global {
  interface Window {
    $notification?: {
      error: (message: string) => void
      success: (message: string) => void
      info: (message: string) => void
      warning: (message: string) => void
    }
  }
}