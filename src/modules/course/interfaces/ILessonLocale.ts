import type { IBodyLocale } from './IBodyLocale.ts'

export interface ILessonLocale {
  phase?: string
  intro?: string
  seniorExpectations?: string[]
  /** Translated body text — same keys as lesson.bodyTexts, overrides English values */
  bodyTexts?: IBodyLocale
}
