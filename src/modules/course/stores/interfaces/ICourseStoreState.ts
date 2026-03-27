import type { ICourse } from '@/modules/course/interfaces/ICourse.ts'
import type { IPhase } from '@/modules/course/interfaces/IPhase.ts'
import type { ILessonContent } from '@/modules/course/interfaces/ILessonContent.ts'

export interface ICourseStoreState {
  meta: ICourse
  phases: IPhase[]
  lessons: Record<string, ILessonContent>
}
