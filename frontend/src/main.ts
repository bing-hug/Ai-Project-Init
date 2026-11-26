import { createApp } from 'vue'
import './style.css'
import 'virtual:uno.css'
import App from './App.vue'
import router from '@/router'
import pinia from '@/stores'
import { printAppVersion } from '@/utils/version'
import 'element-plus/es/components/message-box/style/css.mjs'
import 'element-plus/es/components/message/style/css.mjs'

printAppVersion()

const app = createApp(App)

app.use(router)
app.use(pinia)
app.mount('#app')
