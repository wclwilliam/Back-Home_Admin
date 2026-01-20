import { createRouter, createWebHistory } from 'vue-router'

// 1. 根據你的檔案結構截圖，Layout 在 layouts 資料夾
import AdminLayout from '@/layouts/AdminLayout.vue'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- 前台路由 (保持原狀，若有 HomeView 可加回) ---
    // {
    //   path: '/',
    //   name: 'home',
    //   component: () => import('@/views/HomeView.vue')
    // },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }, // 登入頁不需要驗證
    },

    // --- 後台管理路由 ---
    {
      path: '/',
      component: AdminLayout,
      // 2. 修改預設導向：因為目前只有 ActivityView 是真的存在的，先導向這裡
      redirect: 'activity',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'account',
          name: 'admin-account',
          component: () => import('@/views/AccountView.vue'),
        },
        {
          path: 'news',
          name: 'admin-news',
          component: () => import('@/views/NewsView.vue'),
        },
        {
          path: '/news/add',
          name: 'news-add',
          component: () => import('@/views/NewsEdit.vue'),
        },
        {
          path: 'activity',
          name: 'admin-activity',
          component: () => import('@/views/ActivityView.vue'),
        },
        {
          path: 'donations',
          name: 'admin-donations',
          component: () => import('@/views/DonationsView.vue'),
        },
        {
          path: 'data',
          name: 'admin-data',
          component: () => import('@/views/DataView.vue'),
        },
        {
          path: 'members',
          name: 'admin-members',
          component: () => import('@/views/MembersView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

router.beforeEach(authGuard)

export default router
