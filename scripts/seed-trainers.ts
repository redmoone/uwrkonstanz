import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedTrainers } from '../src/lib/seed-trainers'

// Usage: pnpm payload run scripts/seed-trainers.ts
process.env.PAYLOAD_MIGRATING = 'true'
const payload = await getPayload({ config: configPromise })
try {
  await seedTrainers(payload)
  console.log('Trainerprofile Gesa und Nico sind im CMS vorhanden.')
} finally {
  await payload.destroy()
}
