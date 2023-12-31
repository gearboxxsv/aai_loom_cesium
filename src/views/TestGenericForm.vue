<template>
  <div v-if="loading">
    <PSpinner />
  </div>
  <div class="form-container" v-if="schema">
    <FormKit type="form" :value="formdata" @submit="submitForm">
      <FormKitSchema :schema="schema" />
    </FormKit>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { server } from '../server'
import { FormKitSchema } from '@formkit/vue'
import { getNode } from '@formkit/core'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

const formname = ref('elevationservice')
const schema = ref(null)
const formdata = ref(null)
const submitMethod = ref('processForm')
const loading = ref(true)

onMounted(() => {
  server
    .connect()
    .then(() => {
      server
        .call('getForm', formname.value)
        .then((data) => {
          console.log('Form schema received: ' + JSON.stringify(data))
          schema.value = data.schema
          submitMethod.value = data.submitMethod
          formdata.value = data.formdata
          if (formname.value == 'elevationservice') {
            getLatLon()
          }
        })
        .catch((error) => {
          console.log(error)
        })
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      loading.value = false
    })
})

async function submitForm(formvalues) {
  server
    .connect()
    .then(() => {
      server
        .call(submitMethod.value, formname.value, formvalues)
        .then((res) => {
          console.log('Form data submitted successfully: ' + JSON.stringify(formvalues))
          console.log('Data received: ' + JSON.stringify(res))
          toast.add({
            severity: 'info',
            summary: 'Response Received',
            closable: true,
            detail: JSON.stringify(res)
          })
        })
        .catch((error) => {
          console.log(error)
        })
    })
    .catch((error) => {
      console.log(error)
    })
}

function getLatLon() {
  const navOptions = {
    enableHighAccuracy: true,
    timeout: 10000
  }
  function autoFillLocation(position) {
    const nodeLat = getNode('latitude')
    const nodeLon = getNode('longitude')
    nodeLat.input(position.coords.latitude)
    nodeLon.input(position.coords.longitude)
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(autoFillLocation, handleLocationError, navOptions)
  } else {
    alert('Geolocation is not supported by this browser.')
  }
}

/*
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
}
*/
</script>

<style scoped>
.form-container {
  background-color: white;
  padding-left: 20px;
  padding-right: 20px;
  margin: 10px;
}
</style>
