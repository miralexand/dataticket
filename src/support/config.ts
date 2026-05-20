/**
 * 看板系统配置文件
 * 用于配置 API 账号密码，实现免登录访问
 * 
 * 使用方法：修改以下配置为您实际的账号密码
 */
export interface DashboardConfig {
  // API 服务器地址
  apiUrl: string
  // 登录账号
  username: string
  // 登录密码
  password: string
  // 是否启用看板模式（跳过登录）
  enabled: boolean
}

/**
 * 看板配置
 * 请在此处修改您的账号密码
 */
export const dashboardConfig: DashboardConfig = {
  // API 服务器地址（与 .env 中的 VITE_API_URL 保持一致）
  apiUrl: 'http://192.168.0.124:8083',
  
  // 登录账号
  username: '008333',
  
  // 登录密码
  password: '123456',
  
  // 是否启用看板模式
  // 设置为 true 时，系统将自动使用上方配置的账号密码登录
  // 设置为 false 时，显示正常的登录页面
  enabled: true
}
