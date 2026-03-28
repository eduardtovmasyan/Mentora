<template>
  <aside class="sidebar" :class="{ open: open }">

    <!-- Brand header -->
    <div class="sb-brand">
      <RouterLink :to="{ name: CourseRoute.Home }" class="sb-logo" @click="$emit('close')">
        <div class="logo-mark">M</div>
        <div class="logo-info">
          <div class="logo-name">Mentora</div>
          <div class="logo-sub">PHP Backend &amp; Cloud</div>
        </div>
      </RouterLink>
      <div class="sb-search">
        <span class="sb-si">⌕</span>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('nav.search')"
          autocomplete="off"
        />
      </div>
    </div>

    <!-- Progress -->
    <div class="sb-prog">
      <div class="sb-prog-row">
        <span class="sb-prog-label">{{ t('nav.progress') }}</span>
        <div class="sb-prog-right">
          <span class="sb-prog-count">{{ stats.done }} {{ t('nav.of') }} {{ totalLessons }}</span>
          <span class="sb-prog-pct">{{ stats.pct }}%</span>
        </div>
      </div>
      <div class="sb-prog-bg">
        <div class="sb-prog-fill" :style="{ width: `${stats.pct}%` }" />
      </div>
    </div>

    <!-- Nav -->
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

    <!-- Language switcher -->
    <div class="sb-footer">
      <LangSwitcher />
    </div>

  </aside>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import { useCourseStore } from '@/modules/course/stores/course.store.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'
import PhaseGroup from './components/PhaseGroup.vue'
import LangSwitcher from '@/modules/locale/components/LangSwitcher.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const progressStore = useProgressStore()

const searchQuery = ref<string>('')
const collapsedIds = reactive(new Set<string>())

const totalLessons = computed(() => courseStore.phases.reduce((s, p) => s + p.lessons.length, 0))
const stats = computed(() => progressStore.stats(courseStore.phases))

const filteredPhases = computed<IPhase[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return courseStore.phases
  return courseStore.phases
    .map((p) => ({ ...p, lessons: p.lessons.filter((l) => l.title.toLowerCase().includes(q)) }))
    .filter((p) => p.lessons.length > 0)
})

function togglePhase(id: string): void {
  if (collapsedIds.has(id)) collapsedIds.delete(id)
  else collapsedIds.add(id)
}

function navigate(lessonId: string): void {
  router.push({ name: CourseRoute.Lesson, params: { lessonId } })
  if (window.innerWidth <= 768) emit('close')
}
</script>
