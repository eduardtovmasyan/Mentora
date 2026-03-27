<template>
  <div class="sb-prog">
    <div class="sb-prog-row">
      <span class="sb-prog-label">Progress</span>
      <span class="sb-prog-pct">{{ stats.pct }}%</span>
    </div>
    <div class="sb-prog-bg">
      <div class="sb-prog-fill" :style="{ width: `${stats.pct}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProgressStats } from '@/modules/progress/interfaces/IProgressStats.ts'

defineProps<{
  stats: IProgressStats
}>()
</script>
