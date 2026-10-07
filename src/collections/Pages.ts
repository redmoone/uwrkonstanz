import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'
import { slugify } from '@/lib/slugify'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Seite', plural: 'Seiten' },
  admin: { group: 'Inhalte', useAsTitle: 'title', description: 'Längere statische Inhalte wie Über uns oder Probetraining.' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', label: 'Titel', type: 'text', required: true },
    {
      name: 'slug', label: 'URL', type: 'text', required: true, unique: true,
      hooks: { beforeValidate: [({ value, data }) => value || slugify(data?.title || '')] }
    },
    { name: 'heroImage', label: 'Titelbild', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Inhalt', type: 'richText', required: true },
  ],
}
