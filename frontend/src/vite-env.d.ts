/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 应用版本号，来自 .env 的 VITE_APP_VERSION */
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 构建时间，由 vite.config.ts 的 define 注入
declare const __BUILD_TIME__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
