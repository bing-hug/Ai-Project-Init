import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import postcsspxtoviewport from 'postcss-px-to-viewport-8-plugin'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

function formatDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

const buildTime = formatDate(new Date())

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd())
  // 后端地址只用于开发期代理；生产走 Nginx 同源转发，不需要配域名
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
  return {
    // 部署在站点根目录，静态资源用绝对路径，避免深层路径下 404
    base: '/',
    define: {
      __BUILD_TIME__: JSON.stringify(buildTime)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    css:{
      postcss: {
        plugins: [
          postcsspxtoviewport({
            // (String) 需要转换的单位，默认为"px"
            unitToConvert: 'px',
            // (Number) 设计稿的视口宽度
            viewportWidth: (file: string) => {
              //num是设计稿的宽度
              let num = 375
              const filePath = file.replace(/\\/g, '/')
              //van是375
              if (filePath.indexOf('van') > 0) {
                num = 375
              } else if (
                filePath.indexOf('/views/library/') > 0 ||
                filePath.indexOf('uno.css') > 0
              ) {
                // 图书馆首页为 1920×1080 横屏设计稿（含 UnoCSS 生成的样式）
                num = 1920
              }
              return num
            },
            // (Number) 单位转换后保留的精度
            unitPrecision: 5,
            /**
             * (Array) 能转化为vw的属性列表
             * 传入特定的CSS属性；
             * 可以传入通配符""去匹配所有属性，例如：['']；
             * 在属性的前或后添加"*",可以匹配特定的属性. (例如['position'] 会匹配 background-position-y)
             * 在特定属性前加 "!"，将不转换该属性的单位 . 例如: ['*', '!letter-spacing']，将不转换letter-spacing
             * "!" 和 ""可以组合使用， 例如: ['', '!font*']，将不转换font-size以及font-weight等属性
             */
            propList: ['*'],
            // (String) 希望使用的视口单位
            viewportUnit: 'vw',
            // (String) 字体使用的视口单位
            fontViewportUnit: 'vw',
            /**
             * (Array) 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
             * 如果传入的值为字符串的话，只要选择器中含有传入值就会被匹配：例如 selectorBlackList 为 ['body'] 的话， 那么 .body-class 就会被忽略
             * 如果传入的值为正则表达式的话，那么就会依据CSS选择器是否匹配该正则：例如 selectorBlackList 为 [/^body$/] , 那么 body 会被忽略，而 .body 不会
             */
            selectorBlackList: ['keep-px', 'el', '--el'],
            // (Number) 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            minPixelValue: 1,
            // (Boolean) 媒体查询里的单位是否需要转换单位
            mediaQuery: true,
            // (Boolean) 是否直接更换属性值，而不添加备用属性
            replace: true,
            /**
             * (Array or Regexp) 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
             * 如果值是一个正则表达式，那么匹配这个正则的文件会被忽略
             * 如果传入的值是一个数组，那么数组里的值必须为正则
             */
            exclude: [
              /node_modules\/element-plus/,
              /src\/views\/.*\/.*pc-/,
              /src\/views\/.*\/.*-pc*/,
              /node_modules\/@wangeditor\/editor/,
              /src\/components\/.*-pc*/,
            ],
            /**
             * (Array or Regexp) 如果设置了include，那将只有匹配到的文件才会被转换，例如只转换 'src/mobile' 下的文件 (include: /\/src\/mobile\//)
             * 如果值是一个正则表达式，将包含匹配的文件，否则将排除该文件             * 如果传入的值是一个数组，那么数组里的值必须为正则
             */
            include: undefined,
            // (Boolean) 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
            landscape: false,
            // (String) 横屏时使用的单位
            landscapeUnit: 'vw',
            // (Number) 横屏时使用的视口宽度
            landscapeWidth: 768
          })
        ]
      }
    },
    plugins: [
      vue(),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'types/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    server: {
      port: 5170,
      proxy: {
        // 后端本身就以 /api 开头，这里不能再 rewrite，否则 /api/health 会变成 /health 而 404
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  }
})
