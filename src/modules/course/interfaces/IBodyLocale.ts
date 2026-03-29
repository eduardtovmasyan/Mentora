import type { TableCell } from './IBodySegment.ts'

/** Value types that a body text key can resolve to */
export type IBodyLocaleValue =
  | string
  | { title: string; html: string }                       // callout
  | { headers: string[]; rows: TableCell[][] }             // table
  | { title: string; items: string[] }                    // keypoints
  | { pairs: Array<{ q: string; a: string }> }            // qa
  | string[]                                              // ul / ol

/** Flat key → value map for all translatable content in a lesson body */
export type IBodyLocale = Record<string, IBodyLocaleValue>
