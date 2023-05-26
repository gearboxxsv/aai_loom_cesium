import { createRouter, createWebHistory } from 'vue-router'

import HomeComponent from '../components/HomeComponent.vue'
import CreateComponent from '../components/CreateComponent.vue'
import IndexComponent from '../components/IndexComponent.vue'
import EditComponent from '../components/EditComponent.vue'
import CesiumViewer from '../components/CesiumViewer.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: HomeComponent
  },
  {
    name: 'CesiumViewer',
    path: '/cesium',
    component: CesiumViewer
  },
  {
    name: 'create',
    path: '/create',
    component: CreateComponent
  },
  {
    name: 'posts',
    path: '/posts',
    component: IndexComponent
  },
  {
    name: 'edit',
    path: '/edit/:id',
    component: EditComponent
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
