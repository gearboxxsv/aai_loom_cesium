<template>
  <div class="flex flex-column gap-1">
    <label for="nickname">Enter a nickname for your GPS position</label>
    <InputText
      type="text"
      id="nickname"
      v-model="nickname"
      @change="$emit('changeName', nickname)"
    />

    <PButton label="Load Entities" @click="$emit('initializeView')" disabled />
    <PButton label="Start Flight" @click="$emit('startAnimation')" />
    <PButton label="Center on Me" @click="$emit('centerOnMe')" />
    <PButton label="Reset Scene" @click="$emit('resetView')" />
  </div>
</template>

<script setup>
defineEmits(['initializeView', 'startAnimation', 'centerOnMe', 'resetView', 'changeName'])

import { ref } from 'vue'
import InputText from 'primevue/inputtext'

const nickname = ref('')
</script>
