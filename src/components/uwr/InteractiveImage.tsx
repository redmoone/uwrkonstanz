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
  mobileCamera?: Camera
  cameraFocusId?: string
  animateCamera: boolean
  onHoverChange: (id: string | null) => void
}
const restingCamera: Camera = { x: 0, y: 0, zoom: 1 }
// Smoothstep opacity at each photo edge; the entire interior stays opaque.
const edgeOpacity = [0, .15625, .5, .84375, 1]
const edgeStops = (width: number) => [
  ...edgeOpacity.map((opacity, index) => ({ offset: `${index * width / 4}%`, opacity })),
  ...edgeOpacity.map((opacity, index) => ({ offset: `${100 - index * width / 4}%`, opacity })).reverse(),
]

export function InteractiveImage({ image, hotspots, activeId, camera: target, mobileCamera, cameraFocusId, animateCamera, onHoverChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const currentCamera = useRef(restingCamera)
  const [camera, setCamera] = useState(restingCamera)
  const [baseScale, setBaseScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [visibleFrame, setVisibleFrame] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null)
  const [trace, setTrace] = useState(DEBUG_HOTSPOTS)
  const [tracePoint, setTracePoint] = useState<{ x: number; y: number } | null>(null)
  const imageId = `story-image-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const scale = Math.max(.01, baseScale * camera.zoom)

  useEffect(() => {
    setTrace(DEBUG_HOTSPOTS || new URLSearchParams(window.location.search).get('trace') === '1')
    const svg = svgRef.current
    if (!svg) return
    const update = () => {
      const matrix = svg.getScreenCTM()
      setBaseScale(matrix?.a || 1)
      setIsMobile(window.matchMedia('(max-width: 767px)').matches)
      if (!matrix) return
      const rect = svg.getBoundingClientRect()
      const frame = svg.parentElement?.getBoundingClientRect() ?? rect
      // The phone clips the 150%-wide SVG: constrain the focused markers to
      // the actual visible photo rather than the offscreen SVG edges.
      setVisibleFrame({
        left: (Math.max(rect.left, frame.left) - matrix.e) / matrix.a,
        right: (Math.min(rect.right, frame.right) - matrix.e) / matrix.a,
        top: (Math.max(rect.top, frame.top) - matrix.f) / matrix.d,
        bottom: (Math.min(rect.bottom, frame.bottom) - matrix.f) / matrix.d,
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const targetCamera = isMobile && mobileCamera ? mobileCamera : target
    const focused = isMobile && cameraFocusId
      ? hotspots.filter(point => isHotspotActive(point, cameraFocusId)) : hotspots
    const points = focused.length ? focused : hotspots
    const margin = 24 / Math.max(.01, baseScale)
    const minX = Math.min(...points.map(point => point.x))
    const maxX = Math.max(...points.map(point => point.x))
    const minY = Math.min(...points.map(point => point.y))
    const maxY = Math.max(...points.map(point => point.y))
    const viewBounds = isMobile && visibleFrame ? visibleFrame : { left: 0, right: image.width, top: 0, bottom: image.height }
    const destination = animateCamera ? {
      zoom: targetCamera.zoom,
      x: Math.min(0, viewBounds.right - margin - maxX * targetCamera.zoom,
        Math.max(image.width * (1 - targetCamera.zoom), viewBounds.left + margin - minX * targetCamera.zoom, targetCamera.x)),
      y: Math.min(0, viewBounds.bottom - margin - maxY * targetCamera.zoom,
        Math.max(image.height * (1 - targetCamera.zoom), viewBounds.top + margin - minY * targetCamera.zoom, targetCamera.y)),
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
  }, [target, mobileCamera, cameraFocusId, isMobile, visibleFrame, animateCamera, baseScale, hotspots, image.width, image.height])

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
      <defs>
        <linearGradient id={`${imageId}-edge-x`} x1="0%" x2="100%" y1="0%" y2="0%">
          {edgeStops(6).map(stop => <stop key={stop.offset} offset={stop.offset}
            stopColor="#fff" stopOpacity={stop.opacity} />)}
        </linearGradient>
        <linearGradient id={`${imageId}-edge-y`} x1="0%" x2="0%" y1="0%" y2="100%">
          {edgeStops(3).map(stop => <stop key={stop.offset} offset={stop.offset}
            stopColor="#fff" stopOpacity={stop.opacity} />)}
        </linearGradient>
        <mask id={`${imageId}-vertical-fade`} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
          x="0" y="0" width={image.width} height={image.height} style={{ maskType: 'alpha' }}>
          <rect x="0" y="0" width={image.width} height={image.height} fill={`url(#${imageId}-edge-y)`} />
        </mask>
        <mask id={`${imageId}-photo-fade`} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
          x="0" y="0" width={image.width} height={image.height} style={{ maskType: 'alpha' }}>
          <rect x="0" y="0" width={image.width} height={image.height} fill={`url(#${imageId}-edge-x)`}
            mask={`url(#${imageId}-vertical-fade)`} />
        </mask>
      </defs>
      <g ref={cameraRef} data-camera="" transform={`matrix(${camera.zoom} 0 0 ${camera.zoom} ${camera.x} ${camera.y})`}>
        <image href={image.src} x="0" y="0" width={image.width} height={image.height}
          preserveAspectRatio="none" mask={`url(#${imageId}-photo-fade)`} role="img" aria-label={image.alt} />
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
