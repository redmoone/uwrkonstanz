import assert from 'node:assert/strict'

const base = new URL(process.argv[2])
assert.equal(base.hostname, '127.0.0.1', 'Run only against the isolated local CI database')
const origin = process.env.NEXT_PUBLIC_SERVER_URL
assert.ok(origin)

let token
async function request(path, data, expectedStatus = 200) {
  const response = await fetch(new URL(path, base), {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
  const json = await response.json()
  assert.equal(response.status, expectedStatus, `${path}: ${JSON.stringify(json.errors || json)}`)
  return json
}

const login = await request('/api/users/login', {
  email: 'smoke@example.invalid', password: 'ci-only-login-test-password',
})
token = login.token
assert.ok(token)

const training = {
  label: 'CI Sommertraining', weekday: 'montag', startTime: '19:10', endTime: '20:40',
  location: 'CI Freibad', validFrom: '2031-07-01', validUntil: '2031-08-31', active: true,
}
const series = (await request('/api/training-times', training, 201)).doc
assert.ok(series.id)
const oneOff = (await request('/api/training-times', {
  label: 'CI Einzeltraining', oneOffDate: '2031-07-14', startTime: '18:00', endTime: '19:00',
  location: 'CI Hallenbad', active: true,
}, 201)).doc
assert.equal(oneOff.weekday, 'montag', 'One-off dates automatically supply the stored weekday')
const pause = (await request('/api/training-breaks', {
  reason: 'CI Ferienpause', startDate: '2031-07-14', trainings: [series.id], active: true,
}, 201)).doc
assert.ok(pause.id)
const publicPauses = await request('/api/training-breaks?depth=0')
assert.ok(publicPauses.docs.some(doc => doc.id === pause.id && doc.trainings.includes(series.id)))
await request('/api/training-breaks', {
  reason: 'CI ungültiger Zeitraum', startDate: '2031-07-14', endDate: '2031-07-13',
  trainings: [series.id], active: true,
}, 400)
await request('/api/training-times', { ...training, validUntil: '2031-06-30' }, 400)

const page = await fetch(new URL('/training', base))
assert.equal(page.status, 200)
const html = await page.text()
for (const text of ['CI Sommertraining', 'CI Einzeltraining', 'CI Ferienpause']) assert.ok(html.includes(text), text)
console.log('Training CMS smoke passed: series, one-off weekday, single pause, validation, public plan')
