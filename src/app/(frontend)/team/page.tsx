import type { Metadata } from 'next'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { TrainerMessageForm } from '@/components/TrainerMessageForm'
import { getTeamMembers } from '@/lib/team-data'
import { getMediaURL } from '@/lib/media-url'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Team & Trainer – UWR Konstanz',
  description: 'Unsere Trainer bei UWR Konstanz: Ansprechpartner für Fragen zum Team, Training und deinem Einstieg ins Unterwasserrugby.',
}

export default async function TeamPage() {
  const members = await getTeamMembers()

  return <main className="subpage team-page">
    <div className="page-shell">
      <Header />
      <header className="subpage-header team-page__header">
        <p className="kicker">DAS TEAM HINTER DEM TRAINING</p>
        <h1>UNSERE<br />TRAINER</h1>
        <p>Fragen zum Training oder Lust auf deinen ersten Tauchgang? Schreib uns.</p>
      </header>
      <section className="trainer-grid" aria-label="Trainer und Ansprechpartner">
        {members.map(person => {
          const photo = typeof person.photo === 'object' ? person.photo : null
          return <article key={person.id} className="trainer-card">
            {photo?.url ? <Image className="trainer-card__photo" src={getMediaURL(photo.url)}
              alt={photo.alt || person.name} width={600} height={600} sizes="(max-width: 767px) 100vw, 560px" />
              : <div className="trainer-card__portrait" aria-hidden="true"><span>{person.name.charAt(0)}</span></div>}
            <div className="trainer-card__copy">
              <p className="kicker kicker--cyan">{person.role}</p>
              <h2>{person.name}</h2>
              {person.email && <a className="trainer-card__email" href={`mailto:${person.email}`}><Mail size={18} aria-hidden="true" />{person.email}</a>}
            </div>
          </article>
        })}
        {!members.length && <p>Unsere Trainerprofile werden gerade ergänzt.</p>}
      </section>
      <section id="nachricht" className="team-message" aria-labelledby="team-message-title">
        <div><p className="kicker">WIR FREUEN UNS AUF DICH</p><h2 id="team-message-title">SCHREIB<br />UNS.</h2><p>Ob Probetraining oder eine Frage zum Sport: Unsere Trainer sind für dich da.</p></div>
        <TrainerMessageForm />
      </section>
    </div>
    <footer className="footer"><div className="page-shell footer__inner"><Logo /><span>UWR Konstanz · Unterwasserrugby am Bodensee</span></div></footer>
  </main>
}
