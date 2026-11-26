# Ai-Project-Init

前后端同仓项目：`backend`（Maven 多模块 Spring Boot）+ `frontend`（Vue 3 + Vite）+ `deploy`（Nginx 部署配置）。

## 目录

```
backend/                 Maven 父工程
  contract/              对外契约（DTO、Facade 接口），不含实现
  service/               唯一可执行模块：Web 层 + 业务实现
frontend/                Vue 3 + Vite + Element Plus + UnoCSS
  src/request/           axios 封装，统一 /api 前缀与响应解包
  src/apis/              接口定义
deploy/nginx/            站点配置（静态资源 + /api 反向代理）
sql/                     数据库初始化脚本（docker 首次启动执行）
docker-compose.dev.yml   本地依赖：mysql + redis
docker-compose.prod.yml  完整形态：mysql + redis + backend + nginx(前端)
```

## 接口约定（契约以前端为准）

后端统一返回，字段与 `frontend/src/request/type.ts` 完全一致：

```json
{ "result": 0, "code": 0, "msg": "ok", "data": { } }
```

- `result`：`0` 成功，`-1` 失败
- `code`：成功为 `0`，失败取 HTTP 状态码（400/401/403/404/405/500）
- `msg`：可直接展示给用户的提示
- 所有业务接口都在 `/api` 前缀下，**前端不加前缀、代理不删前缀**
- 后端不再输出 Whitelabel 页面，404/405/500 一律是上面这层 JSON

## 本地开发

前后端分开跑，前端通过 Vite 代理访问后端。

```powershell
# 1. 依赖服务（可选，等接入数据库后再用）
docker compose -f docker-compose.dev.yml up -d

# 2. 后端，端口 8080
cd backend
mvn spring-boot:run

# 3. 前端，端口 5170
cd frontend
npm install
npm run dev
```

- 前端访问：<http://localhost:5170>
- 健康检查：<http://localhost:5170/api/health>（经代理）或 <http://localhost:8080/api/health>（直连）
- 代理目标由 `frontend/.env` 的 `VITE_API_PROXY_TARGET` 控制，默认 `http://localhost:8080`

## 构建与部署（Nginx 同源）

```powershell
cd frontend
npm run build        # 产物在 frontend/dist
```

Nginx 配置见 `deploy/nginx/default.conf`：

- `/` 托管 `dist`，SPA 回退到 `index.html`
- `/api/` 原样转发到后端 `backend:8080`，不做 rewrite
- 本机直接跑 Nginx 时，把 `proxy_pass http://backend:8080` 改成 `http://127.0.0.1:8080`，`root` 指向 `frontend/dist`

一键起完整环境：

```powershell
docker compose -f docker-compose.prod.yml up -d --build
# 访问 http://localhost:8088
```

## 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 前端请求 404 / 白页 | 代理 rewrite 把 `/api` 删了，或后端没有该映射 | 保持 `/api` 前缀不变，用 `/api/health` 先验通 |
| 页面显示 Whitelabel | 旧版本后端默认错误页 | 已由 `JsonErrorController` 接管，返回统一 JSON |
| 生产环境跨域 | 前端填了后端完整域名 | `VITE_API_BASE_URL` 留空，走 Nginx 同源 |
| 发版后仍是旧页面 | `index.html` 被缓存 | 配置已对 `index.html` 设 `no-cache`，资源带 hash 长缓存 |
