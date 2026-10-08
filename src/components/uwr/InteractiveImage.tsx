'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { HotspotMarker } from './HotspotMarker'
import { OutlineOverlay } from './OutlineOverlay'
import { DEBUG_HOTSPOTS } from '@/lib/uwr-hotspots'
import { isHotspotActive, type Camera, type StoryHotspot } from '@/lib/uwr-stage'

type Props = {
  image: { src: string; width: number; height: number; alt: string }
  hotspots: StoryHotspot[]
  activeId: string | null
  camera: Camera
  animateCamera: boolean
  onHoverChange: (id: string | null) => void
}
const restingCamera: Camera = { x: 0, y: 0, zoom: 1 }

export function InteractiveImage({ image, hotspots, activeId, camera: target, animateCamera, onHoverChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const currentCamera = useRef(restingCamera)
  const [camera, setCamera] = useState(restingCamera)
  const [baseScale, setBaseScale] = useState(1)
  const [trace, setTrace] = useState(DEBUG_HOTSPOTS)
  const [tracePoint, setTracePoint] = useState<{ x: number; y: number } | null>(null)
  const imageId = `story-image-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const scale = Math.max(.01, baseScale * camera.zoom)

  useEffect(() => {
    setTrace(DEBUG_HOTSPOTS || new URLSearchParams(window.location.search).get('trace') === '1')
    const svg = svgRef.current
    if (!svg) return
    const update = () => setBaseScale(svg.getScreenCTM()?.a || 1)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Keep every 44px target inside the photographed viewBox, even while
    // zoomed. Otherwise the high snorkel marker could leave the camera frame.
    const margin = 24 / Math.max(.01, baseScale)
    const minX = Math.min(...hotspots.map(point => point.x))
    const maxX = Math.max(...hotspots.map(point => point.x))
    const minY = Math.min(...hotspots.map(point => point.y))
    const maxY = Math.max(...hotspots.map(point => point.y))
    const destination = animateCamera ? {
      zoom: target.zoom,
      x: Math.min(0, image.width - margin - maxX * target.zoom,
        Math.max(image.width * (1 - target.zoom), margin - minX * target.zoom, target.x)),
      y: Math.min(0, image.height - margin - maxY * target.zoom,
        Math.max(image.height * (1 - target.zoom), margin - minY * target.zoom, target.y)),
    } : restingCamera
    if (!animateCamera || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentCamera.current = destination
      setCamera(destination)
      return
    }
    const origin = currentCamera.current
    let frame = 0
    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 750)
      const ease = progress * progress * (3 - 2 * progress)
      const next = {
        x: origin.x + (destination.x - origin.x) * ease,
        y: origin.y + (destination.y - origin.y) * ease,
        zoom: origin.zoom + (destination.zoom - origin.zoom) * ease,
      }
      currentCamera.current = next
      setCamera(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, animateCamera, baseScale, hotspots, image.width, image.height])

  return <figure className="interactive-image">
    <svg ref={svgRef} className="interactive-image__svg" viewBox={`0 0 ${image.width} ${image.height}`}
      preserveAspectRatio="xMidYMid meet" role="group" aria-labelledby={`${imageId}-title`}
      data-trace={trace} onMouseLeave={() => onHoverChange(null)}
      onClick={event => {
        if (!trace) return
        const matrix = cameraRef.current?.getScreenCTM()
        if (!matrix) return
        // Invert the FULL camera matrix, not just the outer SVG.
        const original = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
        const point = { x: Math.round(original.x * 10) / 10, y: Math.round(original.y * 10) / 10 }
        setTracePoint(point)
        console.info('[UWR trace] original pixels', point)
      }}>
      <title id={`${imageId}-title`}>{image.alt}</title>
      <g ref={cameraRef} data-camera="" transform={`matrix(${camera.zoom} 0 0 ${camera.zoom} ${camera.x} ${camera.y})`}>
        <image href={image.src} x="0" y="0" width={image.width} height={image.height}
          preserveAspectRatio="none" role="img" aria-label={image.alt} />
        <OutlineOverlay hotspots={hotspots} activeId={activeId} trace={trace} scale={scale} />
        {hotspots.map(point => <HotspotMarker key={point.id} hotspot={point} scale={scale}
          active={isHotspotActive(point, activeId)} trace={trace}
          onHoverChange={onHoverChange} describedBy={`${imageId}-${point.id}`} />)}
        {trace && <g className="hotspot-debug" aria-hidden="true" style={{ fontSize: `${11 / scale}px` }}>
          <rect x="1" y="1" width={image.width - 2} height={image.height - 2} fill="none" stroke="var(--cyan)" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: Math.ceil(image.width / 50) - 1 }, (_, index) => (index + 1) * 50).map(x =>
            <g key={x}><path d={`M ${x} 0 V ${image.height}`} stroke="var(--cyan)" strokeOpacity=".18" vectorEffect="non-scaling-stroke" />
              <text x={x + 2 / scale} y={18 / scale}>{x}</text></g>)}
          {Array.from({ length: Math.ceil(image.height / 50) - 1 }, (_, index) => (index + 1) * 50).map(y =>
            <g key={y}><path d={`M 0 ${y} H ${image.width}`} stroke="var(--cyan)" strokeOpacity=".18" vectorEffect="non-scaling-stroke" />
              <text x={5 / scale} y={y - 3 / scale}>{y}</text></g>)}
          {hotspots.map(point => <text key={point.id} x={point.x + 25 / scale} y={point.y - 20 / scale}>
            {point.id}: {point.x}, {point.y}
          </text>)}
          {tracePoint && <g>
            <path d={`M ${tracePoint.x - 7 / scale} ${tracePoint.y} h ${14 / scale} M ${tracePoint.x} ${tracePoint.y - 7 / scale} v ${14 / scale}`}
              fill="none" stroke="var(--cyan)" vectorEffect="non-scaling-stroke" />
            <text x={tracePoint.x + 10 / scale} y={tracePoint.y - 10 / scale}>{tracePoint.x}, {tracePoint.y}</text>
          </g>}
        </g>}
      </g>
    </svg>
    {trace && <figcaption className="traceReadout">viewBox: 0 0 {image.width} {image.height} · Originalpixel
      {tracePoint && ` · Klick: ${tracePoint.x}, ${tracePoint.y}`}
    </figcaption>}
  </figure>
}
