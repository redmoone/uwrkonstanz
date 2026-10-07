import type { Metadata } from 'next'
import React from 'react'
import './styles.css'

export const metadata: Metadata = {
  title: 'UWR Konstanz – Unterwasserrugby',
  description: 'Unterwasserrugby in Konstanz: Training, Wettkampf, Team und Probetraining.',
  icons: {
    icon: { url: '/images/uwr/logo.svg', type: 'image/svg+xml' },
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
