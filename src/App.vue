<script setup>
import CesiumViewer from './views/CesiumViewer.vue'
</script>

<template>
  <main>
    <CesiumViewer />
    <PToast />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
}
</style>
