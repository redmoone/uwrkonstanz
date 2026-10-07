import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { NewsHero } from '@/components/NewsHero'
import { getPublishedPost, postCategoryLabels } from '@/lib/news-data'
import { getMediaURL } from '@/lib/media-url'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) return { title: 'Bericht nicht gefunden – UWR Konstanz' }

  return {
    title: `${post.title} – UWR Konstanz`,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) notFound()

  const media = typeof post.heroImage === 'object' ? post.heroImage : null
  const date = new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date(post.publishedAt))

  return (
    <main className="subpage">
      <NewsHero>
        <header className="news-article__header">
          <Link className="news-back" href="/news">← Alle Berichte</Link>
          <p className="kicker">{postCategoryLabels[post.category]}</p>
          <h1 id="news-title">{post.title}</h1>
          <p className="news-article__date">Veröffentlicht am <time dateTime={post.publishedAt}>{date}</time></p>
        </header>
      </NewsHero>
      <div className="page-shell">
        <article className="news-article" aria-labelledby="news-title">
          <div className={`news-article__body${media?.url ? ' news-article__body--with-image' : ''}`}>
            {media?.url && (
              <figure className="news-article__figure">
                <Image
                  src={getMediaURL(media.url)}
                  alt={media.alt}
                  width={media.width || 1200}
                  height={media.height || 1600}
                  sizes="(max-width: 900px) 100vw, 40vw"
                  priority
                />
                {media.credit && <figcaption>Foto: {media.credit}</figcaption>}
              </figure>
            )}
            <RichText className="news-article__text" data={post.content} />
          </div>
        </article>
      </div>
    </main>
  )
}
