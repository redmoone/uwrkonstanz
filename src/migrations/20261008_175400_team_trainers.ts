import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
import { seedTrainers } from '../lib/seed-trainers'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await seedTrainers(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep CMS content when rolling back the application; editors may have updated it.
}
