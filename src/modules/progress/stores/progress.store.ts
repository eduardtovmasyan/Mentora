import { defineStore } from 'pinia'
import type { IProgressStoreState } from './interfaces/IProgressStoreState.ts'
import type { IProgressStats } from '@/modules/progress/interfaces/IProgressStats.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'

const STORAGE_KEY = 'mentora_v1_progress'

export const useProgressStore = defineStore('progress', {
  state: (): IProgressStoreState => ({
    completed: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
  }),

  getters: {
    isDone:
      (state) =>
      (lessonId: string): boolean =>
        !!state.completed[lessonId],

    stats:
      (state) =>
      (phases: IPhase[]): IProgressStats => {
        const total = phases.reduce((sum, p) => sum + p.lessons.length, 0)
        const done = Object.values(state.completed).filter(Boolean).length
        const pct = total ? Math.round((done / total) * 100) : 0
        return { total, done, pct }
      },
  },

  actions: {
    toggle(lessonId: string): void {
      if (this.completed[lessonId]) {
        delete this.completed[lessonId]
      } else {
        this.completed[lessonId] = true
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.completed))
    },
  },
})
