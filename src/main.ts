import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/useThemeStore'
import { useLocaleStore } from './stores/useLocaleStore'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

useThemeStore().initTheme()
useLocaleStore().initLocale()

app.mount('#app')
