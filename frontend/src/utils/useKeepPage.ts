import { onBeforeRouteLeave } from 'vue-router'
import { useKeepAliveStore } from '@/stores'

// 这里把targetPages参数设置为数组，因为目标页面可能有多个，比如B -> C, B -> D
export function useKeepPage(targetPages: string[]) {
  const keepAliveStore = useKeepAliveStore()

  // 正确的写法：使用一个、非嵌套的 onBeforeRouteLeave 钩子
  onBeforeRouteLeave((to, from) => {
    const fromName = from.name as string
    // 如果路由没有 name，则无法进行缓存管理
    if (!fromName) {
      console.warn(
        `Route with path "${from.path}" has no name. Cannot be managed by useKeepPage.`
      )
      return
    }

    // 判断导航的目标页面是否在指定的 targetPages 列表中
    if (targetPages.includes(to.name as string)) {
      // 如果是，则将当前页面 (from) 的 name 添加到缓存列表中
      keepAliveStore.addKeepAliveRoute(fromName)
    } else {
      // 如果不是（即导航到其他任何页面），则将当前页面从缓存中移除，确保不会被意外缓存
      keepAliveStore.removeKeepAliveRoute(fromName)
    }
  })

  // 这个 composable 只需要设置钩子，不需要返回任何东西
}
