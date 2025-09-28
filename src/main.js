import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import ClockView from './views/ClockView.vue'
import SetupView from './views/SetupView.vue'
import SettingsView from './views/SettingsView.vue'

const routes = [
  { path: '/', component: ClockView },
  { path: '/setup', component: SetupView },
  { path: '/settings', component: SettingsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
