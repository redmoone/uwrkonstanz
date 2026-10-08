import { DEBUG_HOTSPOTS } from '@/lib/uwr-hotspots'
import type { StoryHotspot } from '@/lib/uwr-stage'

type Props = { hotspot: StoryHotspot; scale: number; active: boolean; trace: boolean; onHoverChange: (id: string | null) => void; describedBy: string }

export function HotspotMarker({ hotspot, scale, active, trace, onHoverChange, describedBy }: Props) {
  // Compensate only the button's physical size. Its center stays in image pixels.
  const size = 44 / scale
  return (
    <foreignObject x={hotspot.x - size / 2} y={hotspot.y - size / 2} width={size} height={size} style={{ pointerEvents: 'none' }}>
      <button className="hotspot-marker" type="button" data-hotspot-id={hotspot.id} data-active={active || trace}
        style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top left' }}
        aria-label={`${hotspot.label} im Foto hervorheben`} aria-pressed={active} aria-describedby={describedBy}
        onMouseEnter={() => onHoverChange(hotspot.id)} onMouseLeave={() => onHoverChange(null)}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) onHoverChange(hotspot.id) }}
        onBlur={() => onHoverChange(null)} onPointerLeave={() => onHoverChange(null)}
        onPointerDown={event => { if (event.pointerType !== 'mouse') onHoverChange(hotspot.id) }}
        onPointerUp={event => { if (event.pointerType !== 'mouse') onHoverChange(null) }}
        onPointerCancel={() => onHoverChange(null)} onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') onHoverChange(hotspot.id)
          if (event.key === 'Escape') { onHoverChange(null); event.currentTarget.blur() }
        }}>
        <span className="hotspot-marker__ring" aria-hidden="true"><span /></span>
        <span id={describedBy} className="sr-only">{hotspot.description}</span>
      </button>
    </foreignObject>
  )
}
