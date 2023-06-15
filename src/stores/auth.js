import { server } from '../server'
import { defineStore } from 'pinia'
// import { router } from '../router/index'

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null
  }),
  actions: {
    // dummy code until server is working
    /*
    login(username, password) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // In this dummy code, username cannot be 'ryan', password must be 'password'
          if (username === 'ryan') return reject('Bad Ryan!')
          if (password != 'password') return reject('Incorrect password')
          return resolve(true)
        }, 3000)
      })
*/
    async login(email, password) {
      try {
        let user = await server.login({
          password,
          user: {
            email
          }
        })
        // update pinia state
        this.user = user

        // store user details and jwt in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user))

        // redirect to previous url or default to home page
        // router.push(this.returnUrl || '/')
        console.log('User is logged in')
        return email
      } catch (error) {
        console.log(error)
        throw Error(error.message)
      }
    }
    /*
    async logout() {
      try {
        await server.logout()
        this.user = null
        localStorage.removeItem('user')
        router.push('/account/login')
      } catch (error) {
        const alertStore = useAlertStore()
        alertStore.error(error)
      }
    }
*/
  }
})
