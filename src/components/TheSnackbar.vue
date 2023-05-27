<template>
  <v-snackbar v-model="activate" :color="snackbar.color">
    {{ snackbar.message }}
    <template v-slot:actions>
      <v-btn icon="mdi-close-circle" density="compact" size="large" @click="clear"></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSnackbarStore } from '../stores/snackbar'
const snackbarStore = useSnackbarStore()
const { activate, snackbar } = storeToRefs(snackbarStore)
const { clear } = snackbarStore
</script>
