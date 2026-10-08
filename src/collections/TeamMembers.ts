import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Ansprechpartner', plural: 'Team & Ansprechpartner' },
  admin: { group: 'Verein', useAsTitle: 'name', defaultColumns: ['name', 'role', 'email', 'active'], description: 'Trainerprofile für die Teamseite. Name, Funktion, E-Mail und optional ein Foto pflegen.' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'role', label: 'Funktion', type: 'text', required: true },
    { name: 'email', label: 'E-Mail', type: 'email' },
    { name: 'photo', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'sortOrder', label: 'Reihenfolge', type: 'number', defaultValue: 10 },
    { name: 'active', label: 'Aktiv anzeigen', type: 'checkbox', defaultValue: true },
  ],
}
