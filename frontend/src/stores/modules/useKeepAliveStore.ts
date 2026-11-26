import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useKeepAliveStore = defineStore('keepAlive', () => {
  // 用一个数组来存储需要被缓存的路由组件的 name
  const keepAliveRoutes = ref<string[]>([])

  /**
   * 添加一个需要缓存的路由 name
   * @param name - 路由的 name
   */
  const addKeepAliveRoute = (name: string) => {
    if (!keepAliveRoutes.value.includes(name)) {
      keepAliveRoutes.value.push(name)
    }
  }

  /**
   * 移除一个不再需要缓存的路由 name
   * @param name - 路由的 name
   */
  const removeKeepAliveRoute = (name: string) => {
    const index = keepAliveRoutes.value.indexOf(name)
    if (index !== -1) {
      keepAliveRoutes.value.splice(index, 1)
    }
  }

  return {
    keepAliveRoutes,
    addKeepAliveRoute,
    removeKeepAliveRoute
  }
})
