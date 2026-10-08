import Link from 'next/link'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-link" aria-label="UWR Konstanz – Startseite"><Logo /></Link>
      <nav className="main-nav" aria-label="Hauptnavigation">
        <Link href="/unterwasserrugby">Über UWR</Link>
        <Link href="/training">Training</Link>
        <Link href="/news">News</Link>
        <Link href="/team">Team</Link>
      </nav>
    </header>
  )
}
