<template>
  <!-- Lesson with content -->
  <div v-if="lesson" class="content-inner">
    <div class="lesson-hdr">
      <div class="lesson-phase-tag">{{ lesson.phase }}</div>
      <h1 class="lesson-title">{{ lesson.title }}</h1>
      <p class="lesson-intro">{{ lesson.intro }}</p>
      <div v-if="lesson.tags?.length" class="lesson-meta">
        <span v-for="tag in lesson.tags" :key="tag" class="lm-tag">{{ tag }}</span>
      </div>
    </div>

    <div v-if="lesson.seniorExpectations?.length" class="senior-box">
      <div class="senior-title">Senior-Level Expectations</div>
      <div class="skill-tags">
        <span v-for="exp in lesson.seniorExpectations" :key="exp" class="stag">{{ exp }}</span>
      </div>
    </div>

    <div ref="bodyRef" class="lesson-body" v-html="lesson.body" />

    <div class="mark-done-wrap">
      <div class="mark-done-text">
        <h4>{{ isDone ? 'Lesson complete!' : 'Done with this lesson?' }}</h4>
        <p>{{ isDone ? 'Great work. Move on to the next topic.' : 'Mark it complete to track your progress.' }}</p>
      </div>
      <button
        class="mark-done-btn"
        :class="{ active: isDone }"
        @click="progressStore.toggle(lessonId)"
      >
        {{ isDone ? '✓  Completed' : 'Mark as Complete' }}
      </button>
    </div>

    <div class="lesson-nav">
      <button v-if="neighbors.prev" class="ln-btn" @click="go(neighbors.prev.id)">
        <span class="ln-lbl">← Previous</span>
        <span class="ln-title">{{ neighbors.prev.title }}</span>
      </button>
      <span v-else />
      <button v-if="neighbors.next" class="ln-btn ln-btn-right" @click="go(neighbors.next.id)">
        <span class="ln-lbl">Next →</span>
        <span class="ln-title">{{ neighbors.next.title }}</span>
      </button>
    </div>
  </div>

  <!-- Coming soon -->
  <div v-else class="content-inner">
    <div class="coming-soon">
      <div class="coming-soon-icon">🚧</div>
      <h2>Coming Soon</h2>
      <p><strong>{{ lessonTitle }}</strong> is being written. Check back soon!</p>
      <div class="lesson-nav" style="width: 100%; max-width: 520px; margin-top: 28px;">
        <button v-if="neighbors.prev" class="ln-btn" @click="go(neighbors.prev.id)">
          <span class="ln-lbl">← Previous</span>
          <span class="ln-title">{{ neighbors.prev.title }}</span>
        </button>
        <span v-else />
        <button v-if="neighbors.next" class="ln-btn ln-btn-right" @click="go(neighbors.next.id)">
          <span class="ln-lbl">Next →</span>
          <span class="ln-title">{{ neighbors.next.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import hljs from 'highlight.js'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import { useCourseStore } from '@/modules/course/stores/course.store.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const progressStore = useProgressStore()

const bodyRef = ref<HTMLElement | null>(null)

const lessonId = computed<string>(() => route.params.lessonId as string)
const lesson = computed(() => courseStore.getLesson(lessonId.value))
const isDone = computed<boolean>(() => progressStore.isDone(lessonId.value))
const neighbors = computed(() => courseStore.neighbors(lessonId.value))

const lessonTitle = computed<string>(() => {
  const phase = courseStore.phaseOf(lessonId.value)
  return phase?.lessons.find((l) => l.id === lessonId.value)?.title ?? lessonId.value
})

hljs.configure({ ignoreUnescapedHTML: true })

function highlight(): void {
  nextTick(() => {
    bodyRef.value?.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement)
    })
  })
}

function scrollToTop(): void {
  const el = document.querySelector('.content')
  if (el) el.scrollTop = 0
}

function go(id: string): void {
  router.push({ name: CourseRoute.Lesson, params: { lessonId: id } })
}

onMounted(highlight)
watch(lessonId, () => {
  scrollToTop()
  highlight()
})
</script>
