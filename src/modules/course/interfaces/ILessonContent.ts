import type { IBodySegment } from './IBodySegment.ts'
import type { IBodyLocale } from './IBodyLocale.ts'

export interface ILessonContent {
  id: string
  phase: string
  title: string
  intro: string
  tags: string[]
  seniorExpectations: string[]
  /** Structure: defines layout and references text keys */
  segments?: IBodySegment[]
  /** English source text — keys matched by segments */
  bodyTexts?: IBodyLocale
  /** Legacy HTML string — kept during migration */
  body?: string
}
