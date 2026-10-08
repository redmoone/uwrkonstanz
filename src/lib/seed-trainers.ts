import type { Payload, PayloadRequest } from 'payload'

const trainers = [
  { name: 'Gesa', role: 'Trainerin', email: 'gesa@uwr-kn.de', sortOrder: 10 },
  { name: 'Nico', role: 'Trainer', email: 'nico@uwr-kn.de', sortOrder: 20 },
]

export async function seedTrainers(payload: Payload, req?: PayloadRequest) {
  for (const trainer of trainers) {
    const existing = await payload.find({
      collection: 'team-members', limit: 1, depth: 0, req,
      where: { or: [{ name: { equals: trainer.name } }, { email: { equals: trainer.email } }] },
    })
    if (existing.docs.length) continue
    await payload.create({ collection: 'team-members', data: { ...trainer, active: true }, req })
  }
}
