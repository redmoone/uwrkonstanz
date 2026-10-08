import { getTrainingCalendarDate } from './training-dates'
import { getNextTraining, parseTrainingTime, type TrainingBreak, type UpcomingTraining, type WeeklyTraining } from './training-schedule'

export type LocatedTraining = WeeklyTraining & {
  location: string
  address?: string | null
  mapUrl?: string | null
}

export type TrainingLocationGroup<T extends LocatedTraining> = {
  key: string
  location: string
  address?: string
  mapUrl?: string
  trainings: T[]
  breaks: TrainingBreak[]
  nextTraining?: UpcomingTraining<T>
}

const calendarDay = 86_400_000
const weekdayOrder = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag']

function nonEmptyText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function relationshipID(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return typeof value === 'string' && value !== '' ? value : undefined
}

/** One section per named venue, retaining paused series so their cancellations remain visible. */
export function groupTrainingsByLocation<T extends LocatedTraining>(
  trainings: readonly T[], now = new Date(), breaks: readonly TrainingBreak[] = [],
): TrainingLocationGroup<T>[] {
  if (Number.isNaN(now.getTime())) return []
  const today = getTrainingCalendarDate(now.toISOString())!
  const groups = new Map<string, TrainingLocationGroup<T>>()

  for (const training of trainings) {
    const location = nonEmptyText(training.location)?.replace(/\s+/g, ' ')
    // Check existence without pauses: canceled dates should still show their venue and reason.
    if (!location || !getNextTraining([training], now)) continue
    const key = location.toLocaleLowerCase('de-DE')
    let group = groups.get(key)
    if (!group) {
      group = { key, location, trainings: [], breaks: [] }
      groups.set(key, group)
    }
    group.address ??= nonEmptyText(training.address)
    group.mapUrl ??= nonEmptyText(training.mapUrl)
    group.trainings.push(training)
  }

  for (const group of groups.values()) {
    group.trainings.sort((a, b) => {
      const aOnce = getTrainingCalendarDate(a.oneOffDate)
      const bOnce = getTrainingCalendarDate(b.oneOffDate)
      if (Boolean(aOnce) !== Boolean(bOnce)) return aOnce ? 1 : -1
      const dayOrder = aOnce && bOnce ? aOnce.localeCompare(bOnce)
        : weekdayOrder.indexOf(a.weekday.trim().toLocaleLowerCase('de-DE')) - weekdayOrder.indexOf(b.weekday.trim().toLocaleLowerCase('de-DE'))
      return dayOrder || parseTrainingTime(a.startTime)! - parseTrainingTime(b.startTime)!
    })
    const ids = new Set(group.trainings.map(training => relationshipID(training.id)).filter(id => id !== undefined))
    group.breaks = breaks.filter(pause => {
      if (pause.active === false || !Array.isArray(pause.trainings)) return false
      const start = getTrainingCalendarDate(pause.startDate)
      const end = pause.endDate ? getTrainingCalendarDate(pause.endDate) : start
      if (!start || !end || end < start || end < today) return false
      return pause.trainings.some(relationship => {
        const id = relationshipID(typeof relationship === 'object' && relationship !== null ? relationship.id : relationship)
        return id !== undefined && ids.has(id)
      })
    }).sort((a, b) => getTrainingCalendarDate(a.startDate)!.localeCompare(getTrainingCalendarDate(b.startDate)!))
    group.nextTraining = getNextTraining(group.trainings, now, group.breaks)
  }

  return [...groups.values()]
}

/** Merge actual occurrences from all series, keeping distinct trainings with identical start times. */
export function getUpcomingTrainings<T extends WeeklyTraining>(
  trainings: readonly T[], now = new Date(), breaks: readonly TrainingBreak[] = [], limit = 6,
): UpcomingTraining<T>[] {
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 6
  if (count === 0 || Number.isNaN(now.getTime())) return []
  type Candidate = { index: number; session: UpcomingTraining<T> }
  const candidates: Candidate[] = []
  trainings.forEach((training, index) => {
    const session = getNextTraining([training], now, breaks)
    if (session) candidates.push({ index, session })
  })
  const result: UpcomingTraining<T>[] = []

  while (candidates.length > 0 && result.length < count) {
    candidates.sort((a, b) => a.session.date.localeCompare(b.session.date)
      || parseTrainingTime(a.session.training.startTime)! - parseTrainingTime(b.session.training.startTime)!
      || a.index - b.index)
    const selected = candidates.shift()!
    result.push(selected.session)
    if (selected.session.training.oneOffDate) continue

    // Only this weekly series advances. Noon UTC on the following calendar day is
    // always after this occurrence and before its next possible weekly occurrence,
    // including both Berlin clock changes; other same-day starts remain in the queue.
    const followingDay = new Date(new Date(`${selected.session.date}T12:00:00.000Z`).getTime() + calendarDay)
    if (Number.isNaN(followingDay.getTime())) continue
    const session = getNextTraining([selected.session.training], followingDay, breaks)
    if (session && session.date > selected.session.date) candidates.push({ index: selected.index, session })
  }

  return result
}
