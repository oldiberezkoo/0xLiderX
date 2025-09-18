<template>
  <div id="app">
    <!-- Проверяем, нужен ли сайдбар для текущего маршрута -->
    <Sidebar v-if="$route.meta.hasSidebar" />
    <div v-else class="w-full h-screen">
      <!-- Контент без сайдбара (например, главная страница) -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Sidebar from '@/widgets/sidebar/Sidebar.vue'

const route = useRoute()
</script>

<style>
#app {
  @apply w-full h-screen;
}
</style>
