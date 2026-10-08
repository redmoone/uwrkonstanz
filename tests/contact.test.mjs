import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

function compile(relativePath) {
  return ts.transpileModule(readFileSync(new URL(relativePath, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
}
const helpers = {}
vm.runInNewContext(compile('../src/lib/contact.ts'), { exports: helpers, process })

const message = { email: 'visitor@example.invalid', phone: '', message: 'Wann kann ich zum Probetraining kommen?' }
const smtp = { SMTP_HOST: '127.0.0.1', SMTP_PORT: '3302', SMTP_FROM_ADDRESS: 'website@example.invalid' }

function setup({ configured = true, contactEmail = null, sendError = false } = {}) {
  const mail = []
  const env = { NEXT_PUBLIC_SERVER_URL: 'http://127.0.0.1:3300', ...(configured ? smtp : {}) }
  const payload = {
    findGlobal: async () => ({ contactEmail }),
    find: async () => ({ docs: [{ email: 'gesa@uwr-kn.de' }, { email: 'nico@uwr-kn.de' }] }),
    sendEmail: async data => {
      if (sendError) throw new Error('SMTP unavailable')
      mail.push(data)
      return { accepted: data.to, rejected: [] }
    },
  }
  const exports = {}
  vm.runInNewContext(compile('../src/app/(frontend)/api/contact/route.ts'), {
    exports, process: { env }, Buffer, Response, URL, Date,
    console: { error() {} },
    require: name => name === 'payload' ? { getPayload: async () => payload } : name === '@/lib/contact' ? helpers : { default: {} },
  })
  // Inject this case's environment while retaining the real validation helper.
  const getSMTPConfig = helpers.getSMTPConfig
  const request = (body = message, headers = {}) => exports.POST(new Request('http://127.0.0.1:3300/api/contact', {
    method: 'POST', headers: { origin: env.NEXT_PUBLIC_SERVER_URL, 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  }))
  const original = helpers.getSMTPConfig
  helpers.getSMTPConfig = () => getSMTPConfig(env)
  return { request, mail, reset: () => { helpers.getSMTPConfig = original } }
}

test('accepts email and message with an optional phone number; rejects invalid and injected fields', () => {
  assert.ok(helpers.validateContactMessage(message).data)
  assert.ok(helpers.validateContactMessage({ ...message, phone: '+49 (0) 171-2345678' }).data)
  for (const invalid of [{ email: '' }, { email: 'a@example.invalid\r\nBcc: attacker@example.invalid' }, { message: '   ' }, { message: 'a'.repeat(4001) }, { phone: 'call me' }, { website: 'spam.invalid' }]) {
    assert.ok(helpers.validateContactMessage({ ...message, ...invalid }).error)
  }
})

test('only enables SMTP with a valid host, sender, port and complete credentials', () => {
  assert.equal(helpers.getSMTPConfig({}), null)
  assert.equal(helpers.getSMTPConfig({ ...smtp, SMTP_PORT: 'invalid' }), null)
  assert.equal(helpers.getSMTPConfig({ ...smtp, SMTP_USER: 'user' }), null)
  assert.equal(helpers.getSMTPConfig({ ...smtp, SMTP_HOST: 'mail.example.invalid', SMTP_PORT: '465' }).transportOptions.secure, true)
  assert.equal(helpers.getSMTPConfig({ ...smtp, SMTP_HOST: 'mail.example.invalid' }).transportOptions.requireTLS, true)
})

test('sends to the shared CMS distributor and uses the visitor as Reply-To', async () => {
  const { request, mail, reset } = setup({ contactEmail: 'training@example.invalid' })
  try {
    assert.equal((await request({ ...message, phone: '0171 1234567', to: 'attacker@example.invalid' })).status, 200)
    assert.deepEqual(Array.from(mail[0].to), ['training@example.invalid'])
    assert.equal(mail[0].replyTo, message.email)
    assert.ok(mail[0].text.includes('0171 1234567'))
    assert.equal(mail[0].from, undefined, 'SMTP adapter supplies the authenticated sender')
  } finally { reset() }
})

test('uses both active trainers when no distributor is set, and allows only three sends per minute', async () => {
  const { request, mail, reset } = setup()
  try {
    assert.equal((await request()).status, 200)
    assert.deepEqual(Array.from(mail[0].to), ['gesa@uwr-kn.de', 'nico@uwr-kn.de'])
    assert.equal((await request()).status, 200)
    assert.equal((await request()).status, 200)
    assert.equal((await request()).status, 429)
    assert.equal(mail.length, 3)
  } finally { reset() }
})

test('does not report success without SMTP or after a delivery failure', async () => {
  for (const [options, expected] of [[{ configured: false }, 503], [{ sendError: true }, 502]]) {
    const { request, reset } = setup(options)
    try { assert.equal((await request()).status, expected) } finally { reset() }
  }
})

test('rejects foreign origins, invalid input and oversized requests without sending mail', async () => {
  const { request, mail, reset } = setup()
  try {
    assert.equal((await request(message, { origin: 'https://foreign.invalid' })).status, 403)
    assert.equal((await request({ ...message, email: '' })).status, 400)
    assert.equal((await request({ ...message, message: 'x'.repeat(21000) })).status, 413)
    assert.equal(mail.length, 0)
  } finally { reset() }
})
