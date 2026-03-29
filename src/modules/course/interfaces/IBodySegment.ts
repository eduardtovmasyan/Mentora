export type TableCell = string | { v: string; cls?: string; span?: number }

/**
 * Segments define STRUCTURE only.
 * Text segments reference content by `key` — resolved via IBodyLocale at render time.
 * Code segments embed content directly (never translated).
 */
export type IBodySegment =
  | { type: 'h2'; key: string }
  | { type: 'h3'; key: string }
  | { type: 'p'; key: string }
  | { type: 'code'; lang: string; label: string; code: string }
  | { type: 'table'; key: string; colClasses?: (string | null)[] }
  | { type: 'ul'; key: string }
  | { type: 'ol'; key: string }
  | { type: 'callout'; style: string; key: string }
  | { type: 'keypoints'; key: string }
  | { type: 'qa'; key: string }
