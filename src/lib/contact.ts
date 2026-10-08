export const isEmailAddress = (value: string) =>
  value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)

export type ContactMessage = { email: string; phone: string; message: string }

export function validateContactMessage(value: unknown): { data?: ContactMessage; error?: string } {
  if (!value || typeof value !== 'object') return { error: 'Bitte fülle das Formular aus.' }
  const input = value as Record<string, unknown>
  if (input.website) return { error: 'Die Nachricht konnte nicht versendet werden.' }
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  if (!isEmailAddress(email)) return { error: 'Bitte gib eine gültige E-Mail-Adresse an.' }
  if (phone && (phone.length > 40 || !/^[+\d()\s./-]+$/.test(phone) || !/\d/.test(phone))) {
    return { error: 'Bitte prüfe deine Handynummer oder lasse das Feld leer.' }
  }
  if (!message || message.length > 4000) return { error: 'Bitte schreibe eine Nachricht mit höchstens 4000 Zeichen.' }
  return { data: { email, phone, message } }
}

export function getSMTPConfig(env: NodeJS.ProcessEnv = process.env) {
  const host = env.SMTP_HOST?.trim()
  const from = env.SMTP_FROM_ADDRESS?.trim()
  const port = Number(env.SMTP_PORT || 587)
  const user = env.SMTP_USER
  const pass = env.SMTP_PASSWORD
  if (!host || !from || !isEmailAddress(from) || !Number.isInteger(port) || port < 1 || port > 65535 || Boolean(user) !== Boolean(pass)) return null
  return {
    from,
    transportOptions: {
      host, port,
      secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
      requireTLS: !['127.0.0.1', 'localhost', '::1'].includes(host),
      ...(user && pass ? { auth: { user, pass } } : {}),
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    },
  }
}

export function contactEmailBody(data: ContactMessage) {
  return `Neue Nachricht über die Teamseite von UWR Konstanz\n\nE-Mail: ${data.email}\nHandynummer: ${data.phone || 'Nicht angegeben'}\n\n${data.message}`
}
