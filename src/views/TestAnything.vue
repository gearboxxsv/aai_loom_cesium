<template>
  <v-sheet color="blue" class="pa-5" height="300">
    <FormKitSchema :schema="schemaArray" />
  </v-sheet>
</template>

<script>
import { FormKitSchema } from '@formkit/vue'

export default {
  setup() {},
  components: {
    FormKitSchema
  },
  data() {
    return {
      schemaArray: [
        {
          $el: 'h1',
          children: 'Log In'
        },
        {
          $formkit: 'text',
          name: 'email',
          label: 'Email',
          validation: 'required|email'
        },
        {
          $formkit: 'password',
          name: 'password',
          label: 'password',
          validation: 'required'
        }
      ]
    }
  },
  methods: {}
}
</script>

<style scoped>
input {
  border: 1px solid black !important;
}
</style>
