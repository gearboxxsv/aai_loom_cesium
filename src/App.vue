<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-layout>
    <v-app-bar>
      <v-btn :to="{ path: '/' }">Home</v-btn>
      <v-btn to="create">Create Post</v-btn>
      <v-btn to="posts">Posts</v-btn>
      <v-btn to="cesium">Cesium</v-btn>
    </v-app-bar>
    <v-main style="min-height: 300px">
      <RouterView />
    </v-main>
  </v-layout>
</template>

<style></style>
