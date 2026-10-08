import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'
import { parseTrainingTime } from '@/lib/training-schedule'

const validateTime = (value: unknown) => value == null || parseTrainingTime(value) !== undefined || 'Bitte eine gültige Uhrzeit eingeben, z. B. 19:10.'

export const TrainingTimes: CollectionConfig = {
  slug: 'training-times',
  labels: { singular: 'Trainingszeit', plural: 'Trainingszeiten' },
  admin: {
    group: 'Verein',
    useAsTitle: 'label',
    defaultColumns: ['label', 'weekday', 'startTime', 'endTime', 'location', 'active'],
    description: 'Wöchentliche Trainingszeiten pflegen. Die Startseite zeigt automatisch den nächsten aktiven Termin an.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'label', label: 'Bezeichnung', type: 'text', required: true, defaultValue: 'Erwachsenentraining' },
    {
      name: 'weekday', label: 'Wochentag', type: 'select', required: true,
      options: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'].map((d) => ({ label: d, value: d.toLowerCase() }))
    },
    { name: 'startTime', label: 'Start', type: 'text', required: true, validate: validateTime, admin: { placeholder: '19:10' } },
    { name: 'endTime', label: 'Ende', type: 'text', required: true, validate: validateTime, admin: { placeholder: '20:40' } },
    { name: 'location', label: 'Bad / Ort', type: 'text', required: true },
    { name: 'address', label: 'Adresse', type: 'text' },
    { name: 'mapUrl', label: 'Karten-Link', type: 'text' },
    // Keep the stored field for database compatibility; selection is chronological.
    { name: 'sortOrder', label: 'Reihenfolge', type: 'number', defaultValue: 10, admin: { hidden: true } },
    { name: 'active', label: 'Aktiv anzeigen', type: 'checkbox', defaultValue: true },
  ],
}
