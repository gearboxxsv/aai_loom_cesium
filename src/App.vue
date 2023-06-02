<script setup>
import { RouterView } from 'vue-router'
import TheAlert from '@/components/TheAlert.vue'
import TheSnackbar from '@/components/TheSnackbar.vue'
</script>

<template>
  <v-layout>
    <v-app-bar>
      <v-btn :to="{ path: '/' }">Home</v-btn>
      <v-btn to="list">Tasks Test</v-btn>
      <v-btn to="login">Login Test</v-btn>
      <v-btn to="chat">FormKit Test</v-btn>
      <v-btn to="cesium">Cesium</v-btn>
    </v-app-bar>
    <v-main>
      <TheAlert />
      <TheSnackbar />
      <v-container fill-height id="appWindow" class="justify-center align-center">
        <RouterView />
      </v-container>
    </v-main>
  </v-layout>
</template>

<style>
#appWindow {
  background-color: black;
  color: sandybrown;
  min-height: 600px;
}
</style>
