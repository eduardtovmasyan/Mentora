<template>
  <div class="app-shell">
    <header class="mobile-header">
      <button class="mh-toggle" :class="{ active: sidebarOpen }" aria-label="Toggle menu" @click.stop="sidebarOpen = !sidebarOpen">
        <span /><span /><span />
      </button>
      <RouterLink :to="{ name: CourseRoute.Home }" class="mh-logo" @click="sidebarOpen = false">
        Mentora<span>.</span>
      </RouterLink>
    </header>

    <div class="sb-backdrop" :class="{ open: sidebarOpen }" @click="sidebarOpen = false" />

    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <main class="content" @click="closeSidebarOnMobile">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import AppSidebar from './components/sidebar/AppSidebar.vue'

const sidebarOpen = ref<boolean>(false)

function closeSidebarOnMobile(): void {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}
</script>
