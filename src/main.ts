import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 安装Pinia
app.use(createPinia())

// 安装Element Plus
app.use(ElementPlus)

// 安装路由
app.use(router)

app.mount('#app')
