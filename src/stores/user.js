import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authAPI } from '@/utils/adminApi'

// JWT Token 儲存在 localStorage（不使用 token table）
const TOKEN_KEY = 'ADMIN_TOKEN'
const USER_KEY = 'ADMIN_USER'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const user = ref(null)
  const errorMsg = ref('')
  const isLogin = computed(() => token.value !== '')

  // 從 localStorage 載入資料
  const loadStorage = () => {
    try {
      const cachedToken = localStorage.getItem(TOKEN_KEY)
      const cachedUser = localStorage.getItem(USER_KEY)
      if (cachedToken) token.value = cachedToken
      if (cachedUser) user.value = JSON.parse(cachedUser)
    } catch (e) {
      token.value = ''
      user.value = null
    }
  }

  // 登入
  const login = async (accountValue, passwordValue) => {
    errorMsg.value = ''

    // 驗證輸入
    if (!accountValue || !passwordValue) {
      errorMsg.value = '請輸入帳號或密碼'
      return false
    }

    try {
      // 調用登入 API
      const response = await authAPI.login({
        ADMIN_ID: accountValue,
        ADMIN_PWD: passwordValue,
      })

      // 檢查回應中是否有 token
      if (!response.token) {
        errorMsg.value = '登入失敗：未取得 token'
        return false
      }

      // 儲存 token 和用戶資訊（欄位統一為大寫）
      token.value = response.token
      const admin = response.admin || {}
      const normalizedAdmin = {
        ADMIN_ID: admin.ADMIN_ID ?? admin.admin_id ?? '',
        ADMIN_NAME: admin.ADMIN_NAME ?? admin.admin_name ?? '',
        ADMIN_ROLE: admin.ADMIN_ROLE ?? admin.admin_role ?? '',
      }
      user.value = normalizedAdmin

      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedAdmin))

      return true
    } catch (error) {
      if (error.message === 'invalid_credentials') {
        errorMsg.value = '帳號或密碼錯誤'
      } else {
        errorMsg.value = '登入失敗，請稍後重試'
      }
      return false
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    user.value = null
    errorMsg.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // 初始化時載入
  loadStorage()

  return { token, user, errorMsg, isLogin, login, logout }
})
