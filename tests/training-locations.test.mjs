import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

function moduleURL(name, dependencies = {}) {
  const source = readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), 'utf8')
  let output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [dependency, url] of Object.entries(dependencies)) {
    output = output.replace(new RegExp(`(['"])\\./${dependency}\\1`, 'g'), () => JSON.stringify(url))
  }
  return `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
}
const dates = moduleURL('training-dates')
const schedule = moduleURL('training-schedule', { 'training-dates': dates })
const { getUpcomingTrainings, groupTrainingsByLocation } = await import(moduleURL('training-locations', {
  'training-dates': dates, 'training-schedule': schedule,
}))

const now = new Date('2026-10-07T16:00:00Z')
const monday = { id: 1, weekday: 'montag', startTime: '19:10', location: 'Schwaketenbad' }
const wednesday = { id: 2, weekday: 'mittwoch', startTime: '19:10', location: 'Schwaketenbad' }
const summarize = sessions => sessions.map(session => [session.training.id, session.date, session.training.startTime])

test('groups venue names ignoring case and spacing, fills metadata from later entries', () => {
  const trainings = [
    { ...monday, location: '  Schwaketenbad  ', address: null, mapUrl: '' },
    { ...wednesday, location: 'SCHWAKETENBAD', address: ' Schwaketenstraße 35 ', mapUrl: ' https://www.google.com/maps/embed?pb=example ' },
    { ...monday, id: 3, location: 'Freibad   Kreuzlingen' },
  ]
  const groups = groupTrainingsByLocation(trainings, now)
  assert.equal(groups.length, 2)
  assert.equal(groups[0].key, 'schwaketenbad')
  assert.equal(groups[0].location, 'Schwaketenbad')
  assert.equal(groups[0].address, 'Schwaketenstraße 35')
  assert.equal(groups[0].mapUrl, 'https://www.google.com/maps/embed?pb=example')
  assert.equal(groups[0].nextTraining.training.id, 2)
  assert.equal(groups[0].trainings.length, 2)
  assert.equal(groups[1].location, 'Freibad Kreuzlingen')
  assert.equal(groups[1].address, undefined)
})

test('omits inactive, expired, malformed, blank-location and already-started one-off entries', () => {
  const groups = groupTrainingsByLocation([
    monday,
    { ...wednesday, id: 3, active: false },
    { ...wednesday, id: 4, validUntil: '2026-10-06' },
    { ...wednesday, id: 5, oneOffDate: '2026-10-07', startTime: '17:59' },
    { ...wednesday, id: 6, oneOffDate: '2026-10-06' },
    { ...wednesday, id: 7, startTime: 'bad' },
    { ...wednesday, id: 8, location: ' ' },
    { ...wednesday, id: 9, validFrom: '2026-10-30', validUntil: '2026-10-01' },
  ], now)
  assert.deepEqual(groups[0].trainings.map(training => training.id), [1])
})

test('orders the venue plan Monday to Sunday by start time, then one-offs by calendar date without changing input', () => {
  const trainings = [
    { ...wednesday, id: 'wed' },
    { ...monday, id: 'mon-late', startTime: '21:00' },
    { ...monday, id: 'later-once', oneOffDate: '2026-10-20' },
    { ...monday, id: 'sun', weekday: 'sonntag' },
    { ...monday, id: 'mon-early', startTime: '18:00' },
    { ...monday, id: 'earlier-once-late', oneOffDate: '2026-10-09', startTime: '20:00' },
    { ...monday, id: 'earlier-once-early', oneOffDate: '2026-10-09', startTime: '18:00' },
  ]
  const originalIDs = trainings.map(training => training.id)
  const [group] = groupTrainingsByLocation(trainings, now)
  assert.deepEqual(group.trainings.map(training => training.id), [
    'mon-early', 'mon-late', 'wed', 'sun', 'earlier-once-early', 'earlier-once-late', 'later-once',
  ])
  assert.deepEqual(trainings.map(training => training.id), originalIDs)
  assert.equal(group.nextTraining.training.id, 'wed')
})

test('shows a paused future series and only its current or future valid active breaks', () => {
  const pauses = [
    { reason: 'Future', startDate: '2026-12-01', endDate: '2026-12-31', trainings: [1] },
    { reason: 'Current', startDate: '2026-10-01', endDate: '2026-10-18', trainings: [{ id: '1' }] },
    { reason: 'Finished', startDate: '2026-10-01', endDate: '2026-10-06', trainings: [1] },
    { reason: 'Disabled', startDate: '2026-10-01', endDate: '2026-10-18', trainings: [1], active: false },
    { reason: 'Other series', startDate: '2026-10-01', endDate: '2026-10-18', trainings: [2] },
    { reason: 'Reversed', startDate: '2026-10-20', endDate: '2026-10-01', trainings: [1] },
    { reason: 'Invalid', startDate: 'bad', trainings: [1] },
  ]
  const [group] = groupTrainingsByLocation([monday], now, pauses)
  assert.deepEqual(group.breaks.map(pause => pause.reason), ['Current', 'Future'])
  assert.equal(group.nextTraining.date, '2026-10-19')
})

test('keeps a canceled single training visible with its reason but no invented next session', () => {
  const once = { ...wednesday, oneOffDate: '2026-10-07' }
  const [group] = groupTrainingsByLocation([once], now, [{ reason: 'Bad geschlossen', startDate: '2026-10-07', trainings: [2] }])
  assert.equal(group.trainings.length, 1)
  assert.equal(group.breaks.length, 1)
  assert.equal(group.nextTraining, undefined)
})

test('merges actual occurrences chronologically across venues and weeks', () => {
  assert.deepEqual(summarize(getUpcomingTrainings([monday, wednesday], now)), [
    [2, '2026-10-07', '19:10'], [1, '2026-10-12', '19:10'],
    [2, '2026-10-14', '19:10'], [1, '2026-10-19', '19:10'],
    [2, '2026-10-21', '19:10'], [1, '2026-10-26', '19:10'],
  ])
})

test('retains simultaneous different trainings and orders all remaining same-day starts', () => {
  const sessions = getUpcomingTrainings([
    { ...wednesday, id: 'late', startTime: '21:00' },
    { ...wednesday, id: 'same-a', startTime: '19:10' },
    { ...wednesday, id: 'same-b', startTime: '19:10' },
    { ...wednesday, id: 'early', startTime: '18:00' },
  ], now, [], 4)
  assert.deepEqual(sessions.map(session => session.training.id), ['early', 'same-a', 'same-b', 'late'])
  assert.ok(sessions.every(session => session.date === '2026-10-07'))
})

test('includes a one-off once, respects weekly bounds and stops when every series ends', () => {
  const sessions = getUpcomingTrainings([
    { ...wednesday, validUntil: '2026-10-14' },
    { ...monday, id: 'once', oneOffDate: '2026-10-09', startTime: '15:00' },
  ], now, [], 20)
  assert.deepEqual(summarize(sessions), [
    [2, '2026-10-07', '19:10'], ['once', '2026-10-09', '15:00'], [2, '2026-10-14', '19:10'],
  ])
})

test('skips a canceled one-off and long selected holiday periods without a year search cap', () => {
  const sessions = getUpcomingTrainings([
    monday, { ...wednesday, id: 'once', oneOffDate: '2026-10-07' },
  ], now, [
    { startDate: '2026-10-07', trainings: ['once'] },
    { startDate: '2026-10-01', endDate: '2032-10-10', trainings: [1] },
  ], 2)
  assert.deepEqual(summarize(sessions), [[1, '2032-10-11', '19:10'], [1, '2032-10-18', '19:10']])
})

test('summer venue continues while the indoor series is paused', () => {
  const summer = { ...wednesday, id: 'summer', weekday: 'freitag', location: 'Freibad Kreuzlingen', validFrom: '2026-07-01', validUntil: '2026-08-31' }
  const pauses = [{ startDate: '2026-07-01', endDate: '2026-09-01', trainings: [1] }]
  const sessions = getUpcomingTrainings([monday, summer], new Date('2026-08-27T12:00:00Z'), pauses, 3)
  assert.deepEqual(summarize(sessions), [
    ['summer', '2026-08-28', '19:10'], [1, '2026-09-07', '19:10'], [1, '2026-09-14', '19:10'],
  ])
})

test('keeps Berlin calendar recurrence across spring and autumn clock changes', () => {
  const sunday = { ...monday, weekday: 'sonntag', startTime: '00:30' }
  assert.deepEqual(getUpcomingTrainings([sunday], new Date('2026-03-28T22:00:00Z'), [], 3).map(session => session.date), ['2026-03-29', '2026-04-05', '2026-04-12'])
  assert.deepEqual(getUpcomingTrainings([sunday], new Date('2026-10-24T21:00:00Z'), [], 3).map(session => session.date), ['2026-10-25', '2026-11-01', '2026-11-08'])
})

test('treats a Berlin midnight session as today even when UTC is the previous day', () => {
  const sessions = getUpcomingTrainings([{ ...monday, startTime: '00:30' }], new Date('2026-10-11T22:30:00Z'), [], 2)
  assert.deepEqual(sessions.map(session => session.date), ['2026-10-12', '2026-10-19'])
})

test('supports zero limits, invalid dates, empty data and bounded default for invalid limits', () => {
  assert.deepEqual(getUpcomingTrainings([monday], now, [], 0), [])
  assert.deepEqual(getUpcomingTrainings([monday], new Date('invalid')), [])
  assert.deepEqual(groupTrainingsByLocation([monday], new Date('invalid')), [])
  assert.deepEqual(getUpcomingTrainings([], now), [])
  assert.equal(getUpcomingTrainings([monday], now, [], Infinity).length, 6)
})
