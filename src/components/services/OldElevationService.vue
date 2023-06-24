<template>
  <div class="flex flex-column mt-3">
    <div class="flex flex-row gap-3 align-content-center align-items-center justify-content-center">
      <FormKit type="text" label="Latitude" v-model="latitude" />
      <FormKit type="text" label="Longitude" v-model="longitude" />
    </div>
    <div class="flex flex-row gap-3 align-content-center align-items-center justify-content-center">
      <FormKit type="button" @click="getLatLon">
        Fill Lat/Lon from Device
        <PSpinner
          style="height: 20px; width: 20px; margin-left: 5px"
          strokeWidth="8"
          v-if="autofillIsLoading"
        />
      </FormKit>
      <FormKit type="button" @click="getElevation" :disabled="!latitude || !longitude">
        Get Elevation
        <PSpinner
          style="height: 20px; width: 20px; margin-left: 5px"
          strokeWidth="8"
          v-if="getElevationIsLoading"
        />
      </FormKit>
    </div>
    <div class="elevation" v-if="elevation">Elevation: {{ elevation }} units</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const latitude = ref(null)
const longitude = ref(null)
const elevation = ref(null)
const navOptions = {
  enableHighAccuracy: true,
  timeout: 10000
}
//var watcher
const autofillIsLoading = ref(false)
const getElevationIsLoading = ref(false)

function getLatLon() {
  if (navigator.geolocation) {
    autofillIsLoading.value = true
    navigator.geolocation.getCurrentPosition(autoFillLocation, handleLocationError, navOptions)
    /*
    watcher = navigator.geolocation.watchPosition(
      (position) => {
        longitude.value = position.coords.longitude
        latitude.value = position.coords.latitude
      },
      handleLocationError,
      navOptions
    )
    */
  } else {
    alert('Geolocation is not supported by this browser.')
  }
}

function autoFillLocation(position) {
  longitude.value = position.coords.longitude
  latitude.value = position.coords.latitude
  autofillIsLoading.value = false
}

function getElevation() {
  getElevationIsLoading.value = true
  fetch(
    'https://elevation.drf.aero/api/v1/lookup?locations=' + latitude.value + ',' + longitude.value
  )
    .then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          console.log(data.results[0])
          elevation.value = data.results[0].elevation
        })
      }
    })
    .catch((err) => {
      console.log(err)
      elevation.value = ['API ERROR!']
    })
    .finally(() => {
      getElevationIsLoading.value = false
    })
}

function handleLocationError(error) {
  switch (error.code) {
    case 3:
      // ...deal with timeout
      console.log('Geolocation service timed out')
      //navigator.geolocation.clearWatch(watcher)
      break
    case 2:
      // ...device can't get data
      console.log('Cannot get location data')
      //navigator.geolocation.clearWatch(watcher)
      break
    case 1:
      // ...user said no
      console.log('Location permission denied by user')
    //navigator.geolocation.clearWatch(watcher)
  }
}
</script>

<style scoped>
.elevation {
  background-color: green;
  text-align: center;
  margin: 5px;
  padding: 5px;
  font-weight: bold;
  color: white;
}
</style>
