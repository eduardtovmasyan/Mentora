import { defineStore } from 'pinia'
import { meta, phases } from '@/modules/course/data/php-backend-cloud/Index.ts'
import type { ICourseStoreState } from './interfaces/ICourseStoreState.ts'
import type { ILessonContent } from '@/modules/course/interfaces/ILessonContent.ts'
import type { ILesson } from '@/modules/course/interfaces/ILesson.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'

const lessonModules = import.meta.glob(
  '../data/php-backend-cloud/lessons/*.js',
  { eager: true }
)

function buildLessonMap(): Record<string, ILessonContent> {
  const map: Record<string, ILessonContent> = {}
  for (const path in lessonModules) {
    const id = path.split('/').pop()!.replace('.js', '')
    const data = (lessonModules[path] as { default: ILessonContent | null }).default
    if (data) {
      map[id] = { ...data, id }
    }
  }
  return map
}

export const useCourseStore = defineStore('course', {
  state: (): ICourseStoreState => ({
    meta,
    phases,
    lessons: buildLessonMap(),
  }),

  getters: {
    totalLessons: (state): number =>
      state.phases.reduce((sum: number, p: IPhase) => sum + p.lessons.length, 0),

    getLesson:
      (state) =>
      (id: string): ILessonContent | null =>
        state.lessons[id] ?? null,

    hasContent:
      (state) =>
      (id: string): boolean =>
        id in state.lessons,

    neighbors:
      (state) =>
      (lessonId: string): { prev: ILesson | null; next: ILesson | null } => {
        const flat = state.phases.flatMap((p: IPhase) => p.lessons)
        const idx = flat.findIndex((l: ILesson) => l.id === lessonId)
        return {
          prev: idx > 0 ? flat[idx - 1] : null,
          next: idx < flat.length - 1 ? flat[idx + 1] : null,
        }
      },

    phaseOf:
      (state) =>
      (lessonId: string): IPhase | null =>
        state.phases.find((p: IPhase) => p.lessons.some((l: ILesson) => l.id === lessonId)) ?? null,
  },
})
