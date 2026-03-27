<template>
  <div class="app-shell">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <main class="content" @click="closeSidebarOnMobile">
      <RouterView />
    </main>

    <button class="mobile-btn" aria-label="Toggle menu" @click.stop="sidebarOpen = !sidebarOpen">
      {{ sidebarOpen ? '✕' : '☰' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './components/sidebar/AppSidebar.vue'

const sidebarOpen = ref<boolean>(false)

function closeSidebarOnMobile(): void {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}
</script>
