<template>
  <div v-if="loading">
    <PSpinner />
  </div>
  <div class="form-container" v-else-if="schema">
    <FormKit type="form" @submit="submit">
      <FormKitSchema :schema="schema" />
    </FormKit>
  </div>
  <div v-else>
    <PMessage severity="error" :closable="false">SERVER ERROR! {{ errorMessage }}</PMessage>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { server } from '../server'
import { FormKitSchema } from '@formkit/vue'

const schema = ref(null)
const submitMethod = ref('submitForm')
const errorMessage = ref('')
const loading = ref(true)

onMounted(() => {
  server
    .connect()
    .then(() => {
      server
        .call('getLoginForm')
        .then((data) => {
          console.log('Form schema received: ' + JSON.stringify(data))
          schema.value = data.schema
          submitMethod.value = data.submitMethod
        })
        .catch((error) => {
          errorMessage.value = error.message
        })
    })
    .catch((error) => {
      errorMessage.value = error.message
    })
    .finally(() => {
      loading.value = false
    })
})

async function submit(formvalues) {
  console.log('Form data submitted: ' + JSON.stringify(formvalues))
  server
    .connect()
    .then(() => {
      server
        .call(submitMethod.value, formvalues)
        .then(() => {
          console.log('Form data submitted successfully')
        })
        .catch((error) => {
          console.log('ERROR! ' + error.message)
        })
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>

<style scoped>
.form-container {
  background-color: white;
  padding-left: 20px;
  padding-right: 20px;
  margin: 10px;
}
</style>
