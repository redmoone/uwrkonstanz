export type WeeklyTraining = {
  weekday: string
  startTime: string
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

export function parseTrainingTime(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined
}

// Trainings repeat in Berlin local time, not every 7 * 24 UTC hours.
export function getNextTraining<T extends WeeklyTraining>(
  trainings: readonly T[], now = new Date(),
): UpcomingTraining<T> | undefined {
  if (Number.isNaN(now.getTime())) return undefined
  const parts = berlinClock.formatToParts(now)
  const part = (name: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === name)?.value)
  // UTC is only a container for calendar arithmetic; this is the Berlin date.
  const today = Date.UTC(part('year'), part('month') - 1, part('day'))
  const weekday = new Date(today).getUTCDay()
  const clock = ((part('hour') * 60 + part('minute')) * 60 + part('second')) * 1000 + now.getMilliseconds()
  let next: { training: T; days: number; rank: number } | undefined

  for (const training of trainings) {
    if (training.active === false) continue
    const day = weekdays.indexOf(training.weekday.trim().toLowerCase())
    const start = parseTrainingTime(training.startTime)
    if (day < 0 || start === undefined) continue
    let days = (day - weekday + 7) % 7
    if (days === 0 && start * 60_000 < clock) days = 7
    const rank = days * 1440 + start
    if (!next || rank < next.rank) next = { training, days, rank }
  }

  if (!next) return undefined
  const date = new Date(today + next.days * 86_400_000)
  return {
    training: next.training,
    date: date.toISOString().slice(0, 10),
    dateLabel: dateLabel.format(date),
  }
}
