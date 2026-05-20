# Docker 部署

项目包含 `docker-compose.yml`，可以使用 Docker 快速部署。

## Docker Compose

```yaml
version: '3.8'

services:
  ticket-system:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped
```

## 构建镜像

```bash
# 构建应用
npm run build

# 启动容器
docker-compose up -d
```

## Nginx 配置

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 多阶段构建 Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

构建并运行：

```bash
docker build -t ticket-system .
docker run -d -p 80:80 ticket-system
```
