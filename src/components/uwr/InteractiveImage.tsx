'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { HotspotMarker } from './HotspotMarker'
import { OutlineOverlay } from './OutlineOverlay'
import { DEBUG_HOTSPOTS } from '@/lib/uwr-hotspots'
import type { StoryHotspot, StoryImageAsset } from '@/lib/uwr-story'

type Props = {
  image: StoryImageAsset
  hotspots?: StoryHotspot[]
  activeId: string | null
  onHoverChange: (id: string | null) => void
  caption: string
  fullscreen?: boolean
}

export function InteractiveImage({ image, hotspots = [], activeId, onHoverChange, caption, fullscreen }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  const imageId = `story-image-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const active = hotspots.find(point => point.id === activeId)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    // With `slice`, HEIGHT can determine scale. Use the actual SVG matrix.
    const update = () => setScale(svg.getScreenCTM()?.a || 1)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [image.width, fullscreen])

  return (
    <figure className={`interactive-image${fullscreen ? ' interactive-image--stage' : ''}`}>
      <div className="interactive-image__canvas" onMouseLeave={() => onHoverChange(null)}>
        <svg ref={svgRef} className="interactive-image__svg" viewBox={`0 0 ${image.width} ${image.height}`}
          preserveAspectRatio={fullscreen ? 'xMidYMid slice' : 'xMidYMid meet'} role="group" aria-labelledby={`${imageId}-title`}>
          <title id={`${imageId}-title`}>{image.alt}</title>
          <image href={image.src} x="0" y="0" width={image.width} height={image.height}
            preserveAspectRatio="none" role="img" aria-label={image.alt} />
          <OutlineOverlay hotspots={hotspots} activeId={activeId} />
          {hotspots.map(point => <HotspotMarker key={point.id} hotspot={point} scale={scale}
            active={point.id === activeId} onHoverChange={onHoverChange} describedBy={`${imageId}-${point.id}`} />)}
          {DEBUG_HOTSPOTS && <g className="hotspot-debug" aria-hidden="true" style={{ fontSize: `${12 / scale}px` }}>
            <rect x="1" y="1" width={image.width - 2} height={image.height - 2} fill="none" stroke="var(--cyan)" vectorEffect="non-scaling-stroke" />
            <text x={12 / scale} y={24 / scale}>viewBox: 0 0 {image.width} {image.height}</text>
            {hotspots.map(point => <text key={point.id} x={point.x + 28 / scale} y={point.y - 20 / scale}>
              {point.id}: {point.x}, {point.y}
            </text>)}
          </g>}
        </svg>
      </div>
      <figcaption className="interactive-image__caption">
        {active ? <><strong>{active.label}</strong><span>{active.description}</span></> : <span>{caption}</span>}
      </figcaption>
    </figure>
  )
}
