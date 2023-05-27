<template>
  <v-alert v-if="alert" :type="alert.type" :text="alert.message" closable>
    <template v-slot:close>
      <v-btn icon="mdi-close-circle" density="compact" size="large" @click="clear"></v-btn>
    </template>
  </v-alert>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAlertStore } from '../stores/alert'
const alertStore = useAlertStore()
const { alert } = storeToRefs(alertStore)
const { clear } = alertStore
</script>
