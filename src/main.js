import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VueAxios from 'vue-axios'
import axios from 'axios'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'

import { plugin, defaultConfig } from '@formkit/vue'
import { primeInputs } from '@sfxcode/formkit-primevue'

import '@/assets/main.css'
import 'primevue/resources/themes/lara-light-teal/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueAxios, axios)
app.use(PrimeVue)
app.use(ToastService)
app.use(
  plugin,
  defaultConfig({
    theme: 'genesis',
    inputs: primeInputs
  })
)

app.component('PButton', Button)
app.component('PToast', Toast)
app.component('PMessage', Message)
app.component('PSpinner', ProgressSpinner)
app.component('PDialog', Dialog)

app.mount('#app')
