import path from 'path'
import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Bild', plural: 'Bilder' },
  admin: {
    group: 'Inhalte',
    useAsTitle: 'alt',
    description: 'Bilder inklusive Fotocredit und Nutzungsnachweis.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    focalPoint: true,
    imageSizes: [
      { name: 'card', width: 900, height: 506, position: 'centre', withoutEnlargement: true },
      { name: 'portrait', width: 900, height: 1125, position: 'centre', withoutEnlargement: true },
      { name: 'hero', width: 1920, height: 1080, position: 'centre', withoutEnlargement: true }
    ],
    mimeTypes: ['image/*'],
  },
  fields: [
    { name: 'alt', label: 'Alternativtext', type: 'text', required: true },
    { name: 'credit', label: 'Fotocredit', type: 'text' },
    { name: 'source', label: 'Quelle / Fotograf', type: 'text' },
    {
      name: 'rights',
      label: 'Nutzungsrecht',
      type: 'select',
      defaultValue: 'club-permission',
      options: [
        { label: 'Eigenes Vereinsfoto', value: 'club-owned' },
        { label: 'Freigabe für Verein liegt vor', value: 'club-permission' },
        { label: 'Lizenz erworben', value: 'licensed' },
        { label: 'Nur redaktionell', value: 'editorial-only' }
      ],
    },
    { name: 'rightsNote', label: 'Hinweis zur Freigabe', type: 'textarea' },
  ],
}
