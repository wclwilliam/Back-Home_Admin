import { useUserStore } from '@/stores/user'

export function authGuard(to) {
  const user = useUserStore()

  // 未登入且要去需要驗證的頁：但 login 本身要排除
  if (to.meta.requiresAuth && !user.isLogin && to.name !== 'login') {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
  // 已登入卻想去登入頁 -> 導向後台首頁
  if (to.name === 'login' && user.isLogin) {
    return { name: 'admin-account' }
  }
  // 不需要驗證，或者已登入 -> 放行
  return true
}
