import { createRouter, createWebHistory } from 'vue-router'
import Dialogue from '../components/Dialogue.vue'
import Schedule from '../components/Schedule.vue'
import Settings from '../components/Settings.vue'
import models from '../components/models.vue'
import console from '../components/Console.vue'
import History from '../components/History.vue'

const routes = [
  { path: '/', redirect: '/dialogue' }, // 默认显示对话界面
  { path: '/dialogue', component: Dialogue },
  { path: '/schedule', component: Schedule },
  { path: '/settings', component: Settings },
  { path: '/models', component: models },
  { path: '/console', component: console },
  { path: '/history', component: History }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router