# 环境配置

## 环境变量

项目使用 `.env` 文件管理环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `http://localhost:8083` |

## 看板模式配置

在 `src/support/config.ts` 中配置看板模式的自动登录：

```ts
export const dashboardConfig: DashboardConfig = {
  // API 服务器地址
  apiUrl: 'http://your-server:8083',
  
  // 登录账号
  username: 'your-username',
  
  // 登录密码
  password: 'your-password',
  
  // 是否启用看板模式
  enabled: true
}
```

::: warning 注意
看板模式会将账号密码明文存储在前端代码中，仅适用于内部展示场景，生产环境请谨慎使用。
:::

## Vite 配置

`vite.config.ts` 中的关键配置：

```ts
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3500,
    open: true,
    host: true,
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    sourcemap: true,
  },
})
```

## 开发服务器端口

默认开发服务器端口为 `3500`，可通过修改 `vite.config.ts` 或启动命令更改：

```bash
npm run dev -- --port 4000
```
