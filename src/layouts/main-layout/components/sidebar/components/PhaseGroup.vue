<template>
  <div class="phase-group">
    <div class="phase-header" @click="$emit('toggle')">
      <span class="phase-dot" :style="{ background: phase.color, color: phase.color }" />
      <span class="phase-label">{{ phase.label }}</span>
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
        <span class="lb-title">{{ lesson.title }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'

defineProps<{
  phase: IPhase
  collapsed: boolean
  activeLessonId: string | undefined
  isDone: (id: string) => boolean
}>()

defineEmits<{
  toggle: []
  navigate: [lessonId: string]
}>()
</script>
