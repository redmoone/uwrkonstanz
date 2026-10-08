import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getTeamMembers() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'team-members', depth: 1, pagination: false, sort: 'sortOrder',
    overrideAccess: false, where: { active: { equals: true } },
  })
  return result.docs
}
