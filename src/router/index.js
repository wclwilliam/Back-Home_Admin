import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: { name: 'admin-account' },
      meta: { requiresAuth: true }, // 後台全部要登入
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
          path: 'news/add',
          name: 'news-add',
          component: () => import('@/views/NewsEdit.vue'),
        },
        {
          path: 'activity',
          name: 'admin-activity',
          component: () => import('@/views/ActivityView.vue'),
        },
        {
          path: 'activity/create',
          name: 'activityCreate',
          component: () => import('@/views/ActivityDetailView.vue'),
        },
        {
          path: 'activity/edit/:id',
          name: 'activityEdit',
          component: () => import('@/views/ActivityDetailView.vue'),
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
          redirect: {name: 'impact'},
          children: [
            {
              path: 'impact',
              name: 'impact',
              component: () => import('@/views/ImpactView.vue'),
            },
            {
              path: 'report',
              name: 'report',
              component: () => import('@/views/ReportView.vue'),
            },
            {
              path: 'rescue',
              name: 'rescue',
              component: () => import('@/views/RescueView.vue'),
            },
          ]
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
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

router.beforeEach(authGuard)

export default router
