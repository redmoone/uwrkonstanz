import assert from 'node:assert/strict'

const base = new URL(process.argv[2])
assert.equal(base.hostname, '127.0.0.1', 'Run only against the isolated local CI database')

const response = await fetch(new URL('/api/team-members?depth=0&sort=sortOrder', base))
assert.equal(response.status, 200)
const { docs } = await response.json()
for (const [name, role, email] of [['Gesa', 'Trainerin', 'gesa@uwr-kn.de'], ['Nico', 'Trainer', 'nico@uwr-kn.de']]) {
  const matches = docs.filter(person => person.name === name)
  assert.equal(matches.length, 1, `${name} is seeded exactly once`)
  assert.equal(matches[0].role, role)
  assert.equal(matches[0].email, email)
  assert.equal(matches[0].active, true)
}

const page = await fetch(new URL('/team', base))
assert.equal(page.status, 200)
const html = await page.text()
for (const text of ['Gesa', 'Nico', 'gesa@uwr-kn.de', 'nico@uwr-kn.de', 'Deine Nachricht', 'Deine E-Mail-Adresse', 'Handynummer', 'NACHRICHT VERSENDEN']) {
  assert.ok(html.includes(text), `Team page contains ${text}`)
}
assert.ok(!html.includes('An wen möchtest du schreiben?'), 'Form has no trainer selection')
assert.ok(html.includes('href="/team"'), 'Main navigation links to the team page')
console.log('Team CMS smoke passed: seeded trainer profiles, email addresses, team page and message form')
