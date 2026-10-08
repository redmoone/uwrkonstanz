import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Exercise the pure TypeScript helper without adding a test runner dependency.
const source = readFileSync(new URL('../src/lib/training-schedule.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { getNextTraining, parseTrainingTime } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

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
