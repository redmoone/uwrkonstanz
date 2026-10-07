import Image from 'next/image'
import Link from 'next/link'
import type { HomePost } from '@/lib/home-data'
import { getMediaURL } from '@/lib/media-url'

const fallbackImages = [
  '/images/uwr/variants/goal-scene-original-web.jpg',
  '/images/uwr/variants/wide-match-original-web.jpg',
  '/images/uwr/variants/dark-match-original-web.jpg',
]

export function NewsCard({ post, index }: { post: HomePost; index: number }) {
  const media = typeof post.heroImage === 'object' ? post.heroImage : null
  const dynamicImage = media?.sizes?.card?.url || media?.url
  const image = dynamicImage ? getMediaURL(dynamicImage) : fallbackImages[index % fallbackImages.length]
  const date = post.publishedAt ? new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(post.publishedAt)) : ''

  return (
    <article className="news-card">
      <Link className="news-card__link" href={`/news/${post.slug}`}>
        <figure className="news-card__figure">
          <div className="news-card__image"><Image src={image} alt={media?.alt || ''} fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 33vw, 25vw" /></div>
          {media?.credit && <figcaption className="news-card__credit">Foto: {media.credit}</figcaption>}
        </figure>
        <div className="news-card__copy">
          {date && <p className="kicker kicker--small"><time dateTime={post.publishedAt || undefined}>{date}</time></p>}
          <h3>{post.title}</h3>
          <p className="news-card__excerpt">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  )
}
