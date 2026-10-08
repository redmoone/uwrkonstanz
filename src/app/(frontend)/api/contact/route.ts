import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { contactEmailBody, getSMTPConfig, isEmailAddress, validateContactMessage } from '@/lib/contact'

export const runtime = 'nodejs'
const attempts = new Map<string, { count: number; expires: number }>()
const response = (error: string, status: number) => Response.json({ error }, { status })

export async function POST(request: Request) {
  const expectedOrigin = new URL(process.env.NEXT_PUBLIC_SERVER_URL || request.url).origin
  if (request.headers.get('origin') !== expectedOrigin) return response('Die Anfrage konnte nicht verarbeitet werden.', 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return response('Bitte sende das Kontaktformular erneut.', 415)
  if (Number(request.headers.get('content-length')) > 20000) return response('Die Nachricht ist zu lang.', 413)
  let input: unknown
  try {
    const reader = request.body?.getReader()
    if (!reader) return response('Bitte fülle das Formular aus.', 400)
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 20000) { await reader.cancel(); return response('Die Nachricht ist zu lang.', 413) }
      chunks.push(value)
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch { return response('Bitte prüfe die Angaben und versuche es erneut.', 400) }
  const validated = validateContactMessage(input)
  if (!validated.data) return response(validated.error!, 400)
  if (!getSMTPConfig()) return response('Der Nachrichtenversand ist gerade nicht verfügbar. Bitte nutze vorerst die E-Mail-Adressen unserer Trainer.', 503)

  const now = Date.now()
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key)
  const key = validated.data.email.toLowerCase()
  const recent = attempts.get(key) ?? { count: 0, expires: now + 60000 }
  if (recent.count >= 3 || attempts.size >= 2000) return response('Bitte warte eine Minute, bevor du erneut eine Nachricht sendest.', 429)
  recent.count++
  attempts.set(key, recent)

  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
    const distribution = process.env.CONTACT_TO_EMAIL?.trim() || settings.contactEmail?.trim()
    let recipients: string[]
    if (distribution) {
      if (!isEmailAddress(distribution)) return response('Der Nachrichtenversand ist gerade nicht verfügbar.', 503)
      recipients = [distribution]
    } else {
      const trainers = await payload.find({
        collection: 'team-members', pagination: false, depth: 0,
        where: { active: { equals: true } }, overrideAccess: false,
      })
      recipients = [...new Set(trainers.docs.flatMap(person => person.email && isEmailAddress(person.email) ? [person.email] : []))]
    }
    if (!recipients.length) return response('Der Nachrichtenversand ist gerade nicht verfügbar.', 503)
    const sent = await payload.sendEmail({
      to: recipients,
      replyTo: validated.data.email,
      subject: 'Neue Nachricht über UWR Konstanz',
      text: contactEmailBody(validated.data),
    }) as { accepted?: string[]; rejected?: string[] } | undefined
    if (!sent?.accepted?.length || sent.rejected?.length) throw new Error('SMTP did not accept all contact recipients')
    return Response.json({ success: true })
  } catch {
    // Do not put submitted contact details or SMTP credentials into logs.
    console.error('Contact message delivery failed.')
    return response('Die Nachricht konnte gerade nicht versendet werden. Bitte versuche es später erneut oder nutze die E-Mail-Adressen unserer Trainer.', 502)
  }
}
