import axios from 'axios'

export const base = import.meta.env.BASE_URL
export const APIBase = import.meta.env.VITE_API_BASE

export const publicApi = axios.create({
  baseURL: base,
  timeout: 5000,
})

export const backHomeApi = axios.create({
  baseURL: APIBase,
  timeout: 5000,
})

// 添加請求攔截器，自動在請求中帶上 JWT token
backHomeApi.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token
    const token = localStorage.getItem('ADMIN_TOKEN')
    
    // 如果有 token，添加到 Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

//添加響應攔截器處理統一錯誤
backHomeApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 如果是 401 錯誤（未授權），可以跳轉到登入頁
    if (error.response && error.response.status === 401) {
      console.error('未授權，請重新登入')
    }
    return Promise.reject(error)
  }
)