import './app.stylesheet.css'

import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import App from './app.index.vue'
import AppRouter from './app.router'
const app = createApp(App)
app.use(createPinia())
app.use(AppRouter)
// createAuthGuard(AppRouter)


app.mount('#app')
