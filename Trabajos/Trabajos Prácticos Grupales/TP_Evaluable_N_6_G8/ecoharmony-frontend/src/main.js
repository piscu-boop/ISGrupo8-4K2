import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import InscripcionView from './views/InscripcionView.vue'
import './assets/main.css'

const routes = [
  { path: '/', component: InscripcionView },
  { path: '/inscripcion', component: InscripcionView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
