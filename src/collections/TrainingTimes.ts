import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'
import { parseTrainingTime } from '@/lib/training-schedule'
import { getTrainingCalendarDate, validateTrainingDateRange } from '@/lib/training-dates'

const validateTime = (value: unknown) => value == null || parseTrainingTime(value) !== undefined || 'Bitte eine gültige Uhrzeit eingeben, z. B. 19:10.'
const validateDate = (value: unknown) => value == null || value === '' || getTrainingCalendarDate(value) !== undefined || 'Bitte ein gültiges Datum auswählen.'
const weekdays = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag']

export const TrainingTimes: CollectionConfig = {
  slug: 'training-times',
  labels: { singular: 'Trainingszeit', plural: 'Trainingszeiten' },
  admin: {
    group: 'Verein',
    useAsTitle: 'label',
    defaultColumns: ['label', 'weekday', 'oneOffDate', 'startTime', 'location', 'active'],
    description: 'Wöchentliche Serien und Einzeltermine pflegen, z. B. Hallenbad oder Sommertraining im Freibad. Ausfälle und Ferien werden unter Trainingspausen eingetragen.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeValidate: [({ data }) => {
      const date = getTrainingCalendarDate(data?.oneOffDate)
      if (!date) return data
      return { ...data, weekday: weekdays[new Date(`${date}T12:00:00.000Z`).getUTCDay()] }
    }],
  },
  fields: [
    { name: 'label', label: 'Bezeichnung', type: 'text', required: true, defaultValue: 'Erwachsenentraining' },
    {
      name: 'oneOffDate', label: 'Einzeltermin (optional)', type: 'date', validate: validateDate,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Mit Datum findet dieses Training nur an diesem Tag statt. Leer lassen für eine wöchentliche Serie.',
      },
    },
    {
      name: 'weekday', label: 'Wochentag', type: 'select', required: true,
      options: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'].map((d) => ({ label: d, value: d.toLowerCase() })),
      admin: { condition: (_, siblingData) => !siblingData.oneOffDate },
    },
    { name: 'startTime', label: 'Start', type: 'text', required: true, validate: validateTime, admin: { placeholder: '19:10' } },
    { name: 'endTime', label: 'Ende', type: 'text', required: true, validate: validateTime, admin: { placeholder: '20:40' } },
    { name: 'location', label: 'Bad / Ort', type: 'text', required: true },
    { name: 'address', label: 'Adresse', type: 'text' },
    { name: 'mapUrl', label: 'Karten-Link', type: 'text' },
    {
      name: 'validFrom', label: 'Serie gültig ab (optional)', type: 'date',
      validate: (value, { siblingData }) => {
        const dateValidation = validateDate(value)
        if (dateValidation !== true) return dateValidation
        return validateTrainingDateRange(value, (siblingData as { validUntil?: unknown }).validUntil) || 'Das Ende der Serie darf nicht vor ihrem Beginn liegen.'
      },
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        condition: (_, siblingData) => !siblingData.oneOffDate,
        description: 'Ab diesem Datum einschließlich gilt die wöchentliche Serie. Leer: kein Startdatum. Für eine Sommerserie den ersten möglichen Trainingstag wählen.',
      },
    },
    {
      name: 'validUntil', label: 'Serie gültig bis (optional)', type: 'date',
      validate: (value, { siblingData }) => {
        const dateValidation = validateDate(value)
        if (dateValidation !== true) return dateValidation
        return validateTrainingDateRange((siblingData as { validFrom?: unknown }).validFrom, value) || 'Das Ende der Serie darf nicht vor ihrem Beginn liegen.'
      },
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        condition: (_, siblingData) => !siblingData.oneOffDate,
        description: 'Bis zu diesem Datum einschließlich gilt die Serie. Leer: kein Enddatum. Danach wird sie automatisch nicht mehr vorgeschlagen.',
      },
    },
    // Keep the stored field for database compatibility; selection is chronological.
    { name: 'sortOrder', label: 'Reihenfolge', type: 'number', defaultValue: 10, admin: { hidden: true } },
    {
      name: 'active', label: 'Aktiv anzeigen', type: 'checkbox', defaultValue: true,
      admin: { description: 'Deaktivieren stoppt die gesamte Trainingsserie bzw. den Einzeltermin.' },
    },
  ],
}