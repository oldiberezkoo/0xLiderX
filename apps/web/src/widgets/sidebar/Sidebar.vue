<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div
      :class="[
        'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-10',
        isCollapsed ? 'w-16' : 'w-64',
      ]"
    >
      <!-- Sidebar header (fixed height) -->
      <div class="h-14 border-b border-gray-100 flex items-center justify-between px-4">
        <div class="flex items-center gap-2 transition-all duration-200">
          <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">0X</span>
          </div>
          <span
            v-if="!isCollapsed"
            class="font-semibold text-gray-900 transition-opacity duration-300"
          >
            0xLiderX
          </span>
        </div>
        <button
          @click="toggleSidebar"
          class="hover:bg-gray-100 rounded transition-colors duration-200 p-1"
        >
          <Menu v-if="!isCollapsed" class="w-4 h-4 text-gray-500" />
          <ChevronLeft v-else class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Menu -->
      <div class="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div v-for="section in menuItems" :key="section.section" class="px-4 mb-6">
          <h3
            v-if="!isCollapsed"
            class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 transition-opacity duration-300"
          >
            {{ section.section }}
          </h3>
          <nav class="space-y-1">
            <a
              v-for="item in section.items"
              :key="item.title"
              @click.prevent="router.push(item.route)"
              class="flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              :class="{ 'bg-emerald-50 text-emerald-700': route.path === item.route }"
            >
              <div class="flex items-center gap-3">
                <component
                  :is="item.icon"
                  class="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                  :class="route.path === item.route ? 'text-emerald-600' : 'text-gray-400'"
                />
                <span v-if="!isCollapsed" class="transition-opacity duration-300">
                  {{ item.title }}
                </span>
              </div>
              <span
                v-if="item.badge && !isCollapsed"
                class="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {{ item.badge }}
              </span>
            </a>
          </nav>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1">
      <!-- Page header (same height as sidebar header) -->
      <div class="h-14 px-4 flex items-center bg-white border-b border-gray-200">
        <h1 class="text-lg font-semibold text-gray-900 transition-all duration-300">
          {{ currentPage }}
        </h1>
      </div>
      <!-- Main slot -->
      <div class="flex-1 p-4 overflow-y-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

<script setup>
import { ref, watch } from 'vue'
import {
  Zap,
  Globe,
  Bug,
  Clock,
  User,
  Shield,
  Database,
  BarChart3,
  CreditCard,
  Receipt,
  Settings,
  HelpCircle,
  ChevronLeft,
  MoreHorizontal,
  Menu,
} from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

// Define menuItems before using it in watchers
const menuItems = [
  {
    section: 'Операции',
    items: [
      { title: 'Дашборд', icon: Zap, route: '/dashboard' },
      { title: 'Запуски', icon: Clock, route: '/tasks' },
      { title: 'Паук', icon: Bug, route: '/crawler' },
      { title: 'Логи', icon: Database, route: '/logs' },
    ],
  },
  {
    section: 'Данные',
    items: [
      { title: 'Объявления', icon: Globe, route: '/ads' },
      { title: 'Фильтры', icon: User, route: '/filters', badge: 'НОВОЕ' },
      { title: 'Хранилища', icon: Shield, route: '/storage' },
      { title: 'Аналитика', icon: BarChart3, route: '/analytics' },
    ],
  },
  {
    section: 'Организация',
    items: [
      { title: 'Пользователи', icon: User, route: '/users' },
      { title: 'Подписка', icon: CreditCard, route: '/billing' },
      { title: 'Счета', icon: Receipt, route: '/invoices' },
      { title: 'Настройки', icon: Settings, route: '/settings' },
    ],
  },
  {
    section: 'Поддержка',
    items: [
      { title: 'FAQ', icon: HelpCircle, route: '/help' },
      { title: 'О системе', icon: MoreHorizontal, route: '/about' },
    ],
  },
]

const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const currentPage = ref('')

// Use a computed to get the current page title safely
import { computed } from 'vue'
const currentPageTitle = computed(() => {
  const found = menuItems.flatMap((s) => s.items).find((i) => i.route === route.path)
  return found ? found.title : ''
})

// Keep currentPage in sync for template compatibility
watch(
  () => route.path,
  () => {
    currentPage.value = currentPageTitle.value
  },
  { immediate: true },
)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
