'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Recipient = { id: number; name: string; email: string }

export function TrainerMessageForm({ recipients }: { recipients: Recipient[] }) {
  const [recipientId, setRecipientId] = useState(String(recipients[0]?.id ?? ''))
  const [message, setMessage] = useState('')
  if (!recipients.length) return null

  return <form className="trainer-message" onSubmit={event => {
    event.preventDefault()
    const recipient = recipients.find(person => String(person.id) === recipientId)
    if (!recipient || !message.trim()) return
    const subject = encodeURIComponent('Nachricht über UWR Konstanz')
    window.location.href = `mailto:${recipient.email}?subject=${subject}&body=${encodeURIComponent(message.trim())}`
  }}>
    <label htmlFor="trainer-recipient">An wen möchtest du schreiben?</label>
    <select id="trainer-recipient" value={recipientId} onChange={event => setRecipientId(event.target.value)} required>
      {recipients.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
    </select>
    <label htmlFor="trainer-message">Deine Nachricht</label>
    <textarea id="trainer-message" value={message} onChange={event => setMessage(event.target.value)}
      rows={5} required maxLength={4000} placeholder="Was möchtest du wissen?" aria-describedby="trainer-message-hint" />
    <p id="trainer-message-hint">Deine Nachricht öffnet sich in deinem E-Mail-Programm. Dort kannst du sie abschicken.</p>
    <button className="button button--aqua" type="submit">E-MAIL ÖFFNEN <ArrowUpRight size={18} aria-hidden="true" /></button>
  </form>
}
