import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ExplainerCTA() {
  return (
    <section className="join explainer-cta" aria-labelledby="explainer-cta-title">
      <Image src="/images/uwr/variants/goal-scene-hero-16x9.jpg" alt="" fill sizes="100vw" />
      <div className="join__overlay" />
      <div className="story-shell join__inner">
        <div><p className="kicker kicker--light">06 / SELBST AUSPROBIEREN</p><h2 id="explainer-cta-title">AM BESTEN VERSTEHST DU UWR <span>IM WASSER.</span></h2></div>
        <div><p>Du brauchst noch keine UWR-Erfahrung. Komm zum Probetraining und tauch mit uns ein.</p><Link className="button button--aqua" href="/probetraining">PROBETRAINING <ArrowRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </section>
  )
}
