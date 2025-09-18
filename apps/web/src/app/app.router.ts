import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        hasSidebar: false, // Используем единое название
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Dashboard.vue'),
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        requiresAuth: true,
        hasSidebar: true,
      },
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/tasks',
      name: 'tasks',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Tasks.vue'),
    },
    {
      path: '/crawler',
      name: 'crawler',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Crawler.vue'),
    },
    {
      path: '/logs',
      name: 'logs',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Logs.vue'),
    },
    {
      path: '/ads',
      name: 'ads',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Ads.vue'),
    },
    {
      path: '/filters',
      name: 'filters',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Filters.vue'),
    },
    {
      path: '/storage',
      name: 'storage',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Storage.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Analytics.vue'),
    },
    {
      path: '/users',
      name: 'users',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Users.vue'),
    },
    {
      path: '/billing',
      name: 'billing',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Billing.vue'),
    },
    {
      path: '/invoices',
      name: 'invoices',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Invoices.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Settings.vue'),
    },
    {
      path: '/help',
      name: 'help',
      meta: {
        hasSidebar: true,
      },
      component: () => import('@/views/app/Help.vue'),
    },
  ],
})

export default router
