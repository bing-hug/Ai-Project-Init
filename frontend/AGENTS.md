# AGENTS.md

本仓库的 AI 编码约定。开工前必读；与任何默认习惯冲突时以本文件为准。
视觉规范见 `DESIGN.md`，个人偏好见 `AGENTS.local.md`（不入库）。

---

## 0. 文件优先级

1. `AGENTS.md`（本文件）——工程与流程规范，最高优先
2. `DESIGN.md`——视觉与尺寸规范
3. `AGENTS.local.md`——个人风格偏好，只覆盖"怎么写"，不覆盖"写到哪"

三者冲突时以本文件为准。

---

## 1. 技术栈实况

| 项 | 实际值 |
| --- | --- |
| 框架 | Vue 3.5（Composition API + `<script setup lang="ts">`） |
| 构建 | Vite 7，`base: './'` |
| 语言 | TypeScript 5.8，`strict: true` |
| UI | Element Plus 2.14（全自动导入） |
| 样式 | UnoCSS（原子类）+ Sass/SCSS（`<style scoped lang="scss">`） |
| 状态 | Pinia 3 + pinia-plugin-persistedstate |
| 路由 | vue-router 5，**hash 模式** |
| 请求 | Axios |
| 包管理 | npm |

---

## 2. 命令

| 目的 | 命令 |
| --- | --- |
| 开发 | `npm run dev`（`vite --mode dev --host`，端口 **5170**） |
| 构建 | `npm run build`（`vue-tsc -b && vite build --mode prod`） |
| 预览产物 | `npm run preview` |
| 类型检查 | `npx vue-tsc -b` |
| Lint | `npx eslint .`（`--fix` 自动修） |
| 格式化 | `npx prettier --write "src/**/*.{ts,vue,css,scss}"` |

- **必须写 `npm run dev` / `npm run build`**，`npm dev`、`npm build` 不是合法命令。
- `package.json` 只有 `dev` / `build` / `preview` 三个脚本，**没有** `lint`、`typecheck`。
- 没有 husky、lint-staged、pre-commit 钩子，提交前检查需手动执行。

---

## 3. 目录职责

现有：

```
src/
  main.ts           入口，只做挂载
  App.vue           根组件
  style.css         全局样式（横竖屏适配、隐藏滚动条、#app 全屏定位）
  router/index.ts   路由表，hash 模式
  stores/           Pinia 根实例 + modules/useXxx.ts
  types/index.ts    全局类型（注意：是 types，不是 typings）
  utils/version.ts  版本号与控制台打印
  vite-env.d.ts     环境变量与 __BUILD_TIME__ 声明
types/              unplugin 自动生成的 auto-imports.d.ts 等，**禁止手改**
```

新增代码只能落在下列位置：

| 路径 | 职责 | 禁止 |
| --- | --- | --- |
| `src/api/` | 按业务拆文件：`user.ts`、`course.ts`，每文件导出函数 | 禁止在 `.vue` 里直接写 axios |
| `src/views/<模块>/` | 一个路由一个 `.vue` | 禁止跨模块 import 页面 |
| `src/views/<模块>/components/` | 仅该模块使用的子组件 | |
| `src/components/` | 跨页面复用组件 | 禁止放页面级取数逻辑 |
| `src/hooks/` | `useXxx.ts` 组合式函数 | 禁止在 hook 里做 DOM 操作 |
| `src/types/` | 接口与联合类型 | 禁止在 `.vue` 里定义被导出的 interface |
| `src/assets/` | 静态资源 | 禁止放需要构建处理的 TS |

**不存在的目录不要臆造**：项目没有 `src/services/`、`src/typings/`，请求层用 `src/api/`。

---

## 4. 硬性规则

1. **自动导入，不手写 import**
   `ref` / `computed` / `watch` / `onMounted`（vue）、`useRouter` / `useRoute`（vue-router）、
   `defineStore`（pinia）、全部 Element Plus 组件与 `ElMessage` / `ElMessageBox` 均已自动导入。
   手写这些 import 会被 lint 判为重复或未使用。**只有类型才写 `import type`。**
2. **禁止 `enum` / `namespace`**
   `erasableSyntaxOnly: true`，`enum`、`namespace`、构造函数参数属性一律编译失败。
   用 `const X = {...} as const` + 联合类型替代。
3. **禁止未使用变量**
   `noUnusedLocals` / `noUnusedParameters` 均为 `true`，多一个未用的 import 就构建失败。
4. **禁止 `any`**，禁止 `@ts-ignore` / `@ts-nocheck` / `as unknown as X` 逃避类型。
5. **禁止使用未安装的库**
   `@vueuse/core`、`@element-plus/icons-vue` 未安装。需要防抖、本地存储这类能力时手写实现，
   或先装包，并同步 `vite.config.ts` 的 `AutoImport.imports`。
6. **文件与组件粒度**
   单文件 ≤ 200 行；`<script setup>` 超 150 行就拆子组件或抽 composable。
   组件名 PascalCase 且至少两个单词（`VideoCard.vue`，不要 `Card.vue`）。
7. **一个组件只干一件事**
   取数 → `api/`，复用逻辑 → `hooks/`，组件只做展示与交互编排。
8. **不碰无关代码**
   不改与本任务无关的文件、格式、注释；不顺手重构。
9. **不加没被要求的依赖**
   现有栈能解决就不装包；确需新增，先说明理由与替代方案。

---

## 5. 样式约定（本项目最容易写错的地方）

### 5.1 UnoCSS 数值类的单位是 px，不是 rem

`uno.config.ts` 自定义了 `-(\d+)` 系列规则：`p-4` = `padding: 4px`，`mt-8` = `margin-top: 8px`，
`font-14` = `font-size: 14px`，`w-100` = `width: 100px`。按设计稿像素值直接写，不要换算成 rem。

### 5.2 px 会自动转 vw，按设计稿宽度分档

| 命中条件 | 设计稿宽度 |
| --- | --- |
| 默认 | 375（手机竖屏稿） |
| 路径含 `/views/library/` | **1920**（横屏大屏稿） |
| 路径含 `uno.css` | 1920 |

**新增 1920 大屏页面必须放在 `src/views/library/` 下**，放错目录尺寸整体错位。

### 5.3 保留 px 不转换

黑名单 `selectorBlackList: ['keep-px', 'el', '--el']`，匹配方式是**选择器字符串包含**，不是前缀：

- 元素加 `keep-px` 类；
- 选择器含 `el` 的（Element Plus 内部类）默认跳过——自己写的类名不要带 `el` 字样；
- 文件名含 `pc`（`*-pc.vue`、`*-pc-*.vue`）的文件整体排除。

`exclude` 另跳过 `node_modules/element-plus`、`node_modules/@wangeditor/editor`、
`src/views/*/*pc-*`、`src/views/*/*-pc*`、`src/components/*-pc*`。

### 5.4 颜色走已有的类，不写死 hex

| 类名 | 值 | 用途 |
| --- | --- | --- |
| `text-theme-color` / `bg-theme-color` | `#3AB4EC` | 主题色（唯一来源 `theme.colors['theme-color']`） |
| `page-bg-color` | `#F0F3F5` | 页面底色 |
| `main-text-color` | `#6D7479` | 正文文字 |

`theme-color` 只在 `theme.colors` 里定义一次（`rules` 里没有同名类），所以裸 `theme-color`
**不产出任何样式**：文字用 `text-theme-color`，背景用 `bg-theme-color`。

### 5.5 快捷键与安全区

`flex-center`、`flex-col-center`、`limit-2` / `limit-3`（多行省略）、
`p-safe` / `pt-safe` / `pb-safe` / `ptb-safe`。

### 5.6 设计变更：只改两个文件

设计以 `DESIGN.md` 为唯一真相源。换一套设计时按下表改，**不允许在组件里就地改**：

| 改什么 | 改哪里 | 不能改哪里 |
| --- | --- | --- |
| 主题色 | `uno.config.ts` → `theme.colors['theme-color']` | `.vue` 里的 hex 字面量 |
| 页面底色 / 正文色 | `uno.config.ts` → `rules` 的 `page-bg-color` / `main-text-color` | 组件内 `:style` |
| 字体族 | `src/style.css` → `:root` | `#app` 布局与横屏媒体查询 |
| 字号 / 间距档位 | `DESIGN.md` 的 token 表 + 使用处 | `rules` 的 `-(\d+)` 定义（与数值无关） |

完整流程与验收（7 步，含 hex 扫描命令和 `npm run build`）见 `DESIGN.md` §1 末尾，交付时贴命令输出。

---

## 6. 布局前提：锁定横屏

- `index.html` 声明 `screen-orientation=landscape`；
- `style.css` 在竖屏时把 `#app` 旋转 90° 并交换宽高。

因此：**所有页面按横屏设计**，不写需要竖屏滚动的长页面，不写响应式断点（宽高由 vw 换算自适应）。
`#app` 已是 `position: fixed; width: 100%; height: 100%`，页面内不要再套全屏容器。
全局滚动条已隐藏，滚动区用 UnoCSS 的 overflow 类。

---

## 7. 路由

- hash 模式（`createWebHashHistory`），`base: './'`，可部署到任意子目录。
- 路由写在 `src/router/index.ts` 的 `staticRoutes`。
- keep-alive：路由 `name` 必须与组件 `name` 一致，进页面 `useKeepAliveStore().addKeepAliveRoute(name)`，
  离开时 `removeKeepAliveRoute(name)`。

---

## 8. 状态（Pinia）

统一 setup 式，新 store 放 `src/stores/modules/useXxx.ts`，**并在 `src/stores/index.ts` 末尾补**
`export * from './modules/useXxx'`：

```ts
export const useXxxStore = defineStore('xxx', () => {
  const list = ref<Item[]>([])
  return { list }
})
```

需要持久化时第三个参数传 `{ persist: true }`（插件已在 `stores/index.ts` 全局挂载），
不要再手动读写 localStorage。只把**跨页面共享**的状态放 store。

---

## 9. 请求

- axios 只允许出现在 `src/api/`。
- 开发代理：`/api` → `VITE_API_BASE_URL`，并自动去掉 `/api` 前缀。
  **代码里只写 `/api/xxx`**，不要拼域名、不要写 `http://`。
- 函数必须有明确返回类型，响应结构定义在 `src/types/index.ts`。
- 异步必须有 `try/catch` 或 `.catch()`；错误提示面向用户，不透出堆栈。

---

## 10. 环境变量与产物

| 文件 | 生效时机 | 用途 |
| --- | --- | --- |
| `.env` | 始终 | `VITE_APP_VERSION`（控制台版本号、打包目录名都取自它） |
| `.env.dev` | `npm run dev` | `VITE_API_BASE_URL` |
| `.env.prod` | `npm run build` | 生产 `VITE_API_BASE_URL` |

- 新增变量必须 `VITE_` 开头，并在 `src/vite-env.d.ts` 的 `ImportMetaEnv` 补声明。
- `__BUILD_TIME__` 由 `vite.config.ts` 的 `define` 注入，已在 d.ts 声明。
- 产物目录 `customBuildName-<VITE_APP_VERSION>`，已被 `.gitignore` 忽略。

---

## 11. 命名与格式

| 对象 | 规则 | 示例 |
| --- | --- | --- |
| 组件文件 | PascalCase，至少两个单词 | `VideoCard.vue` |
| 组件目录 | PascalCase | `VideoCard/` |
| 页面 | 放 `views/<模块>/`，文件名 `index.vue` 或语义名 | `views/library/index.vue` |
| Hook | `useXxx` | `useAuth` |
| store | `useXxxStore` | `useUserStore` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| 工具函数 / 变量 | camelCase | `formatDate` |
| 类型 / 接口 | PascalCase，不加 `I` 前缀 | `UserInfo` |
| CSS 类 | kebab-case | `copy-button` |

**格式以 `.prettierrc.json` 为准**：单引号、**不加分号**、**不加尾随逗号**（`trailingComma: "none"`）、
2 空格、`endOfLine: crlf`。注意不是"尾随逗号"，加逗号会被 `prettier/prettier` 报错。

导入顺序（自动导入的除外）：

```ts
// 1. vue / vue-router 显式导入（仅类型或自动导入未覆盖的）
// 2. element-plus 显式导入（极少需要）
// 3. 第三方库
// 4. @/ 别名
// 5. 相对路径
// 6. 样式文件
```

---

## 12. Git 与提交

- 遵循 Conventional Commits：`type(scope): description`，
  类型限 `feat / fix / docs / style / refactor / test / chore`。
- 提交信息用中文描述（见 `AGENTS.local.md`）。
- 只提交自己改动的文件，不要 `git add -A`。
- 禁止 `git stash`、禁止切换分支、禁止 rebase / reset 别人的提交——多 Agent 同时在用同一工作区。
- 禁止提交 lock 文件，除非本次确实新增/删除依赖且已获确认。

---

## 13. 错误处理

- 异步操作必须有 `try/catch` 或 `.catch()`，不允许空 catch 吞掉异常。
- 用户可见错误要友好提示，不暴露技术细节与堆栈。
- 接口错误统一在 `src/api/` 的请求封装里处理。
- 组件级错误用 `onErrorCaptured` 捕获（Vue 没有 ErrorBoundary）。

---

## 14. 界面文案

- **让布局解释界面**：分区、留白、层级、对齐本身就是说明，不要用文字去补。
- 禁止给每个区块加副标题 / 描述行；一屏最多一个主标题，区块之间用间距和分隔线区分。
- 禁止说明书式文案（「点击下方按钮开始」「此区域展示…」「在这里可以…」）。
- 按钮文案只写动词：`保存` / `导出` / `重试`，不写「点击保存」。
- 空状态、加载态不超过一行文字（`暂无数据` / `加载中`），不写解释性段落。
- 提示只在用户会做错或必须知情时出现；能用校验、禁用态、占位符表达的，不写说明文字。
- 同一功能全站同名，不出现「课程 / 课堂 / 课节」混用。

---

## 15. Bug 修复

- **先定位根因，再动代码**：交付时必须能说清「触发条件 → 数据怎么流 → 哪一行出错」三段，缺一段就是没定位。
- 禁止症状级修补：`try/catch` 吞异常、`setTimeout` 等一等、`?.` 兜底、加个 `if` 绕过去、注释掉校验，都算遮症状。
- **在责任层修**：数据错在取数层修，不在渲染层补默认值；接口错在 `src/api/` 修，不在组件里判空。
- 遵循项目既有实践与成熟方案：仓库里已有同类解法就复用，不引入新范式、不为一个 bug 换架构。
- 修完给一条可复现的验证：改前必现、改后消失的具体操作或命令，否则视为未修。

---

## 16. 完成定义

一个任务算完成 = 以下全部通过，并贴原始输出：

- [ ] `npm run build` 成功（内含 `vue-tsc -b`，类型错直接失败）
- [ ] `npx eslint .` 无 error
- [ ] 无 `any`、无未使用变量、无 `enum`、无 `@ts-ignore`
- [ ] 未使用未安装的库（VueUse / EP 图标）
- [ ] 新增页面已挂进路由，`npm run dev` 能打开
- [ ] 单文件 ≤ 200 行，组件名符合命名规则
- [ ] 样式不写死色值，1920 大屏页位于 `src/views/library/`

测试框架尚未配置。未经确认不要引入 vitest / jest，也不要在交付里写"测试通过"。

---

## 17. 交付格式

1. **变更文件清单**：路径 + 一句话说明
2. **根因**：问题为什么会发生（触发条件 + 出错点 + 为什么原代码会漏掉），不是「改了什么」
3. **公开接口**：新增/修改的 props、emits、store 字段、api 函数签名
4. **验证**：命令或操作路径 + 输出原文，能体现「改前失败、改后通过」，禁止写「应该能通过」
5. **未做的部分**：明确列出没做什么、为什么
