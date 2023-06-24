<template>
  <div class="overlay-container flex flex-column">
    <div class="form-header">Services Control Panel</div>
    <div class="select-service flex flex-row gap-3 align-content-center align-items-center">
      <p>Select Service</p>
      <select v-model="selectedService" @change="resetForm">
        <option v-for="option in serviceOptions" :value="option.value" v-bind:key="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="select-agreement flex flex-row gap-3 align-content-center align-items-center">
      <p v-if="serviceReady">Selected Agreement</p>
      <p v-else>Select Agreement</p>
      <p
        class="flex flex-grow-1 justify-content-center text-orange-400 font-bold"
        v-if="serviceReady"
      >
        {{ selectedAgreement }}
      </p>
      <select v-model="selectedAgreement" class="flex flex-grow-1 align-self-center" v-else>
        <option v-for="option in agreementOptions" :value="option.value" v-bind:key="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <button type="button" class="block ml-2 mr-2" @click="contractService" v-if="!serviceReady">
      PURCHASE SERVICE CONTRACT
    </button>
    <div class="form-error" v-if="hasError">Please make a selection in each section above</div>
    <div class="service-ready" v-if="serviceReady">Service Ready</div>
    <div class="service-waiting" v-else>Waiting for Contract Selections</div>
    <div class="subcontainer">
      <component v-bind:is="currentSubComponent" v-if="currentSubComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'

const serviceOptions = ref([])
const agreementOptions = ref([])
const selectedService = ref(null)
const selectedAgreement = ref(null)
const hasError = ref(false)
const serviceReady = ref(false)

const currentSubComponent = computed(() => {
  if (serviceReady.value) {
    if (selectedService.value == 'did:drf:4d77b3f8-c092-4de8-82d3-2312b2865660')
      return defineAsyncComponent(() => import('../services/ElevationService.vue'))
    return defineAsyncComponent(() => import('../services/ServicePlaceholder.vue'))
  } else {
    return null
  }
})

onMounted(() => {
  fetch('https://airmap.loom.aero/api/catalog')
    .then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          serviceOptions.value = data.catalog.map((catalog) => {
            return {
              label: catalog.name,
              value: catalog.id
            }
          })
        })
      }
    })
    .catch((err) => {
      console.log(err)
      serviceOptions.value = ['API ERROR! No options found.']
    })
  fetch('https://airmap.loom.aero/api/contracts')
    .then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          agreementOptions.value = data.types.map((types) => {
            return {
              label: types.agreement_type + ' Cost:' + types.info.cost.price,
              value: types.agreement_type
            }
          })
        })
      }
    })
    .catch((err) => {
      console.log(err)
      agreementOptions.value = ['API ERROR! No options found.']
    })
})

async function contractService() {
  if (selectedService.value && selectedAgreement.value) {
    hasError.value = false
    serviceReady.value = true
  } else {
    hasError.value = true
  }
}

function resetForm() {
  selectedAgreement.value = null
  serviceReady.value = false
  hasError.value = false
}
</script>

<style scoped>
p {
  margin: 0;
  padding: 0;
}
.overlay-container {
  margin: 1px;
  min-width: 300px;
  color: white;
  background-color: darkslategray;
}
.form-header {
  padding: 5px;
  text-align: center;
}
.select-service {
  background-color: darkblue;
  padding: 10px;
}
.select-agreement {
  padding: 10px;
}
.form-error {
  background-color: red;
  text-align: center;
  margin: 5px 0;
  font-size: small;
  font-weight: bold;
}
.service-ready {
  background-color: green;
  text-align: center;
  margin: 5px 0;
  font-size: small;
  font-weight: bold;
}
.service-waiting {
  background-color: rgb(196, 127, 0);
  text-align: center;
  margin: 5px 0;
  font-size: small;
  font-weight: bold;
}
.subcontainer {
  background-color: white;
  color: black;
  overflow: auto;
}
</style>
