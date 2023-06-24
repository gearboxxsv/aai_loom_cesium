import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNicknameStore = defineStore('nickname', () => {
  const myNickname = ref('')

  return { myNickname }
})
