import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ExplainerCTA() {
  return (
    <section className="join explainer-cta" aria-labelledby="explainer-cta-title">
      {/* Pre-optimized asset: keep full resolution for the fullscreen portrait crop. */}
      <Image
        src="/images/uwr/source/explainer-dive.webp"
        alt=""
        fill
        unoptimized
        sizes="100vw"
      />
      <div className="explainer-cta__shade" aria-hidden="true" />
      <div className="story-shell explainer-cta__inner">
        <div className="explainer-cta__copy">
          <p className="kicker kicker--light">07 / SELBST AUSPROBIEREN</p>
          <h2 id="explainer-cta-title">AM BESTEN VERSTEHST DU UWR <span>IM WASSER.</span></h2>
          <p className="explainer-cta__description">Du brauchst noch keine UWR-Erfahrung. Komm zum Probetraining und tauch mit uns ein.</p>
          <Link className="button button--aqua" href="/probetraining">
            PROBETRAINING <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
