import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isLogin = ref(false) //暫時設定為有登入

  const loginSuccess = () => {
    isLogin.value = true
  }

  return { isLogin, loginSuccess }
})
