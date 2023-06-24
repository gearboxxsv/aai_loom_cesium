import { createRouter, createWebHistory } from 'vue-router'

import SceneControlsPanel from '@/components/panels/SceneControlsPanel.vue'
import ServicesPanel from '@/components/panels/ServicesPanel.vue'
import ThePlaceholder from '@/components/ThePlaceholder.vue'

const routes = [
  {
    name: 'scene-controls',
    path: '/controls',
    component: SceneControlsPanel
  },
  {
    name: 'services',
    path: '/services',
    component: ServicesPanel
  },
  {
    name: 'placeholder',
    path: '/',
    component: ThePlaceholder
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
