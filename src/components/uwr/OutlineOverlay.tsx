'use client'

import { useId } from 'react'
import { isHotspotActive, type StoryHotspot } from '@/lib/uwr-stage'

export function OutlineOverlay({ hotspots, activeId, trace, scale }: {
  hotspots: StoryHotspot[]; activeId: string | null; trace: boolean; scale: number
}) {
  const filterId = `outline-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return <g className="outline-overlay" aria-hidden="true">
    <defs><filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={4 / scale} />
    </filter></defs>
    {hotspots.filter(point => point.outlinePath).map(point => {
      const active = trace || isHotspotActive(point, activeId)
      return <g key={point.id} data-outline-id={point.id} data-active={active}
        opacity={active ? 1 : 0} style={{ transition: active ? 'opacity 300ms ease' : 'none' }}>
        <path className="outline-overlay__fill" d={point.outlinePath} fillRule="evenodd" />
        <path className="outline-overlay__glow" d={point.outlinePath} filter={`url(#${filterId})`} vectorEffect="non-scaling-stroke" />
        <path className="outline-overlay__stroke" d={point.outlinePath} vectorEffect="non-scaling-stroke" />
      </g>
    })}
  </g>
}
