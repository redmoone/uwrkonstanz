import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'
import { getPublishedPosts } from '@/lib/news-data'
import { getNextTraining, type TrainingBreak } from '@/lib/training-schedule'

export type HomePost = {
  id: number | string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  heroImage?: Media | number | string | null
}

export type TrainingTime = {
  id: number | string
  label: string
  weekday: string
  startTime: string
  endTime: string
  location: string
  address?: string | null
  validFrom?: string | null
  validUntil?: string | null
  oneOffDate?: string | null
}

const fallbackPosts: HomePost[] = [
  { id: 'fallback-1', title: 'Bodenseecup: Einsatz in drei Dimensionen', slug: 'bodenseecup', excerpt: 'Turnier, Teamgeist und jede Menge Zeit unter Wasser.', publishedAt: '2026-09-14' },
  { id: 'fallback-2', title: 'Training: Technik, Taktik und Team', slug: 'training', excerpt: 'Ein Blick in unseren Trainingsalltag.', publishedAt: '2026-09-03' },
  { id: 'fallback-3', title: 'Neugierig? Komm zum Probetraining', slug: 'probetraining', excerpt: 'Du brauchst keine UWR-Erfahrung. Wir zeigen dir den Rest.', publishedAt: '2026-08-21' },
]

export async function getHomeData() {
  try {
    const payload = await getPayload({ config: configPromise })
    const [postsResult, trainingResult, breaksResult] = await Promise.all([
      getPublishedPosts(3),
      payload.find({
        collection: 'training-times',
        pagination: false,
        overrideAccess: false,
        where: { active: { equals: true } },
      }),
      payload.find({
        collection: 'training-breaks',
        pagination: false,
        depth: 0,
        overrideAccess: false,
        where: { active: { equals: true } },
        sort: 'startDate',
      }),
    ])

    return {
      posts: (postsResult.docs.length ? postsResult.docs : fallbackPosts) as unknown as HomePost[],
      trainings: trainingResult.docs as TrainingTime[],
      trainingBreaks: breaksResult.docs as TrainingBreak[],
      nextTraining: getNextTraining(trainingResult.docs as TrainingTime[], new Date(), breaksResult.docs as TrainingBreak[]),
    }
  } catch {
    return { posts: fallbackPosts, trainings: [] as TrainingTime[], trainingBreaks: [] as TrainingBreak[], nextTraining: undefined }
  }
}
