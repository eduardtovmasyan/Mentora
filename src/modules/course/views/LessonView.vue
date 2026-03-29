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

    <!-- Non-English content notice -->
    <div v-if="locale !== 'en'" class="content-lang-notice">
      <span class="cln-icon">🌐</span>
      <div>
        <strong>{{ t('lesson.content_notice') }}</strong>
        <span>{{ t('lesson.content_notice_sub') }}</span>
      </div>
    </div>

    <div v-if="lesson.seniorExpectations?.length" class="senior-box">
      <div class="senior-title">{{ t('lesson.senior_title') }}</div>
      <div class="skill-tags">
        <span v-for="exp in lesson.seniorExpectations" :key="exp" class="stag">{{ exp }}</span>
      </div>
    </div>

    <LessonBody
      v-if="lesson.segments?.length && lesson.bodyTexts"
      :segments="lesson.segments"
      :body-texts="lesson.bodyTexts"
      :locale-body-texts="localeBodyTexts"
    />
    <div v-else-if="lesson.body" ref="bodyRef" class="lesson-body" v-html="lesson.body" />

    <div class="mark-done-wrap">
      <div class="mark-done-text">
        <h4>{{ isDone ? t('lesson.complete_done_h') : t('lesson.complete_idle_h') }}</h4>
        <p>{{ isDone ? t('lesson.complete_done_p') : t('lesson.complete_idle_p') }}</p>
      </div>
      <button
        class="mark-done-btn"
        :class="{ active: isDone }"
        @click="progressStore.toggle(lessonId)"
      >
        {{ isDone ? t('lesson.mark_done') : t('lesson.mark_idle') }}
      </button>
    </div>

    <div class="lesson-nav">
      <button v-if="neighbors.prev" class="ln-btn" @click="go(neighbors.prev.id)">
        <span class="ln-lbl">{{ t('lesson.prev') }}</span>
        <span class="ln-title">{{ lessonTitle(neighbors.prev.id, neighbors.prev.title) }}</span>
      </button>
      <span v-else />
      <button v-if="neighbors.next" class="ln-btn ln-btn-right" @click="go(neighbors.next.id)">
        <span class="ln-lbl">{{ t('lesson.next') }}</span>
        <span class="ln-title">{{ lessonTitle(neighbors.next.id, neighbors.next.title) }}</span>
      </button>
    </div>
  </div>

  <!-- Coming soon -->
  <div v-else class="content-inner">
    <div class="coming-soon">
      <div class="coming-soon-icon">🚧</div>
      <h2>{{ t('lesson.coming_soon_title') }}</h2>
      <p>{{ t('lesson.coming_soon_sub', { title: currentLessonTitle }) }}</p>
      <div class="lesson-nav" style="width:100%;max-width:520px;margin-top:28px">
        <button v-if="neighbors.prev" class="ln-btn" @click="go(neighbors.prev.id)">
          <span class="ln-lbl">{{ t('lesson.prev') }}</span>
          <span class="ln-title">{{ lessonTitle(neighbors.prev.id, neighbors.prev.title) }}</span>
        </button>
        <span v-else />
        <button v-if="neighbors.next" class="ln-btn ln-btn-right" @click="go(neighbors.next.id)">
          <span class="ln-lbl">{{ t('lesson.next') }}</span>
          <span class="ln-title">{{ lessonTitle(neighbors.next.id, neighbors.next.title) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import { useCourseStore } from '@/modules/course/stores/course.store.ts'
import { useProgressStore } from '@/modules/progress/stores/progress.store.ts'
import { currentLocale } from '@/i18n/index.ts'
import hljs from 'highlight.js'
import LessonBody from '@/modules/course/components/LessonBody.vue'

const route = useRoute()
const router = useRouter()
const { t, te, locale } = useI18n()
const courseStore = useCourseStore()
const progressStore = useProgressStore()

const bodyRef = ref<HTMLElement | null>(null)

const lessonId = computed<string>(() => route.params.lessonId as string)
const lesson = computed(() => courseStore.getLesson(lessonId.value, currentLocale.value))
const isDone = computed<boolean>(() => progressStore.isDone(lessonId.value))
const neighbors = computed(() => courseStore.neighbors(lessonId.value))

/** bodyTexts already merged (locale over English) by getLesson — pass to LessonBody for t() */
const localeBodyTexts = computed(() =>
  currentLocale.value !== 'en' ? lesson.value?.bodyTexts : undefined
)

const currentLessonTitle = computed<string>(() => {
  return lessonTitle(
    lessonId.value,
    courseStore.phaseOf(lessonId.value)?.lessons.find((l) => l.id === lessonId.value)?.title ?? lessonId.value
  )
})

function lessonTitle(id: string, fallback: string): string {
  const key = `lessons.${id}`
  return te(key) ? t(key) : fallback
}

hljs.configure({ ignoreUnescapedHTML: true })

function highlightLegacy(): void {
  nextTick(() => {
    bodyRef.value?.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement)
    })
  })
}

function scrollToTop(): void {
  document.querySelector('.content')?.scrollTo({ top: 0 })
}

function go(id: string): void {
  router.push({ name: CourseRoute.Lesson, params: { lessonId: id } })
}

onMounted(highlightLegacy)
watch(lessonId, () => { scrollToTop(); highlightLegacy() })
</script>
