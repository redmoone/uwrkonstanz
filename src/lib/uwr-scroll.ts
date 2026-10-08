type ScrollMetrics = { scrollTop: number; scrollHeight: number; clientHeight: number }

// Keep a complete swipe native while there is text to read in its direction.
export function canScrollVertically(metrics: ScrollMetrics, deltaY: number): boolean {
  const maximum = Math.max(0, metrics.scrollHeight - metrics.clientHeight)
  if (maximum <= 1 || deltaY === 0) return false
  // Safari can report positions outside the range during rubber-band scrolling.
  const position = Math.max(0, Math.min(maximum, metrics.scrollTop))
  return deltaY > 0 ? maximum - position > 1 : position > 1
}
