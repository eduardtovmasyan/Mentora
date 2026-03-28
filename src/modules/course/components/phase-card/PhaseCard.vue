<template>
  <div class="pc" :style="{ color: phase.color }" @click="$emit('click')">
    <div class="pc-phase" :style="{ color: phase.color }">Phase {{ index + 1 }}</div>
    <div class="pc-title">{{ phaseLabel }}</div>
    <div class="pc-count">{{ doneCount }}/{{ phase.lessons.length }} {{ t('nav.lessons_unit') }}</div>
    <div class="pc-bar">
      <div class="pc-fill" :style="{ width: `${fillPct}%`, background: phase.color }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'

const props = defineProps<{
  phase: IPhase
  index: number
}>()

defineEmits<{ click: [] }>()

const { t, te } = useI18n()
const progressStore = useProgressStore()

const phaseLabel = computed(() => {
  const key = `phases.${props.phase.id}`
  return te(key) ? t(key) : props.phase.label
})

const doneCount = computed<number>(
  () => props.phase.lessons.filter((l) => progressStore.isDone(l.id)).length
)

const fillPct = computed<number>(() =>
  props.phase.lessons.length
    ? Math.round((doneCount.value / props.phase.lessons.length) * 100)
    : 0
)
</script>
