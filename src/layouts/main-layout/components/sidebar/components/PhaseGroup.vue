<template>
  <div class="phase-group">
    <div class="phase-header" @click="$emit('toggle')">
      <span class="phase-dot" :style="{ background: phase.color, color: phase.color }" />
      <span class="phase-label">{{ phaseLabel }}</span>
      <span class="phase-chevron" :class="{ open: !collapsed }">›</span>
    </div>

    <div v-show="!collapsed" class="phase-items">
      <button
        v-for="lesson in phase.lessons"
        :key="lesson.id"
        class="lesson-btn"
        :class="{
          active: activeLessonId === lesson.id,
          done: isDone(lesson.id),
        }"
        @click="$emit('navigate', lesson.id)"
      >
        <span class="lb-check">✓</span>
        <span class="lb-title">{{ lessonLabel(lesson.id, lesson.title) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'

const props = defineProps<{
  phase: IPhase
  collapsed: boolean
  activeLessonId: string | undefined
  isDone: (id: string) => boolean
}>()

defineEmits<{
  toggle: []
  navigate: [lessonId: string]
}>()

const { t, te } = useI18n()

const phaseLabel = computed(() => {
  const key = `phases.${props.phase.id}`
  return te(key) ? t(key) : props.phase.label
})

function lessonLabel(id: string, fallback: string): string {
  const key = `lessons.${id}`
  return te(key) ? t(key) : fallback
}
</script>
