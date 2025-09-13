import './app.stylesheet.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './app.index.vue'
import AppRouter from './app.router'
import { createAuthGuard } from './app.router.guard'
const app = createApp(App)
app.use(createPinia())
app.use(AppRouter)
createAuthGuard(AppRouter)

app.mount('#app')
