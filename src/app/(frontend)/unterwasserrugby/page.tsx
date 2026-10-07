import type { Metadata } from 'next'
import { ExplainerHero } from '@/components/uwr/ExplainerHero'
import { ExplainerCTA } from '@/components/uwr/ExplainerCTA'
import { Logo } from '@/components/Logo'
import { UwrExplainer } from '@/components/UwrExplainer'

export const metadata: Metadata = {
  title: 'Was ist UWR? Unterwasserrugby entdecken – UWR Konstanz',
  description: 'Tauch ein ins Unterwasserrugby: das Spiel in drei Dimensionen, Ball, Korb, Ausrüstung, Luft und Wechsel sowie Teamplay bei UWR Konstanz.',
}

export default function UnderwaterRugbyPage() {
  return (
    <main className="uwr-page">
      <ExplainerHero />
      <UwrExplainer />
      <ExplainerCTA />
      <footer className="footer"><div className="page-shell footer__inner"><Logo /><span>UWR Konstanz · Unterwasserrugby am Bodensee</span></div></footer>
    </main>
  )
}
