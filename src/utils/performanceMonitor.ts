/**
 * 性能监控工具
 * 监控应用关键性能指标
 */

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = []
  private static isMonitoring = false
  
  /**
   * 开始性能监控
   */
  static start(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.setupCoreWebVitals()
    this.setupCustomMetrics()
    
    console.info('[PerformanceMonitor] 性能监控已启动')
  }
  
  /**
   * 停止性能监控
   */
  static stop(): void {
    this.isMonitoring = false
    console.info('[PerformanceMonitor] 性能监控已停止')
  }
  
  /**
   * 记录性能指标
   */
  static recordMetric(name: string, value: number, unit: string = 'ms'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    }
    
    this.metrics.push(metric)
    
    // 保持最近1000个指标
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
    
    // 开发环境下输出到控制台
    if (import.meta.env.DEV) {
      console.debug(`[Performance] ${name}: ${value}${unit}`)
    }
  }
  
  /**
   * 获取性能报告
   */
  static getReport(): PerformanceMetric[] {
    return [...this.metrics]
  }
  
  /**
   * 获取指定指标的统计数据
   */
  static getStats(name: string): {
    count: number
    avg: number
    min: number
    max: number
    latest: number
  } | null {
    const metrics = this.metrics.filter(m => m.name === name)
    if (metrics.length === 0) return null
    
    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    
    return {
      count: metrics.length,
      avg: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: metrics[metrics.length - 1]!.value
    }
  }
  
  /**
   * 测量函数执行时间
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await (async () => fn())()
      const duration = performance.now() - start
      
      this.recordMetric(name, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration)
      throw error
    }
  }
  
  /**
   * 设置核心Web指标监控
   */
  private static setupCoreWebVitals(): void {
    // 监控页面加载性能
    if ('PerformanceObserver' in window) {
      try {
        // 监控首次内容绘制 (FCP)
        const fcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('FCP', entry.startTime, 'ms')
          }
        })
        fcpObserver.observe({ type: 'paint', buffered: true })
        
        // 监控最大内容绘制 (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('LCP', entry.startTime, 'ms')
          }
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        
        // 监控首次输入延迟 (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('FID', (entry as PerformanceEventTiming).processingStart - entry.startTime, 'ms')
          }
        })
        fidObserver.observe({ type: 'first-input', buffered: true })
        
        // 监控累积布局偏移 (CLS)
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.recordMetric('CLS', (entry as any).value, 'unit')
          }
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
      } catch (error) {
        console.warn('[PerformanceMonitor] 核心Web指标监控初始化失败:', error)
      }
    }
  }
  
  /**
   * 设置自定义指标监控
   */
  private static setupCustomMetrics(): void {
    // 监控内存使用情况（如果浏览器支持）
    if ('memory' in performance) {
      const memory = (performance as any).memory
      if (memory) {
        setInterval(() => {
          this.recordMetric('memory_used', memory.usedJSHeapSize / 1024 / 1024, 'MB')
          this.recordMetric('memory_total', memory.totalJSHeapSize / 1024 / 1024, 'MB')
        }, 10000) // 每10秒记录一次
      }
    }
    
    // 监控帧率
    let frameCount = 0
    let lastTime = performance.now()
    
    const checkFrameRate = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime)
        this.recordMetric('FPS', fps, 'fps')
        
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(checkFrameRate)
    }
    
    requestAnimationFrame(checkFrameRate)
  }
  
  /**
   * 监控API请求性能
   */
  static setupAPIMonitoring(): void {
    const originalFetch = window.fetch
    
    window.fetch = async function(...args) {
      const start = performance.now()
      const [input, _init] = args
      const url = input.toString()
      
      try {
        const response = await originalFetch.apply(this, args as [RequestInfo | URL, RequestInit?])
        const duration = performance.now() - start
        
        PerformanceMonitor.recordMetric(`api_${url}`, duration)
        PerformanceMonitor.recordMetric('api_total', duration)
        
        return response
      } catch (error) {
        const duration = performance.now() - start
        PerformanceMonitor.recordMetric(`api_error_${url}`, duration)
        throw error
      }
    }
  }
}

// 自动启动性能监控（开发环境下）
if (import.meta.env.DEV) {
  setTimeout(() => {
    PerformanceMonitor.start()
    PerformanceMonitor.setupAPIMonitoring()
  }, 1000)
}