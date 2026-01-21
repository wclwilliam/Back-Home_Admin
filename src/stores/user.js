import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const localStorageKey = 'USER' // 定義key的名字
const USERS = [
  { account: 'demo', password: '1234', token: 'fake_token_demo' },
  { account: 'ingrid', password: '5678', token: 'fake_token_ingrid' },
]

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const errorMsg = ref('')
  const isLogin = computed(() => token.value !== '')

  const loadStorage = () => {
    // 讀取localStorage
    const cache = localStorage.getItem(localStorageKey)
    if (cache) {
      token.value = cache
    }
  }

  const login = (accountValue, passwordValue) => {
    // 先判斷
    if (!accountValue || !passwordValue) {
      errorMsg.value = '請輸入帳號或密碼'
      return false
    }
    const result = USERS.find((user) => {
      return user.account === accountValue && user.password === passwordValue
    })
    if (!result) {
      errorMsg.value = '登入失敗'
      return false
    }
    // 成功登入再寫入localStorage
    token.value = result.token
    localStorage.setItem(localStorageKey, result.token) // 只吃字串(用JSON.stringify字串化)
  }
  const logout = () => {
    token.value = ''
    localStorage.removeItem(localStorageKey)
  }
  loadStorage()
  return { token, isLogin, login, logout }
})
