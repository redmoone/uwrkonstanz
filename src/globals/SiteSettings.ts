import type { GlobalConfig } from 'payload'
import { authenticated, anyone } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Website-Einstellungen',
  admin: { group: 'Verein', description: 'Startseiten-Texte und Kontaktinformationen.' },
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'heroEyebrow', label: 'Hero-Kicker', type: 'text', defaultValue: 'TEAMSPORT UNTER WASSER' },
    { name: 'heroTitle', label: 'Hero-Titel', type: 'textarea', defaultValue: 'UNTERWASSER\nRUGBY\nKONSTANZ' },
    { name: 'heroSubtitle', label: 'Hero-Unterzeile', type: 'text', defaultValue: 'Training Wettkampf Team' },
    { name: 'contactEmail', label: 'Kontakt-E-Mail / Verteiler', type: 'email', admin: { description: 'Gemeinsamer Empfänger des Kontaktformulars. Leer: Nachrichten gehen an alle aktiven Trainer mit E-Mail-Adresse.' } },
    { name: 'instagramUrl', label: 'Instagram', type: 'text' },
    { name: 'facebookUrl', label: 'Facebook', type: 'text' },
    { name: 'youtubeUrl', label: 'YouTube', type: 'text' },
  ],
}
