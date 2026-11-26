# frontend

Vue 3 + Vite 7 + Element Plus + Pinia + UnoCSS。

```powershell
npm install
npm run dev     # http://localhost:5170，/api 由 Vite 代理到后端 8080
npm run build   # 产物输出到 dist/
```

约定：

- 接口统一走 `/api` 前缀，`src/request` 里不做前缀增删；后端地址只在开发期通过 `VITE_API_PROXY_TARGET` 指定。
- 响应结构 `{ result, code, msg, data }`，`code = 0` 为成功。
- 路由当前是 hash 模式，与 Nginx 的静态托管方式配合。

完整说明见仓库根目录 `README.md`。
