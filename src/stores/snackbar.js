import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore({
  id: 'snackbar',
  state: () => ({
    activate: false,
    snackbar: {
      message: '',
      color: ''
    }
  }),
  actions: {
    success(message) {
      this.activate = true
      this.snackbar = { message, color: 'green' }
    },
    error(message) {
      this.activate = true
      this.snackbar = { message, color: 'red' }
    },
    clear() {
      this.activate = false
      this.snackbar = {
        message: '',
        color: ''
      }
    }
  }
})
