import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Post } from '@/payload-types'

export const postCategoryLabels: Record<Post['category'], string> = {
  turnier: 'Turnier / Liga',
  training: 'Training',
  jugend: 'Jugend',
  verein: 'Vereinsleben',
  probetraining: 'Probetraining',
}

export async function getPublishedPosts(limit = 12, page = 1) {
  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    page,
    sort: '-publishedAt',
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
  })
}

export const getPublishedPost = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  return result.docs[0] ?? null
})
