import type { ILesson } from './ILesson.ts'

export interface IPhase {
  id: string
  label: string
  color: string
  lessons: ILesson[]
}
