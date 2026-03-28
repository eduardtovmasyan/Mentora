<template>
  <aside class="sidebar" :class="{ open: open }">
    <div class="sb-head">
      <RouterLink :to="{ name: CourseRoute.Home }" class="sb-logo" @click="$emit('close')">
        <span class="logo-text">Mentora</span><span class="logo-dot">.</span>
      </RouterLink>
      <div class="sb-search">
        <span class="sb-search-icon">⌕</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search lessons…"
          autocomplete="off"
        />
      </div>
    </div>

    <SidebarProgress :stats="stats" />

    <nav class="sb-nav">
      <PhaseGroup
        v-for="phase in filteredPhases"
        :key="phase.id"
        :phase="phase"
        :collapsed="collapsedIds.has(phase.id)"
        :active-lesson-id="(route.params.lessonId as string)"
        :is-done="progressStore.isDone"
        @toggle="togglePhase(phase.id)"
        @navigate="navigate"
      />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import { useCourseStore } from '@/modules/course/stores/course.store.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'
import SidebarProgress from './components/SidebarProgress.vue'
import PhaseGroup from './components/PhaseGroup.vue'

defineProps<{ open: boolean }>()

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const progressStore = useProgressStore()

const searchQuery = ref<string>('')
const collapsedIds = reactive(new Set<string>())

const stats = computed(() => progressStore.stats(courseStore.phases))

const filteredPhases = computed<IPhase[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return courseStore.phases
  return courseStore.phases
    .map((p) => ({ ...p, lessons: p.lessons.filter((l) => l.title.toLowerCase().includes(q)) }))
    .filter((p) => p.lessons.length > 0)
})

function togglePhase(id: string): void {
  if (collapsedIds.has(id)) {
    collapsedIds.delete(id)
  } else {
    collapsedIds.add(id)
  }
}

const emit = defineEmits<{ close: [] }>()

function navigate(lessonId: string): void {
  router.push({ name: CourseRoute.Lesson, params: { lessonId } })
  if (window.innerWidth <= 768) emit('close')
}
</script>
