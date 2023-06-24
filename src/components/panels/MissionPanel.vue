<template>
  <div class="flex flex-column gap-2 m-3">
    <Dropdown
      v-model="selectedMission"
      :options="missions"
      optionLabel="name"
      optionValue="gufi"
      placeholder="Select a Mission"
      @change="$emit('showMission', selectedMission)"
    />
  </div>
</template>

<script setup>
defineProps(['missions'])
defineEmits(['showMission'])

import { ref } from 'vue'
import Dropdown from 'primevue/dropdown'

const selectedMission = ref(null)
</script>
