import type { ReactNode } from 'react'
import Image from 'next/image'
import { Header } from './Header'

export function NewsHero({ children }: { children: ReactNode }) {
  return (
    <div className="news-hero">
      <Image
        src="/images/uwr/variants/hero-underwater-rugby.png"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
      />
      <div className="hero__overlay" />
      <div className="page-shell news-hero__inner">
        <Header />
        {children}
      </div>
    </div>
  )
}
