<template>
  <div class="flex flex-column gap-2 justify-content-center align-items-center">
    <FormKit type="form" submit-label="Log In" @submit="login">
      <h2>Log In</h2>
      <FormKit id="email" name="email" type="text" label="Email" :value="email" />
      <FormKit
        id="password"
        name="password"
        type="password"
        label="Password"
        :feedback="false"
        :value="password"
      />
    </FormKit>
  </div>
  <PButton label="Log Out" @click="logout" />
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Dummy data for dev -- delete these and the :value parameters in the inputs before production
import { ref } from 'vue'
const email = ref('gdeeds@tegbiz.com')
const password = ref('1234567890')

async function login(credentials) {
  console.log(credentials)
  const authStore = useAuthStore()
  authStore
    .login(credentials.email, credentials.password)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Login Successful',
        detail: credentials.email,
        life: 3000
      })
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error!', detail: error, life: 3000 })
    })
}

async function logout() {
  const authStore = useAuthStore()
  authStore
    .logout()
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'You have been logged out',
        life: 3000
      })
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error!', detail: error, life: 3000 })
    })
}
</script>
