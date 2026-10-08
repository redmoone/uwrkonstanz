import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Posts } from '@/collections/Posts'
import { Events } from '@/collections/Events'
import { TrainingTimes } from '@/collections/TrainingTimes'
import { TeamMembers } from '@/collections/TeamMembers'
import { Pages } from '@/collections/Pages'
import { SiteSettings } from '@/globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Posts, Events, TrainingTimes, TeamMembers, Pages],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  db: sqliteAdapter({
    prodMigrations: migrations,
    client: {
      url: process.env.DATABASE_URL || 'file:./data/uwr.db',
    },
    wal: true,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
