import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: []
  }),
  getters: {
    getUser: (state) => state.users[0]
  },
  actions: {
    async fetchUsers() {
      try {
        const data = await axios.get('https://jsonplaceholder.typicode.com/users')
        this.users = data.data
      } catch (error) {
        alert(error)
        console.log(error)
      }
    }
  }
})
