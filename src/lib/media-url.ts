export function getMediaURL(url: string): string {
  if (url.startsWith('/')) return url

  const mediaURL = new URL(url)

  // Payload uploads are served by this app, including after a host change.
  if (mediaURL.pathname.startsWith('/api/media/file/')) {
    return `${mediaURL.pathname}${mediaURL.search}`
  }

  return url
}
