import Image from 'next/image'
import { ArrowDown } from 'lucide-react'
import { Header } from '@/components/Header'

export function ExplainerHero() {
  return (
    <section className="explainer-hero" aria-labelledby="explainer-title">
      <Image src="/images/uwr/variants/hero-underwater-rugby.png" alt="" fill priority quality={90} sizes="100vw" />
      <div className="explainer-hero__shade" />
      <div className="page-shell explainer-hero__inner">
        <Header />
        <header className="explainer-hero__copy">
          <p className="kicker kicker--cyan">WAS IST UWR?</p>
          <h1 id="explainer-title">EIN SPIEL<br /><span>DREI DIMENSIONEN</span></h1>
          <p>Entdecke Ball, Korb und das Zusammenspiel unter Wasser.</p>
        </header>
        <a className="explainer-hero__arrow" href="#uwr-ball" aria-label="Zur Geschichte"><ArrowDown size={19} aria-hidden="true" /></a>
      </div>
    </section>
  )
}
