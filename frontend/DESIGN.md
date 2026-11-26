# DESIGN.md — 视觉设计规范

> 与 `AGENTS.md` 配套：AGENTS.md 管工程与流程，本文管视觉与尺寸。
> AI 生成 UI 代码时按本文取值，不得自创颜色、字号、间距。
> 本文是可替换的设计源：换一套设计 = 改本文 §1 → 同步 `uno.config.ts` / `src/style.css`，流程见 §1 末。

---

## 0. 先明确：本项目有两套色彩来源

| 来源 | 谁在用 | 取值方式 |
| --- | --- | --- |
| Element Plus 主题变量 | EP 组件（按钮、输入框、表格、弹窗） | `var(--el-color-primary)` 等，**不要覆盖** |
| UnoCSS 自定义类 | 自建容器、文字、背景 | `text-theme-color` / `bg-theme-color` / `page-bg-color` / `main-text-color` |

两者色值不同（EP 主色 `#409EFF`，UnoCSS 主题色 `#3AB4EC`）。这是现状，不是错误：
**EP 组件内部保持 EP 默认，页面骨架与文案用 UnoCSS 类**。不要为了统一而改写 EP 主题变量。

---

## 1. Design Tokens

### 颜色

| Token | 值 | 用法 |
| --- | --- | --- |
| 主题色 | `#3AB4EC` | `text-theme-color` / `bg-theme-color` |
| 页面底色 | `#F0F3F5` | `page-bg-color` |
| 正文文字 | `#6D7479` | `main-text-color` |
| EP 主色 | `#409EFF` | `--el-color-primary`（EP 组件自动） |
| EP 成功 | `#67C23A` | `--el-color-success` |
| EP 警告 | `#E6A23C` | `--el-color-warning` |
| EP 错误 | `#F56C6C` | `--el-color-danger` |
| EP 信息 | `#909399` | `--el-color-info` |

> 旧版本本文写的 `#52c41a` / `#faad14` / `#ff4d4f` 是 Ant Design 的色值，与本项目无关，已废弃。
> 旧配置里的 `#2196f3` 与 `#3AB4EC` 是同义两色（`theme.colors` 与 `rules` 各写一份），已统一为 `#3AB4EC`。

除上表外**禁止在 `.vue` 里写 `#xxxxxx` 字面量**；确需新色值，先加进 `uno.config.ts` 再引用。

### 字号与行高

UnoCSS 的 `font-(\d+)` 和 `leading-(\d+)` 单位都是 **px**：

| 用途 | 类名 | 等价 |
| --- | --- | --- |
| 页面主标题 | `font-20` | 20px |
| 区块标题 | `font-16` | 16px |
| 正文 | `font-14` | 14px |
| 辅助说明 | `font-12` | 12px |
| 正文行高 | `leading-22` | 22px |

不使用 `text-sm` / `text-lg` 这类 preset 类，字号一律用 `font-N` 明确指定。

### 间距

- `-(\d+)` 系列数值即 px：`p-8` = 8px，`mt-16` = 16px，`gap-12` = 12px。
- 推荐取值：`4 / 8 / 12 / 16 / 24 / 32`，优先 **4 的倍数**（8px 网格是上限建议，允许半格 4px）。
- 不写 `p-[13px]` 这类任意值，用最近的规则值。

### 圆角、阴影

| 用途 | 写法 | 值 |
| --- | --- | --- |
| 卡片 / 按钮 / 输入框 | `rounded-4` | 4px |
| 大卡片 | `rounded-8` | 8px |
| 胶囊 | `rounded-full` | 999px |
| 卡片阴影 | `shadow-sm` | 轻 |
| 弹窗阴影 | `shadow-md` | 中 |

### 落地契约：每个设计值只有一个落点

| 设计值 | 唯一落点 | 生成 / 影响 |
| --- | --- | --- |
| 主题色 | `uno.config.ts` → `theme.colors['theme-color']` | `text-theme-color` / `bg-theme-color` / `border-theme-color` |
| 页面底色 | `uno.config.ts` → `rules` 里的 `page-bg-color` | `page-bg-color` |
| 正文文字 | `uno.config.ts` → `rules` 里的 `main-text-color` | `main-text-color` |
| 字号 / 行高 / 间距 / 圆角 / 宽高 | `uno.config.ts` → `rules` 的 `-(\d+)` 系列 | `font-14`、`p-8`、`rounded-4`…，单位 px |
| 字体族 | `src/style.css` → `:root { font-family }` | 全局排版基线 |
| 横屏与旋转基线 | `src/style.css` → `#app` + orientation 媒体查询 | 一般不动 |
| EP 组件色 | 不改，用 EP 默认 | 要改需覆盖 `--el-color-primary`，单独立项 |

三条硬约束：

- 一个 token 只能有一个落点。出现「`theme.colors` 和 `rules` 各写一份同名色」就是缺陷。
- `.vue` 与 `src/style.css` 里不出现 hex 字面量。
- 删 token 时连旧类名一起删，不留兼容别名——别名等于第二个真相源。

### 换设计（重做本文件）的执行流程

本文不是一次性文档：换一套设计时按下面 7 步走，AI 每次都照此执行。

1. **先改本文件 §1 的 token 表**——它是唯一真相源，代码跟着文档走，不是反过来。
2. **同步 `uno.config.ts`**：颜色进 `theme.colors`；语义色进 `rules`。字号/间距档位变化不用改 `rules`
   （`-(\d+)` 与具体数值无关）。
3. **只有字体变了才动 `src/style.css`** 的 `font-family`；`#app` 与横屏媒体查询属于布局基线，不属于设计变量。
4. **扫残留 hex**（项目根执行，输出必须为空）：
   ```powershell
   Get-ChildItem src -Recurse -Include *.vue,*.scss,*.css | Select-String -Pattern '#[0-9a-fA-F]{3,8}'
   ```
5. **`npm run build` 必须通过**（含 `vue-tsc` 类型检查）。
6. **抽查一个页面**：主题色、页面底色、字号、圆角四项与 §1 表一致。
7. **删掉被替换的旧 token 与旧类名**，不留双份定义。

---

## 2. 尺寸与适配（最容易出错）

1. **设计稿两档**：手机稿 375、横屏大屏稿 1920。
2. **px 构建时自动转 vw**：源码里按设计稿写 px，不要自己换算 vw。
3. **1920 稿的页面必须放 `src/views/library/`**，转换器靠路径判断设计稿宽度；放错目录整页尺寸错位。
4. 需要固定不缩放的尺寸（1px 边框、海报内定位）加 `keep-px` 类或使用 `*-pc.vue` 文件名。
5. **没有响应式断点**。全站按 `100vw × 100vh` 自适应，不写 `@media (max-width: 768px)` 那类断点。

---

## 3. 布局

- **锁定横屏**：`#app` 由 `style.css` 控制在竖屏时旋转 90°，页面一律按横屏构图。
- 页面根节点不要再写 `position: fixed; width: 100vw; height: 100vh`，`#app` 已经承担。
- 不做竖屏长滚动页；内容超出用内部滚动区 + 隐藏滚动条（全局已隐藏）。
- 刘海屏用 `pt-safe` / `pb-safe` / `p-safe`。
- 三栏类布局优先用 UnoCSS：`flex` + `gap-N`，不用 float、不用 absolute 硬定位堆砌。

---

## 4. 动效

| 场景 | 时长 | 缓动 |
| --- | --- | --- |
| 微交互（hover、按下） | 150ms | ease-out |
| 过渡（展开、切换） | 300ms | ease-in-out |
| 复杂动画（页面转场） | 500ms | cubic-bezier(0.4, 0, 0.2, 1) |

优先用 UnoCSS `transition` / `duration-300` 类；不要为单个元素写大段 keyframes。

---

## 5. 图标与插图

- **图标包未安装**：`@element-plus/icons-vue` 不在依赖里，UnoCSS 的 `presetIcons()` 也没有配图标集，
  `i-*` 类不生效。需要图标时先装包并按需注册，或手写内联 SVG；不要直接写 `<el-icon><Search /></el-icon>`。
- 图标尺寸：行内 `font-16`，操作栏 `font-24`，空状态 `font-48`。
- 空状态用 Element Plus `el-empty` 默认样式，不自制 SVG 插图。

---

## 6. 组件视觉约束

- 按钮：优先 `el-button`，圆形/文字按钮用其 `type` / `circle` / `text` 属性，不用 CSS 覆写。
- 表格、表单、弹窗：一律用 EP 组件，不自制同类组件。
- 卡片：`page-bg-color` 作页面底、白色卡片 `bg-white rounded-8 shadow-sm`。
- 文字层级只允许上述 4 档字号，不要出现 13px / 15px / 18px 这类中间值。
- 禁止内联 `style="..."`；动态值用 `:style`，静态值一律用 UnoCSS 类。

---

## 7. 自检清单（交付 UI 前）

- [ ] 没有写死 hex 色值（除 token 表）
- [ ] 一个设计值只有一个落点：改色只改 `uno.config.ts`
- [ ] `src/` 下无 hex 字面量（§1 第 4 步的扫描命令输出为空）
- [ ] 字号只用 `font-12/14/16/20`
- [ ] 间距是 4 的倍数，且用 `p-N` / `m-N` 而非任意值
- [ ] 1920 设计稿页面在 `src/views/library/` 下
- [ ] 没写响应式断点
- [ ] 没使用 `i-*` 图标类或未安装的图标组件
- [ ] 没写内联 `style`
