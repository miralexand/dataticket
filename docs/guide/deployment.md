# 构建与部署

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录，包含：

- 优化后的 JS/CSS 文件
- 资源文件（图片、字体等）
- `index.html` 入口文件

## 构建配置

`vite.config.ts` 中的生产构建配置：

```ts
build: {
  target: 'es2022',
  minify: 'terser',
  sourcemap: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vue: ['vue', 'vue-router', 'pinia'],
        charts: ['chart.js', 'vue-chartjs'],
        vendor: ['lodash', 'axios']
      },
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
    },
  },
}
```

## 静态部署

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 环境变量

部署前确保配置正确的环境变量：

```bash
# .env
VITE_API_URL=https://your-production-api.com
```

::: tip 提示
Vite 的环境变量需要在构建时注入，不支持运行时修改。
:::

## 预览构建

本地预览生产构建：

```bash
npm run preview
```
