import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/TheHome.vue'
import TestTaskList from '../views/TestTaskList.vue'
import TestLogin from '../views/TestLogin.vue'
import CesiumViewer from '../views/CesiumViewer.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: HomeView
  },
  {
    name: 'CesiumViewer',
    path: '/cesium',
    component: CesiumViewer
  },
  {
    name: 'list',
    path: '/list',
    component: TestTaskList
  },
  {
    name: 'login',
    path: '/login',
    component: TestLogin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
