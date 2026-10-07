import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Termin / Aktion', plural: 'Termine & Aktionen' },
  admin: {
    group: 'Inhalte',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'start', 'location'],
    description: 'Turniere, Aktionen, Trainingslager und besondere Termine.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    {
      name: 'type', label: 'Art', type: 'select', required: true, defaultValue: 'aktion',
      options: [
        { label: 'Turnier', value: 'turnier' },
        { label: 'Aktion', value: 'aktion' },
        { label: 'Trainingslager', value: 'trainingslager' },
        { label: 'Probetraining', value: 'probetraining' }
      ]
    },
    { name: 'start', label: 'Beginn', type: 'date', required: true },
    { name: 'end', label: 'Ende', type: 'date' },
    { name: 'location', label: 'Ort', type: 'text' },
    { name: 'image', label: 'Bild', type: 'upload', relationTo: 'media' },
    { name: 'description', label: 'Beschreibung', type: 'richText' },
    { name: 'link', label: 'Weitere Infos / Anmeldung', type: 'text' },
  ],
}
