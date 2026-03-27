<template>
  <div class="home-page">
    <div class="home-tag">PHP BACKEND · CLOUD · {{ courseStore.meta.duration }}</div>

    <h1 class="home-title">
      <span class="c1">PHP</span> Backend<br />& <span class="c2">Cloud</span> Engineering
    </h1>

    <p class="home-sub">{{ courseStore.meta.description }}</p>

    <div class="home-stats">
      <div class="hs">
        <div class="hs-n">{{ courseStore.totalLessons }}</div>
        <div class="hs-l">Total Lessons</div>
      </div>
      <div class="hs">
        <div class="hs-n">{{ courseStore.phases.length }}</div>
        <div class="hs-l">Phases</div>
      </div>
      <div class="hs">
        <div class="hs-n" style="color: var(--cloud)">{{ stats.done }}</div>
        <div class="hs-l">Completed</div>
      </div>
      <div class="hs">
        <div class="hs-n">22</div>
        <div class="hs-l">Weeks</div>
      </div>
    </div>

    <div class="section-label">Learning Path</div>

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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import { useCourseStore } from '@/modules/course/stores/course.store.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'
import PhaseCard from '@/modules/course/components/phase-card/PhaseCard.vue'

const router = useRouter()
const courseStore = useCourseStore()
const progressStore = useProgressStore()

const stats = computed(() => progressStore.stats(courseStore.phases))

function openPhase(phase: IPhase): void {
  if (phase.lessons.length > 0) {
    router.push({ name: CourseRoute.Lesson, params: { lessonId: phase.lessons[0].id } })
  }
}
</script>
