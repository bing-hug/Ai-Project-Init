// 版本号直接取 .env 里的 VITE_APP_VERSION（Vite 会自动注入 import.meta.env）
export const APP_VERSION = import.meta.env.VITE_APP_VERSION
export const BUILD_TIME = __BUILD_TIME__

const BADGE = 'background:#42b983;color:#fff;padding:3px 8px;border-radius:4px;font-weight:600;'
const TEXT = 'color:#606266;font-size:12px;'

/** 在浏览器控制台（F12 Console）打印版本号与构建时间 */
export function printAppVersion(): void {
  console.log(`%c 版本 v${APP_VERSION} %c 构建时间 ${BUILD_TIME}`, BADGE, TEXT)
}
