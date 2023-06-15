<template>
  <div class="flex flex-column justify-content-center mb-3">
    <h2>Log In</h2>
    <form
      @submit.prevent="login"
      class="flex flex-column gap-3 p-3"
      style="background-color: white"
    >
      <label for="email">Email</label>
      <InputText id="email" v-model="email" type="text" />

      <label for="password">Password</label>
      <Password id="password" v-model="password" type="password" :feedback="false" />

      <PButton type="submit" label="Log In" class="mt-3" />
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

const email = ref('gdeeds@tegbiz.com')
const password = ref('1234567890')

async function login() {
  const authStore = useAuthStore()
  authStore
    .login(email.value, password.value)
    .then((email) => {
      toast.add({ severity: 'success', summary: 'Login Successful', detail: email, life: 3000 })
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error!', detail: error, life: 3000 })
    })
}
</script>
