import { NewsHero } from '@/components/NewsHero'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NewsCard } from '@/components/NewsCard'
import { getPublishedPosts } from '@/lib/news-data'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ page?: string }> }

export default async function NewsPage({ searchParams }: Props) {
  const { page } = await searchParams
  const requestedPage = Number(page || '1')
  const pageNumber = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const posts = await getPublishedPosts(12, pageNumber)

  if (pageNumber > 1 && !posts.docs.length) notFound()

  return (
    <main className="subpage">
      <NewsHero>
        <header className="subpage-header">
          <p className="kicker">AUS DEM BECKEN</p>
          <h1>NEWS & STORIES</h1>
        </header>
      </NewsHero>
      <div className="page-shell">
        <section className="news-archive" aria-label="Berichte">
          <h2 className="sr-only">Alle Berichte</h2>
          {posts.docs.length ? (
            <div className={`news-grid${posts.docs.length === 1 ? ' news-grid--single' : ''}`}>
              {posts.docs.map((post, index) => <NewsCard key={post.id} post={post} index={index} />)}
            </div>
          ) : <p>Aktuell sind keine Berichte veröffentlicht.</p>}
          {(posts.hasPrevPage || posts.hasNextPage) && (
            <nav className="news-pagination" aria-label="Weitere Berichte">
              {posts.hasPrevPage && <Link href={`/news?page=${pageNumber - 1}`}>← Zurück</Link>}
              <span>Seite {pageNumber} von {posts.totalPages}</span>
              {posts.hasNextPage && <Link href={`/news?page=${pageNumber + 1}`}>Weiter →</Link>}
            </nav>
          )}
        </section>
      </div>
    </main>
  )
}
