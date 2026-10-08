const berlinDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
})

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** Training rules use calendar dates in Berlin, including ISO values from the CMS picker. */
export function getTrainingCalendarDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  if (isCalendarDate(text)) return text
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(text)) return undefined
  if (!isCalendarDate(text.slice(0, 10))) return undefined
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return undefined
  const parts = berlinDate.formatToParts(date)
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === name)?.value
  return `${part('year')?.padStart(4, '0')}-${part('month')}-${part('day')}`
}

/** Empty boundaries are allowed; populated dates must be valid and ordered. */
export function validateTrainingDateRange(start: unknown, end: unknown): boolean {
  const hasStart = start !== undefined && start !== null && start !== ''
  const hasEnd = end !== undefined && end !== null && end !== ''
  const from = hasStart ? getTrainingCalendarDate(start) : undefined
  const until = hasEnd ? getTrainingCalendarDate(end) : undefined
  if ((hasStart && !from) || (hasEnd && !until)) return false
  return !from || !until || until >= from
}