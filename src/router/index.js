import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import TestTaskList from '../views/TestTaskList.vue'
import TestLogin from '../views/TestLogin.vue'
import TestChat from '../views/TestAnything.vue'
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
    name: 'chat',
    path: '/chat',
    component: TestChat
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
