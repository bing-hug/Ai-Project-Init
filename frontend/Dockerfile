# 阶段一：构建前端静态产物
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# 阶段二：用 Nginx 托管 dist
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# 站点配置由 docker-compose 挂载 deploy/nginx/default.conf 覆盖
