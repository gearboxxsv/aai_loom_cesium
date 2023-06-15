<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Menubar from 'primevue/menubar';

const items = ref([
  {
    label: 'Home',
    to: { path: '/'}
  },
  {
    label: 'Log In',
    to: { path: '/login'}
  },
  {
    label: 'FormKit Test',
    to: { path: '/formkit'}
  },
  {
    label: 'Cesium Viewer',
    to: { path: '/cesium'}
  }
])
</script>

<template>
    <Menubar :model="items" />
    <main>
      <RouterView />
      <PToast />
    </main>
</template>

<style scoped>
main {
  display:flex;
  flex-direction: column;
  align-items:center;
  justify-content:center;
  background-color: black;
}
</style>