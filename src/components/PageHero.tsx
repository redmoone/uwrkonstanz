import type { ReactNode } from 'react'
import Image from 'next/image'
import { Header } from './Header'

type Props = { image: string; alt: string; variant: 'team' | 'training'; children: ReactNode }

export function PageHero({ image, alt, variant, children }: Props) {
  return <div className={`page-hero page-hero--${variant}`}>
    <Image src={image} alt={alt} fill priority quality={90} sizes="100vw" />
    <div className="page-hero__shade" aria-hidden="true" />
    <div className="page-shell page-hero__inner">
      <Header />
      {children}
    </div>
  </div>
}
