import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'

export const TrainingTimes: CollectionConfig = {
  slug: 'training-times',
  labels: { singular: 'Trainingszeit', plural: 'Trainingszeiten' },
  admin: {
    group: 'Verein',
    useAsTitle: 'label',
    defaultColumns: ['label', 'weekday', 'startTime', 'endTime', 'location', 'active'],
    description: 'Trainingszeiten ändern, ohne die Website anfassen zu müssen.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'label', label: 'Bezeichnung', type: 'text', required: true, defaultValue: 'Erwachsenentraining' },
    {
      name: 'weekday', label: 'Wochentag', type: 'select', required: true,
      options: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'].map((d) => ({ label: d, value: d.toLowerCase() }))
    },
    { name: 'startTime', label: 'Start', type: 'text', required: true, admin: { placeholder: '20:00' } },
    { name: 'endTime', label: 'Ende', type: 'text', required: true, admin: { placeholder: '21:30' } },
    { name: 'location', label: 'Bad / Ort', type: 'text', required: true },
    { name: 'address', label: 'Adresse', type: 'text' },
    { name: 'mapUrl', label: 'Karten-Link', type: 'text' },
    { name: 'sortOrder', label: 'Reihenfolge', type: 'number', defaultValue: 10 },
    { name: 'active', label: 'Aktiv anzeigen', type: 'checkbox', defaultValue: true },
  ],
}
