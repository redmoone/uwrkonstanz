import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'
import { getTrainingCalendarDate, validateTrainingDateRange } from '@/lib/training-dates'

const validateDate = (value: unknown) => value == null || value === '' || getTrainingCalendarDate(value) !== undefined || 'Bitte ein gültiges Datum auswählen.'

export const TrainingBreaks: CollectionConfig = {
  slug: 'training-breaks',
  labels: { singular: 'Trainingspause / Ausfall', plural: 'Trainingspausen' },
  admin: {
    group: 'Verein',
    useAsTitle: 'reason',
    defaultColumns: ['reason', 'startDate', 'endDate', 'trainings', 'active'],
    description: 'Einzelne Trainings absagen oder ganze Zeiträume ausschließen. Die Website überspringt diese Termine automatisch. Ein Eintrag kann mehrere Trainingszeiten betreffen.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    {
      name: 'reason', label: 'Grund', type: 'text', required: true,
      admin: { description: 'Zum Beispiel Schulferien, Semesterferien oder Bad geschlossen. Der Grund wird auf der Website angezeigt.' },
    },
    {
      name: 'startDate', label: 'Ausfall ab / am', type: 'date', required: true,
      validate: (value, { siblingData }) => {
        if (!getTrainingCalendarDate(value)) return 'Bitte ein gültiges Startdatum auswählen.'
        return validateTrainingDateRange(value, (siblingData as { endDate?: unknown }).endDate) || 'Das Ende der Trainingspause darf nicht vor ihrem Beginn liegen.'
      },
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Dieser Tag gehört zur Pause. Für einen einzelnen ausgefallenen Termin nur dieses Datum eintragen.',
      },
    },
    {
      name: 'endDate', label: 'Ausfall bis (optional)', type: 'date',
      validate: (value, { siblingData }) => {
        const dateValidation = validateDate(value)
        if (dateValidation !== true) return dateValidation
        return validateTrainingDateRange((siblingData as { startDate?: unknown }).startDate, value) || 'Das Ende der Trainingspause darf nicht vor ihrem Beginn liegen.'
      },
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Dieser Tag gehört ebenfalls zur Pause. Leer lassen: Es fällt nur der unter „Ausfall ab / am“ gewählte Tag aus.',
      },
    },
    {
      name: 'trainings', label: 'Betroffene Trainingszeiten', type: 'relationship', relationTo: 'training-times', hasMany: true, required: true,
      admin: { description: 'Alle Serien oder Einzeltermine auswählen, die ausfallen. Andere Trainings, z. B. im Freibad Kreuzlingen, finden weiter statt.' },
    },
    {
      name: 'active', label: 'Pause aktiv', type: 'checkbox', defaultValue: true,
      admin: { description: 'Deaktivieren hebt diese Absage auf, ohne den Eintrag zu löschen.' },
    },
  ],
}