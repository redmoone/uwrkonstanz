'use client'

import { useId } from 'react'
import { DEBUG_HOTSPOTS } from '@/lib/uwr-hotspots'
import type { StoryHotspot } from '@/lib/uwr-story'

export function OutlineOverlay({ hotspots, activeId }: { hotspots: StoryHotspot[]; activeId: string | null }) {
  const filterId = `outline-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <g className="outline-overlay" aria-hidden="true">
      <defs><filter id={filterId} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter></defs>
      {hotspots.map(point => {
        const active = DEBUG_HOTSPOTS || activeId === point.id
        return <g key={point.id} data-outline-id={point.id} data-active={active}
          opacity={active ? 1 : 0} style={{ transition: active ? 'opacity 280ms ease' : 'none' }}>
          {point.outlinePath ? <>
            <path className="outline-overlay__glow" d={point.outlinePath} filter={`url(#${filterId})`} vectorEffect="non-scaling-stroke" />
            <path className="outline-overlay__stroke" d={point.outlinePath} vectorEffect="non-scaling-stroke" />
          </> : <circle className="outline-overlay__local-glow" cx={point.x} cy={point.y} r="12" filter={`url(#${filterId})`} />}
        </g>
      })}
    </g>
  )
}
