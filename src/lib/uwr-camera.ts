import type { Camera, StoryHotspot } from './uwr-stage'

export type PhotoBounds = { left: number; right: number; top: number; bottom: number }

// Fit every tap target into the phone's visible crop, including its physical size.
export function fitHotspotCamera(target: Camera, points: Pick<StoryHotspot, 'x' | 'y'>[], bounds: PhotoBounds,
  baseScale: number, image: { width: number; height: number }): Camera {
  if (!points.length) return target
  const margin = 24 / Math.max(.01, baseScale)
  const minX = Math.min(...points.map(point => point.x)), maxX = Math.max(...points.map(point => point.x))
  const minY = Math.min(...points.map(point => point.y)), maxY = Math.max(...points.map(point => point.y))
  const zoom = Math.max(1, Math.min(target.zoom,
    (bounds.right - bounds.left - 2 * margin) / Math.max(1, maxX - minX),
    (bounds.bottom - bounds.top - 2 * margin) / Math.max(1, maxY - minY)))
  const clampAxis = (desired: number, start: number, end: number, min: number, max: number, extent: number) =>
    Math.min(end - margin - max * zoom, start,
      Math.max(end - extent * zoom, start + margin - min * zoom, desired))
  return { zoom, x: clampAxis(target.x, bounds.left, bounds.right, minX, maxX, image.width),
    y: clampAxis(target.y, bounds.top, bounds.bottom, minY, maxY, image.height) }
}
