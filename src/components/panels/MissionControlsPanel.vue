<template>
  <div class="flex flex-column gap-2 m-3" v-if="nicknameStore.myNickname">
    <div class="flex flex-row align-items-center justify-content-center">
      <span>Your Nickname: </span>
      <span class="font-bold ml-1">{{ nicknameStore.myNickname }}</span>
      <span class="p-buttonset ml-2">
        <PButton
          title="Center view on my GPS position"
          icon="pi pi-map-marker"
          size="small"
          @click="$emit('centerOnMe')"
        />
        <PButton title="Reset view to default" icon="pi pi-undo" size="small" @click="reset" />
      </span>
    </div>
    <label for="missionSelect">Displayed Mission:</label>
    <Dropdown
      v-model="selectedMission"
      id="missionSelect"
      :options="missions"
      optionLabel="name"
      optionValue="gufi"
      placeholder="Select a Mission"
      @change="$emit('showMission', selectedMission)"
    />
    <div class="flex flex-column gap-2" v-if="selectedMission">
      <div class="flex flex-row gap-2">
        <PButton label="Start Simulation" size="small" @click="$emit('startAnimation')" />
        <Dropdown
          v-model="selectedGps"
          id="gpsSelect"
          :options="gpsList"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a GPS to view from:"
          @change="$emit('centerOnGps', selectedGps)"
        />
      </div>
    </div>
  </div>

  <div class="flex flex-column gap-1 m-3" v-else>
    <label for="nickname">Enter a nickname for your GPS position</label>
    <InputText type="text" id="nickname" v-model="nickname" />
    <small id="nickname-error" class="p-error" v-if="nicknameError"
      >Please enter a nickname to begin.</small
    >
    <PButton label="Start" @click="start" />
  </div>
</template>

<script setup>
defineProps(['missions', 'gpsList'])
const emit = defineEmits([
  'initializeView',
  'startAnimation',
  'centerOnMe',
  'resetView',
  'showMission'
])

import { ref } from 'vue'
import { useNicknameStore } from '@/stores/nickname'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'

const selectedMission = ref(null)
const nicknameStore = useNicknameStore()
const nickname = ref(null)
const nicknameError = ref(null)
const selectedGps = ref(null)

function start() {
  if (nickname.value) {
    nicknameStore.myNickname = nickname
    emit('initializeView', nickname)
    nicknameError.value = false
  } else {
    nicknameError.value = true
  }
}

function reset() {
  selectedMission.value = null
  emit('resetView')
}
</script>
