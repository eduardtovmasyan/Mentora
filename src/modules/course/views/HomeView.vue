<template>
  <div class="home-page">
    <div class="home-hero-glow" />

    <div class="home-content">
      <div class="home-eyebrow">
        <span class="eyebrow-dot" />
        {{ t('home.eyebrow', { duration: courseStore.meta.duration }) }}
      </div>

      <h1 class="home-title">
        <span class="c1">{{ t('home.title_php') }}</span> {{ t('home.title_backend') }}<br />
        {{ t('home.title_and') }} <span class="c2">{{ t('home.title_cloud') }}</span> {{ t('home.title_eng') }}
      </h1>

      <p class="home-sub">{{ t('home.subtitle') }}</p>

      <div class="home-cta">
        <button class="btn-primary" @click="onContinue">
          {{ stats.done > 0 ? t('home.cta_continue') : t('home.cta_start') }}
          <span class="btn-arr">→</span>
        </button>
        <button v-if="stats.done > 0" class="btn-ghost" @click="scrollToPhases">
          {{ t('home.cta_browse') }}
        </button>
      </div>

      <div class="home-stats">
        <div class="hs">
          <div class="hs-n">{{ courseStore.totalLessons }}</div>
          <div class="hs-l">{{ t('home.stat_lessons') }}</div>
        </div>
        <div class="hs">
          <div class="hs-n">{{ courseStore.phases.length }}</div>
          <div class="hs-l">{{ t('home.stat_phases') }}</div>
        </div>
        <div class="hs">
          <div class="hs-n">{{ stats.done }}</div>
          <div class="hs-l">{{ t('home.stat_completed') }}</div>
        </div>
        <div class="hs">
          <div class="hs-n">{{ stats.pct }}%</div>
          <div class="hs-l">{{ t('home.stat_progress') }}</div>
        </div>
        <div class="hs">
          <div class="hs-n">22</div>
          <div class="hs-l">{{ t('home.stat_weeks') }}</div>
        </div>
      </div>

      <div ref="phasesRef" class="section-label">{{ t('home.path_label') }}</div>

      <div class="phase-cards">
        <PhaseCard
          v-for="(phase, idx) in courseStore.phases"
          :key="phase.id"
          :phase="phase"
          :index="idx"
          @click="openPhase(phase)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import { useCourseStore } from '@/modules/course/stores/course.store.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'
import PhaseCard from '@/modules/course/components/phase-card/PhaseCard.vue'

const { t } = useI18n()
const router = useRouter()
const courseStore = useCourseStore()
const progressStore = useProgressStore()
const phasesRef = ref<HTMLElement | null>(null)

const stats = computed(() => progressStore.stats(courseStore.phases))

const firstIncompleteId = computed<string | null>(() => {
  for (const phase of courseStore.phases) {
    for (const lesson of phase.lessons) {
      if (!progressStore.isDone(lesson.id)) return lesson.id
    }
  }
  return null
})

function onContinue(): void {
  const id = firstIncompleteId.value ?? courseStore.phases[0]?.lessons[0]?.id
  if (id) router.push({ name: CourseRoute.Lesson, params: { lessonId: id } })
}

function scrollToPhases(): void {
  phasesRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openPhase(phase: IPhase): void {
  if (phase.lessons.length > 0) {
    router.push({ name: CourseRoute.Lesson, params: { lessonId: phase.lessons[0].id } })
  }
}
</script>
