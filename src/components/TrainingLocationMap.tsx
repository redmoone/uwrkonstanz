'use client'

import { useState } from 'react'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { getGoogleMapLinks } from '@/lib/training-map'

export function TrainingLocationMap({ location, address, mapUrl }: { location: string; address?: string; mapUrl?: string }) {
  const [loaded, setLoaded] = useState(false)
  const links = getGoogleMapLinks(location, address, mapUrl)

  return <div className="training-map">
    <div className="training-map__canvas">
      {loaded ? <iframe src={links.embed} title={`Google Maps: ${location}`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="training-map__placeholder">
        <MapPin size={38} strokeWidth={1.5} aria-hidden="true" />
        <strong>{location}</strong>
        {address && <span>{address}</span>}
        <button type="button" className="button button--navy" onClick={() => setLoaded(true)}>KARTE LADEN <ArrowUpRight size={16} aria-hidden="true" /></button>
        <small>Beim Laden wird eine Verbindung zu Google hergestellt.</small>
      </div>}
    </div>
    <a className="training-map__link" href={links.open} target="_blank" rel="noopener noreferrer">IN GOOGLE MAPS ÖFFNEN <ArrowUpRight size={16} aria-hidden="true" /></a>
  </div>
}
