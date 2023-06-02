<template>
  <v-row>
    <v-col>
      <v-card style="max-width: 500px; margin: auto">
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-form ref="loginForm" validate-on="submit lazy" @submit.prevent="login">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Email"
              type="email"
            ></v-text-field>
            <v-text-field
              v-model="password"
              :rules="passwordRules"
              label="Password"
              type="password"
            ></v-text-field>
            <v-btn
              block
              color="blue-darken-3"
              type="submit"
              value="login"
              :loading="loading"
              class="mt-5"
              >Login</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
//import { useAlertStore } from '../stores/alert'
import { useSnackbarStore } from '../stores/snackbar'
import { useAuthStore } from '../stores/auth'

export default {
  data() {
    return {
      loading: false,
      email: 'gdeeds@tegbiz.com',
      password: '1234567890',
      emailRules: [(v) => !!v || 'Email cannot be blank'],
      passwordRules: [(v) => !!v || 'Password cannot be blank']
    }
  },
  methods: {
    async login() {
      const { valid } = await this.$refs.loginForm.validate()
      if (valid) {
        this.loading = true
        const authStore = useAuthStore()
        //const alertStore = useAlertStore()
        const snackbarStore = useSnackbarStore()
        authStore
          .login(this.email, this.password)
          .then(() => {
            //alertStore.success(this.username + ' is now logged in')
            snackbarStore.success("Success! User '" + this.email + "' is now logged in.")
          })
          .catch((error) => {
            //alertStore.error(error)
            snackbarStore.error(error)
          })
          .finally(() => {
            this.loading = false
          })
      }
    }
  }
}
</script>
