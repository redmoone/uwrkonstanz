import { getTrainingCalendarDate } from './training-dates'

export type WeeklyTraining = {
  id?: string | number
  weekday: string
  startTime: string
  active?: boolean
  validFrom?: string | null
  validUntil?: string | null
  oneOffDate?: string | null
}

export type TrainingBreak = {
  reason?: string
  startDate: string
  endDate?: string | null
  trainings: (string | number | { id: string | number })[]
  active?: boolean
}

export type UpcomingTraining<T> = {
  training: T
  date: string
  dateLabel: string
}

const weekdays = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag']
const berlinClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})
const dateLabel = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC',
})
const calendarDay = 86_400_000

function hasDate(value: unknown): boolean {
  return value !== undefined && value !== null && value !== ''
}

function calendarTimestamp(value: unknown): number | undefined {
  const date = getTrainingCalendarDate(value)
  return date ? new Date(`${date}T00:00:00.000Z`).getTime() : undefined
}

function trainingID(value: unknown): string | undefined {
  if (typeof value === 'string' && value !== '') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

type DateInterval = { start: number; end: number }

function getBreaksByTraining(breaks: readonly TrainingBreak[]): Map<string, DateInterval[]> {
  const intervals = new Map<string, DateInterval[]>()
  for (const pause of breaks) {
    if (pause.active === false || !Array.isArray(pause.trainings)) continue
    const start = calendarTimestamp(pause.startDate)
    const end = hasDate(pause.endDate) ? calendarTimestamp(pause.endDate) : start
    if (start === undefined || end === undefined || end < start) continue
    for (const relationship of pause.trainings) {
      const id = trainingID(typeof relationship === 'object' && relationship !== null ? relationship.id : relationship)
      if (id === undefined) continue
      const selected = intervals.get(id) ?? []
      selected.push({ start, end })
      intervals.set(id, selected)
    }
  }
  // Merge overlapping ranges once, so even multi-year pauses need no weekly search limit.
  for (const [id, selected] of intervals) {
    selected.sort((a, b) => a.start - b.start)
    const merged: DateInterval[] = []
    for (const interval of selected) {
      const previous = merged.at(-1)
      if (previous && interval.start <= previous.end + calendarDay) previous.end = Math.max(previous.end, interval.end)
      else merged.push({ ...interval })
    }
    intervals.set(id, merged)
  }
  return intervals
}

function firstWeekdayOnOrAfter(date: number, weekday: number): number {
  return date + ((weekday - new Date(date).getUTCDay() + 7) % 7) * calendarDay
}

export function parseTrainingTime(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined
}

// Trainings repeat in Berlin local time, not every 7 * 24 UTC hours.
export function getNextTraining<T extends WeeklyTraining>(
  trainings: readonly T[], now = new Date(), breaks: readonly TrainingBreak[] = [],
): UpcomingTraining<T> | undefined {
  if (Number.isNaN(now.getTime())) return undefined
  const parts = berlinClock.formatToParts(now)
  const part = (name: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === name)?.value)
  // UTC is only a container for calendar arithmetic; this is the Berlin date.
  const today = new Date(`${part('year').toString().padStart(4, '0')}-${part('month').toString().padStart(2, '0')}-${part('day').toString().padStart(2, '0')}T00:00:00.000Z`).getTime()
  const clock = ((part('hour') * 60 + part('minute')) * 60 + part('second')) * 1000 + now.getMilliseconds()
  const trainingBreaks = getBreaksByTraining(breaks)
  let next: { training: T; date: number; rank: number } | undefined

  for (const training of trainings) {
    if (training.active === false) continue
    const start = parseTrainingTime(training.startTime)
    if (start === undefined) continue
    const id = trainingID(training.id)
    const pauses = id === undefined ? [] : trainingBreaks.get(id) ?? []
    let candidate: number

    if (hasDate(training.oneOffDate)) {
      const once = calendarTimestamp(training.oneOffDate)
      if (once === undefined || once < today || (once === today && start * 60_000 < clock)) continue
      if (pauses.some(pause => once >= pause.start && once <= pause.end)) continue
      candidate = once
    } else {
      const day = typeof training.weekday === 'string' ? weekdays.indexOf(training.weekday.trim().toLowerCase()) : -1
      if (day < 0) continue
      const from = hasDate(training.validFrom) ? calendarTimestamp(training.validFrom) : undefined
      const until = hasDate(training.validUntil) ? calendarTimestamp(training.validUntil) : undefined
      if ((hasDate(training.validFrom) && from === undefined) || (hasDate(training.validUntil) && until === undefined)) continue
      if (from !== undefined && until !== undefined && until < from) continue
      candidate = firstWeekdayOnOrAfter(Math.max(today, from ?? today), day)
      if (candidate === today && start * 60_000 < clock) candidate += 7 * calendarDay
      for (const pause of pauses) {
        if (candidate < pause.start) break
        if (candidate <= pause.end) candidate = firstWeekdayOnOrAfter(pause.end + calendarDay, day)
      }
      if (until !== undefined && candidate > until) continue
    }

    const rank = (candidate - today) / calendarDay * 1440 + start
    if (!next || rank < next.rank) next = { training, date: candidate, rank }
  }

  if (!next) return undefined
  const date = new Date(next.date)
  return {
    training: next.training,
    date: date.toISOString().slice(0, 10),
    dateLabel: dateLabel.format(date),
  }
}
