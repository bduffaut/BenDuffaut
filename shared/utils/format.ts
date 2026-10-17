// Small formatting helpers used by pages and the resume.

export function dateRange(start: string, end: string): string {
  return start === end ? start : `${start} – ${end}`
}

/* "https://www.linkedin.com/in/benjamin-duffaut" -> "linkedin.com/in/benjamin-duffaut" */
export function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

export function projectSlug(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? path
}

export const STATUS_LABEL = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Complete',
} as const
