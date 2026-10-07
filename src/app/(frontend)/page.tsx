import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MapPin, UsersRound, Waves } from 'lucide-react'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { NewsCard } from '@/components/NewsCard'
import { getHomeData } from '@/lib/home-data'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { posts, training } = await getHomeData()
  const primaryTraining = training[0]

  return (
    <main>
      <section className="hero">
        <Image src="/images/uwr/variants/hero-underwater-rugby.png" alt="Unterwasserrugby-Spielszene am Korb" fill priority quality={90} sizes="100vw" />
        <div className="hero__overlay" />
        <div className="page-shell hero__inner">
          <Header />
          <div className="hero__copy">
            <p className="kicker kicker--light">TEAMSPORT UNTER WASSER</p>
            <h1><span>UNTERWASSER</span><span>RUGBY</span><span className="accent">KONSTANZ</span></h1>
            <p className="hero__subtitle">Training Wettkampf Team</p>
            <Link className="button button--aqua" href="/probetraining">PROBETRAINING <span>→</span></Link>
          </div>
        </div>
      </section>

      <section id="sport" className="section section--light">
        <div className="page-shell about-grid">
          <div>
            <p className="kicker">UNTERWASSERRUGBY</p>
            <h2>WAS IST UWR?</h2>
            <p className="lead">Unterwasserrugby ist der einzige echte dreidimensionale Teamsport der Welt. Zwei Mannschaften kämpfen unter Wasser um einen sinkenden Ball und versuchen, ihn im gegnerischen Korb am Beckenboden zu versenken. Gespielt wird mit Maske, Schnorchel und Flossen. Angriffe kommen von vorne, hinten, oben oder unten – dadurch entsteht ein Spiel, das schnell, intensiv und taktisch einzigartig ist.</p>
            <Link className="button button--outline" href="/unterwasserrugby">MEHR ERFAHREN <span>→</span></Link>
          </div>
          <div className="facts">
            <div><Waves /><span><strong>Einmaliger Teamsport</strong><small>Spiel in drei Dimensionen</small></span></div>
            <div><UsersRound /><span><strong>Taktik, Kraft & Ausdauer</strong><small>Teamplay unter Druck</small></span></div>
            <div><span className="facts__scuba-icon" aria-hidden="true" /><span><strong>Einfach einsteigen</strong><small>Ausprobieren und eintauchen</small></span></div>
          </div>
          <div className="about-photo">
            <Image src="/images/uwr/variants/poolside-original-web.jpg" alt="UWR-Spieler beim Start am Beckenrand" fill sizes="(max-width: 900px) 100vw, 36vw" />
          </div>
        </div>
      </section>

      <section className="action-strip">
        <div className="action-strip__image">
          <Image src="/images/uwr/variants/wide-match-hero-16x9.jpg" alt="Unterwasserrugby-Spielszene" fill sizes="70vw" />
          <div className="action-strip__copy">
            <p className="kicker kicker--light">SPIELEN TAUCHEN KÄMPFEN</p>
            <h2>ADRENALIN<br />UNTER WASSER</h2>
          </div>
        </div>
        <div className="action-strip__panel">
          <p className="kicker kicker--cyan">UNSERE LEIDENSCHAFT</p>
          <p>Tempo, Taktik, Teamgeist – und das alles unter Wasser. Im Training wie im Wettkampf begeistert uns das intensive Zusammenspiel und die Dynamik eines Sports, den es so kein zweites Mal gibt.</p>
          <a className="button button--outline-light" href="#news">IMPRESSIONEN <span>→</span></a>
        </div>
      </section>

      <section id="news" className="section section--light">
        <div className="page-shell content-grid">
          <div className="training-card">
            <p className="kicker">TRAINING</p>
            <h2>TRAININGS<wbr />ZEITEN</h2>
            <p>Du willst es selbst ausprobieren? Komm vorbei – auch ohne UWR-Erfahrung.</p>
            {primaryTraining && (
              <div className="training-info">
                <CalendarDays />
                <div><strong>{primaryTraining.weekday}</strong><span>{primaryTraining.startTime}–{primaryTraining.endTime} Uhr</span></div>
              </div>
            )}
            {primaryTraining && (
              <div className="training-info">
                <MapPin />
                <div><strong>{primaryTraining.location}</strong><span>{primaryTraining.address}</span></div>
              </div>
            )}
            <Link className="button button--navy" href="/training">MEHR ZUM TRAINING <span>→</span></Link>
          </div>

          <div className="news-list">
            <div className="news-list__head"><div><p className="kicker">AUS DEM BECKEN</p><h2>NEWS & STORIES</h2></div><Link href="/news">ALLE BEITRÄGE →</Link></div>
            <div className={`news-grid${posts.length === 1 ? ' news-grid--single' : ''}`}>
              {posts.map((post, index) => <NewsCard key={post.id} post={post} index={index} />)}
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="join">
        <Image src="/images/uwr/variants/goal-scene-hero-16x9.jpg" alt="Unterwasserrugby am Tor" fill sizes="100vw" />
        <div className="join__overlay" />
        <div className="page-shell join__inner">
          <div><p className="kicker kicker--light">EIN TEAM EIN ZIEL</p><h2>WERDE TEIL<br />VON UWR KONSTANZ</h2></div>
          <div><p>Egal ob Einsteiger:in oder erfahrene:r Taucher:in – bei uns zählen Teamgeist, Neugier und die Freude am gemeinsamen Sport unter Wasser.</p><Link className="button button--aqua" href="/probetraining">JETZT PROBETRAINING VEREINBAREN <span>→</span></Link></div>
        </div>
      </section>

      <footer className="footer"><div className="page-shell footer__inner"><Logo /><span>UWR Konstanz · Unterwasserrugby am Bodensee</span></div></footer>
    </main>
  )
}
