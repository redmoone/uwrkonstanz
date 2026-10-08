import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const base = new URL(process.argv[2])
const output = process.argv[3]
assert.equal(base.hostname, '127.0.0.1', 'Only use the isolated local server and mail sink')
assert.equal(process.env.SMTP_HOST, '127.0.0.1')
assert.equal(process.env.CONTACT_TO_EMAIL, 'contact-smoke@example.invalid')

async function submit(body) {
  return fetch(new URL('/api/contact', base), {
    method: 'POST', headers: { Origin: process.env.NEXT_PUBLIC_SERVER_URL, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
const message = { email: 'visitor@example.invalid', phone: '+49 171 1234567', message: 'When can I join a trial session?' }
const sent = await submit(message)
assert.equal(sent.status, 200, JSON.stringify(await sent.clone().json()))
assert.equal((await sent.json()).success, true)
const mail = readFileSync(output, 'utf8').trim().split('\n').map(line => JSON.parse(line))
assert.equal(mail.length, 1)
assert.deepEqual(mail[0].recipients, ['<contact-smoke@example.invalid>'])
assert.equal(mail[0].from, '<website@example.invalid>')
assert.ok(mail[0].data.includes('Reply-To: visitor@example.invalid'))
assert.ok(mail[0].data.includes('+49 171 1234567'))
assert.ok(mail[0].data.includes(message.message))
const optional = await submit({ ...message, email: 'another@example.invalid', phone: '' })
assert.equal(optional.status, 200, 'Phone is optional')
const invalid = await submit({ ...message, email: '' })
assert.equal(invalid.status, 400)
assert.equal(readFileSync(output, 'utf8').trim().split('\n').length, 2, 'Invalid submission did not send mail')
console.log('SMTP contact smoke passed: real adapter delivery to shared recipient, sender, Reply-To, phone, optional phone and validation')
