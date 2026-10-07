import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '@/access'
import { slugify } from '@/lib/slugify'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Bericht', plural: 'Berichte' },
  admin: {
    group: 'Inhalte',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Spielberichte, Turniere, Training, Jugend und Vereinsleben.',
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: { autosave: true },
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    {
      name: 'slug',
      label: 'URL',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [({ value, data }) => value || slugify(data?.title || '')],
      },
    },
    {
      name: 'category',
      label: 'Kategorie',
      type: 'select',
      required: true,
      defaultValue: 'verein',
      options: [
        { label: 'Turnier / Liga', value: 'turnier' },
        { label: 'Training', value: 'training' },
        { label: 'Jugend', value: 'jugend' },
        { label: 'Vereinsleben', value: 'verein' },
        { label: 'Probetraining', value: 'probetraining' }
      ],
    },
    { name: 'excerpt', label: 'Kurztext', type: 'textarea', required: true, maxLength: 260 },
    { name: 'heroImage', label: 'Titelbild', type: 'upload', relationTo: 'media', required: true },
    { name: 'publishedAt', label: 'Datum', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'content', label: 'Text', type: 'richText', required: true },
  ],
}
