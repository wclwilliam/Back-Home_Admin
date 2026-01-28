import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const localStorageKey = 'USER' // 定義key的名字，不要跟前台一樣
const USERS = [
  { account: 'demo', password: '1234', token: 'fake_token_demo' },
  { account: 'ingrid', password: '5678', token: 'fake_token_ingrid' },
]

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const errorMsg = ref('')
  const isLogin = computed(() => token.value !== '')

  const loadStorage = () => {
    try {
      const cache = localStorage.getItem(localStorageKey)
      if (cache) token.value = cache
    } catch (e) {
      // localStorage 不能用時不要炸掉 app
      token.value = ''
    }
  }

  const login = (accountValue, passwordValue) => {
    errorMsg.value = ''
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
    return true
  }
  const logout = () => {
    token.value = ''
    errorMsg.value = ''
    localStorage.removeItem(localStorageKey)
  }
  loadStorage()
  return { token, errorMsg, isLogin, login, logout }
})
