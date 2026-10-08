import type { StoryHotspot } from '@/lib/uwr-stage'

type Props = { hotspot: StoryHotspot; scale: number; active: boolean; expanded: boolean; trace: boolean; onHoverChange: (id: string | null) => void; onActivate: (id: string) => void; describedBy: string }

export function HotspotMarker({ hotspot, scale, active, expanded, trace, onHoverChange, onActivate, describedBy }: Props) {
  const size = 44 / scale
  return (
    <foreignObject x={hotspot.x - size / 2} y={hotspot.y - size / 2} width={size} height={size} style={{ pointerEvents: 'none' }}>
      <button className="hotspot-marker" type="button" data-hotspot-id={hotspot.id} data-active={active || trace}
        style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top left' }}
        aria-label={`${hotspot.label}: Erklärung öffnen`} aria-haspopup="dialog" aria-expanded={expanded} aria-describedby={describedBy}
        onPointerEnter={event => { if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 768px)').matches) onHoverChange(hotspot.id) }}
        onPointerLeave={event => { if (event.pointerType === 'mouse') onHoverChange(null) }}
        onFocus={event => { if (event.currentTarget.matches(':focus-visible') && window.matchMedia('(min-width: 768px)').matches) onHoverChange(hotspot.id) }}
        onBlur={() => onHoverChange(null)} onClick={() => onActivate(hotspot.id)}
        onKeyDown={event => { if (event.key === 'Escape') { onHoverChange(null); event.currentTarget.blur() } }}>
        <span className="hotspot-marker__ring" aria-hidden="true"><span /></span>
        <span id={describedBy} className="sr-only">{hotspot.description}</span>
      </button>
    </foreignObject>
  )
}
