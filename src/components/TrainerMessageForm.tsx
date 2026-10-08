'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

export function TrainerMessageForm() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  return <form className="trainer-message" onSubmit={async event => {
    event.preventDefault()
    if (status === 'pending') return
    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('pending')
    setFeedback('')
    try {
      const result = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), phone: data.get('phone'), message: data.get('message'), website: data.get('website') }),
      })
      const body = await result.json()
      if (!result.ok || body.success !== true) throw new Error(body.error || 'Die Nachricht konnte gerade nicht versendet werden. Bitte versuche es später erneut.')
      form.reset()
      setStatus('success')
      setFeedback('Deine Nachricht wurde versendet. Wir melden uns bei dir!')
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error && error.message !== 'Failed to fetch' ? error.message : 'Die Nachricht konnte gerade nicht versendet werden. Bitte prüfe deine Verbindung und versuche es erneut.')
    }
  }}>
    <fieldset className="trainer-message__fields" disabled={status === 'pending'}>
      <label htmlFor="contact-email">Deine E-Mail-Adresse</label>
      <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="du@beispiel.de" />
      <label htmlFor="contact-phone">Handynummer <span>(optional)</span></label>
      <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="Für einen Rückruf" />
      <label htmlFor="trainer-message">Deine Nachricht</label>
      <textarea id="trainer-message" name="message" rows={5} required maxLength={4000} placeholder="Was möchtest du wissen?" />
      <div className="trainer-message__honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      <button className="button button--aqua" type="submit">{status === 'pending' ? 'WIRD VERSENDET …' : 'NACHRICHT VERSENDEN'} <ArrowUpRight size={18} aria-hidden="true" /></button>
    </fieldset>
    {feedback && <p className={`trainer-message__feedback trainer-message__feedback--${status}`} role={status === 'error' ? 'alert' : 'status'}>{feedback}</p>}
  </form>
}
