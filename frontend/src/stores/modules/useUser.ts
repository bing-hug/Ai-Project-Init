import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<User | null>(null)

  function setUser(user: User) {
    userInfo.value = user
  }

  return {
    userInfo,
    setUser
  }
})
