import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Benutzer', plural: 'Benutzer' },
  auth: true,
  admin: {
    useAsTitle: 'name',
    group: 'System',
    description: 'Trainer und Administratoren, die Inhalte pflegen dürfen.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    create: async ({ req }) => {
      if (req.user) return true
      const result = await req.payload.count({ collection: 'users', overrideAccess: true })
      return result.totalDocs === 0
    },
  },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'role',
      label: 'Rolle',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Trainer / Redaktion', value: 'editor' },
        { label: 'Administrator', value: 'admin' }
      ],
    },
  ],
}
