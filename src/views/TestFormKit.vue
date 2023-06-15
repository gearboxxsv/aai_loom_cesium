<template>
  <div v-if="loading">
    <PSpinner />
  </div>
  <div class="form-container" v-else-if="schema">
    <FormKit type="form" id="loginform" :value="formdata" @submit="login">
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
import { useAuthStore } from '../stores/auth'

import { FormKitSchema } from '@formkit/vue'

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const formdata = ref(null)
const schema = ref(null)
const errorMessage = ref('')
const loading = ref(true)

// Mock import of form schema and dummy data until the Meteor function is working
import { mockSchema, mockFormdata } from '@/helpers/formschema/login'

onMounted(() => {
  server
    .connect()
    .then(() => {
      /*
      server
        .call('getLoginForm')
        .then((data) => {
          console.log('Form schema received: ' + JSON.stringify(data))
          schema.value = data.schema
          formdata.value = data.formdata
        })
        .catch((error) => {
          errorMessage.value = error.message
        })
      */
      schema.value = mockSchema
      formdata.value = mockFormdata
    })
    .catch((error) => {
      errorMessage.value = error.message
    })
    .finally(() => {
      loading.value = false
    })
})

async function login(credentials) {
  console.log(credentials)

  const authStore = useAuthStore()
  authStore
    .login(credentials.email, credentials.password)
    .then((email) => {
      toast.add({ severity: 'success', summary: 'Login Successful', detail: email, life: 3000 })
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error!', detail: error })
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
