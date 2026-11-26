import { createRouter, createWebHashHistory } from 'vue-router'

// 静态路由
export const staticRoutes = [
]

const router = createRouter({
  routes: staticRoutes,
  history: createWebHashHistory()
})

export default router
