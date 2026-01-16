import { useAuthStore } from '@/stores/auth'

export function authGuard(to,from,next) {
  const auth = useAuthStore()
  
    
  if (to.meta.requiresAuth && !auth.isLogin) {
    // 情況 A：需要登入但未登入 -> 強制跳轉到 /admin/login
    // 為了避免重複跳轉，確保 next 的目標不是目前的 to.path

    // 關鍵點：使用 query 紀錄原本想去的完整路徑 (to.fullPath)
    next({ 
      name: 'login',
      query: { redirect: to.fullPath }
     })
  }else if (to.name === 'login' && auth.isLogin) {
    // 情況 B：已登入卻想去登入頁 -> 自動導向後台首頁
    next({ name: 'admin-account' })
  }else {
    // 情況 C：不需要驗證，或者已登入 -> 放行
    next()
  }
}


