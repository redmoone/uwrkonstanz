import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Exercise the pure TypeScript helper without adding a test runner dependency.
const source = readFileSync(new URL('../src/lib/training-schedule.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const datesSource = readFileSync(new URL('../src/lib/training-dates.ts', import.meta.url), 'utf8')
const datesOutput = ts.transpileModule(datesSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const datesURL = `data:text/javascript;base64,${Buffer.from(datesOutput).toString('base64')}`
const standaloneOutput = outputText.replace(/(['"])\.\/training-dates\1/, () => JSON.stringify(datesURL))
const { getNextTraining, parseTrainingTime } = await import(`data:text/javascript;base64,${Buffer.from(standaloneOutput).toString('base64')}`)

const monday = { id: 'monday', weekday: 'montag', startTime: '19:10', sortOrder: 1 }
const wednesday = { id: 'wednesday', weekday: 'mittwoch', startTime: '19:10', sortOrder: 99 }
const schedule = [monday, wednesday]

test('chooses the closest start instead of manual sort order or array order', () => {
  const next = getNextTraining(schedule, new Date('2026-10-07T16:00:00Z'))
  assert.equal(next.training.id, 'wednesday')
  assert.equal(next.date, '2026-10-07')
  assert.equal(next.dateLabel, 'Mittwoch, 07.10.')
})

test('includes an exact start, then advances once that start has passed', () => {
  assert.equal(getNextTraining(schedule, new Date('2026-10-07T17:10:00Z')).training.id, 'wednesday')
  const next = getNextTraining(schedule, new Date('2026-10-07T17:10:00.001Z'))
  assert.equal(next.training.id, 'monday')
  assert.equal(next.date, '2026-10-12')
})

test('picks the next start on the same weekday, regardless of input order', () => {
  const next = getNextTraining([
    { weekday: 'mittwoch', startTime: '21:00' },
    { weekday: 'mittwoch', startTime: '18:00' },
    { weekday: 'mittwoch', startTime: '20:00' },
  ], new Date('2026-10-07T17:30:00Z'))
  assert.equal(next.training.startTime, '20:00')
  assert.equal(next.date, '2026-10-07')
})

test('uses Berlin calendar day, even when UTC is still Sunday', () => {
  const next = getNextTraining([{ weekday: 'montag', startTime: '00:45' }], new Date('2026-10-11T22:30:00Z'))
  assert.equal(next.date, '2026-10-12')
})

test('advances a sole passed training to the following week', () => {
  assert.equal(getNextTraining([wednesday], new Date('2026-10-07T19:00:00Z')).date, '2026-10-14')
})

test('handles the summer-time transition by local date rather than UTC days', () => {
  const sunday = { weekday: 'sonntag', startTime: '19:10' }
  assert.equal(getNextTraining([sunday], new Date('2026-03-28T22:30:00Z')).date, '2026-03-29')
  assert.equal(getNextTraining([sunday], new Date('2026-03-29T17:11:00Z')).date, '2026-04-05')
})

test('handles winter time and a calendar year boundary', () => {
  assert.equal(getNextTraining([{ weekday: 'sonntag', startTime: '19:10' }], new Date('2026-10-25T18:11:00Z')).date, '2026-11-01')
  assert.equal(getNextTraining([{ weekday: 'donnerstag', startTime: '19:10' }], new Date('2026-12-31T18:11:00Z')).date, '2027-01-07')
})

test('ignores disabled trainings and invalid legacy values', () => {
  const next = getNextTraining([
    { weekday: 'mittwoch', startTime: '19:10', active: false },
    { weekday: 'mittwoch', startTime: '25:00' },
    { weekday: 'dienstag & donnerstag', startTime: '20:00' },
    monday,
  ], new Date('2026-10-07T16:00:00Z'))
  assert.equal(next.training.id, 'monday')
})

test('returns no invented training for empty or invalid schedules', () => {
  assert.equal(getNextTraining([], new Date('2026-10-07T16:00:00Z')), undefined)
  assert.equal(getNextTraining([{ weekday: 'mittwoch', startTime: 'later' }]), undefined)
})

test('validates the supported clock format', () => {
  assert.equal(parseTrainingTime('19:10'), 1150)
  assert.equal(parseTrainingTime('9:00'), 540)
  assert.equal(parseTrainingTime('00:00'), 0)
  assert.equal(parseTrainingTime('23:59'), 1439)
  for (const invalid of ['24:00', '19:60', '9:5', '', undefined, 1910]) {
    assert.equal(parseTrainingTime(invalid), undefined)
  }
})

test('cancels a single selected occurrence when the end date is empty', () => {
  for (const endDate of [undefined, null, '']) {
    const next = getNextTraining([wednesday], new Date('2026-10-07T16:00:00Z'), [
      { startDate: '2026-10-07', endDate, trainings: ['wednesday'] },
    ])
    assert.equal(next.date, '2026-10-14')
  }
})

test('skips a whole summer pause and keeps its inclusive boundaries', () => {
  const next = getNextTraining([monday], new Date('2026-06-01T16:00:00Z'), [
    { startDate: '2026-06-01', endDate: '2026-09-14', trainings: [{ id: 'monday' }] },
  ])
  assert.equal(next.date, '2026-09-21')
})

test('keeps unrelated training series available during a pause', () => {
  const next = getNextTraining(schedule, new Date('2026-06-01T16:00:00Z'), [
    { startDate: '2026-06-01', endDate: '2026-09-13', trainings: ['monday'] },
  ])
  assert.equal(next.training.id, 'wednesday')
  assert.equal(next.date, '2026-06-03')
})

test('uses the alternative summer series while the indoor series are paused', () => {
  const summer = { id: 'summer', weekday: 'donnerstag', startTime: '20:00', validFrom: '2026-06-01', validUntil: '2026-09-13' }
  const next = getNextTraining([...schedule, summer], new Date('2026-06-01T16:00:00Z'), [
    { startDate: '2026-06-01', endDate: '2026-09-13', trainings: ['monday', 'wednesday'] },
  ])
  assert.equal(next.training.id, 'summer')
  assert.equal(next.date, '2026-06-04')
  assert.equal(getNextTraining([summer], new Date('2026-09-14T16:00:00Z')), undefined)
})

test('merges overlapping pauses regardless of input order and relationship representation', () => {
  const training = { ...monday, id: 7 }
  const next = getNextTraining([training], new Date('2026-06-01T16:00:00Z'), [
    { startDate: '2026-06-08', endDate: '2026-06-21', trainings: [{ id: 7 }] },
    { startDate: '2026-06-01', endDate: '2026-06-14', trainings: ['7'] },
    { startDate: '2026-06-15', endDate: '2026-06-22', trainings: [7] },
  ])
  assert.equal(next.date, '2026-06-29')
})

test('can jump over several calendar years without a search horizon', () => {
  const next = getNextTraining([wednesday], new Date('2026-10-07T16:00:00Z'), [
    { startDate: '2026-10-07', endDate: '2035-12-31', trainings: ['wednesday'] },
  ])
  assert.equal(next.date, '2036-01-02')
})

test('includes both series validity dates, including a series with just one occurrence', () => {
  const training = { ...monday, validFrom: '2026-06-01', validUntil: '2026-06-01' }
  assert.equal(getNextTraining([training], new Date('2026-05-31T16:00:00Z')).date, '2026-06-01')
  assert.equal(getNextTraining([training], new Date('2026-06-01T17:10:00Z')).date, '2026-06-01')
  assert.equal(getNextTraining([training], new Date('2026-06-01T17:10:00.001Z')), undefined)
})

test('normalizes CMS validity timestamps to their Berlin calendar date', () => {
  const training = { ...monday, validFrom: '2026-05-31T22:00:00.000Z', validUntil: '2026-06-01T00:00:00+02:00' }
  assert.equal(getNextTraining([training], new Date('2026-05-31T16:00:00Z')).date, '2026-06-01')
})

test('normalizes both pause boundaries from ISO offsets before applying them', () => {
  const next = getNextTraining([monday], new Date('2026-06-01T16:00:00Z'), [
    { startDate: '2026-05-31T22:00:00.000Z', endDate: '2026-06-08T00:00:00+02:00', trainings: ['monday'] },
  ])
  assert.equal(next.date, '2026-06-15')
})

test('handles pauses across both Berlin daylight saving transitions', () => {
  const sunday = { id: 'sunday', weekday: 'sonntag', startTime: '19:10' }
  assert.equal(getNextTraining([sunday], new Date('2026-03-28T22:30:00Z'), [
    { startDate: '2026-03-29T00:00:00+01:00', trainings: ['sunday'] },
  ]).date, '2026-04-05')
  assert.equal(getNextTraining([sunday], new Date('2026-10-24T22:30:00Z'), [
    { startDate: '2026-10-25T00:00:00+02:00', endDate: '2026-11-01T00:00:00+01:00', trainings: ['sunday'] },
  ]).date, '2026-11-08')
})

test('ignores disabled or malformed pauses rather than cancelling a training', () => {
  const now = new Date('2026-10-07T16:00:00Z')
  for (const pause of [
    { startDate: '2026-10-07', trainings: ['wednesday'], active: false },
    { startDate: 'invalid', trainings: ['wednesday'] },
    { startDate: '2026-02-30', trainings: ['wednesday'] },
    { startDate: '2026-10-07', endDate: 'invalid', trainings: ['wednesday'] },
    { startDate: '2026-10-07', endDate: '2026-10-06', trainings: ['wednesday'] },
    { startDate: '2026-10-07', trainings: [] },
  ]) {
    assert.equal(getNextTraining([wednesday], now, [pause]).date, '2026-10-07')
  }
})

test('does not schedule trainings with invalid or reversed validity dates', () => {
  const now = new Date('2026-10-07T16:00:00Z')
  for (const validity of [
    { validFrom: 'invalid' },
    { validUntil: '2026-02-30' },
    { validFrom: '2026-10-07', validUntil: '2026-10-06' },
  ]) {
    assert.equal(getNextTraining([{ ...wednesday, ...validity }], now), undefined)
  }
  assert.equal(getNextTraining([wednesday], new Date('invalid')), undefined)
})

test('does not invent a fallback when all remaining valid occurrences are cancelled', () => {
  const limited = { ...wednesday, validUntil: '2026-10-14' }
  assert.equal(getNextTraining([limited], new Date('2026-10-07T16:00:00Z'), [
    { startDate: '2026-10-07', endDate: '2026-10-14', trainings: ['wednesday'] },
  ]), undefined)
})

test('uses a one-off calendar date even when the stored weekday differs', () => {
  const once = { id: 'once', weekday: 'sonntag', startTime: '19:10', oneOffDate: '2026-10-09T00:00:00+02:00', validFrom: '2027-01-01', validUntil: '2027-01-01' }
  const next = getNextTraining([once], new Date('2026-10-07T16:00:00Z'))
  assert.equal(next.date, '2026-10-09')
  assert.equal(next.dateLabel, 'Freitag, 09.10.')
})

test('includes an exact one-off start but never repeats a past one-off training', () => {
  const once = { ...wednesday, oneOffDate: '2026-10-07' }
  assert.equal(getNextTraining([once], new Date('2026-10-07T17:10:00Z')).date, '2026-10-07')
  assert.equal(getNextTraining([once], new Date('2026-10-07T17:10:00.001Z')), undefined)
  assert.equal(getNextTraining([once], new Date('2026-10-14T16:00:00Z')), undefined)
})

test('does not reschedule a cancelled, disabled, or invalid one-off training', () => {
  const once = { ...wednesday, oneOffDate: '2026-10-07' }
  const now = new Date('2026-10-07T16:00:00Z')
  assert.equal(getNextTraining([once], now, [
    { startDate: '2026-10-07', trainings: ['wednesday'] },
  ]), undefined)
  assert.equal(getNextTraining([{ ...once, active: false }], now), undefined)
  assert.equal(getNextTraining([{ ...once, oneOffDate: '2026-02-30' }], now), undefined)
})
