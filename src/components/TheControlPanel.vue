<template>
  <TabView>
    <KeepAlive>
      <TabPanel>
        <template #header>
          <i class="pi pi-compass mr-2"></i>
          <span>Mission</span>
        </template>
        <MissionControlsPanel
          :missions="missions"
          :gpsList="gpsList"
          @show-mission="(gufi) => $emit('showMission', gufi)"
          @initialize-view="(nickname) => $emit('initializeView', nickname)"
          @start-animation="$emit('startAnimation')"
          @reset-view="$emit('resetView')"
          @center-on-gps="(id) => $emit('centerOnGps', id)"
        />
      </TabPanel>
    </KeepAlive>
    <TabPanel>
      <template #header>
        <i class="pi pi-shopping-cart mr-2"></i>
        <span>Services</span>
      </template>
      <ServicesPanel />
    </TabPanel>
    <!--
    <TabPanel>
      <template #header>
        <i class="pi pi-compass mr-2"></i>
        <span>Mission Select</span>
      </template>
      <MissionPanel :missions="missions" @show-mission="(gufi) => $emit('showMission', gufi)" />
    </TabPanel>
    <TabPanel>
      <template #header>
        <i class="pi pi-sliders-h mr-2"></i>
        <span>Scene Controls</span>
      </template>
      <SceneControlsPanel
        @initialize-view="$emit('initializeView')"
        @start-animation="$emit('startAnimation')"
        @center-on-me="$emit('centerOnMe')"
        @reset-view="$emit('resetView')"
        @change-name="(nickname) => $emit('changeName', nickname)"
      />
    </TabPanel>
    <TabPanel>
      <template #header>
        <i class="pi pi-user-edit mr-2"></i>
        <span>Account</span>
      </template>
      <AccountPanel />
    </TabPanel>
  -->
  </TabView>
</template>

<script setup>
defineProps(['missions', 'gpsList'])
defineEmits(['initializeView', 'startAnimation', 'resetView', 'showMission', 'centerOnGps'])

import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

import MissionControlsPanel from './panels/MissionControlsPanel.vue'
import ServicesPanel from './panels/ServicesPanel.vue'
//import MissionPanel from './panels/MissionPanel.vue'
//import SceneControlsPanel from './panels/SceneControlsPanel.vue'
//import AccountPanel from './panels/AccountPanel.vue'
</script>
